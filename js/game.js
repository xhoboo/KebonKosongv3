// State game, simpan/muat (dengan migrasi), aksi, tempa, dan progres offline. Tidak menyentuh DOM.

const SAVE_KEY = 'kebon-kosong-v2';
const SETTINGS_KEY = 'kebon-kosong-settings';
// Buang simpanan versi lama (progres sengaja dimulai ulang)
try { ['idle-penebang-v1', 'kebon-kosong'].forEach(k => localStorage.removeItem(k)); } catch {}

const freshState = () => ({
  items: Object.fromEntries(ITEMS.map(it => [it.key, 0])),
  nodes: Object.fromEntries(Object.keys(NODES).map(k => [k, { level: 0, xp: 0 }])),
  tools: Object.fromEntries(Object.keys(TOOLS).map(k => [k, { tier: 0, level: 0, xp: 0 }])),
  anvil: { level: ANVIL.start },
  unlocked: Object.fromEntries(Object.keys(AREA_UNLOCKS).map(k => [k, false])),
  kepeng: 0,
  house: { level: 0 },
  discarded: {}, // item yang dibuang karena rumah penuh, sampai catatannya ditutup
  active: null, // hanya satu aksi yang berjalan dalam satu waktu
  progress: 0,
  lastTick: Date.now(),
  // 2: exp sumber daya per exp, bukan per aksi; 3: Kepeng; 4: Rumah; 5: alat generik (kapak + beliung), Anvil, area terkunci
  version: 5,
});
const state = freshState();
const settings = { theme: document.documentElement.dataset.theme, lang: 'id', sort: 'cat', sound: true };

// Tambah exp ke sumber daya atau alat; exp berlebih dibawa ke level berikutnya
function gainXp(s, amount, need) {
  s.xp += amount;
  while (s.level < MAX_LEVEL && s.xp >= need(s.level)) {
    s.xp -= need(s.level);
    s.level++;
  }
  if (s.level >= MAX_LEVEL) s.xp = 0;
}

function loadState(saved) {
  if (!saved) return;
  if ('acaciaLevel' in saved) { // simpanan sebelum ada Goa
    ['acaciaWood', 'twig', 'leaf'].forEach(k => { state.items[k] = saved[k] || 0; });
    state.nodes.acacia = { level: saved.acaciaLevel || 0, xp: saved.acaciaXp || 0 };
    state.active = saved.running ? 'acacia' : null;
    state.progress = saved.progress || 0;
    state.lastTick = saved.lastTick || Date.now();
  } else {
    Object.assign(state.items, saved.items);
    for (const k in NODES) Object.assign(state.nodes[k], saved.nodes && saved.nodes[k]);
    // Sebelum versi 5 kapak disimpan di state.axe
    for (const k in TOOLS) Object.assign(state.tools[k], k === 'axe' && saved.axe, saved.tools && saved.tools[k]);
    Object.assign(state.anvil, saved.anvil);
    Object.assign(state.unlocked, saved.unlocked);
    state.kepeng = saved.kepeng || 0; // simpanan sebelum versi 3 belum punya Kepeng
    Object.assign(state.house, saved.house); // sebelum versi 4 belum ada Rumah: mulai dari level 0
    Object.assign(state.discarded, saved.discarded);
    state.active = NODES[saved.active] ? saved.active : null;
    state.progress = saved.progress || 0;
    state.lastTick = saved.lastTick || Date.now();
  }
  // Simpanan lama menghitung 1 exp per aksi
  if (!saved.version) for (const k in NODES) state.nodes[k].xp *= NODES[k].xp;
  // Sebelum versi 5 Goa selalu terbuka: pemain yang sudah pernah menambang tetap bisa masuk
  if (!(saved.version >= 5) && (state.nodes.rock.level > 0 || state.nodes.rock.xp > 0 || state.items.stone > 0 || state.items.pebble > 0)) {
    state.unlocked.goa = true;
  }
  // Kurva exp alat pernah berubah; exp yang sudah melebihi kebutuhan langsung jadi level
  for (const k in TOOLS) gainXp(state.tools[k], 0, toolXpNeeded);
  checkUnlocks();
}
try { loadState(JSON.parse(localStorage.getItem(SAVE_KEY))); } catch {}
try {
  const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
  if (saved && TEXT[saved.lang]) settings.lang = saved.lang;
  if (saved && ['cat', 'qty', 'name'].includes(saved.sort)) settings.sort = saved.sort;
  if (saved && typeof saved.sound === 'boolean') settings.sound = saved.sound;
} catch {}

function save() {
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

// Node terkunci kalau areanya belum terbuka atau tingkat alatnya kurang
const nodeOpen = key => areaOpen(NODES[key].area) && state.tools[NODES[key].tool].tier >= NODES[key].tier;

function rollDrop(key) {
  let r = Math.random();
  for (const [item, chance] of NODES[key].drops(state.nodes[key].level / MAX_LEVEL)) {
    if ((r -= chance) < 0) return item;
  }
  return null;
}

// Waktu satu aksi dalam ms; makin cepat seiring level alatnya
const actionTime = key => NODES[key].time * (1 - TOOL_CUT * state.tools[NODES[key].tool].level);

// Rumah: kapasitas = jumlah item berbeda yang bisa disimpan
const houseCapacity = () => HOUSE.base + HOUSE.perLevel * state.house.level;
const usedSlots = () => ITEMS.reduce((n, it) => n + (state.items[it.key] >= 1), 0);

// Masukkan item ke Rumah. Item yang sudah ada selalu muat; item jenis baru dibuang kalau rumah penuh.
function addItem(key, qty) {
  if (state.items[key] < 1 && usedSlots() >= houseCapacity()) {
    state.discarded[key] = (state.discarded[key] || 0) + qty;
    return false;
  }
  state.items[key] += qty;
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
  const tier = nextTier(tool), ok = Math.random() < forgeChance(tool);
  pay(tier.cost);
  if (ok) state.tools[tool].tier++;
  save();
  return { ok, key: tier.key };
}

// Satu aksi (tebang/tambang): undi hasil, tambah exp ke sumber daya dan alatnya.
// Mengembalikan { item, qty, lost }, atau null kalau zonk; lost = dibuang karena rumah penuh.
function act(key) {
  const node = NODES[key], tool = state.tools[node.tool], drop = rollDrop(key);
  let qty = 0;
  if (drop) {
    qty = drop === node.main && Math.random() < TOOLS[node.tool].tiers[tool.tier].double ? 2 : 1;
  }
  const lost = drop && !addItem(drop, qty);
  gainXp(state.nodes[key], node.xp, xpNeeded);
  gainXp(tool, node.xp, toolXpNeeded);
  return drop && { item: drop, qty, lost };
}

// Jual item di Pasar dengan harga tetap; mengembalikan jumlah yang benar-benar terjual
function sell(key, qty) {
  qty = Math.min(qty, Math.floor(state.items[key]));
  if (!(qty > 0)) return 0;
  state.items[key] -= qty;
  state.kepeng += qty * prices[key];
  save();
  return qty;
}

// Progres offline: kalau ada aksi berjalan saat ditutup, hitung aksi yang terlewat (paling lama 24 jam)
if (state.active && !nodeOpen(state.active)) state.active = null;
if (state.active) {
  let elapsed = Math.min(Date.now() - state.lastTick, OFFLINE_CAP) + state.progress;
  for (let time; elapsed >= (time = actionTime(state.active)); elapsed -= time) act(state.active);
  state.progress = elapsed;
  checkUnlocks();
}
