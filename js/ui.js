// Tampilan: kartu, alat, anvil, rumah, pasar, menu, pengaturan, suara, dan loop animasi.

const $ = id => document.getElementById(id);
const itemsEl = $('items'), emptyEl = $('empty');
const t = key => TEXT[settings.lang][key];
const num = (n, digits = 0) => n.toLocaleString(settings.lang === 'id' ? 'id-ID' : 'en-US', { maximumFractionDigits: digits });
let page = 'hutan';

// Nama & ikon item, termasuk item berkualitas ('kris@good' → "Keris Bagus", Pusaka + sifat dalam kurung)
const iconOf = key => key === 'kepeng' ? KEPENG_ICON : itemDef(key).icon;
function nameOf(key) {
  const { base, q, trait } = parseKey(key);
  if (SEED_CROP[base]) return t('seedOf')(t(SEED_CROP[base]));
  return t(base) + (q !== 'common' ? ' ' + t(QUALITY[q].name) : '') + (trait ? ` (${t(TRAITS[trait].name)})` : '');
}

// Nama tampilan area (untuk syarat petualangan)
const AREA_NAMES = { goa: 'cave', sungai: 'river', danau: 'lake', laut: 'sea' };

// Halaman tempat kartu sebuah kegiatan berada
const activityArea = key => ADVENTURES[key] ? 'petualangan' : RECIPES[key] ? 'dapur' : NODES[key].area;

// Buat kartu untuk tiap kegiatan: sumber daya (tebang/tambang/mancing) dan resep Dapur
const cards = {};
for (const key of [...Object.keys(NODES), ...Object.keys(RECIPES), ...Object.keys(ADVENTURES)]) {
  const node = NODES[key] || ADVENTURES[key], recipe = RECIPES[key];
  const el = document.createElement('button');
  el.className = 'card';
  el.dataset.node = key;
  el.innerHTML = `<span class="level"></span><span class="name" data-i18n="${node && node.name || key}"></span>` +
    `<span class="duration"></span>${recipe ? '<span class="inputs"></span>' : ''}` +
    `<span class="icon">${recipe ? icons[key] : node.icon}</span>` +
    `<span class="bar"><span class="fill"></span></span>`;
  document.querySelector(`.cards[data-area="${activityArea(key)}"]`).appendChild(el);
  cards[key] = {
    el, level: el.querySelector('.level'), duration: el.querySelector('.duration'), inputs: el.querySelector('.inputs'),
    fill: el.querySelector('.fill'), icon: el.querySelector('.icon'),
  };
  el.addEventListener('click', () => {
    if (!nodeOpen(key)) return;
    // Resep yang bahannya kurang tidak bisa dimulai
    if (recipe && state.active !== key && !canAfford(recipe.input)) { popup(key, null, t('outOfIngredients')); return; }
    if (ADVENTURES[key] && !state.equip.weapon) { popup(key, null, t('needWeapon')); return; }
    setActive(state.active === key ? null : key);
    render();
    renderAdventure();
  });
}

// Popup hasil di posisi acak di dalam kartu; kalau aksinya cepat, popup menumpuk dan menyebar
// text = pesan khusus (mis. area baru terbuka) sebagai pengganti hasil aksi
function popup(key, got, text, cls) {
  const card = cards[key];
  const el = document.createElement('span');
  el.className = text ? 'pop' + (cls ? ' ' + cls : '') : !got ? 'pop miss' : got.lost ? 'pop full' : 'pop';
  el.innerHTML = text || (!got ? t('miss') : got.lost ? icons[got.item] + ' ' + t('houseFull') : '+' + got.qty + ' ' + icons[got.item]);
  card.el.appendChild(el);
  // Tetap di dalam kartu sepanjang animasi (mulai 6px lebih rendah, berakhir 8px lebih tinggi), jarak tepi 6px
  const x0 = 6, x1 = card.el.clientWidth - el.offsetWidth - 6;
  const y0 = 6 + 8, y1 = card.el.clientHeight - el.offsetHeight - 6 - 6;
  // Dari beberapa posisi acak, ambil yang paling jauh dari popup lain supaya tumpukan menyebar dan tetap terbaca
  const others = [...card.el.querySelectorAll('.pop')].filter(p => p !== el).map(p => [p.offsetLeft, p.offsetTop]);
  let best, bestDist = -1;
  for (let i = 0; i < 8; i++) {
    const x = x0 + Math.random() * Math.max(0, x1 - x0), y = y0 + Math.random() * Math.max(0, y1 - y0);
    const dist = Math.min(Infinity, ...others.map(([ox, oy]) => Math.hypot(x - ox, y - oy)));
    if (dist > bestDist) { best = [x, y]; bestDist = dist; }
  }
  el.style.left = best[0] + 'px';
  el.style.top = best[1] + 'px';
  el.addEventListener('animationend', () => el.remove());
  card.icon.classList.remove('bump');
  void card.icon.offsetWidth; // mulai ulang animasi
  card.icon.classList.add('bump');
}

let openItem = null; // item yang namanya sedang ditampilkan

// Biaya (Kepeng dan/atau item) sebagai "ikon punya/butuh"
const costHtml = cost => Object.entries(cost)
  .map(([key, n]) => `${key === 'kepeng' ? KEPENG_ICON : icons[key]} ${num(Math.floor(have(key)))}/${num(n)}`).join(' · ');

function itemTile(key) {
  const qty = num(Math.floor(state.items[key]));
  const open = key === openItem;
  return `<li><button class="item q-${parseKey(key).q}" data-item="${key}" aria-expanded="${open}" aria-label="${nameOf(key)}: ${qty}">` +
    `<span class="item-icon" aria-hidden="true">${iconOf(key)}</span>` +
    `<span class="item-qty" aria-hidden="true">${qty}</span></button></li>`;
}

