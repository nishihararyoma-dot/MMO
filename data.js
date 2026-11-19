'use strict';

const SAVE_KEY = 'kaomoji_mmorpg_save_v1';

function createHybridRegistry(list) {
    list.forEach(item => {
        if (item && item.id) list[item.id] = item;
    });
    return list;
}

// =========================================================================
// 1. エリア・ワールドマップ定義（全8エリア）
// =========================================================================
const ZONES = createHybridRegistry([
    {
        id: 'meadow',
        name: 'はじまりの草原',
        reqLv: 1,
        minLv: 1,
        baseThreat: 1,
        color: 0x4ade80,
        groundColor: 0x2e7d32,
        skyColor: 0x38bdf8,
        monsters: ['slime_green', 'rabbit_horn'],
        bossId: 'boss_king_slime',
        drops: ['ore_copper', 'fur_beast'],
        desc: '穏やかな風が吹く初心者向けの草原エリア'
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
        monsters: ['wolf_forest', 'treant_elder'],
        bossId: 'boss_forest_guardian',
        drops: ['fur_beast', 'ore_iron', 'crystal_mana'],
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
        monsters: ['bat_crystal', 'golem_iron'],
        bossId: 'boss_crystal_dragon',
        drops: ['ore_iron', 'crystal_mana', 'ore_mythril'],
        desc: '魔力を帯びた結晶が輝く地底迷宮'
    },
    {
        id: 'desert',
        name: '灼熱の古代砂漠',
        reqLv: 35,
        minLv: 35,
        baseThreat: 35,
        color: 0xf59e0b,
        groundColor: 0xb45309,
        skyColor: 0xfbbf24,
        monsters: ['scorpion_sand', 'mummy_ancient'],
        bossId: 'boss_pharaoh',
        drops: ['ore_mythril', 'crystal_mana', 'scale_dragon'],
        desc: '砂嵐と古代王朝の遺跡が眠る灼熱の大地'
    },
    {
        id: 'volcano',
        name: '紅蓮の業火火山',
        reqLv: 55,
        minLv: 55,
        baseThreat: 55,
        color: 0xef4444,
        groundColor: 0x7f1d1d,
        skyColor: 0x9a3412,
        monsters: ['imp_flame', 'wyvern_magma'],
        bossId: 'boss_inferno_dragon',
        drops: ['scale_dragon', 'ore_mythril', 'ore_orichalcum'],
        desc: '溶岩が噴き上がる古竜と炎魔の領域'
    },
    {
        id: 'snowfield',
        name: '絶対零度の氷原',
        reqLv: 80,
        minLv: 80,
        baseThreat: 80,
        color: 0x38bdf8,
        groundColor: 0xbae6fd,
        skyColor: 0x0284c7,
        monsters: ['spirit_frost', 'yeti_blizzard'],
        bossId: 'boss_ice_empress',
        drops: ['crystal_mana', 'ore_orichalcum', 'soul_star'],
        desc: 'すべてを凍てつかせる極寒の銀世界'
    },
    {
        id: 'sky',
        name: '天空の浮遊神殿',
        reqLv: 110,
        minLv: 110,
        baseThreat: 110,
        color: 0xfde047,
        groundColor: 0xe0e7ff,
        skyColor: 0x60a5fa,
        monsters: ['knight_angel', 'griffin_gold'],
        bossId: 'boss_seraphim',
        drops: ['ore_orichalcum', 'soul_star', 'dragon_heart'],
        desc: '雲海に浮かぶ古代神々の天空聖域'
    },
    {
        id: 'abyss',
        name: '終焉の深淵次元',
        reqLv: 150,
        minLv: 150,
        baseThreat: 150,
        color: 0xa855f7,
        groundColor: 0x1e1b4b,
        skyColor: 0x090d16,
        monsters: ['reaper_void', 'demon_lord'],
        bossId: 'boss_omega_creator',
        drops: ['soul_star', 'dragon_heart', 'genesis_core'],
        desc: '創世の脅威が待ち受ける最終次元'
    }
]);

