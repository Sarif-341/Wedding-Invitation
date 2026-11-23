/**
 * Single source of truth for all invitation content.
 * Swap these placeholder values after the client reveal — no UI changes needed.
 */

export interface Person {
  fullName: string
  nickname: string
  initial: string
  parents: string
  instagram?: string
}

export interface WeddingEvent {
  id: 'akad' | 'resepsi'
  title: string
  /** Short ALL-CAPS name used as the "airport code" on the boarding pass */
  code: string
  /** ISO 8601 with timezone offset; the first event's start is the countdown target */
  startsAt: string
  /** Official end time (confirmed by the client); also feeds the calendar entry */
  endsAt: string
  color: PaperColor
}

/** Where the wedding takes place — Akad and Resepsi share one venue, only the times differ. */
export interface WeddingVenue {
  /** Venue/building name */
  name?: string
  /** Full address (ticket, calendar, maps) */
  address: string
  /** Short form for the cover page: street + regency only */
  shortAddress?: string
  mapsUrl: string
}

/** Scrapbook accent colors (match Tailwind tokens: bg-coral, bg-sky, …) */
export type PaperColor = 'coral' | 'sunshine' | 'mint' | 'sky' | 'lilac'

export interface StoryMoment {
  id: string
  /** Short display date, e.g. "Agustus 2019" */
  date: string
  title: string
  caption: string
  color: PaperColor
  /** Emoji sticker pinned on the timeline */
  sticker: string
  /** 'polaroid' = photo card, 'note' = torn paper note */
  style: 'polaroid' | 'note'
  /** Optional photo URL (put files in /public/photos). Without it a colorful placeholder is shown. */
  photo?: string
  /** Handwritten caption under the polaroid photo */
  photoCaption?: string
  /** Illustration shown in the photo frame when there is no photo (see components/story/StoryArt.tsx) */
  art?: 'cafe' | 'poem' | 'carnival' | 'journey'
  /** Screen-reader description of the illustration */
  artAlt?: string
  /** A poem to show under the caption, with its author */
  poem?: { lines: string[]; author: string }
}

export interface Polaroid {
  id: string
  /** Description for screen readers (nothing is printed under the photo) */
  alt: string
  color: PaperColor
  /** Emoji shown on the placeholder photo */
  sticker: string
  /** Optional real photo or looping .gif (files live in /public, e.g. /gambar-papan-kenangan/gambar1.gif) */
  photo?: string
  /** Starting tilt in degrees */
  rotate: number
  /** Starting position on the board, as % of board size */
  x: number
  y: number
}

export type StickerId = 'ring' | 'heart' | 'bow' | 'flower' | 'star' | 'letter'

export interface Wish {
  id: string
  name: string
  message: string
  attending: boolean
  color: PaperColor
  /** epoch ms — set for wishes added on this device */
  createdAt?: number
}

export const groom: Person = {
  fullName: 'Syarif Hidayatullah',
  nickname: 'Syarif',
  initial: 'S',
  parents: 'Putra dari Bapak Ahmad & Ibu Siti',
  instagram: 'syarif',
}

export const bride: Person = {
  fullName: 'Zhasy Aulia Putri',
  nickname: 'Zhasy',
  initial: 'Z',
  parents: 'Putri dari Bapak Budi & Ibu Rina',
  instagram: 'zhasy',
}

export const couple = {
  groom,
  bride,
  displayName: `${groom.nickname} & ${bride.nickname}`,
  monogram: `${groom.initial} & ${bride.initial}`,
}

/** Copy for the opening envelope & welcome screen */
export const invitation = {
  openingTitle: 'The Wedding of',
  toLabel: 'Kepada Tamu Spesial',
  /** Shown when the link has no guest code, or a code that is not in data/guestList.ts */
  defaultGuestName: 'Tamu Undangan',
  openHint: 'Tarik pita ke kanan atau ketuk segel ✨',
  welcomeTitle: `Selamat Datang di Undangan ${couple.displayName}`,
  closeEnvelopeLabel: 'Tutup Kembali Amplop',
}