// Rumah: kartu kapasitas + upgrade, catatan item yang dibuang, lalu isi rumah sesuai urutan yang dipilih
const houseUpgradeBtn = $('house-upgrade');
function renderHouse() {
  const owned = ownedKeys();
  let groups;
  if (settings.sort === 'cat') {
    groups = CATEGORIES.map(c => [t(c.name), owned.filter(k => itemDef(k).cat === c.key)]).filter(([, list]) => list.length);
  } else {
    const list = [...owned];
    if (settings.sort === 'qty') list.sort((a, b) => state.items[b] - state.items[a]);
    else {
      const collator = new Intl.Collator(settings.lang);
      list.sort((a, b) => collator.compare(nameOf(a), nameOf(b)));
    }
    groups = [[null, list]];
  }
  itemsEl.innerHTML = groups.map(([title, list]) =>
    (title ? `<h3 class="group">${title}</h3>` : '') + `<ul class="items">${list.map(itemTile).join('')}</ul>`).join('');
  emptyEl.hidden = owned.length > 0;
  document.querySelectorAll('[data-sort-choice]').forEach(b => b.setAttribute('aria-pressed', b.dataset.sortChoice === settings.sort));

  const used = usedSlots(), cap = houseCapacity(), lv = state.house.level;
  $('house-level').textContent = 'Lv. ' + lv;
  $('house-fill').style.width = Math.min(100, used / cap * 100) + '%';
  $('house-fill').classList.toggle('full', used >= cap);
  $('house-slots').textContent = t('slotsUsed')(num(used), num(cap));
  houseUpgradeBtn.hidden = lv >= HOUSE.maxLevel;
  if (lv < HOUSE.maxLevel) {
    const cost = HOUSE.cost(lv);
    $('house-next').textContent = t('houseUpgrade')(lv + 1, HOUSE.perLevel);
    $('house-cost').innerHTML = costHtml(cost);
    houseUpgradeBtn.disabled = !canAfford(cost);
  }

  const lost = Object.keys(state.discarded);
  $('discarded').hidden = !lost.length;
  $('discarded-list').innerHTML = lost.map(key => `<span>${iconOf(key)} ×${num(state.discarded[key])}</span>`).join('');
}

houseUpgradeBtn.addEventListener('click', () => {
  if (!upgradeHouse()) return;
  renderHouse();
  renderKepeng();
  renderTools();
});
$('discarded-dismiss').addEventListener('click', () => {
  state.discarded = {};
  save();
  renderHouse();
});
document.querySelectorAll('[data-sort-choice]').forEach(b => b.addEventListener('click', () => {
  settings.sort = b.dataset.sortChoice;
  saveSettings();
  renderHouse();
}));

function render() {
  for (const [key, card] of Object.entries(cards)) {
    const on = state.active === key;
    card.el.classList.toggle('locked', !nodeOpen(key));
    card.fill.style.width = (on ? state.progress / actionTime(key) * 100 : 0) + '%';
    if (RECIPES[key]) {
      // Resep tidak punya level sendiri: tampilkan HP yang dipulihkan
      card.level.textContent = '❤️ ' + heals[key];
    } else if (ADVENTURES[key]) {
      card.level.textContent = on ? '❤️ ' + num(state.hp) + ' / ' + num(maxHp()) : '';
    } else {
      const n = state.nodes[key];
      card.level.textContent = t('level') + ' ' + n.level;
      card.el.style.setProperty('--lv', (n.level >= MAX_LEVEL ? 100 : n.xp / xpNeeded(n.level) * 100) + '%');
    }
    card.el.classList.toggle('on', on);
    card.el.setAttribute('aria-pressed', on);
  }
}

// Kartu alat (kapak di Hutan, beliung di Goa), plus teks waktu & exp di kartu node
// (keduanya ikut berubah saat alat naik level atau tingkat)
for (const [tool, def] of Object.entries(TOOLS)) {
  const box = document.querySelector(`.tool[data-tool="${tool}"]`);
  box.classList.add('tool-split');
  box.innerHTML =
    `<div class="tool-body"><div class="tool-top"><span class="tool-icon" aria-hidden="true">${def.icon}</span><div class="tool-main">` +
    `<div class="tool-title"><span class="level"></span><span class="name"></span></div>` +
    `<span class="bar"><span class="fill"></span></span><span class="tool-xp"></span></div></div></div>` +
    `<div class="tool-side"><dl class="stats"><div class="row-cut"><dt data-i18n="${def.interval}"></dt><dd></dd></div>` +
    `<div class="row-double"><dt data-i18n="${def.doubleText}"></dt><dd></dd></div></dl>` +
    `<span class="tool-hint" data-i18n="toolHint"></span></div>`;
}

function renderTools() {
  for (const [tool, def] of Object.entries(TOOLS)) {
    const el = document.querySelector(`.tool[data-tool="${tool}"]`), s = state.tools[tool];
    const tier = def.tiers[s.tier], maxed = s.level >= MAX_LEVEL;
    el.querySelector('.level').textContent = 'Lv. ' + s.level;
    el.querySelector('.name').textContent = t(tier.key);
    el.querySelector('.fill').style.width = (maxed ? 100 : s.xp / toolXpNeeded(s.level) * 100) + '%';
    el.querySelector('.tool-xp').textContent = maxed ? t('max') : num(s.xp) + ' / ' + num(toolXpNeeded(s.level));
    // Baris bonus hanya tampil kalau bonusnya ada
    el.querySelector('.row-cut').hidden = !s.level;
    el.querySelector('.row-cut dd').textContent = '−' + num(TOOL_CUT * s.level * 100, 2) + '%';
    el.querySelector('.row-double').hidden = !tier.double;
    el.querySelector('.row-double dd').textContent = num(tier.double * 100) + '%';
    el.querySelector('.stats').hidden = !s.level && !tier.double;
    el.querySelector('.tool-hint').hidden = !nextTier(tool);
  }
  for (const [key, card] of Object.entries(cards)) {
    const node = NODES[key] || RECIPES[key];
    if (ADVENTURES[key]) {
      // Petualangan: musuhnya beserta peluang menang dengan senjata sekarang, atau syarat yang belum terpenuhi
      const req = ADVENTURES[key].req || {}, enemies = ADVENTURES[key].events.filter(e => e.enemy).map(e => e.enemy);
      card.duration.innerHTML = nodeOpen(key)
        ? enemies.map(e => ENEMIES[e].icon + (state.equip.weapon ? ' ' + num(winChance(e) * 100) + '%' : '')).join(' · ')
        : '🔒 ' + (state.mastery.melee.level < (req.melee || 0) ? t('needMelee')(req.melee) : t('needArea')(t(AREA_NAMES[req.area])));
      continue;
    }
    card.duration.innerHTML = nodeOpen(key) ? num(actionTime(key) / 1000, 2) + ' ' + t('seconds') + ` · ${node.xp} Exp`
      : RECIPES[key] ? '🔒 ' + t('needKitchen')(node.kitchen)
      : '🔒 ' + t('needs')(t(TOOLS[node.tool].tiers[node.tier].key));
    if (card.inputs) card.inputs.innerHTML = costHtml(node.input);
  }
  renderKitchen();
}

