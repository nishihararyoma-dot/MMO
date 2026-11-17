'use strict';

// =========================================================================
// 顔文字ファンタジー3D マスターデータ＆計算式定義 (data.js)
// =========================================================================

const MAX_PLAYER_LEVEL = 999;
const REBIRTH_REQ_LEVEL = 100;
const MAX_THREAT_RANK = 99;

function formatBigNum(n) {
    const v = Math.floor(Number(n) || 0);
    if (v >= 1000000000000) return (v / 1000000000000).toFixed(2) + '兆';
    if (v >= 100000000) return (v / 100000000).toFixed(2) + '億';
    if (v >= 10000) return (v / 10000).toFixed(1) + '万';
    return v.toLocaleString();
}

const MATERIALS = {
    slime_gel:   { id: 'slime_gel',   name: 'ぷるぷる雫',   icon: '💧' },
    ancient_sap: { id: 'ancient_sap', name: '古樹の樹液',   icon: '🌿' },
    goblin_fang: { id: 'goblin_fang', name: '鬼神の鋭牙',   icon: '🦷' },
    fire_core:   { id: 'fire_core',   name: '紅蓮の炎核',   icon: '🔥' },
    ice_crystal: { id: 'ice_crystal', name: '絶対零度晶',   icon: '❄️' },
    abyss_shard: { id: 'abyss_shard', name: '深淵の結晶',   icon: '🔮' },
    void_star:   { id: 'void_star',   name: '創世の星屑',   icon: '🌟' }
};

const WEAPONS = {
    wpn_wood:    { id: 'wpn_wood',    icon: '🪵', shape: 'wood',    bladeColor: 0xb45309, glowColor: 0x4ade80, name: '見習いの木の剣',              atk: 14,   mag: 1.00, costGold: 0,      costMat: {}, desc: '冒険の第一歩となる素朴な木剣。' },
    wpn_iron:    { id: 'wpn_iron',    icon: '🗡️', shape: 'broad',   bladeColor: 0xe2e8f0, glowColor: 0x38bdf8, name: '精錬ブロードソード',          atk: 45,   mag: 1.18, costGold: 220,    costMat: { slime_gel: 3, ancient_sap: 2 }, desc: '蒼い輝きを宿す鋼のブロードソード。' },
    wpn_flame:   { id: 'wpn_flame',   icon: '🔥', shape: 'flame',   bladeColor: 0xf97316, glowColor: 0xef4444, name: '紅蓮のフレイムブレード',      atk: 135,  mag: 1.50, costGold: 950,    costMat: { goblin_fang: 4, fire_core: 3 }, desc: '炎の鋸歯を纏う灼熱の紅蓮大剣。' },
    wpn_frost:   { id: 'wpn_frost',   icon: '❄️', shape: 'scythe',  bladeColor: 0x38bdf8, glowColor: 0xbae6fd, name: '氷皇のクリスタルサイズ',      atk: 360,  mag: 1.90, costGold: 3200,   costMat: { ice_crystal: 5, fire_core: 4 }, desc: '絶対零度の冷気を放つ巨大三日月大鎌。' },
    wpn_abyss:   { id: 'wpn_abyss',   icon: '🔮', shape: 'abyss',   bladeColor: 0xa855f7, glowColor: 0xe879f9, name: '深淵の虚無神剣',              atk: 980,  mag: 2.50, costGold: 11000,  costMat: { abyss_shard: 6, ice_crystal: 5 }, desc: '紫水晶が周回する漆黒と紫の双刃神剣。' },
    wpn_omega:   { id: 'wpn_omega',   icon: '⚡', shape: 'omega',   bladeColor: 0xfde047, glowColor: 0xf59e0b, name: '創世神オメガ・エッジ',          atk: 2700, mag: 3.40, costGold: 38000,  costMat: { void_star: 8, abyss_shard: 8 }, desc: '回転する黄金光輪を宿す創世の聖大剣。' },
    wpn_genesis: { id: 'wpn_genesis', icon: '🌟', shape: 'genesis', bladeColor: 0xf43f5e, glowColor: 0xfde047, name: '【神話級】十界終焉・創世天剣', atk: 8800, mag: 5.00, costGold: 150000, costMat: { void_star: 18, abyss_shard: 16 }, desc: '星屑のオーブと翼刃を持つ神話の終焉天剣。' }
};

const ARMORS = {
    arm_cloth:   { id: 'arm_cloth',   icon: '👕', tierLook: 0, plateColor: 0xe2e8f0, trimColor: 0x94a3b8, capeColor: 0xe11d48, name: '冒険者の布服',                hp: 45,    mp: 12,   def: 0.03, costGold: 0,      costMat: {}, desc: '動きやすい軽装の服と赤いマント。' },
    arm_chain:   { id: 'arm_chain',   icon: '⛓️', tierLook: 1, plateColor: 0xcbd5e1, trimColor: 0x38bdf8, capeColor: 0x0284c7, name: '銀糸のチェインメイル',          hp: 170,   mp: 38,   def: 0.09, costGold: 220,    costMat: { slime_gel: 3, ancient_sap: 2 }, desc: '銀の鎖帷子と蒼いラウンドシールド。' },
    arm_dragon:  { id: 'arm_dragon',  icon: '🐉', tierLook: 2, plateColor: 0xb91c1c, trimColor: 0xfbbf24, capeColor: 0x7f1d1d, name: '炎竜鱗の重鎧',                hp: 520,   mp: 95,   def: 0.16, costGold: 950,    costMat: { fire_core: 4, goblin_fang: 4 }, desc: '角付き竜肩当てと竜鱗シールドを備えた重鎧。' },
    arm_glacier: { id: 'arm_glacier', icon: '💠', tierLook: 3, plateColor: 0xe0f2fe, trimColor: 0x0ea5e9, capeColor: 0x1d4ed8, name: '星氷の聖騎士鎧',              hp: 1450,  mp: 240,  def: 0.24, costGold: 3200,   costMat: { ice_crystal: 5, abyss_shard: 2 }, desc: '白銀のフルプレート＆腰当て装甲を持つ聖騎士鎧。' },
    arm_omega:   { id: 'arm_omega',   icon: '👑', tierLook: 4, plateColor: 0x1e1b4b, trimColor: 0xfde047, capeColor: 0x6d28d9, name: '十界創世の神装束',            hp: 4500,  mp: 680,  def: 0.34, costGold: 32000,  costMat: { void_star: 6, abyss_shard: 6 }, desc: '漆黒と黄金の大盾・背面光輪を纏う究極神装束。' },
    arm_genesis: { id: 'arm_genesis', icon: '✨', tierLook: 5, plateColor: 0xfef08a, trimColor: 0xf43f5e, capeColor: 0xf59e0b, name: '【神話級】不滅神話の星辰聖衣', hp: 14500, mp: 2100, def: 0.44, costGold: 130000, costMat: { void_star: 16, abyss_shard: 14 }, desc: '六芒星神光輪と翼を纏う不滅の神話聖衣。' }
};

