export const LANGUAGE_LABELS: Record<string, string> = {
  c: "C",
  cpp: "C++",
  "c++": "C++",
};

export const DEFAULT_LANGUAGES = ["cpp"];

/** Ngôn ngữ được phép khi nộp bài trên trang làm bài tập */
export const PROBLEM_SUBMISSION_LANGUAGES = ["c", "cpp"] as const;

export const CODE_TEMPLATES: Record<string, string> = {
  c: `#include <stdio.h>

int main() {
    return 0;
}
`,
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    return 0;
}
`,
  "c++": `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    return 0;
}
`,
};

export function getLanguageLabel(lang: string): string {
  return LANGUAGE_LABELS[lang.toLowerCase()] ?? lang;
}

export function normalizeLanguages(allowed?: string[] | null): string[] {
  if (!allowed?.length) return DEFAULT_LANGUAGES;
  const seen = new Set<string>();
  const result: string[] = [];
  for (const lang of allowed) {
    const key = lang.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(key);
  }
  return result.length > 0 ? result : DEFAULT_LANGUAGES;
}

function canonicalSubmissionLanguage(lang: string): string | null {
  const key = lang.trim().toLowerCase();
  if (key === "c") return "c";
  if (key === "cpp" || key === "c++") return "cpp";
  return null;
}

export function normalizeSubmissionLanguages(allowed?: string[] | null): string[] {
  const fromProblem = !allowed?.length
    ? [...PROBLEM_SUBMISSION_LANGUAGES]
    : (() => {
        const seen = new Set<string>();
        const result: string[] = [];
        for (const lang of allowed) {
          const canonical = canonicalSubmissionLanguage(lang);
          if (!canonical || seen.has(canonical)) continue;
          seen.add(canonical);
          result.push(canonical);
        }
        return result;
      })();

  const filtered = fromProblem.filter((lang) =>
    PROBLEM_SUBMISSION_LANGUAGES.includes(
      lang as (typeof PROBLEM_SUBMISSION_LANGUAGES)[number],
    ),
  );

  return filtered.length > 0 ? filtered : [...PROBLEM_SUBMISSION_LANGUAGES];
}

export function getCodeTemplate(language: string): string {
  const key = language.trim().toLowerCase();
  return CODE_TEMPLATES[key] ?? "";
}

/** Monaco Editor language id */
const MONACO_LANGUAGE_MAP: Record<string, string> = {
  c: "c",
  cpp: "cpp",
  "c++": "cpp",
};

export function getMonacoLanguage(language: string): string {
  return MONACO_LANGUAGE_MAP[language.trim().toLowerCase()] ?? "cpp";
}

export function getSourceFileName(language: string): string {
  const key = language.trim().toLowerCase();
  if (key === "c") return "Main.c";
  if (key === "cpp" || key === "c++") return "Main.cpp";
  return "main.txt";
}
