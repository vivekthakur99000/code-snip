import "server-only";

import { getSingletonHighlighter, type BundledLanguage, type BundledTheme } from "shiki";

const SUPPORTED_LANGUAGES = [
  "typescript",
  "javascript",
  "python",
  "go",
  "rust",
  "sql",
  "bash",
  "json",
] as const;

const DEFAULT_LANGUAGE: BundledLanguage = "typescript";
const DEFAULT_THEME: BundledTheme = "github-dark";

let highlighterPromise: ReturnType<typeof getSingletonHighlighter> | null = null;

function getHighlighter() {
  highlighterPromise ??= getSingletonHighlighter({
      themes: ["github-dark", "github-light"],
      langs: [...SUPPORTED_LANGUAGES],
    });

  return highlighterPromise;
}

export function resolveSnippetLanguage(language: string): BundledLanguage {
  if (SUPPORTED_LANGUAGES.includes(language as (typeof SUPPORTED_LANGUAGES)[number])) {
    return language as BundledLanguage;
  }

  return DEFAULT_LANGUAGE;
}

export async function highlightSnippetCode(
  code: string,
  language: string,
  theme: BundledTheme = DEFAULT_THEME,
) {
  const highlighter = await getHighlighter();

  return highlighter.codeToHtml(code, {
    lang: resolveSnippetLanguage(language),
    theme,
  });
}
