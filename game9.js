// ▼▼▼ ここから【スキルエフェクト専用 game9.js 1/3】CSS・属性別シンセ音・全進化プロファイル・3Dループ・極光の聖域 ▼▼▼
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
  // 2. 属性別リッチ・シンセサイザー効果音（個別プリセット）
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
        warcry_aura:      { wave: 'sawtooth', base: 220,  sweep: 660,  notes: [329.63, 440, 659.25, 880, 1318.5] },
        aegis_shield:     { wave: 'triangle', base: 420,  sweep: 880,  notes: [523.25, 659.25, 783.99, 1046.5, 1318.5] },
        aurora_sanctuary: { wave: 'sine',     base: 587,  sweep: 1174, notes: [587.33, 739.99, 880, 1174.66, 1480] },
        slash_crescent:   { wave: 'sawtooth', base: 680,  sweep: 220,  notes: [659.25, 880, 1174.66, 1567.98] },
        fire_meteor:      { wave: 'sawtooth', base: 145,  sweep: 48,   notes: [330, 440, 587.33, 880] },
        fire_pillar:      { wave: 'sawtooth', base: 190,  sweep: 620,  notes: [392, 523.25, 659.25, 987.77] },
        fire_burst:       { wave: 'square',   base: 260,  sweep: 75,   notes: [440, 554.37, 659.25, 880] },
        fire_eruption:    { wave: 'sawtooth', base: 110,  sweep: 36,   notes: [220, 329.63, 440, 659.25] },
        ice:              { wave: 'sine',     base: 1080, sweep: 1620, notes: [1046.5, 1318.5, 1568, 2093] },
        thunder:          { wave: 'square',   base: 240,  sweep: 85,   notes: [440, 659.25, 987.77, 1480] },
        wind:             { wave: 'triangle', base: 440,  sweep: 820,  notes: [523.25, 659.25, 783.99, 1174.66] },
        water:            { wave: 'sine',     base: 290,  sweep: 540,  notes: [392, 523.25, 659.25, 987.77] },
        earth:            { wave: 'sawtooth', base: 92,   sweep: 38,   notes: [196, 261.63, 329.63, 493.88] },
        holy_heal:        { wave: 'sine',     base: 660,  sweep: 1020, notes: [659.25, 830.61, 987.77, 1318.51, 1661.22] },
        dark:             { wave: 'sawtooth', base: 108,  sweep: 34,   notes: [220, 277.18, 329.63, 466.16] },
        poison:           { wave: 'triangle', base: 185,  sweep: 125,  notes: [293.66, 349.23, 466.16, 622.25] },
        star:             { wave: 'sine',     base: 880,  sweep: 1360, notes: [783.99, 987.77, 1174.66, 1567.98, 2093] },
        sword:            { wave: 'triangle', base: 520,  sweep: 900,  notes: [523.25, 659.25, 783.99, 1046.5, 1567.98] }
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
  // 3. 全18種の進化プロファイル（全進化名に元のスキル名 ${b} を保持して名前被りを完全防止）
  // =========================================================
  const SKILL_DERIVATION_PROFILES_V9 = [
    {
      id: 'warcry_aura',
      label: '🔥 覇王の咆哮・闘気覚醒オーラ',
      match: /覇王|咆哮|闘気|覚醒|鼓舞|戦意|怒り|バーサク|warcry|fury|rage|buff/i,
      cardType: '闘気覚醒スペル',
      c1: 0xf97316, c2: 0xfde047, c3: 0xef4444,
      bgGrad: 'linear-gradient(135deg, rgba(124,45,18,0.98), rgba(185,28,28,0.94))',
      names: (b) => [
        b,
        `【真】覇王闘気・${b}`,
        `【極】戦神覚醒符「オーバーロード・${b}」`,
        `【神】創世覇王神気「${b}・インフィニティ」`
      ]
    },
    {
      id: 'aegis_shield',
      label: '🛡️ 神域防御・絶対聖盾魔法',
      match: /イージス|神域|盾|シールド|バリア|守護|鉄壁|aegis|shield|guard/i,
      cardType: '守護結界スペル',
      c1: 0x38bdf8, c2: 0xfde047, c3: 0xffffff,
      bgGrad: 'linear-gradient(135deg, rgba(12,74,110,0.98), rgba(29,78,216,0.94))',
      names: (b) => [
        b,
        `【真】絶対防壁・${b}`,
        `【極】不落城塞盾「アイギス・${b}」`,
        `【神】創世不滅神盾「${b}・ゼロ」`
      ]
    },
    {
      id: 'aurora_sanctuary',
      label: '🌈 極光の聖域（持続HP/MP回復＆マルチバフ領域）',
      match: /極光|聖域|オーロラ|サンクチュアリ|領域|sanctuary|aurora|field/i,
      cardType: '聖域展開スペル',
      c1: 0x34d399, c2: 0xf472b6, c3: 0xfde047,
      bgGrad: 'linear-gradient(135deg, rgba(6,95,70,0.98), rgba(124,58,237,0.94))',
      names: (b) => [
        b,
        `【真】極光祝福・${b}`,
        `【極】天界聖域陣「エリュシオン・${b}」`,
        `【神】創世楽園領域「${b}・アルカディア」`
      ]
    },
    {
      id: 'slash_crescent',
      label: '⚔️ 烈空・三日月真空斬',
      match: /烈空|三日月|真空波|一閃|slash|crescent/i,
      cardType: '疾風剣技スペル',
      c1: 0x38bdf8, c2: 0xe0f2fe, c3: 0x60a5fa,
      bgGrad: 'linear-gradient(135deg, rgba(15,23,42,0.97), rgba(2,132,199,0.93))',
      names: (b) => [
        b,
        `【真】蒼穹双月・${b}`,
        `【極】次元裂断「無双閃・${b}」`,
        `【神】天翔斬空神技「${b}・次元断罪斬」`
      ]
    },
    {
      id: 'fire_meteor',
      label: '☄️ 星屑メテオ・超巨大隕石落下魔法',
      match: /メテオ|隕石|meteor/i,
      cardType: '天隕爆炎スペル',
      c1: 0xef4444, c2: 0xfacc15, c3: 0xf97316,
      bgGrad: 'linear-gradient(135deg, rgba(127,29,29,0.97), rgba(234,88,12,0.93))',
      names: (b) => [
        b,
        `【真】紅蓮天隕・${b}`,
        `【極】星墜焦熱符「カタストロフ・${b}」`,
        `【神】創世天隕「${b}・スターフォール」`
      ]
    },
    {
      id: 'fire_pillar',
      label: '🔥 紅蓮業火・螺旋炎柱魔法',
      match: /炎柱|螺旋炎|ファイア|業火|紅蓮|fire|inferno/i,
      cardType: '螺旋炎柱スペル',
      c1: 0xf97316, c2: 0xfde047, c3: 0xdc2626,
      bgGrad: 'linear-gradient(135deg, rgba(154,52,18,0.97), rgba(220,38,38,0.93))',
      names: (b) => [
        b,
        `【真】螺旋業火・${b}`,
        `【極】炎帝昇竜符「クリムゾン・${b}」`,
        `【神】太陽神話「アポロン・${b}」`
      ]
    },
    {
      id: 'fire_burst',
      label: '💥 爆炎ファイア・連装火球弾幕魔法',
      match: /爆発|爆炎|ブレイズ|火球|フレア|blaze|flare|burst/i,
      cardType: '爆炎弾幕スペル',
      c1: 0xdc2626, c2: 0xfb923c, c3: 0xfef08a,
      bgGrad: 'linear-gradient(135deg, rgba(136,19,55,0.97), rgba(234,88,12,0.93))',
      names: (b) => [
        b,
        `【真】連装爆炎・${b}`,
        `【極】紅蓮弾幕符「イグニッション・${b}」`,
        `【神】爆焔神話「イフリート・${b}」`
      ]
    },
    {
      id: 'fire_eruption',
      label: '🌋 灼熱ブレイズ・溶岩マグマ噴火魔法',
      match: /炎|火|灼熱|溶岩|マグマ|噴火|flame|magma|lava/i,
      cardType: '灼熱噴火スペル',
      c1: 0xb91c1c, c2: 0xf59e0b, c3: 0xfef08a,
      bgGrad: 'linear-gradient(135deg, rgba(69,10,10,0.98), rgba(180,83,9,0.94))',
      names: (b) => [
        b,
        `【真】地殻灼熱・${b}`,
        `【極】煉獄噴火符「ヴォルカニック・${b}」`,
        `【神】地底創世「ムスペルヘイム・${b}」`
      ]
    },
    {
      id: 'ice',
      label: '❄️ 絶対零度・氷華氷柱魔法',
      match: /絶対零度|氷|アイス|ブリザード|吹雪|零度|霜|freeze|ice|blizzard/i,
      cardType: '氷華スペル',
      c1: 0x38bdf8, c2: 0xe0f2fe, c3: 0x818cf8,
      bgGrad: 'linear-gradient(135deg, rgba(12,74,110,0.97), rgba(37,99,235,0.93))',
      names: (b) => [
        b,
        `【真】氷晶零度・${b}`,
        `【極】絶対零度符「コキュートス・${b}」`,
        `【神】銀世界神話「ダイヤモンドダスト・${b}」`
      ]
    },
    {
      id: 'thunder',
      label: '⚡ 紫電・天罰落雷魔法',
      match: /雷|電|サンダー|ライトニング|スパーク|雷鳴|thunder|lightning|volt/i,
      cardType: '紫電スペル',
      c1: 0xfacc15, c2: 0xa855f7, c3: 0x38bdf8,
      bgGrad: 'linear-gradient(135deg, rgba(88,28,135,0.97), rgba(202,138,4,0.93))',
      names: (b) => [
        b,
        `【真】紫電一閃・${b}`,
        `【極】雷神降臨符「タケミカヅチ・${b}」`,
        `【神】天罰神雷「インドラ・${b}」`
      ]
    },
    {
      id: 'wind',
      label: '🌪️ 旋風円舞・螺旋竜巻魔法',
      match: /旋風|円舞|風|嵐|ウィンド|トルネード|wind|storm|tornado/i,
      cardType: '翠嵐スペル',
      c1: 0x34d399, c2: 0xa7f3d0, c3: 0xfde047,
      bgGrad: 'linear-gradient(135deg, rgba(6,78,59,0.97), rgba(16,185,129,0.93))',
      names: (b) => [
        b,
        `【真】翠嵐烈風・${b}`,
        `【極】風神天舞符「テンペスト・${b}」`,
        `【神】天空神話「シルフィード・${b}」`
      ]
    },
    {
      id: 'water',
      label: '🌊 蒼海・大渦潮水柱魔法',
      match: /水|海|波|津波|アクア|水流|渦|aqua|water|wave|ocean/i,
      cardType: '蒼海スペル',
      c1: 0x0284c7, c2: 0x7dd3fc, c3: 0x2dd4bf,
      bgGrad: 'linear-gradient(135deg, rgba(7,89,133,0.97), rgba(13,148,136,0.93))',
      names: (b) => [
        b,
        `【真】蒼海激流・${b}`,
        `【極】海神怒涛符「リヴァイアサン・${b}」`,
        `【神】深淵海神「ポセイドン・${b}」`
      ]
    },
    {
      id: 'earth',
      label: '🪨 破邪の衝撃・巨岩隆起魔法',
      match: /破邪|衝撃|地|岩|土|地震|クエイク|砕|earth|rock|quake/i,
      cardType: '大地金剛スペル',
      c1: 0xd97706, c2: 0xfbbf24, c3: 0x92400e,
      bgGrad: 'linear-gradient(135deg, rgba(120,53,15,0.97), rgba(180,83,9,0.93))',
      names: (b) => [
        b,
        `【真】剛岩破邪・${b}`,
        `【極】地母神符「ガイア・クラッシュ・${b}」`,
        `【神】星砕神話「タイタン・${b}」`
      ]
    },
    {
      id: 'holy_heal',
      label: '💖 聖光の癒し・天照光輪魔法',
      match: /癒し|ヒール|回復|光|聖|祈り|祝福|天照|ハート|holy|heal|light|bless/i,
      cardType: '聖光治癒スペル',
      c1: 0xfde047, c2: 0xffffff, c3: 0xf472b6,
      bgGrad: 'linear-gradient(135deg, rgba(133,77,14,0.97), rgba(217,119,6,0.93))',
      names: (b) => [
        b,
        `【真】聖光煌めき・${b}`,
        `【極】天照聖域符「セイクリッド・${b}」`,
        `【神】創世聖典「セラフィム・${b}」`
      ]
    },
    {
      id: 'dark',
      label: '🌌 黒蝕・ブラックホール魔法',
      match: /闇|黒|ダーク|シャドウ|アビス|ブラックホール|虚空|dark|void|shadow|abyss/i,
      cardType: '黒蝕スペル',
      c1: 0x9333ea, c2: 0xf43f5e, c3: 0x38bdf8,
      bgGrad: 'linear-gradient(135deg, rgba(30,27,75,0.98), rgba(126,34,206,0.93))',
      names: (b) => [
        b,
        `【真】黒蝕冥界・${b}`,
        `【極】虚空崩壊符「アビスノヴァ・${b}」`,
        `【神】終焉神話「ラグナロク・${b}」`
      ]
    },
    {
      id: 'poison',
      label: '☠️ 呪詛・魔界瘴気魔法',
      match: /毒|呪|ポイズン|ヴェノム|カース|瘴気|poison|venom|curse/i,
      cardType: '呪詛スペル',
      c1: 0xa855f7, c2: 0x4ade80, c3: 0xf43f5e,
      bgGrad: 'linear-gradient(135deg, rgba(59,7,100,0.97), rgba(21,128,61,0.93))',
      names: (b) => [
        b,
        `【真】猛毒瘴気・${b}`,
        `【極】魔界呪詛符「ベリアル・${b}」`,
        `【神】混沌神話「ヒュドラ・${b}」`
      ]
    },
    {
      id: 'star',
      label: '🌟 星屑・銀河流星魔法',
      match: /星|宇宙|銀河|スター|コメット|ノヴァ|コスモ|虹|star|comet|nova|cosmos|rainbow/i,
      cardType: '星屑スペル',
      c1: 0xf472b6, c2: 0xfde047, c3: 0x38bdf8,
      bgGrad: 'linear-gradient(135deg, rgba(49,46,129,0.97), rgba(219,39,119,0.93))',
      names: (b) => [
        b,
        `【真】星屑流星・${b}`,
        `【極】銀河星霊符「スターダスト・${b}」`,
        `【神】宇宙創世「ビッグバン・${b}」`
      ]
    },
    {
      id: 'sword',
      label: '🗡️ 秘剣・無限光剣陣',
      match: /剣|刃|刀|乱舞|百花|sword|blade/i,
      cardType: '秘剣スペル',
      c1: 0x38bdf8, c2: 0xf472b6, c3: 0xfde047,
      bgGrad: 'linear-gradient(135deg, rgba(15,23,42,0.97), rgba(3,105,161,0.93))',
      names: (b) => [
        b,
        `【真】蒼穹剣閃・${b}`,
        `【極】剣聖奥義符「天翔十字・${b}」`,
        `【神】創世剣神「エクスカリバー・${b}」`
      ]
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
  // 5. 「極光の聖域」持続フィールド管理（calcDerivedStats参照でHP100激減を完全防止）
  // =========================================================
  const activeSanctuariesV9 = [];

  function spawnAuroraSanctuaryFieldV9(game, entity, info) {
    if (!game?.useWebGL || !game?.scene || !entity?.pos || typeof THREE === 'undefined') return;
    const tier = info?.tier ?? 0;
    const radius = (4.2 + tier * 1.4);
    const duration = 10.0 + tier * 3.0;

    const root = new THREE.Group();
    root.position.set(entity.pos.x, 0, entity.pos.z);

    const floorDisk = new THREE.Mesh(
      new THREE.CircleGeometry(radius, 40),
      new THREE.MeshBasicMaterial({ color: 0x34d399, side: THREE.DoubleSide, transparent: true, opacity: 0.24 })
    );
    floorDisk.rotation.x = -Math.PI / 2;
    floorDisk.position.y = 0.04;
    root.add(floorDisk);

    const rings = [];
    const ringCount = 2 + tier * 2;
    const ringCols = [0x34d399, 0xf472b6, 0x38bdf8, 0xfde047];
    for (let r = 0; r < ringCount; r++) {
      const rIn = radius * (0.25 + (r / ringCount) * 0.72);
      const rOut = rIn + 0.14 + tier * 0.03;
      const segs = r % 3 === 0 ? 6 : (r % 3 === 1 ? 8 : 36);
      const rm = new THREE.Mesh(
        new THREE.RingGeometry(rIn, rOut, segs),
        new THREE.MeshBasicMaterial({ color: ringCols[r % ringCols.length], side: THREE.DoubleSide, transparent: true, opacity: 0.92 })
      );
      rm.rotation.x = -Math.PI / 2;
      rm.position.y = 0.06 + r * 0.02;
      root.add(rm);
      rings.push({ mesh: rm, spd: (r % 2 === 0 ? 1 : -1) * (1.5 + r * 0.4) });
    }

    const curtainH = (2.6 + tier * 1.1);
    const curtain = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, curtainH, 36, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x34d399, side: THREE.DoubleSide, transparent: true, opacity: 0.28 })
    );
    curtain.position.y = curtainH * 0.5;
    root.add(curtain);

    let innerCurtain = null;
    if (tier >= 1) {
      innerCurtain = new THREE.Mesh(
        new THREE.CylinderGeometry(radius * 0.65, radius * 0.65, curtainH * 1.35, 32, 1, true),
        new THREE.MeshBasicMaterial({ color: tier >= 2 ? 0xfde047 : 0xf472b6, side: THREE.DoubleSide, transparent: true, opacity: 0.24 })
      );
      innerCurtain.position.y = curtainH * 0.675;
      root.add(innerCurtain);
    }

    const crystals = [];
    const cryCnt = 4 + tier * 4;
    for (let c = 0; c < cryCnt; c++) {
      const ang = (Math.PI * 2 * c) / cryCnt;
      const cry = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.28 + tier * 0.08, 0),
        new THREE.MeshBasicMaterial({ color: ringCols[c % ringCols.length], transparent: true, opacity: 0.95 })
      );
      cry.position.set(Math.cos(ang) * radius, 1.4 + (c % 2) * 0.8, Math.sin(ang) * radius);
      root.add(cry);
      crystals.push({ mesh: cry, ang, baseY: 1.4 + (c % 2) * 0.8 });
    }

    game.scene.add(root);
    activeSanctuariesV9.push({
      scene: game.scene,
      root,
      x: entity.pos.x,
      z: entity.pos.z,
      radius,
      tier,
      elapsed: 0,
      tickAcc: 0,
      duration,
      rings,
      curtain,
      innerCurtain,
      crystals,
      floorDisk
    });

    game.showAlertBanner?.(`🌈 ${info.evolvedName} 展開！（範囲内の全プレイヤーに持続HP/MP回復＋全バフ）`, 2400);
  }

  function updateSanctuaryFieldsV9(game, dt) {
    if (!game || activeSanctuariesV9.length === 0) return;
    const stepDt = Math.min(0.1, Math.max(0.001, dt || 0.016));

    for (let i = activeSanctuariesV9.length - 1; i >= 0; i--) {
      const s = activeSanctuariesV9[i];
      s.elapsed += stepDt;
      s.tickAcc += stepDt;

      const fade = s.elapsed > s.duration - 1.2 ? Math.max(0, (s.duration - s.elapsed) / 1.2) : 1;
      s.rings.forEach(r => {
        r.mesh.rotation.z = s.elapsed * r.spd;
        r.mesh.material.opacity = fade * 0.92;
      });
      s.curtain.rotation.y = s.elapsed * 0.8;
      s.curtain.material.opacity = fade * (0.24 + Math.sin(s.elapsed * 3) * 0.06);
      if (s.innerCurtain) {
        s.innerCurtain.rotation.y = -s.elapsed * 1.2;
        s.innerCurtain.material.opacity = fade * 0.24;
      }
      s.floorDisk.material.opacity = fade * 0.22;
      s.crystals.forEach((cr, idx) => {
        const a = cr.ang + s.elapsed * 1.1;
        cr.mesh.position.set(Math.cos(a) * s.radius, cr.baseY + Math.sin(s.elapsed * 3 + idx) * 0.35, Math.sin(a) * s.radius);
        cr.mesh.rotation.y = s.elapsed * 4;
        cr.mesh.material.opacity = fade * 0.95;
      });

      if (s.tickAcc >= 1.0) {
        s.tickAcc -= 1.0;

        if (game.player?.pos && game.saveData) {
          const distMe = Math.hypot(game.player.pos.x - s.x, game.player.pos.z - s.z);
          if (distMe <= s.radius) {
            // 本体の calcDerivedStats() を最優先で参照してHP100への誤ダウンを防止
            const st = typeof game.calcDerivedStats === 'function'
              ? game.calcDerivedStats()
              : (typeof game.getPlayerStats === 'function' ? game.getPlayerStats() : null);

            const curHp = Math.max(Number(game.player.hp ?? 0), Number(game.saveData.hp ?? 0));
            const curMp = Math.max(Number(game.player.mp ?? 0), Number(game.saveData.mp ?? 0));
            const realMaxHp = Math.max(Number(st?.maxHp || 0), Number(game.player.maxHp || 0), Number(game.saveData.maxHp || 0), curHp, 100);
            const realMaxMp = Math.max(Number(st?.maxMp || 0), Number(game.player.maxMp || 0), Number(game.saveData.maxMp || 0), curMp, 100);

            const healHp = Math.max(5, Math.floor(realMaxHp * (0.08 + s.tier * 0.04)));
            const healMp = Math.max(5, Math.floor(realMaxMp * (0.10 + s.tier * 0.05)));

            const nextHp = Math.min(realMaxHp, Math.max(curHp, curHp + healHp));
            const nextMp = Math.min(realMaxMp, Math.max(curMp, curMp + healMp));

            game.player.maxHp = realMaxHp;
            game.saveData.maxHp = realMaxHp;
            if (typeof game.player.hp === 'number') game.player.hp = nextHp;
            if (typeof game.saveData.hp === 'number') game.saveData.hp = nextHp;

            game.player.maxMp = realMaxMp;
            game.saveData.maxMp = realMaxMp;
            if (typeof game.player.mp === 'number') game.player.mp = nextMp;
            if (typeof game.saveData.mp === 'number') game.saveData.mp = nextMp;

            game.player.sanctuaryBuffTimer = 2.5;
            game.player.sanctuaryBuffPower = 1.25 + s.tier * 0.15;
          }
        }

        const remoteLists = [game.remotePlayers, game.otherPlayers, game.players];
        remoteLists.forEach(col => {
          if (!col) return;
          const arr = Array.isArray(col) ? col : (col instanceof Map ? Array.from(col.values()) : Object.values(col));
          arr.forEach(rp => {
            if (!rp || rp === game.player || !rp.pos) return;
            const dRemote = Math.hypot(rp.pos.x - s.x, rp.pos.z - s.z);
            if (dRemote <= s.radius) {
              const rMaxHp = Math.max(Number(rp.maxHp || 100), Number(rp.hp || 100));
              const rMaxMp = Math.max(Number(rp.maxMp || 100), Number(rp.mp || 100));
              if (typeof rp.hp === 'number') rp.hp = Math.min(rMaxHp, Math.max(rp.hp, rp.hp + Math.floor(rMaxHp * (0.08 + s.tier * 0.04))));
              if (typeof rp.mp === 'number') rp.mp = Math.min(rMaxMp, Math.max(rp.mp, rp.mp + Math.floor(rMaxMp * (0.10 + s.tier * 0.05))));
              rp.sanctuaryBuffTimer = 2.5;
            }
          });
        });

        if (typeof game.broadcastSkillOrHeal === 'function') {
          try { game.broadcastSkillOrHeal({ type: 'sanctuary_pulse', x: s.x, z: s.z, radius: s.radius, tier: s.tier }); } catch (e) {}
        }
      }

      if (s.elapsed >= s.duration) {
        try {
          s.scene.remove(s.root);
          s.root.traverse?.(o => {
            if (o.geometry) o.geometry.dispose?.();
            if (o.material) o.material.dispose?.();
          });
        } catch (e) {}
        activeSanctuariesV9.splice(i, 1);
      }
    }
  }

  window.KMJ_SKILL_FX_V9 = {
    ATTRIBUTES: SKILL_DERIVATION_PROFILES_V9,
    EFFECT_BUILDERS: {},
    register3DAnimation: register3DAnimationV9,
    spawnAuroraSanctuaryField: spawnAuroraSanctuaryFieldV9,
    updateSanctuaryFields: updateSanctuaryFieldsV9,
    _playMagicAudio: playMagicAudioV9
  };
})();
// ▲▲▲ ここまで【スキルエフェクト専用 game9.js 1/3】 ▲▲▲
// ▼▼▼ ここから【スキルエフェクト専用 game9.js 2/3】カットイン・詠唱オーラ・スキル同期・スタジオUI・3Dビルダー(1〜9) ▼▼▼
(() => {
  'use strict';

  const V9 = window.KMJ_SKILL_FX_V9;
  if (!V9) return;

  // =========================================================
  // 6. スペルカードカットイン＆詠唱オーラ
  // =========================================================
  function showSpellCardCutinV9(game, info) {
    V9._playMagicAudio?.(info.theme.id, info.tier);

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

    V9.register3DAnimation(game.scene, grp, 0.75, (p, elapsed) => {
      grp.position.set(entity.pos.x, 0, entity.pos.z);
      footRing1.rotation.z = elapsed * 4;
      footRing2.rotation.z = -elapsed * 5;
      const fade = p > 0.65 ? Math.max(0, 1 - (p - 0.65) / 0.35) : 1;
      footRing1.material.opacity = fade * 0.92;
      footRing2.material.opacity = fade * 0.92;
    });
  }

  // =========================================================
  // 7. 公開API（saveData.skills連携・消費MP本体準拠・スキル属性適正割り当て）
  // =========================================================
  Object.assign(V9, {
    showSpellCardCutin: showSpellCardCutinV9,
    spawnCasterChantAura: spawnCasterChantAuraV9,

    getAll14Skills(game) {
      let list = [];
      if (typeof SKILLS !== 'undefined' && SKILLS) {
        list = (Array.isArray(SKILLS) ? SKILLS : Object.values(SKILLS)).filter(s => s && typeof s === 'object');
      }
      if (list.length === 0) {
        return [
          { id: 'sk_1', name: '烈空斬', mp: 8, icon: '⚔️' },
          { id: 'sk_2', name: '旋風円舞', mp: 14, icon: '🌪️' },
          { id: 'sk_3', name: '破邪の衝撃', mp: 12, icon: '🪨' },
          { id: 'sk_4', name: '聖光の癒し', mp: 16, icon: '💖' },
          { id: 'sk_5', name: '星屑メテオ', mp: 26, icon: '☄️' },
          { id: 'sk_6', name: '絶対零度ノヴァ', mp: 22, icon: '❄️' },
          { id: 'sk_7', name: '神域イージス', mp: 24, icon: '🛡️' },
          { id: 'sk_8', name: '極光の聖域', mp: 30, icon: '🌈' },
          { id: 'sk_9', name: 'サンダーボルト', mp: 20, icon: '⚡' },
          { id: 'sk_10', name: 'アクアゲイザー', mp: 22, icon: '🌊' },
          { id: 'sk_11', name: 'ダークアビス', mp: 28, icon: '🌌' },
          { id: 'sk_12', name: 'ポイズンミスト', mp: 18, icon: '☠️' },
          { id: 'sk_13', name: 'スターダストノヴァ', mp: 32, icon: '🌟' },
          { id: 'sk_14', name: '無限光剣陣', mp: 40, icon: '🗡️' }
        ];
      }
      return list;
    },

    assignUniqueProfiles(allList) {
      const usedProfileIds = new Set();
      allList.forEach((sk, idx) => {
        if (!sk || typeof sk !== 'object') return;
        if (!sk._origNameV9 && typeof sk.name === 'string') {
          sk._origNameV9 = sk.name.replace(/^【(真|極|神|奥義|神話奥義)】[^「・]*[・「]?|」$/g, '').trim() || sk.name;
        }
        const origName = sk._origNameV9 || `秘技・第${idx + 1}の型`;
        const searchStr = `${origName} ${sk.id || ''} ${sk.desc || ''}`;

        // 1. スキル本来の意味・属性に一致するプロファイルを最優先で選択（バフ技に溶岩や毒が付く誤作動を防止）
        let chosen = V9.ATTRIBUTES.find(p => p.match.test(searchStr));

        // 2. もし同系統が既に使われており、別バリエーション（火属性4種など）が空いていればそちらを優先
        if (chosen && usedProfileIds.has(chosen.id) && /炎|火|爆|メテオ|ブレイズ|フレア|fire|flame|blaze/i.test(searchStr)) {
          const fireVariants = ['fire_meteor', 'fire_pillar', 'fire_burst', 'fire_eruption'];
          const freeFireId = fireVariants.find(fid => !usedProfileIds.has(fid));
          if (freeFireId) {
            chosen = V9.ATTRIBUTES.find(p => p.id === freeFireId);
          }
        }

        // 3. どれにも該当しない汎用スキルのみ未割り当て枠から割り当て
        if (!chosen) {
          chosen = V9.ATTRIBUTES.find(p => !usedProfileIds.has(p.id))
            || V9.ATTRIBUTES[idx % V9.ATTRIBUTES.length];
        }

        usedProfileIds.add(chosen.id);
        sk._uniqueThemeV9 = chosen;
      });
    },

    getSkillInfo(game, slotOrSkill = 0) {
      const d = game?.saveData || {};
      const allList = this.getAll14Skills(game);
      this.assignUniqueProfiles(allList);

      let slotIdx = typeof slotOrSkill === 'number' ? slotOrSkill : 0;
      let rawSkill = null;
      let skillLv = 1;

      if (typeof slotOrSkill === 'object' && slotOrSkill !== null) {
        rawSkill = slotOrSkill;
        const foundIdx = allList.indexOf(rawSkill);
        if (foundIdx >= 0) slotIdx = foundIdx;
        const sid = String(rawSkill.id || rawSkill.skillId || '');
        // 本体(game1.js / game3.js)の saveData.skills[skId] を最優先で参照
        skillLv = Math.max(1, Number(
          d.skills?.[sid] ?? d.skillLevels?.[sid] ?? d.skillLvs?.[sid] ?? rawSkill.lv ?? rawSkill.level ?? 1
        ));
      } else {
        // スロット番号から装備中スキルIDを解決
        const equippedIds = d.equippedSkills || d.skillSlots || [];
        const eqId = equippedIds[slotIdx];
        if (eqId) {
          rawSkill = allList.find(s => String(s.id) === String(eqId) || String(s.skillId) === String(eqId)) || null;
          skillLv = Math.max(1, Number(d.skills?.[eqId] ?? d.skillLevels?.[eqId] ?? 1));
        }
        if (!rawSkill && typeof game?.resolveSkillMeta === 'function') {
          const meta = game.resolveSkillMeta(slotIdx);
          if (meta) {
            const mId = String(meta.skillId || '');
            skillLv = Math.max(1, Number(d.skills?.[mId] ?? meta.skillLv ?? 1));
            rawSkill = allList.find(s => String(s.id) === mId || String(s.skillId) === mId) || allList[slotIdx] || null;
          }
        }
        if (!rawSkill) {
          rawSkill = allList[slotIdx] || allList[0];
          const sid = String(rawSkill?.id || '');
          skillLv = Math.max(1, Number(d.skills?.[sid] ?? d.skillLevels?.[sid] ?? 1));
        }
      }

      const defaultOrig = [8, 14, 12, 16, 26, 22, 24, 30, 20, 22, 28, 18, 32, 40][slotIdx] || 16;
      if (rawSkill && rawSkill._origMpV9 === undefined) {
        const detected = Number(rawSkill.mp ?? rawSkill.mpCost ?? rawSkill.costMp ?? 0);
        rawSkill._origMpV9 = detected > 0 ? detected : defaultOrig;
      }

      const origMp = rawSkill?._origMpV9 || defaultOrig;
      // 本体の getSkillMpCost() に完全準拠（無理やり5倍にする処理を削除）
      const mpCost = (typeof getSkillMpCost === 'function' && rawSkill)
        ? getSkillMpCost(rawSkill, skillLv)
        : Math.max(1, Math.round(origMp * (1 + (skillLv - 1) * 0.08)));

      const origName = rawSkill?._origNameV9 || `秘技・第${slotIdx + 1}の型`;
      const tier = skillLv >= 100 ? 3 : (skillLv >= 50 ? 2 : (skillLv >= 10 ? 1 : 0));

      const theme = rawSkill?._uniqueThemeV9 || V9.ATTRIBUTES[slotIdx % V9.ATTRIBUTES.length];
      const evolvedName = theme.names(origName)[tier] || origName;
      const tierLabels = ['通常魔法', '✨ 魔法進化Ⅰ【真】', '🔥 魔法進化Ⅱ【極】', '🌈 魔法最終進化【神】'];

      return {
        rawSkill, slotIdx, skillLv, origMp, mpCost, origName, evolvedName,
        tier, tierLabel: tierLabels[tier], theme
      };
    },

    syncAllSkills(game) {
      const allList = this.getAll14Skills(game);
      this.assignUniqueProfiles(allList);

      // MPの強制上書きは行わず、進化後のスキル名のみ安全に同期
      allList.forEach(sk => {
        if (!sk || typeof sk !== 'object') return;
        const info = this.getSkillInfo(game, sk);
        if (typeof sk.name === 'string') sk.name = info.evolvedName;
      });
    },

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
              現在Lv.${info.skillLv}（消費MP: ${info.mpCost}）
            </div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;">
              <button type="button" class="v9-cast-skill-btn" data-idx="${idx}" data-tier="0" style="background:#334155;color:#fff;border:none;border-radius:5px;padding:5px 2px;font-size:9.5px;font-weight:900;cursor:pointer;">Lv.1 通常</button>
              <button type="button" class="v9-cast-skill-btn" data-idx="${idx}" data-tier="1" style="background:#0284c7;color:#fff;border:none;border-radius:5px;padding:5px 2px;font-size:9.5px;font-weight:900;cursor:pointer;">Lv.10【真】</button>
              <button type="button" class="v9-cast-skill-btn" data-idx="${idx}" data-tier="2" style="background:#d97706;color:#fff;border:none;border-radius:5px;padding:5px 2px;font-size:9.5px;font-weight:900;cursor:pointer;">Lv.50【極】</button>
              <button type="button" class="v9-cast-skill-btn" data-idx="${idx}" data-tier="3" style="background:linear-gradient(90deg,#db2777,#7c3aed);color:#fde047;border:none;border-radius:5px;padding:5px 2px;font-size:9.5px;font-weight:900;cursor:pointer;">Lv.100【神】</button>
            </div>
          </div>
        `;
      }).join('');

      wrap.innerHTML = `
        <div class="kmj-v9-studio-card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
            <b style="font-size:13.5px;color:#f9a8d4;">🎬 全${all14.length}種スキル 個別進化スタジオ</b>
            <button type="button" id="kmj-v9-close-studio" style="background:#ef4444;color:#fff;border:none;border-radius:6px;padding:4px 10px;font-size:11px;font-weight:900;cursor:pointer;">✕ 閉じる</button>
          </div>
          <div style="font-size:10px;color:#fde047;margin-bottom:8px;">
            ※ 元のスキル名と個別3Dエフェクトを保持したまま、Lv.1〜Lv.100【神】の演出をテストできます！
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
      if (!/skill|magic|art/.test(tab) && !txt.includes('スキル強化') && !txt.includes('スキル一覧')) return;
      if (body.querySelector('#kmj-v9-inline-studio-btn')) return;
      const count = this.getAll14Skills(game).length;
      body.insertAdjacentHTML('afterbegin', `
        <div class="card-box" style="margin-bottom:8px;border:1.5px solid #f472b6;background:rgba(30,27,75,0.95);display:flex;align-items:center;justify-content:space-between;gap:8px;">
          <div>
            <div style="font-size:11px;font-weight:900;color:#f9a8d4;">🎬 全${count}種スキル 個別進化スタジオ</div>
            <div style="font-size:9.5px;color:#cbd5e1;">各スキルの進化派生・神域イージス(盾)・極光の聖域を試せます！</div>
          </div>
          <button type="button" id="kmj-v9-inline-studio-btn" style="background:linear-gradient(90deg,#ec4899,#8b5cf6);border:none;color:#fff;border-radius:7px;padding:7px 11px;font-size:11px;font-weight:900;cursor:pointer;white-space:nowrap;">⚡ スタジオを開く</button>
        </div>
      `);
      body.querySelector('#kmj-v9-inline-studio-btn').onclick = () => this.openStudioModal(game);
    }
  });

  // =========================================================
  // 8. 個別3Dビルダー共通幾何ヘルパー（魔法陣ベース・六角エネルギー盾）
  // =========================================================
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

  function createHexShieldMesh(radius, thickness, color, opacity = 0.85, wireframe = false) {
    const grp = new THREE.Group();
    const plate = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius * 0.82, thickness, 6),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity, wireframe })
    );
    plate.rotation.x = Math.PI / 2;
    const frame = new THREE.Mesh(
      new THREE.RingGeometry(radius * 0.88, radius * 1.04, 6),
      new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: Math.min(1, opacity + 0.12) })
    );
    frame.position.z = thickness * 0.55;
    grp.add(plate);
    grp.add(frame);
    return { grp, plateMat: plate.material, frameMat: frame.material };
  }

  // =========================================================
  // 9. 個別3Dビルダー (1/18) 🔥 覇王の咆哮・闘気覚醒オーラ（バフ専用演出）
  // =========================================================
  V9.EFFECT_BUILDERS.warcry_aura = function (root, info, scale) {
    const tier = info.tier;
    const c1 = info.theme.c1;
    const c2 = info.theme.c2;
    const c3 = info.theme.c3;
    const areaRadius = (2.1 + tier * 0.7) * scale;

    const magicRings = [];
    addMagicCircleBase(root, areaRadius, c1, c2, tier, magicRings);

    const hAura = (5.2 + tier * 1.6) * scale;
    const auraPillar = new THREE.Mesh(
      new THREE.CylinderGeometry(1.1 * scale, 1.55 * scale, hAura, 24, 1, true),
      new THREE.MeshBasicMaterial({ color: c1, side: THREE.DoubleSide, transparent: true, opacity: 0.56 })
    );
    auraPillar.position.y = hAura * 0.5;
    root.add(auraPillar);

    const shockRing = new THREE.Mesh(
      new THREE.RingGeometry(0.6 * scale, 1.3 * scale, 32),
      new THREE.MeshBasicMaterial({ color: c2, side: THREE.DoubleSide, transparent: true, opacity: 0.95 })
    );
    shockRing.rotation.x = -Math.PI / 2;
    shockRing.position.y = 0.12;
    root.add(shockRing);

    const orbs = [];
    const oCnt = 8 + tier * 4;
    for (let i = 0; i < oCnt; i++) {
      const orb = new THREE.Mesh(
        new THREE.OctahedronGeometry((0.24 + tier * 0.05) * scale, 0),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? c2 : c3, transparent: true, opacity: 0.96 })
      );
      root.add(orb);
      orbs.push({ mesh: orb, ang: (Math.PI * 2 * i) / oCnt, spd: 4.0 + (i % 3) });
    }

    return (p, elapsed) => {
      const fade = p > 0.72 ? Math.max(0, 1 - (p - 0.72) / 0.28) : 1;
      magicRings.forEach(r => {
        r.mesh.rotation.z = elapsed * r.speed * 1.5;
        r.mesh.material.opacity = fade * 0.92;
      });
      auraPillar.rotation.y = elapsed * 5.5;
      auraPillar.material.opacity = fade * 0.56;

      shockRing.scale.setScalar(1 + p * (3.2 + tier * 0.8));
      shockRing.material.opacity = Math.max(0, (1 - p) * 0.95);

      orbs.forEach((ob, idx) => {
        const a = ob.ang + elapsed * ob.spd;
        const r = (1.35 + tier * 0.3) * scale;
        ob.mesh.position.set(Math.cos(a) * r, ((elapsed * 3.5 + idx * 0.45) % (4.5 * scale)), Math.sin(a) * r);
        ob.mesh.rotation.y = elapsed * 6;
        ob.mesh.material.opacity = fade * 0.96;
      });
    };
  };

  // =========================================================
  // 10. 個別3Dビルダー (2/18) 🛡️ 神域イージス（多重エネルギー聖盾＆六角守護ドーム）
  // =========================================================
  V9.EFFECT_BUILDERS.aegis_shield = function (root, info, scale) {
    const tier = info.tier;
    const c1 = info.theme.c1;
    const c2 = info.theme.c2;
    const areaRadius = (2.1 + tier * 0.65) * scale;

    const magicRings = [];
    addMagicCircleBase(root, areaRadius, c1, c2, tier, magicRings);

    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(areaRadius * 0.82, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.55),
      new THREE.MeshBasicMaterial({ color: c1, wireframe: true, transparent: true, opacity: 0.65 })
    );
    root.add(dome);

    const shields = [];
    const shieldCount = 3 + tier + (tier >= 2 ? 1 : 0) + (tier >= 3 ? 1 : 0);
    const orbitR = (1.55 + tier * 0.35) * scale;

    for (let i = 0; i < shieldCount; i++) {
      const ang = (Math.PI * 2 * i) / shieldCount;
      const sh = createHexShieldMesh((0.92 + tier * 0.18) * scale, 0.12 * scale, i % 2 === 0 ? c1 : c2, 0.78, false);
      sh.grp.position.set(Math.cos(ang) * orbitR, (1.35 + tier * 0.15) * scale, Math.sin(ang) * orbitR);
      sh.grp.lookAt(Math.cos(ang) * (orbitR + 5), (1.35 + tier * 0.15) * scale, Math.sin(ang) * (orbitR + 5));
      root.add(sh.grp);
      shields.push({ ...sh, baseAng: ang });
    }

    let crownRing = null;
    if (tier >= 1) {
      crownRing = new THREE.Mesh(
        new THREE.TorusGeometry(orbitR * 0.85, 0.10 * scale, 8, 6),
        new THREE.MeshBasicMaterial({ color: c2, transparent: true, opacity: 0.95 })
      );
      crownRing.rotation.x = Math.PI / 2;
      crownRing.position.y = (2.6 + tier * 0.3) * scale;
      root.add(crownRing);
    }

    return (p, elapsed) => {
      const fade = p > 0.75 ? Math.max(0, 1 - (p - 0.75) / 0.25) : 1;
      const pop = Math.min(1, p * 4.5);

      magicRings.forEach(r => {
        r.mesh.rotation.z = elapsed * r.speed;
        r.mesh.material.opacity = fade * 0.92;
      });

      dome.scale.setScalar(pop);
      dome.rotation.y = elapsed * 1.4;
      dome.material.opacity = fade * 0.62;

      shields.forEach(sh => {
        const curAng = sh.baseAng + elapsed * (2.2 + tier * 0.4);
        const rNow = orbitR * pop;
        sh.grp.position.set(Math.cos(curAng) * rNow, (1.35 + tier * 0.15) * scale, Math.sin(curAng) * rNow);
        sh.grp.lookAt(Math.cos(curAng) * (rNow + 5), (1.35 + tier * 0.15) * scale, Math.sin(curAng) * (rNow + 5));
        sh.plateMat.opacity = fade * 0.78;
        sh.frameMat.opacity = fade * 0.95;
      });

      if (crownRing) {
        crownRing.rotation.z = -elapsed * 3.5;
        crownRing.scale.setScalar(pop);
        crownRing.material.opacity = fade * 0.95;
      }
    };
  };

  // =========================================================
  // 11. 個別3Dビルダー (3/18) 🌈 極光の聖域（展開バースト演出）
  // =========================================================
  V9.EFFECT_BUILDERS.aurora_sanctuary = function (root, info, scale) {
    const tier = info.tier;
    const c1 = info.theme.c1;
    const c2 = info.theme.c2;
    const radius = (2.8 + tier * 0.9) * scale;

    const magicRings = [];
    addMagicCircleBase(root, radius, c1, c2, tier, magicRings);

    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 0.85, radius, (5.5 + tier * 1.8) * scale, 32, 1, true),
      new THREE.MeshBasicMaterial({ color: c1, side: THREE.DoubleSide, transparent: true, opacity: 0.45 })
    );
    beam.position.y = (2.75 + tier * 0.9) * scale;
    root.add(beam);

    return (p, elapsed) => {
      const fade = Math.max(0, 1 - p);
      magicRings.forEach(r => {
        r.mesh.rotation.z = elapsed * r.speed;
        r.mesh.material.opacity = fade * 0.92;
      });
      beam.rotation.y = elapsed * 3;
      beam.scale.set(1 + p * 0.35, 1, 1 + p * 0.35);
      beam.material.opacity = fade * 0.48;
    };
  };

  // =========================================================
  // 12. 個別3Dビルダー (4/18) ⚔️ 烈空斬（三日月真空斬撃波・進化で双月＆多重次元斬）
  // =========================================================
  V9.EFFECT_BUILDERS.slash_crescent = function (root, info, scale) {
    const tier = info.tier;
    const c1 = info.theme.c1;
    const c2 = info.theme.c2;

    const waves = [];
    const waveCount = 1 + tier;
    for (let i = 0; i < waveCount; i++) {
      const arc = new THREE.Mesh(
        new THREE.RingGeometry((1.1 + i * 0.35) * scale, (2.3 + i * 0.45) * scale, 28, 1, -Math.PI * 0.42, Math.PI * 0.84),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? c1 : c2, side: THREE.DoubleSide, transparent: true, opacity: 0.96 })
      );
      arc.position.set(0, (1.15 + i * 0.22) * scale, (0.8 + i * 0.4) * scale);
      arc.rotation.z = (i % 2 === 0 ? 0.32 : -0.32);
      root.add(arc);
      waves.push({ mesh: arc, delay: i * 0.08, baseZ: (0.8 + i * 0.4) * scale });
    }

    return (p) => {
      waves.forEach(w => {
        const lp = Math.max(0, Math.min(1, (p - w.delay) / 0.72));
        w.mesh.position.z = w.baseZ + lp * (7.5 + tier * 2.0) * scale;
        w.mesh.scale.setScalar(1 + lp * (0.55 + tier * 0.2));
        w.mesh.material.opacity = lp > 0 ? Math.max(0, (1 - lp) * 0.96) : 0;
      });
    };
  };

  // =========================================================
  // 13. 個別3Dビルダー (5/18) ☄️ 火属性①：星屑メテオ（超巨大隕石落下＆着弾衝撃波）
  // =========================================================
  V9.EFFECT_BUILDERS.fire_meteor = function (root, info, scale) {
    const tier = info.tier;
    const c1 = info.theme.c1;
    const c2 = info.theme.c2;
    const c3 = info.theme.c3;
    const areaRadius = (2.2 + tier * 0.75) * scale;

    const magicRings = [];
    addMagicCircleBase(root, areaRadius, c1, c2, tier, magicRings);

    const meteorCount = 1 + tier * 2;
    const meteors = [];
    for (let i = 0; i < meteorCount; i++) {
      const isMain = (i === 0);
      const ang = (Math.PI * 2 * i) / Math.max(1, meteorCount - 1);
      const dist = isMain ? 0 : areaRadius * 0.62;
      const mx = Math.cos(ang) * dist;
      const mz = Math.sin(ang) * dist;
      const mSize = (isMain ? 1.05 : 0.62) * scale;

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
      const startY = (9.2 + i * 1.3) * scale;
      mGrp.position.set(mx, startY, mz);
      root.add(mGrp);

      const shock = new THREE.Mesh(
        new THREE.RingGeometry(0.3 * scale, 0.95 * scale, 28),
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
          mt.grp.scale.setScalar(1 + exp * (mt.isMain ? 1.9 : 1.3));
          mt.rockMat.opacity = Math.max(0, (1 - exp) * 0.96);
          mt.coreMat.opacity = Math.max(0, (1 - exp) * 0.95);
          mt.shock.material.opacity = Math.max(0, (1 - exp) * 0.95);
          mt.shock.scale.setScalar(1 + exp * (mt.isMain ? 4.5 : 2.8));
        }
      });
    };
  };

  // =========================================================
  // 14. 個別3Dビルダー (6/18) 🔥 火属性②：紅蓮業火・螺旋炎柱
  // =========================================================
  V9.EFFECT_BUILDERS.fire_pillar = function (root, info, scale) {
    const tier = info.tier;
    const c1 = info.theme.c1;
    const c2 = info.theme.c2;
    const c3 = info.theme.c3;
    const areaRadius = (2.1 + tier * 0.7) * scale;

    const magicRings = [];
    addMagicCircleBase(root, areaRadius, c1, c2, tier, magicRings);

    const hPillar = (7.8 + tier * 2.2) * scale;
    const outerPillar = new THREE.Mesh(
      new THREE.CylinderGeometry(1.15 * scale, 1.55 * scale, hPillar, 24, 1, true),
      new THREE.MeshBasicMaterial({ color: c3, side: THREE.DoubleSide, transparent: true, opacity: 0.62 })
    );
    outerPillar.position.y = hPillar * 0.5;
    root.add(outerPillar);

    const innerPillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55 * scale, 0.85 * scale, hPillar * 1.1, 20, 1, true),
      new THREE.MeshBasicMaterial({ color: c2, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })
    );
    innerPillar.position.y = hPillar * 0.55;
    root.add(innerPillar);

    const spiralRings = [];
    const sCnt = 5 + tier * 3;
    for (let i = 0; i < sCnt; i++) {
      const sr = new THREE.Mesh(
        new THREE.TorusGeometry((1.2 + (i % 3) * 0.45) * scale, 0.11 * scale, 8, 28),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? c1 : c2, transparent: true, opacity: 0.94 })
      );
      sr.rotation.x = Math.PI / 2 + (i % 2 === 0 ? 0.18 : -0.18);
      const startY = (0.4 + i * 0.65) * scale;
      sr.position.y = startY;
      root.add(sr);
      spiralRings.push({ mesh: sr, startY, idx: i });
    }

    return (p, elapsed) => {
      const fade = p > 0.72 ? Math.max(0, 1 - (p - 0.72) / 0.28) : 1;
      const pop = Math.min(1, p * 4);
      magicRings.forEach(r => {
        r.mesh.rotation.z = elapsed * r.speed * 1.5;
        r.mesh.material.opacity = fade * 0.92;
      });
      outerPillar.scale.set(pop, pop, pop);
      outerPillar.rotation.y = elapsed * 5;
      outerPillar.material.opacity = fade * 0.62;

      innerPillar.scale.set(pop, pop, pop);
      innerPillar.rotation.y = -elapsed * 7;
      innerPillar.material.opacity = fade * 0.9;

      spiralRings.forEach(sr => {
        sr.mesh.position.y = sr.startY + p * 3.8 * scale;
        sr.mesh.rotation.z = elapsed * (8 + sr.idx);
        sr.mesh.scale.setScalar(1 + p * 0.45);
        sr.mesh.material.opacity = fade * 0.94;
      });
    };
  };

  // =========================================================
  // 15. 個別3Dビルダー (7/18) 💥 火属性③：爆炎ファイア・連装火球弾幕
  // =========================================================
  V9.EFFECT_BUILDERS.fire_burst = function (root, info, scale) {
    const tier = info.tier;
    const c1 = info.theme.c1;
    const c2 = info.theme.c2;
    const c3 = info.theme.c3;
    const areaRadius = (2.3 + tier * 0.8) * scale;

    const magicRings = [];
    addMagicCircleBase(root, areaRadius, c1, c2, tier, magicRings);

    const coreSun = new THREE.Mesh(
      new THREE.SphereGeometry((0.75 + tier * 0.2) * scale, 18, 18),
      new THREE.MeshBasicMaterial({ color: c3, transparent: true, opacity: 0.98 })
    );
    coreSun.position.y = 1.4 * scale;
    root.add(coreSun);

    const fireballs = [];
    const fbCount = 10 + tier * 6;
    for (let i = 0; i < fbCount; i++) {
      const ang = (Math.PI * 2 * i) / fbCount + (i % 3) * 0.2;
      const fb = new THREE.Mesh(
        new THREE.SphereGeometry((0.28 + (i % 2) * 0.1) * scale, 12, 12),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? c1 : c2, transparent: true, opacity: 0.96 })
      );
      fb.position.set(0, 1.4 * scale, 0);
      root.add(fb);

      const blastRing = new THREE.Mesh(
        new THREE.RingGeometry(0.15 * scale, 0.55 * scale, 20),
        new THREE.MeshBasicMaterial({ color: c2, side: THREE.DoubleSide, transparent: true, opacity: 0 })
      );
      blastRing.rotation.x = -Math.PI / 2;
      blastRing.position.y = 0.14;
      root.add(blastRing);

      fireballs.push({
        mesh: fb,
        blastRing,
        ang,
        maxDist: areaRadius * (0.75 + (i % 3) * 0.28),
        delay: (i % 4) * 0.08
      });
    }

    return (p, elapsed) => {
      const fade = p > 0.72 ? Math.max(0, 1 - (p - 0.72) / 0.28) : 1;
      magicRings.forEach(r => {
        r.mesh.rotation.z = elapsed * r.speed;
        r.mesh.material.opacity = fade * 0.92;
      });
      coreSun.scale.setScalar(1 + Math.sin(elapsed * 20) * 0.25);
      coreSun.material.opacity = fade * 0.98;

      fireballs.forEach(fb => {
        const lp = Math.max(0, Math.min(1, (p - fb.delay) / 0.65));
        const curD = fb.maxDist * lp;
        const bx = Math.cos(fb.ang) * curD;
        const bz = Math.sin(fb.ang) * curD;
        fb.mesh.position.set(bx, Math.max(0.2, 1.4 * (1 - lp) * scale), bz);
        fb.mesh.material.opacity = lp > 0 ? Math.max(0, (1 - lp * 0.85) * 0.96) : 0;

        if (lp > 0.55) {
          const bp = (lp - 0.55) / 0.45;
          fb.blastRing.position.set(bx, 0.14, bz);
          fb.blastRing.scale.setScalar(1 + bp * 2.4);
          fb.blastRing.material.opacity = Math.max(0, (1 - bp) * 0.92);
        }
      });
    };
  };

  // =========================================================
  // 16. 個別3Dビルダー (8/18) 🌋 火属性④：灼熱ブレイズ・溶岩マグマ噴火
  // =========================================================
  V9.EFFECT_BUILDERS.fire_eruption = function (root, info, scale) {
    const tier = info.tier;
    const c1 = info.theme.c1;
    const c2 = info.theme.c2;
    const c3 = info.theme.c3;
    const areaRadius = (2.3 + tier * 0.75) * scale;

    const magicRings = [];
    addMagicCircleBase(root, areaRadius, c1, c2, tier, magicRings);

    const lavaPool = new THREE.Mesh(
      new THREE.CircleGeometry(areaRadius * 0.92, 32),
      new THREE.MeshBasicMaterial({ color: c1, side: THREE.DoubleSide, transparent: true, opacity: 0.42 })
    );
    lavaPool.rotation.x = -Math.PI / 2;
    lavaPool.position.y = 0.04;
    root.add(lavaPool);

    const cracks = [];
    const crackCnt = 6 + tier * 2;
    for (let i = 0; i < crackCnt; i++) {
      const ang = (Math.PI * 2 * i) / crackCnt;
      const cr = new THREE.Mesh(
        new THREE.PlaneGeometry(0.22 * scale, areaRadius * 1.15),
        new THREE.MeshBasicMaterial({ color: c3, side: THREE.DoubleSide, transparent: true, opacity: 0.95 })
      );
      cr.rotation.x = -Math.PI / 2;
      cr.rotation.z = ang;
      cr.position.set(Math.cos(ang) * areaRadius * 0.5, 0.07, Math.sin(ang) * areaRadius * 0.5);
      root.add(cr);
      cracks.push(cr);
    }

    const magmaChunks = [];
    const mCnt = 10 + tier * 6;
    for (let i = 0; i < mCnt; i++) {
      const ang = (Math.PI * 2 * i) / mCnt;
      const chunk = new THREE.Mesh(
        new THREE.DodecahedronGeometry((0.32 + (i % 3) * 0.14) * scale, 0),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? c2 : c3, transparent: true, opacity: 0.96 })
      );
      root.add(chunk);
      magmaChunks.push({
        mesh: chunk,
        ang,
        outDist: areaRadius * (0.4 + (i % 4) * 0.25),
        peakY: (3.8 + (i % 4) * 1.1 + tier * 0.8) * scale
      });
    }

    return (p, elapsed) => {
      const fade = p > 0.74 ? Math.max(0, 1 - (p - 0.74) / 0.26) : 1;
      magicRings.forEach(r => {
        r.mesh.rotation.z = elapsed * r.speed;
        r.mesh.material.opacity = fade * 0.92;
      });
      lavaPool.material.opacity = fade * 0.45;
      cracks.forEach(cr => { cr.material.opacity = fade * 0.95; });

      magmaChunks.forEach(mc => {
        const yArc = Math.sin(p * Math.PI) * mc.peakY;
        const rCur = mc.outDist * p;
        mc.mesh.position.set(Math.cos(mc.ang) * rCur, Math.max(0.15, yArc), Math.sin(mc.ang) * rCur);
        mc.mesh.rotation.set(elapsed * 7, elapsed * 5, 0);
        mc.mesh.material.opacity = fade * 0.96;
      });
    };
  };

  // =========================================================
  // 17. 個別3Dビルダー (9/18) ❄️ 絶対零度ノヴァ（クリスタル氷柱が波紋状に隆起）
  // =========================================================
  V9.EFFECT_BUILDERS.ice = function (root, info, scale) {
    const tier = info.tier;
    const c1 = info.theme.c1;
    const c2 = info.theme.c2;
    const c3 = info.theme.c3;
    const areaRadius = (2.2 + tier * 0.8) * scale;

    const magicRings = [];
    addMagicCircleBase(root, areaRadius, c1, c2, tier, magicRings);

    const frostFloor = new THREE.Mesh(
      new THREE.CircleGeometry(areaRadius, 32),
      new THREE.MeshBasicMaterial({ color: c1, side: THREE.DoubleSide, transparent: true, opacity: 0 })
    );
    frostFloor.rotation.x = -Math.PI / 2;
    frostFloor.position.y = 0.03;
    root.add(frostFloor);

    const spikes = [];
    const layerCount = 1 + tier;
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
    };
  };

  V9._addMagicCircleBase = addMagicCircleBase;
})();
// ▲▲▲ ここまで【スキルエフェクト専用 game9.js 2/3】 ▲▲▲
// ▼▼▼ ここから【スキルエフェクト専用 game9.js 3/3】3Dビルダー(10〜18)・統合実行エンジン・武器6段階水平横振り・通常戦闘フック ▼▼▼
(() => {
  'use strict';

  const V9 = window.KMJ_SKILL_FX_V9;
  if (!V9 || !V9.EFFECT_BUILDERS) return;

  const addMagicCircleBase = V9._addMagicCircleBase || function (root, radius, c1, c2, tier, ringsOut) {
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
  };

  // =========================================================
  // 18. 個別3Dビルダー (10/18) ⚡ 紫電・天罰落雷魔法
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
  // 19. 個別3Dビルダー (11/18) 🌪️ 旋風円舞・螺旋竜巻魔法
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
  // 20. 個別3Dビルダー (12/18) 🌊 蒼海・大渦潮水柱魔法
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
  // 21. 個別3Dビルダー (13/18) 🪨 破邪の衝撃・巨岩隆起魔法
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
  // 22. 個別3Dビルダー (14/18) 💖 聖光の癒し・天照光輪魔法
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
  // 23. 個別3Dビルダー (15/18) 🌌 黒蝕・ブラックホール魔法
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
  // 24. 個別3Dビルダー (16/18) ☠️ 呪詛・魔界瘴気魔法
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
  // 25. 個別3Dビルダー (17/18) 🌟 星屑・銀河流星魔法
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
  // 26. 個別3Dビルダー (18/18) 🗡️ 秘剣・無限光剣陣
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
  // 27. 統合実行エンジン（術者中心／敵中心の自動判定・camShake連動）
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
      attrId === 'warcry_aura' ||
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
      if ((attrId === 'aegis_shield' || attrId === 'warcry_aura') && entity?.pos) {
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

    // 本体(game3.js / game4.js)の camShake 変数へ正しくカメラシェイクを反映
    const shakeVal = 0.26 + tier * 0.09;
    if (typeof game.camShake === 'number') {
      game.camShake = Math.max(game.camShake, shakeVal);
    }
    if (typeof game.shakeTimer === 'number') {
      game.shakeTimer = Math.max(game.shakeTimer, shakeVal);
    }
  }

  V9.castSkillEffect = function (game, slotOrSkill = 0) {
    const info = V9.getSkillInfo(game, slotOrSkill);
    executeFullMagic3D(game, game?.player, info);
    V9.showSpellCardCutin(game, info);
  };

  V9.previewSkillByObj = function (game, skillObj, tier = 0) {
    const baseInfo = V9.getSkillInfo(game, skillObj);
    const lvMap = [1, 10, 50, 100];
    const tierLabels = ['通常魔法', '✨ 魔法進化Ⅰ【真】', '🔥 魔法進化Ⅱ【極】', '🌈 魔法最終進化【神】'];
    const simLv = lvMap[tier] || 1;
    const simMp = (typeof getSkillMpCost === 'function' && skillObj)
      ? getSkillMpCost(skillObj, simLv)
      : Math.max(1, Math.round(baseInfo.origMp * (1 + (simLv - 1) * 0.08)));

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
  // 28. 武器種別 × 武器グレード（6段階）の超豪華・水平横振り攻撃エフェクト！
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

    const sc = 1.0 + grade * 0.24;
    const slashLayers = 1 + grade;
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

    // 6. 武器属性パーティクル飛散
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
      if (entity?.pos) {
        root.position.set(entity.pos.x, 0, entity.pos.z);
      }

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

    if (grade >= 3 && entity === game.player) {
      const wShake = 0.08 + (grade - 3) * 0.05;
      if (typeof game.camShake === 'number') game.camShake = Math.max(game.camShake, wShake);
      if (typeof game.shakeTimer === 'number') game.shakeTimer = Math.max(game.shakeTimer, wShake);
    }
  }

  // =========================================================
  // 29. ゲーム本体（game3.js / game1.js）との完全接続＆重複防止フック
  // =========================================================
  function hookGameV9() {
    if (typeof KaomojiMMORPG === 'undefined') {
      setTimeout(hookGameV9, 100);
      return;
    }
    const P = KaomojiMMORPG.prototype;
    if (P._v9Hooked) return;
    P._v9Hooked = true;

    // 1. 毎フレーム update() で極光の聖域フィールドを更新
    if (typeof P.update === 'function') {
      const origUpdate = P.update;
      let lastSanctuaryTick = performance.now();
      P.update = function (...args) {
        const now = performance.now();
        const dt = typeof args[0] === 'number' && args[0] > 0 && args[0] < 1
          ? args[0]
          : Math.min(0.1, (now - lastSanctuaryTick) / 1000);
        lastSanctuaryTick = now;
        try { V9.updateSanctuaryFields(this, dt); } catch (e) {}
        return origUpdate.apply(this, args);
      };
    }

    // 2. 通常戦闘のスキル発動（useSkillSlot / executeSingleSkillCast）から3D魔法＆カットインを確実に起動
    let lastV9SkillStamp = 0;
    ['useSkillSlot', 'executeSingleSkillCast'].forEach(fnName => {
      if (typeof P[fnName] !== 'function') return;
      const origSkillFn = P[fnName];
      P[fnName] = function (...args) {
        const prevMp = Number(this.player?.mp ?? this.saveData?.mp ?? 0);
        const res = origSkillFn.apply(this, args);
        const curMp = Number(this.player?.mp ?? this.saveData?.mp ?? 0);
        const now = performance.now();
        // MPが消費されたか成功戻り値が返った時のみ重複なしで3D魔法を再生
        if ((res !== false || curMp < prevMp) && (now - lastV9SkillStamp > 120)) {
          lastV9SkillStamp = now;
          try {
            V9.syncAllSkills(this);
            const arg0 = args[0];
            const slotOrSk = (arg0 && typeof arg0 === 'object' && arg0.skill) ? arg0.skill : (arg0 ?? 0);
            V9.castSkillEffect(this, slotOrSk);
          } catch (e) {}
        }
        return res;
      };
    });

    // 3. 通常攻撃ビジュアルのフック（二重描画防止付き）
    const origVis = P.triggerAttackVisual;
    P.triggerAttackVisual = function (entity, isSkill = false, skillInfo = null) {
      if (!isSkill && entity) {
        const now = performance.now();
        if (entity._lastSlashFxTime && (now - entity._lastSlashFxTime) < 60) {
          return;
        }
        entity._lastSlashFxTime = now;
        entity.attackAnimTimer = 0.36;
        entity.attackIsSkill = false;
        spawnWeaponHorizontalSlashV9(this, entity);
        return;
      }
      if (typeof origVis === 'function') {
        return origVis.call(this, entity, isSkill, skillInfo);
      }
    };

    // 4. モーダル・タブ切り替え時にスキル画面へ「⚡ スタジオを開く」ボタンを注入＆スキル名同期
    ['openModal', 'renderModal', 'switchTab', 'renderTab'].forEach(uiFn => {
      if (typeof P[uiFn] !== 'function') return;
      const origUi = P[uiFn];
      P[uiFn] = function (...args) {
        const res = origUi.apply(this, args);
        try {
          V9.syncAllSkills(this);
          setTimeout(() => {
            const body = document.getElementById('modal-body');
            V9.injectSkillPreviewUI(this, body, String(args[0] || ''));
          }, 25);
        } catch (e) {}
        return res;
      };
    });

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
        window.game.showAlertBanner?.('✨ 全18種3D魔法演出・【神】進化・武器6段階水平横振りシステム起動！', 2600);
      }
    }, 350);
  }

  hookGameV9();
})();
// ▲▲▲ ここまで【スキルエフェクト専用 game9.js 3/3】 ▲▲▲