// =========================================================================
// 2. 敵モンスター＆エリアボス定義（全24種）
// =========================================================================
const MONSTERS = createHybridRegistry([
    // 草原
    { id: 'slime_green', name: 'ぷるぷるスライム', kaomoji: '(・ω・)', zone: 'meadow', lv: 1, hp: 45, atk: 6, def: 2, exp: 14, gold: 12, color: 0x4ade80, scale: 0.9, drops: ['ore_copper'] },
    { id: 'rabbit_horn', name: 'ツノうさぎ', kaomoji: '(・x・)', zone: 'meadow', lv: 3, hp: 75, atk: 11, def: 4, exp: 22, gold: 18, color: 0xfef08a, scale: 1.0, drops: ['fur_beast'] },
    { id: 'boss_king_slime', name: '【BOSS】キングスライム', kaomoji: '(👑・ω・👑)', zone: 'meadow', lv: 8, hp: 420, atk: 26, def: 10, exp: 160, gold: 180, color: 0x38bdf8, scale: 2.1, isBoss: true, drops: ['ore_copper', 'crystal_mana'] },

    // 深緑森
    { id: 'wolf_forest', name: 'フォレストウルフ', kaomoji: '(▼皿▼)', zone: 'forest', lv: 10, hp: 220, atk: 32, def: 12, exp: 65, gold: 55, color: 0x64748b, scale: 1.1, drops: ['fur_beast', 'ore_iron'] },
    { id: 'treant_elder', name: 'エルダートレント', kaomoji: '(木益木)', zone: 'forest', lv: 14, hp: 360, atk: 44, def: 22, exp: 95, gold: 80, color: 0x15803d, scale: 1.35, drops: ['crystal_mana'] },
    { id: 'boss_forest_guardian', name: '【BOSS】森の守護神獣', kaomoji: '(🌿▼皿▼🌿)', zone: 'forest', lv: 18, hp: 1650, atk: 78, def: 34, exp: 520, gold: 600, color: 0x10b981, scale: 2.3, isBoss: true, drops: ['ore_iron', 'crystal_mana'] },

    // 地下洞窟
    { id: 'bat_crystal', name: 'クリスタルバット', kaomoji: '(/^o^\\)', zone: 'cave', lv: 20, hp: 540, atk: 72, def: 28, exp: 165, gold: 140, color: 0x38bdf8, scale: 1.05, drops: ['crystal_mana'] },
    { id: 'golem_iron', name: 'アイアンゴーレム', kaomoji: '[■_■]', zone: 'cave', lv: 25, hp: 880, atk: 96, def: 58, exp: 230, gold: 195, color: 0x94a3b8, scale: 1.45, drops: ['ore_iron', 'ore_mythril'] },
    { id: 'boss_crystal_dragon', name: '【BOSS】蒼晶洞窟竜', kaomoji: '(💎🔥益🔥💎)', zone: 'cave', lv: 30, hp: 4200, atk: 165, def: 82, exp: 1350, gold: 1500, color: 0x06b6d4, scale: 2.5, isBoss: true, drops: ['ore_mythril', 'crystal_mana'] },

    // 古代砂漠
    { id: 'scorpion_sand', name: 'デススコーピオン', kaomoji: '(;ﾟ皿ﾟ)', zone: 'desert', lv: 35, hp: 1450, atk: 160, def: 75, exp: 420, gold: 360, color: 0xd97706, scale: 1.2, drops: ['ore_mythril'] },
    { id: 'mummy_ancient', name: '古代王の衛兵', kaomoji: '(x_x#)', zone: 'desert', lv: 42, hp: 2100, atk: 215, def: 105, exp: 580, gold: 490, color: 0xfef3c7, scale: 1.25, drops: ['scale_dragon'] },
    { id: 'boss_pharaoh', name: '【BOSS】砂漠の黄金ファラオ', kaomoji: '(👑☉皿☉👑)', zone: 'desert', lv: 48, hp: 10500, atk: 340, def: 160, exp: 3200, gold: 3800, color: 0xf59e0b, scale: 2.6, isBoss: true, drops: ['ore_mythril', 'scale_dragon'] },

    // 業火火山
    { id: 'imp_flame', name: 'フレイムインプ', kaomoji: '(🔥▽🔥)', zone: 'volcano', lv: 55, hp: 3600, atk: 360, def: 165, exp: 980, gold: 850, color: 0xf97316, scale: 1.15, drops: ['scale_dragon'] },
    { id: 'wyvern_magma', name: 'マグマワイバーン', kaomoji: '(🐉ﾟДﾟ)', zone: 'volcano', lv: 65, hp: 5400, atk: 480, def: 230, exp: 1420, gold: 1200, color: 0xdc2626, scale: 1.5, drops: ['scale_dragon', 'ore_orichalcum'] },
    { id: 'boss_inferno_dragon', name: '【BOSS】紅蓮獄炎竜王', kaomoji: '(🔥🐉益🐉🔥)', zone: 'volcano', lv: 72, hp: 28000, atk: 760, def: 350, exp: 8200, gold: 9500, color: 0xef4444, scale: 2.8, isBoss: true, drops: ['scale_dragon', 'ore_orichalcum'] },

    // 氷原
    { id: 'spirit_frost', name: 'フロストスピリット', kaomoji: '(❄️u❄️)', zone: 'snowfield', lv: 80, hp: 8500, atk: 740, def: 340, exp: 2200, gold: 1900, color: 0x7dd3fc, scale: 1.2, drops: ['ore_orichalcum'] },
    { id: 'yeti_blizzard', name: 'ブリザードイエティ', kaomoji: '(╬ﾟдﾟ)', zone: 'snowfield', lv: 92, hp: 12500, atk: 960, def: 460, exp: 3100, gold: 2700, color: 0xe0f2fe, scale: 1.6, drops: ['soul_star'] },
    { id: 'boss_ice_empress', name: '【BOSS】絶対零度の氷帝', kaomoji: '(❄️👑▼皿▼👑❄️)', zone: 'snowfield', lv: 100, hp: 68000, atk: 1480, def: 680, exp: 18500, gold: 21000, color: 0x38bdf8, scale: 2.8, isBoss: true, drops: ['ore_orichalcum', 'soul_star'] },

    // 天空神殿
    { id: 'knight_angel', name: '神殿の守護天使', kaomoji: '(👼•̀ω•́)', zone: 'sky', lv: 110, hp: 19000, atk: 1450, def: 690, exp: 4800, gold: 4200, color: 0xfef08a, scale: 1.3, drops: ['soul_star'] },
    { id: 'griffin_gold', name: '黄金グリフォン', kaomoji: '(🦅✧皿✧)', zone: 'sky', lv: 125, hp: 27000, atk: 1900, def: 880, exp: 6500, gold: 5800, color: 0xfacc15, scale: 1.55, drops: ['dragon_heart'] },
    { id: 'boss_seraphim', name: '【BOSS】熾天使セラフィム', kaomoji: '(✨👼👑👼✨)', zone: 'sky', lv: 135, hp: 150000, atk: 2950, def: 1350, exp: 42000, gold: 48000, color: 0xfde047, scale: 3.0, isBoss: true, drops: ['soul_star', 'dragon_heart'] },

    // 深淵次元
    { id: 'reaper_void', name: 'アビスリーパー', kaomoji: '(💀皿💀)', zone: 'abyss', lv: 150, hp: 45000, atk: 2800, def: 1300, exp: 11000, gold: 9800, color: 0xa855f7, scale: 1.4, drops: ['dragon_heart'] },
    { id: 'demon_lord', name: '深淵の混沌魔神', kaomoji: '(👿益👿)', zone: 'abyss', lv: 175, hp: 68000, atk: 3800, def: 1750, exp: 16500, gold: 14500, color: 0x7e22ce, scale: 1.7, drops: ['genesis_core'] },
    { id: 'boss_omega_creator', name: '【BOSS】創世神オメガ', kaomoji: '(🌌👑👁️益👁️👑🌌)', zone: 'abyss', lv: 200, hp: 380000, atk: 6200, def: 2800, exp: 120000, gold: 150000, color: 0xf43f5e, scale: 3.3, isBoss: true, drops: ['dragon_heart', 'genesis_core'] }
]);

