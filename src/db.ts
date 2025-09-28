import Dexie, { type Table } from 'dexie'

export interface Task {
  id: string
  content: string
  columnId: string
  createdAt: number
}

export interface Column {
  id: string
  title: string
  taskIds: string[]
  createdAt: number
}

export interface Project {
  id: string
  name: string
  createdAt: number
  columnOrder: string[]
  columns: Record<string, Column>
  tasks: Record<string, Task>
}

class KanbanDatabase extends Dexie {
  projects!: Table<Project, string>

  constructor() {
    super('kanban-workspace')
    this.version(1).stores({
      projects: 'id, name, createdAt',
    })
  }
}

export const db = new KanbanDatabase()

export function createColumn(title: string): Column {
  return {
    id: crypto.randomUUID(),
    title,
    taskIds: [],
    createdAt: Date.now(),
  }
}

export function createTask(content: string, columnId: string): Task {
  return {
    id: crypto.randomUUID(),
    content,
    columnId,
    createdAt: Date.now(),
  }
}

export function createProjectTemplate(name: string): Project {
  const todo = createColumn('To do')
  const doing = createColumn('In progress')
  const done = createColumn('Done')

  return {
    id: crypto.randomUUID(),
    name,
    createdAt: Date.now(),
    columnOrder: [todo.id, doing.id, done.id],
    columns: {
      [todo.id]: todo,
      [doing.id]: doing,
      [done.id]: done,
    },
    tasks: {},
  }
}
