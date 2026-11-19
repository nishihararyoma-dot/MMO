'use strict';

// =========================================================================
// 顔文字ファンタジー3D 完全マスターデータ＆UIブリッジ (data.js)
// =========================================================================

window.SAVE_KEY = 'kaomoji_fantasy_3d_save_v1';
window.MAX_PLAYER_LEVEL = 999;
window.MAX_PET_LEVEL = 999;
window.MAX_ENHANCE_LEVEL = 20;
window.MAX_THREAT_RANK = 50;

window.formatBigNum = function(n) {
    const v = Math.floor(Number(n) || 0);
    if (v >= 1e12) return (v / 1e12).toFixed(2) + '兆';
    if (v >= 1e8) return (v / 1e8).toFixed(2) + '億';
    if (v >= 1e4) return (v / 1e4).toFixed(1) + '万';
    return v.toLocaleString();
};

// サウンド効果音エンジン
window.sfx = {
    ctx: null,
    bgmMuted: false,
    init() {
        if (!this.ctx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (AC) this.ctx = new AC();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
    },
    playTone(freq = 520, type = 'sine', dur = 0.1, vol = 0.06, endFreq = null) {
        if (this.bgmMuted) return;
        try {
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, now);
            if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, now + dur);
            gain.gain.setValueAtTime(vol, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + dur);
        } catch (e) {}
    },
    playHit(crit = false) {
        this.playTone(crit ? 320 : 210, 'sawtooth', 0.09, crit ? 0.09 : 0.06, 85);
    },
    playSkill() {
        this.playTone(580, 'triangle', 0.16, 0.08, 920);
    },
    playHeal() {
        this.playTone(523, 'sine', 0.12, 0.07);
        setTimeout(() => this.playTone(659, 'sine', 0.16, 0.07), 70);
    },
    playLevelUp() {
        [523, 659, 784, 1046].forEach((f, i) => {
            setTimeout(() => this.playTone(f, 'triangle', 0.16, 0.08), i * 75);
        });
    }
};

