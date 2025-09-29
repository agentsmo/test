import { useEffect, useRef, useState } from 'react'

import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import type { DropTargetRecord } from '@atlaskit/pragmatic-drag-and-drop/types'

type Task = {
  id: string
  title: string
  description: string
}

type Column = {
  id: string
  title: string
  tasks: Task[]
}

type Project = {
  id: string
  name: string
  summary: string
  columns: Column[]
}

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

type ActiveCard = {
  projectId: string
  taskId: string
} | null

const initialProjects: Project[] = [
  {
    id: 'marketing-site',
    name: 'Atlas Marketing Site',
    summary: 'Launch the refreshed brand experience for the Atlas product line.',
    columns: [
      {
        id: 'marketing-site-backlog',
        title: 'Backlog',
        tasks: [
          {
            id: 'marketing-site-backlog-brief',
            title: 'Finalize creative brief',
            description: 'Confirm copy pillars, tone, and approval workflow with the stakeholders.',
          },
          {
            id: 'marketing-site-backlog-assets',
            title: 'Collect product assets',
            description: 'Gather feature screenshots and update the illustration pack for the redesign.',
          },
        ],
      },
      {
        id: 'marketing-site-progress',
        title: 'In progress',
        tasks: [
          {
            id: 'marketing-site-progress-wireframe',
            title: 'Desktop wireframes',
            description: 'Build responsive wireframes for the home page hero and feature rows.',
          },
          {
            id: 'marketing-site-progress-qa',
            title: 'Content QA',
            description: 'Review the messaging for consistency with the positioning doc.',
          },
        ],
      },
      {
        id: 'marketing-site-done',
        title: 'Done',
        tasks: [
          {
            id: 'marketing-site-done-audit',
            title: 'Accessibility audit',
            description: 'Run automated checks and fix color contrast issues before launch.',
          },
        ],
      },
    ],
  },
  {
    id: 'mobile-app',
    name: 'Mobile App 2.0',
    summary: 'Ship the revamped mobile onboarding with project quick-start templates.',
    columns: [
      {
        id: 'mobile-app-backlog',
        title: 'Ideas',
        tasks: [
          {
            id: 'mobile-app-backlog-survey',
            title: 'Analyze onboarding survey',
            description: 'Review friction points called out by the beta cohort to identify gaps.',
          },
        ],
      },
      {
        id: 'mobile-app-progress',
        title: 'Building',
        tasks: [
          {
            id: 'mobile-app-progress-sso',
            title: 'Implement SSO sign-in',
            description: 'Hook into the identity service and add telemetry around failures.',
          },
          {
            id: 'mobile-app-progress-walkthrough',
            title: 'Interactive walkthrough',
            description: 'Prototype the multi-step tutorial with analytics checkpoints.',
          },
        ],
      },
      {
        id: 'mobile-app-review',
        title: 'Review',
        tasks: [
          {
            id: 'mobile-app-review-copy',
            title: 'Copy review',
            description: 'Run final copy deck by legal and localization teams.',
          },
        ],
      },
      {
        id: 'mobile-app-done',
        title: 'Done',
        tasks: [
          {
            id: 'mobile-app-done-hand-off',
            title: 'Hand-off to release train',
            description: 'Provide release notes, experiment toggles, and QA checklist.',
          },
        ],
      },
    ],
  },
]

