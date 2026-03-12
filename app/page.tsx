export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-12">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter opacity-90">
          EnergyGolf
        </h1>

        <a
          href="/code"
          className={`
            inline-flex items-center justify-center
            px-10 py-5 text-lg font-medium
            bg-(--accent) text-white
            rounded-full
          `}
        >
          Code
        </a>
      </div>
    </div>
  );
}