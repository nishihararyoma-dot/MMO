// ▼▼▼ ここから game10.js（移動復旧・剣1本化修復パッチ） ▼▼▼
(() => {
  'use strict';

  function getInst() {
    return window.__kmjInstance || window.game || window.app || window.mmorpg || window.gameInstance || null;
  }

  // =========================================================
  // 1. 剣（武器）が2つになる重複描画の自動修復（メイン1本だけ残す）
  // =========================================================
  function fixDuplicateWeaponsV10(inst) {
    const p = inst?.player;
    if (!p) return;

    // 左手・サブ武器プロパティが明示的にある場合は非表示化
    ['leftWeapon', 'subWeapon', 'offhand', 'offHand', 'secondWeapon', 'weapon2', 'sword2'].forEach(key => {
      if (p[key] && typeof p[key] === 'object') {
        p[key].visible = false;
      }
    });

    const root = p.mesh || p.grp || p.group || p.model || p.container;
    if (!root || typeof root.traverse !== 'function') return;

    const primaryWeapon = p.weaponMesh || p.swordMesh || p.staffMesh || p.weapon || p.rightWeapon || null;
    const weaponNodes = [];

    root.traverse((obj) => {
      if (!obj || obj === root) return;
      const name = String(obj.name || '').toLowerCase();
      const isNamedWeapon = /(weapon|sword|blade|staff|wand|katana|axe|spear|dagger|club)/.test(name);
      const isPrimary = (primaryWeapon && (obj === primaryWeapon || primaryWeapon.children?.includes(obj)));

      // 武器の親グループ単位で収集（子メッシュの重複カウントを防ぐ）
      if (isNamedWeapon || obj === primaryWeapon) {
        let parentIsWeapon = false;
        let cur = obj.parent;
        while (cur && cur !== root) {
          const pName = String(cur.name || '').toLowerCase();
          if (/(weapon|sword|blade|staff|wand|katana|axe|spear)/.test(pName) || cur === primaryWeapon) {
            parentIsWeapon = true;
            break;
          }
          cur = cur.parent;
        }
        if (!parentIsWeapon) {
          weaponNodes.push({ obj, isPrimary });
        }
      }
    });

    // 武器ノードが2つ以上ある場合、メイン1本だけ残して2本目以降を非表示にする
    if (weaponNodes.length >= 2) {
      let kept = false;
      // まず primaryWeapon に該当するものを優先して残す
      weaponNodes.forEach(item => {
        if (item.isPrimary && !kept) {
          item.obj.visible = true;
          kept = true;
        }
      });
      // primaryWeapon が見つからなかった場合は最初の1つだけ残す
      weaponNodes.forEach((item, idx) => {
        if (!kept && idx === 0) {
          item.obj.visible = true;
          kept = true;
        } else if (!item.isPrimary || weaponNodes.filter(w => w.isPrimary).length > 1) {
          if (kept && !(item.isPrimary && weaponNodes.indexOf(item) === weaponNodes.findIndex(w => w.isPrimary))) {
            item.obj.visible = false;
          }
        }
      });
    }

    // 名前が付いていない重複剣メッシュ対策（同じ親に細長い剣パーツが2本並んでいる場合）
    root.traverse((parent) => {
      if (!parent?.children || parent.children.length < 2) return;
      const swordLike = parent.children.filter(ch => {
        if (!ch.visible) return false;
        const g = ch.geometry?.parameters;
        if (!g) return false;
        const h = Number(g.height || g.length || 0);
        const w = Number(g.width || g.radiusTop || 0);
        return h >= 0.85 && w > 0 && w <= 0.25;
      });
      if (swordLike.length >= 2) {
        for (let i = 1; i < swordLike.length; i++) {
          swordLike[i].visible = false;
        }
      }
    });
  }

  // =========================================================
  // 2. 移動ロック解除＆ユニバーサル移動アシスト（既存入力が死んでいる時だけ補助）
  // =========================================================
  const inputV10 = {
    keys: {},
    touchId: null,
    startX: 0,
    startY: 0,
    dx: 0,
    dy: 0
  };

  function bindUniversalInputV10() {
    if (window._v10InputBound) return;
    window._v10InputBound = true;

    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      inputV10.keys[e.code] = true;
    });
    window.addEventListener('keyup', (e) => {
      inputV10.keys[e.code] = false;
    });

    // iPad / スマホ用：画面左半分でのドラッグ操作を検出
    document.addEventListener('touchstart', (e) => {
      if (inputV10.touchId !== null) return;
      const t = e.changedTouches[0];
      if (!t) return;
      // UIボタンやモーダル上のタップは邪魔しない
      if (e.target?.closest?.('button, input, select, textarea, #modal, #kmj-v7-debug-modal')) return;
      if (t.clientX <= window.innerWidth * 0.55 && t.clientY >= 70) {
        inputV10.touchId = t.identifier;
        inputV10.startX = t.clientX;
        inputV10.startY = t.clientY;
        inputV10.dx = 0;
        inputV10.dy = 0;
      }
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (inputV10.touchId === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === inputV10.touchId) {
          const rawX = t.clientX - inputV10.startX;
          const rawY = t.clientY - inputV10.startY;
          const dist = Math.hypot(rawX, rawY);
          if (dist > 6) {
            const maxR = 48;
            const clamp = Math.min(dist, maxR) / dist;
            inputV10.dx = (rawX * clamp) / maxR;
            inputV10.dy = (rawY * clamp) / maxR;
          } else {
            inputV10.dx = 0;
            inputV10.dy = 0;
          }
          break;
        }
      }
    }, { passive: true });

    const endTouch = (e) => {
      if (inputV10.touchId === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === inputV10.touchId) {
          inputV10.touchId = null;
          inputV10.dx = 0;
          inputV10.dy = 0;
          break;
        }
      }
    };
    document.addEventListener('touchend', endTouch, { passive: true });
    document.addEventListener('touchcancel', endTouch, { passive: true });
  }

  function unlockMovementStateV10(inst) {
    if (!inst) return;
    // タイトル画面が非表示ならプレイ中状態に強制同期
    const titleEl = document.querySelector('#title-screen, #title-overlay, #start-screen, #login-screen, .title-overlay');
    const titleHidden = !titleEl || titleEl.style.display === 'none' || titleEl.classList.contains('hidden');
    if (titleHidden) {
      if (inst.state === 'title' || inst.state === 'menu' || inst.state === 'ready' || !inst.state) {
        inst.state = 'playing';
      }
      if (inst.gameState === 'title' || !inst.gameState) inst.gameState = 'playing';
      inst.isPlaying = true;
      inst.playing = true;
      inst.started = true;
      inst.isStarted = true;
      inst.paused = false;
      inst.isPaused = false;
      inst.canMove = true;
      inst.moveLocked = false;
      inst.inputLocked = false;
    }

    // 空のモーダルや透明膜が操作を塞いでいる場合は解除
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    if (modal && modal.style.display !== 'none' && modalBody && modalBody.innerHTML.trim() === '') {
      modal.style.display = 'none';
    }
  }

  function getMoveVectorV10(inst) {
    let vx = inputV10.dx;
    let vz = inputV10.dy;

    if (inputV10.keys['KeyW'] || inputV10.keys['ArrowUp']) vz -= 1;
    if (inputV10.keys['KeyS'] || inputV10.keys['ArrowDown']) vz += 1;
    if (inputV10.keys['KeyA'] || inputV10.keys['ArrowLeft']) vx -= 1;
    if (inputV10.keys['KeyD'] || inputV10.keys['ArrowRight']) vx += 1;

    // 既存のジョイスティックオブジェクトがあればそちらの値も参照
    const joy = inst?.joy || inst?.joystick || inst?.stick;
    if (joy && (Math.abs(joy.dx || joy.x || 0) > 0.05 || Math.abs(joy.dy || joy.y || 0) > 0.05)) {
      vx = Number(joy.dx ?? joy.x ?? 0);
      vz = Number(joy.dy ?? joy.y ?? 0);
    }

    const len = Math.hypot(vx, vz);
    if (len > 1) {
      vx /= len;
      vz /= len;
    }
    return { vx, vz, active: len > 0.05 };
  }

  // =========================================================
  // 3. メインループ＆生成フックへの安全組み込み
  // =========================================================
  function installV10Patch() {
    if (typeof KaomojiMMORPG === 'undefined') {
      setTimeout(installV10Patch, 150);
      return;
    }

    const proto = KaomojiMMORPG.prototype;
    if (proto._v10Installed) return;
    proto._v10Installed = true;

    if (typeof proto.buildPlayerEntity === 'function' && !proto._v10BuildWrapped) {
      const origBuild = proto.buildPlayerEntity;
      proto.buildPlayerEntity = function (...args) {
        const res = origBuild.apply(this, args);
        fixDuplicateWeaponsV10(this);
        return res;
      };
      proto._v10BuildWrapped = true;
    }

    if (typeof proto.update === 'function' && !proto._v10UpdateWrapped) {
      const origUpdate = proto.update;
      proto.update = function (dt = 0.016, ...rest) {
        unlockMovementStateV10(this);

        const p = this.player;
        const beforeX = p?.pos?.x ?? 0;
        const beforeZ = p?.pos?.z ?? 0;

        const res = origUpdate.apply(this, [dt, ...rest]);

        fixDuplicateWeaponsV10(this);

        // 本来の移動処理で座標が動かなかった場合のみ、アシスト移動で確実に動かす
        if (p?.pos) {
          const movedDist = Math.hypot(p.pos.x - beforeX, p.pos.z - beforeZ);
          const mv = getMoveVectorV10(this);
          if (mv.active && movedDist < 0.0005) {
            const safeDt = Math.min(0.1, Math.max(0.001, Number(dt) || 0.016));
            const speed = Number(p.spd || p.speed || 7.5);
            p.pos.x += mv.vx * speed * safeDt;
            p.pos.z += mv.vz * speed * safeDt;
            p.rotY = Math.atan2(mv.vx, mv.vz);

            const mesh = p.mesh || p.grp || p.group || p.model;
            if (mesh) {
              mesh.position.x = p.pos.x;
              mesh.position.z = p.pos.z;
              mesh.rotation.y = p.rotY;
            }
            if (this.camera) {
              this.camera.position.x = p.pos.x;
              this.camera.position.z = p.pos.z + 11;
              this.camera.lookAt(p.pos.x, 1.0, p.pos.z);
            }
          }
        }

        return res;
      };
      proto._v10UpdateWrapped = true;
    }

    const inst = getInst();
    if (inst) {
      unlockMovementStateV10(inst);
      fixDuplicateWeaponsV10(inst);
    }
  }

  bindUniversalInputV10();
  installV10Patch();
})();
// ▲▲▲ ここまで game10.js ▲▲▲
