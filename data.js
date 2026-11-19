'use strict';

window.SAVE_KEY = 'kaomoji_mmorpg_3d_save_v2';

function createHybridRegistry(list) {
    list.forEach(item => {
        if (item && item.id) list[item.id] = item;
    });
    return list;
}

// =========================================================================
// 共通ユーティリティ・装備制限判定関数
// =========================================================================
window.formatBigNum = function (num) {
    const n = Math.floor(Number(num) || 0);
    if (n < 10000) return n.toLocaleString();
    if (n < 100000000) return (n / 10000).toFixed(1).replace(/\.0$/, '') + '万';
    if (n < 1000000000000) return (n / 100000000).toFixed(2).replace(/\.00$/, '') + '億';
    if (n < 10000000000000000) return (n / 1000000000000).toFixed(2).replace(/\.00$/, '') + '兆';
    return (n / 10000000000000000).toFixed(2).replace(/\.00$/, '') + '京';
};

window.canEquipWeaponForJob = function (weaponOrId, jobOrEvo) {
    const wpn = (typeof weaponOrId === 'string' && window.WEAPONS)
        ? window.WEAPONS[weaponOrId]
        : weaponOrId;
    if (!wpn) return true;

    const evo = (typeof jobOrEvo === 'string' && window.EVOLUTIONS)
        ? window.EVOLUTIONS[jobOrEvo]
        : jobOrEvo;

    if (evo && typeof evo.isMageJob === 'boolean') {
        if (evo.isMageJob) return wpn.category === 'staff';
        return wpn.category !== 'staff';
    }
    return true;
};

window.canEquipArmorForJob = function () { return true; };
window.canEquipAccessoryForJob = function () { return true; };

// =========================================================================
// 1. エリア・ワールドマップ定義（拠点＋全8冒険エリア）
// =========================================================================
window.ZONES = createHybridRegistry([
    {
        id: 'town',
        name: 'はじまりの街アルカディア',
        reqLv: 1,
        minLv: 1,
        baseThreat: 0,
        isTown: true,
        color: 0x38bdf8,
        groundColor: 0x64748b,
        skyColor: 0x7dd3fc,
        monsters: [],
        drops: [],
        desc: '冒険者たちが集い、装備を整える平和な拠点の街'
    },
    {
        id: 'meadow',
        name: 'はじまりの草原',
        reqLv: 1,
        minLv: 1,
        baseThreat: 1,
        color: 0x4ade80,
        groundColor: 0x2e7d32,
        skyColor: 0x38bdf8,
        monsters: ['slime_green', 'rabbit_horn', 'boar_wild'],
        bossId: 'boss_king_slime',
        drops: ['slime_gel', 'ancient_sap'],
        desc: '穏やかな風が吹く初心者向けの緑豊かな草原'
    },
    {
        id: 'forest',
        name: '精霊の深緑森',
        reqLv: 10,
        minLv: 10,
        baseThreat: 10,
        color: 0x10b981,
        groundColor: 0x1b4332,
        skyColor: 0x0f766e,
        monsters: ['wolf_forest', 'goblin_scout', 'treant_elder'],
        bossId: 'boss_forest_guardian',
        drops: ['ancient_sap', 'goblin_fang'],
        desc: '神秘の精霊と魔獣が棲む深い樹海'
    },
    {
        id: 'cave',
        name: '蒼水晶の地下洞窟',
        reqLv: 20,
        minLv: 20,
        baseThreat: 20,
        color: 0x06b6d4,
        groundColor: 0x1e293b,
        skyColor: 0x0f172a,
        monsters: ['bat_crystal', 'kobold_miner', 'golem_iron'],
        bossId: 'boss_crystal_dragon',
        drops: ['goblin_fang', 'ice_crystal'],
        desc: '魔力を帯びた結晶が輝く地底の迷宮'
    },
    {
        id: 'desert',
        name: '灼熱の古代砂漠',
        reqLv: 32,
        minLv: 32,
        baseThreat: 32,
        color: 0xf59e0b,
        groundColor: 0xb45309,
        skyColor: 0xfbbf24,
        monsters: ['scorpion_sand', 'mummy_ancient', 'djinn_sand'],
        bossId: 'boss_pharaoh',
        drops: ['goblin_fang', 'fire_core'],
        desc: '砂嵐と古代王朝の遺跡が眠る灼熱の大地'
    },
    {
        id: 'volcano',
        name: '紅蓮の業火火山',
        reqLv: 50,
        minLv: 50,
        baseThreat: 50,
        color: 0xef4444,
        groundColor: 0x7f1d1d,
        skyColor: 0x9a3412,
        monsters: ['imp_flame', 'salamander_lava', 'wyvern_magma'],
        bossId: 'boss_inferno_dragon',
        drops: ['fire_core', 'ice_crystal'],
        desc: '溶岩が噴き上がる古竜と炎魔の領域'
    },
    {
        id: 'snowfield',
        name: '絶対零度の氷原',
        reqLv: 75,
        minLv: 75,
        baseThreat: 75,
        color: 0x38bdf8,
        groundColor: 0xbae6fd,
        skyColor: 0x0284c7,
        monsters: ['spirit_frost', 'wolf_blizzard', 'yeti_blizzard'],
        bossId: 'boss_ice_empress',
        drops: ['ice_crystal', 'abyss_shard'],
        desc: 'すべてを凍てつかせる極寒の銀世界'
    },
    {
        id: 'sky',
        name: '天空の浮遊神殿',
        reqLv: 105,
        minLv: 105,
        baseThreat: 105,
        color: 0xfde047,
        groundColor: 0xe0e7ff,
        skyColor: 0x60a5fa,
        monsters: ['knight_angel', 'pegasus_sky', 'griffin_gold'],
        bossId: 'boss_seraphim',
        drops: ['abyss_shard', 'void_star'],
        desc: '雲海に浮かぶ古代神々の天空聖域'
    },
    {
        id: 'abyss',
        name: '終焉の深淵次元',
        reqLv: 145,
        minLv: 145,
        baseThreat: 145,
        color: 0xa855f7,
        groundColor: 0x1e1b4b,
        skyColor: 0x090d16,
        monsters: ['reaper_void', 'dragon_chaos', 'demon_lord'],
        bossId: 'boss_omega_creator',
        drops: ['abyss_shard', 'void_star'],
        desc: '創世の脅威が待ち受ける最終次元'
    }
]);

