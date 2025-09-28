import type { FormEvent } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DraggableProvided,
  type DraggableStateSnapshot,
  type DropResult,
  type DroppableProvided,
  type DroppableStateSnapshot,
} from 'react-beautiful-dnd'
import { useLiveQuery } from 'dexie-react-hooks'
import clsx from 'clsx'
import {
  type Column,
  type Task,
  createColumn,
  createProjectTemplate,
  createTask,
  db,
} from './db'

function App() {
  const projects = useLiveQuery(() => db.projects.orderBy('createdAt').toArray(), [])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [projectName, setProjectName] = useState('')

  useEffect(() => {
    if (projects && projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id)
    }
  }, [projects, selectedProjectId])

  const selectedProject = useMemo(
    () => projects?.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  )

  const handleCreateProject = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const trimmed = projectName.trim()
      if (!trimmed) return

      const project = createProjectTemplate(trimmed)
      await db.projects.put(project)
      setProjectName('')
      setSelectedProjectId(project.id)
    },
    [projectName],
  )

  const handleAddColumn = useCallback(async () => {
    if (!selectedProject) return
    const newColumn = createColumn('New state')
    const nextColumns = { ...selectedProject.columns, [newColumn.id]: newColumn }
    const nextOrder = [...selectedProject.columnOrder, newColumn.id]
    await db.projects.update(selectedProject.id, {
      columns: nextColumns,
      columnOrder: nextOrder,
    })
  }, [selectedProject])

  const handleRenameColumn = useCallback(
    async (columnId: string, title: string) => {
      if (!selectedProject) return
      const trimmed = title.trim() || 'Untitled'
      const current = selectedProject.columns[columnId]
      if (!current) return
      if (current.title === trimmed) return

      await db.projects.update(selectedProject.id, {
        columns: {
          ...selectedProject.columns,
          [columnId]: { ...current, title: trimmed },
        },
      })
    },
    [selectedProject],
  )

  const handleAddTask = useCallback(
    async (columnId: string, content: string) => {
      if (!selectedProject) return
      const column = selectedProject.columns[columnId]
      if (!column) return
      const trimmed = content.trim()
      if (!trimmed) return

      const task = createTask(trimmed, columnId)
      const nextTasks: Record<string, Task> = {
        ...selectedProject.tasks,
        [task.id]: task,
      }
      const nextColumns: Record<string, Column> = {
        ...selectedProject.columns,
        [columnId]: { ...column, taskIds: [...column.taskIds, task.id] },
      }

      await db.projects.update(selectedProject.id, {
        tasks: nextTasks,
        columns: nextColumns,
      })
    },
    [selectedProject],
  )

  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      if (!selectedProject) return
      const { destination, source, draggableId, type } = result

      if (!destination) {
        return
      }

      if (type === 'column') {
        const order = Array.from(selectedProject.columnOrder)
        order.splice(source.index, 1)
        order.splice(destination.index, 0, draggableId)
        await db.projects.update(selectedProject.id, { columnOrder: order })
        return
      }

      const startColumn = selectedProject.columns[source.droppableId]
      const finishColumn = selectedProject.columns[destination.droppableId]
      if (!startColumn || !finishColumn) return

      if (startColumn === finishColumn) {
        const nextTaskIds = Array.from(startColumn.taskIds)
        nextTaskIds.splice(source.index, 1)
        nextTaskIds.splice(destination.index, 0, draggableId)

        await db.projects.update(selectedProject.id, {
          columns: {
            ...selectedProject.columns,
            [startColumn.id]: { ...startColumn, taskIds: nextTaskIds },
          },
        })
        return
      }

      const startTaskIds = Array.from(startColumn.taskIds)
      startTaskIds.splice(source.index, 1)
      const finishTaskIds = Array.from(finishColumn.taskIds)
      finishTaskIds.splice(destination.index, 0, draggableId)

      const task = selectedProject.tasks[draggableId]
      const updatedTask: Task | undefined = task
        ? { ...task, columnId: finishColumn.id }
        : undefined

      await db.projects.update(selectedProject.id, {
        columns: {
          ...selectedProject.columns,
          [startColumn.id]: { ...startColumn, taskIds: startTaskIds },
          [finishColumn.id]: { ...finishColumn, taskIds: finishTaskIds },
        },
        ...(updatedTask && {
          tasks: {
            ...selectedProject.tasks,
            [draggableId]: updatedTask,
          },
        }),
      })
    },
    [selectedProject],
  )

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <aside className="flex w-full max-w-xs flex-col gap-6 border-r border-slate-800/60 bg-slate-950/70 p-6">
        <div>
          <h1 className="text-lg font-semibold text-slate-50">Projects</h1>
          <p className="mt-1 text-sm text-slate-400">
            Create a project to start organising tasks on its own kanban board.
          </p>
        </div>

        <form className="space-y-3" onSubmit={handleCreateProject}>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400" htmlFor="project-name">
              Project name
            </label>
            <input
              id="project-name"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
              placeholder="e.g. Marketing sprint"
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              type="text"
            />
          </div>
          <button
            className="w-full rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/70"
            type="submit"
          >
            Create project
          </button>
        </form>

        <div className="flex-1 space-y-2 overflow-y-auto">
          {projects?.map((project) => (
            <button
              key={project.id}
              onClick={() => setSelectedProjectId(project.id)}
              className={clsx(
                'w-full rounded-md px-3 py-2 text-left text-sm font-medium transition',
                selectedProjectId === project.id
                  ? 'bg-indigo-500/20 text-indigo-200'
                  : 'bg-slate-900 text-slate-200 hover:bg-slate-800',
              )}
              type="button"
            >
              <span className="block truncate">{project.name}</span>
              <span className="mt-1 block text-xs font-normal text-slate-400">
                {new Date(project.createdAt).toLocaleDateString()}
              </span>
            </button>
          ))}
          {projects?.length === 0 && (
            <p className="text-sm text-slate-500">No projects yet. Create one above to begin.</p>
          )}
        </div>
      </aside>

      <section className="flex-1 overflow-hidden">
        {selectedProject ? (
          <div className="flex h-full flex-col">
            <header className="flex items-center justify-between border-b border-slate-800/60 bg-slate-950/60 px-8 py-5">
              <div>
                <h2 className="text-2xl font-semibold text-slate-50">{selectedProject.name}</h2>
                <p className="text-sm text-slate-400">Drag tasks between states to keep work in sync.</p>
              </div>
              <button
                className="rounded-md border border-indigo-400/60 px-3 py-2 text-sm font-medium text-indigo-200 transition hover:bg-indigo-500/10"
                onClick={handleAddColumn}
                type="button"
              >
                Add state
              </button>
            </header>

            <div className="flex-1 overflow-x-auto">
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="board" direction="horizontal" type="column">
                  {(provided: DroppableProvided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex h-full min-h-0 w-full gap-4 overflow-x-auto px-8 py-6"
                    >
                      {selectedProject.columnOrder.map((columnId, index) => {
                        const column = selectedProject.columns[columnId]
                        if (!column) return null
                        const tasks = column.taskIds.map((taskId) => selectedProject.tasks[taskId]).filter(Boolean)

                        return (
                          <ColumnCard
                            key={column.id}
                            column={column}
                            index={index}
                            onAddTask={handleAddTask}
                            onRenameColumn={handleRenameColumn}
                            tasks={tasks as Task[]}
                          />
                        )
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-slate-400">
            <h2 className="text-xl font-semibold text-slate-200">Select or create a project</h2>
            <p className="max-w-md text-sm">
              Choose a project from the left or create a new one to manage its kanban board. Every project stores its own states
              and tasks locally with IndexedDB.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}

type ColumnCardProps = {
  column: Column
  index: number
  onRenameColumn: (columnId: string, title: string) => void
  onAddTask: (columnId: string, content: string) => void
  tasks: Task[]
}

function ColumnCard({ column, index, onRenameColumn, onAddTask, tasks }: ColumnCardProps) {
  const [title, setTitle] = useState(column.title)
  const [newTask, setNewTask] = useState('')

  useEffect(() => {
    setTitle(column.title)
  }, [column.title])

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const trimmed = newTask.trim()
      if (!trimmed) return
      onAddTask(column.id, trimmed)
      setNewTask('')
    },
    [column.id, newTask, onAddTask],
  )

  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided: DraggableProvided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="flex h-full w-72 flex-shrink-0 flex-col rounded-xl bg-slate-900/80 shadow-lg shadow-slate-950/40"
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-800/60 px-4 py-3">
            <input
              {...provided.dragHandleProps}
              className="w-full rounded-md bg-transparent text-sm font-semibold text-slate-100 focus:border focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              onBlur={() => onRenameColumn(column.id, title)}
            />
          </div>

          <Droppable droppableId={column.id} type="task">
            {(dropProvided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
              <div
                ref={dropProvided.innerRef}
                {...dropProvided.droppableProps}
                className={clsx(
                  'flex-1 space-y-3 overflow-y-auto px-4 py-4',
                  snapshot.isDraggingOver ? 'bg-slate-800/40' : 'bg-transparent',
                )}
              >
                {tasks.map((task, taskIndex) => (
                  <Draggable draggableId={task.id} index={taskIndex} key={task.id}>
                    {(taskProvided: DraggableProvided, taskSnapshot: DraggableStateSnapshot) => (
                      <div
                        ref={taskProvided.innerRef}
                        {...taskProvided.draggableProps}
                        {...taskProvided.dragHandleProps}
                        className={clsx(
                          'rounded-lg border border-slate-800/60 bg-slate-900 px-3 py-3 text-sm text-slate-200 shadow-sm transition',
                          taskSnapshot.isDragging && 'border-indigo-400/60 bg-slate-900/80 shadow-lg shadow-indigo-500/20',
                        )}
                      >
                        {task.content}
                      </div>
                    )}
                  </Draggable>
                ))}
                {dropProvided.placeholder}
              </div>
            )}
          </Droppable>

          <form onSubmit={handleSubmit} className="border-t border-slate-800/60 px-4 py-3">
            <label className="sr-only" htmlFor={`new-task-${column.id}`}>
              Add task
            </label>
            <input
              id={`new-task-${column.id}`}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
              placeholder="Add new task"
              value={newTask}
              onChange={(event) => setNewTask(event.target.value)}
              type="text"
            />
            <button
              className="mt-2 w-full rounded-md bg-slate-800 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:bg-slate-700"
              type="submit"
            >
              Add task
            </button>
          </form>
        </div>
      )}
    </Draggable>
  )
}

export default App
