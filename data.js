'use strict';

// =========================================================================
// 顔文字ファンタジー3D マスターデータ (data.js)
// =========================================================================
window.MAX_PLAYER_LEVEL = 999;
window.MATERIALS = {
    slime_gel:     { id: 'slime_gel',     name: 'ぷるぷるゼリー', icon: '💧' },
    goblin_fang:   { id: 'goblin_fang',   name: 'ゴブリンの鋭牙', icon: '🦷' },
    ancient_sap:   { id: 'ancient_sap',   name: '古代樹の霊液',   icon: '🌿' },
    fire_core:     { id: 'fire_core',     name: '紅蓮の炎核',     icon: '🔥' },
    ice_crystal:   { id: 'ice_crystal',   name: '永久氷晶',       icon: '❄️' },
    void_shard:    { id: 'void_shard',    name: '虚無の欠片',     icon: '🔮' },
    star_fragment: { id: 'star_fragment', name: '星屑の霊珠',     icon: '🌟' }
};

window.MATERIAL_ALCHEMY = [
    { from: 'slime_gel',   to: 'goblin_fang',   count: 5, gold: 120 },
    { from: 'goblin_fang', to: 'ancient_sap',   count: 5, gold: 320 },
    { from: 'ancient_sap', to: 'fire_core',     count: 5, gold: 800 },
    { from: 'fire_core',   to: 'ice_crystal',   count: 5, gold: 2000 },
    { from: 'ice_crystal', to: 'void_shard',    count: 5, gold: 5000 },
    { from: 'void_shard',  to: 'star_fragment', count: 5, gold: 15000 }
];

window.WEAPONS = {
    wpn_wood: {
        id: 'wpn_wood', name: '冒険者の木の剣', icon: '🗡️', category: 'sword', shape: 'sword',
        atk: 12, mag: 1.0, costGold: 0, costMat: {}, bladeColor: 0xd97706, glowColor: 0x38bdf8
    },
    wpn_iron: {
        id: 'wpn_iron', name: '鋼鉄の騎士剣', icon: '⚔️', category: 'sword', shape: 'sword',
        atk: 38, mag: 1.05, costGold: 220, costMat: { slime_gel: 3 }, bladeColor: 0xe2e8f0, glowColor: 0x38bdf8
    },
    wpn_knight: {
        id: 'wpn_knight', name: '蒼穹の聖銀剣', icon: '🗡️', category: 'sword', shape: 'sword',
        atk: 98, mag: 1.15, costGold: 950, costMat: { goblin_fang: 4, ancient_sap: 2 }, bladeColor: 0x7dd3fc, glowColor: 0x0284c7
    },
    wpn_flame: {
        id: 'wpn_flame', name: '紅蓮の業火大剣', icon: '🔥', category: 'sword', shape: 'sword',
        atk: 260, mag: 1.25, costGold: 3600, costMat: { fire_core: 4, goblin_fang: 5 }, bladeColor: 0xf97316, glowColor: 0xef4444
    },
    wpn_scythe: {
        id: 'wpn_scythe', name: '冥界の死神大鎌', icon: '🌙', category: 'sword', shape: 'scythe',
        atk: 680, mag: 1.45, costGold: 12000, costMat: { ice_crystal: 5, void_shard: 2 }, bladeColor: 0xa855f7, glowColor: 0xf43f5e
    },
    wpn_omega: {
        id: 'wpn_omega', name: 'オメガ星砕きブレイド', icon: '⚡', category: 'sword', shape: 'omega',
        atk: 1850, mag: 1.7, costGold: 38000, costMat: { void_shard: 6, star_fragment: 3 }, bladeColor: 0xfde047, glowColor: 0xf59e0b
    },
    wpn_god: {
        id: 'wpn_god', name: '創世神剣アルテマ', icon: '👑', category: 'sword', shape: 'god',
        atk: 5200, mag: 2.2, costGold: 120000, costMat: { star_fragment: 8 }, bladeColor: 0xffffff, glowColor: 0xf472b6
    },
    staff_apprentice: {
        id: 'staff_apprentice', name: '見習いの星木杖', icon: '🪄', category: 'staff', shape: 'staff',
        atk: 18, mag: 1.35, costGold: 150, costMat: { slime_gel: 2 }, bladeColor: 0x92400e, glowColor: 0xc084fc
    },
    staff_crystal: {
        id: 'staff_crystal', name: '蒼水晶の魔導杖', icon: '🔮', category: 'staff', shape: 'staff',
        atk: 80, mag: 1.65, costGold: 900, costMat: { ancient_sap: 4, goblin_fang: 3 }, bladeColor: 0x0284c7, glowColor: 0x38bdf8
    },
    staff_archmage: {
        id: 'staff_archmage', name: '大賢者の賢者杖', icon: '✨', category: 'staff', shape: 'staff',
        atk: 280, mag: 2.05, costGold: 4000, costMat: { fire_core: 3, ice_crystal: 3 }, bladeColor: 0x7e22ce, glowColor: 0xf472b6
    },
    staff_astral: {
        id: 'staff_astral', name: '星辰の天球儀ロッド', icon: '🌌', category: 'staff', shape: 'staff',
        atk: 1050, mag: 2.55, costGold: 30000, costMat: { void_shard: 5, star_fragment: 4 }, bladeColor: 0x1e1b4b, glowColor: 0xfde047
    },
    staff_genesis: {
        id: 'staff_genesis', name: '創世神杖コスモス', icon: '🌟', category: 'staff', shape: 'staff',
        atk: 3900, mag: 3.3, costGold: 115000, costMat: { star_fragment: 8 }, bladeColor: 0xfde047, glowColor: 0x38bdf8
    }
};

