"use client";

import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";

type SnippetEditorProps = {
  value: string;
  language: string;
  onChange: (value: string) => void;
};

function languageExtension(language: string) {
  const normalized = language.toLowerCase();
  if (normalized === "javascript" || normalized === "typescript") {
    return javascript({ typescript: normalized === "typescript" });
  }

  // Fallback keeps editor functional for unsupported language packs.
  return javascript({ typescript: true });
}

export function SnippetEditor({ value, language, onChange }: SnippetEditorProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700/90 bg-[#090f1b]">
      <CodeMirror
        value={value}
        height="320px"
        theme="dark"
        basicSetup={{
          lineNumbers: true,
          bracketMatching: true,
          autocompletion: true,
        }}
        extensions={[languageExtension(language)]}
        onChange={(nextValue) => onChange(nextValue)}
      />
    </div>
  );
}