// 顔文字モニターテクスチャ生成
const _faceTexCache = new Map();
window.getKaomojiFaceTexture = function(kaomoji, bgHex = '#073b66', textHex = '#ffffff', borderHex = '#38bdf8') {
    const key = `${kaomoji}|${bgHex}|${textHex}|${borderHex}`;
    if (_faceTexCache.has(key)) return _faceTexCache.get(key);

    const cvs = document.createElement('canvas');
    cvs.width = 256;
    cvs.height = 192;
    const ctx = cvs.getContext('2d');

    ctx.fillStyle = bgHex || '#073b66';
    ctx.fillRect(0, 0, 256, 192);

    ctx.strokeStyle = borderHex || '#38bdf8';
    ctx.lineWidth = 10;
    ctx.strokeRect(6, 6, 244, 180);

    const txt = String(kaomoji || '(´・ω・`)');
    let fontSize = 38;
    if (txt.length > 10) fontSize = 26;
    else if (txt.length > 7) fontSize = 31;

    ctx.fillStyle = textHex || '#ffffff';
    ctx.font = `bold ${fontSize}px "MS PGothic", "Hiragino Kaku Gothic ProN", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(txt, 128, 98);

    const tex = new THREE.CanvasTexture(cvs);
    _faceTexCache.set(key, tex);
    return tex;
};

// 素材マスター
window.MATERIALS = {
    slime_gel:     { id: 'slime_gel',     name: 'ぷるぷるゼリー', icon: '💧' },
    wood_piece:    { id: 'wood_piece',    name: '精霊の古木片',   icon: '🪵' },
    iron_ore:      { id: 'iron_ore',      name: '魔導鉄鉱石',     icon: '🪨' },
    magic_dust:    { id: 'magic_dust',    name: '妖精の輝き粉',   icon: '✨' },
    flame_core:    { id: 'flame_core',    name: '紅蓮の炎核',     icon: '🔥' },
    ice_crystal:   { id: 'ice_crystal',   name: '永久氷晶',       icon: '❄️' },
    dragon_scale:  { id: 'dragon_scale',  name: '古竜の逆鱗',     icon: '🐉' },
    star_fragment: { id: 'star_fragment', name: '星屑の欠片',     icon: '🌟' },
    god_essence:   { id: 'god_essence',   name: '創世の霊珠',     icon: '👑' }
};

window.MATERIAL_ALCHEMY = [
    { from: 'slime_gel',     to: 'wood_piece',    count: 5, gold: 120 },
    { from: 'wood_piece',    to: 'iron_ore',      count: 5, gold: 300 },
    { from: 'iron_ore',      to: 'magic_dust',    count: 5, gold: 700 },
    { from: 'magic_dust',    to: 'flame_core',    count: 5, gold: 1600 },
    { from: 'flame_core',    to: 'ice_crystal',   count: 5, gold: 3500 },
    { from: 'ice_crystal',   to: 'dragon_scale',  count: 5, gold: 8000 },
    { from: 'dragon_scale',  to: 'star_fragment', count: 5, gold: 18000 },
    { from: 'star_fragment', to: 'god_essence',   count: 5, gold: 45000 }
];

// 武器マスター（剣＆魔導杖）
window.WEAPONS = {
    wpn_wood: {
        id: 'wpn_wood', name: '冒険者の木の剣', icon: '🗡️', category: 'sword', shape: 'sword',
        atk: 12, mag: 1.0, costGold: 0, costMat: {}, bladeColor: 0xd97706, glowColor: 0x38bdf8
    },
    wpn_iron: {
        id: 'wpn_iron', name: '鋼鉄の騎士剣', icon: '⚔️', category: 'sword', shape: 'sword',
        atk: 36, mag: 1.05, costGold: 220, costMat: { slime_gel: 3 }, bladeColor: 0xe2e8f0, glowColor: 0x38bdf8
    },
    wpn_knight: {
        id: 'wpn_knight', name: '蒼穹の聖銀剣', icon: '🗡️', category: 'sword', shape: 'sword',
        atk: 95, mag: 1.15, costGold: 950, costMat: { iron_ore: 4, wood_piece: 3 }, bladeColor: 0x7dd3fc, glowColor: 0x0284c7
    },
    wpn_flame: {
        id: 'wpn_flame', name: '紅蓮の業火大剣', icon: '🔥', category: 'sword', shape: 'sword',
        atk: 240, mag: 1.25, costGold: 3400, costMat: { flame_core: 4, iron_ore: 5 }, bladeColor: 0xf97316, glowColor: 0xef4444
    },
    wpn_scythe: {
        id: 'wpn_scythe', name: '冥界の死神大鎌', icon: '🌙', category: 'sword', shape: 'scythe',
        atk: 620, mag: 1.45, costGold: 11000, costMat: { ice_crystal: 5, dragon_scale: 2 }, bladeColor: 0xa855f7, glowColor: 0xf43f5e
    },
    wpn_omega: {
        id: 'wpn_omega', name: 'オメガ星砕きブレイド', icon: '⚡', category: 'sword', shape: 'omega',
        atk: 1650, mag: 1.7, costGold: 36000, costMat: { dragon_scale: 6, star_fragment: 4 }, bladeColor: 0xfde047, glowColor: 0xf59e0b
    },
    wpn_god: {
        id: 'wpn_god', name: '創世神剣アルテマ', icon: '👑', category: 'sword', shape: 'god',
        atk: 4800, mag: 2.2, costGold: 120000, costMat: { star_fragment: 8, god_essence: 5 }, bladeColor: 0xffffff, glowColor: 0xf472b6
    },
    // 魔導杖（通常攻撃が遠距離魔法弾になる）
    staff_apprentice: {
        id: 'staff_apprentice', name: '見習いの星木杖', icon: '🪄', category: 'staff', shape: 'staff',
        atk: 18, mag: 1.35, costGold: 150, costMat: { slime_gel: 2 }, bladeColor: 0x92400e, glowColor: 0xc084fc
    },
    staff_crystal: {
        id: 'staff_crystal', name: '蒼水晶の魔導杖', icon: '🔮', category: 'staff', shape: 'staff',
        atk: 75, mag: 1.65, costGold: 880, costMat: { magic_dust: 4, wood_piece: 3 }, bladeColor: 0x0284c7, glowColor: 0x38bdf8
    },
    staff_archmage: {
        id: 'staff_archmage', name: '大賢者の賢者杖', icon: '✨', category: 'staff', shape: 'staff',
        atk: 260, mag: 2.05, costGold: 3800, costMat: { flame_core: 3, ice_crystal: 3 }, bladeColor: 0x7e22ce, glowColor: 0xf472b6
    },
    staff_astral: {
        id: 'staff_astral', name: '星辰の天球儀ロッド', icon: '🌌', category: 'staff', shape: 'staff',
        atk: 980, mag: 2.55, costGold: 28000, costMat: { dragon_scale: 4, star_fragment: 5 }, bladeColor: 0x1e1b4b, glowColor: 0xfde047
    },
    staff_genesis: {
        id: 'staff_genesis', name: '創世神杖コスモス', icon: '🌟', category: 'staff', shape: 'staff',
        atk: 3600, mag: 3.3, costGold: 115000, costMat: { star_fragment: 8, god_essence: 5 }, bladeColor: 0xfde047, glowColor: 0x38bdf8
    }
};

// 防具マスター
window.ARMORS = {
    arm_cloth: {
        id: 'arm_cloth', name: '旅人の布マント', icon: '👕', hp: 20, mp: 10, def: 0.04,
        costGold: 0, costMat: {}, plateColor: 0x38bdf8, trimColor: 0x94a3b8, capeColor: 0x0284c7, tierLook: 0
    },
    arm_leather: {
        id: 'arm_leather', name: '冒険者の革鎧', icon: '🦺', hp: 85, mp: 30, def: 0.10,
        costGold: 240, costMat: { slime_gel: 4 }, plateColor: 0xb45309, trimColor: 0xfbbf24, capeColor: 0x78350f, tierLook: 1
    },
    arm_iron: {
        id: 'arm_iron', name: '重装騎士プレート', icon: '🛡️', hp: 260, mp: 70, def: 0.18,
        costGold: 1100, costMat: { iron_ore: 5 }, plateColor: 0xcbd5e1, trimColor: 0x38bdf8, capeColor: 0x1d4ed8, tierLook: 2
    },
    arm_mythril: {
        id: 'arm_mythril', name: 'ミスリル聖光鎧', icon: '✨', hp: 720, mp: 180, def: 0.28,
        costGold: 4500, costMat: { magic_dust: 5, ice_crystal: 3 }, plateColor: 0x7dd3fc, trimColor: 0xfde047, capeColor: 0x4f46e5, tierLook: 3
    },
    arm_dragon: {
        id: 'arm_dragon', name: '古竜鱗の覇王鎧', icon: '🐉', hp: 2100, mp: 450, def: 0.38,
        costGold: 19000, costMat: { dragon_scale: 6, flame_core: 4 }, plateColor: 0x991b1b, trimColor: 0xfacc15, capeColor: 0x450a0a, tierLook: 4
    },
    arm_celestial: {
        id: 'arm_celestial', name: '創世神装セラフィム', icon: '👑', hp: 6500, mp: 1400, def: 0.50,
        costGold: 95000, costMat: { star_fragment: 7, god_essence: 4 }, plateColor: 0xfef08a, trimColor: 0xf472b6, capeColor: 0xffffff, tierLook: 5
    }
};

// 装飾品マスター
window.ACCESSORIES = {
    acc_none: { id: 'acc_none', name: 'なし', icon: '➖', desc: '装備なし', costGold: 0, costMat: {} },
    acc_power_ring: {
        id: 'acc_power_ring', name: '剛力のルビー指輪', icon: '💍', desc: '物理・魔法攻撃力 +18%',
        atkMult: 0.18, costGold: 600, costMat: { iron_ore: 3 }
    },
    acc_sage_amulet: {
        id: 'acc_sage_amulet', name: '賢者の星屑護符', icon: '📿', desc: '最大MP +35% / スキルCT短縮 +12%',
        mpMult: 0.35, cdBonus: 0.12, costGold: 1800, costMat: { magic_dust: 4 }
    },
    acc_vampire_fang: {
        id: 'acc_vampire_fang', name: '吸血姫の紅牙', icon: '🦇', desc: '与ダメージの 6% HP吸収',
        lifesteal: 0.06, costGold: 5200, costMat: { flame_core: 4 }
    },
    acc_boss_slayer: {
        id: 'acc_boss_slayer', name: '竜殺しの紋章', icon: '🐉', desc: 'ボスへの与ダメージ +30%',
        bossDmg: 0.30, costGold: 14000, costMat: { dragon_scale: 5 }
    },
    acc_twin_star: {
        id: 'acc_twin_star', name: '双子星の魔導符', icon: '♊', desc: '25%の確率でスキルが2連続発動！',
        doubleCast: 0.25, costGold: 38000, costMat: { star_fragment: 6 }
    },
    acc_god_crest: {
        id: 'acc_god_crest', name: '創世神の無限聖印', icon: '🌟', desc: '全攻撃+35% / 吸収5% / 2連発動20%',
        atkMult: 0.35, lifesteal: 0.05, doubleCast: 0.20, costGold: 110000, costMat: { god_essence: 5 }
    }
};

window.ENCHANT_POOL = [
    { id: 'ench_atk',   label: '⚔️ 猛攻の輝き (攻撃+15%)', atkBonus: 0.15 },
    { id: 'ench_crit',  label: '💥 会心の極意 (会心率+12%)', critBonus: 0.12 },
    { id: 'ench_hp',    label: '❤️ 生命の祝福 (最大HP+20%)', hpBonus: 0.20 },
    { id: 'ench_mp',    label: '💧 魔力の泉 (最大MP+25%)', mpBonus: 0.25 },
    { id: 'ench_haste', label: '⚡ 神速の加護 (CT短縮+10%)', cdBonus: 0.10 },
    { id: 'ench_greed', label: '💰 黄金の幸運 (EXP/G+20%)', rewardBonus: 0.20 }
];

window.getWeaponEnhanceRequirement = function(lv) {
    const n = Number(lv) || 0;
    const mats = {};
    if (n >= 1) mats.iron_ore = Math.min(10, 1 + Math.floor(n / 2));
    if (n >= 6) mats.magic_dust = Math.floor((n - 4) / 2);
    if (n >= 12) mats.star_fragment = Math.floor((n - 10) / 2);
    return { gold: Math.round(150 * Math.pow(1.38, n)), mats };
};

window.getArmorEnhanceRequirement = function(lv) {
    const n = Number(lv) || 0;
    const mats = {};
    if (n >= 1) mats.slime_gel = Math.min(10, 2 + Math.floor(n / 2));
    if (n >= 6) mats.ice_crystal = Math.floor((n - 4) / 2);
    if (n >= 12) mats.dragon_scale = Math.floor((n - 10) / 2);
    return { gold: Math.round(140 * Math.pow(1.36, n)), mats };
};

// 役職・転職マスター
window.EVOLUTIONS = {
    novice: {
        id: 'novice', name: '見習い顔文字', kaomoji: '(´・ω・`)', color: '#38bdf8', hexColor: 0x38bdf8,
        isMageJob: false, bonusText: '剣・杖どちらも装備可能（バランス型）',
        reqLv: 1, costGold: 0, reqMat: {}, atkMult: 1.0, magMult: 1.0, hpMult: 1.0, mpMult: 1.0
    },
    warrior: {
        id: 'warrior', name: '剛腕ブレイブ剣士', kaomoji: '(｀・ω・´)', color: '#f97316', hexColor: 0xf97316,
        isMageJob: false, bonusText: '物理攻撃+30% / 最大HP+20%（剣専用）',
        reqLv: 5, costGold: 400, reqMat: { slime_gel: 3 }, atkMult: 1.30, magMult: 1.0, hpMult: 1.20, mpMult: 1.0
    },
    mage: {
        id: 'mage', name: '星詠み魔道士', kaomoji: '(☆ω☆)', color: '#c084fc', hexColor: 0xc084fc,
        isMageJob: true, bonusText: '魔法攻撃+40% / 最大MP+35%（杖専用・遠距離魔法弾）',
        reqLv: 5, costGold: 400, reqMat: { magic_dust: 2 }, atkMult: 1.0, magMult: 1.40, hpMult: 1.0, mpMult: 1.35
    },
    paladin: {
        id: 'paladin', name: '聖銀の守護騎士', kaomoji: '( •̀ᄇ• ́)ﻭ✧', color: '#34d399', hexColor: 0x34d399,
        isMageJob: false, bonusText: '最大HP+55% / 物理攻撃+35% / 軽減+10%（剣専用）',
        reqLv: 15, costGold: 2200, reqMat: { iron_ore: 5, wood_piece: 4 }, atkMult: 1.35, magMult: 1.15, hpMult: 1.55, mpMult: 1.20
    },
    archmage: {
        id: 'archmage', name: '真理の大賢者', kaomoji: '✧*｡٩(ˊᗜˋ*)و✧*｡', color: '#818cf8', hexColor: 0x818cf8,
        isMageJob: true, bonusText: '魔法攻撃+85% / 最大MP+70% / CT短縮+12%（杖専用）',
        reqLv: 15, costGold: 2200, reqMat: { magic_dust: 5, ice_crystal: 2 }, atkMult: 1.05, magMult: 1.85, hpMult: 1.20, mpMult: 1.70
    },
    berserker: {
        id: 'berserker', name: '紅蓮の修羅王', kaomoji: '꧁(╬◣д◢)꧂', color: '#f43f5e', hexColor: 0xf43f5e,
        isMageJob: false, bonusText: '物理攻撃+110% / 会心ダメ+0.5（剣専用）',
        reqLv: 30, costGold: 9500, reqMat: { flame_core: 5, dragon_scale: 3 }, atkMult: 2.10, magMult: 1.1, hpMult: 1.45, mpMult: 1.1
    },
    void_witch: {
        id: 'void_witch', name: '深淵の星屑魔女', kaomoji: '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧', color: '#e879f9', hexColor: 0xe879f9,
        isMageJob: true, bonusText: '魔法攻撃+140% / 最大MP+120%（杖専用）',
        reqLv: 30, costGold: 9500, reqMat: { ice_crystal: 5, star_fragment: 3 }, atkMult: 1.1, magMult: 2.40, hpMult: 1.35, mpMult: 2.20
    },
    myth_god: {
        id: 'myth_god', name: '創世神カオモジ', kaomoji: '👑(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧', color: '#fde047', hexColor: 0xfde047,
        isMageJob: false, bonusText: '全ステータス+180% / 剣・杖どちらも装備可能！',
        reqLv: 60, costGold: 45000, reqMat: { star_fragment: 6, god_essence: 4 }, atkMult: 2.80, magMult: 2.80, hpMult: 2.50, mpMult: 2.50
    }
};

