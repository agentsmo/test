import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'

type Project = {
  id: string
  name: string
  description: string
  stateId: string
  archived: boolean
  updatedAt: string
}

type ProjectForm = {
  name: string
  description: string
  stateId: string
}

type ProjectDraft = {
  id: string
  name: string
  description: string
  stateId: string
  archived: boolean
}

type ProjectState = {
  id: string
  name: string
}

const defaultStates: ProjectState[] = [
  { id: 'backlog', name: 'Backlog' },
  { id: 'in-progress', name: 'In Progress' },
  { id: 'review', name: 'Review' },
  { id: 'done', name: 'Done' },
]

const generateId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 11)

const formatTimestamp = (value: string) =>
  new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))

function App() {
  const [states, setStates] = useState<ProjectState[]>(defaultStates)
  const [newStateName, setNewStateName] = useState('')
  const [stateError, setStateError] = useState('')
  const [editingStateId, setEditingStateId] = useState<string | null>(null)
  const [stateDraftName, setStateDraftName] = useState('')

  const [projects, setProjects] = useState<Project[]>([])
  const [projectForm, setProjectForm] = useState<ProjectForm>(() => ({
    name: '',
    description: '',
    stateId: defaultStates[0]?.id ?? '',
  }))
  const [projectError, setProjectError] = useState('')
  const [editingProject, setEditingProject] = useState<ProjectDraft | null>(null)
  const [editingProjectError, setEditingProjectError] = useState('')

  const activeProjects = useMemo(
    () => projects.filter((project) => !project.archived),
    [projects],
  )
  const archivedProjects = useMemo(
    () => projects.filter((project) => project.archived),
    [projects],
  )
  const projectCountByState = useMemo(() => {
    const counts: Record<string, number> = {}

    for (const project of activeProjects) {
      counts[project.stateId] = (counts[project.stateId] ?? 0) + 1
    }

    return counts
  }, [activeProjects])

  const handleProjectSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedName = projectForm.name.trim()

    if (!trimmedName) {
      setProjectError('A project needs a name before it can be tracked.')
      return
    }

    if (!projectForm.stateId) {
      setProjectError('Choose a state for the project to help everyone stay aligned.')
      return
    }

    const timestamp = new Date().toISOString()

    setProjects((previous) => [
      {
        id: generateId(),
        name: trimmedName,
        description: projectForm.description.trim(),
        stateId: projectForm.stateId,
        archived: false,
        updatedAt: timestamp,
      },
      ...previous,
    ])

    setProjectForm({
      name: '',
      description: '',
      stateId: states[0]?.id ?? '',
    })

    setProjectError('')
  }

  const startProjectEdit = (project: Project) => {
    setEditingProject({
      id: project.id,
      name: project.name,
      description: project.description,
      stateId: project.stateId,
      archived: project.archived,
    })
    setEditingProjectError('')
  }

  const cancelProjectEdit = () => {
    setEditingProject(null)
    setEditingProjectError('')
  }

  const saveProjectEdit = () => {
    if (!editingProject) {
      return
    }

    const trimmedName = editingProject.name.trim()

    if (!trimmedName) {
      setEditingProjectError('Projects must have a clear, descriptive name.')
      return
    }

    if (!editingProject.stateId) {
      setEditingProjectError('Every project should live in a state to stay discoverable.')
      return
    }

    const timestamp = new Date().toISOString()

    setProjects((previous) =>
      previous.map((project) =>
        project.id === editingProject.id
          ? {
              ...project,
              name: trimmedName,
              description: editingProject.description.trim(),
              stateId: editingProject.stateId,
              archived: editingProject.archived,
              updatedAt: timestamp,
            }
          : project,
      ),
    )

    setEditingProject(null)
    setEditingProjectError('')
  }

  const archiveProject = (projectId: string) => {
    const timestamp = new Date().toISOString()

    setProjects((previous) =>
      previous.map((project) =>
        project.id === projectId
          ? {
              ...project,
              archived: true,
              updatedAt: timestamp,
            }
          : project,
      ),
    )
  }

  const restoreProject = (projectId: string) => {
    const timestamp = new Date().toISOString()

    setProjects((previous) =>
      previous.map((project) =>
        project.id === projectId
          ? {
              ...project,
              archived: false,
              updatedAt: timestamp,
            }
          : project,
      ),
    )
  }

  const handleStateSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedName = newStateName.trim()

    if (!trimmedName) {
      setStateError('State names cannot be empty.')
      return
    }

    if (states.some((state) => state.name.toLowerCase() === trimmedName.toLowerCase())) {
      setStateError('That state already exists. Try a different name that communicates its purpose.')
      return
    }

    const id = generateId()

    setStates((previous) => [...previous, { id, name: trimmedName }])
    setNewStateName('')
    setStateError('')

    setProjectForm((previous) => ({
      ...previous,
      stateId: previous.stateId || id,
    }))
  }

  const startStateEdit = (state: ProjectState) => {
    setEditingStateId(state.id)
    setStateDraftName(state.name)
    setStateError('')
  }

  const cancelStateEdit = () => {
    setEditingStateId(null)
    setStateDraftName('')
    setStateError('')
  }

  const saveStateEdit = () => {
    if (!editingStateId) {
      return
    }

    const trimmedName = stateDraftName.trim()

    if (!trimmedName) {
      setStateError('Give the state a short, meaningful name.')
      return
    }

    if (
      states.some(
        (state) => state.id !== editingStateId && state.name.toLowerCase() === trimmedName.toLowerCase(),
      )
    ) {
      setStateError('Another state already uses that name.')
      return
    }

    setStates((previous) =>
      previous.map((state) =>
        state.id === editingStateId
          ? {
              ...state,
              name: trimmedName,
            }
          : state,
      ),
    )

    setEditingStateId(null)
    setStateDraftName('')
    setStateError('')
  }

  const getStateName = (stateId: string) =>
    states.find((state) => state.id === stateId)?.name ?? 'Unknown state'

  return (
    <main className="min-h-screen bg-slate-950 py-12 text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4">
        <header className="flex flex-col gap-3 text-center sm:text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-indigo-300">
            Project control center
          </p>
          <h1 className="text-4xl font-semibold sm:text-5xl">Bring clarity to every initiative</h1>
          <p className="text-base text-slate-300 sm:text-lg">
            Capture new projects, update their details, and keep a living archive so no context is ever truly
            lost. Curate the states that reflect how your team ships work.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <section className="space-y-6">
            <div className="rounded-3xl border border-slate-800/70 bg-slate-900/60 p-6 shadow-xl shadow-indigo-900/20">
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-semibold">Create a project</h2>
                <p className="text-sm text-slate-400">
                  Describe what you&apos;re working on and where it lives in your delivery process.
                </p>
              </div>

              <form className="mt-6 space-y-4" onSubmit={handleProjectSubmit}>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-200" htmlFor="project-name">
                    Project name
                  </label>
                  <input
                    id="project-name"
                    className="rounded-xl border border-slate-700 bg-slate-950/40 px-4 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
                    placeholder="e.g. Marketing site refresh"
                    value={projectForm.name}
                    onChange={(event) =>
                      setProjectForm((previous) => ({ ...previous, name: event.target.value }))
                    }
                    type="text"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-200" htmlFor="project-description">
                    Project summary
                  </label>
                  <textarea
                    id="project-description"
                    className="h-28 rounded-xl border border-slate-700 bg-slate-950/40 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
                    placeholder="Outline the scope, stakeholders, or goals so collaborators understand the intent."
                    value={projectForm.description}
                    onChange={(event) =>
                      setProjectForm((previous) => ({ ...previous, description: event.target.value }))
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-200" htmlFor="project-state">
                    Current state
                  </label>
                  <select
                    id="project-state"
                    className="rounded-xl border border-slate-700 bg-slate-950/40 px-4 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30 disabled:opacity-50"
                    value={projectForm.stateId}
                    onChange={(event) =>
                      setProjectForm((previous) => ({ ...previous, stateId: event.target.value }))
                    }
                    disabled={states.length === 0}
                  >
                    {states.map((state) => (
                      <option key={state.id} value={state.id}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>

                {projectError ? (
                  <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                    {projectError}
                  </p>
                ) : null}

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-400">
                    Projects move to the archive instead of being deleted, so your history stays intact.
                  </p>
                  <button
                    className="inline-flex items-center justify-center rounded-full bg-indigo-500 px-6 py-2 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
                    type="submit"
                  >
                    Add project
                  </button>
                </div>
              </form>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Active projects</h2>
                <span className="text-sm text-slate-400">
                  {activeProjects.length} {activeProjects.length === 1 ? 'project' : 'projects'}
                </span>
              </div>

              <div className="grid gap-4">
                {activeProjects.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 px-6 py-12 text-center text-sm text-slate-400">
                    No projects yet. Capture your first initiative to kick things off.
                  </div>
                ) : (
                  activeProjects.map((project) => {
                    const isEditing = editingProject?.id === project.id

                    return (
                      <article
                        key={project.id}
                        className="group relative overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-900/70 p-6 transition hover:border-indigo-400/60 hover:bg-slate-900"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/0 via-indigo-400/0 to-indigo-400/10 opacity-0 transition group-hover:opacity-100" />
                        <div className="relative flex flex-col gap-4">
                          {isEditing ? (
                            <div className="space-y-4">
                              <div className="grid gap-2">
                                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400" htmlFor={`edit-name-${project.id}`}>
                                  Project name
                                </label>
                                <input
                                  id={`edit-name-${project.id}`}
                                  className="rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
                                  value={editingProject?.name ?? ''}
                                  onChange={(event) =>
                                    setEditingProject((previous) =>
                                      previous
                                        ? { ...previous, name: event.target.value }
                                        : previous,
                                    )
                                  }
                                />
                              </div>

                              <div className="grid gap-2">
                                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400" htmlFor={`edit-description-${project.id}`}>
                                  Summary
                                </label>
                                <textarea
                                  id={`edit-description-${project.id}`}
                                  className="h-28 rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
                                  value={editingProject?.description ?? ''}
                                  onChange={(event) =>
                                    setEditingProject((previous) =>
                                      previous
                                        ? { ...previous, description: event.target.value }
                                        : previous,
                                    )
                                  }
                                />
                              </div>

                              <div className="grid gap-2">
                                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400" htmlFor={`edit-state-${project.id}`}>
                                  State
                                </label>
                                <select
                                  id={`edit-state-${project.id}`}
                                  className="rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
                                  value={editingProject?.stateId ?? ''}
                                  onChange={(event) =>
                                    setEditingProject((previous) =>
                                      previous
                                        ? { ...previous, stateId: event.target.value }
                                        : previous,
                                    )
                                  }
                                >
                                  {states.map((state) => (
                                    <option key={state.id} value={state.id}>
                                      {state.name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {editingProjectError ? (
                                <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                                  {editingProjectError}
                                </p>
                              ) : null}

                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-xs text-slate-400">
                                  Last updated {formatTimestamp(project.updatedAt)}
                                </p>
                                <div className="flex items-center gap-2">
                                  <button
                                    className="inline-flex items-center justify-center rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:border-slate-500 hover:text-white"
                                    onClick={cancelProjectEdit}
                                    type="button"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    className="inline-flex items-center justify-center rounded-full bg-indigo-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-400"
                                    onClick={saveProjectEdit}
                                    type="button"
                                  >
                                    Save changes
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="space-y-2">
                                  <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-300">
                                    {getStateName(project.stateId)}
                                  </div>
                                  <h3 className="text-xl font-semibold">{project.name}</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    className="inline-flex items-center justify-center rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:border-slate-500 hover:text-white"
                                    onClick={() => startProjectEdit(project)}
                                    type="button"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="inline-flex items-center justify-center rounded-full bg-slate-800 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:bg-slate-700"
                                    onClick={() => archiveProject(project.id)}
                                    type="button"
                                  >
                                    Archive
                                  </button>
                                </div>
                              </div>
                              {project.description ? (
                                <p className="text-sm leading-relaxed text-slate-300">{project.description}</p>
                              ) : null}
                              <p className="text-xs text-slate-500">
                                Last updated {formatTimestamp(project.updatedAt)}
                              </p>
                            </div>
                          )}
                        </div>
                      </article>
                    )
                  })
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Archived projects</h2>
                <span className="text-sm text-slate-400">
                  {archivedProjects.length} {archivedProjects.length === 1 ? 'project' : 'projects'}
                </span>
              </div>

              <div className="grid gap-4">
                {archivedProjects.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 px-6 py-12 text-center text-sm text-slate-400">
                    Archived projects will gather here. Restore them at any time to bring them back into focus.
                  </div>
                ) : (
                  archivedProjects.map((project) => (
                    <article
                      key={project.id}
                      className="rounded-3xl border border-slate-800/70 bg-slate-950/40 p-6"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-2">
                          <div className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300">
                            {getStateName(project.stateId)}
                          </div>
                          <h3 className="text-xl font-semibold">{project.name}</h3>
                          {project.description ? (
                            <p className="text-sm leading-relaxed text-slate-400">{project.description}</p>
                          ) : null}
                          <p className="text-xs text-slate-500">
                            Archived {formatTimestamp(project.updatedAt)}
                          </p>
                        </div>
                        <button
                          className="inline-flex items-center justify-center rounded-full bg-indigo-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-400"
                          onClick={() => restoreProject(project.id)}
                          type="button"
                        >
                          Restore
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-800/70 bg-slate-900/60 p-6 shadow-xl shadow-indigo-900/20">
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-semibold">States</h2>
                <p className="text-sm text-slate-400">
                  Curate the labels that reflect how your team moves ideas forward.
                </p>
              </div>

              <form className="mt-6 space-y-3" onSubmit={handleStateSubmit}>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-200" htmlFor="new-state-name">
                    Add a state
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      id="new-state-name"
                      className="flex-1 rounded-xl border border-slate-700 bg-slate-950/40 px-4 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
                      placeholder="e.g. Ready for QA"
                      value={newStateName}
                      onChange={(event) => setNewStateName(event.target.value)}
                      type="text"
                    />
                    <button
                      className="inline-flex items-center justify-center rounded-full bg-indigo-500 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-400"
                      type="submit"
                    >
                      Add
                    </button>
                  </div>
                </div>
                {stateError && !editingStateId ? (
                  <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                    {stateError}
                  </p>
                ) : null}
              </form>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
                Current states
              </h3>

              <div className="space-y-3">
                {states.map((state) => {
                  const isEditing = editingStateId === state.id
                  const associatedProjects = projectCountByState[state.id] ?? 0

                  return (
                    <div
                      key={state.id}
                      className="rounded-2xl border border-slate-800/70 bg-slate-900/70 p-4 transition hover:border-indigo-400/60 hover:bg-slate-900"
                    >
                      {isEditing ? (
                        <div className="space-y-3">
                          <div className="grid gap-2">
                            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400" htmlFor={`edit-state-name-${state.id}`}>
                              State name
                            </label>
                            <input
                              id={`edit-state-name-${state.id}`}
                              className="rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
                              value={stateDraftName}
                              onChange={(event) => setStateDraftName(event.target.value)}
                            />
                          </div>

                          {stateError && isEditing ? (
                            <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                              {stateError}
                            </p>
                          ) : null}

                          <div className="flex items-center justify-end gap-2">
                            <button
                              className="inline-flex items-center justify-center rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:border-slate-500 hover:text-white"
                              onClick={cancelStateEdit}
                              type="button"
                            >
                              Cancel
                            </button>
                            <button
                              className="inline-flex items-center justify-center rounded-full bg-indigo-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-400"
                              onClick={saveStateEdit}
                              type="button"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-base font-semibold">{state.name}</p>
                            <p className="text-xs text-slate-400">
                              {associatedProjects} active {associatedProjects === 1 ? 'project' : 'projects'}
                            </p>
                          </div>
                          <button
                            className="inline-flex items-center justify-center rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:border-slate-500 hover:text-white"
                            onClick={() => startStateEdit(state)}
                            type="button"
                          >
                            Rename
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}

                {states.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 px-4 py-6 text-center text-sm text-slate-400">
                    States help everyone understand the journey of your projects. Add one to get started.
                  </p>
                ) : null}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}

export default App
