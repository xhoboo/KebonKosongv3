// Data game: teks, item, sumber daya, alat. Hanya data dan rumus, tanpa state atau DOM.

const TEXT = {
  id: {
    forest: 'Hutan', cave: 'Goa', river: 'Sungai', kitchen: 'Dapur', house: 'Rumah', market: 'Pasar', anvil: 'Anvil', settings: 'Pengaturan',
    acacia: 'Pohon Akasia', teak: 'Pohon Jati', rock: 'Batu', copper: 'Batu Tembaga', seconds: 'detik',
    acaciaWood: 'Kayu Akasia', teakWood: 'Kayu Jati', twig: 'Ranting', leaf: 'Daun',
    stone: 'Batu', pebble: 'Kerikil', copperOre: 'Bijih Tembaga',
    riverFishing: 'Memancing', wader: 'Ikan Wader', tilapia: 'Ikan Nila', catfish: 'Ikan Lele', snakehead: 'Ikan Gabus',
    rodNone: 'Belum punya joran', rodBasic: 'Joran Biasa', rodInterval: 'Interval memancing', doubleFish: 'Peluang 2 ikan',
    riverLocked: 'Butuh Joran Biasa (tempa di Anvil)', unlockedRiver: 'Sungai terbuka!', catFish: 'Ikan',
    leafJamu: 'Jamu Daun', grilledWader: 'Wader Bakar', grilledTilapia: 'Nila Bakar', pepesWader: 'Pepes Wader',
    friedCatfish: 'Lele Goreng', pindangSnakehead: 'Pindang Gabus', catFood: 'Masakan',
    cooking: 'Memasak', needKitchen: lv => `Butuh Dapur Lv. ${lv}`, outOfIngredients: 'Bahan habis',
    kitchenRecipes: n => `${n} resep terbuka`, cookSpeed: 'Kecepatan masak', heals: 'Memulihkan',
    miss: 'Zonk', empty: 'Belum ada item.',
    theme: 'Tema', light: 'Terang', dark: 'Gelap', language: 'Bahasa', sound: 'Suara', on: 'Nyala', off: 'Mati',
    openMenu: 'Buka menu', level: 'Level',
    axeBasic: 'Kapak Biasa', axeShiny: 'Kapak Berkilau', axeInterval: 'Interval kapak', doubleWood: 'Peluang 2 kayu',
    pickBasic: 'Beliung Biasa', pickShiny: 'Beliung Berkilau', pickInterval: 'Interval beliung', doubleOre: 'Peluang 2 batu/bijih',
    max: 'Maks', needs: name => `Butuh ${name}`,
    caveLocked: 'Terbuka di Pohon Akasia Lv. 10', unlockedCave: 'Goa terbuka!',
    toolHint: 'Upgrade alat di Anvil',
    anvilCanForge: tier => `Bisa menempa alat sampai tingkat ${tier}`,
    upgradeLv: lv => `Upgrade ke Lv. ${lv}`,
    forge: 'Tempa', forging: 'Menempa…', chance: p => `Peluang berhasil ${p}%`,
    needAnvil: lv => `Butuh Anvil Lv. ${lv}`, topTier: 'Sudah tingkat tertinggi',
    forgeOk: name => `Berhasil! ${name}`, forgeFail: 'Gagal, bahan hilang',
    progress: 'Progres', reset: 'Klik 3 kali untuk reset progress', resetLeft: n => `Klik ${n} kali lagi`,
    kepeng: 'Kepeng', marketEmpty: 'Belum ada item untuk dijual.', each: 'per item',
    sellOne: 'Jual 1', sellAll: 'Jual semua', sure: 'Yakin?',
    slotsUsed: (used, cap) => `${used} / ${cap} item berbeda`, houseFull: 'Rumah penuh',
    houseUpgrade: (lv, add) => `Upgrade ke Lv. ${lv} · +${add} slot`,
    sortCat: 'Kategori', sortQty: 'Jumlah', sortName: 'Nama',
    catWood: 'Kayu', catStone: 'Batu & Logam', catNature: 'Bahan Alam',
    discarded: 'Dibuang karena rumah penuh', dismiss: 'Tutup',
  },
  en: {
    forest: 'Forest', cave: 'Cave', river: 'River', kitchen: 'Kitchen', house: 'House', market: 'Market', anvil: 'Anvil', settings: 'Settings',
    acacia: 'Acacia Tree', teak: 'Teak Tree', rock: 'Rock', copper: 'Copper Rock', seconds: 'sec',
    acaciaWood: 'Acacia Wood', teakWood: 'Teak Wood', twig: 'Twig', leaf: 'Leaf',
    stone: 'Stone', pebble: 'Pebble', copperOre: 'Copper Ore',
    riverFishing: 'Fishing', wader: 'Rasbora', tilapia: 'Tilapia', catfish: 'Catfish', snakehead: 'Snakehead',
    rodNone: 'No fishing rod yet', rodBasic: 'Basic Rod', rodInterval: 'Fishing interval', doubleFish: 'Chance of 2 fish',
    riverLocked: 'Requires Basic Rod (forge at the Anvil)', unlockedRiver: 'River unlocked!', catFish: 'Fish',
    leafJamu: 'Leaf Tonic', grilledWader: 'Grilled Rasbora', grilledTilapia: 'Grilled Tilapia', pepesWader: 'Rasbora Pepes',
    friedCatfish: 'Fried Catfish', pindangSnakehead: 'Snakehead Stew', catFood: 'Food',
    cooking: 'Cooking', needKitchen: lv => `Requires Kitchen Lv. ${lv}`, outOfIngredients: 'Out of ingredients',
    kitchenRecipes: n => `${n} recipes unlocked`, cookSpeed: 'Cooking speed', heals: 'Heals',
    miss: 'Miss', empty: 'No items yet.',
    theme: 'Theme', light: 'Light', dark: 'Dark', language: 'Language', sound: 'Sound', on: 'On', off: 'Off',
    openMenu: 'Open menu', level: 'Level',
    axeBasic: 'Basic Axe', axeShiny: 'Shiny Axe', axeInterval: 'Axe interval', doubleWood: 'Chance of 2 wood',
    pickBasic: 'Basic Pickaxe', pickShiny: 'Shiny Pickaxe', pickInterval: 'Pickaxe interval', doubleOre: 'Chance of 2 stone/ore',
    max: 'Max', needs: name => `Requires ${name}`,
    caveLocked: 'Unlocks at Acacia Tree Lv. 10', unlockedCave: 'Cave unlocked!',
    toolHint: 'Upgrade tools at the Anvil',
    anvilCanForge: tier => `Can forge tools up to tier ${tier}`,
    upgradeLv: lv => `Upgrade to Lv. ${lv}`,
    forge: 'Forge', forging: 'Forging…', chance: p => `Success chance ${p}%`,
    needAnvil: lv => `Requires Anvil Lv. ${lv}`, topTier: 'Highest tier reached',
    forgeOk: name => `Success! ${name}`, forgeFail: 'Failed, materials lost',
    progress: 'Progress', reset: 'Click 3 times to reset progress', resetLeft: n => `Click ${n} more ${n === 1 ? 'time' : 'times'}`,
    kepeng: 'Kepeng', marketEmpty: 'No items to sell yet.', each: 'each',
    sellOne: 'Sell 1', sellAll: 'Sell all', sure: 'Sure?',
    slotsUsed: (used, cap) => `${used} / ${cap} different items`, houseFull: 'House full',
    houseUpgrade: (lv, add) => `Upgrade to Lv. ${lv} · +${add} slots`,
    sortCat: 'Category', sortQty: 'Amount', sortName: 'Name',
    catWood: 'Wood', catStone: 'Stone & Metal', catNature: 'Natural',
    discarded: 'Discarded because the house is full', dismiss: 'Close',
  },
};