// =========================================================================
// 2. 敵モンスター＆エリアボス定義（全32種）
// =========================================================================
window.MONSTERS = createHybridRegistry([
    // 草原
    { id: 'slime_green', name: 'ぷるぷるスライム', kaomoji: '(・ω・)', zone: 'meadow', lv: 1, hp: 45, atk: 7, def: 2, exp: 16, gold: 15, color: 0x4ade80, scale: 0.9, drops: ['slime_gel'] },
    { id: 'rabbit_horn', name: 'ツノうさぎ', kaomoji: '(・x・)', zone: 'meadow', lv: 3, hp: 80, atk: 12, def: 4, exp: 25, gold: 22, color: 0xfef08a, scale: 1.0, drops: ['slime_gel'] },
    { id: 'boar_wild', name: 'とっしんウリ坊', kaomoji: '(｀(●●)´)', zone: 'meadow', lv: 5, hp: 130, atk: 18, def: 6, exp: 38, gold: 34, color: 0x92400e, scale: 1.1, drops: ['slime_gel', 'ancient_sap'] },
    { id: 'boss_king_slime', name: '【BOSS】キングスライム', kaomoji: '(👑・ω・👑)', zone: 'meadow', lv: 8, hp: 480, atk: 28, def: 10, exp: 190, gold: 220, color: 0x38bdf8, scale: 2.1, isBoss: true, drops: ['slime_gel', 'ancient_sap'] },

    // 深緑森
    { id: 'wolf_forest', name: 'フォレストウルフ', kaomoji: '(▼皿▼)', zone: 'forest', lv: 10, hp: 240, atk: 34, def: 12, exp: 70, gold: 60, color: 0x64748b, scale: 1.1, drops: ['ancient_sap'] },
    { id: 'goblin_scout', name: 'ゴブリンスカウト', kaomoji: '(;ﾟ皿ﾟ)', zone: 'forest', lv: 13, hp: 320, atk: 42, def: 16, exp: 92, gold: 80, color: 0x4d7c0f, scale: 1.05, drops: ['goblin_fang'] },
    { id: 'treant_elder', name: 'エルダートレント', kaomoji: '(木益木)', zone: 'forest', lv: 16, hp: 460, atk: 52, def: 24, exp: 125, gold: 105, color: 0x15803d, scale: 1.35, drops: ['ancient_sap', 'goblin_fang'] },
    { id: 'boss_forest_guardian', name: '【BOSS】森の守護神獣', kaomoji: '(🌿▼皿▼🌿)', zone: 'forest', lv: 20, hp: 1900, atk: 88, def: 36, exp: 620, gold: 700, color: 0x10b981, scale: 2.3, isBoss: true, drops: ['ancient_sap', 'goblin_fang'] },

    // 地下洞窟
    { id: 'bat_crystal', name: 'クリスタルバット', kaomoji: '(/^o^\\)', zone: 'cave', lv: 20, hp: 620, atk: 78, def: 30, exp: 185, gold: 160, color: 0x38bdf8, scale: 1.05, drops: ['goblin_fang'] },
    { id: 'kobold_miner', name: 'コボルド鉱夫', kaomoji: '(⛏️▼ω▼)', zone: 'cave', lv: 24, hp: 820, atk: 96, def: 42, exp: 235, gold: 205, color: 0xb45309, scale: 1.15, drops: ['goblin_fang', 'ice_crystal'] },
    { id: 'golem_iron', name: 'アイアンゴーレム', kaomoji: '[■_■]', zone: 'cave', lv: 28, hp: 1150, atk: 118, def: 66, exp: 310, gold: 265, color: 0x94a3b8, scale: 1.45, drops: ['ice_crystal'] },
    { id: 'boss_crystal_dragon', name: '【BOSS】蒼晶洞窟竜', kaomoji: '(💎🔥益🔥💎)', zone: 'cave', lv: 32, hp: 4800, atk: 185, def: 90, exp: 1550, gold: 1800, color: 0x06b6d4, scale: 2.5, isBoss: true, drops: ['goblin_fang', 'ice_crystal'] },

    // 古代砂漠
    { id: 'scorpion_sand', name: 'デススコーピオン', kaomoji: '(🦂ﾟ皿ﾟ)', zone: 'desert', lv: 33, hp: 1600, atk: 175, def: 82, exp: 450, gold: 390, color: 0xd97706, scale: 1.2, drops: ['goblin_fang'] },
    { id: 'mummy_ancient', name: '古代王の衛兵', kaomoji: '(x_x#)', zone: 'desert', lv: 38, hp: 2250, atk: 220, def: 108, exp: 610, gold: 520, color: 0xfef3c7, scale: 1.25, drops: ['fire_core'] },
    { id: 'djinn_sand', name: '砂嵐の魔人ジン', kaomoji: '(🌪️☉皿☉)', zone: 'desert', lv: 44, hp: 3000, atk: 275, def: 132, exp: 820, gold: 700, color: 0xf59e0b, scale: 1.4, drops: ['fire_core'] },
    { id: 'boss_pharaoh', name: '【BOSS】黄金ファラオ', kaomoji: '(👑☉皿☉👑)', zone: 'desert', lv: 48, hp: 11500, atk: 360, def: 170, exp: 3500, gold: 4200, color: 0xf59e0b, scale: 2.6, isBoss: true, drops: ['goblin_fang', 'fire_core'] },

    // 業火火山
    { id: 'imp_flame', name: 'フレイムインプ', kaomoji: '(🔥▽🔥)', zone: 'volcano', lv: 50, hp: 3800, atk: 375, def: 170, exp: 1050, gold: 900, color: 0xf97316, scale: 1.15, drops: ['fire_core'] },
    { id: 'salamander_lava', name: '溶岩サラマンダー', kaomoji: '(🦎🔥Д🔥)', zone: 'volcano', lv: 58, hp: 5100, atk: 465, def: 215, exp: 1400, gold: 1200, color: 0xea580c, scale: 1.35, drops: ['fire_core'] },
    { id: 'wyvern_magma', name: 'マグマワイバーン', kaomoji: '(🐉ﾟДﾟ)', zone: 'volcano', lv: 66, hp: 6800, atk: 570, def: 265, exp: 1850, gold: 1580, color: 0xdc2626, scale: 1.5, drops: ['fire_core', 'ice_crystal'] },
    { id: 'boss_inferno_dragon', name: '【BOSS】紅蓮獄炎竜王', kaomoji: '(🔥🐉益🐉🔥)', zone: 'volcano', lv: 72, hp: 29000, atk: 780, def: 360, exp: 8600, gold: 9900, color: 0xef4444, scale: 2.8, isBoss: true, drops: ['fire_core', 'ice_crystal'] },

    // 氷原
    { id: 'spirit_frost', name: 'フロストスピリット', kaomoji: '(❄️u❄️)', zone: 'snowfield', lv: 75, hp: 8900, atk: 760, def: 350, exp: 2300, gold: 2000, color: 0x7dd3fc, scale: 1.2, drops: ['ice_crystal'] },
    { id: 'wolf_blizzard', name: '銀狼フェンリル亜種', kaomoji: '(❄️▼皿▼)', zone: 'snowfield', lv: 84, hp: 11800, atk: 940, def: 440, exp: 3050, gold: 2650, color: 0xbae6fd, scale: 1.35, drops: ['ice_crystal'] },
    { id: 'yeti_blizzard', name: 'ブリザードイエティ', kaomoji: '(╬ﾟдﾟ)', zone: 'snowfield', lv: 94, hp: 15200, atk: 1160, def: 540, exp: 3900, gold: 3400, color: 0xe0f2fe, scale: 1.6, drops: ['abyss_shard'] },
    { id: 'boss_ice_empress', name: '【BOSS】絶対零度の氷帝', kaomoji: '(❄️👑▼皿▼👑❄️)', zone: 'snowfield', lv: 102, hp: 72000, atk: 1550, def: 710, exp: 19500, gold: 22500, color: 0x38bdf8, scale: 2.8, isBoss: true, drops: ['ice_crystal', 'abyss_shard'] },

    // 天空神殿
    { id: 'knight_angel', name: '神殿の守護天使', kaomoji: '(👼•̀ω•́)', zone: 'sky', lv: 105, hp: 20000, atk: 1520, def: 720, exp: 5100, gold: 4400, color: 0xfef08a, scale: 1.3, drops: ['abyss_shard'] },
    { id: 'pegasus_sky', name: '天翔けるペガサス', kaomoji: '(🦄✧ω✧)', zone: 'sky', lv: 118, hp: 26500, atk: 1880, def: 870, exp: 6600, gold: 5800, color: 0xf8fafc, scale: 1.45, drops: ['abyss_shard', 'void_star'] },
    { id: 'griffin_gold', name: '黄金グリフォン', kaomoji: '(🦅✧皿✧)', zone: 'sky', lv: 130, hp: 34000, atk: 2300, def: 1050, exp: 8400, gold: 7300, color: 0xfacc15, scale: 1.55, drops: ['void_star'] },
    { id: 'boss_seraphim', name: '【BOSS】熾天使セラフィム', kaomoji: '(✨👼👑👼✨)', zone: 'sky', lv: 140, hp: 165000, atk: 3150, def: 1420, exp: 45000, gold: 52000, color: 0xfde047, scale: 3.0, isBoss: true, drops: ['abyss_shard', 'void_star'] },

    // 深淵次元
    { id: 'reaper_void', name: 'アビスリーパー', kaomoji: '(💀皿💀)', zone: 'abyss', lv: 145, hp: 46000, atk: 2950, def: 1350, exp: 11500, gold: 10200, color: 0xa855f7, scale: 1.4, drops: ['void_star'] },
    { id: 'dragon_chaos', name: '混沌の次元竜', kaomoji: '(🌌🐉益🐉)', zone: 'abyss', lv: 165, hp: 64000, atk: 3800, def: 1720, exp: 15800, gold: 14000, color: 0x9333ea, scale: 1.65, drops: ['void_star'] },
    { id: 'demon_lord', name: '深淵の混沌魔神', kaomoji: '(👿益👿)', zone: 'abyss', lv: 185, hp: 88000, atk: 4850, def: 2150, exp: 21500, gold: 19000, color: 0x7e22ce, scale: 1.75, drops: ['void_star'] },
    { id: 'boss_omega_creator', name: '【BOSS】創世神オメガ', kaomoji: '(🌌👑👁️益👁️👑🌌)', zone: 'abyss', lv: 210, hp: 420000, atk: 6800, def: 3000, exp: 135000, gold: 170000, color: 0xf43f5e, scale: 3.3, isBoss: true, drops: ['abyss_shard', 'void_star'] }
]);