function App() {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [activeCard, setActiveCard] = useState<ActiveCard>(null)

  useEffect(() => {
    return monitorForElements({
      onDragStart({ source }) {
        if (isCardDragData(source.data)) {
          setActiveCard({ projectId: source.data.projectId, taskId: source.data.taskId })
        }
      },
      onDrop({ location, source }) {
        const data = source.data

        if (!isCardDragData(data)) {
          setActiveCard(null)
          return
        }

        const pointerY = location.current.input.clientY
        const destination = getDestination(location.current.dropTargets, pointerY, data.projectId)

        if (!destination) {
          setActiveCard(null)
          return
        }

        setProjects((current) => moveCard(current, data, destination))
        setActiveCard(null)
      },
    })
  }, [])

  return (
    <main className="min-h-screen w-full bg-slate-950 pb-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-14">
        <header className="space-y-4 text-slate-100">
          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-800/80 bg-slate-900/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
            Project workspace
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Team boards</h1>
            <p className="max-w-xl text-sm text-slate-300 sm:text-base">
              Explore a Trello-style kanban built with pragmatic-drag-and-drop. Drag cards between lists to
              reorder work or hand work off to the next stage.
            </p>
          </div>
        </header>

        <div className="flex flex-col gap-14">
          {projects.map((project) => (
            <section
              key={project.id}
              className="space-y-6 rounded-3xl border border-slate-800/60 bg-slate-900/40 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.45)] backdrop-blur"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold text-slate-50">{project.name}</h2>
                  <p className="text-sm text-slate-300 sm:text-base">{project.summary}</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  <span className="rounded-full border border-slate-800/80 bg-slate-950/70 px-3 py-1">Kanban</span>
                  <span className="rounded-full border border-slate-800/80 bg-slate-950/70 px-3 py-1">Drag &amp; drop</span>
                </div>
              </div>

              <div className="overflow-x-auto pb-1">
                <div className="flex min-w-max gap-6">
                  {project.columns.map((column) => (
                    <KanbanColumn key={column.id} projectId={project.id} column={column} activeCard={activeCard} />
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}

type KanbanColumnProps = {
  projectId: string
  column: Column
  activeCard: ActiveCard
}

function KanbanColumn({ projectId, column, activeCard }: KanbanColumnProps) {
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

  return (
    <div className="flex w-72 shrink-0 flex-col gap-4 rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.45)]">
      <header className="flex items-center justify-between gap-2 text-slate-200">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em]">{column.title}</h3>
        <span className="rounded-full border border-slate-800/60 bg-slate-950/70 px-2 py-0.5 text-xs text-slate-400">
          {column.tasks.length}
        </span>
      </header>
      <div ref={columnRef} className="flex flex-1 flex-col gap-3">
        {column.tasks.map((task) => (
          <TaskCard
            key={task.id}
            projectId={projectId}
            columnId={column.id}
            task={task}
            isActive={Boolean(activeCard && activeCard.projectId === projectId && activeCard.taskId === task.id)}
          />
        ))}
      </div>
    </div>
  )
}

type TaskCardProps = {
  projectId: string
  columnId: string
  task: Task
  isActive: boolean
}

function TaskCard({ projectId, columnId, task, isActive }: TaskCardProps) {
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

  return (
    <div
      ref={ref}
      className={`group cursor-grab rounded-xl border p-4 text-left shadow transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/80 ${
        isActive
          ? 'border-indigo-400/80 bg-indigo-500/20 shadow-[0_16px_45px_rgba(99,102,241,0.35)]'
          : 'border-slate-800/70 bg-slate-950/50 shadow-[0_16px_45px_rgba(15,23,42,0.45)] hover:border-indigo-400/70'
      }`}
    >
      <p className="text-sm font-semibold text-slate-100">{task.title}</p>
      <p className="mt-2 text-xs leading-relaxed text-slate-300">{task.description}</p>
    </div>
  )
}

function moveCard(projects: Project[], source: CardDragData, destination: Destination) {
  if (destination.projectId !== source.projectId) {
    return projects
  }

  let hasMutated = false

  const updated = projects.map((project) => {
    if (project.id !== source.projectId) {
      return project
    }

    const columns = project.columns.map((column) => ({
      ...column,
      tasks: column.tasks.slice(),
    }))

    const sourceColumnIndex = columns.findIndex((column) => column.id === source.columnId)

    if (sourceColumnIndex === -1) {
      return project
    }

    const sourceColumn = columns[sourceColumnIndex]
    const taskIndex = sourceColumn.tasks.findIndex((task) => task.id === source.taskId)

    if (taskIndex === -1) {
      return project
    }

    if (
      destination.type === 'card' &&
      destination.columnId === source.columnId &&
      destination.taskId === source.taskId
    ) {
      return project
    }

    const [task] = sourceColumn.tasks.splice(taskIndex, 1)

    if (!task) {
      return project
    }

    if (destination.type === 'card') {
      const targetColumnIndex = columns.findIndex((column) => column.id === destination.columnId)

      if (targetColumnIndex === -1) {
        return project
      }

      const targetColumn = columns[targetColumnIndex]
      const rawIndex = targetColumn.tasks.findIndex((candidate) => candidate.id === destination.taskId)

      if (rawIndex === -1) {
        targetColumn.tasks.push(task)
        hasMutated = true
        return { ...project, columns }
      }

      const isSameColumn = destination.columnId === source.columnId
      let insertIndex = destination.indexOffset === 1 ? rawIndex + 1 : rawIndex

      if (isSameColumn && taskIndex < insertIndex) {
        insertIndex -= 1
      }

      targetColumn.tasks.splice(insertIndex, 0, task)
      hasMutated = true
      return { ...project, columns }
    }

    const targetColumnIndex = columns.findIndex((column) => column.id === destination.columnId)

    if (targetColumnIndex === -1) {
      return project
    }

    columns[targetColumnIndex].tasks.push(task)
    hasMutated = true
    return { ...project, columns }
  })

  return hasMutated ? updated : projects
}

function getDestination(
  dropTargets: DropTargetRecord[],
  pointerY: number,
  projectId: string,
): Destination | null {
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

export default App