/** Venue name, real address and Google Maps link. The cover shows `name, shortAddress`; everything else shows the full address. */
export const weddingVenue: WeddingVenue = {
  name: 'Lisung Dulang Resto',
  shortAddress: 'Jl. Bukit Pakar Timur No.111, Kabupaten Bandung',
  address: 'Jl. Bukit Pakar Timur No.111, Ciburial, Kec. Cimenyan, Kabupaten Bandung, Jawa Barat 40198, Indonesia',
  mapsUrl: 'https://maps.app.goo.gl/DtqthWuxWcUQpz3R6',
}

/** Same day, same venue — each event only has its own time slot. */
export const events: WeddingEvent[] = [
  {
    id: 'akad',
    title: 'Akad Nikah',
    code: 'AKAD',
    startsAt: '2027-04-07T09:00:00+07:00',
    endsAt: '2027-04-07T10:00:00+07:00',
    color: 'mint',
  },
  {
    id: 'resepsi',
    title: 'Resepsi',
    code: 'RESEPSI',
    startsAt: '2027-04-07T10:30:00+07:00',
    endsAt: '2027-04-07T15:00:00+07:00',
    color: 'coral',
  },
]

/** Main countdown target (first event) */
export const weddingDate = events[0].startsAt

/** Copy for Section #3 — Story timeline */
export const storySection = {
  chapter: 'Bab 2',
  title: 'Cerita Kami',
  subtitle: 'dari gak sengaja dikenalin sampe dengan sengaja mau dinikahin',
  ending: 'to be continued… bersama kamu di hari bahagia kami!',
}

/**
 * Long-distance chapter: the Germany ↔ Indonesia flight path.
 * PLACEHOLDER content — swap the cities, airport codes, stamp dates and distance for the real story.
 */
export const ldr = {
  kicker: 'Jerman ↔ Indonesia',
  title: 'Loooooong Distance Relationship',
  caption:
    'Terima kasih telah bertahan melewati jarak dan waktu. Hari ini, segala rindu yang pernah kita titipkan pada semesta, resmi kita tuntaskan dalam satu ikatan.',
  captionAuthor: 'Fiersa Besari',
  distance: '±11.000 km',
  from: { code: 'DE', name: 'Jerman', city: 'Frankfurt' },
  to: { code: 'ID', name: 'Indonesia', city: 'Jakarta' },
  /** Passport stamps (ring text must be short, ALL CAPS) */
  departed: { word: 'BERANGKAT', ring: 'FRANKFURT • JERMAN', date: 'AGST 2022' },
  arrived: { word: 'TIBA', ring: 'JAKARTA • INDONESIA', date: 'MAR 2027' },
  ticket: {
    header: 'BOARDING PASS',
    fromCode: 'FRA',
    toCode: 'CGK',
    passengerLabel: 'PENUMPANG',
    seatLabel: 'KURSI',
    seat: '12A',
    gateLabel: 'GERBANG',
    gate: 'LDR',
    flight: 'SZ 2027',
  },
}