// Dapur: kartu level + skill Memasak + upgrade
const kitchenUpgradeBtn = $('kitchen-upgrade');
function renderKitchen() {
  const lv = state.kitchen.level, cost = KITCHEN.cost[lv + 1], c = state.cooking, maxed = c.level >= MAX_LEVEL;
  $('kitchen-level').textContent = 'Lv. ' + lv;
  $('kitchen-desc').textContent = t('kitchenRecipes')(Object.values(RECIPES).filter(r => r.kitchen <= lv).length);
  $('cooking-level').textContent = t('cooking') + ' Lv. ' + c.level;
  $('cooking-fill').style.width = (maxed ? 100 : c.xp / xpNeeded(c.level) * 100) + '%';
  $('cooking-xp').textContent = maxed ? t('max') : num(c.xp) + ' / ' + num(xpNeeded(c.level));
  $('cook-speed-row').hidden = !c.level;
  $('cook-speed').textContent = '−' + num(COOK_CUT * c.level * 100, 2) + '%';
  kitchenUpgradeBtn.hidden = !cost;
  if (cost) {
    $('kitchen-next').textContent = t('upgradeLv')(lv + 1);
    $('kitchen-cost').innerHTML = costHtml(cost);
    kitchenUpgradeBtn.disabled = !canAfford(cost);
  }
}
kitchenUpgradeBtn.addEventListener('click', () => {
  if (!upgradeKitchen()) return;
  renderTools();
  renderKepeng();
});

// Menu: area terkunci tidak bisa dibuka dan menampilkan syaratnya
function renderNav() {
  for (const area of Object.keys(AREA_UNLOCKS)) {
    const btn = document.querySelector(`.nav-item[data-page="${area}"]`);
    btn.disabled = !areaOpen(area);
    btn.querySelector('.nav-lock').hidden = areaOpen(area);
  }
}

// Status di menu (terlihat di sidebar desktop): level skill tiap area dan titik kegiatan yang berjalan.
// Hanya menulis ke DOM kalau nilainya berubah karena dipanggil tiap frame.
const NAV_SKILL = {
  kebun: () => state.farm, hutan: () => state.tools.axe, goa: () => state.tools.pickaxe, sungai: () => state.tools.rod,
  dapur: () => state.cooking, anvil: () => state.smithing, petualangan: () => state.mastery.melee,
};
let navStatusKey = '';
function renderNavStatus() {
  const running = state.active ? activityArea(state.active) : null;
  const levels = Object.entries(NAV_SKILL).map(([p, s]) => s().level);
  const key = running + '|' + levels.join(',');
  if (key === navStatusKey) return;
  navStatusKey = key;
  Object.keys(NAV_SKILL).forEach((p, i) => {
    const el = document.querySelector(`.nav-item[data-page="${p}"] .nav-lv`);
    if (el) el.textContent = levels[i] + ' / ' + MAX_LEVEL;
  });
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('running', n.dataset.page === running));
}

function renderPageTitle() {
  const nav = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (!nav) return;
  const label = nav.querySelector('[data-i18n]') || nav.lastElementChild;
  $('page-title').textContent = nav.firstElementChild.textContent + ' ' + label.textContent;
}

// Suara dibuat langsung dengan Web Audio (tanpa file), hanya setelah pemain menyentuh layar
let audio;
function tone({ freq, type = 'sine', dur = 0.3, vol = 0.2, at = 0, slide }) {
  if (!settings.sound) return;
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const start = audio.currentTime + at, osc = audio.createOscillator(), gain = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (slide) osc.frequency.exponentialRampToValueAtTime(slide, start + dur);
    gain.gain.setValueAtTime(vol, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
    osc.connect(gain).connect(audio.destination);
    osc.start(start);
    osc.stop(start + dur);
  } catch {}
}
const SOUNDS = {
  // Dentang palu di anvil: nada logam tinggi + ketukan rendah
  clang: at => {
    tone({ freq: 1760, type: 'triangle', dur: 0.35, vol: 0.12, at });
    tone({ freq: 2637, type: 'sine', dur: 0.25, vol: 0.06, at });
    tone({ freq: 180, type: 'square', dur: 0.06, vol: 0.08, at, slide: 60 });
  },
  success: at => { tone({ freq: 660, dur: 0.15, at }); tone({ freq: 990, dur: 0.35, at: at + 0.12 }); },
  fail: at => { tone({ freq: 220, type: 'sawtooth', dur: 0.4, vol: 0.12, at, slide: 70 }); },
};

// Anvil: kartu level + upgrade, lalu satu baris per alat dengan tingkat berikutnya
const anvilUpgradeBtn = $('anvil-upgrade'), recipesEl = $('recipes');
const FORGE_TIME = 1500; // animasi + suara sebelum hasil tempa keluar
let forging = null; // alat yang sedang ditempa
const forgeResults = {}; // tool → { ok, key, timer } hasil terakhir yang masih ditampilkan

// Statistik singkat perlengkapan: serangan & interval untuk senjata, pertahanan & HP untuk armor
const gearStats = key => {
  const it = itemDef(key);
  return (it.weapon ? `⚔️ ${num(it.weapon.atk, 2)} · ⏱️ ${num(it.weapon.interval / 1000, 2)} ${t('seconds')}`
    : `🛡️ ${num(it.armor.def)} · ❤️ +${num(it.armor.hp)}`) + (it.trait ? ' · ' + t(TRAITS[it.trait].desc) : '');
};

