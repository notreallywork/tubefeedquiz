// Game State Types
export type ScreenType = 'attract' | 'profile' | 'question' | 'reveal' | 'results' | 'leaderboard';

export type Profession = 'doctor' | 'dietitian' | 'nurse' | 'pharmacist' | 'other';
export type Experience = '<2' | '2-5' | '5-10' | '10-20' | '20+';

export type QuestionType = 'single' | 'multi' | 'drag_anatomy' | 'speed' | 'sequence';
export type QuestionTheme = 'timing' | 'access' | 'tolerance' | 'safety' | 'transition';

export interface PlayerProfile {
  profession: Profession | null;
  experience: Experience | null;
  institution: string;
}

export interface Option {
  id: string;
  text: string;
  score: number;
  correct: boolean;
  rationale?: string;
}

export interface DragItem {
  id: string;
  name: string;
  correct: boolean;
  zone: string;
}

export interface SequenceItem {
  id: string;
  text: string;
  order: number;
}

export interface QuestionContext {
  patient: string;
  details: string[];
  visual?: string;
}

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  theme: QuestionTheme;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  context: QuestionContext;
  optimalAnswer: string;
  learningPoint: string;
  shockStat: string;
  resource: string;
  professionSplit: Record<Profession, number>;
}

export interface SingleQuestion extends BaseQuestion {
  type: 'single' | 'speed';
  options: Option[];
  timeLimit?: number;
}

export interface MultiQuestion extends BaseQuestion {
  type: 'multi';
  options: Option[];
  correctCombination: string[];
}

export interface DragAnatomyQuestion extends BaseQuestion {
  type: 'drag_anatomy';
  items: DragItem[];
}

export interface SequenceQuestion extends BaseQuestion {
  type: 'sequence';
  items: SequenceItem[];
  correctOrder: string[];
}

export type Question = SingleQuestion | MultiQuestion | DragAnatomyQuestion | SequenceQuestion;

export interface Answer {
  questionId: string;
  selected: string | string[];
  confidence: number;
  timeSpent: number;
  score: number;
  timestamp: number;
}

export interface LeaderboardEntry {
  initials: string;
  score: number;
  profession: Profession;
  timestamp: number;
  isCurrentPlayer?: boolean;
}

export interface GameState {
  currentScreen: ScreenType;
  player: PlayerProfile;
  questions: Question[];
  currentQuestionIndex: number;
  questionStartTime: number;
  answers: Answer[];
  totalScore: number;
  sessionStartTime: number;
  playerRank: number | null;
  soundEnabled: boolean;
  autoAdvanceDelay: number;
}