window.ARMORS = {
    arm_cloth: {
        id: 'arm_cloth', name: '旅人の布マント', icon: '👕', hp: 20, mp: 10, def: 0.04,
        costGold: 0, costMat: {}, plateColor: 0x38bdf8, trimColor: 0x94a3b8, capeColor: 0x0284c7, tierLook: 0
    },
    arm_leather: {
        id: 'arm_leather', name: '冒険者の革鎧', icon: '🦺', hp: 90, mp: 30, def: 0.10,
        costGold: 240, costMat: { slime_gel: 4 }, plateColor: 0xb45309, trimColor: 0xfbbf24, capeColor: 0x78350f, tierLook: 1
    },
    arm_iron: {
        id: 'arm_iron', name: '重装騎士プレート', icon: '🛡️', hp: 280, mp: 75, def: 0.18,
        costGold: 1100, costMat: { goblin_fang: 5 }, plateColor: 0xcbd5e1, trimColor: 0x38bdf8, capeColor: 0x1d4ed8, tierLook: 2
    },
    arm_mythril: {
        id: 'arm_mythril', name: 'ミスリル聖光鎧', icon: '✨', hp: 780, mp: 190, def: 0.28,
        costGold: 4600, costMat: { ancient_sap: 5, ice_crystal: 3 }, plateColor: 0x7dd3fc, trimColor: 0xfde047, capeColor: 0x4f46e5, tierLook: 3
    },
    arm_dragon: {
        id: 'arm_dragon', name: '虚無竜鱗の覇王鎧', icon: '🐉', hp: 2300, mp: 480, def: 0.38,
        costGold: 20000, costMat: { void_shard: 5, fire_core: 4 }, plateColor: 0x991b1b, trimColor: 0xfacc15, capeColor: 0x450a0a, tierLook: 4
    },
    arm_celestial: {
        id: 'arm_celestial', name: '創世神装セラフィム', icon: '👑', hp: 7000, mp: 1500, def: 0.50,
        costGold: 95000, costMat: { star_fragment: 7 }, plateColor: 0xfef08a, trimColor: 0xf472b6, capeColor: 0xffffff, tierLook: 5
    }
};

window.ACCESSORIES = {
    acc_none: { id: 'acc_none', name: 'なし', icon: '➖', desc: '装備なし', atkPct: 0, hpPct: 0, crit: 0, cdRed: 0, rewardMult: 1.0, costGold: 0, costMat: {} },
    acc_power_ring: {
        id: 'acc_power_ring', name: '剛力のルビー指輪', icon: '💍', desc: '攻撃力 +18% / 会心 +4%',
        atkPct: 0.18, hpPct: 0, crit: 0.04, cdRed: 0, rewardMult: 1.0, costGold: 600, costMat: { goblin_fang: 3 }
    },
    acc_life_charm: {
        id: 'acc_life_charm', name: '生命の翡翠護符', icon: '📿', desc: '最大HP +28% / 攻撃 +8%',
        atkPct: 0.08, hpPct: 0.28, crit: 0, cdRed: 0, rewardMult: 1.0, costGold: 1800, costMat: { ancient_sap: 4 }
    },
    acc_haste_pendant: {
        id: 'acc_haste_pendant', name: '疾風の星屑ペンダント', icon: '⚡', desc: 'スキルCT短縮 +14% / 会心 +8%',
        atkPct: 0.08, hpPct: 0.10, crit: 0.08, cdRed: 0.14, rewardMult: 1.0, costGold: 5500, costMat: { ice_crystal: 4 }
    },
    acc_greed_crown: {
        id: 'acc_greed_crown', name: '黄金の幸運ブローチ', icon: '💰', desc: '獲得EXP・G +35% / 攻撃 +15%',
        atkPct: 0.15, hpPct: 0.15, crit: 0.05, cdRed: 0.05, rewardMult: 1.35, costGold: 16000, costMat: { void_shard: 4 }
    },
    acc_god_crest: {
        id: 'acc_god_crest', name: '創世神の無限聖印', icon: '🌟', desc: '攻撃+35% / HP+35% / 会心+12% / 報酬+50%',
        atkPct: 0.35, hpPct: 0.35, crit: 0.12, cdRed: 0.15, rewardMult: 1.50, costGold: 110000, costMat: { star_fragment: 5 }
    }
};