// =========================================================================
// 3. 武器定義（全14種：魔道士時は自動で表名称・3Dが「杖」へ変化）
// =========================================================================
const WEAPONS = createHybridRegistry([
    { id: 'wpn_wood', name: '木の剣', atk: 8, cost: 0, reqLv: 1, icon: '🗡️', desc: '冒険の始まりに支給される木製の剣' },
    { id: 'wpn_copper', name: '銅の剣', atk: 24, cost: 150, reqLv: 3, icon: '🗡️', materials: { ore_copper: 2 }, desc: '鍛えられた青銅の剣' },
    { id: 'wpn_dagger', name: '疾風の短剣', atk: 42, cost: 380, reqLv: 6, icon: '🗡️', materials: { ore_copper: 4, fur_beast: 2 }, desc: '素早い連撃が可能な軽量ダガー' },
    { id: 'wpn_iron', name: '鉄の剣', atk: 70, cost: 750, reqLv: 10, icon: '⚔️', materials: { ore_iron: 3 }, desc: '切れ味鋭い白鉄の長剣' },
    { id: 'wpn_axe', name: '重装バトルアックス', atk: 115, cost: 1500, reqLv: 15, icon: '🪓', materials: { ore_iron: 5, fur_beast: 3 }, desc: '重い一撃で敵の装甲を砕く戦斧' },
    { id: 'wpn_steel', name: '鋼の剣', atk: 175, cost: 2800, reqLv: 22, icon: '⚔️', materials: { ore_iron: 6, crystal_mana: 3 }, desc: '魔力を帯びた精霊鋼の剣' },
    { id: 'wpn_spear', name: '蒼水晶の聖槍', atk: 265, cost: 5200, reqLv: 30, icon: '🔱', materials: { crystal_mana: 6, ore_mythril: 2 }, desc: '結晶の魔力を宿した貫通の長槍' },
    { id: 'wpn_mythril', name: 'ミスリルソード', atk: 410, cost: 9800, reqLv: 40, icon: '✨', materials: { ore_mythril: 5, crystal_mana: 5 }, desc: '神銀ミスリルで打たれた聖なる剣' },
    { id: 'wpn_greatsword', name: '王家の大剣', atk: 640, cost: 18500, reqLv: 52, icon: '⚔️', materials: { ore_mythril: 8, scale_dragon: 2 }, desc: '古代王国の騎士団長が振るった大剣' },
    { id: 'wpn_dragon', name: 'ドラゴンソード', atk: 1050, cost: 36000, reqLv: 65, icon: '🔥', materials: { scale_dragon: 5, ore_mythril: 8 }, desc: '古竜の牙と鱗を宿す紅蓮の魔剣' },
    { id: 'wpn_orichalcum', name: 'オリハルコンの剣', atk: 2450, cost: 130000, reqLv: 90, icon: '🌟', materials: { ore_orichalcum: 6, soul_star: 3 }, desc: '神話の金属で造られた伝説の剣' },
    { id: 'wpn_holy', name: '天界の聖剣', atk: 4600, cost: 290000, reqLv: 115, icon: '👼', materials: { ore_orichalcum: 8, soul_star: 6, dragon_heart: 2 }, desc: '熾天使の祝福を受けた黄金の聖剣' },
    { id: 'wpn_genesis', name: '創世聖剣エクスカリバー', atk: 8800, cost: 680000, reqLv: 145, icon: '👑', materials: { ore_orichalcum: 12, soul_star: 10, genesis_core: 2 }, desc: '次元をも切り裂く究極の創世聖剣' },
    { id: 'wpn_omega', name: '神滅剣ラグナロク', atk: 16500, cost: 1500000, reqLv: 180, icon: '🌌', materials: { genesis_core: 6, dragon_heart: 8, soul_star: 15 }, desc: 'すべての理を超越した終焉の覇剣' }
]);