// 装飾品（リング・アーティファクト）マスター
const ACCESSORIES = {
    acc_none:          { id: 'acc_none',          icon: '⭕', name: '装飾品なし',               costGold: 0,     costMat: {}, desc: '未装備状態。', atkBonus: 0, hpBonus: 0, rewardBonus: 0, lifesteal: 0, cdBonus: 0, doubleCast: 0, bossDmg: 0 },
    acc_ring_might:    { id: 'acc_ring_might',    icon: '💍', name: '剛力の紅玉リング',         costGold: 600,   costMat: { slime_gel: 5, goblin_fang: 3 }, desc: '最終攻撃力 +18% / 最大HP +10%', atkBonus: 0.18, hpBonus: 0.10, rewardBonus: 0, lifesteal: 0, cdBonus: 0, doubleCast: 0, bossDmg: 0 },
    acc_amulet_exp:    { id: 'acc_amulet_exp',    icon: '🧿', name: '叡智の星屑アミュレット',   costGold: 1800,  costMat: { ancient_sap: 6, fire_core: 3 }, desc: '獲得EXP＆ゴールド +35%', atkBonus: 0.05, hpBonus: 0.05, rewardBonus: 0.35, lifesteal: 0, cdBonus: 0, doubleCast: 0, bossDmg: 0 },
    acc_vamp_fang:     { id: 'acc_vamp_fang',     icon: '🩸', name: '吸血鬼の真紅牙',           costGold: 4500,  costMat: { fire_core: 5, ice_crystal: 4 }, desc: '与ダメージの 4% をHP吸収＆攻撃 +15%', atkBonus: 0.15, hpBonus: 0.12, rewardBonus: 0, lifesteal: 0.04, cdBonus: 0, doubleCast: 0, bossDmg: 0 },
    acc_chrono_orb:    { id: 'acc_chrono_orb',    icon: '⏳', name: '時空の懐中時計',           costGold: 12000, costMat: { ice_crystal: 6, abyss_shard: 4 }, desc: 'クールタイム短縮 +15% & MP自然回復 +50%', atkBonus: 0.12, hpBonus: 0.12, rewardBonus: 0, lifesteal: 0, cdBonus: 0.15, doubleCast: 0, bossDmg: 0 },
    acc_twin_echo:     { id: 'acc_twin_echo',     icon: '♊', name: '双子星の共鳴器',           costGold: 35000, costMat: { abyss_shard: 8, void_star: 5 }, desc: '25%の確率でスキルがMP消費なしで2連発！', atkBonus: 0.22, hpBonus: 0.18, rewardBonus: 0, lifesteal: 0, cdBonus: 0.08, doubleCast: 0.25, bossDmg: 0.10 },
    acc_genesis_crown: { id: 'acc_genesis_crown', icon: '👑', name: '【神話】創世神の王冠',     costGold: 95000, costMat: { void_star: 15, abyss_shard: 12 }, desc: '全基礎ステ +30% / ボス特効 +25% / 獲得報酬 +30%', atkBonus: 0.30, hpBonus: 0.30, rewardBonus: 0.30, lifesteal: 0.03, cdBonus: 0.10, doubleCast: 0.15, bossDmg: 0.25 }
};

// 相棒ペットマスター
const PETS = {
    pet_slime:   { id: 'pet_slime',   name: 'ぷるぷる妖精',     kaomoji: '(・ω・)',        color: 0x38bdf8, costGold: 300,   costMat: { slime_gel: 4 }, desc: '愛らしいスライム相棒。攻撃＋定期的に主人のHPを小回復。', atkRatio: 0.35, healRatio: 0.08 },
    pet_fox:     { id: 'pet_fox',     name: '星屑の九尾狐',     kaomoji: '(^・ω・^)',      color: 0xfbbf24, costGold: 2200,  costMat: { ancient_sap: 6, fire_core: 3 }, desc: '素早い連続噛みつき攻撃と主人のMP回復を行う霊狐。', atkRatio: 0.55, healRatio: 0.06, mpRestore: 0.08 },
    pet_dragon:  { id: 'pet_dragon',  name: '紅蓮のチビ炎竜',   kaomoji: '(｀・ω・´)🔥',   color: 0xf97316, costGold: 9500,  costMat: { fire_core: 6, goblin_fang: 6 }, desc: '灼熱ブレスで敵を焼き払う高火力ドラゴン相棒。', atkRatio: 0.85, healRatio: 0.05 },
    pet_angel:   { id: 'pet_angel',   name: '聖光のミニ天使',   kaomoji: '✧(☆ω☆)✧',      color: 0xf472b6, costGold: 26000, costMat: { ice_crystal: 8, abyss_shard: 4 }, desc: '聖光弾での援護と強力なHP＆MP同時回復をこなす天使。', atkRatio: 0.75, healRatio: 0.15, mpRestore: 0.12 },
    pet_omega:   { id: 'pet_omega',   name: '創世ミニオメガ',   kaomoji: '꧁(・∀・)꧂',     color: 0xfde047, costGold: 85000, costMat: { void_star: 10, abyss_shard: 8 }, desc: '神域のレーザーで敵を殲滅する最強の創世相棒！', atkRatio: 1.35, healRatio: 0.14, mpRestore: 0.14 }
};

