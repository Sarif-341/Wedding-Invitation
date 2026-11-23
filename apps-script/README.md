# Google Apps Script untuk RSVP & Papan Ucapan

`Code.gs` di folder ini adalah isi lengkap script yang menjalankan endpoint di `sheetsApi.endpoint` (`src/data/weddingData.ts`).
Script ini **tidak ikut ter-deploy bersama website**; ia hidup di Google Spreadsheet Anda.

## Pasang / perbarui (±3 menit)

1. Buka Spreadsheet → **Extensions › Apps Script**.
2. Hapus isi `Code.gs` yang lama, tempel seluruh isi [`Code.gs`](./Code.gs), lalu **Save**.
3. **Deploy › Manage deployments** → ikon pensil pada deployment Web App yang sudah ada → **Version: New version** → **Deploy**.
   Dengan cara ini URL `/exec` **tetap sama**, jadi website tidak perlu diubah.
   (Pengaturan: *Execute as: Me*, *Who has access: Anyone*.)
4. Pilih fungsi `fixKehadiran` di bilah atas editor → **Run** (sekali saja; izinkan akses bila diminta).
   Ini mengisi `Kehadiran = Hadir` pada baris lama yang punya TicketNo atau `Downloaded = YES` tetapi Kehadirannya masih kosong.

## Hasilnya

| Kejadian | Kolom `RSVP` |
|---|---|
| Tamu kirim RSVP "Hadir" | `Kehadiran = Hadir`, `Jumlah = n`, `TicketNo` terisi, `Downloaded = NO` |
| Tamu kirim RSVP "Berhalangan" | `Kehadiran = Tidak Hadir`, `Jumlah = 0`, TicketNo & Downloaded kosong |
| Tamu mengunduh tiket | `Downloaded = YES` dan `Kehadiran = Hadir` (otomatis) |
| Anda mengisi TicketNo / Downloaded manual | `Kehadiran` yang kosong terisi `Hadir` (trigger `onEdit`, tanpa instalasi) |

- Kolom dicari berdasarkan nama header (`Timestamp`, `Nama`, `Kehadiran`, `Jumlah`, `TicketNo`, `Downloaded`), jadi urutannya bebas; header yang hilang ditambahkan otomatis.
- Kiriman ulang dari form yang sama (`submissionId` sama) tidak membuat baris ganda.
- Tab `Ucapan` memakai header `Timestamp`, `Nama`, `Ucapan`, `Kehadiran`; `GET` mengembalikan `{status, messages:[{id,name,message,status,timestamp}]}`.
