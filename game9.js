// ▼▼▼ ここから【スキルエフェクト専用 game9.js 1/2】CSS・シンセ音・全18種プロファイル・3Dループ・極光の聖域・前半3Dビルダー(1〜10) ▼▼▼
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
  // 4. リアルタイム3Dアニメーション管理エンジン（透明抜け防止自動適用）
  // =========================================================
  const activeAnimsV9 = [];
  let _lastFrameV9 = performance.now();

  function applyDepthWriteFixV9(rootGroup) {
    if (!rootGroup || typeof rootGroup.traverse !== 'function') return;
    rootGroup.traverse((obj) => {
      if (!obj.material) return;
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach((m) => {
        if (!m || !m.transparent) return;
        // ブラックホールの漆黒球体コア(0x05020a)以外の半透明光パーツは depthWrite: false で透明抜けを完全防止
        const hex = m.color && typeof m.color.getHex === 'function' ? m.color.getHex() : -1;
        if (hex !== 0x05020a) {
          m.depthWrite = false;
        }
      });
    });
  }

  function register3DAnimationV9(scene, rootGroup, duration, onTick) {
    if (!scene || !rootGroup) return;
    applyDepthWriteFixV9(rootGroup);
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
      new THREE.MeshBasicMaterial({ color: 0x34d399, side: THREE.DoubleSide, transparent: true, opacity: 0.24, depthWrite: false })
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
        new THREE.MeshBasicMaterial({ color: ringCols[r % ringCols.length], side: THREE.DoubleSide, transparent: true, opacity: 0.92, depthWrite: false })
      );
      rm.rotation.x = -Math.PI / 2;
      rm.position.y = 0.06 + r * 0.02;
      root.add(rm);
      rings.push({ mesh: rm, spd: (r % 2 === 0 ? 1 : -1) * (1.5 + r * 0.4) });
    }

    const curtainH = (2.6 + tier * 1.1);
    const curtain = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, curtainH, 36, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x34d399, side: THREE.DoubleSide, transparent: true, opacity: 0.28, depthWrite: false })
    );
    curtain.position.y = curtainH * 0.5;
    root.add(curtain);

    let innerCurtain = null;
    if (tier >= 1) {
      innerCurtain = new THREE.Mesh(
        new THREE.CylinderGeometry(radius * 0.65, radius * 0.65, curtainH * 1.35, 32, 1, true),
        new THREE.MeshBasicMaterial({ color: tier >= 2 ? 0xfde047 : 0xf472b6, side: THREE.DoubleSide, transparent: true, opacity: 0.24, depthWrite: false })
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
        new THREE.MeshBasicMaterial({ color: ringCols[c % ringCols.length], transparent: true, opacity: 0.95, depthWrite: false })
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

    game.showAlertBanner?.(`🌈 ${info.evolvedName} 展開！（範囲内の全プレイヤーに持続HP/MP回復＆全バフ）`, 2400);
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

  // =========================================================
  // 6. 全18種スキル個別3Dエフェクト専用ビルダー（前半 1〜10）
  // =========================================================
  const reg = register3DAnimationV9;

  function makeCircleRing(rIn, rOut, color, seg = 36) {
    const m = new THREE.Mesh(
      new THREE.RingGeometry(rIn, rOut, seg),
      new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.95, depthWrite: false })
    );
    m.rotation.x = -Math.PI / 2;
    return m;
  }

  const EFFECT_BUILDERS_PART1 = {
    // 1. 覇王の咆哮
    warcry_aura: (scene, caster, target, tier, attr) => {
      const root = new THREE.Group();
      root.position.set(caster.x, 0, caster.z);

      const shock = makeCircleRing(0.4, 1.3 + tier * 0.4, attr.c2, 40);
      shock.position.y = 0.08;
      root.add(shock);

      const auraCol = new THREE.Mesh(
        new THREE.CylinderGeometry(1.1 + tier * 0.35, 1.5 + tier * 0.45, 3.6 + tier * 1.1, 28, 1, true),
        new THREE.MeshBasicMaterial({ color: attr.c1, side: THREE.DoubleSide, transparent: true, opacity: 0.55 })
      );
      auraCol.position.y = 1.8;
      root.add(auraCol);

      const crownRings = [];
      for (let i = 0; i < 2 + tier; i++) {
        const cr = new THREE.Mesh(
          new THREE.TorusGeometry(1.2 + i * 0.35, 0.08 + tier * 0.02, 10, 32),
          new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? attr.c2 : attr.c3, transparent: true, opacity: 0.95 })
        );
        cr.rotation.x = Math.PI / 2;
        cr.position.y = 0.5 + i * 0.65;
        root.add(cr);
        crownRings.push(cr);
      }

      const flames = [];
      for (let i = 0; i < 12 + tier * 6; i++) {
        const ang = (Math.PI * 2 * i) / (12 + tier * 6);
        const rad = 0.9 + (i % 3) * 0.45;
        const f = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.18 + tier * 0.05, 0),
          new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? attr.c2 : attr.c1, transparent: true, opacity: 0.95 })
        );
        f.position.set(Math.cos(ang) * rad, 0.2, Math.sin(ang) * rad);
        root.add(f);
        flames.push({ mesh: f, ang, rad, spd: 2.5 + (i % 4) * 0.7 });
      }

      reg(scene, root, 1.2 + tier * 0.25, (p, el) => {
        const fade = p > 0.72 ? 1 - (p - 0.72) / 0.28 : 1;
        shock.scale.setScalar(1 + p * (2.6 + tier * 0.8));
        shock.material.opacity = fade * 0.9;
        auraCol.rotation.y = el * 4.5;
        auraCol.scale.set(1 + Math.sin(el * 12) * 0.08, 0.4 + p * 0.9, 1 + Math.sin(el * 12) * 0.08);
        auraCol.material.opacity = fade * 0.55;
        crownRings.forEach((cr, idx) => {
          cr.position.y = (0.4 + idx * 0.55) + p * (2.2 + tier * 0.5);
          cr.rotation.z = el * (idx % 2 === 0 ? 4 : -4);
          cr.material.opacity = fade * 0.95;
        });
        flames.forEach((fl, idx) => {
          const a = fl.ang + el * 3.2;
          fl.mesh.position.set(Math.cos(a) * fl.rad, (p * fl.spd * 1.6) % 3.6, Math.sin(a) * fl.rad);
          fl.mesh.rotation.y = el * 6 + idx;
          fl.mesh.material.opacity = fade * 0.95;
        });
      });
    },

    // 2. 神域防御・イージスの盾
    aegis_shield: (scene, caster, target, tier, attr) => {
      const root = new THREE.Group();
      root.position.set(caster.x, 1.1, caster.z);

      const domeR = 1.65 + tier * 0.45;
      const dome = new THREE.Mesh(
        new THREE.IcosahedronGeometry(domeR, 1),
        new THREE.MeshBasicMaterial({ color: attr.c1, wireframe: true, transparent: true, opacity: 0.88 })
      );
      root.add(dome);

      const innerDome = new THREE.Mesh(
        new THREE.SphereGeometry(domeR * 0.96, 24, 18),
        new THREE.MeshBasicMaterial({ color: attr.c1, side: THREE.DoubleSide, transparent: true, opacity: 0.25 })
      );
      root.add(innerDome);

      const hexPlates = [];
      const plateCnt = 6 + tier * 3;
      for (let i = 0; i < plateCnt; i++) {
        const ang = (Math.PI * 2 * i) / plateCnt;
        const hp = new THREE.Mesh(
          new THREE.CylinderGeometry(0.45 + tier * 0.1, 0.45 + tier * 0.1, 0.06, 6),
          new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? attr.c2 : attr.c1, transparent: true, opacity: 0.72 })
        );
        hp.rotation.x = Math.PI / 2;
        hp.position.set(Math.cos(ang) * (domeR + 0.15), (i % 3 - 1) * 0.45, Math.sin(ang) * (domeR + 0.15));
        hp.lookAt(0, hp.position.y, 0);
        hp.rotateX(Math.PI / 2);
        root.add(hp);
        hexPlates.push({ mesh: hp, ang, yOff: (i % 3 - 1) * 0.45 });
      }

      reg(scene, root, 1.45 + tier * 0.35, (p, el) => {
        const fade = p > 0.75 ? 1 - (p - 0.75) / 0.25 : 1;
        const pop = p < 0.15 ? (p / 0.15) : 1;
        dome.scale.setScalar(pop);
        dome.rotation.y = el * 1.4;
        dome.material.opacity = fade * 0.88;
        innerDome.scale.setScalar(pop);
        innerDome.material.opacity = fade * (0.22 + Math.sin(el * 8) * 0.06);
        hexPlates.forEach((hp) => {
          const a = hp.ang + el * 1.8;
          const r = (domeR + 0.15) * pop;
          hp.mesh.position.set(Math.cos(a) * r, hp.yOff, Math.sin(a) * r);
          hp.mesh.lookAt(root.position.x, root.position.y + hp.yOff, root.position.z);
          hp.mesh.rotateX(Math.PI / 2);
          hp.mesh.material.opacity = fade * 0.75;
        });
      });
    },

    // 3. 極光の聖域（天蓋バースト）
    aurora_sanctuary: (scene, caster, target, tier, attr) => {
      const root = new THREE.Group();
      root.position.set(caster.x, 0.1, caster.z);
      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 2.5 + tier * 0.8, 12 + tier * 3, 24, 1, true),
        new THREE.MeshBasicMaterial({ color: attr.c2, side: THREE.DoubleSide, transparent: true, opacity: 0.55 })
      );
      beam.position.y = 6;
      root.add(beam);
      reg(scene, root, 0.9, (p) => {
        beam.scale.set(1 + p * 1.4, 1, 1 + p * 1.4);
        beam.material.opacity = (1 - p) * 0.55;
      });
    },

    // 4. 烈空・三日月真空斬
    slash_crescent: (scene, caster, target, tier, attr) => {
      const root = new THREE.Group();
      const dx = target.x - caster.x;
      const dz = target.z - caster.z;
      const dist = Math.max(4.5, Math.hypot(dx, dz) + 2.5);
      const yaw = Math.atan2(dx, dz);
      root.position.set(caster.x, 1.15, caster.z);
      root.rotation.y = yaw;

      const waveCount = 1 + tier;
      const waves = [];
      for (let w = 0; w < waveCount; w++) {
        const wg = new THREE.Group();
        const blade = new THREE.Mesh(
          new THREE.RingGeometry(1.1 + tier * 0.3, 1.85 + tier * 0.45, 28, 1, -Math.PI * 0.42, Math.PI * 0.84),
          new THREE.MeshBasicMaterial({ color: w % 2 === 0 ? attr.c1 : attr.c2, side: THREE.DoubleSide, transparent: true, opacity: 0.96 })
        );
        blade.rotation.x = Math.PI / 2;
        blade.rotation.z = (w - (waveCount - 1) * 0.5) * 0.35;
        wg.add(blade);

        const edge = new THREE.Mesh(
          new THREE.TorusGeometry(1.85 + tier * 0.45, 0.08 + tier * 0.03, 8, 28, Math.PI * 0.84),
          new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 })
        );
        edge.rotation.x = Math.PI / 2;
        edge.rotation.z = -Math.PI * 0.42 + (w - (waveCount - 1) * 0.5) * 0.35;
        wg.add(edge);

        wg.position.z = -w * 0.85;
        root.add(wg);
        waves.push({ grp: wg, blade, edge });
      }

      reg(scene, root, 0.65 + tier * 0.1, (p) => {
        const travel = p * (dist + 3.0);
        const fade = p > 0.72 ? 1 - (p - 0.72) / 0.28 : 1;
        waves.forEach((wv, idx) => {
          wv.grp.position.z = travel - idx * 0.9;
          wv.grp.scale.set(1 + p * 0.55, 1, 1 + p * 0.35);
          wv.blade.material.opacity = fade * 0.96;
          wv.edge.material.opacity = fade * 0.95;
        });
      });
    },

    // 5. 星屑メテオ・超巨大隕石落下魔法
    fire_meteor: (scene, caster, target, tier, attr) => {
      const root = new THREE.Group();
      root.position.set(target.x, 0, target.z);

      const zoneR = 2.6 + tier * 0.95;
      const ring = makeCircleRing(zoneR * 0.82, zoneR, attr.c2, 40);
      ring.position.y = 0.06;
      root.add(ring);

      const meteorCount = 1 + tier;
      const meteors = [];
      for (let m = 0; m < meteorCount; m++) {
        const ox = m === 0 ? 0 : Math.cos((Math.PI * 2 * m) / meteorCount) * (1.5 + tier * 0.4);
        const oz = m === 0 ? 0 : Math.sin((Math.PI * 2 * m) / meteorCount) * (1.5 + tier * 0.4);
        const radius = (m === 0 ? 1.25 : 0.78) + tier * 0.32;

        const rock = new THREE.Mesh(
          new THREE.DodecahedronGeometry(radius, 1),
          new THREE.MeshBasicMaterial({ color: 0x3b0707, transparent: true, opacity: 1 })
        );
        const lavaGlow = new THREE.Mesh(
          new THREE.IcosahedronGeometry(radius * 1.14, 1),
          new THREE.MeshBasicMaterial({ color: attr.c1, wireframe: true, transparent: true, opacity: 0.95 })
        );
        const tail = new THREE.Mesh(
          new THREE.ConeGeometry(radius * 1.1, radius * 4.5, 16, 1, true),
          new THREE.MeshBasicMaterial({ color: attr.c2, side: THREE.DoubleSide, transparent: true, opacity: 0.72 })
        );
        tail.position.y = radius * 2.2;

        const mGrp = new THREE.Group();
        mGrp.add(rock, lavaGlow, tail);
        const startH = 14 + m * 3.5;
        mGrp.position.set(ox + 3.5, startH, oz - 2.5);
        root.add(mGrp);
        meteors.push({ grp: mGrp, ox, oz, startH, delay: m * 0.14 });
      }

      const blastSphere = new THREE.Mesh(
        new THREE.SphereGeometry(zoneR * 0.95, 24, 18),
        new THREE.MeshBasicMaterial({ color: attr.c2, transparent: true, opacity: 0 })
      );
      blastSphere.position.y = 0.5;
      root.add(blastSphere);

      reg(scene, root, 1.25 + tier * 0.2, (p, el) => {
        ring.rotation.z = el * 3.5;
        let maxImpact = 0;
        meteors.forEach((mt) => {
          const localP = Math.max(0, Math.min(1, (p - mt.delay) / 0.52));
          if (localP < 1) {
            const ease = localP * localP;
            mt.grp.position.set(
              mt.ox + (1 - ease) * 3.5,
              mt.startH * (1 - ease) + 0.6,
              mt.oz - (1 - ease) * 2.5
            );
            mt.grp.rotation.x = el * 5;
            mt.grp.rotation.z = el * 4;
          } else {
            mt.grp.visible = false;
            maxImpact = Math.max(maxImpact, Math.min(1, (p - mt.delay - 0.52) / 0.45));
          }
        });
        if (maxImpact > 0) {
          blastSphere.scale.setScalar(0.3 + maxImpact * 1.45);
          blastSphere.material.opacity = (1 - maxImpact) * 0.85;
          ring.scale.setScalar(1 + maxImpact * 0.6);
          ring.material.opacity = 1 - maxImpact;
        }
      });
    },

    // 6. 紅蓮業火・螺旋炎柱魔法
    fire_pillar: (scene, caster, target, tier, attr) => {
      const root = new THREE.Group();
      root.position.set(target.x, 0, target.z);

      const baseR = 1.6 + tier * 0.55;
      const magicRing = makeCircleRing(baseR * 0.75, baseR, attr.c1, 32);
      magicRing.position.y = 0.06;
      root.add(magicRing);

      const corePillar = new THREE.Mesh(
        new THREE.CylinderGeometry(baseR * 0.55, baseR * 0.85, 7.5 + tier * 2.4, 24, 1, true),
        new THREE.MeshBasicMaterial({ color: attr.c1, side: THREE.DoubleSide, transparent: true, opacity: 0.78 })
      );
      corePillar.position.y = 3.75;
      root.add(corePillar);

      const innerCore = new THREE.Mesh(
        new THREE.CylinderGeometry(baseR * 0.25, baseR * 0.45, 8.2 + tier * 2.4, 20, 1, true),
        new THREE.MeshBasicMaterial({ color: attr.c2, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })
      );
      innerCore.position.y = 4.1;
      root.add(innerCore);

      const spirals = [];
      const orbCnt = 16 + tier * 8;
      for (let i = 0; i < orbCnt; i++) {
        const orb = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.24 + tier * 0.06, 0),
          new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? attr.c2 : attr.c3, transparent: true, opacity: 0.95 })
        );
        root.add(orb);
        spirals.push({ mesh: orb, phase: (Math.PI * 2 * i) / orbCnt, hOff: (i / orbCnt) * 7.5 });
      }

      reg(scene, root, 1.15 + tier * 0.2, (p, el) => {
        const fade = p > 0.72 ? 1 - (p - 0.72) / 0.28 : 1;
        const grow = Math.min(1, p * 4.5);
        magicRing.rotation.z = el * 4;
        magicRing.material.opacity = fade * 0.95;
        corePillar.scale.set(1 + Math.sin(el * 18) * 0.1, grow, 1 + Math.sin(el * 18) * 0.1);
        corePillar.rotation.y = el * 6;
        corePillar.material.opacity = fade * 0.78;
        innerCore.scale.set(1, grow, 1);
        innerCore.rotation.y = -el * 8;
        innerCore.material.opacity = fade * 0.9;
        spirals.forEach((sp) => {
          const a = sp.phase + el * 8.5;
          const y = ((sp.hOff + el * 7.0) % (7.5 + tier * 2.0)) * grow;
          const r = baseR * 0.85 * (1 - y / 12);
          sp.mesh.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
          sp.mesh.material.opacity = fade * 0.95;
        });
      });
    },

    // 7. 爆炎ファイア・連装火球弾幕魔法
    fire_burst: (scene, caster, target, tier, attr) => {
      const root = new THREE.Group();
      const count = 3 + tier * 2;
      const fireballs = [];
      for (let i = 0; i < count; i++) {
        const spread = (i - (count - 1) * 0.5) * (0.65 + tier * 0.15);
        const perpX = -(target.z - caster.z);
        const perpZ = (target.x - caster.x);
        const len = Math.max(0.01, Math.hypot(perpX, perpZ));
        const nx = perpX / len;
        const nz = perpZ / len;

        const fb = new THREE.Mesh(
          new THREE.SphereGeometry(0.42 + tier * 0.1, 16, 12),
          new THREE.MeshBasicMaterial({ color: attr.c2, transparent: true, opacity: 0.96 })
        );
        const shell = new THREE.Mesh(
          new THREE.IcosahedronGeometry(0.58 + tier * 0.14, 1),
          new THREE.MeshBasicMaterial({ color: attr.c1, wireframe: true, transparent: true, opacity: 0.9 })
        );
        fb.add(shell);
        root.add(fb);
        fireballs.push({
          mesh: fb,
          sx: caster.x + nx * spread * 0.6,
          sz: caster.z + nz * spread * 0.6,
          tx: target.x + nx * spread * 1.4,
          tz: target.z + nz * spread * 1.4,
          arcH: 1.4 + (i % 3) * 0.55
        });
      }

      const boom = new THREE.Mesh(
        new THREE.SphereGeometry(2.0 + tier * 0.7, 20, 16),
        new THREE.MeshBasicMaterial({ color: attr.c1, transparent: true, opacity: 0 })
      );
      boom.position.set(target.x, 1.0, target.z);
      root.add(boom);

      reg(scene, root, 0.95 + tier * 0.15, (p, el) => {
        if (p < 0.65) {
          const fp = p / 0.65;
          fireballs.forEach((f) => {
            f.mesh.position.set(
              f.sx + (f.tx - f.sx) * fp,
              1.1 + Math.sin(fp * Math.PI) * f.arcH,
              f.sz + (f.tz - f.sz) * fp
            );
            f.mesh.rotation.y = el * 10;
          });
        } else {
          const bp = (p - 0.65) / 0.35;
          fireballs.forEach((f) => { f.mesh.visible = false; });
          boom.scale.setScalar(0.3 + bp * 1.4);
          boom.material.opacity = (1 - bp) * 0.88;
        }
      });
    },

    // 8. 灼熱ブレイズ・溶岩マグマ噴火魔法
    fire_eruption: (scene, caster, target, tier, attr) => {
      const root = new THREE.Group();
      root.position.set(target.x, 0, target.z);
      const rMax = 2.5 + tier * 0.85;

      const lavaPool = new THREE.Mesh(
        new THREE.CircleGeometry(rMax, 32),
        new THREE.MeshBasicMaterial({ color: attr.c1, side: THREE.DoubleSide, transparent: true, opacity: 0.78 })
      );
      lavaPool.rotation.x = -Math.PI / 2;
      lavaPool.position.y = 0.05;
      root.add(lavaPool);

      const geysers = [];
      for (let i = 0; i < 6 + tier * 4; i++) {
        const ang = (Math.PI * 2 * i) / (6 + tier * 4);
        const rad = rMax * (0.25 + (i % 3) * 0.28);
        const g = new THREE.Mesh(
          new THREE.ConeGeometry(0.35 + tier * 0.08, 3.2 + tier * 1.1, 10),
          new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? attr.c2 : attr.c1, transparent: true, opacity: 0.92 })
        );
        g.position.set(Math.cos(ang) * rad, 1.5, Math.sin(ang) * rad);
        root.add(g);
        geysers.push({ mesh: g, phase: i * 0.4 });
      }

      reg(scene, root, 1.15 + tier * 0.2, (p) => {
        const fade = p > 0.7 ? 1 - (p - 0.7) / 0.3 : 1;
        lavaPool.scale.setScalar(Math.min(1, p * 3.5));
        lavaPool.material.opacity = fade * 0.78;
        geysers.forEach((gy) => {
          const wave = Math.max(0.15, Math.sin(p * Math.PI + gy.phase));
          gy.mesh.scale.set(1, wave * 1.3, 1);
          gy.mesh.position.y = wave * (1.8 + tier * 0.5);
          gy.mesh.material.opacity = fade * 0.92;
        });
      });
    },

    // 9. 絶対零度・氷華氷柱魔法
    ice: (scene, caster, target, tier, attr) => {
      const root = new THREE.Group();
      root.position.set(target.x, 0, target.z);
      const zoneR = 2.4 + tier * 0.8;

      const hexRing = makeCircleRing(zoneR * 0.85, zoneR, attr.c1, 6);
      hexRing.position.y = 0.06;
      root.add(hexRing);

      const spikes = [];
      const spikeCnt = 7 + tier * 5;
      for (let i = 0; i < spikeCnt; i++) {
        const isCenter = i === 0;
        const ang = (Math.PI * 2 * i) / Math.max(1, spikeCnt - 1);
        const rad = isCenter ? 0 : zoneR * (0.35 + (i % 3) * 0.22);
        const h = (isCenter ? 3.8 : 2.3) + tier * 0.9;
        const w = (isCenter ? 0.65 : 0.38) + tier * 0.1;

        const sp = new THREE.Mesh(
          new THREE.ConeGeometry(w, h, 6),
          new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? attr.c1 : attr.c2, transparent: true, opacity: 0.9 })
        );
        sp.position.set(Math.cos(ang) * rad, -h * 0.5, Math.sin(ang) * rad);
        if (!isCenter) {
          sp.rotation.z = -Math.cos(ang) * 0.26;
          sp.rotation.x = Math.sin(ang) * 0.26;
        }
        root.add(sp);
        spikes.push({ mesh: sp, targetY: h * 0.46, startY: -h * 0.5 });
      }

      reg(scene, root, 1.15 + tier * 0.2, (p, el) => {
        const thrust = Math.min(1, p / 0.24);
        const fade = p > 0.72 ? 1 - (p - 0.72) / 0.28 : 1;
        hexRing.rotation.z = el * 2.2;
        hexRing.material.opacity = fade * 0.95;
        spikes.forEach((s) => {
          s.mesh.position.y = s.startY + (s.targetY - s.startY) * thrust;
          s.mesh.material.opacity = fade * 0.9;
        });
      });
    },

    // 10. 紫電・天罰落雷魔法
    thunder: (scene, caster, target, tier, attr) => {
      const root = new THREE.Group();
      root.position.set(target.x, 0, target.z);

      const bolts = [];
      const boltCount = 1 + tier;
      for (let b = 0; b < boltCount; b++) {
        const ox = b === 0 ? 0 : Math.cos((Math.PI * 2 * b) / boltCount) * (1.2 + tier * 0.35);
        const oz = b === 0 ? 0 : Math.sin((Math.PI * 2 * b) / boltCount) * (1.2 + tier * 0.35);
        const bGrp = new THREE.Group();
        const segs = 7;
        let curX = ox;
        let curZ = oz;
        for (let s = 0; s < segs; s++) {
          const nextX = s === segs - 1 ? ox : ox + (Math.random() - 0.5) * 1.5;
          const nextZ = s === segs - 1 ? oz : oz + (Math.random() - 0.5) * 1.5;
          const segH = 1.9 + tier * 0.3;
          const segMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.14 + tier * 0.04, 0.18 + tier * 0.04, segH, 8),
            new THREE.MeshBasicMaterial({ color: s % 2 === 0 ? attr.c1 : attr.c2, transparent: true, opacity: 1 })
          );
          segMesh.position.set((curX + nextX) * 0.5, (segs - s - 0.5) * segH, (curZ + nextZ) * 0.5);
          segMesh.rotation.z = (nextX - curX) * 0.45;
          segMesh.rotation.x = -(nextZ - curZ) * 0.45;
          bGrp.add(segMesh);
          curX = nextX;
          curZ = nextZ;
        }
        root.add(bGrp);
        bolts.push(bGrp);
      }

      const shockRing = makeCircleRing(0.5, 2.3 + tier * 0.85, attr.c1, 32);
      shockRing.position.y = 0.08;
      root.add(shockRing);

      reg(scene, root, 0.85 + tier * 0.15, (p, el) => {
        const fade = 1 - p;
        bolts.forEach((bg, idx) => {
          bg.visible = Math.sin(el * 55 + idx) > -0.35;
          bg.children.forEach(c => { c.material.opacity = fade; });
        });
        shockRing.scale.setScalar(0.5 + p * 1.4);
        shockRing.material.opacity = fade;
      });
    }
  };

  Object.assign(window.KMJ_SKILL_FX_V9.EFFECT_BUILDERS, EFFECT_BUILDERS_PART1);
  window.KMJ_SKILL_FX_V9._makeCircleRing = makeCircleRing;
})();
// ▲▲▲ ここまで【スキルエフェクト専用 game9.js 1/2】 ▲▲▲
// ▼▼▼ ここから【スキルエフェクト専用 game9.js 2/2】後半3Dビルダー(11〜18)・カットイン・baseName同期・魔法スタジオUI・両クラス安全フック・デバッグ連携API ▼▼▼
(() => {
  'use strict';

  const FX9 = window.KMJ_SKILL_FX_V9;
  if (!FX9) return;

  const ATTRS = FX9.ATTRIBUTES;
  const reg = FX9.register3DAnimation;
  const makeCircleRing = FX9._makeCircleRing || function (rIn, rOut, color, seg = 36) {
    const m = new THREE.Mesh(
      new THREE.RingGeometry(rIn, rOut, seg),
      new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.95, depthWrite: false })
    );
    m.rotation.x = -Math.PI / 2;
    return m;
  };

  // =========================================================
  // 1. 全18種スキル個別3Dエフェクト専用ビルダー（後半 11〜18）
  // =========================================================
  const EFFECT_BUILDERS_PART2 = {
    // 11. 旋風円舞・螺旋竜巻魔法
    wind: (scene, caster, target, tier, attr) => {
      const root = new THREE.Group();
      root.position.set(target.x, 0, target.z);

      const funnels = [];
      const layers = 5 + tier * 2;
      for (let i = 0; i < layers; i++) {
        const r = 0.55 + (i / layers) * (1.8 + tier * 0.5);
        const torus = new THREE.Mesh(
          new THREE.TorusGeometry(r, 0.07 + tier * 0.02, 8, 28),
          new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? attr.c1 : attr.c2, transparent: true, opacity: 0.9 })
        );
        torus.rotation.x = Math.PI / 2 + 0.15;
        torus.position.y = 0.4 + i * (0.75 + tier * 0.15);
        root.add(torus);
        funnels.push(torus);
      }

      reg(scene, root, 1.15 + tier * 0.2, (p, el) => {
        const fade = p > 0.72 ? 1 - (p - 0.72) / 0.28 : 1;
        funnels.forEach((fn, idx) => {
          fn.rotation.z = el * (8 + idx * 1.2);
          fn.position.x = Math.cos(el * 6 + idx) * 0.28;
          fn.position.z = Math.sin(el * 6 + idx) * 0.28;
          fn.material.opacity = fade * 0.9;
        });
      });
    },

    // 12. 蒼海・大渦潮水柱魔法
    water: (scene, caster, target, tier, attr) => {
      const root = new THREE.Group();
      root.position.set(target.x, 0, target.z);
      const rMax = 2.4 + tier * 0.8;

      const whirl = makeCircleRing(0.4, rMax, attr.c1, 36);
      whirl.position.y = 0.06;
      root.add(whirl);

      const spout = new THREE.Mesh(
        new THREE.CylinderGeometry(0.9 + tier * 0.3, 0.45 + tier * 0.15, 5.5 + tier * 1.8, 24, 1, true),
        new THREE.MeshBasicMaterial({ color: attr.c2, side: THREE.DoubleSide, transparent: true, opacity: 0.72 })
      );
      spout.position.y = 2.75;
      root.add(spout);

      const bubbles = [];
      for (let i = 0; i < 14 + tier * 6; i++) {
        const b = new THREE.Mesh(
          new THREE.SphereGeometry(0.18 + (i % 3) * 0.07, 10, 10),
          new THREE.MeshBasicMaterial({ color: attr.c2, transparent: true, opacity: 0.9 })
        );
        root.add(b);
        bubbles.push({ mesh: b, ang: (Math.PI * 2 * i) / (14 + tier * 6), rad: 0.7 + (i % 4) * 0.4 });
      }

      reg(scene, root, 1.15 + tier * 0.2, (p, el) => {
        const fade = p > 0.72 ? 1 - (p - 0.72) / 0.28 : 1;
        whirl.rotation.z = -el * 7;
        whirl.material.opacity = fade * 0.95;
        spout.rotation.y = el * 6;
        spout.scale.set(1 + Math.sin(el * 14) * 0.12, Math.sin(p * Math.PI), 1 + Math.sin(el * 14) * 0.12);
        spout.material.opacity = fade * 0.72;
        bubbles.forEach((bb, idx) => {
          const a = bb.ang + el * 5;
          bb.mesh.position.set(Math.cos(a) * bb.rad, (p * 5.2 + idx * 0.3) % 5.5, Math.sin(a) * bb.rad);
          bb.mesh.material.opacity = fade * 0.9;
        });
      });
    },

    // 13. 破邪の衝撃・巨岩隆起魔法
    earth: (scene, caster, target, tier, attr) => {
      const root = new THREE.Group();
      root.position.set(target.x, 0, target.z);
      const rMax = 2.4 + tier * 0.85;

      const quakeRing = makeCircleRing(rMax * 0.75, rMax, attr.c2, 8);
      quakeRing.position.y = 0.06;
      root.add(quakeRing);

      const rocks = [];
      const rockCnt = 6 + tier * 4;
      for (let i = 0; i < rockCnt; i++) {
        const ang = (Math.PI * 2 * i) / rockCnt;
        const rad = i === 0 ? 0 : rMax * (0.35 + (i % 2) * 0.3);
        const h = (i === 0 ? 2.8 : 1.9) + tier * 0.75;
        const rk = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.65 + tier * 0.18, 0),
          new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? attr.c1 : attr.c3, transparent: true, opacity: 0.96 })
        );
        rk.scale.set(1, h / 0.8, 1);
        rk.position.set(Math.cos(ang) * rad, -1.5, Math.sin(ang) * rad);
        root.add(rk);
        rocks.push({ mesh: rk, targetY: h * 0.42 });
      }

      reg(scene, root, 1.15 + tier * 0.2, (p) => {
        const thrust = Math.min(1, p / 0.22);
        const fade = p > 0.72 ? 1 - (p - 0.72) / 0.28 : 1;
        quakeRing.scale.setScalar(0.6 + p * 0.75);
        quakeRing.material.opacity = fade * 0.95;
        rocks.forEach((r) => {
          r.mesh.position.y = -1.5 + (r.targetY + 1.5) * thrust;
          r.mesh.material.opacity = fade * 0.96;
        });
      });
    },

    // 14. 聖光の癒し・天照光輪魔法
    holy_heal: (scene, caster, target, tier, attr) => {
      const root = new THREE.Group();
      root.position.set(target.x, 0, target.z);

      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(1.1 + tier * 0.35, 1.6 + tier * 0.45, 9 + tier * 2, 28, 1, true),
        new THREE.MeshBasicMaterial({ color: attr.c1, side: THREE.DoubleSide, transparent: true, opacity: 0.45 })
      );
      beam.position.y = 4.5;
      root.add(beam);

      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(1.3 + tier * 0.4, 0.09, 10, 36),
        new THREE.MeshBasicMaterial({ color: attr.c2, transparent: true, opacity: 0.95 })
      );
      halo.rotation.x = Math.PI / 2;
      halo.position.y = 3.2 + tier * 0.5;
      root.add(halo);

      const motes = [];
      for (let i = 0; i < 16 + tier * 8; i++) {
        const m = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.16 + tier * 0.04, 0),
          new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? attr.c1 : attr.c3, transparent: true, opacity: 0.95 })
        );
        root.add(m);
        motes.push({ mesh: m, ang: (Math.PI * 2 * i) / (16 + tier * 8), rad: 0.6 + (i % 4) * 0.35 });
      }

      reg(scene, root, 1.25 + tier * 0.2, (p, el) => {
        const fade = p > 0.72 ? 1 - (p - 0.72) / 0.28 : 1;
        beam.material.opacity = fade * 0.45;
        halo.rotation.z = el * 3.5;
        halo.material.opacity = fade * 0.95;
        motes.forEach((mt, idx) => {
          const a = mt.ang + el * 2.5;
          mt.mesh.position.set(Math.cos(a) * mt.rad, (p * 4.5 + idx * 0.25) % 4.5, Math.sin(a) * mt.rad);
          mt.mesh.material.opacity = fade * 0.95;
        });
      });
    },

    // 15. 黒蝕・ブラックホール魔法
    dark: (scene, caster, target, tier, attr) => {
      const root = new THREE.Group();
      root.position.set(target.x, 1.35 + tier * 0.25, target.z);

      const core = new THREE.Mesh(
        new THREE.SphereGeometry(0.85 + tier * 0.28, 24, 18),
        new THREE.MeshBasicMaterial({ color: 0x05020a, transparent: true, opacity: 0.98 })
      );
      root.add(core);

      const horizon = new THREE.Mesh(
        new THREE.SphereGeometry(0.95 + tier * 0.31, 20, 16),
        new THREE.MeshBasicMaterial({ color: attr.c1, wireframe: true, transparent: true, opacity: 0.92 })
      );
      root.add(horizon);

      const disk = new THREE.Mesh(
        new THREE.RingGeometry(1.1 + tier * 0.3, 2.5 + tier * 0.75, 40),
        new THREE.MeshBasicMaterial({ color: attr.c2, side: THREE.DoubleSide, transparent: true, opacity: 0.82 })
      );
      disk.rotation.x = Math.PI / 2 - 0.32;
      root.add(disk);

      reg(scene, root, 1.25 + tier * 0.25, (p, el) => {
        const pulse = p < 0.8 ? 1 : (1 - p) / 0.2;
        core.scale.setScalar(pulse);
        horizon.scale.setScalar(pulse);
        horizon.rotation.y = el * 4;
        disk.rotation.z = -el * 6;
        disk.scale.setScalar(pulse);
      });
    },

    // 16. 呪詛・魔界瘴気魔法
    poison: (scene, caster, target, tier, attr) => {
      const root = new THREE.Group();
      root.position.set(target.x, 0, target.z);
      const rMax = 2.3 + tier * 0.75;

      const swamp = new THREE.Mesh(
        new THREE.CircleGeometry(rMax, 32),
        new THREE.MeshBasicMaterial({ color: attr.c1, side: THREE.DoubleSide, transparent: true, opacity: 0.68 })
      );
      swamp.rotation.x = -Math.PI / 2;
      swamp.position.y = 0.05;
      root.add(swamp);

      const bubbles = [];
      for (let i = 0; i < 14 + tier * 6; i++) {
        const b = new THREE.Mesh(
          new THREE.SphereGeometry(0.22 + (i % 3) * 0.08, 12, 10),
          new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? attr.c2 : attr.c1, transparent: true, opacity: 0.88 })
        );
        root.add(b);
        bubbles.push({ mesh: b, ang: (Math.PI * 2 * i) / (14 + tier * 6), rad: rMax * (0.2 + (i % 4) * 0.2) });
      }

      reg(scene, root, 1.2 + tier * 0.2, (p, el) => {
        const fade = p > 0.72 ? 1 - (p - 0.72) / 0.28 : 1;
        swamp.material.opacity = fade * 0.68;
        bubbles.forEach((bb, idx) => {
          const y = ((p * 3.5 + idx * 0.4) % 3.2);
          bb.mesh.position.set(Math.cos(bb.ang) * bb.rad, y, Math.sin(bb.ang) * bb.rad);
          bb.mesh.scale.setScalar(1 + Math.sin(el * 8 + idx) * 0.25);
          bb.mesh.material.opacity = fade * 0.88;
        });
      });
    },

    // 17. 星屑・銀河流星魔法
    star: (scene, caster, target, tier, attr) => {
      const root = new THREE.Group();
      root.position.set(target.x, 0, target.z);

      const galaxy = makeCircleRing(0.6, 2.5 + tier * 0.8, attr.c1, 36);
      galaxy.position.y = 0.08;
      root.add(galaxy);

      const stars = [];
      const cols = [attr.c1, attr.c2, attr.c3, 0xffffff];
      for (let i = 0; i < 14 + tier * 6; i++) {
        const st = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.28 + tier * 0.07, 0),
          new THREE.MeshBasicMaterial({ color: cols[i % cols.length], transparent: true, opacity: 0.96 })
        );
        const ang = (Math.PI * 2 * i) / (14 + tier * 6);
        const rad = 0.4 + (i % 4) * (0.55 + tier * 0.15);
        st.position.set(Math.cos(ang) * rad, 8 + (i % 5) * 1.4, Math.sin(ang) * rad);
        root.add(st);
        stars.push({ mesh: st, x: Math.cos(ang) * rad, z: Math.sin(ang) * rad, startY: 8 + (i % 5) * 1.4 });
      }

      reg(scene, root, 1.15 + tier * 0.2, (p, el) => {
        const fade = p > 0.72 ? 1 - (p - 0.72) / 0.28 : 1;
        galaxy.rotation.z = el * 5;
        galaxy.material.opacity = fade * 0.95;
        stars.forEach((s) => {
          const drop = Math.min(1, p * 1.4);
          s.mesh.position.y = s.startY * (1 - drop) + 0.3;
          s.mesh.rotation.y = el * 7;
          s.mesh.material.opacity = fade * 0.96;
        });
      });
    },

    // 18. 秘剣・無限光剣陣
    sword: (scene, caster, target, tier, attr) => {
      const root = new THREE.Group();
      root.position.set(target.x, 0, target.z);

      const ring = makeCircleRing(0.8, 2.3 + tier * 0.75, attr.c1, 32);
      ring.position.y = 0.07;
      root.add(ring);

      const blades = [];
      const bCnt = 6 + tier * 4;
      for (let i = 0; i < bCnt; i++) {
        const bGrp = new THREE.Group();
        const blade = new THREE.Mesh(
          new THREE.ConeGeometry(0.16 + tier * 0.04, 2.2 + tier * 0.45, 4),
          new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? attr.c1 : attr.c2, transparent: true, opacity: 0.96 })
        );
        blade.rotation.x = Math.PI;
        const guard = new THREE.Mesh(
          new THREE.BoxGeometry(0.65 + tier * 0.12, 0.1, 0.18),
          new THREE.MeshBasicMaterial({ color: attr.c3, transparent: true, opacity: 0.96 })
        );
        guard.position.y = 1.05 + tier * 0.2;
        bGrp.add(blade, guard);

        const ang = (Math.PI * 2 * i) / bCnt;
        const rad = i === 0 ? 0 : 0.9 + (i % 2) * (0.7 + tier * 0.25);
        bGrp.position.set(Math.cos(ang) * rad, 6.5 + (i % 3) * 1.2, Math.sin(ang) * rad);
        root.add(bGrp);
        blades.push({ grp: bGrp, blade, guard, startY: 6.5 + (i % 3) * 1.2 });
      }

      reg(scene, root, 1.1 + tier * 0.2, (p, el) => {
        const slam = Math.min(1, p / 0.28);
        const fade = p > 0.72 ? 1 - (p - 0.72) / 0.28 : 1;
        ring.rotation.z = el * 4;
        ring.material.opacity = fade * 0.95;
        blades.forEach((b) => {
          b.grp.position.y = b.startY * (1 - slam) + 1.1;
          b.blade.material.opacity = fade * 0.96;
          b.guard.material.opacity = fade * 0.96;
        });
      });
    }
  };

  Object.assign(FX9.EFFECT_BUILDERS, EFFECT_BUILDERS_PART2);
  const BUILDERS = FX9.EFFECT_BUILDERS;

  function getGameInstanceV9() {
    return window.game || window.rpgGame || window._kmjGameInstance || null;
  }

  // =========================================================
  // 2. スペルカード風カットイン演出
  // =========================================================
  function showSpellCardCutinV9(info, casterName = 'HERO') {
    try {
      let layer = document.getElementById('kmj-v9-cutin-layer');
      if (!layer) {
        layer = document.createElement('div');
        layer.id = 'kmj-v9-cutin-layer';
        document.body.appendChild(layer);
      }
      layer.innerHTML = '';

      const attr = info.attr || ATTRS[ATTRS.length - 1];
      const tier = info.tier ?? 0;

      const flash = document.createElement('div');
      flash.className = 'kmj-v9-flash';
      flash.style.background = tier >= 2
        ? 'radial-gradient(circle, rgba(253,224,71,0.55), rgba(244,114,182,0.25), transparent 75%)'
        : 'radial-gradient(circle, rgba(56,189,248,0.42), transparent 75%)';
      layer.appendChild(flash);

      if (tier >= 1) {
        const lt = document.createElement('div');
        lt.className = 'kmj-v9-line-top';
        const lb = document.createElement('div');
        lb.className = 'kmj-v9-line-bot';
        layer.appendChild(lt);
        layer.appendChild(lb);
      }

      const banner = document.createElement('div');
      banner.className = 'kmj-v9-banner';
      banner.style.background = attr.bgGrad;
      banner.style.borderColor = tier >= 3 ? '#f472b6' : (tier >= 2 ? '#fde047' : '#7dd3fc');

      const stars = '★'.repeat(tier + 1);
      banner.innerHTML = `
        <div class="kmj-v9-ring-1"></div>
        <div class="kmj-v9-ring-2"></div>
        <div class="kmj-v9-banner-inner">
          <div class="kmj-v9-avatar">⚡ ${String(casterName || 'HERO').slice(0, 10)}</div>
          <div>
            <div style="font-size:11px;font-weight:800;color:#fde047;letter-spacing:0.08em;">
              ${attr.cardType} ${stars}
            </div>
            <div style="font-size:17px;font-weight:900;color:#ffffff;text-shadow:0 2px 10px rgba(0,0,0,0.85);margin-top:2px;">
              ${info.evolvedName}
            </div>
          </div>
        </div>
      `;
      layer.appendChild(banner);

      setTimeout(() => {
        if (layer && layer.contains(banner)) layer.innerHTML = '';
      }, 2450);
    } catch (e) {}
  }

  // =========================================================
  // 3. スキル属性・進化ランク判定＆元スキル名(baseName)保護同期
  // =========================================================
  function stripEvolvedDecorV9(rawName) {
    let s = String(rawName || '秘技').trim();
    // すでに進化名で保存されていた場合でも元のスキル名を安全に復元
    const bracketMatch = s.match(/^【(?:真|極|神)】[^「・]+(?:・([^「」]+)|「(?:[^「」・]+・)?([^「」]+)」)$/);
    if (bracketMatch) {
      return (bracketMatch[1] || bracketMatch[2] || s).trim();
    }
    return s;
  }

  function ensureBaseNameV9(skill) {
    if (!skill || typeof skill !== 'object') return stripEvolvedDecorV9(skill);
    if (!skill.baseName || typeof skill.baseName !== 'string') {
      skill.baseName = stripEvolvedDecorV9(skill.name || skill.id || '秘技');
    }
    return skill.baseName;
  }

  function getCustomSkillMapV9(game) {
    const g = game || getGameInstanceV9();
    if (!g?.saveData) return {};
    if (!g.saveData.customSkillFxV9 || typeof g.saveData.customSkillFxV9 !== 'object') {
      g.saveData.customSkillFxV9 = {};
    }
    return g.saveData.customSkillFxV9;
  }

  function getEvolvedSkillInfoV9(gameOrSkill, maybeSkill) {
    let game = null;
    let skill = null;
    if (maybeSkill !== undefined) {
      game = gameOrSkill;
      skill = maybeSkill;
    } else {
      skill = gameOrSkill;
      game = getGameInstanceV9();
    }

    const baseName = (skill && typeof skill === 'object')
      ? ensureBaseNameV9(skill)
      : stripEvolvedDecorV9(skill || '秘技');

    const customMap = getCustomSkillMapV9(game);
    const savedCfg = customMap[skill?.id] || customMap[baseName] || null;

    let attr = null;
    if (savedCfg?.attrId) {
      attr = ATTRS.find(a => a.id === savedCfg.attrId) || null;
    }
    if (!attr) {
      attr = ATTRS.find(a => a.match && a.match.test(baseName)) || ATTRS[ATTRS.length - 1];
    }

    const lv = Math.max(1, Number(skill?.lv || skill?.level || 1));
    const autoTier = lv >= 12 ? 3 : (lv >= 7 ? 2 : (lv >= 3 ? 1 : 0));
    const tier = savedCfg && typeof savedCfg.tier === 'number'
      ? Math.max(0, Math.min(3, savedCfg.tier))
      : autoTier;

    const nameList = attr.names(baseName);
    const evolvedName = (savedCfg?.customName && savedCfg.customName.trim())
      ? savedCfg.customName.trim()
      : (nameList[tier] || baseName);

    const powerMult = 1 + tier * 0.28;

    return {
      baseName,
      evolvedName,
      attr,
      tier,
      powerMult
    };
  }

  function syncAllSkillsV9(gameArg) {
    const g = gameArg || getGameInstanceV9();
    if (!g) return [];
    const lists = [g.saveData?.skills, g.skills, g.player?.skills].filter(Array.isArray);
    const synced = [];
    lists.forEach((arr) => {
      arr.forEach((sk) => {
        if (!sk || typeof sk !== 'object') return;
        const info = getEvolvedSkillInfoV9(g, sk);
        sk.name = info.evolvedName;
        sk.evolvedName = info.evolvedName;
        sk.attrId = info.attr.id;
        sk.tier = info.tier;
        sk.powerMult = info.powerMult;
        synced.push(info);
      });
    });
    return synced;
  }

  // =========================================================
  // 4. 3Dスキルエフェクト＆効果音ディスパッチャ
  // =========================================================
  function triggerCustomSkillEffectV9(game, casterEntity, targetPos, skill) {
    const g = game || getGameInstanceV9();
    if (!g) return null;
    const info = getEvolvedSkillInfoV9(g, skill);
    const attrId = info.attr.id;

    if (skill && typeof skill === 'object') {
      skill.name = info.evolvedName;
      skill.evolvedName = info.evolvedName;
    }

    FX9._playMagicAudio?.(attrId, info.tier);

    const casterName = casterEntity?.name || g.saveData?.name || 'HERO';
    showSpellCardCutinV9(info, casterName);

    if (attrId === 'aurora_sanctuary' && typeof FX9.spawnAuroraSanctuaryField === 'function') {
      FX9.spawnAuroraSanctuaryField(g, casterEntity || g.player, info);
    }

    if (g.useWebGL && g.scene && typeof THREE !== 'undefined') {
      const cPos = casterEntity?.pos || g.player?.pos || { x: 0, z: 0 };
      const yaw = Number(casterEntity?.yaw ?? g.player?.yaw ?? 0);
      const tPos = targetPos || {
        x: cPos.x + Math.sin(yaw) * 4.5,
        z: cPos.z + Math.cos(yaw) * 4.5
      };
      const builder = BUILDERS[attrId] || BUILDERS.sword;
      if (typeof builder === 'function') {
        try {
          builder(g.scene, cPos, tPos, info.tier, info.attr);
        } catch (e) {}
      }
    }

    return info;
  }

  // =========================================================
  // 5. デバッグスタジオ（game7.js）連携API
  // =========================================================
  function getAll14SkillsV9() {
    return ATTRS.map(a => ({
      id: a.id,
      name: a.label,
      label: a.label,
      cardType: a.cardType,
      defaultName: a.names('秘技')[0]
    }));
  }

  function previewSkillByObjV9(skillOrAttrId, attrIdOrGame, tierArg, gameArg) {
    let g = getGameInstanceV9();
    let skillObj = null;

    if (typeof skillOrAttrId === 'string') {
      const foundAttr = ATTRS.find(a => a.id === skillOrAttrId) || ATTRS[0];
      const tier = typeof attrIdOrGame === 'number' ? attrIdOrGame : (typeof tierArg === 'number' ? tierArg : 2);
      if (tierArg && typeof tierArg === 'object') g = tierArg;
      if (gameArg && typeof gameArg === 'object') g = gameArg;
      const base = foundAttr.label.replace(/^[^\s]+\s*/, '').split('・')[0] || '秘技';
      skillObj = { id: `preview_${foundAttr.id}`, baseName: base, name: base, lv: tier >= 3 ? 12 : (tier >= 2 ? 7 : (tier >= 1 ? 3 : 1)) };
      const customMap = getCustomSkillMapV9(g);
      const prevCfg = customMap[skillObj.id];
      customMap[skillObj.id] = { attrId: foundAttr.id, tier };
      const res = triggerCustomSkillEffectV9(g, g?.player, null, skillObj);
      if (prevCfg) customMap[skillObj.id] = prevCfg;
      else delete customMap[skillObj.id];
      return res;
    }

    if (skillOrAttrId && typeof skillOrAttrId === 'object') {
      skillObj = skillOrAttrId;
      if (attrIdOrGame && typeof attrIdOrGame === 'object') {
        g = attrIdOrGame;
      } else if (typeof attrIdOrGame === 'string') {
        if (gameArg && typeof gameArg === 'object') g = gameArg;
        const key = skillObj.id || ensureBaseNameV9(skillObj);
        const customMap = getCustomSkillMapV9(g);
        const prevCfg = customMap[key];
        customMap[key] = {
          attrId: attrIdOrGame,
          tier: typeof tierArg === 'number' ? tierArg : 2
        };
        const res = triggerCustomSkillEffectV9(g, g?.player, null, skillObj);
        if (prevCfg) customMap[key] = prevCfg;
        else delete customMap[key];
        return res;
      }
      return triggerCustomSkillEffectV9(g, g?.player, null, skillObj);
    }
    return null;
  }

  // =========================================================
  // 6. スキル派生・魔法スタジオUIモーダル
  // =========================================================
  function openMagicStudioModalV9(game) {
    const g = game || getGameInstanceV9();
    if (!g) return;
    const old = document.getElementById('kmj-v9-studio-modal');
    if (old) old.remove();

    syncAllSkillsV9(g);

    const skills = Array.isArray(g.saveData?.skills) && g.saveData.skills.length > 0
      ? g.saveData.skills
      : [
          { id: 'sk_slash', baseName: '烈空・三日月真空斬', name: '烈空・三日月真空斬', lv: 1 },
          { id: 'sk_fire', baseName: '紅蓮業火・螺旋炎柱', name: '紅蓮業火・螺旋炎柱', lv: 1 },
          { id: 'sk_ice', baseName: '絶対零度・氷華氷柱', name: '絶対零度・氷華氷柱', lv: 1 },
          { id: 'sk_aurora', baseName: '極光の聖域', name: '極光の聖域', lv: 1 }
        ];

    const customMap = getCustomSkillMapV9(g);

    const modal = document.createElement('div');
    modal.id = 'kmj-v9-studio-modal';

    const attrOptionsHtml = ATTRS.map(a => `<option value="${a.id}">${a.label}</option>`).join('');

    modal.innerHTML = `
      <div class="kmj-v9-studio-card">
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(244,114,182,0.4);padding-bottom:8px;margin-bottom:10px;">
          <div style="font-size:16px;font-weight:900;color:#fde047;">✨ スキル派生＆魔法エフェクトスタジオ</div>
          <button id="kmj-v9-studio-close" style="background:#334155;color:#fff;border:none;border-radius:8px;padding:4px 10px;font-weight:800;cursor:pointer;">✕</button>
        </div>
        <div style="font-size:12px;color:#cbd5e1;margin-bottom:10px;">
          各スキルの「属性エフェクト」と「進化ランク（通常〜神話）」を自由にカスタマイズ・即座に試射できます。
        </div>
        <div id="kmj-v9-studio-list" style="display:flex;flex-direction:column;gap:10px;"></div>
      </div>
    `;
    document.body.appendChild(modal);

    const listEl = modal.querySelector('#kmj-v9-studio-list');
    skills.forEach((sk, idx) => {
      const base = ensureBaseNameV9(sk);
      const info = getEvolvedSkillInfoV9(g, sk);
      const row = document.createElement('div');
      row.style.cssText = 'background:rgba(15,23,42,0.85);border:1px solid rgba(125,211,252,0.35);border-radius:10px;padding:10px;';
      row.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;gap:6px;">
          <span style="font-weight:900;color:#7dd3fc;font-size:13px;">${base} (Lv.${sk.lv || 1})</span>
          <span class="kmj-v9-preview-name" style="font-size:11px;color:#fde047;font-weight:800;text-align:right;">${info.evolvedName}</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 115px;gap:6px;margin-bottom:8px;">
          <select class="kmj-v9-attr-sel" style="background:#1e293b;color:#fff;border:1px solid #475569;border-radius:6px;padding:5px;font-size:12px;">
            ${attrOptionsHtml}
          </select>
          <select class="kmj-v9-tier-sel" style="background:#1e293b;color:#fde047;border:1px solid #475569;border-radius:6px;padding:5px;font-size:12px;font-weight:800;">
            <option value="0">★ 通常</option>
            <option value="1">★★ 【真】進化</option>
            <option value="2">★★★ 【極】奥義</option>
            <option value="3">★★★★ 【神】創世</option>
          </select>
        </div>
        <div style="display:flex;gap:6px;justify-content:flex-end;">
          <button class="kmj-v9-test-btn" style="background:linear-gradient(90deg,#ec4899,#8b5cf6);color:#fff;border:none;border-radius:6px;padding:5px 12px;font-size:12px;font-weight:800;cursor:pointer;">
            ⚡ エフェクト試射
          </button>
          <button class="kmj-v9-save-btn" style="background:#0284c7;color:#fff;border:none;border-radius:6px;padding:5px 12px;font-size:12px;font-weight:800;cursor:pointer;">
            💾 保存
          </button>
        </div>
      `;

      const attrSel = row.querySelector('.kmj-v9-attr-sel');
      const tierSel = row.querySelector('.kmj-v9-tier-sel');
      const prevName = row.querySelector('.kmj-v9-preview-name');

      attrSel.value = info.attr.id;
      tierSel.value = String(info.tier);

      const syncPreview = () => {
        const key = sk.id || base || `sk_${idx}`;
        customMap[key] = {
          attrId: attrSel.value,
          tier: Number(tierSel.value)
        };
        const updated = getEvolvedSkillInfoV9(g, sk);
        sk.name = updated.evolvedName;
        prevName.textContent = updated.evolvedName;
      };

      attrSel.addEventListener('change', syncPreview);
      tierSel.addEventListener('change', syncPreview);

      row.querySelector('.kmj-v9-test-btn').addEventListener('click', () => {
        syncPreview();
        triggerCustomSkillEffectV9(g, g.player, null, sk);
      });

      row.querySelector('.kmj-v9-save-btn').addEventListener('click', () => {
        syncPreview();
        syncAllSkillsV9(g);
        g.renderSkillBar?.();
        g.updateUI?.();
        g.saveGame?.();
        g.showAlertBanner?.(`✨ 「${base}」の魔法派生設定を保存しました！`, 1800);
      });

      listEl.appendChild(row);
    });

    modal.querySelector('#kmj-v9-studio-close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  // 右下配置に調整して右上UI（ミニマップ・ステータス等）との重なりを解消
  function ensureMagicStudioButtonV9() {
    if (document.getElementById('kmj-v9-studio-open-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'kmj-v9-studio-open-btn';
    btn.textContent = '✨ 魔法進化';
    btn.style.cssText = `
      position: fixed; right: 12px; bottom: 74px; z-index: 9800;
      background: linear-gradient(135deg, #7e22ce, #db2777);
      color: #fff; border: 1.5px solid #fde047; border-radius: 999px;
      padding: 6px 13px; font-size: 12px; font-weight: 900;
      box-shadow: 0 2px 12px rgba(219,39,119,0.55); cursor: pointer;
    `;
    btn.addEventListener('click', () => {
      const g = getGameInstanceV9();
      if (g) openMagicStudioModalV9(g);
    });
    document.body.appendChild(btn);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureMagicStudioButtonV9);
  } else {
    ensureMagicStudioButtonV9();
  }

  // =========================================================
  // 7. 剣クラスのフォールバック横振り3D斬撃エフェクト
  // =========================================================
  function spawnWeaponHorizontalSlashV9(game, attacker, comboIndex = 0) {
    if (!game?.useWebGL || !game?.scene || !attacker?.pos || typeof THREE === 'undefined') return;
    const root = new THREE.Group();
    root.position.set(attacker.pos.x, 1.05, attacker.pos.z);
    root.rotation.y = Number(attacker.yaw || 0);

    const isReverse = comboIndex % 2 === 1;
    const isFinisher = comboIndex >= 2;
    const radius = isFinisher ? 2.65 : 2.15;
    const color = isFinisher ? 0xfde047 : (isReverse ? 0xf472b6 : 0x38bdf8);

    const arc = new THREE.Mesh(
      new THREE.RingGeometry(radius * 0.45, radius, 28, 1, -Math.PI * 0.45, Math.PI * 0.9),
      new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.92 })
    );
    arc.rotation.x = Math.PI / 2;
    arc.rotation.z = isReverse ? 0.35 : -0.35;
    root.add(arc);

    FX9.register3DAnimation(game.scene, root, 0.28, (p) => {
      const sweep = (isReverse ? -1 : 1) * (p - 0.5) * 1.4;
      root.rotation.y = Number(attacker.yaw || 0) + sweep;
      arc.scale.setScalar(0.85 + p * 0.35);
      arc.material.opacity = (1 - p) * 0.92;
    });
  }

  // =========================================================
  // 8. KaomojiMMORPG / RPGGame 両対応＆二重発火防止安全フック
  // =========================================================
  function patchGameClassPrototypeV9(GameClass) {
    if (!GameClass || !GameClass.prototype) return false;
    const P = GameClass.prototype;
    if (P._kmjV9Patched) return true;
    P._kmjV9Patched = true;

    // 8-1. update フック（極光の聖域フィールド更新＆インスタンス捕捉）
    const origUpdate = P.update;
    if (typeof origUpdate === 'function') {
      P.update = function (dt, ...args) {
        window._kmjGameInstance = this;
        if (!this._kmjV9InitialSynced && (this.saveData?.skills || this.skills)) {
          this._kmjV9InitialSynced = true;
          try { syncAllSkillsV9(this); } catch (e) {}
        }
        const res = origUpdate.call(this, dt, ...args);
        try {
          FX9.updateSanctuaryFields?.(this, dt);
          if (this.player && this.player.sanctuaryBuffTimer > 0) {
            this.player.sanctuaryBuffTimer = Math.max(0, this.player.sanctuaryBuffTimer - (dt || 0.016));
          }
        } catch (e) {}
        return res;
      };
    }

    // 8-2. スキル発動メソッドフック（KaomojiMMORPG / RPGGame 全メソッド対応＋連鎖呼び出し二重発火防止）
    const castMethods = ['useSkillSlot', 'executeSingleSkillCast', 'useSkill', 'castSkill', 'executeSkill'];
    castMethods.forEach((mName) => {
      if (typeof P[mName] === 'function' && !P[`_kmjV9Orig_${mName}`]) {
        P[`_kmjV9Orig_${mName}`] = P[mName];
        P[mName] = function (skillOrIndex, targetArg, ...rest) {
          window._kmjGameInstance = this;
          this._kmjV9CastDepth = (this._kmjV9CastDepth || 0) + 1;
          const isOuterCall = this._kmjV9CastDepth === 1;

          try {
            if (isOuterCall) {
              let skillObj = null;
              if (skillOrIndex && typeof skillOrIndex === 'object') {
                skillObj = skillOrIndex;
              } else if (typeof skillOrIndex === 'number' || typeof skillOrIndex === 'string') {
                skillObj = this.saveData?.skills?.[skillOrIndex]
                  || this.skills?.[skillOrIndex]
                  || this.skillSlots?.[skillOrIndex]
                  || (Array.isArray(this.saveData?.skills)
                    ? this.saveData.skills.find(s => s && (s.id === skillOrIndex || s.baseName === skillOrIndex || s.name === skillOrIndex))
                    : null);
              }

              let tPos = null;
              if (targetArg && typeof targetArg === 'object') {
                tPos = targetArg.pos || (typeof targetArg.x === 'number' ? targetArg : null);
              } else if (this.lockedTarget?.pos) {
                tPos = this.lockedTarget.pos;
              }

              if (skillObj) {
                try {
                  triggerCustomSkillEffectV9(this, this.player, tPos, skillObj);
                } catch (e) {}
              }
            }

            return P[`_kmjV9Orig_${mName}`].call(this, skillOrIndex, targetArg, ...rest);
          } finally {
            this._kmjV9CastDepth = Math.max(0, (this._kmjV9CastDepth || 1) - 1);
          }
        };
      }
    });

    // 8-3. 通常攻撃ビジュアルルーター統合（剣3連横振り・杖魔法弾を壊さずに共存させる）
    const origTriggerAttackVisual = P.triggerAttackVisual;
    P.triggerAttackVisual = function (attacker, comboIndex = 0, ...rest) {
      window._kmjGameInstance = this;
      const targetEntity = attacker || this.player;

      if (typeof window.routeBasicAttackVisualV7 === 'function') {
        const handled = window.routeBasicAttackVisualV7(this, targetEntity, comboIndex, ...rest);
        if (handled !== false) return handled;
      }

      if (typeof origTriggerAttackVisual === 'function') {
        return origTriggerAttackVisual.call(this, attacker, comboIndex, ...rest);
      }

      const cls = String(
        targetEntity?.classId ||
        targetEntity?.jobId ||
        this.saveData?.classId ||
        this.saveData?.job ||
        ''
      ).toLowerCase();
      const isStaff = /staff|wand|mage|wizard|sorcerer|witch|cleric|priest|杖|魔導|魔法|僧侶/.test(cls);
      if (!isStaff) {
        spawnWeaponHorizontalSlashV9(this, targetEntity, comboIndex);
      }
    };

    return true;
  }

  function patchAllGameClassesV9() {
    let patchedAny = false;
    if (typeof KaomojiMMORPG !== 'undefined') {
      patchedAny = patchGameClassPrototypeV9(KaomojiMMORPG) || patchedAny;
    }
    if (typeof RPGGame !== 'undefined') {
      patchedAny = patchGameClassPrototypeV9(RPGGame) || patchedAny;
    }
    return patchedAny;
  }

  if (!patchAllGameClassesV9()) {
    let retries = 0;
    const timer = setInterval(() => {
      retries++;
      if (patchAllGameClassesV9() || retries > 40) clearInterval(timer);
    }, 150);
  }

  // 外部・デバッグスタジオ連携公開API
  FX9.showSpellCardCutin = showSpellCardCutinV9;
  FX9.getEvolvedSkillInfo = getEvolvedSkillInfoV9;
  FX9.getSkillInfo = getEvolvedSkillInfoV9;
  FX9.triggerCustomSkillEffect = triggerCustomSkillEffectV9;
  FX9.openMagicStudioModal = openMagicStudioModalV9;
  FX9.spawnWeaponHorizontalSlash = spawnWeaponHorizontalSlashV9;
  FX9.getAll14Skills = getAll14SkillsV9;
  FX9.getAllSkills = getAll14SkillsV9;
  FX9.previewSkillByObj = previewSkillByObjV9;
  FX9.syncAllSkills = syncAllSkillsV9;
})();
// ▲▲▲ ここまで【スキルエフェクト専用 game9.js 2/2】 ▲▲▲