recipesEl.innerHTML = [...Object.entries(TOOLS).map(([key, def]) => [key, def.icon]), ...Object.keys(GEAR).map(key => [key, ITEM[key].icon])].map(([tool, icon]) =>
  `<li class="recipe" data-recipe="${tool}"><span class="recipe-icon" aria-hidden="true">${icon}</span>` +
  `<span class="recipe-info"><span class="recipe-name"></span><span class="recipe-meta recipe-cost"></span>` +
  `<span class="recipe-meta recipe-chance"></span><span class="recipe-result" role="status"></span></span>` +
  `<button class="forge-btn" data-forge="${tool}"></button></li>`).join('');

function renderAnvil() {
  const lv = state.anvil.level, cost = ANVIL.cost[lv + 1];
  $('anvil-level').textContent = 'Lv. ' + lv;
  $('anvil-desc').textContent = t('anvilCanForge')(lv + 1);
  skillBar('smith', state.smithing);
  $('quality-odds').innerHTML = qualityOdds().map(([q, p]) => `<span class="q-${q}">${t(QUALITY[q].name)} ${num(p * 100, 1)}%</span>`).join(' · ');
  anvilUpgradeBtn.hidden = !cost;
  if (cost) {
    $('anvil-next').textContent = t('upgradeLv')(lv + 1);
    $('anvil-cost').innerHTML = costHtml(cost);
    anvilUpgradeBtn.disabled = !canAfford(cost);
  }
  for (const tool of Object.keys(TOOLS)) {
    const row = recipesEl.querySelector(`[data-recipe="${tool}"]`), next = nextTier(tool);
    const btn = row.querySelector('.forge-btn'), result = forgeResults[tool];
    const cur = TOOLS[tool].tiers[state.tools[tool].tier], current = t(cur.key);
    // Alat yang belum dimiliki (tingkat 0 = belum punya) cukup ditulis nama tingkat berikutnya
    row.querySelector('.recipe-name').textContent = !next ? current : cur.none ? t(next.key) : current + ' → ' + t(next.key);
    row.querySelector('.recipe-cost').innerHTML = next ? costHtml(next.cost) : t('topTier');
    row.querySelector('.recipe-chance').textContent = !next ? ''
      : lv < next.anvil ? t('needAnvil')(next.anvil) : t('chance')(num(forgeChance(tool) * 100));
    const res = row.querySelector('.recipe-result');
    res.innerHTML = result ? (result.ok ? t('forgeOk')(t(result.key)) : t('forgeFail')) + ` <small>${t('smithXp')(num(result.xp))}</small>` : '';
    res.className = 'recipe-result' + (result ? (result.ok ? ' ok' : ' fail') : '');
    res.hidden = !result;
    btn.hidden = !next && forging !== tool;
    btn.textContent = forging === tool ? t('forging') : t('forge');
    btn.disabled = !!forging || !canForge(tool);
    row.classList.toggle('forging', forging === tool);
  }
  for (const key of Object.keys(GEAR)) {
    const row = recipesEl.querySelector(`[data-recipe="${key}"]`), g = GEAR[key], result = forgeResults[key];
    // Jumlah dimiliki, semua kualitas, termasuk yang sedang dipakai
    const mine = k => parseKey(k).base === key;
    const owned = ownedKeys().filter(mine).reduce((n, k) => n + state.items[k], 0)
      + ['weapon', 'armor'].filter(s => state.equip[s] && mine(state.equip[s])).length;
    row.querySelector('.recipe-name').textContent = t(key) + (owned ? ` (${num(owned)})` : '');
    row.querySelector('.recipe-cost').innerHTML = gearStats(key) + '<br>' + costHtml(g.cost);
    row.querySelector('.recipe-chance').textContent = lv < g.anvil ? t('needAnvil')(g.anvil)
      : usedSlots() >= houseCapacity() ? t('houseFull') : t('chance')(num(gearChance(key) * 100));
    const res = row.querySelector('.recipe-result');
    res.innerHTML = result ? (result.ok ? t('forgeOk')(nameOf(result.key)) : t('forgeFail')) + ` <small>${t('smithXp')(num(result.xp))}</small>` : '';
    res.className = 'recipe-result' + (result ? (result.ok ? ' ok q-' + parseKey(result.key).q : ' fail') : '');
    res.hidden = !result;
    const btn = row.querySelector('.forge-btn');
    btn.textContent = forging === key ? t('forging') : t('forge');
    btn.disabled = !!forging || !canForgeGear(key);
    row.classList.toggle('forging', forging === key);
  }
}

anvilUpgradeBtn.addEventListener('click', () => {
  if (!upgradeAnvil()) return;
  renderAnvil();
  renderKepeng();
});

// Tempa: bahan langsung terpakai dan hasil langsung diundi (supaya aman kalau halaman ditutup),
// tapi baru ditampilkan setelah animasi & tiga dentang palu.
recipesEl.addEventListener('click', e => {
  const btn = e.target.closest('.forge-btn');
  if (!btn || forging) return;
  const tool = btn.dataset.forge, result = TOOLS[tool] ? forgeTool(tool) : forgeGear(tool);
  if (!result) return;
  forging = tool;
  clearTimeout(forgeResults[tool] && forgeResults[tool].timer);
  delete forgeResults[tool];
  for (let i = 0; i < 3; i++) SOUNDS.clang(i * 0.45);
  renderAnvil();
  renderKepeng();
  setTimeout(() => {
    forging = null;
    (result.ok ? SOUNDS.success : SOUNDS.fail)(0);
    result.timer = setTimeout(() => { delete forgeResults[tool]; renderAnvil(); }, 4000);
    forgeResults[tool] = result;
    const row = recipesEl.querySelector(`[data-recipe="${tool}"]`);
    if (!result.ok) {
      row.classList.remove('shake');
      void row.offsetWidth;
      row.classList.add('shake');
    }
    renderAnvil();
    renderTools();
    renderNav();
    renderAdventure();
  }, FORGE_TIME);
});

// ---------- Petualangan ----------

const skillBar = (prefix, s) => {
  const maxed = s.level >= MAX_LEVEL;
  $(prefix + '-level').textContent = 'Lv. ' + s.level;
  $(prefix + '-fill').style.width = (maxed ? 100 : s.xp / xpNeeded(s.level) * 100) + '%';
  $(prefix + '-xp').textContent = maxed ? t('max') : num(s.xp) + ' / ' + num(xpNeeded(s.level));
};
const lootText = loot => loot.map(([k, n]) => (k === 'kepeng' ? KEPENG_ICON : icons[k]) + ' ' + num(n)).join(', ');

