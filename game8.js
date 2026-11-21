// ▼▼▼ ここから【game8.js 完全版 v111】左手の剣1本確実生成＆水平横振り・魔法スタジオのデバッグ限定化・ステージ選択ボタン削除・右上オンライン完全消去 ▼▼▼
(() => {
  'use strict';

  const MAX_LV_999 = 999;
  const MAX_THREAT_999 = 999;

  try {
    ['MAX_LV', 'MAX_LEVEL', 'LEVEL_CAP', 'MAX_PLAYER_LV', 'MAX_SKILL_LV'].forEach(k => { window[k] = MAX_LV_999; });
    ['MAX_THREAT_RANK', 'MAX_THREAT', 'THREAT_CAP', 'MAX_THREAT_LEVEL', 'MAX_DANGER', 'THREAT_MAX'].forEach(k => { window[k] = MAX_THREAT_999; });
  } catch (e) {}

  // =========================================================
  // 1. スタイル定義（チャットつまみ・デバッグ限定スタジオボタン）
  // =========================================================
  if (!document.getElementById('kmj-v8-ui-style')) {
    const st = document.createElement('style');
    st.id = 'kmj-v8-ui-style';
    st.textContent = `
      #kmj-v45-online-pill, [id*="online-pill"], [class*="online-pill"], #kmj-single-warp-nav {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
      #kmj-real-chat-move-bar {
        width: 100%;
        height: 24px;
        background: linear-gradient(90deg, #0f172a, #1d4ed8, #0f172a);
        border-bottom: 1.5px solid #38bdf8;
        border-radius: 8px 8px 0 0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        cursor: move;
        touch-action: none;
        user-select: none;
        color: #e0f2fe;
        font-size: 10.5px;
        font-weight: 900;
        letter-spacing: 0.04em;
        flex-shrink: 0;
      }
      #kmj-real-chat-resize-grip {
        position: absolute;
        right: 0px;
        bottom: 0px;
        width: 28px;
        height: 28px;
        background: linear-gradient(135deg, transparent 40%, #38bdf8 44%, #0284c7 100%);
        border-bottom-right-radius: 8px;
        cursor: nwse-resize;
        touch-action: none;
        user-select: none;
        z-index: 60;
        display: flex;
        align-items: flex-end;
        justify-content: flex-end;
        padding: 2px 3px;
        color: #ffffff;
        font-size: 12px;
        font-weight: 900;
        text-shadow: 0 1px 2px #000;
      }
      #kmj-warp-compass-hud {
        position: fixed;
        top: 64px;
        right: 12px;
        z-index: 950;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 5px;
        pointer-events: auto;
      }
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

  // =========================================================
  // 2. デバッグモード判定（魔法スタジオをデバッグ限定にする）
  // =========================================================
  function isDebugModeActiveV8(game) {
    if (!game) game = window.game;
    if (game?._debugInfiniteMode === true || game?.debugMode === true || game?.isDebug === true) return true;
    if (window._kmjDebugUnlocked === true || window.DEBUG_MODE === true) return true;
    try {
      if (localStorage.getItem('kmj_debug_mode') === '1') return true;
      if (/[?&]debug=1/i.test(window.location.search || '')) return true;
    } catch (e) {}

    const modal = document.getElementById('modal');
    if (modal && !modal.classList.contains('hidden')) {
      const mTxt = modal.textContent || '';
      if (/デバッグ|無敵モード|LvMAX|ゴールド追加|デバッグメニュー/.test(mTxt)) return true;
    }
    return false;
  }

  // =========================================================
  // 3. 右上の邪魔な「オンライン / 合言葉部屋」バーを永久非表示
  // =========================================================
  function hideTopRightOnlineBarV8() {
    document.getElementById('kmj-v45-online-pill')?.remove();
    const w = window.innerWidth || 800;
    const allEls = document.querySelectorAll('div, span, header, nav, section, aside');
    for (let i = 0; i < allEls.length; i++) {
      const el = allEls[i];
      if (!el || el.id === 'hud' || el.id === 'modal' || el.closest('#modal') || el.closest('#kmj-warp-compass-hud') || el.closest('#kmj-v9-studio-modal')) continue;
      if (el.dataset.v8HiddenOnline === '1') continue;
      const txt = (el.textContent || '').trim();
      if (!txt || txt.length > 60) continue;
      if (txt.includes('合言葉部屋') || /オンライン\s*\(\s*\d+\s*人\s*\)/.test(txt) || /^●?\s*オンライン/.test(txt)) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height < 85 && rect.right >= w - 420 && rect.top <= 115) {
          el.dataset.v8HiddenOnline = '1';
          el.style.setProperty('display', 'none', 'important');
          el.style.setProperty('visibility', 'hidden', 'important');
          el.style.setProperty('opacity', '0', 'important');
          el.style.setProperty('pointer-events', 'none', 'important');
        }
      }
    }
  }

  if (!window._v8OnlineObserver && typeof MutationObserver !== 'undefined') {
    window._v8OnlineObserver = new MutationObserver(() => {
      hideTopRightOnlineBarV8();
    });
    const startObs = () => {
      if (document.body) {
        window._v8OnlineObserver.observe(document.body, { childList: true, subtree: true, characterData: true });
      } else {
        setTimeout(startObs, 100);
      }
    };
    startObs();
  }

  // =========================================================
  // 4. チャット枠の移動つまみ＆右下リサイズつまみ
  // =========================================================
  function installChatDragAndResizeHandles() {
    const chatInput = Array.from(document.querySelectorAll('input')).find(inp =>
      /メッセージ|チャット|発言/.test(inp.placeholder || '')
    );
    if (!chatInput) return;

    let realChatBox = null;
    let cur = chatInput.parentElement;
    const maxAllowedW = (window.innerWidth || 800) * 0.72;

    while (cur && cur !== document.body) {
      const txt = cur.textContent || '';
      const rect = cur.getBoundingClientRect();
      if (txt.includes('全体チャット') && rect.width > 160 && rect.width < maxAllowedW && rect.height > 80) {
        realChatBox = cur;
        break;
      }
      cur = cur.parentElement;
    }
    if (!realChatBox) return;

    if (realChatBox.parentElement && realChatBox.parentElement !== document.body) {
      realChatBox.parentElement.style.pointerEvents = 'none';
    }
    realChatBox.style.pointerEvents = 'auto';

    let logArea = null;
    for (const ch of realChatBox.querySelectorAll('div')) {
      if (ch === realChatBox) continue;
      if ((ch.textContent || '').includes('全体チャットへようこそ') && !ch.querySelector('input')) {
        logArea = ch;
        break;
      }
    }

    if (!realChatBox.dataset.v8ChatReady) {
      const r = realChatBox.getBoundingClientRect();
      realChatBox.style.position = 'fixed';
      realChatBox.style.left = `${Math.max(6, Math.round(r.left || 12))}px`;
      realChatBox.style.top = `${Math.max(50, Math.round(r.top || (window.innerHeight - 250)))}px`;
      realChatBox.style.bottom = 'auto';
      realChatBox.style.right = 'auto';
      realChatBox.style.width = `${Math.max(240, Math.round(r.width || 300))}px`;
      realChatBox.style.boxSizing = 'border-box';
      realChatBox.style.display = 'flex';
      realChatBox.style.flexDirection = 'column';
      realChatBox.style.overflow = 'visible';
      realChatBox.dataset.v8ChatReady = '1';
    }

    if (!realChatBox.querySelector('#kmj-real-chat-move-bar')) {
      const moveBar = document.createElement('div');
      moveBar.id = 'kmj-real-chat-move-bar';
      moveBar.innerHTML = `<span>✥ 移動つまみ（ドラッグで移動）</span>`;
      realChatBox.insertBefore(moveBar, realChatBox.firstChild);

      let moving = false, sx = 0, sy = 0, ol = 0, ot = 0;
      const startM = (cx, cy) => {
        moving = true; sx = cx; sy = cy;
        const r = realChatBox.getBoundingClientRect();
        ol = r.left; ot = r.top;
      };
      const doM = (cx, cy) => {
        if (!moving) return;
        const maxL = Math.max(0, window.innerWidth - realChatBox.offsetWidth);
        const maxT = Math.max(0, window.innerHeight - realChatBox.offsetHeight);
        realChatBox.style.left = `${Math.max(0, Math.min(maxL, Math.round(ol + (cx - sx))))}px`;
        realChatBox.style.top = `${Math.max(0, Math.min(maxT, Math.round(ot + (cy - sy))))}px`;
      };
      const endM = () => { moving = false; };

      moveBar.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) { e.stopPropagation(); startM(e.touches[0].clientX, e.touches[0].clientY); }
      }, { passive: false });
      window.addEventListener('touchmove', (e) => {
        if (moving && e.touches.length > 0) { e.preventDefault(); doM(e.touches[0].clientX, e.touches[0].clientY); }
      }, { passive: false });
      window.addEventListener('touchend', endM);
      moveBar.addEventListener('mousedown', (e) => { e.preventDefault(); e.stopPropagation(); startM(e.clientX, e.clientY); });
      window.addEventListener('mousemove', (e) => { if (moving) doM(e.clientX, e.clientY); });
      window.addEventListener('mouseup', endM);
    }

    if (!realChatBox.querySelector('#kmj-real-chat-resize-grip')) {
      const grip = document.createElement('div');
      grip.id = 'kmj-real-chat-resize-grip';
      grip.textContent = '↘';
      realChatBox.appendChild(grip);

      let resizing = false, sx = 0, sy = 0, ow = 300, oh = 160, oLogH = 75;
      const startR = (cx, cy) => {
        resizing = true; sx = cx; sy = cy;
        const r = realChatBox.getBoundingClientRect();
        ow = r.width; oh = r.height;
        oLogH = logArea ? logArea.getBoundingClientRect().height : 75;
      };
      const doR = (cx, cy) => {
        if (!resizing) return;
        const dx = cx - sx, dy = cy - sy;
        const curLeft = realChatBox.getBoundingClientRect().left;
        const maxW = Math.min(620, window.innerWidth - curLeft - 6);
        realChatBox.style.width = `${Math.max(200, Math.min(maxW, Math.round(ow + dx)))}px`;
        if (logArea) {
          const nextLogH = Math.max(36, Math.min(320, Math.round(oLogH + dy)));
          logArea.style.height = `${nextLogH}px`;
          logArea.style.maxHeight = `${nextLogH}px`;
          logArea.style.overflowY = 'auto';
        } else {
          realChatBox.style.height = `${Math.max(110, Math.min(420, Math.round(oh + dy)))}px`;
        }
      };
      const endR = () => { resizing = false; };

      grip.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) { e.stopPropagation(); startR(e.touches[0].clientX, e.touches[0].clientY); }
      }, { passive: false });
      window.addEventListener('touchmove', (e) => {
        if (resizing && e.touches.length > 0) { e.preventDefault(); doR(e.touches[0].clientX, e.touches[0].clientY); }
      }, { passive: false });
      window.addEventListener('touchend', endR);
      grip.addEventListener('mousedown', (e) => { e.preventDefault(); e.stopPropagation(); startR(e.clientX, e.clientY); });
      window.addEventListener('mousemove', (e) => { if (resizing) doR(e.clientX, e.clientY); });
      window.addEventListener('mouseup', endR);
    }
  }

  // =========================================================
  // 5. 驚異度999・格上【格上】ラベル
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

  // =========================================================
  // 6. 純粋な戦士・剣士・騎士クラス進化ツリー
  // =========================================================
  const FORBIDDEN_MAGIC_JOB_REGEX = /魔法|魔導|賢者|メイジ|ウィザード|ソーサラー|スペル|アーク|杖|ロッド|スタッフ|spell|mage|wizard|sorcerer|sage|witch|warlock/i;

  const CLASS_TREE_V8 = [
    { id: 'novice', name: '見習い冒険者', icon: '🗡️', reqLv: 1, cost: 0, fxName: '蒼き光の水平斬撃波', atk: 1.0, def: 1.0, hp: 1.0, desc: '基本の冒険者クラス。' },
    { id: 'warrior', name: '重装戦士', icon: '⚔️', reqLv: 15, cost: 500, fxName: '紅蓮の豪快水平衝撃斬', atk: 1.28, def: 1.22, hp: 1.25, desc: 'Lv.15〜｜真紅のワイド水平スラッシュ。' },
    { id: 'fencer', name: '疾風の剣士', icon: '💨', reqLv: 15, cost: 500, fxName: '蒼穹の連撃水平剣閃', atk: 1.32, def: 1.12, hp: 1.18, desc: 'Lv.15〜｜鋭い蒼い水平剣閃を放つ。' },
    { id: 'paladin', name: '聖騎士（パラディン）', icon: '🛡️', reqLv: 50, cost: 2500, fxName: '黄金の聖光水平十字斬', atk: 1.48, def: 1.55, hp: 1.50, desc: 'Lv.50〜｜聖なる水平斬撃を放つ。' },
    { id: 'berserker', name: '剛剣の覇者', icon: '🔥', reqLv: 50, cost: 2500, fxName: '紅蓮烈火の剛剣水平波', atk: 1.65, def: 1.30, hp: 1.40, desc: 'Lv.50〜｜圧倒的破壊力の剛剣水平波。' },
    { id: 'ninja', name: '疾風の影忍者', icon: '🌪️', reqLv: 100, cost: 6000, fxName: '翠嵐の三連疾風水平刃', atk: 1.75, def: 1.40, hp: 1.48, desc: 'Lv.100〜｜三連水平斬撃波と旋風を起こす。' },
    { id: 'blade_master', name: '蒼穹の剣聖', icon: '⚡', reqLv: 200, cost: 15000, fxName: '次元断ち・蒼雷水平斬', atk: 2.08, def: 1.68, hp: 1.78, desc: 'Lv.200〜｜稲妻水平斬撃。' },
    { id: 'dragoon', name: '紅蓮の竜騎士', icon: '🐉', reqLv: 350, cost: 35000, fxName: '竜王の業火ブレイブ水平斬', atk: 2.52, def: 2.08, hp: 2.18, desc: 'Lv.350〜｜紅蓮の炎と竜の水平斬撃。' },
    { id: 'emperor_blade', name: '覇王・天帝剣神', icon: '👑', reqLv: 550, cost: 80000, fxName: '天帝覇王・黄金水平螺旋斬', atk: 3.15, def: 2.65, hp: 2.80, desc: 'Lv.550〜｜黄金神環と水平斬撃波。' },
    { id: 'void_overlord', name: '虚空の創世剣帝', icon: '🌌', reqLv: 750, cost: 150000, fxName: 'アビスノヴァ・黒蝕水平次元斬', atk: 3.65, def: 3.05, hp: 3.20, desc: 'Lv.750〜｜漆黒重力輪とネオン紫水平斬。' },
    { id: 'mythic_god', name: '創世神話・アルティメット顔文字神', icon: '🌈', reqLv: 999, cost: 500000, fxName: '創世神話・虹翼天翔水平ノヴァ斬', atk: 4.50, def: 3.80, hp: 4.00, desc: 'Lv.999〜｜全属性の虹翼水平ノヴァ斬。' }
  ];

  function purgeGlobalMagicClassesV8() {
    ['EVOLUTIONS', 'CLASSES', 'JOBS', 'CLASS_LIST', 'EVOLUTION_TREE'].forEach(gName => {
      try {
        const gObj = window[gName];
        if (!gObj) return;
        if (Array.isArray(gObj)) {
          for (let i = gObj.length - 1; i >= 0; i--) {
            const item = gObj[i];
            const str = `${item?.id || ''} ${item?.name || ''} ${item?.desc || ''}`;
            if (FORBIDDEN_MAGIC_JOB_REGEX.test(str)) gObj.splice(i, 1);
          }
        } else if (typeof gObj === 'object') {
          Object.keys(gObj).forEach(k => {
            const item = gObj[k];
            const str = `${k} ${item?.id || ''} ${item?.name || ''} ${item?.desc || ''}`;
            if (FORBIDDEN_MAGIC_JOB_REGEX.test(str)) delete gObj[k];
          });
        }
      } catch (e) {}
    });
  }

  // =========================================================
  // 7. 【完全修正】左手の剣を1本だけ確実に構築＆水平横振りするエンジン
  // =========================================================
  function getWeaponVisualColorsV8(game) {
    const d = game?.saveData || {};
    let wpnObj = null;
    let wpnIdx = 0;
    let wList = [];
    if (typeof WEAPONS !== 'undefined' && WEAPONS) {
      wList = (Array.isArray(WEAPONS) ? WEAPONS : Object.values(WEAPONS)).filter(w => w && typeof w === 'object');
    }
    const rawId = d.equippedWeapon ?? d.weaponId ?? d.weapon ?? d.equip?.weapon;
    if (rawId && typeof rawId === 'object') {
      wpnObj = rawId;
    } else if (rawId !== undefined && rawId !== null && wList.length > 0) {
      const idx = wList.findIndex(w => String(w.id) === String(rawId) || String(w.name) === String(rawId));
      if (idx >= 0) { wpnObj = wList[idx]; wpnIdx = idx; }
      else if (typeof rawId === 'number' && wList[rawId]) { wpnObj = wList[rawId]; wpnIdx = rawId; }
    }
    if (!wpnObj && wList.length > 0) wpnObj = wList[0];

    const name = String(wpnObj?.name || d.weaponName || '');
    const key = `${name}|${wpnIdx}`;

    if (/炎|火|紅蓮|ブレイズ|太陽/i.test(name)) return { key, blade: 0xf87171, edge: 0xfef08a, guard: 0xf59e0b, len: 1.25 };
    if (/氷|吹雪|零度|アイス/i.test(name)) return { key, blade: 0x7dd3fc, edge: 0xffffff, guard: 0x38bdf8, len: 1.25 };
    if (/雷|電|サンダー|紫電/i.test(name)) return { key, blade: 0xfde047, edge: 0xffffff, guard: 0xa855f7, len: 1.28 };
    if (/風|嵐|疾風|翠嵐/i.test(name)) return { key, blade: 0x6ee7b7, edge: 0xffffff, guard: 0x10b981, len: 1.25 };
    if (/闇|黒|ダーク|アビス|魔剣/i.test(name)) return { key, blade: 0xc084fc, edge: 0xf43f5e, guard: 0x312e81, len: 1.32 };
    if (/聖|黄金|エクスカリバー|神|創世/i.test(name)) return { key, blade: 0xfef08a, edge: 0xffffff, guard: 0xf59e0b, len: 1.38 };
    if (wpnIdx >= 3) return { key, blade: 0x93c5fd, edge: 0xffffff, guard: 0xfacc15, len: 1.22 };
    return { key, blade: 0xcbd5e1, edge: 0xf8fafc, guard: 0xfacc15, len: 1.12 };
  }

  function enforceSingleLeftSwordAndHorizontalSwing(game) {
    if (typeof THREE === 'undefined' || !game?.player) return;
    const player = game.player;
    const rootObj = player.group || player.mesh;
    if (!rootObj) return;

    rootObj.updateMatrixWorld?.(true);

    // 1. 体のメイン立方体（BoxGeometry）と丸い手（SphereGeometry）の位置を特定
    let bodyMesh = null;
    let maxBodyVol = 0;
    let handSphereX = null;

    rootObj.traverse(ch => {
      if (!ch.isMesh || !ch.geometry) return;
      const gt = ch.geometry.type || '';
      const pm = ch.geometry.parameters || {};
      if (gt === 'BoxGeometry') {
        const v = (pm.width || 1) * (pm.height || 1) * (pm.depth || 1);
        if (v > maxBodyVol && (pm.depth || 0) >= 0.35) {
          maxBodyVol = v;
          bodyMesh = ch;
        }
      } else if (gt === 'SphereGeometry' && !ch.userData?.isV8SwordPart) {
        const wp = new THREE.Vector3();
        ch.getWorldPosition(wp);
        const lp = rootObj.worldToLocal(wp.clone());
        if (Math.abs(lp.x) > 0.25) handSphereX = lp.x;
      }
    });

    const bodyX = bodyMesh ? bodyMesh.position.x : 0;
    const bodyY = bodyMesh ? bodyMesh.position.y : 0.6;
    const bodyW = bodyMesh ? ((bodyMesh.geometry.parameters?.width || 1) * (bodyMesh.scale?.x || 1)) : 1.0;

    // 2. ゲーム本体側が自動生成した重複剣メッシュ（側面にある立方体・円柱パーツ）をすべて安全に非表示化（scaleは触らない）
    rootObj.traverse(m => {
      if (!m.isMesh || m === bodyMesh || m.userData?.isV8SwordPart) return;
      if (m.geometry?.type === 'PlaneGeometry' || m.material?.map?.image) return; // 顔パネルは残す
      if (m.geometry?.type === 'SphereGeometry') return; // 丸い手は残す

      const wp = new THREE.Vector3();
      m.getWorldPosition(wp);
      const lp = rootObj.worldToLocal(wp.clone());

      // 体の左右側面（|x - bodyX| > bodyW * 0.32）にある本体側の武器パーツを非表示化
      if (Math.abs(lp.x - bodyX) > bodyW * 0.32) {
        // 頭頂部の双葉は残す
        if (lp.y > bodyY + 0.55 && Math.abs(lp.x - bodyX) < bodyW * 0.45) return;
        m.visible = false;
      }
    });

    // 3. 左手側（丸い手がある側の反対＝画面向かって右側）のX座標を決定
    const swordSideSign = (handSphereX !== null && handSphereX < bodyX) ? 1 : 1;
    const gripX = bodyX + swordSideSign * (bodyW * 0.64);
    const gripY = Math.max(0.32, bodyY - 0.14);
    const gripZ = 0.08;

    // 4. V8専用の1本の美しい剣ピボット（持ち手原点）を取得または新規作成
    let swingPivot = rootObj.getObjectByName('V8_LEFT_SWORD_PIVOT');
    const visCfg = getWeaponVisualColorsV8(game);

    if (!swingPivot || swingPivot.userData?.wpnKey !== visCfg.key) {
      if (swingPivot) rootObj.remove(swingPivot);

      swingPivot = new THREE.Group();
      swingPivot.name = 'V8_LEFT_SWORD_PIVOT';
      swingPivot.userData = { wpnKey: visCfg.key };

      const markPart = (mesh) => {
        mesh.userData.isV8SwordPart = true;
        mesh.visible = true;
        swingPivot.add(mesh);
      };

      // ① グリップ（持ち手：原点 0,0,0 を中心に配置＝ここが回転軸になる！）
      const handle = new THREE.Mesh(
        new THREE.BoxGeometry(0.11, 0.34, 0.11),
        new THREE.MeshBasicMaterial({ color: 0x451a03 })
      );
      handle.position.set(0, 0.02, 0);
      markPart(handle);

      // ② 柄頭（ポンメル）
      const pommel = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.09, 0.16),
        new THREE.MeshBasicMaterial({ color: visCfg.guard })
      );
      pommel.position.set(0, -0.16, 0);
      markPart(pommel);

      // ③ 黄金の鍔（クロスガード）
      const guard = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.11, 0.18),
        new THREE.MeshBasicMaterial({ color: visCfg.guard })
      );
      guard.position.set(0, 0.21, 0);
      markPart(guard);

      // ④ メイン刀身（ブレード）
      const bladeLen = visCfg.len;
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(0.17, bladeLen, 0.06),
        new THREE.MeshBasicMaterial({ color: visCfg.blade })
      );
      blade.position.set(0, 0.26 + bladeLen * 0.5, 0);
      markPart(blade);

      // ⑤ 刀身の輝きセンターライン
      const edgeLine = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, bladeLen * 0.96, 0.072),
        new THREE.MeshBasicMaterial({ color: visCfg.edge })
      );
      edgeLine.position.set(0, 0.26 + bladeLen * 0.5, 0);
      markPart(edgeLine);

      // ⑥ 切っ先（先端の尖り）
      const tip = new THREE.Mesh(
        new THREE.ConeGeometry(0.12, 0.24, 4),
        new THREE.MeshBasicMaterial({ color: visCfg.edge })
      );
      tip.rotation.y = Math.PI * 0.25;
      tip.position.set(0, 0.26 + bladeLen + 0.11, 0);
      markPart(tip);

      rootObj.add(swingPivot);
    }

    swingPivot.visible = true;
    swingPivot.position.set(gripX, gripY, gripZ);

    // 5. 持ち手（ピボット原点）を軸にした水平横振りモーション！
    const animT = Number(player.attackAnimTimer || 0);
    const tNow = performance.now() * 0.004;

    if (animT > 0) {
      // 攻撃中：0.36秒かけて刀身を地面と水平に倒し、右側から左側へ一気に水平横振り！
      const prog = 1 - Math.min(1, animT / 0.36);
      swingPivot.rotation.x = Math.PI * 0.48;
      swingPivot.rotation.y = -1.35 + Math.sin(prog * Math.PI * 0.85) * 2.95;
      swingPivot.rotation.z = -0.12;
    } else {
      // 通常待機中：少し前に傾けて構え、呼吸に合わせて滑らかに揺れる
      swingPivot.rotation.x = 0.28 + Math.sin(tNow) * 0.06;
      swingPivot.rotation.y = Math.cos(tNow * 0.8) * 0.08;
      swingPivot.rotation.z = -0.14 + Math.sin(tNow) * 0.04;
    }
  }

  function hookWebGLRendererRenderV8() {
    if (typeof THREE === 'undefined' || !THREE.WebGLRenderer) {
      setTimeout(hookWebGLRendererRenderV8, 100);
      return;
    }
    const RP = THREE.WebGLRenderer.prototype;
    if (RP._v8RenderHooked) return;
    RP._v8RenderHooked = true;
    const origRender = RP.render;
    RP.render = function (scene, camera, ...rest) {
      if (window.game) {
        try {
          enforceSingleLeftSwordAndHorizontalSwing(window.game);
        } catch (e) {}
      }
      return origRender.call(this, scene, camera, ...rest);
    };
  }
  hookWebGLRendererRenderV8();

  // =========================================================
  // 8. コア機能インストール
  // =========================================================
  function installV8Core() {
    if (typeof KaomojiMMORPG === 'undefined') {
      setTimeout(installV8Core, 100);
      return;
    }

    const P = KaomojiMMORPG.prototype;
    if (P._v8CoreInstalled) return;
    P._v8CoreInstalled = true;

    purgeGlobalMagicClassesV8();
    P.alignAvatarFaceStrictly = function () {};

    // game9.js のスタジオUI注入もデバッグモード限定に制限
    if (window.KMJ_SKILL_FX_V9 && typeof window.KMJ_SKILL_FX_V9.injectSkillPreviewUI === 'function' && !window.KMJ_SKILL_FX_V9._v8DebugGated) {
      const origInject = window.KMJ_SKILL_FX_V9.injectSkillPreviewUI;
      window.KMJ_SKILL_FX_V9.injectSkillPreviewUI = function (game, body, tab) {
        if (!isDebugModeActiveV8(game)) return;
        return origInject.call(this, game, body, tab);
      };
      window.KMJ_SKILL_FX_V9._v8DebugGated = true;
    }

    Object.assign(P, {
      // A. 真の最大MP成長（Lv101頭打ち解消）＆ 毎秒スムーズMP自然回復
      updateMpGrowthAndRegenV8(dt = 0.016) {
        const d = this.saveData;
        if (!d) return;

        const curEvo = String(d.evolutionId || '');
        const curCls = String(d.classId || '');
        if (FORBIDDEN_MAGIC_JOB_REGEX.test(curEvo)) d.evolutionId = 'warrior';
        if (FORBIDDEN_MAGIC_JOB_REGEX.test(curCls)) d.classId = 'warrior';

        const pLv = Math.max(1, Number(d.lv ?? d.level ?? this.player?.lv ?? 1));
        const pas = this.getAllPassivesV8();
        const cls = this.getCurrentClassV8();

        let baseStatMp = 0;
        if (typeof this.getPlayerStats === 'function') {
          const st = this.getPlayerStats();
          if (st && typeof st.maxMp === 'number') baseStatMp = Math.floor(st.maxMp);
        }
        const levelScaledMaxMp = Math.floor((100 + (pLv - 1) * 20) * (1 + (cls.atk - 1) * 0.35 + pas.hpPct * 0.5));
        const realMaxMp = Math.max(baseStatMp, levelScaledMaxMp, 100);

        if (!this._v8MpInitialized) {
          this._v8MpInitialized = true;
          const oldCur = Number(this.player?.mp ?? d.mp ?? realMaxMp);
          const initMp = oldCur <= 105 ? realMaxMp : Math.min(realMaxMp, oldCur);
          d.maxMp = realMaxMp;
          d.mp = initMp;
          if (this.player) {
            this.player.maxMp = realMaxMp;
            this.player.mp = initMp;
          }
          this._v8LastPlayerMp = initMp;
          this._v8LastSaveMp = initMp;
          return;
        }

        d.maxMp = realMaxMp;
        if (this.player) this.player.maxMp = realMaxMp;

        const pMp = typeof this.player?.mp === 'number' ? this.player.mp : realMaxMp;
        const sMp = typeof d.mp === 'number' ? d.mp : pMp;
        let curMp = Math.min(pMp, sMp);

        if (pMp > this._v8LastPlayerMp + 0.5) curMp = pMp;
        else if (sMp > this._v8LastSaveMp + 0.5) curMp = sMp;

        const stepDt = Math.min(0.1, Math.max(0.001, dt || 0.016));
        if (curMp < realMaxMp) {
          const regenPerSec = Math.max(12, realMaxMp * 0.08);
          curMp = Math.min(realMaxMp, curMp + regenPerSec * stepDt);
        }

        d.mp = curMp;
        if (this.player) this.player.mp = curMp;
        this._v8LastPlayerMp = curMp;
        this._v8LastSaveMp = curMp;
      },

      // B. ワープゾーン一本化（ステージ選択ボタン削除・デバッグ限定魔法スタジオHUD）
      updateSingleStageWarpAndHudV8() {
        if (!this.scene || !this.player?.pos) return;

        if (Array.isArray(this._v8WarpBeacons)) {
          this._v8WarpBeacons.forEach(b => { if (b?.grp) this.scene.remove(b.grp); });
          this._v8WarpBeacons = [];
        }
        const toRemove = [];
        this.scene.children.forEach(ch => {
          if (ch.userData?.isV8WarpBeacon) toRemove.push(ch);
        });
        toRemove.forEach(ch => this.scene.remove(ch));

        let hud = document.getElementById('kmj-warp-compass-hud');
        const debugOn = isDebugModeActiveV8(this);

        if (!debugOn) {
          if (hud) hud.remove();
          return;
        }

        if (!hud) {
          hud = document.createElement('div');
          hud.id = 'kmj-warp-compass-hud';
          document.body.appendChild(hud);
        }

        const fullHtml = `<button type="button" id="kmj-open-studio-hud-btn" class="kmj-studio-launch-btn">🎬 魔法スタジオ (DEBUG)</button>`;
        if (hud._lastHtml !== fullHtml) {
          hud._lastHtml = fullHtml;
          hud.innerHTML = fullHtml;
          const stBtn = hud.querySelector('#kmj-open-studio-hud-btn');
          if (stBtn) {
            stBtn.onclick = () => {
              window.KMJ_SKILL_FX_V9?.openStudioModal?.(this);
            };
          }
        }
      },

      // C. 顔パネル修正＆武器名クリーンアップ
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

        const pRoot = this.player?.group || this.player?.mesh;
        if (pRoot) {
          fixCube(pRoot, d.kaomoji || d.face || this.player.kaomoji || '(´・ω・`)', '#0f294a', '#38bdf8');
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

        enforceSingleLeftSwordAndHorizontalSwing(this);
      },

      // D. 全14種スキル MP消費（元MP×5 + 1Lv毎+10）
      getSkillDataV8(slotOrSkill = 0) {
        if (window.KMJ_SKILL_FX_V9?.getSkillInfo) {
          return window.KMJ_SKILL_FX_V9.getSkillInfo(this, slotOrSkill);
        }
        const d = this.saveData || {};
        let slotIdx = typeof slotOrSkill === 'number' ? slotOrSkill : 0;
        let raw = null;
        let skillLv = 1;

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

        const defOrig = [9, 14, 12, 16, 26, 22, 24, 30, 20, 22, 28, 18, 32, 40][slotIdx] || 16;
        if (raw && raw._origMpV8 === undefined) {
          const cur = Number(raw.mpCost ?? raw.mp ?? raw.costMp ?? 0);
          raw._origMpV8 = cur > 0 ? cur : defOrig;
        }
        const origMp = raw?._origMpV8 || defOrig;
        const mpCost = (origMp * 5) + (skillLv - 1) * 10;
        return { raw, slotIdx, skillLv, origMp, mpCost, evolvedName: raw?.name || `スキル${slotIdx + 1}` };
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
      },

      // E. 格上1.5倍・全称号＆実績パッシブ・ペット火力・クラス
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
        this.updateMpGrowthAndRegenV8(0.016);
        this.syncAllSkillsV8();
        const d = this.saveData;
        const info = this.getSkillDataV8(slotIdx);
        const curCd = (this.player?.skillCds?.[slotIdx] ?? this.skillCds?.[slotIdx] ?? 0);
        const mpBefore = Number(this.player?.mp ?? d?.mp ?? 0);

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
            this._v8LastPlayerMp = nextMp;
            this._v8LastSaveMp = nextMp;
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
        const pLv = Math.max(1, Number(this.saveData?.lv ?? this.saveData?.level ?? 1));
        if (typeof st.atk === 'number') st.atk = Math.floor(st.atk * cls.atk * (1 + pas.statPct));
        if (typeof st.matk === 'number') st.matk = Math.floor(st.matk * cls.atk * (1 + pas.statPct));
        if (typeof st.def === 'number') st.def = Math.floor(st.def * cls.def * (1 + pas.statPct));
        if (typeof st.maxHp === 'number') st.maxHp = Math.floor(st.maxHp * cls.hp * (1 + pas.hpPct));
        const scaledMp = Math.floor((100 + (pLv - 1) * 20) * (1 + pas.hpPct * 0.5));
        if (typeof st.maxMp === 'number') st.maxMp = Math.max(Math.floor(st.maxMp * (1 + pas.hpPct * 0.5)), scaledMp);
        return st;
      };
      P._v8StatsHooked = true;
    }

    if (typeof P.renderModalContent === 'function' && !P._v8ModalHooked) {
      const origMd = P.renderModalContent;
      P.renderModalContent = function () {
        purgeGlobalMagicClassesV8();
        this.updateMpGrowthAndRegenV8(0.016);
        this.syncAllSkillsV8();
        origMd.call(this);
        this.syncAllSkillsV8();
        const body = document.getElementById('modal-body');
        if (!body) return;
        const tab = String(this.activeTab || '').toLowerCase();
        const txt = body.textContent || '';
        const d = this.saveData || {};
        const pLv = Math.max(1, Number(d.lv ?? d.level ?? 1));
        const gold = Number(d.gold ?? d.coins ?? 0);

        body.querySelectorAll('div, button, li, tr').forEach(el => {
          if (el.id === 'modal-body' || el.querySelector('input')) return;
          const t = el.textContent || '';
          if (t.length < 180 && FORBIDDEN_MAGIC_JOB_REGEX.test(t) && /クラス|進化|転職|Lv\.|選択|解放/.test(t)) {
            el.style.display = 'none';
          }
        });

        // ★ 魔法スタジオは「デバッグモード有効時」のみ表示！
        if (isDebugModeActiveV8(this) && !body.querySelector('#kmj-v8-studio-in-debug')) {
          const count = window.KMJ_SKILL_FX_V9?.getAll14Skills?.(this)?.length || 14;
          body.insertAdjacentHTML('afterbegin', `
            <div id="kmj-v8-studio-in-debug" class="card-box" style="margin-bottom:8px;border:1.5px solid #f472b6;background:rgba(30,27,75,0.96);display:flex;flex-direction:column;gap:6px;">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
                <div>
                  <div style="font-size:11.5px;font-weight:900;color:#f9a8d4;">🎬 [DEBUG] 全${count}種スキル 個別進化スタジオ</div>
                  <div style="font-size:9.5px;color:#cbd5e1;">デバッグ専用：全${count}種スキル（Lv.1〜100進化）と剣の水平横振りをテストできます</div>
                </div>
                <button type="button" id="kmj-v8-open-studio-btn" style="background:linear-gradient(90deg,#ec4899,#8b5cf6);border:none;color:#fff;border-radius:7px;padding:7px 11px;font-size:11px;font-weight:900;cursor:pointer;white-space:nowrap;">⚡ スタジオ起動</button>
              </div>
              <button type="button" id="kmj-v8-test-swing-btn" style="background:#0284c7;border:1px solid #38bdf8;color:#fff;border-radius:6px;padding:5px 8px;font-size:10.5px;font-weight:900;cursor:pointer;">⚔️ 左手の剣・水平横振りモーションをテスト再生</button>
            </div>
          `);
          body.querySelector('#kmj-v8-open-studio-btn').onclick = () => {
            document.getElementById('modal')?.classList?.add('hidden');
            window.KMJ_SKILL_FX_V9?.openStudioModal?.(this);
          };
          body.querySelector('#kmj-v8-test-swing-btn').onclick = () => {
            document.getElementById('modal')?.classList?.add('hidden');
            if (typeof this.triggerAttackVisual === 'function' && this.player) {
              this.triggerAttackVisual(this.player, false);
            }
          };
        }

        if (/stat|evo|job|class/.test(tab)) {
          const cur = this.getCurrentClassV8();
          if (!Array.isArray(d.unlockedClassesClean)) d.unlockedClassesClean = ['novice'];
          const cards = CLASS_TREE_V8.map(c => {
            const isC = cur.id === c.id, isU = c.cost <= 0 || d.unlockedClassesClean.includes(c.id);
            const okLv = pLv >= c.reqLv || this._debugInfiniteMode;
            const lbl = isC ? '✅ 選択中' : (isU ? '🔄 切替(無料)' : (!okLv ? `🔒 Lv.${c.reqLv}` : `✨ 解放(${c.cost.toLocaleString()}G)`));
            return `<div style="background:#1e293b;border:1px solid ${isC ? '#34d399' : '#334155'};border-radius:7px;padding:6px;">
              <div style="font-size:11px;font-weight:900;color:#fff;">${c.icon} ${c.name}</div>
              <div style="font-size:9px;color:#38bdf8;">${c.fxName}</div>
              <button type="button" class="v8-cls-btn" data-id="${c.id}" ${isC || (!isU && !okLv) ? 'disabled' : ''} style="margin-top:4px;width:100%;background:${isC ? '#059669' : '#0284c7'};border:none;color:#fff;border-radius:5px;padding:4px;font-size:10px;font-weight:900;">${lbl}</button>
            </div>`;
          }).join('');
          body.insertAdjacentHTML('afterbegin', `<div class="card-box" style="margin-bottom:8px;border-color:#38bdf8;"><b style="color:#7dd3fc;font-size:11px;">⚔️ 純粋剣士・戦士クラス進化（現在: ${cur.name}）</b><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:5px;margin-top:5px;max-height:220px;overflow-y:auto;">${cards}</div></div>`);
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
      };
      P._v8ModalHooked = true;
    }

    if (typeof P.updateRemotePlayers === 'function' && !P._v8LoopHooked) {
      const origLoop = P.updateRemotePlayers;
      P.updateRemotePlayers = function (dt) {
        origLoop.call(this, dt);
        hideTopRightOnlineBarV8();
        this.updateMpGrowthAndRegenV8(dt);
        installChatDragAndResizeHandles();
        this.updateSingleStageWarpAndHudV8();
        this.fixFacesAndWeaponsV8();
        this.syncAllSkillsV8();
        this.syncPetPowerV8();
        this.normalizeHigherLevelMonstersV8();
        window.KMJ_SKILL_FX_V9?.updateSanctuaryFields?.(this, dt);
      };
      P._v8LoopHooked = true;
    }

    setTimeout(() => {
      const g = window.game;
      if (g) {
        hideTopRightOnlineBarV8();
        purgeGlobalMagicClassesV8();
        g.updateMpGrowthAndRegenV8(0.016);
        installChatDragAndResizeHandles();
        g.updateSingleStageWarpAndHudV8();
        g.fixFacesAndWeaponsV8();
        g.syncAllSkillsV8();
        g.syncPetPowerV8();
      }
    }, 300);
  }

  installV8Core();
  document.addEventListener('click', () => {
    setTimeout(() => {
      hideTopRightOnlineBarV8();
      setupThreatControlsV8();
      purgeGlobalMagicClassesV8();
      window.game?.updateMpGrowthAndRegenV8?.(0.016);
      window.game?.syncAllSkillsV8?.();
    }, 40);
  }, true);
  setTimeout(setupThreatControlsV8, 300);
})();
// ▲▲▲ ここまで【game8.js 完全版 v111】 ▲▲▲
