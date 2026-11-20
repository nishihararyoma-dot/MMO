'use strict';

// =========================================================================
// 顔文字ファンタジー3D 総合修正・機能拡張パッチ (v9.2)
// ・スキル押す場所（スロット1〜5）の自動復元＆表示
// ・ペット攻撃等による敵HPのNaN化（無敵バグ）防止＆自動復旧
// ・攻撃・スキルエフェクト残存の完全解消
// ・格上レベル差補正（1Lv差ごとに +1.5倍 加算で被ダメ増・与ダメ減）
// ・プレイヤーレベル上限 999 拡張
// ・白っぽい背景＋白文字のコントラスト自動補正
// =========================================================================

try { window.MAX_PLAYER_LEVEL = 999; } catch (e) {}

(function initGame9Patch() {
    const MAX_PLAYER_LV_V9 = 999;

    // ---------------------------------------------------------------------
    // 1. 白っぽい背景（単色＆グラデーション）＋白文字の自動補正
    // ---------------------------------------------------------------------
    function parseRgba(str) {
        if (!str || str === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
        const m = String(str).match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i);
        if (m) {
            return {
                r: Number(m[1]),
                g: Number(m[2]),
                b: Number(m[3]),
                a: m[4] !== undefined ? Number(m[4]) : 1
            };
        }
        const hex = String(str).trim();
        if (hex.startsWith('#')) {
            let h = hex.slice(1);
            if (h.length === 3) h = h.split('').map(c => c + c).join('');
            if (h.length >= 6) {
                return {
                    r: parseInt(h.slice(0, 2), 16) || 0,
                    g: parseInt(h.slice(2, 4), 16) || 0,
                    b: parseInt(h.slice(4, 6), 16) || 0,
                    a: 1
                };
            }
        }
        return { r: 0, g: 0, b: 0, a: 0 };
    }

    function calcLuminance(r, g, b) {
        return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    }

    function getGradientAvgLuminance(bgImg) {
        if (!bgImg || bgImg === 'none' || !bgImg.includes('gradient')) return null;
        const matches = bgImg.match(/rgba?\([^)]+\)|#[0-9a-fA-F]{3,8}/g);
        if (!matches || matches.length === 0) return null;
        let sum = 0;
        let count = 0;
        for (const token of matches) {
            const c = parseRgba(token);
            if (c.a > 0.1) {
                sum += calcLuminance(c.r, c.g, c.b);
                count++;
            }
        }
        return count > 0 ? (sum / count) : null;
    }

    function getEffectiveBgLuminance(el) {
        const layers = [];
        let cur = el;
        while (cur && cur.nodeType === 1) {
            const cs = window.getComputedStyle(cur);
            const gradLum = getGradientAvgLuminance(cs.backgroundImage);
            if (gradLum !== null) return gradLum;
            const bg = parseRgba(cs.backgroundColor);
            if (bg.a > 0.02) {
                layers.unshift(bg);
                if (bg.a >= 0.96) break;
            }
            cur = cur.parentElement;
        }
        let r = 15, g = 23, b = 42;
        for (const ly of layers) {
            r = ly.r * ly.a + r * (1 - ly.a);
            g = ly.g * ly.a + g * (1 - ly.a);
            b = ly.b * ly.a + b * (1 - ly.a);
        }
        return calcLuminance(r, g, b);
    }

    if (!document.getElementById('kmj-v9-contrast-style')) {
        const style = document.createElement('style');
        style.id = 'kmj-v9-contrast-style';
        style.textContent = `
            .world-plate {
                text-shadow:
                    -1px -1px 0 #020617,
                     1px -1px 0 #020617,
                    -1px  1px 0 #020617,
                     1px  1px 0 #020617,
                     0px  2px 4px rgba(0, 0, 0, 0.95) !important;
            }
            .btn-amber, .bg-white, .bg-slate-100, .bg-gray-100, .bg-yellow-200, .bg-yellow-300, .bg-sky-200 {
                color: #0f172a !important;
                text-shadow: none !important;
            }
            #kmj-v9-skill-bar {
                position: fixed;
                right: 112px;
                bottom: 22px;
                z-index: 45;
                display: flex;
                gap: 7px;
                align-items: center;
                pointer-events: auto;
            }
            .kmj-v9-skill-slot {
                position: relative;
                width: 54px;
                height: 58px;
                border-radius: 10px;
                background: rgba(15, 23, 42, 0.92);
                border: 2px solid #38bdf8;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.65);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 2px;
                cursor: pointer;
                user-select: none;
                touch-action: manipulation;
                color: #ffffff;
            }
            .kmj-v9-skill-slot:active {
                transform: scale(0.93);
                border-color: #fde047;
            }
        `;
        document.head.appendChild(style);
    }

    function fixElementContrast(el) {
        if (!el || el.nodeType !== 1) return;
        if (el.classList?.contains('world-plate')) return;
        const cs = window.getComputedStyle(el);
        const fg = parseRgba(cs.color);
        if (calcLuminance(fg.r, fg.g, fg.b) >= 0.58) {
            const bgLum = getEffectiveBgLuminance(el);
            if (bgLum >= 0.52) {
                el.style.setProperty('color', '#0f172a', 'important');
                el.style.setProperty('text-shadow', 'none', 'important');
            }
        }
    }

    function scanAllContrast(root = document.body) {
        if (!root) return;
        if (root.nodeType === 1) fixElementContrast(root);
        const nodes = root.querySelectorAll
            ? root.querySelectorAll('button, span, div, p, a, b, strong, label, input, textarea, select, h1, h2, h3, h4')
            : [];
        for (let i = 0; i < nodes.length; i++) {
            fixElementContrast(nodes[i]);
        }
    }

    // ---------------------------------------------------------------------
    // 2. スキル押す場所（スロット1〜5）が消えている場合の自動復元
    // ---------------------------------------------------------------------
    function ensureSkillSlotsExist() {
        if (!document.body) return;

        // 既存のスキルスロットが隠れていないか確認
        let existingSlot = document.getElementById('skill-slot-0') || document.getElementById('btn-skill-0');
        if (existingSlot) {
            let p = existingSlot;
            while (p && p !== document.body) {
                if (p.classList?.contains('hidden')) p.classList.remove('hidden');
                const cs = window.getComputedStyle(p);
                if (cs.display === 'none') p.style.display = 'flex';
                if (cs.visibility === 'hidden') p.style.visibility = 'visible';
                p = p.parentElement;
            }
            return;
        }

        // DOM上に存在しない場合は右下に5つのスキルボタンを自動生成
        if (document.getElementById('kmj-v9-skill-bar')) return;

        const bar = document.createElement('div');
        bar.id = 'kmj-v9-skill-bar';

        for (let i = 0; i < 5; i++) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.id = `skill-slot-${i}`;
            btn.className = 'kmj-v9-skill-slot skill-slot-btn';
            btn.innerHTML = `<span style="font-size:10px;color:#94a3b8;">枠${i + 1}</span>`;

            let lastTap = 0;
            const trigger = (e) => {
                if (e) { e.preventDefault(); e.stopPropagation(); }
                const now = performance.now();
                if (now - lastTap < 150) return;
                lastTap = now;
                if (typeof sfx !== 'undefined' && sfx.init) sfx.init();
                if (window.game && typeof window.game.useSkillSlot === 'function') {
                    window.game.useSkillSlot(i);
                }
            };
            btn.addEventListener('touchstart', trigger, { passive: false });
            btn.addEventListener('click', trigger);
            bar.appendChild(btn);
        }

        document.body.appendChild(bar);
    }

    function showPatchAppliedBadge() {
        if (!document.body || document.getElementById('kmj-v9-badge')) return;
        const badge = document.createElement('div');
        badge.id = 'kmj-v9-badge';
        badge.textContent = '✅ v9.2適用済';
        badge.style.cssText = 'position:fixed;right:6px;top:6px;z-index:9999;background:rgba(15,23,42,0.88);color:#6ee7b7;border:1px solid #34d399;border-radius:6px;padding:2px 7px;font-size:10px;font-weight:900;pointer-events:none;';
        document.body.appendChild(badge);
        setTimeout(() => { badge.style.opacity = '0.45'; }, 4000);
    }

    if (typeof MutationObserver !== 'undefined') {
        let scanQueued = false;
        const observer = new MutationObserver(() => {
            if (scanQueued) return;
            scanQueued = true;
            requestAnimationFrame(() => {
                scanQueued = false;
                ensureSkillSlotsExist();
                scanAllContrast(document.body);
            });
        });
        const startDomHooks = () => {
            if (!document.body) return;
            ensureSkillSlotsExist();
            scanAllContrast(document.body);
            showPatchAppliedBadge();
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['style', 'class']
            });
        };
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', startDomHooks);
        } else {
            startDomHooks();
        }
    }

    if (typeof window.getKaomojiFaceTexture === 'function' && !window.getKaomojiFaceTexture._v9Wrapped) {
        const _origFaceTex = window.getKaomojiFaceTexture;
        const wrappedFaceTex = function (kaomoji, bgHex, textHex, borderHex) {
            const bg = parseRgba(bgHex || '#073b66');
            const fg = parseRgba(textHex || '#ffffff');
            let safeTextHex = textHex || '#ffffff';
            if (calcLuminance(bg.r, bg.g, bg.b) >= 0.52 && calcLuminance(fg.r, fg.g, fg.b) >= 0.52) {
                safeTextHex = '#0f172a';
            }
            return _origFaceTex.call(this, kaomoji, bgHex, safeTextHex, borderHex);
        };
        wrappedFaceTex._v9Wrapped = true;
        window.getKaomojiFaceTexture = wrappedFaceTex;
    }

    // ---------------------------------------------------------------------
    // 3. KaomojiMMORPG への処理組み込み
    // ---------------------------------------------------------------------
    function hookKaomojiPrototype() {
        if (typeof KaomojiMMORPG === 'undefined') return false;
        const P = KaomojiMMORPG.prototype;
        if (P._v9PatchApplied) return true;
        P._v9PatchApplied = true;

        P.getSafeExpNeeded = function (lv) {
            const curLv = Math.max(1, Math.floor(Number(lv) || 1));
            if (typeof this.getExpNeeded === 'function') {
                const val = Number(this.getExpNeeded(curLv));
                if (Number.isFinite(val) && val > 0) return val;
            }
            return Math.max(50, Math.floor(100 * Math.pow(curLv, 1.85)));
        };

        P.gainExp = function (amount) {
            const d = this.saveData;
            if (!d) return;
            if ((d.lv || 1) >= MAX_PLAYER_LV_V9) {
                d.lv = MAX_PLAYER_LV_V9;
                return;
            }
            const addExp = Number(amount);
            if (!Number.isFinite(addExp) || addExp <= 0) return;

            d.exp = (Number(d.exp) || 0) + addExp;
            let leveled = false;

            while ((d.lv || 1) < MAX_PLAYER_LV_V9) {
                const need = this.getSafeExpNeeded(d.lv || 1);
                if (d.exp < need) break;
                d.exp -= need;
                d.lv = (d.lv || 1) + 1;
                d.ap = (d.ap || 0) + 3;
                d.sp = (d.sp || 0) + 1;
                leveled = true;
            }

            if (d.lv >= MAX_PLAYER_LV_V9) {
                d.lv = MAX_PLAYER_LV_V9;
                d.exp = 0;
            }

            if (leveled) {
                const st = this.calcDerivedStats ? this.calcDerivedStats() : null;
                if (this.player && st) {
                    this.player.hp = st.maxHp;
                    this.player.mp = st.maxMp;
                    if (this.spawnRingWave) this.spawnRingWave(this.player.pos, 0xfde047, 5.0);
                    if (this.spawnFloatText) {
                        this.spawnFloatText(
                            this.player.pos.clone().add(new THREE.Vector3(0, 2.8, 0)),
                            `🎉 LEVEL UP! Lv.${d.lv}`,
                            '#fde047',
                            18
                        );
                    }
                }
                if (typeof sfx !== 'undefined' && sfx.playLevelUp) sfx.playLevelUp();
                if (this.showAlertBanner) {
                    const maxMsg = d.lv >= MAX_PLAYER_LV_V9 ? '（上限MAX達成！）' : '';
                    this.showAlertBanner(`🎉 レベルアップ！ Lv.${d.lv} になりました！${maxMsg}`, 2200);
                }
            }
        };

        if (P.refreshAllHUD) {
            const _origRefreshAllHUD = P.refreshAllHUD;
            P.refreshAllHUD = function () {
                ensureSkillSlotsExist();
                _origRefreshAllHUD.call(this);

                // タイトル画面中は自動生成スキルバーを隠し、ゲーム中のみ表示
                const v9Bar = document.getElementById('kmj-v9-skill-bar');
                if (v9Bar) {
                    v9Bar.style.display = this.inTitleScreen ? 'none' : 'flex';
                }

                const d = this.saveData;
                if (!d) return;
                const curLv = Math.min(MAX_PLAYER_LV_V9, Math.max(1, Number(d.lv) || 1));
                const needExp = this.getSafeExpNeeded(curLv);
                const expPct = curLv >= MAX_PLAYER_LV_V9 ? 100 : Math.max(0, Math.min(100, ((Number(d.exp) || 0) / needExp) * 100));
                const expBar = document.getElementById('hud-exp-bar');
                const pExp = document.getElementById('p-head-exp');
                if (expBar) expBar.style.width = `${expPct}%`;
                if (pExp) pExp.style.width = `${expPct}%`;
            };
        }

        const ADD_MULT_PER_LV = 1.5;

        P.getEnemyLevel = function (m) {
            if (!m) return 1;
            if (Number.isFinite(Number(m.lv)) && Number(m.lv) > 0) {
                return Math.floor(Number(m.lv));
            }
            const threat = (this.saveData && Number(this.saveData.threatRank)) || 0;
            if (this.towerState && this.towerState.active) {
                const floor = Number(this.towerState.floor) || 1;
                return Math.max(1, floor * 3 + threat);
            }
            const zone = (typeof ZONES !== 'undefined' && ZONES[this.currentZoneId]) || null;
            const baseRecLv = zone ? (Number(zone.recLv) || 1) : 1;
            return Math.max(1, baseRecLv + threat + (m.isBoss ? 2 : 0));
        };

        P.getLevelDiffPenaltyMult = function (m) {
            const playerLv = (this.saveData && Number(this.saveData.lv)) || 1;
            const enemyLv = this.getEnemyLevel(m);
            const diff = enemyLv - playerLv;
            if (diff <= 0) return 1.0;
            const mult = 1.0 + ADD_MULT_PER_LV * diff;
            return Number.isFinite(mult) && mult > 1 ? mult : 1.0;
        };

        if (P.damageMonster) {
            const _origDamageMonster = P.damageMonster;
            P.damageMonster = function (m, rawDmg, isCrit = false, colorOverride = null) {
                if (!m || m.dead) return;
                if (!Number.isFinite(m.maxHp) || m.maxHp <= 0) m.maxHp = 100;
                if (!Number.isFinite(m.hp)) m.hp = m.maxHp;

                let safeDmg = Number(rawDmg);
                if (!Number.isFinite(safeDmg) || safeDmg <= 0) {
                    const st = this.calcDerivedStats ? this.calcDerivedStats() : null;
                    const baseAtk = st ? Math.max(st.physAtk || 10, st.magAtk || 10) : 10;
                    const petLv = (this.saveData && this.saveData.petLevel) || 1;
                    safeDmg = Math.max(1, Math.round(baseAtk * (0.35 + petLv * 0.05)));
                }

                const mult = this.getLevelDiffPenaltyMult(m);
                if (mult > 1.0) {
                    safeDmg = Math.max(1, Math.round(safeDmg / mult));
                    if (!colorOverride) colorOverride = '#cbd5e1';
                }

                return _origDamageMonster.call(this, m, safeDmg, isCrit, colorOverride);
            };
        }

        if (P.updateMonsters && P.damagePlayer) {
            const _origUpdateMonsters = P.updateMonsters;
            const _origDamagePlayer = P.damagePlayer;

            P.updateMonsters = function (dt, elapsed) {
                this._inMonsterAttackLoop = true;
                try {
                    return _origUpdateMonsters.call(this, dt, elapsed);
                } finally {
                    this._inMonsterAttackLoop = false;
                }
            };

            P.damagePlayer = function (rawDmg, ignoreDef = false) {
                let finalDmg = Number(rawDmg) || 1;
                if (this._inMonsterAttackLoop && this.player && Array.isArray(this.monsters)) {
                    let maxMult = 1.0;
                    for (const m of this.monsters) {
                        if (!m || m.dead || !m.pos) continue;
                        const dist = Math.hypot(this.player.pos.x - m.pos.x, this.player.pos.z - m.pos.z);
                        if (dist <= 10.5) {
                            const mult = this.getLevelDiffPenaltyMult(m);
                            if (mult > maxMult) maxMult = mult;
                        }
                    }
                    if (maxMult > 1.0) {
                        finalDmg = Math.max(1, Math.round(finalDmg * maxMult));
                    }
                }
                return _origDamagePlayer.call(this, finalDmg, ignoreDef);
            };
        }

        if (P.updatePet) {
            const _origUpdatePet = P.updatePet;
            P.updatePet = function (dt, elapsed) {
                const hpSnap = new Map();
                if (Array.isArray(this.monsters)) {
                    for (const m of this.monsters) {
                        if (m && !m.dead && Number.isFinite(m.hp)) hpSnap.set(m, m.hp);
                    }
                }
                _origUpdatePet.call(this, dt, elapsed);
                if (Array.isArray(this.monsters)) {
                    const st = this.calcDerivedStats ? this.calcDerivedStats() : null;
                    const baseAtk = st ? Math.max(st.physAtk || 10, st.magAtk || 10) : 10;
                    const petLv = (this.saveData && this.saveData.petLevel) || 1;
                    const rawPetDmg = Math.max(1, Math.round(baseAtk * (0.35 + petLv * 0.05)));

                    for (const m of this.monsters) {
                        if (!m || m.dead) continue;
                        if (!Number.isFinite(m.hp)) {
                            const prevHp = hpSnap.has(m) ? hpSnap.get(m) : (m.maxHp || 100);
                            const mult = this.getLevelDiffPenaltyMult(m);
                            const safePetDmg = Math.max(1, Math.round(rawPetDmg / mult));
                            m.hp = Math.max(0, prevHp - safePetDmg);
                            m.aggro = true;
                            if (this.spawnFloatText && m.pos) {
                                this.spawnFloatText(
                                    m.pos.clone().add(new THREE.Vector3(0, 1.4, 0)),
                                    `🐾${formatBigNum(safePetDmg)}`,
                                    mult > 1.0 ? '#cbd5e1' : '#6ee7b7',
                                    13
                                );
                            }
                            if (m.hp <= 0 && this.onMonsterKilled) this.onMonsterKilled(m);
                        }
                    }
                }
            };
        }

        P.cleanupAllCombatEffects = function () {
            if (Array.isArray(this._slashEffects)) {
                for (const ef of this._slashEffects) {
                    if (ef && ef.mesh && this.scene) {
                        this.scene.remove(ef.mesh);
                        ef.mesh.traverse?.(o => { o.geometry?.dispose?.(); o.material?.dispose?.(); });
                    }
                }
                this._slashEffects = [];
            }
            if (Array.isArray(this.effects)) {
                for (const ef of this.effects) {
                    if (ef && ef.mesh && this.scene) this.scene.remove(ef.mesh);
                }
                this.effects = [];
            }
        };

        P.tickSlashEffectsV9 = function (dt) {
            if (!Array.isArray(this._slashEffects) || this._slashEffects.length === 0) return;
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

                if (ef.life <= 0 || (now - ef._bornTs) > 4000) {
                    if (this.scene) this.scene.remove(ef.mesh);
                    ef.mesh.traverse?.(o => { o.geometry?.dispose?.(); o.material?.dispose?.(); });
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

        if (P.updateVisualEffects) {
            const _origUpdateVisualEffects = P.updateVisualEffects;
            P.updateVisualEffects = function (dt, elapsed) {
                _origUpdateVisualEffects.call(this, dt, elapsed);
                this.tickSlashEffectsV9(dt);
                if (this.updateSanctuaryFields) this.updateSanctuaryFields(dt);
            };
        }

        if (P.loadZone) {
            const _origLoadZone = P.loadZone;
            P.loadZone = function (zoneId) {
                this.cleanupAllCombatEffects();
                _origLoadZone.call(this, zoneId);
            };
        }

        return true;
    }

    if (!hookKaomojiPrototype()) {
        let tries = 0;
        const timer = setInterval(() => {
            tries++;
            if (hookKaomojiPrototype() || tries > 50) clearInterval(timer);
        }, 100);
        window.addEventListener('DOMContentLoaded', hookKaomojiPrototype);
    }
})();
