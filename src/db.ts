import Dexie, { type Table } from 'dexie'

export type BoardColumnKey = 'backlog' | 'inProgress' | 'review' | 'done'

export interface Task {
  id?: number
  title: string
  description: string
  status: BoardColumnKey
  createdAt: number
  updatedAt: number
}

class TaskDatabase extends Dexie {
  tasks!: Table<Task, number>

  constructor() {
    super('task-board')
    this.version(1).stores({
      tasks: '++id, status, title, createdAt',
    })
  }
}

export const db = new TaskDatabase()
