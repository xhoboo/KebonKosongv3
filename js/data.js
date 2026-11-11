// Data game: teks, item, sumber daya, alat. Hanya data dan rumus, tanpa state atau DOM.

const TEXT = {
  id: {
    farm: 'Kebun', forest: 'Hutan', cave: 'Goa', river: 'Sungai', lake: 'Danau', sea: 'Laut', kitchen: 'Dapur', adventure: 'Petualangan', house: 'Rumah', market: 'Pasar', anvil: 'Anvil', settings: 'Pengaturan',
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
    advLocked: 'Butuh senjata (tempa di Anvil)', unlockedAdv: 'Petualangan terbuka!', edgeForest: 'Hutan Tepi',
    kris: 'Keris', machete: 'Golok', spear: 'Tombak', leatherVest: 'Rompi Kulit',
    chicken: 'Ayam Hutan', boar: 'Babi Hutan', python: 'Ular Sanca',
    feather: 'Bulu Ayam', boarHide: 'Kulit Babi Hutan', tusk: 'Taring Babi', pythonScale: 'Sisik Ular',
    catGear: 'Perlengkapan', catLoot: 'Bahan Monster', melee: 'Jarak Dekat', armorSkill: 'Armor',
    weapon: 'Senjata', armor: 'Armor', none: 'Kosong', unequip: 'Lepas',
    attack: 'Serangan', interval: 'Interval', defense: 'Pertahanan', hp: 'HP', winChance: 'Peluang menang',
    bag: 'Tas', bagSlots: (u, c) => `${u} / ${c} slot`, pack: 'Bawa dari rumah', packHint: 'Hanya masakan yang bisa dibawa.',
    mahogany: 'Pohon Mahoni', ulin: 'Pohon Ulin', iron: 'Batu Besi', gold: 'Batu Emas',
    mahoganyWood: 'Kayu Mahoni', ulinWood: 'Kayu Ulin', ironOre: 'Bijih Besi', goldOre: 'Bijih Emas',
    axeCopper: 'Kapak Tembaga', axeIron: 'Kapak Besi', pickCopper: 'Beliung Tembaga', pickIron: 'Beliung Besi', rodIron: 'Joran Besi',
    lakeFishing: 'Memancing', seaFishing: 'Memancing',
    carp: 'Ikan Mas', pangasius: 'Ikan Patin', giantSnakehead: 'Ikan Toman', eel: 'Ikan Sidat',
    mackerel: 'Ikan Kembung', tuna: 'Ikan Tongkol', snapper: 'Ikan Kakap', grouper: 'Ikan Kerapu',
    lakeLocked: 'Butuh Joran Lentur (tempa di Anvil)', unlockedLake: 'Danau terbuka!',
    seaLocked: 'Butuh Joran Besi (tempa di Anvil)', unlockedSea: 'Laut terbuka!',
    grilledCarp: 'Ikan Mas Bakar', friedMackerel: 'Kembung Goreng', gulaiPatin: 'Gulai Patin', grilledSnapper: 'Kakap Bakar', grouperSoup: 'Sup Kerapu', honey: 'Madu Hutan',
    ironKris: 'Keris Besi', ironMachete: 'Golok Besi', ironSpear: 'Tombak Besi', scaleVest: 'Rompi Sisik',
    goldKris: 'Keris Luk Emas', ulinMachete: 'Golok Ulin', ulinSpear: 'Tombak Ulin', pantherArmor: 'Zirah Macan',
    deepForest: 'Hutan Dalam', darkCave: 'Goa Gelap', riverbank: 'Tepi Sungai',
    monkey: 'Monyet Ekor Panjang', leopard: 'Macan Tutul', sunBear: 'Beruang Madu', bat: 'Kelelawar', scorpion: 'Kalajengking Raksasa',
    caveGuardian: 'Penunggu Goa', monitor: 'Biawak', crocodile: 'Buaya Muara',
    leopardPelt: 'Kulit Macan', bearClaw: 'Cakar Beruang', batWing: 'Sayap Kelelawar', venom: 'Racun Kalajengking',
    caveCore: 'Inti Goa', monitorHide: 'Kulit Biawak', crocTooth: 'Gigi Buaya',
    needMelee: lv => `Butuh Jarak Dekat Lv. ${lv}`, needArea: area => `Butuh ${area} terbuka`,
    kangkung: 'Kangkung', chili: 'Cabai', cotton: 'Kapas', corn: 'Jagung', banana: 'Pisang', mango: 'Mangga', durian: 'Durian',
    seedOf: name => `Benih ${name}`, catSeed: 'Benih', catCrop: 'Sayur & Buah',
    stirFriedKangkung: 'Tumis Kangkung', grilledCorn: 'Jagung Bakar', friedBanana: 'Pisang Goreng', mangoRujak: 'Rujak Mangga',
    rodFlex: 'Joran Lentur', farming: 'Berkebun', plots: (u, c) => `${u} / ${c} petak terisi`,
    buySlot: (n, max) => `Beli petak ke-${n} (maks ${max})`, plantAll: 'Tanam semua', harvestAll: 'Panen semua',
    chooseSeed: 'Pilih benih untuk ditanam', noSeeds: 'Belum punya benih. Beli di Pasar.', ready: 'Siap panen', wilted: 'Layu',
    wiltsIn: d => `layu dalam ${d}`, needFarm: lv => `Butuh Berkebun Lv. ${lv}`, grows: d => `Tumbuh ${d}`,
    buySeeds: 'Beli benih', buy: n => `Beli ${n}`, rareSeedHint: 'Benih langka hanya didapat dari petualangan.',
    hours: 'j', minutes: 'm', days: 'h',
    qCommon: 'Biasa', qGood: 'Bagus', qGreat: 'Istimewa', qLegend: 'Pusaka',
    trSharp: 'Tajam', trLight: 'Ringan', trLucky: 'Beruntung', trSturdy: 'Kokoh', trVital: 'Perkasa',
    trSharpDesc: '+15% serangan', trLightDesc: '−15% interval', trLuckyDesc: '+25% peluang loot musuh',
    trSturdyDesc: '+15% pertahanan', trVitalDesc: '+20% HP armor',
    smithing: 'Menempa', qualityOdds: 'Peluang kualitas', smithXp: n => `+${n} Exp Menempa`,
    all: 'Semua', store: 'Simpan', discard: 'Buang', storeAll: 'Simpan semua', bagEmpty: 'Tas kosong.', noFood: 'Belum ada masakan di rumah.',
    needWeapon: 'Pakai senjata dulu', busyAdv: 'Sedang berpetualang', journal: 'Jurnal', journalEmpty: 'Belum ada catatan.',
    advSummary: (w, l, k) => `Petualangan ini: ${w} menang, ${l} kalah, ${k} Kepeng`,
    jStart: area => `Berangkat ke ${area}`, jStop: 'Pulang ke rumah', jHome: 'HP habis, pulang ke rumah',
    jWin: (e, loot) => `Mengalahkan ${e}` + (loot ? `, dapat ${loot}` : ''), jLose: (e, d) => `Kalah dari ${e}, −${d} HP`,
    jFind: loot => `Menemukan ${loot}`, jEat: (f, h) => `Makan ${f}, +${h} HP`, jBagFull: item => `${item} ditinggal, tas penuh`,
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
    farm: 'Farm', forest: 'Forest', cave: 'Cave', river: 'River', lake: 'Lake', sea: 'Sea', kitchen: 'Kitchen', adventure: 'Adventure', house: 'House', market: 'Market', anvil: 'Anvil', settings: 'Settings',
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
    advLocked: 'Requires a weapon (forge at the Anvil)', unlockedAdv: 'Adventure unlocked!', edgeForest: 'Forest Edge',
    kris: 'Kris', machete: 'Machete', spear: 'Spear', leatherVest: 'Leather Vest',
    chicken: 'Junglefowl', boar: 'Wild Boar', python: 'Python',
    feather: 'Feather', boarHide: 'Boar Hide', tusk: 'Boar Tusk', pythonScale: 'Python Scale',
    catGear: 'Gear', catLoot: 'Monster Parts', melee: 'Melee', armorSkill: 'Armor',
    weapon: 'Weapon', armor: 'Armor', none: 'None', unequip: 'Unequip',
    attack: 'Attack', interval: 'Interval', defense: 'Defense', hp: 'HP', winChance: 'Win chance',
    bag: 'Bag', bagSlots: (u, c) => `${u} / ${c} slots`, pack: 'Pack from the house', packHint: 'Only food can be packed.',
    mahogany: 'Mahogany Tree', ulin: 'Ironwood Tree', iron: 'Iron Rock', gold: 'Gold Rock',
    mahoganyWood: 'Mahogany Wood', ulinWood: 'Ironwood', ironOre: 'Iron Ore', goldOre: 'Gold Ore',
    axeCopper: 'Copper Axe', axeIron: 'Iron Axe', pickCopper: 'Copper Pickaxe', pickIron: 'Iron Pickaxe', rodIron: 'Iron Rod',
    lakeFishing: 'Fishing', seaFishing: 'Fishing',
    carp: 'Carp', pangasius: 'Pangasius', giantSnakehead: 'Giant Snakehead', eel: 'Eel',
    mackerel: 'Mackerel', tuna: 'Little Tuna', snapper: 'Snapper', grouper: 'Grouper',
    lakeLocked: 'Requires Flexible Rod (forge at the Anvil)', unlockedLake: 'Lake unlocked!',
    seaLocked: 'Requires Iron Rod (forge at the Anvil)', unlockedSea: 'Sea unlocked!',
    grilledCarp: 'Grilled Carp', friedMackerel: 'Fried Mackerel', gulaiPatin: 'Pangasius Curry', grilledSnapper: 'Grilled Snapper', grouperSoup: 'Grouper Soup', honey: 'Wild Honey',
    ironKris: 'Iron Kris', ironMachete: 'Iron Machete', ironSpear: 'Iron Spear', scaleVest: 'Scale Vest',
    goldKris: 'Golden Wavy Kris', ulinMachete: 'Ironwood Machete', ulinSpear: 'Ironwood Spear', pantherArmor: 'Panther Armor',
    deepForest: 'Deep Forest', darkCave: 'Dark Cave', riverbank: 'Riverbank',
    monkey: 'Macaque', leopard: 'Leopard', sunBear: 'Sun Bear', bat: 'Bat', scorpion: 'Giant Scorpion',
    caveGuardian: 'Cave Guardian', monitor: 'Monitor Lizard', crocodile: 'Saltwater Crocodile',
    leopardPelt: 'Leopard Pelt', bearClaw: 'Bear Claw', batWing: 'Bat Wing', venom: 'Scorpion Venom',
    caveCore: 'Cave Core', monitorHide: 'Monitor Hide', crocTooth: 'Crocodile Tooth',
    needMelee: lv => `Requires Melee Lv. ${lv}`, needArea: area => `Requires ${area} unlocked`,
    kangkung: 'Water Spinach', chili: 'Chili', cotton: 'Cotton', corn: 'Corn', banana: 'Banana', mango: 'Mango', durian: 'Durian',
    seedOf: name => `${name} Seed`, catSeed: 'Seeds', catCrop: 'Crops',
    stirFriedKangkung: 'Stir-fried Spinach', grilledCorn: 'Grilled Corn', friedBanana: 'Banana Fritters', mangoRujak: 'Mango Rujak',
    rodFlex: 'Flexible Rod', farming: 'Farming', plots: (u, c) => `${u} / ${c} plots in use`,
    buySlot: (n, max) => `Buy plot #${n} (max ${max})`, plantAll: 'Plant all', harvestAll: 'Harvest all',
    chooseSeed: 'Choose a seed to plant', noSeeds: 'No seeds yet. Buy some at the Market.', ready: 'Ready', wilted: 'Wilted',
    wiltsIn: d => `wilts in ${d}`, needFarm: lv => `Requires Farming Lv. ${lv}`, grows: d => `Grows in ${d}`,
    buySeeds: 'Buy seeds', buy: n => `Buy ${n}`, rareSeedHint: 'Rare seeds only come from adventures.',
    hours: 'h', minutes: 'm', days: 'd',
    qCommon: 'Common', qGood: 'Fine', qGreat: 'Superior', qLegend: 'Heirloom',
    trSharp: 'Sharp', trLight: 'Light', trLucky: 'Lucky', trSturdy: 'Sturdy', trVital: 'Vigorous',
    trSharpDesc: '+15% attack', trLightDesc: '−15% interval', trLuckyDesc: '+25% enemy loot chance',
    trSturdyDesc: '+15% defense', trVitalDesc: '+20% armor HP',
    smithing: 'Smithing', qualityOdds: 'Quality odds', smithXp: n => `+${n} Smithing Exp`,
    all: 'All', store: 'Store', discard: 'Discard', storeAll: 'Store all', bagEmpty: 'The bag is empty.', noFood: 'No food in the house yet.',
    needWeapon: 'Equip a weapon first', busyAdv: 'Out adventuring', journal: 'Journal', journalEmpty: 'No entries yet.',
    advSummary: (w, l, k) => `This adventure: ${w} won, ${l} lost, ${k} Kepeng`,
    jStart: area => `Set out for ${area}`, jStop: 'Returned home', jHome: 'Out of HP, returned home',
    jWin: (e, loot) => `Defeated ${e}` + (loot ? `, got ${loot}` : ''), jLose: (e, d) => `Lost to ${e}, −${d} HP`,
    jFind: loot => `Found ${loot}`, jEat: (f, h) => `Ate ${f}, +${h} HP`, jBagFull: item => `${item} left behind, bag full`,
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
// Bijih dan batu berbijih dengan warna logamnya
const oreIcon = (main, light, dark) => '<svg class="emoji" viewBox="0 0 24 24" aria-hidden="true">' +
  `<path d="M4 16 7 8l8-3 6 6-2 8-9 1Z" fill="${main}"/><path d="m7 8 8-3 6 6-7 1Z" fill="${light}"/>` +
  `<path d="m14 12 7-1-2 8Z" fill="${dark}"/></svg>`;
const rockIcon = (a, b, c) => '<svg class="emoji" viewBox="0 0 24 24" aria-hidden="true">' +
  '<path d="M2 18 5 9l7-5 7 3 3 10-6 4H7Z" fill="#8d877d"/><path d="m5 9 7-5 7 3-6 4Z" fill="#aaa397"/>' +
  `<circle cx="8.5" cy="14.5" r="1.9" fill="${a}"/><circle cx="15.5" cy="15.5" r="1.6" fill="${b}"/>` +
  `<circle cx="12.5" cy="8.5" r="1.2" fill="${c}"/></svg>`;
const IRON_ORE_ICON = oreIcon('#6f7a86', '#9aa5b1', '#4f5862');
const GOLD_ORE_ICON = oreIcon('#d4a017', '#f3cd52', '#a87b0c');
const IRON_ROCK_ICON = rockIcon('#4f5d6b', '#6f7f8f', '#3f4a55');
const GOLD_ROCK_ICON = rockIcon('#e5b318', '#f3cd52', '#c99512');
// Kayu: emoji kayu dengan warna berbeda per jenis; ikan dibedakan dengan warna
const tint = (cls, emoji) => `<span class="tint ${cls}">${emoji}</span>`;
const TEAK_WOOD_ICON = '<span class="emoji-teak">🪵</span>';
const fishIcon = cls => `<span class="emoji-fish ${cls}">🐟</span>`;
// Masakan yang dibakar/digoreng: emoji bahannya dibuat kecokelatan
const cookedIcon = emoji => `<span class="emoji-cooked">${emoji}</span>`;
const COTTON_ICON = '<svg class="emoji" viewBox="0 0 24 24" aria-hidden="true">' +
  '<path d="M12 22v-7" stroke="#8a6a3e" stroke-width="2"/><path d="m7 16 5-2 5 2-5 3Z" fill="#8a6a3e"/>' +
  '<circle cx="8" cy="10" r="4.2" fill="#f4f1ea"/><circle cx="16" cy="10" r="4.2" fill="#f4f1ea"/>' +
  '<circle cx="12" cy="7" r="4.5" fill="#fff"/><circle cx="12" cy="12" r="4" fill="#ece7dc"/></svg>';
const DURIAN_ICON = '<svg class="emoji" viewBox="0 0 24 24" aria-hidden="true">' +
  '<path d="M12 3c.6 1.2 1 1.6 2 1.6l.5 1.7 1.8-.2.2 1.8 1.7.5-.3 1.8 1.5 1-.9 1.6 1 1.5-1.6.9.3 1.8-1.8.3-.4 1.8-1.8-.3-1 1.5-1.4-1.1-1.4 1.1-1-1.5-1.8.3-.4-1.8-1.8-.3.3-1.8-1.6-.9 1-1.5-.9-1.6 1.5-1 -.3-1.8 1.7-.5.2-1.8 1.8.2.5-1.7C11 4.6 11.4 4.2 12 3Z" fill="#8fae3c"/>' +
  '<ellipse cx="12" cy="13" rx="5" ry="5.6" fill="#a9c552"/><path d="M12 3v2.5" stroke="#6b5530" stroke-width="1.6"/></svg>';
// Benih: ikon tunas dengan ikon tanamannya kecil di pojok
const seedIcon = crop => `<span class="emoji-seed">🌱<span class="seed-of">${crop}</span></span>`;

// Mata uang
const KEPENG_ICON = '🪙';

// Kategori item, sesuai urutan tampil saat Rumah disortir per kategori
const CATEGORIES = [
  { key: 'wood', name: 'catWood' },
  { key: 'stone', name: 'catStone' },
  { key: 'fish', name: 'catFish' },
  { key: 'crop', name: 'catCrop' },
  { key: 'seed', name: 'catSeed' },
  { key: 'food', name: 'catFood' },
  { key: 'gear', name: 'catGear' },
  { key: 'loot', name: 'catLoot' },
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
  { key: 'mahoganyWood', icon: tint('mahogany', '🪵'), cat: 'wood', price: 10 },
  { key: 'ulinWood', icon: tint('ulin', '🪵'), cat: 'wood', price: 18 },
  { key: 'ironOre', icon: IRON_ORE_ICON, cat: 'stone', price: 10 },
  { key: 'goldOre', icon: GOLD_ORE_ICON, cat: 'stone', price: 25 },
  { key: 'wader', icon: fishIcon('wader'), cat: 'fish', price: 3 },
  { key: 'tilapia', icon: fishIcon('tilapia'), cat: 'fish', price: 6 },
  { key: 'catfish', icon: fishIcon('catfish'), cat: 'fish', price: 10 },
  { key: 'snakehead', icon: fishIcon('snakehead'), cat: 'fish', price: 25 },
  { key: 'carp', icon: fishIcon('carp'), cat: 'fish', price: 12 },
  { key: 'pangasius', icon: fishIcon('pangasius'), cat: 'fish', price: 18 },
  { key: 'giantSnakehead', icon: fishIcon('giantSnakehead'), cat: 'fish', price: 40 },
  { key: 'eel', icon: tint('eel', '🐍'), cat: 'fish', price: 80 },
  { key: 'mackerel', icon: fishIcon('mackerel'), cat: 'fish', price: 15 },
  { key: 'tuna', icon: fishIcon('tuna'), cat: 'fish', price: 25 },
  { key: 'snapper', icon: '🐠', cat: 'fish', price: 50 },
  { key: 'grouper', icon: tint('grouper', '🐡'), cat: 'fish', price: 120 },
  // Masakan: heal = HP yang dipulihkan saat petualangan
  { key: 'leafJamu', icon: '🍵', cat: 'food', price: 6, heal: 15 },
  { key: 'grilledWader', icon: '🍢', cat: 'food', price: 6, heal: 30 },
  { key: 'grilledTilapia', icon: '🥘', cat: 'food', price: 12, heal: 50 },
  { key: 'pepesWader', icon: '🫔', cat: 'food', price: 14, heal: 80 },
  { key: 'friedCatfish', icon: '🍤', cat: 'food', price: 20, heal: 80 },
  { key: 'pindangSnakehead', icon: '🍲', cat: 'food', price: 45, heal: 150 },
  { key: 'stirFriedKangkung', icon: '🥗', cat: 'food', price: 12, heal: 45 },
  { key: 'grilledCorn', icon: cookedIcon('🌽'), cat: 'food', price: 22, heal: 60 },
  { key: 'friedBanana', icon: cookedIcon('🍌'), cat: 'food', price: 30, heal: 90 },
  { key: 'mangoRujak', icon: '🍧', cat: 'food', price: 70, heal: 160 },
  { key: 'grilledCarp', icon: cookedIcon('🐟'), cat: 'food', price: 30, heal: 100 },
  { key: 'friedMackerel', icon: cookedIcon(fishIcon('mackerel')), cat: 'food', price: 35, heal: 120 },
  { key: 'gulaiPatin', icon: '🍛', cat: 'food', price: 60, heal: 200 },
  { key: 'grilledSnapper', icon: cookedIcon('🐠'), cat: 'food', price: 90, heal: 260 },
  { key: 'grouperSoup', icon: '🥣', cat: 'food', price: 160, heal: 350 },
  { key: 'honey', icon: '🍯', cat: 'food', price: 40, heal: 120 },
  // Hasil kebun
  { key: 'kangkung', icon: '🥬', cat: 'crop', price: 2 },
  { key: 'chili', icon: '🌶️', cat: 'crop', price: 3 },
  { key: 'cotton', icon: COTTON_ICON, cat: 'crop', price: 6 },
  { key: 'corn', icon: '🌽', cat: 'crop', price: 8 },
  { key: 'banana', icon: '🍌', cat: 'crop', price: 10 },
  { key: 'mango', icon: '🥭', cat: 'crop', price: 25 },
  { key: 'durian', icon: DURIAN_ICON, cat: 'crop', price: 250 },
  // Benih (price = harga jual; harga beli di Pasar ada di CROPS)
  { key: 'kangkungSeed', icon: seedIcon('🥬'), cat: 'seed', price: 1 },
  { key: 'chiliSeed', icon: seedIcon('🌶️'), cat: 'seed', price: 2 },
  { key: 'cottonSeed', icon: seedIcon(COTTON_ICON), cat: 'seed', price: 4 },
  { key: 'cornSeed', icon: seedIcon('🌽'), cat: 'seed', price: 6 },
  { key: 'bananaSeed', icon: seedIcon('🍌'), cat: 'seed', price: 15 },
  { key: 'mangoSeed', icon: seedIcon('🥭'), cat: 'seed', price: 40 },
  { key: 'durianSeed', icon: seedIcon(DURIAN_ICON), cat: 'seed', price: 150 },
  // Perlengkapan petualangan. weapon: interval = waktu per encounter (ms), atk = serangan.
  // armor: def = pengurang damage, hp = tambahan HP maksimal.
  { key: 'kris', icon: '🗡️', cat: 'gear', price: 60, weapon: { interval: 5000, atk: 4 } },
  { key: 'machete', icon: '🔪', cat: 'gear', price: 90, weapon: { interval: 10000, atk: 8 } },
  { key: 'spear', icon: '🔱', cat: 'gear', price: 90, weapon: { interval: 15000, atk: 14 } },
  { key: 'leatherVest', icon: '🦺', cat: 'gear', price: 80, armor: { def: 25, hp: 30 } },
  { key: 'ironKris', icon: tint('iron', '🗡️'), cat: 'gear', price: 250, weapon: { interval: 5000, atk: 9 } },
  { key: 'ironMachete', icon: tint('iron', '🔪'), cat: 'gear', price: 350, weapon: { interval: 10000, atk: 18 } },
  { key: 'ironSpear', icon: tint('iron', '🔱'), cat: 'gear', price: 350, weapon: { interval: 15000, atk: 30 } },
  { key: 'scaleVest', icon: tint('scale', '🦺'), cat: 'gear', price: 300, armor: { def: 50, hp: 60 } },
  { key: 'goldKris', icon: tint('gold', '🗡️'), cat: 'gear', price: 1200, weapon: { interval: 5000, atk: 16 } },
  { key: 'ulinMachete', icon: tint('ulin', '🔪'), cat: 'gear', price: 1200, weapon: { interval: 10000, atk: 32 } },
  { key: 'ulinSpear', icon: tint('ulin', '🔱'), cat: 'gear', price: 1200, weapon: { interval: 15000, atk: 55 } },
  { key: 'pantherArmor', icon: '🥋', cat: 'gear', price: 1200, armor: { def: 90, hp: 120 } },
  // Bahan dari musuh
  { key: 'feather', icon: '🪶', cat: 'loot', price: 2 },
  { key: 'boarHide', icon: '🟫', cat: 'loot', price: 8 },
  { key: 'tusk', icon: '🦷', cat: 'loot', price: 20 },
  { key: 'pythonScale', icon: '🐍', cat: 'loot', price: 15 },
  { key: 'leopardPelt', icon: '🐆', cat: 'loot', price: 60 },
  { key: 'bearClaw', icon: '🐾', cat: 'loot', price: 50 },
  { key: 'batWing', icon: '🦇', cat: 'loot', price: 10 },
  { key: 'venom', icon: '🧪', cat: 'loot', price: 40 },
  { key: 'caveCore', icon: '💎', cat: 'loot', price: 400 },
  { key: 'monitorHide', icon: '🦎', cat: 'loot', price: 25 },
  { key: 'crocTooth', icon: '🐊', cat: 'loot', price: 120 },
];
const ITEM = Object.fromEntries(ITEMS.map(it => [it.key, it]));
const heals = Object.fromEntries(ITEMS.filter(it => it.heal).map(it => [it.key, it.heal]));

// Kualitas hasil tempa perlengkapan. Item dengan kualitas berbeda = item berbeda (slot Rumah sendiri).
// Key item: 'kris' (Biasa), 'kris@good', 'kris@great', 'kris@legend:sharp' (Pusaka + sifatnya).
// mult = pengali statistik utama (serangan, pertahanan, HP armor) dan harga jual.
// w0 / w100 = bobot peluang di skill Menempa Lv. 0 / Lv. 100 (berubah lurus di antaranya).
const QUALITIES = [
  { key: 'common', name: 'qCommon', mult: 1, price: 1, w0: 70, w100: 35 },
  { key: 'good', name: 'qGood', mult: 1.1, price: 1.5, w0: 22, w100: 40 },
  { key: 'great', name: 'qGreat', mult: 1.25, price: 2.5, w0: 7, w100: 20 },
  { key: 'legend', name: 'qLegend', mult: 1.5, price: 5, w0: 1, w100: 5 },
];
const QUALITY = Object.fromEntries(QUALITIES.map(q => [q.key, q]));
// Sifat Pusaka (satu, diundi dari sifat yang cocok dengan jenis perlengkapannya)
const TRAITS = {
  sharp: { name: 'trSharp', desc: 'trSharpDesc', slot: 'weapon', atk: 1.15 },
  light: { name: 'trLight', desc: 'trLightDesc', slot: 'weapon', interval: 0.85 },
  lucky: { name: 'trLucky', desc: 'trLuckyDesc', slot: 'any', drop: 1.25 },
  sturdy: { name: 'trSturdy', desc: 'trSturdyDesc', slot: 'armor', def: 1.15 },
  vital: { name: 'trVital', desc: 'trVitalDesc', slot: 'armor', hp: 1.2 },
};

const itemKey = (base, q = 'common', trait) => q === 'common' ? base : `${base}@${q}${trait ? ':' + trait : ''}`;
function parseKey(key) {
  const [base, rest = 'common'] = key.split('@');
  const [q, trait] = rest.split(':');
  return { base, q, trait };
}
// Data lengkap sebuah item, termasuk statistik setelah kualitas & sifat. Disimpan supaya tidak dihitung ulang.
const itemCache = {};
function itemDef(key) {
  if (itemCache[key]) return itemCache[key];
  const { base, q, trait } = parseKey(key), it = ITEM[base], qual = QUALITY[q], tr = TRAITS[trait] || {};
  const def = { ...it, key, base, q, trait, price: Math.round(it.price * qual.price) };
  if (it.weapon) def.weapon = { interval: Math.round(it.weapon.interval * (tr.interval || 1)), atk: +(it.weapon.atk * qual.mult * (tr.atk || 1)).toFixed(2) };
  if (it.armor) def.armor = { def: Math.round(it.armor.def * qual.mult * (tr.def || 1)), hp: Math.round(it.armor.hp * qual.mult * (tr.hp || 1)) };
  def.drop = tr.drop || 1;
  return itemCache[key] = def;
}
// Urutan tampil: sesuai ITEMS, lalu kualitas, lalu sifat
const ITEM_ORDER = Object.fromEntries(ITEMS.map((it, i) => [it.key, i]));
function compareKeys(a, b) {
  const pa = parseKey(a), pb = parseKey(b);
  return ITEM_ORDER[pa.base] - ITEM_ORDER[pb.base]
    || QUALITIES.indexOf(QUALITY[pa.q]) - QUALITIES.indexOf(QUALITY[pb.q])
    || (pa.trait || '').localeCompare(pb.trait || '');
}
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
      { key: 'axeCopper', double: 0.08, anvil: 2, cost: { teakWood: 400, copperOre: 400 } },
      { key: 'axeIron', double: 0.12, anvil: 3, cost: { mahoganyWood: 500, ironOre: 500 } },
    ],
  },
  pickaxe: {
    icon: '⛏️', area: 'goa', interval: 'pickInterval', doubleText: 'doubleOre',
    tiers: [
      { key: 'pickBasic', double: 0 },
      { key: 'pickShiny', double: 0.05, anvil: 1, cost: { acaciaWood: 250, stone: 250 } },
      { key: 'pickCopper', double: 0.08, anvil: 2, cost: { teakWood: 400, copperOre: 400 } },
      { key: 'pickIron', double: 0.12, anvil: 3, cost: { mahoganyWood: 500, ironOre: 500 } },
    ],
  },
  // Joran: tingkat 0 = belum punya (Sungai terkunci). Mulai tingkat 2 joran juga butuh benang dari Kebun.
  rod: {
    icon: '🎣', area: 'sungai', interval: 'rodInterval', doubleText: 'doubleFish',
    tiers: [
      { key: 'rodNone', double: 0, none: true },
      { key: 'rodBasic', double: 0, anvil: 1, cost: { teakWood: 150, copperOre: 150 } },
      { key: 'rodFlex', double: 0, anvil: 2, cost: { teakWood: 300, copperOre: 300, cotton: 40 } },
      { key: 'rodIron', double: 0, anvil: 3, cost: { mahoganyWood: 300, ironOre: 300, cotton: 80 } },
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
  cost: {
    2: { kepeng: 1000, teakWood: 200, copperOre: 200 },
    3: { kepeng: 5000, mahoganyWood: 300, ironOre: 300 },
    4: { kepeng: 20000, ulinWood: 300, goldOre: 200 },
  },
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
    4: { kepeng: 10000, mahoganyWood: 300, ironOre: 200 },
  },
};
const RECIPES = {
  leafJamu: { kitchen: 1, time: 3000, xp: 30, input: { leaf: 3, twig: 1 } },
  grilledWader: { kitchen: 1, time: 3000, xp: 30, input: { wader: 1, twig: 1 } },
  grilledTilapia: { kitchen: 2, time: 3000, xp: 30, input: { tilapia: 1, twig: 1 } },
  pepesWader: { kitchen: 2, time: 4000, xp: 40, input: { wader: 2, leaf: 2, twig: 1 } },
  friedCatfish: { kitchen: 3, time: 4000, xp: 40, input: { catfish: 1, twig: 2 } },
  pindangSnakehead: { kitchen: 3, time: 5000, xp: 50, input: { snakehead: 1, leaf: 2, twig: 2 } },
  stirFriedKangkung: { kitchen: 1, time: 3000, xp: 30, input: { kangkung: 3, chili: 1, twig: 1 } },
  grilledCorn: { kitchen: 2, time: 3000, xp: 30, input: { corn: 2, twig: 1 } },
  friedBanana: { kitchen: 2, time: 4000, xp: 40, input: { banana: 2, twig: 1 } },
  mangoRujak: { kitchen: 3, time: 4000, xp: 40, input: { mango: 2, chili: 2 } },
  grilledCarp: { kitchen: 3, time: 4000, xp: 40, input: { carp: 1, twig: 1 } },
  friedMackerel: { kitchen: 3, time: 4000, xp: 40, input: { mackerel: 1, twig: 2 } },
  gulaiPatin: { kitchen: 4, time: 5000, xp: 50, input: { pangasius: 1, chili: 2, leaf: 2, twig: 2 } },
  grilledSnapper: { kitchen: 4, time: 5000, xp: 50, input: { snapper: 1, chili: 1, twig: 2 } },
  grouperSoup: { kitchen: 4, time: 5000, xp: 50, input: { grouper: 1, kangkung: 2, twig: 2 } },
};

