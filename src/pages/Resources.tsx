import { resources } from '../data/resources'

const Resources = () => {
  return (
    <div className="flex min-h-full w-full flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-4xl space-y-10 rounded-3xl border border-slate-800/60 bg-slate-900/50 p-10 text-center shadow-[0_20px_50px_rgba(15,23,42,0.45)] backdrop-blur">
        <div className="space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">
            Dive deeper
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl">
            Level up with curated docs
          </h1>
          <p className="mx-auto max-w-2xl text-base text-slate-300 sm:text-lg">
            Explore guides for Vite, React, and Tailwind to keep building incredible experiences with this starter kit.
          </p>
        </div>

        <ul className="grid gap-4 text-left sm:grid-cols-3">
          {resources.map((resource) => (
            <li
              key={resource.title}
              className="group relative overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4 transition hover:border-indigo-400/70 hover:bg-slate-900/80"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/0 via-indigo-400/0 to-indigo-400/10 opacity-0 transition group-hover:opacity-100" />
              <a className="relative flex h-full flex-col gap-2" href={resource.href} target="_blank" rel="noreferrer">
                <span className="text-sm font-semibold text-indigo-300">{resource.title}</span>
                <p className="text-sm leading-relaxed text-slate-300">{resource.description}</p>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Resources
