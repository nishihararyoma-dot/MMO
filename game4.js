'use strict';

// =========================================================================
// 顔文字ファンタジー3D メインループ・駆動・HUD更新 (game4.js)
// =========================================================================

Object.assign(KaomojiMMORPG.prototype, {

    loop(now) {
        const dt = Math.min(0.05, Math.max(0.001, (now - this.lastTime) / 1000));
        this.lastTime = now;
        const elapsed = now / 1000;

        this.updatePlayer(dt, elapsed);
        this.updatePet(dt, elapsed);
        this.updateMonsters(dt);
        this.updateAiAllies(dt);
        if (this.updateRemotePlayers) this.updateRemotePlayers(dt);
        if (this.updateFirebaseSync) this.updateFirebaseSync(dt);
        this.updateEffectsAndOverlays(dt, elapsed);

        if (this.useWebGL && this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }

        requestAnimationFrame((t) => this.loop(t));
    },

    updatePlayer(dt, elapsed) {
        if (!this.player) return;
        const st = this.calcDerivedStats();

        if (this.player.invulnTimer > 0) this.player.invulnTimer = Math.max(0, this.player.invulnTimer - dt);
        if (this.player.stunTimer > 0) this.player.stunTimer = Math.max(0, this.player.stunTimer - dt);
        if (this.player.skillAnimTimer > 0) {
            this.player.skillAnimTimer = Math.max(0, this.player.skillAnimTimer - dt);
            if (this.player.skillAnimTimer <= 0) this.player.skillAnimType = 'none';
        }
        if (this.player.defBuffTimer > 0) {
            this.player.defBuffTimer = Math.max(0, this.player.defBuffTimer - dt);
            if (this.player.defBuffTimer <= 0) this.player.defBuffBonus = 0;
        }
        if (this.player.warcryTimer > 0) {
            this.player.warcryTimer = Math.max(0, this.player.warcryTimer - dt);
            if (this.player.warcryTimer <= 0) this.player.warcryBonus = 1.0;
        }

        if (this.emoteTimer > 0) {
            this.emoteTimer = Math.max(0, this.emoteTimer - dt);
            if (this.emoteTimer <= 0) {
                this.emoteMotion = 'none';
                if (this.useWebGL && this.player.frontMat) {
                    const hexStr = '#' + this.getPlayerBodyHexColor().toString(16).padStart(6, '0');
                    this.player.frontMat.map = getKaomojiFaceTexture(this.getBasePlayerKaomoji(), this.getPlayerFaceBgHex(), '#ffffff', hexStr);
                    this.player.frontMat.needsUpdate = true;
                }
            }
        }

        for (let i = 0; i < 5; i++) {
            if (this.player.skillCds[i] > 0) {
                this.player.skillCds[i] = Math.max(0, this.player.skillCds[i] - dt);
            }
        }

        // 中央ワープポータル検知（街では乗った瞬間にステージ選択を開き、狩場では街へ帰還）
        const onWarp = this.isOnWarpPortal(this.player.pos);
        const warpBox = document.getElementById('warp-prompt-box');
        const warpBtn = document.getElementById('btn-exec-warp');
        if (warpBox) {
            if (onWarp) {
                warpBox.classList.remove('hidden');
                if (warpBtn) {
                    warpBtn.textContent = (this.currentZoneId === 'town')
                        ? '🌀 ステージ選択'
                        : '🏠 街へ帰還ワープ';
                }
                if (this.currentZoneId === 'town' && !this.wasOnWarp && !this.isModalOpen) {
                    sfx.playSkill();
                    this.openGrowthModal('travel');
                }
            } else {
                warpBox.classList.add('hidden');
            }
        }
        this.wasOnWarp = onWarp;

        const inTown = this.currentZoneId === 'town';
        const hpRegen = inTown ? st.maxHp * 0.40 : st.maxHp * (0.015 + st.treeHpRegenBonus);
        const mpRegen = inTown ? st.maxMp * 0.50 : (4.5 + this.saveData.stats.int * 0.45) * st.treeMpRegenMult;
        this.player.hp = Math.min(st.maxHp, this.player.hp + hpRegen * dt);
        this.player.mp = Math.min(st.maxMp, this.player.mp + mpRegen * dt);

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
                if (dist > 3.8) {
                    this.player.pos.x += (dx / dist) * st.moveSpeed * dt;
                    this.player.pos.z += (dz / dist) * st.moveSpeed * dt;
                    this.clampPosition(this.player.pos);
                    this.player.rotY = Math.atan2(dx, dz);
                }
            }
        }

        if (this.player.group) {
            this.player.group.position.copy(this.player.pos);
            this.player.group.rotation.x = 0;
            this.player.group.rotation.z = 0;

            if (this.player.orbitPart) {
                this.player.orbitPart.rotation.y += dt * 4.5;
                this.player.orbitPart.rotation.x += dt * 2.8;
            }
            if (this.player.backHalo) {
                this.player.backHalo.rotation.z += dt * 1.8;
            }

            if (this.player.skillAnimTimer > 0) {
                const prog = 1 - (this.player.skillAnimTimer / Math.max(0.01, this.player.skillAnimDur));
                const sType = this.player.skillAnimType;
                if (sType === 'basic_slash') {
                    // 剣を振りかぶってから前方へ鋭く振り下ろす
                    const swing = prog < 0.28
                        ? (-0.75 * (prog / 0.28))
                        : (-0.75 + 2.35 * ((prog - 0.28) / 0.72));
                    if (this.player.wpnGroup) {
                        this.player.wpnGroup.rotation.x = swing;
                        this.player.wpnGroup.rotation.y = Math.sin(prog * Math.PI) * -0.35;
                    }
                } else if (sType === 'jump_slash') {
                    this.player.group.position.y = Math.sin(prog * Math.PI) * 1.45;
                    this.player.group.rotation.x = Math.sin(prog * Math.PI) * 0.32;
                    if (this.player.wpnGroup) this.player.wpnGroup.rotation.x = -0.9 + prog * 2.6;
                } else if (sType === 'spin_whirl') {
                    this.player.group.position.y = Math.sin(prog * Math.PI) * 0.45;
                    this.player.rotY += dt * 22.0;
                    if (this.player.wpnGroup) {
                        this.player.wpnGroup.rotation.x = 1.25;
                        this.player.wpnGroup.rotation.z = 1.15;
                    }
                } else if (sType === 'cast_up') {
                    this.player.group.position.y = Math.sin(prog * Math.PI) * 0.42;
                    if (this.player.wpnGroup) this.player.wpnGroup.rotation.x = -0.45;
                } else if (sType === 'slam_ground') {
                    this.player.group.position.y = Math.sin(prog * Math.PI) * 0.85;
                    if (this.player.wpnGroup) this.player.wpnGroup.rotation.x = prog < 0.4 ? -0.95 : 1.65;
                }
            } else if (this.emoteTimer > 0) {
                if (this.emoteMotion === 'jump') {
                    this.player.group.position.y = Math.abs(Math.sin(elapsed * 12)) * 0.65;
                } else if (this.emoteMotion === 'spin') {
                    this.player.rotY += dt * 10.5;
                } else if (this.emoteMotion === 'flip') {
                    this.player.group.position.y = Math.abs(Math.sin(elapsed * 16)) * 0.85;
                    this.player.rotY += dt * 7.5;
                } else if (this.emoteMotion === 'beam') {
                    if (this.player.wpnGroup) this.player.wpnGroup.rotation.x = 1.25;
                } else if (this.emoteMotion === 'bow' && this.player.head) {
                    this.player.head.position.y = 1.12;
                    this.player.head.rotation.x = 0.65;
                } else if (this.emoteMotion === 'shake' && this.player.head) {
                    this.player.head.rotation.z = Math.sin(elapsed * 26) * 0.22;
                }
            } else {
                if (mag > 0.05) {
                    this.player.group.position.y = Math.abs(Math.sin(elapsed * 14)) * 0.14;
                }
                if (this.player.head) {
                    this.player.head.position.y = 1.58;
                    this.player.head.rotation.x = 0;
                    this.player.head.rotation.z = 0;
                }
                if (this.player.wpnGroup) {
                    this.player.wpnGroup.rotation.x *= 0.78;
                    this.player.wpnGroup.rotation.y *= 0.78;
                    this.player.wpnGroup.rotation.z *= 0.78;
                }
            }

            this.player.group.rotation.y = this.player.rotY;
        }

        // 近接オート通常攻撃
        if (this.autoAttack && !this.isModalOpen && !this.isDead && this.player.stunTimer <= 0 && !inTown) {
            const target = this.getNearestMonster(5.2) || this.getValidTarget();
            if (target && !target.dead && this.player.pos.distanceTo(target.pos) <= 5.1) {
                this.selectedTarget = target;
                this.autoAtkTimer -= dt;
                if (this.autoAtkTimer <= 0) {
                    this.autoAtkTimer = Math.max(0.45, 1.05 * (1 - st.cdReduction * 0.6));
                    const dx = target.pos.x - this.player.pos.x;
                    const dz = target.pos.z - this.player.pos.z;
                    if (dx * dx + dz * dz > 0.01) this.player.rotY = Math.atan2(dx, dz);

                    const crit = Math.random() < st.critChance;
                    this.damageMonster(target, st.physAtk * (crit ? st.critDmg : 1), crit);
                    this.spawnPlayerAttackEffect(target.pos, st.wpnGlowColor, crit);
                    if (this.player.skillAnimTimer <= 0) {
                        this.player.skillAnimType = 'basic_slash';
                        this.player.skillAnimDur = 0.24;
                        this.player.skillAnimTimer = 0.24;
                    }
                }
            }
        }

        this.updateBarsOnly();
    },

    runAutoSupportAndSkills(st) {
        const d = this.saveData;
        const hpRatio = this.player.hp / Math.max(1, st.maxHp);
        const mpRatio = this.player.mp / Math.max(1, st.maxMp);
        const nearEnemy = this.getNearestMonster(9.5);

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

            const dist = this.player.pos.distanceTo(nearEnemy.pos);
            if (dist <= 5.8) {
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
                if (m.noRespawn) return;
                m.respawnTimer -= dt;
                if (m.respawnTimer <= 0) {
                    m.dead = false;
                    m.hp = m.maxHp;
                    m.aggro = false;
                    m.casting = null;
                    m.stunTimer = 0;
                    m.slowTimer = 0;
                    m.burnTimer = 0;
                    m.atkAnimTimer = 0;
                    m.pos.copy(m.spawnPos);
                    if (m.group) {
                        m.group.position.copy(m.pos);
                        m.group.rotation.x = 0;
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
            if (m.atkAnimTimer > 0) m.atkAnimTimer = Math.max(0, m.atkAnimTimer - dt);

            if (m.group) {
                if (m.atkAnimTimer > 0) {
                    const lunge = Math.sin((m.atkAnimTimer / 0.28) * Math.PI);
                    const fwdX = Math.sin(m.group.rotation.y);
                    const fwdZ = Math.cos(m.group.rotation.y);
                    m.group.position.set(m.pos.x + fwdX * lunge * 0.95, lunge * 0.28, m.pos.z + fwdZ * lunge * 0.95);
                    m.group.rotation.x = lunge * 0.34;
                } else {
                    m.group.position.copy(m.pos);
                    m.group.rotation.x = 0;
                }
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
                    this.camShake = Math.max(this.camShake, 0.42);
                    this.spawnDomeEffect(m.pos, 0xf43f5e, 6.0);
                    this.spawnRingEffect(m.pos, 0xf43f5e, 10.5);
                    if (pPos.distanceTo(m.pos) <= 10.5) {
                        this.damagePlayer(m.atk * 2.2);
                        this.showAlertBanner(`💥 ${m.name}の大技が炸裂！`, 1600);
                    }
                }
                return;
            }

            const dist = m.pos.distanceTo(pPos);
            if (dist < 17.5 || this.towerState.active) m.aggro = true;
            if (!m.aggro) return;

            const spdMult = m.slowTimer > 0 ? (m.slowFactor || 0.5) : 1.0;
            const moveSpd = (m.isBoss ? 4.5 : 5.3) * spdMult;
            const meleeRange = m.isBoss ? 5.6 : 4.3;

            const dx = pPos.x - m.pos.x;
            const dz = pPos.z - m.pos.z;
            if (m.group && (dx * dx + dz * dz > 0.01)) {
                m.group.rotation.y = Math.atan2(dx, dz);
            }

            if (dist > meleeRange) {
                m.pos.x += (dx / dist) * moveSpd * dt;
                m.pos.z += (dz / dist) * moveSpd * dt;
            } else {
                m.autoTimer -= dt * spdMult;
                if (m.autoTimer <= 0) {
                    m.autoTimer = m.isBoss ? 2.0 : 1.75;
                    m.atkAnimTimer = 0.28;
                    this.damagePlayer(m.atk);
                    this.spawnEnemyAttackEffect(m.pos, pPos, m.color, m.isBoss);
                    if (m.isBoss) this.camShake = Math.max(this.camShake, 0.18);
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

    updateEffectsAndOverlays(dt, elapsed) {
        if (this.warpCrystal && this.warpGroup && this.warpGroup.visible) {
            this.warpCrystal.rotation.y += dt * 2.4;
            this.warpCrystal.position.y = 2.35 + Math.sin(elapsed * 3.5) * 0.22;
        }

        for (let i = this.effects.length - 1; i >= 0; i--) {
            const ef = this.effects[i];
            ef.life -= dt;
            if (ef.life <= 0) {
                if (this.scene && ef.mesh) this.scene.remove(ef.mesh);
                this.effects.splice(i, 1);
            } else {
                const ratio = ef.life / ef.maxLife;
                const prog = 1 - ratio;
                if (ef.kind === 'expand' && ef.mesh) {
                    const s = 1 + prog * 0.45;
                    ef.mesh.scale.set(s, s, 1);
                } else if (ef.kind === 'rise' && ef.mesh) {
                    ef.mesh.position.y += dt * 2.6;
                    ef.mesh.rotation.y += dt * 6.0;
                }
                if (ef.mesh && ef.mesh.material) ef.mesh.material.opacity = ratio;
            }
        }

        if (this.useWebGL && this.camera && this.player) {
            let shakeX = 0, shakeY = 0;
            if (this.camShake > 0) {
                shakeX = (Math.random() - 0.5) * this.camShake * 1.6;
                shakeY = (Math.random() - 0.5) * this.camShake * 1.6;
                this.camShake = Math.max(0, this.camShake - dt * 1.4);
            }

            const cx = this.player.pos.x + Math.sin(this.camYaw) * Math.cos(this.camPitch) * this.camDist + shakeX;
            const cy = this.player.pos.y + Math.sin(this.camPitch) * this.camDist + shakeY;
            const cz = this.player.pos.z + Math.cos(this.camYaw) * Math.cos(this.camPitch) * this.camDist;
            this.camera.position.set(cx, cy, cz);
            this.camera.lookAt(this.player.pos.x, this.player.pos.y + 1.2, this.player.pos.z);

            if (this.player.headPlateEl) {
                const pScale = this.getPlayerBodyScale();
                const pSc = this.projectToScreen(new THREE.Vector3(this.player.pos.x, 2.55 * pScale, this.player.pos.z));
                if (pSc) {
                    this.player.headPlateEl.style.display = 'block';
                    this.player.headPlateEl.style.left = `${pSc.x}px`;
                    this.player.headPlateEl.style.top = `${pSc.y}px`;
                } else {
                    this.player.headPlateEl.style.display = 'none';
                }
            }
        }

        // オンライン仲間の頭上プレート更新
        this.remotePlayers.forEach(rp => {
            if (!rp.plateEl) return;
            if (!rp.visible) {
                rp.plateEl.style.display = 'none';
                return;
            }
            const sc = this.projectToScreen(new THREE.Vector3(rp.pos.x, 2.55 * (rp.bodyScale || 1), rp.pos.z));
            if (sc) {
                rp.plateEl.style.display = 'block';
                rp.plateEl.style.left = `${sc.x}px`;
                rp.plateEl.style.top = `${sc.y}px`;
            } else {
                rp.plateEl.style.display = 'none';
            }
        });

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

    hasClaimableAchievement() {
        const d = this.saveData;
        const tr = d.statsTrack || {};
        return ACHIEVEMENTS.some(a => {
            if ((d.claimedAchievements || []).includes(a.id)) return false;
            const cur = a.key === 'rebirthCount' ? (d.rebirthCount || 0) : (tr[a.key] || 0);
            return cur >= a.req;
        });
    },

    refreshAllHUD() {
        const d = this.saveData;
        const evo = EVOLUTIONS[d.evolutionId] || EVOLUTIONS.novice;
        const ttl = TITLES[d.equippedTitleId] || TITLES.title_none;

        document.getElementById('hud-kaomoji').textContent = this.getBasePlayerKaomoji();
        document.getElementById('hud-name').textContent = evo.name;
        document.getElementById('hud-lv').textContent = d.rebirthCount > 0 ? `Lv.${d.lv} (転生${d.rebirthCount})` : `Lv.${d.lv}`;
        document.getElementById('hud-gold').textContent = `${formatBigNum(d.gold)}G`;

        const onlineBadge = document.getElementById('hud-online-badge');
        if (onlineBadge) {
            if (this.fbConnected) {
                const totalOnline = 1 + this.remotePlayers.size;
                onlineBadge.textContent = `🌐 オンライン(${totalOnline}人)`;
                onlineBadge.style.background = '#065f46';
                onlineBadge.style.color = '#6ee7b7';
            } else {
                onlineBadge.textContent = 'オフライン';
                onlineBadge.style.background = '#1e293b';
                onlineBadge.style.color = '#94a3b8';
            }
        }

        const titleEl = document.getElementById('hud-title-badge');
        const dispTitle = (d.exTitle && d.exTitle.trim()) ? d.exTitle.trim() : (ttl.id !== 'title_none' ? ttl.name : '');
        if (dispTitle) {
            titleEl.textContent = dispTitle;
            titleEl.classList.remove('hidden');
        } else {
            titleEl.classList.add('hidden');
        }

        if (this.towerState.active) {
            document.getElementById('hud-stage-badge').textContent = `TOWER ${this.towerState.floor}F`;
            document.getElementById('hud-zone-name').textContent = `無限の試練の塔 (最高${(d.statsTrack && d.statsTrack.bestTowerFloor) || 0}F)`;
            const safeBadge = document.getElementById('hud-safe-badge');
            safeBadge.textContent = '🗼試練中';
            safeBadge.style.background = '#9333ea';
        } else {
            const zone = ZONES[this.currentZoneId] || ZONES.town;
            document.getElementById('hud-stage-badge').textContent = `STAGE ${zone.stageNum}`;
            document.getElementById('hud-zone-name').textContent = zone.name;
            const safeBadge = document.getElementById('hud-safe-badge');
            if (zone.safe) {
                safeBadge.textContent = '🛡️安全街';
                safeBadge.style.background = '#059669';
            } else {
                safeBadge.textContent = '⚔️狩場';
                safeBadge.style.background = '#e11d48';
            }
        }

        const threatBadge = document.getElementById('hud-threat-badge');
        if ((d.threatRank || 0) > 0 && !this.towerState.active) {
            threatBadge.textContent = `脅威+${d.threatRank}`;
            threatBadge.classList.remove('hidden');
        } else {
            threatBadge.classList.add('hidden');
        }

        const alertDot = document.getElementById('badge-growth-alert');
        if (d.ap > 0 || d.sp > 0 || this.hasClaimableAchievement()) {
            alertDot?.classList.remove('hidden');
        } else {
            alertDot?.classList.add('hidden');
        }

        // 親指アーク（扇形）丸型スキルボタン 1〜5
        const slotWrap = document.getElementById('skill-slots-container');
        slotWrap.innerHTML = [0, 1, 2, 3, 4].map(i => {
            const skId = d.equippedSkills[i];
            const sk = skId ? SKILLS[skId] : null;
            if (!sk) {
                return `<button class="skill-slot-btn skill-arc-${i}" style="opacity:0.32;" disabled><span style="font-size:9px; font-weight:900;">枠${i + 1}</span></button>`;
            }
            const skLv = d.skills[skId] || 1;
            const mpCost = getSkillMpCost(sk, skLv);
            return `
                <button class="skill-slot-btn skill-arc-${i}" data-slot="${i}">
                    <span style="font-size:18px; line-height:1;">${sk.icon}</span>
                    <span style="font-size:8px; font-weight:900; color:#7dd3fc; margin-top:2px; line-height:1;">MP${mpCost}</span>
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
    }
});
