// ▼▼▼ ここから game8.js（完全版：武器グレード別3D剣＆3連水平横振り・顔文字正面化＆表情・MP成長回復・脅威度999・実績称号UI・高機能チャット） ▼▼▼
(() => {
  'use strict';

  // =========================================================
  // 1. 専用スタイル（脅威度999バー・高機能チャット・コンボHUD・称号パッシブUI）
  // =========================================================
  if (!document.getElementById('kmj-v8-master-css')) {
    const st = document.createElement('style');
    st.id = 'kmj-v8-master-css';
    st.textContent = `
      .kmj-v8-threat-bar {
        position: fixed;
        top: 34px;
        right: 8px;
        z-index: 89;
        display: flex;
        align-items: center;
        gap: 4px;
        background: rgba(15, 23, 42, 0.93);
        border: 1.5px solid #f59e0b;
        border-radius: 999px;
        padding: 2px 8px;
        font-size: 10px;
        font-weight: 900;
        color: #fde047;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.58);
        user-select: none;
      }
      .kmj-v8-threat-btn {
        background: #1e293b;
        border: 1px solid #fbbf24;
        color: #fef08a;
        border-radius: 4px;
        padding: 1px 5px;
        font-size: 9.5px;
        font-weight: 900;
        cursor: pointer;
        line-height: 1.2;
      }
      .kmj-v8-threat-btn:active {
        transform: scale(0.93);
      }
      .kmj-v8-combo-badge {
        position: fixed;
        left: 14px;
        top: 118px;
        z-index: 88;
        pointer-events: none;
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(30, 58, 138, 0.92));
        border: 1.5px solid #38bdf8;
        border-radius: 10px;
        padding: 4px 10px;
        color: #fff;
        font-weight: 900;
        box-shadow: 0 4px 14px rgba(56, 189, 248, 0.45);
        transition: opacity 0.2s, transform 0.15s;
      }
      .kmj-v8-chat-drag {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
        background: linear-gradient(90deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.96));
        border-bottom: 1px solid #38bdf8;
        color: #7dd3fc;
        font-size: 9.5px;
        font-weight: 900;
        padding: 3px 7px;
        cursor: move;
        touch-action: none;
        user-select: none;
        border-radius: 6px 6px 0 0;
      }
      .kmj-v8-chat-stamps {
        display: flex;
        flex-wrap: wrap;
        gap: 3px;
        padding: 3px 5px;
        background: rgba(2, 6, 23, 0.86);
        border-bottom: 1px solid rgba(56, 189, 248, 0.35);
      }
      .kmj-v8-stamp-btn {
        background: #1e293b;
        border: 1px solid #475569;
        color: #e2e8f0;
        border-radius: 4px;
        padding: 1px 5px;
        font-size: 9px;
        font-weight: 800;
        cursor: pointer;
        white-space: nowrap;
      }
      .kmj-v8-stamp-btn:hover {
        border-color: #38bdf8;
        color: #fff;
      }
      .kmj-v8-chat-resize {
        position: absolute;
        right: 1px;
        bottom: 1px;
        width: 15px;
        height: 15px;
        cursor: nwse-resize;
        touch-action: none;
        background: linear-gradient(135deg, transparent 42%, #38bdf8 48%, #fde047 100%);
        border-radius: 0 0 5px 0;
        opacity: 0.9;
        z-index: 25;
      }
      .kmj-v8-ach-summary {
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(30, 27, 75, 0.96));
        border: 1.5px solid #facc15;
        border-radius: 10px;
        padding: 9px 10px;
        margin-bottom: 10px;
        color: #f8fafc;
      }
    `;
    document.head.appendChild(st);
  }

  // =========================================================
  // 2. WebAudio 立体剣戟＆コンボ・ヒットサウンドエンジン
  // =========================================================
  function playSwordAudioV8(grade = 0, comboStep = 1, isHit = false) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!window._kmjV8AudioCtx) window._kmjV8AudioCtx = new AudioCtx();
      const ctx = window._kmjV8AudioCtx;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      if (isHit) {
        osc.type = 'square';
        osc2.type = 'triangle';
        const base = 320 + grade * 65 + comboStep * 45;
        osc.frequency.setValueAtTime(base, now);
        osc.frequency.exponentialRampToValueAtTime(95, now + 0.11);
        osc2.frequency.setValueAtTime(base * 1.5, now);
        osc2.frequency.exponentialRampToValueAtTime(140, now + 0.11);
        gain.gain.setValueAtTime(0.055, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      } else {
        osc.type = grade >= 3 ? 'sawtooth' : 'triangle';
        osc2.type = 'sine';
        const startFreq = 480 + grade * 90 + (comboStep - 1) * 110;
        const endFreq = 120 + grade * 22;
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.17);
        osc2.frequency.setValueAtTime(startFreq * 1.4, now);
        osc2.frequency.exponentialRampToValueAtTime(endFreq * 0.8, now + 0.15);
        gain.gain.setValueAtTime(0.065, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      }

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc2.start(now);
      osc.stop(now + 0.19);
      osc2.stop(now + 0.19);
    } catch (e) {}
  }

  // =========================================================
  // 3. 武器グレード（★1〜★6）・武器種別・属性判定＆3D剣モデル生成
  // =========================================================
  const WEAPON_GRADE_META_V8 = [
    { stars: '★1', rankName: '訓練級', colorHex: '#cbd5e1', mult: 1.00 },
    { stars: '★2', rankName: '精錬級', colorHex: '#38bdf8', mult: 1.15 },
    { stars: '★3', rankName: '名匠級', colorHex: '#34d399', mult: 1.32 },
    { stars: '★4', rankName: '英雄級', colorHex: '#f59e0b', mult: 1.55 },
    { stars: '★5', rankName: '伝説級', colorHex: '#f43f5e', mult: 1.85 },
    { stars: '★6', rankName: '神話級', colorHex: '#fde047', mult: 2.25 }
  ];

  function getWeaponGradeInfoV8(game, entity) {
    const isLocal = (entity === game?.player);
    const d = isLocal ? (game?.saveData || {}) : (entity || {});
    let wpnObj = null;
    let wpnIdx = 0;

    let wList = [];
    if (typeof WEAPONS !== 'undefined' && WEAPONS) {
      wList = (Array.isArray(WEAPONS) ? WEAPONS : Object.values(WEAPONS)).filter(w => w && typeof w === 'object');
    }

    const rawId = d.equippedWeapon ?? d.weaponId ?? d.weapon ?? d.equip?.weapon ?? entity?.weaponId ?? entity?.weapon;
    if (rawId && typeof rawId === 'object') {
      wpnObj = rawId;
      const found = wList.indexOf(wpnObj);
      if (found >= 0) wpnIdx = found;
    } else if (rawId !== undefined && rawId !== null && wList.length > 0) {
      const foundIdx = wList.findIndex(w => String(w.id) === String(rawId) || String(w.name) === String(rawId));
      if (foundIdx >= 0) {
        wpnObj = wList[foundIdx];
        wpnIdx = foundIdx;
      } else if (typeof rawId === 'number' && wList[rawId]) {
        wpnObj = wList[rawId];
        wpnIdx = rawId;
      }
    }
    if (!wpnObj && wList.length > 0) {
      wpnObj = wList[0];
      wpnIdx = 0;
    }

    const wName = String(wpnObj?.name || d.weaponName || 'ブロンズソード');
    const wDesc = String(wpnObj?.desc || '');
    const search = `${wName} ${wDesc} ${wpnObj?.attr || wpnObj?.element || ''}`;

    // グレード 0〜5（★1〜★6）判定
    let grade = 0;
    const rar = String(wpnObj?.rarity || wpnObj?.rank || wpnObj?.grade || '').toUpperCase();
    if (/LR|MYTH|GOD|神話|創世|アルティメット/.test(rar) || /創世|神話|エクスカリバー|ラグナロク|アルティメット|天叢雲/.test(wName)) {
      grade = 5;
    } else if (/UR|LEGEND|伝説|覇王|神剣/.test(rar) || /覇王|神剣|天帝|虚空|聖剣/.test(wName)) {
      grade = 4;
    } else if (/SSR|EPIC|英雄|竜/.test(rar) || /竜|英雄|魔剣|雷神|氷帝|炎帝/.test(wName)) {
      grade = 3;
    } else if (/SR|RARE|名剣/.test(rar) || /ミスリル|オリハルコン|プラチナ|騎士|名剣/.test(wName)) {
      grade = 2;
    } else if (/R|UNCOMMON|鋼|アイアン/.test(rar) || /鋼|アイアン|シルバー|銀|大剣/.test(wName)) {
      grade = 1;
    } else if (wList.length > 1) {
      grade = Math.min(5, Math.floor((wpnIdx / Math.max(1, wList.length - 1)) * 5.4));
    }

    const plusLv = Number(d.weaponPlus ?? d.weaponEnhance ?? wpnObj?.plus ?? wpnObj?.lv ?? 0);
    if (plusLv >= 50) grade = 5;
    else if (plusLv >= 30) grade = Math.max(grade, 4);
    else if (plusLv >= 15) grade = Math.max(grade, 3);
    else if (plusLv >= 5) grade = Math.max(grade, 2);

    // 刀身タイプ判定（大剣 / 日本刀 / 細剣 / 片手剣）
    let bladeType = 'longsword';
    if (/大剣|クレイモア|バスター|グレート|重剣|斬馬/.test(wName)) bladeType = 'greatsword';
    else if (/刀|ムラマサ|村正|天叢雲|正宗|katana/i.test(wName)) bladeType = 'katana';
    else if (/レイピア|細剣|フルーレ|rapier/i.test(wName)) bladeType = 'rapier';

    // 属性カラー・粒子形状
    let style = { c1: 0x38bdf8, c2: 0xe0f2fe, c3: 0x7dd3fc, hilt: 0x475569, shape: 'octa', attrName: '蒼空' };
    if (/炎|火|紅蓮|ブレイズ|フレア|イフリート|太陽|fire|flame|blaze/i.test(search)) {
      style = { c1: 0xef4444, c2: 0xfacc15, c3: 0xf97316, hilt: 0x7f1d1d, shape: 'tetra', attrName: '紅蓮' };
    } else if (/氷|吹雪|零度|アイス|フロスト|コキュートス|ice|frost|freeze/i.test(search)) {
      style = { c1: 0x38bdf8, c2: 0xffffff, c3: 0x818cf8, hilt: 0x1e3a8a, shape: 'octa', attrName: '氷結' };
    } else if (/雷|電|サンダー|紫電|ライトニング|インドラ|thunder|volt|lightning/i.test(search)) {
      style = { c1: 0xfacc15, c2: 0xa855f7, c3: 0x38bdf8, hilt: 0x581c87, shape: 'tetra', attrName: '紫電' };
    } else if (/風|嵐|疾風|翠嵐|ウィンド|テンペスト|wind|storm/i.test(search)) {
      style = { c1: 0x34d399, c2: 0xa7f3d0, c3: 0xfde047, hilt: 0x064e3b, shape: 'octa', attrName: '翠嵐' };
    } else if (/聖|光|黄金|パラディン|エクスカリバー|天照|holy|light|gold/i.test(search)) {
      style = { c1: 0xfde047, c2: 0xffffff, c3: 0xf59e0b, hilt: 0x92400e, shape: 'octa', attrName: '聖光' };
    } else if (/闇|黒|ダーク|アビス|虚空|ラグナロク|魔剣|dark|void|abyss/i.test(search)) {
      style = { c1: 0x9333ea, c2: 0xf43f5e, c3: 0x38bdf8, hilt: 0x1e1b4b, shape: 'dodeca', attrName: '虚空' };
    } else if (/竜|ドラゴン|ドラグーン|dragon/i.test(search)) {
      style = { c1: 0xdc2626, c2: 0xfde047, c3: 0xf97316, hilt: 0x450a0a, shape: 'tetra', attrName: '竜王' };
    } else if (grade >= 5) {
      style = { c1: 0xf472b6, c2: 0xfde047, c3: 0x38bdf8, hilt: 0x312e81, shape: 'octa', attrName: '創世虹' };
    }

    const meta = WEAPON_GRADE_META_V8[grade] || WEAPON_GRADE_META_V8[0];
    return { wName, grade, plusLv, bladeType, style, meta };
  }

  function buildGradeSwordMeshV8(grade, style, bladeType = 'longsword') {
    const grp = new THREE.Group();
    const lenScale = (1.0 + grade * 0.14) * (bladeType === 'greatsword' ? 1.18 : (bladeType === 'katana' ? 1.12 : 1.0));
    const widthScale = (1.0 + grade * 0.10) * (bladeType === 'greatsword' ? 1.55 : (bladeType === 'rapier' ? 0.65 : (bladeType === 'katana' ? 0.78 : 1.0)));

    // 柄（グリップ）
    const grip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.065, 0.44, 10),
      new THREE.MeshBasicMaterial({ color: style.hilt })
    );
    grip.position.y = 0.18;
    grp.add(grip);

    // 柄頭（ポンメル）
    const pommel = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.09 + grade * 0.012, 0),
      new THREE.MeshBasicMaterial({ color: style.c2 })
    );
    pommel.position.y = -0.05;
    grp.add(pommel);

    // 鍔（クロスガード：日本刀は丸鍔、大剣・片手剣はクロスガード）
    if (bladeType === 'katana') {
      const tsuba = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18 + grade * 0.02, 0.18 + grade * 0.02, 0.04, 16),
        new THREE.MeshBasicMaterial({ color: grade >= 2 ? style.c2 : 0xfacc15 })
      );
      tsuba.position.y = 0.40;
      grp.add(tsuba);
    } else {
      const guardW = (0.44 + grade * 0.09) * Math.max(0.85, widthScale * 0.85);
      const guard = new THREE.Mesh(
        new THREE.BoxGeometry(guardW, 0.09 + grade * 0.015, 0.14),
        new THREE.MeshBasicMaterial({ color: grade >= 3 ? style.c2 : 0xcbd5e1 })
      );
      guard.position.y = 0.40;
      grp.add(guard);

      if (grade >= 2) {
        const gem = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.08 + grade * 0.015, 0),
          new THREE.MeshBasicMaterial({ color: style.c1 })
        );
        gem.position.set(0, 0.40, 0.08);
        grp.add(gem);
      }

      if (grade >= 4) {
        for (const side of [-1, 1]) {
          const wing = new THREE.Mesh(
            new THREE.BoxGeometry(0.28 * Math.max(0.9, widthScale * 0.8), 0.07, 0.05),
            new THREE.MeshBasicMaterial({ color: style.c3 })
          );
          wing.position.set(side * (guardW * 0.52), 0.48, 0);
          wing.rotation.z = side * 0.42;
          grp.add(wing);
        }
      }
    }

    // 刀身（メインブレード）
    const bladeLen = 1.26 * lenScale;
    const bladeW = 0.14 * widthScale;
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(bladeW, bladeLen, 0.045),
      new THREE.MeshBasicMaterial({ color: grade >= 1 ? style.c2 : 0xe2e8f0 })
    );
    blade.position.y = 0.42 + bladeLen * 0.5;
    grp.add(blade);

    // 刀身中央の血溝・ルーンライン（グレード2以上）
    if (grade >= 2) {
      const coreLine = new THREE.Mesh(
        new THREE.BoxGeometry(bladeW * 0.35, bladeLen * 0.86, 0.055),
        new THREE.MeshBasicMaterial({ color: style.c1 })
      );
      coreLine.position.y = 0.42 + bladeLen * 0.48;
      grp.add(coreLine);
    }

    // 切っ先（先端ピラミッド）
    const tipH = 0.24 * lenScale;
    const tip = new THREE.Mesh(
      new THREE.ConeGeometry(bladeW * 0.72, tipH, 4),
      new THREE.MeshBasicMaterial({ color: grade >= 1 ? style.c2 : 0xe2e8f0 })
    );
    tip.rotation.y = Math.PI * 0.25;
    tip.position.y = 0.42 + bladeLen + tipH * 0.5;
    grp.add(tip);

    // グレード1以上：刀身を包むエネルギーオーラ層
    if (grade >= 1) {
      const auraBlade = new THREE.Mesh(
        new THREE.BoxGeometry(bladeW * 1.52, bladeLen * 1.04, 0.078),
        new THREE.MeshBasicMaterial({ color: style.c1, transparent: true, opacity: 0.34 + grade * 0.07 })
      );
      auraBlade.position.y = 0.42 + bladeLen * 0.5;
      grp.add(auraBlade);
    }

    // グレード5（★6 神話級）：刀身背後に回転する神聖光輪＋浮遊ルーン結晶
    if (grade >= 5) {
      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(0.34, 0.036, 8, 24),
        new THREE.MeshBasicMaterial({ color: 0xfde047, transparent: true, opacity: 0.94 })
      );
      halo.position.set(0, 0.60, -0.06);
      grp.add(halo);
      grp.userData.halo = halo;
    }

    return grp;
  }

  // =========================================================
  // 4. 全顔文字の完全正面化＆リアルタイム表情アニメーション
  // =========================================================
  const KAOMOJI_EXPRESSIONS_V8 = {
    idle: ['(・ω・)', '(・∀・)', '(｀・ω・)'],
    move: ['(｀・ω・´)', 'ε=ε=(ﾉ・ω・)ﾉ', '(・ω・´)'],
    attack1: ['( ง •̀_•́)ง', '(｀・ω・´)ｼｬｷｰﾝ', '(ﾒ｀ﾛ´)/'],
    attack2: ['(ﾉ｀Д´)ﾉ彡', '(╬ﾟ◥益◤ﾟ)', '(｀･д･´)ﾉ'],
    attack3: ['ヽ(｀Д´#)ﾉ', 'Ψ(｀∀´#)ﾉ', '(*｀▽´)_／'],
    skill: ['(ﾉ*ФωФ)ﾉ', '✧( •̀ .̫ •́ )✧', '(☆▽☆)'],
    hurt: ['(＞＜)', '(；´Д｀)', '(×_×)'],
    victory: ['(*^▽^*)', '(ﾉ´ヮ´)ﾉ*:･ﾟ✧', '(๑•̀ㅂ•́)و✧']
  };

  function syncEntityKaomojiFrontAndFaceV8(game, entity, dt = 0.016) {
    if (!game?.useWebGL || !entity) return;
    const host = entity.mesh || entity.group || entity.container || entity.obj;
    if (!host) return;

    // 進行方向への身体回転を同期
    if (typeof entity.rotY === 'number' && Math.abs(host.rotation.y - entity.rotY) > 0.001) {
      host.rotation.y = entity.rotY;
    }

    // 顔文字テキスト・ビルボードがカメラに対して裏返り・横向きにならないよう正面化
    const cam = game.camera;
    host.traverse?.(child => {
      const nameHint = `${child.name || ''} ${child.userData?.type || ''}`;
      if (child.userData?.isKaomojiFace || /face|kaomoji|head|label|billboard/i.test(nameHint)) {
        if (child.isSprite) {
          child.center?.set?.(0.5, 0.5);
        } else if (cam) {
          // 親の回転を打ち消してカメラへ正面を向ける
          child.rotation.set(0, cam.rotation.y - host.rotation.y, 0);
        } else {
          child.rotation.y = 0;
        }
      }
    });

    // 状態に応じた動的表情更新（プレイヤー本人のカスタム顔文字はベースとして尊重）
    if (entity === game.player && game.saveData) {
      const baseFace = String(game.saveData.kaomoji || '(・ω・)');
      let state = 'idle';
      if (entity._v8HurtTimer > 0) {
        entity._v8HurtTimer = Math.max(0, entity._v8HurtTimer - dt);
        state = 'hurt';
      } else if (entity._v8SwingTimer > 0) {
        const cStep = entity._v8ComboStep || 1;
        state = cStep === 3 ? 'attack3' : (cStep === 2 ? 'attack2' : 'attack1');
      } else if (entity.attackIsSkill && entity.attackAnimTimer > 0) {
        state = 'skill';
      } else if (entity._v8VictoryTimer > 0) {
        entity._v8VictoryTimer = Math.max(0, entity._v8VictoryTimer - dt);
        state = 'victory';
      } else if (Math.hypot(Number(entity.vx || 0), Number(entity.vz || 0)) > 0.25) {
        state = 'move';
      }

      const nextFace = state === 'idle'
        ? baseFace
        : KAOMOJI_EXPRESSIONS_V8[state][0];

      if (entity._v8ActiveFace !== nextFace) {
        entity._v8ActiveFace = nextFace;
        if (typeof game.updatePlayerKaomojiTexture === 'function') {
          try { game.updatePlayerKaomojiTexture(nextFace); } catch (e) {}
        }
      }
    }
  }

  function ensureEntitySwordAndFrontFaceV8(game, entity) {
    if (!game?.useWebGL || !game?.scene || !entity || typeof THREE === 'undefined') return null;
    const host = entity.mesh || entity.group || entity.container || entity.obj;
    if (!host || !host.add) return null;

    syncEntityKaomojiFrontAndFaceV8(game, entity, 0.016);

    const { wName, grade, plusLv, bladeType, style } = getWeaponGradeInfoV8(game, entity);
    const sig = `${wName}|${grade}|${plusLv}|${bladeType}|${style.c1}`;

    if (!entity._v8SwordPivot) {
      const pivot = new THREE.Group();
      pivot.position.set(0.62, 0.88, 0.15);
      pivot.rotation.set(0.38, 0.0, -0.22);
      host.add(pivot);
      entity._v8SwordPivot = pivot;
    }

    if (entity._v8SwordSig !== sig) {
      entity._v8SwordSig = sig;
      while (entity._v8SwordPivot.children.length > 0) {
        const old = entity._v8SwordPivot.children[0];
        entity._v8SwordPivot.remove(old);
        old.traverse?.(o => {
          o.geometry?.dispose?.();
          o.material?.dispose?.();
        });
      }
      const swordMesh = buildGradeSwordMeshV8(grade, style, bladeType);
      entity._v8SwordPivot.add(swordMesh);
      entity._v8SwordMesh = swordMesh;
    }

    return entity._v8SwordPivot;
  }

  // =========================================================
  // 5. 3連コンボ水平横振りモーション＆グレード別3D斬撃エフェクト
  // =========================================================
  function updateEntitySwordSwingAnimV8(game, entity, dt) {
    if (!entity) return;
    syncEntityKaomojiFrontAndFaceV8(game, entity, dt);
    const pivot = ensureEntitySwordAndFrontFaceV8(game, entity);
    if (!pivot) return;

    if (entity._v8SwordMesh?.userData?.halo) {
      entity._v8SwordMesh.userData.halo.rotation.z += dt * 4.8;
    }

    if (entity._v8ComboResetTimer > 0) {
      entity._v8ComboResetTimer = Math.max(0, entity._v8ComboResetTimer - dt);
      if (entity._v8ComboResetTimer === 0) {
        entity._v8ComboStep = 0;
        updateComboHudV8(0);
      }
    }

    if (entity._v8SwingTimer && entity._v8SwingTimer > 0) {
      entity._v8SwingTimer = Math.max(0, entity._v8SwingTimer - dt);
      const dur = entity._v8SwingDur || 0.34;
      const p = 1 - (entity._v8SwingTimer / dur);
      const comboStep = entity._v8ComboStep || 1;

      if (comboStep === 2) {
        // 2段目：左後方から右前方への水平逆薙ぎ払い
        if (p < 0.2) {
          const t = p / 0.2;
          pivot.position.set(-0.45 - t * 0.25, 0.98, 0.12 - t * 0.22);
          pivot.rotation.set(1.42, 1.25 + t * 0.45, 0.95);
        } else if (p < 0.78) {
          const t = (p - 0.2) / 0.58;
          const ease = 1 - Math.pow(1 - t, 2.3);
          pivot.position.set(-0.70 + ease * 1.48, 0.98, -0.10 + Math.sin(ease * Math.PI) * 0.72);
          pivot.rotation.set(1.50, 1.70 - ease * 2.85, 0.95 - ease * 1.45);
        } else {
          const t = (p - 0.78) / 0.22;
          pivot.position.set(0.78 - t * 0.16, 0.98 - t * 0.10, -0.10 + t * 0.25);
          pivot.rotation.set(1.50 - t * 1.12, -1.15 + t * 1.15, -0.50 + t * 0.28);
        }
      } else if (comboStep === 3) {
        // 3段目：大車輪360度水平回転スラッシュ
        const spin = p * Math.PI * 2.15;
        pivot.position.set(Math.cos(spin) * 0.85, 1.02, Math.sin(spin) * 0.85);
        pivot.rotation.set(1.54, -spin, -0.95);
      } else {
        // 1段目：右後方から左前方への王道水平横振り
        if (p < 0.2) {
          const t = p / 0.2;
          pivot.position.set(0.62 + t * 0.24, 0.95, 0.15 - t * 0.25);
          pivot.rotation.set(0.38 + t * 0.68, -t * 1.18, -0.22 - t * 0.95);
        } else if (p < 0.78) {
          const t = (p - 0.2) / 0.58;
          const ease = 1 - Math.pow(1 - t, 2.4);
          pivot.position.set(0.86 - ease * 1.18, 0.95, -0.10 + Math.sin(ease * Math.PI) * 0.70);
          pivot.rotation.set(1.50, -1.18 + ease * 2.60, -1.17 + ease * 0.35);
        } else {
          const t = (p - 0.78) / 0.22;
          pivot.position.set(-0.32 + t * 0.94, 0.95 - t * 0.07, -0.10 + t * 0.25);
          pivot.rotation.set(1.50 - t * 1.12, 1.42 - t * 1.42, -0.82 + t * 0.60);
        }
      }
    } else {
      const t = performance.now() * 0.003;
      pivot.position.set(0.62, 0.88 + Math.sin(t) * 0.03, 0.15);
      pivot.rotation.set(0.38 + Math.sin(t) * 0.04, 0, -0.22);
    }
  }

  function updateComboHudV8(comboStep = 0, wName = '', stars = '') {
    let el = document.getElementById('kmj-v8-combo-badge');
    if (comboStep <= 0) {
      if (el) el.style.opacity = '0';
      return;
    }
    if (!el) {
      el = document.createElement('div');
      el.id = 'kmj-v8-combo-badge';
      el.className = 'kmj-v8-combo-badge';
      document.body?.appendChild(el);
    }
    const labels = ['', '1連撃：水平薙ぎ払い', '2連撃：逆水平返し斬り', '3連撃：大車輪極光斬！'];
    el.style.opacity = '1';
    el.style.transform = 'scale(1.06)';
    setTimeout(() => { if (el) el.style.transform = 'scale(1)'; }, 90);
    el.innerHTML = `
      <div style="font-size:12px;color:#fde047;">⚔️ ${labels[comboStep] || `${comboStep} HIT`}</div>
      <div style="font-size:9px;color:#7dd3fc;">${stars} ${wName}</div>
    `;
  }

  const activeSlashesV8 = [];

  function triggerSwordSwingAndSlashV8(game, entity) {
    const g = game || window.__kmjInstance || window.game;
    const ent = entity || g?.player;
    if (!g || !ent) return;

    const { wName, grade, style, meta } = getWeaponGradeInfoV8(g, ent);
    ensureEntitySwordAndFrontFaceV8(g, ent);

    // 3連コンボ進行管理
    const nextStep = ((ent._v8ComboStep || 0) % 3) + 1;
    ent._v8ComboStep = nextStep;
    ent._v8ComboResetTimer = 1.45;
    ent._v8SwingDur = (0.32 + grade * 0.022) * (nextStep === 3 ? 1.18 : 1.0);
    ent._v8SwingTimer = ent._v8SwingDur;
    ent.attackAnimTimer = ent._v8SwingDur;
    ent.attackIsSkill = false;

    if (ent === g.player) {
      playSwordAudioV8(grade, nextStep, false);
      updateComboHudV8(nextStep, wName, meta.stars);
    }

    if (!g.useWebGL || !g.scene || !ent.pos || typeof THREE === 'undefined') return;

    const { c1, c2, c3, shape } = style;
    const rotY = ent.rotY || 0;
    const comboScale = nextStep === 3 ? 1.28 : (nextStep === 2 ? 1.10 : 1.0);
    const sc = (1.0 + grade * 0.24) * comboScale;
    const slashLayers = 1 + grade + (nextStep === 3 ? 1 : 0);
    const rainbowCols = [0xf472b6, 0x38bdf8, 0xfde047, 0x34d399, 0xa855f7, 0xf97316];

    const root = new THREE.Group();
    root.position.set(ent.pos.x, 0, ent.pos.z);
    root.rotation.y = rotY;

    // 1. 水平横振り扇形斬撃アーク群（コンボ段数で角度・範囲が変化）
    const arcs = [];
    const baseSpan = nextStep === 3 ? Math.PI * 1.65 : Math.PI * (0.76 + Math.min(0.45, grade * 0.08));
    for (let i = 0; i < slashLayers; i++) {
      const col = grade >= 5 ? rainbowCols[i % rainbowCols.length] : (i % 3 === 0 ? c1 : (i % 3 === 1 ? c2 : c3));
      const rIn = (0.85 + i * 0.22) * sc;
      const rOut = (1.78 + i * 0.32) * sc;
      const mat = new THREE.MeshBasicMaterial({
        color: col,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.96
      });
      const mesh = new THREE.Mesh(
        new THREE.RingGeometry(rIn, rOut, 32, 1, -baseSpan * 0.5, baseSpan),
        mat
      );
      mesh.rotation.x = -Math.PI * 0.48 + (i % 2 === 0 ? 0.05 : -0.05);
      mesh.position.set(0, (1.02 + i * 0.08) * Math.min(1.38, sc), nextStep === 3 ? 0.12 : 0.38 * sc);
      root.add(mesh);
      arcs.push({ mesh, mat, idx: i, dir: nextStep === 2 ? -1 : 1 });
    }

    // 2. グレード2以上またはコンボ3段目：前方疾走三日月剣気ウェーブ
    const flyingWaves = [];
    if (grade >= 2 || nextStep === 3) {
      const waveCnt = grade >= 4 ? 2 : 1;
      for (let w = 0; w < waveCnt; w++) {
        const wMat = new THREE.MeshBasicMaterial({
          color: w === 0 ? c2 : c1,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.95
        });
        const wave = new THREE.Mesh(
          new THREE.RingGeometry((0.9 + w * 0.35) * sc, (1.68 + w * 0.45) * sc, 24, 1, -Math.PI * 0.38, Math.PI * 0.76),
          wMat
        );
        wave.rotation.x = -Math.PI * 0.46;
        wave.position.set(0, 1.1 + w * 0.18, (1.2 + w * 0.4) * sc);
        root.add(wave);
        flyingWaves.push({ mesh: wave, mat: wMat, baseZ: (1.2 + w * 0.4) * sc });
      }
    }

    // 3. グレード3以上：地面衝撃波リング
    let groundRing = null;
    if (grade >= 3 || nextStep === 3) {
      const gMat = new THREE.MeshBasicMaterial({
        color: c1,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.88
      });
      groundRing = new THREE.Mesh(new THREE.RingGeometry(0.65 * sc, 1.60 * sc, 32), gMat);
      groundRing.rotation.x = -Math.PI / 2;
      groundRing.position.set(0, 0.09, nextStep === 3 ? 0 : 0.9 * sc);
      root.add(groundRing);
    }

    // 4. グレード4以上：交差X字閃光
    const crossBlades = [];
    if (grade >= 4) {
      for (let c = 0; c < 2; c++) {
        const cMat = new THREE.MeshBasicMaterial({
          color: c === 0 ? c2 : c3,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.92
        });
        const cb = new THREE.Mesh(
          new THREE.RingGeometry(0.95 * sc, 1.88 * sc, 24, 1, -Math.PI * 0.35, Math.PI * 0.7),
          cMat
        );
        cb.rotation.x = -Math.PI * 0.32;
        cb.rotation.y = (c === 0 ? 0.35 : -0.35);
        cb.position.set(0, 1.25, 1.15 * sc);
        root.add(cb);
        crossBlades.push({ mesh: cb, mat: cMat });
      }
    }

    // 5. グレード5（★6 神話級）：追従射出される光剣ビット
    const spiritSwords = [];
    if (grade >= 5) {
      for (let s = 0; s < 4; s++) {
        const side = s % 2 === 0 ? 1 : -1;
        const lane = Math.floor(s / 2) + 1;
        const sMat = new THREE.MeshBasicMaterial({
          color: rainbowCols[s % rainbowCols.length],
          transparent: true,
          opacity: 0.96
        });
        const bit = new THREE.Mesh(new THREE.BoxGeometry(0.14 * sc, 0.08 * sc, 1.85 * sc), sMat);
        bit.position.set(side * (1.2 + lane * 0.7) * sc, 1.15 + lane * 0.2, 0.6);
        root.add(bit);
        spiritSwords.push({ mesh: bit, mat: sMat });
      }
    }

    // 6. 属性パーティクル飛散
    const particles = [];
    const pCnt = grade === 0 ? 5 : (8 + grade * 5 + (nextStep === 3 ? 6 : 0));
    for (let i = 0; i < pCnt; i++) {
      const ang = -Math.PI * 0.5 + (Math.PI * 1.0 * i) / Math.max(1, pCnt - 1);
      const col = grade >= 5 ? rainbowCols[i % rainbowCols.length] : (i % 2 === 0 ? c1 : c2);
      const geo = shape === 'tetra'
        ? new THREE.TetrahedronGeometry(0.14 + grade * 0.025, 0)
        : (shape === 'dodeca' ? new THREE.DodecahedronGeometry(0.13 + grade * 0.025, 0) : new THREE.OctahedronGeometry(0.14 + grade * 0.025, 0));
      const pMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.95 });
      const pt = new THREE.Mesh(geo, pMat);
      pt.position.set(Math.sin(ang) * 1.1 * sc, 1.05, Math.cos(ang) * 1.1 * sc);
      root.add(pt);
      particles.push({
        mesh: pt,
        mat: pMat,
        vx: Math.sin(ang) * (2.8 + (i % 3) * 0.9) * sc,
        vy: 1.2 + (i % 3) * 0.7,
        vz: Math.cos(ang) * (3.2 + (i % 3) * 1.0) * sc,
        sx: Math.sin(ang) * 1.1 * sc,
        sz: Math.cos(ang) * 1.1 * sc
      });
    }

    g.scene.add(root);
    activeSlashesV8.push({
      scene: g.scene,
      entity: ent,
      root,
      grade,
      sc,
      arcs,
      flyingWaves,
      groundRing,
      crossBlades,
      spiritSwords,
      particles,
      elapsed: 0,
      duration: 0.34 + grade * 0.035
    });

    if ((grade >= 3 || nextStep === 3) && ent === g.player && typeof g.shakeTimer === 'number') {
      g.shakeTimer = Math.max(g.shakeTimer, 0.08 + Math.max(0, grade - 2) * 0.04);
    }
  }

  function stepSlashEffectsV8(dt) {
    for (let i = activeSlashesV8.length - 1; i >= 0; i--) {
      const fx = activeSlashesV8[i];
      fx.elapsed += dt;
      const p = Math.min(1, fx.elapsed / fx.duration);

      if (fx.entity?.pos) {
        fx.root.position.set(fx.entity.pos.x, 0, fx.entity.pos.z);
      }

      const sweepZ = -1.1 + Math.sin(Math.min(1, p * 1.35) * Math.PI * 0.5) * 2.2;
      fx.arcs.forEach(a => {
        a.mesh.rotation.z = (sweepZ - a.idx * 0.14) * a.dir;
        a.mesh.scale.setScalar(1 + p * (0.28 + fx.grade * 0.05));
        a.mat.opacity = Math.max(0, (1 - p) * 0.96);
      });

      fx.flyingWaves.forEach(fw => {
        fw.mesh.position.z = fw.baseZ + p * (4.8 + fx.grade * 0.85) * fx.sc;
        fw.mesh.scale.setScalar(1 + p * 0.35);
        fw.mat.opacity = Math.max(0, (1 - p) * 0.95);
      });

      if (fx.groundRing) {
        fx.groundRing.scale.setScalar(1 + p * (1.85 + fx.grade * 0.35));
        fx.groundRing.material.opacity = Math.max(0, (1 - p) * 0.88);
      }

      fx.crossBlades.forEach(cb => {
        cb.mesh.scale.setScalar(1 + p * 0.45);
        cb.mat.opacity = Math.max(0, (1 - p) * 0.92);
      });

      fx.spiritSwords.forEach(ss => {
        ss.mesh.position.z = 0.6 + p * 7.0 * fx.sc;
        ss.mat.opacity = Math.max(0, (1 - p) * 0.96);
      });

      fx.particles.forEach(pt => {
        pt.mesh.position.x = pt.sx + pt.vx * p;
        pt.mesh.position.z = pt.sz + pt.vz * p;
        pt.mesh.position.y = Math.max(0.1, 1.05 + pt.vy * p - 2.6 * p * p);
        pt.mesh.rotation.set(fx.elapsed * 9, fx.elapsed * 7, 0);
        pt.mat.opacity = Math.max(0, (1 - p) * 0.95);
      });

      if (p >= 1) {
        try {
          fx.scene.remove(fx.root);
          fx.root.traverse?.(o => {
            o.geometry?.dispose?.();
            o.material?.dispose?.();
          });
        } catch (e) {}
        activeSlashesV8.splice(i, 1);
      }
    }
  }

  window.triggerSwordSwingAndSlashV8 = triggerSwordSwingAndSlashV8;

  // =========================================================
  // 6. 脅威度（1〜999）コントロールバー＆報酬・敵強さスケーリング
  // =========================================================
  function ensureThreatRankBarV8(game) {
    const g = game || window.__kmjInstance || window.game;
    if (!g || !g.saveData) return;

    let bar = document.getElementById('kmj-v8-threat-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'kmj-v8-threat-bar';
      bar.className = 'kmj-v8-threat-bar';
      bar.innerHTML = `
        <span>🔥脅威</span>
        <button type="button" class="kmj-v8-threat-btn" data-delta="-10">-10</button>
        <button type="button" class="kmj-v8-threat-btn" data-delta="-1">-1</button>
        <span id="kmj-v8-threat-val" style="min-width:36px;text-align:center;color:#fff;cursor:pointer;" title="タップで直接入力">+1</span>
        <button type="button" class="kmj-v8-threat-btn" data-delta="1">+1</button>
        <button type="button" class="kmj-v8-threat-btn" data-delta="10">+10</button>
      `;
      document.body?.appendChild(bar);

      const applyThreat = (nextVal) => {
        const inst = window.__kmjInstance || window.game;
        if (!inst?.saveData) return;
        const clamped = Math.max(1, Math.min(999, Math.floor(Number(nextVal) || 1)));
        ['threatRank', 'threat', 'threatLevel', 'threatLv'].forEach(k => {
          inst.saveData[k] = clamped;
          if (k in inst) inst[k] = clamped;
        });
        inst.saveGame?.(false);
        inst.refreshAllHUD?.();
        inst.showAlertBanner?.(`🔥 脅威ランクを +${clamped} に変更しました（報酬倍率 x${(1 + (clamped - 1) * 0.08).toFixed(2)}）`, 1500);
      };

      bar.querySelectorAll('.kmj-v8-threat-btn').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const inst = window.__kmjInstance || window.game;
          const cur = Number(inst?.saveData?.threatRank ?? inst?.saveData?.threat ?? 1);
          applyThreat(cur + Number(btn.dataset.delta || 0));
        };
      });

      bar.querySelector('#kmj-v8-threat-val').onclick = (e) => {
        e.stopPropagation();
        const inst = window.__kmjInstance || window.game;
        const cur = Number(inst?.saveData?.threatRank ?? inst?.saveData?.threat ?? 1);
        const inp = prompt('脅威ランクを入力してください（1〜999）：', String(cur));
        if (inp !== null && inp.trim() !== '') {
          applyThreat(Number(inp));
        }
      };
    }

    const valEl = document.getElementById('kmj-v8-threat-val');
    if (valEl) {
      const cur = Math.max(1, Math.min(999, Number(g.saveData.threatRank ?? g.saveData.threat ?? 1)));
      const label = `+${cur}`;
      if (valEl.textContent !== label) valEl.textContent = label;
    }
  }

  // =========================================================
  // 7. 高機能チャットウィンドウ（ドラッグ移動・リサイズ・最小化・顔文字スタンプ）
  // =========================================================
  function enhanceChatWindowV8() {
    let chatBox = document.getElementById('chat-box') || document.getElementById('chat-container') || document.querySelector('.chat-box, .chat-container, #chatPanel');
    if (!chatBox) {
      const inp = document.querySelector('input[placeholder*="チャット"], input[placeholder*="発言"], input[placeholder*="メッセージ"]');
      if (inp) chatBox = inp.closest('div[style*="position"], section, aside') || inp.parentElement?.parentElement;
    }
    if (!chatBox || chatBox.dataset.v8ChatReady === '1') return;
    chatBox.dataset.v8ChatReady = '1';

    let savedRect = null;
    try {
      savedRect = JSON.parse(localStorage.getItem('kmj_v8_chat_rect') || 'null');
      if (savedRect && typeof savedRect === 'object') {
        chatBox.style.position = 'fixed';
        if (typeof savedRect.left === 'number') { chatBox.style.left = `${savedRect.left}px`; chatBox.style.right = 'auto'; }
        if (typeof savedRect.top === 'number') { chatBox.style.top = `${savedRect.top}px`; chatBox.style.bottom = 'auto'; }
        if (typeof savedRect.width === 'number') chatBox.style.width = `${savedRect.width}px`;
        if (typeof savedRect.height === 'number') chatBox.style.height = `${savedRect.height}px`;
      }
    } catch (e) {}

    const dragBar = document.createElement('div');
    dragBar.className = 'kmj-v8-chat-drag';
    dragBar.innerHTML = `
      <span>💬 チャット (ドラッグ移動)</span>
      <div style="display:flex;align-items:center;gap:4px;">
        <button type="button" id="kmj-v8-chat-min-btn" style="background:#334155;border:1px solid #64748b;color:#fde047;border-radius:4px;padding:0 5px;font-size:9px;font-weight:900;cursor:pointer;">＿最小化</button>
      </div>
    `;
    chatBox.insertBefore(dragBar, chatBox.firstChild);

    // ワンタップ顔文字スタンプバー
    const stampBar = document.createElement('div');
    stampBar.className = 'kmj-v8-chat-stamps';
    const stamps = [
      { label: '(・ω・)ﾉ よろ', text: 'よろしく！(・ω・)ﾉ' },
      { label: '(*^▽^*) ﾅｲｽ', text: 'ナイス！(*^▽^*)' },
      { label: '(＞＜) 助けて', text: '助けて！(＞＜)' },
      { label: '(｀・ω・´) いくぞ', text: 'いくぞ！(｀・ω・´)' },
      { label: '(人´∀`*) 感謝', text: 'ありがとう！(人´∀`*)' }
    ];
    stampBar.innerHTML = stamps.map((s, idx) => `<button type="button" class="kmj-v8-stamp-btn" data-idx="${idx}">${s.label}</button>`).join('');
    chatBox.insertBefore(stampBar, dragBar.nextSibling);

    stampBar.querySelectorAll('.kmj-v8-stamp-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const st = stamps[Number(btn.dataset.idx)];
        if (!st) return;
        const inp = chatBox.querySelector('input[type="text"], input:not([type])');
        const sendBtn = chatBox.querySelector('button[type="submit"], button:not(.kmj-v8-stamp-btn):not(#kmj-v8-chat-min-btn)');
        if (inp) {
          inp.value = st.text;
          inp.dispatchEvent(new Event('input', { bubbles: true }));
          if (sendBtn) {
            sendBtn.click();
          } else {
            inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true }));
          }
        }
      };
    });

    const resizeGrip = document.createElement('div');
    resizeGrip.className = 'kmj-v8-chat-resize';
    chatBox.appendChild(resizeGrip);

    let isMinimized = Boolean(savedRect?.minimized);
    let expandedHeight = savedRect?.height || chatBox.offsetHeight || 150;
    const minBtn = dragBar.querySelector('#kmj-v8-chat-min-btn');

    const saveRect = () => {
      try {
        const r = chatBox.getBoundingClientRect();
        localStorage.setItem('kmj_v8_chat_rect', JSON.stringify({
          left: Math.round(r.left),
          top: Math.round(r.top),
          width: Math.round(r.width),
          height: isMinimized ? expandedHeight : Math.round(r.height),
          minimized: isMinimized
        }));
      } catch (e) {}
    };

    const applyMinimizeState = () => {
      Array.from(chatBox.children).forEach(ch => {
        if (ch === dragBar) return;
        ch.style.display = isMinimized ? 'none' : '';
      });
      if (isMinimized) {
        chatBox.style.height = '24px';
        chatBox.style.minHeight = '24px';
        minBtn.textContent = '▢展開';
      } else {
        chatBox.style.height = `${expandedHeight}px`;
        chatBox.style.minHeight = '';
        minBtn.textContent = '＿最小化';
      }
    };

    if (isMinimized) applyMinimizeState();

    minBtn.onclick = (e) => {
      e.stopPropagation();
      if (!isMinimized) expandedHeight = chatBox.offsetHeight || 150;
      isMinimized = !isMinimized;
      applyMinimizeState();
      saveRect();
    };

    let mode = null;
    let startX = 0, startY = 0, startL = 0, startT = 0, startW = 0, startH = 0;

    const onStart = (ev, nextMode) => {
      if (ev.target?.closest?.('button')) return;
      const pt = ev.touches ? ev.touches[0] : ev;
      if (!pt) return;
      ev.stopPropagation();
      mode = nextMode;
      const r = chatBox.getBoundingClientRect();
      chatBox.style.position = 'fixed';
      chatBox.style.left = `${r.left}px`;
      chatBox.style.top = `${r.top}px`;
      chatBox.style.right = 'auto';
      chatBox.style.bottom = 'auto';
      startX = pt.clientX;
      startY = pt.clientY;
      startL = r.left;
      startT = r.top;
      startW = r.width;
      startH = r.height;
    };

    const onMove = (ev) => {
      if (!mode) return;
      const pt = ev.touches ? ev.touches[0] : ev;
      if (!pt) return;
      const dx = pt.clientX - startX;
      const dy = pt.clientY - startY;
      if (mode === 'drag') {
        const maxL = Math.max(0, window.innerWidth - chatBox.offsetWidth);
        const maxT = Math.max(0, window.innerHeight - chatBox.offsetHeight);
        chatBox.style.left = `${Math.max(0, Math.min(maxL, startL + dx))}px`;
        chatBox.style.top = `${Math.max(0, Math.min(maxT, startT + dy))}px`;
      } else if (mode === 'resize' && !isMinimized) {
        const nextW = Math.max(190, Math.min(window.innerWidth - 16, startW + dx));
        const nextH = Math.max(105, Math.min(window.innerHeight - 40, startH + dy));
        chatBox.style.width = `${nextW}px`;
        chatBox.style.height = `${nextH}px`;
        expandedHeight = nextH;
      }
    };

    const onEnd = () => {
      if (!mode) return;
      mode = null;
      saveRect();
    };

    dragBar.addEventListener('mousedown', (e) => onStart(e, 'drag'));
    dragBar.addEventListener('touchstart', (e) => onStart(e, 'drag'), { passive: true });
    resizeGrip.addEventListener('mousedown', (e) => onStart(e, 'resize'));
    resizeGrip.addEventListener('touchstart', (e) => onStart(e, 'resize'), { passive: true });
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchend', onEnd);
  }

  // =========================================================
  // 8. 全実績・称号パッシブ集計＆実績タブ拡張UI
  // =========================================================
  function renderAchievementPassiveCardV8(game) {
    const achContainer = document.querySelector('#tab-achievements, #tab-ach, #panel-achievements, #ach-panel, [data-tab-panel="achievements"], [data-tab-panel="ach"]');
    if (!achContainer || !game) return;

    const sum = game.syncAchievementPassiveBuffsV40();
    const wInfo = getWeaponGradeInfoV8(game, game.player);
    let card = document.getElementById('kmj-v8-ach-summary');
    if (!card) {
      card = document.createElement('div');
      card.id = 'kmj-v8-ach-summary';
      card.className = 'kmj-v8-ach-summary';
      achContainer.insertBefore(card, achContainer.firstChild);
    }

    const sig = `${sum.unlockedCount}|${wInfo.wName}|${wInfo.grade}|${wInfo.plusLv}`;
    if (card.dataset.sig !== sig) {
      card.dataset.sig = sig;
      card.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;">
          <b style="font-size:12px;color:#fde047;">🏆 実績パッシブ＆剣士マスタリー合計効果</b>
          <span style="font-size:10.5px;font-weight:900;color:#34d399;">解除数: ${sum.unlockedCount}個</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;font-size:10px;background:rgba(2,6,23,0.75);padding:6px;border-radius:7px;border:1px solid rgba(250,204,21,0.35);">
          <div>⚔️ 攻撃力: <b style="color:#f87171;">+${Math.round(sum.atkPct * 100)}%</b></div>
          <div>✨ 魔力: <b style="color:#c084fc;">+${Math.round(sum.matkPct * 100)}%</b></div>
          <div>🛡️ 防御力: <b style="color:#38bdf8;">+${Math.round(sum.defPct * 100)}%</b></div>
          <div>❤️ 最大HP: <b style="color:#4ade80;">+${Math.round(sum.hpPct * 100)}%</b></div>
          <div>💧 最大MP: <b style="color:#60a5fa;">+${Math.round(sum.mpPct * 100)}%</b></div>
          <div>💰 報酬倍率: <b style="color:#fde047;">+${Math.round(sum.rewardBonusPct * 100)}%</b></div>
        </div>
        <div style="margin-top:6px;font-size:10px;color:#cbd5e1;display:flex;justify-content:space-between;align-items:center;">
          <span>現在装備剣: <b style="color:${wInfo.meta.colorHex};">${wInfo.meta.stars} ${wInfo.wName}</b>（${wInfo.style.attrName}属性）</span>
          <span style="color:#7dd3fc;font-weight:900;">武器補正 x${wInfo.meta.mult.toFixed(2)}</span>
        </div>
      `;
    }
  }

  // =========================================================
  // 9. MP成長＆自動回復・ステータス・戦闘フック統合
  // =========================================================
  function installV8Core() {
    if (typeof KaomojiMMORPG === 'undefined') {
      setTimeout(installV8Core, 100);
      return;
    }

    const proto = KaomojiMMORPG.prototype;
    if (proto._v8Installed) return;
    proto._v8Installed = true;

    Object.assign(proto, {
      syncAchievementPassiveBuffsV40() {
        const d = this.saveData;
        if (!d) return { unlockedCount: 0, atkPct: 0, matkPct: 0, defPct: 0, hpPct: 0, mpPct: 0, rewardBonusPct: 0 };
        const achObj = (d.achievements && typeof d.achievements === 'object') ? d.achievements : {};
        let unlockedCount = 0;
        Object.values(achObj).forEach(v => { if (v === true) unlockedCount++; });

        const summary = {
          unlockedCount,
          atkPct: Math.min(3.5, unlockedCount * 0.03),
          matkPct: Math.min(3.5, unlockedCount * 0.03),
          defPct: Math.min(3.0, unlockedCount * 0.025),
          hpPct: Math.min(3.5, unlockedCount * 0.03),
          mpPct: Math.min(3.5, unlockedCount * 0.03),
          rewardBonusPct: Math.min(2.5, unlockedCount * 0.025)
        };
        this._achPassiveSummaryV8 = summary;
        return summary;
      },

      updateMpGrowthAndRegenV8(dt = 0.016) {
        const d = this.saveData;
        if (!d) return;

        const lv = Math.max(1, Number(d.lv ?? d.level ?? this.player?.lv ?? 1));
        const ach = this._achPassiveSummaryV8 || this.syncAchievementPassiveBuffsV40();
        const baseMaxMp = 100 + (lv - 1) * 18;
        const scaledMaxMp = Math.max(100, Math.floor(baseMaxMp * (1 + (ach.mpPct || 0))));

        const prevMaxMp = Math.max(100, Number(d.maxMp ?? this.player?.maxMp ?? scaledMaxMp));
        if (scaledMaxMp > prevMaxMp) {
          const diff = scaledMaxMp - prevMaxMp;
          d.maxMp = scaledMaxMp;
          d.mp = Math.min(scaledMaxMp, (Number(d.mp) || 0) + diff);
        } else {
          d.maxMp = Math.max(prevMaxMp, scaledMaxMp);
        }

        const isDebugOn = Boolean(window.KMJ_DEBUG?.isActive?.(this));
        let curMp = Number(d.mp ?? this.player?.mp ?? d.maxMp);

        if (isDebugOn) {
          curMp = d.maxMp;
        } else {
          const sanctMult = (this.player?.sanctuaryBuffTimer > 0) ? 2.5 : 1.0;
          const regenPerSec = (4 + d.maxMp * 0.04) * sanctMult;
          curMp = Math.min(d.maxMp, curMp + regenPerSec * Math.max(0.001, dt));
        }

        d.mp = curMp;
        if (this.player) {
          this.player.maxMp = d.maxMp;
          this.player.mp = curMp;
        }
      },

      detectMonsterStatus(m) {
        if (!m) return null;
        if (m._visualStatus?.timer > 0) return m._visualStatus.type;
        if (Number(m.burnTimer) > 0) return 'burn';
        if (Number(m.freezeTimer) > 0) return 'freeze';
        if (Number(m.poisonTimer) > 0) return 'poison';
        if (Number(m.stunTimer) > 0) return 'shock';
        return null;
      },

      calcMagicAttackPowerV40() {
        const st = typeof this.getPlayerStats === 'function' ? (this.getPlayerStats() || {}) : {};
        const d = this.saveData || {};
        return Math.max(12, Number(st.matk ?? st.mAtk ?? d.matk ?? st.atk ?? d.atk ?? 15));
      },

      applyMagicProjectileHitDamageV40(m, dmg) {
        if (!m || m.dead) return;
        const val = Math.max(1, Math.floor(Number(dmg) || 1));
        m.hp = Math.max(0, (Number(m.hp) || 0) - val);
        this.spawnFloatingText?.(m.pos, `-${val}`, '#38bdf8');
        if (m.hp <= 0 && !m.dead) {
          if (typeof this.killMonster === 'function') this.killMonster(m);
          else if (typeof this.onMonsterKilled === 'function') this.onMonsterKilled(m);
          else m.dead = true;
        }
      },

      syncMageWeaponNamesV22() {
        window.KMJ_SKILL_FX_V9?.syncAllSkills?.(this);
      },

      enforceStrictWeaponVisualV27(entity) {
        ensureEntitySwordAndFrontFaceV8(this, entity || this.player);
      },

      triggerSwordSwingAndSlashV8(entity) {
        triggerSwordSwingAndSlashV8(this, entity || this.player);
      }
    });

    // ステータス計算に実績パッシブ＆武器グレード倍率を統合
    if (typeof proto.getPlayerStats === 'function' && !proto._v8StatsWrapped) {
      const origStats = proto.getPlayerStats;
      proto.getPlayerStats = function (...args) {
        const st = origStats.apply(this, args) || {};
        const ach = this._achPassiveSummaryV8 || this.syncAchievementPassiveBuffsV40();
        const wInfo = getWeaponGradeInfoV8(this, this.player);
        const wMult = wInfo.meta.mult || 1.0;

        if (typeof st.atk === 'number') {
          st.atk = Math.floor(st.atk * wMult * (1 + (ach?.atkPct || 0)));
        }
        if (typeof st.matk === 'number') {
          st.matk = Math.floor(st.matk * (1 + (ach?.matkPct || 0)));
        }
        if (typeof st.mAtk === 'number') {
          st.mAtk = Math.floor(st.mAtk * (1 + (ach?.matkPct || 0)));
        }
        if (ach && ach.unlockedCount > 0) {
          if (typeof st.def === 'number') st.def = Math.floor(st.def * (1 + ach.defPct));
          if (typeof st.maxHp === 'number') st.maxHp = Math.floor(st.maxHp * (1 + ach.hpPct));
        }
        if (this.saveData?.maxMp) {
          st.maxMp = Math.max(Number(st.maxMp || 0), Number(this.saveData.maxMp));
        }
        return st;
      };
      proto._v8StatsWrapped = true;
    }

    // 通常攻撃ビジュアルを武器グレード別水平横振りに一本化（重複フックなし）
    if (typeof proto.triggerAttackVisual === 'function' && !proto._v8AtkVisWrapped) {
      const origVis = proto.triggerAttackVisual;
      proto.triggerAttackVisual = function (entity, isSkill = false, skillInfo = null) {
        if (!isSkill && entity) {
          triggerSwordSwingAndSlashV8(this, entity);
          return;
        }
        return origVis.apply(this, [entity, isSkill, skillInfo]);
      };
      proto._v8AtkVisWrapped = true;
    }

    // モンスター撃破時の脅威度ボーナス＆勝利表情トリガー
    ['killMonster', 'onMonsterKilled'].forEach(fn => {
      if (typeof proto[fn] === 'function' && !proto[`_v8ThreatReward_${fn}`]) {
        const origKill = proto[fn];
        proto[fn] = function (m, ...rest) {
          const res = origKill.apply(this, [m, ...rest]);
          if (this.player) this.player._v8VictoryTimer = 0.85;
          const d = this.saveData;
          const threat = Math.max(1, Number(d?.threatRank ?? d?.threat ?? 1));
          if (d && threat > 1) {
            const mult = (threat - 1) * 0.08;
            d.exp = (Number(d.exp) || 0) + Math.floor((Number(m?.exp || 12)) * mult);
            d.gold = (Number(d.gold) || 0) + Math.floor((Number(m?.gold || 10)) * mult);
          }
          return res;
        };
        proto[`_v8ThreatReward_${fn}`] = true;
      }
    });

    // フレーム更新ループ（MP成長回復・3D剣スイング＆斬撃更新・全顔文字正面化・極光の聖域ティック）
    if (typeof proto.update === 'function' && !proto._v8UpdateWrapped) {
      const origUpdate = proto.update;
      proto.update = function (dt = 0.016, ...rest) {
        const safeDt = Math.min(0.1, Math.max(0.001, Number(dt) || 0.016));
        this.updateMpGrowthAndRegenV8(safeDt);

        if (this.player?.sanctuaryBuffTimer > 0) {
          this.player.sanctuaryBuffTimer = Math.max(0, this.player.sanctuaryBuffTimer - safeDt);
        }

        const res = origUpdate.apply(this, [dt, ...rest]);

        updateEntitySwordSwingAnimV8(this, this.player, safeDt);
        if (this.remotePlayers && typeof this.remotePlayers.forEach === 'function') {
          this.remotePlayers.forEach(rp => updateEntitySwordSwingAnimV8(this, rp, safeDt));
        }
        if (this.pet) {
          syncEntityKaomojiFrontAndFaceV8(this, this.pet, safeDt);
        }

        stepSlashEffectsV8(safeDt);
        window.KMJ_SKILL_FX_V9?.updateSanctuaryFields?.(this, safeDt);

        return res;
      };
      proto._v8UpdateWrapped = true;
    }

    // HUD更新（脅威度バー・チャット移動リサイズ・実績パッシブカード・全14種スキルMP同期）
    if (typeof proto.refreshAllHUD === 'function' && !proto._v8HudWrapped) {
      const origHud = proto.refreshAllHUD;
      proto.refreshAllHUD = function (...args) {
        this.syncAchievementPassiveBuffsV40();
        const res = origHud.apply(this, args);
        ensureThreatRankBarV8(this);
        enhanceChatWindowV8();
        renderAchievementPassiveCardV8(this);
        window.KMJ_SKILL_FX_V9?.syncAllSkills?.(this);
        return res;
      };
      proto._v8HudWrapped = true;
    }
  }

  installV8Core();
  window.updateMpGrowthAndRegenV8 = function (dt = 0.016) {
    const inst = window.__kmjInstance || window.game;
    inst?.updateMpGrowthAndRegenV8?.(dt);
  };

  setTimeout(() => {
    const inst = window.__kmjInstance || window.game;
    if (inst) {
      inst.syncAchievementPassiveBuffsV40?.();
      inst.updateMpGrowthAndRegenV8?.(0.016);
      ensureThreatRankBarV8(inst);
      enhanceChatWindowV8();
      renderAchievementPassiveCardV8(inst);
      ensureEntitySwordAndFrontFaceV8(inst, inst.player);
    }
  }, 350);
})();
// ▲▲▲ ここまで game8.js ▲▲▲
