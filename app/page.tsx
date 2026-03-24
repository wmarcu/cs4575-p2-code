"use client";

import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { classNames } from "primereact/utils";
import { PrimeReactProvider } from "primereact/api";
import { useState, useEffect } from "react";
import Link from "next/link";
import NavigationBar from "@/components/navigationBar";
import { Problem } from "@/types";

export default function Home() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  const Tailwind = {
    card: {
      root: {
        className: classNames(
          'bg-white text-gray-700 shadow-md rounded-md', // Background, text color, box shadow, and border radius.
          'dark:bg-panel dark:text-white border dark:border-panel-border' //dark
        )
      },
      body: {
        className: 'p-5' // Padding.
      },
      title: {
        className: 'text-2xl font-bold mb-2' // Font size, font weight, and margin bottom.
      },
      subtitle: {
        className: classNames(
          'font-normal mb-2 text-gray-600', // Font weight, margin bottom, and text color.
          'dark:text-white/60 ' //dark
        )
      },
      content: {
        className: 'py-2' // Vertical padding.
      },
      footer: {
        className: 'pt-5' // Top padding.
      }
    }
  }

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
          const json = await response.json();
          setProblems(json);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);


  return (
    <main className="">
      <NavigationBar />
      <div className="flex flex-col items-start justify-center space-y-8 max-w-7xl px-4 sm:px-8 mx-auto pb-12">
        <div className="mt-32 space-y-4">
          <h1 className="font-bold text-5xl">Problems</h1>
          <p className="text-(--text-muted)">The solution which uses the least energy, wins!</p>
        </div>
        <div className="space-y-4 w-full">
          <PrimeReactProvider value={{ unstyled: true, pt: Tailwind }}>
            {loading ? (
              <p className="text-(--foreground)">Loading problems...</p>
            ) : problems.length === 0 ? (
              <p className="text-(--foreground)">No problems found.</p>
            ) : (
              problems.map((problem) => (
                <Card 
                  key={problem.id} 
                  title={problem.title}
                  subTitle={`Difficulty: ${problem.difficulty}`}
                  footer={() => (
                    <Link href={`/code?id=${problem.id}`}>
                      <Button
                        className="bg-(--accent) hover:bg-(--accent-hover) text-(--foreground) font-semibold py-2 px-4
                         rounded-md transition-colors duration-200"
                      >
                        Solve problem
                      </Button>
                    </Link>
                  )}
                >
                  <p className="m-0 text-(--text-muted)">{problem.description}</p>
                </Card>
              ))
            )}
          </PrimeReactProvider>
        </div>
      </div>
    </main>
  );
}
