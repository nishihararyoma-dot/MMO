'use strict';

// =========================================================================
// 顔文字ファンタジー3D 改善・不具合修正パッチ (game9.js)
// ・攻撃/スキルエフェクト残留の解消
// ・ペット攻撃時の敵無敵バグ（NaN HP化）の解消
// ・脅威度上限 999 対応（±10 / ±100 ボタン追加）
// =========================================================================

window.MAX_THREAT_RANK = 999;

(function applyGame9Fixes() {
    if (typeof KaomojiMMORPG === 'undefined') return;
    const P = KaomojiMMORPG.prototype;
    if (P._game9Patched) return;
    P._game9Patched = true;

    // ---------------------------------------------------------------------
    // 1. ステータス後方互換（ペット攻撃等の st.atk 参照による NaN 防止）
    // ---------------------------------------------------------------------
    if (P.calcDerivedStats) {
        const _origCalcStats = P.calcDerivedStats;
        P.calcDerivedStats = function () {
            const st = _origCalcStats.call(this);
            if (st && typeof st === 'object') {
                const bestAtk = Math.max(Number(st.physAtk) || 0, Number(st.magAtk) || 0, 1);
                if (!Number.isFinite(st.atk) || st.atk <= 0) {
                    st.atk = bestAtk;
                }
            }
            return st;
        };
    }

    // ---------------------------------------------------------------------
    // 2. ダメージ処理＆モンスターHPの NaN 修復（ペット攻撃で無敵になる問題の解消）
    // ---------------------------------------------------------------------
    if (P.damageMonster) {
        const _origDamageMonster = P.damageMonster;
        P.damageMonster = function (m, rawDmg, isCrit = false, colorOverride = null) {
            if (!m || m.dead) return;

            // 万が一 HP が NaN 等になっていたら直前の正常値または maxHp で復元
            if (!Number.isFinite(m.hp)) {
                m.hp = Number.isFinite(m._lastValidHp) ? m._lastValidHp : (Number(m.maxHp) || 10);
            }
            // ダメージ値が NaN や不正値の場合も安全化
            let safeDmg = Number(rawDmg);
            if (!Number.isFinite(safeDmg) || safeDmg <= 0) {
                const st = this.calcDerivedStats ? this.calcDerivedStats() : { atk: 10 };
                safeDmg = Math.max(1, Math.round((st.atk || 10) * 0.35));
            }

            _origDamageMonster.call(this, m, safeDmg, isCrit, colorOverride);

            if (Number.isFinite(m.hp) && m.hp > 0) {
                m._lastValidHp = m.hp;
            }
        };
    }

    if (P.updateMonsters) {
        const _origUpdateMonsters = P.updateMonsters;
        P.updateMonsters = function (dt, elapsed) {
            if (Array.isArray(this.monsters)) {
                for (const m of this.monsters) {
                    if (!m || m.dead) continue;
                    // ペットが m.hp を直接減算して NaN にしてしまった場合を即座に検知・救済
                    if (!Number.isFinite(m.hp)) {
                        const st = this.calcDerivedStats ? this.calcDerivedStats() : { atk: 10 };
                        const fallbackDmg = Math.max(1, Math.round((st.atk || 10) * 0.35));
                        const baseHp = Number.isFinite(m._lastValidHp) ? m._lastValidHp : (Number(m.maxHp) || 10);
                        m.hp = Math.max(0, baseHp - fallbackDmg);
                        if (this.spawnFloatText && m.pos) {
                            this.spawnFloatText(
                                m.pos.clone().add(new THREE.Vector3(0, 1.4 * (m.scale || 1), 0)),
                                `🐾${formatBigNum(fallbackDmg)}`,
                                '#6ee7b7',
                                13
                            );
                        }
                        if (m.hp <= 0 && this.onMonsterKilled) {
                            this.onMonsterKilled(m);
                            continue;
                        }
                    }
                    if (Number.isFinite(m.hp) && m.hp > 0) {
                        m._lastValidHp = m.hp;
                    }
                }
            }
            _origUpdateMonsters.call(this, dt, elapsed);
        };
    }

    // ---------------------------------------------------------------------
    // 3. 攻撃・スキルエフェクト残留の解消
    // ---------------------------------------------------------------------
    P.cleanupAllEffects = function () {
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

    if (P.loadZone) {
        const _origLoadZone = P.loadZone;
        P.loadZone = function (zoneId) {
            this.cleanupAllEffects?.();
            _origLoadZone.call(this, zoneId);
        };
    }

    if (P.loop) {
        const _origLoop = P.loop;
        P.loop = function (now) {
            const dt = Math.min(0.05, Math.max(0.001, (now - (this.lastTime || now)) / 1000));

            // game4 2.js の loop から抜けていた game6 のアニメーション・エフェクト更新を確実に実行
            if (this.updateRemotePlayers) {
                this.updateRemotePlayers(dt);
            } else {
                this.updateCharacterAnimations?.(dt);
                this.updateSanctuaryFields?.(dt);
                this.updateHeadBubbles?.(dt);
            }

            // 念のためのフェイルセーフ：万が一寿命が減らないエフェクトがあっても強制消去
            if (Array.isArray(this._slashEffects) && this._slashEffects.length > 0) {
                this._slashEffects = this._slashEffects.filter(ef => {
                    ef._guardAge = (ef._guardAge || 0) + dt;
                    if (ef._guardAge > 5.0) {
                        if (ef.mesh && this.scene) this.scene.remove(ef.mesh);
                        return false;
                    }
                    return true;
                });
            }

            _origLoop.call(this, now);
        };
    }

    // ---------------------------------------------------------------------
    // 4. 脅威度の上限を 999 に変更（UI・ボタン拡張）
    // ---------------------------------------------------------------------
    const renderZonesWith999 = function () {
        const d = this.saveData;
        if (!d) return;
        const body = document.getElementById('modal-body');
        if (!body) return;

        window.MAX_THREAT_RANK = 999;
        const maxThreat = 999;
        const curThreat = Math.max(0, Math.min(maxThreat, Number(d.threatRank) || 0));
        d.threatRank = curThreat;
        const isTowerActive = Boolean(this.towerState && this.towerState.active);

        body.innerHTML = `
            <div class="card-box" style="margin-bottom:10px;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
                    <div>
                        <div style="font-weight:900; color:#f43f5e;">🔥 危険度ランク: +${curThreat} / ${maxThreat}</div>
                        <div style="font-size:10px; color:#cbd5e1;">ランクを上げると敵が強くなり、経験値・ゴールド報酬も増加！</div>
                    </div>
                    <div style="display:flex; gap:4px; flex-wrap:wrap;">
                        <button type="button" class="btn-ui btn-slate" data-threat-delta="-100" ${curThreat <= 0 ? 'disabled' : ''}>-100</button>
                        <button type="button" class="btn-ui btn-slate" data-threat-delta="-10" ${curThreat <= 0 ? 'disabled' : ''}>-10</button>
                        <button type="button" class="btn-ui btn-slate" data-threat-delta="-1" ${curThreat <= 0 ? 'disabled' : ''}>-1</button>
                        <button type="button" class="btn-ui btn-rose" data-threat-delta="1" ${curThreat >= maxThreat ? 'disabled' : ''}>+1</button>
                        <button type="button" class="btn-ui btn-rose" data-threat-delta="10" ${curThreat >= maxThreat ? 'disabled' : ''}>+10</button>
                        <button type="button" class="btn-ui btn-amber" data-threat-delta="100" ${curThreat >= maxThreat ? 'disabled' : ''}>+100</button>
                    </div>
                </div>
            </div>

            <div class="card-box" style="margin-bottom:10px; border-color:#a855f7;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <div style="font-weight:900; color:#e879f9;">🗼 無限の試練の塔（最高到達: ${(d.statsTrack && d.statsTrack.bestTowerFloor) || 0}F）</div>
                        <div style="font-size:11px; color:#cbd5e1;">全滅させるごとに階層が上がるエンドレス挑戦モード</div>
                    </div>
                    <button type="button" class="btn-ui btn-purple" id="btn-enter-tower">挑戦する</button>
                </div>
            </div>

            <div style="display:grid; gap:8px;">
                ${Object.values(ZONES).map(z => `
                    <div class="card-box" style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <div style="font-weight:900; color:#fff;">${z.safe ? '🏰' : `⚔️ Stage ${z.stageNum}:`} ${z.name} <span style="color:#fde047; font-size:11px;">(推奨Lv.${z.recLv})</span></div>
                            <div style="font-size:11px; color:#cbd5e1;">${z.desc}</div>
                        </div>
                        <button type="button" class="btn-ui ${this.currentZoneId === z.id && !isTowerActive ? 'btn-amber' : 'btn-sky'}" data-warp-zone="${z.id}">
                            ${this.currentZoneId === z.id && !isTowerActive ? '現在地' : '転移'}
                        </button>
                    </div>
                `).join('')}
            </div>
        `;

        body.querySelectorAll('[data-threat-delta]').forEach(btn => {
            btn.addEventListener('click', () => {
                sfx?.init?.();
                const delta = Number(btn.getAttribute('data-threat-delta')) || 0;
                d.threatRank = Math.max(0, Math.min(maxThreat, (d.threatRank || 0) + delta));
                this.saveGame?.(false);
                if (!isTowerActive && this.currentZoneId && this.currentZoneId !== 'town') {
                    this.loadZone?.(this.currentZoneId);
                }
                renderZonesWith999.call(this);
            });
        });

        body.querySelector('#btn-enter-tower')?.addEventListener('click', () => {
            this.closeGrowthModal?.();
            this.startTowerMode?.(1);
        });

        body.querySelectorAll('[data-warp-zone]').forEach(btn => {
            btn.addEventListener('click', () => {
                const zid = btn.getAttribute('data-warp-zone');
                this.closeGrowthModal?.();
                this.loadZone?.(zid);
            });
        });
    };

    if (P.renderGrowthTabContent) {
        const _origRenderTab = P.renderGrowthTabContent;
        P.renderGrowthTabContent = function () {
            if (this.activeTab === 'zones' || this.activeTab === 'travel') {
                renderZonesWith999.call(this);
                return;
            }
            _origRenderTab.call(this);
        };
    }

    if (P.renderModalContent) {
        const _origRenderModal = P.renderModalContent;
        P.renderModalContent = function () {
            _origRenderModal.call(this);
            if (this.activeTab === 'zones' || this.activeTab === 'travel') {
                renderZonesWith999.call(this);
            }
        };
    }
})();