export const story: StoryMoment[] = [
  {
    id: 'meet',
    date: 'Agustus 2016',
    title: 'Pertama Bertemu',
    caption: 'Dikenalin ama temen kita bedua disuatu Cafee disekitar tempat tinggal kita.',
    color: 'sky',
    sticker: '☕',
    style: 'polaroid',
    art: 'cafe',
    artAlt: 'Ilustrasi kafe di sekitar tempat tinggal dengan kanopi bergaris, jendela hangat, dan dua cangkir kopi di meja',
  },
  {
    id: 'close',
    date: '2018-an',
    title: 'Mulai Dekat',
    caption:
      'Mulai dekat dengan saling bertegur sapa meskipun secara berjauhan. dan semakin intense karena puisi-puisi yang syarif kirimkan.',
    color: 'sunshine',
    sticker: '💌',
    style: 'polaroid',
    art: 'poem',
    artAlt: 'Ilustrasi surat berisi puisi terbang di antara dua rumah kecil yang berjauhan, dikelilingi hati',
    poem: {
      lines: [
        'Kau adalah bait terindah dari semua puisi yang pernah ku tulis',
        'Bahkan tak ada pelangi yang lebih bewarna dari senyummu',
      ],
      author: 'Syarif',
    },
  },
  {
    id: 'adventure',
    date: 'Juni 2019-an',
    title: 'Main Bareng Pertama',
    caption: 'Main bareng pertama kali disebuah karnaval pada malam hari naik kincir angin.',
    color: 'lilac',
    sticker: '🎡',
    style: 'polaroid',
    art: 'carnival',
    artAlt: 'Ilustrasi kincir angin karnaval menyala di malam hari dengan bulan dan bintang',
  },
  {
    id: 'germany',
    date: '2022',
    title: 'Terbang ke Jerman',
    caption:
      'syarif terbang ke jerman untuk membangun karir. kita sempat memutuskan untuk mengakhiri hubungan. singkat cerita, pada tanggal 2 mei 2025 kita memulai kembali cerita yang sempat terjeda.',
    color: 'mint',
    sticker: '✈️',
    style: 'polaroid',
    art: 'journey',
    artAlt: 'Ilustrasi pesawat terbang dari Indonesia ke Jerman dan hati yang patah dijahit kembali dengan label 2 Mei 2025',
  },
  {
    id: 'wedding',
    date: '7 April 2027',
    title: 'Hari Pernikahan',
    caption: 'Bab baru dimulai di sini — dan kami ingin kamu ada di halaman ini bersama kami.',
    color: 'coral',
    sticker: '🎉',
    style: 'note',
  },
]

/** Copy for Section #4 — Polaroid & sticker board */
export const gallerySection = {
  chapter: 'Bab 3',
  title: 'Papan Kenangan',
  subtitle: 'Geser fotonya, putar sesukamu, lalu hias dengan stiker!',
  drawerTitle: 'Laci Stiker',
  drawerHint: 'ketuk / seret ke papan',
  boardHint: 'Seret foto • putar lewat gagang ⟳ • ketuk 2× stiker untuk melepas',
  resetPhotosLabel: 'Rapikan foto',
  clearStickersLabel: 'Bersihkan stiker',
}

export const polaroids: Polaroid[] = [
  { id: 'p1', alt: 'Ilustrasi Syarif dan Zhasy berdiri saling memunggungi dengan latar Gunung Fuji dan bunga sakura', color: 'sky', sticker: '☕', photo: '/gambar-papan-kenangan/gambar1.gif', rotate: -7, x: 5, y: 6 },
  { id: 'p2', alt: 'Ilustrasi Zhasy menopang pipi dan Syarif tersenyum dengan tangan bersedekap, latar Gunung Fuji', color: 'mint', sticker: '🚗', photo: '/gambar-papan-kenangan/gambar2.gif', rotate: 6, x: 52, y: 3 },
  { id: 'p3', alt: 'Ilustrasi Zhasy berpose dua jari dan Syarif tersenyum dalam bingkai perangko bergambar sakura', color: 'lilac', sticker: '💍', photo: '/gambar-papan-kenangan/gambar3.gif', rotate: -4, x: 8, y: 50 },
  { id: 'p4', alt: 'Ilustrasi Zhasy tertawa berpose dua jari dan Syarif tersenyum, latar Gunung Fuji dan pagoda', color: 'coral', sticker: '💑', photo: '/gambar-papan-kenangan/gambar4.gif', rotate: 8, x: 54, y: 47 },
]

