'use strict';

// =========================================================================
// 顔文字ファンタジー3D マスターデータ定義 (data.js)
// =========================================================================

const MAX_PLAYER_LEVEL = 100;
const MAX_THREAT_RANK = 50;

function formatBigNum(n) {
    const num = Math.floor(Number(n) || 0);
    if (num < 10000) return String(num);
    const units = ['', '万', '億', '兆', '京', '垓'];
    let val = num;
    let u = 0;
    while (val >= 10000 && u < units.length - 1) {
        val /= 10000;
        u++;
    }
    return (val >= 100 ? Math.floor(val) : val.toFixed(1).replace(/\.0$/, '')) + units[u];
}

const MATERIALS = {
    slime_gel:   { id: 'slime_gel',   name: 'ぷるぷる雫',   icon: '💧', tier: 1 },
    ancient_sap: { id: 'ancient_sap', name: '古樹の琥珀',   icon: '🌿', tier: 2 },
    goblin_fang: { id: 'goblin_fang', name: '鬼神の鋭牙',   icon: '🦴', tier: 3 },
    fire_core:   { id: 'fire_core',   name: '紅蓮の炉心',   icon: '🔥', tier: 4 },
    ice_crystal: { id: 'ice_crystal', name: '永久凍晶',     icon: '❄️', tier: 5 },
    abyss_shard: { id: 'abyss_shard', name: '深淵の魔欠片', icon: '🔮', tier: 6 },
    void_star:   { id: 'void_star',   name: '創世の星屑',   icon: '🌟', tier: 7 }
};

// 下位素材5個＋G → 上位素材1個への錬金レシピ
const MATERIAL_ALCHEMY = [
    { from: 'slime_gel',   to: 'ancient_sap', count: 5, gold: 120 },
    { from: 'ancient_sap', to: 'goblin_fang', count: 5, gold: 300 },
    { from: 'goblin_fang', to: 'fire_core',   count: 5, gold: 750 },
    { from: 'fire_core',   to: 'ice_crystal', count: 5, gold: 1800 },
    { from: 'ice_crystal', to: 'abyss_shard', count: 5, gold: 4500 },
    { from: 'abyss_shard', to: 'void_star',   count: 5, gold: 12000 }
];

// 武器精錬（+1ごと）に必要なゴールドと素材
function getWeaponEnhanceRequirement(enh) {
    const gold = Math.round(160 * Math.pow(1.34, enh));
    const mats = {};
    if (enh < 3) {
        mats.slime_gel = 2 + enh;
    } else if (enh < 6) {
        mats.slime_gel = 3;
        mats.ancient_sap = 2 + (enh - 3);
    } else if (enh < 10) {
        mats.ancient_sap = 3;
        mats.goblin_fang = 2 + (enh - 6);
    } else if (enh < 15) {
        mats.fire_core = 2 + Math.floor((enh - 10) / 2);
        mats.ice_crystal = 1 + Math.floor((enh - 10) / 2);
    } else {
        mats.abyss_shard = 2 + Math.floor((enh - 15) / 2);
        mats.void_star = 1 + Math.floor((enh - 15) / 3);
    }
    return { gold, mats };
}

// 防具精錬（+1ごと）に必要なゴールドと素材
function getArmorEnhanceRequirement(enh) {
    const gold = Math.round(150 * Math.pow(1.33, enh));
    const mats = {};
    if (enh < 3) {
        mats.slime_gel = 2 + enh;
    } else if (enh < 6) {
        mats.ancient_sap = 2 + (enh - 3);
    } else if (enh < 10) {
        mats.goblin_fang = 2 + (enh - 6);
        mats.fire_core = 1;
    } else if (enh < 15) {
        mats.ice_crystal = 2 + Math.floor((enh - 10) / 2);
        mats.abyss_shard = 1;
    } else {
        mats.abyss_shard = 2 + Math.floor((enh - 15) / 2);
        mats.void_star = 1 + Math.floor((enh - 15) / 3);
    }
    return { gold, mats };
}

// 装備エンチャント抽選プール
const ENCHANT_POOL = [
    { id: 'atk_pct',   label: '攻撃力 +15%',       stat: 'atkBonus',   val: 0.15 },
    { id: 'hp_pct',    label: '最大HP +20%',       stat: 'hpBonus',    val: 0.20 },
    { id: 'crit_rate', label: '会心率 +12%',       stat: 'critBonus',  val: 0.12 },
    { id: 'crit_dmg',  label: '会心ダメ +35%',     stat: 'critDmg',    val: 0.35 },
    { id: 'cd_red',    label: 'スキルCT短縮 +10%', stat: 'cdBonus',    val: 0.10 },
    { id: 'lifesteal', label: '攻撃時HP吸収 +4%',  stat: 'lifesteal',  val: 0.04 },
    { id: 'boss_dmg',  label: 'ボス特攻 +22%',     stat: 'bossDmg',    val: 0.22 },
    { id: 'reward_up', label: '獲得EXP/G +20%',    stat: 'rewardBonus',val: 0.20 }
];

