# Rancangan Kebon Kosong (target)

Dokumen ini adalah arah game yang disepakati. Belum semuanya dibuat; `CLAUDE.md` tetap berisi aturan
yang **sudah** berlaku di game. Angka di sini draf dan boleh disetel ulang setelah dicoba.

## Prinsip

- Game idle: dicek beberapa kali sehari, progres offline wajib jalan.
- Gameplay simpel (sedikit tombol, sedikit skill), kerumitan ada di item, resep, dan petualangan.
- Satu kegiatan dalam satu waktu (menebang, menambang, memancing, memasak, berpetualang).
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
| Hutan | menebang kayu | tier kapak |
| Goa | menambang batu & bijih | tier beliung |
| Sungai → Danau → Laut | memancing (ikan acak per area) | tier alat pancing |
| Rumah | kapasitas jenis item | level rumah |
| Dapur | memasak | level dapur membuka resep |
| Anvil | menempa alat, senjata, armor | level anvil membuka barang yang lebih bagus |
| Pasar | jual item, beli benih biasa | — |
| Petualangan | idle di Hutan/Goa/Sungai/Danau/Laut | kedalaman dipilih pemain |

### Kebun
- Punya level (exp dari panen).
- Benih biasa dibeli di Pasar; benih langka hanya dari petualangan.
- Tanaman matang menunggu 24 jam (jam nyata) lalu layu.
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
- Punya level.
- Alat pancing dibuat dari kayu + logam + benang dari Kebun (aturan silang).
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

## Petualangan

- Kegiatan idle di Hutan, Goa, Sungai, Danau, atau Laut, dengan **kedalaman yang dipilih pemain**
  (mis. Hutan Tepi → Hutan Dalam → Hutan Larangan). Musuh dan loot tetap per kedalaman, **tidak** menyesuaikan gear.
- Tiap interval senjata terjadi satu encounter: musuh, loot, atau kejadian.
- Senjata menentukan interval dan serangan (3 jenis, tanpa keunggulan area):
  - Keris: 5 detik per encounter, serangan kecil, mudah kalah dari musuh kuat.
  - Golok: di tengah.
  - Tombak: 15 detik per encounter, serangan besar, bisa menang melawan musuh kuat.
- Petualangan air (Sungai/Danau/Laut) memberi musuh air dan harta karun, bukan ikan biasa (ikan dari Memancing).
- **Tas** membatasi bekal makanan dan loot yang bisa dibawa pulang; bisa di-upgrade.
- Armor mengurangi HP yang hilang saat kalah.
- Petualangan punya **HP**. Kalah dalam encounter = HP berkurang. Makan otomatis dari masakan yang dibawa.
  HP habis = pulang; **loot yang sudah didapat tetap dibawa** (tanpa hukuman selain waktu).
- Tas penuh **tidak** membuat pulang: petualangan jalan terus (loot baru dibuang dan dicatat di jurnal) sampai HP habis.
- Level petualangan per gaya (mastery). Awal hanya dua:
  - **Jarak Dekat**: exp dari mengalahkan musuh, menaikkan serangan.
  - **Armor**: exp dari menerima serangan, menaikkan HP maksimal dan mengurangi damage.
  - Jarak jauh dan magic menyusul di fase akhir. Musuh tidak punya kelemahan terhadap gaya tertentu.
- Tas & Rumah:
  - Selesai petualangan, pemain memilih item tas mana yang masuk Rumah dan mana yang dibuang;
    yang tidak dibuang boleh tetap di tas (mis. kalau Rumah penuh) lalu lanjut berpetualang.
  - Rumah → Tas: hanya item **bekal** (makanan, dan item lain yang membantu petualangan).
  - Tas → Rumah: semua item.
  - Kapasitas tas dihitung per item berbeda (seperti Rumah), jumlah per item tidak dibatasi.
- **Jurnal** mencatat setiap encounter dan loot, termasuk item yang dibuang karena rumah penuh.

## Pembukaan area

- Awal: Hutan dan Kebun, plus Pasar, Rumah, Dapur, Anvil.
- Goa: Akasia Lv 10 (±2 menit).
- Sungai: punya alat pancing tier 1 (butuh logam + benang, jadi otomatis setelah Goa dan Kebun).
- Danau / Laut: alat pancing tier 2 / 3.
- Petualangan: punya senjata pertama.
- Migrasi save: pemain lama yang sudah punya progres Goa langsung punya Goa terbuka.

## Keputusan tertunda (putuskan setelah game dicoba)

- Daftar isi konkret: nama & angka item, ikan, tanaman, musuh, masakan.
- Harga jual, biaya slot Kebun, upgrade bangunan, upgrade tas.

## Urutan pengerjaan

1. ✅ Pecah `index.html` ke `js/data.js`, `js/game.js`, `js/ui.js` (script biasa, tanpa build), save v3 + migrasi, Kepeng + jual item, batas offline 24 jam.
2. Rumah (batas jenis item).
3. Hutan & Goa dengan rantai alat silang (tier 1–2), Anvil dasar.
4. Sungai & alat pancing.
5. Dapur.
6. Petualangan + jurnal (Hutan Tepi, Keris vs Tombak).
7. Kualitas tempa.
8. Kebun.
9. Danau, Laut, kedalaman petualangan lanjutan, tier 3–4.