// =========================================================================
// 3. 武器定義（物理武器14種 ＋ 魔道士用の杖10種 ＝ 全24種）
// =========================================================================
window.WEAPONS = createHybridRegistry([
    // --- 物理職用（剣・斧・槍・大剣・聖剣） ---
    { id: 'wpn_wood', name: '木の剣', category: 'sword', atk: 12, mag: 1.0, glowColor: 0x94a3b8, cost: 0, reqLv: 1, icon: '🗡️', desc: '冒険の始まりに支給される木製の剣' },
    { id: 'wpn_copper', name: '銅の剣', category: 'sword', atk: 28, mag: 1.05, glowColor: 0xf59e0b, cost: 180, reqLv: 3, icon: '🗡️', materials: { slime_gel: 3 }, desc: '鍛えられた青銅の剣' },
    { id: 'wpn_dagger', name: '疾風の短剣', category: 'sword', atk: 48, mag: 1.08, glowColor: 0x4ade80, cost: 420, reqLv: 6, icon: '🗡️', materials: { slime_gel: 5, ancient_sap: 2 }, desc: '素早い連撃が可能な軽量ダガー' },
    { id: 'wpn_iron', name: '鉄の剣', category: 'sword', atk: 76, mag: 1.1, glowColor: 0xe2e8f0, cost: 850, reqLv: 10, icon: '⚔️', materials: { ancient_sap: 4 }, desc: '切れ味鋭い白鉄の長剣' },
    { id: 'wpn_axe', name: '重装バトルアックス', category: 'sword', atk: 125, mag: 1.12, glowColor: 0xf97316, cost: 1750, reqLv: 15, icon: '🪓', materials: { ancient_sap: 6, goblin_fang: 3 }, desc: '重い一撃で敵の装甲を砕く戦斧' },
    { id: 'wpn_steel', name: '鋼の剣', category: 'sword', atk: 190, mag: 1.16, glowColor: 0x38bdf8, cost: 3100, reqLv: 22, icon: '⚔️', materials: { goblin_fang: 5 }, desc: '魔力を帯びた精霊鋼の剣' },
    { id: 'wpn_spear', name: '蒼水晶の聖槍', category: 'sword', atk: 290, mag: 1.22, glowColor: 0x06b6d4, cost: 5800, reqLv: 30, icon: '🔱', materials: { goblin_fang: 8, ice_crystal: 2 }, desc: '結晶の魔力を宿した貫通の長槍' },
    { id: 'wpn_mythril', name: 'ミスリルソード', category: 'sword', atk: 450, mag: 1.28, glowColor: 0x34d399, cost: 11000, reqLv: 40, icon: '✨', materials: { fire_core: 5 }, desc: '神銀ミスリルで打たれた聖なる剣' },
    { id: 'wpn_greatsword', name: '王家の大剣', category: 'sword', atk: 720, mag: 1.32, glowColor: 0xfacc15, cost: 21000, reqLv: 52, icon: '⚔️', materials: { fire_core: 8, ice_crystal: 3 }, desc: '古代王国の騎士団長が振るった大剣' },
    { id: 'wpn_dragon', name: 'ドラゴンソード', category: 'sword', atk: 1180, mag: 1.4, glowColor: 0xef4444, cost: 42000, reqLv: 65, icon: '🔥', materials: { ice_crystal: 6 }, desc: '古竜の牙と鱗を宿す紅蓮の魔剣' },
    { id: 'wpn_orichalcum', name: 'オリハルコンの剣', category: 'sword', atk: 2650, mag: 1.55, glowColor: 0xfde047, cost: 145000, reqLv: 90, icon: '🌟', materials: { abyss_shard: 6 }, desc: '神話の金属で造られた伝説の剣' },
    { id: 'wpn_holy', name: '天界の聖剣', category: 'sword', atk: 5200, mag: 1.7, glowColor: 0xffffff, cost: 320000, reqLv: 115, icon: '👼', materials: { abyss_shard: 10, void_star: 3 }, desc: '熾天使の祝福を受けた黄金の聖剣' },
    { id: 'wpn_genesis', name: '創世聖剣エクスカリバー', category: 'sword', atk: 9800, mag: 1.9, glowColor: 0xa855f7, cost: 740000, reqLv: 145, icon: '👑', materials: { void_star: 8 }, desc: '次元をも切り裂く究極の創世聖剣' },
    { id: 'wpn_omega', name: '神滅剣ラグナロク', category: 'sword', atk: 18500, mag: 2.2, glowColor: 0xf43f5e, cost: 1650000, reqLv: 180, icon: '🌌', materials: { void_star: 16, abyss_shard: 16 }, desc: 'すべての理を超越した終焉の覇剣' },

    // --- 魔道士系専用（杖・ワンド・ロッド・オーブ） ---
    { id: 'staff_wood', name: '見習いの木の杖', category: 'staff', atk: 12, mag: 1.25, glowColor: 0x38bdf8, cost: 0, reqLv: 1, icon: '🪄', desc: '魔力を増幅する初心者用の木の杖' },
    { id: 'staff_oak', name: '精霊樹のワンド', category: 'staff', atk: 30, mag: 1.38, glowColor: 0x4ade80, cost: 220, reqLv: 4, icon: '🪄', materials: { slime_gel: 3 }, desc: '森の精霊力が宿る若木の魔法杖' },
    { id: 'staff_mana', name: '蒼水晶の魔導杖', category: 'staff', atk: 74, mag: 1.55, glowColor: 0x06b6d4, cost: 920, reqLv: 10, icon: '🪄', materials: { ancient_sap: 4 }, desc: '澄んだ魔力結晶を冠した魔導士の杖' },
    { id: 'staff_rune', name: 'ルーン刻印の法杖', category: 'staff', atk: 185, mag: 1.75, glowColor: 0x818cf8, cost: 3300, reqLv: 22, icon: '🔮', materials: { goblin_fang: 5 }, desc: '古代ルーン文字が刻まれた魔術師の杖' },
    { id: 'staff_sage', name: '賢者の星詠み杖', category: 'staff', atk: 430, mag: 2.0, glowColor: 0xa855f7, cost: 11800, reqLv: 40, icon: '🔮', materials: { fire_core: 5 }, desc: '星々の魔力を収束させる大賢者の杖' },
    { id: 'staff_dragon', name: '竜脈の紅蓮杖', category: 'staff', atk: 1120, mag: 2.35, glowColor: 0xf97316, cost: 44000, reqLv: 65, icon: '🔥', materials: { ice_crystal: 6 }, desc: '古竜の魔力炉を宿す灼熱の魔杖' },
    { id: 'staff_celestial', name: '天球儀の星霊杖', category: 'staff', atk: 2550, mag: 2.75, glowColor: 0xfde047, cost: 155000, reqLv: 90, icon: '🌟', materials: { abyss_shard: 6 }, desc: '回転する星々の環を冠した神代の杖' },
    { id: 'staff_seraph', name: '熾天使の聖光杖', category: 'staff', atk: 5000, mag: 3.15, glowColor: 0xffffff, cost: 340000, reqLv: 115, icon: '👼', materials: { abyss_shard: 10, void_star: 3 }, desc: '神聖な光条を放つ天界最高位の法杖' },
    { id: 'staff_genesis', name: '創世神杖アストラル', category: 'staff', atk: 9400, mag: 3.65, glowColor: 0xc084fc, cost: 780000, reqLv: 145, icon: '🌌', materials: { void_star: 8 }, desc: '宇宙の真理を解き放つ究極の聖杖' },
    { id: 'staff_omega', name: '終焉魔杖エターナル', category: 'staff', atk: 17800, mag: 4.3, glowColor: 0xf43f5e, cost: 1750000, reqLv: 180, icon: '🌌', materials: { void_star: 16, abyss_shard: 16 }, desc: '無限の魔力を紡ぎ出す神話究極の魔導杖' }
]);

