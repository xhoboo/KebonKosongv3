# Kebon Kosong

Game idle sederhana, tanpa build step (script biasa, bukan ES module, supaya tetap jalan dari `file://`):

- `index.html`: markup dan CSS.
- `js/data.js`: data saja (teks id/en, item, harga, sumber daya, alat, rumus exp).
- `js/game.js`: state, simpan/muat + migrasi, aksi, tempa, jual, progres offline. Tidak menyentuh DOM.
- `js/ui.js`: tampilan, menu, alat, anvil, rumah, pasar, pengaturan, suara (Web Audio, tanpa file), loop animasi.
- `js/debug.js`: mode uji tersembunyi, aktif setelah membuka `#debug` (diingat di localStorage `kebon-kosong-debug`, dimatikan dari halaman Debug). Isinya kecepatan waktu ×1–×1000, majukan waktu (+1 jam … +7 hari, tanpa batas 24 jam, Kebun ikut), tambah Kepeng/bahan/masakan/perlengkapan, buka semua area, atur level apa pun, salin/muat save. Teksnya hanya bahasa Indonesia karena bukan bagian game. Saat menambah sistem baru yang punya level, tambahkan juga ke `levelTargets` dan `refreshAll` di sini.

Simpanan ada di `localStorage` (`kebon-kosong-v2`) dengan field `version`; perubahan bentuk state wajib dimigrasi di `loadState`, jangan reset progres pemain.

## Alur kerja

- Setiap perubahan langsung di-commit dan di-push ke `main` supaya langsung live. Tidak perlu PR dan tidak perlu menunggu konfirmasi untuk push ke `main`.
- Branch kerja boleh tetap dipakai, tapi hasil akhirnya selalu ikut di-push ke `main` (`git push origin HEAD:main`).

## Aturan game

