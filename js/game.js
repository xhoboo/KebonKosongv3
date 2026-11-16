// State game, simpan/muat (dengan migrasi), aksi, jelajah, tempa, dan progres offline. Tidak menyentuh DOM.

const SAVE_KEY = 'kebon-kosong-v3';
const SETTINGS_KEY = 'kebon-kosong-settings';
// Buang simpanan versi lama: perombakan Jelajah (versi 13) sengaja memulai semua progres dari 0
try { ['idle-penebang-v1', 'kebon-kosong', 'kebon-kosong-v2'].forEach(k => localStorage.removeItem(k)); } catch {}

// Versi bentuk state. Setiap perubahan bentuk state: naikkan SAVE_VERSION dan tambahkan MIGRATIONS[versi baru].
// 14: slot Perbekalan (state.provision)
const SAVE_VERSION = 14;
const freshState = () => ({
  items: Object.fromEntries(ITEMS.map(it => [it.key, 0])),
  nodes: Object.fromEntries(Object.keys(NODES).map(k => [k, { level: 0, xp: 0 }])), // node memancing
  tools: Object.fromEntries(Object.keys(TOOLS).map(k => [k, { tier: 0, level: 0, xp: 0 }])), // level hanya dipakai joran
  areas: Object.fromEntries(Object.keys(EXPLORE).map(k => [k, { level: 0, xp: 0 }])), // level tiap area jelajah
  anvil: { level: ANVIL.start },
  kitchen: { level: KITCHEN.start },
  cooking: { level: 0, xp: 0 }, // skill Memasak
  smithing: { level: 0, xp: 0 }, // skill Menempa
  farm: { level: 0, xp: 0, plots: Array(FARM.freeSlots).fill(null) }, // petak: null atau { crop, at: waktu tanam }
  armor: { level: 0, xp: 0 }, // Mastery Armor
  bag: { level: 0, items: {} },
  provision: null, // slot Perbekalan: { key, qty } satu jenis masakan; hanya ini yang dimakan otomatis saat jelajah
  exMode: 'manual', // cara maju saat menjelajah: 'manual' (klik, 1 dtk/m) atau 'auto'
  trip: null, // perjalanan yang sedang berjalan: { area, meter, hp, walking, wins, losses, kepeng }
  lastTrip: null, // ringkasan perjalanan terakhir: { area, meter, wins, losses, kepeng }
  journal: [], // catatan jelajah, terbaru di depan
  unlocked: Object.fromEntries(Object.keys(AREA_UNLOCKS).map(k => [k, false])),
  kepeng: 0,
  house: { level: 0 },
  discarded: {}, // item yang dibuang karena rumah penuh, sampai catatannya ditutup
  active: null, // hanya satu kegiatan yang berjalan dalam satu waktu
  progress: 0,
  lastTick: Date.now(),
  onboard: 0, // langkah loop pertama: 0 kumpul daun, 1 jual daun, 2 tanam, 3 panen, 4 selesai
  version: SAVE_VERSION,
});
const state = freshState();
const settings = { theme: document.documentElement.dataset.theme, lang: 'id', sort: 'cat', sound: true, folds: {} };

// Tambah exp ke skill/area/alat; exp berlebih dibawa ke level berikutnya
function gainXp(s, amount, need) {
  s.xp += amount;
  while (s.level < MAX_LEVEL && s.xp >= need(s.level)) {
    s.xp -= need(s.level);
    s.level++;
  }
  if (s.level >= MAX_LEVEL) s.xp = 0;
}