// =========================================================================
// 4. 防具定義（全14種：def は割合軽減率）
// =========================================================================
window.ARMORS = createHybridRegistry([
    { id: 'arm_cloth', name: '布の服', def: 0.04, hp: 40, mp: 20, tierLook: 0, cost: 0, reqLv: 1, icon: '👕', desc: '動きやすい普段着' },
    { id: 'arm_leather', name: '革の鎧', def: 0.09, hp: 120, mp: 45, tierLook: 1, cost: 200, reqLv: 3, icon: '🦺', materials: { slime_gel: 3 }, desc: '魔獣の革をなめした軽鎧' },
    { id: 'arm_copper', name: '青銅の胸当て', def: 0.14, hp: 230, mp: 70, tierLook: 1, cost: 480, reqLv: 6, icon: '🛡️', materials: { slime_gel: 5, ancient_sap: 2 }, desc: '基本的な衝撃を防ぐ青銅鎧' },
    { id: 'arm_iron', name: '鉄の鎧', def: 0.19, hp: 400, mp: 105, tierLook: 2, cost: 920, reqLv: 10, icon: '🛡️', materials: { ancient_sap: 4 }, desc: '頑丈な鉄板で身を護る鎧' },
    { id: 'arm_robe_mana', name: '魔導士の星詠みローブ', def: 0.23, hp: 620, mp: 240, tierLook: 2, cost: 1900, reqLv: 16, icon: '🧥', materials: { ancient_sap: 6, goblin_fang: 3 }, desc: 'MP容量を大きく高める魔導法衣' },
    { id: 'arm_steel', name: '鋼の重鎧', def: 0.28, hp: 950, mp: 210, tierLook: 3, cost: 3400, reqLv: 22, icon: '🛡️', materials: { goblin_fang: 5 }, desc: '重厚な鋼鉄製の騎士鎧' },
    { id: 'arm_crystal', name: '蒼水晶の結界衣', def: 0.34, hp: 1550, mp: 420, tierLook: 3, cost: 6400, reqLv: 30, icon: '💎', materials: { goblin_fang: 8, ice_crystal: 2 }, desc: '魔力障壁を展開する結晶の鎧衣' },
    { id: 'arm_mythril', name: 'ミスリルメイル', def: 0.40, hp: 2450, mp: 550, tierLook: 4, cost: 12000, reqLv: 40, icon: '✨', materials: { fire_core: 5 }, desc: '軽さと強度を兼ね備えた神銀の鎧' },
    { id: 'arm_paladin', name: '聖騎士の白銀鎧', def: 0.46, hp: 3900, mp: 820, tierLook: 4, cost: 23000, reqLv: 52, icon: '🛡️', materials: { fire_core: 8, ice_crystal: 3 }, desc: '聖なる加護が刻まれた白銀の重鎧' },
    { id: 'arm_dragon', name: '竜鱗の鎧', def: 0.52, hp: 6200, mp: 1200, tierLook: 5, cost: 46000, reqLv: 65, icon: '🔥', materials: { ice_crystal: 6 }, desc: 'あらゆる災厄を弾く古竜の鎧' },
    { id: 'arm_orichalcum', name: 'オリハルコンアーマー', def: 0.60, hp: 15500, mp: 2600, tierLook: 6, cost: 160000, reqLv: 90, icon: '🌟', materials: { abyss_shard: 6 }, desc: '星々の加護を受けた不滅の神鎧' },
    { id: 'arm_holy', name: '熾天使の聖衣', def: 0.66, hp: 29000, mp: 4800, tierLook: 6, cost: 350000, reqLv: 115, icon: '👼', materials: { abyss_shard: 10, void_star: 3 }, desc: '神聖な光の結界を纏う天界の衣' },
    { id: 'arm_genesis', name: '創世神鎧イージス', def: 0.72, hp: 52000, mp: 8500, tierLook: 7, cost: 800000, reqLv: 145, icon: '👑', materials: { void_star: 8 }, desc: '全次元の攻撃を退ける究極神鎧' },
    { id: 'arm_omega', name: '終焉神装アヴァロン', def: 0.78, hp: 98000, mp: 15000, tierLook: 8, cost: 1800000, reqLv: 180, icon: '🌌', materials: { void_star: 16, abyss_shard: 16 }, desc: 'あらゆる概念攻撃を退ける絶対神装' }
]);

// =========================================================================
// 5. 装飾品定義（全14種）
// =========================================================================
window.ACCESSORIES = createHybridRegistry([
    { id: 'acc_none', name: 'なし', atkBonus: 0, hpBonus: 0, cdBonus: 0, lifesteal: 0, bossDmg: 0, rewardBonus: 0, doubleCast: 0, cost: 0, reqLv: 1, icon: '➖', desc: '装飾品未装備' },
    { id: 'acc_ring_wood', name: 'お守りの木輪', atkBonus: 0.05, hpBonus: 0.08, cdBonus: 0.03, lifesteal: 0, bossDmg: 0, rewardBonus: 0.05, doubleCast: 0, cost: 120, reqLv: 1, icon: '💍', desc: '旅の安全を祈願した素朴な指輪' },
    { id: 'acc_lucky_coin', name: '幸運の金貨ブローチ', atkBonus: 0.04, hpBonus: 0.06, cdBonus: 0.02, lifesteal: 0, bossDmg: 0, rewardBonus: 0.22, doubleCast: 0, cost: 350, reqLv: 4, icon: '🪙', desc: '獲得EXPとゴールドが大きく増える護符' },
    { id: 'acc_charm_life', name: '生命のペンダント', atkBonus: 0.08, hpBonus: 0.18, cdBonus: 0.05, lifesteal: 0.04, bossDmg: 0.05, rewardBonus: 0.10, doubleCast: 0, cost: 750, reqLv: 8, icon: '📿', desc: '攻撃時にHPを吸収する生命の護符' },
    { id: 'acc_swift_boots', name: '疾風の羽根飾り', atkBonus: 0.10, hpBonus: 0.10, cdBonus: 0.14, lifesteal: 0.02, bossDmg: 0.06, rewardBonus: 0.12, doubleCast: 0.04, cost: 1600, reqLv: 14, icon: '🪶', desc: 'スキルの回転率を高める軽やかな飾り' },
    { id: 'acc_ring_power', name: '覇王の戦指輪', atkBonus: 0.22, hpBonus: 0.15, cdBonus: 0.08, lifesteal: 0.06, bossDmg: 0.18, rewardBonus: 0.15, doubleCast: 0.05, cost: 3800, reqLv: 22, icon: '💍', desc: 'ボスへのダメージと攻撃力を大きく高める' },
    { id: 'acc_vamp_fang', name: '真紅の吸血牙首飾り', atkBonus: 0.20, hpBonus: 0.22, cdBonus: 0.10, lifesteal: 0.14, bossDmg: 0.15, rewardBonus: 0.15, doubleCast: 0.06, cost: 8200, reqLv: 32, icon: '🩸', desc: '高いHP吸収効果で前線を維持する魔装具' },
    { id: 'acc_chrono_orb', name: '刻詠みのクロノオーブ', atkBonus: 0.25, hpBonus: 0.25, cdBonus: 0.22, lifesteal: 0.08, bossDmg: 0.20, rewardBonus: 0.25, doubleCast: 0.16, cost: 18000, reqLv: 44, icon: '🔮', desc: 'MP自然回復1.5倍＆スキル連続発動率UP！' },
    { id: 'acc_dragon_heart', name: '古竜の心臓結晶', atkBonus: 0.35, hpBonus: 0.38, cdBonus: 0.16, lifesteal: 0.12, bossDmg: 0.32, rewardBonus: 0.28, doubleCast: 0.14, cost: 45000, reqLv: 62, icon: '❤️‍🔥', desc: '古竜の尽きぬ生命力と破壊力を授ける秘宝' },
    { id: 'acc_star_tiara', name: '星詠みの冠飾り', atkBonus: 0.42, hpBonus: 0.35, cdBonus: 0.26, lifesteal: 0.12, bossDmg: 0.35, rewardBonus: 0.42, doubleCast: 0.22, cost: 110000, reqLv: 85, icon: '👑', desc: '星々の導きによりスキル連発と報酬が大幅上昇' },
    { id: 'acc_orb_genesis', name: '創世の宝珠', atkBonus: 0.58, hpBonus: 0.52, cdBonus: 0.32, lifesteal: 0.16, bossDmg: 0.48, rewardBonus: 0.55, doubleCast: 0.30, cost: 280000, reqLv: 115, icon: '🌌', desc: '全次元の理を宿す究極の装飾品' },
    { id: 'acc_omega_ring', name: '無限神環ウロボロス', atkBonus: 0.85, hpBonus: 0.80, cdBonus: 0.40, lifesteal: 0.22, bossDmg: 0.70, rewardBonus: 0.80, doubleCast: 0.40, cost: 850000, reqLv: 155, icon: '♾️', desc: '永劫の循環を司る神話究極の指輪' }
]);

