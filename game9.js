'use strict';

if (typeof KaomojiMMORPG !== 'undefined') {
    const P = KaomojiMMORPG.prototype;

    // ---------------------------------------------------------------------
    // 1. セーブデータ構造の双方向同期（skills <-> skillLevels / petEquip 等）
    // ---------------------------------------------------------------------
    P.syncSaveDataCompatV38 = function () {
        const d = this.saveData;
        if (!d || typeof d !== 'object') return;

        if (!d.skills || typeof d.skills !== 'object') d.skills = {};
        if (!d.skillLevels || typeof d.skillLevels !== 'object') d.skillLevels = {};
        if (!d.skillLvs || typeof d.skillLvs !== 'object') d.skillLvs = {};
        if (!Array.isArray(d.equippedSkills)) {
            d.equippedSkills = ['sk_slash', 'sk_fire', 'sk_nova_ice', 'sk_support', 'sk_chabudai'];
        }
        if (!Array.isArray(d.ownedPets)) d.ownedPets = [];
        if (!Array.isArray(d.ownedPetEquips)) d.ownedPetEquips = [];
        if (!d.petEquip || typeof d.petEquip !== 'object') {
            d.petEquip = { head: null, weapon: null, wing: null, aura: null };
        }
        if (!d.petNames || typeof d.petNames !== 'object') d.petNames = {};

        // スキルLvの全形式を統一（最大値を採用）
        const list = (typeof SKILLS !== 'undefined' && SKILLS)
            ? (Array.isArray(SKILLS) ? SKILLS : Object.values(SKILLS))
            : [];
        list.forEach((sk, idx) => {
            if (!sk || !sk.id) return;
            const id = sk.id;
            const slotKey = `slot_${idx}`;
            const cur = Math.max(
                1,
                Number(typeof d.skills[id] === 'number' ? d.skills[id] : d.skills[id]?.lv) || 0,
                Number(d.skillLevels[id]) || 0,
                Number(d.skillLvs[id]) || 0,
                Number(d.skillLevels[slotKey]) || 0,
                Number(d.skillLvs[slotKey]) || 0
            );
            d.skills[id] = cur;
            d.skillLevels[id] = cur;
            d.skillLvs[id] = cur;
            d.skillLevels[slotKey] = cur;
            d.skillLvs[slotKey] = cur;
        });

        // 装備IDの互換同期
        if (d.weapon && !d.equippedWeapon) d.equippedWeapon = d.weapon;
        if (d.equippedWeapon && !d.weapon) d.weapon = d.equippedWeapon;
        if (d.armor && !d.equippedArmor) d.equippedArmor = d.armor;
        if (d.equippedArmor && !d.armor) d.armor = d.equippedArmor;
        if (d.evolution && !d.evolutionId) d.evolutionId = d.evolution;
        if (d.evolutionId && !d.evolution) d.evolution = d.evolutionId;
    };

    // ---------------------------------------------------------------------
    // 2. ステータス計算の統合（calcDerivedStats <-> getPlayerStats）
    // ---------------------------------------------------------------------
    const _origCalcDerivedStats = P.calcDerivedStats;
    const _origGetPlayerStats = P.getPlayerStats;

    P.calcDerivedStats = function () {
        this.syncSaveDataCompatV38();
        const base = _origCalcDerivedStats ? _origCalcDerivedStats.call(this) : {
            maxHp: 100, maxMp: 50, atk: 15, def: 5, spd: 6.5, crit: 0.05
        };

        // 職業・進化倍率の反映
        const evoId = this.saveData?.evolutionId || this.saveData?.evolution || 'novice';
        const evo = (typeof EVOLUTIONS !== 'undefined') ? EVOLUTIONS[evoId] : null;
        if (evo) {
            base.atk = Math.floor(base.atk * (evo.atkMult || 1));
            base.def = Math.floor(base.def * (evo.defMult || 1));
            base.maxHp = Math.floor(base.maxHp * (evo.hpMult || 1));
            base.maxMp = Math.floor(base.maxMp * (evo.mpMult || 1));
        }

        // ペット装備ボーナス＆極光の聖域バフの反映
        if (typeof this.getPetEquipBonus === 'function') {
            const pb = this.getPetEquipBonus();
            if (pb) {
                base.atk += Number(pb.atk) || 0;
                base.def += Number(pb.def) || 0;
                base.maxHp += Number(pb.hp) || 0;
                base.maxMp += Number(pb.mp) || 0;
            }
        }
        if (this._auroraBuffMult && this._auroraBuffMult > 1) {
            base.atk = Math.floor(base.atk * this._auroraBuffMult);
            base.def = Math.floor(base.def * this._auroraBuffMult);
        }
        return base;
    };

    P.getPlayerStats = function () {
        const st = this.calcDerivedStats();
        if (_origGetPlayerStats && _origGetPlayerStats !== P.getPlayerStats) {
            try {
                const extra = _origGetPlayerStats.call(this);
                if (extra && typeof extra === 'object') {
                    return { ...extra, ...st };
                }
            } catch (e) {}
        }
        return st;
    };

    // ---------------------------------------------------------------------
    // 3. スキル使用（useSkill <-> useSkillSlot）＆クールダウン配列の完全統合
    // ---------------------------------------------------------------------
    const _origUseSkill = P.useSkill;
    const _origUseSkillSlot = P.useSkillSlot;

    P.useSkill = function (slotIdx) {
        if (this._uiEditModeV31) return;
        this.syncSaveDataCompatV38();
        this.maintainInfiniteResources?.();
        this.syncSkillMpCostsV22?.();

        if (!Array.isArray(this.skillCooldowns)) this.skillCooldowns = [0, 0, 0, 0, 0];
        if (this.player && !Array.isArray(this.player.skillCds)) {
            this.player.skillCds = [...this.skillCooldowns];
        }

        const meta = this.resolveSkillMeta ? this.resolveSkillMeta(slotIdx) : null;
        const lv = meta ? meta.skillLv : 1;
        const beforeCd = Math.max(this.skillCooldowns[slotIdx] || 0, this.player?.skillCds?.[slotIdx] || 0);

        if (_origUseSkill) {
            _origUseSkill.call(this, slotIdx);
        } else if (_origUseSkillSlot) {
            _origUseSkillSlot.call(this, slotIdx);
        }

        // クールダウン配列を双方向同期
        if (this.player && Array.isArray(this.player.skillCds)) {
            this.player.skillCds[slotIdx] = this.skillCooldowns[slotIdx] || 0;
        }

        // 発動成功時のLvスケーリング追加ダメージ＆状態異常付与
        const afterCd = this.skillCooldowns[slotIdx] || 0;
        if (beforeCd <= 0.05 && afterCd > 0.1 && meta && this.player?.pos && Array.isArray(this.monsters)) {
            const st = this.getPlayerStats();
            const mult = this.calcSkillPowerMultiplierV26 ? this.calcSkillPowerMultiplierV26(lv) : (1 + (lv - 1) * 0.25);
            const bonusDmg = lv >= 2 ? Math.max(12, Math.floor((st.atk || 30) * (mult - 1) * 0.55)) : 0;
            const range = lv >= 100 ? 11.0 : (lv >= 50 ? 8.8 : 7.0);
            const px = this.player.pos.x;
            const pz = this.player.pos.z;

            let stType = null;
            if (meta.skillCategory === 'fire' || meta.skillCategory === 'bigbang') stType = 'burn';
            else if (meta.skillCategory === 'nova_ice') stType = 'freeze';
            else if (meta.skillCategory === 'thunder') stType = 'shock';
            else if (meta.skillCategory === 'void') stType = 'poison';

            this.monsters.forEach(m => {
                if (!m || m.dead || !m.pos) return;
                if (Math.hypot(m.pos.x - px, m.pos.z - pz) <= range) {
                    if (bonusDmg > 0) {
                        if (typeof this.damageMonster === 'function') {
                            this.damageMonster(m, bonusDmg, lv >= 50);
                        } else if (typeof m.hp === 'number') {
                            m.hp = Math.max(0, m.hp - bonusDmg);
                            const tag = lv >= 100 ? `👑奥義 +${bonusDmg}` : `⚡Lv.${lv} +${bonusDmg}`;
                            this.spawnFloatingText?.(m.pos, tag, lv >= 100 ? '#fde047' : '#38bdf8');
                        }
                    }
                    if (stType) {
                        m._visualStatus = { type: stType, timer: 5.5 };
                        if (stType === 'burn') m.burnTimer = Math.max(m.burnTimer || 0, 5.5);
                        if (stType === 'freeze') m.freezeTimer = Math.max(m.freezeTimer || 0, 4.5);
                        if (stType === 'poison') m.poisonTimer = Math.max(m.poisonTimer || 0, 6.0);
                        if (stType === 'shock') m.stun = Math.max(m.stun || 0, 3.5);
                    }
                }
            });
        }
        this.maintainInfiniteResources?.();
    };

    P.useSkillSlot = function (slotIdx) {
        this.useSkill(slotIdx);
    };

    // ---------------------------------------------------------------------
    // 4. 自分のペット3D参照の統一（this.pet <-> this.petEntity）
    // ---------------------------------------------------------------------
    if (P.rebuildPetEntity) {
        const _origRebuildPet = P.rebuildPetEntity;
        P.rebuildPetEntity = function () {
            _origRebuildPet.call(this);
            this.pet = this.petEntity || this.pet;
            if (this.petEntity && typeof this.applyPetEquipment3D === 'function') {
                this.applyPetEquipment3D(this.petEntity, this.saveData?.petEquip);
            }
        };
    }

    // ---------------------------------------------------------------------
    // 5. メインループでのリモートプレイヤー・聖域・ペット更新保証
    // ---------------------------------------------------------------------
    if (P.loop) {
        const _origLoop = P.loop;
        P.loop = function (now) {
            if (!this._lastRemoteSyncTsV38) this._lastRemoteSyncTsV38 = now;
            const rdt = Math.min(0.1, Math.max(0.001, (now - this._lastRemoteSyncTsV38) / 1000));
            this._lastRemoteSyncTsV38 = now;

            if (typeof this.updateRemotePlayers === 'function') {
                try { this.updateRemotePlayers(rdt); } catch (e) {}
            }
            if (typeof this.updateAuroraSanctuaries === 'function') {
                try { this.updateAuroraSanctuaries(rdt); } catch (e) {}
            }
            _origLoop.call(this, now);
        };
    }

    // ---------------------------------------------------------------------
    // 6. モーダル描画の完全統合（#modal-body 統一＆全拡張UI共存）
    // ---------------------------------------------------------------------
    const _origRenderGrowthTab = P.renderGrowthTabContent;
    const _origRenderModal = P.renderModalContent;

    P.renderGrowthTabContent = function () {
        this.syncSaveDataCompatV38();
        const body = document.getElementById('modal-body');
        if (!body) return;

        // game5.js が #modal-body-content を探す場合のための一時エイリアス確保
        if (!document.getElementById('modal-body-content')) {
            body.id = 'modal-body-content';
            try {
                if (_origRenderGrowthTab) _origRenderGrowthTab.call(this);
            } finally {
                body.id = 'modal-body';
            }
        } else if (_origRenderGrowthTab) {
            _origRenderGrowthTab.call(this);
        }

        // game6.js / game7.js の拡張UI（ペット装備・名前変更・通信診断・スキル解説）を安全に追記
        if (_origRenderModal && _origRenderModal !== P.renderGrowthTabContent && _origRenderModal !== P.renderModalContent) {
            try { _origRenderModal.call(this); } catch (e) {}
        }

        this.purgeRebirthUIV27?.();
        this.enhanceSkillSlotVisibilityV35?.();
    };

    P.renderModalContent = function () {
        this.renderGrowthTabContent();
    };

    // ---------------------------------------------------------------------
    // 7. index.html のボタンIDと game8.js のカスタマイズ／Lvバッジを完全一致させる
    // ---------------------------------------------------------------------
    P.discoverCustomizableControlsV31 = function () {
        const items = [];
        const used = new Set();
        const add = (key, label, el) => {
            if (!el || used.has(el)) return;
            const cs = window.getComputedStyle(el);
            if (cs.display === 'none' || cs.visibility === 'hidden') return;
            used.add(el);
            el.dataset.v31ControlKey = key;
            el.dataset.v31ControlLabel = label;
            items.push({ key, label, el });
        };

        add('move_stick', '🕹️ 移動', document.getElementById('kmj-v33-movepad'));
        add('btn_attack', '⚔️ 攻撃', document.getElementById('btn-attack') || document.getElementById('btn-basic-attack'));
        add('btn_taunt', '💢 挑発', document.getElementById('kmj-btn-taunt-v26'));
        add('btn_target', '🎯 標的', document.getElementById('btn-target') || document.getElementById('btn-target-switch'));

        for (let i = 0; i < 5; i++) {
            const slotEl = document.getElementById(`btn-skill-${i}`) || document.getElementById(`skill-slot-${i}`);
            add(`skill_${i}`, `枠${i + 1}`, slotEl);
        }
        return items;
    };

    P.syncSkillSlotButtonsUI = function () {
        for (let i = 0; i < 5; i++) {
            const btn = document.getElementById(`btn-skill-${i}`) || document.getElementById(`skill-slot-${i}`);
            if (!btn) continue;
            const meta = this.resolveSkillMeta ? this.resolveSkillMeta(i) : null;
            if (!meta) continue;

            const lv = meta.skillLv || 1;
            let badge = btn.querySelector('.v26-skill-lv-badge');
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'v26-skill-lv-badge';
                badge.style.cssText = 'display:block;font-size:8px;font-weight:900;color:#fde047;line-height:1.05;margin-top:1px;text-shadow:0 1px 2px #000;pointer-events:none;';
                btn.appendChild(badge);
            }

            const skObj = (typeof SKILLS !== 'undefined') ? SKILLS[meta.skillId] : null;
            const curMp = (skObj && typeof skObj.mpCost === 'number') ? ` MP${skObj.mpCost}` : '';
            const rankTag = lv >= 100 ? '👑' : (lv >= 50 ? '🔥' : (lv >= 10 ? '✨' : ''));
            badge.textContent = `${rankTag}Lv.${lv}${curMp}`;
        }
    };
}

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (!window.game) return;
        window.game.syncSaveDataCompatV38?.();
        window.game.rebuildPetEntity?.();
        window.game.syncSkillDescriptionsAndEffects?.();
        window.game.syncSkillMpCostsV22?.();
        window.game.syncSkillSlotButtonsUI?.();
        window.game.refreshAllHUD?.();
    }, 300);
});
// === GAME9_BRIDGE_OK ===
