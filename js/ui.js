// Tampilan: kartu, alat, anvil, rumah, pasar, menu, pengaturan, suara, dan loop animasi.

const $ = id => document.getElementById(id);
const itemsEl = $('items'), emptyEl = $('empty');
const t = key => TEXT[settings.lang][key];
const num = (n, digits = 0) => n.toLocaleString(settings.lang === 'id' ? 'id-ID' : 'en-US', { maximumFractionDigits: digits });
let page = 'hutan';

// Buat kartu untuk tiap sumber daya
const cards = {};
for (const [key, node] of Object.entries(NODES)) {
  const el = document.createElement('button');
  el.className = 'card';
  el.dataset.node = key;
  el.innerHTML = `<span class="level"></span><span class="name" data-i18n="${key}"></span>` +
    `<span class="duration"></span><span class="icon">${node.icon}</span>` +
    `<span class="bar"><span class="fill"></span></span>`;
  document.querySelector(`.cards[data-area="${node.area}"]`).appendChild(el);
  cards[key] = { el, level: el.querySelector('.level'), duration: el.querySelector('.duration'), fill: el.querySelector('.fill'), icon: el.querySelector('.icon') };
  el.addEventListener('click', () => {
    if (!nodeOpen(key)) return;
    state.active = state.active === key ? null : key;
    state.progress = 0;
    save();
    render();
  });
}

