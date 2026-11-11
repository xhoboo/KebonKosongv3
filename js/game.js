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
  kitchen: { level: KITCHEN.start },
  cooking: { level: 0, xp: 0 }, // skill Memasak
  equip: { weapon: null, armor: null }, // perlengkapan yang dipakai tidak memakan slot Rumah
  mastery: { melee: { level: 0, xp: 0 }, armor: { level: 0, xp: 0 } },
  bag: { level: 0, items: {} },
  hp: 0, // HP petualangan yang sedang berjalan
  adv: { wins: 0, losses: 0, kepeng: 0 }, // ringkasan petualangan terakhir
  journal: [], // catatan petualangan, terbaru di depan
  unlocked: Object.fromEntries(Object.keys(AREA_UNLOCKS).map(k => [k, false])),
  kepeng: 0,
  house: { level: 0 },
  discarded: {}, // item yang dibuang karena rumah penuh, sampai catatannya ditutup
  active: null, // hanya satu aksi yang berjalan dalam satu waktu
  progress: 0,
  lastTick: Date.now(),
  // 2: exp sumber daya per exp, bukan per aksi; 3: Kepeng; 4: Rumah; 5: alat generik (kapak + beliung), Anvil, area terkunci;
  // 6: joran + Sungai; 7: Dapur + Memasak; 8: Petualangan (semuanya cukup diisi bawaan)
  version: 8,
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
    Object.assign(state.kitchen, saved.kitchen);
    Object.assign(state.cooking, saved.cooking);
    Object.assign(state.equip, saved.equip);
    for (const k in state.mastery) Object.assign(state.mastery[k], saved.mastery && saved.mastery[k]);
    Object.assign(state.bag, saved.bag);
    state.hp = saved.hp || 0;
    Object.assign(state.adv, saved.adv);
    if (Array.isArray(saved.journal)) state.journal = saved.journal;
    Object.assign(state.unlocked, saved.unlocked);
    state.kepeng = saved.kepeng || 0; // simpanan sebelum versi 3 belum punya Kepeng
    Object.assign(state.house, saved.house); // sebelum versi 4 belum ada Rumah: mulai dari level 0
    Object.assign(state.discarded, saved.discarded);
    state.active = NODES[saved.active] || RECIPES[saved.active] || ADVENTURES[saved.active] ? saved.active : null;
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

// Kegiatan terkunci kalau: node → areanya belum terbuka atau tingkat alatnya kurang; resep → level Dapur kurang;
// petualangan → area Petualangan belum terbuka
const nodeOpen = key => ADVENTURES[key] ? areaOpen('petualangan')
  : RECIPES[key] ? state.kitchen.level >= RECIPES[key].kitchen
  : areaOpen(NODES[key].area) && state.tools[NODES[key].tool].tier >= NODES[key].tier;

function rollDrop(key) {
  let r = Math.random();
  for (const [item, chance] of NODES[key].drops(state.nodes[key].level / MAX_LEVEL, state.tools[NODES[key].tool].tier)) {
    if ((r -= chance) < 0) return item;
  }
  return null;
}

// Waktu satu aksi dalam ms; makin cepat seiring level alat (node) atau skill Memasak (resep);
// petualangan mengikuti interval senjata yang dipakai
const actionTime = key => ADVENTURES[key] ? (state.equip.weapon ? ITEM[state.equip.weapon].weapon.interval : 5000)
  : RECIPES[key] ? RECIPES[key].time * (1 - COOK_CUT * state.cooking.level)
  : NODES[key].time * (1 - TOOL_CUT * state.tools[NODES[key].tool].level);

// Rumah: kapasitas = jumlah item berbeda yang bisa disimpan
const houseCapacity = () => HOUSE.base + HOUSE.perLevel * state.house.level;
const usedSlots = () => ITEMS.reduce((n, it) => n + (state.items[it.key] >= 1), 0);

