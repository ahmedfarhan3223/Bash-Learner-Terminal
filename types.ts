import type { ReactNode } from 'react';

export interface Command {
  name: string;
  description: string;
  category: string;
  tags: string[];
  examples: {
    command: string;
    description: string;
  }[];
}

export interface HistoryItem {
  id: number;
  command: string;
  output: ReactNode;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}
