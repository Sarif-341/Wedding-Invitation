import { useEffect, useState } from 'react'

export interface Remaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  done: boolean
}

function remaining(target: number): Remaining {
  const ms = Math.max(0, target - Date.now())
  const s = Math.floor(ms / 1000)
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    done: ms === 0,
  }
}

/** Ticks once per second until `iso` (stops when reached). */
export function useCountdown(iso: string): Remaining {
  const target = new Date(iso).getTime()
  const [left, setLeft] = useState(() => remaining(target))

  useEffect(() => {
    const id = window.setInterval(() => {
      const r = remaining(target)
      setLeft(r)
      if (r.done) clearInterval(id)
    }, 1000)
    return () => clearInterval(id)
  }, [target])

  return left
}
