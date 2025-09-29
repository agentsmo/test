import Dexie, { type Table } from 'dexie'

export type ProjectRecord = {
  id: string
  name: string
  summary: string
}

export type ColumnRecord = {
  id: string
  projectId: string
  title: string
  position: number
}

export type TaskRecord = {
  id: string
  projectId: string
  columnId: string
  title: string
  description: string
  position: number
}

export class KanbanDatabase extends Dexie {
  projects!: Table<ProjectRecord, string>
  columns!: Table<ColumnRecord, string>
  tasks!: Table<TaskRecord, string>

  constructor() {
    super('kanban-workspace')

    this.version(1).stores({
      projects: 'id',
      columns: 'id, projectId, position',
      tasks: 'id, projectId, columnId, position',
    })
  }
}

export const db = new KanbanDatabase()
