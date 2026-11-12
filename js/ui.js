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

// Label tingkat alat: T1 = alat pertama. Joran tingkat 0 berarti belum punya, jadi joran pertama = T1.
const tierLabel = (tool, i) => 'T' + (TOOLS[tool].tiers[0].none ? i : i + 1);
// Ikon anvil garis (untuk petunjuk kunci) dan panah kecil
const ANVIL_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h14c0 3-2 4-4 4v3h3v3H6v-3h3v-3H7C5 11 3 9 3 7z" fill="none" stroke="#8c8c8c" stroke-width="1.6" stroke-linejoin="round"/></svg>';
const ARROW_SVG = '<svg class="arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h12m-5-5 5 5-5 5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
// Item yang bisa keluar dari sebuah node (hasil utama + sampingan), untuk baris ikon drop tanpa teks
const nodeDrops = key => NODES[key].drops(0, Math.max(1, NODES[key].tier)).map(([item]) => item).filter(Boolean);

// Syarat sebuah kegiatan yang masih terkunci: chip pendek, teks lengkap, dan (kalau ada) halaman tujuannya
function lockInfo(key) {
  if (RECIPES[key]) {
    const lv = RECIPES[key].kitchen;
    return { chip: `<span class="ci">🍳</span>LV ${lv}`, text: t('needKitchen')(lv) };
  }
  if (ADVENTURES[key]) {
    const req = ADVENTURES[key].req || {};
    if (state.mastery.melee.level < (req.melee || 0)) return { chip: `<span class="ci">⚔️</span>LV ${req.melee}`, text: t('needMelee')(req.melee) };
    return { chip: `${LOCK_SVG}${t(AREA_NAMES[req.area])}`, text: t('needArea')(t(AREA_NAMES[req.area])) };
  }
  const node = NODES[key], tool = TOOLS[node.tool], icon = tool.icon;
  return {
    chip: `<span class="ci">${icon}</span>${tierLabel(node.tool, node.tier)}`, text: t('needs')(t(tool.tiers[node.tier].key)),
    path: `${ANVIL_SVG}${ARROW_SVG}<span>${icon}</span>`, to: 'anvil', go: t('openAnvil'),
  };
}

// Buat kartu untuk tiap kegiatan: sumber daya (tebang/tambang/mancing), resep Dapur, dan petualangan
const cards = {};
for (const key of [...Object.keys(NODES), ...Object.keys(RECIPES), ...Object.keys(ADVENTURES)]) {
  const node = NODES[key] || ADVENTURES[key], recipe = RECIPES[key];
  const wrap = document.createElement('div');
  wrap.className = 'card-wrap';
  const el = document.createElement('button');
  el.className = 'card';
  el.dataset.node = key;
  el.setAttribute('aria-describedby', 'req-' + key);
  el.innerHTML = `<span class="card-head"><span class="name" data-i18n="${node && node.name || key}"></span><span class="card-tag"></span></span>` +
    `<span class="card-art"><span class="icon" aria-hidden="true">${recipe ? icons[key] : node.icon}</span><span class="lock-chip" id="req-${key}"></span></span>` +
    (recipe ? '<span class="inputs"></span>' : '') +
    `<span class="card-foot"><span class="bar"><span class="fill"></span></span><span class="card-meta"><span class="duration"></span>` +
    (NODES[key] ? `<span class="drops" aria-hidden="true">${nodeDrops(key).slice(0, 4).map(k => icons[k]).join('')}</span><span class="node-xp"><span></span></span>` : '') +
    `</span></span>`;
  const hint = document.createElement('div');
  hint.className = 'lock-hint';
  hint.hidden = true;
  wrap.append(el, hint);
  document.querySelector(`.cards[data-area="${activityArea(key)}"]`).appendChild(wrap);
  cards[key] = {
    el, hint, tag: el.querySelector('.card-tag'), name: el.querySelector('.name'), chip: el.querySelector('.lock-chip'),
    duration: el.querySelector('.duration'), inputs: el.querySelector('.inputs'),
    fill: el.querySelector('.fill'), icon: el.querySelector('.icon'), xp: el.querySelector('.node-xp span'),
  };
  el.addEventListener('click', () => {
    // Terkunci: goyang, lalu buka/tutup petunjuk jalannya
    if (!nodeOpen(key)) { replay(el, 'nope'); toggleHint(key, true); return; }
    // Resep yang bahannya kurang tidak bisa dimulai
    if (recipe && state.active !== key && !canAfford(recipe.input)) { replay(el, 'nope'); popup(key, null, t('outOfIngredients')); return; }
    if (ADVENTURES[key] && !state.equip.weapon) { replay(el, 'nope'); popup(key, null, t('needWeapon')); return; }
    setActive(state.active === key ? null : key);
    replay(el, 'sel');
    render();
    renderAdventure();
    renderActivity();
  });
  hint.addEventListener('click', e => {
    const b = e.target.closest('.hint-go');
    toggleHint(key, false);
    if (b) go(b.dataset.go);
  });
}
// Klik kartu terkunci membuka petunjuk; klik lagi menutup. Hanya satu petunjuk terbuka.
function toggleHint(key, open) {
  const { hint } = cards[key];
  if (open && !hint.hidden) open = false;
  if (open) for (const c of Object.values(cards)) c.hint.hidden = true;
  hint.hidden = !open;
  if (open) fillHint(key);
}
function fillHint(key) {
  const info = lockInfo(key);
  cards[key].hint.innerHTML = (info.path ? `<div class="hint-path">${info.path}</div>` : `<div class="hint-path">${info.chip.replace('class="ci"', '')}</div>`) +
    `<div class="hint-text">${info.text}</div>` + (info.to ? `<button class="hint-go" data-go="${info.to}">${info.go}</button>` : '');
}

// Popup hasil di posisi acak di dalam kartu; kalau aksinya cepat, popup menumpuk dan menyebar
// text = pesan khusus (mis. area baru terbuka) sebagai pengganti hasil aksi
function popup(key, got, text, cls) {
  const card = cards[key];
  const el = document.createElement('span');
  el.className = text ? 'pop' + (cls ? ' ' + cls : '') : !got ? 'pop miss' : got.lost ? 'pop full' : 'pop';
  el.innerHTML = text || (!got ? t('miss') : got.lost ? icons[got.item] + ' ' + t('houseFull') : '+' + got.qty + ' ' + icons[got.item]);
  // Chip hasil naik di area ikon kartu (mulai 6px lebih rendah, berakhir 8px lebih tinggi), jarak tepi 6px
  const box = card.el.querySelector('.card-art');
  box.appendChild(el);
  const x0 = 6, x1 = box.clientWidth - el.offsetWidth - 6;
  const y0 = 6 + 8, y1 = box.clientHeight - el.offsetHeight - 6 - 6;
  // Dari beberapa posisi acak, ambil yang paling jauh dari popup lain supaya tumpukan menyebar dan tetap terbaca
  const others = [...box.querySelectorAll('.pop')].filter(p => p !== el).map(p => [p.offsetLeft, p.offsetTop]);
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

  // Panel kapasitas: bar slot terpakai, meter bahan upgrade, tombol upgrade
  const used = usedSlots(), cap = houseCapacity(), lv = state.house.level;
  $('house-level').textContent = t('house') + ' LV ' + lv;
  $('house-fill').style.width = Math.min(100, used / cap * 100) + '%';
  $('house-fill').classList.toggle('short', used >= cap);
  $('house-slots').textContent = t('slotsUsed')(num(used), num(cap));
  houseUpgradeBtn.hidden = lv >= HOUSE.maxLevel;
  $('house-cost').hidden = lv >= HOUSE.maxLevel;
  if (lv < HOUSE.maxLevel) {
    const cost = HOUSE.cost(lv);
    setHTML($('house-cost'), matsHtml(cost));
    setHTML(houseUpgradeBtn, `<span>${t('houseUpgrade')(lv + 1, HOUSE.perLevel)}</span><span class="mono">${canAfford(cost) ? '↑' : ''}</span>`);
    houseUpgradeBtn.disabled = !canAfford(cost);
  }

  const lost = Object.keys(state.discarded);
  $('discarded').hidden = !lost.length;
  $('discarded-list').innerHTML = lost.map(key => `<span>${iconOf(key)} ×${num(state.discarded[key])}</span>`).join('');
}