// Skill Menempa: exp per tempa = nilai bahan yang dipakai (jumlah × harga jual), juga saat gagal.
// Kurva exp sama dengan node. Level menggeser peluang kualitas (lihat QUALITIES).

// Perlengkapan yang ditempa di Anvil (hasilnya masuk Rumah). tier menentukan peluang dasar (FORGE_BASE),
// anvil = level Anvil minimum. Draf, disetel setelah dicoba.
const GEAR = {
  kris: { tier: 1, anvil: 1, cost: { teakWood: 40, copperOre: 80 } },
  machete: { tier: 1, anvil: 1, cost: { teakWood: 80, copperOre: 120 } },
  spear: { tier: 1, anvil: 1, cost: { teakWood: 150, copperOre: 60 } },
  leatherVest: { tier: 1, anvil: 1, cost: { boarHide: 10, feather: 15, copperOre: 20 } },
  ironKris: { tier: 2, anvil: 3, cost: { mahoganyWood: 60, ironOre: 120 } },
  ironMachete: { tier: 2, anvil: 3, cost: { mahoganyWood: 100, ironOre: 160 } },
  ironSpear: { tier: 2, anvil: 3, cost: { mahoganyWood: 180, ironOre: 80, tusk: 3 } },
  scaleVest: { tier: 2, anvil: 3, cost: { pythonScale: 20, ironOre: 40, cotton: 20 } },
  goldKris: { tier: 3, anvil: 4, cost: { ulinWood: 40, goldOre: 60, crocTooth: 3 } },
  ulinMachete: { tier: 3, anvil: 4, cost: { ulinWood: 120, goldOre: 30, venom: 5 } },
  ulinSpear: { tier: 3, anvil: 4, cost: { ulinWood: 200, goldOre: 20, caveCore: 1 } },
  pantherArmor: { tier: 3, anvil: 4, cost: { leopardPelt: 10, bearClaw: 5, ironOre: 80, goldOre: 10 } },
};

