'use strict';

// =========================================================================
// 顔文字ファンタジー3D サウンド・セーブ・ステータス計算 (game1.js)
// =========================================================================

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.bgmMuted = false;
        this.bgmTimer = null;
        this.bgmStep = 0;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
        if (!this.bgmTimer) {
            const notes = [261.63, 329.63, 392.00, 493.88, 523.25, 392.00, 329.63, 293.66];
            this.bgmTimer = setInterval(() => {
                if (this.bgmMuted || !this.ctx || this.ctx.state !== 'running') return;
                const freq = notes[this.bgmStep % notes.length];
                this.bgmStep++;
                this.playTone(freq, 'sine', 0.28, 0.025);
            }, 460);
        }
    }

    playTone(freq, type = 'triangle', duration = 0.14, volume = 0.08, slideFreq = null) {
        if (!this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, now);
            if (slideFreq) osc.frequency.exponentialRampToValueAtTime(slideFreq, now + duration);
            gain.gain.setValueAtTime(volume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + duration);
        } catch (e) {}
    }

    playHit(crit = false) {
        this.playTone(crit ? 520 : 280, 'sawtooth', 0.11, crit ? 0.11 : 0.07, crit ? 140 : 90);
    }

    playSkill() {
        this.playTone(440, 'triangle', 0.18, 0.09, 780);
    }

    playHeal() {
        this.playTone(523.25, 'sine', 0.14, 0.08, 659.25);
        setTimeout(() => this.playTone(783.99, 'sine', 0.2, 0.08), 90);
    }

    playLevelUp() {
        [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => {
            setTimeout(() => this.playTone(f, 'triangle', 0.22, 0.1), idx * 80);
        });
    }
}

const sfx = new SoundEngine();

function isLightHexColor(hexStr) {
    if (!hexStr || !/^#[0-9a-fA-F]{6}$/.test(hexStr)) return false;
    const r = parseInt(hexStr.slice(1, 3), 16);
    const g = parseInt(hexStr.slice(3, 5), 16);
    const b = parseInt(hexStr.slice(5, 7), 16);
    return (r * 0.299 + g * 0.587 + b * 0.114) > 180;
}

const faceTexCache = new Map();
function getKaomojiFaceTexture(text, bgHex = '#073b66', fgHex = '#ffffff', borderHex = '#38bdf8') {
    const actualFg = (fgHex === '#ffffff' && isLightHexColor(bgHex)) ? '#0f172a' : fgHex;
    const key = `${text}|${bgHex}|${actualFg}|${borderHex}`;
    if (faceTexCache.has(key)) return faceTexCache.get(key);

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = bgHex;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = borderHex;
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);

    ctx.fillStyle = actualFg;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const len = Array.from(text).length;
    const fontSize = len <= 6 ? 44 : (len <= 10 ? 32 : 24);
    ctx.font = `900 ${fontSize}px "MS PGothic", "Hiragino Kaku Gothic ProN", sans-serif`;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const tex = new THREE.CanvasTexture(canvas);
    faceTexCache.set(key, tex);
    return tex;
}

class KaomojiMMORPG {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.overlayLayer = document.getElementById('overlay-layer');

        this.saveKey = 'kaomoji_mmo_3d_save_v4';
        this.saveData = this.loadSaveData();

        this.currentZoneId = 'town';
        this.towerState = { active: false, floor: 1, wave: 1 };

        this.useWebGL = false;
        this.scene = null;
        this.camera = null;
        this.renderer = null;

        this.player = null;
        this.petEntity = null;
        this.monsters = [];
        this.aiAllies = [];
        this.remotePlayers = new Map();
        this.effects = [];
        this.floatTexts = [];
        this.emoteBubbles = [];
        this.envObjects = [];

        this.warpGroup = null;
        this.warpCrystal = null;
        this.wasOnWarp = false;

        this.selectedTarget = null;
        this.isModalOpen = false;
        this.activeTab = 'travel';
        this.isDead = false;
        this.autoHunt = false;
        this.autoAttack = true;
        this.autoSkillTimer = 0;
        this.autoAtkTimer = 0;

        this.emoteTimer = 0;
        this.emoteMotion = 'none';

        this.keys = {};
        this.joyVec = { x: 0, y: 0 };
        this.camYaw = 0;
        this.camPitch = 0.44;
        this.camDist = 14.5;
        this.camShake = 0;

        this.fbConnected = false;
        this.fbSyncTimer = 0;
        this.fbPollTimer = 0;
        this.fbLastEventTs = Date.now();

        this.lastTime = performance.now();

        this.initThree();
        this.buildPlayerEntity();
        this.buildPetEntity();
        this.loadZone('town');
        this.buildEmotePalette();
        this.bindEvents();
        this.refreshAllHUD();

        if (this.saveData.firebaseUrl) {
            this.connectFirebase(this.saveData.firebaseUrl, true);
        }