window.canEquipWeaponForJob = function(wpn, evo) {
    if (!wpn || !evo) return true;
    if (evo.id === 'novice' || evo.id === 'myth_god') return true;
    if (evo.isMageJob) return wpn.category === 'staff';
    return wpn.category === 'sword';
};

// スキルマスター
window.SKILLS = {
    power_slash: {
        id: 'power_slash', name: '一閃スラッシュ', icon: '⚔️', type: 'SINGLE_DMG',
        cd: 3.0, baseMp: 4, mult: 2.3, isSupport: false,
        desc: '目の前の敵に鋭い一撃を叩き込む基本奥義'
    },
    whirlwind: {
        id: 'whirlwind', name: '旋風斬り', icon: '🌪️', type: 'AOE_DMG',
        cd: 5.0, baseMp: 7, mult: 1.9, radius: 6.5, isSupport: false,
        desc: '周囲の敵すべてを巻き込む回転範囲攻撃'
    },
    shield_bash: {
        id: 'shield_bash', name: '破邪の衝撃撃', icon: '💥', type: 'INTERRUPT',
        cd: 7.0, baseMp: 8, mult: 2.1, isSupport: false,
        desc: '敵を気絶させ、ボスの大技詠唱を強制中断する！'
    },
    fire_nova: {
        id: 'fire_nova', name: '紅蓮ノヴァ', icon: '🔥', type: 'AOE_BURN',
        cd: 6.5, baseMp: 10, mult: 2.2, radius: 7.2, isSupport: false,
        desc: '業火の衝撃波で広範囲を焼き尽くし継続炎上を与える'
    },
    ice_blizzard: {
        id: 'ice_blizzard', name: '絶対零度ブリザード', icon: '❄️', type: 'AOE_SLOW',
        cd: 7.5, baseMp: 11, mult: 2.3, radius: 7.8, isSupport: false,
        desc: '極寒の吹雪で範囲ダメージ＆敵の移動速度を大幅低下'
    },
    thunder_bolt: {
        id: 'thunder_bolt', name: '天雷サンダー', icon: '⚡', type: 'THUNDER',
        cd: 5.5, baseMp: 9, mult: 3.1, isSupport: false,
        desc: '標的の頭上から神罰の落雷を落とす高火力単体魔法'
    },
    vampire_bite: {
        id: 'vampire_bite', name: 'ブラッドドレイン', icon: '🦇', type: 'DRAIN',
        cd: 6.0, baseMp: 9, mult: 2.4, isSupport: false,
        desc: '敵の生命力を奪い、与ダメージの35%分自分のHPを回復'
    },
    heal_light: {
        id: 'heal_light', name: '癒しの光', icon: '💚', type: 'HEAL',
        cd: 8.0, baseMp: 8, isSupport: true,
        desc: '聖なる光で自分のHPを即座に回復し気絶を解除する'
    },
    aegis_guard: {
        id: 'aegis_guard', name: '神域イージス', icon: '🛡️', type: 'DEF_BUFF',
        cd: 12.0, baseMp: 10, isSupport: true,
        desc: '短時間無敵バリアを張り、その後も被ダメージを大幅軽減'
    },
    war_cry: {
        id: 'war_cry', name: '覇王の咆哮', icon: '📢', type: 'ATK_BUFF',
        cd: 13.0, baseMp: 10, isSupport: true,
        desc: '闘気を解放し、一定時間すべての攻撃力を大幅アップ！'
    },
    aurora_sanctuary: {
        id: 'aurora_sanctuary', name: '極光の聖域', icon: '🌈', type: 'HEAL_MP',
        cd: 14.0, baseMp: 14, isSupport: true,
        desc: '【フィールド展開】8秒間、極光の聖域を展開し範囲内の自分と味方のHPを毎秒回復＋ATK/DEF/SPD強化！'
    },
    meteor_star: {
        id: 'meteor_star', name: '創世ビッグバン', icon: '☄️', type: 'AOE_DMG',
        cd: 11.0, baseMp: 18, mult: 4.5, radius: 9.5, isSupport: false,
        desc: '【創世超爆発】宇宙のビッグバンを引き起こし広範囲の敵に絶大なダメージ！'
    }
};

