export type AcademicLevel = 'Middle school' | 'High school' | 'College' | 'Graduate';

export type Subject = 'Math' | 'Physics' | 'Chemistry' | 'Biology' | 'Economics' | 'Essay';

export interface SolverStep {
  step_number: number;
  title: string;
  explanation: string;
}

export interface SolverResult {
  id: string;
  timestamp: number;
  subject: Subject;
  level: AcademicLevel;
  prompt: string;
  imagePreview?: string;
  summary: string;
  steps: SolverStep[];
  final_answer: string;
  confidence?: string;
  key_takeaway?: string;
  verification?: {
    verified: boolean;
    verified_answer: string;
    discrepancy_note: string;
    checked: boolean;
  };
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface StudyDeck {
  id: string;
  title: string;
  subject: string;
  timestamp: number;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
}

export interface StudyNote {
  id: string;
  title: string;
  subject: string;
  timestamp: number;
  transcript: string;
  summary: string;
  takeaways: string[];
  study_questions?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  follow_ups?: string[];
}

export interface WritingSection {
  heading: string;
  summary: string;
  tips?: string;
}

export interface WritingSuggestion {
  original: string;
  revised: string;
  rationale: string;
}

export interface WritingResult {
  task: 'outline' | 'draft' | 'grammar';
  thesis_or_title: string;
  sections?: WritingSection[];
  polished_text?: string;
  suggestions?: WritingSuggestion[];
}

export interface WhiteboardItem {
  step: number;
  kind: 'heading' | 'formula' | 'box' | 'arrow' | 'doodle_note' | 'highlight' | string;
  title: string;
  text: string;
  sketch_symbol?: string;
  color?: string;
}

export interface DoubtExplanation {
  mode: 'tea' | 'professional';
  teaching_speech: string;
  verdict_badge: string;
  verdict_summary: string;
  whiteboard_title: string;
  whiteboard_items: WhiteboardItem[];
}

export type ActiveTab =
  | 'solver'
  | 'reader'
  | 'notes'
  | 'flashcards'
  | 'tutor'
  | 'doubt'
  | 'writing'
  | 'focus'
  | 'calculator'
  | 'history'
  | 'pricing';
