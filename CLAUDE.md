# Kebon Kosong

Game idle sederhana dalam satu file: `index.html`.

## Alur kerja

- Setiap perubahan langsung di-commit dan di-push ke `main` supaya langsung live. Tidak perlu PR dan tidak perlu menunggu konfirmasi untuk push ke `main`.
- Branch kerja boleh tetap dipakai, tapi hasil akhirnya selalu ikut di-push ke `main` (`git push origin HEAD:main`).

## Aturan game

- Pemain hanya bisa menjalankan satu kegiatan dalam satu waktu (menebang atau menambang, tidak bersamaan). Menyalakan satu kartu otomatis mematikan kartu lain.
- Setiap sumber daya butuh sekitar 2 hari aksi aktif (±86 ribu aksi) untuk mencapai level 100, dihitung dengan kapak level 0. Kapak yang ikut naik level mempercepat ayunan, jadi Pohon Akasia nyatanya selesai sekitar 1,15 hari; itu disengaja.
- Exp dari menebang pohon (Akasia 20 Exp per tebang) masuk ke level pohon itu sendiri dan ke kapak sekaligus.
- Kapak butuh sekitar 15 hari menebang Akasia nonstop untuk mencapai level 100. Tiap level butuh 10% exp lebih banyak dari level sebelumnya (awal cepat, akhir sangat lama). Tiap level memotong waktu ayunan ke pohon 0,75% (75% di level 100).
- Upgrade Kapak Biasa → Kapak Berkilau (250 Kayu Akasia + 250 Batu) bisa kapan saja, level dan exp kapak tetap, dan memberi 5% peluang dapat 2 kayu.