window.getSkillMpCost = function(sk, lv = 1) {
    const base = (sk && sk.baseMp) || 5;
    return base * 5 + Math.max(0, lv - 1) * 10;
};

window.getSkillEffectStats = function(sk, lv = 1, st = null) {
    const l = Math.max(1, Number(lv) || 1);
    if (sk.type === 'HEAL') {
        const hpPct = Math.min(0.95, 0.32 + l * 0.03);
        return { hpPct, summary: `HP ${Math.round(hpPct * 100)}%回復` };
    }
    if (sk.type === 'HEAL_MP') {
        const hpPct = Math.min(0.9, 0.28 + l * 0.025);
        const mpPct = Math.min(0.8, 0.22 + l * 0.02);
        return { hpPct, mpPct, summary: `HP${Math.round(hpPct * 100)}% & MP${Math.round(mpPct * 100)}%回復＋聖域バフ` };
    }
    if (sk.type === 'DEF_BUFF') {
        const invuln = 1.6 + Math.min(2.0, l * 0.08);
        const defBonus = Math.min(0.45, 0.20 + l * 0.01);
        return { invuln, duration: 8.0, defBonus, summary: `無敵${invuln.toFixed(1)}秒 + 軽減+${Math.round(defBonus * 100)}%` };
    }
    if (sk.type === 'ATK_BUFF') {
        const atkBonus = 0.35 + l * 0.04;
        return { duration: 9.0, atkBonus, summary: `攻撃力 +${Math.round(atkBonus * 100)}% (9秒)` };
    }
    const mult = ((sk && sk.mult) || 2.0) * (1 + (l - 1) * 0.14);
    return {
        mult,
        stunDur: 2.2 + Math.min(2.5, l * 0.1),
        drainRate: Math.min(0.75, 0.35 + l * 0.015),
        slowDur: 4.0,
        slowFactor: 0.42,
        summary: `威力倍率 ${mult.toFixed(2)}倍`
    };
};

// パッシブスキルツリー
window.SKILL_TREE_NODES = [
    { id: 'tree_atk',    icon: '⚔️', name: '剛力の極意',     maxLv: 20, desc: '1Lvごとに物理攻撃力 +5%' },
    { id: 'tree_mag',    icon: '🪄', name: '魔導の深淵',     maxLv: 20, desc: '1Lvごとに魔法攻撃力 +5%' },
    { id: 'tree_hp',     icon: '❤️', name: '不屈の生命力',   maxLv: 20, desc: '1Lvごとに最大HP +6%' },
    { id: 'tree_mp',     icon: '💧', name: '無限の魔力タンク', maxLv: 20, desc: '1Lvごとに最大MP +6%' },
    { id: 'tree_crit',   icon: '💥', name: '致命の一撃',     maxLv: 15, desc: '1Lvごとに会心率 +2% / 会心ダメ +0.08' },
    { id: 'tree_cd',     icon: '⚡', name: '高速詠唱',       maxLv: 15, desc: '1LvごとにスキルCT短縮 +2%' },
    { id: 'tree_regen',  icon: '🌿', name: '自然治癒と瞑想', maxLv: 15, desc: '1LvごとにHP/MP自然回復量が大幅上昇' },
    { id: 'tree_reward', icon: '💰', name: '黄金の冒険者',   maxLv: 15, desc: '1Lvごとに獲得EXP・ゴールド +6%' }
];