        requestAnimationFrame((t) => this.loop(t));
    }

    createDefaultSave() {
        const uid = 'p_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
        return {
            playerUid: uid,
            lv: 1,
            exp: 0,
            gold: 200,
            ap: 0,
            sp: 1,
            rebirthCount: 0,
            threatRank: 0,
            evolutionId: 'novice',
            customKaomoji: '',
            exTitle: '',
            bodyColor: '',
            faceBgColor: '#073b66',
            bodyScale: 1.0,
            cosmeticId: 'none',
            ownedCosmetics: ['none'],
            backCosmeticId: 'back_none',
            ownedBackCosmetics: ['back_none'],
            weaponId: 'wpn_wood',
            weaponEnhance: 0,
            weaponEnchant: null,
            ownedWeapons: ['wpn_wood'],
            armorId: 'arm_cloth',
            armorEnhance: 0,
            armorEnchant: null,
            ownedArmors: ['arm_cloth'],
            accessoryId: 'acc_none',
            ownedAccessories: ['acc_none'],
            petId: null,
            petLevel: 1,
            ownedPets: [],
            equippedTitleId: 'title_none',
            unlockedTitles: ['title_none'],
            claimedAchievements: [],
            stats: { str: 5, int: 5, vit: 5, agi: 5 },
            skills: { slash_heavy: 1 },
            equippedSkills: ['slash_heavy', null, null, null, null],
            tree: {},
            materials: {
                slime_gel: 0, ancient_sap: 0, goblin_fang: 0,
                fire_core: 0, ice_crystal: 0, abyss_shard: 0, void_star: 0
            },
            statsTrack: { kills: 0, bossKills: 0, bestTowerFloor: 0, maxThreatKill: 0 },
            firebaseUrl: '',
            cloudId: '',
            cloudPin: ''
        };
    }

    loadSaveData() {
        const def = this.createDefaultSave();
        try {
            const raw = localStorage.getItem(this.saveKey)
                || localStorage.getItem('kaomoji_mmo_3d_save_v3')
                || localStorage.getItem('kaomoji_mmo_3d_save_v2');
            if (!raw) return def;
            const parsed = JSON.parse(raw);
            return {
                ...def,
                ...parsed,
                stats: { ...def.stats, ...(parsed.stats || {}) },
                skills: { ...def.skills, ...(parsed.skills || {}) },
                materials: { ...def.materials, ...(parsed.materials || {}) },
                statsTrack: { ...def.statsTrack, ...(parsed.statsTrack || {}) },
                ownedCosmetics: parsed.ownedCosmetics || ['none'],
                ownedBackCosmetics: parsed.ownedBackCosmetics || ['back_none']
            };
        } catch (e) {
            return def;
        }
    }

    saveGame(showToast = false) {
        try {
            localStorage.setItem(this.saveKey, JSON.stringify(this.saveData));
            if (showToast) this.showAlertBanner('💾 セーブデータを保存しました！', 1400);
        } catch (e) {}
    }

    getBasePlayerKaomoji() {
        if (this.saveData.customKaomoji && this.saveData.customKaomoji.trim()) {
            return this.saveData.customKaomoji.trim();
        }
        const evo = EVOLUTIONS[this.saveData.evolutionId] || EVOLUTIONS.novice;
        return evo.kaomoji;
    }

    getPlayerBodyHexColor() {
        if (this.saveData.bodyColor && /^#[0-9a-fA-F]{6}$/.test(this.saveData.bodyColor)) {
            return parseInt(this.saveData.bodyColor.slice(1), 16);
        }
        const evo = EVOLUTIONS[this.saveData.evolutionId] || EVOLUTIONS.novice;
        return evo.hexColor || 0x38bdf8;
    }

    getPlayerFaceBgHex() {
        return (this.saveData.faceBgColor && /^#[0-9a-fA-F]{6}$/.test(this.saveData.faceBgColor))
            ? this.saveData.faceBgColor
            : '#073b66';
    }

    getPlayerBodyScale() {
        return Number(this.saveData.bodyScale) || 1.0;
    }

    getExpNeeded(lv) {
        return Math.round(90 * Math.pow(1.22, lv - 1) + lv * 25);
    }

    getSkillUpgradeCost(curLv) {
        return 1 + Math.floor(curLv / 3);
    }

    calcDerivedStats() {
        const d = this.saveData;
        const evo = EVOLUTIONS[d.evolutionId] || EVOLUTIONS.novice;
        const wpn = WEAPONS[d.weaponId] || WEAPONS.wpn_wood;
        const arm = ARMORS[d.armorId] || ARMORS.arm_cloth;
        const acc = ACCESSORIES[d.accessoryId] || ACCESSORIES.acc_none;
        const ttl = TITLES[d.equippedTitleId] || TITLES.title_none;
        const tr = d.tree || {};

        const warlordMult = 1 + (tr.t_warlord || 0) * 0.05;
        const rebirthMult = 1 + (d.rebirthCount || 0) * 0.35;
        const baseScale = warlordMult * rebirthMult;

        const str = d.stats.str * baseScale;
        const intel = d.stats.int * baseScale;
        const vit = d.stats.vit * baseScale;
        const agi = d.stats.agi * baseScale;

        const ench = { atkBonus: 0, hpBonus: 0, critBonus: 0, critDmg: 0, cdBonus: 0, lifesteal: 0, bossDmg: 0, rewardBonus: 0 };
        [d.weaponEnchant, d.armorEnchant].forEach(eId => {
            if (!eId) return;
            const found = ENCHANT_POOL.find(x => x.id === eId);
            if (found) ench[found.stat] = (ench[found.stat] || 0) + found.val;
        });

        const armEnhMult = 1 + (d.armorEnhance || 0) * 0.14;
        const wpnEnhMult = 1 + (d.weaponEnhance || 0) * 0.14;

        const treeHpMult = 1 + (tr.t_vital || 0) * 0.08;
        const maxHp = Math.round(
            (90 + d.lv * 26 + vit * 18 + arm.hp * armEnhMult) *
            evo.hpMult * treeHpMult * (1 + (acc.hpBonus || 0) + (ttl.hp || 0) + ench.hpBonus)
        );

        const maxMp = Math.round(
            (45 + d.lv * 10 + intel * 11 + arm.mp * armEnhMult) * evo.mpMult
        );

        const treeAtkMult = 1 + (tr.t_might || 0) * 0.06;
        const warcryMult = (this.player && this.player.warcryTimer > 0) ? (this.player.warcryBonus || 1.0) : 1.0;
        const physAtk = Math.round(
            (10 + d.lv * 3.5 + str * 3.4 + intel * 1.1 + wpn.atk * wpnEnhMult) *
            evo.atkMult * treeAtkMult * (1 + (acc.atkBonus || 0) + (ttl.atk || 0) + ench.atkBonus) * warcryMult
        );

        const treeSkillPowerMult = 1 + (tr.t_arcana || 0) * 0.08;
        const magMult = Number((wpn.mag * (1 + intel * 0.015) * treeSkillPowerMult).toFixed(2));

        const rawCrit = 0.05 + agi * 0.004 + str * 0.0015 + (tr.t_crit || 0) * 0.05 + (evo.exCritBonus || 0) + (ttl.crit || 0) + ench.critBonus;
        const critChance = Math.min(1.0, rawCrit);
        const overflowCrit = Math.max(0, rawCrit - 1.0);
        const overflowCritDmgBonus = overflowCrit * 1.5;
        const critDmg = 1.55 + str * 0.008 + (tr.t_crit || 0) * 0.12 + ench.critDmg + overflowCritDmgBonus;

        const defBuff = (this.player && this.player.defBuffTimer > 0) ? (this.player.defBuffBonus || 0) : 0;
        const rawDef = arm.def * (1 + (d.armorEnhance || 0) * 0.04) + vit * 0.002 + (tr.t_aegis || 0) * 0.03 + (evo.exDefBonus || 0) + defBuff;
        const defMitigation = Math.min(0.82, rawDef);

        const rawCd = agi * 0.0035 + (tr.t_chant || 0) * 0.05 + (tr.t_warlord || 0) * 0.03 + (evo.exCdBonus || 0) + (acc.cdBonus || 0) + ench.cdBonus;
        const cdReduction = Math.min(0.65, rawCd);

        const moveSpeed = Math.min(16.5, (8.2 + agi * 0.04) * (evo.spdMult || 1.0));
        const rewardMult = (1 + (tr.t_fortune || 0) * 0.10 + (acc.rewardBonus || 0) + (ttl.reward || 0) + ench.rewardBonus);

        return {
            maxHp,
            maxMp,
            physAtk,
            magMult,
            critChance,
            overflowCrit,
            overflowCritDmgBonus,
            critDmg,
            defMitigation,
            cdReduction,
            moveSpeed,
            rewardMult,
            rebirthMult,
            wpnGlowColor: wpn.glowColor || 0x38bdf8,
            lifesteal: (acc.lifesteal || 0) + ench.lifesteal,
            doubleCast: acc.doubleCast || 0,
            bossDmgMult: 1 + (acc.bossDmg || 0) + ench.bossDmg,
            treeSkillPowerMult,
            treeHealPowerMult: 1 + (tr.t_aegis || 0) * 0.08,
            treeHpRegenBonus: (tr.t_vital || 0) * 0.004,
            treeMpRegenMult: 1 + (tr.t_chant || 0) * 0.10 + (d.accessoryId === 'acc_chrono_orb' ? 0.5 : 0)
        };
    }
}
