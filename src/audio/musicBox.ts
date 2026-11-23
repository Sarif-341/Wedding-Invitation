/**
 * Background music player backed by a real MP3 (`music.src` in weddingData).
 * A single shared instance drives the vinyl player; React subscribes via `useMusic()`.
 *
 * Browser autoplay rule: `play()` must first be called from a user gesture
 * (the envelope tap/drag or the vinyl button). `audio.play()` is invoked synchronously
 * inside that gesture; if the browser still refuses, the state falls back to "paused".
 */
import { music } from '../data/weddingData'

const FADE_IN_MS = 500
const FADE_OUT_MS = 350

class MusicBox {
  private audio: HTMLAudioElement | null = null
  private playing = false
  private fadeToken = 0
  private fadeTimer: number | undefined
  /** Identifies the latest play/pause request so a stale play() promise can't overwrite newer state. */
  private requestId = 0
  private wasPlayingBeforeHidden = false
  private listeners = new Set<() => void>()

  constructor() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.onVisibility)
    }
  }

  // ---- public API ---------------------------------------------------------
  subscribe = (fn: () => void) => {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }
  isPlaying = () => this.playing

  play = () => {
    if (this.playing) return
    const audio = this.ensureAudio()
    const id = ++this.requestId
    this.fadeToken++ // cancel any pending fade-out/pause
    window.clearInterval(this.fadeTimer)
    this.setPlaying(true)

    audio.volume = 0
    audio.play().then(
      () => {
        if (id === this.requestId) this.fadeTo(1, FADE_IN_MS)
      },
      (err: unknown) => {
        // A newer play/pause superseded this request, or pause() interrupted it: not a failure.
        if (id !== this.requestId || (err as DOMException)?.name === 'AbortError') return
        // Autoplay blocked, file missing or undecodable → reflect reality in the UI
        console.warn('[music] could not play', err)
        audio.volume = 1
        this.setPlaying(false)
      },
    )
  }

  pause = () => {
    if (!this.playing || !this.audio) return
    const audio = this.audio
    this.requestId++
    this.setPlaying(false)
    this.fadeTo(0, FADE_OUT_MS, () => {
      // Skip if the guest pressed play again during the fade
      if (!this.playing) audio.pause()
    })
  }

  toggle = () => (this.playing ? this.pause() : this.play())

  // ---- internals ----------------------------------------------------------
  private setPlaying(v: boolean) {
    this.playing = v
    this.listeners.forEach((l) => l())
  }

  private ensureAudio(): HTMLAudioElement {
    if (this.audio) return this.audio
    const audio = new Audio(music.src)
    audio.loop = true
    audio.preload = 'auto'
    audio.addEventListener('error', () => {
      console.warn('[music] failed to load', music.src)
      this.setPlaying(false)
    })
    this.audio = audio
    return audio
  }

  /**
   * Linear volume ramp (no-op on iOS where volume is read-only — playback still works).
   * Driven by a timer, not requestAnimationFrame: rAF stops in background/occluded tabs, which would
   * leave a "paused" song playing or a freshly started one stuck at volume 0.
   */
  private fadeTo(target: number, ms: number, done?: () => void) {
    const audio = this.audio
    if (!audio) return
    window.clearInterval(this.fadeTimer)
    const token = ++this.fadeToken
    const from = audio.volume
    const start = performance.now()
    this.fadeTimer = window.setInterval(() => {
      if (token !== this.fadeToken) {
        window.clearInterval(this.fadeTimer) // superseded by a newer play/pause
        return
      }
      const t = Math.min(1, (performance.now() - start) / ms)
      audio.volume = from + (target - from) * t
      if (t >= 1) {
        window.clearInterval(this.fadeTimer)
        done?.()
      }
    }, 30)
  }

  /** Pause when the tab is hidden, resume when the guest comes back. */
  private onVisibility = () => {
    if (document.hidden) {
      this.wasPlayingBeforeHidden = this.playing
      if (this.playing && this.audio) {
        this.requestId++
        this.setPlaying(false)
        this.fadeToken++
        window.clearInterval(this.fadeTimer)
        this.audio.pause() // no fade: timers are throttled in hidden tabs
      }
    } else if (this.wasPlayingBeforeHidden) {
      this.wasPlayingBeforeHidden = false
      this.play()
    }
  }
}

export const musicBox = new MusicBox()