// 見た目パーツ（頭9種・背中6種）
window.COSMETICS = {
    none:           { id: 'none',           name: 'なし',             icon: '➖', desc: '標準スタイル',           costGold: 0,    costMat: {} },
    sprout:         { id: 'sprout',         name: 'ふたばの芽',       icon: '🌱', desc: 'ぴょこんと可愛い双葉',   costGold: 150,  costMat: { slime_gel: 2 } },
    cat_ears:       { id: 'cat_ears',       name: 'ネコミミ',         icon: '🐱', desc: 'キュートな猫耳',         costGold: 450,  costMat: { slime_gel: 4 } },
    bunny_ears:     { id: 'bunny_ears',     name: 'うさみみ',         icon: '🐰', desc: 'ぴょこぴょこ長い耳',     costGold: 650,  costMat: { wood_piece: 3 } },
    fox_ears:       { id: 'fox_ears',       name: 'きつねみみ',       icon: '🦊', desc: 'お稲荷様の黄金耳',       costGold: 1200, costMat: { magic_dust: 3 } },
    cat_headphone:  { id: 'cat_headphone',  name: 'サイバー猫耳ヘッドホン', icon: '🎧', desc: 'ネオンに光る猫耳', costGold: 2600, costMat: { iron_ore: 5 } },
    witch_hat:      { id: 'witch_hat',      name: '星詠みの魔女帽',   icon: '🧙', desc: '星飾り付きとんがり帽子', costGold: 4200, costMat: { magic_dust: 5 } },
    demon_horns:    { id: 'demon_horns',    name: '魔王の紅蓮角',     icon: '😈', desc: '威厳ある真紅の双角',     costGold: 8500, costMat: { flame_core: 5 } },
    angel_halo:     { id: 'angel_halo',     name: '天使の光輪',       icon: '😇', desc: '頭上に輝く聖なるリング', costGold: 15000, costMat: { star_fragment: 3 } },
    royal_crown:    { id: 'royal_crown',    name: '創世の黄金王冠',   icon: '👑', desc: '真紅の宝石が輝く王冠',   costGold: 35000, costMat: { god_essence: 2 } }
};

window.BACK_COSMETICS = {
    back_none:   { id: 'back_none',   name: 'なし',             icon: '➖', desc: '背中装備なし',           costGold: 0,     costMat: {} },
    cat_tail:    { id: 'cat_tail',    name: 'ゆらゆら猫しっぽ', icon: '🐈', desc: 'ご機嫌に揺れるしっぽ',   costGold: 400,   costMat: { slime_gel: 3 } },
    fox_tails:   { id: 'fox_tails',   name: '三尾の妖狐しっぽ', icon: '🦊', desc: 'もふもふの3本しっぽ',   costGold: 2800,  costMat: { flame_core: 3 } },
    hero_cape:   { id: 'hero_cape',   name: '真紅の勇者マント', icon: '🧣', desc: '金縁付きの英雄マント',   costGold: 4500,  costMat: { iron_ore: 5 } },
    demon_wings: { id: 'demon_wings', name: '漆黒の堕天使翼',   icon: '🦇', desc: '闇の魔力を纏う翼',       costGold: 12000, costMat: { dragon_scale: 4 } },
    angel_wings: { id: 'angel_wings', name: '純白のセラフ翼',   icon: '🕊️', desc: '神々しい純白の翼',       costGold: 18000, costMat: { star_fragment: 4 } },
    flame_aura:  { id: 'flame_aura',  name: '創世の黄金光背輪', icon: '🔆', desc: '背中で回転する神の光輪', costGold: 42000, costMat: { god_essence: 3 } }
};

window.KAOMOJI_PRESETS = [
    '(´・ω・`)', '(≧▽≦)', '(｀・ω・´)', '(=^・ω・^=)', '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧',
    '(☆ω☆)', '( •̀ᄇ• ́)ﻭ✧', '꧁(╬◣д◢)꧂', '(๑•̀ㅂ•́)و✧', '(´；ω；`)',
    '✧*｡٩(ˊᗜˋ*)و✧*｡', '(╯°□°）╯︵ ┻━┻'
];

