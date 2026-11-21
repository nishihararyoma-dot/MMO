// ▼▼▼ ここから【1/2 修正版】驚異度999化・格上1Lv毎+1.5倍加算・杖撤廃・作成レベル設定 ▼▼▼
(() => {
  'use strict';

  const TRUE_MAX_LEVEL = 999;
  const TRUE_MAX_THREAT = 999;

  try {
    ['MAX_LV', 'MAX_LEVEL', 'LEVEL_CAP', 'MAX_PLAYER_LV', 'MAX_SKILL_LV'].forEach(k => {
      window[k] = TRUE_MAX_LEVEL;
    });
    ['MAX_THREAT_RANK', 'MAX_THREAT', 'THREAT_CAP', 'MAX_THREAT_LEVEL', 'MAX_DANGER', 'THREAT_MAX'].forEach(k => {
      window[k] = TRUE_MAX_THREAT;
    });
  } catch (e) {}

  function applyPatchPart1() {
    if (typeof KaomojiMMORPG === 'undefined') {
      setTimeout(applyPatchPart1, 120);
      return;
    }

    const proto = KaomojiMMORPG.prototype;
    if (proto._v50Part1Installed) return;
    proto._v50Part1Installed = true;

    Object.assign(proto, {
      // 1. 驚異度上限999の徹底適用
      forceThreatCap999V50() {
        const d = this.saveData;
        if (d) {
          if (typeof d.lv === 'number' && d.lv > TRUE_MAX_LEVEL) d.lv = TRUE_MAX_LEVEL;
          if (typeof d.level === 'number' && d.level > TRUE_MAX_LEVEL) d.level = TRUE_MAX_LEVEL;
          ['threatRank', 'threat', 'threatLevel', 'threatLv', 'danger', 'dangerLevel'].forEach(k => {
            if (typeof d[k] === 'number') {
              d[k] = Math.max(1, Math.min(TRUE_MAX_THREAT, d[k]));
            }
            if (typeof this[k] === 'number') {
              this[k] = Math.max(1, Math.min(TRUE_MAX_THREAT, this[k]));
            }
          });
        }
        if (typeof this.maxThreat === 'number' && this.maxThreat < TRUE_MAX_THREAT) this.maxThreat = TRUE_MAX_THREAT;
        if (typeof this.maxThreatRank === 'number' && this.maxThreatRank < TRUE_MAX_THREAT) this.maxThreatRank = TRUE_MAX_THREAT;

        document.querySelectorAll('input[type="range"], input[type="number"]').forEach(inp => {
          const hint = `${inp.id || ''} ${inp.name || ''} ${inp.className || ''}`.toLowerCase();
          if (/threat|danger|rank|脅威|驚異/.test(hint)) {
            if (Number(inp.max) > 0 && Number(inp.max) < TRUE_MAX_THREAT) {
              inp.max = String(TRUE_MAX_THREAT);
            }
          }
        });

        document.querySelectorAll('span, div, p, b, strong').forEach(el => {
          if (el.children.length > 0) return;
          const txt = el.textContent || '';
          if (/(脅威度|驚異度).*\/\s*50\b/.test(txt)) {
            el.textContent = txt.replace(/\/\s*50\b/, '/ 999');
          }
        });
      },

      adjustThreatRankV50(delta) {
        const d = this.saveData;
        if (!d) return;
        const key = ['threatRank', 'threat', 'threatLevel', 'threatLv', 'danger'].find(k => typeof d[k] === 'number') || 'threatRank';
        const cur = Math.max(1, Number(d[key]) || 1);
        const next = Math.max(1, Math.min(TRUE_MAX_THREAT, cur + delta));
        d[key] = next;
        this.threatRank = next;
        this.threat = next;
        this.saveGame?.(false);
        this.refreshAllHUD?.();
        this.showAlertBanner?.(`🔥 脅威度ランク: ${next} / 999`, 1200);
      },

      // 2. 相手のレベルが1高い毎に1.5倍を線形加算（最終倍率 = 1 + 1.5 × レベル差、乗算ではない）
      normalizeMonsterHigherLevelScalingV50() {
        if (!Array.isArray(this.monsters)) return;
        const d = this.saveData || {};
        const playerLv = Math.max(1, Number(d.lv ?? d.level ?? this.player?.lv ?? 1));

        this.monsters.forEach(m => {
          if (!m || m.dead) return;
          const mLv = Math.max(1, Number(m.lv ?? m.level ?? 1));
          const levelDiff = Math.max(0, mLv - playerLv);

          // 初回出現時の素の基準値をロック保存
          if (m._baseCapturedV50 !== true) {
            m._baseCapturedV50 = true;
            // もし出現時に既に乗算(1.5^diff)や加算(1+1.5*diff)が掛かっていた場合は素の基準値へ戻す
            let initDiv = 1.0;
            if (levelDiff > 0 && (m._higherLvScaled || m._isHigherLvBonusApplied)) {
              initDiv = m._isExponentialApplied ? Math.pow(1.5, levelDiff) : (1 + 1.5 * levelDiff);
            }
            m._rawAtkV50 = Math.max(1, Math.round((Number(m.atk) || 10) / initDiv));
            m._rawMaxHpV50 = Math.max(10, Math.round((Number(m.maxHp || m.hp) || 30) / initDiv));
            m._rawExpV50 = Math.max(1, Math.round((Number(m.exp || m.expReward) || 10) / initDiv));
            m._rawGoldV50 = Math.max(1, Math.round((Number(m.gold || m.goldReward) || 5) / initDiv));
            if (typeof m.hp === 'number') {
              m._rawHpRatioV50 = Math.min(1, Math.max(0, m.hp / Math.max(1, Number(m.maxHp) || m.hp || 1)));
            }
          }

          // 正しい加算式：基準値 + (基準値 × 1.5 × レベル差)
          const mult = 1 + (1.5 * levelDiff);
          const targetAtk = Math.floor(m._rawAtkV50 * mult);
          const targetMaxHp = Math.floor(m._rawMaxHpV50 * mult);
          const targetExp = Math.floor(m._rawExpV50 * mult);
          const targetGold = Math.floor(m._rawGoldV50 * mult);

          if (m.atk !== targetAtk) m.atk = targetAtk;
          if (m.maxHp !== targetMaxHp) {
            const ratio = m.maxHp > 0 ? Math.min(1, Math.max(0, (Number(m.hp) || 0) / m.maxHp)) : (m._rawHpRatioV50 ?? 1);
            m.maxHp = targetMaxHp;
            if (typeof m.hp === 'number') m.hp = Math.max(1, Math.round(targetMaxHp * ratio));
          }
          if ('exp' in m) m.exp = targetExp;
          if ('expReward' in m) m.expReward = targetExp;
          if ('gold' in m) m.gold = targetGold;
          if ('goldReward' in m) m.goldReward = targetGold;
          m._isHigherLvBonusApplied = levelDiff > 0;
        });
      },

      // 3. 武器の「杖」化を完全撤廃
      removeStaffFromWeaponsV50() {
        if (typeof WEAPONS !== 'undefined' && WEAPONS) {
          const wList = Array.isArray(WEAPONS) ? WEAPONS : Object.values(WEAPONS);
          wList.forEach(w => {
            if (!w || typeof w !== 'object') return;
            if (w._origNameV22) {
              w.name = w._origNameV22;
            } else if (typeof w.name === 'string') {
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
            if (w._origDescV22) w.desc = w._origDescV22;
          });
        }
        if (this.player?.group) {
          const staffObj = this.player.group.getObjectByName?.('mage_staff_weapon');
          if (staffObj) this.player.group.remove(staffObj);
        }
      },

      // 4. 質の良いものを作る時の「作れるレベル（reqLv）」標準設定ヘルパー
      getItemRequiredLevelV50(item, index = 0) {
        if (!item || typeof item !== 'object') return 1;
        const explicit = Number(item.reqLv ?? item.requiredLv ?? item.unlockLv ?? item.minLv ?? item.levelReq ?? 0);
        if (explicit >= 1) return explicit;
        const cost = Number(item.cost ?? item.price ?? item.gold ?? 0);
        if (cost >= 100000) return 500;
        if (cost >= 30000) return 250;
        if (cost >= 10000) return 120;
        if (cost >= 3000) return 50;
        if (cost >= 800) return 20;
        return Math.max(1, index * 10);
      },

      canCraftOrUnlockAtLevelV50(item, index = 0) {
        const d = this.saveData || {};
        const playerLv = Math.max(1, Number(d.lv ?? d.level ?? this.player?.lv ?? 1));
        const reqLv = this.getItemRequiredLevelV50(item, index);
        return {
          ok: playerLv >= reqLv || Boolean(this._debugInfiniteMode),
          reqLv,
          playerLv
        };
      }
    });

    proto.syncMageWeaponNamesV22 = function () {
      this.removeStaffFromWeaponsV50();
    };
    proto.isMageEvolution = function () {
      return false;
    };
    if (typeof proto.enforceStrictWeaponVisualV27 === 'function') {
      const origStrictWpn = proto.enforceStrictWeaponVisualV27;
      proto.enforceStrictWeaponVisualV27 = function (entity, ...rest) {
        this.removeStaffFromWeaponsV50();
        return origStrictWpn.apply(this, [entity, false, ...rest.slice(1)]);
      };
    }

    ['changeThreat', 'addThreat', 'increaseThreat', 'setThreat', 'updateThreat', 'setThreatRank'].forEach(fn => {
      if (typeof proto[fn] === 'function' && !proto[`_v50_${fn}`]) {
        const orig = proto[fn];
        proto[fn] = function (val, ...rest) {
          this.forceThreatCap999V50();
          const res = orig.apply(this, [val, ...rest]);
          this.forceThreatCap999V50();
          return res;
        };
        proto[`_v50_${fn}`] = true;
      }
    });
  }

  applyPatchPart1();
})();
// ▲▲▲ ここまで【1/2 修正版】 ▲▲▲
// ▼▼▼ ここから【2/2】称号の常時パッシブバフ化・驚異度50制限突破・全フック統合 ▼▼▼
(() => {
  'use strict';

  function applyPatchPart2() {
    if (typeof KaomojiMMORPG === 'undefined') {
      setTimeout(applyPatchPart2, 120);
      return;
    }

    const proto = KaomojiMMORPG.prototype;
    if (proto._v50Part2Installed) return;
    proto._v50Part2Installed = true;

    Object.assign(proto, {
      // 1. 獲得済み「称号」の集計＆常時パッシブバフ計算
      getTitlePassiveSummaryV50() {
        const d = this.saveData || {};
        const rawTitles = (typeof TITLES !== 'undefined' && TITLES)
          ? (Array.isArray(TITLES)
              ? TITLES
              : Object.entries(TITLES).map(([k, v]) => ({ id: k, ...(typeof v === 'object' ? v : { name: String(v) }) })))
          : [];

        const unlockedSet = new Set();
        [d.titles, d.unlockedTitles, d.earnedTitles, d.claimedTitles, d.titleUnlocked].forEach(src => {
          if (!src) return;
          if (Array.isArray(src)) {
            src.forEach(it => {
              if (typeof it === 'string') unlockedSet.add(it);
              else if (it && typeof it === 'object' && (it.unlocked || it.earned || it.done)) {
                unlockedSet.add(String(it.id || it.titleId || it.name || ''));
              }
            });
          } else if (typeof src === 'object') {
            Object.entries(src).forEach(([k, v]) => {
              if (v === true || (typeof v === 'object' && v && (v.unlocked || v.earned || v.done))) {
                unlockedSet.add(String(k));
              }
            });
          }
        });

        // 現在装備中の称号も確実に獲得済みとしてカウント
        const equippedTitle = String(d.equippedTitle ?? d.title ?? d.currentTitle ?? '');
        if (equippedTitle && equippedTitle !== 'none') unlockedSet.add(equippedTitle);

        let total = rawTitles.length;
        let unlockedCount = 0;

        if (total > 0) {
          rawTitles.forEach((t, idx) => {
            const tid = String(t.id || t.titleId || `title_${idx}`);
            const tname = String(t.name || t.title || tid);
            if (t.unlocked || t.earned || unlockedSet.has(tid) || unlockedSet.has(tname)) {
              unlockedCount++;
            }
          });
        } else {
          unlockedCount = unlockedSet.size;
          total = Math.max(unlockedCount, 1);
        }

        const isAllComplete = rawTitles.length > 0 && unlockedCount >= rawTitles.length;

        // 称号1個ごとに ATK/DEF +2.5%、最大HP +3%、獲得EXP/GOLD +3% の常時パッシブ加算
        // さらに全称号コンプリート時は「称号覇者ボーナス（全ステ+30%・報酬+40%）」追加！
        const statPct = (unlockedCount * 0.025) + (isAllComplete ? 0.30 : 0);
        const hpPct = (unlockedCount * 0.03) + (isAllComplete ? 0.35 : 0);
        const rewardPct = (unlockedCount * 0.03) + (isAllComplete ? 0.40 : 0);

        return {
          unlockedCount,
          total,
          isAllComplete,
          statPct,
          hpPct,
          rewardPct
        };
      },

      // 2. 称号タブに「称号パッシブ効果パネル」を常時表示
      renderTitlePassiveBannerV50() {
        const titleContainer = document.querySelector('#tab-titles, #tab-title, #panel-titles, #title-panel, [data-tab-panel="titles"], [data-tab-panel="title"]');
        if (!titleContainer) return;

        let banner = document.getElementById('kmj-title-passive-banner-v50');
        if (!banner) {
          banner = document.createElement('div');
          banner.id = 'kmj-title-passive-banner-v50';
          banner.style.cssText = 'background:linear-gradient(135deg,rgba(49,16,47,.95),rgba(15,23,42,.96));border:1.5px solid #f472b6;border-radius:10px;padding:9px 11px;margin-bottom:10px;box-shadow:0 0 16px rgba(244,114,182,.25);';
          titleContainer.insertBefore(banner, titleContainer.firstChild);
        }

        const sum = this.getTitlePassiveSummaryV50();
        const sig = `${sum.unlockedCount}/${sum.total}|${sum.isAllComplete}`;
        if (banner.dataset.sig === sig) return;
        banner.dataset.sig = sig;

        banner.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
            <span style="font-size:12px;font-weight:900;color:#f472b6;">🎖️ 獲得称号パッシブ効果（装備していなくても全称号が常時発動）</span>
            <span style="font-size:11px;font-weight:900;color:#fde047;">所持: ${sum.unlockedCount} / ${sum.total}</span>
          </div>
          <div style="font-size:10.5px;color:#f8fafc;font-weight:800;line-height:1.45;">
            ✨ 現在の常時パッシブ加算：<span style="color:#4ade80;">ATK / DEF +${Math.round(sum.statPct * 100)}%</span> ・
            <span style="color:#38bdf8;">最大HP +${Math.round(sum.hpPct * 100)}%</span> ・
            <span style="color:#fde047;">獲得EXP / GOLD +${Math.round(sum.rewardPct * 100)}%</span>
          </div>
          <div style="margin-top:4px;font-size:9.5px;color:${sum.isAllComplete ? '#fef08a' : '#cbd5e1'};font-weight:700;">
            ${sum.isAllComplete
              ? '👑【全称号コンプリート達成！】永続パッシブ「伝説の称号覇者（全ステ+30%・報酬+40%）」発動中！'
              : '※ 称号はどれか1つを名乗っていても、獲得した全ての称号のパッシブ効果が重複して常時適用されます！'}
          </div>
        `;
      },

      // 3. 驚異度ボタンの「上限50」ストッパーを解除して999まで上げられるようにする
      bindThreatUnlockInterceptorV50() {
        if (window._v50ThreatIntercepted) return;
        window._v50ThreatIntercepted = true;

        document.addEventListener('click', (e) => {
          const btn = e.target?.closest?.('button');
          if (!btn) return;
          const idCls = `${btn.id || ''} ${btn.className || ''}`.toLowerCase();
          const txt = (btn.textContent || '').trim();
          const parentTxt = (btn.parentElement?.textContent || '').trim();

          const isThreatBtn = /threat|danger|脅威|驚異/.test(idCls) ||
            (/(脅威度|驚異度)/.test(parentTxt) && /^(\+1|\+5|\+10|\+50|\+100|▲|▶|\+|UP|上昇|MAX)$/i.test(txt));

          if (!isThreatBtn) return;

          const inst = window.__kmjInstance || window.game || window.app || window.mmorpg;
          const d = inst?.saveData;
          if (!d) return;

          const key = ['threatRank', 'threat', 'threatLevel', 'threatLv', 'danger'].find(k => typeof d[k] === 'number') || 'threatRank';
          const cur = Math.max(1, Number(d[key]) || 1);

          // すでに50以上に到達しているのに既存処理で止められる場合、999まで引き上げる
          if (cur >= 50) {
            e.preventDefault();
            e.stopImmediatePropagation();
            let add = 1;
            if (txt.includes('100')) add = 100;
            else if (txt.includes('50')) add = 50;
            else if (txt.includes('10')) add = 10;
            else if (txt.includes('5')) add = 5;
            else if (/max/i.test(txt)) add = 999 - cur;
            inst.adjustThreatRankV50(add);
          }
        }, true);
      },

      // 4. 全メソッドへの統合フック
      installV50MasterHooks() {
        if (this._v50MasterHooked) return;
        this._v50MasterHooked = true;

        // ステータス計算に「獲得称号の常時パッシブバフ」を加算
        if (typeof proto.getPlayerStats === 'function' && !proto._v50TitleStatsWrapped) {
          const origStats = proto.getPlayerStats;
          proto.getPlayerStats = function (...args) {
            const st = origStats.apply(this, args) || {};
            const tSum = this.getTitlePassiveSummaryV50();
            if (tSum && (tSum.statPct > 0 || tSum.hpPct > 0)) {
              const sMult = 1 + tSum.statPct;
              const hMult = 1 + tSum.hpPct;
              if (typeof st.atk === 'number') st.atk = Math.max(1, Math.floor(st.atk * sMult));
              if (typeof st.matk === 'number') st.matk = Math.max(1, Math.floor(st.matk * sMult));
              if (typeof st.mAtk === 'number') st.mAtk = Math.max(1, Math.floor(st.mAtk * sMult));
              if (typeof st.def === 'number') st.def = Math.max(0, Math.floor(st.def * sMult));
              if (typeof st.maxHp === 'number') st.maxHp = Math.max(20, Math.floor(st.maxHp * hMult));
            }
            return st;
          };
          proto._v50TitleStatsWrapped = true;
        }

        // モンスター撃破時のEXP/GOLDに称号パッシブ報酬倍率を反映
        ['killMonster', 'onMonsterKilled'].forEach(fn => {
          if (typeof proto[fn] === 'function' && !proto[`_v50Title_${fn}`]) {
            const orig = proto[fn];
            proto[fn] = function (m, ...rest) {
              const res = orig.apply(this, [m, ...rest]);
              const d = this.saveData;
              const tSum = this.getTitlePassiveSummaryV50();
              if (d && tSum && tSum.rewardPct > 0) {
                const bonusExp = Math.floor((Number(m?.exp || m?.expReward || 10)) * tSum.rewardPct);
                const bonusGold = Math.floor((Number(m?.gold || m?.goldReward || 8)) * tSum.rewardPct);
                if (bonusExp > 0) d.exp = (Number(d.exp) || 0) + bonusExp;
                if (bonusGold > 0) {
                  d.gold = (Number(d.gold) || 0) + bonusGold;
                  if ('coins' in d) d.coins = d.gold;
                }
              }
              return res;
            };
            proto[`_v50Title_${fn}`] = true;
          }
        });

        // HUD更新フック
        if (typeof proto.refreshAllHUD === 'function' && !proto._v50HudWrapped) {
          const origHud = proto.refreshAllHUD;
          proto.refreshAllHUD = function (...args) {
            this.forceThreatCap999V50();
            this.removeStaffFromWeaponsV50();
            this.normalizeMonsterHigherLevelScalingV50();
            const res = origHud.apply(this, args);
            this.renderTitlePassiveBannerV50();
            return res;
          };
          proto._v50HudWrapped = true;
        }

        // メインループフック
        if (typeof proto.update === 'function' && !proto._v50UpdateWrapped) {
          const origUpdate = proto.update;
          proto.update = function (dt = 0.016, ...rest) {
            this.forceThreatCap999V50();
            this.normalizeMonsterHigherLevelScalingV50();
            return origUpdate.apply(this, [dt, ...rest]);
          };
          proto._v50UpdateWrapped = true;
        }
      }
    });

    proto.bindThreatUnlockInterceptorV50();
    proto.installV50MasterHooks();

    setTimeout(() => {
      const inst = window.__kmjInstance || window.game || window.app || window.mmorpg;
      if (inst) {
        inst.forceThreatCap999V50?.();
        inst.removeStaffFromWeaponsV50?.();
        inst.normalizeMonsterHigherLevelScalingV50?.();
        inst.renderTitlePassiveBannerV50?.();
        inst.refreshAllHUD?.();
      }
    }, 300);
  }

  applyPatchPart2();
})();
// ▲▲▲ ここまで【2/2】 ▲▲▲
// ▼▼▼ ここから【追加パッチ】フィールド脅威ランク/999表記・【格上】表記・全実績常時パッシブ化 ▼▼▼
(() => {
  'use strict';

  const MAX_THREAT_999 = 999;

  // 1. DOM内の「フィールド脅威ランク: +〇〇 / 50」を確実に「/ 999」へ書き換え＆実績タブの装備ボタンをパッシブ表記へ変更
  function patchDOMTextsAndAchievementsV52() {
    // テキストノード単位で「/ 50」を「/ 999」へ置換
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    let node;
    while ((node = walker.nextNode())) {
      const val = node.nodeValue;
      if (!val) continue;
      if (val.includes('/ 50') || val.includes('/50')) {
        const parentTxt = node.parentElement?.textContent || '';
        if (/脅威|驚異|フィールド/.test(parentTxt)) {
          node.nodeValue = val.replace(/\/\s*50\b/g, '/ 999');
        }
      }
    }

    // 実績・称号パネル内の「装備式」ボタンを「常時パッシブ発動中」に変更
    const achPanels = document.querySelectorAll('#tab-achievements, #panel-achievements, [data-tab-panel="achievements"], [data-tab-panel="titles"], #tab-titles');
    achPanels.forEach(panel => {
      panel.querySelectorAll('button').forEach(btn => {
        const t = (btn.textContent || '').trim();
        const hint = `${btn.id || ''} ${btn.className || ''} ${btn.dataset?.achId || ''}`.toLowerCase();
        // 実績アイテムの装備ボタン判定（タイトル称号ではなく実績側）
        if (/装備する|装着する|セットする|装備中|装着中/.test(t) && (/ach|実績/.test(hint) || /ach|実績/.test(btn.closest('div')?.textContent || ''))) {
          btn.textContent = '✨ 常時パッシブ発動中';
          btn.disabled = true;
          btn.style.background = '#065f46';
          btn.style.color = '#6ee7b7';
          btn.style.border = '1px solid #10b981';
          btn.style.cursor = 'default';
          btn.style.opacity = '1';
        }
      });
    });
  }

  // 2. Canvas描画（敵の頭上ラベル等）で「Lv.〇〇」がプレイヤーLvより高い場合に自動で「【格上】」を先頭に付けて描画
  if (!CanvasRenderingContext2D.prototype._v52KakueHooked) {
    CanvasRenderingContext2D.prototype._v52KakueHooked = true;
    const origFillText = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (text, x, y, ...rest) {
      if (typeof text === 'string' && !text.includes('【格上】') && !text.includes('推奨')) {
        const m = text.match(/Lv\.?\s*(\d+)/i);
        if (m) {
          const targetLv = Number(m[1]);
          const inst = window.__kmjInstance || window.game || window.app || window.mmorpg;
          const pLv = Number(inst?.saveData?.lv ?? inst?.saveData?.level ?? inst?.player?.lv ?? 1);
          if (targetLv > pLv && pLv >= 1) {
            text = `【格上】${text}`;
          }
        }
      }
      return origFillText.call(this, text, x, y, ...rest);
    };
  }

  function installV52Patch() {
    if (typeof KaomojiMMORPG === 'undefined') {
      setTimeout(installV52Patch, 120);
      return;
    }

    const proto = KaomojiMMORPG.prototype;
    if (proto._v52Installed) return;
    proto._v52Installed = true;

    Object.assign(proto, {
      // A. 格上の敵データ自体にも「【格上】」表記を付与＆1Lv毎+1.5倍線形加算
      applyKakueTagAndScalingV52() {
        if (!Array.isArray(this.monsters)) return;
        const d = this.saveData || {};
        const playerLv = Math.max(1, Number(d.lv ?? d.level ?? this.player?.lv ?? 1));

        this.monsters.forEach(m => {
          if (!m || m.dead) return;
          const mLv = Math.max(1, Number(m.lv ?? m.level ?? 1));
          const isKakue = mLv > playerLv;

          // 元の素の名前を保存して【格上】タグを付け外し
          if (!m._rawNameV52 && typeof m.name === 'string') {
            m._rawNameV52 = m.name.replace(/^【格上】\s*/g, '');
          }
          if (m._rawNameV52) {
            const desiredName = isKakue ? `【格上】${m._rawNameV52}` : m._rawNameV52;
            if (m.name !== desiredName) {
              m.name = desiredName;
              // 頭上ラベル再生成メソッドがあれば更新
              if (typeof this.updateMonsterLabel === 'function') {
                try { this.updateMonsterLabel(m); } catch (e) {}
              }
            }
          }
        });
      },

      // B. 解除済みの「全実績」を装備不要の常時パッシブとして集計
      getAllUnlockedAchievementsPassiveV52() {
        const d = this.saveData || {};
        const rawList = (typeof ACHIEVEMENTS !== 'undefined' && ACHIEVEMENTS)
          ? (Array.isArray(ACHIEVEMENTS)
              ? ACHIEVEMENTS
              : Object.entries(ACHIEVEMENTS).map(([k, v]) => ({ id: k, ...(typeof v === 'object' ? v : { name: String(v) }) })))
          : [];

        const unlockedIds = new Set();
        [d.achievements, d.unlockedAchievements, d.earnedAchievements, d.achUnlocked].forEach(src => {
          if (!src) return;
          if (Array.isArray(src)) {
            src.forEach(v => {
              if (typeof v === 'string') unlockedIds.add(v);
              else if (v && typeof v === 'object' && (v.unlocked || v.completed || v.done)) {
                unlockedIds.add(String(v.id || v.achId || ''));
              }
            });
          } else if (typeof src === 'object') {
            Object.entries(src).forEach(([k, v]) => {
              if (v === true || (typeof v === 'object' && v && (v.unlocked || v.completed || v.done))) {
                unlockedIds.add(String(k));
              }
            });
          }
        });

        let totalCount = rawList.length;
        let unlockedCount = 0;

        if (totalCount > 0) {
          rawList.forEach((a, idx) => {
            const aid = String(a.id || a.achId || `ach_${idx}`);
            if (a.unlocked || a.completed || unlockedIds.has(aid)) {
              unlockedCount++;
            }
          });
        } else {
          unlockedCount = unlockedIds.size;
          totalCount = Math.max(unlockedCount, 1);
        }

        const isComplete = rawList.length > 0 && unlockedCount >= rawList.length;

        // 解除実績1個ごとに ATK/MATK/DEF +3%、最大HP +4%、獲得EXP/GOLD +4% が常時パッシブ加算
        // 全実績コンプリート時はさらに「創世神話の覇者（全ステ+50%・獲得EXP/GOLD+50%）」が常時追加
        return {
          unlockedCount,
          totalCount,
          isComplete,
          statBonusPct: (unlockedCount * 0.03) + (isComplete ? 0.50 : 0),
          hpBonusPct: (unlockedCount * 0.04) + (isComplete ? 0.50 : 0),
          rewardBonusPct: (unlockedCount * 0.04) + (isComplete ? 0.50 : 0)
        };
      },

      // C. 実績タブ上部に「全実績常時パッシブ発動中」パネルを表示
      renderAchievementPassivePanelV52() {
        const container = document.querySelector('#tab-achievements, #panel-achievements, [data-tab-panel="achievements"], #tab-titles, [data-tab-panel="titles"]');
        if (!container) return;

        let box = document.getElementById('kmj-ach-all-passive-v52');
        if (!box) {
          box = document.createElement('div');
          box.id = 'kmj-ach-all-passive-v52';
          box.style.cssText = 'background:linear-gradient(135deg,rgba(20,35,60,.96),rgba(15,23,42,.98));border:1.5px solid #fbbf24;border-radius:10px;padding:9px 11px;margin-bottom:10px;box-shadow:0 0 16px rgba(251,191,36,.25);';
          container.insertBefore(box, container.firstChild);
        }

        const p = this.getAllUnlockedAchievementsPassiveV52();
        const sig = `${p.unlockedCount}/${p.totalCount}|${p.isComplete}`;
        if (box.dataset.sig === sig) return;
        box.dataset.sig = sig;

        box.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
            <span style="font-size:12px;font-weight:900;color:#fde047;">🏆 実績パッシブ効果（装備不要・全実績が常時発動！）</span>
            <span style="font-size:11px;font-weight:900;color:#34d399;">解除数: ${p.unlockedCount} / ${p.totalCount}</span>
          </div>
          <div style="font-size:10.5px;color:#f8fafc;font-weight:800;line-height:1.45;">
            ⚡ 常時適用中の全実績パッシブ合計：<span style="color:#4ade80;">全攻撃・防御 +${Math.round(p.statBonusPct * 100)}%</span> ／
            <span style="color:#38bdf8;">最大HP +${Math.round(p.hpBonusPct * 100)}%</span> ／
            <span style="color:#fbbf24;">獲得EXP・GOLD +${Math.round(p.rewardBonusPct * 100)}%</span>
          </div>
          <div style="margin-top:4px;font-size:9.5px;color:${p.isComplete ? '#fef08a' : '#cbd5e1'};font-weight:700;">
            ${p.isComplete
              ? '👑【全実績コンプリート達成！】永続パッシブ「創世神話の覇者（全ステ+50%・報酬+50%）」常時発動中！'
              : '※ 実績は装備切り替え不要です。解除したすべての実績のパッシブ効果が重複して常時発動します。'}
          </div>
        `;
      }
    });

    // D. フィールド脅威ランクの増減メソッド（+1 / -1 ボタン等）が上限50で止まらないよう999に開放
    ['changeThreatRank', 'adjustThreatRank', 'changeThreat', 'addThreat', 'setThreatRank'].forEach(fn => {
      if (typeof proto[fn] === 'function' && !proto[`_v52_${fn}`]) {
        const orig = proto[fn];
        proto[fn] = function (delta, ...rest) {
          const d = this.saveData;
          const res = orig.apply(this, [delta, ...rest]);
          if (d) {
            const key = ['threatRank', 'threat', 'threatLevel', 'threatLv'].find(k => typeof d[k] === 'number');
            if (key && typeof delta === 'number') {
              // 既存メソッドが50でクランプしていた場合でも999まで反映
              const target = Math.max(1, Math.min(MAX_THREAT_999, (this._lastThreatBeforeV52 || d[key]) + delta));
              if (d[key] === 50 && target > 50) {
                d[key] = target;
                this[key] = target;
              }
            }
          }
          patchDOMTextsAndAchievementsV52();
          return res;
        };
        proto[`_v52_${fn}`] = true;
      }
    });

    // E. ステータス計算に「解除済み全実績の常時パッシブ」を合算
    if (typeof proto.getPlayerStats === 'function' && !proto._v52AchStatsWrapped) {
      const origStats = proto.getPlayerStats;
      proto.getPlayerStats = function (...args) {
        const st = origStats.apply(this, args) || {};
        const p = this.getAllUnlockedAchievementsPassiveV52();
        if (p && (p.statBonusPct > 0 || p.hpBonusPct > 0)) {
          const sMult = 1 + p.statBonusPct;
          const hMult = 1 + p.hpBonusPct;
          if (typeof st.atk === 'number') st.atk = Math.max(1, Math.floor(st.atk * sMult));
          if (typeof st.matk === 'number') st.matk = Math.max(1, Math.floor(st.matk * sMult));
          if (typeof st.mAtk === 'number') st.mAtk = Math.max(1, Math.floor(st.mAtk * sMult));
          if (typeof st.def === 'number') st.def = Math.max(0, Math.floor(st.def * sMult));
          if (typeof st.maxHp === 'number') st.maxHp = Math.max(20, Math.floor(st.maxHp * hMult));
        }
        return st;
      };
      proto._v52AchStatsWrapped = true;
    }

    // F. 撃破報酬にも「解除済み全実績のパッシブ倍率」を合算
    ['killMonster', 'onMonsterKilled'].forEach(fn => {
      if (typeof proto[fn] === 'function' && !proto[`_v52Ach_${fn}`]) {
        const orig = proto[fn];
        proto[fn] = function (m, ...rest) {
          const res = orig.apply(this, [m, ...rest]);
          const d = this.saveData;
          const p = this.getAllUnlockedAchievementsPassiveV52();
          if (d && p && p.rewardBonusPct > 0) {
            const bExp = Math.floor((Number(m?.exp || m?.expReward || 10)) * p.rewardBonusPct);
            const bGold = Math.floor((Number(m?.gold || m?.goldReward || 8)) * p.rewardBonusPct);
            if (bExp > 0) d.exp = (Number(d.exp) || 0) + bExp;
            if (bGold > 0) {
              d.gold = (Number(d.gold) || 0) + bGold;
              if ('coins' in d) d.coins = d.gold;
            }
          }
          return res;
        };
        proto[`_v52Ach_${fn}`] = true;
      }
    });

    // G. HUD更新＆フレーム更新フック
    if (typeof proto.refreshAllHUD === 'function' && !proto._v52HudWrapped) {
      const origHud = proto.refreshAllHUD;
      proto.refreshAllHUD = function (...args) {
        if (this.saveData) {
          const key = ['threatRank', 'threat', 'threatLevel', 'threatLv'].find(k => typeof this.saveData[k] === 'number');
          if (key) this._lastThreatBeforeV52 = this.saveData[key];
        }
        const res = origHud.apply(this, args);
        this.applyKakueTagAndScalingV52();
        this.renderAchievementPassivePanelV52();
        patchDOMTextsAndAchievementsV52();
        return res;
      };
      proto._v52HudWrapped = true;
    }

    if (typeof proto.update === 'function' && !proto._v52UpdateWrapped) {
      const origUpdate = proto.update;
      proto.update = function (dt = 0.016, ...rest) {
        const res = origUpdate.apply(this, [dt, ...rest]);
        this.applyKakueTagAndScalingV52();
        return res;
      };
      proto._v52UpdateWrapped = true;
    }

    // DOM変化を監視して「/ 50」表記や実績装備ボタンを即座に書き換え
    if (!window._v52MutationObs) {
      window._v52MutationObs = new MutationObserver(() => {
        patchDOMTextsAndAchievementsV52();
      });
      window._v52MutationObs.observe(document.body, { childList: true, subtree: true, characterData: true });
    }
  }

  installV52Patch();
  setTimeout(patchDOMTextsAndAchievementsV52, 400);
})();
// ▲▲▲ ここまで【追加パッチ】 ▲▲▲
// ▼▼▼ ここから【フリーズ修正・安全版】フィールド脅威ランク即時反映＆一括増減ボタン ▼▼▼
(() => {
  'use strict';

  // 旧パッチの無限ループ監視処理が動いていたら即座に強制停止
  try { window._v52MutationObs?.disconnect(); } catch (e) {}
  try { window._v53Observer?.disconnect(); } catch (e) {}

  const THREAT_MIN = 1;
  const THREAT_MAX = 999;

  function getThreatValSafe() {
    const inst = window.__kmjInstance || window.game || window.app || window.mmorpg;
    const d = inst?.saveData || {};
    const keys = ['threatRank', 'fieldThreatRank', 'threat', 'threatLevel', 'threatLv', 'danger'];
    for (const k of keys) {
      if (typeof d[k] === 'number' && !Number.isNaN(d[k])) {
        return Math.max(THREAT_MIN, Math.min(THREAT_MAX, Math.floor(d[k])));
      }
    }
    for (const k of keys) {
      if (typeof inst?.[k] === 'number' && !Number.isNaN(inst[k])) {
        return Math.max(THREAT_MIN, Math.min(THREAT_MAX, Math.floor(inst[k])));
      }
    }
    return 1;
  }

  // 値が変わったときだけDOMテキストを1回書き換える（再描画ループ防止）
  function syncThreatTextSafe(val) {
    const safeVal = Math.max(THREAT_MIN, Math.min(THREAT_MAX, Math.floor(val)));
    const pct = safeVal * 25;
    const titleDesired = `🔥 フィールド脅威ランク: +${safeVal} / ${THREAT_MAX}`;
    const descDesired = `敵の強さとEXP/Gドロップ率が +${pct}% 増加します`;

    document.querySelectorAll('div, span, p, b, strong').forEach(el => {
      if (el.children.length > 0) return;
      const cur = el.textContent || '';
      if (cur.includes('フィールド脅威ランク:') && cur !== titleDesired) {
        el.textContent = titleDesired;
      } else if (cur.includes('敵の強さとEXP/Gドロップ率が') && cur !== descDesired) {
        el.textContent = descDesired;
      }
    });
  }

  let _spawnDebounceTimer = null;

  function setThreatRankSafe(nextRaw) {
    const inst = window.__kmjInstance || window.game || window.app || window.mmorpg;
    const nextVal = Math.max(THREAT_MIN, Math.min(THREAT_MAX, Math.floor(Number(nextRaw) || 1)));

    // 1. 見た目を即座に更新
    syncThreatTextSafe(nextVal);

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
    inst._lastThreatBeforeV52 = nextVal;

    // 2. 連打しても重くならないよう敵の再計算は120ms後に1回だけ実行
    clearTimeout(_spawnDebounceTimer);
    _spawnDebounceTimer = setTimeout(() => {
      try {
        if (Array.isArray(inst.monsters) && inst.monsters.length > 0) {
          if (typeof inst.spawnMonsters === 'function' && !inst._inBattleLock) {
            inst.spawnMonsters();
          }
          inst.normalizeMonsterHigherLevelScalingV50?.();
          inst.applyKakueTagAndScalingV52?.();
        }
        inst.saveGame?.(false);
        syncThreatTextSafe(nextVal);
      } catch (e) {}
    }, 120);
  }

  // 一括操作ボタンバーを安全に1回だけ追加
  function ensureThreatButtonsSafe() {
    const curVal = getThreatValSafe();
    syncThreatTextSafe(curVal);

    if (document.getElementById('kmj-safe-threat-bar')) return;

    // 「フィールド脅威ランク:」のテキスト要素から親カードを探す
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

    const bar = document.createElement('div');
    bar.id = 'kmj-safe-threat-bar';
    bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:5px;margin-top:8px;padding-top:7px;border-top:1px solid rgba(148,163,184,0.25);align-items:center;';

    const items = [
      { label: 'MIN (1)', type: 'set', val: 1, bg: '#334155', col: '#f1f5f9' },
      { label: '-100', type: 'add', val: -100, bg: '#1e3a8a', col: '#dbeafe' },
      { label: '-10', type: 'add', val: -10, bg: '#1d4ed8', col: '#eff6ff' },
      { label: '+10', type: 'add', val: 10, bg: '#dc2626', col: '#fef2f2' },
      { label: '+100', type: 'add', val: 100, bg: '#b91c1c', col: '#fee2e2' },
      { label: 'MAX (999)', type: 'set', val: 999, bg: '#d97706', col: '#fef3c7' },
      { label: '🎯 数値指定', type: 'prompt', val: 0, bg: '#059669', col: '#ecfdf5' }
    ];

    items.forEach(item => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = item.label;
      btn.style.cssText = `background:${item.bg};color:${item.col};border:none;border-radius:6px;padding:5px 8px;font-size:11px;font-weight:900;cursor:pointer;`;
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const now = getThreatValSafe();
        if (item.type === 'set') setThreatRankSafe(item.val);
        else if (item.type === 'add') setThreatRankSafe(now + item.val);
        else {
          const res = prompt(`設定したい脅威ランクを入力（1〜999）\n現在値: ${now}`, String(now));
          if (res !== null && res.trim() !== '' && !Number.isNaN(Number(res))) {
            setThreatRankSafe(Number(res));
          }
        }
      };
      bar.appendChild(btn);
    });

    card.appendChild(bar);
  }

  // 既存の「-1」「+1」ボタンのクリックも横取りして即時反映（DOM書き換え不要で超軽量）
  if (!window._safeThreatClickHooked) {
    window._safeThreatClickHooked = true;
    document.addEventListener('click', (e) => {
      const btn = e.target?.closest?.('button');
      if (!btn) return;
      const t = (btn.textContent || '').trim();
      if (t === '-1' || t === '+1') {
        const cardTxt = btn.closest('div')?.parentElement?.textContent || '';
        if (cardTxt.includes('フィールド脅威ランク')) {
          e.preventDefault();
          e.stopImmediatePropagation();
          const now = getThreatValSafe();
          setThreatRankSafe(now + (t === '+1' ? 1 : -1));
          return;
        }
      }
      // メニューやタブをクリックした少し後にボタンバーを安全に確認・設置
      setTimeout(ensureThreatButtonsSafe, 60);
    }, true);
  }

  setTimeout(ensureThreatButtonsSafe, 400);
})();
// ▲▲▲ ここまで【フリーズ修正・安全版】 ▲▲▲