// Migrasi simpanan: MIGRATIONS[n](saved) mengubah simpanan versi n−1 menjadi bentuk versi n, dijalankan berurutan
// sebelum digabung ke state baru. Field baru yang cukup diisi bawaan tidak perlu migrasi (merge mengisinya).
const MIGRATIONS = {
  // 14: makan otomatis sekarang hanya dari slot Perbekalan. Supaya perjalanan yang sedang berjalan tidak tiba-tiba
  // tanpa makanan, masakan di tas dengan pemulihan terbesar langsung dipasang ke slot.
  14: s => {
    const items = s.bag && s.bag.items || {};
    const food = Object.keys(items).filter(k => heals[k] && items[k] >= 1).sort((a, b) => heals[b] - heals[a])[0];
    if (food && !s.provision) { s.provision = { key: food, qty: items[food] }; delete items[food]; }
  },
};

// Gabungkan simpanan ke state baru: objek digabung per kunci (kunci yang belum ada di simpanan tetap bawaan,
// kunci dinamis seperti item tetap dibawa), nilai lain diambil kalau jenisnya cocok.
function merge(target, src) {
  for (const k of Object.keys(src)) {
    const a = target[k], b = src[k];
    if (a && typeof a === 'object' && !Array.isArray(a) && b && typeof b === 'object' && !Array.isArray(b)) merge(a, b);
    else if (Array.isArray(a) ? Array.isArray(b) : a == null || typeof a === typeof b) target[k] = b;
  }
}

function loadState(saved) {
  // Simpanan sebelum versi 13 (sebelum Jelajah) tidak dipakai: progres sengaja dimulai dari 0
  if (!saved || typeof saved !== 'object' || !(saved.version >= 13)) return;
  for (let v = saved.version + 1; v <= SAVE_VERSION; v++) if (MIGRATIONS[v]) MIGRATIONS[v](saved);
  merge(state, saved);
  state.version = SAVE_VERSION;
  checkUnlocks();
}
// Loop pertama (hanya tampilan, tidak mengubah balance): naik satu langkah kalau sedang di langkah `from`
const stepOnboard = from => { if (state.onboard === from) state.onboard = from + 1; };
// Daun dihitung dari Rumah + tas (daun dari Hutan masuk tas dulu)
const leafCount = () => (state.items.leaf || 0) + (state.bag.items.leaf || 0);
const checkOnboardLeaf = () => { if (leafCount() >= 5) stepOnboard(0); };
try { loadState(JSON.parse(localStorage.getItem(SAVE_KEY))); } catch {}
try {
  const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
  if (saved && TEXT[saved.lang]) settings.lang = saved.lang;
  if (saved && ['cat', 'qty', 'name'].includes(saved.sort)) settings.sort = saved.sort;
  if (saved && typeof saved.sound === 'boolean') settings.sound = saved.sound;
  // Bagian halaman jelajah yang dilipat (true = terlipat)
  if (saved && saved.folds && typeof saved.folds === 'object') for (const k in saved.folds) settings.folds[k] = !!saved.folds[k];
} catch {}

// skipSave: dipakai mode uji saat memuat save lain, supaya save lama tidak menimpanya waktu halaman dimuat ulang
let skipSave = false;
function save() {
  if (skipSave) return;
  state.lastTick = Date.now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch {}
}

function saveSettings() {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch {}
}

// Buka area yang syaratnya sudah terpenuhi; mengembalikan daftar area yang baru terbuka
function checkUnlocks() {
  const opened = [];
  for (const [area, rule] of Object.entries(AREA_UNLOCKS)) {
    if (!state.unlocked[area] && rule.unlock(state)) {
      state.unlocked[area] = true;
      opened.push(area);
    }
  }
  return opened;
}
const areaOpen = area => !(area in AREA_UNLOCKS) || state.unlocked[area];