window.BODY_COLOR_PRESETS = [
    { name: '職業色',   hex: '' },
    { name: 'スカイ',   hex: '#38bdf8' },
    { name: 'サクラ',   hex: '#f472b6' },
    { name: 'エメラルド', hex: '#10b981' },
    { name: 'サンセット', hex: '#f97316' },
    { name: 'アメジスト', hex: '#a855f7' },
    { name: 'ゴールド', hex: '#facc15' },
    { name: 'スノー',   hex: '#f8fafc' },
    { name: 'ナイト',   hex: '#334155' }
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

// 相棒ペットマスター
window.PETS = {
    pet_slime: {
        id: 'pet_slime', name: 'ぷるぷるスライム', kaomoji: '(・ω・)', color: 0x34d399,
        desc: '定期攻撃＋プレイヤーHPを少しずつ癒やす', atkRatio: 0.45, healRatio: 0.04, mpRestore: 0.02,
        costGold: 300, costMat: { slime_gel: 4 }
    },
    pet_cat: {
        id: 'pet_cat', name: 'にゃんこ剣士', kaomoji: '(=^・ω・^=)', color: 0xf472b6,
        desc: '素早い連撃で敵を引っ掻くアタッカー相棒', atkRatio: 0.85, healRatio: 0.02, mpRestore: 0.02,
        costGold: 1200, costMat: { wood_piece: 4 }
    },
    pet_fox: {
        id: 'pet_fox', name: '妖狐コンコン', kaomoji: '🦊(・ω・)', color: 0xf59e0b,
        desc: '鬼火攻撃＋MPをこまめに回復してくれる', atkRatio: 0.95, healRatio: 0.03, mpRestore: 0.08,
        costGold: 3600, costMat: { flame_core: 3 }
    },
    pet_fairy: {
        id: 'pet_fairy', name: '星屑の精霊姫', kaomoji: '(ﾉ◕ヮ◕)ﾉ✧', color: 0x38bdf8,
        desc: 'HPとMPの両方を大きく回復する万能ヒーラー', atkRatio: 0.80, healRatio: 0.09, mpRestore: 0.12,
        costGold: 9500, costMat: { magic_dust: 6, ice_crystal: 3 }
    },
    pet_dragon: {
        id: 'pet_dragon', name: 'ちび古竜イグニス', kaomoji: '🐉(｀・ω・´)', color: 0xef4444,
        desc: '灼熱ブレスで大ダメージを与える最強クラスの相棒', atkRatio: 1.75, healRatio: 0.04, mpRestore: 0.05,
        costGold: 28000, costMat: { dragon_scale: 5 }
    },
    pet_angel: {
        id: 'pet_angel', name: '創世のミニ天使', kaomoji: '😇✧*｡', color: 0xfde047,
        desc: '超火力光線＋HP/MP大回復の神話級パートナー', atkRatio: 2.40, healRatio: 0.12, mpRestore: 0.15,
        costGold: 85000, costMat: { star_fragment: 6, god_essence: 3 }
    }
};

// 称号＆実績マスター
window.TITLES = {
    title_none:   { id: 'title_none',   name: '称号なし',         bonusText: 'ボーナスなし', atkBonus: 0, rewardBonus: 0 },
    title_novice: { id: 'title_novice', name: '🌱 駆け出し冒険者', bonusText: '獲得EXP/G +10%', atkBonus: 0.05, rewardBonus: 0.10 },
    title_hunter: { id: 'title_hunter', name: '⚔️ 百獣の討伐者',  bonusText: '全攻撃力 +15%', atkBonus: 0.15, rewardBonus: 0.05 },
    title_boss:   { id: 'title_boss',   name: '👑 魔王を討つ者',   bonusText: 'ボス特効 +20% / 攻撃+15%', atkBonus: 0.15, rewardBonus: 0.15 },
    title_tower:  { id: 'title_tower',  name: '🗼 試練の踏破者',   bonusText: '全攻撃力 +25% / EXP/G+20%', atkBonus: 0.25, rewardBonus: 0.20 },
    title_god:    { id: 'title_god',    name: '🌟 顔文字界の創世神', bonusText: '全攻撃力 +50% / EXP/G+40%', atkBonus: 0.50, rewardBonus: 0.40 }
};

window.ACHIEVEMENTS = [
    { id: 'ach_lv5',    name: 'はじめての成長',   desc: 'プレイヤーLv.5に到達',       key: 'lv',             req: 5,   rewardAp: 5,  rewardSp: 2, titleId: 'title_novice' },
    { id: 'ach_kill30', name: 'モンスターハンター', desc: 'モンスターを30体討伐',     key: 'kills',          req: 30,  rewardAp: 8,  rewardSp: 3, titleId: 'title_hunter' },
    { id: 'ach_boss5',  name: '強敵撃破の証',     desc: 'エリアボスを5体討伐',        key: 'bossKills',      req: 5,   rewardAp: 12, rewardSp: 4, titleId: 'title_boss' },
    { id: 'ach_tower10',name: '試練の塔 10F突破', desc: '試練の塔で10階に到達',       key: 'bestTowerFloor', req: 10,  rewardAp: 15, rewardSp: 5, titleId: 'title_tower' },
    { id: 'ach_lv50',   name: '伝説の英雄',       desc: 'プレイヤーLv.50に到達',      key: 'lv',             req: 50,  rewardAp: 30, rewardSp: 10, titleId: 'title_god' }
];

// ステージ・フィールド＆モンスター配置マスター
window.ZONES = {
    town: {
        id: 'town', stageNum: 0, name: '始まりの顔文字広場', recLv: 1, safe: true,
        skyColor: 0x0284c7, groundColor: 0x16a34a,
        desc: '安全地帯。HP/MPが高速回復し、中央のワープ陣から各ステージへ出発できます。',
        monsters: []
    },
    meadow: {
        id: 'meadow', stageNum: 1, name: 'ぷるぷる草原', recLv: 1, safe: false,
        skyColor: 0x0ea5e9, groundColor: 0x22c55e,
        desc: '初心者向けの穏やかな草原。スライムやウサギが生息しています。',
        monsters: [
            { name: 'ぷるスライム', kaomoji: '(・ω・)', lv: 1, hp: 55, atk: 7, exp: 22, gold: 18, color: 0x10b981, scale: 1.0, count: 6, drop: 'slime_gel' },
            { name: 'はねウサギ',   kaomoji: '૮(・x・)ა', lv: 3, hp: 95, atk: 12, exp: 36, gold: 28, color: 0xf472b6, scale: 1.05, count: 4, drop: 'wood_piece' },
            { name: 'キングスライム', kaomoji: '👑(・ω・)', lv: 6, hp: 420, atk: 26, exp: 180, gold: 160, color: 0x059669, scale: 2.0, count: 1, isBoss: true, drop: 'slime_gel' }
        ]
    },
    forest: {
        id: 'forest', stageNum: 2, name: '妖精の迷い森', recLv: 6, safe: false,
        skyColor: 0x065f46, groundColor: 0x14532d,
        desc: '神秘的な樹海。精霊やトレントから魔導素材が手に入ります。',
        monsters: [
            { name: 'もり精霊',     kaomoji: '(｡･ω･｡)', lv: 7, hp: 220, atk: 24, exp: 75, gold: 60, color: 0x34d399, scale: 1.05, count: 6, drop: 'wood_piece' },
            { name: 'おこトレント', kaomoji: '(╬ﾟ皿ﾟ)', lv: 10, hp: 360, atk: 34, exp: 115, gold: 90, color: 0x92400e, scale: 1.25, count: 4, drop: 'magic_dust' },
            { name: '森の守護大樹', kaomoji: '🌳(╬◣д◢)', lv: 14, hp: 1450, atk: 62, exp: 520, gold: 450, color: 0x15803d, scale: 2.15, count: 1, isBoss: true, drop: 'magic_dust' }
        ]
    },
    ruins: {
        id: 'ruins', stageNum: 3, name: '古代の石像遺跡', recLv: 14, safe: false,
        skyColor: 0x334155, groundColor: 0x475569,
        desc: '古代文明の遺構。硬いゴーレムや装甲騎士が徘徊しています。',
        monsters: [
            { name: '遺跡ゴーレム', kaomoji: '【・_・】', lv: 15, hp: 680, atk: 58, exp: 210, gold: 175, color: 0x64748b, scale: 1.2, count: 6, drop: 'iron_ore' },
            { name: '呪いの鎧騎士', kaomoji: '⚔️(◣_◢)', lv: 19, hp: 980, atk: 78, exp: 310, gold: 250, color: 0x4f46e5, scale: 1.25, count: 4, drop: 'magic_dust' },
            { name: '古代の巨神兵', kaomoji: '🗿꧁(╬◣д◢)꧂', lv: 24, hp: 4200, atk: 140, exp: 1400, gold: 1200, color: 0x38bdf8, scale: 2.25, count: 1, isBoss: true, drop: 'iron_ore' }
        ]
    },
    volcano: {
        id: 'volcano', stageNum: 4, name: '灼熱の黒曜火山', recLv: 25, safe: false,
        skyColor: 0x7f1d1d, groundColor: 0x450a0a,
        desc: 'マグマが噴き上がる危険地帯。炎核や竜の鱗がドロップします。',
        monsters: [
            { name: 'マグマボム',   kaomoji: '🔥(＞＜)', lv: 26, hp: 2100, atk: 135, exp: 620, gold: 520, color: 0xf97316, scale: 1.15, count: 6, drop: 'flame_core' },
            { name: 'サラマンダー', kaomoji: '🦎(｀皿´)', lv: 30, hp: 3100, atk: 175, exp: 880, gold: 740, color: 0xef4444, scale: 1.3, count: 4, drop: 'flame_core' },
            { name: '紅蓮の炎帝竜', kaomoji: '🐉꧁(╬◣д◢)꧂', lv: 36, hp: 13500, atk: 320, exp: 3900, gold: 3400, color: 0xdc2626, scale: 2.4, count: 1, isBoss: true, isRaidBoss: true, drop: 'dragon_scale' }
        ]
    },
    glacier: {
        id: 'glacier', stageNum: 5, name: '絶界の氷河神殿', recLv: 40, safe: false,
        skyColor: 0x0c4a6e, groundColor: 0x0369a1,
        desc: 'すべてが凍てつく極寒の神殿。永久氷晶が眠っています。',
        monsters: [
            { name: 'ブリザード霊', kaomoji: '❄️(；・∀・)', lv: 42, hp: 6800, atk: 310, exp: 1850, gold: 1550, color: 0x7dd3fc, scale: 1.2, count: 6, drop: 'ice_crystal' },
            { name: '氷結の死神',   kaomoji: '💀(◣д◢)', lv: 47, hp: 9600, atk: 410, exp: 2600, gold: 2200, color: 0x38bdf8, scale: 1.35, count: 4, drop: 'ice_crystal' },
            { name: '絶対零度の氷龍', kaomoji: '❄️🐉꧁(╬◣д◢)꧂', lv: 55, hp: 42000, atk: 740, exp: 11500, gold: 9800, color: 0x0284c7, scale: 2.5, count: 1, isBoss: true, isRaidBoss: true, drop: 'star_fragment' }
        ]
    },
    abyss: {
        id: 'abyss', stageNum: 6, name: '終焉の星屑深淵', recLv: 60, safe: false,
        skyColor: 0x1e1b4b, groundColor: 0x090d16,
        desc: '宇宙の果ての最終決戦エリア。創世の霊珠を持つ神話級ボスが君臨！',
        monsters: [
            { name: '深淵の星喰らい', kaomoji: '🌌(╬◣д◢)', lv: 65, hp: 24000, atk: 780, exp: 6200, gold: 5400, color: 0xa855f7, scale: 1.3, count: 6, drop: 'star_fragment' },
            { name: '虚無の堕天使',   kaomoji: '😈꧁(◣_◢)꧂', lv: 75, hp: 36000, atk: 1050, exp: 9200, gold: 8000, color: 0xf43f5e, scale: 1.45, count: 4, drop: 'god_essence' },
            { name: '創世の終焉魔王', kaomoji: '👑🌌꧁(╬◣д◢)꧂', lv: 90, hp: 160000, atk: 1950, exp: 42000, gold: 36000, color: 0xfde047, scale: 2.75, count: 1, isBoss: true, isRaidBoss: true, drop: 'god_essence' }
        ]
    }
};

// エモート12種（game6.jsの12種モーションに完全対応）
window.EMOTES = [
    { id: 'em_wave',    icon: '👋', kaomoji: '(≧▽≦)ﾉｼ',      label: 'やっほー',   msg: 'やっほー！よろしくね！' },
    { id: 'em_joy',     icon: '🎉', kaomoji: '✧*｡٩(ˊᗜˋ*)و✧*｡', label: 'やったー',   msg: 'やったー！最高！！' },
    { id: 'em_bow',     icon: '🙇', kaomoji: '(´・ω・`)ペコリ', label: 'ありがとう', msg: 'ありがとうございます！' },
    { id: 'em_dance',   icon: '💃', kaomoji: '♪(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧', label: 'ダンス',     msg: 'るんるんダンス♪' },
    { id: 'em_heart',   icon: '💖', kaomoji: '(*˘︶˘*).｡.:*♡', label: 'ハート',     msg: '大好き♡' },
    { id: 'em_rage',    icon: '💢', kaomoji: '(╯°□°）╯︵ ┻━┻', label: 'ちゃぶ台',   msg: 'うおおお！ちゃぶ台返し！！' },
    { id: 'em_cry',     icon: '😭', kaomoji: '(´；ω；`)',      label: 'えんえん',   msg: 'えんえん…助けて…' },
    { id: 'em_dogeza',  icon: '🙏', kaomoji: 'orz ごめん！',    label: '土下座',     msg: 'ごめんなさいぃぃ！！' },
    { id: 'em_faint',   icon: '👻', kaomoji: '(×_×)昇天',      label: '気絶',       msg: 'もうダメ…魂が抜ける…' },
    { id: 'em_sleep',   icon: '💤', kaomoji: '(－ω－) zzZ',    label: 'おやすみ',   msg: 'ふぁ…眠くなってきた…zzZ' },
    { id: 'em_salute',  icon: '🔥', kaomoji: '(｀・ω・´)ゞ',    label: '敬礼',       msg: '任せろ！全力で行くぞ！' },
    { id: 'em_dash',    icon: '💨', kaomoji: 'ε=ε=┏( >_<)┛',  label: 'ダッシュ',   msg: '急げ急げーっ！！' }
];

// =========================================================================
// index.html と game1〜game6 の要素ID・タブ・描画ループを自動接続するブリッジ
// =========================================================================
window.addEventListener('DOMContentLoaded', () => {
    // 1. スキルスロット 0〜4 を #skill-slots-container 内に自動生成
    const slotWrap = document.getElementById('skill-slots-container');
    if (slotWrap && slotWrap.children.length === 0) {
        for (let i = 0; i < 5; i++) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.id = `skill-slot-${i}`;
            btn.className = `skill-slot-btn skill-arc-${i}`;
            btn.innerHTML = `<span style="font-size:10px;color:#64748b;">空</span>`;
            slotWrap.appendChild(btn);
        }
    }

    // 2. メニュータブを #modal-tabs 内に自動生成
    const tabWrap = document.getElementById('modal-tabs');
    const tabDefs = [
        { id: 'stats',  label: '📊 ステータス' },
        { id: 'skills', label: '📘 スキル' },
        { id: 'tree',   label: '🌳 ツリー' },
        { id: 'equip',  label: '⚔️ 装備･錬金' },
        { id: 'evo',    label: '👑 転職' },
        { id: 'look',   label: '🎨 見た目' },
        { id: 'pets',   label: '🐾 ペット' },
        { id: 'titles', label: '🎖️ 称号･実績' },
        { id: 'zones',  label: '🗺️ ステージ･塔' },
        { id: 'online', label: '🌐 通信･設定' }
    ];
    if (tabWrap && tabWrap.children.length === 0) {
        tabWrap.innerHTML = tabDefs.map(t =>
            `<button type="button" class="tab-chip-btn" data-menu-tab="${t.id}">${t.label}</button>`
        ).join('');
    }

    // 3. KaomojiMMORPG プロトタイプのメソッド橋渡し（game5.js と game6.js の完全統合）
    if (typeof KaomojiMMORPG !== 'undefined') {
        const P = KaomojiMMORPG.prototype;

        // travel と zones タブ名を統一
        const _origOpen = P.openGrowthModal;
        P.openGrowthModal = function(tab = 'stats') {
            const mapped = (tab === 'travel') ? 'zones' : (tab || 'stats');
            this.activeTab = mapped;
            this.isModalOpen = true;
            document.getElementById('growth-modal')?.classList.remove('hidden');
            document.querySelectorAll('[data-menu-tab]').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-menu-tab') === mapped);
            });
            if (this.renderModalContent) this.renderModalContent();
            else if (this.renderGrowthTabContent) this.renderGrowthTabContent();
        };

        // game5.js の renderGrowthTabContent と game6.js の renderModalContent を接続
        if (!P._bridgedRenderModal) {
            P._bridgedRenderModal = true;
            const _baseRender = P.renderGrowthTabContent;
            const _v20Hook = P.renderModalContent;
            P.renderModalContent = function() {
                // #modal-body を #modal-body-content としても参照可能にする
                const mb = document.getElementById('modal-body');
                if (mb && !document.getElementById('modal-body-content')) {
                    mb.id = 'modal-body-content';
                }
                if (_baseRender) _baseRender.call(this);
                const el = document.getElementById('modal-body-content');
                if (el) el.id = 'modal-body';
                // game6.js のペット名変更・ペット装備・通信診断フックを実行
                if (_v20Hook && _v20Hook !== P.renderModalContent) {
                    _v20Hook.call(this);
                }
            };
        }

        // エモートパレット生成（game6.js の12モーションと連動）
        P.buildEmotePalette = function() {
            const pal = document.getElementById('emote-palette');
            if (!pal) return;
            pal.innerHTML = EMOTES.map(em => `
                <button type="button" class="emote-quick-btn" data-emote-id="${em.id}" data-kaomoji="${em.kaomoji}" data-msg="${em.msg}" data-label="${em.label}">
                    <span style="font-size:16px;">${em.icon}</span>
                    <span style="font-size:9px;font-weight:900;">${em.label}</span>
                </button>
            `).join('');
        };

        // HUD更新で index.html 固有のバッジ類も同期
        const _origHUD = P.refreshAllHUD;
        P.refreshAllHUD = function() {
            if (_origHUD) _origHUD.call(this);
            const d = this.saveData || {};
            const evo = EVOLUTIONS[d.evolutionId] || EVOLUTIONS.novice;
            const kEl = document.getElementById('hud-kaomoji');
            const nEl = document.getElementById('hud-name');
            if (kEl) kEl.textContent = this.getBasePlayerKaomoji();
            if (nEl) nEl.textContent = evo.name;

            const z = ZONES[this.currentZoneId] || ZONES.town;
            const stgEl = document.getElementById('hud-stage-badge');
            const safeEl = document.getElementById('hud-safe-badge');
            const thrEl = document.getElementById('hud-threat-badge');
            if (stgEl) stgEl.textContent = this.towerState?.active ? `TOWER ${this.towerState.floor}F` : `STAGE ${z.stageNum}`;
            if (safeEl) safeEl.classList.toggle('hidden', !z.safe || this.towerState?.active);
            if (thrEl) {
                const tr = d.threatRank || 0;
                thrEl.classList.toggle('hidden', tr <= 0);
                thrEl.textContent = `脅威+${tr}`;
            }

            const expTxt = document.getElementById('hud-exp-text');
            if (expTxt && this.getExpNeeded) {
                expTxt.textContent = `${formatBigNum(d.exp || 0)}/${formatBigNum(this.getExpNeeded(d.lv || 1))}`;
            }

            // チャット欄の入力ID同期
            const chatIn = document.getElementById('input-chat-msg');
            if (chatIn && !chatIn.dataset.boundSend) {
                chatIn.dataset.boundSend = '1';
                document.getElementById('btn-send-chat')?.addEventListener('click', () => {
                    this.sendChatMessage(chatIn.value);
                    chatIn.value = '';
                });
            }
        };

        // 毎フレームのアニメーション更新で game6.js の updateRemotePlayers も確実に呼ぶ
        const _origVFX = P.updateVisualEffects;
        P.updateVisualEffects = function(dt, elapsed) {
            if (_origVFX) _origVFX.call(this, dt, elapsed);
            if (this.updateRemotePlayers) this.updateRemotePlayers(dt);
        };
    }

    // タブボタンのイベントを再バインド
    document.querySelectorAll('[data-menu-tab]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (window.game && window.game.openGrowthModal) {
                window.game.openGrowthModal(btn.getAttribute('data-menu-tab'));
            }
        });
    });

    if (window.game) {
        window.game.buildEmotePalette?.();
        window.game.refreshAllHUD?.();
    }
});
