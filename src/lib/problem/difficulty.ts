const DIFFICULTY_LABELS: Record<number, string> = {
  1: "Dễ",
  2: "Trung bình",
  3: "Khó",
};

export function getDifficultyLabel(difficulty?: number | null): string {
  if (!difficulty) return "—";
  return DIFFICULTY_LABELS[difficulty] ?? `Level ${difficulty}`;
}

export const DIFFICULTY_OPTIONS = [
  { value: 0, label: "Độ khó" },
  { value: 1, label: "Dễ" },
  { value: 2, label: "Trung bình" },
  { value: 3, label: "Khó" },
] as const;