// =========================================================================
// 6. 称号・実績・エンチャント定義
// =========================================================================
window.TITLES = createHybridRegistry([
    { id: 'title_none', name: '駆け出し冒険者', atk: 0, hp: 0, crit: 0, reward: 0, desc: '冒険を始めたばかりの称号' },
    { id: 'title_novice_hero', name: '草原の希望', atk: 0.04, hp: 0.05, crit: 0.02, reward: 0.05, desc: 'はじまりの草原を駆け抜けた証' },
    { id: 'title_slayer', name: '魔物ハンター', atk: 0.08, hp: 0.08, crit: 0.03, reward: 0.08, desc: '数多の魔物を討伐した熟練の証' },
    { id: 'title_rich', name: '黄金の豪商', atk: 0.06, hp: 0.08, crit: 0.02, reward: 0.25, desc: '莫大な富を築き上げた冒険者の称号' },
    { id: 'title_boss_bane', name: '巨獣討伐者', atk: 0.15, hp: 0.14, crit: 0.06, reward: 0.14, desc: '強大なエリアボスを打ち倒した英雄' },
    { id: 'title_dragon_slayer', name: '古竜殺し', atk: 0.22, hp: 0.20, crit: 0.08, reward: 0.18, desc: '紅蓮の古竜王を制した伝説の戦士' },
    { id: 'title_sky_champ', name: '天空の覇者', atk: 0.28, hp: 0.26, crit: 0.10, reward: 0.25, desc: '浮遊神殿の試練を乗り越えた選ばれし者' },
    { id: 'title_genesis', name: '創世の超越者', atk: 0.40, hp: 0.38, crit: 0.14, reward: 0.38, desc: 'すべての次元を制覇した神話の称号' },
    { id: 'title_omega', name: '顔文字神話の体現者', atk: 0.55, hp: 0.50, crit: 0.18, reward: 0.50, desc: '終焉の創世神オメガを超えた究極の存在' }
]);

window.ACHIEVEMENTS = createHybridRegistry([
    { id: 'ach_kill_10', name: '初陣の勝利', desc: 'モンスターを10体討伐する', target: 10, type: 'kills', rewardGold: 200, rewardTitle: 'title_novice_hero' },
    { id: 'ach_kill_100', name: '百戦錬磨', desc: 'モンスターを100体討伐する', target: 100, type: 'kills', rewardGold: 1500, rewardTitle: 'title_slayer' },
    { id: 'ach_kill_500', name: '千軍万馬の英雄', desc: 'モンスターを500体討伐する', target: 500, type: 'kills', rewardGold: 12000 },
    { id: 'ach_boss_1', name: '初めてのボス討伐', desc: 'エリアボスを1体討伐する', target: 1, type: 'bossKills', rewardGold: 500 },
    { id: 'ach_boss_10', name: '巨獣ハンター', desc: 'エリアボスを10体討伐する', target: 10, type: 'bossKills', rewardGold: 8000, rewardTitle: 'title_boss_bane' },
    { id: 'ach_boss_50', name: '神話の竜殺し', desc: 'エリアボスを50体討伐する', target: 50, type: 'bossKills', rewardGold: 60000, rewardTitle: 'title_dragon_slayer' },
    { id: 'ach_lv_10', name: '一人前の冒険者', desc: 'レベル10に到達する', target: 10, type: 'lv', rewardGold: 600 },
    { id: 'ach_lv_30', name: '熟練の達人', desc: 'レベル30に到達する', target: 30, type: 'lv', rewardGold: 4000 },
    { id: 'ach_lv_60', name: '伝説の英雄', desc: 'レベル60に到達する', target: 60, type: 'lv', rewardGold: 25000, rewardTitle: 'title_sky_champ' },
    { id: 'ach_lv_100', name: '天元突破', desc: 'レベル100に到達する', target: 100, type: 'lv', rewardGold: 100000, rewardTitle: 'title_genesis' },
    { id: 'ach_lv_150', name: '創世の頂', desc: 'レベル150に到達する', target: 150, type: 'lv', rewardGold: 500000, rewardTitle: 'title_omega' }
]);

window.ENCHANT_POOL = [
    { id: 'ench_atk_1', name: '猛攻の刻印', stat: 'atkBonus', val: 0.14, desc: '攻撃力 +14%' },
    { id: 'ench_atk_2', name: '覇王の刻印', stat: 'atkBonus', val: 0.24, desc: '攻撃力 +24%' },
    { id: 'ench_hp_1', name: '守護の刻印', stat: 'hpBonus', val: 0.18, desc: '最大HP +18%' },
    { id: 'ench_hp_2', name: '不滅の刻印', stat: 'hpBonus', val: 0.30, desc: '最大HP +30%' },
    { id: 'ench_crit_1', name: '会心の刻印', stat: 'critBonus', val: 0.08, desc: '会心率 +8%' },
    { id: 'ench_crit_2', name: '必殺の刻印', stat: 'critDmg', val: 0.35, desc: '会心ダメージ +35%' },
    { id: 'ench_cd_1', name: '迅速の刻印', stat: 'cdBonus', val: 0.10, desc: 'クールダウン短縮 +10%' },
    { id: 'ench_cd_2', name: '神速の刻印', stat: 'cdBonus', val: 0.18, desc: 'クールダウン短縮 +18%' },
    { id: 'ench_vamp', name: '吸血の刻印', stat: 'lifesteal', val: 0.06, desc: 'HP吸収 +6%' },
    { id: 'ench_boss', name: '巨獣殺しの刻印', stat: 'bossDmg', val: 0.25, desc: 'ボス特効ダメージ +25%' },
    { id: 'ench_fortune', name: '幸運の刻印', stat: 'rewardBonus', val: 0.22, desc: '獲得EXP/G +22%' }
];

