// ▼▼▼ ここから game7.js（タイトル画面復旧・ゲーム開始レスキュー・状態異常・実績システム） ▼▼▼
(() => {
  'use strict';

  window.MAX_LEVEL_CAP_V27 = 999;
  window.MAX_THREAT_CAP_V27 = 999;
  window.SECRET_DEBUG_CODE = 'debug777';

  // iPad Safariでも万が一エラーが起きたら画面左下に小さく通知する安全装置
  window.addEventListener('error', (ev) => {
    if (!ev?.message) return;
    let box = document.getElementById('kmj-ipad-err-toast');
    if (!box) {
      box = document.createElement('div');
      box.id = 'kmj-ipad-err-toast';
      box.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:99999;max-width:90vw;background:rgba(127,29,29,.95);border:1px solid #f87171;color:#fecaca;font-size:10px;padding:6px 10px;border-radius:8px;font-family:monospace;';
      box.onclick = () => box.remove();
      document.body?.appendChild(box);
    }
    box.textContent = `⚠️ ${ev.message} (タップで閉じる)`;
  });

  // ゲームインスタンス取得＆自動生成ヘルパー
  function getOrCreateGameInstance() {
    let inst = window.__kmjInstance || window.game || window.app || window.mmorpg || window.gameInstance;
    if (!inst && typeof KaomojiMMORPG === 'function') {
      try {
        inst = new KaomojiMMORPG();
        window.game = window.__kmjInstance = inst;
      } catch (e) {
        console.error('[game7] KaomojiMMORPG生成エラー:', e);
      }
    }
    if (inst) window.__kmjInstance = inst;
    return inst;
  }

  // 既存セーブデータの復元または初期データ生成
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
      threatRank: 1,
      equippedWeapon: 'wpn_wood',
      weaponId: 'wpn_wood',
      weaponEnhance: 0,
      evolutionId: '',
      skillLevels: {},
      achievements: {},
      unlockedRolesV40: [''],
      unlockedPetEquips: ['none'],
      onlineMode: false,
      roomPassEnabled: false,
      roomPassword: ''
    };

    inst.saveData = Object.assign({}, defaults, inst.saveData || {}, loaded || {});
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

  // タイトル画面の要素特定
  function findTitleOverlay() {
    const candidates = [...document.querySelectorAll('div, section, dialog')];
    for (const el of candidates) {
      const txt = el.textContent || '';
      if (txt.includes('顔文字ファンタジー3D') && txt.includes('冒険を始める')) {
        // 一番外側のオーバーレイコンテナを返す
        let box = el;
        while (box.parentElement && box.parentElement !== document.body) {
          const st = getComputedStyle(box.parentElement);
          if (st.position === 'fixed' || st.position === 'absolute') {
            box = box.parentElement;
            break;
          }
          box = box.parentElement;
        }
        return box;
      }
    }
    return null;
  }

  // 「データ準備中...」を「データ準備完了！」へ更新
  function markTitleDataReady() {
    const inst = getOrCreateGameInstance();
    if (inst) ensureSaveDataReady(inst);

    document.querySelectorAll('div, span, p').forEach(el => {
      if (el.children.length === 0 && el.textContent.trim() === 'データ準備中...') {
        el.textContent = '✅ データ準備完了！冒険を始められます';
        el.style.color = '#34d399';
        el.style.fontWeight = '900';
      }
    });
  }

  // ゲーム本編を確実に開始させるレスキュー処理
  function launchGameSafely(forceNew = false) {
    const inst = getOrCreateGameInstance();
    if (!inst) return;

    if (forceNew) {
      try {
        localStorage.removeItem(inst._saveStorageKeyV7 || 'kaomoji_fantasy_3d_save');
      } catch (e) {}
      inst.saveData = null;
    }
    ensureSaveDataReady(inst);

    // タイトル画面を閉じる
    const overlay = findTitleOverlay();
    if (overlay) {
      overlay.style.display = 'none';
      overlay.classList.add('hidden');
    }

    // 既存の開始メソッドがあれば順に呼び出し
    const startMethods = ['startGame', 'beginGame', 'enterWorld', 'enterGame', 'start', 'play'];
    let started = false;
    for (const mName of startMethods) {
      if (typeof inst[mName] === 'function') {
        try {
          inst[mName]();
          started = true;
          break;
        } catch (e) {
          console.warn(`[game7] ${mName} 呼び出しスキップ:`, e);
        }
      }
    }

    // 初期化・描画・ループが未起動なら安全に起動
    if (!started || !inst._v7LoopStarted) {
      try {
        if (!inst._initCalledV7 && typeof inst.init === 'function') {
          inst._initCalledV7 = true;
          inst.init();
        }
      } catch (e) {
        console.warn('[game7] init補完:', e);
      }

      try {
        inst.buildPlayerEntity?.();
        inst.spawnMonsters?.();
        inst.refreshAllHUD?.();
      } catch (e) {}

      // メインループが回っていなければフォールバックループを開始
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
          } catch (e) {}
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }
  }

  // タイトル画面のボタンクリックを確実に動作させる
  function bindTitleRescueButtons() {
    if (window._v7TitleButtonsBound) return;
    window._v7TitleButtonsBound = true;

    document.addEventListener('click', (e) => {
      const btn = e.target?.closest?.('button');
      if (!btn) return;
      const txt = (btn.textContent || '').trim();

      // 1. 「冒険を始める（続きから）」
      if (txt.includes('冒険を始める')) {
        markTitleDataReady();
        setTimeout(() => {
          const overlay = findTitleOverlay();
          if (overlay && overlay.style.display !== 'none' && !overlay.classList.contains('hidden')) {
            launchGameSafely(false);
          }
        }, 120);
      }

      // 2. 「完全初期化して新規開始」
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

      // 3. 「オフライン / オンライン」切替
      if (txt.includes('オフライン') || txt.includes('オンライン')) {
        const before = txt;
        setTimeout(() => {
          if ((btn.textContent || '').trim() === before) {
            const inst = getOrCreateGameInstance();
            const nextOnline = before.includes('オフライン');
            if (inst?.saveData) inst.saveData.onlineMode = nextOnline;
            btn.textContent = nextOnline ? '🌐 オンライン' : '📴 オフライン';
            if (nextOnline) inst?.initMultiplayerMQTT?.();
          }
        }, 90);
      }

      // 4. 「パスワード: OFF / ON」切替
      if (txt.includes('パスワード:')) {
        const before = txt;
        setTimeout(() => {
          if ((btn.textContent || '').trim() === before) {
            const inst = getOrCreateGameInstance();
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

  // KaomojiMMORPG への安全フック＆状態異常・実績システム
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
            this.spawnFloatingText?.(m.pos, st.label, st.color);
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
              this.spawnFloatingText?.(m.pos, stType === 'burn' ? `🔥${dotDmg}` : `☠️${dotDmg}`, stType === 'burn' ? '#fb923c' : '#c084fc');
            }
          }
        });
      },

      checkAutoAchievementsV7() {
        const d = this.saveData;
        if (!d || typeof ACHIEVEMENTS === 'undefined' || !ACHIEVEMENTS) return;
        if (!d.achievements || typeof d.achievements !== 'object' || Array.isArray(d.achievements)) d.achievements = {};
        if (!d.statsV7) d.statsV7 = { kills: 0, bossKills: 0, skillsUsed: 0 };

        const lv = Number(d.lv ?? d.level ?? 1);
        const gold = Number(d.gold ?? d.coins ?? 0);
        const threat = Number(d.threatRank ?? d.threat ?? 1);
        const kills = Number(d.kills ?? d.killCount ?? d.statsV7.kills ?? 0);
        const bossKills = Number(d.bossKills ?? d.statsV7.bossKills ?? 0);
        const skillsUsed = Number(d.statsV7.skillsUsed ?? 0);

        const list = Array.isArray(ACHIEVEMENTS)
          ? ACHIEVEMENTS
          : Object.entries(ACHIEVEMENTS).map(([k, v]) => ({ id: k, ...(typeof v === 'object' ? v : { name: String(v) }) }));

        let newly = 0;
        list.forEach((ach, idx) => {
          const aid = String(ach.id || ach.achId || `ach_${idx}`);
          if (d.achievements[aid] === true || ach.unlocked) return;
          const key = `${aid} ${ach.name || ''} ${ach.desc || ''}`.toLowerCase();
          let met = false;
          if (/lv|レベル/.test(key)) met = lv >= (Number((key.match(/(\d+)/) || [])[1]) || 10);
          else if (/gold|ゴールド|金/.test(key)) met = gold >= (Number((key.match(/(\d+)/) || [])[1]) || 1000);
          else if (/boss|ボス|魔王|竜/.test(key)) met = bossKills >= (Number((key.match(/(\d+)/) || [])[1]) || 1);
          else if (/kill|討伐|撃破|敵/.test(key)) met = kills >= (Number((key.match(/(\d+)/) || [])[1]) || 10);
          else if (/skill|スキル|魔法/.test(key)) met = skillsUsed >= (Number((key.match(/(\d+)/) || [])[1]) || 5);
          else if (/threat|脅威/.test(key)) met = threat >= (Number((key.match(/(\d+)/) || [])[1]) || 5);
          else met = lv >= (idx + 1) * 5 || kills >= (idx + 1) * 8;

          if (met) {
            d.achievements[aid] = true;
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

        // インスタンス捕捉＆安全実行ラッパー
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
                }
                return res;
              } catch (err) {
                console.warn(`[game7 safe-${fn}]`, err);
              }
            };
            proto[`_v7Safe_${fn}`] = true;
          }
        });

        ['useSkill', 'castSkill', 'activateSkill', 'triggerSkill'].forEach(fn => {
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

        ['killMonster', 'onMonsterKilled'].forEach(fn => {
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

  // 起動直後にタイトル画面の「データ準備中...」を自動解除＆ボタン復旧
  bindTitleRescueButtons();
  setTimeout(markTitleDataReady, 300);
  setTimeout(markTitleDataReady, 1000);
})();
// ▲▲▲ ここまで game7.js ▲▲▲
