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
    'greeting_wave', 'backflip', 'bow_polite', 'tornado_dance',
    'heart_float', 'chabudai_rage', 'cry_fountain', 'dogeza',
    'ghost_faint', 'sleep_bubble', 'salute_hero', 'rocket_zoom'
];

const LOADING_KAOMOJIS = ['(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧', 'ε=ε=ε=┏(゜ロ゜;)┛', '(ง •̀_•́)ง ⚔️', '✧*｡٩(ˊᗜˋ*)و✧*｡', '(╯°□°）╯︵ ┻━┻'];
const LOADING_TIPS = [
    '💡 ペットタブから「ペット装備」を購入・装着すると相棒の見た目とステータスが強化されるよ！',
    '💡 チャット欄の上部をドラッグで移動、右下つまみでサイズ変更、「↺ 戻す」で初期位置に戻るよ！',
    '💡 「極光の聖域」はフィールドを展開して範囲内の自分と味方を継続回復＆強化するよ！',
    '💡 AUTOモード中は攻撃スキルだけでなく回復や極光の聖域・バフも自動で使ってくれるよ！'
];

// ペット装備マスターデータ
const PET_EQUIPS = [
    { id: 'none', name: '装備なし', icon: '➖', cost: 0, atkPct: 0, defPct: 0, hpPct: 0, spdPct: 0, desc: '標準状態' },
    { id: 'pe_ribbon', name: '勇気の赤いリボン', icon: '🎀', cost: 300, atkPct: 0.08, defPct: 0.05, hpPct: 0.10, spdPct: 0.05, desc: 'ATK+8% DEF+5% HP+10% SPD+5%' },
    { id: 'pe_bell', name: '幸運の黄金鈴', icon: '🔔', cost: 800, atkPct: 0.10, defPct: 0.10, hpPct: 0.12, spdPct: 0.15, desc: 'ATK+10% DEF+10% HP+12% SPD+15%' },
    { id: 'pe_visor', name: 'サイバーゴーグル', icon: '🥽', cost: 1800, atkPct: 0.20, defPct: 0.08, hpPct: 0.10, spdPct: 0.12, desc: 'ATK+20% DEF+8% HP+10% SPD+12%' },
    { id: 'pe_scarf', name: '疾風の赤いマフラー', icon: '🧣', cost: 3500, atkPct: 0.22, defPct: 0.15, hpPct: 0.15, spdPct: 0.20, desc: 'ATK+22% DEF+15% HP+15% SPD+20%' },
    { id: 'pe_crown', name: 'ミニ黄金王冠', icon: '👑', cost: 7000, atkPct: 0.25, defPct: 0.25, hpPct: 0.25, spdPct: 0.15, desc: '全ステータス +25% (SPD+15%)' },
    { id: 'pe_wings', name: '天使のミニ翼', icon: '🪽', cost: 12000, atkPct: 0.28, defPct: 0.22, hpPct: 0.28, spdPct: 0.30, desc: 'ATK+28% DEF+22% HP+28% SPD+30%' },
    { id: 'pe_halo', name: '聖なる創世光輪', icon: '😇', cost: 25000, atkPct: 0.38, defPct: 0.35, hpPct: 0.38, spdPct: 0.30, desc: 'ATK+38% DEF+35% HP+38% SPD+30%' }
];

