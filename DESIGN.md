# Rancangan Kebon Kosong (target)

Dokumen ini adalah arah game yang disepakati. Belum semuanya dibuat; `CLAUDE.md` tetap berisi aturan
yang **sudah** berlaku di game. Angka di sini draf dan boleh disetel ulang setelah dicoba.

## Prinsip

- Game idle: dicek beberapa kali sehari, progres offline wajib jalan.
- Gameplay simpel (sedikit tombol, sedikit skill), kerumitan ada di item, resep, dan petualangan.
- Satu kegiatan dalam satu waktu (menjelajah, memancing, memasak).
  **Pengecualian: Kebun** tumbuh paralel; menanam/panen instan, lalu pemain bebas melakukan kegiatan lain.
  **Menempa bukan kegiatan idle**: klik, animasi + suara tempa 1–2 detik, hasil langsung keluar.
  Menempa **tidak** menghentikan kegiatan yang sedang berjalan. Memasak tetap kegiatan idle.
- Progres offline dibatasi 24 jam. **Pengecualian: tanaman Kebun** memakai jam dunia nyata (tanaman 5 hari tetap matang walau pemain offline 5 hari).
- Dua bahasa wajib: Indonesia dan English, termasuk nama item dan teks jurnal.
- Game punya suara (mulai dari menempa) dengan tombol bisu di Pengaturan.
- Setiap skill butuh hasil skill lain. Tidak ada jalur yang bisa dilewati.
- Target menamatkan semua: **2–3 bulan**. Tiap sumber daya/skill tetap ±2 hari aksi aktif ke Lv 100 (semua tier sama).
  Panjangnya datang dari jumlah jalur yang tidak bisa jalan bersamaan, plus hal langka (Pusaka, benih langka, drop boss).
  Tidak ada pembukaan yang butuh Lv 100.

## Mata uang: Kepeng

- Didapat dari menjual item dan dari loot petualangan.
- Dipakai untuk: slot Kebun, upgrade Rumah, Dapur, Anvil (bangunan = Kepeng + bahan).
- **Pasar**: jual item dengan harga tetap; toko hanya menjual benih biasa.

## Area

| Area | Kegiatan | Gerbang |
|---|---|---|
| Kebun | menanam sayur & buah (paralel) | slot |
| Hutan | jelajah 4 tier (kayu, ranting, daun, rotan, benih langka, musuh hutan) | rank kapak + tier sebelumnya Lv. 25 |
| Goa | jelajah 4 tier (batu, bijih, kristal, musuh goa) | rank beliung + tier sebelumnya Lv. 25 |
| Laut | jelajah 4 tier (ikan laut, kerang, karang, mutiara, musuh laut) | Tombak Bertali; rank tombak + tier sebelumnya Lv. 25 |
| Sungai → Danau | memancing (ikan acak per area) | tier joran |
| Rumah | kapasitas jenis item | level rumah |
| Dapur | memasak | level dapur membuka resep |
| Anvil | menempa alat, senjata, armor | level anvil membuka barang yang lebih bagus |
| Pasar | jual item, beli benih biasa | — |

### Kebun
- Punya level (exp dari panen).
- Benih biasa dibeli di Pasar; benih langka hanya dari petualangan.
- Tanaman matang menunggu 24 jam (jam nyata) lalu layu.
- 2 slot gratis, slot berikutnya dibeli dengan Kepeng, biaya naik tiap slot, maksimal 100.
- Waktu tumbuh lama: tanaman tier terendah 1–2 jam, makin tinggi tier makin lama.
- Wajib ada tombol "Tanam semua" dan "Panen semua".
- Hasil kebun harus terserap: bahan dapur, dijual, bahan resep lain.

### Hutan, Goa, Laut: jelajah dengan rantai alat silang
- Tiap wilayah punya 4 tier area (Hutan Tepi → Hutan Dalam → Hutan Rimba → Hutan Larangan; Mulut Goa → Lorong Goa →
  Goa Gelap → Perut Bumi; Pantai → Terumbu Karang → Laut Lepas → Palung Laut), masing-masing dengan level 0–100.
- Maju per meter: Manual (klik, 1 dtk/m) atau Auto (10 → 2 dtk/m seiring level area). Tiap meter satu encounter.
- Musuh dilawan dengan alat wilayahnya; alat tidak punya level, hanya serangan per rank. Senjata menunggu dungeon.
- Bahan alat rank r selalu kayu + batu/logam tier r−1, sehingga Hutan dan Goa harus naik bergantian.
  Tidak boleh ada resep yang butuh bahan dari tier yang dikunci olehnya.
- Rincian aturan yang sudah berlaku ada di `CLAUDE.md`.

Draf tier bahan:

| Tier | Kayu | Batu/Bijih | Laut |
|---|---|---|---|
| 1 | Akasia | Batu | Kembung, Kerang |
| 2 | Jati | Tembaga | Tongkol, Karang |
| 3 | Mahoni | Besi | Kakap |
| 4 | Ulin | Emas | Kerapu |

### Nanti
- Alat tier 5–6 untuk bagian dalam T3/T4.
- Dungeon (area khusus monster) tempat senjata Keris/Golok/Tombak dipakai; resep senjata & armor masih ada di data.
- Kegunaan loot monster baru (kulit, taring, sisik, mustika).

