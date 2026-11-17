'use strict';

// =========================================================================
// 顔文字ファンタジー3D メインループ・AUTO支援・全育成UI・操作系 (game2.js)
// =========================================================================

Object.assign(KaomojiMMORPG.prototype, {

    // -----------------------------------------------------------------
    // メインループ＆メモリ保護
    // -----------------------------------------------------------------
    loop(now) {
        const dt = Math.min(0.05, Math.max(0.001, (now - this.lastTime) / 1000));
        this.lastTime = now;
        const elapsed = now / 1000;

        this.updatePlayer(dt, elapsed);
        this.updateMonsters(dt);
        this.updateAiAllies(dt);
        this.updateEffectsAndOverlays(dt);

        this.memCleanTimer += dt;
        if (this.memCleanTimer >= 25) {
            this.memCleanTimer = 0;
            this.cleanupMemory();
        }

        if (this.useWebGL && this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }

        requestAnimationFrame((t) => this.loop(t));
    },

    cleanupMemory() {
        if (this.useWebGL && this.renderer && this.renderer.info) {
            const mem = this.renderer.info.memory;
            if (mem && mem.geometries > 160) {
                this.renderer.renderLists.dispose();
            }
        }
    },

    // -----------------------------------------------------------------
    // プレイヤー更新（スマートAUTO回復・バフ・移動・攻撃）
    // -----------------------------------------------------------------
    updatePlayer(dt, elapsed) {
        if (!this.player) return;
        const st = this.calcDerivedStats();

        // 各種タイマー減算
        if (this.player.invulnTimer > 0) this.player.invulnTimer = Math.max(0, this.player.invulnTimer - dt);
        if (this.player.stunTimer > 0) this.player.stunTimer = Math.max(0, this.player.stunTimer - dt);
        if (this.player.defBuffTimer > 0) {
            this.player.defBuffTimer = Math.max(0, this.player.defBuffTimer - dt);
            if (this.player.defBuffTimer <= 0) this.player.defBuffBonus = 0;
        }
        if (this.player.warcryTimer > 0) {
            this.player.warcryTimer = Math.max(0, this.player.warcryTimer - dt);
            if (this.player.warcryTimer <= 0) this.player.warcryBonus = 1.0;
        }

        // エモート表情復帰
        if (this.emoteTimer > 0) {
            this.emoteTimer = Math.max(0, this.emoteTimer - dt);
            if (this.emoteTimer <= 0) {
                this.emoteMotion = 'none';
                if (this.useWebGL && this.player.frontMat) {
                    this.player.frontMat.map = getKaomojiFaceTexture(this.getBasePlayerKaomoji(), '#073b66', '#ffffff', '#38bdf8');
                    this.player.frontMat.needsUpdate = true;
                }
            }
        }

        // スキルCD減算
        for (let i = 0; i < 5; i++) {
            if (this.player.skillCds[i] > 0) {
                this.player.skillCds[i] = Math.max(0, this.player.skillCds[i] - dt);
            }
        }

        // 中央ワープ陣判定
        const warpBox = document.getElementById('warp-prompt-box');
        if (warpBox) {
            if (this.isOnWarpPortal(this.player.pos)) {
                warpBox.classList.remove('hidden');
            } else {
                warpBox.classList.add('hidden');
            }
        }

        // 自然回復（街では超高速回復）
        const inTown = this.currentZoneId === 'town';
        const hpRegen = inTown ? st.maxHp * 0.40 : st.maxHp * (0.015 + st.treeHpRegenBonus);
        const mpRegen = inTown ? st.maxMp * 0.50 : (4.5 + this.saveData.stats.int * 0.45) * st.treeMpRegenMult;
        this.player.hp = Math.min(st.maxHp, this.player.hp + hpRegen * dt);
        this.player.mp = Math.min(st.maxMp, this.player.mp + mpRegen * dt);

        // 移動入力
        let mx = this.joyVec.x;
        let mz = this.joyVec.y;
        if (this.keys['KeyW'] || this.keys['ArrowUp']) mz -= 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) mz += 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) mx -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) mx += 1;

        const mag = Math.hypot(mx, mz);
        if (mag > 0.05 && this.player.stunTimer <= 0 && !this.isModalOpen && !this.isDead) {
            const nx = mx / Math.max(1, mag);
            const nz = mz / Math.max(1, mag);
            const sin = Math.sin(this.camYaw);
            const cos = Math.cos(this.camYaw);
            const wx = nx * cos + nz * sin;
            const wz = -nx * sin + nz * cos;

            this.player.pos.x += wx * st.moveSpeed * dt;
            this.player.pos.z += wz * st.moveSpeed * dt;
            this.clampPosition(this.player.pos);
            this.player.rotY = Math.atan2(wx, wz);
        } else if (this.autoHunt && this.player.stunTimer <= 0 && !this.isModalOpen && !this.isDead && !inTown) {
            // スマートAUTO狩り（回復・サポート呪文も状況に応じて自動使用！）
            this.autoSkillTimer -= dt;
            if (this.autoSkillTimer <= 0) {
                this.autoSkillTimer = 0.45;
                this.runAutoSupportAndSkills(st);
            }

            const target = this.getNearestMonster(48);
            if (target && !target.dead) {
                this.selectedTarget = target;
                const dx = target.pos.x - this.player.pos.x;
                const dz = target.pos.z - this.player.pos.z;
                const dist = Math.hypot(dx, dz);
                if (dist > 3.6) {
                    this.player.pos.x += (dx / dist) * st.moveSpeed * dt;
                    this.player.pos.z += (dz / dist) * st.moveSpeed * dt;
                    this.clampPosition(this.player.pos);
                    this.player.rotY = Math.atan2(dx, dz);
                }
            }
        }

        // プレイヤー3D姿勢・モーション反映
        if (this.player.group) {
            this.player.group.position.copy(this.player.pos);
            if (this.emoteTimer > 0 && this.emoteMotion === 'jump') {
                this.player.group.position.y = Math.abs(Math.sin(elapsed * 12)) * 0.65;
            } else if (this.emoteTimer > 0 && this.emoteMotion === 'spin') {
                this.player.rotY += dt * 10.5;
            } else if (this.emoteTimer > 0 && this.emoteMotion === 'flip') {
                this.player.group.position.y = Math.abs(Math.sin(elapsed * 16)) * 0.85;
                this.player.rotY += dt * 7.5;
                if (this.player.wpnGroup) this.player.wpnGroup.rotation.x = Math.sin(elapsed * 24) * 1.4;
            } else if (this.emoteTimer > 0 && this.emoteMotion === 'beam') {
                if (this.player.wpnGroup) this.player.wpnGroup.rotation.x = 1.45;
            } else if (this.emoteTimer > 0 && this.emoteMotion === 'bow' && this.player.head) {
                this.player.head.position.y = 1.15;
                this.player.head.rotation.x = 0.65;
            } else if (this.emoteTimer > 0 && this.emoteMotion === 'shake' && this.player.head) {
                this.player.head.rotation.z = Math.sin(elapsed * 26) * 0.22;
            } else {
                if (mag > 0.05) {
                    this.player.group.position.y = Math.abs(Math.sin(elapsed * 14)) * 0.14;
                }
                if (this.player.head) {
                    this.player.head.position.y = 1.62;
                    this.player.head.rotation.x = 0;
                    this.player.head.rotation.z = 0;
                }
            }
            this.player.group.rotation.y = this.player.rotY;
            if (this.player.wpnGroup && this.emoteMotion !== 'beam' && this.emoteMotion !== 'flip') {
                this.player.wpnGroup.rotation.x *= 0.82;
            }
        }

        // オート通常攻撃
        if (this.autoAttack && !this.isModalOpen && !this.isDead && this.player.stunTimer <= 0 && !inTown) {
            const target = this.getNearestMonster(4.8) || this.getValidTarget();
            if (target && !target.dead && this.player.pos.distanceTo(target.pos) <= 4.7) {
                this.selectedTarget = target;
                this.autoAtkTimer -= dt;
                if (this.autoAtkTimer <= 0) {
                    this.autoAtkTimer = Math.max(0.45, 1.05 * (1 - st.cdReduction * 0.6));
                    const crit = Math.random() < st.critChance;
                    this.damageMonster(target, st.physAtk * (crit ? st.critDmg : 1), crit);
                    this.spawnSlashEffect(target.pos, 0x38bdf8);
                    if (this.player.wpnGroup) this.player.wpnGroup.rotation.x = 1.25;
                }
            }
        }

        this.updateBarsOnly();
    },

    // AUTO時の回復・サポート呪文＆攻撃スキル優先度判定
    runAutoSupportAndSkills(st) {
        const d = this.saveData;
        const hpRatio = this.player.hp / Math.max(1, st.maxHp);
        const mpRatio = this.player.mp / Math.max(1, st.maxMp);
        const nearEnemy = this.getNearestMonster(9.5);

        // 1. 最優先：HP68%以下またはMP35%以下なら回復魔法を発動
        for (let i = 0; i < 5; i++) {
            const skId = d.equippedSkills[i];
            const sk = skId ? SKILLS[skId] : null;
            if (!sk || (this.player.skillCds[i] || 0) > 0) continue;
            const cost = getSkillMpCost(sk, d.skills[skId] || 1);
            if (this.player.mp < cost) continue;

            if (sk.type === 'HEAL' && hpRatio <= 0.68) {
                this.useSkillSlot(i);
                return;
            }
            if (sk.type === 'HEAL_MP' && (hpRatio <= 0.68 || mpRatio <= 0.35)) {
                this.useSkillSlot(i);
                return;
            }
        }

        // 2. 敵が近くにいる場合：防御バフ・攻撃バフが切れていれば自動掛け直し
        if (nearEnemy && !nearEnemy.dead) {
            for (let i = 0; i < 5; i++) {
                const skId = d.equippedSkills[i];
                const sk = skId ? SKILLS[skId] : null;
                if (!sk || (this.player.skillCds[i] || 0) > 0) continue;
                const cost = getSkillMpCost(sk, d.skills[skId] || 1);
                if (this.player.mp < cost) continue;

                if (sk.type === 'DEF_BUFF' && this.player.defBuffTimer <= 0.5) {
                    this.useSkillSlot(i);
                    return;
                }
                if (sk.type === 'ATK_BUFF' && this.player.warcryTimer <= 0.5) {
                    this.useSkillSlot(i);
                    return;
                }
            }

            // 3. 射程内に敵がいれば攻撃スキル発動（ボス詠唱中は中断スキル優先）
            const dist = this.player.pos.distanceTo(nearEnemy.pos);
            if (dist <= 5.5) {
                if (nearEnemy.casting) {
                    const intSlot = d.equippedSkills.findIndex((id, idx) => {
                        const s = id ? SKILLS[id] : null;
                        return s && s.type === 'INTERRUPT' && (this.player.skillCds[idx] || 0) <= 0 && this.player.mp >= getSkillMpCost(s, d.skills[id] || 1);
                    });
                    if (intSlot !== -1) {
                        this.useSkillSlot(intSlot);
                        return;
                    }
                }

                for (let i = 0; i < 5; i++) {
                    const skId = d.equippedSkills[i];
                    const sk = skId ? SKILLS[skId] : null;
                    if (!sk || sk.isSupport || (this.player.skillCds[i] || 0) > 0) continue;
                    const cost = getSkillMpCost(sk, d.skills[skId] || 1);
                    if (this.player.mp >= cost) {
                        this.useSkillSlot(i);
                        return;
                    }
                }
            }
        }
    },

    updateMonsters(dt) {
        if (!this.player) return;
        const pPos = this.player.pos;

        this.monsters.forEach(m => {
            if (m.dead) {
                m.respawnTimer -= dt;
                if (m.respawnTimer <= 0) {
                    m.dead = false;
                    m.hp = m.maxHp;
                    m.aggro = false;
                    m.casting = null;
                    m.stunTimer = 0;
                    m.slowTimer = 0;
                    m.burnTimer = 0;
                    m.pos.copy(m.spawnPos);
                    if (m.group) {
                        m.group.position.copy(m.pos);
                        m.group.visible = true;
                    }
                    if (m.plateEl) m.plateEl.style.display = 'block';
                }
                return;
            }

            if (m.stunTimer > 0) m.stunTimer = Math.max(0, m.stunTimer - dt);
            if (m.slowTimer > 0) {
                m.slowTimer = Math.max(0, m.slowTimer - dt);
                if (m.slowTimer <= 0) m.slowFactor = 1.0;
            }
            if (m.burnTimer > 0) {
                m.burnTimer = Math.max(0, m.burnTimer - dt);
                this.damageMonster(m, m.burnDps * dt, false);
                if (m.dead) return;
            }

            if (m.stunTimer > 0) return;

            if (m.casting) {
                m.casting.elapsed += dt;
                const pct = Math.min(100, (m.casting.elapsed / m.casting.duration) * 100);
                const bar = document.getElementById('boss-cast-bar');
                if (bar) bar.style.width = `${pct}%`;
                if (m.casting.elapsed >= m.casting.duration) {
                    m.casting = null;
                    document.getElementById('boss-cast-box')?.classList.add('hidden');
                    this.spawnRingEffect(m.pos, 0xf43f5e, 9.5);
                    if (pPos.distanceTo(m.pos) <= 9.5) {
                        this.damagePlayer(m.atk * 2.2);
                        this.showAlertBanner(`💥 ${m.name}の大技が炸裂！`, 1600);
                    }
                }
                return;
            }

            const dist = m.pos.distanceTo(pPos);
            if (dist < 14.5) m.aggro = true;
            if (!m.aggro) return;

            const spdMult = m.slowTimer > 0 ? (m.slowFactor || 0.5) : 1.0;
            const moveSpd = (m.isBoss ? 4.3 : 5.1) * spdMult;
            const stopRange = m.isBoss ? 3.8 : 2.8;

            if (dist > stopRange) {
                const dx = pPos.x - m.pos.x;
                const dz = pPos.z - m.pos.z;
                m.pos.x += (dx / dist) * moveSpd * dt;
                m.pos.z += (dz / dist) * moveSpd * dt;
                if (m.group) {
                    m.group.position.copy(m.pos);
                    m.group.rotation.y = Math.atan2(dx, dz);
                }
            } else {
                m.autoTimer -= dt * spdMult;
                if (m.autoTimer <= 0) {
                    m.autoTimer = m.isBoss ? 2.1 : 1.8;
                    this.damagePlayer(m.atk);
                    this.spawnSlashEffect(pPos, m.color);
                }
            }

            if (m.isRaidBoss) {
                m.mechTimer -= dt * spdMult;
                if (m.mechTimer <= 0) {
                    m.mechTimer = 8.0;
                    m.casting = { name: '終焉の星屑爆発', elapsed: 0, duration: 2.8 };
                    const titleEl = document.getElementById('boss-cast-title');
                    if (titleEl) titleEl.textContent = `⚠️ ${m.name}「${m.casting.name}」詠唱中！(破邪の衝撃で中断)`;
                    const barEl = document.getElementById('boss-cast-bar');
                    if (barEl) barEl.style.width = '0%';
                    document.getElementById('boss-cast-box')?.classList.remove('hidden');
                }
            }
        });
    },

    updateAiAllies(dt) {
        this.aiAllies.forEach(a => {
            a.wanderTimer -= dt;
            if (a.wanderTimer <= 0) {
                a.wanderTimer = 2.5 + Math.random() * 2.5;
                a.targetOffset.set((Math.random() - 0.5) * 4.5, 0, (Math.random() - 0.5) * 4.5);
            }
            const tx = a.homePos.x + a.targetOffset.x;
            const tz = a.homePos.z + a.targetOffset.z;
            const dx = tx - a.pos.x;
            const dz = tz - a.pos.z;
            const dist = Math.hypot(dx, dz);
            if (dist > 0.25) {
                a.pos.x += (dx / dist) * 2.2 * dt;
                a.pos.z += (dz / dist) * 2.2 * dt;
                if (a.group) {
                    a.group.position.copy(a.pos);
                    a.group.rotation.y = Math.atan2(dx, dz);
                }
            }
        });
    },

    projectToScreen(worldPos) {
        if (!this.useWebGL || !this.camera) return null;
        const v = worldPos.clone().project(this.camera);
        if (v.z > 1) return null;
        return {
            x: (v.x * 0.5 + 0.5) * window.innerWidth,
            y: (-v.y * 0.5 + 0.5) * window.innerHeight
        };
    },

    updateEffectsAndOverlays(dt) {
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const ef = this.effects[i];
            ef.life -= dt;
            if (ef.life <= 0) {
                if (this.scene && ef.mesh) this.scene.remove(ef.mesh);
                this.effects.splice(i, 1);
            } else {
                const ratio = ef.life / ef.maxLife;
                if (ef.mesh && ef.mesh.material) ef.mesh.material.opacity = ratio;
                if (ef.expand && ef.mesh) {
                    const s = 1 + (1 - ratio) * 0.35;
                    ef.mesh.scale.set(s, s, 1);
                }
            }
        }

        if (this.useWebGL && this.camera && this.player) {
            const cx = this.player.pos.x + Math.sin(this.camYaw) * Math.cos(this.camPitch) * this.camDist;
            const cy = this.player.pos.y + Math.sin(this.camPitch) * this.camDist;
            const cz = this.player.pos.z + Math.cos(this.camYaw) * Math.cos(this.camPitch) * this.camDist;
            this.camera.position.set(cx, cy, cz);
            this.camera.lookAt(this.player.pos.x, this.player.pos.y + 1.2, this.player.pos.z);

            // プレイヤー頭上HP/MP/EXPバーの位置投影
            if (this.player.headPlateEl) {
                const pSc = this.projectToScreen(new THREE.Vector3(this.player.pos.x, 2.38, this.player.pos.z));
                if (pSc) {
                    this.player.headPlateEl.style.display = 'block';
                    this.player.headPlateEl.style.left = `${pSc.x}px`;
                    this.player.headPlateEl.style.top = `${pSc.y}px`;
                } else {
                    this.player.headPlateEl.style.display = 'none';
                }
            }
        }

        const myLv = this.saveData.lv || 1;
        this.monsters.forEach(m => {
            if (m.dead || !m.plateEl) return;
            const sc = this.projectToScreen(new THREE.Vector3(m.pos.x, (m.scale || 1) * 2.55, m.pos.z));
            if (!sc) {
                m.plateEl.style.display = 'none';
                return;
            }
            m.plateEl.style.display = 'block';
            m.plateEl.style.left = `${sc.x}px`;
            m.plateEl.style.top = `${sc.y}px`;
            m.plateEl.style.borderColor = (this.selectedTarget === m) ? '#38bdf8' : 'rgba(248,113,113,0.55)';
            const nameEl = m.plateEl.querySelector('.m-name-label');
            if (nameEl) {
                const isHigher = m.lv > myLv;
                nameEl.style.color = isHigher ? '#f87171' : (m.isBoss ? '#fcd34d' : '#fca5a5');
                nameEl.textContent = `Lv.${m.lv}${isHigher ? '⚠️' : ''} ${m.name}`;
            }
            const fill = m.plateEl.querySelector('.m-hp-fill');
            if (fill) fill.style.width = `${Math.max(0, (m.hp / m.maxHp) * 100)}%`;
        });

        for (let i = this.floatTexts.length - 1; i >= 0; i--) {
            const ft = this.floatTexts[i];
            ft.life -= dt;
            ft.worldPos.y += dt * 1.45;
            if (ft.life <= 0) {
                ft.el.remove();
                this.floatTexts.splice(i, 1);
            } else {
                const sc = this.projectToScreen(ft.worldPos);
                if (sc) {
                    ft.el.style.left = `${sc.x}px`;
                    ft.el.style.top = `${sc.y}px`;
                    ft.el.style.opacity = `${Math.min(1, ft.life * 2)}`;
                }
            }
        }

        for (let i = this.emoteBubbles.length - 1; i >= 0; i--) {
            const eb = this.emoteBubbles[i];
            eb.life -= dt;
            if (eb.life <= 0) {
                eb.el.remove();
                this.emoteBubbles.splice(i, 1);
            } else {
                const sc = this.projectToScreen(eb.worldPos);
                if (sc) {
                    eb.el.style.left = `${sc.x}px`;
                    eb.el.style.top = `${sc.y}px`;
                }
            }
        }
    },

    // -----------------------------------------------------------------
    // HUD・頭上ゲージ・マルチタッチスキルパッド更新
    // -----------------------------------------------------------------
    buildEmotePalette() {
        const pal = document.getElementById('emote-palette');
        if (!pal) return;
        pal.innerHTML = EMOTES.map(em => `
            <button class="emote-quick-btn" data-emote="${em.id}">
                <span style="font-size:17px; line-height:1;">${em.icon}</span>
                <span style="font-size:9px; font-weight:900; color:#f8fafc;">${em.label}</span>
            </button>
        `).join('');
        pal.querySelectorAll('.emote-quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.triggerEmote(btn.dataset.emote);
            });
        });
    },

    refreshAllHUD() {
        const d = this.saveData;
        const evo = EVOLUTIONS[d.evolutionId] || EVOLUTIONS.novice;
        const zone = ZONES[this.currentZoneId] || ZONES.town;

        document.getElementById('hud-kaomoji').textContent = this.getBasePlayerKaomoji();
        document.getElementById('hud-name').textContent = evo.name;
        document.getElementById('hud-lv').textContent = d.rebirthCount > 0 ? `Lv.${d.lv} (転生${d.rebirthCount})` : `Lv.${d.lv}`;
        document.getElementById('hud-gold').textContent = `${formatBigNum(d.gold)}G`;

        const titleEl = document.getElementById('hud-title-badge');
        if (d.exTitle && d.exTitle.trim()) {
            titleEl.textContent = d.exTitle.trim();
            titleEl.classList.remove('hidden');
        } else {
            titleEl.classList.add('hidden');
        }

        document.getElementById('hud-stage-badge').textContent = `STAGE ${zone.stageNum}`;
        document.getElementById('hud-zone-name').textContent = zone.name;

        const threatBadge = document.getElementById('hud-threat-badge');
        if ((d.threatRank || 0) > 0) {
            threatBadge.textContent = `脅威+${d.threatRank}`;
            threatBadge.classList.remove('hidden');
        } else {
            threatBadge.classList.add('hidden');
        }

        const safeBadge = document.getElementById('hud-safe-badge');
        if (zone.safe) {
            safeBadge.textContent = '🛡️安全街';
            safeBadge.style.background = '#059669';
        } else {
            safeBadge.textContent = '⚔️狩場';
            safeBadge.style.background = '#e11d48';
        }

        const alertDot = document.getElementById('badge-growth-alert');
        if (d.ap > 0 || d.sp > 0) {
            alertDot?.classList.remove('hidden');
        } else {
            alertDot?.classList.add('hidden');
        }

        // スキルパッド5枠（現在のスキルLvに応じた消費MPを表示）
        const slotWrap = document.getElementById('skill-slots-container');
        slotWrap.innerHTML = [0, 1, 2, 3, 4].map(i => {
            const skId = d.equippedSkills[i];
            const sk = skId ? SKILLS[skId] : null;
            if (!sk) {
                return `<button class="skill-slot-btn" style="opacity:0.35;" disabled><span style="font-size:10px; font-weight:800;">空枠${i + 1}</span></button>`;
            }
            const skLv = d.skills[skId] || 1;
            const mpCost = getSkillMpCost(sk, skLv);
            const shortName = sk.name.slice(0, 4);
            return `
                <button class="skill-slot-btn" data-slot="${i}">
                    <span style="font-size:19px; line-height:1;">${sk.icon}</span>
                    <span style="font-size:9px; font-weight:900; color:#fff; margin-top:2px; line-height:1;">${shortName}</span>
                    <span style="font-size:8px; font-weight:800; color:#7dd3fc; margin-top:2px; line-height:1;">MP${mpCost}</span>
                    <div id="skill-cd-${i}" class="skill-cd-overlay hidden">0.0</div>
                </button>
            `;
        }).join('');

        slotWrap.querySelectorAll('.skill-slot-btn[data-slot]').forEach(btn => {
            const slotNum = Number(btn.dataset.slot);
            let lastFire = 0;
            const triggerSkill = (e) => {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                const now = performance.now();
                if (now - lastFire < 120) return;
                lastFire = now;
                this.useSkillSlot(slotNum);
            };
            btn.addEventListener('touchstart', triggerSkill, { passive: false });
            btn.addEventListener('mousedown', triggerSkill);
        });

        this.updateBarsOnly();
    },

    updateBarsOnly() {
        if (!this.player) return;
        const d = this.saveData;
        const st = this.calcDerivedStats();
        const needExp = this.getExpNeeded(d.lv);

        const hpPct = Math.min(100, (this.player.hp / st.maxHp) * 100);
        const mpPct = Math.min(100, (this.player.mp / st.maxMp) * 100);
        const expPct = d.lv >= MAX_PLAYER_LEVEL ? 100 : Math.min(100, (d.exp / needExp) * 100);

        document.getElementById('hud-hp-text').textContent = `${formatBigNum(this.player.hp)}/${formatBigNum(st.maxHp)}`;
        document.getElementById('hud-hp-bar').style.width = `${hpPct}%`;

        document.getElementById('hud-mp-text').textContent = `${formatBigNum(this.player.mp)}/${formatBigNum(st.maxMp)}`;
        document.getElementById('hud-mp-bar').style.width = `${mpPct}%`;

        document.getElementById('hud-exp-text').textContent = d.lv >= MAX_PLAYER_LEVEL
            ? 'MAX (転生可能)'
            : `${formatBigNum(d.exp)}/${formatBigNum(needExp)}`;
        document.getElementById('hud-exp-bar').style.width = `${expPct}%`;

        // キャラクター頭上のリアルタイムHP/MP/EXPゲージ更新
        const pHeadLv = document.getElementById('p-head-lv');
        const pHeadHp = document.getElementById('p-head-hp');
        const pHeadMp = document.getElementById('p-head-mp');
        const pHeadExp = document.getElementById('p-head-exp');
        if (pHeadLv) pHeadLv.textContent = `Lv.${d.lv}`;
        if (pHeadHp) pHeadHp.style.width = `${hpPct}%`;
        if (pHeadMp) pHeadMp.style.width = `${mpPct}%`;
        if (pHeadExp) pHeadExp.style.width = `${expPct}%`;

        for (let i = 0; i < 5; i++) {
            const cdEl = document.getElementById(`skill-cd-${i}`);
            if (!cdEl) continue;
            const cd = this.player.skillCds[i] || 0;
            if (cd > 0.05) {
                cdEl.textContent = cd.toFixed(1);
                cdEl.classList.remove('hidden');
            } else {
                cdEl.classList.add('hidden');
            }
        }
    },

    // -----------------------------------------------------------------
    // モーダル・全育成タブ描画
    // -----------------------------------------------------------------
    canEvolveTo(evo) {
        const d = this.saveData;
        if (d.lv < evo.reqLv) return false;
        if (evo.reqEvo && d.evolutionId !== evo.reqEvo) return false;
        for (const [mk, cnt] of Object.entries(evo.reqMat || {})) {
            if ((d.materials[mk] || 0) < cnt) return false;
        }
        return true;
    },

    openGrowthModal(tab = 'stats') {
        this.activeTab = tab;
        this.isModalOpen = true;
        document.getElementById('hud-drawer-menu')?.classList.add('hidden');
        document.getElementById('emote-palette')?.classList.add('hidden');
        document.getElementById('growth-modal').classList.remove('hidden');
        this.renderModalContent();
    },

    closeGrowthModal() {
        this.isModalOpen = false;
        document.getElementById('growth-modal').classList.add('hidden');
        this.refreshAllHUD();
    },

    openDialog(title, message, buttons) {
        const modal = document.getElementById('dialog-modal');
        document.getElementById('dialog-title').textContent = title;
        document.getElementById('dialog-message').textContent = message;
        const btnWrap = document.getElementById('dialog-buttons');
        btnWrap.innerHTML = '';
        buttons.forEach(b => {
            const btn = document.createElement('button');
            btn.className = `btn-ui ${b.primary ? 'btn-amber' : 'btn-slate'}`;
            btn.textContent = b.text;
            btn.addEventListener('click', () => {
                modal.classList.add('hidden');
                if (b.onClick) b.onClick();
            });
            btnWrap.appendChild(btn);
        });
        modal.classList.remove('hidden');
    },

    renderModalContent() {
        const d = this.saveData;
        const st = this.calcDerivedStats();
        const evo = EVOLUTIONS[d.evolutionId] || EVOLUTIONS.novice;

        const tabs = [
            { id: 'travel', label: '🗺️ ステージ' },
            { id: 'stats',  label: `📊 ステ振り${d.ap > 0 ? `(${d.ap})` : ''}` },
            { id: 'forge',  label: '⚒️ 無限鍛冶' },
            { id: 'skills', label: `📘 スキル${d.sp > 0 ? `(${d.sp})` : ''}` },
            { id: 'tree',   label: `🌳 ツリー${d.sp > 0 ? `(${d.sp})` : ''}` },
            { id: 'evolve', label: '👑 進化(T1-3)' },
            { id: 'exjob',  label: '🔮 上級･神話･転生' },
            { id: 'emote',  label: '😊 表情･エモート' }
        ];

        const tabBar = document.getElementById('modal-tabs');
        tabBar.innerHTML = tabs.map(t => `
            <button class="tab-chip-btn ${this.activeTab === t.id ? 'active' : ''}" data-tab="${t.id}">${t.label}</button>
        `).join('');
        tabBar.querySelectorAll('.tab-chip-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.activeTab = btn.dataset.tab;
                this.renderModalContent();
            });
        });

        const body = document.getElementById('modal-body');

        if (this.activeTab === 'travel') {
            body.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <div class="card-box flex-between" style="flex-wrap:wrap;">
                        <div>
                            <div style="font-size:12px; font-weight:900; color:#fda4af;">🔥 脅威度ランク（最大 +${MAX_THREAT_RANK} まで解放！）</div>
                            <div style="font-size:10px; color:#94a3b8;">ランクを上げると敵Lv・HP・報酬＆ボスAP/SPドロップ率が激増！</div>
                        </div>
                        <div style="display:flex; align-items:center; gap:5px;">
                            <button id="m-threat-down10" class="btn-ui btn-slate">-10</button>
                            <button id="m-threat-down" class="btn-ui btn-slate">-1</button>
                            <span style="font-size:13px; font-weight:900; color:#fde047; min-width:68px; text-align:center;">+${d.threatRank || 0} / ${MAX_THREAT_RANK}</span>
                            <button id="m-threat-up" class="btn-ui btn-rose">+1</button>
                            <button id="m-threat-up10" class="btn-ui btn-amber">+10</button>
                        </div>
                    </div>
                    <div class="grid-2">
                        ${Object.values(ZONES).map(z => {
                            const isCur = this.currentZoneId === z.id;
                            const dropNames = (z.drops || []).map(mk => `${MATERIALS[mk].icon}${MATERIALS[mk].name}`).join(' / ') || 'HP・MP高速回復＆仲間AI広場';
                            return `
                                <div class="card-box" style="border-color:${isCur ? '#38bdf8' : '#1e293b'}; display:flex; flex-direction:column; justify-content:space-between; gap:8px;">
                                    <div>
                                        <div class="flex-between">
                                            <span class="badge-pill" style="background:${z.safe ? '#065f46' : '#881337'}; color:#fff;">STAGE ${z.stageNum} / 推奨Lv.${z.recLv}〜</span>
                                            ${isCur ? '<span style="font-size:10px; font-weight:900; color:#38bdf8;">● 現在地</span>' : ''}
                                        </div>
                                        <div style="font-size:13px; font-weight:900; color:#fff; margin-top:4px;">${z.name}</div>
                                        <p style="font-size:11px; color:#cbd5e1; margin-top:3px;">${z.desc}</p>
                                        <div style="font-size:10px; color:#6ee7b7; margin-top:4px;">主なドロップ: ${dropNames}</div>
                                    </div>
                                    <button class="btn-warp-zone btn-ui ${isCur ? 'btn-slate' : 'btn-emerald'}" data-zone="${z.id}" ${isCur ? 'disabled' : ''}>
                                        ${isCur ? '滞在中のエリア' : '🌀 このステージへ移動'}
                                    </button>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
            const changeThreat = (delta) => {
                d.threatRank = Math.max(0, Math.min(MAX_THREAT_RANK, (d.threatRank || 0) + delta));
                this.loadZone(this.currentZoneId);
                this.renderModalContent();
            };
            document.getElementById('m-threat-up')?.addEventListener('click', () => changeThreat(1));
            document.getElementById('m-threat-up10')?.addEventListener('click', () => changeThreat(10));
            document.getElementById('m-threat-down')?.addEventListener('click', () => changeThreat(-1));
            document.getElementById('m-threat-down10')?.addEventListener('click', () => changeThreat(-10));
            body.querySelectorAll('.btn-warp-zone').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.loadZone(btn.dataset.zone);
                    this.closeGrowthModal();
                    this.showAlertBanner(`🌀 ${ZONES[btn.dataset.zone].name} へ移動しました！`, 1800);
                });
            });

        } else if (this.activeTab === 'stats') {
            const statDefs = [
                { key: 'str', name: 'STR（筋力）', desc: '物理攻撃力・会心率・会心ダメージが上昇' },
                { key: 'int', name: 'INT（知力）', desc: 'スキル魔力倍率・最大MP・MP自然回復が上昇' },
                { key: 'vit', name: 'VIT（体力）', desc: '最大HP・被ダメージ軽減率が上昇' },
                { key: 'agi', name: 'AGI（敏捷）', desc: '会心率・スキルCD短縮・移動速度が上昇' }
            ];
            body.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <div class="card-box flex-between">
                        <div>
                            <div style="font-size:13px; font-weight:900; color:#38bdf8;">残りステータスポイント (AP): <span style="color:#fde047; font-size:16px;">${d.ap}</span></div>
                            <div style="font-size:10px; color:#94a3b8;">Lv.${MAX_PLAYER_LEVEL}まで成長可能！ボス討伐でもAP/SPがドロップ！</div>
                        </div>
                        <span class="badge-pill" style="background:#1e293b; color:#fde047;">転生補正: x${st.rebirthMult.toFixed(2)}</span>
                    </div>

                    <div class="grid-2">
                        ${statDefs.map(s => `
                            <div class="card-box flex-between">
                                <div>
                                    <div style="font-size:12px; font-weight:900; color:#fff;">${s.name}: <span style="color:#38bdf8; font-size:15px;">${d.stats[s.key]}</span></div>
                                    <div style="font-size:10px; color:#94a3b8;">${s.desc}</div>
                                </div>
                                <div style="display:flex; gap:4px;">
                                    <button class="btn-add-ap btn-ui btn-sky" data-stat="${s.key}" data-amt="1" ${d.ap < 1 ? 'disabled' : ''}>+1</button>
                                    <button class="btn-add-ap btn-ui btn-amber" data-stat="${s.key}" data-amt="5" ${d.ap < 5 ? 'disabled' : ''}>+5</button>
                                    <button class="btn-add-ap btn-ui btn-fuchsia" data-stat="${s.key}" data-amt="25" ${d.ap < 25 ? 'disabled' : ''}>+25</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="card-box grid-2" style="font-size:11px;">
                        <div>最大HP: <b style="color:#34d399;">${formatBigNum(st.maxHp)}</b></div>
                        <div>最大MP: <b style="color:#38bdf8;">${formatBigNum(st.maxMp)}</b></div>
                        <div>総合攻撃力: <b style="color:#fb7185;">${formatBigNum(st.physAtk)}</b></div>
                        <div>スキル魔力倍率: <b style="color:#c084fc;">x${st.magMult}</b></div>
                        <div>会心率: <b style="color:#fde047;">${Math.round(st.critChance * 100)}%</b>${st.overflowCrit > 0 ? ` <span style="color:#f0abfc; font-weight:900;">(超過+${Math.round(st.overflowCrit * 100)}%)</span>` : ''}</div>
                        <div>会心ダメージ: <b style="color:#fde047;">x${st.critDmg.toFixed(2)}</b>${st.overflowCritDmgBonus > 0 ? ` <span style="color:#f0abfc; font-weight:900;">(+${Math.round(st.overflowCritDmgBonus * 100)}%変換!)</span>` : ''}</div>
                        <div>被ダメージ軽減: <b style="color:#2dd4bf;">${Math.round(st.defMitigation * 100)}%</b></div>
                        <div>クールタイム短縮: <b style="color:#818cf8;">${Math.round(st.cdReduction * 100)}%</b></div>
                    </div>
                </div>
            `;
            body.querySelectorAll('.btn-add-ap').forEach(btn => {
                btn.addEventListener('click', () => {
                    const amt = Number(btn.dataset.amt);
                    if (d.ap < amt) return;
                    d.ap -= amt;
                    d.stats[btn.dataset.stat] += amt;
                    this.saveGame(false);
                    this.renderModalContent();
                });
            });

        } else if (this.activeTab === 'forge') {
            const curWpn = WEAPONS[d.weaponId] || WEAPONS.wpn_wood;
            const curArm = ARMORS[d.armorId] || ARMORS.arm_cloth;
            const wpnCost = this.getEquipUpgradeCost(d.weaponEnhance || 0);
            const armReq = getArmorEnhanceRequirement(d.armorEnhance || 0);
            const canEnhArm = d.gold >= armReq.gold && Object.entries(armReq.mats).every(([mk, c]) => (d.materials[mk] || 0) >= c);
            const armMatStr = Object.entries(armReq.mats).map(([mk, c]) => {
                const have = d.materials[mk] || 0;
                return `<span style="color:${have >= c ? '#34d399' : '#fb7185'};">${MATERIALS[mk].icon}${MATERIALS[mk].name} ${have}/${c}</span>`;
            }).join(' / ');

            body.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <div class="card-box flex-wrap-gap" style="font-size:11px;">
                        <span style="font-weight:900; color:#fde047;">所持ゴールド: ${formatBigNum(d.gold)}G</span>
                        ${Object.values(MATERIALS).map(m => `<span>${m.icon}${m.name}: <b>${d.materials[m.id] || 0}</b></span>`).join('')}
                    </div>

                    <div class="grid-2">
                        <div class="card-box" style="display:flex; flex-direction:column; justify-content:space-between; gap:6px;">
                            <div>
                                <div style="font-size:12px; font-weight:900; color:#fb7185;">⚔️ 装備中武器: ${curWpn.name} <span style="color:#fde047;">+${d.weaponEnhance || 0}</span></div>
                                <div style="font-size:10px; color:#94a3b8; margin-top:3px;">精錬ごとに武器攻撃力 +14%＆剣の輝きが進化！</div>
                            </div>
                            <button id="btn-enh-wpn" class="btn-ui btn-amber" ${d.gold < wpnCost ? 'disabled' : ''}>🔨 武器を無限精錬 (+1) [${formatBigNum(wpnCost)}G]</button>
                        </div>
                        <div class="card-box" style="display:flex; flex-direction:column; justify-content:space-between; gap:6px;">
                            <div>
                                <div style="font-size:12px; font-weight:900; color:#38bdf8;">🛡️ 装備中防具: ${curArm.name} <span style="color:#fde047;">+${d.armorEnhance || 0}</span></div>
                                <div style="font-size:10px; color:#94a3b8; margin-top:3px;">精錬ごとに防具HP・MP・防御 +14%（ゴールド＋素材が必要）</div>
                                <div style="font-size:10px; margin-top:3px;">必要素材: ${armMatStr}</div>
                            </div>
                            <button id="btn-enh-arm" class="btn-ui btn-sky" ${!canEnhArm ? 'disabled' : ''}>🔨 防具を無限精錬 (+1) [${formatBigNum(armReq.gold)}G + 素材]</button>
                        </div>
                    </div>

                    <div style="font-size:12px; font-weight:900; color:#fde047;">🗡️ 武器の鍛造・装備</div>
                    <div class="grid-2">
                        ${Object.values(WEAPONS).map(w => {
                            const owned = d.ownedWeapons.includes(w.id);
                            const equipped = d.weaponId === w.id;
                            const canCraft = d.gold >= w.costGold && Object.entries(w.costMat).every(([mk, c]) => (d.materials[mk] || 0) >= c);
                            const matTxt = Object.entries(w.costMat).map(([mk, c]) => `${MATERIALS[mk].icon}${c}`).join(' ') || '初期装備';
                            return `
                                <div class="card-box flex-between">
                                    <div>
                                        <div style="font-size:12px; font-weight:900; color:#fff;">${w.name}</div>
                                        <div style="font-size:10px; color:#fda4af;">基礎ATK:${w.atk} / 魔力倍率:x${w.mag}</div>
                                        <div style="font-size:10px; color:#94a3b8;">必要: ${formatBigNum(w.costGold)}G ${matTxt}</div>
                                    </div>
                                    ${equipped
                                        ? '<span class="badge-pill" style="background:#059669; color:#fff;">装備中</span>'
                                        : (owned
                                            ? `<button class="btn-eq-wpn btn-ui btn-sky" data-id="${w.id}">装備</button>`
                                            : `<button class="btn-craft-wpn btn-ui btn-amber" data-id="${w.id}" ${!canCraft ? 'disabled' : ''}>鍛造</button>`)}
                                </div>
                            `;
                        }).join('')}
                    </div>

                    <div style="font-size:12px; font-weight:900; color:#7dd3fc;">🛡️ 防具の鍛造・装備</div>
                    <div class="grid-2">
                        ${Object.values(ARMORS).map(a => {
                            const owned = d.ownedArmors.includes(a.id);
                            const equipped = d.armorId === a.id;
                            const canCraft = d.gold >= a.costGold && Object.entries(a.costMat).every(([mk, c]) => (d.materials[mk] || 0) >= c);
                            const matTxt = Object.entries(a.costMat).map(([mk, c]) => `${MATERIALS[mk].icon}${c}`).join(' ') || '初期装備';
                            return `
                                <div class="card-box flex-between">
                                    <div>
                                        <div style="font-size:12px; font-weight:900; color:#fff;">${a.name}</div>
                                        <div style="font-size:10px; color:#6ee7b7;">HP+${a.hp} / MP+${a.mp} / 軽減+${Math.round(a.def * 100)}%</div>
                                        <div style="font-size:10px; color:#94a3b8;">必要: ${formatBigNum(a.costGold)}G ${matTxt}</div>
                                    </div>
                                    ${equipped
                                        ? '<span class="badge-pill" style="background:#059669; color:#fff;">装備中</span>'
                                        : (owned
                                            ? `<button class="btn-eq-arm btn-ui btn-sky" data-id="${a.id}">装備</button>`
                                            : `<button class="btn-craft-arm btn-ui btn-amber" data-id="${a.id}" ${!canCraft ? 'disabled' : ''}>鍛造</button>`)}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
            document.getElementById('btn-enh-wpn')?.addEventListener('click', () => {
                if (d.gold < wpnCost) return;
                d.gold -= wpnCost;
                d.weaponEnhance = (d.weaponEnhance || 0) + 1;
                this.buildPlayerEntity();
                sfx.playSkill();
                this.saveGame(false);
                this.renderModalContent();
            });
            document.getElementById('btn-enh-arm')?.addEventListener('click', () => {
                if (!canEnhArm) return;
                d.gold -= armReq.gold;
                for (const [mk, c] of Object.entries(armReq.mats)) {
                    d.materials[mk] -= c;
                }
                d.armorEnhance = (d.armorEnhance || 0) + 1;
                sfx.playSkill();
                this.saveGame(false);
                this.renderModalContent();
            });
            body.querySelectorAll('.btn-craft-wpn').forEach(btn => btn.addEventListener('click', () => {
                const w = WEAPONS[btn.dataset.id];
                d.gold -= w.costGold;
                for (const [mk, c] of Object.entries(w.costMat)) d.materials[mk] -= c;
                d.ownedWeapons.push(w.id);
                d.weaponId = w.id;
                sfx.playLevelUp();
                this.saveGame(false);
                this.renderModalContent();
            }));
            body.querySelectorAll('.btn-eq-wpn').forEach(btn => btn.addEventListener('click', () => {
                d.weaponId = btn.dataset.id;
                this.renderModalContent();
            }));
            body.querySelectorAll('.btn-craft-arm').forEach(btn => btn.addEventListener('click', () => {
                const a = ARMORS[btn.dataset.id];
                d.gold -= a.costGold;
                for (const [mk, c] of Object.entries(a.costMat)) d.materials[mk] -= c;
                d.ownedArmors.push(a.id);
                d.armorId = a.id;
                sfx.playLevelUp();
                this.saveGame(false);
                this.renderModalContent();
            }));
            body.querySelectorAll('.btn-eq-arm').forEach(btn => btn.addEventListener('click', () => {
                d.armorId = btn.dataset.id;
                this.renderModalContent();
            }));

        } else if (this.activeTab === 'skills') {
            body.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <div class="card-box flex-between">
                        <span style="font-size:12px; font-weight:900; color:#818cf8;">残りスキルポイント (SP): <b style="color:#fde047; font-size:15px;">${d.sp}</b></span>
                        <span style="font-size:10px; color:#94a3b8;">LvUPで倍率＆サポート性能が上昇（消費MPも比例増加）</span>
                    </div>
                    <div class="grid-2">
                        ${Object.values(SKILLS).map(sk => {
                            const curLv = d.skills[sk.id] || 0;
                            const dispLv = Math.max(1, curLv);
                            const curMp = getSkillMpCost(sk, dispLv);
                            const nextMp = getSkillMpCost(sk, dispLv + 1);
                            const eff = getSkillEffectStats(sk, dispLv, st);
                            const cost = curLv === 0 ? 1 : this.getSkillUpgradeCost(curLv);
                            const eqIdx = d.equippedSkills.indexOf(sk.id);
                            return `
                                <div class="card-box" style="display:flex; flex-direction:column; justify-content:space-between; gap:6px;">
                                    <div>
                                        <div class="flex-between">
                                            <span style="font-size:12px; font-weight:900; color:#fff;">${sk.icon} ${sk.name} <span style="color:#38bdf8;">${curLv > 0 ? `Lv.${curLv}` : '(未習得)'}</span></span>
                                            <span style="font-size:10px; color:#7dd3fc;">MP:${curMp}${curLv > 0 ? `→${nextMp}` : ''} / CD:${sk.cd}s</span>
                                        </div>
                                        <div style="font-size:10px; font-weight:900; color:#fde047; margin-top:3px;">📊 ${eff.summary}</div>
                                        <p style="font-size:10px; color:#cbd5e1; margin-top:2px;">${sk.desc}</p>
                                    </div>
                                    <div class="flex-between" style="flex-wrap:wrap;">
                                        <button class="btn-up-skill btn-ui btn-emerald" data-id="${sk.id}" ${d.sp < cost ? 'disabled' : ''}>
                                            ${curLv === 0 ? `✨ 習得 (SP ${cost})` : `⬆ 強化 (SP ${cost})`}
                                        </button>
                                        ${curLv > 0 ? `
                                            <div style="display:flex; gap:3px;">
                                                ${[0, 1, 2, 3, 4].map(slot => `
                                                    <button class="btn-set-slot btn-ui ${eqIdx === slot ? 'btn-sky' : 'btn-slate'}" style="padding:4px 7px;" data-id="${sk.id}" data-slot="${slot}">${slot + 1}</button>
                                                `).join('')}
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
            body.querySelectorAll('.btn-up-skill').forEach(btn => btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const curLv = d.skills[id] || 0;
                const cost = curLv === 0 ? 1 : this.getSkillUpgradeCost(curLv);
                if (d.sp < cost) return;
                d.sp -= cost;
                d.skills[id] = curLv + 1;
                sfx.playSkill();
                this.saveGame(false);
                this.renderModalContent();
            }));
            body.querySelectorAll('.btn-set-slot').forEach(btn => btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const slot = Number(btn.dataset.slot);
                const prev = d.equippedSkills.indexOf(id);
                if (prev !== -1) d.equippedSkills[prev] = null;
                d.equippedSkills[slot] = id;
                this.saveGame(false);
                this.renderModalContent();
            }));

        } else if (this.activeTab === 'tree') {
            body.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <div class="card-box flex-between">
                        <span style="font-size:12px; font-weight:900; color:#2dd4bf;">🌳 パッシブスキルツリー / 残りSP: <b style="color:#fde047; font-size:15px;">${d.sp}</b></span>
                        <span style="font-size:10px; color:#94a3b8;">転生後もツリーレベルはすべて引き継がれます</span>
                    </div>
                    <div class="grid-2">
                        ${SKILL_TREE_NODES.map(node => {
                            const lv = d.tree[node.id] || 0;
                            const maxed = lv >= node.maxLv;
                            return `
                                <div class="card-box flex-between">
                                    <div>
                                        <div style="font-size:12px; font-weight:900; color:#fff;">${node.icon} ${node.name} <span style="color:#2dd4bf;">Lv.${lv}/${node.maxLv}</span></div>
                                        <div style="font-size:10px; color:#cbd5e1;">${node.desc}</div>
                                    </div>
                                    <button class="btn-up-tree btn-ui btn-emerald" data-id="${node.id}" ${(maxed || d.sp < 1) ? 'disabled' : ''}>
                                        ${maxed ? 'MAX' : '+1 (SP1)'}
                                    </button>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
            body.querySelectorAll('.btn-up-tree').forEach(btn => btn.addEventListener('click', () => {
                const node = SKILL_TREE_NODES.find(n => n.id === btn.dataset.id);
                const lv = d.tree[node.id] || 0;
                if (d.sp < 1 || lv >= node.maxLv) return;
                d.sp -= 1;
                d.tree[node.id] = lv + 1;
                sfx.playSkill();
                this.saveGame(false);
                this.renderModalContent();
            }));

        } else if (this.activeTab === 'evolve') {
            body.innerHTML = `
                <div class="grid-3">
                    ${Object.values(EVOLUTIONS).filter(e => e.tier >= 1 && e.tier <= 3).map(e => {
                        const isCur = d.evolutionId === e.id;
                        const canEvo = this.canEvolveTo(e);
                        const matStr = Object.entries(e.reqMat || {}).map(([mk, cnt]) => {
                            const have = d.materials[mk] || 0;
                            return `<span style="color:${have >= cnt ? '#34d399' : '#fb7185'};">${MATERIALS[mk].icon}${have}/${cnt}</span>`;
                        }).join(' ');
                        return `
                            <div class="card-box" style="border-color:${isCur ? '#fde047' : '#1e293b'}; display:flex; flex-direction:column; justify-content:space-between; gap:6px;">
                                <div>
                                    <span class="badge-pill" style="background:#312e81; color:#c7d2fe;">TIER ${e.tier} (Lv.${e.reqLv}〜)</span>
                                    <div class="font-kaomoji" style="font-size:15px; font-weight:900; text-align:center; padding:8px; margin:6px 0; border-radius:9px; background:#0f172a; color:${e.color};">${e.kaomoji}</div>
                                    <div style="font-size:12px; font-weight:900; color:#fff;">${e.name}</div>
                                    <div style="font-size:10px; color:#fde047; margin-top:2px;">${e.bonusText}</div>
                                    <div style="font-size:10px; color:#94a3b8; margin-top:3px;">${e.reqEvo ? `前提:${EVOLUTIONS[e.reqEvo].name} / ` : ''}素材:${matStr}</div>
                                </div>
                                <button class="btn-do-evo btn-ui btn-sky" data-id="${e.id}" ${(!canEvo || isCur) ? 'disabled' : ''}>
                                    ${isCur ? '✨ 現在の職業' : (canEvo ? '👑 クラス進化する！' : '条件未達成')}
                                </button>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
            body.querySelectorAll('.btn-do-evo').forEach(btn => btn.addEventListener('click', () => {
                const targetEvo = EVOLUTIONS[btn.dataset.id];
                if (!targetEvo || !this.canEvolveTo(targetEvo)) return;
                for (const [mk, cnt] of Object.entries(targetEvo.reqMat || {})) d.materials[mk] -= cnt;
                d.evolutionId = targetEvo.id;
                this.buildPlayerEntity();
                sfx.playLevelUp();
                this.saveGame(false);
                this.renderModalContent();
                this.showAlertBanner(`👑 「${targetEvo.name}」へ進化しました！`, 2400);
            }));

        } else if (this.activeTab === 'exjob') {
            const reb = d.rebirthCount || 0;
            const canRebirth = d.lv >= REBIRTH_REQ_LEVEL;
            body.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <div class="card-box flex-between" style="flex-wrap:wrap; border-color:rgba(217,70,239,0.5);">
                        <div>
                            <div style="font-size:12px; font-weight:900; color:#f0abfc;">🔮 上級職EX (Lv.55〜) ・ 神話職 (Lv.80〜) ・ 極限超越転生 (Lv.${REBIRTH_REQ_LEVEL}〜)</div>
                            <div class="font-kaomoji" style="font-size:13px; font-weight:900; color:#fff; margin-top:2px;">${evo.kaomoji} ${evo.name}</div>
                        </div>
                        <div style="font-size:12px; font-weight:900; color:#fde047;">転生回数: ${reb}回（永続全能力 +${reb * 35}%）</div>
                    </div>

                    <div class="grid-3">
                        ${Object.values(EVOLUTIONS).filter(e => e.isExJob).map(e => {
                            const isCur = d.evolutionId === e.id;
                            const canEvo = this.canEvolveTo(e);
                            const matStr = Object.entries(e.reqMat || {}).map(([mk, cnt]) => {
                                const have = d.materials[mk] || 0;
                                return `<span style="color:${have >= cnt ? '#34d399' : '#fb7185'};">${MATERIALS[mk].icon}${have}/${cnt}</span>`;
                            }).join(' ');
                            return `
                                <div class="card-box" style="border-color:${isCur ? '#fde047' : (e.tier === 5 ? '#f59e0b' : '#701a75')}; display:flex; flex-direction:column; justify-content:space-between; gap:6px;">
                                    <div>
                                        <span class="badge-pill" style="background:${e.tier === 5 ? '#f59e0b' : '#d946ef'}; color:#0f172a;">${e.tier === 5 ? 'MYTH TIER 5' : 'EX TIER 4'} (Lv.${e.reqLv}〜)</span>
                                        <div class="font-kaomoji" style="font-size:14px; font-weight:900; text-align:center; padding:8px; margin:6px 0; border-radius:9px; background:#0f172a; color:${e.color};">${e.kaomoji}</div>
                                        <div style="font-size:12px; font-weight:900; color:#fff;">${e.name}</div>
                                        <div style="font-size:10px; color:#fde047; margin-top:2px;">${e.bonusText}</div>
                                        <div style="font-size:10px; color:#94a3b8; margin-top:3px;">前提:${EVOLUTIONS[e.reqEvo].name} / 素材:${matStr}</div>
                                    </div>
                                    <button class="btn-ex-evo btn-ui btn-fuchsia" data-id="${e.id}" ${(!canEvo || isCur) ? 'disabled' : ''}>
                                        ${isCur ? '✨ 覚醒済み' : (canEvo ? '🔮 覚醒する！' : '条件未達成')}
                                    </button>
                                </div>
                            `;
                        }).join('')}
                    </div>

                    <div class="card-box flex-between" style="flex-wrap:wrap; border-color:rgba(251,191,36,0.55);">
                        <div style="max-width:500px;">
                            <div style="font-size:12px; font-weight:900; color:#fde047;">♻️ Lv.${REBIRTH_REQ_LEVEL}〜解放（上限Lv.${MAX_PLAYER_LEVEL}）：無限極限超越転生</div>
                            <div style="font-size:10px; color:#cbd5e1; margin-top:2px;">Lv.${REBIRTH_REQ_LEVEL}以上でいつでも転生可能！装備・精錬・素材・職業・スキルツリーを引き継ぎ、全基礎能力が永続 +35% 上昇＆AP+15/SP+10を獲得します。</div>
                        </div>
                        <button id="btn-rebirth-do" class="btn-ui btn-amber" ${!canRebirth ? 'disabled' : ''}>
                            ${canRebirth ? '♻️ 極限転生を実行！' : `🔒 Lv.${REBIRTH_REQ_LEVEL}到達で解放 (現在Lv.${d.lv})`}
                        </button>
                    </div>
                </div>
            `;
            body.querySelectorAll('.btn-ex-evo').forEach(btn => btn.addEventListener('click', () => {
                const targetEvo = EVOLUTIONS[btn.dataset.id];
                if (!targetEvo || !this.canEvolveTo(targetEvo)) return;
                for (const [mk, cnt] of Object.entries(targetEvo.reqMat || {})) d.materials[mk] -= cnt;
                d.evolutionId = targetEvo.id;
                this.buildPlayerEntity();
                sfx.playLevelUp();
                this.saveGame(false);
                this.renderModalContent();
                this.showAlertBanner(`🔮 「${targetEvo.name}」へ覚醒しました！`, 2600);
            }));
            document.getElementById('btn-rebirth-do')?.addEventListener('click', () => {
                if (d.lv < REBIRTH_REQ_LEVEL) return;
                this.openDialog(
                    '♻️ 極限超越転生の確認',
                    `Lv.${d.lv} から Lv.1 へ極限超越転生しますか？\n（装備・精錬値・素材・職業・スキルツリーはすべて引き継がれ、全基礎能力が永続 +35% 上昇＆AP+15/SP+10を獲得します！）`,
                    [
                        { text: 'キャンセル', primary: false },
                        {
                            text: '♻️ 転生を実行する！',
                            primary: true,
                            onClick: () => {
                                d.rebirthCount = (d.rebirthCount || 0) + 1;
                                d.lv = 1;
                                d.exp = 0;
                                d.ap += 15;
                                d.sp += 10;
                                this.buildPlayerEntity();
                                const newSt = this.calcDerivedStats();
                                this.player.hp = newSt.maxHp;
                                this.player.mp = newSt.maxMp;
                                sfx.playLevelUp();
                                this.saveGame(false);
                                this.closeGrowthModal();
                                this.showAlertBanner(`♻️ 極限超越転生 第${d.rebirthCount}周目突入！全能力が永続強化されました！`, 3200);
                            }
                        }
                    ]
                );
            });

        } else if (this.activeTab === 'emote') {
            body.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <div class="card-box">
                        <div style="font-size:12px; font-weight:900; color:#f9a8d4; margin-bottom:6px;">😊 16種エモートアクション（ちゃぶ台返し・ビーム・土下座など）</div>
                        <div style="display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:6px;">
                            ${EMOTES.map(em => `
                                <button class="btn-modal-emote btn-ui btn-slate" style="flex-direction:column; padding:8px 4px;" data-emote="${em.id}">
                                    <span style="font-size:18px;">${em.icon}</span>
                                    <span style="font-size:10px; color:#fff;">${em.label}</span>
                                    <span class="font-kaomoji" style="font-size:9px; color:#f9a8d4;">${em.kaomoji}</span>
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <div class="card-box">
                        <div style="font-size:12px; font-weight:900; color:#7dd3fc; margin-bottom:6px;">✏️ プレイヤーの基本顔文字＆二つ名カスタマイズ</div>
                        <div class="grid-2" style="margin-bottom:8px;">
                            <div>
                                <div style="font-size:10px; color:#94a3b8; margin-bottom:3px;">基本の顔文字（空欄で職業デフォルト）</div>
                                <input id="input-custom-kaomoji" class="input-ui font-kaomoji" type="text" maxlength="16" value="${d.customKaomoji || ''}" placeholder="例: (╯°□°）╯︵ ┻━┻">
                            </div>
                            <div>
                                <div style="font-size:10px; color:#94a3b8; margin-bottom:3px;">二つ名・称号（最大12文字）</div>
                                <input id="input-custom-title" class="input-ui" type="text" maxlength="12" value="${d.exTitle || ''}" placeholder="例: ちゃぶ台マスター">
                            </div>
                        </div>
                        <div class="flex-wrap-gap" style="margin-bottom:8px;">
                            ${KAOMOJI_PRESETS.map(k => `<button class="btn-preset-k btn-ui btn-slate font-kaomoji" data-k="${k}">${k}</button>`).join('')}
                        </div>
                        <button id="btn-save-kaomoji" class="btn-ui btn-sky">✨ 顔文字と称号を反映する</button>
                    </div>
                </div>
            `;
            body.querySelectorAll('.btn-modal-emote').forEach(btn => btn.addEventListener('click', () => {
                const id = btn.dataset.emote;
                this.closeGrowthModal();
                this.triggerEmote(id);
            }));
            body.querySelectorAll('.btn-preset-k').forEach(btn => btn.addEventListener('click', () => {
                const inp = document.getElementById('input-custom-kaomoji');
                if (inp) inp.value = btn.dataset.k;
            }));
            document.getElementById('btn-save-kaomoji')?.addEventListener('click', () => {
                d.customKaomoji = document.getElementById('input-custom-kaomoji')?.value.trim() || '';
                d.exTitle = document.getElementById('input-custom-title')?.value.trim() || '';
                this.buildPlayerEntity();
                this.saveGame(false);
                this.refreshAllHUD();
                this.showAlertBanner('✨ プレイヤーの顔文字と称号を更新しました！', 1800);
            });
        }
    },

    // -----------------------------------------------------------------
    // イベントバインド（マルチタッチスティック・カメラ・戦闘・脅威度）
    // -----------------------------------------------------------------
    bindEvents() {
        const joyZone = document.getElementById('joystick-zone');
        const joyStick = document.getElementById('joystick-stick');
        let joyTouchId = null;
        const maxRadius = 36;

        const updateStickPos = (clientX, clientY) => {
            const rect = joyZone.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            let dx = clientX - cx;
            let dy = clientY - cy;
            const dist = Math.hypot(dx, dy);
            if (dist > maxRadius) {
                dx = (dx / dist) * maxRadius;
                dy = (dy / dist) * maxRadius;
            }
            joyStick.style.transform = `translate(${dx}px, ${dy}px)`;
            this.joyVec.x = dx / maxRadius;
            this.joyVec.y = dy / maxRadius;
        };

        const resetStick = () => {
            joyTouchId = null;
            joyStick.style.transform = 'translate(0px, 0px)';
            this.joyVec.x = 0;
            this.joyVec.y = 0;
        };

        joyZone.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (joyTouchId !== null) return;
            const t = e.changedTouches[0];
            joyTouchId = t.identifier;
            updateStickPos(t.clientX, t.clientY);
        }, { passive: false });

        window.addEventListener('touchmove', (e) => {
            if (joyTouchId === null) return;
            for (let i = 0; i < e.changedTouches.length; i++) {
                const t = e.changedTouches[i];
                if (t.identifier === joyTouchId) {
                    updateStickPos(t.clientX, t.clientY);
                    break;
                }
            }
        }, { passive: true });

        window.addEventListener('touchend', (e) => {
            if (joyTouchId === null) return;
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === joyTouchId) {
                    resetStick();
                    break;
                }
            }
        });
        window.addEventListener('touchcancel', resetStick);

        let mouseJoy = false;
        joyZone.addEventListener('mousedown', (e) => {
            mouseJoy = true;
            updateStickPos(e.clientX, e.clientY);
        });
        window.addEventListener('mousemove', (e) => {
            if (mouseJoy) updateStickPos(e.clientX, e.clientY);
        });
        window.addEventListener('mouseup', () => {
            if (mouseJoy) {
                mouseJoy = false;
                resetStick();
            }
        });

        // 3Dキャンバスドラッグ視点回転
        let camDragId = null;
        let lastCamX = 0;
        this.canvas.addEventListener('touchstart', (e) => {
            if (camDragId === null && e.changedTouches.length > 0) {
                camDragId = e.changedTouches[0].identifier;
                lastCamX = e.changedTouches[0].clientX;
            }
        }, { passive: true });
        this.canvas.addEventListener('touchmove', (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                const t = e.changedTouches[i];
                if (t.identifier === camDragId) {
                    this.camYaw -= (t.clientX - lastCamX) * 0.008;
                    lastCamX = t.clientX;
                }
            }
        }, { passive: true });
        this.canvas.addEventListener('touchend', (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === camDragId) camDragId = null;
            }
        });

        let mouseCam = false;
        this.canvas.addEventListener('mousedown', (e) => {
            mouseCam = true;
            lastCamX = e.clientX;
        });
        window.addEventListener('mousemove', (e) => {
            if (mouseCam) {
                this.camYaw -= (e.clientX - lastCamX) * 0.007;
                lastCamX = e.clientX;
            }
        });
        window.addEventListener('mouseup', () => { mouseCam = false; });

        window.addEventListener('keydown', (e) => {
            if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
            this.keys[e.code] = true;
            if (e.code === 'Digit1') this.useSkillSlot(0);
            if (e.code === 'Digit2') this.useSkillSlot(1);
            if (e.code === 'Digit3') this.useSkillSlot(2);
            if (e.code === 'Digit4') this.useSkillSlot(3);
            if (e.code === 'Digit5') this.useSkillSlot(4);
            if (e.code === 'Space') document.getElementById('btn-basic-attack')?.click();
        });
        window.addEventListener('keyup', (e) => { this.keys[e.code] = false; });

        // 上部HUDボタン
        document.getElementById('btn-open-travel')?.addEventListener('click', () => this.openGrowthModal('travel'));
        document.getElementById('btn-open-growth')?.addEventListener('click', () => this.openGrowthModal('stats'));
        document.getElementById('btn-close-modal')?.addEventListener('click', () => this.closeGrowthModal());

        document.getElementById('btn-toggle-autohunt')?.addEventListener('click', (e) => {
            if (this.currentZoneId === 'town') {
                this.showAlertBanner('安全な街ではAUTO狩りできません。ステージへ移動しよう！', 1600);
                return;
            }
            this.autoHunt = !this.autoHunt;
            e.currentTarget.textContent = this.autoHunt ? '🤖 AUTO:ON' : '🤖 AUTO:OFF';
            this.showAlertBanner(this.autoHunt ? '🤖 スマートAUTO（自動回復・支援付き）開始！' : '🤖 AUTO狩りを停止しました', 1400);
        });

        document.getElementById('btn-toggle-drawer')?.addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('hud-drawer-menu')?.classList.toggle('hidden');
        });

        document.getElementById('btn-threat-up')?.addEventListener('click', () => {
            this.saveData.threatRank = Math.min(MAX_THREAT_RANK, (this.saveData.threatRank || 0) + 1);
            this.loadZone(this.currentZoneId);
            this.showAlertBanner(`🔥 脅威度ランク +${this.saveData.threatRank} / ${MAX_THREAT_RANK} に上昇！`, 1400);
        });
        document.getElementById('btn-threat-down')?.addEventListener('click', () => {
            this.saveData.threatRank = Math.max(0, (this.saveData.threatRank || 0) - 1);
            this.loadZone(this.currentZoneId);
            this.showAlertBanner(`❄️ 脅威度ランク +${this.saveData.threatRank} に変更`, 1400);
        });
        document.getElementById('btn-manual-save')?.addEventListener('click', () => {
            document.getElementById('hud-drawer-menu')?.classList.add('hidden');
            this.saveGame(true);
        });

        document.getElementById('btn-exec-warp')?.addEventListener('click', () => {
            this.autoHunt = false;
            const autoBtn = document.getElementById('btn-toggle-autohunt');
            if (autoBtn) autoBtn.textContent = '🤖 AUTO:OFF';
            this.loadZone('town');
            sfx.playLevelUp();
            this.showAlertBanner('🏠 安全な街「始まりの顔文字広場」へ帰還しました！', 2200);
        });

        document.getElementById('btn-toggle-emote')?.addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('emote-palette')?.classList.toggle('hidden');
        });

        const bindInstantAction = (elId, fn) => {
            const el = document.getElementById(elId);
            if (!el) return;
            let lastT = 0;
            const handler = (e) => {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                const now = performance.now();
                if (now - lastT < 120) return;
                lastT = now;
                fn();
            };
            el.addEventListener('touchstart', handler, { passive: false });
            el.addEventListener('mousedown', handler);
        };

        bindInstantAction('btn-basic-attack', () => {
            if (this.isDead) return;
            const target = this.getValidTarget();
            if (target && !target.dead && this.player.pos.distanceTo(target.pos) <= 5.2) {
                const st = this.calcDerivedStats();
                const crit = Math.random() < st.critChance;
                this.damageMonster(target, st.physAtk * (crit ? st.critDmg : 1), crit);
                this.spawnSlashEffect(target.pos, 0x38bdf8);
                if (this.player.wpnGroup) this.player.wpnGroup.rotation.x = 1.3;
            } else {
                this.showAlertBanner('攻撃範囲内に敵がいません！近づこう！', 1100);
            }
        });

        bindInstantAction('btn-cycle-target', () => this.cycleTarget());
    }
});

window.addEventListener('DOMContentLoaded', () => {
    window.kaomojiGame = new KaomojiMMORPG();
});
