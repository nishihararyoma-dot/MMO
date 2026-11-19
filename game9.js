'use strict';

if (typeof KaomojiMMORPG !== 'undefined') {
    const P = KaomojiMMORPG.prototype;

    // ---------------------------------------------------------------------
    // 1. セーブデータ構造の双方向同期（skills <-> skillLevels 等）
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
    // 2. ステータス計算（修正版 v39）
    //    ・game1 の calcDerivedStats は進化倍率を「適用済み」なので、ここで再度掛けない
    //    ・返るキーは physAtk/magAtk/basicAtkPower/maxHp/moveSpeed/defMitigation 等
    //      （atk / def / spd というキーは存在しない）
    //    ・game6 が getPlayerStats の包み込みで入れるつもりだった
    //      「ペット装備％」「極光の聖域バフ」は、getPlayerStats が元々存在せず一度も動いていなかった
    //      → 実際に戦闘が使う calcDerivedStats の中で適用する
    // ---------------------------------------------------------------------
    const _origCalcDerivedStats = P.calcDerivedStats;

    P.getPetEquipPctV39 = function () {
        const now = (typeof performance !== 'undefined') ? performance.now() : Date.now();
        const c = this._petEqCacheV39;
        if (c && now - c.t < 250) return c.v;
        let v = null;
        try {
            const info = this.getMyPetSyncInfo?.();
            if (info && info.equipId && info.equipId !== 'none') {
                const eq = this.getPetEquipDef?.(info.equipId);
                if (eq && eq.id !== 'none') v = eq;
            }
        } catch (e) { v = null; }
        this._petEqCacheV39 = { t: now, v };
        return v;
    };

    P.calcDerivedStats = function () {
        this.syncSaveDataCompatV38();
        const st = _origCalcDerivedStats ? _origCalcDerivedStats.call(this) : null;
        if (!st) return st;

        const scaleAtk = (m) => {
            if (typeof st.physAtk === 'number') st.physAtk = Math.floor(st.physAtk * m);
            if (typeof st.magAtk === 'number') st.magAtk = Math.floor(st.magAtk * m);
            if (typeof st.basicAtkPower === 'number') st.basicAtkPower = Math.floor(st.basicAtkPower * m);
        };

        // ペット装備ボーナス（game6 の PET_EQUIPS の atk/def/hp/spd ％）
        const eq = this.getPetEquipPctV39();
        if (eq) {
            if (eq.atkPct) scaleAtk(1 + eq.atkPct);
            if (eq.hpPct && typeof st.maxHp === 'number') st.maxHp = Math.floor(st.maxHp * (1 + eq.hpPct));
            if (eq.defPct && typeof st.defMitigation === 'number') st.defMitigation = Math.min(0.82, st.defMitigation * (1 + eq.defPct));
            if (eq.spdPct && typeof st.moveSpeed === 'number') st.moveSpeed = Math.min(17, st.moveSpeed * (1 + eq.spdPct));
        }

        // 極光の聖域バフ（game6 の updateSanctuaryFields が _inSanctuaryBuff を立てる）
        if (this._inSanctuaryBuff) {
            const mult = 1.15 + Math.min(0.35, (this._sanctuaryBuffLv || 1) * 0.03);
            scaleAtk(mult);
            if (typeof st.defMitigation === 'number') st.defMitigation = Math.min(0.82, st.defMitigation * mult);
            if (typeof st.moveSpeed === 'number') st.moveSpeed = Math.min(17, st.moveSpeed * 1.15);
        }
        return st;
    };

    // getPlayerStats は game7/8 が参照する互換用。別名キー(atk/spd/crit)を足して返す。
    P.getPlayerStats = function () {
        const st = this.calcDerivedStats();
        if (!st) return st;
        return Object.assign({}, st, {
            atk: st.basicAtkPower,
            spd: st.moveSpeed,
            crit: st.critChance
        });
    };

    // ---------------------------------------------------------------------
    // 3. スキル使用の統合（修正版）
    //    ・クールダウンの実体は this.skillCooldowns（game3 が毎フレーム減算）
    //    ・game6/7/8 は player.skillCds を見るので、同じ配列を指す「別名」にする
    //    ・Lv追加ダメージは game7、状態異常は game8 が既に付与しているのでここでは足さない
    //    ・包んだ層が握りつぶしていた戻り値(true/false)をここで復元する
    // ---------------------------------------------------------------------
    P.aliasSkillCooldownsV39 = function () {
        if (!Array.isArray(this.skillCooldowns)) this.skillCooldowns = [0, 0, 0, 0, 0];
        if (this.player && this.player.skillCds !== this.skillCooldowns) {
            this.player.skillCds = this.skillCooldowns;
        }
        this.skillCds = this.skillCooldowns;
    };

    const _origUseSkillSlot = P.useSkillSlot;

    P.useSkillSlot = function (slotIdx) {
        if (this._uiEditModeV31) return false;
        if (!this.player || this.isDead || !this.saveData) return false;
        this.syncSaveDataCompatV38();
        this.aliasSkillCooldownsV39();
        this.maintainInfiniteResources?.();
        this.syncSkillMpCostsV22?.();

        // 内側の層（演出・追加ダメージ・状態異常）を失敗時に動かさないための事前チェック
        // （game3 の useSkillSlot 冒頭と同じ条件）
        const skillId = (this.saveData.equippedSkills || [])[slotIdx];
        if (typeof SKILLS === 'undefined' || !skillId || !SKILLS[skillId]) return false;
        if ((this.player.stunTimer || 0) > 0) return _origUseSkillSlot ? !!_origUseSkillSlot.call(this, slotIdx) : false;
        if ((this.skillCooldowns[slotIdx] || 0) > 0) return false;
        const sk = SKILLS[skillId];
        if (!sk.isSupport && this.currentZoneId === 'town') {
            this.showAlertBanner?.('🏰 広場では攻撃スキルは使えません', 1000);
            return false;
        }
        const lv = Math.max(1, (this.saveData.skills && this.saveData.skills[skillId]) || 1);
        const mpCost = (typeof getSkillMpCost === 'function') ? getSkillMpCost(sk, lv) : (sk.mpCost || 0);
        if ((this.player.mp || 0) < mpCost) {
            this.showAlertBanner?.(`💧 MPが足りません！（必要MP: ${mpCost}）`, 1000);
            return false;
        }

        if (!_origUseSkillSlot) return false;
        _origUseSkillSlot.call(this, slotIdx);
        this.maintainInfiniteResources?.();

        // 戻り値の復元：クールダウンが入っていれば発動成功
        return (this.skillCooldowns[slotIdx] || 0) > 0.1;
    };

    // useSkill という名前で呼ぶ外部コード向けの互換エイリアス
    P.useSkill = function (slotIdx) { return this.useSkillSlot(slotIdx); };

    // ---------------------------------------------------------------------
    // 3.5 未実装だった呼び出し先の補完（v39）
    // ---------------------------------------------------------------------
    // 標的ボタン(btn-cycle-target)・Tabキーが呼ぶ cycleTarget が存在しなかった。
    // 近い順に生存中の敵を並べ、いまの標的の「次」へ切り替える。
    if (typeof P.cycleTarget !== 'function') {
        P.cycleTarget = function () {
            if (!this.player || !this.player.pos || !Array.isArray(this.monsters)) return null;
            if (this.currentZoneId === 'town') return null;
            const px = this.player.pos.x, pz = this.player.pos.z;
            const list = this.monsters
                .filter(m => m && !m.dead && m.pos)
                .map(m => ({ m, d: Math.hypot(m.pos.x - px, m.pos.z - pz) }))
                .filter(o => o.d <= 40)
                .sort((a, b) => a.d - b.d)
                .map(o => o.m);
            if (!list.length) {
                this.selectedTarget = null;
                this.showAlertBanner?.('🎯 近くに標的がいません', 800);
                return null;
            }
            const idx = list.indexOf(this.selectedTarget);
            const next = list[(idx + 1) % list.length];
            this.selectedTarget = next;
            try { sfx.playTone(620, 'sine', 0.08, 0.06); } catch (e) {}
            return next;
        };
    }

    // game6/7/8 が呼ぶ spawnFloatingText の実体は spawnFloatText（game4）。名前違いで文字が出なかった。
    if (typeof P.spawnFloatingText !== 'function' && typeof P.spawnFloatText === 'function') {
        P.spawnFloatingText = function (pos, text, color, size) {
            const p = (pos && typeof pos.clone === 'function') ? pos.clone() : pos;
            if (p && typeof p.y === 'number') p.y += 1.6;
            return this.spawnFloatText(p, text, color || '#ffffff', size || 14);
        };
    }

    // ---------------------------------------------------------------------
    // 5. メインループでのリモートプレイヤー更新保証（極光の聖域は updateRemotePlayers 内の updateSanctuaryFields が処理）
    // ---------------------------------------------------------------------
    if (P.loop) {
        const _origLoop = P.loop;
        P.loop = function (now) {
            if (!this._lastRemoteSyncTsV38) this._lastRemoteSyncTsV38 = now;
            const rdt = Math.min(0.1, Math.max(0.001, (now - this._lastRemoteSyncTsV38) / 1000));
            this._lastRemoteSyncTsV38 = now;

            this.aliasSkillCooldownsV39?.();
            if (typeof this.updateRemotePlayers === 'function') {
                try { this.updateRemotePlayers(rdt); } catch (e) { if (!this._warnRemoteV39) { this._warnRemoteV39 = 1; console.warn('updateRemotePlayers:', e); } }
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
        add('btn_target', '🎯 標的', document.getElementById('btn-cycle-target') || document.getElementById('btn-target') || document.getElementById('btn-target-switch'));

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
        window.game.syncSkillDescriptionsAndEffects?.();
        window.game.syncSkillMpCostsV22?.();
        window.game.syncSkillSlotButtonsUI?.();
        window.game.refreshAllHUD?.();
    }, 300);
});
// === GAME9_BRIDGE_OK (v39: skill chain unified) ===
