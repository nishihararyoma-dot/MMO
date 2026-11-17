'use strict';

const MQTT_CDNS = [
    'https://unpkg.com/mqtt@4.3.7/dist/mqtt.min.js',
    'https://cdn.jsdelivr.net/npm/mqtt@4.3.7/dist/mqtt.min.js'
];
const MQTT_SERVERS = [
    { name: 'EMQX', url: 'wss://broker.emqx.io:8084/mqtt' },
    { name: 'Eclipse443', url: 'wss://mqtt.eclipseprojects.io:443/mqtt' },
    { name: 'HiveMQ', url: 'wss://broker.hivemq.com:8884/mqtt' }
];
const TOPIC_GLOBAL = 'kaomoji_fantasy_3d/v7/global';

Object.assign(KaomojiMMORPG.prototype, {

    getRoomTopic() {
        const d = this.saveData;
        if (!d.roomPassEnabled) return 'kaomoji_fantasy_3d/v7/room/PUBLIC';
        const p = String(d.roomPassword || '').trim();
        let hex = '';
        for (let i = 0; i < p.length; i++) hex += p.charCodeAt(i).toString(16);
        return 'kaomoji_fantasy_3d/v7/room/PASS_' + (hex || 'EMPTY');
    },

    loadMqttLib(cb) {
        if (window.mqtt) return cb(true);
        const step = (i) => {
            if (window.mqtt) return cb(true);
            if (i >= MQTT_CDNS.length) return cb(false);
            const s = document.createElement('script');
            s.src = MQTT_CDNS[i];
            s.onload = () => cb(!!window.mqtt);
            s.onerror = () => { s.remove(); step(i + 1); };
            document.head.appendChild(s);
        };
        step(0);
    },

    toggleOnlineMode() {
        sfx.init();
        const d = this.saveData;
        if (this.fbConnected || d.onlineEnabled) {
            d.onlineEnabled = false;
            this.disconnectFirebase();
        } else {
            d.onlineEnabled = true;
            this.saveGame(false);
            this.connectMqttStart(false);
        }
        this.refreshTitleScreen();
        this.refreshAllHUD();
    },

    connectFirebase(url, silent = false) {
        this.connectMqttStart(silent);
    },

    connectMqttStart(silent = false) {
        this.stopMqtt(false);
        this.saveData.onlineEnabled = true;
        this.fbConnected = false;
        this.netStatusLabel = '⏳ 接続中...';
        this.netTxCount = 0;
        this.netRxCount = 0;
        this.netBrokerName = '接続試行中';
        this.refreshTitleScreen();
        this.refreshAllHUD();

        this.loadMqttLib((ok) => {
            if (!this.saveData.onlineEnabled) return;
            if (!ok) {
                this.netStatusLabel = '⚠️ 通信読込失敗';
                this.netBrokerName = 'ライブラリ読込エラー';
                this.refreshAllHUD();
                return;
            }
            const rTopic = this.getRoomTopic();
            this.curRoomTopic = rTopic;
            const uid = this.saveData.playerUid;
            this._pool = [];

            MQTT_SERVERS.forEach((sv, idx) => {
                try {
                    const c = window.mqtt.connect(sv.url, {
                        clientId: 'kmj_' + uid + '_' + idx + '_' + Math.random().toString(36).slice(2, 6),
                        clean: true,
                        keepalive: 20,
                        connectTimeout: 5000,
                        reconnectPeriod: 3000,
                        will: { topic: rTopic, payload: JSON.stringify({ type: 'leave', uid }), qos: 0 }
                    });
                    this._pool.push(c);

                    c.on('connect', () => {
                        if (!this.saveData.onlineEnabled || (this.mqttClient && this.mqttClient !== c)) {
                            try { c.end(true); } catch (e) {}
                            return;
                        }
                        this._pool.forEach(o => { if (o !== c) try { o.end(true); } catch (e) {} });
                        this._pool = [c];
                        this.mqttClient = c;
                        this.fbConnected = true;
                        this.netStatusLabel = '';
                        this.netBrokerName = 'MQTT (' + sv.name + ')';

                        c.subscribe([TOPIC_GLOBAL, rTopic], { qos: 0 }, () => {
                            this.syncFirebaseNow(true);
                            setTimeout(() => { if (this.fbConnected) this.syncFirebaseNow(true); }, 600);
                        });

                        this.refreshTitleScreen();
                        this.refreshAllHUD();
                        if (this.isModalOpen && this.activeTab === 'online') this.renderModalContent();
                        if (!silent) {
                            sfx.playHeal();
                            this.showAlertBanner(`🌐 オンライン接続完了！（${sv.name}）`, 2200);
                        }
                    });

                    c.on('message', (topic, buf) => {
                        if (this.mqttClient !== c) return;
                        try {
                            const msg = JSON.parse(buf.toString());
                            this.onMqttPacket(topic, msg);
                        } catch (e) {}
                    });
                } catch (e) {}
            });
        });
    },

    reconnectMqttRoom() {
        if (!this.saveData.onlineEnabled) return;
        this.clearRemotePlayers();
        this.connectMqttStart(true);
    },

    stopMqtt(sendLeave = true) {
        if (sendLeave && this.mqttClient && this.mqttClient.connected && this.curRoomTopic) {
            try { this.mqttClient.publish(this.curRoomTopic, JSON.stringify({ type: 'leave', uid: this.saveData.playerUid })); } catch (e) {}
        }
        if (this._pool) {
            this._pool.forEach(c => { try { c.end(true); } catch (e) {} });
            this._pool = [];
        }
        this.mqttClient = null;
    },

    clearRemotePlayers() {
        this.remotePlayers.forEach(rp => {
            if (rp.group && this.scene) this.scene.remove(rp.group);
            if (rp.plateEl) rp.plateEl.remove();
        });
        this.remotePlayers.clear();
    },

    disconnectFirebase() {
        this.stopMqtt(true);
        this.fbConnected = false;
        this.netStatusLabel = '';
        this.saveData.onlineEnabled = false;
        this.clearRemotePlayers();
        this.saveGame(false);
        this.refreshTitleScreen();
        this.refreshAllHUD();
        this.showAlertBanner('📴 オフラインモードに切り替えました', 1500);
    },

    syncFirebaseNow(isHello = false) {
        if (!this.fbConnected || !this.mqttClient || !this.mqttClient.connected) return;
        const rTopic = this.getRoomTopic();
        if (this.curRoomTopic && this.curRoomTopic !== rTopic) {
            this.reconnectMqttRoom();
            return;
        }
        const d = this.saveData;
        const payload = {
            type: isHello ? 'hello' : 'sync',
            uid: d.playerUid,
            roomKey: this.getCurrentRoomKey(),
            lv: d.lv || 1,
            kaomoji: this.getBasePlayerKaomoji(),
            bodyColor: d.bodyColor || '',
            faceBgColor: this.getPlayerFaceBgHex(),
            bodyScale: this.getPlayerBodyScale(),
            evolutionId: d.evolutionId || 'novice',
            cosmeticId: d.cosmeticId || 'none',
            backCosmeticId: d.backCosmeticId || 'back_none',
            weaponId: d.weaponId || 'wpn_wood',
            weaponEnhance: d.weaponEnhance || 0,
            armorId: d.armorId || 'arm_cloth',
            zoneId: this.towerState.active ? 'tower' : this.currentZoneId,
            threatRank: d.threatRank || 0,
            x: this.player ? Number(this.player.pos.x.toFixed(2)) : 0,
            z: this.player ? Number(this.player.pos.z.toFixed(2)) : 5,
            rotY: this.player ? Number(this.player.rotY.toFixed(2)) : 0,
            ts: Date.now()
        };
        try {
            this.mqttClient.publish(rTopic, JSON.stringify(payload), { qos: 0 });
            this.netTxCount = (this.netTxCount || 0) + 1;
        } catch (e) {}
    },

    broadcastFirebaseEvent(type, payload) {
        if (!this.fbConnected || !this.mqttClient || !this.mqttClient.connected) return;
        const topic = (type === 'chat_global') ? TOPIC_GLOBAL : this.getRoomTopic();
        const packet = { type, senderUid: this.saveData.playerUid, roomKey: this.getCurrentRoomKey(), payload, ts: Date.now() };
        try {
            this.mqttClient.publish(topic, JSON.stringify(packet), { qos: 0 });
            this.netTxCount = (this.netTxCount || 0) + 1;
        } catch (e) {}
    },

    updateFirebaseSync(dt) {
        if (!this.fbConnected) return;
        const moving = Math.hypot(this.joyVec.x, this.joyVec.y) > 0.08 ||
            this.keys['KeyW'] || this.keys['KeyA'] || this.keys['KeyS'] || this.keys['KeyD'] ||
            this.keys['ArrowUp'] || this.keys['ArrowDown'] || this.keys['ArrowLeft'] || this.keys['ArrowRight'];
        this.fbSyncTimer += dt;
        if (this.fbSyncTimer >= (moving ? 0.25 : 2.0)) {
            this.fbSyncTimer = 0;
            this.syncFirebaseNow(false);
        }
        this.fbPollTimer += dt;
        if (this.fbPollTimer >= 3.5) {
            this.fbPollTimer = 0;
            const now = Date.now();
            let changed = false;
            for (const [uid, rp] of this.remotePlayers.entries()) {
                if (now - (rp.lastSeenTs || 0) > 12000) {
                    if (rp.group && this.scene) this.scene.remove(rp.group);
                    if (rp.plateEl) rp.plateEl.remove();
                    this.remotePlayers.delete(uid);
                    changed = true;
                }
            }
            if (changed) {
                this.refreshAllHUD();
                if (this.isModalOpen && this.activeTab === 'online') this.renderModalContent();
            }
        }
    },

    onMqttPacket(topic, msg) {
        if (!msg || typeof msg !== 'object') return;
        const myUid = this.saveData.playerUid;
        const senderUid = msg.uid || msg.senderUid;
        if (!senderUid || senderUid === myUid) return;
        this.netRxCount = (this.netRxCount || 0) + 1;

        if (topic === TOPIC_GLOBAL || msg.type === 'chat_global') {
            if (msg.payload) this.addChatMessage('global', msg.payload.kaomoji, msg.payload.name, msg.payload.text, false);
            return;
        }
        if ((msg.roomKey || 'PUBLIC_OPEN_ROOM') !== this.getCurrentRoomKey()) return;

        if (msg.type === 'sync' || msg.type === 'hello') {
            const isNew = !this.remotePlayers.has(msg.uid);
            this.upsertRemotePlayer(msg);
            if (isNew || msg.type === 'hello') {
                this.syncFirebaseNow(false);
                if (isNew) {
                    const zName = (typeof ZONES !== 'undefined' && ZONES[msg.zoneId]) ? ZONES[msg.zoneId].name : '試練の塔';
                    this.showAlertBanner(`👋 ${msg.kaomoji || '(´・ω・`)'} Lv.${msg.lv || 1} が合流！（${zName}）`, 2400);
                    this.refreshAllHUD();
                    if (this.isModalOpen && this.activeTab === 'online') this.renderModalContent();
                }
            }
        } else if (msg.type === 'leave') {
            const rp = this.remotePlayers.get(msg.uid);
            if (rp) {
                if (rp.group && this.scene) this.scene.remove(rp.group);
                if (rp.plateEl) rp.plateEl.remove();
                this.remotePlayers.delete(msg.uid);
                this.refreshAllHUD();
                if (this.isModalOpen && this.activeTab === 'online') this.renderModalContent();
            }
        } else if (msg.type === 'chat_room' && msg.payload) {
            this.addChatMessage('room', msg.payload.kaomoji, msg.payload.name, msg.payload.text, false);
        } else if (msg.type === 'kill' && msg.payload && this.receiveCoopReward) {
            this.receiveCoopReward(msg.payload);
        } else if (msg.type === 'emote' && msg.payload) {
            const rp = this.remotePlayers.get(senderUid);
            if (rp && rp.visible && this.spawnEmoteBubble) {
                this.spawnEmoteBubble(rp.pos.clone().add(new THREE.Vector3(0, 2.7, 0)), msg.payload.kaomoji || '(≧▽≦)', msg.payload.msg || 'やっほー！');
            }
        }
    },

    upsertRemotePlayer(p) {
        const bScale = Number(p.bodyScale) || 1.0;
        const fBg = p.faceBgColor || '#073b66';
        const bCos = p.backCosmeticId || 'back_none';
        const sig = `${p.kaomoji}|${p.bodyColor}|${fBg}|${bScale}|${p.evolutionId}|${p.cosmeticId}|${bCos}|${p.weaponId}|${p.armorId}`;
        let rp = this.remotePlayers.get(p.uid);
        const evo = (typeof EVOLUTIONS !== 'undefined' && EVOLUTIONS[p.evolutionId]) || (typeof EVOLUTIONS !== 'undefined' && EVOLUTIONS.novice) || { hexColor: 0x38bdf8 };
        const bodyHex = (p.bodyColor && /^#[0-9a-fA-F]{6}$/.test(p.bodyColor)) ? parseInt(p.bodyColor.slice(1), 16) : (evo.hexColor || 0x38bdf8);

        if (!rp || rp.appearanceSig !== sig) {
            if (rp && rp.group && this.scene) this.scene.remove(rp.group);
            if (rp && rp.plateEl) rp.plateEl.remove();
            const parts = this.buildAvatarGroup({
                kaomoji: p.kaomoji || '(´・ω・`)', bodyHex, faceBgHex: fBg, bodyScale: bScale,
                weaponId: p.weaponId || 'wpn_wood', weaponEnhance: p.weaponEnhance || 0,
                armorId: p.armorId || 'arm_cloth', cosmeticId: p.cosmeticId || 'none', backCosmeticId: bCos
            });
            const pos = new THREE.Vector3(p.x || 0, 0, p.z || 5);
            if (this.useWebGL && this.scene && parts.group) {
                parts.group.position.copy(pos);
                parts.group.rotation.y = p.rotY || 0;
                this.scene.add(parts.group);
            }
            const plate = document.createElement('div');
            plate.className = 'world-plate';
            plate.innerHTML = `<div style="font-size:9px;font-weight:900;color:#f9a8d4;">Lv.${p.lv || 1} 仲間 (脅威+${p.threatRank || 0})</div>`;
            this.overlayLayer?.appendChild(plate);
            rp = {
                uid: p.uid, appearanceSig: sig, bodyScale: bScale, pos, targetPos: pos.clone(),
                rotY: p.rotY || 0, targetRotY: p.rotY || 0, lv: p.lv || 1, kaomoji: p.kaomoji || '(´・ω・`)',
                zoneId: p.zoneId || 'town', threatRank: p.threatRank || 0, lastSeenTs: Date.now(),
                visible: true, headPlateEl: plate, plateEl: plate, ...parts
            };
            this.remotePlayers.set(p.uid, rp);
        } else {
            rp.targetPos.set(p.x || 0, 0, p.z || 5);
            rp.targetRotY = p.rotY || 0;
            rp.lv = p.lv || 1;
            rp.zoneId = p.zoneId || 'town';
            rp.threatRank = p.threatRank || 0;
            rp.lastSeenTs = Date.now();
            if (rp.plateEl) rp.plateEl.innerHTML = `<div style="font-size:9px;font-weight:900;color:#f9a8d4;">Lv.${rp.lv} 仲間 (脅威+${rp.threatRank})</div>`;
        }
    },

    updateRemotePlayers(dt) {
        const myZone = this.towerState.active ? 'tower' : this.currentZoneId;
        this.remotePlayers.forEach(rp => {
            const same = (rp.zoneId === myZone && myZone !== 'tower');
            rp.visible = same;
            if (rp.group) rp.group.visible = same;
            rp.pos.lerp(rp.targetPos, Math.min(1, dt * 10));
            rp.rotY += (rp.targetRotY - rp.rotY) * Math.min(1, dt * 10);
            if (rp.group) { rp.group.position.copy(rp.pos); rp.group.rotation.y = rp.rotY; }
        });
    },

    getSameZoneRemoteCount() {
        if (this.towerState.active) return 0;
        let n = 0;
        this.remotePlayers.forEach(rp => { if (rp.zoneId === this.currentZoneId) n++; });
        return n;
    },

    bindEvents() {
        const on = (id, ev, fn, opt) => document.getElementById(id)?.addEventListener(ev, fn, opt);
        on('title-btn-toggle-online', 'click', () => this.toggleOnlineMode());
        on('title-btn-toggle-pass', 'click', () => {
            sfx.init();
            this.saveData.roomPassEnabled = !this.saveData.roomPassEnabled;
            this.saveGame(false);
            if (this.saveData.onlineEnabled) this.reconnectMqttRoom();
            this.refreshTitleScreen(); this.refreshAllHUD();
        });
        on('title-input-room-pass', 'input', (e) => {
            this.saveData.roomPassword = e.target.value.trim();
            this.saveGame(false);
            if (this.saveData.onlineEnabled) this.reconnectMqttRoom();
        });
        on('btn-title-start', 'click', () => this.enterGameFromTitle());
        on('btn-title-cloud', 'click', () => {
            sfx.init(); this.inTitleScreen = false;
            document.getElementById('title-screen')?.classList.add('hidden');
            this.openGrowthModal('online');
        });
        on('btn-title-hard-reset', 'click', () => {
            sfx.init();
            this.openDialog('💥 完全初期化', 'すべてのデータを消去して最初から始めますか？', [
                { text: 'キャンセル', primary: false },
                { text: '💥 初期化する', primary: true, onClick: () => this.hardResetGame() }
            ]);
        });
        on('btn-hud-online-toggle', 'click', (e) => { e.stopPropagation(); this.toggleOnlineMode(); });
        on('btn-hud-room-lock', 'click', (e) => { e.stopPropagation(); sfx.init(); this.openGrowthModal('online'); });
        on('btn-open-travel', 'click', (e) => { e.stopPropagation(); sfx.init(); this.openGrowthModal('travel'); });
        on('btn-open-growth', 'click', (e) => { e.stopPropagation(); sfx.init(); this.openGrowthModal('stats'); });
        on('btn-close-modal', 'click', () => this.closeGrowthModal());
        on('growth-modal', 'click', (e) => { if (e.target.id === 'growth-modal') this.closeGrowthModal(); });
        on('btn-toggle-drawer', 'click', (e) => {
            e.stopPropagation(); sfx.init();
            document.getElementById('hud-drawer-menu')?.classList.toggle('hidden');
            document.getElementById('emote-palette')?.classList.add('hidden');
        });
        on('btn-toggle-emote', 'click', (e) => {
            e.stopPropagation(); sfx.init();
            document.getElementById('emote-palette')?.classList.toggle('hidden');
            document.getElementById('hud-drawer-menu')?.classList.add('hidden');
        });
        on('btn-exec-warp', 'click', (e) => {
            e.stopPropagation(); sfx.init(); sfx.playSkill();
            if (this.currentZoneId === 'town') this.openGrowthModal('travel');
            else { this.loadZone('town'); this.showAlertBanner('🏠 始まりの顔文字広場へ帰還！', 1600); }
        });
        on('btn-toggle-autohunt', 'click', (e) => {
            e.stopPropagation(); sfx.init(); this.autoHunt = !this.autoHunt;
            e.currentTarget.textContent = this.autoHunt ? '🤖 AUTO:ON' : '🤖 AUTO:OFF';
            e.currentTarget.style.background = this.autoHunt ? '#059669' : '';
            this.showAlertBanner(this.autoHunt ? '🤖 オート狩り ON' : '🤖 オート狩り OFF', 1400);
        });
        const adjThreat = (dlt) => {
            sfx.init();
            const maxT = (typeof MAX_THREAT_RANK !== 'undefined') ? MAX_THREAT_RANK : 99;
            this.saveData.threatRank = Math.max(0, Math.min(maxT, (this.saveData.threatRank || 0) + dlt));
            this.saveGame(false);
            if (!this.towerState.active) this.loadZone(this.currentZoneId); else this.refreshAllHUD();
            this.showAlertBanner(`🔥 脅威度ランク: +${this.saveData.threatRank}`, 1300);
        };
        on('btn-threat-down', 'click', (e) => { e.stopPropagation(); adjThreat(-1); });
        on('btn-threat-up', 'click', (e) => { e.stopPropagation(); adjThreat(1); });
        on('btn-open-cloud', 'click', (e) => { e.stopPropagation(); sfx.init(); this.openGrowthModal('online'); });
        on('btn-manual-save', 'click', (e) => { e.stopPropagation(); this.saveGame(true); document.getElementById('hud-drawer-menu')?.classList.add('hidden'); });
        on('btn-toggle-bgm', 'click', (e) => { e.stopPropagation(); sfx.init(); sfx.bgmMuted = !sfx.bgmMuted; e.currentTarget.textContent = sfx.bgmMuted ? '🔇 BGM:OFF' : '🔊 BGM:ON'; });
        on('btn-back-title', 'click', (e) => { e.stopPropagation(); sfx.init(); document.getElementById('hud-drawer-menu')?.classList.add('hidden'); this.saveGame(false); this.showTitleScreen(); });
        on('btn-reset-save', 'click', (e) => {
            e.stopPropagation(); sfx.init(); document.getElementById('hud-drawer-menu')?.classList.add('hidden');
            this.openDialog('💥 完全初期化', '本当にすべてのデータを削除してやり直しますか？', [
                { text: 'キャンセル', primary: false },
                { text: '💥 初期化する', primary: true, onClick: () => this.hardResetGame() }
            ]);
        });
        on('btn-toggle-chat', 'click', (e) => {
            e.stopPropagation(); sfx.init(); this.chatCollapsed = !this.chatCollapsed;
            document.getElementById('chat-panel')?.classList.toggle('hidden', this.chatCollapsed);
        });
        on('btn-chat-tab-global', 'click', (e) => { e.stopPropagation(); this.chatTab = 'global'; this.renderChatMessages(); });
        on('btn-chat-tab-room', 'click', (e) => { e.stopPropagation(); this.chatTab = 'room'; this.renderChatMessages(); });
        document.querySelectorAll('.chat-quick-chip').forEach(b => b.addEventListener('click', (e) => { e.stopPropagation(); this.sendChatMessage(b.dataset.msg || b.textContent); }));
        const chatInp = document.getElementById('input-chat-msg');
        on('btn-send-chat', 'click', (e) => { e.stopPropagation(); if (chatInp) { this.sendChatMessage(chatInp.value); chatInp.value = ''; } });
        chatInp?.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); this.sendChatMessage(chatInp.value); chatInp.value = ''; } });

        const atkBtn = document.getElementById('btn-basic-attack');
        if (atkBtn) {
            let lastT = 0;
            const doAtk = (e) => {
                if (e) { e.preventDefault(); e.stopPropagation(); }
                const now = performance.now(); if (now - lastT < 110) return; lastT = now;
                if (this.performBasicAttack) this.performBasicAttack();
            };
            atkBtn.addEventListener('touchstart', doAtk, { passive: false });
            atkBtn.addEventListener('mousedown', doAtk);
        }
        on('btn-cycle-target', 'click', (e) => { e.stopPropagation(); sfx.init(); if (this.cycleTarget) this.cycleTarget(); });

        this.canvas?.addEventListener('click', (e) => {
            sfx.init();
            document.getElementById('hud-drawer-menu')?.classList.add('hidden');
            document.getElementById('emote-palette')?.classList.add('hidden');
            if (!this.useWebGL || !this.camera || !this.monsters.length) return;
            const rect = this.canvas.getBoundingClientRect();
            const cx = e.clientX - rect.left, cy = e.clientY - rect.top;
            let best = null, bd = 52;
            this.monsters.forEach(m => {
                if (m.dead) return;
                const sc = this.projectToScreen(new THREE.Vector3(m.pos.x, (m.scale || 1) * 1.1, m.pos.z));
                if (!sc) return;
                const d = Math.hypot(sc.x - cx, sc.y - cy);
                if (d < bd) { bd = d; best = m; }
            });
            if (best) { this.selectedTarget = best; sfx.playTone(620, 'sine', 0.08, 0.06); }
        });

        window.addEventListener('keydown', (e) => {
            const tag = (document.activeElement && document.activeElement.tagName) || '';
            if (tag === 'INPUT' || tag === 'TEXTAREA') return;
            this.keys[e.code] = true;
            if (this.inTitleScreen) return;
            if (this.isModalOpen) { if (e.code === 'Escape') this.closeGrowthModal(); return; }
            if (e.code === 'Space') { e.preventDefault(); if (this.performBasicAttack) this.performBasicAttack(); }
            if (e.code === 'Digit1' && this.useSkillSlot) this.useSkillSlot(0);
            if (e.code === 'Digit2' && this.useSkillSlot) this.useSkillSlot(1);
            if (e.code === 'Digit3' && this.useSkillSlot) this.useSkillSlot(2);
            if (e.code === 'Digit4' && this.useSkillSlot) this.useSkillSlot(3);
            if (e.code === 'Digit5' && this.useSkillSlot) this.useSkillSlot(4);
            if (e.code === 'Tab') { e.preventDefault(); if (this.cycleTarget) this.cycleTarget(); }
        });
        window.addEventListener('keyup', (e) => { this.keys[e.code] = false; });

        // 左手ジョイスティック
        const jz = document.getElementById('joystick-zone'), jk = document.getElementById('joystick-knob');
        if (jz && jk) {
            let act = false, tid = null;
            const upd = (x, y) => {
                const r = jz.getBoundingClientRect();
                let dx = x - (r.left + r.width / 2), dy = y - (r.top + r.height / 2);
                const d = Math.hypot(dx, dy);
                if (d > 38) { dx = (dx / d) * 38; dy = (dy / d) * 38; }
                jk.style.transform = `translate(${dx}px,${dy}px)`;
                this.joyVec.x = dx / 38; this.joyVec.y = dy / 38;
            };
            const rst = () => { act = false; tid = null; jk.style.transform = 'translate(0,0)'; this.joyVec.x = 0; this.joyVec.y = 0; };
            jz.addEventListener('touchstart', (e) => { e.preventDefault(); e.stopPropagation(); sfx.init(); const t = e.changedTouches[0]; act = true; tid = t.identifier; upd(t.clientX, t.clientY); }, { passive: false });
            window.addEventListener('touchmove', (e) => { if (!act) return; for (let t of e.changedTouches) if (t.identifier === tid) { upd(t.clientX, t.clientY); break; } }, { passive: true });
            window.addEventListener('touchend', (e) => { if (!act) return; for (let t of e.changedTouches) if (t.identifier === tid) { rst(); break; } });
            window.addEventListener('touchcancel', (e) => { if (!act) return; for (let t of e.changedTouches) if (t.identifier === tid) { rst(); break; } });
            jz.addEventListener('mousedown', (e) => { e.preventDefault(); sfx.init(); act = true; upd(e.clientX, e.clientY); });
            window.addEventListener('mousemove', (e) => { if (act) upd(e.clientX, e.clientY); });
            window.addEventListener('mouseup', () => { if (act) rst(); });
        }

        // 右手3Dカメラ回転
        if (this.canvas) {
            let drag = false, ctid = null, lx = 0, ly = 0, pd = 0;
            this.canvas.addEventListener('mousedown', (e) => { drag = true; lx = e.clientX; ly = e.clientY; });
            window.addEventListener('mousemove', (e) => {
                if (!drag) return;
                this.camYaw -= (e.clientX - lx) * 0.007;
                this.camPitch = Math.max(0.18, Math.min(1.15, this.camPitch + (e.clientY - ly) * 0.006));
                lx = e.clientX; ly = e.clientY;
            });
            window.addEventListener('mouseup', () => { drag = false; });
            this.canvas.addEventListener('wheel', (e) => { e.preventDefault(); this.camDist = Math.max(7.5, Math.min(26, this.camDist + e.deltaY * 0.01)); }, { passive: false });
            this.canvas.addEventListener('touchstart', (e) => {
                sfx.init();
                if (e.targetTouches.length === 1) { const t = e.targetTouches[0]; drag = true; ctid = t.identifier; lx = t.clientX; ly = t.clientY; pd = 0; }
                else if (e.targetTouches.length >= 2) { drag = false; ctid = null; pd = Math.hypot(e.targetTouches[0].clientX - e.targetTouches[1].clientX, e.targetTouches[0].clientY - e.targetTouches[1].clientY); }
            }, { passive: true });
            this.canvas.addEventListener('touchmove', (e) => {
                if (e.targetTouches.length === 1 && drag) {
                    let t = [...e.targetTouches].find(x => x.identifier === ctid) || e.targetTouches[0];
                    if (t.identifier !== ctid) { ctid = t.identifier; lx = t.clientX; ly = t.clientY; return; }
                    this.camYaw -= (t.clientX - lx) * 0.0085;
                    this.camPitch = Math.max(0.18, Math.min(1.15, this.camPitch + (t.clientY - ly) * 0.007));
                    lx = t.clientX; ly = t.clientY;
                } else if (e.targetTouches.length >= 2) {
                    const nd = Math.hypot(e.targetTouches[0].clientX - e.targetTouches[1].clientX, e.targetTouches[0].clientY - e.targetTouches[1].clientY);
                    if (pd > 0) this.camDist = Math.max(7.5, Math.min(26, this.camDist - (nd - pd) * 0.03));
                    pd = nd;
                }
            }, { passive: true });
            this.canvas.addEventListener('touchend', (e) => {
                if (!e.targetTouches.length) { drag = false; ctid = null; pd = 0; }
                else if (e.targetTouches.length === 1) { const t = e.targetTouches[0]; drag = true; ctid = t.identifier; lx = t.clientX; ly = t.clientY; pd = 0; }
            });
            this.canvas.addEventListener('touchcancel', () => { drag = false; ctid = null; pd = 0; });
        }
        window.addEventListener('pagehide', () => this.stopMqtt(true));
    }
});

