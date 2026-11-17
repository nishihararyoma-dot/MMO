'use strict';

// =========================================================================
// 顔文字ファンタジー3D メインループ・戦闘・ペットAI・技＆エモート演出 (game2.js)
// =========================================================================

Object.assign(KaomojiMMORPG.prototype, {

    loop(now) {
        const dt = Math.min(0.05, Math.max(0.001, (now - this.lastTime) / 1000));
        this.lastTime = now;
        const elapsed = now / 1000;

        sfx.updateBgm(dt);
        this.updatePlayer(dt, elapsed);
        this.updatePet(dt, elapsed);
        this.updateMonsters(dt);
        this.updateAiAllies(dt);
        this.checkTowerWaveClear();
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

    isOnWarpPortal(pos) {
        if (!pos || this.currentZoneId === 'town') return false;
        return Math.hypot(pos.x, pos.z) <= this.WARP_PORTAL_RADIUS;
    },

    clampPosition(pos) {
        const maxR = this.FIELD_LIMIT - 1.0;
        const d = Math.hypot(pos.x, pos.z);
        if (d > maxR) {
            pos.x = (pos.x / d) * maxR;
            pos.z = (pos.z / d) * maxR;
        }
    },

    getNearestMonster(maxRange = 999) {
        if (!this.player) return null;
        let best = null;
        let bestDist = maxRange;
        for (const m of this.monsters) {
            if (m.dead) continue;
            const d = this.player.pos.distanceTo(m.pos);
            if (d < bestDist) {
                bestDist = d;
                best = m;
            }
        }
        return best;
    },

    getValidTarget() {
        if (this.selectedTarget && !this.selectedTarget.dead) return this.selectedTarget;
        this.selectedTarget = this.getNearestMonster(24);
        return this.selectedTarget;
    },

    cycleTarget() {
        const alive = this.monsters.filter(m => !m.dead);
        if (alive.length === 0) {
            this.showAlertBanner('近くに敵がいません', 1100);
            return;
        }
        const curIdx = alive.indexOf(this.selectedTarget);
        this.selectedTarget = alive[(curIdx + 1) % alive.length];
        this.spawnRingEffect(this.selectedTarget.pos, 0x38bdf8, 1.8);
        this.showAlertBanner(`🎯 標的: ${this.selectedTarget.name} (Lv.${this.selectedTarget.lv})`, 1200);
    },

    getLevelDiffDamageMultiplier(targetLv) {
        const myLv = this.saveData.lv || 1;
        if (targetLv <= myLv) return 1.0;
        const diff = targetLv - myLv;
        return Math.max(0.06, 1 / (1 + diff * 0.09));
    },

    damageMonster(m, rawDmg, isCrit = false) {
        if (!m || m.dead) return 0;
        const st = this.calcDerivedStats();
        const lvMult = this.getLevelDiffDamageMultiplier(m.lv);
        const bossMult = m.isBoss ? (st.bossDmgMult || 1.0) : 1.0;
        const dmg = Math.max(1, Math.round(rawDmg * lvMult * bossMult));

        m.aggro = true;
        this.selectedTarget = m;
        m.hp = Math.max(0, m.hp - dmg);

        // 装飾品の与ダメHP吸収効果
        if (st.lifesteal > 0 && this.player && !this.isDead) {
            const stealHp = Math.max(1, Math.round(dmg * st.lifesteal));
            this.player.hp = Math.min(st.maxHp, this.player.hp + stealHp);
        }

        sfx.playHit(isCrit);
        const isResisted = lvMult < 0.85;
        const label = isCrit
            ? `💥${formatBigNum(dmg)}!${isResisted ? '(格上耐性)' : ''}`
            : `${formatBigNum(dmg)}${isResisted ? '🛡️' : ''}`;
        const color = isResisted ? '#94a3b8' : (isCrit ? '#fde047' : '#ffffff');
        this.spawnFloatingText(m.pos, label, color, isCrit ? 1.25 : 1.0);

        if (m.hp <= 0) {
            m.dead = true;
            m.casting = null;
            m.respawnTimer = m.noRespawn ? 999999 : (m.isBoss ? 8.0 : 3.5);
            if (m.group) m.group.visible = false;
            if (m.plateEl) m.plateEl.style.display = 'none';
            if (m.isRaidBoss) document.getElementById('boss-cast-box')?.classList.add('hidden');
            if (this.selectedTarget === m) this.selectedTarget = null;
            this.grantKillRewards(m);
        }
        return dmg;
    },

    grantKillRewards(m) {
        const d = this.saveData;
        const st = this.calcDerivedStats();
        const gainExp = Math.round(m.exp * st.treeRewardMult);
        const gainGold = Math.round(m.gold * st.treeRewardMult);

        d.exp += gainExp;
        d.gold += gainGold;

        // 実績用スタッツ記録
        if (!d.statsTrack) d.statsTrack = { kills: 0, bossKills: 0, bestTowerFloor: 0, maxThreatKill: 0 };
        d.statsTrack.kills = (d.statsTrack.kills || 0) + 1;
        if (m.isBoss) d.statsTrack.bossKills = (d.statsTrack.bossKills || 0) + 1;
        if ((d.threatRank || 0) > (d.statsTrack.maxThreatKill || 0)) {
            d.statsTrack.maxThreatKill = d.threatRank || 0;
        }

        if (m.drop && MATERIALS[m.drop]) {
            const dropAmt = m.isBoss ? (2 + Math.floor((d.threatRank || 0) / 3)) : 1;
            d.materials[m.drop] = (d.materials[m.drop] || 0) + dropAmt;
            this.spawnFloatingText(m.pos, `${MATERIALS[m.drop].icon}+${dropAmt}`, '#6ee7b7', 0.95);
        }

        if (m.isBoss) {
            const dropChance = Math.min(1.0, 0.30 + m.lv * 0.008);
            if (Math.random() < dropChance) {
                const bonusAp = 1 + Math.floor(m.lv / 25);
                const bonusSp = (m.lv >= 20 && Math.random() < Math.min(0.95, 0.25 + m.lv * 0.006))
                    ? (1 + Math.floor(m.lv / 50))
                    : 0;
                d.ap += bonusAp;
                d.sp += bonusSp;
                const dropTxt = bonusSp > 0 ? `✨AP+${bonusAp} / SP+${bonusSp}` : `✨AP+${bonusAp}`;
                this.spawnFloatingText(m.pos, dropTxt, '#f0abfc', 1.2);
                this.showAlertBanner(`👑 ボス討伐報酬！ ${dropTxt} をドロップ獲得！`, 2200);
            }
        }

        let leveledUp = false;
        while (d.lv < MAX_PLAYER_LEVEL && d.exp >= this.getExpNeeded(d.lv)) {
            d.exp -= this.getExpNeeded(d.lv);
            d.lv += 1;
            d.ap += 3;
            d.sp += 1;
            leveledUp = true;
        }
        if (d.lv >= MAX_PLAYER_LEVEL) {
            d.exp = Math.min(d.exp, this.getExpNeeded(MAX_PLAYER_LEVEL));
        }

        if (leveledUp) {
            const newSt = this.calcDerivedStats();
            this.player.hp = newSt.maxHp;
            this.player.mp = newSt.maxMp;
            sfx.playLevelUp();
            this.spawnPillarEffect(this.player.pos, 0xfde047, 1.8, 7.0);
            this.spawnRingEffect(this.player.pos, 0xfde047, 4.2);
            this.showAlertBanner(`🎉 LEVEL UP! Lv.${d.lv} 到達！(AP+3 / SP+1)`, 2400);
            this.saveGame(false);
        }
    },

    // ⑤ 無限の試練の塔 ウェーブ制覇＆次階層進行
    checkTowerWaveClear() {
        if (!this.towerState.active || this.towerState.clearing || this.isDead) return;
        if (this.monsters.length === 0) return;

        const allDead = this.monsters.every(m => m.dead);
        if (!allDead) return;

        this.towerState.clearing = true;
        const clearedFloor = this.towerState.floor;
        const d = this.saveData;

        if (!d.statsTrack) d.statsTrack = { kills: 0, bossKills: 0, bestTowerFloor: 0, maxThreatKill: 0 };
        if (clearedFloor > (d.statsTrack.bestTowerFloor || 0)) {
            d.statsTrack.bestTowerFloor = clearedFloor;
        }

        const bonusGold = Math.round(160 * Math.pow(1.18, clearedFloor - 1));
        d.gold += bonusGold;
        if (clearedFloor % 5 === 0) {
            d.ap += 3;
            d.sp += 1;
        }

        sfx.playLevelUp();
        this.spawnPillarEffect(this.player.pos, 0xc084fc, 1.8, 8.5);
        this.showAlertBanner(
            `🗼 第${clearedFloor}階層 制覇！(+${formatBigNum(bonusGold)}G${clearedFloor % 5 === 0 ? ' / AP+3 / SP+1' : ''}) 次階層へ！`,
            2000
        );
        this.saveGame(false);

        setTimeout(() => {
            if (!this.towerState.active || this.isDead) return;
            this.monsters.forEach(m => {
                if (m.group && this.scene) this.scene.remove(m.group);
                if (m.plateEl) m.plateEl.remove();
            });
            this.monsters = [];
            this.selectedTarget = null;
            this.towerState.floor = clearedFloor + 1;
            this.towerState.clearing = false;
            this.spawnTowerFloor(this.towerState.floor);
            this.refreshAllHUD();
        }, 1250);
    },

    triggerDeathSequence() {
        if (this.isDead) return;
        this.isDead = true;
        this.autoHunt = false;
        const autoBtn = document.getElementById('btn-toggle-autohunt');
        if (autoBtn) autoBtn.textContent = '🤖 AUTO:OFF';

        sfx.playDeath();
        const overlay = document.getElementById('death-overlay');
        if (overlay) overlay.classList.remove('hidden');

        setTimeout(() => {
            if (overlay) overlay.classList.add('hidden');
            this.loadZone('town');
            const resetSt = this.calcDerivedStats();
            this.player.hp = resetSt.maxHp;
            this.player.mp = resetSt.maxMp;
            this.isDead = false;
            this.showAlertBanner('🏠 「始まりの顔文字広場」で復活しました！装備やLvを整えよう', 2800);
        }, 2100);
    },

    damagePlayer(rawAtk) {
        if (!this.player || this.currentZoneId === 'town' || this.isDead) return;
        if (this.player.invulnTimer > 0) return;

        const st = this.calcDerivedStats();
        const dmg = Math.max(1, Math.round(rawAtk * (1 - st.defMitigation)));
        this.player.hp = Math.max(0, this.player.hp - dmg);
        this.spawnFloatingText(this.player.pos, `-${formatBigNum(dmg)}`, '#fb7185', 1.05);

        if (this.player.hp <= 0) {
            this.triggerDeathSequence();
        }
    },

    // スキル発動（装飾品の25%スキル2連発＋全身モーション＆3Dビジュアル）
    useSkillSlot(slotIdx) {
        if (!this.player || this.isModalOpen || this.isDead) return;
        const d = this.saveData;
        const skId = d.equippedSkills[slotIdx];
        const sk = skId ? SKILLS[skId] : null;
        if (!sk) return;

        const skLv = d.skills[skId] || 1;
        const mpCost = getSkillMpCost(sk, skLv);

        if ((this.player.skillCds[slotIdx] || 0) > 0) return;
        if (this.player.mp < mpCost) {
            this.showAlertBanner(`MPが足りません！(必要MP: ${mpCost})`, 950);
            return;
        }

        const target = this.getValidTarget();
        const needsTarget = ['SINGLE_DMG', 'INTERRUPT', 'THUNDER', 'DRAIN'].includes(sk.type);
        if (needsTarget && (!target || target.dead)) {
            this.showAlertBanner('攻撃対象の敵がいません！', 1000);
            return;
        }

        const st = this.calcDerivedStats();
        this.player.mp -= mpCost;
        this.player.skillCds[slotIdx] = Math.max(0.6, sk.cd * (1 - st.cdReduction));
        sfx.playSkill();

        this.executeSkillEffect(sk, skLv, st, target);

        // 装飾品の「スキル2連発」判定
        if (st.doubleCast > 0 && Math.random() < st.doubleCast) {
            setTimeout(() => {
                if (this.isDead || !this.player) return;
                const reTarget = (target && !target.dead) ? target : this.getValidTarget();
                if (needsTarget && (!reTarget || reTarget.dead)) return;
                sfx.playSkill();
                this.spawnFloatingText(this.player.pos, '♊ スキル2連発！', '#f0abfc', 1.15);
                this.executeSkillEffect(sk, skLv, this.calcDerivedStats(), reTarget);
            }, 260);
        }
    },

    executeSkillEffect(sk, skLv, st, target) {
        const pPos = this.player.pos;
        const eff = getSkillEffectStats(sk, skLv, st);

        const extraCrit = sk.type === 'SINGLE_DMG' ? skLv * 0.025 : 0;
        const totalSkCrit = st.rawCritChance + extraCrit;
        const crit = Math.random() < Math.min(1.0, totalSkCrit);
        const skOverflowBonus = Math.max(0, totalSkCrit - 1.0) * 1.5;
        const critMult = crit ? (st.critDmg + (skOverflowBonus - st.overflowCritDmgBonus)) : 1.0;

        if (target && !target.dead) {
            const dx = target.pos.x - pPos.x;
            const dz = target.pos.z - pPos.z;
            if (dx * dx + dz * dz > 0.01) this.player.rotY = Math.atan2(dx, dz);
        }

        if (sk.id === 'void_blade') {
            this.playSkillMotion('jump_slash', 0.48);
            const dmg = st.physAtk * st.magMult * eff.mult;
            this.damageMonster(target, dmg * critMult, crit);
            this.spawnCrossSlashEffect(target.pos, 0xc084fc, 3.8);
            this.spawnPillarEffect(target.pos, 0x9333ea, 1.3, 6.5);
        } else if (sk.type === 'SINGLE_DMG') {
            this.playSkillMotion('jump_slash', 0.42);
            const dmg = st.physAtk * st.magMult * eff.mult;
            this.damageMonster(target, dmg * critMult, crit);
            this.spawnCrossSlashEffect(target.pos, 0x38bdf8, 2.8);
        } else if (sk.type === 'THUNDER') {
            this.playSkillMotion('cast_up', 0.45);
            const dmg = st.physAtk * st.magMult * eff.mult;
            this.damageMonster(target, dmg * critMult, crit);
            this.spawnPillarEffect(target.pos, 0xfde047, 1.1, 12.0);
            this.spawnRingEffect(target.pos, 0xfef08a, 3.6);
        } else if (sk.type === 'INTERRUPT') {
            this.playSkillMotion('slam_ground', 0.44);
            const dmg = st.physAtk * st.magMult * eff.mult;
            this.damageMonster(target, dmg * critMult, crit);
            target.stunTimer = eff.stunDur;
            if (target.casting) {
                target.casting = null;
                document.getElementById('boss-cast-box')?.classList.add('hidden');
                this.showAlertBanner(`🛡️ ボス詠唱中断＋気絶 ${eff.stunDur}秒！`, 1800);
            }
            this.spawnRingEffect(target.pos, 0xfbbf24, 3.4);
            this.spawnCrossSlashEffect(target.pos, 0xf59e0b, 2.6);
        } else if (sk.type === 'DRAIN') {
            this.playSkillMotion('dash_thrust', 0.42);
            const dmg = st.physAtk * st.magMult * eff.mult;
            const dealt = this.damageMonster(target, dmg * critMult, crit);
            const heal = Math.round(dealt * eff.drainRate);
            this.player.hp = Math.min(st.maxHp, this.player.hp + heal);
            this.spawnFloatingText(pPos, `🩸+${formatBigNum(heal)}`, '#34d399', 1.05);
            this.spawnBeamEffect(target.pos, pPos, 0xe11d48, 0.25);
            this.spawnRingEffect(pPos, 0xf43f5e, 2.4);
        } else if (sk.type === 'AOE_DMG' || sk.type === 'AOE_SLOW' || sk.type === 'AOE_BURN') {
            const rad = sk.radius || 6.5;
            const dmg = st.physAtk * st.magMult * eff.mult;

            if (sk.id === 'spin_whirl') {
                this.playSkillMotion('spin_whirl', 0.52);
                this.spawnRingEffect(pPos, 0x38bdf8, rad);
                this.spawnRingEffect(pPos, 0xe0f2fe, rad * 0.65);
            } else if (sk.id === 'meteor_star') {
                this.playSkillMotion('cast_up', 0.55);
                this.spawnMeteorEffect(pPos, 0xf97316, rad);
            } else if (sk.id === 'genesis_nova') {
                this.playSkillMotion('cast_up', 0.65);
                this.spawnPillarEffect(pPos, 0xfde047, 2.4, 14.0);
                this.spawnRingEffect(pPos, 0xf43f5e, rad);
                this.spawnRingEffect(pPos, 0xfde047, rad * 0.7);
            } else if (sk.type === 'AOE_SLOW') {
                this.playSkillMotion('slam_ground', 0.48);
                this.spawnIceSpikesEffect(pPos, rad);
                this.spawnRingEffect(pPos, 0x38bdf8, rad);
            } else {
                this.playSkillMotion('jump_slash', 0.52);
                this.spawnPillarEffect(pPos, 0xf97316, 2.0, 9.0);
                this.spawnRingEffect(pPos, 0xef4444, rad);
            }

            this.monsters.forEach(m => {
                if (!m.dead && pPos.distanceTo(m.pos) <= rad) {
                    this.damageMonster(m, dmg * critMult, crit);
                    if (sk.type === 'AOE_SLOW') {
                        m.slowTimer = eff.slowDur;
                        m.slowFactor = eff.slowFactor;
                    } else if (sk.type === 'AOE_BURN') {
                        m.burnTimer = 4.5;
                        m.burnDps = dmg * 0.38;
                    }
                }
            });
        } else if (sk.type === 'HEAL' || sk.type === 'HEAL_MP') {
            this.playSkillMotion('cast_up', 0.48);
            const healHp = Math.round(st.maxHp * eff.hpPct);
            this.player.hp = Math.min(st.maxHp, this.player.hp + healHp);
            this.player.stunTimer = 0;
            if (sk.type === 'HEAL_MP') {
                const healMp = Math.round(st.maxMp * eff.mpPct);
                this.player.mp = Math.min(st.maxMp, this.player.mp + healMp);
                this.spawnFloatingText(pPos, `🌈HP+${formatBigNum(healHp)} / MP+${formatBigNum(healMp)}`, '#6ee7b7', 1.1);
                this.spawnPillarEffect(pPos, 0xe879f9, 1.5, 8.0);
            } else {
                this.spawnFloatingText(pPos, `💚+${formatBigNum(healHp)}`, '#34d399', 1.1);
                this.spawnPillarEffect(pPos, 0x34d399, 1.3, 7.5);
            }
            this.spawnRingEffect(pPos, 0x34d399, 3.2);
        } else if (sk.type === 'DEF_BUFF') {
            this.playSkillMotion('slam_ground', 0.45);
            this.player.defBuffTimer = eff.duration;
            this.player.defBuffBonus = eff.defBonus;
            this.player.invulnTimer = Math.max(this.player.invulnTimer, eff.invuln);
            this.spawnDomeEffect(pPos, 0x38bdf8, 2.3);
            this.spawnRingEffect(pPos, 0x7dd3fc, 3.4);
            this.spawnFloatingText(pPos, `🔰 軽減+${Math.round(eff.defBonus * 100)}% (${eff.duration}s)`, '#7dd3fc', 1.05);
        } else if (sk.type === 'ATK_BUFF') {
            this.playSkillMotion('cast_up', 0.48);
            this.player.warcryTimer = eff.duration;
            this.player.warcryBonus = 1 + eff.atkBonus;
            this.spawnPillarEffect(pPos, 0xf97316, 1.6, 8.5);
            this.spawnRingEffect(pPos, 0xfbbf24, 3.4);
            this.spawnFloatingText(pPos, `🔥 攻撃+${Math.round(eff.atkBonus * 100)}% (${eff.duration}s)`, '#fbbf24', 1.05);
        }
    },

    triggerEmote(emoteId) {
        const em = EMOTES.find(e => e.id === emoteId);
        if (!em || !this.player) return;

        document.getElementById('emote-palette')?.classList.add('hidden');
        this.emoteTimer = 2.6;
        this.emoteMotion = em.motion;

        if (this.useWebGL && this.player.frontMat) {
            this.player.frontMat.map = getKaomojiFaceTexture(em.kaomoji, '#073b66', '#ffffff', '#f472b6');
            this.player.frontMat.needsUpdate = true;
        }

        sfx.playTone(587, 0.09, 'sine', 0.07);
        setTimeout(() => sfx.playTone(880, 0.12, 'triangle', 0.07), 65);

        const pPos = this.player.pos;
        const fwdX = Math.sin(this.player.rotY);
        const fwdZ = Math.cos(this.player.rotY);

        if (em.id === 'tableflip') {
            this.spawnTableFlipEffect(pPos, fwdX, fwdZ);
            this.spawnRingEffect(pPos, 0xf97316, 3.8);
            this.spawnFloatingText(pPos, '┻━┻ 彡(°□°)', '#fbbf24', 1.3);
        } else if (em.id === 'beam') {
            const endPos = new THREE.Vector3(pPos.x + fwdX * 12, 1.2, pPos.z + fwdZ * 12);
            this.spawnBeamEffect(new THREE.Vector3(pPos.x, 1.2, pPos.z), endPos, 0x38bdf8, 0.55);
            this.spawnRingEffect(pPos, 0x7dd3fc, 4.0);
            this.spawnFloatingText(pPos, '━☆・*。⚡', '#7dd3fc', 1.25);
        } else if (em.id === 'joy' || em.id === 'love' || em.id === 'victory' || em.id === 'dance') {
            this.spawnSparkleBurst(pPos, em.id === 'love' ? 0xf472b6 : 0xfde047, 10);
            this.spawnPillarEffect(pPos, 0xf472b6, 1.2, 5.5);
            this.spawnRingEffect(pPos, 0xfde047, 3.2);
        } else if (em.id === 'fire' || em.id === 'flex' || em.id === 'cool') {
            this.spawnPillarEffect(pPos, 0xf97316, 1.4, 6.5);
            this.spawnRingEffect(pPos, 0xfbbf24, 3.0);
        } else if (em.id === 'dogeza') {
            this.spawnRingEffect(pPos, 0x94a3b8, 3.4);
            this.spawnFloatingText(pPos, '＿|￣|○ ｽﾐﾏｾﾝ!!', '#e2e8f0', 1.2);
        } else {
            this.spawnSparkleBurst(pPos, 0xf472b6, 6);
            this.spawnRingEffect(pPos, 0xf472b6, 2.5);
        }

        this.spawnEmoteBubble(pPos, em.kaomoji, em.msg, 2.8);

        if (this.currentZoneId === 'town' && this.aiAllies.length > 0) {
            this.aiAllies.forEach((ally, i) => {
                setTimeout(() => {
                    if (this.currentZoneId === 'town') {
                        this.spawnEmoteBubble(ally.pos, ally.kaomoji, em.allyReply, 2.6);
                    }
                }, 350 + i * 280);
            });
        }
    },

    spawnSlashEffect(pos, colorHex = 0x38bdf8) {
        if (!this.useWebGL) return;
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(2.4, 0.14, 0.28),
            new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.95 })
        );
        mesh.position.set(pos.x, 1.1, pos.z);
        mesh.rotation.y = Math.random() * Math.PI;
        mesh.rotation.z = 0.55;
        this.scene.add(mesh);
        this.effects.push({ mesh, life: 0.24, maxLife: 0.24, kind: 'fade' });
    },

    spawnCrossSlashEffect(pos, colorHex = 0x38bdf8, size = 3.0) {
        if (!this.useWebGL) return;
        const grp = new THREE.Group();
        grp.position.set(pos.x, 1.25, pos.z);
        grp.rotation.y = this.player ? this.player.rotY : 0;
        const mat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.95 });
        const b1 = new THREE.Mesh(new THREE.BoxGeometry(size, 0.16, 0.22), mat);
        b1.rotation.z = 0.65;
        const b2 = new THREE.Mesh(new THREE.BoxGeometry(size, 0.16, 0.22), mat);
        b2.rotation.z = -0.65;
        grp.add(b1, b2);
        this.scene.add(grp);
        this.effects.push({ mesh: grp, life: 0.32, maxLife: 0.32, kind: 'expand' });
    },

    spawnRingEffect(pos, colorHex = 0x38bdf8, radius = 3.0) {
        if (!this.useWebGL) return;
        const mesh = new THREE.Mesh(
            new THREE.RingGeometry(0.3, radius, 28),
            new THREE.MeshBasicMaterial({ color: colorHex, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
        );
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(pos.x, 0.12, pos.z);
        this.scene.add(mesh);
        this.effects.push({ mesh, life: 0.38, maxLife: 0.38, kind: 'expand' });
    },

    spawnPillarEffect(pos, colorHex = 0xfde047, radius = 1.4, height = 8.0) {
        if (!this.useWebGL) return;
        const mesh = new THREE.Mesh(
            new THREE.CylinderGeometry(radius * 0.5, radius, height, 14, 1, true),
            new THREE.MeshBasicMaterial({ color: colorHex, side: THREE.DoubleSide, transparent: true, opacity: 0.72 })
        );
        mesh.position.set(pos.x, height * 0.5, pos.z);
        this.scene.add(mesh);
        this.effects.push({ mesh, life: 0.48, maxLife: 0.48, kind: 'pillar' });
    },

    spawnDomeEffect(pos, colorHex = 0x38bdf8, radius = 2.2) {
        if (!this.useWebGL) return;
        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(radius, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55),
            new THREE.MeshBasicMaterial({ color: colorHex, wireframe: true, transparent: true, opacity: 0.85 })
        );
        mesh.position.set(pos.x, 0.1, pos.z);
        this.scene.add(mesh);
        this.effects.push({ mesh, life: 0.65, maxLife: 0.65, kind: 'expand' });
    },

    spawnMeteorEffect(pos, colorHex = 0xf97316, rad = 6.5) {
        if (!this.useWebGL) return;
        const meteor = new THREE.Mesh(
            new THREE.DodecahedronGeometry(1.65, 0),
            new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.95 })
        );
        meteor.position.set(pos.x, 12.0, pos.z);
        this.scene.add(meteor);
        this.effects.push({ mesh: meteor, life: 0.42, maxLife: 0.42, kind: 'fall', startY: 12.0 });
        setTimeout(() => {
            this.spawnRingEffect(pos, colorHex, rad);
            this.spawnPillarEffect(pos, 0xfde047, 2.0, 8.5);
        }, 280);
    },

    spawnIceSpikesEffect(pos, rad = 6.0) {
        if (!this.useWebGL) return;
        const mat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.88 });
        for (let i = 0; i < 8; i++) {
            const ang = (i / 8) * Math.PI * 2;
            const dist = rad * 0.55;
            const spike = new THREE.Mesh(new THREE.ConeGeometry(0.45, 2.8, 6), mat);
            spike.position.set(pos.x + Math.cos(ang) * dist, 1.3, pos.z + Math.sin(ang) * dist);
            spike.rotation.z = Math.cos(ang) * -0.25;
            spike.rotation.x = Math.sin(ang) * 0.25;
            this.scene.add(spike);
            this.effects.push({ mesh: spike, life: 0.55, maxLife: 0.55, kind: 'fade' });
        }
    },

    spawnBeamEffect(fromPos, toPos, colorHex = 0x38bdf8, dur = 0.45) {
        if (!this.useWebGL) return;
        const dx = toPos.x - fromPos.x;
        const dz = toPos.z - fromPos.z;
        const dist = Math.max(0.5, Math.hypot(dx, dz));
        const beam = new THREE.Mesh(
            new THREE.CylinderGeometry(0.28, 0.28, dist, 10),
            new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.92 })
        );
        beam.position.set((fromPos.x + toPos.x) * 0.5, 1.25, (fromPos.z + toPos.z) * 0.5);
        beam.rotation.z = Math.PI / 2;
        beam.rotation.y = -Math.atan2(dz, dx);
        this.scene.add(beam);
        this.effects.push({ mesh: beam, life: dur, maxLife: dur, kind: 'fade' });
    },

    spawnTableFlipEffect(pos, fwdX, fwdZ) {
        if (!this.useWebGL) return;
        const table = new THREE.Group();
        const woodMat = new THREE.MeshLambertMaterial({ color: 0xb45309 });
        const top = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 0.14, 14), woodMat);
        table.add(top);
        [[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]].forEach(([lx, lz]) => {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.55, 0.14), woodMat);
            leg.position.set(lx, -0.32, lz);
            table.add(leg);
        });
        table.position.set(pos.x + fwdX * 1.2, 1.0, pos.z + fwdZ * 1.2);
        this.scene.add(table);
        this.effects.push({
            mesh: table,
            life: 0.95,
            maxLife: 0.95,
            kind: 'toss',
            vx: fwdX * 9.5,
            vz: fwdZ * 9.5
        });
    },

    spawnSparkleBurst(pos, colorHex = 0xfde047, count = 8) {
        if (!this.useWebGL) return;
        const mat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.95 });
        for (let i = 0; i < count; i++) {
            const ang = (i / count) * Math.PI * 2;
            const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), mat);
            star.position.set(pos.x + Math.cos(ang) * 1.1, 1.2 + (i % 3) * 0.4, pos.z + Math.sin(ang) * 1.1);
            this.scene.add(star);
            this.effects.push({ mesh: star, life: 0.75, maxLife: 0.75, kind: 'rise' });
        }
    },

    spawnFloatingText(pos, text, color = '#ffffff', scale = 1.0) {
        const el = document.createElement('div');
        el.className = 'world-float-text';
        el.style.color = color;
        el.style.fontSize = `${Math.round(15 * scale)}px`;
        el.textContent = text;
        this.overlayLayer.appendChild(el);
        this.floatTexts.push({
            el,
            worldPos: new THREE.Vector3(pos.x + (Math.random() - 0.5) * 0.8, 2.2, pos.z),
            life: 0.88
        });
    },

    spawnEmoteBubble(pos, kaomoji, msg, life = 2.6) {
        const el = document.createElement('div');
        el.className = 'world-emote-bubble';
        el.innerHTML = `<div class="font-kaomoji" style="font-size:12px; font-weight:900; color:#f9a8d4;">${kaomoji}</div><div style="font-size:10px; font-weight:800; color:#fff;">${msg}</div>`;
        this.overlayLayer.appendChild(el);
        this.emoteBubbles.push({
            el,
            worldPos: new THREE.Vector3(pos.x, 2.85, pos.z),
            life
        });
    },

    showAlertBanner(msg, duration = 2000) {
        const banner = document.getElementById('alert-banner');
        if (!banner) return;
        banner.textContent = msg;
        banner.classList.remove('hidden');
        if (this.alertTimeout) clearTimeout(this.alertTimeout);
        this.alertTimeout = setTimeout(() => banner.classList.add('hidden'), duration);
    },

    // ① 相棒・ペットAI更新（後ろを付いてきて攻撃＆回復援護！）
    updatePet(dt, elapsed) {
        if (!this.petEntity || !this.player) return;
        const pet = this.petEntity;
        const pPos = this.player.pos;

        const targetOffsetX = -Math.sin(this.player.rotY) * 1.6 - Math.cos(this.player.rotY) * 1.1;
        const targetOffsetZ = -Math.cos(this.player.rotY) * 1.6 + Math.sin(this.player.rotY) * 1.1;
        const goalX = pPos.x + targetOffsetX;
        const goalZ = pPos.z + targetOffsetZ;

        const dx = goalX - pet.pos.x;
        const dz = goalZ - pet.pos.z;
        const dist = Math.hypot(dx, dz);
        if (dist > 0.25) {
            const spd = dist > 7 ? 18.0 : 10.5;
            pet.pos.x += (dx / dist) * spd * dt;
            pet.pos.z += (dz / dist) * spd * dt;
        }

        if (pet.group) {
            pet.group.position.set(pet.pos.x, Math.abs(Math.sin(elapsed * 7.5)) * 0.22, pet.pos.z);
            pet.group.rotation.y = this.player.rotY;
        }

        if (this.currentZoneId === 'town' || this.isDead || this.isModalOpen) return;

        const st = this.calcDerivedStats();
        const petLvMult = 1 + ((this.saveData.petLevel || 1) - 1) * 0.16;

        // ペット攻撃援護
        pet.atkTimer -= dt;
        if (pet.atkTimer <= 0) {
            const target = this.getNearestMonster(8.5);
            if (target && !target.dead) {
                pet.atkTimer = 1.65;
                const petDmg = Math.max(1, Math.round(st.physAtk * pet.def.atkRatio * petLvMult));
                this.damageMonster(target, petDmg, false);
                this.spawnBeamEffect(
                    new THREE.Vector3(pet.pos.x, 0.7, pet.pos.z),
                    new THREE.Vector3(target.pos.x, 1.0, target.pos.z),
                    pet.def.color,
                    0.18
                );
            } else {
                pet.atkTimer = 0.5;
            }
        }

        // ペット回復・MP支援
        pet.healTimer -= dt;
        if (pet.healTimer <= 0) {
            pet.healTimer = 5.5;
            if (this.player.hp < st.maxHp * 0.92 && pet.def.healRatio > 0) {
                const healHp = Math.max(1, Math.round(st.maxHp * pet.def.healRatio * Math.min(2.0, 1 + ((this.saveData.petLevel || 1) - 1) * 0.05)));
                this.player.hp = Math.min(st.maxHp, this.player.hp + healHp);
                this.spawnFloatingText(pPos, `🐾+${formatBigNum(healHp)}`, '#6ee7b7', 0.92);
            }
            if (pet.def.mpRestore && this.player.mp < st.maxMp * 0.90) {
                const healMp = Math.max(1, Math.round(st.maxMp * pet.def.mpRestore));
                this.player.mp = Math.min(st.maxMp, this.player.mp + healMp);
                this.spawnFloatingText(pPos, `🐾MP+${formatBigNum(healMp)}`, '#7dd3fc', 0.90);
            }
        }
    }
});