function journalText(e) {
  switch (e.k) {
    case 'start': return t('jStart')(t(e.area));
    case 'stop': return t('jStop');
    case 'home': return t('jHome');
    case 'win': return t('jWin')(t(e.e), lootText(e.loot || []));
    case 'lose': return t('jLose')(t(e.e), e.d);
    case 'find': return t('jFind')(lootText(e.loot));
    case 'eat': return t('jEat')(t(e.f), e.h);
    case 'bagFull': return t('jBagFull')(nameOf(e.item));
  }
  return '';
}

let armedDiscard = null, discardTimer;

const equipOpen = settings.equipOpen; // disimpan di pengaturan; null = belum pernah dipilih (lipat kalau slot terisi)
function renderAdventure() {
  const busy = adventuring(), max = maxHp(), hp = busy ? state.hp : max;
  // Status: HP, mastery, statistik
  $('adv-hp-fill').style.width = Math.min(100, hp / max * 100) + '%';
  $('adv-hp-fill').classList.toggle('low', hp <= max * ADV.eatBelow);
  $('adv-hp').textContent = t('hp') + ' ' + num(hp) + ' / ' + num(max);
  skillBar('melee', state.mastery.melee);
  skillBar('armor', state.mastery.armor);
  $('adv-atk').textContent = num(meleeAtk(), 1);
  $('adv-interval').textContent = state.equip.weapon ? num(actionTime('edgeForest') / 1000) + ' ' + t('seconds') : '—';
  $('adv-def').textContent = num(playerDef());
  // Peluang menang untuk petualangan yang sedang berjalan (atau Hutan Tepi)
  const enemies = [...new Set(ADVENTURES[adventuring() ? state.active : 'edgeForest'].events.filter(e => e.enemy).map(e => e.enemy))];
  $('adv-win').textContent = state.equip.weapon ? enemies.map(e => `${ENEMIES[e].icon} ${num(winChance(e) * 100)}%`).join(' · ') : '—';

  // Perlengkapan: yang dipakai + pilihan dari Rumah. Daftar pilihan bisa dilipat; bawaannya terlipat
  // kalau slot sudah terisi dan terbuka kalau masih kosong, sampai pemain menekan tombolnya sendiri.
  $('equip').innerHTML = ['weapon', 'armor'].map(slot => {
    const cur = state.equip[slot];
    const options = ownedKeys().filter(k => itemDef(k)[slot]);
    const open = options.length > 0 && (equipOpen[slot] ?? !cur);
    return `<div class="equip-slot"><div class="equip-head"><span class="equip-label">${t(slot)}</span>` +
      (options.length ? `<button class="equip-toggle" data-toggle-equip="${slot}" aria-expanded="${open}">` +
        `${open ? t('equipHide') : t('equipShow')(num(options.length))}<span class="caret" aria-hidden="true"></span></button>` : '') + `</div>` +
      `<div class="equip-cur">${cur ? `<span class="equip-icon">${iconOf(cur)}</span><span class="equip-name q-${parseKey(cur).q}">${nameOf(cur)}<small>${gearStats(cur)}</small></span>` +
        `<button class="chip" data-unequip="${slot}" ${busy ? 'disabled' : ''}>${t('unequip')}</button>` : `<span class="equip-none">${t('none')}</span>`}</div>` +
      (open ? `<div class="equip-options">${options.map(k =>
        `<button class="chip q-${parseKey(k).q}" data-equip="${slot}" data-key="${k}" ${busy ? 'disabled' : ''}>${iconOf(k)} ${nameOf(k)} ×${num(state.items[k])}</button>`).join('')}</div>` : '') +
      `</div>`;
  }).join('');

  // Tas
  const bagKeys = Object.keys(state.bag.items).filter(k => state.bag.items[k] >= 1);
  $('bag-level').textContent = 'Lv. ' + state.bag.level;
  $('bag-slots').textContent = t('bagSlots')(num(bagKeys.length), num(bagCapacity()));
  const bagCost = state.bag.level < BAG.maxLevel && BAG.cost(state.bag.level);
  $('bag-upgrade').hidden = !bagCost;
  if (bagCost) {
    $('bag-next').textContent = t('houseUpgrade')(state.bag.level + 1, BAG.perLevel);
    $('bag-cost').innerHTML = costHtml(bagCost);
    $('bag-upgrade').disabled = !canAfford(bagCost);
  }
  $('bag-items').innerHTML = bagKeys.map(k =>
    `<li class="sell-row"><span class="sell-icon" aria-hidden="true">${iconOf(k)}</span>` +
    `<span class="sell-info"><span class="sell-name">${nameOf(k)}</span><span class="sell-meta">${num(state.bag.items[k])}${heals[k] ? ' · ❤️ ' + heals[k] : ''}</span></span>` +
    `<button class="sell-btn" data-store="${k}" ${busy || !canStore(k) ? 'disabled' : ''}>${canStore(k) ? t('store') : t('houseFull')}</button>` +
    `<button class="sell-btn ${armedDiscard === k ? 'confirm' : ''}" data-discard="${k}" ${busy ? 'disabled' : ''}>${armedDiscard === k ? t('sure') : t('discard')}</button></li>`).join('');
  $('bag-empty').hidden = bagKeys.length > 0;
  $('bag-store-all').hidden = !bagKeys.length;
  $('bag-store-all').disabled = busy;

  // Bawa masakan dari Rumah
  const foods = ITEMS.filter(it => it.cat === 'food' && state.items[it.key] >= 1);
  $('pack').innerHTML = foods.map(it =>
    `<li class="sell-row"><span class="sell-icon" aria-hidden="true">${it.icon}</span>` +
    `<span class="sell-info"><span class="sell-name">${t(it.key)}</span><span class="sell-meta">${num(state.items[it.key])} · ❤️ ${it.heal}</span></span>` +
    [1, 10].map(n => `<button class="sell-btn" data-pack="${it.key}" data-qty="${n}" ${busy ? 'disabled' : ''}>+${n}</button>`).join('') +
    `<button class="sell-btn" data-pack="${it.key}" data-qty="all" ${busy ? 'disabled' : ''}>${t('all')}</button></li>`).join('');
  $('pack-empty').hidden = foods.length > 0;

  // Jurnal
  $('adv-summary').textContent = state.journal.length ? t('advSummary')(num(state.adv.wins), num(state.adv.losses), num(state.adv.kepeng)) : '';
  const fmt = new Intl.DateTimeFormat(settings.lang === 'id' ? 'id-ID' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  $('journal').innerHTML = state.journal.map(e =>
    `<li class="j-${e.k}"><time>${fmt.format(e.at)}</time><span>${journalText(e)}</span></li>`).join('');
  $('journal-empty').hidden = state.journal.length > 0;
}

$('page-petualangan').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b || b.disabled) return;
  if (b.dataset.toggleEquip) {
    const slot = b.dataset.toggleEquip;
    equipOpen[slot] = b.getAttribute('aria-expanded') !== 'true';
    saveSettings();
  } else if (b.dataset.equip) { equipItem(b.dataset.equip, b.dataset.key); }
  else if (b.dataset.unequip) unequip(b.dataset.unequip);
  else if (b.dataset.store) storeFromBag(b.dataset.store);
  else if (b.dataset.discard) {
    clearTimeout(discardTimer);
    if (armedDiscard === b.dataset.discard) { discardFromBag(b.dataset.discard); armedDiscard = null; }
    else { armedDiscard = b.dataset.discard; discardTimer = setTimeout(() => { armedDiscard = null; renderAdventure(); }, 3000); }
  } else if (b.dataset.pack) packFood(b.dataset.pack, b.dataset.qty === 'all' ? Infinity : +b.dataset.qty);
  else if (b.id === 'bag-store-all') storeAllFromBag();
  else if (b.id === 'bag-upgrade') { if (upgradeBag()) renderKepeng(); }
  else return;
  renderAdventure();
  render();
});