// Petualangan: kegiatan idle. Tiap interval senjata terjadi satu encounter yang diundi dari events.
// Lawan musuh: peluang menang = A² / (A² + P²), A = serangan pemain, P = kekuatan musuh.
// Menang → exp Jarak Dekat + loot ke tas. Kalah → HP berkurang (dikurangi pertahanan) + exp Armor.
// HP ≤ 50% → makan otomatis dari tas. HP habis → pulang (loot di tas tetap aman).
// Tas penuh tidak membuat pulang: loot jenis baru ditinggal dan dicatat di jurnal.
const ADV = {
  baseHp: 100, hpPerArmorLv: 2, atkPerMeleeLv: 0.02, defPerArmorLv: 1, eatBelow: 0.5, journalMax: 80,
};
const ENEMIES = {
  // power = kekuatan, dmg = damage saat pemain kalah, xp = exp Jarak Dekat saat menang
  // drops: [item, peluang, jumlah min, jumlah maks]
  chicken: { icon: '🐓', power: 2, dmg: 4, xp: 40, drops: [['feather', 0.8, 1, 3]] },
  boar: { icon: '🐗', power: 8, dmg: 10, xp: 120, drops: [['boarHide', 0.6, 1, 1], ['tusk', 0.1, 1, 1]] },
  python: { icon: '🐍', power: 15, dmg: 20, xp: 250, drops: [['pythonScale', 0.6, 1, 2]] },
  monkey: { icon: '🐒', power: 20, dmg: 12, xp: 300, drops: [['banana', 0.5, 1, 3]] },
  leopard: { icon: '🐆', power: 35, dmg: 25, xp: 600, drops: [['leopardPelt', 0.5, 1, 1]] },
  sunBear: { icon: '🐻', power: 50, dmg: 40, xp: 1000, drops: [['bearClaw', 0.4, 1, 2], ['honey', 0.6, 1, 2]] },
  bat: { icon: '🦇', power: 15, dmg: 8, xp: 200, drops: [['batWing', 0.7, 1, 2]] },
  scorpion: { icon: '🦂', power: 30, dmg: 22, xp: 500, drops: [['venom', 0.5, 1, 1]] },
  caveGuardian: { icon: '👹', power: 70, dmg: 60, xp: 2000, drops: [['caveCore', 0.3, 1, 1], ['goldOre', 0.8, 3, 8]] },
  monitor: { icon: '🦎', power: 12, dmg: 12, xp: 200, drops: [['monitorHide', 0.6, 1, 1]] },
  crocodile: { icon: '🐊', power: 40, dmg: 50, xp: 900, drops: [['crocTooth', 0.35, 1, 2]] },
};
const ADVENTURES = {
  edgeForest: {
    icon: '🌳',
    // bobot: musuh, atau temuan (item dengan jumlah, atau Kepeng)
    events: [
      { w: 45, enemy: 'chicken' },
      { w: 25, enemy: 'boar' },
      { w: 8, enemy: 'python' },
      { w: 8, find: 'twig', min: 1, max: 3 },
      { w: 6, find: 'leaf', min: 1, max: 3 },
      { w: 8, kepeng: [5, 20] },
      // Benih langka: hanya dari petualangan
      { w: 2, find: 'bananaSeed', min: 1, max: 2 },
      { w: 1, find: 'mangoSeed', min: 1, max: 1 },
      { w: 0.3, find: 'durianSeed', min: 1, max: 1 },
    ],
  },
  // Kedalaman lanjutan: req = syarat (level Jarak Dekat, area yang harus sudah terbuka)
  deepForest: {
    icon: '🌲', req: { melee: 20 },
    events: [
      { w: 40, enemy: 'monkey' },
      { w: 25, enemy: 'leopard' },
      { w: 12, enemy: 'sunBear' },
      { w: 8, find: 'twig', min: 2, max: 5 },
      { w: 8, kepeng: [20, 60] },
      { w: 4, find: 'bananaSeed', min: 1, max: 3 },
      { w: 2, find: 'mangoSeed', min: 1, max: 2 },
      { w: 0.8, find: 'durianSeed', min: 1, max: 1 },
    ],
  },
  riverbank: {
    icon: '🏞️', req: { melee: 15, area: 'sungai' },
    events: [
      { w: 45, enemy: 'monitor' },
      { w: 15, enemy: 'crocodile' },
      { w: 15, find: 'wader', min: 1, max: 3 },
      // Peti karam: Kepeng besar
      { w: 6, kepeng: [50, 200] },
      { w: 4, find: 'eel', min: 1, max: 1 },
    ],
  },
  darkCave: {
    icon: '🕳️', req: { melee: 35, area: 'goa' },
    events: [
      { w: 40, enemy: 'bat' },
      { w: 30, enemy: 'scorpion' },
      { w: 6, enemy: 'caveGuardian' },
      { w: 10, find: 'ironOre', min: 3, max: 8 },
      { w: 6, find: 'goldOre', min: 1, max: 3 },
      { w: 8, kepeng: [40, 120] },
    ],
  },
};
// Tas: jumlah item berbeda yang bisa dibawa (seperti Rumah). Draf.
const BAG = { base: 5, perLevel: 2, maxLevel: 5, cost: level => ({ kepeng: 300 * 2 ** level, boarHide: 5 * (level + 1) }) };