window.ENCHANT_POOL = [
    { id: 'ench_atk',   label: '⚔️ 猛攻の輝き (攻撃+15%)',       atkPct: 0.15 },
    { id: 'ench_crit',  label: '💥 会心の極意 (会心+10%/ダメ+0.3)', crit: 0.10, critDmg: 0.30 },
    { id: 'ench_hp',    label: '❤️ 生命の祝福 (最大HP+22%)',      hpPct: 0.22 },
    { id: 'ench_def',   label: '🛡️ 鉄壁の守護 (軽減+8%/HP+12%)',  def: 0.08, hpPct: 0.12 },
    { id: 'ench_haste', label: '⚡ 神速の加護 (CT短縮+12%)',       cdRed: 0.12 },
    { id: 'ench_vamp',  label: '🦇 吸血の魔印 (HP吸収+5%)',       lifesteal: 0.05 },
    { id: 'ench_boss',  label: '🐉 覇王殺し (ボス特効+25%)',       bossDmg: 0.25 }
];

window.EVOLUTIONS = {
    novice: {
        id: 'novice', name: '見習い顔文字', kaomoji: '(´・ω・`)', color: '#38bdf8', hexColor: 0x38bdf8,
        isMageJob: false, bonusText: '剣・杖どちらも装備可能（バランス型）',
        reqLv: 1, costGold: 0, reqMat: {}, atkBonus: 0, magBonus: 0, hpBonus: 0
    },
    warrior: {
        id: 'warrior', name: '剛腕ブレイブ剣士', kaomoji: '(｀・ω・´)', color: '#f97316', hexColor: 0xf97316,
        isMageJob: false, bonusText: '物理攻撃+30% / 最大HP+20%（剣専用）',
        reqLv: 5, costGold: 400, reqMat: { slime_gel: 3 }, atkBonus: 0.30, magBonus: 0, hpBonus: 0.20
    },
    mage: {
        id: 'mage', name: '星詠み魔道士', kaomoji: '(☆ω☆)', color: '#c084fc', hexColor: 0xc084fc,
        isMageJob: true, bonusText: '魔法倍率+40% / 遠距離魔法弾（杖専用）',
        reqLv: 5, costGold: 400, reqMat: { ancient_sap: 2 }, atkBonus: 0, magBonus: 0.40, hpBonus: 0.10
    },
    paladin: {
        id: 'paladin', name: '聖銀の守護騎士', kaomoji: '( •̀ᄇ• ́)ﻭ✧', color: '#34d399', hexColor: 0x34d399,
        isMageJob: false, bonusText: '最大HP+55% / 物理攻撃+35%（剣専用）',
        reqLv: 15, costGold: 2200, reqMat: { goblin_fang: 5, ancient_sap: 4 }, atkBonus: 0.35, magBonus: 0.15, hpBonus: 0.55
    },
    archmage: {
        id: 'archmage', name: '真理の大賢者', kaomoji: '✧*｡٩(ˊᗜˋ*)و✧*｡', color: '#818cf8', hexColor: 0x818cf8,
        isMageJob: true, bonusText: '魔法倍率+85% / 最大HP+25%（杖専用）',
        reqLv: 15, costGold: 2200, reqMat: { ancient_sap: 5, ice_crystal: 2 }, atkBonus: 0.10, magBonus: 0.85, hpBonus: 0.25
    },
    berserker: {
        id: 'berserker', name: '紅蓮の修羅王', kaomoji: '꧁(╬◣д◢)꧂', color: '#f43f5e', hexColor: 0xf43f5e,
        isMageJob: false, bonusText: '物理攻撃+110% / 最大HP+45%（剣専用）',
        reqLv: 30, costGold: 9500, reqMat: { fire_core: 5, void_shard: 2 }, atkBonus: 1.10, magBonus: 0.10, hpBonus: 0.45
    },
    void_witch: {
        id: 'void_witch', name: '深淵の星屑魔女', kaomoji: '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧', color: '#e879f9', hexColor: 0xe879f9,
        isMageJob: true, bonusText: '魔法倍率+140% / 最大HP+35%（杖専用）',
        reqLv: 30, costGold: 9500, reqMat: { ice_crystal: 5, star_fragment: 2 }, atkBonus: 0.15, magBonus: 1.40, hpBonus: 0.35
    },
    myth_god: {
        id: 'myth_god', name: '創世神カオモジ', kaomoji: '👑(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧', color: '#fde047', hexColor: 0xfde047,
        isMageJob: false, bonusText: '全攻撃・魔法・HP +180% / 剣・杖どちらも装備可能！',
        reqLv: 60, costGold: 45000, reqMat: { void_shard: 5, star_fragment: 4 }, atkBonus: 1.80, magBonus: 1.80, hpBonus: 1.80
    }
};

window.canEquipWeaponForJob = function(wpn, evo) {
    if (!wpn || !evo) return true;
    if (evo.id === 'novice' || evo.id === 'myth_god') return true;
    if (evo.isMageJob) return wpn.category === 'staff';
    return wpn.category === 'sword';
};