// =========================================================================
// 4. 防具定義（全12種）
// =========================================================================
const ARMORS = createHybridRegistry([
    { id: 'arm_cloth', name: '布の服', def: 4, hp: 25, cost: 0, reqLv: 1, icon: '👕', desc: '動きやすい普段着' },
    { id: 'arm_leather', name: '革の鎧', def: 15, hp: 90, cost: 150, reqLv: 3, icon: '🦺', materials: { fur_beast: 2 }, desc: '魔獣の革をなめした軽鎧' },
    { id: 'arm_copper', name: '青銅の胸当て', def: 28, hp: 170, cost: 400, reqLv: 6, icon: '🛡️', materials: { ore_copper: 4 }, desc: '基本的な衝撃を防ぐ青銅鎧' },
    { id: 'arm_iron', name: '鉄の鎧', def: 52, hp: 310, cost: 800, reqLv: 10, icon: '🛡️', materials: { ore_iron: 3 }, desc: '頑丈な鉄板で身を護る鎧' },
    { id: 'arm_steel', name: '鋼の重鎧', def: 125, hp: 740, cost: 2800, reqLv: 22, icon: '🛡️', materials: { ore_iron: 6, crystal_mana: 3 }, desc: '重厚な鋼鉄製の騎士鎧' },
    { id: 'arm_crystal', name: '蒼水晶の魔導ローブ', def: 210, hp: 1250, cost: 5600, reqLv: 30, icon: '🧥', materials: { crystal_mana: 6, ore_mythril: 2 }, desc: '魔力障壁を展開する結晶の法衣' },
    { id: 'arm_mythril', name: 'ミスリルメイル', def: 340, hp: 2100, cost: 10500, reqLv: 40, icon: '✨', materials: { ore_mythril: 5, crystal_mana: 5 }, desc: '軽さと強度を兼ね備えた神銀の鎧' },
    { id: 'arm_dragon', name: '竜鱗の鎧', def: 780, hp: 4600, cost: 38000, reqLv: 65, icon: '🔥', materials: { scale_dragon: 5, ore_mythril: 8 }, desc: 'あらゆる災厄を弾く古竜の鎧' },
    { id: 'arm_orichalcum', name: 'オリハルコンアーマー', def: 1850, hp: 11200, cost: 140000, reqLv: 90, icon: '🌟', materials: { ore_orichalcum: 6, soul_star: 3 }, desc: '星々の加護を受けた不滅の神鎧' },
    { id: 'arm_holy', name: '熾天使の聖衣', def: 3400, hp: 21000, cost: 310000, reqLv: 115, icon: '👼', materials: { ore_orichalcum: 8, soul_star: 6, dragon_heart: 2 }, desc: '神聖な光の結界を纏う天界の衣' },
    { id: 'arm_genesis', name: '創世神鎧イージス', def: 6500, hp: 40000, cost: 720000, reqLv: 145, icon: '👑', materials: { ore_orichalcum: 12, soul_star: 10, genesis_core: 2 }, desc: '全次元の攻撃を退ける究極神鎧' },
    { id: 'arm_omega', name: '終焉神装アヴァロン', def: 12500, hp: 78000, cost: 1600000, reqLv: 180, icon: '🌌', materials: { genesis_core: 6, dragon_heart: 8, soul_star: 15 }, desc: 'あらゆる概念攻撃を無効化する絶対神装' }
]);

