// ▼▼▼ ここから game8.js（完全版：剣クラス3連水平横振り＆三日月斬撃波・MP成長＆自然回復・近接ヒット火花） ▼▼▼
(() => {
  'use strict';

  function reportErrV8(source, err) {
    if (typeof window.reportKmjRuntimeError === 'function') {
      window.reportKmjRuntimeError(source, err);
    } else {
      console.error(`[KMJ-V8:${source}]`, err);
    }
  }

  // =========================================================
  // 1. 剣クラス別 3連水平斬撃ビジュアル定義
  // =========================================================
  const SWORD_STYLE_V8 = {
    novice_slash: {
      core: 0xffffff,
      blade: 0x38bdf8,
      aura: 0x0284c7,
      spark: 0x7dd3fc,
      scale: 1.0,
      multiRing: false
    },
    warrior_crimson: {
      core: 0xfef08a,
      blade: 0xef4444,
      aura: 0xf97316,
      spark: 0xfb923c,
      scale: 1.22,
      multiRing: true
    },
    paladin_holy: {
      core: 0xffffff,
      blade: 0xfde047,
      aura: 0xf59e0b,
      spark: 0xfef9c3,
      scale: 1.28,
      multiRing: true
    },
    ninja_gale: {
      core: 0xecfdf5,
      blade: 0x10b981,
      aura: 0x34d399,
      spark: 0x6ee7b7,
      scale: 1.18,
      multiRing: true
    },
    blademaster_thunder: {
      core: 0xffffff,
      blade: 0x60a5fa,
      aura: 0xfacc15,
      spark: 0xfef08a,
      scale: 1.36,
      multiRing: true
    },
    dragoon_flame: {
      core: 0xfef08a,
      blade: 0xdc2626,
      aura: 0xf59e0b,
      spark: 0xf87171,
      scale: 1.44,
      multiRing: true
    },
    emperor_gold: {
      core: 0xffffff,
      blade: 0xfacc15,
      aura: 0xd97706,
      spark: 0xfde047,
      scale: 1.55,
      multiRing: true
    },
    mythic_genesis: {
      core: 0xffffff,
      blade: 0xf472b6,
      aura: 0x38bdf8,
      spark: 0xfde047,
      scale: 1.72,
      multiRing: true,
      rainbow: true
    }
  };

  function resolveSwordStyleV8(game, entity) {
    const isLocal = (entity === game?.player);
    let fxStyle = 'novice_slash';
    if (typeof game?.getCurrentClassDefV45 === 'function') {
      const cls = game.getCurrentClassDefV45(isLocal ? null : (entity?.evolutionId || null));
      if (cls?.fxStyle && SWORD_STYLE_V8[cls.fxStyle]) {
        fxStyle = cls.fxStyle;
      }
    }
    return SWORD_STYLE_V8[fxStyle] || SWORD_STYLE_V8.novice_slash;
  }

  // =========================================================
  // 2. 剣の風切り＆斬撃SE（3連コンボ段数ごとに音程・迫力変化）
  // =========================================================
  function playSwordSlashAudioV8(comboStep = 1) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!window._kmjV8AudioCtx) window._kmjV8AudioCtx = new AudioCtx();
      const ctx = window._kmjV8AudioCtx;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const dur = comboStep === 3 ? 0.22 : 0.14;

      // ホワイトノイズによる風切り音
      const bufSize = Math.floor(ctx.sampleRate * dur);
      const buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 1.6);
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      const baseFreq = comboStep === 1 ? 950 : (comboStep === 2 ? 1220 : 1550);
      filter.frequency.setValueAtTime(baseFreq, now);
      filter.frequency.exponentialRampToValueAtTime(280, now + dur);
      filter.Q.value = 1.8;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(comboStep === 3 ? 0.14 : 0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + dur);

      // 3段目は重厚な衝撃サブトーンを追加
      if (comboStep === 3) {
        const osc = ctx.createOscillator();
        const oGain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(65, now + 0.2);
        oGain.gain.setValueAtTime(0.08, now);
        oGain.gain.exponentialRampToValueAtTime(0.001, now + 0.21);
        osc.connect(oGain);
        oGain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
      }
    } catch (e) {}
  }

  // =========================================================
  // 3. エンティティの剣オブジェクト探索＆水平スイング姿勢制御
  // =========================================================
  function findWeaponPivotV8(entity) {
    if (!entity) return null;
    if (entity._cachedWeaponPivotV8 && entity._cachedWeaponPivotV8.parent) {
      return entity._cachedWeaponPivotV8;
    }

    const directCandidates = [
      entity.weaponPivot,
      entity.weaponGroup,
      entity.swordGroup,
      entity.weaponMesh,
      entity.swordMesh,
      entity.rightHand,
      entity.handR
    ];
    for (const c of directCandidates) {
      if (c && c.rotation) {
        entity._cachedWeaponPivotV8 = c;
        return c;
      }
    }

    const root = entity.mesh || entity.group || entity.root;
    if (root && typeof root.traverse === 'function') {
      let found = null;
      root.traverse((child) => {
        if (found || child === root) return;
        const n = String(child.name || '').toLowerCase();
        if (/weapon|sword|blade|staff|wand|hand_r|righthand|equip/.test(n)) {
          found = child;
        }
      });
      if (!found && Array.isArray(root.children)) {
        // 顔文字本体(Sphere/Box)以外の右脇配置グループを推定
        for (const ch of root.children) {
          if (ch.position && ch.position.x > 0.25 && (ch.isGroup || ch.children?.length > 0)) {
            found = ch;
            break;
          }
        }
      }
      if (found) {
        entity._cachedWeaponPivotV8 = found;
        return found;
      }
    }
    return null;
  }

  // =========================================================
  // 4. 三日月型・水平斬撃波3Dメッシュ生成
  // =========================================================
  function createCrescentGeometryV8(innerR, outerR, arcAngle, segments = 28) {
    const geo = new THREE.BufferGeometry();
    const positions = [];
    const indices = [];

    for (let i = 0; i <= segments; i++) {
      const t = i / segments; // 0 .. 1
      const theta = -arcAngle * 0.5 + arcAngle * t;
      // 両端(t=0, t=1)で幅0に収束し、中央(t=0.5)が最も太い三日月フォルム
      const taper = Math.sin(Math.PI * t);
      const midR = (innerR + outerR) * 0.5;
      const halfWidth = ((outerR - innerR) * 0.5) * Math.pow(taper, 0.72);

      const rIn = midR - halfWidth;
      const rOut = midR + halfWidth;

      const sinT = Math.sin(theta);
      const cosT = Math.cos(theta);

      positions.push(sinT * rIn, 0, cosT * rIn);
      positions.push(sinT * rOut, 0, cosT * rOut);

      if (i < segments) {
        const base = i * 2;
        indices.push(base, base + 1, base + 2);
        indices.push(base + 1, base + 3, base + 2);
      }
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }

  function spawnHorizontalCrescentSlashV8(game, entity, comboStep, styleCfg) {
    if (!game?.useWebGL || !game?.scene || !entity?.pos || typeof THREE === 'undefined') return;
    if (!game._v8SlashEffects) game._v8SlashEffects = [];

    const rotY = entity.rotY || 0;
    const dirX = Math.sin(rotY);
    const dirZ = Math.cos(rotY);
    const sc = (styleCfg.scale || 1.0) * (comboStep === 3 ? 1.32 : (comboStep === 2 ? 1.08 : 1.0));
    const arc = comboStep === 3 ? Math.PI * 1.48 : Math.PI * 1.08;

    const root = new THREE.Group();
    root.position.set(
      entity.pos.x + dirX * 0.65,
      1.05 + (comboStep === 2 ? 0.14 : (comboStep === 3 ? -0.05 : 0.0)),
      entity.pos.z + dirZ * 0.65
    );
    root.rotation.y = rotY;

    // 水平なぎ払いを基本とし、コンボごとにわずかな角度変化を付けて3連の立体感を演出
    if (comboStep === 1) {
      root.rotation.z = 0.08;
    } else if (comboStep === 2) {
      root.rotation.z = -0.10;
      root.scale.x = -1; // 逆方向からの払い
    } else {
      root.rotation.z = 0.0;
    }

    // 外周オーラ三日月
    const outerGeo = createCrescentGeometryV8(0.95 * sc, 2.35 * sc, arc, 30);
    const outerMat = new THREE.MeshBasicMaterial({
      color: styleCfg.aura,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.86
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    root.add(outerMesh);

    // メイン刃三日月
    const bladeGeo = createCrescentGeometryV8(1.25 * sc, 2.28 * sc, arc * 0.94, 28);
    const bladeMat = new THREE.MeshBasicMaterial({
      color: styleCfg.blade,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95
    });
    const bladeMesh = new THREE.Mesh(bladeGeo, bladeMat);
    bladeMesh.position.y = 0.02;
    root.add(bladeMesh);

    // 中心高輝度エッジ
    const coreGeo = createCrescentGeometryV8(1.65 * sc, 2.18 * sc, arc * 0.86, 24);
    const coreMat = new THREE.MeshBasicMaterial({
      color: styleCfg.core,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.98
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.y = 0.04;
    root.add(coreMesh);

    // 上位クラス or 3段目の追加衝撃波リング
    let extraMesh = null;
    let extraMat = null;
    if (styleCfg.multiRing || comboStep === 3) {
      const extraGeo = createCrescentGeometryV8(1.85 * sc, 2.75 * sc, arc * 1.05, 28);
      extraMat = new THREE.MeshBasicMaterial({
        color: styleCfg.rainbow ? 0x38bdf8 : styleCfg.spark,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.72
      });
      extraMesh = new THREE.Mesh(extraGeo, extraMat);
      extraMesh.position.y = -0.03;
      root.add(extraMesh);
    }

    // 斬撃弧に沿って飛散する光の粒子
    const sparks = [];
    const sparkCount = comboStep === 3 ? 12 : 7;
    for (let i = 0; i < sparkCount; i++) {
      const t = (i + 0.5) / sparkCount;
      const ang = -arc * 0.45 + arc * 0.9 * t;
      const r = 1.95 * sc;
      const sMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? styleCfg.core : styleCfg.spark,
        transparent: true,
        opacity: 0.95
      });
      const sMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.11 * sc, 0), sMat);
      sMesh.position.set(Math.sin(ang) * r, (Math.random() - 0.5) * 0.25, Math.cos(ang) * r);
      root.add(sMesh);
      sparks.push({
        mesh: sMesh,
        mat: sMat,
        vx: Math.sin(ang) * (3.8 * sc),
        vy: (Math.random() - 0.3) * 1.4,
        vz: Math.cos(ang) * (3.8 * sc)
      });
    }

    game.scene.add(root);

    game._v8SlashEffects.push({
      root,
      outerMat,
      bladeMat,
      coreMat,
      extraMesh,
      extraMat,
      sparks,
      dirX,
      dirZ,
      speed: comboStep === 3 ? 8.5 : 6.2,
      comboStep,
      rainbow: Boolean(styleCfg.rainbow),
      elapsed: 0,
      duration: comboStep === 3 ? 0.32 : 0.24
    });
  }

  // =========================================================
  // 5. 3連水平横振りトリガー（game7.js ルーターから呼び出し）
  // =========================================================
  function triggerSwordSwingAndSlashV8(game, entity) {
    const g = game || window.__kmjInstance || window.game;
    if (!g || !entity) return;

    const now = performance.now();
    const lastSwing = entity._lastSwordSwingTimeV8 || 0;
    // 1.35秒以内の連続攻撃で 1段目 → 2段目 → 3段目 の3連コンボへ進行
    if (now - lastSwing <= 1350) {
      entity._swordComboStepV8 = ((entity._swordComboStepV8 || 0) % 3) + 1;
    } else {
      entity._swordComboStepV8 = 1;
    }
    entity._lastSwordSwingTimeV8 = now;
    const step = entity._swordComboStepV8;

    entity.attackAnimTimer = step === 3 ? 0.34 : 0.26;
    entity.attackIsSkill = false;

    const pivot = findWeaponPivotV8(entity);
    if (pivot) {
      if (!pivot._origPoseV8) {
        pivot._origPoseV8 = {
          rx: pivot.rotation.x,
          ry: pivot.rotation.y,
          rz: pivot.rotation.z,
          px: pivot.position.x,
          py: pivot.position.y,
          pz: pivot.position.z
        };
      }
      entity._activeSwordSwingV8 = {
        pivot,
        step,
        elapsed: 0,
        duration: step === 3 ? 0.30 : 0.22
      };
    }

    const styleCfg = resolveSwordStyleV8(g, entity);
    spawnHorizontalCrescentSlashV8(g, entity, step, styleCfg);

    if (entity === g.player) {
      playSwordSlashAudioV8(step);
    }
  }
  window.triggerSwordSwingAndSlashV8 = triggerSwordSwingAndSlashV8;

  // =========================================================
  // 6. 近接ヒット火花エフェクト
  // =========================================================
  function spawnSwordHitSparkV8(game, pos, styleCfg = SWORD_STYLE_V8.novice_slash) {
    if (!game?.useWebGL || !game?.scene || !pos || typeof THREE === 'undefined') return;
    if (!game._v8HitSparks) game._v8HitSparks = [];

    const grp = new THREE.Group();
    grp.position.set(pos.x, (pos.y || 0) + 1.1, pos.z);

    // 水平クロス閃光
    const barGeo = new THREE.PlaneGeometry(2.1, 0.22);
    const barMat1 = new THREE.MeshBasicMaterial({ color: styleCfg.core, side: THREE.DoubleSide, transparent: true, opacity: 0.98 });
    const bar1 = new THREE.Mesh(barGeo, barMat1);
    bar1.rotation.z = 0.22;

    const barMat2 = new THREE.MeshBasicMaterial({ color: styleCfg.blade, side: THREE.DoubleSide, transparent: true, opacity: 0.92 });
    const bar2 = new THREE.Mesh(barGeo, barMat2);
    bar2.rotation.z = -0.35;

    grp.add(bar1, bar2);

    const bits = [];
    for (let i = 0; i < 8; i++) {
      const ang = (Math.PI * 2 * i) / 8;
      const bMat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? styleCfg.spark : styleCfg.core, transparent: true, opacity: 0.95 });
      const bMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.11, 0), bMat);
      grp.add(bMesh);
      bits.push({
        mesh: bMesh,
        mat: bMat,
        vx: Math.cos(ang) * 5.2,
        vy: 1.5 + (i % 3) * 1.1,
        vz: Math.sin(ang) * 5.2
      });
    }

    game.scene.add(grp);
    game._v8HitSparks.push({
      grp, bar1, bar2, barMat1, barMat2, bits,
      elapsed: 0, duration: 0.24
    });
  }

  // =========================================================
  // 7. 毎フレーム更新（剣の水平横振り姿勢＆三日月斬撃波＆火花）
  // =========================================================
  function updateSwordSwingsV8(game, dt) {
    if (!game) return;

    // 7-1. プレイヤー＆他プレイヤーの剣の水平横振り姿勢更新
    const entities = [];
    if (game.player) entities.push(game.player);
    if (game.remotePlayers && typeof game.remotePlayers.forEach === 'function') {
      game.remotePlayers.forEach(rp => { if (rp) entities.push(rp); });
    }

    for (const ent of entities) {
      const sw = ent._activeSwordSwingV8;
      if (!sw || !sw.pivot) continue;

      sw.elapsed += dt;
      const t = Math.min(1, sw.elapsed / sw.duration);
      // イージング（鋭く振り抜いてフォロースルー）
      const ease = 1 - Math.pow(1 - t, 3);
      const orig = sw.pivot._origPoseV8 || { rx: 0, ry: 0, rz: 0, px: 0.55, py: 0.9, pz: 0.2 };

      // 剣を横向き（水平面）に倒す（rz ≈ -Math.PI * 0.48）
      const flatZ = -Math.PI * 0.48;

      if (sw.step === 1) {
        // 1段目: 右(-1.9rad) → 左(+1.9rad) 水平なぎ払い
        const sweepY = -1.95 + 3.90 * ease;
        sw.pivot.rotation.set(orig.rx + 0.12, orig.ry + sweepY, flatZ);
        sw.pivot.position.set(
          Math.sin(sweepY) * 0.65,
          orig.py + 0.05,
          Math.cos(sweepY) * 0.65
        );
      } else if (sw.step === 2) {
        // 2段目: 左(+2.0rad) → 右(-2.0rad) 逆水平なぎ払い
        const sweepY = 2.00 - 4.00 * ease;
        sw.pivot.rotation.set(orig.rx - 0.10, orig.ry + sweepY, flatZ + 0.18);
        sw.pivot.position.set(
          Math.sin(sweepY) * 0.68,
          orig.py + 0.12,
          Math.cos(sweepY) * 0.68
        );
      } else {
        // 3段目: 360度水平大回転なぎ払い
        const sweepY = -2.2 + (Math.PI * 2 + 0.6) * ease;
        sw.pivot.rotation.set(orig.rx, orig.ry + sweepY, flatZ);
        sw.pivot.position.set(
          Math.sin(sweepY) * 0.78,
          orig.py + 0.02,
          Math.cos(sweepY) * 0.78
        );
      }

      if (t >= 1) {
        sw.pivot.rotation.set(orig.rx, orig.ry, orig.rz);
        sw.pivot.position.set(orig.px, orig.py, orig.pz);
        ent._activeSwordSwingV8 = null;
      }
    }

    // 7-2. 水平三日月斬撃波のアニメーション更新
    if (Array.isArray(game._v8SlashEffects) && game._v8SlashEffects.length > 0) {
      for (let i = game._v8SlashEffects.length - 1; i >= 0; i--) {
        const fx = game._v8SlashEffects[i];
        fx.elapsed += dt;
        const p = Math.min(1, fx.elapsed / fx.duration);

        fx.root.position.x += fx.dirX * fx.speed * dt;
        fx.root.position.z += fx.dirZ * fx.speed * dt;

        // 振り抜き方向に沿って弧が回転しながら広がる
        const spinDir = fx.comboStep === 2 ? -1 : 1;
        fx.root.rotation.y += spinDir * dt * (fx.comboStep === 3 ? 7.5 : 4.2);
        const expand = 1 + p * (fx.comboStep === 3 ? 0.55 : 0.35);
        fx.root.scale.set(
          (fx.comboStep === 2 ? -1 : 1) * expand,
          1,
          expand
        );

        const alpha = Math.pow(1 - p, 1.35);
        fx.outerMat.opacity = 0.86 * alpha;
        fx.bladeMat.opacity = 0.95 * alpha;
        fx.coreMat.opacity = 0.98 * alpha;
        if (fx.extraMat) fx.extraMat.opacity = 0.72 * alpha;

        if (fx.rainbow) {
          const hue = (fx.elapsed * 3.2) % 1;
          fx.bladeMat.color.setHSL(hue, 0.95, 0.62);
        }

        for (const sp of fx.sparks) {
          sp.mesh.position.x += sp.vx * dt;
          sp.mesh.position.y += sp.vy * dt;
          sp.mesh.position.z += sp.vz * dt;
          sp.mat.opacity = 0.95 * alpha;
        }

        if (p >= 1) {
          try {
            game.scene?.remove(fx.root);
            fx.root.traverse?.(o => {
              o.geometry?.dispose?.();
              o.material?.dispose?.();
            });
          } catch (e) {}
          game._v8SlashEffects.splice(i, 1);
        }
      }
    }

    // 7-3. 近接ヒット火花の更新
    if (Array.isArray(game._v8HitSparks) && game._v8HitSparks.length > 0) {
      for (let i = game._v8HitSparks.length - 1; i >= 0; i--) {
        const hs = game._v8HitSparks[i];
        hs.elapsed += dt;
        const p = Math.min(1, hs.elapsed / hs.duration);
        const alpha = 1 - p;

        hs.bar1.scale.set(1 + p * 0.9, 1 - p * 0.5, 1);
        hs.bar2.scale.set(1 + p * 0.9, 1 - p * 0.5, 1);
        hs.barMat1.opacity = 0.98 * alpha;
        hs.barMat2.opacity = 0.92 * alpha;

        if (game.camera) {
          hs.grp.lookAt(game.camera.position);
        }

        for (const b of hs.bits) {
          b.mesh.position.set(b.vx * p, b.vy * p - 2.4 * p * p, b.vz * p);
          b.mat.opacity = 0.95 * alpha;
        }

        if (p >= 1) {
          try {
            game.scene?.remove(hs.grp);
            hs.grp.traverse?.(o => {
              o.geometry?.dispose?.();
              o.material?.dispose?.();
            });
          } catch (e) {}
          game._v8HitSparks.splice(i, 1);
        }
      }
    }
  }

  // =========================================================
  // 8. MP成長＆自然回復システム（KaomojiMMORPG.prototype）
  // =========================================================
  function installV8Prototype() {
    if (typeof KaomojiMMORPG === 'undefined') {
      setTimeout(installV8Prototype, 150);
      return;
    }

    const proto = KaomojiMMORPG.prototype;
    if (proto._v8PrototypeInstalled) return;
    proto._v8PrototypeInstalled = true;

    Object.assign(proto, {
      calcScaledMaxMpV8(baseMaxMp = 50) {
        const d = this.saveData || {};
        const lv = Math.max(1, Number(d.lv ?? d.level ?? this.player?.lv ?? 1));
        const cls = typeof this.getCurrentClassDefV45 === 'function' ? this.getCurrentClassDefV45() : null;
        const isStaff = cls?.weaponType === 'staff';
        const matkMult = Number(cls?.matkMult || 1.0);

        // Lv.1=50〜65 / Lv.100≒850 / Lv.999≒8,500〜14,000（魔導クラスはさらに増大）
        const lvBonus = Math.floor((lv - 1) * (isStaff ? 11.5 : 7.5));
        const classFactor = isStaff ? Math.max(1.25, matkMult * 0.92) : Math.max(1.0, matkMult * 0.85);
        const computed = Math.floor((Math.max(50, Number(baseMaxMp) || 50) + lvBonus) * classFactor);
        return Math.max(50, computed);
      },

      updateMpGrowthAndRegenV8(dt = 0.016) {
        const d = this.saveData;
        if (!d) return;

        const baseMax = Number(d.baseMaxMp || 50);
        const targetMaxMp = this.calcScaledMaxMpV8(baseMax);
        const prevMaxMp = Math.max(1, Number(d.maxMp || targetMaxMp));

        // 最大MPが成長した分だけ現在MPも比例引き上げ
        if (targetMaxMp > prevMaxMp) {
          const gain = targetMaxMp - prevMaxMp;
          d.maxMp = targetMaxMp;
          d.mp = Math.min(targetMaxMp, (Number(d.mp) || 0) + gain);
        } else {
          d.maxMp = targetMaxMp;
        }

        // MP自然回復（リジェネ）
        const cls = typeof this.getCurrentClassDefV45 === 'function' ? this.getCurrentClassDefV45() : null;
        const isStaff = cls?.weaponType === 'staff';
        const regenPerSec = Math.max(2.5, targetMaxMp * (isStaff ? 0.065 : 0.042));

        let curMp = Number(d.mp);
        if (!Number.isFinite(curMp)) curMp = targetMaxMp;
        if (curMp < targetMaxMp && dt > 0) {
          curMp = Math.min(targetMaxMp, curMp + regenPerSec * dt);
        } else if (curMp > targetMaxMp) {
          curMp = targetMaxMp;
        }
        d.mp = curMp;

        if (this.player) {
          this.player.maxMp = targetMaxMp;
          this.player.mp = Math.floor(curMp);
        }
      },

      installV8Hooks() {
        if (this._v8HooksInstalled) return;
        this._v8HooksInstalled = true;

        // calcDerivedStats に成長後 maxMp を反映
        if (typeof proto.calcDerivedStats === 'function' && !proto._v8DerivedWrapped) {
          const origDerived = proto.calcDerivedStats;
          proto.calcDerivedStats = function (...args) {
            const st = origDerived.apply(this, args) || {};
            try {
              const scaledMp = this.calcScaledMaxMpV8(st.maxMp || this.saveData?.baseMaxMp || 50);
              st.maxMp = Math.max(Number(st.maxMp) || 50, scaledMp);
            } catch (e) {}
            return st;
          };
          proto._v8DerivedWrapped = true;
        }

        // 近接ダメージ発生時に剣クラスのヒット火花を追加
        if (typeof proto.damageMonster === 'function' && !proto._v8DmgMonsterWrapped) {
          const origDmg = proto.damageMonster;
          proto.damageMonster = function (m, dmg, isCrit = false, icon = '', ...rest) {
            const res = origDmg.apply(this, [m, dmg, isCrit, icon, ...rest]);
            try {
              const isStaff = typeof window.isStaffClassEntityV7 === 'function'
                ? window.isStaffClassEntityV7(this, this.player)
                : false;
              if (!isStaff && m?.pos && icon !== '🪄') {
                const styleCfg = resolveSwordStyleV8(this, this.player);
                spawnSwordHitSparkV8(this, m.pos, styleCfg);
              }
            } catch (e) {}
            return res;
          };
          proto._v8DmgMonsterWrapped = true;
        }

        // 毎フレーム更新（3連横振りアニメーション・三日月斬撃波・MP自然回復）
        if (typeof proto.update === 'function' && !proto._v8UpdateWrapped) {
          const origUpdate = proto.update;
          proto.update = function (dt = 0.016, ...rest) {
            const safeDt = Math.min(0.1, Math.max(0.001, Number(dt) || 0.016));
            try {
              this.updateMpGrowthAndRegenV8(safeDt);
            } catch (e) {
              reportErrV8('game8:mp', e);
            }
            const res = origUpdate.apply(this, [dt, ...rest]);
            try {
              updateSwordSwingsV8(this, safeDt);
            } catch (e) {
              reportErrV8('game8:swing', e);
            }
            return res;
          };
          proto._v8UpdateWrapped = true;
        }
      }
    });

    proto.installV8Hooks();

    setTimeout(() => {
      const inst = window.__kmjInstance || window.game || window.app || window.mmorpg;
      if (inst) {
        inst.updateMpGrowthAndRegenV8?.(0.016);
        inst.refreshAllHUD?.();
      }
    }, 300);
  }

  installV8Prototype();
})();
// ▲▲▲ ここまで game8.js ▲▲▲
