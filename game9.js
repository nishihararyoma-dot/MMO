// ▼▼▼ ここから【スキルエフェクト専用 game9.js 1/2（前編）】 ▼▼▼
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
  // 2. 属性別リッチ・シンセサイザー効果音（全18種プリセット）
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
        warcry_aura:      { wave: 'sawtooth', base: 220,  sweep: 660,  notes: [330, 440, 659.25, 880, 1318.5] },
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
  // 3. 全18種の進化プロファイル（スキル内容と完全一致・【真】→【極】→【神】）
  // =========================================================
  const SKILL_DERIVATION_PROFILES_V9 = [
    {
      id: 'warcry_aura',
      label: '🔥 覇王の咆哮・闘気覚醒オーラ',
      match: /覇王|咆哮|鼓舞|闘気|覚醒|雄叫び|戦意|バフ|warcry|fury|roar|buff|berserk/i,
      cardType: '闘気覚醒スペル',
      c1: 0xf59e0b, c2: 0xef4444, c3: 0xfde047,
      bgGrad: 'linear-gradient(135deg, rgba(124,45,18,0.98), rgba(185,28,28,0.94))',
      names: (b) => [
        b,
        `【真】烈火闘気・${b}`,
        `【極】覇王降臨陣「オーバーロード・${b}」`,
        `【神】戦神覚醒「アレス・無双覇王咆哮」`
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
        `【真】絶対防壁・金剛聖盾`,
        `【極】不落城塞盾「アイギス・フォートレス」`,
        `【神】創世不滅神盾「神域イージス・ゼロ」`
      ]
    },
    {
      id: 'aurora_sanctuary',
      label: '🌈 極光の聖域（持続HP/MP回復＆マルチバフ領域）',
      match: /極光|聖域|オーロラ|サンクチュアリ|領域|holy_aurora|sanctuary|aurora|field/i,
      cardType: '聖域展開スペル',
      c1: 0x34d399, c2: 0xf472b6, c3: 0xfde047,
      bgGrad: 'linear-gradient(135deg, rgba(6,95,70,0.98), rgba(124,58,237,0.94))',
      names: (b) => [
        b,
        `【真】極光祝福の聖域・改`,
        `【極】天界聖域陣「オーロラ・エリュシオン」`,
        `【神】創世楽園領域「極光の聖域・アルカディア」`
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
        `【真】蒼穹烈空・双月斬`,
        `【極】次元裂断「真空三日月・無双閃」`,
        `【神】天翔斬空神技「蒼穹烈空・次元断罪斬」`
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
        `【神】創世天隕「アルティメット・スターフォール」`
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
        `【極】炎帝昇竜符「クリムゾン・ピラー」`,
        `【神】太陽神話「アポロン・天衝紅蓮螺旋柱」`
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
        `【極】紅蓮弾幕符「イグニッション・ノヴァ」`,
        `【神】爆焔神話「イフリート・千輪大爆炎陣」`
      ]
    },
    {
      id: 'fire_eruption',
      label: '🌋 灼熱・溶岩マグマ噴火魔法',
      match: /炎|火|灼熱|溶岩|マグマ|噴火|flame|magma|lava/i,
      cardType: '灼熱噴火スペル',
      c1: 0xb91c1c, c2: 0xf59e0b, c3: 0xfef08a,
      bgGrad: 'linear-gradient(135deg, rgba(69,10,10,0.98), rgba(180,83,9,0.94))',
      names: (b) => [
        b,
        `【真】地殻灼熱・${b}`,
        `【極】煉獄噴火符「ヴォルカニック・コア」`,
        `【神】地底創世「ムスペルヘイム・終焉マグマ噴火」`
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
        `【神】銀世界神話「エターナル・ダイヤモンドダスト」`
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
        `【神】天罰神雷「インドラ・オーバーロードサンダー」`
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
        `【神】天空神話「シルフィード・無尽真空覇王陣」`
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
        `【神】深淵海神「ポセイドン・創世大津波ノヴァ」`
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
        `【神】星砕神話「タイタン・天地開闢金剛砕」`
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
        `【神】創世聖典「セラフィム・無限光輪の奇跡」`
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
        `【神】終焉神話「ラグナロク・次元黒蝕シンギュラリティ」`
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
        `【神】混沌神話「ヒュドラ・無間地獄の瘴気陣」`
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
        `【神】宇宙創世「ビッグバン・ギャラクシーノヴァ」`
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
        `【神】創世剣神「エクスカリバー・無限光剣陣」`
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
  // 5. 「極光の聖域」持続フィールド管理（calcDerivedStats参照でHP100激減を完全修正）
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
            // 本体の calcDerivedStats() から正確な最大HP/MPを取得
            const st = typeof game.calcDerivedStats === 'function' ? game.calcDerivedStats() : null;
            const realMaxHp = Math.max(Number(st?.maxHp || 0), Number(game.player.maxHp || 0), Number(game.saveData.maxHp || 0), 100);
            const realMaxMp = Math.max(Number(st?.maxMp || 0), Number(game.player.maxMp || 0), Number(game.saveData.maxMp || 0), 100);

            const curHp = Math.max(Number(game.player.hp ?? 0), Number(game.saveData.hp ?? 0));
            const curMp = Math.max(Number(game.player.mp ?? 0), Number(game.saveData.mp ?? 0));

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

  // =========================================================
  // 6. スペルカードカットイン＆詠唱オーラ
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

    register3DAnimationV9(game.scene, grp, 0.75, (p, elapsed) => {
      grp.position.set(entity.pos.x, 0, entity.pos.z);
      footRing1.rotation.z = elapsed * 4;
      footRing2.rotation.z = -elapsed * 5;
      const fade = p > 0.65 ? Math.max(0, 1 - (p - 0.65) / 0.35) : 1;
      footRing1.material.opacity = fade * 0.92;
      footRing2.material.opacity = fade * 0.92;
    });
  }

  // =========================================================
  // 7. 公開API（saveData.skills[skId]参照・自然な属性マッチング・data.js MP準拠・スタジオUI）
  // =========================================================
  function calcAccurateSkillMpV9(sk, lv, defaultOrig = 10) {
    if (typeof window.getSkillMpCost === 'function' && sk) {
      try {
        const res = Number(window.getSkillMpCost(sk, lv));
        if (res > 0) return res;
      } catch (e) {}
    }
    const base = Number(sk?._origMpV9 ?? sk?.mpCost ?? sk?.mp ?? defaultOrig) || defaultOrig;
    return Math.max(1, Math.floor(base * (1 + (Math.max(1, lv) - 1) * 0.08)));
  }

  window.KMJ_SKILL_FX_V9 = {
    ATTRIBUTES: SKILL_DERIVATION_PROFILES_V9,
    EFFECT_BUILDERS: {},
    register3DAnimation: register3DAnimationV9,
    spawnAuroraSanctuaryField: spawnAuroraSanctuaryFieldV9,
    updateSanctuaryFields: updateSanctuaryFieldsV9,
    showSpellCardCutin: showSpellCardCutinV9,
    spawnCasterChantAura: spawnCasterChantAuraV9,
    _playMagicAudio: playMagicAudioV9,

    getAll14Skills(game) {
      let list = [];
      if (typeof SKILLS !== 'undefined' && SKILLS) {
        list = (Array.isArray(SKILLS) ? SKILLS : Object.values(SKILLS)).filter(s => s && typeof s === 'object');
      }
      if (list.length === 0) {
        return [
          { id: 'sk_1', name: '烈空斬', mpCost: 8, icon: '⚔️' },
          { id: 'sk_2', name: '旋風円舞', mpCost: 14, icon: '🌪️' },
          { id: 'sk_3', name: '破邪の衝撃', mpCost: 12, icon: '🪨' },
          { id: 'sk_4', name: '聖光の癒し', mpCost: 16, icon: '💖' },
          { id: 'sk_5', name: '星屑メテオ', mpCost: 26, icon: '☄️' },
          { id: 'sk_6', name: '絶対零度ノヴァ', mpCost: 22, icon: '❄️' },
          { id: 'sk_7', name: '神域イージス', mpCost: 24, icon: '🛡️' },
          { id: 'sk_8', name: '極光の聖域', mpCost: 30, icon: '🌈' },
          { id: 'sk_9', name: 'サンダーボルト', mpCost: 20, icon: '⚡' },
          { id: 'sk_10', name: 'アクアゲイザー', mpCost: 22, icon: '🌊' },
          { id: 'sk_11', name: 'ダークアビス', mpCost: 28, icon: '🌌' },
          { id: 'sk_12', name: 'ポイズンミスト', mpCost: 18, icon: '☠️' },
          { id: 'sk_13', name: 'スターダストノヴァ', mpCost: 32, icon: '🌟' },
          { id: 'sk_14', name: '覇王の咆哮', mpCost: 20, icon: '🔥' }
        ];
      }
      return list;
    },

    matchSkillProfile(sk, idx = 0) {
      if (!sk || typeof sk !== 'object') return SKILL_DERIVATION_PROFILES_V9[0];
      if (!sk._origNameV9 && typeof sk.name === 'string') {
        sk._origNameV9 = sk.name.replace(/^【(真|極|神|奥義|神話奥義)】[^「・]*[・「]?|」$/g, '').trim() || sk.name;
      }
      const origName = sk._origNameV9 || `秘技・第${idx + 1}の型`;
      const searchStr = `${sk.id || ''} ${origName} ${sk.desc || ''} ${sk.type || ''}`;

      // 排他割り当てをやめ、スキル内容・ID・名称に素直に合致する演出を割り当てる
      const chosen = SKILL_DERIVATION_PROFILES_V9.find(p => p.match.test(searchStr))
        || SKILL_DERIVATION_PROFILES_V9[idx % SKILL_DERIVATION_PROFILES_V9.length];
      sk._uniqueThemeV9 = chosen;
      return chosen;
    },

    assignUniqueProfiles(allList) {
      allList.forEach((sk, idx) => this.matchSkillProfile(sk, idx));
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
      } else if (typeof slotOrSkill === 'string') {
        rawSkill = allList.find(s => String(s.id) === slotOrSkill || String(s.name) === slotOrSkill) || allList[0];
      } else {
        // 本体の装備スロット配列 saveData.equippedSkills[slotIdx] を優先取得
        const eqId = Array.isArray(d.equippedSkills) ? d.equippedSkills[slotIdx] : null;
        if (eqId) {
          rawSkill = allList.find(s => String(s.id) === String(eqId)) || null;
        }
        if (!rawSkill && typeof game?.resolveSkillMeta === 'function') {
          const meta = game.resolveSkillMeta(slotIdx);
          if (meta) {
            rawSkill = allList.find(s => String(s.id) === String(meta.skillId) || String(s.skillId) === String(meta.skillId)) || null;
          }
        }
        if (!rawSkill) rawSkill = allList[slotIdx] || allList[0];
      }

      const sid = String(rawSkill?.id || rawSkill?.skillId || '');
      // 本体の saveData.skills[sid] から習得スキルレベルを正しく取得
      skillLv = Math.max(1, Number(
        d.skills?.[sid] ??
        d.skillLevels?.[sid] ??
        d.skillLvs?.[sid] ??
        rawSkill?.lv ??
        rawSkill?.level ??
        1
      ));

      const defaultOrig = [8, 14, 12, 16, 26, 22, 24, 30, 20, 22, 28, 18, 32, 20][slotIdx] || 14;
      if (rawSkill && rawSkill._origMpV9 === undefined) {
        const detected = Number(rawSkill.mpCost ?? rawSkill.mp ?? rawSkill.costMp ?? 0);
        rawSkill._origMpV9 = detected > 0 ? detected : defaultOrig;
      }

      const origMp = rawSkill?._origMpV9 || defaultOrig;
      const mpCost = calcAccurateSkillMpV9(rawSkill, skillLv, origMp);

      const origName = rawSkill?._origNameV9 || `秘技・第${slotIdx + 1}の型`;
      const tier = skillLv >= 100 ? 3 : (skillLv >= 50 ? 2 : (skillLv >= 10 ? 1 : 0));

      const theme = rawSkill?._uniqueThemeV9 || this.matchSkillProfile(rawSkill, slotIdx);
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
      // 消費MPの強制上書きは廃止し、スキル進化名のみ同期（MPは data.js の getSkillMpCost に一本化）
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
              現在Lv.${info.skillLv}（消費MP: ${info.mpCost} ／ Lv10で【真】・Lv50で【極】・Lv100で【神】へ自動進化）
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
            <b style="font-size:13.5px;color:#f9a8d4;">🎬 全${all14.length}種スキル 3D進化プレビュースタジオ</b>
            <button type="button" id="kmj-v9-close-studio" style="background:#ef4444;color:#fff;border:none;border-radius:6px;padding:4px 10px;font-size:11px;font-weight:900;cursor:pointer;">✕ 閉じる</button>
          </div>
          <div style="font-size:10px;color:#fde047;margin-bottom:8px;">
            ※ 各スキルの属性・特性に合った3D演出＆スペルカードカットインをテスト発動できます！
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
      const targetBody = body || document.getElementById('modal-body');
      if (!targetBody) return;
      const txt = targetBody.textContent || '';
      if (!/skill|magic|art/.test(String(tab || '')) && !txt.includes('スキル強化') && !txt.includes('スキル一覧')) return;
      if (targetBody.querySelector('#kmj-v9-inline-studio-btn')) return;
      const count = this.getAll14Skills(game).length;
      targetBody.insertAdjacentHTML('afterbegin', `
        <div class="card-box" style="margin-bottom:8px;border:1.5px solid #f472b6;background:rgba(30,27,75,0.95);display:flex;align-items:center;justify-content:space-between;gap:8px;">
          <div>
            <div style="font-size:11px;font-weight:900;color:#f9a8d4;">🎬 全${count}種スキル 3D進化スタジオ</div>
            <div style="font-size:9.5px;color:#cbd5e1;">各スキルの進化演出（【真】【極】【神】）・聖盾・極光の聖域を試せます！</div>
          </div>
          <button type="button" id="kmj-v9-inline-studio-btn" style="background:linear-gradient(90deg,#ec4899,#8b5cf6);border:none;color:#fff;border-radius:7px;padding:7px 11px;font-size:11px;font-weight:900;cursor:pointer;white-space:nowrap;">⚡ スタジオを開く</button>
        </div>
      `);
      targetBody.querySelector('#kmj-v9-inline-studio-btn').onclick = () => this.openStudioModal(game);
    }
  };
})();
// --- 【1/2】ここまで（この直下に【2/2】を繋げてください） ---
// ▼▼▼ ここから【スキルエフェクト専用 game9.js 2/2（後編）】 ▼▼▼
(() => {
  'use strict';

  const FX = window.KMJ_SKILL_FX_V9;
  if (!FX) {
    console.warn('[game9.js] 1/2（前編）が先に読み込まれていません。');
    return;
  }

  // =========================================================
  // 8. 共通3Dジオメトリ＆座標ヘルパー
  // =========================================================
  function resolveTargetPosV9(game, caster, rawTarget) {
    if (rawTarget && typeof rawTarget.x === 'number' && typeof rawTarget.z === 'number') {
      return { x: rawTarget.x, y: Number(rawTarget.y || 0), z: rawTarget.z };
    }
    if (rawTarget?.pos && typeof rawTarget.pos.x === 'number') {
      return { x: rawTarget.pos.x, y: Number(rawTarget.pos.y || 0), z: rawTarget.pos.z };
    }
    const locked = game?.targetEnemy || game?.lockedTarget || game?.selectedEnemy;
    if (locked?.pos && (locked.hp === undefined || locked.hp > 0)) {
      return { x: locked.pos.x, y: Number(locked.pos.y || 0), z: locked.pos.z };
    }
    const cx = Number(caster?.pos?.x || 0);
    const cz = Number(caster?.pos?.z || 0);
    const yaw = Number(caster?.rotY ?? caster?.rotation?.y ?? caster?.dir ?? 0);
    return {
      x: cx + Math.sin(yaw) * 4.5,
      y: 0,
      z: cz + Math.cos(yaw) * 4.5
    };
  }

  function makeRingMesh(rIn, rOut, segs, color, opacity = 0.9) {
    const m = new THREE.Mesh(
      new THREE.RingGeometry(rIn, rOut, segs),
      new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity })
    );
    m.rotation.x = -Math.PI / 2;
    return m;
  }

  // =========================================================
  // 9. 全18種スキル専用 3Dエフェクトビルダー群
  // =========================================================
  const BUILDERS = FX.EFFECT_BUILDERS;

  // 1. 覇王の咆哮・闘気覚醒オーラ
  BUILDERS.warcry_aura = (scene, casterPos, targetPos, info) => {
    const tier = info.tier;
    const { c1, c2, c3 } = info.theme;
    const root = new THREE.Group();
    root.position.set(casterPos.x, 0, casterPos.z);

    const scale = 1 + tier * 0.35;
    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(1.1 * scale, 1.5 * scale, 4.8 + tier * 1.4, 24, 1, true),
      new THREE.MeshBasicMaterial({ color: c1, side: THREE.DoubleSide, transparent: true, opacity: 0.48 })
    );
    pillar.position.y = (4.8 + tier * 1.4) * 0.5;
    root.add(pillar);

    const shockRing = makeRingMesh(0.8, 1.4, 32, c3, 0.95);
    shockRing.position.y = 0.12;
    root.add(shockRing);

    const orbs = [];
    const orbCount = 6 + tier * 4;
    for (let i = 0; i < orbCount; i++) {
      const orb = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.22 + tier * 0.05, 0),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? c2 : c3, transparent: true, opacity: 0.95 })
      );
      root.add(orb);
      orbs.push({ mesh: orb, ang: (Math.PI * 2 * i) / orbCount, spd: 3.5 + (i % 3) });
    }

    FX.register3DAnimation(scene, root, 1.45 + tier * 0.2, (p, elapsed) => {
      root.position.set(casterPos.x, 0, casterPos.z);
      const fade = p > 0.7 ? Math.max(0, 1 - (p - 0.7) / 0.3) : 1;
      pillar.rotation.y = elapsed * 5;
      pillar.scale.set(1 + Math.sin(elapsed * 12) * 0.08, 1, 1 + Math.sin(elapsed * 12) * 0.08);
      pillar.material.opacity = fade * 0.48;

      const sRing = 1 + p * (3.5 + tier * 1.2);
      shockRing.scale.set(sRing, sRing, 1);
      shockRing.material.opacity = (1 - p) * 0.95;

      orbs.forEach((o, idx) => {
        const a = o.ang + elapsed * o.spd;
        const r = (1.3 + tier * 0.3) * (1 - p * 0.25);
        o.mesh.position.set(Math.cos(a) * r, ((elapsed * 3.2 + idx * 0.4) % 4.5), Math.sin(a) * r);
        o.mesh.rotation.y = elapsed * 6;
        o.mesh.material.opacity = fade * 0.95;
      });
    });
  };

  // 2. 神域防御・絶対聖盾魔法
  BUILDERS.aegis_shield = (scene, casterPos, targetPos, info) => {
    const tier = info.tier;
    const { c1, c2, c3 } = info.theme;
    const root = new THREE.Group();
    root.position.set(casterPos.x, 0, casterPos.z);

    const rad = 1.65 + tier * 0.35;
    const dome = new THREE.Mesh(
      new THREE.IcosahedronGeometry(rad, tier >= 2 ? 2 : 1),
      new THREE.MeshBasicMaterial({ color: c1, wireframe: true, transparent: true, opacity: 0.75 })
    );
    dome.position.y = 1.2;
    root.add(dome);

    const innerSphere = new THREE.Mesh(
      new THREE.SphereGeometry(rad * 0.96, 24, 16),
      new THREE.MeshBasicMaterial({ color: c2, transparent: true, opacity: 0.22 })
    );
    innerSphere.position.y = 1.2;
    root.add(innerSphere);

    const hexRing = makeRingMesh(rad * 0.95, rad * 1.25, 6, c3, 0.95);
    hexRing.position.y = 0.1;
    root.add(hexRing);

    const shields = [];
    const sCnt = 3 + tier;
    for (let i = 0; i < sCnt; i++) {
      const plate = new THREE.Mesh(
        new THREE.BoxGeometry(0.65, 1.05, 0.1),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? c1 : c2, transparent: true, opacity: 0.88 })
      );
      root.add(plate);
      shields.push({ mesh: plate, ang: (Math.PI * 2 * i) / sCnt });
    }

    FX.register3DAnimation(scene, root, 1.8 + tier * 0.3, (p, elapsed) => {
      const fade = p > 0.75 ? Math.max(0, 1 - (p - 0.75) / 0.25) : 1;
      dome.rotation.y = elapsed * 2.2;
      dome.rotation.x = Math.sin(elapsed * 2) * 0.2;
      dome.material.opacity = fade * 0.75;
      innerSphere.material.opacity = fade * (0.2 + Math.sin(elapsed * 8) * 0.06);
      hexRing.rotation.z = -elapsed * 3;
      hexRing.material.opacity = fade * 0.95;

      shields.forEach(s => {
        const a = s.ang + elapsed * 3.4;
        s.mesh.position.set(Math.cos(a) * (rad + 0.35), 1.25 + Math.sin(elapsed * 4 + s.ang) * 0.15, Math.sin(a) * (rad + 0.35));
        s.mesh.rotation.y = -a + Math.PI / 2;
        s.mesh.material.opacity = fade * 0.88;
      });
    });
  };

  // 3. 極光の聖域（持続フィールド展開）
  BUILDERS.aurora_sanctuary = (scene, casterPos, targetPos, info, game, caster) => {
    if (game && caster) {
      FX.spawnAuroraSanctuaryField(game, caster, info);
    }
  };

  // 4. 烈空・三日月真空斬
  BUILDERS.slash_crescent = (scene, casterPos, targetPos, info) => {
    const tier = info.tier;
    const { c1, c2, c3 } = info.theme;
    const root = new THREE.Group();

    const dx = targetPos.x - casterPos.x;
    const dz = targetPos.z - casterPos.z;
    const dist = Math.max(2.5, Math.hypot(dx, dz));
    const yaw = Math.atan2(dx, dz);

    const bladeCount = 1 + tier;
    const blades = [];
    for (let i = 0; i < bladeCount; i++) {
      const arc = new THREE.Mesh(
        new THREE.TorusGeometry(1.4 + tier * 0.45, 0.14 + tier * 0.04, 8, 24, Math.PI * 0.85),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? c1 : c2, transparent: true, opacity: 0.96 })
      );
      arc.rotation.z = -Math.PI * 0.425 + (i - (bladeCount - 1) * 0.5) * 0.38;
      arc.rotation.x = Math.PI * 0.18;
      root.add(arc);
      blades.push(arc);
    }

    const hitRing = makeRingMesh(0.4, 1.1, 24, c3, 0.9);
    hitRing.position.set(targetPos.x, 0.15, targetPos.z);
    scene.add(hitRing);

    FX.register3DAnimation(scene, root, 0.65 + tier * 0.08, (p) => {
      const curX = casterPos.x + Math.sin(yaw) * (dist * p);
      const curZ = casterPos.z + Math.cos(yaw) * (dist * p);
      root.position.set(curX, 1.15, curZ);
      root.rotation.y = yaw;
      const sc = 1 + p * (0.6 + tier * 0.25);
      root.scale.set(sc, sc, sc);

      const fade = p > 0.75 ? Math.max(0, 1 - (p - 0.75) / 0.25) : 1;
      blades.forEach(b => { b.material.opacity = fade; });

      const hs = 1 + p * (2.6 + tier * 0.8);
      hitRing.scale.set(hs, hs, 1);
      hitRing.material.opacity = (1 - p) * 0.9;
      if (p >= 1) {
        scene.remove(hitRing);
        hitRing.geometry.dispose();
        hitRing.material.dispose();
      }
    });
  };

  // 5. 星屑メテオ・超巨大隕石落下
  BUILDERS.fire_meteor = (scene, casterPos, targetPos, info) => {
    const tier = info.tier;
    const { c1, c2, c3 } = info.theme;
    const root = new THREE.Group();

    const meteorRad = 1.15 + tier * 0.45;
    const meteor = new THREE.Mesh(
      new THREE.DodecahedronGeometry(meteorRad, 1),
      new THREE.MeshBasicMaterial({ color: c1, transparent: true, opacity: 0.98 })
    );
    const aura = new THREE.Mesh(
      new THREE.SphereGeometry(meteorRad * 1.28, 16, 12),
      new THREE.MeshBasicMaterial({ color: c2, wireframe: true, transparent: true, opacity: 0.85 })
    );
    meteor.add(aura);
    root.add(meteor);

    const blastRing = makeRingMesh(0.5, 1.6, 32, c3, 0.95);
    blastRing.position.set(targetPos.x, 0.12, targetPos.z);
    root.add(blastRing);

    const startX = targetPos.x - 4.5;
    const startY = 12 + tier * 2.5;
    const startZ = targetPos.z - 4.5;

    FX.register3DAnimation(scene, root, 1.05 + tier * 0.12, (p, elapsed) => {
      if (p < 0.62) {
        const fallP = p / 0.62;
        const ease = fallP * fallP;
        meteor.position.set(
          startX + (targetPos.x - startX) * ease,
          startY * (1 - ease) + meteorRad * 0.5,
          startZ + (targetPos.z - startZ) * ease
        );
        meteor.rotation.set(elapsed * 7, elapsed * 5, elapsed * 6);
        blastRing.scale.set(0.4 + fallP * 0.8, 0.4 + fallP * 0.8, 1);
        blastRing.material.opacity = 0.5;
      } else {
        const expP = (p - 0.62) / 0.38;
        meteor.position.set(targetPos.x, meteorRad * 0.4, targetPos.z);
        const mScale = 1 + expP * (2.2 + tier * 0.7);
        meteor.scale.set(mScale, mScale, mScale);
        meteor.material.opacity = Math.max(0, 1 - expP);
        aura.material.opacity = Math.max(0, 1 - expP);

        const rScale = 1 + expP * (4.5 + tier * 1.5);
        blastRing.scale.set(rScale, rScale, 1);
        blastRing.material.opacity = Math.max(0, 1 - expP);
      }
    });
  };

  // 6. 紅蓮業火・螺旋炎柱
  BUILDERS.fire_pillar = (scene, casterPos, targetPos, info) => {
    const tier = info.tier;
    const { c1, c2, c3 } = info.theme;
    const root = new THREE.Group();
    root.position.set(targetPos.x, 0, targetPos.z);

    const h = 6.5 + tier * 2.2;
    const rad = 1.25 + tier * 0.4;
    const core = new THREE.Mesh(
      new THREE.CylinderGeometry(rad * 0.7, rad, h, 24, 1, true),
      new THREE.MeshBasicMaterial({ color: c1, side: THREE.DoubleSide, transparent: true, opacity: 0.72 })
    );
    core.position.y = h * 0.5;
    root.add(core);

    const spiral = new THREE.Mesh(
      new THREE.CylinderGeometry(rad * 1.25, rad * 1.25, h * 0.9, 12, 1, true),
      new THREE.MeshBasicMaterial({ color: c2, wireframe: true, transparent: true, opacity: 0.85 })
    );
    spiral.position.y = h * 0.45;
    root.add(spiral);

    const baseRing = makeRingMesh(rad * 0.8, rad * 1.6, 28, c3, 0.95);
    baseRing.position.y = 0.08;
    root.add(baseRing);

    FX.register3DAnimation(scene, root, 1.15 + tier * 0.15, (p, elapsed) => {
      const fade = p > 0.7 ? Math.max(0, 1 - (p - 0.7) / 0.3) : 1;
      const grow = Math.min(1, p * 4);
      core.scale.set(1, grow, 1);
      core.position.y = h * 0.5 * grow;
      core.rotation.y = elapsed * 6;
      core.material.opacity = fade * 0.72;

      spiral.scale.set(1, grow, 1);
      spiral.position.y = h * 0.45 * grow;
      spiral.rotation.y = -elapsed * 9;
      spiral.material.opacity = fade * 0.85;

      baseRing.rotation.z = elapsed * 4;
      baseRing.material.opacity = fade * 0.95;
    });
  };

  // 7. 爆炎ファイア・連装火球弾幕
  BUILDERS.fire_burst = (scene, casterPos, targetPos, info) => {
    const tier = info.tier;
    const { c1, c2, c3 } = info.theme;
    const root = new THREE.Group();

    const count = 3 + tier * 2;
    const balls = [];
    for (let i = 0; i < count; i++) {
      const b = new THREE.Mesh(
        new THREE.SphereGeometry(0.38 + tier * 0.08, 12, 10),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? c1 : c2, transparent: true, opacity: 0.96 })
      );
      root.add(b);
      balls.push({
        mesh: b,
        delay: i * 0.08,
        spreadX: (i - (count - 1) * 0.5) * 0.85,
        spreadY: 1.0 + (i % 3) * 0.55
      });
    }

    const boomRing = makeRingMesh(0.4, 1.2, 24, c3, 0.95);
    boomRing.position.set(targetPos.x, 0.12, targetPos.z);
    root.add(boomRing);

    FX.register3DAnimation(scene, root, 0.95 + tier * 0.12, (p) => {
      balls.forEach(item => {
        const localP = Math.max(0, Math.min(1, (p - item.delay) / (1 - item.delay)));
        if (localP < 0.75) {
          const fly = localP / 0.75;
          const arcY = Math.sin(fly * Math.PI) * item.spreadY;
          item.mesh.position.set(
            casterPos.x + (targetPos.x - casterPos.x) * fly + item.spreadX * Math.sin(fly * Math.PI),
            1.1 + arcY,
            casterPos.z + (targetPos.z - casterPos.z) * fly
          );
          item.mesh.scale.set(1, 1, 1);
          item.mesh.material.opacity = 0.96;
        } else {
          const pop = (localP - 0.75) / 0.25;
          item.mesh.position.set(targetPos.x, 0.9, targetPos.z);
          const sc = 1 + pop * 2.4;
          item.mesh.scale.set(sc, sc, sc);
          item.mesh.material.opacity = Math.max(0, 1 - pop);
        }
      });
      const rSc = 1 + p * (3.2 + tier * 1.1);
      boomRing.scale.set(rSc, rSc, 1);
      boomRing.material.opacity = Math.max(0, 1 - p);
    });
  };

  // 8. 灼熱・溶岩マグマ噴火
  BUILDERS.fire_eruption = (scene, casterPos, targetPos, info) => {
    const tier = info.tier;
    const { c1, c2, c3 } = info.theme;
    const root = new THREE.Group();
    root.position.set(targetPos.x, 0, targetPos.z);

    const crater = makeRingMesh(0.2, 2.0 + tier * 0.6, 28, c1, 0.92);
    crater.position.y = 0.06;
    root.add(crater);

    const chunks = [];
    const cnt = 8 + tier * 4;
    for (let i = 0; i < cnt; i++) {
      const ang = (Math.PI * 2 * i) / cnt;
      const spd = 1.6 + (i % 4) * 0.65 + tier * 0.4;
      const chunk = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.32 + (i % 3) * 0.1, 0),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? c2 : c3, transparent: true, opacity: 0.96 })
      );
      root.add(chunk);
      chunks.push({ mesh: chunk, vx: Math.cos(ang) * spd, vz: Math.sin(ang) * spd, vy: 5.5 + (i % 3) * 1.6 });
    }

    FX.register3DAnimation(scene, root, 1.15 + tier * 0.12, (p, elapsed) => {
      const fade = p > 0.7 ? Math.max(0, 1 - (p - 0.7) / 0.3) : 1;
      crater.scale.set(1 + p * 0.4, 1 + p * 0.4, 1);
      crater.material.opacity = fade * 0.92;

      chunks.forEach(c => {
        const y = Math.max(0.1, c.vy * p - 6.8 * p * p);
        c.mesh.position.set(c.vx * p * 1.4, y, c.vz * p * 1.4);
        c.mesh.rotation.set(elapsed * 6, elapsed * 5, 0);
        c.mesh.material.opacity = fade * 0.96;
      });
    });
  };

  // 9. 絶対零度・氷華氷柱
  BUILDERS.ice = (scene, casterPos, targetPos, info) => {
    const tier = info.tier;
    const { c1, c2, c3 } = info.theme;
    const root = new THREE.Group();
    root.position.set(targetPos.x, 0, targetPos.z);

    const frostRing = makeRingMesh(0.5, 2.3 + tier * 0.65, 6, c1, 0.92);
    frostRing.position.y = 0.08;
    root.add(frostRing);

    const spikes = [];
    const cnt = 5 + tier * 3;
    for (let i = 0; i < cnt; i++) {
      const ang = (Math.PI * 2 * i) / cnt;
      const r = i === 0 ? 0 : (0.9 + (i % 2) * 0.8 + tier * 0.25);
      const h = (i === 0 ? 3.8 : 2.3) + tier * 0.75;
      const spike = new THREE.Mesh(
        new THREE.ConeGeometry(0.42 + tier * 0.08, h, 6),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? c2 : c3, transparent: true, opacity: 0.92 })
      );
      spike.position.set(Math.cos(ang) * r, h * 0.5, Math.sin(ang) * r);
      if (i > 0) {
        spike.rotation.z = -Math.cos(ang) * 0.25;
        spike.rotation.x = Math.sin(ang) * 0.25;
      }
      root.add(spike);
      spikes.push({ mesh: spike, targetH: h });
    }

    FX.register3DAnimation(scene, root, 1.2 + tier * 0.15, (p, elapsed) => {
      const rise = Math.min(1, p * 4.5);
      const fade = p > 0.72 ? Math.max(0, 1 - (p - 0.72) / 0.28) : 1;
      frostRing.rotation.z = elapsed * 2.5;
      frostRing.material.opacity = fade * 0.92;

      spikes.forEach(s => {
        s.mesh.scale.set(1, rise, 1);
        s.mesh.position.y = s.targetH * 0.5 * rise;
        s.mesh.material.opacity = fade * 0.92;
      });
    });
  };

  // 10. 紫電・天罰落雷
  BUILDERS.thunder = (scene, casterPos, targetPos, info) => {
    const tier = info.tier;
    const { c1, c2, c3 } = info.theme;
    const root = new THREE.Group();
    root.position.set(targetPos.x, 0, targetPos.z);

    const bolts = [];
    const boltCount = 1 + tier;
    for (let b = 0; b < boltCount; b++) {
      const offX = b === 0 ? 0 : Math.cos((Math.PI * 2 * b) / boltCount) * (1.2 + tier * 0.3);
      const offZ = b === 0 ? 0 : Math.sin((Math.PI * 2 * b) / boltCount) * (1.2 + tier * 0.3);
      const bolt = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18 + tier * 0.05, 0.28 + tier * 0.06, 11, 8),
        new THREE.MeshBasicMaterial({ color: b % 2 === 0 ? c1 : c2, transparent: true, opacity: 0.98 })
      );
      bolt.position.set(offX, 5.5, offZ);
      root.add(bolt);
      bolts.push(bolt);
    }

    const shock = makeRingMesh(0.4, 1.5, 24, c3, 0.95);
    shock.position.y = 0.1;
    root.add(shock);

    FX.register3DAnimation(scene, root, 0.75 + tier * 0.1, (p, elapsed) => {
      const flicker = Math.sin(elapsed * 65) > -0.3 ? 1 : 0.35;
      const fade = Math.max(0, 1 - p);
      bolts.forEach((b, idx) => {
        b.scale.set(flicker, 1, flicker);
        b.rotation.y = elapsed * 20 + idx;
        b.material.opacity = fade * flicker;
      });
      const sc = 1 + p * (3.6 + tier * 1.2);
      shock.scale.set(sc, sc, 1);
      shock.material.opacity = fade;
    });
  };

  // 11. 旋風円舞・螺旋竜巻
  BUILDERS.wind = (scene, casterPos, targetPos, info) => {
    const tier = info.tier;
    const { c1, c2, c3 } = info.theme;
    const root = new THREE.Group();
    root.position.set(targetPos.x, 0, targetPos.z);

    const rings = [];
    const cnt = 6 + tier * 2;
    for (let i = 0; i < cnt; i++) {
      const t = i / cnt;
      const rad = 0.55 + t * (1.75 + tier * 0.45);
      const torus = new THREE.Mesh(
        new THREE.TorusGeometry(rad, 0.09 + tier * 0.02, 8, 28),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? c1 : c2, transparent: true, opacity: 0.9 })
      );
      torus.rotation.x = Math.PI / 2;
      torus.position.y = 0.3 + t * (4.2 + tier * 1.2);
      root.add(torus);
      rings.push({ mesh: torus, baseY: torus.position.y, spd: (i % 2 === 0 ? 1 : -1) * (8 + i) });
    }

    const floorRing = makeRingMesh(0.6, 1.4, 24, c3, 0.85);
    floorRing.position.y = 0.08;
    root.add(floorRing);

    FX.register3DAnimation(scene, root, 1.15 + tier * 0.15, (p, elapsed) => {
      const fade = p > 0.7 ? Math.max(0, 1 - (p - 0.7) / 0.3) : 1;
      rings.forEach((r, idx) => {
        r.mesh.rotation.z = elapsed * r.spd;
        r.mesh.position.x = Math.cos(elapsed * 8 + idx) * 0.25;
        r.mesh.position.z = Math.sin(elapsed * 8 + idx) * 0.25;
        r.mesh.material.opacity = fade * 0.9;
      });
      floorRing.scale.set(1 + p * 2.5, 1 + p * 2.5, 1);
      floorRing.material.opacity = (1 - p) * 0.85;
    });
  };

  // 12. 蒼海・大渦潮水柱
  BUILDERS.water = (scene, casterPos, targetPos, info) => {
    const tier = info.tier;
    const { c1, c2, c3 } = info.theme;
    const root = new THREE.Group();
    root.position.set(targetPos.x, 0, targetPos.z);

    const h = 5.2 + tier * 1.8;
    const rad = 1.2 + tier * 0.38;
    const spout = new THREE.Mesh(
      new THREE.CylinderGeometry(rad * 1.25, rad * 0.75, h, 28, 1, true),
      new THREE.MeshBasicMaterial({ color: c1, side: THREE.DoubleSide, transparent: true, opacity: 0.72 })
    );
    spout.position.y = h * 0.5;
    root.add(spout);

    const whirl = makeRingMesh(0.4, rad * 2.1, 32, c2, 0.92);
    whirl.position.y = 0.08;
    root.add(whirl);

    const drops = [];
    for (let i = 0; i < 8 + tier * 4; i++) {
      const d = new THREE.Mesh(
        new THREE.SphereGeometry(0.22 + tier * 0.05, 8, 8),
        new THREE.MeshBasicMaterial({ color: c3, transparent: true, opacity: 0.9 })
      );
      root.add(d);
      drops.push({ mesh: d, ang: (Math.PI * 2 * i) / (8 + tier * 4) });
    }

    FX.register3DAnimation(scene, root, 1.15 + tier * 0.15, (p, elapsed) => {
      const fade = p > 0.72 ? Math.max(0, 1 - (p - 0.72) / 0.28) : 1;
      const rise = Math.min(1, p * 4);
      spout.scale.set(1, rise, 1);
      spout.position.y = h * 0.5 * rise;
      spout.rotation.y = elapsed * 6;
      spout.material.opacity = fade * 0.72;

      whirl.rotation.z = -elapsed * 7;
      whirl.material.opacity = fade * 0.92;

      drops.forEach((dr, idx) => {
        const a = dr.ang + elapsed * 4;
        const r = rad * 1.3 + p * 1.5;
        const y = Math.max(0.15, Math.sin(p * Math.PI) * (h * 0.85) + (idx % 3) * 0.3);
        dr.mesh.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
        dr.mesh.material.opacity = fade * 0.9;
      });
    });
  };

  // 13. 破邪の衝撃・巨岩隆起
  BUILDERS.earth = (scene, casterPos, targetPos, info) => {
    const tier = info.tier;
    const { c1, c2, c3 } = info.theme;
    const root = new THREE.Group();
    root.position.set(targetPos.x, 0, targetPos.z);

    const rocks = [];
    const cnt = 5 + tier * 3;
    for (let i = 0; i < cnt; i++) {
      const ang = (Math.PI * 2 * i) / cnt;
      const dist = i === 0 ? 0 : (1.1 + (i % 2) * 0.7 + tier * 0.3);
      const sz = (i === 0 ? 1.15 : 0.75) + tier * 0.2;
      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(sz, 0),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? c1 : c2, transparent: true, opacity: 0.96 })
      );
      rock.position.set(Math.cos(ang) * dist, sz * 0.6, Math.sin(ang) * dist);
      rock.rotation.set(i, i * 0.7, 0);
      root.add(rock);
      rocks.push({ mesh: rock, targetY: sz * 0.6 });
    }

    const quakeRing = makeRingMesh(0.5, 1.5, 24, c3, 0.92);
    quakeRing.position.y = 0.08;
    root.add(quakeRing);

    FX.register3DAnimation(scene, root, 1.1 + tier * 0.15, (p) => {
      const pop = Math.min(1, p * 4.5);
      const fade = p > 0.72 ? Math.max(0, 1 - (p - 0.72) / 0.28) : 1;
      rocks.forEach(r => {
        r.mesh.position.y = r.targetY * pop;
        r.mesh.material.opacity = fade * 0.96;
      });
      const sc = 1 + p * (3.2 + tier * 1.1);
      quakeRing.scale.set(sc, sc, 1);
      quakeRing.material.opacity = Math.max(0, 1 - p);
    });
  };

  // 14. 聖光の癒し・天照光輪
  BUILDERS.holy_heal = (scene, casterPos, targetPos, info) => {
    const tier = info.tier;
    const { c1, c2, c3 } = info.theme;
    const root = new THREE.Group();
    root.position.set(casterPos.x, 0, casterPos.z);

    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(1.15 + tier * 0.35, 1.35 + tier * 0.35, 7.5 + tier * 1.5, 28, 1, true),
      new THREE.MeshBasicMaterial({ color: c1, side: THREE.DoubleSide, transparent: true, opacity: 0.38 })
    );
    beam.position.y = (7.5 + tier * 1.5) * 0.5;
    root.add(beam);

    const halos = [];
    for (let i = 0; i < 3 + tier; i++) {
      const h = makeRingMesh(1.0 + tier * 0.25, 1.28 + tier * 0.3, 32, i % 2 === 0 ? c2 : c3, 0.95);
      h.position.y = 0.2 + i * 0.65;
      root.add(h);
      halos.push({ mesh: h, offset: i * 0.22 });
    }

    FX.register3DAnimation(scene, root, 1.35 + tier * 0.2, (p, elapsed) => {
      const fade = p > 0.7 ? Math.max(0, 1 - (p - 0.7) / 0.3) : 1;
      beam.rotation.y = elapsed * 2;
      beam.material.opacity = fade * 0.38;

      halos.forEach((h, idx) => {
        const prog = (p + h.offset) % 1;
        h.mesh.position.y = 0.2 + prog * (3.5 + tier * 0.8);
        h.mesh.rotation.z = elapsed * (idx % 2 === 0 ? 3 : -3);
        h.mesh.material.opacity = fade * (1 - prog * 0.6);
      });
    });
  };

  // 15. 黒蝕・ブラックホール
  BUILDERS.dark = (scene, casterPos, targetPos, info) => {
    const tier = info.tier;
    const { c1, c2, c3 } = info.theme;
    const root = new THREE.Group();
    root.position.set(targetPos.x, 1.45 + tier * 0.25, targetPos.z);

    const coreRad = 0.85 + tier * 0.32;
    const hole = new THREE.Mesh(
      new THREE.SphereGeometry(coreRad, 24, 18),
      new THREE.MeshBasicMaterial({ color: 0x090d16, transparent: true, opacity: 0.98 })
    );
    root.add(hole);

    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(coreRad * 1.55, 0.14 + tier * 0.04, 10, 36),
      new THREE.MeshBasicMaterial({ color: c1, transparent: true, opacity: 0.95 })
    );
    rim.rotation.x = Math.PI * 0.38;
    root.add(rim);

    const outerRim = new THREE.Mesh(
      new THREE.TorusGeometry(coreRad * 2.15, 0.08 + tier * 0.03, 8, 36),
      new THREE.MeshBasicMaterial({ color: c2, transparent: true, opacity: 0.85 })
    );
    outerRim.rotation.x = -Math.PI * 0.32;
    root.add(outerRim);

    const floorVoid = makeRingMesh(0.2, coreRad * 2.4, 32, c3, 0.7);
    floorVoid.position.y = -(1.4 + tier * 0.25);
    root.add(floorVoid);

    FX.register3DAnimation(scene, root, 1.35 + tier * 0.2, (p, elapsed) => {
      const sc = p < 0.2 ? (p / 0.2) : (p > 0.8 ? Math.max(0, (1 - p) / 0.2) : 1 + Math.sin(elapsed * 14) * 0.08);
      root.scale.set(sc, sc, sc);
      rim.rotation.z = elapsed * 8;
      outerRim.rotation.z = -elapsed * 6;
      floorVoid.rotation.z = elapsed * 4;
    });
  };

  // 16. 呪詛・魔界瘴気
  BUILDERS.poison = (scene, casterPos, targetPos, info) => {
    const tier = info.tier;
    const { c1, c2, c3 } = info.theme;
    const root = new THREE.Group();
    root.position.set(targetPos.x, 0, targetPos.z);

    const rad = 1.9 + tier * 0.6;
    const swamp = makeRingMesh(0.1, rad, 32, c1, 0.68);
    swamp.position.y = 0.06;
    root.add(swamp);

    const bubbles = [];
    const cnt = 10 + tier * 5;
    for (let i = 0; i < cnt; i++) {
      const ang = (Math.PI * 2 * i) / cnt;
      const r = (0.3 + ((i * 37) % 100) / 100 * 0.85) * rad;
      const bub = new THREE.Mesh(
        new THREE.SphereGeometry(0.2 + (i % 3) * 0.08 + tier * 0.04, 10, 8),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? c2 : c3, transparent: true, opacity: 0.88 })
      );
      bub.position.set(Math.cos(ang) * r, 0.3, Math.sin(ang) * r);
      root.add(bub);
      bubbles.push({ mesh: bub, phase: i * 0.35, spd: 1.8 + (i % 3) * 0.5 });
    }

    FX.register3DAnimation(scene, root, 1.3 + tier * 0.2, (p, elapsed) => {
      const fade = p > 0.72 ? Math.max(0, 1 - (p - 0.72) / 0.28) : 1;
      swamp.rotation.z = elapsed * 1.5;
      swamp.material.opacity = fade * 0.68;

      bubbles.forEach(b => {
        const y = ((elapsed * b.spd + b.phase) % 2.6) + 0.15;
        b.mesh.position.y = y;
        const s = 0.7 + Math.sin(elapsed * 6 + b.phase) * 0.3;
        b.mesh.scale.set(s, s, s);
        b.mesh.material.opacity = fade * 0.88;
      });
    });
  };

  // 17. 星屑・銀河流星
  BUILDERS.star = (scene, casterPos, targetPos, info) => {
    const tier = info.tier;
    const { c1, c2, c3 } = info.theme;
    const root = new THREE.Group();

    const stars = [];
    const cnt = 5 + tier * 3;
    for (let i = 0; i < cnt; i++) {
      const st = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.42 + tier * 0.1, 0),
        new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? c1 : (i % 3 === 1 ? c2 : c3), transparent: true, opacity: 0.98 })
      );
      root.add(st);
      const ang = (Math.PI * 2 * i) / cnt;
      const offR = i === 0 ? 0 : (0.9 + (i % 2) * 0.8 + tier * 0.25);
      stars.push({
        mesh: st,
        delay: i * 0.06,
        tx: targetPos.x + Math.cos(ang) * offR,
        tz: targetPos.z + Math.sin(ang) * offR
      });
    }

    const starRing = makeRingMesh(0.5, 2.2 + tier * 0.6, 5, c2, 0.95);
    starRing.position.set(targetPos.x, 0.1, targetPos.z);
    root.add(starRing);

    FX.register3DAnimation(scene, root, 1.15 + tier * 0.15, (p, elapsed) => {
      const fade = p > 0.75 ? Math.max(0, 1 - (p - 0.75) / 0.25) : 1;
      stars.forEach(s => {
        const lp = Math.max(0, Math.min(1, (p - s.delay) / (1 - s.delay)));
        const h = Math.max(0.25, (1 - lp) * (9 + tier * 2));
        s.mesh.position.set(s.tx - (1 - lp) * 2.5, h, s.tz - (1 - lp) * 2.5);
        s.mesh.rotation.set(elapsed * 8, elapsed * 10, 0);
        s.mesh.material.opacity = fade * 0.98;
      });
      starRing.rotation.z = elapsed * 4;
      starRing.scale.set(0.6 + p * 1.4, 0.6 + p * 1.4, 1);
      starRing.material.opacity = fade * 0.95;
    });
  };

  // 18. 秘剣・無限光剣陣
  BUILDERS.sword = (scene, casterPos, targetPos, info) => {
    const tier = info.tier;
    const { c1, c2, c3 } = info.theme;
    const root = new THREE.Group();
    root.position.set(targetPos.x, 0, targetPos.z);

    const gateRing = makeRingMesh(1.2 + tier * 0.3, 1.55 + tier * 0.35, 8, c3, 0.92);
    gateRing.position.y = 4.6 + tier * 1.0;
    root.add(gateRing);

    const swords = [];
    const cnt = 5 + tier * 4;
    for (let i = 0; i < cnt; i++) {
      const ang = (Math.PI * 2 * i) / cnt;
      const r = i === 0 ? 0 : (0.85 + (i % 2) * 0.75 + tier * 0.25);
      const blade = new THREE.Mesh(
        new THREE.ConeGeometry(0.18 + tier * 0.04, 2.2 + tier * 0.4, 4),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? c1 : c2, transparent: true, opacity: 0.96 })
      );
      blade.rotation.x = Math.PI;
      blade.position.set(Math.cos(ang) * r, 4.5, Math.sin(ang) * r);
      root.add(blade);
      swords.push({ mesh: blade, delay: i * 0.045, x: Math.cos(ang) * r, z: Math.sin(ang) * r });
    }

    FX.register3DAnimation(scene, root, 1.15 + tier * 0.15, (p, elapsed) => {
      const fade = p > 0.75 ? Math.max(0, 1 - (p - 0.75) / 0.25) : 1;
      gateRing.rotation.z = elapsed * 5;
      gateRing.material.opacity = fade * 0.92;

      swords.forEach(sw => {
        const lp = Math.max(0, Math.min(1, (p - sw.delay) / (1 - sw.delay)));
        const drop = Math.min(1, lp * 2.2);
        const y = (4.5 + tier * 1.0) * (1 - drop) + 0.85;
        sw.mesh.position.set(sw.x, y, sw.z);
        sw.mesh.material.opacity = fade * 0.96;
      });
    });
  };

  // =========================================================
  // 10. 統合エフェクト再生エンジン＆プレビュー機能
  // =========================================================
  FX.playSkillVFX = function(game, caster, rawTargetPos, slotOrSkill, overrideInfo = null) {
    if (!game) return;
    const isMe = !caster || caster === game.player;
    const activeCaster = caster || game.player;
    const info = overrideInfo || this.getSkillInfo(game, slotOrSkill);

    if (isMe) {
      this.showSpellCardCutin(game, info);
    }
    if (activeCaster) {
      this.spawnCasterChantAura(game, activeCaster, info);
    }

    if (game.useWebGL && game.scene && typeof THREE !== 'undefined') {
      const casterPos = activeCaster?.pos
        ? { x: activeCaster.pos.x, y: Number(activeCaster.pos.y || 0), z: activeCaster.pos.z }
        : { x: 0, y: 0, z: 0 };
      const targetPos = resolveTargetPosV9(game, activeCaster, rawTargetPos);
      const builder = BUILDERS[info.theme.id] || BUILDERS.sword;
      try {
        builder(game.scene, casterPos, targetPos, info, game, activeCaster);
      } catch (e) {
        console.warn('[game9.js] 3Dエフェクト生成エラー:', e);
      }
    }
  };

  FX.previewSkillByObj = function(game, sk, forceTier = 0) {
    const g = game || window.game;
    if (!g) return;
    const baseInfo = this.getSkillInfo(g, sk);
    const tier = Math.max(0, Math.min(3, Number(forceTier || 0)));
    const dummyLvs = [1, 10, 50, 100];
    const tierLabels = ['通常魔法', '✨ 魔法進化Ⅰ【真】', '🔥 魔法進化Ⅱ【極】', '🌈 魔法最終進化【神】'];

    const testInfo = {
      ...baseInfo,
      skillLv: dummyLvs[tier],
      tier,
      tierLabel: tierLabels[tier],
      evolvedName: baseInfo.theme.names(baseInfo.origName)[tier] || baseInfo.origName
    };

    this.playSkillVFX(g, g.player, null, sk, testInfo);
  };

  // =========================================================
  // 11. ゲーム本体への非破壊自動フック（MP改ざん・DOM上書きなし）
  // =========================================================
  function patchGameInstanceV9(game) {
    if (!game || game._kmjV9Hooked) return;
    game._kmjV9Hooked = true;

    FX.syncAllSkills(game);

    // 1. 毎フレーム更新（極光の聖域フィールドの更新のみ）
    let lastTick = performance.now();
    const origUpdate = typeof game.update === 'function' ? game.update.bind(game) : null;
    if (origUpdate) {
      game.update = function(...args) {
        const now = performance.now();
        const dt = typeof args[0] === 'number' && args[0] > 0 && args[0] < 1
          ? args[0]
          : Math.min(0.1, (now - lastTick) / 1000);
        lastTick = now;
        try { FX.updateSanctuaryFields(this, dt); } catch (e) {}
        return origUpdate(...args);
      };
    } else {
      const fallbackFieldLoop = () => {
        const now = performance.now();
        const dt = Math.min(0.1, (now - lastTick) / 1000);
        lastTick = now;
        try { FX.updateSanctuaryFields(game, dt); } catch (e) {}
        requestAnimationFrame(fallbackFieldLoop);
      };
      requestAnimationFrame(fallbackFieldLoop);
    }

    // 2. スキル発動メソッドのフック（二重発動防止付き）
    let lastCastStamp = 0;
    const skillMethods = ['useSkill', 'castSkill', 'activateSkill', 'triggerSkill', 'execSkill'];
    skillMethods.forEach(mName => {
      if (typeof game[mName] !== 'function') return;
      const origFn = game[mName].bind(game);
      game[mName] = function(...args) {
        const res = origFn(...args);
        const now = performance.now();
        if (now - lastCastStamp > 120) {
          lastCastStamp = now;
          const slotOrSk = args[0] !== undefined ? args[0] : 0;
          const targetArg = args[1] || null;
          try {
            FX.syncAllSkills(this);
            FX.playSkillVFX(this, this.player, targetArg, slotOrSk);
          } catch (e) {}
        }
        return res;
      };
    });

    // 3. モーダル・タブ切替時のスタジオボタン注入＆進化名同期
    const uiMethods = ['openModal', 'renderModal', 'switchTab', 'renderTab'];
    uiMethods.forEach(mName => {
      if (typeof game[mName] !== 'function') return;
      const origUi = game[mName].bind(game);
      game[mName] = function(...args) {
        const res = origUi(...args);
        try {
          FX.syncAllSkills(this);
          setTimeout(() => FX.injectSkillPreviewUI(this, document.getElementById('modal-body'), args[0]), 20);
        } catch (e) {}
        return res;
      };
    });
  }

  // =========================================================
  // 12. 起動＆ゲームインスタンス自動検知ポーリング
  // =========================================================
  function bootstrapV9() {
    if (window.game) {
      patchGameInstanceV9(window.game);
      return;
    }
    if (typeof KaomojiGame === 'function' && !KaomojiGame.prototype._kmjV9ProtoHooked) {
      KaomojiGame.prototype._kmjV9ProtoHooked = true;
      const origInit = KaomojiGame.prototype.init;
      if (typeof origInit === 'function') {
        KaomojiGame.prototype.init = function(...args) {
          const r = origInit.apply(this, args);
          patchGameInstanceV9(this);
          return r;
        };
      }
    }
    let tries = 0;
    const timer = setInterval(() => {
      tries++;
      if (window.game) {
        patchGameInstanceV9(window.game);
        clearInterval(timer);
      } else if (tries > 120) {
        clearInterval(timer);
      }
    }, 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapV9);
  } else {
    bootstrapV9();
  }
})();
// ▲▲▲ ここまで【スキルエフェクト専用 game9.js 2/2（後編）】 ▲▲▲
