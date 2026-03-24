"use client";

import NavigationBar from "@/components/navigationBar";

export default function CodeHelpPage() {
  return (
    <main className="">
      <NavigationBar />
      <div className="flex flex-col items-start justify-center space-y-8 max-w-7xl px-4 sm:px-8 mx-auto pb-12">
        <div className="mt-32 space-y-4">
          <h1 className="font-bold text-5xl">Code help</h1>
          <p className="text-(--text-muted)">A small guide to get you up to speed for writing green code!</p>
        </div>
        <div className="space-y-4 w-full">
          <p>
            Writing energy-efficient code means reducing the amount of work your program has to do. Less work means less CPU usage, fewer memory operations, and ultimately less energy consumption. In practice, this comes down to making smart tradeoffs between time (how fast your code runs) and space (how much memory it uses).
          </p>

          <h2 className="font-semibold text-2xl mt-6">1. Time efficiency: do less work</h2>
          <p>
            The faster your code finishes, the less time your hardware spends consuming power. This is why algorithms and time complexity matter.
          </p>

          <p>
            For example, consider searching for a number in an array:
          </p>

          <pre className="border-2 p-4 rounded">
{`// Inefficient: checks every element
function contains(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return true;
  }
  return false;
}`}
</pre>

          <p>
            This is fine for small arrays, but for large datasets, it can be slow. If the data is sorted, you can use binary search:
          </p>

          <pre className="border-2 p-4 rounded">
{`// More efficient: divides the problem in half each step
function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return true;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }

  return false;
}`}
</pre>

          <p>
            By reducing the number of operations, you reduce execution time and energy usage.
          </p>

          <h2 className="font-semibold text-2xl mt-6">2. Space efficiency: use less memory</h2>
          <p>
            Memory is not free. Allocating, accessing, and cleaning up memory all consume energy. Writing space-efficient code helps reduce this overhead.
          </p>

          <p>
            For example:
          </p>

          <pre className="border-2 p-4 rounded">
{`// Less efficient: creates a new array
function doubleNumbers(arr) {
  return arr.map(x => x * 2);
}`}
</pre>

          <p>
            This creates a new array in memory. If you don’t need the original array, you can modify it in place:
          </p>

          <pre className="border-2 p-4 rounded">
{`// More space-efficient: modifies existing array
function doubleNumbers(arr) {
  for (let i = 0; i < arr.length; i++) {
    arr[i] *= 2;
  }
  return arr;
}`}
</pre>

          <p>
            This avoids extra memory allocation and reduces pressure on the garbage collector.
          </p>

          <h2 className="font-semibold text-2xl mt-6">3. Avoid unnecessary work</h2>
          <p>
            One of the easiest ways to save energy is to avoid doing work you don’t need to do.
          </p>

          <ul className="list-disc ml-6 space-y-2">
            <li>Avoid repeated calculations (cache results when possible).</li>
            <li>Break early from loops when you’ve found your answer.</li>
            <li>Don’t recompute values that haven’t changed.</li>
          </ul>

          <pre className="border-2 p-4 rounded">
{`// Inefficient: recalculates every time
for (let i = 0; i < arr.length; i++) {
  console.log(arr.length);
}

// Better: compute once
const length = arr.length;
for (let i = 0; i < length; i++) {
  console.log(length);
}`}
</pre>

          <h2 className="font-semibold text-2xl mt-6">4. Balance time vs space</h2>
          <p>
            Sometimes, faster code uses more memory, and memory-efficient code can be slower. Energy-efficient code often sits in the middle.
          </p>

          <p>
            For example, using a lookup table (like an object or map) can make lookups faster, but increases memory usage. Whether this is “greener” depends on the situation: how often the code runs, how large the data is, and how long it stays in memory.
          </p>

          <h2 className="font-semibold text-2xl mt-6">5. Write simple, predictable code</h2>
          <p>
            Simpler code is often more efficient. Complex abstractions, excessive function calls, and unnecessary layers can add hidden costs.
          </p>

          <ul className="list-disc ml-6 space-y-2">
            <li>Prefer clear loops over deeply nested abstractions when performance matters.</li>
            <li>Avoid unnecessary object creation.</li>
            <li>Keep data structures as simple as possible.</li>
          </ul>

          <h2 className="font-semibold text-2xl mt-6">Final thought</h2>
          <p>
            Energy-efficient programming is about awareness. Every operation, allocation, and abstraction has a cost. By writing code that does less, uses less, and finishes sooner, you contribute to more sustainable software.
          </p>
        </div>
      </div>
    </main>
  );
}
