// Mode uji: hanya untuk mencoba keseimbangan game, tidak terlihat oleh pemain biasa.
// Dinyalakan dengan membuka alamat #debug (diingat di localStorage), dimatikan dari halaman Debug.
// Teks sengaja hanya bahasa Indonesia karena ini alat pengembang, bukan bagian game.
(function () {
  const FLAG = 'kebon-kosong-debug';
  let on = false;
  try { on = localStorage.getItem(FLAG) === '1'; } catch {}
  if (location.hash === '#debug') {
    on = true;
    try { localStorage.setItem(FLAG, '1'); } catch {}
  }
  if (!on) return;

  // Semua tampilan digambar ulang setelah state diubah dari sini
  function refreshAll() {
    checkUnlocks();
    save();
    render(); renderTools(); renderNav(); renderAnvil(); renderHouse(); renderMarket();
    renderSeedShop(); renderKepeng(); renderAdventure(); renderFarm(); renderDebug();
  }

  // Majukan waktu: tanaman Kebun digeser mundur, kegiatan berjalan seperti offline tapi tanpa batas 24 jam
  function advance(ms) {
    state.farm.plots.forEach(p => { if (p) p.at -= ms; });
    let elapsed = ms + state.progress, at = Date.now() - ms, n = 0;
    for (let time; state.active && elapsed >= (time = actionTime(state.active)); elapsed -= time) { act(state.active, at += time); n++; }
    if (state.active) state.progress = elapsed;
    refreshAll();
    return n;
  }

  // Semua hal yang punya level, untuk diatur langsung
  const levelTargets = () => [
    ...Object.keys(NODES).map(k => [`node:${k}`, `Node · ${t(NODES[k].name || k)}${NODES[k].name ? ' (' + k + ')' : ''}`, state.nodes[k], MAX_LEVEL]),
    ...Object.keys(TOOLS).map(k => [`tool:${k}`, `Alat · ${k} (level)`, state.tools[k], MAX_LEVEL]),
    ...Object.keys(TOOLS).map(k => [`tier:${k}`, `Alat · ${k} (tingkat 0–${TOOLS[k].tiers.length - 1})`, null, TOOLS[k].tiers.length - 1]),
    ['skill:melee', 'Mastery · Jarak Dekat', state.mastery.melee, MAX_LEVEL],
    ['skill:armor', 'Mastery · Armor', state.mastery.armor, MAX_LEVEL],
    ['skill:cooking', 'Skill · Memasak', state.cooking, MAX_LEVEL],
    ['skill:smithing', 'Skill · Menempa', state.smithing, MAX_LEVEL],
    ['skill:farm', 'Skill · Berkebun', state.farm, MAX_LEVEL],
    ['bld:anvil', 'Bangunan · Anvil', state.anvil, anvilMax],
    ['bld:kitchen', 'Bangunan · Dapur', state.kitchen, kitchenMax],
    ['bld:house', 'Bangunan · Rumah', state.house, HOUSE.maxLevel],
    ['bld:bag', 'Bangunan · Tas', state.bag, BAG.maxLevel],
  ];
  function setLevel(id, value) {
    const [kind, key] = id.split(':');
    if (kind === 'tier') { state.tools[key].tier = Math.max(0, Math.min(TOOLS[key].tiers.length - 1, value)); return; }
    const target = levelTargets().find(([k]) => k === id), max = target[3];
    const s = target[2];
    s.level = Math.max(kind === 'bld' && key !== 'house' && key !== 'bag' ? 1 : 0, Math.min(max, value));
    if ('xp' in s) s.xp = 0;
  }
  const currentLevel = id => id.startsWith('tier:') ? state.tools[id.slice(5)].tier : levelTargets().find(([k]) => k === id)[2].level;

  // Halaman Debug + item menu
  const nav = document.createElement('button');
  nav.className = 'nav-item';
  nav.dataset.page = 'debug';
  nav.innerHTML = '<span>🛠️</span><span>Debug</span>';
  document.querySelector('.nav-item[data-page="settings"]').before(nav);
  nav.addEventListener('click', () => { location.hash = 'debug'; setMenu(false); });

  const main = document.createElement('main');
  main.id = 'page-debug';
  main.hidden = true;
  main.innerHTML = `
    <h2>Mode uji</h2>
    <section class="panel debug">
      <div class="panel-head"><span class="panel-title">⏩ Waktu</span><span class="panel-meta" id="dbg-speed-now"></span></div>
      <p class="panel-hint">Kecepatan berlaku selama halaman terbuka. "Majukan" menjalankan kegiatan aktif dan menumbuhkan Kebun seketika (tanpa batas 24 jam).</p>
      <div class="equip-options">${[1, 10, 100, 1000].map(n => `<button class="chip" data-speed="${n}">×${n}</button>`).join('')}</div>
      <div class="equip-options">${[[1, '+1 jam'], [8, '+8 jam'], [24, '+1 hari'], [168, '+7 hari']].map(([h, l]) => `<button class="chip" data-advance="${h}">${l}</button>`).join('')}</div>
      <p class="panel-hint" id="dbg-advance-result"></p>
    </section>
    <section class="panel debug">
      <div class="panel-head"><span class="panel-title">🎁 Sumber daya</span></div>
      <div class="equip-options">
        <button class="chip" data-kepeng="1000">+1.000 Kepeng</button>
        <button class="chip" data-kepeng="100000">+100.000 Kepeng</button>
        <button class="chip" data-items="1000">+1.000 semua bahan</button>
        <button class="chip" data-food="20">+20 semua masakan</button>
        <button class="chip" data-gear="1">+1 semua perlengkapan</button>
        <button class="chip" data-unlock="1">Buka semua area</button>
        <button class="chip" data-heal="1">HP petualangan penuh</button>
      </div>
      <p class="panel-hint">"Semua bahan" = kayu, batu/bijih, bahan alam, ikan, sayur/buah, benih, dan bahan monster. Tombol-tombol ini mengabaikan kapasitas Rumah, jadi Rumah bisa melebihi batasnya.</p>
    </section>
    <section class="panel debug">
      <div class="panel-head"><span class="panel-title">📈 Level</span></div>
      <select id="dbg-target" class="dbg-input"></select>
      <div class="dbg-row">
        <input id="dbg-level" class="dbg-input" type="number" min="0" max="100" inputmode="numeric">
        <button class="notice-btn" id="dbg-set">Atur</button>
      </div>
      <div class="equip-options">
        <button class="chip" data-all-levels="25">Semua skill Lv. 25</button>
        <button class="chip" data-all-levels="50">Semua skill Lv. 50</button>
        <button class="chip" data-all-levels="100">Semua skill Lv. 100</button>
      </div>
    </section>
    <section class="panel debug">
      <div class="panel-head"><span class="panel-title">💾 Save</span></div>
      <p class="panel-hint">Salin save untuk dikirim, atau tempel save lain lalu Muat (halaman dimuat ulang).</p>
      <textarea id="dbg-save" class="dbg-input" rows="4" spellcheck="false"></textarea>
      <div class="dbg-row">
        <button class="notice-btn" id="dbg-copy">Salin save</button>
        <button class="notice-btn" id="dbg-load">Muat save</button>
      </div>
      <p class="panel-hint" id="dbg-save-msg"></p>
    </section>
    <button class="reset-btn" id="dbg-off">Matikan mode uji</button>`;
  document.getElementById('page-settings').before(main);
  PAGES.push('debug');

  const style = document.createElement('style');
  style.textContent = `
    .panel.debug .equip-options { margin-bottom: 8px; }
    .chip.selected { background: var(--on-bg); color: var(--on-ink); }
    .dbg-input { width: 100%; padding: 8px 10px; border: 1px solid var(--line); border-radius: 8px; background: var(--bg); color: var(--ink); font: inherit; font-size: 14px; }
    textarea.dbg-input { font-family: ui-monospace, monospace; font-size: 11px; resize: vertical; }
    .dbg-row { display: flex; gap: 8px; margin: 8px 0; }
    .dbg-row .notice-btn { margin: 0; flex: none; min-height: 38px; }
    #dbg-off { margin-top: 12px; }`;
  document.head.appendChild(style);

  const $ = id => document.getElementById(id);
  function renderDebug() {
    $('dbg-speed-now').textContent = 'Sekarang ×' + timeScale;
    main.querySelectorAll('[data-speed]').forEach(b => b.classList.toggle('selected', +b.dataset.speed === timeScale));
    const sel = $('dbg-target'), cur = sel.value;
    sel.innerHTML = levelTargets().map(([id, label]) => `<option value="${id}">${label} — sekarang ${currentLevel(id)}</option>`).join('');
    if (cur) sel.value = cur;
  }

  main.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    const d = b.dataset;
    if (d.speed) timeScale = +d.speed;
    else if (d.advance) {
      const t0 = performance.now(), n = advance(+d.advance * HOUR);
      $('dbg-advance-result').textContent = `${n.toLocaleString('id-ID')} aksi dijalankan dalam ${Math.round(performance.now() - t0)} ms` +
        (state.active ? '' : ' · tidak ada kegiatan aktif (atau kegiatan berhenti)');
      return;
    } else if (d.kepeng) state.kepeng += +d.kepeng;
    else if (d.items) {
      for (const it of ITEMS) if (['wood', 'stone', 'nature', 'fish', 'crop', 'seed', 'loot'].includes(it.cat)) state.items[it.key] = (state.items[it.key] || 0) + +d.items;
    } else if (d.food) {
      for (const it of ITEMS) if (it.cat === 'food') state.items[it.key] = (state.items[it.key] || 0) + +d.food;
    } else if (d.gear) {
      for (const it of ITEMS) if (it.cat === 'gear') state.items[it.key] = (state.items[it.key] || 0) + 1;
    } else if (d.unlock) {
      for (const k of Object.keys(state.unlocked)) state.unlocked[k] = true;
    } else if (d.heal) state.hp = maxHp();
    else if (d.allLevels) {
      for (const [id, , s] of levelTargets()) if (s && id.startsWith('node:') || id.startsWith('skill:') || id.startsWith('tool:')) setLevel(id, +d.allLevels);
    } else if (b.id === 'dbg-set') {
      const v = parseInt($('dbg-level').value, 10);
      if (Number.isNaN(v)) return;
      setLevel($('dbg-target').value, v);
    } else if (b.id === 'dbg-copy') {
      const json = JSON.stringify(state);
      $('dbg-save').value = json;
      (navigator.clipboard ? navigator.clipboard.writeText(json) : Promise.reject())
        .then(() => { $('dbg-save-msg').textContent = 'Save tersalin ke clipboard.'; })
        .catch(() => { $('dbg-save').select(); $('dbg-save-msg').textContent = 'Clipboard tidak tersedia; salin manual dari kotak di atas.'; });
      return;
    } else if (b.id === 'dbg-load') {
      let saved;
      try { saved = JSON.parse($('dbg-save').value); } catch { $('dbg-save-msg').textContent = 'Bukan save yang valid.'; return; }
      if (!saved || typeof saved !== 'object' || !saved.items) { $('dbg-save-msg').textContent = 'Bukan save yang valid.'; return; }
      try { localStorage.setItem(SAVE_KEY, JSON.stringify(saved)); } catch {}
      skipSave = true;
      location.reload();
      return;
    } else if (b.id === 'dbg-off') {
      try { localStorage.removeItem(FLAG); } catch {}
      timeScale = 1;
      nav.remove();
      main.remove();
      PAGES.splice(PAGES.indexOf('debug'), 1);
      location.hash = 'hutan';
      return;
    } else return;
    refreshAll();
  });

  window.renderDebug = renderDebug;
  renderDebug();
  if (location.hash === '#debug') showPage('debug');
  window.addEventListener('hashchange', () => { if (location.hash === '#debug') renderDebug(); });
})();
