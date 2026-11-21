// ▼▼▼ ここから【game8.js 完全版 v114】右上歯車メニューにスキルスタジオ直接配置＆debug777対応・剣の水平横振りモーション・武器グレード別(★1〜★6)豪華3D剣＆斬撃エフェクト ▼▼▼
(() => {
  'use strict';

  const MAX_LV_999 = 999;
  const MAX_THREAT_999 = 999;

  try {
    ['MAX_LV', 'MAX_LEVEL', 'LEVEL_CAP', 'MAX_PLAYER_LV', 'MAX_SKILL_LV'].forEach(k => { window[k] = MAX_LV_999; });
    ['MAX_THREAT_RANK', 'MAX_THREAT', 'THREAT_CAP', 'MAX_THREAT_LEVEL', 'MAX_DANGER', 'THREAT_MAX'].forEach(k => { window[k] = MAX_THREAT_999; });
  } catch (e) {}

  // =========================================================
  // 1. スタイル定義
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
  // 2. デバッグモード管理（debug777入力 / 歯車メニュー / 左上5回タップ）
  // =========================================================
  function isDebugModeActiveV8(game) {
    if (!game) game = window.game;
    if (game?._debugInfiniteMode === true || game?.debugMode === true || game?.isDebug === true) return true;
    if (window._kmjDebugUnlocked === true || window.DEBUG_MODE === true) return true;
    try {
      if (localStorage.getItem('kmj_debug_mode') === '1') return true;
      if (/[?&]debug=1/i.test(window.location.search || '')) return true;
    } catch (e) {}
    return false;
  }

  function openSkillStudioDirectV8(game) {
    const g = game || window.game;
    if (window.KMJ_SKILL_FX_V9 && typeof window.KMJ_SKILL_FX_V9.openStudioModal === 'function') {
      window.KMJ_SKILL_FX_V9.openStudioModal(g);
    } else {
      g?.showAlertBanner?.('⚠️ スキルスタジオ(game9.js)を読み込み中です。少し待って再度押してください。', 2200);
    }
  }

  function setDebugModeActiveV8(enabled) {
    const val = !!enabled;
    window._kmjDebugUnlocked = val;
    window.DEBUG_MODE = val;
    if (window.game) {
      window.game._debugInfiniteMode = val;
      window.game.debugMode = val;
      window.game.isDebug = val;
    }
    try {
      if (val) localStorage.setItem('kmj_debug_mode', '1');
      else localStorage.removeItem('kmj_debug_mode');
    } catch (e) {}
    window.game?.updateSingleStageWarpAndHudV8?.();
    const gearBtn = document.getElementById('kmj-v8-gear-debug-btn');
    if (gearBtn) {
      gearBtn.textContent = val ? '🛠️ デバッグモード: ON' : '🛠️ デバッグモード: OFF';
      gearBtn.style.borderColor = val ? '#34d399' : '#64748b';
      gearBtn.style.background = val ? '#059669' : '#1e293b';
    }
    window.game?.showAlertBanner?.(val ? '🛠️ デバッグモード ON（スキルスタジオ解放）' : '🛠️ デバッグモード OFF', 1800);
  }

  // 画面上のどの入力欄でも「debug777」が入力されたら即座にデバッグモードをONにする
  if (!window._v8Debug777GlobalHooked) {
    window._v8Debug777GlobalHooked = true;
    document.addEventListener('input', (e) => {
      const el = e.target;
      if (!el || typeof el.value !== 'string') return;
      if (/debug777/i.test(el.value.trim())) {
        if (!isDebugModeActiveV8(window.game)) {
          setDebugModeActiveV8(true);
        }
      }
    }, true);
  }

  // 左上ステータス欄の5回連続タップでもデバッグ切替可能にする
  let _topLeftTapCount = 0;
  let _topLeftLastTap = 0;
  document.addEventListener('click', (e) => {
    if (e.clientX < 240 && e.clientY < 110) {
      const now = performance.now();
      if (now - _topLeftLastTap < 650) _topLeftTapCount++;
      else _topLeftTapCount = 1;
      _topLeftLastTap = now;
      if (_topLeftTapCount >= 5) {
        _topLeftTapCount = 0;
        setDebugModeActiveV8(!isDebugModeActiveV8(window.game));
      }
    }
  }, true);

  // =========================================================
  // 2.5 右上の歯車（設定）ドロップダウンメニューへの直接注入
  // =========================================================
  function injectGearMenuControlsV8() {
    let gearBox = null;
    const candidates = document.querySelectorAll('div, section, aside, ul');
    for (let i = 0; i < candidates.length; i++) {
      const el = candidates[i];
      if (el.id === 'modal' || el.id === 'modal-body' || el.closest('#modal')) continue;
      const txt = el.textContent || '';
      if (txt.includes('手動セーブ') && txt.includes('完全データ初期化')) {
        if (!gearBox || gearBox.contains(el)) {
          gearBox = el;
        }
      }
    }
    if (!gearBox) return;

    // 画面縦幅が狭い端末でもはみ出さないようスクロール許可
    gearBox.style.maxHeight = 'calc(100vh - 72px)';
    gearBox.style.overflowY = 'auto';

    const g = window.game;
    const d = g?.saveData || {};

    // 1. 「🎬 スキルスタジオ」ボタンを歯車メニュー内に直接追加（いつでも一発起動）
    if (!gearBox.querySelector('#kmj-v8-gear-studio-btn')) {
      const studioBtn = document.createElement('button');
      studioBtn.type = 'button';
      studioBtn.id = 'kmj-v8-gear-studio-btn';
      studioBtn.textContent = '🎬 スキルスタジオ';
      studioBtn.style.cssText = 'margin-top:6px;width:100%;padding:7px 8px;border-radius:6px;border:1.5px solid #fde047;background:linear-gradient(90deg,#db2777,#7c3aed);color:#fff;font-size:11.5px;font-weight:900;cursor:pointer;box-shadow:0 2px 8px rgba(219,39,119,0.45);';
      studioBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openSkillStudioDirectV8(window.game);
      });
      studioBtn.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
      gearBox.appendChild(studioBtn);
    }

    // 2. デバッグモード切替ボタンを歯車メニュー内に追加
    if (!gearBox.querySelector('#kmj-v8-gear-debug-btn')) {
      const dbgBtn = document.createElement('button');
      dbgBtn.type = 'button';
      dbgBtn.id = 'kmj-v8-gear-debug-btn';
      const syncBtnVisual = () => {
        const on = isDebugModeActiveV8(window.game);
        dbgBtn.textContent = on ? '🛠️ デバッグモード: ON' : '🛠️ デバッグモード: OFF';
        dbgBtn.style.cssText = `margin-top:5px;width:100%;padding:6px 8px;border-radius:6px;border:1px solid ${on ? '#34d399' : '#64748b'};background:${on ? '#059669' : '#1e293b'};color:#fff;font-size:11px;font-weight:900;cursor:pointer;`;
      };
      syncBtnVisual();
      dbgBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDebugModeActiveV8(!isDebugModeActiveV8(window.game));
        syncBtnVisual();
      });
      dbgBtn.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
      gearBox.appendChild(dbgBtn);
    }

    // 3. プレイヤー名入力欄（debug777入力でもデバッグ起動）を歯車メニュー内に追加
    if (!gearBox.querySelector('#kmj-v8-gear-name-box')) {
      const curName = String(d.playerName || d.name || g?.player?.name || '冒険者');
      const escName = curName.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      const nameWrap = document.createElement('div');
      nameWrap.id = 'kmj-v8-gear-name-box';
      nameWrap.style.cssText = 'margin-top:6px;padding:6px;border-radius:7px;background:rgba(15,23,42,0.96);border:1px solid #38bdf8;display:flex;flex-direction:column;gap:4px;';
      nameWrap.innerHTML = `
        <div style="font-size:10px;font-weight:900;color:#7dd3fc;">✏️ プレイヤー名変更</div>
        <div style="display:flex;gap:4px;align-items:center;">
          <input type="text" id="kmj-v8-gear-name-input" value="${escName}" maxlength="20" placeholder="名前 / debug777" style="flex:1;min-width:0;width:90px;background:#020617;border:1px solid #475569;color:#fff;border-radius:5px;padding:4px 6px;font-size:11px;font-weight:700;outline:none;" />
          <button type="button" id="kmj-v8-gear-name-save" style="background:#0284c7;border:none;color:#fff;border-radius:5px;padding:4px 8px;font-size:10.5px;font-weight:900;cursor:pointer;white-space:nowrap;">変更</button>
        </div>
      `;

      ['click', 'mousedown', 'touchstart'].forEach(ev => {
        nameWrap.addEventListener(ev, (e) => e.stopPropagation(), ev === 'touchstart' ? { passive: true } : false);
      });

      gearBox.appendChild(nameWrap);

      const inp = nameWrap.querySelector('#kmj-v8-gear-name-input');
      const btn = nameWrap.querySelector('#kmj-v8-gear-name-save');
      const applyName = () => {
        const raw = (inp?.value || '').trim();
        if (!raw) {
          g?.showAlertBanner?.('⚠️ 名前を入力してください', 1400);
          return;
        }
        if (/debug777/i.test(raw)) {
          setDebugModeActiveV8(true);
          openSkillStudioDirectV8(window.game);
          return;
        }
        if (g?.saveData) {
          g.saveData.name = raw;
          g.saveData.playerName = raw;
        }
        if (g?.player) g.player.name = raw;
        g?.updateHUD?.();
        g?.updateHud?.();
        g?.saveGame?.(false);
        g?.showAlertBanner?.(`✅ 名前を「${raw}」に変更しました`, 1600);
      };
      if (inp) {
        inp.addEventListener('keydown', (e) => {
          e.stopPropagation();
          if (e.key === 'Enter') {
            e.preventDefault();
            applyName();
          }
        });
      }
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          applyName();
        });
      }
    }
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
      injectGearMenuControlsV8();
    });
    const startObs = () => {
      if (document.body) {
        window._v8OnlineObserver.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true });
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
    injectGearMenuControlsV8();
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
  // 7. 装備武器＆グレード（★1〜★6）完全特定エンジン
  // =========================================================
  function getEquippedWeaponProfileV8(game) {
    const d = game?.saveData || {};
    let wpnObj = null;
    let wpnIdx = 0;

    let wList = [];
    if (typeof WEAPONS !== 'undefined' && WEAPONS) {
      wList = (Array.isArray(WEAPONS) ? WEAPONS : Object.values(WEAPONS)).filter(w => w && typeof w === 'object');
    }

    if (typeof game?.getEquippedWeapon === 'function') {
      try { wpnObj = game.getEquippedWeapon(); } catch (e) {}
    } else if (typeof game?.getCurrentWeapon === 'function') {
      try { wpnObj = game.getCurrentWeapon(); } catch (e) {}
    }

    if (!wpnObj) {
      const candidateKeys = [
        d.equippedWeapon, d.equipWeapon, d.weaponId, d.weapon,
        d.curWeapon, d.activeWeapon, d.eqWeapon, d.selectedWeapon,
        d.equip?.weapon, d.equipment?.weapon,
        game?.player?.weaponId, game?.player?.weapon,
        game?._v8LastEquippedWeaponId
      ];
      for (const rawId of candidateKeys) {
        if (rawId === undefined || rawId === null || rawId === '') continue;
        if (typeof rawId === 'object') {
          wpnObj = rawId;
          break;
        }
        if (wList.length > 0) {
          const idx = wList.findIndex(w =>
            String(w.id) === String(rawId) ||
            String(w.weaponId) === String(rawId) ||
            String(w.name) === String(rawId)
          );
          if (idx >= 0) {
            wpnObj = wList[idx];
            wpnIdx = idx;
            break;
          }
          if (typeof rawId === 'number' && wList[rawId]) {
            wpnObj = wList[rawId];
            wpnIdx = rawId;
            break;
          }
        }
      }
    }

    if (!wpnObj) {
      const invSources = [d.weapons, d.ownedWeapons, d.inventory, d.bag];
      for (const src of invSources) {
        if (Array.isArray(src)) {
          const eq = src.find(it => it && (it.equipped || it.isEquipped || it.selected));
          if (eq) { wpnObj = eq; break; }
        }
      }
    }

    if (wpnObj && wList.length > 0) {
      const foundIdx = wList.findIndex(w => w === wpnObj || String(w.id) === String(wpnObj.id) || String(w.name) === String(wpnObj.name));
      if (foundIdx >= 0) wpnIdx = foundIdx;
    }

    if (!wpnObj && wList.length > 0) {
      wpnObj = wList[0];
      wpnIdx = 0;
    }

    const wName = String(wpnObj?.name || d.weaponName || game?._v8LastEquippedWeaponName || '見習いの剣');
    const wDesc = String(wpnObj?.desc || wpnObj?.description || '');
    const rar = String(wpnObj?.rarity || wpnObj?.rank || wpnObj?.grade || '').toUpperCase();
    const atkVal = Number(wpnObj?.atk ?? wpnObj?.attack ?? wpnObj?.power ?? 0);
    const plusLv = Number(d.weaponPlus ?? d.weaponEnhance ?? wpnObj?.plus ?? wpnObj?.lv ?? 0);
    const search = `${wName} ${wDesc} ${rar} ${wpnObj?.attr || wpnObj?.element || ''}`;

    let grade = 0;
    if (/LR|MYTH|GOD|神話|創世|アルティメット/.test(rar) || /創世|神話|エクスカリバー|ラグナロク|アルティメット|天叢雲|神剣/.test(wName)) {
      grade = 5;
    } else if (/UR|LEGEND|伝説|覇王|天帝/.test(rar) || /覇王|天帝|虚空|聖剣|竜王|カオス/.test(wName) || atkVal >= 800) {
      grade = 4;
    } else if (/SSR|EPIC|英雄/.test(rar) || /英雄|魔剣|竜|ドラゴン|雷神|氷帝|炎帝|オリハルコン/.test(wName) || atkVal >= 350) {
      grade = 3;
    } else if (/SR|RARE|名剣|騎士/.test(rar) || /ミスリル|プラチナ|騎士|名剣|炎|氷|雷|風/.test(wName) || atkVal >= 120) {
      grade = 2;
    } else if (/R|UNCOMMON/.test(rar) || /鋼|アイアン|鉄|シルバー|銀|大剣|ロング/.test(wName) || atkVal >= 35) {
      grade = 1;
    } else if (wList.length > 1 && wpnIdx > 0) {
      grade = Math.min(5, Math.floor((wpnIdx / Math.max(1, wList.length - 1)) * 5.4));
    }

    if (plusLv >= 50) grade = 5;
    else if (plusLv >= 30) grade = Math.max(grade, 4);
    else if (plusLv >= 15) grade = Math.max(grade, 3);
    else if (plusLv >= 5) grade = Math.max(grade, 2);

    let colors = { c1: 0x94a3b8, c2: 0xf8fafc, c3: 0xb45309, guard: 0xd97706, aura: 0x38bdf8, shape: 'octa' };
    if (grade === 1) {
      colors = { c1: 0xcbd5e1, c2: 0xffffff, c3: 0x38bdf8, guard: 0xfacc15, aura: 0x38bdf8, shape: 'octa' };
    } else if (grade >= 2) {
      colors = { c1: 0x60a5fa, c2: 0xffffff, c3: 0x38bdf8, guard: 0xfbbf24, aura: 0x60a5fa, shape: 'octa' };
    }

    if (/炎|火|紅蓮|ブレイズ|フレア|イフリート|太陽|fire|flame|blaze/i.test(search)) {
      colors = { c1: 0xef4444, c2: 0xfef08a, c3: 0xf97316, guard: 0xf59e0b, aura: 0xf97316, shape: 'tetra' };
    } else if (/氷|吹雪|零度|アイス|フロスト|ice|frost|freeze/i.test(search)) {
      colors = { c1: 0x38bdf8, c2: 0xffffff, c3: 0x818cf8, guard: 0xe0f2fe, aura: 0x38bdf8, shape: 'octa' };
    } else if (/雷|電|サンダー|紫電|ライトニング|thunder|volt|lightning/i.test(search)) {
      colors = { c1: 0xfacc15, c2: 0xffffff, c3: 0xa855f7, guard: 0xfde047, aura: 0xa855f7, shape: 'tetra' };
    } else if (/風|嵐|疾風|翠嵐|ウィンド|テンペスト|wind|storm/i.test(search)) {
      colors = { c1: 0x10b981, c2: 0xecfdf5, c3: 0xfde047, guard: 0x34d399, aura: 0x34d399, shape: 'octa' };
    } else if (/聖|光|黄金|パラディン|エクスカリバー|天照|holy|light|gold/i.test(search)) {
      colors = { c1: 0xfacc15, c2: 0xffffff, c3: 0xf59e0b, guard: 0xfef08a, aura: 0xfde047, shape: 'octa' };
    } else if (/闇|黒|ダーク|アビス|虚空|ラグナロク|魔剣|dark|void|abyss/i.test(search)) {
      colors = { c1: 0x9333ea, c2: 0xf43f5e, c3: 0x38bdf8, guard: 0x4c1d95, aura: 0xc084fc, shape: 'dodeca' };
    } else if (/竜|ドラゴン|ドラグーン|dragon/i.test(search)) {
      colors = { c1: 0xdc2626, c2: 0xfde047, c3: 0xf97316, guard: 0xfbbf24, aura: 0xef4444, shape: 'tetra' };
    } else if (grade >= 5) {
      colors = { c1: 0xf472b6, c2: 0xffffff, c3: 0xfde047, guard: 0xfef08a, aura: 0x38bdf8, shape: 'octa' };
    }

    const gradeTitles = [
      '★1 ブロンズ級',
      '★2 スチール級',
      '★3 騎士魔剣級',
      '★4 英雄聖剣級',
      '★5 覇王天帝級',
      '★6 創世神話級'
    ];
    const key = `${wName}|${wpnIdx}|g${grade}|p${plusLv}`;

    return {
      key,
      wName,
      grade,
      gradeTitle: gradeTitles[grade] || gradeTitles[0],
      plusLv,
      colors
    };
  }

  // =========================================================
  // 8. グレード別（★1〜★6）豪華3D剣ビルダー＆水平横振りアニメーション
  // =========================================================
  function buildGradeSwordGroupV8(profile) {
    const { key, grade, colors } = profile;
    const pivot = new THREE.Group();
    pivot.name = 'V8_LEFT_SWORD_PIVOT';
    pivot.userData = { wpnKey: key, grade, auraRings: [], bitSwords: [] };

    const addPart = (mesh) => {
      mesh.userData.isV8SwordPart = true;
      mesh.visible = true;
      pivot.add(mesh);
      return mesh;
    };

    const bladeLen = 1.05 + grade * 0.17;
    const bladeW = 0.15 + grade * 0.025;
    const guardW = 0.36 + grade * 0.09;

    const handle = addPart(new THREE.Mesh(
      new THREE.BoxGeometry(0.10, 0.34, 0.10),
      new THREE.MeshBasicMaterial({ color: 0x451a03 })
    ));
    handle.position.set(0, 0.02, 0);

    const pommel = addPart(new THREE.Mesh(
      new THREE.OctahedronGeometry(0.09 + grade * 0.015, 0),
      new THREE.MeshBasicMaterial({ color: colors.guard })
    ));
    pommel.position.set(0, -0.17, 0);

    const guardMain = addPart(new THREE.Mesh(
      new THREE.BoxGeometry(guardW, 0.10 + grade * 0.015, 0.17 + grade * 0.02),
      new THREE.MeshBasicMaterial({ color: colors.guard })
    ));
    guardMain.position.set(0, 0.21, 0);

    if (grade >= 2) {
      [-1, 1].forEach(side => {
        const wing = addPart(new THREE.Mesh(
          new THREE.BoxGeometry(0.18 + grade * 0.03, 0.22 + grade * 0.04, 0.12),
          new THREE.MeshBasicMaterial({ color: colors.c3 })
        ));
        wing.position.set(side * (guardW * 0.52), 0.27, 0);
        wing.rotation.z = -side * 0.42;
      });
    }

    if (grade >= 1) {
      const gem = addPart(new THREE.Mesh(
        new THREE.OctahedronGeometry(0.08 + grade * 0.02, 0),
        new THREE.MeshBasicMaterial({ color: colors.c2 })
      ));
      gem.position.set(0, 0.21, 0.09);
    }

    const blade = addPart(new THREE.Mesh(
      new THREE.BoxGeometry(bladeW, bladeLen, 0.055),
      new THREE.MeshBasicMaterial({ color: colors.c1 })
    ));
    blade.position.set(0, 0.25 + bladeLen * 0.5, 0);

    const coreLine = addPart(new THREE.Mesh(
      new THREE.BoxGeometry(bladeW * 0.42, bladeLen * 0.96, 0.072),
      new THREE.MeshBasicMaterial({ color: colors.c2 })
    ));
    coreLine.position.set(0, 0.25 + bladeLen * 0.5, 0);

    if (grade >= 3) {
      [-1, 1].forEach(side => {
        const sideEdge = addPart(new THREE.Mesh(
          new THREE.BoxGeometry(0.055, bladeLen * 0.85, 0.035),
          new THREE.MeshBasicMaterial({ color: colors.c3 })
        ));
        sideEdge.position.set(side * (bladeW * 0.68), 0.25 + bladeLen * 0.46, 0);
      });
    }

    const tip = addPart(new THREE.Mesh(
      new THREE.ConeGeometry(bladeW * 0.72, 0.24 + grade * 0.03, 4),
      new THREE.MeshBasicMaterial({ color: colors.c2 })
    ));
    tip.rotation.y = Math.PI * 0.25;
    tip.position.set(0, 0.25 + bladeLen + (0.11 + grade * 0.015), 0);

    if (grade >= 3) {
      const ringCnt = grade >= 5 ? 2 : 1;
      for (let r = 0; r < ringCnt; r++) {
        const ring = addPart(new THREE.Mesh(
          new THREE.TorusGeometry((0.24 + r * 0.11), 0.024, 8, 24),
          new THREE.MeshBasicMaterial({ color: r === 0 ? colors.aura : colors.c2 })
        ));
        ring.rotation.x = Math.PI / 2;
        ring.position.set(0, 0.42 + r * (bladeLen * 0.45), 0);
        pivot.userData.auraRings.push({ mesh: ring, spd: (r === 0 ? 5 : -6) });
      }
    }

    if (grade >= 5) {
      [-1, 1].forEach((side, idx) => {
        const bit = addPart(new THREE.Mesh(
          new THREE.BoxGeometry(0.065, 0.78, 0.03),
          new THREE.MeshBasicMaterial({ color: idx === 0 ? 0xf472b6 : 0x38bdf8 })
        ));
        bit.position.set(side * 0.36, 0.72, -0.05);
        pivot.userData.bitSwords.push({ mesh: bit, side, baseY: 0.72 });
      });
    }

    return pivot;
  }

  // =========================================================
  // 9. 剣を振った瞬間のグレード連動3D斬撃エフェクト！
  // =========================================================
  const _activeSlashFxV8 = [];
  let _lastSlashTimeV8 = 0;

  function spawnSwordSlashFxV8(game, entity, profile, swingDir = 1) {
    if (!game?.scene || !entity?.pos || typeof THREE === 'undefined') return;
    const now = performance.now();
    if (now - _lastSlashTimeV8 < 110) return;
    _lastSlashTimeV8 = now;

    if (!profile) profile = getEquippedWeaponProfileV8(game);
    const { grade, colors } = profile;
    const { c1, c2, c3, shape } = colors;
    const sc = 1.0 + grade * 0.25;
    const rainbow = [0xf472b6, 0x38bdf8, 0xfde047, 0x34d399, 0xa855f7, 0xf97316];

    const root = new THREE.Group();
    root.position.set(entity.pos.x, 0, entity.pos.z);
    root.rotation.y = entity.rotY || 0;

    const arcs = [];
    const arcLayers = 1 + grade;
    for (let i = 0; i < arcLayers; i++) {
      const col = grade >= 5 ? rainbow[i % rainbow.length] : (i % 3 === 0 ? c1 : (i % 3 === 1 ? c2 : c3));
      const rIn = (0.85 + i * 0.22) * sc;
      const rOut = (1.75 + i * 0.32) * sc;
      const span = Math.PI * (0.76 + Math.min(0.45, grade * 0.08));
      const mat = new THREE.MeshBasicMaterial({
        color: col,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.96
      });
      const mesh = new THREE.Mesh(new THREE.RingGeometry(rIn, rOut, 32, 1, -span * 0.5, span), mat);
      mesh.rotation.x = -Math.PI * 0.48 + (i % 2 === 0 ? 0.05 : -0.05);
      mesh.position.set(0, 1.02 + i * 0.07, 0.35 * sc);
      root.add(mesh);
      arcs.push({ mesh, mat, idx: i });
    }

    const waves = [];
    if (grade >= 1) {
      const wCnt = grade >= 4 ? 2 : 1;
      for (let w = 0; w < wCnt; w++) {
        const wMat = new THREE.MeshBasicMaterial({
          color: w === 0 ? c2 : c1,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.95
        });
        const wave = new THREE.Mesh(
          new THREE.RingGeometry((0.9 + w * 0.35) * sc, (1.65 + w * 0.45) * sc, 24, 1, -Math.PI * 0.38, Math.PI * 0.76),
          wMat
        );
        wave.rotation.x = -Math.PI * 0.46;
        wave.position.set(0, 1.08 + w * 0.16, (1.1 + w * 0.4) * sc);
        root.add(wave);
        waves.push({ mesh: wave, mat: wMat, baseZ: (1.1 + w * 0.4) * sc });
      }
    }

    let groundRing = null;
    if (grade >= 3) {
      const gMat = new THREE.MeshBasicMaterial({ color: c1, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
      groundRing = new THREE.Mesh(new THREE.RingGeometry(0.65 * sc, 1.55 * sc, 32), gMat);
      groundRing.rotation.x = -Math.PI / 2;
      groundRing.position.set(0, 0.09, 0.85 * sc);
      root.add(groundRing);
    }

    const crossList = [];
    if (grade >= 4) {
      for (let c = 0; c < 2; c++) {
        const cMat = new THREE.MeshBasicMaterial({ color: c === 0 ? c2 : c3, side: THREE.DoubleSide, transparent: true, opacity: 0.92 });
        const cb = new THREE.Mesh(new THREE.RingGeometry(0.95 * sc, 1.85 * sc, 24, 1, -Math.PI * 0.35, Math.PI * 0.7), cMat);
        cb.rotation.x = -Math.PI * 0.32;
        cb.rotation.y = c === 0 ? 0.36 : -0.36;
        cb.position.set(0, 1.25, 1.1 * sc);
        root.add(cb);
        crossList.push({ mesh: cb, mat: cMat });
      }
    }

    const shotBits = [];
    if (grade >= 5) {
      for (let s = 0; s < 4; s++) {
        const side = s % 2 === 0 ? 1 : -1;
        const lane = Math.floor(s / 2) + 1;
        const bMat = new THREE.MeshBasicMaterial({ color: rainbow[s % rainbow.length], transparent: true, opacity: 0.96 });
        const bit = new THREE.Mesh(new THREE.BoxGeometry(0.14 * sc, 0.08 * sc, 1.85 * sc), bMat);
        bit.position.set(side * (1.1 + lane * 0.65) * sc, 1.15 + lane * 0.18, 0.6);
        root.add(bit);
        shotBits.push({ mesh: bit, mat: bMat });
      }
    }

    const sparks = [];
    const spCnt = 6 + grade * 5;
    for (let i = 0; i < spCnt; i++) {
      const ang = -Math.PI * 0.45 + (Math.PI * 0.9 * i) / Math.max(1, spCnt - 1);
      const col = grade >= 5 ? rainbow[i % rainbow.length] : (i % 2 === 0 ? c1 : c2);
      const geo = shape === 'tetra'
        ? new THREE.TetrahedronGeometry(0.14 + grade * 0.025, 0)
        : (shape === 'dodeca' ? new THREE.DodecahedronGeometry(0.13 + grade * 0.025, 0) : new THREE.OctahedronGeometry(0.14 + grade * 0.025, 0));
      const pMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.95 });
      const pt = new THREE.Mesh(geo, pMat);
      pt.position.set(Math.sin(ang) * 1.1 * sc, 1.05, Math.cos(ang) * 1.1 * sc);
      root.add(pt);
      sparks.push({
        mesh: pt,
        mat: pMat,
        vx: Math.sin(ang) * (2.8 + (i % 3) * 0.9) * sc,
        vy: 1.2 + (i % 3) * 0.7,
        vz: Math.cos(ang) * (3.2 + (i % 3) * 1.0) * sc,
        sx: Math.sin(ang) * 1.1 * sc,
        sz: Math.cos(ang) * 1.1 * sc
      });
    }

    game.scene.add(root);
    _activeSlashFxV8.push({
      scene: game.scene,
      root,
      entity,
      arcs,
      waves,
      groundRing,
      crossList,
      shotBits,
      sparks,
      grade,
      sc,
      swingDir,
      startTime: now,
      durationMs: 360 + grade * 40
    });

    if (grade >= 3 && entity === game.player && typeof game.shakeTimer === 'number') {
      game.shakeTimer = Math.max(game.shakeTimer, 0.08 + (grade - 3) * 0.05);
    }
  }

  function updateSlashFxV8(now) {
    for (let i = _activeSlashFxV8.length - 1; i >= 0; i--) {
      const fx = _activeSlashFxV8[i];
      const elapsedSec = (now - fx.startTime) / 1000;
      const p = Math.min(1, (now - fx.startTime) / fx.durationMs);

      if (fx.entity?.pos) {
        fx.root.position.set(fx.entity.pos.x, 0, fx.entity.pos.z);
      }

      const sweep = fx.swingDir * (-1.15 + Math.sin(Math.min(1, p * 1.35) * Math.PI * 0.5) * 2.3);
      fx.arcs.forEach(a => {
        a.mesh.rotation.z = sweep - a.idx * 0.14 * fx.swingDir;
        a.mesh.scale.setScalar(1 + p * (0.28 + fx.grade * 0.05));
        a.mat.opacity = Math.max(0, (1 - p) * 0.96);
      });

      fx.waves.forEach(fw => {
        fw.mesh.position.z = fw.baseZ + p * (4.6 + fx.grade * 0.8) * fx.sc;
        fw.mesh.scale.setScalar(1 + p * 0.35);
        fw.mat.opacity = Math.max(0, (1 - p) * 0.95);
      });

      if (fx.groundRing) {
        fx.groundRing.scale.setScalar(1 + p * (1.8 + fx.grade * 0.35));
        fx.groundRing.material.opacity = Math.max(0, (1 - p) * 0.9);
      }

      fx.crossList.forEach(cb => {
        cb.mesh.scale.setScalar(1 + p * 0.45);
        cb.mat.opacity = Math.max(0, (1 - p) * 0.92);
      });

      fx.shotBits.forEach(ss => {
        ss.mesh.position.z = 0.6 + p * 7.2 * fx.sc;
        ss.mat.opacity = Math.max(0, (1 - p) * 0.96);
      });

      fx.sparks.forEach(pt => {
        pt.mesh.position.x = pt.sx + pt.vx * p;
        pt.mesh.position.z = pt.sz + pt.vz * p;
        pt.mesh.position.y = Math.max(0.1, 1.05 + pt.vy * p - 2.6 * p * p);
        pt.mesh.rotation.set(elapsedSec * 9, elapsedSec * 7, 0);
        pt.mat.opacity = Math.max(0, (1 - p) * 0.95);
      });

      if (p >= 1) {
        fx.scene.remove(fx.root);
        _activeSlashFxV8.splice(i, 1);
      }
    }
  }

  function triggerSwordSwingAndSlashV8(game, entity) {
    if (!game) game = window.game;
    if (!entity) entity = game?.player;
    if (!entity) return;

    const now = performance.now();
    if (entity._v8LastSwingTrigger && now - entity._v8LastSwingTrigger < 120) return;
    entity._v8LastSwingTrigger = now;

    entity._v8SwingStart = now;
    entity._v8SwingDir = entity._v8SwingDir === 1 ? -1 : 1;

    const profile = getEquippedWeaponProfileV8(game);
    spawnSwordSlashFxV8(game, entity, profile, entity._v8SwingDir);
  }

  if (!window._v8AttackBtnHooked) {
    window._v8AttackBtnHooked = true;
    const onAttackPress = (e) => {
      const btn = e.target?.closest?.('button, [role="button"], div');
      if (!btn) return;
      const txt = (btn.textContent || '').trim();
      const rect = btn.getBoundingClientRect();
      const isAtkBtn = (
        txt === '攻撃' ||
        (txt.includes('攻撃') && txt.length <= 8) ||
        (rect.width >= 55 && rect.width <= 120 && rect.height >= 55 && rect.height <= 120 &&
         rect.right >= window.innerWidth - 130 && rect.bottom >= window.innerHeight - 130)
      );
      if (isAtkBtn && window.game?.player) {
        triggerSwordSwingAndSlashV8(window.game, window.game.player);
      }
    };
    document.addEventListener('touchstart', onAttackPress, { capture: true, passive: true });
    document.addEventListener('mousedown', onAttackPress, true);
  }

  // =========================================================
  // 10. 毎フレーム描画直前：剣の3D表示更新＆水平横振りモーション適用
  // =========================================================
  function enforceSingleLeftSwordAndHorizontalSwing(game) {
    if (typeof THREE === 'undefined' || !game?.player) return;
    const now = performance.now();
    updateSlashFxV8(now);

    const player = game.player;
    const rootObj = player.group || player.mesh;
    if (!rootObj) return;

    const curCd = Number(player.attackCooldown ?? player.atkCd ?? player.attackTimer ?? 0);
    if (player._v8PrevCd !== undefined && curCd > player._v8PrevCd + 0.05) {
      triggerSwordSwingAndSlashV8(game, player);
    }
    player._v8PrevCd = curCd;

    rootObj.updateMatrixWorld?.(true);

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

    rootObj.traverse(m => {
      if (!m.isMesh || m === bodyMesh || m.userData?.isV8SwordPart) return;
      if (m.geometry?.type === 'PlaneGeometry' || m.material?.map?.image) return;
      if (m.geometry?.type === 'SphereGeometry') return;

      const wp = new THREE.Vector3();
      m.getWorldPosition(wp);
      const lp = rootObj.worldToLocal(wp.clone());

      if (Math.abs(lp.x - bodyX) > bodyW * 0.32) {
        if (lp.y > bodyY + 0.55 && Math.abs(lp.x - bodyX) < bodyW * 0.45) return;
        m.visible = false;
      }
    });

    const profile = getEquippedWeaponProfileV8(game);
    let swingPivot = rootObj.getObjectByName('V8_LEFT_SWORD_PIVOT');

    if (!swingPivot || swingPivot.userData?.wpnKey !== profile.key) {
      if (swingPivot) rootObj.remove(swingPivot);
      swingPivot = buildGradeSwordGroupV8(profile);
      rootObj.add(swingPivot);
    }

    const swordSideSign = (handSphereX !== null && handSphereX < bodyX) ? 1 : 1;
    const gripX = bodyX + swordSideSign * (bodyW * 0.64);
    const gripY = Math.max(0.32, bodyY - 0.14);
    const gripZ = 0.08;

    swingPivot.visible = true;
    swingPivot.position.set(gripX, gripY, gripZ);

    const tSec = now * 0.004;
    if (Array.isArray(swingPivot.userData?.auraRings)) {
      swingPivot.userData.auraRings.forEach(ar => {
        ar.mesh.rotation.z = tSec * ar.spd;
      });
    }
    if (Array.isArray(swingPivot.userData?.bitSwords)) {
      swingPivot.userData.bitSwords.forEach((bs, idx) => {
        bs.mesh.position.y = bs.baseY + Math.sin(tSec * 2 + idx * Math.PI) * 0.08;
      });
    }

    const swingElapsed = player._v8SwingStart ? (now - player._v8SwingStart) : 9999;
    const swingDuration = 380;

    if (swingElapsed >= 0 && swingElapsed < swingDuration) {
      const p = swingElapsed / swingDuration;
      const dir = player._v8SwingDir || 1;
      swingPivot.rotation.x = Math.PI * 0.49;
      const startAng = dir === 1 ? -1.45 : 1.55;
      const sweepDelta = dir === 1 ? 3.15 : -3.15;
      const ease = 1 - Math.pow(1 - p, 2.4);
      swingPivot.rotation.y = startAng + sweepDelta * ease;
      swingPivot.rotation.z = -0.10;
      swingPivot.position.z = gripZ + Math.sin(p * Math.PI) * 0.28;
    } else {
      swingPivot.rotation.x = 0.30 + Math.sin(tSec) * 0.06;
      swingPivot.rotation.y = Math.cos(tSec * 0.8) * 0.08;
      swingPivot.rotation.z = -0.14 + Math.sin(tSec) * 0.04;
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
  // 11. コア機能インストール
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

    if (window.KMJ_SKILL_FX_V9 && typeof window.KMJ_SKILL_FX_V9.injectSkillPreviewUI === 'function' && !window.KMJ_SKILL_FX_V9._v8DebugGated) {
      const origInject = window.KMJ_SKILL_FX_V9.injectSkillPreviewUI;
      window.KMJ_SKILL_FX_V9.injectSkillPreviewUI = function (game, body, tab) {
        if (!isDebugModeActiveV8(game)) return;
        return origInject.call(this, game, body, tab);
      };
      window.KMJ_SKILL_FX_V9._v8DebugGated = true;
    }

    ['attack', 'doAttack', 'performAttack', 'basicAttack', 'normalAttack', 'executeAttack', 'triggerAttackVisual'].forEach(fnName => {
      if (typeof P[fnName] === 'function' && !P[`_v8Hooked_${fnName}`]) {
        const origFn = P[fnName];
        P[`_v8Hooked_${fnName}`] = true;
        P[fnName] = function (...args) {
          if (fnName === 'triggerAttackVisual') {
            const ent = args[0] || this.player;
            const isSkill = !!args[1];
            if (!isSkill && ent === this.player) {
              triggerSwordSwingAndSlashV8(this, ent);
              return;
            }
          } else if (this.player) {
            triggerSwordSwingAndSlashV8(this, this.player);
          }
          return origFn.apply(this, args);
        };
      }
    });

    Object.assign(P, {
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

        const fullHtml = `<button type="button" id="kmj-open-studio-hud-btn" class="kmj-studio-launch-btn">🎬 スキルスタジオ (DEBUG)</button>`;
        if (hud._lastHtml !== fullHtml) {
          hud._lastHtml = fullHtml;
          hud.innerHTML = fullHtml;
          const stBtn = hud.querySelector('#kmj-open-studio-hud-btn');
          if (stBtn) {
            stBtn.onclick = () => {
              openSkillStudioDirectV8(this);
            };
          }
        }
      },

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

        if (/wpn|weapon|equip|forge|smith|item/.test(tab) || /武器|装備|鍛冶/.test(txt)) {
          const prof = getEquippedWeaponProfileV8(this);
          if (!body.querySelector('#kmj-v8-wpn-grade-banner')) {
            body.insertAdjacentHTML('afterbegin', `
              <div id="kmj-v8-wpn-grade-banner" class="card-box" style="margin-bottom:8px;border:1.5px solid #38bdf8;background:rgba(15,23,42,0.95);display:flex;align-items:center;justify-content:space-between;gap:8px;">
                <div>
                  <div style="font-size:11px;font-weight:900;color:#7dd3fc;">⚔️ 装備中: ${prof.wName} 【${prof.gradeTitle}】</div>
                  <div style="font-size:9.5px;color:#cbd5e1;">高グレード武器ほど3Dの剣が豪華になり、振った時に${prof.grade + 1}重の水平斬撃エフェクトが炸裂します！</div>
                </div>
                <button type="button" id="kmj-v8-preview-wpn-swing" style="background:#0284c7;border:none;color:#fff;border-radius:6px;padding:6px 10px;font-size:10.5px;font-weight:900;cursor:pointer;white-space:nowrap;">⚡ 振りテスト</button>
              </div>
            `);
            body.querySelector('#kmj-v8-preview-wpn-swing').onclick = () => {
              document.getElementById('modal')?.classList?.add('hidden');
              triggerSwordSwingAndSlashV8(this, this.player);
            };
          }

          body.querySelectorAll('button').forEach(btn => {
            if (/装備|装着|変更/.test(btn.textContent || '') && !btn.dataset.v8EqHooked) {
              btn.dataset.v8EqHooked = '1';
              btn.addEventListener('click', () => {
                const card = btn.closest('div');
                const titleLine = card?.querySelector('b, strong, div')?.textContent || '';
                if (titleLine) this._v8LastEquippedWeaponName = titleLine.trim();
                setTimeout(() => {
                  enforceSingleLeftSwordAndHorizontalSwing(this);
                }, 40);
              });
            }
          });
        }

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
              <button type="button" id="kmj-v8-test-swing-btn" style="background:#0284c7;border:1px solid #38bdf8;color:#fff;border-radius:6px;padding:5px 8px;font-size:10.5px;font-weight:900;cursor:pointer;">⚔️ 左手の剣・水平横振り＆斬撃エフェクトをテスト再生</button>
            </div>
          `);
          body.querySelector('#kmj-v8-open-studio-btn').onclick = () => {
            document.getElementById('modal')?.classList?.add('hidden');
            openSkillStudioDirectV8(this);
          };
          body.querySelector('#kmj-v8-test-swing-btn').onclick = () => {
            document.getElementById('modal')?.classList?.add('hidden');
            triggerSwordSwingAndSlashV8(this, this.player);
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
        injectGearMenuControlsV8();
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
        injectGearMenuControlsV8();
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
      injectGearMenuControlsV8();
      setupThreatControlsV8();
      purgeGlobalMagicClassesV8();
      window.game?.updateMpGrowthAndRegenV8?.(0.016);
      window.game?.syncAllSkillsV8?.();
    }, 40);
  }, true);
  setTimeout(setupThreatControlsV8, 300);
})();
// ▲▲▲ ここまで【game8.js 完全版 v114】 ▲▲▲
