'use strict';

// =========================================================================
// 顔文字ファンタジー3D コアエンジン・装備3D造形・豪華技＆エモート演出 (game1.js)
// =========================================================================

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.muted = false;
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
    playTone(freq, dur = 0.08, type = 'sine', vol = 0.06) {
        if (this.muted) return;
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
    playHit(crit = false) {
        this.playTone(crit ? 560 : 240, crit ? 0.11 : 0.06, crit ? 'sawtooth' : 'triangle', crit ? 0.08 : 0.05);
    }
    playSkill() {
        this.playTone(580, 0.10, 'triangle', 0.07);
        setTimeout(() => this.playTone(880, 0.13, 'sine', 0.07), 50);
        setTimeout(() => this.playTone(1180, 0.15, 'triangle', 0.06), 110);
    }
    playLevelUp() {
        [523, 659, 784, 1046].forEach((f, i) => {
            setTimeout(() => this.playTone(f, 0.16, 'triangle', 0.08), i * 85);
        });
    }
    playDeath() {
        [330, 260, 195, 130].forEach((f, i) => {
            setTimeout(() => this.playTone(f, 0.24, 'sawtooth', 0.09), i * 130);
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

    if (faceTexCache.size >= 24) {
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

        this.WARP_PORTAL_RADIUS = 2.6;
        this.FIELD_LIMIT = 27.0;

        this.currentZoneId = 'town';
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

        this.monsters = [];
        this.aiAllies = [];
        this.zoneProps = [];
        this.effects = [];
        this.floatTexts = [];
        this.emoteBubbles = [];
        this.selectedTarget = null;

        this.saveData = this.loadSave();
        this.initThree();
        this.buildPlayerEntity();
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
            stats: { str: 5, int: 5, vit: 5, agi: 5 },
            weaponId: 'wpn_wood',
            armorId: 'arm_cloth',
            ownedWeapons: ['wpn_wood'],
            ownedArmors: ['arm_cloth'],
            weaponEnhance: 0,
            armorEnhance: 0,
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
                materials: { ...def.materials, ...(parsed.materials || {}) },
                skills: { ...def.skills, ...(parsed.skills || {}) },
                tree: { ...(parsed.tree || {}) },
                equippedSkills: Array.isArray(parsed.equippedSkills) ? parsed.equippedSkills.slice(0, 5) : def.equippedSkills
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

        this.scene.add(new THREE.AmbientLight(0xffffff, 0.82));
        const dir = new THREE.DirectionalLight(0xfffbeb, 0.75);
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

        this.warpPortalMesh = new THREE.Mesh(
            new THREE.RingGeometry(0.35, this.WARP_PORTAL_RADIUS, 36),
            new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.58 })
        );
        this.warpPortalMesh.rotation.x = -Math.PI / 2;
        this.warpPortalMesh.position.y = 0.05;
        this.scene.add(this.warpPortalMesh);

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
        const maxHp = Math.round(baseHp * evo.hpMult * (1 + tVital * 0.08) * warlordMult * rebirthMult);

        const baseMp = (45 + d.lv * 7 + d.stats.int * 10 + arm.mp * armEnhMult);
        const maxMp = Math.round(baseMp * evo.mpMult * warlordMult * rebirthMult);

        const baseAtk = (16 + d.lv * 4.5 + d.stats.str * 4.2 + d.stats.int * 1.4 + wpn.atk * wpnEnhMult);
        const warcryMult = (this.player && this.player.warcryTimer > 0) ? (this.player.warcryBonus || 1.0) : 1.0;
        const physAtk = Math.round(baseAtk * evo.atkMult * (1 + tMight * 0.06) * warlordMult * rebirthMult * warcryMult);

        const magMult = Number((wpn.mag * (1 + d.stats.int * 0.014) * (1 + tArcana * 0.08)).toFixed(2));

        const defBuff = (this.player && this.player.defBuffTimer > 0) ? (this.player.defBuffBonus || 0) : 0;
        const defMitigation = Math.min(0.88, 0.04 + d.stats.vit * 0.008 + arm.def * armEnhMult + tAegis * 0.03 + (evo.exDefBonus || 0) + defBuff);

        const rawCritChance = 0.06 + d.stats.str * 0.008 + d.stats.agi * 0.012 + tCrit * 0.05 + (evo.exCritBonus || 0);
        const critChance = Math.min(1.0, rawCritChance);
        const overflowCrit = Math.max(0, rawCritChance - 1.0);
        const overflowCritDmgBonus = overflowCrit * 1.5;
        const critDmg = 1.65 + d.stats.str * 0.015 + tCrit * 0.12 + (evo.isExJob ? 0.35 : 0) + overflowCritDmgBonus;

        const cdReduction = Math.min(0.68, d.stats.agi * 0.012 + tChant * 0.05 + tWarlord * 0.03 + (evo.exCdBonus || 0));
        const moveSpeed = (9.5 + Math.min(5.5, d.stats.agi * 0.15)) * evo.spdMult;

        return {
            maxHp, maxMp, physAtk, magMult, defMitigation,
            rawCritChance, critChance, overflowCrit, overflowCritDmgBonus, critDmg,
            cdReduction, moveSpeed,
            treeSkillPowerMult: 1 + tArcana * 0.08,
            treeHealPowerMult: 1 + tAegis * 0.08,
            treeHpRegenBonus: tVital * 0.004,
            treeMpRegenMult: 1 + tChant * 0.10,
            treeRewardMult: 1 + tFortune * 0.10,
            rebirthMult
        };
    }

    // -----------------------------------------------------------------
    // 武器ごとの専用3Dメッシュ生成（装備を変えると見た目も激変！）
    // -----------------------------------------------------------------
    buildWeaponMesh(wpn, enh) {
        const wpnGroup = new THREE.Group();
        wpnGroup.position.set(0.76, 0.88, 0.22);

        const bladeMat = new THREE.MeshBasicMaterial({ color: wpn.bladeColor });
        const glowMat = new THREE.MeshBasicMaterial({ color: wpn.glowColor, transparent: true, opacity: 0.72 });
        const hiltMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b });
        const scaleBonus = 1 + Math.min(0.45, enh * 0.02);

        // 柄＆鍔
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
            const blade = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.48 * scaleBonus, 0.28), bladeMat);
            blade.position.y = 0.88 * scaleBonus;
            const edge = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.52 * scaleBonus, 0.34), glowMat);
            edge.position.y = 0.88 * scaleBonus;
            wpnGroup.add(blade, edge);
        } else if (wpn.shape === 'flame') {
            const blade = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.62 * scaleBonus, 0.30), bladeMat);
            blade.position.y = 0.95 * scaleBonus;
            wpnGroup.add(blade);
            for (let i = 0; i < 4; i++) {
                const spike = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.35, 5), glowMat);
                spike.position.set(0, (0.45 + i * 0.34) * scaleBonus, 0.18);
                spike.rotation.x = 0.7;
                wpnGroup.add(spike);
            }
        } else if (wpn.shape === 'scythe') {
            // 氷皇のクリスタル大鎌
            const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 2.05 * scaleBonus, 8), hiltMat);
            shaft.position.y = 0.92 * scaleBonus;
            const scytheBlade = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.26, 1.18 * scaleBonus), bladeMat);
            scytheBlade.position.set(0, 1.88 * scaleBonus, 0.42 * scaleBonus);
            scytheBlade.rotation.x = 0.22;
            const frostEdge = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.65, 6), glowMat);
            frostEdge.position.set(0, 1.78 * scaleBonus, 0.95 * scaleBonus);
            frostEdge.rotation.x = Math.PI * 0.75;
            wpnGroup.add(shaft, scytheBlade, frostEdge);
        } else if (wpn.shape === 'abyss') {
            // 深淵の双刃神剣
            [-0.11, 0.11].forEach(ox => {
                const subBlade = new THREE.Mesh(new THREE.BoxGeometry(0.09, 1.78 * scaleBonus, 0.24), bladeMat);
                subBlade.position.set(ox, 1.02 * scaleBonus, 0);
                wpnGroup.add(subBlade);
            });
            const voidCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), glowMat);
            voidCore.position.y = 0.26;
            wpnGroup.add(voidCore);
            orbitPart = voidCore;
        } else if (wpn.shape === 'omega') {
            // 創世神オメガ・エッジ（光輪付き聖大剣）
            const blade = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.92 * scaleBonus, 0.36), bladeMat);
            blade.position.y = 1.12 * scaleBonus;
            const haloRing = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.05, 8, 20), glowMat);
            haloRing.position.y = 0.34;
            wpnGroup.add(blade, haloRing);
            orbitPart = haloRing;
        } else {
            // 神話級・創世天剣（巨大光剣＋浮遊星屑オーブ）
            const blade = new THREE.Mesh(new THREE.BoxGeometry(0.20, 2.15 * scaleBonus, 0.42), bladeMat);
            blade.position.y = 1.24 * scaleBonus;
            const auraBlade = new THREE.Mesh(new THREE.BoxGeometry(0.32, 2.25 * scaleBonus, 0.54), glowMat);
            auraBlade.position.y = 1.24 * scaleBonus;
            const starOrb = new THREE.Mesh(new THREE.OctahedronGeometry(0.26, 0), glowMat);
            starOrb.position.y = 2.45 * scaleBonus;
            wpnGroup.add(blade, auraBlade, starOrb);
            orbitPart = starOrb;
        }

        // 精錬+5以上で追加オーラクリスタル
        if (enh >= 5) {
            const enhAura = new THREE.Mesh(
                new THREE.TorusGeometry(0.24, 0.04, 6, 16),
                new THREE.MeshBasicMaterial({ color: enh >= 15 ? 0xf43f5e : (enh >= 10 ? 0xfde047 : 0x38bdf8) })
            );
            enhAura.rotation.x = Math.PI / 2;
            enhAura.position.y = 0.22;
            wpnGroup.add(enhAura);
        }

        return { wpnGroup, orbitPart };
    }

    // -----------------------------------------------------------------
    // プレイヤー＆防具3D造形（防具ごとに鎧カラー・肩当て・背負い盾・光輪が変化！）
    // -----------------------------------------------------------------
    buildPlayerEntity() {
        const d = this.saveData;
        const st = this.calcDerivedStats();
        const evo = EVOLUTIONS[d.evolutionId] || EVOLUTIONS.novice;
        const wpn = WEAPONS[d.weaponId] || WEAPONS.wpn_wood;
        const arm = ARMORS[d.armorId] || ARMORS.arm_cloth;

        const pos = this.player ? this.player.pos.clone() : new THREE.Vector3(0, 0, 0);
        const rotY = this.player ? this.player.rotY : Math.PI;
        const hp = this.player ? Math.min(st.maxHp, this.player.hp) : st.maxHp;
        const mp = this.player ? Math.min(st.maxMp, this.player.mp) : st.maxMp;
        const cds = this.player ? this.player.skillCds : [0, 0, 0, 0, 0];

        if (this.player && this.player.headPlateEl) {
            this.player.headPlateEl.remove();
        }

        let group = null, head = null, frontMat = null, wpnGroup = null, orbitPart = null;
        if (this.useWebGL) {
            if (this.player && this.player.group) {
                this.scene.remove(this.player.group);
            }
            group = new THREE.Group();
            group.position.copy(pos);
            group.rotation.y = rotY;

            // 足元の蒼穹魔法陣
            const ring = new THREE.Mesh(
                new THREE.RingGeometry(0.82, 1.15, 24),
                new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })
            );
            ring.rotation.x = -Math.PI / 2;
            ring.position.y = 0.04;
            group.add(ring);

            if (evo.tier >= 2 || (d.rebirthCount || 0) > 0 || arm.tierLook >= 4) {
                const exRing = new THREE.Mesh(
                    new THREE.RingGeometry(1.24, 1.46, 28),
                    new THREE.MeshBasicMaterial({ color: arm.trimColor, side: THREE.DoubleSide, transparent: true, opacity: 0.88 })
                );
                exRing.rotation.x = -Math.PI / 2;
                exRing.position.y = 0.06;
                group.add(exRing);
            }

            // 胴体ベース（職業カラー）＋ 防具プレート（防具ごとに色が変化！）
            const body = new THREE.Mesh(
                new THREE.CylinderGeometry(0.38, 0.52, 0.98, 12),
                new THREE.MeshLambertMaterial({ color: evo.hexColor })
            );
            body.position.y = 0.56;
            group.add(body);

            const chestPlate = new THREE.Mesh(
                new THREE.BoxGeometry(0.60, 0.50, 0.48),
                new THREE.MeshLambertMaterial({ color: arm.plateColor })
            );
            chestPlate.position.set(0, 0.72, 0.08);
            group.add(chestPlate);

            // 防具の紋章コア（胸中央の装飾）
            const chestTrim = new THREE.Mesh(
                new THREE.BoxGeometry(0.24, 0.28, 0.52),
                new THREE.MeshBasicMaterial({ color: arm.trimColor })
            );
            chestTrim.position.set(0, 0.74, 0.09);
            group.add(chestTrim);

            // マント（防具のcapeColorを反映）
            const cape = new THREE.Mesh(
                new THREE.BoxGeometry(0.80, 0.96, 0.08),
                new THREE.MeshLambertMaterial({ color: arm.capeColor })
            );
            cape.position.set(0, 0.56, -0.34);
            cape.rotation.x = 0.22;
            group.add(cape);

            // 防具Tier1以上：重装甲ショルダーガード（防具ランクで巨大化＆スパイク追加）
            const shoulderMat = new THREE.MeshLambertMaterial({ color: arm.trimColor });
            const shSize = 0.19 + arm.tierLook * 0.022;
            [-0.50, 0.50].forEach(sx => {
                const sh = new THREE.Mesh(new THREE.SphereGeometry(shSize, 10, 8), shoulderMat);
                sh.position.set(sx, 0.96, 0);
                group.add(sh);
                if (arm.tierLook >= 2) {
                    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.34, 6), new THREE.MeshBasicMaterial({ color: arm.plateColor }));
                    horn.position.set(sx * 1.18, 1.16, 0);
                    horn.rotation.z = sx < 0 ? 0.35 : -0.35;
                    group.add(horn);
                }
            });

            // 左腕の紋章シールド（防具Tier1以上で出現！）
            if (arm.tierLook >= 1) {
                const shield = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.32 + arm.tierLook * 0.03, 0.28, 0.09, 8),
                    new THREE.MeshLambertMaterial({ color: arm.plateColor })
                );
                shield.rotation.z = Math.PI / 2;
                shield.position.set(-0.62, 0.76, 0.15);
                const shieldCore = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.15, 0.15, 0.11, 8),
                    new THREE.MeshBasicMaterial({ color: arm.trimColor })
                );
                shieldCore.rotation.z = Math.PI / 2;
                shieldCore.position.set(-0.63, 0.76, 0.15);
                group.add(shield, shieldCore);
            }

            // 進化Tier4以上 or 神話防具の背面光輪・光の翼
            if (evo.tier >= 4 || arm.tierLook >= 5) {
                const wingColor = (evo.tier >= 5 || arm.tierLook >= 5) ? 0xfde047 : 0x38bdf8;
                const wingMat = new THREE.MeshBasicMaterial({ color: wingColor, transparent: true, opacity: 0.85 });
                [-1, 1].forEach(side => {
                    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.26, 0.06), wingMat);
                    wing.position.set(side * 0.80, 0.96, -0.38);
                    wing.rotation.z = side * 0.42;
                    group.add(wing);
                });
            }

            // 顔文字ヘッド＋頭上の光輪
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

            // 武器3Dモデル追加
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
            pos, rotY, group, head, frontMat, wpnGroup, orbitPart, headPlateEl,
            hp, mp, skillCds: cds,
            invulnTimer: 0, stunTimer: 0,
            defBuffTimer: 0, defBuffBonus: 0,
            warcryTimer: 0, warcryBonus: 1.0,
            skillAnimType: 'none', skillAnimTimer: 0, skillAnimDur: 0.4
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
            { name: '見習いルナ', kaomoji: '(*´ω｀*)', color: 0x34d399, x: -5.5, z: -4.5 },
            { name: '重騎士ガイン', kaomoji: '(｀・ω・´)', color: 0x60a5fa, x: 5.8, z: -4.0 },
            { name: '星導士ミア', kaomoji: '(☆ω☆)✧', color: 0xc084fc, x: 0.0, z: -7.5 }
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

    loadZone(zoneId) {
        const zone = ZONES[zoneId] || ZONES.town;
        this.currentZoneId = zone.id;
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

        if (this.useWebGL) {
            this.scene.background = new THREE.Color(zone.skyColor);
            this.scene.fog = new THREE.FogExp2(zone.skyColor, 0.015);
            this.groundMat.color.setHex(zone.groundColor);
            this.warpPortalMesh.visible = !zone.safe;

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
            this.player.pos.set(0, 0, zone.safe ? 0 : 4.2);
            if (this.player.group) this.player.group.position.copy(this.player.pos);
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

    isOnWarpPortal(pos) {
        if (!pos || this.currentZoneId === 'town') return false;
        return Math.hypot(pos.x, pos.z) <= this.WARP_PORTAL_RADIUS;
    }

    clampPosition(pos) {
        const maxR = this.FIELD_LIMIT - 1.0;
        const d = Math.hypot(pos.x, pos.z);
        if (d > maxR) {
            pos.x = (pos.x / d) * maxR;
            pos.z = (pos.z / d) * maxR;
        }
    }

    getNearestMonster(maxRange = 999) {
        if (!this.player) return null;
        let best = null;
        let bestDist = maxRange;
        for (const m of this.monsters) {
            if (m.dead) continue;
            const d = this.player.pos.distanceTo(m.pos);
            if (d < bestDist) {
                bestDist = d;
                best = m;
            }
        }
        return best;
    }

    getValidTarget() {
        if (this.selectedTarget && !this.selectedTarget.dead) return this.selectedTarget;
        this.selectedTarget = this.getNearestMonster(24);
        return this.selectedTarget;
    }

    cycleTarget() {
        const alive = this.monsters.filter(m => !m.dead);
        if (alive.length === 0) {
            this.showAlertBanner('近くに敵がいません', 1100);
            return;
        }
        const curIdx = alive.indexOf(this.selectedTarget);
        this.selectedTarget = alive[(curIdx + 1) % alive.length];
        this.spawnRingEffect(this.selectedTarget.pos, 0x38bdf8, 1.8);
        this.showAlertBanner(`🎯 標的: ${this.selectedTarget.name} (Lv.${this.selectedTarget.lv})`, 1200);
    }

    getLevelDiffDamageMultiplier(targetLv) {
        const myLv = this.saveData.lv || 1;
        if (targetLv <= myLv) return 1.0;
        const diff = targetLv - myLv;
        return Math.max(0.06, 1 / (1 + diff * 0.09));
    }

    damageMonster(m, rawDmg, isCrit = false) {
        if (!m || m.dead) return 0;
        const lvMult = this.getLevelDiffDamageMultiplier(m.lv);
        const dmg = Math.max(1, Math.round(rawDmg * lvMult));
        m.aggro = true;
        this.selectedTarget = m;
        m.hp = Math.max(0, m.hp - dmg);

        sfx.playHit(isCrit);
        const isResisted = lvMult < 0.85;
        const label = isCrit
            ? `💥${formatBigNum(dmg)}!${isResisted ? '(格上耐性)' : ''}`
            : `${formatBigNum(dmg)}${isResisted ? '🛡️' : ''}`;
        const color = isResisted ? '#94a3b8' : (isCrit ? '#fde047' : '#ffffff');
        this.spawnFloatingText(m.pos, label, color, isCrit ? 1.25 : 1.0);

        if (m.hp <= 0) {
            m.dead = true;
            m.casting = null;
            m.respawnTimer = m.isBoss ? 8.0 : 3.5;
            if (m.group) m.group.visible = false;
            if (m.plateEl) m.plateEl.style.display = 'none';
            if (m.isRaidBoss) document.getElementById('boss-cast-box')?.classList.add('hidden');
            if (this.selectedTarget === m) this.selectedTarget = null;
            this.grantKillRewards(m);
        }
        return dmg;
    }

    grantKillRewards(m) {
        const d = this.saveData;
        const st = this.calcDerivedStats();
        const gainExp = Math.round(m.exp * st.treeRewardMult);
        const gainGold = Math.round(m.gold * st.treeRewardMult);

        d.exp += gainExp;
        d.gold += gainGold;

        if (m.drop && MATERIALS[m.drop]) {
            const dropAmt = m.isBoss ? (2 + Math.floor((d.threatRank || 0) / 3)) : 1;
            d.materials[m.drop] = (d.materials[m.drop] || 0) + dropAmt;
            this.spawnFloatingText(m.pos, `${MATERIALS[m.drop].icon}+${dropAmt}`, '#6ee7b7', 0.95);
        }

        if (m.isBoss) {
            const dropChance = Math.min(1.0, 0.30 + m.lv * 0.008);
            if (Math.random() < dropChance) {
                const bonusAp = 1 + Math.floor(m.lv / 25);
                const bonusSp = (m.lv >= 20 && Math.random() < Math.min(0.95, 0.25 + m.lv * 0.006))
                    ? (1 + Math.floor(m.lv / 50))
                    : 0;
                d.ap += bonusAp;
                d.sp += bonusSp;
                const dropTxt = bonusSp > 0 ? `✨AP+${bonusAp} / SP+${bonusSp}` : `✨AP+${bonusAp}`;
                this.spawnFloatingText(m.pos, dropTxt, '#f0abfc', 1.2);
                this.showAlertBanner(`👑 ボス討伐報酬！ ${dropTxt} をドロップ獲得！`, 2200);
            }
        }

        let leveledUp = false;
        while (d.lv < MAX_PLAYER_LEVEL && d.exp >= this.getExpNeeded(d.lv)) {
            d.exp -= this.getExpNeeded(d.lv);
            d.lv += 1;
            d.ap += 3;
            d.sp += 1;
            leveledUp = true;
        }
        if (d.lv >= MAX_PLAYER_LEVEL) {
            d.exp = Math.min(d.exp, this.getExpNeeded(MAX_PLAYER_LEVEL));
        }

        if (leveledUp) {
            const newSt = this.calcDerivedStats();
            this.player.hp = newSt.maxHp;
            this.player.mp = newSt.maxMp;
            sfx.playLevelUp();
            this.spawnPillarEffect(this.player.pos, 0xfde047, 1.8, 7.0);
            this.spawnRingEffect(this.player.pos, 0xfde047, 4.2);
            this.showAlertBanner(`🎉 LEVEL UP! Lv.${d.lv} 到達！(AP+3 / SP+1)`, 2400);
            this.saveGame(false);
        }
    }

    triggerDeathSequence() {
        if (this.isDead) return;
        this.isDead = true;
        this.autoHunt = false;
        const autoBtn = document.getElementById('btn-toggle-autohunt');
        if (autoBtn) autoBtn.textContent = '🤖 AUTO:OFF';

        sfx.playDeath();
        const overlay = document.getElementById('death-overlay');
        if (overlay) overlay.classList.remove('hidden');

        setTimeout(() => {
            if (overlay) overlay.classList.add('hidden');
            this.loadZone('town');
            const resetSt = this.calcDerivedStats();
            this.player.hp = resetSt.maxHp;
            this.player.mp = resetSt.maxMp;
            this.isDead = false;
            this.showAlertBanner('🏠 「始まりの顔文字広場」で復活しました！装備やLvを整えよう', 2800);
        }, 2100);
    }

    damagePlayer(rawAtk) {
        if (!this.player || this.currentZoneId === 'town' || this.isDead) return;
        if (this.player.invulnTimer > 0) return;

        const st = this.calcDerivedStats();
        const dmg = Math.max(1, Math.round(rawAtk * (1 - st.defMitigation)));
        this.player.hp = Math.max(0, this.player.hp - dmg);
        this.spawnFloatingText(this.player.pos, `-${formatBigNum(dmg)}`, '#fb7185', 1.05);

        if (this.player.hp <= 0) {
            this.triggerDeathSequence();
        }
    }

    // -----------------------------------------------------------------
    // スキル発動（スキルごとの専用全身モーション＆豪華3D演出！）
    // -----------------------------------------------------------------
    useSkillSlot(slotIdx) {
        if (!this.player || this.isModalOpen || this.isDead) return;
        const d = this.saveData;
        const skId = d.equippedSkills[slotIdx];
        const sk = skId ? SKILLS[skId] : null;
        if (!sk) return;

        const skLv = d.skills[skId] || 1;
        const mpCost = getSkillMpCost(sk, skLv);

        if ((this.player.skillCds[slotIdx] || 0) > 0) return;
        if (this.player.mp < mpCost) {
            this.showAlertBanner(`MPが足りません！(必要MP: ${mpCost})`, 950);
            return;
        }

        const pPos = this.player.pos;
        const target = this.getValidTarget();
        const needsTarget = ['SINGLE_DMG', 'INTERRUPT', 'THUNDER', 'DRAIN'].includes(sk.type);
        if (needsTarget && (!target || target.dead)) {
            this.showAlertBanner('攻撃対象の敵がいません！', 1000);
            return;
        }

        const st = this.calcDerivedStats();
        const eff = getSkillEffectStats(sk, skLv, st);

        this.player.mp -= mpCost;
        this.player.skillCds[slotIdx] = Math.max(0.6, sk.cd * (1 - st.cdReduction));
        sfx.playSkill();

        const extraCrit = sk.type === 'SINGLE_DMG' ? skLv * 0.025 : 0;
        const totalSkCrit = st.rawCritChance + extraCrit;
        const crit = Math.random() < Math.min(1.0, totalSkCrit);
        const skOverflowBonus = Math.max(0, totalSkCrit - 1.0) * 1.5;
        const critMult = crit ? (st.critDmg + (skOverflowBonus - st.overflowCritDmgBonus)) : 1.0;

        if (target && !target.dead) {
            const dx = target.pos.x - pPos.x;
            const dz = target.pos.z - pPos.z;
            if (dx * dx + dz * dz > 0.01) this.player.rotY = Math.atan2(dx, dz);
        }

        // スキル別豪華モーション＆3Dビジュアル
        if (sk.id === 'void_blade') {
            this.playSkillMotion('jump_slash', 0.48);
            const dmg = st.physAtk * st.magMult * eff.mult;
            this.damageMonster(target, dmg * critMult, crit);
            this.spawnCrossSlashEffect(target.pos, 0xc084fc, 3.8);
            this.spawnPillarEffect(target.pos, 0x9333ea, 1.3, 6.5);
        } else if (sk.type === 'SINGLE_DMG') {
            this.playSkillMotion('jump_slash', 0.42);
            const dmg = st.physAtk * st.magMult * eff.mult;
            this.damageMonster(target, dmg * critMult, crit);
            this.spawnCrossSlashEffect(target.pos, 0x38bdf8, 2.8);
        } else if (sk.type === 'THUNDER') {
            this.playSkillMotion('cast_up', 0.45);
            const dmg = st.physAtk * st.magMult * eff.mult;
            this.damageMonster(target, dmg * critMult, crit);
            this.spawnPillarEffect(target.pos, 0xfde047, 1.1, 12.0);
            this.spawnRingEffect(target.pos, 0xfef08a, 3.6);
        } else if (sk.type === 'INTERRUPT') {
            this.playSkillMotion('slam_ground', 0.44);
            const dmg = st.physAtk * st.magMult * eff.mult;
            this.damageMonster(target, dmg * critMult, crit);
            target.stunTimer = eff.stunDur;
            if (target.casting) {
                target.casting = null;
                document.getElementById('boss-cast-box')?.classList.add('hidden');
                this.showAlertBanner(`🛡️ ボス詠唱中断＋気絶 ${eff.stunDur}秒！`, 1800);
            }
            this.spawnRingEffect(target.pos, 0xfbbf24, 3.4);
            this.spawnCrossSlashEffect(target.pos, 0xf59e0b, 2.6);
        } else if (sk.type === 'DRAIN') {
            this.playSkillMotion('dash_thrust', 0.42);
            const dmg = st.physAtk * st.magMult * eff.mult;
            const dealt = this.damageMonster(target, dmg * critMult, crit);
            const heal = Math.round(dealt * eff.drainRate);
            this.player.hp = Math.min(st.maxHp, this.player.hp + heal);
            this.spawnFloatingText(pPos, `🩸+${formatBigNum(heal)}`, '#34d399', 1.05);
            this.spawnBeamEffect(target.pos, pPos, 0xe11d48, 0.25);
            this.spawnRingEffect(pPos, 0xf43f5e, 2.4);
        } else if (sk.type === 'AOE_DMG' || sk.type === 'AOE_SLOW' || sk.type === 'AOE_BURN') {
            const rad = sk.radius || 6.5;
            const dmg = st.physAtk * st.magMult * eff.mult;

            if (sk.id === 'spin_whirl') {
                this.playSkillMotion('spin_whirl', 0.52);
                this.spawnRingEffect(pPos, 0x38bdf8, rad);
                this.spawnRingEffect(pPos, 0xe0f2fe, rad * 0.65);
            } else if (sk.id === 'meteor_star') {
                this.playSkillMotion('cast_up', 0.55);
                this.spawnMeteorEffect(pPos, 0xf97316, rad);
            } else if (sk.id === 'genesis_nova') {
                this.playSkillMotion('cast_up', 0.65);
                this.spawnPillarEffect(pPos, 0xfde047, 2.4, 14.0);
                this.spawnRingEffect(pPos, 0xf43f5e, rad);
                this.spawnRingEffect(pPos, 0xfde047, rad * 0.7);
            } else if (sk.type === 'AOE_SLOW') {
                this.playSkillMotion('slam_ground', 0.48);
                this.spawnIceSpikesEffect(pPos, rad);
                this.spawnRingEffect(pPos, 0x38bdf8, rad);
            } else {
                this.playSkillMotion('jump_slash', 0.52);
                this.spawnPillarEffect(pPos, 0xf97316, 2.0, 9.0);
                this.spawnRingEffect(pPos, 0xef4444, rad);
            }

            this.monsters.forEach(m => {
                if (!m.dead && pPos.distanceTo(m.pos) <= rad) {
                    this.damageMonster(m, dmg * critMult, crit);
                    if (sk.type === 'AOE_SLOW') {
                        m.slowTimer = eff.slowDur;
                        m.slowFactor = eff.slowFactor;
                    } else if (sk.type === 'AOE_BURN') {
                        m.burnTimer = 4.5;
                        m.burnDps = dmg * 0.38;
                    }
                }
            });
        } else if (sk.type === 'HEAL' || sk.type === 'HEAL_MP') {
            this.playSkillMotion('cast_up', 0.48);
            const healHp = Math.round(st.maxHp * eff.hpPct);
            this.player.hp = Math.min(st.maxHp, this.player.hp + healHp);
            this.player.stunTimer = 0;
            if (sk.type === 'HEAL_MP') {
                const healMp = Math.round(st.maxMp * eff.mpPct);
                this.player.mp = Math.min(st.maxMp, this.player.mp + healMp);
                this.spawnFloatingText(pPos, `🌈HP+${formatBigNum(healHp)} / MP+${formatBigNum(healMp)}`, '#6ee7b7', 1.1);
                this.spawnPillarEffect(pPos, 0xe879f9, 1.5, 8.0);
            } else {
                this.spawnFloatingText(pPos, `💚+${formatBigNum(healHp)}`, '#34d399', 1.1);
                this.spawnPillarEffect(pPos, 0x34d399, 1.3, 7.5);
            }
            this.spawnRingEffect(pPos, 0x34d399, 3.2);
        } else if (sk.type === 'DEF_BUFF') {
            this.playSkillMotion('slam_ground', 0.45);
            this.player.defBuffTimer = eff.duration;
            this.player.defBuffBonus = eff.defBonus;
            this.player.invulnTimer = Math.max(this.player.invulnTimer, eff.invuln);
            this.spawnDomeEffect(pPos, 0x38bdf8, 2.3);
            this.spawnRingEffect(pPos, 0x7dd3fc, 3.4);
            this.spawnFloatingText(pPos, `🔰 軽減+${Math.round(eff.defBonus * 100)}% (${eff.duration}s)`, '#7dd3fc', 1.05);
        } else if (sk.type === 'ATK_BUFF') {
            this.playSkillMotion('cast_up', 0.48);
            this.player.warcryTimer = eff.duration;
            this.player.warcryBonus = 1 + eff.atkBonus;
            this.spawnPillarEffect(pPos, 0xf97316, 1.6, 8.5);
            this.spawnRingEffect(pPos, 0xfbbf24, 3.4);
            this.spawnFloatingText(pPos, `🔥 攻撃+${Math.round(eff.atkBonus * 100)}% (${eff.duration}s)`, '#fbbf24', 1.05);
        }
    }

    // -----------------------------------------------------------------
    // 豪華3Dエモート（本物の3Dちゃぶ台飛行・極太ビーム・星パーティクル！）
    // -----------------------------------------------------------------
    triggerEmote(emoteId) {
        const em = EMOTES.find(e => e.id === emoteId);
        if (!em || !this.player) return;

        document.getElementById('emote-palette')?.classList.add('hidden');
        this.emoteTimer = 2.6;
        this.emoteMotion = em.motion;

        if (this.useWebGL && this.player.frontMat) {
            this.player.frontMat.map = getKaomojiFaceTexture(em.kaomoji, '#073b66', '#ffffff', '#f472b6');
            this.player.frontMat.needsUpdate = true;
        }

        sfx.playTone(587, 0.09, 'sine', 0.07);
        setTimeout(() => sfx.playTone(880, 0.12, 'triangle', 0.07), 65);

        const pPos = this.player.pos;
        const fwdX = Math.sin(this.player.rotY);
        const fwdZ = Math.cos(this.player.rotY);

        if (em.id === 'tableflip') {
            // 本物の3Dちゃぶ台を生成して前方へ回転させながら吹っ飛ばす！
            this.spawnTableFlipEffect(pPos, fwdX, fwdZ);
            this.spawnRingEffect(pPos, 0xf97316, 3.8);
            this.spawnFloatingText(pPos, '┻━┻ 彡(°□°)', '#fbbf24', 1.3);
        } else if (em.id === 'beam') {
            // 前方12mに極太カオモジレーザービーム発射！
            const endPos = new THREE.Vector3(pPos.x + fwdX * 12, 1.2, pPos.z + fwdZ * 12);
            this.spawnBeamEffect(new THREE.Vector3(pPos.x, 1.2, pPos.z), endPos, 0x38bdf8, 0.55);
            this.spawnRingEffect(pPos, 0x7dd3fc, 4.0);
            this.spawnFloatingText(pPos, '━☆・*。⚡', '#7dd3fc', 1.25);
        } else if (em.id === 'joy' || em.id === 'love' || em.id === 'victory' || em.id === 'dance') {
            this.spawnSparkleBurst(pPos, em.id === 'love' ? 0xf472b6 : 0xfde047, 10);
            this.spawnPillarEffect(pPos, 0xf472b6, 1.2, 5.5);
            this.spawnRingEffect(pPos, 0xfde047, 3.2);
        } else if (em.id === 'fire' || em.id === 'flex' || em.id === 'cool') {
            this.spawnPillarEffect(pPos, 0xf97316, 1.4, 6.5);
            this.spawnRingEffect(pPos, 0xfbbf24, 3.0);
        } else if (em.id === 'dogeza') {
            this.spawnRingEffect(pPos, 0x94a3b8, 3.4);
            this.spawnFloatingText(pPos, '＿|￣|○ ｽﾐﾏｾﾝ!!', '#e2e8f0', 1.2);
        } else {
            this.spawnSparkleBurst(pPos, 0xf472b6, 6);
            this.spawnRingEffect(pPos, 0xf472b6, 2.5);
        }

        this.spawnEmoteBubble(pPos, em.kaomoji, em.msg, 2.8);

        if (this.currentZoneId === 'town' && this.aiAllies.length > 0) {
            this.aiAllies.forEach((ally, i) => {
                setTimeout(() => {
                    if (this.currentZoneId === 'town') {
                        this.spawnEmoteBubble(ally.pos, ally.kaomoji, em.allyReply, 2.6);
                    }
                }, 350 + i * 280);
            });
        }
    }

    // -----------------------------------------------------------------
    // 豪華3Dエフェクトビルダー群
    // -----------------------------------------------------------------
    spawnSlashEffect(pos, colorHex = 0x38bdf8) {
        if (!this.useWebGL) return;
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(2.4, 0.14, 0.28),
            new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.95 })
        );
        mesh.position.set(pos.x, 1.1, pos.z);
        mesh.rotation.y = Math.random() * Math.PI;
        mesh.rotation.z = 0.55;
        this.scene.add(mesh);
        this.effects.push({ mesh, life: 0.24, maxLife: 0.24, kind: 'fade' });
    }

    spawnCrossSlashEffect(pos, colorHex = 0x38bdf8, size = 3.0) {
        if (!this.useWebGL) return;
        const grp = new THREE.Group();
        grp.position.set(pos.x, 1.25, pos.z);
        grp.rotation.y = this.player ? this.player.rotY : 0;
        const mat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.95 });
        const b1 = new THREE.Mesh(new THREE.BoxGeometry(size, 0.16, 0.22), mat);
        b1.rotation.z = 0.65;
        const b2 = new THREE.Mesh(new THREE.BoxGeometry(size, 0.16, 0.22), mat);
        b2.rotation.z = -0.65;
        grp.add(b1, b2);
        this.scene.add(grp);
        this.effects.push({ mesh: grp, life: 0.32, maxLife: 0.32, kind: 'expand' });
    }

    spawnRingEffect(pos, colorHex = 0x38bdf8, radius = 3.0) {
        if (!this.useWebGL) return;
        const mesh = new THREE.Mesh(
            new THREE.RingGeometry(0.3, radius, 28),
            new THREE.MeshBasicMaterial({ color: colorHex, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
        );
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(pos.x, 0.12, pos.z);
        this.scene.add(mesh);
        this.effects.push({ mesh, life: 0.38, maxLife: 0.38, kind: 'expand' });
    }

    spawnPillarEffect(pos, colorHex = 0xfde047, radius = 1.4, height = 8.0) {
        if (!this.useWebGL) return;
        const mesh = new THREE.Mesh(
            new THREE.CylinderGeometry(radius * 0.5, radius, height, 14, 1, true),
            new THREE.MeshBasicMaterial({ color: colorHex, side: THREE.DoubleSide, transparent: true, opacity: 0.72 })
        );
        mesh.position.set(pos.x, height * 0.5, pos.z);
        this.scene.add(mesh);
        this.effects.push({ mesh, life: 0.48, maxLife: 0.48, kind: 'pillar' });
    }

    spawnDomeEffect(pos, colorHex = 0x38bdf8, radius = 2.2) {
        if (!this.useWebGL) return;
        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(radius, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55),
            new THREE.MeshBasicMaterial({ color: colorHex, wireframe: true, transparent: true, opacity: 0.85 })
        );
        mesh.position.set(pos.x, 0.1, pos.z);
        this.scene.add(mesh);
        this.effects.push({ mesh, life: 0.65, maxLife: 0.65, kind: 'expand' });
    }

    spawnMeteorEffect(pos, colorHex = 0xf97316, rad = 6.5) {
        if (!this.useWebGL) return;
        const meteor = new THREE.Mesh(
            new THREE.DodecahedronGeometry(1.65, 0),
            new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.95 })
        );
        meteor.position.set(pos.x, 12.0, pos.z);
        this.scene.add(meteor);
        this.effects.push({ mesh: meteor, life: 0.42, maxLife: 0.42, kind: 'fall', startY: 12.0 });
        setTimeout(() => {
            this.spawnRingEffect(pos, colorHex, rad);
            this.spawnPillarEffect(pos, 0xfde047, 2.0, 8.5);
        }, 280);
    }

    spawnIceSpikesEffect(pos, rad = 6.0) {
        if (!this.useWebGL) return;
        const mat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.88 });
        for (let i = 0; i < 8; i++) {
            const ang = (i / 8) * Math.PI * 2;
            const dist = rad * 0.55;
            const spike = new THREE.Mesh(new THREE.ConeGeometry(0.45, 2.8, 6), mat);
            spike.position.set(pos.x + Math.cos(ang) * dist, 1.3, pos.z + Math.sin(ang) * dist);
            spike.rotation.z = Math.cos(ang) * -0.25;
            spike.rotation.x = Math.sin(ang) * 0.25;
            this.scene.add(spike);
            this.effects.push({ mesh: spike, life: 0.55, maxLife: 0.55, kind: 'fade' });
        }
    }

    spawnBeamEffect(fromPos, toPos, colorHex = 0x38bdf8, dur = 0.45) {
        if (!this.useWebGL) return;
        const dx = toPos.x - fromPos.x;
        const dz = toPos.z - fromPos.z;
        const dist = Math.max(0.5, Math.hypot(dx, dz));
        const beam = new THREE.Mesh(
            new THREE.CylinderGeometry(0.28, 0.28, dist, 10),
            new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.92 })
        );
        beam.position.set((fromPos.x + toPos.x) * 0.5, 1.25, (fromPos.z + toPos.z) * 0.5);
        beam.rotation.z = Math.PI / 2;
        beam.rotation.y = -Math.atan2(dz, dx);
        this.scene.add(beam);
        this.effects.push({ mesh: beam, life: dur, maxLife: dur, kind: 'fade' });
    }

    spawnTableFlipEffect(pos, fwdX, fwdZ) {
        if (!this.useWebGL) return;
        const table = new THREE.Group();
        const woodMat = new THREE.MeshLambertMaterial({ color: 0xb45309 });
        const top = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 0.14, 14), woodMat);
        table.add(top);
        [[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]].forEach(([lx, lz]) => {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.55, 0.14), woodMat);
            leg.position.set(lx, -0.32, lz);
            table.add(leg);
        });
        table.position.set(pos.x + fwdX * 1.2, 1.0, pos.z + fwdZ * 1.2);
        this.scene.add(table);
        this.effects.push({
            mesh: table,
            life: 0.95,
            maxLife: 0.95,
            kind: 'toss',
            vx: fwdX * 9.5,
            vz: fwdZ * 9.5
        });
    }

    spawnSparkleBurst(pos, colorHex = 0xfde047, count = 8) {
        if (!this.useWebGL) return;
        const mat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.95 });
        for (let i = 0; i < count; i++) {
            const ang = (i / count) * Math.PI * 2;
            const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), mat);
            star.position.set(pos.x + Math.cos(ang) * 1.1, 1.2 + (i % 3) * 0.4, pos.z + Math.sin(ang) * 1.1);
            this.scene.add(star);
            this.effects.push({ mesh: star, life: 0.75, maxLife: 0.75, kind: 'rise' });
        }
    }

    spawnFloatingText(pos, text, color = '#ffffff', scale = 1.0) {
        const el = document.createElement('div');
        el.className = 'world-float-text';
        el.style.color = color;
        el.style.fontSize = `${Math.round(15 * scale)}px`;
        el.textContent = text;
        this.overlayLayer.appendChild(el);
        this.floatTexts.push({
            el,
            worldPos: new THREE.Vector3(pos.x + (Math.random() - 0.5) * 0.8, 2.2, pos.z),
            life: 0.88
        });
    }

    spawnEmoteBubble(pos, kaomoji, msg, life = 2.6) {
        const el = document.createElement('div');
        el.className = 'world-emote-bubble';
        el.innerHTML = `<div class="font-kaomoji" style="font-size:12px; font-weight:900; color:#f9a8d4;">${kaomoji}</div><div style="font-size:10px; font-weight:800; color:#fff;">${msg}</div>`;
        this.overlayLayer.appendChild(el);
        this.emoteBubbles.push({
            el,
            worldPos: new THREE.Vector3(pos.x, 2.85, pos.z),
            life
        });
    }

    showAlertBanner(msg, duration = 2000) {
        const banner = document.getElementById('alert-banner');
        if (!banner) return;
        banner.textContent = msg;
        banner.classList.remove('hidden');
        if (this.alertTimeout) clearTimeout(this.alertTimeout);
        this.alertTimeout = setTimeout(() => banner.classList.add('hidden'), duration);
    }
}
