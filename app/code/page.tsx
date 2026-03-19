"use client";

import { useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {RunResponse, LANGUAGE} from "@/types";
import Editor from "@monaco-editor/react";
import type { OnMount } from "@monaco-editor/react";
import { ClipLoader } from "react-spinners";
import type * as monaco from "monaco-editor";
import Link from "next/link";
import { Problem } from "@/types";

export default function CodingPanel() {
  const searchParams = useSearchParams();
  const id = searchParams?.get("id");
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<RunResponse | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblem = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await fetch(`/api/problems/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        if (!response.ok) {
          console.error("Failed to fetch problem");
        } else {
          const json = await response.json();
          setProblem(json);
        }
      } catch (error) {
        console.error("Error fetching problem:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [id]);

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

    try {
      const response = await fetch("/api/sandbox", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "code": currentCode,
        })
      });
      if (!response.ok) {
        setOutput({ stderr: response.statusText, stdout: null, exitCode: 1 });
      } else {
        const json = await response.json();
        setOutput(json);
      }
    } catch (error) {
      console.log(error);
    }

    setIsRunning(false);
  };

  return (
    <div className="bg-(--background) text-(--foreground) font-sans h-full p-4 flex flex-col gap-4">
      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <ClipLoader color="var(--accent)" size={40} />
        </div>
      ) : !problem ? (
        <div className="text-(--text-muted)">Problem not found.</div>
      ) : (
        <>
          <div className="flex justify-between items-center flex-wrap gap-4 shrink-0">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold">Problem Workspace {id}</h1>
              <ul className="flex items-center space-x-8">
              <li>
                <Link href="/">
                  <span className="dark:hover:text-gray-400 font-semibold">Problems</span>
                </Link>
              </li>
              <li>
                <Link href="/leaderboard">
                  <span className="dark:hover:text-gray-400 font-semibold">Leaderboard</span>
                </Link>
              </li>
              </ul>
            </div>
            <div className="flex items-center gap-8">
              <span className="text-sm text-(--text-muted)">
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

          <div className="flex-1 min-h-0 grid grid-cols-[1.3fr_1fr] gap-4">
            {/* Editor */}
            <div className="min-h-0 bg-panel border border-panel-border rounded-lg overflow-hidden flex flex-col shadow-sm">
              <Editor
                height="100%"
                language={LANGUAGE}
                theme="vs-dark"
                onMount={handleEditorDidMount}
                defaultValue={problem.starterCode}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  automaticLayout: true,
                  readOnly: false,
                }}
              />
            </div>

            {/* Right column */}
            <div className="min-h-0 grid grid-rows-[1fr_0.8fr] gap-4">
              {/* Problem statement */}
              <div className="min-h-0 bg-panel border border-panel-border rounded-lg p-4 overflow-auto flex flex-col shadow-sm">
                <div className="flex items-center gap-2 mb-2 shrink-0">
                  <h2 className="text-xl font-semibold">{problem.title}</h2>
                  <span className="px-2 py-1 text-xs rounded-full border border-panel-border bg-(--panel-muted) text-(--text-muted)">
                    {problem.difficulty}
                  </span>
                </div>

                <div className="space-y-4 text-sm leading-6 text-(--text-muted)">
                  <p>{problem.description}</p>

                  <div>
                    <h3 className="font-semibold mb-2 text-(--foreground)">
                      Examples
                    </h3>
                    <div className="space-y-3">
                      {problem.examples.map((example, index) => (
                        <div
                          key={index}
                          className="rounded-lg border border-panel-border bg-(--panel-muted) p-3"
                        >
                          <p>
                            <span className="font-semibold text-(--foreground)">
                              Input:
                            </span>{" "}
                            <code>{example.input}</code>
                          </p>
                          <p>
                            <span className="font-semibold text-(--foreground)">
                              Output:
                            </span>{" "}
                            <code>{example.output}</code>
                          </p>
                          {example.explanation && (
                            <p>
                              <span className="font-semibold text-(--foreground)">
                                Explanation:
                              </span>{" "}
                              {example.explanation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2 text-(--foreground)">
                      Constraints
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {problem.constraints.map((constraint, index) => (
                        <li key={index}>
                          <code>{constraint}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Output */}
              <div className="min-h-0 bg-panel border border-panel-border rounded-lg p-3 overflow-auto flex flex-col shadow-sm">
                <h2 className="text-lg font-semibold mb-2 shrink-0">Output</h2>

                {isRunning && (
                  <div className="flex items-center justify-center flex-1">
                    <ClipLoader color="var(--accent)" size={30} />
                  </div>
                )}

                {!isRunning && output && (
                  <div className="bg-(--panel-muted) rounded-lg p-3 whitespace-pre-wrap wrap-break-word font-mono flex-1 overflow-auto text-sm text-(--text-muted)">
                    <pre>{output.stdout}</pre>
                    {output.stderr && output.stderr.trim() !== "" && (
                      <pre className="mt-3 text-(--danger)">{`\n[STDERR]\n${output.stderr}`}</pre>
                    )}
                    <div className="mt-3 pt-3 border-t border-panel-border text-(--text-faint) text-xs">
                      Process finished with exit code {output.exitCode}
                    </div>
                  </div>
                )}

                {!isRunning && !output && (
                  <div className="bg-(--panel-muted) rounded-lg p-3 whitespace-pre-wrap wrap-break-word font-mono flex-1 overflow-auto text-sm text-(--text-faint)">
                    Code output will appear here after running.
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}