// Item bisa disimpan di Rumah kalau sudah ada, atau masih ada slot kosong
const canStore = key => state.items[key] >= 1 || usedSlots() < houseCapacity();

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
  checkUnlocks(); // mis. joran pertama membuka Sungai
  save();
  return { ok, key: tier.key };
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
const canForgeGear = key => state.anvil.level >= GEAR[key].anvil && canAfford(GEAR[key].cost) && canStore(key);
function forgeGear(key) {
  if (!canForgeGear(key)) return null;
  const ok = Math.random() < gearChance(key);
  pay(GEAR[key].cost);
  if (ok) addItem(key, 1);
  checkUnlocks(); // senjata pertama membuka Petualangan
  save();
  return { ok, key };
}

// ---------- Petualangan ----------

const adventuring = () => !!ADVENTURES[state.active];
const meleeAtk = () => (state.equip.weapon ? ITEM[state.equip.weapon].weapon.atk : 0) * (1 + ADV.atkPerMeleeLv * state.mastery.melee.level);
const playerDef = () => (state.equip.armor ? ITEM[state.equip.armor].armor.def : 0) + ADV.defPerArmorLv * state.mastery.armor.level;
const maxHp = () => ADV.baseHp + ADV.hpPerArmorLv * state.mastery.armor.level + (state.equip.armor ? ITEM[state.equip.armor].armor.hp : 0);
const winChance = enemy => { const a = meleeAtk() ** 2, p = ENEMIES[enemy].power ** 2; return a / (a + p); };
const hitDamage = enemy => Math.max(1, Math.round(ENEMIES[enemy].dmg * 100 / (100 + playerDef())));