// 頭パーツ（9種）
const COSMETICS = {
    none:          { id: 'none',          name: '頭パーツなし',       icon: '✨', desc: 'スッキリ標準スタイル', costGold: 0, costMat: {} },
    sprout:        { id: 'sprout',        name: '元気なふたば',       icon: '🌱', desc: '頭の上に可愛い双葉が揺れる', costGold: 150, costMat: { slime_gel: 3 } },
    cat_ears:      { id: 'cat_ears',      name: 'ネコミミ',           icon: '🐱', desc: 'ぴょこんと可愛い猫耳', costGold: 450, costMat: { slime_gel: 5, ancient_sap: 2 } },
    bunny_ears:    { id: 'bunny_ears',    name: 'ウサミミ',           icon: '🐰', desc: '長いぴょんぴょんウサギ耳', costGold: 750, costMat: { ancient_sap: 5, goblin_fang: 2 } },
    fox_ears:      { id: 'fox_ears',      name: 'お稲荷キツネ耳',     icon: '🦊', desc: '黄金色の大きなキツネ耳', costGold: 1500, costMat: { goblin_fang: 5, fire_core: 2 } },
    cat_headphone: { id: 'cat_headphone', name: '猫耳ヘッドホン',     icon: '🎧', desc: 'ネオン発光するサイバー猫耳', costGold: 2800, costMat: { fire_core: 4, ice_crystal: 3 } },
    witch_hat:     { id: 'witch_hat',     name: '星導の三角魔法帽',   icon: '🧙', desc: '星の飾りがついたとんがり帽子', costGold: 4200, costMat: { ice_crystal: 5, abyss_shard: 2 } },
    demon_horns:   { id: 'demon_horns',   name: '紅蓮の悪魔角',       icon: '😈', desc: '迫力ある双子の悪魔角', costGold: 7500, costMat: { fire_core: 5, abyss_shard: 5 } },
    angel_halo:    { id: 'angel_halo',    name: '熾天使の聖輪',       icon: '😇', desc: '頭上に浮かぶ黄金の光の輪', costGold: 11000, costMat: { ice_crystal: 6, void_star: 2 } },
    royal_crown:   { id: 'royal_crown',   name: '覇王の黄金クラウン', icon: '👑', desc: 'ルビーが輝く王者の冠', costGold: 18000, costMat: { abyss_shard: 7, void_star: 4 } }
};

// 背中パーツ（6種：頭パーツと同時装着OK！）
const BACK_COSMETICS = {
    back_none:   { id: 'back_none',   name: '背中パーツなし',     icon: '➖', desc: '装備の標準マント表示', costGold: 0, costMat: {} },
    cat_tail:    { id: 'cat_tail',    name: 'ゆらゆら猫しっぽ',   icon: '🐈', desc: '体色とお揃いのしなやかな猫尾', costGold: 400, costMat: { slime_gel: 4, ancient_sap: 2 } },
    fox_tails:   { id: 'fox_tails',   name: 'もふもふ九尾の尾',   icon: '🦊', desc: '白銀の穂先が輝く豪華な狐尾', costGold: 2200, costMat: { goblin_fang: 5, fire_core: 3 } },
    hero_cape:   { id: 'hero_cape',   name: '紅蓮の英雄マント',   icon: '🦸', desc: '金縁が輝く勇者のロングマント', costGold: 3800, costMat: { fire_core: 5, ice_crystal: 3 } },
    demon_wings: { id: 'demon_wings', name: '漆黒の堕天使翼',     icon: '🦇', desc: '闇の魔力を纏う悪魔の翼', costGold: 8500, costMat: { ice_crystal: 6, abyss_shard: 5 } },
    angel_wings: { id: 'angel_wings', name: '純白のセラフィム翼', icon: '🕊️', desc: '神々しく広がる純白の天使翼', costGold: 13000, costMat: { abyss_shard: 6, void_star: 3 } },
    flame_aura:  { id: 'flame_aura',  name: '創世の輪光オーラ',   icon: '🌟', desc: '背後に回転する神聖な光輪リング', costGold: 22000, costMat: { abyss_shard: 8, void_star: 5 } }
};

// キャラクター体色プリセット
const BODY_COLOR_PRESETS = [
    { name: '職業デフォルト', hex: '' },
    { name: 'スカイブルー',   hex: '#38bdf8' },
    { name: 'サクラピンク',   hex: '#f472b6' },
    { name: 'エメラルド',     hex: '#10b981' },
    { name: 'サンシャイン',   hex: '#facc15' },
    { name: 'クリムゾン',     hex: '#f43f5e' },
    { name: 'バイオレット',   hex: '#a855f7' },
    { name: 'ピュアホワイト', hex: '#f8fafc' },
    { name: 'シャドウダーク', hex: '#334155' },
    { name: 'ミントシアン',   hex: '#2dd4bf' },
    { name: 'サンセット橙',   hex: '#fb923c' },
    { name: 'ロイヤル紺',     hex: '#3b82f6' }
];

// 顔モニター背景色プリセット
const FACE_BG_PRESETS = [
    { name: 'ディープブルー', hex: '#073b66' },
    { name: '漆黒ナイト',     hex: '#090d16' },
    { name: 'ローズピンク',   hex: '#831843' },
    { name: 'フォレスト緑',   hex: '#064e3b' },
    { name: 'ロイヤル紫',     hex: '#4c1d95' },
    { name: 'クリムゾン赤',   hex: '#7f1d1d' },
    { name: 'クリーム白',     hex: '#f8fafc' }
];

// 体型サイズ設定
const BODY_SCALE_PRESETS = [
    { id: 'chibi', name: '🐣 ちびサイズ', scale: 0.84 },
    { id: 'normal', name: '🧍 標準サイズ', scale: 1.0 },
    { id: 'tall',  name: '巨人 ビッグ',   scale: 1.18 }
];

