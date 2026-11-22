// boot.js — index.html の game9.js の「後」に読み込むこと
//   <script src="boot.js?v=3"></script>
//
// 1) ゲーム本体(KaomojiMMORPG)をページ読み込み時に必ず1回だけ生成する。
// 2) 通常攻撃のエフェクトを接続する（performBasicAttack）。
// 3) スキルスタジオの「進化エフェクト」を、実際に使うスキルに接続する。
// 4) スキルスタジオにあって本体に無かった属性スキル7種を、実スキルとして登録する。
// 5) 魔法進化スタジオを、実スキルの一覧・保存に作り直す。
// 6) 重なっているUIを空いている上下中央へ逃がす。
(function () {
  'use strict';

  // ---------- 共通: 進化段階・属性の対応 ----------
  // スキルLv → 進化段階: Lv1=通常 / Lv10=【真】 / Lv50=【極】 / Lv100=【神】
  const tierOf = (lv) => (lv >= 100 ? 3 : lv >= 50 ? 2 : lv >= 10 ? 1 : 0);
  const GAME9_LV = [1, 3, 7, 12]; // game9 内部は 3/7/12 を境にするので換算して渡す

  // 名前の判定に合わず汎用の「剣」に落ちてしまうスキルへ、専用属性を割り当てる
  const ATTR_BY_SKILL = {
    vamp_drain: 'dark', void_blade: 'dark', genesis_nova: 'star',
    fx_fire_pillar: 'fire_pillar', fx_fire_burst: 'fire_burst', fx_water: 'water',
    fx_poison: 'poison', fx_dark: 'dark', fx_star: 'star', fx_sword: 'sword'
  };

  // スキルスタジオにあるのに本体(SKILLS)に無かった属性スキル。性能は本体のバランスに合わせた初期値。
  const STUDIO_SKILLS = [
    { id: 'fx_fire_pillar', icon: '🔥', name: '螺旋炎柱',     type: 'AOE_BURN',   baseMp: 26, cd: 6.8, baseMult: 3.2, radius: 6.4, desc: '螺旋状の炎柱で広範囲を焼き、継続炎上ダメージを与える' },
    { id: 'fx_fire_burst', icon: '🎇', name: '爆炎連弾',     type: 'AOE_DMG',    baseMp: 20, cd: 4.6, baseMult: 2.6, radius: 5.4, desc: '連装火球を撃ち込み、着弾点を爆破する' },
    { id: 'fx_water',      icon: '🌊', name: '大渦潮',       type: 'AOE_SLOW',   baseMp: 22, cd: 6.2, baseMult: 2.4, radius: 6.6, desc: '巨大な渦潮の水柱で攻撃し、移動速度を下げる' },
    { id: 'fx_poison',     icon: '☠️', name: '魔界瘴気',     type: 'AOE_BURN',   baseMp: 24, cd: 7.0, baseMult: 3.0, radius: 6.6, desc: '瘴気を広げ、継続ダメージを与える' },
    { id: 'fx_dark',       icon: '🌑', name: '黒蝕ブラックホール', type: 'AOE_DMG', baseMp: 36, cd: 8.2, baseMult: 4.2, radius: 8.0, desc: '黒い穹を呼び出し、周囲を飲み込む' },
    { id: 'fx_star',       icon: '🌠', name: '銀河流星',     type: 'AOE_DMG',    baseMp: 34, cd: 7.8, baseMult: 4.0, radius: 7.8, desc: '銀河の流星群を降らせる' },
    { id: 'fx_sword',      icon: '🗡️', name: '無限光剣陣',   type: 'SINGLE_DMG', baseMp: 28, cd: 4.8, baseMult: 4.0, desc: '無数の光剣を展開して単体を貫く' }
  ];

  function registerStudioSkills() {
    if (typeof SKILLS === 'undefined' || !SKILLS || Array.isArray(SKILLS)) return;
    STUDIO_SKILLS.forEach((s) => { if (!SKILLS[s.id]) SKILLS[s.id] = Object.assign({}, s); });
  }

  // スキルID → game9 に渡すスキルオブジェクト（レベルから進化段階を換算）
  function buildFxSkill(d, skId) {
    const sk = SKILLS[skId];
    const lv = Number(d?.skills?.[skId]) || 1;
    return { id: skId, name: sk.name, baseName: sk.name, lv: GAME9_LV[tierOf(lv)] };
  }

  // 属性の上書き（スタジオで設定済みならそちらを優先し、保存データは汚さない）
  function withDefaultAttr(d, skId, fn) {
    let tmpKey = null;
    const forced = ATTR_BY_SKILL[skId];
    if (forced && d) {
      if (!d.customSkillFxV9 || typeof d.customSkillFxV9 !== 'object') d.customSkillFxV9 = {};
      if (!d.customSkillFxV9[skId]) { d.customSkillFxV9[skId] = { attrId: forced }; tmpKey = skId; }
    }
    try { return fn(); } finally { if (tmpKey) delete d.customSkillFxV9[tmpKey]; }
  }

  function aimPos(g) {
    const p = g.player;
    const target = g.getValidTarget?.();
    return (target && !target.dead && target.pos)
      ? target.pos
      : { x: p.pos.x + Math.sin(p.rotY || 0) * 4.5, z: p.pos.z + Math.cos(p.rotY || 0) * 4.5 };
  }

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
    rewireStudioButton();
  }

  // ---------- 2・3. 戦闘エフェクトの接続 ----------
  function installCombatFx() {
    if (typeof KaomojiMMORPG === 'undefined') return;
    const P = KaomojiMMORPG.prototype;
    if (P._bootCombatFxInstalled) return;
    P._bootCombatFxInstalled = true;

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
          const fx = window.KMJ_SKILL_FX_V9;
          // クールダウンが新しく入った＝発動に成功した
          if (skId && SKILLS[skId] && p && fx?.triggerCustomSkillEffect && cdOf() > cdBefore + 0.05) {
            const skillObj = buildFxSkill(d, skId);
            withDefaultAttr(d, skId, () => fx.triggerCustomSkillEffect(this, p, aimPos(this), skillObj));
            this.broadcastPlayerPacket?.('attack', { isSkill: true, skillInfo: { id: skId, name: SKILLS[skId].name } });
          }
        } catch (e) { console.error('[boot] スキル進化エフェクトエラー', e); }
        return res;
      };
    }
  }

  // ---------- 5. 魔法進化スタジオ（実スキル版） ----------
  function openRealStudio() {
    const g = window.game;
    const fx = window.KMJ_SKILL_FX_V9;
    if (!g?.saveData || !fx?.ATTRIBUTES) return;
    const d = g.saveData;
    if (!d.customSkillFxV9 || typeof d.customSkillFxV9 !== 'object') d.customSkillFxV9 = {};
    document.getElementById('kmj-boot-studio')?.remove();

    const attrOptions = fx.ATTRIBUTES.map(a => `<option value="${a.id}">${a.label}</option>`).join('');
    const modal = document.createElement('div');
    modal.id = 'kmj-boot-studio';
    modal.style.cssText = 'position:fixed;inset:0;z-index:9990;background:rgba(2,6,23,.86);display:flex;align-items:center;justify-content:center;padding:10px;';
    modal.innerHTML = `
      <div style="width:100%;max-width:560px;max-height:90vh;overflow-y:auto;background:linear-gradient(160deg,#0f172a,#1e1b4b);border:2px solid #f472b6;border-radius:14px;padding:13px;color:#f8fafc;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <b style="font-size:15px;color:#fde047;">✨ 魔法進化スタジオ（実スキル）</b>
          <button type="button" id="kmj-boot-studio-close" style="background:#334155;color:#fff;border:none;border-radius:8px;padding:4px 10px;font-weight:800;">✕</button>
        </div>
        <div style="font-size:11px;color:#cbd5e1;margin-bottom:8px;">
          実際に使うスキルの属性エフェクトと進化段階を選べます。段階を「自動」にすると、スキルLv（10/50/100）で通常→真→極→神に進化します。
        </div>
        <div id="kmj-boot-studio-list" style="display:flex;flex-direction:column;gap:8px;"></div>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelector('#kmj-boot-studio-close').onclick = () => modal.remove();
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

    const list = modal.querySelector('#kmj-boot-studio-list');
    const selStyle = 'background:#1e293b;color:#fff;border:1px solid #475569;border-radius:6px;padding:5px;font-size:12px;';
    const btnStyle = 'border:none;border-radius:6px;padding:5px 11px;font-size:12px;font-weight:800;color:#fff;';

    Object.values(SKILLS).forEach((sk) => {
      const skId = sk.id;
      const lv = Number(d.skills?.[skId]) || 0;
      const saved = d.customSkillFxV9[skId] || null;
      const info = withDefaultAttr(d, skId, () => fx.getSkillInfo(g, buildFxSkill(d, skId)));

      const row = document.createElement('div');
      row.style.cssText = 'background:rgba(15,23,42,.9);border:1px solid rgba(125,211,252,.35);border-radius:10px;padding:9px;';
      row.innerHTML = `
        <div style="display:flex;justify-content:space-between;gap:6px;margin-bottom:6px;">
          <span style="font-weight:900;color:#7dd3fc;font-size:13px;">${sk.icon} ${sk.name} <span style="color:#fde047;">${lv > 0 ? 'Lv.' + lv : '未習得'}</span></span>
          <span class="evo-name" style="font-size:10.5px;color:#fde047;font-weight:800;text-align:right;">${info.evolvedName}</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 130px;gap:6px;margin-bottom:7px;">
          <select class="attr-sel" style="${selStyle}">${attrOptions}</select>
          <select class="tier-sel" style="${selStyle}color:#fde047;">
            <option value="auto">自動（Lv連動）</option>
            <option value="0">★ 通常</option>
            <option value="1">★★ 【真】</option>
            <option value="2">★★★ 【極】</option>
            <option value="3">★★★★ 【神】</option>
          </select>
        </div>
        <div style="display:flex;gap:6px;justify-content:flex-end;">
          <button type="button" class="b-test" style="${btnStyle}background:linear-gradient(90deg,#ec4899,#8b5cf6);">⚡ 試射</button>
          <button type="button" class="b-save" style="${btnStyle}background:#0284c7;">💾 保存</button>
          <button type="button" class="b-reset" style="${btnStyle}background:#475569;">↺ 初期値</button>
        </div>`;
      const attrSel = row.querySelector('.attr-sel');
      const tierSel = row.querySelector('.tier-sel');
      attrSel.value = (saved && saved.attrId) || info.attr.id;
      tierSel.value = (saved && typeof saved.tier === 'number') ? String(saved.tier) : 'auto';

      const currentCfg = () => {
        const cfg = { attrId: attrSel.value };
        if (tierSel.value !== 'auto') cfg.tier = Number(tierSel.value);
        return cfg;
      };
      const refreshName = () => {
        const prev = d.customSkillFxV9[skId];
        d.customSkillFxV9[skId] = currentCfg();
        try { row.querySelector('.evo-name').textContent = fx.getSkillInfo(g, buildFxSkill(d, skId)).evolvedName; }
        finally { if (prev) d.customSkillFxV9[skId] = prev; else delete d.customSkillFxV9[skId]; }
      };
      attrSel.addEventListener('change', refreshName);
      tierSel.addEventListener('change', refreshName);

      row.querySelector('.b-test').onclick = () => {
        if (!g.player) return;
        const prev = d.customSkillFxV9[skId];
        d.customSkillFxV9[skId] = currentCfg();
        modal.style.display = 'none';
        try { fx.triggerCustomSkillEffect(g, g.player, aimPos(g), buildFxSkill(d, skId)); }
        catch (e) { console.error('[boot] 試射エラー', e); }
        finally { if (prev) d.customSkillFxV9[skId] = prev; else delete d.customSkillFxV9[skId]; }
        setTimeout(() => { modal.style.display = 'flex'; }, 2800);
      };
      row.querySelector('.b-save').onclick = () => {
        d.customSkillFxV9[skId] = currentCfg();
        g.saveGame?.(false);
        g.showAlertBanner?.(`✨ 「${sk.name}」の進化設定を保存しました`, 1500);
      };
      row.querySelector('.b-reset').onclick = () => {
        delete d.customSkillFxV9[skId];
        g.saveGame?.(false);
        openRealStudio();
      };
      list.appendChild(row);
    });
  }

  // game9 の古いスタジオ(存在しないダミースキルを表示する)のボタンを、新しいスタジオに付け替える
  function rewireStudioButton(tries = 0) {
    const btn = document.getElementById('kmj-v9-studio-open-btn');
    if (!btn) { if (tries < 20) setTimeout(() => rewireStudioButton(tries + 1), 250); return; }
    if (btn._bootRewired) return;
    const nb = btn.cloneNode(true); // 古いクリック処理を捨てる
    nb._bootRewired = true;
    btn.replaceWith(nb);
    nb.addEventListener('click', openRealStudio);
  }

  registerStudioSkills();
  installCombatFx();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // ---------- 6. UIの重なり解消 ----------
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