// 実績ミッション＆バフ付き称号マスター
const ACHIEVEMENTS = [
    { id: 'ach_kill_30',   name: '初陣の冒険者',     desc: 'モンスターを累計 30体 討伐する',     key: 'kills',         req: 30,   rewardAp: 5,  rewardSp: 2,  titleId: 'title_rookie' },
    { id: 'ach_kill_200',  name: '百戦錬磨の狩人',   desc: 'モンスターを累計 200体 討伐する',    key: 'kills',         req: 200,  rewardAp: 12, rewardSp: 5,  titleId: 'title_hunter' },
    { id: 'ach_boss_10',   name: '巨獣討伐者',       desc: 'ボスを累計 10体 討伐する',           key: 'bossKills',     req: 10,   rewardAp: 15, rewardSp: 6,  titleId: 'title_slayer' },
    { id: 'ach_tower_10',  name: '試練の登頂者',     desc: '無限の試練の塔 10階 に到達する',     key: 'bestTowerFloor',req: 10,   rewardAp: 20, rewardSp: 8,  titleId: 'title_tower' },
    { id: 'ach_threat_20', name: '深淵に挑む勇者',   desc: '脅威度ランク +20 以上で敵を倒す',    key: 'maxThreatKill', req: 20,   rewardAp: 25, rewardSp: 10, titleId: 'title_threat' },
    { id: 'ach_rebirth_1', name: '輪廻を超えし者',   desc: '極限超越転生を 1回 達成する',       key: 'rebirthCount',  req: 1,    rewardAp: 35, rewardSp: 15, titleId: 'title_god' }
];

const TITLES = {
    title_none:   { id: 'title_none',   name: '称号なし',           bonusText: '補正なし',                     atk: 0,    hp: 0,    reward: 0,    crit: 0 },
    title_rookie: { id: 'title_rookie', name: '🌱 期待の新星',       bonusText: 'HP +8% / 攻撃 +8%',            atk: 0.08, hp: 0.08, reward: 0,    crit: 0 },
    title_hunter: { id: 'title_hunter', name: '⚔️ 百戦錬磨の狩人',   bonusText: '攻撃 +15% / 会心率 +5%',       atk: 0.15, hp: 0.05, reward: 0,    crit: 0.05 },
    title_slayer: { id: 'title_slayer', name: '👑 ボススレイヤー',   bonusText: '攻撃 +22% / 会心率 +8%',       atk: 0.22, hp: 0.12, reward: 0,    crit: 0.08 },
    title_tower:  { id: 'title_tower',  name: '🗼 試練の踏破者',     bonusText: '全ステ +18% / 報酬 +15%',      atk: 0.18, hp: 0.18, reward: 0.15, crit: 0.04 },
    title_threat: { id: 'title_threat', name: '🔥 災厄の征服者',     bonusText: '攻撃 +28% / 獲得EXP・G +25%',  atk: 0.28, hp: 0.15, reward: 0.25, crit: 0.06 },
    title_god:    { id: 'title_god',    name: '✨ 十界の超越神',     bonusText: '全ステ +35% / 会心率 +12%',    atk: 0.35, hp: 0.35, reward: 0.20, crit: 0.12 }
};

function getArmorEnhanceRequirement(curEnh) {
    const gold = Math.round(200 * Math.pow(1.36, curEnh));
    const mats = {};
    if (curEnh < 3) {
        mats.slime_gel = 2 + curEnh * 2;
        mats.ancient_sap = 1 + curEnh;
    } else if (curEnh < 6) {
        mats.ancient_sap = 3 + (curEnh - 3) * 2;
        mats.goblin_fang = 2 + (curEnh - 3) * 2;
    } else if (curEnh < 10) {
        mats.fire_core = 3 + (curEnh - 6) * 2;
        mats.ice_crystal = 2 + (curEnh - 6) * 2;
    } else if (curEnh < 15) {
        mats.ice_crystal = 4 + (curEnh - 10) * 2;
        mats.abyss_shard = 3 + (curEnh - 10) * 2;
    } else {
        mats.abyss_shard = 6 + (curEnh - 15) * 2;
        mats.void_star = 4 + (curEnh - 15) * 2;
    }
    return { gold, mats };
}