// 武器データ（剣・物理系 ＋ 魔道士系専用の杖）
const WEAPONS = {
    wpn_wood:         { id: 'wpn_wood',         category: 'sword', name: '初心者の木の剣',       icon: '🗡️', atk: 12,  mag: 1.0,  shape: 'wood',   bladeColor: 0xb45309, glowColor: 0x38bdf8, costGold: 0,      costMat: {} },
    wpn_iron:         { id: 'wpn_iron',         category: 'sword', name: '鋼鉄のブロード',       icon: '⚔️', atk: 34,  mag: 1.15, shape: 'broad',  bladeColor: 0xe2e8f0, glowColor: 0x60a5fa, costGold: 280,    costMat: { slime_gel: 4 } },
    wpn_forest:       { id: 'wpn_forest',       category: 'sword', name: '翡翠の精霊大剣',       icon: '🌿', atk: 78,  mag: 1.35, shape: 'broad',  bladeColor: 0x34d399, glowColor: 0x10b981, costGold: 950,    costMat: { ancient_sap: 5 } },
    wpn_flame:        { id: 'wpn_flame',        category: 'sword', name: '紅蓮の業火魔剣',       icon: '🔥', atk: 175, mag: 1.65, shape: 'flame',  bladeColor: 0xf97316, glowColor: 0xef4444, costGold: 3200,   costMat: { goblin_fang: 6, fire_core: 3 } },
    wpn_scythe:       { id: 'wpn_scythe',       category: 'sword', name: '氷獄の死神大鎌',       icon: '❄️', atk: 380, mag: 2.05, shape: 'scythe', bladeColor: 0x7dd3fc, glowColor: 0x38bdf8, costGold: 9500,   costMat: { fire_core: 6, ice_crystal: 5 } },
    wpn_abyss:        { id: 'wpn_abyss',        category: 'sword', name: '深淵の双魔刃',         icon: '🔮', atk: 820, mag: 2.55, shape: 'abyss',  bladeColor: 0xc084fc, glowColor: 0xd946ef, costGold: 26000,  costMat: { ice_crystal: 8, abyss_shard: 6 } },
    wpn_omega:        { id: 'wpn_omega',        category: 'sword', name: '創世神剣オメガ',       icon: '🌟', atk: 1850,mag: 3.30, shape: 'omega',  bladeColor: 0xfde047, glowColor: 0xf59e0b, costGold: 75000,  costMat: { abyss_shard: 10, void_star: 6 } },
    wpn_genesis:      { id: 'wpn_genesis',      category: 'sword', name: '終焉天帝ラグナロク',   icon: '👑', atk: 4200,mag: 4.40, shape: 'god',    bladeColor: 0xffffff, glowColor: 0xf43f5e, costGold: 220000, costMat: { void_star: 15 } },

    // 魔道士系専用「杖」シリーズ（通常攻撃が遠距離魔法判定になる）
    staff_wood:       { id: 'staff_wood',       category: 'staff', name: '魔導師の木の杖',       icon: '🪄', atk: 14,  mag: 1.25, shape: 'staff',  bladeColor: 0xa16207, glowColor: 0xc084fc, costGold: 0,      costMat: {} },
    staff_apprentice: { id: 'staff_apprentice', category: 'staff', name: '星詠みの水晶杖',       icon: '🔮', atk: 38,  mag: 1.45, shape: 'staff',  bladeColor: 0x38bdf8, glowColor: 0x818cf8, costGold: 280,    costMat: { slime_gel: 4 } },
    staff_forest:     { id: 'staff_forest',     category: 'staff', name: '世界樹の翡翠杖',       icon: '🌿', atk: 86,  mag: 1.70, shape: 'staff',  bladeColor: 0x10b981, glowColor: 0x34d399, costGold: 950,    costMat: { ancient_sap: 5 } },
    staff_flame:      { id: 'staff_flame',      category: 'staff', name: '紅蓮業火の宝杖',       icon: '🔥', atk: 190, mag: 2.10, shape: 'staff',  bladeColor: 0xf97316, glowColor: 0xf43f5e, costGold: 3200,   costMat: { goblin_fang: 6, fire_core: 3 } },
    staff_glacier:    { id: 'staff_glacier',    category: 'staff', name: '永久凍土の氷晶杖',     icon: '❄️', atk: 410, mag: 2.55, shape: 'staff',  bladeColor: 0x7dd3fc, glowColor: 0x38bdf8, costGold: 9500,   costMat: { fire_core: 6, ice_crystal: 5 } },
    staff_abyss:      { id: 'staff_abyss',      category: 'staff', name: '深淵大賢者の魔杖',     icon: '🌙', atk: 890, mag: 3.15, shape: 'staff',  bladeColor: 0xc084fc, glowColor: 0xe879f9, costGold: 26000,  costMat: { ice_crystal: 8, abyss_shard: 6 } },
    staff_omega:      { id: 'staff_omega',      category: 'staff', name: '創世星神の天球杖',     icon: '🌟', atk: 1980,mag: 4.00, shape: 'staff',  bladeColor: 0xfde047, glowColor: 0xf59e0b, costGold: 75000,  costMat: { abyss_shard: 10, void_star: 6 } },
    staff_genesis:    { id: 'staff_genesis',    category: 'staff', name: '終焉魔帝アストラル杖', icon: '👑', atk: 4500,mag: 5.20, shape: 'staff',  bladeColor: 0xf472b6, glowColor: 0xfde047, costGold: 220000, costMat: { void_star: 15 } }
};

// 役職ごとの武器装備制限（魔道士系は杖のみ装備可能）
function canEquipWeaponForJob(wpn, evo) {
    if (!wpn || !evo) return true;
    if (evo.isMageJob) {
        return wpn.category === 'staff';
    }
    if (evo.id === 'novice' || evo.id === 'myth_god') {
        return true;
    }
    return wpn.category !== 'staff';
}

const ARMORS = {
    arm_cloth:   { id: 'arm_cloth',   name: '旅人の布服',       icon: '👕', hp: 40,   mp: 20,  def: 0.04, tierLook: 0, plateColor: 0x475569, trimColor: 0x94a3b8, capeColor: 0x334155, costGold: 0,     costMat: {} },
    arm_leather: { id: 'arm_leather', name: '冒険者の革鎧',     icon: '🦺', hp: 130,  mp: 45,  def: 0.10, tierLook: 1, plateColor: 0x92400e, trimColor: 0xfbbf24, capeColor: 0x065f46, costGold: 260,   costMat: { slime_gel: 4 } },
    arm_knight:  { id: 'arm_knight',  name: '白銀の騎士重鎧',   icon: '🛡️', hp: 340,  mp: 90,  def: 0.18, tierLook: 2, plateColor: 0xcbd5e1, trimColor: 0x38bdf8, capeColor: 0x1d4ed8, costGold: 900,   costMat: { ancient_sap: 5 } },
    arm_crimson: { id: 'arm_crimson', name: '紅蓮竜鱗の戦鎧',   icon: '🐉', hp: 850,  mp: 180, def: 0.26, tierLook: 3, plateColor: 0xbe123c, trimColor: 0xfde047, capeColor: 0x7f1d1d, costGold: 3000,  costMat: { goblin_fang: 6, fire_core: 3 } },
    arm_glacier: { id: 'arm_glacier', name: '氷晶の聖騎士鎧',   icon: '❄️', hp: 2100, mp: 360, def: 0.34, tierLook: 4, plateColor: 0x0284c7, trimColor: 0xe0f2fe, capeColor: 0x0c4a6e, costGold: 9000,  costMat: { fire_core: 6, ice_crystal: 5 } },
    arm_abyss:   { id: 'arm_abyss',   name: '深淵魔王の冥鎧',   icon: '😈', hp: 5200, mp: 720, def: 0.42, tierLook: 4, plateColor: 0x581c87, trimColor: 0xf0abfc, capeColor: 0x2e1065, costGold: 25000, costMat: { ice_crystal: 8, abyss_shard: 6 } },
    arm_celest:  { id: 'arm_celest',  name: '創世神装セラフィム',icon: '👼', hp: 13000,mp: 1500,def: 0.50, tierLook: 5, plateColor: 0xfef08a, trimColor: 0xf43f5e, capeColor: 0xffffff, costGold: 72000, costMat: { abyss_shard: 10, void_star: 6 } }
};

