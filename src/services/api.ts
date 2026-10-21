import { AcademicLevel, Subject, SolverResult, StudyDeck, StudyNote, WritingResult, DoubtExplanation } from '../types';

export const INITIAL_FREE_TOKEN_GRANT = 10000;
const TOKEN_KEY = 'brewly_free_tokens_remaining';
const SOLVE_LIMIT_KEY_PREFIX = 'brewly_solve_count_';

export function getTokensRemaining(): number {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (raw === null) {
      localStorage.setItem(TOKEN_KEY, INITIAL_FREE_TOKEN_GRANT.toString());
      return INITIAL_FREE_TOKEN_GRANT;
    }
    const val = parseInt(raw, 10);
    return isNaN(val) ? INITIAL_FREE_TOKEN_GRANT : val;
  } catch {
    return INITIAL_FREE_TOKEN_GRANT;
  }
}

export function deductTokens(amount: number): number {
  const current = getTokensRemaining();
  const next = Math.max(0, current - amount);
  try {
    localStorage.setItem(TOKEN_KEY, next.toString());
    window.dispatchEvent(new CustomEvent('brewly-tokens-updated', { detail: { remaining: next, deducted: amount } }));
  } catch {}
  return next;
}

export function refillFreeTokens(amount: number = INITIAL_FREE_TOKEN_GRANT): number {
  try {
    localStorage.setItem(TOKEN_KEY, amount.toString());
    window.dispatchEvent(new CustomEvent('brewly-tokens-updated', { detail: { remaining: amount, refilled: true } }));
  } catch {}
  return amount;
}

export function getTodayKey(): string {
  const d = new Date();
  return `${SOLVE_LIMIT_KEY_PREFIX}${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getSolveCountToday(): number {
  try {
    const raw = localStorage.getItem(getTodayKey());
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

export function incrementSolveCount(): number {
  const current = getSolveCountToday();
  const next = current + 1;
  try {
    localStorage.setItem(getTodayKey(), next.toString());
  } catch {}
  return next;
}

// All users have 100% free unlocked access
export function isProUser(): boolean {
  return true;
}

export async function solveProblem(params: {
  prompt: string;
  imageBase64?: string;
  mimeType?: string;
  subject: Subject;
  level: AcademicLevel;
  mode?: 'normal' | 'simpler' | 'alternative';
  previousSolution?: any;
}): Promise<SolverResult> {
  const remaining = getTokensRemaining();
  if (remaining <= 0) {
    const error: any = new Error('You have utilized your test token allocation. Tap Refill to add 10,000 more free tokens instantly.');
    error.isTokenDepleted = true;
    throw error;
  }

  const response = await fetch('/api/solve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to solve problem: ${response.statusText}`);
  }

  const data = await response.json();
  const tokensConsumed = data.tokens_used || Math.max(140, Math.round((params.prompt.length + 500) / 4));
  deductTokens(tokensConsumed);
  incrementSolveCount();

  const result: SolverResult = {
    id: 'solve_' + Date.now(),
    timestamp: Date.now(),
    subject: params.subject,
    level: params.level,
    prompt: params.prompt,
    imagePreview: params.imageBase64,
    summary: data.summary || `Step-by-step ${params.subject} solution`,
    steps: data.steps || [],
    final_answer: data.final_answer || 'Solution calculated.',
    confidence: data.confidence || 'High',
    key_takeaway: data.key_takeaway,
  };

  return result;
}

export async function verifySolution(params: {
  problem: string;
  proposed_solution: any;
  final_answer: string;
  subject: Subject;
  level: AcademicLevel;
}): Promise<{ verified: boolean; verified_answer: string; discrepancy_note: string }> {
  const response = await fetch('/api/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Verification request failed');
  }

  const data = await response.json();
  deductTokens(80);
  return data;
}

export async function analyzeDocument(params: {
  text?: string;
  fileBase64?: string;
  mimeType?: string;
  question?: string;
}) {
  const response = await fetch('/api/smart-reader', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Document processing failed');
  }

  const data = await response.json();
  deductTokens(params.question ? 120 : 280);
  return data;
}

export async function processNotes(params: {
  audioBase64?: string;
  mimeType?: string;
  transcriptText?: string;
  subject?: string;
}): Promise<StudyNote> {
  const response = await fetch('/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Notes transcription failed');
  }

  const data = await response.json();
  deductTokens(220);

  return {
    id: 'note_' + Date.now(),
    title: data.title || 'Lecture Note',
    subject: params.subject || 'General',
    timestamp: Date.now(),
    transcript: data.transcript || '',
    summary: data.summary || '',
    takeaways: data.takeaways || [],
    study_questions: data.study_questions || [],
  };
}

export async function generateFlashcardsAndQuiz(params: {
  content: string;
  title?: string;
  subject?: string;
}): Promise<StudyDeck> {
  const response = await fetch('/api/flashcards-quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Deck generation failed');
  }

  const data = await response.json();
  deductTokens(260);

  return {
    id: 'deck_' + Date.now(),
    title: data.deck_title || params.title || 'Study Deck',
    subject: params.subject || 'General',
    timestamp: Date.now(),
    flashcards: data.flashcards || [],
    quiz: data.quiz || [],
  };
}

export async function generateWritingHelp(params: {
  task: 'outline' | 'draft' | 'grammar';
  topic?: string;
  text?: string;
  style?: string;
}): Promise<WritingResult> {
  const response = await fetch('/api/writing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Writing assistant failed');
  }

  const data = await response.json();
  deductTokens(190);
  return data;
}

export async function sendChatMessage(params: {
  messages: { role: string; content: string }[];
  level: AcademicLevel;
  subject: string;
}): Promise<{ reply: string; follow_ups: string[] }> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Chat message failed');
  }

  const data = await response.json();
  deductTokens(110);

  return data;
}

export async function explainDoubt(params: {
  doubt: string;
  mode: 'tea' | 'professional';
  subject?: string;
}): Promise<DoubtExplanation> {
  const response = await fetch('/api/doubt-lounge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to explain doubt');
  }

  const data = await response.json();
  const tokensUsed = data.tokens_used || (params.mode === 'tea' ? 180 : 160);
  deductTokens(tokensUsed);

  return data;
}