- Pemain hanya bisa menjalankan satu kegiatan dalam satu waktu (menebang, menambang, memancing, memasak, atau berpetualang; tidak bersamaan). Kegiatan dimulai/dihentikan lewat `setActive`. Pengecualian: Kebun tumbuh paralel, dan menempa instan. Menyalakan satu kartu otomatis mematikan kartu lain.
- Setiap sumber daya butuh sekitar 2 hari aksi aktif untuk mencapai level 100, dihitung dengan alat level 0. Node tingkat lebih tinggi lebih lambat per aksi tapi exp per aksinya naik sebanding (tingkat 1–4: 2/3/4/5 detik dan 20/30/40/50 Exp), jadi exp per detik sama. Alat yang ikut naik level mempercepat aksi, jadi nyatanya lebih cepat dari 2 hari; itu disengaja.
- Alat: kapak (pohon di Hutan), beliung (batu di Goa), dan joran (memancing di Sungai). Exp aksi masuk ke level node itu sendiri dan ke alatnya sekaligus.
- Alat butuh sekitar 15 hari aksi nonstop untuk mencapai level 100. Tiap level butuh 10% exp lebih banyak dari level sebelumnya. Tiap level memotong waktu aksi 0,75% (75% di level 100).
- Node kayu/bijih yang lebih bagus terkunci sampai alatnya mencapai tingkat yang cukup. Kapak: Biasa → Berkilau (Jati) → Tembaga (Mahoni) → Besi (Ulin). Beliung: Biasa → Berkilau (Tembaga) → Tembaga (Besi) → Besi (Emas). Joran: Biasa (Sungai) → Lentur (Danau) → Besi (Laut). Syarat Anvil tingkat 1/2/3 = Lv. 1/2/3.
- Sungai terkunci sampai pemain menempa Joran Biasa (150 Kayu Jati + 150 Bijih Tembaga, belum butuh benang; benang dari Kebun baru wajib mulai joran tingkat 2). Memancing: 3 detik, 30 Exp per lemparan; ikan diundi berbobot (Wader, Nila, Lele, Gabus), ikan langka makin sering seiring level, dan joran tingkat lebih tinggi menambah bobot ikan langka (+50% per tingkat di atas 1). Peluang zonk 40% di level 0, 5% di level 100.
- Danau terbuka dengan Joran Lentur, Laut dengan Joran Besi; masing-masing satu node memancing (4 ikan, ikan langka makin sering dengan level dan joran di atas syarat).
- Petualangan lanjutan punya syarat (`req` di `ADVENTURES`): Hutan Dalam (Jarak Dekat Lv. 20), Tepi Sungai (Lv. 15 + Sungai terbuka), Goa Gelap (Lv. 35 + Goa terbuka). Kartu petualangan menampilkan peluang menang tiap musuh dengan senjata yang dipakai.
- Anvil maks Lv. 4, Dapur maks Lv. 4. Perlengkapan tingkat 2 (besi, Anvil Lv. 3) dan tingkat 3 (ulin/emas, Anvil Lv. 4) butuh bahan monster dari petualangan lanjutan.
- Goa terkunci sampai Pohon Akasia Lv. 10. Pemain dari simpanan sebelum versi 5 yang sudah pernah menambang langsung punya Goa terbuka.
- Progres offline (dan tab yang lama tersembunyi) dihitung paling lama 24 jam. Pengecualian: tanaman Kebun memakai jam dunia nyata tanpa batas.
- Kebun (`CROPS`, `FARM` di `data.js`): 2 petak gratis, petak berikutnya dibeli dengan Kepeng (50 × 1,07^(n−3)) sampai 100. Tanam memakai 1 benih; matang setelah waktu tumbuh (Kangkung 1 jam … Durian 5 hari), lalu layu 24 jam setelah matang (petak dibersihkan tanpa hasil). Panen ditahan kalau hasilnya jenis baru dan Rumah penuh. Skill Berkebun: exp tiap panen, membuka tanaman per level, peluang +1 hasil = level/100. Ada Tanam semua (benih terpilih ke semua petak kosong) dan Panen semua (juga membersihkan yang layu).
- Benih biasa (Kangkung, Cabai, Kapas, Jagung) dibeli di Pasar; benih langka (Pisang, Mangga, Durian) hanya dari loot petualangan Hutan Tepi.
- Kapas dipakai untuk Joran Lentur (joran tingkat 2, Anvil Lv. 2). Sayur/buah dipakai resep Dapur (Tumis Kangkung, Jagung Bakar, Pisang Goreng, Rujak Mangga).
- Mata uang: Kepeng. Item dijual di Pasar dengan harga tetap per item (`price` di `ITEMS`); "Jual semua" butuh klik kedua dalam 3 detik.
- Rumah menyimpan item berdasarkan jumlah item **berbeda** (jumlah per item tidak dibatasi): awal 50, +10 per level, maks level 10, upgrade dengan Kepeng + Kayu Akasia + Batu (`HOUSE` di `data.js`). Semua item masuk lewat `addItem`; item jenis baru saat rumah penuh dibuang dan dicatat di Rumah sampai catatannya ditutup. Isi Rumah bisa diurutkan per kategori, jumlah, atau nama.
- Alat di-upgrade dengan menempa di Anvil (`TOOLS` di `data.js`). Bahan tiap tingkat selalu kayu + batu/logam dari tingkat di bawahnya, untuk kapak maupun beliung (Berkilau: 250 Kayu Akasia + 250 Batu). Level dan exp alat tetap. Tingkat Berkilau memberi 5% peluang hasil utama ganda.
- Menempa bukan kegiatan idle dan tidak menghentikan kegiatan yang berjalan: klik, 1,5 detik animasi + tiga dentang palu, lalu hasil keluar. Bahan dipotong dan hasil diundi saat diklik. Gagal = bahan hilang, alat tetap.
- Anvil mulai Lv. 1. Tiap tingkat alat butuh level Anvil minimum; peluang berhasil = dasar per tingkat (Berkilau 90%) + 10% per level Anvil di atas syarat, maks 100%. Upgrade Anvil ke Lv. 2: 1.000 Kepeng + 200 Kayu Jati + 200 Bijih Tembaga.
- Suara bisa dimatikan di Pengaturan.
- Kualitas tempa (`QUALITIES`, `TRAITS` di `data.js`): perlengkapan yang berhasil ditempa diundi kualitasnya: Biasa / Bagus (×1,1) / Istimewa (×1,25) / Pusaka (×1,5 + satu sifat acak yang cocok: Tajam, Ringan, Beruntung untuk senjata; Kokoh, Perkasa, Beruntung untuk armor). Pengali berlaku ke serangan, pertahanan, HP armor, dan harga jual. Peluang di Menempa Lv. 0: 70/22/7/1%, bergeser lurus ke 35/40/20/5% di Lv. 100.
- Item berkualitas memakai key sendiri (`kris`, `kris@good`, `kris@great`, `kris@legend:sharp`) sehingga tiap kualitas/sifat makan satu slot Rumah. Selalu pakai `itemDef(key)`, `nameOf(key)`, `iconOf(key)`, dan `ownedKeys()` untuk item yang bisa berkualitas, bukan `ITEM[key]`/`ITEMS`.
- Skill Menempa: exp per tempa (alat maupun perlengkapan, berhasil maupun gagal) = nilai bahan (jumlah × harga jual dasar); kurva exp node. Menempa perlengkapan butuh satu slot Rumah kosong karena kualitasnya belum diketahui. Alat (kapak, beliung, joran) tidak punya kualitas.
- Pohon: kayu naik dari 40% (Lv. 0) ke 90% (Lv. 100); sisanya Ranting & Daun sama rata, jadi keduanya tidak pernah hilang (5% masing-masing di Lv. 100). Batu/bijih tetap naik ke 100% hasil utama.
- Petualangan (`ADVENTURES`, `ENEMIES`, `ADV`, `BAG` di `data.js`): kegiatan idle, terbuka begitu pemain punya senjata pertama (ditempa di Anvil: Keris 5 dtk/serangan 4, Golok 10 dtk/8, Tombak 15 dtk/14; Rompi Kulit dari bahan monster). Tiap interval senjata terjadi satu encounter berbobot (musuh, temuan item, atau Kepeng). Peluang menang = A²/(A²+P²). Menang → exp Jarak Dekat + loot ke tas; kalah → HP berkurang (dmg × 100/(100+pertahanan)) + exp Armor. Makan otomatis dari tas saat HP ≤ 50%. HP habis → pulang, loot di tas aman. Tas penuh tidak membuat pulang; loot jenis baru ditinggal dan dicatat di jurnal. Tiap petualangan mulai dengan HP penuh.
- Mastery Jarak Dekat (+2% serangan per level) dan Armor (+2 HP maks dan +1 pertahanan per level) memakai kurva exp node.
- Perlengkapan yang dipakai tidak memakan slot Rumah. Pakai/lepas perlengkapan, isi tas, dan simpan dari tas tidak bisa saat sedang berpetualang.
- Tas: kapasitas per item berbeda (awal 5, +2 per level). Rumah → Tas hanya masakan; Tas → Rumah semua item, kecuali Rumah penuh untuk item jenis baru (item tetap di tas). Buang dari tas butuh klik kedua.
- Jurnal menyimpan 80 catatan terakhir (data terstruktur, teks dibuat sesuai bahasa saat ditampilkan) plus ringkasan menang/kalah/Kepeng petualangan terakhir.
- Dapur: memasak adalah kegiatan idle. Tiap masakan memakai bahan (`RECIPES` di `data.js`, key resep = key item hasil) dan menghasilkan 1 masakan; kegiatan berhenti sendiri begitu bahan tidak cukup untuk masakan berikutnya, juga saat offline. Ranting adalah bahan bakar semua resep. Level Dapur (mulai Lv. 1, maks Lv. 3, upgrade dengan Kepeng + bahan) membuka resep. Skill Memasak memakai kurva exp node (±2 hari ke Lv. 100) dan memotong waktu masak 0,5% per level. Masakan punya `heal` (HP yang dipulihkan saat petualangan nanti).

## Rancangan

Arah game yang disepakati (belum semuanya dibuat) ada di `DESIGN.md`. Saat sebuah fitur dari sana selesai, pindahkan aturannya ke bagian "Aturan game" di atas.