// =========================================================================
// 5. 素材・アイテム・鍛冶レシピ定義
// =========================================================================
const MATERIALS = {
    ore_copper: { id: 'ore_copper', name: '銅鉱石', icon: '🪨', desc: '草原で採れる基本的な鉱石' },
    fur_beast: { id: 'fur_beast', name: '魔獣の毛皮', icon: '🧶', desc: '丈夫で加工しやすい魔獣の毛皮' },
    ore_iron: { id: 'ore_iron', name: '鉄鉱石', icon: '⛓️', desc: '武具の基礎となる良質な鉄鉱石' },
    crystal_mana: { id: 'crystal_mana', name: '魔力結晶', icon: '💎', desc: '純粋な魔力が結晶化した鉱物' },
    ore_mythril: { id: 'ore_mythril', name: 'ミスリル銀塊', icon: '🪙', desc: '魔力をよく通す伝説の銀金属' },
    scale_dragon: { id: 'scale_dragon', name: '古竜の逆鱗', icon: '🐉', desc: '業火にも耐える古竜の硬質な鱗' },
    ore_orichalcum: { id: 'ore_orichalcum', name: 'オリハルコン', icon: '🌟', desc: '神代の遺跡から採掘される超金属' },
    soul_star: { id: 'soul_star', name: '創世の星屑', icon: '✨', desc: '星々の輝きを封じ込めた神聖な結晶' },
    dragon_heart: { id: 'dragon_heart', name: '竜王の心臓', icon: '❤️‍🔥', desc: '尽きぬ魔力を脈動させる古竜の核' },
    genesis_core: { id: 'genesis_core', name: '創世のコア', icon: '🌌', desc: '次元の理が凝縮された究極の秘宝' }
};