(function injectV19Styles() {
    if (document.getElementById('kmj-v19-style')) return;
    const st = document.createElement('style');
    st.id = 'kmj-v19-style';
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
        #kmj-chat-drag-bar{display:flex;align-items:center;justify-content:space-between;gap:6px;padding:4px 8px;background:rgba(15,23,42,.95);border-bottom:1px solid rgba(56,189,248,.45);cursor:move;touch-action:none;user-select:none;border-radius:8px 8px 0 0}
        #kmj-chat-resize-grip{position:absolute;right:0;bottom:0;width:22px;height:22px;cursor:nwse-resize;touch-action:none;z-index:25;display:flex;align-items:flex-end;justify-content:flex-end;padding:2px;color:#38bdf8;font-size:12px;line-height:1;user-select:none}
        #chat-panel{box-sizing:border-box;min-width:210px;min-height:110px;max-width:94vw;max-height:78vh}
    `;
    document.head.appendChild(st);
})();

Object.assign(KaomojiMMORPG.prototype, {

    // 操作キャラ＆マルチ味方の顔パネル位置ズレ・めり込みを自動補正
    fixAvatarFaceAlignment(group) {
        if (!group || typeof THREE === 'undefined') return;
        let headMesh = null;
        let faceMesh = null;

        group.traverse(obj => {
            if (!obj.isMesh || !obj.geometry) return;
            const gType = obj.geometry.type || '';
            if (!headMesh && (gType.includes('Box') || gType.includes('Sphere')) && obj.position.y >= 0.6 && obj.position.y <= 1.8) {
                if (!obj.material?.map) headMesh = obj;
            }
            if (!faceMesh && (gType.includes('Plane') || (obj.material && obj.material.map && obj.material.map.image))) {
                if (obj.position.y >= 0.6 && obj.position.y <= 1.8) faceMesh = obj;
            }
        });

        if (faceMesh) {
            if (headMesh) {
                headMesh.geometry.computeBoundingBox?.();
                const bb = headMesh.geometry.boundingBox;
                const halfD = bb ? (bb.max.z - bb.min.z) * 0.5 * (headMesh.scale.z || 1) : 0.5;
                faceMesh.position.x = headMesh.position.x;
                faceMesh.position.y = headMesh.position.y;
                faceMesh.position.z = headMesh.position.z + halfD + 0.025;
            } else {
                faceMesh.position.x = 0;
                if (faceMesh.position.z > 0) faceMesh.position.z += 0.015;
            }
            faceMesh.rotation.set(0, 0, 0);
            if (faceMesh.material) {
                faceMesh.material.polygonOffset = true;
                faceMesh.material.polygonOffsetFactor = -2;
                faceMesh.material.needsUpdate = true;
            }
        }
    },

    // チャットの自由ドラッグ移動・自由リサイズ・元の位置へ戻すボタン初期化
    initChatFreeTransform() {
        const panel = document.getElementById('chat-panel');
        if (!panel || panel.dataset.v19Movable) return;
        panel.dataset.v19Movable = '1';

        const cs = window.getComputedStyle(panel);
        if (cs.position === 'static') panel.style.position = 'fixed';

        const rect0 = panel.getBoundingClientRect();
        this._chatDefaultBox = {
            left: cs.left !== 'auto' ? cs.left : `${Math.max(8, rect0.left)}px`,
            top: cs.top !== 'auto' ? cs.top : '',
            bottom: cs.bottom !== 'auto' ? cs.bottom : '76px',
            width: panel.style.width || (rect0.width > 50 ? `${Math.round(rect0.width)}px` : '290px'),
            height: panel.style.height || (rect0.height > 50 ? `${Math.round(rect0.height)}px` : '175px')
        };

        const dragBar = document.createElement('div');
        dragBar.id = 'kmj-chat-drag-bar';
        dragBar.innerHTML = `
            <span style="font-size:10px;font-weight:900;color:#7dd3fc;letter-spacing:.5px;">✥ ドラッグで移動</span>
            <button type="button" id="btn-chat-reset-pos" style="background:#1e293b;border:1px solid #38bdf8;color:#fde047;border-radius:5px;padding:2px 7px;font-size:10px;font-weight:900;cursor:pointer;">↺ 戻す</button>
        `;
        panel.insertBefore(dragBar, panel.firstChild);

        const grip = document.createElement('div');
        grip.id = 'kmj-chat-resize-grip';
        grip.title = 'ドラッグで大きさ変更';
        grip.textContent = '◢';
        panel.appendChild(grip);

        try {
            const saved = JSON.parse(localStorage.getItem('kmj_chat_box_v18') || 'null');
            if (saved && saved.left && saved.top) {
                panel.style.left = saved.left;
                panel.style.top = saved.top;
                panel.style.bottom = 'auto';
                panel.style.right = 'auto';
                if (saved.width) panel.style.width = saved.width;
                if (saved.height) panel.style.height = saved.height;
            }
        } catch (e) {}

        const saveBox = () => {
            try {
                localStorage.setItem('kmj_chat_box_v18', JSON.stringify({
                    left: panel.style.left,
                    top: panel.style.top,
                    width: panel.style.width,
                    height: panel.style.height
                }));
            } catch (e) {}
        };

        const resetChatBox = (e) => {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            sfx?.init?.();
            const def = this._chatDefaultBox;
            panel.style.left = def.left;
            panel.style.top = def.top || 'auto';
            panel.style.bottom = def.top ? 'auto' : def.bottom;
            panel.style.right = 'auto';
            panel.style.width = def.width;
            panel.style.height = def.height;
            try { localStorage.removeItem('kmj_chat_box_v18'); } catch (err) {}
            this.showAlertBanner?.('💬 チャットを元の位置・サイズに戻しました', 1300);
        };
        document.getElementById('btn-chat-reset-pos')?.addEventListener('click', resetChatBox);
        document.getElementById('btn-chat-reset-pos')?.addEventListener('touchend', resetChatBox, { passive: false });

        let dragging = false, sx = 0, sy = 0, sl = 0, st = 0;
        const startDrag = (cx, cy) => {
            const r = panel.getBoundingClientRect();
            dragging = true; sx = cx; sy = cy; sl = r.left; st = r.top;
            panel.style.left = `${sl}px`; panel.style.top = `${st}px`;
            panel.style.bottom = 'auto'; panel.style.right = 'auto';
        };
        const moveDrag = (cx, cy) => {
            if (!dragging) return;
            const r = panel.getBoundingClientRect();
            const nx = Math.max(2, Math.min(window.innerWidth - r.width - 2, sl + (cx - sx)));
            const ny = Math.max(2, Math.min(window.innerHeight - r.height - 2, st + (cy - sy)));
            panel.style.left = `${nx}px`; panel.style.top = `${ny}px`;
        };
        const endDrag = () => { if (dragging) { dragging = false; saveBox(); } };

        dragBar.addEventListener('mousedown', (e) => {
            if (e.target.id === 'btn-chat-reset-pos') return;
            e.preventDefault(); e.stopPropagation(); startDrag(e.clientX, e.clientY);
        });
        window.addEventListener('mousemove', (e) => moveDrag(e.clientX, e.clientY));
        window.addEventListener('mouseup', endDrag);

        dragBar.addEventListener('touchstart', (e) => {
            if (e.target.id === 'btn-chat-reset-pos') return;
            e.preventDefault(); e.stopPropagation(); startDrag(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: false });
        window.addEventListener('touchmove', (e) => { if (dragging) moveDrag(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
        window.addEventListener('touchend', endDrag);

        let resizing = false, rx = 0, ry = 0, rw = 0, rh = 0;
        const startResize = (cx, cy) => {
            const r = panel.getBoundingClientRect();
            resizing = true; rx = cx; ry = cy; rw = r.width; rh = r.height;
            panel.style.left = `${r.left}px`; panel.style.top = `${r.top}px`;
            panel.style.bottom = 'auto'; panel.style.right = 'auto';
        };
        const moveResize = (cx, cy) => {
            if (!resizing) return;
            const nw = Math.max(210, Math.min(window.innerWidth * 0.94, rw + (cx - rx)));
            const nh = Math.max(115, Math.min(window.innerHeight * 0.78, rh + (cy - ry)));
            panel.style.width = `${Math.round(nw)}px`; panel.style.height = `${Math.round(nh)}px`;
        };
        const endResize = () => { if (resizing) { resizing = false; saveBox(); } };

        grip.addEventListener('mousedown', (e) => { e.preventDefault(); e.stopPropagation(); startResize(e.clientX, e.clientY); });
        window.addEventListener('mousemove', (e) => moveResize(e.clientX, e.clientY));
        window.addEventListener('mouseup', endResize);

        grip.addEventListener('touchstart', (e) => { e.preventDefault(); e.stopPropagation(); startResize(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
        window.addEventListener('touchmove', (e) => { if (resizing) moveResize(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
        window.addEventListener('touchend', endResize);
    }
});
// ▲▲▲ ここまで【1/4】 ▲▲▲
// ▼▼▼ ここから【2/4】 ▼▼▼
Object.assign(KaomojiMMORPG.prototype, {

    // 敵の見た目を四角い顔文字箱から「本格3Dモンスター造形」へ一新
    rebuildMonstersAs3DMonsters(dt = 0.016) {
        if (!this.useWebGL || !this.monsters || typeof THREE === 'undefined') return;
        const now = performance.now() * 0.001;

        this.monsters.forEach((m, idx) => {
            if (!m || m.dead) return;
            const grp = m.group || m.mesh;
            if (!grp) return;

            if (!grp.userData.v19Monster3D) {
                grp.userData.v19Monster3D = true;
                // 既存の四角い顔文字ボックスをクリア
                while (grp.children.length > 0) {
                    const ch = grp.children[0];
                    grp.remove(ch);
                }

                const sc = Number(m.scale) || 1.0;
                const nameStr = String(m.name || m.id || '');
                const isBoss = !!(m.isBoss || m.boss || sc >= 1.45 || /ボス|王|魔王|竜|ドラゴン|神|極|覇/.test(nameStr));

                // 種族判定
                let kind = 'demon';
                if (/スライム|ぷよ|ゼリー|slime/i.test(nameStr)) kind = 'slime';
                else if (/竜|ドラゴン|ワイバーン|鳥|コウモリ|dragon|wyvern|bat/i.test(nameStr)) kind = 'dragon';
                else if (/ゴーレム|岩|騎士|アーマー|機|ロボ|golem|knight/i.test(nameStr)) kind = 'golem';
                else if (/幽霊|死神|骸骨|霊|闇|影|ghost|reaper|skeleton/i.test(nameStr)) kind = 'reaper';

                let baseCol = 0x7c3aed;
                if (typeof m.color === 'number') baseCol = m.color;
                else if (typeof m.color === 'string' && /^#[0-9a-fA-F]{6}$/.test(m.color)) baseCol = parseInt(m.color.slice(1), 16);
                else if (kind === 'slime') baseCol = 0x10b981;
                else if (kind === 'dragon') baseCol = 0xdc2626;
                else if (kind === 'golem') baseCol = 0x64748b;
                else if (kind === 'reaper') baseCol = 0x312e81;

                const bodyMat = new THREE.MeshLambertMaterial({ color: baseCol });
                const darkMat = new THREE.MeshLambertMaterial({ color: 0x1e1b4b, emissive: isBoss ? 0x7f1d1d : 0x1e1b4b });
                const eyeMat = new THREE.MeshBasicMaterial({ color: isBoss ? 0xfef08a : 0xff1e42 });
                const clawMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });

                if (kind === 'slime') {
                    const slimeMat = new THREE.MeshLambertMaterial({ color: baseCol, transparent: true, opacity: 0.88 });
                    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.78 * sc, 18, 14), slimeMat);
                    dome.scale.set(1.15, 0.82, 1.15);
                    dome.position.y = 0.62 * sc;
                    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.28 * sc, 0), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
                    core.position.y = 0.62 * sc;
                    grp.add(dome, core);
                    grp.userData.slimeDome = dome;
                } else if (kind === 'dragon') {
                    // ドラゴン・ワイバーン造形
                    const torso = new THREE.Mesh(new THREE.ConeGeometry(0.55 * sc, 1.45 * sc, 10), bodyMat);
                    torso.rotation.x = Math.PI * 0.35;
                    torso.position.set(0, 0.95 * sc, 0);
                    const head = new THREE.Mesh(new THREE.ConeGeometry(0.36 * sc, 0.85 * sc, 8), bodyMat);
                    head.rotation.x = Math.PI * 0.5;
                    head.position.set(0, 1.42 * sc, 0.55 * sc);
                    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.24 * sc, 1.3 * sc, 8), darkMat);
                    tail.rotation.x = -Math.PI * 0.6;
                    tail.position.set(0, 0.62 * sc, -0.85 * sc);
                    grp.add(torso, head, tail);

                    // 左右のコウモリ翼
                    const wings = [];
                    [-1, 1].forEach(side => {
                        const wPivot = new THREE.Group();
                        wPivot.position.set(side * 0.32 * sc, 1.25 * sc, -0.05 * sc);
                        const wMesh = new THREE.Mesh(new THREE.BoxGeometry(1.15 * sc, 0.06 * sc, 0.62 * sc), darkMat);
                        wMesh.position.x = side * 0.55 * sc;
                        wPivot.add(wMesh);
                        grp.add(wPivot);
                        wings.push({ pivot: wPivot, side });
                    });
                    grp.userData.monsterWings = wings;
                } else if (kind === 'golem') {
                    // 重装甲ゴーレム造形
                    const chest = new THREE.Mesh(new THREE.DodecahedronGeometry(0.75 * sc, 0), bodyMat);
                    chest.position.y = 1.05 * sc;
                    const head = new THREE.Mesh(new THREE.BoxGeometry(0.52 * sc, 0.42 * sc, 0.52 * sc), darkMat);
                    head.position.y = 1.72 * sc;
                    grp.add(chest, head);
                    [-1, 1].forEach(side => {
                        const sh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.38 * sc, 0), darkMat);
                        sh.position.set(side * 0.82 * sc, 1.38 * sc, 0);
                        const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.2 * sc, 0.26 * sc, 0.95 * sc, 8), bodyMat);
                        arm.position.set(side * 0.88 * sc, 0.78 * sc, 0.15 * sc);
                        grp.add(sh, arm);
                    });
                } else if (kind === 'reaper') {
                    // 浮遊する死神・霊体モンスター
                    const cloak = new THREE.Mesh(new THREE.ConeGeometry(0.68 * sc, 1.65 * sc, 12, 1, true), darkMat);
                    cloak.position.y = 1.05 * sc;
                    const hood = new THREE.Mesh(new THREE.SphereGeometry(0.42 * sc, 12, 12), bodyMat);
                    hood.position.y = 1.78 * sc;
                    const scytheHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.05 * sc, 0.05 * sc, 1.9 * sc, 8), clawMat);
                    scytheHandle.position.set(0.65 * sc, 1.15 * sc, 0.2 * sc);
                    scytheHandle.rotation.z = -0.25;
                    const scytheBlade = new THREE.Mesh(new THREE.TorusGeometry(0.45 * sc, 0.06 * sc, 6, 16, Math.PI * 0.8), new THREE.MeshBasicMaterial({ color: 0xf43f5e }));
                    scytheBlade.position.set(0.48 * sc, 1.95 * sc, 0.2 * sc);
                    grp.add(cloak, hood, scytheHandle, scytheBlade);
                } else {
                    // 魔獣・デーモン造形（標準モンスター）
                    const torso = new THREE.Mesh(new THREE.OctahedronGeometry(0.66 * sc, 1), bodyMat);
                    torso.scale.set(1.05, 1.18, 0.95);
                    torso.position.y = 0.88 * sc;
                    const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.46 * sc, 0), bodyMat);
                    head.position.set(0, 1.52 * sc, 0.14 * sc);
                    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.16 * sc, 0.95 * sc, 8), darkMat);
                    tail.rotation.x = -Math.PI * 0.65;
                    tail.position.set(0, 0.58 * sc, -0.68 * sc);
                    grp.add(torso, head, tail);

                    [-1, 1].forEach(side => {
                        const arm = new THREE.Mesh(new THREE.ConeGeometry(0.18 * sc, 0.75 * sc, 6), darkMat);
                        arm.position.set(side * 0.68 * sc, 0.82 * sc, 0.28 * sc);
                        arm.rotation.x = Math.PI * 0.45;
                        const claw = new THREE.Mesh(new THREE.ConeGeometry(0.08 * sc, 0.32 * sc, 5), clawMat);
                        claw.position.set(side * 0.68 * sc, 0.72 * sc, 0.65 * sc);
                        claw.rotation.x = Math.PI * 0.5;
                        grp.add(arm, claw);
                    });
                }

                // 全モンスター共通：悪魔のツノ＆赤く光る眼光
                const eyeY = (kind === 'slime') ? 0.68 * sc : (kind === 'dragon' ? 1.46 * sc : 1.56 * sc);
                const eyeZ = (kind === 'slime') ? 0.76 * sc : (kind === 'dragon' ? 0.82 * sc : 0.52 * sc);
                [-1, 1].forEach(side => {
                    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.14 * sc, 0.58 * sc, 7), darkMat);
                    horn.position.set(side * 0.34 * sc, eyeY + 0.36 * sc, 0.05 * sc);
                    horn.rotation.z = -side * 0.45;
                    grp.add(horn);

                    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.075 * sc, 8, 8), eyeMat);
                    eye.position.set(side * 0.18 * sc, eyeY, eyeZ);
                    grp.add(eye);
                });

                // 足元の邪悪ダーク魔法陣
                const auraMat = new THREE.MeshBasicMaterial({
                    color: isBoss ? 0xef4444 : 0x9333ea,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: isBoss ? 0.86 : 0.62
                });
                const auraRing = new THREE.Mesh(
                    new THREE.RingGeometry(0.75 * sc, (isBoss ? 1.38 : 1.08) * sc, 24),
                    auraMat
                );
                auraRing.rotation.x = -Math.PI / 2;
                auraRing.position.y = 0.06;
                grp.add(auraRing);
                grp.userData.enemyAuraRing = auraRing;

                // ボス専用背後の邪気スパイク輪
                if (isBoss) {
                    const spikeWheel = new THREE.Group();
                    for (let i = 0; i < 6; i++) {
                        const ang = (i / 6) * Math.PI * 2;
                        const sp = new THREE.Mesh(
                            new THREE.ConeGeometry(0.13 * sc, 0.62 * sc, 6),
                            new THREE.MeshBasicMaterial({ color: 0xf43f5e })
                        );
                        sp.position.set(Math.cos(ang) * 1.12 * sc, Math.sin(ang) * 1.12 * sc, 0);
                        sp.rotation.z = ang - Math.PI / 2;
                        spikeWheel.add(sp);
                    }
                    spikeWheel.position.set(0, 1.15 * sc, -0.45 * sc);
                    grp.add(spikeWheel);
                    grp.userData.bossSpikeWheel = spikeWheel;
                }
            }

            // モンスターのアニメーション
            if (grp.userData.enemyAuraRing) grp.userData.enemyAuraRing.rotation.z -= dt * 2.2;
            if (grp.userData.bossSpikeWheel) grp.userData.bossSpikeWheel.rotation.z += dt * 1.8;
            if (grp.userData.slimeDome) {
                const pulse = 1 + Math.sin(now * 5 + idx) * 0.1;
                grp.userData.slimeDome.scale.set(1.15 * pulse, 0.82 / pulse, 1.15 * pulse);
            }
            if (grp.userData.monsterWings) {
                grp.userData.monsterWings.forEach(w => {
                    w.pivot.rotation.z = w.side * Math.sin(now * 7 + idx) * 0.45;
                });
            }
        });
    },

    // ペット装備データ取得
    getPetEquipDef(eqId) {
        return PET_EQUIPS.find(e => e.id === eqId) || PET_EQUIPS[0];
    },

    getEquippedPetEquipId(petId = '') {
        const d = this.saveData || {};
        if (petId && d.petEquips && d.petEquips[petId]) return d.petEquips[petId];
        return d.equippedPetEquip || 'none';
    },

    buyOrEquipPetItem(petId, eqId) {
        const d = this.saveData;
        if (!d) return;
        const item = this.getPetEquipDef(eqId);
        if (!d.unlockedPetEquips) d.unlockedPetEquips = ['none'];

        if (item.id !== 'none' && !d.unlockedPetEquips.includes(item.id)) {
            const coinKey = ('gold' in d) ? 'gold' : (('coins' in d) ? 'coins' : (('money' in d) ? 'money' : 'gold'));
            const curCoins = Number(d[coinKey]) || 0;
            if (curCoins < item.cost) {
                this.showAlertBanner?.(`💰 ゴールド不足！（必要: ${item.cost}G / 所持: ${curCoins}G）`, 1800);
                return;
            }
            d[coinKey] = curCoins - item.cost;
            d.unlockedPetEquips.push(item.id);
            sfx?.playHeal?.();
            this.showAlertBanner?.(`🎉 ペット装備「${item.icon} ${item.name}」を購入＆装着しました！`, 2200);
        } else {
            sfx?.playTone?.(720, 'sine', 0.1, 0.08);
            this.showAlertBanner?.(`🐾 ペット装備「${item.icon} ${item.name}」を装着しました！`, 1600);
        }

        if (!d.petEquips) d.petEquips = {};
        if (petId) d.petEquips[petId] = item.id;
        d.equippedPetEquip = item.id;

        this.saveGame?.(false);
        this.syncLocalPetAppearance?.();
        this.syncFirebaseNow?.(false);
        this.refreshAllHUD?.();
    },

    // ペット3Dモデルへ「ペット装備」を装着
    attachPetEquip3D(petGrp, eqId) {
        if (!petGrp || !eqId || eqId === 'none' || typeof THREE === 'undefined') return;
        const eqGrp = new THREE.Group();
        eqGrp.name = 'pet_equip_3d';

        if (eqId === 'pe_ribbon') {
            const mat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
            const l = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.22, 6), mat);
            l.position.set(-0.11, 0.98, 0.24); l.rotation.z = -Math.PI / 2;
            const r = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.22, 6), mat);
            r.position.set(0.11, 0.98, 0.24); r.rotation.z = Math.PI / 2;
            const c = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
            c.position.set(0, 0.98, 0.25);
            eqGrp.add(l, r, c);
        } else if (eqId === 'pe_bell') {
            const collar = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.04, 8, 20), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
            collar.rotation.x = Math.PI / 2; collar.position.y = 0.28;
            const bell = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
            bell.position.set(0, 0.24, 0.38);
            eqGrp.add(collar, bell);
        } else if (eqId === 'pe_visor') {
            const visor = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.16, 0.12), new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 }));
            visor.position.set(0, 0.68, 0.39);
            eqGrp.add(visor);
        } else if (eqId === 'pe_scarf') {
            const scarfMat = new THREE.MeshLambertMaterial({ color: 0xdc2626 });
            const ring = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.075, 8, 20), scarfMat);
            ring.rotation.x = Math.PI / 2; ring.position.y = 0.28;
            const tail = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.55), scarfMat);
            tail.position.set(-0.22, 0.24, -0.45); tail.rotation.y = 0.3;
            eqGrp.add(ring, tail);
        } else if (eqId === 'pe_crown') {
            const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.2, 8), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
            crown.position.set(0, 1.02, 0);
            const gem = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshBasicMaterial({ color: 0xf43f5e }));
            gem.position.set(0, 1.03, 0.21);
            eqGrp.add(crown, gem);
        } else if (eqId === 'pe_wings') {
            const wMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc, side: THREE.DoubleSide });
            [-1, 1].forEach(side => {
                const wing = new THREE.Mesh(new THREE.PlaneGeometry(0.48, 0.34), wMat);
                wing.position.set(side * 0.52, 0.66, -0.18);
                wing.rotation.y = side * 0.45;
                wing.rotation.z = side * 0.25;
                eqGrp.add(wing);
            });
        } else if (eqId === 'pe_halo') {
            const halo = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.045, 10, 24), new THREE.MeshBasicMaterial({ color: 0xfde047 }));
            halo.rotation.x = Math.PI / 2;
            halo.position.set(0, 1.16, 0);
            eqGrp.add(halo);
        }

        petGrp.add(eqGrp);
    },

    // 自分のペット＆マルチ味方ペットで100%同一デザインを描画する共通ビルダー
    buildUnifiedPetMesh(petInfo) {
        const grp = new THREE.Group();
        let hex = 0x38bdf8;
        if (typeof petInfo.color === 'number') hex = petInfo.color;
        else if (typeof petInfo.color === 'string' && /^#[0-9a-fA-F]{6}$/.test(petInfo.color)) {
            hex = parseInt(petInfo.color.slice(1), 16);
        }

        // 胴体キューブ
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(0.74, 0.66, 0.70),
            new THREE.MeshLambertMaterial({ color: hex })
        );
        body.position.y = 0.56;
        grp.add(body);

        // ちょこんとした耳パーツ
        const earMat = new THREE.MeshLambertMaterial({ color: hex });
        [-0.22, 0.22].forEach(ex => {
            const ear = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.24, 6), earMat);
            ear.position.set(ex, 0.96, 0.06);
            grp.add(ear);
        });

        // 4本の手足
        const limbMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });
        [[-0.23, 0.16, 0.16], [0.23, 0.16, 0.16], [-0.23, 0.16, -0.16], [0.23, 0.16, -0.16]].forEach(([lx, ly, lz]) => {
            const foot = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), limbMat);
            foot.position.set(lx, ly, lz);
            grp.add(foot);
        });

        // 顔文字スクリーン（前面にぴったり貼付・Zファイティング防止）
        const cvs = document.createElement('canvas');
        cvs.width = 256;
        cvs.height = 160;
        const ctx = cvs.getContext('2d');
        ctx.fillStyle = '#072f49';
        ctx.fillRect(8, 8, 240, 144);
        ctx.strokeStyle = '#7dd3fc';
        ctx.lineWidth = 8;
        ctx.strokeRect(8, 8, 240, 144);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 38px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(petInfo.kaomoji || '(・ω・)', 128, 82);

        const tex = new THREE.CanvasTexture(cvs);
        const faceMat = new THREE.MeshBasicMaterial({
            map: tex,
            side: THREE.DoubleSide,
            polygonOffset: true,
            polygonOffsetFactor: -2
        });
        const facePlane = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.42), faceMat);
        facePlane.position.set(0, 0.58, 0.365);
        grp.add(facePlane);

        // ペット装備を3D装着
        if (petInfo.equipId && petInfo.equipId !== 'none') {
            this.attachPetEquip3D(grp, petInfo.equipId);
        }

        grp.traverse(o => { o.frustumCulled = false; });
        return grp;
    },

    buildRemotePetMesh(petInfo) {
        return this.buildUnifiedPetMesh(petInfo);
    },

    // 自分のペット3Dモデルも共通デザイン＋ペット装備に同期
    syncLocalPetAppearance() {
        if (!this.useWebGL || !this.scene || !this.pet || typeof THREE === 'undefined') return;
        const info = this.getMyPetSyncInfo();
        if (!info) return;
        const sig = `${info.petId}|${info.kaomoji}|${info.color}|${info.equipId}`;
        if (this.pet._v19PetSig === sig) return;
        this.pet._v19PetSig = sig;

        const oldPos = this.pet.group ? this.pet.group.position.clone() : new THREE.Vector3(0, 0, 4);
        const oldRotY = this.pet.group ? this.pet.group.rotation.y : 0;
        if (this.pet.group) this.scene.remove(this.pet.group);

        const newGrp = this.buildUnifiedPetMesh(info);
        newGrp.position.copy(oldPos);
        newGrp.rotation.y = oldRotY;
        this.scene.add(newGrp);
        this.pet.group = newGrp;
    },

    getPetCustomName(petId, fallbackName = 'ペット') {
        const d = this.saveData || {};
        if (petId && d.petNames && d.petNames[petId]) return String(d.petNames[petId]);
        if (d.customPetName) return String(d.customPetName);
        return String(fallbackName || 'ペット');
    },

    setPetCustomName(petId, rawName) {
        const clean = String(rawName || '').trim().slice(0, 14);
        if (!this.saveData) return;
        if (!this.saveData.petNames) this.saveData.petNames = {};
        if (petId) {
            if (clean) this.saveData.petNames[petId] = clean;
            else delete this.saveData.petNames[petId];
        }
        this.saveData.customPetName = clean;
        if (this.pet && clean) this.pet.name = clean;
        this.saveGame?.(false);
        this.syncFirebaseNow?.(false);
        this.showAlertBanner?.(clean ? `🐾 ペット名を「${clean}」に変更しました！` : '🐾 ペット名を初期値に戻しました', 1800);
    },

    getMyPetSyncInfo() {
        const d = this.saveData || {};
        const rawId = d.equippedPet || d.equippedPetId || d.petId || d.activePet || d.activePetId || d.companionId || d.selectedPet || this.pet?.id || '';
        const hasPetEntity = !!(this.pet && (this.pet.group || this.pet.mesh || this.pet.kaomoji));
        if ((!rawId || rawId === 'none') && !hasPetEntity) return null;

        const petKey = String(rawId || this.pet?.id || 'default_pet');
        let petDef = null;
        if (typeof PETS !== 'undefined' && PETS) {
            petDef = Array.isArray(PETS)
                ? PETS.find(p => p && (p.id === petKey || p.petId === petKey))
                : (PETS[petKey] || Object.values(PETS).find(p => p && (p.id === petKey || p.petId === petKey)));
        }
        const savedObj = (d.ownedPets && d.ownedPets[petKey])
            || (d.petData && d.petData[petKey])
            || (Array.isArray(d.pets) ? d.pets.find(p => p && (p.id === petKey)) : null);

        const kaomoji = this.pet?.kaomoji || petDef?.kaomoji || savedObj?.kaomoji || '(・ω・)';
        const baseName = petDef?.name || savedObj?.name || this.pet?.name || 'ペット';
        const name = this.getPetCustomName(petKey, baseName);
        const lv = savedObj?.lv || d.petLevels?.[petKey] || this.pet?.lv || 1;
        const color = petDef?.color || petDef?.hexColor || savedObj?.color || '#38bdf8';
        const equipId = this.getEquippedPetEquipId(petKey);
        return { petId: petKey, kaomoji: String(kaomoji), name: String(name), lv: Number(lv) || 1, color, equipId };
    }
});
// ▲▲▲ ここまで【2/4】 ▲▲▲
// ▼▼▼ ここから【3/4】 ▼▼▼
Object.assign(KaomojiMMORPG.prototype, {

    syncSkillDescriptionsAndEffects() {
        if (typeof SKILLS === 'undefined' || !SKILLS) return;
        const list = Array.isArray(SKILLS) ? SKILLS : Object.values(SKILLS);
        list.forEach(sk => {
            if (!sk || typeof sk !== 'object') return;
            const key = `${sk.id || ''} ${sk.name || ''}`.toLowerCase();
            if (/aurora|sanctuary|polar|極光|聖域|オーロラ/.test(key)) {
                sk.type = 'buff';
                sk.target = 'self';
                const newDesc = '【フィールド展開】8秒間、極光の聖域を展開し範囲内の自分と味方のHPを毎秒回復＋ATK/DEF/SPD強化！(Lv上昇で範囲・回復量UP)';
                if ('desc' in sk) sk.desc = newDesc;
                if ('description' in sk) sk.description = newDesc;
            } else if (/bigbang|big_bang|genesis|cosmos|creation|supernova|ビッグバン|びっくばん|そうせい|創世|創星|創生/.test(key)) {
                const newDesc = '【創世超爆発】宇宙のビッグバンを引き起こし広範囲の敵に絶大なダメージ！(Lv3で魔法陣、Lv5で公転オーブ追加)';
                if ('desc' in sk) sk.desc = newDesc;
                if ('description' in sk) sk.description = newDesc;
            } else {
                const cur = sk.desc || sk.description || '';
                if (cur && !cur.includes('Lv.3')) {
                    const updated = `${cur} (Lv.3で魔法陣・Lv.5で公転オーブ進化)`;
                    if ('desc' in sk) sk.desc = updated;
                    if ('description' in sk) sk.description = updated;
                }
            }
        });
    },

    pushSystemEventLog(text, bannerMs = 2200) {
        if (!text) return;
        const channel = this.saveData?.roomPassEnabled ? 'room' : 'global';
        if (this.addChatMessage) this.addChatMessage(channel, '📢', 'SYSTEM', text, false);
        if (bannerMs > 0 && this.showAlertBanner) this.showAlertBanner(text, bannerMs);
    },

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
            const d = this.saveData || {};

            MQTT_SERVERS.forEach((sv, idx) => {
                try {
                    const willPayload = JSON.stringify({
                        type: 'leave',
                        uid: myUid,
                        isWill: true,
                        kaomoji: this.getBasePlayerKaomoji ? this.getBasePlayerKaomoji() : '(´・ω・`)',
                        lv: d.lv || 1,
                        ts: Date.now()
                    });
                    const c = window.mqtt.connect(sv.url, {
                        clientId: 'kmj_' + myUid + '_' + idx + '_' + Math.random().toString(36).slice(2, 5),
                        clean: true,
                        keepalive: 25,
                        connectTimeout: 6000,
                        reconnectPeriod: 2500,
                        will: { topic: rTopic, payload: willPayload, qos: 0 }
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
                            const roomLabel = this.saveData.roomPassEnabled ? '合言葉ルーム' : '公開オンライン';
                            this.pushSystemEventLog(`🌐 ${roomLabel}に接続完了！（${sv.name}）`, 2000);
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
        const kao = this.getBasePlayerKaomoji ? this.getBasePlayerKaomoji() : '(´・ω・`)';
        const lv = this.saveData?.lv || 1;
        if (this.mqttClients) {
            this.mqttClients.forEach(c => {
                try {
                    if (sendLeave && c.connected && this.curRoomTopic) {
                        c.publish(this.curRoomTopic, JSON.stringify({
                            type: 'leave', uid: myUid, isWill: false, kaomoji: kao, lv, ts: Date.now()
                        }));
                    }
                    c.end(true);
                } catch (e) {}
            });
        }
        this.mqttClients = [];
    },

    removeRemotePlayerEntity(uid) {
        if (this._pendingLeaveTimers && this._pendingLeaveTimers.has(uid)) {
            clearTimeout(this._pendingLeaveTimers.get(uid));
            this._pendingLeaveTimers.delete(uid);
        }
        const rp = this.remotePlayers.get(uid);
        if (!rp) return;
        if (rp.group && this.scene) this.scene.remove(rp.group);
        if (rp.petGroup && this.scene) this.scene.remove(rp.petGroup);
        if (rp.plateEl) rp.plateEl.remove();
        if (rp.petPlateEl) rp.petPlateEl.remove();
        this.remotePlayers.delete(uid);
    },

    clearRemotePlayers() {
        [...this.remotePlayers.keys()].forEach(uid => this.removeRemotePlayerEntity(uid));
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
        this.pushSystemEventLog('📴 オフラインモードに切り替えました', 1500);
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
            pet: this.getMyPetSyncInfo(),
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
        const s1 = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), mat); s1.position.set(-0.1, 0.08, 0);
        const s2 = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), mat); s2.position.set(0.1, 0.08, 0);
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.32, 12), mat); cone.position.set(0, -0.1, 0); cone.rotation.z = Math.PI;
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
            backflip: 2.2, tornado_dance: 2.6, dogeza: 2.8, chabudai_rage: 2.4,
            heart_float: 2.7, ghost_faint: 3.0, sleep_bubble: 2.9, greeting_wave: 2.3,
            salute_hero: 2.3, cry_fountain: 2.7, rocket_zoom: 2.4, bow_polite: 2.5
        };
        const maxT = durMap[motionType] || 2.4;
        ent.emoteAnim = { style: motionType, timer: maxT, maxTimer: maxT };

        if (!this.useWebGL || !this.scene || !ent.pos || typeof THREE === 'undefined') return;
        if (!this._slashEffects) this._slashEffects = [];

        const px = ent.pos.x, pz = ent.pos.z, rotY = ent.rotY || 0;
        if (motionType === 'chabudai_rage') {
            if (this.createChabudai3D) {
                const dirX = Math.sin(rotY), dirZ = Math.cos(rotY);
                const tableMesh = this.createChabudai3D();
                tableMesh.position.set(px + dirX * 1.1, 1.0, pz + dirZ * 1.1);
                tableMesh.rotation.y = rotY;
                this.scene.add(tableMesh);
                this._slashEffects.push({ kind: 'chabudai', mesh: tableMesh, life: 1.05, maxLife: 1.05, vx: dirX * 11.5, vz: dirZ * 11.5 });
            }
            const rMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
            const ring = new THREE.Mesh(new THREE.RingGeometry(0.5, 1.1, 24), rMat);
            ring.rotation.x = -Math.PI / 2; ring.position.set(px, 0.12, pz);
            this.scene.add(ring);
            this._slashEffects.push({ kind: 'shockwave', mesh: ring, mat: rMat, life: 1.5, maxLife: 1.5 });
        } else if (motionType === 'heart_float') {
            for (let i = 0; i < 6; i++) {
                const ang = (i / 6) * Math.PI * 2;
                const h = this.createHeart3D(i % 2 === 0 ? 0xf43f5e : 0xf472b6);
                h.position.set(px + Math.cos(ang) * 0.85, 1.2 + i * 0.15, pz + Math.sin(ang) * 0.85);
                this.scene.add(h);
                this._slashEffects.push({ kind: 'heart', mesh: h, life: 2.2, maxLife: 2.2, cx: px, cz: pz, ang, rad: 0.95, vy: 1.15 });
            }
        } else if (motionType === 'ghost_faint') {
            const ghost = new THREE.Group();
            const gMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.82 });
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 14, 14), gMat);
            const tail = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.7, 14), gMat);
            tail.position.y = -0.35; tail.rotation.x = Math.PI;
            ghost.add(head, tail); ghost.position.set(px, 1.0, pz);
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
                const drop = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
                drop.position.set(px + rightX * 0.45 * side, 1.75, pz + rightZ * 0.45 * side);
                this.scene.add(drop);
                this._slashEffects.push({ kind: 'tear', mesh: drop, life: 1.6, maxLife: 1.6, vx: rightX * side * (2.2 + (i % 3) * 0.5), vy: 3.2 + (i % 4) * 0.4, vz: rightZ * side * (2.2 + (i % 3) * 0.5), delay: i * 0.08 });
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
                const petal = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.16), new THREE.MeshBasicMaterial({ color: 0xf9a8d4, side: THREE.DoubleSide }));
                petal.position.set(px + Math.cos(ang) * 1.1, 2.8 + (i % 3) * 0.4, pz + Math.sin(ang) * 1.1);
                this.scene.add(petal);
                this._slashEffects.push({ kind: 'petal', mesh: petal, life: 2.2, maxLife: 2.2, vx: Math.cos(ang) * 0.6, vy: -1.1, vz: Math.sin(ang) * 0.6 });
            }
        } else {
            const c1 = motionType === 'tornado_dance' ? 0x38bdf8 : 0xfde047;
            const c2 = motionType === 'dogeza' ? 0x60a5fa : 0xf472b6;
            for (let i = 0; i < 8; i++) {
                const ang = (i / 8) * Math.PI * 2;
                const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? c1 : c2 }));
                star.position.set(px + Math.cos(ang) * 0.8, 2.1, pz + Math.sin(ang) * 0.8);
                this.scene.add(star);
                this._slashEffects.push({ kind: 'star', mesh: star, life: 1.5, maxLife: 1.5, vx: Math.cos(ang) * 1.8, vy: 1.8, vz: Math.sin(ang) * 1.8 });
            }
        }
    },

    updateHeadBubbles(dt) {
        if (!this._headBubbles || !this._headBubbles.length) return;
        this._headBubbles = this._headBubbles.filter(b => {
            b.life -= dt;
            if (b.life <= 0) { b.el.remove(); return false; }
            let target = null, scale = 1.0;
            if (b.isSelf && this.player) {
                target = this.player.pos;
                scale = this.getPlayerBodyScale ? this.getPlayerBodyScale() : 1.0;
            } else if (!b.isSelf) {
                const rp = this.remotePlayers.get(b.uid);
                if (rp && rp.visible) { target = rp.pos; scale = rp.bodyScale || 1.0; }
            }
            if (!target) { b.el.style.display = 'none'; return true; }
            const worldPos = new THREE.Vector3(target.x, 2.85 * scale, target.z);
            let sc = this.projectToScreen ? this.projectToScreen(worldPos) : null;
            if (!sc && this.camera && this.canvas) {
                const v = worldPos.clone().project(this.camera);
                if (v.z < 1) sc = { x: (v.x * 0.5 + 0.5) * this.canvas.clientWidth, y: (-v.y * 0.5 + 0.5) * this.canvas.clientHeight };
            }
            if (sc) {
                b.el.style.display = 'block';
                b.el.style.left = sc.x + 'px';
                b.el.style.top = sc.y + 'px';
                b.el.style.opacity = b.life < 0.6 ? String(b.life / 0.6) : '1';
            } else b.el.style.display = 'none';
            return true;
        });
    },

    resolveSkillMeta(slotIdx) {
        const d = this.saveData || {};
        const candidates = [d.equippedSkills?.[slotIdx], d.skillSlots?.[slotIdx], d.activeSkills?.[slotIdx], d.skills?.[slotIdx], d.hotbar?.[slotIdx]].filter(v => v !== undefined && v !== null && v !== '');
        let found = null;
        if (typeof SKILLS !== 'undefined' && SKILLS) {
            const list = Array.isArray(SKILLS) ? SKILLS : Object.values(SKILLS);
            for (const cand of candidates) {
                if (!Array.isArray(SKILLS) && SKILLS[cand]) { found = SKILLS[cand]; break; }
                found = list.find((s, i) => s && (s.id === cand || s.skillId === cand || i === Number(cand)));
                if (found) break;
            }
            if (!found && list[slotIdx]) found = list[slotIdx];
        }
        const btnEl = document.getElementById(`skill-slot-${slotIdx}`) || document.getElementById(`btn-skill-${slotIdx}`) || document.querySelectorAll('.skill-slot-btn, .skill-slot, .skill-btn')[slotIdx];
        const domText = btnEl ? `${btnEl.textContent || ''} ${btnEl.title || ''}` : '';
        const skillId = String(found?.id || found?.skillId || candidates[0] || `slot_${slotIdx}`);
        const skillName = (String(found?.name || found?.title || '') + ' ' + domText).trim();
        const combined = (skillId + ' ' + skillName).toLowerCase();
        const isChabudai = /chabu|table|flip|ちゃぶ|卓|返|┻|┬/.test(combined);
        const skillLv = Math.max(1, Number(d.skillLevels?.[skillId] ?? d.skillLvs?.[skillId] ?? found?.lv ?? found?.level ?? 1) || 1);

        let skillCategory = 'slash';
        if (isChabudai) skillCategory = 'chabudai';
        else if (/aurora|sanctuary|polar|極光|聖域|オーロラ/.test(combined)) skillCategory = 'aurora';
        else if (/bigbang|big_bang|genesis|cosmos|creation|supernova|ビッグバン|びっくばん|そうせい|創世|創星|創生/.test(combined)) skillCategory = 'bigbang';
        else if (/heal|cure|prayer|bless|holy|light|buff|boost|aura|guard|shield|haste|support|癒|回復|祈|聖|浄化|強化|鼓舞|結界|加速|守護|支援|補助/.test(combined) || found?.type === 'heal' || found?.type === 'buff') skillCategory = 'support';
        else if (/beam|laser|ray|cannon|kame|ビーム|レーザー|光線|砲|波動|閃光/.test(combined)) skillCategory = 'beam';
        else if (/zero|nova|absolute|blizzard|ice|frost|零度|ノヴァ|氷|吹雪|凍|雪/.test(combined)) skillCategory = 'nova_ice';
        else if (/fire|meteor|flare|burn|bomb|flame|炎|爆|火|隕|紅蓮|業火/.test(combined)) skillCategory = 'fire';
        else if (/thunder|bolt|spark|volt|lightning|雷|電|閃|迅/.test(combined)) skillCategory = 'thunder';
        else if (/wind|storm|tornado|gale|cyclone|風|嵐|竜巻|疾風|旋風/.test(combined)) skillCategory = 'wind';
        else if (/dark|void|shadow|abyss|gravity|闇|黒|影|重力|深淵|冥/.test(combined)) skillCategory = 'void';

        return { slotIdx, skillId, skillName, skillLv, skillCategory, isChabudai };
    },

    getSkillAccentColor(skillId, fallbackHex) {
        if (!skillId) return fallbackHex;
        let h = 0;
        for (let i = 0; i < skillId.length; i++) h = (h * 31 + skillId.charCodeAt(i)) >>> 0;
        const palette = [0x38bdf8, 0xf472b6, 0xa855f7, 0x34d399, 0xfacc15, 0xf97316, 0x2dd4bf, 0x818cf8];
        return (h % 3 === 0) ? fallbackHex : palette[h % palette.length];
    },

    createChabudai3D() {
        const grp = new THREE.Group();
        const woodMat = new THREE.MeshLambertMaterial({ color: 0xb45309 });
        const darkMat = new THREE.MeshLambertMaterial({ color: 0x451a03 });
        grp.add(new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 0.16, 24), woodMat));
        [[-0.72, -0.72], [0.72, -0.72], [-0.72, 0.72], [0.72, 0.72]].forEach(([lx, lz]) => {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.56, 0.15), darkMat);
            leg.position.set(lx, -0.32, lz); grp.add(leg);
        });
        return grp;
    },

    spawnSupportSkillVisual(entity, skillLv = 1, mainColor = 0x34d399) {
        if (!this.useWebGL || !this.scene || !entity?.pos || typeof THREE === 'undefined') return;
        if (!this._slashEffects) this._slashEffects = [];
        const lvScale = 1 + Math.min(0.65, (skillLv - 1) * 0.12);
        const supGrp = new THREE.Group();

        const innerMat = new THREE.MeshBasicMaterial({ color: 0xfef08a, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
        const innerRing = new THREE.Mesh(new THREE.RingGeometry(0.9 * lvScale, 1.45 * lvScale, 28), innerMat);
        innerRing.rotation.x = -Math.PI / 2; innerRing.position.y = 0.09;

        const outerMat = new THREE.MeshBasicMaterial({ color: mainColor, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
        const outerRing = new THREE.Mesh(new THREE.RingGeometry(1.75 * lvScale, 2.25 * lvScale, 32), outerMat);
        outerRing.rotation.x = -Math.PI / 2; outerRing.position.y = 0.12;

        const haloMat = new THREE.MeshBasicMaterial({ color: 0xfde047, transparent: true, opacity: 0.95 });
        const halo = new THREE.Mesh(new THREE.TorusGeometry(0.65 * lvScale, 0.08, 10, 28), haloMat);
        halo.rotation.x = Math.PI / 2; halo.position.y = 2.65;

        const veilMat = new THREE.MeshBasicMaterial({ color: mainColor, side: THREE.DoubleSide, transparent: true, opacity: 0.28 });
        const veilCyl = new THREE.Mesh(new THREE.CylinderGeometry(1.5 * lvScale, 1.9 * lvScale, 3.6, 24, 1, true), veilMat);
        veilCyl.position.y = 1.8;
        supGrp.add(innerRing, outerRing, halo, veilCyl);

        const crosses = [];
        const crossCount = skillLv >= 5 ? 10 : (skillLv >= 3 ? 8 : 6);
        for (let i = 0; i < crossCount; i++) {
            const ang = (i / crossCount) * Math.PI * 2;
            const cMesh = new THREE.Group();
            const cMat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x4ade80 : 0xfef08a, transparent: true, opacity: 0.95 });
            cMesh.add(new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.09, 0.09), cMat), new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.32, 0.09), cMat));
            const dist = (1.1 + (i % 2) * 0.55) * lvScale;
            cMesh.position.set(Math.cos(ang) * dist, 0.4 + (i % 3) * 0.35, Math.sin(ang) * dist);
            supGrp.add(cMesh);
            crosses.push({ mesh: cMesh, mat: cMat, ang, dist, vy: 1.4 + (i % 3) * 0.35 });
        }
        supGrp.position.set(entity.pos.x, 0, entity.pos.z);
        this.scene.add(supGrp);
        this._slashEffects.push({ kind: 'support_bless', mesh: supGrp, innerRing, outerRing, halo, veilCyl, innerMat, outerMat, haloMat, veilMat, crosses, followEntity: entity, life: 1.15, maxLife: 1.15 });
    },

    spawnAuroraSanctuary(x, z, skillLv = 1, casterName = '') {
        if (!this.useWebGL || !this.scene || typeof THREE === 'undefined') return;
        if (!this._sanctuaryFields) this._sanctuaryFields = [];
        const lvBonus = Math.min(2.5, (skillLv - 1) * 0.25);
        const radius = 5.4 + lvBonus;
        const duration = 8.0 + Math.min(6.0, (skillLv - 1) * 0.6);
        const grp = new THREE.Group();
        const baseMat = new THREE.MeshBasicMaterial({ color: 0x2dd4bf, side: THREE.DoubleSide, transparent: true, opacity: 0.48 });
        const baseDisc = new THREE.Mesh(new THREE.CircleGeometry(radius, 36), baseMat);
        baseDisc.rotation.x = -Math.PI / 2; baseDisc.position.y = 0.08;
        const outerMat = new THREE.MeshBasicMaterial({ color: 0xf472b6, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
        const outerRing = new THREE.Mesh(new THREE.RingGeometry(radius - 0.35, radius, 36), outerMat);
        outerRing.rotation.x = -Math.PI / 2; outerRing.position.y = 0.11;
        const wallMat = new THREE.MeshBasicMaterial({ color: 0x5eead4, side: THREE.DoubleSide, transparent: true, opacity: 0.26 });
        const wallCyl = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 3.4 + lvBonus * 0.5, 32, 1, true), wallMat);
        wallCyl.position.y = 1.7;
        grp.add(baseDisc, outerRing, wallCyl);

        const pillars = [];
        const pColors = [0x34d399, 0x38bdf8, 0xf472b6, 0xfde047];
        const count = skillLv >= 5 ? 8 : (skillLv >= 3 ? 6 : 4);
        for (let i = 0; i < count; i++) {
            const ang = (i / count) * Math.PI * 2;
            const pMat = new THREE.MeshBasicMaterial({ color: pColors[i % pColors.length], transparent: true, opacity: 0.78 });
            const pMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), pMat);
            pMesh.position.set(Math.cos(ang) * (radius * 0.65), 0.8 + (i % 3) * 0.6, Math.sin(ang) * (radius * 0.65));
            grp.add(pMesh);
            pillars.push({ mesh: pMesh, ang, dist: radius * 0.65, phase: i * 0.9 });
        }
        grp.position.set(x, 0, z);
        this.scene.add(grp);
        this._sanctuaryFields.push({ grp, x, z, radius, skillLv, life: duration, maxLife: duration, tickTimer: 0, outerRing, wallCyl, baseMat, outerMat, wallMat, pillars });
        if (casterName) this.pushSystemEventLog(`🌈 ${casterName} が「極光の聖域 Lv.${skillLv}」を展開！`, 2000);
    },

    updateSanctuaryFields(dt) {
        if (!this._sanctuaryFields || !this._sanctuaryFields.length) return;
        let insideAny = false, maxBuffLv = 1;
        this._sanctuaryFields = this._sanctuaryFields.filter(sf => {
            sf.life -= dt;
            if (sf.life <= 0) {
                if (this.scene) this.scene.remove(sf.grp);
                sf.grp.traverse?.(o => { o.geometry?.dispose?.(); o.material?.dispose?.(); });
                return false;
            }
            const fade = sf.life < 1.2 ? (sf.life / 1.2) : 1.0;
            sf.outerRing.rotation.z += dt * 1.4;
            sf.wallCyl.rotation.y -= dt * 0.8;
            sf.baseMat.opacity = 0.42 * fade;
            sf.outerMat.opacity = 0.82 * fade;
            sf.wallMat.opacity = (0.22 + Math.sin(sf.life * 4) * 0.06) * fade;
            sf.pillars.forEach(pl => {
                pl.ang += dt * 1.2;
                pl.mesh.position.x = Math.cos(pl.ang) * pl.dist;
                pl.mesh.position.z = Math.sin(pl.ang) * pl.dist;
                pl.mesh.position.y = 1.3 + Math.sin(sf.life * 3.5 + pl.phase) * 0.75;
                pl.mesh.rotation.y += dt * 3;
            });
            if (this.player && this.player.pos) {
                if (Math.hypot(this.player.pos.x - sf.x, this.player.pos.z - sf.z) <= sf.radius) {
                    insideAny = true;
                    maxBuffLv = Math.max(maxBuffLv, sf.skillLv || 1);
                    sf.tickTimer += dt;
                    if (sf.tickTimer >= 1.0) {
                        sf.tickTimer -= 1.0;
                        const maxHp = this.player.maxHp || this.saveData?.maxHp || 100;
                        const curHp = this.player.hp ?? maxHp;
                        if (curHp > 0 && curHp < maxHp) {
                            const healAmt = Math.max(5, Math.floor(maxHp * (0.08 + sf.skillLv * 0.015)));
                            this.player.hp = Math.min(maxHp, curHp + healAmt);
                            if (this.spawnFloatingText && this.player.pos) this.spawnFloatingText(this.player.pos, `+${healAmt} 🌈聖域`, '#34d399');
                            this.refreshAllHUD?.();
                        }
                    }
                }
            }
            return true;
        });
        if (insideAny) {
            if (!this._inSanctuaryBuff) {
                this._inSanctuaryBuff = true;
                this._sanctuaryBuffLv = maxBuffLv;
                this.showAlertBanner(`🌈 極光の聖域バフ発動中！（ATK/DEF/SPD UP Lv.${maxBuffLv}）`, 1800);
            }
            this._sanctuaryBuffLv = maxBuffLv;
        } else if (this._inSanctuaryBuff) {
            this._inSanctuaryBuff = false;
            this._sanctuaryBuffLv = 0;
        }
    },

    attachSkillLevelEvolution(rootGroup, skillLv, mainColor) {
        if (skillLv < 3) return null;
        const lvRingMat = new THREE.MeshBasicMaterial({ color: skillLv >= 5 ? 0xfde047 : mainColor, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
        const lvRing = new THREE.Mesh(new THREE.RingGeometry(1.4, 1.85, 24), lvRingMat);
        lvRing.rotation.x = -Math.PI / 2; lvRing.position.y = 0.15;
        rootGroup.add(lvRing);
        const orbs = [];
        if (skillLv >= 5) {
            for (let i = 0; i < 4; i++) {
                const ang = (i / 4) * Math.PI * 2;
                const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0xfde047 : mainColor }));
                orb.position.set(Math.cos(ang) * 1.6, 1.1, Math.sin(ang) * 1.6);
                rootGroup.add(orb);
                orbs.push({ orb, ang });
            }
        }
        return { lvRing, lvRingMat, orbs };
    },

    triggerAttackVisual(entity, isSkill = false, skillInfo = null) {
        if (!entity) return;
        entity.attackAnimTimer = 0.36;
        entity.attackIsSkill = isSkill;
        if (!this.useWebGL || !this.scene || !entity.pos || typeof THREE === 'undefined') return;
        if (!this._slashEffects) this._slashEffects = [];

        const rotY = entity.rotY || 0, dirX = Math.sin(rotY), dirZ = Math.cos(rotY);
        const sId = String(skillInfo?.skillId || '').toLowerCase();
        const fullKey = (sId + ' ' + String(skillInfo?.skillName || '')).toLowerCase();
        const skillLv = Math.max(1, Number(skillInfo?.skillLv) || 1);
        const lvScale = 1 + Math.min(0.85, (skillLv - 1) * 0.15);

        let cat = skillInfo?.skillCategory || '';
        if (!cat && isSkill) {
            if (skillInfo?.isChabudai || /chabu|table|flip|ちゃぶ|卓|返|┻|┬/.test(fullKey)) cat = 'chabudai';
            else if (/aurora|sanctuary|polar|極光|聖域|オーロラ/.test(fullKey)) cat = 'aurora';
            else if (/bigbang|big_bang|genesis|cosmos|creation|supernova|ビッグバン|びっくばん|そうせい|創世|創星|創生/.test(fullKey)) cat = 'bigbang';
            else if (/heal|cure|prayer|bless|holy|light|buff|boost|aura|guard|shield|haste|support|癒|回復|祈|聖|浄化|強化|鼓舞|結界|加速|守護|支援|補助/.test(fullKey)) cat = 'support';
            else if (/beam|laser|ray|cannon|kame|ビーム|レーザー|光線|砲|波動|閃光/.test(fullKey)) cat = 'beam';
            else if (/zero|nova|absolute|blizzard|ice|frost|零度|ノヴァ|氷|吹雪|凍|雪/.test(fullKey)) cat = 'nova_ice';
            else if (/fire|meteor|flare|burn|bomb|flame|炎|爆|火|隕|紅蓮|業火/.test(fullKey)) cat = 'fire';
            else if (/thunder|bolt|spark|volt|lightning|雷|電|閃|迅/.test(fullKey)) cat = 'thunder';
            else if (/wind|storm|tornado|gale|cyclone|風|嵐|竜巻|疾風|旋風/.test(fullKey)) cat = 'wind';
            else if (/dark|void|shadow|abyss|gravity|闇|黒|影|重力|深淵|冥/.test(fullKey)) cat = 'void';
            else cat = 'slash';
        }

        if (isSkill) {
            if (cat === 'chabudai') {
                const tableMesh = this.createChabudai3D();
                tableMesh.scale.setScalar(lvScale);
                tableMesh.position.set(entity.pos.x + dirX * 1.1, 1.0, entity.pos.z + dirZ * 1.1);
                tableMesh.rotation.y = rotY;
                this.scene.add(tableMesh);
                this._slashEffects.push({ kind: 'chabudai', mesh: tableMesh, life: 0.95, maxLife: 0.95, vx: dirX * (12.0 + skillLv * 0.4), vz: dirZ * (12.0 + skillLv * 0.4) });
                return;
            }
            if (cat === 'aurora') {
                const caster = (entity === this.player) ? this.getBasePlayerKaomoji() : (entity.kaomoji || '仲間');
                this.spawnAuroraSanctuary(entity.pos.x, entity.pos.z, skillLv, caster);
                this.spawnSupportSkillVisual(entity, skillLv, 0x2dd4bf);
                return;
            }
            if (cat === 'support') {
                this.spawnSupportSkillVisual(entity, skillLv, this.getSkillAccentColor(sId, 0x34d399));
                return;
            }
            if (cat === 'bigbang') {
                const bbGrp = new THREE.Group();
                const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.98 });
                const coreSphere = new THREE.Mesh(new THREE.SphereGeometry(1.15 * lvScale, 24, 24), coreMat);
                coreSphere.position.y = 1.6;
                const auraMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.55, wireframe: true });
                const auraSphere = new THREE.Mesh(new THREE.SphereGeometry(2.3 * lvScale, 18, 16), auraMat);
                auraSphere.position.y = 1.6;
                const waveMat = new THREE.MeshBasicMaterial({ color: 0xfde047, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
                const waveRing = new THREE.Mesh(new THREE.RingGeometry(1.0, 4.8 * lvScale, 36), waveMat);
                waveRing.rotation.x = -Math.PI / 2; waveRing.position.y = 0.16;
                bbGrp.add(coreSphere, auraSphere, waveRing);

                const meteors = [];
                const mCols = [0xfde047, 0xf472b6, 0x38bdf8, 0xa855f7];
                for (let i = 0; i < 16; i++) {
                    const ang = (i / 16) * Math.PI * 2;
                    const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.32 * lvScale, 0), new THREE.MeshBasicMaterial({ color: mCols[i % mCols.length] }));
                    star.position.set(0, 1.6, 0);
                    bbGrp.add(star);
                    meteors.push({ mesh: star, vx: Math.cos(ang) * (8.5 + (i % 4) * 1.5), vy: 3.0 + ((i % 3) - 0.5) * 3.0, vz: Math.sin(ang) * (8.5 + (i % 4) * 1.5) });
                }
                const lvEvo = this.attachSkillLevelEvolution(bbGrp, skillLv, 0xf43f5e);
                bbGrp.position.set(entity.pos.x + dirX * 2.5, 0, entity.pos.z + dirZ * 2.5);
                this.scene.add(bbGrp);
                this._slashEffects.push({ kind: 'bigbang', mesh: bbGrp, coreSphere, auraSphere, waveRing, coreMat, auraMat, waveMat, meteors, lvEvo, life: 1.05, maxLife: 1.05 });
                return;
            }
            if (cat === 'beam') {
                const mainCol = this.getSkillAccentColor(sId, 0x38bdf8);
                const beamGroup = new THREE.Group();
                const length = 14.0 + Math.min(8.0, (skillLv - 1) * 1.2);
                const radius = 0.72 + Math.min(0.65, (skillLv - 1) * 0.1);
                const outerMat = new THREE.MeshBasicMaterial({ color: mainCol, transparent: true, opacity: 0.65 });
                const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.96 });
                const outerCyl = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 1.25, length, 20, 1, true), outerMat);
                outerCyl.rotation.x = Math.PI / 2; outerCyl.position.z = length / 2 + 0.9;
                const coreCyl = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.42, radius * 0.5, length, 16), coreMat);
                coreCyl.rotation.x = Math.PI / 2; coreCyl.position.z = length / 2 + 0.9;
                beamGroup.add(outerCyl, coreCyl);
                const rings = [];
                const ringCount = skillLv >= 5 ? 6 : (skillLv >= 3 ? 5 : 4);
                for (let i = 0; i < ringCount; i++) {
                    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius * 1.5, 0.09, 8, 24), new THREE.MeshBasicMaterial({ color: 0xfde047, side: THREE.DoubleSide, transparent: true, opacity: 0.9 }));
                    ring.position.z = 2.0 + (i / ringCount) * (length - 2.0);
                    beamGroup.add(ring); rings.push(ring);
                }
                beamGroup.position.set(entity.pos.x, 1.15, entity.pos.z); beamGroup.rotation.y = rotY;
                this.scene.add(beamGroup);
                this._slashEffects.push({ kind: 'beam', mesh: beamGroup, outerCyl, coreCyl, outerMat, coreMat, rings, life: 0.74, maxLife: 0.74 });
                return;
            }
            if (cat === 'nova_ice') {
                const novaGroup = new THREE.Group();
                const ringMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
                const magicRing = new THREE.Mesh(new THREE.RingGeometry(1.1, 4.5 * lvScale, 32), ringMat);
                magicRing.rotation.x = -Math.PI / 2; magicRing.position.y = 0.12;
                const domeMat = new THREE.MeshBasicMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.35, wireframe: true });
                const dome = new THREE.Mesh(new THREE.SphereGeometry(3.6 * lvScale, 16, 12), domeMat);
                dome.position.y = 0.5;
                novaGroup.add(magicRing, dome);
                const spikes = [];
                const spikeMat = new THREE.MeshLambertMaterial({ color: 0xe0f2fe, emissive: 0x0284c7, transparent: true, opacity: 0.92 });
                const spikeCount = skillLv >= 5 ? 14 : (skillLv >= 3 ? 10 : 8);
                for (let i = 0; i < spikeCount; i++) {
                    const ang = (i / spikeCount) * Math.PI * 2;
                    const dist = ((i % 2 === 0) ? 2.3 : 3.8) * lvScale;
                    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.42 * lvScale, 2.7 * lvScale, 6), spikeMat);
                    spike.position.set(Math.cos(ang) * dist, -1.2, Math.sin(ang) * dist);
                    novaGroup.add(spike); spikes.push(spike);
                }
                const lvEvo = this.attachSkillLevelEvolution(novaGroup, skillLv, 0x38bdf8);
                novaGroup.position.set(entity.pos.x, 0, entity.pos.z);
                this.scene.add(novaGroup);
                this._slashEffects.push({ kind: 'nova_ice', mesh: novaGroup, magicRing, dome, spikes, ringMat, domeMat, spikeMat, lvEvo, life: 0.95, maxLife: 0.95 });
                return;
            }
            const customCol = this.getSkillAccentColor(sId, cat === 'fire' ? 0xf97316 : (cat === 'thunder' ? 0xfacc15 : (cat === 'wind' ? 0x34d399 : (cat === 'void' ? 0xa855f7 : 0xf472b6))));
            const sGrp = new THREE.Group();
            const mat = new THREE.MeshBasicMaterial({ color: customCol, side: THREE.DoubleSide, transparent: true, opacity: 0.92 });
            const arc1 = new THREE.Mesh(new THREE.RingGeometry(0.75 * lvScale, 2.05 * lvScale, 24, 1, -Math.PI * 0.45, Math.PI * 0.9), mat);
            arc1.rotation.set(Math.PI * 0.35, rotY, -0.5); arc1.position.y = 1.1;
            sGrp.add(arc1);
            const lvEvo = this.attachSkillLevelEvolution(sGrp, skillLv, customCol);
            sGrp.position.set(entity.pos.x + dirX * 1.2, 0, entity.pos.z + dirZ * 1.2);
            this.scene.add(sGrp);
            this._slashEffects.push({ kind: 'slash', mesh: sGrp, mat, lvEvo, life: 0.48, maxLife: 0.48, vx: dirX * 10.5, vz: dirZ * 10.5 });
            return;
        }

        const mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.92 });
        const mesh = new THREE.Mesh(new THREE.RingGeometry(0.72, 1.42, 24, 1, -Math.PI * 0.48, Math.PI * 0.96), mat);
        mesh.position.set(entity.pos.x + dirX * 1.25, 1.05, entity.pos.z + dirZ * 1.25);
        mesh.rotation.set(Math.PI * 0.35, rotY, -0.55);
        this.scene.add(mesh);
        this._slashEffects.push({ kind: 'slash', mesh, mat, life: 0.28, maxLife: 0.28, vx: 0, vz: 0 });
    },

    updateCharacterAnimations(dt) {
        if (this._slashEffects && this._slashEffects.length) {
            this._slashEffects = this._slashEffects.filter(ef => {
                if (ef.delay && ef.delay > 0) { ef.delay -= dt; ef.mesh.visible = false; return true; }
                ef.mesh.visible = true;
                ef.life -= dt;
                if (ef.life <= 0) {
                    if (this.scene) this.scene.remove(ef.mesh);
                    ef.mesh.traverse?.(o => { o.geometry?.dispose?.(); o.material?.dispose?.(); });
                    return false;
                }
                const p = 1 - (ef.life / ef.maxLife);
                if (ef.lvEvo) {
                    ef.lvEvo.lvRing.rotation.z += dt * 4.5;
                    ef.lvEvo.lvRingMat.opacity = (1 - p) * 0.85;
                    ef.lvEvo.orbs.forEach(o => {
                        o.ang += dt * 6.0;
                        o.orb.position.x = Math.cos(o.ang) * 1.6;
                        o.orb.position.z = Math.sin(o.ang) * 1.6;
                        o.orb.rotation.y += dt * 5.0;
                    });
                }
                if (ef.kind === 'support_bless') {
                    if (ef.followEntity?.pos) ef.mesh.position.set(ef.followEntity.pos.x, 0, ef.followEntity.pos.z);
                    const fade = 1 - p;
                    ef.innerRing.rotation.z += dt * 4.0; ef.outerRing.rotation.z -= dt * 3.0;
                    ef.halo.position.y = 2.55 + Math.sin(p * Math.PI) * 0.45; ef.halo.rotation.z += dt * 5.0;
                    ef.veilCyl.scale.set(0.85 + p * 0.45, 1, 0.85 + p * 0.45);
                    ef.innerMat.opacity = fade * 0.92; ef.outerMat.opacity = fade * 0.88;
                    ef.haloMat.opacity = fade * 0.96; ef.veilMat.opacity = fade * 0.34;
                    ef.crosses.forEach(c => {
                        c.ang += dt * 2.6;
                        c.mesh.position.x = Math.cos(c.ang) * c.dist; c.mesh.position.z = Math.sin(c.ang) * c.dist;
                        c.mesh.position.y += c.vy * dt; c.mesh.rotation.y += dt * 4.5; c.mat.opacity = fade * 0.95;
                    });
                } else if (ef.kind === 'bigbang') {
                    ef.coreSphere.scale.setScalar(Math.max(0.1, (1 - p) * 2.2));
                    ef.auraSphere.scale.setScalar(0.4 + p * 2.4); ef.auraSphere.rotation.y += dt * 4.0;
                    ef.waveRing.scale.setScalar(0.5 + p * 2.6);
                    ef.coreMat.opacity = 1 - p; ef.auraMat.opacity = (1 - p) * 0.65; ef.waveMat.opacity = (1 - p) * 0.92;
                    ef.meteors.forEach(m => {
                        m.mesh.position.x += m.vx * dt; m.mesh.position.y += m.vy * dt; m.mesh.position.z += m.vz * dt;
                        m.mesh.rotation.y += dt * 8.0; m.mesh.scale.setScalar(Math.max(0.1, 1 - p * 0.8));
                    });
                } else if (ef.kind === 'chabudai') {
                    ef.mesh.position.x += ef.vx * dt; ef.mesh.position.z += ef.vz * dt;
                    ef.mesh.position.y = 1.0 + Math.sin(p * Math.PI) * 3.0;
                    ef.mesh.rotation.x = p * Math.PI * 4.5; ef.mesh.rotation.z = p * Math.PI * 1.4;
                } else if (ef.kind === 'beam') {
                    const pulse = Math.sin(p * Math.PI);
                    ef.outerCyl.scale.set(0.6 + pulse * 0.8, 1, 0.6 + pulse * 0.8);
                    ef.coreCyl.scale.set(0.5 + pulse * 0.7, 1, 0.5 + pulse * 0.7);
                    ef.outerMat.opacity = (1 - p) * 0.75; ef.coreMat.opacity = (1 - p) * 0.98;
                    ef.rings.forEach((r, idx) => { r.rotation.z += dt * (idx % 2 === 0 ? 8 : -8); r.scale.setScalar(0.8 + pulse * 0.6); });
                } else if (ef.kind === 'nova_ice') {
                    const rise = Math.min(1, p * 3.2);
                    ef.spikes.forEach((sp, idx) => { sp.position.y = -1.2 + rise * 2.55; sp.rotation.y += dt * (idx % 2 === 0 ? 2 : -2); });
                    ef.magicRing.rotation.z += dt * 2.5; ef.dome.scale.setScalar(0.5 + p * 0.95);
                    ef.ringMat.opacity = (1 - p) * 0.85; ef.domeMat.opacity = (1 - p) * 0.4; ef.spikeMat.opacity = p > 0.7 ? (1 - p) * 3.0 : 0.92;
                } else if (ef.kind === 'heart') {
                    ef.ang += dt * 3.2; ef.mesh.position.x = ef.cx + Math.cos(ef.ang) * ef.rad; ef.mesh.position.z = ef.cz + Math.sin(ef.ang) * ef.rad;
                    ef.mesh.position.y += ef.vy * dt; ef.mesh.rotation.y += dt * 4; ef.mesh.scale.setScalar(1 - p * 0.5);
                } else if (ef.kind === 'ghost') {
                    ef.mesh.position.y += dt * 1.5; ef.mesh.position.x = ef.bx + Math.sin(p * 14) * 0.28; ef.mat.opacity = (1 - p) * 0.85;
                } else if (ef.kind === 'snot_bubble') {
                    const sc = p < 0.8 ? (0.4 + p * 2.2) : (2.2 + (p - 0.8) * 6.0);
                    ef.mesh.scale.setScalar(sc); ef.mat.opacity = p < 0.8 ? 0.65 : Math.max(0, (1 - p) * 3.2);
                } else if (ef.kind === 'tear') {
                    ef.mesh.position.x += ef.vx * dt; ef.mesh.position.y += ef.vy * dt; ef.mesh.position.z += ef.vz * dt; ef.vy -= 9.5 * dt;
                } else if (ef.kind === 'shockwave') {
                    ef.mesh.scale.setScalar(1 + p * 3.2); ef.mat.opacity = (1 - p) * 0.85;
                } else if (ef.kind === 'petal') {
                    ef.mesh.position.x += ef.vx * dt + Math.sin(p * 12) * 0.03; ef.mesh.position.y += ef.vy * dt; ef.mesh.position.z += ef.vz * dt;
                } else if (ef.kind === 'aura') {
                    ef.mesh.scale.set(1 + p * 0.55, 1, 1 + p * 0.55); ef.mesh.rotation.y += dt * 5; ef.mat.opacity = (1 - p) * 0.78;
                } else if (ef.kind === 'star') {
                    ef.mesh.position.x += ef.vx * dt; ef.mesh.position.y += ef.vy * dt; ef.mesh.position.z += ef.vz * dt; ef.mesh.scale.setScalar(1 - p * 0.7);
                } else {
                    ef.mesh.position.x += (ef.vx || 0) * dt; ef.mesh.position.z += (ef.vz || 0) * dt;
                    ef.mesh.scale.setScalar(1 + p * 0.5); ef.mat.opacity = (1 - p) * 0.92;
                }
                return true;
            });
        }

        const applyPose = (ent) => {
            if (!ent || !ent.group) return;
            if (!ent._baseScale) ent._baseScale = ent.group.scale.x || 1;
            const baseRotY = ent.rotY || 0;
            let offX = 0, offY = 0, offZ = 0, rotX = 0, rotY = baseRotY, rotZ = 0, scaleMult = 1.0, active = false;

            const wpnObj = ent.weaponMesh || ent.weaponGroup || ent.rightArm || null;
            if (wpnObj && ent._wpnBaseRotX === undefined) {
                ent._wpnBaseRotX = wpnObj.rotation.x || 0;
                ent._wpnBaseRotZ = wpnObj.rotation.z || 0;
            }

            if (ent.attackAnimTimer && ent.attackAnimTimer > 0) {
                active = true;
                ent.attackAnimTimer = Math.max(0, ent.attackAnimTimer - dt);
                const p = 1 - (ent.attackAnimTimer / 0.36);
                const swing = Math.sin(p * Math.PI);
                offX += Math.sin(baseRotY) * (swing * 0.55);
                offZ += Math.cos(baseRotY) * (swing * 0.55);
                offY += swing * 0.25;
                rotY += Math.sin(p * Math.PI * 2) * 0.55;
                rotX += swing * 0.26;
                if (wpnObj) {
                    const slashAngle = (p < 0.3) ? (-0.75 * (p / 0.3)) : (-0.75 + 2.35 * ((p - 0.3) / 0.7));
                    wpnObj.rotation.x = (ent._wpnBaseRotX || 0) + slashAngle;
                    wpnObj.rotation.z = (ent._wpnBaseRotZ || 0) - swing * 0.45;
                }
            } else if (wpnObj && ent._wpnBaseRotX !== undefined) {
                wpnObj.rotation.x = ent._wpnBaseRotX;
                wpnObj.rotation.z = ent._wpnBaseRotZ;
            }

            if (ent.emoteAnim && ent.emoteAnim.timer > 0) {
                active = true;
                ent.emoteAnim.timer = Math.max(0, ent.emoteAnim.timer - dt);
                const t = ent.emoteAnim.maxTimer - ent.emoteAnim.timer;
                const p = t / ent.emoteAnim.maxTimer;
                const st = ent.emoteAnim.style;
                if (st === 'backflip') { const jp = Math.min(1, p / 0.65); offY += Math.sin(jp * Math.PI) * 2.4; rotX -= jp * Math.PI * 2; }
                else if (st === 'tornado_dance') { rotZ = 0.58; rotY += t * Math.PI * 5.0; offX += Math.cos(t * 5) * 0.45; offZ += Math.sin(t * 5) * 0.45; offY += 0.25 + Math.abs(Math.sin(t * 8)) * 0.25; }
                else if (st === 'dogeza') { const d = Math.min(1, p * 4) * Math.min(1, (1 - p) * 5); offY -= d * 0.32; rotX += d * 1.38; }
                else if (st === 'chabudai_rage') { scaleMult = 1.35; offY += Math.abs(Math.sin(t * 18)) * 0.42; rotZ += Math.sin(t * 48) * 0.26; }
                else if (st === 'heart_float') { offY += 0.65 + Math.sin(t * 4.5) * 0.18; rotZ += Math.sin(t * 3.8) * 0.25; rotY += Math.sin(t * 2.5) * 0.35; }
                else if (st === 'ghost_faint') { const d = Math.min(1, p * 4.5) * Math.min(1, (1 - p) * 4.5); offY -= d * 0.28; rotX -= d * 1.45; }
                else if (st === 'sleep_bubble') { rotX += Math.pow(Math.abs(Math.sin(t * 2.6)), 3) * 0.65; rotZ = 0.36; }
                else if (st === 'greeting_wave') { const rx = Math.cos(baseRotY), rz = -Math.sin(baseRotY), step = Math.sin(t * 6.5) * 0.55; offX += rx * step; offZ += rz * step; offY += Math.abs(Math.sin(t * 13)) * 0.24; rotZ += Math.sin(t * 13) * 0.32; }
                else if (st === 'salute_hero') { const pop = Math.min(1, p * 5) * Math.min(1, (1 - p) * 5); offY += pop * 0.45; rotX -= pop * 0.26; rotY += pop * 0.55; scaleMult = 1 + pop * 0.12; }
                else if (st === 'cry_fountain') { scaleMult = 0.86; rotX = 0.48; rotZ += Math.sin(t * 34) * 0.16; }
                else if (st === 'rocket_zoom') { rotX = 0.72; offX += Math.sin(t * 4.5) * 1.15; offZ += Math.sin(t * 9.0) * 0.55; }
                else { const bow = Math.min(1, p * 3.5) * Math.min(1, (1 - p) * 3.5); rotX += bow * 0.98; }
            }

            if (active) {
                ent.group.position.set(ent.pos.x + offX, offY, ent.pos.z + offZ);
                ent.group.rotation.set(rotX, rotY, rotZ);
                ent.group.scale.setScalar(ent._baseScale * scaleMult);
                ent._poseDirty = true;
            } else if (ent._poseDirty) {
                ent._poseDirty = false;
                ent.group.position.set(ent.pos.x, 0, ent.pos.z);
                ent.group.rotation.set(0, baseRotY, 0);
                ent.group.scale.setScalar(ent._baseScale);
            }
        };

        applyPose(this.player);
        this.remotePlayers.forEach(rp => applyPose(rp));
    }
});
// ▲▲▲ ここまで【3/4】 ▲▲▲
// ▼▼▼ ここから【4/4】 ▼▼▼
Object.assign(KaomojiMMORPG.prototype, {

    // AUTOモード時：回復スキル・極光の聖域・バフスキルも自動使用
    updateSmartAutoSkills(dt) {
        if (!this.autoHunt || this.inTitleScreen || !this.player || !this.useSkillSlot) return;
        const hp = this.player.hp ?? 100;
        const maxHp = this.player.maxHp || this.saveData?.maxHp || 100;
        if (hp <= 0) return;

        this._autoSupportTimer = (this._autoSupportTimer || 0) + dt;
        if (this._autoSupportTimer < 0.45) return;
        this._autoSupportTimer = 0;

        const hasNearbyEnemy = (this.monsters || []).some(m =>
            !m.dead && m.pos && Math.hypot(m.pos.x - this.player.pos.x, m.pos.z - this.player.pos.z) < 15.0
        );
        const hpRatio = hp / Math.max(1, maxHp);

        for (let i = 0; i < 5; i++) {
            const curCd = (this.player.skillCds?.[i] ?? this.skillCds?.[i] ?? 0);
            if (curCd > 0.05) continue;

            const meta = this.resolveSkillMeta(i);
            const cat = meta.skillCategory;

            if (hpRatio < 0.70 && (cat === 'support' || cat === 'aurora')) {
                this.useSkillSlot(i);
                return;
            }
            if (hasNearbyEnemy) {
                if (cat === 'aurora' && !this._inSanctuaryBuff) {
                    this.useSkillSlot(i);
                    return;
                }
                if (cat === 'support') {
                    this.useSkillSlot(i);
                    return;
                }
            }
        }
    },

    updateFirebaseSync(dt) {
        if (!this.fbConnected) return;
        const moving = Math.hypot(this.joyVec.x, this.joyVec.y) > 0.08 ||
            this.keys['KeyW'] || this.keys['KeyA'] || this.keys['KeyS'] || this.keys['KeyD'] ||
            this.keys['ArrowUp'] || this.keys['ArrowDown'] || this.keys['ArrowLeft'] || this.keys['ArrowRight'];
        this.fbSyncTimer += dt;
        if (this.fbSyncTimer >= (moving ? 0.25 : 1.5)) {
            this.fbSyncTimer = 0;
            this.syncFirebaseNow(false);
        }
        this.fbPollTimer += dt;
        if (this.fbPollTimer >= 4.0) {
            this.fbPollTimer = 0;
            const now = Date.now();
            let changed = false;
            for (const [uid, rp] of this.remotePlayers.entries()) {
                if (now - (rp.lastSeenTs || 0) > 25000) {
                    this.pushSystemEventLog(`🚪 ${rp.kaomoji || '(´・ω・`)'} (Lv.${rp.lv || 1}) が退出しました`, 2000);
                    this.removeRemotePlayerEntity(uid);
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

        const dedupKey = `${senderUid}_${msg.type}_${msg.ts}_${msg.seq || 0}`;
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

        if (this.saveData.roomPassEnabled) {
            if ((msg.roomKey || '') !== this.getSafeRoomKey()) return;
        }

        if (msg.type === 'sync' || msg.type === 'hello') {
            // 片側ブローカー瞬断による退出猶予タイマーを即解除（誤退出ログ防止）
            if (this._pendingLeaveTimers && this._pendingLeaveTimers.has(msg.uid)) {
                clearTimeout(this._pendingLeaveTimers.get(msg.uid));
                this._pendingLeaveTimers.delete(msg.uid);
            }
            const isNew = !this.remotePlayers.has(msg.uid);
            this.upsertRemotePlayer(msg);
            if (isNew || msg.type === 'hello') {
                this.syncFirebaseNow(false);
                if (isNew) {
                    const zName = (typeof ZONES !== 'undefined' && ZONES[msg.zoneId]) ? ZONES[msg.zoneId].name : '試練の塔';
                    this.pushSystemEventLog(`👋 ${msg.kaomoji || '(´・ω・`)'} (Lv.${msg.lv || 1}) が参加！（${zName}）`, 2400);
                    this.refreshAllHUD();
                    if (this.isModalOpen && this.activeTab === 'online') this.renderModalContent();
                }
            }
        } else if (msg.type === 'leave') {
            const rp = this.remotePlayers.get(msg.uid);
            if (!rp) return;
            const kao = rp.kaomoji || msg.kaomoji || '(´・ω・`)';
            const lv = rp.lv || msg.lv || 1;
            const execLeave = () => {
                if (this._pendingLeaveTimers) this._pendingLeaveTimers.delete(msg.uid);
                if (this.remotePlayers.has(msg.uid)) {
                    this.removeRemotePlayerEntity(msg.uid);
                    this.pushSystemEventLog(`🚪 ${kao} (Lv.${lv}) が退出しました`, 2200);
                    this.refreshAllHUD();
                    if (this.isModalOpen && this.activeTab === 'online') this.renderModalContent();
                }
            };
            // Willパケット（通信瞬断）の場合は5.5秒猶予を持たせ、別サーバーから通信が続いていれば退出扱いにしない
            if (msg.isWill) {
                if (!this._pendingLeaveTimers) this._pendingLeaveTimers = new Map();
                if (!this._pendingLeaveTimers.has(msg.uid)) {
                    const tid = setTimeout(execLeave, 5500);
                    this._pendingLeaveTimers.set(msg.uid, tid);
                }
            } else {
                execLeave();
            }
        } else if (msg.type === 'player_dead' && msg.payload) {
            const kao = msg.payload.kaomoji || '(x_x)';
            const lv = msg.payload.lv || 1;
            const zName = (typeof ZONES !== 'undefined' && ZONES[msg.payload.zoneId]) ? ZONES[msg.payload.zoneId].name : 'フィールド';
            this.pushSystemEventLog(`💀 ${kao} (Lv.${lv}) が ${zName} で力尽きた…！`, 2600);
        } else if (msg.type === 'chat_room' && msg.payload) {
            const chatTxt = msg.payload.text || msg.payload.msg || msg.payload.message || '';
            this.addChatMessage('room', msg.payload.kaomoji, msg.payload.name, chatTxt, false);
            this.spawnHeadBubble(false, senderUid, msg.payload.kaomoji, chatTxt, false);
        } else if (msg.type === 'kill' && msg.payload && this.receiveCoopReward) {
            this.receiveCoopReward(msg.payload);
        } else if (msg.type === 'emote' && msg.payload) {
            this.playSyncedEmote(false, senderUid, {
                motionType: msg.payload.motionType || ALL_EMOTE_MOTIONS[(msg.payload.emoteIdx || 0) % ALL_EMOTE_MOTIONS.length],
                kaomoji: msg.payload.kaomoji || '(≧▽≦)',
                label: msg.payload.label || msg.payload.msg || 'やっほー！'
            });
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
            if (rp) this.removeRemotePlayerEntity(p.uid);
            const parts = this.buildAvatarGroup({
                kaomoji: p.kaomoji || '(´・ω・`)', bodyHex, faceBgHex: fBg, bodyScale: bScale,
                weaponId: p.weaponId || 'wpn_wood', weaponEnhance: p.weaponEnhance || 0,
                armorId: p.armorId || 'arm_cloth', cosmeticId: p.cosmeticId || 'none', backCosmeticId: bCos
            });
            this.fixAvatarFaceAlignment(parts.group);
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
                visible: true, headPlateEl: plate, plateEl: plate, petSig: '', petGroup: null, petPlateEl: null, ...parts
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

        // 味方のペットを自分と100%共通の3Dモデル＋ペット装備で描画
        const petInfo = p.pet;
        const newPetSig = petInfo ? `${petInfo.petId}|${petInfo.kaomoji}|${petInfo.name}|${petInfo.lv}|${petInfo.color}|${petInfo.equipId || 'none'}` : '';
        if (rp.petSig !== newPetSig) {
            if (rp.petGroup && this.scene) this.scene.remove(rp.petGroup);
            if (rp.petPlateEl) rp.petPlateEl.remove();
            rp.petGroup = null;
            rp.petPlateEl = null;
            rp.petSig = newPetSig;

            if (petInfo && this.scene && typeof THREE !== 'undefined') {
                const pMesh = this.buildUnifiedPetMesh(petInfo);
                pMesh.position.set(rp.pos.x - 1.1, 0, rp.pos.z - 1.1);
                this.scene.add(pMesh);
                rp.petGroup = pMesh;

                const pPlate = document.createElement('div');
                pPlate.className = 'world-plate';
                const safePetName = String(petInfo.name || 'ペット').replace(/[<>&"]/g, '');
                const eqDef = this.getPetEquipDef(petInfo.equipId);
                const eqBadge = (eqDef && eqDef.id !== 'none') ? ` ${eqDef.icon}` : '';
                pPlate.innerHTML = `<div style="font-size:8px;font-weight:900;color:#6ee7b7;">🐾 Lv.${petInfo.lv || 1} ${safePetName}${eqBadge}</div>`;
                this.overlayLayer?.appendChild(pPlate);
                rp.petPlateEl = pPlate;
            }
        }
    },

    updateRemotePlayers(dt) {
        const myZone = this.towerState.active ? 'tower' : this.currentZoneId;
        const nowSec = performance.now() * 0.001;

        this.remotePlayers.forEach(rp => {
            if (!rp.weaponMesh && rp.group) {
                rp.group.traverse(c => {
                    if (!rp.weaponMesh && c !== rp.group && (c.name?.toLowerCase().includes('wpn') || c.name?.toLowerCase().includes('weapon') || c.position.x > 0.55)) {
                        rp.weaponMesh = c;
                    }
                });
            }

            const same = (rp.zoneId === myZone && myZone !== 'tower');
            rp.visible = same;
            if (rp.group) rp.group.visible = same;
            rp.pos.lerp(rp.targetPos, Math.min(1, dt * 10));
            rp.rotY += (rp.targetRotY - rp.rotY) * Math.min(1, dt * 10);
            if (rp.group && !rp._poseDirty) {
                rp.group.position.copy(rp.pos);
                rp.group.rotation.y = rp.rotY;
            }

            if (rp.petGroup) {
                rp.petGroup.visible = same;
                if (same) {
                    const sideX = Math.cos(rp.rotY) * -1.15 - Math.sin(rp.rotY) * 0.85;
                    const sideZ = -Math.sin(rp.rotY) * -1.15 - Math.cos(rp.rotY) * 0.85;
                    const tx = rp.pos.x + sideX;
                    const tz = rp.pos.z + sideZ;
                    rp.petGroup.position.x += (tx - rp.petGroup.position.x) * Math.min(1, dt * 7);
                    rp.petGroup.position.z += (tz - rp.petGroup.position.z) * Math.min(1, dt * 7);
                    rp.petGroup.position.y = Math.sin(nowSec * 3.5) * 0.14;
                    rp.petGroup.rotation.y = rp.rotY;

                    if (rp.petPlateEl) {
                        const wPos = new THREE.Vector3(rp.petGroup.position.x, 1.55, rp.petGroup.position.z);
                        let sc = this.projectToScreen ? this.projectToScreen(wPos) : null;
                        if (!sc && this.camera && this.canvas) {
                            const v = wPos.clone().project(this.camera);
                            if (v.z < 1) sc = { x: (v.x * 0.5 + 0.5) * this.canvas.clientWidth, y: (-v.y * 0.5 + 0.5) * this.canvas.clientHeight };
                        }
                        if (sc) {
                            rp.petPlateEl.style.display = 'block';
                            rp.petPlateEl.style.left = sc.x + 'px';
                            rp.petPlateEl.style.top = sc.y + 'px';
                        } else {
                            rp.petPlateEl.style.display = 'none';
                        }
                    }
                } else if (rp.petPlateEl) {
                    rp.petPlateEl.style.display = 'none';
                }
            }
        });

        if (this.player && !this.inTitleScreen) {
            const hp = this.player.hp ?? 1;
            if (hp <= 0 && !this._wasPlayerDead) {
                this._wasPlayerDead = true;
                const kao = this.getBasePlayerKaomoji ? this.getBasePlayerKaomoji() : '(x_x)';
                const lv = this.saveData?.lv || 1;
                const zId = this.towerState?.active ? 'tower' : this.currentZoneId;
                const zName = (typeof ZONES !== 'undefined' && ZONES[zId]) ? ZONES[zId].name : '試練の塔';
                this.pushSystemEventLog(`💀 ${kao} (Lv.${lv}) が ${zName} で力尽きた…`, 2500);
                this.broadcastFirebaseEvent('player_dead', { kaomoji: kao, lv, zoneId: zId });
            } else if (hp > 0) {
                this._wasPlayerDead = false;
            }
        }

        this.syncLocalPetAppearance();
        this.rebuildMonstersAs3DMonsters(dt);
        this.updateSmartAutoSkills(dt);
        this.updateSanctuaryFields(dt);
        this.updateCharacterAnimations(dt);
        this.updateHeadBubbles(dt);
    },

    getSameZoneRemoteCount() {
        if (this.towerState.active) return 0;
        let n = 0;
        this.remotePlayers.forEach(rp => { if (rp.zoneId === this.currentZoneId) n++; });
        return n;
    },

    bindEvents() {
        this.initChatFreeTransform?.();
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

        if (!this._emoteCaptureBound) {
            this._emoteCaptureBound = true;
            let lastEmoteTs = 0;
            const handleEmoteTap = (e) => {
                const pal = document.getElementById('emote-palette');
                if (!pal || pal.classList.contains('hidden') || !pal.contains(e.target)) return;
                let items = [...pal.querySelectorAll('button, .emote-btn, .emote-item, [data-kaomoji], [data-msg]')];
                if (!items.length) items = [...pal.children];
                const item = items.find(el => el === e.target || el.contains(e.target));
                if (!item) return;

                e.preventDefault();
                e.stopImmediatePropagation();
                const now = performance.now();
                if (now - lastEmoteTs < 250) return;
                lastEmoteTs = now;

                sfx.init();
                sfx.playTone(780, 'sine', 0.1, 0.08);
                pal.classList.add('hidden');

                const emoteIdx = items.indexOf(item);
                const parsed = this.classifyEmoteItem(item, emoteIdx);
                this.playSyncedEmote(true, null, parsed);
                this.broadcastFirebaseEvent('emote', {
                    emoteIdx,
                    motionType: parsed.motionType,
                    kaomoji: parsed.kaomoji,
                    label: parsed.label,
                    msg: parsed.label
                });
            };
            document.addEventListener('touchend', handleEmoteTap, { capture: true, passive: false });
            document.addEventListener('click', handleEmoteTap, true);
        }

        on('btn-exec-warp', 'click', (e) => {
            e.stopPropagation(); sfx.init(); sfx.playSkill();
            if (this.currentZoneId === 'town') this.openGrowthModal('travel');
            else { this.loadZone('town'); this.showAlertBanner('🏠 始まりの顔文字広場へ帰還！', 1600); }
        });
        on('btn-toggle-autohunt', 'click', (e) => {
            e.stopPropagation(); sfx.init(); this.autoHunt = !this.autoHunt;
            e.currentTarget.textContent = this.autoHunt ? '🤖 AUTO:ON' : '🤖 AUTO:OFF';
            e.currentTarget.style.background = this.autoHunt ? '#059669' : '';
            this.showAlertBanner(this.autoHunt ? '🤖 オート狩り ON（補助・回復も自動）' : '🤖 オート狩り OFF', 1400);
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

        for (let i = 0; i < 5; i++) {
            const sBtn = document.getElementById(`skill-slot-${i}`)
                || document.getElementById(`btn-skill-${i}`)
                || document.querySelectorAll('.skill-slot-btn, .skill-slot, .skill-btn')[i];
            if (sBtn) {
                let lastSkillTap = 0;
                const doSkill = (e) => {
                    if (e) { e.preventDefault(); e.stopPropagation(); }
                    const now = performance.now(); if (now - lastSkillTap < 160) return; lastSkillTap = now;
                    sfx.init();
                    if (this.useSkillSlot) this.useSkillSlot(i);
                };
                sBtn.addEventListener('touchstart', doSkill, { passive: false });
                sBtn.addEventListener('click', doSkill);
            }
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
            this.syncSkillDescriptionsAndEffects?.();
            this.initChatFreeTransform?.();
            this.showLoadingOverlay('NOW LOADING... 冒険の世界へ出発！', 1100);
            _origEnter.call(this);
            this.fixAvatarFaceAlignment?.(this.player?.group);
            this.syncLocalPetAppearance?.();
            this.rebuildMonstersAs3DMonsters?.(0.016);
            this.startAutoReconnectWatchdog();
            if (this.saveData?.onlineEnabled && !this.fbConnected) {
                this._lastConnectAttemptTs = 0;
                this.connectMqttStart(true);
            }
        };
    }

    if (P.loadZone) {
        const _origLoadZone = P.loadZone;
        P.loadZone = function (zoneId) {
            const zName = (typeof ZONES !== 'undefined' && ZONES[zoneId]) ? ZONES[zoneId].name : '移動中';
            if (!this.inTitleScreen) this.showLoadingOverlay(`WARPING... ${zName}`, 650);
            _origLoadZone.call(this, zoneId);
            this.rebuildMonstersAs3DMonsters?.(0.016);
            this.syncLocalPetAppearance?.();
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
            this.syncSkillDescriptionsAndEffects?.();
            const meta = this.resolveSkillMeta(slotIdx);
            const curCd = (this.player?.skillCds?.[slotIdx] || this.skillCds?.[slotIdx] || 0);

            _origSkill.call(this, slotIdx);

            if (curCd <= 0.05) {
                if (meta.isChabudai) sfx.playTone(320, 'sawtooth', 0.16, 0.1);
                const info = {
                    isSkill: true,
                    slotIdx: meta.slotIdx,
                    skillId: meta.skillId,
                    skillName: meta.skillName,
                    skillLv: meta.skillLv,
                    skillCategory: meta.skillCategory,
                    isChabudai: meta.isChabudai,
                    x: this.player?.pos?.x,
                    z: this.player?.pos?.z,
                    rotY: this.player?.rotY
                };
                this.triggerAttackVisual(this.player, true, info);
                this.broadcastFirebaseEvent('skill_fx', info);
            }
        };
    }

    if (P.getPlayerStats) {
        const _origStats = P.getPlayerStats;
        P.getPlayerStats = function () {
            const st = _origStats.call(this);
            if (!st) return st;

            // 極光の聖域バフ
            if (this._inSanctuaryBuff) {
                const mult = 1.15 + Math.min(0.35, (this._sanctuaryBuffLv || 1) * 0.03);
                if (typeof st.atk === 'number') st.atk = Math.floor(st.atk * mult);
                if (typeof st.def === 'number') st.def = Math.floor(st.def * mult);
                if (typeof st.spd === 'number') st.spd = st.spd * 1.15;
            }

            // ペット装備ステータスボーナス
            const petInfo = this.getMyPetSyncInfo?.();
            if (petInfo && petInfo.equipId && petInfo.equipId !== 'none') {
                const eq = this.getPetEquipDef(petInfo.equipId);
                if (typeof st.atk === 'number' && eq.atkPct) st.atk = Math.floor(st.atk * (1 + eq.atkPct));
                if (typeof st.def === 'number' && eq.defPct) st.def = Math.floor(st.def * (1 + eq.defPct));
                if (typeof st.maxHp === 'number' && eq.hpPct) st.maxHp = Math.floor(st.maxHp * (1 + eq.hpPct));
                if (typeof st.spd === 'number' && eq.spdPct) st.spd = st.spd * (1 + eq.spdPct);
            }
            return st;
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
            this.syncSkillDescriptionsAndEffects?.();
            _rMod.call(this);
            const body = document.getElementById('modal-body');
            if (!body) return;

            if (this.activeTab === 'online') {
                const svList = this.getConnectedServerNames().join(', ') || '自動再接続中...';
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
                    this._lastConnectAttemptTs = 0;
                    this.connectMqttStart(false);
                });
            }

            if (/pet|companion/i.test(String(this.activeTab || ''))) {
                const petInfo = this.getMyPetSyncInfo();
                const curName = petInfo ? petInfo.name : (this.saveData?.customPetName || '');
                const curEqId = this.getEquippedPetEquipId(petInfo?.petId || '');
                const unlocked = this.saveData?.unlockedPetEquips || ['none'];
                const d = this.saveData || {};
                const curGold = Number(d.gold ?? d.coins ?? d.money ?? 0);

                const eqCardsHtml = PET_EQUIPS.map(eq => {
                    const isOwned = eq.id === 'none' || unlocked.includes(eq.id);
                    const isEq = curEqId === eq.id;
                    const btnText = isEq ? '✅ 装備中' : (isOwned ? '装着する' : `購入 (${eq.cost}G)`);
                    const btnCls = isEq ? 'btn-emerald' : (isOwned ? 'btn-sky' : 'btn-amber');
                    return `
                        <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;background:rgba(15,23,42,0.85);border:1px solid ${isEq ? '#34d399' : '#334155'};border-radius:8px;padding:6px 8px;">
                            <div style="min-width:0;">
                                <div style="font-size:11px;font-weight:900;color:#fff;">${eq.icon} ${eq.name}</div>
                                <div style="font-size:9px;color:#94a3b8;">${eq.desc}</div>
                            </div>
                            <button type="button" class="btn-ui ${btnCls} btn-pet-equip-item" data-eqid="${eq.id}" style="padding:4px 8px;font-size:10px;white-space:nowrap;" ${isEq ? 'disabled' : ''}>${btnText}</button>
                        </div>
                    `;
                }).join('');

                body.insertAdjacentHTML('afterbegin', `
                    <div class="card-box" style="margin-bottom:8px;border-color:#34d399;">
                        <div style="font-size:11px;font-weight:900;color:#6ee7b7;margin-bottom:4px;">
                            🐾 相棒ペットの名前変更（最大14文字・マルチ味方にも表示）
                        </div>
                        <div style="display:flex;gap:6px;margin-bottom:10px;">
                            <input id="inp-pet-custom-name" type="text" maxlength="14" value="${String(curName).replace(/"/g, '&quot;')}" placeholder="好きなペット名を入力..." style="flex:1;background:#0f172a;border:1px solid #34d399;border-radius:6px;padding:5px 8px;color:#fff;font-size:12px;">
                            <button type="button" id="btn-save-pet-name" class="btn-ui btn-emerald" style="padding:5px 10px;font-size:11px;">決定</button>
                        </div>

                        <div class="flex-between" style="margin-bottom:6px;">
                            <span style="font-size:11px;font-weight:900;color:#fde047;">🎀 ペット装備（3D見た目＆ステータス強化）</span>
                            <span style="font-size:10px;color:#cbd5e1;">所持G: <b>${curGold}</b></span>
                        </div>
                        <div style="display:grid;grid-template-columns:1fr;gap:5px;max-height:190px;overflow-y:auto;padding-right:2px;">
                            ${eqCardsHtml}
                        </div>
                    </div>
                `);

                document.getElementById('btn-save-pet-name')?.addEventListener('click', () => {
                    sfx.init();
                    const val = document.getElementById('inp-pet-custom-name')?.value || '';
                    this.setPetCustomName(petInfo?.petId || '', val);
                    this.renderModalContent();
                });

                body.querySelectorAll('.btn-pet-equip-item').forEach(btn => {
                    btn.addEventListener('click', () => {
                        sfx.init();
                        const eqId = btn.dataset.eqid;
                        this.buyOrEquipPetItem(petInfo?.petId || '', eqId);
                        this.renderModalContent();
                    });
                });
            }
        };
    }

    if (P.buildPlayerEntity) {
        const _bPE = P.buildPlayerEntity;
        P.buildPlayerEntity = function () {
            const cds = this.player?.skillCds || [0, 0, 0, 0, 0];
            _bPE.call(this);
            if (this.player) {
                this.player.skillCds = cds;
                this.fixAvatarFaceAlignment(this.player.group);
            }
        };
    }
}

window.addEventListener('DOMContentLoaded', () => {
    if (!window.game && typeof KaomojiMMORPG !== 'undefined') window.game = new KaomojiMMORPG();
    if (window.game) {
        window.game.syncSkillDescriptionsAndEffects?.();
        window.game.initChatFreeTransform?.();
        window.game.fixAvatarFaceAlignment?.(window.game.player?.group);
        window.game.syncLocalPetAppearance?.();
        window.game.startAutoReconnectWatchdog?.();
    }
});
// === GAME6_V19_OK ===
// ▲▲▲ ここまで【4/4】 ▲▲▲
