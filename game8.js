// ▼▼▼ ここから【スキルエフェクト専用 game9.js 3/3】後半9種の個別3Dビルダー・武器種別×グレード6段階の水平横振り攻撃エフェクト・統合実行エンジン ▼▼▼
(() => {
  'use strict';

  const V9 = window.KMJ_SKILL_FX_V9;
  if (!V9 || !V9.EFFECT_BUILDERS) return;

  function addMagicCircleBase(root, radius, c1, c2, tier, ringsOut) {
    const ringCount = 2 + tier;
    for (let r = 0; r < ringCount; r++) {
      const rIn = radius * (0.32 + r * (0.68 / ringCount));
      const rOut = rIn + 0.14 * (1 + tier * 0.25);
      const col = r % 2 === 0 ? c1 : c2;
      const segs = r === 0 ? 6 : (r === 1 ? 8 : 36);
      const mesh = new THREE.Mesh(
        new THREE.RingGeometry(rIn, rOut, segs),
        new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide, transparent: true, opacity: 0.92 })
      );
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.y = 0.05 + r * 0.025;
      root.add(mesh);
      ringsOut.push({ mesh, speed: (r % 2 === 0 ? 1 : -1) * (2.2 + r * 0.7) });
    }
  }

  // =========================================================
  // 9. ⚡ 紫電・天罰落雷魔法
  // =========================================================
  V9.EFFECT_BUILDERS.thunder = function (root, info, scale) {
    const tier = info.tier;
    const c1 = info.theme.c1;
    const c2 = info.theme.c2;
    const c3 = info.theme.c3;
    const areaRadius = (2.1 + tier * 0.75) * scale;

    const magicRings = [];
    addMagicCircleBase(root, areaRadius, c1, c2, tier, magicRings);

    const skyRing = new THREE.Mesh(
      new THREE.TorusGeometry(areaRadius * 0.75, 0.18 * scale, 10, 32),
      new THREE.MeshBasicMaterial({ color: c2, transparent: true, opacity: 0.9 })
    );
    skyRing.rotation.x = Math.PI / 2;
    skyRing.position.y = 7.4 * scale;
    root.add(skyRing);

    const bolts = [];
    const boltCount = 3 + tier * 3;
    for (let b = 0; b < boltCount; b++) {
      const ang = (Math.PI * 2 * b) / boltCount;
      const rad = b === 0 ? 0 : areaRadius * (0.38 + (b % 2) * 0.38);
      const bx = Math.cos(ang) * rad;
      const bz = Math.sin(ang) * rad;

      const segs = [];
      let curX = bx, curZ = bz;
      for (let s = 0; s < 5; s++) {
        const nextX = bx + (s % 2 === 0 ? 0.34 : -0.34) * scale;
        const nextZ = bz + (s % 3 === 0 ? 0.26 : -0.26) * scale;
        const seg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.11 * scale, 0.15 * scale, 1.7 * scale, 8),
          new THREE.MeshBasicMaterial({ color: s % 2 === 0 ? c1 : c3, transparent: true, opacity: 0 })
        );
        seg.position.set((curX + nextX) * 0.5, (0.85 + s * 1.48) * scale, (curZ + nextZ) * 0.5);
        seg.rotation.z = (s % 2 === 0 ? -0.35 : 0.35);
        seg.rotation.x = (s % 3 === 0 ? 0.28 : -0.28);
        root.add(seg);
        segs.push(seg);
        curX = nextX; curZ = nextZ;
      }
      bolts.push({ segs, delay: (b % 4) * 0.075 });
    }

    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(areaRadius * 0.88, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.5),
      new THREE.MeshBasicMaterial({ color: c1, wireframe: true, transparent: true, opacity: 0 })
    );
    root.add(dome);

    return (p, elapsed) => {
      const fade = p > 0.72 ? Math.max(0, 1 - (p - 0.72) / 0.28) : 1;
      const strobe = Math.sin(elapsed * 65) > -0.2 ? 1.0 : 0.25;
      magicRings.forEach(r => {
        r.mesh.rotation.z = elapsed * r.speed * 1.5;
        r.mesh.material.opacity = fade * 0.92;
      });
      skyRing.rotation.z = -elapsed * 5;
      skyRing.material.opacity = fade * 0.9;
      bolts.forEach(bt => {
        const on = p >= bt.delay ? 1 : 0;
        bt.segs.forEach(sg => { sg.material.opacity = on * strobe * fade * 0.96; });
      });
      dome.rotation.y = elapsed * 6;
      dome.material.opacity = strobe * fade * 0.78;
    };
  };

  // =========================================================
  // 10. 🌪️ 旋風円舞・螺旋竜巻魔法
  // =========================================================
  V9.EFFECT_BUILDERS.wind = function (root, info, scale) {
    const tier = info.tier;
    const c1 = info.theme.c1;
    const c2 = info.theme.c2;
    const c3 = info.theme.c3;
    const areaRadius = (2.1 + tier * 0.75) * scale;

    const magicRings = [];
    addMagicCircleBase(root, areaRadius, c1, c2, tier, magicRings);

    const tornadoRings = [];
    const rCnt = 8 + tier * 4;
    for (let i = 0; i < rCnt; i++) {
      const t = i / rCnt;
      const torus = new THREE.Mesh(
        new THREE.TorusGeometry((0.42 + t * 1.6) * scale, 0.085 * scale, 8, 28),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? c1 : c2, transparent: true, opacity: 0.9 })
      );
      torus.rotation.x = Math.PI / 2 + (i % 2 === 0 ? 0.14 : -0.14);
      torus.position.y = (0.3 + t * 5.8) * scale;
      root.add(torus);
      tornadoRings.push({ mesh: torus, baseY: (0.3 + t * 5.8) * scale, idx: i });
    }

    const blades = [];
    const bCnt = 5 + tier * 3;
    for (let i = 0; i < bCnt; i++) {
      const ang = (Math.PI * 2 * i) / bCnt;
      const blade = new THREE.Mesh(
        new THREE.RingGeometry(0.45 * scale, 0.98 * scale, 16, 1, 0, Math.PI * 0.85),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? c2 : c3, side: THREE.DoubleSide, transparent: true, opacity: 0.95 })
      );
      blade.rotation.x = Math.PI * 0.35;
      root.add(blade);
      blades.push({ mesh: blade, ang, h: (0.8 + (i % 4) * 1.15) * scale });
    }

    return (p, elapsed) => {
      const fade = p > 0.72 ? Math.max(0, 1 - (p - 0.72) / 0.28) : 1;
      magicRings.forEach(r => {
        r.mesh.rotation.z = elapsed * r.speed * 1.6;
        r.mesh.material.opacity = fade * 0.92;
      });
      tornadoRings.forEach(tr => {
        tr.mesh.rotation.z = elapsed * (12 + tr.idx);
        tr.mesh.position.y = tr.baseY + p * 1.7 * scale;
        tr.mesh.scale.setScalar(1 + p * 0.38);
        tr.mesh.material.opacity = fade * 0.9;
      });
      blades.forEach(bl => {
        const curAng = bl.ang + elapsed * 9.5;
        const rad = areaRadius * (0.75 + Math.sin(elapsed * 5) * 0.2);
        bl.mesh.position.set(Math.cos(curAng) * rad, bl.h + p * 1.5 * scale, Math.sin(curAng) * rad);
        bl.mesh.rotation.y = -curAng;
        bl.mesh.material.opacity = fade * 0.95;
      });
    };
  };

  // =========================================================
  // 11. 🌊 蒼海・大渦潮水柱魔法
  // =========================================================
  V9.EFFECT_BUILDERS.water = function (root, info, scale) {
    const tier = info.tier;
    const c1 = info.theme.c1;
    const c2 = info.theme.c2;
    const c3 = info.theme.c3;
    const areaRadius = (2.2 + tier * 0.75) * scale;

    const magicRings = [];
    addMagicCircleBase(root, areaRadius, c1, c2, tier, magicRings);

    const geysers = [];
    const gCnt = 1 + tier * 2;
    for (let i = 0; i < gCnt; i++) {
      const isCenter = (i === 0);
      const ang = (Math.PI * 2 * i) / Math.max(1, gCnt - 1);
      const rad = isCenter ? 0 : areaRadius * 0.58;
      const h = (isCenter ? 8.0 : 5.4) * scale;
      const rTop = (isCenter ? 0.58 : 0.38) * scale;
      const rBot = (isCenter ? 1.40 : 0.90) * scale;

      const gMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(rTop, rBot, h, 20, 1, true),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? c1 : c3, side: THREE.DoubleSide, transparent: true, opacity: 0.74 })
      );
      gMesh.position.set(Math.cos(ang) * rad, h * 0.5, Math.sin(ang) * rad);
      root.add(gMesh);
      geysers.push({ mesh: gMesh, baseH: h, delay: isCenter ? 0 : 0.12 });
    }

    const waves = [];
    for (let i = 0; i < 4 + tier; i++) {
      const wv = new THREE.Mesh(
        new THREE.RingGeometry(0.5 * scale, 0.92 * scale, 32),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? c2 : c3, side: THREE.DoubleSide, transparent: true, opacity: 0.92 })
      );
      wv.rotation.x = -Math.PI / 2;
      wv.position.y = 0.12 + i * 0.03;
      root.add(wv);
      waves.push({ mesh: wv, delay: i * 0.13 });
    }

    return (p, elapsed) => {
      const fade = p > 0.72 ? Math.max(0, 1 - (p - 0.72) / 0.28) : 1;
      magicRings.forEach(r => {
        r.mesh.rotation.z = elapsed * r.speed * 1.4;
        r.mesh.material.opacity = fade * 0.92;
      });
      geysers.forEach(gy => {
        const lp = Math.max(0, Math.min(1, (p - gy.delay) / 0.85));
        const hScale = Math.sin(Math.min(1, lp * 1.3) * Math.PI);
        gy.mesh.scale.set(1 + lp * 0.38, Math.max(0.05, hScale), 1 + lp * 0.38);
        gy.mesh.position.y = gy.baseH * 0.5 * hScale;
        gy.mesh.rotation.y = elapsed * 5;
        gy.mesh.material.opacity = fade * 0.74;
      });
      waves.forEach(wv => {
        const lp = Math.max(0, Math.min(1, (p - wv.delay) / 0.7));
        wv.mesh.scale.setScalar(1 + lp * (3.8 + tier * 0.6));
        wv.mesh.material.opacity = lp > 0 ? Math.max(0, (1 - lp) * 0.92) : 0;
      });
    };
  };

  // =========================================================
  // 12. 🪨 破邪の衝撃・巨岩隆起魔法
  // =========================================================
  V9.EFFECT_BUILDERS.earth = function (root, info, scale) {
    const tier = info.tier;
    const c1 = info.theme.c1;
    const c2 = info.theme.c2;
    const c3 = info.theme.c3;
    const areaRadius = (2.2 + tier * 0.75) * scale;

    const magicRings = [];
    addMagicCircleBase(root, areaRadius, c1, c2, tier, magicRings);

    const rocks = [];
    const layerCount = 1 + tier;
    for (let layer = 0; layer < layerCount; layer++) {
      const cnt = 6 + layer * 4;
      const rad = areaRadius * (0.32 + (layer / Math.max(1, layerCount)) * 0.64);
      for (let i = 0; i < cnt; i++) {
        const ang = (Math.PI * 2 * i) / cnt + layer * 0.3;
        const size = (0.55 + tier * 0.12 + (i % 3) * 0.18) * scale;
        const rock = new THREE.Mesh(
          new THREE.DodecahedronGeometry(size, 0),
          new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? c1 : (i % 3 === 1 ? c2 : c3), transparent: true, opacity: 0.96 })
        );
        const startY = -size * 1.4;
        const targetY = size * (0.85 + (i % 2) * 0.45);
        rock.position.set(Math.cos(ang) * rad, startY, Math.sin(ang) * rad);
        rock.rotation.set(i * 0.7, ang, i * 0.4);
        root.add(rock);
        rocks.push({
          mesh: rock,
          startY,
          targetY,
          delay: layer * 0.1 + (i % 3) * 0.025,
          rotSpd: (i % 2 === 0 ? 1.5 : -1.5)
        });
      }
    }

    return (p, elapsed) => {
      const fade = p > 0.72 ? Math.max(0, 1 - (p - 0.72) / 0.28) : 1;
      magicRings.forEach(r => {
        r.mesh.rotation.z = elapsed * r.speed;
        r.mesh.material.opacity = fade * 0.92;
      });
      rocks.forEach(rk => {
        const lp = Math.max(0, Math.min(1, (p - rk.delay) / 0.25));
        const ease = 1 - Math.pow(1 - lp, 3);
        rk.mesh.position.y = rk.startY + (rk.targetY - rk.startY) * ease;
        rk.mesh.rotation.y += rk.rotSpd * 0.02;
        rk.mesh.material.opacity = fade * 0.96;
      });
    };
  };

  // =========================================================
  // 13. 💖 聖光の癒し・天照光輪魔法
  // =========================================================
  V9.EFFECT_BUILDERS.holy_heal = function (root, info, scale) {
    const tier = info.tier;
    const c1 = info.theme.c1;
    const c2 = info.theme.c2;
    const c3 = info.theme.c3;
    const areaRadius = (2.2 + tier * 0.75) * scale;

    const magicRings = [];
    addMagicCircleBase(root, areaRadius, c1, c2, tier, magicRings);

    const hPillar = (8.5 + tier * 2.2) * scale;
    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55 * scale, 1.45 * scale, hPillar, 24, 1, true),
      new THREE.MeshBasicMaterial({ color: c1, side: THREE.DoubleSide, transparent: true, opacity: 0.52 })
    );
    pillar.position.y = hPillar * 0.5;
    root.add(pillar);

    const coreBeam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24 * scale, 0.45 * scale, hPillar + 1.2, 18, 1, true),
      new THREE.MeshBasicMaterial({ color: c2, side: THREE.DoubleSide, transparent: true, opacity: 0.92 })
    );
    coreBeam.position.y = (hPillar + 1.2) * 0.5;
    root.add(coreBeam);

    const angelRings = [];
    const rCnt = 2 + tier;
    for (let i = 0; i < rCnt; i++) {
      const ar = new THREE.Mesh(
        new THREE.TorusGeometry((1.2 + i * 0.45) * scale, 0.09 * scale, 10, 32),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? c1 : c3, transparent: true, opacity: 0.95 })
      );
      ar.rotation.x = Math.PI / 2;
      ar.position.y = (1.6 + i * 1.1) * scale;
      root.add(ar);
      angelRings.push({ mesh: ar, baseY: (1.6 + i * 1.1) * scale, idx: i });
    }

    const feathers = [];
    const fCnt = 12 + tier * 6;
    for (let i = 0; i < fCnt; i++) {
      const ang = (Math.PI * 2 * i) / fCnt;
      const rad = (0.5 + (i % 4) * 0.48) * scale;
      const ft = new THREE.Mesh(
        new THREE.PlaneGeometry(0.26 * scale, 0.55 * scale),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? c2 : c1, side: THREE.DoubleSide, transparent: true, opacity: 0.95 })
      );
      const topY = (3.5 + (i % 4) * 1.1) * scale;
      ft.position.set(Math.cos(ang) * rad, topY, Math.sin(ang) * rad);
      root.add(ft);
      feathers.push({ mesh: ft, ang, rad, topY });
    }

    return (p, elapsed) => {
      const fade = p > 0.72 ? Math.max(0, 1 - (p - 0.72) / 0.28) : 1;
      magicRings.forEach(r => {
        r.mesh.rotation.z = elapsed * r.speed;
        r.mesh.material.opacity = fade * 0.92;
      });
      pillar.rotation.y = elapsed * 2.5;
      pillar.material.opacity = fade * 0.52;
      coreBeam.material.opacity = fade * 0.92;

      angelRings.forEach(ar => {
        ar.mesh.rotation.z = elapsed * (3 + ar.idx);
        ar.mesh.rotation.y = Math.sin(elapsed * 3 + ar.idx) * 0.25;
        ar.mesh.position.y = ar.baseY + Math.sin(elapsed * 4 + ar.idx) * 0.25;
        ar.mesh.material.opacity = fade * 0.95;
      });

      feathers.forEach((ft, idx) => {
        ft.mesh.position.y = Math.max(0.15, ft.topY - p * 3.8 * scale);
        ft.mesh.position.x = Math.cos(ft.ang + elapsed * 1.8) * ft.rad;
        ft.mesh.position.z = Math.sin(ft.ang + elapsed * 1.8) * ft.rad;
        ft.mesh.rotation.set(elapsed * 3, elapsed * 4 + idx, 0.5);
        ft.mesh.material.opacity = fade * 0.95;
      });
    };
  };

  // =========================================================
  // 14. 🌌 黒蝕・ブラックホール魔法
  // =========================================================
  V9.EFFECT_BUILDERS.dark = function (root, info, scale) {
    const tier = info.tier;
    const c1 = info.theme.c1;
    const c2 = info.theme.c2;
    const c3 = info.theme.c3;
    const areaRadius = (2.3 + tier * 0.75) * scale;

    const magicRings = [];
    addMagicCircleBase(root, areaRadius, c1, c2, tier, magicRings);

    const centerY = 1.85 * scale;
    const bh = new THREE.Mesh(
      new THREE.SphereGeometry(1.05 * scale, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0x05070e, transparent: true, opacity: 0.98 })
    );
    bh.position.y = centerY;
    root.add(bh);

    const disk1 = new THREE.Mesh(
      new THREE.TorusGeometry(1.9 * scale, 0.16 * scale, 10, 36),
      new THREE.MeshBasicMaterial({ color: c1, transparent: true, opacity: 0.95 })
    );
    disk1.position.y = centerY;
    disk1.rotation.x = Math.PI * 0.36;
    root.add(disk1);

    const disk2 = new THREE.Mesh(
      new THREE.TorusGeometry(2.45 * scale, 0.11 * scale, 10, 36),
      new THREE.MeshBasicMaterial({ color: c2, transparent: true, opacity: 0.9 })
    );
    disk2.position.y = centerY;
    disk2.rotation.set(Math.PI * 0.42, 0.4, 0);
    root.add(disk2);

    const pulledOrbs = [];
    const oCnt = 16 + tier * 8;
    for (let i = 0; i < oCnt; i++) {
      const ang = (Math.PI * 2 * i) / oCnt;
      const startRad = (2.8 + (i % 3) * 0.8) * scale;
      const startY = (0.4 + (i % 5) * 0.75) * scale;
      const orb = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.18 * scale, 0),
        new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? c1 : (i % 3 === 1 ? c2 : c3), transparent: true, opacity: 0.95 })
      );
      root.add(orb);
      pulledOrbs.push({ mesh: orb, ang, startRad, startY });
    }

    const novaRing = new THREE.Mesh(
      new THREE.RingGeometry(0.4 * scale, 1.1 * scale, 32),
      new THREE.MeshBasicMaterial({ color: c2, side: THREE.DoubleSide, transparent: true, opacity: 0 })
    );
    novaRing.rotation.x = -Math.PI / 2;
    novaRing.position.y = 0.15;
    root.add(novaRing);

    return (p, elapsed) => {
      magicRings.forEach(r => {
        r.mesh.rotation.z = -elapsed * r.speed * 1.5;
        r.mesh.material.opacity = Math.max(0, (1 - p * 0.9) * 0.92);
      });

      if (p < 0.72) {
        const suckP = p / 0.72;
        const sc = 0.6 + suckP * 0.75;
        bh.scale.setScalar(sc);
        disk1.scale.setScalar(sc);
        disk2.scale.setScalar(sc);
        disk1.rotation.z = elapsed * 8;
        disk2.rotation.z = -elapsed * 6;

        pulledOrbs.forEach(ob => {
          const curRad = ob.startRad * (1 - suckP);
          const curAng = ob.ang + suckP * 6.5;
          ob.mesh.position.set(
            Math.cos(curAng) * curRad,
            ob.startY + (centerY - ob.startY) * suckP,
            Math.sin(curAng) * curRad
          );
          ob.mesh.material.opacity = 0.95;
        });
      } else {
        const expP = (p - 0.72) / 0.28;
        bh.scale.setScalar(Math.max(0.01, (1 - expP) * 1.35));
        disk1.scale.setScalar(1.35 + expP * 2.2);
        disk2.scale.setScalar(1.35 + expP * 2.5);
        disk1.material.opacity = Math.max(0, (1 - expP) * 0.95);
        disk2.material.opacity = Math.max(0, (1 - expP) * 0.9);

        novaRing.material.opacity = Math.max(0, (1 - expP) * 0.98);
        novaRing.scale.setScalar(1 + expP * 4.5);
        pulledOrbs.forEach(ob => { ob.mesh.material.opacity = 0; });
      }
    };
  };

  // =========================================================
  // 15. ☠️ 呪詛・魔界瘴気魔法
  // =========================================================
  V9.EFFECT_BUILDERS.poison = function (root, info, scale) {
    const tier = info.tier;
    const c1 = info.theme.c1;
    const c2 = info.theme.c2;
    const c3 = info.theme.c3;
    const areaRadius = (2.1 + tier * 0.7) * scale;

    const magicRings = [];
    addMagicCircleBase(root, areaRadius, c1, c2, tier, magicRings);

    const curseChains = [];
    for (let i = 0; i < 2 + tier; i++) {
      const ch = new THREE.Mesh(
        new THREE.TorusGeometry((1.1 + i * 0.38) * scale, 0.08 * scale, 8, 28),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? c1 : c3, transparent: true, opacity: 0.9 })
      );
      ch.position.y = (1.1 + i * 0.45) * scale;
      ch.rotation.set(Math.PI * 0.35, i * 0.7, 0);
      root.add(ch);
      curseChains.push({ mesh: ch, spd: (i % 2 === 0 ? 4 : -4) });
    }

    const bubbles = [];
    const bCnt = 14 + tier * 6;
    for (let i = 0; i < bCnt; i++) {
      const ang = (Math.PI * 2 * i) / bCnt;
      const rad = (0.4 + (i % 4) * 0.48) * scale;
      const bb = new THREE.Mesh(
        new THREE.SphereGeometry((0.22 + (i % 3) * 0.11) * scale, 14, 14),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? c2 : c1, transparent: true, opacity: 0.88 })
      );
      bb.position.set(Math.cos(ang) * rad, 0.2, Math.sin(ang) * rad);
      root.add(bb);
      bubbles.push({ mesh: bb, ang, rad, spd: 2.2 + (i % 4) * 0.75 });
    }

    return (p, elapsed) => {
      const fade = p > 0.72 ? Math.max(0, 1 - (p - 0.72) / 0.28) : 1;
      magicRings.forEach(r => {
        r.mesh.rotation.z = elapsed * r.speed;
        r.mesh.material.opacity = fade * 0.92;
      });
      curseChains.forEach(ch => {
        ch.mesh.rotation.z = elapsed * ch.spd;
        ch.mesh.material.opacity = fade * 0.9;
      });
      bubbles.forEach((bb, idx) => {
        bb.mesh.position.y = 0.2 + p * bb.spd * scale;
        bb.mesh.position.x = Math.cos(bb.ang + elapsed * 2.2) * bb.rad;
        bb.mesh.position.z = Math.sin(bb.ang + elapsed * 2.2) * bb.rad;
        bb.mesh.scale.setScalar(1 + Math.sin(elapsed * 9 + idx) * 0.28);
        bb.mesh.material.opacity = fade * 0.88;
      });
    };
  };

  // =========================================================
  // 16. 🌟 星屑・銀河流星魔法
  // =========================================================
  V9.EFFECT_BUILDERS.star = function (root, info, scale) {
    const tier = info.tier;
    const c1 = info.theme.c1;
    const c2 = info.theme.c2;
    const c3 = info.theme.c3;
    const areaRadius = (2.2 + tier * 0.75) * scale;

    const magicRings = [];
    addMagicCircleBase(root, areaRadius, c1, c2, tier, magicRings);

    const comets = [];
    const cCnt = 6 + tier * 4;
    for (let i = 0; i < cCnt; i++) {
      const ang = (Math.PI * 2 * i) / cCnt;
      const rad = (0.4 + (i % 3) * 0.65) * scale;
      const star = new THREE.Mesh(
        new THREE.OctahedronGeometry((0.34 + (i % 2) * 0.12) * scale, 0),
        new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? c1 : (i % 3 === 1 ? c2 : c3), transparent: true, opacity: 0.96 })
      );
      const startY = (6.8 + (i % 4) * 1.4) * scale;
      star.position.set(Math.cos(ang) * rad, startY, Math.sin(ang) * rad);
      root.add(star);
      comets.push({ mesh: star, startY, delay: (i % 5) * 0.07 });
    }

    return (p, elapsed) => {
      const fade = p > 0.72 ? Math.max(0, 1 - (p - 0.72) / 0.28) : 1;
      magicRings.forEach(r => {
        r.mesh.rotation.z = elapsed * r.speed * 1.4;
        r.mesh.material.opacity = fade * 0.92;
      });
      comets.forEach(cm => {
        const lp = Math.max(0, Math.min(1, (p - cm.delay) / 0.5));
        cm.mesh.position.y = Math.max(0.25, cm.startY * (1 - lp * lp));
        cm.mesh.rotation.set(elapsed * 8, elapsed * 10, 0);
        cm.mesh.material.opacity = fade * 0.96;
      });
    };
  };

  // =========================================================
  // 17. 🗡️ 秘剣・無限光剣陣
  // =========================================================
  V9.EFFECT_BUILDERS.sword = function (root, info, scale) {
    const tier = info.tier;
    const c1 = info.theme.c1;
    const c2 = info.theme.c2;
    const c3 = info.theme.c3;
    const areaRadius = (2.2 + tier * 0.75) * scale;

    const magicRings = [];
    addMagicCircleBase(root, areaRadius, c1, c2, tier, magicRings);

    const swords = [];
    const sCount = 8 + tier * 6 + (tier === 3 ? 2 : 0);
    for (let s = 0; s < sCount; s++) {
      const ringLayer = s < sCount * 0.5 ? 0 : 1;
      const ang = (Math.PI * 2 * s) / (sCount * 0.5) + ringLayer * 0.25;
      const rad = areaRadius * (ringLayer === 0 ? 0.65 : 1.05);

      const swordGrp = new THREE.Group();
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(0.14 * scale, 2.4 * scale, 0.05 * scale),
        new THREE.MeshBasicMaterial({ color: s % 3 === 0 ? c1 : (s % 3 === 1 ? c2 : c3), transparent: true, opacity: 0.96 })
      );
      const guard = new THREE.Mesh(
        new THREE.BoxGeometry(0.45 * scale, 0.10 * scale, 0.12 * scale),
        new THREE.MeshBasicMaterial({ color: c3, transparent: true, opacity: 0.96 })
      );
      guard.position.y = 0.85 * scale;
      swordGrp.add(blade);
      swordGrp.add(guard);

      const startY = (3.4 + ringLayer * 1.1) * scale;
      swordGrp.position.set(Math.cos(ang) * rad, startY, Math.sin(ang) * rad);
      swordGrp.rotation.z = -Math.cos(ang) * 0.42;
      swordGrp.rotation.x = Math.sin(ang) * 0.42;
      root.add(swordGrp);
      swords.push({ grp: swordGrp, bladeMat: blade.material, guardMat: guard.material, ang, rad, startY });
    }

    const crossA = new THREE.Mesh(
      new THREE.RingGeometry(0.4 * scale, 2.2 * scale, 24, 1, -Math.PI * 0.5, Math.PI),
      new THREE.MeshBasicMaterial({ color: c1, side: THREE.DoubleSide, transparent: true, opacity: 0 })
    );
    crossA.position.y = 1.2 * scale;
    crossA.rotation.z = 0.78;
    root.add(crossA);

    const crossB = new THREE.Mesh(
      new THREE.RingGeometry(0.4 * scale, 2.2 * scale, 24, 1, -Math.PI * 0.5, Math.PI),
      new THREE.MeshBasicMaterial({ color: c2, side: THREE.DoubleSide, transparent: true, opacity: 0 })
    );
    crossB.position.y = 1.2 * scale;
    crossB.rotation.z = -0.78;
    root.add(crossB);

    return (p, elapsed) => {
      const fade = p > 0.74 ? Math.max(0, 1 - (p - 0.74) / 0.26) : 1;
      magicRings.forEach(r => {
        r.mesh.rotation.z = elapsed * r.speed;
        r.mesh.material.opacity = fade * 0.92;
      });

      const diveT = Math.max(0, Math.min(1, (p - 0.16) / 0.28));
      const easeDive = diveT * diveT;
      swords.forEach(sw => {
        const curRad = sw.rad * (1 - easeDive * 0.68);
        sw.grp.position.set(
          Math.cos(sw.ang + elapsed * 1.2) * curRad,
          sw.startY * (1 - easeDive * 0.72) + 0.5 * scale,
          Math.sin(sw.ang + elapsed * 1.2) * curRad
        );
        sw.bladeMat.opacity = fade * 0.96;
        sw.guardMat.opacity = fade * 0.96;
      });

      if (p >= 0.4) {
        const cp = Math.min(1, (p - 0.4) / 0.45);
        const cOp = Math.sin(cp * Math.PI) * 0.95;
        crossA.material.opacity = cOp;
        crossB.material.opacity = cOp;
        crossA.scale.setScalar(1 + cp * 1.4);
        crossB.scale.setScalar(1 + cp * 1.4);
      }
    };
  };

  // =========================================================
  // 18. 統合実行エンジン（防御・聖域・治癒・前方斬撃は術者中心、攻撃系は敵中心）
  // =========================================================
  function executeFullMagic3D(game, entity, info) {
    if (!game?.useWebGL || !game?.scene || !entity?.pos || typeof THREE === 'undefined') return;

    const tier = info?.tier ?? 0;
    const attrId = info?.theme?.id || 'sword';
    const c1 = info?.theme?.c1 ?? 0x38bdf8;
    const c2 = info?.theme?.c2 ?? 0xf472b6;
    const c3 = info?.theme?.c3 ?? 0xfde047;
    const scale = 1.25 + tier * 0.45;
    const duration = 1.35 + tier * 0.25;

    if (attrId === 'aurora_sanctuary' && typeof V9.spawnAuroraSanctuaryField === 'function') {
      V9.spawnAuroraSanctuaryField(game, entity, info);
    }

    V9.spawnCasterChantAura(game, entity, info);

    const isSelfCentered = (
      attrId === 'aegis_shield' ||
      attrId === 'aurora_sanctuary' ||
      attrId === 'holy_heal' ||
      attrId === 'slash_crescent'
    );

    let targetX = entity.pos.x;
    let targetZ = entity.pos.z;

    if (!isSelfCentered) {
      targetX = entity.pos.x + Math.sin(entity.rotY || 0) * 3.0;
      targetZ = entity.pos.z + Math.cos(entity.rotY || 0) * 3.0;
      if (Array.isArray(game.monsters)) {
        let bestDist = 16;
        game.monsters.forEach(m => {
          if (!m || m.dead || !m.pos) return;
          const dist = Math.hypot(m.pos.x - entity.pos.x, m.pos.z - entity.pos.z);
          if (dist < bestDist) {
            bestDist = dist;
            targetX = m.pos.x;
            targetZ = m.pos.z;
          }
        });
      }
    }

    const root = new THREE.Group();
    root.position.set(targetX, 0, targetZ);
    if (attrId === 'slash_crescent' || attrId === 'aegis_shield') {
      root.rotation.y = entity.rotY || 0;
    }

    const halos = [];
    if (tier >= 1 && attrId !== 'aegis_shield' && attrId !== 'aurora_sanctuary') {
      for (let h = 0; h < tier + 1; h++) {
        const halo = new THREE.Mesh(
          new THREE.TorusGeometry((1.4 + h * 0.38) * scale, 0.085, 10, 32),
          new THREE.MeshBasicMaterial({ color: h % 2 === 0 ? c2 : c3, transparent: true, opacity: 0.9 })
        );
        halo.position.y = 1.55 + h * 0.35;
        halo.rotation.set(Math.PI * (0.3 + h * 0.2), h * 0.8, h * 0.5);
        root.add(halo);
        halos.push({ mesh: halo, rx: 1.8 + h * 0.5, ry: -2.2 - h * 0.4 });
      }
    }

    const builder = V9.EFFECT_BUILDERS[attrId] || V9.EFFECT_BUILDERS.sword;
    const attrTick = builder(root, info, scale);

    const sparks = [];
    const sparkCount = 14 + tier * 6;
    const rainbow = [0xf472b6, 0x38bdf8, 0xfde047, 0x34d399, 0xa855f7, 0xf97316];
    for (let i = 0; i < sparkCount; i++) {
      const ang = (Math.PI * 2 * i) / sparkCount;
      const col = tier >= 3 ? rainbow[i % rainbow.length] : (i % 3 === 0 ? c1 : (i % 3 === 1 ? c2 : c3));
      const sp = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.20 + tier * 0.04, 0),
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.95 })
      );
      sp.position.set(0, 0.8 + (i % 4) * 0.3, 0);
      root.add(sp);
      sparks.push({
        mesh: sp,
        vx: Math.cos(ang) * (3.2 + (i % 3) * 1.3) * scale,
        vy: (2.6 + (i % 4) * 1.0) * scale,
        vz: Math.sin(ang) * (3.2 + (i % 3) * 1.3) * scale,
        startY: 0.8 + (i % 4) * 0.3
      });
    }

    V9.register3DAnimation(game.scene, root, duration, (p, elapsed, dt) => {
      if (attrId === 'aegis_shield' && entity?.pos) {
        root.position.set(entity.pos.x, 0, entity.pos.z);
      }

      halos.forEach(h => {
        h.mesh.rotation.x += dt * h.rx;
        h.mesh.rotation.y += dt * h.ry;
        if (p > 0.75) h.mesh.material.opacity = Math.max(0, (1 - (p - 0.75) / 0.25) * 0.9);
      });

      sparks.forEach(sp => {
        sp.mesh.position.x = sp.vx * p;
        sp.mesh.position.z = sp.vz * p;
        sp.mesh.position.y = Math.max(0.1, sp.startY + sp.vy * p - 3.8 * p * p);
        sp.mesh.rotation.set(elapsed * 6, elapsed * 5, 0);
        sp.mesh.material.opacity = Math.max(0, 1 - p * 1.15);
      });

      if (attrTick) attrTick(p, elapsed, dt);
    });

    if (!isSelfCentered && game?.pet?.pos) {
      const px = game.pet.pos.x, pz = game.pet.pos.z;
      const pGrp = new THREE.Group();
      const orb = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.96 })
      );
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.48, 0.08, 8, 24),
        new THREE.MeshBasicMaterial({ color: c3, transparent: true, opacity: 0.92 })
      );
      orb.add(ring);
      pGrp.add(orb);
      V9.register3DAnimation(game.scene, pGrp, 0.42, (p, elapsed) => {
        orb.position.set(px + (targetX - px) * p, 0.8 + Math.sin(p * Math.PI) * 1.4, pz + (targetZ - pz) * p);
        ring.rotation.set(elapsed * 12, elapsed * 10, 0);
        if (p > 0.75) {
          orb.scale.setScalar(1 + ((p - 0.75) / 0.25) * 2.2);
          orb.material.opacity = Math.max(0, 1 - (p - 0.75) / 0.25);
        }
      });
    }

    if (typeof game.shakeTimer === 'number') {
      game.shakeTimer = Math.max(game.shakeTimer, 0.26 + tier * 0.09);
    }
  }

  V9.castSkillEffect = function (game, slotIdx = 0) {
    const info = V9.getSkillInfo(game, slotIdx);
    executeFullMagic3D(game, game?.player, info);
    V9.showSpellCardCutin(game, info);
  };

  V9.previewSkillByObj = function (game, skillObj, tier = 0) {
    const baseInfo = V9.getSkillInfo(game, skillObj);
    const lvMap = [1, 10, 50, 100];
    const tierLabels = ['通常魔法', '✨ 魔法進化Ⅰ【真】', '🔥 魔法進化Ⅱ【極】', '🌈 魔法最終進化【神話スペルカード】'];
    const simLv = lvMap[tier] || 1;
    const simMp = (baseInfo.origMp * 5) + (simLv - 1) * 10;
    const info = {
      ...baseInfo,
      skillLv: simLv,
      mpCost: simMp,
      tier,
      tierLabel: tierLabels[tier] || tierLabels[0],
      evolvedName: baseInfo.theme.names(baseInfo.origName)[tier] || baseInfo.origName
    };
    executeFullMagic3D(game, game?.player, info);
    V9.showSpellCardCutin(game, info);
  };

  // =========================================================
  // 19. 武器種別 × 武器グレード（6段階）の超豪華・水平横振り攻撃エフェクト！
  // =========================================================
  function getEquippedWeaponProfileV9(game, entity) {
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

    // 武器グレード（0〜5の6段階）をレア度・一覧順位・強化値(+)から自動算出
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

    // 武器強化値（+値）や武器レベルがあればグレード底上げ
    const plusLv = Number(d.weaponPlus ?? d.weaponEnhance ?? wpnObj?.plus ?? wpnObj?.lv ?? 0);
    if (plusLv >= 50) grade = 5;
    else if (plusLv >= 30) grade = Math.max(grade, 4);
    else if (plusLv >= 15) grade = Math.max(grade, 3);
    else if (plusLv >= 5) grade = Math.max(grade, 2);

    // 武器種別ごとのカラー＆モチーフ決定
    let style = { c1: 0x38bdf8, c2: 0xe0f2fe, c3: 0x7dd3fc, shape: 'octa' };
    if (/炎|火|紅蓮|ブレイズ|フレア|イフリート|太陽|fire|flame|blaze/i.test(search)) {
      style = { c1: 0xef4444, c2: 0xfacc15, c3: 0xf97316, shape: 'tetra' };
    } else if (/氷|吹雪|零度|アイス|フロスト|コキュートス|ice|frost|freeze/i.test(search)) {
      style = { c1: 0x38bdf8, c2: 0xffffff, c3: 0x818cf8, shape: 'octa' };
    } else if (/雷|電|サンダー|紫電|ライトニング|インドラ|thunder|volt|lightning/i.test(search)) {
      style = { c1: 0xfacc15, c2: 0xa855f7, c3: 0x38bdf8, shape: 'tetra' };
    } else if (/風|嵐|疾風|翠嵐|ウィンド|テンペスト|wind|storm/i.test(search)) {
      style = { c1: 0x34d399, c2: 0xa7f3d0, c3: 0xfde047, shape: 'octa' };
    } else if (/聖|光|黄金|パラディン|エクスカリバー|天照|holy|light|gold/i.test(search)) {
      style = { c1: 0xfde047, c2: 0xffffff, c3: 0xf59e0b, shape: 'octa' };
    } else if (/闇|黒|ダーク|アビス|虚空|ラグナロク|魔剣|dark|void|abyss/i.test(search)) {
      style = { c1: 0x9333ea, c2: 0xf43f5e, c3: 0x38bdf8, shape: 'dodeca' };
    } else if (/竜|ドラゴン|ドラグーン|dragon/i.test(search)) {
      style = { c1: 0xdc2626, c2: 0xfde047, c3: 0xf97316, shape: 'tetra' };
    } else if (grade >= 5) {
      style = { c1: 0xf472b6, c2: 0xfde047, c3: 0x38bdf8, shape: 'octa' };
    }

    return { wName, grade, style };
  }

  function spawnWeaponHorizontalSlashV9(game, entity) {
    if (!game?.useWebGL || !game?.scene || !entity?.pos || typeof THREE === 'undefined') return;

    const { grade, style } = getEquippedWeaponProfileV9(game, entity);
    const { c1, c2, c3, shape } = style;
    const rotY = entity.rotY || 0;
    const dirX = Math.sin(rotY);
    const dirZ = Math.cos(rotY);

    // グレードに応じたスケール＆多重度（グレード0〜5）
    const sc = 1.0 + grade * 0.24;
    const slashLayers = 1 + grade; // 1重〜6重の水平斬撃アーク
    const rainbowCols = [0xf472b6, 0x38bdf8, 0xfde047, 0x34d399, 0xa855f7, 0xf97316];

    const root = new THREE.Group();
    root.position.set(entity.pos.x, 0, entity.pos.z);
    root.rotation.y = rotY;

    // 1. 剣の横振りに連動して右から左へ薙ぎ払う水平扇形スラッシュ群
    const arcs = [];
    for (let i = 0; i < slashLayers; i++) {
      const col = grade >= 5 ? rainbowCols[i % rainbowCols.length] : (i % 3 === 0 ? c1 : (i % 3 === 1 ? c2 : c3));
      const rIn = (0.85 + i * 0.22) * sc;
      const rOut = (1.75 + i * 0.32) * sc;
      const arcSpan = Math.PI * (0.72 + Math.min(0.45, grade * 0.08));
      const mat = new THREE.MeshBasicMaterial({
        color: col,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.96
      });
      const mesh = new THREE.Mesh(
        new THREE.RingGeometry(rIn, rOut, 32, 1, -arcSpan * 0.5, arcSpan),
        mat
      );
      // 水平横振りになるようX軸をほぼ90度倒す（わずかにロール傾きをつけて立体感を演出）
      mesh.rotation.x = -Math.PI * 0.48 + (i % 2 === 0 ? 0.06 : -0.06);
      mesh.position.set(0, (1.02 + i * 0.08) * Math.min(1.35, sc), 0.35 * sc);
      root.add(mesh);
      arcs.push({ mesh, mat, idx: i });
    }

    // 2. グレード2以上：前方へ直進する三日月型の飛翔剣気ウェーブ
    const flyingWaves = [];
    if (grade >= 2) {
      const waveCnt = grade >= 4 ? 2 : 1;
      for (let w = 0; w < waveCnt; w++) {
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
        wave.position.set(0, (1.1 + w * 0.18), (1.2 + w * 0.4) * sc);
        root.add(wave);
        flyingWaves.push({ mesh: wave, mat: wMat, baseZ: (1.2 + w * 0.4) * sc });
      }
    }

    // 3. グレード3以上：足元から広がる地面衝撃波リング
    let groundRing = null;
    if (grade >= 3) {
      const gMat = new THREE.MeshBasicMaterial({
        color: c1,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.88
      });
      groundRing = new THREE.Mesh(new THREE.RingGeometry(0.65 * sc, 1.55 * sc, 32), gMat);
      groundRing.rotation.x = -Math.PI / 2;
      groundRing.position.set(0, 0.09, 0.9 * sc);
      root.add(groundRing);
    }

    // 4. グレード4以上：斜め交差する追加X字斬撃閃光
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
          new THREE.RingGeometry(0.95 * sc, 1.85 * sc, 24, 1, -Math.PI * 0.35, Math.PI * 0.7),
          cMat
        );
        cb.rotation.x = -Math.PI * 0.32;
        cb.rotation.y = (c === 0 ? 0.35 : -0.35);
        cb.position.set(0, 1.25, 1.15 * sc);
        root.add(cb);
        crossBlades.push({ mesh: cb, mat: cMat });
      }
    }

    // 5. グレード5（LR・神話級）：連動して飛ぶ光剣ビット
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
        const bit = new THREE.Mesh(new THREE.BoxGeometry(0.14 * sc, 0.08 * sc, 1.8 * sc), sMat);
        bit.position.set(side * (1.2 + lane * 0.7) * sc, 1.15 + lane * 0.2, 0.6);
        root.add(bit);
        spiritSwords.push({ mesh: bit, mat: sMat });
      }
    }

    // 6. 武器属性パーティクル飛散（グレード1以上で発生、グレードが上がるほど増量）
    const particles = [];
    const pCnt = grade === 0 ? 4 : (8 + grade * 5);
    for (let i = 0; i < pCnt; i++) {
      const ang = -Math.PI * 0.45 + (Math.PI * 0.9 * i) / Math.max(1, pCnt - 1);
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
        vy: (1.2 + (i % 3) * 0.7),
        vz: Math.cos(ang) * (3.2 + (i % 3) * 1.0) * sc,
        sx: Math.sin(ang) * 1.1 * sc,
        sz: Math.cos(ang) * 1.1 * sc
      });
    }

    const duration = 0.34 + grade * 0.035;
    V9.register3DAnimation(game.scene, root, duration, (p, elapsed) => {
      // 術者の移動に追従
      if (entity?.pos) {
        root.position.set(entity.pos.x, 0, entity.pos.z);
      }

      // 横振り軌道（右から左へ高速スウィープ）
      const sweepZ = -1.1 + Math.sin(Math.min(1, p * 1.35) * Math.PI * 0.5) * 2.2;
      arcs.forEach(a => {
        a.mesh.rotation.z = sweepZ - a.idx * 0.14;
        a.mesh.scale.setScalar(1 + p * (0.28 + grade * 0.05));
        a.mat.opacity = Math.max(0, (1 - p) * 0.96);
      });

      flyingWaves.forEach(fw => {
        fw.mesh.position.z = fw.baseZ + p * (4.5 + grade * 0.8) * sc;
        fw.mesh.scale.setScalar(1 + p * 0.35);
        fw.mat.opacity = Math.max(0, (1 - p) * 0.95);
      });

      if (groundRing) {
        groundRing.scale.setScalar(1 + p * (1.8 + grade * 0.35));
        groundRing.material.opacity = Math.max(0, (1 - p) * 0.88);
      }

      crossBlades.forEach(cb => {
        cb.mesh.scale.setScalar(1 + p * 0.45);
        cb.mat.opacity = Math.max(0, (1 - p) * 0.92);
      });

      spiritSwords.forEach(ss => {
        ss.mesh.position.z = 0.6 + p * 6.8 * sc;
        ss.mat.opacity = Math.max(0, (1 - p) * 0.96);
      });

      particles.forEach(pt => {
        pt.mesh.position.x = pt.sx + pt.vx * p;
        pt.mesh.position.z = pt.sz + pt.vz * p;
        pt.mesh.position.y = Math.max(0.1, 1.05 + pt.vy * p - 2.6 * p * p);
        pt.mesh.rotation.set(elapsed * 9, elapsed * 7, 0);
        pt.mat.opacity = Math.max(0, (1 - p) * 0.95);
      });
    });

    // 高グレード武器（SSR以上）の攻撃時は気持ちいいカメラ微振動を付与
    if (grade >= 3 && entity === game.player && typeof game.shakeTimer === 'number') {
      game.shakeTimer = Math.max(game.shakeTimer, 0.08 + (grade - 3) * 0.05);
    }
  }

  function hookGameV9() {
    if (typeof KaomojiMMORPG === 'undefined') {
      setTimeout(hookGameV9, 100);
      return;
    }
    const P = KaomojiMMORPG.prototype;
    if (P._v9Hooked) return;
    P._v9Hooked = true;

    const origVis = P.triggerAttackVisual;
    P.triggerAttackVisual = function (entity, isSkill = false, skillInfo = null) {
      if (!isSkill && entity) {
        entity.attackAnimTimer = 0.36;
        entity.attackIsSkill = false;
        spawnWeaponHorizontalSlashV9(this, entity);
        return;
      }
      if (typeof origVis === 'function') {
        return origVis.call(this, entity, isSkill, skillInfo);
      }
    };

    if (typeof P.syncSkillDescriptionsAndEffects === 'function') {
      const origSync = P.syncSkillDescriptionsAndEffects;
      P.syncSkillDescriptionsAndEffects = function () {
        V9.syncAllSkills(this);
        origSync.call(this);
        V9.syncAllSkills(this);
      };
    }

    setTimeout(() => {
      if (window.game) {
        V9.syncAllSkills(window.game);
        window.game.showAlertBanner?.('✨ MP上限成長＆自動回復・魔法系クラス削除・武器別＆グレード別横振り斬撃完了！', 2600);
      }
    }, 350);
  }

  hookGameV9();
})();
// ▲▲▲ ここまで【スキルエフェクト専用 game9.js 3/3】 ▲▲▲
