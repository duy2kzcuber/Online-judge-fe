export const LANGUAGE_LABELS: Record<string, string> = {
  cpp: "C++",
  "c++": "C++",
};

export const DEFAULT_LANGUAGES = ["cpp"];

export const CODE_TEMPLATES: Record<string, string> = {
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

export function getCodeTemplate(language: string): string {
  const key = language.trim().toLowerCase();
  return CODE_TEMPLATES[key] ?? "";
}

/** Monaco Editor language id */
const MONACO_LANGUAGE_MAP: Record<string, string> = {
  cpp: "cpp",
  "c++": "cpp",
};

export function getMonacoLanguage(language: string): string {
  return MONACO_LANGUAGE_MAP[language.trim().toLowerCase()] ?? "cpp";
}

export function getSourceFileName(language: string): string {
  const key = language.trim().toLowerCase();
  if (key === "cpp" || key === "c++") return "Main.cpp";
  return "main.txt";
}