// ---------- Kebun ----------

// Lama waktu singkat: "45m", "2j 10m", "4h 3j"
function fmtDur(ms) {
  const m = Math.max(1, Math.ceil(ms / 60000)), h = Math.floor(m / 60), d = Math.floor(h / 24);
  if (d) return `${d}${t('days')} ${h % 24}${t('hours')}`;
  if (h) return `${h}${t('hours')} ${m % 60}${t('minutes')}`;
  return `${m}${t('minutes')}`;
}

let selectedCrop = null; // benih yang dipilih untuk ditanam
const harvestFx = {}; // petak → { text, until } hasil panen yang sedang ditampilkan

function renderFarm() {
  const f = state.farm, now = Date.now();
  skillBar('farm', f);
  const used = f.plots.filter(Boolean).length;
  $('farm-plots').textContent = t('plots')(num(used), num(f.plots.length));
  const cost = nextSlotCost();
  $('farm-buy').hidden = cost == null;
  if (cost != null) {
    $('farm-buy-text').textContent = t('buySlot')(f.plots.length + 1, FARM.maxSlots);
    $('farm-buy-cost').textContent = `${KEPENG_ICON} ${num(state.kepeng)}/${num(cost)}`;
    $('farm-buy').disabled = state.kepeng < cost;
  }
  // Pilihan benih: semua benih yang dimiliki
  const seeds = Object.entries(CROPS).filter(([, c]) => state.items[c.seed] >= 1);
  if (!seeds.some(([k]) => k === selectedCrop)) selectedCrop = (seeds.find(([k]) => cropOpen(k)) || [])[0] || null;
  $('farm-seeds').innerHTML = seeds.map(([k, c]) =>
    `<button class="chip${k === selectedCrop ? ' selected' : ''}" data-crop="${k}" ${cropOpen(k) ? '' : 'disabled'} ` +
    `title="${cropOpen(k) ? t('grows')(fmtDur(c.grow)) : t('needFarm')(c.level)}">${iconOf(c.seed)} ${t(k)} ×${num(state.items[c.seed])}` +
    `<small>${cropOpen(k) ? fmtDur(c.grow) : '🔒 Lv. ' + c.level}</small></button>`).join('');
  $('farm-no-seeds').hidden = seeds.length > 0;
  $('farm-plant-all').disabled = !selectedCrop || !f.plots.some(p => !p);
  $('farm-harvest-all').disabled = !f.plots.some(p => ['ready', 'wilted'].includes(plotStatus(p, now)));

  // Petak
  $('plots').innerHTML = f.plots.map((p, i) => {
    const status = plotStatus(p, now), fx = harvestFx[i] && harvestFx[i].until > now ? harvestFx[i].text : '';
    let body;
    if (status === 'empty') body = `<span class="plot-icon empty-icon">${selectedCrop ? iconOf(CROPS[selectedCrop].seed) : '＋'}</span>`;
    else if (status === 'growing') {
      const grow = CROPS[p.crop].grow, left = p.at + grow - now;
      body = `<span class="plot-icon">${iconOf(p.crop)}</span><span class="plot-bar"><span style="width:${(1 - left / grow) * 100}%"></span></span><span class="plot-time">${fmtDur(left)}</span>`;
    } else if (status === 'ready') {
      const left = p.at + CROPS[p.crop].grow + FARM.wilt - now;
      body = `<span class="plot-icon">${iconOf(p.crop)}</span><span class="plot-time">${left < 6 * HOUR ? t('wiltsIn')(fmtDur(left)) : t('ready')}</span>`;
    } else body = `<span class="plot-icon">🥀</span><span class="plot-time">${t('wilted')}</span>`;
    return `<li><button class="plot ${status}" data-plot="${i}" aria-label="${p ? t(p.crop) : ''}">${body}${fx ? `<span class="plot-fx">${fx}</span>` : ''}</button></li>`;
  }).join('');
}

