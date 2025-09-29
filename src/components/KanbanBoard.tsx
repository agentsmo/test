import { useEffect, useMemo, useRef, useState } from 'react'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import type { DropTargetRecord } from '@atlaskit/pragmatic-drag-and-drop/types'
import { db, type ColumnRecord, type ProjectRecord, type TaskRecord } from '../db'

export type ColumnWithTasks = ColumnRecord & { tasks: TaskRecord[] }
export type ProjectWithColumns = ProjectRecord & { columns: ColumnWithTasks[] }

type CardDragData = {
  type: 'card'
  projectId: string
  columnId: string
  taskId: string
}

type ColumnDropData = {
  type: 'column'
  projectId: string
  columnId: string
}

type Destination =
  | {
      type: 'card'
      projectId: string
      columnId: string
      taskId: string
      indexOffset: 0 | 1
    }
  | {
      type: 'column'
      projectId: string
      columnId: string
    }

type PreviewPlacement =
  | { type: 'before-card'; taskId: string }
  | { type: 'after-card'; taskId: string }
  | { type: 'column-end' }

function KanbanBoard({ project }: { project: ProjectWithColumns }) {
  const [activeCard, setActiveCard] = useState<CardDragData | null>(null)
  const [previewDestination, setPreviewDestination] = useState<Destination | null>(null)

  useEffect(() => {
    return monitorForElements({
      canMonitor({ source }) {
        return isCardDragData(source.data)
      },
      onDragStart({ source }) {
        if (isCardDragData(source.data)) {
          setActiveCard(source.data)
        }
      },
      onDrag({ location, source }) {
        if (!isCardDragData(source.data)) {
          return
        }

        const pointerY = location.current.input ? location.current.input.clientY : Number.NaN
        const destination = getDestination(location.current.dropTargets, pointerY, source.data.projectId)

        setPreviewDestination(destination)
      },
      onDropTargetChange({ location, source }) {
        if (!isCardDragData(source.data)) {
          return
        }

        const pointerY = location.current.input ? location.current.input.clientY : Number.NaN
        const destination = getDestination(location.current.dropTargets, pointerY, source.data.projectId)

        setPreviewDestination(destination)
      },
      onDrop({ location, source }) {
        if (!isCardDragData(source.data)) {
          setActiveCard(null)
          setPreviewDestination(null)
          return
        }

        const pointerY = location.current.input ? location.current.input.clientY : Number.NaN
        const destination = getDestination(location.current.dropTargets, pointerY, source.data.projectId)

        if (destination) {
          void moveTaskInDatabase(source.data, destination)
        }

        setActiveCard(null)
        setPreviewDestination(null)
      },
    })
  }, [project.id])

  return (
    <section className="space-y-6 rounded-3xl border border-slate-800/60 bg-slate-900/40 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.45)] backdrop-blur">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold text-slate-50 sm:text-4xl">{project.name}</h1>
          <p className="max-w-2xl text-sm text-slate-300 sm:text-base">{project.summary}</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
          <span className="rounded-full border border-slate-800/80 bg-slate-950/70 px-3 py-1">Kanban</span>
          <span className="rounded-full border border-slate-800/80 bg-slate-950/70 px-3 py-1">Drag &amp; drop</span>
          <span className="rounded-full border border-slate-800/80 bg-slate-950/70 px-3 py-1">IndexedDB</span>
        </div>
      </header>

      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-max gap-6">
          {project.columns.map((column) => (
            <KanbanColumn
              key={column.id}
              projectId={project.id}
              column={column}
              activeCard={activeCard}
              previewDestination={previewDestination}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function KanbanColumn({
  projectId,
  column,
  activeCard,
  previewDestination,
}: {
  projectId: string
  column: ColumnWithTasks
  activeCard: CardDragData | null
  previewDestination: Destination | null
}) {
  const columnRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const element = columnRef.current

    if (!element) {
      return
    }

    return dropTargetForElements({
      element,
      getData: () => ({ type: 'column', projectId, columnId: column.id } satisfies ColumnDropData),
    })
  }, [projectId, column.id])

  const previewPlacement = useMemo(() => getPreviewPlacement(column.id, previewDestination), [column.id, previewDestination])
  const isDropTargetColumn = Boolean(previewDestination && previewDestination.columnId === column.id)

  return (
    <div
      className={`flex w-72 shrink-0 flex-col gap-4 rounded-2xl border bg-slate-900/60 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.45)] transition ${
        isDropTargetColumn ? 'border-indigo-400/70 ring-2 ring-indigo-400/40' : 'border-slate-800/60'
      }`}
    >
      <header className="flex items-center justify-between gap-2 text-slate-200">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em]">{column.title}</h3>
        <span className="rounded-full border border-slate-800/60 bg-slate-950/70 px-2 py-0.5 text-xs text-slate-400">
          {column.tasks.length}
        </span>
      </header>
      <div ref={columnRef} className="flex flex-1 flex-col gap-3">
        {column.tasks.map((task) => (
          <TaskItem
            key={task.id}
            projectId={projectId}
            columnId={column.id}
            task={task}
            activeCard={activeCard}
            previewPlacement={previewPlacement}
          />
        ))}
        {previewPlacement && previewPlacement.type === 'column-end' && <DropIndicator />}
      </div>
    </div>
  )
}

function TaskItem({
  projectId,
  columnId,
  task,
  activeCard,
  previewPlacement,
}: {
  projectId: string
  columnId: string
  task: TaskRecord
  activeCard: CardDragData | null
  previewPlacement: PreviewPlacement | null
}) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const element = ref.current

    if (!element) {
      return
    }

    return combine(
      draggable({
        element,
        getInitialData: () => ({
          type: 'card',
          projectId,
          columnId,
          taskId: task.id,
        } satisfies CardDragData),
      }),
      dropTargetForElements({
        element,
        getData: () => ({
          type: 'card',
          projectId,
          columnId,
          taskId: task.id,
        } satisfies CardDragData),
      }),
    )
  }, [projectId, columnId, task.id])

  const isActive = Boolean(activeCard && activeCard.taskId === task.id)
  const showBefore = Boolean(previewPlacement && previewPlacement.type === 'before-card' && previewPlacement.taskId === task.id)
  const showAfter = Boolean(previewPlacement && previewPlacement.type === 'after-card' && previewPlacement.taskId === task.id)

  return (
    <div className="flex flex-col gap-3">
      {showBefore && <DropIndicator />}
      <div
        ref={ref}
        className={`group cursor-grab rounded-xl border p-4 text-left shadow transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/80 ${
          isActive
            ? 'border-indigo-400/80 bg-indigo-500/20 opacity-70 shadow-[0_16px_45px_rgba(99,102,241,0.35)]'
            : 'border-slate-800/70 bg-slate-950/50 shadow-[0_16px_45px_rgba(15,23,42,0.45)] hover:border-indigo-400/70'
        }`}
      >
        <p className="text-sm font-semibold text-slate-100">{task.title}</p>
        <p className="mt-2 text-xs leading-relaxed text-slate-300">{task.description}</p>
      </div>
      {showAfter && <DropIndicator />}
    </div>
  )
}