const ACCESSORIES = {
    acc_none:       { id: 'acc_none',       name: 'なし',             icon: '➖', desc: '未装備', atkBonus: 0, hpBonus: 0, costGold: 0, costMat: {} },
    acc_vamp_ring:  { id: 'acc_vamp_ring',  name: '吸血鬼の紅指輪',   icon: '💍', desc: '与ダメージの5%HP吸収・攻撃+12%', atkBonus: 0.12, hpBonus: 0.10, lifesteal: 0.05, costGold: 1500, costMat: { goblin_fang: 5 } },
    acc_twin_charm: { id: 'acc_twin_charm', name: '双子星の魔導符',   icon: '♊', desc: '28%の確率でスキルが2連発！', atkBonus: 0.15, hpBonus: 0.15, doubleCast: 0.28, costGold: 6500, costMat: { fire_core: 5, ice_crystal: 4 } },
    acc_chrono_orb: { id: 'acc_chrono_orb', name: '時空砂時計の宝珠', icon: '⏳', desc: 'スキルCT短縮+18%・MP回復+50%', atkBonus: 0.18, hpBonus: 0.20, cdBonus: 0.18, costGold: 18000, costMat: { ice_crystal: 6, abyss_shard: 5 } },
    acc_god_crown:  { id: 'acc_god_crown',  name: '覇王神の黄金勲章', icon: '🏅', desc: 'ボス特攻+35%・報酬+30%・全能力+25%', atkBonus: 0.25, hpBonus: 0.25, bossDmg: 0.35, rewardBonus: 0.30, costGold: 55000, costMat: { abyss_shard: 8, void_star: 5 } }
};

// 役職データ（ゴールド消費で転職・上位進化が可能）
const EVOLUTIONS = {
    novice:     { id: 'novice',     name: '見習い冒険者',     tier: 0, reqTier: 0, reqLv: 1,  costGold: 0,      kaomoji: '(´・ω・`)',         color: '#38bdf8', hexColor: 0x38bdf8, hpMult: 1.0,  mpMult: 1.0,  atkMult: 1.0,  spdMult: 1.0,  bonusText: '基本職（剣・杖どちらも装備可）', reqMat: {} },
    warrior:    { id: 'warrior',    name: '重装の剣士',       tier: 1, reqTier: 0, reqLv: 10, costGold: 500,    kaomoji: '(｀・ω・´)⚔️',     color: '#fb7185', hexColor: 0xf43f5e, hpMult: 1.35, mpMult: 1.1,  atkMult: 1.35, spdMult: 1.05, bonusText: 'HP+35% / 攻撃+35%【剣専用】', reqMat: { slime_gel: 5 } },
    mage:       { id: 'mage',       name: '星詠みの魔導士',   tier: 1, reqTier: 0, reqLv: 10, costGold: 500,    isMageJob: true, kaomoji: '(☆ω☆)🪄',         color: '#c084fc', hexColor: 0xa855f7, hpMult: 1.15, mpMult: 1.8,  atkMult: 1.40, spdMult: 1.05, bonusText: 'MP+80% / 魔力+40%【杖専用・通常攻撃魔法】', reqMat: { slime_gel: 5 } },
    paladin:    { id: 'paladin',    name: '聖光の守護騎士',   tier: 2, reqTier: 1, reqLv: 25, costGold: 2500,   kaomoji: '꧁(｀・ω・´)꧂',     color: '#fde047', hexColor: 0xeab308, hpMult: 1.85, mpMult: 1.4,  atkMult: 1.75, spdMult: 1.10, bonusText: 'HP+85% / 攻撃+75%【剣専用】', reqMat: { ancient_sap: 6, goblin_fang: 4 } },
    archmage:   { id: 'archmage',   name: '深淵の大賢者',     tier: 2, reqTier: 1, reqLv: 25, costGold: 2500,   isMageJob: true, kaomoji: '✧(✪ω✪)✧',         color: '#38bdf8', hexColor: 0x0284c7, hpMult: 1.45, mpMult: 2.6,  atkMult: 1.95, spdMult: 1.12, bonusText: 'MP+160% / 魔力+95%【杖専用・通常攻撃魔法】', reqMat: { ancient_sap: 6, goblin_fang: 4 } },
    dragonlord: { id: 'dragonlord', name: '紅蓮の竜騎士王',   tier: 3, reqTier: 2, reqLv: 40, costGold: 12000,  kaomoji: '🔥꧁(╬◣д◢)꧂🔥',   color: '#f97316', hexColor: 0xea580c, hpMult: 2.50, mpMult: 1.9,  atkMult: 2.55, spdMult: 1.18, bonusText: 'HP+150% / 攻撃+155%【剣専用】', reqMat: { fire_core: 6, ice_crystal: 4 } },
    celestial:  { id: 'celestial',  name: '星界の天導神官',   tier: 3, reqTier: 2, reqLv: 40, costGold: 12000,  isMageJob: true, kaomoji: '👼✨(*˘︶˘*)✨',    color: '#34d399', hexColor: 0x10b981, hpMult: 2.10, mpMult: 3.4,  atkMult: 2.75, spdMult: 1.20, bonusText: 'MP+240% / 魔力+175%【杖専用・通常攻撃魔法】', reqMat: { fire_core: 6, ice_crystal: 4 } },
    ex_valkyrie:{ id: 'ex_valkyrie',name: '戦乙女ヴァルキリー',tier: 4, reqTier: 3, isExJob: true, reqLv: 55, costGold: 45000, kaomoji: '⚔️👼꧁(✧ω✧)꧂', color: '#f472b6', hexColor: 0xec4899, hpMult: 3.4, mpMult: 2.8, atkMult: 3.6, spdMult: 1.25, exCritBonus: 0.15, bonusText: '全能力激増＆会心率+15%【剣専用】', reqMat: { ice_crystal: 8, abyss_shard: 6 } },
    ex_chronos: { id: 'ex_chronos', name: '時空魔帝クロノス', tier: 4, reqTier: 3, isExJob: true, isMageJob: true, reqLv: 55, costGold: 45000, kaomoji: '⏳🌌(★ω★)🌌',   color: '#818cf8', hexColor: 0x6366f1, hpMult: 3.0, mpMult: 4.5, atkMult: 3.9, spdMult: 1.28, exCdBonus: 0.15, bonusText: 'MP超絶＆CT短縮+15%【杖専用・通常攻撃魔法】', reqMat: { ice_crystal: 8, abyss_shard: 6 } },
    myth_god:   { id: 'myth_god',   name: '創世神オメガ・顔文字',tier: 5, reqTier: 4, isExJob: true, reqLv: 80, costGold: 150000, kaomoji: '👑🌟꧁(≧▽≦)꧂🌟👑', color: '#fde047', hexColor: 0xf59e0b, hpMult: 5.2, mpMult: 6.5, atkMult: 5.8, spdMult: 1.35, exCritBonus: 0.25, exCdBonus: 0.20, exDefBonus: 0.12, bonusText: '神話級全ステータス＆全武器装備可', reqMat: { abyss_shard: 12, void_star: 8 } }
};