const EVOLUTIONS = {
    novice:        { id: 'novice',        tier: 0, reqLv: 1,   name: '見習い冒険者',               kaomoji: '(*´ω｀*)',       color: '#38bdf8', hexColor: 0x38bdf8, bonusText: '基本バランス型', desc: '無限の可能性を秘めた駆け出し冒険者。', atkMult: 1.0, hpMult: 1.0, mpMult: 1.0, spdMult: 1.0 },
    knight_1:      { id: 'knight_1',      tier: 1, reqLv: 8,   name: '重装の鉄壁騎士',             kaomoji: '(｀・ω・´)',     color: '#60a5fa', hexColor: 0x3b82f6, bonusText: 'HP+25% / 攻撃+15%', desc: '強靭な肉体を持つ前衛騎士。', reqMat: { slime_gel: 4, ancient_sap: 3 }, atkMult: 1.15, hpMult: 1.25, mpMult: 1.05, spdMult: 1.0 },
    mage_1:        { id: 'mage_1',        tier: 1, reqLv: 8,   name: '星詠みの魔導士',             kaomoji: '(・∀・)つ━☆',   color: '#c084fc', hexColor: 0xa855f7, bonusText: 'MP+35% / 魔法+25%', desc: '星々の魔力を操る魔導士。', reqMat: { slime_gel: 3, ancient_sap: 4 }, atkMult: 1.25, hpMult: 1.05, mpMult: 1.35, spdMult: 1.05 },
    assassin_1:    { id: 'assassin_1',    tier: 1, reqLv: 8,   name: '疾風の影刃使い',             kaomoji: '(・ω<)',         color: '#34d399', hexColor: 0x10b981, bonusText: '攻撃+22% / 速度+15%', desc: '目にも留まらぬ速さの暗殺者。', reqMat: { slime_gel: 3, goblin_fang: 3 }, atkMult: 1.22, hpMult: 1.10, mpMult: 1.10, spdMult: 1.15 },
    knight_2:      { id: 'knight_2',      tier: 2, reqLv: 20,  reqEvo: 'knight_1',   name: '覇王の狂戦士',             kaomoji: '(╬◣д◢)',       color: '#f87171', hexColor: 0xef4444, bonusText: 'HP+55% / 攻撃+40%', desc: '怒りのオーラを纏う覇王。', reqMat: { fire_core: 5, goblin_fang: 6 }, atkMult: 1.40, hpMult: 1.55, mpMult: 1.20, spdMult: 1.08 },
    mage_2:        { id: 'mage_2',        tier: 2, reqLv: 20,  reqEvo: 'mage_1',     name: '銀河の大賢者',             kaomoji: '(☆ω☆)✧',       color: '#f472b6', hexColor: 0xec4899, bonusText: 'MP+75% / 魔法+60%', desc: '宇宙の真理に到達した大賢者。', reqMat: { fire_core: 5, ice_crystal: 5 }, atkMult: 1.60, hpMult: 1.25, mpMult: 1.75, spdMult: 1.12 },
    assassin_2:    { id: 'assassin_2',    tier: 2, reqLv: 20,  reqEvo: 'assassin_1', name: '黒衣の処刑人',             kaomoji: '(⌐■_■)',        color: '#fbbf24', hexColor: 0xf59e0b, bonusText: '攻撃+55% / 速度+25%', desc: '冷徹な光を宿す最強の刺客。', reqMat: { goblin_fang: 6, ice_crystal: 5 }, atkMult: 1.55, hpMult: 1.30, mpMult: 1.30, spdMult: 1.25 },
    knight_3:      { id: 'knight_3',      tier: 3, reqLv: 35,  reqEvo: 'knight_2',   name: '十界の創世神騎士',         kaomoji: 'Ψ(｀∇´)Ψ',      color: '#fde047', hexColor: 0xeab308, bonusText: 'HP+100% / 攻撃+85%', desc: '不滅の聖騎士王。', reqMat: { abyss_shard: 6, void_star: 3 }, atkMult: 1.85, hpMult: 2.00, mpMult: 1.50, spdMult: 1.18 },
    mage_3:        { id: 'mage_3',        tier: 3, reqLv: 35,  reqEvo: 'mage_2',     name: '星辰の虚無大帝',           kaomoji: '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧',  color: '#e879f9', hexColor: 0xd946ef, bonusText: 'MP+130% / 魔法+115%', desc: '星々の消滅を司る魔導皇帝。', reqMat: { abyss_shard: 6, void_star: 3 }, atkMult: 2.15, hpMult: 1.60, mpMult: 2.30, spdMult: 1.22 },
    assassin_3:    { id: 'assassin_3',    tier: 3, reqLv: 35,  reqEvo: 'assassin_2', name: '終焉の次元暗殺王',         kaomoji: '( •̀ ω •́ )✧',   color: '#2dd4bf', hexColor: 0x14b8a6, bonusText: '攻撃+105% / 速度+38%', desc: '次元を超えて一撃で断つ王。', reqMat: { abyss_shard: 6, void_star: 3 }, atkMult: 2.05, hpMult: 1.65, mpMult: 1.60, spdMult: 1.38 },
    knight_ex:     { id: 'knight_ex',     tier: 4, isExJob: true, reqLv: 55,  reqEvo: 'knight_3',   name: '【上級職】終焉の無双聖皇',   kaomoji: '꧁(╬◣д◢)꧂',   color: '#fbbf24', hexColor: 0xf59e0b, bonusText: 'HP+165% / 攻撃+145% / 軽減+12%', desc: '不滅の聖皇オーラを纏う重装超越職。', reqMat: { abyss_shard: 10, void_star: 6 }, atkMult: 2.45, hpMult: 2.65, mpMult: 1.85, spdMult: 1.25, exDefBonus: 0.12 },
    mage_ex:       { id: 'mage_ex',       tier: 4, isExJob: true, reqLv: 55,  reqEvo: 'mage_3',     name: '【上級職】宇宙創世の真理神', kaomoji: '✧(☆ω☆)✧',     color: '#f472b6', hexColor: 0xec4899, bonusText: 'MP+210% / 魔法+190% / CD短縮+15%', desc: '詠唱限界を突破した魔導超越職。', reqMat: { abyss_shard: 10, void_star: 6 }, atkMult: 2.90, hpMult: 2.05, mpMult: 3.10, spdMult: 1.30, exCdBonus: 0.15 },
    assassin_ex:   { id: 'assassin_ex',   tier: 4, isExJob: true, reqLv: 55,  reqEvo: 'assassin_3', name: '【上級職】次元超越の影神帝', kaomoji: '【⌐■_■】⚡',   color: '#38bdf8', hexColor: 0x0ea5e9, bonusText: '攻撃+175% / 速度+50% / 会心+25%', desc: '時空の狭間から必殺を放つ暗殺超越職。', reqMat: { abyss_shard: 10, void_star: 6 }, atkMult: 2.75, hpMult: 2.15, mpMult: 2.00, spdMult: 1.50, exCritBonus: 0.25 },
    knight_myth:   { id: 'knight_myth',   tier: 5, isExJob: true, reqLv: 80,  reqEvo: 'knight_ex',   name: '【神話職】十界創世・不滅天帝', kaomoji: '👑꧁Ψ(╬◣д◢)Ψ꧂', color: '#fde047', hexColor: 0xfacc15, bonusText: 'HP+260% / 攻撃+230% / 軽減+18%', desc: '不滅の創世天帝。', reqMat: { abyss_shard: 18, void_star: 14 }, atkMult: 3.30, hpMult: 3.60, mpMult: 2.40, spdMult: 1.32, exDefBonus: 0.18 },
    mage_myth:     { id: 'mage_myth',     tier: 5, isExJob: true, reqLv: 80,  reqEvo: 'mage_ex',     name: '【神話職】銀河終焉・全知全能神', kaomoji: '✨꧁(☆ω☆)꧂✨', color: '#f472b6', hexColor: 0xf43f5e, bonusText: 'MP+320% / 魔法+290% / CD短縮+20%', desc: '宇宙の全法則を書き換える全知全能の神。', reqMat: { abyss_shard: 18, void_star: 14 }, atkMult: 3.90, hpMult: 2.80, mpMult: 4.20, spdMult: 1.38, exCdBonus: 0.20 },
    assassin_myth: { id: 'assassin_myth', tier: 5, isExJob: true, reqLv: 80,  reqEvo: 'assassin_ex', name: '【神話職】因果切断・虚空瞬神王', kaomoji: '⚡꧁【⌐■_■】꧂⚡', color: '#2dd4bf', hexColor: 0x06b6d4, bonusText: '攻撃+260% / 速度+65% / 会心+45%', desc: '超過会心ダメージを極限まで引き出す因果切断の神王。', reqMat: { abyss_shard: 18, void_star: 14 }, atkMult: 3.65, hpMult: 2.90, mpMult: 2.60, spdMult: 1.65, exCritBonus: 0.45 }
};