// Rank alat: 1 = alat pertama (tingkat 0 joran/tombak berarti belum punya, rank 0)
const toolRank = tool => state.tools[tool].tier + (TOOLS[tool].tiers[0].none ? 0 : 1);
const toolAtk = tool => TOOL_ATK[toolRank(tool)] || 0;
const regionTool = key => REGIONS[EXPLORE[key].region].tool;
// Area jelajah terbuka kalau wilayahnya terbuka, rank alatnya ≥ tier area, dan tier sebelumnya sudah Lv. 25
const exploreOpen = key => {
  const a = EXPLORE[key];
  return areaOpen(a.region) && toolRank(regionTool(key)) >= a.tier && (!a.prev || state.areas[a.prev].level >= EX.unlockLv);
};
// Kegiatan terkunci kalau: jelajah → syarat area; resep → level Dapur kurang; node → area/joran kurang
const nodeOpen = key => EXPLORE[key] ? exploreOpen(key)
  : RECIPES[key] ? state.kitchen.level >= RECIPES[key].kitchen
  : areaOpen(NODES[key].area) && state.tools[NODES[key].tool].tier >= NODES[key].tier;

function rollDrop(key) {
  let r = Math.random();
  for (const [item, chance] of NODES[key].drops(state.nodes[key].level / MAX_LEVEL, state.tools[NODES[key].tool].tier)) {
    if ((r -= chance) < 0) return item;
  }
  return null;
}

// Waktu satu aksi dalam ms: jelajah = per meter (auto makin cepat dengan level area, manual tetap 1 dtk);
// resep makin cepat dengan skill Memasak; memancing makin cepat dengan level joran
const actionTime = key => EXPLORE[key] ? (state.exMode === 'auto' ? autoStep(state.areas[key].level) : EX.manual)
  : RECIPES[key] ? RECIPES[key].time * (1 - COOK_CUT * state.cooking.level)
  : NODES[key].time * (1 - TOOL_CUT * state.tools[NODES[key].tool].level);

// Rumah: kapasitas = jumlah item berbeda yang bisa disimpan
const houseCapacity = () => HOUSE.base + HOUSE.perLevel * state.house.level;
// Semua key item yang dimiliki (termasuk item berkualitas), urut seperti tampil di Rumah
const ownedKeys = () => Object.keys(state.items).filter(k => state.items[k] >= 1).sort(compareKeys);
const usedSlots = () => Object.values(state.items).filter(n => n >= 1).length;

// Item bisa disimpan di Rumah kalau sudah ada, atau masih ada slot kosong
const canStore = key => state.items[key] >= 1 || usedSlots() < houseCapacity();

// Masukkan item ke Rumah. Item yang sudah ada selalu muat; item jenis baru dibuang kalau rumah penuh.
function addItem(key, qty) {
  if (state.items[key] < 1 && usedSlots() >= houseCapacity()) {
    state.discarded[key] = (state.discarded[key] || 0) + qty;
    return false;
  }
  state.items[key] = (state.items[key] || 0) + qty;
  if (key === 'leaf') checkOnboardLeaf();
  return true;
}

// Biaya bisa berisi Kepeng (key 'kepeng') dan item
const have = key => key === 'kepeng' ? state.kepeng : state.items[key];
const canAfford = cost => Object.entries(cost).every(([key, n]) => have(key) >= n);
function pay(cost) {
  for (const [key, n] of Object.entries(cost)) {
    if (key === 'kepeng') state.kepeng -= n;
    else state.items[key] -= n;
  }
}

function upgradeHouse() {
  if (state.house.level >= HOUSE.maxLevel) return false;
  const cost = HOUSE.cost(state.house.level);
  if (!canAfford(cost)) return false;
  pay(cost);
  state.house.level++;
  save();
  return true;
}

// Anvil
const anvilMax = Math.max(ANVIL.start, ...Object.keys(ANVIL.cost).map(Number));
function upgradeAnvil() {
  const cost = ANVIL.cost[state.anvil.level + 1];
  if (!cost || !canAfford(cost)) return false;
  pay(cost);
  state.anvil.level++;
  save();
  return true;
}

// Skill Menempa: exp = nilai bahan (jumlah × harga jual dasar)
const smithXp = cost => Object.entries(cost).reduce((sum, [k, n]) => sum + (k === 'kepeng' ? 0 : n * prices[k]), 0);

