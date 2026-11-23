/**
 * Gamified RSVP card: a 3-step progress meter fills (with a reacting emoji) as the guest
 * completes name → attendance → wish. Framer Motion handles all tactile feedback.
 */
import { useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Loader2, Minus, Plus, Send } from 'lucide-react'
import { invitation, rsvpSection, type Wish } from '../../data/weddingData'
import { getGuestName } from '../../lib/guest'

type Errors = Partial<Record<'name' | 'attendance' | 'message', string>>

const MOODS = ['🙂', '😊', '😄', '🥳']

export type RsvpSubmission = Pick<Wish, 'name' | 'message' | 'attending'> & { guestCount: number; submissionId: string }

interface Props {
  /** Resolves to false when the RSVP could not be saved (e.g. no connection) */
  onSubmit: (w: RsvpSubmission) => Promise<boolean>
}

export function RsvpForm({ onSubmit }: Props) {
  const ids = useId()
  const [name, setName] = useState(() => {
    const g = getGuestName()
    return g === invitation.defaultGuestName ? '' : g
  })
  const [attending, setAttending] = useState<boolean | null>(null)
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [guestCount, setGuestCount] = useState(1)
  const [sending, setSending] = useState(false)
  const [failed, setFailed] = useState(false)
  const [sent, setSent] = useState<{ attending: boolean } | null>(null)
  // Same id for every retry of one form, so the sheet can spot a duplicate if the first try actually got through
  const submissionId = useRef(`r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`)

  const steps = [name.trim().length > 0, attending !== null, message.trim().length >= 3]
  const done = steps.filter(Boolean).length
  // Only show an error while its field is still invalid (clears as soon as the guest fixes it)
  const shown: Errors = {
    name: steps[0] ? undefined : errors.name,
    attendance: steps[1] ? undefined : errors.attendance,
    message: steps[2] ? undefined : errors.message,
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (sending) return
    const errs: Errors = {}
    if (!name.trim()) errs.name = rsvpSection.errors.name
    if (attending === null) errs.attendance = rsvpSection.errors.attendance
    if (message.trim().length < 3) errs.message = rsvpSection.errors.message
    setErrors(errs)
    if (Object.keys(errs).length || attending === null) return

    setSending(true)
    setFailed(false)
    const ok = await onSubmit({
      name: name.trim(),
      message: message.trim(),
      attending,
      guestCount: attending ? guestCount : 0,
      submissionId: submissionId.current,
    })
    setSending(false)
    if (!ok) {
      setFailed(true)
      return
    }
    submissionId.current = `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
    setSent({ attending })
    setMessage('')
  }

  return (
    <div className="rsvp-card relative rotate-[-1deg] rounded-2xl border-2 border-ink bg-paper px-5 pb-5 pt-8 shadow-hard-lg sm:p-6">
      <span className="washi -left-12 -top-2 -rotate-45 bg-coral sm:-left-5 sm:top-4" />
      <span className="washi -right-12 -top-2 rotate-45 bg-mint sm:-right-5 sm:top-4" />

      <AnimatePresence mode="wait" initial={false}>
        {sent ? (
          <motion.div
            key="thanks"
            initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            className="py-6 text-center"
          >
            <motion.div
              initial={{ scale: 2.4, rotate: -30, opacity: 0 }}
              animate={{ scale: 1, rotate: -8, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 14, delay: 0.15 }}
              className="mx-auto mb-5 w-fit rounded-lg border-[3px] border-double border-coral px-4 py-1 font-display text-lg font-bold uppercase tracking-widest text-coral"
            >
              Terkonfirmasi ✓
            </motion.div>
            <p className="font-display text-2xl font-bold">
              {sent.attending ? rsvpSection.thanksTitleYes : rsvpSection.thanksTitleNo}
            </p>
            <p className="mx-auto mt-2 max-w-xs text-balance text-sm font-semibold leading-relaxed text-ink/80">
              {sent.attending ? rsvpSection.thanksBodyYes : rsvpSection.thanksBodyNo}
            </p>
            <p className="mt-2 font-hand text-xl text-ink/75">{rsvpSection.thanksBody}</p>
            <motion.button
              type="button"
              onClick={() => setSent(null)}
              whileHover={{ y: -2, rotate: -1.5 }}
              whileTap={{ scale: 0.94 }}
              className="mt-6 min-h-11 rounded-full border-2 border-ink bg-sunshine px-5 py-2 text-sm font-bold shadow-hard-sm"
            >
              {rsvpSection.sendAnotherLabel}
            </motion.button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            noValidate
            onSubmit={submit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, rotate: 2 }}
            className="space-y-5"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-xl font-bold">{rsvpSection.formTitle}</h3>
              <motion.span
                key={done}
                initial={{ scale: 0.4, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 12 }}
                className="text-3xl"
                aria-hidden
              >
                {MOODS[done]}
              </motion.span>
            </div>

            {/* Progress meter */}
            <div>
              <div className="h-4 overflow-hidden rounded-full border-2 border-ink bg-white">
                <motion.div
                  className="h-full bg-[repeating-linear-gradient(-45deg,#6BCB77_0_8px,#8ad694_8px_16px)]"
                  initial={false}
                  animate={{ width: `${(done / 3) * 100}%` }}
                  transition={{ type: 'spring', stiffness: 180, damping: 18 }}
                />
              </div>
              <p className="mt-1 text-right text-[11px] font-bold text-ink/60">Langkah {done}/3</p>
            </div>

            {/* Name */}
            <Field label={rsvpSection.nameLabel} htmlFor={`${ids}-name`} error={shown.name}>
              <input
                id={`${ids}-name`}
                value={name}
                maxLength={rsvpSection.nameMax}
                onChange={(e) => setName(e.target.value)}
                placeholder={rsvpSection.namePlaceholder}
                autoComplete="name"
                className="w-full rounded-lg border-2 border-ink bg-white px-3 py-2.5 text-sm shadow-hard-sm outline-none placeholder:text-ink/40 focus:-translate-y-0.5 focus:bg-sunshine/20 transition"
              />
            </Field>

            {/* Attendance */}
            <fieldset>
              <legend className="mb-2 text-sm font-bold">{rsvpSection.attendanceLabel}</legend>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {[
                  { value: true, label: rsvpSection.attendYes, emoji: '🥳', on: 'bg-mint' },
                  { value: false, label: rsvpSection.attendNo, emoji: '🙏', on: 'bg-lilac' },
                ].map((opt) => {
                  const selected = attending === opt.value
                  return (
                    <motion.label
                      key={String(opt.value)}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      animate={selected ? { rotate: opt.value ? -1.5 : 1.5 } : { rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 450, damping: 15 }}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 border-ink px-3 py-2.5 text-sm font-bold has-[:focus-visible]:outline-4 has-[:focus-visible]:outline-sky ${
                        selected ? `${opt.on} shadow-hard` : 'bg-white shadow-hard-sm'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`${ids}-attending`}
                        className="sr-only"
                        checked={selected}
                        onChange={() => setAttending(opt.value)}
                      />
                      <span className="text-xl">{opt.emoji}</span>
                      <span className="flex-1 leading-tight">{opt.label}</span>
                      <span
                        className={`grid size-5 place-items-center rounded-full border-2 border-ink ${selected ? 'bg-paper' : 'bg-transparent'}`}
                      >
                        {selected && <Check className="size-3" strokeWidth={4} />}
                      </span>
                    </motion.label>
                  )
                })}
              </div>
              <ErrorText msg={shown.attendance} />
            </fieldset>

            {/* Guest count (only for guests who are coming) */}
            {attending && (
              <div className="flex items-center justify-between gap-3 rounded-xl border-2 border-ink bg-white px-3 py-2 shadow-hard-sm">
                <div className="min-w-0">
                  <p id={`${ids}-count`} className="text-sm font-bold">
                    {rsvpSection.guestCountLabel}
                  </p>
                  <p className="text-[11px] font-semibold text-ink/60">{rsvpSection.guestCountHint}</p>
                </div>
                <div role="group" aria-labelledby={`${ids}-count`} className="flex items-center gap-1.5">
                  <button
                    type="button"
                    aria-label="Kurangi jumlah tamu"
                    disabled={guestCount <= 1}
                    onClick={() => setGuestCount((c) => Math.max(1, c - 1))}
                    className="grid size-11 place-items-center rounded-full border-2 border-ink bg-paper disabled:opacity-40"
                  >
                    <Minus className="size-4" strokeWidth={3} />
                  </button>
                  <output aria-live="polite" className="w-8 text-center font-display text-xl font-bold">
                    {guestCount}
                  </output>
                  <button
                    type="button"
                    aria-label="Tambah jumlah tamu"
                    disabled={guestCount >= rsvpSection.guestCountMax}
                    onClick={() => setGuestCount((c) => Math.min(rsvpSection.guestCountMax, c + 1))}
                    className="grid size-11 place-items-center rounded-full border-2 border-ink bg-sunshine disabled:opacity-40"
                  >
                    <Plus className="size-4" strokeWidth={3} />
                  </button>
                </div>
              </div>
            )}

            {/* Message */}
            <Field label={rsvpSection.messageLabel} htmlFor={`${ids}-msg`} error={shown.message}>
              <div className="relative">
                <textarea
                  id={`${ids}-msg`}
                  value={message}
                  maxLength={rsvpSection.messageMax}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={rsvpSection.messagePlaceholder}
                  rows={4}
                  className="writing-lines w-full resize-none rounded-lg border-2 border-ink bg-white px-3 py-2 font-hand text-xl leading-8 shadow-hard-sm outline-none placeholder:text-ink/40 focus:bg-sunshine/10"
                />
                <span className="absolute bottom-2 right-3 text-[10px] font-bold text-ink/50">
                  {message.length}/{rsvpSection.messageMax}
                </span>
              </div>
            </Field>

            {failed && (
              <p role="alert" className="rounded-lg border-2 border-ink bg-coral/15 px-3 py-2 text-sm font-semibold leading-snug text-terra-deep">
                {rsvpSection.sendError}
              </p>
            )}

            <motion.button
              type="submit"
              disabled={sending}
              whileHover={{ y: -3, rotate: -1 }}
              whileTap={{ scale: 0.95, y: 2 }}
              transition={{ type: 'spring', stiffness: 450, damping: 14 }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-ink bg-coral py-3 font-display text-lg font-bold text-paper shadow-hard disabled:opacity-80"
            >
              {sending ? <Loader2 className="size-5 animate-spin" strokeWidth={2.5} /> : <Send className="size-5" strokeWidth={2.5} />}{' '}
              {sending ? rsvpSection.sendingLabel : rsvpSection.submitLabel}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}

function Field({ label, htmlFor, error, children }: { label: string; htmlFor: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-bold">
        {label}
      </label>
      {children}
      <ErrorText msg={error} />
    </div>
  )
}

function ErrorText({ msg }: { msg?: string }) {
  return (
    <AnimatePresence>
      {msg && (
        <motion.p
          role="alert"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: [0, -6, 6, -3, 0] }}
          exit={{ opacity: 0 }}
          className="mt-1.5 font-hand text-lg leading-none text-coral"
        >
          {msg}
        </motion.p>
      )}
    </AnimatePresence>
  )
}
