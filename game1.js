'use strict';

// =========================================================================
// 顔文字ファンタジー3D コアシステム・セーブ・タイトル・チャット基盤 (game1.js)
// =========================================================================

const MAX_PLAYER_LEVEL = 999;
const MAX_THREAT_RANK = 99;
const REBIRTH_REQ_LEVEL = 100;

// 公開用デフォルトFirebase URL（空欄の場合は各自のURLを入力して接続可能）
const DEFAULT_PUBLIC_FIREBASE_URL = '';

function formatBigNum(num) {
    const n = Math.floor(Number(num) || 0);
    if (n >= 1e12) return (n / 1e12).toFixed(2) + '兆';
    if (n >= 1e8) return (n / 1e8).toFixed(2) + '億';
    if (n >= 1e5) return (n / 1e4).toFixed(1) + '万';
    return n.toLocaleString('ja-JP');
}

const _faceTexCache = new Map();
function getKaomojiFaceTexture(kaomoji, bgHex = '#073b66', textHex = '#ffffff', borderHex = '#38bdf8') {
    const key = `${kaomoji}|${bgHex}|${textHex}|${borderHex}`;
    if (_faceTexCache.has(key)) return _faceTexCache.get(key);

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 192;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = bgHex || '#073b66';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = borderHex || '#38bdf8';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);

    const txt = String(kaomoji || '(´・ω・`)');
    let fontSize = 40;
    if (txt.length >= 12) fontSize = 24;
    else if (txt.length >= 9) fontSize = 30;
    else if (txt.length >= 7) fontSize = 34;

    ctx.font = `900 ${fontSize}px "MS PGothic", "Hiragino Kaku Gothic ProN", sans-serif`;
    ctx.fillStyle = textHex || '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(txt, canvas.width / 2, canvas.height / 2 + 2);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    _faceTexCache.set(key, tex);
    return tex;
}

// 軽量WebAudio効果音システム
const sfx = {
    ctx: null,
    bgmMuted: false,
    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                try { this.ctx = new AudioCtx(); } catch (e) {}
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
    },
    playTone(freq = 440, type = 'sine', dur = 0.1, vol = 0.06, slideTo = null) {
        if (this.bgmMuted || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, now);
            if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), now + dur);
            gain.gain.setValueAtTime(vol, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + dur);
        } catch (e) {}
    },
    playHit(crit = false) {
        this.playTone(crit ? 680 : 320, crit ? 'sawtooth' : 'triangle', crit ? 0.14 : 0.08, 0.07, 110);
    },
    playSkill() {
        this.playTone(520, 'sine', 0.16, 0.07, 880);
    },
    playHeal() {
        this.playTone(580, 'sine', 0.12, 0.06, 920);
        setTimeout(() => this.playTone(780, 'sine', 0.16, 0.06, 1180), 90);
    },
    playLevelUp() {
        [523, 659, 784, 1046].forEach((f, idx) => {
            setTimeout(() => this.playTone(f, 'triangle', 0.16, 0.07), idx * 75);
        });
    }
};

function getSkillMpCost(sk, skLv = 1) {
    const base = sk.mp || 10;
    return Math.round(base * (1 + (Math.max(1, skLv) - 1) * 0.12));
}

