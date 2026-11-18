'use strict';

const SECRET_DEBUG_CODE = 'debug777';

// 剣・武器名を魔道士用の「杖」名称へ変換する辞書
function convertWeaponNameToStaff(rawName) {
    if (!rawName) return '魔導の杖';
    let s = String(rawName);
    if (/杖|ロッド|スタッフ|ステッキ|ワンド|staff|rod|wand/i.test(s)) return s;
    const map = [
        [/木の剣|ひのきのぼう|初期の剣|木刀/g, '見習いの木の杖'],
        [/銅の剣|ブロンズソード/g, '青銅の魔導杖'],
        [/鉄の剣|アイアンソード/g, '白鉄の魔法杖'],
        [/鋼の剣|スチールソード/g, '精霊の銀魔杖'],
        [/ミスリルソード|ミスリルの剣/g, 'ミスリルアークロッド'],
        [/オリハルコンソード|オリハルコンの剣/g, 'オリハルコン星屑杖'],
        [/ドラゴンソード|竜の剣|竜殺しの剣/g, '竜王の紅蓮魔導杖'],
        [/聖剣|エクスカリバー|神剣|創世剣/g, '創世神聖スタッフ'],
        [/大剣|グレートソード|クレイモア/g, '賢者の大魔導杖'],
        [/短剣|ダガー|ナイフ/g, 'フェアリーワンド'],
        [/剣|刀|ソード|ブレード|アックス|斧|槍|ランス|スピア/g, '魔導杖'],
        [/Sword|Blade|Axe|Spear|Lance/gi, 'Staff']
    ];
    for (const [re, rep] of map) {
        if (re.test(s)) {
            s = s.replace(re, rep);
            return s;
        }
    }
    return s + '（魔導杖）';
}

