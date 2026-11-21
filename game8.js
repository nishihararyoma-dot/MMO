// ▼▼▼ ここから【完全修正版 game8.js 1/2】右上オンライン完全消去・広場中央旧ワープ撤去・顔90度回転＆埋まり完全修正・全称号＆実績パッシブ化 ▼▼▼
(() => {
  'use strict';

  const MAX_LV_999 = 999;
  const MAX_THREAT_999 = 999;

  try {
    ['MAX_LV', 'MAX_LEVEL', 'LEVEL_CAP', 'MAX_PLAYER_LV', 'MAX_SKILL_LV'].forEach(k => { window[k] = MAX_LV_999; });
    ['MAX_THREAT_RANK', 'MAX_THREAT', 'THREAT_CAP', 'MAX_THREAT_LEVEL', 'MAX_DANGER', 'THREAT_MAX'].forEach(k => { window[k] = MAX_THREAT_999; });
  } catch (e) {}

  // =========================================================
  // 1. 右上のオンライン表示を徹底消去（CSS + DOM監視）
  // =========================================================
  if (!document.getElementById('kmj-hide-online-style')) {
    const st = document.createElement('style');
    st.id = 'kmj-hide-online-style';
    st.textContent = `
      #kmj-v45-online-pill,
      [id*="online-pill"],
      [id*="online-badge"],
      [class*="online-pill"],
      [class*="online-badge"] {
        display: none !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(st);
  }

  function purgeTopRightOnlineUI() {
    document.getElementById('kmj-v45-online-pill')?.remove();
    const w = window.innerWidth || 800;
    document.querySelectorAll('div, span, button, p').forEach(el => {
      if (el.id === 'hud' || el.id === 'modal' || el.closest('#modal')) return;
      const txt = (el.textContent || '').trim();
      if (!txt || txt.length > 28) return;
      if (/オンライン|Online|接続中|同接|マルチ接続/i.test(txt)) {
        const rect = el.getBoundingClientRect();
        // 画面右上エリアにあるバッジのみ削除（チャットや設定内は除外）
        if (rect.width > 0 && rect.right >= w - 220 && rect.top <= 120) {
          el.style.setProperty('display', 'none', 'important');
          el.remove();
        }
      }
    });
  }
  purgeTopRightOnlineUI();
  new MutationObserver(() => purgeTopRightOnlineUI()).observe(document.documentElement, { childList: true, subtree: true });

  // =========================================================
  // 2. 驚異度（フィールド脅威ランク）999即時反映＆一括バー
  // =========================================================
  function getThreatRankClean(inst) {
    const d = inst?.saveData || {};
    const keys = ['threatRank', 'fieldThreatRank', 'threat', 'threatLevel', 'threatLv', 'danger'];
    for (const k of keys) {
      if (typeof d[k] === 'number' && !Number.isNaN(d[k])) return Math.max(1, Math.min(MAX_THREAT_999, Math.floor(d[k])));
    }
    for (const k of keys) {
      if (typeof inst?.[k] === 'number' && !Number.isNaN(inst[k])) return Math.max(1, Math.min(MAX_THREAT_999, Math.floor(inst[k])));
    }
    return 1;
  }

  function renderThreatTextImmediateClean(val) {
    const safeVal = Math.max(1, Math.min(MAX_THREAT_999, Math.floor(val)));
    const titleStr = `🔥 フィールド脅威ランク: +${safeVal} / ${MAX_THREAT_999}`;
    const descStr = `敵の強さとEXP/Gドロップ率が +${safeVal * 25}% 増加します`;
    document.querySelectorAll('div, span, p, b, strong').forEach(el => {
      if (el.children.length > 0) return;
      const t = el.textContent || '';
      if (t.includes('フィールド脅威ランク:') && t !== titleStr) el.textContent = titleStr;
      else if (t.includes('敵の強さとEXP/Gドロップ率が') && t !== descStr) el.textContent = descStr;
    });
  }

  let _threatTimer = null;
  function applyThreatRankClean(rawNext) {
    const inst = window.game || window.__kmjInstance || window.app;
    const nextVal = Math.max(1, Math.min(MAX_THREAT_999, Math.floor(Number(rawNext) || 1)));
    renderThreatTextImmediateClean(nextVal);
    if (!inst) return;
    const d = inst.saveData;
    const keys = ['threatRank', 'fieldThreatRank', 'threat', 'threatLevel', 'threatLv', 'danger'];
    if (d) {
      let wrote = false;
      keys.forEach(k => { if (typeof d[k] === 'number') { d[k] = nextVal; wrote = true; } });
      if (!wrote) d.threatRank = nextVal;
    }
    keys.forEach(k => { if (typeof inst[k] === 'number') inst[k] = nextVal; });

    clearTimeout(_threatTimer);
    _threatTimer = setTimeout(() => {
      try {
        if (!inst.towerState?.active && !inst.inTitleScreen && typeof inst.spawnMonsters === 'function') {
          inst.spawnMonsters();
        }
        inst.normalizeHigherLevelMonstersClean?.();
        inst.saveGame?.(false);
        renderThreatTextImmediateClean(nextVal);
      } catch (e) {}
    }, 90);
  }

  function setupThreatControlsClean() {
    purgeTopRightOnlineUI();
    const inst = window.game;
    renderThreatTextImmediateClean(getThreatRankClean(inst));

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
      if ((lbl === '-1' || lbl === '+1') && !btn.dataset.cleanBound) {
        const delta = lbl === '+1' ? 1 : -1;
        const fresh = btn.cloneNode(true);
        fresh.removeAttribute('onclick');
        fresh.dataset.cleanBound = '1';
        fresh.onclick = (e) => { e.preventDefault(); e.stopPropagation(); applyThreatRankClean(getThreatRankClean(window.game) + delta); };
        btn.replaceWith(fresh);
      }
    });

    if (document.getElementById('kmj-clean-threat-bar')) return;
    const bar = document.createElement('div');
    bar.id = 'kmj-clean-threat-bar';
    bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:5px;margin-top:8px;padding-top:7px;border-top:1px solid rgba(148,163,184,0.25);align-items:center;';
    [
      { label: 'MIN (1)', mode: 'set', val: 1, bg: '#334155', col: '#f1f5f9' },
      { label: '-100', mode: 'add', val: -100, bg: '#1e3a8a', col: '#dbeafe' },
      { label: '-10', mode: 'add', val: -10, bg: '#1d4ed8', col: '#eff6ff' },
      { label: '+10', mode: 'add', val: 10, bg: '#dc2626', col: '#fef2f2' },
      { label: '+100', mode: 'add', val: 100, bg: '#b91c1c', col: '#fee2e2' },
      { label: 'MAX (999)', mode: 'set', val: 999, bg: '#d97706', col: '#fef3c7' },
      { label: '🎯 数値指定', mode: 'prompt', val: 0, bg: '#059669', col: '#ecfdf5' }
    ].forEach(item => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = item.label;
      b.style.cssText = `background:${item.bg};color:${item.col};border:none;border-radius:6px;padding:5px 8px;font-size:11px;font-weight:900;cursor:pointer;`;
      b.onclick = (e) => {
        e.preventDefault(); e.stopPropagation();
        const now = getThreatRankClean(window.game);
        if (item.mode === 'set') applyThreatRankClean(item.val);
        else if (item.mode === 'add') applyThreatRankClean(now + item.val);
        else {
          const inp = prompt(`設定したい脅威ランクを入力（1〜999）\n現在値: ${now}`, String(now));
          if (inp !== null && inp.trim() !== '' && !Number.isNaN(Number(inp))) applyThreatRankClean(Number(inp));
        }
      };
      bar.appendChild(b);
    });
    card.appendChild(bar);
  }

  // Canvas頭上ラベル【格上】自動付与
  if (!CanvasRenderingContext2D.prototype._cleanKakueTextHooked) {
    CanvasRenderingContext2D.prototype._cleanKakueTextHooked = true;
    const origFillText = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (text, x, y, ...rest) {
      if (typeof text === 'string' && !text.includes('【格上】') && !text.includes('推奨')) {
        const m = text.match(/Lv\.?\s*(\d+)/i);
        if (m) {
          const targetLv = Number(m[1]);
          const pLv = Number(window.game?.saveData?.lv ?? window.game?.saveData?.level ?? window.game?.player?.lv ?? 1);
          if (targetLv > pLv && pLv >= 1) text = `【格上】${text}`;
        }
      }
      return origFillText.call(this, text, x, y, ...rest);
    };
  }

  // =========================================================
  // 3. 顔文字テクスチャ生成ヘルパー（90度回転・見切れ防止）
  // =========================================================
  const _cleanFaceTexCache = new Map();
  function createCleanHorizontalFaceTexture(kaomojiStr, bgHex = '#0f294a', borderHex = '#38bdf8') {
    const face = String(kaomojiStr || '(´・ω・`)').trim() || '(´・ω・`)';
    const key = `${face}|${bgHex}|${borderHex}`;
    if (_cleanFaceTexCache.has(key)) return _cleanFaceTexCache.get(key);

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 192;
    const ctx = canvas.getContext('2d');

    // 背景
    ctx.fillStyle = bgHex;
    ctx.fillRect(0, 0, 256, 192);

    // 内枠
    ctx.strokeStyle = borderHex;
    ctx.lineWidth = 10;
    ctx.strokeRect(8, 8, 240, 176);

    // 水平中央揃えで顔文字を描画（自動フォントサイズ調整）
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let fontSize = 44;
    ctx.font = `900 ${fontSize}px "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif`;
    while (ctx.measureText(face).width > 210 && fontSize > 18) {
      fontSize -= 2;
      ctx.font = `900 ${fontSize}px "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif`;
    }
    ctx.fillText(face, 128, 98);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    _cleanFaceTexCache.set(key, tex);
    return tex;
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
      // A. 始まりの顔文字広場の中央ハリボテ旧ワープゾーンを完全撤去
      removeFakeCenterWarpClean() {
        if (!this.scene || typeof THREE === 'undefined') return;
        const d = this.saveData || {};
        const zoneIdx = Number(d.zone ?? d.zoneIndex ?? this.currentZoneIndex ?? 0);
        const zoneName = String(this.currentZone?.name || d.zoneName || '');
        const isStartPlaza = (zoneIdx === 0) || /始まり|広場|plaza|town|start/i.test(zoneName);
        if (!isStartPlaza) return;

        // 保護対象（プレイヤー・ペット・敵・NPC・他プレイヤー）のUUIDを収集
        const protectedIds = new Set();
        const addProt = (obj) => {
          if (!obj) return;
          obj.traverse?.(c => protectedIds.add(c.uuid));
        };
        addProt(this.player?.group);
        addProt(this.pet?.group || this.pet?.mesh);
        (this.monsters || []).forEach(m => addProt(m?.group || m?.mesh));
        (this.npcs || []).forEach(n => addProt(n?.group || n?.mesh));
        if (this.remotePlayers) {
          const rList = this.remotePlayers instanceof Map ? Array.from(this.remotePlayers.values()) : Object.values(this.remotePlayers);
          rList.forEach(r => addProt(r?.group || r?.mesh));
        }

        // 広場中央（x: -8〜+8, z: -8〜+8）にある旧ワープゾーンのリング・光柱・台座を検出して削除
        const toRemove = [];
        this.scene.children.forEach(obj => {
          if (!obj || protectedIds.has(obj.uuid)) return;
          if (obj.isLight || obj.isCamera || obj.type === 'GridHelper') return;

          const nm = String(obj.name || '').toLowerCase();
          const distFromCenter = Math.hypot(obj.position.x, obj.position.z);

          // 地面そのもの（巨大な平面）は除外
          let isHugeFloor = false;
          obj.traverse?.(sub => {
            if (sub.isMesh && sub.geometry?.type === 'PlaneGeometry') {
              const pm = sub.geometry.parameters || {};
              if ((pm.width || 0) > 25 || (pm.height || 0) > 25) isHugeFloor = true;
            }
          });
          if (isHugeFloor) return;

          let looksLikeOldWarp = /warp|portal|gate|teleport|ring|circle|魔法陣|ワープ/.test(nm);
          if (!looksLikeOldWarp && distFromCenter < 7.5) {
            obj.traverse?.(sub => {
              if (!sub.isMesh || !sub.geometry) return;
              const gt = sub.geometry.type || '';
              if (gt === 'TorusGeometry' || gt === 'RingGeometry') {
                looksLikeOldWarp = true;
              } else if (gt === 'CylinderGeometry') {
                const pm = sub.geometry.parameters || {};
                // ワープ光の柱または平たいワープ台座
                if ((pm.height || 0) >= 2.0 || ((pm.radiusTop || 0) >= 1.2 && (pm.height || 0) <= 0.6)) {
                  looksLikeOldWarp = true;
                }
              }
            });
          }

          if (looksLikeOldWarp && distFromCenter < 10.0) {
            toRemove.push(obj);
          }
        });

        toRemove.forEach(obj => {
          try { this.scene.remove(obj); } catch (e) {}
        });
      },

      // B. プレイヤー・NPC・ペットの顔（90度回転・見切れ・球体めり込み）を完全修正
      fixAllFacesCompletelyClean() {
        if (typeof THREE === 'undefined') return;
        const d = this.saveData || {};

        // 1) プレイヤー＆NPC＆リモートプレイヤーの立方体顔矯正
        const fixCubeAvatar = (grp, kaomojiStr, bgHex = '#0f294a', borderHex = '#38bdf8') => {
          if (!grp) return;
          // 胴体キューブを特定して正確な前面Z・中心Y・幅高さを測る
          let bodyMesh = null;
          let maxVol = 0;
          const faceCandidates = [];

          grp.children.forEach(ch => {
            if (!ch.isMesh || !ch.geometry) return;
            const gt = ch.geometry.type || '';
            const pm = ch.geometry.parameters || {};
            if (gt === 'BoxGeometry') {
              const vol = (pm.width || 1) * (pm.height || 1) * (pm.depth || 1);
              if (vol > maxVol && (pm.depth || 0) >= 0.35) {
                maxVol = vol;
                bodyMesh = ch;
              } else if ((pm.depth || 1) <= 0.15) {
                faceCandidates.push(ch);
              }
            } else if (gt === 'PlaneGeometry' || ch.material?.map?.image) {
              faceCandidates.push(ch);
            }
          });

          if (!bodyMesh) return;
          const bpm = bodyMesh.geometry.parameters || {};
          const bw = (bpm.width || 1.0) * (bodyMesh.scale?.x || 1);
          const bh = (bpm.height || 1.0) * (bodyMesh.scale?.y || 1);
          const bd = (bpm.depth || 1.0) * (bodyMesh.scale?.z || 1);
          const frontZ = bodyMesh.position.z + bd * 0.5;
          const centerY = bodyMesh.position.y;

          // 既存のズレた顔プレートがあれば再構築、なければ新規作成
          let faceMesh = faceCandidates[0] || null;
          const tex = createCleanHorizontalFaceTexture(kaomojiStr, bgHex, borderHex);

          if (!faceMesh) {
            faceMesh = new THREE.Mesh(
              new THREE.PlaneGeometry(bw * 0.78, bh * 0.56),
              new THREE.MeshBasicMaterial({ map: tex })
            );
            faceMesh.name = 'clean_fixed_face_plate';
            grp.add(faceMesh);
          } else {
            // 90度回転していた古いジオメトリやマテリアルを水平正規化に置き換え
            faceMesh.geometry = new THREE.PlaneGeometry(bw * 0.78, bh * 0.56);
            faceMesh.material = new THREE.MeshBasicMaterial({ map: tex, side: THREE.FrontSide });
          }

          // キューブ前面のど真ん中に水平・垂直・回転ゼロでピタッと固定
          faceMesh.position.set(bodyMesh.position.x, centerY + bh * 0.02, frontZ + 0.022);
          faceMesh.rotation.set(0, 0, 0);
          faceMesh.scale.set(1, 1, 1);
          faceMesh.renderOrder = 4;

          // 余分な重複顔プレートがあれば削除
          for (let i = 1; i < faceCandidates.length; i++) {
            grp.remove(faceCandidates[i]);
          }
        };

        // ローカルプレイヤー
        if (this.player?.group) {
          const myFace = d.kaomoji || d.face || this.player.kaomoji || '(´・ω・`)';
          fixCubeAvatar(this.player.group, myFace, '#0f294a', '#38bdf8');
        }

        // NPCたち（背景の顔ズレも一緒に矯正）
        if (Array.isArray(this.npcs)) {
          this.npcs.forEach(npc => {
            if (npc?.group) {
              const nFace = npc.kaomoji || npc.face || '(^o^)/';
              fixCubeAvatar(npc.group, nFace, '#1e293b', '#fbbf24');
            }
          });
        }

        // 2) ペットの球体・立方体めり込み完全矯正
        const petGrp = this.pet?.group || this.pet?.mesh;
        if (petGrp) {
          let frontZ = 0.42;
          let centerY = 0.62;
          let bodyRadius = 0.45;
          const petFaces = [];

          petGrp.traverse(obj => {
            if (!obj.isMesh || !obj.geometry) return;
            const gt = obj.geometry.type || '';
            const pm = obj.geometry.parameters || {};
            if (obj.material?.map?.image || gt === 'PlaneGeometry' || obj.name === 'clean_pet_face_plate') {
              petFaces.push(obj);
            } else if (gt === 'SphereGeometry') {
              const r = (pm.radius || 0.45) * (obj.scale?.z || 1);
              frontZ = Math.max(frontZ, obj.position.z + r);
              centerY = obj.position.y;
              bodyRadius = r;
            } else if (gt === 'BoxGeometry' && (pm.depth || 0) >= 0.35) {
              const halfD = (pm.depth * 0.5) * (obj.scale?.z || 1);
              frontZ = Math.max(frontZ, obj.position.z + halfD);
              centerY = obj.position.y;
              bodyRadius = halfD;
            }
          });

          const petInfo = typeof this.getMyPetSyncInfo === 'function' ? this.getMyPetSyncInfo() : null;
          const petFaceStr = petInfo?.kaomoji || this.pet?.kaomoji || d.petKaomoji || '(・ω・)';
          const petTex = createCleanHorizontalFaceTexture(petFaceStr, '#0c4a6e', '#7dd3fc');

          let pFace = petFaces[0] || null;
          if (!pFace) {
            pFace = new THREE.Mesh(
              new THREE.PlaneGeometry(bodyRadius * 1.15, bodyRadius * 0.85),
              new THREE.MeshBasicMaterial({ map: petTex })
            );
            pFace.name = 'clean_pet_face_plate';
            petGrp.add(pFace);
          } else {
            pFace.geometry = new THREE.PlaneGeometry(bodyRadius * 1.15, bodyRadius * 0.85);
            pFace.material = new THREE.MeshBasicMaterial({ map: petTex, side: THREE.FrontSide });
          }

          // 球体表面（frontZ）より確実に 0.055 手前に配置して絶対めり込まないようにする
          pFace.position.set(0, centerY, frontZ + 0.055);
          pFace.rotation.set(0, 0, 0);
          pFace.scale.set(1, 1, 1);
          pFace.renderOrder = 6;
        }
      },

      // C. 全称号＆全実績の完全パッシブ化（装備不要で所持しているすべてが常時発動）
      getAllTitlesAndAchievementsPassiveClean() {
        const d = this.saveData || {};

        const scanCollection = (globalList, saveKeys, bonusKeyHints) => {
          const rawList = (typeof globalList !== 'undefined' && globalList)
            ? (Array.isArray(globalList) ? globalList : Object.entries(globalList).map(([k, v]) => ({ id: k, ...(typeof v === 'object' ? v : { name: String(v) }) })))
            : [];
          const unlockedIds = new Set();

          saveKeys.forEach(sk => {
            const src = d[sk];
            if (!src) return;
            if (Array.isArray(src)) {
              src.forEach(item => {
                if (typeof item === 'string' && item) unlockedIds.add(item);
                else if (item && typeof item === 'object' && (item.unlocked || item.earned || item.completed || item.done || item.has)) {
                  unlockedIds.add(String(item.id || item.titleId || item.achId || item.name || ''));
                }
              });
            } else if (typeof src === 'object') {
              Object.entries(src).forEach(([k, v]) => {
                if (v === true || v === 1 || (v && typeof v === 'object' && (v.unlocked || v.earned || v.completed || v.done))) {
                  unlockedIds.add(String(k));
                }
              });
            }
          });

          // 現在装備中として保存されていた称号IDも所持済みに含める
          ['equippedTitle', 'currentTitle', 'activeTitle', 'title', 'titleId'].forEach(tk => {
            if (typeof d[tk] === 'string' && d[tk] && d[tk] !== 'none') unlockedIds.add(d[tk]);
          });

          let unlockedCount = 0;
          let extraAtk = 0, extraDef = 0, extraHp = 0, extraPct = 0;

          if (rawList.length > 0) {
            rawList.forEach((entry, idx) => {
              const id = String(entry.id || entry.titleId || entry.achId || `idx_${idx}`);
              const name = String(entry.name || entry.title || id);
              const isOwned = Boolean(entry.unlocked || entry.earned || entry.completed || unlockedIds.has(id) || unlockedIds.has(name));
              if (isOwned) {
                unlockedCount++;
                // 称号・実績定義に固有ボーナスがあればすべて合算
                extraAtk += Number(entry.atk || entry.bonusAtk || 0);
                extraDef += Number(entry.def || entry.bonusDef || 0);
                extraHp += Number(entry.hp || entry.maxHp || entry.bonusHp || 0);
                extraPct += Number(entry.statPct || entry.allPct || entry.bonusPct || 0);
              }
            });
            return {
              unlocked: unlockedCount,
              total: rawList.length,
              complete: unlockedCount >= rawList.length,
              extraAtk, extraDef, extraHp, extraPct
            };
          }

          unlockedCount = unlockedIds.size;
          return { unlocked: unlockedCount, total: Math.max(unlockedCount, 1), complete: false, extraAtk: 0, extraDef: 0, extraHp: 0, extraPct: 0 };
        };

        const ttl = scanCollection(
          typeof TITLES !== 'undefined' ? TITLES : (typeof TITLE_LIST !== 'undefined' ? TITLE_LIST : null),
          ['titles', 'unlockedTitles', 'earnedTitles', 'titleUnlocked', 'ownedTitles']
        );
        const ach = scanCollection(
          typeof ACHIEVEMENTS !== 'undefined' ? ACHIEVEMENTS : (typeof ACHIEVEMENT_LIST !== 'undefined' ? ACHIEVEMENT_LIST : null),
          ['achievements', 'unlockedAchievements', 'earnedAchievements', 'achUnlocked']
        );

        const totalCount = ttl.unlocked + ach.unlocked;
        const allComplete = (ttl.complete && ach.complete) || (ttl.complete && ach.unlocked === 0 && ttl.unlocked > 0);

        // 称号1個につき全ステ+4%・報酬+5%、実績1個につき全ステ+3%・報酬+4%（すべて重複して常時パッシブ発動）
        const statPct = (ttl.unlocked * 0.04) + (ach.unlocked * 0.03) + ttl.extraPct + ach.extraPct + (allComplete ? 0.50 : 0);
        const hpPct = (ttl.unlocked * 0.05) + (ach.unlocked * 0.04) + (allComplete ? 0.50 : 0);
        const rewardPct = (ttl.unlocked * 0.05) + (ach.unlocked * 0.04) + (allComplete ? 0.50 : 0);

        return {
          ttl, ach, totalCount, allComplete,
          statPct, hpPct, rewardPct,
          flatAtk: ttl.extraAtk + ach.extraAtk,
          flatDef: ttl.extraDef + ach.extraDef,
          flatHp: ttl.extraHp + ach.extraHp
        };
      },

      // 素のMP消費5倍（最低50〜）
      calcSkillMp5xClean(slotOrSkill = 0) {
        const d = this.saveData || {};
        let slotIdx = typeof slotOrSkill === 'number' ? slotOrSkill : 0;
        let rawSkill = null;
        let skillLv = 1;

        if (typeof slotOrSkill === 'object' && slotOrSkill !== null) {
          rawSkill = slotOrSkill;
          const sid = String(rawSkill.id || rawSkill.skillId || '');
          skillLv = Math.max(1, Number(d.skillLevels?.[sid] ?? d.skillLvs?.[sid] ?? rawSkill.lv ?? rawSkill.level ?? 1));
        } else if (typeof this.resolveSkillMeta === 'function') {
          const meta = this.resolveSkillMeta(slotIdx);
          if (meta) {
            skillLv = Math.max(1, Number(meta.skillLv || 1));
            if (typeof SKILLS !== 'undefined' && SKILLS) {
              const list = Array.isArray(SKILLS) ? SKILLS : Object.values(SKILLS);
              rawSkill = list.find(s => s && (String(s.id) === String(meta.skillId) || String(s.skillId) === String(meta.skillId))) || list[slotIdx] || null;
            }
          }
        }

        const defaultOrig = [10, 14, 18, 24, 30][slotIdx] || 10;
        if (rawSkill && rawSkill._origMpClean === undefined) {
          const detected = Number(rawSkill.mpCost ?? rawSkill.mp ?? rawSkill.costMp ?? 0);
          rawSkill._origMpClean = detected > 0 ? detected : defaultOrig;
        }
        const origMp = rawSkill?._origMpClean || defaultOrig;
        const base5x = Math.max(50, Math.round(origMp * 5));
        const finalMp = Math.max(50, Math.floor(base5x * (1 + (skillLv - 1) * 0.08)));
        return { base5x, mpCost: finalMp, skillLv };
      },

      // 格上1Lv差ごとに基準値の1.5倍を線形加算＋【格上】表記
      normalizeHigherLevelMonstersClean() {
        if (!Array.isArray(this.monsters)) return;
        const d = this.saveData || {};
        const playerLv = Math.max(1, Number(d.lv ?? d.level ?? this.player?.lv ?? 1));

        this.monsters.forEach(m => {
          if (!m || m.dead) return;
          const mLv = Math.max(1, Number(m.lv ?? m.level ?? 1));
          const lvDiff = Math.max(0, mLv - playerLv);
          const isKakue = lvDiff > 0;

          if (!m._rawNameClean && typeof m.name === 'string') {
            m._rawNameClean = m.name.replace(/^【格上】\s*/g, '');
          }
          if (m._rawNameClean) {
            const desiredName = isKakue ? `【格上】${m._rawNameClean}` : m._rawNameClean;
            if (m.name !== desiredName) m.name = desiredName;
          }

          if (!m._rawCapturedClean) {
            m._rawCapturedClean = true;
            m._rawAtkClean = Math.max(1, Number(m.atk) || 10);
            m._rawMaxHpClean = Math.max(10, Number(m.maxHp || m.hp) || 30);
            m._rawExpClean = Math.max(1, Number(m.exp || m.expReward) || 10);
            m._rawGoldClean = Math.max(1, Number(m.gold || m.goldReward) || 5);
          }

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

    // ゾーン切替時に始まりの広場の中央旧ワープを即座に撤去
    if (typeof P.loadZone === 'function' && !P._cleanLoadZoneWrapped) {
      const origLoadZone = P.loadZone;
      P.loadZone = function (...args) {
        const res = origLoadZone.apply(this, args);
        this.removeFakeCenterWarpClean();
        this.fixAllFacesCompletelyClean();
        return res;
      };
      P._cleanLoadZoneWrapped = true;
    }

    // 称号装備メソッドがあれば無効化し、全称号パッシブ案内を出す
    ['equipTitle', 'setTitle', 'selectTitle'].forEach(fn => {
      if (typeof P[fn] === 'function') {
        P[fn] = function () {
          this.showAlertBanner?.('👑 すべての称号＆実績は装備不要で常時パッシブ発動しています！', 1800);
          this.refreshAllHUD?.();
        };
      }
    });
  }

  installCleanPart1();
  document.addEventListener('click', () => setTimeout(setupThreatControlsClean, 40), true);
  setTimeout(setupThreatControlsClean, 300);
})();
// ▲▲▲ ここまで【完全修正版 game8.js 1/2】 ▲▲▲
// ▼▼▼ ここから【完全修正版 game8.js 2/2】超豪華3Dスキルエフェクト＆技名進化・スペルカード演出・Lv.999クラス進化・剣1本化・ペット火力参照・称号パッシブUI ▼▼▼
(() => {
  'use strict';

  // =========================================================
  // 1. スペルカード風カットイン演出用 CSS 注入
  // =========================================================
  if (!document.getElementById('kmj-spellcard-style')) {
    const scStyle = document.createElement('style');
    scStyle.id = 'kmj-spellcard-style';
    scStyle.textContent = `
      @keyframes kmjSpellSlideIn {
        0%   { opacity: 0; transform: translateX(90px) skewX(-12deg) scale(0.92); }
        14%  { opacity: 1; transform: translateX(0px) skewX(-12deg) scale(1.02); }
        82%  { opacity: 1; transform: translateX(-10px) skewX(-12deg) scale(1.0); }
        100% { opacity: 0; transform: translateX(-110px) skewX(-12deg) scale(0.96); }
      }
      @keyframes kmjSpellSpin {
        0%   { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes kmjSpellSpinRev {
        0%   { transform: rotate(360deg); }
        100% { transform: rotate(0deg); }
      }
      @keyframes kmjScreenFlash {
        0%   { opacity: 0.55; }
        100% { opacity: 0; }
      }
      #kmj-spellcard-layer {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 9998;
        overflow: hidden;
      }
      .kmj-spell-flash {
        position: absolute;
        inset: 0;
        animation: kmjScreenFlash 0.48s ease-out forwards;
      }
      .kmj-spell-banner {
        position: absolute;
        right: 14px;
        top: 15%;
        min-width: 290px;
        max-width: 90vw;
        padding: 12px 24px 12px 20px;
        border-radius: 12px;
        border: 2px solid #fde047;
        box-shadow: 0 0 28px rgba(250, 204, 21, 0.75), inset 0 0 20px rgba(255, 255, 255, 0.25);
        display: flex;
        align-items: center;
        gap: 14px;
        animation: kmjSpellSlideIn 2.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        overflow: hidden;
      }
      .kmj-spell-inner {
        transform: skewX(12deg);
        display: flex;
        align-items: center;
        gap: 14px;
        position: relative;
        z-index: 2;
      }
      .kmj-spell-ring-bg {
        position: absolute;
        right: -24px;
        top: -34px;
        width: 140px;
        height: 140px;
        border: 3px dashed rgba(255, 255, 255, 0.45);
        border-radius: 50%;
        animation: kmjSpellSpin 6s linear infinite;
        z-index: 1;
      }
      .kmj-spell-ring-bg2 {
        position: absolute;
        right: -10px;
        top: -20px;
        width: 112px;
        height: 112px;
        border: 2px solid rgba(253, 224, 71, 0.55);
        border-radius: 50%;
        animation: kmjSpellSpinRev 4s linear infinite;
        z-index: 1;
      }
      .kmj-spell-avatar {
        background: rgba(15, 23, 42, 0.9);
        border: 2px solid #7dd3fc;
        border-radius: 10px;
        padding: 8px 10px;
        font-size: 16px;
        font-weight: 900;
        color: #fff;
        white-space: nowrap;
        box-shadow: 0 0 14px rgba(56, 189, 248, 0.8);
      }
    `;
    document.head.appendChild(scStyle);
  }

  // =========================================================
  // 2. Lv.999 クラス進化ツリー（武器は剣1本・杖なし、通常攻撃3Dエフェクト変化）
  // =========================================================
  const CLASS_TREE_CLEAN = [
    { id: 'novice', name: '見習い冒険者', icon: '🗡️', reqLv: 1, cost: 0, fxStyle: 'novice_slash', fxName: '蒼き光の斬撃波', atkMult: 1.0, defMult: 1.0, hpMult: 1.0, desc: '基本の冒険者クラス。蒼い斬撃波を放つ。' },
    { id: 'warrior', name: '重装戦士', icon: '⚔️', reqLv: 15, cost: 500, fxStyle: 'warrior_crimson', fxName: '紅蓮の豪快衝撃斬', atkMult: 1.28, defMult: 1.22, hpMult: 1.25, desc: 'Lv.15〜｜真紅のワイドスラッシュと地響き衝撃波。' },
    { id: 'spellblade', name: '魔法剣士', icon: '💠', reqLv: 15, cost: 500, fxStyle: 'spellblade_arcane', fxName: '蒼穹の魔導剣閃', atkMult: 1.32, defMult: 1.12, hpMult: 1.18, desc: 'Lv.15〜｜回転魔法陣付きの蒼い魔導剣閃。' },
    { id: 'paladin', name: '聖騎士（パラディン）', icon: '🛡️', reqLv: 50, cost: 2500, fxStyle: 'paladin_holy', fxName: '黄金の聖光十字斬', atkMult: 1.48, defMult: 1.55, hpMult: 1.50, desc: 'Lv.50〜｜黄金と白銀が交差する聖なる十字斬撃。' },
    { id: 'arch_spellblade', name: '大賢剣士（アークナイト）', icon: '🔮', reqLv: 50, cost: 2500, fxStyle: 'arch_meteor_slash', fxName: '紫電星屑の魔剣波', atkMult: 1.62, defMult: 1.32, hpMult: 1.38, desc: 'Lv.50〜｜紫と黄金の多重魔法陣から極大の魔導斬撃波。' },
    { id: 'ninja', name: '疾風の影忍者', icon: '🌪️', reqLv: 100, cost: 6000, fxStyle: 'ninja_gale', fxName: '翠嵐の三連疾風刃', atkMult: 1.75, defMult: 1.40, hpMult: 1.48, desc: 'Lv.100〜｜エメラルドの三連斬撃波と旋風。' },
    { id: 'blade_master', name: '蒼穹の剣聖', icon: '⚡', reqLv: 200, cost: 15000, fxStyle: 'blademaster_thunder', fxName: '次元断ち・蒼雷クロス斬', atkMult: 2.08, defMult: 1.68, hpMult: 1.78, desc: 'Lv.200〜｜稲妻を纏う超高速クロス斬撃。' },
    { id: 'astral_knight', name: '星詠みの聖剣士', icon: '🌟', reqLv: 200, cost: 15000, fxStyle: 'astral_prism', fxName: '銀河の星屑プリズム斬', atkMult: 2.18, defMult: 1.65, hpMult: 1.72, desc: 'Lv.200〜｜桜色と黄金の星屑プリズムバースト。' },
    { id: 'dragoon', name: '紅蓮の竜騎士', icon: '🐉', reqLv: 350, cost: 35000, fxStyle: 'dragoon_flame', fxName: '竜王の業火ブレイブ斬', atkMult: 2.52, defMult: 2.08, hpMult: 2.18, desc: 'Lv.350〜｜燃え盛る紅蓮の炎柱と竜の爪痕。' },
    { id: 'emperor_blade', name: '覇王・天帝剣神', icon: '👑', reqLv: 550, cost: 80000, fxStyle: 'emperor_gold', fxName: '天帝覇王・黄金螺旋斬', atkMult: 3.15, defMult: 2.65, hpMult: 2.80, desc: 'Lv.550〜｜黄金の立体神環と螺旋斬撃波。' },
    { id: 'void_overlord', name: '虚空の創世剣帝', icon: '🌌', reqLv: 750, cost: 150000, fxStyle: 'overlord_void', fxName: 'アビスノヴァ・黒蝕次元斬', atkMult: 3.65, defMult: 3.05, hpMult: 3.20, desc: 'Lv.750〜｜漆黒の重力輪とネオン紫の多重リング。' },
    { id: 'mythic_god', name: '創世神話・アルティメット顔文字神', icon: '🌈', reqLv: 999, cost: 500000, fxStyle: 'mythic_genesis', fxName: '創世神話・虹翼天翔ノヴァ斬', atkMult: 4.50, defMult: 3.80, hpMult: 4.00, desc: 'Lv.999到達の最終進化｜虹色多重魔法陣・立体神環・星屑爆発が同時発動！' }
  ];

  // スキル系統別・進化技名＆スペルカード定義
  const SKILL_EVOLUTION_THEMES = [
    {
      match: /炎|火|ファイア|ブレイズ|紅蓮|メテオ|爆発|flame|fire|meteor/i,
      cardType: '紅蓮スペル',
      c1: 0xef4444, c2: 0xfacc15, c3: 0xf97316,
      bgGrad: 'linear-gradient(135deg, rgba(127,29,29,0.95), rgba(234,88,12,0.92))',
      names: (base) => [
        base,
        `【真】紅蓮爆炎・${base}`,
        `【極】竜王焦熱符「インフェルノ・${base}」`,
        `【神話奥義】創世業火「プロミネンス・アルティメットノヴァ」`
      ]
    },
    {
      match: /氷|水|アイス|ブリザード|吹雪|蒼|freeze|ice|aqua|water/i,
      cardType: '氷華スペル',
      c1: 0x38bdf8, c2: 0xe0f2fe, c3: 0x818cf8,
      bgGrad: 'linear-gradient(135deg, rgba(12,74,110,0.95), rgba(37,99,235,0.92))',
      names: (base) => [
        base,
        `【真】氷晶零度・${base}`,
        `【極】絶対零度符「コキュートス・${base}」`,
        `【神話奥義】銀世界神話「エターナル・ダイヤモンドダスト」`
      ]
    },
    {
      match: /雷|電|サンダー|ライトニング|スパーク|thunder|lightning|volt/i,
      cardType: '紫電スペル',
      c1: 0xfacc15, c2: 0xa855f7, c3: 0x38bdf8,
      bgGrad: 'linear-gradient(135deg, rgba(88,28,135,0.95), rgba(202,138,4,0.92))',
      names: (base) => [
        base,
        `【真】紫電一閃・${base}`,
        `【極】雷神降臨符「タケミカヅチ・${base}」`,
        `【神話奥義】天罰神雷「インドラ・オーバーロードサンダー」`
      ]
    },
    {
      match: /風|疾風|嵐|ウィンド|トルネード|旋風|wind|gale|storm/i,
      cardType: '翠嵐スペル',
      c1: 0x34d399, c2: 0xa7f3d0, c3: 0xfde047,
      bgGrad: 'linear-gradient(135deg, rgba(6,78,59,0.95), rgba(16,185,129,0.92))',
      names: (base) => [
        base,
        `【真】翠嵐烈風・${base}`,
        `【極】風神天舞符「テンペスト・${base}」`,
        `【神話奥義】天空神話「シルフィード・無尽真空覇王斬」`
      ]
    },
    {
      match: /光|聖|ホーリー|ヒール|回復|祈り|祝福|holy|light|heal|bless/i,
      cardType: '聖光スペル',
      c1: 0xfde047, c2: 0xffffff, c3: 0xf472b6,
      bgGrad: 'linear-gradient(135deg, rgba(133,77,14,0.95), rgba(217,119,6,0.92))',
      names: (base) => [
        base,
        `【真】聖光煌めき・${base}`,
        `【極】天照聖域符「セイクリッド・${base}」`,
        `【神話奥義】創世聖典「セラフィム・無限光輪の奇跡」`
      ]
    },
    {
      match: /闇|黒|ダーク|シャドウ|アビス|呪|魔|dark|void|shadow|abyss/i,
      cardType: '黒蝕スペル',
      c1: 0x9333ea, c2: 0xf43f5e, c3: 0x38bdf8,
      bgGrad: 'linear-gradient(135deg, rgba(30,27,75,0.96), rgba(126,34,206,0.92))',
      names: (base) => [
        base,
        `【真】黒蝕冥界・${base}`,
        `【極】虚空崩壊符「アビスノヴァ・${base}」`,
        `【神話奥義】終焉神話「ラグナロク・次元黒蝕シンギュラリティ」`
      ]
    },
    {
      match: /.*/,
      cardType: '秘剣スペル',
      c1: 0x38bdf8, c2: 0xf472b6, c3: 0xfde047,
      bgGrad: 'linear-gradient(135deg, rgba(15,23,42,0.96), rgba(3,105,161,0.92))',
      names: (base) => [
        base,
        `【真】蒼穹剣閃・${base}`,
        `【極】剣聖奥義符「天翔十字・${base}」`,
        `【神話奥義】創世剣神「エクスカリバー・虹翼星屑ノヴァ」`
      ]
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
      // A. スキル進化情報＆技名変化の解決
      getEvolvedSkillInfoClean(slotOrSkill = 0) {
        const d = this.saveData || {};
        let slotIdx = typeof slotOrSkill === 'number' ? slotOrSkill : 0;
        let rawSkill = null;
        let skillLv = 1;

        if (typeof slotOrSkill === 'object' && slotOrSkill !== null) {
          rawSkill = slotOrSkill;
          const sid = String(rawSkill.id || rawSkill.skillId || '');
          skillLv = Math.max(1, Number(d.skillLevels?.[sid] ?? d.skillLvs?.[sid] ?? rawSkill.lv ?? rawSkill.level ?? 1));
        } else if (typeof this.resolveSkillMeta === 'function') {
          const meta = this.resolveSkillMeta(slotIdx);
          if (meta) {
            skillLv = Math.max(1, Number(meta.skillLv || 1));
            if (typeof SKILLS !== 'undefined' && SKILLS) {
              const list = Array.isArray(SKILLS) ? SKILLS : Object.values(SKILLS);
              rawSkill = list.find(s => s && (String(s.id) === String(meta.skillId) || String(s.skillId) === String(meta.skillId))) || list[slotIdx] || null;
            }
          }
        }

        if (rawSkill && !rawSkill._origSkillNameClean && typeof rawSkill.name === 'string') {
          rawSkill._origSkillNameClean = rawSkill.name.replace(/^【(真|極|奥義|神話奥義)】[^「・]*[・「]?|」$/g, '').trim() || rawSkill.name;
        }
        const origName = rawSkill?._origSkillNameClean || `秘技・第${slotIdx + 1}の型`;

        // 進化段階（0: 通常 Lv1-9 / 1: 真 Lv10-49 / 2: 極 Lv50-99 / 3: 神話奥義 Lv100+）
        const tier = skillLv >= 100 ? 3 : (skillLv >= 50 ? 2 : (skillLv >= 10 ? 1 : 0));
        const theme = SKILL_EVOLUTION_THEMES.find(t => t.match.test(origName)) || SKILL_EVOLUTION_THEMES[SKILL_EVOLUTION_THEMES.length - 1];
        const evolvedNames = theme.names(origName);
        const evolvedName = evolvedNames[tier] || origName;
        const tierLabels = ['通常スキル', '✨ スキル進化Ⅰ【真】', '🔥 スキル進化Ⅱ【極】', '🌈 スキル最終進化【神話スペルカード】'];

        return {
          rawSkill,
          slotIdx,
          skillLv,
          tier,
          tierLabel: tierLabels[tier],
          origName,
          evolvedName,
          cardType: theme.cardType,
          bgGrad: theme.bgGrad,
          c1: theme.c1,
          c2: theme.c2,
          c3: theme.c3
        };
      },

      // 全SKILLS配列の技名とMP消費(5倍)を現在のスキルLvに合わせて同期
      syncSkillsMpAndEvolvedNamesClean() {
        if (typeof SKILLS === 'undefined' || !SKILLS) return;
        const list = Array.isArray(SKILLS) ? SKILLS : Object.values(SKILLS);
        list.forEach((sk, idx) => {
          if (!sk || typeof sk !== 'object') return;
          const mpInfo = this.calcSkillMp5xClean(sk);
          const evoInfo = this.getEvolvedSkillInfoClean(sk);
          if ('mpCost' in sk) sk.mpCost = mpInfo.mpCost;
          if ('mp' in sk) sk.mp = mpInfo.mpCost;
          if ('costMp' in sk) sk.costMp = mpInfo.mpCost;
          if (typeof sk.name === 'string') sk.name = evoInfo.evolvedName;
        });

        // 画面下部のスキルボタンの技名・MP表記も即時更新
        document.querySelectorAll('.skill-slot-btn, .skill-slot, .skill-btn, [data-skill-slot]').forEach((btn, idx) => {
          const slot = btn.dataset.skillSlot !== undefined ? Number(btn.dataset.skillSlot) : idx;
          const mpInfo = this.calcSkillMp5xClean(slot);
          const evoInfo = this.getEvolvedSkillInfoClean(slot);
          btn.title = `${evoInfo.evolvedName} (Lv.${evoInfo.skillLv})`;

          btn.querySelectorAll('span, div, small, b').forEach(el => {
            if (el.children.length > 0) return;
            const txt = (el.textContent || '').trim();
            if (/^MP\s*\d+$/i.test(txt)) {
              const targetMp = `MP ${mpInfo.mpCost}`;
              if (el.textContent !== targetMp) el.textContent = targetMp;
            } else if (evoInfo.origName && txt.includes(evoInfo.origName) && txt !== evoInfo.evolvedName) {
              el.textContent = evoInfo.evolvedName;
            }
          });
        });
      },

      // B. スペルカード風カットイン演出（スキル進化でさらに豪華に変化！）
      triggerSpellCardCutinClean(evoInfo) {
        let layer = document.getElementById('kmj-spellcard-layer');
        if (!layer) {
          layer = document.createElement('div');
          layer.id = 'kmj-spellcard-layer';
          document.body.appendChild(layer);
        }

        const d = this.saveData || {};
        const myFace = d.kaomoji || d.face || this.player?.kaomoji || '(｀・ω・´)';
        const borderColors = ['#38bdf8', '#4ade80', '#facc15', '#f472b6'];
        const bCol = borderColors[evoInfo.tier] || '#fde047';

        // 進化スキル（tier >= 1）は画面フラッシュ付きスペルカード発動
        if (evoInfo.tier >= 1) {
          const flash = document.createElement('div');
          flash.className = 'kmj-spell-flash';
          flash.style.background = evoInfo.tier >= 3
            ? 'radial-gradient(circle, rgba(253,224,71,0.55) 0%, rgba(244,114,182,0.35) 60%, transparent 100%)'
            : 'radial-gradient(circle, rgba(255,255,255,0.45) 0%, rgba(56,189,248,0.2) 70%, transparent 100%)';
          layer.appendChild(flash);
          setTimeout(() => flash.remove(), 520);
        }

        // 既存バナーがあれば差し替え
        layer.querySelectorAll('.kmj-spell-banner').forEach(el => el.remove());

        const banner = document.createElement('div');
        banner.className = 'kmj-spell-banner';
        banner.style.background = evoInfo.bgGrad;
        banner.style.borderColor = bCol;

        const spellSub = evoInfo.tier >= 1
          ? `✦ ${evoInfo.cardType}発動 ・ ${evoInfo.tierLabel} (Lv.${evoInfo.skillLv}) ✦`
          : `✦ SKILL CAST (Lv.${evoInfo.skillLv}) ✦`;

        banner.innerHTML = `
          <div class="kmj-spell-ring-bg"></div>
          <div class="kmj-spell-ring-bg2"></div>
          <div class="kmj-spell-inner">
            <div class="kmj-spell-avatar" style="border-color:${bCol};">${myFace}</div>
            <div>
              <div style="font-size:10px;font-weight:900;color:#fde047;letter-spacing:0.06em;text-shadow:0 1px 4px #000;">${spellSub}</div>
              <div style="font-size:${evoInfo.tier >= 2 ? '16px' : '14.5px'};font-weight:900;color:#ffffff;text-shadow:0 2px 10px rgba(0,0,0,0.9), 0 0 12px ${bCol};margin-top:2px;">
                ${evoInfo.evolvedName}
              </div>
            </div>
          </div>
        `;
        layer.appendChild(banner);
        setTimeout(() => banner.remove(), 2200);
      },

      // C. 超豪華3Dスキルエフェクト（多重魔法陣・天空光柱・立体神環・星屑爆発・カメラ振動）
      spawnUltraSkill3DFXClean(entity, evoInfo) {
        if (!this.useWebGL || !this.scene || !entity?.pos || typeof THREE === 'undefined') return;
        if (!this._slashEffects) this._slashEffects = [];

        const tier = evoInfo?.tier ?? 0;
        const scale = 1.35 + tier * 0.55; // Lv1:1.35倍 → Lv10:1.9倍 → Lv50:2.45倍 → Lv100:3.0倍
        const c1 = evoInfo?.c1 ?? 0x38bdf8;
        const c2 = evoInfo?.c2 ?? 0xf472b6;
        const c3 = evoInfo?.c3 ?? 0xfde047;

        // ターゲットモンスターが近くにいればそこを中心点に、いなければプレイヤー前方
        let targetX = entity.pos.x + Math.sin(entity.rotY || 0) * 2.2;
        let targetZ = entity.pos.z + Math.cos(entity.rotY || 0) * 2.2;
        if (Array.isArray(this.monsters)) {
          let bestDist = 14;
          this.monsters.forEach(m => {
            if (!m || m.dead || !m.pos) return;
            const dist = Math.hypot(m.pos.x - entity.pos.x, m.pos.z - entity.pos.z);
            if (dist < bestDist) {
              bestDist = dist;
              targetX = m.pos.x;
              targetZ = m.pos.z;
            }
          });
        }

        const fxGroup = new THREE.Group();
        fxGroup.position.set(targetX, 0, targetZ);

        // 1) 足元の多重魔法陣リング（進化するほどリング数増加）
        const ringCount = 2 + tier;
        for (let r = 0; r < ringCount; r++) {
          const innerR = (0.7 + r * 0.65) * scale;
          const outerR = innerR + 0.24 * scale;
          const col = r % 3 === 0 ? c1 : (r % 3 === 1 ? c2 : c3);
          const ring = new THREE.Mesh(
            new THREE.RingGeometry(innerR, outerR, 36),
            new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide, transparent: true, opacity: 0.92 })
          );
          ring.rotation.x = -Math.PI / 2;
          ring.position.y = 0.08 + r * 0.04;
          fxGroup.add(ring);
        }

        // 2) 天空から降り注ぐ極太オーラビーム柱
        const pillar = new THREE.Mesh(
          new THREE.CylinderGeometry(0.45 * scale, 1.15 * scale, 7.5 + tier * 2.0, 24, 1, true),
          new THREE.MeshBasicMaterial({ color: c1, side: THREE.DoubleSide, transparent: true, opacity: 0.48 })
        );
        pillar.position.y = (7.5 + tier * 2.0) * 0.5;
        fxGroup.add(pillar);

        const coreBeam = new THREE.Mesh(
          new THREE.CylinderGeometry(0.22 * scale, 0.42 * scale, 8.5 + tier * 2.0, 18, 1, true),
          new THREE.MeshBasicMaterial({ color: c3, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
        );
        coreBeam.position.y = (8.5 + tier * 2.0) * 0.5;
        fxGroup.add(coreBeam);

        // 3) 進化スキル（tier >= 1）は立体交差トーラス神環＋回転斬撃波を追加
        if (tier >= 1) {
          for (let h = 0; h < tier + 1; h++) {
            const halo = new THREE.Mesh(
              new THREE.TorusGeometry((1.25 + h * 0.35) * scale, 0.09, 10, 32),
              new THREE.MeshBasicMaterial({ color: h % 2 === 0 ? c2 : c3, transparent: true, opacity: 0.92 })
            );
            halo.position.y = 1.4 + h * 0.3;
            halo.rotation.set(Math.PI * (0.28 + h * 0.22), h * 0.8, h * 0.5);
            fxGroup.add(halo);
          }
        }

        this.scene.add(fxGroup);
        this._slashEffects.push({
          kind: 'slash',
          mesh: fxGroup,
          mat: pillar.material,
          life: 0.65 + tier * 0.12,
          maxLife: 0.65 + tier * 0.12,
          vx: 0,
          vz: 0
        });

        // 4) 周囲に飛び散る大量の星屑・クリスタル・剣閃パーティクル（最大36個）
        const sparkCount = 14 + tier * 8;
        const rainbow = [0xf472b6, 0x38bdf8, 0xfde047, 0x34d399, 0xa855f7, 0xf97316];
        for (let i = 0; i < sparkCount; i++) {
          const ang = (Math.PI * 2 * i) / sparkCount;
          const col = tier >= 3 ? rainbow[i % rainbow.length] : (i % 3 === 0 ? c1 : (i % 3 === 1 ? c2 : c3));
          const sp = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.22 + tier * 0.06, 0),
            new THREE.MeshBasicMaterial({ color: col })
          );
          sp.position.set(targetX, 0.9 + (i % 4) * 0.35, targetZ);
          this.scene.add(sp);
          const speed = (6.5 + (i % 3) * 2.5) * (1 + tier * 0.2);
          this._slashEffects.push({
            kind: 'star',
            mesh: sp,
            life: 0.62,
            maxLife: 0.62,
            vx: Math.cos(ang) * speed,
            vy: 3.2 + (i % 4) * 1.1,
            vz: Math.sin(ang) * speed
          });
        }

        // カメラシェイクがあれば起動
        if (typeof this.shakeTimer === 'number') {
          this.shakeTimer = Math.max(this.shakeTimer, 0.22 + tier * 0.08);
        }
      },

      // D. 武器の杖撤廃＆剣1本化（重複除去）
      enforceSingleSwordNoStaffClean() {
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

        const pGrp = this.player?.group;
        if (!pGrp) return;
        const oldStaff = pGrp.getObjectByName?.('mage_staff_weapon');
        if (oldStaff) pGrp.remove(oldStaff);

        const swords = [];
        pGrp.children.forEach(ch => {
          const nm = (ch.name || '').toLowerCase();
          if (/sword|weapon|blade|wpn|katana/.test(nm)) swords.push(ch);
          else if (ch.position.x > 0.35) {
            let hasLongBlade = false;
            ch.traverse?.(sub => {
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
      },

      // E. Lv.999 クラス進化＆通常攻撃3Dエフェクト
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

      // F. ペット火力のプレイヤー完全参照化
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
      }
    });

    // MP消費計算・発動時消費(5倍)＋超豪華3Dスキルエフェクト＆スペルカードカットイン統合
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
        this.syncSkillsMpAndEvolvedNamesClean();
        const d = this.saveData;
        const mpInfo = this.calcSkillMp5xClean(slotIdx);
        const evoInfo = this.getEvolvedSkillInfoClean(slotIdx);
        const curCd = (this.player?.skillCds?.[slotIdx] ?? this.skillCds?.[slotIdx] ?? 0);
        const mpBefore = Number(d?.mp ?? this.player?.mp ?? 0);

        if (curCd <= 0.05 && !this._debugInfiniteMode && mpBefore < mpInfo.mpCost) {
          this.showAlertBanner?.(`💧 MP不足！（必要MP: ${mpInfo.mpCost} / 現在MP: ${Math.floor(mpBefore)}）`, 1400);
          return;
        }

        const res = origUseSlot.call(this, slotIdx);
        const curCdAfter = (this.player?.skillCds?.[slotIdx] ?? this.skillCds?.[slotIdx] ?? 0);
        if (curCd <= 0.05 && curCdAfter > 0.05) {
          if (!this._debugInfiniteMode) {
            const targetMp = Math.max(0, mpBefore - mpInfo.mpCost);
            if (d && typeof d.mp === 'number') d.mp = targetMp;
            if (this.player && typeof this.player.mp === 'number') this.player.mp = targetMp;
          }
          // 超豪華3Dスキルエフェクト＆スペルカード風カットイン発動
          this.spawnUltraSkill3DFXClean(this.player, evoInfo);
          this.triggerSpellCardCutinClean(evoInfo);
        }
        return res;
      };
      P._cleanMpUseSlotWrapped = true;
    }

    if (typeof P.syncSkillDescriptionsAndEffects === 'function' && !P._cleanSyncSkillWrapped) {
      const origSync = P.syncSkillDescriptionsAndEffects;
      P.syncSkillDescriptionsAndEffects = function () {
        this.syncSkillsMpAndEvolvedNamesClean();
        origSync.call(this);
        this.syncSkillsMpAndEvolvedNamesClean();
      };
      P._cleanSyncSkillWrapped = true;
    }

    // ステータス計算に「クラス倍率」＋「全称号＆全実績の常時パッシブ」を統合
    if (typeof P.getPlayerStats === 'function' && !P._cleanStatsWrapped) {
      const origStats = P.getPlayerStats;
      P.getPlayerStats = function () {
        const st = origStats.call(this);
        if (!st) return st;
        const cls = this.getCurrentClassClean();
        const pas = this.getAllTitlesAndAchievementsPassiveClean();
        const atkMult = (cls.atkMult || 1.0) * (1 + pas.statPct);
        const defMult = (cls.defMult || 1.0) * (1 + pas.statPct);
        const hpMult = (cls.hpMult || 1.0) * (1 + pas.hpPct);

        if (typeof st.atk === 'number') st.atk = Math.max(1, Math.floor((st.atk + pas.flatAtk) * atkMult));
        if (typeof st.matk === 'number') st.matk = Math.max(1, Math.floor((st.matk + pas.flatAtk) * atkMult));
        if (typeof st.mAtk === 'number') st.mAtk = Math.max(1, Math.floor((st.mAtk + pas.flatAtk) * atkMult));
        if (typeof st.def === 'number') st.def = Math.max(0, Math.floor((st.def + pas.flatDef) * defMult));
        if (typeof st.maxHp === 'number') st.maxHp = Math.max(20, Math.floor((st.maxHp + pas.flatHp) * hpMult));
        return st;
      };
      P._cleanStatsWrapped = true;
    }

    // 撃破報酬に「全称号＆全実績の常時パッシブ報酬ボーナス」を加算
    ['killMonster', 'onMonsterKilled'].forEach(fn => {
      if (typeof P[fn] === 'function' && !P[`_cleanReward_${fn}`]) {
        const orig = P[fn];
        P[fn] = function (m, ...rest) {
          const res = orig.apply(this, [m, ...rest]);
          const d = this.saveData;
          const pas = this.getAllTitlesAndAchievementsPassiveClean();
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

    // 通常攻撃時はクラス別3Dエフェクト、スキル時はgame7側の既存モーションも両立
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

    // モーダルUI（能力・進化／スキル／ペット／実績・称号）の統合
    if (typeof P.renderModalContent === 'function' && !P._cleanModalWrapped) {
      const origModal = P.renderModalContent;
      P.renderModalContent = function () {
        this.syncSkillsMpAndEvolvedNamesClean();
        origModal.call(this);
        const body = document.getElementById('modal-body');
        if (!body) return;
        const tab = String(this.activeTab || '').toLowerCase();
        const bodyTxt = body.textContent || '';
        const d = this.saveData || {};
        const playerLv = Math.max(1, Number(d.lv ?? d.level ?? this.player?.lv ?? 1));
        const curGold = Number(d.gold ?? d.coins ?? d.money ?? 0);

        // A. 「能力・進化」タブに Lv.999 クラス進化ツリーを表示
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

        // B. 「スキル」タブに進化段階＆スペルカード技名一覧を表示
        if (/skill|magic|art/.test(tab) || bodyTxt.includes('スキル強化')) {
          body.insertAdjacentHTML('afterbegin', `
            <div class="card-box" style="margin-bottom:8px;border-color:#f472b6;background:rgba(30,27,75,0.94);">
              <div style="font-size:11px;font-weight:900;color:#f9a8d4;margin-bottom:2px;">🎴 スキル進化＆スペルカード奥義システム</div>
              <div style="font-size:9.5px;color:#e2e8f0;line-height:1.4;">
                スキルLvが上がると<b>技名が進化</b>し、発動時に<b>スペルカード演出＆超豪華3D魔法陣</b>が炸裂します！<br>
                <span style="color:#fde047;">Lv.10【真】進化 ／ Lv.50【極】進化 ／ Lv.100【神話スペルカード】最終進化</span>
              </div>
            </div>
          `);
        }

        // C. 「ペット」タブにプレイヤー参照の相棒実効火力カードを表示
        if (/pet|companion/.test(tab) || bodyTxt.includes('相棒ペット')) {
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

        // D. 「称号・実績」タブの全称号＆全実績パッシブ化（タブ名だけでなく画面内文言でも確実に検知）
        if (/ach|title|trophy|quest/.test(tab) || /称号|実績/.test(bodyTxt)) {
          const pas = this.getAllTitlesAndAchievementsPassiveClean();
          body.querySelectorAll('button').forEach(btn => {
            const txt = (btn.textContent || '').trim();
            if (/装備|装着|セット|外す|解除/.test(txt) && !/スキル|武器|防具|ペット/.test(txt)) {
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
            <div class="card-box" style="margin-bottom:8px;border-color:#fbbf24;background:rgba(30,27,75,0.95);">
              <div class="flex-between" style="margin-bottom:3px;">
                <b style="color:#fde047;font-size:11.5px;">👑 全称号＆全実績 常時パッシブ発動中（装備不要）</b>
                <span style="font-size:10px;color:#34d399;font-weight:900;">称号:${pas.ttl.unlocked}/${pas.ttl.total} ・ 実績:${pas.ach.unlocked}/${pas.ach.total}</span>
              </div>
              <div style="font-size:10px;color:#f8fafc;line-height:1.45;">
                現在の常時パッシブ合計：<b style="color:#4ade80;">全攻撃・防御 +${Math.round(pas.statPct * 100)}%</b> ／
                <b style="color:#38bdf8;">最大HP +${Math.round(pas.hpPct * 100)}%</b> ／
                <b style="color:#fbbf24;">獲得EXP・GOLD +${Math.round(pas.rewardPct * 100)}%</b><br>
                <span style="color:#cbd5e1;font-size:9.5px;">※ 獲得したすべての称号と実績は、装備しなくても重複して常時パッシブ発動します！</span>
              </div>
            </div>
          `);
        }
      };
      P._cleanModalWrapped = true;
    }

    // メイン更新ループ（毎フレーム確実に顔矯正・旧ワープ撤去・剣1本化・ペット火力同期を維持）
    if (typeof P.updateRemotePlayers === 'function' && !P._cleanUpdateWrapped) {
      const origUpd = P.updateRemotePlayers;
      P.updateRemotePlayers = function (dt) {
        origUpd.call(this, dt);
        this.removeFakeCenterWarpClean?.();
        this.fixAllFacesCompletelyClean?.();
        this.enforceSingleSwordNoStaffClean();
        this.syncPetPowerClean();
        this.normalizeHigherLevelMonstersClean?.();
      };
      P._cleanUpdateWrapped = true;
    }

    if (typeof P.refreshAllHUD === 'function' && !P._cleanHudWrapped) {
      const origHud = P.refreshAllHUD;
      P.refreshAllHUD = function () {
        this.syncSkillsMpAndEvolvedNamesClean();
        this.syncPetPowerClean();
        origHud.call(this);
      };
      P._cleanHudWrapped = true;
    }

    setTimeout(() => {
      const inst = window.game;
      if (inst) {
        inst.removeFakeCenterWarpClean?.();
        inst.fixAllFacesCompletelyClean?.();
        inst.enforceSingleSwordNoStaffClean();
        inst.syncPetPowerClean();
        inst.syncSkillsMpAndEvolvedNamesClean();
        inst.normalizeHigherLevelMonstersClean?.();
        inst.refreshAllHUD?.();
      }
    }, 250);
  }

  installCleanPart2();
})();
// ▲▲▲ ここまで【完全修正版 game8.js 2/2】 ▲▲▲
