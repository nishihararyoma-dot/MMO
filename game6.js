'use strict';

const MQTT_CDNS = [
    'https://unpkg.com/mqtt@4.3.7/dist/mqtt.min.js',
    'https://cdn.jsdelivr.net/npm/mqtt@4.3.7/dist/mqtt.min.js'
];
const MQTT_SERVERS = [
    { name: 'EMQX', url: 'wss://broker.emqx.io:8084/mqtt' },
    { name: 'HiveMQ', url: 'wss://broker.hivemq.com:8884/mqtt' },
    { name: 'Mosquitto', url: 'wss://test.mosquitto.org:8081/mqtt' }
];
const TOPIC_GLOBAL = 'kaomoji_fantasy_3d/v10/global';

const LOADING_KAOMOJIS = ['(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧', 'ε=ε=ε=┏(゜ロ゜;)┛', '(ง •̀_•́)ง ⚔️', '✧*｡٩(ˊᗜˋ*)و✧*｡', '(╯°□°）╯︵ ┻━┻'];
const LOADING_TIPS = [
    '💡 チャットやエモートを送るとキャラの頭上に吹き出しが出るよ！',
    '💡 ちゃぶ台返しなどのスキルも仲間の画面に3Dで表示されるよ！',
    '💡 左手で移動しながら右手で画面をなぞると視点を自由に回せるよ！',
    '💡 パスワード部屋を設定すると合言葉を知っている友達だけで遊べるよ！'
];

(function injectV10Styles() {
    if (document.getElementById('kmj-v10-style')) return;
    const st = document.createElement('style');
    st.id = 'kmj-v10-style';
    st.textContent = `
        #kmj-loading-screen{position:fixed;inset:0;z-index:96;background:radial-gradient(circle at center,#0f172a 0%,#020617 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:24px;transition:opacity .28s ease;pointer-events:auto}
        #kmj-loading-screen.fade-out{opacity:0;pointer-events:none}
        .kmj-load-kao{font-size:32px;font-weight:900;color:#38bdf8;text-shadow:0 0 18px rgba(56,189,248,.8);animation:kmjBounce .6s infinite alternate}
        .kmj-load-bar-bg{width:min(300px,80vw);height:10px;background:#1e293b;border:1px solid #38bdf8;border-radius:999px;overflow:hidden}
        .kmj-load-bar-fill{height:100%;width:0%;background:linear-gradient(90deg,#38bdf8,#f472b6,#fde047);transition:width .25s ease}
        @keyframes kmjBounce{from{transform:translateY(0)}to{transform:translateY(-8px)}}
        .world-head-bubble{position:absolute;transform:translate(-50%,-100%);background:rgba(15,23,42,.96);border:2px solid #38bdf8;border-radius:14px;padding:5px 11px;text-align:center;box-shadow:0 6px 18px rgba(0,0,0,.7);pointer-events:none!important;max-width:220px;word-break:break-word;z-index:14;animation:kmjPop .18s ease-out}
        .world-head-bubble.is-emote{border-color:#f472b6;background:rgba(30,15,42,.96)}
        .world-head-bubble::after{content:'';position:absolute;bottom:-7px;left:50%;transform:translateX(-50%);border-width:7px 6px 0;border-style:solid;border-color:#38bdf8 transparent transparent}
        .world-head-bubble.is-emote::after{border-color:#f472b6 transparent transparent}
        @keyframes kmjPop{from{transform:translate(-50%,-85%) scale(.75);opacity:0}to{transform:translate(-50%,-100%) scale(1);opacity:1}}
    `;
    document.head.appendChild(st);
})();