houseUpgradeBtn.addEventListener('click', () => {
  if (!upgradeHouse()) { replay(houseUpgradeBtn, 'nope'); return; }
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

// Dipanggil tiap frame: hanya menulis ke DOM kalau nilainya berubah
const setText = (el, v) => { if (el.textContent !== v) el.textContent = v; };
function render() {
  for (const [key, card] of Object.entries(cards)) {
    const on = state.active === key, open = nodeOpen(key);
    card.el.classList.toggle('locked', !open);
    card.fill.style.width = (on ? Math.min(100, state.progress / actionTime(key) * 100) : 0) + '%';
    let tag;
    if (!open) tag = '';
    else if (on) tag = '● ' + t('activeTag');
    else if (RECIPES[key]) tag = '❤️ ' + heals[key]; // resep tidak punya level sendiri: HP yang dipulihkan
    else if (ADVENTURES[key]) tag = '';
    else tag = 'LV ' + state.nodes[key].level;
    setText(card.tag, tag);
    card.tag.classList.toggle('live', on);
    if (card.xp) {
      const n = state.nodes[key];
      card.xp.style.width = (n.level >= MAX_LEVEL ? 100 : n.xp / xpNeeded(n.level) * 100) + '%';
    }
    card.el.classList.toggle('on', on);
    card.el.setAttribute('aria-pressed', on);
  }
}

// Baris alat (kapak di Hutan, beliung di Goa, joran di Sungai): kotak LV alat, nama tingkat + T, exp alat.
// Level alat selalu berlabel alatnya; level pohon/batu ada di kartu node masing-masing.
for (const [tool, def] of Object.entries(TOOLS)) {
  const box = document.querySelector(`.tool[data-tool="${tool}"]`);
  box.innerHTML =
    `<div class="tool-row"><div class="lv-box" aria-hidden="true"><span>LV</span><b></b></div><div class="tool-main">` +
    `<div class="tool-title"><span class="tool-icon" aria-hidden="true">${def.icon}</span><span class="name"></span><span class="tier"></span>` +
    `<span class="tool-xp"></span></div><span class="bar"><span class="fill"></span></span></div></div>` +
    `<div class="tool-foot"><dl class="stats"><div class="row-cut"><dt data-i18n="${def.interval}"></dt><dd></dd></div>` +
    `<div class="row-double"><dt data-i18n="${def.doubleText}"></dt><dd></dd></div></dl>` +
    `<button class="tool-link" data-go="anvil"></button></div>`;
  box.querySelector('.tool-link').addEventListener('click', () => go('anvil'));
}

function renderTools() {
  for (const [tool, def] of Object.entries(TOOLS)) {
    const el = document.querySelector(`.tool[data-tool="${tool}"]`), s = state.tools[tool];
    const tier = def.tiers[s.tier], maxed = s.level >= MAX_LEVEL, next = nextTier(tool);
    el.querySelector('.lv-box b').textContent = s.level;
    el.querySelector('.name').textContent = t(tier.key);
    el.querySelector('.tier').textContent = tierLabel(tool, s.tier);
    el.querySelector('.fill').style.width = (maxed ? 100 : s.xp / toolXpNeeded(s.level) * 100) + '%';
    el.querySelector('.tool-xp').textContent = maxed ? t('max') : num(s.xp) + '/' + num(toolXpNeeded(s.level)) + ' XP';
    el.querySelector('.tool-row').title = t(tier.key) + ' LV ' + s.level + ' · ' + t('toolEffect');
    el.querySelector('.tool-row').setAttribute('aria-label', t(tier.key) + ', LV ' + s.level);
    // Baris bonus hanya tampil kalau bonusnya ada
    el.querySelector('.row-cut').hidden = !s.level;
    el.querySelector('.row-cut dd').textContent = '−' + num(TOOL_CUT * s.level * 100, 2) + '%';
    el.querySelector('.row-double').hidden = !tier.double;
    el.querySelector('.row-double dd').textContent = num(tier.double * 100) + '%';
    el.querySelector('.stats').hidden = !s.level && !tier.double;
    const link = el.querySelector('.tool-link');
    link.hidden = !next;
    if (next) link.textContent = t('forgeAt')(tierLabel(tool, s.tier + 1));
  }
  for (const [key, card] of Object.entries(cards)) {
    const node = NODES[key] || RECIPES[key], open = nodeOpen(key);
    if (!open) {
      const info = lockInfo(key);
      card.chip.innerHTML = info.chip;
      card.el.setAttribute('aria-label', t(NODES[key] && NODES[key].name || key) + ', ' + t('lockedWord'));
      card.chip.title = info.text;
      if (!card.hint.hidden) fillHint(key);
    } else {
      card.el.removeAttribute('aria-label');
      card.hint.hidden = true;
    }
    if (ADVENTURES[key]) {
      // Petualangan: musuhnya beserta peluang menang dengan senjata sekarang
      const enemies = ADVENTURES[key].events.filter(e => e.enemy).map(e => e.enemy);
      card.duration.innerHTML = open ? enemies.map(e => ENEMIES[e].icon + (state.equip.weapon ? ' ' + num(winChance(e) * 100) + '%' : '')).join(' · ') : '—';
      continue;
    }
    card.duration.textContent = open ? (actionTime(key) / 1000).toFixed(1) + 's' : '—';
    card.duration.title = open ? `${node.xp} Exp` : '';
    if (card.inputs) setHTML(card.inputs, matsHtml(node.input));
  }
  renderKitchen();
}

// Dapur: kartu level + skill Memasak + upgrade
const kitchenUpgradeBtn = $('kitchen-upgrade');
function renderKitchen() {
  const lv = state.kitchen.level, cost = KITCHEN.cost[lv + 1], c = state.cooking;
  $('kitchen-level').textContent = t('kitchen') + ' LV ' + lv;
  $('kitchen-desc').textContent = t('kitchenRecipes')(Object.values(RECIPES).filter(r => r.kitchen <= lv).length);
  skillBar('cooking', c);
  $('cook-speed-row').hidden = !c.level;
  $('cook-speed').textContent = '−' + num(COOK_CUT * c.level * 100, 2) + '%';
  kitchenUpgradeBtn.hidden = !cost;
  $('kitchen-cost').hidden = !cost;
  if (cost) {
    setHTML($('kitchen-cost'), matsHtml(cost));
    setHTML(kitchenUpgradeBtn, `<span>${t('upgradeLv')(lv + 1)}</span><span class="mono">${canAfford(cost) ? '↑' : ''}</span>`);
    kitchenUpgradeBtn.disabled = !canAfford(cost);
  }
}
kitchenUpgradeBtn.addEventListener('click', () => {
  if (!upgradeKitchen()) { replay(kitchenUpgradeBtn, 'nope'); return; }
  renderTools();
  renderKepeng();
});

// ---------- Navigasi ----------
// Ponsel: 5 tab di bawah (grup) + sub-tab per grup di atas. Desktop: sidebar teks per grup.
const PAGE_TEXT = {
  kebun: 'farm', hutan: 'forest', goa: 'cave', sungai: 'river', danau: 'lake', laut: 'sea', dapur: 'kitchen', anvil: 'anvil',
  petualangan: 'adventure', rumah: 'house', pasar: 'market', settings: 'settings',
};
const pageName = p => PAGE_TEXT[p] ? t(PAGE_TEXT[p]) : p === 'debug' ? 'Debug' : p;
// Teks syarat area terkunci (title/aria)
const LOCK_TEXT = { goa: 'caveLocked', sungai: 'riverLocked', danau: 'lakeLocked', laut: 'seaLocked', petualangan: 'advLocked' };
// Grup tab bar ponsel; urutan = urutan tab. Ikon garis khusus.
const TAB_GROUPS = [
  { key: 'gather', text: 'grpGather', pages: ['kebun', 'hutan', 'goa', 'sungai', 'danau', 'laut'],
    icon: '<path d="M12 21v-8"/><path d="M12 13c0-4 3-7 7-7 0 4-3 7-7 7z"/><path d="M12 15c0-3-2.5-5.5-6-5.5 0 3 2.5 5.5 6 5.5z"/>' },
  { key: 'craft', text: 'grpCraft', pages: ['dapur', 'anvil'], icon: '<path d="M3 7h14c0 3-2 4-4 4v3h3v4H6v-4h3v-3H7C5 11 3 9 3 7z"/>' },
  { key: 'home', text: 'grpHome', pages: ['rumah', 'settings', 'debug'], icon: '<path d="M4 11 12 4l8 7v9H4z"/><path d="M10 20v-5h4v5"/>' },
  { key: 'market', text: 'grpMarket', pages: ['pasar'], icon: '<path d="M3 9h18l-2-5H5z"/><path d="M5 9v11h14V9"/><path d="M10 20v-6h4v6"/>' },
  { key: 'combat', text: 'grpCombat', pages: ['petualangan'], icon: '<path d="M5 19 19 5"/><path d="M15 5h4v4"/><path d="M19 19 5 5"/><path d="M9 5H5v4"/>' },
];
// Grup sidebar desktop
const SIDE_GROUPS = [['grpGather', TAB_GROUPS[0].pages], ['grpCraft', ['dapur', 'anvil']], ['grpCombat', ['petualangan']], ['navOther', ['rumah', 'pasar', 'settings']]];
const groupOf = p => TAB_GROUPS.find(g => g.pages.includes(p)) || TAB_GROUPS[2];
const LOCK_SVG = '<svg class="lock-svg" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2.6"/></svg>';
const lastInGroup = {}; // halaman terakhir per grup (tab kembali ke sana)

$('drawer').innerHTML = SIDE_GROUPS.map(([text, pages]) => `<div class="nav-group" data-i18n="${text}"></div>` +
  pages.map(p => `<button class="nav-item" data-page="${p}"><span class="nav-name" data-i18n="${PAGE_TEXT[p]}"></span>` +
    `<span class="nav-meta"><span class="nav-dot live" hidden></span><span class="nav-lv"></span>${p in AREA_UNLOCKS ? LOCK_SVG : ''}</span></button>`).join('')).join('');
$('drawer').setAttribute('aria-label', 'Menu');
$('tabbar').innerHTML = TAB_GROUPS.map(g => `<button class="tab" data-tab="${g.key}">` +
  `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${g.icon}</svg>` +
  `<span data-i18n="${g.text}"></span></button>`).join('');

// Putar ulang animasi CSS pada elemen yang sama
function replay(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }

// Sub-tab grup halaman sekarang (ponsel). Disembunyikan kalau grupnya cuma satu halaman.
function renderSubtabs() {
  const g = groupOf(page), pages = g.pages.filter(p => PAGES.includes(p)), el = $('subtabs');
  el.hidden = pages.length < 2;
  el.setAttribute('aria-label', t(g.text));
  el.innerHTML = pages.map(p => {
    const open = areaOpen(p), lock = LOCK_TEXT[p] && t(LOCK_TEXT[p]);
    return `<button class="subtab" data-page="${p}"${p === page ? ' aria-current="page"' : ''}` +
      (open ? '' : ` aria-disabled="true" title="${lock}" aria-label="${pageName(p)}, ${lock}"`) +
      `><span>${pageName(p)}</span>${open ? '' : LOCK_SVG}</button>`;
  }).join('');
  const cur = el.querySelector('[aria-current]');
  // Geser hanya kalau sub-tab aktif tidak terlihat
  if (cur && !el.hidden && cur.offsetLeft + cur.offsetWidth > el.scrollLeft + el.clientWidth) el.scrollLeft = cur.offsetLeft - 8;
}

// Syarat area terkunci sebagai chip + jalan ke sana (bar petunjuk saat sub-tab/sidebar terkunci diklik)
function areaReq(area) {
  const rod = i => ({ chip: `<span class="ci">${TOOLS.rod.icon}</span>${tierLabel('rod', i)}`, to: 'anvil' });
  const req = {
    goa: { chip: `<span class="ci">${NODES.acacia.icon}</span>LV 10`, to: 'hutan' },
    sungai: rod(1), danau: rod(2), laut: rod(3),
    petualangan: { chip: '<span class="ci">⚔️</span>T1', to: 'anvil' },
  }[area];
  return { ...req, text: t(LOCK_TEXT[area]), go: req.to === 'anvil' ? t('openAnvil') : pageName(req.to) + ' →' };
}
let lockBarTimer;
function showLockBar(area) {
  const bar = $('lock-bar'), r = areaReq(area);
  bar.innerHTML = `<span class="lock-chip">${r.chip}</span><span class="hint-text"><b>${pageName(area)}</b> · ${r.text}</span>` +
    `<button class="hint-go" data-go="${r.to}">${r.go}</button>`;
  bar.hidden = false;
  replay(bar, 'pop-in');
  clearTimeout(lockBarTimer);
  lockBarTimer = setTimeout(() => { bar.hidden = true; }, 5000);
}
$('lock-bar').addEventListener('click', e => {
  const b = e.target.closest('.hint-go');
  $('lock-bar').hidden = true;
  if (b) go(b.dataset.go);
});

// Area terkunci: item sidebar nonaktif + gembok (syarat di title); tab Tarung abu-abu sampai Petualangan terbuka
function renderNav() {
  for (const area of Object.keys(AREA_UNLOCKS)) {
    const btn = document.querySelector(`.nav-item[data-page="${area}"]`), open = areaOpen(area);
    if (open) btn.removeAttribute('aria-disabled'); else btn.setAttribute('aria-disabled', 'true');
    btn.title = open ? '' : t(LOCK_TEXT[area]);
    btn.querySelector('.lock-svg').toggleAttribute('hidden', open); // SVG tidak punya properti .hidden
    btn.querySelector('.nav-lv').hidden = !open;
  }
  document.querySelectorAll('.tab').forEach(tab => {
    const g = TAB_GROUPS.find(x => x.key === tab.dataset.tab), open = g.pages.some(p => PAGES.includes(p) && areaOpen(p));
    if (open) tab.removeAttribute('aria-disabled'); else tab.setAttribute('aria-disabled', 'true');
    tab.title = open ? '' : t(LOCK_TEXT[g.pages[0]]);
    if (groupOf(page) === g) tab.setAttribute('aria-current', 'page'); else tab.removeAttribute('aria-current');
  });
  renderSubtabs();
}

// Status di sidebar: level skill tiap area (LV n) dan titik putih berkedip di kegiatan yang berjalan.
// Hanya menulis ke DOM kalau nilainya berubah karena dipanggil tiap frame.
const NAV_SKILL = {
  kebun: () => state.farm, hutan: () => state.tools.axe, goa: () => state.tools.pickaxe, sungai: () => state.tools.rod,
  dapur: () => state.cooking, anvil: () => state.smithing, petualangan: () => state.mastery.melee,
};
let navStatusKey = '';
function renderNavStatus() {
  const running = state.active ? activityArea(state.active) : null;
  const levels = Object.values(NAV_SKILL).map(s => s().level);
  const key = running + '|' + levels.join(',');
  if (key === navStatusKey) return;
  navStatusKey = key;
  Object.keys(NAV_SKILL).forEach((p, i) => {
    const el = document.querySelector(`.nav-item[data-page="${p}"] .nav-lv`);
    if (el) el.textContent = 'LV ' + levels[i];
  });
  document.querySelectorAll('.nav-item').forEach(n => {
    const dot = n.querySelector('.nav-dot');
    if (dot) dot.hidden = n.dataset.page !== running;
  });
}

function renderPageTitle() {
  $('crumb-group').textContent = t(groupOf(page).text) + ' /';
  $('page-title').textContent = pageName(page);
  document.title = pageName(page) + ' · Kebon Kosong';
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

// Anvil: skill Menempa, panel upgrade Anvil, lalu kartu resep (Alat | Senjata) dan baris NANTI
const anvilUpgradeBtn = $('anvil-upgrade'), recipesEl = $('recipes');
const FORGE_TIME = 1500; // animasi + suara sebelum hasil tempa keluar
let forging = null; // alat yang sedang ditempa
let forgingTier = null; // tingkat yang sedang ditempa + peluangnya (kartu dibekukan selama animasi)
const forgeResults = {}; // tool → { ok, key, timer } hasil terakhir yang masih ditampilkan
let anvilTab = 'tools'; // 'tools' | 'gear' (segmented control di bar atas)

// Statistik singkat perlengkapan: serangan & interval untuk senjata, pertahanan & HP untuk armor
const gearStats = key => {
  const it = itemDef(key);
  return (it.weapon ? `⚔️ ${num(it.weapon.atk, 2)} · ⏱️ ${num(it.weapon.interval / 1000, 2)} ${t('seconds')}`
    : `🛡️ ${num(it.armor.def)} · ❤️ +${num(it.armor.hp)}`) + (it.trait ? ' · ' + t(TRAITS[it.trait].desc) : '');
};

// Area asal sebuah bahan, untuk baris tujuan "Kurang 110 Batu, Goa →"
const ITEM_SOURCE = { kepeng: 'pasar' };
for (const [k, n] of Object.entries(NODES)) for (const item of nodeDrops(k)) if (!ITEM_SOURCE[item] || item === n.main) ITEM_SOURCE[item] = n.area;
for (const k of Object.keys(CROPS)) ITEM_SOURCE[k] = 'kebun';
for (const it of ITEMS) if (!ITEM_SOURCE[it.key] && it.cat === 'loot') ITEM_SOURCE[it.key] = 'petualangan';

// Ikon anvil garis untuk animasi tempa, dan 6 percikan dengan arah berbeda
const ANVIL_ART = '<span class="anvil-ic"><svg viewBox="0 0 24 16" aria-hidden="true"><path d="M2 2h16c0 3-2 4-4 4v3h3v5H6V9h3V6H6C4 6 2 4.5 2 2z" fill="none" stroke="#8c8c8c" stroke-width="1.4" stroke-linejoin="round"/></svg></span>';
const SPARKS = [[-14, -10], [12, -12], [-8, -16], [16, -4], [-16, -2], [6, -18]]
  .map(([x, y]) => `<span class="spark" style="--sx:${x}px;--sy:${y}px"></span>`).join('');
const FORGE_ART = `<span class="forge-art" aria-hidden="true">${ANVIL_ART}<span class="hammer">🔨</span>${SPARKS}</span>`;

// Meter per bahan: hijau kalau cukup, oranye kalau kurang
const matsHtml = cost => Object.entries(cost).map(([k, n]) => {
  const h = Math.floor(have(k)), ok = h >= n;
  return `<span class="mat${ok ? ' ok' : ''}" title="${k === 'kepeng' ? t('kepeng') : nameOf(k)}"><span class="mat-ic" aria-hidden="true">${k === 'kepeng' ? KEPENG_ICON : icons[k]}</span>` +
    `<span class="bar"><span class="fill${ok ? '' : ' short'}" style="width:${Math.min(100, h / n * 100)}%"></span></span>` +
    `<span class="mat-n">${num(Math.min(h, 99999))}/${num(n)}</span></span>`;
}).join('');
// Baris tujuan untuk bahan pertama yang kurang (link ke area sumbernya; gembok kalau areanya terkunci)
function goalHtml(cost) {
  const miss = Object.entries(cost).find(([k, n]) => have(k) < n);
  if (!miss) return '';
  const [k, n] = miss, area = ITEM_SOURCE[k], open = area && areaOpen(area);
  const what = k === 'kepeng' ? t('kepeng') : nameOf(k);
  return `<button class="goal" ${open ? `data-go="${area}"` : 'disabled'}><span><span aria-hidden="true">${k === 'kepeng' ? KEPENG_ICON : icons[k]}</span>` +
    `${t('shortOf')(num(Math.ceil(n - have(k))), what)}${area ? ', ' + pageName(area) : ''}</span><span class="mono">${open ? '→' : area ? LOCK_SVG : ''}</span></button>`;
}
const oddsHtml = () => {
  const odds = qualityOdds();
  return `<div class="odds-head"><span class="caps">${t('lblQuality')}</span><span class="caps">${odds.map(([, p]) => num(p * 100)).join(' · ')}</span></div>` +
    `<div class="odds-bar" role="img" aria-label="${odds.map(([q, p]) => t(QUALITY[q].name) + ' ' + num(p * 100, 1) + '%').join(', ')}">` +
    odds.map(([, p]) => `<span style="width:${p * 100}%"></span>`).join('') + '</div>';
};
function resultHtml(r) {
  if (!r) return '';
  if (!r.ok) return `<div class="forge-res fail" role="status"><span class="res-name">${t('forgeFail')}<small>${t('smithXp')(num(r.xp))}</small></span><span class="res-tag">${t('failTag')}</span></div>`;
  const q = parseKey(r.key).q, gear = !TOOLS[r.tool];
  return `<div class="forge-res${gear ? ' q-' + q : ''}" role="status"><span class="res-ic" aria-hidden="true">${gear ? iconOf(r.key) : TOOLS[r.tool].icon}</span>` +
    `<span class="res-name">${gear ? nameOf(r.key) : t(r.key)}<small>${t('smithXp')(num(r.xp))}</small></span>` +
    `<span class="res-tag"><span class="q-dot ${gear ? 'q-' + q : ''}"></span>${gear ? t(QUALITY[q].name) : t('okTag')}</span></div>`;
}

// Isi kartu dihitung per bagian; bagian hanya ditulis ulang kalau berubah, supaya animasi tempa tidak terulang
function setHTML(el, html) { if (el._h !== html) { el._h = html; el.innerHTML = html; } }
function recipeParts(key) {
  const lv = state.anvil.level, result = forgeResults[key], busy = forging === key;
  if (TOOLS[key]) {
    const def = TOOLS[key], s = state.tools[key];
    // Selama animasi kartu tetap menampilkan tingkat yang sedang ditempa (state sudah berubah saat diklik)
    const idx = busy ? forgingTier.idx : nextTier(key) ? s.tier + 1 : s.tier;
    const next = busy ? def.tiers[idx] : nextTier(key);
    if (!next && !result && !busy) return null;
    const cur = def.tiers[idx - 1] || def.tiers[0];
    // Setelah tingkat terakhir ditempa, kartunya tetap tampil sampai hasilnya hilang
    const shown = next || def.tiers[s.tier];
    if (next && lv < next.anvil && !result && !busy) return { later: def.icon, title: t(next.key) + ' · ' + t('needAnvil')(next.anvil) };
    const opens = Object.entries(NODES).filter(([, n]) => n.tool === key && n.tier === idx)
      .map(([k, n]) => `<span>${n.icon} ${n.name ? t(AREA_TEXT[n.area]) : t(k)}</span>`).join('');
    const old = cur.none || idx === 0 ? '' : `<span class="ibox old" aria-hidden="true">${def.icon}</span>${ARROW_SVG.replace('class="arrow"', 'class="r-arrow"')}`;
    return {
      ready: next && canForge(key),
      head: `${old}<span class="ibox" aria-hidden="true">${def.icon}</span><div class="r-info"><div class="r-name">${t(shown.key)}</div>` +
        (opens ? `<div class="r-sub"><span class="caps">${t('lblOpens')}</span>${opens}</div>` : '') + `</div><span class="r-tier">${tierLabel(key, idx)}</span>`,
      mats: next && !busy ? matsHtml(next.cost) : '',
      odds: '',
      act: !next && !busy ? '' : actHtml(key, busy ? forgingTier.chance : forgeChance(key), busy || canForge(key), next && next.cost),
      res: resultHtml(result),
    };
  }
  const g = GEAR[key];
  if (lv < g.anvil && !result && !busy) return { later: ITEM[key].icon, title: t(key) + ' · ' + t('needAnvil')(g.anvil) };
  const mine = k => parseKey(k).base === key;
  const owned = ownedKeys().filter(mine).reduce((n, k) => n + state.items[k], 0) + ['weapon', 'armor'].filter(s => state.equip[s] && mine(state.equip[s])).length;
  const full = usedSlots() >= houseCapacity();
  return {
    ready: canForgeGear(key),
    head: `<span class="ibox" aria-hidden="true">${ITEM[key].icon}</span><div class="r-info"><div class="r-name">${t(key)}${owned ? ` <span class="r-tier">×${num(owned)}</span>` : ''}</div>` +
      `<div class="r-sub">${gearStats(key)}</div></div><span class="r-tier">T${g.tier}</span>`,
    mats: busy ? '' : matsHtml(g.cost),
    odds: oddsHtml(),
    act: full && !busy ? `<button class="goal" data-go="rumah"><span>${t('houseFull')}</span><span class="mono">→</span></button>`
      : actHtml(key, gearChance(key), busy || canForgeGear(key), g.cost),
    res: resultHtml(result),
  };
}
function actHtml(key, chance, can, cost) {
  if (!can && cost && !canAfford(cost)) return goalHtml(cost);
  const busy = forging === key;
  return `<div class="r-act">${FORGE_ART}<button class="forge-btn" data-forge="${key}" ${forging || !can ? 'disabled' : ''}>` +
    `<span>${busy ? t('forging') : t('forge')}</span><span class="mono">${num(chance * 100)}%</span></button></div>`;
}

function renderAnvil() {
  const lv = state.anvil.level, cost = ANVIL.cost[lv + 1], sm = state.smithing, maxed = sm.level >= MAX_LEVEL;
  $('smith-lv').textContent = sm.level;
  $('smith-fill').style.width = (maxed ? 100 : sm.xp / xpNeeded(sm.level) * 100) + '%';
  $('smith-xp').textContent = maxed ? t('max') : num(sm.xp) + '/' + num(xpNeeded(sm.level)) + ' XP';
  $('anvil-level').textContent = t('anvil') + ' LV ' + lv;
  $('anvil-desc').textContent = t('anvilUpTo')('T' + (lv + 1));
  setHTML($('anvil-cost'), cost ? matsHtml(cost) : '');
  anvilUpgradeBtn.hidden = !cost;
  if (cost) {
    anvilUpgradeBtn.disabled = !canAfford(cost);
    setHTML(anvilUpgradeBtn, `<span>${t('upgradeLv')(lv + 1)}</span><span class="mono">${canAfford(cost) ? '↑' : ''}</span>`);
  }
  // Segmented Alat | Senjata di bar atas
  $('top-extra').querySelectorAll('[data-anvil-tab]').forEach(b => b.setAttribute('aria-pressed', b.dataset.anvilTab === anvilTab));

  const keys = anvilTab === 'tools' ? Object.keys(TOOLS) : Object.keys(GEAR);
  const parts = keys.map(k => [k, recipeParts(k)]).filter(([, p]) => p);
  const cardsList = parts.filter(([, p]) => !p.later), later = parts.filter(([, p]) => p.later);
  const listKey = anvilTab + '|' + cardsList.map(([k]) => k).join();
  if (recipesEl._k !== listKey) {
    recipesEl._k = listKey;
    recipesEl.innerHTML = cardsList.map(([k], i) => `<li class="recipe" data-recipe="${k}" style="--i:${i}">` +
      '<div class="r-head" data-part="head"></div><div class="r-sec mats" data-part="mats"></div><div class="r-sec" data-part="odds"></div>' +
      '<div data-part="act"></div><div class="r-sec" data-part="res"></div></li>').join('');
  }
  for (const [k, p] of cardsList) {
    const li = recipesEl.querySelector(`[data-recipe="${k}"]`);
    li.classList.toggle('ready', !!p.ready);
    li.classList.toggle('forging', forging === k);
    for (const part of ['head', 'mats', 'odds', 'act', 'res']) setHTML(li.querySelector(`[data-part="${part}"]`), p[part]);
    const act = li.querySelector('[data-part="act"]');
    act.className = act.firstElementChild && act.firstElementChild.classList.contains('goal') ? '' : 'r-sec';
    if (!p.act) act.className = '';
  }
  $('recipes-later').hidden = !later.length;
  setHTML($('recipes-later'), `<span class="caps">${t('lblLater')}</span>` + later.map(([, p]) => `<span class="ic" title="${p.title}" role="img" aria-label="${p.title}">${p.later}</span>`).join(''));
}
$('top-extra').innerHTML = '<div class="seg" role="group"><button data-anvil-tab="tools" data-i18n="tabTools"></button><button data-anvil-tab="gear" data-i18n="tabGear"></button></div>';
$('top-extra').addEventListener('click', e => {
  const b = e.target.closest('[data-anvil-tab]');
  if (!b || b.dataset.anvilTab === anvilTab) return;
  anvilTab = b.dataset.anvilTab;
  renderAnvil();
});

anvilUpgradeBtn.addEventListener('click', () => {
  if (!upgradeAnvil()) { replay(anvilUpgradeBtn, 'nope'); return; }
  renderAnvil();
  renderKepeng();
});

// Tempa: bahan langsung terpakai dan hasil langsung diundi (supaya aman kalau halaman ditutup),
// tapi baru ditampilkan setelah animasi & tiga dentang palu.
recipesEl.addEventListener('click', e => {
  const goal = e.target.closest('.goal[data-go]');
  if (goal) { go(goal.dataset.go); return; }
  const btn = e.target.closest('.forge-btn');
  if (!btn || forging) return;
  const tool = btn.dataset.forge;
  if (TOOLS[tool]) forgingTier = { idx: state.tools[tool].tier + 1, chance: forgeChance(tool) };
  const result = TOOLS[tool] ? forgeTool(tool) : forgeGear(tool);
  if (!result) return;
  result.tool = tool;
  forging = tool;
  clearTimeout(forgeResults[tool] && forgeResults[tool].timer);
  delete forgeResults[tool];
  for (let i = 0; i < 3; i++) SOUNDS.clang(i * 0.45);
  renderAnvil();
  renderKepeng();
  setTimeout(() => {
    forging = null;
    (result.ok ? SOUNDS.success : SOUNDS.fail)(0);
    result.timer = setTimeout(() => { delete forgeResults[tool]; renderAnvil(); }, result.ok && !TOOLS[tool] ? 6000 : 4000);
    forgeResults[tool] = result;
    renderAnvil();
    const row = recipesEl.querySelector(`[data-recipe="${tool}"]`);
    if (row && !result.ok) replay(row, 'nope');
    renderTools();
    renderNav();
    renderAdventure();
  }, FORGE_TIME);
});

// ---------- Petualangan ----------

// Skill dengan kotak LV: angka level, bar exp, "xp/butuh XP"
function skillBar(prefix, s) {
  const maxed = s.level >= MAX_LEVEL;
  $(prefix + '-level').textContent = s.level;
  $(prefix + '-fill').style.width = (maxed ? 100 : s.xp / xpNeeded(s.level) * 100) + '%';
  $(prefix + '-xp').textContent = maxed ? t('max') : num(s.xp) + '/' + num(xpNeeded(s.level)) + ' XP';
}
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
  $('adv-hp').textContent = num(hp) + '/' + num(max);
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
      `<div class="equip-cur">${cur ? `<span class="equip-icon">${iconOf(cur)}</span><span class="equip-name q-${parseKey(cur).q}"><b>${nameOf(cur)}</b><small>${gearStats(cur)}</small></span>` +
        `<button class="chip" data-unequip="${slot}" ${busy ? 'disabled' : ''}>${t('unequip')}</button>` : `<span class="equip-none">${t('none')}</span>`}</div>` +
      (open ? `<div class="equip-options">${options.map(k =>
        `<button class="chip q-${parseKey(k).q}" data-equip="${slot}" data-key="${k}" ${busy ? 'disabled' : ''}>${iconOf(k)} ${nameOf(k)} ×${num(state.items[k])}</button>`).join('')}</div>` : '') +
      `</div>`;
  }).join('');

  // Tas
  const bagKeys = Object.keys(state.bag.items).filter(k => state.bag.items[k] >= 1);
  $('bag-level').textContent = 'LV ' + state.bag.level;
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
// Timer petak: 01:23:45 / 23:45 di bawah sehari, lebih dari itu "4h 3j"
function fmtClock(ms) {
  if (ms >= 24 * HOUR) return fmtDur(ms);
  const sec = Math.max(0, Math.ceil(ms / 1000)), h = Math.floor(sec / 3600), m = Math.floor(sec / 60) % 60, x = sec % 60;
  const p = n => String(n).padStart(2, '0');
  return (h ? p(h) + ':' : '') + p(m) + ':' + p(x);
}

let selectedCrop = null; // benih terakhir yang dipilih (dipakai Tanam semua)
let sheetPlot = null; // petak yang sedang dipilihkan benih di sheet ponsel
let buyArmed = false, buyTimer; // beli petak butuh dua ketukan
const PLUS_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const isDesktop = () => matchMedia('(min-width: 900px)').matches;
const cropKeys = Object.keys(CROPS).sort((a, b) => CROPS[a].level - CROPS[b].level || CROPS[a].grow - CROPS[b].grow);

// Benih bisa ditanam kalau tanamannya terbuka dan benihnya ada, atau bisa dibeli langsung (benih biasa)
function seedState(k) {
  const c = CROPS[k], have = state.items[c.seed] >= 1;
  const buyable = !!c.shop && state.kepeng >= c.shop && canStore(c.seed);
  return { have, ok: cropOpen(k) && (have || buyable) };
}
// Tanam benih k di petak i; benih biasa yang belum dimiliki dibeli dulu (harga Pasar yang sama)
function plantSeed(k, i) {
  if (i == null || state.farm.plots[i] || !seedState(k).ok) return false;
  if (!(state.items[CROPS[k].seed] >= 1) && !buySeed(k, 1)) return false;
  if (!plant(i, k)) return false;
  selectedCrop = k;
  save();
  renderKepeng();
  return true;
}

function seedRows(target) {
  return cropKeys.map((k, i) => {
    const c = CROPS[k], st = seedState(k), n = state.items[c.seed] || 0, open = cropOpen(k);
    return `<button class="seed-row row-in${st.ok ? '' : ' off'}${k === selectedCrop ? ' cur' : ''}" style="--i:${i}" data-seed="${k}" data-target="${target}"` +
      ` aria-label="${nameOf(c.seed)}, ${fmtDur(c.grow)}${c.shop ? ', ' + num(c.shop) + ' ' + t('kepeng') : ''}${open ? '' : ', ' + t('needFarm')(c.level)}"${st.ok ? '' : ' aria-disabled="true"'}>` +
      `<span class="seed-ic" aria-hidden="true">${iconOf(c.seed)}</span>` +
      `<span class="seed-name">${t(k)}${n >= 1 ? `<small>×${num(n)}</small>` : ''}</span>` +
      `<span>${fmtDur(c.grow)}</span>` +
      `<span>${c.shop ? KEPENG_ICON + ' ' + num(c.shop) : '—'}</span>` +
      `<span>${open ? '' : 'LV ' + c.level}</span></button>`;
  }).join('');
}

function openSheet(i) {
  sheetPlot = i;
  $('sheet-plot').textContent = t('plotNo')(i + 1);
  $('sheet-rows').innerHTML = seedRows('sheet');
  $('seed-sheet').hidden = false;
  const first = $('sheet-rows').querySelector('.seed-row:not(.off)');
  (first || $('sheet-rows').querySelector('.seed-row')).focus({ preventScroll: true });
}
function closeSheet() {
  if ($('seed-sheet').hidden) return;
  $('seed-sheet').hidden = true;
  const plot = $('plots').querySelector(`[data-plot="${sheetPlot}"]`);
  sheetPlot = null;
  if (plot) plot.focus({ preventScroll: true });
}
$('seed-sheet').addEventListener('click', e => {
  const row = e.target.closest('.seed-row');
  if (!row) { if (!e.target.closest('.sheet')) closeSheet(); return; }
  if (row.classList.contains('off')) { replay(row, 'nope'); return; }
  const i = sheetPlot;
  if (plantSeed(row.dataset.seed, i)) { closeSheet(); renderFarm(); replay($('plots').querySelector(`[data-plot="${i}"]`), 'sel'); }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

// Tabel benih desktop: klik baris langsung menanam di petak kosong pertama
$('seed-table-rows').addEventListener('click', e => {
  const row = e.target.closest('.seed-row');
  if (!row) return;
  const i = state.farm.plots.findIndex(p => !p);
  if (row.classList.contains('off') || i < 0) { replay(row, 'nope'); return; }
  if (plantSeed(row.dataset.seed, i)) { renderFarm(); replay($('plots').querySelector(`[data-plot="${i}"]`), 'sel'); }
});

// Petak dibangun ulang hanya kalau jumlah/status/tanamannya berubah; tiap detik cukup bar, ukuran ikon, dan timer
let plotsKey = '', seedKey = '';
function renderFarm() {
  const f = state.farm, now = Date.now(), maxed = f.level >= MAX_LEVEL;
  $('farm-lv').textContent = f.level;
  $('farm-fill').style.width = (maxed ? 100 : f.xp / xpNeeded(f.level) * 100) + '%';
  $('farm-xp').textContent = maxed ? t('max') : num(f.xp) + '/' + num(xpNeeded(f.level)) + ' XP';
  $('farm-plots').textContent = num(f.plots.length) + '/' + num(FARM.maxSlots);
  const cost = nextSlotCost();

  // Benih terpilih untuk Tanam semua: yang terakhir dipakai, atau benih pertama yang dimiliki
  const owned = cropKeys.filter(k => cropOpen(k) && state.items[CROPS[k].seed] >= 1);
  if (!owned.includes(selectedCrop)) selectedCrop = owned[0] || null;
  $('farm-plant-all').innerHTML = (selectedCrop ? `<span aria-hidden="true">${iconOf(CROPS[selectedCrop].seed)}</span>` : '') + t('plantAll');
  $('farm-plant-all').disabled = !selectedCrop || !f.plots.some(p => !p);
  $('farm-harvest-all').disabled = !f.plots.some(p => ['ready', 'wilted'].includes(plotStatus(p, now)));

  const statuses = f.plots.map(p => plotStatus(p, now));
  const key = statuses.map((st, i) => st + (f.plots[i] ? f.plots[i].crop : '')).join() + '|' + (cost != null) + '|' + settings.lang;
  if (key !== plotsKey) {
    plotsKey = key;
    $('plots').innerHTML = f.plots.map((p, i) => {
      const st = statuses[i];
      const icon = st === 'empty' ? PLUS_SVG : iconOf(p.crop);
      return `<li><button class="plot ${st}" data-plot="${i}" aria-label="${t('plotNo')(i + 1)}${p ? ', ' + t(p.crop) : ''}">` +
        `<span class="plot-art"><span class="plot-icon" aria-hidden="true">${icon}</span></span>` +
        `<span class="plot-foot">${st === 'growing' ? '<span class="plot-bar"><span></span></span>' : ''}<span class="plot-time"></span></span></button></li>`;
    }).join('') + (cost == null ? '' :
      `<li><button class="plot buy" data-buy-slot="1"><span class="plot-art"><span class="plot-icon" aria-hidden="true">${LOCK_SVG}</span></span>` +
      `<span class="plot-foot"><span class="plot-time"></span></span></button></li>`);
  }
  // Isi yang berubah tiap detik
  f.plots.forEach((p, i) => {
    const el = $('plots').querySelector(`[data-plot="${i}"]`), st = statuses[i], time = el.querySelector('.plot-time');
    let label;
    if (st === 'empty') label = t('stEmpty');
    else if (st === 'growing') {
      const grow = CROPS[p.crop].grow, left = p.at + grow - now, frac = Math.min(1, Math.max(0, 1 - left / grow));
      el.querySelector('.plot-bar span').style.width = frac * 100 + '%';
      el.querySelector('.plot-icon').style.setProperty('--s', (0.45 + 0.55 * frac).toFixed(3));
      label = fmtClock(left);
    } else if (st === 'ready') {
      const left = p.at + CROPS[p.crop].grow + FARM.wilt - now;
      label = left < 6 * HOUR ? t('wiltsIn')(fmtDur(left)) : t('ready');
    } else label = t('wilted');
    setText(time, label);
  });
  const buy = $('plots').querySelector('[data-buy-slot]');
  if (buy) {
    setText(buy.querySelector('.plot-time'), buyArmed ? t('sure') : num(cost) + ' ' + t('kepeng'));
    buy.classList.toggle('armed', buyArmed);
    buy.setAttribute('aria-label', t('buySlot')(f.plots.length + 1, FARM.maxSlots) + ', ' + num(cost) + ' ' + t('kepeng'));
  }
  // Tabel benih (desktop) dibangun ulang kalau isinya berubah
  const sk = cropKeys.map(k => { const st = seedState(k); return st.ok + ':' + (state.items[CROPS[k].seed] || 0); }).join() + selectedCrop + settings.lang;
  if (sk !== seedKey) { seedKey = sk; $('seed-table-rows').innerHTML = seedRows('table'); }
}

$('page-kebun').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b || b.disabled) return;
  if (b.id === 'farm-plant-all') plantAll(selectedCrop);
  else if (b.id === 'farm-harvest-all') {
    const ready = state.farm.plots.map((p, i) => plotStatus(p) === 'ready' ? i : -1).filter(i => i >= 0);
    const got = harvestAll();
    renderFarm();
    ready.forEach(i => { const el = $('plots').querySelector(`[data-plot="${i}"]`); if (el) replay(el, 'harvest'); });
    for (const [item, qty] of Object.entries(got)) harvestPop(ready[0], `+${num(qty)} ${iconOf(item)}`);
    return;
  } else if (b.dataset.buySlot) {
    clearTimeout(buyTimer);
    if (state.kepeng < nextSlotCost()) { buyArmed = false; replay(b, 'nope'); }
    else if (!buyArmed) { buyArmed = true; buyTimer = setTimeout(() => { buyArmed = false; renderFarm(); }, 3000); }
    else { buyArmed = false; buySlot(); renderKepeng(); }
  } else if (b.dataset.plot) {
    const i = +b.dataset.plot, status = plotStatus(state.farm.plots[i]);
    if (status === 'empty') {
      replay(b, 'sel');
      if (!isDesktop()) { openSheet(i); return; }
      // Desktop: tanam benih terpilih; kalau tidak ada, arahkan ke tabel benih
      if (!selectedCrop || !plantSeed(selectedCrop, i)) { $('seed-table').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); return; }
    } else if (status === 'ready' || status === 'wilted') {
      const r = harvest(i);
      save();
      renderFarm();
      const el = $('plots').querySelector(`[data-plot="${i}"]`);
      if (r && r.item) { replay(el, 'harvest'); harvestPop(i, `+${num(r.qty)} ${iconOf(r.item)}`); }
      else if (!r) { replay(el, 'nope'); harvestPop(i, t('houseFull')); }
      return;
    } else { replay(b, 'nope'); return; }
  } else return;
  renderFarm();
});
// Chip hasil panen yang naik di atas petak
function harvestPop(i, html) {
  const el = i != null && $('plots').querySelector(`[data-plot="${i}"] .plot-art`);
  if (!el) return;
  const chip = document.createElement('span');
  chip.className = 'pop plot-pop';
  chip.innerHTML = html;
  chip.addEventListener('animationend', () => chip.remove());
  el.appendChild(chip);
}
// Petak dihitung dari jam nyata: perbarui tiap detik selama halaman Kebun terbuka
setInterval(() => { if (page === 'kebun') renderFarm(); }, 1000);

