'use strict';

// =========================================================================
// 顔文字ファンタジー3D 並列MQTT＋HTTPS通信・診断モニター・同時操作 (game6.js)
// =========================================================================

const MQTT_BROKERS = [
    { name: 'EMQX', url: 'wss://broker.emqx.io:8084/mqtt' },
    { name: 'HiveMQ', url: 'wss://broker.hivemq.com:8884/mqtt' },
    { name: 'Mosquitto', url: 'wss://test.mosquitto.org:8081/mqtt' }
];
const MQTT_GLOBAL_TOPIC = 'kaomoji_fantasy_3d/v5/global';
const NTFY_URL = 'https://ntfy.sh';
const NTFY_GLOBAL_TOPIC = 'kmj_3d_global_v5_open';

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
        if (!d.roomPassEnabled) return 'kaomoji_fantasy_3d/v5/room/PUBLIC_OPEN';
        return 'kaomoji_fantasy_3d/v5/room/PASS_' + this.encodeRoomTopicSuffix(d.roomPassword);
    },

    getNtfyRoomTopic() {
        const d = this.saveData;
        if (!d.roomPassEnabled) return 'kmj_3d_room_v5_PUBLIC_OPEN';
        return 'kmj_3d_room_v5_PASS_' + this.encodeRoomTopicSuffix(d.roomPassword);
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
        this.netMode = 'CONNECTING';
        this.netBrokerName = '接続試行中...';
        this.netTxCount = 0;
        this.netRxCount = 0;
        this.netLastErr = '';
        this.saveGame(false);
        this.refreshTitleScreen();
        this.refreshAllHUD();

        this.setupBroadcastChannel();
        this.raceConnectMqtt(silent);

        // 4秒以内にMQTTが繋がらなければHTTPS(ntfy)の疎通テストを実行して切替
        clearTimeout(this._netFallbackTimer);
        this._netFallbackTimer = setTimeout(() => {
            if (this.saveData.onlineEnabled && this.netMode !== 'MQTT') {
                this.activateHttpsFallback(silent);
            }
        }, 4000);
    },

    setupBroadcastChannel() {
        if (typeof BroadcastChannel === 'undefined') return;
        try {
            if (this._bc) this._bc.close();
            this._bc = new BroadcastChannel('kaomoji_mmo_local_v5');
            this._bc.onmessage = (ev) => {
                if (ev && ev.data) this.handleIncomingPacket(ev.data);
            };
        } catch (e) {}
    },

    raceConnectMqtt(silent) {
        if (!this.saveData.onlineEnabled) return;
        if (typeof mqtt === 'undefined') {
            this.netLastErr = 'MQTTライブラリ未読込';
            return;
        }

        const roomTopic = this.getMqttRoomTopic();
        this.currentMqttRoomTopic = roomTopic;
        const myUid = this.saveData.playerUid;
        this._mqttPool = [];

        MQTT_BROKERS.forEach((broker, idx) => {
            try {
                const clientId = 'kmj_' + myUid + '_' + idx + '_' + Math.random().toString(36).slice(2, 6);
                const client = mqtt.connect(broker.url, {
                    clientId,
                    clean: true,
                    keepalive: 20,
                    connectTimeout: 4000,
                    reconnectPeriod: 3000,
                    will: {
                        topic: roomTopic,
                        payload: JSON.stringify({ type: 'leave', uid: myUid, ts: Date.now() }),
                        qos: 0,
                        retain: false
                    }
                });
                this._mqttPool.push(client);

                client.on('connect', () => {
                    if (!this.saveData.onlineEnabled || (this.netMode === 'MQTT' && this.mqttClient && this.mqttClient !== client)) {
                        try { client.end(true); } catch (e) {}
                        return;
                    }
                    // 他の並列クライアントを停止
                    this._mqttPool.forEach(other => {
                        if (other !== client) {
                            try { other.end(true); } catch (e) {}
                        }
                    });
                    this._mqttPool = [client];
                    clearTimeout(this._netFallbackTimer);
                    this.closeNtfyStreams();

                    this.mqttClient = client;
                    this.netMode = 'MQTT';
                    this.netBrokerName = `MQTT (${broker.name})`;
                    this.fbConnected = true;
                    this.fbLastEventTs = Date.now();

                    client.subscribe([MQTT_GLOBAL_TOPIC, roomTopic], { qos: 0 }, (err) => {
                        if (err) {
                            this.netLastErr = 'Subscribe失敗: ' + err.message;
                        } else {
                            this.syncFirebaseNow(true);
                            setTimeout(() => { if (this.fbConnected) this.syncFirebaseNow(true); }, 500);
                        }
                    });

                    this.onNetworkReady(silent, `MQTT:${broker.name}`);
                });

                client.on('message', (topic, buf) => {
                    if (this.mqttClient !== client) return;
                    try {
                        const obj = JSON.parse(buf.toString());
                        if (topic === MQTT_GLOBAL_TOPIC && obj && !obj.type) obj.type = 'chat_global';
                        this.handleIncomingPacket(obj);
                    } catch (e) {}
                });

                client.on('error', (err) => {
                    if (this.netMode !== 'MQTT') {
                        this.netLastErr = `${broker.name}: ${(err && err.message) || '接続エラー'}`;
                    }
                });
            } catch (e) {
                this.netLastErr = e.message || 'MQTT例外';
            }
        });
    },

    activateHttpsFallback(silent) {
        if (!this.saveData.onlineEnabled || this.netMode === 'MQTT') return;
        const testTopic = this.getNtfyRoomTopic();
        // CORSプリフライトを起こさないSimple POSTで疎通確認
        fetch(`${NTFY_URL}/${testTopic}`, {
            method: 'POST',
            body: JSON.stringify(this.buildMyOnlinePayload(true))
        }).then(r => {
            if (!this.saveData.onlineEnabled || this.netMode === 'MQTT') return;
            if (r.ok) {
                this.netTxCount++;
                this.netMode = 'HTTPS';
                this.netBrokerName = 'HTTPS (ntfy)';
                this.fbConnected = true;
                this.fbLastEventTs = Date.now();
                this.openNtfyStreams();
                this.onNetworkReady(silent, 'HTTPS');
            } else {
                this.netMode = 'ERROR';
                this.netBrokerName = `通信制限 (${r.status})`;
                this.netLastErr = `HTTP ${r.status} エラー`;
                this.refreshAllHUD();
                if (this.isModalOpen && this.activeTab === 'online') this.renderModalContent();
            }
        }).catch(err => {
            if (this.netMode === 'MQTT') return;
            this.netMode = 'ERROR';
            this.netBrokerName = '通信ブロック';
            this.netLastErr = (err && err.message) || 'ネットワーク遮断';
            this.refreshAllHUD();
            if (this.isModalOpen && this.activeTab === 'online') this.renderModalContent();
        });
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

    sendNtfySimple(topic, obj) {
        // headersを付けないことでCORSプリフライトを完全回避
        fetch(`${NTFY_URL}/${topic}`, {
            method: 'POST',
            body: JSON.stringify(obj)
        }).then(r => {
            if (r.ok) this.netTxCount = (this.netTxCount || 0) + 1;
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
                this.sendNtfySimple(this.currentNtfyRoomTopic || this.getNtfyRoomTopic(), leaveObj);
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
            try {
                this.mqttClient.publish(topic, JSON.stringify(payload), { qos: 0 });
                this.netTxCount = (this.netTxCount || 0) + 1;
            } catch (e) {}
        } else if (this.netMode === 'HTTPS') {
            this.sendNtfySimple(this.getNtfyRoomTopic(), payload);
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
            try {
                this.mqttClient.publish(topic, JSON.stringify(packet), { qos: 0 });
                this.netTxCount = (this.netTxCount || 0) + 1;
            } catch (e) {}
        } else if (this.netMode === 'HTTPS') {
            const topic = (type === 'chat_global') ? NTFY_GLOBAL_TOPIC : this.getNtfyRoomTopic();
            this.sendNtfySimple(topic, packet);
        }
    },

    updateFirebaseSync(dt) {
        if (!this.fbConnected) return;

        const isMoving = Math.hypot(this.joyVec.x, this.joyVec.y) > 0.08 ||
            this.keys['KeyW'] || this.keys['KeyA'] || this.keys['KeyS'] || this.keys['KeyD'] ||
            this.keys['ArrowUp'] || this.keys['ArrowDown'] || this.keys['ArrowLeft'] || this.keys['ArrowRight'];
        const syncInterval = (this.netMode === 'MQTT') ? (isMoving ? 0.25 : 2.0) : (isMoving ? 2.5 : 4.5);

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

        this.netRxCount = (this.netRxCount || 0) + 1;

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
        document.getElementById('title-btn-toggle-online')?.addEventListener('click', () => this.toggleOnlineMode());

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

        document.getElementById('btn-title-start')?.addEventListener('click', () => this.enterGameFromTitle());

        document.getElementById('btn-title-cloud')?.addEventListener('click', () => {
            sfx.init();
            this.inTitleScreen = false;
            document.getElementById('title-screen')?.classList.add('hidden');
            this.openGrowthModal('online');
        });

        document.getElementById('btn-title-hard-reset')?.addEventListener('click', () => {
            sfx.init();
            this.openDialog('💥 データの完全初期化', 'すべてのデータを消去して最初から始めますか？', [
                { text: 'キャンセル', primary: false },
                { text: '💥 完全に初期化する', primary: true, onClick: () => this.hardResetGame() }
            ]);
        });

        document.getElementById('btn-hud-online-toggle')?.addEventListener('click', (e) => { e.stopPropagation(); this.toggleOnlineMode(); });
        document.getElementById('btn-hud-room-lock')?.addEventListener('click', (e) => { e.stopPropagation(); sfx.init(); this.openGrowthModal('online'); });
        document.getElementById('btn-open-travel')?.addEventListener('click', (e) => { e.stopPropagation(); sfx.init(); this.openGrowthModal('travel'); });
        document.getElementById('btn-open-growth')?.addEventListener('click', (e) => { e.stopPropagation(); sfx.init(); this.openGrowthModal('stats'); });
        document.getElementById('btn-close-modal')?.addEventListener('click', () => this.closeGrowthModal());
        document.getElementById('growth-modal')?.addEventListener('click', (e) => { if (e.target.id === 'growth-modal') this.closeGrowthModal(); });

        document.getElementById('btn-toggle-drawer')?.addEventListener('click', (e) => {
            e.stopPropagation(); sfx.init();
            document.getElementById('hud-drawer-menu')?.classList.toggle('hidden');
            document.getElementById('emote-palette')?.classList.add('hidden');
        });

        document.getElementById('btn-toggle-emote')?.addEventListener('click', (e) => {
            e.stopPropagation(); sfx.init();
            document.getElementById('emote-palette')?.classList.toggle('hidden');
            document.getElementById('hud-drawer-menu')?.classList.add('hidden');
        });

        document.getElementById('btn-exec-warp')?.addEventListener('click', (e) => {
            e.stopPropagation(); sfx.init(); sfx.playSkill();
            if (this.currentZoneId === 'town') this.openGrowthModal('travel');
            else { this.loadZone('town'); this.showAlertBanner('🏠 始まりの顔文字広場へ帰還しました！', 1600); }
        });

        document.getElementById('btn-toggle-autohunt')?.addEventListener('click', (e) => {
            e.stopPropagation(); sfx.init();
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

        document.getElementById('btn-open-cloud')?.addEventListener('click', (e) => { e.stopPropagation(); sfx.init(); this.openGrowthModal('online'); });
        document.getElementById('btn-manual-save')?.addEventListener('click', (e) => { e.stopPropagation(); this.saveGame(true); document.getElementById('hud-drawer-menu')?.classList.add('hidden'); });
        document.getElementById('btn-toggle-bgm')?.addEventListener('click', (e) => {
            e.stopPropagation(); sfx.init();
            sfx.bgmMuted = !sfx.bgmMuted;
            e.currentTarget.textContent = sfx.bgmMuted ? '🔇 BGM:OFF' : '🔊 BGM:ON';
        });
        document.getElementById('btn-back-title')?.addEventListener('click', (e) => {
            e.stopPropagation(); sfx.init();
            document.getElementById('hud-drawer-menu')?.classList.add('hidden');
            this.saveGame(false);
            this.showTitleScreen();
        });
        document.getElementById('btn-reset-save')?.addEventListener('click', (e) => {
            e.stopPropagation(); sfx.init();
            document.getElementById('hud-drawer-menu')?.classList.add('hidden');
            this.openDialog('💥 データの完全初期化', '本当にすべてのデータを削除して最初からやり直しますか？', [
                { text: 'キャンセル', primary: false },
                { text: '💥 完全に初期化する', primary: true, onClick: () => this.hardResetGame() }
            ]);
        });

        document.getElementById('btn-toggle-chat')?.addEventListener('click', (e) => {
            e.stopPropagation(); sfx.init();
            this.chatCollapsed = !this.chatCollapsed;
            document.getElementById('chat-panel')?.classList.toggle('hidden', this.chatCollapsed);
        });
        document.getElementById('btn-chat-tab-global')?.addEventListener('click', (e) => { e.stopPropagation(); this.chatTab = 'global'; this.renderChatMessages(); });
        document.getElementById('btn-chat-tab-room')?.addEventListener('click', (e) => { e.stopPropagation(); this.chatTab = 'room'; this.renderChatMessages(); });
        document.querySelectorAll('.chat-quick-chip').forEach(btn => {
            btn.addEventListener('click', (e) => { e.stopPropagation(); this.sendChatMessage(btn.dataset.msg || btn.textContent); });
        });

        const chatInp = document.getElementById('input-chat-msg');
        document.getElementById('btn-send-chat')?.addEventListener('click', (e) => {
            e.stopPropagation(); if (!chatInp) return;
            this.sendChatMessage(chatInp.value); chatInp.value = '';
        });
        chatInp?.addEventListener('keydown', (e) => {
            e.stopPropagation();
            if (e.key === 'Enter') { e.preventDefault(); this.sendChatMessage(chatInp.value); chatInp.value = ''; }
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

        document.getElementById('btn-cycle-target')?.addEventListener('click', (e) => { e.stopPropagation(); sfx.init(); if (this.cycleTarget) this.cycleTarget(); });

        this.canvas?.addEventListener('click', (e) => {
            sfx.init();
            document.getElementById('hud-drawer-menu')?.classList.add('hidden');
            document.getElementById('emote-palette')?.classList.add('hidden');
            if (!this.useWebGL || !this.camera || this.monsters.length === 0) return;
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            let bestM = null, bestDist = 52;
            this.monsters.forEach(m => {
                if (m.dead) return;
                const sc = this.projectToScreen(new THREE.Vector3(m.pos.x, (m.scale || 1) * 1.1, m.pos.z));
                if (!sc) return;
                const d = Math.hypot(sc.x - clickX, sc.y - clickY);
                if (d < bestDist) { bestDist = d; bestM = m; }
            });
            if (bestM) { this.selectedTarget = bestM; sfx.playTone(620, 'sine', 0.08, 0.06); }
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
        const joyZone = document.getElementById('joystick-zone');
        const joyKnob = document.getElementById('joystick-knob');
        if (joyZone && joyKnob) {
            let joyActive = false, joyTouchId = null;
            const maxR = 38;
            const updateJoy = (cx0, cy0) => {
                const rect = joyZone.getBoundingClientRect();
                let dx = cx0 - (rect.left + rect.width / 2);
                let dy = cy0 - (rect.top + rect.height / 2);
                const dist = Math.hypot(dx, dy);
                if (dist > maxR) { dx = (dx / dist) * maxR; dy = (dy / dist) * maxR; }
                joyKnob.style.transform = `translate(${dx}px, ${dy}px)`;
                this.joyVec.x = dx / maxR; this.joyVec.y = dy / maxR;
            };
            const resetJoy = () => {
                joyActive = false; joyTouchId = null;
                joyKnob.style.transform = 'translate(0px, 0px)';
                this.joyVec.x = 0; this.joyVec.y = 0;
            };
            joyZone.addEventListener('touchstart', (e) => {
                e.preventDefault(); e.stopPropagation(); sfx.init();
                const t = e.changedTouches[0];
                joyActive = true; joyTouchId = t.identifier;
                updateJoy(t.clientX, t.clientY);
            }, { passive: false });
            window.addEventListener('touchmove', (e) => {
                if (!joyActive) return;
                for (let i = 0; i < e.changedTouches.length; i++) {
                    if (e.changedTouches[i].identifier === joyTouchId) { updateJoy(e.changedTouches[i].clientX, e.changedTouches[i].clientY); break; }
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
            joyZone.addEventListener('mousedown', (e) => { e.preventDefault(); sfx.init(); joyActive = true; updateJoy(e.clientX, e.clientY); });
            window.addEventListener('mousemove', (e) => { if (joyActive) updateJoy(e.clientX, e.clientY); });
            window.addEventListener('mouseup', () => { if (joyActive) resetJoy(); });
        }

        // 右手3Dカメラ回転（同時タッチ対応）
        if (this.canvas) {
            let camDragging = false, camTouchId = null, lastX = 0, lastY = 0, pinchDist = 0;
            this.canvas.addEventListener('mousedown', (e) => { camDragging = true; lastX = e.clientX; lastY = e.clientY; });
            window.addEventListener('mousemove', (e) => {
                if (!camDragging) return;
                this.camYaw -= (e.clientX - lastX) * 0.007;
                this.camPitch = Math.max(0.18, Math.min(1.15, this.camPitch + (e.clientY - lastY) * 0.006));
                lastX = e.clientX; lastY = e.clientY;
            });
            window.addEventListener('mouseup', () => { camDragging = false; });
            this.canvas.addEventListener('wheel', (e) => { e.preventDefault(); this.camDist = Math.max(7.5, Math.min(26.0, this.camDist + e.deltaY * 0.01)); }, { passive: false });
            this.canvas.addEventListener('touchstart', (e) => {
                sfx.init();
                if (e.targetTouches.length === 1) {
                    const t = e.targetTouches[0];
                    camDragging = true; camTouchId = t.identifier; lastX = t.clientX; lastY = t.clientY; pinchDist = 0;
                } else if (e.targetTouches.length >= 2) {
                    camDragging = false; camTouchId = null;
                    pinchDist = Math.hypot(e.targetTouches[0].clientX - e.targetTouches[1].clientX, e.targetTouches[0].clientY - e.targetTouches[1].clientY);
                }
            }, { passive: true });
            this.canvas.addEventListener('touchmove', (e) => {
                if (e.targetTouches.length === 1 && camDragging) {
                    let t = null;
                    for (let i = 0; i < e.targetTouches.length; i++) { if (e.targetTouches[i].identifier === camTouchId) { t = e.targetTouches[i]; break; } }
                    if (!t) { t = e.targetTouches[0]; camTouchId = t.identifier; lastX = t.clientX; lastY = t.clientY; return; }
                    this.camYaw -= (t.clientX - lastX) * 0.0085;
                    this.camPitch = Math.max(0.18, Math.min(1.15, this.camPitch + (t.clientY - lastY) * 0.007));
                    lastX = t.clientX; lastY = t.clientY;
                } else if (e.targetTouches.length >= 2) {
                    const newDist = Math.hypot(e.targetTouches[0].clientX - e.targetTouches[1].clientX, e.targetTouches[0].clientY - e.targetTouches[1].clientY);
                    if (pinchDist > 0) this.camDist = Math.max(7.5, Math.min(26.0, this.camDist - (newDist - pinchDist) * 0.03));
                    pinchDist = newDist;
                }
            }, { passive: true });
            this.canvas.addEventListener('touchend', (e) => {
                if (e.targetTouches.length === 0) { camDragging = false; camTouchId = null; pinchDist = 0; }
                else if (e.targetTouches.length === 1) { const t = e.targetTouches[0]; camDragging = true; camTouchId = t.identifier; lastX = t.clientX; lastY = t.clientY; pinchDist = 0; }
            });
            this.canvas.addEventListener('touchcancel', () => { camDragging = false; camTouchId = null; pinchDist = 0; });
        }

        window.addEventListener('pagehide', () => { this.closeAllNet(true); });
    }
});

// オンラインタブにリアルタイム通信診断モニターを追加表示
if (typeof KaomojiMMORPG !== 'undefined' && KaomojiMMORPG.prototype.renderModalContent) {
    const _origRenderModal = KaomojiMMORPG.prototype.renderModalContent;
    KaomojiMMORPG.prototype.renderModalContent = function () {
        _origRenderModal.call(this);
        if (this.activeTab === 'online') {
            const body = document.getElementById('modal-body');
            if (!body) return;
            const diagHtml = `
                <div class="card-box" style="margin-bottom:8px;border-color:#fde047;background:rgba(30,41,59,0.92);">
                    <div class="flex-between">
                        <span style="font-size:11px;font-weight:900;color:#fde047;">📡 通信診断モニター: ${this.netBrokerName || '待機中'}</span>
                        <button type="button" id="btn-diag-ping" class="btn-ui btn-amber" style="padding:4px 8px;font-size:10px;">🔄 再接続＆送信テスト</button>
                    </div>
                    <div style="font-size:10px;color:#cbd5e1;margin-top:4px;">
                        送信回数: <b>${this.netTxCount || 0}</b>回 ／ 受信回数: <b>${this.netRxCount || 0}</b>回
                        ${this.netLastErr ? `<br><span style="color:#fb7185;">エラー詳細: ${this.netLastErr}</span>` : ''}
                    </div>
                </div>
            `;
            body.insertAdjacentHTML('afterbegin', diagHtml);
            document.getElementById('btn-diag-ping')?.addEventListener('click', () => {
                sfx.init();
                this.connectHybridOnline(false);
            });
        }
    };
}

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
