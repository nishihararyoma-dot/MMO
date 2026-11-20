// ▼▼▼ ここから game7.js ▼▼▼
(() => {
  'use strict';

  // グローバル定数の安全共有（重複宣言SyntaxErrorを完全防止）
  window.MAX_LEVEL_CAP_V27 = 999;
  window.MAX_THREAT_CAP_V27 = 999;
  window.SECRET_DEBUG_CODE = 'debug777';

  if (typeof KaomojiMMORPG === 'undefined') {
    console.warn('[game7] KaomojiMMORPG がまだ読み込まれていません。scriptの読み込み順を確認してください。');
    return;
  }

  Object.assign(KaomojiMMORPG.prototype, {
    // 1. スキル命中時の属性状態異常付与（game6の3D状態異常エフェクトと完全連動）
    applyElementalStatusToMonstersV7(skillCategory = 'slash', skillLv = 1) {
      if (!this.player?.pos || !Array.isArray(this.monsters)) return;
      const statusMap = {
        fire: { type: 'burn', label: '🔥炎上', color: '#f97316', dur: 4.5 },
        nova_ice: { type: 'freeze', label: '❄️凍結', color: '#38bdf8', dur: 4.0 },
        void: { type: 'poison', label: '☠️猛毒', color: '#c084fc', dur: 5.0 },
        thunder: { type: 'shock', label: '⚡麻痺', color: '#facc15', dur: 3.5 }
      };
      const st = statusMap[skillCategory];
      if (!st) return;

      const range = 5.5 + Math.min(6.0, skillLv * 0.08);
      this.monsters.forEach(m => {
        if (!m || m.dead || !m.pos) return;
        const dist = Math.hypot(m.pos.x - this.player.pos.x, m.pos.z - this.player.pos.z);
        if (dist <= range) {
          m._visualStatus = { type: st.type, timer: st.dur };
          if (st.type === 'burn') m.burnTimer = Math.max(Number(m.burnTimer) || 0, st.dur);
          if (st.type === 'freeze') m.freezeTimer = Math.max(Number(m.freezeTimer) || 0, st.dur);
          if (st.type === 'poison') m.poisonTimer = Math.max(Number(m.poisonTimer) || 0, st.dur);
          if (st.type === 'shock') m.stunTimer = Math.max(Number(m.stunTimer) || 0, st.dur);
          if (this.spawnFloatingText) {
            this.spawnFloatingText(m.pos, st.label, st.color);
          }
        }
      });
    },

    // 2. 状態異常スリップダメージ＆行動遅延処理（炎上・猛毒の継続ダメージ / 凍結・麻痺の減速）
    processMonsterStatusTicksV7(dt) {
      if (!Array.isArray(this.monsters)) return;
      this._statusTickAccumV7 = (this._statusTickAccumV7 || 0) + dt;
      const doDotTick = this._statusTickAccumV7 >= 1.0;
      if (doDotTick) this._statusTickAccumV7 -= 1.0;

      this.monsters.forEach(m => {
        if (!m || m.dead) return;
        const stType = this.detectMonsterStatus ? this.detectMonsterStatus(m) : m._visualStatus?.type;
        if (!stType) return;

        // 凍結・麻痺中は移動速度を大幅低下
        if ((stType === 'freeze' || stType === 'shock') && typeof m.spd === 'number') {
          if (m._origSpdV7 === undefined) m._origSpdV7 = m.spd;
          m.spd = m._origSpdV7 * (stType === 'freeze' ? 0.25 : 0.45);
        } else if (m._origSpdV7 !== undefined) {
          m.spd = m._origSpdV7;
          delete m._origSpdV7;
        }

        // 1秒ごとの炎上・猛毒スリップダメージ
        if (doDotTick && (stType === 'burn' || stType === 'poison')) {
          const maxHp = Math.max(20, Number(m.maxHp || m.hp || 50));
          const pct = stType === 'burn' ? 0.045 : 0.055;
          const dotDmg = Math.max(3, Math.floor(maxHp * pct));
          if (typeof this.applyMagicProjectileHitDamageV40 === 'function') {
            this.applyMagicProjectileHitDamageV40(m, dotDmg);
          } else {
            m.hp = Math.max(0, (Number(m.hp) || 0) - dotDmg);
            if (this.spawnFloatingText && m.pos) {
              this.spawnFloatingText(m.pos, stType === 'burn' ? `🔥${dotDmg}` : `☠️${dotDmg}`, stType === 'burn' ? '#fb923c' : '#c084fc');
            }
          }
        }
      });
    },

    // 3. 実績の自動進行チェック＆コンプリート達成判定
    checkAutoAchievementsV7() {
      const d = this.saveData;
      if (!d || typeof ACHIEVEMENTS === 'undefined' || !ACHIEVEMENTS) return;
      if (!d.achievements || typeof d.achievements !== 'object' || Array.isArray(d.achievements)) {
        d.achievements = {};
      }
      if (!d.statsV7) {
        d.statsV7 = { kills: 0, bossKills: 0, skillsUsed: 0 };
      }

      const lv = Number(d.lv ?? d.level ?? 1);
      const gold = Number(d.gold ?? d.coins ?? 0);
      const threat = Number(d.threatRank ?? d.threat ?? 1);
      const kills = Number(d.kills ?? d.killCount ?? d.statsV7.kills ?? 0);
      const bossKills = Number(d.bossKills ?? d.statsV7.bossKills ?? 0);
      const skillsUsed = Number(d.statsV7.skillsUsed ?? 0);
      const unlockedRolesCount = Array.isArray(d.unlockedRolesV40) ? d.unlockedRolesV40.length : 1;
      const unlockedPetEqCount = Array.isArray(d.unlockedPetEquips) ? d.unlockedPetEquips.length : 1;

      const list = Array.isArray(ACHIEVEMENTS)
        ? ACHIEVEMENTS
        : Object.entries(ACHIEVEMENTS).map(([k, v]) => ({ id: k, ...(typeof v === 'object' ? v : { name: String(v) }) }));

      let newlyUnlocked = 0;
      list.forEach((ach, idx) => {
        const aid = String(ach.id || ach.achId || `ach_${idx}`);
        if (d.achievements[aid] === true || ach.unlocked) return;

        const key = `${aid} ${ach.name || ''} ${ach.desc || ''}`.toLowerCase();
        let met = false;

        if (/lv|レベル/.test(key)) {
          const req = Number((key.match(/(\d+)/) || [])[1]) || 10;
          if (lv >= req) met = true;
        } else if (/gold|ゴールド|金|富豪/.test(key)) {
          const req = Number((key.match(/(\d+)/) || [])[1]) || 1000;
          if (gold >= req) met = true;
        } else if (/boss|ボス|魔王|竜/.test(key)) {
          const req = Number((key.match(/(\d+)/) || [])[1]) || 1;
          if (bossKills >= req) met = true;
        } else if (/kill|討伐|撃破|敵/.test(key)) {
          const req = Number((key.match(/(\d+)/) || [])[1]) || 10;
          if (kills >= req) met = true;
        } else if (/skill|スキル|魔法/.test(key)) {
          const req = Number((key.match(/(\d+)/) || [])[1]) || 5;
          if (skillsUsed >= req) met = true;
        } else if (/job|role|evo|転職|進化/.test(key)) {
          if (unlockedRolesCount >= 2 || String(d.evolutionId || '') !== '') met = true;
        } else if (/pet|ペット/.test(key)) {
          if (unlockedPetEqCount >= 2 || Boolean(d.equippedPet)) met = true;
        } else if (/threat|脅威/.test(key)) {
          const req = Number((key.match(/(\d+)/) || [])[1]) || 5;
          if (threat >= req) met = true;
        } else {
          if (lv >= (idx + 1) * 5 || kills >= (idx + 1) * 8) met = true;
        }

        if (met) {
          d.achievements[aid] = true;
          ach.unlocked = true;
          ach.completed = true;
          newlyUnlocked++;
          this.pushSystemEventLog?.(`🏆 実績解除！「${ach.name || aid}」`, 2000);
        }
      });

      if (newlyUnlocked > 0) {
        this.syncAchievementPassiveBuffsV40?.();
        this.saveGame?.(false);
      }
    },

    // 4. game7 統合フック（属性状態異常・実績報酬倍率・進行チェック）
    installV7Hooks() {
      if (this._v7Installed) return;
      this._v7Installed = true;

      const proto = KaomojiMMORPG.prototype;

      ['useSkill', 'castSkill', 'activateSkill', 'triggerSkill'].forEach(fn => {
        if (typeof proto[fn] === 'function' && !proto[`_v7_${fn}`]) {
          const orig = proto[fn];
          proto[fn] = function (slotOrId, ...rest) {
            const slotIdx = typeof slotOrId === 'number' ? slotOrId : 0;
            const meta = this.resolveSkillMeta ? this.resolveSkillMeta(slotIdx) : null;
            const res = orig.apply(this, [slotOrId, ...rest]);
            if (res !== false) {
              if (this.saveData) {
                if (!this.saveData.statsV7) this.saveData.statsV7 = { kills: 0, bossKills: 0, skillsUsed: 0 };
                this.saveData.statsV7.skillsUsed = (this.saveData.statsV7.skillsUsed || 0) + 1;
              }
              if (meta) {
                this.applyElementalStatusToMonstersV7(meta.skillCategory, meta.skillLv || 1);
              }
              this.checkAutoAchievementsV7();
            }
            return res;
          };
          proto[`_v7_${fn}`] = true;
        }
      });

      ['killMonster', 'onMonsterKilled'].forEach(fn => {
        if (typeof proto[fn] === 'function' && !proto[`_v7_${fn}`]) {
          const orig = proto[fn];
          proto[fn] = function (m, ...rest) {
            const res = orig.apply(this, [m, ...rest]);
            const d = this.saveData;
            if (d) {
              if (!d.statsV7) d.statsV7 = { kills: 0, bossKills: 0, skillsUsed: 0 };
              d.statsV7.kills = (d.statsV7.kills || 0) + 1;
              const isBoss = Boolean(m?.isBoss || m?.boss || (Number(m?.scale) || 1) >= 1.45);
              if (isBoss) d.statsV7.bossKills = (d.statsV7.bossKills || 0) + 1;

              const achSum = this.syncAchievementPassiveBuffsV40?.();
              if (achSum && achSum.rewardBonusPct > 0) {
                const bonusExp = Math.floor((Number(m?.exp || m?.expReward || 10)) * achSum.rewardBonusPct);
                const bonusGold = Math.floor((Number(m?.gold || m?.goldReward || 8)) * achSum.rewardBonusPct);
                if (bonusExp > 0) d.exp = (Number(d.exp) || 0) + bonusExp;
                if (bonusGold > 0) {
                  d.gold = (Number(d.gold) || 0) + bonusGold;
                  if ('coins' in d) d.coins = d.gold;
                }
              }
              this.checkAutoAchievementsV7();
            }
            return res;
          };
          proto[`_v7_${fn}`] = true;
        }
      });

      if (typeof proto.update === 'function' && !proto._v7UpdateWrapped) {
        const origUpdate = proto.update;
        proto.update = function (dt = 0.016, ...rest) {
          const safeDt = Math.min(0.1, Math.max(0.001, Number(dt) || 0.016));
          const res = origUpdate.apply(this, [dt, ...rest]);
          this.processMonsterStatusTicksV7(safeDt);
          return res;
        };
        proto._v7UpdateWrapped = true;
      }
    }
  });

  KaomojiMMORPG.prototype.installV7Hooks();
  setTimeout(() => {
    const inst = window.game || window.app || window.mmorpg;
    if (inst && typeof inst.checkAutoAchievementsV7 === 'function') {
      inst.checkAutoAchievementsV7();
    }
  }, 400);
})();
// ▲▲▲ ここまで game7.js ▲▲▲
