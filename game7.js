// ▼▼▼ ここから game7.js【1/2】（クラス別通常攻撃ルーター・開始フラグ確実化・左下赤トースト通知・統合デバッグ・状態異常＆自動実績） ▼▼▼
(() => {
  'use strict';

  window.MAX_LEVEL_CAP_V27 = 999;
  window.MAX_THREAT_CAP_V27 = 999;
  window.SECRET_DEBUG_CODE = 'debug777';

  // =========================================================
  // 0-A. 左下赤トースト エラー通知ヘルパー（エラー握りつぶし防止）
  // =========================================================
  function reportKmjRuntimeError(source, err) {
    const rawMsg = err?.message ? err.message : String(err || 'Unknown Error');
    const stackLine = (err?.stack || '').split('\n')[1] || '';
    const locMatch = stackLine.match(/([^/\\()]+\.js:\d+:\d+)/);
    const loc = locMatch ? ` (${locMatch[1]})` : '';
    const fullText = `⚠️ [${source}] ${rawMsg}${loc} (タップで閉じる)`;

    console.error(`[KMJ-ERR:${source}]`, err);

    let box = document.getElementById('kmj-ipad-err-toast');
    if (!box) {
      box = document.createElement('div');
      box.id = 'kmj-ipad-err-toast';
      box.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:99999;max-width:92vw;background:rgba(127,29,29,.96);border:1.5px solid #f87171;color:#fecaca;font-size:10.5px;font-weight:700;padding:6px 10px;border-radius:8px;font-family:monospace;box-shadow:0 4px 16px rgba(0,0,0,0.75);word-break:break-all;cursor:pointer;';
      box.onclick = () => box.remove();
      (document.body || document.documentElement)?.appendChild(box);
    }
    box.textContent = fullText;
  }
  window.reportKmjRuntimeError = reportKmjRuntimeError;

  window.addEventListener('error', (ev) => {
    if (!ev?.message) return;
    const file = (ev.filename || '').split('/').pop().split('?')[0];
    const where = file ? `${file}:${ev.lineno || 0}` : 'window';
    reportKmjRuntimeError(where, ev.error || ev.message);
  });

  window.addEventListener('unhandledrejection', (ev) => {
    if (!ev?.reason) return;
    reportKmjRuntimeError('Promise', ev.reason);
  });

  // ゲームインスタンス取得＆自動生成ヘルパー
  function getOrCreateGameInstance(allowCreate = false) {
    let inst = window.__kmjInstance || window.game || window.app || window.mmorpg || window.gameInstance;
    if (!inst && allowCreate) {
      const GameClass = (typeof KaomojiMMORPG !== 'undefined') ? KaomojiMMORPG : window.KaomojiMMORPG;
      if (typeof GameClass === 'function') {
        try {
          inst = new GameClass();
          window.game = inst;
        } catch (e) {
          reportKmjRuntimeError('起動生成', e);
        }
      } else {
        reportKmjRuntimeError('起動生成', 'KaomojiMMORPG が見つかりません');
      }
    }
    if (inst) window.__kmjInstance = inst;
    return inst || null;
  }

  // タイトル解除時の開始フラグを確実に有効化
  function activateGameStartFlagsV7(inst) {
    const g = inst || getOrCreateGameInstance(false);
    window.inGame = true;
    window.isPlaying = true;
    window.started = true;
    window.paused = false;
    if (!g) return;
    g.inGame = true;
    g.isPlaying = true;
    g.started = true;
    g.isStarted = true;
    g.gameStarted = true;
    g.paused = false;
    g.isPaused = false;
    if (g.state && typeof g.state === 'object') {
      g.state.inGame = true;
      g.state.isPlaying = true;
      g.state.started = true;
      g.state.paused = false;
    }
  }
  window.activateGameStartFlagsV7 = activateGameStartFlagsV7;

  // =========================================================
  // 0-B. クラス別通常攻撃 統合ルーター（杖＝game7魔法弾 ／ 剣＝game8 3連横振り）
  // =========================================================
  const STAFF_CLASS_IDS_V7 = new Set(['mage', 'archmage', 'astral_witch', 'void_overlord']);

  function isStaffClassEntityV7(game, entity) {
    if (!entity) return false;
    const isLocal = (entity === game?.player);
    const d = isLocal ? (game?.saveData || {}) : (entity || {});
    const rawId = String(
      entity.evolutionId ?? entity.classId ?? entity.jobId ??
      d.evolutionId ?? d.classId ?? d.jobId ?? d.job ?? ''
    ).toLowerCase();

    if (STAFF_CLASS_IDS_V7.has(rawId)) return true;

    if (typeof game?.getCurrentClassDefV45 === 'function') {
      const cls = game.getCurrentClassDefV45(isLocal ? null : (rawId || null));
      if (cls?.weaponType === 'staff') return true;
      if (cls?.weaponType === 'sword') return false;
    }

    return /mage|archmage|astral_witch|void_overlord|wizard|witch|sage|priest|魔道|大賢者|星詠み|神官|虚空|創世魔導王/.test(rawId);
  }
  window.isStaffClassEntityV7 = isStaffClassEntityV7;

  function routeBasicAttackVisualV7(game, entity, isSkill = false, skillInfo = null, origVis = null) {
    const g = game || getOrCreateGameInstance(false);
    if (!g) return;

    if (!isSkill && entity) {
      const now = performance.now();
      if (entity._lastRoutedAtkVisStamp && (now - entity._lastRoutedAtkVisStamp) < 55) {
        return;
      }
      entity._lastRoutedAtkVisStamp = now;

      const isLocal = (entity === g.player);
      const isStaff = isStaffClassEntityV7(g, entity);

      if (isStaff) {
        entity.attackAnimTimer = 0.36;
        entity.attackIsSkill = false;
        if (typeof g.spawnClassBasicAttackEffectV45 === 'function') {
          g.spawnClassBasicAttackEffectV45(entity, isLocal, skillInfo?.evolutionId || entity.evolutionId);
        }
        return;
      } else {
        if (typeof window.triggerSwordSwingAndSlashV8 === 'function') {
          window.triggerSwordSwingAndSlashV8(g, entity);
          return;
        }
        entity.attackAnimTimer = 0.36;
        entity.attackIsSkill = false;
        g.spawnClassBasicAttackEffectV45?.(entity, isLocal, skillInfo?.evolutionId || entity.evolutionId);
        return;
      }
    }

    if (typeof origVis === 'function') {
      return origVis.call(g, entity, isSkill, skillInfo);
    }
  }
  window.routeBasicAttackVisualV7 = routeBasicAttackVisualV7;

  // =========================================================
  // 0-C. 統合デバッグ管理＆スキルスタジオ統合UI（debug777・全ゲーム共通入口）
  // =========================================================
  function isDebugActiveV7(game) {
    const g = game || getOrCreateGameInstance();
    if (g?._debugInfiniteMode === true || g?.debugMode === true || g?.isDebug === true) return true;
    if (window._kmjDebugUnlocked === true || window.DEBUG_MODE === true) return true;
    try {
      if (localStorage.getItem('kmj_debug_mode') === '1') return true;
      if (/[?&]debug=1/i.test(window.location.search || '')) return true;
    } catch (e) {}
    return false;
  }

  function setDebugActiveV7(enabled, openPanel = false) {
    const val = !!enabled;
    const g = getOrCreateGameInstance();
    window._kmjDebugUnlocked = val;
    window.DEBUG_MODE = val;
    if (g) {
      g._debugInfiniteMode = val;
      g.debugMode = val;
      g.isDebug = val;
    }
    try {
      if (val) localStorage.setItem('kmj_debug_mode', '1');
      else localStorage.removeItem('kmj_debug_mode');
    } catch (e) {}

    syncDebugHudPillV7();
    const gearToggleBtn = document.getElementById('kmj-v7-gear-debug-toggle');
    if (gearToggleBtn) {
      gearToggleBtn.textContent = val ? '🛠️ デバッグ: ON (スタジオ開く)' : '🛠️ デバッグ: OFF';
      gearToggleBtn.style.background = val ? 'linear-gradient(90deg,#059669,#0284c7)' : '#1e293b';
      gearToggleBtn.style.borderColor = val ? '#34d399' : '#64748b';
    }

    if (val && openPanel) {
      openUnifiedDebugModalV7();
    } else {
      g?.showAlertBanner?.(val ? '🛠️ デバッグモード ON（スキルスタジオ解放）' : '🛠️ デバッグモード OFF', 1800);
    }
  }

  function syncDebugHudPillV7() {
    const on = isDebugActiveV7();
    let hud = document.getElementById('kmj-v7-debug-hud');
    if (!on) {
      if (hud) hud.remove();
      return;
    }
    if (!hud) {
      hud = document.createElement('div');
      hud.id = 'kmj-v7-debug-hud';
      hud.style.cssText = 'position:fixed;top:64px;right:12px;z-index:960;display:flex;gap:5px;pointer-events:auto;';
      hud.innerHTML = `<button type="button" id="kmj-v7-open-debug-hud" style="background:linear-gradient(90deg,#db2777,#7c3aed);border:1.5px solid #fde047;box-shadow:0 0 14px rgba(236,72,153,0.65);color:#fff;border-radius:999px;padding:5px 12px;font-size:11px;font-weight:900;cursor:pointer;">🛠️ DEBUG / スキルスタジオ</button>`;
      document.body?.appendChild(hud);
      hud.querySelector('#kmj-v7-open-debug-hud').onclick = () => openUnifiedDebugModalV7();
    }
  }

  function openUnifiedDebugModalV7() {
    document.getElementById('kmj-v7-debug-modal')?.remove();
    const g = getOrCreateGameInstance(true);
    if (!isDebugActiveV7(g)) {
      setDebugActiveV7(true, false);
    }

    const d = g?.saveData || {};
    const v9 = window.KMJ_SKILL_FX_V9;
    const allSkills = v9?.getAll14Skills ? v9.getAll14Skills(g) : [];

    const skillRowsHtml = allSkills.length > 0
      ? allSkills.map((sk, idx) => {
          const info = v9.getSkillInfo(g, sk);
          const icon = sk.icon || '✨';
          return `
            <div style="background:rgba(15,23,42,0.92);border:1px solid #38bdf8;border-radius:8px;padding:7px;margin-bottom:6px;">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:4px;">
                <div style="font-size:11.5px;font-weight:900;color:#fff;">${idx + 1}. ${icon} ${info.origName}</div>
                <span style="font-size:9.5px;font-weight:900;color:#fde047;">${info.theme.label}</span>
              </div>
              <div style="font-size:9px;color:#93c5fd;margin:2px 0 5px;">
                現在Lv.${info.skillLv}（消費MP: ${info.mpCost}）
              </div>
              <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;">
                <button type="button" class="v7-dbg-cast-skill" data-idx="${idx}" data-tier="0" style="background:#334155;color:#fff;border:none;border-radius:5px;padding:5px 2px;font-size:9.5px;font-weight:900;cursor:pointer;">Lv.1 通常</button>
                <button type="button" class="v7-dbg-cast-skill" data-idx="${idx}" data-tier="1" style="background:#0284c7;color:#fff;border:none;border-radius:5px;padding:5px 2px;font-size:9.5px;font-weight:900;cursor:pointer;">Lv.10【真】</button>
                <button type="button" class="v7-dbg-cast-skill" data-idx="${idx}" data-tier="2" style="background:#d97706;color:#fff;border:none;border-radius:5px;padding:5px 2px;font-size:9.5px;font-weight:900;cursor:pointer;">Lv.50【極】</button>
                <button type="button" class="v7-dbg-cast-skill" data-idx="${idx}" data-tier="3" style="background:linear-gradient(90deg,#db2777,#7c3aed);color:#fde047;border:none;border-radius:5px;padding:5px 2px;font-size:9.5px;font-weight:900;cursor:pointer;">Lv.100【神】</button>
              </div>
            </div>
          `;
        }).join('')
      : `<div style="font-size:11px;color:#fca5a5;padding:8px;">⚠️ スキルデータ(game9.js)読み込み待機中です。</div>`;

    const wrap = document.createElement('div');
    wrap.id = 'kmj-v7-debug-modal';
    wrap.style.cssText = 'position:fixed;inset:0;z-index:9980;background:rgba(2,6,23,0.82);display:flex;align-items:center;justify-content:center;padding:10px;backdrop-filter:blur(4px);';

    wrap.innerHTML = `
      <div style="width:100%;max-width:520px;max-height:88vh;overflow-y:auto;background:linear-gradient(160deg,#0f172a,#1e1b4b);border:2px solid #f472b6;border-radius:14px;padding:13px;box-shadow:0 0 36px rgba(236,72,153,0.6);color:#f8fafc;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
          <b style="font-size:14px;color:#fde047;">🛠️ 統合デバッグ＆スキルスタジオ (debug777)</b>
          <button type="button" id="kmj-v7-dbg-close" style="background:#ef4444;color:#fff;border:none;border-radius:6px;padding:4px 10px;font-size:11px;font-weight:900;cursor:pointer;">✕ 閉じる</button>
        </div>

        <div style="background:rgba(30,41,59,0.9);border:1px solid #34d399;border-radius:9px;padding:8px;margin-bottom:8px;">
          <div style="font-size:11px;font-weight:900;color:#6ee7b7;margin-bottom:6px;">⚡ デバッグクイック操作（MP無限・CT0・条件無視）</div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-bottom:6px;">
            <button type="button" id="v7-dbg-lv999" style="background:#0284c7;color:#fff;border:none;border-radius:6px;padding:6px 4px;font-size:10px;font-weight:900;cursor:pointer;">🆙 Lv.999にする</button>
            <button type="button" id="v7-dbg-gold" style="background:#d97706;color:#fff;border:none;border-radius:6px;padding:6px 4px;font-size:10px;font-weight:900;cursor:pointer;">💰 +100万G追加</button>
            <button type="button" id="v7-dbg-heal" style="background:#059669;color:#fff;border:none;border-radius:6px;padding:6px 4px;font-size:10px;font-weight:900;cursor:pointer;">💖 HP/MP全回復</button>
            <button type="button" id="v7-dbg-skill100" style="background:#7c3aed;color:#fff;border:none;border-radius:6px;padding:6px 4px;font-size:10px;font-weight:900;cursor:pointer;">🌈 全スキルLv.100</button>
            <button type="button" id="v7-dbg-atk-fx" style="background:#2563eb;color:#fff;border:none;border-radius:6px;padding:6px 4px;font-size:10px;font-weight:900;cursor:pointer;">⚔️/🪄 通常攻撃テスト</button>
            <button type="button" id="v7-dbg-off" style="background:#475569;color:#f8fafc;border:none;border-radius:6px;padding:6px 4px;font-size:10px;font-weight:900;cursor:pointer;">📴 デバッグOFF</button>
          </div>
          <div style="font-size:9.5px;color:#cbd5e1;">
            現在Lv.${d.lv ?? 1} / 💰${Number(d.gold ?? 0).toLocaleString()}G / 脅威ランク +${d.threatRank ?? 1}
          </div>
        </div>

        <div style="font-size:12px;font-weight:900;color:#f9a8d4;margin:6px 0 4px;">
          🎬 全${allSkills.length}種スキル 個別進化スタジオ（Lv.1〜Lv.100【神】）
        </div>
        <div style="font-size:9.5px;color:#fde047;margin-bottom:7px;">
          ※ ボタンを押すと画面が閉じて、選択した進化段階（通常 / 【真】 / 【極】 / 【神】）の3D演出＆カットインを即再生します！
        </div>
        ${skillRowsHtml}
      </div>
    `;

    document.body.appendChild(wrap);

    wrap.querySelector('#kmj-v7-dbg-close').onclick = () => wrap.remove();
    wrap.addEventListener('click', (e) => { if (e.target === wrap) wrap.remove(); });

    wrap.querySelector('#v7-dbg-lv999').onclick = () => {
      if (g?.saveData) {
        g.saveData.lv = 999;
        g.saveData.level = 999;
      }
      if (g?.player) g.player.lv = 999;
      g?.updateMpGrowthAndRegenV8?.(0.016);
      g?.refreshAllHUD?.();
      g?.saveGame?.(false);
      g?.showAlertBanner?.('🆙 プレイヤーLvを 999 に設定しました！', 1600);
      openUnifiedDebugModalV7();
    };

    wrap.querySelector('#v7-dbg-gold').onclick = () => {
      if (g?.saveData) {
        g.saveData.gold = (Number(g.saveData.gold) || 0) + 1000000;
        if ('coins' in g.saveData) g.saveData.coins = g.saveData.gold;
      }
      g?.refreshAllHUD?.();
      g?.saveGame?.(false);
      g?.showAlertBanner?.('💰 1,000,000G を追加しました！', 1600);
      openUnifiedDebugModalV7();
    };

    wrap.querySelector('#v7-dbg-heal').onclick = () => {
      g?.updateMpGrowthAndRegenV8?.(0.016);
      const st = typeof g?.calcDerivedStats === 'function' ? g.calcDerivedStats() : (typeof g?.getPlayerStats === 'function' ? g.getPlayerStats() : {});
      const mHp = Math.max(Number(st?.maxHp || 0), Number(g?.saveData?.maxHp || 100));
      const mMp = Math.max(Number(st?.maxMp || 0), Number(g?.saveData?.maxMp || 100));
      if (g?.saveData) { g.saveData.hp = mHp; g.saveData.mp = mMp; }
      if (g?.player) { g.player.hp = mHp; g.player.mp = mMp; }
      g?.refreshAllHUD?.();
      g?.showAlertBanner?.('💖 HP/MPを全回復しました！', 1500);
    };

    wrap.querySelector('#v7-dbg-skill100').onclick = () => {
      if (g?.saveData) {
        if (!g.saveData.skills) g.saveData.skills = {};
        if (!g.saveData.skillLevels) g.saveData.skillLevels = {};
        if (!g.saveData.skillLvs) g.saveData.skillLvs = {};
        allSkills.forEach((sk, i) => {
          const sid = String(sk.id || sk.skillId || `sk_${i + 1}`);
          g.saveData.skills[sid] = 100;
          g.saveData.skillLevels[sid] = 100;
          g.saveData.skillLvs[sid] = 100;
          sk.lv = 100;
          sk.level = 100;
        });
      }
      v9?.syncAllSkills?.(g);
      g?.refreshAllHUD?.();
      g?.saveGame?.(false);
      g?.showAlertBanner?.('🌈 全スキルを Lv.100【神】に進化させました！', 1800);
      openUnifiedDebugModalV7();
    };

    wrap.querySelector('#v7-dbg-atk-fx').onclick = () => {
      wrap.remove();
      setTimeout(() => {
        routeBasicAttackVisualV7(g, g?.player, false);
      }, 60);
    };

    wrap.querySelector('#v7-dbg-off').onclick = () => {
      wrap.remove();
      setDebugActiveV7(false, false);
    };

    wrap.querySelectorAll('.v7-dbg-cast-skill').forEach(btn => {
      btn.onclick = () => {
        const idx = Number(btn.dataset.idx);
        const tier = Number(btn.dataset.tier);
        const sk = allSkills[idx];
        wrap.remove();
        setTimeout(() => {
          v9?.previewSkillByObj?.(g, sk, tier);
        }, 80);
      };
    });
  }

  window.KMJ_DEBUG = {
    isActive: isDebugActiveV7,
    setActive: setDebugActiveV7,
    openModal: openUnifiedDebugModalV7
  };

  if (!window._v7DebugCodeListenerBound) {
    window._v7DebugCodeListenerBound = true;
    document.addEventListener('input', (e) => {
      const el = e.target;
      if (!el || typeof el.value !== 'string') return;
      if (/debug777/i.test(el.value.trim())) {
        el.value = el.value.replace(/debug777/ig, '').trim();
        setDebugActiveV7(true, true);
      }
    }, true);

    let _tapCnt = 0, _lastTap = 0;
    document.addEventListener('click', (e) => {
      if (e.clientX < 240 && e.clientY < 110) {
        const now = performance.now();
        _tapCnt = (now - _lastTap < 650) ? (_tapCnt + 1) : 1;
        _lastTap = now;
        if (_tapCnt >= 5) {
          _tapCnt = 0;
          setDebugActiveV7(true, true);
        }
      }
    }, true);
  }

  function injectGearMenuV7() {
    let gearBox = document.getElementById('settings-menu');
    if (!gearBox) {
      const candidates = document.querySelectorAll('div, section, aside, ul');
      for (let i = 0; i < candidates.length; i++) {
        const el = candidates[i];
        if (el.id === 'modal' || el.id === 'modal-body' || el.closest('#modal') || el.id === 'growth-modal' || el.closest('#growth-modal')) continue;
        const txt = el.textContent || '';
        if (txt.includes('手動セーブ') && txt.includes('完全データ初期化')) {
          if (!gearBox || gearBox.contains(el)) gearBox = el;
        }
      }
    }
    if (!gearBox) return;

    gearBox.style.maxHeight = 'calc(100vh - 72px)';
    gearBox.style.overflowY = 'auto';

    const g = getOrCreateGameInstance();
    const d = g?.saveData || {};

    if (!gearBox.querySelector('#kmj-v7-gear-debug-toggle')) {
      const dbgBtn = document.createElement('button');
      dbgBtn.type = 'button';
      dbgBtn.id = 'kmj-v7-gear-debug-toggle';
      const on = isDebugActiveV7(g);
      dbgBtn.textContent = on ? '🛠️ デバッグ: ON (スタジオ開く)' : '🛠️ デバッグ: OFF';
      dbgBtn.style.cssText = `margin-top:6px;width:100%;padding:7px 8px;border-radius:6px;border:1.5px solid ${on ? '#34d399' : '#64748b'};background:${on ? 'linear-gradient(90deg,#059669,#0284c7)' : '#1e293b'};color:#fff;font-size:11px;font-weight:900;cursor:pointer;`;
      dbgBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isDebugActiveV7(g)) {
          openUnifiedDebugModalV7();
        } else {
          setDebugActiveV7(true, true);
        }
      });
      dbgBtn.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
      gearBox.appendChild(dbgBtn);
    }

    if (!gearBox.querySelector('#kmj-v7-gear-name-box')) {
      const curName = String(d.playerName || d.name || g?.player?.name || '冒険者');
      const escName = curName.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const nameWrap = document.createElement('div');
      nameWrap.id = 'kmj-v7-gear-name-box';
      nameWrap.style.cssText = 'margin-top:6px;padding:6px;border-radius:7px;background:rgba(15,23,42,0.96);border:1px solid #38bdf8;display:flex;flex-direction:column;gap:4px;';
      nameWrap.innerHTML = `
        <div style="font-size:10px;font-weight:900;color:#7dd3fc;">✏️ プレイヤー名 / コード入力</div>
        <div style="display:flex;gap:4px;align-items:center;">
          <input type="text" id="kmj-v7-gear-name-input" value="${escName}" maxlength="20" placeholder="名前 or debug777" style="flex:1;min-width:0;width:90px;background:#020617;border:1px solid #475569;color:#fff;border-radius:5px;padding:4px 6px;font-size:11px;font-weight:700;outline:none;" />
          <button type="button" id="kmj-v7-gear-name-save" style="background:#0284c7;border:none;color:#fff;border-radius:5px;padding:4px 8px;font-size:10.5px;font-weight:900;cursor:pointer;white-space:nowrap;">決定</button>
        </div>
      `;
      ['click', 'mousedown', 'touchstart'].forEach(ev => {
        nameWrap.addEventListener(ev, (e) => e.stopPropagation(), ev === 'touchstart' ? { passive: true } : false);
      });
      gearBox.appendChild(nameWrap);

      const inp = nameWrap.querySelector('#kmj-v7-gear-name-input');
      const btn = nameWrap.querySelector('#kmj-v7-gear-name-save');
      const applyInput = () => {
        const raw = (inp?.value || '').trim();
        if (!raw) return;
        if (/debug777/i.test(raw)) {
          inp.value = String(d.playerName || d.name || '冒険者');
          setDebugActiveV7(true, true);
          return;
        }
        if (g?.saveData) { g.saveData.name = raw; g.saveData.playerName = raw; }
        if (g?.player) g.player.name = raw;
        g?.refreshAllHUD?.();
        g?.saveGame?.(false);
        g?.showAlertBanner?.(`✅ 名前を「${raw}」に変更しました`, 1600);
      };
      inp?.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if (e.key === 'Enter') { e.preventDefault(); applyInput(); }
      });
      btn?.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); applyInput(); });
    }
  }

  // =========================================================
  // 1. 既存セーブデータの復元または初期データ生成・タイトル復旧
  // =========================================================
  function ensureSaveDataReady(inst) {
    if (!inst) return null;
    let saveKey = 'kaomoji_fantasy_3d_save';
    let loaded = null;

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k) continue;
        if (/kaomoji|kmj|fantasy|mmorpg|save/i.test(k)) {
          const raw = localStorage.getItem(k);
          if (raw && raw.startsWith('{')) {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object' && ('lv' in parsed || 'level' in parsed || 'gold' in parsed || 'kaomoji' in parsed)) {
              saveKey = k;
              loaded = parsed;
              break;
            }
          }
        }
      }
    } catch (e) {}

    inst._saveStorageKeyV7 = saveKey;
    const defaults = {
      name: '冒険者',
      kaomoji: '(・ω・)',
      lv: 1,
      level: 1,
      exp: 0,
      gold: 200,
      hp: 100,
      maxHp: 100,
      mp: 50,
      maxMp: 50,
      atk: 15,
      def: 8,
      threatRank: 0,
      equippedWeapon: 'wpn_wood',
      weaponId: 'wpn_wood',
      weaponEnhance: 0,
      evolutionId: '',
      skills: { slash_arc: 1 },
      skillLevels: { slash_arc: 1 },
      claimedAchievements: [],
      achievements: {},
      unlockedRolesV40: [''],
      unlockedPetEquips: ['none'],
      onlineMode: false,
      roomPassEnabled: false,
      roomPassword: ''
    };

    inst.saveData = Object.assign({}, defaults, inst.saveData || {}, loaded || {});
    if (!inst.saveData.skills) inst.saveData.skills = { slash_arc: 1 };
    if (!Array.isArray(inst.saveData.claimedAchievements)) inst.saveData.claimedAchievements = [];

    inst.dataReady = true;
    inst.isDataReady = true;
    inst.isReady = true;
    inst.loaded = true;

    if (typeof inst.saveGame !== 'function') {
      inst.saveGame = function () {
        try {
          localStorage.setItem(inst._saveStorageKeyV7 || saveKey, JSON.stringify(inst.saveData));
        } catch (e) {}
      };
    }
    return inst.saveData;
  }

  function findTitleOverlay() {
    const byId = document.querySelector('#title-screen, #title-overlay, #start-screen, #login-screen, .title-overlay, .title-screen');
    if (byId) return byId;
    const btns = Array.from(document.querySelectorAll('button'));
    const startBtn = btns.find(b => (b.textContent || '').includes('冒険を始める'));
    if (!startBtn) return null;
    let el = startBtn.parentElement;
    while (el && el !== document.body && el !== document.documentElement) {
      const st = window.getComputedStyle(el);
      if (st.position === 'fixed' || st.position === 'absolute' || el.offsetHeight >= window.innerHeight * 0.6) {
        return el;
      }
      el = el.parentElement;
    }
    return startBtn.parentElement;
  }

  function unblockTitleOverlay() {
    const overlay = findTitleOverlay();
    if (overlay) {
      overlay.style.zIndex = '950';
      overlay.style.pointerEvents = 'auto';
      overlay.querySelectorAll('button, input').forEach(el => {
        el.style.pointerEvents = 'auto';
      });
    }

    const startBtn = Array.from(document.querySelectorAll('button')).find(b => (b.textContent || '').includes('冒険を始める'));
    if (startBtn) {
      const r = startBtn.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        for (let i = 0; i < 5; i++) {
          const topEl = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
          if (!topEl || topEl === startBtn || startBtn.contains(topEl)) break;
          topEl.style.pointerEvents = 'none';
        }
      }
    }
  }

  function markTitleDataReady() {
    const inst = getOrCreateGameInstance(false);
    if (inst) ensureSaveDataReady(inst);

    document.querySelectorAll('div, span, p').forEach(el => {
      if (el.children.length === 0 && el.textContent.trim() === 'データ準備中...') {
        el.textContent = '✅ データ準備完了！冒険を始められます';
        el.style.color = '#34d399';
        el.style.fontWeight = '900';
      }
    });

    unblockTitleOverlay();
  }

  function launchGameSafely(forceNew = false) {
    const inst = getOrCreateGameInstance(true);
    if (!inst) return;

    try {
      if (forceNew) {
        try {
          localStorage.removeItem(inst._saveStorageKeyV7 || 'kaomoji_fantasy_3d_save');
        } catch (e) {}
        inst.saveData = null;
      }
      ensureSaveDataReady(inst);
      activateGameStartFlagsV7(inst);

      const overlay = findTitleOverlay();
      if (overlay) {
        overlay.style.display = 'none';
        overlay.classList.add('hidden');
      }

      const startMethods = ['startGame', 'beginGame', 'enterWorld', 'enterGame', 'start', 'play'];
      let started = false;
      for (const mName of startMethods) {
        if (typeof inst[mName] === 'function') {
          inst[mName]();
          started = true;
          break;
        }
      }

      activateGameStartFlagsV7(inst);

      if (!started || !inst._v7LoopStarted) {
        if (!inst._initCalledV7 && typeof inst.init === 'function') {
          inst._initCalledV7 = true;
          inst.init();
        }
        inst.buildPlayerEntity?.();
        inst.spawnMonsters?.();
        inst.refreshAllHUD?.();
        activateGameStartFlagsV7(inst);

        if (!inst._loopRunning && !inst._v7LoopStarted && typeof inst.update === 'function') {
          inst._v7LoopStarted = true;
          let lastT = performance.now();
          const tick = (now) => {
            const dt = Math.min(0.1, Math.max(0.001, (now - lastT) * 0.001));
            lastT = now;
            try {
              inst.update(dt);
              if (inst.renderer && inst.scene && inst.camera) {
                inst.renderer.render(inst.scene, inst.camera);
              }
            } catch (e) {
              reportKmjRuntimeError('game7:tick', e);
            }
            requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      }
    } catch (e) {
      reportKmjRuntimeError('ゲーム開始', e);
    }
  }

  function bindTitleRescueButtons() {
    if (window._v7TitleButtonsBound) return;
    window._v7TitleButtonsBound = true;

    document.addEventListener('click', (e) => {
      const btn = e.target?.closest?.('button');
      if (!btn) return;
      const txt = (btn.textContent || '').trim();

      if (txt.includes('冒険を始める')) {
        markTitleDataReady();
        activateGameStartFlagsV7();
        setTimeout(() => {
          activateGameStartFlagsV7();
          const overlay = findTitleOverlay();
          if (overlay && overlay.style.display !== 'none' && !overlay.classList.contains('hidden')) {
            launchGameSafely(false);
          }
        }, 120);
      }

      if (txt.includes('完全初期化して新規開始')) {
        setTimeout(() => {
          const overlay = findTitleOverlay();
          if (overlay && overlay.style.display !== 'none' && !overlay.classList.contains('hidden')) {
            if (confirm('セーブデータを完全に初期化して最初から始めますか？')) {
              launchGameSafely(true);
            }
          }
        }, 120);
      }

      if (txt.includes('オフライン') || txt.includes('オンライン')) {
        const before = txt;
        setTimeout(() => {
          if ((btn.textContent || '').trim() === before) {
            const inst = getOrCreateGameInstance(true);
            const nextOnline = before.includes('オフライン');
            if (inst?.saveData) inst.saveData.onlineMode = nextOnline;
            btn.textContent = nextOnline ? '🌐 オンライン' : '📴 オフライン';
            if (nextOnline) inst?.initMultiplayerMQTT?.();
          }
        }, 90);
      }

      if (txt.includes('パスワード:')) {
        const before = txt;
        setTimeout(() => {
          if ((btn.textContent || '').trim() === before) {
            const inst = getOrCreateGameInstance(true);
            const turnOn = before.includes('OFF');
            if (turnOn) {
              const pass = prompt('合言葉（ルームパスワード）を入力してください：', inst?.saveData?.roomPassword || '');
              if (pass && pass.trim()) {
                if (inst?.saveData) {
                  inst.saveData.roomPassEnabled = true;
                  inst.saveData.roomPassword = pass.trim();
                }
                btn.textContent = '🔒 パスワード: ON';
              }
            } else {
              if (inst?.saveData) inst.saveData.roomPassEnabled = false;
              btn.textContent = '🔓 パスワード: OFF';
            }
          }
        }, 90);
      }
    }, true);
  }

  // =========================================================
  // 2. 状態異常・自動実績システム
  // =========================================================
  if (typeof KaomojiMMORPG !== 'undefined') {
    Object.assign(KaomojiMMORPG.prototype, {
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
            (this.spawnFloatText || this.spawnFloatingText)?.call(this, m.pos, st.label, st.color);
          }
        });
      },

      processMonsterStatusTicksV7(dt) {
        if (!Array.isArray(this.monsters)) return;
        this._statusTickAccumV7 = (this._statusTickAccumV7 || 0) + dt;
        const doDotTick = this._statusTickAccumV7 >= 1.0;
        if (doDotTick) this._statusTickAccumV7 -= 1.0;

        this.monsters.forEach(m => {
          if (!m || m.dead) return;
          const stType = this.detectMonsterStatus ? this.detectMonsterStatus(m) : m._visualStatus?.type;
          if (!stType) return;

          if ((stType === 'freeze' || stType === 'shock') && typeof m.spd === 'number') {
            if (m._origSpdV7 === undefined) m._origSpdV7 = m.spd;
            m.spd = m._origSpdV7 * (stType === 'freeze' ? 0.25 : 0.45);
          } else if (m._origSpdV7 !== undefined) {
            m.spd = m._origSpdV7;
            delete m._origSpdV7;
          }

          if (doDotTick && (stType === 'burn' || stType === 'poison')) {
            const maxHp = Math.max(20, Number(m.maxHp || m.hp || 50));
            const dotDmg = Math.max(3, Math.floor(maxHp * (stType === 'burn' ? 0.045 : 0.055)));
            if (typeof this.applyMagicProjectileHitDamageV40 === 'function') {
              this.applyMagicProjectileHitDamageV40(m, dotDmg);
            } else {
              m.hp = Math.max(0, (Number(m.hp) || 0) - dotDmg);
              (this.spawnFloatText || this.spawnFloatingText)?.call(
                this,
                m.pos,
                stType === 'burn' ? `🔥${dotDmg}` : `☠️${dotDmg}`,
                stType === 'burn' ? '#fb923c' : '#c084fc'
              );
              if (m.hp <= 0 && !m.dead) {
                m.dead = true;
                m.respawnTimer = 4.0;
                this.grantMonsterRewards?.(m);
              }
            }
          }
        });
      },

      checkAutoAchievementsV7() {
        const d = this.saveData;
        if (!d || typeof ACHIEVEMENTS === 'undefined' || !ACHIEVEMENTS) return;
        if (!d.achievements || typeof d.achievements !== 'object' || Array.isArray(d.achievements)) d.achievements = {};
        if (!Array.isArray(d.claimedAchievements)) d.claimedAchievements = [];
        if (!d.statsV7) d.statsV7 = { kills: 0, bossKills: 0, skillsUsed: 0 };

        const lv = Number(d.lv ?? d.level ?? 1);
        const gold = Number(d.gold ?? d.coins ?? 0);
        const threat = Number(d.threatRank ?? d.threat ?? 0);
        const kills = Number(d.kills ?? d.killCount ?? d.statsV7.kills ?? 0);
        const bossKills = Number(d.bossKills ?? d.statsV7.bossKills ?? 0);
        const skillsUsed = Number(d.statsV7.skillsUsed ?? 0);

        const list = Array.isArray(ACHIEVEMENTS)
          ? ACHIEVEMENTS
          : Object.entries(ACHIEVEMENTS).map(([k, v]) => ({ id: k, ...(typeof v === 'object' ? v : { name: String(v) }) }));

        let newly = 0;
        list.forEach((ach, idx) => {
          const aid = String(ach.id || ach.achId || `ach_${idx}`);
          if (d.achievements[aid] === true || d.claimedAchievements.includes(aid) || ach.unlocked) return;

          let met = false;
          if (typeof ach.check === 'function') {
            try { met = !!ach.check(d); } catch (e) { met = false; }
          } else {
            const key = `${aid} ${ach.name || ''} ${ach.desc || ''}`.toLowerCase();
            if (/lv|レベル/.test(key)) met = lv >= (Number((key.match(/(\d+)/) || [])[1]) || 10);
            else if (/gold|ゴールド|金/.test(key)) met = gold >= (Number((key.match(/(\d+)/) || [])[1]) || 1000);
            else if (/boss|ボス|魔王|竜/.test(key)) met = bossKills >= (Number((key.match(/(\d+)/) || [])[1]) || 1);
            else if (/kill|討伐|撃破|敵/.test(key)) met = kills >= (Number((key.match(/(\d+)/) || [])[1]) || 10);
            else if (/skill|スキル|魔法/.test(key)) met = skillsUsed >= (Number((key.match(/(\d+)/) || [])[1]) || 5);
            else if (/threat|脅威/.test(key)) met = threat >= (Number((key.match(/(\d+)/) || [])[1]) || 5);
            else met = lv >= (idx + 1) * 5 || kills >= (idx + 1) * 8;
          }

          if (met) {
            d.achievements[aid] = true;
            if (!d.claimedAchievements.includes(aid)) d.claimedAchievements.push(aid);
            ach.unlocked = true;
            ach.completed = true;
            newly++;
            this.pushSystemEventLog?.(`🏆 実績解除！「${ach.name || aid}」`, 2000);
          }
        });

        if (newly > 0) {
          this.syncAchievementPassiveBuffsV40?.();
          this.saveGame?.(false);
        }
      },

      installV7Hooks() {
        if (this._v7Installed) return;
        this._v7Installed = true;
        const proto = KaomojiMMORPG.prototype;

        ['startGame', 'beginGame', 'enterWorld', 'enterGame', 'start', 'play'].forEach(sFn => {
          if (typeof proto[sFn] === 'function' && !proto[`_v7Start_${sFn}`]) {
            const origStart = proto[sFn];
            proto[sFn] = function (...args) {
              activateGameStartFlagsV7(this);
              const res = origStart.apply(this, args);
              activateGameStartFlagsV7(this);
              return res;
            };
            proto[`_v7Start_${sFn}`] = true;
          }
        });

        ['init', 'refreshAllHUD', 'update'].forEach(fn => {
          if (typeof proto[fn] === 'function' && !proto[`_v7Safe_${fn}`]) {
            const orig = proto[fn];
            proto[fn] = function (...args) {
              window.__kmjInstance = this;
              if (fn === 'update') this._loopRunning = true;
              try {
                const res = orig.apply(this, args);
                if (fn === 'update') {
                  const safeDt = Math.min(0.1, Math.max(0.001, Number(args[0]) || 0.016));
                  this.processMonsterStatusTicksV7(safeDt);
                  this.updateMagicProjectilesV7?.(safeDt);
                }
                return res;
              } catch (err) {
                if (!this[`_v7ErrLogged_${fn}`]) {
                  this[`_v7ErrLogged_${fn}`] = true;
                  reportKmjRuntimeError(`game7:${fn}`, err);
                }
              }
            };
            proto[`_v7Safe_${fn}`] = true;
          }
        });

        ['useSkillSlot', 'executeSingleSkillCast', 'useSkill', 'castSkill'].forEach(fn => {
          if (typeof proto[fn] === 'function' && !proto[`_v7_${fn}`]) {
            const orig = proto[fn];
            proto[fn] = function (slotOrId, ...rest) {
              const slotIdx = typeof slotOrId === 'number' ? slotOrId : 0;
              const meta = this.resolveSkillMeta ? this.resolveSkillMeta(slotIdx) : null;
              const res = orig.apply(this, [slotOrId, ...rest]);
              if (res !== false) {
                if (this.saveData) {
                  if (!this.saveData.statsV7) this.saveData.statsV7 = { kills: 0, bossKills: 0, skillsUsed: 0 };
                  this.saveData.statsV7.skillsUsed++;
                }
                if (meta) this.applyElementalStatusToMonstersV7(meta.skillCategory, meta.skillLv || 1);
                this.checkAutoAchievementsV7();
              }
              return res;
            };
            proto[`_v7_${fn}`] = true;
          }
        });

        ['grantMonsterRewards', 'killMonster', 'onMonsterKilled'].forEach(fn => {
          if (typeof proto[fn] === 'function' && !proto[`_v7_${fn}`]) {
            const orig = proto[fn];
            proto[fn] = function (m, ...rest) {
              const res = orig.apply(this, [m, ...rest]);
              const d = this.saveData;
              if (d) {
                if (!d.statsV7) d.statsV7 = { kills: 0, bossKills: 0, skillsUsed: 0 };
                d.statsV7.kills++;
                if (m?.isBoss || m?.boss || (Number(m?.scale) || 1) >= 1.45) d.statsV7.bossKills++;
                const achSum = this.syncAchievementPassiveBuffsV40?.();
                if (achSum && achSum.rewardBonusPct > 0) {
                  d.exp = (Number(d.exp) || 0) + Math.floor((Number(m?.exp || 10)) * achSum.rewardBonusPct);
                  d.gold = (Number(d.gold) || 0) + Math.floor((Number(m?.gold || 8)) * achSum.rewardBonusPct);
                }
                this.checkAutoAchievementsV7();
              }
              return res;
            };
            proto[`_v7_${fn}`] = true;
          }
        });
      }
    });

    KaomojiMMORPG.prototype.installV7Hooks();
  }

  window.injectGearMenuV7 = injectGearMenuV7;
  window.syncDebugHudPillV7 = syncDebugHudPillV7;

  bindTitleRescueButtons();
  setTimeout(markTitleDataReady, 300);
  setTimeout(markTitleDataReady, 1000);
})();
// ▲▲▲ ここまで game7.js【1/2】 ▲▲▲
// ▼▼▼ ここから game7.js【2/2】（完全版：Lv.999クラス進化・魔法弾の飛翔＆命中＆着弾バースト・ペット火力連動・オンライン復旧） ▼▼▼
// =========================================================
// 3. Lv.999クラス進化・魔法弾の飛翔＆命中＆着弾バースト・驚異度上限開放
// =========================================================
(() => {
  'use strict';

  const CLASS_EVOLUTION_TREE_V45 = [
    {
      id: 'novice',
      name: '見習い冒険者',
      icon: '🗡️',
      reqLv: 1,
      cost: 0,
      weaponType: 'sword',
      fxStyle: 'novice_slash',
      fxName: '蒼き光の斬撃波',
      atkMult: 1.0, matkMult: 1.0, defMult: 1.0, hpMult: 1.0,
      desc: '基本の片手剣クラス。3連水平横振りで癖のない斬撃を放つ。'
    },
    {
      id: 'warrior',
      name: '重装戦士',
      icon: '⚔️',
      reqLv: 15,
      cost: 500,
      weaponType: 'sword',
      fxStyle: 'warrior_crimson',
      fxName: '紅蓮の豪快衝撃斬',
      atkMult: 1.28, matkMult: 0.95, defMult: 1.22, hpMult: 1.25,
      desc: 'Lv.15〜｜真紅の3連水平スラッシュで敵を粉砕する。'
    },
    {
      id: 'mage',
      name: '魔道士',
      icon: '🪄',
      reqLv: 15,
      cost: 500,
      weaponType: 'staff',
      fxStyle: 'mage_arcane',
      fxName: '蒼穹の魔導星弾',
      atkMult: 0.95, matkMult: 1.35, defMult: 1.08, hpMult: 1.12,
      desc: 'Lv.15〜｜杖クラス。回転魔法陣を纏う蒼い魔導弾を遠距離発射する。'
    },
    {
      id: 'paladin',
      name: '聖騎士（パラディン）',
      icon: '🛡️',
      reqLv: 50,
      cost: 2500,
      weaponType: 'sword',
      fxStyle: 'paladin_holy',
      fxName: '黄金の聖光十字斬',
      atkMult: 1.48, matkMult: 1.25, defMult: 1.55, hpMult: 1.50,
      desc: 'Lv.50〜｜黄金と白銀が交差する聖なる3連斬撃を放つ守護騎士。'
    },
    {
      id: 'archmage',
      name: '大賢者（アークメイジ）',
      icon: '🔮',
      reqLv: 50,
      cost: 2500,
      weaponType: 'staff',
      fxStyle: 'archmage_meteor',
      fxName: '深淵の紫電流星弾',
      atkMult: 1.10, matkMult: 1.68, defMult: 1.28, hpMult: 1.32,
      desc: 'Lv.50〜｜杖クラス。紫と黄金の多重魔法陣から極大魔力弾を撃ち出す。'
    },
    {
      id: 'ninja',
      name: '疾風の影忍者',
      icon: '🌪️',
      reqLv: 100,
      cost: 6000,
      weaponType: 'sword',
      fxStyle: 'ninja_gale',
      fxName: '翠嵐の三連疾風刃',
      atkMult: 1.72, matkMult: 1.35, defMult: 1.38, hpMult: 1.45,
      desc: 'Lv.100〜｜エメラルドの3連水平斬撃波を巻き起こす神速クラス。'
    },
    {
      id: 'blade_master',
      name: '蒼穹の剣聖',
      icon: '⚡',
      reqLv: 200,
      cost: 15000,
      weaponType: 'sword',
      fxStyle: 'blademaster_thunder',
      fxName: '次元断ち・蒼雷クロス斬',
      atkMult: 2.05, matkMult: 1.45, defMult: 1.65, hpMult: 1.75,
      desc: 'Lv.200〜｜稲妻を纏う超高速3連横振り斬撃が炸裂する。'
    },
    {
      id: 'astral_witch',
      name: '星詠みの神官',
      icon: '🌟',
      reqLv: 200,
      cost: 15000,
      weaponType: 'staff',
      fxStyle: 'astral_star',
      fxName: '銀河の星屑プリズム弾',
      atkMult: 1.35, matkMult: 2.25, defMult: 1.62, hpMult: 1.68,
      desc: 'Lv.200〜｜杖クラス。桜色と黄金の星型魔力弾が着弾時に星屑バーストを起こす。'
    },
    {
      id: 'dragoon',
      name: '紅蓮の竜騎士',
      icon: '🐉',
      reqLv: 350,
      cost: 35000,
      weaponType: 'sword',
      fxStyle: 'dragoon_flame',
      fxName: '竜王の業火ブレイブ斬',
      atkMult: 2.48, matkMult: 1.85, defMult: 2.05, hpMult: 2.15,
      desc: 'Lv.350〜｜燃え盛る紅蓮の3連斬撃で竜の爪痕を刻む重撃クラス。'
    },
    {
      id: 'emperor_blade',
      name: '覇王・天帝剣神',
      icon: '👑',
      reqLv: 550,
      cost: 80000,
      weaponType: 'sword',
      fxStyle: 'emperor_gold',
      fxName: '天帝覇王・黄金螺旋斬',
      atkMult: 3.10, matkMult: 2.30, defMult: 2.60, hpMult: 2.75,
      desc: 'Lv.550〜｜黄金の3連螺旋斬撃波が周囲一帯を薙ぎ払う。'
    },
    {
      id: 'void_overlord',
      name: '虚空の創世魔導王',
      icon: '🌌',
      reqLv: 750,
      cost: 150000,
      weaponType: 'staff',
      fxStyle: 'overlord_void',
      fxName: 'アビスノヴァ・重力崩壊弾',
      atkMult: 2.20, matkMult: 3.45, defMult: 2.55, hpMult: 2.65,
      desc: 'Lv.750〜｜杖クラス。ブラックホールとネオン紫の多重リングを纏う禁断の魔導弾。'
    },
    {
      id: 'mythic_god',
      name: '創世神話・アルティメット顔文字神',
      icon: '🌈',
      reqLv: 999,
      cost: 500000,
      weaponType: 'sword',
      fxStyle: 'mythic_genesis',
      fxName: '創世神話・虹翼天翔ノヴァ斬',
      atkMult: 4.20, matkMult: 4.20, defMult: 3.60, hpMult: 3.80,
      desc: 'Lv.999到達の最終進化｜全属性の虹色3連大車輪斬撃が同時発動！'
    }
  ];

  function playMagicShotAudioV7(isHit = false) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!window._kmjV7AudioCtx) window._kmjV7AudioCtx = new AudioCtx();
      const ctx = window._kmjV7AudioCtx;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      if (isHit) {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(640, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.14);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(340, now + 0.13);
        gain.gain.setValueAtTime(0.045, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      }
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } catch (e) {}
  }

  if (!document.getElementById('kmj-v45-style')) {
    const st = document.createElement('style');
    st.id = 'kmj-v45-style';
    st.textContent = `
      .kmj-v45-class-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;max-height:360px;overflow-y:auto;padding-right:2px}
      .kmj-v45-online-pill{position:fixed;top:6px;right:8px;z-index:90;display:flex;align-items:center;gap:5px;background:rgba(15,23,42,.92);border:1.5px solid #38bdf8;border-radius:999px;padding:3px 10px;font-size:10.5px;font-weight:900;color:#e0f2fe;box-shadow:0 4px 12px rgba(0,0,0,.55);cursor:pointer;user-select:none}
      .kmj-v45-online-pill.is-offline{border-color:#64748b;color:#94a3b8}
      .kmj-v45-pet-atk-card{background:linear-gradient(135deg,rgba(30,41,59,.96),rgba(15,23,42,.98));border:1.5px solid #38bdf8;border-radius:9px;padding:8px 10px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;gap:8px}
    `;
    document.head.appendChild(st);
  }

  function installV45Core() {
    if (typeof KaomojiMMORPG === 'undefined') {
      setTimeout(installV45Core, 150);
      return;
    }

    const proto = KaomojiMMORPG.prototype;
    if (proto._v45CoreInstalled) return;
    proto._v45CoreInstalled = true;

    Object.assign(proto, {
      enforceThreatAndLevelCapsV45() {
        const MAX_LV = 999;
        const MAX_THREAT = 999;

        try {
          ['MAX_LV', 'MAX_LEVEL', 'LEVEL_CAP', 'MAX_PLAYER_LV', 'MAX_SKILL_LV'].forEach(k => {
            if (typeof window[k] === 'number' && window[k] < MAX_LV) window[k] = MAX_LV;
          });
          ['MAX_THREAT_RANK', 'MAX_THREAT', 'THREAT_CAP', 'MAX_THREAT_LEVEL', 'MAX_DANGER'].forEach(k => {
            if (typeof window[k] === 'number' && window[k] < MAX_THREAT) window[k] = MAX_THREAT;
          });
        } catch (e) {}

        const d = this.saveData;
        if (d) {
          if (typeof d.lv === 'number' && d.lv > MAX_LV) d.lv = MAX_LV;
          if (typeof d.level === 'number' && d.level > MAX_LV) d.level = MAX_LV;
          ['threatRank', 'threat', 'threatLevel', 'threatLv', 'danger', 'dangerLevel'].forEach(tk => {
            if (typeof d[tk] === 'number' && d[tk] > MAX_THREAT) d[tk] = MAX_THREAT;
            if (typeof this[tk] === 'number' && this[tk] > MAX_THREAT) this[tk] = MAX_THREAT;
          });
        }

        document.querySelectorAll('input[type="range"], input[type="number"]').forEach(inp => {
          const hint = `${inp.id || ''} ${inp.name || ''} ${inp.className || ''}`.toLowerCase();
          if (/threat|danger|rank|脅威|驚異/.test(hint)) {
            if (Number(inp.max) > 0 && Number(inp.max) < MAX_THREAT) inp.max = String(MAX_THREAT);
          }
        });
      },

      getClassEvolutionTreeV45() {
        return CLASS_EVOLUTION_TREE_V45;
      },

      getCurrentClassDefV45(evoIdOverride = null) {
        const d = this.saveData || {};
        const rawId = String(
          evoIdOverride ?? d.evolutionId ?? d.jobId ?? d.classId ?? this.player?.evolutionId ?? 'novice'
        );
        const found = CLASS_EVOLUTION_TREE_V45.find(c => c.id === rawId || (rawId === '' && c.id === 'novice'));
        if (found) return found;
        const isM = /mage|wizard|witch|sage|priest|魔道|魔導|魔法|賢者|神官/.test(rawId.toLowerCase());
        return {
          id: rawId || 'novice',
          name: rawId || '見習い冒険者',
          icon: isM ? '🪄' : '🗡️',
          reqLv: 1,
          cost: 0,
          weaponType: isM ? 'staff' : 'sword',
          fxStyle: isM ? 'mage_arcane' : 'novice_slash',
          fxName: isM ? '魔導弾' : '斬撃波',
          atkMult: 1.0, matkMult: 1.0, defMult: 1.0, hpMult: 1.0,
          desc: ''
        };
      },

      selectOrEvolveClassV45(classId, bypassCost = false) {
        const d = this.saveData;
        if (!d) return;
        const cls = CLASS_EVOLUTION_TREE_V45.find(c => c.id === classId);
        if (!cls) return;

        const playerLv = Math.max(1, Number(d.lv ?? d.level ?? this.player?.lv ?? 1));
        if (!bypassCost && !this._debugInfiniteMode && playerLv < cls.reqLv) {
          this.showAlertBanner?.(`🔒 必要Lv不足！（必要: Lv.${cls.reqLv} / 現在: Lv.${playerLv}）`, 1800);
          return;
        }

        if (!Array.isArray(d.unlockedClassesV45)) d.unlockedClassesV45 = ['novice'];
        const alreadyUnlocked = cls.cost <= 0 || d.unlockedClassesV45.includes(cls.id) || bypassCost || this._debugInfiniteMode;
        const coinKey = ('gold' in d) ? 'gold' : (('coins' in d) ? 'coins' : 'gold');
        const curGold = Number(d[coinKey]) || 0;

        if (!alreadyUnlocked) {
          if (curGold < cls.cost) {
            this.showAlertBanner?.(`💰 ゴールド不足！（必要: ${cls.cost.toLocaleString()}G / 所持: ${curGold.toLocaleString()}G）`, 1800);
            return;
          }
          d[coinKey] = curGold - cls.cost;
          d.unlockedClassesV45.push(cls.id);
          if (typeof sfx !== 'undefined') sfx?.playHeal?.();
        } else {
          if (typeof sfx !== 'undefined') sfx?.playTone?.(780, 'sine', 0.12, 0.08);
        }

        const saveId = cls.id === 'novice' ? '' : cls.id;
        ['evolutionId', 'evolution', 'evoId', 'evo', 'jobId', 'job', 'classId', 'class', 'role'].forEach(k => {
          d[k] = saveId;
        });
        if (this.player) {
          this.player.evolutionId = saveId;
          this.player.job = saveId;
          this.player.classId = saveId;
        }

        this.syncMageWeaponNamesV22?.();
        this.buildPlayerEntity?.();
        if (this.player && typeof this.enforceStrictWeaponVisualV27 === 'function') {
          this.enforceStrictWeaponVisualV27(this.player, saveId);
        }
        this.saveGame?.(false);
        this.broadcastPlayerPacket?.('sync');
        this.refreshAllHUD?.();

        this.showAlertBanner?.(
          `${cls.icon} クラス「${cls.name}」へ進化・切替！【通常攻撃: ${cls.weaponType === 'staff' ? '🪄魔法弾' : '⚔️3連横振り'}】`,
          2400
        );
      },

      // 着弾バースト3Dエフェクト生成
      spawnMagicHitBurstV7(x, y, z, cfg) {
        if (!this.useWebGL || !this.scene || typeof THREE === 'undefined') return;
        if (!this._v7MagicBursts) this._v7MagicBursts = [];

        const root = new THREE.Group();
        root.position.set(x, y, z);

        const flashMat = new THREE.MeshBasicMaterial({ color: cfg.core, transparent: true, opacity: 0.96 });
        const flashSphere = new THREE.Mesh(new THREE.SphereGeometry(0.42 * cfg.size, 14, 14), flashMat);
        root.add(flashSphere);

        const wave1Mat = new THREE.MeshBasicMaterial({ color: cfg.aura, side: THREE.DoubleSide, transparent: true, opacity: 0.95 });
        const wave1 = new THREE.Mesh(new THREE.RingGeometry(0.25 * cfg.size, 0.72 * cfg.size, 24), wave1Mat);
        wave1.rotation.x = -Math.PI / 2;
        wave1.position.y = -y + 0.12;
        root.add(wave1);

        const wave2Mat = new THREE.MeshBasicMaterial({ color: cfg.ring, side: THREE.DoubleSide, transparent: true, opacity: 0.92 });
        const wave2 = new THREE.Mesh(new THREE.RingGeometry(0.30 * cfg.size, 0.65 * cfg.size, 20), wave2Mat);
        root.add(wave2);

        const shards = [];
        const sCount = 10;
        for (let i = 0; i < sCount; i++) {
          const ang = (Math.PI * 2 * i) / sCount;
          const elev = ((i % 3) - 1) * 0.45;
          const sMat = new THREE.MeshBasicMaterial({
            color: i % 2 === 0 ? cfg.aura : cfg.ring,
            transparent: true,
            opacity: 0.96
          });
          const shard = new THREE.Mesh(new THREE.OctahedronGeometry(0.18 * cfg.size, 0), sMat);
          root.add(shard);
          shards.push({
            mesh: shard,
            mat: sMat,
            vx: Math.cos(ang) * (5.5 + (i % 3) * 1.4),
            vy: 2.2 + elev * 3.5,
            vz: Math.sin(ang) * (5.5 + (i % 3) * 1.4)
          });
        }

        this.scene.add(root);
        this._v7MagicBursts.push({
          root, flashSphere, flashMat, wave1, wave1Mat, wave2, wave2Mat, shards,
          elapsed: 0, duration: 0.36
        });
      },

      // 魔法弾の毎フレーム飛翔・敵命中判定・ダメージ・バースト更新
      updateMagicProjectilesV7(dt) {
        if (!this.scene) return;

        if (Array.isArray(this._v22MagicShots) && this._v22MagicShots.length > 0) {
          for (let i = this._v22MagicShots.length - 1; i >= 0; i--) {
            const shot = this._v22MagicShots[i];
            shot.life -= dt;

            if (shot.grp) {
              shot.grp.position.x += shot.vx * dt;
              shot.grp.position.z += shot.vz * dt;
              if (shot.aura) shot.aura.rotation.y += dt * 8.5;
              if (shot.ring) shot.ring.rotation.z += dt * 11.0;
              if (shot.ring2) shot.ring2.rotation.y -= dt * 9.0;
            }

            let hitMonster = null;
            if (shot.grp && Array.isArray(this.monsters)) {
              const sx = shot.grp.position.x;
              const sz = shot.grp.position.z;
              const shotSize = shot.cfg?.size || 1.0;

              for (let mIdx = 0; mIdx < this.monsters.length; mIdx++) {
                const m = this.monsters[mIdx];
                if (!m || m.dead || !m.pos) continue;
                const mRadius = Math.max(1.35, (Number(m.scale) || 1) * 1.15) * Math.max(1.0, shotSize * 0.92);
                const dist = Math.hypot(m.pos.x - sx, m.pos.z - sz);
                if (dist <= mRadius) {
                  hitMonster = m;
                  break;
                }
              }
            }

            if (hitMonster) {
              const hx = shot.grp.position.x;
              const hy = shot.grp.position.y;
              const hz = shot.grp.position.z;
              this.spawnMagicHitBurstV7(hx, hy, hz, shot.cfg || { core: 0xffffff, aura: 0x38bdf8, ring: 0xfde047, size: 1.0 });

              if (shot.isLocal && !shot.hitDone) {
                shot.hitDone = true;
                playMagicShotAudioV7(true);
                const dmg = Math.max(1, Math.floor(Number(shot.magicDmg) || 20));
                if (typeof this.applyMagicProjectileHitDamageV40 === 'function') {
                  this.applyMagicProjectileHitDamageV40(hitMonster, dmg);
                } else if (typeof this.damageMonster === 'function') {
                  this.damageMonster(hitMonster, dmg, false, '🪄');
                }
              }
              shot.life = 0;
            }

            if (shot.life <= 0) {
              try {
                if (shot.grp) {
                  this.scene.remove(shot.grp);
                  shot.grp.traverse?.(o => {
                    o.geometry?.dispose?.();
                    o.material?.dispose?.();
                  });
                }
              } catch (e) {}
              this._v22MagicShots.splice(i, 1);
            }
          }
        }

        if (Array.isArray(this._v7MagicBursts) && this._v7MagicBursts.length > 0) {
          for (let i = this._v7MagicBursts.length - 1; i >= 0; i--) {
            const b = this._v7MagicBursts[i];
            b.elapsed += dt;
            const p = Math.min(1, b.elapsed / b.duration);

            b.flashSphere.scale.setScalar(1 + p * 2.4);
            b.flashMat.opacity = Math.max(0, (1 - p) * 0.96);

            b.wave1.scale.setScalar(1 + p * 3.8);
            b.wave1Mat.opacity = Math.max(0, (1 - p) * 0.95);

            b.wave2.scale.setScalar(1 + p * 3.1);
            b.wave2.rotation.z = b.elapsed * 9;
            b.wave2Mat.opacity = Math.max(0, (1 - p) * 0.92);

            b.shards.forEach(s => {
              s.mesh.position.set(s.vx * p, s.vy * p - 3.2 * p * p, s.vz * p);
              s.mesh.rotation.set(b.elapsed * 10, b.elapsed * 8, 0);
              s.mat.opacity = Math.max(0, (1 - p) * 0.96);
            });

            if (p >= 1) {
              try {
                this.scene.remove(b.root);
                b.root.traverse?.(o => {
                  o.geometry?.dispose?.();
                  o.material?.dispose?.();
                });
              } catch (e) {}
              this._v7MagicBursts.splice(i, 1);
            }
          }
        }
      },

      spawnClassBasicAttackEffectV45(entity, isLocal = false, evoIdOverride = null) {
        if (!this.useWebGL || !this.scene || !entity?.pos || typeof THREE === 'undefined') return;
        const cls = this.getCurrentClassDefV45(isLocal ? null : (evoIdOverride || entity.evolutionId));
        const style = cls.fxStyle || 'novice_slash';
        let rotY = entity.rotY || 0;

        // 杖クラスの場合は魔法弾を生成して飛翔＆命中ループへ登録
        if (cls.weaponType === 'staff') {
          if (!this._v22MagicShots) this._v22MagicShots = [];

          // 前方付近の敵へわずかにホーミング補正して命中率を安定化
          if (isLocal && Array.isArray(this.monsters)) {
            let bestDist = 14.0;
            let bestAng = rotY;
            this.monsters.forEach(m => {
              if (!m || m.dead || !m.pos) return;
              const dx = m.pos.x - entity.pos.x;
              const dz = m.pos.z - entity.pos.z;
              const dist = Math.hypot(dx, dz);
              if (dist < bestDist) {
                const angToM = Math.atan2(dx, dz);
                let diff = angToM - rotY;
                while (diff > Math.PI) diff -= Math.PI * 2;
                while (diff < -Math.PI) diff += Math.PI * 2;
                if (Math.abs(diff) <= 0.75) {
                  bestDist = dist;
                  bestAng = angToM;
                }
              }
            });
            rotY = bestAng;
          }

          const dirX = Math.sin(rotY);
          const dirZ = Math.cos(rotY);

          const paletteMap = {
            mage_arcane: { core: 0xffffff, aura: 0x38bdf8, ring: 0x60a5fa, size: 1.05 },
            archmage_meteor: { core: 0xfef08a, aura: 0xa855f7, ring: 0xf97316, size: 1.38 },
            astral_star: { core: 0xffffff, aura: 0xf472b6, ring: 0xfde047, size: 1.52 },
            overlord_void: { core: 0x090d16, aura: 0x9333ea, ring: 0xf43f5e, size: 1.85 }
          };
          const cfg = paletteMap[style] || paletteMap.mage_arcane;

          const grp = new THREE.Group();
          const core = new THREE.Mesh(
            new THREE.SphereGeometry(0.30 * cfg.size, 14, 14),
            new THREE.MeshBasicMaterial({ color: cfg.core })
          );
          const auraMat = new THREE.MeshBasicMaterial({ color: cfg.aura, transparent: true, opacity: 0.85 });
          const aura = new THREE.Mesh(new THREE.OctahedronGeometry(0.48 * cfg.size, 0), auraMat);
          const ringMat = new THREE.MeshBasicMaterial({ color: cfg.ring, side: THREE.DoubleSide, transparent: true, opacity: 0.94 });
          const ring = new THREE.Mesh(new THREE.TorusGeometry(0.52 * cfg.size, 0.06 * cfg.size, 8, 22), ringMat);
          grp.add(core, aura, ring);

          let ring2 = null;
          if (style === 'overlord_void' || style === 'astral_star') {
            ring2 = new THREE.Mesh(
              new THREE.TorusGeometry(0.72 * cfg.size, 0.045, 8, 22),
              new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
            );
            ring2.rotation.x = Math.PI * 0.45;
            grp.add(ring2);
          }

          grp.position.set(entity.pos.x + dirX * 1.15, 1.25, entity.pos.z + dirZ * 1.15);
          grp.rotation.y = rotY;
          this.scene.add(grp);

          if (isLocal) playMagicShotAudioV7(false);

          let magicDmg = 20;
          if (isLocal) {
            if (typeof this.calcMagicAttackPowerV40 === 'function') {
              magicDmg = this.calcMagicAttackPowerV40();
            } else if (typeof this.calcDerivedStats === 'function') {
              const st = this.calcDerivedStats();
              magicDmg = Math.max(15, Math.floor((st.physAtk || 15) * (st.magMult || 1.0)));
            }
          }

          this._v22MagicShots.push({
            grp, aura, ring, ring2, auraMat, ringMat, cfg,
            vx: dirX * 22.0, vz: dirZ * 22.0,
            life: 0.65, maxLife: 0.65,
            isLocal, magicDmg, hitDone: false
          });
          return;
        }

        // 剣クラスは game8.js の3連水平横振りへ委譲
        if (typeof window.triggerSwordSwingAndSlashV8 === 'function') {
          window.triggerSwordSwingAndSlashV8(this, entity);
        }
      }
    });
  }

  installV45Core();
})();