const SKILLS = {
    slash_heavy:  { id: 'slash_heavy',  name: '烈空斬',         icon: '⚔️', type: 'SINGLE_DMG', baseMp: 8,  cd: 2.2, baseMult: 2.2,  desc: '前方に蒼い三日月真空波を放つ単体強撃' },
    spin_whirl:   { id: 'spin_whirl',   name: '旋風円舞',       icon: '🌪️', type: 'AOE_DMG',    baseMp: 14, cd: 3.8, baseMult: 1.85, radius: 6.2, desc: '周囲の敵全てを切り裂く竜巻範囲攻撃' },
    bash_shield:  { id: 'bash_shield',  name: '破邪の衝撃',     icon: '🛡️', type: 'INTERRUPT',  baseMp: 12, cd: 4.5, baseMult: 1.9,  desc: 'ボス詠唱を中断し気絶させる衝撃波' },
    heal_light:   { id: 'heal_light',   name: '聖光の癒し',     icon: '💚', type: 'HEAL',       baseMp: 16, cd: 5.5, isSupport: true, desc: 'HPを即座に大回復し状態異常を解除' },
    meteor_star:  { id: 'meteor_star',  name: '星屑メテオ',     icon: '☄️', type: 'AOE_DMG',    baseMp: 26, cd: 6.5, baseMult: 3.1,  radius: 7.2, desc: '巨大隕石を落として広範囲を焼き尽くす' },
    frost_nova:   { id: 'frost_nova',   name: '絶対零度ノヴァ', icon: '❄️', type: 'AOE_SLOW',   baseMp: 22, cd: 6.0, baseMult: 2.3,  radius: 6.8, desc: '12本の氷柱で広範囲攻撃＋移動速度低下' },
    thunder_bolt: { id: 'thunder_bolt', name: '天罰の紫電',     icon: '⚡', type: 'THUNDER',    baseMp: 20, cd: 4.2, baseMult: 3.3,  desc: '上空から稲妻を落として単体に超大ダメージ' },
    vamp_drain:   { id: 'vamp_drain',   name: '深淵ドレイン',   icon: '🩸', type: 'DRAIN',      baseMp: 18, cd: 5.0, baseMult: 2.4,  desc: '敵の生命力を吸収して自分のHPを回復' },
    aegis_wall:   { id: 'aegis_wall',   name: '神域イージス',   icon: '🔰', type: 'DEF_BUFF',   baseMp: 24, cd: 9.0, isSupport: true, desc: '無敵バリア＆被ダメージ大幅軽減バフ' },
    warcry_fury:  { id: 'warcry_fury',  name: '覇王の咆哮',     icon: '🔥', type: 'ATK_BUFF',   baseMp: 22, cd: 8.5, isSupport: true, desc: '闘気を爆発させ攻撃力を大幅に引き上げる' },
    phoenix_dive: { id: 'phoenix_dive', name: '不死鳥の烈火',   icon: '🦅', type: 'AOE_BURN',   baseMp: 32, cd: 7.5, baseMult: 3.6,  radius: 7.5, desc: '不死鳥が急降下し広範囲に炎上継続ダメージ' },
    void_blade:   { id: 'void_blade',   name: '虚無次元斬',     icon: '🌌', type: 'SINGLE_DMG', baseMp: 30, cd: 5.2, baseMult: 4.4,  desc: '空間ごと切り裂く次元の裂け目必殺斬撃' },
    genesis_nova: { id: 'genesis_nova', name: '創世ビッグバン', icon: '💥', type: 'AOE_DMG',    baseMp: 45, cd: 9.5, baseMult: 5.2,  radius: 8.8, desc: '特異点収束から超新星爆発を起こす究極奥義' },
    holy_aurora:  { id: 'holy_aurora',  name: '極光の聖域',     icon: '🌈', type: 'HEAL_MP',    baseMp: 28, cd: 8.0, isSupport: true, desc: '虹色オーロラでHPとMPを同時に大幅回復' }
};

// MP消費5倍 ＋ スキルレベル1上がるごとに消費MP+10
function getSkillMpCost(sk, lv = 1) {
    const base = sk.baseMp || sk.mp || 10;
    return base * 5 + (Math.max(1, lv) - 1) * 10;
}