function DropIndicator() {
  return <div className="h-3 rounded-lg border border-dashed border-indigo-400/70 bg-indigo-400/10" />
}

function getPreviewPlacement(columnId: string, destination: Destination | null): PreviewPlacement | null {
  if (!destination || destination.columnId !== columnId) {
    return null
  }

  if (destination.type === 'column') {
    return { type: 'column-end' }
  }

  return destination.indexOffset === 1
    ? { type: 'after-card', taskId: destination.taskId }
    : { type: 'before-card', taskId: destination.taskId }
}

async function moveTaskInDatabase(source: CardDragData, destination: Destination) {
  if (destination.projectId !== source.projectId) {
    return
  }

  await db.transaction('rw', db.tasks, async () => {
    const task = await db.tasks.get(source.taskId)

    if (!task) {
      return
    }

    const sourceColumnId = task.columnId
    const sourceTasks = await db.tasks.where('columnId').equals(sourceColumnId).sortBy('position')
    const remainingSource = sourceTasks.filter((record) => record.id !== task.id)

    const destinationTasks =
      destination.columnId === sourceColumnId
        ? [...remainingSource]
        : await db.tasks.where('columnId').equals(destination.columnId).sortBy('position')

    const movingTask: TaskRecord = {
      ...task,
      columnId: destination.columnId,
    }

    let insertIndex: number

    if (destination.type === 'card') {
      const targetIndex = destinationTasks.findIndex((candidate) => candidate.id === destination.taskId)
      insertIndex = targetIndex === -1 ? destinationTasks.length : destination.indexOffset === 1 ? targetIndex + 1 : targetIndex
    } else {
      insertIndex = destinationTasks.length
    }

    destinationTasks.splice(insertIndex, 0, movingTask)

    const updatedRecords: TaskRecord[] = destinationTasks.map((record, index) => ({
      ...record,
      columnId: destination.columnId,
      position: index,
    }))

    if (destination.columnId !== sourceColumnId) {
      updatedRecords.push(
        ...remainingSource.map((record, index) => ({
          ...record,
          columnId: sourceColumnId,
          position: index,
        })),
      )
    }

    await db.tasks.bulkPut(updatedRecords)
  })
}

function getDestination(dropTargets: DropTargetRecord[], pointerY: number, projectId: string): Destination | null {
  const cardTarget = findCardTarget(dropTargets, projectId)

  if (cardTarget) {
    const element = cardTarget.element as HTMLElement
    const rect = element.getBoundingClientRect()
    const isAfter = Number.isFinite(pointerY) ? pointerY > rect.top + rect.height / 2 : false

    return {
      type: 'card',
      projectId,
      columnId: cardTarget.data.columnId,
      taskId: cardTarget.data.taskId,
      indexOffset: isAfter ? 1 : 0,
    }
  }

  const columnTarget = dropTargets.find((target) => isColumnDropData(target.data, projectId))

  if (columnTarget) {
    const data = columnTarget.data as ColumnDropData

    return {
      type: 'column',
      projectId,
      columnId: data.columnId,
    }
  }

  return null
}

function findCardTarget(
  dropTargets: DropTargetRecord[],
  projectId: string,
): { data: CardDragData; element: Element } | null {
  for (const target of dropTargets) {
    if (isCardDropData(target.data, projectId)) {
      return { data: target.data as CardDragData, element: target.element }
    }
  }

  return null
}

function isCardDragData(value: unknown): value is CardDragData {
  if (!value || typeof value !== 'object') {
    return false
  }

  const record = value as Record<string, unknown>

  return (
    record.type === 'card' &&
    typeof record.projectId === 'string' &&
    typeof record.columnId === 'string' &&
    typeof record.taskId === 'string'
  )
}

function isCardDropData(value: unknown, projectId: string): value is CardDragData {
  if (!isCardDragData(value)) {
    return false
  }

  return value.projectId === projectId
}

function isColumnDropData(value: unknown, projectId: string): value is ColumnDropData {
  if (!value || typeof value !== 'object') {
    return false
  }

  const record = value as Record<string, unknown>

  return record.type === 'column' && record.projectId === projectId && typeof record.columnId === 'string'
}

export default KanbanBoard
