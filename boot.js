// boot.js — index.html の game9.js の「後」に読み込むこと
//   <script src="boot.js?v=2"></script>
//
// 1) ゲーム本体(KaomojiMMORPG)をページ読み込み時に必ず1回だけ生成する。
//    → 無いと inTitleScreen が true のまま update() が早期returnして何も動かない。
// 2) 通常攻撃のエフェクトを接続する。
//    → game6 のフックは basicAttack/playerAttack 等の「存在しない名前」を狙っていたため
//      未接続だった。実際の関数名 performBasicAttack に接続し直す。
// 3) スキル進化エフェクトを接続する。
//    → game9 は saveData.skills を「スキルオブジェクトの配列」と仮定していたが、
//      実際は { スキルID: レベル } の連想配列。さらに useSkillSlot(スロット番号) の
//      番号からスキルを引けず、進化エフェクトが一度も発動していなかった。
// 4) 重なっているUIを空いている上下中央へ逃がす。
(function () {
  'use strict';

  // ---------- 1. 起動 ----------
  function boot() {
    if (window.game || window.__kmjInstance) return;
    try {
      const g = new KaomojiMMORPG();
      window.game = g;
      window.__kmjInstance = g;
    } catch (e) {
      console.error('[boot] 起動エラー', e);
      const el = document.getElementById('title-save-info');
      if (el) el.textContent = '⚠️ 起動エラー: ' + (e && e.message ? e.message : e);
    }
  }

  // ---------- 2・3. 戦闘エフェクトの接続 ----------
  function installCombatFx() {
    if (typeof KaomojiMMORPG === 'undefined') return;
    const P = KaomojiMMORPG.prototype;
    if (P._bootCombatFxInstalled) return;
    P._bootCombatFxInstalled = true;

    // スキルLv → 進化段階: Lv1=通常 / Lv10=【真】 / Lv50=【極】 / Lv100=【神】
    // （game7 のデバッグ表記と同じ。game9 内部は 3/7/12 を境にするので換算して渡す）
    const tierOf = (lv) => (lv >= 100 ? 3 : lv >= 50 ? 2 : lv >= 10 ? 1 : 0);
    const GAME9_LV = [1, 3, 7, 12];
    // 名前の正規表現に合わず汎用の「剣」に落ちてしまう3スキルへ、専用属性を割り当てる
    const ATTR_BY_SKILL = { vamp_drain: 'dark', void_blade: 'dark', genesis_nova: 'star' };

    // --- 通常攻撃 ---
    const origBasic = P.performBasicAttack;
    if (typeof origBasic === 'function') {
      P.performBasicAttack = function (...args) {
        const p = this.player;
        if (!p || this.isDead || p.stunTimer > 0) return origBasic.apply(this, args);

        let isStaff = false;
        try {
          isStaff = typeof window.isStaffClassEntityV7 === 'function' && window.isStaffClassEntityV7(this, p);
        } catch (e) { console.error('[boot] 杖判定エラー', e); }

        let res;
        if (isStaff) {
          // 杖: ダメージは魔法弾が命中した時に与える（game7）。二重ダメージ防止のため
          // 元のダメージ処理は呼ばず、向き・クールダウン・モーションだけ整える。
          const st = this.calcDerivedStats();
          const target = this.getNearestMonster?.(6.2) || this.getValidTarget?.();
          if (target && !target.dead && target.pos) {
            const dx = target.pos.x - p.pos.x, dz = target.pos.z - p.pos.z;
            if (dx * dx + dz * dz > 0.01) p.rotY = Math.atan2(dx, dz);
          }
          p.skillAnimType = 'basic_slash';
          p.skillAnimDur = 0.24;
          p.skillAnimTimer = 0.24;
          this.autoAtkTimer = Math.max(0.42, 0.95 * (1 - (st.cdReduction || 0) * 0.6));
        } else {
          res = origBasic.apply(this, args); // 剣: ダメージは元処理、見た目は game8 の3連横振り
        }

        try {
          this.triggerAttackVisual?.(p, false, isStaff ? { isMage: true } : null);
          this.broadcastPlayerPacket?.('attack', { isSkill: false, skillInfo: isStaff ? { isMage: true } : undefined });
        } catch (e) { console.error('[boot] 通常攻撃エフェクトエラー', e); }
        return res;
      };
    }

    // --- スキル ---
    const origSlot = P.useSkillSlot;
    if (typeof origSlot === 'function') {
      P.useSkillSlot = function (slotIdx, ...rest) {
        const p = this.player;
        const cdOf = () => Math.max(p?.skillCds?.[slotIdx] || 0, p?.skillCooldowns?.[slotIdx] || 0);
        const cdBefore = cdOf();

        const res = origSlot.call(this, slotIdx, ...rest);

        try {
          const d = this.saveData;
          const skId = d?.equippedSkills?.[slotIdx];
          const sk = skId && typeof SKILLS !== 'undefined' ? SKILLS[skId] : null;
          const fx = window.KMJ_SKILL_FX_V9;
          // クールダウンが新しく入った＝発動に成功した
          if (sk && p && fx?.triggerCustomSkillEffect && cdOf() > cdBefore + 0.05) {
            const lv = Number(d.skills?.[skId]) || 1;
            const skillObj = { id: skId, name: sk.name, baseName: sk.name, lv: GAME9_LV[tierOf(lv)] };
            const target = this.getValidTarget?.();
            const tPos = (target && !target.dead && target.pos)
              ? target.pos
              : { x: p.pos.x + Math.sin(p.rotY || 0) * 4.5, z: p.pos.z + Math.cos(p.rotY || 0) * 4.5 };
            // 属性の上書き（プレイヤーがスタジオで設定済みの場合はそちらを優先し、保存データは汚さない）
            let tmpKey = null;
            const forced = ATTR_BY_SKILL[skId];
            if (forced) {
              if (!d.customSkillFxV9 || typeof d.customSkillFxV9 !== 'object') d.customSkillFxV9 = {};
              if (!d.customSkillFxV9[skId]) { d.customSkillFxV9[skId] = { attrId: forced }; tmpKey = skId; }
            }
            try {
              fx.triggerCustomSkillEffect(this, p, tPos, skillObj);
            } finally {
              if (tmpKey) delete d.customSkillFxV9[tmpKey];
            }
            this.broadcastPlayerPacket?.('attack', { isSkill: true, skillInfo: { id: skId, name: sk.name } });
          }
        } catch (e) { console.error('[boot] スキル進化エフェクトエラー', e); }
        return res;
      };
    }
  }

  installCombatFx();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // ---------- 4. UIの重なり解消 ----------
  const st = document.createElement('style');
  st.id = 'kmj-boot-ui-fix';
  st.textContent = `
    #kmj-v8-threat-bar {
      top: 8px !important; left: 50% !important; right: auto !important;
      transform: translateX(-50%) !important;
    }
    #kmj-v45-online-pill, .kmj-v45-online-pill {
      top: 44px !important; right: auto !important; left: 50% !important;
      transform: translateX(-50%) !important;
    }
    #kmj-v7-debug-hud {
      top: auto !important; right: auto !important;
      bottom: 8px !important; left: 50% !important;
      transform: translateX(-50%) !important;
    }
    #kmj-v9-studio-open-btn {
      right: auto !important; left: 50% !important; bottom: 44px !important;
      transform: translateX(-50%) !important;
    }
  `;
  (document.head || document.documentElement).appendChild(st);
})();
