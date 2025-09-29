import { useState } from 'react'

const Home = () => {
  const [count, setCount] = useState(0)

  return (
    <div className="flex min-h-full w-full flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-3xl space-y-10 rounded-3xl border border-slate-800/60 bg-slate-900/50 p-10 text-center shadow-[0_20px_50px_rgba(15,23,42,0.45)] backdrop-blur">
        <div className="space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">
            Ready to build
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl">
            React, Vite & Tailwind out of the box
          </h1>
          <p className="mx-auto max-w-xl text-base text-slate-300 sm:text-lg">
            Start shipping features faster with a development environment that comes
            preconfigured with TypeScript, hot module replacement, and utility-first styles.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            className="rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
            onClick={() => setCount((value) => value + 1)}
            type="button"
          >
            Count is {count}
          </button>
          <span className="text-sm font-medium text-slate-400">
            Tailwind classes update instantly thanks to Vite&apos;s HMR
          </span>
        </div>
      </div>
    </div>
  )
}

export default Home