function getSkillEffectStats(sk, skLv = 1) {
    const lv = Math.max(1, skLv);
    if (sk.type === 'HEAL') {
        const hpPct = Math.min(0.95, (sk.baseRatio || 0.35) + (lv - 1) * 0.04);
        return { hpPct, summary: `HP ${Math.round(hpPct * 100)}% 回復` };
    }
    if (sk.type === 'HEAL_MP') {
        const hpPct = Math.min(0.95, (sk.baseRatio || 0.30) + (lv - 1) * 0.035);
        const mpPct = Math.min(0.80, 0.22 + (lv - 1) * 0.025);
        return { hpPct, mpPct, summary: `HP ${Math.round(hpPct * 100)}% / MP ${Math.round(mpPct * 100)}% 回復` };
    }
    if (sk.type === 'DEF_BUFF') {
        const invuln = Number((1.4 + (lv - 1) * 0.15).toFixed(1));
        const duration = Number((7 + (lv - 1) * 0.6).toFixed(1));
        const defBonus = Math.min(0.55, 0.25 + (lv - 1) * 0.03);
        return { invuln, duration, defBonus, summary: `無敵${invuln}s ＋ 被ダメ-${Math.round(defBonus * 100)}%(${duration}s)` };
    }
    if (sk.type === 'ATK_BUFF') {
        const duration = Number((8 + (lv - 1) * 0.7).toFixed(1));
        const atkBonus = 0.35 + (lv - 1) * 0.08;
        return { duration, atkBonus, summary: `攻撃力 +${Math.round(atkBonus * 100)}% (${duration}s)` };
    }
    const mult = (sk.mult || 1.6) * (1 + (lv - 1) * 0.22);
    if (sk.type === 'DRAIN') {
        const drainRate = Math.min(0.65, 0.22 + (lv - 1) * 0.02);
        return { mult, drainRate, summary: `威力 ${Math.round(mult * 100)}% ＋ 与ダメ${Math.round(drainRate * 100)}%吸収` };
    }
    if (sk.type === 'INTERRUPT') {
        const stunDur = Number((2.2 + (lv - 1) * 0.25).toFixed(1));
        return { mult, stunDur, summary: `威力 ${Math.round(mult * 100)}% ＋ 詠唱中断＆気絶${stunDur}s` };
    }
    if (sk.type === 'AOE_SLOW') {
        const slowDur = Number((4.0 + (lv - 1) * 0.3).toFixed(1));
        return { mult, slowDur, slowFactor: 0.45, summary: `範囲威力 ${Math.round(mult * 100)}% ＋ 鈍足${slowDur}s` };
    }
    if (sk.type === 'AOE_BURN') {
        return { mult, summary: `範囲威力 ${Math.round(mult * 100)}% ＋ 炎上継続ダメージ` };
    }
    return { mult, summary: `${sk.radius ? '範囲' : '単体'}威力 ${Math.round(mult * 100)}%` };
}

function getWeaponEnhanceRequirement(curEnh = 0) {
    const lv = Math.max(0, curEnh);
    const gold = Math.round(180 * Math.pow(1.38, lv));
    const matKeys = Object.keys(MATERIALS || { slime_gel: 1 });
    const mk = matKeys[Math.min(matKeys.length - 1, Math.floor(lv / 3))];
    const cnt = 2 + (lv % 3);
    return { gold, mats: { [mk]: cnt } };
}

function getArmorEnhanceRequirement(curEnh = 0) {
    const lv = Math.max(0, curEnh);
    const gold = Math.round(160 * Math.pow(1.36, lv));
    const matKeys = Object.keys(MATERIALS || { slime_gel: 1 });
    const mk = matKeys[Math.min(matKeys.length - 1, Math.floor(lv / 3))];
    const cnt = 2 + (lv % 3);
    return { gold, mats: { [mk]: cnt } };
}

