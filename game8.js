// ▼▼▼ ここから【クリーン統合版 game8.js 1/2】素MP消費5倍(50〜)・驚異度999即時反映・格上1Lv毎+1.5倍加算 ▼▼▼
(() => {
  'use strict';

  const MAX_LV_999 = 999;
  const MAX_THREAT_999 = 999;

  try {
    ['MAX_LV', 'MAX_LEVEL', 'LEVEL_CAP', 'MAX_PLAYER_LV', 'MAX_SKILL_LV'].forEach(k => {
      window[k] = MAX_LV_999;
    });
    ['MAX_THREAT_RANK', 'MAX_THREAT', 'THREAT_CAP', 'MAX_THREAT_LEVEL', 'MAX_DANGER', 'THREAT_MAX'].forEach(k => {
      window[k] = MAX_THREAT_999;
    });
  } catch (e) {}

  // 右上の邪魔なオンラインピルを確実に消去（通信機能自体はgame6側の処理でそのまま動作）
  function removeOnlinePillClean() {
    document.getElementById('kmj-v45-online-pill')?.remove();
  }
  removeOnlinePillClean();

  function getThreatRankClean(inst) {
    const d = inst?.saveData || {};
    const keys = ['threatRank', 'fieldThreatRank', 'threat', 'threatLevel', 'threatLv', 'danger'];
    for (const k of keys) {
      if (typeof d[k] === 'number' && !Number.isNaN(d[k])) {
        return Math.max(1, Math.min(MAX_THREAT_999, Math.floor(d[k])));
      }
    }
    for (const k of keys) {
      if (typeof inst?.[k] === 'number' && !Number.isNaN(inst[k])) {
        return Math.max(1, Math.min(MAX_THREAT_999, Math.floor(inst[k])));
      }
    }
    return 1;
  }

  function renderThreatTextImmediateClean(val) {
    const safeVal = Math.max(1, Math.min(MAX_THREAT_999, Math.floor(val)));
    const pct = safeVal * 25;
    const titleStr = `🔥 フィールド脅威ランク: +${safeVal} / ${MAX_THREAT_999}`;
    const descStr = `敵の強さとEXP/Gドロップ率が +${pct}% 増加します`;

    document.querySelectorAll('div, span, p, b, strong').forEach(el => {
      if (el.children.length > 0) return;
      const t = el.textContent || '';
      if (t.includes('フィールド脅威ランク:') && t !== titleStr) {
        el.textContent = titleStr;
      } else if (t.includes('敵の強さとEXP/Gドロップ率が') && t !== descStr) {
        el.textContent = descStr;
      }
    });
  }

  let _threatApplyTimer = null;
  function applyThreatRankClean(rawNext) {
    const inst = window.game || window.__kmjInstance || window.app;
    const nextVal = Math.max(1, Math.min(MAX_THREAT_999, Math.floor(Number(rawNext) || 1)));

    // 0msで画面表示を即時更新
    renderThreatTextImmediateClean(nextVal);

    if (!inst) return;
    const d = inst.saveData;
    const keys = ['threatRank', 'fieldThreatRank', 'threat', 'threatLevel', 'threatLv', 'danger'];
    if (d) {
      let wrote = false;
      keys.forEach(k => {
        if (typeof d[k] === 'number') {
          d[k] = nextVal;
          wrote = true;
        }
      });
      if (!wrote) d.threatRank = nextVal;
    }
    keys.forEach(k => {
      if (typeof inst[k] === 'number') inst[k] = nextVal;
    });

    clearTimeout(_threatApplyTimer);
    _threatApplyTimer = setTimeout(() => {
      try {
        if (!inst.towerState?.active && typeof inst.loadZone === 'function' && !inst.inTitleScreen) {
          // ステージ画面開いている間は再スポーンだけ裏で行い、モーダルは閉じない
          if (typeof inst.spawnMonsters === 'function') inst.spawnMonsters();
        }
        inst.normalizeHigherLevelMonstersClean?.();
        inst.saveGame?.(false);
        renderThreatTextImmediateClean(nextVal);
      } catch (e) {}
    }, 100);
  }

  function setupThreatControlsClean() {
    removeOnlinePillClean();
    const inst = window.game || window.__kmjInstance || window.app;
    renderThreatTextImmediateClean(getThreatRankClean(inst));

    let card = null;
    const nodes = document.querySelectorAll('div, span, p, b');
    for (const el of nodes) {
      if (el.children.length === 0 && (el.textContent || '').includes('フィールド脅威ランク:')) {
        let p = el.parentElement;
        while (p && p !== document.body) {
          if ((p.textContent || '').includes('EXP/Gドロップ率')) {
            card = p;
            break;
          }
          p = p.parentElement;
        }
        if (card) break;
      }
    }
    if (!card) return;

    // 右側の -1 / +1 ボタンの古いイベントを剥がして即時更新ボタンに置換
    card.querySelectorAll('button').forEach(btn => {
      const lbl = (btn.textContent || '').trim();
      if ((lbl === '-1' || lbl === '+1') && !btn.dataset.cleanBound) {
        const delta = lbl === '+1' ? 1 : -1;
        const fresh = btn.cloneNode(true);
        fresh.removeAttribute('onclick');
        fresh.dataset.cleanBound = '1';
        fresh.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          applyThreatRankClean(getThreatRankClean(window.game) + delta);
        };
        btn.replaceWith(fresh);
      }
    });

    // 一括増減バー（MIN / -100 / -10 / +10 / +100 / MAX / 数値指定）
    if (document.getElementById('kmj-clean-threat-bar')) return;
    const bar = document.createElement('div');
    bar.id = 'kmj-clean-threat-bar';
    bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:5px;margin-top:8px;padding-top:7px;border-top:1px solid rgba(148,163,184,0.25);align-items:center;';

    const btns = [
      { label: 'MIN (1)', mode: 'set', val: 1, bg: '#334155', col: '#f1f5f9' },
      { label: '-100', mode: 'add', val: -100, bg: '#1e3a8a', col: '#dbeafe' },
      { label: '-10', mode: 'add', val: -10, bg: '#1d4ed8', col: '#eff6ff' },
      { label: '+10', mode: 'add', val: 10, bg: '#dc2626', col: '#fef2f2' },
      { label: '+100', mode: 'add', val: 100, bg: '#b91c1c', col: '#fee2e2' },
      { label: 'MAX (999)', mode: 'set', val: 999, bg: '#d97706', col: '#fef3c7' },
      { label: '🎯 数値指定', mode: 'prompt', val: 0, bg: '#059669', col: '#ecfdf5' }
    ];

    btns.forEach(item => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = item.label;
      b.style.cssText = `background:${item.bg};color:${item.col};border:none;border-radius:6px;padding:5px 8px;font-size:11px;font-weight:900;cursor:pointer;`;
      b.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const now = getThreatRankClean(window.game);
        if (item.mode === 'set') applyThreatRankClean(item.val);
        else if (item.mode === 'add') applyThreatRankClean(now + item.val);
        else {
          const inp = prompt(`設定したい脅威ランクを入力（1〜999）\n現在値: ${now}`, String(now));
          if (inp !== null && inp.trim() !== '' && !Number.isNaN(Number(inp))) {
            applyThreatRankClean(Number(inp));
          }
        }
      };
      bar.appendChild(b);
    });
    card.appendChild(bar);
  }

  // Canvas頭上ラベルでも格上モンスターに【格上】を自動付与
  if (!CanvasRenderingContext2D.prototype._cleanKakueTextHooked) {
    CanvasRenderingContext2D.prototype._cleanKakueTextHooked = true;
    const origFillText = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (text, x, y, ...rest) {
      if (typeof text === 'string' && !text.includes('【格上】') && !text.includes('推奨')) {
        const m = text.match(/Lv\.?\s*(\d+)/i);
        if (m) {
          const targetLv = Number(m[1]);
          const pLv = Number(window.game?.saveData?.lv ?? window.game?.saveData?.level ?? window.game?.player?.lv ?? 1);
          if (targetLv > pLv && pLv >= 1) {
            text = `【格上】${text}`;
          }
        }
      }
      return origFillText.call(this, text, x, y, ...rest);
    };
  }

  function installCleanPart1() {
    if (typeof KaomojiMMORPG === 'undefined') {
      setTimeout(installCleanPart1, 100);
      return;
    }

    const P = KaomojiMMORPG.prototype;
    if (P._cleanPart1Installed) return;
    P._cleanPart1Installed = true;

    Object.assign(P, {
      // 1. 素のMP消費を5倍（基準50〜）＋スキルLvに応じたMP消費計算
      calcSkillMp5xClean(slotOrSkill = 0) {
        const d = this.saveData || {};
        let slotIdx = typeof slotOrSkill === 'number' ? slotOrSkill : 0;
        let rawSkill = null;
        let skillLv = 1;

        if (typeof slotOrSkill === 'object' && slotOrSkill !== null) {
          rawSkill = slotOrSkill;
          const sid = String(rawSkill.id || rawSkill.skillId || '');
          skillLv = Math.max(1, Number(d.skillLevels?.[sid] ?? d.skillLvs?.[sid] ?? rawSkill.lv ?? rawSkill.level ?? 1));
        } else {
          if (typeof this.resolveSkillMeta === 'function') {
            const meta = this.resolveSkillMeta(slotIdx);
            if (meta) {
              skillLv = Math.max(1, Number(meta.skillLv || 1));
              if (typeof SKILLS !== 'undefined' && SKILLS) {
                const list = Array.isArray(SKILLS) ? SKILLS : Object.values(SKILLS);
                rawSkill = list.find(s => s && (String(s.id) === String(meta.skillId) || String(s.skillId) === String(meta.skillId))) || list[slotIdx] || null;
              }
            }
          }
        }

        const defaultOrig = [10, 14, 18, 24, 30][slotIdx] || 10;
        if (rawSkill && rawSkill._origMpClean === undefined) {
          const detected = Number(rawSkill.mpCost ?? rawSkill.mp ?? rawSkill.costMp ?? 0);
          rawSkill._origMpClean = detected > 0 ? detected : defaultOrig;
        }
        const origMp = rawSkill?._origMpClean || defaultOrig;

        // 素のMP消費を5倍（最低50〜）にし、スキルLv上昇に応じてスケーリング
        const base5x = Math.max(50, Math.round(origMp * 5));
        const finalMp = Math.max(50, Math.floor(base5x * (1 + (skillLv - 1) * 0.08)));
        return { base5x, mpCost: finalMp, skillLv };
      },

      syncSkillsMp5xClean() {
        if (typeof SKILLS === 'undefined' || !SKILLS) return;
        const list = Array.isArray(SKILLS) ? SKILLS : Object.values(SKILLS);
        list.forEach((sk, idx) => {
          if (!sk || typeof sk !== 'object') return;
          const info = this.calcSkillMp5xClean(sk);
          if ('mpCost' in sk) sk.mpCost = info.mpCost;
          if ('mp' in sk) sk.mp = info.mpCost;
          if ('costMp' in sk) sk.costMp = info.mpCost;
        });

        // スキルボタンの「MP 〇〇」表記を同期
        document.querySelectorAll('.skill-slot-btn, .skill-slot, .skill-btn, [data-skill-slot]').forEach((btn, idx) => {
          const slot = btn.dataset.skillSlot !== undefined ? Number(btn.dataset.skillSlot) : idx;
          const info = this.calcSkillMp5xClean(slot);
          btn.querySelectorAll('span, div, small, b').forEach(el => {
            if (el.children.length > 0) return;
            const txt = (el.textContent || '').trim();
            if (/^MP\s*\d+$/i.test(txt)) {
              const target = `MP ${info.mpCost}`;
              if (el.textContent !== target) el.textContent = target;
            }
          });
        });
      },

      // 2. 格上の敵（相手Lv > 自分Lv）は「1Lv高い毎に基準値の1.5倍を線形加算」＋「【格上】表記」
      normalizeHigherLevelMonstersClean() {
        if (!Array.isArray(this.monsters)) return;
        const d = this.saveData || {};
        const playerLv = Math.max(1, Number(d.lv ?? d.level ?? this.player?.lv ?? 1));

        this.monsters.forEach(m => {
          if (!m || m.dead) return;
          const mLv = Math.max(1, Number(m.lv ?? m.level ?? 1));
          const lvDiff = Math.max(0, mLv - playerLv);
          const isKakue = lvDiff > 0;

          // 【格上】表記
          if (!m._rawNameClean && typeof m.name === 'string') {
            m._rawNameClean = m.name.replace(/^【格上】\s*/g, '');
          }
          if (m._rawNameClean) {
            const desiredName = isKakue ? `【格上】${m._rawNameClean}` : m._rawNameClean;
            if (m.name !== desiredName) m.name = desiredName;
          }

          // 初回出現時の素の基準値をロック保存
          if (!m._rawCapturedClean) {
            m._rawCapturedClean = true;
            m._rawAtkClean = Math.max(1, Number(m.atk) || 10);
            m._rawMaxHpClean = Math.max(10, Number(m.maxHp || m.hp) || 30);
            m._rawExpClean = Math.max(1, Number(m.exp || m.expReward) || 10);
            m._rawGoldClean = Math.max(1, Number(m.gold || m.goldReward) || 5);
          }

          // 1Lv差ごとに基準値の1.5倍を加算：倍率 = 1 + 1.5 * lvDiff（乗算ではない）
          const mult = 1 + (1.5 * lvDiff);
          const newAtk = Math.floor(m._rawAtkClean * mult);
          const newMaxHp = Math.floor(m._rawMaxHpClean * mult);
          const newExp = Math.floor(m._rawExpClean * mult);
          const newGold = Math.floor(m._rawGoldClean * mult);

          if (m.atk !== newAtk) m.atk = newAtk;
          if (m.maxHp !== newMaxHp) {
            const ratio = m.maxHp > 0 ? Math.min(1, Math.max(0, (Number(m.hp) || 0) / m.maxHp)) : 1;
            m.maxHp = newMaxHp;
            if (typeof m.hp === 'number') m.hp = Math.max(1, Math.round(newMaxHp * ratio));
          }
          if ('exp' in m) m.exp = newExp;
          if ('expReward' in m) m.expReward = newExp;
          if ('gold' in m) m.gold = newGold;
          if ('goldReward' in m) m.goldReward = newGold;
        });
      }
    });

    // MP消費計算・発動時消費を5倍（基準50〜）に統合（game7 4.jsの覚醒奥義処理はそのまま生かす）
    ['getSkillMpCost', 'calcSkillMpCost', 'getSkillCost'].forEach(fn => {
      if (typeof P[fn] === 'function') {
        P[fn] = function (slotOrSkill) {
          return this.calcSkillMp5xClean(slotOrSkill).mpCost;
        };
      }
    });

    if (typeof P.useSkillSlot === 'function' && !P._cleanMpUseSlotWrapped) {
      const origUseSlot = P.useSkillSlot;
      P.useSkillSlot = function (slotIdx) {
        this.syncSkillsMp5xClean();
        const d = this.saveData;
        const info = this.calcSkillMp5xClean(slotIdx);
        const curCd = (this.player?.skillCds?.[slotIdx] ?? this.skillCds?.[slotIdx] ?? 0);
        const mpBefore = Number(d?.mp ?? this.player?.mp ?? 0);

        if (curCd <= 0.05 && !this._debugInfiniteMode && mpBefore < info.mpCost) {
          this.showAlertBanner?.(`💧 MP不足！（必要MP: ${info.mpCost} / 現在MP: ${Math.floor(mpBefore)}）`, 1400);
          return;
        }

        const res = origUseSlot.call(this, slotIdx);
        const curCdAfter = (this.player?.skillCds?.[slotIdx] ?? this.skillCds?.[slotIdx] ?? 0);
        // スキルが実際に発動した場合、確実に info.mpCost（5倍消費）だけMPを引く
        if (curCd <= 0.05 && curCdAfter > 0.05 && !this._debugInfiniteMode) {
          const targetMp = Math.max(0, mpBefore - info.mpCost);
          if (d && typeof d.mp === 'number') d.mp = targetMp;
          if (this.player && typeof this.player.mp === 'number') this.player.mp = targetMp;
        }
        return res;
      };
      P._cleanMpUseSlotWrapped = true;
    }

    if (typeof P.syncSkillDescriptionsAndEffects === 'function' && !P._cleanSyncSkillWrapped) {
      const origSync = P.syncSkillDescriptionsAndEffects;
      P.syncSkillDescriptionsAndEffects = function () {
        this.syncSkillsMp5xClean();
        origSync.call(this);
        this.syncSkillsMp5xClean();
      };
      P._cleanSyncSkillWrapped = true;
    }
  }

  installCleanPart1();
  document.addEventListener('click', () => setTimeout(setupThreatControlsClean, 40), true);
  setTimeout(setupThreatControlsClean, 300);
})();
// ▲▲▲ ここまで【クリーン統合版 game8.js 1/2】 ▲▲▲
// ▼▼▼ ここから【クリーン統合版 game8.js 2/2】Lv.999クラス進化・剣1本＆顔矯正・ペット火力参照・実績＆称号全パッシブ化 ▼▼▼
(() => {
  'use strict';

  // Lv.999までの12クラス進化ツリー（武器は全クラス標準武器＝杖なし、クラスごとに通常攻撃3Dエフェクトが変化）
  const CLASS_TREE_CLEAN = [
    {
      id: 'novice', name: '見習い冒険者', icon: '🗡️', reqLv: 1, cost: 0,
      fxStyle: 'novice_slash', fxName: '蒼き光の斬撃波',
      atkMult: 1.0, defMult: 1.0, hpMult: 1.0,
      desc: '基本の冒険者クラス。癖のない蒼い斬撃波を放つ。'
    },
    {
      id: 'warrior', name: '重装戦士', icon: '⚔️', reqLv: 15, cost: 500,
      fxStyle: 'warrior_crimson', fxName: '紅蓮の豪快衝撃斬',
      atkMult: 1.28, defMult: 1.22, hpMult: 1.25,
      desc: 'Lv.15〜｜真紅のワイドスラッシュと地響き衝撃波で敵を粉砕する。'
    },
    {
      id: 'spellblade', name: '魔法剣士', icon: '💠', reqLv: 15, cost: 500,
      fxStyle: 'spellblade_arcane', fxName: '蒼穹の魔導剣閃',
      atkMult: 1.32, defMult: 1.12, hpMult: 1.18,
      desc: 'Lv.15〜｜魔力を纏った剣から回転魔法陣付きの蒼い剣閃を放つ。'
    },
    {
      id: 'paladin', name: '聖騎士（パラディン）', icon: '🛡️', reqLv: 50, cost: 2500,
      fxStyle: 'paladin_holy', fxName: '黄金の聖光十字斬',
      atkMult: 1.48, defMult: 1.55, hpMult: 1.50,
      desc: 'Lv.50〜｜黄金と白銀が交差する聖なる十字斬撃を放つ守護騎士。'
    },
    {
      id: 'arch_spellblade', name: '大賢剣士（アークナイト）', icon: '🔮', reqLv: 50, cost: 2500,
      fxStyle: 'arch_meteor_slash', fxName: '紫電星屑の魔剣波',
      atkMult: 1.62, defMult: 1.32, hpMult: 1.38,
      desc: 'Lv.50〜｜紫と黄金の多重魔法陣から極大の魔導斬撃波を撃ち出す。'
    },
    {
      id: 'ninja', name: '疾風の影忍者', icon: '🌪️', reqLv: 100, cost: 6000,
      fxStyle: 'ninja_gale', fxName: '翠嵐の三連疾風刃',
      atkMult: 1.75, defMult: 1.40, hpMult: 1.48,
      desc: 'Lv.100〜｜エメラルドの三連斬撃波と旋風を起こす神速クラス。'
    },
    {
      id: 'blade_master', name: '蒼穹の剣聖', icon: '⚡', reqLv: 200, cost: 15000,
      fxStyle: 'blademaster_thunder', fxName: '次元断ち・蒼雷クロス斬',
      atkMult: 2.08, defMult: 1.68, hpMult: 1.78,
      desc: 'Lv.200〜｜稲妻を纏う超高速クロス斬撃と雷光スパークが炸裂する。'
    },
    {
      id: 'astral_knight', name: '星詠みの聖剣士', icon: '🌟', reqLv: 200, cost: 15000,
      fxStyle: 'astral_prism', fxName: '銀河の星屑プリズム斬',
      atkMult: 2.18, defMult: 1.65, hpMult: 1.72,
      desc: 'Lv.200〜｜桜色と黄金の星屑斬撃波が着弾時にプリズムバーストを起こす。'
    },
    {
      id: 'dragoon', name: '紅蓮の竜騎士', icon: '🐉', reqLv: 350, cost: 35000,
      fxStyle: 'dragoon_flame', fxName: '竜王の業火ブレイブ斬',
      atkMult: 2.52, defMult: 2.08, hpMult: 2.18,
      desc: 'Lv.350〜｜燃え盛る紅蓮の炎柱と竜の爪痕を刻む重撃クラス。'
    },
    {
      id: 'emperor_blade', name: '覇王・天帝剣神', icon: '👑', reqLv: 550, cost: 80000,
      fxStyle: 'emperor_gold', fxName: '天帝覇王・黄金螺旋斬',
      atkMult: 3.15, defMult: 2.65, hpMult: 2.80,
      desc: 'Lv.550〜｜黄金の立体神環と螺旋斬撃波が周囲一帯を薙ぎ払う。'
    },
    {
      id: 'void_overlord', name: '虚空の創世剣帝', icon: '🌌', reqLv: 750, cost: 150000,
      fxStyle: 'overlord_void', fxName: 'アビスノヴァ・黒蝕次元斬',
      atkMult: 3.65, defMult: 3.05, hpMult: 3.20,
      desc: 'Lv.750〜｜漆黒の重力輪とネオン紫の多重リングを纏う禁断の剣技。'
    },
    {
      id: 'mythic_god', name: '創世神話・アルティメット顔文字神', icon: '🌈', reqLv: 999, cost: 500000,
      fxStyle: 'mythic_genesis', fxName: '創世神話・虹翼天翔ノヴァ斬',
      atkMult: 4.50, defMult: 3.80, hpMult: 4.00,
      desc: 'Lv.999到達の最終進化｜全属性の虹色多重魔法陣・立体神環・星屑爆発が同時発動！'
    }
  ];

  function installCleanPart2() {
    if (typeof KaomojiMMORPG === 'undefined') {
      setTimeout(installCleanPart2, 100);
      return;
    }

    const P = KaomojiMMORPG.prototype;
    if (P._cleanPart2Installed) return;
    P._cleanPart2Installed = true;

    Object.assign(P, {
      // 1. 武器の杖撤廃・剣1本化・プレイヤー顔位置矯正・ペット顔埋まり解消
      enforceCleanVisuals() {
        // A. WEAPONS定義から杖変換を完全除去
        if (typeof WEAPONS !== 'undefined' && WEAPONS) {
          const wList = Array.isArray(WEAPONS) ? WEAPONS : Object.values(WEAPONS);
          wList.forEach(w => {
            if (!w || typeof w !== 'object') return;
            if (w._origNameV22) w.name = w._origNameV22;
            else if (typeof w.name === 'string') {
              w.name = w.name
                .replace(/（魔導杖）/g, '')
                .replace(/見習いの木の杖/g, '木の剣')
                .replace(/青銅の魔導杖/g, '銅の剣')
                .replace(/白鉄の魔法杖/g, '鉄の剣')
                .replace(/精霊の銀魔杖/g, '鋼の剣')
                .replace(/ミスリルアークロッド/g, 'ミスリルソード')
                .replace(/オリハルコン星屑杖/g, 'オリハルコンソード')
                .replace(/竜王の紅蓮魔導杖/g, 'ドラゴンソード')
                .replace(/創世神聖スタッフ/g, '聖剣エクスカリバー');
            }
          });
        }

        // B. プレイヤーの剣重複（2本表示）除去 ＆ 顔ズレ防止
        const pGrp = this.player?.group;
        if (pGrp) {
          const oldStaff = pGrp.getObjectByName?.('mage_staff_weapon');
          if (oldStaff) pGrp.remove(oldStaff);

          // 重複している剣メッシュがあれば最新の1本だけ残す
          const swords = [];
          pGrp.children.forEach(ch => {
            const nm = (ch.name || '').toLowerCase();
            if (/sword|weapon|blade|wpn|katana/.test(nm)) {
              swords.push(ch);
            } else if (ch.position.x > 0.35) {
              let hasLongBlade = false;
              ch.traverse(sub => {
                if (!sub.isMesh || !sub.geometry) return;
                const sp = sub.geometry.parameters || {};
                if ((sp.height || 0) >= 0.55 && (sp.width || sp.radiusTop || 0) <= 0.35) hasLongBlade = true;
              });
              if (hasLongBlade) swords.push(ch);
            }
          });
          if (swords.length >= 2) {
            for (let i = 0; i < swords.length - 1; i++) pGrp.remove(swords[i]);
          }

          if (typeof this.alignAvatarFaceStrictly === 'function') {
            this.alignAvatarFaceStrictly(pGrp);
          }
        }

        // C. ペットの顔めり込み防止（球体やキューブ表面より必ず手前に配置）
        const petGrp = this.pet?.group || this.pet?.mesh;
        if (petGrp) {
          let frontZ = 0.38;
          let centerY = 0.64;
          const faces = [];
          petGrp.traverse(obj => {
            if (!obj.isMesh || !obj.geometry) return;
            const gt = obj.geometry.type || '';
            const pm = obj.geometry.parameters || {};
            if (obj.material?.map?.image || gt === 'PlaneGeometry') {
              faces.push(obj);
            } else if (gt === 'SphereGeometry') {
              frontZ = Math.max(frontZ, obj.position.z + (pm.radius || 0.45) * (obj.scale?.z || 1));
              centerY = obj.position.y;
            } else if (gt === 'BoxGeometry' && (pm.depth || 0) >= 0.4) {
              frontZ = Math.max(frontZ, obj.position.z + (pm.depth * 0.5) * (obj.scale?.z || 1));
              centerY = obj.position.y;
            }
          });
          faces.forEach(fm => {
            fm.position.set(0, centerY, frontZ + 0.045);
            fm.rotation.set(0, 0, 0);
          });
        }
      },

      // 2. Lv.999 クラス進化定義＆選択・切替
      getCurrentClassClean(evoIdOverride = null) {
        const d = this.saveData || {};
        const raw = String(evoIdOverride ?? d.evolutionId ?? d.classId ?? this.player?.evolutionId ?? 'novice');
        return CLASS_TREE_CLEAN.find(c => c.id === raw) || CLASS_TREE_CLEAN[0];
      },

      chooseClassClean(classId) {
        const d = this.saveData;
        if (!d) return;
        const cls = CLASS_TREE_CLEAN.find(c => c.id === classId);
        if (!cls) return;

        const playerLv = Math.max(1, Number(d.lv ?? d.level ?? this.player?.lv ?? 1));
        if (!this._debugInfiniteMode && playerLv < cls.reqLv) {
          this.showAlertBanner?.(`🔒 必要Lv不足！（必要: Lv.${cls.reqLv} / 現在: Lv.${playerLv}）`, 1800);
          return;
        }

        if (!Array.isArray(d.unlockedClassesClean)) d.unlockedClassesClean = ['novice'];
        const isUnlocked = cls.cost <= 0 || d.unlockedClassesClean.includes(cls.id) || this._debugInfiniteMode;
        const coinKey = ('gold' in d) ? 'gold' : (('coins' in d) ? 'coins' : 'gold');
        const curGold = Number(d[coinKey]) || 0;

        if (!isUnlocked) {
          if (curGold < cls.cost) {
            this.showAlertBanner?.(`💰 ゴールド不足！（必要: ${cls.cost.toLocaleString()}G / 所持: ${curGold.toLocaleString()}G）`, 1800);
            return;
          }
          d[coinKey] = curGold - cls.cost;
          d.unlockedClassesClean.push(cls.id);
          sfx?.playHeal?.();
        } else {
          sfx?.playTone?.(760, 'sine', 0.1, 0.08);
        }

        d.evolutionId = cls.id;
        d.classId = cls.id;
        if (this.player) this.player.evolutionId = cls.id;

        this.saveGame?.(false);
        this.syncFirebaseNow?.(false);
        this.refreshAllHUD?.();
        this.showAlertBanner?.(`${cls.icon} クラス「${cls.name}」を選択！【通常攻撃: ${cls.fxName}】`, 2300);
      },

      // クラス別の通常攻撃3Dエフェクト（武器は変えず、斬撃・衝撃波・神環エフェクトだけが変化）
      spawnClassBasicAttackFXClean(entity) {
        if (!this.useWebGL || !this.scene || !entity?.pos || typeof THREE === 'undefined') return;
        if (!this._slashEffects) this._slashEffects = [];

        const isLocal = (entity === this.player);
        const cls = this.getCurrentClassClean(isLocal ? null : entity.evolutionId);
        const style = cls.fxStyle || 'novice_slash';
        const rotY = entity.rotY || 0;
        const dirX = Math.sin(rotY);
        const dirZ = Math.cos(rotY);

        const styles = {
          novice_slash: { c1: 0x38bdf8, c2: 0xe0f2fe, sc: 1.0, arcs: 1, cross: false, ring: false, sparks: 0 },
          warrior_crimson: { c1: 0xef4444, c2: 0xf97316, sc: 1.32, arcs: 2, cross: false, ring: true, sparks: 4 },
          spellblade_arcane: { c1: 0x38bdf8, c2: 0xa855f7, sc: 1.35, arcs: 2, cross: false, ring: true, sparks: 5 },
          paladin_holy: { c1: 0xfde047, c2: 0xffffff, sc: 1.48, arcs: 2, cross: true, ring: true, sparks: 6 },
          arch_meteor_slash: { c1: 0xa855f7, c2: 0xfde047, sc: 1.55, arcs: 3, cross: false, ring: true, sparks: 7 },
          ninja_gale: { c1: 0x34d399, c2: 0xa7f3d0, sc: 1.48, arcs: 3, cross: false, ring: true, sparks: 8 },
          blademaster_thunder: { c1: 0x38bdf8, c2: 0xfacc15, sc: 1.68, arcs: 3, cross: true, ring: true, sparks: 9 },
          astral_prism: { c1: 0xf472b6, c2: 0xfde047, sc: 1.72, arcs: 3, cross: true, ring: true, sparks: 10 },
          dragoon_flame: { c1: 0xdc2626, c2: 0xfacc15, sc: 1.85, arcs: 3, cross: false, ring: true, sparks: 11 },
          emperor_gold: { c1: 0xfacc15, c2: 0xf472b6, sc: 2.10, arcs: 4, cross: true, ring: true, sparks: 12 },
          overlord_void: { c1: 0x9333ea, c2: 0xf43f5e, sc: 2.25, arcs: 4, cross: true, ring: true, sparks: 14 },
          mythic_genesis: { c1: 0xf472b6, c2: 0x38bdf8, sc: 2.50, arcs: 5, cross: true, ring: true, sparks: 16 }
        };
        const cfg = styles[style] || styles.novice_slash;

        const grp = new THREE.Group();
        const mat1 = new THREE.MeshBasicMaterial({ color: cfg.c1, side: THREE.DoubleSide, transparent: true, opacity: 0.94 });
        const mat2 = new THREE.MeshBasicMaterial({ color: cfg.c2, side: THREE.DoubleSide, transparent: true, opacity: 0.90 });

        for (let a = 0; a < cfg.arcs; a++) {
          const arc = new THREE.Mesh(
            new THREE.RingGeometry((0.72 + a * 0.28) * cfg.sc, (1.48 + a * 0.35) * cfg.sc, 24, 1, -Math.PI * 0.48, Math.PI * 0.96),
            a % 2 === 0 ? mat1 : mat2
          );
          arc.rotation.set(Math.PI * (0.35 - a * 0.08), rotY, -0.55 + a * 0.45);
          arc.position.y = 1.05 + a * 0.16;
          grp.add(arc);
        }

        if (cfg.cross) {
          const vArc = new THREE.Mesh(
            new THREE.RingGeometry(0.75 * cfg.sc, 1.75 * cfg.sc, 24, 1, -Math.PI * 0.45, Math.PI * 0.9),
            mat2
          );
          vArc.rotation.set(0, rotY + Math.PI * 0.5, 0.25);
          vArc.position.y = 1.25;
          grp.add(vArc);
        }

        if (cfg.ring) {
          const gRing = new THREE.Mesh(new THREE.RingGeometry(0.55 * cfg.sc, 1.65 * cfg.sc, 26), mat1);
          gRing.rotation.x = -Math.PI / 2;
          gRing.position.y = 0.10;
          grp.add(gRing);
        }

        if (style === 'mythic_genesis' || style === 'emperor_gold' || style === 'overlord_void') {
          const halo = new THREE.Mesh(
            new THREE.TorusGeometry(1.45 * cfg.sc, 0.09, 8, 28),
            new THREE.MeshBasicMaterial({ color: 0xfde047, transparent: true, opacity: 0.92 })
          );
          halo.position.y = 1.35;
          halo.rotation.x = Math.PI * 0.32;
          grp.add(halo);
        }

        grp.position.set(entity.pos.x + dirX * 1.25, 0, entity.pos.z + dirZ * 1.25);
        this.scene.add(grp);
        this._slashEffects.push({
          kind: 'slash', mesh: grp, mat: mat1,
          life: 0.32, maxLife: 0.32,
          vx: dirX * (cfg.sc > 1.0 ? 4.5 : 0),
          vz: dirZ * (cfg.sc > 1.0 ? 4.5 : 0)
        });

        const rainbow = [0xf472b6, 0x38bdf8, 0xfde047, 0x34d399, 0xa855f7];
        for (let i = 0; i < cfg.sparks; i++) {
          const ang = rotY + ((i / Math.max(1, cfg.sparks - 1)) - 0.5) * 1.4;
          const col = style === 'mythic_genesis' ? rainbow[i % rainbow.length] : (i % 2 === 0 ? cfg.c1 : cfg.c2);
          const sp = new THREE.Mesh(new THREE.OctahedronGeometry(0.17, 0), new THREE.MeshBasicMaterial({ color: col }));
          sp.position.set(entity.pos.x + dirX * 1.25, 1.2, entity.pos.z + dirZ * 1.25);
          this.scene.add(sp);
          this._slashEffects.push({
            kind: 'star', mesh: sp, life: 0.42, maxLife: 0.42,
            vx: Math.sin(ang) * 8.0, vy: 1.5 + (i % 3) * 0.6, vz: Math.cos(ang) * 8.0
          });
        }
      },

      // 3. ペット火力のプレイヤー完全参照化
      calcPetPowerFromPlayerClean() {
        const st = typeof this.getPlayerStats === 'function' ? (this.getPlayerStats() || {}) : {};
        const d = this.saveData || {};
        const playerRef = Math.max(10, Number(st.atk ?? d.atk ?? 15), Number(st.matk ?? st.mAtk ?? 0));
        const petInfo = typeof this.getMyPetSyncInfo === 'function' ? this.getMyPetSyncInfo() : null;
        const petLv = Math.max(1, Number(petInfo?.lv || this.pet?.lv || 1));
        const eq = typeof this.getPetEquipDef === 'function' ? this.getPetEquipDef(petInfo?.equipId || 'none') : { atkPct: 0 };
        const mult = 0.75 + Math.min(1.50, (petLv - 1) * 0.015) + (Number(eq?.atkPct) || 0);
        return Math.max(5, Math.floor(playerRef * mult));
      },

      syncPetPowerClean() {
        if (!this.pet) return;
        const pAtk = this.calcPetPowerFromPlayerClean();
        this.pet.atk = pAtk;
        this.pet.attack = pAtk;
        this.pet.power = pAtk;
        this.pet.dmg = pAtk;
        this.pet.damage = pAtk;
        if (this.saveData) this.saveData.petAtk = pAtk;
      },

      // 4. 実績＆称号の「全常時パッシブ化」集計（装備不要）
      getAllAchievementsAndTitlesPassiveClean() {
        const d = this.saveData || {};

        const countUnlocked = (globalVar, saveKeys) => {
          const list = (typeof globalVar !== 'undefined' && globalVar)
            ? (Array.isArray(globalVar) ? globalVar : Object.entries(globalVar).map(([k, v]) => ({ id: k, ...(typeof v === 'object' ? v : { name: String(v) }) })))
            : [];
          const set = new Set();
          saveKeys.forEach(sk => {
            const src = d[sk];
            if (!src) return;
            if (Array.isArray(src)) {
              src.forEach(x => {
                if (typeof x === 'string') set.add(x);
                else if (x && (x.unlocked || x.completed || x.earned || x.done)) set.add(String(x.id || x.achId || x.titleId || ''));
              });
            } else if (typeof src === 'object') {
              Object.entries(src).forEach(([k, v]) => {
                if (v === true || (v && typeof v === 'object' && (v.unlocked || v.completed || v.earned || v.done))) set.add(String(k));
              });
            }
          });
          let unlocked = 0;
          if (list.length > 0) {
            list.forEach((item, idx) => {
              const id = String(item.id || item.achId || item.titleId || `item_${idx}`);
              const nm = String(item.name || item.title || id);
              if (item.unlocked || item.completed || item.earned || set.has(id) || set.has(nm)) unlocked++;
            });
            return { unlocked, total: list.length, complete: unlocked >= list.length };
          }
          return { unlocked: set.size, total: Math.max(set.size, 1), complete: false };
        };

        const ach = countUnlocked(typeof ACHIEVEMENTS !== 'undefined' ? ACHIEVEMENTS : null, ['achievements', 'unlockedAchievements', 'earnedAchievements', 'achUnlocked']);
        const ttl = countUnlocked(typeof TITLES !== 'undefined' ? TITLES : null, ['titles', 'unlockedTitles', 'earnedTitles', 'titleUnlocked']);

        const totalUnlocked = ach.unlocked + ttl.unlocked;
        const allComplete = (ach.complete && ttl.complete) || (ach.complete && ttl.unlocked === 0);

        // 実績・称号1個ごとに全ステ +3%、最大HP +4%、獲得EXP/GOLD +4% が装備不要で常時加算
        const statPct = (totalUnlocked * 0.03) + (allComplete ? 0.50 : 0);
        const hpPct = (totalUnlocked * 0.04) + (allComplete ? 0.50 : 0);
        const rewardPct = (totalUnlocked * 0.04) + (allComplete ? 0.50 : 0);

        return { ach, ttl, totalUnlocked, allComplete, statPct, hpPct, rewardPct };
      },

      // 5. 質の良いものを作る時の「作れるレベル（reqLv）」標準判定ヘルパー
      getCraftRequiredLevelClean(item, idx = 0) {
        if (!item || typeof item !== 'object') return 1;
        const explicit = Number(item.reqLv ?? item.requiredLv ?? item.unlockLv ?? item.minLv ?? item.levelReq ?? 0);
        if (explicit >= 1) return explicit;
        const cost = Number(item.cost ?? item.price ?? item.gold ?? 0);
        if (cost >= 100000) return 500;
        if (cost >= 30000) return 250;
        if (cost >= 10000) return 120;
        if (cost >= 3000) return 50;
        if (cost >= 800) return 20;
        return Math.max(1, idx * 10);
      }
    });

    // ステータス計算に「クラス倍率」＋「全実績＆全称号の常時パッシブ」を統合
    if (typeof P.getPlayerStats === 'function' && !P._cleanStatsWrapped) {
      const origStats = P.getPlayerStats;
      P.getPlayerStats = function () {
        const st = origStats.call(this);
        if (!st) return st;
        const cls = this.getCurrentClassClean();
        const pas = this.getAllAchievementsAndTitlesPassiveClean();
        const atkMult = (cls.atkMult || 1.0) * (1 + pas.statPct);
        const defMult = (cls.defMult || 1.0) * (1 + pas.statPct);
        const hpMult = (cls.hpMult || 1.0) * (1 + pas.hpPct);

        if (typeof st.atk === 'number') st.atk = Math.max(1, Math.floor(st.atk * atkMult));
        if (typeof st.matk === 'number') st.matk = Math.max(1, Math.floor(st.matk * atkMult));
        if (typeof st.mAtk === 'number') st.mAtk = Math.max(1, Math.floor(st.mAtk * atkMult));
        if (typeof st.def === 'number') st.def = Math.max(0, Math.floor(st.def * defMult));
        if (typeof st.maxHp === 'number') st.maxHp = Math.max(20, Math.floor(st.maxHp * hpMult));
        return st;
      };
      P._cleanStatsWrapped = true;
    }

    // 撃破報酬に「全実績＆全称号の常時パッシブ報酬ボーナス」を加算
    ['killMonster', 'onMonsterKilled'].forEach(fn => {
      if (typeof P[fn] === 'function' && !P[`_cleanReward_${fn}`]) {
        const orig = P[fn];
        P[fn] = function (m, ...rest) {
          const res = orig.apply(this, [m, ...rest]);
          const d = this.saveData;
          const pas = this.getAllAchievementsAndTitlesPassiveClean();
          if (d && pas.rewardPct > 0) {
            const bExp = Math.floor((Number(m?.exp || m?.expReward || 10)) * pas.rewardPct);
            const bGold = Math.floor((Number(m?.gold || m?.goldReward || 8)) * pas.rewardPct);
            if (bExp > 0) d.exp = (Number(d.exp) || 0) + bExp;
            if (bGold > 0) {
              d.gold = (Number(d.gold) || 0) + bGold;
              if ('coins' in d) d.coins = d.gold;
            }
          }
          return res;
        };
        P[`_cleanReward_${fn}`] = true;
      }
    });

    // 通常攻撃（!isSkill）のときだけクラス別3Dエフェクトを出し、スキル（isSkill）はgame7 4.jsの11系統覚醒奥義をそのまま使う
    if (typeof P.triggerAttackVisual === 'function' && !P._cleanAtkVisWrapped) {
      const origVis = P.triggerAttackVisual;
      P.triggerAttackVisual = function (entity, isSkill = false, skillInfo = null) {
        if (!isSkill && entity) {
          entity.attackAnimTimer = 0.36;
          entity.attackIsSkill = false;
          this.spawnClassBasicAttackFXClean(entity);
          return;
        }
        return origVis.call(this, entity, isSkill, skillInfo);
      };
      P._cleanAtkVisWrapped = true;
    }

    // モーダルUI（能力・進化タブ／ペットタブ／実績・称号タブ）への統合
    if (typeof P.renderModalContent === 'function' && !P._cleanModalWrapped) {
      const origModal = P.renderModalContent;
      P.renderModalContent = function () {
        origModal.call(this);
        const body = document.getElementById('modal-body');
        if (!body) return;
        const tab = String(this.activeTab || '').toLowerCase();
        const d = this.saveData || {};
        const playerLv = Math.max(1, Number(d.lv ?? d.level ?? this.player?.lv ?? 1));
        const curGold = Number(d.gold ?? d.coins ?? d.money ?? 0);

        // A. 「能力・進化」タブに Lv.999 クラス進化＆自由選択ツリーを追加
        if (/stat|evo|job|class/.test(tab)) {
          const curCls = this.getCurrentClassClean();
          if (!Array.isArray(d.unlockedClassesClean)) d.unlockedClassesClean = ['novice'];
          const cardsHtml = CLASS_TREE_CLEAN.map(c => {
            const isCur = curCls.id === c.id;
            const isUnl = c.cost <= 0 || d.unlockedClassesClean.includes(c.id);
            const canLv = playerLv >= c.reqLv || this._debugInfiniteMode;
            let btnTxt = '', bg = '#334155', dis = false;
            if (isCur) { btnTxt = '✅ 現在のクラス'; bg = '#059669'; dis = true; }
            else if (isUnl) { btnTxt = '🔄 このクラスを選ぶ（無料）'; bg = '#0284c7'; }
            else if (!canLv) { btnTxt = `🔒 Lv.${c.reqLv} で解放`; bg = '#1e293b'; dis = true; }
            else { btnTxt = `✨ 進化解放 (${c.cost.toLocaleString()}G)`; bg = curGold >= c.cost ? '#d97706' : '#475569'; }
            return `
              <div style="background:#1e293b;border:1.5px solid ${isCur ? '#34d399' : (isUnl ? '#38bdf8' : '#334155')};border-radius:8px;padding:7px;display:flex;flex-direction:column;justify-content:space-between;gap:4px;">
                <div>
                  <div style="font-size:11px;font-weight:900;color:#fff;">${c.icon} ${c.name}</div>
                  <div style="font-size:9.5px;color:#f472b6;font-weight:800;">✦ 通常攻撃演出: ${c.fxName}</div>
                  <div style="font-size:9px;color:#94a3b8;line-height:1.3;">${c.desc}</div>
                </div>
                <button type="button" class="btn-clean-choose-class" data-cid="${c.id}" ${dis ? 'disabled' : ''} style="width:100%;background:${bg};border:none;color:#fff;border-radius:5px;padding:4px 6px;font-size:10px;font-weight:900;cursor:${dis ? 'default' : 'pointer'};opacity:${dis && !isCur ? '0.65' : '1'};">${btnTxt}</button>
              </div>
            `;
          }).join('');

          body.insertAdjacentHTML('afterbegin', `
            <div class="card-box" style="margin-bottom:8px;border-color:#38bdf8;background:rgba(15,23,42,0.94);">
              <div class="flex-between" style="margin-bottom:4px;">
                <b style="color:#7dd3fc;font-size:11.5px;">⚜️ Lv.999 クラス進化＆自由選択（通常攻撃エフェクト変化）</b>
                <span style="font-size:10px;color:#fde047;font-weight:900;">Lv.${playerLv} / 💰${curGold.toLocaleString()}G</span>
              </div>
              <div style="font-size:10px;color:#cbd5e1;margin-bottom:6px;">
                現在: <b style="color:#34d399;">${curCls.icon} ${curCls.name}</b>（${curCls.fxName}）｜解放済みクラスはいつでも無料で切替可能！
              </div>
              <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;max-height:240px;overflow-y:auto;">
                ${cardsHtml}
              </div>
            </div>
          `);
          body.querySelectorAll('.btn-clean-choose-class').forEach(b => {
            b.addEventListener('click', () => {
              sfx?.init?.();
              this.chooseClassClean(b.dataset.cid);
              this.renderModalContent();
            });
          });
        }

        // B. 「ペット」タブにプレイヤー参照の相棒実効火力カードを追加
        if (/pet|companion/.test(tab)) {
          const pAtk = this.calcPetPowerFromPlayerClean();
          const st = typeof this.getPlayerStats === 'function' ? (this.getPlayerStats() || {}) : {};
          const refAtk = Math.max(10, Number(st.atk || 15), Number(st.matk || st.mAtk || 15));
          body.insertAdjacentHTML('afterbegin', `
            <div class="card-box" style="margin-bottom:8px;border-color:#38bdf8;background:rgba(15,23,42,0.95);display:flex;align-items:center;justify-content:space-between;gap:8px;">
              <div>
                <div style="font-size:11px;font-weight:900;color:#7dd3fc;">🐾 相棒ペット実効火力（プレイヤー参照）</div>
                <div style="font-size:9.5px;color:#94a3b8;">あなたの火力 (${refAtk.toLocaleString()}) ＋ ペットLv・ペット装備補正に連動</div>
              </div>
              <div style="font-size:15px;font-weight:900;color:#fde047;">⚔️ ${pAtk.toLocaleString()}</div>
            </div>
          `);
        }

        // C. 「実績・称号」タブの装備ボタンを廃止し、全実績＆全称号の常時パッシブ効果パネルを表示
        if (/ach|title|trophy|quest/.test(tab)) {
          const pas = this.getAllAchievementsAndTitlesPassiveClean();
          body.querySelectorAll('button').forEach(btn => {
            const txt = (btn.textContent || '').trim();
            if (/装備する|装着する|セットする|装備中|装着中/.test(txt)) {
              btn.textContent = '✨ 常時パッシブ発動中';
              btn.disabled = true;
              btn.style.background = '#065f46';
              btn.style.color = '#6ee7b7';
              btn.style.border = '1px solid #10b981';
              btn.style.cursor = 'default';
              btn.style.opacity = '1';
            }
          });
          body.insertAdjacentHTML('afterbegin', `
            <div class="card-box" style="margin-bottom:8px;border-color:#fbbf24;background:rgba(30,27,75,0.92);">
              <div class="flex-between" style="margin-bottom:3px;">
                <b style="color:#fde047;font-size:11.5px;">🏆 実績＆称号 常時パッシブ効果（装備不要で全て発動）</b>
                <span style="font-size:10px;color:#34d399;font-weight:900;">実績:${pas.ach.unlocked}/${pas.ach.total} ・ 称号:${pas.ttl.unlocked}/${pas.ttl.total}</span>
              </div>
              <div style="font-size:10px;color:#f8fafc;line-height:1.45;">
                現在の常時パッシブ合計：<b style="color:#4ade80;">全攻撃・防御 +${Math.round(pas.statPct * 100)}%</b> ／
                <b style="color:#38bdf8;">最大HP +${Math.round(pas.hpPct * 100)}%</b> ／
                <b style="color:#fbbf24;">獲得EXP・GOLD +${Math.round(pas.rewardPct * 100)}%</b><br>
                <span style="color:#cbd5e1;font-size:9.5px;">※ 実績・称号はどれか1つを装備しなくても、解除・獲得したすべてが重複して常時発動します！</span>
              </div>
            </div>
          `);
        }
      };
      P._cleanModalWrapped = true;
    }

    // メイン更新ループ（game6 4.jsのupdateRemotePlayers）に統合して毎フレーム安全に維持
    if (typeof P.updateRemotePlayers === 'function' && !P._cleanUpdateWrapped) {
      const origUpd = P.updateRemotePlayers;
      P.updateRemotePlayers = function (dt) {
        origUpd.call(this, dt);
        this.enforceCleanVisuals();
        this.syncPetPowerClean();
        this.normalizeHigherLevelMonstersClean?.();
      };
      P._cleanUpdateWrapped = true;
    }

    if (typeof P.refreshAllHUD === 'function' && !P._cleanHudWrapped) {
      const origHud = P.refreshAllHUD;
      P.refreshAllHUD = function () {
        this.syncSkillsMp5xClean?.();
        this.syncPetPowerClean();
        origHud.call(this);
      };
      P._cleanHudWrapped = true;
    }

    setTimeout(() => {
      const inst = window.game;
      if (inst) {
        inst.enforceCleanVisuals();
        inst.syncPetPowerClean();
        inst.syncSkillsMp5xClean?.();
        inst.normalizeHigherLevelMonstersClean?.();
        inst.refreshAllHUD?.();
      }
    }, 250);
  }

  installCleanPart2();
})();
// ▲▲▲ ここまで【クリーン統合版 game8.js 2/2】 ▲▲▲