// Kebun: tanaman tumbuh paralel dengan kegiatan lain, memakai jam dunia nyata (tidak dibatasi 24 jam offline).
// Matang setelah grow, lalu layu kalau tidak dipanen dalam FARM.wilt. Petak: 2 gratis, sisanya dibeli dengan
// Kepeng (makin mahal) sampai FARM.maxSlots. Skill Berkebun: exp tiap panen, membuka tanaman, dan memberi
// peluang +1 hasil (level / 100). Benih biasa dibeli di Pasar (shop = harga), benih langka (shop: 0) dari petualangan.
const HOUR = 60 * 60 * 1000;
const FARM = { freeSlots: 2, maxSlots: 100, wilt: 24 * HOUR, slotCost: n => Math.round(50 * 1.07 ** (n - 3)) };
const CROPS = {
  kangkung: { seed: 'kangkungSeed', grow: 1 * HOUR, level: 0, yield: [3, 5], xp: 60, shop: 5 },
  chili: { seed: 'chiliSeed', grow: 2 * HOUR, level: 5, yield: [4, 8], xp: 120, shop: 10 },
  cotton: { seed: 'cottonSeed', grow: 3 * HOUR, level: 10, yield: [2, 4], xp: 180, shop: 20 },
  corn: { seed: 'cornSeed', grow: 4 * HOUR, level: 20, yield: [3, 5], xp: 240, shop: 30 },
  banana: { seed: 'bananaSeed', grow: 8 * HOUR, level: 15, yield: [4, 8], xp: 480, shop: 0 },
  mango: { seed: 'mangoSeed', grow: 24 * HOUR, level: 30, yield: [5, 10], xp: 1400, shop: 0 },
  durian: { seed: 'durianSeed', grow: 5 * 24 * HOUR, level: 50, yield: [1, 3], xp: 6000, shop: 0 },
};
const SEED_CROP = Object.fromEntries(Object.entries(CROPS).map(([k, c]) => [c.seed, k]));