window.SKILLS = {
    slash_arc: {
        id: 'slash_arc', name: '一閃スラッシュ', icon: '⚔️', type: 'SINGLE_DMG',
        mp: 8, cd: 2.8, mult: 1.8, desc: '鋭い三日月斬撃波を放つ基本剣技'
    },
    whirlwind: {
        id: 'whirlwind', name: '疾風トルネード斬', icon: '🌪️', type: 'AOE_DMG',
        mp: 14, cd: 4.8, mult: 1.65, radius: 6.5, desc: '周囲の敵を竜巻の刃で薙ぎ払う範囲技'
    },
    chabudai_flip: {
        id: 'chabudai_flip', name: '激怒のちゃぶ台返し', icon: '┻', type: 'INTERRUPT',
        mp: 16, cd: 6.5, mult: 1.9, desc: 'ちゃぶ台をひっくり返しボスの大技詠唱を強制中断＆気絶！'
    },
    fire_meteor: {
        id: 'fire_meteor', name: '紅蓮ファイアメテオ', icon: '🔥', type: 'AOE_BURN',
        mp: 20, cd: 6.0, mult: 2.0, radius: 7.0, desc: '業火の衝撃で広範囲を焼き尽くし炎上ダメージを与える'
    },
    ice_nova: {
        id: 'ice_nova', name: '絶対零度ノヴァ', icon: '❄️', type: 'AOE_SLOW',
        mp: 22, cd: 7.0, mult: 2.05, radius: 7.5, desc: '極寒の氷結波動で範囲ダメージ＆移動速度低下'
    },
    thunder_bolt: {
        id: 'thunder_bolt', name: '紫電サンダーボルト', icon: '⚡', type: 'SINGLE_DMG',
        mp: 18, cd: 5.0, mult: 2.6, desc: '標的の頭上から神罰の落雷を落とす高火力単体技'
    },
    laser_beam: {
        id: 'laser_beam', name: '極光レーザービーム', icon: '🔦', type: 'AOE_DMG',
        mp: 24, cd: 6.2, mult: 2.3, radius: 8.0, desc: '前方に高出力エネルギー光線を放つ貫通技'
    },
    void_drain: {
        id: 'void_drain', name: '深淵ダークグラビティ', icon: '🌑', type: 'DRAIN',
        mp: 20, cd: 6.0, mult: 2.1, desc: '闇の重力球で敵の生命力を奪いHPを吸収する'
    },
    heal_light: {
        id: 'heal_light', name: '癒しのホーリーヒール', icon: '💚', type: 'HEAL',
        mp: 18, cd: 7.5, baseRatio: 0.35, desc: '聖なる祝福の光で自分のHPを回復する'
    },
    aegis_guard: {
        id: 'aegis_guard', name: '神聖イージスシールド', icon: '🛡️', type: 'DEF_BUFF',
        mp: 22, cd: 11.0, desc: '短時間無敵バリアを張り被ダメージを大幅軽減'
    },
    war_cry: {
        id: 'war_cry', name: '覇王のウォークライ', icon: '📢', type: 'ATK_BUFF',
        mp: 22, cd: 12.0, desc: '闘気を解放し一定時間すべての攻撃力を大幅アップ！'
    },
    aurora_sanctuary: {
        id: 'aurora_sanctuary', name: '極光のオーロラ聖域', icon: '🌈', type: 'HEAL_MP',
        mp: 30, cd: 14.0, baseRatio: 0.32, desc: '極光の聖域を展開しHP＆MP回復＋味方全体強化！'
    },
    genesis_bigbang: {
        id: 'genesis_bigbang', name: '創世ビッグバン', icon: '☄️', type: 'AOE_DMG',
        mp: 42, cd: 10.5, mult: 3.6, radius: 9.5, desc: '宇宙規模の超新星爆発を起こす究極奥義！'
    }
};

window.SKILL_TREE_NODES = [
    { id: 'atk_boost',    icon: '⚔️', name: '剛力の極意',     maxLv: 20, desc: '1Lvごとに攻撃力 +6%' },
    { id: 'hp_boost',     icon: '❤️', name: '不屈の生命力',   maxLv: 20, desc: '1Lvごとに最大HP +7%' },
    { id: 'crit_boost',   icon: '💥', name: '致命の一撃',     maxLv: 15, desc: '1Lvごとに会心率 +3%' },
    { id: 'cd_boost',     icon: '⚡', name: '高速詠唱',       maxLv: 15, desc: '1LvごとにスキルCT短縮 +3%' },
    { id: 'boss_slayer',  icon: '🐉', name: '覇王討伐の心得', maxLv: 15, desc: '1Lvごとにボス特効 +8%' },
    { id: 'lifesteal',    icon: '🦇', name: '生命吸収の魔導', maxLv: 15, desc: '1Lvごとに与ダメHP吸収 +1.5%' },
    { id: 'greed_wisdom', icon: '💰', name: '黄金の冒険者',   maxLv: 15, desc: '1Lvごとに獲得EXP・G +8%' },
    { id: 'twin_star',    icon: '♊', name: '双子星の連撃',   maxLv: 9,  desc: '1Lvごとにスキル2連発動率 +5%' },
    { id: 'vital_flow',   icon: '🌿', name: '自然治癒の泉',   maxLv: 15, desc: '1LvごとにHP自然回復速度アップ' },
    { id: 'mana_flow',    icon: '💧', name: '無限の魔力循環', maxLv: 15, desc: '1LvごとにMP自然回復速度 +15%' }
];

