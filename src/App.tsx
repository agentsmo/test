import { useEffect, useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type BoardColumnKey, type Task } from './db'

const columns: { key: BoardColumnKey; title: string; hint: string }[] = [
  {
    key: 'backlog',
    title: 'Backlog',
    hint: 'Ideas and work that still needs prioritisation.',
  },
  {
    key: 'inProgress',
    title: 'In progress',
    hint: 'Work being actively tackled right now.',
  },
  {
    key: 'review',
    title: 'Review',
    hint: 'Items waiting for QA or feedback.',
  },
  {
    key: 'done',
    title: 'Done',
    hint: 'Shipped or completed items to celebrate.',
  },
]

const statusLabels: Record<BoardColumnKey, string> = columns.reduce(
  (acc, column) => {
    acc[column.key] = column.title
    return acc
  },
  {} as Record<BoardColumnKey, string>,
)

function formatTimestamp(timestamp: number) {
  const date = new Date(timestamp)
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

async function handleAddTask(status: BoardColumnKey) {
  const now = Date.now()
  await db.tasks.add({
    title: 'New task',
    description: '',
    status,
    createdAt: now,
    updatedAt: now,
  })
}

async function handleDeleteTask(taskId: number | undefined) {
  if (!taskId) return
  await db.tasks.delete(taskId)
}

type TaskCardProps = {
  task: Task
}

function TaskCard({ task }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formState, setFormState] = useState({
    title: task.title,
    description: task.description,
    status: task.status,
  })

  useEffect(() => {
    setFormState({
      title: task.title,
      description: task.description,
      status: task.status,
    })
  }, [task.description, task.status, task.title])

  async function saveChanges() {
    if (!task.id) return
    const trimmedTitle = formState.title.trim()
    await db.tasks.update(task.id, {
      title: trimmedTitle.length ? trimmedTitle : 'Untitled task',
      description: formState.description,
      status: formState.status,
      updatedAt: Date.now(),
    })
    setIsEditing(false)
  }

  return (
    <article className="group rounded-xl border border-slate-700/60 bg-slate-900/80 p-4 shadow-sm shadow-slate-900 transition hover:border-indigo-500/60">
      {isEditing ? (
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault()
            void saveChanges()
          }}
        >
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400" htmlFor={`title-${task.id}`}>
              Title
            </label>
            <input
              id={`title-${task.id}`}
              className="w-full rounded-lg border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/40"
              onChange={(event) => setFormState((state) => ({ ...state, title: event.target.value }))}
              value={formState.title}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400" htmlFor={`description-${task.id}`}>
              Description
            </label>
            <textarea
              id={`description-${task.id}`}
              className="min-h-[96px] w-full rounded-lg border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/40"
              onChange={(event) => setFormState((state) => ({ ...state, description: event.target.value }))}
              value={formState.description}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400" htmlFor={`status-${task.id}`}>
              Status
            </label>
            <select
              id={`status-${task.id}`}
              className="w-full rounded-lg border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/40"
              onChange={(event) =>
                setFormState((state) => ({ ...state, status: event.target.value as BoardColumnKey }))
              }
              value={formState.status}
            >
              {columns.map((column) => (
                <option key={column.key} value={column.key}>
                  {column.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              className="rounded-lg border border-transparent px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-300 transition hover:text-slate-100"
              onClick={() => {
                setIsEditing(false)
                setFormState({
                  title: task.title,
                  description: task.description,
                  status: task.status,
                })
              }}
              type="button"
            >
              Cancel
            </button>
            <button
              className="rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-indigo-400"
              type="submit"
            >
              Save
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-100">{task.title || 'Untitled task'}</h3>
              <p className="text-xs font-medium uppercase tracking-wide text-indigo-300">{statusLabels[task.status]}</p>
            </div>
            <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
              <button
                className="rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-300 transition hover:bg-indigo-500/10 hover:text-indigo-200"
                onClick={() => setIsEditing(true)}
                type="button"
              >
                Edit
              </button>
              <button
                className="rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-wide text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200"
                onClick={() => handleDeleteTask(task.id)}
                type="button"
              >
                Delete
              </button>
            </div>
          </div>
          {task.description ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{task.description}</p>
          ) : (
            <p className="text-sm italic text-slate-500">No description yet. Click edit to add more details.</p>
          )}
          <p className="text-xs text-slate-500">Updated {formatTimestamp(task.updatedAt)}</p>
        </div>
      )}
    </article>
  )
}

type TaskColumnProps = {
  column: (typeof columns)[number]
  tasks: Task[]
}

function TaskColumn({ column, tasks }: TaskColumnProps) {
  const sortedTasks = useMemo(
    () =>
      [...tasks].sort((a, b) => {
        if (a.createdAt === b.createdAt) {
          return (a.id ?? 0) - (b.id ?? 0)
        }
        return a.createdAt - b.createdAt
      }),
    [tasks],
  )

  return (
    <section className="flex h-full min-h-[540px] w-full flex-col gap-4 rounded-3xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-[0_30px_60px_rgba(15,23,42,0.55)]">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-100">{column.title}</h2>
        <p className="text-sm text-slate-400">{column.hint}</p>
      </header>
      <div className="space-y-3 overflow-y-auto pr-1">
        {sortedTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        {sortedTasks.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-700/70 bg-slate-900/40 p-4 text-sm text-slate-500">
            No tasks yet. Use the button below to add your first card.
          </p>
        ) : null}
      </div>
      <button
        className="mt-auto flex items-center justify-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-200 transition hover:border-indigo-400 hover:bg-indigo-500/20"
        onClick={() => {
          void handleAddTask(column.key)
        }}
        type="button"
      >
        + Add task
      </button>
    </section>
  )
}

function App() {
  const tasks = useLiveQuery(async () => db.tasks.toArray(), [], [])

  const tasksByStatus = useMemo(() => {
    const grouped: Record<BoardColumnKey, Task[]> = {
      backlog: [],
      inProgress: [],
      review: [],
      done: [],
    }

    if (!tasks) {
      return grouped
    }

    for (const task of tasks) {
      grouped[task.status]?.push(task)
    }

    return grouped
  }, [tasks])

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-10 text-slate-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="space-y-4 text-center">
          <span className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-300">
            Plan and track
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl">Your personal task board</h1>
          <p className="mx-auto max-w-2xl text-base text-slate-300 sm:text-lg">
            Create and edit cards in each column, and everything is saved locally thanks to IndexedDB powered by Dexie. Use the add
            task buttons at the bottom of each list to grow your backlog just like you would in Trello.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {columns.map((column) => (
            <TaskColumn key={column.key} column={column} tasks={tasksByStatus[column.key]} />
          ))}
        </div>
      </div>
    </main>
  )
}

export default App