// Ikon yang tidak ada emojinya digambar sendiri
const PEBBLE_ICON = '<svg class="emoji" viewBox="0 0 24 24" aria-hidden="true">' +
  '<ellipse cx="7" cy="16" rx="5" ry="4" fill="#9a958c"/><ellipse cx="16.5" cy="17" rx="4.5" ry="3.5" fill="#7f7a72"/>' +
  '<ellipse cx="12" cy="9.5" rx="4" ry="3.2" fill="#b8b2a8"/></svg>';
const COPPER_ORE_ICON = '<svg class="emoji" viewBox="0 0 24 24" aria-hidden="true">' +
  '<path d="M4 16 7 8l8-3 6 6-2 8-9 1Z" fill="#a85e32"/><path d="m7 8 8-3 6 6-7 1Z" fill="#d98a52"/>' +
  '<path d="m14 12 7-1-2 8Z" fill="#8a4a26"/></svg>';
const COPPER_ROCK_ICON = '<svg class="emoji" viewBox="0 0 24 24" aria-hidden="true">' +
  '<path d="M2 18 5 9l7-5 7 3 3 10-6 4H7Z" fill="#8d877d"/><path d="m5 9 7-5 7 3-6 4Z" fill="#aaa397"/>' +
  '<circle cx="8.5" cy="14.5" r="1.9" fill="#d9783a"/><circle cx="15.5" cy="15.5" r="1.6" fill="#e08a4a"/>' +
  '<circle cx="12.5" cy="8.5" r="1.2" fill="#c96a2e"/></svg>';
