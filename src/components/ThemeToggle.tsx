import { useTheme } from '../theme'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const next = theme === 'dark' ? 'light' : 'dark'
  return (
    <button className="rf-btn rf-btn--ghost rf-btn--sm" onClick={toggle} aria-label={`Switch to ${next} mode`} title={`Switch to ${next} mode`}>
      {theme === 'dark' ? '☀ Light mode' : '☾ Dark mode'}
    </button>
  )
}