/** Stickers in the drawer (art lives in components/gallery/stickerArt.tsx) */
export const stickerSet: { id: StickerId; label: string }[] = [
  { id: 'ring', label: 'Cincin' },
  { id: 'heart', label: 'Hati' },
  { id: 'bow', label: 'Pita' },
  { id: 'flower', label: 'Bunga' },
  { id: 'star', label: 'Bintang' },
  { id: 'letter', label: 'Surat cinta' },
]

/**
 * Background music: the MP3 lives in /public (served from the site root).
 * Title/artist are shown on the vinyl player's track tag — edit to match the song.
 */
export const music = {
  src: '/wedding-song.mp3',
  title: 'Lagu Kami',
  artist: 'S & Z',
  playLabel: 'Putar',
  pauseLabel: 'Jeda',
}

/** Copy for Section #2 — Hero */
export const hero = {
  eyebrow: 'The Wedding of',
  arrowNote: "that's us!",
  dateLabel: 'Save the date',
  nextLabel: 'Baca cerita kami',
}

/** Copy for Section #5 — Event details & countdown */
export const eventsSection = {
  chapter: 'Bab 4',
  title: 'Hari Bahagia',
  subtitle: 'Simpan tiketmu, jangan sampai ketinggalan!',
  countdownTitle: 'Menuju Hari H',
  countdownUnits: { days: 'Hari', hours: 'Jam', minutes: 'Menit', seconds: 'Detik' },
  countdownDone: 'Hari ini kami menikah! 🎉',
  /** One boarding pass for the whole day (Akad → Resepsi) */
  ticketLabel: 'Tiket Undangan',
  passLabel: 'BOARDING PASS',
  passCode: 'SZ 2027',
  admitLabel: 'ADMIT',
  guestLabel: 'PENUMPANG',
  dateLabel: 'TANGGAL',
  timesLabel: 'JADWAL',
  placeLabel: 'LOKASI',
  gapSuffix: 'kemudian',
  mapsLabel: 'Buka Peta',
  timezone: 'WIB',
  /** Between start and end time, e.g. "09.00 – 10.00" is built in code; this is the aria wording */
  untilLabel: 's.d.',
  /** "Save the date" card under the ticket (intimate wedding: no sharing/copy-link feature) */
  actionsTitle: 'Simpan Tanggalnya',
  actionsHint: 'Biar tidak lupa, simpan di kalendermu.',
  saveAllLabel: 'Simpan ke Google Calendar',
  calendarTitle: `Pernikahan ${couple.displayName}`,
}

/** Google Apps Script Web App that stores RSVPs/wishes in Google Sheets (sheets `RSVP` and `Ucapan`). */
export const sheetsApi = {
  endpoint:
    'https://script.google.com/macros/s/AKfycbwTGTUq8zSwTMnV7g-aMwzaTfwLBKxck02mmxtB3oCSCTzd63VoNjgm1EEw2A6l4J8P/exec',
  /** Give up on a request after this long (ms) */
  timeoutMs: 15000,
}