function getSkillEffectStats(sk, lv, st) {
    const mult = Number(((sk.baseMult || 1) * (1 + (lv - 1) * 0.16) * (st ? st.treeSkillPowerMult : 1)).toFixed(2));
    if (sk.type === 'HEAL') {
        const hpPct = Math.min(0.95, (0.32 + (lv - 1) * 0.04) * (st ? st.treeHealPowerMult : 1));
        return { hpPct, summary: `HP ${Math.round(hpPct * 100)}% 回復` };
    }
    if (sk.type === 'HEAL_MP') {
        const hpPct = Math.min(0.95, (0.35 + (lv - 1) * 0.04) * (st ? st.treeHealPowerMult : 1));
        const mpPct = Math.min(0.85, 0.28 + (lv - 1) * 0.03);
        return { hpPct, mpPct, summary: `HP ${Math.round(hpPct * 100)}% / MP ${Math.round(mpPct * 100)}% 回復` };
    }
    if (sk.type === 'INTERRUPT') {
        const stunDur = Number((2.0 + (lv - 1) * 0.25).toFixed(1));
        return { mult, stunDur, summary: `倍率 x${mult} / 詠唱中断＋気絶 ${stunDur}秒` };
    }
    if (sk.type === 'DRAIN') {
        const drainRate = Math.min(0.80, 0.35 + (lv - 1) * 0.03);
        return { mult, drainRate, summary: `倍率 x${mult} / 与ダメの ${Math.round(drainRate * 100)}% HP吸収` };
    }
    if (sk.type === 'AOE_SLOW') {
        const slowDur = Number((3.5 + (lv - 1) * 0.3).toFixed(1));
        return { mult, slowDur, slowFactor: 0.45, summary: `範囲倍率 x${mult} / 鈍足 ${slowDur}秒` };
    }
    if (sk.type === 'DEF_BUFF') {
        const defBonus = Math.min(0.45, 0.18 + (lv - 1) * 0.02);
        const duration = Number((6.0 + (lv - 1) * 0.5).toFixed(1));
        const invuln = Number((1.2 + (lv - 1) * 0.12).toFixed(1));
        return { defBonus, duration, invuln, summary: `無敵${invuln}s ＋ 軽減+${Math.round(defBonus * 100)}% (${duration}s)` };
    }
    if (sk.type === 'ATK_BUFF') {
        const atkBonus = 0.25 + (lv - 1) * 0.04;
        const duration = Number((7.0 + (lv - 1) * 0.5).toFixed(1));
        return { atkBonus, duration, summary: `攻撃力 +${Math.round(atkBonus * 100)}% (${duration}秒)` };
    }
    return { mult, summary: `ダメージ倍率 x${mult}` };
}

const SKILL_TREE_NODES = [
    { id: 't_might',   name: '剛力の極意', icon: '💪', maxLv: 15, desc: '物理・総合攻撃力 +6% / Lv' },
    { id: 't_arcana',  name: '魔導の深淵', icon: '🔮', maxLv: 15, desc: 'スキル魔力＆スキル威力 +8% / Lv' },
    { id: 't_vital',   name: '不屈の生命', icon: '❤️', maxLv: 15, desc: '最大HP +8% ＆ HP自然回復強化 / Lv' },
    { id: 't_crit',    name: '致命の一撃', icon: '💥', maxLv: 15, desc: '会心率 +5% ＆ 会心ダメージ +12% / Lv' },
    { id: 't_chant',   name: '高速詠唱',   icon: '⚡', maxLv: 12, desc: 'スキルCT短縮 +5% ＆ MP回復 +10% / Lv' },
    { id: 't_aegis',   name: '聖域の加護', icon: '🛡️', maxLv: 12, desc: '被ダメ軽減 +3% ＆ 回復スキル効果 +8% / Lv' },
    { id: 't_fortune', name: '黄金の幸運', icon: '💰', maxLv: 15, desc: '獲得EXP＆ゴールド +10% / Lv' },
    { id: 't_warlord', name: '覇王の器',   icon: '👑', maxLv: 10, desc: '全基礎ステータス +5% ＆ CT短縮 +3% / Lv' }
];

const PETS = {
    pet_slime:   { id: 'pet_slime',   name: 'ぷるぷる相棒スライム', kaomoji: '(・ω・)💧', color: 0x38bdf8, atkRatio: 0.35, healRatio: 0.06, costGold: 400,   costMat: { slime_gel: 5 }, desc: '一緒に戦って少しだけHPを癒やしてくれる' },
    pet_fox:     { id: 'pet_fox',     name: 'お稲荷キツネ精霊',     kaomoji: '🦊(^・ω・^)', color: 0xfbbf24, atkRatio: 0.55, healRatio: 0.08, mpRestore: 0.08, costGold: 2200,  costMat: { ancient_sap: 6, goblin_fang: 3 }, desc: '攻撃支援＋定期的にHPとMPを同時回復！' },
    pet_dragon:  { id: 'pet_dragon',  name: '紅蓮のちびドラゴン',   kaomoji: '🐉(｀炎ω炎´)', color: 0xf43f5e, atkRatio: 0.95, healRatio: 0.10, costGold: 9500,  costMat: { fire_core: 6, ice_crystal: 4 }, desc: '強力なブレス弾で敵を焼き払うアタッカー相棒' },
    pet_seraph:  { id: 'pet_seraph',  name: '星界のミニ天使',       kaomoji: '👼(*˘︶˘*)✨', color: 0xfde047, atkRatio: 1.35, healRatio: 0.16, mpRestore: 0.15, costGold: 38000, costMat: { abyss_shard: 8, void_star: 4 }, desc: '超高火力支援＆HP/MP大回復の最強パートナー' }
};

const TITLES = {
    title_none:   { id: 'title_none',   name: '称号なし',         hp: 0,    atk: 0,    crit: 0,    reward: 0,    bonusText: 'ボーナスなし' },
    title_slayer: { id: 'title_slayer', name: '魔物ハンター',     hp: 0.08, atk: 0.10, crit: 0.03, reward: 0.05, bonusText: 'HP+8% / 攻撃+10% / 会心+3%' },
    title_boss:   { id: 'title_boss',   name: '巨獣討伐の英雄',   hp: 0.15, atk: 0.18, crit: 0.05, reward: 0.12, bonusText: 'HP+15% / 攻撃+18% / 報酬+12%' },
    title_tower:  { id: 'title_tower',  name: '試練の塔の制覇者', hp: 0.22, atk: 0.25, crit: 0.08, reward: 0.20, bonusText: 'HP+22% / 攻撃+25% / 会心+8% / 報酬+20%' },
    title_master: { id: 'title_master', name: '神域到達の超越者', hp: 0.35, atk: 0.40, crit: 0.12, reward: 0.35, bonusText: 'HP+35% / 攻撃+40% / 会心+12% / 報酬+35%' }
};