### Memancing
- Punya level.
- Alat pancing dibuat dari kayu + logam + benang dari Kebun (aturan silang). Pengecualian: Joran Biasa (tingkat 1) belum butuh benang, supaya Sungai tidak menunggu Kebun.
- Tiap area punya beberapa jenis ikan, diundi acak; ikan makin bagus makin jarang.
- Area lebih sulit butuh alat pancing tier lebih tinggi (Sungai → Danau → Laut), kalau belum punya, area terkunci.
- Alat pancing juga lebih baik = peluang ikan langka naik.

### Rumah
- Kapasitas dihitung per item berbeda, bukan jumlah: 10.000 Kayu Ulin = 1 slot. Kapasitas awal 50 item berbeda, bertambah lewat upgrade Rumah.
- Item yang sama dengan kualitas berbeda = item berbeda.
- Inventory bisa disortir berdasarkan kategori (kayu, batu/logam, ikan, sayur, masakan, alat, senjata, ...).
- Kalau penuh, item jenis baru dibuang dan dicatat (di jurnal/log). Item bisa dijual untuk membebaskan slot.

### Dapur
- Level dapur membuka resep yang lebih kompleks; skill Memasak mempercepat.
- Masakan = HP untuk petualangan. Bahan: sayur/buah kebun, ikan, bahan dari petualangan, Ranting sebagai bahan bakar.

### Anvil
- Menempa alat (kapak, beliung, alat pancing), senjata, dan armor. Instan per klik (lihat Prinsip).
- Level anvil (upgrade dengan Kepeng + bahan) dibutuhkan untuk menempa barang tier lebih tinggi.
- Ada peluang **gagal: bahan hilang**. Peluang berhasil ditentukan **selisih tier**: anvil yang levelnya pas dengan tier barang paling berisiko, anvil di atas tier barang makin aman.
- Exp Menempa dihitung terhadap bahan yang dipakai, bukan per klik.
- Skill Menempa (exp per tempa) menaikkan peluang kualitas: Biasa / Bagus (+10%) / Istimewa (+25%) / Pusaka (+50% + 1 sifat).

## Jelajah (pengganti Petualangan)

- **Tas** membatasi bekal makanan dan loot yang bisa dibawa pulang (per item berbeda); bisa di-upgrade.
- **HP**: menang tetap kena sedikit (10%), kalah kena penuh. Makan otomatis dari masakan yang dibawa.
  HP habis = kembali ke rumah dari 0 m; **isi tas tetap aman**.
- Tas penuh **tidak** membuat pulang: loot baru ditinggal dan dicatat di jurnal.
- Mastery **Armor**: exp dari bertarung (menang 50%, kalah 100%), menaikkan HP maksimal dan pertahanan.
- Isi tas dipilah di Rumah; yang tidak dipilah boleh tetap dibawa ke perjalanan berikutnya.
- **Jurnal** mencatat setiap meter (encounter, loot, makan, tas penuh) untuk semua wilayah.

## Pembukaan area

- Awal: Hutan T1, Goa T1, Kebun, Pasar, Rumah, Dapur, Anvil.
- Laut: Tombak Bertali (Akasia + Batu + Rotan).
- Sungai / Danau: Joran Biasa (Akasia + Batu) / Joran Lentur (+ Kapas).
- Tier 2–4 tiap wilayah: tier sebelumnya Lv. 25 + rank alat.

## Keputusan tertunda (putuskan setelah game dicoba)

- Daftar isi konkret: nama & angka item, ikan, tanaman, musuh, masakan.
- Harga jual, biaya slot Kebun, upgrade bangunan, upgrade tas.

## Urutan pengerjaan

1. ✅ Pecah `index.html` ke `js/data.js`, `js/game.js`, `js/ui.js` (script biasa, tanpa build), save v3 + migrasi, Kepeng + jual item, batas offline 24 jam.
2. ✅ Rumah (batas item berbeda, upgrade, sortir, catatan item dibuang).
3. ✅ Hutan & Goa dengan rantai alat silang (tier 1–2), Anvil dasar, Goa terbuka di Akasia Lv. 10, suara tempa.
4. ✅ Sungai & alat pancing (Joran Biasa, 4 ikan sungai).
5. ✅ Dapur (6 resep ikan/daun, Dapur Lv. 1–3, skill Memasak).
6. ✅ Petualangan + jurnal (Hutan Tepi, Keris/Golok/Tombak, Rompi Kulit, tas, mastery Jarak Dekat & Armor).
7. ✅ Kualitas tempa (Biasa/Bagus/Istimewa/Pusaka + sifat, skill Menempa).
8. ✅ Kebun (petak berbayar sampai 100, 7 tanaman, benih langka dari Hutan Tepi, Joran Lentur dari Kapas).
9. ✅ Danau, Laut, kedalaman petualangan lanjutan (Hutan Dalam, Tepi Sungai, Goa Gelap), tingkat 3–4 (Mahoni/Besi, Ulin/Emas), perlengkapan tingkat 2–3, Anvil & Dapur Lv. 4.
10. ✅ Perombakan Jelajah: Hutan/Goa/Laut jadi wilayah jelajah 4 tier per meter (manual/auto), Petualangan dan node tebang/tambang dihapus, progres dimulai ulang (save v3).
