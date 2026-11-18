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
const TOPIC_GLOBAL = 'kaomoji_fantasy_3d/stable/global';

const ALL_EMOTE_MOTIONS = [
    'greeting_wave',
    'backflip',
    'bow_polite',
    'tornado_dance',
    'heart_float',
    'chabudai_rage',
    'cry_fountain',
    'dogeza',
    'ghost_faint',
    'sleep_bubble',
    'salute_hero',
    'rocket_zoom'
];

const LOADING_KAOMOJIS = ['(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧', 'ε=ε=ε=┏(゜ロ゜;)┛', '(ง •̀_•́)ง ⚔️', '✧*｡٩(ˊᗜˋ*)و✧*｡', '(╯°□°）╯︵ ┻━┻'];
const LOADING_TIPS = [
    '💡 ちゃぶ台返しエモートを押すと本当に3Dちゃぶ台が飛んでいくよ！',
    '💡 ビーム系や絶対零度ノヴァなどスキルごとに専用3Dエフェクトが発動するよ！',
    '💡 左手で移動しながら右手で画面をなぞると視点を自由に回せるよ！',
    '💡 パスワード部屋を設定すると合言葉を知っている友達だけで遊べるよ！'
];

(function injectV15Styles() {
    if (document.getElementById('kmj-v15-style')) return;
    const st = document.createElement('style');
    st.id = 'kmj-v15-style';
    st.textContent = `
        #kmj-loading-screen{position:fixed;inset:0;z-index:96;background:radial-gradient(circle at center,#0f172a 0%,#020617 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:24px;transition:opacity .28s ease;pointer-events:auto}
        #kmj-loading-screen.fade-out{opacity:0;pointer-events:none}
        .kmj-load-kao{font-size:32px;font-weight:900;color:#38bdf8;text-shadow:0 0 18px rgba(56,189,248,.8);animation:kmjBounce .6s infinite alternate}
        .kmj-load-bar-bg{width:min(300px,80vw);height:10px;background:#1e293b;border:1px solid #38bdf8;border-radius:999px;overflow:hidden}
        .kmj-load-bar-fill{height:100%;width:0%;background:linear-gradient(90deg,#38bdf8,#f472b6,#fde047);transition:width .25s ease}
        @keyframes kmjBounce{from{transform:translateY(0)}to{transform:translateY(-8px)}}
        .world-head-bubble{position:absolute;transform:translate(-50%,-100%);background:rgba(15,23,42,.96);border:2px solid #38bdf8;border-radius:14px;padding:5px 11px;text-align:center;box-shadow:0 6px 18px rgba(0,0,0,.7);pointer-events:none!important;max-width:220px;word-break:break-word;z-index:14;animation:kmjPop .18s ease-out}
        .world-head-bubble.is-emote{border-color:#f472b6;background:rgba(36,12,48,.96)}
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
            salt = localStorage.getItem('kmj_dev_salt_stable');
            if (!salt) {
                salt = Math.random().toString(36).slice(2, 8);
                localStorage.setItem('kmj_dev_salt_stable', salt);
            }
        } catch (e) {
            salt = Math.random().toString(36).slice(2, 8);
        }
        this._runtimeUid = `${this.saveData.playerUid || 'p'}_${salt}`;
        return this._runtimeUid;
    },

    getRoomTopic() {
        const d = this.saveData;
        if (!d.roomPassEnabled) return 'kaomoji_fantasy_3d/stable/room/PUBLIC';
        const p = String(d.roomPassword || '').trim();
        let hex = '';
        for (let i = 0; i < p.length; i++) hex += p.charCodeAt(i).toString(16);
        return 'kaomoji_fantasy_3d/stable/room/PASS_' + (hex || 'EMPTY');
    },

    getSafeRoomKey() {
        if (!this.saveData.roomPassEnabled) return 'PUBLIC_OPEN_ROOM';
        return 'PASS_' + String(this.saveData.roomPassword || '').trim();
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

    startAutoReconnectWatchdog() {
        if (this._reconnWatchdog) return;
        this._reconnWatchdog = setInterval(() => {
            if (!this.saveData || !this.saveData.onlineEnabled) return;
            const activeCount = this.getConnectedServerNames().length;
            if (activeCount > 0) {
                this.fbConnected = true;
                return;
            }
            this.fbConnected = false;
            this.netStatusLabel = '⏳ 自動接続中...';
            this.refreshAllHUD();
            const elapsed = Date.now() - (this._lastConnectAttemptTs || 0);
            if (elapsed > 6500) this.connectMqttStart(true);
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
            this._lastConnectAttemptTs = 0;
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
        this._lastConnectAttemptTs = Date.now();
        this.stopMqtt(false);

        this.saveData.onlineEnabled = true;
        this.fbConnected = false;
        this.netStatusLabel = '⏳ 接続中...';
        this.netTxCount = 0;
        this.netEchoCount = 0;
        this.netRxCount = 0;
        this.mqttClients = [];
        this.refreshTitleScreen();
        this.refreshAllHUD();

        this.loadMqttLib((ok) => {
            if (!this.saveData.onlineEnabled) return;
            if (!ok) {
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
                        clientId: 'kmj_' + myUid + '_' + idx + '_' + Math.random().toString(36).slice(2, 5),
                        clean: true,
                        keepalive: 20,
                        connectTimeout: 6000,
                        reconnectPeriod: 2500,
                        will: { topic: rTopic, payload: JSON.stringify({ type: 'leave', uid: myUid, ts: Date.now() }), qos: 0 }
                    });
                    c._svName = sv.name;
                    this.mqttClients.push(c);

                    c.on('connect', () => {
                        if (!this.saveData.onlineEnabled) {
                            try { c.end(true); } catch (e) {}
                            return;
                        }
                        const wasConnected = this.fbConnected;
                        this.fbConnected = true;
                        this.netStatusLabel = '';

                        c.subscribe([TOPIC_GLOBAL, rTopic], { qos: 0 }, () => {
                            this.syncFirebaseNow(true);
                            setTimeout(() => { if (this.fbConnected) this.syncFirebaseNow(true); }, 600);
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
        this._lastConnectAttemptTs = 0;
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
        this._txSeq = (this._txSeq || 0) + 1;
        obj.seq = this._txSeq;
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
            passEnabled: !!d.roomPassEnabled,
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
            passEnabled: !!this.saveData.roomPassEnabled,
            payload,
            ts: Date.now()
        };
        this.publishAllConnected(topic, packet);
    },

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

    classifyEmoteItem(itemEl, emoteIdx) {
        let kao = itemEl?.dataset?.kaomoji || '';
        let label = itemEl?.dataset?.msg || itemEl?.dataset?.label || '';

        if (!kao || !label) {
            const leaves = [...(itemEl?.querySelectorAll('*') || [])].filter(el => el.children.length === 0 && el.textContent.trim());
            if (leaves.length >= 2) {
                if (!kao) kao = leaves[0].textContent.trim();
                if (!label) label = leaves[1].textContent.trim();
            } else {
                const raw = (itemEl?.textContent || '').trim();
                const parts = raw.split(/\s+/);
                if (parts.length >= 2) {
                    if (!kao) kao = parts[0];
                    if (!label) label = parts.slice(1).join(' ');
                } else {
                    if (!kao) kao = raw || '(≧▽≦)';
                    if (!label) label = raw || 'やっほー！';
                }
            }
        }

        const combined = `${kao} ${label}`;
        let motionType = '';
        if (/ちゃぶ|卓|返|┻|┬|怒|ﾑｶ|ぷん|憤|💢|😡/.test(combined)) motionType = 'chabudai_rage';
        else if (/土下座|ごめん|謝|許し|orz/.test(combined)) motionType = 'dogeza';
        else if (/気絶|倒|疲|ガーン|昇天|死亡|バタン/.test(combined)) motionType = 'ghost_faint';
        else if (/眠|zzz|おやすみ|ふぅ|😪|寝/.test(combined)) motionType = 'sleep_bubble';
        else if (/泣|悲|えん|ショボ|涙|ToT|T_T|；；|😭/.test(combined)) motionType = 'cry_fountain';
        else if (/愛|好|ﾊｰﾄ|ハート|照|ｷｭﾝ|キュン|♡|❤|💕/.test(combined)) motionType = 'heart_float';
        else if (/踊|ﾀﾞﾝｽ|ダンス|♪|♫|クル|回|ｽﾋﾟﾝ|スピン/.test(combined)) motionType = 'tornado_dance';
        else if (/やった|勝|バンザイ|万歳|歓喜|最高|🎉|✨|✧/.test(combined)) motionType = 'backflip';
        else if (/敬礼|任せ|キメ|応援|ファイト|💪|🔥/.test(combined)) motionType = 'salute_hero';
        else if (/ダッシュ|急げ|突撃|ε=|走/.test(combined)) motionType = 'rocket_zoom';
        else if (/よろ|ありがと|礼|ペコリ|🙇|おつ|拝/.test(combined)) motionType = 'bow_polite';
        else if (/やっほ|手|ハロー|バイ|ﾉｼ|👋|こん/.test(combined)) motionType = 'greeting_wave';
        else motionType = ALL_EMOTE_MOTIONS[Math.max(0, emoteIdx) % ALL_EMOTE_MOTIONS.length];

        if (emoteIdx >= 0 && this._emoteSlotMotionMap) {
            const used = Object.entries(this._emoteSlotMotionMap).filter(([k]) => Number(k) !== emoteIdx).map(([, v]) => v);
            if (used.includes(motionType)) {
                const unused = ALL_EMOTE_MOTIONS.find(m => !used.includes(m));
                if (unused) motionType = unused;
            }
        }
        if (emoteIdx >= 0) {
            if (!this._emoteSlotMotionMap) this._emoteSlotMotionMap = {};
            this._emoteSlotMotionMap[emoteIdx] = motionType;
        }

        return { motionType, kaomoji: kao, label };
    },

    createHeart3D(colorHex = 0xf43f5e) {
        const g = new THREE.Group();
        const mat = new THREE.MeshBasicMaterial({ color: colorHex });
        const s1 = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), mat);
        s1.position.set(-0.1, 0.08, 0);
        const s2 = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), mat);
        s2.position.set(0.1, 0.08, 0);
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.32, 12), mat);
        cone.position.set(0, -0.1, 0);
        cone.rotation.z = Math.PI;
        g.add(s1, s2, cone);
        return g;
    },

    playSyncedEmote(isSelf, uid, emoteData) {
        const kao = emoteData.kaomoji || '(≧▽≦)';
        const label = emoteData.label || emoteData.msg || 'やっほー！';
        const motionType = emoteData.motionType || 'backflip';

        this.spawnHeadBubble(isSelf, uid, kao, label, true);
        const ent = isSelf ? this.player : this.remotePlayers.get(uid);
        if (!ent) return;

        const durMap = {
            backflip: 2.2,
            tornado_dance: 2.6,
            dogeza: 2.8,
            chabudai_rage: 2.4,
            heart_float: 2.7,
            ghost_faint: 3.0,
            sleep_bubble: 2.9,
            greeting_wave: 2.3,
            salute_hero: 2.3,
            cry_fountain: 2.7,
            rocket_zoom: 2.4,
            bow_polite: 2.5
        };
        const maxT = durMap[motionType] || 2.4;
        ent.emoteAnim = { style: motionType, timer: maxT, maxTimer: maxT };

        if (!this.useWebGL || !this.scene || !ent.pos || typeof THREE === 'undefined') return;
        if (!this._slashEffects) this._slashEffects = [];

        const px = ent.pos.x, pz = ent.pos.z;
        const rotY = ent.rotY || 0;

        if (motionType === 'chabudai_rage') {
            // ちゃぶ台返しエモート：本物の3Dちゃぶ台を前方に回転飛翔＋赤い衝撃波
            if (this.createChabudai3D) {
                const dirX = Math.sin(rotY), dirZ = Math.cos(rotY);
                const tableMesh = this.createChabudai3D();
                tableMesh.position.set(px + dirX * 1.1, 1.0, pz + dirZ * 1.1);
                tableMesh.rotation.y = rotY;
                this.scene.add(tableMesh);
                this._slashEffects.push({
                    kind: 'chabudai',
                    mesh: tableMesh,
                    life: 1.05,
                    maxLife: 1.05,
                    vx: dirX * 11.5,
                    vz: dirZ * 11.5
                });
            }
            const rMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
            const ring = new THREE.Mesh(new THREE.RingGeometry(0.5, 1.1, 24), rMat);
            ring.rotation.x = -Math.PI / 2;
            ring.position.set(px, 0.12, pz);
            this.scene.add(ring);
            this._slashEffects.push({ kind: 'shockwave', mesh: ring, mat: rMat, life: 1.5, maxLife: 1.5 });
        } else if (motionType === 'heart_float') {
            for (let i = 0; i < 6; i++) {
                const ang = (i / 6) * Math.PI * 2;
                const h = this.createHeart3D(i % 2 === 0 ? 0xf43f5e : 0xf472b6);
                h.position.set(px + Math.cos(ang) * 0.85, 1.2 + i * 0.15, pz + Math.sin(ang) * 0.85);
                this.scene.add(h);
                this._slashEffects.push({
                    kind: 'heart', mesh: h, life: 2.2, maxLife: 2.2,
                    cx: px, cz: pz, ang, rad: 0.95, vy: 1.15
                });
            }
        } else if (motionType === 'ghost_faint') {
            const ghost = new THREE.Group();
            const gMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.82 });
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 14, 14), gMat);
            const tail = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.7, 14), gMat);
            tail.position.y = -0.35;
            tail.rotation.x = Math.PI;
            ghost.add(head, tail);
            ghost.position.set(px, 1.0, pz);
            this.scene.add(ghost);
            this._slashEffects.push({ kind: 'ghost', mesh: ghost, mat: gMat, life: 2.6, maxLife: 2.6, bx: px, bz: pz });
        } else if (motionType === 'sleep_bubble') {
            const bMat = new THREE.MeshBasicMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.65 });
            const bub = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), bMat);
            bub.position.set(px + Math.sin(rotY) * 0.8, 1.65, pz + Math.cos(rotY) * 0.8);
            this.scene.add(bub);
            this._slashEffects.push({ kind: 'snot_bubble', mesh: bub, mat: bMat, life: 2.4, maxLife: 2.4 });
        } else if (motionType === 'cry_fountain') {
            const rightX = Math.cos(rotY), rightZ = -Math.sin(rotY);
            for (let i = 0; i < 14; i++) {
                const side = (i % 2 === 0) ? 1 : -1;
                const drop = new THREE.Mesh(
                    new THREE.SphereGeometry(0.11, 8, 8),
                    new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
                );
                drop.position.set(px + rightX * 0.45 * side, 1.75, pz + rightZ * 0.45 * side);
                this.scene.add(drop);
                this._slashEffects.push({
                    kind: 'tear', mesh: drop, life: 1.6, maxLife: 1.6,
                    vx: rightX * side * (2.2 + (i % 3) * 0.5),
                    vy: 3.2 + (i % 4) * 0.4,
                    vz: rightZ * side * (2.2 + (i % 3) * 0.5),
                    delay: (i * 0.08)
                });
            }
        } else if (motionType === 'salute_hero') {
            const beamMat = new THREE.MeshBasicMaterial({ color: 0xfef08a, side: THREE.DoubleSide, transparent: true, opacity: 0.36 });
            const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.6, 7.0, 20, 1, true), beamMat);
            beam.position.set(px, 3.5, pz);
            this.scene.add(beam);
            this._slashEffects.push({ kind: 'aura', mesh: beam, mat: beamMat, life: 2.0, maxLife: 2.0 });
        } else if (motionType === 'bow_polite') {
            for (let i = 0; i < 10; i++) {
                const ang = (i / 10) * Math.PI * 2;
                const petal = new THREE.Mesh(
                    new THREE.PlaneGeometry(0.24, 0.16),
                    new THREE.MeshBasicMaterial({ color: 0xf9a8d4, side: THREE.DoubleSide })
                );
                petal.position.set(px + Math.cos(ang) * 1.1, 2.8 + (i % 3) * 0.4, pz + Math.sin(ang) * 1.1);
                this.scene.add(petal);
                this._slashEffects.push({
                    kind: 'petal', mesh: petal, life: 2.2, maxLife: 2.2,
                    vx: Math.cos(ang) * 0.6, vy: -1.1, vz: Math.sin(ang) * 0.6
                });
            }
        } else {
            const c1 = motionType === 'tornado_dance' ? 0x38bdf8 : 0xfde047;
            const c2 = motionType === 'dogeza' ? 0x60a5fa : 0xf472b6;
            for (let i = 0; i < 8; i++) {
                const ang = (i / 8) * Math.PI * 2;
                const star = new THREE.Mesh(
                    new THREE.OctahedronGeometry(0.18, 0),
                    new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? c1 : c2 })
                );
                star.position.set(px + Math.cos(ang) * 0.8, 2.1, pz + Math.sin(ang) * 0.8);
                this.scene.add(star);
                this._slashEffects.push({
                    kind: 'star', mesh: star, life: 1.5, maxLife: 1.5,
                    vx: Math.cos(ang) * 1.8, vy: 1.8, vz: Math.sin(ang) * 1.8
                });
            }
        }
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
    }
});
// ▲▲▲ ここまで【前半 1/2】 ▲▲▲