// Area yang terkunci di awal; unlock(state) → true kalau syaratnya terpenuhi
const AREA_UNLOCKS = {
  goa: { done: 'unlockedCave', unlock: s => s.nodes.acacia.level >= 10 },
  sungai: { done: 'unlockedRiver', unlock: s => s.tools.rod.tier >= 1 },
  danau: { done: 'unlockedLake', unlock: s => s.tools.rod.tier >= 2 },
  laut: { done: 'unlockedSea', unlock: s => s.tools.rod.tier >= 3 },
  petualangan: { done: 'unlockedAdv', unlock: s => !!s.equip.weapon || ITEMS.some(it => it.weapon && s.items[it.key] >= 1) },
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

// Pohon: kayu naik lurus dari 40% di level 0 ke 90% di level 100; sisanya Ranting & Daun sama rata,
// jadi Ranting & Daun (bahan bakar dan bahan Dapur) tidak pernah hilang: 30% → 5% masing-masing.
const treeDrops = (wood, p) => { const main = 0.4 + 0.5 * p; return [[wood, main], ['twig', (1 - main) / 2], ['leaf', (1 - main) / 2]]; };

// Sumber daya yang bisa dikerjakan. drops(p, tier) → [item, peluang]; p = level / 100, tier = tingkat alat.
// Batu/bijih: item utama naik lurus dari peluang awal ke 100% di level 100; sisanya dibagi dengan rasio tetap.
// tool + tier = alat yang dipakai dan tingkat minimumnya (di bawah itu node terkunci).
// main = item yang bisa jadi ganda karena alat. time naik per tingkat, xp ikut naik supaya exp per detik tetap.
const NODES = {
  acacia: {
    area: 'hutan', icon: '🌳', time: 2000, xp: 20, tool: 'axe', tier: 0, main: 'acaciaWood',
    drops: p => treeDrops('acaciaWood', p),
  },
  teak: {
    area: 'hutan', icon: '🌲', time: 3000, xp: 30, tool: 'axe', tier: 1, main: 'teakWood',
    drops: p => treeDrops('teakWood', p),
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
  mahogany: {
    area: 'hutan', icon: tint('mahogany', '🌳'), time: 4000, xp: 40, tool: 'axe', tier: 2, main: 'mahoganyWood',
    drops: p => treeDrops('mahoganyWood', p),
  },
  ulin: {
    area: 'hutan', icon: tint('ulin', '🌲'), time: 5000, xp: 50, tool: 'axe', tier: 3, main: 'ulinWood',
    drops: p => treeDrops('ulinWood', p),
  },
  lake: {
    area: 'danau', icon: '🎣', time: 4000, xp: 40, tool: 'rod', tier: 2, main: null, name: 'lakeFishing',
    drops: (p, tier) => fishDrops([
      ['carp', 50, 30],
      ['pangasius', 25, 35],
      ['giantSnakehead', 8, 22, true],
      ['eel', 1, 8, true],
    ], p, tier - 1),
  },
  sea: {
    area: 'laut', icon: '🎣', time: 5000, xp: 50, tool: 'rod', tier: 3, main: null, name: 'seaFishing',
    drops: (p, tier) => fishDrops([
      ['mackerel', 50, 30],
      ['tuna', 25, 35],
      ['snapper', 8, 22, true],
      ['grouper', 1, 8, true],
    ], p, tier - 2),
  },
  copper: {
    area: 'goa', icon: COPPER_ROCK_ICON, time: 3000, xp: 30, tool: 'pickaxe', tier: 1, main: 'copperOre',
    drops: p => { const main = 0.4 + 0.6 * p; return [['copperOre', main], ['stone', (1 - main) * 2 / 3], [null, (1 - main) / 3]]; },
  },
  iron: {
    area: 'goa', icon: IRON_ROCK_ICON, time: 4000, xp: 40, tool: 'pickaxe', tier: 2, main: 'ironOre',
    drops: p => { const main = 0.4 + 0.6 * p; return [['ironOre', main], ['stone', (1 - main) * 2 / 3], [null, (1 - main) / 3]]; },
  },
  gold: {
    area: 'goa', icon: GOLD_ROCK_ICON, time: 5000, xp: 50, tool: 'pickaxe', tier: 3, main: 'goldOre',
    drops: p => { const main = 0.4 + 0.6 * p; return [['goldOre', main], ['stone', (1 - main) * 2 / 3], [null, (1 - main) / 3]]; },
  },
};