// =========================================================
// 4. ペット火力プレイヤー参照化・オンライン復旧・Lv.999クラス選択UI
// =========================================================
(() => {
  'use strict';

  function installV45Part2() {
    if (typeof KaomojiMMORPG === 'undefined') {
      setTimeout(installV45Part2, 150);
      return;
    }

    const proto = KaomojiMMORPG.prototype;
    if (proto._v45Part2Installed) return;
    proto._v45Part2Installed = true;

    Object.assign(proto, {
      calcPetAttackPowerV45() {
        const st = typeof this.calcDerivedStats === 'function'
          ? (this.calcDerivedStats() || {})
          : (typeof this.getPlayerStats === 'function' ? (this.getPlayerStats() || {}) : {});
        const d = this.saveData || {};
        const pAtk = Number(st.physAtk ?? st.atk ?? d.atk ?? 15);
        const pMagMult = Number(st.magMult ?? 1.0);
        const pMatk = Number(st.matk ?? st.mAtk ?? d.matk ?? Math.floor(pAtk * pMagMult));
        const playerRefPower = Math.max(10, pAtk, pMatk);

        const petInfo = typeof this.getMyPetSyncInfo === 'function' ? this.getMyPetSyncInfo() : null;
        const petLv = Math.max(1, Number(petInfo?.lv || this.pet?.lv || d.pet?.lv || 1));
        const eqId = petInfo?.equipId || d.pet?.equip || 'none';
        const petEq = typeof this.getPetEquipDef === 'function' ? this.getPetEquipDef(eqId) : { atkPct: 0 };

        const mult = 0.75 + Math.min(1.25, (petLv - 1) * 0.015) + (Number(petEq?.atkPct) || 0);
        return Math.max(5, Math.floor(playerRefPower * mult));
      },

      syncPetStatsFromPlayerV45() {
        if (!this.pet) return;
        const petAtk = this.calcPetAttackPowerV45();
        this.pet.atk = petAtk;
        this.pet.attack = petAtk;
        this.pet.power = petAtk;
        this.pet.dmg = petAtk;
        this.pet.damage = petAtk;
        if (this.saveData) {
          this.saveData.petAtk = petAtk;
        }
      },

      ensureOnlineSystemV45() {
        const d = this.saveData || {};
        if (d.onlineMode === undefined) d.onlineMode = false;

        if (d.onlineMode && typeof this.initMultiplayerMQTT === 'function') {
          if (!this._mqttClient || !this._mqttClient.connected) {
            this.initMultiplayerMQTT();
          }
        }

        let pill = document.getElementById('kmj-v45-online-pill');
        if (!pill) {
          pill = document.createElement('div');
          pill.id = 'kmj-v45-online-pill';
          pill.className = 'kmj-v45-online-pill';
          pill.title = 'タップでオンライン / オフライン切替';
          pill.onclick = () => {
            if (!this.saveData) return;
            this.saveData.onlineMode = !this.saveData.onlineMode;
            this.saveGame?.(false);
            if (this.saveData.onlineMode) {
              this._mqttStarted = false;
              this.initMultiplayerMQTT?.();
              this.showAlertBanner?.('🌐 オンラインモードに接続しました！', 1600);
            } else {
              try { this._mqttClient?.end?.(true); } catch (e) {}
              this.showAlertBanner?.('📴 オフラインモードに切り替えました', 1600);
            }
            this.updateOnlinePillUIv45();
          };
          document.body.appendChild(pill);
        }
        this.updateOnlinePillUIv45();
      },

      updateOnlinePillUIv45() {
        const pill = document.getElementById('kmj-v45-online-pill');
        if (!pill) return;
        const isOnline = Boolean(this.saveData?.onlineMode);
        const isConnected = Boolean(this._mqttClient && this._mqttClient.connected);
        const peerCount = (this.remotePlayers ? this.remotePlayers.size : 0) + (isOnline ? 1 : 0);
        const roomLabel = this.saveData?.roomPassEnabled ? `🔒合言葉部屋` : '全体広場';

        if (!isOnline) {
          pill.classList.add('is-offline');
          pill.textContent = '📴 オフライン (タップで接続)';
        } else if (isConnected) {
          pill.classList.remove('is-offline');
          pill.textContent = `🌐 オンライン(${peerCount}人)｜${roomLabel}`;
        } else {
          pill.classList.remove('is-offline');
          pill.textContent = `🔄 オンライン接続中...`;
        }
      },

      renderV45ClassAndPetPanels() {
        const d = this.saveData || {};
        const curGold = Number(d.gold ?? d.coins ?? d.money ?? 0);
        const playerLv = Math.max(1, Number(d.lv ?? d.level ?? this.player?.lv ?? 1));
        const curCls = this.getCurrentClassDefV45();
        const tree = typeof this.getClassEvolutionTreeV45 === 'function' ? this.getClassEvolutionTreeV45() : [];
        if (!Array.isArray(d.unlockedClassesV45)) d.unlockedClassesV45 = ['novice'];

        const evoContainer = document.querySelector('#tab-evolution, #panel-evolution, #evolution-panel, [data-tab-panel="evolution"], [data-panel="evolution"]');
        if (evoContainer && tree.length > 0) {
          document.getElementById('kmj-gold-role-box-v40')?.remove();
          let clsBox = document.getElementById('kmj-class-tree-box-v45');
          if (!clsBox) {
            clsBox = document.createElement('div');
            clsBox.id = 'kmj-class-tree-box-v45';
            clsBox.style.cssText = 'background:rgba(15,23,42,.96);border:1.5px solid #38bdf8;border-radius:10px;padding:10px;margin-bottom:10px;';
            evoContainer.insertBefore(clsBox, evoContainer.firstChild);
          }

          const sig = `${curCls.id}|${playerLv}|${curGold}|${d.unlockedClassesV45.join(',')}`;
          if (clsBox.dataset.sig !== sig) {
            clsBox.dataset.sig = sig;
            clsBox.innerHTML = `
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;">
                <span style="font-size:12px;font-weight:900;color:#7dd3fc;">⚜️ Lv.999 クラス進化＆自由転職ツリー</span>
                <span style="font-size:11px;font-weight:900;color:#fde047;">Lv.${playerLv} / 💰${curGold.toLocaleString()}G</span>
              </div>
              <div style="font-size:10px;color:#cbd5e1;margin-bottom:8px;line-height:1.35;">
                現在クラス: <b style="color:#34d399;">${curCls.icon} ${curCls.name}</b>（通常攻撃: <b style="color:#f472b6;">${curCls.weaponType === 'staff' ? '🪄魔法弾発射' : '⚔️3連水平横振り'}</b>）<br>
                ※ 一度解放したクラスは<b>いつでも無料で自由に切り替え可能</b>！杖クラスは魔法弾、剣クラスは3連横振りに自動切替します。
              </div>
              <div class="kmj-v45-class-grid">
                ${tree.map(c => {
                  const isCurrent = curCls.id === c.id;
                  const isUnlocked = c.cost <= 0 || d.unlockedClassesV45.includes(c.id);
                  const canReachLv = playerLv >= c.reqLv || this._debugInfiniteMode;
                  const wBadge = c.weaponType === 'staff'
                    ? '<span style="background:#581c87;color:#f5d0fe;padding:1px 5px;border-radius:4px;font-size:9px;">🪄杖・魔法弾</span>'
                    : '<span style="background:#1e3a8a;color:#bae6fd;padding:1px 5px;border-radius:4px;font-size:9px;">🗡️剣・3連斬</span>';

                  let btnTxt = '';
                  let btnBg = '#334155';
                  let disabled = false;
                  if (isCurrent) {
                    btnTxt = '✅ 現在のクラス';
                    btnBg = '#059669';
                    disabled = true;
                  } else if (isUnlocked) {
                    btnTxt = '🔄 このクラスを選ぶ（無料）';
                    btnBg = '#0284c7';
                  } else if (!canReachLv) {
                    btnTxt = `🔒 Lv.${c.reqLv} で解放`;
                    btnBg = '#1e293b';
                    disabled = true;
                  } else {
                    btnTxt = `✨ 進化解放 (${c.cost.toLocaleString()}G)`;
                    btnBg = curGold >= c.cost ? '#d97706' : '#475569';
                  }

                  return `
                    <div style="background:#1e293b;border:1.5px solid ${isCurrent ? '#34d399' : (isUnlocked ? '#38bdf8' : '#334155')};border-radius:8px;padding:7px;display:flex;flex-direction:column;justify-content:space-between;gap:4px;">
                      <div>
                        <div style="display:flex;align-items:center;justify-content:space-between;gap:3px;">
                          <span style="font-size:11px;font-weight:900;color:#fff;">${c.icon} ${c.name}</span>
                          ${wBadge}
                        </div>
                        <div style="font-size:9.5px;color:#f472b6;font-weight:800;margin-top:2px;">✦ 攻撃演出: ${c.fxName}</div>
                        <div style="font-size:9px;color:#94a3b8;line-height:1.3;margin-top:2px;">${c.desc}</div>
                      </div>
                      <button type="button" class="btn-v45-select-class" data-cid="${c.id}" ${disabled ? 'disabled' : ''} style="width:100%;background:${btnBg};border:none;color:#fff;border-radius:5px;padding:4px 6px;font-size:10px;font-weight:900;cursor:${disabled ? 'default' : 'pointer'};opacity:${disabled && !isCurrent ? '0.65' : '1'};">${btnTxt}</button>
                    </div>
                  `;
                }).join('')}
              </div>
            `;
            clsBox.querySelectorAll('.btn-v45-select-class').forEach(btn => {
              btn.onclick = () => {
                this.selectOrEvolveClassV45(btn.dataset.cid, false);
                this.renderV45ClassAndPetPanels();
              };
            });
          }
        }

        const petContainer = document.querySelector('#tab-pet, #tab-pets, #panel-pet, #pet-panel, [data-tab-panel="pet"], [data-tab-panel="pets"]');
        if (petContainer) {
          let atkCard = document.getElementById('kmj-v45-pet-atk-card');
          if (!atkCard) {
            atkCard = document.createElement('div');
            atkCard.id = 'kmj-v45-pet-atk-card';
            atkCard.className = 'kmj-v45-pet-atk-card';
            petContainer.insertBefore(atkCard, petContainer.firstChild);
          }
          const petAtk = this.calcPetAttackPowerV45();
          const st = typeof this.calcDerivedStats === 'function' ? (this.calcDerivedStats() || {}) : {};
          const pAtk = Number(st.physAtk || 15);
          const pMatk = Math.floor(pAtk * Number(st.magMult || 1.0));
          const pRef = Math.max(10, pAtk, pMatk);
          const sig = `${petAtk}|${pRef}`;
          if (atkCard.dataset.sig !== sig) {
            atkCard.dataset.sig = sig;
            atkCard.innerHTML = `
              <div>
                <div style="font-size:11px;font-weight:900;color:#7dd3fc;">🐾 相棒ペット実効火力（プレイヤー参照）</div>
                <div style="font-size:9.5px;color:#94a3b8;">あなたの攻撃力/魔力 (${pRef.toLocaleString()}) ＋ ペットLv・装備補正に連動</div>
              </div>
              <div style="font-size:15px;font-weight:900;color:#fde047;text-shadow:0 0 8px rgba(250,204,21,.45);">⚔️ ${petAtk.toLocaleString()}</div>
            `;
          }
        }
      },

      installV45MasterHooks() {
        if (this._v45MasterHooked) return;
        this._v45MasterHooked = true;

        if (typeof proto.calcDerivedStats === 'function' && !proto._v45DerivedStatsWrapped) {
          const origDerived = proto.calcDerivedStats;
          proto.calcDerivedStats = function (...args) {
            const st = origDerived.apply(this, args) || {};
            try {
              const cls = this.getCurrentClassDefV45();
              if (cls && cls.id !== 'novice') {
                if (typeof st.physAtk === 'number') st.physAtk = Math.max(1, Math.floor(st.physAtk * (cls.atkMult || 1.0)));
                if (typeof st.magMult === 'number') st.magMult = Number((st.magMult * (cls.matkMult || 1.0)).toFixed(3));
                if (typeof st.def === 'number') st.def = Math.max(0, Math.floor(st.def * (cls.defMult || 1.0)));
                if (typeof st.maxHp === 'number') st.maxHp = Math.max(20, Math.floor(st.maxHp * (cls.hpMult || 1.0)));
              }
            } catch (e) {}
            return st;
          };
          proto._v45DerivedStatsWrapped = true;
        }

        if (typeof proto.triggerAttackVisual === 'function' && !proto._v45AtkVisWrapped) {
          const origVis = proto.triggerAttackVisual;
          proto.triggerAttackVisual = function (entity, isSkill = false, skillInfo = null) {
            return routeBasicAttackVisualV7(this, entity, isSkill, skillInfo, origVis);
          };
          proto._v45AtkVisWrapped = true;
        }

        if (typeof proto.broadcastPlayerPacket === 'function' && !proto._v45BcastWrapped) {
          const origBcast = proto.broadcastPlayerPacket;
          proto.broadcastPlayerPacket = function (type = 'sync', extra = {}) {
            if (this.saveData?.onlineMode === false) return;
            const cls = this.getCurrentClassDefV45();
            return origBcast.apply(this, [type, {
              evolutionId: cls.id === 'novice' ? '' : cls.id,
              classId: cls.id,
              ...extra
            }]);
          };
          proto._v45BcastWrapped = true;
        }

        if (typeof proto.refreshAllHUD === 'function' && !proto._v45HudWrapped) {
          const origHud = proto.refreshAllHUD;
          proto.refreshAllHUD = function (...args) {
            try {
              this.enforceThreatAndLevelCapsV45();
              this.syncPetStatsFromPlayerV45();
            } catch (e) {}
            const res = origHud.apply(this, args);
            try {
              this.renderV45ClassAndPetPanels();
              this.ensureOnlineSystemV45();
            } catch (e) {}
            return res;
          };
          proto._v45HudWrapped = true;
        }

        if (typeof proto.update === 'function' && !proto._v45UpdateWrapped) {
          const origUpdate = proto.update;
          proto.update = function (dt = 0.016, ...rest) {
            try {
              this.enforceThreatAndLevelCapsV45();
              this.syncPetStatsFromPlayerV45();
            } catch (e) {}
            const res = origUpdate.apply(this, [dt, ...rest]);
            try {
              if (!this._v45NetCheckTimer || (performance.now() - this._v45NetCheckTimer) > 2000) {
                this._v45NetCheckTimer = performance.now();
                this.ensureOnlineSystemV45();
              }
            } catch (e) {}
            return res;
          };
          proto._v45UpdateWrapped = true;
        }
      }
    });

    proto.installV45MasterHooks();

    setTimeout(() => {
      const inst = window.__kmjInstance || window.game || window.app || window.mmorpg;
      if (inst) {
        inst.enforceThreatAndLevelCapsV45?.();
        inst.syncPetStatsFromPlayerV45?.();
        inst.ensureOnlineSystemV45?.();
        inst.renderV45ClassAndPetPanels?.();
        inst.refreshAllHUD?.();
      }
    }, 350);
  }

  installV45Part2();

  let _lastGearCheckV7 = 0;
  document.addEventListener('click', () => {
    const now = performance.now();
    if (now - _lastGearCheckV7 < 300) return;
    _lastGearCheckV7 = now;
    setTimeout(() => {
      window.injectGearMenuV7?.();
      window.syncDebugHudPillV7?.();
    }, 50);
  }, true);

  window.addEventListener('load', () => {
    setTimeout(() => {
      window.syncDebugHudPillV7?.();
    }, 800);
  });
})();
// ▲▲▲ ここまで game7.js ▲▲▲