// =========================================================================
// 7. 素材・消耗アイテム定義
// =========================================================================
window.MATERIALS = {
    slime_gel: { id: 'slime_gel', name: 'ぷるぷるゼリー', icon: '💧', desc: 'スライムから採れる魔力を帯びたゼリー' },
    ancient_sap: { id: 'ancient_sap', name: '古樹の琥珀液', icon: '🍯', desc: '深緑森の古木から採れる神秘の樹液' },
    goblin_fang: { id: 'goblin_fang', name: '魔獣の鋭牙', icon: '🦷', desc: '鍛冶や強化の素材になる硬質な牙' },
    fire_core: { id: 'fire_core', name: '紅蓮の炎核', icon: '🔥', desc: '灼熱の魔力を秘めた結晶核' },
    ice_crystal: { id: 'ice_crystal', name: '絶対零度の氷晶', icon: '❄️', desc: '決して溶けることのない永久氷晶' },
    abyss_shard: { id: 'abyss_shard', name: '深淵の欠片', icon: '🌑', desc: '次元の狭間からこぼれ落ちた闇の結晶' },
    void_star: { id: 'void_star', name: '創世の星屑', icon: '✨', desc: '宇宙の輝きを封じ込めた究極素材' }
};

window.ITEMS = createHybridRegistry([
    { id: 'pot_hp_s', name: '回復ポーション', type: 'heal_hp', value: 150, cost: 40, icon: '🧪', desc: 'HPを150回復する' },
    { id: 'pot_hp_m', name: 'ハイポーション', type: 'heal_hp', value: 850, cost: 180, icon: '🧪', desc: 'HPを850回復する' },
    { id: 'pot_hp_l', name: 'メガポーション', type: 'heal_hp', value: 4500, cost: 650, icon: '🧪', desc: 'HPを4500回復する' },
    { id: 'pot_mp_s', name: 'マナポーション', type: 'heal_mp', value: 100, cost: 60, icon: '💧', desc: 'MPを100回復する' },
    { id: 'pot_mp_m', name: 'ハイマナポーション', type: 'heal_mp', value: 500, cost: 240, icon: '💧', desc: 'MPを500回復する' },
    { id: 'pot_elixir', name: 'エリクサー', type: 'heal_full', value: 999999, cost: 1200, icon: '🏺', desc: 'HPとMPを完全回復する秘薬' }
]);

// =========================================================================
// 8. スキル定義（全22種：全11系統を網羅＋slash_heavy / sk_slash両対応）
// =========================================================================
window.SKILLS = (function () {
    const list = [
        // 斬撃系 (slash)
        { id: 'slash_heavy', name: 'クロススラッシュ', category: 'slash', type: 'attack', mpCost: 8, cd: 2.2, mult: 1.8, range: 4.8, reqLv: 1, icon: '⚔️', desc: '前方に鋭い光刃の斬撃を放つ基本剣技' },
        { id: 'sk_slash_spin', name: '旋風円月斬', category: 'slash', type: 'attack', mpCost: 13, cd: 2.8, mult: 2.15, range: 5.6, reqLv: 8, icon: '🌀', desc: '周囲360度の敵をまとめて薙ぎ払う回転斬り' },
        { id: 'sk_slash_void', name: '次元断空斬', category: 'slash', type: 'attack', mpCost: 20, cd: 3.6, mult: 2.85, range: 6.8, reqLv: 25, icon: '🗡️', desc: '空間ごと敵を切り裂く超高速の真空剣閃' },

        // 火炎系 (fire)
        { id: 'sk_fire', name: 'メテオフレア', category: 'fire', type: 'attack', mpCost: 14, cd: 3.4, mult: 2.3, range: 6.8, reqLv: 4, icon: '🔥', desc: '灼熱の火球・隕石で周囲を焼き尽くす' },
        { id: 'sk_fire_pillar', name: '爆炎フレイムピラー', category: 'fire', type: 'attack', mpCost: 20, cd: 4.0, mult: 2.75, range: 7.4, reqLv: 18, icon: '🌋', desc: '大地から紅蓮の火柱を噴き上げ敵を炎上させる' },
        { id: 'sk_fire_inferno', name: '紅蓮インフェルノ', category: 'fire', type: 'attack', mpCost: 28, cd: 4.8, mult: 3.35, range: 8.5, reqLv: 42, icon: '☄️', desc: '業火の隕石群を降り注がせる究極火炎魔法' },

        // 氷結系 (nova_ice)
        { id: 'sk_nova_ice', name: 'アブソリュートゼロ', category: 'nova_ice', type: 'attack', mpCost: 16, cd: 3.8, mult: 2.2, range: 6.8, reqLv: 6, icon: '❄️', desc: '絶対零度の氷結陣で敵を凍てつかせる' },
        { id: 'sk_ice_cocytus', name: '氷獄コキュートス', category: 'nova_ice', type: 'attack', mpCost: 24, cd: 4.5, mult: 2.95, range: 8.0, reqLv: 30, icon: '🧊', desc: '無数の氷槍を召喚し敵全体を凍結・粉砕する' },

        // 雷撃系 (thunder)
        { id: 'sk_thunder', name: 'サンダーボルト', category: 'thunder', type: 'attack', mpCost: 15, cd: 3.3, mult: 2.25, range: 6.8, reqLv: 7, icon: '⚡', desc: '天空から紫電の雷槍を落とし麻痺させる' },
        { id: 'sk_thunder_god', name: '建御雷神の裁き', category: 'thunder', type: 'attack', mpCost: 26, cd: 4.6, mult: 3.2, range: 8.2, reqLv: 35, icon: '🌩️', desc: '無数の神雷を連続投下する超電磁砲撃' },

        // 疾風系 (wind)
        { id: 'sk_wind', name: 'テンペストトルネード', category: 'wind', type: 'attack', mpCost: 13, cd: 3.0, mult: 2.0, range: 6.8, reqLv: 5, icon: '🌪️', desc: '暴風の竜巻を巻き起こし敵を吹き飛ばす' },
        { id: 'sk_wind_storm', name: '神風シルフィード', category: 'wind', type: 'attack', mpCost: 21, cd: 3.9, mult: 2.75, range: 7.8, reqLv: 28, icon: '🍃', desc: '真空の刃を纏った大竜巻で敵を切り刻む' },

        // 光線・ビーム系 (beam)
        { id: 'sk_beam', name: '極光レーザー砲', category: 'beam', type: 'attack', mpCost: 20, cd: 4.2, mult: 2.7, range: 11.5, reqLv: 12, icon: '🔦', desc: '直線上の敵を貫く高出力エネルギー砲' },
        { id: 'sk_beam_buster', name: 'メガ粒子バスター', category: 'beam', type: 'attack', mpCost: 30, cd: 5.2, mult: 3.5, range: 13.5, reqLv: 48, icon: '🔆', desc: '収束した超高密度光線で前方を蒸発させる' },

        // 深淵・重力系 (void)
        { id: 'sk_void', name: 'アビスグラビティ', category: 'void', type: 'attack', mpCost: 18, cd: 4.0, mult: 2.4, range: 6.8, reqLv: 15, icon: '🌑', desc: '深淵の重力球で次元ごと敵を蝕み毒を与える' },
        { id: 'sk_void_eclipse', name: '終焉ブラックホール', category: 'void', type: 'attack', mpCost: 29, cd: 5.0, mult: 3.3, range: 8.4, reqLv: 55, icon: '🕳️', desc: 'すべてを飲み込む暗黒特異点を発生させる' },

        // 回復・支援系 (support / aurora)
        { id: 'sk_support', name: 'ホーリーヒール', category: 'support', type: 'heal', mpCost: 18, cd: 4.8, mult: 1.5, range: 7.5, reqLv: 3, icon: '💖', desc: '聖なる光でHPを大回復し味方を祝福する' },
        { id: 'sk_support_over', name: '聖女の奇跡', category: 'support', type: 'heal', mpCost: 28, cd: 6.5, mult: 2.4, range: 9.0, reqLv: 26, icon: '✨', desc: '周囲の味方全員のHPを劇的に回復する大奇跡' },
        { id: 'sk_aurora', name: '極光の聖域', category: 'aurora', type: 'buff', mpCost: 26, cd: 7.5, mult: 1.5, range: 8.0, reqLv: 20, icon: '🌈', desc: '味方の全能力を強化し継続回復する聖域を展開' },

        // 奥義・ネタ超兵器系 (chabudai / bigbang)
        { id: 'sk_chabudai', name: '怒りのちゃぶ台返し', category: 'chabudai', type: 'attack', mpCost: 22, cd: 4.5, mult: 3.1, range: 7.8, reqLv: 14, icon: '┻━┻', desc: '巨大なちゃぶ台をひっくり返し衝撃波を放つ！' },
        { id: 'sk_chabudai_giga', name: '超銀河ちゃぶ台大回転', category: 'chabudai', type: 'attack', mpCost: 32, cd: 5.6, mult: 3.8, range: 9.2, reqLv: 50, icon: '(╯°□°)╯', desc: '惑星サイズのちゃぶ台を連続でひっくり返す奥義！' },
        { id: 'sk_bigbang', name: '創世ビッグバン', category: 'bigbang', type: 'attack', mpCost: 34, cd: 6.8, mult: 4.2, range: 10.5, reqLv: 65, icon: '💥', desc: '銀河規模の超新星爆発で周囲一帯を消滅させる！' }
    ];
    createHybridRegistry(list);
    list['sk_slash'] = list['slash_heavy'];
    return list;
})();

