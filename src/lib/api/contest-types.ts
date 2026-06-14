import type { SpringPage } from "@/lib/api/problem-types";
import type { ContestStatus } from "@/lib/contest/status";

export interface ContestCreator {
  id: string;
  username: string;
  fullName?: string | null;
}

export interface ContestProblemItem {
  problemId: string;
  problemTitle?: string;
  sortIndex: number;
  bestScore?: string | null;
  bestResult?: string | null;
}

export interface Contest {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  passwordProtected: boolean;
  visible: boolean;
  status?: ContestStatus | "UPCOMING" | "ONGOING" | "FINISHED" | null;
  createTime?: string | null;
  lastUpdateTime?: string | null;
  createdBy?: ContestCreator | null;
  problems?: ContestProblemItem[] | null;
}

export interface ContestJoinResult {
  accessGranted: boolean;
  status?: ContestStatus | "UPCOMING" | "ONGOING" | "FINISHED" | null;
  contest?: Contest | null;
  problems?: ContestProblemItem[] | null;
}

export interface ContestProblemScore {
  problemId: string;
  problemTitle?: string;
  sortIndex: number;
  bestScore?: string | null;
  bestResult?: string | null;
}

export interface ContestScore {
  contestId: number;
  contestTitle: string;
  status?: ContestStatus | "UPCOMING" | "ONGOING" | "FINISHED" | null;
  totalScore: number;
  solvedCount: number;
  totalProblems: number;
  problemScores?: ContestProblemScore[] | null;
}

export interface ContestParticipant {
  userId: string;
  username: string;
  fullName?: string | null;
  totalScore: number;
  solvedCount: number;
  totalProblems: number;
  submissionCount: number;
}

export interface ContestProblemPayload {
  problemId: string;
  sortIndex?: number;
}

export interface ContestCreatePayload {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  password?: string;
  visible: boolean;
  problems?: ContestProblemPayload[];
}

export type ContestPage = SpringPage<Contest>;
