# Kebon Kosong

Game idle sederhana, tanpa build step (script biasa, bukan ES module, supaya tetap jalan dari `file://`):

- `index.html`: markup dan CSS.
- `js/data.js`: data saja (teks id/en, item, harga, sumber daya, alat, rumus exp).
- `js/game.js`: state, simpan/muat + migrasi, aksi, tempa, jual, progres offline. Tidak menyentuh DOM.
- `js/ui.js`: tampilan, menu, alat, anvil, rumah, pasar, pengaturan, suara (Web Audio, tanpa file), loop animasi.

Simpanan ada di `localStorage` (`kebon-kosong-v2`) dengan field `version`; perubahan bentuk state wajib dimigrasi di `loadState`, jangan reset progres pemain.

## Alur kerja

- Setiap perubahan langsung di-commit dan di-push ke `main` supaya langsung live. Tidak perlu PR dan tidak perlu menunggu konfirmasi untuk push ke `main`.
- Branch kerja boleh tetap dipakai, tapi hasil akhirnya selalu ikut di-push ke `main` (`git push origin HEAD:main`).

## Aturan game

- Pemain hanya bisa menjalankan satu kegiatan dalam satu waktu (menebang atau menambang, tidak bersamaan). Menyalakan satu kartu otomatis mematikan kartu lain.
- Setiap sumber daya butuh sekitar 2 hari aksi aktif untuk mencapai level 100, dihitung dengan alat level 0. Node tingkat lebih tinggi lebih lambat per aksi tapi exp per aksinya naik sebanding (Akasia/Batu 2 detik 20 Exp, Jati/Tembaga 3 detik 30 Exp), jadi exp per detik sama. Alat yang ikut naik level mempercepat aksi, jadi nyatanya lebih cepat dari 2 hari; itu disengaja.
- Alat: kapak (pohon di Hutan) dan beliung (batu di Goa). Exp aksi masuk ke level node itu sendiri dan ke alatnya sekaligus.
- Alat butuh sekitar 15 hari aksi nonstop untuk mencapai level 100. Tiap level butuh 10% exp lebih banyak dari level sebelumnya. Tiap level memotong waktu aksi 0,75% (75% di level 100).
- Node kayu/bijih yang lebih bagus terkunci sampai alatnya mencapai tingkat yang cukup (Jati butuh Kapak Berkilau, Tembaga butuh Beliung Berkilau).
- Goa terkunci sampai Pohon Akasia Lv. 10. Pemain dari simpanan sebelum versi 5 yang sudah pernah menambang langsung punya Goa terbuka.
- Progres offline (dan tab yang lama tersembunyi) dihitung paling lama 24 jam.
- Mata uang: Kepeng. Item dijual di Pasar dengan harga tetap per item (`price` di `ITEMS`); "Jual semua" butuh klik kedua dalam 3 detik.
- Rumah menyimpan item berdasarkan jumlah item **berbeda** (jumlah per item tidak dibatasi): awal 50, +10 per level, maks level 10, upgrade dengan Kepeng + Kayu Akasia + Batu (`HOUSE` di `data.js`). Semua item masuk lewat `addItem`; item jenis baru saat rumah penuh dibuang dan dicatat di Rumah sampai catatannya ditutup. Isi Rumah bisa diurutkan per kategori, jumlah, atau nama.
- Alat di-upgrade dengan menempa di Anvil (`TOOLS` di `data.js`). Bahan tiap tingkat selalu kayu + batu/logam dari tingkat di bawahnya, untuk kapak maupun beliung (Berkilau: 250 Kayu Akasia + 250 Batu). Level dan exp alat tetap. Tingkat Berkilau memberi 5% peluang hasil utama ganda.
- Menempa bukan kegiatan idle dan tidak menghentikan kegiatan yang berjalan: klik, 1,5 detik animasi + tiga dentang palu, lalu hasil keluar. Bahan dipotong dan hasil diundi saat diklik. Gagal = bahan hilang, alat tetap.
- Anvil mulai Lv. 1. Tiap tingkat alat butuh level Anvil minimum; peluang berhasil = dasar per tingkat (Berkilau 90%) + 10% per level Anvil di atas syarat, maks 100%. Upgrade Anvil ke Lv. 2: 1.000 Kepeng + 200 Kayu Jati + 200 Bijih Tembaga.
- Suara bisa dimatikan di Pengaturan.

## Rancangan

Arah game yang disepakati (belum semuanya dibuat) ada di `DESIGN.md`. Saat sebuah fitur dari sana selesai, pindahkan aturannya ke bagian "Aturan game" di atas.
