"use client";

import { getMonacoLanguage } from "@/lib/submission/language";
import Editor from "@monaco-editor/react";
import type { OnMount } from "@monaco-editor/react";

interface MonacoCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  readOnly?: boolean;
  height?: string;
}

export function MonacoCodeEditor({
  value,
  onChange,
  language,
  readOnly = false,
  height = "360px",
}: MonacoCodeEditorProps) {
  const handleMount: OnMount = (editor) => {
    editor.focus();
  };

  return (
    <div className="min-h-[320px] w-full border-y border-[#2d2d2d]">
      <Editor
        height={height}
        language={getMonacoLanguage(language)}
        value={value}
        theme="vs-dark"
        onChange={(next) => onChange(next ?? "")}
        onMount={handleMount}
        loading={
          <div className="flex h-[360px] items-center justify-center bg-[#1e1e1e] text-[14px] text-gray-400">
            Đang tải trình soạn thảo...
          </div>
        }
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          lineHeight: 22,
          fontFamily: "Consolas, 'Courier New', monospace",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          insertSpaces: true,
          wordWrap: "on",
          padding: { top: 12, bottom: 12 },
          renderLineHighlight: "line",
          scrollbar: {
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          },
          contextmenu: true,
          folding: true,
          lineNumbers: "on",
          glyphMargin: false,
        }}
      />
    </div>
  );
}