// =========================================================================
// 9. スキルツリーノード定義（game1.js の d.tree 全8系統と完全一致）
// =========================================================================
window.SKILL_TREE = createHybridRegistry([
    { id: 't_might', name: '剛力の極意', maxLv: 20, cost: 1, icon: '⚔️', desc: '攻撃力 +6% / Lv' },
    { id: 't_arcana', name: '魔導の極意', maxLv: 20, cost: 1, icon: '🔮', desc: 'スキル威力 +8% / Lv' },
    { id: 't_vital', name: '生命の極意', maxLv: 20, cost: 1, icon: '❤️', desc: '最大HP +8% ＆ HP自然回復強化 / Lv' },
    { id: 't_crit', name: '必殺の極意', maxLv: 20, cost: 1, icon: '💥', desc: '会心率 +5% ＆ 会心ダメージ +12% / Lv' },
    { id: 't_chant', name: '神速詠唱の極意', maxLv: 20, cost: 1, icon: '⚡', desc: 'クールダウン短縮 +5% ＆ MP自然回復 +10% / Lv' },
    { id: 't_aegis', name: '守護聖壁の極意', maxLv: 20, cost: 1, icon: '🛡️', desc: 'ダメージ軽減 +3% ＆ 回復スキル効果 +8% / Lv' },
    { id: 't_fortune', name: '黄金幸運の極意', maxLv: 20, cost: 1, icon: '🍀', desc: '獲得EXP＆ゴールド +10% / Lv' },
    { id: 't_warlord', name: '覇王覚醒の極意', maxLv: 15, cost: 2, icon: '👑', desc: '全基本ステータス(STR/INT/VIT/AGI) +5% ＆ CD短縮 +3% / Lv' }
]);
window.TREE_NODES = window.SKILL_TREE;

// =========================================================================
// 10. 職業・進化定義（物理ルート＆魔道士ルート 全14種）
// =========================================================================
window.EVOLUTIONS = createHybridRegistry([
    { id: 'novice', name: '見習い冒険者', kaomoji: '(´・ω・`)', hexColor: 0x38bdf8, isMageJob: false, reqLv: 1, atkMult: 1.0, hpMult: 1.0, mpMult: 1.0, spdMult: 1.0, exCritBonus: 0, exDefBonus: 0, exCdBonus: 0, icon: '🗡️', desc: '無限の可能性を秘めた顔文字冒険者' },
    { id: 'warrior', name: '剛腕の剣豪', kaomoji: '(｀・ω・´)', hexColor: 0xef4444, isMageJob: false, reqLv: 10, atkMult: 1.38, hpMult: 1.32, mpMult: 0.95, spdMult: 1.08, exCritBonus: 0.06, exDefBonus: 0.05, exCdBonus: 0.04, icon: '⚔️', desc: '近接戦闘と斬撃スキルに秀でた戦士' },
    { id: 'mage', name: '星詠みの魔道士', kaomoji: '(∩^o^)⊃━☆', hexColor: 0xa855f7, isMageJob: true, reqLv: 10, atkMult: 1.48, hpMult: 1.05, mpMult: 1.75, spdMult: 1.05, exCritBonus: 0.05, exDefBonus: 0.02, exCdBonus: 0.12, icon: '🪄', desc: '杖を装備し通常攻撃が魔法弾になる魔道士' },
    { id: 'rogue', name: '疾風の影忍者', kaomoji: '( •̀д•́ )✧', hexColor: 0x10b981, isMageJob: false, reqLv: 10, atkMult: 1.34, hpMult: 1.15, mpMult: 1.15, spdMult: 1.22, exCritBonus: 0.14, exDefBonus: 0.02, exCdBonus: 0.14, icon: '🥷', desc: '高い機動力と連続会心で敵を翻弄する暗殺者' },
    { id: 'paladin', name: '聖光の守護騎士', kaomoji: '(🛡️•̀ω•́)', hexColor: 0xfde047, isMageJob: false, reqLv: 30, atkMult: 1.62, hpMult: 1.95, mpMult: 1.35, spdMult: 1.05, exCritBonus: 0.06, exDefBonus: 0.15, exCdBonus: 0.06, icon: '🛡️', desc: '鉄壁の防御と聖なる支援を操る騎士' },
    { id: 'berserker', name: '紅蓮の狂戦士', kaomoji: '(╬ﾟ皿ﾟ)', hexColor: 0xdc2626, isMageJob: false, reqLv: 30, atkMult: 1.95, hpMult: 1.60, mpMult: 1.0, spdMult: 1.15, exCritBonus: 0.12, exDefBonus: 0.04, exCdBonus: 0.08, icon: '🪓', desc: '圧倒的な攻撃力で敵を粉砕する重戦士' },
    { id: 'sorcerer', name: '元素の大魔導士', kaomoji: '(🔥∩^o^)⊃━☆', hexColor: 0x3b82f6, isMageJob: true, reqLv: 30, atkMult: 1.88, hpMult: 1.25, mpMult: 2.20, spdMult: 1.10, exCritBonus: 0.08, exDefBonus: 0.04, exCdBonus: 0.18, icon: '🔮', desc: '火・氷・雷の元素魔法を自在に操る上位魔道士' },
    { id: 'archmage', name: '創世の大賢者', kaomoji: '(✨∩^o^)⊃━☆', hexColor: 0x06b6d4, isMageJob: true, reqLv: 55, atkMult: 2.40, hpMult: 1.55, mpMult: 2.80, spdMult: 1.16, exCritBonus: 0.12, exDefBonus: 0.07, exCdBonus: 0.24, icon: '🔮', desc: 'あらゆる元素と奥義魔法を極めた大魔導師' },
    { id: 'dragon_knight', name: '紅蓮の竜騎士', kaomoji: '(🐉｀・ω・´)', hexColor: 0xf97316, isMageJob: false, reqLv: 55, atkMult: 2.45, hpMult: 2.25, mpMult: 1.65, spdMult: 1.18, exCritBonus: 0.12, exDefBonus: 0.14, exCdBonus: 0.14, icon: '🐉', desc: '古竜の力を宿し戦場を駆ける天空の覇者' },
    { id: 'spirit_king', name: '万象の精霊王', kaomoji: '(🌈✧∀✧🌈)', hexColor: 0x2dd4bf, isMageJob: true, reqLv: 85, atkMult: 3.10, hpMult: 2.10, mpMult: 3.50, spdMult: 1.22, exCritBonus: 0.15, exDefBonus: 0.10, exCdBonus: 0.28, icon: '🌈', desc: '四大精霊と極光の聖域を自在に操る魔法王' },
    { id: 'god_slayer', name: '天元・顔文字神', kaomoji: '(👑✧∀✧👑)', hexColor: 0xf43f5e, isMageJob: false, reqLv: 110, atkMult: 3.60, hpMult: 3.30, mpMult: 3.40, spdMult: 1.28, exCritBonus: 0.20, exDefBonus: 0.20, exCdBonus: 0.28, icon: '👑', desc: '全次元の頂点に君臨する究極進化形態' },
    { id: 'omega_sage', name: '創世神話・無限賢者', kaomoji: '(🌌∩^o^)⊃━☆', hexColor: 0xc084fc, isMageJob: true, reqLv: 140, atkMult: 4.30, hpMult: 3.10, mpMult: 4.80, spdMult: 1.30, exCritBonus: 0.22, exDefBonus: 0.16, exCdBonus: 0.35, icon: '🌌', desc: '宇宙の真理を解き明かした究極の魔導神' }
]);