// Kayu Jati: emoji kayu yang digelapkan; ikan dibedakan dengan warna
const TEAK_WOOD_ICON = '<span class="emoji-teak">🪵</span>';
const fishIcon = cls => `<span class="emoji-fish ${cls}">🐟</span>`;

// Mata uang
const KEPENG_ICON = '🪙';

// Kategori item, sesuai urutan tampil saat Rumah disortir per kategori
const CATEGORIES = [
  { key: 'wood', name: 'catWood' },
  { key: 'stone', name: 'catStone' },
  { key: 'fish', name: 'catFish' },
  { key: 'food', name: 'catFood' },
  { key: 'nature', name: 'catNature' },
];

// Semua item yang bisa didapat, sesuai urutan bawaan di Rumah.
// price = harga jual per item di Pasar dalam Kepeng (draf, disetel setelah dicoba).
const ITEMS = [
  { key: 'acaciaWood', icon: '🪵', cat: 'wood', price: 2 },
  { key: 'teakWood', icon: TEAK_WOOD_ICON, cat: 'wood', price: 5 },
  { key: 'twig', icon: '🌿', cat: 'nature', price: 1 },
  { key: 'leaf', icon: '🍃', cat: 'nature', price: 1 },
  { key: 'stone', icon: '🪨', cat: 'stone', price: 2 },
  { key: 'pebble', icon: PEBBLE_ICON, cat: 'stone', price: 1 },
  { key: 'copperOre', icon: COPPER_ORE_ICON, cat: 'stone', price: 5 },
  { key: 'wader', icon: fishIcon('wader'), cat: 'fish', price: 3 },
  { key: 'tilapia', icon: fishIcon('tilapia'), cat: 'fish', price: 6 },
  { key: 'catfish', icon: fishIcon('catfish'), cat: 'fish', price: 10 },
  { key: 'snakehead', icon: fishIcon('snakehead'), cat: 'fish', price: 25 },
  // Masakan: heal = HP yang dipulihkan saat petualangan
  { key: 'leafJamu', icon: '🍵', cat: 'food', price: 6, heal: 15 },
  { key: 'grilledWader', icon: '🍢', cat: 'food', price: 6, heal: 30 },
  { key: 'grilledTilapia', icon: '🥘', cat: 'food', price: 12, heal: 50 },
  { key: 'pepesWader', icon: '🫔', cat: 'food', price: 14, heal: 80 },
  { key: 'friedCatfish', icon: '🍤', cat: 'food', price: 20, heal: 80 },
  { key: 'pindangSnakehead', icon: '🍲', cat: 'food', price: 45, heal: 150 },
];
const heals = Object.fromEntries(ITEMS.filter(it => it.heal).map(it => [it.key, it.heal]));
const icons = Object.fromEntries(ITEMS.map(it => [it.key, it.icon]));
const prices = Object.fromEntries(ITEMS.map(it => [it.key, it.price]));

// Rumah: menampung sejumlah item berbeda (jumlah per item tidak dibatasi).
// Item jenis baru yang didapat saat rumah penuh dibuang. Biaya upgrade draf, disetel setelah dicoba.
const HOUSE = {
  base: 50,
  perLevel: 10,
  maxLevel: 10,
  cost: level => ({ kepeng: 500 * 2 ** level, acaciaWood: 200 * (level + 1), stone: 200 * (level + 1) }),
};

