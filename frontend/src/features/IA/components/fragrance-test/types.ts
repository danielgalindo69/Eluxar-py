export interface TestState {
  question: string;
  options: string[];
  history: object[];
  step: number;
  finished: boolean;
  totalSteps: number;
  response: string;
}

export type Phase = "idle" | "question" | "loading" | "result";