const ITEMS = createHybridRegistry([
    { id: 'pot_hp_s', name: '回復ポーション', type: 'heal_hp', value: 120, cost: 40, icon: '🧪', desc: 'HPを120回復する' },
    { id: 'pot_hp_m', name: 'ハイポーション', type: 'heal_hp', value: 650, cost: 180, icon: '🧪', desc: 'HPを650回復する' },
    { id: 'pot_hp_l', name: 'エリクサー', type: 'heal_full', value: 999999, cost: 900, icon: '🏺', desc: 'HPとMPを完全回復する' },
    { id: 'pot_mp_s', name: 'マナポーション', type: 'heal_mp', value: 80, cost: 60, icon: '💧', desc: 'MPを80回復する' },
    { id: 'pot_mp_m', name: 'ハイマナポーション', type: 'heal_mp', value: 400, cost: 260, icon: '💧', desc: 'MPを400回復する' }
]);

const SMITH_RECIPES = [...WEAPONS.filter(w => w.materials), ...ARMORS.filter(a => a.materials)];
const CRAFT_RECIPES = SMITH_RECIPES;
const RECIPES = SMITH_RECIPES;

// =========================================================================
// 6. スキル定義（全15種：全11系統を網羅＋Lv10/50/100で個別進化）
// =========================================================================
const SKILLS = createHybridRegistry([
    { id: 'sk_slash', name: 'クロススラッシュ', category: 'slash', type: 'attack', mpCost: 8, cd: 2.2, mult: 1.8, range: 4.8, icon: '⚔️', desc: '前方に鋭い光刃の斬撃を放つ' },
    { id: 'sk_slash_void', name: '次元断空斬', category: 'slash', type: 'attack', mpCost: 14, cd: 3.0, mult: 2.35, range: 5.5, icon: '🗡️', desc: '空間ごと敵を切り裂く高速真空斬' },
    { id: 'sk_fire', name: 'メテオフレア', category: 'fire', type: 'attack', mpCost: 14, cd: 3.4, mult: 2.3, range: 6.8, icon: '🔥', desc: '灼熱の火球・隕石で周囲を焼き尽くす' },
    { id: 'sk_fire_inferno', name: '紅蓮インフェルノ', category: 'fire', type: 'attack', mpCost: 22, cd: 4.2, mult: 2.95, range: 7.5, icon: '🌋', desc: '業火の隕石群を落とし敵を炎上させる' },
    { id: 'sk_nova_ice', name: 'アブソリュートゼロ', category: 'nova_ice', type: 'attack', mpCost: 16, cd: 3.8, mult: 2.2, range: 6.8, icon: '❄️', desc: '絶対零度の氷結陣で敵を凍てつかせる' },
    { id: 'sk_thunder', name: 'サンダーボルト', category: 'thunder', type: 'attack', mpCost: 15, cd: 3.3, mult: 2.25, range: 6.8, icon: '⚡', desc: '天空から紫電の雷槍を落とし麻痺させる' },
    { id: 'sk_thunder_god', name: '建御雷神の裁き', category: 'thunder', type: 'attack', mpCost: 24, cd: 4.4, mult: 3.0, range: 7.8, icon: '🌩️', desc: '無数の神雷を連続投下する超電磁砲撃' },
    { id: 'sk_wind', name: 'テンペストトルネード', category: 'wind', type: 'attack', mpCost: 13, cd: 3.0, mult: 2.0, range: 6.8, icon: '🌪️', desc: '暴風の竜巻を巻き起こし敵を吹き飛ばす' },
    { id: 'sk_beam', name: '極光レーザー砲', category: 'beam', type: 'attack', mpCost: 20, cd: 4.2, mult: 2.7, range: 11.5, icon: '🔦', desc: '直線上の敵を貫く高出力エネルギー砲' },
    { id: 'sk_beam_buster', name: 'メガ粒子バスター', category: 'beam', type: 'attack', mpCost: 28, cd: 5.0, mult: 3.35, range: 13.0, icon: '☄️', desc: '収束した超高密度光線で前方を蒸発させる' },
    { id: 'sk_void', name: 'アビスグラビティ', category: 'void', type: 'attack', mpCost: 18, cd: 4.0, mult: 2.4, range: 6.8, icon: '🌑', desc: '深淵の重力球で次元ごと敵を蝕み毒を与える' },
    { id: 'sk_support', name: 'ホーリーヒール', category: 'support', type: 'heal', mpCost: 18, cd: 4.8, mult: 1.5, range: 7.5, icon: '💖', desc: '聖なる光でHPを大回復し味方を祝福する' },
    { id: 'sk_aurora', name: '極光の聖域', category: 'aurora', type: 'buff', mpCost: 26, cd: 7.5, mult: 1.5, range: 8.0, icon: '🌈', desc: '味方の全能力を強化し継続回復する聖域を展開' },
    { id: 'sk_chabudai', name: '怒りのちゃぶ台返し', category: 'chabudai', type: 'attack', mpCost: 22, cd: 4.5, mult: 3.1, range: 7.8, icon: '┻━┻', desc: '巨大なちゃぶ台をひっくり返し衝撃波を放つ！' },
    { id: 'sk_bigbang', name: '創世ビッグバン', category: 'bigbang', type: 'attack', mpCost: 34, cd: 6.8, mult: 3.8, range: 9.8, icon: '💥', desc: '銀河規模の超新星爆発で周囲一帯を消滅させる！' }
]);