// ---------- Berikutnya: rantai loop pertama (daun → Kepeng → benih → tanaman) ----------
const NEXT_STEPS = [
  { icon: () => icons.leaf, text: 'nextLeaf', to: 'hutan' },
  { icon: () => KEPENG_ICON, text: 'nextSell', to: 'pasar' },
  { icon: () => icons.kangkungSeed, text: 'nextPlant', to: 'kebun' },
  { icon: () => icons.kangkung, text: 'nextHarvest', to: 'kebun' },
];
const CHECK_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5 9-10" fill="none" stroke="#0a0a0a" stroke-width="4" stroke-linecap="round"/></svg>';
const NEXT_ARROW = '<svg class="next-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h12m-5-5 5 5-5 5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
let nextKey = '', onboardPrev = state.onboard, onboardDoneUntil = 0;
function renderNext() {
  const ob = state.onboard;
  // "Loop pertama selesai" tampil sekali (beberapa detik) saat langkah terakhir selesai, lalu strip hilang
  if (ob === 4 && onboardPrev < 4) onboardDoneUntil = Date.now() + 6000;
  onboardPrev = ob;
  const show = ob < 4 || Date.now() < onboardDoneUntil;
  const leaf = Math.min(5, Math.floor(state.items.leaf || 0));
  const key = show + '|' + ob + '|' + (ob === 0 ? leaf : '') + '|' + settings.lang;
  if (key === nextKey) return;
  nextKey = key;
  document.querySelectorAll('.next-strip').forEach(el => {
    el.hidden = !show;
    if (!show) return;
    const step = NEXT_STEPS[ob];
    el.innerHTML = `<div class="side-head"><span class="caps" id="next-h">${t('lblNext')}</span><span class="caps">${Math.min(ob, 4)}/4</span></div>` +
      `<div class="next-chain" aria-hidden="true">${NEXT_STEPS.map((s, i) =>
        `<span class="next-step ${i < ob ? 'done' : i === ob ? 'cur' : 'todo'}"><span class="ni">${s.icon()}</span>${i < ob ? `<span class="next-check">${CHECK_SVG}</span>` : ''}</span>` +
        (i < 3 ? NEXT_ARROW : '')).join('')}</div>` +
      (step ? `<button class="next-text" data-go="${step.to}"><span>${t(step.text)}</span><span class="mono">${ob === 0 ? leaf + '/5' : '→'}</span></button>`
        : `<div class="next-text"><span>${t('nextDone')}</span><span class="mono">✓</span></div>`);
    el.setAttribute('aria-label', t('lblNext') + ': ' + (step ? t(step.text) : t('nextDone')));
  });
}
document.addEventListener('click', e => {
  const b = e.target.closest('.next-text[data-go]');
  if (b) go(b.dataset.go);
});

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
  // Tema hanya gelap monokrom
  const root = document.documentElement;
  root.dataset.theme = 'dark';
  root.lang = settings.lang;
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  renderTools();
  renderNav();
  renderAnvil();
  document.querySelectorAll('[data-sound-choice]').forEach(b => b.setAttribute('aria-pressed', (b.dataset.soundChoice === 'on') === settings.sound));
  document.querySelectorAll('[data-lang-choice]').forEach(b => b.setAttribute('aria-pressed', b.dataset.langChoice === settings.lang));
  renderHouse();
  renderMarket();
  renderKepeng();
  renderAdventure();
  renderFarm();
  renderPageTitle();
}

