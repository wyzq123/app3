
export enum IELTSTaskType {
  WritingTask1 = 'Writing Task 1',
  WritingTask2 = 'Writing Task 2',
}

export interface WritingFeedback {
  bandScore: number;
  taskResponse: { score: number; comment: string };
  coherenceCohesion: { score: number; comment: string };
  lexicalResource: { score: number; comment: string };
  grammaticalRange: { score: number; comment: string };
  correctedVersion: string;
  generalAdvice: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface ReadingQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // Index 0-3
}

export interface ReadingPractice {
  title: string;
  passage: string;
  questions: ReadingQuestion[];
}

export enum LoadingState {
  Idle = 'idle',
  Loading = 'loading',
  Success = 'success',
  Error = 'error',
}

// --- AI Configuration Types ---

export type AIProviderId = 'google' | 'openai' | 'deepseek' | 'qwen' | 'grok' | 'doubao';

export interface AIProviderConfig {
  id: AIProviderId;
  name: string;
  defaultModel: string;
  endpoint?: string; // For OpenAI compatible APIs
  needsCorsProxy?: boolean; // Some browser calls might fail without this
}

export interface UserSettings {
  provider: AIProviderId;
  apiKey: string;
  model: string;
  customEndpoint?: string; // Allow user to override endpoint
}

export interface IChatSession {
  sendMessage: (text: string) => Promise<string>;
}
