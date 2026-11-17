'use strict';

// =========================================================================
// 顔文字ファンタジー3D 戦闘・スキル演出・共闘報酬・エモート (game3.js)
// =========================================================================

Object.assign(KaomojiMMORPG.prototype, {

    showAlertBanner(msg, duration = 1800) {
        const el = document.getElementById('alert-banner');
        if (!el) return;
        el.textContent = msg;
        el.classList.remove('hidden');
        clearTimeout(this._alertTimer);
        this._alertTimer = setTimeout(() => el.classList.add('hidden'), duration);
    },

    spawnFloatText(worldPos, text, color = '#ffffff', size = 14) {
        const el = document.createElement('div');
        el.className = 'world-float-text';
        el.textContent = text;
        el.style.color = color;
        el.style.fontSize = `${size}px`;
        this.overlayLayer.appendChild(el);
        this.floatTexts.push({ el, worldPos: worldPos.clone(), life: 1.05 });
    },

    spawnEmoteBubble(worldPos, kaomoji, msg) {
        const el = document.createElement('div');
        el.className = 'world-emote-bubble';
        el.innerHTML = `<div class="font-kaomoji" style="font-size:12px; font-weight:900; color:#f9a8d4;">${kaomoji}</div><div style="font-size:10px; font-weight:800; color:#fff;">${msg}</div>`;
        this.overlayLayer.appendChild(el);
        this.emoteBubbles.push({ el, worldPos: worldPos.clone(), life: 2.6 });
    },

    triggerEmote(emoteId) {
        const em = EMOTES.find(x => x.id === emoteId);
        if (!em || !this.player) return;
        sfx.init();
        sfx.playSkill();

        this.emoteTimer = 2.6;
        this.emoteMotion = em.motion;
        if (this.useWebGL && this.player.frontMat) {
            const hexStr = '#' + this.getPlayerBodyHexColor().toString(16).padStart(6, '0');
            this.player.frontMat.map = getKaomojiFaceTexture(em.kaomoji, this.getPlayerFaceBgHex(), '#fde047', hexStr);
            this.player.frontMat.needsUpdate = true;
        }

        this.spawnEmoteBubble(this.player.pos.clone().add(new THREE.Vector3(0, 2.7, 0)), em.kaomoji, em.msg);
        this.spawnSparkleBurst(this.player.pos, 0xf472b6, 10);

        if (em.id === 'beam') {
            this.spawnProjectileBeam(this.player.pos, this.player.rotY, 0x38bdf8);
        }

        if (this.currentZoneId === 'town' && this.aiAllies.length > 0) {
            const ally = this.aiAllies[Math.floor(Math.random() * this.aiAllies.length)];
            setTimeout(() => {
                if (this.currentZoneId === 'town') {
                    this.spawnEmoteBubble(ally.pos.clone().add(new THREE.Vector3(0, 2.6, 0)), '(≧▽≦)', em.allyReply);
                }
            }, 450);
        }

        if (this.broadcastFirebaseEvent) {
            this.broadcastFirebaseEvent('emote', { emoteId: em.id, kaomoji: em.kaomoji, msg: em.msg });
        }
    },

    getNearestMonster(maxDist = 30) {
        if (!this.player) return null;
        let best = null;
        let bestD = maxDist;
        for (const m of this.monsters) {
            if (m.dead) continue;
            const d = this.player.pos.distanceTo(m.pos);
            if (d < bestD) {
                bestD = d;
                best = m;
            }
        }
        return best;
    },

    getValidTarget() {
        if (this.selectedTarget && !this.selectedTarget.dead) return this.selectedTarget;
        this.selectedTarget = this.getNearestMonster(30);
        return this.selectedTarget;
    },

    cycleTarget() {
        const alive = this.monsters.filter(m => !m.dead && this.player && this.player.pos.distanceTo(m.pos) <= 34);
        if (alive.length === 0) {
            this.showAlertBanner('近くにターゲットできる敵がいません', 1100);
            return;
        }
        const idx = alive.indexOf(this.selectedTarget);
        this.selectedTarget = alive[(idx + 1) % alive.length];
        sfx.playTone(620, 'sine', 0.08, 0.06);
    },

    // 手動「⚔️ 攻撃」ボタン用アクション
    performBasicAttack() {
        if (!this.player || this.isDead || this.player.stunTimer > 0) return;
        sfx.init();
        const st = this.calcDerivedStats();
        const target = this.getNearestMonster(6.2) || this.getValidTarget();

        if (target && !target.dead) {
            const dx = target.pos.x - this.player.pos.x;
            const dz = target.pos.z - this.player.pos.z;
            if (dx * dx + dz * dz > 0.01) this.player.rotY = Math.atan2(dx, dz);
        }

        // 剣の振り下ろしアニメーション開始
        this.player.skillAnimType = 'basic_slash';
        this.player.skillAnimDur = 0.24;
        this.player.skillAnimTimer = 0.24;
        this.autoAtkTimer = Math.max(0.42, 0.95 * (1 - st.cdReduction * 0.6));

        if (this.currentZoneId === 'town') {
            sfx.playTone(360, 'triangle', 0.09, 0.06, 180);
            return;
        }

        if (target && !target.dead && this.player.pos.distanceTo(target.pos) <= 6.2) {
            this.selectedTarget = target;
            const crit = Math.random() < st.critChance;
            this.damageMonster(target, st.physAtk * (crit ? st.critDmg : 1), crit);
            this.spawnPlayerAttackEffect(target.pos, st.wpnGlowColor, crit);
        } else {
            sfx.playTone(320, 'triangle', 0.09, 0.06, 150);
            const fwd = new THREE.Vector3(
                this.player.pos.x + Math.sin(this.player.rotY) * 2.2,
                1.0,
                this.player.pos.z + Math.cos(this.player.rotY) * 2.2
            );
            this.spawnSparkleBurst(fwd, st.wpnGlowColor, 4);
        }
    },

    damageMonster(m, rawDmg, isCrit = false) {
        if (!m || m.dead) return;
        const st = this.calcDerivedStats();
        let dmg = Math.max(1, Math.round(rawDmg * (m.isBoss ? st.bossDmgMult : 1.0)));

        m.hp -= dmg;
        m.aggro = true;
        m.damagedByPlayer = true;
        this.selectedTarget = m;

        if (st.lifesteal > 0 && this.player) {
            const heal = Math.max(1, Math.round(dmg * st.lifesteal));
            this.player.hp = Math.min(st.maxHp, this.player.hp + heal);
        }

        sfx.playHit(isCrit);
        this.spawnFloatText(
            m.pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.8, (m.scale || 1) * 1.9, 0)),
            (isCrit ? '💥' : '') + formatBigNum(dmg),
            isCrit ? '#fde047' : '#ffffff',
            isCrit ? 18 : 14
        );

        if (m.hp <= 0) {
            m.hp = 0;
            m.dead = true;
            m.respawnTimer = m.isBoss ? 13.0 : 5.5;
            if (m.casting) {
                m.casting = null;
                document.getElementById('boss-cast-box')?.classList.add('hidden');
            }
            if (m.group) m.group.visible = false;
            if (m.plateEl) m.plateEl.style.display = 'none';
            if (this.selectedTarget === m) this.selectedTarget = null;

            this.spawnSparkleBurst(m.pos, m.color, m.isBoss ? 18 : 9);
            this.grantMonsterRewards(m);
            this.checkTowerFloorClear();
        }
    },

    grantMonsterRewards(m) {
        const d = this.saveData;
        const st = this.calcDerivedStats();
        const threat = d.threatRank || 0;
        const coopCount = this.getSameZoneRemoteCount ? this.getSameZoneRemoteCount() : 0;
        const coopMult = coopCount > 0 ? 1.25 : 1.0;
        const threatMult = 1 + threat * 0.25;

        const gainExp = Math.round(m.baseExp * threatMult * coopMult * st.rewardMult);
        const gainGold = Math.round(m.baseGold * threatMult * coopMult * st.rewardMult);

        d.gold += gainGold;
        this.gainExp(gainExp);

        const matKey = m.drop || 'slime_gel';
        const matCount = m.isBoss ? (2 + Math.floor(threat / 10)) : (Math.random() < 0.72 ? 1 + Math.floor(threat / 20) : 0);
        if (matCount > 0 && d.materials[matKey] !== undefined) {
            d.materials[matKey] += matCount;
            const matInfo = MATERIALS[matKey];
            this.spawnFloatText(m.pos.clone().add(new THREE.Vector3(0, 1.5, 0)), `${matInfo.icon}${matInfo.name} x${matCount}`, '#6ee7b7', 13);
        }

        if (!d.statsTrack) d.statsTrack = { kills: 0, bossKills: 0, bestTowerFloor: 0, maxThreatKill: 0 };
        d.statsTrack.kills = (d.statsTrack.kills || 0) + 1;
        if (threat > (d.statsTrack.maxThreatKill || 0)) d.statsTrack.maxThreatKill = threat;

        if (m.isBoss) {
            d.statsTrack.bossKills = (d.statsTrack.bossKills || 0) + 1;
            const bonusAp = 1 + Math.floor(threat / 12);
            const bonusSp = (threat >= 5 || Math.random() < 0.55) ? 1 : 0;
            d.ap += bonusAp;
            d.sp += bonusSp;
            this.showAlertBanner(`👑 ボス撃破！+${formatBigNum(gainExp)}EXP / +${formatBigNum(gainGold)}G / AP+${bonusAp}${bonusSp ? ` SP+${bonusSp}` : ''}`, 2400);
        } else if (coopCount > 0) {
            this.spawnFloatText(this.player.pos.clone().add(new THREE.Vector3(0, 2.7, 0)), `🤝共闘+25% +${formatBigNum(gainGold)}G`, '#fde047', 12);
        }

        if (!this.towerState.active && this.fbConnected && this.broadcastFirebaseEvent) {
            this.broadcastFirebaseEvent('kill', {
                zoneId: this.currentZoneId,
                monsterName: m.name,
                baseExp: m.baseExp,
                baseGold: m.baseGold,
                drop: matKey,
                isBoss: m.isBoss,
                killerThreat: threat
            });
        }

        this.saveGame(false);
        this.refreshAllHUD();
    },

    receiveCoopReward(ev) {
        if (!ev || ev.zoneId !== this.currentZoneId || this.towerState.active) return;
        const d = this.saveData;
        const st = this.calcDerivedStats();

        const effThreat = Math.min(d.threatRank || 0, ev.killerThreat || 0);
        const threatMult = 1 + effThreat * 0.25;

        const lvCapBase = (45 + d.lv * 32) * 1.5;
        const cappedExpBase = Math.min(ev.baseExp || 30, lvCapBase);
        const cappedGoldBase = Math.min(ev.baseGold || 25, lvCapBase);

        const coopMult = 1.25;
        const finalExp = Math.round(cappedExpBase * threatMult * coopMult * st.rewardMult);
        const finalGold = Math.round(cappedGoldBase * threatMult * coopMult * st.rewardMult);

        d.gold += finalGold;
        this.gainExp(finalExp);

        const matKey = ev.drop || 'slime_gel';
        let matMsg = '';
        if (d.materials[matKey] !== undefined) {
            const cnt = ev.isBoss ? 2 : 1;
            d.materials[matKey] += cnt;
            matMsg = ` / ${MATERIALS[matKey].icon}x${cnt}`;
        }

        this.showAlertBanner(`🤝 味方が「${ev.monsterName}」撃破！共闘報酬 +${formatBigNum(finalExp)}EXP / +${formatBigNum(finalGold)}G${matMsg}`, 2200);
        this.saveGame(false);
        this.refreshAllHUD();
    },

    checkTowerFloorClear() {
        if (!this.towerState.active) return;
        const remain = this.monsters.filter(m => !m.dead).length;
        if (remain > 0) return;

        const d = this.saveData;
        const clearedFloor = this.towerState.floor;
        if (!d.statsTrack) d.statsTrack = { kills: 0, bossKills: 0, bestTowerFloor: 0, maxThreatKill: 0 };
        if (clearedFloor > (d.statsTrack.bestTowerFloor || 0)) {
            d.statsTrack.bestTowerFloor = clearedFloor;
        }

        if (clearedFloor % 5 === 0) {
            d.ap += 3;
            d.sp += 1;
            sfx.playLevelUp();
            this.showAlertBanner(`🎉 試練の塔 ${clearedFloor}F守護ボス制覇！AP+3 / SP+1 獲得！`, 2600);
        }

        this.towerState.floor = clearedFloor + 1;
        this.saveGame(false);
        setTimeout(() => {
            if (this.towerState.active) {
                this.spawnTowerFloorMonsters(this.towerState.floor);
                this.refreshAllHUD();
            }
        }, 900);
    },

    gainExp(amount) {
        const d = this.saveData;
        if (d.lv >= MAX_PLAYER_LEVEL) return;
        d.exp += amount;
        let leveled = false;
        while (d.lv < MAX_PLAYER_LEVEL && d.exp >= this.getExpNeeded(d.lv)) {
            d.exp -= this.getExpNeeded(d.lv);
            d.lv += 1;
            d.ap += 3;
            d.sp += 1;
            leveled = true;
        }
        if (leveled) {
            const st = this.calcDerivedStats();
            if (this.player) {
                this.player.hp = st.maxHp;
                this.player.mp = st.maxMp;
                this.spawnDomeEffect(this.player.pos, 0xfde047, 3.6);
            }
            sfx.playLevelUp();
            this.showAlertBanner(`🆙 LEVEL UP! Lv.${d.lv} になった！(AP+3 / SP+1)`, 2200);
        }
    },

    damagePlayer(rawDmg) {
        if (!this.player || this.isDead || this.player.invulnTimer > 0) return;
        const st = this.calcDerivedStats();
        const dmg = Math.max(1, Math.round(rawDmg * (1 - st.defMitigation)));
        this.player.hp = Math.max(0, this.player.hp - dmg);
        this.player.invulnTimer = 0.25;

        this.spawnFloatText(this.player.pos.clone().add(new THREE.Vector3(0, 2.2, 0)), `-${formatBigNum(dmg)}`, '#fb7185', 15);
        if (this.player.hp <= 0) {
            this.handlePlayerDeath();
        }
    },

    handlePlayerDeath() {
        if (this.isDead) return;
        this.isDead = true;
        this.autoHunt = false;
        const autoBtn = document.getElementById('btn-toggle-autohunt');
        if (autoBtn) autoBtn.textContent = '🤖 AUTO:OFF';

        document.getElementById('death-overlay')?.classList.remove('hidden');
        setTimeout(() => {
            document.getElementById('death-overlay')?.classList.add('hidden');
            this.isDead = false;
            const st = this.calcDerivedStats();
            if (this.player) {
                this.player.hp = st.maxHp;
                this.player.mp = st.maxMp;
            }
            this.loadZone('town');
            this.showAlertBanner('🏠 始まりの顔文字広場へ帰還しHP/MPが全回復しました', 2200);
        }, 1800);
    },

    useSkillSlot(slotIdx) {
        if (!this.player || this.isDead || this.player.stunTimer > 0) return;
        const d = this.saveData;
        const skId = d.equippedSkills[slotIdx];
        const sk = skId ? SKILLS[skId] : null;
        if (!sk) return;

        if ((this.player.skillCds[slotIdx] || 0) > 0) return;
        const skLv = d.skills[skId] || 1;
        const cost = getSkillMpCost(sk, skLv);
        if (this.player.mp < cost) {
            this.showAlertBanner('MPが足りません！', 1000);
            return;
        }

        const st = this.calcDerivedStats();
        if (!sk.isSupport && this.currentZoneId === 'town') {
            this.showAlertBanner('安全な街では攻撃スキルを使えません', 1200);
            return;
        }

        this.player.mp -= cost;
        this.player.skillCds[slotIdx] = Math.max(0.4, sk.cd * (1 - st.cdReduction));
        sfx.init();
        sfx.playSkill();

        this.executeSingleSkillCast(sk, skLv, st);

        if (st.doubleCast > 0 && Math.random() < st.doubleCast) {
            setTimeout(() => {
                if (!this.isDead) {
                    this.spawnFloatText(this.player.pos.clone().add(new THREE.Vector3(0, 2.8, 0)), '♊双子星2連発！', '#f0abfc', 14);
                    this.executeSingleSkillCast(sk, skLv, st);
                }
            }, 220);
        }
    },

    executeSingleSkillCast(sk, skLv, st) {
        const eff = getSkillEffectStats(sk, skLv, st);
        const pPos = this.player.pos;
        const basePower = st.physAtk * st.magMult * (eff.mult || 1);

        if (sk.type === 'HEAL' || sk.type === 'HEAL_MP') {
            const healHp = Math.round(st.maxHp * eff.hpPct);
            this.player.hp = Math.min(st.maxHp, this.player.hp + healHp);
            this.spawnFloatText(pPos.clone().add(new THREE.Vector3(0, 2.4, 0)), `+${formatBigNum(healHp)} HP`, '#34d399', 16);
            if (eff.mpPct) {
                const healMp = Math.round(st.maxMp * eff.mpPct);
                this.player.mp = Math.min(st.maxMp, this.player.mp + healMp);
            }
            this.player.skillAnimType = 'cast_up';
            this.player.skillAnimDur = 0.35;
            this.player.skillAnimTimer = 0.35;
            this.spawnDomeEffect(pPos, sk.type === 'HEAL_MP' ? 0xf472b6 : 0x10b981, 3.2);
            sfx.playHeal();
            return;
        }

        if (sk.type === 'DEF_BUFF') {
            this.player.invulnTimer = Math.max(this.player.invulnTimer, eff.invuln);
            this.player.defBuffTimer = eff.duration;
            this.player.defBuffBonus = eff.defBonus;
            this.player.skillAnimType = 'cast_up';
            this.player.skillAnimDur = 0.35;
            this.player.skillAnimTimer = 0.35;
            this.spawnDomeEffect(pPos, 0x38bdf8, 3.4);
            this.showAlertBanner(`🔰 神域イージス展開！無敵${eff.invuln}s＆防御UP`, 1400);
            return;
        }

        if (sk.type === 'ATK_BUFF') {
            this.player.warcryTimer = eff.duration;
            this.player.warcryBonus = 1 + eff.atkBonus;
            this.player.skillAnimType = 'cast_up';
            this.player.skillAnimDur = 0.35;
            this.player.skillAnimTimer = 0.35;
            this.spawnRingEffect(pPos, 0xf97316, 4.2);
            this.showAlertBanner(`🔥 覇王の咆哮！攻撃力 +${Math.round(eff.atkBonus * 100)}%`, 1400);
            return;
        }

        const target = this.getValidTarget();
        if (target && !target.dead) {
            const dx = target.pos.x - pPos.x;
            const dz = target.pos.z - pPos.z;
            if (dx * dx + dz * dz > 0.01) this.player.rotY = Math.atan2(dx, dz);
        }

        if (sk.radius) {
            const center = (sk.type === 'AOE_DMG' && sk.id === 'spin_whirl') ? pPos : (target ? target.pos : pPos);
            this.player.skillAnimType = sk.id === 'spin_whirl' ? 'spin_whirl' : 'slam_ground';
            this.player.skillAnimDur = 0.4;
            this.player.skillAnimTimer = 0.4;
            this.camShake = Math.max(this.camShake, 0.25);

            const efColor = sk.type === 'AOE_SLOW' ? 0x38bdf8 : (sk.type === 'AOE_BURN' ? 0xf97316 : 0xc084fc);
            this.spawnRingEffect(center, efColor, sk.radius);
            this.spawnDomeEffect(center, efColor, sk.radius * 0.65);

            this.monsters.forEach(m => {
                if (m.dead) return;
                if (m.pos.distanceTo(center) <= sk.radius) {
                    const crit = Math.random() < st.critChance;
                    this.damageMonster(m, basePower * (crit ? st.critDmg : 1), crit);
                    if (sk.type === 'AOE_SLOW') {
                        m.slowTimer = eff.slowDur;
                        m.slowFactor = eff.slowFactor;
                    }
                    if (sk.type === 'AOE_BURN') {
                        m.burnTimer = 4.0;
                        m.burnDps = basePower * 0.35;
                    }
                }
            });
        } else if (target && !target.dead) {
            this.player.skillAnimType = 'jump_slash';
            this.player.skillAnimDur = 0.35;
            this.player.skillAnimTimer = 0.35;
            const crit = Math.random() < st.critChance;
            const finalDmg = basePower * (crit ? st.critDmg : 1);
            this.damageMonster(target, finalDmg, crit);

            const c = sk.type === 'THUNDER' ? 0xfde047 : (sk.type === 'DRAIN' ? 0xf43f5e : 0x38bdf8);
            this.spawnDomeEffect(target.pos, c, 2.8);
            this.spawnSparkleBurst(target.pos, c, 10);

            if (sk.type === 'DRAIN') {
                const heal = Math.round(finalDmg * eff.drainRate);
                this.player.hp = Math.min(st.maxHp, this.player.hp + heal);
                this.spawnFloatText(pPos.clone().add(new THREE.Vector3(0, 2.3, 0)), `+${formatBigNum(heal)}`, '#34d399', 14);
            }
            if (sk.type === 'INTERRUPT') {
                target.stunTimer = Math.max(target.stunTimer, eff.stunDur);
                if (target.casting) {
                    target.casting = null;
                    document.getElementById('boss-cast-box')?.classList.add('hidden');
                    this.showAlertBanner(`⚡ ${target.name}の大技詠唱を中断した！`, 1600);
                }
            }
        }
    },

    spawnPlayerAttackEffect(pos, colorHex = 0x38bdf8, crit = false) {
        this.spawnSparkleBurst(pos, colorHex, crit ? 9 : 4);
        if (crit) this.spawnRingEffect(pos, 0xfde047, 2.4);
    },

    spawnEnemyAttackEffect(fromPos, toPos, colorHex = 0xef4444, isBoss = false) {
        this.spawnSparkleBurst(toPos, colorHex, isBoss ? 8 : 4);
    },

    spawnRingEffect(pos, colorHex, radius = 4.0) {
        if (!this.useWebGL || !this.scene) return;
        const mesh = new THREE.Mesh(
            new THREE.RingGeometry(radius * 0.45, radius, 28),
            new THREE.MeshBasicMaterial({ color: colorHex, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
        );
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(pos.x, 0.18, pos.z);
        this.scene.add(mesh);
        this.effects.push({ mesh, kind: 'expand', life: 0.42, maxLife: 0.42 });
    },

    spawnDomeEffect(pos, colorHex, radius = 3.0) {
        if (!this.useWebGL || !this.scene) return;
        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(radius, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2),
            new THREE.MeshBasicMaterial({ color: colorHex, wireframe: true, transparent: true, opacity: 0.8 })
        );
        mesh.position.set(pos.x, 0.1, pos.z);
        this.scene.add(mesh);
        this.effects.push({ mesh, kind: 'expand', life: 0.45, maxLife: 0.45 });
    },

    spawnProjectileBeam(startPos, rotY, colorHex) {
        if (!this.useWebGL || !this.scene) return;
        const mesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.28, 0.28, 10, 10),
            new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.9 })
        );
        mesh.rotation.x = Math.PI / 2;
        mesh.rotation.z = -rotY;
        mesh.position.set(startPos.x + Math.sin(rotY) * 5, 1.2, startPos.z + Math.cos(rotY) * 5);
        this.scene.add(mesh);
        this.effects.push({ mesh, kind: 'expand', life: 0.45, maxLife: 0.45 });
    },

    spawnSparkleBurst(pos, colorHex, count = 6) {
        if (!this.useWebGL || !this.scene) return;
        for (let i = 0; i < count; i++) {
            const mesh = new THREE.Mesh(
                new THREE.OctahedronGeometry(0.18, 0),
                new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.95 })
            );
            mesh.position.set(pos.x + (Math.random() - 0.5) * 1.4, 0.8 + Math.random() * 1.2, pos.z + (Math.random() - 0.5) * 1.4);
            this.scene.add(mesh);
            this.effects.push({ mesh, kind: 'rise', life: 0.48, maxLife: 0.48 });
        }
    }
});
