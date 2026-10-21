import { AcademicLevel, Subject, SolverResult, StudyDeck, StudyNote, WritingResult } from '../types';

const SOLVE_LIMIT_KEY_PREFIX = 'brewly_solve_count_';
const PRO_STATUS_KEY = 'brewly_pro_active';

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

export function isProUser(): boolean {
  try {
    return localStorage.getItem(PRO_STATUS_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setProStatus(active: boolean) {
  try {
    localStorage.setItem(PRO_STATUS_KEY, active ? 'true' : 'false');
  } catch {}
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
  const isPro = isProUser();
  const todayCount = getSolveCountToday();

  if (!isPro && todayCount >= 5) {
    const error: any = new Error('Daily solve limit reached (5/5). Upgrade to Brewly Pro for unlimited solutions.');
    error.isQuotaLimit = true;
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

  if (!isPro) {
    incrementSolveCount();
  }

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

  return response.json();
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

  return response.json();
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

  return response.json();
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

  return response.json();
}