const SKILLS = {
    slash_heavy:  { id: 'slash_heavy',  name: '烈空斬',         icon: '⚔️', baseCost: 10, cd: 2.6, type: 'SINGLE_DMG', power: 2.1,  isSupport: false, desc: '単体に鋭い跳躍斬撃。Lvごとに威力と会心率が上昇！' },
    spin_whirl:   { id: 'spin_whirl',   name: '旋風円舞',       icon: '🌪️', baseCost: 18, cd: 4.2, type: 'AOE_DMG',    power: 1.75, isSupport: false, radius: 6.2, desc: '高速回転しながら周囲に光の竜巻を放つ大技。' },
    bash_shield:  { id: 'bash_shield',  name: '破邪の衝撃',     icon: '🛡️', baseCost: 14, cd: 3.8, type: 'INTERRUPT',  power: 1.55, isSupport: false, desc: 'ボスの大技詠唱を中断＋Lv比例で気絶時間延長！' },
    heal_light:   { id: 'heal_light',   name: '聖光の癒し',     icon: '💚', baseCost: 22, cd: 5.5, type: 'HEAL',       power: 0.35, isSupport: true,  desc: '天からの聖光柱でHP大回復＆状態異常解除。Lvで回復割合UP！' },
    meteor_star:  { id: 'meteor_star',  name: '星屑メテオ',     icon: '☄️', baseCost: 34, cd: 6.5, type: 'AOE_DMG',    power: 2.9,  isSupport: false, radius: 7.5, desc: '上空から巨大隕石を落下させる超高火力魔法。' },
    frost_nova:   { id: 'frost_nova',   name: '絶対零度ノヴァ', icon: '❄️', baseCost: 26, cd: 5.2, type: 'AOE_SLOW',   power: 1.95, isSupport: false, radius: 6.8, desc: '氷柱と冷気波で周囲を凍らせ大ダメージ＋Lvで減速UP。' },
    thunder_bolt: { id: 'thunder_bolt', name: '天罰の紫電',     icon: '⚡', baseCost: 24, cd: 3.6, type: 'THUNDER',    power: 2.55, isSupport: false, desc: '天から極太の雷柱を落とす超高速必殺魔法。' },
    vamp_drain:   { id: 'vamp_drain',   name: '深淵ドレイン',   icon: '🩸', baseCost: 20, cd: 4.5, type: 'DRAIN',      power: 1.85, isSupport: false, desc: '敵の生命力を奪い、Lv比例で吸収回復量もUP！' },
    aegis_wall:   { id: 'aegis_wall',   name: '神域イージス',   icon: '🔰', baseCost: 25, cd: 8.5, type: 'DEF_BUFF',   power: 0.25, isSupport: true,  desc: '光のバリアドームを展開！Lvで軽減率＆時間UP。' },
    warcry_fury:  { id: 'warcry_fury',  name: '覇王の咆哮',     icon: '🔥', baseCost: 28, cd: 9.0, type: 'ATK_BUFF',   power: 0.35, isSupport: true,  desc: '紅蓮の闘気柱を纏い全攻撃力上昇！Lvで倍率＆時間UP。' },
    phoenix_dive: { id: 'phoenix_dive', name: '不死鳥の烈火',   icon: '🦅', baseCost: 36, cd: 7.0, type: 'AOE_BURN',   power: 2.4,  isSupport: false, radius: 7.0, desc: '紅蓮の火柱と炎波で焼き払い、炎上継続ダメージ付与。' },
    void_blade:   { id: 'void_blade',   name: '虚無次元斬',     icon: '🌌', baseCost: 40, cd: 6.0, type: 'SINGLE_DMG', power: 3.45, isSupport: false, desc: '次元ごと空間を切り裂く単体超火力奥義。' },
    genesis_nova: { id: 'genesis_nova', name: '創世ビッグバン', icon: '💥', baseCost: 55, cd: 9.5, type: 'AOE_DMG',    power: 4.2,  isSupport: false, radius: 8.8, desc: '宇宙爆発の多重衝撃波で周囲を殲滅する究極奥義！' },
    holy_aurora:  { id: 'holy_aurora',  name: '極光の聖域',     icon: '🌈', baseCost: 38, cd: 8.0, type: 'HEAL_MP',    power: 0.42, isSupport: true,  desc: '虹色のオーロラ柱でHP＆MP同時大回復！Lvで回復割合UP。' }
};

