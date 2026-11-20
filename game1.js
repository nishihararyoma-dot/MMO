'use strict';

// =========================================================================
// 顔文字ファンタジー3D コアシステム・セーブ・タイトル・チャット基盤 (game1.js)
// =========================================================================

function isLightHexColor(hex) {
    if (!hex || typeof hex !== 'string') return false;
    const clean = hex.trim().replace('#', '');
    if (!/^[0-9a-fA-F]{6}$/.test(clean)) return false;
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.65;
}

window.__faceTexCache = window.__faceTexCache || new Map();
function getKaomojiFaceTexture(kaomoji, bgHex = '#073b66', textHex = '#ffffff', borderHex = '#38bdf8') {
    const safeBg = bgHex || '#073b66';
    const resolvedText = (isLightHexColor(safeBg) && (!textHex || isLightHexColor(textHex)))
        ? '#0f172a'
        : (textHex || '#ffffff');

    const key = `${kaomoji}|${safeBg}|${resolvedText}|${borderHex}`;
    if (window.__faceTexCache.has(key)) return window.__faceTexCache.get(key);

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 192;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = safeBg;
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
    ctx.fillStyle = resolvedText;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(txt, canvas.width / 2, canvas.height / 2 + 2);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    window.__faceTexCache.set(key, tex);
    return tex;
}

