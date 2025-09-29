import { db } from './db'
import { initialProjects } from './initialData'

export async function ensureSeedData() {
  const projectCount = await db.projects.count()

  if (projectCount > 0) {
    return
  }

  const projectRecords = initialProjects.map(({ id, name, summary }) => ({ id, name, summary }))
  const columnRecords = initialProjects.flatMap((project) =>
    project.columns.map(({ id, projectId, title, position }) => ({ id, projectId, title, position })),
  )
  const taskRecords = initialProjects.flatMap((project) =>
    project.columns.flatMap((column) =>
      column.tasks.map(({ id, projectId, columnId, title, description, position }) => ({
        id,
        projectId,
        columnId,
        title,
        description,
        position,
      })),
    ),
  )

  await db.transaction('rw', db.projects, db.columns, db.tasks, async () => {
    await db.projects.bulkPut(projectRecords)
    await db.columns.bulkPut(columnRecords)
    await db.tasks.bulkPut(taskRecords)
  })
}