class KaomojiMMORPG {
    constructor() {
        this.saveKey = 'kaomoji_mmorpg_3d_save_v2';
        this.canvas = document.getElementById('game-canvas');
        this.overlayLayer = document.getElementById('overlay-layer');

        this.saveData = this.loadSaveData();

        // 3D＆エンティティ状態
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.useWebGL = false;
        this.groundMat = null;
        this.warpGroup = null;
        this.warpCrystal = null;

        this.player = null;
        this.petEntity = null;
        this.monsters = [];
        this.aiAllies = [];
        this.envObjects = [];
        this.effects = [];
        this.floatTexts = [];
        this.emoteBubbles = [];
        this.remotePlayers = new Map();

        // 進行・戦闘状態
        this.currentZoneId = 'town';
        this.towerState = { active: false, floor: 1, wave: 1 };
        this.selectedTarget = null;
        this.isDead = false;
        this.isModalOpen = false;
        this.activeTab = 'stats';
        this.inTitleScreen = true;

        this.autoHunt = false;
        this.autoAttack = true;
        this.autoAtkTimer = 0;
        this.autoSkillTimer = 0;
        this.wasOnWarp = false;
        this.emoteTimer = 0;
        this.emoteMotion = 'none';

        // 入力・カメラ状態
        this.joyVec = { x: 0, y: 0 };
        this.keys = {};
        this.camYaw = 0;
        this.camPitch = 0.52;
        this.camDist = 14.5;
        this.camShake = 0;

        // オンライン＆チャット状態
        this.fbConnected = false;
        this.fbSyncTimer = 0;
        this.fbPollTimer = 0;
        this.fbLastEventTs = Date.now();
        this.chatTab = 'global';
        this.chatCollapsed = false;
        this.globalChatMessages = [
            { sender: '(ﾉ◕ヮ◕)ﾉ', name: 'システム', text: '🌍 全体チャットへようこそ！オンラインの全員と話せます。', isSystem: true }
        ];
        this.roomChatMessages = [
            { sender: '(=^・ω・^=)', name: 'システム', text: '🏠 部屋/オフラインチャットです。同じ部屋メンバーや街の仲間と話せます。', isSystem: true }
        ];

        this.lastTime = performance.now();

        this.initThree();
        this.buildPlayerEntity();
        this.buildPetEntity();
        this.loadZone('town');
        this.buildEmotePalette();
        this.renderChatMessages();
        this.bindEvents();
        this.refreshTitleScreen();
        this.refreshAllHUD();

        // 前回オンラインONだった場合は自動接続
        if (this.saveData.onlineEnabled && this.saveData.firebaseUrl) {
            this.connectFirebase(this.saveData.firebaseUrl, true);
        }

        requestAnimationFrame((t) => this.loop(t));
    }

    createDefaultSave() {
        return {
            isNewSave: true,
            playerUid: 'u_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36),
            lv: 1,
            exp: 0,
            gold: 250,
            ap: 3,
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
            stats: { str: 5, int: 5, vit: 5, agi: 5 },
            skills: { slash_arc: 1 },
            equippedSkills: ['slash_arc', null, null, null, null],
            tree: {},
            weaponId: 'wpn_wood',
            ownedWeapons: ['wpn_wood'],
            weaponEnhance: 0,
            weaponEnchant: null,
            armorId: 'arm_cloth',
            ownedArmors: ['arm_cloth'],
            armorEnhance: 0,
            armorEnchant: null,
            accessoryId: 'acc_none',
            ownedAccessories: ['acc_none'],
            petId: null,
            ownedPets: [],
            petLevel: 1,
            materials: {
                slime_gel: 0,
                goblin_fang: 0,
                ancient_sap: 0,
                fire_core: 0,
                ice_crystal: 0,
                void_shard: 0,
                star_fragment: 0
            },
            equippedTitleId: 'title_none',
            unlockedTitles: ['title_none'],
            claimedAchievements: [],
            statsTrack: {
                kills: 0,
                bossKills: 0,
                bestTowerFloor: 0,
                maxThreatKill: 0
            },
            // オンライン＆パスワード部屋＆クラウド設定
            firebaseUrl: DEFAULT_PUBLIC_FIREBASE_URL,
            onlineEnabled: false,
            roomPassEnabled: false,
            roomPassword: '',
            cloudId: '',
            cloudPin: ''
        };
    }

