// boot.js — index.html の game9.js の「後」に読み込むこと
//   <script src="boot.js?v=4"></script>
//
// 1) ゲーム本体(KaomojiMMORPG)をページ読み込み時に必ず1回だけ生成する。
// 2) 通常攻撃のエフェクトを接続する（performBasicAttack）。
// 3) スキルスタジオにあって本体に無かった属性スキル7種を、実スキルとして登録する。
//    ＋ 属性の自動判定が外れる3スキルへ、専用属性を割り当てる。
// 4) 設定メニューに「🎮 戦闘ボタン配置を編集」を追加（移動スティック/攻撃/標的切替/スキル5個を自由に移動）。
// 5) 設定内のデバッグモード切替・魔法進化ボタンを消し、チャット開閉を左に固定、重なるUIを整理する。
(function () {
  'use strict';

  // =====================================================
  // 1. 起動
  // =====================================================
  function boot() {
    if (window.game || window.__kmjInstance) return;
    try {
      const g = new KaomojiMMORPG();
      window.game = g;
      window.__kmjInstance = g;
      guardSaveData(g);
    } catch (e) {
      console.error('[boot] 起動エラー', e);
      const el = document.getElementById('title-save-info');
      if (el) el.textContent = '⚠️ 起動エラー: ' + (e && e.message ? e.message : e);
    }
    ensureLayoutMenuButton();
  }

  // =====================================================
  // 2. 通常攻撃のエフェクト接続
  // =====================================================
  function installBasicAttackFx() {
    if (typeof KaomojiMMORPG === 'undefined') return;
    const P = KaomojiMMORPG.prototype;
    if (P._bootBasicFxInstalled) return;
    P._bootBasicFxInstalled = true;

    const origBasic = P.performBasicAttack;
    if (typeof origBasic !== 'function') return;
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

  // =====================================================
  // 3. スキルスタジオの属性スキルを実スキルとして登録
  // =====================================================
  // スキルスタジオにあるのに本体(SKILLS)に無かった属性スキル。性能は本体のバランスに合わせた初期値。
  const STUDIO_SKILLS = [
    { id: 'fx_fire_pillar', icon: '🔥', name: '螺旋炎柱',           type: 'AOE_BURN',   baseMp: 26, cd: 6.8, baseMult: 3.2, radius: 6.4, desc: '螺旋状の炎柱で広範囲を焼き、継続炎上ダメージを与える' },
    { id: 'fx_fire_burst', icon: '🎇', name: '爆炎連弾',           type: 'AOE_DMG',    baseMp: 20, cd: 4.6, baseMult: 2.6, radius: 5.4, desc: '連装火球を撃ち込み、着弾点を爆破する' },
    { id: 'fx_water',      icon: '🌊', name: '大渦潮',             type: 'AOE_SLOW',   baseMp: 22, cd: 6.2, baseMult: 2.4, radius: 6.6, desc: '巨大な渦潮の水柱で攻撃し、移動速度を下げる' },
    { id: 'fx_poison',     icon: '☠️', name: '魔界瘴気',           type: 'AOE_BURN',   baseMp: 24, cd: 7.0, baseMult: 3.0, radius: 6.6, desc: '瘴気を広げ、継続ダメージを与える' },
    { id: 'fx_dark',       icon: '🌑', name: '黒蝕ブラックホール', type: 'AOE_DMG',    baseMp: 36, cd: 8.2, baseMult: 4.2, radius: 8.0, desc: '黒い穹を呼び出し、周囲を飲み込む' },
    { id: 'fx_star',       icon: '🌠', name: '銀河流星',           type: 'AOE_DMG',    baseMp: 34, cd: 7.8, baseMult: 4.0, radius: 7.8, desc: '銀河の流星群を降らせる' },
    { id: 'fx_sword',      icon: '🗡️', name: '無限光剣陣',         type: 'SINGLE_DMG', baseMp: 28, cd: 4.8, baseMult: 4.0, desc: '無数の光剣を展開して単体を貫く' }
  ];

  function registerStudioSkills() {
    if (typeof SKILLS === 'undefined' || !SKILLS || Array.isArray(SKILLS)) return;
    STUDIO_SKILLS.forEach((s) => { if (!SKILLS[s.id]) SKILLS[s.id] = Object.assign({}, s); });
  }

  // game9 の属性自動判定が外れるスキル（名前に「光」「炎」等が入り、回復系や別の炎に誤判定される）。
  // 回復系に誤判定されると攻撃ダメージが無効化されるため、専用属性を明示する。
  // プレイヤーがスタジオで設定済みの場合はそちらを優先する。
  const DEFAULT_ATTR = { vamp_drain: 'dark', fx_fire_burst: 'fire_burst', fx_sword: 'sword' };

  function applyDefaultAttrs(d) {
    if (!d || typeof d !== 'object') return;
    if (!d.skillCustomV9 || typeof d.skillCustomV9 !== 'object') d.skillCustomV9 = {};
    Object.keys(DEFAULT_ATTR).forEach((id) => {
      if (!d.skillCustomV9[id]) d.skillCustomV9[id] = { attrId: DEFAULT_ATTR[id] };
    });
  }

  // セーブデータが読み込み直されても、必ず既定属性を適用する
  function guardSaveData(g) {
    if (g._bootSaveGuard) return;
    g._bootSaveGuard = true;
    let cur = g.saveData;
    applyDefaultAttrs(cur);
    Object.defineProperty(g, 'saveData', {
      configurable: true,
      enumerable: true,
      get() { return cur; },
      set(v) { cur = v; applyDefaultAttrs(v); }
    });
  }

  // =====================================================
  // 4. 戦闘ボタン配置エディタ
  // =====================================================
  const LAYOUT_KEY = 'kmj_btn_layout_v1';
  const MOVABLES = [
    { key: 'stick',  sel: '#joystick-zone',                   label: '移動' },
    { key: 'attack', sel: '#btn-basic-attack',                label: '攻撃' },
    { key: 'target', sel: '#btn-cycle-target',                label: '標的切替' },
    { key: 'slot0',  sel: '.skill-slot-btn[data-slot="0"]',   label: 'S1' },
    { key: 'slot1',  sel: '.skill-slot-btn[data-slot="1"]',   label: 'S2' },
    { key: 'slot2',  sel: '.skill-slot-btn[data-slot="2"]',   label: 'S3' },
    { key: 'slot3',  sel: '.skill-slot-btn[data-slot="3"]',   label: 'S4' },
    { key: 'slot4',  sel: '.skill-slot-btn[data-slot="4"]',   label: 'S5' }
  ];

  const orient = () => (window.innerWidth >= window.innerHeight ? 'land' : 'port'); // 横向き/縦向きで別々に保存
  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), Math.max(lo, hi));

  function loadLayout() {
    try {
      const v = JSON.parse(localStorage.getItem(LAYOUT_KEY) || 'null');
      if (v && typeof v === 'object') return { land: v.land || {}, port: v.port || {} };
    } catch (e) { /* 壊れた保存は無視して初期状態に */ }
    return { land: {}, port: {} };
  }
  let layout = loadLayout();

  function saveLayout() {
    try { localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout)); }
    catch (e) { console.error('[boot] ボタン配置の保存に失敗', e); }
  }

  let layoutStyleEl = null;
  function applyLayout() {
    if (!layoutStyleEl) {
      layoutStyleEl = document.createElement('style');
      layoutStyleEl.id = 'kmj-layout-style';
      (document.head || document.documentElement).appendChild(layoutStyleEl);
    }
    const cur = layout[orient()] || {};
    const maxX = window.innerWidth - 24;
    const maxY = window.innerHeight - 24;
    layoutStyleEl.textContent = MOVABLES.map((m) => {
      const p = cur[m.key];
      if (!p) return '';
      const x = clamp(p.x, 0, maxX), y = clamp(p.y, 0, maxY);
      return `${m.sel}{position:fixed!important;left:${x}px!important;top:${y}px!important;right:auto!important;bottom:auto!important;margin:0!important;}`;
    }).filter(Boolean).join('\n');
  }

  let editorLayer = null;
  let grips = [];

  function closeLayoutEditor() {
    editorLayer?.remove();
    editorLayer = null;
    grips = [];
  }

  function buildGrips() {
    grips.forEach((el) => el.remove());
    grips = [];
    if (!editorLayer) return;

    MOVABLES.forEach((m) => {
      const target = document.querySelector(m.sel);
      if (!target) return;
      const r0 = target.getBoundingClientRect();
      if (r0.width < 2 || r0.height < 2) return;

      // 本物のボタンの上に透明な「つかみ板」を重ねる。
      // 無効状態(空スロット)のボタンでも動かせて、タップしてもスキルが発動しない。
      const grip = document.createElement('div');
      grip.style.cssText =
        `position:absolute;left:${r0.left}px;top:${r0.top}px;width:${r0.width}px;height:${r0.height}px;` +
        `box-sizing:border-box;border:2px dashed #fde047;background:rgba(250,204,21,.2);` +
        `border-radius:${getComputedStyle(target).borderRadius || '12px'};` +
        `display:flex;align-items:center;justify-content:center;` +
        `color:#fff;font:800 11px sans-serif;text-shadow:0 1px 3px #000;` +
        `pointer-events:auto;touch-action:none;cursor:grab;user-select:none;-webkit-user-select:none;`;
      grip.textContent = m.label;

      let drag = null;
      grip.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        grip.setPointerCapture?.(e.pointerId);
        const r = target.getBoundingClientRect();
        drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, l: r.left, t: r.top, w: r.width, h: r.height };
      });
      grip.addEventListener('pointermove', (e) => {
        if (!drag || e.pointerId !== drag.id) return;
        const x = clamp(drag.l + e.clientX - drag.sx, 0, window.innerWidth - drag.w);
        const y = clamp(drag.t + e.clientY - drag.sy, 0, window.innerHeight - drag.h);
        const o = orient();
        if (!layout[o]) layout[o] = {};
        layout[o][m.key] = { x: Math.round(x), y: Math.round(y) };
        applyLayout();
        grip.style.left = x + 'px';
        grip.style.top = y + 'px';
      });
      const end = (e) => {
        if (drag && e.pointerId === drag.id) { drag = null; saveLayout(); }
      };
      grip.addEventListener('pointerup', end);
      grip.addEventListener('pointercancel', end);

      editorLayer.appendChild(grip);
      grips.push(grip);
    });
  }

  function openLayoutEditor() {
    closeLayoutEditor();
    document.getElementById('hud-drawer-menu')?.classList.add('hidden');

    editorLayer = document.createElement('div');
    editorLayer.id = 'kmj-layout-layer';
    editorLayer.style.cssText = 'position:fixed;left:0;top:0;right:0;bottom:0;z-index:9995;pointer-events:none;';

    const bar = document.createElement('div');
    bar.style.cssText =
      'position:absolute;top:8px;left:50%;transform:translateX(-50%);display:flex;gap:8px;align-items:center;' +
      'background:rgba(2,6,23,.95);border:2px solid #fde047;border-radius:12px;padding:7px 10px;' +
      'pointer-events:auto;color:#fff;font:800 12px sans-serif;white-space:nowrap;';
    const msg = document.createElement('span');
    msg.textContent = '🎮 ボタンをドラッグして移動';
    const btnStyle = 'border:none;border-radius:8px;padding:6px 11px;font:800 12px sans-serif;color:#fff;';

    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.textContent = '↺ 初期位置に戻す';
    resetBtn.style.cssText = btnStyle + 'background:#475569;';
    resetBtn.addEventListener('click', () => {
      delete layout[orient()];
      saveLayout();
      applyLayout();
      buildGrips();
    });

    const doneBtn = document.createElement('button');
    doneBtn.type = 'button';
    doneBtn.textContent = '✔ 完了';
    doneBtn.style.cssText = btnStyle + 'background:#059669;';
    doneBtn.addEventListener('click', closeLayoutEditor);

    bar.appendChild(msg);
    bar.appendChild(resetBtn);
    bar.appendChild(doneBtn);
    editorLayer.appendChild(bar);
    document.body.appendChild(editorLayer);

    buildGrips();
  }

  // 設定メニュー(ハンバーガー内)にボタンを追加
  function ensureLayoutMenuButton() {
    const drawer = document.getElementById('hud-drawer-menu');
    if (!drawer || drawer.querySelector('#btn-edit-btn-layout')) return;
    const b = document.createElement('button');
    b.type = 'button';
    b.id = 'btn-edit-btn-layout';
    b.className = 'btn-ui btn-sky';
    b.style.width = '100%';
    b.textContent = '🎮 戦闘ボタン配置を編集';
    b.addEventListener('click', (e) => { e.stopPropagation(); openLayoutEditor(); });
    const ref = drawer.querySelector('#btn-toggle-bgm');
    if (ref) ref.insertAdjacentElement('afterend', b); else drawer.appendChild(b);
  }

  function watchDrawer() {
    const drawer = document.getElementById('hud-drawer-menu');
    if (!drawer || drawer._bootWatched) return;
    drawer._bootWatched = true;
    // 他のコードがメニューを作り直しても、ボタンが消えないようにする
    new MutationObserver(() => ensureLayoutMenuButton()).observe(drawer, { childList: true });
  }

  let resizeRaf = 0;
  function onResize() {
    if (resizeRaf) return;
    resizeRaf = requestAnimationFrame(() => {
      resizeRaf = 0;
      applyLayout();
      if (editorLayer) buildGrips();
    });
  }

  window.kmjOpenLayoutEditor = openLayoutEditor; // コンソールからの確認用

  // =====================================================
  // 起動処理
  // =====================================================
  registerStudioSkills();
  installBasicAttackFx();
  applyLayout();
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);

  function onReady() {
    boot();
    ensureLayoutMenuButton();
    watchDrawer();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }

  // =====================================================
  // 5. UIの整理
  // =====================================================
  const st = document.createElement('style');
  st.id = 'kmj-boot-ui-fix';
  st.textContent = `
    /* 設定メニュー内のデバッグモード切替を消す */
    #kmj-v7-gear-debug-toggle { display: none !important; }
    /* 通常攻撃の上の「魔法進化」ボタンを消す */
    #kmj-v9-open-studio-btn, #kmj-v9-studio-open-btn { display: none !important; }

    /* チャット開閉ボタンを左側に固定（チャット欄を動かしても、このボタンは動かない） */
    #btn-toggle-chat {
      position: fixed !important; left: 8px !important; top: 128px !important;
      right: auto !important; bottom: auto !important; z-index: 31 !important;
    }

    /* 脅威バー: 左上のHP/MPバーと重なる → 上部中央へ */
    #kmj-v8-threat-bar {
      top: 8px !important; left: 50% !important; right: auto !important;
      transform: translateX(-50%) !important;
    }
    /* オンライン状態ピル: 右上のステージ表示と重なる → 脅威バーの下へ */
    #kmj-v45-online-pill, .kmj-v45-online-pill {
      top: 44px !important; right: auto !important; left: 50% !important;
      transform: translateX(-50%) !important;
    }
    /* DEBUG / スキルスタジオ: 右上の操作ボタンと重なる → 下部中央へ */
    #kmj-v7-debug-hud {
      top: auto !important; right: auto !important;
      bottom: 8px !important; left: 50% !important;
      transform: translateX(-50%) !important;
    }
  `;
  (document.head || document.documentElement).appendChild(st);
})();
