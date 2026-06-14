import type { ContestProblemItem } from "@/lib/api/contest-types";
import type { Submission, SubmissionResult } from "@/lib/api/submission-types";

function parseScore(score?: string | null): number {
  if (!score?.trim()) return 0;
  const value = Number.parseFloat(score);
  return Number.isFinite(value) ? value : 0;
}

function pickBetterSubmission(current: Submission, candidate: Submission): Submission {
  const currentScore = parseScore(current.score);
  const candidateScore = parseScore(candidate.score);
  if (candidateScore > currentScore) return candidate;
  if (candidateScore < currentScore) return current;

  const currentTime = current.createdAt ? new Date(current.createdAt).getTime() : 0;
  const candidateTime = candidate.createdAt ? new Date(candidate.createdAt).getTime() : 0;
  return candidateTime > currentTime ? candidate : current;
}

function buildBestSubmissionMap(submissions: Submission[]): Map<string, Submission> {
  const bestByProblem = new Map<string, Submission>();

  for (const submission of submissions) {
    if (!submission.problemId) continue;
    const existing = bestByProblem.get(submission.problemId);
    bestByProblem.set(
      submission.problemId,
      existing ? pickBetterSubmission(existing, submission) : submission,
    );
  }

  return bestByProblem;
}

export function mergeProblemsWithSubmissions(
  problems: ContestProblemItem[],
  submissions: Submission[],
): ContestProblemItem[] {
  const bestByProblem = buildBestSubmissionMap(submissions);

  return problems.map((problem) => {
    const best = bestByProblem.get(problem.problemId);
    if (!best) {
      return {
        ...problem,
        bestScore: null,
        bestResult: null,
      };
    }

    return {
      ...problem,
      bestScore: best.score ?? null,
      bestResult: (best.result as SubmissionResult | undefined) ?? null,
    };
  });
}
