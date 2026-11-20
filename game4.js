'use strict';

// =========================================================================
// 顔文字ファンタジー3D メインループ・AI更新・操作UI・HUD描画 (game4.js)
// =========================================================================

Object.assign(KaomojiMMORPG.prototype, {
    loop(now) {
        const rawDt = (now - this.lastTime) / 1000;
        this.lastTime = now;
        const dt = Math.min(0.05, Math.max(0.001, rawDt));
        const elapsed = now / 1000;

        try {
            this.update(dt, elapsed);
        } catch (e) {
            console.error('Update error:', e);
        }

        if (this.useWebGL && this.renderer && this.scene && this.camera) {
            try {
                this.renderer.render(this.scene, this.camera);
            } catch (e) {}
        }

        requestAnimationFrame((t) => this.loop(t));
    },

    update(dt, elapsed) {
        if (!this.player) return;

        // タイトル画面中はカメラをゆっくり旋回させるのみ
        if (this.inTitleScreen) {
            this.camYaw += dt * 0.25;
            this.updateCamera(dt);
            if (this.warpCrystal) this.warpCrystal.rotation.y += dt * 1.5;
            return;
        }

        const st = this.calcDerivedStats();

        // クールダウン・状態異常・バフタイマー更新
        this.player.skillCds = this.player.skillCds || {};
        this.player.skillCooldowns = this.player.skillCooldowns || {};
        for (let i = 0; i < 5; i++) {
            const cur = Math.max(this.player.skillCds[i] || 0, this.player.skillCooldowns[i] || 0);
            const next = Math.max(0, cur - dt);
            this.player.skillCds[i] = next;
            this.player.skillCooldowns[i] = next;
        }

        if (this.player.invulnTimer > 0) this.player.invulnTimer = Math.max(0, this.player.invulnTimer - dt);
        if (this.player.stunTimer > 0) this.player.stunTimer = Math.max(0, this.player.stunTimer - dt);
        if (this.player.defBuffTimer > 0) this.player.defBuffTimer = Math.max(0, this.player.defBuffTimer - dt);
        if (this.player.warcryTimer > 0) this.player.warcryTimer = Math.max(0, this.player.warcryTimer - dt);
        if (this.player.skillAnimTimer > 0) this.player.skillAnimTimer = Math.max(0, this.player.skillAnimTimer - dt);

        // エモート表情リセット
        if (this.emoteTimer > 0) {
            this.emoteTimer -= dt;
            if (this.emoteTimer <= 0) {
                this.emoteMotion = 'none';
                if (this.useWebGL && this.player.faceMesh && this.player.faceMesh.material) {
                    this.player.faceMesh.material.map = getKaomojiFaceTexture(
                        this.getBasePlayerKaomoji(),
                        this.getPlayerFaceBgHex(),
                        '#ffffff',
                        '#38bdf8'
                    );
                    this.player.faceMesh.material.needsUpdate = true;
                }
            }
        }

        // HP/MP自然回復（街では高速回復）
        if (!this.isDead) {
            if (this.currentZoneId === 'town') {
                this.player.hp = Math.min(st.maxHp, this.player.hp + st.maxHp * 0.25 * dt);
                this.player.mp = Math.min(st.maxMp, this.player.mp + st.maxMp * 0.30 * dt);
            } else {
                const hpRate = 0.015 + (st.treeHpRegenBonus || 0);
                const mpRate = 0.045 * (st.treeMpRegenMult || 1.0);
                this.player.hp = Math.min(st.maxHp, this.player.hp + st.maxHp * hpRate * dt);
                this.player.mp = Math.min(st.maxMp, this.player.mp + st.maxMp * mpRate * dt);
            }
        }

        // プレイヤー移動 & オート戦闘
        this.updatePlayerMovementAndAuto(dt, elapsed, st);

        // ペット更新
        if (this.updatePet) {
            this.updatePet(dt, elapsed);
        }

        // モンスターAI更新
        this.updateMonstersAI(dt, elapsed);

        // 街のNPC歩行
        this.updateTownAllies(dt, elapsed);

        // エフェクト・浮遊テキスト更新
        this.updateEffectsAndOverlays(dt);

        // カメラ更新
        this.updateCamera(dt);

        // ワープ陣アニメーション & プロンプト表示
        if (this.warpCrystal) {
            this.warpCrystal.rotation.y += dt * 1.8;
            this.warpCrystal.position.y = 2.0 + Math.sin(elapsed * 3.0) * 0.18;
        }
        const distWarp = Math.hypot(this.player.pos.x, this.player.pos.z + 14);
        const warpBox = document.getElementById('warp-prompt-box');
        if (warpBox) {
            if (distWarp < 3.0 && !this.isModalOpen) {
                warpBox.classList.remove('hidden');
                if (!this.wasOnWarp) {
                    this.wasOnWarp = true;
                    if (this.openGrowthModal) this.openGrowthModal('zones');
                }
            } else {
                warpBox.classList.add('hidden');
                if (distWarp >= 3.5) this.wasOnWarp = false;
            }
        }

        // オンライン通信同期
        if (this.fbConnected && this.syncFirebaseTick) {
            this.syncFirebaseTick(dt);
        }

        // HUD定期更新
        this._hudTick = (this._hudTick || 0) + dt;
        if (this._hudTick >= 0.1) {
            this._hudTick = 0;
            this.refreshAllHUD();
        }
    },

    updatePlayerMovementAndAuto(dt, elapsed, st) {
        if (this.isDead) return;

        let mx = 0;
        let mz = 0;
        if (this.keys['KeyW'] || this.keys['ArrowUp']) mz -= 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) mz += 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) mx -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) mx += 1;

        if (Math.hypot(this.joyVec.x, this.joyVec.y) > 0.08) {
            mx = this.joyVec.x;
            mz = this.joyVec.y;
        }

        const hasInput = Math.hypot(mx, mz) > 0.05;
        let isMoving = false;

        if (hasInput && (this.player.stunTimer || 0) <= 0) {
            const len = Math.hypot(mx, mz);
            const nx = mx / len;
            const nz = mz / len;
            const sin = Math.sin(this.camYaw);
            const cos = Math.cos(this.camYaw);
            const wx = nx * cos + nz * sin;
            const wz = -nx * sin + nz * cos;

            this.player.pos.x += wx * st.moveSpeed * dt;
            this.player.pos.z += wz * st.moveSpeed * dt;
            this.player.rotY = Math.atan2(wx, wz);
            isMoving = true;
        } else if (this.autoHunt && this.currentZoneId !== 'town' && (this.player.stunTimer || 0) <= 0) {
            const target = this.getNearestMonster(60);
            if (target && !target.dead) {
                const dx = target.pos.x - this.player.pos.x;
                const dz = target.pos.z - this.player.pos.z;
                const dist = Math.hypot(dx, dz);
                if (dist > 3.6) {
                    this.player.pos.x += (dx / dist) * st.moveSpeed * dt;
                    this.player.pos.z += (dz / dist) * st.moveSpeed * dt;
                    this.player.rotY = Math.atan2(dx, dz);
                    isMoving = true;
                }
            }
        }

        // フィールド境界クランプ
        this.player.pos.x = Math.max(-22, Math.min(22, this.player.pos.x));
        this.player.pos.z = Math.max(-22, Math.min(22, this.player.pos.z));

        // 3Dメッシュ姿勢・モーション更新
        if (this.player.group) {
            let yOffset = isMoving ? Math.abs(Math.sin(elapsed * 12)) * 0.16 : Math.abs(Math.sin(elapsed * 3)) * 0.04;
            let extraRotY = 0;
            let extraRotX = 0;

            if (this.emoteTimer > 0) {
                if (this.emoteMotion === 'jump') yOffset += Math.abs(Math.sin(elapsed * 10)) * 0.55;
                else if (this.emoteMotion === 'spin') extraRotY = elapsed * 8;
                else if (this.emoteMotion === 'bow') extraRotX = 0.45;
            }

            if ((this.player.skillAnimTimer || 0) > 0) {
                const dur = this.player.skillAnimDur || 0.25;
                const prog = 1 - (this.player.skillAnimTimer / dur);
                if (this.player.skillAnimType === 'spin_whirl') {
                    extraRotY += prog * Math.PI * 2;
                } else if (this.player.skillAnimType === 'jump_slash') {
                    yOffset += Math.sin(prog * Math.PI) * 0.65;
                }
                if (this.player.weaponPivot) {
                    this.player.weaponPivot.rotation.x = 0.45 + Math.sin(prog * Math.PI) * 1.45;
                }
            } else if (this.player.weaponPivot) {
                this.player.weaponPivot.rotation.x = 0.45 + Math.sin(elapsed * 4) * 0.06;
            }

            this.player.group.position.set(this.player.pos.x, yOffset, this.player.pos.z);
            this.player.group.rotation.set(extraRotX, this.player.rotY + extraRotY, 0);
        }

        // オート通常攻撃 & AUTO狩りスキル発動
        if (this.currentZoneId !== 'town' && (this.player.stunTimer || 0) <= 0) {
            this.autoAtkTimer -= dt;
            if ((this.autoAttack || this.autoHunt) && this.autoAtkTimer <= 0) {
                const near = this.getNearestMonster(5.8);
                if (near && !near.dead) {
                    this.performBasicAttack();
                } else {
                    this.autoAtkTimer = 0.25;
                }
            }

            if (this.autoHunt) {
                this.autoSkillTimer -= dt;
                if (this.autoSkillTimer <= 0) {
                    this.autoSkillTimer = 0.65;
                    const near = this.getNearestMonster(8.5);
                    if (near && !near.dead) {
                        const eq = this.saveData.equippedSkills || [];
                        for (let i = 0; i < eq.length; i++) {
                            const sid = eq[i];
                            if (!sid || !SKILLS[sid]) continue;
                            const sk = SKILLS[sid];
                            if (sk.type === 'HEAL' && this.player.hp > st.maxHp * 0.65) continue;
                            if (sk.type === 'HEAL_MP' && this.player.hp > st.maxHp * 0.7 && this.player.mp > st.maxMp * 0.5) continue;
                            const cds = this.player.skillCds || {};
                            if ((cds[i] || 0) <= 0 && this.player.mp >= getSkillMpCost(sk, this.saveData.skills[sid] || 1)) {
                                this.useSkillSlot(i);
                                break;
                            }
                        }
                    }
                }
            }
        }
    },

    updateMonstersAI(dt, elapsed) {
        let activeBossCast = null;

        for (const m of this.monsters) {
            if (m.dead) {
                if (!m.noRespawn) {
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
                            m.group.visible = true;
                            m.group.position.copy(m.pos);
                        }
                        if (m.plateEl) m.plateEl.style.display = 'block';
                    }
                }
                continue;
            }

            // 炎上スリップダメージ
            if (m.burnTimer > 0) {
                m.burnTimer -= dt;
                m.burnTickTimer = (m.burnTickTimer || 1.0) - dt;
                if (m.burnTickTimer <= 0) {
                    m.burnTickTimer = 1.0;
                    this.damageMonster(m, Math.max(1, Math.round(m.burnDps || 5)), false);
                    if (m.dead) continue;
                }
            }

            if (m.stunTimer > 0) {
                m.stunTimer = Math.max(0, m.stunTimer - dt);
                continue;
            }

            const slowMult = m.slowTimer > 0 ? (m.slowFactor || 0.5) : 1.0;
            if (m.slowTimer > 0) m.slowTimer = Math.max(0, m.slowTimer - dt);

            const dx = this.player.pos.x - m.pos.x;
            const dz = this.player.pos.z - m.pos.z;
            const dist = Math.hypot(dx, dz);

            if (dist < (m.isBoss ? 22 : 14) || this.towerState.active) {
                m.aggro = true;
            }

            // ボス大技詠唱
            if (m.casting) {
                m.casting.elapsed += dt;
                if (m === this.selectedTarget || dist < 24) {
                    activeBossCast = m;
                }
                if (m.casting.elapsed >= m.casting.duration) {
                    const castRadius = m.casting.radius || 8.0;
                    if (this.spawnRingEffect) this.spawnRingEffect(m.pos, 0xef4444, castRadius);
                    if (dist <= castRadius) {
                        this.damagePlayer(Math.round(m.atk * 2.1), m);
                    }
                    m.casting = null;
                }
                continue;
            }

            if (m.aggro && !this.isDead) {
                const reach = 2.3 + (m.scale || 1) * 0.7;
                if (dist > reach) {
                    const spd = (m.isBoss ? 4.3 : 4.7) * slowMult;
                    m.pos.x += (dx / dist) * spd * dt;
                    m.pos.z += (dz / dist) * spd * dt;
                    m.rotY = Math.atan2(dx, dz);
                    if (m.group) m.group.rotation.y = m.rotY;
                } else {
                    m.autoTimer -= dt;
                    if (m.autoTimer <= 0) {
                        m.autoTimer = m.isBoss ? 1.5 : 1.35;
                        this.spawnEnemyAttackEffect(m.pos, this.player.pos, m.color || 0xef4444, m.isBoss);
                        this.damagePlayer(m.atk, m);
                    }
                }

                if (m.isBoss && dist < 18) {
                    m.castCooldown = (m.castCooldown || 8.0) - dt;
                    if (m.castCooldown <= 0) {
                        m.castCooldown = 9.5;
                        m.casting = {
                            name: m.isRaidBoss ? '終焉のカタストロフィ' : '覇王の衝撃波',
                            elapsed: 0,
                            duration: 2.6,
                            radius: 8.2
                        };
                    }
                }
            }

            if (m.group) {
                const hop = Math.abs(Math.sin(elapsed * 5 + m.pos.x)) * 0.14;
                m.group.position.set(m.pos.x, hop, m.pos.z);
            }
        }

        // ボス詠唱ゲージUI更新
        const castBox = document.getElementById('boss-cast-box');
        if (castBox) {
            if (!activeBossCast || !activeBossCast.casting) {
                castBox.classList.add('hidden');
            } else {
                castBox.classList.remove('hidden');
                const titleEl = document.getElementById('boss-cast-title');
                const barEl = document.getElementById('boss-cast-bar');
                if (titleEl) titleEl.textContent = `⚠️ ${activeBossCast.name}：【${activeBossCast.casting.name}】`;
                if (barEl) {
                    const pct = Math.min(100, (activeBossCast.casting.elapsed / activeBossCast.casting.duration) * 100);
                    barEl.style.width = `${pct}%`;
                }
            }
        }
    },

    updateTownAllies(dt, elapsed) {
        if (this.currentZoneId !== 'town') return;
        for (const a of this.aiAllies) {
            if (a.group) {
                a.group.position.y = Math.abs(Math.sin(elapsed * 3.5 + a.pos.x)) * 0.08;
                if (this.player) {
                    const dx = this.player.pos.x - a.pos.x;
                    const dz = this.player.pos.z - a.pos.z;
                    a.group.rotation.y = Math.atan2(dx, dz);
                }
            }
        }
    },

    updateEffectsAndOverlays(dt) {
        // 3Dエフェクト更新
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const ef = this.effects[i];
            ef.life -= dt;
            if (ef.life <= 0) {
                if (this.scene && ef.mesh) this.scene.remove(ef.mesh);
                this.effects.splice(i, 1);
                continue;
            }
            const ratio = ef.life / ef.maxLife;
            if (ef.mesh) {
                if (ef.kind === 'expand') {
                    const sc = 1 + (1 - ratio) * 0.65;
                    ef.mesh.scale.set(sc, sc, sc);
                } else if (ef.kind === 'rise') {
                    ef.mesh.position.y += dt * 2.2;
                }
                if (ef.mesh.material) ef.mesh.material.opacity = ratio;
            }
        }

        // モンスターHPプレート投影
        for (const m of this.monsters) {
            if (!m.plateEl || m.dead) continue;
            const worldTop = m.pos.clone().add(new THREE.Vector3(0, (m.scale || 1) * 1.85 + 0.4, 0));
            const scr = this.projectToScreen(worldTop);
            if (!scr.visible) {
                m.plateEl.style.display = 'none';
            } else {
                m.plateEl.style.display = 'block';
                m.plateEl.style.left = `${scr.x}px`;
                m.plateEl.style.top = `${scr.y}px`;
                const fill = m.plateEl.querySelector('.m-hp-fill');
                if (fill) {
                    const pct = Math.max(0, Math.min(100, (m.hp / Math.max(1, m.maxHp)) * 100));
                    fill.style.width = `${pct}%`;
                }
            }
        }

        // 街NPCネームプレート投影
        for (const a of this.aiAllies) {
            if (!a.plateEl) continue;
            const scr = this.projectToScreen(a.pos.clone().add(new THREE.Vector3(0, 1.9, 0)));
            if (!scr.visible) {
                a.plateEl.style.display = 'none';
            } else {
                a.plateEl.style.display = 'block';
                a.plateEl.style.left = `${scr.x}px`;
                a.plateEl.style.top = `${scr.y}px`;
            }
        }

        // 浮遊ダメージテキスト更新
        for (let i = this.floatTexts.length - 1; i >= 0; i--) {
            const ft = this.floatTexts[i];
            ft.life -= dt;
            ft.worldPos.y += dt * 1.4;
            if (ft.life <= 0) {
                ft.el.remove();
                this.floatTexts.splice(i, 1);
                continue;
            }
            const scr = this.projectToScreen(ft.worldPos);
            if (!scr.visible) {
                ft.el.style.display = 'none';
            } else {
                ft.el.style.display = 'block';
                ft.el.style.left = `${scr.x}px`;
                ft.el.style.top = `${scr.y}px`;
                ft.el.style.opacity = String(Math.min(1, ft.life * 1.6));
            }
        }

        // エモート吹き出し更新
        for (let i = this.emoteBubbles.length - 1; i >= 0; i--) {
            const eb = this.emoteBubbles[i];
            eb.life -= dt;
            if (eb.life <= 0) {
                eb.el.remove();
                this.emoteBubbles.splice(i, 1);
                continue;
            }
            const scr = this.projectToScreen(eb.worldPos);
            if (!scr.visible) {
                eb.el.style.display = 'none';
            } else {
                eb.el.style.display = 'block';
                eb.el.style.left = `${scr.x}px`;
                eb.el.style.top = `${scr.y}px`;
            }
        }
    },

    projectToScreen(vec3) {
        if (!this.useWebGL || !this.camera) {
            return { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5, visible: false };
        }
        const v = vec3.clone().project(this.camera);
        if (v.z > 1) return { x: 0, y: 0, visible: false };
        return {
            x: (v.x * 0.5 + 0.5) * window.innerWidth,
            y: (-v.y * 0.5 + 0.5) * window.innerHeight,
            visible: true
        };
    },

    updateCamera(dt) {
        if (!this.useWebGL || !this.camera || !this.player) return;
        const target = this.player.pos.clone().add(new THREE.Vector3(0, 1.3, 0));
        const hDist = Math.cos(this.camPitch) * this.camDist;
        const vDist = Math.sin(this.camPitch) * this.camDist;

        let shakeX = 0;
        let shakeY = 0;
        if (this.camShake > 0) {
            this.camShake = Math.max(0, this.camShake - dt);
            shakeX = (Math.random() - 0.5) * this.camShake * 1.4;
            shakeY = (Math.random() - 0.5) * this.camShake * 1.4;
        }

        this.camera.position.set(
            target.x + Math.sin(this.camYaw) * hDist + shakeX,
            target.y + vDist + shakeY,
            target.z + Math.cos(this.camYaw) * hDist
        );
        this.camera.lookAt(target);
    },

    spawnTowerFloorMonsters(floor) {
        this.clearZoneEntities();
        const scale = Math.pow(1.22, floor - 1);
        const isBossFloor = (floor % 5 === 0);
        if (isBossFloor) {
            this.spawnMonster({
                name: `試練の塔・守護神 ${floor}F`,
                kaomoji: '👑꧁(╬◣д◢)꧂👑',
                lv: 15 + floor * 4,
                hp: Math.round(1400 * scale),
                atk: Math.round(65 * scale),
                exp: Math.round(600 * scale),
                gold: Math.round(520 * scale),
                color: 0xf43f5e,
                scale: 2.2,
                isBoss: true,
                isRaidBoss: true,
                noRespawn: true,
                drop: floor >= 15 ? 'void_star' : (floor >= 10 ? 'abyss_shard' : 'fire_core')
            }, 0, 1.0);
        } else {
            for (let i = 0; i < 4; i++) {
                this.spawnMonster({
                    name: `試練の魔兵 ${floor}F`,
                    kaomoji: '(▼皿▼#)',
                    lv: 10 + floor * 3,
                    hp: Math.round(320 * scale),
                    atk: Math.round(28 * scale),
                    exp: Math.round(140 * scale),
                    gold: Math.round(120 * scale),
                    color: 0xa855f7,
                    scale: 1.25,
                    noRespawn: true,
                    drop: floor >= 10 ? 'ice_crystal' : 'goblin_fang'
                }, i, 1.0);
            }
        }
    },

    refreshAllHUD() {
        const d = this.saveData;
        const st = this.calcDerivedStats();
        const evo = EVOLUTIONS[d.evolutionId] || EVOLUTIONS.novice;

        const kEl = document.getElementById('hud-kaomoji');
        const nEl = document.getElementById('hud-name');
        const lvEl = document.getElementById('hud-lv');
        const gEl = document.getElementById('hud-gold');
        const tBadge = document.getElementById('hud-title-badge');

        if (kEl) kEl.textContent = this.getBasePlayerKaomoji();
        if (nEl) nEl.textContent = evo.name;
        if (lvEl) lvEl.textContent = `Lv.${d.lv}`;
        if (gEl) gEl.textContent = `${formatBigNum(d.gold)}G`;

        if (tBadge) {
            const ttl = TITLES[d.equippedTitleId];
            if (ttl && ttl.id !== 'title_none') {
                tBadge.textContent = ttl.name;
                tBadge.classList.remove('hidden');
            } else {
                tBadge.classList.add('hidden');
            }
        }

        if (this.player) {
            const hpPct = Math.max(0, Math.min(100, (this.player.hp / Math.max(1, st.maxHp)) * 100));
            const mpPct = Math.max(0, Math.min(100, (this.player.mp / Math.max(1, st.maxMp)) * 100));
            const needExp = this.getExpNeeded(d.lv);
            const expPct = d.lv >= MAX_PLAYER_LEVEL ? 100 : Math.max(0, Math.min(100, (d.exp / Math.max(1, needExp)) * 100));

            const hpBar = document.getElementById('hud-hp-bar');
            const mpBar = document.getElementById('hud-mp-bar');
            const expBar = document.getElementById('hud-exp-bar');
            if (hpBar) hpBar.style.width = `${hpPct}%`;
            if (mpBar) mpBar.style.width = `${mpPct}%`;
            if (expBar) expBar.style.width = `${expPct}%`;

            const hpTxt = document.getElementById('hud-hp-text');
            const mpTxt = document.getElementById('hud-mp-text');
            const expTxt = document.getElementById('hud-exp-text');
            if (hpTxt) hpTxt.textContent = `${formatBigNum(Math.ceil(this.player.hp))}/${formatBigNum(st.maxHp)}`;
            if (mpTxt) mpTxt.textContent = `${formatBigNum(Math.ceil(this.player.mp))}/${formatBigNum(st.maxMp)}`;
            if (expTxt) expTxt.textContent = d.lv >= MAX_PLAYER_LEVEL ? 'MAX' : `${formatBigNum(d.exp)}/${formatBigNum(needExp)}`;
        }

        // ゾーン情報表示
        const stgBadge = document.getElementById('hud-stage-badge');
        const zName = document.getElementById('hud-zone-name');
        const safeBadge = document.getElementById('hud-safe-badge');
        const threatBadge = document.getElementById('hud-threat-badge');

        if (this.towerState.active) {
            if (stgBadge) stgBadge.textContent = 'TOWER';
            if (zName) zName.textContent = `無限の試練の塔 ${this.towerState.floor}F`;
            safeBadge?.classList.add('hidden');
        } else {
            const z = ZONES[this.currentZoneId] || ZONES.town;
            if (stgBadge) stgBadge.textContent = `STAGE ${z.stageNum}`;
            if (zName) zName.textContent = z.name;
            if (safeBadge) {
                if (z.safe) safeBadge.classList.remove('hidden');
                else safeBadge.classList.add('hidden');
            }
        }

        if (threatBadge) {
            if ((d.threatRank || 0) > 0 && this.currentZoneId !== 'town' && !this.towerState.active) {
                threatBadge.textContent = `脅威+${d.threatRank}`;
                threatBadge.classList.remove('hidden');
            } else {
                threatBadge.classList.add('hidden');
            }
        }

        // AP/SP通知ドット
        const alertDot = document.getElementById('badge-growth-alert');
        if (alertDot) {
            if ((d.ap || 0) > 0 || (d.sp || 0) > 0) alertDot.classList.remove('hidden');
            else alertDot.classList.add('hidden');
        }

        // スキルボタン描画更新
        this.renderSkillSlots();
    },

    renderSkillSlots() {
        const container = document.getElementById('skill-slots-container');
        if (!container) return;
        const d = this.saveData;
        const eq = d.equippedSkills || [];
        const cds = (this.player && (this.player.skillCds || this.player.skillCooldowns)) || {};

        if (container.children.length !== 5) {
            container.innerHTML = '';
            for (let i = 0; i < 5; i++) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = `skill-slot-btn skill-arc-${i}`;
                btn.dataset.slot = String(i);
                const trigger = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.useSkillSlot(i);
                };
                btn.addEventListener('pointerdown', trigger);
                container.appendChild(btn);
            }
        }

        for (let i = 0; i < 5; i++) {
            const btn = container.children[i];
            if (!btn) continue;
            const skId = eq[i];
            const sk = skId ? SKILLS[skId] : null;
            if (!sk) {
                btn.disabled = true;
                btn.innerHTML = `<span style="font-size:10px;color:#64748b;">空</span>`;
                continue;
            }
            const cd = cds[i] || 0;
            const skLv = d.skills[skId] || 1;
            const mpCost = getSkillMpCost(sk, skLv);
            const noMp = this.player && this.player.mp < mpCost;
            btn.disabled = cd > 0 || noMp;

            const newHtml = `
                <span style="font-size:17px;line-height:1;">${sk.icon}</span>
                <span style="font-size:9px;color:#7dd3fc;font-weight:900;">${mpCost}</span>
                ${cd > 0 ? `<div class="skill-cd-overlay">${cd.toFixed(1)}</div>` : ''}
            `;
            if (btn._lastHtml !== newHtml) {
                btn._lastHtml = newHtml;
                btn.innerHTML = newHtml;
            }
        }
    },

    buildEmotePalette() {
        const pal = document.getElementById('emote-palette');
        if (!pal) return;
        pal.innerHTML = EMOTES.map(em => `
            <button type="button" class="emote-quick-btn" data-emote="${em.id}">
                <span style="font-size:16px;">${em.icon}</span>
                <span style="font-size:9px;font-weight:900;color:#f8fafc;">${em.label}</span>
            </button>
        `).join('');

        pal.querySelectorAll('.emote-quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.triggerEmote(btn.dataset.emote);
                pal.classList.add('hidden');
            });
        });
    },

    showConfirmDialog(title, message, onConfirm) {
        const modal = document.getElementById('dialog-modal');
        const tEl = document.getElementById('dialog-title');
        const mEl = document.getElementById('dialog-message');
        const bEl = document.getElementById('dialog-buttons');
        if (!modal || !bEl) return;

        if (tEl) tEl.textContent = title;
        if (mEl) mEl.textContent = message;
        bEl.innerHTML = '';

        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'btn-ui btn-slate';
        cancelBtn.textContent = 'キャンセル';
        cancelBtn.onclick = () => modal.classList.add('hidden');

        const okBtn = document.createElement('button');
        okBtn.type = 'button';
        okBtn.className = 'btn-ui btn-rose';
        okBtn.textContent = '実行する';
        okBtn.onclick = () => {
            modal.classList.add('hidden');
            if (onConfirm) onConfirm();
        };

        bEl.appendChild(cancelBtn);
        bEl.appendChild(okBtn);
        modal.classList.remove('hidden');
    },

    bindEvents() {
        window.addEventListener('resize', () => {
            if (this.useWebGL && this.renderer && this.camera) {
                this.camera.aspect = window.innerWidth / window.innerHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(window.innerWidth, window.innerHeight);
            }
        });

        window.addEventListener('keydown', (e) => {
            if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) return;
            this.keys[e.code] = true;
            if (e.code === 'Space') {
                e.preventDefault();
                this.performBasicAttack();
            } else if (e.code >= 'Digit1' && e.code <= 'Digit5') {
                this.useSkillSlot(Number(e.code.replace('Digit', '')) - 1);
            }
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // タイトル画面ボタン
        document.getElementById('btn-title-start')?.addEventListener('click', () => this.enterGameFromTitle());
        document.getElementById('title-btn-toggle-online')?.addEventListener('click', () => {
            this.saveData.onlineEnabled = !this.saveData.onlineEnabled;
            this.saveGame(false);
            this.refreshTitleScreen();
        });
        document.getElementById('title-btn-toggle-pass')?.addEventListener('click', () => {
            this.saveData.roomPassEnabled = !this.saveData.roomPassEnabled;
            this.saveGame(false);
            this.refreshTitleScreen();
        });
        document.getElementById('title-input-room-pass')?.addEventListener('input', (e) => {
            this.saveData.roomPassword = e.target.value;
            this.saveGame(false);
        });
        document.getElementById('btn-title-cloud')?.addEventListener('click', () => {
            this.enterGameFromTitle();
            if (this.openGrowthModal) this.openGrowthModal('online');
        });
        document.getElementById('btn-title-hard-reset')?.addEventListener('click', () => {
            this.showConfirmDialog(
                '💥 完全データ初期化',
                'レベル・装備・素材・ゴールドをすべて消去して最初からやり直しますか？',
                () => this.hardResetGame()
            );
        });

        // HUD右上ボタン群
        document.getElementById('btn-open-travel')?.addEventListener('click', () => this.openGrowthModal && this.openGrowthModal('zones'));
        document.getElementById('btn-exec-warp')?.addEventListener('click', () => this.openGrowthModal && this.openGrowthModal('zones'));
        document.getElementById('btn-open-growth')?.addEventListener('click', () => this.openGrowthModal && this.openGrowthModal('stats'));
        document.getElementById('btn-close-modal')?.addEventListener('click', () => this.closeGrowthModal && this.closeGrowthModal());

        document.getElementById('btn-toggle-emote')?.addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('hud-drawer-menu')?.classList.add('hidden');
            document.getElementById('emote-palette')?.classList.toggle('hidden');
        });
        document.getElementById('btn-toggle-drawer')?.addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('emote-palette')?.classList.add('hidden');
            document.getElementById('hud-drawer-menu')?.classList.toggle('hidden');
        });

        document.getElementById('btn-hud-online-toggle')?.addEventListener('click', () => {
            if (this.toggleOnlineFromHud) {
                this.toggleOnlineFromHud();
            } else if (this.openGrowthModal) {
                this.openGrowthModal('online');
            }
        });
        document.getElementById('btn-open-cloud')?.addEventListener('click', () => {
            document.getElementById('hud-drawer-menu')?.classList.add('hidden');
            if (this.openGrowthModal) this.openGrowthModal('online');
        });

        // 設定ドロワー内ボタン
        document.getElementById('btn-toggle-autohunt')?.addEventListener('click', () => {
            this.autoHunt = !this.autoHunt;
            const btn = document.getElementById('btn-toggle-autohunt');
            if (btn) {
                btn.textContent = this.autoHunt ? '🤖 AUTO:ON' : '🤖 AUTO:OFF';
                btn.style.background = this.autoHunt ? '#059669' : '';
            }
            this.showAlertBanner(this.autoHunt ? '🤖 AUTO自動狩り・スキル発動 ON' : '🤖 AUTOモード OFF', 1300);
        });

        document.getElementById('btn-threat-up')?.addEventListener('click', () => {
            const cur = this.saveData.threatRank || 0;
            if (cur >= MAX_THREAT_RANK) return;
            this.saveData.threatRank = cur + 1;
            this.saveGame(false);
            if (this.currentZoneId !== 'town' && !this.towerState.active) this.loadZone(this.currentZoneId);
            this.refreshAllHUD();
            this.showAlertBanner(`🔥 脅威ランク +${this.saveData.threatRank} に上昇！`, 1400);
        });
        document.getElementById('btn-threat-down')?.addEventListener('click', () => {
            const cur = this.saveData.threatRank || 0;
            if (cur <= 0) return;
            this.saveData.threatRank = cur - 1;
            this.saveGame(false);
            if (this.currentZoneId !== 'town' && !this.towerState.active) this.loadZone(this.currentZoneId);
            this.refreshAllHUD();
            this.showAlertBanner(`❄️ 脅威ランク +${this.saveData.threatRank} に低下`, 1400);
        });

        document.getElementById('btn-manual-save')?.addEventListener('click', () => this.saveGame(true));
        document.getElementById('btn-toggle-bgm')?.addEventListener('click', () => {
            sfx.bgmMuted = !sfx.bgmMuted;
            const btn = document.getElementById('btn-toggle-bgm');
            if (btn) btn.textContent = sfx.bgmMuted ? '🔇 BGM:OFF' : '🔊 BGM:ON';
        });
        document.getElementById('btn-back-title')?.addEventListener('click', () => {
            document.getElementById('hud-drawer-menu')?.classList.add('hidden');
            this.saveGame(false);
            this.showTitleScreen();
        });
        document.getElementById('btn-reset-save')?.addEventListener('click', () => {
            document.getElementById('hud-drawer-menu')?.classList.add('hidden');
            this.showConfirmDialog(
                '💥 完全データ初期化',
                '現在のセーブデータをすべて消去して初期化しますか？',
                () => this.hardResetGame()
            );
        });

        // 戦闘パッド（通常攻撃 & 標的切替）
        const atkBtn = document.getElementById('btn-basic-attack');
        if (atkBtn) {
            atkBtn.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.performBasicAttack();
            });
        }
        const cycBtn = document.getElementById('btn-cycle-target');
        if (cycBtn) {
            cycBtn.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.cycleTarget();
            });
        }

        // チャットUI
        document.getElementById('btn-toggle-chat')?.addEventListener('click', () => {
            this.chatCollapsed = !this.chatCollapsed;
            document.getElementById('chat-panel')?.classList.toggle('hidden', this.chatCollapsed);
        });
        document.getElementById('btn-chat-tab-global')?.addEventListener('click', () => {
            this.chatTab = 'global';
            this.renderChatMessages();
        });
        document.getElementById('btn-chat-tab-room')?.addEventListener('click', () => {
            this.chatTab = 'room';
            this.renderChatMessages();
        });
        document.querySelectorAll('.chat-quick-chip').forEach(chip => {
            chip.addEventListener('click', () => this.sendChatMessage(chip.dataset.msg));
        });
        const sendChatAction = () => {
            const inp = document.getElementById('input-chat-msg');
            if (!inp) return;
            this.sendChatMessage(inp.value);
            inp.value = '';
        };
        document.getElementById('btn-send-chat')?.addEventListener('click', sendChatAction);
        document.getElementById('input-chat-msg')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendChatAction();
            }
        });

        // バーチャルジョイスティック
        const joyZone = document.getElementById('joystick-zone');
        const joyKnob = document.getElementById('joystick-knob');
        if (joyZone && joyKnob) {
            let joyPointerId = null;
            const maxR = 36;
            const updateJoy = (clientX, clientY) => {
                const rect = joyZone.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                let dx = clientX - cx;
                let dy = clientY - cy;
                const d = Math.hypot(dx, dy);
                if (d > maxR) {
                    dx = (dx / d) * maxR;
                    dy = (dy / d) * maxR;
                }
                joyKnob.style.transform = `translate(${dx}px, ${dy}px)`;
                this.joyVec.x = dx / maxR;
                this.joyVec.y = dy / maxR;
            };
            const resetJoy = () => {
                joyPointerId = null;
                joyKnob.style.transform = 'translate(0px, 0px)';
                this.joyVec.x = 0;
                this.joyVec.y = 0;
            };

            joyZone.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                joyPointerId = e.pointerId;
                joyZone.setPointerCapture(e.pointerId);
                updateJoy(e.clientX, e.clientY);
            });
            joyZone.addEventListener('pointermove', (e) => {
                if (e.pointerId === joyPointerId) updateJoy(e.clientX, e.clientY);
            });
            joyZone.addEventListener('pointerup', (e) => {
                if (e.pointerId === joyPointerId) resetJoy();
            });
            joyZone.addEventListener('pointercancel', (e) => {
                if (e.pointerId === joyPointerId) resetJoy();
            });
        }

        // キャンバスドラッグでカメラ回転
        if (this.canvas) {
            let camPointerId = null;
            let lastX = 0;
            let lastY = 0;
            this.canvas.addEventListener('pointerdown', (e) => {
                camPointerId = e.pointerId;
                lastX = e.clientX;
                lastY = e.clientY;
            });
            this.canvas.addEventListener('pointermove', (e) => {
                if (e.pointerId !== camPointerId) return;
                const dx = e.clientX - lastX;
                const dy = e.clientY - lastY;
                lastX = e.clientX;
                lastY = e.clientY;
                this.camYaw -= dx * 0.008;
                this.camPitch = Math.max(0.22, Math.min(1.15, this.camPitch + dy * 0.006));
            });
            const endCam = (e) => {
                if (e.pointerId === camPointerId) camPointerId = null;
            };
            this.canvas.addEventListener('pointerup', endCam);
            this.canvas.addEventListener('pointercancel', endCam);
        }
    }
});