$('page-kebun').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b || b.disabled) return;
  if (b.dataset.crop) selectedCrop = b.dataset.crop;
  else if (b.id === 'farm-buy') { buySlot(); renderKepeng(); }
  else if (b.id === 'farm-plant-all') plantAll(selectedCrop);
  else if (b.id === 'farm-harvest-all') harvestAll();
  else if (b.dataset.plot) {
    const i = +b.dataset.plot, status = plotStatus(state.farm.plots[i]);
    if (status === 'empty' && selectedCrop) { plant(i, selectedCrop); save(); }
    else if (status === 'ready' || status === 'wilted') {
      const r = harvest(i);
      save();
      if (r && r.item) harvestFx[i] = { text: `+${r.qty} ${iconOf(r.item)}`, until: Date.now() + 1500 };
      else if (!r) harvestFx[i] = { text: t('houseFull'), until: Date.now() + 1500 };
    } else return;
  } else return;
  renderFarm();
});
// Petak dihitung dari jam nyata: perbarui tiap detik selama halaman Kebun terbuka
setInterval(() => { if (page === 'kebun') renderFarm(); }, 1000);

// Pasar: beli benih biasa
function renderSeedShop() {
  $('seed-shop').innerHTML = Object.entries(CROPS).filter(([, c]) => c.shop).map(([k, c]) =>
    `<li class="sell-row"><span class="sell-icon" aria-hidden="true">${iconOf(c.seed)}</span>` +
    `<span class="sell-info"><span class="sell-name">${nameOf(c.seed)}</span>` +
    `<span class="sell-meta">${KEPENG_ICON} ${num(c.shop)} · ${fmtDur(c.grow)}${cropOpen(k) ? '' : ' · 🔒 ' + t('needFarm')(c.level)}${state.items[c.seed] >= 1 ? ' · ×' + num(state.items[c.seed]) : ''}</span></span>` +
    [1, 10].map(n => `<button class="sell-btn" data-buy="${k}" data-qty="${n}" ${state.kepeng < c.shop * n || !canStore(c.seed) ? 'disabled' : ''}>${t('buy')(n)}</button>`).join('') +
    `</li>`).join('');
}
$('seed-shop').addEventListener('click', e => {
  const b = e.target.closest('[data-buy]');
  if (!b || b.disabled) return;
  buySeed(b.dataset.buy, +b.dataset.qty);
  renderSeedShop();
  renderMarket();
  renderKepeng();
});

function applySettings() {
  const root = document.documentElement;
  root.dataset.theme = settings.theme;
  root.lang = settings.lang;
  document.querySelector('meta[name="theme-color"]').content = getComputedStyle(root).getPropertyValue('--bg').trim();
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  renderTools();
  renderNav();
  renderAnvil();
  $('menu-btn').setAttribute('aria-label', t('openMenu'));
  document.querySelectorAll('[data-sound-choice]').forEach(b => b.setAttribute('aria-pressed', (b.dataset.soundChoice === 'on') === settings.sound));
  document.querySelectorAll('[data-theme-choice]').forEach(b => b.setAttribute('aria-pressed', b.dataset.themeChoice === settings.theme));
  document.querySelectorAll('[data-lang-choice]').forEach(b => b.setAttribute('aria-pressed', b.dataset.langChoice === settings.lang));
  renderHouse();
  renderMarket();
  renderKepeng();
  renderAdventure();
  renderFarm();
  renderPageTitle();
}

const kepengEl = $('kepeng');
function renderKepeng() {
  kepengEl.textContent = KEPENG_ICON + ' ' + num(state.kepeng);
  kepengEl.setAttribute('aria-label', t('kepeng') + ': ' + num(state.kepeng));
}

// Pasar: satu baris per item yang dimiliki. Baris hanya dibangun ulang kalau daftar itemnya berubah,
// supaya tombol tidak diganti di tengah klik saat jumlah item bertambah.
const marketEl = $('market');
let marketKeys = '', armedSell = null, sellTimer;

function disarmSell() {
  clearTimeout(sellTimer);
  armedSell = null;
}

function renderMarket() {
  const owned = ownedKeys();
  const keys = owned.join();
  if (keys !== marketKeys) {
    marketKeys = keys;
    marketEl.innerHTML = owned.map(k =>
      `<li class="sell-row" data-row="${k}"><span class="sell-icon" aria-hidden="true">${iconOf(k)}</span>` +
      `<span class="sell-info"><span class="sell-name q-${parseKey(k).q}"></span><span class="sell-meta"></span></span>` +
      `<button class="sell-btn" data-sell="${k}" data-qty="1"></button>` +
      `<button class="sell-btn" data-sell="${k}" data-qty="all"></button></li>`).join('');
  }
  for (const k of owned) {
    const row = marketEl.querySelector(`[data-row="${k}"]`);
    row.querySelector('.sell-name').textContent = nameOf(k);
    row.querySelector('.sell-meta').textContent = `${num(Math.floor(state.items[k]))} · ${KEPENG_ICON} ${num(itemDef(k).price)} ${t('each')}`;
    row.querySelector('[data-qty="1"]').textContent = t('sellOne');
    const all = row.querySelector('[data-qty="all"]'), armed = armedSell === k;
    all.textContent = armed ? t('sure') : t('sellAll');
    all.classList.toggle('confirm', armed);
  }
  $('market-empty').hidden = owned.length > 0;
}

// Jual 1 langsung; Jual semua butuh klik kedua dalam 3 detik
marketEl.addEventListener('click', e => {
  const btn = e.target.closest('.sell-btn');
  if (!btn) return;
  const key = btn.dataset.sell;
  if (btn.dataset.qty === 'all' && armedSell !== key) {
    disarmSell();
    armedSell = key;
    sellTimer = setTimeout(() => { disarmSell(); renderMarket(); }, 3000);
  } else {
    if (btn.dataset.qty === 'all') disarmSell();
    sell(key, btn.dataset.qty === 'all' ? Infinity : 1);
    renderSeedShop();
    renderTools();
    renderKepeng();
  }
  renderMarket();
});

const tipEl = $('tip');
let tipTimer;

function showTip(key) {
  openItem = key;
  clearTimeout(tipTimer);
  renderHouse();
  if (!key) { tipEl.hidden = true; return; }
  const r = itemsEl.querySelector(`[data-item="${key}"]`).getBoundingClientRect();
  const def = itemDef(key);
  tipEl.textContent = nameOf(key) + (heals[key] ? ' · ❤️ ' + heals[key] : '') + (def.weapon || def.armor ? ' · ' + gearStats(key) : '');
  tipEl.hidden = false;
  // Jaga popup tetap di dalam layar walau namanya panjang
  const half = tipEl.offsetWidth / 2;
  const x = Math.min(Math.max(r.left + r.width / 2, 8 + half), innerWidth - 8 - half);
  tipEl.style.left = x + 'px';
  tipEl.style.top = (r.top - 8) + 'px';
  tipEl.style.setProperty('--arrow', (r.left + r.width / 2 - x) + 'px');
  tipTimer = setTimeout(() => showTip(null), 2000);
}

