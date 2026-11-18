'use strict';

// =========================================================================
// 顔文字ファンタジー3D 戦闘・魔法弾判定・スキル発動・敵AI・成長処理 (game3.js)
// =========================================================================

Object.assign(KaomojiMMORPG.prototype, {

    getNearestMonster(maxDist = 30) {
        if (!this.player) return null;
        let best = null;
        let bestD = maxDist;
        for (const m of this.monsters) {
            if (m.dead) continue;
            const d = Math.hypot(m.pos.x - this.player.pos.x, m.pos.z - this.player.pos.z);
            if (d < bestD) {
                bestD = d;
                best = m;
            }
        }
        return best;
    },

    getValidTarget(maxDist = 18) {
        if (this.selectedTarget && !this.selectedTarget.dead) {
            const d = Math.hypot(this.selectedTarget.pos.x - this.player.pos.x, this.selectedTarget.pos.z - this.player.pos.z);
            if (d <= maxDist) return this.selectedTarget;
        }
        const near = this.getNearestMonster(maxDist);
        if (near) this.selectedTarget = near;
        return near;
    },

    triggerPlayerAttackAnim(type = 'slash', dur = 0.28) {
        if (!this.player) return;
        this.player.skillAnimType = type;
        this.player.skillAnimDur = dur;
        this.player.skillAnimTimer = dur;
    },

    // 通常攻撃（剣は近接物理判定、杖は遠距離魔法弾・魔法攻撃力判定）
    performBasicAttack() {
        if (!this.player || this.isDead || this.currentZoneId === 'town') return false;
        if ((this.player.stunTimer || 0) > 0) return false;

        const st = this.calcDerivedStats();
        const isStaff = !!st.isStaffEquipped;
        const atkRange = isStaff ? 16.5 : 5.0;

        const target = this.getValidTarget(atkRange);
        if (!target) return false;

        // ターゲット方向へ旋回
        const dx = target.pos.x - this.player.pos.x;
        const dz = target.pos.z - this.player.pos.z;
        this.player.rotY = Math.atan2(dx, dz);

        const isCrit = Math.random() < st.critChance;
        const basePower = isStaff ? st.magAtk : st.physAtk;
        const variance = 0.92 + Math.random() * 0.16;
        const dmg = Math.max(1, Math.round(basePower * variance * (isCrit ? st.critDmg : 1.0)));

        if (isStaff) {
            // 杖の通常攻撃：遠距離魔法弾を発射し、魔法ダメージ判定を与える
            this.triggerPlayerAttackAnim('staff_cast', 0.28);
            sfx.playTone(isCrit ? 880 : 640, 'sine', 0.12, 0.06, 980);

            if (this.spawnMagicBolt) {
                this.spawnMagicBolt(
                    this.player.pos.clone().add(new THREE.Vector3(0, 1.35, 0)),
                    target.pos.clone().add(new THREE.Vector3(0, 0.9, 0)),
                    st.wpnGlowColor || 0xc084fc
                );
            } else if (this.spawnSparkleBurst) {
                this.spawnSparkleBurst(target.pos, st.wpnGlowColor || 0xc084fc, 6);
            }

            this.damageMonster(target, dmg, isCrit, isCrit ? '#f472b6' : '#c084fc');
        } else {
            // 剣・物理武器の通常攻撃：近接斬撃判定
            this.triggerPlayerAttackAnim('slash', 0.24);
            sfx.playHit(isCrit);

            if (this.spawnSlashArc) {
                this.spawnSlashArc(this.player.pos, this.player.rotY, st.wpnGlowColor || 0x38bdf8, 2.5);
            }

            this.damageMonster(target, dmg, isCrit, isCrit ? '#fde047' : '#ffffff');
        }

        // HP吸収効果
        if (st.lifesteal > 0) {
            const heal = Math.max(1, Math.round(dmg * st.lifesteal));
            this.player.hp = Math.min(st.maxHp, this.player.hp + heal);
        }

        return true;
    },

    useSkillSlot(slotIdx) {
        if (!this.player || this.isDead) return false;
        if ((this.player.stunTimer || 0) > 0) {
            if (this.showAlertBanner) this.showAlertBanner('💫 気絶中で行動できない！', 900);
            return false;
        }

        const skillId = (this.saveData.equippedSkills || [])[slotIdx];
        if (!skillId || !SKILLS[skillId]) return false;

        this.skillCooldowns = this.skillCooldowns || [0, 0, 0, 0, 0];
        if (this.skillCooldowns[slotIdx] > 0) return false;

        const sk = SKILLS[skillId];
        const lv = Math.max(1, (this.saveData.skills && this.saveData.skills[skillId]) || 1);
        const mpCost = getSkillMpCost(sk, lv);

        if (this.player.mp < mpCost) {
            if (this.showAlertBanner) this.showAlertBanner(`💧 MPが足りません！（必要MP: ${mpCost}）`, 1000);
            return false;
        }

        const st = this.calcDerivedStats();
        if (!sk.isSupport && this.currentZoneId === 'town') {
            if (this.showAlertBanner) this.showAlertBanner('🏰 広場では攻撃スキルは使えません', 1000);
            return false;
        }

        this.player.mp -= mpCost;
        const cdTime = Math.max(0.6, sk.cd * (1 - st.cdReduction));
        this.skillCooldowns[slotIdx] = cdTime;

        sfx.init();
        sfx.playSkill();
        this.executeSkillEffect(sk, lv, st, false);

        // 双子星の魔導符などによるスキル2連発判定
        if (st.doubleCast > 0 && Math.random() < st.doubleCast) {
            setTimeout(() => {
                if (!this.isDead && this.player) {
                    this.executeSkillEffect(sk, lv, st, true);
                    if (this.spawnFloatText) {
                        this.spawnFloatText(this.player.pos.clone().add(new THREE.Vector3(0, 2.7, 0)), '♊ 2連発動！', '#f472b6', 14);
                    }
                }
            }, 220);
        }

        return true;
    },

    executeSkillEffect(sk, lv, st, isDouble = false) {
        const eff = getSkillEffectStats(sk, lv, st);
        const pPos = this.player.pos;

        if (sk.type === 'HEAL') {
            this.triggerPlayerAttackAnim('cast', 0.35);
            sfx.playHeal();
            const heal = Math.round(st.maxHp * eff.hpPct);
            this.player.hp = Math.min(st.maxHp, this.player.hp + heal);
            this.player.stunTimer = 0;
            if (this.spawnRingWave) this.spawnRingWave(pPos, 0x34d399, 3.6);
            if (this.spawnFloatText) this.spawnFloatText(pPos.clone().add(new THREE.Vector3(0, 2.4, 0)), `+${formatBigNum(heal)} HP`, '#34d399', 16);
            return;
        }

        if (sk.type === 'HEAL_MP') {
            this.triggerPlayerAttackAnim('cast', 0.38);
            sfx.playHeal();
            const healHp = Math.round(st.maxHp * eff.hpPct);
            const healMp = Math.round(st.maxMp * eff.mpPct);
            this.player.hp = Math.min(st.maxHp, this.player.hp + healHp);
            this.player.mp = Math.min(st.maxMp, this.player.mp + healMp);
            if (this.spawnRingWave) this.spawnRingWave(pPos, 0xfde047, 4.4);
            if (this.spawnFloatText) {
                this.spawnFloatText(pPos.clone().add(new THREE.Vector3(0, 2.5, 0)), `+${formatBigNum(healHp)} HP / +${formatBigNum(healMp)} MP`, '#6ee7b7', 15);
            }
            return;
        }

        if (sk.type === 'DEF_BUFF') {
            this.triggerPlayerAttackAnim('cast', 0.35);
            sfx.playHeal();
            this.player.invulnTimer = Math.max(this.player.invulnTimer || 0, eff.invuln);
            this.player.defBuffTimer = eff.duration;
            this.player.defBuffBonus = eff.defBonus;
            if (this.spawnRingWave) this.spawnRingWave(pPos, 0x38bdf8, 4.0);
            if (this.spawnFloatText) this.spawnFloatText(pPos.clone().add(new THREE.Vector3(0, 2.4, 0)), '🔰 神域イージス展開！', '#38bdf8', 15);
            return;
        }

        if (sk.type === 'ATK_BUFF') {
            this.triggerPlayerAttackAnim('cast', 0.35);
            sfx.playLevelUp();
            this.player.warcryTimer = eff.duration;
            this.player.warcryBonus = 1 + eff.atkBonus;
            if (this.spawnRingWave) this.spawnRingWave(pPos, 0xf97316, 4.2);
            if (this.spawnFloatText) this.spawnFloatText(pPos.clone().add(new THREE.Vector3(0, 2.4, 0)), '🔥 覇王の咆哮！攻撃UP', '#fb923c', 15);
            return;
        }

        // 攻撃スキルは物理・魔力の高い方をベースに魔力倍率を乗算
        const baseOffensive = Math.max(st.physAtk, st.magAtk);
        const calcSkillHit = () => {
            const isCrit = Math.random() < st.critChance;
            const raw = baseOffensive * eff.mult * (0.7 + st.magMult * 0.3) * (0.94 + Math.random() * 0.12);
            return { dmg: Math.max(1, Math.round(raw * (isCrit ? st.critDmg : 1.0))), isCrit };
        };

        const target = this.getValidTarget(18);
        if (target) {
            this.player.rotY = Math.atan2(target.pos.x - pPos.x, target.pos.z - pPos.z);
        }

        if (sk.type === 'SINGLE_DMG' || sk.type === 'INTERRUPT' || sk.type === 'THUNDER' || sk.type === 'DRAIN') {
            const t = target || this.getNearestMonster(18);
            if (!t) return;

            this.triggerPlayerAttackAnim(sk.type === 'THUNDER' ? 'cast' : 'slash', 0.32);
            const hit = calcSkillHit();

            if (sk.type === 'THUNDER') {
                if (this.spawnLightningStrike) this.spawnLightningStrike(t.pos);
                this.camShake = Math.max(this.camShake, 0.25);
            } else if (sk.type === 'INTERRUPT') {
                if (this.spawnRingWave) this.spawnRingWave(t.pos, 0xfacc15, 3.8);
                t.stunTimer = Math.max(t.stunTimer || 0, eff.stunDur || 2.0);
                if (t.casting) {
                    t.casting = null;
                    document.getElementById('boss-cast-box')?.classList.add('hidden');
                    if (this.showAlertBanner) this.showAlertBanner('💥 ボスの大技詠唱を中断した！', 1400);
                }
            } else if (sk.type === 'DRAIN') {
                if (this.spawnSparkleBurst) this.spawnSparkleBurst(t.pos, 0xf43f5e, 10);
                const drainHeal = Math.max(1, Math.round(hit.dmg * (eff.drainRate || 0.35)));
                this.player.hp = Math.min(st.maxHp, this.player.hp + drainHeal);
                if (this.spawnFloatText) {
                    this.spawnFloatText(pPos.clone().add(new THREE.Vector3(0, 2.3, 0)), `+${formatBigNum(drainHeal)}`, '#fb7185', 14);
                }
            } else {
                if (this.spawnSlashArc) this.spawnSlashArc(pPos, this.player.rotY, 0x38bdf8, 3.6);
            }

            this.damageMonster(t, hit.dmg, hit.isCrit);
            if (st.lifesteal > 0) {
                this.player.hp = Math.min(st.maxHp, this.player.hp + Math.round(hit.dmg * st.lifesteal));
            }
            return;
        }

        // 範囲攻撃系 (AOE_DMG, AOE_SLOW, AOE_BURN)
        const radius = sk.radius || 6.5;
        const center = (sk.id === 'meteor_star' || sk.id === 'phoenix_dive') && target ? target.pos.clone() : pPos.clone();

        this.triggerPlayerAttackAnim('spin', 0.36);
        this.camShake = Math.max(this.camShake, 0.22);

        if (sk.id === 'meteor_star' && this.spawnMeteorImpact) {
            this.spawnMeteorImpact(center, radius);
        } else if (sk.type === 'AOE_SLOW' && this.spawnRingWave) {
            this.spawnRingWave(center, 0x7dd3fc, radius);
        } else if (sk.type === 'AOE_BURN' && this.spawnRingWave) {
            this.spawnRingWave(center, 0xf97316, radius);
        } else if (this.spawnRingWave) {
            this.spawnRingWave(center, 0xc084fc, radius);
        }

        let totalDealt = 0;
        for (const m of this.monsters) {
            if (m.dead) continue;
            if (Math.hypot(m.pos.x - center.x, m.pos.z - center.z) <= radius + (m.scale || 1) * 0.8) {
                const hit = calcSkillHit();
                totalDealt += hit.dmg;
                this.damageMonster(m, hit.dmg, hit.isCrit);
                if (sk.type === 'AOE_SLOW') {
                    m.slowTimer = Math.max(m.slowTimer || 0, eff.slowDur || 3.5);
                    m.slowFactor = eff.slowFactor || 0.45;
                } else if (sk.type === 'AOE_BURN') {
                    m.burnTimer = 4.0;
                    m.burnDps = Math.max(1, Math.round(hit.dmg * 0.22));
                }
            }
        }
        if (st.lifesteal > 0 && totalDealt > 0) {
            this.player.hp = Math.min(st.maxHp, this.player.hp + Math.round(totalDealt * st.lifesteal));
        }
    },

    damageMonster(m, rawDmg, isCrit = false, colorOverride = null) {
        if (!m || m.dead) return;
        const st = this.calcDerivedStats();
        let dmg = Math.max(1, Math.round(rawDmg * (m.isBoss ? st.bossDmgMult : 1.0)));

        m.hp = Math.max(0, m.hp - dmg);
        m.aggro = true;
        m.damagedByPlayer = true;
        this.selectedTarget = m;

        if (this.spawnFloatText) {
            const col = colorOverride || (isCrit ? '#fde047' : '#ffffff');
            const label = isCrit ? `💥${formatBigNum(dmg)}!` : formatBigNum(dmg);
            this.spawnFloatText(m.pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.8, 1.5 * (m.scale || 1), 0)), label, col, isCrit ? 18 : 14);
        }

        if (m.hp <= 0) {
            this.onMonsterKilled(m);
        }
    },

    onMonsterKilled(m) {
        if (m.dead) return;
        m.dead = true;
        m.respawnTimer = m.noRespawn ? 999999 : (m.isBoss ? 12.0 : 4.5);
        m.casting = null;

        if (m.group) m.group.visible = false;
        if (m.plateEl) m.plateEl.style.display = 'none';
        if (this.selectedTarget === m) {
            this.selectedTarget = null;
            document.getElementById('boss-cast-box')?.classList.add('hidden');
        }

        if (this.spawnSparkleBurst) {
            this.spawnSparkleBurst(m.pos, m.color || 0xfde047, m.isBoss ? 18 : 9);
        }

        const st = this.calcDerivedStats();
        const expGain = Math.max(1, Math.round(m.baseExp * st.rewardMult));
        const goldGain = Math.max(1, Math.round(m.baseGold * st.rewardMult));

        this.saveData.gold = (this.saveData.gold || 0) + goldGain;
        this.saveData.statsTrack = this.saveData.statsTrack || { kills: 0, bossKills: 0, bestTowerFloor: 0, maxThreatKill: 0 };
        this.saveData.statsTrack.kills = (this.saveData.statsTrack.kills || 0) + 1;
        if (m.isBoss) {
            this.saveData.statsTrack.bossKills = (this.saveData.statsTrack.bossKills || 0) + 1;
        }
        if ((this.saveData.threatRank || 0) > (this.saveData.statsTrack.maxThreatKill || 0)) {
            this.saveData.statsTrack.maxThreatKill = this.saveData.threatRank || 0;
        }

        // 素材ドロップ判定
        const dropChance = m.isBoss ? 1.0 : 0.62;
        if (m.drop && MATERIALS[m.drop] && Math.random() < dropChance) {
            const qty = m.isBoss ? (2 + Math.floor(Math.random() * 2)) : 1;
            this.saveData.materials[m.drop] = (this.saveData.materials[m.drop] || 0) + qty;
            if (this.spawnFloatText) {
                const matInfo = MATERIALS[m.drop];
                this.spawnFloatText(m.pos.clone().add(new THREE.Vector3(0, 1.9, 0)), `${matInfo.icon}${matInfo.name} x${qty}`, '#6ee7b7', 13);
            }
        }

        this.gainExp(expGain);

        // 試練の塔：全滅判定と次階層進行
        if (this.towerState && this.towerState.active) {
            const alive = this.monsters.some(x => !x.dead);
            if (!alive) {
                const clearedFloor = this.towerState.floor;
                if (clearedFloor > (this.saveData.statsTrack.bestTowerFloor || 0)) {
                    this.saveData.statsTrack.bestTowerFloor = clearedFloor;
                }
                const nextFloor = clearedFloor + 1;
                this.towerState.floor = nextFloor;
                if (this.showAlertBanner) {
                    this.showAlertBanner(`🗼 第${clearedFloor}階層 クリア！次は 第${nextFloor}階層！`, 1800);
                }
                setTimeout(() => {
                    if (this.towerState && this.towerState.active && this.currentZoneId === 'tower') {
                        this.spawnTowerFloorMonsters(nextFloor);
                    }
                }, 900);
            }
        }

        this.saveGame(false);
    },

    gainExp(amount) {
        const d = this.saveData;
        if (d.lv >= MAX_PLAYER_LEVEL) return;
        d.exp = (d.exp || 0) + amount;
        let leveled = false;
        while (d.lv < MAX_PLAYER_LEVEL) {
            const need = this.getExpNeeded(d.lv);
            if (d.exp < need) break;
            d.exp -= need;
            d.lv += 1;
            d.ap = (d.ap || 0) + 3;
            d.sp = (d.sp || 0) + 1;
            leveled = true;
        }
        if (leveled) {
            const st = this.calcDerivedStats();
            if (this.player) {
                this.player.hp = st.maxHp;
                this.player.mp = st.maxMp;
                if (this.spawnRingWave) this.spawnRingWave(this.player.pos, 0xfde047, 5.0);
                if (this.spawnFloatText) {
                    this.spawnFloatText(this.player.pos.clone().add(new THREE.Vector3(0, 2.8, 0)), `🎉 LEVEL UP! Lv.${d.lv}`, '#fde047', 18);
                }
            }
            sfx.playLevelUp();
            if (this.showAlertBanner) this.showAlertBanner(`🎉 レベルアップ！ Lv.${d.lv} になりました！`, 2200);
        }
    },

    damagePlayer(rawDmg, ignoreDef = false) {
        if (!this.player || this.isDead || this.currentZoneId === 'town') return;
        if ((this.player.invulnTimer || 0) > 0) return;

        const st = this.calcDerivedStats();
        const mult = ignoreDef ? 1.0 : (1 - st.defMitigation);
        const dmg = Math.max(1, Math.round(rawDmg * mult));

        this.player.hp = Math.max(0, this.player.hp - dmg);
        this.camShake = Math.max(this.camShake, 0.16);

        if (this.spawnFloatText) {
            this.spawnFloatText(this.player.pos.clone().add(new THREE.Vector3(0, 2.2, 0)), `-${formatBigNum(dmg)}`, '#f43f5e', 15);
        }

        if (this.player.hp <= 0) {
            this.isDead = true;
            this.autoHunt = false;
            const autoBtn = document.getElementById('btn-toggle-autohunt');
            if (autoBtn) {
                autoBtn.textContent = '🤖 AUTO:OFF';
                autoBtn.style.background = '';
            }
            if (this.showAlertBanner) this.showAlertBanner('💀 力尽きてしまった… 始まりの広場へ帰還します', 2400);
            setTimeout(() => {
                this.isDead = false;
                const freshSt = this.calcDerivedStats();
                if (this.player) {
                    this.player.hp = freshSt.maxHp;
                    this.player.mp = freshSt.maxMp;
                    this.player.invulnTimer = 2.0;
                }
                this.loadZone('town');
            }, 1400);
        }
    },

    updateCombatAndEntities(dt, elapsed) {
        if (!this.player) return;
        const st = this.calcDerivedStats();

        // クールダウン・バフタイマー更新
        if (this.skillCooldowns) {
            for (let i = 0; i < this.skillCooldowns.length; i++) {
                if (this.skillCooldowns[i] > 0) this.skillCooldowns[i] = Math.max(0, this.skillCooldowns[i] - dt);
            }
        }
        if (this.player.invulnTimer > 0) this.player.invulnTimer = Math.max(0, this.player.invulnTimer - dt);
        if (this.player.stunTimer > 0) this.player.stunTimer = Math.max(0, this.player.stunTimer - dt);
        if (this.player.defBuffTimer > 0) this.player.defBuffTimer = Math.max(0, this.player.defBuffTimer - dt);
        if (this.player.warcryTimer > 0) this.player.warcryTimer = Math.max(0, this.player.warcryTimer - dt);
        if (this.player.skillAnimTimer > 0) this.player.skillAnimTimer = Math.max(0, this.player.skillAnimTimer - dt);

        // HP/MP自然回復（広場では高速回復）
        if (!this.isDead) {
            if (this.currentZoneId === 'town') {
                this.player.hp = Math.min(st.maxHp, this.player.hp + st.maxHp * 0.25 * dt);
                this.player.mp = Math.min(st.maxMp, this.player.mp + st.maxMp * 0.30 * dt);
            } else {
                const hpRegenRate = 0.015 + (st.treeHpRegenBonus || 0);
                const mpRegenRate = 0.045 * (st.treeMpRegenMult || 1.0);
                this.player.hp = Math.min(st.maxHp, this.player.hp + st.maxHp * hpRegenRate * dt);
                this.player.mp = Math.min(st.maxMp, this.player.mp + st.maxMp * mpRegenRate * dt);
            }
        }

        this.updatePlayerMovement(dt, st);
        this.updatePet(dt, elapsed);
        this.updateMonsters(dt, elapsed);

        // 街のAI仲間散歩
        for (const ally of this.aiAllies) {
            ally.wanderTimer -= dt;
            if (ally.wanderTimer <= 0) {
                ally.wanderTimer = 2.5 + Math.random() * 2.5;
                const ang = Math.random() * Math.PI * 2;
                const r = 1.5 + Math.random() * 3.0;
                ally.targetOffset.set(Math.cos(ang) * r, 0, Math.sin(ang) * r);
            }
            const dest = ally.homePos.clone().add(ally.targetOffset);
            const dx = dest.x - ally.pos.x;
            const dz = dest.z - ally.pos.z;
            const dist = Math.hypot(dx, dz);
            if (dist > 0.15) {
                ally.pos.x += (dx / dist) * 2.2 * dt;
                ally.pos.z += (dz / dist) * 2.2 * dt;
                if (ally.group) ally.group.rotation.y = Math.atan2(dx, dz);
            }
            if (ally.group) ally.group.position.copy(ally.pos);
        }
    },

    updatePlayerMovement(dt, st) {
        if (this.isDead || (this.player.stunTimer || 0) > 0) return;

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

        const hasManualInput = Math.hypot(mx, mz) > 0.05;

        if (hasManualInput) {
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
            this.clampPosition(this.player.pos);
        } else if (this.autoHunt && this.currentZoneId !== 'town') {
            // AUTO狩り移動（杖装備時は13.5m手前で止まって魔法弾を撃つ）
            const target = this.getNearestMonster(60);
            if (target) {
                const dx = target.pos.x - this.player.pos.x;
                const dz = target.pos.z - this.player.pos.z;
                const dist = Math.hypot(dx, dz);
                const stopDist = st.isStaffEquipped ? 13.5 : 3.4;
                if (dist > stopDist) {
                    this.player.pos.x += (dx / dist) * st.moveSpeed * dt;
                    this.player.pos.z += (dz / dist) * st.moveSpeed * dt;
                    this.player.rotY = Math.atan2(dx, dz);
                    this.clampPosition(this.player.pos);
                }
            }
        }

        // ワープ陣接触判定
        const onWarp = this.isOnWarpPortal(this.player.pos);
        if (onWarp && !this.wasOnWarp && !this.isModalOpen && !this.inTitleScreen) {
            this.wasOnWarp = true;
            if (this.openGrowthModal) this.openGrowthModal('zones');
        } else if (!onWarp) {
            this.wasOnWarp = false;
        }

        // オート通常攻撃＆AUTOスキル発動
        if (this.currentZoneId !== 'town') {
            this.autoAtkTimer -= dt;
            if ((this.autoAttack || this.autoHunt) && this.autoAtkTimer <= 0) {
                if (this.performBasicAttack()) {
                    this.autoAtkTimer = 0.72;
                } else {
                    this.autoAtkTimer = 0.2;
                }
            }

            if (this.autoHunt) {
                this.autoSkillTimer -= dt;
                if (this.autoSkillTimer <= 0) {
                    this.autoSkillTimer = 0.65;
                    const near = this.getNearestMonster(st.isStaffEquipped ? 16.5 : 8.5);
                    if (near) {
                        const eq = this.saveData.equippedSkills || [];
                        for (let i = 0; i < eq.length; i++) {
                            const sid = eq[i];
                            if (!sid || !SKILLS[sid]) continue;
                            const sk = SKILLS[sid];
                            if (sk.type === 'HEAL' && this.player.hp > st.maxHp * 0.65) continue;
                            if (sk.type === 'HEAL_MP' && this.player.hp > st.maxHp * 0.7 && this.player.mp > st.maxMp * 0.5) continue;
                            if (this.useSkillSlot(i)) break;
                        }
                    }
                }
            }
        }
    },

    updateMonsters(dt, elapsed) {
        let activeBossCast = null;

        for (const m of this.monsters) {
            if (m.dead) {
                if (!m.noRespawn) {
                    m.respawnTimer -= dt;
                    if (m.respawnTimer <= 0) {
                        m.dead = false;
                        m.hp = m.maxHp;
                        m.aggro = false;
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

            if (m.atkAnimTimer > 0) m.atkAnimTimer = Math.max(0, m.atkAnimTimer - dt);

            if (m.burnTimer > 0) {
                m.burnTimer -= dt;
                if (Math.floor((m.burnTimer + dt) * 2) !== Math.floor(m.burnTimer * 2)) {
                    this.damageMonster(m, m.burnDps, false, '#fb923c');
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

            // ボスの大技詠唱処理
            if (m.casting) {
                m.casting.elapsed += dt;
                if (m === this.selectedTarget || dist < 24) {
                    activeBossCast = m;
                }
                if (m.casting.elapsed >= m.casting.duration) {
                    const castRadius = m.casting.radius || 7.5;
                    if (this.spawnRingWave) this.spawnRingWave(m.pos, 0xef4444, castRadius);
                    if (dist <= castRadius) {
                        this.damagePlayer(Math.round(m.atk * 2.1), false);
                    }
                    m.casting = null;
                }
                continue;
            }

            if (m.aggro && !this.isDead) {
                const reach = 2.4 + (m.scale || 1) * 0.75;
                if (dist > reach) {
                    const spd = (m.isBoss ? 4.4 : 4.8) * slowMult;
                    m.pos.x += (dx / dist) * spd * dt;
                    m.pos.z += (dz / dist) * spd * dt;
                    if (m.group) m.group.rotation.y = Math.atan2(dx, dz);
                } else {
                    m.autoTimer -= dt;
                    if (m.autoTimer <= 0) {
                        m.autoTimer = m.isBoss ? 1.45 : 1.3;
                        m.atkAnimTimer = 0.25;
                        this.damagePlayer(m.atk, false);
                    }
                }

                if (m.isBoss && dist < 18) {
                    m.mechTimer -= dt;
                    if (m.mechTimer <= 0) {
                        m.mechTimer = 9.5;
                        m.casting = {
                            name: m.isRaidBoss ? '終焉の魔導カタストロフィ' : '覇王の衝撃波',
                            elapsed: 0,
                            duration: 2.6,
                            radius: 8.5
                        };
                    }
                }
            }

            if (m.group) {
                const hop = Math.abs(Math.sin(elapsed * 5 + m.pos.x)) * 0.14;
                m.group.position.set(m.pos.x, hop, m.pos.z);
            }
        }

        this.updateBossCastUI(activeBossCast);
    },

    updateBossCastUI(m) {
        const box = document.getElementById('boss-cast-box');
        if (!box) return;
        if (!m || !m.casting) {
            box.classList.add('hidden');
            return;
        }
        box.classList.remove('hidden');
        const nameEl = document.getElementById('boss-cast-name');
        const barEl = document.getElementById('boss-cast-bar');
        if (nameEl) nameEl.textContent = `⚠️ ${m.name}：【${m.casting.name}】`;
        if (barEl) {
            const pct = Math.min(100, (m.casting.elapsed / m.casting.duration) * 100);
            barEl.style.width = `${pct}%`;
        }
    }
});
