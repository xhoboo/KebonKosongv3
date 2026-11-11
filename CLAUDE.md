# Kebon Kosong

Game idle sederhana, tanpa build step (script biasa, bukan ES module, supaya tetap jalan dari `file://`):

- `index.html`: markup dan CSS.
- `js/data.js`: data saja (teks id/en, item, harga, sumber daya, alat, rumus exp).
- `js/game.js`: state, simpan/muat + migrasi, aksi, jual, progres offline. Tidak menyentuh DOM.
- `js/ui.js`: tampilan, menu, pasar, pengaturan, loop animasi.

Simpanan ada di `localStorage` (`kebon-kosong-v2`) dengan field `version`; perubahan bentuk state wajib dimigrasi di `loadState`, jangan reset progres pemain.

## Alur kerja

- Setiap perubahan langsung di-commit dan di-push ke `main` supaya langsung live. Tidak perlu PR dan tidak perlu menunggu konfirmasi untuk push ke `main`.
- Branch kerja boleh tetap dipakai, tapi hasil akhirnya selalu ikut di-push ke `main` (`git push origin HEAD:main`).

## Aturan game

- Pemain hanya bisa menjalankan satu kegiatan dalam satu waktu (menebang atau menambang, tidak bersamaan). Menyalakan satu kartu otomatis mematikan kartu lain.
- Setiap sumber daya butuh sekitar 2 hari aksi aktif (±86 ribu aksi) untuk mencapai level 100, dihitung dengan kapak level 0. Kapak yang ikut naik level mempercepat ayunan, jadi Pohon Akasia nyatanya selesai sekitar 1,15 hari; itu disengaja.
- Exp dari menebang pohon (Akasia 20 Exp per tebang) masuk ke level pohon itu sendiri dan ke kapak sekaligus.
- Kapak butuh sekitar 15 hari menebang Akasia nonstop untuk mencapai level 100. Tiap level butuh 10% exp lebih banyak dari level sebelumnya (awal cepat, akhir sangat lama). Tiap level memotong waktu ayunan ke pohon 0,75% (75% di level 100).
- Progres offline (dan tab yang lama tersembunyi) dihitung paling lama 24 jam.
- Mata uang: Kepeng. Item dijual di Pasar dengan harga tetap per item (`price` di `ITEMS`); "Jual semua" butuh klik kedua dalam 3 detik.
- Upgrade Kapak Biasa → Kapak Berkilau (250 Kayu Akasia + 250 Batu) bisa kapan saja, level dan exp kapak tetap, dan memberi 5% peluang dapat 2 kayu.

## Rancangan

Arah game yang disepakati (belum semuanya dibuat) ada di `DESIGN.md`. Saat sebuah fitur dari sana selesai, pindahkan aturannya ke bagian "Aturan game" di atas.
