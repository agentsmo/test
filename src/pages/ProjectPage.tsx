import { useLiveQuery } from 'dexie-react-hooks'
import { Link, useParams } from 'react-router-dom'
import KanbanBoard, { type ColumnWithTasks, type ProjectWithColumns } from '../components/KanbanBoard'
import { db } from '../db'

function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>()

  const project = useLiveQuery<ProjectWithColumns | null>(async () => {
    if (!projectId) {
      return null
    }

    const projectRecord = await db.projects.get(projectId)

    if (!projectRecord) {
      return null
    }

    const columns = await db.columns.where('projectId').equals(projectId).sortBy('position')
    const tasks = await db.tasks.where('projectId').equals(projectId).sortBy('position')

    const columnsWithTasks: ColumnWithTasks[] = columns.map((column) => ({
      ...column,
      tasks: tasks.filter((task) => task.columnId === column.id),
    }))

    return { ...projectRecord, columns: columnsWithTasks }
  }, [projectId])

  return (
    <main className="min-h-screen bg-slate-950 pb-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-14">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-sm font-semibold text-indigo-300">
            <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-indigo-500/40 px-3 py-1 text-xs uppercase tracking-[0.2em] text-indigo-200 transition hover:border-indigo-300/70">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Projects
            </Link>
            <span className="hidden text-xs uppercase tracking-[0.2em] text-slate-400 sm:inline">/</span>
            {project?.name && (
              <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{project.name}</span>
            )}
          </div>
        </div>

        {project === undefined ? (
          <div className="flex flex-1 items-center justify-center text-slate-300">Loading project…</div>
        ) : project === null ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center text-slate-300">
            <p className="text-lg font-semibold text-slate-100">Project not found</p>
            <p className="max-w-sm text-sm text-slate-400">
              The project you are looking for may have been removed. Return to the project list to pick another workspace.
            </p>
          </div>
        ) : (
          <KanbanBoard project={project} />
        )}
      </div>
    </main>
  )
}

export default ProjectPage