window.COSMETICS = {
    none:          { id: 'none',          name: 'なし',               icon: '➖', desc: '標準スタイル',           costGold: 0,     costMat: {} },
    sprout:        { id: 'sprout',        name: 'ふたばの芽',         icon: '🌱', desc: 'ぴょこんと可愛い双葉',   costGold: 150,   costMat: { slime_gel: 2 } },
    cat_ears:      { id: 'cat_ears',      name: 'ネコミミ',           icon: '🐱', desc: 'キュートな猫耳',         costGold: 450,   costMat: { slime_gel: 4 } },
    bunny_ears:    { id: 'bunny_ears',    name: 'うさみみ',           icon: '🐰', desc: 'ぴょこぴょこ長い耳',     costGold: 650,   costMat: { goblin_fang: 3 } },
    fox_ears:      { id: 'fox_ears',      name: 'きつねみみ',         icon: '🦊', desc: 'お稲荷様の黄金耳',       costGold: 1200,  costMat: { ancient_sap: 3 } },
    cat_headphone: { id: 'cat_headphone', name: '猫耳ヘッドホン',     icon: '🎧', desc: 'サイバー猫耳ヘッドホン', costGold: 2600,  costMat: { goblin_fang: 5 } },
    witch_hat:     { id: 'witch_hat',     name: '星詠みの魔女帽',     icon: '🧙', desc: '星飾り付きとんがり帽子', costGold: 4200,  costMat: { ancient_sap: 5 } },
    demon_horns:   { id: 'demon_horns',   name: '魔王の紅蓮角',       icon: '😈', desc: '威厳ある真紅の双角',     costGold: 8500,  costMat: { fire_core: 5 } },
    angel_halo:    { id: 'angel_halo',    name: '天使の光輪',         icon: '😇', desc: '頭上に輝く聖なるリング', costGold: 15000, costMat: { ice_crystal: 4 } },
    royal_crown:   { id: 'royal_crown',   name: '創世の黄金王冠',     icon: '👑', desc: '宝石が輝く黄金王冠',     costGold: 35000, costMat: { star_fragment: 2 } }
};

window.BACK_COSMETICS = {
    back_none:   { id: 'back_none',   name: 'なし',             icon: '➖', desc: '背中装備なし',         costGold: 0,     costMat: {} },
    cat_tail:    { id: 'cat_tail',    name: 'ゆらゆら猫しっぽ', icon: '🐈', desc: 'ご機嫌に揺れるしっぽ', costGold: 400,   costMat: { slime_gel: 3 } },
    fox_tails:   { id: 'fox_tails',   name: '三尾の妖狐しっぽ', icon: '🦊', desc: 'もふもふの3本しっぽ', costGold: 2800,  costMat: { fire_core: 3 } },
    hero_cape:   { id: 'hero_cape',   name: '真紅の勇者マント', icon: '🧣', desc: '金縁付きの英雄マント', costGold: 4500,  costMat: { goblin_fang: 5 } },
    demon_wings: { id: 'demon_wings', name: '漆黒の堕天使翼',   icon: '🦇', desc: '闇の魔力を纏う翼',     costGold: 12000, costMat: { void_shard: 4 } },
    angel_wings: { id: 'angel_wings', name: '純白のセラフ翼',   icon: '🕊️', desc: '神々しい純白の翼',     costGold: 18000, costMat: { ice_crystal: 5 } },
    flame_aura:  { id: 'flame_aura',  name: '創世の黄金光背輪', icon: '🔆', desc: '背中で回転する神の光輪', costGold: 42000, costMat: { star_fragment: 3 } }
};

window.KAOMOJI_PRESETS = [
    '(´・ω・`)', '(≧▽≦)', '(｀・ω・´)', '(=^・ω・^=)', '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧',
    '(☆ω☆)', '( •̀ᄇ• ́)ﻭ✧', '꧁(╬◣д◢)꧂', '(๑•̀ㅂ•́)و✧', '(´；ω；`)',
    '✧*｡٩(ˊᗜˋ*)و✧*｡', '(╯°□°）╯︵ ┻━┻'
];

window.BODY_COLOR_PRESETS = [
    { name: '職業色',     hex: '' },
    { name: 'スカイ',     hex: '#38bdf8' },
    { name: 'サクラ',     hex: '#f472b6' },
    { name: 'エメラルド', hex: '#10b981' },
    { name: 'サンセット', hex: '#f97316' },
    { name: 'アメジスト', hex: '#a855f7' },
    { name: 'ゴールド',   hex: '#facc15' },
    { name: 'スノー',     hex: '#f8fafc' },
    { name: 'ナイト',     hex: '#334155' }
];