// =========================================================================
// 7. 職業・進化定義（全10種）
// =========================================================================
const EVOLUTIONS = createHybridRegistry([
    { id: 'novice', name: '見習い冒険者', reqLv: 1, atkMult: 1.0, defMult: 1.0, hpMult: 1.0, mpMult: 1.0, icon: '🗡️', desc: '無限の可能性を秘めた顔文字冒険者' },
    { id: 'warrior', name: '剛腕の剣豪', reqLv: 10, atkMult: 1.38, defMult: 1.22, hpMult: 1.32, mpMult: 0.95, icon: '⚔️', desc: '近接戦闘と斬撃スキルに秀でた戦士' },
    { id: 'mage', name: '星詠みの魔道士', reqLv: 10, atkMult: 1.48, defMult: 0.95, hpMult: 1.05, mpMult: 1.75, icon: '🪄', desc: '武器が杖になり通常攻撃が魔法弾に進化！' },
    { id: 'paladin', name: '聖光の守護騎士', reqLv: 30, atkMult: 1.58, defMult: 1.85, hpMult: 1.9, mpMult: 1.35, icon: '🛡️', desc: '鉄壁の防御と聖なる支援を操る騎士' },
    { id: 'dark_knight', name: '深淵の暗黒騎士', reqLv: 30, atkMult: 1.95, defMult: 1.3, hpMult: 1.55, mpMult: 1.4, icon: '🌑', desc: '闇の魔剣で敵を粉砕する高火力アタッカー' },
    { id: 'archmage', name: '創世の大賢者', reqLv: 50, atkMult: 2.25, defMult: 1.4, hpMult: 1.5, mpMult: 2.6, icon: '🔮', desc: 'あらゆる元素と奥義魔法を極めた大魔導師' },
    { id: 'dragon_knight', name: '紅蓮の竜騎士', reqLv: 70, atkMult: 2.55, defMult: 2.0, hpMult: 2.2, mpMult: 1.75, icon: '🐉', desc: '古竜の力を宿し戦場を駆ける天空の覇者' },
    { id: 'spirit_king', name: '万象の精霊王', reqLv: 90, atkMult: 2.85, defMult: 2.1, hpMult: 2.3, mpMult: 3.2, icon: '🌈', desc: '四大精霊と極光の聖域を自在に操る魔法王' },
    { id: 'god_slayer', name: '天元・顔文字神', reqLv: 120, atkMult: 3.4, defMult: 2.8, hpMult: 3.1, mpMult: 3.4, icon: '👑', desc: '全次元の頂点に君臨する究極進化形態' },
    { id: 'omega_sage', name: '創世神話・無限賢者', reqLv: 150, atkMult: 4.0, defMult: 3.2, hpMult: 3.6, mpMult: 4.5, icon: '🌌', desc: '宇宙の真理を解き明かした究極の魔導神' }
]);