// Progres offline (dan saat tab tidak terlihat) paling lama dihitung 24 jam
const OFFLINE_CAP = 24 * 60 * 60 * 1000;

// Level sumber daya: tiap aksi memberi exp sebesar xp node-nya. Bagian eksponensial menjaga awal tetap cepat,
// bagian kubik membuat level atas makin berat. Exp per detik sama untuk semua node (20 exp / 2 detik),
// jadi tiap node butuh kira-kira: Lv 10 ≈ 2 menit, Lv 50 ≈ 2 jam, Lv 75 ≈ 11,5 jam, Lv 100 ≈ 2 hari.
const MAX_LEVEL = 100;
const xpNeeded = level => 20 * Math.floor(4 * 1.07 ** level + 0.0015 * level ** 3);

// Alat (kapak untuk pohon, beliung untuk batu, joran untuk memancing): dapat exp yang sama dengan node yang dikerjakan,
// tiap level memotong waktu aksi 0,75% (75% di level 100). Tiap level butuh 10% exp lebih banyak:
// menebang Akasia nonstop → Lv 10 ≈ 7 menit, Lv 50 ≈ 6,5 jam, Lv 75 ≈ 2 hari, Lv 100 ≈ 15 hari.
const TOOL_CUT = 0.0075;
const toolXpNeeded = level => Math.round(283 * 1.1 ** level);

// Tingkat alat. Tingkat berikutnya ditempa di Anvil; level & exp alat tetap.
// double = peluang hasil utama ganda; anvil = level Anvil minimum; cost = bahan tempa.
// Aturan silang: bahan selalu kayu + batu/logam dari tingkat di bawahnya, untuk kapak maupun beliung.
const TOOLS = {
  axe: {
    icon: '🪓', area: 'hutan', interval: 'axeInterval', doubleText: 'doubleWood',
    tiers: [
      { key: 'axeBasic', double: 0 },
      { key: 'axeShiny', double: 0.05, anvil: 1, cost: { acaciaWood: 250, stone: 250 } },
    ],
  },
  pickaxe: {
    icon: '⛏️', area: 'goa', interval: 'pickInterval', doubleText: 'doubleOre',
    tiers: [
      { key: 'pickBasic', double: 0 },
      { key: 'pickShiny', double: 0.05, anvil: 1, cost: { acaciaWood: 250, stone: 250 } },
    ],
  },
  // Joran: tingkat 0 = belum punya (Sungai terkunci). Mulai tingkat 2 joran juga butuh benang dari Kebun.
  rod: {
    icon: '🎣', area: 'sungai', interval: 'rodInterval', doubleText: 'doubleFish',
    tiers: [
      { key: 'rodNone', double: 0, none: true },
      { key: 'rodBasic', double: 0, anvil: 1, cost: { teakWood: 150, copperOre: 150 } },
    ],
  },
};

// Anvil: level menentukan tingkat alat yang bisa ditempa. Peluang berhasil tergantung selisih
// level Anvil dengan syarat tingkat itu: pas = FORGE_BASE[tingkat], tiap level lebih +FORGE_GAP (maks 100%).
// Gagal = bahan hilang, alat tetap.
const FORGE_BASE = [1, 0.9, 0.75, 0.6];
const FORGE_GAP = 0.1;
const ANVIL = {
  start: 1,
  // cost[n] = biaya naik ke level n (draf)
  cost: { 2: { kepeng: 1000, teakWood: 200, copperOre: 200 } },
};

