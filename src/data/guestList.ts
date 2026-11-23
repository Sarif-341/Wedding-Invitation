/**
 * Named invitations. Add one line per guest: the key is the link code, the value is the name printed on the envelope
 * and used everywhere else.  e.g.  https://your-site/?tamu=yani-hanafi  →  "Yani & Hanafi"
 *
 * Keys are lowercase, words joined with "-" (spaces, case and "%20" in a link are tolerated).
 * A link with no code, or a code that is not listed, falls back to `invitation.defaultGuestName`.
 */
export const guestList: Record<string, string> = {
  "yazid-istri": "Yazid & Istri",
  "nadian-suami": "Nadian & Suami",
  "fr-islah-suami-anak": "Fr. Islah, Suami & Anak",
  "muhammad-kahfi": "Muhammad Kahfi",
  "sofyan-sururi": "Sofyan Sururi",
  "iqbal": "Iqbal",
  "oca": "Oca",
  "yani-hanafi": "Yani & Hanafi",
  "hanida-suami": "Hanida & Suami",
  "nabila-suami": "Nabila & Suami",
  "ka-shafira": "Ka Shafira",
  "mba-mia": "Mba Mia",
  "ajeng": "Ajeng",
  "mba-erma": "Mba Erma",
  "adel-pasangan": "Adel & Pasangan",
  "sindi": "Sindi",
  "zain-pasangan": "Zain & Pasangan",
  "ucok": "Ucok",
  "aldi": "Aldi",
  "bu-inez-hrd": "Bu Inez HRD",
  "bu-caca-keluarga": "Bu Caca & Keluarga",
  "bang-yaman": "Bang Yaman",
  "rini": "Rini",
  "mba-hasna": "Mba Hasna",
  "imah": "Imah",
  "ayu": "Ayu",
  "putri-ns": "Putri NS",
  "kang-syafiq-keluarga": "Kang Syafiq & Keluarga",
  "kang-fadlu": "Kang Fadlu",
  "nabila-2-suami": "Nabila 2 & Suami",
  "dayat": "Dayat",
  "desi-suami": "Desi & Suami",
  "ramadhan": "Ramadhan",
  "ivana-keluarga": "Ivana & Keluarga",
};

/** Link parameters that carry the guest code, first match wins */
export const guestQueryParams = ["tamu", "to"];
