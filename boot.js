// boot.js — index.html の game9.js の「後」に読み込むこと
//   <script src="boot.js?v=8"></script>
//
//  1) ゲーム本体(KaomojiMMORPG)をページ読み込み時に必ず1回だけ生成する。
//  2) 通常攻撃のエフェクトを接続する（performBasicAttack）。
//  3) スキルスタジオの属性スキル7種を実スキルとして登録（属性の判定は game9 が自動で行う）。
//  4) 設定メニューに追加:
//       🎮 戦闘ボタン配置を編集（位置＋大きさ）
//       💬 チャット欄を初期位置・初期サイズに戻す
//  5) 魔法系クラス(杖クラス)のとき、杖を表示し、元の剣を隠す。
//  6) デバッグ画面に「🎒 素材無限」を追加。
//  7) 設定内のデバッグモード切替・魔法進化ボタンを消し、チャット開閉を左に固定、重なるUIを整理。
//  8) チャットを触ると飛んでいく不具合の修正（game6 と game8 の移動処理の衝突を解消）。
//  9) MP回復を1つのルールに一本化（game4/game8/game9 の回復が重なって速すぎた）。
// 10) オンラインの他プレイヤー全員に、名前・Lv・クラスのネームタグを表示。
// 11) スキル・ツリー内の「🌟 追加魔法スペル（厳選4種）」ボックスを非表示。
// 12) ペットの顔がめり込んで見えない不具合を修正（顔を球面に沿わせて前に出す）。
// 13) オンライン: 他プレイヤーの 見た目(色・顔・着せ替え・背中・防具・武器・大きさ)・ペット・スキル演出 を、
//     本人の画面と同じ見た目で表示（本人の画面と同じ作り方で組み立てる）。
(function () {
  'use strict';

  // =====================================================
  // 1. 起動
  // =====================================================
  function boot() {
    if (window.game || window.__kmjInstance) return;
    try {
      const g = new KaomojiMMORPG();
      window.game = g;
      window.__kmjInstance = g;
    } catch (e) {
      console.error('[boot] 起動エラー', e);
      const el = document.getElementById('title-save-info');
      if (el) el.textContent = '⚠️ 起動エラー: ' + (e && e.message ? e.message : e);
    }
    ensureMenuButtons();
  }

  // =====================================================
  // 2. 通常攻撃のエフェクト接続 ＋ 5. 杖の見た目
  // =====================================================
  function installProtoPatches() {
    if (typeof KaomojiMMORPG === 'undefined') return;
    const P = KaomojiMMORPG.prototype;
    if (P._bootPatchesInstalled) return;
    P._bootPatchesInstalled = true;

    // ---- 通常攻撃 ----
    const origBasic = P.performBasicAttack;
    if (typeof origBasic === 'function') {
      P.performBasicAttack = function (...args) {
        const p = this.player;
        if (!p || this.isDead || p.stunTimer > 0) return origBasic.apply(this, args);

        let isStaff = false;
        try {
          isStaff = typeof window.isStaffClassEntityV7 === 'function' && window.isStaffClassEntityV7(this, p);
        } catch (e) { console.error('[boot] 杖判定エラー', e); }

        let res;
        if (isStaff) {
          // 杖: ダメージは魔法弾が命中した時に与える（game7）。二重ダメージ防止のため
          // 元のダメージ処理は呼ばず、向き・クールダウン・モーションだけ整える。
          const st = this.calcDerivedStats();
          const target = this.getNearestMonster?.(6.2) || this.getValidTarget?.();
          if (target && !target.dead && target.pos) {
            const dx = target.pos.x - p.pos.x, dz = target.pos.z - p.pos.z;
            if (dx * dx + dz * dz > 0.01) p.rotY = Math.atan2(dx, dz);
          }
          p.skillAnimType = 'basic_slash';
          p.skillAnimDur = 0.24;
          p.skillAnimTimer = 0.24;
          this.autoAtkTimer = Math.max(0.42, 0.95 * (1 - (st.cdReduction || 0) * 0.6));
        } else {
          res = origBasic.apply(this, args); // 剣: ダメージは元処理、見た目は game8 の3連横振り
        }

        try {
          this.triggerAttackVisual?.(p, false, isStaff ? { isMage: true } : null);
          this.broadcastPlayerPacket?.('attack', { isSkill: false, skillInfo: isStaff ? { isMage: true } : undefined });
        } catch (e) { console.error('[boot] 通常攻撃エフェクトエラー', e); }
        return res;
      };
    }

    // ---- 武器の見た目（杖／剣） ----
    // game8.js が enforceStrictWeaponVisualV27 を「剣だけ」の処理で上書きしており、
    // 杖クラスでは剣を隠すだけで杖が作られていなかった。杖を作って付け、元の剣の台座を隠す。
    const origEnforce = P.enforceStrictWeaponVisualV27;
    P.enforceStrictWeaponVisualV27 = function (entity, ...rest) {
      const res = typeof origEnforce === 'function' ? origEnforce.call(this, entity, ...rest) : undefined;
      try { syncWeaponVisual(this, entity || this.player, rest[0]); }
      catch (e) { console.error('[boot] 武器の見た目エラー', e); }
      return res;
    };
    // ---- チャット: game6 の移動・サイズ変更を無効化（game8 のものだけを使う） ----
    // game6 の initChatFreeTransform は「チャット欄は position:fixed」と仮定して left/top を書き込むが、
    // game8 はチャット欄を position:relative にしている。そのため、右下のつまみ等を触った瞬間に
    // チャット欄が画面の座標ぶん（数百px）ずれて飛んでいた。
    P.initChatFreeTransform = function () {
      document.getElementById('kmj-chat-drag-bar')?.remove();
      document.getElementById('kmj-chat-resize-grip')?.remove();
    };

    // ---- MP回復の一本化 ----
    // 現状は3か所が別々にMPを書き換えていた:
    //   game4: 毎秒4.5%（街30%）／ game8: 毎秒0.8%+1.5（しかも min() で game4 の回復を打ち消す）
    //   game9: 毎秒7%（杖装備で10.5%）＋ max(player.mp, saveData.mp) による消費MPの払い戻し
    // 最終的なMPを「前フレームのMP ＋ 1つのルールの回復量」に揃える。
    const origUpdate = P.update;
    if (typeof origUpdate === 'function') {
      P.update = function (dt, ...rest) {
        const p = this.player, d = this.saveData;
        const active = !!(MP_REGEN_FIX && p && d && !this.inTitleScreen && !this.isDead &&
                          typeof p.mp === 'number' && this._debugInfiniteMode !== true);
        let before = 0;
        if (active) {
          before = p.mp;
          d.mp = p.mp; // 古い saveData.mp が残っていると game9 が消費MPを払い戻すため、先に揃える
        }
        const res = origUpdate.call(this, dt, ...rest);
        if (!active) return res;

        try {
          const after = p.mp;
          const maxMp = Math.max(Number(p.maxMp) || 0, Number(d.maxMp) || 0, 1);
          const step = Math.min(0.1, Math.max(0, Number(dt) || 0.016));
          const gain = after - before;
          let final;
          if (!Number.isFinite(after)) {
            final = before;
          } else if (gain < -0.001) {
            final = after;                               // スキル消費など、減った分はそのまま
          } else if (gain > maxMp * 0.02 + 2) {
            final = after;                               // 回復スキル・復活・レベルアップ等の大きな増加は尊重
          } else {
            // 通常の自然回復だけを、1つのルールで計算し直す
            this._bootMpMultT = (this._bootMpMultT || 0) - step;
            if (this._bootMpMultT <= 0) {
              this._bootMpMultT = 0.5;
              this._bootMpMult = Number(this.calcDerivedStats?.().treeMpRegenMult) || 1;
            }
            const town = this.currentZoneId === 'town';
            let rate = town ? MP_REGEN_TOWN : MP_REGEN_FIELD * (this._bootMpMult || 1);
            if (!town && p.sanctuaryBuffTimer > 0) rate *= 1.8; // 極光の聖域中の加速（game8 の仕様）
            final = Math.min(maxMp, before + maxMp * rate * step);
          }
          final = Math.max(0, Math.min(maxMp, final));
          p.mp = final;
          d.mp = final;
        } catch (e) { console.error('[boot] MP回復の一本化エラー', e); }
        return res;
      };
    }

    // ---- ペットの顔（球に埋まって見えない不具合の修正） ----
    const origBuildPet = P.buildPetEntity;
    if (typeof origBuildPet === 'function') {
      P.buildPetEntity = function (...args) {
        const res = origBuildPet.apply(this, args);
        try { fixPetFace(this.petEntity && this.petEntity.group); }
        catch (e) { console.error('[boot] ペットの顔の修正エラー', e); }
        return res;
      };
    }

    // ---- オンライン同期: 送信側（見た目 ＋ スキル演出） ----
    const origBcast = P.broadcastPlayerPacket;
    if (typeof origBcast === 'function') {
      P.broadcastPlayerPacket = function (type = 'sync', extra = {}) {
        let look;
        try { look = buildMyLook(this); } catch (e) { console.error('[boot] 見た目の送信エラー', e); }
        return origBcast.call(this, type, look ? { look, ...extra } : extra);
      };
    }

    // スキルを撃った時に、進化後の属性・段階・名前を他のプレイヤーへ送る
    const origSlot = P.useSkillSlot;
    if (typeof origSlot === 'function') {
      P.useSkillSlot = function (slotIdx, ...rest) {
        const p = this.player;
        const cdOf = () => Math.max(p?.skillCds?.[slotIdx] || 0, p?.skillCooldowns?.[slotIdx] || 0);
        const cdBefore = cdOf();
        const res = origSlot.call(this, slotIdx, ...rest);
        try { if (p && cdOf() > cdBefore + 0.05) broadcastSkill(this, slotIdx); }  // クールダウンが入った＝発動成功
        catch (e) { console.error('[boot] スキル演出の送信エラー', e); }
        return res;
      };
    }

    // ---- オンライン同期: 受信側 ----
    const origIncoming = P.handleIncomingPacket;
    if (typeof origIncoming === 'function') {
      P.handleIncomingPacket = function (pkt, ...rest) {
        const res = origIncoming.call(this, pkt, ...rest);
        try {
          const rp = pkt && pkt.uid && this.remotePlayers ? this.remotePlayers.get(pkt.uid) : null;
          if (rp) {
            applyRemoteLook(this, pkt, rp);
            ensureRemotePet(this, pkt, rp);
            if (pkt.type === 'attack' && pkt.fx) playRemoteSkillFx(this, pkt, rp);
          }
        } catch (e) { console.error('[boot] 他プレイヤー同期エラー', e); }
        return res;
      };
    }

    // ---- 他プレイヤーのペット追従 ＋ ネームタグ ----
    const origRemote = P.updateRemotePlayers;
    P.updateRemotePlayers = function (...args) {
      // 他プレイヤーのペットを、自分のペットと同じ動き（追従位置・弾む動き）にする
      const pets = [];
      this.remotePlayers?.forEach((rp) => {
        const pg = rp.petGroup;
        if (pg && pg.position) pets.push([rp, pg, pg.position.x, pg.position.z]);
      });
      const res = typeof origRemote === 'function' ? origRemote.apply(this, args) : undefined;

      // ネームタグ（ペットの処理が失敗しても止まらないよう、独立して実行する）
      try { updateRemoteTags(this); } catch (e) { console.error('[boot] ネームタグエラー', e); }

      try {
        const step = Math.min(0.1, Math.max(0, Number(args[0]) || 0.016));
        const t = Date.now() / 1000;
        pets.forEach(([rp, pg, x, z]) => {
          if (!rp.pos) return;
          const rot = rp.rotY || 0;
          const tx = rp.pos.x - Math.sin(rot) * 1.6 + Math.cos(rot) * 1.1;
          const tz = rp.pos.z - Math.cos(rot) * 1.6 - Math.sin(rot) * 1.1;
          const k = Math.min(1, step * 5.5);
          pg.position.x = x + (tx - x) * k;
          pg.position.z = z + (tz - z) * k;
          pg.position.y = Math.abs(Math.sin(t * 8)) * 0.22;
          pg.rotation.y = rot;
        });
      } catch (e) { console.error('[boot] 他プレイヤーのペットエラー', e); }
      return res;
    };
  }


  function isStaffFor(game, entity, evoId) {
    if (evoId !== undefined && evoId !== null) {
      const cls = game.getCurrentClassDefV45?.(String(evoId).toLowerCase());
      if (cls?.weaponType === 'staff') return true;
      if (cls?.weaponType === 'sword') return false;
    }
    return !!window.isStaffClassEntityV7?.(game, entity);
  }

  function syncWeaponVisual(game, entity, evoId) {
    if (!game?.useWebGL || !entity || typeof THREE === 'undefined') return;
    const host = entity.group || entity.mesh || entity.container || entity.obj;
    if (!host || !host.add) return;

    const isStaff = isStaffFor(game, entity, evoId);
    const pivot = entity.weaponPivot || entity._v8SwordPivot;
    let staff = entity._bootStaff || host.getObjectByName?.('mage_staff_weapon');

    if (isStaff) {
      if (pivot) pivot.visible = false;                         // 元の剣の台座ごと隠す
      if (entity._v8SwordMesh) entity._v8SwordMesh.visible = false;
      // game9 が「杖アイテム装備中」用の杖を出している間は、そちらを優先（二重表示・ちらつき防止）
      const fancy = host.getObjectByName?.('v9_fancy_magic_staff');
      if (fancy && fancy.visible) { if (staff) staff.visible = false; return; }
      if (typeof game.buildMageStaff3D !== 'function') return;

      const d = game.saveData || {};
      const isLocal = entity === game.player;
      const wId = isLocal ? (d.equippedWeapon || d.weaponId || 'wpn_wood') : (entity.weaponId || 'wpn_wood');
      const wEnh = isLocal ? (d.weaponEnhance || 0) : 0;
      const sig = `staff|${wId}|${wEnh}`;
      if (!staff || staff.userData?.wpnSig !== sig) {
        if (staff) host.remove(staff);
        staff = game.buildMageStaff3D(wId, wEnh);
        if (!staff) return;
        staff.userData = staff.userData || {};
        staff.userData.wpnSig = sig;
        staff.position.set(0.64, 0.42, 0.22);
        host.add(staff);
        entity._bootStaff = staff;
      }
      staff.visible = true;
      entity.weaponMesh = staff;
    } else {
      if (staff) { staff.visible = false; host.remove(staff); entity._bootStaff = null; }
      if (pivot) pivot.visible = true;
    }
  }

  // 読み込み直し・転職直後・街への移動直後でも確実に反映されるよう、自分の見た目を定期確認する
  function startWeaponWatcher() {
    setInterval(() => {
      const g = window.game;
      if (g?.player && !g.inTitleScreen) {
        try { syncWeaponVisual(g, g.player); } catch (e) { console.error('[boot] 武器の見た目エラー', e); }
      }
    }, 400);
  }

  // =====================================================
  // 12. ペットの顔（球に埋まる不具合の修正）
  // =====================================================
  // 元の作りは「球(半径0.55)の中心より内側(z=0.48)に平らな顔板」を置いており、板の中央が球の中に隠れていた。
  // 顔の画像はそのままに、球の表面に沿った曲面(球の一部)へ貼り替える。
  function fixPetFace(group) {
    if (!group || group._bootFaceFixed || typeof THREE === 'undefined') return;
    const kids = group.children || [];
    const face = kids.find((c) => c.geometry && c.geometry.type === 'PlaneGeometry' && c.position && c.position.z > 0.3);
    const body = kids.find((c) => c.geometry && c.geometry.type === 'SphereGeometry');
    if (!face || !body) return;
    const mat = face.material;
    if (mat) { mat.polygonOffset = true; mat.polygonOffsetFactor = -2; }
    group.remove(face);
    const r = 0.55 + 0.012;                       // 球より少しだけ外側
    const phiLen = 1.5, thetaLen = 1.0;           // 横86°×縦57°（元の顔板とほぼ同じ大きさ）
    const thetaCenter = Math.PI / 2 - 0.07;       // 元の位置（少し上）に合わせる
    const geo = new THREE.SphereGeometry(r, 20, 14, Math.PI / 2 - phiLen / 2, phiLen, thetaCenter - thetaLen / 2, thetaLen);
    const patch = new THREE.Mesh(geo, mat);
    patch.position.copy(body.position);           // 球と同じ中心
    group.add(patch);
    group._bootFaceFixed = true;
  }

  // =====================================================
  // 13. オンライン: 他プレイヤーを本人の画面と同じ見た目にする
  // =====================================================
  // 自分の見た目を、送信用の小さなデータにまとめる
  function buildMyLook(game) {
    const d = game.saveData || {};
    return {
      c: Number(game.getPlayerBodyHexColor?.()) || 0x38bdf8,   // 体の色
      f: String(game.getPlayerFaceBgHex?.() || '#073b66'),      // 顔画面の背景色
      s: Number(game.getPlayerBodyScale?.()) || 1,              // 大きさ
      k: String(game.getBasePlayerKaomoji?.() || ''),           // 顔文字
      co: d.cosmeticId || 'none',                               // 頭の着せ替え
      bc: d.backCosmeticId || 'none',                           // 背中の着せ替え
      a: d.armorId || 'arm_cloth',                              // 防具
      w: d.weaponId || 'wpn_wood',                              // 武器
      we: Number(d.weaponEnhance) || 0,                         // 武器の強化値
      t: d.equippedTitleId || 'title_none'                      // 称号
    };
  }

  // 他人から届いたデータは、使う前に必ず検査する（変な値で画面が壊れないように）
  function sanitizeLook(l) {
    if (!l || typeof l !== 'object') return null;
    const id = (v, def) => (typeof v === 'string' && /^[A-Za-z0-9_\-]{1,40}$/.test(v) ? v : def);
    const c = Number(l.c);
    return {
      c: Number.isInteger(c) && c >= 0 && c <= 0xffffff ? c : 0x38bdf8,
      f: typeof l.f === 'string' && /^#[0-9a-fA-F]{6}$/.test(l.f) ? l.f : '#073b66',
      s: clamp(Number(l.s) || 1, 0.4, 3),
      k: typeof l.k === 'string' ? l.k.replace(/[\u0000-\u001f]/g, '').slice(0, 24) : '',
      co: id(l.co, 'none'), bc: id(l.bc, 'none'), a: id(l.a, 'arm_cloth'), w: id(l.w, 'wpn_wood'),
      we: clamp(Math.floor(Number(l.we) || 0), 0, 99),
      t: id(l.t, 'title_none')
    };
  }

  // 本人の画面と「同じ作り方」で組み立てる:
  // 自分のキャラを作る処理(buildPlayerEntity)に、相手のデータを一時的に読ませて、できた見た目だけを受け取る。
  // （自分のキャラ・シーンには一切触れない。終わったら必ず元に戻す）
  function buildAvatarFromLook(game, look, evoId) {
    if (typeof game.buildPlayerEntity !== 'function') return null;
    const realSave = game.saveData, realPlayer = game.player, realScene = game.scene;
    const fake = Object.create(realSave || {});
    Object.assign(fake, {
      weaponId: look.w, armorId: look.a, weaponEnhance: look.we,
      cosmeticId: look.co, backCosmeticId: look.bc,
      bodyColor: '#' + look.c.toString(16).padStart(6, '0'),
      faceBgColor: look.f, bodyScale: look.s,
      customKaomoji: look.k || '(・ω・)',
      evolutionId: evoId
    });
    let built = null;
    try {
      game.saveData = fake;
      game.player = null;
      game.scene = { add() {}, remove() {} };
      game.buildPlayerEntity();
      built = game.player;
    } finally {
      game.saveData = realSave;
      game.player = realPlayer;
      game.scene = realScene;
    }
    return built && built.group ? built : null;
  }

  function applyRemoteLook(game, pkt, rp) {
    if (!game.useWebGL || !game.scene || typeof THREE === 'undefined' || !rp.group) return;
    const look = sanitizeLook(pkt.look);
    if (!look) return;
    rp.titleId = look.t;
    rp.bodyScale = look.s;

    const evoId = String(pkt.evolutionId ?? '');
    const sig = JSON.stringify(look) + '|' + evoId;
    if (rp._bootLookSig === sig && rp.group._bootAvatar) return;

    const built = buildAvatarFromLook(game, look, evoId);
    if (!built) return;
    const old = rp.group;
    built.group.position.copy(old.position);
    built.group.rotation.y = old.rotation.y;
    built.group._bootAvatar = true;
    game.scene.remove(old);
    game.scene.add(built.group);

    rp.group = built.group;
    rp.faceMesh = built.faceMesh;
    rp.weaponPivot = built.weaponPivot;
    rp.backPivot = built.backPivot;
    // 古い体に付いていた武器表示の記憶を消す（新しい体に付け直させる）
    ['_v8SwordMesh', '_v8SwordPivot', '_v8SwordSig', '_v8ActiveFace', '_wpnBaseRotX', '_wpnBaseRotZ', '_baseScale', '_bootStaff']
      .forEach((k) => { rp[k] = null; });
    rp._bootLookSig = sig;
    game.enforceStrictWeaponVisualV27?.(rp, evoId);   // 剣/杖の見た目（クラスに合わせる）
  }

  // ペット: 本人の画面と同じ作り方（buildPetEntity）で作る。作れない時は元の表示のまま。
  function buildPetFromKey(game, petKey) {
    if (typeof game.buildPetEntity !== 'function') return null;
    const realSave = game.saveData, realPet = game.petEntity, realScene = game.scene;
    const fake = Object.create(realSave || {});
    fake.petId = petKey;
    let group = null;
    try {
      game.saveData = fake;
      game.petEntity = null;
      game.scene = { add() {}, remove() {} };
      game.buildPetEntity();
      group = game.petEntity && game.petEntity.group;
    } finally {
      game.saveData = realSave;
      game.petEntity = realPet;
      game.scene = realScene;
    }
    return group || null;
  }

  function ensureRemotePet(game, pkt, rp) {
    if (!game.useWebGL || !game.scene || typeof THREE === 'undefined') return;
    const petId = pkt.pet && typeof pkt.pet.petId === 'string' ? pkt.pet.petId : '';
    if (!/^[A-Za-z0-9_\-]{1,40}$/.test(petId) || !rp.petGroup) return;
    if (rp.petGroup._bootPet === petId) return;
    const g = buildPetFromKey(game, petId);
    if (!g) return;
    g._bootPet = petId;
    g.position.copy(rp.petGroup.position);
    g.rotation.y = rp.petGroup.rotation.y;
    game.scene.remove(rp.petGroup);
    game.scene.add(g);
    rp.petGroup = g;
  }

  // スキルを撃った時の送信データ（進化後の属性・段階・名前）
  function broadcastSkill(game, slotIdx) {
    const d = game.saveData;
    const skId = d && d.equippedSkills ? d.equippedSkills[slotIdx] : null;
    const sk = skId && typeof SKILLS !== 'undefined' ? SKILLS[skId] : null;
    const V9 = window.KMJ_SKILL_FX_V9;
    const p = game.player;
    if (!sk || !V9?.getSkillInfo || !p?.pos) return;
    const info = V9.getSkillInfo(game, sk, slotIdx);
    if (!info?.attr) return;
    const tgt = game.getValidTarget?.();
    const tx = tgt && !tgt.dead && tgt.pos ? tgt.pos.x : p.pos.x + Math.sin(p.rotY || 0) * 5.2;
    const tz = tgt && !tgt.dead && tgt.pos ? tgt.pos.z : p.pos.z + Math.cos(p.rotY || 0) * 5.2;
    const name = String(info.evolvedName || sk.name || '');
    game.broadcastPlayerPacket?.('attack', {
      isSkill: true,
      skillInfo: { id: skId, name },
      fx: { a: info.attr.id, t: info.tier | 0, n: name.slice(0, 60), na: info.isNonAttack ? 1 : 0,
            tx: Math.round(tx * 100) / 100, tz: Math.round(tz * 100) / 100 }
    });
  }

  // 他プレイヤーのスキル演出（見た目だけ。自分のHP/MP/敵には一切影響しない）
  function playRemoteSkillFx(game, pkt, rp) {
    const f = pkt.fx;
    const V9 = window.KMJ_SKILL_FX_V9;
    if (!f || !V9?.EFFECT_BUILDERS || !V9.ATTRIBUTES || !game.scene || typeof THREE === 'undefined' || !rp.pos) return;
    const aid = String(f.a || '');
    const attr0 = V9.ATTRIBUTES.find((a) => a.id === aid);
    if (!attr0) return;
    // 極光の聖域は「範囲内の自分を回復する」本物の効果を持つため、他人の分は見た目だけの別演出で代用する
    const useId = aid === 'aurora_sanctuary' ? 'holy_heal' : aid;
    const attr = V9.ATTRIBUTES.find((a) => a.id === useId) || attr0;
    const builder = V9.EFFECT_BUILDERS[useId] || V9.EFFECT_BUILDERS.sword;
    if (typeof builder !== 'function') return;

    const tier = clamp(Math.floor(Number(f.t) || 0), 0, 3);
    const caster = { x: rp.pos.x, z: rp.pos.z };
    const rot = rp.rotY || 0;
    const tx = Number(f.tx), tz = Number(f.tz);
    const target = f.na ? caster : {
      x: Number.isFinite(tx) ? tx : caster.x + Math.sin(rot) * 5.2,
      z: Number.isFinite(tz) ? tz : caster.z + Math.cos(rot) * 5.2
    };
    builder(game.scene, caster, target, tier, attr);

    const name = String(f.n || '').replace(/[<>&"']/g, '').slice(0, 40);
    if (name && game.spawnFloatText) {
      game.spawnFloatText(new THREE.Vector3(rp.pos.x, 3.3 * (rp.bodyScale || 1), rp.pos.z), name, '#fde047', 13);
    }
  }

  // =====================================================
  // MP回復の設定（ここの数字だけ変えれば回復速度を調整できます）
  // =====================================================
  const MP_REGEN_FIX = true;     // false にすると、この一本化を無効にして元の挙動に戻せます
  const MP_REGEN_FIELD = 0.045;  // フィールド: 毎秒、最大MPの4.5%（game4 本来の設定）
  const MP_REGEN_TOWN = 0.30;    // 街: 毎秒、最大MPの30%（game4 本来の設定）

  // =====================================================
  // 10. 他プレイヤーのネームタグ（全員分・距離で消さない）
  // =====================================================
  function updateRemoteTags(game) {
    const layer = game.overlayLayer || document.getElementById('overlay-layer');
    if (!layer || !game.remotePlayers) return;
    const tags = game._bootTags || (game._bootTags = new Map());

    // いなくなった人のタグを片付ける
    tags.forEach((el, uid) => {
      if (!game.remotePlayers.has(uid)) { el.remove(); tags.delete(uid); }
    });

    game.remotePlayers.forEach((rp, uid) => {
      let el = tags.get(uid);
      if (!el) {
        el = document.createElement('div');
        el.className = 'world-plate kmj-boot-nametag';
        layer.appendChild(el);
        tags.set(uid, el);
      }

      const cls = game.getCurrentClassDefV45?.(String(rp.evolutionId ?? ''));
      const name = String(rp.name || '冒険者');
      const sub = `Lv.${Number(rp.lv) || 1}${cls && cls.name ? ' ' + cls.name : ''}`;
      const ttl = (typeof TITLES !== 'undefined' && TITLES && rp.titleId && rp.titleId !== 'title_none' && TITLES[rp.titleId])
        ? String(TITLES[rp.titleId].name || '') : '';
      const sig = ttl + '\n' + name + '\n' + sub;
      if (el._sig !== sig) {
        el._sig = sig;
        // 相手が付けた名前は文字としてだけ入れる（HTMLとして解釈させない）
        el.textContent = '';
        if (ttl) {
          const l0 = document.createElement('div');
          l0.style.cssText = 'font-size:8.5px;font-weight:800;color:#c4b5fd;';
          l0.textContent = ttl;
          el.appendChild(l0);
        }
        const l1 = document.createElement('div');
        l1.style.cssText = 'font-size:11px;font-weight:900;color:#7dd3fc;';
        l1.textContent = name;
        const l2 = document.createElement('div');
        l2.style.cssText = 'font-size:9px;font-weight:800;color:#fde047;';
        l2.textContent = sub;
        el.appendChild(l1);
        el.appendChild(l2);
      }

      const scale = rp.bodyScale || 1.0;
      const world = new THREE.Vector3(rp.pos.x, 2.4 * scale, rp.pos.z);
      const sc = game.projectToScreen ? game.projectToScreen(world) : null;
      if (sc && sc.visible) {
        el.style.display = 'block';
        el.style.left = sc.x + 'px';
        el.style.top = sc.y + 'px';
      } else {
        el.style.display = 'none'; // カメラの真後ろにいる間だけ隠れる
      }
    });
  }

  // =====================================================
  // 3. スキルスタジオの属性スキルを実スキルとして登録
  // =====================================================
  const STUDIO_SKILLS = [
    { id: 'fx_fire_pillar', icon: '🔥', name: '螺旋炎柱',           type: 'AOE_BURN',   baseMp: 26, cd: 6.8, baseMult: 3.2, radius: 6.4, desc: '螺旋状の炎柱で広範囲を焼き、継続炎上ダメージを与える' },
    { id: 'fx_fire_burst', icon: '🎇', name: '爆炎連弾',           type: 'AOE_DMG',    baseMp: 20, cd: 4.6, baseMult: 2.6, radius: 5.4, desc: '連装火球を撃ち込み、着弾点を爆破する' },
    { id: 'fx_water',      icon: '🌊', name: '大渦潮',             type: 'AOE_SLOW',   baseMp: 22, cd: 6.2, baseMult: 2.4, radius: 6.6, desc: '巨大な渦潮の水柱で攻撃し、移動速度を下げる' },
    { id: 'fx_poison',     icon: '☠️', name: '魔界瘴気',           type: 'AOE_BURN',   baseMp: 24, cd: 7.0, baseMult: 3.0, radius: 6.6, desc: '瘴気を広げ、継続ダメージを与える' },
    { id: 'fx_dark',       icon: '🌑', name: '黒蝕ブラックホール', type: 'AOE_DMG',    baseMp: 36, cd: 8.2, baseMult: 4.2, radius: 8.0, desc: '黒い穹を呼び出し、周囲を飲み込む' },
    { id: 'fx_star',       icon: '🌠', name: '銀河流星',           type: 'AOE_DMG',    baseMp: 34, cd: 7.8, baseMult: 4.0, radius: 7.8, desc: '銀河の流星群を降らせる' },
    { id: 'fx_sword',      icon: '🗡️', name: '無限光剣陣',         type: 'SINGLE_DMG', baseMp: 28, cd: 4.8, baseMult: 4.0, desc: '無数の光剣を展開して単体を貫く' }
  ];

  function registerStudioSkills() {
    if (typeof SKILLS === 'undefined' || !SKILLS || Array.isArray(SKILLS)) return;
    STUDIO_SKILLS.forEach((s) => { if (!SKILLS[s.id]) SKILLS[s.id] = Object.assign({}, s); });
  }

  // =====================================================
  // 4-A. 戦闘ボタン配置エディタ（位置＋大きさ）
  // =====================================================
  const LAYOUT_KEY = 'kmj_btn_layout_v1';
  const STICK_BASE = 114;               // #joystick-zone の標準サイズ(px)
  const SCALE_MIN = 0.5, SCALE_MAX = 2.5;
  const MOVABLES = [
    { key: 'stick',  sel: '#joystick-zone',                   label: '移動' },
    { key: 'attack', sel: '#btn-basic-attack',                label: '攻撃' },
    { key: 'target', sel: '#btn-cycle-target',                label: '標的切替' },
    { key: 'slot0',  sel: '.skill-slot-btn[data-slot="0"]',   label: 'S1' },
    { key: 'slot1',  sel: '.skill-slot-btn[data-slot="1"]',   label: 'S2' },
    { key: 'slot2',  sel: '.skill-slot-btn[data-slot="2"]',   label: 'S3' },
    { key: 'slot3',  sel: '.skill-slot-btn[data-slot="3"]',   label: 'S4' },
    { key: 'slot4',  sel: '.skill-slot-btn[data-slot="4"]',   label: 'S5' }
  ];

  const orient = () => (window.innerWidth >= window.innerHeight ? 'land' : 'port'); // 横/縦で別々に保存
  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), Math.max(lo, hi));
  const scaleOf = (p) => (p && Number.isFinite(p.s) ? clamp(p.s, SCALE_MIN, SCALE_MAX) : 1);

  function loadLayout() {
    try {
      const v = JSON.parse(localStorage.getItem(LAYOUT_KEY) || 'null');
      if (v && typeof v === 'object') return { land: v.land || {}, port: v.port || {} };
    } catch (e) { /* 壊れた保存は無視して初期状態に */ }
    return { land: {}, port: {} };
  }
  let layout = loadLayout();

  function saveLayout() {
    try { localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout)); }
    catch (e) { console.error('[boot] ボタン配置の保存に失敗', e); }
  }

  let layoutStyleEl = null;
  function applyLayout() {
    if (!layoutStyleEl) {
      layoutStyleEl = document.createElement('style');
      layoutStyleEl.id = 'kmj-layout-style';
      (document.head || document.documentElement).appendChild(layoutStyleEl);
    }
    const cur = layout[orient()] || {};
    const maxX = window.innerWidth - 24;
    const maxY = window.innerHeight - 24;
    layoutStyleEl.textContent = MOVABLES.map((m) => {
      const p = cur[m.key];
      if (!p) return '';
      const x = clamp(p.x, 0, maxX), y = clamp(p.y, 0, maxY), s = scaleOf(p);
      let size = '';
      if (m.key === 'stick') {
        // スティックは枠の幅・高さを変える（つまみは中央のまま。拡大するとタッチ位置がずれるため）
        const px = Math.round(STICK_BASE * s);
        size = `width:${px}px!important;height:${px}px!important;`;
      } else if (s !== 1) {
        // 個別プロパティの scale を使うので、押した時の縮小演出(transform)は壊れない
        size = `scale:${s}!important;transform-origin:0 0!important;`;
      }
      return `${m.sel}{position:fixed!important;left:${x}px!important;top:${y}px!important;right:auto!important;bottom:auto!important;margin:0!important;${size}}`;
    }).filter(Boolean).join('\n');
  }

  let editorLayer = null;
  let grips = [];          // { key, target, el }
  let selectedKey = null;
  let sizeUi = null;       // { label, range, val }

  function closeLayoutEditor() {
    editorLayer?.remove();
    editorLayer = null;
    grips = [];
    selectedKey = null;
    sizeUi = null;
  }

  function syncGripRects() {
    grips.forEach(({ target, el }) => {
      const r = target.getBoundingClientRect();
      el.style.left = r.left + 'px';
      el.style.top = r.top + 'px';
      el.style.width = r.width + 'px';
      el.style.height = r.height + 'px';
    });
  }

  function selectKey(key) {
    selectedKey = key;
    grips.forEach(({ key: k, el }) => {
      const on = k === key;
      el.style.borderStyle = on ? 'solid' : 'dashed';
      el.style.borderColor = on ? '#22d3ee' : '#fde047';
      el.style.background = on ? 'rgba(34,211,238,.28)' : 'rgba(250,204,21,.2)';
    });
    if (sizeUi) {
      const m = MOVABLES.find((x) => x.key === key);
      const s = scaleOf((layout[orient()] || {})[key]);
      sizeUi.label.textContent = `大きさ: ${m ? m.label : '(未選択)'}`;
      sizeUi.range.disabled = !m;
      sizeUi.range.value = String(Math.round(s * 100));
      sizeUi.val.textContent = Math.round(s * 100) + '%';
    }
  }

  function setScale(key, s) {
    const m = MOVABLES.find((x) => x.key === key);
    const target = m && document.querySelector(m.sel);
    if (!target) return;
    const o = orient();
    if (!layout[o]) layout[o] = {};
    let p = layout[o][key];
    if (!p) { // まだ動かしていないボタンは、今の位置を基準にする
      const r = target.getBoundingClientRect();
      p = layout[o][key] = { x: Math.round(r.left), y: Math.round(r.top), s: 1 };
    }
    p.s = clamp(s, SCALE_MIN, SCALE_MAX);
    applyLayout();
    syncGripRects();
    saveLayout();
  }

  function buildGrips() {
    grips.forEach(({ el }) => el.remove());
    grips = [];
    if (!editorLayer) return;

    MOVABLES.forEach((m) => {
      const target = document.querySelector(m.sel);
      if (!target) return;
      const r0 = target.getBoundingClientRect();
      if (r0.width < 2 || r0.height < 2) return;

      // 本物のボタンの上に透明な「つかみ板」を重ねる。
      // 無効状態(空スロット)のボタンでも動かせて、タップしてもスキルが発動しない。
      const el = document.createElement('div');
      el.style.cssText =
        `position:absolute;left:${r0.left}px;top:${r0.top}px;width:${r0.width}px;height:${r0.height}px;` +
        `box-sizing:border-box;border:2px dashed #fde047;background:rgba(250,204,21,.2);` +
        `border-radius:${getComputedStyle(target).borderRadius || '12px'};` +
        `display:flex;align-items:center;justify-content:center;` +
        `color:#fff;font:800 11px sans-serif;text-shadow:0 1px 3px #000;` +
        `pointer-events:auto;touch-action:none;cursor:grab;user-select:none;-webkit-user-select:none;`;
      el.textContent = m.label;

      let drag = null;
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        el.setPointerCapture?.(e.pointerId);
        selectKey(m.key);
        const r = target.getBoundingClientRect();
        drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, l: r.left, t: r.top, w: r.width, h: r.height };
      });
      el.addEventListener('pointermove', (e) => {
        if (!drag || e.pointerId !== drag.id) return;
        const x = clamp(drag.l + e.clientX - drag.sx, 0, window.innerWidth - drag.w);
        const y = clamp(drag.t + e.clientY - drag.sy, 0, window.innerHeight - drag.h);
        const o = orient();
        if (!layout[o]) layout[o] = {};
        const prev = layout[o][m.key];
        layout[o][m.key] = { x: Math.round(x), y: Math.round(y), s: scaleOf(prev) };
        applyLayout();
        el.style.left = x + 'px';
        el.style.top = y + 'px';
      });
      const end = (e) => {
        if (drag && e.pointerId === drag.id) { drag = null; saveLayout(); }
      };
      el.addEventListener('pointerup', end);
      el.addEventListener('pointercancel', end);

      editorLayer.appendChild(el);
      grips.push({ key: m.key, target, el });
    });

    const keep = grips.some((g) => g.key === selectedKey) ? selectedKey : (grips.find((g) => g.key === 'attack') || grips[0])?.key;
    selectKey(keep || null);
  }

  function openLayoutEditor() {
    closeLayoutEditor();
    document.getElementById('hud-drawer-menu')?.classList.add('hidden');

    editorLayer = document.createElement('div');
    editorLayer.id = 'kmj-layout-layer';
    editorLayer.style.cssText = 'position:fixed;left:0;top:0;right:0;bottom:0;z-index:9995;pointer-events:none;';

    const bar = document.createElement('div');
    bar.style.cssText =
      'position:absolute;top:8px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;gap:7px;' +
      'background:rgba(2,6,23,.95);border:2px solid #fde047;border-radius:12px;padding:8px 11px;' +
      'pointer-events:auto;color:#fff;font:800 12px sans-serif;white-space:nowrap;';
    const btnStyle = 'border:none;border-radius:8px;padding:6px 11px;font:800 12px sans-serif;color:#fff;';

    const row1 = document.createElement('div');
    row1.style.cssText = 'display:flex;gap:8px;align-items:center;';
    const msg = document.createElement('span');
    msg.textContent = '🎮 ドラッグで移動／タップで選択';

    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.textContent = '↺ 初期状態に戻す';
    resetBtn.style.cssText = btnStyle + 'background:#475569;';
    resetBtn.addEventListener('click', () => {
      delete layout[orient()];   // 位置も大きさも初期値へ
      saveLayout();
      applyLayout();
      buildGrips();
    });

    const doneBtn = document.createElement('button');
    doneBtn.type = 'button';
    doneBtn.textContent = '✔ 完了';
    doneBtn.style.cssText = btnStyle + 'background:#059669;';
    doneBtn.addEventListener('click', closeLayoutEditor);

    row1.appendChild(msg);
    row1.appendChild(resetBtn);
    row1.appendChild(doneBtn);

    const row2 = document.createElement('div');
    row2.style.cssText = 'display:flex;gap:8px;align-items:center;';
    const label = document.createElement('span');
    label.style.cssText = 'min-width:96px;color:#67e8f9;';
    const range = document.createElement('input');
    range.type = 'range';
    range.min = String(SCALE_MIN * 100);
    range.max = String(SCALE_MAX * 100);
    range.step = '5';
    range.value = '100';
    range.style.cssText = 'flex:1;min-width:160px;touch-action:none;';
    const val = document.createElement('span');
    val.style.cssText = 'min-width:42px;text-align:right;color:#fde047;';
    range.addEventListener('input', () => {
      const pct = Number(range.value);
      val.textContent = pct + '%';
      if (selectedKey) setScale(selectedKey, pct / 100);
    });
    row2.appendChild(label);
    row2.appendChild(range);
    row2.appendChild(val);
    sizeUi = { label, range, val };

    bar.appendChild(row1);
    bar.appendChild(row2);
    editorLayer.appendChild(bar);
    document.body.appendChild(editorLayer);

    buildGrips();
  }

  // =====================================================
  // 4-B. チャット欄を初期位置・初期サイズに戻す
  // =====================================================
  function resetChatLayout() {
    // game6 と game8 がそれぞれ保存している位置・サイズを消す
    ['kmj_chat_box_v40', 'kmj_chat_box_v18', 'kmj_v8_chat_rect'].forEach((k) => {
      try { localStorage.removeItem(k); } catch (e) { /* 保存領域が使えなくても続行 */ }
    });
    // 直接書き込まれた位置・サイズを外して、CSSの初期値に戻す。
    // ※ #chat-panel の position は game8 が意図して設定しているので触らない。
    const wrapper = document.getElementById('chat-wrapper');
    const panel = document.getElementById('chat-panel');
    ['position', 'left', 'top', 'right', 'bottom', 'transform', 'margin'].forEach((p) => wrapper?.style.removeProperty(p));
    ['left', 'top', 'right', 'bottom', 'width', 'height'].forEach((p) => panel?.style.removeProperty(p));
    document.getElementById('hud-drawer-menu')?.classList.add('hidden');
    window.game?.showAlertBanner?.('💬 チャット欄を初期位置・初期サイズに戻しました', 1800);
  }

  // =====================================================
  // 設定メニュー(ハンバーガー内)にボタンを追加
  // =====================================================
  function makeMenuButton(id, text, onClick) {
    const b = document.createElement('button');
    b.type = 'button';
    b.id = id;
    b.className = 'btn-ui btn-sky';
    b.style.width = '100%';
    b.textContent = text;
    b.addEventListener('click', (e) => { e.stopPropagation(); onClick(); });
    return b;
  }

  function ensureMenuButtons() {
    const drawer = document.getElementById('hud-drawer-menu');
    if (!drawer) return;
    const bgm = drawer.querySelector('#btn-toggle-bgm');
    let anchor = bgm;
    const add = (id, text, fn) => {
      let b = drawer.querySelector('#' + id);
      if (!b) {
        b = makeMenuButton(id, text, fn);
        if (anchor) anchor.insertAdjacentElement('afterend', b); else drawer.appendChild(b);
      }
      anchor = b;
    };
    add('btn-edit-btn-layout', '🎮 戦闘ボタン配置を編集', openLayoutEditor);
    add('btn-reset-chat-layout', '💬 チャット欄を初期位置に戻す', resetChatLayout);
  }

  function watchDrawer() {
    const drawer = document.getElementById('hud-drawer-menu');
    if (!drawer || drawer._bootWatched) return;
    drawer._bootWatched = true;
    // 他のコードがメニューを作り直しても、ボタンが消えないようにする
    new MutationObserver(() => ensureMenuButtons()).observe(drawer, { childList: true });
  }

  let resizeRaf = 0;
  function onResize() {
    if (resizeRaf) return;
    resizeRaf = requestAnimationFrame(() => {
      resizeRaf = 0;
      applyLayout();
      if (editorLayer) buildGrips();
    });
  }

  window.kmjOpenLayoutEditor = openLayoutEditor; // コンソールからの確認用

  // =====================================================
  // 6. デバッグ画面に「素材無限」を追加
  // =====================================================
  const INF_MAT = 99999999;
  const INF_KEY = 'kmj_dbg_inf_mats';
  let infMats = false;
  try { infMats = localStorage.getItem(INF_KEY) === '1'; } catch (e) { /* 無効のまま */ }

  function debugActive() {
    try { return !!window.KMJ_DEBUG?.isActive?.(window.game); } catch (e) { return false; }
  }

  function topUpMaterials() {
    const g = window.game;
    const m = g?.saveData?.materials;
    if (!m || typeof MATERIALS === 'undefined' || !MATERIALS) return;
    Object.keys(MATERIALS).forEach((k) => {
      if ((Number(m[k]) || 0) < INF_MAT) m[k] = INF_MAT;
    });
  }

  function injectDebugButtons(modal) {
    if (!modal || modal.querySelector('#v7-dbg-inf-mat')) return;
    const anchor = modal.querySelector('#v7-dbg-gold');
    if (!anchor) return;
    const b = document.createElement('button');
    b.type = 'button';
    b.id = 'v7-dbg-inf-mat';
    b.className = anchor.className;
    const baseBg = anchor.style.background || '#334155';
    b.style.cssText = anchor.style.cssText;
    const render = () => {
      b.textContent = infMats ? '🎒 素材無限: ON' : '🎒 素材無限: OFF';
      b.style.background = infMats ? 'linear-gradient(90deg,#059669,#0284c7)' : baseBg;
    };
    b.addEventListener('click', () => {
      infMats = !infMats;
      try { localStorage.setItem(INF_KEY, infMats ? '1' : '0'); } catch (e) { /* 保存できなくても動作は続行 */ }
      if (infMats) { topUpMaterials(); window.game?.refreshAllHUD?.(); window.game?.saveGame?.(false); }
      render();
      window.game?.showAlertBanner?.(infMats ? '🎒 素材を無限にしました（使っても減りません）' : '🎒 素材の無限化をOFFにしました', 1800);
    });
    render();
    anchor.insertAdjacentElement('afterend', b);
  }

  function watchDebugModal() {
    if (!document.body || document.body._bootDbgWatched) return;
    document.body._bootDbgWatched = true;
    new MutationObserver((records) => {
      for (const r of records) {
        r.addedNodes.forEach((n) => { if (n && n.id === 'kmj-v7-debug-modal') injectDebugButtons(n); });
      }
    }).observe(document.body, { childList: true });
  }

  function startInfMatsTimer() {
    setInterval(() => {
      if (infMats && debugActive()) topUpMaterials();
    }, 250);
  }

  // =====================================================
  // 起動処理
  // =====================================================
  registerStudioSkills();
  installProtoPatches();
  applyLayout();
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);

  function onReady() {
    boot();
    ensureMenuButtons();
    watchDrawer();
    watchDebugModal();
    startWeaponWatcher();
    startInfMatsTimer();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }

  // =====================================================
  // 7. UIの整理
  // =====================================================
  const st = document.createElement('style');
  st.id = 'kmj-boot-ui-fix';
  st.textContent = `
    /* スキル・ツリー内の「🌟 追加魔法スペル（厳選4種）」ボックスを消す
       （game9 が毎回作り直すため、作らせないのではなく常に非表示にしている） */
    #kmj-v9-new-spells-box { display: none !important; }

    /* 設定メニュー内のデバッグモード切替を消す */
    #kmj-v7-gear-debug-toggle { display: none !important; }
    /* 通常攻撃の上の「魔法進化」ボタンを消す */
    #kmj-v9-open-studio-btn, #kmj-v9-studio-open-btn { display: none !important; }

    /* チャット開閉ボタンを左側に固定（チャット欄を動かしても、このボタンは動かない） */
    #btn-toggle-chat {
      position: fixed !important; left: 8px !important; top: 128px !important;
      right: auto !important; bottom: auto !important; z-index: 31 !important;
    }

    /* 脅威バー: 左上のHP/MPバーと重なる → 上部中央へ */
    #kmj-v8-threat-bar {
      top: 8px !important; left: 50% !important; right: auto !important;
      transform: translateX(-50%) !important;
    }
    /* 「オフライン(タップで接続)」の丸い表示を消す（上段の「オフライン」ボタンと重なっていたため。
       接続の切り替えは上段のボタンからできます） */
    #kmj-v45-online-pill, .kmj-v45-online-pill { display: none !important; }
    /* DEBUG / スキルスタジオ: 右上の操作ボタンと重なる → 下部中央へ */
    #kmj-v7-debug-hud {
      top: auto !important; right: auto !important;
      bottom: 8px !important; left: 50% !important;
      transform: translateX(-50%) !important;
    }
  `;
  (document.head || document.documentElement).appendChild(st);
})();