// Tas: kapasitas = jumlah item berbeda
const bagCapacity = () => BAG.base + BAG.perLevel * state.bag.level;
const bagUsed = () => Object.values(state.bag.items).filter(n => n >= 1).length;
function bagAdd(key, qty) {
  if (!(state.bag.items[key] >= 1) && bagUsed() >= bagCapacity()) return false;
  state.bag.items[key] = (state.bag.items[key] || 0) + qty;
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

// Rumah → Tas: hanya bekal (masakan), dan tidak saat sedang berpetualang
function packFood(key, qty) {
  if (adventuring() || ITEM[key].cat !== 'food') return 0;
  qty = Math.min(qty, Math.floor(state.items[key]));
  if (!(qty > 0) || !bagAdd(key, qty)) return 0;
  state.items[key] -= qty;
  save();
  return qty;
}
// Tas → Rumah: semua item. Kalau rumah penuh untuk item jenis baru, item tetap di tas.
function storeFromBag(key) {
  if (adventuring() || !(state.bag.items[key] >= 1) || !canStore(key)) return false;
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
  if (adventuring()) return;
  delete state.bag.items[key];
  save();
}

// Pakai/lepas perlengkapan (tidak saat berpetualang). Barang yang dilepas kembali ke Rumah.
function equipItem(slot, key) {
  if (adventuring() || !(state.items[key] >= 1) || !ITEM[key][slot]) return false;
  const prev = state.equip[slot];
  state.items[key]--;
  if (prev && !canStore(prev)) { state.items[key]++; return false; }
  if (prev) addItem(prev, 1);
  state.equip[slot] = key;
  save();
  return true;
}
function unequip(slot) {
  const prev = state.equip[slot];
  if (adventuring() || !prev || !canStore(prev)) return false;
  addItem(prev, 1);
  state.equip[slot] = null;
  save();
  return true;
}

function log(at, entry) {
  state.journal.unshift({ at, ...entry });
  if (state.journal.length > ADV.journalMax) state.journal.length = ADV.journalMax;
}

// Mulai/hentikan kegiatan. Petualangan butuh senjata, mulai dengan HP penuh dan ringkasan baru.
// Mengembalikan false kalau kegiatan tidak bisa dimulai.
function setActive(key) {
  if (key && !nodeOpen(key)) return false;
  if (ADVENTURES[key] && !state.equip.weapon) return false;
  if (adventuring() && state.active !== key) log(Date.now(), { k: 'stop' });
  if (ADVENTURES[key] && state.active !== key) {
    state.hp = maxHp();
    state.adv = { wins: 0, losses: 0, kepeng: 0 };
    log(Date.now(), { k: 'start', area: key });
  }
  state.active = key;
  state.progress = 0;
  save();
  return true;
}

const randInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

// Makan otomatis selama HP ≤ batas dan masih ada masakan di tas: pilih yang paling pas
// (pulihnya terbesar yang tidak melebihi HP yang hilang, kalau tidak ada yang terkecil)
function autoEat(at) {
  const max = maxHp();
  while (state.hp <= max * ADV.eatBelow) {
    const foods = Object.keys(state.bag.items).filter(k => heals[k]).sort((a, b) => heals[b] - heals[a]);
    if (!foods.length) return;
    const missing = max - state.hp, food = foods.find(k => heals[k] <= missing) || foods[foods.length - 1];
    bagTake(food, 1);
    state.hp = Math.min(max, state.hp + heals[food]);
    log(at, { k: 'eat', f: food, h: heals[food] });
  }
}

// Satu encounter. Mengembalikan ringkasan untuk popup: { enemy, win, dmg, loot: [[item, qty]], home }.
function adventure(key, at) {
  const events = ADVENTURES[key].events;
  let r = Math.random() * events.reduce((sum, e) => sum + e.w, 0), ev = events[0];
  for (const e of events) if ((r -= e.w) < 0) { ev = e; break; }
  const res = { loot: [] };
  const take = (item, qty) => {
    if (bagAdd(item, qty)) res.loot.push([item, qty]);
    else log(at, { k: 'bagFull', item });
  };
  if (ev.enemy) {
    const enemy = ENEMIES[ev.enemy];
    res.enemy = ev.enemy;
    res.win = Math.random() < winChance(ev.enemy);
    if (res.win) {
      state.adv.wins++;
      gainXp(state.mastery.melee, enemy.xp, xpNeeded);
      for (const [item, chance, min, max] of enemy.drops) if (Math.random() < chance) take(item, randInt(min, max));
      log(at, { k: 'win', e: ev.enemy, loot: res.loot });
    } else {
      state.adv.losses++;
      res.dmg = hitDamage(ev.enemy);
      state.hp = Math.max(0, state.hp - res.dmg);
      gainXp(state.mastery.armor, Math.round(enemy.xp / 2), xpNeeded);
      log(at, { k: 'lose', e: ev.enemy, d: res.dmg });
      autoEat(at);
    }
  } else if (ev.kepeng) {
    const n = randInt(...ev.kepeng);
    state.kepeng += n;
    state.adv.kepeng += n;
    res.loot.push(['kepeng', n]);
    log(at, { k: 'find', loot: res.loot });
  } else {
    take(ev.find, randInt(ev.min, ev.max));
    if (res.loot.length) log(at, { k: 'find', loot: res.loot });
  }
  if (state.hp <= 0) {
    state.active = null;
    state.progress = 0;
    res.home = true;
    log(at, { k: 'home' });
  }
  return res;
}

// Satu aksi (tebang/tambang/mancing/masak/petualangan): undi hasil, tambah exp ke sumber daya dan alatnya.
// Mengembalikan { item, qty, lost }, atau null kalau zonk; lost = dibuang karena rumah penuh.
// at = waktu kejadian (untuk jurnal; saat offline dihitung mundur dari waktu sekarang).
function act(key, at = Date.now()) {
  if (ADVENTURES[key]) return adventure(key, at);
  if (RECIPES[key]) return cook(key);
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
if (state.active && (!nodeOpen(state.active) || ADVENTURES[state.active] && !state.equip.weapon)) state.active = null;
if (state.active) {
  const away = Math.min(Date.now() - state.lastTick, OFFLINE_CAP);
  let elapsed = away + state.progress, at = Date.now() - away;
  for (let time; state.active && elapsed >= (time = actionTime(state.active)); elapsed -= time) act(state.active, at += time);
  if (state.active) state.progress = elapsed;
  checkUnlocks();
}