if (typeof KaomojiMMORPG !== 'undefined') {
    const _rHUD = KaomojiMMORPG.prototype.refreshAllHUD;
    if (_rHUD) KaomojiMMORPG.prototype.refreshAllHUD = function () {
        _rHUD.call(this);
        const btn = document.getElementById('btn-hud-online-toggle');
        if (btn && !this.fbConnected && this.saveData?.onlineEnabled && this.netStatusLabel) btn.textContent = this.netStatusLabel;
    };
    const _rMod = KaomojiMMORPG.prototype.renderModalContent;
    if (_rMod) KaomojiMMORPG.prototype.renderModalContent = function () {
        _rMod.call(this);
        if (this.activeTab === 'online') {
            const body = document.getElementById('modal-body');
            if (body) body.insertAdjacentHTML('afterbegin', `<div class="card-box" style="margin-bottom:8px;border-color:#fde047;"><b style="color:#fde047;font-size:11px;">📡 通信: ${this.netBrokerName || '待機'} ／ 送信:${this.netTxCount || 0} 受信:${this.netRxCount || 0}</b></div>`);
        }
    };
    const _bPE = KaomojiMMORPG.prototype.buildPlayerEntity;
    if (_bPE) KaomojiMMORPG.prototype.buildPlayerEntity = function () {
        const cds = this.player?.skillCds || [0, 0, 0, 0, 0];
        _bPE.call(this);
        if (this.player) this.player.skillCds = cds;
    };
}

window.addEventListener('DOMContentLoaded', () => {
    if (!window.game && typeof KaomojiMMORPG !== 'undefined') window.game = new KaomojiMMORPG();
});
// === GAME6_OK ===
