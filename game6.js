'use strict';

// =========================================================================
// 顔文字ファンタジー3D オンライン共闘通信 (MQTT / Firebase) & 引継ぎ (game6.js)
// =========================================================================

Object.assign(KaomojiMMORPG.prototype, {
    toggleOnlineFromHud() {
        const d = this.saveData;
        if (this.fbConnected) {
            d.onlineEnabled = false;
            this.saveGame(false);
            this.disconnectFirebase();
            this.showAlertBanner('📴 オフラインモードに切り替えました', 1500);
        } else {
            d.onlineEnabled = true;
            this.saveGame(false);
            this.connectFirebase(d.firebaseUrl, false);
        }
    },

    updateOnlineHudButtons() {
        const onBtn = document.getElementById('btn-hud-online-toggle');
        const lockBtn = document.getElementById('btn-hud-room-lock');
        const d = this.saveData;

        if (onBtn) {
            if (this.fbConnected) {
                const cnt = this.remotePlayers ? this.remotePlayers.size : 0;
                onBtn.textContent = `🌐 オンライン(${cnt + 1})`;
                onBtn.className = 'btn-ui btn-emerald';
            } else {
                onBtn.textContent = '📴 オフライン';
                onBtn.className = 'btn-ui btn-slate';
            }
        }
        if (lockBtn) {
            if (this.fbConnected) {
                lockBtn.classList.remove('hidden');
                if (d.roomPassEnabled) {
                    lockBtn.textContent = '🔒 合言葉部屋';
                    lockBtn.className = 'btn-ui btn-amber';
                } else {
                    lockBtn.textContent = '🔓 公開';
                    lockBtn.className = 'btn-ui btn-slate';
                }
            } else {
                lockBtn.classList.add('hidden');
            }
        }
    },

    connectFirebase(customUrl = '', silent = false) {
        this.disconnectFirebase();

        const cleanUrl = String(customUrl || this.saveData.firebaseUrl || '').trim().replace(/\/+$/, '');
        this.saveData.onlineEnabled = true;

        if (cleanUrl && /^https?:\/\//.test(cleanUrl)) {
            this._netMode = 'firebase';
            this._fbBaseUrl = cleanUrl;
            this.fbConnected = true;
            this.updateOnlineHudButtons();
            if (!silent) this.showAlertBanner('🌐 Firebaseオンラインに接続しました！', 1800);
            this.sendFirebasePresence();
            return;
        }

        if (typeof mqtt !== 'undefined') {
            try {
                this._netMode = 'mqtt';
                const roomKey = this.getCurrentRoomKey();
                this._mqttRoomTopic = `kaomoji_fantasy_3d/v4/room/${encodeURIComponent(roomKey)}`;
                this._mqttGlobalTopic = `kaomoji_fantasy_3d/v4/global`;

                const clientId = 'kmj_' + (this.saveData.playerUid || Math.random().toString(36).slice(2, 10));
                this._mqttClient = mqtt.connect('wss://broker.emqx.io:8084/mqtt', {
                    clientId,
                    clean: true,
                    connectTimeout: 6000,
                    reconnectPeriod: 4000
                });

                this._mqttClient.on('connect', () => {
                    this.fbConnected = true;
                    this._mqttClient.subscribe(this._mqttRoomTopic);
                    this._mqttClient.subscribe(this._mqttGlobalTopic);
                    this.updateOnlineHudButtons();
                    if (!silent) {
                        const modeLabel = this.saveData.roomPassEnabled ? '🔒 合言葉部屋' : '🔓 公開ロビー';
                        this.showAlertBanner(`🌐 オンライン共闘に接続しました！（${modeLabel}）`, 2000);
                    }
                    this.sendFirebasePresence();
                });

                this._mqttClient.on('message', (topic, payloadBuf) => {
                    try {
                        const msg = JSON.parse(payloadBuf.toString());
                        if (!msg || msg.uid === this.saveData.playerUid) return;
                        if (topic === this._mqttGlobalTopic) {
                            if (msg.type === 'chat_global') {
                                this.addChatMessage('global', msg.kaomoji, msg.name, msg.text, false);
                            }
                        } else if (topic === this._mqttRoomTopic) {
                            this.handleRemotePacket(msg);
                        }
                    } catch (e) {}
                });

                this._mqttClient.on('error', () => {
                    this.updateOnlineHudButtons();
                });
            } catch (e) {
                console.warn('MQTT connect failed:', e);
                this.fbConnected = false;
                this.updateOnlineHudButtons();
            }
        } else {
            this.fbConnected = false;
            this.updateOnlineHudButtons();
            if (!silent) this.showAlertBanner('⚠️ 通信ライブラリが読み込めませんでした', 1800);
        }
    },

    disconnectFirebase() {
        if (this._mqttClient) {
            try {
                if (this._mqttRoomTopic) {
                    this._mqttClient.publish(this._mqttRoomTopic, JSON.stringify({
                        type: 'leave',
                        uid: this.saveData.playerUid
                    }));
                }
                this._mqttClient.end(true);
            } catch (e) {}
            this._mqttClient = null;
        }
        if (this._netMode === 'firebase' && this._fbBaseUrl) {
            const roomKey = encodeURIComponent(this.getCurrentRoomKey());
            const uid = encodeURIComponent(this.saveData.playerUid);
            fetch(`${this._fbBaseUrl}/rooms/${roomKey}/players/${uid}.json`, { method: 'DELETE' }).catch(() => {});
        }
        this.fbConnected = false;
        this._netMode = null;

        if (this.remotePlayers) {
            this.remotePlayers.forEach(rp => {
                if (rp.group && this.scene) this.scene.remove(rp.group);
                if (rp.plateEl) rp.plateEl.remove();
            });
            this.remotePlayers.clear();
        }
        this.updateOnlineHudButtons();
    },

    buildPresencePayload() {
        const d = this.saveData;
        return {
            type: 'presence',
            uid: d.playerUid,
            ts: Date.now(),
            zoneId: this.towerState.active ? `tower_${this.towerState.floor}` : this.currentZoneId,
            lv: d.lv,
            kaomoji: this.getBasePlayerKaomoji(),
            bodyColor: d.bodyColor || '',
            faceBgColor: this.getPlayerFaceBgHex(),
            evolutionId: d.evolutionId || 'novice',
            x: this.player ? Number(this.player.pos.x.toFixed(2)) : 0,
            z: this.player ? Number(this.player.pos.z.toFixed(2)) : 4,
            rotY: this.player ? Number(this.player.rotY.toFixed(2)) : 0
        };
    },

    sendFirebasePresence() {
        if (!this.fbConnected) return;
        const payload = this.buildPresencePayload();
        if (this._netMode === 'mqtt' && this._mqttClient && this._mqttClient.connected) {
            this._mqttClient.publish(this._mqttRoomTopic, JSON.stringify(payload));
        } else if (this._netMode === 'firebase' && this._fbBaseUrl) {
            const roomKey = encodeURIComponent(this.getCurrentRoomKey());
            const uid = encodeURIComponent(this.saveData.playerUid);
            fetch(`${this._fbBaseUrl}/rooms/${roomKey}/players/${uid}.json`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            }).catch(() => {});
        }
    },

    broadcastFirebaseEvent(eventType, extra = {}) {
        if (!this.fbConnected) return;
        const packet = {
            type: eventType,
            uid: this.saveData.playerUid,
            ts: Date.now(),
            ...extra
        };

        if (this._netMode === 'mqtt' && this._mqttClient && this._mqttClient.connected) {
            const topic = eventType === 'chat_global' ? this._mqttGlobalTopic : this._mqttRoomTopic;
            this._mqttClient.publish(topic, JSON.stringify(packet));
        } else if (this._netMode === 'firebase' && this._fbBaseUrl) {
            const path = eventType === 'chat_global'
                ? `${this._fbBaseUrl}/global_events.json`
                : `${this._fbBaseUrl}/rooms/${encodeURIComponent(this.getCurrentRoomKey())}/events.json`;
            fetch(path, {
                method: 'POST',
                body: JSON.stringify(packet)
            }).catch(() => {});
        }
    },

    handleRemotePacket(pkt) {
        if (!pkt || pkt.uid === this.saveData.playerUid) return;
        if (pkt.type === 'presence') {
            this.upsertRemotePlayer(pkt.uid, pkt);
        } else if (pkt.type === 'leave') {
            this.removeRemotePlayer(pkt.uid);
        } else if (pkt.type === 'chat_room') {
            this.addChatMessage('room', pkt.kaomoji, pkt.name, pkt.text, false);
        } else if (pkt.type === 'kill') {
            if (this.receiveCoopReward) this.receiveCoopReward(pkt);
        } else if (pkt.type === 'emote') {
            const rp = this.remotePlayers.get(pkt.uid);
            if (rp && rp.visible && this.spawnEmoteBubble) {
                this.spawnEmoteBubble(rp.pos.clone().add(new THREE.Vector3(0, 2.6, 0)), pkt.kaomoji, pkt.msg);
            }
        }
    },

    upsertRemotePlayer(uid, data) {
        const myZone = this.towerState.active ? `tower_${this.towerState.floor}` : this.currentZoneId;
        const sameZone = (data.zoneId === myZone);
        let rp = this.remotePlayers.get(uid);

        if (!rp) {
            const group = new THREE.Group();
            let faceMesh = null;
            let bodyMesh = null;
            if (this.useWebGL) {
                const evo = EVOLUTIONS[data.evolutionId] || EVOLUTIONS.novice;
                const hex = (data.bodyColor && /^#[0-9a-fA-F]{6}$/.test(data.bodyColor))
                    ? parseInt(data.bodyColor.slice(1), 16)
                    : (evo.hexColor || 0x38bdf8);

                bodyMesh = new THREE.Mesh(
                    new THREE.BoxGeometry(1.2, 1.3, 1.0),
                    new THREE.MeshStandardMaterial({ color: hex, roughness: 0.4 })
                );
                bodyMesh.position.y = 0.82;
                group.add(bodyMesh);

                const tex = getKaomojiFaceTexture(data.kaomoji || '(´・ω・`)', data.faceBgColor || '#073b66', '#ffffff', '#34d399');
                faceMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.08, 0.82), new THREE.MeshBasicMaterial({ map: tex }));
                faceMesh.position.set(0, 0.92, 0.52);
                group.add(faceMesh);

                group.position.set(data.x || 0, 0, data.z || 4);
                this.scene.add(group);
            }

            const plateEl = document.createElement('div');
            plateEl.className = 'world-plate';
            plateEl.style.borderColor = '#34d399';
            this.overlayLayer?.appendChild(plateEl);

            rp = {
                uid,
                group,
                bodyMesh,
                faceMesh,
                plateEl,
                pos: new THREE.Vector3(data.x || 0, 0, data.z || 4),
                targetPos: new THREE.Vector3(data.x || 0, 0, data.z || 4),
                rotY: data.rotY || 0,
                lastSeen: Date.now(),
                sameZone,
                visible: sameZone
            };
            this.remotePlayers.set(uid, rp);
            this.updateOnlineHudButtons();
        }

        rp.lastSeen = Date.now();
        rp.sameZone = sameZone;
        rp.visible = sameZone;
        rp.targetPos.set(data.x || 0, 0, data.z || 4);
        rp.rotY = data.rotY || 0;

        if (rp.group) rp.group.visible = sameZone;
        if (rp.plateEl) {
            rp.plateEl.innerHTML = `<div style="font-size:10px;font-weight:900;color:#6ee7b7;">🤝 Lv.${data.lv || 1} <span class="font-kaomoji">${data.kaomoji || ''}</span></div>`;
            if (!sameZone) rp.plateEl.style.display = 'none';
        }
    },

    removeRemotePlayer(uid) {
        const rp = this.remotePlayers.get(uid);
        if (!rp) return;
        if (rp.group && this.scene) this.scene.remove(rp.group);
        if (rp.plateEl) rp.plateEl.remove();
        this.remotePlayers.delete(uid);
        this.updateOnlineHudButtons();
    },

    getSameZoneRemoteCount() {
        if (!this.remotePlayers) return 0;
        let cnt = 0;
        this.remotePlayers.forEach(rp => {
            if (rp.sameZone) cnt++;
        });
        return cnt;
    },

    syncFirebaseTick(dt) {
        if (!this.fbConnected) return;

        const now = Date.now();
        for (const [uid, rp] of this.remotePlayers.entries()) {
            if (now - rp.lastSeen > 15000) {
                this.removeRemotePlayer(uid);
                continue;
            }
            rp.pos.lerp(rp.targetPos, Math.min(1, dt * 8));
            if (rp.group && rp.visible) {
                rp.group.position.copy(rp.pos);
                rp.group.rotation.y = rp.rotY;
            }
            if (rp.plateEl && rp.visible) {
                const scr = this.projectToScreen(rp.pos.clone().add(new THREE.Vector3(0, 2.1, 0)));
                if (!scr.visible) {
                    rp.plateEl.style.display = 'none';
                } else {
                    rp.plateEl.style.display = 'block';
                    rp.plateEl.style.left = `${scr.x}px`;
                    rp.plateEl.style.top = `${scr.y}px`;
                }
            }
        }

        this.fbSyncTimer = (this.fbSyncTimer || 0) + dt;
        if (this.fbSyncTimer >= 0.5) {
            this.fbSyncTimer = 0;
            this.sendFirebasePresence();
        }

        if (this._netMode === 'firebase' && this._fbBaseUrl) {
            this.fbPollTimer = (this.fbPollTimer || 0) + dt;
            if (this.fbPollTimer >= 1.2) {
                this.fbPollTimer = 0;
                const roomKey = encodeURIComponent(this.getCurrentRoomKey());
                fetch(`${this._fbBaseUrl}/rooms/${roomKey}/players.json`)
                    .then(r => r.json())
                    .then(obj => {
                        if (!obj) return;
                        Object.entries(obj).forEach(([uid, pData]) => {
                            if (uid !== this.saveData.playerUid && pData && (Date.now() - (pData.ts || 0) < 15000)) {
                                this.upsertRemotePlayer(uid, pData);
                            }
                        });
                    })
                    .catch(() => {});
            }
        }
    },

    exportSaveCode() {
        try {
            const json = JSON.stringify(this.saveData);
            return btoa(unescape(encodeURIComponent(json)));
        } catch (e) {
            return '';
        }
    },

    importSaveCode(code) {
        try {
            const json = decodeURIComponent(escape(atob(code)));
            const parsed = JSON.parse(json);
            if (!parsed || typeof parsed.lv !== 'number') throw new Error('Invalid');
            localStorage.setItem(this.saveKey, JSON.stringify(parsed));
            this.saveData = this.loadSaveData();
            this.buildPlayerEntity();
            this.buildPetEntity();
            this.loadZone('town');
            this.refreshAllHUD();
            this.closeGrowthModal();
            sfx.playLevelUp();
            this.showAlertBanner(`🎉 引継ぎコードから Lv.${this.saveData.lv} のデータを復元しました！`, 2600);
        } catch (e) {
            this.showAlertBanner('⚠️ 引継ぎコードが正しくありません', 2000);
        }
    }
});

window.addEventListener('DOMContentLoaded', () => {
    if (!window.game) {
        window.game = new KaomojiMMORPG();
    }
});