window.FACE_BG_PRESETS = [
    { name: 'ディープブルー', hex: '#073b66' },
    { name: 'サイバー黒',     hex: '#090d16' },
    { name: 'ロイヤル紫',     hex: '#3b0764' },
    { name: 'クリムゾン',     hex: '#450a0a' },
    { name: 'フォレスト',     hex: '#064e3b' }
];

window.BODY_SCALE_PRESETS = [
    { name: 'ちび (0.85x)', scale: 0.85 },
    { name: '標準 (1.0x)',  scale: 1.0 },
    { name: '大きめ (1.2x)', scale: 1.2 }
];

window.PETS = {
    pet_slime: {
        id: 'pet_slime', name: 'ぷるぷるスライム', kaomoji: '(・ω・)', color: 0x34d399,
        desc: '定期攻撃＋プレイヤーHPを少しずつ癒やす', atkRatio: 0.45, healRatio: 0.04, mpRestore: 0.02,
        costGold: 300, costMat: { slime_gel: 4 }
    },
    pet_cat: {
        id: 'pet_cat', name: 'にゃんこ剣士', kaomoji: '(=^・ω・^=)', color: 0xf472b6,
        desc: '素早い連撃で敵を引っ掻くアタッカー相棒', atkRatio: 0.85, healRatio: 0.02, mpRestore: 0.02,
        costGold: 1200, costMat: { goblin_fang: 4 }
    },
    pet_fox: {
        id: 'pet_fox', name: '妖狐コンコン', kaomoji: '🦊(・ω・)', color: 0xf59e0b,
        desc: '鬼火攻撃＋MPをこまめに回復してくれる', atkRatio: 0.95, healRatio: 0.03, mpRestore: 0.08,
        costGold: 3600, costMat: { fire_core: 3 }
    },
    pet_fairy: {
        id: 'pet_fairy', name: '星屑の精霊姫', kaomoji: '(ﾉ◕ヮ◕)ﾉ✧', color: 0x38bdf8,
        desc: 'HPとMPの両方を大きく回復する万能ヒーラー', atkRatio: 0.80, healRatio: 0.09, mpRestore: 0.12,
        costGold: 9500, costMat: { ancient_sap: 6, ice_crystal: 3 }
    },
    pet_dragon: {
        id: 'pet_dragon', name: 'ちび古竜イグニス', kaomoji: '🐉(｀・ω・´)', color: 0xef4444,
        desc: '灼熱ブレスで大ダメージを与える最強クラスの相棒', atkRatio: 1.75, healRatio: 0.04, mpRestore: 0.05,
        costGold: 28000, costMat: { void_shard: 5 }
    },
    pet_angel: {
        id: 'pet_angel', name: '創世のミニ天使', kaomoji: '😇✧*｡', color: 0xfde047,
        desc: '超火力光線＋HP/MP大回復の神話級パートナー', atkRatio: 2.40, healRatio: 0.12, mpRestore: 0.15,
        costGold: 85000, costMat: { star_fragment: 5 }
    }
};

window.TITLES = {
    title_none:   { id: 'title_none',   name: '称号なし',           bonusText: 'ボーナスなし',          atkPct: 0,    hpPct: 0,    crit: 0 },
    title_novice: { id: 'title_novice', name: '🌱 駆け出し冒険者',   bonusText: '攻撃+5% / HP+10%',      atkPct: 0.05, hpPct: 0.10, crit: 0.02 },
    title_hunter: { id: 'title_hunter', name: '⚔️ 百獣の討伐者',    bonusText: '攻撃+15% / 会心+5%',    atkPct: 0.15, hpPct: 0.10, crit: 0.05 },
    title_boss:   { id: 'title_boss',   name: '👑 魔王を討つ者',     bonusText: '攻撃+22% / HP+20%',     atkPct: 0.22, hpPct: 0.20, crit: 0.06 },
    title_tower:  { id: 'title_tower',  name: '🗼 試練の踏破者',     bonusText: '攻撃+30% / 会心+10%',   atkPct: 0.30, hpPct: 0.25, crit: 0.10 },
    title_god:    { id: 'title_god',    name: '🌟 顔文字界の創世神', bonusText: '攻撃+50% / HP+50% / 会心+15%', atkPct: 0.50, hpPct: 0.50, crit: 0.15 }
};

window.ACHIEVEMENTS = [
    { id: 'ach_lv5',     name: 'はじめての成長',     desc: 'プレイヤーLv.5に到達',   key: 'lv',             req: 5,  rewardAp: 5,  rewardSp: 2,  titleId: 'title_novice' },
    { id: 'ach_kill30',  name: 'モンスターハンター', desc: 'モンスターを30体討伐', key: 'kills',          req: 30, rewardAp: 8,  rewardSp: 3,  titleId: 'title_hunter' },
    { id: 'ach_boss5',   name: '強敵撃破の証',       desc: 'エリアボスを5体討伐',    key: 'bossKills',      req: 5,  rewardAp: 12, rewardSp: 4,  titleId: 'title_boss' },
    { id: 'ach_tower10', name: '試練の塔 10F突破',   desc: '試練の塔で10階に到達',   key: 'bestTowerFloor', req: 10, rewardAp: 15, rewardSp: 5,  titleId: 'title_tower' },
    { id: 'ach_lv50',    name: '伝説の英雄',         desc: 'プレイヤーLv.50に到達',  key: 'lv',             req: 50, rewardAp: 30, rewardSp: 10, titleId: 'title_god' }
];

