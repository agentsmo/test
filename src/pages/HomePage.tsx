import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { db } from '../db'

function HomePage() {
  const projects = useLiveQuery(() => db.projects.toArray(), []) ?? []

  return (
    <main className="min-h-screen bg-slate-950 pb-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16">
        <header className="space-y-4 text-slate-100">
          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-800/80 bg-slate-900/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
            Workspace overview
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Projects</h1>
            <p className="max-w-xl text-sm text-slate-300 sm:text-base">
              Jump into a project to organize tasks across kanban columns. Each workspace keeps its own drag-and-drop board
              backed by IndexedDB storage.
            </p>
          </div>
        </header>

        {projects.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-3xl border border-slate-800/60 bg-slate-900/40 p-12 text-sm text-slate-300">
            <p>No projects yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {projects.map((project) => (
              <Link
                key={project.id}
                to={`/project/${project.id}`}
                className="group flex h-full flex-col justify-between rounded-3xl border border-slate-800/60 bg-slate-900/60 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.45)] transition hover:border-indigo-400/70 hover:shadow-[0_30px_65px_rgba(99,102,241,0.35)]"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                    <span className="rounded-full border border-slate-800/80 bg-slate-950/70 px-3 py-1">Kanban</span>
                    <span className="rounded-full border border-slate-800/80 bg-slate-950/70 px-3 py-1">IndexedDB</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-slate-50 transition group-hover:text-indigo-200">{project.name}</h2>
                  <p className="text-sm text-slate-300">{project.summary}</p>
                </div>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-300">
                  View board
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default HomePage
