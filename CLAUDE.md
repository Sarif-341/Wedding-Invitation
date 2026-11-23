# Project Blueprint: Cheerful & Colorful Scrapbook Wedding Invitation

## 1. Project Overview

- **Goal:** Interactive digital wedding invitation prototype with a "Tactile Paper Craft / Scrapbook" aesthetic.
- **Vibe:** Elegant, romantic, yet still cheerful — a vintage wedding scrapbook (archival paper, gold foil accents, handmade tactile touches). Avoid anything that reads as a children's birthday party.
- **Couple Placeholder Data:** Centralized in `src/data/weddingData.ts` so all names, dates, and venues can be swapped effortlessly after the client reveal.
  - Groom: Syarif (Initial: S)
  - Bride: Zhasy (Initial: Z)

## 2. Tech Stack & Motion Architecture (Strict Separation of Concerns)

- **Core:** React (Vite) + TypeScript + Tailwind CSS + Lucide React.
- **Motion Libraries & Roles (Do NOT overlap responsibilities):**
  1. **GSAP (`gsap` + `ScrollTrigger`):** Page-level scroll choreography, scrapbook page transitions, and the interactive Envelope Tear/Peel opening sequence.
  2. **Anime.js (`animejs`):** Micro-SVG path drawing (hand-drawn doodles, arrows, underlines), floating stickers, and smooth vinyl record rotation.
  3. **Framer Motion (`framer-motion`):** Tactile physics interactions — draggable Polaroid photos, interactive sticker placement, and spring-based button/card hovers.
  4. **Canvas Confetti (`canvas-confetti`):** Celebratory bursts on envelope open and RSVP submission.

## 3. Visual Design System

- **Background:** Warm linen/kraft paper (cream `#FFFDF7` cards on `#F7EFDF` linen) with very faint weave + grain. No ruled notebook lines or visible dot/grid patterns.
- **Color Palette (Vintage Wedding):** Tailwind token names are kept from the original scheme, but the values are now:
  - `coral` = Terracotta: `#BF5F47` (deep text variant `terra-deep` `#A9503B`)
  - `sunshine` = Soft Gold: `#D8B15E` (deep text variant `gold-deep` `#A8802F`)
  - `mint` = Sage Green: `#9DB398` (deep text variant `sage-deep` `#5E7A60`)
  - `sky` = Dusty Blue: `#7F9DB9`
  - `lilac` = Dusty Mauve: `#B795B2`
  - `rose` = Rose Gold / Blush: `#DBA99D`
  - `ink` = Warm Charcoal-Navy (Borders/Text): `#2B2D42`
  - Couple names: Syarif in `sage-deep`, Zhasy in `terra-deep`, ampersand in italic `gold-deep`. Never use the pastel tokens as body-size text on cream (low contrast).
- **Typography:** Load Google Fonts in `index.html`:
  - Display / Headings: `'Fraunces'` (elegant soft-serif, roman + italic; lining numerals)
  - Handwriting / Polaroid Captions: `'Caveat'`
  - Body / Details: `'Plus Jakarta Sans'`
- **Scrapbook Styling Rules:** Use tilted cards (`rotate-[-2deg]`, `rotate-[3deg]`), decorative semi-transparent washi tape strips on corners, crisp dark borders (`2px solid #2B2D42`), and tactile hard shadows (`4px 4px 0px #2B2D42`).

## 4. Core Interactive Sections (Build Incrementally)

1. **Interactive Opening Envelope:** A colorful paper envelope sealed with a sticker/ribbon that users drag/click to peel open, triggering confetti and revealing the invitation.
2. **Hero & Floating Vinyl Player:** Kinetic typography for "Syarif & Zhasy" (`S & Z`) surrounded by Anime.js self-drawing SVG doodles and a corner rotating vinyl music player toggle.
3. **Interactive Scrapbook Story Timeline:** Scroll-triggered paper cutouts telling their journey.
4. **Draggable Polaroid & Sticker Playground:** A corkboard/scrapbook canvas where guests can drag pre-wedding Polaroid placeholders and stamp fun stickers (rings, hearts, flowers).
5. **Event Details & Countdown:** Colorful paper ticket stubs for Akad & Resepsi with live countdown.
6. **Gamified RSVP & Sticky-Note Wish Wall:** Submitting RSVP triggers confetti and pins a new colorful sticky note onto the live wish board.

## 5. Coding & Workflow Rules

- Always keep `src/data/weddingData.ts` clean and separate from UI components.
- Ensure mobile-first responsiveness (touch-friendly drag interactions and smooth 60fps animations).
- Build and verify step-by-step; do not dump unverified code without checking TypeScript/build health.

## 6. Guest Pass (RSVP ticket)

- After RSVP "Hadir dengan senang hati", an English **Guest Pass** (dark-emerald + gold boarding pass) appears under the wish wall; declining shows only a warm thank-you (no pass, no download). The pass persists in `localStorage` (`sz-pass-v1`).
- Drawn on a `<canvas>` (`src/components/rsvp/guestpass/drawPass.ts`) so the preview and the downloaded PNG are identical; wide layout on desktop, tall layout on phones. Guest name/ticket number are data (`passData.ts`), never baked into an image. English copy lives in `guestPass` in `weddingData.ts`.
- Pass-only fonts (not part of the main palette): Pinyon Script, Cormorant Garamond, Jost; pass colours are local to `drawPass.ts`.

## 7. Google Sheets backend (Apps Script Web App)

- The Apps Script itself lives in `apps-script/Code.gs` (paste into the sheet, see its README); it fills `Kehadiran` automatically.
- Endpoint + timeout: `sheetsApi` in `weddingData.ts`; client in `src/lib/rsvpApi.ts` (POST as `text/plain` to avoid CORS preflight; never throws, returns `{ok}`).
- `submit_rsvp` (name, attending/status, guestCount, ticketNo, message, submissionId) is sent first; only on success is the wish pinned and the pass shown. On failure the form stays filled with a retry message; the same `submissionId` is reused on retries.
- `GET` fills the wish wall (`useWishes`); the sample wish only shows while the wall would be empty. Rows are read tolerantly (`name|nama`, `message|ucapan|pesan`, `status|attending`, `timestamp|createdAt`).
- Tickets are single-use: after a successful download the app sends `mark_downloaded` + `ticketNo` (retried next visit via `sz-pending-v1` if offline), removes the pass from the page and from `localStorage` (`sz-pass-v1`), and shows a short "downloaded" note instead. The ticket only ever lived in the guest's own browser.

## 8. Event facts

- Event times: Akad 09.00–10.00 WIB, Resepsi 10.30–15.00 WIB (official, in `weddingData.ts`); the calendar entry spans 09.00–15.00. `public/wedding-song.mp3` (2.48 MB, compressed) is the only song file.
