import { useSyncExternalStore } from 'react'
import { musicBox } from './musicBox'

/** Reactive view of the shared background-music player. */
export function useMusic() {
  const playing = useSyncExternalStore(musicBox.subscribe, musicBox.isPlaying, () => false)
  return { playing, play: musicBox.play, pause: musicBox.pause, toggle: musicBox.toggle }
}
