'use strict';

// =========================================================================
// 顔文字ファンタジー3D コアエンジン・BGM・装備3D造形・ワープ・ペット (game1.js)
// =========================================================================

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.bgmMuted = false;
        this.bgmMode = 'town';
        this.bgmStep = 0;
        this.bgmTimer = 0;
    }
    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
    }
    playTone(freq, dur = 0.08, type = 'sine', vol = 0.05) {
        if (this.muted || !freq) return;
        this.init();
        if (!this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(vol, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + dur);
        } catch (e) {}
    }
    setBgmMode(mode) {
        if (this.bgmMode !== mode) {
            this.bgmMode = mode;
            this.bgmStep = 0;
            this.bgmTimer = 0;
        }
    }
    updateBgm(dt) {
        if (this.muted || this.bgmMuted || !this.ctx || this.ctx.state !== 'running') return;
        const melodies = {
            town: {
                tempo: 0.42,
                type: 'sine',
                vol: 0.022,
                notes: [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880.00, 698.46, 523.25, 659.25, 783.99, 987.77, 1046.50, 783.99, 659.25, 0]
            },
            field: {
                tempo: 0.28,
                type: 'triangle',
                vol: 0.024,
                notes: [392.00, 523.25, 659.25, 523.25, 587.33, 659.25, 783.99, 659.25, 440.00, 523.25, 659.25, 783.99, 880.00, 783.99, 659.25, 587.33]
            },
            boss: {
                tempo: 0.21,
                type: 'sawtooth',
                vol: 0.020,
                notes: [220.00, 220.00, 261.63, 246.94, 220.00, 220.00, 329.63, 293.66, 220.00, 220.00, 261.63, 329.63, 349.23, 329.63, 293.66, 246.94]
            }
        };
        const track = melodies[this.bgmMode] || melodies.town;
        this.bgmTimer -= dt;
        if (this.bgmTimer <= 0) {
            this.bgmTimer = track.tempo;
            const note = track.notes[this.bgmStep % track.notes.length];
            this.bgmStep++;
            if (note > 0) {
                this.playTone(note, track.tempo * 0.85, track.type, track.vol);
            }
        }
    }
    playHit(crit = false) {
        this.playTone(crit ? 560 : 240, crit ? 0.11 : 0.06, crit ? 'sawtooth' : 'triangle', crit ? 0.07 : 0.045);
    }
    playSkill() {
        this.playTone(580, 0.10, 'triangle', 0.065);
        setTimeout(() => this.playTone(880, 0.13, 'sine', 0.065), 50);
        setTimeout(() => this.playTone(1180, 0.15, 'triangle', 0.055), 110);
    }
    playLevelUp() {
        [523, 659, 784, 1046].forEach((f, i) => {
            setTimeout(() => this.playTone(f, 0.16, 'triangle', 0.075), i * 85);
        });
    }
    playDeath() {
        [330, 260, 195, 130].forEach((f, i) => {
            setTimeout(() => this.playTone(f, 0.24, 'sawtooth', 0.08), i * 130);
        });
    }
}
const sfx = new SoundEngine();

const faceTexCache = new Map();
function getKaomojiFaceTexture(kaomoji, bg = '#073b66', fg = '#ffffff', border = '#38bdf8') {
    const key = `${kaomoji}|${bg}|${fg}|${border}`;
    if (faceTexCache.has(key)) return faceTexCache.get(key);

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 256, 128);
    ctx.strokeStyle = border;
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, 248, 120);

    ctx.fillStyle = fg;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const len = (kaomoji || '').length;
    const fontSize = len > 11 ? 26 : (len > 8 ? 32 : 38);
    ctx.font = `900 ${fontSize}px "MS PGothic", "Hiragino Kaku Gothic ProN", monospace`;
    ctx.fillText(kaomoji || '(*´ω｀*)', 128, 66);

    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;

    if (faceTexCache.size >= 28) {
        const oldestKey = faceTexCache.keys().next().value;
        const oldTex = faceTexCache.get(oldestKey);
        if (oldTex) oldTex.dispose();
        faceTexCache.delete(oldestKey);
    }
    faceTexCache.set(key, tex);
    return tex;
}

class KaomojiMMORPG {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.overlayLayer = document.getElementById('world-overlay-layer');

        this.WARP_PORTAL_RADIUS = 2.8;
        this.FIELD_LIMIT = 27.0;

        this.currentZoneId = 'town';
        this.towerState = { active: false, floor: 1, clearing: false };
        this.isModalOpen = false;
        this.isDead = false;
        this.activeTab = 'stats';

        this.autoAttack = true;
        this.autoAtkTimer = 0;
        this.autoHunt = false;
        this.autoSkillTimer = 0.35;
        this.memCleanTimer = 0;
        this.alertTimeout = null;

        this.emoteTimer = 0;
        this.emoteMotion = 'none';

        this.joyVec = { x: 0, y: 0 };
        this.keys = {};
        this.camYaw = 0;
        this.camPitch = 0.56;
        this.camDist = 14.5;
        this.camShake = 0;

        this.monsters = [];
        this.aiAllies = [];
        this.zoneProps = [];
        this.effects = [];
        this.floatTexts = [];
        this.emoteBubbles = [];
        this.selectedTarget = null;
        this.petEntity = null;