// Peluang tiap kualitas di level Menempa sekarang: [[kualitas, peluang]]
function qualityOdds() {
  const p = state.smithing.level / MAX_LEVEL;
  const w = QUALITIES.map(q => [q.key, q.w0 + (q.w100 - q.w0) * p]);
  const total = w.reduce((sum, [, x]) => sum + x, 0);
  return w.map(([q, x]) => [q, x / total]);
}
// Undi kualitas (dan sifat kalau Pusaka) untuk perlengkapan jenis slot ('weapon' / 'armor')
function rollQuality(slot) {
  let r = Math.random(), q = 'common';
  for (const [key, chance] of qualityOdds()) if ((r -= chance) < 0) { q = key; break; }
  if (q !== 'legend') return { q };
  const traits = Object.keys(TRAITS).filter(k => TRAITS[k].slot === slot || TRAITS[k].slot === 'any');
  return { q, trait: traits[Math.floor(Math.random() * traits.length)] };
}

// ---------- Kebun ----------
// Tanaman memakai jam dunia nyata, jadi status petak dihitung dari waktu sekarang.

function plotStatus(plot, now = Date.now()) {
  if (!plot) return 'empty';
  const ready = plot.at + CROPS[plot.crop].grow;
  return now < ready ? 'growing' : now < ready + FARM.wilt ? 'ready' : 'wilted';
}
const cropOpen = crop => state.farm.level >= CROPS[crop].level;
const nextSlotCost = () => state.farm.plots.length < FARM.maxSlots ? FARM.slotCost(state.farm.plots.length + 1) : null;

function buySlot() {
  const cost = nextSlotCost();
  if (cost == null || state.kepeng < cost) return false;
  state.kepeng -= cost;
  state.farm.plots.push(null);
  save();
  return true;
}

// Beli benih biasa di Pasar
function buySeed(crop, qty) {
  const c = CROPS[crop];
  if (!c.shop || state.kepeng < c.shop * qty || !canStore(c.seed)) return false;
  state.kepeng -= c.shop * qty;
  addItem(c.seed, qty);
  save();
  return true;
}

function plant(i, crop) {
  const c = CROPS[crop];
  if (state.farm.plots[i] || !cropOpen(crop) || !(state.items[c.seed] >= 1)) return false;
  state.items[c.seed]--;
  state.farm.plots[i] = { crop, at: Date.now() };
  stepOnboard(2);
  return true;
}
// Tanam benih yang sama di semua petak kosong (sebanyak benih yang ada)
function plantAll(crop) {
  let n = 0;
  state.farm.plots.forEach((p, i) => { if (!p && plant(i, crop)) n++; });
  if (n) save();
  return n;
}

// Panen petak yang matang (atau bersihkan yang layu). Mengembalikan { item, qty } / { wilted } / null.
// Kalau hasilnya jenis baru dan Rumah penuh, petak dibiarkan supaya hasilnya tidak hilang.
function harvest(i) {
  const plot = state.farm.plots[i], status = plotStatus(plot);
  if (status === 'wilted') { state.farm.plots[i] = null; return { wilted: true }; }
  if (status !== 'ready' || !canStore(plot.crop)) return null;
  const c = CROPS[plot.crop];
  const qty = randInt(...c.yield) + (Math.random() < state.farm.level / MAX_LEVEL ? 1 : 0);
  addItem(plot.crop, qty);
  gainXp(state.farm, c.xp, xpNeeded);
  state.farm.plots[i] = null;
  stepOnboard(3);
  return { item: plot.crop, qty };
}
function harvestAll() {
  const got = {};
  state.farm.plots.forEach((p, i) => { const r = harvest(i); if (r && r.item) got[r.item] = (got[r.item] || 0) + r.qty; });
  save();
  return got;
}