window.ZONES = {
    town: {
        id: 'town', stageNum: 0, name: '始まりの顔文字広場', recLv: 1, safe: true,
        skyColor: 0x0284c7, groundColor: 0x16a34a,
        desc: '安全街。HP/MPが高速回復し、ワープ陣から各ステージや試練の塔へ出発できます。',
        monsters: []
    },
    meadow: {
        id: 'meadow', stageNum: 1, name: 'ぷるぷる草原', recLv: 1, safe: false,
        skyColor: 0x0ea5e9, groundColor: 0x22c55e,
        desc: '初心者向けの穏やかな草原。スライムやゴブリンが生息しています。',
        monsters: [
            { name: 'ぷるスライム',   kaomoji: '(・ω・)',     lv: 1, hp: 55,   atk: 7,   exp: 22,  gold: 18,  color: 0x10b981, scale: 1.0,  count: 6, drop: 'slime_gel' },
            { name: 'ちびゴブリン',   kaomoji: '(｀皿´)',     lv: 3, hp: 105,  atk: 13,  exp: 38,  gold: 30,  color: 0x84cc16, scale: 1.05, count: 4, drop: 'goblin_fang' },
            { name: 'キングスライム', kaomoji: '👑(・ω・)',   lv: 6, hp: 440,  atk: 26,  exp: 190, gold: 165, color: 0x059669, scale: 2.0,  count: 1, isBoss: true, drop: 'slime_gel' }
        ]
    },
    forest: {
        id: 'forest', stageNum: 2, name: '妖精の迷い森', recLv: 6, safe: false,
        skyColor: 0x065f46, groundColor: 0x14532d,
        desc: '神秘的な樹海。精霊やトレントから古代樹の霊液が手に入ります。',
        monsters: [
            { name: 'もり精霊',     kaomoji: '(｡･ω･｡)',     lv: 7,  hp: 230,  atk: 25,  exp: 78,  gold: 62,  color: 0x34d399, scale: 1.05, count: 6, drop: 'ancient_sap' },
            { name: 'おこトレント', kaomoji: '(╬ﾟ皿ﾟ)',     lv: 10, hp: 380,  atk: 35,  exp: 120, gold: 95,  color: 0x92400e, scale: 1.25, count: 4, drop: 'goblin_fang' },
            { name: '森の守護大樹', kaomoji: '🌳(╬◣д◢)',   lv: 14, hp: 1500, atk: 64,  exp: 540, gold: 460, color: 0x15803d, scale: 2.15, count: 1, isBoss: true, drop: 'ancient_sap' }
        ]
    },
    ruins: {
        id: 'ruins', stageNum: 3, name: '古代の石像遺跡', recLv: 14, safe: false,
        skyColor: 0x334155, groundColor: 0x475569,
        desc: '古代文明の遺構。硬いゴーレムや装甲騎士が徘徊しています。',
        monsters: [
            { name: '遺跡ゴーレム', kaomoji: '【・_・】',     lv: 15, hp: 700,  atk: 60,  exp: 220,  gold: 180,  color: 0x64748b, scale: 1.2,  count: 6, drop: 'goblin_fang' },
            { name: '呪いの鎧騎士', kaomoji: '⚔️(◣_◢)',    lv: 19, hp: 1020, atk: 80,  exp: 320,  gold: 260,  color: 0x4f46e5, scale: 1.25, count: 4, drop: 'ancient_sap' },
            { name: '古代の巨神兵', kaomoji: '🗿꧁(╬◣д◢)꧂', lv: 24, hp: 4400, atk: 145, exp: 1450, gold: 1250, color: 0x38bdf8, scale: 2.25, count: 1, isBoss: true, drop: 'fire_core' }
        ]
    },
    volcano: {
        id: 'volcano', stageNum: 4, name: '灼熱の黒曜火山', recLv: 25, safe: false,
        skyColor: 0x7f1d1d, groundColor: 0x450a0a,
        desc: 'マグマが噴き上がる危険地帯。紅蓮の炎核がドロップします。',
        monsters: [
            { name: 'マグマボム',   kaomoji: '🔥(＞＜)',       lv: 26, hp: 2200,  atk: 140, exp: 640,  gold: 540,  color: 0xf97316, scale: 1.15, count: 6, drop: 'fire_core' },
            { name: 'サラマンダー', kaomoji: '🦎(｀皿´)',     lv: 30, hp: 3200,  atk: 180, exp: 900,  gold: 760,  color: 0xef4444, scale: 1.3,  count: 4, drop: 'fire_core' },
            { name: '紅蓮の炎帝竜', kaomoji: '🐉꧁(╬◣д◢)꧂', lv: 36, hp: 14000, atk: 330, exp: 4000, gold: 3500, color: 0xdc2626, scale: 2.4,  count: 1, isBoss: true, isRaidBoss: true, drop: 'fire_core' }
        ]
    },
    glacier: {
        id: 'glacier', stageNum: 5, name: '絶界の氷河神殿', recLv: 40, safe: false,
        skyColor: 0x0c4a6e, groundColor: 0x0369a1,
        desc: 'すべてが凍てつく極寒の神殿。永久氷晶が眠っています。',
        monsters: [
            { name: 'ブリザード霊',   kaomoji: '❄️(；・∀・)',     lv: 42, hp: 7000,  atk: 320, exp: 1900,  gold: 1600,  color: 0x7dd3fc, scale: 1.2,  count: 6, drop: 'ice_crystal' },
            { name: '氷結の死神',     kaomoji: '💀(◣д◢)',       lv: 47, hp: 9800,  atk: 420, exp: 2700,  gold: 2300,  color: 0x38bdf8, scale: 1.35, count: 4, drop: 'ice_crystal' },
            { name: '絶対零度の氷龍', kaomoji: '❄️🐉꧁(╬◣д◢)꧂', lv: 55, hp: 44000, atk: 760, exp: 12000, gold: 10000, color: 0x0284c7, scale: 2.5,  count: 1, isBoss: true, isRaidBoss: true, drop: 'void_shard' }
        ]
    },
    abyss: {
        id: 'abyss', stageNum: 6, name: '終焉の星屑深淵', recLv: 60, safe: false,
        skyColor: 0x1e1b4b, groundColor: 0x090d16,
        desc: '宇宙の果ての最終決戦エリア。星屑の霊珠を持つ神話級ボスが君臨！',
        monsters: [
            { name: '深淵の星喰らい', kaomoji: '🌌(╬◣д◢)',       lv: 65, hp: 25000,  atk: 800,  exp: 6500,  gold: 5600,  color: 0xa855f7, scale: 1.3,  count: 6, drop: 'void_shard' },
            { name: '虚無の堕天使',   kaomoji: '😈꧁(◣_◢)꧂',     lv: 75, hp: 38000,  atk: 1080, exp: 9500,  gold: 8200,  color: 0xf43f5e, scale: 1.45, count: 4, drop: 'star_fragment' },
            { name: '創世の終焉魔王', kaomoji: '👑🌌꧁(╬◣д◢)꧂', lv: 90, hp: 165000, atk: 2000, exp: 45000, gold: 38000, color: 0xfde047, scale: 2.75, count: 1, isBoss: true, isRaidBoss: true, drop: 'star_fragment' }
        ]
    }
};

