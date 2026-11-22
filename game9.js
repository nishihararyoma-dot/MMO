// ▼▼▼ ここから【スキルエフェクト専用 game9.js 1/4】CSS・属性別シンセ音・全18種進化プロファイル ▼▼▼
(() => {
  'use strict';

  function reportV9Error(source, err) {
    if (typeof window.reportKmjRuntimeError === 'function') {
      window.reportKmjRuntimeError(source, err);
      return;
    }
    console.error(`[KMJ-V9:${source}]`, err);
  }

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
        width: 100%; max-width: 520px; max-height: 86vh; overflow-y: auto;
        background: linear-gradient(160deg, #0f172a, #1e1b4b);
        border: 2px solid #f472b6; border-radius: 14px; padding: 14px;
        box-shadow: 0 0 36px rgba(236, 72, 153, 0.55);
        color: #f8fafc;
      }
    `;
    document.head.appendChild(st);
  }

  // =========================================================
  // 2. 属性別リッチ・シンセサイザー効果音（全18プリセット）
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
  // 3. 全18種の進化プロファイル（全進化名に元のスキル名 ${b} を保持）
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

  window.KMJ_SKILL_FX_V9 = {
    ATTRIBUTES: SKILL_DERIVATION_PROFILES_V9,
    EFFECT_BUILDERS: {},
    _playMagicAudio: playMagicAudioV9,
    _reportError: reportV9Error
  };
})();
// ▲▲▲ ここまで【スキルエフェクト専用 game9.js 1/4】 ▲▲▲
// ▼▼▼ ここから【スキルエフェクト専用 game9.js 2/4】3Dエンジン・極光の聖域・3Dエフェクト前半(1〜9) ▼▼▼
(() => {
  'use strict';

  const V9 = window.KMJ_SKILL_FX_V9;
  if (!V9) return;

  const activeFxList = [];
  const activeSanctuaries = [];
  let fxLoopStarted = false;
  let lastFxTime = performance.now();

  function getGameInstance() {
    return window.game || window.kmjGame || window._kmjGameInstance || null;
  }

  function getScene(game) {
    const g = game || getGameInstance();
    return (g && g.scene) ? g.scene : null;
  }

  function disposeObject3D(obj) {
    if (!obj) return;
    obj.traverse((child) => {
      if (child.geometry && typeof child.geometry.dispose === 'function') {
        child.geometry.dispose();
      }
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m && typeof m.dispose === 'function' && m.dispose());
        } else if (typeof child.material.dispose === 'function') {
          child.material.dispose();
        }
      }
    });
  }

  function spawnFxTask(scene, root, duration, onUpdate, onDone) {
    if (!scene || !root || typeof THREE === 'undefined') return;
    scene.add(root);
    activeFxList.push({
      scene,
      root,
      elapsed: 0,
      duration: Math.max(0.15, duration),
      onUpdate,
      onDone
    });
    ensureFxLoop();
  }

  function shakeCamera(game, intensity = 0.25, duration = 0.35) {
    const g = game || getGameInstance();
    if (!g || !g.camera) return;
    const cam = g.camera;
    let t = 0;
    const origX = cam.position.x;
    const origY = cam.position.y;
    const step = () => {
      t += 0.016;
      if (t >= duration) return;
      const decay = 1 - t / duration;
      cam.position.x += (Math.random() - 0.5) * intensity * decay;
      cam.position.y += (Math.random() - 0.5) * intensity * decay;
      requestAnimationFrame(step);
    };
    if (typeof origX === 'number' && typeof origY === 'number') {
      requestAnimationFrame(step);
    }
  }

  function createRingMesh(innerR, outerR, color, opacity = 0.85) {
    const geo = new THREE.RingGeometry(innerR, outerR, 40);
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    return mesh;
  }

  function createMagicCircleGroup(radius, c1, c2, tier = 0) {
    const grp = new THREE.Group();
    const outer = createRingMesh(radius * 0.86, radius, c1, 0.9);
    const inner = createRingMesh(radius * 0.52, radius * 0.60, c2, 0.85);
    grp.add(outer, inner);

    const spokes = 4 + tier * 2;
    for (let i = 0; i < spokes; i++) {
      const barGeo = new THREE.PlaneGeometry(radius * 1.75, 0.06 + tier * 0.02);
      const barMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? c1 : c2,
        transparent: true,
        opacity: 0.72,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const bar = new THREE.Mesh(barGeo, barMat);
      bar.rotation.x = -Math.PI / 2;
      bar.rotation.z = (Math.PI / spokes) * i;
      grp.add(bar);
    }
    return grp;
  }

  function createParticlePoints(count, color, size = 0.24) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color,
      size,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    return new THREE.Points(geo, mat);
  }

  function updateSanctuaries(dt) {
    const g = getGameInstance();
    for (let i = activeSanctuaries.length - 1; i >= 0; i--) {
      const s = activeSanctuaries[i];
      s.elapsed += dt;
      s.tickAcc += dt;

      if (s.ring1) s.ring1.rotation.z += dt * 1.4;
      if (s.ring2) s.ring2.rotation.z -= dt * 2.1;
      if (s.pillar) {
        s.pillar.material.opacity = 0.22 + Math.sin(s.elapsed * 5) * 0.08;
      }

      // 0.5秒ごとに聖域内のプレイヤーを安全にHP/MP持続回復（最大値は変更しない）
      if (s.tickAcc >= 0.5 && g && g.player) {
        s.tickAcc = 0;
        const p = g.player;
        const px = p.mesh ? p.mesh.position.x : (p.x || 0);
        const pz = p.mesh ? p.mesh.position.z : (p.z || 0);
        const dist = Math.hypot(px - s.origin.x, pz - s.origin.z);
        if (dist <= s.radius) {
          const maxHp = Number(p.maxHp || p.maxHP || 100);
          const maxMp = Number(p.maxMp || p.maxMP || 50);
          const healHp = Math.max(2, Math.round(maxHp * (0.03 + s.tier * 0.015)));
          const healMp = Math.max(1, Math.round(maxMp * (0.03 + s.tier * 0.015)));
          if (typeof p.hp === 'number') p.hp = Math.min(maxHp, p.hp + healHp);
          if (typeof p.mp === 'number') p.mp = Math.min(maxMp, p.mp + healMp);
        }
      }

      if (s.elapsed >= s.duration) {
        if (s.scene && s.root) {
          s.scene.remove(s.root);
          disposeObject3D(s.root);
        }
        activeSanctuaries.splice(i, 1);
      }
    }
  }

  function ensureFxLoop() {
    if (fxLoopStarted) return;
    fxLoopStarted = true;
    lastFxTime = performance.now();

    const tick = (now) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastFxTime) / 1000));
      lastFxTime = now;

      for (let i = activeFxList.length - 1; i >= 0; i--) {
        const fx = activeFxList[i];
        fx.elapsed += dt;
        const p = Math.min(1, fx.elapsed / fx.duration);
        try {
          if (fx.onUpdate) fx.onUpdate(p, dt, fx.elapsed);
        } catch (err) {
          V9._reportError('fxLoop', err);
        }
        if (p >= 1) {
          try {
            if (fx.onDone) fx.onDone();
          } catch (e) {}
          fx.scene.remove(fx.root);
          disposeObject3D(fx.root);
          activeFxList.splice(i, 1);
        }
      }

      updateSanctuaries(dt);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  V9._helpers = {
    getGameInstance,
    getScene,
    spawnFxTask,
    shakeCamera,
    createRingMesh,
    createMagicCircleGroup,
    createParticlePoints,
    disposeObject3D,
    ensureFxLoop
  };

  // =========================================================
  // 4. 全18種 個別3Dエフェクトビルダー（前半 1〜9）
  // =========================================================
  const B = V9.EFFECT_BUILDERS;

  // 1. 覇王の咆哮・闘気覚醒オーラ (warcry_aura)
  B.warcry_aura = ({ scene, origin, profile, tier, game }) => {
    const scale = 1 + tier * 0.32;
    const root = new THREE.Group();
    root.position.copy(origin);

    const circle = createMagicCircleGroup(2.4 * scale, profile.c1, profile.c2, tier);
    circle.position.y = 0.08;
    root.add(circle);

    const pillarGeo = new THREE.CylinderGeometry(0.9 * scale, 1.5 * scale, 5.2 * scale, 24, 1, true);
    const pillarMat = new THREE.MeshBasicMaterial({
      color: profile.c1,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.y = 2.6 * scale;
    root.add(pillar);

    const shockRing = createRingMesh(0.4, 0.9, profile.c2, 0.95);
    shockRing.position.y = 0.25;
    root.add(shockRing);

    const count = 48 + tier * 20;
    const pts = createParticlePoints(count, profile.c2, 0.28 * scale);
    const vel = Array.from({ length: count }, () => ({
      ang: Math.random() * Math.PI * 2,
      rad: 0.4 + Math.random() * 1.8 * scale,
      spd: 2.5 + Math.random() * 3.5
    }));
    root.add(pts);

    shakeCamera(game, 0.22 + tier * 0.08, 0.35);
    spawnFxTask(scene, root, 1.15 + tier * 0.15, (p) => {
      circle.rotation.y += 0.09;
      pillar.rotation.y -= 0.14;
      pillar.scale.set(1 + p * 0.45, 1 + p * 0.25, 1 + p * 0.45);
      pillarMat.opacity = (1 - p) * 0.72;
      const sr = 1 + p * 4.8 * scale;
      shockRing.scale.set(sr, sr, 1);
      shockRing.material.opacity = (1 - p) * 0.9;

      const arr = pts.geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        const v = vel[i];
        const a = v.ang + p * 5;
        arr[i * 3] = Math.cos(a) * v.rad;
        arr[i * 3 + 1] = p * v.spd * scale;
        arr[i * 3 + 2] = Math.sin(a) * v.rad;
      }
      pts.geometry.attributes.position.needsUpdate = true;
      pts.material.opacity = 1 - p;
    });
  };

  // 2. 神域防御・絶対聖盾魔法 (aegis_shield)
  B.aegis_shield = ({ scene, origin, profile, tier }) => {
    const scale = 1 + tier * 0.3;
    const root = new THREE.Group();
    root.position.copy(origin);

    const domeGeo = new THREE.SphereGeometry(2.1 * scale, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.65);
    const domeMat = new THREE.MeshBasicMaterial({
      color: profile.c1,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    root.add(dome);

    const innerGeo = new THREE.SphereGeometry(2.02 * scale, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.65);
    const innerMat = new THREE.MeshBasicMaterial({
      color: profile.c2,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const innerDome = new THREE.Mesh(innerGeo, innerMat);
    root.add(innerDome);

    const circle = createMagicCircleGroup(2.5 * scale, profile.c1, profile.c2, tier);
    circle.position.y = 0.08;
    root.add(circle);

    spawnFxTask(scene, root, 1.35 + tier * 0.2, (p) => {
      dome.rotation.y += 0.04;
      circle.rotation.y -= 0.06;
      const pulse = 0.95 + Math.sin(p * Math.PI * 4) * 0.06;
      dome.scale.setScalar(pulse);
      domeMat.opacity = (1 - Math.pow(p, 2)) * 0.85;
      innerMat.opacity = (1 - Math.pow(p, 2)) * 0.32;
    });
  };

  // 3. 極光の聖域・持続HP/MP回復領域 (aurora_sanctuary)
  B.aurora_sanctuary = ({ scene, origin, profile, tier }) => {
    const scale = 1 + tier * 0.32;
    const radius = 3.6 * scale;
    const root = new THREE.Group();
    root.position.copy(origin);

    const ring1 = createMagicCircleGroup(radius, profile.c1, profile.c2, tier);
    ring1.position.y = 0.08;
    const ring2 = createRingMesh(radius * 0.68, radius * 0.78, profile.c3, 0.85);
    ring2.position.y = 0.12;

    const pillarGeo = new THREE.CylinderGeometry(radius * 0.92, radius * 0.92, 3.2 * scale, 32, 1, true);
    const pillarMat = new THREE.MeshBasicMaterial({
      color: profile.c1,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.y = 1.6 * scale;

    root.add(ring1, ring2, pillar);
    scene.add(root);
    ensureFxLoop();

    activeSanctuaries.push({
      scene,
      root,
      ring1,
      ring2,
      pillar,
      origin: origin.clone(),
      radius,
      tier,
      elapsed: 0,
      tickAcc: 0,
      duration: 5.5 + tier * 1.5
    });
  };

  // 4. 烈空・三日月真空斬 (slash_crescent)
  B.slash_crescent = ({ scene, origin, target, dir, profile, tier }) => {
    const scale = 1 + tier * 0.32;
    const root = new THREE.Group();
    root.position.copy(origin);
    root.position.y += 1.0;

    const bladeCount = 1 + tier;
    const blades = [];
    for (let i = 0; i < bladeCount; i++) {
      const torusGeo = new THREE.TorusGeometry(1.5 * scale, 0.14 + tier * 0.04, 10, 32, Math.PI * 1.15);
      const torusMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? profile.c1 : profile.c2,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending
      });
      const mesh = new THREE.Mesh(torusGeo, torusMat);
      mesh.rotation.x = Math.PI / 2 + (i - (bladeCount - 1) / 2) * 0.35;
      mesh.rotation.z = -Math.PI * 0.57;
      root.add(mesh);
      blades.push(mesh);
    }

    const travel = target ? target.clone().sub(origin) : dir.clone().multiplyScalar(8 + tier * 2);
    travel.y = 0;

    spawnFxTask(scene, root, 0.65 + tier * 0.08, (p) => {
      root.position.x = origin.x + travel.x * p;
      root.position.z = origin.z + travel.z * p;
      root.scale.setScalar(1 + p * 0.65);
      blades.forEach((b, idx) => {
        b.rotation.y += (idx % 2 === 0 ? 1 : -1) * 0.25;
        b.material.opacity = 1 - Math.pow(p, 1.8);
      });
    });
  };

  // 5. 星屑メテオ・超巨大隕石落下魔法 (fire_meteor)
  B.fire_meteor = ({ scene, target, origin, profile, tier, game }) => {
    const impact = (target || origin).clone();
    const scale = 1 + tier * 0.36;
    const root = new THREE.Group();

    const warnCircle = createMagicCircleGroup(3.0 * scale, profile.c1, profile.c2, tier);
    warnCircle.position.copy(impact);
    warnCircle.position.y = 0.08;
    root.add(warnCircle);

    const meteorGeo = new THREE.DodecahedronGeometry(1.15 * scale, 1);
    const meteorMat = new THREE.MeshBasicMaterial({
      color: profile.c1,
      transparent: true,
      opacity: 0.95
    });
    const meteor = new THREE.Mesh(meteorGeo, meteorMat);
    const startPos = impact.clone().add(new THREE.Vector3(-4.5, 11.5 * scale, -4.5));
    meteor.position.copy(startPos);
    root.add(meteor);

    const shock = createRingMesh(0.3, 1.2, profile.c2, 0.95);
    shock.position.copy(impact);
    shock.position.y = 0.15;
    shock.visible = false;
    root.add(shock);

    let shook = false;
    spawnFxTask(scene, root, 1.25 + tier * 0.15, (p) => {
      warnCircle.rotation.y += 0.1;
      if (p < 0.55) {
        const f = p / 0.55;
        meteor.position.lerpVectors(startPos, impact, f * f);
        meteor.rotation.x += 0.18;
        meteor.rotation.z += 0.22;
      } else {
        if (!shook) {
          shook = true;
          shakeCamera(game, 0.38 + tier * 0.12, 0.45);
        }
        meteor.visible = false;
        shock.visible = true;
        const b = (p - 0.55) / 0.45;
        const sc = 1 + b * 6.2 * scale;
        shock.scale.set(sc, sc, 1);
        shock.material.opacity = (1 - b) * 0.95;
        warnCircle.scale.setScalar(1 + b * 0.4);
      }
    });
  };

  // 6. 紅蓮業火・螺旋炎柱魔法 (fire_pillar)
  B.fire_pillar = ({ scene, target, origin, profile, tier, game }) => {
    const pos = (target || origin).clone();
    const scale = 1 + tier * 0.33;
    const root = new THREE.Group();
    root.position.copy(pos);

    const circle = createMagicCircleGroup(2.3 * scale, profile.c1, profile.c2, tier);
    circle.position.y = 0.08;
    root.add(circle);

    const colGeo = new THREE.CylinderGeometry(0.65 * scale, 1.25 * scale, 6.2 * scale, 20, 1, true);
    const colMat = new THREE.MeshBasicMaterial({
      color: profile.c1,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const col = new THREE.Mesh(colGeo, colMat);
    col.position.y = 3.1 * scale;
    root.add(col);

    const coreGeo = new THREE.CylinderGeometry(0.3 * scale, 0.55 * scale, 6.6 * scale, 16, 1, true);
    const coreMat = new THREE.MeshBasicMaterial({
      color: profile.c2,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.y = 3.3 * scale;
    root.add(core);

    shakeCamera(game, 0.25 + tier * 0.07, 0.35);
    spawnFxTask(scene, root, 1.05 + tier * 0.15, (p) => {
      circle.rotation.y += 0.12;
      col.rotation.y -= 0.25;
      core.rotation.y += 0.35;
      const w = Math.sin(p * Math.PI) * (1 + tier * 0.12);
      col.scale.set(w, 1, w);
      core.scale.set(w, 1, w);
      colMat.opacity = (1 - p) * 0.88;
      coreMat.opacity = (1 - p) * 0.95;
    });
  };

  // 7. 爆炎ファイア・連装火球弾幕魔法 (fire_burst)
  B.fire_burst = ({ scene, origin, target, dir, profile, tier, game }) => {
    const scale = 1 + tier * 0.28;
    const root = new THREE.Group();
    const count = 3 + tier * 2;
    const orbs = [];

    for (let i = 0; i < count; i++) {
      const geo = new THREE.SphereGeometry(0.42 * scale, 14, 14);
      const mat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? profile.c1 : profile.c2,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending
      });
      const m = new THREE.Mesh(geo, mat);
      root.add(m);
      orbs.push({ mesh: m, angle: ((i - (count - 1) / 2) * 0.24) });
    }

    const endPos = target ? target.clone() : origin.clone().add(dir.clone().multiplyScalar(8 + tier * 2));
    shakeCamera(game, 0.22 + tier * 0.06, 0.3);

    spawnFxTask(scene, root, 0.75 + tier * 0.1, (p) => {
      orbs.forEach((o) => {
        const baseVec = new THREE.Vector3().lerpVectors(origin, endPos, p);
        const side = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(Math.sin(p * Math.PI) * o.angle * 5);
        o.mesh.position.copy(baseVec).add(side);
        o.mesh.position.y = origin.y + 1.0 + Math.sin(p * Math.PI) * 0.8;
        const sc = p > 0.78 ? 1 + (p - 0.78) * 9 : 1;
        o.mesh.scale.setScalar(sc);
        o.mesh.material.opacity = p > 0.78 ? 1 - (p - 0.78) / 0.22 : 0.95;
      });
    });
  };

  // 8. 灼熱ブレイズ・溶岩マグマ噴火魔法 (fire_eruption)
  B.fire_eruption = ({ scene, target, origin, profile, tier, game }) => {
    const pos = (target || origin).clone();
    const scale = 1 + tier * 0.34;
    const root = new THREE.Group();
    root.position.copy(pos);

    const crater = createMagicCircleGroup(2.6 * scale, profile.c1, profile.c2, tier);
    crater.position.y = 0.08;
    root.add(crater);

    const shards = [];
    const shardCount = 10 + tier * 5;
    for (let i = 0; i < shardCount; i++) {
      const geo = new THREE.ConeGeometry(0.32 * scale, 1.3 * scale, 6);
      const mat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? profile.c1 : profile.c2,
        transparent: true,
        opacity: 0.95
      });
      const m = new THREE.Mesh(geo, mat);
      const ang = (Math.PI * 2 * i) / shardCount;
      const dist = 0.6 + Math.random() * 1.4 * scale;
      shards.push({
        mesh: m,
        vx: Math.cos(ang) * dist * 2.2,
        vz: Math.sin(ang) * dist * 2.2,
        vy: 5.5 + Math.random() * 4.5 * scale
      });
      root.add(m);
    }

    shakeCamera(game, 0.3 + tier * 0.1, 0.4);
    spawnFxTask(scene, root, 1.15 + tier * 0.15, (p) => {
      crater.rotation.y += 0.08;
      shards.forEach((s) => {
        s.mesh.position.set(s.vx * p, Math.max(0, s.vy * p - 6.5 * p * p), s.vz * p);
        s.mesh.rotation.x += 0.2;
        s.mesh.rotation.z += 0.18;
        s.mesh.material.opacity = 1 - Math.pow(p, 1.6);
      });
    });
  };

  // 9. 絶対零度・氷華氷柱魔法 (ice)
  B.ice = ({ scene, target, origin, profile, tier, game }) => {
    const pos = (target || origin).clone();
    const scale = 1 + tier * 0.34;
    const root = new THREE.Group();
    root.position.copy(pos);

    const circle = createMagicCircleGroup(2.6 * scale, profile.c1, profile.c2, tier);
    circle.position.y = 0.08;
    root.add(circle);

    const spikes = [];
    const count = 6 + tier * 3;
    for (let i = 0; i < count; i++) {
      const h = (1.8 + (i % 3) * 0.75) * scale;
      const geo = new THREE.ConeGeometry(0.38 * scale, h, 6);
      const mat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? profile.c1 : profile.c2,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending
      });
      const spike = new THREE.Mesh(geo, mat);
      const ang = (Math.PI * 2 * i) / count;
      const rad = (0.55 + (i % 2) * 0.85) * scale;
      spike.position.set(Math.cos(ang) * rad, -h * 0.5, Math.sin(ang) * rad);
      spike.rotation.z = Math.cos(ang) * -0.22;
      spike.rotation.x = Math.sin(ang) * 0.22;
      root.add(spike);
      spikes.push({ mesh: spike, targetY: h * 0.45 });
    }

    shakeCamera(game, 0.2 + tier * 0.07, 0.3);
    spawnFxTask(scene, root, 1.15 + tier * 0.15, (p) => {
      circle.rotation.y += 0.09;
      const rise = Math.min(1, p * 3.5);
      spikes.forEach((s) => {
        s.mesh.position.y = THREE.MathUtils.lerp(-1.2, s.targetY, rise);
        s.mesh.material.opacity = p > 0.7 ? (1 - (p - 0.7) / 0.3) * 0.9 : 0.9;
      });
    });
  };
})();
// ▲▲▲ ここまで【スキルエフェクト専用 game9.js 2/4】 ▲▲▲
// ▼▼▼ ここから【スキルエフェクト専用 game9.js 3/4】3Dエフェクト後半(10〜18)・カットイン・再生エンジン ▼▼▼
(() => {
  'use strict';

  const V9 = window.KMJ_SKILL_FX_V9;
  if (!V9 || !V9._helpers) return;

  const {
    getGameInstance,
    getScene,
    spawnFxTask,
    shakeCamera,
    createRingMesh,
    createMagicCircleGroup,
    createParticlePoints
  } = V9._helpers;

  // =========================================================
  // 5. 全18種 個別3Dエフェクトビルダー（後半 10〜18）
  // =========================================================
  const B = V9.EFFECT_BUILDERS;

  // 10. 紫電・天罰落雷魔法 (thunder)
  B.thunder = ({ scene, target, origin, profile, tier, game }) => {
    const pos = (target || origin).clone();
    const scale = 1 + tier * 0.35;
    const root = new THREE.Group();
    root.position.copy(pos);

    const circle = createMagicCircleGroup(2.5 * scale, profile.c1, profile.c2, tier);
    circle.position.y = 0.08;
    root.add(circle);

    const boltCount = 1 + tier;
    const bolts = [];
    for (let b = 0; b < boltCount; b++) {
      const segs = 9;
      const pts = [];
      const offX = b === 0 ? 0 : (Math.random() - 0.5) * 2.2 * scale;
      const offZ = b === 0 ? 0 : (Math.random() - 0.5) * 2.2 * scale;
      for (let i = 0; i <= segs; i++) {
        const t = i / segs;
        const jit = i === 0 || i === segs ? 0 : (0.65 * scale);
        pts.push(new THREE.Vector3(
          offX + (Math.random() - 0.5) * jit,
          (1 - t) * 11.5 * scale,
          offZ + (Math.random() - 0.5) * jit
        ));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({
        color: b % 2 === 0 ? profile.c1 : profile.c2,
        transparent: true,
        opacity: 1
      });
      const line = new THREE.Line(geo, mat);
      root.add(line);
      bolts.push(line);

      const coreGeo = new THREE.CylinderGeometry(0.16 * scale, 0.24 * scale, 11.5 * scale, 8);
      const coreMat = new THREE.MeshBasicMaterial({
        color: b % 2 === 0 ? profile.c1 : profile.c3,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending
      });
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.position.set(offX, 5.75 * scale, offZ);
      root.add(core);
      bolts.push(core);
    }

    const shock = createRingMesh(0.3, 1.0, profile.c1, 0.95);
    shock.position.y = 0.14;
    root.add(shock);

    shakeCamera(game, 0.34 + tier * 0.1, 0.42);
    spawnFxTask(scene, root, 0.85 + tier * 0.12, (p) => {
      circle.rotation.y += 0.16;
      const sc = 1 + p * 4.6 * scale;
      shock.scale.set(sc, sc, 1);
      shock.material.opacity = (1 - p) * 0.95;
      const flash = Math.abs(Math.sin(p * Math.PI * 6)) * (1 - p);
      bolts.forEach((bl) => {
        if (bl.material) bl.material.opacity = Math.max(0, flash);
      });
    });
  };

  // 11. 旋風円舞・螺旋竜巻魔法 (wind)
  B.wind = ({ scene, target, origin, profile, tier }) => {
    const pos = (target || origin).clone();
    const scale = 1 + tier * 0.34;
    const root = new THREE.Group();
    root.position.copy(pos);

    const rings = [];
    const ringCount = 6 + tier * 2;
    for (let i = 0; i < ringCount; i++) {
      const h = (i / ringCount) * 4.8 * scale + 0.2;
      const r = (0.45 + (i / ringCount) * 1.85) * scale;
      const torusGeo = new THREE.TorusGeometry(r, 0.08 + tier * 0.02, 8, 28);
      const torusMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? profile.c1 : profile.c2,
        transparent: true,
        opacity: 0.88,
        blending: THREE.AdditiveBlending
      });
      const m = new THREE.Mesh(torusGeo, torusMat);
      m.rotation.x = Math.PI / 2;
      m.position.y = h;
      root.add(m);
      rings.push({ mesh: m, baseY: h, idx: i });
    }

    spawnFxTask(scene, root, 1.15 + tier * 0.15, (p) => {
      root.rotation.y += 0.22;
      rings.forEach((r) => {
        r.mesh.position.y = r.baseY + Math.sin(p * Math.PI * 3 + r.idx) * 0.25;
        const sc = 1 + p * 0.45;
        r.mesh.scale.set(sc, sc, 1);
        r.mesh.material.opacity = (1 - Math.pow(p, 1.6)) * 0.9;
      });
    });
  };

  // 12. 蒼海・大渦潮水柱魔法 (water)
  B.water = ({ scene, target, origin, profile, tier, game }) => {
    const pos = (target || origin).clone();
    const scale = 1 + tier * 0.34;
    const root = new THREE.Group();
    root.position.copy(pos);

    const circle = createMagicCircleGroup(2.6 * scale, profile.c1, profile.c2, tier);
    circle.position.y = 0.08;
    root.add(circle);

    const spoutGeo = new THREE.CylinderGeometry(1.15 * scale, 0.55 * scale, 5.4 * scale, 24, 1, true);
    const spoutMat = new THREE.MeshBasicMaterial({
      color: profile.c1,
      transparent: true,
      opacity: 0.78,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const spout = new THREE.Mesh(spoutGeo, spoutMat);
    spout.position.y = 2.7 * scale;
    root.add(spout);

    const waveRing = createRingMesh(0.4, 1.1, profile.c2, 0.9);
    waveRing.position.y = 0.16;
    root.add(waveRing);

    shakeCamera(game, 0.22 + tier * 0.07, 0.35);
    spawnFxTask(scene, root, 1.15 + tier * 0.15, (p) => {
      circle.rotation.y -= 0.14;
      spout.rotation.y += 0.24;
      const sc = 1 + p * 4.5 * scale;
      waveRing.scale.set(sc, sc, 1);
      waveRing.material.opacity = (1 - p) * 0.9;
      spoutMat.opacity = (1 - p) * 0.82;
    });
  };

  // 13. 破邪の衝撃・巨岩隆起魔法 (earth)
  B.earth = ({ scene, target, origin, profile, tier, game }) => {
    const pos = (target || origin).clone();
    const scale = 1 + tier * 0.35;
    const root = new THREE.Group();
    root.position.copy(pos);

    const circle = createMagicCircleGroup(2.7 * scale, profile.c1, profile.c2, tier);
    circle.position.y = 0.08;
    root.add(circle);

    const rocks = [];
    const count = 7 + tier * 3;
    for (let i = 0; i < count; i++) {
      const sz = (0.55 + (i % 3) * 0.32) * scale;
      const geo = new THREE.DodecahedronGeometry(sz, 0);
      const mat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? profile.c1 : profile.c3,
        transparent: true,
        opacity: 0.95
      });
      const rock = new THREE.Mesh(geo, mat);
      const ang = (Math.PI * 2 * i) / count;
      const dist = (0.7 + (i % 2) * 1.1) * scale;
      rock.position.set(Math.cos(ang) * dist, -sz, Math.sin(ang) * dist);
      root.add(rock);
      rocks.push({ mesh: rock, targetY: sz * 0.65 });
    }

    shakeCamera(game, 0.36 + tier * 0.12, 0.45);
    spawnFxTask(scene, root, 1.15 + tier * 0.15, (p) => {
      const rise = Math.min(1, p * 4);
      rocks.forEach((r) => {
        r.mesh.position.y = THREE.MathUtils.lerp(-1.0, r.targetY, rise);
        r.mesh.rotation.x += 0.03;
        r.mesh.rotation.y += 0.04;
        r.mesh.material.opacity = p > 0.72 ? 1 - (p - 0.72) / 0.28 : 0.95;
      });
    });
  };

  // 14. 聖光の癒し・天照光輪魔法 (holy_heal)
  B.holy_heal = ({ scene, origin, profile, tier }) => {
    const scale = 1 + tier * 0.32;
    const root = new THREE.Group();
    root.position.copy(origin);

    const circle = createMagicCircleGroup(2.5 * scale, profile.c1, profile.c3, tier);
    circle.position.y = 0.08;
    root.add(circle);

    const haloGeo = new THREE.TorusGeometry(1.35 * scale, 0.09 + tier * 0.02, 10, 36);
    const haloMat = new THREE.MeshBasicMaterial({
      color: profile.c1,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.rotation.x = Math.PI / 2;
    halo.position.y = 0.3;
    root.add(halo);

    const count = 42 + tier * 18;
    const pts = createParticlePoints(count, profile.c2, 0.26 * scale);
    const seeds = Array.from({ length: count }, () => ({
      ang: Math.random() * Math.PI * 2,
      rad: 0.3 + Math.random() * 1.9 * scale,
      spd: 2.2 + Math.random() * 2.5
    }));
    root.add(pts);

    spawnFxTask(scene, root, 1.25 + tier * 0.15, (p) => {
      circle.rotation.y += 0.08;
      halo.position.y = 0.3 + p * 3.8 * scale;
      halo.scale.setScalar(1 + Math.sin(p * Math.PI) * 0.35);
      haloMat.opacity = 1 - Math.pow(p, 1.7);

      const arr = pts.geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        const s = seeds[i];
        const a = s.ang + p * 3.5;
        arr[i * 3] = Math.cos(a) * s.rad;
        arr[i * 3 + 1] = p * s.spd * scale;
        arr[i * 3 + 2] = Math.sin(a) * s.rad;
      }
      pts.geometry.attributes.position.needsUpdate = true;
      pts.material.opacity = 1 - p;
    });
  };

  // 15. 黒蝕・ブラックホール魔法 (dark)
  B.dark = ({ scene, target, origin, profile, tier, game }) => {
    const pos = (target || origin).clone();
    const scale = 1 + tier * 0.35;
    const root = new THREE.Group();
    root.position.copy(pos);

    const coreGeo = new THREE.SphereGeometry(1.15 * scale, 22, 22);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x05030a,
      transparent: true,
      opacity: 0.96
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.y = 1.6 * scale;
    root.add(core);

    const diskGeo = new THREE.TorusGeometry(2.1 * scale, 0.18 * scale, 10, 40);
    const diskMat = new THREE.MeshBasicMaterial({
      color: profile.c1,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    const disk = new THREE.Mesh(diskGeo, diskMat);
    disk.position.y = 1.6 * scale;
    disk.rotation.x = Math.PI / 2.4;
    root.add(disk);

    const circle = createMagicCircleGroup(2.8 * scale, profile.c1, profile.c2, tier);
    circle.position.y = 0.08;
    root.add(circle);

    shakeCamera(game, 0.32 + tier * 0.1, 0.45);
    spawnFxTask(scene, root, 1.3 + tier * 0.18, (p) => {
      disk.rotation.z += 0.22;
      circle.rotation.y -= 0.12;
      const pulse = p < 0.75 ? Math.sin((p / 0.75) * Math.PI * 0.5) * 1.2 : (1 - (p - 0.75) / 0.25) * 1.5;
      core.scale.setScalar(Math.max(0.05, pulse));
      disk.scale.setScalar(Math.max(0.05, pulse));
      diskMat.opacity = p > 0.75 ? (1 - (p - 0.75) / 0.25) : 0.9;
    });
  };

  // 16. 呪詛・魔界瘴気魔法 (poison)
  B.poison = ({ scene, target, origin, profile, tier }) => {
    const pos = (target || origin).clone();
    const scale = 1 + tier * 0.32;
    const root = new THREE.Group();
    root.position.copy(pos);

    const circle = createMagicCircleGroup(2.5 * scale, profile.c1, profile.c2, tier);
    circle.position.y = 0.08;
    root.add(circle);

    const bubbles = [];
    const count = 14 + tier * 6;
    for (let i = 0; i < count; i++) {
      const geo = new THREE.SphereGeometry((0.22 + (i % 3) * 0.12) * scale, 12, 12);
      const mat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? profile.c1 : profile.c2,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending
      });
      const m = new THREE.Mesh(geo, mat);
      const ang = Math.random() * Math.PI * 2;
      const rad = Math.random() * 1.9 * scale;
      m.position.set(Math.cos(ang) * rad, 0.2, Math.sin(ang) * rad);
      root.add(m);
      bubbles.push({ mesh: m, spd: 1.8 + Math.random() * 2.4, phase: Math.random() * 6 });
    }

    spawnFxTask(scene, root, 1.2 + tier * 0.15, (p) => {
      circle.rotation.y += 0.08;
      bubbles.forEach((b) => {
        b.mesh.position.y = 0.2 + p * b.spd * scale;
        const w = 1 + Math.sin(p * 10 + b.phase) * 0.25;
        b.mesh.scale.setScalar(w);
        b.mesh.material.opacity = (1 - p) * 0.88;
      });
    });
  };

  // 17. 星屑・銀河流星魔法 (star)
  B.star = ({ scene, target, origin, profile, tier, game }) => {
    const pos = (target || origin).clone();
    const scale = 1 + tier * 0.34;
    const root = new THREE.Group();

    const circle = createMagicCircleGroup(2.7 * scale, profile.c1, profile.c2, tier);
    circle.position.copy(pos);
    circle.position.y = 0.08;
    root.add(circle);

    const stars = [];
    const count = 6 + tier * 3;
    for (let i = 0; i < count; i++) {
      const geo = new THREE.OctahedronGeometry(0.45 * scale, 0);
      const mat = new THREE.MeshBasicMaterial({
        color: i % 3 === 0 ? profile.c1 : (i % 3 === 1 ? profile.c2 : profile.c3),
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending
      });
      const m = new THREE.Mesh(geo, mat);
      const ang = (Math.PI * 2 * i) / count;
      const rad = (0.5 + (i % 2) * 1.1) * scale;
      const endP = pos.clone().add(new THREE.Vector3(Math.cos(ang) * rad, 0.2, Math.sin(ang) * rad));
      const startP = endP.clone().add(new THREE.Vector3(-3.0, 9.0 * scale, -2.5));
      m.position.copy(startP);
      root.add(m);
      stars.push({ mesh: m, startP, endP, delay: (i / count) * 0.35 });
    }

    shakeCamera(game, 0.24 + tier * 0.08, 0.35);
    spawnFxTask(scene, root, 1.2 + tier * 0.15, (p) => {
      circle.rotation.y += 0.12;
      stars.forEach((s) => {
        const localP = Math.max(0, Math.min(1, (p - s.delay) / (1 - s.delay)));
        s.mesh.position.lerpVectors(s.startP, s.endP, localP * localP);
        s.mesh.rotation.x += 0.18;
        s.mesh.rotation.y += 0.22;
        s.mesh.material.opacity = localP > 0.85 ? (1 - localP) / 0.15 : 0.95;
      });
    });
  };

  // 18. 秘剣・無限光剣陣 (sword)
  B.sword = ({ scene, target, origin, profile, tier, game }) => {
    const pos = (target || origin).clone();
    const scale = 1 + tier * 0.34;
    const root = new THREE.Group();
    root.position.copy(pos);

    const circle = createMagicCircleGroup(2.6 * scale, profile.c1, profile.c2, tier);
    circle.position.y = 0.08;
    root.add(circle);

    const blades = [];
    const count = 6 + tier * 3;
    for (let i = 0; i < count; i++) {
      const bladeGroup = new THREE.Group();
      const bGeo = new THREE.ConeGeometry(0.18 * scale, 2.2 * scale, 4);
      const bMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? profile.c1 : profile.c2,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending
      });
      const blade = new THREE.Mesh(bGeo, bMat);
      blade.rotation.x = Math.PI;
      bladeGroup.add(blade);

      const ang = (Math.PI * 2 * i) / count;
      const rad = (0.75 + (i % 2) * 0.95) * scale;
      bladeGroup.position.set(Math.cos(ang) * rad, 5.2 * scale, Math.sin(ang) * rad);
      root.add(bladeGroup);
      blades.push({ grp: bladeGroup, mat: bMat, delay: (i / count) * 0.25 });
    }

    shakeCamera(game, 0.24 + tier * 0.08, 0.35);
    spawnFxTask(scene, root, 1.1 + tier * 0.15, (p) => {
      circle.rotation.y += 0.14;
      blades.forEach((b) => {
        const lp = Math.max(0, Math.min(1, (p - b.delay) / (1 - b.delay)));
        b.grp.position.y = THREE.MathUtils.lerp(5.2 * scale, 0.9 * scale, Math.min(1, lp * 1.4));
        b.mat.opacity = lp > 0.78 ? (1 - lp) / 0.22 : 0.95;
      });
    });
  };

  // =========================================================
  // 6. スペルカードカットイン演出
  // =========================================================
  function showSpellCutinV9(displayName, profile, tier = 0, game = null) {
    try {
      let layer = document.getElementById('kmj-v9-cutin-layer');
      if (!layer) {
        layer = document.createElement('div');
        layer.id = 'kmj-v9-cutin-layer';
        document.body.appendChild(layer);
      }
      layer.innerHTML = '';

      const g = game || getGameInstance();
      const face = (g && g.player && (g.player.kaomoji || g.player.face || g.player.name)) || '(｀・ω・´)';
      const tierBadges = ['通常スペル', '【真】覚醒スペル', '【極】奥義スペル', '【神】創世神話スペル'];
      const badge = tierBadges[Math.max(0, Math.min(3, tier))];

      const flash = document.createElement('div');
      flash.className = 'kmj-v9-flash';
      flash.style.background = 'radial-gradient(circle at 75% 20%, rgba(253,224,71,0.42), transparent 68%)';

      const lineTop = document.createElement('div');
      lineTop.className = 'kmj-v9-line-top';

      const lineBot = document.createElement('div');
      lineBot.className = 'kmj-v9-line-bot';

      const banner = document.createElement('div');
      banner.className = 'kmj-v9-banner';
      banner.style.background = profile.bgGrad;
      banner.innerHTML = `
        <div class="kmj-v9-ring-1"></div>
        <div class="kmj-v9-ring-2"></div>
        <div class="kmj-v9-banner-inner">
          <div class="kmj-v9-avatar">${String(face).replace(/</g, '&lt;')}</div>
          <div>
            <div style="font-size:11px;font-weight:900;color:#fde047;letter-spacing:0.08em;">
              ✦ ${profile.cardType} ／ ${badge} ✦
            </div>
            <div style="font-size:17px;font-weight:900;color:#ffffff;text-shadow:0 2px 8px rgba(0,0,0,0.85);margin-top:2px;">
              ${String(displayName).replace(/</g, '&lt;')}
            </div>
          </div>
        </div>
      `;

      layer.append(flash, lineTop, lineBot, banner);
      setTimeout(() => {
        if (layer && layer.contains(banner)) layer.innerHTML = '';
      }, 2400);
    } catch (e) {}
  }

  // =========================================================
  // 7. スキル進化プロファイル解決＆カスタム保存管理
  // =========================================================
  const STORAGE_KEY_V9 = 'kmj_v9_skill_overrides';
  let skillOverridesCache = null;

  function loadSkillOverrides() {
    if (skillOverridesCache) return skillOverridesCache;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_V9);
      skillOverridesCache = raw ? JSON.parse(raw) : {};
    } catch (e) {
      skillOverridesCache = {};
    }
    return skillOverridesCache;
  }

  function saveSkillOverrides() {
    try {
      localStorage.setItem(STORAGE_KEY_V9, JSON.stringify(skillOverridesCache || {}));
    } catch (e) {}
  }

  function getBaseSkillName(skillOrName) {
    if (!skillOrName) return '秘剣・光閃';
    if (typeof skillOrName === 'string') return skillOrName.trim() || '秘剣・光閃';
    return String(skillOrName.baseName || skillOrName.origName || skillOrName.name || '秘剣・光閃').trim();
  }

  function resolveSkillProfileAndTier(skillOrName, forcedTier = null, forcedAttrId = null) {
    const baseName = getBaseSkillName(skillOrName);
    const overrides = loadSkillOverrides();
    const ov = overrides[baseName] || {};

    const attrId = forcedAttrId || ov.attrId || null;
    let profile = attrId ? V9.ATTRIBUTES.find((a) => a.id === attrId) : null;

    if (!profile) {
      profile = V9.ATTRIBUTES.find((a) => a.match && a.match.test(baseName)) || V9.ATTRIBUTES[V9.ATTRIBUTES.length - 1];
    }

    let tier = 0;
    if (typeof forcedTier === 'number' && !Number.isNaN(forcedTier)) {
      tier = Math.max(0, Math.min(3, Math.floor(forcedTier)));
    } else if (typeof ov.tier === 'number') {
      tier = Math.max(0, Math.min(3, Math.floor(ov.tier)));
    } else if (skillOrName && typeof skillOrName === 'object') {
      const lv = Number(skillOrName.level || skillOrName.lv || 1);
      if (lv >= 10) tier = 3;
      else if (lv >= 6) tier = 2;
      else if (lv >= 3) tier = 1;
    }

    const evolvedNames = profile.names(baseName);
    const evolvedName = evolvedNames[tier] || baseName;

    return {
      baseName,
      evolvedName,
      evolvedNames,
      profile,
      tier
    };
  }

  function setSkillOverrideV9(baseName, patch) {
    const key = getBaseSkillName(baseName);
    const overrides = loadSkillOverrides();
    overrides[key] = Object.assign({}, overrides[key] || {}, patch);
    saveSkillOverrides();
  }

  // =========================================================
  // 8. 3Dエフェクト＋カットイン＋効果音 一括再生コア
  // =========================================================
  function playSkillFxV9(skillOrName, options = {}) {
    try {
      const game = options.game || getGameInstance();
      const scene = getScene(game);
      const info = resolveSkillProfileAndTier(
        skillOrName,
        typeof options.tier === 'number' ? options.tier : null,
        options.attrId || null
      );

      // 効果音＆カットインはシーン有無に関わらず再生
      if (options.audio !== false && typeof V9._playMagicAudio === 'function') {
        V9._playMagicAudio(info.profile.id, info.tier);
      }
      if (options.cutin !== false) {
        showSpellCutinV9(info.evolvedName, info.profile, info.tier, game);
      }

      if (!scene || typeof THREE === 'undefined') return info;

      // プレイヤー座標・向き・ターゲット座標を安全に取得
      const origin = new THREE.Vector3(0, 0, 0);
      const dir = new THREE.Vector3(0, 0, 1);

      if (game && game.player) {
        const p = game.player;
        if (p.mesh && p.mesh.position) {
          origin.copy(p.mesh.position);
          const rotY = p.mesh.rotation ? p.mesh.rotation.y : 0;
          dir.set(Math.sin(rotY), 0, Math.cos(rotY)).normalize();
        } else if (typeof p.x === 'number' && typeof p.z === 'number') {
          origin.set(p.x, Number(p.y || 0), p.z);
        }
      }

      let target = null;
      if (options.targetPos && typeof options.targetPos.x === 'number') {
        target = new THREE.Vector3(options.targetPos.x, Number(options.targetPos.y || 0), options.targetPos.z);
      } else if (game && game.targetEnemy && game.targetEnemy.mesh && game.targetEnemy.mesh.position) {
        target = game.targetEnemy.mesh.position.clone();
      } else if (game && Array.isArray(game.enemies)) {
        let bestDist = 14;
        for (const en of game.enemies) {
          if (!en || (typeof en.hp === 'number' && en.hp <= 0)) continue;
          const ep = en.mesh && en.mesh.position ? en.mesh.position : (typeof en.x === 'number' ? new THREE.Vector3(en.x, 0, en.z) : null);
          if (!ep) continue;
          const d = origin.distanceTo(ep);
          if (d < bestDist) {
            bestDist = d;
            target = ep.clone();
          }
        }
      }

      if (!target) {
        target = origin.clone().add(dir.clone().multiplyScalar(4.2));
      }

      const builder = V9.EFFECT_BUILDERS[info.profile.id] || V9.EFFECT_BUILDERS.sword;
      builder({
        scene,
        origin,
        target,
        dir,
        profile: info.profile,
        tier: info.tier,
        game
      });

      return info;
    } catch (err) {
      V9._reportError('playSkillFxV9', err);
      return null;
    }
  }

  V9.resolveSkillProfileAndTier = resolveSkillProfileAndTier;
  V9.setSkillOverride = setSkillOverrideV9;
  V9.playSkillFx = playSkillFxV9;
  V9.showSpellCutin = showSpellCutinV9;
})();
// ▲▲▲ ここまで【スキルエフェクト専用 game9.js 3/4】 ▲▲▲
// ▼▼▼ ここから【スキルエフェクト専用 game9.js 4/4】本体フック・デバッグスタジオ連携・魔法進化スタジオUI ▼▼▼
(() => {
  'use strict';

  const V9 = window.KMJ_SKILL_FX_V9;
  if (!V9 || !V9._helpers) return;

  const {
    getGameInstance,
    ensureFxLoop
  } = V9._helpers;

  // 代表デフォルトスキル一覧（未習得時やスタジオ試射でも全18属性を確認可能）
  const DEFAULT_SHOWCASE_SKILLS = [
    { id: 'v9_warcry',   name: '覇王の咆哮',     mp: 20, power: 1.5 },
    { id: 'v9_aegis',    name: '神域イージス',   mp: 25, power: 1.4 },
    { id: 'v9_aurora',   name: '極光の聖域',     mp: 30, power: 1.6 },
    { id: 'v9_slash',    name: '烈空三日月斬',   mp: 15, power: 1.8 },
    { id: 'v9_meteor',   name: '星屑メテオ',     mp: 45, power: 3.2 },
    { id: 'v9_pillar',   name: '紅蓮螺旋炎柱',   mp: 28, power: 2.3 },
    { id: 'v9_burst',    name: '爆炎連装ファイア', mp: 22, power: 2.0 },
    { id: 'v9_eruption', name: '灼熱マグマ噴火', mp: 32, power: 2.5 },
    { id: 'v9_ice',      name: '絶対零度氷華',   mp: 26, power: 2.2 },
    { id: 'v9_thunder',  name: '紫電天罰落雷',   mp: 30, power: 2.4 },
    { id: 'v9_wind',     name: '旋風円舞竜巻',   mp: 20, power: 1.9 },
    { id: 'v9_water',    name: '蒼海大渦潮',     mp: 24, power: 2.1 },
    { id: 'v9_earth',    name: '破邪の巨岩衝撃', mp: 26, power: 2.2 },
    { id: 'v9_holy',     name: '聖光の天照癒し', mp: 22, power: 1.8 },
    { id: 'v9_dark',     name: '黒蝕ブラックホール', mp: 40, power: 3.0 },
    { id: 'v9_poison',   name: '呪詛魔界瘴気',   mp: 18, power: 1.7 },
    { id: 'v9_star',     name: '銀河流星群',     mp: 36, power: 2.8 },
    { id: 'v9_sword',    name: '秘剣・無限光剣陣', mp: 34, power: 2.7 }
  ];

  // =========================================================
  // 9. スキル一覧取得・進化名同期・デバッグスタジオ連携API
  // =========================================================
  function collectPlayerSkillObjects(game) {
    const g = game || getGameInstance();
    const found = [];
    const seen = new Set();

    const pushObj = (sk) => {
      if (!sk || typeof sk !== 'object') return;
      if (!sk.baseName && sk.name) {
        sk.baseName = String(sk.name);
      }
      const key = sk.id || sk.baseName || sk.name;
      if (!key || seen.has(key)) return;
      seen.add(key);
      found.push(sk);
    };

    if (g) {
      if (Array.isArray(g.skills)) g.skills.forEach(pushObj);
      if (Array.isArray(g.skillSlots)) g.skillSlots.forEach(pushObj);
      if (Array.isArray(g.hotbar)) g.hotbar.forEach(pushObj);
      if (g.player) {
        if (Array.isArray(g.player.skills)) g.player.skills.forEach(pushObj);
        if (Array.isArray(g.player.skillSlots)) g.player.skillSlots.forEach(pushObj);
        if (Array.isArray(g.player.learnedSkills)) g.player.learnedSkills.forEach(pushObj);
      }
    }
    return found;
  }

  function getAll14Skills(game = null) {
    const owned = collectPlayerSkillObjects(game);
    const result = [...owned];
    const existingBases = new Set(owned.map((s) => String(s.baseName || s.name || '').trim()));

    for (const def of DEFAULT_SHOWCASE_SKILLS) {
      if (!existingBases.has(def.name)) {
        result.push(Object.assign({ baseName: def.name }, def));
      }
    }
    return result;
  }

  function getSkillInfo(skillOrName, forcedTier = null, forcedAttrId = null) {
    const res = V9.resolveSkillProfileAndTier(skillOrName, forcedTier, forcedAttrId);
    return {
      baseName: res.baseName,
      name: res.evolvedName,
      evolvedName: res.evolvedName,
      evolvedNames: res.evolvedNames,
      tier: res.tier,
      attrId: res.profile.id,
      attrLabel: res.profile.label,
      cardType: res.profile.cardType
    };
  }

  function syncAllSkills(game = null) {
    try {
      const g = game || getGameInstance();
      const list = collectPlayerSkillObjects(g);
      for (const sk of list) {
        if (!sk.baseName && sk.name) {
          sk.baseName = String(sk.name);
        }
        const info = V9.resolveSkillProfileAndTier(sk);
        sk.name = info.evolvedName;
        sk.v9Tier = info.tier;
        sk.v9AttrId = info.profile.id;
      }
      if (g && typeof g.updateSkillUI === 'function') {
        try { g.updateSkillUI(); } catch (e) {}
      }
      if (g && typeof g.renderHotbar === 'function') {
        try { g.renderHotbar(); } catch (e) {}
      }
      return list;
    } catch (err) {
      V9._reportError('syncAllSkills', err);
      return [];
    }
  }

  function previewSkillByObj(skillObj, forcedTier = null, forcedAttrId = null) {
    const g = getGameInstance();
    const targetObj = typeof skillObj === 'string'
      ? { name: skillObj, baseName: skillObj }
      : (skillObj || DEFAULT_SHOWCASE_SKILLS[0]);

    return V9.playSkillFx(targetObj, {
      game: g,
      tier: typeof forcedTier === 'number' ? forcedTier : null,
      attrId: forcedAttrId || null,
      cutin: true,
      audio: true
    });
  }

  // =========================================================
  // 10. KaomojiMMORPG 本体クラス＆インスタンスへの安全フック
  // =========================================================
  let lastCastSig = '';
  let lastCastTime = 0;

  function triggerFxDedup(skillOrName, game) {
    if (!skillOrName) return;
    const base = typeof skillOrName === 'string'
      ? skillOrName
      : (skillOrName.baseName || skillOrName.name || '');
    if (!base) return;

    const now = performance.now();
    // 同一メソッド連鎖呼び出し（useSkillSlot -> executeSingleSkillCast 等）の二重発火のみ抑制
    if (base === lastCastSig && now - lastCastTime < 140) {
      return;
    }
    lastCastSig = base;
    lastCastTime = now;

    V9.playSkillFx(skillOrName, { game });
  }

  function resolveSkillFromArg(instance, arg) {
    if (!arg && arg !== 0) return null;
    if (typeof arg === 'object') return arg;
    if (typeof arg === 'number') {
      const slots = (instance && (instance.skillSlots || instance.hotbar || (instance.player && instance.player.skillSlots))) || [];
      if (slots[arg]) return slots[arg];
      const list = collectPlayerSkillObjects(instance);
      return list[arg] || null;
    }
    if (typeof arg === 'string') {
      const list = collectPlayerSkillObjects(instance);
      return list.find((s) => s.id === arg || s.baseName === arg || s.name === arg) || { name: arg, baseName: arg };
    }
    return null;
  }

  function hookGamePrototype(Proto) {
    if (!Proto || Proto._kmjV9Hooked) return false;
    Proto._kmjV9Hooked = true;

    const castMethods = [
      'useSkillSlot',
      'executeSingleSkillCast',
      'useSkill',
      'castSkill'
    ];

    for (const mName of castMethods) {
      if (typeof Proto[mName] === 'function' && !Proto[mName]._kmjV9Wrapped) {
        const orig = Proto[mName];
        const wrapped = function (...args) {
          window._kmjGameInstance = this;
          try {
            const sk = resolveSkillFromArg(this, args[0]);
            if (sk) triggerFxDedup(sk, this);
          } catch (e) {
            V9._reportError(`hook:${mName}`, e);
          }
          return orig.apply(this, args);
        };
        wrapped._kmjV9Wrapped = true;
        Proto[mName] = wrapped;
      }
    }

    if (typeof Proto.update === 'function' && !Proto.update._kmjV9Wrapped) {
      const origUpdate = Proto.update;
      let syncedOnce = false;
      const wrappedUpdate = function (...args) {
        if (!window._kmjGameInstance) window._kmjGameInstance = this;
        if (!syncedOnce) {
          syncedOnce = true;
          ensureFxLoop();
          syncAllSkills(this);
        }
        return origUpdate.apply(this, args);
      };
      wrappedUpdate._kmjV9Wrapped = true;
      Proto.update = wrappedUpdate;
    }

    if (typeof Proto.triggerAttackVisual === 'function' && !Proto.triggerAttackVisual._kmjV9Wrapped) {
      const origVisual = Proto.triggerAttackVisual;
      const wrappedVisual = function (...args) {
        window._kmjGameInstance = this;
        try {
          const maybeSkill = args.find((a) => a && typeof a === 'object' && (a.baseName || a.name));
          if (maybeSkill) {
            triggerFxDedup(maybeSkill, this);
          }
        } catch (e) {}
        return origVisual.apply(this, args);
      };
      wrappedVisual._kmjV9Wrapped = true;
      Proto.triggerAttackVisual = wrappedVisual;
    }

    return true;
  }

  function tryAttachHooks() {
    let attached = false;
    const Cls = (typeof KaomojiMMORPG !== 'undefined' ? KaomojiMMORPG : null) || window.KaomojiMMORPG;
    if (Cls && Cls.prototype) {
      attached = hookGamePrototype(Cls.prototype) || attached;
    }
    const inst = getGameInstance();
    if (inst) {
      window._kmjGameInstance = inst;
      const proto = Object.getPrototypeOf(inst);
      if (proto && proto !== Object.prototype) {
        attached = hookGamePrototype(proto) || attached;
      }
      syncAllSkills(inst);
    }
    return attached;
  }

  // 読み込み順に関わらず確実に捕捉
  tryAttachHooks();
  let hookRetry = 0;
  const hookTimer = setInterval(() => {
    hookRetry++;
    const ok = tryAttachHooks();
    if ((ok && getGameInstance()) || hookRetry > 40) {
      clearInterval(hookTimer);
    }
  }, 250);

  // =========================================================
  // 11. ✨ 魔法進化スタジオ UI モーダル＆起動ボタン
  // =========================================================
  function openMagicEvolutionStudio() {
    const existing = document.getElementById('kmj-v9-studio-modal');
    if (existing) {
      existing.remove();
      return;
    }

    const g = getGameInstance();
    const skills = getAll14Skills(g);
    let selectedIdx = 0;

    const modal = document.createElement('div');
    modal.id = 'kmj-v9-studio-modal';

    const card = document.createElement('div');
    card.className = 'kmj-v9-studio-card';
    modal.appendChild(card);

    const tierLabels = [
      'Lv.0 通常スペル',
      'Lv.1 【真】覚醒',
      'Lv.2 【極】奥義',
      'Lv.3 【神】創世神話'
    ];

    function renderStudio() {
      const sk = skills[selectedIdx] || skills[0];
      const baseName = sk.baseName || sk.name;
      const info = V9.resolveSkillProfileAndTier(sk);

      const skillOptionsHtml = skills.map((s, idx) => {
        const b = s.baseName || s.name;
        const inf = V9.resolveSkillProfileAndTier(s);
        return `<option value="${idx}" ${idx === selectedIdx ? 'selected' : ''}>${b} （現在: ${tierLabels[inf.tier].split(' ')[1] || '通常'}）</option>`;
      }).join('');

      const attrOptionsHtml = V9.ATTRIBUTES.map((a) => {
        return `<option value="${a.id}" ${a.id === info.profile.id ? 'selected' : ''}>${a.label}</option>`;
      }).join('');

      const tierBtnsHtml = tierLabels.map((lbl, tIdx) => {
        const active = info.tier === tIdx;
        return `
          <button type="button" data-tier="${tIdx}" style="
            flex:1; padding:8px 4px; border-radius:8px; font-size:11px; font-weight:800; cursor:pointer;
            border:1.5px solid ${active ? '#fde047' : 'rgba(148,163,184,0.4)'};
            background:${active ? 'linear-gradient(135deg,#db2777,#7c3aed)' : 'rgba(15,23,42,0.85)'};
            color:#fff; box-shadow:${active ? '0 0 12px rgba(244,114,182,0.7)' : 'none'};
          ">${lbl}</button>
        `;
      }).join('');

      card.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;border-bottom:1px solid rgba(244,114,182,0.35);padding-bottom:8px;">
          <div style="font-size:15px;font-weight:900;color:#fde047;">✨ 魔法進化＆3Dエフェクトスタジオ</div>
          <button type="button" id="kmj-v9-close-btn" style="background:#334155;color:#fff;border:none;border-radius:8px;padding:4px 10px;font-weight:800;cursor:pointer;">✕ 閉じる</button>
        </div>

        <div style="margin-bottom:10px;">
          <label style="display:block;font-size:11px;color:#cbd5e1;margin-bottom:4px;font-weight:700;">1. カスタムするスキルを選択</label>
          <select id="kmj-v9-skill-sel" style="width:100%;padding:8px;border-radius:8px;background:#0f172a;color:#fff;border:1px solid #38bdf8;font-weight:700;">
            ${skillOptionsHtml}
          </select>
        </div>

        <div style="margin-bottom:10px;">
          <label style="display:block;font-size:11px;color:#cbd5e1;margin-bottom:4px;font-weight:700;">2. 3D魔法エフェクト属性（全18種）</label>
          <select id="kmj-v9-attr-sel" style="width:100%;padding:8px;border-radius:8px;background:#0f172a;color:#fff;border:1px solid #a855f7;font-weight:700;">
            ${attrOptionsHtml}
          </select>
        </div>

        <div style="margin-bottom:12px;">
          <label style="display:block;font-size:11px;color:#cbd5e1;margin-bottom:4px;font-weight:700;">3. 進化ランク（スケール・演出・スペル名変化）</label>
          <div style="display:flex;gap:6px;">${tierBtnsHtml}</div>
        </div>

        <div style="background:rgba(2,6,23,0.75);border:1px solid #fde047;border-radius:10px;padding:10px;margin-bottom:12px;">
          <div style="font-size:10px;color:#fde047;font-weight:800;">✦ 現在のスペルカード名プレビュー ✦</div>
          <div style="font-size:15px;font-weight:900;color:#fff;margin-top:3px;">${info.evolvedName}</div>
          <div style="font-size:11px;color:#94a3b8;margin-top:2px;">種別: ${info.profile.cardType} ／ 元スキル: ${baseName}</div>
        </div>

        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button type="button" id="kmj-v9-test-btn" style="
            flex:2; min-width:160px; padding:10px; border-radius:10px; border:none; cursor:pointer;
            background:linear-gradient(135deg,#f59e0b,#ec4899); color:#fff; font-weight:900; font-size:13px;
            box-shadow:0 0 18px rgba(236,72,153,0.6);
          ">⚡ 3Dエフェクト＆カットイン試射</button>
          <button type="button" id="kmj-v9-reset-btn" style="
            flex:1; min-width:100px; padding:10px; border-radius:10px; border:1px solid #64748b; cursor:pointer;
            background:#1e293b; color:#e2e8f0; font-weight:800; font-size:12px;
          ">🔄 自動判定に戻す</button>
        </div>
      `;

      card.querySelector('#kmj-v9-close-btn').onclick = () => modal.remove();
      modal.onclick = (ev) => { if (ev.target === modal) modal.remove(); };

      card.querySelector('#kmj-v9-skill-sel').onchange = (ev) => {
        selectedIdx = Number(ev.target.value) || 0;
        renderStudio();
      };

      card.querySelector('#kmj-v9-attr-sel').onchange = (ev) => {
        V9.setSkillOverride(baseName, { attrId: ev.target.value });
        syncAllSkills(g);
        renderStudio();
      };

      card.querySelectorAll('button[data-tier]').forEach((btn) => {
        btn.onclick = () => {
          const t = Number(btn.getAttribute('data-tier')) || 0;
          V9.setSkillOverride(baseName, { tier: t });
          syncAllSkills(g);
          renderStudio();
        };
      });

      card.querySelector('#kmj-v9-test-btn').onclick = () => {
        // 3D画面が見やすいように一時的にモーダル背景を半透明化
        modal.style.background = 'rgba(2, 6, 23, 0.18)';
        card.style.opacity = '0.35';
        previewSkillByObj(sk, info.tier, info.profile.id);
        setTimeout(() => {
          if (document.body.contains(modal)) {
            modal.style.background = 'rgba(2, 6, 23, 0.78)';
            card.style.opacity = '1';
          }
        }, 1450);
      };

      card.querySelector('#kmj-v9-reset-btn').onclick = () => {
        V9.setSkillOverride(baseName, { attrId: null, tier: null });
        syncAllSkills(g);
        renderStudio();
      };
    }

    renderStudio();
    document.body.appendChild(modal);
  }

  function injectStudioLauncherButton() {
    if (document.getElementById('kmj-v9-studio-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'kmj-v9-studio-btn';
    btn.type = 'button';
    btn.textContent = '✨ 魔法進化';
    btn.title = '魔法進化＆3Dエフェクトスタジオを開く';
    Object.assign(btn.style, {
      position: 'fixed',
      right: '12px',
      bottom: '74px',
      zIndex: '9800',
      padding: '7px 13px',
      borderRadius: '999px',
      border: '1.5px solid #fde047',
      background: 'linear-gradient(135deg, rgba(126,34,206,0.92), rgba(219,39,119,0.92))',
      color: '#fff',
      fontSize: '12px',
      fontWeight: '900',
      cursor: 'pointer',
      boxShadow: '0 0 16px rgba(236,72,153,0.65)',
      backdropFilter: 'blur(4px)'
    });
    btn.onclick = openMagicEvolutionStudio;
    document.body.appendChild(btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectStudioLauncherButton);
  } else {
    injectStudioLauncherButton();
  }

  // =========================================================
  // 12. 外部（game7.js デバッグスタジオ等）向け公開API登録
  // =========================================================
  Object.assign(V9, {
    getAll14Skills,
    getSkillInfo,
    previewSkillByObj,
    syncAllSkills,
    openMagicEvolutionStudio
  });

  // 互換エイリアス（どの参照名で呼ばれても同一オブジェクトへ接続）
  window.KMJ_SKILL_FX = V9;
  window.kmjSkillFx = V9;
})();
// ▲▲▲ ここまで【スキルエフェクト専用 game9.js 4/4】 ▲▲▲
