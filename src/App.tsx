import { NavLink, Outlet } from 'react-router-dom'

const App = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-800/60 bg-slate-950/60 backdrop-blur">
        <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold tracking-tight text-slate-100">
            React + Vite + Tailwind
          </span>
          <div className="flex items-center gap-3 text-sm font-medium text-slate-300">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `rounded-full px-4 py-2 transition ${
                  isActive
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                    : 'hover:bg-slate-800/70 hover:text-slate-100'
                }`
              }
              end
            >
              Home
            </NavLink>
            <NavLink
              to="/resources"
              className={({ isActive }) =>
                `rounded-full px-4 py-2 transition ${
                  isActive
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                    : 'hover:bg-slate-800/70 hover:text-slate-100'
                }`
              }
            >
              Resources
            </NavLink>
          </div>
        </nav>
      </header>

      <main className="flex flex-1 justify-center">
        <Outlet />
      </main>
    </div>
  )
}

export default App