const ACHIEVEMENTS = [
    { id: 'ach_kill_30',  name: '駆け出し討伐隊',   desc: 'モンスターを累計30体討伐',   key: 'kills',          req: 30, rewardAp: 3,  rewardSp: 2, titleId: 'title_slayer' },
    { id: 'ach_boss_5',   name: 'ボスハンター',     desc: 'ボスモンスターを累計5体討伐', key: 'bossKills',      req: 5,  rewardAp: 5,  rewardSp: 3, titleId: 'title_boss' },
    { id: 'ach_tower_10', name: '試練の登頂者',     desc: '無限の試練の塔 第10階層到達', key: 'bestTowerFloor', req: 10, rewardAp: 8,  rewardSp: 4, titleId: 'title_tower' },
    { id: 'ach_lv_80',    name: '極限到達の冒険者', desc: 'プレイヤーLv.80に到達',       key: 'lv',             req: 80, rewardAp: 12, rewardSp: 6, titleId: 'title_master' }
];

const ZONES = {
    town: {
        id: 'town', stageNum: 0, name: '始まりの顔文字広場', recLv: 1, safe: true,
        skyColor: 0x0c4a6e, groundColor: 0x15803d,
        desc: 'HP・MPが高速回復する平和な拠点。中央のワープ陣から好きなステージへ出発しよう！',
        drops: [], monsters: []
    },
    forest: {
        id: 'forest', stageNum: 1, name: '木漏れ日のスライム草原', recLv: 1, safe: false,
        skyColor: 0x064e3b, groundColor: 0x166534,
        desc: '初心者に最適な穏やかな草原。スライムと森の精霊が棲む。',
        drops: ['slime_gel', 'ancient_sap'],
        monsters: [
            { name: 'ぷるぷるスライム', kaomoji: '(・ω・)', lv: 1, hp: 65, atk: 9, exp: 32, gold: 28, color: 0x38bdf8, scale: 1.0, count: 4, drop: 'slime_gel' },
            { name: '森の切り株ゴーレム', kaomoji: '【・皿・】', lv: 4, hp: 145, atk: 16, exp: 68, gold: 55, color: 0x22c55e, scale: 1.25, count: 2, drop: 'ancient_sap' },
            { name: 'キングスライム', kaomoji: '👑(｀・ω・´)👑', lv: 8, hp: 460, atk: 32, exp: 240, gold: 210, color: 0x0284c7, scale: 1.9, count: 1, isBoss: true, drop: 'ancient_sap' }
        ]
    },
    ruins: {
        id: 'ruins', stageNum: 2, name: '古代樹の遺跡回廊', recLv: 10, safe: false,
        skyColor: 0x1e1b4b, groundColor: 0x3f6212,
        desc: '古代の魔力が眠る遺跡。ゴブリン戦士と石像兵が徘徊する。',
        drops: ['ancient_sap', 'goblin_fang'],
        monsters: [
            { name: '遺跡ゴブリン', kaomoji: '(▼皿▼#)', lv: 11, hp: 340, atk: 34, exp: 145, gold: 120, color: 0x84cc16, scale: 1.1, count: 4, drop: 'goblin_fang' },
            { name: '古代ガーディアン', kaomoji: '【╬◣д◢】', lv: 15, hp: 680, atk: 52, exp: 290, gold: 240, color: 0xa855f7, scale: 1.4, count: 2, drop: 'ancient_sap' },
            { name: '遺跡の覇王オーガ', kaomoji: '👹꧁(╬◣皿◢)꧂', lv: 20, hp: 2100, atk: 95, exp: 950, gold: 820, color: 0xd946ef, scale: 2.1, count: 1, isBoss: true, drop: 'goblin_fang' }
        ]
    },
    volcano: {
        id: 'volcano', stageNum: 3, name: '紅蓮の灼熱火山', recLv: 22, safe: false,
        skyColor: 0x450a0a, groundColor: 0x7f1d1d,
        desc: '溶岩が噴き上げる灼熱地帯。炎の精霊と火竜が待ち受ける。',
        drops: ['goblin_fang', 'fire_core'],
        monsters: [
            { name: 'フレイムインプ', kaomoji: '🔥(｀皿´)🔥', lv: 23, hp: 1150, atk: 88, exp: 480, gold: 410, color: 0xf97316, scale: 1.15, count: 4, drop: 'fire_core' },
            { name: 'マグマゴーレム', kaomoji: '【🔥◣д◢🔥】', lv: 28, hp: 2400, atk: 135, exp: 960, gold: 800, color: 0xef4444, scale: 1.5, count: 2, drop: 'goblin_fang' },
            { name: '炎獄竜イグニス', kaomoji: '🐉꧁(╬◣д◢)꧂🔥', lv: 34, hp: 7800, atk: 240, exp: 3200, gold: 2800, color: 0xdc2626, scale: 2.25, count: 1, isBoss: true, drop: 'fire_core' }
        ]
    },
    glacier: {
        id: 'glacier', stageNum: 4, name: '永久凍土の氷結神殿', recLv: 36, safe: false,
        skyColor: 0x082f49, groundColor: 0x0369a1,
        desc: 'すべてが凍りつく極寒の神殿。強力な氷晶の魔獣が棲む。',
        drops: ['fire_core', 'ice_crystal'],
        monsters: [
            { name: 'フロストウルフ', kaomoji: '❄️(▼ω▼)❄️', lv: 37, hp: 3600, atk: 210, exp: 1500, gold: 1300, color: 0x38bdf8, scale: 1.2, count: 4, drop: 'ice_crystal' },
            { name: '氷結の重装騎士', kaomoji: '【❄️｀・ω・´】', lv: 42, hp: 7400, atk: 310, exp: 2900, gold: 2500, color: 0x7dd3fc, scale: 1.55, count: 2, drop: 'fire_core' },
            { name: '氷帝フェンリル', kaomoji: '🐺❄️꧁(╬◣д◢)꧂', lv: 48, hp: 24000, atk: 540, exp: 9500, gold: 8200, color: 0x0ea5e9, scale: 2.3, count: 1, isBoss: true, isRaidBoss: true, drop: 'ice_crystal' }
        ]
    },
    abyss: {
        id: 'abyss', stageNum: 5, name: '深淵の魔王城', recLv: 52, safe: false,
        skyColor: 0x1e0936, groundColor: 0x3b0764,
        desc: '闇の魔力が渦巻く魔王の居城。大技を放つレイドボスが君臨！',
        drops: ['ice_crystal', 'abyss_shard'],
        monsters: [
            { name: 'アビスデーモン', kaomoji: '😈(▼皿▼)😈', lv: 54, hp: 11000, atk: 480, exp: 4500, gold: 3900, color: 0xc084fc, scale: 1.25, count: 4, drop: 'abyss_shard' },
            { name: '冥界のデスナイト', kaomoji: '💀【╬◣皿◢】', lv: 60, hp: 22000, atk: 690, exp: 8800, gold: 7600, color: 0xa855f7, scale: 1.6, count: 2, drop: 'ice_crystal' },
            { name: '深淵魔王アザトース', kaomoji: '👑😈꧁(╬◣д◢)꧂', lv: 68, hp: 72000, atk: 1200, exp: 28000, gold: 24000, color: 0xd946ef, scale: 2.45, count: 1, isBoss: true, isRaidBoss: true, drop: 'abyss_shard' }
        ]
    },
    sanctuary: {
        id: 'sanctuary', stageNum: 6, name: '創世の星界神域', recLv: 72, safe: false,
        skyColor: 0x172554, groundColor: 0x312e81,
        desc: '神々が集う最終決戦の聖域。創世の星屑をドロップする最強の領域。',
        drops: ['abyss_shard', 'void_star'],
        monsters: [
            { name: '星界のセラフ兵', kaomoji: '✨(☆皿☆)✨', lv: 74, hp: 34000, atk: 1150, exp: 14000, gold: 12000, color: 0xfde047, scale: 1.3, count: 4, drop: 'void_star' },
            { name: '次元裁定者', kaomoji: '🌌【✧◣д◢✧】', lv: 82, hp: 68000, atk: 1650, exp: 27000, gold: 23000, color: 0xf472b6, scale: 1.65, count: 2, drop: 'abyss_shard' },
            { name: '創世神アルテマ', kaomoji: '👑🌟꧁(╬◣д◢)꧂🌟', lv: 92, hp: 220000, atk: 2900, exp: 85000, gold: 75000, color: 0xf59e0b, scale: 2.6, count: 1, isBoss: true, isRaidBoss: true, drop: 'void_star' }
        ]
    }
};