if (typeof KaomojiMMORPG !== 'undefined') {
    const P = KaomojiMMORPG.prototype;

    // 1. 現在の職業が「魔道士系」かどうかを判定
    P.isMageEvolution = function (evoIdOverride = null) {
        const d = this.saveData || {};
        const evoId = String(evoIdOverride || d.evolutionId || '');
        let evoName = '';
        if (typeof EVOLUTIONS !== 'undefined' && EVOLUTIONS && EVOLUTIONS[evoId]) {
            evoName = String(EVOLUTIONS[evoId].name || EVOLUTIONS[evoId].title || '');
        }
        const combined = `${evoId} ${evoName}`.toLowerCase();
        return /mage|wizard|sorcerer|witch|sage|warlock|archmage|spell|magic|魔道|魔導|魔法|賢者|術師|メイジ|ウィザード/.test(combined);
    };

    // 2. 魔道士進化時の「杖（スタッフ）」3Dモデル（武器ID・強化値に応じた5段階の見た目差分！）
    P.buildMageStaff3D = function (weaponId = 'wpn_wood', enhance = 0) {
        const grp = new THREE.Group();
        grp.name = 'mage_staff_weapon';

        const wStr = String(weaponId || '').toLowerCase();
        const enh = Number(enhance) || 0;
        let tier = 1;
        if (/god|genesis|creator|omega|legend|divine|神|創世|伝説/.test(wStr) || enh >= 15) tier = 5;
        else if (/dragon|hell|abyss|demon|star|竜|魔|星|覇/.test(wStr) || enh >= 10) tier = 4;
        else if (/mythril|mithril|gold|holy|crystal|ミスリル|金|聖|晶/.test(wStr) || enh >= 6) tier = 3;
        else if (/iron|steel|silver|copper|鉄|鋼|銀|銅/.test(wStr) || enh >= 3) tier = 2;

        const configs = {
            1: { shaftCol: 0x78350f, headCol: 0x92400e, orbCol: 0x38bdf8, ringCol: null, len: 1.55, orbR: 0.14 },
            2: { shaftCol: 0x94a3b8, headCol: 0xe2e8f0, orbCol: 0x34d399, ringCol: 0x6ee7b7, len: 1.70, orbR: 0.17 },
            3: { shaftCol: 0xfbbf24, headCol: 0xfef08a, orbCol: 0x60a5fa, ringCol: 0x38bdf8, len: 1.85, orbR: 0.20 },
            4: { shaftCol: 0x31102f, headCol: 0xf43f5e, orbCol: 0xf97316, ringCol: 0xfde047, len: 2.00, orbR: 0.23 },
            5: { shaftCol: 0xfef08a, headCol: 0xf59e0b, orbCol: 0xf472b6, ringCol: 0x38bdf8, len: 2.18, orbR: 0.26 }
        };
        const cfg = configs[tier];

        // 杖の柄（シャフト）
        const shaft = new THREE.Mesh(
            new THREE.CylinderGeometry(0.045, 0.055, cfg.len, 10),
            new THREE.MeshLambertMaterial({ color: cfg.shaftCol })
        );
        shaft.position.y = cfg.len * 0.42;
        grp.add(shaft);

        // 先端の台座・装飾ヘッド（ティアごとに形が変わる！）
        const topY = cfg.len * 0.88;
        if (tier === 1) {
            const forkL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.22, 0.05), new THREE.MeshLambertMaterial({ color: cfg.headCol }));
            forkL.position.set(-0.08, topY, 0); forkL.rotation.z = 0.4;
            const forkR = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.22, 0.05), new THREE.MeshLambertMaterial({ color: cfg.headCol }));
            forkR.position.set(0.08, topY, 0); forkR.rotation.z = -0.4;
            grp.add(forkL, forkR);
        } else if (tier === 2) {
            const crescent = new THREE.Mesh(
                new THREE.TorusGeometry(0.22, 0.04, 8, 18, Math.PI * 1.3),
                new THREE.MeshBasicMaterial({ color: cfg.headCol })
            );
            crescent.position.y = topY + 0.08;
            crescent.rotation.z = -Math.PI * 0.15;
            grp.add(crescent);
        } else if (tier >= 3) {
            // 天使の翼・竜翼ガード装飾
            [-1, 1].forEach(side => {
                const wing = new THREE.Mesh(
                    new THREE.ConeGeometry(0.11 + tier * 0.02, 0.42 + tier * 0.06, 5),
                    new THREE.MeshBasicMaterial({ color: cfg.headCol })
                );
                wing.position.set(side * (0.22 + tier * 0.03), topY + 0.08, 0);
                wing.rotation.z = -side * 1.05;
                grp.add(wing);
            });
        }

        // 先端の魔力オーブ（コアクリスタル）
        const orbGeo = tier >= 3 ? new THREE.OctahedronGeometry(cfg.orbR, 0) : new THREE.SphereGeometry(cfg.orbR, 12, 12);
        const orb = new THREE.Mesh(orbGeo, new THREE.MeshBasicMaterial({ color: cfg.orbCol }));
        orb.position.y = topY + 0.16;
        grp.add(orb);

        // Tier 2以上はオーブ周囲に魔法リング、Tier 5は二重衛星オーブ付き！
        if (cfg.ringCol) {
            const halo = new THREE.Mesh(
                new THREE.TorusGeometry(cfg.orbR * 1.65, 0.028, 8, 22),
                new THREE.MeshBasicMaterial({ color: cfg.ringCol })
            );
            halo.position.y = topY + 0.16;
            halo.rotation.x = Math.PI * 0.32;
            grp.add(halo);
        }
        if (tier >= 5) {
            [-1, 1].forEach(s => {
                const sat = new THREE.Mesh(new THREE.OctahedronGeometry(0.08, 0), new THREE.MeshBasicMaterial({ color: 0xfde047 }));
                sat.position.set(s * 0.36, topY + 0.16, 0);
                grp.add(sat);
            });
        }

        // 構え角度（少し前に傾けて杖らしく持つ）
        grp.rotation.x = 0.35;
        return grp;
    };

    // アバター生成時に魔道士なら武器を「杖」へ自動差し替え
    if (P.buildAvatarGroup) {
        const _prevBuildAvatarV22 = P.buildAvatarGroup;
        P.buildAvatarGroup = function (opts) {
            const res = _prevBuildAvatarV22.call(this, opts);
            if (res && res.group && typeof THREE !== 'undefined') {
                const evoId = opts?.evolutionId || this.saveData?.evolutionId || '';
                if (this.isMageEvolution(evoId)) {
                    // 既存の剣メッシュを削除
                    const toRemove = [];
                    res.group.traverse(c => {
                        if (c !== res.group && (c === res.weaponMesh || /wpn|weapon|sword/i.test(c.name || '') || c.position.x > 0.52)) {
                            toRemove.push(c);
                        }
                    });
                    toRemove.forEach(c => c.parent?.remove(c));

                    const staff = this.buildMageStaff3D(opts?.weaponId || 'wpn_wood', opts?.weaponEnhance || 0);
                    staff.position.set(0.66, 0.45, 0.22);
                    res.group.add(staff);
                    res.weaponMesh = staff;
                }
            }
            return res;
        };
    }

    // 3. 魔道士進化時の「通常攻撃で魔法が出る」3D魔法弾エフェクト
    P.spawnMageBasicMagicShot = function (entity) {
        if (!this.useWebGL || !this.scene || !entity?.pos || typeof THREE === 'undefined') return;
        if (!this._v22MagicShots) this._v22MagicShots = [];

        const rotY = entity.rotY || 0;
        const dirX = Math.sin(rotY);
        const dirZ = Math.cos(rotY);
        const startX = entity.pos.x + dirX * 1.1;
        const startZ = entity.pos.z + dirZ * 1.1;

        const grp = new THREE.Group();
        const core = new THREE.Mesh(
            new THREE.SphereGeometry(0.28, 14, 14),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        const auraMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.72 });
        const aura = new THREE.Mesh(new THREE.OctahedronGeometry(0.46, 0), auraMat);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xf472b6, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.055, 8, 22), ringMat);
        grp.add(core, aura, ring);

        grp.position.set(startX, 1.25, startZ);
        grp.rotation.y = rotY;
        this.scene.add(grp);

        this._v22MagicShots.push({
            grp, aura, ring, auraMat, ringMat,
            vx: dirX * 19.5,
            vz: dirZ * 19.5,
            life: 0.48,
            maxLife: 0.48
        });
    };

    P.updateMageBasicMagicShots = function (dt) {
        if (!this._v22MagicShots || !this._v22MagicShots.length) return;
        this._v22MagicShots = this._v22MagicShots.filter(s => {
            s.life -= dt;
            if (s.life <= 0) {
                // 着弾時に小さな魔法スパークリングを発生
                if (this.scene && this._slashEffects) {
                    const hitMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.95 });
                    const hitRing = new THREE.Mesh(new THREE.RingGeometry(0.25, 0.95, 20), hitMat);
                    hitRing.rotation.x = -Math.PI / 2;
                    hitRing.position.set(s.grp.position.x, 0.25, s.grp.position.z);
                    this.scene.add(hitRing);
                    this._slashEffects.push({ kind: 'shockwave', mesh: hitRing, mat: hitMat, life: 0.28, maxLife: 0.28 });
                }
                if (this.scene) this.scene.remove(s.grp);
                s.grp.traverse?.(o => { o.geometry?.dispose?.(); o.material?.dispose?.(); });
                return false;
            }
            s.grp.position.x += s.vx * dt;
            s.grp.position.z += s.vz * dt;
            s.aura.rotation.y += dt * 10;
            s.aura.rotation.x += dt * 8;
            s.ring.rotation.z += dt * 12;
            const fade = s.life < 0.14 ? (s.life / 0.14) : 1.0;
            s.auraMat.opacity = 0.72 * fade;
            s.ringMat.opacity = 0.9 * fade;
            return true;
        });
    };

    // 通常攻撃のビジュアル差し替え（魔道士なら斬撃ではなく魔法弾を発射！）
    const _prevTriggerV22 = P.triggerAttackVisual;
    P.triggerAttackVisual = function (entity, isSkill = false, skillInfo = null) {
        const isMage = (entity === this.player)
            ? this.isMageEvolution()
            : Boolean(skillInfo?.isMage || (entity?.evolutionId && this.isMageEvolution(entity.evolutionId)));

        if (!isSkill && isMage) {
            if (entity) {
                entity.attackAnimTimer = 0.34;
                entity.attackIsSkill = false;
            }
            this.spawnMageBasicMagicShot(entity);
            return;
        }
        if (_prevTriggerV22) {
            _prevTriggerV22.call(this, entity, isSkill, skillInfo);
        }
    };

    // 4. 敵モンスターの状態異常（炎上・凍結・毒・麻痺）3Dエフェクト常時更新
    P.detectMonsterStatus = function (m) {
        if (!m) return null;
        if (m._visualStatus && m._visualStatus.timer > 0) return m._visualStatus.type;

        const stRaw = JSON.stringify({
            status: m.status, statuses: m.statuses, debuffs: m.debuffs,
            effects: m.effects, burn: m.burn, burnTimer: m.burnTimer,
            freeze: m.freeze, freezeTimer: m.freezeTimer,
            poison: m.poison, poisonTimer: m.poisonTimer,
            stun: m.stun, paralyze: m.paralyze
        }).toLowerCase();

        if ((Number(m.burn) > 0 || Number(m.burnTimer) > 0 || m.isBurning || /burn|ignite|fire|flame|炎上|火傷|燃焼/.test(stRaw))) return 'burn';
        if ((Number(m.freeze) > 0 || Number(m.freezeTimer) > 0 || m.isFrozen || /freeze|frozen|ice|chill|凍結|氷結/.test(stRaw))) return 'freeze';
        if ((Number(m.poison) > 0 || Number(m.poisonTimer) > 0 || m.isPoisoned || /poison|venom|toxic|毒/.test(stRaw))) return 'poison';
        if ((Number(m.stun) > 0 || Number(m.paralyze) > 0 || m.isStunned || /stun|paraly|shock|麻痺|感電|気絶/.test(stRaw))) return 'shock';
        return null;
    };

    P.updateMonsterStatusVisuals = function (dt) {
        if (!this.useWebGL || !Array.isArray(this.monsters) || typeof THREE === 'undefined') return;
        const now = performance.now() * 0.001;

        this.monsters.forEach((m, idx) => {
            if (!m) return;
            if (m._visualStatus && m._visualStatus.timer > 0) {
                m._visualStatus.timer = Math.max(0, m._visualStatus.timer - dt);
            }
            const grp = m.group || m.mesh;
            if (!grp) return;

            const stType = m.dead ? null : this.detectMonsterStatus(m);
            const curHolder = grp.getObjectByName?.('status_fx_3d');

            if (!stType) {
                if (curHolder) {
                    grp.remove(curHolder);
                    curHolder.traverse?.(o => { o.geometry?.dispose?.(); o.material?.dispose?.(); });
                }
                grp.userData._curStatusType = null;
                return;
            }

            // 状態異常の種類が変わったら3Dエフェクトを再構築
            if (grp.userData._curStatusType !== stType || !curHolder) {
                if (curHolder) grp.remove(curHolder);
                grp.userData._curStatusType = stType;

                const sc = Number(m.scale) || 1.0;
                const fxGrp = new THREE.Group();
                fxGrp.name = 'status_fx_3d';
                fxGrp.userData.items = [];

                if (stType === 'burn') {
                    // 足元の灼熱炎リング＋立ち上る8本の炎パーティクル
                    const baseRing = new THREE.Mesh(
                        new THREE.RingGeometry(0.65 * sc, 1.25 * sc, 24),
                        new THREE.MeshBasicMaterial({ color: 0xf97316, side: THREE.DoubleSide, transparent: true, opacity: 0.88 })
                    );
                    baseRing.rotation.x = -Math.PI / 2;
                    baseRing.position.y = 0.09;
                    fxGrp.add(baseRing);

                    const flameCols = [0xef4444, 0xf97316, 0xfacc15];
                    for (let i = 0; i < 8; i++) {
                        const ang = (i / 8) * Math.PI * 2;
                        const fMesh = new THREE.Mesh(
                            new THREE.ConeGeometry(0.22 * sc, 0.75 * sc, 6),
                            new THREE.MeshBasicMaterial({ color: flameCols[i % flameCols.length], transparent: true, opacity: 0.92 })
                        );
                        fMesh.position.set(Math.cos(ang) * 0.68 * sc, 0.5 * sc, Math.sin(ang) * 0.68 * sc);
                        fxGrp.add(fMesh);
                        fxGrp.userData.items.push({ mesh: fMesh, ang, dist: 0.68 * sc, phase: i * 0.8, sc });
                    }
                } else if (stType === 'freeze') {
                    // 氷結クリスタルブロック
                    const iceBox = new THREE.Mesh(
                        new THREE.BoxGeometry(1.45 * sc, 1.85 * sc, 1.45 * sc),
                        new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.45 })
                    );
                    iceBox.position.y = 0.95 * sc;
                    const iceWire = new THREE.Mesh(
                        new THREE.BoxGeometry(1.48 * sc, 1.88 * sc, 1.48 * sc),
                        new THREE.MeshBasicMaterial({ color: 0xe0f2fe, wireframe: true })
                    );
                    iceWire.position.y = 0.95 * sc;
                    fxGrp.add(iceBox, iceWire);
                } else if (stType === 'poison') {
                    // 紫の毒沼リング＋上昇する毒の泡
                    const pRing = new THREE.Mesh(
                        new THREE.RingGeometry(0.6 * sc, 1.2 * sc, 24),
                        new THREE.MeshBasicMaterial({ color: 0xa855f7, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
                    );
                    pRing.rotation.x = -Math.PI / 2;
                    pRing.position.y = 0.09;
                    fxGrp.add(pRing);
                    for (let i = 0; i < 6; i++) {
                        const ang = (i / 6) * Math.PI * 2;
                        const bub = new THREE.Mesh(
                            new THREE.SphereGeometry(0.18 * sc, 8, 8),
                            new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0xc084fc : 0x4ade80, transparent: true, opacity: 0.88 })
                        );
                        fxGrp.add(bub);
                        fxGrp.userData.items.push({ mesh: bub, ang, dist: 0.62 * sc, phase: i * 1.1, sc });
                    }
                } else if (stType === 'shock') {
                    // バチバチ飛び交う黄色い稲妻スパーク
                    for (let i = 0; i < 6; i++) {
                        const ang = (i / 6) * Math.PI * 2;
                        const bolt = new THREE.Mesh(
                            new THREE.OctahedronGeometry(0.24 * sc, 0),
                            new THREE.MeshBasicMaterial({ color: 0xfef08a })
                        );
                        fxGrp.add(bolt);
                        fxGrp.userData.items.push({ mesh: bolt, ang, dist: 0.78 * sc, phase: i * 1.3, sc });
                    }
                }
                grp.add(fxGrp);
            }

            // 毎フレームのアニメーション更新
            const holder = grp.getObjectByName?.('status_fx_3d');
            if (holder && holder.userData.items) {
                holder.userData.items.forEach(it => {
                    if (stType === 'burn' || stType === 'poison') {
                        const cycle = (now * 1.8 + it.phase) % 1;
                        it.ang += dt * 2.2;
                        it.mesh.position.x = Math.cos(it.ang) * it.dist;
                        it.mesh.position.z = Math.sin(it.ang) * it.dist;
                        it.mesh.position.y = (0.3 + cycle * 1.55) * it.sc;
                        it.mesh.scale.setScalar(Math.max(0.2, 1.15 - cycle * 0.85));
                    } else if (stType === 'shock') {
                        it.ang += dt * 9.0;
                        it.mesh.position.x = Math.cos(it.ang) * it.dist;
                        it.mesh.position.z = Math.sin(it.ang) * it.dist;
                        it.mesh.position.y = (0.9 + Math.sin(now * 25 + it.phase) * 0.45) * it.sc;
                        it.mesh.rotation.y += dt * 15;
                    }
                });
            }
        });
    };
}
// ▲▲▲ ここまで【1/3】 ▲▲▲
// ▼▼▼ ここから【2/3】 ▼▼▼
if (typeof KaomojiMMORPG !== 'undefined') {
    const P = KaomojiMMORPG.prototype;

    // 5. 消費MPを元の5倍 ＋ スキルLvが1上がるごとに+10ずつ増加
    P.calcScaledSkillMp = function (baseMp, lv = 1) {
        const b = Math.max(1, Number(baseMp) || 5);
        const level = Math.max(1, Number(lv) || 1);
        return (b * 5) + ((level - 1) * 10);
    };

    P.syncSkillMpCostsV22 = function () {
        if (typeof SKILLS === 'undefined' || !SKILLS) return;
        const d = this.saveData || {};
        const list = Array.isArray(SKILLS) ? SKILLS : Object.values(SKILLS);

        list.forEach((sk, idx) => {
            if (!sk || typeof sk !== 'object') return;
            const mpKeys = ['mpCost', 'mp', 'cost', 'manaCost', 'consumeMp'].filter(k => typeof sk[k] === 'number');
            if (!mpKeys.length) return;

            if (sk._baseMpV22 === undefined) {
                sk._baseMpV22 = Math.max(1, Number(sk[mpKeys[0]]) || 5);
            }
            const sId = String(sk.id || sk.skillId || `slot_${idx}`);
            const lv = Math.max(1, Number(d.skillLevels?.[sId] ?? d.skillLvs?.[sId] ?? sk.lv ?? sk.level ?? 1) || 1);
            const scaledMp = this.calcScaledSkillMp(sk._baseMpV22, lv);

            mpKeys.forEach(k => {
                sk[k] = scaledMp;
            });
        });
    };

    // 6. 鍛冶・装備データの武器名を魔道士進化時のみ「杖」へ自動同期
    P.syncMageWeaponNamesV22 = function () {
        const isMage = this.isMageEvolution();
        if (typeof WEAPONS !== 'undefined' && WEAPONS) {
            const wList = Array.isArray(WEAPONS) ? WEAPONS : Object.values(WEAPONS);
            wList.forEach(w => {
                if (!w || typeof w !== 'object') return;
                if (!w._origNameV22 && w.name) w._origNameV22 = String(w.name);
                if (!w._origDescV22 && w.desc) w._origDescV22 = String(w.desc);

                if (w._origNameV22) {
                    w.name = isMage ? convertWeaponNameToStaff(w._origNameV22) : w._origNameV22;
                }
                if (w._origDescV22) {
                    w.desc = isMage
                        ? w._origDescV22.replace(/剣|刀|ソード|ブレード/g, '魔導杖')
                        : w._origDescV22;
                }
            });
        }
    };

    // スキル使用時：MP消費反映 ＋ 攻撃ヒット範囲の敵へ状態異常エフェクト（炎上・凍結・麻痺・毒）連動
    if (P.useSkillSlot) {
        const _prevUseSkillV22 = P.useSkillSlot;
        P.useSkillSlot = function (slotIdx) {
            this.syncSkillMpCostsV22();
            const meta = this.resolveSkillMeta ? this.resolveSkillMeta(slotIdx) : null;
            const curCd = (this.player?.skillCds?.[slotIdx] ?? this.skillCds?.[slotIdx] ?? 0);

            _prevUseSkillV22.call(this, slotIdx);

            // スキルが実際に発動した場合、属性に応じた状態異常ビジュアルを近くの敵へ付与
            if (curCd <= 0.05 && meta && this.player?.pos && Array.isArray(this.monsters)) {
                let stType = null;
                if (meta.skillCategory === 'fire' || meta.skillCategory === 'bigbang') stType = 'burn';
                else if (meta.skillCategory === 'nova_ice') stType = 'freeze';
                else if (meta.skillCategory === 'thunder') stType = 'shock';
                else if (meta.skillCategory === 'void') stType = 'poison';

                if (stType) {
                    const px = this.player.pos.x;
                    const pz = this.player.pos.z;
                    const range = meta.skillLv >= 50 ? 11.5 : 8.5;
                    this.monsters.forEach(m => {
                        if (!m || m.dead || !m.pos) return;
                        if (Math.hypot(m.pos.x - px, m.pos.z - pz) <= range) {
                            m._visualStatus = { type: stType, timer: 5.5 };
                            if (stType === 'burn') m.burnTimer = Math.max(m.burnTimer || 0, 5.5);
                            if (stType === 'freeze') m.freezeTimer = Math.max(m.freezeTimer || 0, 4.5);
                            if (stType === 'poison') m.poisonTimer = Math.max(m.poisonTimer || 0, 6.0);
                            if (stType === 'shock') m.stun = Math.max(m.stun || 0, 3.5);
                        }
                    });
                }
            }
        };
    }

    // 鍛冶・装備・進化モーダル表示時に武器名を杖へ書き換え＆進化直後に3D武器（杖）を即更新
    if (P.renderModalContent) {
        const _prevRenderModalV22 = P.renderModalContent;
        P.renderModalContent = function () {
            this.syncSkillMpCostsV22();
            this.syncMageWeaponNamesV22();
            _prevRenderModalV22.call(this);

            const body = document.getElementById('modal-body');
            if (!body) return;

            // 鍛冶・装備タブが開かれている場合、魔道士ならDOM内の武器名も「杖」表記へ変換
            if (this.isMageEvolution() && /smith|forge|craft|equip|weapon|gear|item|鍛冶|装備|武器/i.test(String(this.activeTab || ''))) {
                const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, null);
                let node;
                while ((node = walker.nextNode())) {
                    if (node.nodeValue && /剣|刀|ソード|ブレード/.test(node.nodeValue)) {
                        node.nodeValue = convertWeaponNameToStaff(node.nodeValue);
                    }
                }
            }

            // 進化ボタン押下直後にアバター（手持ちの杖）を即座に再構築
            if (/evo|class|job|進化|転職/i.test(String(this.activeTab || ''))) {
                body.querySelectorAll('button').forEach(btn => {
                    if (btn.dataset.v22EvoHook) return;
                    btn.dataset.v22EvoHook = '1';
                    btn.addEventListener('click', () => {
                        setTimeout(() => {
                            this.syncMageWeaponNamesV22();
                            this.buildPlayerEntity?.();
                            this.syncFirebaseNow?.(false);
                        }, 80);
                    });
                });
            }
        };
    }

    // 毎フレーム更新へ魔法弾＆状態異常3Dエフェクトを組み込み
    const _prevUpdateAnimV22 = P.updateCharacterAnimations;
    P.updateCharacterAnimations = function (dt) {
        if (_prevUpdateAnimV22) _prevUpdateAnimV22.call(this, dt);
        this.updateMageBasicMagicShots(dt);
        this.updateMonsterStatusVisuals(dt);
    };

    // オンライン同期パケットに「魔道士かどうか」を含めて味方の通常攻撃魔法弾も同期
    if (P.broadcastFirebaseEvent) {
        const _prevBroadcastV22 = P.broadcastFirebaseEvent;
        P.broadcastFirebaseEvent = function (type, payload) {
            if (type === 'attack' && payload && typeof payload === 'object') {
                payload.isMage = this.isMageEvolution();
            }
            _prevBroadcastV22.call(this, type, payload);
        };
    }
}
// ▲▲▲ ここまで【2/3】 ▲▲▲
// ▼▼▼ ここから【3/3】 ▼▼▼
if (typeof KaomojiMMORPG !== 'undefined') {
    const P = KaomojiMMORPG.prototype;

    // 7. 隠しデバッグモード（暗号: debug777）
    P.setAllSkillsLevelDebug = function (targetLv) {
        const d = this.saveData || {};
        if (!d.skillLevels) d.skillLevels = {};
        if (!d.skillLvs) d.skillLvs = {};

        const lv = Math.max(1, Number(targetLv) || 1);
        if (typeof SKILLS !== 'undefined' && SKILLS) {
            const list = Array.isArray(SKILLS) ? SKILLS : Object.values(SKILLS);
            list.forEach((sk, idx) => {
                if (!sk || typeof sk !== 'object') return;
                const sId = String(sk.id || sk.skillId || `slot_${idx}`);
                d.skillLevels[sId] = lv;
                d.skillLvs[sId] = lv;
                if ('lv' in sk) sk.lv = lv;
                if ('level' in sk) sk.level = lv;
            });
        }
        // スロットID直接指定形式にも対応
        for (let i = 0; i < 12; i++) {
            d.skillLevels[`slot_${i}`] = lv;
            d.skillLvs[`slot_${i}`] = lv;
        }

        this.syncSkillDescriptionsAndEffects?.();
        this.syncSkillMpCostsV22?.();
        this.saveGame?.(false);
        this.refreshAllHUD?.();
        this.showAlertBanner?.(`🛠️ [DEBUG] 全スキルを Lv.${lv} に設定しました！`, 2000);
    };

    P.forceEvolveToMageDebug = function () {
        const d = this.saveData || {};
        let mageId = 'mage';
        if (typeof EVOLUTIONS !== 'undefined' && EVOLUTIONS) {
            const entries = Array.isArray(EVOLUTIONS)
                ? EVOLUTIONS.map((v, i) => [v?.id || String(i), v])
                : Object.entries(EVOLUTIONS);
            const found = entries.find(([k, v]) => {
                const str = `${k} ${v?.id || ''} ${v?.name || ''} ${v?.title || ''}`.toLowerCase();
                return /mage|wizard|sorcerer|witch|sage|魔道|魔導|魔法|賢者/.test(str);
            });
            if (found) mageId = found[0];
        }
        d.evolutionId = mageId;
        this.syncMageWeaponNamesV22?.();
        this.buildPlayerEntity?.();
        this.saveGame?.(false);
        this.refreshAllHUD?.();
        this.syncFirebaseNow?.(false);
        this.showAlertBanner?.('🧙‍♂️ [DEBUG] 魔道士へ進化！武器が「杖」になり通常攻撃が魔法になりました！', 2400);
    };

    P.applyDebugStatusToMonsters = function (stType) {
        if (!Array.isArray(this.monsters)) return;
        let count = 0;
        this.monsters.forEach(m => {
            if (!m || m.dead) return;
            m._visualStatus = { type: stType, timer: 8.0 };
            if (stType === 'burn') m.burnTimer = 8.0;
            if (stType === 'freeze') m.freezeTimer = 8.0;
            if (stType === 'poison') m.poisonTimer = 8.0;
            if (stType === 'shock') m.stun = 8.0;
            count++;
        });
        const labelMap = { burn: '🔥炎上', freeze: '❄️凍結', poison: '☠️毒', shock: '⚡麻痺' };
        this.showAlertBanner?.(`🛠️ [DEBUG] 周囲の敵 ${count}体 を「${labelMap[stType] || stType}」状態にしました！`, 1800);
    };

    P.openSecretDebugModal = function () {
        let modal = document.getElementById('kmj-secret-debug-modal');
        if (modal) modal.remove();

        modal = document.createElement('div');
        modal.id = 'kmj-secret-debug-modal';
        modal.style.cssText = 'position:fixed;inset:0;z-index:99;background:rgba(2,6,23,0.88);display:flex;align-items:center;justify-content:center;padding:16px;';
        modal.innerHTML = `
            <div style="width:min(400px,94vw);background:#0f172a;border:2px solid #f43f5e;border-radius:14px;padding:14px;box-shadow:0 0 32px rgba(244,63,94,0.55);color:#fff;max-height:88vh;overflow-y:auto;">
                <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #334155;padding-bottom:8px;margin-bottom:10px;">
                    <span style="font-size:14px;font-weight:900;color:#fda4af;">🛠️ SECRET DEBUG CONSOLE</span>
                    <button type="button" id="btn-close-secret-debug" style="background:#334155;border:none;color:#fff;border-radius:6px;padding:4px 10px;font-weight:900;cursor:pointer;">✕ 閉じる</button>
                </div>

                <div style="font-size:11px;font-weight:900;color:#fde047;margin-bottom:5px;">⚡ スキルLv一括変更（進化＆新奥義テスト）</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px;">
                    <button type="button" id="dbg-sk-10" class="btn-ui btn-sky" style="font-size:11px;padding:7px;">✨ 全スキル Lv.10【真】</button>
                    <button type="button" id="dbg-sk-50" class="btn-ui btn-amber" style="font-size:11px;padding:7px;">🔥 全スキル Lv.50【極】</button>
                    <button type="button" id="dbg-sk-100" class="btn-ui btn-emerald" style="font-size:11px;padding:7px;grid-column:span 2;border:1px solid #fde047;">👑 全スキル Lv.100【覚醒奥義解放】</button>
                    <button type="button" id="dbg-sk-1" class="btn-ui" style="font-size:10px;padding:5px;grid-column:span 2;background:#1e293b;">↺ 全スキル Lv.1 にリセット</button>
                </div>

                <div style="font-size:11px;font-weight:900;color:#7dd3fc;margin-bottom:5px;">🧙‍♂️ 職業・杖・ステータス操作</div>
                <div style="display:grid;grid-template-columns:1fr;gap:6px;margin-bottom:10px;">
                    <button type="button" id="dbg-evo-mage" class="btn-ui btn-sky" style="font-size:11px;padding:7px;">🪄 魔道士へ即進化（杖装備＆魔法通常攻撃）</button>
                    <button type="button" id="dbg-wpn-up" class="btn-ui btn-amber" style="font-size:11px;padding:7px;">✨ 武器強化 +3（杖の見た目差分を確認）</button>
                    <button type="button" id="dbg-mp-max" class="btn-ui btn-emerald" style="font-size:11px;padding:7px;">💧 最大MP+9999 ＆ HP/MP全回復 ＆ +10万G</button>
                </div>

                <div style="font-size:11px;font-weight:900;color:#f97316;margin-bottom:5px;">🔥 敵への状態異常エフェクト強制付与（8秒）</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
                    <button type="button" id="dbg-st-burn" class="btn-ui" style="background:#9a3412;font-size:11px;padding:6px;">🔥 全敵を炎上</button>
                    <button type="button" id="dbg-st-freeze" class="btn-ui" style="background:#0369a1;font-size:11px;padding:6px;">❄️ 全敵を凍結</button>
                    <button type="button" id="dbg-st-poison" class="btn-ui" style="background:#6b21a8;font-size:11px;padding:6px;">☠️ 全敵を毒</button>
                    <button type="button" id="dbg-st-shock" class="btn-ui" style="background:#854d0e;font-size:11px;padding:6px;">⚡ 全敵を麻痺</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const close = () => modal.remove();
        document.getElementById('btn-close-secret-debug')?.addEventListener('click', close);
        modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

        document.getElementById('dbg-sk-10')?.addEventListener('click', () => { sfx?.init?.(); this.setAllSkillsLevelDebug(10); });
        document.getElementById('dbg-sk-50')?.addEventListener('click', () => { sfx?.init?.(); this.setAllSkillsLevelDebug(50); });
        document.getElementById('dbg-sk-100')?.addEventListener('click', () => { sfx?.init?.(); this.setAllSkillsLevelDebug(100); });
        document.getElementById('dbg-sk-1')?.addEventListener('click', () => { sfx?.init?.(); this.setAllSkillsLevelDebug(1); });

        document.getElementById('dbg-evo-mage')?.addEventListener('click', () => { sfx?.init?.(); this.forceEvolveToMageDebug(); });
        document.getElementById('dbg-wpn-up')?.addEventListener('click', () => {
            sfx?.init?.();
            if (this.saveData) {
                this.saveData.weaponEnhance = (Number(this.saveData.weaponEnhance) || 0) + 3;
                this.buildPlayerEntity?.();
                this.saveGame?.(false);
                this.refreshAllHUD?.();
                this.showAlertBanner?.(`🪄 [DEBUG] 武器強化値が +${this.saveData.weaponEnhance} になりました！`, 1800);
            }
        });
        document.getElementById('dbg-mp-max')?.addEventListener('click', () => {
            sfx?.init?.();
            const d = this.saveData || {};
            d.maxMp = (Number(d.maxMp) || 100) + 9999;
            d.mp = d.maxMp;
            if ('gold' in d) d.gold = (Number(d.gold) || 0) + 100000;
            else if ('coins' in d) d.coins = (Number(d.coins) || 0) + 100000;
            else d.gold = 100000;
            if (this.player) {
                this.player.maxMp = d.maxMp;
                this.player.mp = d.maxMp;
                this.player.hp = this.player.maxHp || d.maxHp || 100;
            }
            this.saveGame?.(false);
            this.refreshAllHUD?.();
            this.showAlertBanner?.('💧 [DEBUG] 最大MP+9999 ＆ 全回復 ＆ +100,000G！', 1800);
        });

        document.getElementById('dbg-st-burn')?.addEventListener('click', () => { sfx?.init?.(); this.applyDebugStatusToMonsters('burn'); });
        document.getElementById('dbg-st-freeze')?.addEventListener('click', () => { sfx?.init?.(); this.applyDebugStatusToMonsters('freeze'); });
        document.getElementById('dbg-st-poison')?.addEventListener('click', () => { sfx?.init?.(); this.applyDebugStatusToMonsters('poison'); });
        document.getElementById('dbg-st-shock')?.addEventListener('click', () => { sfx?.init?.(); this.applyDebugStatusToMonsters('shock'); });
    };

    P.promptSecretDebugUnlock = function () {
        if (this._debugUnlocked) {
            this.openSecretDebugModal();
            return;
        }
        const code = window.prompt('🔐 隠しデバッグ暗号を入力してください:');
        if (code && code.trim() === SECRET_DEBUG_CODE) {
            this._debugUnlocked = true;
            sfx?.playHeal?.();
            this.openSecretDebugModal();
        } else if (code !== null) {
            this.showAlertBanner?.('❌ 暗号が違います', 1400);
        }
    };

    // チャット欄に暗号「debug777」を打ち込んで送信すると、他人に送信せず隠しデバッグ画面を起動！
    if (P.sendChatMessage) {
        const _prevSendChatV22 = P.sendChatMessage;
        P.sendChatMessage = function (rawText) {
            const txt = String(rawText || '').trim();
            if (txt === SECRET_DEBUG_CODE) {
                this._debugUnlocked = true;
                sfx?.playHeal?.();
                this.openSecretDebugModal();
                return;
            }
            _prevSendChatV22.call(this, rawText);
        };
    }

    // 隠しコマンド2：成長モーダルのタイトル文字を5回連続タップで暗号入力ダイアログ出現
    P.bindSecretDebugGesture = function () {
        if (this._secretDebugGestureBound) return;
        this._secretDebugGestureBound = true;
        let tapCount = 0;
        let lastTapTs = 0;

        document.addEventListener('click', (e) => {
            const titleEl = e.target.closest?.('#modal-title, .modal-header h2, .modal-header h3');
            if (!titleEl) return;
            const now = performance.now();
            if (now - lastTapTs > 1500) tapCount = 0;
            lastTapTs = now;
            tapCount++;
            if (tapCount >= 5) {
                tapCount = 0;
                this.promptSecretDebugUnlock();
            }
        });
    };
}

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.game) {
            window.game.syncSkillMpCostsV22?.();
            window.game.syncMageWeaponNamesV22?.();
            window.game.bindSecretDebugGesture?.();
            if (window.game.isMageEvolution?.()) {
                window.game.buildPlayerEntity?.();
            }
        }
    }, 220);
});
// === GAME8_V22_OK ===
// ▲▲▲ ここまで【3/3】 ▲▲▲
