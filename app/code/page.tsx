"use client";

import { useParams } from "next/navigation";
import { useState, useRef } from "react";
import type { RunResponse } from "@/types";
import Editor from "@monaco-editor/react";
import type { OnMount } from "@monaco-editor/react";
import { ClipLoader } from "react-spinners";
import type * as monaco from "monaco-editor";

const LANGUAGE = "python";

export default function CodingPanel() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<RunResponse | null>(null);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  const handleRunCode = async () => {
    if (isRunning || !editorRef.current) return;
    const currentCode = editorRef.current.getValue();
    if (!currentCode.trim()) {
      setOutput({
        stderr: "No code to run.",
        stdout: null,
        exitCode: 1,
      });
      return;
    }
    setIsRunning(true);
    setOutput(null);

    // TODO: Replace with call once Piston et al. are set up
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setOutput({
      stdout: `[Mock] Executed:\n${currentCode}`,
      stderr: null,
      exitCode: 0,
    });

    setIsRunning(false);
  };

  return (
    <div className="bg-(--background) text-(--foreground) font-sans h-full p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Project {id}</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-(--foreground)/70">
            Language: {LANGUAGE}
          </span>
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="px-5 py-2 text-base font-semibold rounded-lg bg-(--accent) text-white hover:bg-(--accent-hover) disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {isRunning ? "Running..." : "Run Code"}
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 min-h-0 grid grid-cols-2 gap-4">
        {/* Editor */}
        <div className="min-h-0 bg-(--background)/80 border border-white/15 rounded-lg overflow-hidden flex flex-col shadow-sm">
          <Editor
            height="100%"
            language={LANGUAGE}
            theme="vs-dark"
            onMount={handleEditorDidMount}
            defaultValue="# Python code here broski"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              automaticLayout: true,
              readOnly: false,
            }}
          />
        </div>

        {/* Output */}
        <div className="min-h-0 bg-(--background)/80 border border-white/15 rounded-lg p-3 overflow-auto flex flex-col shadow-sm">
          <h2 className="text-lg font-semibold mb-2 shrink-0">Output</h2>

          {isRunning && (
            <div className="flex items-center justify-center flex-1">
              <ClipLoader color="var(--accent)" size={30} />
            </div>
          )}

          {!isRunning && output && (
            <pre className="bg-(--background) rounded-lg p-3 whitespace-pre-wrap wrap-break-word font-mono flex-1 overflow-auto text-(--foreground)/80 text-sm">
              {output.stdout}
              {output.stderr &&
                output.stderr.trim() !== "" &&
                `\n[STDERR]\n${output.stderr}`}
              <div className="mt-3 pt-3 border-t border-(--foreground)/10 text-(--foreground)/50 text-xs">
                Process finished with exit code {output.exitCode}
              </div>
            </pre>
          )}

          {!isRunning && !output && (
            <div className="bg-(--background) rounded-lg p-3 whitespace-pre-wrap wrap-break-word font-mono flex-1 overflow-auto text-(--foreground)/40 text-sm">
              Code output will appear here after running.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
