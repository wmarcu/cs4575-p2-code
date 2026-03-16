"use client";

import { useParams } from "next/navigation";
import { useState, useRef } from "react";
import {RunResponse, Challenge, LANGUAGE} from "@/types";
import Editor from "@monaco-editor/react";
import type { OnMount } from "@monaco-editor/react";
import { ClipLoader } from "react-spinners";
import type * as monaco from "monaco-editor";

const MOCK_CHALLENGE: Challenge = {
  title: "Two Sum",
  difficulty: "Easy",
  description:
    "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
  examples: [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
    },
    {
      input: "nums = [3,2,4], target = 6",
      output: "[1,2]",
      explanation: "Because nums[1] + nums[2] == 6, we return [1, 2].",
    },
  ],
  constraints: [
    "2 <= nums.length <= 10^4",
    "-10^9 <= nums[i] <= 10^9",
    "-10^9 <= target <= 10^9",
    "Only one valid answer exists.",
  ],
  starterCode: `class Solution:
    def twoSum(self, nums, target):
        # Write your solution here
        pass
print(1)
`,
};

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
      <div className="flex justify-between items-center flex-wrap gap-2 shrink-0">
        <h1 className="text-2xl font-bold">Problem Workspace {id}</h1>

        <div className="flex items-center gap-2">
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
        <div className="min-h-0 bg-(--panel) border border-(--panel-border) rounded-lg overflow-hidden flex flex-col shadow-sm">
          <Editor
            height="100%"
            language={LANGUAGE}
            theme="vs-dark"
            onMount={handleEditorDidMount}
            defaultValue={MOCK_CHALLENGE.starterCode}
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
          <div className="min-h-0 bg-(--panel) border border-(--panel-border) rounded-lg p-4 overflow-auto flex flex-col shadow-sm">
            <div className="flex items-center gap-2 mb-2 shrink-0">
              <h2 className="text-xl font-semibold">{MOCK_CHALLENGE.title}</h2>
              <span className="px-2 py-1 text-xs rounded-full border border-(--panel-border) bg-(--panel-muted) text-(--text-muted)">
                {MOCK_CHALLENGE.difficulty}
              </span>
            </div>

            <div className="space-y-4 text-sm leading-6 text-(--text-muted)">
              <p>{MOCK_CHALLENGE.description}</p>

              <div>
                <h3 className="font-semibold mb-2 text-(--foreground)">
                  Examples
                </h3>
                <div className="space-y-3">
                  {MOCK_CHALLENGE.examples.map((example, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-(--panel-border) bg-(--panel-muted) p-3"
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
                  {MOCK_CHALLENGE.constraints.map((constraint, index) => (
                    <li key={index}>
                      <code>{constraint}</code>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Output */}
          <div className="min-h-0 bg-(--panel) border border-(--panel-border) rounded-lg p-3 overflow-auto flex flex-col shadow-sm">
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
                <div className="mt-3 pt-3 border-t border-(--panel-border) text-(--text-faint) text-xs">
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
    </div>
  );
}