// Tingkat berikutnya dari sebuah alat, atau undefined kalau sudah tertinggi
const nextTier = tool => TOOLS[tool].tiers[state.tools[tool].tier + 1];
function forgeChance(tool) {
  const i = state.tools[tool].tier + 1, tier = TOOLS[tool].tiers[i];
  return Math.min(1, FORGE_BASE[i] + FORGE_GAP * (state.anvil.level - tier.anvil));
}
const canForge = tool => {
  const tier = nextTier(tool);
  return !!tier && state.anvil.level >= tier.anvil && canAfford(tier.cost);
};

// Tempa alat ke tingkat berikutnya. Bahan selalu terpakai; kalau gagal alat tetap.
// Mengembalikan { ok, key } atau null kalau tidak bisa menempa.
function forgeTool(tool) {
  if (!canForge(tool)) return null;
  const tier = nextTier(tool), ok = Math.random() < forgeChance(tool), xp = smithXp(tier.cost);
  pay(tier.cost);
  gainXp(state.smithing, xp, xpNeeded);
  if (ok) state.tools[tool].tier++;
  checkUnlocks(); // mis. joran pertama membuka Sungai, tombak pertama membuka Laut
  save();
  return { ok, key: tier.key, xp };
}

// Dapur
const kitchenMax = Math.max(KITCHEN.start, ...Object.keys(KITCHEN.cost).map(Number));
function upgradeKitchen() {
  const cost = KITCHEN.cost[state.kitchen.level + 1];
  if (!cost || !canAfford(cost)) return false;
  pay(cost);
  state.kitchen.level++;
  save();
  return true;
}

// Satu kali masak: pakai bahan, hasilkan 1 masakan, tambah exp Memasak.
// Kegiatan langsung berhenti begitu bahan tidak cukup untuk masakan berikutnya (stopped: true).
function cook(key) {
  const recipe = RECIPES[key];
  const stop = () => { state.active = null; state.progress = 0; };
  if (!canAfford(recipe.input)) { stop(); return { stopped: true }; }
  pay(recipe.input);
  const lost = !addItem(key, 1);
  gainXp(state.cooking, recipe.xp, xpNeeded);
  const stopped = !canAfford(recipe.input);
  if (stopped) stop();
  return { item: key, qty: 1, lost, stopped };
}

// Perlengkapan yang ditempa (senjata & armor) masuk Rumah
function gearChance(key) {
  const g = GEAR[key];
  return Math.min(1, FORGE_BASE[g.tier] + FORGE_GAP * (state.anvil.level - g.anvil));
}
// Kualitas hasil belum diketahui, jadi menempa perlengkapan butuh satu slot Rumah kosong
const canForgeGear = key => state.anvil.level >= GEAR[key].anvil && canAfford(GEAR[key].cost) && usedSlots() < houseCapacity();
function forgeGear(key) {
  if (!canForgeGear(key)) return null;
  const ok = Math.random() < gearChance(key), xp = smithXp(GEAR[key].cost);
  pay(GEAR[key].cost);
  gainXp(state.smithing, xp, xpNeeded);
  let made = null;
  if (ok) {
    const { q, trait } = rollQuality(ITEM[key].weapon ? 'weapon' : 'armor');
    made = itemKey(key, q, trait);
    addItem(made, 1);
  }
  save();
  return { ok, key: made || key, xp };
}

// ---------- Jelajah ----------

const exploring = () => !!EXPLORE[state.active];
const maxHp = () => EX.baseHp + EX.hpPerArmorLv * state.armor.level;
const playerDef = () => EX.defPerArmorLv * state.armor.level;
// Musuh makin kuat seiring meter (lurus sampai 1.000 m, lalu tetap)
const enemyPower = (e, meter) => ENEMIES[e].power * (1 + EX.depthPower * depthOf(meter));
const enemyDmg = (e, meter) => ENEMIES[e].dmg * (1 + EX.depthDmg * depthOf(meter));
const winChance = (e, key, meter) => { const a = toolAtk(regionTool(key)) ** 2, p = enemyPower(e, meter) ** 2; return a / (a + p); };
// Menang: kena EX.winDmg (10%) dari serangan musuh; kalah: kena penuh. Keduanya dikurangi pertahanan.
const hitDamage = (e, meter, win) => Math.max(1, Math.round(enemyDmg(e, meter) * (win ? EX.winDmg : 1) * 100 / (100 + playerDef())));