// Counter di bar atas: Kepeng, dan item utama kegiatan yang sedang berjalan
const kepengEl = $('kepeng'), counterEl = $('main-counter');
kepengEl.innerHTML = `<span class="counter-icon" aria-hidden="true">${KEPENG_ICON}</span><span></span>`;
counterEl.innerHTML = '<span class="counter-icon" aria-hidden="true"></span><span></span>';
let kepengShown = null;
function renderKepeng() {
  if (kepengShown !== null && state.kepeng > kepengShown) replay(kepengEl.firstChild, 'bump');
  kepengShown = state.kepeng;
  kepengEl.lastChild.textContent = num(state.kepeng);
  kepengEl.setAttribute('aria-label', t('kepeng') + ', ' + num(state.kepeng));
}
// Item utama sebuah kegiatan: kayu/batu dari node, masakan dari resep; memancing & petualangan tidak punya
const mainItem = key => key && (RECIPES[key] ? key : NODES[key] ? NODES[key].main : null);
let counterShown = { key: null, n: 0 };
function renderCounter() {
  const key = page === 'anvil' ? null : mainItem(state.active);
  counterEl.hidden = !key;
  if (!key) { counterShown.key = null; return; }
  const n = Math.floor(state.items[key] || 0);
  if (counterShown.key === key && counterShown.n === n) return;
  if (counterShown.key !== key) counterEl.firstChild.innerHTML = iconOf(key);
  else if (n > counterShown.n) replay(counterEl.firstChild, 'bump');
  counterShown = { key, n };
  counterEl.lastChild.textContent = num(n);
  counterEl.setAttribute('aria-label', nameOf(key) + ', ' + num(n));
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
  // Nama berwarna tier hanya di tooltip
  tipEl.innerHTML = `<span class="tip-name q-${parseKey(key).q}">${nameOf(key)}</span>` + (heals[key] ? ' <span class="tip-meta">❤️ ' + heals[key] + '</span>' : '') +
    (def.weapon || def.armor ? ' <span class="tip-meta">' + gearStats(key) + '</span>' : '');
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
  const side = e.target.closest('.side-items button');
  if (side) { go('rumah'); return; }
  const item = e.target.closest('.item');
  if (item) {
    showTip(openItem === item.dataset.item ? null : item.dataset.item);
    itemsEl.querySelector(`[data-item="${item.dataset.item}"]`).focus();
  } else if (openItem) showTip(null);
});
window.addEventListener('scroll', () => openItem && showTip(null), { passive: true });
window.addEventListener('resize', () => openItem && showTip(null));

