import { useTheme } from '../theme/ThemeContext'

function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0-5a1 1 0 0 1 1 1v1.5a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Zm0 16.5a1 1 0 0 1 1 1V22a1 1 0 1 1-2 0v-1.5a1 1 0 0 1 1-1ZM3 11a1 1 0 1 0 0 2h1.5a1 1 0 1 0 0-2H3Zm16.5 0a1 1 0 1 0 0 2H21a1 1 0 1 0 0-2h-1.5ZM5.64 4.22a1 1 0 0 0 0 1.41l1.06 1.06a1 1 0 1 0 1.41-1.41L7.05 4.22a1 1 0 0 0-1.41 0Zm10.25 10.25a1 1 0 0 0 0 1.41l1.06 1.06a1 1 0 0 0 1.41-1.41l-1.06-1.06a1 1 0 0 0-1.41 0ZM18.36 4.22a1 1 0 0 0-1.41 0l-1.06 1.06a1 1 0 0 0 1.41 1.41l1.06-1.06a1 1 0 0 0 0-1.41ZM8.11 15.53a1 1 0 0 0-1.41 0L5.64 16.6a1 1 0 1 0 1.41 1.41l1.06-1.06a1 1 0 0 0 0-1.42Z" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M20.74 14.53A8.5 8.5 0 0 1 9.47 3.26 8.5 8.5 0 1 0 20.74 14.53Z" />
    </svg>
  )
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const next = theme === 'dark' ? 'light' : 'dark'

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
    >
      <span className="theme-toggle-icon" aria-hidden="true">
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </span>
    </button>
  )
}
