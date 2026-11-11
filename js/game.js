// State game, simpan/muat (dengan migrasi), aksi, dan progres offline. Tidak menyentuh DOM.

const SAVE_KEY = 'kebon-kosong-v2';
const SETTINGS_KEY = 'kebon-kosong-settings';
// Buang simpanan versi lama (progres sengaja dimulai ulang)
try { ['idle-penebang-v1', 'kebon-kosong'].forEach(k => localStorage.removeItem(k)); } catch {}

const freshState = () => ({
  items: Object.fromEntries(ITEMS.map(it => [it.key, 0])),
  nodes: Object.fromEntries(Object.keys(NODES).map(k => [k, { level: 0, xp: 0 }])),
  axe: { tier: 0, level: 0, xp: 0 },
  kepeng: 0,
  active: null, // hanya satu aksi yang berjalan dalam satu waktu
  progress: 0,
  lastTick: Date.now(),
  // 2: exp sumber daya dihitung per exp, bukan per aksi; 3: ada Kepeng
  version: 3,
});
const state = freshState();
const settings = { theme: document.documentElement.dataset.theme, lang: 'id' };

// Tambah exp ke sumber daya atau kapak; exp berlebih dibawa ke level berikutnya
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
    Object.assign(state.axe, saved.axe);
    state.kepeng = saved.kepeng || 0; // simpanan sebelum versi 3 belum punya Kepeng
    state.active = NODES[saved.active] ? saved.active : null;
    state.progress = saved.progress || 0;
    state.lastTick = saved.lastTick || Date.now();
  }
  // Simpanan lama menghitung 1 exp per aksi
  if (!saved.version) for (const k in NODES) state.nodes[k].xp *= NODES[k].xp;
  // Kurva exp kapak pernah berubah; exp yang sudah melebihi kebutuhan langsung jadi level
  gainXp(state.axe, 0, axeXpNeeded);
}
try { loadState(JSON.parse(localStorage.getItem(SAVE_KEY))); } catch {}
try {
  const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
  if (saved && TEXT[saved.lang]) settings.lang = saved.lang;
} catch {}

function save() {
  state.lastTick = Date.now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch {}
}

function saveSettings() {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch {}
}

function rollDrop(key) {
  let r = Math.random();
  for (const [item, chance] of NODES[key].drops(state.nodes[key].level / MAX_LEVEL)) {
    if ((r -= chance) < 0) return item;
  }
  return null;
}

// Waktu satu aksi dalam ms; ayunan ke pohon makin cepat seiring level kapak
const actionTime = key => NODES[key].time * (NODES[key].tool === 'axe' ? 1 - AXE_CUT * state.axe.level : 1);

// Satu aksi (tebang/tambang): undi hasil, tambah exp ke sumber daya (dan kapak untuk pohon).
// Mengembalikan { item, qty }, atau null kalau zonk.
function act(key) {
  const node = NODES[key], drop = rollDrop(key);
  let qty = 0;
  if (drop) {
    qty = drop === node.wood && Math.random() < AXES[state.axe.tier].double ? 2 : 1;
    state.items[drop] += qty;
  }
  gainXp(state.nodes[key], node.xp, xpNeeded);
  if (node.tool === 'axe') gainXp(state.axe, node.xp, axeXpNeeded);
  return drop && { item: drop, qty };
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
if (state.active) {
  let elapsed = Math.min(Date.now() - state.lastTick, OFFLINE_CAP) + state.progress;
  for (let time; elapsed >= (time = actionTime(state.active)); elapsed -= time) act(state.active);
  state.progress = elapsed;
}
