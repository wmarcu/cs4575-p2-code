"use client";

import { Card } from 'primereact/card';
import { classNames } from "primereact/utils";
import { PrimeReactProvider } from "primereact/api";

export default function Home() {
  const Tailwind = {
    card: {
      root: {
        className: classNames(
          'bg-white text-gray-700 shadow-md rounded-md', // Background, text color, box shadow, and border radius.
          'dark:bg-secondary dark:text-white ' //dark
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

  return (
    <main className="">
      <div className="flex flex-col items-start justify-center space-y-4 max-w-7xl px-4 sm:px-8 mx-auto">
        <h1 className="font-bold text-5xl mt-26">JouleDuel</h1>
        <div className="space-y-4 w-full">
          <PrimeReactProvider value={{ unstyled: true, pt: Tailwind }}>
          <Card title="Sorting numbers">
            <p className="m-0">
              Given an array of numbers, sort them in ascending order. For example, if the input is [5, 2, 9, 1], the output should be [1, 2, 5, 9].
            </p>
          </Card>
          </PrimeReactProvider>
          <PrimeReactProvider value={{ unstyled: true, pt: Tailwind }}>
            <Card title="Sorting numbers">
              <p className="m-0">
                Given an array of numbers, sort them in ascending order. For example, if the input is [5, 2, 9, 1], the output should be [1, 2, 5, 9].
              </p>
            </Card>
          </PrimeReactProvider>
          <PrimeReactProvider value={{ unstyled: true, pt: Tailwind }}>
            <Card title="Sorting numbers">
              <p className="m-0">
                Given an array of numbers, sort them in ascending order. For example, if the input is [5, 2, 9, 1], the output should be [1, 2, 5, 9].
              </p>
            </Card>
          </PrimeReactProvider>
          <PrimeReactProvider value={{ unstyled: true, pt: Tailwind }}>
            <Card title="Sorting numbers">
              <p className="m-0">
                Given an array of numbers, sort them in ascending order. For example, if the input is [5, 2, 9, 1], the output should be [1, 2, 5, 9].
              </p>
            </Card>
          </PrimeReactProvider>
        </div>
      </div>
    </main>
  );
}
