import { eventsSection, weddingVenue, type WeddingEvent } from '../data/weddingData'
import { formatRange, formatVenue } from './format'

const TZ = 'Asia/Jakarta'
const toGCalDate = (iso: string) => new Date(iso).toISOString().replace(/[-:]|\.\d{3}/g, '')

interface CalendarInput {
  title: string
  startsAt: string
  endsAt: string
  location: string
  details: string
}

/** Google Calendar "add event" link (dates in UTC, shown in the guest's/Jakarta time). */
function buildUrl({ title, startsAt, endsAt, location, details }: CalendarInput) {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${toGCalDate(startsAt)}/${toGCalDate(endsAt)}`,
    ctz: TZ,
    location,
    details,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/** The whole wedding day: first event's start to the last event's official end. One venue, listed once. */
export function weddingCalendarUrl(events: WeddingEvent[]) {
  const times = events.map((e) => `${e.title}: ${formatRange(e)} ${eventsSection.timezone}`).join('\n')
  const where = [weddingVenue.name, weddingVenue.address, weddingVenue.mapsUrl].filter(Boolean).join('\n')
  return buildUrl({
    title: eventsSection.calendarTitle,
    startsAt: events[0].startsAt,
    endsAt: events[events.length - 1].endsAt,
    location: formatVenue(weddingVenue),
    details: [times, where].join('\n\n'),
  })
}