// ---------- Aktivitas (dock ponsel, strip tablet, panel kanan desktop) ----------
// Penghitung sesi "+N kayu" hanya hidup di tampilan (tidak disimpan); mulai dari 0 tiap kegiatan berganti.
const session = { key: null, n: 0 };
const AREA_TEXT = { sungai: 'river', danau: 'lake', laut: 'sea' };
function activityName(key) {
  if (ADVENTURES[key]) return t('actAdv')(t(key));
  if (RECIPES[key]) return t('actCook')(t(key));
  const node = NODES[key];
  if (node.tool === 'rod') return t('actFish')(t(AREA_TEXT[node.area]));
  return t(node.tool === 'axe' ? 'actChop' : 'actMine')(t(key));
}
// Hitung hasil satu aksi ke sesi: item utama (kayu/batu), semua ikan, atau masakan
function tally(key, got) {
  if (session.key !== key || !got || !got.item || got.lost) return;
  const node = NODES[key];
  if (RECIPES[key] || (node && (node.main ? got.item === node.main : true))) session.n += got.qty;
}
function activityMeta(key) {
  if (ADVENTURES[key]) return '❤️ ' + num(state.hp) + ' / ' + num(maxHp());
  const what = RECIPES[key] ? nameOf(key) : NODES[key].main ? nameOf(NODES[key].main) : t('catFish');
  return '+' + num(session.n) + ' ' + what.toLowerCase();
}
const activityEls = [$('dock'), $('side-activity')];
let activityKey = null;
function renderActivity() {
  const key = state.active;
  if (session.key !== key) { session.key = key; session.n = 0; }
  const text = key ? activityName(key) + '|' + activityMeta(key) + '|' + settings.lang : '';
  if (text !== activityKey) {
    const had = activityKey !== null && activityKey !== '';
    activityKey = text;
    $('dock').hidden = !key;
    document.body.classList.toggle('has-dock', !!key);
    $('side-running').hidden = !key;
    for (const el of activityEls) {
      if (!key) { el.innerHTML = `<div class="act-idle">${t('idle')}</div>`; continue; }
      if (!had || !el.querySelector('.act-row')) {
        el.innerHTML = `<div class="act-row"><span class="act-dot live" aria-hidden="true"></span>` +
          `<button class="act-main"><span class="act-name"></span><span class="act-meta"></span></button>` +
          `<button class="act-stop"><span aria-hidden="true"></span></button></div>` +
          `<div class="act-bar"><span class="fill"></span></div>`;
      }
      el.querySelector('.act-name').textContent = activityName(key);
      el.querySelector('.act-meta').textContent = activityMeta(key) + (el.id === 'side-activity' && !ADVENTURES[key] ? ' · ' + (actionTime(key) / 1000).toFixed(1) + 's' : '');
      el.querySelector('.act-stop').setAttribute('aria-label', t('stop'));
      el.querySelector('.act-main').setAttribute('aria-label', activityName(key) + ', ' + pageName(activityArea(key)));
    }
  }
  if (key) {
    const w = Math.min(100, state.progress / actionTime(key) * 100) + '%';
    for (const el of activityEls) el.querySelector('.act-bar .fill').style.width = w;
  }
}
for (const el of activityEls) el.addEventListener('click', e => {
  if (!state.active) return;
  if (e.target.closest('.act-stop')) {
    setActive(null);
    render();
    renderAdventure();
    renderActivity();
  } else if (e.target.closest('.act-main')) go(activityArea(state.active));
});

