import type { ConvMode, ErrorType, ExamType } from "@prisma/client";

// ─── Chat Types ─────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  corrections?: Correction[];
}

export interface Correction {
  original: string;
  correction: string;
  explanation: string;
  type?: ErrorType;
}

export interface ChatStreamRequest {
  messages: ChatMessage[];
  mode: ConvMode;
  grammarFocus?: string;
  conversationId?: string;
}

// ─── Diary Types ────────────────────────────────────────────────────────────

export interface DiaryFeedback {
  correctedText: string;
  estimatedLevel: string;
  overallScore: number;
  errors: DiaryError[];
  vocabularyUpgrades: VocabularyUpgrade[];
  positiveFeedback: string;
  c1Rewrite: string;
}

export interface DiaryError {
  original: string;
  correction: string;
  explanation: string;
  type: string;
}

export interface VocabularyUpgrade {
  basic: string;
  advanced: string;
  context: string;
}

// ─── Exam Types ─────────────────────────────────────────────────────────────

export interface ExamQuestion {
  id: number;
  text: string;
  options?: string[];
  answer?: string;
  userAnswer?: string;
}

export interface ExamExercise {
  type: ExamType;
  part: string;
  title: string;
  instructions: string;
  passage?: string;
  questions: ExamQuestion[];
}

export interface ExamResult {
  score: number;
  maxScore: number;
  percentage: number;
  band: string;
  feedback: string;
  corrections: Array<{
    questionId: number;
    correct: string;
    userAnswer: string;
    explanation: string;
  }>;
}

// ─── Progress Types ─────────────────────────────────────────────────────────

export interface WeeklyStats {
  days: Array<{
    date: string;
    minutesPracticed: number;
    wordsProduced: number;
    speakingMinutes: number;
    speakingSessions: number;
  }>;
  totalMinutes: number;
  totalWords: number;
  totalSpeakingMinutes: number;
  totalSpeakingSessions: number;
}

export interface LevelPrediction {
  currentLevel: string;
  targetLevel: string;
  estimatedWeeks: number;
  confidence: "low" | "medium" | "high";
}

// ─── Vocabulary Types ───────────────────────────────────────────────────────

export interface SM2Result {
  interval: number;
  easeFactor: number;
  repetitions: number;
}

export type VocabQuizMode =
  | "definition-to-word"
  | "word-to-definition"
  | "fill-the-gap";
