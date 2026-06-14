const JOINED_PREFIX = "oj_contest_joined_";
const PASSWORD_PREFIX = "oj_contest_pw_";

function canUseSessionStorage(): boolean {
  return typeof window !== "undefined";
}

export function isContestJoined(contestId: number): boolean {
  if (!canUseSessionStorage()) return false;
  return sessionStorage.getItem(`${JOINED_PREFIX}${contestId}`) === "1";
}

export function markContestJoined(contestId: number): void {
  if (!canUseSessionStorage()) return;
  sessionStorage.setItem(`${JOINED_PREFIX}${contestId}`, "1");
}

export function clearContestAccess(contestId: number): void {
  if (!canUseSessionStorage()) return;
  sessionStorage.removeItem(`${JOINED_PREFIX}${contestId}`);
  sessionStorage.removeItem(`${PASSWORD_PREFIX}${contestId}`);
}

export function saveContestPassword(contestId: number, password: string): void {
  if (!canUseSessionStorage()) return;
  sessionStorage.setItem(`${PASSWORD_PREFIX}${contestId}`, password);
}

export function getContestPassword(contestId: number): string | null {
  if (!canUseSessionStorage()) return null;
  return sessionStorage.getItem(`${PASSWORD_PREFIX}${contestId}`);
}
