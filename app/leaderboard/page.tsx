"use client"

import NavigationBar from "@/components/navigationBar";
import { PrimeReactProvider } from "primereact/api";
import type { PrimeReactPTOptions } from "primereact/api";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import type { DropdownPassThroughMethodOptions } from "primereact/dropdown";
import { classNames } from "primereact/utils";
import { useEffect, useState } from "react";
import { LeaderboardEntry, Problem } from "@/types";

export default function Leaderboard() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProblemId, setSelectedProblemId] = useState<number | null>(null);
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);
  const problemOptions = problems.map((problem) => ({
    label: problem.title,
    value: problem.id,
  }));
  const formatSubmittedAt = (submittedAt: string) => {
    const parsedDate = new Date(submittedAt);
    return Number.isNaN(parsedDate.getTime()) ? submittedAt : parsedDate.toLocaleString();
  };

  const tailwind: PrimeReactPTOptions = {
    card: {
      root: {
        className: classNames(
          "bg-white text-gray-700 shadow-md rounded-md",
          "dark:bg-panel dark:text-white border dark:border-panel-border"
        ),
      },
      body: {
        className: "p-5",
      },
      title: {
        className: "text-2xl font-bold mb-2",
      },
      subTitle: {
        className: classNames("font-normal mb-2 text-gray-600", "dark:text-white/60"),
      },
      content: {
        className: "py-2",
      },
    },
    dropdown: {
      root: ({ props }: DropdownPassThroughMethodOptions) => ({
        className: classNames(
          "cursor-pointer inline-flex relative select-none w-full max-w-lg",
          "bg-white text-gray-700 shadow-md rounded-md border border-gray-300",
          "dark:bg-panel dark:text-white dark:border-panel-border",
          "transition-colors duration-200",
          "hover:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 dark:focus-within:ring-blue-400/40",
          { "opacity-60 pointer-events-none cursor-default": props.disabled }
        ),
      }),
      input: {
        className: classNames(
          "block flex-auto overflow-hidden overflow-ellipsis whitespace-nowrap",
          "bg-transparent border-0 text-gray-700 dark:text-white",
          "p-3 text-base focus:outline-none"
        ),
      },
      trigger: {
        className: classNames("flex items-center justify-center shrink-0", "bg-transparent text-gray-500 w-12"),
      },
      panel: {
        className: classNames(
          "bg-white text-gray-700 rounded-md border border-gray-300 shadow-lg",
          "dark:bg-panel dark:text-white dark:border-panel-border"
        ),
      },
      wrapper: {
        className: "max-h-[220px] overflow-auto",
      },
      list: {
        className: "py-1 m-0 list-none bg-transparent",
      },
      item: ({ context }: DropdownPassThroughMethodOptions) => ({
        className: classNames(
          "cursor-pointer px-3 py-2",
          "text-gray-700 dark:text-white/90",
          "hover:bg-gray-100 dark:hover:bg-white/10",
          {
            "bg-blue-50 text-blue-700 dark:bg-white/15 dark:text-white": context.selected,
          }
        ),
      }),
    },
  };

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/problems", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          console.error("Failed to fetch problems");
        } else {
          const json: Problem[] = await response.json();
          setProblems(json);
          setSelectedProblemId(json.length > 0 ? json[0].id : null);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (selectedProblemId === null) {
        setLeaderboardEntries([]);
        return;
      }

      try {
        setLeaderboardLoading(true);
        setLeaderboardError(null);

        const response = await fetch(`/api/leaderboard/${selectedProblemId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          setLeaderboardError("Failed to fetch leaderboard.");
          setLeaderboardEntries([]);
          return;
        }

        const json: LeaderboardEntry[] = await response.json();
        setLeaderboardEntries(json);
      } catch (error) {
        console.log(error);
        setLeaderboardError("Failed to fetch leaderboard.");
        setLeaderboardEntries([]);
      } finally {
        setLeaderboardLoading(false);
      }
    };

    fetchLeaderboard();
  }, [selectedProblemId]);

  return (
    <>
      <NavigationBar />
      <div className="flex flex-col items-start justify-center space-y-8 max-w-7xl px-4 sm:px-8 mx-auto pb-12">
        <div className="mt-32 space-y-4 w-full">
          <h1 className="font-bold text-5xl">Leaderboard</h1>
          <p className="text-(--text-muted)">Only the best solutions are in the Hall of Fame!</p>

          {loading ? (
            <p className="text-(--text-muted)">Loading questions...</p>
          ) : problems.length === 0 ? (
            <p className="text-(--text-muted)">No questions available yet.</p>
          ) : (
            <PrimeReactProvider value={{ unstyled: true, pt: tailwind }}>
              <div className="space-y-4">
                <label htmlFor="problem-select" className="block text-sm font-medium text-(--text-muted)">
                  Select question
                </label>
                <Dropdown
                  id="problem-select"
                  appendTo="self"
                  panelClassName="leaderboard-dropdown-panel"
                  value={selectedProblemId}
                  options={problemOptions}
                  onChange={(e) => setSelectedProblemId((e.value as number) ?? null)}
                  placeholder="Select question"
                />

                <div className="py-4">
                  {leaderboardLoading ? (
                    <p className="text-(--text-muted)">Loading leaderboard...</p>
                  ) : leaderboardError ? (
                    <p className="text-(--danger)">{leaderboardError}</p>
                  ) : leaderboardEntries.length === 0 ? (
                    <p className="text-(--text-muted)">No leaderboard entries yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {leaderboardEntries.map((entry) => (
                        <Card
                          key={`${entry.userId}-${entry.rank}`}
                          title={`#${entry.rank} ${entry.userName}`}
                        >
                          <p className="m-0 text-(--text-muted)">Energy: {entry.energyConsumption.toFixed(2)} J</p>
                          <p className="m-0 text-(--text-muted)">Submitted: {formatSubmittedAt(entry.submittedAt)}</p>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </PrimeReactProvider>
          )}
        </div>
      </div>
    </>
  );
}