// Panel kanan desktop: isi Rumah ringkas (15 item pertama + sisanya)
let sideItemsKey = '', sideItemsAt = 0;
function renderSideItems(now) {
  if (now - sideItemsAt < 500 || innerWidth < 1280) return;
  sideItemsAt = now;
  const owned = ownedKeys(), shown = owned.length > 16 ? owned.slice(0, 15) : owned;
  const key = shown.map(k => k + ':' + Math.floor(state.items[k])).join() + '|' + owned.length + '|' + houseCapacity() + settings.lang;
  if (key === sideItemsKey) return;
  sideItemsKey = key;
  $('side-house-slots').textContent = num(usedSlots()) + '/' + num(houseCapacity());
  $('side-items').innerHTML = shown.map(k => `<li><button class="item q-${parseKey(k).q}" title="${nameOf(k)}" aria-label="${nameOf(k)}, ${num(Math.floor(state.items[k]))}">` +
    `<span class="item-icon" aria-hidden="true">${iconOf(k)}</span><span class="item-qty" aria-hidden="true">${num(Math.floor(state.items[k]))}</span></button></li>`).join('') +
    (owned.length > shown.length ? `<li><button class="more" aria-label="${t('house')}">+${num(owned.length - shown.length)}</button></li>` : '') +
    (owned.length ? '' : `<li class="note" style="grid-column:1/-1">${t('empty')}</li>`);
}

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
      for (let time; state.active && state.progress >= (time = actionTime(key)); state.progress -= time) tally(key, got = act(key));
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
  renderCounter();
  renderActivity();
  renderNext();
  renderSideItems(now);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// Menu & halaman