        this.saveData = this.loadSave();
        this.initThree();
        this.buildPlayerEntity();
        this.buildPetEntity();
        this.buildEmotePalette();
        this.bindEvents();
        this.loadZone('town');
        this.refreshAllHUD();

        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    }

    getDefaultSave() {
        return {
            lv: 1,
            exp: 0,
            gold: 150,
            ap: 3,
            sp: 2,
            threatRank: 0,
            rebirthCount: 0,
            evolutionId: 'novice',
            customKaomoji: '',
            exTitle: '',
            equippedTitleId: 'title_none',
            unlockedTitles: ['title_none'],
            claimedAchievements: [],
            statsTrack: { kills: 0, bossKills: 0, bestTowerFloor: 0, maxThreatKill: 0 },
            stats: { str: 5, int: 5, vit: 5, agi: 5 },
            weaponId: 'wpn_wood',
            armorId: 'arm_cloth',
            accessoryId: 'acc_none',
            ownedWeapons: ['wpn_wood'],
            ownedArmors: ['arm_cloth'],
            ownedAccessories: ['acc_none'],
            weaponEnhance: 0,
            armorEnhance: 0,
            petId: null,
            ownedPets: [],
            petLevel: 1,
            materials: {
                slime_gel: 0, ancient_sap: 0, goblin_fang: 0,
                fire_core: 0, ice_crystal: 0, abyss_shard: 0, void_star: 0
            },
            skills: {
                slash_heavy: 1,
                spin_whirl: 1,
                bash_shield: 1,
                heal_light: 1
            },
            equippedSkills: ['slash_heavy', 'spin_whirl', 'bash_shield', 'heal_light', null],
            tree: {}
        };
    }

    loadSave() {
        const def = this.getDefaultSave();
        try {
            const raw = localStorage.getItem('kaomoji_mmo_save_v4');
            if (!raw) return def;
            const parsed = JSON.parse(raw);
            return {
                ...def,
                ...parsed,
                stats: { ...def.stats, ...(parsed.stats || {}) },
                statsTrack: { ...def.statsTrack, ...(parsed.statsTrack || {}) },
                materials: { ...def.materials, ...(parsed.materials || {}) },
                skills: { ...def.skills, ...(parsed.skills || {}) },
                tree: { ...(parsed.tree || {}) },
                equippedSkills: Array.isArray(parsed.equippedSkills) ? parsed.equippedSkills.slice(0, 5) : def.equippedSkills,
                ownedAccessories: Array.isArray(parsed.ownedAccessories) ? parsed.ownedAccessories : def.ownedAccessories,
                ownedPets: Array.isArray(parsed.ownedPets) ? parsed.ownedPets : def.ownedPets,
                unlockedTitles: Array.isArray(parsed.unlockedTitles) ? parsed.unlockedTitles : def.unlockedTitles,
                claimedAchievements: Array.isArray(parsed.claimedAchievements) ? parsed.claimedAchievements : def.claimedAchievements
            };
        } catch (e) {
            return def;
        }
    }

    saveGame(notify = false) {
        try {
            localStorage.setItem('kaomoji_mmo_save_v4', JSON.stringify(this.saveData));
            if (notify) this.showAlertBanner('💾 冒険データをセーブしました！', 1600);
        } catch (e) {}
    }

    initThree() {
        this.useWebGL = false;
        if (typeof THREE !== 'undefined') {
            try {
                this.renderer = new THREE.WebGLRenderer({
                    canvas: this.canvas,
                    antialias: false,
                    powerPreference: 'low-power'
                });
                this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
                this.renderer.setSize(window.innerWidth, window.innerHeight);
                this.useWebGL = true;
            } catch (e) {
                this.useWebGL = false;
            }
        }
        if (!this.useWebGL) return;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0c2d48);
        this.scene.fog = new THREE.FogExp2(0x0c2d48, 0.015);
        this.camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.5, 110);

        this.scene.add(new THREE.AmbientLight(0xffffff, 0.85));
        const dir = new THREE.DirectionalLight(0xfffbeb, 0.78);
        dir.position.set(16, 28, 18);
        this.scene.add(dir);

        this.groundMat = new THREE.MeshLambertMaterial({ color: 0x14532d });
        const ground = new THREE.Mesh(new THREE.CircleGeometry(this.FIELD_LIMIT + 1.5, 44), this.groundMat);
        ground.rotation.x = -Math.PI / 2;
        this.scene.add(ground);

        [9.5, 18.5, this.FIELD_LIMIT].forEach((rad, idx) => {
            const ring = new THREE.Mesh(
                new THREE.RingGeometry(rad - 0.14, rad + 0.14, 48),
                new THREE.MeshBasicMaterial({
                    color: idx === 2 ? 0x38bdf8 : 0xfde047,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: idx === 2 ? 0.52 : 0.18
                })
            );
            ring.rotation.x = -Math.PI / 2;
            ring.position.y = 0.025;
            this.scene.add(ring);
        });

        // 初期マップ中央にも表示される豪華な3Dワープゲート
        this.warpGroup = new THREE.Group();
        this.warpOuterMat = new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide, transparent: true, opacity: 0.65 });
        const outerDisk = new THREE.Mesh(new THREE.RingGeometry(0.45, this.WARP_PORTAL_RADIUS, 36), this.warpOuterMat);
        outerDisk.rotation.x = -Math.PI / 2;
        outerDisk.position.y = 0.05;

        this.warpInnerMat = new THREE.MeshBasicMaterial({ color: 0xfde047, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
        const innerRing = new THREE.Mesh(new THREE.RingGeometry(1.75, 2.05, 32), this.warpInnerMat);
        innerRing.rotation.x = -Math.PI / 2;
        innerRing.position.y = 0.07;

        this.warpPillarMat = new THREE.MeshBasicMaterial({ color: 0x34d399, side: THREE.DoubleSide, transparent: true, opacity: 0.24 });
        const warpPillar = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.2, 4.2, 20, 1, true), this.warpPillarMat);
        warpPillar.position.y = 2.1;

        this.warpCrystal = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.48, 0),
            new THREE.MeshBasicMaterial({ color: 0xfde047, wireframe: false })
        );
        this.warpCrystal.position.y = 2.4;

        this.warpGroup.add(outerDisk, innerRing, warpPillar, this.warpCrystal);
        this.scene.add(this.warpGroup);

        window.addEventListener('resize', () => {
            if (!this.useWebGL) return;
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    getExpNeeded(lv) {
        return Math.round(145 * Math.pow(lv, 1.85) + lv * 100);
    }

    getSkillUpgradeCost(curLv) {
        return 1 + Math.floor(curLv / 4);
    }

    getEquipUpgradeCost(curEnh) {
        return Math.round(180 * Math.pow(1.36, curEnh));
    }

    getBasePlayerKaomoji() {
        const d = this.saveData;
        if (d.customKaomoji && d.customKaomoji.trim()) return d.customKaomoji.trim();
        const evo = EVOLUTIONS[d.evolutionId] || EVOLUTIONS.novice;
        return evo.kaomoji;
    }

    calcDerivedStats() {
        const d = this.saveData;
        const evo = EVOLUTIONS[d.evolutionId] || EVOLUTIONS.novice;
        const wpn = WEAPONS[d.weaponId] || WEAPONS.wpn_wood;
        const arm = ARMORS[d.armorId] || ARMORS.arm_cloth;
        const acc = ACCESSORIES[d.accessoryId] || ACCESSORIES.acc_none;
        const ttl = TITLES[d.equippedTitleId] || TITLES.title_none;

        const tMight   = d.tree.t_might || 0;
        const tArcana  = d.tree.t_arcana || 0;
        const tVital   = d.tree.t_vital || 0;
        const tCrit    = d.tree.t_crit || 0;
        const tChant   = d.tree.t_chant || 0;
        const tAegis   = d.tree.t_aegis || 0;
        const tFortune = d.tree.t_fortune || 0;
        const tWarlord = d.tree.t_warlord || 0;

        const rebirthMult = 1 + (d.rebirthCount || 0) * 0.35;
        const warlordMult = 1 + tWarlord * 0.05;
        const wpnEnhMult  = 1 + (d.weaponEnhance || 0) * 0.14;
        const armEnhMult  = 1 + (d.armorEnhance || 0) * 0.14;

        const baseHp = (110 + d.lv * 26 + d.stats.vit * 24 + arm.hp * armEnhMult);
        const maxHp = Math.round(baseHp * evo.hpMult * (1 + tVital * 0.08 + acc.hpBonus + ttl.hp) * warlordMult * rebirthMult);

        const baseMp = (45 + d.lv * 7 + d.stats.int * 10 + arm.mp * armEnhMult);
        const maxMp = Math.round(baseMp * evo.mpMult * (1 + acc.hpBonus * 0.5) * warlordMult * rebirthMult);

        const baseAtk = (16 + d.lv * 4.5 + d.stats.str * 4.2 + d.stats.int * 1.4 + wpn.atk * wpnEnhMult);
        const warcryMult = (this.player && this.player.warcryTimer > 0) ? (this.player.warcryBonus || 1.0) : 1.0;
        const physAtk = Math.round(baseAtk * evo.atkMult * (1 + tMight * 0.06 + acc.atkBonus + ttl.atk) * warlordMult * rebirthMult * warcryMult);

        const magMult = Number((wpn.mag * (1 + d.stats.int * 0.014) * (1 + tArcana * 0.08)).toFixed(2));

        const defBuff = (this.player && this.player.defBuffTimer > 0) ? (this.player.defBuffBonus || 0) : 0;
        const defMitigation = Math.min(0.88, 0.04 + d.stats.vit * 0.008 + arm.def * armEnhMult + tAegis * 0.03 + (evo.exDefBonus || 0) + defBuff);

        const rawCritChance = 0.06 + d.stats.str * 0.008 + d.stats.agi * 0.012 + tCrit * 0.05 + (evo.exCritBonus || 0) + (ttl.crit || 0);
        const critChance = Math.min(1.0, rawCritChance);
        const overflowCrit = Math.max(0, rawCritChance - 1.0);
        const overflowCritDmgBonus = overflowCrit * 1.5;
        const critDmg = 1.65 + d.stats.str * 0.015 + tCrit * 0.12 + (evo.isExJob ? 0.35 : 0) + overflowCritDmgBonus;

        const cdReduction = Math.min(0.72, d.stats.agi * 0.012 + tChant * 0.05 + tWarlord * 0.03 + (evo.exCdBonus || 0) + (acc.cdBonus || 0));
        const moveSpeed = (9.5 + Math.min(5.5, d.stats.agi * 0.15)) * evo.spdMult;

        return {
            maxHp, maxMp, physAtk, magMult, defMitigation,
            rawCritChance, critChance, overflowCrit, overflowCritDmgBonus, critDmg,
            cdReduction, moveSpeed,
            wpnGlowColor: wpn.glowColor || 0x38bdf8,
            lifesteal: acc.lifesteal || 0,
            doubleCast: acc.doubleCast || 0,
            bossDmgMult: 1 + (acc.bossDmg || 0),
            treeSkillPowerMult: 1 + tArcana * 0.08,
            treeHealPowerMult: 1 + tAegis * 0.08,
            treeHpRegenBonus: tVital * 0.004,
            treeMpRegenMult: 1 + tChant * 0.10 + (acc.id === 'acc_chrono_orb' ? 0.50 : 0),
            treeRewardMult: 1 + tFortune * 0.10 + (acc.rewardBonus || 0) + (ttl.reward || 0),
            rebirthMult
        };
    }

    buildWeaponMesh(wpn, enh) {
        const wpnGroup = new THREE.Group();
        wpnGroup.position.set(0.76, 0.88, 0.22);

        const bladeMat = new THREE.MeshBasicMaterial({ color: wpn.bladeColor });
        const glowMat = new THREE.MeshBasicMaterial({ color: wpn.glowColor, transparent: true, opacity: 0.78 });
        const hiltMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b });
        const scaleBonus = 1 + Math.min(0.42, enh * 0.02);

        const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.36, 8), hiltMat);
        wpnGroup.add(grip);
        const guard = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.11, 0.18), hiltMat);
        guard.position.y = 0.16;
        wpnGroup.add(guard);

        let orbitPart = null;

        if (wpn.shape === 'wood') {
            const blade = new THREE.Mesh(new THREE.BoxGeometry(0.13, 1.25 * scaleBonus, 0.18), bladeMat);
            blade.position.y = 0.78 * scaleBonus;
            wpnGroup.add(blade);
        } else if (wpn.shape === 'broad') {
            const blade = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.50 * scaleBonus, 0.28), bladeMat);
            blade.position.y = 0.90 * scaleBonus;
            const edge = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.55 * scaleBonus, 0.35), glowMat);
            edge.position.y = 0.90 * scaleBonus;
            wpnGroup.add(blade, edge);
        } else if (wpn.shape === 'flame') {
            const blade = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.65 * scaleBonus, 0.30), bladeMat);
            blade.position.y = 0.96 * scaleBonus;
            wpnGroup.add(blade);
            for (let i = 0; i < 4; i++) {
                const spike = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.38, 5), glowMat);
                spike.position.set(0, (0.45 + i * 0.35) * scaleBonus, 0.19);
                spike.rotation.x = 0.7;
                wpnGroup.add(spike);
            }
        } else if (wpn.shape === 'scythe') {
            const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 2.08 * scaleBonus, 8), hiltMat);
            shaft.position.y = 0.94 * scaleBonus;
            const scytheBlade = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.26, 1.22 * scaleBonus), bladeMat);
            scytheBlade.position.set(0, 1.90 * scaleBonus, 0.44 * scaleBonus);
            scytheBlade.rotation.x = 0.22;
            const frostEdge = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.68, 6), glowMat);
            frostEdge.position.set(0, 1.80 * scaleBonus, 0.98 * scaleBonus);
            frostEdge.rotation.x = Math.PI * 0.75;
            wpnGroup.add(shaft, scytheBlade, frostEdge);
        } else if (wpn.shape === 'abyss') {
            [-0.12, 0.12].forEach(ox => {
                const subBlade = new THREE.Mesh(new THREE.BoxGeometry(0.09, 1.82 * scaleBonus, 0.25), bladeMat);
                subBlade.position.set(ox, 1.04 * scaleBonus, 0);
                wpnGroup.add(subBlade);
            });
            const voidCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), glowMat);
            voidCore.position.y = 0.28;
            wpnGroup.add(voidCore);
            orbitPart = voidCore;
        } else if (wpn.shape === 'omega') {
            const blade = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.95 * scaleBonus, 0.38), bladeMat);
            blade.position.y = 1.14 * scaleBonus;
            const haloRing = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.05, 8, 20), glowMat);
            haloRing.position.y = 0.34;
            wpnGroup.add(blade, haloRing);
            orbitPart = haloRing;
        } else {
            const blade = new THREE.Mesh(new THREE.BoxGeometry(0.20, 2.18 * scaleBonus, 0.44), bladeMat);
            blade.position.y = 1.25 * scaleBonus;
            const auraBlade = new THREE.Mesh(new THREE.BoxGeometry(0.34, 2.28 * scaleBonus, 0.56), glowMat);
            auraBlade.position.y = 1.25 * scaleBonus;
            const starOrb = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), glowMat);
            starOrb.position.y = 2.48 * scaleBonus;
            wpnGroup.add(blade, auraBlade, starOrb);
            orbitPart = starOrb;
        }

        if (enh >= 5) {
            const enhAura = new THREE.Mesh(
                new THREE.TorusGeometry(0.26, 0.045, 6, 16),
                new THREE.MeshBasicMaterial({ color: enh >= 15 ? 0xf43f5e : (enh >= 10 ? 0xfde047 : 0x38bdf8) })
            );
            enhAura.rotation.x = Math.PI / 2;
            enhAura.position.y = 0.22;
            wpnGroup.add(enhAura);
        }

        return { wpnGroup, orbitPart };
    }

    buildPlayerEntity() {
        const d = this.saveData;
        const st = this.calcDerivedStats();
        const evo = EVOLUTIONS[d.evolutionId] || EVOLUTIONS.novice;
        const wpn = WEAPONS[d.weaponId] || WEAPONS.wpn_wood;
        const arm = ARMORS[d.armorId] || ARMORS.arm_cloth;
        const acc = ACCESSORIES[d.accessoryId] || ACCESSORIES.acc_none;

        const pos = this.player ? this.player.pos.clone() : new THREE.Vector3(0, 0, 5.2);
        const rotY = this.player ? this.player.rotY : Math.PI;
        const hp = this.player ? Math.min(st.maxHp, this.player.hp) : st.maxHp;
        const mp = this.player ? Math.min(st.maxMp, this.player.mp) : st.maxMp;
        const cds = this.player ? this.player.skillCds : [0, 0, 0, 0, 0];

        if (this.player && this.player.headPlateEl) {
            this.player.headPlateEl.remove();
        }

        let group = null, head = null, frontMat = null, wpnGroup = null, orbitPart = null, backHalo = null;
        if (this.useWebGL) {
            if (this.player && this.player.group) {
                this.scene.remove(this.player.group);
            }
            group = new THREE.Group();
            group.position.copy(pos);
            group.rotation.y = rotY;

            const ring = new THREE.Mesh(
                new THREE.RingGeometry(0.82, 1.15, 24),
                new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })
            );
            ring.rotation.x = -Math.PI / 2;
            ring.position.y = 0.04;
            group.add(ring);

            if (evo.tier >= 2 || (d.rebirthCount || 0) > 0 || arm.tierLook >= 3) {
                const exRing = new THREE.Mesh(
                    new THREE.RingGeometry(1.24, 1.48, 28),
                    new THREE.MeshBasicMaterial({ color: arm.trimColor, side: THREE.DoubleSide, transparent: true, opacity: 0.88 })
                );
                exRing.rotation.x = -Math.PI / 2;
                exRing.position.y = 0.06;
                group.add(exRing);
            }

            const body = new THREE.Mesh(
                new THREE.CylinderGeometry(0.32, 0.42, 0.96, 12),
                new THREE.MeshLambertMaterial({ color: evo.hexColor })
            );
            body.position.y = 0.56;
            group.add(body);

            const chestMat = new THREE.MeshLambertMaterial({ color: arm.plateColor });
            const trimMat = new THREE.MeshBasicMaterial({ color: arm.trimColor });
            const chestPlate = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.54, 0.56), chestMat);
            chestPlate.position.set(0, 0.72, 0.02);
            group.add(chestPlate);

            const chestEmblem = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.30, 0.60), trimMat);
            chestEmblem.position.set(0, 0.74, 0.02);
            group.add(chestEmblem);

            if (arm.tierLook >= 3) {
                [-0.36, 0.36].forEach(wx => {
                    const tasset = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.38, 0.46), chestMat);
                    tasset.position.set(wx, 0.36, 0);
                    tasset.rotation.z = wx < 0 ? 0.22 : -0.22;
                    group.add(tasset);
                });
            }

            const mantleCollar = new THREE.Mesh(
                new THREE.BoxGeometry(0.76, 0.14, 0.36),
                new THREE.MeshLambertMaterial({ color: arm.trimColor })
            );
            mantleCollar.position.set(0, 0.98, -0.22);
            group.add(mantleCollar);

            const cape = new THREE.Mesh(
                new THREE.BoxGeometry(0.84, 0.94, 0.07),
                new THREE.MeshLambertMaterial({ color: arm.capeColor })
            );
            cape.position.set(0, 0.54, -0.46);
            cape.rotation.x = -0.26;
            group.add(cape);

            const shSize = 0.20 + arm.tierLook * 0.025;
            [-0.50, 0.50].forEach(sx => {
                const sh = new THREE.Mesh(new THREE.SphereGeometry(shSize, 10, 8), arm.tierLook >= 3 ? trimMat : chestMat);
                sh.position.set(sx, 0.96, 0);
                group.add(sh);
                if (arm.tierLook >= 2) {
                    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.095, 0.38, 6), trimMat);
                    horn.position.set(sx * 1.18, 1.18, 0);
                    horn.rotation.z = sx < 0 ? 0.36 : -0.36;
                    group.add(horn);
                }
            });

            if (arm.tierLook >= 1) {
                const shRad = 0.30 + arm.tierLook * 0.035;
                const shield = new THREE.Mesh(
                    new THREE.CylinderGeometry(shRad, shRad * 0.82, 0.09, arm.tierLook >= 4 ? 6 : 10),
                    chestMat
                );
                shield.rotation.z = Math.PI / 2;
                shield.position.set(-0.62, 0.76, 0.14);
                const shieldCore = new THREE.Mesh(
                    new THREE.CylinderGeometry(shRad * 0.48, shRad * 0.48, 0.11, 8),
                    trimMat
                );
                shieldCore.rotation.z = Math.PI / 2;
                shieldCore.position.set(-0.63, 0.76, 0.14);
                group.add(shield, shieldCore);
            }

            if (evo.tier >= 4 || arm.tierLook >= 4) {
                const wingColor = (evo.tier >= 5 || arm.tierLook >= 5) ? 0xfde047 : 0x38bdf8;
                const wingMat = new THREE.MeshBasicMaterial({ color: wingColor, transparent: true, opacity: 0.88 });
                [-1, 1].forEach(side => {
                    const wing = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.26, 0.06), wingMat);
                    wing.position.set(side * 0.82, 1.02, -0.42);
                    wing.rotation.z = side * 0.44;
                    group.add(wing);
                });
                if (arm.tierLook >= 5 || evo.tier >= 5) {
                    backHalo = new THREE.Mesh(
                        new THREE.TorusGeometry(0.68, 0.045, 6, 18),
                        new THREE.MeshBasicMaterial({ color: 0xfde047 })
                    );
                    backHalo.position.set(0, 1.15, -0.52);
                    group.add(backHalo);
                }
            }

            if (acc.id !== 'acc_none') {
                const accOrb = new THREE.Mesh(
                    new THREE.OctahedronGeometry(0.16, 0),
                    new THREE.MeshBasicMaterial({ color: 0xf472b6 })
                );
                accOrb.position.set(-0.78, 1.38, 0.2);
                group.add(accOrb);
            }

            const faceTex = getKaomojiFaceTexture(this.getBasePlayerKaomoji(), '#073b66', '#ffffff', '#38bdf8');
            frontMat = new THREE.MeshBasicMaterial({ map: faceTex });
            const sideMat = new THREE.MeshLambertMaterial({ color: 0xe0f2fe });
            head = new THREE.Mesh(
                new THREE.BoxGeometry(1.26, 0.66, 0.66),
                [sideMat, sideMat, sideMat, sideMat, frontMat, sideMat]
            );
            head.position.y = 1.62;
            group.add(head);

            const halo = new THREE.Mesh(
                new THREE.RingGeometry(0.32, 0.46, 18),
                new THREE.MeshBasicMaterial({ color: evo.tier >= 5 ? 0xf43f5e : 0xfde047, side: THREE.DoubleSide })
            );
            halo.rotation.x = -Math.PI / 2;
            halo.position.y = 0.42;
            head.add(halo);

            const builtWpn = this.buildWeaponMesh(wpn, d.weaponEnhance || 0);
            wpnGroup = builtWpn.wpnGroup;
            orbitPart = builtWpn.orbitPart;
            group.add(wpnGroup);

            this.scene.add(group);
        }

        const headPlateEl = document.createElement('div');
        headPlateEl.className = 'player-head-plate';
        headPlateEl.innerHTML = `
            <div class="player-head-title" id="p-head-lv">Lv.${d.lv}</div>
            <div class="mini-bar-track"><div id="p-head-hp" class="mini-bar-fill" style="width:100%; background:#10b981;"></div></div>
            <div class="mini-bar-track"><div id="p-head-mp" class="mini-bar-fill" style="width:100%; background:#0ea5e9;"></div></div>
            <div class="mini-bar-track" style="height:3px;"><div id="p-head-exp" class="mini-bar-fill" style="width:0%; background:#eab308;"></div></div>
        `;
        this.overlayLayer.appendChild(headPlateEl);

        this.player = {
            pos, rotY, group, head, frontMat, wpnGroup, orbitPart, backHalo, headPlateEl,
            hp, mp, skillCds: cds,
            invulnTimer: 0, stunTimer: 0,
            defBuffTimer: 0, defBuffBonus: 0,
            warcryTimer: 0, warcryBonus: 1.0,
            skillAnimType: 'none', skillAnimTimer: 0, skillAnimDur: 0.4
        };
    }

    buildPetEntity() {
        if (this.petEntity && this.petEntity.group && this.scene) {
            this.scene.remove(this.petEntity.group);
        }
        this.petEntity = null;

        const d = this.saveData;
        const petDef = d.petId ? PETS[d.petId] : null;
        if (!petDef || !this.player) return;

        const pos = new THREE.Vector3(this.player.pos.x - 1.4, 0, this.player.pos.z - 1.4);
        let group = null;
        if (this.useWebGL) {
            group = new THREE.Group();
            group.position.copy(pos);

            const ring = new THREE.Mesh(
                new THREE.RingGeometry(0.42, 0.58, 18),
                new THREE.MeshBasicMaterial({ color: petDef.color, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
            );
            ring.rotation.x = -Math.PI / 2;
            ring.position.y = 0.04;
            group.add(ring);

            const hexStr = '#' + petDef.color.toString(16).padStart(6, '0');
            const tex = getKaomojiFaceTexture(petDef.kaomoji, '#1e1b4b', '#ffffff', hexStr);
            const sideMat = new THREE.MeshLambertMaterial({ color: petDef.color });
            const cube = new THREE.Mesh(
                new THREE.BoxGeometry(0.86, 0.52, 0.52),
                [sideMat, sideMat, sideMat, sideMat, new THREE.MeshBasicMaterial({ map: tex }), sideMat]
            );
            cube.position.y = 0.65;
            group.add(cube);

            const crown = new THREE.Mesh(
                new THREE.OctahedronGeometry(0.16, 0),
                new THREE.MeshBasicMaterial({ color: 0xfde047 })
            );
            crown.position.y = 1.08;
            group.add(crown);

            this.scene.add(group);
        }

        this.petEntity = {
            def: petDef,
            pos,
            group,
            atkTimer: 1.5,
            healTimer: 4.5
        };
    }

    playSkillMotion(type, dur = 0.45) {
        if (!this.player) return;
        this.player.skillAnimType = type;
        this.player.skillAnimTimer = dur;
        this.player.skillAnimDur = dur;
    }

    spawnMonsterEntity(cfg) {
        const pos = cfg.spawnPos.clone();
        let group = null;
        const shapeType = cfg.isBoss
            ? 'boss'
            : (cfg.name.includes('スライム')
                ? 'slime'
                : ((cfg.name.includes('ゴーレム') || cfg.name.includes('ナイト') || cfg.name.includes('裁定者')) ? 'golem' : 'imp'));

        if (this.useWebGL) {
            group = new THREE.Group();
            group.position.copy(pos);
            const s = cfg.scale || 1.0;

            const dangerRing = new THREE.Mesh(
                new THREE.RingGeometry(0.75 * s, 0.98 * s, 20),
                new THREE.MeshBasicMaterial({ color: cfg.isBoss ? 0xf43f5e : 0xef4444, side: THREE.DoubleSide, transparent: true, opacity: 0.68 })
            );
            dangerRing.rotation.x = -Math.PI / 2;
            dangerRing.position.y = 0.03;
            group.add(dangerRing);

            const bodyMat = new THREE.MeshLambertMaterial({ color: cfg.color });
            const darkMat = new THREE.MeshLambertMaterial({ color: 0x1e1b4b });
            const hornMat = new THREE.MeshLambertMaterial({ color: 0xfef08a });

            const hexStr = '#' + cfg.color.toString(16).padStart(6, '0');
            const tex = getKaomojiFaceTexture(cfg.kaomoji, '#2a0815', '#fecdd3', hexStr);
            const head = new THREE.Mesh(
                new THREE.BoxGeometry(1.52 * s, 0.78 * s, 0.80 * s),
                [darkMat, darkMat, darkMat, darkMat, new THREE.MeshBasicMaterial({ map: tex }), darkMat]
            );

            if (shapeType === 'slime') {
                const dome = new THREE.Mesh(
                    new THREE.SphereGeometry(0.95 * s, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55),
                    bodyMat
                );
                dome.scale.set(1.15, 0.85, 1.15);
                group.add(dome);
                head.position.y = 1.15 * s;
            } else if (shapeType === 'golem') {
                const core = new THREE.Mesh(new THREE.DodecahedronGeometry(0.88 * s, 0), bodyMat);
                core.position.y = 0.85 * s;
                group.add(core);
                [-0.85 * s, 0.85 * s].forEach(bx => {
                    const block = new THREE.Mesh(new THREE.BoxGeometry(0.45 * s, 0.65 * s, 0.55 * s), darkMat);
                    block.position.set(bx, 1.15 * s, 0);
                    group.add(block);
                });
                head.position.y = 1.95 * s;
            } else if (shapeType === 'boss') {
                const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.72 * s, 0.92 * s, 1.35 * s, 10), bodyMat);
                torso.position.y = 0.72 * s;
                group.add(torso);

                [-1, 1].forEach(side => {
                    const upperWing = new THREE.Mesh(new THREE.BoxGeometry(1.35 * s, 0.52 * s, 0.12 * s), darkMat);
                    upperWing.position.set(side * 1.15 * s, 1.35 * s, -0.35 * s);
                    upperWing.rotation.z = side * 0.35;
                    group.add(upperWing);

                    const lowerWing = new THREE.Mesh(new THREE.BoxGeometry(1.05 * s, 0.38 * s, 0.10 * s), bodyMat);
                    lowerWing.position.set(side * 0.95 * s, 0.88 * s, -0.35 * s);
                    lowerWing.rotation.z = side * -0.25;
                    group.add(lowerWing);
                });

                [-0.48 * s, 0.48 * s].forEach(hx => {
                    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.18 * s, 0.68 * s, 7), hornMat);
                    horn.position.set(hx, 0.65 * s, 0);
                    horn.rotation.z = hx < 0 ? 0.32 : -0.32;
                    head.add(horn);
                });
                head.position.y = 1.88 * s;
            } else {
                const impBody = new THREE.Mesh(new THREE.ConeGeometry(0.75 * s, 1.15 * s, 8), bodyMat);
                impBody.rotation.x = Math.PI;
                impBody.position.y = 0.65 * s;
                group.add(impBody);

                [-0.42 * s, 0.42 * s].forEach(hx => {
                    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.12 * s, 0.45 * s, 6), hornMat);
                    horn.position.set(hx, 0.52 * s, 0);
                    horn.rotation.z = hx < 0 ? 0.28 : -0.28;
                    head.add(horn);
                });
                head.position.y = 1.55 * s;
            }

            group.add(head);
            this.scene.add(group);
        }

        const plateEl = document.createElement('div');
        plateEl.className = 'world-hp-plate';
        plateEl.innerHTML = `
            <div class="m-name-label" style="font-size:9px; font-weight:900; color:${cfg.isBoss ? '#fcd34d' : '#fca5a5'}; white-space:nowrap;">Lv.${cfg.lv} ${cfg.name}</div>
            <div class="bar-track" style="height:4px; margin-top:2px;"><div class="m-hp-fill bar-fill" style="width:100%; background:#f43f5e;"></div></div>
        `;
        this.overlayLayer.appendChild(plateEl);

        const m = {
            ...cfg,
            shapeType,
            hp: cfg.maxHp,
            pos,
            spawnPos: cfg.spawnPos.clone(),
            group,
            plateEl,
            dead: false,
            respawnTimer: 0,
            aggro: false,
            autoTimer: 1.4,
            atkAnimTimer: 0,
            mechTimer: 7.5,
            casting: null,
            stunTimer: 0,
            slowTimer: 0,
            slowFactor: 1.0,
            burnTimer: 0,
            burnDps: 0
        };
        this.monsters.push(m);
        return m;
    }

    spawnTownAllies() {
        const alliesCfg = [
            { name: '見習いルナ', kaomoji: '(*´ω｀*)', color: 0x34d399, x: -5.8, z: -4.8 },
            { name: '重騎士ガイン', kaomoji: '(｀・ω・´)', color: 0x60a5fa, x: 5.8, z: -4.2 },
            { name: '星導士ミア', kaomoji: '(☆ω☆)✧', color: 0xc084fc, x: 0.0, z: -8.2 }
        ];
        alliesCfg.forEach(a => {
            const pos = new THREE.Vector3(a.x, 0, a.z);
            let group = null;
            if (this.useWebGL) {
                group = new THREE.Group();
                group.position.copy(pos);
                const body = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.35, 0.45, 0.9, 10),
                    new THREE.MeshLambertMaterial({ color: a.color })
                );
                body.position.y = 0.5;
                group.add(body);

                const tex = getKaomojiFaceTexture(a.kaomoji, '#064e3b', '#ecfdf5', '#34d399');
                const sideMat = new THREE.MeshLambertMaterial({ color: 0xd1fae5 });
                const head = new THREE.Mesh(
                    new THREE.BoxGeometry(1.15, 0.6, 0.6),
                    [sideMat, sideMat, sideMat, sideMat, new THREE.MeshBasicMaterial({ map: tex }), sideMat]
                );
                head.position.y = 1.45;
                group.add(head);
                this.scene.add(group);
            }
            this.aiAllies.push({
                ...a, pos, homePos: pos.clone(), group,
                wanderTimer: Math.random() * 2, targetOffset: new THREE.Vector3()
            });
        });
    }

    clearZoneEntities() {
        this.selectedTarget = null;
        this.monsters.forEach(m => {
            if (m.group && this.scene) this.scene.remove(m.group);
            if (m.plateEl) m.plateEl.remove();
        });
        this.monsters = [];

        this.aiAllies.forEach(a => {
            if (a.group && this.scene) this.scene.remove(a.group);
        });
        this.aiAllies = [];

        this.zoneProps.forEach(p => {
            if (this.scene) this.scene.remove(p);
        });
        this.zoneProps = [];

        document.getElementById('boss-cast-box')?.classList.add('hidden');
        document.getElementById('warp-prompt-box')?.classList.add('hidden');
    }

    loadZone(zoneId) {
        this.towerState.active = false;
        this.towerState.clearing = false;
        const zone = ZONES[zoneId] || ZONES.town;
        this.currentZoneId = zone.id;
        this.clearZoneEntities();

        sfx.setBgmMode(zone.safe ? 'town' : 'field');

        if (this.useWebGL) {
            this.scene.background = new THREE.Color(zone.skyColor);
            this.scene.fog = new THREE.FogExp2(zone.skyColor, 0.015);
            this.groundMat.color.setHex(zone.groundColor);

            // 初期平和マップ(town)でも中央ワープを常設！街では出発ポータル色、狩場では帰還ポータル色
            if (this.warpGroup) {
                this.warpGroup.visible = true;
                this.warpOuterMat.color.setHex(zone.safe ? 0x10b981 : 0x38bdf8);
                this.warpPillarMat.color.setHex(zone.safe ? 0x34d399 : 0x7dd3fc);
            }

            const propColor = zone.safe ? 0x38bdf8 : 0x475569;
            const propMat = new THREE.MeshLambertMaterial({ color: propColor });
            const gemMat = new THREE.MeshBasicMaterial({ color: zone.safe ? 0xfde047 : 0xf43f5e });
            for (let i = 0; i < 8; i++) {
                const ang = (i / 8) * Math.PI * 2;
                const r = this.FIELD_LIMIT - 2.2;
                const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.65, 3.2, 8), propMat);
                pillar.position.set(Math.cos(ang) * r, 1.6, Math.sin(ang) * r);
                this.scene.add(pillar);
                this.zoneProps.push(pillar);

                const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), gemMat);
                gem.position.set(Math.cos(ang) * r, 3.7, Math.sin(ang) * r);
                this.scene.add(gem);
                this.zoneProps.push(gem);
            }
        }

        if (this.player) {
            this.player.pos.set(0, 0, 5.2);
            if (this.player.group) this.player.group.position.copy(this.player.pos);
        }
        if (this.petEntity && this.player) {
            this.petEntity.pos.set(this.player.pos.x - 1.4, 0, this.player.pos.z - 1.4);
        }

        if (zone.safe) {
            this.spawnTownAllies();
        } else {
            const threat = this.saveData.threatRank || 0;
            const threatMult = Math.pow(1.42, threat);
            let idx = 0;
            zone.monsters.forEach(mDef => {
                for (let c = 0; c < mDef.count; c++) {
                    const ang = (idx * 1.65) + (mDef.isBoss ? 0 : 0.4);
                    const dist = mDef.isBoss ? 15.5 : (9.5 + (idx % 4) * 3.6);
                    const spawnPos = new THREE.Vector3(Math.cos(ang) * dist, 0, Math.sin(ang) * dist);
                    this.spawnMonsterEntity({
                        ...mDef,
                        lv: mDef.lv + threat * 8,
                        maxHp: Math.round(mDef.hp * threatMult),
                        atk: Math.round(mDef.atk * Math.pow(1.30, threat)),
                        exp: Math.round(mDef.exp * Math.pow(1.36, threat)),
                        gold: Math.round(mDef.gold * Math.pow(1.33, threat)),
                        spawnPos
                    });
                    idx++;
                }
            });
        }

        this.refreshAllHUD();
    }

    startTowerMode(startFloor = 1) {
        this.currentZoneId = 'tower';
        this.towerState = { active: true, floor: Math.max(1, startFloor), clearing: false };
        this.clearZoneEntities();
        sfx.setBgmMode('boss');

        if (this.useWebGL) {
            this.scene.background = new THREE.Color(0x1f0933);
            this.scene.fog = new THREE.FogExp2(0x1f0933, 0.015);
            this.groundMat.color.setHex(0x2e1065);
            if (this.warpGroup) {
                this.warpGroup.visible = true;
                this.warpOuterMat.color.setHex(0xe879f9);
                this.warpPillarMat.color.setHex(0xc084fc);
            }
        }

        if (this.player) {
            this.player.pos.set(0, 0, 5.5);
            if (this.player.group) this.player.group.position.copy(this.player.pos);
        }

        this.spawnTowerFloor(this.towerState.floor);
        this.refreshAllHUD();
        this.showAlertBanner(`🗼 無限の試練の塔 第${this.towerState.floor}階層 挑戦開始！`, 2000);
    }

    spawnTowerFloor(floor) {
        const isBossFloor = (floor % 5 === 0);
        const scaleMult = Math.pow(1.22, floor - 1);
        const matKeys = Object.keys(MATERIALS);
        const dropMat = matKeys[Math.min(matKeys.length - 1, Math.floor((floor - 1) / 3))];

        if (isBossFloor) {
            const spawnPos = new THREE.Vector3(0, 0, -11);
            this.spawnMonsterEntity({
                name: `塔の守護神・第${floor}層`,
                kaomoji: '🗼꧁(╬◣д◢)꧂',
                lv: floor * 4,
                maxHp: Math.round(950 * scaleMult),
                atk: Math.round(55 * Math.pow(1.16, floor - 1)),
                exp: Math.round(350 * Math.pow(1.18, floor - 1)),
                gold: Math.round(300 * Math.pow(1.18, floor - 1)),
                color: 0xf43f5e,
                scale: 2.15,
                isBoss: true,
                isRaidBoss: true,
                noRespawn: true,
                drop: dropMat,
                spawnPos
            });
        } else {
            const count = 3 + Math.min(3, Math.floor(floor / 4));
            for (let i = 0; i < count; i++) {
                const ang = ((i + 0.5) / count) * Math.PI - Math.PI;
                const spawnPos = new THREE.Vector3(Math.cos(ang) * 11.5, 0, Math.sin(ang) * 11.5 - 3);
                this.spawnMonsterEntity({
                    name: `試練の番人[${floor}F]`,
                    kaomoji: '【▼皿▼】',
                    lv: floor * 3,
                    maxHp: Math.round(220 * scaleMult),
                    atk: Math.round(28 * Math.pow(1.15, floor - 1)),
                    exp: Math.round(90 * Math.pow(1.16, floor - 1)),
                    gold: Math.round(80 * Math.pow(1.16, floor - 1)),
                    color: 0xa855f7,
                    scale: 1.15,
                    isBoss: false,
                    noRespawn: true,
                    drop: dropMat,
                    spawnPos
                });
            }
        }
    }
}
