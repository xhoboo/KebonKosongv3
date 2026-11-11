// Data game: teks, item, sumber daya, alat. Hanya data dan rumus, tanpa state atau DOM.

const TEXT = {
  id: {
    trees: 'Pohon', cave: 'Goa', inventory: 'Inventory', market: 'Pasar', settings: 'Pengaturan',
    acacia: 'Pohon Akasia', rock: 'Batu', seconds: 'detik',
    acaciaWood: 'Kayu Akasia', twig: 'Ranting', leaf: 'Daun', stone: 'Batu', pebble: 'Kerikil',
    miss: 'Zonk', empty: 'Belum ada item.',
    theme: 'Tema', light: 'Terang', dark: 'Gelap', language: 'Bahasa',
    openMenu: 'Buka menu', level: 'Level',
    axeBasic: 'Kapak Biasa', axeShiny: 'Kapak Berkilau', axeInterval: 'Interval kapak', doubleWood: 'Peluang 2 kayu',
    max: 'Maks', upgradeTo: name => `Upgrade ke ${name}`,
    progress: 'Progres', reset: 'Klik 3 kali untuk reset progress', resetLeft: n => `Klik ${n} kali lagi`,
    kepeng: 'Kepeng', marketEmpty: 'Belum ada item untuk dijual.', each: 'per item',
    sellOne: 'Jual 1', sellAll: 'Jual semua', sure: 'Yakin?',
  },
  en: {
    trees: 'Trees', cave: 'Cave', inventory: 'Inventory', market: 'Market', settings: 'Settings',
    acacia: 'Acacia Tree', rock: 'Rock', seconds: 'sec',
    acaciaWood: 'Acacia Wood', twig: 'Twig', leaf: 'Leaf', stone: 'Stone', pebble: 'Pebble',
    miss: 'Miss', empty: 'No items yet.',
    theme: 'Theme', light: 'Light', dark: 'Dark', language: 'Language',
    openMenu: 'Open menu', level: 'Level',
    axeBasic: 'Basic Axe', axeShiny: 'Shiny Axe', axeInterval: 'Axe interval', doubleWood: 'Chance of 2 wood',
    max: 'Max', upgradeTo: name => `Upgrade to ${name}`,
    progress: 'Progress', reset: 'Click 3 times to reset progress', resetLeft: n => `Click ${n} more ${n === 1 ? 'time' : 'times'}`,
    kepeng: 'Kepeng', marketEmpty: 'No items to sell yet.', each: 'each',
    sellOne: 'Sell 1', sellAll: 'Sell all', sure: 'Sure?',
  },
};

// Tidak ada emoji kerikil, jadi digambar sendiri
const PEBBLE_ICON = '<svg class="emoji" viewBox="0 0 24 24" aria-hidden="true">' +
  '<ellipse cx="7" cy="16" rx="5" ry="4" fill="#9a958c"/><ellipse cx="16.5" cy="17" rx="4.5" ry="3.5" fill="#7f7a72"/>' +
  '<ellipse cx="12" cy="9.5" rx="4" ry="3.2" fill="#b8b2a8"/></svg>';

// Mata uang
const KEPENG_ICON = '🪙';

// Semua item yang bisa didapat, sesuai urutan tampil di inventory.
// price = harga jual per item di Pasar dalam Kepeng (draf, disetel setelah dicoba).
const ITEMS = [
  { key: 'acaciaWood', icon: '🪵', price: 2 },
  { key: 'twig', icon: '🌿', price: 1 },
  { key: 'leaf', icon: '🍃', price: 1 },
  { key: 'stone', icon: '🪨', price: 2 },
  { key: 'pebble', icon: PEBBLE_ICON, price: 1 },
];
const icons = Object.fromEntries(ITEMS.map(it => [it.key, it.icon]));
const prices = Object.fromEntries(ITEMS.map(it => [it.key, it.price]));

// Progres offline (dan saat tab tidak terlihat) paling lama dihitung 24 jam
const OFFLINE_CAP = 24 * 60 * 60 * 1000;

// Level sumber daya: tiap aksi memberi exp sebesar xp node-nya (20). Bagian eksponensial menjaga awal tetap cepat,
// bagian kubik membuat level atas makin berat.
// Dengan aksi 2 detik, kira-kira: Lv 10 ≈ 2 menit, Lv 50 ≈ 2 jam, Lv 75 ≈ 11,5 jam, Lv 100 ≈ 2 hari.
const MAX_LEVEL = 100;
const xpNeeded = level => 20 * Math.floor(4 * 1.07 ** level + 0.0015 * level ** 3);

// Kapak: dapat exp yang sama dari menebang pohon, tiap level memotong waktu ayunan 0,75% (75% di level 100).
// Tiap level butuh 10% exp lebih banyak dari level sebelumnya: awal cepat, akhir sangat lama.
// Menebang Akasia nonstop (20 Exp, ayunan makin cepat):
// Lv 10 ≈ 7 menit, Lv 25 ≈ 40 menit, Lv 50 ≈ 6,5 jam, Lv 75 ≈ 2 hari, Lv 90 ≈ 7 hari, Lv 100 ≈ 15 hari.
const AXE_CUT = 0.0075;
const axeXpNeeded = level => Math.round(283 * 1.1 ** level);
// Tingkat kapak; cost = bahan untuk upgrade ke tingkat itu, double = peluang dapat 2 kayu sekali tebang
const AXES = [
  { key: 'axeBasic', double: 0 },
  { key: 'axeShiny', double: 0.05, cost: { acaciaWood: 250, stone: 250 } },
];

// Sumber daya yang bisa dikerjakan. drops(p) → [item, peluang]; p = level / 100.
// Item utama naik lurus dari peluang awal ke 100% di level 100; sisanya dibagi dengan rasio tetap.
// xp = exp per aksi untuk level sumber daya itu. Pohon (tool: 'axe') memberi exp yang sama ke kapak
// dan ayunannya dipercepat oleh level kapak.
const NODES = {
  acacia: {
    area: 'pohon', icon: '🌳', time: 2000, xp: 20, tool: 'axe', wood: 'acaciaWood',
    drops: p => { const main = 0.4 + 0.6 * p; return [['acaciaWood', main], ['twig', (1 - main) / 2], ['leaf', (1 - main) / 2]]; },
  },
  rock: {
    area: 'goa', icon: '🪨', time: 2000, xp: 20,
    drops: p => { const main = 0.4 + 0.6 * p; return [['stone', main], ['pebble', (1 - main) * 2 / 3], [null, (1 - main) / 3]]; },
  },
};