// =========================================================================
// 11. ペット＆見た目装備定義（全12種のペット ＋ 25種の見た目装備）
// =========================================================================
window.PETS = createHybridRegistry([
    { id: 'pet_slime', name: 'ぷにぷにスライム', cost: 300, atk: 12, def: 8, hp: 60, color: 0x38bdf8, shape: 'slime', kaomoji: '(・ω・)', desc: 'いつもそばで跳ねる癒し系スライム' },
    { id: 'pet_cat', name: '黒猫ルナ', cost: 850, atk: 28, def: 15, hp: 115, color: 0x1e293b, shape: 'wolf', kaomoji: '(=^･ω･^=)', desc: '主人の後ろをトコトコ歩く俊敏な黒猫' },
    { id: 'pet_rabbit', name: '月うさぎモチ', cost: 1400, atk: 42, def: 24, hp: 165, color: 0xf8fafc, shape: 'slime', kaomoji: '(・x・)', desc: 'ピョンピョン跳ねて癒しを届ける白うさぎ' },
    { id: 'pet_wolf', name: '疾風フェンリル', cost: 2600, atk: 75, def: 35, hp: 250, color: 0x94a3b8, shape: 'wolf', kaomoji: '(▼皿▼)', desc: '主人の敵に鋭い牙を剥く銀狼' },
    { id: 'pet_fairy', name: '光精霊ルミナ', cost: 6500, atk: 135, def: 95, hp: 520, color: 0xfde047, shape: 'fairy', kaomoji: '(★‿★)', desc: '聖なる光の粉を振りまく光の妖精' },
    { id: 'pet_golem', name: 'ミニクリスタルゴーレム', cost: 15000, atk: 230, def: 210, hp: 1050, color: 0x06b6d4, shape: 'slime', kaomoji: '[✧_✧]', desc: '堅牢な結晶の体で主人を護る守護像' },
    { id: 'pet_griffin', name: '天空の若獅子グリフォン', cost: 28000, atk: 380, def: 220, hp: 1550, color: 0xfacc15, shape: 'phoenix', kaomoji: '(🦅•̀ω•́)', desc: '黄金の翼で空を舞う誇り高き霊獣' },
    { id: 'pet_dragon', name: '紅蓮ミニドラゴン', cost: 48000, atk: 580, def: 320, hp: 2200, color: 0xef4444, shape: 'dragon', kaomoji: '(🔥益🔥)', desc: '灼熱のブレスを吐く小さな竜王' },
    { id: 'pet_phoenix', name: '不死鳥フェニックス', cost: 95000, atk: 1050, def: 620, hp: 4100, color: 0xf97316, shape: 'phoenix', kaomoji: '(✨▽✨)', desc: '黄金の翼で主人に不死の加護を与える神鳥' },
    { id: 'pet_omega', name: '創世の星霊オメガ', cost: 280000, atk: 2600, def: 1650, hp: 10500, color: 0xa855f7, shape: 'fairy', kaomoji: '(🌌★‿★🌌)', desc: '銀河の輝きを纏う究極の守護星霊' }
]);

window.COSMETICS = createHybridRegistry([
    { id: 'none', name: 'なし', cost: 0, icon: '➖', desc: '頭装備なし' },
    { id: 'cos_ribbon', name: '赤いおめかしリボン', cost: 400, icon: '🎀', desc: '可愛らしい真っ赤なリボン' },
    { id: 'cos_cat_ears', name: 'ネコミミカチューシャ', cost: 1200, icon: '🐱', desc: 'ぴょこんと可愛いネコミミ' },
    { id: 'cos_bunny_ears', name: 'うさみみバンド', cost: 1500, icon: '🐰', desc: 'ふわふわの白いうさみみ' },
    { id: 'cos_wizard_hat', name: '星屑の魔導帽', cost: 2800, icon: '🎩', desc: '星と月の飾りがついたとんがり帽子' },
    { id: 'cos_fox_mask', name: 'お狐さまのお面', cost: 4200, icon: '🦊', desc: '神秘的な和風の狐面' },
    { id: 'cos_halo', name: '天使の光の輪', cost: 6500, icon: '😇', desc: '頭上に浮かぶ神聖な光輪' },
    { id: 'cos_devil_horns', name: '小悪魔のツノ', cost: 7200, icon: '😈', desc: 'ちょっぴりクールな漆黒の角' },
    { id: 'cos_crown', name: '黄金の王冠', cost: 15000, icon: '👑', desc: '王者の風格を漂わせる黄金のクラウン' },
    { id: 'cos_dragon_horns', name: '古竜王の双角', cost: 35000, icon: '🐉', desc: '紅蓮の魔力を帯びた古竜の角' },
    { id: 'cos_galaxy_crown', name: '創世神話の星冠', cost: 95000, icon: '🌌', desc: '銀河の星々が周回する究極の王冠' }
]);

window.BACK_COSMETICS = createHybridRegistry([
    { id: 'back_none', name: 'なし', cost: 0, icon: '➖', desc: '背中装備なし' },
    { id: 'back_scarf', name: '冒険者の赤マフラー', cost: 600, icon: '🧣', desc: '風になびく勇気の赤いマフラー' },
    { id: 'back_cape', name: '王宮騎士のマント', cost: 1800, icon: '🦸', desc: '気品ある深紅の騎士マント' },
    { id: 'back_fairy_wing', name: '妖精の透き通る羽', cost: 3500, icon: '🦋', desc: 'キラキラと鱗粉が舞う精霊の羽' },
    { id: 'back_angel_wing', name: '純白の天使翼', cost: 8500, icon: '🪽', desc: '背中に広がる神聖な純白の翼' },
    { id: 'back_demon_wing', name: '深淵の黒竜翼', cost: 12000, icon: '🦇', desc: '漆黒の魔力を纏う悪魔の翼' },
    { id: 'back_magic_ring', name: '後光の魔導陣リング', cost: 24000, icon: '☸️', desc: '背後に浮かび回転する神秘の魔法陣' },
    { id: 'back_sword_aura', name: '浮遊する六本の聖剣', cost: 48000, icon: '⚔️', desc: '背後に6本の光剣を従える剣神の装い' },
    { id: 'back_seraph_wing', name: '熾天使の六枚翼', cost: 85000, icon: '✨', desc: '黄金に輝く6枚の神翼' },
    { id: 'back_galaxy_halo', name: '創世の銀河光輪', cost: 160000, icon: '🌌', desc: '宇宙そのものを背負う究極の背面装飾' }
]);

window.KAOMOJI_PRESETS = [
    '(´・ω・`)', '(｀・ω・´)', '(≧▽≦)', '(=^・ω・^=)', '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧',
    '(∩^o^)⊃━☆', '( •̀д•́ )✧', '(╬ﾟ皿ﾟ)', '(🔥益🔥)', '(👑✧∀✧👑)',
    '(╯°□°)╯︵ ┻━┻', '(´；ω；`)', '(・∀・)', '(๑•̀ㅂ•́)و✧', '(🌌👁️益👁️🌌)'
];
