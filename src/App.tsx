import { useEffect, useRef, useState } from 'react'

import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import { type DropTargetRecord } from '@atlaskit/pragmatic-drag-and-drop/types'

type Task = {
  id: string
  name: string
  description: string
}

type ItemDragData = {
  type: 'item'
  id: string
}

type ListDropData = {
  type: 'list'
  id: string
}

type Destination =
  | { type: 'item'; id: string; indexOffset: 0 | 1 }
  | { type: 'list' }

const initialTasks: Task[] = [
  {
    id: 'welcome',
    name: 'Review project setup',
    description: 'Get familiar with Vite, React 19, and Tailwind in this starter.',
  },
  {
    id: 'drag',
    name: 'Experiment with drag & drop',
    description: 'Use pragmatic-drag-and-drop to reorder these tasks.',
  },
  {
    id: 'tailwind',
    name: 'Tweak the styling',
    description: 'Update Tailwind utility classes to match your product palette.',
  },
  {
    id: 'ship',
    name: 'Ship a feature',
    description: 'Drop this component into your app and keep iterating.',
  },
]

function App() {
  const [tasks, setTasks] = useState(initialTasks)
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const element = listRef.current

    if (!element) {
      return
    }

    return dropTargetForElements({
      element,
      getData: () => ({ type: 'list', id: 'task-list' } satisfies ListDropData),
    })
  }, [])

  useEffect(() => {
    return monitorForElements({
      onDragStart({ source }) {
        const data = source.data

        if (isItemDragData(data)) {
          setActiveTaskId(data.id)
        }
      },
      onDrop({ location, source }) {
        const data = source.data

        if (!isItemDragData(data)) {
          setActiveTaskId(null)
          return
        }

        const pointerY = location.current.input.clientY
        const destination = getDestination(location.current.dropTargets, pointerY)

        if (!destination) {
          setActiveTaskId(null)
          return
        }

        setTasks((current) => reorderTasks(current, data.id, destination))
        setActiveTaskId(null)
      },
    })
  }, [])

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-3xl space-y-8 rounded-3xl border border-slate-800/60 bg-slate-900/50 p-10 text-center shadow-[0_20px_50px_rgba(15,23,42,0.45)] backdrop-blur">
        <div className="space-y-4 text-left sm:text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">
            Drag &amp; drop demo
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl">
            Reorder tasks with pragmatic-drag-and-drop
          </h1>
          <p className="mx-auto max-w-xl text-base text-slate-300 sm:text-lg">
            Atlassian&apos;s pragmatic-drag-and-drop library works with React 19, so you can build
            modern experiences without legacy dependencies.
          </p>
        </div>

        <div className="space-y-6 text-left">
          <header className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Sprint checklist</h2>
              <p className="text-sm text-slate-400">
                Drag tasks to reprioritise them. Try moving them with touch, mouse, or trackpad.
              </p>
            </div>
            <span className="rounded-full border border-indigo-500/40 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">
              {tasks.length} tasks
            </span>
          </header>

          <div ref={listRef} className="grid gap-3">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} isActive={task.id === activeTaskId} />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

type TaskCardProps = {
  task: Task
  isActive: boolean
}

function TaskCard({ task, isActive }: TaskCardProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const element = ref.current

    if (!element) {
      return
    }

    return combine(
      draggable({
        element,
        getInitialData: () => ({ type: 'item', id: task.id } satisfies ItemDragData),
      }),
      dropTargetForElements({
        element,
        getData: () => ({ type: 'item', id: task.id } satisfies ItemDragData),
      }),
    )
  }, [task.id])

  return (
    <div
      ref={ref}
      className={`group relative overflow-hidden rounded-2xl border bg-slate-900/70 p-5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/80 ${
        isActive
          ? 'border-indigo-400/80 shadow-[0_16px_45px_rgba(99,102,241,0.35)]'
          : 'border-slate-800/80 shadow-[0_16px_45px_rgba(15,23,42,0.45)] hover:border-indigo-400/70'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-300">
            {task.name}
          </p>
          <p className="text-sm text-slate-300">{task.description}</p>
        </div>
        <span className="rounded-full border border-slate-700/60 bg-slate-800/60 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Drag me
        </span>
      </div>
    </div>
  )
}

function reorderTasks(tasks: Task[], sourceId: string, destination: Destination) {
  const startIndex = tasks.findIndex((task) => task.id === sourceId)

  if (startIndex === -1) {
    return tasks
  }

  let targetIndex: number

  if (destination.type === 'item') {
    const index = tasks.findIndex((task) => task.id === destination.id)

    if (index === -1) {
      return tasks
    }

    targetIndex = index + destination.indexOffset
  } else {
    targetIndex = tasks.length
  }

  const insertAt = startIndex < targetIndex ? targetIndex - 1 : targetIndex

  if (insertAt === startIndex) {
    return tasks
  }

  const updated = tasks.slice()
  const [moved] = updated.splice(startIndex, 1)

  updated.splice(insertAt, 0, moved)

  return updated
}

function getDestination(dropTargets: DropTargetRecord[], pointerY: number): Destination | null {
  const itemTarget = findItemTarget(dropTargets)

  if (itemTarget) {
    const element = itemTarget.element as HTMLElement
    const rect = element.getBoundingClientRect()
    const shouldInsertAfter = Number.isFinite(pointerY)
      ? pointerY > rect.top + rect.height / 2
      : false

    return {
      type: 'item',
      id: itemTarget.data.id,
      indexOffset: shouldInsertAfter ? 1 : 0,
    }
  }

  const listTarget = dropTargets.find((target) => isListDropData(target.data))

  if (listTarget) {
    return { type: 'list' }
  }

  return null
}

function findItemTarget(dropTargets: DropTargetRecord[]): { data: ItemDragData; element: Element } | null {
  for (const target of dropTargets) {
    if (isItemDropData(target.data)) {
      return { data: target.data, element: target.element }
    }
  }

  return null
}

function isItemDragData(value: unknown): value is ItemDragData {
  if (!value || typeof value !== 'object') {
    return false
  }

  const record = value as Record<string, unknown>

  return record.type === 'item' && typeof record.id === 'string'
}

function isItemDropData(value: unknown): value is ItemDragData {
  return isItemDragData(value)
}

function isListDropData(value: unknown): value is ListDropData {
  if (!value || typeof value !== 'object') {
    return false
  }

  return (value as Record<string, unknown>).type === 'list'
}

export default App