// =========================================================================
// 8. ペット＆ペット装備定義
// =========================================================================
const PETS = createHybridRegistry([
    { id: 'pet_slime', name: 'ぷにぷにスライム', cost: 300, atk: 12, def: 8, hp: 60, color: 0x38bdf8, shape: 'slime', kaomoji: '(・ω・)', desc: 'いつもそばで跳ねる癒し系スライム' },
    { id: 'pet_cat', name: '黒猫ルナ', cost: 800, atk: 28, def: 15, hp: 110, color: 0x1e293b, shape: 'wolf', kaomoji: '(=^･ω･^=)', desc: '主人の後ろをトコトコ歩く俊敏な黒猫' },
    { id: 'pet_wolf', name: '疾風フェンリル', cost: 2200, atk: 65, def: 30, hp: 220, color: 0x94a3b8, shape: 'wolf', kaomoji: '(▼皿▼)', desc: '主人の敵に鋭い牙を剥く銀狼' },
    { id: 'pet_fairy', name: '光精霊ルミナ', cost: 6000, atk: 120, def: 85, hp: 480, color: 0xfde047, shape: 'fairy', kaomoji: '(★‿★)', desc: '聖なる光の粉を振りまく光の妖精' },
    { id: 'pet_golem', name: 'ミニクリスタルゴーレム', cost: 14000, atk: 210, def: 190, hp: 950, color: 0x06b6d4, shape: 'slime', kaomoji: '[✧_✧]', desc: '堅牢な結晶の体で主人を護る守護像' },
    { id: 'pet_dragon', name: '紅蓮ミニドラゴン', cost: 32000, atk: 420, def: 240, hp: 1650, color: 0xef4444, shape: 'dragon', kaomoji: '(🔥益🔥)', desc: '灼熱のブレスを吐く小さな竜王' },
    { id: 'pet_phoenix', name: '不死鳥フェニックス', cost: 85000, atk: 920, def: 560, hp: 3600, color: 0xf97316, shape: 'phoenix', kaomoji: '(✨▽✨)', desc: '黄金の翼で主人に不死の加護を与える神鳥' },
    { id: 'pet_omega', name: '創世の星霊オメガ', cost: 250000, atk: 2400, def: 1500, hp: 9500, color: 0xa855f7, shape: 'fairy', kaomoji: '(🌌★‿★🌌)', desc: '銀河の輝きを纏う究極の守護星霊' }
]);
// 職業・進化ごとの武器装備可否判定（game1.js 等から参照）
function canEquipWeaponForJob(weaponOrId, jobOrEvoId) {
    const wpn = (typeof weaponOrId === 'string' && typeof WEAPONS !== 'undefined')
        ? WEAPONS[weaponOrId]
        : weaponOrId;
    if (!wpn) return true;

    const jobId = String(typeof jobOrEvoId === 'object' ? (jobOrEvoId?.id || '') : (jobOrEvoId || 'novice'));
    if (Array.isArray(wpn.jobs) && wpn.jobs.length > 0) {
        return wpn.jobs.includes(jobId);
    }
    if (Array.isArray(wpn.allowedJobs) && wpn.allowedJobs.length > 0) {
        return wpn.allowedJobs.includes(jobId);
    }
    return true;
}

function canEquipArmorForJob(armorOrId, jobOrEvoId) {
    const arm = (typeof armorOrId === 'string' && typeof ARMORS !== 'undefined')
        ? ARMORS[armorOrId]
        : armorOrId;
    if (!arm) return true;

    const jobId = String(typeof jobOrEvoId === 'object' ? (jobOrEvoId?.id || '') : (jobOrEvoId || 'novice'));
    if (Array.isArray(arm.jobs) && arm.jobs.length > 0) {
        return arm.jobs.includes(jobId);
    }
    return true;
}
