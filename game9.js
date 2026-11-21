// ▼▼▼ ここから【スキルエフェクト専用 game9.js 1/3】全14種スキル完全対応・MP5倍＆1Lv毎+10同期・スペルカードカットイン・全14種魔法エフェクトスタジオUI ▼▼▼
(() => {
  'use strict';

  // =========================================================
  // 1. スペルカードカットイン＆魔法スタジオCSS
  // =========================================================
  if (!document.getElementById('kmj-v9-master-css')) {
    const st = document.createElement('style');
    st.id = 'kmj-v9-master-css';
    st.textContent = `
      @keyframes kmjV9CutinSlide {
        0%   { opacity: 0; transform: translateX(130px) skewX(-15deg) scale(0.86); }
        11%  { opacity: 1; transform: translateX(0px) skewX(-15deg) scale(1.05); }
        84%  { opacity: 1; transform: translateX(-12px) skewX(-15deg) scale(1.0); }
        100% { opacity: 0; transform: translateX(-150px) skewX(-15deg) scale(0.92); }
      }
      @keyframes kmjV9LineSweep {
        0%   { transform: scaleX(0); opacity: 0; }
        15%  { transform: scaleX(1); opacity: 1; }
        85%  { transform: scaleX(1); opacity: 1; }
        100% { transform: scaleX(0); opacity: 0; }
      }
      @keyframes kmjV9SpinCW { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      @keyframes kmjV9SpinCCW { 0% { transform: rotate(360deg); } 100% { transform: rotate(0deg); } }
      @keyframes kmjV9FlashFade { 0% { opacity: 0.65; } 100% { opacity: 0; } }

      #kmj-v9-cutin-layer {
        position: fixed; inset: 0; pointer-events: none; z-index: 9999; overflow: hidden;
      }
      .kmj-v9-flash {
        position: absolute; inset: 0; animation: kmjV9FlashFade 0.55s ease-out forwards;
      }
      .kmj-v9-line-top, .kmj-v9-line-bot {
        position: absolute; left: 0; right: 0; height: 3px;
        background: linear-gradient(90deg, transparent, #fde047, #f472b6, #38bdf8, transparent);
        box-shadow: 0 0 16px #fde047;
        animation: kmjV9LineSweep 2.3s ease-out forwards;
      }
      .kmj-v9-line-top { top: 12.2%; }
      .kmj-v9-line-bot { top: 24.8%; }

      .kmj-v9-banner {
        position: absolute; right: 14px; top: 13.2%; min-width: 315px; max-width: 92vw;
        padding: 13px 26px 13px 20px; border-radius: 12px; border: 2px solid #fde047;
        box-shadow: 0 0 38px rgba(250, 204, 21, 0.9), inset 0 0 24px rgba(255, 255, 255, 0.32);
        display: flex; align-items: center; gap: 14px;
        animation: kmjV9CutinSlide 2.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; overflow: hidden;
      }
      .kmj-v9-banner-inner {
        transform: skewX(15deg); display: flex; align-items: center; gap: 14px; position: relative; z-index: 2;
      }
      .kmj-v9-ring-1 {
        position: absolute; right: -28px; top: -38px; width: 156px; height: 156px;
        border: 3px dashed rgba(255, 255, 255, 0.55); border-radius: 50%;
        animation: kmjV9SpinCW 5s linear infinite; z-index: 1;
      }
      .kmj-v9-ring-2 {
        position: absolute; right: -12px; top: -22px; width: 124px; height: 124px;
        border: 2px solid rgba(253, 224, 71, 0.7); border-radius: 50%;
        animation: kmjV9SpinCCW 3.4s linear infinite; z-index: 1;
      }
      .kmj-v9-avatar {
        background: rgba(15, 23, 42, 0.95); border: 2px solid #7dd3fc; border-radius: 10px;
        padding: 8px 11px; font-size: 16px; font-weight: 900; color: #fff; white-space: nowrap;
        box-shadow: 0 0 18px rgba(56, 189, 248, 0.95);
      }
      #kmj-v9-studio-modal {
        position: fixed; inset: 0; z-index: 9950;
        background: rgba(2, 6, 23, 0.78);
        display: flex; align-items: center; justify-content: center;
        padding: 12px; backdrop-filter: blur(4px);
      }
      .kmj-v9-studio-card {
        width: 100%; max-width: 500px; max-height: 86vh; overflow-y: auto;
        background: linear-gradient(160deg, #0f172a, #1e1b4b);
        border: 2px solid #f472b6; border-radius: 14px; padding: 14px;
        box-shadow: 0 0 36px rgba(236, 72, 153, 0.55);
        color: #f8fafc;
      }
    `;
    document.head.appendChild(st);
  }

  // =========================================================
  // 2. 属性別＋進化段階別リッチ・シンセサイザー効果音
  // =========================================================
  function playMagicAudioV9(attrId = 'sword', tier = 0) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!window._kmjV9AudioCtx) window._kmjV9AudioCtx = new AudioCtx();
      const ctx = window._kmjV9AudioCtx;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const presets = {
        fire:    { wave: 'sawtooth', base: 145, sweep: 48,   notes: [330, 440, 587.33, 880] },
        ice:     { wave: 'sine',     base: 1080, sweep: 1620, notes: [1046.5, 1318.5, 1568, 2093] },
        thunder: { wave: 'square',   base: 240, sweep: 85,   notes: [440, 659.25, 987.77, 1480] },
        wind:    { wave: 'triangle', base: 440, sweep: 820,  notes: [523.25, 659.25, 783.99, 1174.66] },
        water:   { wave: 'sine',     base: 290, sweep: 540,  notes: [392, 523.25, 659.25, 987.77] },
        earth:   { wave: 'sawtooth', base: 92,  sweep: 38,   notes: [196, 261.63, 329.63, 493.88] },
        holy:    { wave: 'sine',     base: 660, sweep: 1020, notes: [659.25, 830.61, 987.77, 1318.51, 1661.22] },
        dark:    { wave: 'sawtooth', base: 108, sweep: 34,   notes: [220, 277.18, 329.63, 466.16] },
        poison:  { wave: 'triangle', base: 185, sweep: 125,  notes: [293.66, 349.23, 466.16, 622.25] },
        star:    { wave: 'sine',     base: 880, sweep: 1360, notes: [783.99, 987.77, 1174.66, 1567.98, 2093] },
        sword:   { wave: 'triangle', base: 520, sweep: 900,  notes: [523.25, 659.25, 783.99, 1046.5, 1567.98] }
      };
      const cfg = presets[attrId] || presets.sword;

      const impOsc = ctx.createOscillator();
      const impGain = ctx.createGain();
      impOsc.type = cfg.wave;
      impOsc.frequency.setValueAtTime(cfg.base, now);
      impOsc.frequency.exponentialRampToValueAtTime(Math.max(30, cfg.sweep), now + 0.38);
      impGain.gain.setValueAtTime(0.085, now);
      impGain.gain.exponentialRampToValueAtTime(0.001, now + 0.40);
      impOsc.connect(impGain);
      impGain.connect(ctx.destination);
      impOsc.start(now);
      impOsc.stop(now + 0.42);

      const count = Math.min(cfg.notes.length, 2 + tier);
      for (let i = 0; i < count; i++) {
        const freq = cfg.notes[i];
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = tier >= 2 ? 'triangle' : 'sine';
        const t0 = now + i * 0.042;
        osc.frequency.setValueAtTime(freq, t0);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.025, t0 + 0.38);

        gain.gain.setValueAtTime(0.001, t0);
        gain.gain.linearRampToValueAtTime(0.06, t0 + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.44);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + 0.46);
      }
    } catch (e) {}
  }

  // =========================================================
  // 3. 全11属性テーマ＆進化技名システム
  // =========================================================
  const MAGIC_ATTRIBUTES_V9 = [
    {
      id: 'ice', label: '❄️ 氷華・氷柱魔法',
      desc: '地面の下からクリスタル氷柱が波紋状に次々と生え、進化で本数・太さ・高さが激増！',
      match: /氷|アイス|ブリザード|吹雪|零度|霜|freeze|ice|blizzard/i,
      cardType: '氷華スペル',
      c1: 0x38bdf8, c2: 0xe0f2fe, c3: 0x818cf8,
      bgGrad: 'linear-gradient(135deg, rgba(12,74,110,0.97), rgba(37,99,235,0.93))',
      names: (b) => [b, `【真】氷晶零度・${b}`, `【極】絶対零度符「コキュートス・${b}」`, `【神話奥義】銀世界神話「エターナル・ダイヤモンドダスト」`]
    },
    {
      id: 'fire', label: '🔥 紅蓮・隕石爆炎魔法',
      desc: 'マグマ魔法陣の上空から巨大メテオ群が落下し、着弾で火柱と溶岩リングが炸裂！',
      match: /炎|火|ファイア|ブレイズ|紅蓮|メテオ|爆発|業火|flame|fire|meteor/i,
      cardType: '紅蓮スペル',
      c1: 0xef4444, c2: 0xfacc15, c3: 0xf97316,
      bgGrad: 'linear-gradient(135deg, rgba(127,29,29,0.97), rgba(234,88,12,0.93))',
      names: (b) => [b, `【真】紅蓮爆炎・${b}`, `【極】竜王焦熱符「インフェルノ・${b}」`, `【神話奥義】創世業火「プロミネンス・アルティメットノヴァ」`]
    },
    {
      id: 'thunder', label: '⚡ 紫電・天罰落雷魔法',
      desc: '上空の雷雲リングから分岐するジグザグ稲妻が連打され、電磁ドームがスパーク！',
      match: /雷|電|サンダー|ライトニング|スパーク|雷鳴|thunder|lightning|volt/i,
      cardType: '紫電スペル',
      c1: 0xfacc15, c2: 0xa855f7, c3: 0x38bdf8,
      bgGrad: 'linear-gradient(135deg, rgba(88,28,135,0.97), rgba(202,138,4,0.93))',
      names: (b) => [b, `【真】紫電一閃・${b}`, `【極】雷神降臨符「タケミカヅチ・${b}」`, `【神話奥義】天罰神雷「インドラ・オーバーロードサンダー」`]
    },
    {
      id: 'wind', label: '🌪️ 翠嵐・螺旋竜巻魔法',
      desc: '多重螺旋トルネードが天へ昇り、周囲を真空カマイタチの刃が高速公転する！',
      match: /風|疾風|嵐|ウィンド|トルネード|旋風|烈風|wind|gale|storm/i,
      cardType: '翠嵐スペル',
      c1: 0x34d399, c2: 0xa7f3d0, c3: 0xfde047,
      bgGrad: 'linear-gradient(135deg, rgba(6,78,59,0.97), rgba(16,185,129,0.93))',
      names: (b) => [b, `【真】翠嵐烈風・${b}`, `【極】風神天舞符「テンペスト・${b}」`, `【神話奥義】天空神話「シルフィード・無尽真空覇王斬」`]
    },
    {
      id: 'water', label: '🌊 蒼海・大渦潮水柱魔法',
      desc: '回転する大渦潮から何本もの高圧ウォーターガイザーが噴き上がり大津波が広がる！',
      match: /水|海|波|津波|アクア|水流|渦|aqua|water|wave|ocean/i,
      cardType: '蒼海スペル',
      c1: 0x0284c7, c2: 0x7dd3fc, c3: 0x2dd4bf,
      bgGrad: 'linear-gradient(135deg, rgba(7,89,133,0.97), rgba(13,148,136,0.93))',
      names: (b) => [b, `【真】蒼海激流・${b}`, `【極】海神怒涛符「リヴァイアサン・${b}」`, `【神話奥義】深淵海神「ポセイドン・創世大津波ノヴァ」`]
    },
    {
      id: 'earth', label: '🪨 大地・巨岩隆起魔法',
      desc: '地割れ魔法陣とともに巨大な岩柱が地面から突き出し、砕け散る！',
      match: /地|岩|土|地震|クエイク|砕|earth|rock|quake/i,
      cardType: '大地スペル',
      c1: 0xd97706, c2: 0xfbbf24, c3: 0x92400e,
      bgGrad: 'linear-gradient(135deg, rgba(120,53,15,0.97), rgba(180,83,9,0.93))',
      names: (b) => [b, `【真】剛岩砕破・${b}`, `【極】地母神符「ガイア・クラッシュ・${b}」`, `【神話奥義】星砕神話「タイタン・天地開闢メテオストライク」`]
    },
    {
      id: 'holy', label: '✨ 聖光・天照光輪魔法',
      desc: '天空の光の柱と回転する黄金の天使輪が展開し、聖なる羽根が舞い降りる！',
      match: /光|聖|ホーリー|ヒール|回復|祈り|祝福|天照|ハート|愛|holy|light|heal|bless|heart|love/i,
      cardType: '聖光スペル',
      c1: 0xfde047, c2: 0xffffff, c3: 0xf472b6,
      bgGrad: 'linear-gradient(135deg, rgba(133,77,14,0.97), rgba(217,119,6,0.93))',
      names: (b) => [b, `【真】聖光煌めき・${b}`, `【極】天照聖域符「セイクリッド・${b}」`, `【神話奥義】創世聖典「セラフィム・無限光輪の奇跡」`]
    },
    {
      id: 'dark', label: '🌌 黒蝕・ブラックホール魔法',
      desc: '漆黒のブラックホールが周囲の星屑を吸い込み、最後に超新星爆発を起こす！',
      match: /闇|黒|ダーク|シャドウ|アビス|ブラックホール|dark|void|shadow|abyss/i,
      cardType: '黒蝕スペル',
      c1: 0x9333ea, c2: 0xf43f5e, c3: 0x38bdf8,
      bgGrad: 'linear-gradient(135deg, rgba(30,27,75,0.98), rgba(126,34,206,0.93))',
      names: (b) => [b, `【真】黒蝕冥界・${b}`, `【極】虚空崩壊符「アビスノヴァ・${b}」`, `【神話奥義】終焉神話「ラグナロク・次元黒蝕シンギュラリティ」`]
    },
    {
      id: 'poison', label: '☠️ 呪詛・魔界瘴気魔法',
      desc: '魔界の魔法陣から猛毒オーブと呪いの鎖リングが湧き上がる！',
      match: /毒|呪|ポイズン|ヴェノム|カース|瘴気|poison|venom|curse/i,
      cardType: '呪詛スペル',
      c1: 0xa855f7, c2: 0x4ade80, c3: 0xf43f5e,
      bgGrad: 'linear-gradient(135deg, rgba(59,7,100,0.97), rgba(21,128,61,0.93))',
      names: (b) => [b, `【真】猛毒瘴気・${b}`, `【極】魔界呪詛符「ベリアル・${b}」`, `【神話奥義】混沌神話「ヒュドラ・無間地獄の瘴気陣」`]
    },
    {
      id: 'star', label: '🌟 星屑・銀河流星魔法',
      desc: '銀河スパイラルから流星群が降り注ぎ、プリズムの星屑爆発を起こす！',
      match: /星|宇宙|銀河|スター|コメット|ノヴァ|コスモ|虹|star|comet|nova|cosmos|rainbow/i,
      cardType: '星屑スペル',
      c1: 0xf472b6, c2: 0xfde047, c3: 0x38bdf8,
      bgGrad: 'linear-gradient(135deg, rgba(49,46,129,0.97), rgba(219,39,119,0.93))',
      names: (b) => [b, `【真】星屑流星・${b}`, `【極】銀河星霊符「スターダスト・${b}」`, `【神話奥義】宇宙創世「ビッグバン・ギャラクシーノヴァ」`]
    },
    {
      id: 'sword', label: '⚔️ 秘剣・無限光剣陣',
      desc: '空中に無数の光の剣が出現・整列して一斉に突き刺さり、十字斬撃波が炸裂！',
      match: /.*/,
      cardType: '秘剣スペル',
      c1: 0x38bdf8, c2: 0xf472b6, c3: 0xfde047,
      bgGrad: 'linear-gradient(135deg, rgba(15,23,42,0.97), rgba(3,105,161,0.93))',
      names: (b) => [b, `【真】蒼穹剣閃・${b}`, `【極】剣聖奥義符「天翔十字・${b}」`, `【神話奥義】創世剣神「エクスカリバー・虹翼星屑ノヴァ」`]
    }
  ];

  // =========================================================
  // 4. リアルタイム3Dアニメーション管理エンジン
  // =========================================================
  const activeAnimsV9 = [];
  let _lastFrameV9 = performance.now();

  function register3DAnimationV9(scene, rootGroup, duration, onTick) {
    if (!scene || !rootGroup) return;
    scene.add(rootGroup);
    activeAnimsV9.push({
      scene,
      group: rootGroup,
      elapsed: 0,
      duration: Math.max(0.2, duration),
      onTick
    });
  }

  function step3DLoopV9() {
    const now = performance.now();
    const dt = Math.min(0.05, Math.max(0.001, (now - _lastFrameV9) / 1000));
    _lastFrameV9 = now;

    for (let i = activeAnimsV9.length - 1; i >= 0; i--) {
      const a = activeAnimsV9[i];
      a.elapsed += dt;
      const p = Math.min(1, a.elapsed / a.duration);
      try {
        a.onTick(p, a.elapsed, dt, a.group);
      } catch (e) {}

      if (p >= 1) {
        try {
          a.scene.remove(a.group);
          a.group.traverse?.(obj => {
            if (obj.geometry) obj.geometry.dispose?.();
            if (obj.material) {
              if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose?.());
              else obj.material.dispose?.();
            }
          });
        } catch (e) {}
        activeAnimsV9.splice(i, 1);
      }
    }
    requestAnimationFrame(step3DLoopV9);
  }
  requestAnimationFrame(step3DLoopV9);

  // =========================================================
  // 5. スペルカードカットイン表示＆詠唱プレイヤーオーラ
  // =========================================================
  function showSpellCardCutinV9(game, info) {
    playMagicAudioV9(info.theme.id, info.tier);

    let layer = document.getElementById('kmj-v9-cutin-layer');
    if (!layer) {
      layer = document.createElement('div');
      layer.id = 'kmj-v9-cutin-layer';
      document.body.appendChild(layer);
    }

    const d = game?.saveData || {};
    const myFace = d.kaomoji || d.face || game?.player?.kaomoji || '(｀・ω・´)';
    const borderCols = ['#38bdf8', '#4ade80', '#facc15', '#f472b6'];
    const bCol = borderCols[info.tier] || '#fde047';

    layer.innerHTML = '';

    if (info.tier >= 1) {
      const flash = document.createElement('div');
      flash.className = 'kmj-v9-flash';
      flash.style.background = info.tier >= 3
        ? 'radial-gradient(circle, rgba(253,224,71,0.62) 0%, rgba(244,114,182,0.38) 60%, transparent 100%)'
        : 'radial-gradient(circle, rgba(255,255,255,0.52) 0%, rgba(56,189,248,0.24) 70%, transparent 100%)';
      layer.appendChild(flash);

      const lTop = document.createElement('div');
      lTop.className = 'kmj-v9-line-top';
      const lBot = document.createElement('div');
      lBot.className = 'kmj-v9-line-bot';
      layer.appendChild(lTop);
      layer.appendChild(lBot);
    }

    const banner = document.createElement('div');
    banner.className = 'kmj-v9-banner';
    banner.style.background = info.theme.bgGrad;
    banner.style.borderColor = bCol;

    const subTxt = info.tier >= 1
      ? `✦ ${info.theme.cardType}発動 ・ ${info.tierLabel} (Lv.${info.skillLv}) ✦`
      : `✦ ${info.theme.label} ・ MAGIC CAST (Lv.${info.skillLv}) ✦`;

    banner.innerHTML = `
      <div class="kmj-v9-ring-1"></div>
      <div class="kmj-v9-ring-2"></div>
      <div class="kmj-v9-banner-inner">
        <div class="kmj-v9-avatar" style="border-color:${bCol};">${myFace}</div>
        <div>
          <div style="font-size:10.5px;font-weight:900;color:#fde047;letter-spacing:0.06em;text-shadow:0 1px 4px #000;">${subTxt}</div>
          <div style="font-size:${info.tier >= 2 ? '16.5px' : '15px'};font-weight:900;color:#ffffff;text-shadow:0 2px 10px rgba(0,0,0,0.95), 0 0 14px ${bCol};margin-top:2px;">
            ${info.evolvedName}
          </div>
        </div>
      </div>
    `;
    layer.appendChild(banner);
    setTimeout(() => { if (layer) layer.innerHTML = ''; }, 2400);
  }

  function spawnCasterChantAuraV9(game, entity, info) {
    if (!game?.useWebGL || !game?.scene || !entity?.pos || typeof THREE === 'undefined') return;
    const tier = info?.tier ?? 0;
    const c1 = info?.theme?.c1 ?? 0x38bdf8;
    const c2 = info?.theme?.c2 ?? 0xfde047;

    const grp = new THREE.Group();
    const footRing1 = new THREE.Mesh(
      new THREE.RingGeometry(0.95, 1.35 + tier * 0.2, 32),
      new THREE.MeshBasicMaterial({ color: c1, side: THREE.DoubleSide, transparent: true, opacity: 0.92 })
    );
    footRing1.rotation.x = -Math.PI / 2;
    footRing1.position.y = 0.08;
    grp.add(footRing1);

    const footRing2 = new THREE.Mesh(
      new THREE.RingGeometry(1.45 + tier * 0.2, 1.65 + tier * 0.25, 6),
      new THREE.MeshBasicMaterial({ color: c2, side: THREE.DoubleSide, transparent: true, opacity: 0.92 })
    );
    footRing2.rotation.x = -Math.PI / 2;
    footRing2.position.y = 0.10;
    grp.add(footRing2);

    const motes = [];
    for (let i = 0; i < 8 + tier * 4; i++) {
      const ang = (Math.PI * 2 * i) / (8 + tier * 4);
      const m = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.14, 0),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? c1 : c2, transparent: true, opacity: 0.95 })
      );
      grp.add(m);
      motes.push({ mesh: m, ang });
    }

    register3DAnimationV9(game.scene, grp, 0.75, (p, elapsed) => {
      grp.position.set(entity.pos.x, 0, entity.pos.z);
      footRing1.rotation.z = elapsed * 4;
      footRing2.rotation.z = -elapsed * 5;
      const fade = p > 0.65 ? Math.max(0, 1 - (p - 0.65) / 0.35) : 1;
      footRing1.material.opacity = fade * 0.92;
      footRing2.material.opacity = fade * 0.92;
      motes.forEach((mt, idx) => {
        const r = 1.15 - p * 0.3;
        mt.mesh.position.set(Math.cos(mt.ang + elapsed * 5) * r, 0.2 + p * 2.4 + (idx % 3) * 0.2, Math.sin(mt.ang + elapsed * 5) * r);
        mt.mesh.material.opacity = fade * 0.95;
      });
    });
  }

  // =========================================================
  // 6. 公開API（全14種スキル取得・MP5倍＆1Lv毎+10同期・スタジオUI）
  // =========================================================
  window.KMJ_SKILL_FX_V9 = {
    ATTRIBUTES: MAGIC_ATTRIBUTES_V9,
    EFFECT_BUILDERS: {},
    register3DAnimation: register3DAnimationV9,
    showSpellCardCutin: showSpellCardCutinV9,
    spawnCasterChantAura: spawnCasterChantAuraV9,

    // ゲーム内に定義された全14種スキルを漏れなく取得
    getAll14Skills(game) {
      let list = [];
      if (typeof SKILLS !== 'undefined' && SKILLS) {
        list = (Array.isArray(SKILLS) ? SKILLS : Object.values(SKILLS)).filter(s => s && typeof s === 'object');
      }
      // もし14種未満の場合でも14種リストを補完
      const fallback14 = [
        { id: 'sk_1', name: 'スラッシュ斬撃', mpCost: 16, icon: '⚔️' },
        { id: 'sk_2', name: 'ファイアボール', mpCost: 20, icon: '🔥' },
        { id: 'sk_3', name: 'アイスニードル氷柱', mpCost: 20, icon: '❄️' },
        { id: 'sk_4', name: 'サンダーボルト落雷', mpCost: 22, icon: '⚡' },
        { id: 'sk_5', name: 'ウィンドトルネード', mpCost: 22, icon: '🌪️' },
        { id: 'sk_6', name: 'アクアゲイザー津波', mpCost: 24, icon: '🌊' },
        { id: 'sk_7', name: 'アースクエイク岩砕', mpCost: 24, icon: '🪨' },
        { id: 'sk_8', name: 'ホーリーヒール聖光', mpCost: 16, icon: '💖' },
        { id: 'sk_9', name: 'ダークアビス黒蝕', mpCost: 28, icon: '🌌' },
        { id: 'sk_10', name: 'ポイズンミスト瘴気', mpCost: 22, icon: '☠️' },
        { id: 'sk_11', name: 'スターダスト流星群', mpCost: 30, icon: '🌟' },
        { id: 'sk_12', name: 'メテオストライク業火', mpCost: 35, icon: '☄️' },
        { id: 'sk_13', name: 'アブソリュート零度吹雪', mpCost: 35, icon: '🧊' },
        { id: 'sk_14', name: '創世虹翼アルティメットノヴァ', mpCost: 50, icon: '🌈' }
      ];
      if (list.length === 0) return fallback14;
      return list;
    },

    getSkillInfo(game, slotOrSkill = 0) {
      const d = game?.saveData || {};
      let slotIdx = typeof slotOrSkill === 'number' ? slotOrSkill : 0;
      let rawSkill = null;
      let skillLv = 1;

      const allList = this.getAll14Skills(game);

      if (typeof slotOrSkill === 'object' && slotOrSkill !== null) {
        rawSkill = slotOrSkill;
        const sid = String(rawSkill.id || rawSkill.skillId || '');
        skillLv = Math.max(1, Number(d.skillLevels?.[sid] ?? d.skillLvs?.[sid] ?? rawSkill.lv ?? rawSkill.level ?? 1));
      } else {
        if (typeof game?.resolveSkillMeta === 'function') {
          const meta = game.resolveSkillMeta(slotIdx);
          if (meta) {
            skillLv = Math.max(1, Number(meta.skillLv || 1));
            rawSkill = allList.find(s => String(s.id) === String(meta.skillId) || String(s.skillId) === String(meta.skillId)) || allList[slotIdx] || null;
          }
        }
        if (!rawSkill) rawSkill = allList[slotIdx] || allList[0];
      }

      const defaultOrig = [20, 26, 22, 16, 30, 18, 24, 28, 32, 35, 40, 45, 50, 60][slotIdx] || 16;
      if (rawSkill && rawSkill._origMpV9 === undefined) {
        const detected = Number(rawSkill.mpCost ?? rawSkill.mp ?? rawSkill.costMp ?? 0);
        rawSkill._origMpV9 = detected > 0 ? detected : defaultOrig;
      }
      if (rawSkill && !rawSkill._origNameV9 && typeof rawSkill.name === 'string') {
        rawSkill._origNameV9 = rawSkill.name.replace(/^【(真|極|奥義|神話奥義)】[^「・]*[・「]?|」$/g, '').trim() || rawSkill.name;
      }

      const origMp = rawSkill?._origMpV9 || defaultOrig;
      // 素のMP消費5倍 ＋ 1レベ上がる毎に消費MPが10増加！
      const mpCost = (origMp * 5) + (skillLv - 1) * 10;

      const origName = rawSkill?._origNameV9 || `秘技・第${slotIdx + 1}の型`;
      const tier = skillLv >= 100 ? 3 : (skillLv >= 50 ? 2 : (skillLv >= 10 ? 1 : 0));
      const theme = MAGIC_ATTRIBUTES_V9.find(t => t.match.test(`${origName} ${rawSkill?.desc || ''}`)) || MAGIC_ATTRIBUTES_V9[MAGIC_ATTRIBUTES_V9.length - 1];
      const evolvedName = theme.names(origName)[tier] || origName;
      const tierLabels = ['通常魔法', '✨ 魔法進化Ⅰ【真】', '🔥 魔法進化Ⅱ【極】', '🌈 魔法最終進化【神話スペルカード】'];

      return {
        rawSkill, slotIdx, skillLv, origMp, mpCost, origName, evolvedName,
        tier, tierLabel: tierLabels[tier], theme
      };
    },

    syncAllSkills(game) {
      const allList = this.getAll14Skills(game);
      allList.forEach(sk => {
        if (!sk || typeof sk !== 'object') return;
        const info = this.getSkillInfo(game, sk);
        if ('mpCost' in sk) sk.mpCost = info.mpCost;
        if ('mp' in sk) sk.mp = info.mpCost;
        if ('costMp' in sk) sk.costMp = info.mpCost;
        if (typeof sk.name === 'string') sk.name = info.evolvedName;
      });

      // 右下の全スキルボタン（16のまま残っているボタンも含め全スロット）を確実に同期
      const slotBtns = document.querySelectorAll('.skill-slot-btn, .skill-slot, .skill-btn, [data-skill-slot]');
      slotBtns.forEach((btn, idx) => {
        const slot = btn.dataset.skillSlot !== undefined ? Number(btn.dataset.skillSlot) : idx;
        const info = this.getSkillInfo(game, slot);
        btn.title = `${info.evolvedName} (Lv.${info.skillLv} / 消費MP:${info.mpCost})`;

        btn.querySelectorAll('span, div, small, b').forEach(el => {
          if (el.children.length > 0) return;
          const txt = (el.textContent || '').trim();
          // Lv.表記（Lv.1 等）以外の数値（消費MP）を必ず info.mpCost に更新
          if (/^\d+$/.test(txt) && Number(txt) !== info.mpCost) {
            el.textContent = String(info.mpCost);
          } else if (/^MP\s*\d+$/i.test(txt)) {
            el.textContent = `MP ${info.mpCost}`;
          } else if (info.origName && txt.includes(info.origName) && txt !== info.evolvedName) {
            el.textContent = info.evolvedName;
          }
        });
      });
    },

    // 全14種スキル対応の「🎬 魔法エフェクトスタジオ」モーダル
    openStudioModal(game) {
      document.getElementById('kmj-v9-studio-modal')?.remove();
      const wrap = document.createElement('div');
      wrap.id = 'kmj-v9-studio-modal';

      const all14 = this.getAll14Skills(game);
      const cards = all14.map((sk, idx) => {
        const info = this.getSkillInfo(game, sk);
        const icon = sk.icon || '✨';
        return `
          <div style="background:rgba(15,23,42,0.92);border:1.5px solid #38bdf8;border-radius:10px;padding:8px;margin-bottom:7px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <div style="font-size:12px;font-weight:900;color:#fff;">${idx + 1}. ${icon} ${info.origName}</div>
              <span style="font-size:10px;font-weight:900;color:#fde047;">${info.theme.label}</span>
            </div>
            <div style="font-size:9.5px;color:#93c5fd;margin:2px 0 6px;">
              現在Lv.${info.skillLv}（消費MP: ${info.mpCost} ／ 素MP${info.origMp}×5 + 1Lv毎+10）
            </div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;">
              <button type="button" class="v9-cast-skill-btn" data-idx="${idx}" data-tier="0" style="background:#334155;color:#fff;border:none;border-radius:5px;padding:5px 2px;font-size:9.5px;font-weight:900;cursor:pointer;">Lv.1 通常</button>
              <button type="button" class="v9-cast-skill-btn" data-idx="${idx}" data-tier="1" style="background:#0284c7;color:#fff;border:none;border-radius:5px;padding:5px 2px;font-size:9.5px;font-weight:900;cursor:pointer;">Lv.10【真】</button>
              <button type="button" class="v9-cast-skill-btn" data-idx="${idx}" data-tier="2" style="background:#d97706;color:#fff;border:none;border-radius:5px;padding:5px 2px;font-size:9.5px;font-weight:900;cursor:pointer;">Lv.50【極】</button>
              <button type="button" class="v9-cast-skill-btn" data-idx="${idx}" data-tier="3" style="background:linear-gradient(90deg,#db2777,#7c3aed);color:#fde047;border:none;border-radius:5px;padding:5px 2px;font-size:9.5px;font-weight:900;cursor:pointer;">Lv.100【神話】</button>
            </div>
          </div>
        `;
      }).join('');

      wrap.innerHTML = `
        <div class="kmj-v9-studio-card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
            <b style="font-size:13.5px;color:#f9a8d4;">🎬 全${all14.length}種スキル 魔法エフェクトスタジオ</b>
            <button type="button" id="kmj-v9-close-studio" style="background:#ef4444;color:#fff;border:none;border-radius:6px;padding:4px 10px;font-size:11px;font-weight:900;cursor:pointer;">✕ 閉じる</button>
          </div>
          <div style="font-size:10px;color:#fde047;margin-bottom:8px;">
            ※ 全${all14.length}種のスキルそれぞれで「Lv.1〜Lv.100【神話奥義】」の進化3Dエフェクトを大画面で試し撃ちできます！
          </div>
          ${cards}
        </div>
      `;
      document.body.appendChild(wrap);

      wrap.querySelector('#kmj-v9-close-studio').onclick = () => wrap.remove();
      wrap.addEventListener('click', (e) => { if (e.target === wrap) wrap.remove(); });
      wrap.querySelectorAll('.v9-cast-skill-btn').forEach(btn => {
        btn.onclick = () => {
          const idx = Number(btn.dataset.idx);
          const tier = Number(btn.dataset.tier);
          const sk = all14[idx];
          wrap.remove();
          setTimeout(() => {
            this.previewSkillByObj?.(game, sk, tier);
          }, 80);
        };
      });
    },

    injectSkillPreviewUI(game, body, tab) {
      if (!body) return;
      const txt = body.textContent || '';
      if (!/skill|magic|art/.test(tab) && !txt.includes('スキル強化')) return;
      if (body.querySelector('#kmj-v9-inline-studio-btn')) return;
      const count = this.getAll14Skills(game).length;
      body.insertAdjacentHTML('afterbegin', `
        <div class="card-box" style="margin-bottom:8px;border:1.5px solid #f472b6;background:rgba(30,27,75,0.95);display:flex;align-items:center;justify-content:space-between;gap:8px;">
          <div>
            <div style="font-size:11px;font-weight:900;color:#f9a8d4;">🎬 全${count}種スキル 魔法エフェクトスタジオ</div>
            <div style="font-size:9.5px;color:#cbd5e1;">全${count}種のスキルそれぞれでLv進化3D魔法を試せます！</div>
          </div>
          <button type="button" id="kmj-v9-inline-studio-btn" style="background:linear-gradient(90deg,#ec4899,#8b5cf6);border:none;color:#fff;border-radius:7px;padding:7px 11px;font-size:11px;font-weight:900;cursor:pointer;white-space:nowrap;">⚡ スタジオを開く</button>
        </div>
      `);
      body.querySelector('#kmj-v9-inline-studio-btn').onclick = () => this.openStudioModal(game);
    }
  };
})();
// ▲▲▲ ここまで【スキルエフェクト専用 game9.js 1/3】 ▲▲▲
// ▼▼▼ ここから【スキルエフェクト専用 game9.js 2/3】5大元素の超本格3D魔法ビルダー（氷柱波紋隆起・隕石群落下・分岐落雷連打・螺旋竜巻＆真空刃・大渦潮水柱） ▼▼▼
(() => {
  'use strict';

  const V9 = window.KMJ_SKILL_FX_V9;
  if (!V9 || !V9.EFFECT_BUILDERS) return;

  // 共通ヘルパー：範囲の地面に幾何学魔法陣（六芒星・八芒星・外周ルーンリング）を展開
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
  // 1. ❄️ 氷華・氷柱魔法（地面の下からクリスタル氷柱が波紋状に次々と生えて進化！）
  // =========================================================
  V9.EFFECT_BUILDERS.ice = function (root, info, scale) {
    const tier = info.tier; // 0:通常, 1:真, 2:極, 3:神話
    const c1 = info.theme.c1;
    const c2 = info.theme.c2;
    const c3 = info.theme.c3;
    const areaRadius = (2.2 + tier * 0.8) * scale;

    const magicRings = [];
    addMagicCircleBase(root, areaRadius, c1, c2, tier, magicRings);

    // 範囲全体の氷結フロストフィールド
    const frostFloor = new THREE.Mesh(
      new THREE.CircleGeometry(areaRadius, 32),
      new THREE.MeshBasicMaterial({ color: c1, side: THREE.DoubleSide, transparent: true, opacity: 0 })
    );
    frostFloor.rotation.x = -Math.PI / 2;
    frostFloor.position.y = 0.03;
    root.add(frostFloor);

    // 地面の下から波紋状に時間差で突き出すクリスタル氷柱群（進化で層数・本数・太さ・高さが激増！）
    const spikes = [];
    const layerCount = 1 + tier; // Lv1:1重(7本) → Lv10:2重(18本) → Lv50:3重(33本) → Lv100:4重(52本)
    for (let layer = 0; layer < layerCount; layer++) {
      const countInLayer = 7 + layer * 4;
      const layerRadius = areaRadius * (0.28 + (layer / Math.max(1, layerCount)) * 0.68);
      for (let i = 0; i < countInLayer; i++) {
        const ang = (Math.PI * 2 * i) / countInLayer + layer * 0.35;
        const h = (1.9 + (layerCount - layer) * 0.55 + (i % 3) * 0.45) * scale;
        const rBase = (0.22 + tier * 0.05 + (i % 2) * 0.06) * scale;

        const spikeGrp = new THREE.Group();
        const outerIce = new THREE.Mesh(
          new THREE.ConeGeometry(rBase, h, 6),
          new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? c1 : c3, transparent: true, opacity: 0.86 })
        );
        const innerCore = new THREE.Mesh(
          new THREE.ConeGeometry(rBase * 0.48, h * 0.85, 6),
          new THREE.MeshBasicMaterial({ color: c2, transparent: true, opacity: 0.96 })
        );
        spikeGrp.add(outerIce);
        spikeGrp.add(innerCore);

        const px = Math.cos(ang) * layerRadius;
        const pz = Math.sin(ang) * layerRadius;
        const startY = -h * 0.68;
        const targetY = h * 0.46;

        spikeGrp.position.set(px, startY, pz);
        const tilt = 0.14 + layer * 0.08;
        spikeGrp.rotation.z = -Math.cos(ang) * tilt;
        spikeGrp.rotation.x = Math.sin(ang) * tilt;

        root.add(spikeGrp);
        spikes.push({
          grp: spikeGrp,
          outerMat: outerIce.material,
          innerMat: innerCore.material,
          startY,
          targetY,
          delay: layer * 0.10 + (i % 3) * 0.025
        });
      }
    }

    // 進化段階 tier >= 1 で中央から超巨大な「絶対零度の王冠氷柱」が突き出す！
    let giantSpike = null;
    if (tier >= 1) {
      const gh = (3.6 + tier * 1.15) * scale;
      giantSpike = new THREE.Mesh(
        new THREE.ConeGeometry((0.50 + tier * 0.15) * scale, gh, 8),
        new THREE.MeshBasicMaterial({ color: c2, transparent: true, opacity: 0.95 })
      );
      giantSpike.position.set(0, -gh * 0.65, 0);
      giantSpike.userData = { startY: -gh * 0.65, targetY: gh * 0.48 };
      root.add(giantSpike);
    }

    // ダイヤモンドダスト結晶パーティクル
    const flakes = [];
    const flakeCount = 14 + tier * 8;
    for (let i = 0; i < flakeCount; i++) {
      const ang = (Math.PI * 2 * i) / flakeCount;
      const rad = Math.random() * areaRadius;
      const fl = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.15 * scale, 0),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? c2 : c1, transparent: true, opacity: 0.95 })
      );
      const topY = (2.6 + Math.random() * 3.2) * scale;
      fl.position.set(Math.cos(ang) * rad, topY, Math.sin(ang) * rad);
      root.add(fl);
      flakes.push({ mesh: fl, topY, spd: 1.6 + Math.random() * 1.5 });
    }

    return (p, elapsed) => {
      const fade = p > 0.72 ? Math.max(0, 1 - (p - 0.72) / 0.28) : 1;

      magicRings.forEach(r => {
        r.mesh.rotation.z = elapsed * r.speed;
        r.mesh.material.opacity = fade * 0.92;
      });

      frostFloor.material.opacity = Math.min(0.34, p * 0.85) * fade;

      spikes.forEach(sp => {
        const lp = Math.max(0, Math.min(1, (p - sp.delay) / 0.25));
        const easeOut = 1 - Math.pow(1 - lp, 3);
        sp.grp.position.y = sp.startY + (sp.targetY - sp.startY) * easeOut;
        sp.outerMat.opacity = fade * 0.86;
        sp.innerMat.opacity = fade * 0.96;
      });

      if (giantSpike) {
        const gp = Math.max(0, Math.min(1, (p - 0.16) / 0.28));
        const easeG = 1 - Math.pow(1 - gp, 3);
        giantSpike.position.y = giantSpike.userData.startY + (giantSpike.userData.targetY - giantSpike.userData.startY) * easeG;
        giantSpike.rotation.y = elapsed * 2.5;
        giantSpike.material.opacity = fade * 0.95;
      }

      flakes.forEach(fl => {
        fl.mesh.position.y = Math.max(0.1, fl.topY - p * fl.spd * scale);
        fl.mesh.rotation.set(elapsed * 4, elapsed * 5, 0);
        fl.mesh.material.opacity = fade * 0.95;
      });
    };
  };

  // =========================================================
  // 2. 🔥 紅蓮・隕石爆炎魔法（マグマ魔法陣の上空から巨大メテオ群が連続落下＆大爆発！）
  // =========================================================
  V9.EFFECT_BUILDERS.fire = function (root, info, scale) {
    const tier = info.tier;
    const c1 = info.theme.c1;
    const c2 = info.theme.c2;
    const c3 = info.theme.c3;
    const areaRadius = (2.2 + tier * 0.75) * scale;

    const magicRings = [];
    addMagicCircleBase(root, areaRadius, c1, c2, tier, magicRings);

    // 進化に応じて落下する隕石の数が激増（1個 → 3個 → 5個 → 7個）
    const meteorCount = 1 + tier * 2;
    const meteors = [];
    for (let i = 0; i < meteorCount; i++) {
      const isMain = (i === 0);
      const ang = (Math.PI * 2 * i) / Math.max(1, meteorCount - 1);
      const dist = isMain ? 0 : areaRadius * 0.6;
      const mx = Math.cos(ang) * dist;
      const mz = Math.sin(ang) * dist;
      const mSize = (isMain ? 0.98 : 0.60) * scale;

      const mGrp = new THREE.Group();
      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(mSize, 1),
        new THREE.MeshBasicMaterial({ color: c3, transparent: true, opacity: 0.96 })
      );
      const core = new THREE.Mesh(
        new THREE.SphereGeometry(mSize * 0.72, 16, 16),
        new THREE.MeshBasicMaterial({ color: c2, transparent: true, opacity: 0.95 })
      );
      mGrp.add(rock);
      mGrp.add(core);
      const startY = (8.8 + i * 1.2) * scale;
      mGrp.position.set(mx, startY, mz);
      root.add(mGrp);

      const shock = new THREE.Mesh(
        new THREE.RingGeometry(0.3 * scale, 0.88 * scale, 28),
        new THREE.MeshBasicMaterial({ color: c1, side: THREE.DoubleSide, transparent: true, opacity: 0 })
      );
      shock.rotation.x = -Math.PI / 2;
      shock.position.set(mx, 0.12 + i * 0.02, mz);
      root.add(shock);

      meteors.push({
        grp: mGrp, rockMat: rock.material, coreMat: core.material,
        shock, startY, impactP: 0.24 + i * 0.055, isMain
      });
    }

    // 噴き上がる紅蓮の火柱コーン群
    const pillars = [];
    const pCount = 7 + tier * 4;
    for (let i = 0; i < pCount; i++) {
      const ang = (Math.PI * 2 * i) / pCount;
      const rad = areaRadius * (0.35 + (i % 2) * 0.45);
      const h = (2.5 + (i % 3) * 0.75) * scale;
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(0.35 * scale, h, 10),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? c1 : c2, transparent: true, opacity: 0 })
      );
      cone.position.set(Math.cos(ang) * rad, 0.1, Math.sin(ang) * rad);
      root.add(cone);
      pillars.push({ mesh: cone, baseH: h });
    }

    return (p, elapsed) => {
      const fade = p > 0.74 ? Math.max(0, 1 - (p - 0.74) / 0.26) : 1;

      magicRings.forEach(r => {
        r.mesh.rotation.z = elapsed * r.speed;
        r.mesh.material.opacity = fade * 0.92;
      });

      meteors.forEach(mt => {
        if (p < mt.impactP) {
          const t = p / mt.impactP;
          mt.grp.position.y = mt.startY * (1 - t * t) + 0.6 * scale;
          mt.grp.rotation.set(elapsed * 9, elapsed * 7, 0);
        } else {
          const exp = Math.min(1, (p - mt.impactP) / 0.45);
          mt.grp.position.y = 0.6 * scale;
          mt.grp.scale.setScalar(1 + exp * (mt.isMain ? 1.85 : 1.25));
          mt.rockMat.opacity = Math.max(0, (1 - exp) * 0.96);
          mt.coreMat.opacity = Math.max(0, (1 - exp) * 0.95);

          mt.shock.material.opacity = Math.max(0, (1 - exp) * 0.95);
          mt.shock.scale.setScalar(1 + exp * (mt.isMain ? 4.4 : 2.8));
        }
      });

      if (p >= 0.24) {
        const ep = Math.min(1, (p - 0.24) / 0.5);
        const hFactor = Math.sin(ep * Math.PI);
        pillars.forEach(pl => {
          pl.mesh.material.opacity = hFactor * 0.92;
          pl.mesh.scale.set(1, Math.max(0.05, hFactor), 1);
          pl.mesh.position.y = pl.baseH * 0.5 * hFactor;
        });
      }
    };
  };

  // =========================================================
  // 3. ⚡ 紫電・天罰落雷魔法（上空の雷雲リングから分岐するジグザグ落雷連打＋電撃ドーム！）
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
        bt.segs.forEach(sg => {
          sg.material.opacity = on * strobe * fade * 0.96;
        });
      });

      dome.rotation.y = elapsed * 6;
      dome.material.opacity = strobe * fade * 0.78;
    };
  };

  // =========================================================
  // 4. 🌪️ 翠嵐・螺旋竜巻魔法（多重螺旋トルネード上昇＋周囲を公転する真空カマイタチの刃！）
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
  // 5. 🌊 蒼海・大渦潮水柱魔法（大渦潮＋複数の高圧ウォーターガイザー＋大津波リング！）
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
})();
// ▲▲▲ ここまで【スキルエフェクト専用 game9.js 2/3】 ▲▲▲
// ▼▼▼ ここから【スキルエフェクト専用 game9.js 3/3】残り6属性の超本格3D魔法ビルダー（巨岩隆起・天照光輪・ブラックホール吸引爆発・魔界鎖・銀河流星群・無限光剣陣）＆全14種スキル統合実行エンジン ▼▼▼
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
  // 6. 🪨 大地・巨岩隆起魔法（地面の下から巨岩柱群が波紋状に突き出し砕け散る！）
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
  // 7. ✨ 聖光・天照光輪魔法（極太聖光柱＋回転する多重天使輪＋舞い降りる光の羽根！）
  // =========================================================
  V9.EFFECT_BUILDERS.holy = function (root, info, scale) {
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
  // 8. 🌌 黒蝕・ブラックホール魔法（漆黒球体が周囲を吸引し、最後に超新星爆発！）
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
  // 9. ☠️ 呪詛・魔界瘴気魔法（六芒星陣＋呪いの回転鎖リング＋猛毒バブル湧き上がり！）
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
  // 10. 🌟 星屑・銀河流星魔法（銀河スパイラルから流星群が降り注ぎプリズム爆発！）
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
  // 11. ⚔️ 秘剣・無限光剣陣（空中に光剣群が円陣展開し、中心へ一斉突き刺さり十字斬撃波！）
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
  // 12. 統合実行関数＆全14種スタジオプレビュー＆ペット連携ビーム＆12クラス通常攻撃フック
  // =========================================================
  function executeFullMagic3D(game, entity, info) {
    if (!game?.useWebGL || !game?.scene || !entity?.pos || typeof THREE === 'undefined') return;

    V9.spawnCasterChantAura(game, entity, info);

    const tier = info?.tier ?? 0;
    const attrId = info?.theme?.id || 'sword';
    const c1 = info?.theme?.c1 ?? 0x38bdf8;
    const c2 = info?.theme?.c2 ?? 0xf472b6;
    const c3 = info?.theme?.c3 ?? 0xfde047;
    const scale = 1.25 + tier * 0.45;
    const duration = 1.25 + tier * 0.22;

    let targetX = entity.pos.x + Math.sin(entity.rotY || 0) * 3.0;
    let targetZ = entity.pos.z + Math.cos(entity.rotY || 0) * 3.0;
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

    const root = new THREE.Group();
    root.position.set(targetX, 0, targetZ);

    const halos = [];
    if (tier >= 1) {
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
    const sparkCount = 16 + tier * 8;
    const rainbow = [0xf472b6, 0x38bdf8, 0xfde047, 0x34d399, 0xa855f7, 0xf97316];
    for (let i = 0; i < sparkCount; i++) {
      const ang = (Math.PI * 2 * i) / sparkCount;
      const col = tier >= 3 ? rainbow[i % rainbow.length] : (i % 3 === 0 ? c1 : (i % 3 === 1 ? c2 : c3));
      const sp = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.22 + tier * 0.05, 0),
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.95 })
      );
      sp.position.set(0, 0.8 + (i % 4) * 0.3, 0);
      root.add(sp);
      sparks.push({
        mesh: sp,
        vx: Math.cos(ang) * (3.5 + (i % 3) * 1.4) * scale,
        vy: (2.8 + (i % 4) * 1.1) * scale,
        vz: Math.sin(ang) * (3.5 + (i % 3) * 1.4) * scale,
        startY: 0.8 + (i % 4) * 0.3
      });
    }

    V9.register3DAnimation(game.scene, root, duration, (p, elapsed, dt) => {
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

    if (game?.pet?.pos) {
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
      game.shakeTimer = Math.max(game.shakeTimer, 0.28 + tier * 0.10);
    }
  }

  V9.castSkillEffect = function (game, slotIdx = 0) {
    const info = V9.getSkillInfo(game, slotIdx);
    executeFullMagic3D(game, game?.player, info);
    V9.showSpellCardCutin(game, info);
  };

  // 全14種スキルスタジオからの単体・進化段階別プレビュー実行
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

  V9.previewCustomEffect = function (game, attrId = 'ice', tier = 3) {
    const theme = V9.ATTRIBUTES.find(a => a.id === attrId) || V9.ATTRIBUTES[0];
    const lvMap = [1, 10, 50, 100];
    const tierLabels = ['通常魔法', '✨ 魔法進化Ⅰ【真】', '🔥 魔法進化Ⅱ【極】', '🌈 魔法最終進化【神話スペルカード】'];
    const baseName = `${theme.label.replace(/^[^\s]+\s*/, '')}`;
    const info = {
      slotIdx: 0,
      skillLv: lvMap[tier] || 100,
      mpCost: 100,
      origName: baseName,
      evolvedName: theme.names(baseName)[tier] || baseName,
      tier,
      tierLabel: tierLabels[tier] || tierLabels[3],
      theme
    };
    executeFullMagic3D(game, game?.player, info);
    V9.showSpellCardCutin(game, info);
  };

  // 12クラス別・通常攻撃3Dエフェクト
  function spawnClassBasicAttackV9(game, entity) {
    if (!game?.useWebGL || !game?.scene || !entity?.pos || typeof THREE === 'undefined') return;
    const isLocal = (entity === game.player);
    const clsId = String(isLocal ? (game.saveData?.evolutionId ?? game.saveData?.classId ?? 'novice') : (entity.evolutionId ?? 'novice'));
    const rotY = entity.rotY || 0;
    const dirX = Math.sin(rotY);
    const dirZ = Math.cos(rotY);

    const presets = {
      novice:          { c1: 0x38bdf8, c2: 0xe0f2fe, sc: 1.0, arcs: 1, cross: false, ring: false },
      warrior:         { c1: 0xef4444, c2: 0xf97316, sc: 1.32, arcs: 2, cross: false, ring: true },
      spellblade:      { c1: 0x38bdf8, c2: 0xa855f7, sc: 1.35, arcs: 2, cross: false, ring: true },
      paladin:         { c1: 0xfde047, c2: 0xffffff, sc: 1.48, arcs: 2, cross: true, ring: true },
      arch_spellblade: { c1: 0xa855f7, c2: 0xfde047, sc: 1.55, arcs: 3, cross: false, ring: true },
      ninja:           { c1: 0x34d399, c2: 0xa7f3d0, sc: 1.48, arcs: 3, cross: false, ring: true },
      blade_master:    { c1: 0x38bdf8, c2: 0xfacc15, sc: 1.68, arcs: 3, cross: true, ring: true },
      astral_knight:   { c1: 0xf472b6, c2: 0xfde047, sc: 1.72, arcs: 3, cross: true, ring: true },
      dragoon:         { c1: 0xdc2626, c2: 0xfacc15, sc: 1.85, arcs: 3, cross: false, ring: true },
      emperor_blade:   { c1: 0xfacc15, c2: 0xf472b6, sc: 2.10, arcs: 4, cross: true, ring: true },
      void_overlord:   { c1: 0x9333ea, c2: 0xf43f5e, sc: 2.25, arcs: 4, cross: true, ring: true },
      mythic_god:      { c1: 0xf472b6, c2: 0x38bdf8, sc: 2.50, arcs: 5, cross: true, ring: true }
    };
    const cfg = presets[clsId] || presets.novice;

    const grp = new THREE.Group();
    grp.position.set(entity.pos.x + dirX * 1.3, 0, entity.pos.z + dirZ * 1.3);

    const meshes = [];
    for (let a = 0; a < cfg.arcs; a++) {
      const m = new THREE.MeshBasicMaterial({ color: a % 2 === 0 ? cfg.c1 : cfg.c2, side: THREE.DoubleSide, transparent: true, opacity: 0.94 });
      const arc = new THREE.Mesh(
        new THREE.RingGeometry((0.72 + a * 0.28) * cfg.sc, (1.48 + a * 0.35) * cfg.sc, 24, 1, -Math.PI * 0.48, Math.PI * 0.96),
        m
      );
      arc.rotation.set(Math.PI * (0.35 - a * 0.08), rotY, -0.55 + a * 0.45);
      arc.position.y = 1.05 + a * 0.16;
      grp.add(arc);
      meshes.push(m);
    }

    if (cfg.cross) {
      const m = new THREE.MeshBasicMaterial({ color: cfg.c2, side: THREE.DoubleSide, transparent: true, opacity: 0.92 });
      const vArc = new THREE.Mesh(
        new THREE.RingGeometry(0.75 * cfg.sc, 1.75 * cfg.sc, 24, 1, -Math.PI * 0.45, Math.PI * 0.9),
        m
      );
      vArc.rotation.set(0, rotY + Math.PI * 0.5, 0.25);
      vArc.position.y = 1.25;
      grp.add(vArc);
      meshes.push(m);
    }

    if (cfg.ring) {
      const m = new THREE.MeshBasicMaterial({ color: cfg.c1, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
      const gRing = new THREE.Mesh(new THREE.RingGeometry(0.55 * cfg.sc, 1.65 * cfg.sc, 26), m);
      gRing.rotation.x = -Math.PI / 2;
      gRing.position.y = 0.10;
      grp.add(gRing);
      meshes.push(m);
    }

    V9.register3DAnimation(game.scene, grp, 0.34, (p) => {
      if (cfg.sc > 1.0) {
        grp.position.x += dirX * 0.14;
        grp.position.z += dirZ * 0.14;
      }
      grp.scale.setScalar(1 + p * 0.22);
      meshes.forEach(m => { m.opacity = Math.max(0, (1 - p) * 0.94); });
    });
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
        spawnClassBasicAttackV9(this, entity);
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
        window.game.showAlertBanner?.('✨ 全14種スキルエフェクト専用 engine (game9.js v105) 起動完了！', 2200);
      }
    }, 350);
  }

  hookGameV9();
})();
// ▲▲▲ ここまで【スキルエフェクト専用 game9.js 3/3】 ▲▲▲
// ▼▼▼ 追加修正パッチ（MP表記、MPズレ、武器バグ、神域イージス、極光の聖域拡張） ▼▼▼
(() => {
  'use strict';
  
  if (typeof KaomojiMMORPG === 'undefined') return;
  const P = KaomojiMMORPG.prototype;

  // 1. スキルUIの消費MP表記と実際の消費MPを完全に同期させる
  const origUpdateSkillUI = P.updateSkillUI;
  P.updateSkillUI = function() {
    // まず本来のUI更新を実行
    if (typeof origUpdateSkillUI === 'function') origUpdateSkillUI.call(this);
    
    // UIのテキストを新計算式（元のMP×5 + (Lv-1)×10）で書き換える
    if (this.skills && this.saveData && this.saveData.skills) {
      const skillCards = document.querySelectorAll('.skill-card');
      skillCards.forEach(card => {
        const titleEl = card.querySelector('.skill-title');
        const mpEl = card.querySelector('.skill-mp');
        if (!titleEl || !mpEl) return;
        
        const skillNameMatch = titleEl.textContent.trim().match(/^([^\sLv]+)/);
        if (skillNameMatch) {
          const baseName = skillNameMatch[1];
          const skillDef = this.skills.find(s => s.name.includes(baseName));
          if (skillDef) {
            const currentLv = this.saveData.skills[skillDef.id] || 0;
            if (currentLv > 0) {
              const newMp = (skillDef.mpCost * 5) + (currentLv - 1) * 10;
              mpEl.textContent = mpEl.textContent.replace(/消費MP:\s*\d+/, `消費MP: ${newMp}`);
            }
          }
        }
      });
    }
  };

  // 2. プレイヤーの左上MP表記のズレを修正（強制同期）
  const origUpdatePlayerStatus = P.updatePlayerStatus;
  P.updatePlayerStatus = function() {
    if (typeof origUpdatePlayerStatus === 'function') origUpdatePlayerStatus.call(this);
    // UI側のゲージと内部データを強制的に一致させる
    if (this.player && this.saveData) {
      const mpText = document.getElementById('player-mp-text');
      if (mpText) {
        mpText.textContent = `${Math.floor(this.player.mp)} / ${this.player.maxMp}`;
      }
    }
  };

  // 3. 剣2本持ちバグの修正（攻撃後に古い武器モデルを確実に削除）
  const origEquipWeapon = P.updatePlayerWeapon;
  P.updatePlayerWeapon = function() {
    if (this.player && this.player.mesh) {
      // 既存の武器グループをすべて探して削除する
      const existingWeapons = this.player.mesh.children.filter(c => c.name === 'weapon_group');
      existingWeapons.forEach(w => this.player.mesh.remove(w));
    }
    if (typeof origEquipWeapon === 'function') origEquipWeapon.call(this);
  };

  // 4. 神域イージスを「防御・盾」特化に変更
  const V9 = window.KMJ_SKILL_FX_V9;
  if (V9 && V9.ATTRIBUTES) {
    const holyAttr = V9.ATTRIBUTES.find(a => a.id === 'holy');
    if (holyAttr) {
      // 進化の名前を盾っぽく変更
      holyAttr.names = (base) => [
        base,
        "絶対防壁【聖盾】",
        "神聖城郭【アイギス】",
        "🌈 創世神盾【神域イージス・ゼロ】"
      ];
    }
    
    // 神域イージスのエフェクトを「巨大な光の盾」に変更
    if (V9.EFFECT_BUILDERS) {
      V9.EFFECT_BUILDERS.holy = function (root, info, scale) {
        const tier = info.tier;
        const c1 = info.theme.c1; // 黄色系
        const c2 = 0xffffff;      // 白
        
        // 前方に巨大なエネルギーシールドを展開
        const shieldGrp = new THREE.Group();
        shieldGrp.position.set(0, 1.5 * scale, 1.5 * scale); // キャラの前方
        
        const shieldMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(1.5 * scale, 1.5 * scale, 0.2 * scale, 6, 1, false, 0, Math.PI),
          new THREE.MeshBasicMaterial({ color: c1, transparent: true, opacity: 0.8, side: THREE.DoubleSide, wireframe: tier < 2 })
        );
        shieldMesh.rotation.x = Math.PI / 2;
        shieldMesh.rotation.z = Math.PI / 2;
        shieldGrp.add(shieldMesh);
        
        // 進化で盾が豪華に（多重展開）
        if (tier >= 1) {
          const innerShield = new THREE.Mesh(
            new THREE.PlaneGeometry(2.5 * scale, 2.5 * scale),
            new THREE.MeshBasicMaterial({ color: c2, transparent: true, opacity: 0.9 })
          );
          shieldGrp.add(innerShield);
        }
        
        root.add(shieldGrp);

        return (p, elapsed) => {
          const fade = p > 0.8 ? (1 - p) * 5 : 1; // 最後にフェードアウト
          shieldGrp.scale.setScalar(Math.min(1, p * 3)); // 最初に出現
          shieldGrp.children.forEach(c => {
             if(c.material) c.material.opacity = fade * 0.8;
          });
        };
      };
    }
  }
})();
// ▲▲▲ 追加修正パッチ ここまで ▲▲▲
