"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect, Suspense } from "react";
import {RunResponse, LANGUAGE, SubmitResponse} from "@/types";
import Editor from "@monaco-editor/react";
import type { OnMount } from "@monaco-editor/react";
import { ClipLoader } from "react-spinners";
import type * as monaco from "monaco-editor";
import Link from "next/link";
import { Problem } from "@/types";
import { useAuth } from "@/components/AuthContext";

function CodingPanelContent() {
  const searchParams = useSearchParams();
  const id = searchParams?.get("id");
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      const redirectUrl = id ? `/code?id=${id}` : "/";
      router.replace(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
    }
  }, [authLoading, user, router, id]);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [output, setOutput] = useState<RunResponse | null>(null);
  const [submitResult, setSubmitResult] = useState<SubmitResponse | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

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

  const handleSubmit = async () => {
    if (isSubmitting || isRunning || !editorRef.current || !id) return;
    const currentCode = editorRef.current.getValue();

    if (!currentCode.trim()) {
      setSubmitResult({
        success: false,
        validation: { passed: false, totalTests: 0, passedTests: 0, failedTests: [] },
        error: "No code to submit.",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitResult(null);
    setOutput(null);

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: currentCode,
          problemId: Number(id),
          userId: user!.id,
        }),
      });

      const json = await response.json();
      setSubmitResult(json);
    } catch (error) {
      console.error("Submit error:", error);
      setSubmitResult({
        success: false,
        validation: { passed: false, totalTests: 0, passedTests: 0, failedTests: [] },
        error: "Failed to submit. Please try again.",
      });
    }

    setIsSubmitting(false);
  };

  const handleAnalyze = async () => {
    if (!editorRef.current) return;

    const code = editorRef.current.getValue();

    try {
      setFeedbackLoading(true);
      setFeedback(null);

      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch feedback");
      }

      const data = await res.json();
      setFeedback(data.feedback);
    } catch (err) {
      console.error(err);
      setFeedback("Something went wrong while analyzing the code.");
    } finally {
      setFeedbackLoading(false);
    }
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
                <li>
                  <Link href="/code-help">
                    <span className="dark:hover:text-gray-400 font-semibold">Code help</span>
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
                disabled={isRunning || isSubmitting}
                className="px-5 py-2 text-base font-semibold rounded-lg bg-(--panel-muted) text-(--foreground) border border-panel-border hover:bg-(--panel-hover) disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {isRunning ? "Running..." : "Run Code"}
              </button>
              <button
                onClick={handleSubmit}
                disabled={isRunning || isSubmitting}
                className="px-5 py-2 text-base font-semibold rounded-lg bg-(--accent) text-white hover:bg-(--accent-hover) disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
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

                {(isRunning || isSubmitting) && (
                  <div className="flex items-center justify-center flex-1 flex-col gap-2">
                    <ClipLoader color="var(--accent)" size={30} />
                    {isSubmitting && (
                      <span className="text-sm text-(--text-muted)">
                        Validating and measuring energy...
                      </span>
                    )}
                  </div>
                )}

                {!isRunning && !isSubmitting && submitResult && (
                  <div className="bg-(--panel-muted) rounded-lg p-3 font-mono flex-1 overflow-auto text-sm">
                    {/* Validation Results */}
                    <div className={`mb-3 p-2 rounded ${submitResult.validation.passed ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                      <span className="font-semibold">
                        {submitResult.validation.passed ? '✓ All tests passed!' : '✗ Tests failed'}
                      </span>
                      <span className="ml-2 text-(--text-muted)">
                        ({submitResult.validation.passedTests}/{submitResult.validation.totalTests} passed)
                      </span>
                    </div>

                    {/* Failed Tests */}
                    {submitResult.validation.failedTests.length > 0 && (
                      <div className="mb-3 space-y-2">
                        {submitResult.validation.failedTests.slice(0, 3).map((failure, index) => (
                          <div key={index} className="p-2 rounded border border-red-800/50 text-xs">
                            <div><span className="text-(--text-muted)">Test {failure.testIndex}:</span></div>
                            <div><span className="text-(--text-muted)">Input:</span> <code>{failure.input}</code></div>
                            <div><span className="text-(--text-muted)">Expected:</span> <code>{failure.expected}</code></div>
                            <div><span className="text-red-400">Got:</span> <code>{failure.actual}</code></div>
                          </div>
                        ))}
                        {submitResult.validation.failedTests.length > 3 && (
                          <div className="text-(--text-muted) text-xs">
                            ...and {submitResult.validation.failedTests.length - 3} more failed tests
                          </div>
                        )}
                      </div>
                    )}

                    {/* Energy Results */}
                    {submitResult.success && submitResult.energy && (
                      <div className="mb-3 p-3 rounded bg-blue-900/20 border border-blue-800/50">
                        <div className="text-blue-400 font-semibold mb-2">Score</div>
                        <div className="text-2xl text-blue-300 font-bold mb-4">
                          {submitResult.energy.microJoulesPerIteration.toFixed(4)} <span className="text-sm font-normal text-blue-400/80">µJ / Iteration</span>
                        </div>
                        <div className="text-(--text-muted) text-xs mb-2">Detailed Metrics:</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-(--text-muted)">Delta Power:</span>
                            <span className="ml-2 text-(--foreground)">
                              {submitResult.energy.deltaWatts.toFixed(2)} W
                            </span>
                          </div>
                          <div>
                            <span className="text-(--text-muted)">Median Energy:</span>
                            <span className="ml-2 text-(--foreground)">
                              {submitResult.energy.medianJoules.toFixed(2)} J
                            </span>
                          </div>
                          <div>
                            <span className="text-(--text-muted)">Baseline:</span>
                            <span className="ml-2 text-(--text-faint)">
                              {submitResult.energy.baselineWatts.toFixed(2)} W
                            </span>
                          </div>
                          <div>
                            <span className="text-(--text-muted)">Iterations:</span>
                            <span className="ml-2 text-(--text-faint)">
                              {submitResult.energy.totalIterations.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-(--text-muted)">Warm-up runs:</span>
                            <span className="ml-2 text-(--text-faint)">
                              {submitResult.energy.warmupRuns}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-(--text-muted)">Individual runs (µJ/iter):</span>
                            <span className="ml-2 text-(--text-faint)">
                              [{submitResult.energy.runsMicroJoulesPerIteration.map(r => r.toFixed(2)).join(', ')}]
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-(--text-muted)">Individual runs (delta J):</span>
                            <span className="ml-2 text-(--text-faint)">
                              [{submitResult.energy.runs.map(r => r.toFixed(2)).join(', ')}]
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Submission Success */}
                    {submitResult.success && submitResult.submission && (
                      <>
                        <div className="mb-3 p-2 rounded bg-green-900/20 border border-green-800/50 text-green-400 text-xs">
                          Submission #{submitResult.submission.id} recorded successfully!
                        </div>
                        <div className="p-3 rounded bg-purple-900/20 border border-purple-500/50 text-purple-300 text-xs">
                          <div className="flex items-center gap-2 mb-2">
                            <span>🧠 Get feedback with AI!</span>
                            <button
                              onClick={handleAnalyze}
                              disabled={feedbackLoading}
                              className="px-2 py-1 text-xs rounded bg-purple-600 hover:bg-purple-500 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {feedbackLoading ? "Analyzing..." : "Analyze"}
                            </button>
                          </div>

                          {feedback && (
                            <div className="mt-2 p-2 rounded bg-purple-950/40 border border-purple-700 text-purple-200 whitespace-pre-wrap">
                              {feedback}
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {/* Error */}
                    {submitResult.error && (
                      <div className="p-2 rounded bg-yellow-900/20 border border-yellow-800/50 text-yellow-400 text-xs">
                        {submitResult.error}
                      </div>
                    )}
                  </div>
                )}

                {!isRunning && !isSubmitting && !submitResult && output && (
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

                {!isRunning && !isSubmitting && !output && !submitResult && (
                  <div className="bg-(--panel-muted) rounded-lg p-3 whitespace-pre-wrap wrap-break-word font-mono flex-1 overflow-auto text-sm text-(--text-faint)">
                    Run your code to test, or Submit to validate and measure energy.
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

export default function CodingPanel() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-(--background)">
        <ClipLoader color="#3b82f6" size={40} />
      </div>
    }>
      <CodingPanelContent />
    </Suspense>
  );
}