// Dapur: memasak adalah kegiatan idle (satu kegiatan dalam satu waktu). Tiap masakan memakai bahan, kalau
// bahan habis kegiatannya berhenti. Level Dapur membuka resep; skill Memasak (kurva exp sama dengan node,
// 10 exp per detik → ±2 hari ke Lv. 100) memotong waktu masak 0,5% per level.
// Key resep = key item hasilnya. kitchen = level Dapur minimum. (Draf, disetel setelah dicoba.)
const COOK_CUT = 0.005;
const KITCHEN = {
  start: 1,
  // cost[n] = biaya naik ke level n
  cost: {
    2: { kepeng: 800, acaciaWood: 300, stone: 300 },
    3: { kepeng: 3000, teakWood: 300, copperOre: 200 },
  },
};
const RECIPES = {
  leafJamu: { kitchen: 1, time: 3000, xp: 30, input: { leaf: 3, twig: 1 } },
  grilledWader: { kitchen: 1, time: 3000, xp: 30, input: { wader: 1, twig: 1 } },
  grilledTilapia: { kitchen: 2, time: 3000, xp: 30, input: { tilapia: 1, twig: 1 } },
  pepesWader: { kitchen: 2, time: 4000, xp: 40, input: { wader: 2, leaf: 2, twig: 1 } },
  friedCatfish: { kitchen: 3, time: 4000, xp: 40, input: { catfish: 1, twig: 2 } },
  pindangSnakehead: { kitchen: 3, time: 5000, xp: 50, input: { snakehead: 1, leaf: 2, twig: 2 } },
};

// Area yang terkunci di awal; unlock(state) → true kalau syaratnya terpenuhi
const AREA_UNLOCKS = {
  goa: { done: 'unlockedCave', unlock: s => s.nodes.acacia.level >= 10 },
  sungai: { done: 'unlockedRiver', unlock: s => s.tools.rod.tier >= 1 },
};

// Memancing: hasil diundi dari daftar ikan berbobot; ikan bagus lebih jarang, makin sering seiring level
// node. rare(tier) = pengali bobot ikan langka dari tingkat joran (tingkat 1 = 1×).
// fish: [item, bobot di level 0, bobot di level 100, langka?]. miss = peluang tidak dapat apa-apa.
function fishDrops(fish, p, tier) {
  const miss = 0.05 + 0.35 * (1 - p), rare = 1 + 0.5 * (tier - 1);
  const weights = fish.map(([item, w0, w100, isRare]) => [item, (w0 + (w100 - w0) * p) * (isRare ? rare : 1)]);
  const total = weights.reduce((sum, [, w]) => sum + w, 0);
  return [...weights.map(([item, w]) => [item, w / total * (1 - miss)]), [null, miss]];
}

// Sumber daya yang bisa dikerjakan. drops(p, tier) → [item, peluang]; p = level / 100, tier = tingkat alat.
// Item utama naik lurus dari peluang awal ke 100% di level 100; sisanya dibagi dengan rasio tetap.
// tool + tier = alat yang dipakai dan tingkat minimumnya (di bawah itu node terkunci).
// main = item yang bisa jadi ganda karena alat. time naik per tingkat, xp ikut naik supaya exp per detik tetap.
const NODES = {
  acacia: {
    area: 'hutan', icon: '🌳', time: 2000, xp: 20, tool: 'axe', tier: 0, main: 'acaciaWood',
    drops: p => { const main = 0.4 + 0.6 * p; return [['acaciaWood', main], ['twig', (1 - main) / 2], ['leaf', (1 - main) / 2]]; },
  },
  teak: {
    area: 'hutan', icon: '🌲', time: 3000, xp: 30, tool: 'axe', tier: 1, main: 'teakWood',
    drops: p => { const main = 0.4 + 0.6 * p; return [['teakWood', main], ['twig', (1 - main) / 2], ['leaf', (1 - main) / 2]]; },
  },
  rock: {
    area: 'goa', icon: '🪨', time: 2000, xp: 20, tool: 'pickaxe', tier: 0, main: 'stone',
    drops: p => { const main = 0.4 + 0.6 * p; return [['stone', main], ['pebble', (1 - main) * 2 / 3], [null, (1 - main) / 3]]; },
  },
  river: {
    area: 'sungai', icon: '🎣', time: 3000, xp: 30, tool: 'rod', tier: 1, main: null, name: 'riverFishing',
    drops: (p, tier) => fishDrops([
      ['wader', 50, 30],
      ['tilapia', 25, 35],
      ['catfish', 8, 25, true],
      ['snakehead', 1, 10, true],
    ], p, tier),
  },
  copper: {
    area: 'goa', icon: COPPER_ROCK_ICON, time: 3000, xp: 30, tool: 'pickaxe', tier: 1, main: 'copperOre',
    drops: p => { const main = 0.4 + 0.6 * p; return [['copperOre', main], ['stone', (1 - main) * 2 / 3], [null, (1 - main) / 3]]; },
  },
};