// Popup hasil di posisi acak di dalam kartu; kalau aksinya cepat, popup menumpuk dan menyebar
// text = pesan khusus (mis. area baru terbuka) sebagai pengganti hasil aksi
function popup(key, got, text) {
  const card = cards[key];
  const el = document.createElement('span');
  el.className = text ? 'pop' : !got ? 'pop miss' : got.lost ? 'pop full' : 'pop';
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

function itemTile(it) {
  const qty = num(Math.floor(state.items[it.key]));
  const open = it.key === openItem;
  return `<li><button class="item" data-item="${it.key}" aria-expanded="${open}" aria-label="${t(it.key)}: ${qty}">` +
    `<span class="item-icon" aria-hidden="true">${it.icon}</span>` +
    `<span class="item-qty" aria-hidden="true">${qty}</span></button></li>`;
}

// Rumah: kartu kapasitas + upgrade, catatan item yang dibuang, lalu isi rumah sesuai urutan yang dipilih
const houseUpgradeBtn = $('house-upgrade');
function renderHouse() {
  const owned = ITEMS.filter(it => state.items[it.key] >= 1);
  let groups;
  if (settings.sort === 'cat') {
    groups = CATEGORIES.map(c => [t(c.name), owned.filter(it => it.cat === c.key)]).filter(([, list]) => list.length);
  } else {
    const list = [...owned];
    if (settings.sort === 'qty') list.sort((a, b) => state.items[b.key] - state.items[a.key]);
    else {
      const collator = new Intl.Collator(settings.lang);
      list.sort((a, b) => collator.compare(t(a.key), t(b.key)));
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
  $('discarded-list').innerHTML = lost.map(key => `<span>${icons[key]} ×${num(state.discarded[key])}</span>`).join('');
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
    const n = state.nodes[key], on = state.active === key;
    card.el.classList.toggle('locked', !nodeOpen(key));
    card.fill.style.width = (on ? state.progress / actionTime(key) * 100 : 0) + '%';
    card.level.textContent = t('level') + ' ' + n.level;
    card.el.style.setProperty('--lv', (n.level >= MAX_LEVEL ? 100 : n.xp / xpNeeded(n.level) * 100) + '%');
    card.el.classList.toggle('on', on);
    card.el.setAttribute('aria-pressed', on);
  }
}

// Kartu alat (kapak di Hutan, beliung di Goa), plus teks waktu & exp di kartu node
// (keduanya ikut berubah saat alat naik level atau tingkat)
for (const [tool, def] of Object.entries(TOOLS)) {
  document.querySelector(`.tool[data-tool="${tool}"]`).innerHTML =
    `<div class="tool-top"><span class="tool-icon" aria-hidden="true">${def.icon}</span><div class="tool-main">` +
    `<div class="tool-title"><span class="level"></span><span class="name"></span></div>` +
    `<span class="bar"><span class="fill"></span></span><span class="tool-xp"></span></div></div>` +
    `<dl class="stats"><div class="row-cut"><dt data-i18n="${def.interval}"></dt><dd></dd></div>` +
    `<div class="row-double"><dt data-i18n="${def.doubleText}"></dt><dd></dd></div></dl>` +
    `<span class="tool-hint" data-i18n="toolHint"></span>`;
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
    const node = NODES[key];
    card.duration.innerHTML = nodeOpen(key)
      ? num(actionTime(key) / 1000, 2) + ' ' + t('seconds') + ` · ${node.xp} Exp`
      : '🔒 ' + t('needs')(t(TOOLS[node.tool].tiers[node.tier].key));
  }
}

// Menu: area terkunci tidak bisa dibuka dan menampilkan syaratnya
function renderNav() {
  for (const area of Object.keys(AREA_UNLOCKS)) {
    const btn = document.querySelector(`.nav-item[data-page="${area}"]`);
    btn.disabled = !areaOpen(area);
    btn.querySelector('.nav-lock').hidden = areaOpen(area);
  }
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

recipesEl.innerHTML = Object.entries(TOOLS).map(([tool, def]) =>
  `<li class="recipe" data-recipe="${tool}"><span class="recipe-icon" aria-hidden="true">${def.icon}</span>` +
  `<span class="recipe-info"><span class="recipe-name"></span><span class="recipe-meta recipe-cost"></span>` +
  `<span class="recipe-meta recipe-chance"></span><span class="recipe-result" role="status"></span></span>` +
  `<button class="forge-btn" data-forge="${tool}"></button></li>`).join('');

function renderAnvil() {
  const lv = state.anvil.level, cost = ANVIL.cost[lv + 1];
  $('anvil-level').textContent = 'Lv. ' + lv;
  $('anvil-desc').textContent = t('anvilCanForge')(lv + 1);
  anvilUpgradeBtn.hidden = !cost;
  if (cost) {
    $('anvil-next').textContent = t('upgradeLv')(lv + 1);
    $('anvil-cost').innerHTML = costHtml(cost);
    anvilUpgradeBtn.disabled = !canAfford(cost);
  }
  for (const tool of Object.keys(TOOLS)) {
    const row = recipesEl.querySelector(`[data-recipe="${tool}"]`), next = nextTier(tool);
    const btn = row.querySelector('.forge-btn'), result = forgeResults[tool];
    const current = t(TOOLS[tool].tiers[state.tools[tool].tier].key);
    row.querySelector('.recipe-name').textContent = next ? current + ' → ' + t(next.key) : current;
    row.querySelector('.recipe-cost').innerHTML = next ? costHtml(next.cost) : t('topTier');
    row.querySelector('.recipe-chance').textContent = !next ? ''
      : lv < next.anvil ? t('needAnvil')(next.anvil) : t('chance')(num(forgeChance(tool) * 100));
    const res = row.querySelector('.recipe-result');
    res.textContent = result ? (result.ok ? t('forgeOk')(t(result.key)) : t('forgeFail')) : '';
    res.className = 'recipe-result' + (result ? (result.ok ? ' ok' : ' fail') : '');
    res.hidden = !result;
    btn.hidden = !next && forging !== tool;
    btn.textContent = forging === tool ? t('forging') : t('forge');
    btn.disabled = !!forging || !canForge(tool);
    row.classList.toggle('forging', forging === tool);
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
  const tool = btn.dataset.forge, result = forgeTool(tool);
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
  }, FORGE_TIME);
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
  const owned = ITEMS.filter(it => state.items[it.key] >= 1);
  const keys = owned.map(it => it.key).join();
  if (keys !== marketKeys) {
    marketKeys = keys;
    marketEl.innerHTML = owned.map(it =>
      `<li class="sell-row" data-row="${it.key}"><span class="sell-icon" aria-hidden="true">${it.icon}</span>` +
      `<span class="sell-info"><span class="sell-name"></span><span class="sell-meta"></span></span>` +
      `<button class="sell-btn" data-sell="${it.key}" data-qty="1"></button>` +
      `<button class="sell-btn" data-sell="${it.key}" data-qty="all"></button></li>`).join('');
  }
  for (const it of owned) {
    const row = marketEl.querySelector(`[data-row="${it.key}"]`);
    row.querySelector('.sell-name').textContent = t(it.key);
    row.querySelector('.sell-meta').textContent = `${num(Math.floor(state.items[it.key]))} · ${KEPENG_ICON} ${num(it.price)} ${t('each')}`;
    row.querySelector('[data-qty="1"]').textContent = t('sellOne');
    const all = row.querySelector('[data-qty="all"]'), armed = armedSell === it.key;
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
  tipEl.textContent = t(key);
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

let last = performance.now();
function loop(now) {
  const dt = Math.min(now - last, OFFLINE_CAP); // tab yang lama tersembunyi juga dibatasi 24 jam
  last = now;
  const key = state.active;
  if (key) {
    state.progress += dt;
    if (state.progress >= actionTime(key)) {
      let got;
      for (let time; state.progress >= (time = actionTime(key)); state.progress -= time) got = act(key);
      const opened = checkUnlocks();
      if (opened.length) {
        save();
        renderNav();
        if (page === NODES[key].area) popup(key, null, t(AREA_UNLOCKS[opened[0]].done));
      }
      renderTools();
      if (page === NODES[key].area) popup(key, got);
      else if (page === 'anvil') renderAnvil();
      else if (page === 'rumah') renderHouse();
      else if (page === 'pasar') renderMarket();
    }
  }
  render();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// Menu & halaman
const PAGES = ['hutan', 'goa', 'rumah', 'pasar', 'anvil', 'settings'];
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
  if (page === 'rumah') renderHouse();
  if (page === 'pasar') renderMarket();
  if (page === 'anvil') renderAnvil();
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
