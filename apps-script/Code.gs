/**
 * Backend undangan Syarif & Zhasy — Google Apps Script (ditempel di Extensions > Apps Script pada Spreadsheet).
 *
 * Tab `RSVP`  : Timestamp | Nama | Kehadiran | Jumlah | TicketNo | Downloaded
 * Tab `Ucapan`: Timestamp | Nama | Ucapan | Kehadiran
 *
 * Aturan yang dijaga script ini (tidak perlu isi manual):
 *  - submit_rsvp   -> baris RSVP baru dengan Kehadiran "Hadir" / "Tidak Hadir" langsung terisi.
 *  - mark_downloaded -> Downloaded = "YES" dan Kehadiran otomatis "Hadir" (hanya yang hadir punya tiket).
 *  - Mengubah TicketNo / Downloaded secara manual juga mengisi Kehadiran yang kosong (onEdit).
 *  - fixKehadiran() merapikan baris lama yang Kehadirannya masih kosong (jalankan sekali dari editor).
 *  - Header dicari berdasarkan NAMA kolom, jadi urutan kolom boleh berbeda.
 */

var SHEET_RSVP = 'RSVP';
var SHEET_WISH = 'Ucapan';
var RSVP_HEADERS = ['Timestamp', 'Nama', 'Kehadiran', 'Jumlah', 'TicketNo', 'Downloaded'];
var WISH_HEADERS = ['Timestamp', 'Nama', 'Ucapan', 'Kehadiran'];
var HADIR = 'Hadir';
var TIDAK_HADIR = 'Tidak Hadir';

