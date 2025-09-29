import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="flex min-h-full w-full flex-col items-center justify-center px-4 py-16 text-center">
      <div className="space-y-6">
        <span className="text-7xl font-bold text-indigo-400">404</span>
        <h1 className="text-3xl font-semibold text-slate-100">Page not found</h1>
        <p className="mx-auto max-w-md text-sm text-slate-400">
          The page you are looking for doesn&apos;t exist or has been moved. Use the navigation to get back on track.
        </p>
        <Link
          className="inline-flex items-center justify-center rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-400"
          to="/"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}

export default NotFound
