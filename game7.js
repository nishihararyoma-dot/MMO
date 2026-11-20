'use strict';

// スキルLv.100到達で解放される「覚醒奥義（新技）」マスター定義（全11系統完全個別化）
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

(function injectV26CutinStyle() {
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

    // 1. アバターの顔ズレを根本から防止
    P.alignAvatarFaceStrictly = function (group) {
        if (!group || typeof THREE === 'undefined') return;
        const faceMeshes = [];
        const boxMeshes = [];
        group.traverse(obj => {
            if (!obj.isMesh || !obj.geometry) return;
            if (obj.material && obj.material.map && obj.material.map.image) {
                faceMeshes.push(obj);
            } else {
                boxMeshes.push(obj);
            }
        });
        faceMeshes.forEach(fm => {
            let bestHead = null;
            let bestDist = Infinity;
            boxMeshes.forEach(bm => {
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

    // 2. スキル名・IDから11種類の系統を正確に分類する共通ヘルパー（カタカナ英語も完全網羅）
    P.classifySkillCategoryV25 = function (rawKey, skillObj = null) {
        const comb = String(rawKey || '').toLowerCase();
        if (/chabu|table|flip|ちゃぶ|卓|返|┻|┬/.test(comb)) return 'chabudai';
        if (/aurora|sanctuary|polar|avalon|valhalla|極光|聖域|オーロラ|アヴァロン|ヴァルハラ/.test(comb)) return 'aurora';
        if (/bigbang|big_bang|genesis|cosmos|creation|supernova|quasar|blackhole|ビッグバン|びっくばん|そうせい|創世|創星|創生|宇宙|銀河|超新星|ブラックホール/.test(comb)) return 'bigbang';
        if (/heal|cure|prayer|bless|holy|light|buff|boost|aura|guard|shield|haste|support|recover|angel|seraph|癒|回復|祈|聖|浄化|強化|鼓舞|結界|加速|守護|支援|補助|天使|祝福|バリア|ヒール|キュア|ガード|ホーリー|シールド|ブレス/.test(comb) || skillObj?.type === 'heal' || skillObj?.type === 'buff') return 'support';
        if (/beam|laser|ray|cannon|kame|blaster|buster|wave|pulse|ビーム|レーザー|光線|砲|波動|閃光|ブラスター|バスター|レイ|パルス/.test(comb)) return 'beam';
        if (/zero|nova|absolute|blizzard|ice|frost|freeze|glacier|snow|零度|ノヴァ|氷|吹雪|凍|雪|ブリザード|アイス|フロスト|氷河|コキュートス/.test(comb)) return 'nova_ice';
        if (/fire|meteor|flare|burn|bomb|flame|inferno|magma|blaze|炎|爆|火|隕|紅蓮|業火|ファイア|フレイム|フレア|メテオ|バーン|マグマ|インフェルノ/.test(comb)) return 'fire';
        if (/thunder|bolt|spark|volt|lightning|plasma|electric|indora|雷|電|閃|迅|サンダー|ボルト|スパーク|ライトニング|プラズマ|インドラ/.test(comb)) return 'thunder';
        if (/wind|storm|tornado|gale|cyclone|tempest|aero|hurricane|風|嵐|竜巻|疾風|旋風|暴風|トルネード|ストーム|ゲイル|サイクロン|テンペスト|エアロ/.test(comb)) return 'wind';
        if (/dark|void|shadow|abyss|gravity|eclipse|curse|doom|venom|poison|闇|黒|影|重力|深淵|冥|虚無|暗黒|ダーク|シャドウ|アビス|グラビティ|毒|エクリプス/.test(comb)) return 'void';
        return 'slash';
    };

    // 技ごとの固有シード（同じ系統でも技名・スロットごとに色・軌道・形状を変える）
    P.computeSkillVariantSeed = function (keyStr) {
        const s = String(keyStr || 'default');
        let h = 0;
        for (let i = 0; i < s.length; i++) {
            h = ((h << 5) - h + s.charCodeAt(i)) | 0;
        }
        return Math.abs(h);
    };

    // スキルLvに応じた威力倍率（Lv1: 1.0倍 / Lv10: 3.25倍 / Lv50: 13.25倍 / Lv100: 25.75倍）
    P.calcSkillPowerMultiplierV26 = function (lv = 1) {
        const level = Math.max(1, Number(lv) || 1);
        return 1 + (level - 1) * 0.25;
    };

    // スロット番号から確実にスキルID・最新進化名・現在Lvを取得
    if (P.resolveSkillMeta) {
        const _prevResolveMeta = P.resolveSkillMeta;
        P.resolveSkillMeta = function (slotIdx) {
            const meta = _prevResolveMeta.call(this, slotIdx) || { slotIdx, skillId: `slot_${slotIdx}`, skillName: '', skillLv: 1 };
            const d = this.saveData || {};
            const list = (typeof SKILLS !== 'undefined' && SKILLS)
                ? (Array.isArray(SKILLS) ? SKILLS : Object.values(SKILLS))
                : [];
            const eqIds = d.equippedSkills || d.skillSlots || d.activeSkills || [];
            const eqId = Array.isArray(eqIds) ? eqIds[slotIdx] : null;
            const skObj = list.find(s => s && (s.id === eqId || s.skillId === eqId || s.id === meta.skillId)) || list[slotIdx] || null;

            if (skObj) {
                meta.skillId = String(skObj.id || skObj.skillId || meta.skillId);
                meta.skillName = String(skObj._baseNameV21 || skObj.name || meta.skillName);
            }

            const lvCandidates = [
                d.skillLevels?.[meta.skillId],
                d.skillLvs?.[meta.skillId],
                d.skillLevels?.[`slot_${slotIdx}`],
                d.skillLvs?.[`slot_${slotIdx}`],
                typeof d.skills?.[meta.skillId] === 'number' ? d.skills[meta.skillId] : d.skills?.[meta.skillId]?.lv,
                skObj?.lv,
                skObj?.level,
                meta.skillLv
            ].map(v => Number(v)).filter(v => !isNaN(v) && v >= 1);

            meta.skillLv = lvCandidates.length ? Math.max(...lvCandidates) : 1;
            const reCat = this.classifySkillCategoryV25(`${meta.skillId} ${meta.skillName}`, skObj);
            meta.skillCategory = reCat;
            meta.isChabudai = (reCat === 'chabudai');
            meta.variantSeed = this.computeSkillVariantSeed(`${meta.skillId}_${meta.skillName}_${slotIdx}`);
            return meta;
        };
    }

    P.getSkillEvolutionTierInfo = function (category, skillLv) {
        const art = AWAKENED_SKILL_ARTS[category] || AWAKENED_SKILL_ARTS.slash;
        if (skillLv >= 100) {
            return { tier: 3, badge: '👑Lv100奥義', title: art.lv100Art, desc: art.lv100Desc, color: art.color };
        }
        if (skillLv >= 50) {
            return { tier: 2, badge: '🔥Lv50極', title: art.lv50Title, desc: `【極・超強化形態】専用モーション＆超豪華エフェクトへ進化！`, color: art.color };
        }
        if (skillLv >= 10) {
            return { tier: 1, badge: '✨Lv10真', title: art.lv10Title, desc: `【真・強化形態】専用モーション＆強化エフェクトへ進化！`, color: art.color };
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
            const lv = Math.max(1, Number(
                d.skillLevels?.[sId] ??
                d.skillLvs?.[sId] ??
                d.skillLevels?.[`slot_${idx}`] ??
                d.skillLvs?.[`slot_${idx}`] ??
                (typeof d.skills?.[sId] === 'number' ? d.skills[sId] : d.skills?.[sId]?.lv) ??
                sk.lv ??
                sk.level ??
                1
            ) || 1);
            if ('lv' in sk) sk.lv = lv;
            if ('level' in sk) sk.level = lv;

            const cat = this.classifySkillCategoryV25(`${sId} ${sk._baseNameV21}`, sk);
            const mult = this.calcSkillPowerMultiplierV26(lv).toFixed(2);
            const evo = this.getSkillEvolutionTierInfo(cat, lv);

            if (lv >= 100) {
                sk.name = `${evo.title} (Lv.${lv})`;
                const txt = `[威力 x${mult}倍] ${evo.desc}`;
                if ('desc' in sk) sk.desc = txt;
                if ('description' in sk) sk.description = txt;
            } else if (lv >= 50) {
                sk.name = `${sk._baseNameV21}【極】Lv.${lv}`;
                const txt = `[威力 x${mult}倍] ${sk._baseDescV21} ▶【${evo.title}】解放中！(Lv.100で新奥義解放)`;
                if ('desc' in sk) sk.desc = txt;
                if ('description' in sk) sk.description = txt;
            } else if (lv >= 10) {
                sk.name = `${sk._baseNameV21}【真】Lv.${lv}`;
                const txt = `[威力 x${mult}倍] ${sk._baseDescV21} ▶【${evo.title}】解放中！(Lv.50で極・Lv.100で新奥義)`;
                if ('desc' in sk) sk.desc = txt;
                if ('description' in sk) sk.description = txt;
            } else {
                sk.name = `${sk._baseNameV21} (Lv.${lv})`;
                const txt = `[威力 x${mult}倍] ${sk._baseDescV21} (Lv.10で真・Lv.50で極・Lv.100で新奥義解放！)`;
                if ('desc' in sk) sk.desc = txt;
                if ('description' in sk) sk.description = txt;
            }
        });
    };

    // 3. キャラ本体のスキルモーション（全11系統で動きが被らない専用アクション）
    P.triggerSkillBodyMotionV25 = function (entity, cat, skillLv = 1) {
        if (!entity) return;
        const dur = skillLv >= 100 ? 0.72 : (skillLv >= 50 ? 0.58 : 0.46);
        const motionMap = {
            slash: 'spin_slash',        // 踏み込み＋高速横回転斬り
            fire: 'meteor_jump',        // 高く跳躍して隕石叩きつけ
            bigbang: 'nova_charge',     // 宙に浮いて全身膨張→大解放
            beam: 'beam_brace',         // 踏ん張り＋反動バックステップ砲撃
            nova_ice: 'sky_summon',     // 浮遊＋天を仰ぐ氷結召喚ポーズ
            thunder: 'thunder_drop',    // 急上昇＋落雷ダイブ
            wind: 'tornado_spin',       // 竜巻のように高速スピン上昇
            void: 'abyss_float',        // 闇の浮遊＋反り返り詠唱
            support: 'holy_prayer',     // 聖なる浮遊＋祝福の揺れ
            aurora: 'holy_prayer',      // 聖域展開の祈り浮遊
            chabudai: 'table_uppercut'  // 激怒震え＋豪快アッパーちゃぶ台返し
        };
        entity.skillMotionV25 = {
            style: motionMap[cat] || 'spin_slash',
            timer: dur,
            maxTimer: dur
        };
    };

    // 4. 全11系統 × 4進化段階（基本 / Lv.10真 / Lv.50極 / Lv.100覚醒奥義）× 技固有シード差分
    P.spawnDistinctSkillVisualV25 = function (entity, cat, skillLv, sId, skillName, seed = 0) {
        if (!this.useWebGL || !this.scene || !entity?.pos || typeof THREE === 'undefined') return;
        if (!this._v21SkillEffects) this._v21SkillEffects = [];

        const tier = skillLv >= 100 ? 3 : (skillLv >= 50 ? 2 : (skillLv >= 10 ? 1 : 0));
        const evo = this.getSkillEvolutionTierInfo(cat, skillLv);
        const rotY = entity.rotY || 0;
        const dirX = Math.sin(rotY);
        const dirZ = Math.cos(rotY);
        const px = entity.pos.x;
        const pz = entity.pos.z;
        const sc = tier === 3 ? 1.6 : (tier === 2 ? 1.32 : (tier === 1 ? 1.12 : 0.88));
        const vSeed = Math.abs(Number(seed) || 0);

        const root = new THREE.Group();
        const animItems = [];
        const mainCol = evo.color || 0xfde047;

        // Lv.10以上はランクに応じた多重進化魔法陣を足元に展開
        if (tier >= 1) {
            const ringCols = [mainCol, 0xfde047, 0xf472b6];
            for (let r = 0; r < tier; r++) {
                const rIn = 1.35 + r * 1.1;
                const rOut = rIn + 0.38;
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
                animItems.push({ type: 'spin_ring', mesh: ring, mat: rMat, spd: (r % 2 === 0 ? 5.2 : -4.4) });
            }
        }

        // ① 斬撃系（slash）
        if (cat === 'slash') {
            const palettes = [
                [0x38bdf8, 0xfde047],
                [0xf43f5e, 0xfbbf24],
                [0xa855f7, 0x38bdf8],
                [0x34d399, 0xfef08a]
            ];
            const pal = palettes[vSeed % palettes.length];
            const tiltDir = (vSeed % 2 === 0) ? 1 : -1;

            if (tier === 3) {
                const sword = new THREE.Group();
                const blade = new THREE.Mesh(new THREE.ConeGeometry(1.0, 7.6, 4), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
                blade.rotation.x = Math.PI;
                blade.position.y = 3.8;
                const bladeAura = new THREE.Mesh(new THREE.ConeGeometry(1.55, 8.2, 4), new THREE.MeshBasicMaterial({ color: pal[0], transparent: true, opacity: 0.55 }));
                bladeAura.rotation.x = Math.PI;
                bladeAura.position.y = 3.8;
                const guard = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.44, 0.58), new THREE.MeshBasicMaterial({ color: 0xfbbf24 }));
                guard.position.y = 7.6;
                const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 1.9, 10), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
                grip.position.y = 8.55;
                sword.add(blade, bladeAura, guard, grip);
                sword.position.set(px + dirX * 4.4, 11.5, pz + dirZ * 4.4);
                sword.rotation.y = rotY;
                root.add(sword);

                const craterMat = new THREE.MeshBasicMaterial({ color: 0xfde047, side: THREE.DoubleSide, transparent: true, opacity: 0.95 });
                const crater = new THREE.Mesh(new THREE.RingGeometry(0.8, 6.2, 36), craterMat);
                crater.rotation.x = -Math.PI / 2;
                crater.position.set(px + dirX * 4.4, 0.16, pz + dirZ * 4.4);
                crater.scale.setScalar(0.1);
                root.add(crater);

                const pillars = [];
                for (let p = 0; p < 8; p++) {
                    const ang = (p / 8) * Math.PI * 2;
                    const pMat = new THREE.MeshBasicMaterial({ color: pal[p % 2], transparent: true, opacity: 0 });
                    const pil = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.36, 5.2, 8), pMat);
                    pil.position.set(px + dirX * 4.4 + Math.cos(ang) * 3.2, 2.6, pz + dirZ * 4.4 + Math.sin(ang) * 3.2);
                    root.add(pil);
                    pillars.push({ mesh: pil, mat: pMat });
                }
                animItems.push({ type: 'sky_sword', sword, crater, craterMat, pillars });
            } else if (tier === 2) {
                for (let i = -2; i <= 2; i++) {
                    const ang = rotY + i * 0.25;
                    const sMat = new THREE.MeshBasicMaterial({ color: i === 0 ? 0xfde047 : pal[Math.abs(i) % 2], side: THREE.DoubleSide, transparent: true, opacity: 0.95 });
                    const slash = new THREE.Mesh(new THREE.RingGeometry(1.4, 3.3, 24, 1, -Math.PI * 0.45, Math.PI * 0.9), sMat);
                    slash.position.set(px + Math.sin(ang) * 1.8, 1.35 + Math.abs(i) * 0.25, pz + Math.cos(ang) * 1.8);
                    slash.rotation.set(Math.PI * 0.3, ang, i * 0.42 * tiltDir);
                    root.add(slash);
                    animItems.push({ type: 'projectile', mesh: slash, mat: sMat, vx: Math.sin(ang) * 15.5, vz: Math.cos(ang) * 15.5, spinZ: 4.5 * tiltDir });
                }
            } else if (tier === 1) {
                [-0.68, 0.68].forEach((tilt, idx) => {
                    const sMat = new THREE.MeshBasicMaterial({ color: pal[idx], side: THREE.DoubleSide, transparent: true, opacity: 0.95 });
                    const slash = new THREE.Mesh(new THREE.RingGeometry(1.15, 2.65, 24, 1, -Math.PI * 0.48, Math.PI * 0.96), sMat);
                    slash.position.set(px + dirX * 1.6, 1.35, pz + dirZ * 1.6);
                    slash.rotation.set(Math.PI * 0.26, rotY, tilt * tiltDir);
                    root.add(slash);
                    animItems.push({ type: 'projectile', mesh: slash, mat: sMat, vx: dirX * 13.5, vz: dirZ * 13.5, spinZ: 0 });
                });
            } else {
                const sMat = new THREE.MeshBasicMaterial({ color: pal[0], side: THREE.DoubleSide, transparent: true, opacity: 0.92 });
                const slash = new THREE.Mesh(new THREE.RingGeometry(0.85, 1.95, 22, 1, -Math.PI * 0.44, Math.PI * 0.88), sMat);
                slash.position.set(px + dirX * 1.4, 1.25, pz + dirZ * 1.4);
                slash.rotation.set(Math.PI * 0.28, rotY, ((vSeed % 5) - 2) * 0.28);
                root.add(slash);
                animItems.push({ type: 'projectile', mesh: slash, mat: sMat, vx: dirX * 11.5, vz: dirZ * 11.5, spinZ: 0 });
            }
        }
        // ② 炎・爆発系（fire）
        else if (cat === 'fire') {
            const firePals = [
                [0xf97316, 0xfef08a, 0xef4444],
                [0x38bdf8, 0xe0f2fe, 0x2563eb],
                [0xdc2626, 0xfde047, 0x991b1b]
            ];
            const fPal = firePals[vSeed % firePals.length];

            if (tier === 0) {
                const fGrp = new THREE.Group();
                const core = new THREE.Mesh(new THREE.SphereGeometry(0.55, 14, 14), new THREE.MeshBasicMaterial({ color: fPal[1] }));
                const shellMat = new THREE.MeshBasicMaterial({ color: fPal[0], wireframe: true, transparent: true, opacity: 0.85 });
                const shell = new THREE.Mesh(new THREE.DodecahedronGeometry(0.78, 1), shellMat);
                fGrp.add(core, shell);
                fGrp.position.set(px + dirX * 1.4, 1.25, pz + dirZ * 1.4);
                root.add(fGrp);
                animItems.push({ type: 'projectile', mesh: fGrp, mat: shellMat, vx: dirX * 13.0, vz: dirZ * 13.0, spinZ: 8.0 });
            } else {
                const mCount = tier === 3 ? 6 : (tier === 2 ? 3 : 1);
                for (let i = 0; i < mCount; i++) {
                    const spreadAng = (i / Math.max(1, mCount)) * Math.PI * 2 + (vSeed % 3);
                    const dist = i === 0 ? 0 : (1.9 + tier * 0.85);
                    const tx = px + dirX * 3.8 + Math.cos(spreadAng) * dist;
                    const tz = pz + dirZ * 3.8 + Math.sin(spreadAng) * dist;
                    const rad = 0.95 + tier * 0.25;

                    const meteor = new THREE.Group();
                    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(rad, 1), new THREE.MeshBasicMaterial({ color: fPal[0] }));
                    const flame = new THREE.Mesh(new THREE.ConeGeometry(rad * 1.38, rad * 3.8, 12), new THREE.MeshBasicMaterial({ color: fPal[1], transparent: true, opacity: 0.82 }));
                    flame.position.y = rad * 1.8;
                    meteor.add(rock, flame);
                    meteor.position.set(tx - dirX * 2.6, 11.5 + i * 1.6, tz - dirZ * 2.6);
                    root.add(meteor);

                    const expMat = new THREE.MeshBasicMaterial({ color: fPal[2], side: THREE.DoubleSide, transparent: true, opacity: 0 });
                    const expRing = new THREE.Mesh(new THREE.RingGeometry(0.5, rad * 3.3, 28), expMat);
                    expRing.rotation.x = -Math.PI / 2;
                    expRing.position.set(tx, 0.16, tz);
                    root.add(expRing);

                    animItems.push({ type: 'meteor_drop', meteor, expRing, expMat, startY: meteor.position.y, delay: i * 0.07 });
                }
            }
        }
        // ③ ビッグバン・創世系（bigbang）
        else if (cat === 'bigbang') {
            const bhGrp = new THREE.Group();
            const coreCol = tier === 3 ? 0x020617 : 0xffffff;
            const core = new THREE.Mesh(new THREE.SphereGeometry(1.15 * sc, 24, 24), new THREE.MeshBasicMaterial({ color: coreCol }));
            const rimMat = new THREE.MeshBasicMaterial({ color: tier === 3 ? 0xa855f7 : 0xf43f5e, wireframe: true, transparent: true, opacity: 0.9 });
            const rim = new THREE.Mesh(new THREE.SphereGeometry(1.7 * sc, 18, 16), rimMat);
            const diskMat = new THREE.MeshBasicMaterial({ color: 0xfde047, side: THREE.DoubleSide, transparent: true, opacity: 0.92 });
            const disk = new THREE.Mesh(new THREE.RingGeometry(1.85 * sc, 4.6 * sc, 36), diskMat);
            disk.rotation.x = Math.PI * 0.36;
            bhGrp.add(core, rim, disk);

            let jets = null;
            if (tier >= 2) {
                const jetMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.78 });
                jets = new THREE.Mesh(new THREE.CylinderGeometry(0.45 * sc, 0.45 * sc, 12.0, 16), jetMat);
                bhGrp.add(jets);
            }
            bhGrp.position.set(px + dirX * 3.8, 2.4, pz + dirZ * 3.8);
            root.add(bhGrp);
            animItems.push({ type: 'blackhole', grp: bhGrp, disk, rim, diskMat, rimMat, jets });
        }
        // ④ ビーム・波動砲系（beam）
        else if (cat === 'beam') {
            const beamCols = [0x38bdf8, 0xf472b6, 0xfacc15, 0x34d399];
            const bCol = tier === 3 ? 0xf472b6 : beamCols[vSeed % beamCols.length];
            const len = 12.5 + tier * 4.8;
            const rad = 0.58 + tier * 0.42;

            const bGrp = new THREE.Group();
            const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.98 });
            const coreCyl = new THREE.Mesh(new THREE.CylinderGeometry(rad * 0.45, rad * 0.55, len, 18), coreMat);
            coreCyl.rotation.x = Math.PI / 2;
            coreCyl.position.z = len / 2 + 1.0;

            const outerMat = new THREE.MeshBasicMaterial({ color: bCol, transparent: true, opacity: 0.65 });
            const outerCyl = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad * 1.25, len, 20, 1, true), outerMat);
            outerCyl.rotation.x = Math.PI / 2;
            outerCyl.position.z = len / 2 + 1.0;
            bGrp.add(coreCyl, outerCyl);

            const gateCount = tier + 1;
            const gates = [];
            const gCols = [0xfde047, 0x38bdf8, 0xf472b6, 0x34d399];
            for (let g = 0; g < gateCount; g++) {
                const gMat = new THREE.MeshBasicMaterial({
                    color: gCols[(g + vSeed) % gCols.length],
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.92
                });
                const gate = new THREE.Mesh(new THREE.TorusGeometry(rad * (1.5 + g * 0.25), 0.11, 10, 28), gMat);
                gate.position.z = 1.5 + g * 2.3;
                bGrp.add(gate);
                gates.push({ mesh: gate, mat: gMat, spd: (g % 2 === 0 ? 9 : -9) });
            }
            bGrp.position.set(px, 1.35, pz);
            bGrp.rotation.y = rotY;
            root.add(bGrp);
            animItems.push({ type: 'omega_beam', bGrp, coreCyl, outerCyl, coreMat, outerMat, gates });
        }
        // ⑤ 氷結系（nova_ice）
        else if (cat === 'nova_ice') {
            const spireCount = 5 + tier * 5;
            const maxR = 2.6 + tier * 1.3;
            const spikes = [];
            for (let i = 0; i < spireCount; i++) {
                const ang = (i / spireCount) * Math.PI * 2 + (vSeed % 3) * 0.4;
                const dist = tier === 0 ? (1.5 + i * 1.3) : (i === 0 ? 0 : (1.3 + (i % 3) * (maxR / 3)));
                const bx = tier === 0 ? (px + dirX * dist) : (px + Math.cos(ang) * dist);
                const bz = tier === 0 ? (pz + dirZ * dist) : (pz + Math.sin(ang) * dist);
                const h = (i === 0 ? 3.8 : 2.6) * (1 + tier * 0.28);
                const sMat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0xe0f2fe : 0x38bdf8, transparent: true, opacity: 0.9 });
                const sp = new THREE.Mesh(new THREE.ConeGeometry(0.45 + tier * 0.14, h, 6), sMat);
                sp.position.set(bx, -h * 0.5, bz);
                root.add(sp);
                spikes.push({ mesh: sp, mat: sMat, targetY: h * 0.45 });
            }
            animItems.push({ type: 'ice_cathedral', spikes });
        }
        // ⑥ 雷系（thunder）
        else if (cat === 'thunder') {
            const boltCount = tier === 3 ? 8 : (tier === 2 ? 5 : (tier === 1 ? 3 : 1));
            const bolts = [];
            for (let i = 0; i < boltCount; i++) {
                const ang = (i / boltCount) * Math.PI * 2 + (vSeed % 4) * 0.5;
                const dist = i === 0 ? 0 : (1.7 + tier * 0.72);
                const bx = px + dirX * 3.5 + Math.cos(ang) * dist;
                const bz = pz + dirZ * 3.5 + Math.sin(ang) * dist;
                const bMat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0xfef08a : 0xfacc15, transparent: true, opacity: 0.96 });
                const spear = new THREE.Mesh(new THREE.CylinderGeometry(0.24 + tier * 0.1, 0.05, 11.0, 8), bMat);
                spear.position.set(bx, 5.5, bz);
                root.add(spear);
                bolts.push({ mesh: spear, mat: bMat });
            }
            animItems.push({ type: 'thunder_spears', bolts });
        }
        // ⑦ 風・竜巻系（wind）
        else if (cat === 'wind') {
            const tCount = tier === 3 ? 5 : (tier === 2 ? 3 : (tier === 1 ? 2 : 1));
            const tornadoes = [];
            for (let t = 0; t < tCount; t++) {
                const tGrp = new THREE.Group();
                const layerCount = 5 + tier * 2;
                const layers = [];
                for (let l = 0; l < layerCount; l++) {
                    const r = (0.42 + l * 0.26) * sc;
                    const lMat = new THREE.MeshBasicMaterial({ color: l % 2 === 0 ? 0x34d399 : 0xa7f3d0, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
                    const torus = new THREE.Mesh(new THREE.TorusGeometry(r, 0.07 + tier * 0.02, 8, 24), lMat);
                    torus.rotation.x = Math.PI / 2;
                    torus.position.y = 0.35 + l * 0.58;
                    tGrp.add(torus);
                    layers.push({ mesh: torus, mat: lMat, spd: (l % 2 === 0 ? 11 : -11) });
                }
                const offsetIdx = t - (tCount - 1) * 0.5;
                const sideOff = offsetIdx * 2.1;
                const rx = Math.cos(rotY) * sideOff;
                const rz = -Math.sin(rotY) * sideOff;
                tGrp.position.set(px + dirX * 1.8 + rx, 0, pz + dirZ * 1.8 + rz);
                root.add(tGrp);
                tornadoes.push({ grp: tGrp, layers });
            }
            animItems.push({ type: 'wind_tornado', tornadoes, vx: dirX * 10.5, vz: dirZ * 10.5 });
        }
        // ⑧ 闇・重力・毒系（void）
        else if (cat === 'void') {
            const vGrp = new THREE.Group();
            const darkCore = new THREE.Mesh(
                new THREE.SphereGeometry(1.05 * sc, 20, 20),
                new THREE.MeshBasicMaterial({ color: 0x090d16 })
            );
            const eclMat = new THREE.MeshBasicMaterial({ color: 0xa855f7, side: THREE.DoubleSide, transparent: true, opacity: 0.94 });
            const eclRing = new THREE.Mesh(new THREE.TorusGeometry(1.45 * sc, 0.16 * sc, 10, 32), eclMat);
            const waveMat = new THREE.MeshBasicMaterial({ color: 0xc084fc, side: THREE.DoubleSide, transparent: true, opacity: 0.65 });
            const waveDisc = new THREE.Mesh(new THREE.RingGeometry(1.6 * sc, 3.6 * sc, 32), waveMat);
            waveDisc.rotation.x = -Math.PI / 2;
            vGrp.add(darkCore, eclRing, waveDisc);
            if (tier >= 1) {
                const subRing = new THREE.Mesh(new THREE.TorusGeometry(1.85 * sc, 0.1 * sc, 8, 28), eclMat);
                subRing.rotation.x = Math.PI / 2;
                vGrp.add(subRing);
            }
            vGrp.position.set(px + dirX * 3.4, 1.85, pz + dirZ * 3.4);
            root.add(vGrp);
            animItems.push({ type: 'void_eclipse', vGrp, eclRing, waveDisc, eclMat, waveMat });
        }
        // ⑨ 回復・祝福支援系（support）
        else if (cat === 'support') {
            const sGrp = new THREE.Group();
            const haloMat = new THREE.MeshBasicMaterial({ color: 0xfde047, transparent: true, opacity: 0.95 });
            const halo = new THREE.Mesh(new THREE.TorusGeometry(0.85 * sc, 0.09, 10, 28), haloMat);
            halo.rotation.x = Math.PI / 2;
            halo.position.y = 2.8;
            sGrp.add(halo);

            const wings = [];
            if (tier >= 1) {
                const wingPairs = tier >= 2 ? 2 : 1;
                for (let wp = 0; wp < wingPairs; wp++) {
                    [-1, 1].forEach(side => {
                        const wMat = new THREE.MeshBasicMaterial({ color: wp === 0 ? 0xffffff : 0xfef08a, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
                        const wing = new THREE.Mesh(new THREE.PlaneGeometry((1.65 - wp * 0.3) * sc, (1.1 - wp * 0.2) * sc), wMat);
                        wing.position.set(side * (1.15 + wp * 0.25) * sc, 1.85 - wp * 0.45, -0.35 - wp * 0.1);
                        wing.rotation.y = side * 0.38;
                        wing.rotation.z = side * (0.25 - wp * 0.35);
                        sGrp.add(wing);
                        wings.push({ mesh: wing, mat: wMat, side });
                    });
                }
            }

            const crosses = [];
            const cCount = 6 + tier * 5;
            for (let i = 0; i < cCount; i++) {
                const ang = (i / cCount) * Math.PI * 2;
                const dist = (1.1 + (i % 2) * 0.65) * sc;
                const cObj = new THREE.Group();
                const cMat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x4ade80 : 0xfef08a, transparent: true, opacity: 0.95 });
                cObj.add(new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.11, 0.11), cMat), new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.36, 0.11), cMat));
                cObj.position.set(Math.cos(ang) * dist, 0.4 + (i % 3) * 0.4, Math.sin(ang) * dist);
                sGrp.add(cObj);
                crosses.push({ mesh: cObj, mat: cMat, ang, dist });
            }
            sGrp.position.set(px, 0, pz);
            root.add(sGrp);
            animItems.push({ type: 'support_eden', sGrp, halo, haloMat, wings, crosses, followEntity: entity });
        }
        // ⑩ 極光の聖域（aurora）
        else if (cat === 'aurora') {
            const aGrp = new THREE.Group();
            const domeMat = new THREE.MeshBasicMaterial({ color: 0x2dd4bf, side: THREE.DoubleSide, transparent: true, opacity: 0.32, wireframe: true });
            const dome = new THREE.Mesh(new THREE.SphereGeometry(3.2 * sc, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), domeMat);
            aGrp.add(dome);

            const curtains = [];
            const aCols = [0x2dd4bf, 0xf472b6, 0x38bdf8, 0xfde047];
            for (let i = 0; i < 6 + tier * 3; i++) {
                const ang = (i / (6 + tier * 3)) * Math.PI * 2;
                const cMat = new THREE.MeshBasicMaterial({ color: aCols[i % aCols.length], side: THREE.DoubleSide, transparent: true, opacity: 0.55 });
                const curtain = new THREE.Mesh(new THREE.PlaneGeometry(1.1 * sc, 4.2 * sc), cMat);
                curtain.position.set(Math.cos(ang) * 2.5 * sc, 2.1 * sc, Math.sin(ang) * 2.5 * sc);
                curtain.rotation.y = -ang + Math.PI / 2;
                aGrp.add(curtain);
                curtains.push({ mesh: curtain, mat: cMat, ang, dist: 2.5 * sc });
            }
            aGrp.position.set(px, 0, pz);
            root.add(aGrp);
            animItems.push({ type: 'aurora_temple', aGrp, dome, domeMat, curtains });
        }
        // ⑪ ちゃぶ台返し系（chabudai）
        else {
            const tCount = tier === 2 ? 3 : 1;
            const tables = [];
            for (let t = 0; t < tCount; t++) {
                const table = this.createChabudai3D
                    ? this.createChabudai3D()
                    : new THREE.Mesh(new THREE.BoxGeometry(2, 0.2, 2), new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
                table.scale.setScalar(tier === 3 ? 3.2 : (1.0 + tier * 0.45));
                const spread = (t - (tCount - 1) * 0.5) * 0.32;
                const ang = rotY + spread;
                table.position.set(px + Math.sin(ang) * 1.3, 1.0, pz + Math.cos(ang) * 1.3);
                table.rotation.y = ang;
                root.add(table);
                tables.push({ mesh: table, vx: Math.sin(ang) * 13.5, vz: Math.cos(ang) * 13.5 });
            }
            animItems.push({ type: 'chabudai_flip', tables });
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
                ef.root.traverse?.(o => {
                    o.geometry?.dispose?.();
                    o.material?.dispose?.();
                });
                return false;
            }
            const p = 1 - (ef.life / ef.maxLife);
            const fade = ef.life < 0.32 ? (ef.life / 0.32) : 1.0;

            ef.animItems.forEach(it => {
                if (it.type === 'spin_ring') {
                    it.mesh.rotation.z += dt * it.spd;
                    it.mat.opacity = fade * 0.9;
                } else if (it.type === 'sky_sword') {
                    const dropP = Math.min(1, p / 0.32);
                    it.sword.position.y = 11.5 * (1 - dropP);
                    it.sword.rotation.y += dt * 4.0;
                    if (dropP >= 1) {
                        const impP = (p - 0.32) / 0.68;
                        it.crater.scale.setScalar(0.2 + impP * 1.45);
                        it.craterMat.opacity = (1 - impP) * 0.95;
                        it.pillars?.forEach(pl => {
                            pl.mat.opacity = (1 - impP) * 0.88;
                        });
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
                    if (it.jets) it.jets.rotation.y += dt * 12.0;
                    it.diskMat.opacity = fade * 0.92;
                    it.rimMat.opacity = fade * 0.85;
                } else if (it.type === 'meteor_drop') {
                    const lp = Math.max(0, p - it.delay);
                    const fall = Math.min(1, lp / 0.45);
                    it.meteor.position.y = (it.startY || 11.5) * (1 - fall);
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
                } else if (it.type === 'wind_tornado') {
                    it.tornadoes.forEach(td => {
                        td.grp.position.x += it.vx * dt;
                        td.grp.position.z += it.vz * dt;
                        td.layers.forEach(l => {
                            l.mesh.rotation.z += dt * l.spd;
                            l.mat.opacity = fade * 0.85;
                        });
                    });
                } else if (it.type === 'void_eclipse') {
                    it.vGrp.scale.setScalar(0.6 + p * 1.45);
                    it.eclRing.rotation.x += dt * 5.0;
                    it.eclRing.rotation.y += dt * 7.0;
                    it.waveDisc.scale.setScalar(0.7 + p * 1.8);
                    it.eclMat.opacity = fade * 0.94;
                    it.waveMat.opacity = fade * 0.65;
                } else if (it.type === 'support_eden') {
                    if (it.followEntity?.pos) it.sGrp.position.set(it.followEntity.pos.x, 0, it.followEntity.pos.z);
                    it.halo.rotation.z += dt * 5.0;
                    it.haloMat.opacity = fade * 0.95;
                    it.wings.forEach(w => {
                        w.mesh.rotation.y = w.side * (0.38 + Math.sin(p * Math.PI * 4) * 0.25);
                        w.mat.opacity = fade * 0.9;
                    });
                    it.crosses.forEach(c => {
                        c.ang += dt * 3.0;
                        c.mesh.position.x = Math.cos(c.ang) * c.dist;
                        c.mesh.position.z = Math.sin(c.ang) * c.dist;
                        c.mesh.position.y += dt * 1.8;
                        c.mat.opacity = fade * 0.95;
                    });
                } else if (it.type === 'aurora_temple') {
                    it.dome.rotation.y += dt * 1.8;
                    it.domeMat.opacity = fade * 0.35;
                    it.curtains.forEach(c => {
                        c.ang += dt * 2.2;
                        c.mesh.position.x = Math.cos(c.ang) * c.dist;
                        c.mesh.position.z = Math.sin(c.ang) * c.dist;
                        c.mesh.rotation.y = -c.ang + Math.PI / 2;
                        c.mat.opacity = fade * 0.58;
                    });
                } else if (it.type === 'chabudai_flip') {
                    it.tables.forEach(tb => {
                        tb.mesh.position.x += tb.vx * dt;
                        tb.mesh.position.z += tb.vz * dt;
                        tb.mesh.position.y = 1.0 + Math.sin(p * Math.PI) * 3.2;
                        tb.mesh.rotation.x = p * Math.PI * 5.0;
                        tb.mesh.rotation.z = p * Math.PI * 1.5;
                    });
                }
            });
            return true;
        });
    };

    // 5. スキル発動時のビジュアル＆モーション統合フック
    const _prevTriggerAttackVisual = P.triggerAttackVisual;
    P.triggerAttackVisual = function (entity, isSkill = false, skillInfo = null) {
        if (isSkill) {
            let skillLv = Math.max(1, Number(skillInfo?.skillLv) || 1);
            let sId = String(skillInfo?.skillId || '').toLowerCase();
            let sName = String(skillInfo?.skillName || '');
            if (entity === this.player && skillInfo?.slotIdx !== undefined && this.resolveSkillMeta) {
                const fresh = this.resolveSkillMeta(skillInfo.slotIdx);
                if (fresh) {
                    skillLv = Math.max(skillLv, fresh.skillLv);
                    sId = fresh.skillId || sId;
                    sName = fresh.skillName || sName;
                }
            }
            const fullKey = `${sId} ${sName}`;
            const cat = this.classifySkillCategoryV25(fullKey);
            const seed = skillInfo?.variantSeed ?? this.computeSkillVariantSeed(fullKey);

            if (entity) {
                entity.attackAnimTimer = 0.01;
                entity.attackIsSkill = true;
            }
            this.triggerSkillBodyMotionV25(entity, cat, skillLv);

            const caster = (entity === this.player) ? this.getBasePlayerKaomoji() : (entity?.kaomoji || '仲間');
            if (cat === 'aurora' && entity?.pos) {
                this.spawnAuroraSanctuary(entity.pos.x, entity.pos.z, skillLv, caster);
            }
            if (skillLv >= 100) {
                const evo = this.getSkillEvolutionTierInfo(cat, skillLv);
                this.showOugiCutin(caster, evo.title);
                sfx?.playHeal?.();
            }
            this.spawnDistinctSkillVisualV25(entity, cat, skillLv, sId, sName, seed);
            return;
        }
        if (_prevTriggerAttackVisual) {
            _prevTriggerAttackVisual.call(this, entity, isSkill, skillInfo);
        }
    };

    // 6. キャラ本体のスキルモーション再生＋エフェクト更新
    const _prevUpdateAnim = P.updateCharacterAnimations;
    P.updateCharacterAnimations = function (dt) {
        if (_prevUpdateAnim) _prevUpdateAnim.call(this, dt);
        const applySkillMotion = (ent) => {
            if (!ent || !ent.group || !ent.skillMotionV25 || ent.skillMotionV25.timer <= 0) return;
            ent.skillMotionV25.timer = Math.max(0, ent.skillMotionV25.timer - dt);
            const p = 1 - (ent.skillMotionV25.timer / ent.skillMotionV25.maxTimer);
            const st = ent.skillMotionV25.style;
            const baseRotY = ent.rotY || 0;
            const dirX = Math.sin(baseRotY);
            const dirZ = Math.cos(baseRotY);
            const baseSc = ent._baseScale || ent.group.scale.x || 1;
            let ox = 0, oy = 0, oz = 0, rx = 0, ry = baseRotY, rz = 0, sm = 1.0;

            if (st === 'spin_slash') {
                const lunge = Math.sin(p * Math.PI);
                ox = dirX * lunge * 1.15;
                oz = dirZ * lunge * 1.15;
                oy = lunge * 0.35;
                ry += p * Math.PI * 2;
                rz = Math.sin(p * Math.PI) * 0.32;
            } else if (st === 'meteor_jump') {
                oy = Math.sin(p * Math.PI) * 2.35;
                rx = (p < 0.5 ? -0.45 : 0.65) * Math.sin(p * Math.PI);
            } else if (st === 'nova_charge') {
                oy = Math.sin(p * Math.PI) * 1.45;
                sm = 1.0 + Math.sin(p * Math.PI) * 0.35;
                ry += p * Math.PI * 4;
            } else if (st === 'beam_brace') {
                const recoil = Math.sin(p * Math.PI);
                ox = -dirX * recoil * 0.85;
                oz = -dirZ * recoil * 0.85;
                rx = -recoil * 0.35;
            } else if (st === 'sky_summon') {
                oy = Math.sin(p * Math.PI) * 1.1;
                rx = -Math.sin(p * Math.PI) * 0.42;
                rz = Math.sin(p * Math.PI * 4) * 0.14;
            } else if (st === 'thunder_drop') {
                oy = (p < 0.4 ? (p / 0.4) * 2.1 : (1 - (p - 0.4) / 0.6) * 2.1);
                rx = p >= 0.4 ? 0.55 : -0.3;
            } else if (st === 'tornado_spin') {
                oy = Math.sin(p * Math.PI) * 1.3;
                ry += p * Math.PI * 6;
                rz = 0.38;
            } else if (st === 'abyss_float') {
                oy = 0.55 + Math.sin(p * Math.PI) * 0.65;
                rx = -0.48 * Math.sin(p * Math.PI);
                rz = Math.cos(p * Math.PI * 3) * 0.22;
            } else if (st === 'holy_prayer') {
                oy = Math.sin(p * Math.PI) * 0.85;
                rz = Math.sin(p * Math.PI * 2) * 0.25;
                sm = 1.0 + Math.sin(p * Math.PI) * 0.14;
            } else if (st === 'table_uppercut') {
                oy = Math.sin(p * Math.PI) * 0.95;
                rx = -Math.sin(p * Math.PI) * 0.62;
                rz = Math.sin(p * Math.PI * 12) * 0.25;
                sm = 1.0 + Math.sin(p * Math.PI) * 0.28;
            }

            if (ent.skillMotionV25.timer > 0) {
                ent.group.position.set(ent.pos.x + ox, oy, ent.pos.z + oz);
                ent.group.rotation.set(rx, ry, rz);
                ent.group.scale.setScalar(baseSc * sm);
                ent._poseDirty = true;
            } else {
                ent.group.position.set(ent.pos.x, 0, ent.pos.z);
                ent.group.rotation.set(0, baseRotY, 0);
                ent.group.scale.setScalar(baseSc);
                ent._poseDirty = false;
            }
        };
        applySkillMotion(this.player);
        if (this.remotePlayers) {
            this.remotePlayers.forEach(rp => applySkillMotion(rp));
        }
        this.updateV21SkillEffects(dt);
    };

    // 7. スキルLvに応じた実ダメージ倍率の反映
    if (P.useSkillSlot) {
        const _prevUseSkill = P.useSkillSlot;
        P.useSkillSlot = function (slotIdx) {
            const meta = this.resolveSkillMeta ? this.resolveSkillMeta(slotIdx) : null;
            const lv = meta ? meta.skillLv : 1;
            const curCd = (this.player?.skillCds?.[slotIdx] ?? this.skillCds?.[slotIdx] ?? 0);
            _prevUseSkill.call(this, slotIdx);

            if (curCd <= 0.05 && lv >= 2 && this.player && this.player.pos && Array.isArray(this.monsters)) {
                const st = this.getPlayerStats ? this.getPlayerStats() : { atk: 50 };
                const mult = this.calcSkillPowerMultiplierV26(lv);
                const bonusDmg = Math.max(15, Math.floor((st.atk || 50) * (mult - 1) * 0.65));
                const range = lv >= 100 ? 10.5 : (lv >= 50 ? 8.5 : 6.8);
                const px = this.player.pos.x;
                const pz = this.player.pos.z;

                this.monsters.forEach(m => {
                    if (!m || m.dead || !m.pos) return;
                    const dist = Math.hypot(m.pos.x - px, m.pos.z - pz);
                    if (dist <= range) {
                        if (typeof this.damageMonster === 'function') {
                            this.damageMonster(m, bonusDmg, lv >= 50);
                        } else if (typeof m.hp === 'number') {
                            m.hp = Math.max(0, m.hp - bonusDmg);
                            if (this.spawnFloatingText) {
                                const tag = lv >= 100 ? `👑奥義 +${bonusDmg}` : `⚡Lv.${lv} +${bonusDmg}`;
                                this.spawnFloatingText(m.pos, tag, lv >= 100 ? '#fde047' : '#38bdf8');
                            }
                        }
                    }
                });
            }
        };
    }

    // 8. スキルメニューに現在のLv・威力倍率・進化段階を明示表示
    const _prevRenderModal = P.renderModalContent;
    P.renderModalContent = function () {
        if (_prevRenderModal) _prevRenderModal.call(this);
        const body = document.getElementById('modal-body');
        if (!body) return;
        if (/skill/i.test(String(this.activeTab || ''))) {
            body.insertAdjacentHTML('afterbegin', `
                <div class="card-box" style="margin-bottom:8px;border-color:#fde047;background:rgba(30,27,75,0.88);">
                    <div style="font-size:11px;font-weight:900;color:#fde047;margin-bottom:3px;">
                        ⚡ スキル個別進化＆威力スケーリングシステム
                    </div>
                    <div style="font-size:10px;color:#e2e8f0;line-height:1.45;">
                        ・<b>Lv上昇で威力＆演出が段階進化</b>（Lv.10【真】x3.25倍 → Lv.50【極】x13.25倍 → Lv.100【👑奥義】x25.75倍）<br>
                        ・<b>全11系統＋技ごとの固有バリエーション</b>：火球→隕石、竜巻増殖、天使翼展開など技別に見た目と動きが変化！
                    </div>
                </div>
            `);
        }
    };

    // 9. 既存プレイヤーの顔ズレ再整列
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

// === GAME7_V26_OK ===
