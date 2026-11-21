// ▼▼▼ ここから【超充実・完全版 game8.js 1/2】スペルカードCSS＆効果音・右上オンライン消去・広場旧ワープ撤去・顔90度回転＆球体埋まり完全修正・驚異度999・格上1.5倍線形加算・全称号＆実績パッシブ ▼▼▼
(() => {
  'use strict';

  const MAX_LV_999 = 999;
  const MAX_THREAT_999 = 999;

  try {
    ['MAX_LV', 'MAX_LEVEL', 'LEVEL_CAP', 'MAX_PLAYER_LV', 'MAX_SKILL_LV'].forEach(k => { window[k] = MAX_LV_999; });
    ['MAX_THREAT_RANK', 'MAX_THREAT', 'THREAT_CAP', 'MAX_THREAT_LEVEL', 'MAX_DANGER', 'THREAT_MAX'].forEach(k => { window[k] = MAX_THREAT_999; });
  } catch (e) {}

  // =========================================================
  // 1. スペルカードカットイン＆幾何学魔法陣CSS + 右上オンライン完全消去
  // =========================================================
  if (!document.getElementById('kmj-deluxe-master-style')) {
    const st = document.createElement('style');
    st.id = 'kmj-deluxe-master-style';
    st.textContent = `
      #kmj-v45-online-pill, [id*="online-pill"], [class*="online-pill"] {
        display: none !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
      @keyframes kmjSpellSlideIn {
        0%   { opacity: 0; transform: translateX(120px) skewX(-14deg) scale(0.88); }
        12%  { opacity: 1; transform: translateX(0px) skewX(-14deg) scale(1.04); }
        84%  { opacity: 1; transform: translateX(-12px) skewX(-14deg) scale(1.0); }
        100% { opacity: 0; transform: translateX(-140px) skewX(-14deg) scale(0.94); }
      }
      @keyframes kmjSpellLineExpand {
        0%   { transform: scaleX(0); opacity: 0; }
        20%  { transform: scaleX(1); opacity: 1; }
        85%  { transform: scaleX(1); opacity: 1; }
        100% { transform: scaleX(0); opacity: 0; }
      }
      @keyframes kmjSpellSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      @keyframes kmjSpellSpinRev { 0% { transform: rotate(360deg); } 100% { transform: rotate(0deg); } }
      @keyframes kmjScreenFlash { 0% { opacity: 0.62; } 100% { opacity: 0; } }

      #kmj-spellcard-layer {
        position: fixed; inset: 0; pointer-events: none; z-index: 9998; overflow: hidden;
      }
      .kmj-spell-flash {
        position: absolute; inset: 0; animation: kmjScreenFlash 0.55s ease-out forwards;
      }
      .kmj-spell-speedline-top, .kmj-spell-speedline-bot {
        position: absolute; left: 0; right: 0; height: 3px;
        background: linear-gradient(90deg, transparent, #fde047, #f472b6, #38bdf8, transparent);
        box-shadow: 0 0 14px #fde047;
        animation: kmjSpellLineExpand 2.2s ease-out forwards;
      }
      .kmj-spell-speedline-top { top: 12.5%; }
      .kmj-spell-speedline-bot { top: 24.5%; }

      .kmj-spell-banner {
        position: absolute; right: 14px; top: 13.5%; min-width: 310px; max-width: 92vw;
        padding: 13px 26px 13px 20px; border-radius: 12px; border: 2px solid #fde047;
        box-shadow: 0 0 36px rgba(250, 204, 21, 0.88), inset 0 0 24px rgba(255, 255, 255, 0.3);
        display: flex; align-items: center; gap: 14px;
        animation: kmjSpellSlideIn 2.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; overflow: hidden;
      }
      .kmj-spell-inner {
        transform: skewX(14deg); display: flex; align-items: center; gap: 14px; position: relative; z-index: 2;
      }
      .kmj-spell-circle-outer {
        position: absolute; right: -26px; top: -36px; width: 150px; height: 150px;
        border: 3px dashed rgba(255, 255, 255, 0.5); border-radius: 50%;
        animation: kmjSpellSpin 5.5s linear infinite; z-index: 1;
      }
      .kmj-spell-circle-inner {
        position: absolute; right: -10px; top: -20px; width: 118px; height: 118px;
        border: 2px solid rgba(253, 224, 71, 0.65); border-radius: 50%;
        animation: kmjSpellSpinRev 3.6s linear infinite; z-index: 1;
      }
      .kmj-spell-avatar {
        background: rgba(15, 23, 42, 0.94); border: 2px solid #7dd3fc; border-radius: 10px;
        padding: 8px 11px; font-size: 16px; font-weight: 900; color: #fff; white-space: nowrap;
        box-shadow: 0 0 16px rgba(56, 189, 248, 0.9);
      }
    `;
    document.head.appendChild(st);
  }

  // スペルカード発動＆進化専用シンセ効果音（外部ファイル不要）
  function playSpellCardSynthSound(tier = 0) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!window._kmjSpellAudioCtx) window._kmjSpellAudioCtx = new AudioCtx();
      const ctx = window._kmjSpellAudioCtx;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const chords = [
        [523.25, 659.25],                         // Lv1〜9: 爽快2和音
        [587.33, 739.99, 880.00],                 // Lv10〜49【真】: 輝き3和音
        [659.25, 830.61, 987.77, 1318.51],        // Lv50〜99【極】: 壮麗4和音
        [523.25, 659.25, 783.99, 1046.50, 1567.98]// Lv100+【神話奥義】: 神話5和音ファンファーレ
      ];
      const notes = chords[Math.min(3, Math.max(0, tier))];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = tier >= 2 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.045);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.03, now + idx * 0.045 + 0.35);

        gain.gain.setValueAtTime(0.001, now + idx * 0.045);
        gain.gain.linearRampToValueAtTime(0.065, now + idx * 0.045 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + idx * 0.045 + 0.42);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.045);
        osc.stop(now + idx * 0.045 + 0.45);
      });
    } catch (e) {}
  }

  function hideTopRightOnlineBarDeluxe() {
    document.getElementById('kmj-v45-online-pill')?.remove();
    const w = window.innerWidth || 800;
    document.querySelectorAll('div, span, header, nav').forEach(el => {
      if (el.id === 'hud' || el.id === 'modal' || el.closest('#modal') || el.closest('#chat-box')) return;
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
  hideTopRightOnlineBarDeluxe();
  setInterval(hideTopRightOnlineBarDeluxe, 450);

  // =========================================================
  // 2. 驚異度（フィールド脅威ランク）999即時反映＆一括バー
  // =========================================================
  function getThreatRankDeluxe(inst) {
    const d = inst?.saveData || {};
    const keys = ['threatRank', 'fieldThreatRank', 'threat', 'threatLevel', 'threatLv', 'danger'];
    for (const k of keys) if (typeof d[k] === 'number' && !Number.isNaN(d[k])) return Math.max(1, Math.min(MAX_THREAT_999, Math.floor(d[k])));
    for (const k of keys) if (typeof inst?.[k] === 'number' && !Number.isNaN(inst[k])) return Math.max(1, Math.min(MAX_THREAT_999, Math.floor(inst[k])));
    return 1;
  }

  function renderThreatTextDeluxe(val) {
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

  let _threatTimerDeluxe = null;
  function applyThreatRankDeluxe(rawNext) {
    const inst = window.game;
    const nextVal = Math.max(1, Math.min(MAX_THREAT_999, Math.floor(Number(rawNext) || 1)));
    renderThreatTextDeluxe(nextVal);
    if (!inst) return;
    const d = inst.saveData;
    const keys = ['threatRank', 'fieldThreatRank', 'threat', 'threatLevel', 'threatLv', 'danger'];
    if (d) {
      let wrote = false;
      keys.forEach(k => { if (typeof d[k] === 'number') { d[k] = nextVal; wrote = true; } });
      if (!wrote) d.threatRank = nextVal;
    }
    keys.forEach(k => { if (typeof inst[k] === 'number') inst[k] = nextVal; });

    clearTimeout(_threatTimerDeluxe);
    _threatTimerDeluxe = setTimeout(() => {
      try {
        if (!inst.towerState?.active && !inst.inTitleScreen && typeof inst.spawnMonsters === 'function') inst.spawnMonsters();
        inst.normalizeHigherLevelMonstersDeluxe?.();
        inst.saveGame?.(false);
        renderThreatTextDeluxe(nextVal);
      } catch (e) {}
    }, 90);
  }

  function setupThreatControlsDeluxe() {
    hideTopRightOnlineBarDeluxe();
    renderThreatTextDeluxe(getThreatRankDeluxe(window.game));
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
      if ((lbl === '-1' || lbl === '+1') && !btn.dataset.deluxeBound) {
        const delta = lbl === '+1' ? 1 : -1;
        const fresh = btn.cloneNode(true);
        fresh.removeAttribute('onclick');
        fresh.dataset.deluxeBound = '1';
        fresh.onclick = (e) => { e.preventDefault(); e.stopPropagation(); applyThreatRankDeluxe(getThreatRankDeluxe(window.game) + delta); };
        btn.replaceWith(fresh);
      }
    });

    if (document.getElementById('kmj-deluxe-threat-bar')) return;
    const bar = document.createElement('div');
    bar.id = 'kmj-deluxe-threat-bar';
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
        const now = getThreatRankDeluxe(window.game);
        if (it.m === 'set') applyThreatRankDeluxe(it.v);
        else if (it.m === 'add') applyThreatRankDeluxe(now + it.v);
        else {
          const inp = prompt(`設定したい脅威ランクを入力（1〜999）\n現在値: ${now}`, String(now));
          if (inp !== null && inp.trim() !== '' && !Number.isNaN(Number(inp))) applyThreatRankDeluxe(Number(inp));
        }
      };
      bar.appendChild(b);
    });
    card.appendChild(bar);
  }

  // Canvas頭上ラベル【格上】自動付与
  if (!CanvasRenderingContext2D.prototype._deluxeKakueHooked) {
    CanvasRenderingContext2D.prototype._deluxeKakueHooked = true;
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

  // =========================================================
  // 3. 水平顔文字テクスチャ生成（90度回転＆球体めり込み完全防止）
  // =========================================================
  const _faceTexCacheDeluxe = new Map();
  function makeHorizontalFaceTexDeluxe(faceStr, bg = '#0f294a', bd = '#38bdf8') {
    const face = String(faceStr || '(´・ω・`)').trim() || '(´・ω・`)';
    const key = `${face}|${bg}|${bd}`;
    if (_faceTexCacheDeluxe.has(key)) return _faceTexCacheDeluxe.get(key);

    const cv = document.createElement('canvas');
    cv.width = 256;
    cv.height = 192;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 256, 192);
    ctx.strokeStyle = bd;
    ctx.lineWidth = 10;
    ctx.strokeRect(8, 8, 240, 176);

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let fs = 44;
    ctx.font = `900 ${fs}px "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif`;
    while (ctx.measureText(face).width > 210 && fs > 18) {
      fs -= 2;
      ctx.font = `900 ${fs}px "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif`;
    }
    ctx.fillText(face, 128, 98);

    const tex = new THREE.CanvasTexture(cv);
    tex.needsUpdate = true;
    _faceTexCacheDeluxe.set(key, tex);
    return tex;
  }

  function installDeluxePart1() {
    if (typeof KaomojiMMORPG === 'undefined') {
      setTimeout(installDeluxePart1, 100);
      return;
    }

    const P = KaomojiMMORPG.prototype;
    if (P._deluxePart1Installed) return;
    P._deluxePart1Installed = true;

    // 旧顔ズレ関数の干渉を防止
    P.alignAvatarFaceStrictly = function () {};
    P._playSpellCardSynth = playSpellCardSynthSound;

    Object.assign(P, {
      // A. 始まりの顔文字広場の旧ワープゾーン（青いリング＋黄色ダイヤや中央リング）を完全撤去
      removeOldPlazaWarpDeluxe() {
        if (!this.scene || typeof THREE === 'undefined') return;
        const d = this.saveData || {};
        const zIdx = Number(d.zone ?? d.zoneIndex ?? this.currentZoneIndex ?? 0);
        const zName = String(this.currentZone?.name || d.zoneName || '');
        if (zIdx !== 0 && !/始まり|広場|plaza|town|start/i.test(zName)) return;

        const prot = new Set();
        const addP = o => o?.traverse?.(c => prot.add(c.uuid));
        addP(this.player?.group);
        addP(this.pet?.group || this.pet?.mesh);
        (this.monsters || []).forEach(m => addP(m?.group || m?.mesh));
        (this.npcs || []).forEach(n => addP(n?.group || n?.mesh));
        if (this.remotePlayers) {
          const rList = this.remotePlayers instanceof Map ? Array.from(this.remotePlayers.values()) : Object.values(this.remotePlayers);
          rList.forEach(r => addP(r?.group || r?.mesh));
        }

        const delList = [];
        this.scene.children.forEach(obj => {
          if (!obj || prot.has(obj.uuid) || obj.isLight || obj.isCamera || obj.type === 'GridHelper') return;
          const dist = Math.hypot(obj.position.x, obj.position.z);
          if (dist > 30) return;

          let hasRing = false, hasDiamond = false, isHugeFloor = false;
          obj.traverse?.(sub => {
            if (!sub.isMesh || !sub.geometry) return;
            const gt = sub.geometry.type || '';
            const pm = sub.geometry.parameters || {};
            if (gt === 'PlaneGeometry' && ((pm.width || 0) > 20 || (pm.height || 0) > 20)) isHugeFloor = true;
            if (gt === 'RingGeometry' || gt === 'TorusGeometry') hasRing = true;
            if (gt === 'OctahedronGeometry' || gt === 'ConeGeometry') hasDiamond = true;
          });
          if (!isHugeFloor && (hasRing || hasDiamond || /warp|portal|gate/i.test(obj.name || ''))) {
            delList.push(obj);
          }
        });
        delList.forEach(o => { try { this.scene.remove(o); } catch (e) {} });
      },

      // B. プレイヤー・NPC・ペットの顔90度回転＆球体めり込み完全修正 ＋ 武器の杖撤廃＆剣1本化
      fixFacesAndWeaponsDeluxe() {
        if (typeof THREE === 'undefined') return;
        const d = this.saveData || {};

        if (typeof WEAPONS !== 'undefined' && WEAPONS) {
          (Array.isArray(WEAPONS) ? WEAPONS : Object.values(WEAPONS)).forEach(w => {
            if (!w || typeof w !== 'object') return;
            if (w._origNameV22) w.name = w._origNameV22;
            else if (typeof w.name === 'string') {
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

          const tex = makeHorizontalFaceTexDeluxe(faceStr, bg, bd);
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

        // ペットの球体・キューブめり込み防止
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
          const pTex = makeHorizontalFaceTexDeluxe(pInfo?.kaomoji || this.pet?.kaomoji || '(・ω・)', '#0c4a6e', '#7dd3fc');
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

      // C. 格上（1Lv差ごとに基準値の1.5倍線形加算＆【格上】表記）
      normalizeHigherLevelMonstersDeluxe() {
        if (!Array.isArray(this.monsters)) return;
        const pLv = Math.max(1, Number(this.saveData?.lv ?? this.saveData?.level ?? this.player?.lv ?? 1));
        this.monsters.forEach(m => {
          if (!m || m.dead) return;
          const mLv = Math.max(1, Number(m.lv ?? m.level ?? 1));
          const diff = Math.max(0, mLv - pLv);
          if (!m._rawNameDeluxe && typeof m.name === 'string') m._rawNameDeluxe = m.name.replace(/^【格上】\s*/g, '');
          if (m._rawNameDeluxe) m.name = diff > 0 ? `【格上】${m._rawNameDeluxe}` : m._rawNameDeluxe;
          if (!m._rawCapDeluxe) {
            m._rawCapDeluxe = true;
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

      // D. 全称号＆全実績の完全パッシブ化（装備不要で所持しているすべてが常時発動）
      getAllPassivesDeluxe() {
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
          let u = 0, flatAtk = 0, flatDef = 0, flatHp = 0;
          if (list.length > 0) {
            list.forEach((it, idx) => {
              const id = String(it.id || it.titleId || it.achId || `i_${idx}`);
              if (it.unlocked || it.earned || it.completed || set.has(id) || set.has(String(it.name || ''))) {
                u++;
                flatAtk += Number(it.atk || it.bonusAtk || 0);
                flatDef += Number(it.def || it.bonusDef || 0);
                flatHp += Number(it.hp || it.maxHp || it.bonusHp || 0);
              }
            });
            return { u, t: list.length, complete: u >= list.length, flatAtk, flatDef, flatHp };
          }
          return { u: Math.max(set.size, 1), t: Math.max(set.size, 1), complete: false, flatAtk: 0, flatDef: 0, flatHp: 0 };
        };
        const ttl = countOwned(typeof TITLES !== 'undefined' ? TITLES : null, ['titles', 'unlockedTitles', 'earnedTitles', 'titleUnlocked']);
        const ach = countOwned(typeof ACHIEVEMENTS !== 'undefined' ? ACHIEVEMENTS : null, ['achievements', 'unlockedAchievements', 'earnedAchievements', 'achUnlocked']);
        const allComplete = (ttl.complete && ach.complete) || (ttl.complete && ach.u === 0 && ttl.u > 0);
        const statPct = ttl.u * 0.04 + ach.u * 0.03 + (allComplete ? 0.50 : 0);
        const hpPct = ttl.u * 0.05 + ach.u * 0.04 + (allComplete ? 0.50 : 0);
        const rewardPct = ttl.u * 0.05 + ach.u * 0.04 + (allComplete ? 0.50 : 0);
        return {
          ttl, ach, allComplete, statPct, hpPct, rewardPct,
          flatAtk: ttl.flatAtk + ach.flatAtk,
          flatDef: ttl.flatDef + ach.flatDef,
          flatHp: ttl.flatHp + ach.flatHp
        };
      }
    });

    if (typeof P.loadZone === 'function' && !P._deluxeLoadZoneHooked) {
      const origLZ = P.loadZone;
      P.loadZone = function (...args) {
        const res = origLZ.apply(this, args);
        this.removeOldPlazaWarpDeluxe();
        this.fixFacesAndWeaponsDeluxe();
        return res;
      };
      P._deluxeLoadZoneHooked = true;
    }

    ['equipTitle', 'setTitle', 'selectTitle'].forEach(fn => {
      if (typeof P[fn] === 'function') {
        P[fn] = function () {
          this.showAlertBanner?.('👑 すべての称号＆実績は装備不要で常時パッシブ発動しています！', 1800);
          this.refreshAllHUD?.();
        };
      }
    });
  }

  installDeluxePart1();
  document.addEventListener('click', () => setTimeout(setupThreatControlsDeluxe, 40), true);
  setTimeout(setupThreatControlsDeluxe, 300);
})();
// ▲▲▲ ここまで【超充実・完全版 game8.js 1/2】 ▲▲▲
// ▼▼▼ ここから【超充実・完全版 game8.js 2/2】全11系統専用3Dスキル造形＆スペルカード演出・12クラス通常攻撃3D造形・ペット連携＆プレイヤー火力参照・全称号＆実績パッシブUI ▼▼▼
(() => {
  'use strict';

  // =========================================================
  // 1. Lv.999 12クラス進化ツリー（武器は剣1本・杖なし、通常攻撃3D造形変化）
  // =========================================================
  const CLASS_TREE_DELUXE = [
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

  // =========================================================
  // 2. 全11系統の専用3Dスキル造形＆スペルカード進化定義
  // =========================================================
  const SPELL_SYSTEMS_DELUXE = [
    {
      id: 'fire',
      match: /炎|火|ファイア|ブレイズ|紅蓮|メテオ|爆発|業火|flame|fire|meteor/i,
      cardType: '紅蓮スペル',
      shape3D: 'meteor_inferno',
      c1: 0xef4444, c2: 0xfacc15, c3: 0xf97316,
      bgGrad: 'linear-gradient(135deg, rgba(127,29,29,0.96), rgba(234,88,12,0.92))',
      names: (b) => [
        b,
        `【真】紅蓮爆炎・${b}`,
        `【極】竜王焦熱符「インフェルノ・${b}」`,
        `【神話奥義】創世業火「プロミネンス・アルティメットノヴァ」`
      ]
    },
    {
      id: 'ice',
      match: /氷|アイス|ブリザード|吹雪|零度|霜|freeze|ice|blizzard/i,
      cardType: '氷華スペル',
      shape3D: 'ice_spikes',
      c1: 0x38bdf8, c2: 0xe0f2fe, c3: 0x818cf8,
      bgGrad: 'linear-gradient(135deg, rgba(12,74,110,0.96), rgba(37,99,235,0.92))',
      names: (b) => [
        b,
        `【真】氷晶零度・${b}`,
        `【極】絶対零度符「コキュートス・${b}」`,
        `【神話奥義】銀世界神話「エターナル・ダイヤモンドダスト」`
      ]
    },
    {
      id: 'thunder',
      match: /雷|電|サンダー|ライトニング|スパーク|雷鳴|thunder|lightning|volt/i,
      cardType: '紫電スペル',
      shape3D: 'thunder_bolts',
      c1: 0xfacc15, c2: 0xa855f7, c3: 0x38bdf8,
      bgGrad: 'linear-gradient(135deg, rgba(88,28,135,0.96), rgba(202,138,4,0.92))',
      names: (b) => [
        b,
        `【真】紫電一閃・${b}`,
        `【極】雷神降臨符「タケミカヅチ・${b}」`,
        `【神話奥義】天罰神雷「インドラ・オーバーロードサンダー」`
      ]
    },
    {
      id: 'wind',
      match: /風|疾風|嵐|ウィンド|トルネード|旋風|烈風|wind|gale|storm/i,
      cardType: '翠嵐スペル',
      shape3D: 'wind_tornado',
      c1: 0x34d399, c2: 0xa7f3d0, c3: 0xfde047,
      bgGrad: 'linear-gradient(135deg, rgba(6,78,59,0.96), rgba(16,185,129,0.92))',
      names: (b) => [
        b,
        `【真】翠嵐烈風・${b}`,
        `【極】風神天舞符「テンペスト・${b}」`,
        `【神話奥義】天空神話「シルフィード・無尽真空覇王斬」`
      ]
    },
    {
      id: 'water',
      match: /水|海|波|津波|アクア|水流|渦|aqua|water|wave|ocean/i,
      cardType: '蒼海スペル',
      shape3D: 'water_geyser',
      c1: 0x0284c7, c2: 0x7dd3fc, c3: 0x2dd4bf,
      bgGrad: 'linear-gradient(135deg, rgba(7,89,133,0.96), rgba(13,148,136,0.92))',
      names: (b) => [
        b,
        `【真】蒼海激流・${b}`,
        `【極】海神怒涛符「リヴァイアサン・${b}」`,
        `【神話奥義】深淵海神「ポセイドン・創世大津波ノヴァ」`
      ]
    },
    {
      id: 'earth',
      match: /地|岩|土|地震|クエイク|メテオライト|砕|earth|rock|quake/i,
      cardType: '大地スペル',
      shape3D: 'earth_pillars',
      c1: 0xd97706, c2: 0xfbbf24, c3: 0x78350f,
      bgGrad: 'linear-gradient(135deg, rgba(120,53,15,0.96), rgba(180,83,9,0.92))',
      names: (b) => [
        b,
        `【真】剛岩砕破・${b}`,
        `【極】地母神符「ガイア・クラッシュ・${b}」`,
        `【神話奥義】星砕神話「タイタン・天地開闢メテオストライク」`
      ]
    },
    {
      id: 'holy',
      match: /光|聖|ホーリー|ヒール|回復|祈り|祝福|天照|holy|light|heal|bless/i,
      cardType: '聖光スペル',
      shape3D: 'holy_sanctuary',
      c1: 0xfde047, c2: 0xffffff, c3: 0xf472b6,
      bgGrad: 'linear-gradient(135deg, rgba(133,77,14,0.96), rgba(217,119,6,0.92))',
      names: (b) => [
        b,
        `【真】聖光煌めき・${b}`,
        `【極】天照聖域符「セイクリッド・${b}」`,
        `【神話奥義】創世聖典「セラフィム・無限光輪の奇跡」`
      ]
    },
    {
      id: 'dark',
      match: /闇|黒|ダーク|シャドウ|アビス|ブラックホール|dark|void|shadow|abyss/i,
      cardType: '黒蝕スペル',
      shape3D: 'dark_blackhole',
      c1: 0x9333ea, c2: 0xf43f5e, c3: 0x38bdf8,
      bgGrad: 'linear-gradient(135deg, rgba(30,27,75,0.97), rgba(126,34,206,0.92))',
      names: (b) => [
        b,
        `【真】黒蝕冥界・${b}`,
        `【極】虚空崩壊符「アビスノヴァ・${b}」`,
        `【神話奥義】終焉神話「ラグナロク・次元黒蝕シンギュラリティ」`
      ]
    },
    {
      id: 'poison',
      match: /毒|呪|ポイズン|ヴェノム|カース|瘴気|poison|venom|curse/i,
      cardType: '呪詛スペル',
      shape3D: 'poison_hex',
      c1: 0xa855f7, c2: 0x4ade80, c3: 0xf43f5e,
      bgGrad: 'linear-gradient(135deg, rgba(59,7,100,0.96), rgba(21,128,61,0.92))',
      names: (b) => [
        b,
        `【真】猛毒瘴気・${b}`,
        `【極】魔界呪詛符「ベリアル・${b}」`,
        `【神話奥義】混沌神話「ヒュドラ・無間地獄の瘴気陣」`
      ]
    },
    {
      id: 'star',
      match: /星|宇宙|銀河|スター|コメット|ノヴァ|コスモ|star|comet|nova|cosmos/i,
      cardType: '星屑スペル',
      shape3D: 'star_galaxy',
      c1: 0xf472b6, c2: 0xfde047, c3: 0x38bdf8,
      bgGrad: 'linear-gradient(135deg, rgba(49,46,129,0.96), rgba(219,39,119,0.92))',
      names: (b) => [
        b,
        `【真】星屑流星・${b}`,
        `【極】銀河星霊符「スターダスト・${b}」`,
        `【神話奥義】宇宙創世「ビッグバン・ギャラクシーノヴァ」`
      ]
    },
    {
      id: 'sword',
      match: /.*/,
      cardType: '秘剣スペル',
      shape3D: 'sword_sanctum',
      c1: 0x38bdf8, c2: 0xf472b6, c3: 0xfde047,
      bgGrad: 'linear-gradient(135deg, rgba(15,23,42,0.96), rgba(3,105,161,0.92))',
      names: (b) => [
        b,
        `【真】蒼穹剣閃・${b}`,
        `【極】剣聖奥義符「天翔十字・${b}」`,
        `【神話奥義】創世剣神「エクスカリバー・虹翼星屑ノヴァ」`
      ]
    }
  ];

  function installDeluxePart2() {
    if (typeof KaomojiMMORPG === 'undefined') {
      setTimeout(installDeluxePart2, 100);
      return;
    }

    const P = KaomojiMMORPG.prototype;
    if (P._deluxePart2Installed) return;
    P._deluxePart2Installed = true;

    Object.assign(P, {
      // A. 素のMP消費5倍（最低50〜）＋全11系統スキル進化情報＆技名解決
      getSkillDataDeluxe(slotOrSkill = 0) {
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

        const defaultOrig = [20, 26, 22, 16, 30][slotIdx] || 15;
        if (rawSkill && rawSkill._origMpDeluxe === undefined) {
          const detected = Number(rawSkill.mpCost ?? rawSkill.mp ?? rawSkill.costMp ?? 0);
          rawSkill._origMpDeluxe = detected > 0 ? detected : defaultOrig;
        }
        if (rawSkill && !rawSkill._origSkillNameDeluxe && typeof rawSkill.name === 'string') {
          rawSkill._origSkillNameDeluxe = rawSkill.name.replace(/^【(真|極|奥義|神話奥義)】[^「・]*[・「]?|」$/g, '').trim() || rawSkill.name;
        }

        const origMp = rawSkill?._origMpDeluxe || defaultOrig;
        const base5x = Math.max(50, Math.round(origMp * 5));
        const mpCost = Math.max(50, Math.floor(base5x * (1 + (skillLv - 1) * 0.08)));

        const origName = rawSkill?._origSkillNameDeluxe || `秘技・第${slotIdx + 1}の型`;
        const tier = skillLv >= 100 ? 3 : (skillLv >= 50 ? 2 : (skillLv >= 10 ? 1 : 0));
        const theme = SPELL_SYSTEMS_DELUXE.find(t => t.match.test(origName)) || SPELL_SYSTEMS_DELUXE[SPELL_SYSTEMS_DELUXE.length - 1];
        const evolvedName = theme.names(origName)[tier] || origName;
        const tierLabels = ['通常スキル', '✨ スキル進化Ⅰ【真】', '🔥 スキル進化Ⅱ【極】', '🌈 スキル最終進化【神話スペルカード】'];

        return {
          rawSkill,
          slotIdx,
          skillLv,
          base5x,
          mpCost,
          origName,
          evolvedName,
          tier,
          tierLabel: tierLabels[tier],
          theme
        };
      },

      syncAllSkillsDeluxe() {
        if (typeof SKILLS !== 'undefined' && SKILLS) {
          const list = Array.isArray(SKILLS) ? SKILLS : Object.values(SKILLS);
          list.forEach(sk => {
            if (!sk || typeof sk !== 'object') return;
            const info = this.getSkillDataDeluxe(sk);
            if ('mpCost' in sk) sk.mpCost = info.mpCost;
            if ('mp' in sk) sk.mp = info.mpCost;
            if ('costMp' in sk) sk.costMp = info.mpCost;
            if (typeof sk.name === 'string') sk.name = info.evolvedName;
          });
        }

        // 右下のスキルボタンのMP数字（20, 26, 22, 16 等）および技名を即時同期
        document.querySelectorAll('.skill-slot-btn, .skill-slot, .skill-btn, [data-skill-slot]').forEach((btn, idx) => {
          const slot = btn.dataset.skillSlot !== undefined ? Number(btn.dataset.skillSlot) : idx;
          const info = this.getSkillDataDeluxe(slot);
          btn.title = `${info.evolvedName} (Lv.${info.skillLv})`;

          btn.querySelectorAll('span, div, small, b').forEach(el => {
            if (el.children.length > 0) return;
            const txt = (el.textContent || '').trim();
            if (/^\d+$/.test(txt) && Number(txt) < 50) {
              el.textContent = String(info.mpCost);
            } else if (/^MP\s*\d+$/i.test(txt)) {
              const target = `MP ${info.mpCost}`;
              if (el.textContent !== target) el.textContent = target;
            } else if (info.origName && txt.includes(info.origName) && txt !== info.evolvedName) {
              el.textContent = info.evolvedName;
            }
          });
        });
      },

      // B. 東方スペルカード風カットイン演出＋進化ファンファーレ音
      triggerSpellCardCutinDeluxe(info) {
        this._playSpellCardSynth?.(info.tier);

        let layer = document.getElementById('kmj-spellcard-layer');
        if (!layer) {
          layer = document.createElement('div');
          layer.id = 'kmj-spellcard-layer';
          document.body.appendChild(layer);
        }

        const d = this.saveData || {};
        const myFace = d.kaomoji || d.face || this.player?.kaomoji || '(｀・ω・´)';
        const borderColors = ['#38bdf8', '#4ade80', '#facc15', '#f472b6'];
        const bCol = borderColors[info.tier] || '#fde047';

        layer.innerHTML = '';

        if (info.tier >= 1) {
          const flash = document.createElement('div');
          flash.className = 'kmj-spell-flash';
          flash.style.background = info.tier >= 3
            ? 'radial-gradient(circle, rgba(253,224,71,0.60) 0%, rgba(244,114,182,0.38) 60%, transparent 100%)'
            : 'radial-gradient(circle, rgba(255,255,255,0.50) 0%, rgba(56,189,248,0.24) 70%, transparent 100%)';
          layer.appendChild(flash);

          const lineTop = document.createElement('div');
          lineTop.className = 'kmj-spell-speedline-top';
          const lineBot = document.createElement('div');
          lineBot.className = 'kmj-spell-speedline-bot';
          layer.appendChild(lineTop);
          layer.appendChild(lineBot);
        }

        const banner = document.createElement('div');
        banner.className = 'kmj-spell-banner';
        banner.style.background = info.theme.bgGrad;
        banner.style.borderColor = bCol;

        const spellSub = info.tier >= 1
          ? `✦ ${info.theme.cardType}発動 ・ ${info.tierLabel} (Lv.${info.skillLv}) ✦`
          : `✦ SKILL CAST (Lv.${info.skillLv}) ✦`;

        banner.innerHTML = `
          <div class="kmj-spell-circle-outer"></div>
          <div class="kmj-spell-circle-inner"></div>
          <div class="kmj-spell-inner">
            <div class="kmj-spell-avatar" style="border-color:${bCol};">${myFace}</div>
            <div>
              <div style="font-size:10.5px;font-weight:900;color:#fde047;letter-spacing:0.06em;text-shadow:0 1px 4px #000;">${spellSub}</div>
              <div style="font-size:${info.tier >= 2 ? '16.5px' : '15px'};font-weight:900;color:#ffffff;text-shadow:0 2px 10px rgba(0,0,0,0.95), 0 0 14px ${bCol};margin-top:2px;">
                ${info.evolvedName}
              </div>
            </div>
          </div>
        `;
        layer.appendChild(banner);
        setTimeout(() => { if (layer) layer.innerHTML = ''; }, 2300);
      },

      // C. 全11系統専用3Dスキルジオメトリ（隕石・氷柱・落雷・竜巻・ブラックホール・光の剣陣など）
      spawnUltraSkill3DDeluxe(entity, info) {
        if (!this.useWebGL || !this.scene || !entity?.pos || typeof THREE === 'undefined') return;
        if (!this._slashEffects) this._slashEffects = [];

        const tier = info?.tier ?? 0;
        const scale = 1.45 + tier * 0.60; // Lv1:1.45倍 → Lv10:2.05倍 → Lv50:2.65倍 → Lv100:3.25倍
        const c1 = info?.theme?.c1 ?? 0x38bdf8;
        const c2 = info?.theme?.c2 ?? 0xf472b6;
        const c3 = info?.theme?.c3 ?? 0xfde047;
        const shape = info?.theme?.shape3D || 'sword_sanctum';

        let targetX = entity.pos.x + Math.sin(entity.rotY || 0) * 2.4;
        let targetZ = entity.pos.z + Math.cos(entity.rotY || 0) * 2.4;
        if (Array.isArray(this.monsters)) {
          let bestDist = 15;
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

        // 1) 足元の多重魔法陣リング（進化段階に応じて最大5重）
        const ringCount = 2 + tier;
        for (let r = 0; r < ringCount; r++) {
          const innerR = (0.72 + r * 0.65) * scale;
          const outerR = innerR + 0.26 * scale;
          const col = r % 3 === 0 ? c1 : (r % 3 === 1 ? c2 : c3);
          const ring = new THREE.Mesh(
            new THREE.RingGeometry(innerR, outerR, 36),
            new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide, transparent: true, opacity: 0.94 })
          );
          ring.rotation.x = -Math.PI / 2;
          ring.position.y = 0.08 + r * 0.045;
          fxGroup.add(ring);
        }

        // 2) 天空から降り注ぐ極太オーラビーム柱＋コアビーム
        const hPillar = 8.5 + tier * 2.4;
        const pillar = new THREE.Mesh(
          new THREE.CylinderGeometry(0.48 * scale, 1.30 * scale, hPillar, 24, 1, true),
          new THREE.MeshBasicMaterial({ color: c1, side: THREE.DoubleSide, transparent: true, opacity: 0.46 })
        );
        pillar.position.y = hPillar * 0.5;
        fxGroup.add(pillar);

        const coreBeam = new THREE.Mesh(
          new THREE.CylinderGeometry(0.24 * scale, 0.46 * scale, hPillar + 1.5, 18, 1, true),
          new THREE.MeshBasicMaterial({ color: c3, side: THREE.DoubleSide, transparent: true, opacity: 0.88 })
        );
        coreBeam.position.y = (hPillar + 1.5) * 0.5;
        fxGroup.add(coreBeam);

        // 3) 系統ごとの専用3D立体造形を追加！
        if (shape === 'meteor_inferno') {
          // 炎系：巨大メテオ球体＋噴き上がる紅蓮の炎柱コーン
          const meteor = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.95 * scale, 1),
            new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.95 })
          );
          meteor.position.y = 2.6 * scale;
          fxGroup.add(meteor);

          for (let f = 0; f < 5 + tier * 2; f++) {
            const ang = (Math.PI * 2 * f) / (5 + tier * 2);
            const cone = new THREE.Mesh(
              new THREE.ConeGeometry(0.32 * scale, (1.8 + (f % 3) * 0.6) * scale, 10),
              new THREE.MeshBasicMaterial({ color: f % 2 === 0 ? c1 : c2, transparent: true, opacity: 0.88 })
            );
            cone.position.set(Math.cos(ang) * 1.1 * scale, 1.1 * scale, Math.sin(ang) * 1.1 * scale);
            fxGroup.add(cone);
          }
        } else if (shape === 'ice_spikes') {
          // 氷系：放射状に突き出すクリスタル氷柱群
          const cnt = 6 + tier * 3;
          for (let i = 0; i < cnt; i++) {
            const ang = (Math.PI * 2 * i) / cnt;
            const spike = new THREE.Mesh(
              new THREE.ConeGeometry(0.28 * scale, (2.2 + (i % 3) * 0.7) * scale, 6),
              new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? c1 : c2, transparent: true, opacity: 0.92 })
            );
            spike.position.set(Math.cos(ang) * 1.15 * scale, 1.1 * scale, Math.sin(ang) * 1.15 * scale);
            spike.rotation.z = -Math.cos(ang) * 0.35;
            spike.rotation.x = Math.sin(ang) * 0.35;
            fxGroup.add(spike);
          }
        } else if (shape === 'thunder_bolts') {
          // 雷系：天空から突き刺さるジグザグ稲妻ボルト群
          const bolts = 3 + tier;
          for (let b = 0; b < bolts; b++) {
            const bx = (b - (bolts - 1) * 0.5) * 0.9 * scale;
            for (let seg = 0; seg < 4; seg++) {
              const boltSeg = new THREE.Mesh(
                new THREE.CylinderGeometry(0.11 * scale, 0.14 * scale, 1.7 * scale, 8),
                new THREE.MeshBasicMaterial({ color: seg % 2 === 0 ? c1 : c2 })
              );
              boltSeg.position.set(bx + (seg % 2 === 0 ? 0.25 : -0.25) * scale, (0.8 + seg * 1.45) * scale, 0);
              boltSeg.rotation.z = (seg % 2 === 0 ? -0.35 : 0.35);
              fxGroup.add(boltSeg);
            }
          }
        } else if (shape === 'wind_tornado') {
          // 風系：上昇する螺旋トルネードリング群
          const levels = 5 + tier * 2;
          for (let w = 0; w < levels; w++) {
            const tRing = new THREE.Mesh(
              new THREE.TorusGeometry((0.55 + w * 0.26) * scale, 0.08 * scale, 8, 28),
              new THREE.MeshBasicMaterial({ color: w % 2 === 0 ? c1 : c2, transparent: true, opacity: 0.9 })
            );
            tRing.position.y = (0.4 + w * 0.65) * scale;
            tRing.rotation.x = Math.PI / 2 + (w % 2 === 0 ? 0.15 : -0.15);
            fxGroup.add(tRing);
          }
        } else if (shape === 'dark_blackhole') {
          // 闇系：漆黒の重力ブラックホール球体＋ネオン降着円盤
          const bh = new THREE.Mesh(
            new THREE.SphereGeometry(0.95 * scale, 24, 24),
            new THREE.MeshBasicMaterial({ color: 0x090d16 })
          );
          bh.position.y = 1.65 * scale;
          fxGroup.add(bh);

          const disk = new THREE.Mesh(
            new THREE.TorusGeometry(1.65 * scale, 0.16 * scale, 10, 36),
            new THREE.MeshBasicMaterial({ color: c1, transparent: true, opacity: 0.95 })
          );
          disk.position.y = 1.65 * scale;
          disk.rotation.x = Math.PI * 0.38;
          fxGroup.add(disk);
        } else if (shape === 'earth_pillars') {
          // 大地系：隆起する巨大岩塊群
          const rocks = 5 + tier * 2;
          for (let r = 0; r < rocks; r++) {
            const ang = (Math.PI * 2 * r) / rocks;
            const rock = new THREE.Mesh(
              new THREE.DodecahedronGeometry((0.55 + (r % 3) * 0.18) * scale, 0),
              new THREE.MeshBasicMaterial({ color: r % 2 === 0 ? c1 : c2 })
            );
            rock.position.set(Math.cos(ang) * 1.2 * scale, (0.7 + (r % 2) * 0.5) * scale, Math.sin(ang) * 1.2 * scale);
            fxGroup.add(rock);
          }
        } else {
          // 剣技・聖光・星屑・水・毒系：空中に展開する無限の光剣陣＆立体神環
          const swordCount = 6 + tier * 3;
          for (let s = 0; s < swordCount; s++) {
            const ang = (Math.PI * 2 * s) / swordCount;
            const blade = new THREE.Mesh(
              new THREE.BoxGeometry(0.14 * scale, 2.3 * scale, 0.05 * scale),
              new THREE.MeshBasicMaterial({ color: s % 3 === 0 ? c1 : (s % 3 === 1 ? c2 : c3), transparent: true, opacity: 0.95 })
            );
            blade.position.set(Math.cos(ang) * 1.35 * scale, (1.8 + (s % 2) * 0.45) * scale, Math.sin(ang) * 1.35 * scale);
            blade.rotation.z = -Math.cos(ang) * 0.35;
            blade.rotation.x = Math.sin(ang) * 0.35;
            fxGroup.add(blade);
          }
        }

        // 4) 進化スキル（tier >= 1）は立体交差トーラス神環を追加
        if (tier >= 1) {
          for (let h = 0; h < tier + 1; h++) {
            const halo = new THREE.Mesh(
              new THREE.TorusGeometry((1.35 + h * 0.38) * scale, 0.095, 10, 32),
              new THREE.MeshBasicMaterial({ color: h % 2 === 0 ? c2 : c3, transparent: true, opacity: 0.94 })
            );
            halo.position.y = 1.5 + h * 0.35;
            halo.rotation.set(Math.PI * (0.28 + h * 0.22), h * 0.85, h * 0.52);
            fxGroup.add(halo);
          }
        }

        this.scene.add(fxGroup);
        this._slashEffects.push({
          kind: 'slash',
          mesh: fxGroup,
          mat: pillar.material,
          life: 0.78 + tier * 0.15,
          maxLife: 0.78 + tier * 0.15,
          vx: 0,
          vz: 0
        });

        // 5) 周囲に飛び散る大量の星屑・クリスタルパーティクル（最大42個）
        const sparkCount = 16 + tier * 8;
        const rainbow = [0xf472b6, 0x38bdf8, 0xfde047, 0x34d399, 0xa855f7, 0xf97316];
        for (let i = 0; i < sparkCount; i++) {
          const ang = (Math.PI * 2 * i) / sparkCount;
          const col = tier >= 3 ? rainbow[i % rainbow.length] : (i % 3 === 0 ? c1 : (i % 3 === 1 ? c2 : c3));
          const sp = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.25 + tier * 0.06, 0),
            new THREE.MeshBasicMaterial({ color: col })
          );
          sp.position.set(targetX, 0.95 + (i % 4) * 0.35, targetZ);
          this.scene.add(sp);
          const speed = (7.2 + (i % 3) * 2.6) * (1 + tier * 0.22);
          this._slashEffects.push({
            kind: 'star',
            mesh: sp,
            life: 0.72,
            maxLife: 0.72,
            vx: Math.cos(ang) * speed,
            vy: 3.5 + (i % 4) * 1.1,
            vz: Math.sin(ang) * speed
          });
        }

        // ペット連携アシストエフェクト（ペットがいる場合は同時に追撃ビームを発射）
        this.spawnPetAssistFXDeluxe(targetX, targetZ, c3);

        if (typeof this.shakeTimer === 'number') {
          this.shakeTimer = Math.max(this.shakeTimer, 0.26 + tier * 0.09);
        }
      },

      // ペット連携アシスト3Dエフェクト
      spawnPetAssistFXDeluxe(targetX, targetZ, colorHex = 0x38bdf8) {
        if (!this.useWebGL || !this.scene || !this.pet?.pos || typeof THREE === 'undefined') return;
        if (!this._slashEffects) this._slashEffects = [];

        const px = this.pet.pos.x;
        const pz = this.pet.pos.z;
        const dx = targetX - px;
        const dz = targetZ - pz;

        for (let i = 0; i < 6; i++) {
          const t = (i + 1) / 6;
          const orb = new THREE.Mesh(
            new THREE.SphereGeometry(0.18 + i * 0.03, 12, 12),
            new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x7dd3fc : colorHex, transparent: true, opacity: 0.92 })
          );
          orb.position.set(px + dx * t, 0.75 + Math.sin(t * Math.PI) * 0.8, pz + dz * t);
          this.scene.add(orb);
          this._slashEffects.push({
            kind: 'star',
            mesh: orb,
            life: 0.45,
            maxLife: 0.45,
            vx: dx * 1.2,
            vy: 1.5,
            vz: dz * 1.2
          });
        }
      },

      // D. Lv.999 クラス進化＆通常攻撃3D造形（武器は剣1本のまま変化）
      getCurrentClassDeluxe(evoIdOverride = null) {
        const d = this.saveData || {};
        const raw = String(evoIdOverride ?? d.evolutionId ?? d.classId ?? this.player?.evolutionId ?? 'novice');
        return CLASS_TREE_DELUXE.find(c => c.id === raw) || CLASS_TREE_DELUXE[0];
      },

      chooseClassDeluxe(classId) {
        const d = this.saveData;
        if (!d) return;
        const cls = CLASS_TREE_DELUXE.find(c => c.id === classId);
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
          if ('coins' in d) d.coins = d[coinKey];
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

      spawnClassBasicAttackFXDeluxe(entity) {
        if (!this.useWebGL || !this.scene || !entity?.pos || typeof THREE === 'undefined') return;
        if (!this._slashEffects) this._slashEffects = [];

        const isLocal = (entity === this.player);
        const cls = this.getCurrentClassDeluxe(isLocal ? null : entity.evolutionId);
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

      // E. ペット火力のプレイヤー完全参照化
      calcPetPowerFromPlayerDeluxe() {
        const st = typeof this.getPlayerStats === 'function' ? (this.getPlayerStats() || {}) : {};
        const d = this.saveData || {};
        const playerRef = Math.max(10, Number(st.atk ?? d.atk ?? 15), Number(st.matk ?? st.mAtk ?? 0));
        const petInfo = typeof this.getMyPetSyncInfo === 'function' ? this.getMyPetSyncInfo() : null;
        const petLv = Math.max(1, Number(petInfo?.lv || this.pet?.lv || 1));
        const eq = typeof this.getPetEquipDef === 'function' ? this.getPetEquipDef(petInfo?.equipId || 'none') : { atkPct: 0 };
        const mult = 0.75 + Math.min(1.50, (petLv - 1) * 0.015) + (Number(eq?.atkPct) || 0);
        return Math.max(5, Math.floor(playerRef * mult));
      },

      syncPetPowerDeluxe() {
        if (!this.pet) return;
        const pAtk = this.calcPetPowerFromPlayerDeluxe();
        this.pet.atk = pAtk;
        this.pet.attack = pAtk;
        this.pet.power = pAtk;
        this.pet.dmg = pAtk;
        this.pet.damage = pAtk;
        if (this.saveData) this.saveData.petAtk = pAtk;
      },

      // F. 質の良いものを作る時の「作れるレベル（reqLv）」標準判定ヘルパー
      getCraftRequiredLevelDeluxe(item, idx = 0) {
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

    // MP消費計算・発動時消費(5倍)＋超豪華3Dスキル造形＆スペルカードカットイン統合
    ['getSkillMpCost', 'calcSkillMpCost', 'getSkillCost'].forEach(fn => {
      if (typeof P[fn] === 'function') {
        P[fn] = function (slotOrSkill) {
          return this.getSkillDataDeluxe(slotOrSkill).mpCost;
        };
      }
    });

    if (typeof P.useSkillSlot === 'function' && !P._deluxeUseSkillHooked) {
      const origUse = P.useSkillSlot;
      P.useSkillSlot = function (slotIdx) {
        this.syncAllSkillsDeluxe();
        const d = this.saveData;
        const info = this.getSkillDataDeluxe(slotIdx);
        const curCd = (this.player?.skillCds?.[slotIdx] ?? this.skillCds?.[slotIdx] ?? 0);
        const mpBefore = Number(d?.mp ?? this.player?.mp ?? 0);

        if (curCd <= 0.05 && !this._debugInfiniteMode && mpBefore < info.mpCost) {
          this.showAlertBanner?.(`💧 MP不足！（必要MP: ${info.mpCost} / 現在MP: ${Math.floor(mpBefore)}）`, 1400);
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
          this.spawnUltraSkill3DDeluxe(this.player, info);
          this.triggerSpellCardCutinDeluxe(info);
        }
        return res;
      };
      P._deluxeUseSkillHooked = true;
    }

    if (typeof P.syncSkillDescriptionsAndEffects === 'function' && !P._deluxeSyncSkillHooked) {
      const origSync = P.syncSkillDescriptionsAndEffects;
      P.syncSkillDescriptionsAndEffects = function () {
        this.syncAllSkillsDeluxe();
        origSync.call(this);
        this.syncAllSkillsDeluxe();
      };
      P._deluxeSyncSkillHooked = true;
    }

    // ステータス計算に「クラス倍率」＋「全称号＆全実績の常時パッシブ」を統合
    if (typeof P.getPlayerStats === 'function' && !P._deluxeStatsHooked) {
      const origStats = P.getPlayerStats;
      P.getPlayerStats = function () {
        const st = origStats.call(this);
        if (!st) return st;
        const cls = this.getCurrentClassDeluxe();
        const pas = this.getAllPassivesDeluxe();
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
      P._deluxeStatsHooked = true;
    }

    // 撃破報酬に「全称号＆全実績の常時パッシブ報酬ボーナス」を加算
    ['killMonster', 'onMonsterKilled'].forEach(fn => {
      if (typeof P[fn] === 'function' && !P[`_deluxeReward_${fn}`]) {
        const orig = P[fn];
        P[fn] = function (m, ...rest) {
          const res = orig.apply(this, [m, ...rest]);
          const d = this.saveData;
          const pas = this.getAllPassivesDeluxe();
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
        P[`_deluxeReward_${fn}`] = true;
      }
    });

    // 通常攻撃時はクラス別3Dエフェクト、スキル時はgame7側の既存モーションも両立
    if (typeof P.triggerAttackVisual === 'function' && !P._deluxeAtkVisHooked) {
      const origVis = P.triggerAttackVisual;
      P.triggerAttackVisual = function (entity, isSkill = false, skillInfo = null) {
        if (!isSkill && entity) {
          entity.attackAnimTimer = 0.36;
          entity.attackIsSkill = false;
          this.spawnClassBasicAttackFXDeluxe(entity);
          return;
        }
        return origVis.call(this, entity, isSkill, skillInfo);
      };
      P._deluxeAtkVisHooked = true;
    }

    // モーダルUI（能力・進化／スキル／ペット／称号・実績）のフル統合
    if (typeof P.renderModalContent === 'function' && !P._deluxeModalHooked) {
      const origModal = P.renderModalContent;
      P.renderModalContent = function () {
        this.syncAllSkillsDeluxe();
        origModal.call(this);
        const body = document.getElementById('modal-body');
        if (!body) return;
        const tab = String(this.activeTab || '').toLowerCase();
        const bodyTxt = body.textContent || '';
        const d = this.saveData || {};
        const playerLv = Math.max(1, Number(d.lv ?? d.level ?? this.player?.lv ?? 1));
        const curGold = Number(d.gold ?? d.coins ?? d.money ?? 0);

        // A. 「能力・進化」タブに Lv.999 12クラス進化ツリーを表示
        if (/stat|evo|job|class/.test(tab)) {
          const curCls = this.getCurrentClassDeluxe();
          if (!Array.isArray(d.unlockedClassesClean)) d.unlockedClassesClean = ['novice'];
          const cardsHtml = CLASS_TREE_DELUXE.map(c => {
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
                <button type="button" class="btn-deluxe-choose-class" data-cid="${c.id}" ${dis ? 'disabled' : ''} style="width:100%;background:${bg};border:none;color:#fff;border-radius:5px;padding:4px 6px;font-size:10px;font-weight:900;cursor:${dis ? 'default' : 'pointer'};opacity:${dis && !isCur ? '0.65' : '1'};">${btnTxt}</button>
              </div>
            `;
          }).join('');

          body.insertAdjacentHTML('afterbegin', `
            <div class="card-box" style="margin-bottom:8px;border-color:#38bdf8;background:rgba(15,23,42,0.95);">
              <div class="flex-between" style="margin-bottom:4px;">
                <b style="color:#7dd3fc;font-size:11.5px;">⚜️ Lv.999 クラス進化＆自由選択（通常攻撃3Dエフェクト変化）</b>
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
          body.querySelectorAll('.btn-deluxe-choose-class').forEach(b => {
            b.addEventListener('click', () => {
              sfx?.init?.();
              this.chooseClassDeluxe(b.dataset.cid);
              this.renderModalContent();
            });
          });
        }

        // B. 「スキル」タブに全11系統進化＆スペルカード案内を表示
        if (/skill|magic|art/.test(tab) || bodyTxt.includes('スキル強化')) {
          body.insertAdjacentHTML('afterbegin', `
            <div class="card-box" style="margin-bottom:8px;border-color:#f472b6;background:rgba(30,27,75,0.95);">
              <div style="font-size:11px;font-weight:900;color:#f9a8d4;margin-bottom:2px;">🎴 スキル進化＆スペルカード奥義システム（全11系統3D造形）</div>
              <div style="font-size:9.5px;color:#e2e8f0;line-height:1.4;">
                スキルLvが上がると<b>技名が進化</b>し、発動時に<b>スペルカードカットイン＆系統固有の超豪華3D造形</b>が炸裂します！<br>
                <span style="color:#fde047;">Lv.10【真】進化 ／ Lv.50【極】進化 ／ Lv.100【神話スペルカード】最終進化</span>
              </div>
            </div>
          `);
        }

        // C. 「ペット」タブにプレイヤー参照の相棒実効火力カードを表示
        if (/pet|companion/.test(tab) || bodyTxt.includes('相棒ペット')) {
          const pAtk = this.calcPetPowerFromPlayerDeluxe();
          const st = typeof this.getPlayerStats === 'function' ? (this.getPlayerStats() || {}) : {};
          const refAtk = Math.max(10, Number(st.atk || 15), Number(st.matk || st.mAtk || 15));
          body.insertAdjacentHTML('afterbegin', `
            <div class="card-box" style="margin-bottom:8px;border-color:#38bdf8;background:rgba(15,23,42,0.95);display:flex;align-items:center;justify-content:space-between;gap:8px;">
              <div>
                <div style="font-size:11px;font-weight:900;color:#7dd3fc;">🐾 相棒ペット実効火力（プレイヤー参照＋追撃アシスト連動）</div>
                <div style="font-size:9.5px;color:#94a3b8;">あなたの火力 (${refAtk.toLocaleString()}) ＋ ペットLv・ペット装備補正に連動</div>
              </div>
              <div style="font-size:15px;font-weight:900;color:#fde047;">⚔️ ${pAtk.toLocaleString()}</div>
            </div>
          `);
        }

        // D. 「称号・実績」タブの全称号＆全実績パッシブ化パネル
        if (/ach|title|trophy|quest/.test(tab) || /称号|実績/.test(bodyTxt)) {
          const pas = this.getAllPassivesDeluxe();
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
                <span style="font-size:10px;color:#34d399;font-weight:900;">称号:${pas.ttl.u}/${pas.ttl.t} ・ 実績:${pas.ach.u}/${pas.ach.t}</span>
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
      P._deluxeModalHooked = true;
    }

    // メイン更新ループ（毎フレーム確実に顔矯正・旧ワープ撤去・剣1本化・ペット火力同期を維持）
    if (typeof P.updateRemotePlayers === 'function' && !P._deluxeLoopHooked) {
      const origLoop = P.updateRemotePlayers;
      P.updateRemotePlayers = function (dt) {
        origLoop.call(this, dt);
        this.removeOldPlazaWarpDeluxe();
        this.fixFacesAndWeaponsDeluxe();
        this.syncPetPowerDeluxe();
        this.normalizeHigherLevelMonstersDeluxe();
      };
      P._deluxeLoopHooked = true;
    }

    if (typeof P.refreshAllHUD === 'function' && !P._deluxeHudHooked) {
      const origHud = P.refreshAllHUD;
      P.refreshAllHUD = function () {
        this.syncAllSkillsDeluxe();
        this.syncPetPowerDeluxe();
        origHud.call(this);
      };
      P._deluxeHudHooked = true;
    }

    setTimeout(() => {
      const g = window.game;
      if (g) {
        g.removeOldPlazaWarpDeluxe();
        g.fixFacesAndWeaponsDeluxe();
        g.syncAllSkillsDeluxe();
        g.syncPetPowerDeluxe();
        g.normalizeHigherLevelMonstersDeluxe();
        g.refreshAllHUD?.();
        g.showAlertBanner?.('✅ 超充実パッチ（MP5倍・顔矯正・全11系統3Dスペルカード・称号パッシブ）適用完了！', 2600);
      }
    }, 300);
  }

  installDeluxePart2();
})();
// ▲▲▲ ここまで【超充実・完全版 game8.js 2/2】 ▲▲▲