window.EMOTES = [
    { id: 'em_wave',   icon: '👋', kaomoji: '(≧▽≦)ﾉｼ',       label: 'やっほー',   msg: 'やっほー！よろしくね！' },
    { id: 'em_joy',    icon: '🎉', kaomoji: '✧*｡٩(ˊᗜˋ*)و✧*｡', label: 'やったー',   msg: 'やったー！最高！！' },
    { id: 'em_bow',    icon: '🙇', kaomoji: '(´・ω・`)ペコリ', label: 'ありがとう', msg: 'ありがとうございます！' },
    { id: 'em_dance',  icon: '💃', kaomoji: '♪(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧', label: 'ダンス',     msg: 'るんるんダンス♪' },
    { id: 'em_heart',  icon: '💖', kaomoji: '(*˘︶˘*).｡.:*♡', label: 'ハート',     msg: '大好き♡' },
    { id: 'em_rage',   icon: '💢', kaomoji: '(╯°□°）╯︵ ┻━┻', label: 'ちゃぶ台',   msg: 'うおおお！ちゃぶ台返し！！' },
    { id: 'em_cry',    icon: '😭', kaomoji: '(´；ω；`)',       label: 'えんえん',   msg: 'えんえん…助けて…' },
    { id: 'em_dogeza', icon: '🙏', kaomoji: 'orz ごめん！',     label: '土下座',     msg: 'ごめんなさいぃぃ！！' },
    { id: 'em_faint',  icon: '👻', kaomoji: '(×_×)昇天',       label: '気絶',       msg: 'もうダメ…魂が抜ける…' },
    { id: 'em_sleep',  icon: '💤', kaomoji: '(－ω－) zzZ',     label: 'おやすみ',   msg: 'ふぁ…眠くなってきた…zzZ' },
    { id: 'em_salute', icon: '🔥', kaomoji: '(｀・ω・´)ゞ',     label: '敬礼',       msg: '任せろ！全力で行くぞ！' },
    { id: 'em_dash',   icon: '💨', kaomoji: 'ε=ε=┏( >_<)┛',   label: 'ダッシュ',   msg: '急げ急げーっ！！' }
];
