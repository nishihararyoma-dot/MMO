'use strict';

// =========================================================================
// 顔文字ファンタジー3D バグ修正パッチ (game9.js)
// 1. ペット攻撃等による敵HPのNaN化（無敵バグ）の完全防止＆自動復旧
// 2. 攻撃・スキルエフェクト（_slashEffects / effects）の確実な消去＆掃除
// =========================================================================

(function applyBugFixPatchV9() {
    if (typeof KaomojiMMORPG === 'undefined') return;
    const P = KaomojiMMORPG.prototype;

    // ---------------------------------------------------------------------
    // 1. ダメージ計算のNaNガード＆敵HPの自動復旧
    // ---------------------------------------------------------------------
    if (P.damageMonster) {
        const _origDamageMonster = P.damageMonster;
        P.damageMonster = function (m, rawDmg, isCrit = false, colorOverride = null) {
            if (!m || m.dead) return;

            // 万が一すでにNaNになっていた敵HPを正常値へ復旧
            if (!Number.isFinite(m.maxHp) || m.maxHp <= 0) m.maxHp = 100;
            if (!Number.isFinite(m.hp)) m.hp = m.maxHp;

            // rawDmgがNaNや不正値の場合は安全な正の整数に補正
            let safeDmg = Number(rawDmg);
            if (!Number.isFinite(safeDmg) || safeDmg <= 0) {
                const st = this.calcDerivedStats ? this.calcDerivedStats() : null;
                const baseAtk = st ? Math.max(st.physAtk || 10, st.magAtk || 10) : 10;
                const petLv = (this.saveData && this.saveData.petLevel) || 1;
                safeDmg = Math.max(1, Math.round(baseAtk * (0.35 + petLv * 0.05)));
            }

            return _origDamageMonster.call(this, m, safeDmg, isCrit, colorOverride);
        };
    }

    // ペット更新処理が直接 m.hp を書き換えて NaN にするケースも監視・復旧
    if (P.updatePet) {
        const _origUpdatePet = P.updatePet;
        P.updatePet = function (dt, elapsed) {
            const hpSnap = new Map();
            if (Array.isArray(this.monsters)) {
                for (const m of this.monsters) {
                    if (m && !m.dead && Number.isFinite(m.hp)) {
                        hpSnap.set(m, m.hp);
                    }
                }
            }

            _origUpdatePet.call(this, dt, elapsed);

            if (Array.isArray(this.monsters)) {
                const st = this.calcDerivedStats ? this.calcDerivedStats() : null;
                const baseAtk = st ? Math.max(st.physAtk || 10, st.magAtk || 10) : 10;
                const petLv = (this.saveData && this.saveData.petLevel) || 1;
                const fallbackPetDmg = Math.max(1, Math.round(baseAtk * (0.35 + petLv * 0.05)));

                for (const m of this.monsters) {
                    if (!m || m.dead) continue;
                    if (!Number.isFinite(m.hp)) {
                        const prevHp = hpSnap.has(m) ? hpSnap.get(m) : (m.maxHp || 100);
                        m.hp = Math.max(0, prevHp - fallbackPetDmg);
                        m.aggro = true;
                        if (this.spawnFloatText && m.pos) {
                            this.spawnFloatText(
                                m.pos.clone().add(new THREE.Vector3(0, 1.4, 0)),
                                `🐾${formatBigNum(fallbackPetDmg)}`,
                                '#6ee7b7',
                                13
                            );
                        }
                        if (m.hp <= 0 && this.onMonsterKilled) {
                            this.onMonsterKilled(m);
                        }
                    }
                }
            }
        };
    }

    // ---------------------------------------------------------------------
    // 2. 攻撃エフェクト残存の完全解消（_slashEffects 寿命進行＆強制掃除）
    // ---------------------------------------------------------------------
    P.cleanupAllCombatEffects = function () {
        if (Array.isArray(this._slashEffects)) {
            for (const ef of this._slashEffects) {
                if (ef && ef.mesh && this.scene) {
                    this.scene.remove(ef.mesh);
                    ef.mesh.traverse?.(o => {
                        o.geometry?.dispose?.();
                        o.material?.dispose?.();
                    });
                }
            }
            this._slashEffects = [];
        }
        if (Array.isArray(this.effects)) {
            for (const ef of this.effects) {
                if (ef && ef.mesh && this.scene) {
                    this.scene.remove(ef.mesh);
                }
            }
            this.effects = [];
        }
    };

    // _slashEffects のアニメーションと寿命消去を確実に毎フレーム実行する
    P.tickSlashEffectsV9 = function (dt) {
        if (!Array.isArray(this._slashEffects) || this._slashEffects.length === 0) return;

        // 同一フレーム内での二重減算を防止
        const now = performance.now();
        if (this._lastSlashTickTs && (now - this._lastSlashTickTs) < 4) return;
        this._lastSlashTickTs = now;

        this._slashEffects = this._slashEffects.filter(ef => {
            if (!ef || !ef.mesh) return false;
            if (!ef._bornTs) ef._bornTs = now;

            if (ef.delay && ef.delay > 0) {
                ef.delay -= dt;
                ef.mesh.visible = false;
                return true;
            }
            ef.mesh.visible = true;

            const lifeDec = (Number.isFinite(dt) && dt > 0) ? dt : 0.016;
            ef.life = (Number.isFinite(ef.life) ? ef.life : 0.5) - lifeDec;

            // 寿命切れ、または生成から4秒以上経過したエフェクトは強制削除
            if (ef.life <= 0 || (now - ef._bornTs) > 4000) {
                if (this.scene) this.scene.remove(ef.mesh);
                ef.mesh.traverse?.(o => {
                    o.geometry?.dispose?.();
                    o.material?.dispose?.();
                });
                return false;
            }

            const maxL = (Number.isFinite(ef.maxLife) && ef.maxLife > 0) ? ef.maxLife : 0.6;
            const p = Math.max(0, Math.min(1, 1 - (ef.life / maxL)));
            const fade = 1 - p;

            if (ef.lvEvo) {
                ef.lvEvo.rings?.forEach(r => { r.mesh.rotation.z += dt * r.spd; r.mat.opacity = fade * 0.92; });
                ef.lvEvo.gyroRings?.forEach(g => { g.mesh.rotation.x += dt * g.rx; g.mesh.rotation.y += dt * g.ry; g.mesh.rotation.z += dt * g.rz; g.mat.opacity = fade * 0.88; });
                ef.lvEvo.orbs?.forEach(o => {
                    o.ang += dt * o.spd;
                    o.orb.position.x = Math.cos(o.ang) * o.radius;
                    o.orb.position.z = Math.sin(o.ang) * o.radius;
                    o.orb.position.y = o.baseY + Math.sin(p * Math.PI * 3 + o.ang) * 0.45;
                    o.orb.rotation.y += dt * 6.0;
                });
                if (ef.lvEvo.pillar) {
                    ef.lvEvo.pillar.rotation.y -= dt * 3.0;
                    ef.lvEvo.pillar.scale.set(0.8 + p * 0.65, 1, 0.8 + p * 0.65);
                    if (ef.lvEvo.pillarMat) ef.lvEvo.pillarMat.opacity = fade * (0.32 + ef.lvEvo.tier * 0.06);
                }
            }

            if (ef.kind === 'support_bless') {
                if (ef.followEntity?.pos) ef.mesh.position.set(ef.followEntity.pos.x, 0, ef.followEntity.pos.z);
                if (ef.innerRing) ef.innerRing.rotation.z += dt * 4.0;
                if (ef.outerRing) ef.outerRing.rotation.z -= dt * 3.0;
                if (ef.halo) { ef.halo.position.y = 2.55 + Math.sin(p * Math.PI) * 0.45; ef.halo.rotation.z += dt * 5.0; }
                if (ef.veilCyl) ef.veilCyl.scale.set(0.85 + p * 0.45, 1, 0.85 + p * 0.45);
                if (ef.innerMat) ef.innerMat.opacity = fade * 0.92;
                if (ef.outerMat) ef.outerMat.opacity = fade * 0.88;
                if (ef.haloMat) ef.haloMat.opacity = fade * 0.96;
                if (ef.veilMat) ef.veilMat.opacity = fade * 0.34;
                ef.crosses?.forEach(c => {
                    c.ang += dt * 2.6;
                    c.mesh.position.x = Math.cos(c.ang) * c.dist;
                    c.mesh.position.z = Math.sin(c.ang) * c.dist;
                    c.mesh.position.y += c.vy * dt;
                    c.mesh.rotation.y += dt * 4.5;
                    if (c.mat) c.mat.opacity = fade * 0.95;
                });
            } else if (ef.kind === 'bigbang') {
                ef.coreSphere?.scale.setScalar(Math.max(0.1, fade * 2.2));
                if (ef.auraSphere) { ef.auraSphere.scale.setScalar(0.4 + p * 2.4); ef.auraSphere.rotation.y += dt * 4.0; }
                ef.waveRing?.scale.setScalar(0.5 + p * 2.6);
                if (ef.coreMat) ef.coreMat.opacity = fade;
                if (ef.auraMat) ef.auraMat.opacity = fade * 0.65;
                if (ef.waveMat) ef.waveMat.opacity = fade * 0.92;
                ef.meteors?.forEach(m => {
                    m.mesh.position.x += m.vx * dt;
                    m.mesh.position.y += m.vy * dt;
                    m.mesh.position.z += m.vz * dt;
                    m.mesh.rotation.y += dt * 8.0;
                    m.mesh.scale.setScalar(Math.max(0.1, 1 - p * 0.8));
                });
            } else if (ef.kind === 'chabudai') {
                ef.mesh.position.x += (ef.vx || 0) * dt;
                ef.mesh.position.z += (ef.vz || 0) * dt;
                ef.mesh.position.y = 1.0 + Math.sin(p * Math.PI) * 3.0;
                ef.mesh.rotation.x = p * Math.PI * 4.5;
                ef.mesh.rotation.z = p * Math.PI * 1.4;
            } else if (ef.kind === 'beam') {
                const pulse = Math.sin(p * Math.PI);
                ef.outerCyl?.scale.set(0.6 + pulse * 0.8, 1, 0.6 + pulse * 0.8);
                ef.coreCyl?.scale.set(0.5 + pulse * 0.7, 1, 0.5 + pulse * 0.7);
                if (ef.outerMat) ef.outerMat.opacity = fade * 0.75;
                if (ef.coreMat) ef.coreMat.opacity = fade * 0.98;
                ef.rings?.forEach((r, idx) => { r.rotation.z += dt * (idx % 2 === 0 ? 8 : -8); r.scale.setScalar(0.8 + pulse * 0.6); });
            } else if (ef.kind === 'nova_ice') {
                const rise = Math.min(1, p * 3.2);
                ef.spikes?.forEach((sp, idx) => { sp.position.y = -1.2 + rise * 2.55; sp.rotation.y += dt * (idx % 2 === 0 ? 2 : -2); });
                if (ef.magicRing) ef.magicRing.rotation.z += dt * 2.5;
                ef.dome?.scale.setScalar(0.5 + p * 0.95);
                if (ef.ringMat) ef.ringMat.opacity = fade * 0.85;
                if (ef.domeMat) ef.domeMat.opacity = fade * 0.4;
                if (ef.spikeMat) ef.spikeMat.opacity = p > 0.7 ? fade * 3.0 : 0.92;
            } else {
                ef.mesh.position.x += (ef.vx || 0) * dt;
                ef.mesh.position.y += (ef.vy || 0) * dt;
                ef.mesh.position.z += (ef.vz || 0) * dt;
                ef.mesh.scale.setScalar(1 + p * 0.45);
                if (ef.mat) ef.mat.opacity = fade * 0.92;
            }

            return true;
        });
    };

    // メイン描画ループ（updateVisualEffects）から確実に毎フレーム実行させる
    if (P.updateVisualEffects) {
        const _origUpdateVisualEffects = P.updateVisualEffects;
        P.updateVisualEffects = function (dt, elapsed) {
            _origUpdateVisualEffects.call(this, dt, elapsed);
            this.tickSlashEffectsV9(dt);
            if (this.updateSanctuaryFields) this.updateSanctuaryFields(dt);
        };
    }

    // ゾーン移動・帰還時に残留エフェクトをすべて掃除
    if (P.loadZone) {
        const _origLoadZone = P.loadZone;
        P.loadZone = function (zoneId) {
            this.cleanupAllCombatEffects();
            _origLoadZone.call(this, zoneId);
        };
    }
})();
