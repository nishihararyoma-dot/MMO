
'use strict';

const SECRET_DEBUG_CODE = 'debug777';
const MAX_LEVEL_CAP_V27 = 999;
const MAX_THREAT_CAP_V27 = 999;

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
            return s.replace(re, rep);
        }
    }
    return s + '（魔導杖）';
}

if (typeof KaomojiMMORPG !== 'undefined') {
    const P = KaomojiMMORPG.prototype;

    // 1. 現在の職業が「魔道士系」かどうかを判定
    P.isMageEvolution = function (evoIdOverride = null) {
        const d = this.saveData || {};
        const candidates = [
            evoIdOverride,
            d.evolutionId, d.evolution, d.evoId, d.evo,
            d.jobId, d.job, d.classId, d.class, d.role,
            this.player?.evolutionId, this.player?.job
        ].filter(v => v !== null && v !== undefined && v !== '');

        let evoName = '';
        const primaryId = String(candidates[0] || '');
        if (typeof EVOLUTIONS !== 'undefined' && EVOLUTIONS && primaryId) {
            if (Array.isArray(EVOLUTIONS)) {
                const found = EVOLUTIONS.find(e => e && (String(e.id) === primaryId || String(e.name) === primaryId));
                if (found) evoName = String(found.name || found.title || '');
            } else if (EVOLUTIONS[primaryId]) {
                evoName = String(EVOLUTIONS[primaryId].name || EVOLUTIONS[primaryId].title || '');
            }
        }
        const combined = `${candidates.join(' ')} ${evoName}`.toLowerCase();
        return /mage|wizard|sorcerer|witch|sage|warlock|archmage|spell|magic|caster|priest|cleric|bishop|魔道|魔導|魔法|賢者|術師|メイジ|ウィザード|ソーサラー|ウィッチ|司祭/.test(combined);
    };

    // 2. 魔道士進化時の「杖（スタッフ）」3Dモデル（5段階差分）
    P.buildMageStaff3D = function (weaponId = 'wpn_wood', enhance = 0) {
        const grp = new THREE.Group();
        grp.name = 'mage_staff_weapon';
        grp.userData.isCustomStaffV27 = true;

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

        const shaft = new THREE.Mesh(
            new THREE.CylinderGeometry(0.045, 0.055, cfg.len, 10),
            new THREE.MeshLambertMaterial({ color: cfg.shaftCol })
        );
        shaft.position.y = cfg.len * 0.42;
        grp.add(shaft);

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

        const orbGeo = tier >= 3 ? new THREE.OctahedronGeometry(cfg.orbR, 0) : new THREE.SphereGeometry(cfg.orbR, 12, 12);
        const orb = new THREE.Mesh(orbGeo, new THREE.MeshBasicMaterial({ color: cfg.orbCol }));
        orb.position.y = topY + 0.16;
        grp.add(orb);

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

        grp.rotation.x = 0.35;
        return grp;
    };

    // 魔道士時の武器表示を「杖のみ」に同期
    P.enforceStrictWeaponVisualV27 = function (entity, evoIdOverride = null) {
        if (!entity || !entity.group || typeof THREE === 'undefined') return;
        const grp = entity.group;
        const isMage = (entity === this.player)
            ? this.isMageEvolution(evoIdOverride)
            : this.isMageEvolution(evoIdOverride || entity.evolutionId);

        if (isMage) {
            const toRemove = [];
            grp.traverse(c => {
                if (c === grp) return;
                let p = c;
                while (p) {
                    if (p.userData?.isCustomStaffV27 || p.name === 'mage_staff_weapon') return;
                    p = p.parent;
                }
                const nm = String(c.name || '').toLowerCase();
                if (/wpn|weapon|sword|blade|hilt|guard|katana|axe|spear/.test(nm) || c === entity.weaponMesh) {
                    toRemove.push(c);
                    return;
                }
                if (c.isMesh && !c.material?.map && c.position.x >= 0.38 && c.position.x <= 1.25) {
                    c.geometry?.computeBoundingBox?.();
                    const bb = c.geometry?.boundingBox;
                    const h = bb ? (bb.max.y - bb.min.y) * (c.scale.y || 1) : 0;
                    const w = bb ? (bb.max.x - bb.min.x) * (c.scale.x || 1) : 0;
                    if (h > 0.45 || w > 0.32 || c.parent !== grp) toRemove.push(c);
                }
            });
            toRemove.forEach(obj => {
                obj.visible = false;
                obj.parent?.remove(obj);
            });

            let staff = grp.getObjectByName?.('mage_staff_weapon');
            if (!staff) {
                const wId = this.saveData?.equippedWeapon || this.saveData?.weaponId || 'wpn_wood';
                const wEnh = this.saveData?.weaponEnhance || 0;
                staff = this.buildMageStaff3D(wId, wEnh);
                staff.position.set(0.64, 0.42, 0.22);
                grp.add(staff);
            }
            staff.visible = true;
            entity.weaponMesh = staff;
        } else {
            const oldStaff = grp.getObjectByName?.('mage_staff_weapon');
            if (oldStaff) {
                oldStaff.visible = false;
                oldStaff.parent?.remove(oldStaff);
            }
        }
    };

    if (P.buildAvatarGroup) {
        const _prevBuildAvatar = P.buildAvatarGroup;
        P.buildAvatarGroup = function (opts) {
            const res = _prevBuildAvatar.call(this, opts);
            if (res && res.group && typeof THREE !== 'undefined') {
                const evoId = opts?.evolutionId || this.saveData?.evolutionId || '';
                const dummyEnt = { group: res.group, weaponMesh: res.weaponMesh, evolutionId: evoId };
                this.enforceStrictWeaponVisualV27(dummyEnt, evoId);
                res.weaponMesh = dummyEnt.weaponMesh;
            }
            return res;
        };
    }

    if (P.buildPlayerEntity) {
        const _prevBuildPlayer = P.buildPlayerEntity;
        P.buildPlayerEntity = function () {
            _prevBuildPlayer.call(this);
            if (this.player) this.enforceStrictWeaponVisualV27(this.player);
        };
    }

    // 3. 魔道士進化時の通常攻撃3D魔法弾
    P.spawnMageBasicMagicShot = function (entity) {
        if (!this.useWebGL || !this.scene || !entity?.pos || typeof THREE === 'undefined') return;
        if (!this._v22MagicShots) this._v22MagicShots = [];

        const rotY = entity.rotY || 0;
        const dirX = Math.sin(rotY);
        const dirZ = Math.cos(rotY);

        const grp = new THREE.Group();
        const core = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 14), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        const auraMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.72 });
        const aura = new THREE.Mesh(new THREE.OctahedronGeometry(0.46, 0), auraMat);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xf472b6, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.055, 8, 22), ringMat);
        grp.add(core, aura, ring);

        grp.position.set(entity.pos.x + dirX * 1.1, 1.25, entity.pos.z + dirZ * 1.1);
        grp.rotation.y = rotY;
        this.scene.add(grp);

        this._v22MagicShots.push({
            grp, aura, ring, auraMat, ringMat,
            vx: dirX * 19.5, vz: dirZ * 19.5,
            life: 0.48, maxLife: 0.48
        });
    };

    P.updateMageBasicMagicShots = function (dt) {
        if (!this._v22MagicShots || !this._v22MagicShots.length) return;
        this._v22MagicShots = this._v22MagicShots.filter(s => {
            s.life -= dt;
            if (s.life <= 0) {
                if (this.scene && this._slashEffects) {
                    const hitMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.95 });
                    const hitRing = new THREE.Mesh(new THREE.RingGeometry(0.25, 0.95, 20), hitMat);
                    hitRing.rotation.x = -Math.PI / 2;
                    hitRing.position.set(s.grp.position.x, 0.25, s.grp.position.z);
                    this.scene.add(hitRing);
                    this._slashEffects.push({ kind: 'shockwave', mesh: hitRing, mat: hitMat, life: 0.28, maxLife: 0.28 });
                }
                this.scene?.remove(s.grp);
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

    const _prevTriggerAttack = P.triggerAttackVisual;
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
        _prevTriggerAttack?.call(this, entity, isSkill, skillInfo);
    };

    // 4. 敵モンスターの状態異常3Dエフェクト
    P.detectMonsterStatus = function (m) {
        if (!m) return null;
        if (m._visualStatus && Number(m._visualStatus.timer) > 0) return m._visualStatus.type;
        if (Number(m.burnTimer) > 0 || Number(m.burn) > 0 || m.isBurning === true) return 'burn';
        if (Number(m.freezeTimer) > 0 || Number(m.freeze) > 0 || m.isFrozen === true) return 'freeze';
        if (Number(m.poisonTimer) > 0 || Number(m.poison) > 0 || m.isPoisoned === true) return 'poison';
        if (Number(m.stunTimer) > 0 || Number(m.paralyzeTimer) > 0 || Number(m.stun) > 0 || Number(m.paralyze) > 0 || m.isStunned === true) return 'shock';

        const arrList = [m.debuffs, m.statuses, m.effects].filter(Array.isArray);
        for (const arr of arrList) {
            for (const item of arr) {
                if (!item) continue;
                if (typeof item === 'string') {
                    const s = item.toLowerCase();
                    if (/^(burn|burning|ignite)$/.test(s)) return 'burn';
                    if (/^(freeze|frozen)$/.test(s)) return 'freeze';
                    if (/^(poison|poisoned)$/.test(s)) return 'poison';
                    if (/^(stun|paralyze|shock)$/.test(s)) return 'shock';
                } else if (typeof item === 'object') {
                    const dur = Number(item.timer ?? item.duration ?? item.turns ?? item.remain ?? 1);
                    if (dur <= 0) continue;
                    const t = String(item.type || item.id || item.name || '').toLowerCase();
                    if (/^(burn|burning|ignite)$/.test(t)) return 'burn';
                    if (/^(freeze|frozen)$/.test(t)) return 'freeze';
                    if (/^(poison|poisoned)$/.test(t)) return 'poison';
                    if (/^(stun|paralyze|shock)$/.test(t)) return 'shock';
                }
            }
        }
        return null;
    };

    P.updateMonsterStatusVisuals = function (dt) {
        if (!this.useWebGL || !Array.isArray(this.monsters) || typeof THREE === 'undefined') return;
        const now = performance.now() * 0.001;

        this.monsters.forEach((m) => {
            if (!m) return;
            if (m._visualStatus && Number(m._visualStatus.timer) > 0) {
                m._visualStatus.timer = Math.max(0, m._visualStatus.timer - dt);
                if (m._visualStatus.timer <= 0) m._visualStatus = null;
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

            if (grp.userData._curStatusType !== stType || !curHolder) {
                if (curHolder) grp.remove(curHolder);
                grp.userData._curStatusType = stType;

                const sc = Number(m.scale) || 1.0;
                const fxGrp = new THREE.Group();
                fxGrp.name = 'status_fx_3d';
                fxGrp.userData.items = [];

                if (stType === 'burn') {
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

            const holder = grp.getObjectByName?.('status_fx_3d');
            if (holder?.userData.items) {
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

    // 5. スキル現在Lv・消費MP計算・スロット表示同期
    P.getExactSkillLevelV26 = function (sId, slotIdx = -1, skObj = null) {
        const d = this.saveData || {};
        const candidates = [
            d.skillLevels?.[sId], d.skillLvs?.[sId],
            slotIdx >= 0 ? d.skillLevels?.[`slot_${slotIdx}`] : undefined,
            slotIdx >= 0 ? d.skillLvs?.[`slot_${slotIdx}`] : undefined,
            typeof d.skills?.[sId] === 'number' ? d.skills[sId] : d.skills?.[sId]?.lv,
            skObj?.lv, skObj?.level
        ].map(v => Number(v)).filter(v => !isNaN(v) && v >= 1);
        return Math.min(MAX_LEVEL_CAP_V27, candidates.length ? Math.max(...candidates) : 1);
    };

    P.calcScaledSkillMp = function (baseMp, lv = 1) {
        const b = Math.max(1, Number(baseMp) || 5);
        const level = Math.min(MAX_LEVEL_CAP_V27, Math.max(1, Number(lv) || 1));
        let mp = (b * 5) + ((level - 1) * 12);
        if (level >= 100) mp = Math.floor(mp * 3.5) + 2500;
        else if (level >= 50) mp = Math.floor(mp * 2.4) + 750;
        else if (level >= 10) mp = Math.floor(mp * 1.6) + 180;
        return mp;
    };

    P.syncSkillMpCostsV22 = function () {
        if (typeof SKILLS === 'undefined' || !SKILLS) return;
        const list = Array.isArray(SKILLS) ? SKILLS : Object.values(SKILLS);
        list.forEach((sk, idx) => {
            if (!sk || typeof sk !== 'object') return;
            const mpKeys = ['mpCost', 'mp', 'cost', 'manaCost', 'consumeMp'].filter(k => typeof sk[k] === 'number');
            if (!mpKeys.length) return;
            if (sk._baseMpV22 === undefined) sk._baseMpV22 = Math.max(1, Number(sk[mpKeys[0]]) || 5);
            const sId = String(sk.id || sk.skillId || `slot_${idx}`);
            const lv = this.getExactSkillLevelV26(sId, idx, sk);
            const scaledMp = this.calcScaledSkillMp(sk._baseMpV22, lv);
            mpKeys.forEach(k => { sk[k] = scaledMp; });
        });
        this.syncSkillSlotButtonsUI();
    };

    P.syncSkillSlotButtonsUI = function () {
        const slotBtns = document.querySelectorAll('[id^="skill-btn-"], .skill-slot-btn, .skill-btn, [data-skill-slot]');
        slotBtns.forEach((btn, i) => {
            const slotAttr = btn.getAttribute('data-skill-slot') ?? btn.id?.replace(/\D+/g, '');
            const slotIdx = slotAttr !== '' && !isNaN(Number(slotAttr)) ? Number(slotAttr) : i;
            const meta = this.resolveSkillMeta ? this.resolveSkillMeta(slotIdx) : null;
            if (!meta) return;

            const lv = meta.skillLv || 1;
            let badge = btn.querySelector('.v26-skill-lv-badge');
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'v26-skill-lv-badge';
                badge.style.cssText = 'display:block;font-size:8px;font-weight:900;color:#fde047;line-height:1.05;margin-top:1px;text-shadow:0 1px 2px #000;pointer-events:none;';
                btn.appendChild(badge);
            }

            let curMp = '';
            if (typeof SKILLS !== 'undefined' && SKILLS) {
                const list = Array.isArray(SKILLS) ? SKILLS : Object.values(SKILLS);
                const skObj = list.find(s => s && (s.id === meta.skillId || s.skillId === meta.skillId)) || list[slotIdx];
                if (skObj) {
                    const mpVal = skObj.mpCost ?? skObj.mp ?? skObj.cost ?? skObj.manaCost ?? skObj.consumeMp;
                    if (typeof mpVal === 'number') curMp = ` MP${mpVal}`;
                }
            }
            const rankTag = lv >= 100 ? '👑' : (lv >= 50 ? '🔥' : (lv >= 10 ? '✨' : ''));
            badge.textContent = `${rankTag}Lv.${lv}${curMp}`;
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
                if (w._origNameV22) w.name = isMage ? convertWeaponNameToStaff(w._origNameV22) : w._origNameV22;
                if (w._origDescV22) {
                    w.desc = isMage ? w._origDescV22.replace(/剣|刀|ソード|ブレード/g, '魔導杖') : w._origDescV22;
                }
            });
        }
    };

    // 7. 転生実行ボタンのみ非表示（進化・役職タブは必ず残す）
    ['doRebirth', 'rebirth', 'reincarnate', 'performRebirth', 'confirmRebirth', 'openRebirthModal'].forEach(fn => {
        if (typeof P[fn] === 'function') P[fn] = function () { return false; };
    });

    P.purgeRebirthUIV27 = function () {
        document.querySelectorAll('button').forEach(el => {
            if (el.closest?.('#kmj-secret-debug-modal')) return;
            if (el.hasAttribute('data-tab') || el.classList.contains('tab-btn')) return;
            const txt = (el.textContent || '').trim();
            if (/進化|役職|職業|転職/.test(txt)) return;
            if (/^(転生する|転生実行|転生を行う)$/.test(txt)) {
                el.style.display = 'none';
            }
        });
    };

    // 8. Lv上限 999 ＆ 驚異度上限 999 の常時適用
    P.enforce999CapsV27 = function () {
        try {
            ['MAX_LV', 'MAX_LEVEL', 'LEVEL_CAP', 'MAX_PLAYER_LV', 'MAX_SKILL_LV'].forEach(gKey => {
                if (typeof window[gKey] === 'number' && window[gKey] < MAX_LEVEL_CAP_V27) window[gKey] = MAX_LEVEL_CAP_V27;
            });
            ['MAX_THREAT', 'THREAT_CAP', 'MAX_THREAT_LEVEL', 'MAX_DANGER'].forEach(gKey => {
                if (typeof window[gKey] === 'number' && window[gKey] < MAX_THREAT_CAP_V27) window[gKey] = MAX_THREAT_CAP_V27;
            });
        } catch (e) {}

        const d = this.saveData;
        if (!d) return;
        if (typeof d.lv === 'number' && d.lv > MAX_LEVEL_CAP_V27) d.lv = MAX_LEVEL_CAP_V27;
        if (typeof d.level === 'number' && d.level > MAX_LEVEL_CAP_V27) d.level = MAX_LEVEL_CAP_V27;
        if (this.player) {
            if (typeof this.player.lv === 'number' && this.player.lv > MAX_LEVEL_CAP_V27) this.player.lv = MAX_LEVEL_CAP_V27;
            if (typeof this.player.level === 'number' && this.player.level > MAX_LEVEL_CAP_V27) this.player.level = MAX_LEVEL_CAP_V27;
        }
        ['threat', 'threatLevel', 'threatLv', 'danger', 'dangerLevel', 'worldThreat', 'areaThreat'].forEach(tk => {
            if (typeof d[tk] === 'number' && d[tk] > MAX_THREAT_CAP_V27) d[tk] = MAX_THREAT_CAP_V27;
            if (typeof this[tk] === 'number' && this[tk] > MAX_THREAT_CAP_V27) this[tk] = MAX_THREAT_CAP_V27;
        });
        [d.skillLevels, d.skillLvs].forEach(map => {
            if (!map || typeof map !== 'object') return;
            Object.keys(map).forEach(k => {
                if (typeof map[k] === 'number' && map[k] > MAX_LEVEL_CAP_V27) map[k] = MAX_LEVEL_CAP_V27;
            });
        });
    };

    // 9. チャット定型文スリム維持 ＋ チャットログ縦リサイズ
    P.getSavedChatLogHeightV34 = function () {
        try {
            const v = Number(localStorage.getItem('kmj_chat_log_height_v34'));
            return (!isNaN(v) && v >= 64) ? v : null;
        } catch (e) { return null; }
    };

    P.setSavedChatLogHeightV34 = function (px) {
        try {
            if (px === null) localStorage.removeItem('kmj_chat_log_height_v34');
            else {
                const maxH = Math.max(180, Math.floor(window.innerHeight * 0.68));
                localStorage.setItem('kmj_chat_log_height_v34', String(Math.max(64, Math.min(maxH, Math.round(px)))));
            }
        } catch (e) {}
    };

    P.fixChatCompactLayoutV31 = function () {
        const vw = window.innerWidth;
        const isSmallMobile = vw <= 920;

        document.querySelectorAll('button').forEach(btn => {
            if (btn.closest?.('#kmj-secret-debug-modal') || btn.closest?.('#kmj-ui-custom-bar')) return;
            const txt = (btn.textContent || '').trim();

            if (/^(全体チャット|部屋\/オフライン)$/.test(txt)) {
                btn.style.setProperty('height', '28px', 'important');
                btn.style.setProperty('min-height', '26px', 'important');
                btn.style.setProperty('padding', '2px 8px', 'important');
                btn.style.setProperty('font-size', '11px', 'important');
            } else if (/^(よろしく！|ボス行こう！|ありがとう！|おつかれ！)$/.test(txt)) {
                btn.style.setProperty('height', '24px', 'important');
                btn.style.setProperty('min-height', '22px', 'important');
                btn.style.setProperty('padding', '2px 8px', 'important');
                btn.style.setProperty('font-size', '10px', 'important');
                btn.style.setProperty('white-space', 'nowrap', 'important');
                btn.style.setProperty('border-radius', '999px', 'important');
                if (btn.parentElement) {
                    const row = btn.parentElement;
                    row.style.setProperty('display', 'flex', 'important');
                    row.style.setProperty('flex-wrap', 'nowrap', 'important');
                    row.style.setProperty('gap', '4px', 'important');
                    row.style.setProperty('overflow-x', 'auto', 'important');
                }
            }
        });

        const chatInputs = document.querySelectorAll('input[placeholder*="メッセージ"], input[placeholder*="チャット"], #chat-input');
        chatInputs.forEach(inp => {
            const isVisible = inp.getBoundingClientRect().height > 0;
            inp.style.setProperty('height', '28px', 'important');
            inp.style.setProperty('font-size', '11px', 'important');

            let chatBox = null;
            let cur = inp.parentElement;
            for (let depth = 0; depth < 6 && cur && cur !== document.body; depth++) {
                const txt = cur.textContent || '';
                const r = cur.getBoundingClientRect();
                if (/全体チャット/.test(txt) && /ドラッグで移動/.test(txt) && r.width > 200 && r.height > 80 && r.height < window.innerHeight * 0.78) {
                    chatBox = cur;
                    break;
                }
                cur = cur.parentElement;
            }
            if (!chatBox) return;

            chatBox.style.setProperty('bottom', 'auto', 'important');
            chatBox.style.setProperty('height', 'auto', 'important');
            chatBox.style.setProperty('padding-bottom', '4px', 'important');
            chatBox.style.setProperty('z-index', '45', 'important');
            if (isSmallMobile) chatBox.style.setProperty('max-width', '46vw', 'important');

            const logEl = chatBox.querySelector('#chat-messages, #chat-log, .chat-messages, .chat-log')
                || Array.from(chatBox.querySelectorAll('div')).find(el => {
                    if (el === chatBox || el.contains(inp)) return false;
                    const cs = window.getComputedStyle(el);
                    return /(auto|scroll)/.test(cs.overflowY) && el.getBoundingClientRect().height >= 45;
                });

            if (logEl) {
                const savedH = this.getSavedChatLogHeightV34();
                if (savedH) {
                    logEl.style.setProperty('height', `${savedH}px`, 'important');
                    logEl.style.setProperty('max-height', `${savedH}px`, 'important');
                    logEl.style.setProperty('min-height', `${savedH}px`, 'important');
                    logEl.style.setProperty('overflow-y', 'auto', 'important');
                } else {
                    logEl.style.removeProperty('height');
                    logEl.style.removeProperty('max-height');
                    logEl.style.removeProperty('min-height');
                }

                let handle = chatBox.querySelector('#kmj-chat-resize-handle-v34');
                if (!handle) {
                    handle = document.createElement('div');
                    handle.id = 'kmj-chat-resize-handle-v34';
                    handle.innerHTML = '══ ↕ ドラッグで縦幅変更 ══';
                    handle.style.cssText = 'width:100%;height:18px;margin-top:4px;border-radius:6px;background:rgba(56,189,248,0.18);border:1px dashed rgba(56,189,248,0.65);color:#7dd3fc;font-size:9px;font-weight:900;display:flex;align-items:center;justify-content:center;cursor:ns-resize;touch-action:none;user-select:none;';
                    chatBox.appendChild(handle);

                    let resizing = false, startY = 0, startH = 96;
                    handle.addEventListener('pointerdown', (e) => {
                        e.preventDefault(); e.stopPropagation();
                        resizing = true; startY = e.clientY;
                        startH = logEl.getBoundingClientRect().height || 96;
                        handle.setPointerCapture?.(e.pointerId);
                    });
                    handle.addEventListener('pointermove', (e) => {
                        if (!resizing) return;
                        e.preventDefault(); e.stopPropagation();
                        this.setSavedChatLogHeightV34(startH + (e.clientY - startY));
                        const applied = this.getSavedChatLogHeightV34() || 96;
                        logEl.style.setProperty('height', `${applied}px`, 'important');
                        logEl.style.setProperty('max-height', `${applied}px`, 'important');
                        logEl.style.setProperty('min-height', `${applied}px`, 'important');
                        logEl.style.setProperty('overflow-y', 'auto', 'important');
                        logEl.scrollTop = logEl.scrollHeight;
                    });
                    handle.addEventListener('pointerup', (e) => {
                        if (!resizing) return;
                        resizing = false;
                        handle.releasePointerCapture?.(e.pointerId);
                    });
                }
                handle.style.display = isVisible ? 'flex' : 'none';
            }
        });
    };

    // 9.5 移動スティックを常に1個だけ維持（古いスティック封印＋画面外座標自動修復）
    P.ensureStandardMoveStickV33 = function () {
        try {
            const raw = localStorage.getItem('kmj_custom_ui_layout_v31');
            if (raw) {
                const layout = JSON.parse(raw);
                const m = layout?.move_stick;
                if (m && (m.leftPct < 0 || m.leftPct > 85 || m.topPct < 0 || m.topPct > 85 || isNaN(m.leftPct) || isNaN(m.topPct))) {
                    delete layout.move_stick;
                    localStorage.setItem('kmj_custom_ui_layout_v31', JSON.stringify(layout));
                }
            }
        } catch (e) {}

        // 古いゲーム側スティック要素を非表示に封印
        document.querySelectorAll('#joystick, #joy-base, #joystick-zone, #move-pad, .joystick, .joy-base').forEach(el => {
            if (el.id !== 'kmj-v33-movepad') {
                el.style.setProperty('display', 'none', 'important');
                el.style.setProperty('pointer-events', 'none', 'important');
            }
        });

        const pads = document.querySelectorAll('#kmj-v33-movepad');
        pads.forEach((p, i) => { if (i > 0) p.remove(); });
        let pad = document.getElementById('kmj-v33-movepad');

        if (!pad) {
            pad = document.createElement('section');
            pad.id = 'kmj-v33-movepad';
            pad.style.cssText = 'position:fixed;left:24px;bottom:24px;width:96px;height:96px;border-radius:50%;background:radial-gradient(circle,rgba(15,23,42,0.55),rgba(30,41,59,0.82));border:2px solid rgba(148,163,184,0.9);box-shadow:0 3px 12px rgba(0,0,0,0.6);z-index:88;touch-action:none;user-select:none;display:flex;align-items:center;justify-content:center;';

            const knob = document.createElement('span');
            knob.style.cssText = 'display:block;width:40px;height:40px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#38bdf8,#0284c7);border:2px solid #e0f2fe;box-shadow:0 2px 8px rgba(0,0,0,0.5);pointer-events:none;position:relative;';
            pad.appendChild(knob);

            let activePid = null;
            const setKeyState = (keyName, codeName, down) => {
                if (this.keys && typeof this.keys === 'object') {
                    this.keys[keyName] = this.keys[keyName.toLowerCase()] = this.keys[keyName.toUpperCase()] = this.keys[codeName] = down;
                }
                try {
                    window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { key: keyName, code: codeName, bubbles: true }));
                } catch (e) {}
            };

            const updateStick = (clientX, clientY) => {
                const rect = pad.getBoundingClientRect();
                const maxR = rect.width * 0.36;
                let dx = clientX - (rect.left + rect.width / 2);
                let dy = clientY - (rect.top + rect.height / 2);
                const dist = Math.hypot(dx, dy);
                if (dist > maxR) { dx = (dx / dist) * maxR; dy = (dy / dist) * maxR; }
                knob.style.transform = `translate(${dx}px, ${dy}px)`;

                const nx = dx / maxR, ny = dy / maxR;
                if ('joyX' in this) this.joyX = nx;
                if ('joyY' in this) this.joyY = ny;
                if (this.joy && typeof this.joy === 'object') { this.joy.x = nx; this.joy.y = ny; this.joy.active = true; }

                setKeyState('w', 'KeyW', ny < -0.28);
                setKeyState('s', 'KeyS', ny > 0.28);
                setKeyState('a', 'KeyA', nx < -0.28);
                setKeyState('d', 'KeyD', nx > 0.28);
                setKeyState('ArrowUp', 'ArrowUp', ny < -0.28);
                setKeyState('ArrowDown', 'ArrowDown', ny > 0.28);
                setKeyState('ArrowLeft', 'ArrowLeft', nx < -0.28);
                setKeyState('ArrowRight', 'ArrowRight', nx > 0.28);
            };

            const resetStick = () => {
                activePid = null;
                knob.style.transform = 'translate(0px, 0px)';
                if ('joyX' in this) this.joyX = 0;
                if ('joyY' in this) this.joyY = 0;
                if (this.joy && typeof this.joy === 'object') { this.joy.x = 0; this.joy.y = 0; this.joy.active = false; }
                ['w', 's', 'a', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].forEach(k => {
                    setKeyState(k, k.length === 1 ? `Key${k.toUpperCase()}` : k, false);
                });
            };

            pad.addEventListener('pointerdown', (e) => {
                if (this._uiEditModeV31) return;
                e.preventDefault(); e.stopPropagation();
                activePid = e.pointerId;
                pad.setPointerCapture?.(e.pointerId);
                updateStick(e.clientX, e.clientY);
            });
            pad.addEventListener('pointermove', (e) => {
                if (this._uiEditModeV31 || activePid !== e.pointerId) return;
                e.preventDefault();
                updateStick(e.clientX, e.clientY);
            });
            pad.addEventListener('pointerup', (e) => {
                if (activePid !== e.pointerId) return;
                pad.releasePointerCapture?.(e.pointerId);
                resetStick();
            });
            pad.addEventListener('pointercancel', resetStick);
            document.body.appendChild(pad);
        }

        pad.style.setProperty('display', 'flex', 'important');
        pad.style.setProperty('visibility', 'visible', 'important');
        pad.style.setProperty('opacity', '1', 'important');
    };
}
if (typeof KaomojiMMORPG !== 'undefined') {
    const P = KaomojiMMORPG.prototype;

    // 10. ボタンの大きさ・配置カスタムシステム（挑発ボタン含む全操作対応）
    P.loadCustomUILayoutV31 = function () {
        try {
            const raw = localStorage.getItem('kmj_custom_ui_layout_v31');
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    };

    P.saveCustomUILayoutV31 = function (data) {
        try {
            localStorage.setItem('kmj_custom_ui_layout_v31', JSON.stringify(data || {}));
        } catch (e) {}
    };

    P.bindControlEditListenersV35 = function (key, el) {
        if (!el || el.dataset.v35DragBound) return;
        el.dataset.v35DragBound = '1';

        let dragging = false;
        let startX = 0, startY = 0, origLeft = 0, origTop = 0;

        el.addEventListener('pointerdown', (e) => {
            if (!this._uiEditModeV31) return;
            e.preventDefault();
            e.stopImmediatePropagation();
            this._uiSelectedKeyV31 = key;
            this.renderUICustomToolbarV31();
            this.applySavedUILayoutV31();

            dragging = true;
            startX = e.clientX;
            startY = e.clientY;
            const r = el.getBoundingClientRect();
            origLeft = parseFloat(el.style.left) || r.left;
            origTop = parseFloat(el.style.top) || r.top;
            el.setPointerCapture?.(e.pointerId);
        }, true);

        el.addEventListener('pointermove', (e) => {
            if (!this._uiEditModeV31 || !dragging) return;
            e.preventDefault();
            e.stopImmediatePropagation();
            const nx = Math.max(4, Math.min(window.innerWidth - 36, origLeft + (e.clientX - startX)));
            const ny = Math.max(4, Math.min(window.innerHeight - 36, origTop + (e.clientY - startY)));

            const layout = this.loadCustomUILayoutV31();
            const curScale = layout[key]?.scale ?? (window.innerWidth <= 920 ? 0.86 : 1.0);
            layout[key] = {
                leftPct: Number(((nx / window.innerWidth) * 100).toFixed(2)),
                topPct: Number(((ny / window.innerHeight) * 100).toFixed(2)),
                scale: curScale
            };
            this.saveCustomUILayoutV31(layout);
            this.applySavedUILayoutV31();
        }, true);

        el.addEventListener('pointerup', (e) => {
            if (!this._uiEditModeV31 || !dragging) return;
            e.preventDefault();
            e.stopImmediatePropagation();
            dragging = false;
            el.releasePointerCapture?.(e.pointerId);
        }, true);
    };

    P.discoverCustomizableControlsV31 = function () {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const items = [];
        const usedEls = new Set();

        const register = (key, label, el) => {
            if (!el || usedEls.has(el)) return;
            const cs = window.getComputedStyle(el);
            if (cs.display === 'none' || cs.visibility === 'hidden') return;
            const r = el.getBoundingClientRect();
            if (r.width <= 12 || r.height <= 12) return;
            usedEls.add(el);
            el.dataset.v31ControlKey = key;
            el.dataset.v31ControlLabel = label;
            items.push({ key, label, el });
        };

        // ① 移動スティック
        const stickEl = document.getElementById('kmj-v33-movepad');
        if (stickEl) register('move_stick', '移動', stickEl);

        // ② 挑発ボタン
        const tauntEl = document.getElementById('kmj-btn-taunt-v26')
            || Array.from(document.querySelectorAll('button, [role="button"]')).find(b => /挑発/.test(b.textContent || ''));
        if (tauntEl) register('btn_taunt', '💢 挑発', tauntEl);

        // ③ 攻撃・スキル枠1〜5・標的切替
        document.querySelectorAll('button, [role="button"], .skill-btn, .skill-slot-btn, .attack-btn').forEach(btn => {
            if (usedEls.has(btn)) return;
            if (btn.id === 'kmj-debug-quick-exit' || btn.id === 'kmj-btn-ui-edit-settings') return;
            if (btn.closest?.('#kmj-secret-debug-modal') || btn.closest?.('#kmj-ui-custom-bar')) return;
            const cs = window.getComputedStyle(btn);
            if (cs.display === 'none' || cs.visibility === 'hidden') return;
            const r = btn.getBoundingClientRect();
            const txt = (btn.textContent || '').trim();
            if (/送信|戻す|縦拡大|標準幅|自動|AUTO|脅威|通信|手動|BGM|タイトル|初期化|ボタン配置|チャット開閉/.test(txt)) return;

            let key = null;
            let label = txt.slice(0, 6) || btn.id || 'ボタン';
            if (/攻撃/.test(txt) || /attack/i.test(btn.id)) { key = 'btn_attack'; label = '⚔️ 攻撃'; }
            else if (/挑発/.test(txt) || btn.id === 'kmj-btn-taunt-v26') { key = 'btn_taunt'; label = '💢 挑発'; }
            else if (/標的/.test(txt) || /target/i.test(btn.id)) { key = 'btn_target'; label = '🎯 標的'; }
            else if (/枠\s*1/.test(txt) || btn.id === 'skill-btn-0') { key = 'skill_0'; label = '枠1'; }
            else if (/枠\s*2/.test(txt) || btn.id === 'skill-btn-1') { key = 'skill_1'; label = '枠2'; }
            else if (/枠\s*3/.test(txt) || btn.id === 'skill-btn-2') { key = 'skill_2'; label = '枠3'; }
            else if (/枠\s*4/.test(txt) || btn.id === 'skill-btn-3') { key = 'skill_3'; label = '枠4'; }
            else if (/枠\s*5/.test(txt) || btn.id === 'skill-btn-4') { key = 'skill_4'; label = '枠5'; }
            else if (r.left >= vw * 0.45 && r.top >= vh * 0.35 && r.width >= 36 && r.height >= 36 && Math.abs(r.width - r.height) <= 14) {
                key = `custom_${btn.id || items.length}`;
            }

            if (key) register(key, label, btn);
        });

        return items;
    };

    P.applySavedUILayoutV31 = function () {
        const layout = this.loadCustomUILayoutV31();
        const items = this.discoverCustomizableControlsV31();
        const defaultScale = window.innerWidth <= 920 ? 0.86 : 1.0;

        items.forEach(({ key, label, el }) => {
            const cfg = layout[key];
            const scale = cfg?.scale ? Number(cfg.scale) : defaultScale;

            if (cfg && typeof cfg.leftPct === 'number' && typeof cfg.topPct === 'number') {
                const px = Math.round((cfg.leftPct / 100) * window.innerWidth);
                const py = Math.round((cfg.topPct / 100) * window.innerHeight);
                el.style.setProperty('position', 'fixed', 'important');
                el.style.setProperty('left', `${px}px`, 'important');
                el.style.setProperty('top', `${py}px`, 'important');
                el.style.setProperty('right', 'auto', 'important');
                el.style.setProperty('bottom', 'auto', 'important');
                el.style.setProperty('margin', '0px', 'important');
            }

            el.style.setProperty('transform', `scale(${scale.toFixed(2)})`, 'important');
            el.style.setProperty('transform-origin', 'center center', 'important');
            el.style.setProperty('z-index', (this._uiEditModeV31 && this._uiSelectedKeyV31 === key) ? '92' : '86', 'important');

            let tag = el.querySelector('.v35-edit-tag');
            if (this._uiEditModeV31) {
                this.bindControlEditListenersV35(key, el);
                el.style.setProperty('touch-action', 'none', 'important');
                const selected = (this._uiSelectedKeyV31 === key);
                el.style.setProperty('outline', selected ? '3px solid #fde047' : '2px dashed #38bdf8', 'important');
                el.style.setProperty('outline-offset', '2px', 'important');

                if (!tag) {
                    tag = document.createElement('span');
                    tag.className = 'v35-edit-tag';
                    tag.style.cssText = 'position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:#0f172a;color:#fde047;border:1px solid #fde047;border-radius:4px;padding:0 4px;font-size:9px;font-weight:900;white-space:nowrap;pointer-events:none;z-index:95;';
                    el.appendChild(tag);
                }
                tag.textContent = label;
            } else {
                el.style.removeProperty('outline');
                el.style.removeProperty('outline-offset');
                if (tag) tag.remove();
            }
        });
    };

    P.toggleUIEditModeV31 = function (forceState = null) {
        this._uiEditModeV31 = (forceState !== null) ? Boolean(forceState) : !this._uiEditModeV31;
        this.ensureStandardMoveStickV33();
        this.injectTauntButtonUI();
        const items = this.discoverCustomizableControlsV31();

        if (!this._uiEditModeV31) {
            document.getElementById('kmj-ui-custom-bar')?.remove();
            this.applySavedUILayoutV31();
            this.showAlertBanner?.('✅ ボタン配置とサイズを保存しました！', 1600);
            return;
        }

        if (!this._uiSelectedKeyV31 && items[0]) this._uiSelectedKeyV31 = items[0].key;
        items.forEach(({ key, el }) => this.bindControlEditListenersV35(key, el));
        this.renderUICustomToolbarV31();
        this.applySavedUILayoutV31();
    };

    P.renderUICustomToolbarV31 = function () {
        if (!this._uiEditModeV31) return;
        let bar = document.getElementById('kmj-ui-custom-bar');
        if (!bar) {
            bar = document.createElement('div');
            bar.id = 'kmj-ui-custom-bar';
            bar.style.cssText = 'position:fixed;top:8px;left:50%;transform:translateX(-50%);z-index:98;background:rgba(15,23,42,0.96);border:2px solid #38bdf8;border-radius:12px;padding:7px 10px;display:flex;flex-direction:column;align-items:center;gap:5px;box-shadow:0 4px 20px rgba(0,0,0,0.8);color:#fff;font-size:11px;max-width:95vw;';
            document.body.appendChild(bar);
        }

        const items = this.discoverCustomizableControlsV31();
        const selItem = items.find(it => it.key === this._uiSelectedKeyV31) || items[0];
        if (selItem) this._uiSelectedKeyV31 = selItem.key;

        const layout = this.loadCustomUILayoutV31();
        const defScale = window.innerWidth <= 920 ? 0.86 : 1.0;
        const curScale = selItem ? (layout[selItem.key]?.scale ?? defScale) : defScale;
        const pct = Math.round(curScale * 100);

        const chipsHtml = items.map(it => {
            const isSel = selItem && it.key === selItem.key;
            const st = isSel
                ? 'background:#eab308;color:#0f172a;border:1px solid #fef08a;font-weight:900;'
                : 'background:#1e293b;color:#e2e8f0;border:1px solid #475569;font-weight:700;';
            return `<button type="button" class="v35-sel-chip" data-key="${it.key}" style="${st}border-radius:6px;padding:2px 7px;font-size:10px;cursor:pointer;">${it.label}</button>`;
        }).join('');

        bar.innerHTML = `
            <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:5px;">
                <span style="font-weight:900;color:#fde047;">🎛️ 選択中: ${selItem ? selItem.label : 'ボタン'} (${pct}%)</span>
                <button type="button" id="v31-scale-down" style="background:#334155;color:#fff;border:1px solid #64748b;border-radius:6px;padding:3px 9px;font-weight:900;cursor:pointer;">－ 小さく</button>
                <button type="button" id="v31-scale-up" style="background:#334155;color:#fff;border:1px solid #64748b;border-radius:6px;padding:3px 9px;font-weight:900;cursor:pointer;">＋ 大きく</button>
                <button type="button" id="v31-scale-all-down" style="background:#1e293b;color:#cbd5e1;border:1px solid #475569;border-radius:6px;padding:3px 7px;font-size:10px;cursor:pointer;">全体縮小</button>
                <button type="button" id="v31-scale-all-up" style="background:#1e293b;color:#cbd5e1;border:1px solid #475569;border-radius:6px;padding:3px 7px;font-size:10px;cursor:pointer;">全体拡大</button>
                <button type="button" id="v31-layout-reset" style="background:#7f1d1d;color:#fecaca;border:1px solid #f87171;border-radius:6px;padding:3px 8px;font-weight:900;cursor:pointer;">↺ リセット</button>
                <button type="button" id="v31-layout-done" style="background:#059669;color:#fff;border:1px solid #6ee7b7;border-radius:6px;padding:3px 10px;font-weight:900;cursor:pointer;">✅ 完了</button>
            </div>
            <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:4px;">${chipsHtml}</div>
        `;

        bar.querySelectorAll('.v35-sel-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                this._uiSelectedKeyV31 = chip.getAttribute('data-key');
                this.applySavedUILayoutV31();
                this.renderUICustomToolbarV31();
            });
        });

        const adjustOne = (delta) => {
            if (!selItem) return;
            const l = this.loadCustomUILayoutV31();
            const prev = l[selItem.key] || {};
            const nextScale = Math.max(0.55, Math.min(1.65, Number(((prev.scale ?? defScale) + delta).toFixed(2))));
            l[selItem.key] = { ...prev, scale: nextScale };
            this.saveCustomUILayoutV31(l);
            this.applySavedUILayoutV31();
            this.renderUICustomToolbarV31();
        };

        const adjustAll = (delta) => {
            const l = this.loadCustomUILayoutV31();
            items.forEach(it => {
                const prev = l[it.key] || {};
                const nextScale = Math.max(0.55, Math.min(1.65, Number(((prev.scale ?? defScale) + delta).toFixed(2))));
                l[it.key] = { ...prev, scale: nextScale };
            });
            this.saveCustomUILayoutV31(l);
            this.applySavedUILayoutV31();
            this.renderUICustomToolbarV31();
        };

        document.getElementById('v31-scale-down')?.addEventListener('click', () => adjustOne(-0.1));
        document.getElementById('v31-scale-up')?.addEventListener('click', () => adjustOne(0.1));
        document.getElementById('v31-scale-all-down')?.addEventListener('click', () => adjustAll(-0.1));
        document.getElementById('v31-scale-all-up')?.addEventListener('click', () => adjustAll(0.1));

        document.getElementById('v31-layout-reset')?.addEventListener('click', () => {
            localStorage.removeItem('kmj_custom_ui_layout_v31');
            items.forEach(({ el }) => {
                ['left', 'top', 'right', 'bottom', 'margin'].forEach(p => el.style.removeProperty(p));
            });
            this.applySavedUILayoutV31();
            this.renderUICustomToolbarV31();
            this.showAlertBanner?.('↺ ボタン位置とサイズを初期値に戻しました', 1400);
        });

        document.getElementById('v31-layout-done')?.addEventListener('click', () => this.toggleUIEditModeV31(false));
    };

    // 10.5 歯車（⚙）設定ドロップダウン内に「🎛️ ボタン配置・サイズ」を挿入
    P.injectSettingsDropdownItemV33 = function () {
        const existingBtn = document.getElementById('kmj-btn-ui-edit-settings');
        if (existingBtn && document.body.contains(existingBtn)) return;

        const allButtons = Array.from(document.querySelectorAll('button, [role="button"]'));
        const bgmBtn = allButtons.find(b => /BGM\s*:\s*(ON|OFF)/i.test(b.textContent || ''));
        const saveBtn = allButtons.find(b => /手動セーブ/.test(b.textContent || ''));
        const titleBtn = allButtons.find(b => /タイトル画面へ戻る/.test(b.textContent || ''));
        const resetBtn = allButtons.find(b => /完全データ初期化/.test(b.textContent || ''));

        const anchorBtn = bgmBtn || saveBtn || titleBtn || resetBtn;
        if (!anchorBtn || !anchorBtn.parentElement) return;

        const menuContainer = anchorBtn.parentElement;
        if (menuContainer.querySelector('#kmj-btn-ui-edit-settings')) return;

        const itemBtn = document.createElement('button');
        itemBtn.id = 'kmj-btn-ui-edit-settings';
        itemBtn.type = 'button';
        itemBtn.className = anchorBtn.className || 'btn-ui';
        itemBtn.textContent = '🎛️ ボタン配置・サイズ';
        itemBtn.style.cssText = 'width:100%;background:linear-gradient(180deg,#0ea5e9,#0369a1);border:1px solid #7dd3fc;color:#fff;font-weight:900;border-radius:8px;padding:7px 10px;font-size:12px;cursor:pointer;margin-top:4px;margin-bottom:2px;display:block;text-align:center;';

        itemBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            sfx?.init?.();
            const gearBtn = allButtons.find(b => {
                if (b === itemBtn) return false;
                const r = b.getBoundingClientRect();
                return r.top < 120 && r.right > window.innerWidth - 120 && (/⚙/.test(b.textContent || '') || /setting|gear|menu/i.test(`${b.id} ${b.className}`));
            });
            if (gearBtn) gearBtn.click();
            else menuContainer.style.display = 'none';
            setTimeout(() => this.toggleUIEditModeV31(true), 60);
        });

        if (bgmBtn && bgmBtn.nextSibling) menuContainer.insertBefore(itemBtn, bgmBtn.nextSibling);
        else if (titleBtn) menuContainer.insertBefore(itemBtn, titleBtn);
        else menuContainer.appendChild(itemBtn);
    };

    // 10.8 スキル設定画面で「枠1〜枠5 使用状況」を可視化
    P.getEquippedSkillSlotsInfoV35 = function () {
        const d = this.saveData || {};
        const skillList = typeof SKILLS !== 'undefined' && SKILLS ? (Array.isArray(SKILLS) ? SKILLS : Object.values(SKILLS)) : [];
        const skillMap = typeof SKILLS !== 'undefined' && SKILLS && !Array.isArray(SKILLS) ? SKILLS : {};
        const rawArr = Array.isArray(d.equippedSkills) ? d.equippedSkills
            : (Array.isArray(d.skillSlots) ? d.skillSlots : (Array.isArray(d.activeSkills) ? d.activeSkills : []));

        const slots = [];
        for (let i = 0; i < 5; i++) {
            const meta = this.resolveSkillMeta ? this.resolveSkillMeta(i) : null;
            let rawId = rawArr[i] ?? d.equippedSkills?.[i] ?? d.skillSlots?.[i] ?? d.equippedSkills?.[`slot_${i}`] ?? meta?.skillId ?? '';
            if (rawId && typeof rawId === 'object') rawId = rawId.id || rawId.skillId || '';
            const sId = String(rawId || '');
            const skObj = sId ? (skillMap[sId] || skillList.find(s => s && String(s.id || s.skillId || '') === sId) || null) : null;
            const name = skObj?.name || skObj?.title || meta?.skillName || meta?.name || sId;
            const icon = skObj?.icon || skObj?.emoji || '✨';
            const lv = sId ? this.getExactSkillLevelV26(sId, i, skObj) : 0;
            slots.push({ slotIdx: i, slotLabel: `枠${i + 1}`, skillId: sId, name: String(name || ''), icon: String(icon), lv, isUsed: Boolean(sId && name) });
        }
        return slots;
    };

    P.enhanceSkillSlotVisibilityV35 = function () {
        const body = document.getElementById('modal-body');
        if (!body) return;
        const isSkillScreen = /skill|スキル/i.test(`${this.activeTab || ''} ${document.getElementById('modal-title')?.textContent || ''}`);
        if (!isSkillScreen) return;

        const slots = this.getEquippedSkillSlotsInfoV35();
        const usedCount = slots.filter(s => s.isUsed).length;

        let overview = document.getElementById('kmj-skill-slots-overview-v35');
        if (!overview) {
            overview = document.createElement('div');
            overview.id = 'kmj-skill-slots-overview-v35';
            overview.style.cssText = 'background:rgba(15,23,42,0.92);border:1.5px solid #38bdf8;border-radius:10px;padding:8px 10px;margin-bottom:10px;';
            body.prepend(overview);
        }

        overview.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                <span style="font-size:11px;font-weight:900;color:#7dd3fc;">🎮 現在のスキル枠 使用状況</span>
                <span style="font-size:10px;font-weight:900;color:#fde047;">使用中: ${usedCount} / 5枠（空き ${5 - usedCount}枠）</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(88px,1fr));gap:5px;">
                ${slots.map(s => s.isUsed ? `
                    <div class="v35-slot-overview-card" data-skill-name="${s.name}" style="background:linear-gradient(180deg,rgba(14,165,233,0.24),rgba(30,58,138,0.45));border:1.5px solid #fde047;border-radius:8px;padding:5px 6px;cursor:pointer;">
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px;">
                            <span style="background:#eab308;color:#0f172a;font-size:9px;font-weight:900;border-radius:4px;padding:0 5px;">${s.slotLabel}</span>
                            <span style="font-size:9px;font-weight:900;color:#6ee7b7;">✅ 使用中</span>
                        </div>
                        <div style="font-size:10px;font-weight:900;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${s.icon} ${s.name}</div>
                        <div style="font-size:9px;color:#fde047;font-weight:700;">Lv.${s.lv}</div>
                    </div>` : `
                    <div style="background:rgba(30,41,59,0.55);border:1px dashed #64748b;border-radius:8px;padding:5px 6px;">
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px;">
                            <span style="background:#334155;color:#cbd5e1;font-size:9px;font-weight:900;border-radius:4px;padding:0 5px;">${s.slotLabel}</span>
                            <span style="font-size:9px;color:#94a3b8;">空き</span>
                        </div>
                        <div style="font-size:10px;color:#64748b;font-weight:700;">（未セット）</div>
                        <div style="font-size:9px;color:transparent;">-</div>
                    </div>`).join('')}
            </div>
        `;

        const skillList = typeof SKILLS !== 'undefined' && SKILLS ? (Array.isArray(SKILLS) ? SKILLS : Object.values(SKILLS)) : [];
        const allSkillNames = skillList.map(s => String(s?.name || s?.title || '')).filter(Boolean);
        const nameToSlots = new Map();
        slots.forEach(s => {
            if (!s.isUsed) return;
            if (!nameToSlots.has(s.name)) nameToSlots.set(s.name, []);
            nameToSlots.get(s.name).push(s.slotLabel);
        });

        const cardCandidates = Array.from(body.querySelectorAll('div')).filter(el => {
            if (el === overview || overview.contains(el)) return false;
            const txt = el.textContent || '';
            if (txt.length < 6 || txt.length > 360) return false;
            const matched = allSkillNames.filter(n => txt.includes(n));
            if (matched.length !== 1) return false;
            return !Array.from(el.children).some(ch => (ch.textContent || '').includes(matched[0]) && ch.querySelector('button'));
        });

        cardCandidates.forEach(card => {
            const matchedName = allSkillNames.find(n => (card.textContent || '').includes(n));
            if (!matchedName) return;
            const assignedSlots = nameToSlots.get(matchedName) || [];
            let badge = card.querySelector('.v35-skill-equip-badge');
            if (!badge) {
                badge = document.createElement('div');
                badge.className = 'v35-skill-equip-badge';
                card.prepend(badge);
            }
            if (assignedSlots.length > 0) {
                card.style.setProperty('border', '1.5px solid #fde047', 'important');
                card.style.setProperty('background', 'rgba(234, 179, 8, 0.10)', 'important');
                badge.style.cssText = 'display:inline-block;background:linear-gradient(90deg,#eab308,#f59e0b);color:#0f172a;font-size:10px;font-weight:900;border-radius:5px;padding:1px 7px;margin-bottom:4px;';
                badge.textContent = `🎯 ${assignedSlots.join('・')} にセット中`;
            } else {
                card.style.removeProperty('border');
                card.style.removeProperty('background');
                badge.style.cssText = 'display:inline-block;background:rgba(51,65,85,0.75);color:#94a3b8;font-size:9px;font-weight:700;border-radius:5px;padding:1px 6px;margin-bottom:4px;';
                badge.textContent = '未装備';
            }
        });

        body.querySelectorAll('button').forEach(btn => {
            if (overview.contains(btn)) return;
            const rawTxt = (btn.dataset.v35OrigSlotLabel || btn.textContent || '').trim();
            const m = rawTxt.match(/^(?:スロット|枠)\s*([1-5])$/);
            if (!m) return;
            if (!btn.dataset.v35OrigSlotLabel) btn.dataset.v35OrigSlotLabel = rawTxt;
            const info = slots[Number(m[1]) - 1];
            if (info && info.isUsed) {
                btn.textContent = `${rawTxt} [使用中:${info.name}]`;
                btn.style.setProperty('border-color', '#fde047', 'important');
            } else {
                btn.textContent = `${rawTxt} [空き]`;
            }
        });

        overview.querySelectorAll('.v35-slot-overview-card').forEach(c => {
            c.addEventListener('click', () => {
                const targetName = c.getAttribute('data-skill-name');
                const targetCard = cardCandidates.find(el => (el.textContent || '').includes(targetName));
                if (targetCard) {
                    targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    targetCard.style.setProperty('outline', '2px solid #38bdf8', 'important');
                    setTimeout(() => targetCard.style.removeProperty('outline'), 1000);
                }
            });
        });

        if (!body.dataset.v35SkillClickHook) {
            body.dataset.v35SkillClickHook = '1';
            body.addEventListener('click', (e) => {
                if (e.target.closest?.('button')) {
                    setTimeout(() => this.enhanceSkillSlotVisibilityV35(), 80);
                }
            });
        }
    };

    // 11. 💢 挑発機能
    P.triggerTauntAllEnemies = function () {
        if (!this.player || !this.player.pos) return;
        const now = performance.now();
        if (!this._debugInfiniteMode && this._tauntNextAllowedTs && now < this._tauntNextAllowedTs) {
            const rem = ((this._tauntNextAllowedTs - now) / 1000).toFixed(1);
            this.showAlertBanner?.(`💢 挑発クールダウン中（あと ${rem}秒）`, 1100);
            return;
        }
        this._tauntNextAllowedTs = now + 4500;
        sfx?.init?.();

        let pulledCount = 0;
        if (Array.isArray(this.monsters)) {
            this.monsters.forEach(m => {
                if (!m || m.dead || !m.pos) return;
                m._tauntedTimer = 12.0;
                m.target = this.player;
                m.aggroTarget = this.player;
                m.targetId = this.player.id || this.player.uid || 'player';
                if ('state' in m) m.state = 'chase';
                if ('aggro' in m) m.aggro = true;
                if ('aggroRange' in m) m.aggroRange = Math.max(Number(m.aggroRange) || 10, 999);
                pulledCount++;
            });
        }

        if (this.useWebGL && this.scene && typeof THREE !== 'undefined') {
            if (!this._slashEffects) this._slashEffects = [];
            for (let i = 0; i < 2; i++) {
                const tMat = new THREE.MeshBasicMaterial({ color: i === 0 ? 0xef4444 : 0xfacc15, side: THREE.DoubleSide, transparent: true, opacity: 0.95 });
                const tRing = new THREE.Mesh(new THREE.RingGeometry(0.6 + i * 0.5, 1.4 + i * 0.7, 32), tMat);
                tRing.rotation.x = -Math.PI / 2;
                tRing.position.set(this.player.pos.x, 0.22 + i * 0.08, this.player.pos.z);
                this.scene.add(tRing);
                this._slashEffects.push({ kind: 'shockwave', mesh: tRing, mat: tMat, life: 0.65, maxLife: 0.65 });
            }
        }

        this.spawnFloatingText?.(this.player.pos, '💢 挑発！全員かかってこい！', '#f87171');
        this.showAlertBanner?.(`💢 挑発発動！マップ内の敵 ${pulledCount}体 全員を引きつけました！`, 1800);
    };

    P.updateTauntAggroLoop = function (dt) {
        if (!this.player || !this.player.pos || !Array.isArray(this.monsters)) return;
        const px = this.player.pos.x, pz = this.player.pos.z;
        this.monsters.forEach(m => {
            if (!m || m.dead || !m.pos || !m._tauntedTimer || m._tauntedTimer <= 0) return;
            m._tauntedTimer = Math.max(0, m._tauntedTimer - dt);
            m.target = this.player;
            m.aggroTarget = this.player;
            const dx = px - m.pos.x, dz = pz - m.pos.z;
            const dist = Math.hypot(dx, dz);
            if (dist > 2.2) {
                const spd = Math.max(4.8, Number(m.speed || m.moveSpeed || 5.2));
                m.pos.x += (dx / dist) * spd * dt;
                m.pos.z += (dz / dist) * spd * dt;
                m.rotY = Math.atan2(dx, dz);
                const g = m.group || m.mesh;
                if (g) { g.position.x = m.pos.x; g.position.z = m.pos.z; g.rotation.y = m.rotY; }
            }
        });
    };

    P.injectTauntButtonUI = function () {
        this.fixChatCompactLayoutV31();
        this.ensureStandardMoveStickV33();
        this.injectSettingsDropdownItemV33();

        const nativeTaunt = Array.from(document.querySelectorAll('button')).find(b => b.id !== 'kmj-btn-taunt-v26' && /挑発/.test(b.textContent || ''));
        if (nativeTaunt) {
            document.getElementById('kmj-btn-taunt-v26')?.remove();
            if (!nativeTaunt.dataset.v31TauntHook) {
                nativeTaunt.dataset.v31TauntHook = '1';
                nativeTaunt.addEventListener('click', () => { if (!this._uiEditModeV31) this.triggerTauntAllEnemies(); });
            }
        } else if (!document.getElementById('kmj-btn-taunt-v26')) {
            const btn = document.createElement('button');
            btn.id = 'kmj-btn-taunt-v26';
            btn.type = 'button';
            btn.innerHTML = '💢<br><span style="font-size:10px;">挑発</span>';
            btn.style.cssText = 'position:fixed;right:226px;bottom:18px;z-index:86;width:52px;height:52px;border-radius:50%;background:radial-gradient(circle at 30% 30%,#ef4444,#991b1b);color:#fff;border:2px solid #fca5a5;font-size:13px;font-weight:900;line-height:1.05;box-shadow:0 3px 10px rgba(0,0,0,0.6);cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;';
            btn.addEventListener('click', () => { if (!this._uiEditModeV31) this.triggerTauntAllEnemies(); });
            document.body.appendChild(btn);
        }

        this.applySavedUILayoutV31();
    };

    // 12. 隠しデバッグコンソール＆フック
    P.collectAllMaterialIdsV24 = function () {
        const ids = new Set();
        const d = this.saveData || {};
        ['materials', 'items', 'inventory', 'bag', 'ores', 'stones', 'crystals', 'drops', 'consumables'].forEach(bk => {
            const bag = d[bk];
            if (!bag || typeof bag !== 'object') return;
            if (Array.isArray(bag)) bag.forEach(e => { if (e && (e.id || e.itemId)) ids.add(String(e.id || e.itemId)); });
            else Object.keys(bag).forEach(k => ids.add(String(k)));
        });
        [typeof MATERIALS !== 'undefined' ? MATERIALS : null, typeof ITEMS !== 'undefined' ? ITEMS : null].forEach(mObj => {
            if (!mObj || typeof mObj !== 'object') return;
            if (Array.isArray(mObj)) mObj.forEach((v, i) => { if (v) ids.add(String(v.id || v.itemId || i)); });
            else Object.keys(mObj).forEach(k => ids.add(String(k)));
        });
        [typeof RECIPES !== 'undefined' ? RECIPES : null, typeof CRAFT_RECIPES !== 'undefined' ? CRAFT_RECIPES : null,
         typeof SMITH_RECIPES !== 'undefined' ? SMITH_RECIPES : null, typeof WEAPONS !== 'undefined' ? WEAPONS : null,
         typeof ARMORS !== 'undefined' ? ARMORS : null].forEach(src => {
            if (!src || typeof src !== 'object') return;
            (Array.isArray(src) ? src : Object.values(src)).forEach(entry => {
                const reqs = entry?.materials || entry?.reqMaterials || entry?.recipe || entry?.costItems || entry?.ingredients || entry?.mats;
                if (!reqs || typeof reqs !== 'object') return;
                if (Array.isArray(reqs)) reqs.forEach(r => { if (typeof r === 'string') ids.add(r); else if (r && (r.id || r.itemId || r.matId)) ids.add(String(r.id || r.itemId || r.matId)); });
                else Object.keys(reqs).forEach(k => ids.add(String(k)));
            });
        });
        return [...ids].filter(Boolean);
    };

    P.captureDebugSnapshot = function () {
        if (this._debugBackupSnapshot || !this.saveData) return;
        try {
            const d = this.saveData;
            this._debugBackupSnapshot = {
                gold: d.gold, coins: d.coins, money: d.money, gem: d.gem, gems: d.gems, diamond: d.diamond, diamonds: d.diamonds,
                ap: d.ap, sp: d.sp, statPoints: d.statPoints, skillPoints: d.skillPoints, abilityPoints: d.abilityPoints,
                attributePoints: d.attributePoints, points: d.points, evoPoints: d.evoPoints, soulPoints: d.soulPoints,
                upgradeStones: d.upgradeStones, smithStones: d.smithStones, enhanceStones: d.enhanceStones, maxMp: d.maxMp, mp: d.mp,
                materials: d.materials ? JSON.parse(JSON.stringify(d.materials)) : null,
                items: d.items ? JSON.parse(JSON.stringify(d.items)) : null,
                inventory: d.inventory ? JSON.parse(JSON.stringify(d.inventory)) : null,
                bag: d.bag ? JSON.parse(JSON.stringify(d.bag)) : null,
                ores: d.ores ? JSON.parse(JSON.stringify(d.ores)) : null,
                stones: d.stones ? JSON.parse(JSON.stringify(d.stones)) : null
            };
        } catch (e) {}
    };

    P.restoreDebugSnapshot = function () {
        const snap = this._debugBackupSnapshot, d = this.saveData;
        if (!snap || !d) return;
        ['gold', 'coins', 'money', 'gem', 'gems', 'diamond', 'diamonds', 'ap', 'sp', 'statPoints', 'skillPoints',
         'abilityPoints', 'attributePoints', 'points', 'evoPoints', 'soulPoints', 'upgradeStones', 'smithStones',
         'enhanceStones', 'maxMp', 'mp'].forEach(k => { if (snap[k] !== undefined) d[k] = snap[k]; else delete d[k]; });
        ['materials', 'items', 'inventory', 'bag', 'ores', 'stones'].forEach(bk => { if (snap[bk] != null) d[bk] = snap[bk]; });
        if (this.player) {
            this.player.maxMp = Number(d.maxMp) || 100;
            this.player.mp = Math.min(this.player.maxMp, Number(d.mp) || this.player.maxMp);
        }
        this._debugBackupSnapshot = null;
    };

    P.updateDebugQuickExitBadge = function () {
        let badge = document.getElementById('kmj-debug-quick-exit');
        if (!this._debugInfiniteMode) { badge?.remove(); return; }
        if (!badge) {
            badge = document.createElement('button');
            badge.id = 'kmj-debug-quick-exit';
            badge.type = 'button';
            badge.textContent = '🛠️ DEBUG解除';
            badge.style.cssText = 'position:fixed;top:6px;left:50%;transform:translateX(-50%);z-index:94;background:rgba(159,18,57,0.92);color:#ffe4e6;border:1px solid #fda4af;border-radius:999px;padding:3px 10px;font-size:10px;font-weight:900;box-shadow:0 2px 10px rgba(0,0,0,0.6);cursor:pointer;';
            badge.addEventListener('click', (e) => { e.stopPropagation(); sfx?.init?.(); this.disableDebugInfiniteMode(); });
            document.body.appendChild(badge);
        }
    };

    P.disableDebugInfiniteMode = function () {
        this._debugInfiniteMode = false;
        this.restoreDebugSnapshot();
        this.updateDebugQuickExitBadge();
        document.getElementById('kmj-secret-debug-modal')?.remove();
        this.saveGame?.(false);
        this.refreshAllHUD?.();
        if (this.isModalOpen) this.renderModalContent?.();
        this.showAlertBanner?.('📴 デバッグモードを解除し、通常の状態に戻しました', 1800);
    };

    P.maintainInfiniteResources = function () {
        if (!this._debugInfiniteMode || !this.saveData) return;
        const d = this.saveData;
        ['gold', 'coins', 'money', 'gem', 'gems', 'diamond', 'diamonds', 'ap', 'sp', 'statPoints', 'skillPoints',
         'abilityPoints', 'attributePoints', 'points', 'evoPoints', 'soulPoints', 'upgradeStones', 'smithStones',
         'enhanceStones'].forEach(k => { if ((Number(d[k]) || 0) < 999999) d[k] = 999999; });

        const allMatIds = this.collectAllMaterialIdsV24();
        if (!d.materials || typeof d.materials !== 'object') d.materials = {};
        if (!d.items || typeof d.items !== 'object') d.items = {};

        ['materials', 'items', 'inventory', 'bag', 'ores', 'stones', 'crystals', 'drops'].forEach(bk => {
            const bag = d[bk];
            if (!bag || typeof bag !== 'object') return;
            if (Array.isArray(bag)) {
                bag.forEach(entry => {
                    if (!entry || typeof entry !== 'object') return;
                    ['count', 'qty', 'num', 'amount'].forEach(ck => { if (typeof entry[ck] === 'number' && entry[ck] < 99999) entry[ck] = 99999; });
                });
            } else {
                allMatIds.forEach(id => {
                    if (typeof bag[id] === 'object' && bag[id] !== null) {
                        ['count', 'qty', 'num', 'amount'].forEach(ck => { if (typeof bag[id][ck] === 'number' && bag[id][ck] < 99999) bag[id][ck] = 99999; });
                    } else if ((Number(bag[id]) || 0) < 99999) bag[id] = 99999;
                });
            }
        });

        const maxMp = Math.max(99999, Number(d.maxMp) || 100);
        if ((Number(d.mp) || 0) < maxMp) d.mp = maxMp;
        if (this.player) {
            if ((Number(this.player.maxMp) || 0) < maxMp) this.player.maxMp = maxMp;
            if ((Number(this.player.mp) || 0) < this.player.maxMp) this.player.mp = this.player.maxMp;
        }
    };

    P.forceSyncVisualLevelsV24 = function () {
        this.enforce999CapsV27?.();
        const d = this.saveData || {};
        const curLv = Math.min(MAX_LEVEL_CAP_V27, Math.max(1, Number(d.lv ?? d.level ?? 1) || 1));
        d.lv = d.level = curLv;
        if (this.player) this.player.lv = this.player.level = curLv;

        ['#hud-lv', '#hud-player-lv', '#player-lv', '#player-level', '#status-lv', '#modal-lv', '.hud-lv', '.player-lv'].forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
                if (el.children.length === 0) el.textContent = /lv/i.test(el.textContent) ? `Lv.${curLv}` : String(curLv);
            });
        });

        this.purgeRebirthUIV27?.();
        this.fixChatCompactLayoutV31?.();
        this.ensureStandardMoveStickV33?.();
        this.injectSettingsDropdownItemV33?.();
        this.applySavedUILayoutV31?.();
        this.syncSkillDescriptionsAndEffects?.();
        this.syncSkillMpCostsV22?.();
        this.syncSkillSlotButtonsUI?.();
        this.refreshAllHUD?.();
        if (this.isModalOpen) {
            this.renderModalContent?.();
            this.enhanceSkillSlotVisibilityV35?.();
        }
        this.syncFirebaseNow?.(false);
    };

    P.setPlayerLevelDebug = function (targetLv) {
        const d = this.saveData || {};
        const lv = Math.min(MAX_LEVEL_CAP_V27, Math.max(1, Number(targetLv) || 1));
        d.lv = d.level = lv;
        if (lv === 1) d.exp = 0;
        if (this.player) {
            this.player.lv = this.player.level = lv;
            const st = this.getPlayerStats?.();
            if (st) {
                if (st.maxHp) this.player.maxHp = this.player.hp = st.maxHp;
                if (st.maxMp) this.player.maxMp = this.player.mp = st.maxMp;
            }
        }
        this.maintainInfiniteResources?.();
        this.saveGame?.(false);
        this.forceSyncVisualLevelsV24();
        this.showAlertBanner?.(`🆙 [DEBUG] キャラLvを Lv.${lv} に変更しました！`, 1800);
    };

    P.setThreatLevelDebug = function (targetThreat) {
        const d = this.saveData || {};
        const val = Math.min(MAX_THREAT_CAP_V27, Math.max(0, Number(targetThreat) || 0));
        ['threat', 'threatLevel', 'threatLv', 'danger', 'dangerLevel', 'worldThreat', 'areaThreat'].forEach(tk => {
            d[tk] = val;
            if (tk in this) this[tk] = val;
        });
        this.saveGame?.(false);
        this.forceSyncVisualLevelsV24();
        this.showAlertBanner?.(`☠️ [DEBUG] 驚異度を ${val}（上限999）に設定しました！`, 1800);
    };

    P.resetAllSkillsLevelDebug = function () {
        const d = this.saveData || {};
        if (!d.skillLevels || typeof d.skillLevels !== 'object') d.skillLevels = {};
        if (!d.skillLvs || typeof d.skillLvs !== 'object') d.skillLvs = {};
        if (!d.skills || typeof d.skills !== 'object') d.skills = {};

        const allIds = new Set();
        if (typeof SKILLS !== 'undefined' && SKILLS) {
            const entries = Array.isArray(SKILLS) ? SKILLS.map((v, i) => [v?.id || v?.skillId || `slot_${i}`, v]) : Object.entries(SKILLS);
            entries.forEach(([key, sk], idx) => {
                if (!sk || typeof sk !== 'object') return;
                allIds.add(String(sk.id || sk.skillId || key || `slot_${idx}`));
                allIds.add(String(key));
                if ('lv' in sk) sk.lv = 1;
                if ('level' in sk) sk.level = 1;
            });
        }
        [d.equippedSkills, d.skillSlots, d.activeSkills, Object.keys(d.skillLevels), Object.keys(d.skillLvs)].forEach(arr => {
            if (Array.isArray(arr)) arr.forEach(id => { if (id) allIds.add(String(id)); });
        });
        for (let i = 0; i < 16; i++) { allIds.add(`slot_${i}`); allIds.add(`sk_${i}`); allIds.add(`skill_${i}`); }

        allIds.forEach(id => {
            d.skillLevels[id] = d.skillLvs[id] = 1;
            if (typeof d.skills[id] === 'object' && d.skills[id] !== null) d.skills[id].lv = d.skills[id].level = 1;
            else d.skills[id] = 1;
        });

        this.maintainInfiniteResources?.();
        this.saveGame?.(false);
        this.forceSyncVisualLevelsV24();
        this.showAlertBanner?.('↺ [DEBUG] 全スキルを Lv.1 にリセットしました！', 1800);
    };

    P.resetLevelsToBaseDebug = function () {
        const d = this.saveData || {};
        d.lv = d.level = 1;
        d.exp = d.weaponEnhance = d.armorEnhance = 0;
        if (this.player) this.player.lv = this.player.level = 1;
        this.setThreatLevelDebug(1);
        this.resetAllSkillsLevelDebug();
        this.buildPlayerEntity?.();
        if (this.player) this.enforceStrictWeaponVisualV27?.(this.player);
        this.saveGame?.(false);
        this.forceSyncVisualLevelsV24();
        this.showAlertBanner?.('↺ [DEBUG] キャラLv・驚異度・全スキルLv・装備強化を初期状態にリセットしました！', 2200);
    };

    P.getAllAvailableRolesV26 = function () {
        const roles = [];
        const seen = new Set();
        const addRole = (id, label, icon) => {
            const key = String(id ?? '');
            if (seen.has(key)) return;
            seen.add(key);
            roles.push({ id: key, label: String(label || key || '見習い冒険者'), icon: icon || '🎭' });
        };
        addRole('', '見習い冒険者（初期）', '🗡️');
        if (typeof EVOLUTIONS !== 'undefined' && EVOLUTIONS) {
            const entries = Array.isArray(EVOLUTIONS) ? EVOLUTIONS.map((v, i) => [v?.id ?? String(i), v]) : Object.entries(EVOLUTIONS);
            entries.forEach(([k, v]) => {
                if (!v) return;
                const rId = String(v.id ?? k);
                const rName = String(v.name || v.title || rId);
                const isM = /mage|wizard|sorcerer|witch|sage|caster|priest|cleric|bishop|魔道|魔導|魔法|賢者|術師|メイジ|ウィザード|司祭/.test(`${rId} ${rName}`.toLowerCase());
                addRole(rId, rName, isM ? '🪄' : '⚔️');
            });
        }
        if (roles.length <= 1) {
            addRole('warrior', '剣士・戦士', '⚔️');
            addRole('mage', '魔道士（杖＆魔法攻撃）', '🪄');
            addRole('paladin', '聖騎士', '🛡️');
            addRole('archmage', '大賢者（上級魔道士）', '🔮');
        }
        return roles;
    };

    P.changePlayerRoleDebug = function (roleId, roleLabel = '') {
        const d = this.saveData || {};
        const targetId = String(roleId ?? '');
        ['evolutionId', 'evolution', 'evoId', 'evo', 'jobId', 'job', 'classId', 'class', 'role'].forEach(k => { d[k] = targetId; });
        if (this.player) this.player.evolutionId = this.player.job = this.player.classId = targetId;
        this.syncMageWeaponNamesV22?.();
        this.buildPlayerEntity?.();
        if (this.player) this.enforceStrictWeaponVisualV27?.(this.player, targetId);
        this.saveGame?.(false);
        this.forceSyncVisualLevelsV24();
        const wpnNote = this.isMageEvolution(targetId) ? '（武器：杖のみ・通常攻撃が魔法化）' : '（武器：剣のみ）';
        this.showAlertBanner?.(`🎭 [DEBUG] 役職を「${roleLabel || targetId || '見習い冒険者'}」に変更しました！${wpnNote}`, 2200);
    };

    P.applyDebugStatusToMonsters = function (stType) {
        if (!Array.isArray(this.monsters)) return;
        let count = 0;
        this.monsters.forEach(m => {
            if (!m || m.dead) return;
            if (!stType) {
                m._visualStatus = null;
                m.burnTimer = m.freezeTimer = m.poisonTimer = m.stun = 0;
                count++;
                return;
            }
            m._visualStatus = { type: stType, timer: 8.0 };
            if (stType === 'burn') m.burnTimer = 8.0;
            if (stType === 'freeze') m.freezeTimer = 8.0;
            if (stType === 'poison') m.poisonTimer = 8.0;
            if (stType === 'shock') m.stun = 8.0;
            count++;
        });
        const labelMap = { burn: '🔥炎上', freeze: '❄️凍結', poison: '☠️毒', shock: '⚡麻痺' };
        this.showAlertBanner?.(!stType ? `✨ [DEBUG] 周囲の敵 ${count}体 の状態異常を解除しました！` : `🛠️ [DEBUG] 周囲の敵 ${count}体 を「${labelMap[stType] || stType}」状態にしました！`, 1800);
    };

    P.activateDebugModeV24 = function () {
        this._debugUnlocked = true;
        this.captureDebugSnapshot();
        this._debugInfiniteMode = true;
        this.maintainInfiniteResources();
        this.updateDebugQuickExitBadge();
        this.forceSyncVisualLevelsV24();
    };

    P.openSecretDebugModal = function () {
        this.activateDebugModeV24();
        document.getElementById('kmj-secret-debug-modal')?.remove();

        const roles = this.getAllAvailableRolesV26();
        const curEvoId = String(this.saveData?.evolutionId ?? this.saveData?.jobId ?? '');
        const roleBtnsHtml = roles.map(r => {
            const active = (r.id === curEvoId);
            const border = active ? 'border:2px solid #fde047;background:#1e3a8a;' : 'border:1px solid #475569;background:#1e293b;';
            return `<button type="button" class="btn-ui dbg-role-btn" data-role-id="${r.id}" data-role-label="${r.label}" style="font-size:10px;padding:6px 8px;text-align:left;cursor:pointer;${border}">${r.icon} ${r.label}${active ? '【現在】' : ''}</button>`;
        }).join('');

        const modal = document.createElement('div');
        modal.id = 'kmj-secret-debug-modal';
        modal.style.cssText = 'position:fixed;inset:0;z-index:99;background:rgba(2,6,23,0.88);display:flex;align-items:center;justify-content:center;padding:16px;';
        modal.innerHTML = `
            <div style="width:min(420px,95vw);background:#0f172a;border:2px solid #f43f5e;border-radius:14px;padding:14px;box-shadow:0 0 32px rgba(244,63,94,0.55);color:#fff;max-height:88vh;overflow-y:auto;">
                <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #334155;padding-bottom:8px;margin-bottom:10px;">
                    <span style="font-size:14px;font-weight:900;color:#fda4af;">🛠️ SECRET DEBUG CONSOLE</span>
                    <button type="button" id="btn-close-secret-debug" style="background:#334155;border:none;color:#fff;border-radius:6px;padding:4px 10px;font-weight:900;cursor:pointer;">✕ 閉じる</button>
                </div>
                <div style="background:rgba(16,185,129,0.16);border:1px solid #10b981;border-radius:8px;padding:8px 10px;margin-bottom:10px;">
                    <div style="font-size:11px;font-weight:900;color:#6ee7b7;margin-bottom:4px;">♾️ AP・SP・G・全素材・MP 無限モード稼働中</div>
                    <div style="font-size:10px;color:#cbd5e1;margin-bottom:6px;">解除すると無限化が止まり、起動前の元の数値に戻ります。</div>
                    <button type="button" id="dbg-exit-restore" class="btn-ui" style="width:100%;background:#be123c;border:1px solid #fda4af;font-size:11px;padding:6px;font-weight:900;">📴 デバッグモードを解除して通常の状態に戻す</button>
                </div>
                <div style="font-size:11px;font-weight:900;color:#c084fc;margin-bottom:5px;">🎭 役職・職業 自由再設定（何度でも即転職＆武器切替）</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:10px;">${roleBtnsHtml}</div>
                <div style="font-size:11px;font-weight:900;color:#38bdf8;margin-bottom:5px;">🆙 キャラLv 変更（上限 Lv.999）</div>
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-bottom:10px;">
                    <button type="button" id="dbg-plv-100" class="btn-ui btn-sky" style="font-size:10px;padding:6px;">Lv.100</button>
                    <button type="button" id="dbg-plv-500" class="btn-ui btn-amber" style="font-size:10px;padding:6px;">Lv.500</button>
                    <button type="button" id="dbg-plv-999" class="btn-ui btn-emerald" style="font-size:10px;padding:6px;">Lv.999</button>
                    <button type="button" id="dbg-plv-1" class="btn-ui" style="font-size:10px;padding:6px;background:#1e293b;">↺ Lv.1</button>
                </div>
                <div style="font-size:11px;font-weight:900;color:#fb7185;margin-bottom:5px;">☠️ 驚異度 変更（上限 999）</div>
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-bottom:10px;">
                    <button type="button" id="dbg-thr-100" class="btn-ui btn-sky" style="font-size:10px;padding:6px;">驚異100</button>
                    <button type="button" id="dbg-thr-500" class="btn-ui btn-amber" style="font-size:10px;padding:6px;">驚異500</button>
                    <button type="button" id="dbg-thr-999" class="btn-ui" style="background:#be123c;font-size:10px;padding:6px;">驚異999</button>
                    <button type="button" id="dbg-thr-1" class="btn-ui" style="font-size:10px;padding:6px;background:#1e293b;">↺ 驚異1</button>
                </div>
                <div style="font-size:11px;font-weight:900;color:#fde047;margin-bottom:5px;">↺ レベル・スキル リセット操作</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px;">
                    <button type="button" id="dbg-sk-reset" class="btn-ui" style="font-size:10px;padding:7px;background:#1e293b;border:1px solid #475569;">↺ 全スキルLvを1にリセット</button>
                    <button type="button" id="dbg-lv-reset-all" class="btn-ui" style="font-size:10px;padding:7px;background:#3f1d2e;border:1px solid #f43f5e;">↺ 全ステータス＆スキル初期化</button>
                </div>
                <div style="font-size:11px;font-weight:900;color:#7dd3fc;margin-bottom:5px;">🪄 武器強化・敵挑発テスト</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px;">
                    <button type="button" id="dbg-wpn-up" class="btn-ui btn-amber" style="font-size:10px;padding:7px;">✨ 武器強化 +3（見た目変化）</button>
                    <button type="button" id="dbg-taunt-now" class="btn-ui" style="background:#dc2626;font-size:10px;padding:7px;">💢 全敵を挑発引きつけ</button>
                </div>
                <div style="font-size:11px;font-weight:900;color:#f97316;margin-bottom:5px;">🔥 敵への状態異常エフェクト強制付与（8秒）</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
                    <button type="button" id="dbg-st-burn" class="btn-ui" style="background:#9a3412;font-size:11px;padding:6px;">🔥 全敵を炎上</button>
                    <button type="button" id="dbg-st-freeze" class="btn-ui" style="background:#0369a1;font-size:11px;padding:6px;">❄️ 全敵を凍結</button>
                    <button type="button" id="dbg-st-poison" class="btn-ui" style="background:#6b21a8;font-size:11px;padding:6px;">☠️ 全敵を毒</button>
                    <button type="button" id="dbg-st-shock" class="btn-ui" style="background:#854d0e;font-size:11px;padding:6px;">⚡ 全敵を麻痺</button>
                    <button type="button" id="dbg-st-clear" class="btn-ui" style="background:#1e293b;font-size:10px;padding:5px;grid-column:span 2;">✨ 全敵の状態異常を解除</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const close = () => modal.remove();
        document.getElementById('btn-close-secret-debug')?.addEventListener('click', close);
        modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
        document.getElementById('dbg-exit-restore')?.addEventListener('click', () => { sfx?.init?.(); this.disableDebugInfiniteMode(); });
        modal.querySelectorAll('.dbg-role-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                sfx?.init?.();
                this.changePlayerRoleDebug(btn.getAttribute('data-role-id') ?? '', btn.getAttribute('data-role-label') ?? '');
                this.openSecretDebugModal();
            });
        });
        [100, 500, 999, 1].forEach(lv => {
            document.getElementById(`dbg-plv-${lv}`)?.addEventListener('click', () => { sfx?.init?.(); this.setPlayerLevelDebug(lv); });
            document.getElementById(`dbg-thr-${lv}`)?.addEventListener('click', () => { sfx?.init?.(); this.setThreatLevelDebug(lv); });
        });
        document.getElementById('dbg-sk-reset')?.addEventListener('click', () => { sfx?.init?.(); this.resetAllSkillsLevelDebug(); });
        document.getElementById('dbg-lv-reset-all')?.addEventListener('click', () => { sfx?.init?.(); this.resetLevelsToBaseDebug(); });
        document.getElementById('dbg-wpn-up')?.addEventListener('click', () => {
            sfx?.init?.();
            if (this.saveData) {
                this.saveData.weaponEnhance = (Number(this.saveData.weaponEnhance) || 0) + 3;
                this.buildPlayerEntity?.();
                if (this.player) this.enforceStrictWeaponVisualV27?.(this.player);
                this.saveGame?.(false);
                this.forceSyncVisualLevelsV24();
                this.showAlertBanner?.(`🪄 [DEBUG] 武器強化値が +${this.saveData.weaponEnhance} になりました！`, 1800);
            }
        });
        document.getElementById('dbg-taunt-now')?.addEventListener('click', () => this.triggerTauntAllEnemies());
        ['burn', 'freeze', 'poison', 'shock'].forEach(st => {
            document.getElementById(`dbg-st-${st}`)?.addEventListener('click', () => { sfx?.init?.(); this.applyDebugStatusToMonsters(st); });
        });
        document.getElementById('dbg-st-clear')?.addEventListener('click', () => { sfx?.init?.(); this.applyDebugStatusToMonsters(null); });
    };

    P.promptSecretDebugUnlock = function () {
        if (this._debugUnlocked) { this.openSecretDebugModal(); return; }
        const code = window.prompt('🔐 隠しデバッグ暗号を入力してください:');
        if (code && code.trim() === SECRET_DEBUG_CODE) { sfx?.playHeal?.(); this.openSecretDebugModal(); }
        else if (code !== null) this.showAlertBanner?.('❌ 暗号が違います', 1400);
    };

    if (P.sendChatMessage) {
        const _prevSendChat = P.sendChatMessage;
        P.sendChatMessage = function (rawText) {
            if (String(rawText || '').trim() === SECRET_DEBUG_CODE) { sfx?.playHeal?.(); this.openSecretDebugModal(); return; }
            _prevSendChat.call(this, rawText);
        };
    }

    P.bindSecretDebugGesture = function () {
        if (this._secretDebugGestureBound) return;
        this._secretDebugGestureBound = true;
        let tapCount = 0, lastTapTs = 0;
        document.addEventListener('click', (e) => {
            if (!e.target.closest?.('#modal-title, .modal-header h2, .modal-header h3')) return;
            const now = performance.now();
            if (now - lastTapTs > 1500) tapCount = 0;
            lastTapTs = now;
            if (++tapCount >= 5) { tapCount = 0; this.promptSecretDebugUnlock(); }
        });
    };

    // 既存メソッドへのフック
    if (P.useSkillSlot) {
        const _prevUseSkill = P.useSkillSlot;
        P.useSkillSlot = function (slotIdx) {
            if (this._uiEditModeV31) return;
            this.maintainInfiniteResources();
            this.syncSkillMpCostsV22();
            const meta = this.resolveSkillMeta ? this.resolveSkillMeta(slotIdx) : null;
            const curCd = (this.player?.skillCds?.[slotIdx] ?? this.skillCds?.[slotIdx] ?? 0);
            _prevUseSkill.call(this, slotIdx);
            this.maintainInfiniteResources();

            if (curCd <= 0.05 && meta && this.player?.pos && Array.isArray(this.monsters)) {
                let stType = null;
                if (meta.skillCategory === 'fire' || meta.skillCategory === 'bigbang') stType = 'burn';
                else if (meta.skillCategory === 'nova_ice') stType = 'freeze';
                else if (meta.skillCategory === 'thunder') stType = 'shock';
                else if (meta.skillCategory === 'void') stType = 'poison';

                if (stType) {
                    const px = this.player.pos.x, pz = this.player.pos.z;
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

    if (P.renderModalContent) {
        const _prevRenderModal = P.renderModalContent;
        P.renderModalContent = function () {
            this.enforce999CapsV27();
            this.maintainInfiniteResources();
            this.syncSkillDescriptionsAndEffects?.();
            this.syncSkillMpCostsV22();
            this.syncMageWeaponNamesV22();
            _prevRenderModal.call(this);
            this.purgeRebirthUIV27();
            this.enhanceSkillSlotVisibilityV35();

            const body = document.getElementById('modal-body');
            if (!body) return;

            if (this.isMageEvolution() && /smith|forge|craft|equip|weapon|gear|item|鍛冶|装備|武器/i.test(String(this.activeTab || ''))) {
                const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, null);
                let node;
                while ((node = walker.nextNode())) {
                    if (node.nodeValue && /剣|刀|ソード|ブレード/.test(node.nodeValue)) {
                        node.nodeValue = convertWeaponNameToStaff(node.nodeValue);
                    }
                }
            }

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

    const _prevUpdateAnim = P.updateCharacterAnimations;
    P.updateCharacterAnimations = function (dt) {
        _prevUpdateAnim?.call(this, dt);
        this.enforce999CapsV27();
        this.maintainInfiniteResources();
        this.fixChatCompactLayoutV31();
        this.ensureStandardMoveStickV33();
        this.injectSettingsDropdownItemV33();
        this.applySavedUILayoutV31();
        if (this.player) this.enforceStrictWeaponVisualV27(this.player);
        this.updateTauntAggroLoop(dt);
        this.updateMageBasicMagicShots(dt);
        this.updateMonsterStatusVisuals(dt);
    };

    if (P.broadcastFirebaseEvent) {
        const _prevBroadcast = P.broadcastFirebaseEvent;
        P.broadcastFirebaseEvent = function (type, payload) {
            if (type === 'attack' && payload && typeof payload === 'object') payload.isMage = this.isMageEvolution();
            _prevBroadcast.call(this, type, payload);
        };
    }
}

const syncUIOnViewportChange = () => {
    window.game?.fixChatCompactLayoutV31?.();
    window.game?.ensureStandardMoveStickV33?.();
    window.game?.injectSettingsDropdownItemV33?.();
    window.game?.applySavedUILayoutV31?.();
};

window.addEventListener('DOMContentLoaded', () => {
    const initClean = () => {
        if (!window.game) return;
        window.game.enforce999CapsV27?.();
        window.game.purgeRebirthUIV27?.();
        window.game.syncSkillDescriptionsAndEffects?.();
        window.game.syncSkillMpCostsV22?.();
        window.game.syncMageWeaponNamesV22?.();
        window.game.bindSecretDebugGesture?.();
        window.game.injectTauntButtonUI?.();
        syncUIOnViewportChange();
        if (window.game.player) window.game.enforceStrictWeaponVisualV27?.(window.game.player);
    };
    setTimeout(initClean, 220);
    setTimeout(initClean, 900);
});

window.addEventListener('resize', syncUIOnViewportChange);
window.visualViewport?.addEventListener('resize', syncUIOnViewportChange);
window.MAX_PLAYER_LEVEL = 999;
// === GAME8_CLEAN_OK ===
【1/2】の下にこの【2/2】を貼って保存したあと、新しいタブで game8.js を開いて再読み込み（末尾に GAME8_CLEAN_OK が出ていれば完了）すると、役職（進化）タブ・移動スティック1個固定・チャット縦幅調整がすべて綺麗に戻ります。

