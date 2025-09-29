import type { ColumnRecord, ProjectRecord, TaskRecord } from './db'

export type InitialProject = ProjectRecord & {
  columns: Array<ColumnRecord & { tasks: TaskRecord[] }>
}

export const initialProjects: InitialProject[] = [
  {
    id: 'marketing-site',
    name: 'Atlas Marketing Site',
    summary: 'Launch the refreshed brand experience for the Atlas product line.',
    columns: [
      {
        id: 'marketing-site-backlog',
        projectId: 'marketing-site',
        title: 'Backlog',
        position: 0,
        tasks: [
          {
            id: 'marketing-site-backlog-brief',
            projectId: 'marketing-site',
            columnId: 'marketing-site-backlog',
            title: 'Finalize creative brief',
            description: 'Confirm copy pillars, tone, and approval workflow with the stakeholders.',
            position: 0,
          },
          {
            id: 'marketing-site-backlog-assets',
            projectId: 'marketing-site',
            columnId: 'marketing-site-backlog',
            title: 'Collect product assets',
            description: 'Gather feature screenshots and update the illustration pack for the redesign.',
            position: 1,
          },
        ],
      },
      {
        id: 'marketing-site-progress',
        projectId: 'marketing-site',
        title: 'In progress',
        position: 1,
        tasks: [
          {
            id: 'marketing-site-progress-wireframe',
            projectId: 'marketing-site',
            columnId: 'marketing-site-progress',
            title: 'Desktop wireframes',
            description: 'Build responsive wireframes for the home page hero and feature rows.',
            position: 0,
          },
          {
            id: 'marketing-site-progress-qa',
            projectId: 'marketing-site',
            columnId: 'marketing-site-progress',
            title: 'Content QA',
            description: 'Review the messaging for consistency with the positioning doc.',
            position: 1,
          },
        ],
      },
      {
        id: 'marketing-site-done',
        projectId: 'marketing-site',
        title: 'Done',
        position: 2,
        tasks: [
          {
            id: 'marketing-site-done-audit',
            projectId: 'marketing-site',
            columnId: 'marketing-site-done',
            title: 'Accessibility audit',
            description: 'Run automated checks and fix color contrast issues before launch.',
            position: 0,
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
        projectId: 'mobile-app',
        title: 'Ideas',
        position: 0,
        tasks: [
          {
            id: 'mobile-app-backlog-survey',
            projectId: 'mobile-app',
            columnId: 'mobile-app-backlog',
            title: 'Analyze onboarding survey',
            description: 'Review friction points called out by the beta cohort to identify gaps.',
            position: 0,
          },
        ],
      },
      {
        id: 'mobile-app-progress',
        projectId: 'mobile-app',
        title: 'Building',
        position: 1,
        tasks: [
          {
            id: 'mobile-app-progress-sso',
            projectId: 'mobile-app',
            columnId: 'mobile-app-progress',
            title: 'Implement SSO sign-in',
            description: 'Hook into the identity service and add telemetry around failures.',
            position: 0,
          },
          {
            id: 'mobile-app-progress-walkthrough',
            projectId: 'mobile-app',
            columnId: 'mobile-app-progress',
            title: 'Interactive walkthrough',
            description: 'Prototype the multi-step tutorial with analytics checkpoints.',
            position: 1,
          },
        ],
      },
      {
        id: 'mobile-app-review',
        projectId: 'mobile-app',
        title: 'Review',
        position: 2,
        tasks: [
          {
            id: 'mobile-app-review-copy',
            projectId: 'mobile-app',
            columnId: 'mobile-app-review',
            title: 'Copy review',
            description: 'Run final copy deck by legal and localization teams.',
            position: 0,
          },
        ],
      },
      {
        id: 'mobile-app-done',
        projectId: 'mobile-app',
        title: 'Done',
        position: 3,
        tasks: [
          {
            id: 'mobile-app-done-hand-off',
            projectId: 'mobile-app',
            columnId: 'mobile-app-done',
            title: 'Hand-off to release train',
            description: 'Provide release notes, experiment toggles, and QA checklist.',
            position: 0,
          },
        ],
      },
    ],
  },
]