function getSkillMpCost(sk, skLv) {
    const lv = Math.max(1, skLv || 1);
    return Math.round(sk.baseCost * (1 + (lv - 1) * 0.18));
}

function getSkillEffectStats(sk, skLv, st) {
    const lv = Math.max(1, skLv || 1);
    const treePow = st ? st.treeSkillPowerMult : 1.0;
    const treeHeal = st ? st.treeHealPowerMult : 1.0;

    if (sk.type === 'HEAL') {
        const hpPct = Math.min(2.5, (sk.power + (lv - 1) * 0.06) * treeHeal);
        return { hpPct, summary: `HP回復: 最大HPの ${Math.round(hpPct * 100)}%` };
    }
    if (sk.type === 'HEAL_MP') {
        const hpPct = Math.min(2.5, (sk.power + (lv - 1) * 0.06) * treeHeal);
        const mpPct = Math.min(1.0, (0.20 + (lv - 1) * 0.03) * treeHeal);
        return { hpPct, mpPct, summary: `HP回復: ${Math.round(hpPct * 100)}% / MP回復: ${Math.round(mpPct * 100)}%` };
    }
    if (sk.type === 'DEF_BUFF') {
        const defBonus = Math.min(0.75, (sk.power + (lv - 1) * 0.04) * treeHeal);
        const duration = Number((7.0 + (lv - 1) * 0.6).toFixed(1));
        const invuln = Number(Math.min(3.5, 1.0 + (lv - 1) * 0.15).toFixed(1));
        return { defBonus, duration, invuln, summary: `軽減+${Math.round(defBonus * 100)}% / 無敵${invuln}s / 持続${duration}s` };
    }
    if (sk.type === 'ATK_BUFF') {
        const atkBonus = Number(((sk.power + (lv - 1) * 0.08) * treeHeal).toFixed(2));
        const duration = Number((8.5 + (lv - 1) * 0.7).toFixed(1));
        return { atkBonus, duration, summary: `攻撃力 +${Math.round(atkBonus * 100)}% (x${(1 + atkBonus).toFixed(2)}倍) / 持続${duration}s` };
    }

    const mult = Number((sk.power * (1 + (lv - 1) * 0.25) * treePow).toFixed(2));
    if (sk.type === 'DRAIN') {
        const drainRate = Math.min(1.0, 0.40 + (lv - 1) * 0.04);
        return { mult, drainRate, summary: `威力倍率: x${mult.toFixed(2)}倍 / 与ダメの${Math.round(drainRate * 100)}%回復` };
    }
    if (sk.type === 'INTERRUPT') {
        const stunDur = Number(Math.min(6.0, 2.4 + (lv - 1) * 0.25).toFixed(1));
        return { mult, stunDur, summary: `威力倍率: x${mult.toFixed(2)}倍 / 詠唱中断＋気絶${stunDur}s` };
    }
    if (sk.type === 'AOE_SLOW') {
        const slowFactor = Math.max(0.2, 0.55 - (lv - 1) * 0.03);
        const slowDur = Number(Math.min(10.0, 4.5 + (lv - 1) * 0.4).toFixed(1));
        return { mult, slowFactor, slowDur, summary: `威力倍率: x${mult.toFixed(2)}倍 / 速度${Math.round((1 - slowFactor) * 100)}%低下(${slowDur}s)` };
    }
    return { mult, summary: `スキル威力倍率: x${mult.toFixed(2)}倍` };
}

const SKILL_TREE_NODES = [
    { id: 't_might',   name: '剛力の極意',   icon: '⚔️', maxLv: 20, desc: '1Lvごとに最終攻撃力 +6%' },
    { id: 't_arcana',  name: '魔導の真理',   icon: '🔮', maxLv: 20, desc: '1Lvごとに全スキル威力 +8%' },
    { id: 't_vital',   name: '不屈の生命',   icon: '❤️', maxLv: 20, desc: '1Lvごとに最大HP +8% & 自然回復UP' },
    { id: 't_crit',    name: '会心の神眼',   icon: '🎯', maxLv: 15, desc: '1Lvごとに会心率 +5% & 会心威力 +12%' },
    { id: 't_chant',   name: '高速詠唱術',   icon: '⚡', maxLv: 12, desc: '1Lvごとにクールタイム短縮 +5% & MP回復UP' },
    { id: 't_aegis',   name: '聖騎士の加護', icon: '🛡️', maxLv: 15, desc: '1Lvごとに被ダメージ軽減 +3% & サポート効果 +8%' },
    { id: 't_fortune', name: '黄金の幸運',   icon: '💰', maxLv: 15, desc: '1Lvごとに獲得EXP＆ゴールド +10%' },
    { id: 't_warlord', name: '覇王の覚醒',   icon: '👑', maxLv: 15, desc: '1Lvごとに全基礎能力 +5% & CD短縮 +3%' }
];