const PAGES = ['kebun', 'hutan', 'goa', 'sungai', 'danau', 'laut', 'dapur', 'petualangan', 'rumah', 'pasar', 'anvil', 'settings'];
// Dulu menutup drawer ponsel; tetap ada karena dipanggil mode uji
function setMenu() {}

function showPage(name) {
  if (openItem) showTip(null);
  // Tautan lama: Inventory jadi Rumah, Pohon jadi Hutan
  name = { inventory: 'rumah', pohon: 'hutan' }[name] || name;
  page = PAGES.includes(name) && areaOpen(name) ? name : 'hutan';
  lastInGroup[groupOf(page).key] = page;
  document.body.dataset.page = page;
  $('lock-bar').hidden = true;
  PAGES.forEach(p => { $('page-' + p).hidden = p !== page; });
  enterPage($('page-' + page));
  document.querySelectorAll('.nav-item').forEach(n => {
    if (n.dataset.page === page) n.setAttribute('aria-current', 'page');
    else n.removeAttribute('aria-current');
  });
  renderPageTitle();
  renderNav();
  renderCounter();
  if (page === 'rumah') renderHouse();
  if (page === 'pasar') { renderMarket(); renderSeedShop(); }
  if (page === 'anvil') renderAnvil();
  if (page === 'kebun') renderFarm();
  if (page === 'petualangan') renderAdventure();
}