// ------------------------------------------------------------------ web app
function doGet() {
  var sheet = getSheet_(SHEET_WISH, WISH_HEADERS);
  var rows = readRows_(sheet);
  var messages = rows
    .filter(function (r) { return r.Nama && r.Ucapan; })
    .map(function (r, i) {
      return {
        id: 'row-' + r.__row,
        name: String(r.Nama),
        message: String(r.Ucapan),
        status: normalizeKehadiran_(r.Kehadiran) || HADIR,
        timestamp: r.Timestamp instanceof Date ? r.Timestamp.toISOString() : String(r.Timestamp || ''),
      };
    });
  return json_({ status: 'ok', messages: messages });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (body.action === 'submit_rsvp') return json_(submitRsvp_(body));
    if (body.action === 'mark_downloaded') return json_(markDownloaded_(body));
    return json_({ status: 'error', message: 'unknown action' });
  } catch (err) {
    return json_({ status: 'error', message: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function submitRsvp_(b) {
  // Percobaan ulang dari form yang sama (submissionId sama) tidak boleh membuat baris ganda.
  var cache = CacheService.getScriptCache();
  var key = 'sub-' + (b.submissionId || '');
  if (b.submissionId && cache.get(key)) return { status: 'ok', duplicate: true };

  var name = String(b.nama || b.name || '').trim();
  var attending = isAttending_(b);
  var kehadiran = attending ? HADIR : TIDAK_HADIR; // selalu dihitung di sini, tidak bergantung pada kiriman klien
  var jumlah = attending ? Math.max(1, Number(b.jumlah || b.guestCount) || 1) : 0;
  var ticketNo = attending ? String(b.ticketNo || '') : '';
  var message = String(b.ucapan || b.message || '').trim();
  var now = new Date();

  var rsvp = getSheet_(SHEET_RSVP, RSVP_HEADERS);
  appendByHeader_(rsvp, {
    Timestamp: now,
    Nama: name,
    Kehadiran: kehadiran,
    Jumlah: jumlah,
    TicketNo: ticketNo,
    Downloaded: attending ? 'NO' : '',
  });

  if (message) {
    var wish = getSheet_(SHEET_WISH, WISH_HEADERS);
    appendByHeader_(wish, { Timestamp: now, Nama: name, Ucapan: message, Kehadiran: kehadiran });
  }
  if (b.submissionId) cache.put(key, '1', 21600);
  return { status: 'ok' };
}

function markDownloaded_(b) {
  var ticketNo = String(b.ticketNo || '').trim();
  if (!ticketNo) return { status: 'error', message: 'ticketNo kosong' };
  var sheet = getSheet_(SHEET_RSVP, RSVP_HEADERS);
  var cols = headerMap_(sheet);
  var last = sheet.getLastRow();
  if (last < 2) return { status: 'error', message: 'ticket tidak ditemukan' };
  var tickets = sheet.getRange(2, cols.TicketNo, last - 1, 1).getValues();
  for (var i = tickets.length - 1; i >= 0; i--) { // baris terbaru dulu
    if (String(tickets[i][0]).trim() === ticketNo) {
      var row = i + 2;
      sheet.getRange(row, cols.Downloaded).setValue('YES');
      sheet.getRange(row, cols.Kehadiran).setValue(HADIR); // yang punya tiket pasti hadir
      return { status: 'ok' };
    }
  }
  return { status: 'error', message: 'ticket tidak ditemukan' };
}

// ------------------------------------------------------------------ otomatis saat sheet diedit tangan
/** Trigger sederhana (otomatis aktif, tanpa instalasi): isi Kehadiran yang kosong bila TicketNo/Downloaded diisi. */
function onEdit(e) {
  if (!e || !e.range) return;
  var sheet = e.range.getSheet();
  if (sheet.getName() !== SHEET_RSVP) return;
  var cols = headerMap_(sheet);
  var first = e.range.getRow();
  if (first < 2) return;
  for (var r = first; r < first + e.range.getNumRows(); r++) fillKehadiranRow_(sheet, cols, r);
}

/** Jalankan SEKALI dari editor (Run > fixKehadiran) untuk merapikan semua baris lama yang Kehadirannya kosong. */
function fixKehadiran() {
  var sheet = getSheet_(SHEET_RSVP, RSVP_HEADERS);
  var cols = headerMap_(sheet);
  var fixed = 0;
  for (var r = 2; r <= sheet.getLastRow(); r++) if (fillKehadiranRow_(sheet, cols, r)) fixed++;
  Logger.log('Baris yang diisi: ' + fixed);
}

function fillKehadiranRow_(sheet, cols, row) {
  var cell = sheet.getRange(row, cols.Kehadiran);
  if (String(cell.getValue()).trim() !== '') return false;
  var ticket = String(sheet.getRange(row, cols.TicketNo).getValue()).trim();
  var downloaded = String(sheet.getRange(row, cols.Downloaded).getValue()).trim().toUpperCase();
  if (ticket !== '' || downloaded === 'YES') {
    cell.setValue(HADIR);
    return true;
  }
  return false;
}

// ------------------------------------------------------------------ helpers
function isAttending_(b) {
  if (typeof b.attending === 'boolean') return b.attending;
  var k = normalizeKehadiran_(b.kehadiran || b.status);
  return k === HADIR;
}

function normalizeKehadiran_(v) {
  var s = String(v === undefined || v === null ? '' : v).trim().toLowerCase();
  if (!s) return '';
  if (/^(tidak|berhalangan|no|false|0)/.test(s)) return TIDAK_HADIR;
  return HADIR;
}

function getSheet_(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sheet.getLastRow() === 0) sheet.appendRow(headers);
  return sheet;
}

/** {NamaKolom: nomorKolom(1-based)} dari baris header. Kolom wajib yang belum ada ditambahkan di kanan. */
function headerMap_(sheet) {
  var required = sheet.getName() === SHEET_RSVP ? RSVP_HEADERS : WISH_HEADERS;
  var width = Math.max(sheet.getLastColumn(), 1);
  var row = sheet.getRange(1, 1, 1, width).getValues()[0].map(function (h) { return String(h).trim(); });
  required.forEach(function (h) {
    if (row.indexOf(h) === -1) {
      row.push(h);
      sheet.getRange(1, row.length).setValue(h);
    }
  });
  var map = {};
  row.forEach(function (h, i) { if (h) map[h] = i + 1; });
  return map;
}

function appendByHeader_(sheet, values) {
  var cols = headerMap_(sheet);
  var out = new Array(Math.max(sheet.getLastColumn(), Object.keys(cols).length)).fill('');
  Object.keys(values).forEach(function (k) { if (cols[k]) out[cols[k] - 1] = values[k]; });
  sheet.appendRow(out);
}

function readRows_(sheet) {
  var last = sheet.getLastRow();
  if (last < 2) return [];
  var cols = headerMap_(sheet);
  var width = sheet.getLastColumn();
  var data = sheet.getRange(2, 1, last - 1, width).getValues();
  var names = Object.keys(cols);
  return data.map(function (vals, i) {
    var o = { __row: i + 2 };
    names.forEach(function (n) { o[n] = vals[cols[n] - 1]; });
    return o;
  });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