const ZONES = {
    town: {
        id: 'town', stageNum: 1, name: '始まりの顔文字広場', recLv: 1, safe: true,
        skyColor: 0x0c2d48, groundColor: 0x14532d,
        desc: '安全な拠点の街。HP/MPが超高速回復し、仲間AI冒険者たちが集う広場。',
        drops: [], monsters: []
    },
    meadow: {
        id: 'meadow', stageNum: 2, name: 'そよ風のスライム草原', recLv: 1, safe: false,
        skyColor: 0x0f3b5c, groundColor: 0x166534,
        desc: '初心者向けの緑の草原。まずはここでLv.8と最初の素材を集めよう！',
        drops: ['slime_gel', 'ancient_sap'],
        monsters: [
            { name: 'ぷるぷるスライム', kaomoji: '(・ω・)', lv: 1, hp: 95, atk: 12, exp: 32, gold: 28, color: 0x38bdf8, scale: 0.95, count: 5, drop: 'slime_gel' },
            { name: 'キングスライム', kaomoji: '👑(｀・ω・´)', lv: 6, hp: 580, atk: 34, exp: 185, gold: 170, color: 0x0284c7, scale: 1.75, count: 1, isBoss: true, drop: 'ancient_sap' }
        ]
    },
    forest: {
        id: 'forest', stageNum: 3, name: '迷いの古樹の密林', recLv: 8, safe: false,
        skyColor: 0x062c22, groundColor: 0x064e3b,
        desc: 'Tier 1進化に最適な密林ステージ。鬼神の鋭牙と古樹の樹液がドロップ。',
        drops: ['ancient_sap', 'goblin_fang'],
        monsters: [
            { name: 'フォレストゴブリン', kaomoji: '(｀皿´)', lv: 9, hp: 520, atk: 46, exp: 115, gold: 98, color: 0x10b981, scale: 1.05, count: 5, drop: 'goblin_fang' },
            { name: '古樹の守護ゴーレム', kaomoji: '【・皿・】', lv: 14, hp: 2800, atk: 105, exp: 540, gold: 490, color: 0x059669, scale: 1.9, count: 1, isBoss: true, isRaidBoss: true, drop: 'ancient_sap' }
        ]
    },
    volcano: {
        id: 'volcano', stageNum: 4, name: '灼熱の紅蓮火山', recLv: 16, safe: false,
        skyColor: 0x3b0d0c, groundColor: 0x450a0a,
        desc: 'マグマが噴き上がる火山地帯。紅蓮の炎核を集めてTier 2進化を目指そう。',
        drops: ['fire_core', 'goblin_fang'],
        monsters: [
            { name: 'フレイムインプ', kaomoji: '(╬`д´)', lv: 17, hp: 2100, atk: 145, exp: 310, gold: 280, color: 0xf97316, scale: 1.1, count: 4, drop: 'fire_core' },
            { name: '紅蓮炎竜イグニス', kaomoji: '🔥(╬◣д◢)🔥', lv: 22, hp: 11500, atk: 290, exp: 1250, gold: 1150, color: 0xdc2626, scale: 2.05, count: 1, isBoss: true, isRaidBoss: true, drop: 'fire_core' }
        ]
    },
    glacier: {
        id: 'glacier', stageNum: 5, name: '星氷の絶零神殿', recLv: 23, safe: false,
        skyColor: 0x082f49, groundColor: 0x0c4a6e,
        desc: 'すべてが凍りつく神殿。絶対零度晶をドロップする強敵が出現。',
        drops: ['ice_crystal', 'fire_core'],
        monsters: [
            { name: 'クリスタルゴーレム', kaomoji: '❄【・ω・】❄', lv: 24, hp: 6400, atk: 310, exp: 650, gold: 590, color: 0x38bdf8, scale: 1.15, count: 4, drop: 'ice_crystal' },
            { name: '氷結の女帝コキュートス', kaomoji: '❄️(⌐■_■)❄️', lv: 28, hp: 31000, atk: 620, exp: 2450, gold: 2300, color: 0x0284c7, scale: 2.1, count: 1, isBoss: true, isRaidBoss: true, drop: 'ice_crystal' }
        ]
    },
    abyss: {
        id: 'abyss', stageNum: 6, name: '深淵の星屑回廊', recLv: 32, safe: false,
        skyColor: 0x2e1065, groundColor: 0x1e1b4b,
        desc: '紫の星屑が舞う異空間。Tier 3進化に必要な深淵の結晶が眠る。',
        drops: ['abyss_shard', 'ice_crystal'],
        monsters: [
            { name: 'アビスナイト', kaomoji: '(▼皿▼)', lv: 33, hp: 16500, atk: 640, exp: 1350, gold: 1150, color: 0xa855f7, scale: 1.18, count: 4, drop: 'abyss_shard' },
            { name: '深淵魔王アザトース', kaomoji: '🔮(╬◣д◢)🔮', lv: 40, hp: 78000, atk: 1250, exp: 4900, gold: 4500, color: 0x7e22ce, scale: 2.2, count: 1, isBoss: true, isRaidBoss: true, drop: 'abyss_shard' }
        ]
    },
    void_end: {
        id: 'void_end', stageNum: 7, name: '終焉の虚無界 [ENDGAME]', recLv: 50, safe: false,
        skyColor: 0x180424, groundColor: 0x0f0317,
        desc: '創世の星屑をドロップする終盤ステージ。上級職EXへの覚醒素材を集めよ！',
        drops: ['void_star', 'abyss_shard'],
        monsters: [
            { name: '虚無の次元監視者', kaomoji: '【◎皿◎】', lv: 52, hp: 56000, atk: 1750, exp: 3800, gold: 3100, color: 0xe879f9, scale: 1.22, count: 3, drop: 'void_star' },
            { name: '創世神オメガ・カオモジ', kaomoji: '꧁(╬◣д◢)꧂', lv: 64, hp: 280000, atk: 3200, exp: 14500, gold: 12000, color: 0xf43f5e, scale: 2.35, count: 1, isBoss: true, isRaidBoss: true, drop: 'void_star' }
        ]
    },
    transcendence: {
        id: 'transcendence', stageNum: 8, name: '超越神域・無限の試練場 [Lv.75〜999]', recLv: 75, safe: false,
        skyColor: 0x291a04, groundColor: 0x1c1103,
        desc: 'Lv.999＆脅威度+99のために開かれた黄金の神域試練場。ボス討伐でAP/SPも大量獲得！',
        drops: ['void_star', 'abyss_shard'],
        monsters: [
            { name: '神域の黄金裁定者', kaomoji: '✧【・皿・】✧', lv: 85, hp: 240000, atk: 4400, exp: 13500, gold: 9800, color: 0xfbbf24, scale: 1.32, count: 3, drop: 'void_star' },
            { name: '超越神アポカリプス', kaomoji: '꧁Ψ(╬◣д◢)Ψ꧂', lv: 110, hp: 1450000, atk: 8200, exp: 55000, gold: 38000, color: 0xf59e0b, scale: 2.5, count: 1, isBoss: true, isRaidBoss: true, drop: 'void_star' }
        ]
    }
};