const EMOTES = [
    { id: 'joy',       icon: '😆', label: '大喜び',   kaomoji: '(≧▽≦)ﾉ',         motion: 'jump',  msg: 'やったー！！',         allyReply: 'おめでとう！(≧▽≦)' },
    { id: 'love',      icon: '😍', label: 'ハート',   kaomoji: '(♡ω♡)💕',         motion: 'jump',  msg: '最高すぎる〜！',       allyReply: 'いいね！(♡ω♡)' },
    { id: 'tableflip', icon: '┻━┻', label: 'ちゃぶ台', kaomoji: '(╯°□°）╯︵ ┻━┻', motion: 'flip',  msg: 'うおおおりゃああ！',   allyReply: 'わわっ！落ち着いて！' },
    { id: 'beam',      icon: '⚡', label: 'ビーム',   kaomoji: '( ・∀・)━☆・*。', motion: 'beam',  msg: '顔文字ビーム！！',     allyReply: 'すごい光だ！(☆ω☆)' },
    { id: 'dance',     icon: '💃', label: 'ダンス',   kaomoji: '♪(┌・。・)┌',      motion: 'spin',  msg: '踊り明かそう♪',       allyReply: 'ノリノリだね♪' },
    { id: 'victory',   icon: '✌️', label: '勝利',     kaomoji: 'v(｡･ω･｡)ｨｪｨ♪',    motion: 'jump',  msg: 'イェイ！大勝利！',     allyReply: 'さすが冒険者！' },
    { id: 'fire',      icon: '🔥', label: '燃える',   kaomoji: '(｀炎ω炎´)',       motion: 'jump',  msg: '魂が燃えてきた！',     allyReply: '気合十分だね！' },
    { id: 'flex',      icon: '💪', label: 'ムキムキ', kaomoji: 'ᕦ(ò_óˇ)ᕤ',         motion: 'shake', msg: '筋肉こそ正義！',       allyReply: 'たくましい！(｀・ω・´)' },
    { id: 'cool',      icon: '😎', label: 'キメ顔',   kaomoji: '( •̀ω•́ )✧',        motion: 'none',  msg: 'フッ、余裕だぜ',       allyReply: 'かっこいい〜！' },
    { id: 'dogeza',    icon: '🙇', label: '土下座',   kaomoji: '＿|￣|○',          motion: 'bow',   msg: '申し訳ありません！',   allyReply: '頭を上げて！(；´Д｀)' },
    { id: 'cry',       icon: '😭', label: '号泣',     kaomoji: '(；Д；)',           motion: 'shake', msg: 'うええええん！',       allyReply: 'よしよし、元気出して！' },
    { id: 'hello',     icon: '👋', label: '挨拶',     kaomoji: '(*・ω・)ﾉ',         motion: 'jump',  msg: 'こんにちはー！',       allyReply: 'やあ！今日も頑張ろう！' }
];

const KAOMOJI_PRESETS = [
    '(´・ω・`)', '(｀・ω・´)', '(≧▽≦)', '(☆ω☆)', '(╯°□°）╯︵ ┻━┻',
    '꧁(✧ω✧)꧂', '(^・ω・^)', 'ʕ•ᴥ•ʔ', '(・∀・)━☆', '(*˘︶˘*).｡.:*♡'
];