// Tas: kapasitas = jumlah item berbeda
const bagCapacity = () => BAG.base + BAG.perLevel * state.bag.level;
const bagUsed = () => Object.values(state.bag.items).filter(n => n >= 1).length;
function bagAdd(key, qty) {
  if (!(state.bag.items[key] >= 1) && bagUsed() >= bagCapacity()) return false;
  state.bag.items[key] = (state.bag.items[key] || 0) + qty;
  if (key === 'leaf') checkOnboardLeaf();
  return true;
}
function bagTake(key, qty) {
  state.bag.items[key] -= qty;
  if (!(state.bag.items[key] >= 1)) delete state.bag.items[key];
}

function upgradeBag() {
  if (state.bag.level >= BAG.maxLevel) return false;
  const cost = BAG.cost(state.bag.level);
  if (!canAfford(cost)) return false;
  pay(cost);
  state.bag.level++;
  save();
  return true;
}

// Rumah → Tas: hanya bekal (masakan), dan tidak saat sedang menjelajah
function packFood(key, qty) {
  if (exploring() || itemDef(key).cat !== 'food') return 0;
  qty = Math.min(qty, Math.floor(state.items[key]));
  if (!(qty > 0) || !bagAdd(key, qty)) return 0;
  state.items[key] -= qty;
  save();
  return qty;
}
// Tas → Rumah: semua item. Kalau rumah penuh untuk item jenis baru, item tetap di tas.
function storeFromBag(key) {
  if (exploring() || !(state.bag.items[key] >= 1) || !canStore(key)) return false;
  addItem(key, state.bag.items[key]);
  delete state.bag.items[key];
  save();
  return true;
}
function storeAllFromBag() {
  let n = 0;
  for (const key of Object.keys(state.bag.items)) n += storeFromBag(key);
  return n;
}
function discardFromBag(key) {
  if (exploring()) return;
  delete state.bag.items[key];
  save();
}

function log(at, entry) {
  state.journal.unshift({ at, ...entry });
  if (state.journal.length > EX.journalMax) state.journal.length = EX.journalMax;
}

// Mulai/akhiri perjalanan. Mulai selalu dari 0 m dengan HP penuh.
function startTrip(key) {
  state.trip = { area: key, meter: 0, hp: maxHp(), walking: false, wins: 0, losses: 0, kepeng: 0 };
  log(Date.now(), { k: 'start', a: key, m: 0 });
}
// reason: 'stop' (pulang sendiri / ganti kegiatan) atau 'dead' (HP habis). Posisi kembali ke rumah (0 m).
function endTrip(reason, at = Date.now()) {
  const tr = state.trip;
  if (!tr) return;
  state.lastTrip = { area: tr.area, meter: tr.meter, wins: tr.wins, losses: tr.losses, kepeng: tr.kepeng };
  log(at, { k: reason === 'dead' ? 'home' : 'stop', a: tr.area, m: tr.meter });
  state.trip = null;
}

// Mulai/hentikan kegiatan. Menyalakan kegiatan lain saat menjelajah = pulang.
// Mengembalikan false kalau kegiatan tidak bisa dimulai.
function setActive(key) {
  if (key && !nodeOpen(key)) return false;
  if (exploring() && state.active !== key) endTrip('stop');
  if (EXPLORE[key] && state.active !== key) startTrip(key);
  state.active = key;
  state.progress = 0;
  save();
  return true;
}