/** Copy for Section #6 — RSVP & wish wall */
export const rsvpSection = {
  chapter: 'Bab 5',
  title: 'RSVP & Ucapan',
  subtitle: 'Konfirmasi kehadiranmu & tempel doa terbaik di dinding kami.',
  formTitle: 'Kartu Konfirmasi',
  nameLabel: 'Nama Tamu',
  namePlaceholder: 'Tulis namamu di sini…',
  attendanceLabel: 'Kehadiran',
  attendYes: 'Hadir dengan Senang Hati',
  attendNo: 'Maaf Berhalangan',
  messageLabel: 'Ucapan & Doa',
  messagePlaceholder: 'Tulis ucapan atau doa untuk Syarif & Zhasy…',
  submitLabel: 'Kirim Konfirmasi',
  errors: {
    name: 'Namanya diisi dulu ya 😊',
    attendance: 'Pilih salah satu kehadiran dulu ya',
    message: 'Tulis sedikit ucapan (min. 3 huruf) ya',
  },
  thanksTitleYes: 'Yay! Sampai jumpa di hari H! 🥳',
  thanksTitleNo: 'Terima kasih sudah memberi kabar 🤍',
  thanksBody: 'Ucapanmu sudah tertempel di dinding ucapan.',
  thanksBodyYes: 'Guest Pass-mu sudah siap — simpan dan tunjukkan di meja penerima tamu.',
  thanksBodyNo:
    'Kami mengerti, dan doamu sudah sangat berarti bagi kami. Semoga kita bisa bertemu di lain kesempatan — kami akan merindukanmu di hari bahagia itu.',
  sendAnotherLabel: 'Kirim ucapan lagi',
  guestCountLabel: 'Jumlah Tamu',
  guestCountHint: 'termasuk kamu',
  guestCountMax: 5,
  sendingLabel: 'Mengirim…',
  sendError: 'Koneksi sedang bermasalah, konfirmasimu belum terkirim. Isianmu aman — ketuk kirim lagi ya.',
  wallLoading: 'Memuat ucapan terbaru…',
  wallError: 'Belum bisa memuat ucapan terbaru.',
  wallRetryLabel: 'Coba lagi',
  passDownloadedTitle: 'Tiketmu sudah diunduh ✓',
  passDownloadedBody:
    'Cek folder Unduhan atau Galeri di perangkatmu. Demi keamanan, tiket otomatis disembunyikan dari halaman ini — sampai jumpa di hari H!',
  wallTitle: 'Dinding Ucapan',
  showMoreLabel: 'Lihat lebih banyak',
  justNow: 'baru saja',
  /** Max characters */
  nameMax: 40,
  messageMax: 280,
}

/** English copy for the downloadable Guest Pass (drawn on a canvas, so keep strings short). */
export const guestPass = {
  eyebrow: 'An intimate celebration · By invitation only',
  inviteLine: 'You are invited to the wedding of',
  guestLabel: 'Guest',
  passengerLabel: 'Passenger',
  dateLabel: 'Date',
  boardingLabel: 'Boarding',
  destinationLabel: 'Destination',
  rsvpTitle: 'RSVP',
  rsvpStatus: 'Confirmed · Happily attending',
  spineTitle: 'Boarding Pass',
  spineStatus: 'Guest Pass · Confirmed',
  qrNote: 'Please present this QR at the welcome desk.',
  ticketLabel: 'Ticket No.',
  mapLabel: 'Venue map',
  admit: 'Admit one · Non-transferable',
  /** Prefix of the ticket number, e.g. SZ-070427-018 */
  ticketPrefix: 'SZ',
  panelTitle: 'Thank you for confirming',
  panelSubtitle: 'Your guest pass is ready',
  downloadLabel: 'Download Ticket',
  downloadingLabel: 'Preparing…',
  downloadError: 'Could not create the image. Please try again.',
  stamp: 'Syarif & Zhasy · Bandung, ID',
  fileName: 'guest-pass',
  /** Shown while the ticket is being drawn */
  loadingLabel: 'Preparing your pass…',
}

/** Copy for the closing "back cover" */
export const closing = {
  title: 'Terima Kasih!',
  body: 'Merupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.',
  signoff: 'Kami yang berbahagia,',
  backToTopLabel: 'Kembali ke sampul',
}

export const initialWishes: Wish[] = [
  { id: 'w5', name: 'Pak RT', message: 'Selamat menempuh hidup baru, semoga berkah selalu.', attending: true, color: 'coral' },
]

export const weddingData = {
  couple,
  invitation,
  hero,
  events,
  weddingDate,
  storySection,
  ldr,
  story,
  gallerySection,
  polaroids,
  stickerSet,
  music,
  eventsSection,
  rsvpSection,
  guestPass,
  closing,
  initialWishes,
} as const

export default weddingData
