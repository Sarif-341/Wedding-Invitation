/**
 * Named invitations. Add one line per guest: the key is the link code, the value is the name printed on the envelope
 * and used everywhere else.  e.g.  https://your-site/?tamu=budi-santoso  →  "Bpk. Budi Santoso"
 *
 * Keys are lowercase, words joined with "-" (spaces, case and "%20" in a link are tolerated).
 * A link with no code, or a code that is not listed, falls back to `invitation.defaultGuestName`.
 */
export const guestList: Record<string, string> = {
  "budi-santoso": "Bpk. Budi Santoso",
  "keluarga-rahman": "Keluarga Besar Bapak Rahman",
  "yani-hanafi": "Yani & Hanafi",
};

/** Link parameters that carry the guest code, first match wins */
export const guestQueryParams = ["tamu", "to"];