// Manual: satu klik = maju 1 meter (animasi 1 detik, lalu encounter). Klik selama berjalan diabaikan.
function walk() {
  if (!exploring() || state.exMode !== 'manual' || state.trip.walking) return false;
  state.trip.walking = true;
  state.progress = 0;
  return true;
}
// Ganti mode boleh di tengah perjalanan; langkah yang sedang berjalan dimulai ulang
function setMode(mode) {
  if (state.exMode === mode) return;
  state.exMode = mode;
  if (exploring()) { state.trip.walking = false; state.progress = 0; }
  save();
}
// Waktu kegiatan berjalan? (manual menunggu klik di antara langkah)
const ticking = () => !!state.active && !(exploring() && state.exMode === 'manual' && !state.trip.walking);

const randInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

// Makan otomatis selama HP ≤ batas, hanya dari slot Perbekalan (masakan di tas harus dipasang dulu)
function autoEat(at) {
  const tr = state.trip, max = maxHp(), p = state.provision;
  while (p && p.qty >= 1 && tr.hp > 0 && tr.hp <= max * EX.eatBelow) {
    p.qty--;
    tr.hp = Math.min(max, tr.hp + heals[p.key]);
    log(at, { k: 'eat', a: tr.area, m: tr.meter, f: p.key, h: heals[p.key] });
  }
  if (p && !(p.qty >= 1)) state.provision = null;
}

// Slot Perbekalan: satu jenis masakan. Pasang = seluruh tumpukan pindah dari tas ke slot (bekal lain di slot
// kembali ke tas); Lepas = kembali ke tas. Boleh saat menjelajah.
function equipProvision(key) {
  if (!heals[key] || !(state.bag.items[key] >= 1)) return false;
  const qty = state.bag.items[key], prev = state.provision;
  bagTake(key, qty);
  if (prev && prev.key === key) { prev.qty += qty; save(); return true; }
  if (prev) bagAdd(prev.key, prev.qty); // selalu muat: satu jenis baru saja keluar dari tas
  state.provision = { key, qty };
  save();
  return true;
}
function unequipProvision() {
  const p = state.provision;
  if (!p || !bagAdd(p.key, p.qty)) return false;
  state.provision = null;
  save();
  return true;
}

// Undi encounter; temuan langka makin sering seiring kedalaman
function rollEvent(a, d) {
  const w = e => e.w * (e.rare ? 1 + EX.depthRare * d : 1);
  let r = Math.random() * a.events.reduce((sum, e) => sum + w(e), 0);
  for (const e of a.events) if ((r -= w(e)) < 0) return e;
  return a.events[0];
}
// Jumlah loot naik seiring kedalaman (sisa pecahan jadi peluang +1)
const lootQty = (min, max, d) => { const q = randInt(min, max) * (1 + EX.depthLoot * d); return Math.floor(q) + (Math.random() < q % 1 ? 1 : 0); };

