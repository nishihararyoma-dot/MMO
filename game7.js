'use strict';

// スキルLv.100到達で解放される「覚醒奥義（新技）」マスター定義
const AWAKENED_SKILL_ARTS = {
    slash: {
        lv10Title: '真・双連クロス斬',
        lv50Title: '極・五連次元断空斬',
        lv100Art: '【奥義】天元・神滅黄金聖剣',
        lv100Desc: 'Lv.100解放新技！天空から超巨大黄金聖剣を召喚し、大地を両断する神話級の一撃！',
        color: 0xfde047
    },
    fire: {
        lv10Title: '真・紅蓮メテオ落下',
        lv50Title: '極・業火スーパーノヴァ',
        lv100Art: '【奥義】終焉星落・ラグナロクメテオ',
        lv100Desc: 'Lv.100解放新技！成層圏から複数の超巨大隕石群を落とし、すべてを焼き尽くす！',
        color: 0xf97316
    },
    bigbang: {
        lv10Title: '真・銀河渦巻きビッグバン',
        lv50Title: '極・超新星クエーサー爆発',
        lv100Art: '【奥義】創世神話・オメガブラックホール',
        lv100Desc: 'Lv.100解放新技！ブラックホールで敵を飲み込み、銀河規模の創世大爆発を起こす！',
        color: 0xf43f5e
    },
    beam: {
        lv10Title: '真・螺旋ツインレーザー',
        lv50Title: '極・収束メガ粒子砲',
        lv100Art: '【奥義】極光終焉・アルティメットブラスター',
        lv100Desc: 'Lv.100解放新技！空間を歪める超極太の虹色神聖砲を放ち、前方の敵を蒸発させる！',
        color: 0x38bdf8
    },
    nova_ice: {
        lv10Title: '真・絶対零度氷結獄',
        lv50Title: '極・コキュートス大氷河',
        lv100Art: '【奥義】氷河神話・フィンブルの冬',
        lv100Desc: 'Lv.100解放新技！巨大氷晶竜巻と無数の氷塊流星群を降らせ、世界を凍てつかせる！',
        color: 0x7dd3fc
    },
    thunder: {
        lv10Title: '真・紫電雷鳴落雷陣',
        lv50Title: '極・建御雷神の裁き',
        lv100Art: '【奥義】天罰神雷・インドラの矢',
        lv100Desc: 'Lv.100解放新技！天を裂く黄金の巨大雷槍を連続投下し、超電磁爆発を起こす！',
        color: 0xfacc15
    },
    wind: {
        lv10Title: '真・双竜トルネード',
        lv50Title: '極・暴風神テンペスト',
        lv100Art: '【奥義】天空覇王・神風カタストロフ',
        lv100Desc: 'Lv.100解放新技！天地を繋ぐ超巨大竜巻と真空刃の嵐で敵を粉砕する！',
        color: 0x34d399
    },
    void: {
        lv10Title: '真・深淵グラビティ球',
        lv50Title: '極・暗黒次元崩壊',
        lv100Art: '【奥義】虚無神蝕・アビスエクリプス',
        lv100Desc: 'Lv.100解放新技！漆黒の日食と重力崩壊球を召喚し、次元ごと敵を消滅させる！',
        color: 0xa855f7
    },
    support: {
        lv10Title: '真・大天使の祝福陣',
        lv50Title: '極・セラフィム神聖結界',
        lv100Art: '【奥義】神域降臨・エデンの奇跡',
        lv100Desc: 'Lv.100解放新技！黄金の神殿柱と天使の翼を展開し、味方全体を神聖な光で包み込む！',
        color: 0x4ade80
    },
    aurora: {
        lv10Title: '真・極光オーロラ聖域',
        lv50Title: '極・天界アヴァロン結界',
        lv100Art: '【奥義】創世聖域・ヴァルハラ神殿',
        lv100Desc: 'Lv.100解放新技！広大な神殿フィールドと虹色オーロラを展開し、味方を無敵級に強化！',
        color: 0x2dd4bf
    },
    chabudai: {
        lv10Title: '真・激怒の黄金ちゃぶ台',
        lv50Title: '極・超巨大豪華宴会卓返し',
        lv100Art: '【奥義】神怒天罰・惑星サイズちゃぶ台返し',
        lv100Desc: 'Lv.100解放新技！山のように巨大な黄金ちゃぶ台をひっくり返し、隕石級の衝撃波を放つ！',
        color: 0xf59e0b
    }
};

(function injectV21CutinStyle() {
    if (document.getElementById('kmj-v21-cutin-style')) return;
    const st = document.createElement('style');
    st.id = 'kmj-v21-cutin-style';
    st.textContent = `
        #kmj-ougi-cutin{
            position:fixed;left:50%;top:22%;transform:translate(-50%,-50%) scale(.85);
            z-index:95;pointer-events:none;padding:10px 24px;border-radius:14px;
            background:linear-gradient(90deg,rgba(15,23,42,.2),rgba(127,29,29,.92),rgba(180,83,9,.95),rgba(127,29,29,.92),rgba(15,23,42,.2));
            border-top:2px solid #fde047;border-bottom:2px solid #fde047;
            box-shadow:0 0 32px rgba(250,204,21,.75);text-align:center;
            opacity:0;transition:all .22s cubic-bezier(.16,1,.3,1);white-space:nowrap;
        }
        #kmj-ougi-cutin.show{opacity:1;transform:translate(-50%,-50%) scale(1.04);}
    `;
    document.head.appendChild(st);
})();

