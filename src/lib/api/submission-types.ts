export type SubmissionResult = "AC" | "WA" | "TLE" | "MLE";

export interface SubmissionRequest {
  problemId: string;
  language: string;
  solution: string;
  score?: string;
  contestId?: number;
  contestPassword?: string;
}

export interface Submission {
  id: string;
  problemId: string;
  contestId?: number | null;
  language: string;
  solution?: string;
  score?: string;
  result?: SubmissionResult;
  timeUsed?: number;
  memoryUsed?: number;
  judgeMessage?: string;
  createdAt?: string;
  createdBy?: string;
}