// Klik item: munculkan nama; klik item yang sama atau di luar item: tutup
document.addEventListener('click', e => {
  const item = e.target.closest('.item');
  if (item) {
    showTip(openItem === item.dataset.item ? null : item.dataset.item);
    itemsEl.querySelector(`[data-item="${item.dataset.item}"]`).focus();
  } else if (openItem) showTip(null);
});
window.addEventListener('scroll', () => openItem && showTip(null), { passive: true });
window.addEventListener('resize', () => openItem && showTip(null));

let last = performance.now(), timeScale = 1;
function loop(now) {
  // Tab yang lama tersembunyi juga dibatasi 24 jam; timeScale > 1 hanya dari mode uji
  const dt = Math.min(now - last, OFFLINE_CAP) * timeScale;
  last = now;
  const key = state.active;
  if (key) {
    state.progress += dt;
    if (state.progress >= actionTime(key)) {
      let got;
      for (let time; state.active && state.progress >= (time = actionTime(key)); state.progress -= time) got = act(key);
      if (got && got.stopped) save();
      const opened = checkUnlocks();
      if (opened.length) {
        save();
        renderNav();
        if (page === activityArea(key)) popup(key, null, t(AREA_UNLOCKS[opened[0]].done));
      }
      renderTools();
      if (page === activityArea(key) && ADVENTURES[key]) {
        const loot = got.loot.map(([k, n]) => '+' + num(n) + ' ' + (k === 'kepeng' ? KEPENG_ICON : icons[k])).join(' ');
        if (got.enemy && !got.win) popup(key, null, ENEMIES[got.enemy].icon + ' −' + got.dmg + ' ❤️', 'full');
        else if (got.enemy || loot) popup(key, null, (got.enemy ? ENEMIES[got.enemy].icon + ' ⚔️ ' : '') + loot);
        if (got.home) popup(key, null, t('jHome'), 'full');
      } else if (page === activityArea(key)) {
        if (!got || got.item) popup(key, got);
        if (got && got.stopped) popup(key, null, t('outOfIngredients'));
      }
      if (ADVENTURES[key]) renderKepeng();
      if (ADVENTURES[key] && (page === 'petualangan' || got.home)) renderAdventure();
      else if (page === 'anvil') renderAnvil();
      else if (page === 'rumah') renderHouse();
      else if (page === 'pasar') renderMarket();
    }
  }
  render();
  renderNavStatus();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// Menu & halaman
const PAGES = ['kebun', 'hutan', 'goa', 'sungai', 'danau', 'laut', 'dapur', 'petualangan', 'rumah', 'pasar', 'anvil', 'settings'];
const menuBtn = $('menu-btn'), navItems = document.querySelectorAll('.nav-item');

function setMenu(open) {
  document.body.classList.toggle('menu-open', open);
  menuBtn.setAttribute('aria-expanded', open);
}

function showPage(name) {
  if (openItem) showTip(null);
  // Tautan lama: Inventory jadi Rumah, Pohon jadi Hutan
  name = { inventory: 'rumah', pohon: 'hutan' }[name] || name;
  page = PAGES.includes(name) && areaOpen(name) ? name : 'hutan';
  PAGES.forEach(p => { $('page-' + p).hidden = p !== page; });
  navItems.forEach(n => {
    if (n.dataset.page === page) n.setAttribute('aria-current', 'page');
    else n.removeAttribute('aria-current');
  });
  renderPageTitle();
  if (page === 'rumah') renderHouse();
  if (page === 'pasar') { renderMarket(); renderSeedShop(); }
  if (page === 'anvil') renderAnvil();
  if (page === 'kebun') renderFarm();
  if (page === 'petualangan') renderAdventure();
}

menuBtn.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
$('scrim').addEventListener('click', () => setMenu(false));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
navItems.forEach(n => n.addEventListener('click', () => {
  location.hash = n.dataset.page;
  setMenu(false);
}));
window.addEventListener('hashchange', () => showPage(location.hash.slice(1)));

document.querySelectorAll('[data-theme-choice]').forEach(b => b.addEventListener('click', () => {
  settings.theme = b.dataset.themeChoice;
  saveSettings();
  applySettings();
}));
document.querySelectorAll('[data-sound-choice]').forEach(b => b.addEventListener('click', () => {
  settings.sound = b.dataset.soundChoice === 'on';
  saveSettings();
  applySettings();
  if (settings.sound) SOUNDS.clang(0);
}));
document.querySelectorAll('[data-lang-choice]').forEach(b => b.addEventListener('click', () => {
  settings.lang = b.dataset.langChoice;
  saveSettings();
  applySettings();
  disarmReset();
}));

// Reset progres: butuh 3 klik berturut-turut; jeda lebih dari 3 detik membatalkan hitungan
const RESET_CLICKS = 3;
const resetBtn = $('reset');
let resetTimer, resetCount = 0;
function disarmReset() {
  clearTimeout(resetTimer);
  resetCount = 0;
  resetBtn.classList.remove('confirm');
  resetBtn.textContent = t('reset');
}
resetBtn.addEventListener('click', () => {
  clearTimeout(resetTimer);
  if (++resetCount < RESET_CLICKS) {
    resetBtn.classList.add('confirm');
    resetBtn.textContent = t('resetLeft')(RESET_CLICKS - resetCount);
    resetTimer = setTimeout(disarmReset, 3000);
    return;
  }
  disarmReset();
  Object.assign(state, freshState());
  save();
  render();
  renderTools();
  renderNav();
  renderAnvil();
  renderHouse();
  renderMarket();
  renderKepeng();
  showPage(location.hash.slice(1));
});

applySettings();
showPage(location.hash.slice(1));

setInterval(save, 5000);
document.addEventListener('visibilitychange', save);
window.addEventListener('pagehide', save);
