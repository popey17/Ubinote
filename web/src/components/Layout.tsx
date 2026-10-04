import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { BrandMark } from './BrandMark'
import { ThemeToggle } from './ThemeToggle'

export function Layout() {
  const { logout } = useAuth()

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          <BrandMark />
        </Link>
        <div className="topbar-actions">
          <ThemeToggle />
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              void logout()
            }}
          >
            Log out
          </button>
        </div>
      </header>
      <main className="page">
        <Outlet />
      </main>
    </div>
  )
}
