import { useAuth } from '../authContext'
import { setPref, useThemePref, type ThemePref } from '../theme'
import { IconLogout } from './icons'
import { Menu } from './Menu'

const THEMES: Array<{ value: ThemePref; label: string }> = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]

/** Avatar button with the account menu: who is signed in, theme (Light / Dark / System) and Sign out. */
export function UserMenu() {
  const { signOut } = useAuth()
  const pref = useThemePref()

  return (
    <Menu label="Account menu" buttonClass="rf-avatar-btn" trigger={<span className="rf-avatar" title="Admin">AD</span>}>
      {(close) => (
        <>
          <div className="rf-menu__label">Signed in as <strong>Admin</strong></div>
          <div className="rf-menu__sep" role="separator" />
          <div className="rf-menu__label">Theme</div>
          <div className="rf-menu__section">
            <div className="rf-segmented" role="group" aria-label="Theme">
              {THEMES.map((t) => (
                <button key={t.value} type="button" aria-pressed={pref === t.value} onClick={() => setPref(t.value)}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="rf-menu__sep" role="separator" />
          <button type="button" className="rf-menu__item" role="menuitem" onClick={() => { close(); void signOut() }}>
            <IconLogout />Sign out
          </button>
        </>
      )}
    </Menu>
  )
}
