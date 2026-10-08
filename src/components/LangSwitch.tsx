import { setLang, useLang } from '../lang'

export function LangSwitch({ className = '' }: { className?: string }) {
  const lang = useLang()
  return (
    <div className={`rf-lang ${className}`} role="group" aria-label="Language">
      <button aria-pressed={lang === 'en'} onClick={() => setLang('en')} title="English">EN</button>
      <button aria-pressed={lang === 'bi'} onClick={() => setLang('bi')} title="Bislama">BI</button>
    </div>
  )
}