if (typeof sfx === 'undefined') {
    window.sfx = {
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
}

class KaomojiMMORPG {
    constructor() {
        this.saveKey = 'kaomoji_mmorpg_3d_save_v2';
        this.canvas = document.getElementById('game-canvas');
        this.overlayLayer = document.getElementById('overlay-layer');

        this.saveData = this.loadSaveData();

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

        this.joyVec = { x: 0, y: 0 };
        this.keys = {};
        this.camYaw = 0;
        this.camPitch = 0.52;
        this.camDist = 14.5;
        this.camShake = 0;

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

        try { this.refreshTitleScreen(); } catch (e) { console.error(e); }
        try { if (this.bindEvents) this.bindEvents(); } catch (e) { console.error(e); }

        try { if (this.initThree) this.initThree(); } catch (e) { console.error(e); }
        try { if (this.buildPlayerEntity) this.buildPlayerEntity(); } catch (e) { console.error(e); }
        try { if (this.buildPetEntity) this.buildPetEntity(); } catch (e) { console.error(e); }
        try { if (this.loadZone) this.loadZone('town'); } catch (e) { console.error(e); }
        try { if (this.buildEmotePalette) this.buildEmotePalette(); } catch (e) { console.error(e); }
        try { this.renderChatMessages(); } catch (e) { console.error(e); }
        try { if (this.refreshAllHUD) this.refreshAllHUD(); } catch (e) { console.error(e); }

        if (this.saveData.onlineEnabled && this.saveData.firebaseUrl && this.connectFirebase) {
            this.connectFirebase(this.saveData.firebaseUrl, true);
        }

        requestAnimationFrame((t) => {
            if (this.loop) this.loop(t);
        });
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
            skills: { slash_heavy: 1 },
            equippedSkills: ['slash_heavy', null, null, null, null],
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
                ancient_sap: 0,
                goblin_fang: 0,
                fire_core: 0,
                ice_crystal: 0,
                abyss_shard: 0,
                void_star: 0
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
            firebaseUrl: '',
            onlineEnabled: false,
            roomPassEnabled: false,
            roomPassword: '',
            cloudId: '',
            cloudPin: ''
        };
    }

    loadSaveData() {
        const def = this.createDefaultSave();
        const maxLv = (typeof MAX_PLAYER_LEVEL !== 'undefined') ? MAX_PLAYER_LEVEL : 999;
        try {
            const raw = localStorage.getItem(this.saveKey) || localStorage.getItem('kaomoji_mmorpg_3d_save_v1');
            if (!raw) return def;
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed.lv !== 'number') return def;

            const mergedSkills = { ...def.skills, ...(parsed.skills || {}) };
            if (mergedSkills.slash_arc && !mergedSkills.slash_heavy) {
                mergedSkills.slash_heavy = mergedSkills.slash_arc;
            }
            delete mergedSkills.slash_arc;

            const mergedEqSkills = Array.isArray(parsed.equippedSkills)
                ? parsed.equippedSkills.map(id => (id === 'slash_arc' ? 'slash_heavy' : id))
                : def.equippedSkills;

            const mergedMats = { ...def.materials, ...(parsed.materials || {}) };
            if (mergedMats.void_shard && !mergedMats.abyss_shard) {
                mergedMats.abyss_shard = mergedMats.void_shard;
            }
            if (mergedMats.star_fragment && !mergedMats.void_star) {
                mergedMats.void_star = mergedMats.star_fragment;
            }
            delete mergedMats.void_shard;
            delete mergedMats.star_fragment;

            const clampedLv = Math.max(1, Math.min(maxLv, Math.floor(parsed.lv || 1)));

            return {
                ...def,
                ...parsed,
                lv: clampedLv,
                isNewSave: false,
                stats: { ...def.stats, ...(parsed.stats || {}) },
                skills: mergedSkills,
                equippedSkills: mergedEqSkills,
                tree: { ...def.tree, ...(parsed.tree || {}) },
                materials: mergedMats,
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
                if (this.showAlertBanner) this.showAlertBanner('💾 セーブデータを保存しました！', 1500);
            }
        } catch (e) {}
    }

    hardResetGame() {
        const keepUrl = this.saveData.firebaseUrl || '';
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

        try { if (this.buildPlayerEntity) this.buildPlayerEntity(); } catch (e) {}
        try { if (this.buildPetEntity) this.buildPetEntity(); } catch (e) {}
        try { if (this.loadZone) this.loadZone('town'); } catch (e) {}
        this.refreshTitleScreen();
        if (this.refreshAllHUD) this.refreshAllHUD();
        this.showTitleScreen();
        sfx.playLevelUp();
        if (this.showAlertBanner) this.showAlertBanner('💥 セーブデータを完全に初期化しました！', 2200);
    }

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
        if (this.refreshAllHUD) this.refreshAllHUD();
        if (this.saveData.onlineEnabled) {
            if (this.saveData.firebaseUrl && this.connectFirebase) {
                this.connectFirebase(this.saveData.firebaseUrl, false);
            } else if (this.openGrowthModal) {
                this.openGrowthModal('online');
                if (this.showAlertBanner) this.showAlertBanner('🌐 オンラインを使うにはFirebase URLを設定してください', 2400);
            }
        }
    }

    refreshTitleScreen() {
        const d = this.saveData;
        const evoMap = (typeof EVOLUTIONS !== 'undefined' && EVOLUTIONS) ? EVOLUTIONS : { novice: { name: '見習い顔文字' } };
        const evo = evoMap[d.evolutionId] || evoMap.novice || { name: '見習い顔文字' };
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
                return `<div style="color:#cbd5e1; font-size:10px;">${m.text}</div>`;
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

        if (this.player && this.spawnEmoteBubble) {
            this.spawnEmoteBubble(this.player.pos.clone().add(new THREE.Vector3(0, 2.7, 0)), myK, msg.slice(0, 16));
        }
    }

    getCurrentRoomKey() {
        const d = this.saveData;
        if (!d.roomPassEnabled) return 'PUBLIC_OPEN_ROOM';
        return 'PASS_' + (d.roomPassword || '').trim();
    }

    getBasePlayerKaomoji() {
        const d = this.saveData;
        if (d.customKaomoji && d.customKaomoji.trim()) return d.customKaomoji.trim();
        const evoMap = (typeof EVOLUTIONS !== 'undefined' && EVOLUTIONS) ? EVOLUTIONS : { novice: { kaomoji: '(´・ω・`)' } };
        const evo = evoMap[d.evolutionId] || evoMap.novice || { kaomoji: '(´・ω・`)' };
        return evo.kaomoji || '(´・ω・`)';
    }

    getPlayerBodyHexColor() {
        const d = this.saveData;
        if (d.bodyColor && /^#[0-9a-fA-F]{6}$/.test(d.bodyColor)) {
            return parseInt(d.bodyColor.slice(1), 16);
        }
        const evoMap = (typeof EVOLUTIONS !== 'undefined' && EVOLUTIONS) ? EVOLUTIONS : { novice: { hexColor: 0x38bdf8 } };
        const evo = evoMap[d.evolutionId] || evoMap.novice || { hexColor: 0x38bdf8 };
        return evo.hexColor || 0x38bdf8;
    }

    getPlayerFaceBgHex() {
        return this.saveData.faceBgColor || '#073b66';
    }

    getPlayerBodyScale() {
        return Number(this.saveData.bodyScale) || 1.0;
    }

    getExpNeeded(lv) {
        return Math.round(90 + Math.pow(lv, 1.55) * 42);
    }

    getSkillUpgradeCost(curLv) {
        return 1 + Math.floor(curLv / 4);
    }

    calcDerivedStats() {
        const d = this.saveData;
        const rawS = d.stats || { str: 5, int: 5, vit: 5, agi: 5 };
        const tr = d.tree || {};
        const warlordMult = 1 + (tr.t_warlord || 0) * 0.05;
        const s = {
            str: rawS.str * warlordMult,
            int: rawS.int * warlordMult,
            vit: rawS.vit * warlordMult,
            agi: rawS.agi * warlordMult
        };

        const wpn = WEAPONS[d.weaponId] || WEAPONS.wpn_wood;
        const arm = ARMORS[d.armorId] || ARMORS.arm_cloth;
        const acc = ACCESSORIES[d.accessoryId] || ACCESSORIES.acc_none || {};
        const evo = EVOLUTIONS[d.evolutionId] || EVOLUTIONS.novice;
        const ttl = TITLES[d.equippedTitleId] || TITLES.title_none || {};

        const rebirthMult = 1 + (d.rebirthCount || 0) * 0.35;
        const wpnEnhMult = 1 + (d.weaponEnhance || 0) * 0.14;
        const armEnhMult = 1 + (d.armorEnhance || 0) * 0.14;

        const wEnch = ENCHANT_POOL.find(x => x.id === d.weaponEnchant);
        const aEnch = ENCHANT_POOL.find(x => x.id === d.armorEnchant);
        const getEnchVal = (statName) =>
            (wEnch && wEnch.stat === statName ? wEnch.val : 0) +
            (aEnch && aEnch.stat === statName ? aEnch.val : 0);

        const treeAtkPct = (tr.t_might || 0) * 0.06;
        const treeSkillPowerMult = 1 + (tr.t_arcana || 0) * 0.08;
        const treeHpPct = (tr.t_vital || 0) * 0.08;
        const treeHpRegenBonus = (tr.t_vital || 0) * 0.008;
        const treeCrit = (tr.t_crit || 0) * 0.05;
        const treeCritDmg = (tr.t_crit || 0) * 0.12;
        const treeCd = (tr.t_chant || 0) * 0.05 + (tr.t_warlord || 0) * 0.03;
        const treeMpRegenMult = (1 + (tr.t_chant || 0) * 0.10) * (d.accessoryId === 'acc_chrono_orb' ? 1.5 : 1.0);
        const treeDef = (tr.t_aegis || 0) * 0.03;
        const treeHealPowerMult = 1 + (tr.t_aegis || 0) * 0.08;
        const treeGoldExp = (tr.t_fortune || 0) * 0.10;

        const warcryMult = (this.player && this.player.warcryTimer > 0) ? (this.player.warcryBonus || 1.0) : 1.0;
        const defBuffExtra = (this.player && this.player.defBuffTimer > 0) ? (this.player.defBuffBonus || 0) : 0;

        const baseAtk = (14 + s.str * 3.4 + (wpn.atk || 12) * wpnEnhMult) * rebirthMult * (evo.atkMult || 1.0);
        const totalAtkMult = 1 + (acc.atkBonus || 0) + (ttl.atk || 0) + treeAtkPct + getEnchVal('atkBonus');
        const physAtk = Math.round(baseAtk * totalAtkMult * warcryMult);

        const baseHp = (110 + d.lv * 18 + s.vit * 24 + (arm.hp || 40) * armEnhMult) * rebirthMult * (evo.hpMult || 1.0);
        const totalHpMult = 1 + (acc.hpBonus || 0) + (ttl.hp || 0) + treeHpPct + getEnchVal('hpBonus');
        const maxHp = Math.max(50, Math.round(baseHp * totalHpMult));

        const maxMp = Math.max(30, Math.round((50 + d.lv * 6 + s.int * 10 + (arm.mp || 20) * armEnhMult) * rebirthMult * (evo.mpMult || 1.0)));
        const magMult = Number(((wpn.mag || 1.0) * (1 + s.int * 0.025) * treeSkillPowerMult).toFixed(2));

        const critChance = Math.min(0.85, 0.06 + s.agi * 0.004 + s.str * 0.002 + (evo.exCritBonus || 0) + (ttl.crit || 0) + treeCrit + getEnchVal('critBonus'));
        const critDmg = 1.65 + s.str * 0.012 + treeCritDmg + getEnchVal('critDmg');

        const rawMit = (arm.def || 0.04) * (1 + (arm.tierLook || 0) * 0.04) + s.vit * 0.002 + (evo.exDefBonus || 0) + defBuffExtra + treeDef;
        const defMitigation = Math.min(0.82, rawMit);

        const cdReduction = Math.min(0.60, s.agi * 0.004 + (evo.exCdBonus || 0) + (acc.cdBonus || 0) + treeCd + getEnchVal('cdBonus'));
        const moveSpeed = Math.min(15.5, (7.6 + s.agi * 0.05) * (evo.spdMult || 1.0));
        const lifesteal = Math.min(0.35, (acc.lifesteal || 0) + getEnchVal('lifesteal'));
        const bossDmgMult = 1 + (acc.bossDmg || 0) + getEnchVal('bossDmg');
        const rewardMult = 1 + (acc.rewardBonus || 0) + (ttl.reward || 0) + treeGoldExp + getEnchVal('rewardBonus');
        const doubleCast = Math.min(0.45, acc.doubleCast || 0);

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
            treeSkillPowerMult,
            treeHealPowerMult,
            treeHpRegenBonus,
            treeMpRegenMult,
            rebirthMult,
            wpnGlowColor: wpn.glowColor || 0x38bdf8
        };
    }
}
