# Rancangan Kebon Kosong (target)

Dokumen ini adalah arah game yang disepakati. Belum semuanya dibuat; `CLAUDE.md` tetap berisi aturan
yang **sudah** berlaku di game. Angka di sini draf dan boleh disetel ulang setelah dicoba.

## Prinsip

- Game idle: dicek beberapa kali sehari, progres offline wajib jalan.
- Gameplay simpel (sedikit tombol, sedikit skill), kerumitan ada di item, resep, dan petualangan.
- Satu kegiatan dalam satu waktu (menebang, menambang, memancing, memasak, berpetualang).
  **Pengecualian: Kebun** tumbuh paralel; menanam/panen instan, lalu pemain bebas melakukan kegiatan lain.
  **Menempa bukan kegiatan idle**: klik, animasi + suara tempa 1–2 detik, hasil langsung keluar.
- Setiap skill butuh hasil skill lain. Tidak ada jalur yang bisa dilewati.

## Mata uang: Kepeng

- Didapat dari menjual item dan dari loot petualangan.
- Dipakai untuk: slot Kebun, upgrade Rumah, Dapur, Anvil (bangunan = Kepeng + bahan).

## Area

| Area | Kegiatan | Gerbang |
|---|---|---|
| Kebun | menanam sayur & buah (paralel) | slot |
| Hutan | menebang kayu | tier kapak |
| Goa | menambang batu & bijih | tier beliung |
| Sungai → Danau → Laut | memancing (ikan acak per area) | tier alat pancing |
| Rumah | kapasitas jenis item | level rumah |
| Dapur | memasak | level dapur membuka resep |
| Anvil | menempa alat, senjata, armor | level anvil menaikkan peluang berhasil |
| Petualangan | idle di Hutan/Goa/Sungai/Danau/Laut | kedalaman dipilih pemain |

### Kebun
- 2 slot gratis, slot berikutnya dibeli dengan Kepeng, biaya naik tiap slot, maksimal 100.
- Waktu tumbuh lama: tanaman tier terendah 1–2 jam, makin tinggi tier makin lama.
- Wajib ada tombol "Tanam semua" dan "Panen semua".
- Hasil kebun harus terserap: bahan dapur, dijual, bahan resep lain.

### Hutan & Goa: rantai alat silang
- Kayu lebih keras butuh kapak tier lebih tinggi; bijih lebih bagus butuh beliung tier lebih tinggi.
  Tanpa alatnya, node itu terkunci.
- Alat tier N didapat dengan meng-upgrade alat tier N−1 di Anvil.
- Bahan upgrade **selalu kayu + batu/logam dari tier di bawahnya**, untuk kapak maupun beliung,
  sehingga Hutan dan Goa harus naik bergantian. Tidak boleh ada resep yang butuh bahan dari tier yang dikunci olehnya.
- Kapak Berkilau (sudah ada di game) = kapak tier 2, pembuka Jati.
- Level & exp alat tetap saat di-upgrade. Alat membuka node; level node menambah drop dan kecepatan.

Draf tier:

| Tier | Kayu | Batu/Bijih |
|---|---|---|
| 1 | Akasia | Batu |
| 2 | Jati | Tembaga |
| 3 | Mahoni | Besi |
| 4 | Ulin | Emas |

### Memancing
- Tiap area punya beberapa jenis ikan, diundi acak; ikan makin bagus makin jarang.
- Area lebih sulit butuh alat pancing tier lebih tinggi (Sungai → Danau → Laut), kalau belum punya, area terkunci.
- Alat pancing juga lebih baik = peluang ikan langka naik.

### Rumah
- Kapasitas dihitung per **jenis** item, bukan jumlah (10.000 Kayu Ulin = 1 slot).
- Item yang sama dengan kualitas berbeda = jenis berbeda.
- Kalau penuh, item jenis baru dibuang dan dicatat (di jurnal/log). Item bisa dijual untuk membebaskan slot.

### Dapur
- Level dapur membuka resep yang lebih kompleks; skill Memasak mempercepat.
- Masakan = HP untuk petualangan. Bahan: sayur/buah kebun, ikan, bahan dari petualangan, Ranting sebagai bahan bakar.

### Anvil
- Menempa alat (kapak, beliung, alat pancing), senjata, dan armor. Instan per klik (lihat Prinsip).
- Ada peluang **gagal: bahan hilang**. Level anvil menaikkan peluang berhasil.
- Draf peredam: tier rendah hampir selalu berhasil; peluang gagal hanya terasa di tier atas.
- Kalau berhasil, skill Menempa menentukan kualitas: Biasa / Bagus (+10%) / Istimewa (+25%) / Pusaka (+50% + 1 sifat).

## Petualangan

- Kegiatan idle di Hutan, Goa, Sungai, Danau, atau Laut, dengan **kedalaman yang dipilih pemain**
  (mis. Hutan Tepi → Hutan Dalam → Hutan Larangan). Musuh dan loot tetap per kedalaman, **tidak** menyesuaikan gear.
- Tiap interval senjata terjadi satu encounter: musuh, loot, atau kejadian.
- Senjata menentukan interval dan serangan:
  - Keris: 5 detik per encounter, serangan kecil, mudah kalah dari musuh kuat.
  - Tombak: 15 detik per encounter, serangan besar, bisa menang melawan musuh kuat.
- Armor mengurangi HP yang hilang saat kalah.
- Petualangan punya **HP**. Kalah dalam encounter = HP berkurang. Makan otomatis dari masakan yang dibawa.
  HP habis = pulang; **loot yang sudah didapat tetap dibawa** (tanpa hukuman selain waktu).
- **Jurnal** mencatat setiap encounter dan loot, termasuk item yang dibuang karena rumah penuh.

## Urutan pengerjaan

1. Pecah `index.html` ke `js/data.js`, `js/game.js`, `js/ui.js` (script biasa, tanpa build), save v3 + migrasi, Kepeng + jual item.
2. Rumah (batas jenis item).
3. Hutan & Goa dengan rantai alat silang (tier 1–2), Anvil dasar.
4. Sungai & alat pancing.
5. Dapur.
6. Petualangan + jurnal (Hutan Tepi, Keris vs Tombak).
7. Kualitas tempa.
8. Kebun.
9. Danau, Laut, kedalaman petualangan lanjutan, tier 3–4.