Object.assign(KaomojiMMORPG.prototype, {

    showLoadingOverlay(titleText = 'NOW LOADING...', durationMs = 950) {
        let el = document.getElementById('kmj-loading-screen');
        if (!el) {
            el = document.createElement('div');
            el.id = 'kmj-loading-screen';
            el.innerHTML = `
                <div id="kmj-load-kao" class="kmj-load-kao font-kaomoji">(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧</div>
                <div id="kmj-load-title" style="font-size:16px;font-weight:900;color:#fde047;letter-spacing:1px;">NOW LOADING...</div>
                <div class="kmj-load-bar-bg"><div id="kmj-load-fill" class="kmj-load-bar-fill"></div></div>
                <div id="kmj-load-tip" style="font-size:11px;color:#cbd5e1;text-align:center;max-width:320px;line-height:1.45;"></div>
            `;
            document.body.appendChild(el);
        }
        el.classList.remove('hidden', 'fade-out');
        const kaoEl = document.getElementById('kmj-load-kao');
        const titleEl = document.getElementById('kmj-load-title');
        const fillEl = document.getElementById('kmj-load-fill');
        const tipEl = document.getElementById('kmj-load-tip');
        if (kaoEl) kaoEl.textContent = LOADING_KAOMOJIS[Math.floor(Math.random() * LOADING_KAOMOJIS.length)];
        if (titleEl) titleEl.textContent = titleText;
        if (tipEl) tipEl.textContent = LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)];
        if (fillEl) {
            fillEl.style.width = '18%';
            setTimeout(() => { if (fillEl) fillEl.style.width = '68%'; }, Math.floor(durationMs * 0.3));
            setTimeout(() => { if (fillEl) fillEl.style.width = '100%'; }, Math.floor(durationMs * 0.75));
        }
        clearTimeout(this._loadHideTimer);
        this._loadHideTimer = setTimeout(() => {
            el.classList.add('fade-out');
            setTimeout(() => el.classList.add('hidden'), 280);
        }, durationMs);
    },

    getDeviceUid() {
        if (this._runtimeUid) return this._runtimeUid;
        let salt = '';
        try {
            salt = localStorage.getItem('kmj_dev_salt_v10');
            if (!salt) {
                salt = Math.random().toString(36).slice(2, 8);
                localStorage.setItem('kmj_dev_salt_v10', salt);
            }
        } catch (e) {
            salt = Math.random().toString(36).slice(2, 8);
        }
        this._runtimeUid = `${this.saveData.playerUid || 'p'}_${salt}`;
        return this._runtimeUid;
    },

    getRoomTopic() {
        const d = this.saveData;
        if (!d.roomPassEnabled) return 'kaomoji_fantasy_3d/v10/room/PUBLIC';
        const p = String(d.roomPassword || '').trim();
        let hex = '';
        for (let i = 0; i < p.length; i++) hex += p.charCodeAt(i).toString(16);
        return 'kaomoji_fantasy_3d/v10/room/PASS_' + (hex || 'EMPTY');
    },

    getSafeRoomKey() {
        if (this.getCurrentRoomKey) return this.getCurrentRoomKey();
        return this.saveData.roomPassEnabled ? 'PASS_' + (this.saveData.roomPassword || '') : 'PUBLIC_OPEN_ROOM';
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

    // 3秒ごとに未接続・切断を監視して自動再接続する常駐タイマー
    startAutoReconnectWatchdog() {
        if (this._reconnWatchdog) return;
        this._reconnWatchdog = setInterval(() => {
            if (!this.saveData || !this.saveData.onlineEnabled) return;
            const activeCount = this.getConnectedServerNames().length;
            if (activeCount === 0) {
                this.fbConnected = false;
                this.netStatusLabel = '⏳ 自動再接続中...';
                this.refreshAllHUD();
                if (!this._isConnectingNow) {
                    this.connectMqttStart(true);
                }
            } else {
                this.fbConnected = true;
            }
        }, 3000);
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
        this.startAutoReconnectWatchdog();
        if (this._isConnectingNow) return;
        this._isConnectingNow = true;
        setTimeout(() => { this._isConnectingNow = false; }, 2600);

        this.stopMqtt(false);
        this.saveData.onlineEnabled = true;
        this.fbConnected = false;
        this.netStatusLabel = '⏳ 自動接続中...';
        this.netTxCount = 0;
        this.netEchoCount = 0;
        this.netRxCount = 0;
        this.mqttClients = [];
        this.refreshTitleScreen();
        this.refreshAllHUD();

        this.loadMqttLib((ok) => {
            if (!this.saveData.onlineEnabled) { this._isConnectingNow = false; return; }
            if (!ok) {
                this._isConnectingNow = false;
                this.netStatusLabel = '⚠️ 通信読込再試行...';
                this.refreshAllHUD();
                return;
            }
            const rTopic = this.getRoomTopic();
            this.curRoomTopic = rTopic;
            const myUid = this.getDeviceUid();

            MQTT_SERVERS.forEach((sv, idx) => {
                try {
                    const c = window.mqtt.connect(sv.url, {
                        clientId: 'kmj10_' + myUid + '_' + idx + '_' + Math.random().toString(36).slice(2, 5),
                        clean: true,
                        keepalive: 15,
                        connectTimeout: 4500,
                        reconnectPeriod: 2000,
                        will: { topic: rTopic, payload: JSON.stringify({ type: 'leave', uid: myUid, ts: Date.now() }), qos: 0 }
                    });
                    c._svName = sv.name;
                    this.mqttClients.push(c);

                    c.on('connect', () => {
                        this._isConnectingNow = false;
                        if (!this.saveData.onlineEnabled) {
                            try { c.end(true); } catch (e) {}
                            return;
                        }
                        const wasConnected = this.fbConnected;
                        this.fbConnected = true;
                        this.netStatusLabel = '';

                        c.subscribe([TOPIC_GLOBAL, rTopic], { qos: 0 }, () => {
                            this.syncFirebaseNow(true);
                            setTimeout(() => { if (this.fbConnected) this.syncFirebaseNow(true); }, 500);
                            setTimeout(() => { if (this.fbConnected) this.syncFirebaseNow(true); }, 1400);
                        });

                        this.refreshTitleScreen();
                        this.refreshAllHUD();
                        if (this.isModalOpen && this.activeTab === 'online') this.renderModalContent();
                        if (!wasConnected && !silent) {
                            sfx.playHeal();
                            this.showAlertBanner(`🌐 オンライン接続完了！（${sv.name}）`, 2000);
                        }
                    });

                    c.on('message', (topic, buf) => {
                        try {
                            const msg = JSON.parse(buf.toString());
                            this.onMqttPacket(topic, msg);
                        } catch (e) {}
                    });

                    c.on('close', () => {
                        if (this.getConnectedServerNames().length === 0) {
                            this.fbConnected = false;
                            if (this.saveData.onlineEnabled) this.netStatusLabel = '⏳ 再接続中...';
                            this.refreshAllHUD();
                        }
                    });
                } catch (e) {}
            });
        });
    },

    getConnectedServerNames() {
        if (!this.mqttClients) return [];
        return this.mqttClients.filter(c => c && c.connected).map(c => c._svName);
    },

    reconnectMqttRoom() {
        if (!this.saveData.onlineEnabled) return;
        this.clearRemotePlayers();
        this._isConnectingNow = false;
        this.connectMqttStart(true);
    },

    stopMqtt(sendLeave = true) {
        const myUid = this.getDeviceUid();
        if (this.mqttClients) {
            this.mqttClients.forEach(c => {
                try {
                    if (sendLeave && c.connected && this.curRoomTopic) {
                        c.publish(this.curRoomTopic, JSON.stringify({ type: 'leave', uid: myUid, ts: Date.now() }));
                    }
                    c.end(true);
                } catch (e) {}
            });
        }
        this.mqttClients = [];
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

    publishAllConnected(topic, obj) {
        if (!this.mqttClients) return;
        const raw = JSON.stringify(obj);
        let sent = false;
        this.mqttClients.forEach(c => {
            if (c && c.connected) {
                try {
                    c.publish(topic, raw, { qos: 0 });
                    sent = true;
                } catch (e) {}
            }
        });
        if (sent) this.netTxCount = (this.netTxCount || 0) + 1;
    },

    syncFirebaseNow(isHello = false) {
        if (!this.fbConnected) return;
        const rTopic = this.getRoomTopic();
        if (this.curRoomTopic && this.curRoomTopic !== rTopic) {
            this.reconnectMqttRoom();
            return;
        }
        const d = this.saveData;
        const payload = {
            type: isHello ? 'hello' : 'sync',
            uid: this.getDeviceUid(),
            roomKey: this.getSafeRoomKey(),
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
        this.publishAllConnected(rTopic, payload);
    },

    broadcastFirebaseEvent(type, payload) {
        if (!this.fbConnected) return;
        const topic = (type === 'chat_global') ? TOPIC_GLOBAL : this.getRoomTopic();
        const packet = {
            type,
            senderUid: this.getDeviceUid(),
            roomKey: this.getSafeRoomKey(),
            payload,
            ts: Date.now()
        };
        this.publishAllConnected(topic, packet);
    },

    // 頭上追従吹き出し（自分＆マルチの仲間のチャット・エモート両対応）
    spawnHeadBubble(isSelf, uid, kaomoji, text, isEmote = false) {
        if (!this.overlayLayer) return;
        const cleanText = String(text || '').trim();
        if (!cleanText && !isEmote) return;

        if (!this._headBubbles) this._headBubbles = [];
        const key = isSelf ? 'SELF' : String(uid);
        this._headBubbles = this._headBubbles.filter(b => {
            if (b.key === key) { b.el.remove(); return false; }
            return true;
        });

        const el = document.createElement('div');
        el.className = 'world-head-bubble' + (isEmote ? ' is-emote' : '');
        const safeText = cleanText.replace(/[<>&"]/g, '');
        const safeKao = String(kaomoji || '').replace(/[<>&"]/g, '');
        if (isEmote) {
            el.innerHTML = `<div class="font-kaomoji" style="font-size:15px;font-weight:900;color:#f472b6;">${safeKao}</div><div style="font-size:10px;font-weight:900;color:#fff;margin-top:1px;">${safeText}</div>`;
        } else {
            el.innerHTML = `<div style="font-size:11px;font-weight:900;color:#fff;">💬 ${safeText}</div>`;
        }
        this.overlayLayer.appendChild(el);
        this._headBubbles.push({ key, isSelf, uid, el, life: 4.5 });
    },

    updateHeadBubbles(dt) {
        if (!this._headBubbles || !this._headBubbles.length) return;
        this._headBubbles = this._headBubbles.filter(b => {
            b.life -= dt;
            if (b.life <= 0) { b.el.remove(); return false; }
            let target = null;
            let scale = 1.0;
            if (b.isSelf && this.player) {
                target = this.player.pos;
                scale = this.getPlayerBodyScale ? this.getPlayerBodyScale() : 1.0;
            } else if (!b.isSelf) {
                const rp = this.remotePlayers.get(b.uid);
                if (rp && rp.visible) { target = rp.pos; scale = rp.bodyScale || 1.0; }
            }
            if (!target) {
                b.el.style.display = 'none';
                return true;
            }
            const worldPos = new THREE.Vector3(target.x, 2.85 * scale, target.z);
            let sc = this.projectToScreen ? this.projectToScreen(worldPos) : null;
            if (!sc && this.camera && this.canvas) {
                const v = worldPos.clone().project(this.camera);
                if (v.z < 1) {
                    sc = {
                        x: (v.x * 0.5 + 0.5) * this.canvas.clientWidth,
                        y: (-v.y * 0.5 + 0.5) * this.canvas.clientHeight
                    };
                }
            }
            if (sc) {
                b.el.style.display = 'block';
                b.el.style.left = sc.x + 'px';
                b.el.style.top = sc.y + 'px';
                b.el.style.opacity = b.life < 0.6 ? String(b.life / 0.6) : '1';
            } else {
                b.el.style.display = 'none';
            }
            return true;
        });
    },

    // 3Dちゃぶ台生成ヘルパー（ちゃぶ台返しスキル用）
    createChabudai3D() {
        const grp = new THREE.Group();
        const woodMat = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
        const darkWoodMat = new THREE.MeshLambertMaterial({ color: 0x5c2d0c });
        // 天板
        const top = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.12, 20), woodMat);
        grp.add(top);
        // 4本脚
        [[-0.55, -0.55], [0.55, -0.55], [-0.55, 0.55], [0.55, 0.55]].forEach(([lx, lz]) => {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.45, 0.11), darkWoodMat);
            leg.position.set(lx, -0.26, lz);
            grp.add(leg);
        });
        // 急須＆湯呑み
        const tea = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.22, 12), new THREE.MeshLambertMaterial({ color: 0x15803d }));
        tea.position.set(-0.2, 0.16, 0.1);
        grp.add(tea);
        const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.14, 12), new THREE.MeshLambertMaterial({ color: 0xf8fafc }));
        cup.position.set(0.25, 0.12, -0.15);
        grp.add(cup);
        return grp;
    },

    // 攻撃モーション＆スキル別3Dエフェクト（ちゃぶ台返し・火球・雷・斬撃など）
    triggerAttackVisual(entity, isSkill = false, skillInfo = null) {
        if (!entity) return;
        entity.attackAnimTimer = 0.38;
        entity.attackIsSkill = isSkill;

        if (!this.useWebGL || !this.scene || !entity.pos || typeof THREE === 'undefined') return;
        if (!this._slashEffects) this._slashEffects = [];

        const rotY = entity.rotY || 0;
        const dirX = Math.sin(rotY);
        const dirZ = Math.cos(rotY);
        const sId = String(skillInfo?.skillId || '').toLowerCase();
        const sName = String(skillInfo?.skillName || '');

        // ちゃぶ台返し判定
        if (isSkill && (sId.includes('chabu') || sId.includes('table') || sName.includes('ちゃぶ台') || sName.includes('卓'))) {
            const tableMesh = this.createChabudai3D();
            tableMesh.position.set(entity.pos.x + dirX * 0.9, 0.85, entity.pos.z + dirZ * 0.9);
            tableMesh.rotation.y = rotY;
            this.scene.add(tableMesh);
            this._slashEffects.push({
                kind: 'chabudai',
                mesh: tableMesh,
                life: 0.72,
                maxLife: 0.72,
                vx: dirX * 11.5,
                vz: dirZ * 11.5,
                rotY
            });
            return;
        }

        // その他スキル専用ビジュアル
        if (isSkill && (sName || sId)) {
            let color = 0xfde047;
            let kind = 'wave';
            if (sId.includes('heal') || sName.includes('癒') || sName.includes('回復') || sName.includes('祈')) {
                color = 0x34d399; kind = 'aura';
            } else if (sId.includes('fire') || sId.includes('meteor') || sName.includes('炎') || sName.includes('爆') || sName.includes('火')) {
                color = 0xf97316; kind = 'orb';
            } else if (sId.includes('ice') || sName.includes('氷') || sName.includes('雪')) {
                color = 0x38bdf8; kind = 'orb';
            } else if (sId.includes('thunder') || sName.includes('雷') || sName.includes('電')) {
                color = 0xfacc15; kind = 'aura';
            }

            if (kind === 'aura') {
                const geo = new THREE.CylinderGeometry(1.4, 1.4, 2.6, 20, 1, true);
                const mat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.75 });
                const mesh = new THREE.Mesh(geo, mat);
                mesh.position.set(entity.pos.x, 1.3, entity.pos.z);
                this.scene.add(mesh);
                this._slashEffects.push({ kind: 'aura', mesh, mat, life: 0.55, maxLife: 0.55 });
                return;
            } else if (kind === 'orb') {
                const geo = new THREE.SphereGeometry(0.65, 14, 14);
                const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 });
                const mesh = new THREE.Mesh(geo, mat);
                mesh.position.set(entity.pos.x + dirX * 1.0, 1.1, entity.pos.z + dirZ * 1.0);
                this.scene.add(mesh);
                this._slashEffects.push({ kind: 'orb', mesh, mat, life: 0.55, maxLife: 0.55, vx: dirX * 13, vz: dirZ * 13 });
                return;
            }
        }

        // 通常攻撃・剣技の斬撃アーク
        const geo = new THREE.RingGeometry(0.65, isSkill ? 1.75 : 1.25, 24, 1, -Math.PI * 0.45, Math.PI * 0.9);
        const mat = new THREE.MeshBasicMaterial({
            color: isSkill ? 0xfde047 : 0x38bdf8,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.92
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(entity.pos.x + dirX * 1.15, 1.05, entity.pos.z + dirZ * 1.15);
        mesh.rotation.set(Math.PI * 0.35, rotY, -0.5);
        this.scene.add(mesh);
        this._slashEffects.push({
            kind: 'slash',
            mesh,
            mat,
            life: isSkill ? 0.42 : 0.28,
            maxLife: isSkill ? 0.42 : 0.28,
            vx: isSkill ? dirX * 8.0 : 0,
            vz: isSkill ? dirZ * 8.0 : 0
        });
    },

    updateAttackAnimations(dt) {
        if (this._slashEffects && this._slashEffects.length) {
            this._slashEffects = this._slashEffects.filter(ef => {
                ef.life -= dt;
                if (ef.life <= 0) {
                    if (this.scene) this.scene.remove(ef.mesh);
                    ef.mesh.traverse?.(obj => {
                        obj.geometry?.dispose?.();
                        obj.material?.dispose?.();
                    });
                    return false;
                }
                const p = 1 - (ef.life / ef.maxLife);
                if (ef.kind === 'chabudai') {
                    ef.mesh.position.x += ef.vx * dt;
                    ef.mesh.position.z += ef.vz * dt;
                    ef.mesh.position.y = 0.85 + Math.sin(p * Math.PI) * 2.1;
                    ef.mesh.rotation.x = p * Math.PI * 3.5;
                    ef.mesh.scale.setScalar(1 + p * 0.35);
                } else if (ef.kind === 'orb') {
                    ef.mesh.position.x += ef.vx * dt;
                    ef.mesh.position.z += ef.vz * dt;
                    ef.mesh.scale.setScalar(1 + p * 0.8);
                    ef.mat.opacity = (1 - p) * 0.9;
                } else if (ef.kind === 'aura') {
                    ef.mesh.scale.set(1 + p * 0.6, 1, 1 + p * 0.6);
                    ef.mesh.rotation.y += dt * 5;
                    ef.mat.opacity = (1 - p) * 0.75;
                } else {
                    ef.mesh.position.x += (ef.vx || 0) * dt;
                    ef.mesh.position.z += (ef.vz || 0) * dt;
                    ef.mesh.scale.setScalar(1 + p * 0.55);
                    ef.mesh.rotation.z = -0.5 + p * 2.2;
                    ef.mat.opacity = (1 - p) * 0.92;
                }
                return true;
            });
        }

        const animateChar = (ent) => {
            if (!ent || !ent.group) return;
            if (ent.attackAnimTimer && ent.attackAnimTimer > 0) {
                ent.attackAnimTimer = Math.max(0, ent.attackAnimTimer - dt);
                const p = 1 - (ent.attackAnimTimer / 0.38);
                const swing = Math.sin(p * Math.PI);
                const rotY = ent.rotY || 0;
                ent.group.position.x = ent.pos.x + Math.sin(rotY) * (swing * 0.38);
                ent.group.position.z = ent.pos.z + Math.cos(rotY) * (swing * 0.38);
                ent.group.position.y = swing * 0.22;
                ent.group.rotation.y = rotY + (swing * 0.45);
                ent.group.rotation.x = swing * 0.22;

                ent.group.children.forEach((ch, i) => {
                    if (i >= 2) {
                        if (ch._origRotX === undefined) ch._origRotX = ch.rotation.x;
                        ch.rotation.x = ch._origRotX - swing * 1.45;
                    }
                });
            } else if (ent.attackAnimTimer === 0) {
                ent.attackAnimTimer = -1;
                ent.group.position.set(ent.pos.x, 0, ent.pos.z);
                ent.group.rotation.x = 0;
                ent.group.rotation.y = ent.rotY || 0;
                ent.group.children.forEach((ch, i) => {
                    if (i >= 2 && ch._origRotX !== undefined) ch.rotation.x = ch._origRotX;
                });
            }
        };

        animateChar(this.player);
        this.remotePlayers.forEach(rp => animateChar(rp));
    },

    updateFirebaseSync(dt) {
        if (!this.fbConnected) return;
        const moving = Math.hypot(this.joyVec.x, this.joyVec.y) > 0.08 ||
            this.keys['KeyW'] || this.keys['KeyA'] || this.keys['KeyS'] || this.keys['KeyD'] ||
            this.keys['ArrowUp'] || this.keys['ArrowDown'] || this.keys['ArrowLeft'] || this.keys['ArrowRight'];
        this.fbSyncTimer += dt;
        // 切断防止のため静止中でも1.5秒ごとにキープアライブ送信
        if (this.fbSyncTimer >= (moving ? 0.25 : 1.5)) {
            this.fbSyncTimer = 0;
            this.syncFirebaseNow(false);
        }
        this.fbPollTimer += dt;
        if (this.fbPollTimer >= 4.0) {
            this.fbPollTimer = 0;
            const now = Date.now();
            let changed = false;
            // 一瞬の通信揺らぎで消えないよう25秒タイムアウトに設定
            for (const [uid, rp] of this.remotePlayers.entries()) {
                if (now - (rp.lastSeenTs || 0) > 25000) {
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
        const myUid = this.getDeviceUid();
        const senderUid = msg.uid || msg.senderUid;
        if (!senderUid) return;

        if (senderUid === myUid) {
            this.netEchoCount = (this.netEchoCount || 0) + 1;
            return;
        }

        const dedupKey = `${senderUid}_${msg.type}_${msg.ts}`;
        if (!this._seenIds) this._seenIds = new Set();
        if (this._seenIds.has(dedupKey)) return;
        this._seenIds.add(dedupKey);
        if (this._seenIds.size > 500) this._seenIds.delete(this._seenIds.values().next().value);

        this.netRxCount = (this.netRxCount || 0) + 1;

        if (topic === TOPIC_GLOBAL || msg.type === 'chat_global') {
            if (msg.payload) {
                const chatTxt = msg.payload.text || msg.payload.msg || msg.payload.message || '';
                this.addChatMessage('global', msg.payload.kaomoji, msg.payload.name, chatTxt, false);
                this.spawnHeadBubble(false, senderUid, msg.payload.kaomoji, chatTxt, false);
            }
            return;
        }
        if ((msg.roomKey || 'PUBLIC_OPEN_ROOM') !== this.getSafeRoomKey()) return;

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
            const chatTxt = msg.payload.text || msg.payload.msg || msg.payload.message || '';
            this.addChatMessage('room', msg.payload.kaomoji, msg.payload.name, chatTxt, false);
            this.spawnHeadBubble(false, senderUid, msg.payload.kaomoji, chatTxt, false);
        } else if (msg.type === 'kill' && msg.payload && this.receiveCoopReward) {
            this.receiveCoopReward(msg.payload);
        } else if (msg.type === 'emote' && msg.payload) {
            this.spawnHeadBubble(false, senderUid, msg.payload.kaomoji || '(≧▽≦)', msg.payload.msg || 'やっほー！', true);
            const rp = this.remotePlayers.get(senderUid);
            if (rp && rp.visible && this.spawnEmoteBubble) {
                this.spawnEmoteBubble(rp.pos.clone().add(new THREE.Vector3(0, 2.7, 0)), msg.payload.kaomoji || '(≧▽≦)', msg.payload.msg || 'やっほー！');
            }
        } else if (msg.type === 'attack' || msg.type === 'skill_fx') {
            const rp = this.remotePlayers.get(senderUid);
            if (rp) {
                if (typeof msg.payload?.x === 'number' && typeof msg.payload?.z === 'number') {
                    rp.pos.set(msg.payload.x, 0, msg.payload.z);
                    rp.targetPos.set(msg.payload.x, 0, msg.payload.z);
                }
                if (typeof msg.payload?.rotY === 'number') {
                    rp.rotY = msg.payload.rotY;
                    rp.targetRotY = msg.payload.rotY;
                }
                if (rp.visible) {
                    this.triggerAttackVisual(rp, !!msg.payload?.isSkill, msg.payload);
                }
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
            if (rp.group && !(rp.attackAnimTimer > 0)) {
                rp.group.position.copy(rp.pos);
                rp.group.rotation.y = rp.rotY;
            }
        });
        this.updateAttackAnimations(dt);
        this.updateHeadBubbles(dt);
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
        document.getElementById('emote-palette')?.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            const spans = btn.querySelectorAll('span');
            const kao = spans[0]?.textContent?.trim() || btn.textContent.trim().slice(0, 12);
            const label = spans[1]?.textContent?.trim() || 'やっほー！';
            this.spawnHeadBubble(true, null, kao, label, true);
            this.broadcastFirebaseEvent('emote', { kaomoji: kao, msg: label });
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
    const P = KaomojiMMORPG.prototype;

    if (P.enterGameFromTitle) {
        const _origEnter = P.enterGameFromTitle;
        P.enterGameFromTitle = function () {
            this.showLoadingOverlay('NOW LOADING... 冒険の世界へ出発！', 1100);
            _origEnter.call(this);
            this.startAutoReconnectWatchdog();
            if (this.saveData?.onlineEnabled) {
                setTimeout(() => this.connectMqttStart(true), 300);
                setTimeout(() => { if (this.fbConnected) this.syncFirebaseNow(true); }, 1500);
            }
        };
    }

    if (P.loadZone) {
        const _origLoadZone = P.loadZone;
        P.loadZone = function (zoneId) {
            const zName = (typeof ZONES !== 'undefined' && ZONES[zoneId]) ? ZONES[zoneId].name : '移動中';
            if (!this.inTitleScreen) this.showLoadingOverlay(`WARPING... ${zName}`, 650);
            _origLoadZone.call(this, zoneId);
            if (this.fbConnected) setTimeout(() => this.syncFirebaseNow(true), 300);
        };
    }

    if (P.sendChatMessage) {
        const _origSendChat = P.sendChatMessage;
        P.sendChatMessage = function (rawText) {
            const txt = String(rawText || '').trim();
            _origSendChat.call(this, rawText);
            if (txt) this.spawnHeadBubble(true, null, this.getBasePlayerKaomoji(), txt, false);
        };
    }

    if (P.performBasicAttack) {
        const _origAtk = P.performBasicAttack;
        P.performBasicAttack = function () {
            _origAtk.call(this);
            this.triggerAttackVisual(this.player, false, null);
            this.broadcastFirebaseEvent('attack', {
                isSkill: false,
                x: this.player?.pos?.x,
                z: this.player?.pos?.z,
                rotY: this.player?.rotY
            });
        };
    }

    if (P.useSkillSlot) {
        const _origSkill = P.useSkillSlot;
        P.useSkillSlot = function (slotIdx) {
            const d = this.saveData || {};
            const sid = (d.equippedSkills && d.equippedSkills[slotIdx]) || (d.skillSlots && d.skillSlots[slotIdx]) || '';
            const sObj = (typeof SKILLS !== 'undefined' && sid) ? SKILLS[sid] : null;
            const sName = sObj?.name || '';
            const prevCd = this.player?.skillCds?.[slotIdx] || 0;

            _origSkill.call(this, slotIdx);

            const nowCd = this.player?.skillCds?.[slotIdx] || 0;
            if (nowCd > prevCd) {
                const info = {
                    isSkill: true,
                    slotIdx,
                    skillId: sid,
                    skillName: sName,
                    x: this.player?.pos?.x,
                    z: this.player?.pos?.z,
                    rotY: this.player?.rotY
                };
                this.triggerAttackVisual(this.player, true, info);
                this.broadcastFirebaseEvent('skill_fx', info);
            }
        };
    }

    if (P.refreshAllHUD) {
        const _rHUD = P.refreshAllHUD;
        P.refreshAllHUD = function () {
            _rHUD.call(this);
            const btn = document.getElementById('btn-hud-online-toggle');
            if (btn && !this.fbConnected && this.saveData?.onlineEnabled && this.netStatusLabel) btn.textContent = this.netStatusLabel;
        };
    }

    if (P.renderModalContent) {
        const _rMod = P.renderModalContent;
        P.renderModalContent = function () {
            _rMod.call(this);
            if (this.activeTab === 'online') {
                const body = document.getElementById('modal-body');
                const svList = this.getConnectedServerNames().join(', ') || '自動再接続中...';
                if (body) {
                    body.insertAdjacentHTML('afterbegin', `
                        <div class="card-box" style="margin-bottom:8px;border-color:#fde047;">
                            <div class="flex-between">
                                <b style="color:#fde047;font-size:11px;">📡 接続サーバー: ${svList}</b>
                                <button type="button" id="btn-diag-reconn" class="btn-ui btn-amber" style="padding:4px 8px;font-size:10px;">🔄 再接続</button>
                            </div>
                            <div style="font-size:10px;color:#cbd5e1;margin-top:3px;">
                                送信: <b>${this.netTxCount || 0}</b>回 ／ 折返し: <b>${this.netEchoCount || 0}</b>回 ／ 仲間受信: <b>${this.netRxCount || 0}</b>回
                            </div>
                        </div>
                    `);
                    document.getElementById('btn-diag-reconn')?.addEventListener('click', () => {
                        sfx.init();
                        this._isConnectingNow = false;
                        this.connectMqttStart(false);
                    });
                }
            }
        };
    }

    if (P.buildPlayerEntity) {
        const _bPE = P.buildPlayerEntity;
        P.buildPlayerEntity = function () {
            const cds = this.player?.skillCds || [0, 0, 0, 0, 0];
            _bPE.call(this);
            if (this.player) this.player.skillCds = cds;
        };
    }
}

window.addEventListener('DOMContentLoaded', () => {
    if (!window.game && typeof KaomojiMMORPG !== 'undefined') window.game = new KaomojiMMORPG();
    if (window.game && window.game.startAutoReconnectWatchdog) window.game.startAutoReconnectWatchdog();
});
// === GAME6_V10_OK ===
