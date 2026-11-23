import { Suspense, lazy, useEffect, useState } from 'react'
import { musicBox } from './audio/musicBox'
import { OpeningEnvelope } from './components/envelope/OpeningEnvelope'

// The invitation's sections load in a separate chunk so the envelope appears fast.
const loadMain = () => import('./components/MainInvitation')
const MainInvitation = lazy(() => loadMain().then((m) => ({ default: m.MainInvitation })))

export default function App() {
  const [opened, setOpened] = useState(false)

  // Warm the chunk while the guest looks at the envelope, so opening it never waits on the network.
  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 600))
    idle(() => void loadMain())
  }, [])

  if (!opened) {
    return (
      <OpeningEnvelope
        // Started inside the tap/drag gesture so browsers allow audio playback
        onOpenStart={musicBox.play}
        onOpened={() => setOpened(true)}
      />
    )
  }

  return (
    <Suspense
      fallback={
        <div className="grid min-h-dvh place-items-center font-hand text-3xl text-ink/60">Membuka undangan…</div>
      }
    >
      <MainInvitation
        onCloseEnvelope={() => {
          musicBox.pause()
          window.scrollTo({ top: 0 })
          setOpened(false)
        }}
      />
    </Suspense>
  )
}