// Animasi masuk halaman: container naik + isi muncul bertahap, sekali per showPage (render tiap tick tidak memutarnya lagi)
let enterTimer;
function enterPage(main) {
  document.querySelectorAll('main.entered').forEach(m => m.classList.remove('entered', 'page-in'));
  const groups = main.querySelectorAll(':scope > *, .cards, .plots, .recipes, .items, .market');
  for (const g of groups) [...g.children].forEach((el, i) => el.style.setProperty('--i', Math.min(i, 8)));
  replay(main, 'page-in');
  main.classList.add('entered');
  clearTimeout(enterTimer);
  enterTimer = setTimeout(() => main.classList.remove('entered'), 700);
  // Goyang pelan hanya kalau kartunya sedikit
  main.querySelectorAll('.cards').forEach(c => c.classList.toggle('sway', c.children.length <= 12));
}
// Class animasi sekali jalan dicabut setelah selesai, supaya animasi lain (mis. sway) bisa lanjut
const ONE_SHOT = ['bump', 'sel', 'nope', 'harvest', 'shake'];
document.addEventListener('animationend', e => { for (const c of ONE_SHOT) if (e.target.classList && e.target.classList.contains(c)) e.target.classList.remove(c); });
document.addEventListener('visibilitychange', () => document.body.classList.toggle('paused', document.hidden));

const go = p => { if (location.hash.slice(1) === p) showPage(p); else location.hash = p; };
$('drawer').addEventListener('click', e => {
  const n = e.target.closest('.nav-item');
  if (!n) return;
  if (n.getAttribute('aria-disabled')) { replay(n, 'nope'); showLockBar(n.dataset.page); return; }
  go(n.dataset.page);
});
$('subtabs').addEventListener('click', e => {
  const b = e.target.closest('.subtab');
  if (!b) return;
  if (b.getAttribute('aria-disabled')) { replay(b, 'nope'); showLockBar(b.dataset.page); return; }
  go(b.dataset.page);
});
$('tabbar').addEventListener('click', e => {
  const b = e.target.closest('.tab');
  if (!b) return;
  if (b.getAttribute('aria-disabled')) { replay(b, 'nope'); showLockBar(TAB_GROUPS.find(x => x.key === b.dataset.tab).pages[0]); return; }
  const g = TAB_GROUPS.find(x => x.key === b.dataset.tab);
  go([lastInGroup[g.key], ...g.pages].find(p => p && PAGES.includes(p) && areaOpen(p)));
});
window.addEventListener('hashchange', () => showPage(location.hash.slice(1)));

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