if (typeof KaomojiMMORPG !== 'undefined') {
    const P = KaomojiMMORPG.prototype;

    // 1. アバターの顔ズレを根本から完全修正（buildAvatarGroup 直接フック）
    P.alignAvatarFaceStrictly = function (group) {
        if (!group || typeof THREE === 'undefined') return;
        const faceMeshes = [];
        const boxMeshes = [];

        group.traverse(obj => {
            if (!obj.isMesh || !obj.geometry) return;
            // 顔文字テクスチャ（CanvasTexture）が貼られているメッシュを特定
            if (obj.material && obj.material.map && obj.material.map.image) {
                faceMeshes.push(obj);
            } else {
                boxMeshes.push(obj);
            }
        });

        faceMeshes.forEach(fm => {
            // 顔メッシュに最も近い立方体/球体（＝頭部メッシュ）を探す
            let bestHead = null;
            let bestDist = Infinity;
            boxMeshes.forEach(bm => {
                // 武器や細長いパーツは除外
                bm.geometry.computeBoundingBox?.();
                const bb = bm.geometry.boundingBox;
                if (!bb) return;
                const sx = (bb.max.x - bb.min.x) * (bm.scale.x || 1);
                const sy = (bb.max.y - bb.min.y) * (bm.scale.y || 1);
                const sz = (bb.max.z - bb.min.z) * (bm.scale.z || 1);
                if (sx < 0.35 || sy < 0.35 || sz < 0.35) return;

                const d = Math.hypot(
                    bm.position.x - fm.position.x,
                    bm.position.y - fm.position.y,
                    bm.position.z - fm.position.z
                );
                if (d < bestDist) {
                    bestDist = d;
                    bestHead = bm;
                }
            });

            if (bestHead && bestDist < 1.2) {
                bestHead.geometry.computeBoundingBox?.();
                const bb = bestHead.geometry.boundingBox;
                const halfD = bb ? (bb.max.z - bb.min.z) * 0.5 * (bestHead.scale.z || 1) : 0.45;
                // 頭のど真ん中(X, Y)＋前面のすぐ外側(Z)へ正確に配置
                fm.position.x = bestHead.position.x;
                fm.position.y = bestHead.position.y;
                fm.position.z = bestHead.position.z + halfD + 0.018;
            } else {
                fm.position.x = 0;
            }
            fm.rotation.set(0, 0, 0);
            fm.renderOrder = 10;
            if (fm.material) {
                fm.material.polygonOffset = true;
                fm.material.polygonOffsetFactor = -4;
                fm.material.depthWrite = true;
                fm.material.needsUpdate = true;
            }
        });
    };

    // game6.js 側の古い関数も安全な新処理へ差し替え
    P.fixAvatarFaceAlignment = P.alignAvatarFaceStrictly;

    if (P.buildAvatarGroup) {
        const _origBuildAvatar = P.buildAvatarGroup;
        P.buildAvatarGroup = function (opts) {
            const res = _origBuildAvatar.call(this, opts);
            if (res && res.group) {
                this.alignAvatarFaceStrictly(res.group);
            }
            return res;
        };
    }

    // 2. スキルLv10 / Lv50 / Lv100新技解放のテキスト＆カテゴリ解決
    P.getSkillEvolutionTierInfo = function (category, skillLv) {
        const art = AWAKENED_SKILL_ARTS[category] || AWAKENED_SKILL_ARTS.slash;
        if (skillLv >= 100) {
            return { tier: 3, badge: '👑Lv100奥義', title: art.lv100Art, desc: art.lv100Desc, color: art.color };
        }
        if (skillLv >= 50) {
            return { tier: 2, badge: '🔥Lv50極', title: art.lv50Title, desc: `【極・超強化形態】技のエフェクトが別次元の超豪華形態へ進化！`, color: art.color };
        }
        if (skillLv >= 10) {
            return { tier: 1, badge: '✨Lv10真', title: art.lv10Title, desc: `【真・強化形態】技の見た目と威力が大幅に強化！`, color: art.color };
        }
        return { tier: 0, badge: '', title: '', desc: '', color: art.color };
    };

    P.showOugiCutin = function (casterName, ougiName) {
        let el = document.getElementById('kmj-ougi-cutin');
        if (!el) {
            el = document.createElement('div');
            el.id = 'kmj-ougi-cutin';
            document.body.appendChild(el);
        }
        el.innerHTML = `
            <div style="font-size:10px;font-weight:900;color:#fef08a;letter-spacing:1.5px;">⚡ LV.100 覚醒奥義解放技 ⚡</div>
            <div style="font-size:16px;font-weight:900;color:#ffffff;text-shadow:0 2px 10px #000;margin-top:2px;">${ougiName}</div>
            <div style="font-size:10px;color:#fcd34d;margin-top:1px;">発動者: ${casterName}</div>
        `;
        el.classList.add('show');
        clearTimeout(this._ougiCutinTimer);
        this._ougiCutinTimer = setTimeout(() => el.classList.remove('show'), 1800);
    };

    // スキル一覧画面でも Lv.10 / Lv.50 / Lv.100新技解放がはっきり分かるように説明を自動更新
    const _prevSyncSkills = P.syncSkillDescriptionsAndEffects;
    P.syncSkillDescriptionsAndEffects = function () {
        if (_prevSyncSkills) _prevSyncSkills.call(this);
        if (typeof SKILLS === 'undefined' || !SKILLS) return;
        const d = this.saveData || {};
        const list = Array.isArray(SKILLS) ? SKILLS : Object.values(SKILLS);

        list.forEach((sk, idx) => {
            if (!sk || typeof sk !== 'object') return;
            if (!sk._baseNameV21) sk._baseNameV21 = sk.name || `スキル${idx + 1}`;
            if (!sk._baseDescV21) sk._baseDescV21 = sk.desc || sk.description || '';

            const sId = String(sk.id || sk.skillId || `slot_${idx}`);
            const lv = Math.max(1, Number(d.skillLevels?.[sId] ?? d.skillLvs?.[sId] ?? sk.lv ?? sk.level ?? 1) || 1);

            const comb = `${sId} ${sk._baseNameV21}`.toLowerCase();
            let cat = 'slash';
            if (/chabu|table|flip|ちゃぶ|卓|返/.test(comb)) cat = 'chabudai';
            else if (/aurora|sanctuary|polar|極光|聖域|オーロラ/.test(comb)) cat = 'aurora';
            else if (/bigbang|big_bang|genesis|cosmos|creation|supernova|ビッグバン|創世|創星|創生/.test(comb)) cat = 'bigbang';
            else if (/heal|cure|prayer|bless|holy|light|buff|boost|aura|guard|shield|haste|support|癒|回復|祈|聖|浄化|強化|鼓舞|結界|加速|守護|支援|補助/.test(comb) || sk.type === 'heal' || sk.type === 'buff') cat = 'support';
            else if (/beam|laser|ray|cannon|kame|ビーム|レーザー|光線|砲|波動|閃光/.test(comb)) cat = 'beam';
            else if (/zero|nova|absolute|blizzard|ice|frost|零度|ノヴァ|氷|吹雪|凍|雪/.test(comb)) cat = 'nova_ice';
            else if (/fire|meteor|flare|burn|bomb|flame|炎|爆|火|隕|紅蓮|業火/.test(comb)) cat = 'fire';
            else if (/thunder|bolt|spark|volt|lightning|雷|電|閃|迅/.test(comb)) cat = 'thunder';
            else if (/wind|storm|tornado|gale|cyclone|風|嵐|竜巻|疾風|旋風/.test(comb)) cat = 'wind';
            else if (/dark|void|shadow|abyss|gravity|闇|黒|影|重力|深淵|冥/.test(comb)) cat = 'void';

            const evo = this.getSkillEvolutionTierInfo(cat, lv);
            if (lv >= 100) {
                sk.name = `${evo.title}`;
                const txt = `${evo.desc}`;
                if ('desc' in sk) sk.desc = txt;
                if ('description' in sk) sk.description = txt;
            } else if (lv >= 50) {
                sk.name = `${sk._baseNameV21}【極】`;
                const txt = `${sk._baseDescV21} ▶ 現在Lv.${lv}【${evo.title}】解放中！(Lv.100で新奥義解放)`;
                if ('desc' in sk) sk.desc = txt;
                if ('description' in sk) sk.description = txt;
            } else if (lv >= 10) {
                sk.name = `${sk._baseNameV21}【真】`;
                const txt = `${sk._baseDescV21} ▶ 現在Lv.${lv}【${evo.title}】解放中！(Lv.50で極形態・Lv.100で新奥義)`;
                if ('desc' in sk) sk.desc = txt;
                if ('description' in sk) sk.description = txt;
            } else {
                sk.name = sk._baseNameV21;
                const txt = `${sk._baseDescV21} (Lv.10で真形態・Lv.50で極形態・Lv.100で新奥義解放！)`;
                if ('desc' in sk) sk.desc = txt;
                if ('description' in sk) sk.description = txt;
            }
        });
    };
}
// ▲▲▲ ここまで【1/3】 ▲▲▲
// ▼▼▼ ここから【2/3】 ▼▼▼
if (typeof KaomojiMMORPG !== 'undefined') {
    const P = KaomojiMMORPG.prototype;

    // Lv.10(真) / Lv.50(極) / Lv.100+(覚醒奥義) の別格3D技エフェクト生成
    P.spawnUpgradedSkillVisualV21 = function (entity, cat, skillLv, sId, skillName) {
        if (!this.useWebGL || !this.scene || !entity?.pos || typeof THREE === 'undefined') return;
        if (!this._v21SkillEffects) this._v21SkillEffects = [];

        const tier = skillLv >= 100 ? 3 : (skillLv >= 50 ? 2 : 1);
        const evo = this.getSkillEvolutionTierInfo(cat, skillLv);
        const rotY = entity.rotY || 0;
        const dirX = Math.sin(rotY);
        const dirZ = Math.cos(rotY);
        const px = entity.pos.x;
        const pz = entity.pos.z;

        const root = new THREE.Group();
        const animItems = [];
        const mainCol = evo.color || 0xfde047;

        // 足元の多重進化魔法陣（全技共通でランクが一目で分かる）
        const ringCount = tier === 3 ? 3 : (tier === 2 ? 2 : 1);
        const ringCols = [mainCol, 0xfde047, 0xf472b6];
        for (let r = 0; r < ringCount; r++) {
            const rIn = 1.4 + r * 1.15;
            const rOut = rIn + 0.42;
            const rMat = new THREE.MeshBasicMaterial({
                color: ringCols[r % ringCols.length],
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.9
            });
            const ring = new THREE.Mesh(new THREE.RingGeometry(rIn, rOut, 36), rMat);
            ring.rotation.x = -Math.PI / 2;
            ring.position.set(px, 0.1 + r * 0.03, pz);
            root.add(ring);
            animItems.push({ type: 'spin_ring', mesh: ring, mat: rMat, spd: (r % 2 === 0 ? 5.0 : -4.2) });
        }

        // 1. 斬撃系（Lv10: X字双連斬 / Lv50: 五連次元断空斬 / Lv100: 天元・神滅黄金聖剣）
        if (cat === 'slash') {
            if (tier === 3) {
                // 空から超巨大黄金聖剣が突き刺さる！
                const sword = new THREE.Group();
                const bladeMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
                const auraMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.55 });
                const blade = new THREE.Mesh(new THREE.ConeGeometry(0.95, 7.2, 4), bladeMat);
                blade.rotation.x = Math.PI;
                blade.position.y = 3.6;
                const bladeAura = new THREE.Mesh(new THREE.ConeGeometry(1.45, 7.8, 4), auraMat);
                bladeAura.rotation.x = Math.PI;
                bladeAura.position.y = 3.6;
                const guard = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.42, 0.55), new THREE.MeshBasicMaterial({ color: 0xfbbf24 }));
                guard.position.y = 7.2;
                const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 1.8, 10), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
                grip.position.y = 8.1;
                sword.add(blade, bladeAura, guard, grip);
                sword.position.set(px + dirX * 4.2, 11.0, pz + dirZ * 4.2);
                sword.rotation.y = rotY;
                root.add(sword);

                const craterMat = new THREE.MeshBasicMaterial({ color: 0xfde047, side: THREE.DoubleSide, transparent: true, opacity: 0.95 });
                const crater = new THREE.Mesh(new THREE.RingGeometry(0.8, 5.8, 36), craterMat);
                crater.rotation.x = -Math.PI / 2;
                crater.position.set(px + dirX * 4.2, 0.16, pz + dirZ * 4.2);
                crater.scale.setScalar(0.1);
                root.add(crater);

                animItems.push({ type: 'sky_sword', sword, crater, craterMat, targetX: px + dirX * 4.2, targetZ: pz + dirZ * 4.2 });
            } else if (tier === 2) {
                // 五連次元断空斬
                for (let i = -2; i <= 2; i++) {
                    const ang = rotY + i * 0.24;
                    const sMat = new THREE.MeshBasicMaterial({ color: i === 0 ? 0xfde047 : 0xf472b6, side: THREE.DoubleSide, transparent: true, opacity: 0.95 });
                    const slash = new THREE.Mesh(new THREE.RingGeometry(1.4, 3.2, 24, 1, -Math.PI * 0.45, Math.PI * 0.9), sMat);
                    slash.position.set(px + Math.sin(ang) * 1.8, 1.3 + Math.abs(i) * 0.25, pz + Math.cos(ang) * 1.8);
                    slash.rotation.set(Math.PI * 0.3, ang, i * 0.4);
                    root.add(slash);
                    animItems.push({ type: 'projectile', mesh: slash, mat: sMat, vx: Math.sin(ang) * 15.0, vz: Math.cos(ang) * 15.0, spinZ: 4.0 });
                }
            } else {
                // 真・X字クロス双連斬
                [-0.65, 0.65].forEach((tilt, idx) => {
                    const sMat = new THREE.MeshBasicMaterial({ color: idx === 0 ? 0x38bdf8 : 0xfde047, side: THREE.DoubleSide, transparent: true, opacity: 0.95 });
                    const slash = new THREE.Mesh(new THREE.RingGeometry(1.1, 2.6, 24, 1, -Math.PI * 0.48, Math.PI * 0.96), sMat);
                    slash.position.set(px + dirX * 1.6, 1.35, pz + dirZ * 1.6);
                    slash.rotation.set(Math.PI * 0.25, rotY, tilt);
                    root.add(slash);
                    animItems.push({ type: 'projectile', mesh: slash, mat: sMat, vx: dirX * 13.0, vz: dirZ * 13.0, spinZ: 0 });
                });
            }
        }
        // 2. 火炎・爆発・ビッグバン系（メテオ落下 / スーパーノヴァ / ブラックホール創世爆発）
        else if (cat === 'fire' || cat === 'bigbang') {
            if (tier === 3 && cat === 'bigbang') {
                // 【奥義】オメガブラックホール＆銀河爆発
                const bhGrp = new THREE.Group();
                const core = new THREE.Mesh(new THREE.SphereGeometry(2.1, 24, 24), new THREE.MeshBasicMaterial({ color: 0x020617 }));
                const rimMat = new THREE.MeshBasicMaterial({ color: 0xa855f7, wireframe: true, transparent: true, opacity: 0.9 });
                const rim = new THREE.Mesh(new THREE.SphereGeometry(2.45, 18, 16), rimMat);
                const diskMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e, side: THREE.DoubleSide, transparent: true, opacity: 0.92 });
                const disk = new THREE.Mesh(new THREE.RingGeometry(2.5, 6.4, 36), diskMat);
                disk.rotation.x = Math.PI * 0.38;
                bhGrp.add(core, rim, disk);
                bhGrp.position.set(px + dirX * 4.0, 2.8, pz + dirZ * 4.0);
                root.add(bhGrp);
                animItems.push({ type: 'blackhole', grp: bhGrp, disk, rim, diskMat, rimMat });
            } else {
                // 天空から巨大隕石群が落下！（Lv10: 1発巨大隕石 / Lv50: 3発 / Lv100: 6発ラグナロクメテオ）
                const mCount = tier === 3 ? 6 : (tier === 2 ? 3 : 1);
                for (let i = 0; i < mCount; i++) {
                    const spreadAng = (i / Math.max(1, mCount)) * Math.PI * 2;
                    const dist = i === 0 ? 0 : (1.8 + tier * 0.8);
                    const tx = px + dirX * 3.8 + Math.cos(spreadAng) * dist;
                    const tz = pz + dirZ * 3.8 + Math.sin(spreadAng) * dist;
                    const rad = tier === 3 ? 1.55 : (tier === 2 ? 1.35 : 1.15);

                    const meteor = new THREE.Group();
                    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(rad, 1), new THREE.MeshBasicMaterial({ color: 0xf97316 }));
                    const flameMat = new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.78 });
                    const flame = new THREE.Mesh(new THREE.ConeGeometry(rad * 1.35, rad * 3.8, 12), flameMat);
                    flame.position.y = rad * 1.8;
                    meteor.add(rock, flame);
                    meteor.position.set(tx - dirX * 3.0, 12.0 + i * 1.8, tz - dirZ * 3.0);
                    root.add(meteor);

                    const expMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e, side: THREE.DoubleSide, transparent: true, opacity: 0 });
                    const expRing = new THREE.Mesh(new THREE.RingGeometry(0.6, rad * 3.2, 28), expMat);
                    expRing.rotation.x = -Math.PI / 2;
                    expRing.position.set(tx, 0.16, tz);
                    root.add(expRing);

                    animItems.push({ type: 'meteor_drop', meteor, expRing, expMat, tx, tz, delay: i * 0.08 });
                }
            }
        }
        // 3. ビーム系（Lv10: 螺旋ツインレーザー / Lv50: 収束メガ粒子砲 / Lv100: 虹色アルティメットブラスター）
        else if (cat === 'beam') {
            const len = tier === 3 ? 26.0 : (tier === 2 ? 21.0 : 17.0);
            const rad = tier === 3 ? 1.85 : (tier === 2 ? 1.35 : 0.95);
            const bGrp = new THREE.Group();

            const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.98 });
            const coreCyl = new THREE.Mesh(new THREE.CylinderGeometry(rad * 0.45, rad * 0.55, len, 18), coreMat);
            coreCyl.rotation.x = Math.PI / 2;
            coreCyl.position.z = len / 2 + 1.0;

            const outerMat = new THREE.MeshBasicMaterial({ color: tier === 3 ? 0xf472b6 : 0x38bdf8, transparent: true, opacity: 0.65 });
            const outerCyl = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad * 1.25, len, 20, 1, true), outerMat);
            outerCyl.rotation.x = Math.PI / 2;
            outerCyl.position.z = len / 2 + 1.0;
            bGrp.add(coreCyl, outerCyl);

            // 砲口に回転する巨大魔法ゲートリング＋螺旋衛星ビーム
            const gateCount = tier === 3 ? 4 : (tier === 2 ? 3 : 2);
            const gates = [];
            const gCols = [0xfde047, 0x38bdf8, 0xf472b6, 0x34d399];
            for (let g = 0; g < gateCount; g++) {
                const gMat = new THREE.MeshBasicMaterial({ color: gCols[g % gCols.length], side: THREE.DoubleSide, transparent: true, opacity: 0.92 });
                const gate = new THREE.Mesh(new THREE.TorusGeometry(rad * (1.55 + g * 0.25), 0.13, 10, 28), gMat);
                gate.position.z = 1.6 + g * 2.4;
                bGrp.add(gate);
                gates.push({ mesh: gate, mat: gMat, spd: (g % 2 === 0 ? 9 : -9) });
            }

            bGrp.position.set(px, 1.35, pz);
            bGrp.rotation.y = rotY;
            root.add(bGrp);
            animItems.push({ type: 'omega_beam', bGrp, coreCyl, outerCyl, coreMat, outerMat, gates });
        }
        // 4. 氷結系（Lv10: 巨大氷柱獄 / Lv50: コキュートス大氷河 / Lv100: フィンブルの冬）
        else if (cat === 'nova_ice') {
            const spireCount = tier === 3 ? 18 : (tier === 2 ? 12 : 7);
            const maxR = tier === 3 ? 6.5 : (tier === 2 ? 5.0 : 3.6);
            const spikes = [];
            for (let i = 0; i < spireCount; i++) {
                const ang = (i / spireCount) * Math.PI * 2;
                const dist = i === 0 ? 0 : (1.6 + (i % 3) * (maxR / 3));
                const h = (i === 0 ? 4.8 : 3.2) * (1 + tier * 0.28);
                const sMat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0xe0f2fe : 0x38bdf8, transparent: true, opacity: 0.9 });
                const sp = new THREE.Mesh(new THREE.ConeGeometry(0.55 + tier * 0.15, h, 6), sMat);
                sp.position.set(px + Math.cos(ang) * dist, -h * 0.5, pz + Math.sin(ang) * dist);
                root.add(sp);
                spikes.push({ mesh: sp, mat: sMat, targetY: h * 0.45 });
            }
            animItems.push({ type: 'ice_cathedral', spikes });
        }
        // 5. 雷系（天罰の黄金雷槍群）
        else if (cat === 'thunder') {
            const boltCount = tier === 3 ? 7 : (tier === 2 ? 4 : 2);
            const bolts = [];
            for (let i = 0; i < boltCount; i++) {
                const ang = (i / boltCount) * Math.PI * 2;
                const dist = i === 0 ? 0 : (1.8 + tier * 0.7);
                const bx = px + dirX * 3.5 + Math.cos(ang) * dist;
                const bz = pz + dirZ * 3.5 + Math.sin(ang) * dist;
                const bMat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0xfef08a : 0xfacc15, transparent: true, opacity: 0.96 });
                const spear = new THREE.Mesh(new THREE.CylinderGeometry(0.28 + tier * 0.1, 0.06, 11.0, 8), bMat);
                spear.position.set(bx, 5.5, bz);
                root.add(spear);
                bolts.push({ mesh: spear, mat: bMat });
            }
            animItems.push({ type: 'thunder_spears', bolts });
        }
        // 6. 風・闇・支援・ちゃぶ台その他もランク別の巨大3D造形へ進化！
        else {
            const pillarCount = tier === 3 ? 8 : (tier === 2 ? 5 : 3);
            const rad = 2.2 + tier * 1.2;
            const col = cat === 'wind' ? 0x34d399 : (cat === 'void' ? 0xa855f7 : (cat === 'chabudai' ? 0xf59e0b : 0xfde047));
            const objs = [];
            for (let i = 0; i < pillarCount; i++) {
                const ang = (i / pillarCount) * Math.PI * 2;
                const oMat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? col : 0xfde047, transparent: true, opacity: 0.9 });
                let mesh;
                if (cat === 'chabudai' && this.createChabudai3D) {
                    mesh = this.createChabudai3D();
                    mesh.scale.setScalar(1.2 + tier * 0.55);
                } else {
                    mesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.65 + tier * 0.25, 0), oMat);
                }
                mesh.position.set(px + Math.cos(ang) * rad, 1.8, pz + Math.sin(ang) * rad);
                root.add(mesh);
                objs.push({ mesh, mat: oMat, ang, rad });
            }
            animItems.push({ type: 'vortex_relics', objs, cx: px, cz: pz, dirX, dirZ, moveFwd: (cat === 'wind' || cat === 'void' || cat === 'chabudai') });
        }

        this.scene.add(root);
        const dur = tier === 3 ? 1.35 : (tier === 2 ? 1.05 : 0.85);
        this._v21SkillEffects.push({ root, animItems, life: dur, maxLife: dur });
    };

    P.updateV21SkillEffects = function (dt) {
        if (!this._v21SkillEffects || !this._v21SkillEffects.length) return;
        this._v21SkillEffects = this._v21SkillEffects.filter(ef => {
            ef.life -= dt;
            if (ef.life <= 0) {
                if (this.scene) this.scene.remove(ef.root);
                ef.root.traverse?.(o => { o.geometry?.dispose?.(); o.material?.dispose?.(); });
                return false;
            }
            const p = 1 - (ef.life / ef.maxLife);
            const fade = ef.life < 0.35 ? (ef.life / 0.35) : 1.0;

            ef.animItems.forEach(it => {
                if (it.type === 'spin_ring') {
                    it.mesh.rotation.z += dt * it.spd;
                    it.mat.opacity = fade * 0.9;
                } else if (it.type === 'sky_sword') {
                    const dropP = Math.min(1, p / 0.32);
                    it.sword.position.y = 11.0 * (1 - dropP);
                    it.sword.rotation.y += dt * 4.0;
                    if (dropP >= 1) {
                        const impP = (p - 0.32) / 0.68;
                        it.crater.scale.setScalar(0.2 + impP * 1.4);
                        it.craterMat.opacity = (1 - impP) * 0.95;
                    }
                } else if (it.type === 'projectile') {
                    it.mesh.position.x += it.vx * dt;
                    it.mesh.position.z += it.vz * dt;
                    if (it.spinZ) it.mesh.rotation.z += dt * it.spinZ;
                    it.mat.opacity = fade * 0.95;
                } else if (it.type === 'blackhole') {
                    const sc = p < 0.65 ? (0.4 + p * 1.5) : (1.4 + (p - 0.65) * 3.5);
                    it.grp.scale.setScalar(sc);
                    it.disk.rotation.z += dt * 8.0;
                    it.rim.rotation.y -= dt * 6.0;
                    it.diskMat.opacity = fade * 0.92;
                    it.rimMat.opacity = fade * 0.85;
                } else if (it.type === 'meteor_drop') {
                    const lp = Math.max(0, p - it.delay);
                    const fall = Math.min(1, lp / 0.45);
                    it.meteor.position.y = 12.0 * (1 - fall);
                    it.meteor.rotation.y += dt * 6.0;
                    if (fall >= 1) {
                        it.meteor.visible = false;
                        const ep = Math.min(1, (lp - 0.45) / 0.55);
                        it.expRing.scale.setScalar(0.3 + ep * 1.6);
                        it.expMat.opacity = (1 - ep) * 0.95;
                    }
                } else if (it.type === 'omega_beam') {
                    const pulse = Math.sin(p * Math.PI);
                    it.outerCyl.scale.set(0.6 + pulse * 0.85, 1, 0.6 + pulse * 0.85);
                    it.coreCyl.scale.set(0.5 + pulse * 0.75, 1, 0.5 + pulse * 0.75);
                    it.outerMat.opacity = fade * 0.7;
                    it.coreMat.opacity = fade * 0.98;
                    it.gates.forEach(g => {
                        g.mesh.rotation.z += dt * g.spd;
                        g.mat.opacity = fade * 0.92;
                    });
                } else if (it.type === 'ice_cathedral') {
                    const rise = Math.min(1, p * 3.5);
                    it.spikes.forEach(sp => {
                        sp.mesh.position.y = -sp.targetY + rise * (sp.targetY * 2);
                        sp.mat.opacity = fade * 0.92;
                    });
                } else if (it.type === 'thunder_spears') {
                    it.bolts.forEach((b, idx) => {
                        b.mesh.scale.set(1 + Math.sin(p * 30 + idx) * 0.35, 1, 1 + Math.sin(p * 30 + idx) * 0.35);
                        b.mat.opacity = fade * 0.96;
                    });
                } else if (it.type === 'vortex_relics') {
                    if (it.moveFwd) {
                        it.cx += it.dirX * dt * 8.5;
                        it.cz += it.dirZ * dt * 8.5;
                    }
                    it.objs.forEach(o => {
                        o.ang += dt * 7.5;
                        o.mesh.position.x = it.cx + Math.cos(o.ang) * o.rad;
                        o.mesh.position.z = it.cz + Math.sin(o.ang) * o.rad;
                        o.mesh.position.y = 1.4 + p * 2.2;
                        o.mesh.rotation.y += dt * 6.0;
                        o.mat.opacity = fade * 0.92;
                    });
                }
            });
            return true;
        });
    };

    const _prevTriggerAttackVisual = P.triggerAttackVisual;
    P.triggerAttackVisual = function (entity, isSkill = false, skillInfo = null) {
        const skillLv = Math.max(1, Number(skillInfo?.skillLv) || 1);
        if (isSkill && skillLv >= 10) {
            if (entity) {
                entity.attackAnimTimer = 0.42;
                entity.attackIsSkill = true;
            }
            const sId = String(skillInfo?.skillId || '').toLowerCase();
            const fullKey = (sId + ' ' + String(skillInfo?.skillName || '')).toLowerCase();
            let cat = skillInfo?.skillCategory || '';
            if (!cat) {
                if (skillInfo?.isChabudai || /chabu|table|flip|ちゃぶ|卓|返/.test(fullKey)) cat = 'chabudai';
                else if (/aurora|sanctuary|polar|極光|聖域|オーロラ/.test(fullKey)) cat = 'aurora';
                else if (/bigbang|big_bang|genesis|cosmos|creation|supernova|ビッグバン|創世|創星|創生/.test(fullKey)) cat = 'bigbang';
                else if (/heal|cure|prayer|bless|holy|light|buff|boost|aura|guard|shield|haste|support|癒|回復|祈|聖|浄化|強化|鼓舞|結界|加速|守護|支援|補助/.test(fullKey)) cat = 'support';
                else if (/beam|laser|ray|cannon|kame|ビーム|レーザー|光線|砲|波動|閃光/.test(fullKey)) cat = 'beam';
                else if (/zero|nova|absolute|blizzard|ice|frost|零度|ノヴァ|氷|吹雪|凍|雪/.test(fullKey)) cat = 'nova_ice';
                else if (/fire|meteor|flare|burn|bomb|flame|炎|爆|火|隕|紅蓮|業火/.test(fullKey)) cat = 'fire';
                else if (/thunder|bolt|spark|volt|lightning|雷|電|閃|迅/.test(fullKey)) cat = 'thunder';
                else if (/wind|storm|tornado|gale|cyclone|風|嵐|竜巻|疾風|旋風/.test(fullKey)) cat = 'wind';
                else if (/dark|void|shadow|abyss|gravity|闇|黒|影|重力|深淵|冥/.test(fullKey)) cat = 'void';
                else cat = 'slash';
            }

            const caster = (entity === this.player) ? this.getBasePlayerKaomoji() : (entity?.kaomoji || '仲間');
            // 極光の聖域は実際の回復フィールド展開も実行
            if (cat === 'aurora' && entity?.pos) {
                this.spawnAuroraSanctuary(entity.pos.x, entity.pos.z, skillLv, caster);
            }
            // Lv.100以上は覚醒奥義カットイン＆ファンファーレ発動！
            if (skillLv >= 100) {
                const evo = this.getSkillEvolutionTierInfo(cat, skillLv);
                this.showOugiCutin(caster, evo.title);
                sfx?.playHeal?.();
            }
            this.spawnUpgradedSkillVisualV21(entity, cat, skillLv, sId, skillInfo?.skillName || '');
            return;
        }

        if (_prevTriggerAttackVisual) {
            _prevTriggerAttackVisual.call(this, entity, isSkill, skillInfo);
        }
    };

    const _prevUpdateAnim = P.updateCharacterAnimations;
    P.updateCharacterAnimations = function (dt) {
        if (_prevUpdateAnim) _prevUpdateAnim.call(this, dt);
        this.updateV21SkillEffects(dt);
    };
}
// ▲▲▲ ここまで【2/3】 ▲▲▲
// ▼▼▼ ここから【3/3】 ▼▼▼
if (typeof KaomojiMMORPG !== 'undefined') {
    const P = KaomojiMMORPG.prototype;

    // 1. Lv.10(真) / Lv.50(極) / Lv.100(覚醒奥義) に応じてスキル実ダメージ＆回復倍率も強化
    if (P.useSkillSlot) {
        const _prevUseSkill = P.useSkillSlot;
        P.useSkillSlot = function (slotIdx) {
            const meta = this.resolveSkillMeta ? this.resolveSkillMeta(slotIdx) : null;
            const lv = meta ? meta.skillLv : 1;

            // Lv.100覚醒奥義発動時は周辺モンスターへ追加の奥義追撃ダメージも発生！
            _prevUseSkill.call(this, slotIdx);

            if (lv >= 100 && this.player && this.player.pos && Array.isArray(this.monsters)) {
                const st = this.getPlayerStats ? this.getPlayerStats() : { atk: 50 };
                const ougiBonusDmg = Math.max(50, Math.floor((st.atk || 50) * (1.8 + (lv - 100) * 0.02)));
                const px = this.player.pos.x;
                const pz = this.player.pos.z;

                this.monsters.forEach(m => {
                    if (!m || m.dead || !m.pos) return;
                    const dist = Math.hypot(m.pos.x - px, m.pos.z - pz);
                    if (dist <= 9.5) {
                        if (typeof this.damageMonster === 'function') {
                            this.damageMonster(m, ougiBonusDmg, true);
                        } else if (typeof m.hp === 'number') {
                            m.hp = Math.max(0, m.hp - ougiBonusDmg);
                            if (this.spawnFloatingText) {
                                this.spawnFloatingText(m.pos, `👑奥義 ${ougiBonusDmg}!`, '#fde047');
                            }
                        }
                    }
                });
            }
        };
    }

    // 2. スキルメニュー・スロットに「✨真」「🔥極」「👑奥義」の進化ランク表示を追加
    const _prevRenderModal = P.renderModalContent;
    P.renderModalContent = function () {
        if (_prevRenderModal) _prevRenderModal.call(this);
        const body = document.getElementById('modal-body');
        if (!body) return;

        if (/skill/i.test(String(this.activeTab || ''))) {
            body.insertAdjacentHTML('afterbegin', `
                <div class="card-box" style="margin-bottom:8px;border-color:#fde047;background:rgba(30,27,75,0.88);">
                    <div style="font-size:11px;font-weight:900;color:#fde047;margin-bottom:3px;">
                        ⚡ スキル見た目＆新技進化システム
                    </div>
                    <div style="font-size:10px;color:#e2e8f0;line-height:1.45;">
                        ・<b>Lv.10【真】</b>：技の見た目が強化形態（X字双連斬・巨大隕石・螺旋砲など）に進化！<br>
                        ・<b>Lv.50【極】</b>：五連次元斬・スーパーノヴァなど超豪華形態へ劇変！<br>
                        ・<b>Lv.100【👑覚醒奥義】</b>：<span style="color:#f472b6;font-weight:900;">新技解放＆専用カットイン＋広範囲奥義追撃</span>が発動！
                    </div>
                </div>
            `);
        }
    };

    // 3. 既存プレイヤーの顔ズレも確実に再整列
    P.ensureAllFacesAlignedV21 = function () {
        if (this.player && this.player.group) {
            this.alignAvatarFaceStrictly(this.player.group);
        }
        if (this.remotePlayers) {
            this.remotePlayers.forEach(rp => {
                if (rp && rp.group) this.alignAvatarFaceStrictly(rp.group);
            });
        }
    };

    if (P.buildPlayerEntity) {
        const _prevBuildPlayer = P.buildPlayerEntity;
        P.buildPlayerEntity = function () {
            _prevBuildPlayer.call(this);
            this.ensureAllFacesAlignedV21();
        };
    }
}

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.game) {
            window.game.syncSkillDescriptionsAndEffects?.();
            window.game.ensureAllFacesAlignedV21?.();
        }
    }, 150);
});
// === GAME7_V21_OK ===
// ▲▲▲ ここまで【3/3】 ▲▲▲
