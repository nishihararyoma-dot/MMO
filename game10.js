// ▼▼▼ ここから game10.js（5点一括修復パッチ） ▼▼▼
(() => {
  'use strict';

  function getInst() {
    return window.__kmjInstance || window.game || window.app || window.mmorpg || window.gameInstance || null;
  }

  // =========================================================
  // 1. 消えないピンクの丸いワイヤーフレーム球体を除去
  // =========================================================
  function cleanLingeringWireframeSpheresV10(inst) {
    const scene = inst?.scene;
    if (!scene || typeof scene.traverse !== 'function') return;

    const toRemove = [];
    scene.traverse((obj) => {
      if (!obj || obj === scene) return;

      // ワイヤーフレーム表示の球体・半球メッシュを検出
      if (obj.isMesh && obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        const isWire = mats.some(m => m && m.wireframe === true);
        const geoType = String(obj.geometry?.type || '');
        const objName = String(obj.name || '').toLowerCase();

        if (isWire && (/Sphere|Icosahedron|Dodecahedron|Octahedron/i.test(geoType) || /range|debug|hitbox|aura|sphere|dome|field/i.test(objName))) {
          toRemove.push(obj);
          return;
        }
      }

      // LineSegments / LineLoop で作られた球状デバッグ枠を検出
      if ((obj.isLineSegments || obj.isLine || obj.isLineLoop) && /range|debug|hitbox|sphere|dome|field/i.test(String(obj.name || ''))) {
        toRemove.push(obj);
      }
    });

    toRemove.forEach(obj => {
      obj.visible = false;
      if (obj.parent) obj.parent.remove(obj);
    });
  }

  // =========================================================
  // 2. 剣（武器）が2本になる重複描画の修復（手持ち1本だけ残す）
  // =========================================================
  function fixDuplicateWeaponsV10(inst) {
    const p = inst?.player;
    if (!p) return;

    ['leftWeapon', 'subWeapon', 'offhand', 'offHand', 'secondWeapon', 'weapon2', 'sword2', 'backWeapon', 'backSword'].forEach(key => {
      if (p[key] && typeof p[key] === 'object') {
        p[key].visible = false;
      }
    });

    const root = p.mesh || p.grp || p.group || p.model || p.container;
    if (!root || typeof root.traverse !== 'function') return;

    const primaryWeapon = p.weaponMesh || p.swordMesh || p.staffMesh || p.weapon || p.rightWeapon || null;
    const weaponGroups = [];

    root.traverse((obj) => {
      if (!obj || obj === root) return;
      const name = String(obj.name || '').toLowerCase();
      const isWeaponName = /(weapon|sword|blade|staff|wand|katana|axe|spear|dagger|club)/.test(name);
      const isPrimary = Boolean(primaryWeapon && obj === primaryWeapon);

      if (isWeaponName || isPrimary) {
        let hasWeaponAncestor = false;
        let cur = obj.parent;
        while (cur && cur !== root) {
          const pName = String(cur.name || '').toLowerCase();
          if (/(weapon|sword|blade|staff|wand|katana|axe|spear)/.test(pName) || cur === primaryWeapon) {
            hasWeaponAncestor = true;
            break;
          }
          cur = cur.parent;
        }
        if (!hasWeaponAncestor) {
          weaponGroups.push({ obj, isPrimary });
        }
      }
    });

    if (weaponGroups.length >= 2) {
      let keptObj = null;
      const pri = weaponGroups.find(w => w.isPrimary);
      if (pri) {
        keptObj = pri.obj;
      } else {
        // 座標がより前方・右側にある（手に持っている）方を優先して1本残す
        weaponGroups.sort((a, b) => (b.obj.position.z - a.obj.position.z) || (a.obj.position.x - b.obj.position.x));
        keptObj = weaponGroups[0].obj;
      }
      weaponGroups.forEach(w => {
        w.obj.visible = (w.obj === keptObj);
      });
    }

    // 無名の剣パーツが背中と手に2本存在する場合の検出
    const bladeCandidates = [];
    root.traverse((obj) => {
      if (!obj.isMesh || !obj.visible) return;
      const g = obj.geometry?.parameters;
      if (!g) return;
      const h = Number(g.height || g.length || 0);
      const w = Number(g.width || g.radiusTop || 0);
      if (h >= 0.8 && w > 0 && w <= 0.25) {
        bladeCandidates.push(obj);
      }
    });
    if (bladeCandidates.length >= 2) {
      // 1本目（手持ち側）を残し、2本目以降（背中側）を非表示
      for (let i = 1; i < bladeCandidates.length; i++) {
        let target = bladeCandidates[i];
        while (target.parent && target.parent !== root && target.parent.children.length <= 4) {
          target = target.parent;
        }
        target.visible = false;
      }
    }
  }

  // =========================================================
  // 3. 右上の歯車ボタンが押せるように3つのUIを綺麗に整列
  // =========================================================
  function arrangeTopRightHudV10() {
    // 歯車ボタン（⚙️）を探して最前面・タップ可能にする
    const allBtns = Array.from(document.querySelectorAll('button, div[role="button"], span'));
    const gearBtn = allBtns.find(el => {
      const t = (el.textContent || '').trim();
      const idCls = `${el.id || ''} ${el.className || ''}`.toLowerCase();
      return (t === '⚙️' || t === '⚙' || /gear|setting|config/.test(idCls)) && el.getBoundingClientRect().width > 0;
    });
    if (gearBtn) {
      gearBtn.style.zIndex = '1200';
      gearBtn.style.pointerEvents = 'auto';
      const parentBox = gearBtn.parentElement;
      if (parentBox && parentBox !== document.body) {
        parentBox.style.zIndex = '1190';
        parentBox.style.pointerEvents = 'auto';
      }
    }

    // 1つ目：オンライン/オフラインピル（歯車ボタンの左側に配置）
    const onlinePill = document.getElementById('kmj-v45-online-pill');
    if (onlinePill) {
      onlinePill.style.top = '8px';
      onlinePill.style.right = '115px';
      onlinePill.style.zIndex = '950';
      onlinePill.style.fontSize = '10px';
      onlinePill.style.padding = '3px 8px';
    }

    // 2つ目：脅威ランク調整バー（歯車ボタンの下に配置）
    document.querySelectorAll('div').forEach(div => {
      if (div.children.length === 0 || div.offsetHeight > 60) return;
      const txt = div.textContent || '';
      if (txt.includes('脅威') && txt.includes('-10') && txt.includes('+10')) {
        const rect = div.getBoundingClientRect();
        if (rect.top < 70 && rect.right > window.innerWidth * 0.5) {
          div.style.top = '46px';
          div.style.right = '10px';
          div.style.zIndex = '940';
          div.style.transform = 'scale(0.92)';
          div.style.transformOrigin = 'top right';
        }
      }
    });

    // 3つ目：DEBUG / スキルスタジオボタン（脅威ランクバーのさらに下に配置）
    const debugHud = document.getElementById('kmj-v7-debug-hud');
    if (debugHud) {
      debugHud.style.top = '82px';
      debugHud.style.right = '10px';
      debugHud.style.zIndex = '945';
    }
  }

  // =========================================================
  // 4. 通常攻撃エフェクトの発生＆アニメーション駆動の保証
  // =========================================================
  let _lastAtkFxTimeV10 = 0;

  function triggerSafeBasicAttackFxV10(inst) {
    if (!inst || !inst.player) return;
    const now = performance.now();
    if (now - _lastAtkFxTimeV10 < 180) return;
    _lastAtkFxTimeV10 = now;

    if (typeof inst.spawnClassBasicAttackEffectV45 === 'function') {
      inst.spawnClassBasicAttackEffectV45(inst.player, true);
    } else if (typeof inst.triggerAttackVisual === 'function') {
      inst.triggerAttackVisual(inst.player, false);
    }
  }

  function updateAttackEffectsV10(inst, dt) {
    if (!inst || !inst.scene) return;
    const safeDt = Math.min(0.1, Math.max(0.001, Number(dt) || 0.016));

    // 斬撃エフェクト（_slashEffects）のアニメーション＆自動消滅
    if (Array.isArray(inst._slashEffects)) {
      for (let i = inst._slashEffects.length - 1; i >= 0; i--) {
        const ef = inst._slashEffects[i];
        if (!ef || !ef.mesh) {
          inst._slashEffects.splice(i, 1);
          continue;
        }
        // 別処理で既に更新済みかチェック
        if (ef._v10UpdatedFrame === inst._v10FrameId) continue;
        ef._v10UpdatedFrame = inst._v10FrameId;

        ef.life -= safeDt;
        if (ef.life <= 0) {
          inst.scene.remove(ef.mesh);
          inst._slashEffects.splice(i, 1);
          continue;
        }
        ef.mesh.position.x += (ef.vx || 0) * safeDt;
        ef.mesh.position.z += (ef.vz || 0) * safeDt;
        if (ef.vy) {
          ef.mesh.position.y += ef.vy * safeDt;
          ef.vy -= 9.8 * safeDt;
        }
        const ratio = Math.max(0, ef.life / (ef.maxLife || 0.4));
        if (ef.kind === 'slash') {
          const s = 1.0 + (1.0 - ratio) * 0.45;
          ef.mesh.scale.set(s, s, s);
          if (ef.mat) ef.mat.opacity = ratio;
        } else {
          ef.mesh.rotation.y += 8 * safeDt;
          ef.mesh.scale.setScalar(ratio);
        }
      }
    }

    // 杖クラス通常魔法弾（_v22MagicShots）の移動＆命中＆自動消滅
    if (Array.isArray(inst._v22MagicShots)) {
      for (let i = inst._v22MagicShots.length - 1; i >= 0; i--) {
        const sh = inst._v22MagicShots[i];
        if (!sh || !sh.grp) {
          inst._v22MagicShots.splice(i, 1);
          continue;
        }
        if (sh._v10UpdatedFrame === inst._v10FrameId) continue;
        sh._v10UpdatedFrame = inst._v10FrameId;

        sh.life -= safeDt;
        if (sh.life <= 0) {
          inst.scene.remove(sh.grp);
          inst._v22MagicShots.splice(i, 1);
          continue;
        }
        sh.grp.position.x += (sh.vx || 0) * safeDt;
        sh.grp.position.z += (sh.vz || 0) * safeDt;
        if (sh.aura) sh.aura.rotation.y += 7 * safeDt;
        if (sh.ring) sh.ring.rotation.z += 9 * safeDt;

        // 敵への命中判定
        if (!sh.hitDone && Array.isArray(inst.monsters)) {
          for (const m of inst.monsters) {
            if (!m || m.dead || !m.pos) continue;
            const d = Math.hypot(m.pos.x - sh.grp.position.x, m.pos.z - sh.grp.position.z);
            if (d <= 1.6) {
              sh.hitDone = true;
              sh.life = Math.min(sh.life, 0.05);
              if (sh.isLocal && typeof inst.applyMagicProjectileHitDamageV40 === 'function') {
                inst.applyMagicProjectileHitDamageV40(m, sh.magicDmg || 20);
              }
              break;
            }
          }
        }
      }
    }
  }

  // =========================================================
  // 5. メインループ＆UIイベントへの安全組み込み
  // =========================================================
  function installV10Patch() {
    if (typeof KaomojiMMORPG === 'undefined') {
      setTimeout(installV10Patch, 150);
      return;
    }

    const proto = KaomojiMMORPG.prototype;
    if (proto._v10PatchApplied) return;
    proto._v10PatchApplied = true;

    // 攻撃系メソッドが呼ばれたら確実にエフェクトを出す
    ['attack', 'basicAttack', 'playerAttack', 'doAttack', 'performAttack'].forEach(fn => {
      if (typeof proto[fn] === 'function' && !proto[`_v10_${fn}`]) {
        const orig = proto[fn];
        proto[fn] = function (...args) {
          const res = orig.apply(this, args);
          triggerSafeBasicAttackFxV10(this);
          return res;
        };
        proto[`_v10_${fn}`] = true;
      }
    });

    if (typeof proto.buildPlayerEntity === 'function' && !proto._v10BuildWrapped) {
      const origBuild = proto.buildPlayerEntity;
      proto.buildPlayerEntity = function (...args) {
        const res = origBuild.apply(this, args);
        fixDuplicateWeaponsV10(this);
        cleanLingeringWireframeSpheresV10(this);
        return res;
      };
      proto._v10BuildWrapped = true;
    }

    if (typeof proto.update === 'function' && !proto._v10UpdateWrapped) {
      const origUpdate = proto.update;
      proto.update = function (dt = 0.016, ...rest) {
        this._v10FrameId = (this._v10FrameId || 0) + 1;

        // タイトルが閉じていれば操作可能状態にする（カメラ位置は一切上書きしない）
        const titleEl = document.querySelector('#title-screen, #title-overlay, #start-screen, #login-screen, .title-overlay');
        if (!titleEl || titleEl.style.display === 'none' || titleEl.classList.contains('hidden')) {
          this.isPlaying = true;
          this.canMove = true;
          this.moveLocked = false;
          this.inputLocked = false;
        }

        const res = origUpdate.apply(this, [dt, ...rest]);

        fixDuplicateWeaponsV10(this);
        cleanLingeringWireframeSpheresV10(this);
        updateAttackEffectsV10(this, dt);

        if (!this._v10HudTimer || performance.now() - this._v10HudTimer > 600) {
          this._v10HudTimer = performance.now();
          arrangeTopRightHudV10();
        }

        return res;
      };
      proto._v10UpdateWrapped = true;
    }

    const inst = getInst();
    if (inst) {
      fixDuplicateWeaponsV10(inst);
      cleanLingeringWireframeSpheresV10(inst);
      arrangeTopRightHudV10();
    }
  }

  // 右下の「攻撃」ボタンタップ時にも確実にエフェクトを連動させる
  if (!window._v10AtkBtnBound) {
    window._v10AtkBtnBound = true;
    const handleAttackPress = (e) => {
      const btn = e.target?.closest?.('button, div[role="button"]');
      if (!btn) return;
      const txt = (btn.textContent || '').trim();
      const idCls = `${btn.id || ''} ${btn.className || ''}`.toLowerCase();
      if (txt === '攻撃' || /btn-attack|attack-btn|basic-attack/.test(idCls)) {
        const inst = getInst();
        if (inst) triggerSafeBasicAttackFxV10(inst);
      }
    };
    document.addEventListener('touchstart', handleAttackPress, { passive: true, capture: true });
    document.addEventListener('click', handleAttackPress, true);
  }

  installV10Patch();
  setTimeout(arrangeTopRightHudV10, 500);
})();
// ▲▲▲ ここまで game10.js ▲▲▲
