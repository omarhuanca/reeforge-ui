import { useEffect, useState } from 'react'

/** True once `active` has lasted `ms` without ending; false again as soon as it ends. */
export function useSlow(active: boolean, ms: number): boolean {
  const [slow, setSlow] = useState(false)
  useEffect(() => {
    if (!active) return
    const timer = setTimeout(() => setSlow(true), ms)
    return () => {
      clearTimeout(timer)
      setSlow(false)
    }
  }, [active, ms])
  return slow
}
