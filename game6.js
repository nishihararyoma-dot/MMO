'use strict';

// =========================================================================
// 顔文字ファンタジー3D ハイブリッド通信(MQTT+HTTPS)・同時視点操作 (game6.js)
// =========================================================================

const MQTT_BROKERS = [
    'wss://mqtt.eclipseprojects.io/mqtt',
    'wss://broker.emqx.io:8084/mqtt',
    'wss://broker.hivemq.com:8884/mqtt'
];
const MQTT_GLOBAL_TOPIC = 'kaomoji_fantasy_3d/v4/global';
const NTFY_URL = 'https://ntfy.sh';
const NTFY_GLOBAL_TOPIC = 'kaomoji_fantasy_3d_global_v4';

Object.assign(KaomojiMMORPG.prototype, {

    encodeRoomTopicSuffix(rawPass) {
        const str = String(rawPass || '').trim();
        if (!str) return 'EMPTY';
        let hex = '';
        for (let i = 0; i < str.length; i++) {
            hex += str.charCodeAt(i).toString(16);
        }
        return hex.slice(0, 48);
    },

    getMqttRoomTopic() {
        const d = this.saveData;
        if (!d.roomPassEnabled) return 'kaomoji_fantasy_3d/v4/room/PUBLIC_OPEN';
        return 'kaomoji_fantasy_3d/v4/room/PASS_' + this.encodeRoomTopicSuffix(d.roomPassword);
    },

    getNtfyRoomTopic() {
        const d = this.saveData;
        if (!d.roomPassEnabled) return 'kaomoji_fantasy_3d_room_PUBLIC_v4';
        return 'kaomoji_fantasy_3d_room_PASS_' + this.encodeRoomTopicSuffix(d.roomPassword);
    },

    toggleOnlineMode() {
        sfx.init();
        const d = this.saveData;
        if (this.fbConnected || d.onlineEnabled) {
            d.onlineEnabled = false;
            this.disconnectFirebase();
            this.refreshTitleScreen();
            this.refreshAllHUD();
        } else {
            d.onlineEnabled = true;
            this.saveGame(false);
            this.refreshTitleScreen();
            this.refreshAllHUD();
            this.connectHybridOnline(false);
        }
    },

    connectFirebase(rawUrl, silent = false) {
        this.connectHybridOnline(silent);
    },

    connectHybridOnline(silent = false) {
        this.closeAllNet(false);
        this.saveData.onlineEnabled = true;
        this.fbConnected = false;
        this.netMode = 'NONE';
        this.saveGame(false);
        this.refreshTitleScreen();
        this.refreshAllHUD();

        this.setupBroadcastChannel();
        this.tryConnectMqtt(silent, 0);

        // 4.5秒以内にMQTTが繋がらなければHTTPS(ntfy)モードへ自動切替
        clearTimeout(this._netFallbackTimer);
        this._netFallbackTimer = setTimeout(() => {
            if (this.saveData.onlineEnabled && !this.fbConnected) {
                this.activateHttpsFallback(silent);
            }
        }, 4500);
    },

    setupBroadcastChannel() {
        if (typeof BroadcastChannel === 'undefined') return;
        try {
            if (this._bc) this._bc.close();
            this._bc = new BroadcastChannel('kaomoji_mmo_local_v4');
            this._bc.onmessage = (ev) => {
                if (ev && ev.data) this.handleIncomingPacket(ev.data);
            };
        } catch (e) {}
    },

    tryConnectMqtt(silent, brokerIdx) {
        if (!this.saveData.onlineEnabled || typeof mqtt === 'undefined') return;
        if (brokerIdx >= MQTT_BROKERS.length) return;

        const brokerUrl = MQTT_BROKERS[brokerIdx];
        const roomTopic = this.getMqttRoomTopic();
        this.currentMqttRoomTopic = roomTopic;
        const myUid = this.saveData.playerUid;
        const clientId = 'kmj_' + myUid + '_' + Math.random().toString(36).slice(2, 7);

        let done = false;
        const nextTimer = setTimeout(() => {
            if (!done && this.saveData.onlineEnabled && this.netMode !== 'MQTT') {
                this.tryConnectMqtt(silent, brokerIdx + 1);
            }
        }, 1800);

        try {
            const client = mqtt.connect(brokerUrl, {
                clientId,
                clean: true,
                keepalive: 20,
                connectTimeout: 3500,
                reconnectPeriod: 3000,
                will: {
                    topic: roomTopic,
                    payload: JSON.stringify({ type: 'leave', uid: myUid, ts: Date.now() }),
                    qos: 0,
                    retain: false
                }
            });

            if (!this._mqttPool) this._mqttPool = [];
            this._mqttPool.push(client);

            client.on('connect', () => {
                if (!this.saveData.onlineEnabled) {
                    try { client.end(true); } catch (e) {}
                    return;
                }
                if (this.netMode === 'MQTT' && this.mqttClient && this.mqttClient !== client) {
                    try { client.end(true); } catch (e) {}
                    return;
                }
                done = true;
                clearTimeout(nextTimer);
                clearTimeout(this._netFallbackTimer);
                this.closeNtfyStreams();

                this.mqttClient = client;
                this.netMode = 'MQTT';
                this.fbConnected = true;
                this.fbLastEventTs = Date.now();

                client.subscribe([MQTT_GLOBAL_TOPIC, roomTopic], { qos: 0 }, () => {
                    this.syncFirebaseNow(true);
                    setTimeout(() => { if (this.fbConnected) this.syncFirebaseNow(true); }, 600);
                });

                this.onNetworkReady(silent, '高速MQTT');
            });

            client.on('message', (topic, buf) => {
                if (this.mqttClient !== client) return;
                try {
                    const obj = JSON.parse(buf.toString());
                    if (topic === MQTT_GLOBAL_TOPIC && obj && !obj.type) obj.type = 'chat_global';
                    this.handleIncomingPacket(obj);
                } catch (e) {}
            });

            client.on('error', () => {});
        } catch (e) {
            clearTimeout(nextTimer);
        }
    },

    activateHttpsFallback(silent) {
        if (!this.saveData.onlineEnabled || this.netMode === 'MQTT') return;
        this.netMode = 'HTTPS';
        this.fbConnected = true;
        this.fbLastEventTs = Date.now();

        this.openNtfyStreams();
        this.syncFirebaseNow(true);
        setTimeout(() => { if (this.fbConnected) this.pollNtfyTopics(); }, 700);

        this.onNetworkReady(silent, 'HTTPS互換');
    },

    onNetworkReady(silent, label) {
        this.refreshTitleScreen();
        this.refreshAllHUD();
        if (this.isModalOpen && this.activeTab === 'online') {
            this.renderModalContent();
        }
        if (!silent) {
            sfx.playHeal();
            const roomLabel = this.saveData.roomPassEnabled
                ? `🔒 パス部屋（${this.saveData.roomPassword || '未設定'}）`
                : '🌐 公開広場';
            this.showAlertBanner(`${roomLabel}に接続完了！（${label}）`, 2200);
        }
    },

    openNtfyStreams() {
        this.closeNtfyStreams();
        if (typeof EventSource === 'undefined') return;
        const rTopic = this.getNtfyRoomTopic();
        this.currentNtfyRoomTopic = rTopic;
        try {
            const esG = new EventSource(`${NTFY_URL}/${NTFY_GLOBAL_TOPIC}/sse?since=15s`);
            esG.onmessage = (ev) => this.parseNtfyEvent(ev.data);
            this.ntfyGlobalEs = esG;

            const esR = new EventSource(`${NTFY_URL}/${rTopic}/sse?since=15s`);
            esR.onmessage = (ev) => this.parseNtfyEvent(ev.data);
            this.ntfyRoomEs = esR;
        } catch (e) {}
    },

    closeNtfyStreams() {
        if (this.ntfyGlobalEs) { try { this.ntfyGlobalEs.close(); } catch (e) {} this.ntfyGlobalEs = null; }
        if (this.ntfyRoomEs) { try { this.ntfyRoomEs.close(); } catch (e) {} this.ntfyRoomEs = null; }
    },

    parseNtfyEvent(rawLine) {
        if (!rawLine) return;
        try {
            const wrap = JSON.parse(rawLine);
            if (!wrap || wrap.event !== 'message' || !wrap.message) return;
            const obj = JSON.parse(wrap.message);
            this.handleIncomingPacket(obj, wrap.id);
        } catch (e) {}
    },

    pollNtfyTopics() {
        if (!this.fbConnected || this.netMode !== 'HTTPS') return;
        const rTopic = this.getNtfyRoomTopic();
        [rTopic, NTFY_GLOBAL_TOPIC].forEach(tp => {
            fetch(`${NTFY_URL}/${tp}/json?poll=1&since=15s`, { cache: 'no-store' })
                .then(r => r.ok ? r.text() : '')
                .then(txt => {
                    if (!txt) return;
                    txt.split('\n').forEach(line => { if (line.trim()) this.parseNtfyEvent(line); });
                })
                .catch(() => {});
        });
    },

    sendNtfyJson(topic, obj) {
        fetch(NTFY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic, message: JSON.stringify(obj) })
        }).catch(() => {});
    },

    reconnectMqttRoom() {
        if (!this.saveData.onlineEnabled) return;
        this.clearRemotePlayers();
        this.connectHybridOnline(true);
    },

    closeAllNet(sendLeave = true) {
        clearTimeout(this._netFallbackTimer);
        if (sendLeave && this.fbConnected) {
            const leaveObj = { type: 'leave', uid: this.saveData.playerUid, ts: Date.now() };
            if (this.mqttClient && this.mqttClient.connected && this.currentMqttRoomTopic) {
                try { this.mqttClient.publish(this.currentMqttRoomTopic, JSON.stringify(leaveObj)); } catch (e) {}
            }
            if (this.netMode === 'HTTPS') {
                this.sendNtfyJson(this.currentNtfyRoomTopic || this.getNtfyRoomTopic(), leaveObj);
            }
        }
        if (this._mqttPool) {
            this._mqttPool.forEach(c => { try { c.end(true); } catch (e) {} });
            this._mqttPool = [];
        }
        this.mqttClient = null;
        this.closeNtfyStreams();
        this.netMode = 'NONE';
    },

    clearRemotePlayers() {
        this.remotePlayers.forEach(rp => {
            if (rp.group && this.scene) this.scene.remove(rp.group);
            if (rp.plateEl) rp.plateEl.remove();
        });
        this.remotePlayers.clear();
    },

    disconnectFirebase() {
        this.closeAllNet(true);
        this.fbConnected = false;
        this.saveData.onlineEnabled = false;
        this.clearRemotePlayers();
        this.saveGame(false);
        this.refreshTitleScreen();
        this.refreshAllHUD();
        this.showAlertBanner('📴 オフラインモードに切り替えました', 1600);
    },

    buildMyOnlinePayload(isHello = false) {
        const d = this.saveData;
        return {
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
    },

    syncFirebaseNow(isHello = false) {
        if (!this.fbConnected) return;
        const payload = this.buildMyOnlinePayload(isHello);
        if (this._bc) { try { this._bc.postMessage(payload); } catch (e) {} }

        if (this.netMode === 'MQTT' && this.mqttClient && this.mqttClient.connected) {
            const topic = this.getMqttRoomTopic();
            if (this.currentMqttRoomTopic && this.currentMqttRoomTopic !== topic) {
                this.reconnectMqttRoom();
                return;
            }
            try { this.mqttClient.publish(topic, JSON.stringify(payload), { qos: 0 }); } catch (e) {}
        } else if (this.netMode === 'HTTPS') {
            this.sendNtfyJson(this.getNtfyRoomTopic(), payload);
        }
    },

    broadcastFirebaseEvent(type, payload) {
        if (!this.fbConnected) return;
        const packet = {
            type,
            senderUid: this.saveData.playerUid,
            roomKey: this.getCurrentRoomKey(),
            payload,
            ts: Date.now()
        };
        if (this._bc) { try { this._bc.postMessage(packet); } catch (e) {} }

        if (this.netMode === 'MQTT' && this.mqttClient && this.mqttClient.connected) {
            const topic = (type === 'chat_global') ? MQTT_GLOBAL_TOPIC : this.getMqttRoomTopic();
            try { this.mqttClient.publish(topic, JSON.stringify(packet), { qos: 0 }); } catch (e) {}
        } else if (this.netMode === 'HTTPS') {
            const topic = (type === 'chat_global') ? NTFY_GLOBAL_TOPIC : this.getNtfyRoomTopic();
            this.sendNtfyJson(topic, packet);
        }
    },

    updateFirebaseSync(dt) {
        if (!this.fbConnected) return;

        const isMoving = Math.hypot(this.joyVec.x, this.joyVec.y) > 0.08 ||
            this.keys['KeyW'] || this.keys['KeyA'] || this.keys['KeyS'] || this.keys['KeyD'] ||
            this.keys['ArrowUp'] || this.keys['ArrowDown'] || this.keys['ArrowLeft'] || this.keys['ArrowRight'];
        const syncInterval = (this.netMode === 'MQTT') ? (isMoving ? 0.25 : 2.5) : (isMoving ? 2.2 : 4.5);

        this.fbSyncTimer += dt;
        if (this.fbSyncTimer >= syncInterval) {
            this.fbSyncTimer = 0;
            this.syncFirebaseNow(false);
        }

        this.fbPollTimer += dt;
        if (this.fbPollTimer >= 4.0) {
            this.fbPollTimer = 0;
            if (this.netMode === 'HTTPS') this.pollNtfyTopics();

            const now = Date.now();
            const timeoutMs = (this.netMode === 'MQTT') ? 12000 : 22000;
            let changed = false;
            for (const [uid, rp] of this.remotePlayers.entries()) {
                if (now - (rp.lastSeenTs || 0) > timeoutMs) {
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

    handleIncomingPacket(msg, extId = '') {
        if (!msg || typeof msg !== 'object') return;
        const myUid = this.saveData.playerUid;
        const senderUid = msg.uid || msg.senderUid;
        if (!senderUid || senderUid === myUid) return;

        const dedupId = extId || `${senderUid}_${msg.type}_${msg.ts}`;
        if (!this._seenNetIds) this._seenNetIds = new Set();
        if (this._seenNetIds.has(dedupId)) return;
        this._seenNetIds.add(dedupId);
        if (this._seenNetIds.size > 400) {
            const first = this._seenNetIds.values().next().value;
            this._seenNetIds.delete(first);
        }

        if (msg.type === 'chat_global' && msg.payload) {
            this.addChatMessage('global', msg.payload.kaomoji, msg.payload.name, msg.payload.text, false);
            return;
        }

        const myRoomKey = this.getCurrentRoomKey();
        const msgRoomKey = msg.roomKey || 'PUBLIC_OPEN_ROOM';
        if (msgRoomKey !== myRoomKey) return;

        if (msg.type === 'sync' || msg.type === 'hello') {
            const isNew = !this.remotePlayers.has(msg.uid);
            this.upsertRemotePlayer(msg);
            if (isNew || msg.type === 'hello') {
                this.syncFirebaseNow(false);
                if (isNew) {
                    const zName = (typeof ZONES !== 'undefined' && ZONES[msg.zoneId]) ? ZONES[msg.zoneId].name : '試練の塔';
                    this.showAlertBanner(`👋 ${msg.kaomoji || '(´・ω・`)'} Lv.${msg.lv || 1} が合流！（${zName}）`, 2500);
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
        } else if (msg.type === 'kill' && msg.payload) {
            if (this.receiveCoopReward) this.receiveCoopReward(msg.payload);
        } else if (msg.type === 'emote' && msg.payload) {
            const rp = this.remotePlayers.get(senderUid);
            if (rp && rp.visible && this.spawnEmoteBubble) {
                this.spawnEmoteBubble(
                    rp.pos.clone().add(new THREE.Vector3(0, 2.7, 0)),
                    msg.payload.kaomoji || '(≧▽≦)',
                    msg.payload.msg || 'やっほー！'
                );
            }
        }
    },

    upsertRemotePlayer(p) {
        const bScale = Number(p.bodyScale) || 1.0;
        const fBg = p.faceBgColor || '#073b66';
        const bCos = p.backCosmeticId || 'back_none';
        const appearanceSig = `${p.kaomoji}|${p.bodyColor}|${fBg}|${bScale}|${p.evolutionId}|${p.cosmeticId}|${bCos}|${p.weaponId}|${p.armorId}`;
        let rp = this.remotePlayers.get(p.uid);

        const evo = (typeof EVOLUTIONS !== 'undefined' && EVOLUTIONS[p.evolutionId]) || (typeof EVOLUTIONS !== 'undefined' && EVOLUTIONS.novice) || { hexColor: 0x38bdf8 };
        const bodyHex = (p.bodyColor && /^#[0-9a-fA-F]{6}$/.test(p.bodyColor))
            ? parseInt(p.bodyColor.slice(1), 16)
            : (evo.hexColor || 0x38bdf8);

        if (!rp || rp.appearanceSig !== appearanceSig) {
            if (rp && rp.group && this.scene) this.scene.remove(rp.group);
            if (rp && rp.plateEl) rp.plateEl.remove();

            const meshParts = this.buildAvatarGroup({
                kaomoji: p.kaomoji || '(´・ω・`)',
                bodyHex,
                faceBgHex: fBg,
                bodyScale: bScale,
                weaponId: p.weaponId || 'wpn_wood',
                weaponEnhance: p.weaponEnhance || 0,
                armorId: p.armorId || 'arm_cloth',
                cosmeticId: p.cosmeticId || 'none',
                backCosmeticId: bCos
            });

            const startPos = new THREE.Vector3(p.x || 0, 0, p.z || 5);
            if (this.useWebGL && this.scene && meshParts.group) {
                meshParts.group.position.copy(startPos);
                meshParts.group.rotation.y = p.rotY || 0;
                this.scene.add(meshParts.group);
            }

            const plate = document.createElement('div');
            plate.className = 'world-plate';
            plate.innerHTML = `<div style="font-size:9px; font-weight:900; color:#f9a8d4;">Lv.${p.lv || 1} 仲間 (脅威+${p.threatRank || 0})</div>`;
            this.overlayLayer?.appendChild(plate);

            rp = {
                uid: p.uid,
                appearanceSig,
                bodyScale: bScale,
                pos: startPos,
                targetPos: startPos.clone(),
                rotY: p.rotY || 0,
                targetRotY: p.rotY || 0,
                lv: p.lv || 1,
                kaomoji: p.kaomoji || '(´・ω・`)',
                zoneId: p.zoneId || 'town',
                threatRank: p.threatRank || 0,
                lastSeenTs: Date.now(),
                visible: true,
                headPlateEl: plate,
                plateEl: plate,
                ...meshParts
            };
            this.remotePlayers.set(p.uid, rp);
        } else {
            rp.targetPos.set(p.x || 0, 0, p.z || 5);
            rp.targetRotY = p.rotY || 0;
            rp.lv = p.lv || 1;
            rp.zoneId = p.zoneId || 'town';
            rp.threatRank = p.threatRank || 0;
            rp.lastSeenTs = Date.now();
            if (rp.plateEl) {
                rp.plateEl.innerHTML = `<div style="font-size:9px; font-weight:900; color:#f9a8d4;">Lv.${rp.lv} 仲間 (脅威+${rp.threatRank})</div>`;
            }
        }
    },

    updateRemotePlayers(dt) {
        const myZone = this.towerState.active ? 'tower' : this.currentZoneId;
        this.remotePlayers.forEach(rp => {
            const sameZone = (rp.zoneId === myZone && myZone !== 'tower');
            rp.visible = sameZone;
            if (rp.group) rp.group.visible = sameZone;

            rp.pos.lerp(rp.targetPos, Math.min(1, dt * 10));
            rp.rotY += (rp.targetRotY - rp.rotY) * Math.min(1, dt * 10);
            if (rp.group) {
                rp.group.position.copy(rp.pos);
                rp.group.rotation.y = rp.rotY;
            }
        });
    },

    getSameZoneRemoteCount() {
        if (this.towerState.active) return 0;
        let count = 0;
        this.remotePlayers.forEach(rp => {
            if (rp.zoneId === this.currentZoneId) count++;
        });
        return count;
    },

    bindEvents() {
        document.getElementById('title-btn-toggle-online')?.addEventListener('click', () => {
            this.toggleOnlineMode();
        });

        document.getElementById('title-btn-toggle-pass')?.addEventListener('click', () => {
            sfx.init();
            this.saveData.roomPassEnabled = !this.saveData.roomPassEnabled;
            this.saveGame(false);
            if (this.saveData.onlineEnabled) this.reconnectMqttRoom();
            this.refreshTitleScreen();
            this.refreshAllHUD();
        });

        document.getElementById('title-input-room-pass')?.addEventListener('input', (e) => {
            this.saveData.roomPassword = e.target.value.trim();
            this.saveGame(false);
            if (this.saveData.onlineEnabled) this.reconnectMqttRoom();
        });

        document.getElementById('btn-title-start')?.addEventListener('click', () => {
            this.enterGameFromTitle();
        });

        document.getElementById('btn-title-cloud')?.addEventListener('click', () => {
            sfx.init();
            this.inTitleScreen = false;
            document.getElementById('title-screen')?.classList.add('hidden');
            this.openGrowthModal('online');
        });

        document.getElementById('btn-title-hard-reset')?.addEventListener('click', () => {
            sfx.init();
            this.openDialog(
                '💥 データの完全初期化',
                'レベル・装備・素材・見た目・転生回数など\nすべてのデータを完全に消去して最初から始めますか？',
                [
                    { text: 'キャンセル', primary: false },
                    { text: '💥 完全に初期化する', primary: true, onClick: () => this.hardResetGame() }
                ]
            );
        });

        document.getElementById('btn-hud-online-toggle')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleOnlineMode();
        });

        document.getElementById('btn-hud-room-lock')?.addEventListener('click', (e) => {
            e.stopPropagation();
            sfx.init();
            this.openGrowthModal('online');
        });

        document.getElementById('btn-open-travel')?.addEventListener('click', (e) => {
            e.stopPropagation();
            sfx.init();
            this.openGrowthModal('travel');
        });

        document.getElementById('btn-open-growth')?.addEventListener('click', (e) => {
            e.stopPropagation();
            sfx.init();
            this.openGrowthModal('stats');
        });

        document.getElementById('btn-close-modal')?.addEventListener('click', () => {
            this.closeGrowthModal();
        });

        document.getElementById('growth-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'growth-modal') this.closeGrowthModal();
        });

        document.getElementById('btn-toggle-drawer')?.addEventListener('click', (e) => {
            e.stopPropagation();
            sfx.init();
            document.getElementById('hud-drawer-menu')?.classList.toggle('hidden');
            document.getElementById('emote-palette')?.classList.add('hidden');
        });

        document.getElementById('btn-toggle-emote')?.addEventListener('click', (e) => {
            e.stopPropagation();
            sfx.init();
            document.getElementById('emote-palette')?.classList.toggle('hidden');
            document.getElementById('hud-drawer-menu')?.classList.add('hidden');
        });

        document.getElementById('btn-exec-warp')?.addEventListener('click', (e) => {
            e.stopPropagation();
            sfx.init();
            sfx.playSkill();
            if (this.currentZoneId === 'town') {
                this.openGrowthModal('travel');
            } else {
                this.loadZone('town');
                this.showAlertBanner('🏠 始まりの顔文字広場へ帰還しました！', 1600);
            }
        });

        document.getElementById('btn-toggle-autohunt')?.addEventListener('click', (e) => {
            e.stopPropagation();
            sfx.init();
            this.autoHunt = !this.autoHunt;
            e.currentTarget.textContent = this.autoHunt ? '🤖 AUTO:ON' : '🤖 AUTO:OFF';
            e.currentTarget.style.background = this.autoHunt ? '#059669' : '';
            this.showAlertBanner(this.autoHunt ? '🤖 オート狩り ON' : '🤖 オート狩り OFF', 1400);
        });

        const adjustThreatQuick = (delta) => {
            sfx.init();
            const d = this.saveData;
            const maxT = (typeof MAX_THREAT_RANK !== 'undefined') ? MAX_THREAT_RANK : 99;
            d.threatRank = Math.max(0, Math.min(maxT, (d.threatRank || 0) + delta));
            this.saveGame(false);
            if (!this.towerState.active) this.loadZone(this.currentZoneId);
            else this.refreshAllHUD();
            this.showAlertBanner(`🔥 脅威度ランク: +${d.threatRank}`, 1300);
        };
        document.getElementById('btn-threat-down')?.addEventListener('click', (e) => { e.stopPropagation(); adjustThreatQuick(-1); });
        document.getElementById('btn-threat-up')?.addEventListener('click', (e) => { e.stopPropagation(); adjustThreatQuick(1); });

        document.getElementById('btn-open-cloud')?.addEventListener('click', (e) => {
            e.stopPropagation();
            sfx.init();
            this.openGrowthModal('online');
        });

        document.getElementById('btn-manual-save')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.saveGame(true);
            document.getElementById('hud-drawer-menu')?.classList.add('hidden');
        });

        document.getElementById('btn-toggle-bgm')?.addEventListener('click', (e) => {
            e.stopPropagation();
            sfx.init();
            sfx.bgmMuted = !sfx.bgmMuted;
            e.currentTarget.textContent = sfx.bgmMuted ? '🔇 BGM:OFF' : '🔊 BGM:ON';
        });

        document.getElementById('btn-back-title')?.addEventListener('click', (e) => {
            e.stopPropagation();
            sfx.init();
            document.getElementById('hud-drawer-menu')?.classList.add('hidden');
            this.saveGame(false);
            this.showTitleScreen();
        });

        document.getElementById('btn-reset-save')?.addEventListener('click', (e) => {
            e.stopPropagation();
            sfx.init();
            document.getElementById('hud-drawer-menu')?.classList.add('hidden');
            this.openDialog(
                '💥 データの完全初期化',
                '本当にすべての進行データを削除して\n最初からやり直しますか？',
                [
                    { text: 'キャンセル', primary: false },
                    { text: '💥 完全に初期化する', primary: true, onClick: () => this.hardResetGame() }
                ]
            );
        });

        document.getElementById('btn-toggle-chat')?.addEventListener('click', (e) => {
            e.stopPropagation();
            sfx.init();
            this.chatCollapsed = !this.chatCollapsed;
            document.getElementById('chat-panel')?.classList.toggle('hidden', this.chatCollapsed);
        });

        document.getElementById('btn-chat-tab-global')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.chatTab = 'global';
            this.renderChatMessages();
        });

        document.getElementById('btn-chat-tab-room')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.chatTab = 'room';
            this.renderChatMessages();
        });

        document.querySelectorAll('.chat-quick-chip').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.sendChatMessage(btn.dataset.msg || btn.textContent);
            });
        });

        const chatInp = document.getElementById('input-chat-msg');
        document.getElementById('btn-send-chat')?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!chatInp) return;
            this.sendChatMessage(chatInp.value);
            chatInp.value = '';
        });

        chatInp?.addEventListener('keydown', (e) => {
            e.stopPropagation();
            if (e.key === 'Enter') {
                e.preventDefault();
                this.sendChatMessage(chatInp.value);
                chatInp.value = '';
            }
        });

        const atkBtn = document.getElementById('btn-basic-attack');
        if (atkBtn) {
            let lastAtkTouch = 0;
            const triggerBasicAtk = (e) => {
                if (e) { e.preventDefault(); e.stopPropagation(); }
                const now = performance.now();
                if (now - lastAtkTouch < 110) return;
                lastAtkTouch = now;
                if (this.performBasicAttack) this.performBasicAttack();
            };
            atkBtn.addEventListener('touchstart', triggerBasicAtk, { passive: false });
            atkBtn.addEventListener('mousedown', triggerBasicAtk);
        }

        document.getElementById('btn-cycle-target')?.addEventListener('click', (e) => {
            e.stopPropagation();
            sfx.init();
            if (this.cycleTarget) this.cycleTarget();
        });

        this.canvas?.addEventListener('click', (e) => {
            sfx.init();
            document.getElementById('hud-drawer-menu')?.classList.add('hidden');
            document.getElementById('emote-palette')?.classList.add('hidden');

            if (!this.useWebGL || !this.camera || this.monsters.length === 0) return;
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;

            let bestM = null;
            let bestDist = 52;
            this.monsters.forEach(m => {
                if (m.dead) return;
                const sc = this.projectToScreen(new THREE.Vector3(m.pos.x, (m.scale || 1) * 1.1, m.pos.z));
                if (!sc) return;
                const d = Math.hypot(sc.x - clickX, sc.y - clickY);
                if (d < bestDist) { bestDist = d; bestM = m; }
            });
            if (bestM) {
                this.selectedTarget = bestM;
                sfx.playTone(620, 'sine', 0.08, 0.06);
            }
        });

        window.addEventListener('keydown', (e) => {
            const tag = (document.activeElement && document.activeElement.tagName) || '';
            if (tag === 'INPUT' || tag === 'TEXTAREA') return;

            this.keys[e.code] = true;
            if (this.inTitleScreen) return;
            if (this.isModalOpen) {
                if (e.code === 'Escape') this.closeGrowthModal();
                return;
            }
            if (e.code === 'Space') { e.preventDefault(); if (this.performBasicAttack) this.performBasicAttack(); }
            if (e.code === 'Digit1' && this.useSkillSlot) this.useSkillSlot(0);
            if (e.code === 'Digit2' && this.useSkillSlot) this.useSkillSlot(1);
            if (e.code === 'Digit3' && this.useSkillSlot) this.useSkillSlot(2);
            if (e.code === 'Digit4' && this.useSkillSlot) this.useSkillSlot(3);
            if (e.code === 'Digit5' && this.useSkillSlot) this.useSkillSlot(4);
            if (e.code === 'Tab') { e.preventDefault(); if (this.cycleTarget) this.cycleTarget(); }
        });

        window.addEventListener('keyup', (e) => { this.keys[e.code] = false; });

        // バーチャルジョイスティック（左手移動専用タッチID）
        const joyZone = document.getElementById('joystick-zone');
        const joyKnob = document.getElementById('joystick-knob');
        if (joyZone && joyKnob) {
            let joyActive = false;
            let joyTouchId = null;
            const maxR = 38;

            const updateJoy = (clientX, clientY) => {
                const rect = joyZone.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                let dx = clientX - cx;
                let dy = clientY - cy;
                const dist = Math.hypot(dx, dy);
                if (dist > maxR) { dx = (dx / dist) * maxR; dy = (dy / dist) * maxR; }
                joyKnob.style.transform = `translate(${dx}px, ${dy}px)`;
                this.joyVec.x = dx / maxR;
                this.joyVec.y = dy / maxR;
            };

            const resetJoy = () => {
                joyActive = false;
                joyTouchId = null;
                joyKnob.style.transform = 'translate(0px, 0px)';
                this.joyVec.x = 0;
                this.joyVec.y = 0;
            };

            joyZone.addEventListener('touchstart', (e) => {
                e.preventDefault();
                e.stopPropagation();
                sfx.init();
                const t = e.changedTouches[0];
                joyActive = true;
                joyTouchId = t.identifier;
                updateJoy(t.clientX, t.clientY);
            }, { passive: false });

            window.addEventListener('touchmove', (e) => {
                if (!joyActive) return;
                for (let i = 0; i < e.changedTouches.length; i++) {
                    if (e.changedTouches[i].identifier === joyTouchId) {
                        updateJoy(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
                        break;
                    }
                }
            }, { passive: true });

            window.addEventListener('touchend', (e) => {
                if (!joyActive) return;
                for (let i = 0; i < e.changedTouches.length; i++) {
                    if (e.changedTouches[i].identifier === joyTouchId) { resetJoy(); break; }
                }
            });

            window.addEventListener('touchcancel', (e) => {
                if (!joyActive) return;
                for (let i = 0; i < e.changedTouches.length; i++) {
                    if (e.changedTouches[i].identifier === joyTouchId) { resetJoy(); break; }
                }
            });

            joyZone.addEventListener('mousedown', (e) => {
                e.preventDefault();
                sfx.init();
                joyActive = true;
                updateJoy(e.clientX, e.clientY);
            });
            window.addEventListener('mousemove', (e) => { if (joyActive) updateJoy(e.clientX, e.clientY); });
            window.addEventListener('mouseup', () => { if (joyActive) resetJoy(); });
        }

        // 3Dカメラ回転＆ズーム（targetTouchesでジョイスティックと同時操作可能）
        if (this.canvas) {
            let camDragging = false;
            let camTouchId = null;
            let lastX = 0;
            let lastY = 0;
            let pinchDist = 0;

            this.canvas.addEventListener('mousedown', (e) => {
                camDragging = true;
                lastX = e.clientX;
                lastY = e.clientY;
            });
            window.addEventListener('mousemove', (e) => {
                if (!camDragging) return;
                const dx = e.clientX - lastX;
                const dy = e.clientY - lastY;
                lastX = e.clientX;
                lastY = e.clientY;
                this.camYaw -= dx * 0.007;
                this.camPitch = Math.max(0.18, Math.min(1.15, this.camPitch + dy * 0.006));
            });
            window.addEventListener('mouseup', () => { camDragging = false; });

            this.canvas.addEventListener('wheel', (e) => {
                e.preventDefault();
                this.camDist = Math.max(7.5, Math.min(26.0, this.camDist + e.deltaY * 0.01));
            }, { passive: false });

            this.canvas.addEventListener('touchstart', (e) => {
                sfx.init();
                if (e.targetTouches.length === 1) {
                    const t = e.targetTouches[0];
                    camDragging = true;
                    camTouchId = t.identifier;
                    lastX = t.clientX;
                    lastY = t.clientY;
                    pinchDist = 0;
                } else if (e.targetTouches.length >= 2) {
                    camDragging = false;
                    camTouchId = null;
                    pinchDist = Math.hypot(
                        e.targetTouches[0].clientX - e.targetTouches[1].clientX,
                        e.targetTouches[0].clientY - e.targetTouches[1].clientY
                    );
                }
            }, { passive: true });

            this.canvas.addEventListener('touchmove', (e) => {
                if (e.targetTouches.length === 1 && camDragging) {
                    let t = null;
                    for (let i = 0; i < e.targetTouches.length; i++) {
                        if (e.targetTouches[i].identifier === camTouchId) { t = e.targetTouches[i]; break; }
                    }
                    if (!t) {
                        t = e.targetTouches[0];
                        camTouchId = t.identifier;
                        lastX = t.clientX;
                        lastY = t.clientY;
                        return;
                    }
                    const dx = t.clientX - lastX;
                    const dy = t.clientY - lastY;
                    lastX = t.clientX;
                    lastY = t.clientY;
                    this.camYaw -= dx * 0.0085;
                    this.camPitch = Math.max(0.18, Math.min(1.15, this.camPitch + dy * 0.007));
                } else if (e.targetTouches.length >= 2) {
                    const newDist = Math.hypot(
                        e.targetTouches[0].clientX - e.targetTouches[1].clientX,
                        e.targetTouches[0].clientY - e.targetTouches[1].clientY
                    );
                    if (pinchDist > 0) {
                        this.camDist = Math.max(7.5, Math.min(26.0, this.camDist - (newDist - pinchDist) * 0.03));
                    }
                    pinchDist = newDist;
                }
            }, { passive: true });

            this.canvas.addEventListener('touchend', (e) => {
                if (e.targetTouches.length === 0) {
                    camDragging = false;
                    camTouchId = null;
                    pinchDist = 0;
                } else if (e.targetTouches.length === 1) {
                    const t = e.targetTouches[0];
                    camDragging = true;
                    camTouchId = t.identifier;
                    lastX = t.clientX;
                    lastY = t.clientY;
                    pinchDist = 0;
                }
            });

            this.canvas.addEventListener('touchcancel', () => {
                camDragging = false;
                camTouchId = null;
                pinchDist = 0;
            });
        }

        window.addEventListener('pagehide', () => { this.closeAllNet(true); });
    }
});

if (typeof KaomojiMMORPG !== 'undefined' && KaomojiMMORPG.prototype.buildPlayerEntity) {
    const _origBuildPlayerEntity = KaomojiMMORPG.prototype.buildPlayerEntity;
    KaomojiMMORPG.prototype.buildPlayerEntity = function () {
        const prevCds = (this.player && this.player.skillCds) ? this.player.skillCds : [0, 0, 0, 0, 0];
        _origBuildPlayerEntity.call(this);
        if (this.player) this.player.skillCds = prevCds;
    };
}

window.addEventListener('DOMContentLoaded', () => {
    if (!window.game && typeof KaomojiMMORPG !== 'undefined') {
        window.game = new KaomojiMMORPG();
    }
});