const EMOTES = [
    { id: 'greet',     icon: '👋', label: 'あいさつ',     kaomoji: '(・∀・)ﾉ',           msg: 'よろしくね！',           motion: 'jump',  allyReply: '(・∀・)ﾉ ようこそ広場へ！' },
    { id: 'joy',       icon: '✨', label: '大喜び',       kaomoji: 'ヽ(*´∀｀)ノ',         msg: 'やったー！！',           motion: 'spin',  allyReply: '(*´ω｀*) いいことあった？' },
    { id: 'tableflip', icon: '🪑', label: 'ちゃぶ台返し', kaomoji: '(╯°□°）╯︵ ┻━┻',   msg: 'うおおおーっ！！',       motion: 'flip',  allyReply: '┬─┬ノ( º _ ºノ) 落ち着いて！' },
    { id: 'tablefix',  icon: '🛠️', label: 'ちゃぶ台戻し', kaomoji: '┬─┬ノ( º _ ºノ)',     msg: 'そっと戻そう…',         motion: 'bow',   allyReply: '(・∀・)b えらいぞ！' },
    { id: 'beam',      icon: '⚡', label: 'ビーム発射',   kaomoji: '( ・∀・)つ━☆・*。', msg: 'カオモジビーム！！',     motion: 'beam',  allyReply: '(☆ω☆)✧ まぶしいっ！' },
    { id: 'cool',      icon: '😎', label: 'ドヤ顔',       kaomoji: '(⌐■_■)✧',           msg: '余裕だぜ！',             motion: 'jump',  allyReply: '(｀・ω・´) さすがの貫禄！' },
    { id: 'fire',      icon: '🔥', label: '気合全開',     kaomoji: '(｀・ω・´)🔥',       msg: '燃えてきたぞ！',         motion: 'jump',  allyReply: '(╬◣д◢) 一緒に暴れようぜ！' },
    { id: 'dogeza',    icon: '🙇', label: '土下座',       kaomoji: '＿|￣|○',             msg: '申し訳ございません！',   motion: 'bow',   allyReply: '(´・ω・)ﾉ 頭を上げて！' },
    { id: 'dance',     icon: '💃', label: 'ダンス',       kaomoji: '♪(┌・。・)┌',         msg: 'ルンルン♪',              motion: 'spin',  allyReply: '└(・。・┐)♪ 楽しそうだね！' },
    { id: 'flex',      icon: '💪', label: 'マッスル',     kaomoji: 'ᕙ( •̀ ᗜ •́ )ᕗ',       msg: '筋肉は裏切らない！',     motion: 'jump',  allyReply: '(｀・ω・´) すごい筋肉だ！' },
    { id: 'shock',     icon: '😱', label: 'ガビーン',     kaomoji: '( Д ) ﾟ ﾟ',           msg: 'な、なんだってー！？',   motion: 'shake', allyReply: '(・ω・;) どうしたの！？' },
    { id: 'cry',       icon: '😭', label: '涙目',         kaomoji: '( ；∀；)',           msg: 'うわーん…！',           motion: 'shake', allyReply: '(´・ω・)ﾉ どんまい！元気出して！' },
    { id: 'love',      icon: '💖', label: 'ハート',       kaomoji: '(*˘︶˘*).｡.:*♡',     msg: '最高すぎる〜♡',         motion: 'jump',  allyReply: '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧ ありがとう！' },
    { id: 'smug',      icon: '😏', label: 'ニヤリ',       kaomoji: '(￣ー￣)ﾆﾔﾘ',         msg: '計画通りだ…',           motion: 'jump',  allyReply: '(⌐■_■) 悪い顔してるな〜' },
    { id: 'sleepy',    icon: '💤', label: '居眠り',       kaomoji: '(－_－) zzZ',         msg: 'すやすや…',             motion: 'bow',   allyReply: '(*´ω｀*) おやすみ〜' },
    { id: 'victory',   icon: '👑', label: '勝利宣言',     kaomoji: 'Ψ(｀∇´)Ψ',          msg: '十界の頂点へ！',         motion: 'spin',  allyReply: '👑 最強の冒険者だ！' }
];

const KAOMOJI_PRESETS = [
    '(*´ω｀*)', '(｀・ω・´)', '(・∀・)', '(⌐■_■)', '(╬◣д◢)',
    '(☆ω☆)✧', 'Ψ(｀∇´)Ψ', '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧', 'ᕙ( •̀ ᗜ •́ )ᕗ', '꧁(╬◣д◢)꧂'
];
