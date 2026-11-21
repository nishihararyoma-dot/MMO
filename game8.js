// ▼▼▼ ここから【game8.js 決定版】チャット移動つまみ＆右下リサイズつまみ・手前ワープ判定一致・右上オンライン消去・顔90度回転＆球体埋まり完全修正・驚異度999・格上1.5倍・12クラス進化・全称号＆実績パッシブ ▼▼▼
(() => {
  'use strict';

  const MAX_LV_999 = 999;
  const MAX_THREAT_999 = 999;

  try {
    ['MAX_LV', 'MAX_LEVEL', 'LEVEL_CAP', 'MAX_PLAYER_LV', 'MAX_SKILL_LV'].forEach(k => { window[k] = MAX_LV_999; });
    ['MAX_THREAT_RANK', 'MAX_THREAT', 'THREAT_CAP', 'MAX_THREAT_LEVEL', 'MAX_DANGER', 'THREAT_MAX'].forEach(k => { window[k] = MAX_THREAT_999; });
  } catch (e) {}

  // =========================================================
  // 1. スタイル定義（チャット移動つまみ・右下リサイズつまみ・ワープナビ・スタジオボタン）
  // =========================================================
  if (!document.getElementById('kmj-v8-ui-style')) {
    const st = document.createElement('style');
    st.id = 'kmj-v8-ui-style';
    st.textContent = `
      #kmj-v45-online-pill, [id*="online-pill"], [class*="online-pill"] {
        display: none !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
      /* チャット移動つまみ（上部バー） */
      #kmj-chat-move-bar {
        width: 100%;
        height: 24px;
        background: linear-gradient(90deg, rgba(15, 23, 42, 0.98), rgba(30, 58, 138, 0.95), rgba(15, 23, 42, 0.98));
        border-bottom: 1.5px solid #38bdf8;
        border-radius: 10px 10px 0 0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        cursor: move;
        touch-action: none;
        user-select: none;
        color: #7dd3fc;
        font-size: 10.5px;
        font-weight: 900;
        letter-spacing: 0.04em;
      }
      /* チャット右下リサイズつまみ */
      #kmj-chat-resize-corner {
        position: absolute;
        right: 0;
        bottom: 0;
        width: 28px;
        height: 28px;
        background: linear-gradient(135deg, transparent 42%, #38bdf8 45%, #0284c7 100%);
        border-bottom-right-radius: 10px;
        cursor: nwse-resize;
        touch-action: none;
        user-select: none;
        z-index: 30;
        display: flex;
        align-items: flex-end;
        justify-content: flex-end;
        padding: 2px 3px;
        color: #ffffff;
        font-size: 11px;
        font-weight: 900;
        text-shadow: 0 1px 2px #000;
      }
      /* 右上のワープナビ＆魔法スタジオボタン */
      #kmj-warp-compass-hud {
        position: fixed;
        top: 84px;
        right: 12px;
        z-index: 950;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 5px;
        pointer-events: auto;
      }
      .kmj-warp-pill {
        background: rgba(15, 23, 42, 0.9);
        border: 1.5px solid #38bdf8;
        box-shadow: 0 0 12px rgba(56, 189, 248, 0.5);
        color: #f8fafc;
        border-radius: 999px;
        padding: 5px 11px;
        font-size: 11px;
        font-weight: 900;
        display: flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
        user-select: none;
        backdrop-filter: blur(4px);
      }
      .kmj-warp-pill:active { transform: scale(0.96); }
      .kmj-studio-launch-btn {
        background: linear-gradient(90deg, #db2777, #7c3aed);
        border: 1.5px solid #fde047;
        box-shadow: 0 0 14px rgba(236, 72, 153, 0.65);
        color: #fff;
        border-radius: 999px;
        padding: 5px 12px;
        font-size: 11px;
        font-weight: 900;
        cursor: pointer;
        user-select: none;
      }
      .kmj-studio-launch-btn:active { transform: scale(0.96); }
    `;
    document.head.appendChild(st);
  }

  function hideTopRightOnlineBarV8() {
    document.getElementById('kmj-v45-online-pill')?.remove();
    const w = window.innerWidth || 800;
    document.querySelectorAll('div, span, header, nav').forEach(el => {
      if (el.id === 'hud' || el.id === 'modal' || el.closest('#modal') || el.closest('#chat-box') || el.closest('#kmj-warp-compass-hud')) return;
      const txt = (el.textContent || '').trim();
      if (!txt || txt.length > 52) return;
      if (txt.includes('合言葉部屋') || /オンライン\s*\(\d+人\)/.test(txt)) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height < 68 && rect.right >= w - 360 && rect.top <= 95) {
          el.style.setProperty('display', 'none', 'important');
        }
      }
    });
  }
  hideTopRightOnlineBarV8();
  setInterval(hideTopRightOnlineBarV8, 500);

  // =========================================================
  // 2. チャットの「移動つまみ（上部）」＆「右下リサイズつまみ（↘）」実装
  // =========================================================
  function installChatDragAndResizeHandles() {
    let chatBox = document.getElementById('chat-box') || document.getElementById('chat-container');
    if (!chatBox) {
      for (const el of document.querySelectorAll('div')) {
        const txt = el.textContent || '';
        if (txt.includes('全体チャット') && txt.includes('部屋/オフライン') && el.querySelector('input')) {
          chatBox = el;
          break;
        }
      }
    }
    if (!chatBox) return;

    // ログ表示領域の特定
    let logArea = chatBox.querySelector('#chat-messages, #chat-log, .chat-messages, .chat-log');
    if (!logArea) {
      for (const ch of chatBox.querySelectorAll('div')) {
        if ((ch.textContent || '').includes('全体チャットへようこそ')) {
          logArea = ch;
          break;
        }
      }
    }

    // 自由移動・自由リサイズできるようにスタイルを初期化
    if (!chatBox.dataset.v8Positioned) {
      const rect = chatBox.getBoundingClientRect();
      chatBox.style.position = 'fixed';
      chatBox.style.left = `${Math.max(8, rect.left || 14)}px`;
      chatBox.style.top = `${Math.max(60, rect.top || (window.innerHeight - 280))}px`;
      chatBox.style.bottom = 'auto';
      chatBox.style.right = 'auto';
      chatBox.style.width = `${Math.max(250, Math.round(rect.width || 360))}px`;
      chatBox.style.boxSizing = 'border-box';
      chatBox.style.overflow = 'hidden';
      chatBox.dataset.v8Positioned = '1';
    }

    // ① 上部：チャットの移動つまみ
    if (!document.getElementById('kmj-chat-move-bar')) {
      const moveBar = document.createElement('div');
      moveBar.id = 'kmj-chat-move-bar';
      moveBar.innerHTML = `<span>✥ チャット移動つまみ（ドラッグで移動）</span>`;
      chatBox.insertBefore(moveBar, chatBox.firstChild);

      let moving = false;
      let startX = 0, startY = 0, origLeft = 0, origTop = 0;

      const beginMove = (cx, cy) => {
        moving = true;
        startX = cx;
        startY = cy;
        const r = chatBox.getBoundingClientRect();
        origLeft = r.left;
        origTop = r.top;
      };
      const doMove = (cx, cy) => {
        if (!moving) return;
        const maxLeft = Math.max(0, window.innerWidth - chatBox.offsetWidth);
        const maxTop = Math.max(0, window.innerHeight - chatBox.offsetHeight);
        const nextL = Math.max(0, Math.min(maxLeft, origLeft + (cx - startX)));
        const nextT = Math.max(0, Math.min(maxTop, origTop + (cy - startY)));
        chatBox.style.left = `${Math.round(nextL)}px`;
        chatBox.style.top = `${Math.round(nextT)}px`;
      };
      const endMove = () => { moving = false; };

      moveBar.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) { e.stopPropagation(); beginMove(e.touches[0].clientX, e.touches[0].clientY); }
      }, { passive: false });
      window.addEventListener('touchmove', (e) => {
        if (moving && e.touches.length > 0) { e.preventDefault(); doMove(e.touches[0].clientX, e.touches[0].clientY); }
      }, { passive: false });
      window.addEventListener('touchend', endMove);

      moveBar.addEventListener('mousedown', (e) => { e.preventDefault(); e.stopPropagation(); beginMove(e.clientX, e.clientY); });
      window.addEventListener('mousemove', (e) => { if (moving) doMove(e.clientX, e.clientY); });
      window.addEventListener('mouseup', endMove);
    }

    // ② 右下：大きさ変えるつまみ（↘）
    if (!document.getElementById('kmj-chat-resize-corner')) {
      const resizer = document.createElement('div');
      resizer.id = 'kmj-chat-resize-corner';
      resizer.title = 'ドラッグしてチャットの大きさを変更';
      resizer.textContent = '↘';
      chatBox.appendChild(resizer);

      let resizing = false;
      let startX = 0, startY = 0, origW = 360, origH = 180, origLogH = 90;

      const beginResize = (cx, cy) => {
        resizing = true;
        startX = cx;
        startY = cy;
        const r = chatBox.getBoundingClientRect();
        origW = r.width;
        origH = r.height;
        origLogH = logArea ? logArea.getBoundingClientRect().height : 90;
      };
      const doResize = (cx, cy) => {
        if (!resizing) return;
        const dx = cx - startX;
        const dy = cy - startY;
        const maxW = Math.min(680, window.innerWidth - chatBox.getBoundingClientRect().left - 6);
        const nextW = Math.max(220, Math.min(maxW, origW + dx));
        chatBox.style.width = `${Math.round(nextW)}px`;

        if (logArea) {
          const nextLogH = Math.max(36, Math.min(340, origLogH + dy));
          logArea.style.height = `${Math.round(nextLogH)}px`;
          logArea.style.maxHeight = `${Math.round(nextLogH)}px`;
          logArea.style.overflowY = 'auto';
        } else {
          const nextH = Math.max(115, Math.min(440, origH + dy));
          chatBox.style.height = `${Math.round(nextH)}px`;
        }
      };
      const endResize = () => { resizing = false; };

      resizer.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) { e.stopPropagation(); beginResize(e.touches[0].clientX, e.touches[0].clientY); }
      }, { passive: false });
      window.addEventListener('touchmove', (e) => {
        if (resizing && e.touches.length > 0) { e.preventDefault(); doResize(e.touches[0].clientX, e.touches[0].clientY); }
      }, { passive: false });
      window.addEventListener('touchend', endResize);

      resizer.addEventListener('mousedown', (e) => { e.preventDefault(); e.stopPropagation(); beginResize(e.clientX, e.clientY); });
      window.addEventListener('mousemove', (e) => { if (resizing) doResize(e.clientX, e.clientY); });
      window.addEventListener('mouseup', endResize);
    }
  }

  // =========================================================
  // 3. 驚異度（フィールド脅威ランク）999即時反映＆一括ボタン
  // =========================================================
  function getThreatRankV8(inst) {
    const d = inst?.saveData || {};
    const keys = ['threatRank', 'fieldThreatRank', 'threat', 'threatLevel', 'threatLv', 'danger'];
    for (const k of keys) if (typeof d[k] === 'number' && !Number.isNaN(d[k])) return Math.max(1, Math.min(MAX_THREAT_999, Math.floor(d[k])));
    for (const k of keys) if (typeof inst?.[k] === 'number' && !Number.isNaN(inst[k])) return Math.max(1, Math.min(MAX_THREAT_999, Math.floor(inst[k])));
    return 1;
  }

  function renderThreatTextV8(val) {
    const v = Math.max(1, Math.min(MAX_THREAT_999, Math.floor(val)));
    const titleStr = `🔥 フィールド脅威ランク: +${v} / ${MAX_THREAT_999}`;
    const descStr = `敵の強さとEXP/Gドロップ率が +${v * 25}% 増加します`;
    document.querySelectorAll('div, span, p, b, strong').forEach(el => {
      if (el.children.length > 0) return;
      const t = el.textContent || '';
      if (t.includes('フィールド脅威ランク:') && t !== titleStr) el.textContent = titleStr;
      else if (t.includes('敵の強さとEXP/Gドロップ率が') && t !== descStr) el.textContent = descStr;
    });
  }

  let _threatTimerV8 = null;
  function applyThreatRankV8(rawNext) {
    const inst = window.game;
    const nextVal = Math.max(1, Math.min(MAX_THREAT_999, Math.floor(Number(rawNext) || 1)));
    renderThreatTextV8(nextVal);
    if (!inst) return;
    const d = inst.saveData;
    const keys = ['threatRank', 'fieldThreatRank', 'threat', 'threatLevel', 'threatLv', 'danger'];
    if (d) {
      let wrote = false;
      keys.forEach(k => { if (typeof d[k] === 'number') { d[k] = nextVal; wrote = true; } });
      if (!wrote) d.threatRank = nextVal;
    }
    keys.forEach(k => { if (typeof inst[k] === 'number') inst[k] = nextVal; });

    clearTimeout(_threatTimerV8);
    _threatTimerV8 = setTimeout(() => {
      try {
        if (!inst.towerState?.active && !inst.inTitleScreen && typeof inst.spawnMonsters === 'function') inst.spawnMonsters();
        inst.normalizeHigherLevelMonstersV8?.();
        inst.saveGame?.(false);
        renderThreatTextV8(nextVal);
      } catch (e) {}
    }, 90);
  }

  function setupThreatControlsV8() {
    hideTopRightOnlineBarV8();
    installChatDragAndResizeHandles();
    renderThreatTextV8(getThreatRankV8(window.game));
    let card = null;
    for (const el of document.querySelectorAll('div, span, p, b')) {
      if (el.children.length === 0 && (el.textContent || '').includes('フィールド脅威ランク:')) {
        let p = el.parentElement;
        while (p && p !== document.body) {
          if ((p.textContent || '').includes('EXP/Gドロップ率')) { card = p; break; }
          p = p.parentElement;
        }
        if (card) break;
      }
    }
    if (!card) return;

    card.querySelectorAll('button').forEach(btn => {
      const lbl = (btn.textContent || '').trim();
      if ((lbl === '-1' || lbl === '+1') && !btn.dataset.v8Bound) {
        const delta = lbl === '+1' ? 1 : -1;
        const fresh = btn.cloneNode(true);
        fresh.removeAttribute('onclick');
        fresh.dataset.v8Bound = '1';
        fresh.onclick = (e) => { e.preventDefault(); e.stopPropagation(); applyThreatRankV8(getThreatRankV8(window.game) + delta); };
        btn.replaceWith(fresh);
      }
    });

    if (document.getElementById('kmj-v8-threat-bar')) return;
    const bar = document.createElement('div');
    bar.id = 'kmj-v8-threat-bar';
    bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:5px;margin-top:8px;padding-top:7px;border-top:1px solid rgba(148,163,184,0.25);align-items:center;';
    [
      { label: 'MIN (1)', m: 'set', v: 1, bg: '#334155', col: '#f1f5f9' },
      { label: '-100', m: 'add', v: -100, bg: '#1e3a8a', col: '#dbeafe' },
      { label: '-10', m: 'add', v: -10, bg: '#1d4ed8', col: '#eff6ff' },
      { label: '+10', m: 'add', v: 10, bg: '#dc2626', col: '#fef2f2' },
      { label: '+100', m: 'add', v: 100, bg: '#b91c1c', col: '#fee2e2' },
      { label: 'MAX (999)', m: 'set', v: 999, bg: '#d97706', col: '#fef3c7' },
      { label: '🎯 数値指定', m: 'prompt', v: 0, bg: '#059669', col: '#ecfdf5' }
    ].forEach(it => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = it.label;
      b.style.cssText = `background:${it.bg};color:${it.col};border:none;border-radius:6px;padding:5px 8px;font-size:11px;font-weight:900;cursor:pointer;`;
      b.onclick = (e) => {
        e.preventDefault(); e.stopPropagation();
        const now = getThreatRankV8(window.game);
        if (it.m === 'set') applyThreatRankV8(it.v);
        else if (it.m === 'add') applyThreatRankV8(now + it.v);
        else {
          const inp = prompt(`設定したい脅威ランクを入力（1〜999）\n現在値: ${now}`, String(now));
          if (inp !== null && inp.trim() !== '' && !Number.isNaN(Number(inp))) applyThreatRankV8(Number(inp));
        }
      };
      bar.appendChild(b);
    });
    card.appendChild(bar);
  }

  // Canvas頭上ラベル【格上】自動付与
  if (!CanvasRenderingContext2D.prototype._v8KakueHooked) {
    CanvasRenderingContext2D.prototype._v8KakueHooked = true;
    const origFill = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (text, x, y, ...rest) {
      if (typeof text === 'string' && !text.includes('【格上】') && !text.includes('推奨')) {
        const m = text.match(/Lv\.?\s*(\d+)/i);
        if (m) {
          const tLv = Number(m[1]);
          const pLv = Number(window.game?.saveData?.lv ?? window.game?.saveData?.level ?? window.game?.player?.lv ?? 1);
          if (tLv > pLv && pLv >= 1) text = `【格上】${text}`;
        }
      }
      return origFill.call(this, text, x, y, ...rest);
    };
  }

  // 水平顔文字テクスチャ生成（90度回転＆球体めり込み防止）
  const _faceTexCacheV8 = new Map();
  function makeHorizontalFaceTexV8(faceStr, bg = '#0f294a', bd = '#38bdf8') {
    const face = String(faceStr || '(´・ω・`)').trim() || '(´・ω・`)';
    const key = `${face}|${bg}|${bd}`;
    if (_faceTexCacheV8.has(key)) return _faceTexCacheV8.get(key);
    const cv = document.createElement('canvas');
    cv.width = 256; cv.height = 192;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, 256, 192);
    ctx.strokeStyle = bd; ctx.lineWidth = 10; ctx.strokeRect(8, 8, 240, 176);
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    let fs = 44;
    ctx.font = `900 ${fs}px "Hiragino Sans", "Yu Gothic", sans-serif`;
    while (ctx.measureText(face).width > 210 && fs > 18) { fs -= 2; ctx.font = `900 ${fs}px "Hiragino Sans", "Yu Gothic", sans-serif`; }
    ctx.fillText(face, 128, 98);
    const tex = new THREE.CanvasTexture(cv);
    tex.needsUpdate = true;
    _faceTexCacheV8.set(key, tex);
    return tex;
  }

  // Lv.999 12クラス進化ツリー
  const CLASS_TREE_V8 = [
    { id: 'novice', name: '見習い冒険者', icon: '🗡️', reqLv: 1, cost: 0, fxName: '蒼き光の斬撃波', atk: 1.0, def: 1.0, hp: 1.0, desc: '基本の冒険者クラス。' },
    { id: 'warrior', name: '重装戦士', icon: '⚔️', reqLv: 15, cost: 500, fxName: '紅蓮の豪快衝撃斬', atk: 1.28, def: 1.22, hp: 1.25, desc: 'Lv.15〜｜真紅のワイドスラッシュ。' },
    { id: 'spellblade', name: '魔法剣士', icon: '💠', reqLv: 15, cost: 500, fxName: '蒼穹の魔導剣閃', atk: 1.32, def: 1.12, hp: 1.18, desc: 'Lv.15〜｜回転魔法陣付きの蒼い剣閃。' },
    { id: 'paladin', name: '聖騎士（パラディン）', icon: '🛡️', reqLv: 50, cost: 2500, fxName: '黄金の聖光十字斬', atk: 1.48, def: 1.55, hp: 1.50, desc: 'Lv.50〜｜聖なる十字斬撃を放つ。' },
    { id: 'arch_spellblade', name: '大賢剣士', icon: '🔮', reqLv: 50, cost: 2500, fxName: '紫電星屑の魔剣波', atk: 1.62, def: 1.32, hp: 1.38, desc: 'Lv.50〜｜多重魔法陣の魔導斬撃波。' },
    { id: 'ninja', name: '疾風の影忍者', icon: '🌪️', reqLv: 100, cost: 6000, fxName: '翠嵐の三連疾風刃', atk: 1.75, def: 1.40, hp: 1.48, desc: 'Lv.100〜｜三連斬撃波と旋風を起こす。' },
    { id: 'blade_master', name: '蒼穹の剣聖', icon: '⚡', reqLv: 200, cost: 15000, fxName: '次元断ち・蒼雷クロス斬', atk: 2.08, def: 1.68, hp: 1.78, desc: 'Lv.200〜｜稲妻クロス斬撃。' },
    { id: 'astral_knight', name: '星詠みの聖剣士', icon: '🌟', reqLv: 200, cost: 15000, fxName: '銀河の星屑プリズム斬', atk: 2.18, def: 1.65, hp: 1.72, desc: 'Lv.200〜｜星屑プリズムバースト。' },
    { id: 'dragoon', name: '紅蓮の竜騎士', icon: '🐉', reqLv: 350, cost: 35000, fxName: '竜王の業火ブレイブ斬', atk: 2.52, def: 2.08, hp: 2.18, desc: 'Lv.350〜｜紅蓮の炎柱と竜の爪痕。' },
    { id: 'emperor_blade', name: '覇王・天帝剣神', icon: '👑', reqLv: 550, cost: 80000, fxName: '天帝覇王・黄金螺旋斬', atk: 3.15, def: 2.65, hp: 2.80, desc: 'Lv.550〜｜黄金神環と螺旋斬撃波。' },
    { id: 'void_overlord', name: '虚空の創世剣帝', icon: '🌌', reqLv: 750, cost: 150000, fxName: 'アビスノヴァ・黒蝕次元斬', atk: 3.65, def: 3.05, hp: 3.20, desc: 'Lv.750〜｜漆黒重力輪とネオン紫リング。' },
    { id: 'mythic_god', name: '創世神話・アルティメット顔文字神', icon: '🌈', reqLv: 999, cost: 500000, fxName: '創世神話・虹翼天翔ノヴァ斬', atk: 4.50, def: 3.80, hp: 4.00, desc: 'Lv.999〜｜全属性の虹翼天翔ノヴァ斬。' }
  ];

  function installV8Core() {
    if (typeof KaomojiMMORPG === 'undefined') {
      setTimeout(installV8Core, 100);
      return;
    }

    const P = KaomojiMMORPG.prototype;
    if (P._v8CoreInstalled) return;
    P._v8CoreInstalled = true;

    P.alignAvatarFaceStrictly = function () {};

    Object.assign(P, {
      // =========================================================
      // A. ワープ位置を手前に配置＆「ワープ判定のある場所」と100%一致させる！
      // =========================================================
      updateWarpPortalsAndCompassV8() {
        if (!this.scene || !this.player?.pos || typeof THREE === 'undefined') return;
        const d = this.saveData || {};
        const zIdx = Number(d.zone ?? d.zoneIndex ?? this.currentZoneIndex ?? 0);
        const zName = String(this.currentZone?.name || d.zoneName || '');
        const isPlaza = (zIdx === 0 || /始まり|広場|plaza|town|start/i.test(zName));

        // 1) ゲーム本来のポータルオブジェクトがある場合は座標を「手前（距離11m付近）」へ引き寄せる！
        const portals = [];
        const rawList = this.portals || this.zonePortals || this.warpGates || this.currentZone?.portals;
        if (Array.isArray(rawList) && rawList.length > 0) {
          rawList.forEach((pt, idx) => {
            if (!pt) return;
            const targetZ = pt.targetZone ?? pt.toZone ?? (isPlaza ? 1 : (idx === 0 ? zIdx + 1 : 0));
            const label = pt.label || pt.name || (targetZ === 0 ? '🏠 広場へ戻る' : '🌀 次ステージへ');
            // 奥すぎる座標（z < -13 や z > 13）を手前に再配置し、ポータル自身の判定座標も書き換える！
            const nearX = rawList.length === 1 ? 0 : (idx === 0 ? -5.5 : 5.5);
            const nearZ = -11.5;
            if (typeof pt.x === 'number') pt.x = nearX;
            if (typeof pt.z === 'number') pt.z = nearZ;
            if (pt.pos) { pt.pos.x = nearX; pt.pos.z = nearZ; }
            if (pt.position) { pt.position.x = nearX; pt.position.z = nearZ; }
            if (pt.mesh?.position) { pt.mesh.position.x = nearX; pt.mesh.position.z = nearZ; }
            portals.push({ x: nearX, z: nearZ, label, targetZone: targetZ });
          });
        } else {
          // ポータル配列がないフィールドでも手前（z = -11.5）にワープ判定付きポータルを設置
          if (isPlaza) {
            portals.push({ x: 0, z: -11.5, label: '🌀 ステージ1へワープ', targetZone: 1 });
          } else {
            portals.push({ x: -5.5, z: -11.5, label: `🌀 ステージ${zIdx + 1}へ`, targetZone: zIdx + 1 });
            portals.push({ x: 5.5, z: -11.5, label: '🏠 広場へ戻る', targetZone: 0 });
          }
        }

        // 2) ポータル座標そのものに「ワープ判定リング＋光の門＋回転クリスタル」を描画
        if (!this._v8WarpBeacons) this._v8WarpBeacons = [];
        while (this._v8WarpBeacons.length < portals.length) {
          const bGrp = new THREE.Group();
          bGrp.userData.isV8WarpBeacon = true;

          // ワープ判定範囲（半径2.5m）を示す地面の魔法陣リング
          const judgeRing = new THREE.Mesh(
            new THREE.RingGeometry(1.8, 2.5, 36),
            new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.95 })
          );
          judgeRing.rotation.x = -Math.PI / 2;
          judgeRing.position.y = 0.08;
          bGrp.add(judgeRing);

          const innerDisc = new THREE.Mesh(
            new THREE.CircleGeometry(1.8, 32),
            new THREE.MeshBasicMaterial({ color: 0x0284c7, side: THREE.DoubleSide, transparent: true, opacity: 0.35 })
          );
          innerDisc.rotation.x = -Math.PI / 2;
          innerDisc.position.y = 0.06;
          bGrp.add(innerDisc);

          // 立体のワープ門（黄金トーラスアーチ）
          const arch = new THREE.Mesh(
            new THREE.TorusGeometry(2.0, 0.16, 12, 32),
            new THREE.MeshBasicMaterial({ color: 0xfde047, transparent: true, opacity: 0.95 })
          );
          arch.position.y = 2.0;
          bGrp.add(arch);

          // 回転クリスタル
          const crystal = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.55, 0),
            new THREE.MeshBasicMaterial({ color: 0xf472b6 })
          );
          crystal.position.y = 2.1;
          bGrp.add(crystal);

          this.scene.add(bGrp);
          this._v8WarpBeacons.push({ grp: bGrp, crystal, judgeRing });
        }
        for (let i = portals.length; i < this._v8WarpBeacons.length; i++) {
          this._v8WarpBeacons[i].grp.visible = false;
        }

        const tNow = performance.now() * 0.003;
        const px = this.player.pos.x;
        const pz = this.player.pos.z;

        portals.forEach((pt, idx) => {
          const b = this._v8WarpBeacons[idx];
          b.grp.visible = true;
          b.grp.position.set(pt.x, 0, pt.z);
          b.crystal.rotation.y = tNow;
          b.crystal.position.y = 2.1 + Math.sin(tNow * 1.6) * 0.22;

          // 3) ワープの見た目（判定リング半径2.4m以内）に入ったら確実にワープ判定を発動！
          const dist = Math.hypot(pt.x - px, pt.z - pz);
          if (dist <= 2.4 && (!this._v8WarpCooldown || performance.now() > this._v8WarpCooldown)) {
            this._v8WarpCooldown = performance.now() + 1800;
            // ワープ先に着いた時、門の上に重ならないよう少し手前に配置
            this.player.pos.x = 0;
            this.player.pos.z = -4.0;
            if (typeof this.loadZone === 'function') {
              this.loadZone(pt.targetZone);
            } else if (typeof this.changeZone === 'function') {
              this.changeZone(pt.targetZone);
            }
            this.showAlertBanner?.(`🌀 「${pt.label}」へワープしました！`, 1800);
          }
        });

        // 4) 画面右上のワープ距離ナビ＆「🎬 魔法スタジオ」ボタン
        let hud = document.getElementById('kmj-warp-compass-hud');
        if (!hud) {
          hud = document.createElement('div');
          hud.id = 'kmj-warp-compass-hud';
          document.body.appendChild(hud);
        }

        const arrows = ['⬆️', '↗️', '➡️', '↘️', '⬇️', '↙️', '⬅️', '↖️'];
        const pillsHtml = portals.map((pt, idx) => {
          const dx = pt.x - px;
          const dz = pt.z - pz;
          const dist = Math.round(Math.hypot(dx, dz));
          const deg = (Math.atan2(dx, -dz) * 180 / Math.PI + 360) % 360;
          const arrow = arrows[Math.round(deg / 45) % 8];
          return `<div class="kmj-warp-pill" data-pidx="${idx}"><span>${pt.label}</span><span style="color:#fde047;">${arrow} ${dist}m</span></div>`;
        }).join('');

        const fullHudHtml = `${pillsHtml}<button type="button" id="kmj-open-studio-hud-btn" class="kmj-studio-launch-btn">🎬 魔法エフェクトスタジオ</button>`;
        if (hud._lastHtml !== fullHudHtml) {
          hud._lastHtml = fullHudHtml;
          hud.innerHTML = fullHudHtml;
          hud.querySelectorAll('.kmj-warp-pill').forEach(el => {
            el.onclick = () => {
              const pt = portals[Number(el.dataset.pidx)];
              if (!pt) return;
              // タップでワープ判定リングのすぐ手前（1.5m手前）へワープ移動！
              this.player.pos.x = pt.x;
              this.player.pos.z = pt.z + 2.8;
              this.showAlertBanner?.(`🌀 「${pt.label}」の前に移動しました（そのまま進むとワープ！）`, 1800);
            };
          });
          const stBtn = hud.querySelector('#kmj-open-studio-hud-btn');
          if (stBtn) {
            stBtn.onclick = () => {
              if (window.KMJ_SKILL_FX_V9?.openStudioModal) {
                window.KMJ_SKILL_FX_V9.openStudioModal(this);
              } else {
                this.showAlertBanner?.('⚠️ game9.js を読み込んでください', 1800);
              }
            };
          }
        }
      },

      // =========================================================
      // B. 顔90度回転＆球体めり込み完全修正 ＋ 武器の杖撤廃＆剣1本化
      // =========================================================
      fixFacesAndWeaponsV8() {
        if (typeof THREE === 'undefined') return;
        const d = this.saveData || {};

        if (typeof WEAPONS !== 'undefined' && WEAPONS) {
          (Array.isArray(WEAPONS) ? WEAPONS : Object.values(WEAPONS)).forEach(w => {
            if (!w || typeof w !== 'object') return;
            if (typeof w.name === 'string') {
              w.name = w.name.replace(/（魔導杖）/g, '').replace(/杖|ロッド|スタッフ/g, '剣');
            }
          });
        }

        const fixCube = (grp, faceStr, bg, bd) => {
          if (!grp) return;
          let body = null, maxV = 0;
          const oldFaces = [];
          grp.children.forEach(ch => {
            if (!ch.isMesh || !ch.geometry) return;
            const gt = ch.geometry.type || '', pm = ch.geometry.parameters || {};
            if (gt === 'BoxGeometry') {
              const v = (pm.width || 1) * (pm.height || 1) * (pm.depth || 1);
              if (v > maxV && (pm.depth || 0) >= 0.35) { maxV = v; body = ch; }
              else if ((pm.depth || 1) <= 0.15) oldFaces.push(ch);
            } else if (gt === 'PlaneGeometry' || ch.material?.map?.image) {
              oldFaces.push(ch);
            }
          });
          if (!body) return;
          const pm = body.geometry.parameters || {};
          const bw = (pm.width || 1) * (body.scale?.x || 1);
          const bh = (pm.height || 1) * (body.scale?.y || 1);
          const bdZ = (pm.depth || 1) * (body.scale?.z || 1);
          const frontZ = body.position.z + bdZ * 0.5;

          const tex = makeHorizontalFaceTexV8(faceStr, bg, bd);
          let fm = oldFaces[0];
          if (!fm) {
            fm = new THREE.Mesh(new THREE.PlaneGeometry(bw * 0.78, bh * 0.56), new THREE.MeshBasicMaterial({ map: tex }));
            grp.add(fm);
          } else {
            fm.geometry = new THREE.PlaneGeometry(bw * 0.78, bh * 0.56);
            fm.material = new THREE.MeshBasicMaterial({ map: tex, side: THREE.FrontSide });
          }
          fm.position.set(body.position.x, body.position.y + bh * 0.02, frontZ + 0.026);
          fm.rotation.set(0, 0, 0);
          fm.scale.set(1, 1, 1);
          for (let i = 1; i < oldFaces.length; i++) grp.remove(oldFaces[i]);
        };

        if (this.player?.group) {
          fixCube(this.player.group, d.kaomoji || d.face || this.player.kaomoji || '(´・ω・`)', '#0f294a', '#38bdf8');
          const staff = this.player.group.getObjectByName?.('mage_staff_weapon');
          if (staff) this.player.group.remove(staff);
          const swords = this.player.group.children.filter(c => /sword|weapon|blade|wpn|katana/i.test(c.name || ''));
          for (let i = 0; i < swords.length - 1; i++) this.player.group.remove(swords[i]);
        }

        if (Array.isArray(this.npcs)) {
          this.npcs.forEach(n => { if (n?.group) fixCube(n.group, n.kaomoji || n.face || '(^o^)/', '#1e293b', '#fbbf24'); });
        }

        const petGrp = this.pet?.group || this.pet?.mesh;
        if (petGrp) {
          let frontZ = 0.42, centerY = 0.62, r = 0.45;
          const pFaces = [];
          petGrp.traverse(o => {
            if (!o.isMesh || !o.geometry) return;
            const gt = o.geometry.type || '', pm = o.geometry.parameters || {};
            if (o.material?.map?.image || gt === 'PlaneGeometry') pFaces.push(o);
            else if (gt === 'SphereGeometry') {
              r = (pm.radius || 0.45) * (o.scale?.z || 1);
              frontZ = Math.max(frontZ, o.position.z + r);
              centerY = o.position.y;
            } else if (gt === 'BoxGeometry' && (pm.depth || 0) >= 0.35) {
              r = (pm.depth * 0.5) * (o.scale?.z || 1);
              frontZ = Math.max(frontZ, o.position.z + r);
              centerY = o.position.y;
            }
          });
          const pInfo = typeof this.getMyPetSyncInfo === 'function' ? this.getMyPetSyncInfo() : null;
          const pTex = makeHorizontalFaceTexV8(pInfo?.kaomoji || this.pet?.kaomoji || '(・ω・)', '#0c4a6e', '#7dd3fc');
          let pf = pFaces[0];
          if (!pf) {
            pf = new THREE.Mesh(new THREE.PlaneGeometry(r * 1.15, r * 0.85), new THREE.MeshBasicMaterial({ map: pTex }));
            petGrp.add(pf);
          } else {
            pf.geometry = new THREE.PlaneGeometry(r * 1.15, r * 0.85);
            pf.material = new THREE.MeshBasicMaterial({ map: pTex, side: THREE.FrontSide });
          }
          pf.position.set(0, centerY, frontZ + 0.065);
          pf.rotation.set(0, 0, 0);
          pf.scale.set(1, 1, 1);
        }
      },

      // =========================================================
      // C. 素のMP消費5倍（最低50〜）同期
      // =========================================================
      getSkillDataV8(slotOrSkill = 0) {
        if (window.KMJ_SKILL_FX_V9?.getSkillInfo) {
          return window.KMJ_SKILL_FX_V9.getSkillInfo(this, slotOrSkill);
        }
        const d = this.saveData || {};
        let slotIdx = typeof slotOrSkill === 'number' ? slotOrSkill : 0;
        let raw = null, skillLv = 1;
        if (typeof slotOrSkill === 'object' && slotOrSkill !== null) {
          raw = slotOrSkill;
          const sid = String(raw.id || raw.skillId || '');
          skillLv = Math.max(1, Number(d.skillLevels?.[sid] ?? d.skillLvs?.[sid] ?? raw.lv ?? raw.level ?? 1));
        } else if (typeof this.resolveSkillMeta === 'function') {
          const meta = this.resolveSkillMeta(slotIdx);
          if (meta) {
            skillLv = Math.max(1, Number(meta.skillLv || 1));
            if (typeof SKILLS !== 'undefined' && SKILLS) {
              const list = Array.isArray(SKILLS) ? SKILLS : Object.values(SKILLS);
              raw = list.find(s => s && (String(s.id) === String(meta.skillId) || String(s.skillId) === String(meta.skillId))) || list[slotIdx] || null;
            }
          }
        }
        const defOrig = [20, 26, 22, 16, 30][slotIdx] || 15;
        if (raw && raw._origMpV8 === undefined) {
          const cur = Number(raw.mpCost ?? raw.mp ?? raw.costMp ?? 0);
          raw._origMpV8 = cur > 0 ? cur : defOrig;
        }
        const origMp = raw?._origMpV8 || defOrig;
        const mpCost = Math.max(50, Math.floor(origMp * 5 * (1 + (skillLv - 1) * 0.08)));
        return { raw, slotIdx, skillLv, mpCost, evolvedName: raw?.name || `スキル${slotIdx + 1}` };
      },

      syncAllSkillsV8() {
        if (window.KMJ_SKILL_FX_V9?.syncAllSkills) {
          window.KMJ_SKILL_FX_V9.syncAllSkills(this);
          return;
        }
        if (typeof SKILLS !== 'undefined' && SKILLS) {
          (Array.isArray(SKILLS) ? SKILLS : Object.values(SKILLS)).forEach(sk => {
            if (!sk || typeof sk !== 'object') return;
            const info = this.getSkillDataV8(sk);
            if ('mpCost' in sk) sk.mpCost = info.mpCost;
            if ('mp' in sk) sk.mp = info.mpCost;
            if ('costMp' in sk) sk.costMp = info.mpCost;
          });
        }
        document.querySelectorAll('.skill-slot-btn, .skill-slot, .skill-btn, [data-skill-slot]').forEach((btn, idx) => {
          const slot = btn.dataset.skillSlot !== undefined ? Number(btn.dataset.skillSlot) : idx;
          const info = this.getSkillDataV8(slot);
          btn.querySelectorAll('span, div, small, b').forEach(el => {
            if (el.children.length > 0) return;
            const txt = (el.textContent || '').trim();
            if (/^\d+$/.test(txt) && Number(txt) < 50) el.textContent = String(info.mpCost);
          });
        });
      },

      // =========================================================
      // D. 格上1.5倍線形加算・全称号＆実績パッシブ・ペット火力参照
      // =========================================================
      normalizeHigherLevelMonstersV8() {
        if (!Array.isArray(this.monsters)) return;
        const pLv = Math.max(1, Number(this.saveData?.lv ?? this.saveData?.level ?? this.player?.lv ?? 1));
        this.monsters.forEach(m => {
          if (!m || m.dead) return;
          const mLv = Math.max(1, Number(m.lv ?? m.level ?? 1));
          const diff = Math.max(0, mLv - pLv);
          if (!m._rawNameV8 && typeof m.name === 'string') m._rawNameV8 = m.name.replace(/^【格上】\s*/g, '');
          if (m._rawNameV8) m.name = diff > 0 ? `【格上】${m._rawNameV8}` : m._rawNameV8;
          if (!m._rawCapV8) {
            m._rawCapV8 = true;
            m._rAtk = Math.max(1, Number(m.atk) || 10);
            m._rHp = Math.max(10, Number(m.maxHp || m.hp) || 30);
            m._rExp = Math.max(1, Number(m.exp || m.expReward) || 10);
            m._rGold = Math.max(1, Number(m.gold || m.goldReward) || 5);
          }
          const mult = 1 + 1.5 * diff;
          m.atk = Math.floor(m._rAtk * mult);
          const nHp = Math.floor(m._rHp * mult);
          if (m.maxHp !== nHp) {
            const ratio = m.maxHp > 0 ? Math.min(1, Math.max(0, (Number(m.hp) || 0) / m.maxHp)) : 1;
            m.maxHp = nHp;
            if (typeof m.hp === 'number') m.hp = Math.max(1, Math.round(nHp * ratio));
          }
          if ('exp' in m) m.exp = Math.floor(m._rExp * mult);
          if ('expReward' in m) m.expReward = Math.floor(m._rExp * mult);
          if ('gold' in m) m.gold = Math.floor(m._rGold * mult);
          if ('goldReward' in m) m.goldReward = Math.floor(m._rGold * mult);
        });
      },

      getAllPassivesV8() {
        const d = this.saveData || {};
        const countOwned = (gVar, keys) => {
          const list = (typeof gVar !== 'undefined' && gVar) ? (Array.isArray(gVar) ? gVar : Object.values(gVar)) : [];
          const set = new Set();
          keys.forEach(k => {
            const v = d[k];
            if (Array.isArray(v)) v.forEach(x => { if (typeof x === 'string') set.add(x); else if (x?.unlocked || x?.earned || x?.completed) set.add(String(x.id || x.name || '')); });
            else if (v && typeof v === 'object') Object.entries(v).forEach(([id, val]) => { if (val === true || val?.unlocked || val?.earned || val?.completed) set.add(id); });
          });
          ['equippedTitle', 'currentTitle', 'activeTitle', 'title', 'titleId'].forEach(tk => { if (typeof d[tk] === 'string' && d[tk] && d[tk] !== 'none') set.add(d[tk]); });
          let u = 0;
          if (list.length > 0) {
            list.forEach((it, idx) => {
              const id = String(it.id || it.titleId || it.achId || `i_${idx}`);
              if (it.unlocked || it.earned || it.completed || set.has(id) || set.has(String(it.name || ''))) u++;
            });
            return { u, t: list.length };
          }
          return { u: Math.max(set.size, 1), t: Math.max(set.size, 1) };
        };
        const ttl = countOwned(typeof TITLES !== 'undefined' ? TITLES : null, ['titles', 'unlockedTitles', 'earnedTitles', 'titleUnlocked']);
        const ach = countOwned(typeof ACHIEVEMENTS !== 'undefined' ? ACHIEVEMENTS : null, ['achievements', 'unlockedAchievements', 'earnedAchievements', 'achUnlocked']);
        return {
          ttl, ach,
          statPct: ttl.u * 0.04 + ach.u * 0.03,
          hpPct: ttl.u * 0.05 + ach.u * 0.04,
          rewardPct: ttl.u * 0.05 + ach.u * 0.04
        };
      },

      syncPetPowerV8() {
        if (!this.pet) return;
        const st = typeof this.getPlayerStats === 'function' ? (this.getPlayerStats() || {}) : {};
        const ref = Math.max(10, Number(st.atk ?? this.saveData?.atk ?? 15), Number(st.matk ?? st.mAtk ?? 0));
        const pInfo = typeof this.getMyPetSyncInfo === 'function' ? this.getMyPetSyncInfo() : null;
        const pLv = Math.max(1, Number(pInfo?.lv || this.pet.lv || 1));
        const pAtk = Math.floor(ref * (0.75 + Math.min(1.5, (pLv - 1) * 0.015)));
        this.pet.atk = pAtk; this.pet.attack = pAtk; this.pet.power = pAtk; this.pet.dmg = pAtk;
      },

      getCurrentClassV8() {
        const raw = String(this.saveData?.evolutionId ?? this.saveData?.classId ?? 'novice');
        return CLASS_TREE_V8.find(c => c.id === raw) || CLASS_TREE_V8[0];
      }
    });

    ['getSkillMpCost', 'calcSkillMpCost', 'getSkillCost'].forEach(fn => {
      if (typeof P[fn] === 'function') P[fn] = function (s) { return this.getSkillDataV8(s).mpCost; };
    });

    if (typeof P.useSkillSlot === 'function' && !P._v8SkillHooked) {
      const origUse = P.useSkillSlot;
      P.useSkillSlot = function (slotIdx) {
        this.syncAllSkillsV8();
        const d = this.saveData;
        const info = this.getSkillDataV8(slotIdx);
        const curCd = (this.player?.skillCds?.[slotIdx] ?? this.skillCds?.[slotIdx] ?? 0);
        const mpBefore = Number(d?.mp ?? this.player?.mp ?? 0);

        if (curCd <= 0.05 && !this._debugInfiniteMode && mpBefore < info.mpCost) {
          this.showAlertBanner?.(`💧 MP不足！（必要MP: ${info.mpCost} / 現在: ${Math.floor(mpBefore)}）`, 1400);
          return;
        }
        const res = origUse.call(this, slotIdx);
        const cdAfter = (this.player?.skillCds?.[slotIdx] ?? this.skillCds?.[slotIdx] ?? 0);
        if (curCd <= 0.05 && cdAfter > 0.05) {
          if (!this._debugInfiniteMode) {
            const nextMp = Math.max(0, mpBefore - info.mpCost);
            if (d && typeof d.mp === 'number') d.mp = nextMp;
            if (this.player && typeof this.player.mp === 'number') this.player.mp = nextMp;
          }
          if (window.KMJ_SKILL_FX_V9?.castSkillEffect) {
            window.KMJ_SKILL_FX_V9.castSkillEffect(this, slotIdx);
          }
        }
        return res;
      };
      P._v8SkillHooked = true;
    }

    if (typeof P.getPlayerStats === 'function' && !P._v8StatsHooked) {
      const origSt = P.getPlayerStats;
      P.getPlayerStats = function () {
        const st = origSt.call(this);
        if (!st) return st;
        const cls = this.getCurrentClassV8();
        const pas = this.getAllPassivesV8();
        if (typeof st.atk === 'number') st.atk = Math.floor(st.atk * cls.atk * (1 + pas.statPct));
        if (typeof st.matk === 'number') st.matk = Math.floor(st.matk * cls.atk * (1 + pas.statPct));
        if (typeof st.def === 'number') st.def = Math.floor(st.def * cls.def * (1 + pas.statPct));
        if (typeof st.maxHp === 'number') st.maxHp = Math.floor(st.maxHp * cls.hp * (1 + pas.hpPct));
        return st;
      };
      P._v8StatsHooked = true;
    }

    if (typeof P.renderModalContent === 'function' && !P._v8ModalHooked) {
      const origMd = P.renderModalContent;
      P.renderModalContent = function () {
        this.syncAllSkillsV8();
        origMd.call(this);
        const body = document.getElementById('modal-body');
        if (!body) return;
        const tab = String(this.activeTab || '').toLowerCase();
        const txt = body.textContent || '';
        const d = this.saveData || {};
        const pLv = Math.max(1, Number(d.lv ?? d.level ?? 1));
        const gold = Number(d.gold ?? d.coins ?? 0);

        if (/stat|evo|job|class/.test(tab)) {
          const cur = this.getCurrentClassV8();
          if (!Array.isArray(d.unlockedClassesClean)) d.unlockedClassesClean = ['novice'];
          const cards = CLASS_TREE_V8.map(c => {
            const isC = cur.id === c.id, isU = c.cost <= 0 || d.unlockedClassesClean.includes(c.id);
            const okLv = pLv >= c.reqLv || this._debugInfiniteMode;
            const lbl = isC ? '✅ 選択中' : (isU ? '🔄 切替(無料)' : (!okLv ? `🔒 Lv.${c.reqLv}` : `✨ 解放(${c.cost.toLocaleString()}G)`));
            return `<div style="background:#1e293b;border:1px solid ${isC ? '#34d399' : '#334155'};border-radius:7px;padding:6px;">
              <div style="font-size:11px;font-weight:900;color:#fff;">${c.icon} ${c.name}</div>
              <div style="font-size:9px;color:#f472b6;">${c.fxName}</div>
              <button type="button" class="v8-cls-btn" data-id="${c.id}" ${isC || (!isU && !okLv) ? 'disabled' : ''} style="margin-top:4px;width:100%;background:${isC ? '#059669' : '#0284c7'};border:none;color:#fff;border-radius:5px;padding:4px;font-size:10px;font-weight:900;">${lbl}</button>
            </div>`;
          }).join('');
          body.insertAdjacentHTML('afterbegin', `<div class="card-box" style="margin-bottom:8px;border-color:#38bdf8;"><b style="color:#7dd3fc;font-size:11px;">⚜️ Lv.999 クラス進化（現在: ${cur.name}）</b><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:5px;margin-top:5px;max-height:210px;overflow-y:auto;">${cards}</div></div>`);
          body.querySelectorAll('.v8-cls-btn').forEach(b => b.onclick = () => {
            const c = CLASS_TREE_V8.find(x => x.id === b.dataset.id);
            if (!c) return;
            if (!d.unlockedClassesClean.includes(c.id) && c.cost > 0) {
              if (gold < c.cost) { this.showAlertBanner?.('💰 ゴールド不足！', 1400); return; }
              d.gold = gold - c.cost; if ('coins' in d) d.coins = d.gold;
              d.unlockedClassesClean.push(c.id);
            }
            d.evolutionId = c.id; d.classId = c.id;
            this.saveGame?.(false); this.renderModalContent();
          });
        }

        if (/ach|title|trophy/.test(tab) || /称号|実績/.test(txt)) {
          const pas = this.getAllPassivesV8();
          body.querySelectorAll('button').forEach(btn => {
            if (/装備|装着|セット/.test(btn.textContent || '')) {
              btn.textContent = '✨ 常時パッシブ発動中'; btn.disabled = true; btn.style.background = '#065f46';
            }
          });
          body.insertAdjacentHTML('afterbegin', `<div class="card-box" style="margin-bottom:8px;border-color:#fbbf24;background:rgba(30,27,75,0.95);"><b style="color:#fde047;font-size:11.5px;">👑 全称号＆全実績 常時パッシブ発動中（装備不要）</b><div style="font-size:10px;color:#fff;margin-top:2px;">全ステ <b style="color:#4ade80;">+${Math.round(pas.statPct * 100)}%</b> / 最大HP <b style="color:#38bdf8;">+${Math.round(pas.hpPct * 100)}%</b> / 報酬 <b style="color:#fbbf24;">+${Math.round(pas.rewardPct * 100)}%</b></div></div>`);
        }

        window.KMJ_SKILL_FX_V9?.injectSkillPreviewUI?.(this, body, tab);
      };
      P._v8ModalHooked = true;
    }

    if (typeof P.updateRemotePlayers === 'function' && !P._v8LoopHooked) {
      const origLoop = P.updateRemotePlayers;
      P.updateRemotePlayers = function (dt) {
        origLoop.call(this, dt);
        installChatDragAndResizeHandles();
        this.updateWarpPortalsAndCompassV8();
        this.fixFacesAndWeaponsV8();
        this.syncPetPowerV8();
        this.normalizeHigherLevelMonstersV8();
      };
      P._v8LoopHooked = true;
    }

    setTimeout(() => {
      const g = window.game;
      if (g) {
        installChatDragAndResizeHandles();
        g.updateWarpPortalsAndCompassV8();
        g.fixFacesAndWeaponsV8();
        g.syncAllSkillsV8();
        g.syncPetPowerV8();
      }
    }, 300);
  }

  installV8Core();
  document.addEventListener('click', () => setTimeout(setupThreatControlsV8, 40), true);
  setTimeout(setupThreatControlsV8, 300);
})();
// ▲▲▲ ここまで【game8.js 決定版】 ▲▲▲