// Maju 1 meter. Mengembalikan ringkasan untuk tampilan:
// { meter, enemy?, win?, dmg?, kepeng?, empty?, loot: [[item, qty]], lost: [[item, qty]], xp, home? }
function exploreStep(key, at) {
  const tr = state.trip, a = EXPLORE[key];
  tr.meter++;
  tr.walking = false;
  const m = tr.meter, d = depthOf(m), ev = rollEvent(a, d), res = { meter: m, loot: [], lost: [], xp: 0 };
  const take = (item, qty) => { if (bagAdd(item, qty)) res.loot.push([item, qty]); else res.lost.push([item, qty]); };
  if (ev.enemy) {
    const e = ENEMIES[ev.enemy];
    res.enemy = ev.enemy;
    res.win = Math.random() < winChance(ev.enemy, key, m);
    res.dmg = hitDamage(ev.enemy, m, res.win);
    tr.hp = Math.max(0, tr.hp - res.dmg);
    gainXp(state.armor, Math.round(e.xp * (res.win ? EX.armorWin : 1)), xpNeeded);
    if (res.win) {
      tr.wins++;
      res.xp = e.xp;
      for (const [item, chance, min, max] of e.drops) if (Math.random() < chance) take(item, lootQty(min, max, d));
      log(at, { k: 'win', a: key, m, e: ev.enemy, d: res.dmg, loot: res.loot });
    } else {
      tr.losses++;
      log(at, { k: 'lose', a: key, m, e: ev.enemy, d: res.dmg });
    }
  } else if (ev.kepeng) {
    res.kepeng = lootQty(...ev.kepeng, d);
    state.kepeng += res.kepeng;
    tr.kepeng += res.kepeng;
    res.xp = ev.xp;
    log(at, { k: 'kepeng', a: key, m, n: res.kepeng });
  } else if (ev.find) {
    take(ev.find, lootQty(ev.min, ev.max, d));
    res.xp = ev.xp;
    if (res.loot.length) log(at, { k: 'find', a: key, m, loot: res.loot });
  } else {
    res.empty = true;
    log(at, { k: 'empty', a: key, m });
  }
  for (const [item, n] of res.lost) log(at, { k: 'bagFull', a: key, m, item, n });
  if (res.xp) gainXp(state.areas[key], res.xp, l => areaXpNeeded(key, l));
  autoEat(at);
  if (tr.hp <= 0) {
    endTrip('dead', at);
    state.active = null;
    state.progress = 0;
    res.home = true;
  }
  return res;
}

// Satu aksi (jelajah 1 meter / masak / memancing).
// Memancing mengembalikan { item, qty, lost } atau null kalau zonk; lost = dibuang karena rumah penuh.
// at = waktu kejadian (untuk jurnal; saat offline dihitung mundur dari waktu sekarang).
function act(key, at = Date.now()) {
  if (EXPLORE[key]) return exploreStep(key, at);
  if (RECIPES[key]) return cook(key);
  const node = NODES[key], tool = state.tools[node.tool], drop = rollDrop(key);
  const lost = drop && !addItem(drop, 1);
  gainXp(state.nodes[key], node.xp, xpNeeded);
  gainXp(tool, node.xp, toolXpNeeded);
  return drop && { item: drop, qty: 1, lost };
}

// Jual item di Pasar dengan harga tetap; mengembalikan jumlah yang benar-benar terjual
function sell(key, qty) {
  qty = Math.min(qty, Math.floor(state.items[key]));
  if (!(qty > 0)) return 0;
  state.items[key] -= qty;
  state.kepeng += qty * itemDef(key).price;
  if (key === 'leaf') stepOnboard(1);
  save();
  return qty;
}

// Jalankan kegiatan selama ms (progres offline, tab tersembunyi, dan mode uji). Manual hanya menyelesaikan
// langkah yang sedang berjalan. Mengembalikan jumlah aksi yang dijalankan.
function simulate(ms) {
  let elapsed = ms + state.progress, at = Date.now() - ms, n = 0;
  while (state.active && ticking()) {
    const time = actionTime(state.active);
    if (elapsed < time) break;
    elapsed -= time;
    act(state.active, at += time);
    n++;
  }
  state.progress = ticking() ? elapsed : 0;
  checkUnlocks();
  return n;
}

// Kegiatan yang tidak valid lagi (mis. syaratnya berubah) dihentikan; perjalanan tanpa kegiatan dibuang
if (state.active && !(NODES[state.active] || RECIPES[state.active] || EXPLORE[state.active]) || state.active && !nodeOpen(state.active)) state.active = null;
if (exploring() && !state.trip) state.active = null;
if (state.trip && !exploring()) state.trip = null;
// Progres offline: paling lama 24 jam. Jelajah auto yang masih hidup berhenti di meternya dan lanjut saat online.
if (state.active) simulate(Math.min(Date.now() - state.lastTick, OFFLINE_CAP));