    loadSaveData() {
        const def = this.createDefaultSave();
        try {
            const raw = localStorage.getItem(this.saveKey) || localStorage.getItem('kaomoji_mmorpg_3d_save_v1');
            if (!raw) return def;
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed.lv !== 'number') return def;
            return {
                ...def,
                ...parsed,
                isNewSave: false,
                stats: { ...def.stats, ...(parsed.stats || {}) },
                skills: { ...def.skills, ...(parsed.skills || {}) },
                tree: { ...def.tree, ...(parsed.tree || {}) },
                materials: { ...def.materials, ...(parsed.materials || {}) },
                statsTrack: { ...def.statsTrack, ...(parsed.statsTrack || {}) },
                ownedCosmetics: Array.isArray(parsed.ownedCosmetics) ? parsed.ownedCosmetics : ['none'],
                ownedBackCosmetics: Array.isArray(parsed.ownedBackCosmetics) ? parsed.ownedBackCosmetics : ['back_none'],
                ownedWeapons: Array.isArray(parsed.ownedWeapons) ? parsed.ownedWeapons : ['wpn_wood'],
                ownedArmors: Array.isArray(parsed.ownedArmors) ? parsed.ownedArmors : ['arm_cloth'],
                ownedAccessories: Array.isArray(parsed.ownedAccessories) ? parsed.ownedAccessories : ['acc_none'],
                ownedPets: Array.isArray(parsed.ownedPets) ? parsed.ownedPets : [],
                unlockedTitles: Array.isArray(parsed.unlockedTitles) ? parsed.unlockedTitles : ['title_none'],
                claimedAchievements: Array.isArray(parsed.claimedAchievements) ? parsed.claimedAchievements : []
            };
        } catch (e) {
            return def;
        }
    }

    saveGame(showToast = false) {
        try {
            this.saveData.isNewSave = false;
            localStorage.setItem(this.saveKey, JSON.stringify(this.saveData));
            if (showToast) {
                sfx.playHeal();
                this.showAlertBanner('💾 セーブデータを保存しました！', 1500);
            }
        } catch (e) {}
    }

    // 完全データ初期化（確認ダイアログ後に即座に新品状態へリセット）
    hardResetGame() {
        const keepUrl = this.saveData.firebaseUrl || DEFAULT_PUBLIC_FIREBASE_URL;
        if (this.fbConnected && this.disconnectFirebase) {
            this.disconnectFirebase();
        }
        try {
            localStorage.removeItem(this.saveKey);
            localStorage.removeItem('kaomoji_mmorpg_3d_save_v1');
        } catch (e) {}

        this.saveData = this.createDefaultSave();
        this.saveData.firebaseUrl = keepUrl;
        this.autoHunt = false;
        this.isDead = false;
        this.isModalOpen = false;
        this.selectedTarget = null;
        this.towerState = { active: false, floor: 1, wave: 1 };

        document.getElementById('growth-modal')?.classList.add('hidden');
        document.getElementById('hud-drawer-menu')?.classList.add('hidden');
        document.getElementById('emote-palette')?.classList.add('hidden');

        const autoBtn = document.getElementById('btn-toggle-autohunt');
        if (autoBtn) {
            autoBtn.textContent = '🤖 AUTO:OFF';
            autoBtn.style.background = '';
        }

        this.globalChatMessages = [
            { sender: '(ﾉ◕ヮ◕)ﾉ', name: 'システム', text: '✨ データを完全初期化して新しい冒険の準備が整いました！', isSystem: true }
        ];
        this.roomChatMessages = [
            { sender: '(=^・ω・^=)', name: 'システム', text: '🏠 部屋/オフラインチャットです。', isSystem: true }
        ];
        this.renderChatMessages();

        this.buildPlayerEntity();
        this.buildPetEntity();
        this.loadZone('town');
        this.refreshTitleScreen();
        this.refreshAllHUD();
        this.showTitleScreen();
        sfx.playLevelUp();
        this.showAlertBanner('💥 セーブデータを完全に初期化しました！', 2200);
    }

    // -----------------------------------------------------------------
    // タイトル画面表示・更新
    // -----------------------------------------------------------------
    showTitleScreen() {
        this.inTitleScreen = true;
        this.refreshTitleScreen();
        document.getElementById('title-screen')?.classList.remove('hidden');
    }

    enterGameFromTitle() {
        sfx.init();
        sfx.playSkill();
        this.inTitleScreen = false;
        document.getElementById('title-screen')?.classList.add('hidden');
        this.saveGame(false);
        this.refreshAllHUD();
        if (this.saveData.onlineEnabled) {
            if (this.saveData.firebaseUrl) {
                this.connectFirebase(this.saveData.firebaseUrl, false);
            } else {
                this.openGrowthModal('online');
                this.showAlertBanner('🌐 オンラインを使うにはFirebase URLを設定してください', 2400);
            }
        }
    }

    refreshTitleScreen() {
        const d = this.saveData;
        const evo = EVOLUTIONS[d.evolutionId] || EVOLUTIONS.novice;
        const infoEl = document.getElementById('title-save-info');
        if (infoEl) {
            if (d.isNewSave && d.lv === 1 && d.exp === 0) {
                infoEl.innerHTML = `<span style="color:#6ee7b7; font-weight:900;">✨ 新規冒険データ（Lv.1 見習い顔文字）</span>`;
            } else {
                infoEl.innerHTML = `
                    <div class="font-kaomoji" style="font-size:15px; font-weight:900; color:#38bdf8;">${this.getBasePlayerKaomoji()} <span style="color:#fff;">${evo.name}</span></div>
                    <div style="font-size:11px; color:#fde047; font-weight:900; margin-top:2px;">Lv.${d.lv} / 転生${d.rebirthCount || 0}回 / 所持金 ${formatBigNum(d.gold)}G</div>
                `;
            }
        }

        const onBtn = document.getElementById('title-btn-toggle-online');
        if (onBtn) {
            if (d.onlineEnabled) {
                onBtn.textContent = '🌐 オンライン: ON';
                onBtn.className = 'btn-ui btn-emerald';
            } else {
                onBtn.textContent = '📴 オフライン';
                onBtn.className = 'btn-ui btn-slate';
            }
        }

        const passBtn = document.getElementById('title-btn-toggle-pass');
        const passWrap = document.getElementById('title-pass-input-wrap');
        const passInp = document.getElementById('title-input-room-pass');
        if (passBtn) {
            if (d.roomPassEnabled) {
                passBtn.textContent = '🔒 パスワード: ON';
                passBtn.className = 'btn-ui btn-amber';
                passWrap?.classList.remove('hidden');
            } else {
                passBtn.textContent = '🔓 パスワード: OFF';
                passBtn.className = 'btn-ui btn-slate';
                passWrap?.classList.add('hidden');
            }
        }
        if (passInp && document.activeElement !== passInp) {
            passInp.value = d.roomPassword || '';
        }
    }

    // -----------------------------------------------------------------
    // チャットシステム（🌍 全体チャット / 🏠 部屋･オフラインチャット）
    // -----------------------------------------------------------------
    addChatMessage(channel, senderKaomoji, senderName, text, isSystem = false) {
        const clean = String(text || '').trim().slice(0, 80);
        if (!clean) return;
        const list = channel === 'room' ? this.roomChatMessages : this.globalChatMessages;
        list.push({
            sender: senderKaomoji || '(´・ω・`)',
            name: senderName || '冒険者',
            text: clean,
            isSystem: !!isSystem
        });
        if (list.length > 40) list.shift();
        this.renderChatMessages();
    }

    renderChatMessages() {
        const box = document.getElementById('chat-messages');
        if (!box) return;
        const gBtn = document.getElementById('btn-chat-tab-global');
        const rBtn = document.getElementById('btn-chat-tab-room');
        gBtn?.classList.toggle('active', this.chatTab === 'global');
        rBtn?.classList.toggle('active', this.chatTab === 'room');

        const list = this.chatTab === 'room' ? this.roomChatMessages : this.globalChatMessages;
        box.innerHTML = list.map(m => {
            if (m.isSystem) {
                return `<div style="color:#94a3b8; font-size:10px;">${m.text}</div>`;
            }
            return `<div><span class="font-kaomoji" style="color:#38bdf8; font-weight:900;">${m.sender}</span> <span style="color:#fde047; font-weight:900;">${m.name}:</span> <span style="color:#f8fafc;">${m.text}</span></div>`;
        }).join('');
        box.scrollTop = box.scrollHeight;
    }

    sendChatMessage(rawText) {
        const msg = String(rawText || '').trim();
        if (!msg) return;
        sfx.init();
        sfx.playTone(680, 'sine', 0.06, 0.04);

        const myK = this.getBasePlayerKaomoji();
        const myName = `Lv.${this.saveData.lv}あなた`;

        if (this.chatTab === 'global') {
            this.addChatMessage('global', myK, myName, msg, false);
            if (this.fbConnected && this.broadcastFirebaseEvent) {
                this.broadcastFirebaseEvent('chat_global', {
                    kaomoji: myK,
                    name: `Lv.${this.saveData.lv}冒険者`,
                    text: msg
                });
            } else {
                this.addChatMessage('global', '', '', '※ 現在オフラインのため自分のみ表示（上のボタンでオンラインONにすると全員に届きます）', true);
            }
        } else {
            this.addChatMessage('room', myK, myName, msg, false);
            if (this.fbConnected && this.broadcastFirebaseEvent) {
                this.broadcastFirebaseEvent('chat_room', {
                    kaomoji: myK,
                    name: `Lv.${this.saveData.lv}仲間`,
                    text: msg,
                    roomKey: this.getCurrentRoomKey()
                });
            } else if (this.currentZoneId === 'town' && this.aiAllies.length > 0) {
                const ally = this.aiAllies[Math.floor(Math.random() * this.aiAllies.length)];
                const replies = ['いいねー！(≧▽≦)', '冒険がんばろうね！⚔️', '(=^・ω・^=) にゃん！', 'おっ、いい感じだね！✨'];
                setTimeout(() => {
                    this.addChatMessage('room', '(=^・ω・^=)', ally.name, replies[Math.floor(Math.random() * replies.length)], false);
                }, 500);
            }
        }

        if (this.player) {
            this.spawnEmoteBubble(this.player.pos.clone().add(new THREE.Vector3(0, 2.7, 0)), myK, msg.slice(0, 16));
        }
    },

    getCurrentRoomKey() {
        const d = this.saveData;
        if (!d.roomPassEnabled) return 'PUBLIC_OPEN_ROOM';
        return 'PASS_' + (d.roomPassword || '').trim();
    },

    // -----------------------------------------------------------------
    // プレイヤー見た目＆ステータス計算
    // -----------------------------------------------------------------
    getBasePlayerKaomoji() {
        const d = this.saveData;
        if (d.customKaomoji && d.customKaomoji.trim()) return d.customKaomoji.trim();
        const evo = EVOLUTIONS[d.evolutionId] || EVOLUTIONS.novice;
        return evo.kaomoji || '(´・ω・`)';
    },

    getPlayerBodyHexColor() {
        const d = this.saveData;
        if (d.bodyColor && /^#[0-9a-fA-F]{6}$/.test(d.bodyColor)) {
            return parseInt(d.bodyColor.slice(1), 16);
        }
        const evo = EVOLUTIONS[d.evolutionId] || EVOLUTIONS.novice;
        return evo.hexColor || 0x38bdf8;
    },

    getPlayerFaceBgHex() {
        return this.saveData.faceBgColor || '#073b66';
    },

    getPlayerBodyScale() {
        return Number(this.saveData.bodyScale) || 1.0;
    },

    getExpNeeded(lv) {
        return Math.round(90 + Math.pow(lv, 1.55) * 42);
    },

    getSkillUpgradeCost(curLv) {
        return 1 + Math.floor(curLv / 4);
    },

    calcDerivedStats() {
        const d = this.saveData;
        const s = d.stats || { str: 5, int: 5, vit: 5, agi: 5 };
        const wpn = WEAPONS[d.weaponId] || WEAPONS.wpn_wood;
        const arm = ARMORS[d.armorId] || ARMORS.arm_cloth;
        const acc = ACCESSORIES[d.accessoryId] || { atkPct: 0, hpPct: 0, crit: 0, cdRed: 0, rewardMult: 1 };
        const evo = EVOLUTIONS[d.evolutionId] || EVOLUTIONS.novice;
        const ttl = TITLES[d.equippedTitleId] || { atkPct: 0, hpPct: 0, crit: 0 };
        const tr = d.tree || {};

        const rebirthMult = 1 + (d.rebirthCount || 0) * 0.35;
        const wpnEnhMult = 1 + (d.weaponEnhance || 0) * 0.14;
        const armEnhMult = 1 + (d.armorEnhance || 0) * 0.14;

        const wEnch = ENCHANT_POOL.find(x => x.id === d.weaponEnchant) || {};
        const aEnch = ENCHANT_POOL.find(x => x.id === d.armorEnchant) || {};

        const treeAtkPct = (tr.atk_boost || 0) * 0.06;
        const treeHpPct = (tr.hp_boost || 0) * 0.07;
        const treeCrit = (tr.crit_boost || 0) * 0.03;
        const treeCd = (tr.cd_boost || 0) * 0.03;
        const treeBoss = (tr.boss_slayer || 0) * 0.08;
        const treeLifesteal = (tr.lifesteal || 0) * 0.015;
        const treeGoldExp = (tr.greed_wisdom || 0) * 0.08;
        const treeDoubleCast = (tr.twin_star || 0) * 0.05;
        const treeHpRegenBonus = (tr.vital_flow || 0) * 0.008;
        const treeMpRegenMult = 1 + (tr.mana_flow || 0) * 0.15;

        const warcryMult = (this.player && this.player.warcryTimer > 0) ? (this.player.warcryBonus || 1.0) : 1.0;
        const defBuffExtra = (this.player && this.player.defBuffTimer > 0) ? (this.player.defBuffBonus || 0) : 0;

        const baseAtk = (14 + s.str * 3.4 + (wpn.atk || 10) * wpnEnhMult) * rebirthMult;
        const totalAtkMult = 1 + (evo.atkBonus || 0) + (acc.atkPct || 0) + (ttl.atkPct || 0) + treeAtkPct + (wEnch.atkPct || 0) + (aEnch.atkPct || 0);
        const physAtk = Math.round(baseAtk * totalAtkMult * warcryMult);

        const baseHp = (110 + d.lv * 18 + s.vit * 24 + (arm.hp || 20) * armEnhMult) * rebirthMult;
        const totalHpMult = 1 + (evo.hpBonus || 0) + (acc.hpPct || 0) + (ttl.hpPct || 0) + treeHpPct + (wEnch.hpPct || 0) + (aEnch.hpPct || 0);
        const maxHp = Math.max(50, Math.round(baseHp * totalHpMult));

        const maxMp = Math.max(30, Math.round((50 + d.lv * 6 + s.int * 10 + (arm.mp || 10) * armEnhMult) * rebirthMult));
        const magMult = Number(((wpn.mag || 1.0) * (1 + s.int * 0.025 + (evo.magBonus || 0))).toFixed(2));

        const critChance = Math.min(0.85, 0.06 + s.agi * 0.004 + s.str * 0.002 + (acc.crit || 0) + (ttl.crit || 0) + treeCrit + (wEnch.crit || 0) + (aEnch.crit || 0));
        const critDmg = 1.65 + s.str * 0.012 + (wEnch.critDmg || 0);

        const rawMit = (arm.def || 0.05) * (1 + (arm.tierLook || 0) * 0.04) + s.vit * 0.002 + defBuffExtra + (aEnch.def || 0);
        const defMitigation = Math.min(0.82, rawMit);

        const cdReduction = Math.min(0.55, s.agi * 0.004 + (acc.cdRed || 0) + treeCd + (wEnch.cdRed || 0));
        const moveSpeed = Math.min(14.5, 7.6 + s.agi * 0.05);
        const lifesteal = Math.min(0.35, treeLifesteal + (wEnch.lifesteal || 0));
        const bossDmgMult = 1 + treeBoss + (wEnch.bossDmg || 0);
        const rewardMult = (acc.rewardMult || 1.0) + treeGoldExp;
        const doubleCast = Math.min(0.45, treeDoubleCast);

        return {
            maxHp,
            maxMp,
            physAtk,
            magMult,
            critChance,
            critDmg,
            defMitigation,
            cdReduction,
            moveSpeed,
            lifesteal,
            bossDmgMult,
            rewardMult,
            doubleCast,
            treeHpRegenBonus,
            treeMpRegenMult,
            rebirthMult,
            wpnGlowColor: wpn.glowColor || 0x38bdf8
        };
    }
}
