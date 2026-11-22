// ▼▼▼ ここから【スキルエフェクト専用 game9.js（超軽量・高速化版）1/2】CSS・シンセ音・全18種プロファイル・共有キャッシュ＆オンデマンド3Dループ・極光の聖域・前半3Dビルダー(1〜10) ▼▼▼
(() => {
  'use strict';

  // =========================================================
  // 1. スペルカードカットイン＆魔法スタジオCSS（GPU合成最適化・軽量版）
  // =========================================================
  if (!document.getElementById('kmj-v9-master-css')) {
    const st = document.createElement('style');
    st.id = 'kmj-v9-master-css';
    st.textContent = `
      @keyframes kmjV9CutinSlide {
        0%   { opacity: 0; transform: translate3d(110px, 0, 0) skewX(-15deg) scale(0.9); }
        11%  { opacity: 1; transform: translate3d(0, 0, 0) skewX(-15deg) scale(1.03); }
        84%  { opacity: 1; transform: translate3d(-10px, 0, 0) skewX(-15deg) scale(1.0); }
        100% { opacity: 0; transform: translate3d(-130px, 0, 0) skewX(-15deg) scale(0.94); }
      }
      @keyframes kmjV9LineSweep {
        0%   { transform: scaleX(0); opacity: 0; }
        15%  { transform: scaleX(1); opacity: 1; }
        85%  { transform: scaleX(1); opacity: 1; }
        100% { transform: scaleX(0); opacity: 0; }
      }
      @keyframes kmjV9SpinCW { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      @keyframes kmjV9SpinCCW { 0% { transform: rotate(360deg); } 100% { transform: rotate(0deg); } }
      @keyframes kmjV9FlashFade { 0% { opacity: 0.45; } 100% { opacity: 0; } }

      #kmj-v9-cutin-layer {
        position: fixed; inset: 0; pointer-events: none; z-index: 9999; overflow: hidden;
      }
      .kmj-v9-flash {
        position: absolute; inset: 0;
        will-change: opacity;
        animation: kmjV9FlashFade 0.4s ease-out forwards;
      }
      .kmj-v9-line-top, .kmj-v9-line-bot {
        position: absolute; left: 0; right: 0; height: 2px;
        background: linear-gradient(90deg, transparent, #fde047, #f472b6, #38bdf8, transparent);
        will-change: transform, opacity;
        animation: kmjV9LineSweep 2.1s ease-out forwards;
      }
      .kmj-v9-line-top { top: 12.2%; }
      .kmj-v9-line-bot { top: 24.8%; }

      .kmj-v9-banner {
        position: absolute; right: 14px; top: 13.2%; min-width: 300px; max-width: 92vw;
        padding: 12px 24px 12px 18px; border-radius: 12px; border: 2px solid #fde047;
        box-shadow: 0 4px 18px rgba(250, 204, 21, 0.55);
        display: flex; align-items: center; gap: 12px;
        will-change: transform, opacity;
        animation: kmjV9CutinSlide 2.15s cubic-bezier(0.16, 1, 0.3, 1) forwards; overflow: hidden;
      }
      .kmj-v9-banner-inner {
        transform: skewX(15deg); display: flex; align-items: center; gap: 12px; position: relative; z-index: 2;
      }
      .kmj-v9-ring-1 {
        position: absolute; right: -28px; top: -38px; width: 144px; height: 144px;
        border: 2px dashed rgba(255, 255, 255, 0.45); border-radius: 50%;
        will-change: transform;
        animation: kmjV9SpinCW 6s linear infinite; z-index: 1;
      }
      .kmj-v9-ring-2 {
        position: absolute; right: -12px; top: -22px; width: 114px; height: 114px;
        border: 2px solid rgba(253, 224, 71, 0.55); border-radius: 50%;
        will-change: transform;
        animation: kmjV9SpinCCW 4s linear infinite; z-index: 1;
      }
      .kmj-v9-avatar {
        background: rgba(15, 23, 42, 0.95); border: 2px solid #7dd3fc; border-radius: 10px;
        padding: 7px 10px; font-size: 15px; font-weight: 900; color: #fff; white-space: nowrap;
      }
      #kmj-v9-studio-modal {
        position: fixed; inset: 0; z-index: 9950;
        background: rgba(2, 6, 23, 0.86);
        display: flex; align-items: center; justify-content: center;
        padding: 12px;
      }
      .kmj-v9-studio-card {
        width: 100%; max-width: 500px; max-height: 86vh; overflow-y: auto;
        background: linear-gradient(160deg, #0f172a, #1e1b4b);
        border: 2px solid #f472b6; border-radius: 14px; padding: 14px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7);
        color: #f8fafc;
      }
    `;
    document.head.appendChild(st);
  }

  // =========================================================
  // 2. 属性別リッチ・シンセサイザー効果音（連打時の重複発音ガード付き）
  // =========================================================
  let _lastAudioStampV9 = 0;
  function playMagicAudioV9(attrId = 'sword', tier = 0) {
    try {
      const stamp = performance.now();
      if (stamp - _lastAudioStampV9 < 70) return;
      _lastAudioStampV9 = stamp;

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
      impOsc.frequency.exponentialRampToValueAtTime(Math.max(30, cfg.sweep), now + 0.35);
      impGain.gain.setValueAtTime(0.08, now);
      impGain.gain.exponentialRampToValueAtTime(0.001, now + 0.37);
      impOsc.connect(impGain);
      impGain.connect(ctx.destination);
      impOsc.start(now);
      impOsc.stop(now + 0.39);

      const count = Math.min(cfg.notes.length, 2 + tier, 4);
      for (let i = 0; i < count; i++) {
        const freq = cfg.notes[i];
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = tier >= 2 ? 'triangle' : 'sine';
        const t0 = now + i * 0.04;
        osc.frequency.setValueAtTime(freq, t0);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.02, t0 + 0.34);

        gain.gain.setValueAtTime(0.001, t0);
        gain.gain.linearRampToValueAtTime(0.055, t0 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.38);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + 0.40);
      }
    } catch (e) {}
  }

  // =========================================================
  // 3. 全18種の進化プロファイル（攻撃系 / 非攻撃サポート系を明確に区別）
  // =========================================================
  const SKILL_DERIVATION_PROFILES_V9 = [
    {
      id: 'warcry_aura',
      isNonAttack: true,
      supportType: 'buff',
      label: '🔥 覇王の咆哮・闘気覚醒オーラ【バフ】',
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
      isNonAttack: true,
      supportType: 'shield',
      label: '🛡️ 神域防御・絶対聖盾魔法【防御】',
      match: /イージス|神域|盾|シールド|バリア|守護|鉄壁|aegis|shield|guard|barrier/i,
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
      isNonAttack: true,
      supportType: 'sanctuary',
      label: '🌈 極光の聖域（持続HP/MP回復＆マルチバフ領域）【聖域】',
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
      isNonAttack: false,
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
      isNonAttack: false,
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
      isNonAttack: false,
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
      isNonAttack: false,
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
      isNonAttack: false,
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
      isNonAttack: false,
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
      isNonAttack: false,
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
      isNonAttack: false,
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
      isNonAttack: false,
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
      isNonAttack: false,
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
      isNonAttack: true,
      supportType: 'heal',
      label: '💖 聖光の癒し・天照光輪魔法【回復】',
      match: /癒し|ヒール|回復|光|聖|祈り|祝福|天照|ハート|cure|holy|heal|light|bless/i,
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
      isNonAttack: false,
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
      isNonAttack: false,
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
      isNonAttack: false,
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
      isNonAttack: false,
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
  // 4. ジオメトリ共有キャッシュ＆オンデマンド3Dアニメーション管理エンジン
  // =========================================================
  const _geoCacheV9 = Object.create(null);

  function getCachedGeoV9(key, factory) {
    if (!_geoCacheV9[key]) {
      const g = factory();
      g.userData = g.userData || {};
      g.userData.isCachedGeo = true;
      _geoCacheV9[key] = g;
    }
    return _geoCacheV9[key];
  }

  // 汎用単位ジオメトリ（スケール変換で全スキル共通再利用）
  function unitGeoV9(type) {
    switch (type) {
      case 'octa':   return getCachedGeoV9('unit_octa',   () => new THREE.OctahedronGeometry(1, 0));
      case 'tetra':  return getCachedGeoV9('unit_tetra',  () => new THREE.TetrahedronGeometry(1, 0));
      case 'dodeca': return getCachedGeoV9('unit_dodeca', () => new THREE.DodecahedronGeometry(1, 0));
      case 'icosa':  return getCachedGeoV9('unit_icosa',  () => new THREE.IcosahedronGeometry(1, 1));
      case 'sphere': return getCachedGeoV9('unit_sphere', () => new THREE.SphereGeometry(1, 14, 10));
      case 'box':    return getCachedGeoV9('unit_box',    () => new THREE.BoxGeometry(1, 1, 1));
      case 'cone8':  return getCachedGeoV9('unit_cone8',  () => new THREE.ConeGeometry(1, 1, 8));
      case 'cone4':  return getCachedGeoV9('unit_cone4',  () => new THREE.ConeGeometry(1, 1, 4));
      case 'cone6':  return getCachedGeoV9('unit_cone6',  () => new THREE.ConeGeometry(1, 1, 6));
      case 'cone10open': return getCachedGeoV9('unit_cone10open', () => new THREE.ConeGeometry(1, 1, 10, 1, true));
      case 'cyl16open':  return getCachedGeoV9('unit_cyl16open',  () => new THREE.CylinderGeometry(1, 1, 1, 16, 1, true));
      case 'cyl8':   return getCachedGeoV9('unit_cyl8',   () => new THREE.CylinderGeometry(1, 1, 1, 8));
      case 'cyl6':   return getCachedGeoV9('unit_cyl6',   () => new THREE.CylinderGeometry(1, 1, 1, 6));
      case 'circle24': return getCachedGeoV9('unit_circle24', () => new THREE.CircleGeometry(1, 24));
      default:       return getCachedGeoV9('unit_octa',   () => new THREE.OctahedronGeometry(1, 0));
    }
  }

  function makeCircleRing(rIn, rOut, color, seg = 24) {
    const optSeg = seg > 24 ? 24 : seg;
    const ratio = Math.max(0.05, Math.min(0.95, rIn / Math.max(0.01, rOut)));
    const key = `ring_${ratio.toFixed(2)}_${optSeg}`;
    const geo = getCachedGeoV9(key, () => new THREE.RingGeometry(ratio, 1.0, optSeg));
    const m = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.95, depthWrite: false })
    );
    m.scale.set(rOut, rOut, 1);
    m.rotation.x = -Math.PI / 2;
    return m;
  }

  function disposeGroupSafeV9(scene, rootGroup) {
    if (!rootGroup) return;
    try {
      scene?.remove(rootGroup);
      const disposedMats = new Set();
      rootGroup.traverse?.(obj => {
        if (obj.geometry && !obj.geometry.userData?.isCachedGeo) {
          obj.geometry.dispose?.();
        }
        if (obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach(m => {
            if (m && !disposedMats.has(m)) {
              disposedMats.add(m);
              m.dispose?.();
            }
          });
        }
      });
    } catch (e) {}
  }

  const activeAnimsV9 = [];
  const MAX_ACTIVE_ANIMS_V9 = 8;
  let _loopRunningV9 = false;
  let _lastFrameV9 = 0;

  function applyDepthWriteFixV9(rootGroup) {
    if (!rootGroup || typeof rootGroup.traverse !== 'function') return;
    rootGroup.traverse((obj) => {
      if (!obj.material) return;
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach((m) => {
        if (!m || !m.transparent) return;
        const hex = m.color && typeof m.color.getHex === 'function' ? m.color.getHex() : -1;
        if (hex !== 0x05020a) {
          m.depthWrite = false;
        }
      });
    });
  }

  function step3DLoopV9() {
    if (activeAnimsV9.length === 0) {
      _loopRunningV9 = false;
      return;
    }

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
        disposeGroupSafeV9(a.scene, a.group);
        activeAnimsV9.splice(i, 1);
      }
    }

    if (activeAnimsV9.length > 0) {
      requestAnimationFrame(step3DLoopV9);
    } else {
      _loopRunningV9 = false;
    }
  }

  function register3DAnimationV9(scene, rootGroup, duration, onTick) {
    if (!scene || !rootGroup) return;

    // 同時再生数上限を超えたら最古のエフェクトを即座に片付け
    while (activeAnimsV9.length >= MAX_ACTIVE_ANIMS_V9) {
      const oldest = activeAnimsV9.shift();
      if (oldest) disposeGroupSafeV9(oldest.scene, oldest.group);
    }

    applyDepthWriteFixV9(rootGroup);
    scene.add(rootGroup);
    activeAnimsV9.push({
      scene,
      group: rootGroup,
      elapsed: 0,
      duration: Math.max(0.2, duration),
      onTick
    });

    // エフェクト発生時のみアニメーションループを起動
    if (!_loopRunningV9) {
      _loopRunningV9 = true;
      _lastFrameV9 = performance.now();
      requestAnimationFrame(step3DLoopV9);
    }
  }

  // =========================================================
  // 5. 「極光の聖域」持続フィールド管理（同時展開上限2個＋軽量化）
  // =========================================================
  const activeSanctuariesV9 = [];
  const MAX_SANCTUARIES_V9 = 2;

  function spawnAuroraSanctuaryFieldV9(game, entity, info) {
    if (!game?.useWebGL || !game?.scene || !entity?.pos || typeof THREE === 'undefined') return;
    const tier = info?.tier ?? 0;
    const radius = (4.2 + tier * 1.4);
    const duration = 10.0 + tier * 3.0;

    // 同時設置上限（3個目を出したら一番古い聖域を自動消去）
    while (activeSanctuariesV9.length >= MAX_SANCTUARIES_V9) {
      const oldS = activeSanctuariesV9.shift();
      if (oldS) disposeGroupSafeV9(oldS.scene, oldS.root);
    }

    const root = new THREE.Group();
    root.position.set(entity.pos.x, 0, entity.pos.z);

    const floorDisk = new THREE.Mesh(
      unitGeoV9('circle24'),
      new THREE.MeshBasicMaterial({ color: 0x34d399, side: THREE.DoubleSide, transparent: true, opacity: 0.24, depthWrite: false })
    );
    floorDisk.scale.set(radius, radius, 1);
    floorDisk.rotation.x = -Math.PI / 2;
    floorDisk.position.y = 0.04;
    root.add(floorDisk);

    const rings = [];
    const ringCount = 2 + tier;
    const ringCols = [0x34d399, 0xf472b6, 0x38bdf8, 0xfde047];
    for (let r = 0; r < ringCount; r++) {
      const rIn = radius * (0.28 + (r / ringCount) * 0.68);
      const rOut = rIn + 0.16 + tier * 0.03;
      const segs = r % 3 === 0 ? 6 : (r % 3 === 1 ? 8 : 24);
      const rm = makeCircleRing(rIn, rOut, ringCols[r % ringCols.length], segs);
      rm.position.y = 0.06 + r * 0.02;
      root.add(rm);
      rings.push({ mesh: rm, spd: (r % 2 === 0 ? 1 : -1) * (1.5 + r * 0.4) });
    }

    const curtainH = (2.6 + tier * 1.1);
    const curtain = new THREE.Mesh(
      unitGeoV9('cyl16open'),
      new THREE.MeshBasicMaterial({ color: 0x34d399, side: THREE.DoubleSide, transparent: true, opacity: 0.28, depthWrite: false })
    );
    curtain.scale.set(radius, curtainH, radius);
    curtain.position.y = curtainH * 0.5;
    root.add(curtain);

    let innerCurtain = null;
    if (tier >= 1) {
      innerCurtain = new THREE.Mesh(
        unitGeoV9('cyl16open'),
        new THREE.MeshBasicMaterial({ color: tier >= 2 ? 0xfde047 : 0xf472b6, side: THREE.DoubleSide, transparent: true, opacity: 0.24, depthWrite: false })
      );
      innerCurtain.scale.set(radius * 0.65, curtainH * 1.35, radius * 0.65);
      innerCurtain.position.y = curtainH * 0.675;
      root.add(innerCurtain);
    }

    const crystals = [];
    const cryCnt = 4 + tier * 2;
    const cryMats = [
      new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.95, depthWrite: false }),
      new THREE.MeshBasicMaterial({ color: 0xf472b6, transparent: true, opacity: 0.95, depthWrite: false })
    ];
    const crySize = 0.32 + tier * 0.08;
    for (let c = 0; c < cryCnt; c++) {
      const ang = (Math.PI * 2 * c) / cryCnt;
      const cry = new THREE.Mesh(unitGeoV9('octa'), cryMats[c % 2]);
      cry.scale.setScalar(crySize);
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
      cryMats,
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
      s.cryMats.forEach(m => { m.opacity = fade * 0.95; });
      s.crystals.forEach((cr, idx) => {
        const a = cr.ang + s.elapsed * 1.1;
        cr.mesh.position.set(Math.cos(a) * s.radius, cr.baseY + Math.sin(s.elapsed * 3 + idx) * 0.35, Math.sin(a) * s.radius);
        cr.mesh.rotation.y = s.elapsed * 4;
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
        disposeGroupSafeV9(s.scene, s.root);
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
  // 6. 全18種スキル個別3Dエフェクト専用ビルダー（軽量・高迫力前半 1〜10）
  // =========================================================
  const reg = register3DAnimationV9;

  const EFFECT_BUILDERS_PART1 = {
    // 1. 覇王の咆哮（二重衝撃波＋闘気火柱＋回転王冠リング＋舞い上がる闘気結晶）
    warcry_aura: (scene, caster, target, tier, attr) => {
      const root = new THREE.Group();
      root.position.set(caster.x, 0, caster.z);

      const shockBase = 1.5 + tier * 0.45;
      const shock = makeCircleRing(0.4, shockBase, attr.c2, 24);
      shock.position.y = 0.08;
      const shock2Base = 2.2 + tier * 0.6;
      const shock2 = makeCircleRing(0.8, shock2Base, attr.c1, 6);
      shock2.position.y = 0.1;
      root.add(shock, shock2);

      const colRTop = 1.2 + tier * 0.35;
      const colH = 4.5 + tier * 1.2;
      const auraCol = new THREE.Mesh(
        unitGeoV9('cyl16open'),
        new THREE.MeshBasicMaterial({ color: attr.c1, side: THREE.DoubleSide, transparent: true, opacity: 0.58 })
      );
      auraCol.scale.set(colRTop, colH, colRTop);
      auraCol.position.y = colH * 0.5;
      root.add(auraCol);

      const crownRings = [];
      const crCnt = 2 + tier;
      const crMats = [
        new THREE.MeshBasicMaterial({ color: attr.c2, transparent: true, opacity: 0.95 }),
        new THREE.MeshBasicMaterial({ color: attr.c3, transparent: true, opacity: 0.95 })
      ];
      for (let i = 0; i < crCnt; i++) {
        const r = 1.3 + i * 0.38;
        const tube = 0.09 + tier * 0.02;
        const crGeo = getCachedGeoV9(`torus_${r.toFixed(2)}_${tube.toFixed(2)}`, () => new THREE.TorusGeometry(r, tube, 6, 20));
        const cr = new THREE.Mesh(crGeo, crMats[i % 2]);
        cr.rotation.x = Math.PI / 2;
        cr.position.y = 0.5 + i * 0.65;
        root.add(cr);
        crownRings.push(cr);
      }

      const flames = [];
      const fCnt = 8 + tier * 3;
      const fMats = [
        new THREE.MeshBasicMaterial({ color: attr.c2, transparent: true, opacity: 0.96 }),
        new THREE.MeshBasicMaterial({ color: attr.c1, transparent: true, opacity: 0.96 })
      ];
      const fSz = 0.28 + tier * 0.07;
      for (let i = 0; i < fCnt; i++) {
        const ang = (Math.PI * 2 * i) / fCnt;
        const rad = 0.9 + (i % 3) * 0.5;
        const f = new THREE.Mesh(unitGeoV9('octa'), fMats[i % 2]);
        f.scale.setScalar(fSz);
        f.position.set(Math.cos(ang) * rad, 0.2, Math.sin(ang) * rad);
        root.add(f);
        flames.push({ mesh: f, ang, rad, spd: 2.8 + (i % 4) * 0.75 });
      }

      reg(scene, root, 1.3 + tier * 0.25, (p, el) => {
        const fade = p > 0.72 ? 1 - (p - 0.72) / 0.28 : 1;
        const s1 = shockBase * (1 + p * (2.8 + tier * 0.85));
        shock.scale.set(s1, s1, 1);
        shock.material.opacity = fade * 0.92;
        const s2 = shock2Base * (1 + p * (2.2 + tier * 0.7));
        shock2.scale.set(s2, s2, 1);
        shock2.rotation.z = el * 3.5;
        shock2.material.opacity = fade * 0.9;
        auraCol.rotation.y = el * 4.5;
        const cw = colRTop * (1 + Math.sin(el * 12) * 0.1);
        auraCol.scale.set(cw, colH * (0.4 + p * 0.95), cw);
        auraCol.material.opacity = fade * 0.58;
        crMats.forEach(m => { m.opacity = fade * 0.95; });
        crownRings.forEach((cr, idx) => {
          cr.position.y = (0.4 + idx * 0.55) + p * (2.4 + tier * 0.55);
          cr.rotation.z = el * (idx % 2 === 0 ? 4.5 : -4.5);
        });
        fMats.forEach(m => { m.opacity = fade * 0.96; });
        flames.forEach((fl, idx) => {
          const a = fl.ang + el * 3.5;
          fl.mesh.position.set(Math.cos(a) * fl.rad, (p * fl.spd * 1.8) % 4.2, Math.sin(a) * fl.rad);
          fl.mesh.rotation.y = el * 6 + idx;
        });
      });
    },

    // 2. 神域防御・イージスの盾（ハニカムドーム＋二重回転聖盾リング＋地面守護陣）
    aegis_shield: (scene, caster, target, tier, attr) => {
      const root = new THREE.Group();
      root.position.set(caster.x, 1.1, caster.z);

      const domeR = 1.75 + tier * 0.48;
      const dome = new THREE.Mesh(
        unitGeoV9('icosa'),
        new THREE.MeshBasicMaterial({ color: attr.c1, wireframe: true, transparent: true, opacity: 0.92 })
      );
      root.add(dome);

      const innerDome = new THREE.Mesh(
        unitGeoV9('sphere'),
        new THREE.MeshBasicMaterial({ color: attr.c1, side: THREE.DoubleSide, transparent: true, opacity: 0.28 })
      );
      root.add(innerDome);

      const floorRune = makeCircleRing(domeR * 0.85, domeR * 1.25, attr.c2, 8);
      floorRune.position.y = -1.02;
      root.add(floorRune);

      const orbitGeo = getCachedGeoV9(`torus_aegis_${tier}`, () => new THREE.TorusGeometry(domeR * 1.12, 0.08, 6, 24));
      const orbitRing = new THREE.Mesh(
        orbitGeo,
        new THREE.MeshBasicMaterial({ color: attr.c2, transparent: true, opacity: 0.94 })
      );
      orbitRing.rotation.x = Math.PI / 2 - 0.35;
      root.add(orbitRing);

      const hexPlates = [];
      const plateCnt = 6 + tier * 2;
      const pMats = [
        new THREE.MeshBasicMaterial({ color: attr.c2, transparent: true, opacity: 0.78 }),
        new THREE.MeshBasicMaterial({ color: attr.c1, transparent: true, opacity: 0.78 })
      ];
      const pRad = 0.54 + tier * 0.1;
      for (let i = 0; i < plateCnt; i++) {
        const ang = (Math.PI * 2 * i) / plateCnt;
        const hp = new THREE.Mesh(unitGeoV9('cyl6'), pMats[i % 2]);
        hp.scale.set(pRad, 0.07, pRad);
        hp.position.set(Math.cos(ang) * (domeR + 0.15), (i % 3 - 1) * 0.48, Math.sin(ang) * (domeR + 0.15));
        hp.lookAt(0, hp.position.y, 0);
        hp.rotateX(Math.PI / 2);
        root.add(hp);
        hexPlates.push({ mesh: hp, ang, yOff: (i % 3 - 1) * 0.48 });
      }

      reg(scene, root, 1.5 + tier * 0.35, (p, el) => {
        const fade = p > 0.75 ? 1 - (p - 0.75) / 0.25 : 1;
        const pop = p < 0.15 ? (p / 0.15) : 1;
        dome.scale.setScalar(domeR * pop);
        dome.rotation.y = el * 1.6;
        dome.material.opacity = fade * 0.92;
        innerDome.scale.setScalar(domeR * 0.96 * pop);
        innerDome.material.opacity = fade * (0.24 + Math.sin(el * 8) * 0.06);
        floorRune.rotation.z = -el * 2.5;
        floorRune.material.opacity = fade * 0.92;
        orbitRing.rotation.z = el * 4.0;
        orbitRing.material.opacity = fade * 0.94;
        pMats.forEach(m => { m.opacity = fade * 0.78; });
        hexPlates.forEach((hp) => {
          const a = hp.ang + el * 2.0;
          const r = (domeR + 0.15) * pop;
          hp.mesh.position.set(Math.cos(a) * r, hp.yOff, Math.sin(a) * r);
          hp.mesh.lookAt(root.position.x, root.position.y + hp.yOff, root.position.z);
          hp.mesh.rotateX(Math.PI / 2);
        });
      });
    },

    // 3. 極光の聖域（虹色天蓋光柱＋多重回転魔法陣＋上昇プリズム結晶群）
    aurora_sanctuary: (scene, caster, target, tier, attr) => {
      const root = new THREE.Group();
      root.position.set(caster.x, 0.08, caster.z);

      const outerR = 2.4 + tier * 0.65;
      const outerH = 14 + tier * 3;
      const outerBeam = new THREE.Mesh(
        unitGeoV9('cyl16open'),
        new THREE.MeshBasicMaterial({ color: attr.c1, side: THREE.DoubleSide, transparent: true, opacity: 0.48 })
      );
      outerBeam.scale.set(outerR, outerH, outerR);
      outerBeam.position.y = outerH * 0.5;

      const innerR = 1.0 + tier * 0.3;
      const innerH = 15 + tier * 3;
      const innerBeam = new THREE.Mesh(
        unitGeoV9('cyl16open'),
        new THREE.MeshBasicMaterial({ color: attr.c2, side: THREE.DoubleSide, transparent: true, opacity: 0.65 })
      );
      innerBeam.scale.set(innerR, innerH, innerR);
      innerBeam.position.y = innerH * 0.5;

      const hexA = makeCircleRing(1.5 + tier * 0.4, 2.4 + tier * 0.6, attr.c3, 6);
      hexA.position.y = 0.05;
      const hexB = makeCircleRing(2.6 + tier * 0.6, 3.6 + tier * 0.8, attr.c2, 8);
      hexB.position.y = 0.08;
      const shockWave = makeCircleRing(0.5, 1.4, attr.c1, 24);
      shockWave.position.y = 0.12;

      root.add(outerBeam, innerBeam, hexA, hexB, shockWave);

      const prisms = [];
      const cols = [attr.c1, attr.c2, attr.c3, 0x38bdf8];
      const pMats = cols.map(c => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.96 }));
      const pCnt = 9 + tier * 3;
      const pSz = 0.30 + tier * 0.07;
      for (let i = 0; i < pCnt; i++) {
        const pm = new THREE.Mesh(unitGeoV9('octa'), pMats[i % pMats.length]);
        pm.scale.setScalar(pSz);
        const ang = (Math.PI * 2 * i) / pCnt;
        const rad = 0.8 + (i % 4) * (0.65 + tier * 0.2);
        root.add(pm);
        prisms.push({ mesh: pm, ang, rad, off: (i % 5) * 1.4 });
      }

      reg(scene, root, 1.25 + tier * 0.2, (p, el) => {
        const fade = p > 0.72 ? 1 - (p - 0.72) / 0.28 : 1;
        const ow = outerR * (1 + p * 0.6);
        outerBeam.scale.set(ow, outerH, ow);
        outerBeam.rotation.y = el * 2.5;
        outerBeam.material.opacity = fade * 0.48;
        innerBeam.rotation.y = -el * 4.0;
        innerBeam.material.opacity = fade * 0.65;
        hexA.rotation.z = el * 3.5;
        hexA.material.opacity = fade * 0.95;
        hexB.rotation.z = -el * 2.8;
        hexB.material.opacity = fade * 0.95;
        const sw = 1.4 * (1 + p * (3.5 + tier * 0.9));
        shockWave.scale.set(sw, sw, 1);
        shockWave.material.opacity = fade * 0.9;
        pMats.forEach(m => { m.opacity = fade * 0.96; });
        prisms.forEach((pr, idx) => {
          const a = pr.ang + el * 3.2;
          const y = (p * 8.5 + pr.off) % 8.5;
          pr.mesh.position.set(Math.cos(a) * pr.rad, y, Math.sin(a) * pr.rad);
          pr.mesh.rotation.y = el * 7 + idx;
        });
      });
    },

    // 4. 烈空・三日月真空斬（超高速多重三日月真空刃＋着弾クロス衝撃波）
    slash_crescent: (scene, caster, target, tier, attr) => {
      const root = new THREE.Group();
      const dx = target.x - caster.x;
      const dz = target.z - caster.z;
      const dist = Math.max(4.5, Math.hypot(dx, dz) + 2.5);
      const yaw = Math.atan2(dx, dz);
      root.position.set(caster.x, 1.15, caster.z);
      root.rotation.y = yaw;

      const waveCount = 2 + tier;
      const waves = [];
      const bIn = 1.1 + tier * 0.3;
      const bOut = 2.05 + tier * 0.48;
      const bladeGeo = getCachedGeoV9(`crescent_blade_${tier}`, () => new THREE.RingGeometry(bIn, bOut, 20, 1, -Math.PI * 0.45, Math.PI * 0.9));
      const edgeGeo = getCachedGeoV9(`crescent_edge_${tier}`, () => new THREE.TorusGeometry(bOut, 0.09 + tier * 0.03, 6, 20, Math.PI * 0.9));
      const bladeMats = [
        new THREE.MeshBasicMaterial({ color: attr.c1, side: THREE.DoubleSide, transparent: true, opacity: 0.96 }),
        new THREE.MeshBasicMaterial({ color: attr.c2, side: THREE.DoubleSide, transparent: true, opacity: 0.96 })
      ];
      const edgeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 });

      for (let w = 0; w < waveCount; w++) {
        const wg = new THREE.Group();
        const blade = new THREE.Mesh(bladeGeo, bladeMats[w % 2]);
        blade.rotation.x = Math.PI / 2;
        blade.rotation.z = (w - (waveCount - 1) * 0.5) * 0.42;
        wg.add(blade);

        const edge = new THREE.Mesh(edgeGeo, edgeMat);
        edge.rotation.x = Math.PI / 2;
        edge.rotation.z = -Math.PI * 0.45 + (w - (waveCount - 1) * 0.5) * 0.42;
        wg.add(edge);

        wg.position.z = -w * 0.75;
        root.add(wg);
        waves.push(wg);
      }

      const impR = 2.4 + tier * 0.7;
      const impactRing = makeCircleRing(0.5, impR, attr.c1, 24);
      impactRing.position.set(0, -1.05, dist);
      impactRing.visible = false;
      root.add(impactRing);

      reg(scene, root, 0.75 + tier * 0.12, (p, el) => {
        const travel = Math.min(1, p / 0.72) * (dist + 1.5);
        const fade = p > 0.72 ? 1 - (p - 0.72) / 0.28 : 1;
        bladeMats.forEach(m => { m.opacity = fade * 0.96; });
        edgeMat.opacity = fade * 0.95;
        waves.forEach((wg, idx) => {
          wg.position.z = travel - idx * 0.85;
          wg.scale.set(1 + p * 0.65, 1, 1 + p * 0.4);
        });
        if (p >= 0.55) {
          const bp = (p - 0.55) / 0.45;
          impactRing.visible = true;
          const sc = impR * (0.5 + bp * 1.4);
          impactRing.scale.set(sc, sc, 1);
          impactRing.rotation.z = el * 6;
          impactRing.material.opacity = (1 - bp) * 0.95;
        }
      });
    },

    // 5. 星屑メテオ・超巨大隕石落下魔法
    fire_meteor: (scene, caster, target, tier, attr) => {
      const root = new THREE.Group();
      root.position.set(target.x, 0, target.z);

      const zoneR = 2.6 + tier * 0.95;
      const ring = makeCircleRing(zoneR * 0.82, zoneR, attr.c2, 24);
      ring.position.y = 0.06;
      root.add(ring);

      const meteorCount = 1 + tier;
      const meteors = [];
      const rockMat = new THREE.MeshBasicMaterial({ color: 0x3b0707, transparent: true, opacity: 1 });
      const glowMat = new THREE.MeshBasicMaterial({ color: attr.c1, wireframe: true, transparent: true, opacity: 0.95 });
      const tailMat = new THREE.MeshBasicMaterial({ color: attr.c2, side: THREE.DoubleSide, transparent: true, opacity: 0.72 });

      for (let m = 0; m < meteorCount; m++) {
        const ox = m === 0 ? 0 : Math.cos((Math.PI * 2 * m) / meteorCount) * (1.5 + tier * 0.4);
        const oz = m === 0 ? 0 : Math.sin((Math.PI * 2 * m) / meteorCount) * (1.5 + tier * 0.4);
        const radius = (m === 0 ? 1.25 : 0.78) + tier * 0.32;

        const rock = new THREE.Mesh(unitGeoV9('dodeca'), rockMat);
        rock.scale.setScalar(radius);
        const lavaGlow = new THREE.Mesh(unitGeoV9('icosa'), glowMat);
        lavaGlow.scale.setScalar(radius * 1.14);
        const tail = new THREE.Mesh(unitGeoV9('cone10open'), tailMat);
        tail.scale.set(radius * 1.1, radius * 4.5, radius * 1.1);
        tail.position.y = radius * 2.2;

        const mGrp = new THREE.Group();
        mGrp.add(rock, lavaGlow, tail);
        const startH = 14 + m * 3.5;
        mGrp.position.set(ox + 3.5, startH, oz - 2.5);
        root.add(mGrp);
        meteors.push({ grp: mGrp, ox, oz, startH, delay: m * 0.14 });
      }

      const blastSphere = new THREE.Mesh(
        unitGeoV9('sphere'),
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
          blastSphere.scale.setScalar(zoneR * 0.95 * (0.3 + maxImpact * 1.45));
          blastSphere.material.opacity = (1 - maxImpact) * 0.85;
          const rSc = zoneR * (1 + maxImpact * 0.6);
          ring.scale.set(rSc, rSc, 1);
          ring.material.opacity = 1 - maxImpact;
        }
      });
    },

    // 6. 紅蓮業火・螺旋炎柱魔法
    fire_pillar: (scene, caster, target, tier, attr) => {
      const root = new THREE.Group();
      root.position.set(target.x, 0, target.z);

      const baseR = 1.6 + tier * 0.55;
      const magicRing = makeCircleRing(baseR * 0.75, baseR, attr.c1, 24);
      magicRing.position.y = 0.06;
      root.add(magicRing);

      const pH = 7.5 + tier * 2.4;
      const corePillar = new THREE.Mesh(
        unitGeoV9('cyl16open'),
        new THREE.MeshBasicMaterial({ color: attr.c1, side: THREE.DoubleSide, transparent: true, opacity: 0.78 })
      );
      corePillar.position.y = pH * 0.5;
      root.add(corePillar);

      const innerCore = new THREE.Mesh(
        unitGeoV9('cyl16open'),
        new THREE.MeshBasicMaterial({ color: attr.c2, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })
      );
      innerCore.position.y = (pH + 0.7) * 0.5;
      root.add(innerCore);

      const spirals = [];
      const orbCnt = 8 + tier * 3;
      const orbMats = [
        new THREE.MeshBasicMaterial({ color: attr.c2, transparent: true, opacity: 0.95 }),
        new THREE.MeshBasicMaterial({ color: attr.c3, transparent: true, opacity: 0.95 })
      ];
      const orbSz = 0.30 + tier * 0.07;
      for (let i = 0; i < orbCnt; i++) {
        const orb = new THREE.Mesh(unitGeoV9('octa'), orbMats[i % 2]);
        orb.scale.setScalar(orbSz);
        root.add(orb);
        spirals.push({ mesh: orb, phase: (Math.PI * 2 * i) / orbCnt, hOff: (i / orbCnt) * 7.5 });
      }

      reg(scene, root, 1.15 + tier * 0.2, (p, el) => {
        const fade = p > 0.72 ? 1 - (p - 0.72) / 0.28 : 1;
        const grow = Math.min(1, p * 4.5);
        magicRing.rotation.z = el * 4;
        magicRing.material.opacity = fade * 0.95;
        const cw = baseR * 0.7 * (1 + Math.sin(el * 18) * 0.1);
        corePillar.scale.set(cw, pH * grow, cw);
        corePillar.rotation.y = el * 6;
        corePillar.material.opacity = fade * 0.78;
        innerCore.scale.set(baseR * 0.35, (pH + 0.7) * grow, baseR * 0.35);
        innerCore.rotation.y = -el * 8;
        innerCore.material.opacity = fade * 0.9;
        orbMats.forEach(m => { m.opacity = fade * 0.95; });
        spirals.forEach((sp) => {
          const a = sp.phase + el * 8.5;
          const y = ((sp.hOff + el * 7.0) % (7.5 + tier * 2.0)) * grow;
          const r = baseR * 0.85 * (1 - y / 12);
          sp.mesh.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
        });
      });
    },

    // 7. 爆炎ファイア・連装火球弾幕魔法
    fire_burst: (scene, caster, target, tier, attr) => {
      const root = new THREE.Group();
      const count = 3 + tier * 2;
      const fireballs = [];
      const fbMat = new THREE.MeshBasicMaterial({ color: attr.c2, transparent: true, opacity: 0.96 });
      const shMat = new THREE.MeshBasicMaterial({ color: attr.c1, wireframe: true, transparent: true, opacity: 0.9 });
      const fbR = 0.44 + tier * 0.1;

      for (let i = 0; i < count; i++) {
        const spread = (i - (count - 1) * 0.5) * (0.65 + tier * 0.15);
        const perpX = -(target.z - caster.z);
        const perpZ = (target.x - caster.x);
        const len = Math.max(0.01, Math.hypot(perpX, perpZ));
        const nx = perpX / len;
        const nz = perpZ / len;

        const fb = new THREE.Mesh(unitGeoV9('sphere'), fbMat);
        fb.scale.setScalar(fbR);
        const shell = new THREE.Mesh(unitGeoV9('icosa'), shMat);
        shell.scale.setScalar(1.35);
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

      const boomR = 2.0 + tier * 0.7;
      const boom = new THREE.Mesh(
        unitGeoV9('sphere'),
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
          boom.scale.setScalar(boomR * (0.3 + bp * 1.4));
          boom.material.opacity = (1 - bp) * 0.88;
        }
      });
    },

    // 8. 灼熱ブレイズ・溶岩マグマ噴火魔法（地割れリング＋中央火柱＋飛び散る灼熱溶岩弾＋熱波）
    fire_eruption: (scene, caster, target, tier, attr) => {
      const root = new THREE.Group();
      root.position.set(target.x, 0, target.z);
      const rMax = 2.7 + tier * 0.9;

      const lavaPool = new THREE.Mesh(
        unitGeoV9('circle24'),
        new THREE.MeshBasicMaterial({ color: attr.c1, side: THREE.DoubleSide, transparent: true, opacity: 0.82 })
      );
      lavaPool.rotation.x = -Math.PI / 2;
      lavaPool.position.y = 0.05;

      const heatWave = makeCircleRing(rMax * 0.75, rMax * 1.15, attr.c2, 24);
      heatWave.position.y = 0.09;

      const vR = 1.25 + tier * 0.35;
      const vH = 5.8 + tier * 1.8;
      const mainVolcano = new THREE.Mesh(
        unitGeoV9('cyl16open'),
        new THREE.MeshBasicMaterial({ color: attr.c2, side: THREE.DoubleSide, transparent: true, opacity: 0.72 })
      );
      mainVolcano.position.y = vH * 0.5;
      root.add(lavaPool, heatWave, mainVolcano);

      const geysers = [];
      const gyCnt = 5 + tier * 2;
      const gyMats = [
        new THREE.MeshBasicMaterial({ color: attr.c2, transparent: true, opacity: 0.94 }),
        new THREE.MeshBasicMaterial({ color: attr.c1, transparent: true, opacity: 0.94 })
      ];
      const gyR = 0.42 + tier * 0.09;
      const gyH = 3.6 + tier * 1.2;
      for (let i = 0; i < gyCnt; i++) {
        const ang = (Math.PI * 2 * i) / gyCnt;
        const rad = rMax * (0.25 + (i % 3) * 0.28);
        const g = new THREE.Mesh(unitGeoV9('cone8'), gyMats[i % 2]);
        g.scale.set(gyR, gyH, gyR);
        g.position.set(Math.cos(ang) * rad, 1.6, Math.sin(ang) * rad);
        root.add(g);
        geysers.push({ mesh: g, phase: i * 0.4 });
      }

      const magmaBombs = [];
      const mbCnt = 8 + tier * 3;
      const mbMats = [
        new THREE.MeshBasicMaterial({ color: attr.c2, transparent: true, opacity: 0.96 }),
        new THREE.MeshBasicMaterial({ color: attr.c3, transparent: true, opacity: 0.96 })
      ];
      const mbSz = 0.28 + tier * 0.07;
      for (let i = 0; i < mbCnt; i++) {
        const mb = new THREE.Mesh(unitGeoV9('dodeca'), mbMats[i % 2]);
        mb.scale.setScalar(mbSz);
        const ang = (Math.PI * 2 * i) / mbCnt;
        const dist = 1.6 + (i % 4) * (0.85 + tier * 0.25);
        const peakH = 3.5 + (i % 3) * 1.4 + tier * 0.6;
        root.add(mb);
        magmaBombs.push({ mesh: mb, ang, dist, peakH });
      }

      reg(scene, root, 1.25 + tier * 0.2, (p, el) => {
        const fade = p > 0.72 ? 1 - (p - 0.72) / 0.28 : 1;
        const lpSc = rMax * Math.min(1, p * 3.5);
        lavaPool.scale.set(lpSc, lpSc, 1);
        lavaPool.material.opacity = fade * 0.82;
        const hwSc = rMax * 1.15 * (0.8 + p * 1.35);
        heatWave.scale.set(hwSc, hwSc, 1);
        heatWave.rotation.z = el * 3.5;
        heatWave.material.opacity = fade * 0.92;
        const vw = vR * (1 + Math.sin(el * 16) * 0.12);
        mainVolcano.scale.set(vw, vH * Math.sin(p * Math.PI), vw);
        mainVolcano.rotation.y = el * 5;
        mainVolcano.material.opacity = fade * 0.72;
        gyMats.forEach(m => { m.opacity = fade * 0.94; });
        geysers.forEach((gy) => {
          const wave = Math.max(0.15, Math.sin(p * Math.PI + gy.phase));
          gy.mesh.scale.set(gyR, gyH * wave * 1.4, gyR);
          gy.mesh.position.y = wave * (2.0 + tier * 0.55);
        });
        mbMats.forEach(m => { m.opacity = fade * 0.96; });
        magmaBombs.forEach((mb, idx) => {
          const r = mb.dist * p;
          const y = Math.sin(p * Math.PI) * mb.peakH + 0.2;
          mb.mesh.position.set(Math.cos(mb.ang) * r, y, Math.sin(mb.ang) * r);
          mb.mesh.rotation.set(el * 8 + idx, el * 6, 0);
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
      const spikeCnt = 6 + tier * 3;
      const spMats = [
        new THREE.MeshBasicMaterial({ color: attr.c1, transparent: true, opacity: 0.9 }),
        new THREE.MeshBasicMaterial({ color: attr.c2, transparent: true, opacity: 0.9 })
      ];
      for (let i = 0; i < spikeCnt; i++) {
        const isCenter = i === 0;
        const ang = (Math.PI * 2 * i) / Math.max(1, spikeCnt - 1);
        const rad = isCenter ? 0 : zoneR * (0.35 + (i % 3) * 0.22);
        const h = (isCenter ? 3.8 : 2.3) + tier * 0.9;
        const w = (isCenter ? 0.65 : 0.38) + tier * 0.1;

        const sp = new THREE.Mesh(unitGeoV9('cone6'), spMats[i % 2]);
        sp.scale.set(w, h, w);
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
        spMats.forEach(m => { m.opacity = fade * 0.9; });
        spikes.forEach((s) => {
          s.mesh.position.y = s.startY + (s.targetY - s.startY) * thrust;
        });
      });
    },

    // 10. 紫電・天罰落雷魔法
    thunder: (scene, caster, target, tier, attr) => {
      const root = new THREE.Group();
      root.position.set(target.x, 0, target.z);

      const bolts = [];
      const boltCount = 1 + tier;
      const bMats = [
        new THREE.MeshBasicMaterial({ color: attr.c1, transparent: true, opacity: 1 }),
        new THREE.MeshBasicMaterial({ color: attr.c2, transparent: true, opacity: 1 })
      ];
      for (let b = 0; b < boltCount; b++) {
        const ox = b === 0 ? 0 : Math.cos((Math.PI * 2 * b) / boltCount) * (1.2 + tier * 0.35);
        const oz = b === 0 ? 0 : Math.sin((Math.PI * 2 * b) / boltCount) * (1.2 + tier * 0.35);
        const bGrp = new THREE.Group();
        const segs = 6;
        let curX = ox;
        let curZ = oz;
        for (let s = 0; s < segs; s++) {
          const nextX = s === segs - 1 ? ox : ox + (Math.random() - 0.5) * 1.5;
          const nextZ = s === segs - 1 ? oz : oz + (Math.random() - 0.5) * 1.5;
          const segH = 2.1 + tier * 0.35;
          const segR = 0.16 + tier * 0.04;
          const segMesh = new THREE.Mesh(unitGeoV9('cyl8'), bMats[s % 2]);
          segMesh.scale.set(segR, segH, segR);
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

      const srR = 2.3 + tier * 0.85;
      const shockRing = makeCircleRing(0.5, srR, attr.c1, 24);
      shockRing.position.y = 0.08;
      root.add(shockRing);

      reg(scene, root, 0.85 + tier * 0.15, (p, el) => {
        const fade = 1 - p;
        bMats.forEach(m => { m.opacity = fade; });
        bolts.forEach((bg, idx) => {
          bg.visible = Math.sin(el * 55 + idx) > -0.35;
        });
        const sc = srR * (0.5 + p * 1.4);
        shockRing.scale.set(sc, sc, 1);
        shockRing.material.opacity = fade;
      });
    }
  };

  Object.assign(window.KMJ_SKILL_FX_V9.EFFECT_BUILDERS, EFFECT_BUILDERS_PART1);
  window.KMJ_SKILL_FX_V9._makeCircleRing = makeCircleRing;
  window.KMJ_SKILL_FX_V9._unitGeo = unitGeoV9;
  window.KMJ_SKILL_FX_V9._getCachedGeo = getCachedGeoV9;
})();
// ▲▲▲ ここまで【スキルエフェクト専用 game9.js（超軽量・高速化版）1/2】 ▲▲▲
// ▼▼▼ ここから【スキルエフェクト専用 game9.js（超軽量・高速化版）2/2】後半3Dビルダー(11〜18)・非攻撃スキル判定ガード・カットイン・魔法進化スタジオUI・本体フック ▼▼▼
(() => {
  'use strict';

  const V9 = window.KMJ_SKILL_FX_V9;
  if (!V9) {
    console.error('[game9.js 2/2] game9.js 1/2 が先に読み込まれていません。');
    return;
  }

  const reg = V9.register3DAnimation;
  const makeCircleRing = V9._makeCircleRing;
  const unitGeoV9 = V9._unitGeo;
  const getCachedGeoV9 = V9._getCachedGeo;

  // =========================================================
  // 7. 全18種スキル個別3Dエフェクト専用ビルダー（軽量・高迫力後半 11〜18）
  // =========================================================
  const EFFECT_BUILDERS_PART2 = {
    // 11. 旋風円舞・螺旋竜巻魔法（多重竜巻ファンネル＋外周疾風リング＋舞い上がる風刃結晶）
    wind: (scene, caster, target, tier, attr) => {
      const root = new THREE.Group();
      root.position.set(target.x, 0, target.z);
      const maxR = 2.4 + tier * 0.75;

      const groundRing = makeCircleRing(0.6, maxR, attr.c1, 24);
      groundRing.position.y = 0.06;
      const innerRune = makeCircleRing(0.3, maxR * 0.55, attr.c3, 6);
      innerRune.position.y = 0.09;
      root.add(groundRing, innerRune);

      const fH = 6.2 + tier * 1.8;
      const funnelOuter = new THREE.Mesh(
        unitGeoV9('cyl16open'),
        new THREE.MeshBasicMaterial({ color: attr.c1, side: THREE.DoubleSide, transparent: true, opacity: 0.46 })
      );
      funnelOuter.position.y = fH * 0.5;

      const funnelInner = new THREE.Mesh(
        unitGeoV9('cyl16open'),
        new THREE.MeshBasicMaterial({ color: attr.c2, side: THREE.DoubleSide, transparent: true, opacity: 0.68 })
      );
      funnelInner.scale.set(maxR * 0.55, fH + 0.4, maxR * 0.55);
      funnelInner.position.y = (fH + 0.4) * 0.5;
      root.add(funnelOuter, funnelInner);

      const windRings = [];
      const rCnt = 4 + tier * 2;
      const wrMats = [
        new THREE.MeshBasicMaterial({ color: attr.c1, transparent: true, opacity: 0.9 }),
        new THREE.MeshBasicMaterial({ color: attr.c2, transparent: true, opacity: 0.9 })
      ];
      for (let i = 0; i < rCnt; i++) {
        const t = i / rCnt;
        const r = 0.45 + t * maxR * 0.95;
        const tube = 0.07 + tier * 0.02;
        const wrGeo = getCachedGeoV9(`torus_w_${r.toFixed(2)}_${tube.toFixed(2)}`, () => new THREE.TorusGeometry(r, tube, 6, 20));
        const wr = new THREE.Mesh(wrGeo, wrMats[i % 2]);
        wr.rotation.x = Math.PI / 2;
        wr.position.y = 0.3 + t * (5.6 + tier * 1.6);
        root.add(wr);
        windRings.push({ mesh: wr, baseY: wr.position.y, spd: (i % 2 === 0 ? 1 : -1) * (5 + i * 0.5) });
      }

      const blades = [];
      const bCnt = 8 + tier * 3;
      const bMats = [
        new THREE.MeshBasicMaterial({ color: attr.c3, transparent: true, opacity: 0.95 }),
        new THREE.MeshBasicMaterial({ color: attr.c2, transparent: true, opacity: 0.95 })
      ];
      const bSz = 0.30 + tier * 0.06;
      for (let i = 0; i < bCnt; i++) {
        const b = new THREE.Mesh(unitGeoV9('tetra'), bMats[i % 2]);
        b.scale.setScalar(bSz);
        root.add(b);
        blades.push({ mesh: b, ang: (Math.PI * 2 * i) / bCnt, hFrac: (i % 7) / 7 });
      }

      reg(scene, root, 1.2 + tier * 0.2, (p, el) => {
        const fade = p > 0.72 ? 1 - (p - 0.72) / 0.28 : 1;
        groundRing.rotation.z = el * 5;
        groundRing.material.opacity = fade * 0.92;
        innerRune.rotation.z = -el * 7;
        innerRune.material.opacity = fade * 0.95;
        const fw = maxR * 0.85 * (1 + Math.sin(el * 12) * 0.08);
        funnelOuter.rotation.y = el * 7;
        funnelOuter.scale.set(fw, fH * Math.min(1, p * 3.5), fw);
        funnelOuter.material.opacity = fade * 0.46;
        funnelInner.rotation.y = -el * 10;
        funnelInner.material.opacity = fade * 0.68;
        wrMats.forEach(m => { m.opacity = fade * 0.9; });
        windRings.forEach((wr) => {
          wr.mesh.rotation.z = el * wr.spd;
          wr.mesh.position.y = wr.baseY + Math.sin(el * 8 + wr.baseY) * 0.25;
        });
        bMats.forEach(m => { m.opacity = fade * 0.95; });
        blades.forEach((bl, idx) => {
          const h = ((bl.hFrac + p * 1.4) % 1) * (6.0 + tier * 1.6);
          const r = 0.5 + (h / (6.0 + tier * 1.6)) * maxR * 1.1;
          const a = bl.ang + el * 9;
          bl.mesh.position.set(Math.cos(a) * r, h, Math.sin(a) * r);
          bl.mesh.rotation.set(el * 10, el * 8 + idx, 0);
        });
      });
    },

    // 12. 蒼海・大渦潮水柱魔法（大渦潮ディスク＋多重波紋＋噴き上がる水柱＋水沫オーブ）
    water: (scene, caster, target, tier, attr) => {
      const root = new THREE.Group();
      root.position.set(target.x, 0, target.z);
      const maxR = 2.6 + tier * 0.85;

      const whirlpool = new THREE.Mesh(
        unitGeoV9('circle24'),
        new THREE.MeshBasicMaterial({ color: attr.c1, side: THREE.DoubleSide, transparent: true, opacity: 0.72 })
      );
      whirlpool.rotation.x = -Math.PI / 2;
      whirlpool.position.y = 0.05;
      root.add(whirlpool);

      const ripples = [];
      const rpCnt = 2 + tier;
      for (let i = 0; i < rpCnt; i++) {
        const rp = makeCircleRing(0.4 + i * 0.3, 0.85 + i * 0.35, i % 2 === 0 ? attr.c2 : attr.c3, 24);
        rp.position.y = 0.08 + i * 0.02;
        root.add(rp);
        ripples.push({ mesh: rp, baseR: 0.85 + i * 0.35 });
      }

      const spR = 1.2 + tier * 0.4;
      const spH = 6.4 + tier * 2.0;
      const spout = new THREE.Mesh(
        unitGeoV9('cyl16open'),
        new THREE.MeshBasicMaterial({ color: attr.c1, side: THREE.DoubleSide, transparent: true, opacity: 0.72 })
      );
      spout.position.y = spH * 0.5;

      const innerSpout = new THREE.Mesh(
        unitGeoV9('cyl16open'),
        new THREE.MeshBasicMaterial({ color: attr.c2, side: THREE.DoubleSide, transparent: true, opacity: 0.88 })
      );
      innerSpout.position.y = (spH + 0.6) * 0.5;
      root.add(spout, innerSpout);

      const droplets = [];
      const dCnt = 8 + tier * 3;
      const dMats = [
        new THREE.MeshBasicMaterial({ color: attr.c2, transparent: true, opacity: 0.94 }),
        new THREE.MeshBasicMaterial({ color: attr.c3, transparent: true, opacity: 0.94 })
      ];
      const dSz = 0.25 + tier * 0.06;
      for (let i = 0; i < dCnt; i++) {
        const d = new THREE.Mesh(unitGeoV9('sphere'), dMats[i % 2]);
        d.scale.setScalar(dSz);
        root.add(d);
        droplets.push({ mesh: d, ang: (Math.PI * 2 * i) / dCnt, rad: 0.7 + (i % 4) * 0.55, peak: 3.8 + (i % 3) * 1.4 });
      }

      reg(scene, root, 1.2 + tier * 0.2, (p, el) => {
        const fade = p > 0.72 ? 1 - (p - 0.72) / 0.28 : 1;
        const rise = Math.sin(Math.min(1, p * 1.15) * Math.PI * 0.85);
        const wpSc = maxR * Math.min(1, p * 3);
        whirlpool.scale.set(wpSc, wpSc, 1);
        whirlpool.material.opacity = fade * 0.72;
        ripples.forEach((rp, idx) => {
          const wp = (p * 1.8 + idx * 0.25) % 1;
          const rSc = rp.baseR * (0.5 + wp * (maxR * 0.95));
          rp.mesh.scale.set(rSc, rSc, 1);
          rp.mesh.material.opacity = fade * (1 - wp) * 0.95;
        });
        const sw = spR * (1 + Math.sin(el * 14) * 0.1);
        spout.scale.set(sw, spH * rise, sw);
        spout.rotation.y = el * 5;
        spout.material.opacity = fade * 0.72;
        innerSpout.scale.set(spR * 0.5, (spH + 0.6) * rise, spR * 0.5);
        innerSpout.rotation.y = -el * 7;
        innerSpout.material.opacity = fade * 0.88;
        dMats.forEach(m => { m.opacity = fade * 0.94; });
        droplets.forEach((dr) => {
          const a = dr.ang + el * 4;
          const r = dr.rad + p * 1.3;
          const y = Math.sin(p * Math.PI) * dr.peak + 0.2;
          dr.mesh.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
        });
      });
    },

    // 13. 破邪の衝撃・巨岩隆起魔法（亀裂衝撃波＋隆起する巨大岩塊群＋飛散破片＋金剛光輪）
    earth: (scene, caster, target, tier, attr) => {
      const root = new THREE.Group();
      root.position.set(target.x, 0, target.z);
      const zoneR = 2.6 + tier * 0.85;

      const quakeRing1 = makeCircleRing(zoneR * 0.72, zoneR, attr.c1, 8);
      quakeRing1.position.y = 0.06;
      const quakeRing2 = makeCircleRing(0.4, 1.4, attr.c2, 24);
      quakeRing2.position.y = 0.09;
      root.add(quakeRing1, quakeRing2);

      const rocks = [];
      const rockCnt = 5 + tier * 2;
      const rkMats = [
        new THREE.MeshBasicMaterial({ color: attr.c3, transparent: true, opacity: 0.96 }),
        new THREE.MeshBasicMaterial({ color: attr.c1, transparent: true, opacity: 0.96 })
      ];
      const edgeMat = new THREE.MeshBasicMaterial({ color: attr.c2, wireframe: true, transparent: true, opacity: 0.9 });

      for (let i = 0; i < rockCnt; i++) {
        const isCenter = i === 0;
        const ang = (Math.PI * 2 * i) / Math.max(1, rockCnt - 1);
        const rad = isCenter ? 0 : zoneR * (0.35 + (i % 3) * 0.22);
        const sz = (isCenter ? 1.05 : 0.65) + tier * 0.22;

        const rk = new THREE.Mesh(unitGeoV9('dodeca'), rkMats[i % 2]);
        rk.scale.setScalar(sz);
        const edge = new THREE.Mesh(unitGeoV9('dodeca'), edgeMat);
        edge.scale.setScalar(1.06);
        rk.add(edge);
        rk.position.set(Math.cos(ang) * rad, -sz, Math.sin(ang) * rad);
        rk.rotation.set(i * 0.7, i * 1.1, i * 0.5);
        root.add(rk);
        rocks.push({ mesh: rk, startY: -sz, targetY: sz * (isCenter ? 1.15 : 0.75) });
      }

      const debris = [];
      const dbCnt = 7 + tier * 3;
      const dbMats = [
        new THREE.MeshBasicMaterial({ color: attr.c2, transparent: true, opacity: 0.95 }),
        new THREE.MeshBasicMaterial({ color: attr.c1, transparent: true, opacity: 0.95 })
      ];
      const dbSz = 0.28 + tier * 0.06;
      for (let i = 0; i < dbCnt; i++) {
        const db = new THREE.Mesh(unitGeoV9('tetra'), dbMats[i % 2]);
        db.scale.setScalar(dbSz);
        root.add(db);
        debris.push({ mesh: db, ang: (Math.PI * 2 * i) / dbCnt, dist: 1.5 + (i % 4) * 0.7, peak: 3.2 + (i % 3) * 1.1 });
      }

      reg(scene, root, 1.15 + tier * 0.2, (p, el) => {
        const thrust = Math.min(1, p / 0.22);
        const fade = p > 0.72 ? 1 - (p - 0.72) / 0.28 : 1;
        quakeRing1.rotation.z = el * 2;
        quakeRing1.material.opacity = fade * 0.95;
        const qrSc = 1.4 * (1 + p * (2.6 + tier * 0.7));
        quakeRing2.scale.set(qrSc, qrSc, 1);
        quakeRing2.material.opacity = fade * 0.9;
        rkMats.forEach(m => { m.opacity = fade * 0.96; });
        edgeMat.opacity = fade * 0.9;
        rocks.forEach((rk) => {
          rk.mesh.position.y = rk.startY + (rk.targetY - rk.startY) * thrust;
        });
        dbMats.forEach(m => { m.opacity = fade * 0.95; });
        debris.forEach((db, idx) => {
          const r = db.dist * p;
          const y = Math.sin(p * Math.PI) * db.peak + 0.15;
          db.mesh.position.set(Math.cos(db.ang) * r, y, Math.sin(db.ang) * r);
          db.mesh.rotation.set(el * 9 + idx, el * 7, 0);
        });
      });
    },

    // 14. 聖光の癒し・天照光輪魔法（三重回転聖魔法陣＋天降聖光柱＋二重天使光輪＋舞い上がる光の結晶群）
    holy_heal: (scene, caster, target, tier, attr) => {
      const root = new THREE.Group();
      root.position.set(caster.x, 0, caster.z);
      const zoneR = 2.3 + tier * 0.65;

      const rune1 = makeCircleRing(zoneR * 0.78, zoneR, attr.c1, 6);
      rune1.position.y = 0.06;
      const rune2 = makeCircleRing(zoneR * 0.45, zoneR * 0.68, attr.c3, 8);
      rune2.position.y = 0.09;
      const healWave = makeCircleRing(0.4, 1.2, attr.c2, 24);
      healWave.position.y = 0.12;
      root.add(rune1, rune2, healWave);

      const hbR = 1.5 + tier * 0.45;
      const hbH = 12 + tier * 2.5;
      const holyBeam = new THREE.Mesh(
        unitGeoV9('cyl16open'),
        new THREE.MeshBasicMaterial({ color: attr.c1, side: THREE.DoubleSide, transparent: true, opacity: 0.42 })
      );
      holyBeam.scale.set(hbR, hbH, hbR);
      holyBeam.position.y = hbH * 0.5;

      const cbR = 0.65 + tier * 0.2;
      const coreBeam = new THREE.Mesh(
        unitGeoV9('cyl16open'),
        new THREE.MeshBasicMaterial({ color: attr.c2, side: THREE.DoubleSide, transparent: true, opacity: 0.68 })
      );
      coreBeam.scale.set(cbR, hbH + 1, cbR);
      coreBeam.position.y = (hbH + 1) * 0.5;
      root.add(holyBeam, coreBeam);

      const halos = [];
      const hlCnt = 2 + tier;
      const hlMats = [
        new THREE.MeshBasicMaterial({ color: attr.c1, transparent: true, opacity: 0.96 }),
        new THREE.MeshBasicMaterial({ color: attr.c3, transparent: true, opacity: 0.96 })
      ];
      for (let i = 0; i < hlCnt; i++) {
        const r = 1.15 + i * 0.35;
        const tube = 0.07 + tier * 0.02;
        const hlGeo = getCachedGeoV9(`torus_hl_${r.toFixed(2)}_${tube.toFixed(2)}`, () => new THREE.TorusGeometry(r, tube, 6, 24));
        const hl = new THREE.Mesh(hlGeo, hlMats[i % 2]);
        hl.rotation.x = Math.PI / 2;
        hl.position.y = 0.4 + i * 0.65;
        root.add(hl);
        halos.push(hl);
      }

      const motes = [];
      const mtCnt = 9 + tier * 3;
      const mtMats = [
        new THREE.MeshBasicMaterial({ color: attr.c3, transparent: true, opacity: 0.96 }),
        new THREE.MeshBasicMaterial({ color: attr.c1, transparent: true, opacity: 0.96 })
      ];
      const mtSz = 0.26 + tier * 0.06;
      for (let i = 0; i < mtCnt; i++) {
        const mt = new THREE.Mesh(unitGeoV9('octa'), mtMats[i % 2]);
        mt.scale.setScalar(mtSz);
        root.add(mt);
        motes.push({ mesh: mt, ang: (Math.PI * 2 * i) / mtCnt, rad: 0.6 + (i % 4) * 0.48, off: (i % 5) * 1.1 });
      }

      reg(scene, root, 1.3 + tier * 0.22, (p, el) => {
        const fade = p > 0.72 ? 1 - (p - 0.72) / 0.28 : 1;
        rune1.rotation.z = el * 3.2;
        rune1.material.opacity = fade * 0.95;
        rune2.rotation.z = -el * 4.5;
        rune2.material.opacity = fade * 0.95;
        const hwSc = 1.2 * (1 + p * (2.8 + tier * 0.75));
        healWave.scale.set(hwSc, hwSc, 1);
        healWave.material.opacity = fade * 0.9;
        holyBeam.rotation.y = el * 2.5;
        holyBeam.material.opacity = fade * 0.42;
        coreBeam.rotation.y = -el * 4.0;
        coreBeam.material.opacity = fade * 0.68;
        hlMats.forEach(m => { m.opacity = fade * 0.96; });
        halos.forEach((hl, idx) => {
          hl.position.y = (0.4 + idx * 0.55) + p * (2.6 + tier * 0.5);
          hl.rotation.z = el * (idx % 2 === 0 ? 4 : -4);
        });
        mtMats.forEach(m => { m.opacity = fade * 0.96; });
        motes.forEach((mt, idx) => {
          const a = mt.ang + el * 3.0;
          const y = (p * 6.5 + mt.off) % 6.5;
          mt.mesh.position.set(Math.cos(a) * mt.rad, y, Math.sin(a) * mt.rad);
          mt.mesh.rotation.y = el * 6 + idx;
        });
      });
    },

    // 15. 黒蝕・ブラックホール魔法（漆黒特異点＋降着円盤＋重力歪みリング＋吸い込まれる闇結晶＋終焉ノヴァ）
    dark: (scene, caster, target, tier, attr) => {
      const root = new THREE.Group();
      root.position.set(target.x, 1.45, target.z);
      const coreR = 0.85 + tier * 0.28;

      const blackCore = new THREE.Mesh(
        unitGeoV9('sphere'),
        new THREE.MeshBasicMaterial({ color: 0x05020a, transparent: true, opacity: 0.98 })
      );
      blackCore.scale.setScalar(coreR);
      const eventHorizon = new THREE.Mesh(
        unitGeoV9('icosa'),
        new THREE.MeshBasicMaterial({ color: attr.c1, wireframe: true, transparent: true, opacity: 0.92 })
      );
      eventHorizon.scale.setScalar(coreR * 1.18);
      root.add(blackCore, eventHorizon);

      const disk1 = makeCircleRing(coreR * 1.25, coreR * 2.8, attr.c1, 24);
      disk1.rotation.x = Math.PI / 2 - 0.35;

      const disk2 = makeCircleRing(coreR * 1.4, coreR * 2.4, attr.c2, 24);
      disk2.rotation.x = Math.PI / 2 + 0.38;
      root.add(disk1, disk2);

      const floorGravity = makeCircleRing(coreR * 1.5, coreR * 3.1, attr.c3, 8);
      floorGravity.position.y = -1.38;
      root.add(floorGravity);

      const shards = [];
      const shCnt = 8 + tier * 3;
      const shMats = [
        new THREE.MeshBasicMaterial({ color: attr.c2, transparent: true, opacity: 0.95 }),
        new THREE.MeshBasicMaterial({ color: attr.c3, transparent: true, opacity: 0.95 })
      ];
      const shSz = 0.26 + tier * 0.06;
      for (let i = 0; i < shCnt; i++) {
        const sh = new THREE.Mesh(unitGeoV9('octa'), shMats[i % 2]);
        sh.scale.setScalar(shSz);
        root.add(sh);
        shards.push({ mesh: sh, ang: (Math.PI * 2 * i) / shCnt, startR: coreR * 3.4, yOff: ((i % 5) - 2) * 0.45 });
      }

      const novaBurst = new THREE.Mesh(
        unitGeoV9('sphere'),
        new THREE.MeshBasicMaterial({ color: attr.c2, transparent: true, opacity: 0 })
      );
      root.add(novaBurst);

      reg(scene, root, 1.3 + tier * 0.22, (p, el) => {
        if (p < 0.72) {
          const pull = p / 0.72;
          const pulse = coreR * (1 + Math.sin(el * 18) * 0.08);
          blackCore.scale.setScalar(pulse);
          eventHorizon.rotation.y = el * 5;
          eventHorizon.rotation.x = el * 3;
          disk1.rotation.z = el * 8;
          disk2.rotation.z = -el * 7;
          floorGravity.rotation.z = el * 4;
          shards.forEach((sh) => {
            const r = sh.startR * (1 - pull * 0.85);
            const a = sh.ang + el * 9;
            sh.mesh.position.set(Math.cos(a) * r, sh.yOff * (1 - pull), Math.sin(a) * r);
            sh.mesh.rotation.y = el * 10;
          });
        } else {
          const bp = (p - 0.72) / 0.28;
          const fade = 1 - bp;
          blackCore.scale.setScalar(coreR * (1 + bp * 1.4));
          blackCore.material.opacity = fade * 0.98;
          eventHorizon.material.opacity = fade * 0.92;
          const d1Sc = coreR * 2.8 * (1 + bp * 1.2);
          disk1.scale.set(d1Sc, d1Sc, 1);
          disk1.material.opacity = fade * 0.86;
          const d2Sc = coreR * 2.4 * (1 + bp * 1.2);
          disk2.scale.set(d2Sc, d2Sc, 1);
          disk2.material.opacity = fade * 0.82;
          floorGravity.material.opacity = fade * 0.9;
          shards.forEach((sh) => { sh.mesh.visible = false; });
          novaBurst.scale.setScalar(coreR * 2.8 * (0.5 + bp * 1.5));
          novaBurst.material.opacity = fade * 0.85;
        }
      });
    },

    // 16. 呪詛・魔界瘴気魔法（呪印魔法陣＋立ち昇る瘴気柱＋浮遊猛毒バブル）
    poison: (scene, caster, target, tier, attr) => {
      const root = new THREE.Group();
      root.position.set(target.x, 0, target.z);
      const zoneR = 2.4 + tier * 0.8;

      const swampDisk = new THREE.Mesh(
        unitGeoV9('circle24'),
        new THREE.MeshBasicMaterial({ color: attr.c1, side: THREE.DoubleSide, transparent: true, opacity: 0.62 })
      );
      swampDisk.rotation.x = -Math.PI / 2;
      swampDisk.position.y = 0.05;

      const curseRune = makeCircleRing(zoneR * 0.76, zoneR * 1.05, attr.c2, 6);
      curseRune.position.y = 0.08;

      const mH = 4.6 + tier * 1.4;
      const miasmaCol = new THREE.Mesh(
        unitGeoV9('cyl16open'),
        new THREE.MeshBasicMaterial({ color: attr.c1, side: THREE.DoubleSide, transparent: true, opacity: 0.36 })
      );
      miasmaCol.scale.set(zoneR * 0.85, mH, zoneR * 0.85);
      miasmaCol.position.y = mH * 0.5;
      root.add(swampDisk, curseRune, miasmaCol);

      const bubbles = [];
      const bCnt = 8 + tier * 3;
      const bMats = [
        new THREE.MeshBasicMaterial({ color: attr.c3, transparent: true, opacity: 0.9 }),
        new THREE.MeshBasicMaterial({ color: attr.c2, transparent: true, opacity: 0.9 }),
        new THREE.MeshBasicMaterial({ color: attr.c1, transparent: true, opacity: 0.9 })
      ];
      for (let i = 0; i < bCnt; i++) {
        const baseSz = 0.28 + (i % 3) * 0.09 + tier * 0.05;
        const bb = new THREE.Mesh(unitGeoV9('sphere'), bMats[i % 3]);
        root.add(bb);
        bubbles.push({
          mesh: bb,
          baseSz,
          ang: (Math.PI * 2 * i) / bCnt,
          rad: 0.4 + (i % 4) * (zoneR * 0.22),
          spd: 2.2 + (i % 3) * 0.8,
          off: (i % 4) * 0.8
        });
      }

      reg(scene, root, 1.25 + tier * 0.2, (p, el) => {
        const fade = p > 0.72 ? 1 - (p - 0.72) / 0.28 : 1;
        const sdSc = zoneR * Math.min(1, p * 3.2);
        swampDisk.scale.set(sdSc, sdSc, 1);
        swampDisk.material.opacity = fade * 0.62;
        curseRune.rotation.z = -el * 3.5;
        curseRune.material.opacity = fade * 0.95;
        miasmaCol.rotation.y = el * 3;
        miasmaCol.material.opacity = fade * 0.36;
        bMats.forEach(m => { m.opacity = fade * 0.9; });
        bubbles.forEach((b) => {
          const a = b.ang + el * 2.5;
          const y = (p * b.spd * 2.2 + b.off) % (4.2 + tier * 1.2);
          const sc = b.baseSz * (0.8 + Math.sin(el * 10 + b.off) * 0.25);
          b.mesh.scale.setScalar(sc);
          b.mesh.position.set(Math.cos(a) * b.rad, y, Math.sin(a) * b.rad);
        });
      });
    },

    // 17. 星屑・銀河流星魔法（銀河回転ディスク＋降り注ぐ星屑流星群＋着弾スターバースト）
    star: (scene, caster, target, tier, attr) => {
      const root = new THREE.Group();
      root.position.set(target.x, 0, target.z);
      const zoneR = 2.6 + tier * 0.85;

      const galaxyRing1 = makeCircleRing(zoneR * 0.72, zoneR, attr.c1, 5);
      galaxyRing1.position.y = 0.06;
      const galaxyRing2 = makeCircleRing(zoneR * 0.35, zoneR * 0.65, attr.c3, 24);
      galaxyRing2.position.y = 0.09;
      root.add(galaxyRing1, galaxyRing2);

      const stars = [];
      const starCnt = 4 + tier * 2;
      const cols = [attr.c1, attr.c2, attr.c3, 0xffffff];
      const stMats = cols.map(c => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.96 }));
      const coreSz = 0.45 + tier * 0.12;
      const tailR = 0.34 + tier * 0.08;
      const tailH = 3.2 + tier * 0.8;

      for (let i = 0; i < starCnt; i++) {
        const ang = (Math.PI * 2 * i) / starCnt;
        const rad = i === 0 ? 0 : zoneR * (0.35 + (i % 3) * 0.22);
        const tx = Math.cos(ang) * rad;
        const tz = Math.sin(ang) * rad;

        const sGrp = new THREE.Group();
        const starCore = new THREE.Mesh(unitGeoV9('octa'), stMats[i % stMats.length]);
        starCore.scale.setScalar(coreSz);
        const starTail = new THREE.Mesh(unitGeoV9('cone10open'), stMats[(i + 1) % stMats.length]);
        starTail.scale.set(tailR, tailH, tailR);
        starTail.position.y = tailH * 0.5;
        sGrp.add(starCore, starTail);

        const startH = 11 + (i % 3) * 2.5;
        sGrp.position.set(tx + 2.2, startH, tz - 1.8);
        root.add(sGrp);
        stars.push({ grp: sGrp, tx, tz, startH, delay: (i % 4) * 0.09 });
      }

      const nvR = zoneR * 1.15;
      const novaWave = makeCircleRing(0.5, nvR, attr.c2, 24);
      novaWave.position.y = 0.12;
      novaWave.visible = false;
      root.add(novaWave);

      reg(scene, root, 1.2 + tier * 0.2, (p, el) => {
        const fade = p > 0.74 ? 1 - (p - 0.74) / 0.26 : 1;
        galaxyRing1.rotation.z = el * 4;
        galaxyRing1.material.opacity = fade * 0.95;
        galaxyRing2.rotation.z = -el * 5;
        galaxyRing2.material.opacity = fade * 0.95;
        stMats.forEach(m => { m.opacity = fade * 0.96; });

        let anyHit = false;
        stars.forEach((st) => {
          const lp = Math.max(0, Math.min(1, (p - st.delay) / 0.55));
          if (lp < 1) {
            const ease = lp * lp;
            st.grp.position.set(
              st.tx + (1 - ease) * 2.2,
              st.startH * (1 - ease) + 0.4,
              st.tz - (1 - ease) * 1.8
            );
            st.grp.rotation.y = el * 10;
          } else {
            st.grp.visible = false;
            anyHit = true;
          }
        });

        if (anyHit) {
          const bp = Math.min(1, Math.max(0, (p - 0.5) / 0.5));
          novaWave.visible = true;
          const sc = nvR * (0.5 + bp * 1.35);
          novaWave.scale.set(sc, sc, 1);
          novaWave.material.opacity = (1 - bp) * 0.95;
        }
      });
    },

    // 18. 秘剣・無限光剣陣（全周囲展開する光の聖剣群＋回転剣陣魔法陣＋中央への一斉収束突撃＋十字光閃バースト）
    sword: (scene, caster, target, tier, attr) => {
      const root = new THREE.Group();
      root.position.set(target.x, 0, target.z);
      const arenaR = 2.8 + tier * 0.85;

      const bladeRune1 = makeCircleRing(arenaR * 0.82, arenaR, attr.c1, 8);
      bladeRune1.position.y = 0.06;
      const bladeRune2 = makeCircleRing(0.6, arenaR * 0.55, attr.c3, 6);
      bladeRune2.position.y = 0.09;
      root.add(bladeRune1, bladeRune2);

      const swords = [];
      const swCnt = 6 + tier * 3;
      const bMats = [
        new THREE.MeshBasicMaterial({ color: attr.c1, transparent: true, opacity: 0.96 }),
        new THREE.MeshBasicMaterial({ color: attr.c2, transparent: true, opacity: 0.96 })
      ];
      const guardMat = new THREE.MeshBasicMaterial({ color: attr.c3, transparent: true, opacity: 0.96 });
      const hiltMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 });

      const bR = 0.16 + tier * 0.04;
      const bL = 2.1 + tier * 0.5;
      const gW = 0.65 + tier * 0.15;

      for (let i = 0; i < swCnt; i++) {
        const ang = (Math.PI * 2 * i) / swCnt;
        const swGrp = new THREE.Group();

        const blade = new THREE.Mesh(unitGeoV9('cone4'), bMats[i % 2]);
        blade.scale.set(bR, bL, bR);
        blade.rotation.x = Math.PI / 2;
        blade.position.z = 0.55;

        const guard = new THREE.Mesh(unitGeoV9('box'), guardMat);
        guard.scale.set(gW, 0.1, 0.14);
        guard.position.z = -0.35;

        const hilt = new THREE.Mesh(unitGeoV9('cyl8'), hiltMat);
        hilt.scale.set(0.06, 0.55, 0.06);
        hilt.rotation.x = Math.PI / 2;
        hilt.position.z = -0.62;

        swGrp.add(blade, guard, hilt);
        const startY = 2.4 + (i % 3) * 0.65;
        swGrp.position.set(Math.cos(ang) * arenaR, startY, Math.sin(ang) * arenaR);
        swGrp.lookAt(0, 0.9, 0);
        root.add(swGrp);
        swords.push({ grp: swGrp, ang, startY });
      }

      const csR = 1.7 + tier * 0.55;
      const crossSlash = new THREE.Mesh(
        unitGeoV9('sphere'),
        new THREE.MeshBasicMaterial({ color: attr.c3, transparent: true, opacity: 0 })
      );
      crossSlash.position.y = 1.0;
      root.add(crossSlash);

      reg(scene, root, 1.15 + tier * 0.2, (p, el) => {
        const fade = p > 0.76 ? 1 - (p - 0.76) / 0.24 : 1;
        bladeRune1.rotation.z = el * 4;
        bladeRune1.material.opacity = fade * 0.95;
        bladeRune2.rotation.z = -el * 5;
        bladeRune2.material.opacity = fade * 0.95;
        bMats.forEach(m => { m.opacity = fade * 0.96; });
        guardMat.opacity = fade * 0.96;
        hiltMat.opacity = fade * 0.95;

        if (p < 0.48) {
          const spinP = p / 0.48;
          swords.forEach((sw) => {
            const a = sw.ang + spinP * Math.PI * 1.5;
            sw.grp.position.set(Math.cos(a) * arenaR, sw.startY, Math.sin(a) * arenaR);
            sw.grp.lookAt(root.position.x, root.position.y + 0.9, root.position.z);
          });
        } else {
          const strikeP = Math.min(1, (p - 0.48) / 0.26);
          const curR = arenaR * (1 - strikeP * 0.92);
          swords.forEach((sw) => {
            const a = sw.ang + Math.PI * 1.5;
            sw.grp.position.set(Math.cos(a) * curR, sw.startY * (1 - strikeP) + 0.85 * strikeP, Math.sin(a) * curR);
            sw.grp.lookAt(root.position.x, root.position.y + 0.85, root.position.z);
          });

          if (strikeP >= 0.85) {
            const bp = (p - 0.70) / 0.30;
            crossSlash.scale.setScalar(csR * (0.4 + Math.max(0, bp) * 1.4));
            crossSlash.material.opacity = fade * 0.85;
          }
        }
      });
    }
  };

  Object.assign(V9.EFFECT_BUILDERS, EFFECT_BUILDERS_PART2);

  // =========================================================
  // 8. スキル識別・非攻撃系スキル判定・進化状態管理
  // =========================================================
  const TIER_LABELS_V9 = ['通常 ★1', '【真】★2', '【極】★3', '【神】★4'];
  const TIER_MULTS_V9 = [1.0, 1.5, 2.3, 3.6];

  function getCustomSkillConfigV9(game) {
    if (!game?.saveData) return {};
    if (!game.saveData.skillCustomV9 || typeof game.saveData.skillCustomV9 !== 'object') {
      game.saveData.skillCustomV9 = {};
    }
    return game.saveData.skillCustomV9;
  }

  function findProfileByIdV9(attrId) {
    return V9.ATTRIBUTES.find(a => a.id === attrId) || null;
  }

  function inferDefaultProfileV9(rawText) {
    const txt = String(rawText || '');
    for (const p of V9.ATTRIBUTES) {
      if (p.match.test(txt)) return p;
    }
    return findProfileByIdV9('sword') || V9.ATTRIBUTES[0];
  }

  function isNonAttackSkillObjV9(game, skillObj, info = null) {
    if (info?.attr?.isNonAttack === true) return true;
    if (!skillObj && !info) return false;

    const sk = skillObj || {};
    if (sk.isNonAttack === true || sk.nonAttack === true || sk.noDamage === true) return true;
    if (sk.isHeal === true || sk.isBuff === true || sk.isShield === true || sk.isSupport === true) return true;

    const typeStr = String(sk.type || sk.category || sk.skillType || sk.kind || '').toLowerCase();
    if (/heal|buff|shield|guard|support|sanctuary|aura|cure|recovery|回復|防御|補助|バフ|聖域/.test(typeStr)) {
      return true;
    }

    const baseText = `${sk._v9BaseName || ''} ${sk.baseName || ''} ${sk.id || ''} ${sk.skillId || ''} ${sk.desc || ''} ${sk.description || ''}`;
    if (/聖光の癒し|イージス|極光の聖域|覇王の咆哮|ヒール|回復|治癒|守護|鉄壁|バリア|シールド|結界|鼓舞|闘気|覚醒|sanctuary|aegis|warcry|heal|cure|shield|buff/.test(baseText)) {
      return true;
    }

    return false;
  }

  function getSkillInfoV9(game, skillObj, slotIdx = -1) {
    const sk = skillObj || {};
    if (!sk._v9BaseName) {
      const rawInit = String(sk.baseName || sk.name || sk.title || `スキル${slotIdx >= 0 ? slotIdx + 1 : ''}`);
      sk._v9BaseName = rawInit
        .replace(/^【(?:真|極|神)】/, '')
        .replace(/^(?:覇王闘気|絶対防壁|極光祝福|蒼穹双月|紅蓮天隕|螺旋業火|連装爆炎|地殻灼熱|氷晶零度|紫電一閃|翠嵐烈風|蒼海激流|剛岩破邪|聖光煌めき|黒蝕冥界|猛毒瘴気|星屑流星|蒼穹剣閃)・/, '')
        .trim() || rawInit;
    }

    const origName = sk._v9BaseName;
    const sid = String(sk.id || sk.skillId || `slot_${slotIdx}_${origName}`);
    const customMap = getCustomSkillConfigV9(game);
    const custom = customMap[sid] || {};

    const d = game?.saveData || {};
    const lvFromSave = Number(
      d.skills?.[sid] ?? d.skillLevels?.[sid] ?? d.skillLvs?.[sid] ?? sk.lv ?? sk.level ?? 1
    );
    const skillLv = Math.max(1, lvFromSave);

    let autoTier = 0;
    if (skillLv >= 100) autoTier = 3;
    else if (skillLv >= 50) autoTier = 2;
    else if (skillLv >= 10) autoTier = 1;

    const tier = (typeof custom.tier === 'number' && custom.tier >= 0 && custom.tier <= 3)
      ? custom.tier
      : autoTier;

    const attr = (custom.attrId && findProfileByIdV9(custom.attrId))
      ? findProfileByIdV9(custom.attrId)
      : inferDefaultProfileV9(`${origName} ${sk.id || ''} ${sk.desc || ''}`);

    const namesArr = attr.names(origName);
    const evolvedName = namesArr[tier] || origName;
    const mpCost = Number(sk.mp ?? sk.mpCost ?? sk.cost ?? 10);
    const powerMult = TIER_MULTS_V9[tier] || 1.0;
    const isNonAttack = isNonAttackSkillObjV9(game, sk, { attr });

    return {
      sid,
      origName,
      evolvedName,
      tier,
      tierLabel: TIER_LABELS_V9[tier] || TIER_LABELS_V9[0],
      attr,
      theme: { label: attr.label, cardType: attr.cardType },
      skillLv,
      mpCost,
      powerMult,
      isNonAttack
    };
  }

  function getAllSkillsListV9(game) {
    const g = game || window.__kmjInstance || window.game || window.app || window.mmorpg;
    if (!g) return [];
    const list = [];
    const seen = new Set();
    const pushUnique = (sk) => {
      if (!sk || typeof sk !== 'object') return;
      const key = sk.id || sk.skillId || sk._v9BaseName || sk.name;
      if (!key || seen.has(key)) return;
      seen.add(key);
      list.push(sk);
    };

    if (Array.isArray(g.skills)) g.skills.forEach(pushUnique);
    if (Array.isArray(g.skillSlots)) g.skillSlots.forEach(pushUnique);
    if (Array.isArray(g.equippedSkills)) g.equippedSkills.forEach(pushUnique);
    if (typeof SKILLS !== 'undefined') {
      if (Array.isArray(SKILLS)) SKILLS.forEach(pushUnique);
      else if (SKILLS && typeof SKILLS === 'object') Object.values(SKILLS).forEach(pushUnique);
    }
    return list;
  }

  function syncAllSkillsV9(game) {
    const g = game || window.__kmjInstance || window.game || window.app || window.mmorpg;
    if (!g) return;
    const all = getAllSkillsListV9(g);
    all.forEach((sk, idx) => {
      const info = getSkillInfoV9(g, sk, idx);
      sk.name = info.evolvedName;
      if ('title' in sk) sk.title = info.evolvedName;
      sk._v9PowerMult = info.powerMult;
      sk._v9AttrId = info.attr.id;
      sk._v9IsNonAttack = info.isNonAttack;
    });
    g.refreshAllHUD?.();
  }

  // =========================================================
  // 9. スペルカード風カットイン演出＆非攻撃サポート効果適用
  // =========================================================
  function showSpellCardCutinV9(game, info) {
    if (!info) return;
    let layer = document.getElementById('kmj-v9-cutin-layer');
    if (!layer) {
      layer = document.createElement('div');
      layer.id = 'kmj-v9-cutin-layer';
      document.body.appendChild(layer);
    }
    layer.innerHTML = '';

    const kaomoji = String(game?.saveData?.kaomoji || game?.player?.kaomoji || '(・ω・)');
    const pName = String(game?.saveData?.name || game?.saveData?.playerName || '冒険者');
    const stars = '★'.repeat(info.tier + 1);
    const kindBadge = info.isNonAttack ? '🛡️ 補助・回復・結界' : '⚔️ 攻撃スペル';

    layer.innerHTML = `
      <div class="kmj-v9-flash" style="background:radial-gradient(circle at 75% 20%, rgba(253,224,71,0.32), transparent 68%);"></div>
      <div class="kmj-v9-line-top"></div>
      <div class="kmj-v9-line-bot"></div>
      <div class="kmj-v9-banner" style="background:${info.attr.bgGrad};">
        <div class="kmj-v9-ring-1"></div>
        <div class="kmj-v9-ring-2"></div>
        <div class="kmj-v9-banner-inner">
          <div class="kmj-v9-avatar">${kaomoji}</div>
          <div>
            <div style="font-size:10px;font-weight:900;color:#fde047;letter-spacing:0.06em;">
              ✦ ${info.attr.cardType}｜${stars}（${kindBadge}）
            </div>
            <div style="font-size:15px;font-weight:900;color:#ffffff;text-shadow:0 2px 6px rgba(0,0,0,0.8);margin:2px 0;">
              ${info.evolvedName}
            </div>
            <div style="font-size:10px;color:#e0f2fe;font-weight:800;">
              術者: ${pName}（Lv.${info.skillLv}）
            </div>
          </div>
        </div>
      </div>
    `;

    clearTimeout(window._kmjV9CutinTimer);
    window._kmjV9CutinTimer = setTimeout(() => {
      if (layer) layer.innerHTML = '';
    }, 2200);
  }

  function applyNonAttackSupportEffectV9(game, info) {
    if (!game || !info?.isNonAttack) return;
    const p = game.player;
    const d = game.saveData;
    const tier = info.tier || 0;
    const sup = info.attr?.supportType || 'heal';

    if (sup === 'sanctuary') {
      V9.spawnAuroraSanctuaryField(game, p, info);
      return;
    }

    const st = typeof game.calcDerivedStats === 'function'
      ? game.calcDerivedStats()
      : (typeof game.getPlayerStats === 'function' ? game.getPlayerStats() : {});
    const maxHp = Math.max(Number(st?.maxHp || 0), Number(p?.maxHp || 0), Number(d?.maxHp || 100));
    const maxMp = Math.max(Number(st?.maxMp || 0), Number(p?.maxMp || 0), Number(d?.maxMp || 100));

    if (sup === 'heal') {
      const healHp = Math.max(15, Math.floor(maxHp * (0.32 + tier * 0.16)));
      const healMp = Math.max(10, Math.floor(maxMp * (0.15 + tier * 0.08)));
      if (p && typeof p.hp === 'number') p.hp = Math.min(maxHp, p.hp + healHp);
      if (d && typeof d.hp === 'number') d.hp = Math.min(maxHp, d.hp + healHp);
      if (p && typeof p.mp === 'number') p.mp = Math.min(maxMp, p.mp + healMp);
      if (d && typeof d.mp === 'number') d.mp = Math.min(maxMp, d.mp + healMp);
      (game.spawnFloatText || game.spawnFloatingText)?.call(game, p?.pos, `💖+${healHp}`, '#fde047');
      game.showAlertBanner?.(`💖 ${info.evolvedName}！HP +${healHp} / MP +${healMp} 回復`, 1800);
    } else if (sup === 'shield') {
      const barrier = Math.max(30, Math.floor(maxHp * (0.45 + tier * 0.25)));
      if (p) {
        p.shieldHp = Math.max(Number(p.shieldHp || 0), barrier);
        p.aegisTimer = 10.0 + tier * 3.0;
        p.defBuffMult = 1.45 + tier * 0.2;
      }
      (game.spawnFloatText || game.spawnFloatingText)?.call(game, p?.pos, `🛡️聖盾+${barrier}`, '#38bdf8');
      game.showAlertBanner?.(`🛡️ ${info.evolvedName}！絶対聖盾（耐久${barrier}＆防御大幅UP）展開！`, 2000);
    } else if (sup === 'buff') {
      if (p) {
        p.warcryTimer = 12.0 + tier * 3.0;
        p.atkBuffMult = 1.45 + tier * 0.25;
      }
      (game.spawnFloatText || game.spawnFloatingText)?.call(game, p?.pos, `🔥闘気覚醒UP!`, '#fb923c');
      game.showAlertBanner?.(`🔥 ${info.evolvedName}！攻撃・魔力が大幅上昇（${12 + tier * 3}秒）！`, 2000);
    }
    game.refreshAllHUD?.();
  }

  function findTargetPosV9(game, casterPos, rotY) {
    let best = null;
    let bestD = 13.0;
    if (Array.isArray(game?.monsters)) {
      game.monsters.forEach(m => {
        if (!m || m.dead || !m.pos) return;
        const d = Math.hypot(m.pos.x - casterPos.x, m.pos.z - casterPos.z);
        if (d < bestD) {
          bestD = d;
          best = { x: m.pos.x, z: m.pos.z };
        }
      });
    }
    if (best) return best;
    return {
      x: casterPos.x + Math.sin(rotY) * 5.2,
      z: casterPos.z + Math.cos(rotY) * 5.2
    };
  }

  function playSkillEffectV9(game, skillObj, slotIdx = -1, overrideTier = null) {
    const g = game || window.__kmjInstance || window.game || window.app || window.mmorpg;
    if (!g) return null;

    const info = getSkillInfoV9(g, skillObj, slotIdx);
    if (typeof overrideTier === 'number') {
      info.tier = overrideTier;
      info.tierLabel = TIER_LABELS_V9[overrideTier] || TIER_LABELS_V9[0];
      info.evolvedName = info.attr.names(info.origName)[overrideTier] || info.origName;
      info.powerMult = TIER_MULTS_V9[overrideTier] || 1.0;
    }

    V9._playMagicAudio(info.attr.id, info.tier);
    showSpellCardCutinV9(g, info);

    if (info.isNonAttack) {
      applyNonAttackSupportEffectV9(g, info);
    }

    if (g.useWebGL && g.scene && g.player?.pos && typeof THREE !== 'undefined') {
      const caster = { x: g.player.pos.x, z: g.player.pos.z };
      const target = info.isNonAttack
        ? caster
        : findTargetPosV9(g, caster, g.player.rotY || 0);
      const builder = V9.EFFECT_BUILDERS[info.attr.id] || V9.EFFECT_BUILDERS.sword;
      builder(g.scene, caster, target, info.tier, info.attr);
    }

    return info;
  }

  // =========================================================
  // 10. 魔法進化スタジオUIモーダル
  // =========================================================
  function openMagicEvolutionStudioV9() {
    document.getElementById('kmj-v9-studio-modal')?.remove();
    const g = window.__kmjInstance || window.game || window.app || window.mmorpg;
    const skills = getAllSkillsListV9(g);
    const customMap = getCustomSkillConfigV9(g);

    const modal = document.createElement('div');
    modal.id = 'kmj-v9-studio-modal';

    const rows = skills.map((sk, idx) => {
      const info = getSkillInfoV9(g, sk, idx);
      const opts = V9.ATTRIBUTES.map(a =>
        `<option value="${a.id}" ${a.id === info.attr.id ? 'selected' : ''}>${a.label}</option>`
      ).join('');
      const tierOpts = TIER_LABELS_V9.map((lbl, tIdx) =>
        `<option value="${tIdx}" ${tIdx === info.tier ? 'selected' : ''}>${lbl}</option>`
      ).join('');
      const badge = info.isNonAttack
        ? '<span style="background:#065f46;color:#6ee7b7;padding:1px 6px;border-radius:4px;font-size:9px;">🛡️非攻撃(回復/結界/バフ)</span>'
        : '<span style="background:#7f1d1d;color:#fecaca;padding:1px 6px;border-radius:4px;font-size:9px;">⚔️攻撃スキル</span>';

      return `
        <div style="background:rgba(15,23,42,0.92);border:1px solid #38bdf8;border-radius:9px;padding:8px;margin-bottom:7px;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:4px;margin-bottom:4px;">
            <b style="font-size:12px;color:#fde047;">${idx + 1}. ${info.evolvedName}</b>
            ${badge}
          </div>
          <div style="font-size:9.5px;color:#94a3b8;margin-bottom:5px;">元のスキル: ${info.origName}（Lv.${info.skillLv}）</div>
          <div style="display:grid;grid-template-columns:1fr auto auto;gap:5px;align-items:center;">
            <select class="v9-attr-sel" data-sid="${info.sid}" style="background:#020617;color:#fff;border:1px solid #475569;border-radius:6px;padding:4px;font-size:10px;">
              ${opts}
            </select>
            <select class="v9-tier-sel" data-sid="${info.sid}" style="background:#020617;color:#fde047;border:1px solid #475569;border-radius:6px;padding:4px;font-size:10px;font-weight:900;">
              ${tierOpts}
            </select>
            <button type="button" class="v9-test-btn" data-idx="${idx}" style="background:linear-gradient(90deg,#db2777,#7c3aed);color:#fff;border:none;border-radius:6px;padding:5px 9px;font-size:10px;font-weight:900;cursor:pointer;">🎬 試射</button>
          </div>
        </div>
      `;
    }).join('');

    modal.innerHTML = `
      <div class="kmj-v9-studio-card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <b style="font-size:14px;color:#fde047;">✨ 魔法進化＆スペルエフェクトスタジオ</b>
          <button type="button" id="kmj-v9-studio-close" style="background:#ef4444;color:#fff;border:none;border-radius:6px;padding:4px 10px;font-size:11px;font-weight:900;cursor:pointer;">✕ 閉じる</button>
        </div>
        <div style="font-size:10px;color:#cbd5e1;margin-bottom:8px;">
          ※ 回復・聖盾・聖域・咆哮スキルは<b>非攻撃判定</b>として保護され、敵への誤攻撃が発生しません。
        </div>
        ${rows || '<div style="color:#fca5a5;font-size:11px;">スキルデータが見つかりません。</div>'}
      </div>
    `;

    document.body.appendChild(modal);
    modal.querySelector('#kmj-v9-studio-close').onclick = () => modal.remove();
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

    modal.querySelectorAll('.v9-attr-sel').forEach(sel => {
      sel.onchange = () => {
        const sid = sel.dataset.sid;
        if (!customMap[sid]) customMap[sid] = {};
        customMap[sid].attrId = sel.value;
        syncAllSkillsV9(g);
        g?.saveGame?.(false);
        openMagicEvolutionStudioV9();
      };
    });

    modal.querySelectorAll('.v9-tier-sel').forEach(sel => {
      sel.onchange = () => {
        const sid = sel.dataset.sid;
        if (!customMap[sid]) customMap[sid] = {};
        customMap[sid].tier = Number(sel.value);
        syncAllSkillsV9(g);
        g?.saveGame?.(false);
        openMagicEvolutionStudioV9();
      };
    });

    modal.querySelectorAll('.v9-test-btn').forEach(btn => {
      btn.onclick = () => {
        const idx = Number(btn.dataset.idx);
        const sk = skills[idx];
        modal.remove();
        setTimeout(() => playSkillEffectV9(g, sk, idx), 60);
      };
    });
  }

  function ensureStudioButtonV9() {
    if (document.getElementById('kmj-v9-open-studio-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'kmj-v9-open-studio-btn';
    btn.type = 'button';
    btn.textContent = '✨ 魔法進化';
    btn.style.cssText = 'position:fixed;right:12px;bottom:74px;z-index:920;background:linear-gradient(90deg,#7c3aed,#db2777);border:1.5px solid #fde047;color:#fff;border-radius:999px;padding:6px 12px;font-size:11px;font-weight:900;box-shadow:0 3px 10px rgba(219,39,119,0.45);cursor:pointer;';
    btn.onclick = () => openMagicEvolutionStudioV9();
    document.body?.appendChild(btn);
  }

  // =========================================================
  // 11. 本体フック＆非攻撃スキルのダメージ・状態異常完全ガード
  // =========================================================
  function installV9MasterHooks() {
    const classes = [];
    if (typeof KaomojiMMORPG !== 'undefined') classes.push(KaomojiMMORPG);
    if (typeof RPGGame !== 'undefined' && RPGGame !== KaomojiMMORPG) classes.push(RPGGame);

    if (classes.length === 0) {
      setTimeout(installV9MasterHooks, 150);
      return;
    }

    classes.forEach(Cls => {
      const proto = Cls.prototype;
      if (proto._v9MasterInstalled) return;
      proto._v9MasterInstalled = true;

      proto._isNonAttackCastActiveV9 = function () {
        return Boolean(this._v9SuppressAttackUntil && performance.now() <= this._v9SuppressAttackUntil);
      };

      ['damageMonster', 'applySkillDamage', 'hitMonster', 'applyMagicProjectileHitDamageV40'].forEach(dmgFn => {
        if (typeof proto[dmgFn] === 'function' && !proto[`_v9Guard_${dmgFn}`]) {
          const origDmg = proto[dmgFn];
          proto[dmgFn] = function (...args) {
            if (this._isNonAttackCastActiveV9()) {
              return 0;
            }
            return origDmg.apply(this, args);
          };
          proto[`_v9Guard_${dmgFn}`] = true;
        }
      });

      if (typeof proto.applyElementalStatusToMonstersV7 === 'function' && !proto._v9Guard_status) {
        const origStatus = proto.applyElementalStatusToMonstersV7;
        proto.applyElementalStatusToMonstersV7 = function (...args) {
          if (this._isNonAttackCastActiveV9()) return;
          return origStatus.apply(this, args);
        };
        proto._v9Guard_status = true;
      }

      ['useSkillSlot', 'executeSingleSkillCast', 'useSkill', 'castSkill'].forEach(fn => {
        if (typeof proto[fn] === 'function' && !proto[`_v9Hook_${fn}`]) {
          const orig = proto[fn];
          proto[fn] = function (slotOrId, ...rest) {
            const now = performance.now();
            if (this._v9LastCastStamp && (now - this._v9LastCastStamp) < 85) {
              return orig.apply(this, [slotOrId, ...rest]);
            }
            this._v9LastCastStamp = now;

            const all = getAllSkillsListV9(this);
            let slotIdx = typeof slotOrId === 'number' ? slotOrId : -1;
            let sk = slotIdx >= 0
              ? (this.skillSlots?.[slotIdx] || this.equippedSkills?.[slotIdx] || all[slotIdx])
              : all.find(s => s.id === slotOrId || s.skillId === slotOrId || s.name === slotOrId);
            if (slotIdx < 0 && sk) slotIdx = all.indexOf(sk);

            const preInfo = sk ? getSkillInfoV9(this, sk, slotIdx) : null;
            if (preInfo?.isNonAttack) {
              this._v9SuppressAttackUntil = performance.now() + 220;
            }

            const res = orig.apply(this, [slotOrId, ...rest]);

            if (res !== false && sk) {
              playSkillEffectV9(this, sk, slotIdx);
            }
            return res;
          };
          proto[`_v9Hook_${fn}`] = true;
        }
      });

      if (typeof proto.update === 'function' && !proto._v9UpdateWrapped) {
        const origUpdate = proto.update;
        proto.update = function (dt = 0.016, ...rest) {
          const res = origUpdate.apply(this, [dt, ...rest]);
          try {
            V9.updateSanctuaryFields(this, dt);
          } catch (e) {}
          return res;
        };
        proto._v9UpdateWrapped = true;
      }
    });
  }

  Object.assign(V9, {
    getAll14Skills: getAllSkillsListV9,
    getSkillInfo: getSkillInfoV9,
    syncAllSkills: syncAllSkillsV9,
    openStudio: openMagicEvolutionStudioV9,
    previewSkillByObj: (game, sk, tier) => playSkillEffectV9(game, sk, -1, tier)
  });

  installV9MasterHooks();

  window.addEventListener('load', () => {
    setTimeout(() => {
      ensureStudioButtonV9();
      syncAllSkillsV9();
    }, 600);
  });
  setTimeout(() => {
    ensureStudioButtonV9();
    syncAllSkillsV9();
  }, 500);
})();
// ▲▲▲ ここまで【スキルエフェクト専用 game9.js（超軽量・高速化版）2/2】 ▲▲▲
