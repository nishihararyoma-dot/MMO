// ▼▼▼ ここから【スキルエフェクト専用 game9.js（無限再帰完全修正＆超軽量・爆速版）1/2】CSS・シンセ音・全18種プロファイル・共有キャッシュ＆オンデマンド3Dループ・極光の聖域・前半3Dビルダー(1〜10) ▼▼▼
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
      @keyframes kmjV9FlashFade { 0% { opacity: 0.4; } 100% { opacity: 0; } }

      #kmj-v9-cutin-layer {
        position: fixed; inset: 0; pointer-events: none; z-index: 9999; overflow: hidden;
      }
      .kmj-v9-flash {
        position: absolute; inset: 0;
        will-change: opacity;
        animation: kmjV9FlashFade 0.35s ease-out forwards;
      }
      .kmj-v9-line-top, .kmj-v9-line-bot {
        position: absolute; left: 0; right: 0; height: 2px;
        background: linear-gradient(90deg, transparent, #fde047, #f472b6, #38bdf8, transparent);
        will-change: transform, opacity;
        animation: kmjV9LineSweep 2.0s ease-out forwards;
      }
      .kmj-v9-line-top { top: 12.2%; }
      .kmj-v9-line-bot { top: 24.8%; }

      .kmj-v9-banner {
        position: absolute; right: 14px; top: 13.2%; min-width: 290px; max-width: 92vw;
        padding: 11px 22px 11px 16px; border-radius: 12px; border: 2px solid #fde047;
        box-shadow: 0 4px 14px rgba(250, 204, 21, 0.45);
        display: flex; align-items: center; gap: 12px;
        will-change: transform, opacity;
        animation: kmjV9CutinSlide 2.05s cubic-bezier(0.16, 1, 0.3, 1) forwards; overflow: hidden;
      }
      .kmj-v9-banner-inner {
        transform: skewX(15deg); display: flex; align-items: center; gap: 12px; position: relative; z-index: 2;
      }
      .kmj-v9-ring-1 {
        position: absolute; right: -28px; top: -38px; width: 140px; height: 140px;
        border: 2px dashed rgba(255, 255, 255, 0.45); border-radius: 50%;
        will-change: transform;
        animation: kmjV9SpinCW 6s linear infinite; z-index: 1;
      }
      .kmj-v9-ring-2 {
        position: absolute; right: -12px; top: -22px; width: 110px; height: 110px;
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
      if (stamp - _lastAudioStampV9 < 90) return;
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
      impOsc.frequency.exponentialRampToValueAtTime(Math.max(30, cfg.sweep), now + 0.34);
      impGain.gain.setValueAtTime(0.08, now);
      impGain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
      impOsc.connect(impGain);
      impGain.connect(ctx.destination);
      impOsc.start(now);
      impOsc.stop(now + 0.38);

      const count = Math.min(cfg.notes.length, 2 + tier, 3);
      for (let i = 0; i < count; i++) {
        const freq = cfg.notes[i];
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = tier >= 2 ? 'triangle' : 'sine';
        const t0 = now + i * 0.04;
        osc.frequency.setValueAtTime(freq, t0);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.02, t0 + 0.32);

        gain.gain.setValueAtTime(0.001, t0);
        gain.gain.linearRampToValueAtTime(0.055, t0 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + 0.37);
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

  function unitGeoV9(type) {
    switch (type) {
      case 'octa':       return getCachedGeoV9('unit_octa',       () => new THREE.OctahedronGeometry(1, 0));
      case 'tetra':      return getCachedGeoV9('unit_tetra',      () => new THREE.TetrahedronGeometry(1, 0));
      case 'dodeca':     return getCachedGeoV9('unit_dodeca',     () => new THREE.DodecahedronGeometry(1, 0));
      case 'icosa':      return getCachedGeoV9('unit_icosa',      () => new THREE.IcosahedronGeometry(1, 1));
      case 'sphere':     return getCachedGeoV9('unit_sphere',     () => new THREE.SphereGeometry(1, 10, 8));
      case 'box':        return getCachedGeoV9('unit_box',        () => new THREE.BoxGeometry(1, 1, 1));
      case 'cone8':      return getCachedGeoV9('unit_cone8',      () => new THREE.ConeGeometry(1, 1, 8));
      case 'cone4':      return getCachedGeoV9('unit_cone4',      () => new THREE.ConeGeometry(1, 1, 4));
      case 'cone6':      return getCachedGeoV9('unit_cone6',      () => new THREE.ConeGeometry(1, 1, 6));
      case 'cone10open': return getCachedGeoV9('unit_cone10open', () => new THREE.ConeGeometry(1, 1, 8, 1, true));
      case 'cyl16open':  return getCachedGeoV9('unit_cyl16open',  () => new THREE.CylinderGeometry(1, 1, 1, 12, 1, true));
      case 'cyl8':       return getCachedGeoV9('unit_cyl8',       () => new THREE.CylinderGeometry(1, 1, 1, 8));
      case 'cyl6':       return getCachedGeoV9('unit_cyl6',       () => new THREE.CylinderGeometry(1, 1, 1, 6));
      case 'circle24':   return getCachedGeoV9('unit_circle24',   () => new THREE.CircleGeometry(1, 20));
      default:           return getCachedGeoV9('unit_octa',       () => new THREE.OctahedronGeometry(1, 0));
    }
  }

  function makeCircleRing(rIn, rOut, color, seg = 20) {
    const optSeg = seg > 20 ? 20 : seg;
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
  const MAX_ACTIVE_ANIMS_V9 = 5;
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

    if (!_loopRunningV9) {
      _loopRunningV9 = true;
      _lastFrameV9 = performance.now();
      requestAnimationFrame(step3DLoopV9);
    }
  }

  // =========================================================
  // 5. 「極光の聖域」持続フィールド管理（同時展開上限2個＋超軽量化）
  // =========================================================
  const activeSanctuariesV9 = [];
  const MAX_SANCTUARIES_V9 = 2;

  function spawnAuroraSanctuaryFieldV9(game, entity, info) {
    if (!game?.useWebGL || !game?.scene || !entity?.pos || typeof THREE === 'undefined') return;
    const tier = info?.tier ?? 0;
    const radius = (4.2 + tier * 1.4);
    const duration = 10.0 + tier * 3.0;

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
    const ringCount = 2 + Math.min(2, tier);
    const ringCols = [0x34d399, 0xf472b6, 0x38bdf8, 0xfde047];
    for (let r = 0; r < ringCount; r++) {
      const rIn = radius * (0.28 + (r / ringCount) * 0.68);
      const rOut = rIn + 0.16 + tier * 0.03;
      const segs = r % 3 === 0 ? 6 : (r % 3 === 1 ? 8 : 20);
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
    const cryCnt = 4 + tier;
    const cryMats = [
      new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.95, depthWrite: false }),
      new THREE.MeshBasicMaterial({ color: 0xf472b6, transparent: true, opacity: 0.95, depthWrite: false })
    ];
    const crySize = 0.34 + tier * 0.08;
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
        for (let c = 0; c < remoteLists.length; c++) {
          const col = remoteLists[c];
          if (!col) continue;
          const iter = Array.isArray(col) ? col : (col instanceof Map ? col.values() : Object.values(col));
          for (const rp of iter) {
            if (!rp || rp === game.player || !rp.pos) continue;
            const dRemote = Math.hypot(rp.pos.x - s.x, rp.pos.z - s.z);
            if (dRemote <= s.radius) {
              const rMaxHp = Math.max(Number(rp.maxHp || 100), Number(rp.hp || 100));
              const rMaxMp = Math.max(Number(rp.maxMp || 100), Number(rp.mp || 100));
              if (typeof rp.hp === 'number') rp.hp = Math.min(rMaxHp, Math.max(rp.hp, rp.hp + Math.floor(rMaxHp * (0.08 + s.tier * 0.04))));
              if (typeof rp.mp === 'number') rp.mp = Math.min(rMaxMp, Math.max(rp.mp, rp.mp + Math.floor(rMaxMp * (0.10 + s.tier * 0.05))));
              rp.sanctuaryBuffTimer = 2.5;
            }
          }
        }

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

  const V9 = window.KMJ_SKILL_FX_V9 = {
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
    // 1. 覇王の咆哮
    warcry_aura: (scene, caster, target, tier, attr) => {
      const root = new THREE.Group();
      root.position.set(caster.x, 0, caster.z);

      const shockBase = 1.5 + tier * 0.45;
      const shock = makeCircleRing(0.4, shockBase, attr.c2, 20);
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
        const crGeo = getCachedGeoV9(`torus_${r.toFixed(2)}_${tube.toFixed(2)}`, () => new THREE.TorusGeometry(r, tube, 6, 18));
        const cr = new THREE.Mesh(crGeo, crMats[i % 2]);
        cr.rotation.x = Math.PI / 2;
        cr.position.y = 0.5 + i * 0.65;
        root.add(cr);
        crownRings.push(cr);
      }

      const flames = [];
      const fCnt = 6 + tier * 2;
      const fSz = 0.32 + tier * 0.07;
      for (let i = 0; i < fCnt; i++) {
        const ang = (Math.PI * 2 * i) / fCnt;
        const rad = 0.9 + (i % 3) * 0.5;
        const f = new THREE.Mesh(unitGeoV9('octa'), crMats[i % 2]);
        f.scale.setScalar(fSz);
        f.position.set(Math.cos(ang) * rad, 0.2, Math.sin(ang) * rad);
        root.add(f);
        flames.push({ mesh: f, ang, rad, spd: 2.8 + (i % 4) * 0.75 });
      }

      reg(scene, root, 1.2 + tier * 0.2, (p, el) => {
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
        flames.forEach((fl, idx) => {
          const a = fl.ang + el * 3.5;
          fl.mesh.position.set(Math.cos(a) * fl.rad, (p * fl.spd * 1.8) % 4.2, Math.sin(a) * fl.rad);
          fl.mesh.rotation.y = el * 6 + idx;
        });
      });
    },

    // 2. 神域防御・イージスの盾
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

      const orbitGeo = getCachedGeoV9(`torus_aegis_${tier}`, () => new THREE.TorusGeometry(domeR * 1.12, 0.08, 6, 20));
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

      reg(scene, root, 1.35 + tier * 0.25, (p, el) => {
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

    // 3. 極光の聖域
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
      const shockWave = makeCircleRing(0.5, 1.4, attr.c1, 20);
      shockWave.position.y = 0.12;

      root.add(outerBeam, innerBeam, hexA, hexB, shockWave);

      const prisms = [];
      const cols = [attr.c1, attr.c2, attr.c3, 0x38bdf8];
      const pMats = cols.map(c => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.96 }));
      const pCnt = 7 + tier * 2;
      const pSz = 0.34 + tier * 0.07;
      for (let i = 0; i < pCnt; i++) {
        const pm = new THREE.Mesh(unitGeoV9('octa'), pMats[i % pMats.length]);
        pm.scale.setScalar(pSz);
        const ang = (Math.PI * 2 * i) / pCnt;
        const rad = 0.8 + (i % 4) * (0.65 + tier * 0.2);
        root.add(pm);
        prisms.push({ mesh: pm, ang, rad, off: (i % 5) * 1.4 });
      }

      reg(scene, root, 1.15 + tier * 0.18, (p, el) => {
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

    // 4. 烈空・三日月真空斬
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
      const bladeGeo = getCachedGeoV9(`crescent_blade_${tier}`, () => new THREE.RingGeometry(bIn, bOut, 18, 1, -Math.PI * 0.45, Math.PI * 0.9));
      const edgeGeo = getCachedGeoV9(`crescent_edge_${tier}`, () => new THREE.TorusGeometry(bOut, 0.09 + tier * 0.03, 6, 18, Math.PI * 0.9));
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
      const impactRing = makeCircleRing(0.5, impR, attr.c1, 20);
      impactRing.position.set(0, -1.05, dist);
      impactRing.visible = false;
      root.add(impactRing);

      reg(scene, root, 0.72 + tier * 0.1, (p, el) => {
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
      const ring = makeCircleRing(zoneR * 0.82, zoneR, attr.c2, 20);
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

      reg(scene, root, 1.15 + tier * 0.18, (p, el) => {
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
      const magicRing = makeCircleRing(baseR * 0.75, baseR, attr.c1, 20);
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
      const orbCnt = 6 + tier * 2;
      const orbMats = [
        new THREE.MeshBasicMaterial({ color: attr.c2, transparent: true, opacity: 0.95 }),
        new THREE.MeshBasicMaterial({ color: attr.c3, transparent: true, opacity: 0.95 })
      ];
      const orbSz = 0.34 + tier * 0.07;
      for (let i = 0; i < orbCnt; i++) {
        const orb = new THREE.Mesh(unitGeoV9('octa'), orbMats[i % 2]);
        orb.scale.setScalar(orbSz);
        root.add(orb);
        spirals.push({ mesh: orb, phase: (Math.PI * 2 * i) / orbCnt, hOff: (i / orbCnt) * 7.5 });
      }

      reg(scene, root, 1.1 + tier * 0.18, (p, el) => {
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

      reg(scene, root, 0.9 + tier * 0.14, (p, el) => {
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

    // 8. 灼熱ブレイズ・溶岩マグマ噴火魔法
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

      const heatWave = makeCircleRing(rMax * 0.75, rMax * 1.15, attr.c2, 20);
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
      const gyCnt = 4 + tier * 2;
      const gyMats = [
        new THREE.MeshBasicMaterial({ color: attr.c2, transparent: true, opacity: 0.94 }),
        new THREE.MeshBasicMaterial({ color: attr.c1, transparent: true, opacity: 0.94 })
      ];
      const gyR = 0.45 + tier * 0.09;
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
      const mbCnt = 6 + tier * 2;
      const mbSz = 0.32 + tier * 0.07;
      for (let i = 0; i < mbCnt; i++) {
        const mb = new THREE.Mesh(unitGeoV9('dodeca'), gyMats[i % 2]);
        mb.scale.setScalar(mbSz);
        const ang = (Math.PI * 2 * i) / mbCnt;
        const dist = 1.6 + (i % 4) * (0.85 + tier * 0.25);
        const peakH = 3.5 + (i % 3) * 1.4 + tier * 0.6;
        root.add(mb);
        magmaBombs.push({ mesh: mb, ang, dist, peakH });
      }

      reg(scene, root, 1.15 + tier * 0.18, (p, el) => {
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
      const spikeCnt = 6 + tier * 2;
      const spMats = [
        new THREE.MeshBasicMaterial({ color: attr.c1, transparent: true, opacity: 0.9 }),
        new THREE.MeshBasicMaterial({ color: attr.c2, transparent: true, opacity: 0.9 })
      ];
      for (let i = 0; i < spikeCnt; i++) {
        const isCenter = i === 0;
        const ang = (Math.PI * 2 * i) / Math.max(1, spikeCnt - 1);
        const rad = isCenter ? 0 : zoneR * (0.35 + (i % 3) * 0.22);
        const h = (isCenter ? 3.8 : 2.3) + tier * 0.9;
        const w = (isCenter ? 0.65 : 0.40) + tier * 0.1;

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

      reg(scene, root, 1.1 + tier * 0.18, (p, el) => {
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
        const segs = 5;
        let curX = ox;
        let curZ = oz;
        for (let s = 0; s < segs; s++) {
          const nextX = s === segs - 1 ? ox : ox + (Math.random() - 0.5) * 1.5;
          const nextZ = s === segs - 1 ? oz : oz + (Math.random() - 0.5) * 1.5;
          const segH = 2.4 + tier * 0.4;
          const segR = 0.18 + tier * 0.04;
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
      const shockRing = makeCircleRing(0.5, srR, attr.c1, 20);
      shockRing.position.y = 0.08;
      root.add(shockRing);

      reg(scene, root, 0.8 + tier * 0.14, (p, el) => {
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

  // =========================================================
  // 7. 全18種スキル個別3Dエフェクト専用ビルダー（軽量・高迫力後半 11〜18）
  // =========================================================
  const EFFECT_BUILDERS_PART2 = {
    // 11. 旋風円舞・螺旋竜巻魔法
    wind: (scene, caster, target, tier, attr) => {
      const root = new THREE.Group();
      root.position.set(target.x, 0, target.z);
      const maxR = 2.4 + tier * 0.75;

      const groundRing = makeCircleRing(0.6, maxR, attr.c1, 20);
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
      const rCnt = 3 + tier;
      const wrMats = [
        new THREE.MeshBasicMaterial({ color: attr.c1, transparent: true, opacity: 0.9 }),
        new THREE.MeshBasicMaterial({ color: attr.c2, transparent: true, opacity: 0.9 })
      ];
      for (let i = 0; i < rCnt; i++) {
        const t = i / rCnt;
        const r = 0.45 + t * maxR * 0.95;
        const tube = 0.07 + tier * 0.02;
        const wrGeo = getCachedGeoV9(`torus_w_${r.toFixed(2)}_${tube.toFixed(2)}`, () => new THREE.TorusGeometry(r, tube, 6, 18));
        const wr = new THREE.Mesh(wrGeo, wrMats[i % 2]);
        wr.rotation.x = Math.PI / 2;
        wr.position.y = 0.3 + t * (5.6 + tier * 1.6);
        root.add(wr);
        windRings.push({ mesh: wr, baseY: wr.position.y, spd: (i % 2 === 0 ? 1 : -1) * (5 + i * 0.5) });
      }

      const blades = [];
      const bCnt = 6 + tier * 2;
      const bSz = 0.34 + tier * 0.06;
      for (let i = 0; i < bCnt; i++) {
        const b = new THREE.Mesh(unitGeoV9('tetra'), wrMats[i % 2]);
        b.scale.setScalar(bSz);
        root.add(b);
        blades.push({ mesh: b, ang: (Math.PI * 2 * i) / bCnt, hFrac: (i % 7) / 7 });
      }

      reg(scene, root, 1.15 + tier * 0.18, (p, el) => {
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
        blades.forEach((bl, idx) => {
          const h = ((bl.hFrac + p * 1.4) % 1) * (6.0 + tier * 1.6);
          const r = 0.5 + (h / (6.0 + tier * 1.6)) * maxR * 1.1;
          const a = bl.ang + el * 9;
          bl.mesh.position.set(Math.cos(a) * r, h, Math.sin(a) * r);
          bl.mesh.rotation.set(el * 10, el * 8 + idx, 0);
        });
      });
    },

    // 12. 蒼海・大渦潮水柱魔法
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
      const rpCnt = 2 + Math.min(2, tier);
      for (let i = 0; i < rpCnt; i++) {
        const rp = makeCircleRing(0.4 + i * 0.3, 0.85 + i * 0.35, i % 2 === 0 ? attr.c2 : attr.c3, 20);
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
      const dCnt = 6 + tier * 2;
      const dMats = [
        new THREE.MeshBasicMaterial({ color: attr.c2, transparent: true, opacity: 0.94 }),
        new THREE.MeshBasicMaterial({ color: attr.c3, transparent: true, opacity: 0.94 })
      ];
      const dSz = 0.28 + tier * 0.06;
      for (let i = 0; i < dCnt; i++) {
        const d = new THREE.Mesh(unitGeoV9('sphere'), dMats[i % 2]);
        d.scale.setScalar(dSz);
        root.add(d);
        droplets.push({ mesh: d, ang: (Math.PI * 2 * i) / dCnt, rad: 0.7 + (i % 4) * 0.55, peak: 3.8 + (i % 3) * 1.4 });
      }

      reg(scene, root, 1.15 + tier * 0.18, (p, el) => {
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

    // 13. 破邪の衝撃・巨岩隆起魔法
    earth: (scene, caster, target, tier, attr) => {
      const root = new THREE.Group();
      root.position.set(target.x, 0, target.z);
      const zoneR = 2.6 + tier * 0.85;

      const quakeRing1 = makeCircleRing(zoneR * 0.72, zoneR, attr.c1, 8);
      quakeRing1.position.y = 0.06;
      const quakeRing2 = makeCircleRing(0.4, 1.4, attr.c2, 20);
      quakeRing2.position.y = 0.09;
      root.add(quakeRing1, quakeRing2);

      const rocks = [];
      const rockCnt = 5 + tier;
      const rkMats = [
        new THREE.MeshBasicMaterial({ color: attr.c3, transparent: true, opacity: 0.96 }),
        new THREE.MeshBasicMaterial({ color: attr.c1, transparent: true, opacity: 0.96 })
      ];
      const edgeMat = new THREE.MeshBasicMaterial({ color: attr.c2, wireframe: true, transparent: true, opacity: 0.9 });

      for (let i = 0; i < rockCnt; i++) {
        const isCenter = i === 0;
        const ang = (Math.PI * 2 * i) / Math.max(1, rockCnt - 1);
        const rad = isCenter ? 0 : zoneR * (0.35 + (i % 3) * 0.22);
        const sz = (isCenter ? 1.05 : 0.68) + tier * 0.22;

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
      const dbCnt = 6 + tier * 2;
      const dbSz = 0.30 + tier * 0.06;
      for (let i = 0; i < dbCnt; i++) {
        const db = new THREE.Mesh(unitGeoV9('tetra'), rkMats[i % 2]);
        db.scale.setScalar(dbSz);
        root.add(db);
        debris.push({ mesh: db, ang: (Math.PI * 2 * i) / dbCnt, dist: 1.5 + (i % 4) * 0.7, peak: 3.2 + (i % 3) * 1.1 });
      }

      reg(scene, root, 1.1 + tier * 0.18, (p, el) => {
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
        debris.forEach((db, idx) => {
          const r = db.dist * p;
          const y = Math.sin(p * Math.PI) * db.peak + 0.15;
          db.mesh.position.set(Math.cos(db.ang) * r, y, Math.sin(db.ang) * r);
          db.mesh.rotation.set(el * 9 + idx, el * 7, 0);
        });
      });
    },

    // 14. 聖光の癒し・天照光輪魔法
    holy_heal: (scene, caster, target, tier, attr) => {
      const root = new THREE.Group();
      root.position.set(caster.x, 0, caster.z);
      const zoneR = 2.3 + tier * 0.65;

      const rune1 = makeCircleRing(zoneR * 0.78, zoneR, attr.c1, 6);
      rune1.position.y = 0.06;
      const rune2 = makeCircleRing(zoneR * 0.45, zoneR * 0.68, attr.c3, 8);
      rune2.position.y = 0.09;
      const healWave = makeCircleRing(0.4, 1.2, attr.c2, 20);
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
        const hlGeo = getCachedGeoV9(`torus_hl_${r.toFixed(2)}_${tube.toFixed(2)}`, () => new THREE.TorusGeometry(r, tube, 6, 20));
        const hl = new THREE.Mesh(hlGeo, hlMats[i % 2]);
        hl.rotation.x = Math.PI / 2;
        hl.position.y = 0.4 + i * 0.65;
        root.add(hl);
        halos.push(hl);
      }

      const motes = [];
      const mtCnt = 6 + tier * 2;
      const mtSz = 0.30 + tier * 0.06;
      for (let i = 0; i < mtCnt; i++) {
        const mt = new THREE.Mesh(unitGeoV9('octa'), hlMats[i % 2]);
        mt.scale.setScalar(mtSz);
        root.add(mt);
        motes.push({ mesh: mt, ang: (Math.PI * 2 * i) / mtCnt, rad: 0.6 + (i % 4) * 0.48, off: (i % 5) * 1.1 });
      }

      reg(scene, root, 1.2 + tier * 0.18, (p, el) => {
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
        motes.forEach((mt, idx) => {
          const a = mt.ang + el * 3.0;
          const y = (p * 6.5 + mt.off) % 6.5;
          mt.mesh.position.set(Math.cos(a) * mt.rad, y, Math.sin(a) * mt.rad);
          mt.mesh.rotation.y = el * 6 + idx;
        });
      });
    },

    // 15. 黒蝕・ブラックホール魔法
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

      const disk1 = makeCircleRing(coreR * 1.25, coreR * 2.8, attr.c1, 20);
      disk1.rotation.x = Math.PI / 2 - 0.35;

      const disk2 = makeCircleRing(coreR * 1.4, coreR * 2.4, attr.c2, 20);
      disk2.rotation.x = Math.PI / 2 + 0.38;
      root.add(disk1, disk2);

      const floorGravity = makeCircleRing(coreR * 1.5, coreR * 3.1, attr.c3, 8);
      floorGravity.position.y = -1.38;
      root.add(floorGravity);

      const shards = [];
      const shCnt = 6 + tier * 2;
      const shMats = [
        new THREE.MeshBasicMaterial({ color: attr.c2, transparent: true, opacity: 0.95 }),
        new THREE.MeshBasicMaterial({ color: attr.c3, transparent: true, opacity: 0.95 })
      ];
      const shSz = 0.30 + tier * 0.06;
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

      reg(scene, root, 1.2 + tier * 0.18, (p, el) => {
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

    // 16. 呪詛・魔界瘴気魔法
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
      const bCnt = 6 + tier * 2;
      const bMats = [
        new THREE.MeshBasicMaterial({ color: attr.c3, transparent: true, opacity: 0.9 }),
        new THREE.MeshBasicMaterial({ color: attr.c2, transparent: true, opacity: 0.9 })
      ];
      for (let i = 0; i < bCnt; i++) {
        const baseSz = 0.32 + (i % 3) * 0.09 + tier * 0.05;
        const bb = new THREE.Mesh(unitGeoV9('sphere'), bMats[i % 2]);
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

      reg(scene, root, 1.15 + tier * 0.18, (p, el) => {
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

    // 17. 星屑・銀河流星魔法
    star: (scene, caster, target, tier, attr) => {
      const root = new THREE.Group();
      root.position.set(target.x, 0, target.z);
      const zoneR = 2.6 + tier * 0.85;

      const galaxyRing1 = makeCircleRing(zoneR * 0.72, zoneR, attr.c1, 5);
      galaxyRing1.position.y = 0.06;
      const galaxyRing2 = makeCircleRing(zoneR * 0.35, zoneR * 0.65, attr.c3, 20);
      galaxyRing2.position.y = 0.09;
      root.add(galaxyRing1, galaxyRing2);

      const stars = [];
      const starCnt = 4 + tier * 2;
      const cols = [attr.c1, attr.c2, attr.c3];
      const stMats = cols.map(c => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.96 }));
      const coreSz = 0.48 + tier * 0.12;
      const tailR = 0.36 + tier * 0.08;
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
      const novaWave = makeCircleRing(0.5, nvR, attr.c2, 20);
      novaWave.position.y = 0.12;
      novaWave.visible = false;
      root.add(novaWave);

      reg(scene, root, 1.15 + tier * 0.18, (p, el) => {
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

    // 18. 秘剣・無限光剣陣
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
      const swCnt = 6 + tier * 2;
      const bMats = [
        new THREE.MeshBasicMaterial({ color: attr.c1, transparent: true, opacity: 0.96 }),
        new THREE.MeshBasicMaterial({ color: attr.c2, transparent: true, opacity: 0.96 })
      ];
      const guardMat = new THREE.MeshBasicMaterial({ color: attr.c3, transparent: true, opacity: 0.96 });

      const bR = 0.18 + tier * 0.04;
      const bL = 2.2 + tier * 0.5;
      const gW = 0.68 + tier * 0.15;

      for (let i = 0; i < swCnt; i++) {
        const ang = (Math.PI * 2 * i) / swCnt;
        const swGrp = new THREE.Group();

        const blade = new THREE.Mesh(unitGeoV9('cone4'), bMats[i % 2]);
        blade.scale.set(bR, bL, bR);
        blade.rotation.x = Math.PI / 2;
        blade.position.z = 0.55;

        const guard = new THREE.Mesh(unitGeoV9('box'), guardMat);
        guard.scale.set(gW, 0.12, 0.16);
        guard.position.z = -0.35;

        swGrp.add(blade, guard);
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

      reg(scene, root, 1.1 + tier * 0.18, (p, el) => {
        const fade = p > 0.76 ? 1 - (p - 0.76) / 0.24 : 1;
        bladeRune1.rotation.z = el * 4;
        bladeRune1.material.opacity = fade * 0.95;
        bladeRune2.rotation.z = -el * 5;
        bladeRune2.material.opacity = fade * 0.95;
        bMats.forEach(m => { m.opacity = fade * 0.96; });
        guardMat.opacity = fade * 0.96;

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
  // 8. スキル識別・非攻撃系スキル判定・進化状態管理（正確解決＆無限再帰ガード版）
  // =========================================================
  const TIER_LABELS_V9 = ['通常 ★1', '【真】★2', '【極】★3', '【神】★4'];
  const TIER_MULTS_V9 = [1.0, 1.5, 2.3, 3.6];
  let _isSyncingSkillsV9 = false;

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

  // スキル名・IDを最優先し、説明文（desc）の単語による誤判定を防止
  function inferDefaultProfileV9(origName, sk = {}) {
    const primaryTxt = `${origName || ''} ${sk.id || ''} ${sk.skillId || ''}`.trim();
    for (const p of V9.ATTRIBUTES) {
      if (p.match.test(primaryTxt)) return p;
    }
    const subTxt = `${sk.desc || ''} ${sk.description || ''}`.trim();
    if (subTxt) {
      for (const p of V9.ATTRIBUTES) {
        if (p.match.test(subTxt)) return p;
      }
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

    const baseText = `${sk._v9BaseName || ''} ${sk.baseName || ''} ${sk.id || ''} ${sk.skillId || ''}`;
    if (/聖光の癒し|イージス|極光の聖域|覇王の咆哮|ヒール|回復|治癒|守護|鉄壁|バリア|シールド|結界|鼓舞|闘気|覚醒|sanctuary|aegis|warcry|heal|cure|shield|buff/.test(baseText)) {
      return true;
    }

    return false;
  }

  function getAllSkillsListV9(game) {
    const g = game || window.__kmjInstance || window._kmjGameInstance || window.game || window.app || window.mmorpg;
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

    if (Array.isArray(g.saveData?.skills)) g.saveData.skills.forEach(pushUnique);
    if (Array.isArray(g.skills)) g.skills.forEach(pushUnique);
    if (Array.isArray(g.skillSlots)) g.skillSlots.forEach(pushUnique);
    if (Array.isArray(g.equippedSkills)) g.equippedSkills.forEach(pushUnique);
    if (typeof SKILLS !== 'undefined') {
      if (Array.isArray(SKILLS)) SKILLS.forEach(pushUnique);
      else if (SKILLS && typeof SKILLS === 'object') Object.values(SKILLS).forEach(pushUnique);
    }
    return list;
  }

  // スロット番号・スキルID文字列・スキルオブジェクトのいずれが渡されても正確に解決する
  // スロット番号・スキルID文字列・スキルオブジェクトを正確に解決（空スロットは null を返す）
  function resolveSkillEntryV9(game, skillOrIndex) {
    const all = getAllSkillsListV9(game);
    if (skillOrIndex === null || skillOrIndex === undefined || skillOrIndex === '') {
      return { sk: null, slotIdx: -1 };
    }

    if (typeof skillOrIndex === 'object') {
      const idx = all.indexOf(skillOrIndex);
      return { sk: skillOrIndex, slotIdx: idx };
    }

    let candidate = null;
    if (typeof skillOrIndex === 'number') {
      // 装備中スロット配列のみを参照し、未設定時に全スキル一覧(all)へフォールバックしない
      const slotArrays = [
        game?.skillSlots,
        game?.equippedSkills,
        game?.saveData?.equippedSkills,
        game?.saveData?.skillSlots,
        Array.isArray(game?.saveData?.skills) ? game.saveData.skills : null,
        Array.isArray(game?.skills) ? game.skills : null
      ];
      for (let i = 0; i < slotArrays.length; i++) {
        if (Array.isArray(slotArrays[i])) {
          candidate = slotArrays[i][skillOrIndex];
          break;
        }
      }
    } else if (typeof skillOrIndex === 'string') {
      candidate = skillOrIndex;
    }

    // 空スロット判定
    if (!candidate || candidate === 'none' || candidate === 'empty') {
      return { sk: null, slotIdx: typeof skillOrIndex === 'number' ? skillOrIndex : -1 };
    }

    if (typeof candidate === 'string') {
      const found = all.find(s =>
        s.id === candidate ||
        s.skillId === candidate ||
        s._v9BaseName === candidate ||
        s.baseName === candidate ||
        s.name === candidate
      );
      if (found) {
        return { sk: found, slotIdx: typeof skillOrIndex === 'number' ? skillOrIndex : all.indexOf(found) };
      }
      return { sk: null, slotIdx: typeof skillOrIndex === 'number' ? skillOrIndex : -1 };
    }

    if (typeof candidate === 'object') {
      if (!candidate.id && !candidate.skillId && !candidate.name) {
        return { sk: null, slotIdx: typeof skillOrIndex === 'number' ? skillOrIndex : -1 };
      }
      const idx = typeof skillOrIndex === 'number' ? skillOrIndex : all.indexOf(candidate);
      return { sk: candidate, slotIdx: idx };
    }

    return { sk: null, slotIdx: -1 };
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
    const custom = customMap[sid] || customMap[origName] || {};

    const d = game?.saveData || {};
    const lvFromSave = Number(
      (typeof d.skills === 'object' && !Array.isArray(d.skills) ? d.skills[sid] : undefined)
      ?? d.skillLevels?.[sid]
      ?? d.skillLvs?.[sid]
      ?? sk.lv
      ?? sk.level
      ?? 1
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
      : inferDefaultProfileV9(origName, sk);

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

  // 無限再帰（Maximum call stack size exceeded）完全防止版 syncAllSkillsV9
  function syncAllSkillsV9(game, allowHudRefresh = false) {
    if (_isSyncingSkillsV9) return;
    const g = game || window.__kmjInstance || window._kmjGameInstance || window.game || window.app || window.mmorpg;
    if (!g) return;

    _isSyncingSkillsV9 = true;
    let changed = false;
    try {
      const all = getAllSkillsListV9(g);
      all.forEach((sk, idx) => {
        const info = getSkillInfoV9(g, sk, idx);
        if (sk.name !== info.evolvedName) {
          sk.name = info.evolvedName;
          changed = true;
        }
        if ('title' in sk && sk.title !== info.evolvedName) {
          sk.title = info.evolvedName;
          changed = true;
        }
        sk._v9PowerMult = info.powerMult;
        sk._v9AttrId = info.attr.id;
        sk._v9IsNonAttack = info.isNonAttack;
      });

      if (allowHudRefresh && changed && !g._v9InRefreshHUD && typeof g.refreshAllHUD === 'function') {
        g._v9InRefreshHUD = true;
        try {
          g.refreshAllHUD();
        } finally {
          g._v9InRefreshHUD = false;
        }
      }
    } finally {
      _isSyncingSkillsV9 = false;
    }
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

    const kaomoji = String(game?.saveData?.kaomoji || game?.player?.kaomoji || '(・ω・)');
    const pName = String(game?.saveData?.name || game?.saveData?.playerName || '冒険者');
    const stars = '★'.repeat(info.tier + 1);
    const kindBadge = info.isNonAttack ? '🛡️ 補助・回復・結界' : '⚔️ 攻撃スペル';

    layer.innerHTML = `
      <div class="kmj-v9-flash" style="background:radial-gradient(circle at 75% 20%, rgba(253,224,71,0.3), transparent 68%);"></div>
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
    }, 2100);
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

    if (!game._v9InRefreshHUD && typeof game.refreshAllHUD === 'function') {
      game._v9InRefreshHUD = true;
      try {
        game.refreshAllHUD();
      } finally {
        game._v9InRefreshHUD = false;
      }
    }
  }

  function findTargetPosV9(game, casterPos, rotY, explicitTarget = null) {
    if (explicitTarget && typeof explicitTarget === 'object') {
      const p = explicitTarget.pos || explicitTarget;
      if (typeof p.x === 'number' && typeof p.z === 'number') {
        return { x: p.x, z: p.z };
      }
    }
    if (game?.lockedTarget && !game.lockedTarget.dead && game.lockedTarget.pos) {
      return { x: game.lockedTarget.pos.x, z: game.lockedTarget.pos.z };
    }

    let best = null;
    let bestD = 13.0;
    if (Array.isArray(game?.monsters)) {
      const mList = game.monsters;
      for (let i = 0; i < mList.length; i++) {
        const m = mList[i];
        if (!m || m.dead || !m.pos) continue;
        const d = Math.hypot(m.pos.x - casterPos.x, m.pos.z - casterPos.z);
        if (d < bestD) {
          bestD = d;
          best = { x: m.pos.x, z: m.pos.z };
        }
      }
    }
    if (best) return best;
    return {
      x: casterPos.x + Math.sin(rotY) * 5.2,
      z: casterPos.z + Math.cos(rotY) * 5.2
    };
  }

  function playSkillEffectV9(game, skillObj, slotIdx = -1, overrideTier = null, explicitTarget = null) {
    const g = game || window.__kmjInstance || window._kmjGameInstance || window.game || window.app || window.mmorpg;
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
      const facing = Number(g.player.yaw ?? g.player.rotY ?? 0);
      const target = info.isNonAttack
        ? caster
        : findTargetPosV9(g, caster, facing, explicitTarget);
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
    const g = window.__kmjInstance || window._kmjGameInstance || window.game || window.app || window.mmorpg;
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
        syncAllSkillsV9(g, true);
        g?.saveGame?.(false);
        openMagicEvolutionStudioV9();
      };
    });

    modal.querySelectorAll('.v9-tier-sel').forEach(sel => {
      sel.onchange = () => {
        const sid = sel.dataset.sid;
        if (!customMap[sid]) customMap[sid] = {};
        customMap[sid].tier = Number(sel.value);
        syncAllSkillsV9(g, true);
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
  // 11. 着弾タイミング完全同期エンジン（3Dエフェクトとダメージの因果一致）
  // =========================================================
  // 各属性の3Dアニメーション（セクション6・7）の「実際の着弾フレーム」に合わせた秒数設定
  const IMPACT_SYNC_TABLE_V9 = {
    slash_crescent: { delay: 0.14, perDist: 0.035, hits: 1, interval: 0,    shake: 0.18 }, // 真空波が飛んで当たる瞬間
    fire_meteor:    { delay: 0.58, perDist: 0.005, hits: 1, interval: 0,    shake: 0.42 }, // 隕石が地面に激突する瞬間
    fire_pillar:    { delay: 0.24, perDist: 0.004, hits: 1, interval: 0,    shake: 0.28 }, // 炎柱が吹き上がる瞬間
    fire_burst:     { delay: 0.58, perDist: 0.012, hits: 1, interval: 0,    shake: 0.30 }, // 火球が飛んで爆発する瞬間
    fire_eruption:  { delay: 0.30, perDist: 0.004, hits: 1, interval: 0,    shake: 0.34 }, // マグマ噴火のピーク
    ice:            { delay: 0.26, perDist: 0.004, hits: 1, interval: 0,    shake: 0.26 }, // 氷柱が下から突き刺さる瞬間
    thunder:        { delay: 0.14, perDist: 0.002, hits: 1, interval: 0,    shake: 0.34 }, // 稲妻が落ちる瞬間
    wind:           { delay: 0.18, perDist: 0.005, hits: 3, interval: 0.16, shake: 0.16 }, // 竜巻で連続切り刻み（3段）
    water:          { delay: 0.34, perDist: 0.004, hits: 1, interval: 0,    shake: 0.24 }, // 大渦潮・水柱の噴出ピーク
    earth:          { delay: 0.24, perDist: 0.004, hits: 1, interval: 0,    shake: 0.36 }, // 巨岩が隆起する瞬間
    dark:           { delay: 0.82, perDist: 0.003, hits: 1, interval: 0,    shake: 0.45 }, // 吸引後にブラックホール爆発
    poison:         { delay: 0.20, perDist: 0.004, hits: 3, interval: 0.20, shake: 0.12 }, // 瘴気による継続スリップ（3段）
    star:           { delay: 0.56, perDist: 0.005, hits: 2, interval: 0.12, shake: 0.32 }, // 流星群が降り注ぐ瞬間
    sword:          { delay: 0.62, perDist: 0.004, hits: 1, interval: 0,    shake: 0.30 }, // 光剣が回転後に突き刺さる瞬間
    default:        { delay: 0.24, perDist: 0.008, hits: 1, interval: 0,    shake: 0.22 }
  };

  const pendingImpactsV9 = [];

  // 着弾専用の重低音ヒットSE
  function playImpactHitSoundV9(power = 1.0) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!window._kmjV9AudioCtx) window._kmjV9AudioCtx = new AudioCtx();
      const ctx = window._kmjV9AudioCtx;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140 * Math.min(1.4, Math.max(0.8, power)), now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.15);

      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.17);
    } catch (e) {}
  }

// ヒットフラッシュの白発光を確実に元の色へ戻すヘルパー
  function resetMonsterFlashV9(monster) {
    const rootObj = monster?.mesh || monster?.group || monster?.obj;
    if (!rootObj || typeof rootObj.traverse !== 'function') return;
    rootObj.traverse((child) => {
      if (!child.isMesh || !child.material) return;
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((mat) => {
        if (!mat || !mat.emissive) return;
        mat.userData = mat.userData || {};
        clearTimeout(mat.userData._v9FlashTimer);
        if (mat.userData._v9OrigEmissive !== undefined) {
          mat.emissive.setHex(mat.userData._v9OrigEmissive);
          mat.emissiveIntensity = mat.userData._v9OrigEmissiveInt ?? 1;
        }
      });
    });
  }

  // 着弾時の「敵の白発光」＆「カメラ揺れ」
  function triggerImpactVisualsV9(game, monster, shakePower) {
    try {
      // 敵メッシュを一瞬だけ光らせる（共有マテリアルでも元の色を上書きしない安全版）
      const rootObj = monster?.mesh || monster?.group || monster?.obj;
      if (rootObj && typeof rootObj.traverse === 'function') {
        rootObj.traverse((child) => {
          if (!child.isMesh || !child.material) return;
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((mat) => {
            if (!mat || !mat.emissive) return;
            mat.userData = mat.userData || {};
            // 元の色はマテリアル自身(mat.userData)に1回だけ保存する
            if (mat.userData._v9OrigEmissive === undefined) {
              mat.userData._v9OrigEmissive = mat.emissive.getHex();
              mat.userData._v9OrigEmissiveInt = mat.emissiveIntensity ?? 1;
            }
            // 顔文字テクスチャ(mat.map)が白く潰れないよう強度を調整
            mat.emissive.setHex(mat.map ? 0x666666 : 0xaaaaaa);
            mat.emissiveIntensity = mat.map ? 0.55 : 0.85;
            clearTimeout(mat.userData._v9FlashTimer);
            mat.userData._v9FlashTimer = setTimeout(() => {
              if (mat && mat.emissive) {
                mat.emissive.setHex(mat.userData._v9OrigEmissive ?? 0x000000);
                mat.emissiveIntensity = mat.userData._v9OrigEmissiveInt ?? 1;
              }
            }, 80);
          });
        });
      }

      // カメラのマイクロシェイク予約
      if (game && shakePower > 0) {
        game._v9ShakeTime = 0.14;
        game._v9ShakePower = Math.max(game._v9ShakePower || 0, shakePower);
      }
    } catch (e) {}
  }
  // 【連携①-A】スキル実行直前の「敵ステータス」と「ダメージ表示関数」をフック
  function beginCaptureSkillImpactV9(game) {
    const snap = new Map();
    const mList = Array.isArray(game?.monsters) ? game.monsters : [];
    for (let i = 0; i < mList.length; i++) {
      const m = mList[i];
      if (!m) continue;
snap.set(m, {
        hp: Number(m.hp ?? 0),
        vx: Number(m.vx ?? m.vel?.x ?? 0),
        vy: Number(m.vy ?? m.vel?.y ?? 0),
        vz: Number(m.vz ?? m.vel?.z ?? 0),
        dead: Boolean(m.dead),
        groupVisible: m.group ? m.group.visible : true,
        plateDisplay: m.plateEl ? m.plateEl.style.display : 'block'
      });
    }
    
    // 本体側がスキル発動瞬間に飛ばすダメージ数字を一時保留する
    const capturedTexts = [];
    const origFloat1 = game?.spawnFloatText;
    const origFloat2 = game?.spawnFloatingText;

    if (typeof origFloat1 === 'function') {
      game.spawnFloatText = function (...args) {
        capturedTexts.push({ fn: origFloat1, args });
      };
    }
    if (typeof origFloat2 === 'function') {
      game.spawnFloatingText = function (...args) {
        capturedTexts.push({ fn: origFloat2, args });
      };
    }

    return { snap, capturedTexts, origFloat1, origFloat2 };
  }

  // 【連携①-B & ②】スキル実行直後にダメージを巻き戻し、3Dエフェクトの着弾時間に合わせて予約
  function finishCaptureSkillImpactV9(game, info, captureState) {
    if (!captureState) return;
    const { snap, capturedTexts, origFloat1, origFloat2 } = captureState;

    // フックしていたダメージ数字関数を必ず元に戻す
    if (game) {
      if (origFloat1) game.spawnFloatText = origFloat1;
      if (origFloat2) game.spawnFloatingText = origFloat2;
    }

    // 非攻撃スキル（回復・聖盾・聖域・咆哮）なら保留テキストをそのまま出して終了
    if (!info || info.isNonAttack) {
      capturedTexts.forEach(t => { try { t.fn.apply(game, t.args); } catch (e) {} });
      return;
    }

    const syncCfg = IMPACT_SYNC_TABLE_V9[info.attr?.id] || IMPACT_SYNC_TABLE_V9.default;
    const pPos = game?.player?.pos || { x: 0, z: 0 };
    const mList = Array.isArray(game?.monsters) ? game.monsters : [];

    // 敵ごとのダメージ・ノックバックを巻き戻して予約キューへ登録
    let firstTargetQueueItem = null;

    for (let i = 0; i < mList.length; i++) {
      const m = mList[i];
      const prev = snap.get(m);
      if (!m || !prev) continue;

      const curHp = Number(m.hp ?? 0);
      const totalDmg = prev.hp - curHp;
      if (totalDmg <= 0) continue;

// 1. HPと死亡フラグ・表示状態を「攻撃前」に巻き戻す（着弾するまで敵が消えないようにする）
      m.hp = prev.hp;
      if (!prev.dead) {
        m.dead = false;
        if (m.group) m.group.visible = prev.groupVisible;
        if (m.plateEl) m.plateEl.style.display = prev.plateDisplay;
      }

      // 2. 吹き飛び（ノックバック）速度も「攻撃前」に巻き戻す
      const kvx = Number(m.vx ?? m.vel?.x ?? 0) - prev.vx;
      const kvy = Number(m.vy ?? m.vel?.y ?? 0) - prev.vy;
      const kvz = Number(m.vz ?? m.vel?.z ?? 0) - prev.vz;
      if (typeof m.vx === 'number') m.vx = prev.vx;
      if (typeof m.vy === 'number') m.vy = prev.vy;
      if (typeof m.vz === 'number') m.vz = prev.vz;
      if (m.vel) {
        m.vel.x = prev.vx;
        m.vel.y = prev.vy;
        m.vel.z = prev.vz;
      }

      // 3. プレイヤーと敵の距離から着弾までの秒数を算出
      const mPos = m.pos || pPos;
      const dist = Math.hypot((mPos.x || 0) - (pPos.x || 0), (mPos.z || 0) - (pPos.z || 0));
      const impactDelay = syncCfg.delay + dist * syncCfg.perDist;

      // 4. 多段スキル（竜巻・瘴気など）はダメージを分割して予約
      const hits = Math.max(1, syncCfg.hits || 1);
      const dmgPerHit = totalDmg / hits;

      for (let h = 0; h < hits; h++) {
        const entry = {
          game,
          monster: m,
          damage: dmgPerHit,
          isLastHit: h === hits - 1,
          kvx: h === 0 ? kvx : kvx * 0.2,
          kvy: h === 0 ? kvy : kvy * 0.2,
          kvz: h === 0 ? kvz : kvz * 0.2,
          timer: impactDelay + h * (syncCfg.interval || 0.14),
          shake: h === 0 ? syncCfg.shake : syncCfg.shake * 0.4,
          playSound: h === 0 || h === hits - 1,
          texts: []
        };
        if (!firstTargetQueueItem && h === 0) {
          firstTargetQueueItem = entry;
        }
        pendingImpactsV9.push(entry);
      }
    }

    // 保留していたダメージ数字を、一番近い着弾タイミングのキューに紐づける
    if (capturedTexts.length > 0) {
      if (firstTargetQueueItem) {
        firstTargetQueueItem.texts.push(...capturedTexts);
      } else {
        // 敵に当たらなかったテキスト（Miss等）は少し遅らせて表示
        setTimeout(() => {
          capturedTexts.forEach(t => { try { t.fn.apply(game, t.args); } catch (e) {} });
        }, Math.round(syncCfg.delay * 1000));
      }
    }
  }

  // 【連携③】毎フレーム更新（proto.update から呼ばれ、着弾した敵から順にダメージ確定）
  function updatePendingImpactsV9(game, dt) {
    const step = Math.min(0.05, Math.max(0.001, dt || 0.016));

    // 1. 着弾タイマーの進行とダメージ解放
    for (let i = pendingImpactsV9.length - 1; i >= 0; i--) {
      const item = pendingImpactsV9[i];
      item.timer -= step;
      if (item.timer > 0) continue;

      pendingImpactsV9.splice(i, 1);
      const { game: g, monster: m, damage, kvx, kvy, kvz, shake, playSound, texts } = item;
      if (!m) continue;

      // ダメージ確定
      const dmgInt = Math.max(1, Math.round(damage));
      if (typeof m.hp === 'number') {
        m.hp = Math.max(0, m.hp - dmgInt);
      }

      // ノックバック解放
      if (typeof m.vx === 'number') m.vx += kvx;
      if (typeof m.vy === 'number') m.vy += kvy;
      if (typeof m.vz === 'number') m.vz += kvz;
      if (m.vel) {
        m.vel.x = (m.vel.x || 0) + kvx;
        m.vel.y = (m.vel.y || 0) + kvy;
        m.vel.z = (m.vel.z || 0) + kvz;
      }

      // 保留していたダメージ数字をここでポップアップ
      if (texts && texts.length > 0) {
        texts.forEach(t => { try { t.fn.apply(g, t.args); } catch (e) {} });
      } else if (g && m.pos) {
        (g.spawnFloatText || g.spawnFloatingText)?.call(g, m.pos, `💥-${dmgInt}`, '#fde047');
      }

// HPが0になった瞬間に撃破状態にし、3DモデルとHPバーを即座に消す
      if (typeof m.hp === 'number' && m.hp <= 0) {
        m.hp = 0;
        m.dead = true;
        resetMonsterFlashV9(m);
        if (!m.respawnTimer || m.respawnTimer <= 0) {
          m.respawnTimer = m.isBoss ? 13.0 : 5.5;
        }
        if (m.casting) {
          m.casting = null;
          document.getElementById('boss-cast-box')?.classList.add('hidden');
        }
        if (m.group) m.group.visible = false;
        if (m.plateEl) m.plateEl.style.display = 'none';
        if (g?.selectedTarget === m) g.selectedTarget = null;
        if (typeof g?.killMonster === 'function') {
          try { g.killMonster(m); } catch (e) {}
        } else if (typeof g?.onMonsterDeath === 'function') {
          try { g.onMonsterDeath(m); } catch (e) {}
        }
      }

      // 白発光・カメラ揺れ・着弾SE
      triggerImpactVisualsV9(g, m, shake);
      if (playSound) playImpactHitSoundV9(1.0);
    }

    // 2. カメラのマイクロシェイク更新（座標ズレ防止付き）
    if (game?.camera?.position) {
      if (game._v9LastShakeOffset) {
        game.camera.position.x -= game._v9LastShakeOffset.x;
        game.camera.position.y -= game._v9LastShakeOffset.y;
        game._v9LastShakeOffset = null;
      }
      if (game._v9ShakeTime > 0) {
        game._v9ShakeTime -= step;
        const p = (game._v9ShakePower || 0.2) * Math.max(0, game._v9ShakeTime / 0.14);
        const ox = (Math.random() - 0.5) * p;
        const oy = (Math.random() - 0.5) * p;
        game.camera.position.x += ox;
        game.camera.position.y += oy;
        game._v9LastShakeOffset = { x: ox, y: oy };
      }
    }
  }

  // =========================================================
  // 12. 本体フック＆無限再帰・二重発火・非攻撃スキルの完全ガード
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

      if (typeof proto.refreshAllHUD === 'function' && !proto._v9Guard_refreshAllHUD) {
        const origRefreshAllHUD = proto.refreshAllHUD;
        proto.refreshAllHUD = function (...args) {
          if (this._v9InRefreshHUD) return;
          this._v9InRefreshHUD = true;
          try {
            return origRefreshAllHUD.apply(this, args);
          } finally {
            this._v9InRefreshHUD = false;
          }
        };
        proto._v9Guard_refreshAllHUD = true;
      }

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

      // ★ 連携ポイント①・②：スキル実行を挟み込んでダメージを遅らせる
// ★ 連携ポイント①・②：未設定・クールタイム中の誤発動を完全に防ぎつつダメージを同期
      ['useSkillSlot', 'executeSingleSkillCast', 'useSkill', 'castSkill', 'executeSkill'].forEach(fn => {
        if (typeof proto[fn] === 'function' && !proto[`_v9Hook_${fn}`]) {
          const orig = proto[fn];
          proto[fn] = function (slotOrId, targetArg, ...rest) {
            window.__kmjInstance = this;
            const isTopLevelCall = !this._v9CastDepth || this._v9CastDepth <= 0;
            this._v9CastDepth = (this._v9CastDepth || 0) + 1;

            try {
              if (!isTopLevelCall) {
                return orig.apply(this, [slotOrId, targetArg, ...rest]);
              }

              const now = performance.now();
              if (this._v9LastCastStamp && (now - this._v9LastCastStamp) < 90) {
                return false;
              }

              const { sk, slotIdx } = resolveSkillEntryV9(this, slotOrId);

              // 1. スキルが設定されていない空きスロットなら何もしない
              if (!sk) {
                return false;
              }

              const preInfo = getSkillInfoV9(this, sk, slotIdx);
              const isDebugOn = Boolean(this._debugInfiniteMode === true || window.KMJ_DEBUG?.isActive?.(this));

              // 2. クールタイム中の発動をブロック（本体側とV9側の両方のCDを確認）
              if (!isDebugOn) {
                if (!this._v9CdUntil) this._v9CdUntil = {};
                const cdKey = slotIdx >= 0 ? `slot_${slotIdx}` : `sk_${preInfo.sid}`;
                if (this._v9CdUntil[cdKey] && now < this._v9CdUntil[cdKey]) {
                  return false;
                }
                const coreCd = Number(
                  (slotIdx >= 0 ? (this.skillCooldowns?.[slotIdx] ?? this.slotCooldowns?.[slotIdx] ?? this.cooldowns?.[slotIdx]) : 0)
                  ?? this.skillCooldowns?.[preInfo.sid]
                  ?? this.cooldowns?.[preInfo.sid]
                  ?? sk.currentCd
                  ?? sk.remainCd
                  ?? 0
                );
                if (coreCd > 0.05) {
                  return false;
                }
              }

              this._v9LastCastStamp = now;
              if (preInfo?.isNonAttack) {
                this._v9SuppressAttackUntil = performance.now() + 220;
              }

              // 実行前のMP・CD・モーション値を記録（本体が実際にスキルを発動したか判定するため）
              const mpBefore = Number(this.player?.mp ?? this.saveData?.mp ?? 0);
              const animBefore = Number(this.player?.attackAnimTimer ?? 0);
              const cdBefore = Number(
                (slotIdx >= 0 ? (this.skillCooldowns?.[slotIdx] ?? this.slotCooldowns?.[slotIdx]) : 0)
                ?? this.skillCooldowns?.[preInfo.sid]
                ?? sk.currentCd
                ?? 0
              );

              // 【入り口】ダメージ・吹き飛び・ダメージ数字の監視開始
              const captureState = beginCaptureSkillImpactV9(this);
              let res;
              try {
                res = orig.apply(this, [slotOrId, targetArg, ...rest]);
              } finally {
                // 【時間合わせ】即時ダメージを巻き戻して着弾キューへ予約
                finishCaptureSkillImpactV9(this, preInfo, captureState);
              }

              // 3. 本体が「MP不足」や「クールタイム」で弾いた場合は演出・効果を一切出さない
              const mpAfter = Number(this.player?.mp ?? this.saveData?.mp ?? 0);
              const animAfter = Number(this.player?.attackAnimTimer ?? 0);
              const cdAfter = Number(
                (slotIdx >= 0 ? (this.skillCooldowns?.[slotIdx] ?? this.slotCooldowns?.[slotIdx]) : 0)
                ?? this.skillCooldowns?.[preInfo.sid]
                ?? sk.currentCd
                ?? 0
              );

              const didConsumeMp = mpAfter < mpBefore - 0.01;
              const didTriggerCd = cdAfter > cdBefore + 0.05;
              const didTriggerAnim = animAfter > animBefore + 0.01;
              const didActuallyCast = (res === true) || didConsumeMp || didTriggerCd || didTriggerAnim || isDebugOn;

              if (res !== false && didActuallyCast) {
                // V9側でもクールタイムを記録して連打・CD無視を二重防止
                if (!this._v9CdUntil) this._v9CdUntil = {};
                const cdKey = slotIdx >= 0 ? `slot_${slotIdx}` : `sk_${preInfo.sid}`;
                const cdSec = Math.max(0.8, Number(sk.cd ?? sk.cooldown ?? (didTriggerCd ? cdAfter : 2.0)));
                this._v9CdUntil[cdKey] = performance.now() + cdSec * 1000;

                playSkillEffectV9(this, sk, slotIdx, null, targetArg);
              }
              return res;
            } finally {
              this._v9CastDepth = Math.max(0, (this._v9CastDepth || 1) - 1);
            }
          };
          proto[`_v9Hook_${fn}`] = true;
        }
      });

      // ★ 連携ポイント③：毎フレーム更新で着弾タイマーを進めて解放する
      if (typeof proto.update === 'function' && !proto._v9UpdateWrapped) {
        const origUpdate = proto.update;
        proto.update = function (dt = 0.016, ...rest) {
          window.__kmjInstance = this;
          const res = origUpdate.apply(this, [dt, ...rest]);
          if (activeSanctuariesV9.length > 0) {
            try {
              V9.updateSanctuaryFields(this, dt);
            } catch (e) {}
          }
          // 【出口】着弾タイミングに到達したダメージと演出を解放
          if (pendingImpactsV9.length > 0 || this._v9ShakeTime > 0 || this._v9LastShakeOffset) {
            try {
              updatePendingImpactsV9(this, dt);
            } catch (e) {}
          }
          return res;
        };
        proto._v9UpdateWrapped = true;
      }
    });
  }

  Object.assign(V9, {
    getAll14Skills: getAllSkillsListV9,
    getSkillInfo: getSkillInfoV9,
    syncAllSkills: (g) => syncAllSkillsV9(g, false),
    openStudio: openMagicEvolutionStudioV9,
    previewSkillByObj: (game, sk, tier) => playSkillEffectV9(game, sk, -1, tier)
  });

  installV9MasterHooks();

  window.addEventListener('load', () => {
    setTimeout(() => {
      ensureStudioButtonV9();
      syncAllSkillsV9(null, true);
    }, 600);
  });
  setTimeout(() => {
    ensureStudioButtonV9();
    syncAllSkillsV9(null, true);
  }, 500);

  function resetMonsterFlashV9(monster) {
    const rootObj = monster?.mesh || monster?.group || monster?.obj;
    if (!rootObj || typeof rootObj.traverse !== 'function') return;
    rootObj.traverse((child) => {
      if (!child.isMesh || !child.material) return;
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((mat) => {
        if (!mat || !mat.emissive) return;
        mat.userData = mat.userData || {};
        clearTimeout(mat.userData._v9FlashTimer);
        mat.userData._v9FlashUntil = 0;
        if (mat.userData._v9OrigEmissive !== undefined) {
          mat.emissive.setHex(mat.userData._v9OrigEmissive);
          mat.emissiveIntensity = mat.userData._v9OrigEmissiveInt ?? 1;
        }
      });
    });
  }

  triggerImpactVisualsV9 = function (game, monster, shakePower) {
    try {
      const rootObj = monster?.mesh || monster?.group || monster?.obj;
      if (rootObj && typeof rootObj.traverse === 'function') {
        rootObj.traverse((child) => {
          if (!child.isMesh || !child.material) return;
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((mat) => {
            if (!mat || !mat.emissive) return;
            mat.userData = mat.userData || {};
            if (mat.userData._v9OrigEmissive === undefined) {
              mat.userData._v9OrigEmissive = mat.emissive.getHex();
              mat.userData._v9OrigEmissiveInt = mat.emissiveIntensity ?? 1;
            }
            mat.emissive.setHex(mat.map ? 0x666666 : 0xaaaaaa);
            mat.emissiveIntensity = mat.map ? 0.55 : 0.85;
            mat.userData._v9FlashUntil = performance.now() + 85;
            clearTimeout(mat.userData._v9FlashTimer);
            mat.userData._v9FlashTimer = setTimeout(() => {
              if (mat && mat.emissive) {
                mat.emissive.setHex(mat.userData._v9OrigEmissive ?? 0x000000);
                mat.emissiveIntensity = mat.userData._v9OrigEmissiveInt ?? 1;
                mat.userData._v9FlashUntil = 0;
              }
            }, 80);
          });
        });
      }
      if (game && shakePower > 0) {
        game._v9ShakeTime = 0.14;
        game._v9ShakePower = Math.max(game._v9ShakePower || 0, shakePower);
      }
    } catch (e) {}
  };

  updatePendingImpactsV9 = function (game, dt) {
    const step = Math.min(0.05, Math.max(0.001, dt || 0.016));

    for (let i = pendingImpactsV9.length - 1; i >= 0; i--) {
      const item = pendingImpactsV9[i];
      item.timer -= step;
      if (item.timer > 0) continue;

      pendingImpactsV9.splice(i, 1);
      const { game: g, monster: m, damage, kvx, kvy, kvz, shake, playSound, texts } = item;
      if (!m) continue;

      const dmgInt = Math.max(1, Math.round(damage));
      if (typeof m.hp === 'number') {
        m.hp = Math.max(0, m.hp - dmgInt);
      }

      if (typeof m.vx === 'number') m.vx += kvx;
      if (typeof m.vy === 'number') m.vy += kvy;
      if (typeof m.vz === 'number') m.vz += kvz;
      if (m.vel) {
        m.vel.x = (m.vel.x || 0) + kvx;
        m.vel.y = (m.vel.y || 0) + kvy;
        m.vel.z = (m.vel.z || 0) + kvz;
      }

      if (texts && texts.length > 0) {
        texts.forEach(t => { try { t.fn.apply(g, t.args); } catch (e) {} });
      } else if (g && m.pos) {
        (g.spawnFloatText || g.spawnFloatingText)?.call(g, m.pos, `💥-${dmgInt}`, '#fde047');
      }

      if (typeof m.hp === 'number' && m.hp <= 0) {
        m.hp = 0;
        m.dead = true;
        resetMonsterFlashV9(m);
        if (!m.respawnTimer || m.respawnTimer <= 0) {
          m.respawnTimer = m.isBoss ? 13.0 : 5.5;
        }
        if (m.casting) {
          m.casting = null;
          document.getElementById('boss-cast-box')?.classList.add('hidden');
        }
        if (m.group) m.group.visible = false;
        if (m.plateEl) m.plateEl.style.display = 'none';
        if (g?.selectedTarget === m) g.selectedTarget = null;
        if (typeof g?.killMonster === 'function') {
          try { g.killMonster(m); } catch (e) {}
        } else if (typeof g?.onMonsterDeath === 'function') {
          try { g.onMonsterDeath(m); } catch (e) {}
        }
      } else {
        triggerImpactVisualsV9(g, m, shake);
      }

      if (playSound) playImpactHitSoundV9(1.0);
    }

    if (game?.camera?.position) {
      if (game._v9LastShakeOffset) {
        game.camera.position.x -= game._v9LastShakeOffset.x;
        game.camera.position.y -= game._v9LastShakeOffset.y;
        game._v9LastShakeOffset = null;
      }
      if (game._v9ShakeTime > 0) {
        game._v9ShakeTime -= step;
        const p = (game._v9ShakePower || 0.2) * Math.max(0, game._v9ShakeTime / 0.14);
        const ox = (Math.random() - 0.5) * p;
        const oy = (Math.random() - 0.5) * p;
        game.camera.position.x += ox;
        game.camera.position.y += oy;
        game._v9LastShakeOffset = { x: ox, y: oy };
      }
    }
  };

  if (typeof KaomojiMMORPG !== 'undefined' && !KaomojiMMORPG.prototype._v9CleanupHooked) {
    const _origUpdateCleanup = KaomojiMMORPG.prototype.update;
    KaomojiMMORPG.prototype.update = function (...args) {
      const res = _origUpdateCleanup.apply(this, args);
      if (Array.isArray(this.monsters)) {
        const now = performance.now();
        for (let i = 0; i < this.monsters.length; i++) {
          const m = this.monsters[i];
          if (!m) continue;
          if (m.dead || m.hp <= 0) {
            if (m.plateEl && m.plateEl.style.display !== 'none') m.plateEl.style.display = 'none';
            if (m.group && m.group.visible) m.group.visible = false;
            resetMonsterFlashV9(m);
          } else {
            const rootObj = m.mesh || m.group || m.obj;
            rootObj?.traverse?.((child) => {
              const mats = Array.isArray(child.material) ? child.material : [child.material];
              mats.forEach((mat) => {
                if (mat?.userData?._v9FlashUntil && now > mat.userData._v9FlashUntil) {
                  mat.emissive?.setHex(mat.userData._v9OrigEmissive ?? 0x000000);
                  mat.emissiveIntensity = mat.userData._v9OrigEmissiveInt ?? 1;
                  mat.userData._v9FlashUntil = 0;
                }
              });
            });
          }
        }
      }
      return res;
    };
    KaomojiMMORPG.prototype._v9CleanupHooked = true;
  }
// =========================================================
  // 13. MP完全回復保証・本格3D魔法杖・クラス進化リセット機能
  // =========================================================

  // 不要になった旧「🔄 役職」ボタン・モーダルが残っていれば削除
  document.getElementById('kmj-v9-open-job-btn')?.remove();
  document.getElementById('kmj-v9-job-modal')?.remove();

  // (A) 回復スキル（聖光の癒し等）のMP回復量を大幅強化（回復しきらない問題を解消）
  const _origApplyNonAttackV9 = applyNonAttackSupportEffectV9;
  applyNonAttackSupportEffectV9 = function (game, info) {
    if (!game || !info?.isNonAttack) return;
    const sup = info.attr?.supportType || 'heal';
    if (sup === 'heal') {
      const p = game.player;
      const d = game.saveData;
      const tier = info.tier || 0;
      const st = typeof game.calcDerivedStats === 'function'
        ? game.calcDerivedStats()
        : (typeof game.getPlayerStats === 'function' ? game.getPlayerStats() : {});
      const maxHp = Math.max(Number(st?.maxHp || 0), Number(p?.maxHp || 0), Number(d?.maxHp || 100));
      const maxMp = Math.max(Number(st?.maxMp || 0), Number(p?.maxMp || 0), Number(d?.maxMp || 100));

      const healHp = Math.max(20, Math.floor(maxHp * (0.45 + tier * 0.18)));
      const healMp = tier >= 3 ? maxMp : Math.max(25, Math.ceil(maxMp * (0.55 + tier * 0.15)));

      if (p) {
        p.maxHp = maxHp;
        p.maxMp = maxMp;
        if (typeof p.hp === 'number') p.hp = Math.min(maxHp, p.hp + healHp);
        if (typeof p.mp === 'number') p.mp = Math.min(maxMp, p.mp + healMp);
      }
      if (d) {
        d.maxHp = maxHp;
        d.maxMp = maxMp;
        if (typeof d.hp === 'number') d.hp = Math.min(maxHp, d.hp + healHp);
        if (typeof d.mp === 'number') d.mp = Math.min(maxMp, d.mp + healMp);
      }

      (game.spawnFloatText || game.spawnFloatingText)?.call(game, p?.pos, `💖+${healHp} / 💧+${healMp}`, '#fde047');
      game.showAlertBanner?.(`💖 ${info.evolvedName}！HP +${healHp} / MP +${healMp} 回復`, 1800);

      if (!game._v9InRefreshHUD && typeof game.refreshAllHUD === 'function') {
        game._v9InRefreshHUD = true;
        try { game.refreshAllHUD(); } finally { game._v9InRefreshHUD = false; }
      }
      return;
    }
    return _origApplyNonAttackV9(game, info);
  };

  // (B) 装備武器の判定＆本格3D魔法杖モデルの生成・自動装着
  function getEquippedWeaponInfoV9(game) {
    const d = game?.saveData || {};
    const p = game?.player || {};
    const eq = d.equip || d.equipment || p.equip || p.equipment || {};
    const wObj = eq.weapon || eq.mainHand || eq.rightHand || d.weapon || p.weapon || d.equippedWeapon || p.equippedWeapon || '';
    if (typeof wObj === 'string') {
      return { id: wObj, name: wObj, type: wObj };
    }
    if (wObj && typeof wObj === 'object') {
      return {
        id: String(wObj.id || wObj.itemId || wObj.key || ''),
        name: String(wObj.name || wObj.title || wObj.label || wObj.id || ''),
        type: String(wObj.type || wObj.subType || wObj.weaponType || wObj.category || '')
      };
    }
    return { id: '', name: '', type: '' };
  }

  function isStaffWeaponEquippedV9(game) {
    const w = getEquippedWeaponInfoV9(game);
    const txt = `${w.id} ${w.name} ${w.type}`.trim();
    if (!txt) return false;
    return /杖|スタッフ|ワンド|ロッド|ステッキ|セプター|魔導杖|魔杖|賢者|staff|wand|rod|scepter|cane/i.test(txt);
  }

  function buildFancyMagicStaffGroupV9() {
    const grp = new THREE.Group();
    grp.name = 'v9_fancy_magic_staff';

    const shaftMat = new THREE.MeshBasicMaterial({ color: 0x5c2d16 });
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.044, 1.85, 10), shaftMat);
    grp.add(shaft);

    const goldMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    [-0.88, -0.25, 0.35, 0.78].forEach((by, idx) => {
      const band = new THREE.Mesh(
        new THREE.CylinderGeometry(0.048 + (idx === 3 ? 0.012 : 0), 0.048, 0.06, 10),
        goldMat
      );
      band.position.y = by;
      grp.add(band);
    });

    const bottomCap = new THREE.Mesh(new THREE.ConeGeometry(0.052, 0.18, 8), goldMat);
    bottomCap.rotation.x = Math.PI;
    bottomCap.position.y = -0.99;
    grp.add(bottomCap);

    const crescent = new THREE.Mesh(
      new THREE.TorusGeometry(0.23, 0.032, 8, 22, Math.PI * 1.4),
      goldMat
    );
    crescent.position.y = 1.02;
    crescent.rotation.z = Math.PI * 0.8;
    grp.add(crescent);

    const wingMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc, side: THREE.DoubleSide });
    [-1, 1].forEach((dir) => {
      const wing = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.34, 4), wingMat);
      wing.position.set(dir * 0.21, 0.92, 0);
      wing.rotation.z = -dir * 0.72;
      grp.add(wing);

      const subWing = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.24, 4), goldMat);
      subWing.position.set(dir * 0.16, 0.80, 0);
      subWing.rotation.z = -dir * 0.95;
      grp.add(subWing);
    });

    const gemMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.135, 0), gemMat);
    gem.position.y = 1.05;
    grp.add(gem);

    const gemCoreMat = new THREE.MeshBasicMaterial({ color: 0xf472b6, wireframe: true });
    const gemCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.165, 0), gemCoreMat);
    gemCore.position.y = 1.05;
    grp.add(gemCore);

    const haloMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });
    const haloRing = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.015, 6, 20), haloMat);
    haloRing.position.y = 1.05;
    haloRing.rotation.x = Math.PI / 2 - 0.35;
    grp.add(haloRing);

    grp.userData._v9Gem = gem;
    grp.userData._v9GemCore = gemCore;
    grp.userData._v9Halo = haloRing;
    return grp;
  }

  function findPlayerWeaponAnchorV9(player) {
    if (!player) return null;
    const directCandidates = [
      player.weaponMesh,
      player.rightWeaponMesh,
      player.weaponObj,
      player.equipWeaponMesh,
      player.handWeapon
    ];
    for (let i = 0; i < directCandidates.length; i++) {
      if (directCandidates[i] && directCandidates[i].parent) {
        return directCandidates[i];
      }
    }

    const rootObj = player.mesh || player.group || player.obj;
    if (!rootObj || typeof rootObj.traverse !== 'function') return null;

    let namedMatch = null;
    let rodLikeMatch = null;
    rootObj.traverse((child) => {
      if (namedMatch) return;
      if (child === rootObj || child.name === 'v9_fancy_magic_staff') return;
      if (child.parent?.name === 'v9_fancy_magic_staff') return;
      const nm = String(child.name || '').toLowerCase();
      if (/weapon|sword|staff|wand|rod|blade|equip|righthand|r_hand/.test(nm)) {
        namedMatch = child;
        return;
      }
      if (child.isMesh && !rodLikeMatch) {
        const sx = Math.abs(child.scale?.x || 1);
        const sy = Math.abs(child.scale?.y || 1);
        const sz = Math.abs(child.scale?.z || 1);
        const isOffset = Math.hypot(child.position?.x || 0, child.position?.z || 0) > 0.18;
        if (isOffset && (sy > sx * 2.5 || sz > sx * 2.5)) {
          rodLikeMatch = child;
        }
      }
    });
    return namedMatch || rodLikeMatch;
  }

  function updateStaffAppearanceV9(game) {
    if (!game?.useWebGL || !game?.player || typeof THREE === 'undefined') return;
    const p = game.player;
    const wantStaff = isStaffWeaponEquippedV9(game);
    const anchor = findPlayerWeaponAnchorV9(p);

    if (!anchor || !anchor.parent) return;

    if (wantStaff) {
      if (anchor.visible) {
        anchor.userData._v9WasVisible = true;
        anchor.visible = false;
      }
      let staffGrp = anchor.parent.getObjectByName('v9_fancy_magic_staff');
      if (!staffGrp) {
        staffGrp = buildFancyMagicStaffGroupV9();
        anchor.parent.add(staffGrp);
      }
      staffGrp.visible = true;
      staffGrp.position.copy(anchor.position);
      staffGrp.rotation.copy(anchor.rotation);
      staffGrp.scale.set(1.08, 1.08, 1.08);

      const now = performance.now() * 0.001;
      const isCasting = (p.attackAnimTimer || 0) > 0;
      const spinMult = isCasting ? 5.5 : 1.6;
      const { _v9Gem, _v9GemCore, _v9Halo } = staffGrp.userData;
      if (_v9Gem) {
        _v9Gem.rotation.y = now * spinMult;
        _v9Gem.position.y = 1.05 + Math.sin(now * 3.5) * 0.035;
      }
      if (_v9GemCore) {
        _v9GemCore.rotation.y = -now * spinMult * 1.3;
        _v9GemCore.rotation.x = now * 1.4;
        _v9GemCore.position.y = 1.05 + Math.sin(now * 3.5) * 0.035;
      }
      if (_v9Halo) {
        _v9Halo.rotation.z = now * spinMult * 1.8;
        _v9Halo.position.y = 1.05 + Math.sin(now * 3.5) * 0.035;
      }
    } else {
      const staffGrp = anchor.parent.getObjectByName('v9_fancy_magic_staff');
      if (staffGrp) staffGrp.visible = false;
      if (anchor.userData?._v9WasVisible) {
        anchor.visible = true;
      }
    }
  }

  // (C) 「🌟 クラス進化」リセット機能（能力・進化タブ内に直接ボタン配置）
  function getInitialEvolutionIdV9() {
    if (typeof EVOLUTIONS !== 'undefined' && EVOLUTIONS) {
      if (EVOLUTIONS.novice) return 'novice';
      const keys = Object.keys(EVOLUTIONS);
      if (keys.length > 0) return keys[0];
    }
    return 'novice';
  }

  function resetClassEvolutionV9(game) {
    const g = game || window.__kmjInstance || window._kmjGameInstance || window.game || window.app || window.mmorpg;
    if (!g || !g.saveData) return;

    const d = g.saveData;
    const initId = getInitialEvolutionIdV9();
    const curId = d.evolutionId || initId;

    if (curId === initId) {
      g.showAlertBanner?.('すでに初期クラス状態です！', 1800);
      return;
    }

    const executeReset = () => {
      d.evolutionId = initId;
      if (Array.isArray(d.evolutionHistory)) d.evolutionHistory = [];

      // ステータスとHP/MP上限の再計算
      if (typeof g.calcDerivedStats === 'function') {
        try {
          const st = g.calcDerivedStats();
          if (g.player && st) {
            if (st.maxHp) {
              g.player.maxHp = st.maxHp;
              d.maxHp = st.maxHp;
              if (typeof g.player.hp === 'number') g.player.hp = Math.min(g.player.hp, st.maxHp);
            }
            if (st.maxMp) {
              g.player.maxMp = st.maxMp;
              d.maxMp = st.maxMp;
              if (typeof g.player.mp === 'number') g.player.mp = Math.min(g.player.mp, st.maxMp);
            }
          }
        } catch (e) {}
      }

      // プレイヤー見た目・HUD・セーブ・能力進化タブを即時更新
      try { g.rebuildPlayerMesh?.(); } catch (e) {}
      try { g.updatePlayerMesh?.(); } catch (e) {}
      if (!g._v9InRefreshHUD && typeof g.refreshAllHUD === 'function') {
        g._v9InRefreshHUD = true;
        try { g.refreshAllHUD(); } finally { g._v9InRefreshHUD = false; }
      }
      try { g.saveGame?.(false); } catch (e) {}
      try { g.openGrowthModal?.('stats'); } catch (e) {}

      const initName = (typeof EVOLUTIONS !== 'undefined' && EVOLUTIONS?.[initId]?.name) || '見習い顔文字';
      g.showAlertBanner?.(`🔄 クラス進化をリセットしました！（${initName}に戻りました）`, 2400);
    };

    if (typeof g.showConfirmDialog === 'function') {
      g.showConfirmDialog(
        '🔄 クラス進化リセット',
        '現在のクラス進化を初期状態（見習い顔文字）に戻しますか？\n※リセット後は別の進化ルートへ進み直すことができます。',
        executeReset
      );
    } else if (window.confirm('現在のクラス進化を初期状態に戻しますか？')) {
      executeReset();
    }
  }

  function injectClassEvolutionResetButtonV9() {
    const modalBody = document.getElementById('modal-body');
    if (!modalBody) return;
    if (document.getElementById('kmj-v9-evo-reset-btn')) return;

    // 「🌟 クラス進化 (現在 : ...)」の見出し要素を探す
    const candidates = modalBody.querySelectorAll('div, span, h3, h4, p, b');
    let headerEl = null;
    for (let i = 0; i < candidates.length; i++) {
      const el = candidates[i];
      if (el.children.length > 2) continue;
      const txt = el.textContent || '';
      if (txt.includes('クラス進化') && txt.includes('現在')) {
        headerEl = el;
        break;
      }
    }
    if (!headerEl) return;

    const g = window.__kmjInstance || window._kmjGameInstance || window.game || window.app || window.mmorpg;
    const initId = getInitialEvolutionIdV9();
    const curId = g?.saveData?.evolutionId || initId;
    const isInitial = curId === initId;

    const btn = document.createElement('button');
    btn.id = 'kmj-v9-evo-reset-btn';
    btn.type = 'button';
    btn.className = 'btn-ui btn-rose';
    btn.style.cssText = 'padding:4px 10px;font-size:11px;margin-left:auto;flex-shrink:0;';
    btn.textContent = isInitial ? '初期クラス' : '🔄 進化リセット';
    btn.disabled = isInitial;
    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      resetClassEvolutionV9(g);
    };

    headerEl.style.display = 'flex';
    headerEl.style.alignItems = 'center';
    headerEl.style.justifyContent = 'space-between';
    headerEl.style.gap = '8px';
    headerEl.style.flexWrap = 'wrap';
    headerEl.appendChild(btn);
  }

  // 冒険者メニューの描画を監視してボタンを自動差し込み
  function installEvolutionResetObserverV9() {
    const modalBody = document.getElementById('modal-body');
    if (modalBody && !modalBody._v9EvoObserverInstalled) {
      const obs = new MutationObserver(() => {
        injectClassEvolutionResetButtonV9();
      });
      obs.observe(modalBody, { childList: true, subtree: true });
      modalBody._v9EvoObserverInstalled = true;
    }
    injectClassEvolutionResetButtonV9();
  }
  setTimeout(installEvolutionResetObserverV9, 500);

  // (D) 毎フレーム更新フック：MP最大値同期＆完全回復保証＋3D魔法杖更新
  if (typeof KaomojiMMORPG !== 'undefined' && !KaomojiMMORPG.prototype._v9MpAndStaffHooked) {
    const _origUpdateMpStaff = KaomojiMMORPG.prototype.update;
    KaomojiMMORPG.prototype.update = function (dt = 0.016, ...rest) {
      const res = _origUpdateMpStaff.apply(this, [dt, ...rest]);
      const step = Math.min(0.1, Math.max(0.001, dt || 0.016));

      if (this.player && this.saveData) {
        const p = this.player;
        const d = this.saveData;
        const now = performance.now();

        this._v9MpSyncAcc = (this._v9MpSyncAcc || 0) + step;
        if (this._v9MpSyncAcc >= 0.25) {
          const elapsed = this._v9MpSyncAcc;
          this._v9MpSyncAcc = 0;

          const st = typeof this.calcDerivedStats === 'function'
            ? this.calcDerivedStats()
            : (typeof this.getPlayerStats === 'function' ? this.getPlayerStats() : null);

          const realMaxHp = Math.max(Number(st?.maxHp || 0), Number(p.maxHp || 0), Number(d.maxHp || 0), 100);
          const realMaxMp = Math.max(Number(st?.maxMp || 0), Number(p.maxMp || 0), Number(d.maxMp || 0), 100);

          p.maxHp = realMaxHp;
          d.maxHp = realMaxHp;
          p.maxMp = realMaxMp;
          d.maxMp = realMaxMp;

          const justCast = (now - (this._v9LastCastStamp || 0)) < 400;
          let curMp = justCast
            ? Math.min(Number(p.mp ?? realMaxMp), Number(d.mp ?? realMaxMp))
            : Math.max(Number(p.mp ?? 0), Number(d.mp ?? 0));

          if ((now - (this._v9LastCastStamp || 0)) >= 1500 && curMp < realMaxMp) {
            const staffBonus = isStaffWeaponEquippedV9(this) ? 1.5 : 1.0;
            const regenPerSec = Math.max(4, realMaxMp * 0.07 * staffBonus);
            curMp = Math.min(realMaxMp, curMp + regenPerSec * elapsed);
            if (realMaxMp - curMp < 1.5) curMp = realMaxMp;
          }

          curMp = Math.max(0, Math.min(realMaxMp, curMp));
          if (typeof p.mp === 'number') p.mp = curMp;
          if (typeof d.mp === 'number') d.mp = curMp;
        }
      }

      try {
        updateStaffAppearanceV9(this);
      } catch (e) {}

      return res;
    };
    KaomojiMMORPG.prototype._v9MpAndStaffHooked = true;
  }

  Object.assign(V9, {
    resetClassEvolution: () => resetClassEvolutionV9(null)
  });
// =========================================================
  // 14. 全魔法エフェクト完全一致＆重複ゼロ整理パック（決定版）
  // =========================================================
  (function installExactMagicMappingV9() {
    const fallbackRingFn = (innerR, outerR, colorHex, seg = 24) => {
      const geo = new THREE.RingGeometry(innerR, outerR, seg);
      geo.rotateX(-Math.PI / 2);
      const mat = new THREE.MeshBasicMaterial({
        color: colorHex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.92
      });
      return new THREE.Mesh(geo, mat);
    };

    const fallbackGeoCache = {};
    const fallbackGeoFn = (kind) => {
      if (fallbackGeoCache[kind]) return fallbackGeoCache[kind];
      let g;
      if (kind === 'sphere') g = new THREE.SphereGeometry(0.5, 12, 10);
      else if (kind === 'octa') g = new THREE.OctahedronGeometry(0.5, 0);
      else if (kind === 'tetra') g = new THREE.TetrahedronGeometry(0.5, 0);
      else if (kind === 'cone4') g = new THREE.ConeGeometry(0.5, 1, 4);
      else if (kind === 'cyl8') g = new THREE.CylinderGeometry(0.5, 0.5, 1, 8);
      else g = new THREE.BoxGeometry(1, 1, 1);
      fallbackGeoCache[kind] = g;
      return g;
    };

    const fallbackRegFn = (scene, root, duration, onTick) => {
      if (!scene || !root) return;
      scene.add(root);
      const start = performance.now();
      const durMs = Math.max(100, duration * 1000);
      const step = (now) => {
        const elMs = now - start;
        const p = Math.min(1, elMs / durMs);
        try { onTick(p, elMs / 1000); } catch (e) {}
        if (p < 1) {
          requestAnimationFrame(step);
        } else {
          scene.remove(root);
        }
      };
      requestAnimationFrame(step);
    };

    const ringFn = V9._makeCircleRing || (typeof makeCircleRing === 'function' ? makeCircleRing : fallbackRingFn);
    const geoFn  = V9._unitGeo || (typeof unitGeoV9 === 'function' ? unitGeoV9 : fallbackGeoFn);
    const regFn  = V9.register3DAnimation || (typeof register3DAnimationV9 === 'function' ? register3DAnimationV9 : fallbackRegFn);

    // 1. 専用プロファイル（ドレイン / 虚無次元斬 / 回転斬 / トールハンマー / 創世ビッグバン / マナチャージ）
    const extraProfiles = [
      {
        id: 'blood_drain',
        isNonAttack: false,
        label: '🩸 深紅吸血・ソウルドレイン',
        match: /ドレイン|吸血|吸魂|ブラッド|ヴァンパイア|drain|vampire|blood|siphon/i,
        cardType: '深紅吸収スペル',
        c1: 0xe11d48, c2: 0xf43f5e, c3: 0xa855f7,
        bgGrad: 'linear-gradient(135deg, rgba(136,19,55,0.98), rgba(88,28,135,0.94))',
        names: (b) => [
          b,
          `【真】紅蓮吸魂・${b}`,
          `【極】血界冥府符「ノスフェラトゥ・${b}」`,
          `【神】創世血神「ドラキュラ・${b}」`
        ]
      },
      {
        id: 'void_slash',
        isNonAttack: false,
        label: '🌌 虚無次元斬・空間断裂',
        match: /虚無次元斬|次元斬|空間断裂|虚無|void_slash/i,
        cardType: '次元断裂スペル',
        c1: 0x7c3aed, c2: 0xe0e7ff, c3: 0x1e1b4b,
        bgGrad: 'linear-gradient(135deg, rgba(30,27,75,0.98), rgba(109,40,217,0.95))',
        names: (b) => [
          b,
          `【真】空間断裂・${b}`,
          `【極】次元断罪符「ヴォイド・${b}」`,
          `【神】終焉虚無神技「${b}・次元崩壊」`
        ]
      },
      {
        id: 'spin_whirl',
        isNonAttack: false,
        label: '🌀 疾風回転斬・千刃輪舞',
        match: /回転|輪舞|薙ぎ|スピン|ワール|whirl|spin|cyclone|cleave/i,
        cardType: '円月乱舞スペル',
        c1: 0x22d3ee, c2: 0xfde047, c3: 0x38bdf8,
        bgGrad: 'linear-gradient(135deg, rgba(8,51,68,0.98), rgba(2,132,199,0.94))',
        names: (b) => [
          b,
          `【真】円月千刃・${b}`,
          `【極】疾風剣舞符「テンペスト・${b}」`,
          `【神】天翔旋風神技「${b}・無双輪舞」`
        ]
      },
      {
        id: 'stun_impact',
        isNonAttack: false,
        label: '🔨 雷鳴震撃・トールハンマー',
        match: /破邪の衝撃|破邪|トール|スタン|気絶|中断|脳天|粉砕|ハンマー|バッシュ|震撃|thor|stun|interrupt|bash|smash|hammer/i,
        cardType: '神罰震撃スペル',
        c1: 0xf59e0b, c2: 0xfef08a, c3: 0xef4444,
        bgGrad: 'linear-gradient(135deg, rgba(120,53,15,0.98), rgba(202,138,4,0.94))',
        names: (b) => [
          b,
          `【真】剛烈震撃・${b}`,
          `【極】天罰巨槌符「ミョルニル・${b}」`,
          `【神】創世神槌「トール・${b}」`
        ]
      },
      {
        id: 'big_bang',
        isNonAttack: false,
        label: '💥 創世ビッグバン・超新星爆発',
        match: /創世ビッグバン|創世ビックバン|ビッグバン|ビックバン|超新星|bigbang/i,
        cardType: '創世超新星スペル',
        c1: 0xfbbf24, c2: 0xffffff, c3: 0xec4899,
        bgGrad: 'linear-gradient(135deg, rgba(120,53,15,0.98), rgba(157,23,77,0.95))',
        names: (b) => [
          b,
          `【真】創世超新星・${b}`,
          `【極】宇宙開闢符「ジェネシス・${b}」`,
          `【神】万象創世神技「${b}・オメガ」`
        ]
      },
      {
        id: 'mana_charge',
        isNonAttack: true,
        supportType: 'heal',
        label: '💧 蒼穹魔力泉・マナチャージ【MP回復】',
        match: /マナ|魔力|チャージ|泉|エーテル|瞑想|精神|mana|mp|ether|charge|meditate/i,
        cardType: '魔力充填スペル',
        c1: 0x0284c7, c2: 0x7dd3fc, c3: 0xc084fc,
        bgGrad: 'linear-gradient(135deg, rgba(12,74,110,0.98), rgba(109,40,217,0.94))',
        names: (b) => [
          b,
          `【真】蒼穹魔泉・${b}`,
          `【極】無限魔導符「エーテル・${b}」`,
          `【神】創世魔源「${b}・オーバーフロー」`
        ]
      }
    ];

    extraProfiles.forEach((ep) => {
      const idx = V9.ATTRIBUTES.findIndex((a) => a.id === ep.id);
      if (idx >= 0) V9.ATTRIBUTES[idx] = ep;
      else V9.ATTRIBUTES.push(ep);
    });

    if (typeof IMPACT_SYNC_TABLE_V9 === 'object' && IMPACT_SYNC_TABLE_V9) {
      Object.assign(IMPACT_SYNC_TABLE_V9, {
        blood_drain: { delay: 0.25, perDist: 0.008, hits: 2, interval: 0.18, shake: 0.22 },
        void_slash:  { delay: 0.16, perDist: 0.004, hits: 2, interval: 0.14, shake: 0.34 },
        spin_whirl:  { delay: 0.12, perDist: 0.003, hits: 3, interval: 0.12, shake: 0.24 },
        stun_impact: { delay: 0.22, perDist: 0.004, hits: 1, interval: 0,    shake: 0.42 },
        big_bang:    { delay: 0.38, perDist: 0.003, hits: 1, interval: 0,    shake: 0.55 }
      });
    }

    // 2. 個別3Dビルダー
    Object.assign(V9.EFFECT_BUILDERS, {
      void_slash: (scene, caster, target, tier, attr) => {
        const root = new THREE.Group();
        const tx = target?.x ?? caster.x;
        const tz = target?.z ?? caster.z;
        root.position.set(tx, 1.35, tz);

        const riftRing = ringFn(0.4, 2.4 + tier * 0.65, attr.c1, 24);
        riftRing.position.y = -1.25;
        const innerVoid = ringFn(0.1, 1.4 + tier * 0.4, attr.c3, 20);
        innerVoid.position.y = -1.22;
        root.add(riftRing, innerVoid);

        const slashMat1 = new THREE.MeshBasicMaterial({ color: attr.c2, transparent: true, opacity: 0.98 });
        const slashMat2 = new THREE.MeshBasicMaterial({ color: attr.c1, transparent: true, opacity: 0.94 });

        const sLen = 3.6 + tier * 0.9;
        const slash1 = new THREE.Mesh(geoFn('box'), slashMat1);
        slash1.scale.set(sLen, 0.14 + tier * 0.04, 0.36 + tier * 0.08);
        slash1.rotation.set(0.25, 0.4, Math.PI / 4);

        const slash2 = new THREE.Mesh(geoFn('box'), slashMat2);
        slash2.scale.set(sLen, 0.14 + tier * 0.04, 0.36 + tier * 0.08);
        slash2.rotation.set(-0.25, -0.4, -Math.PI / 4);

        root.add(slash1, slash2);

        const shards = [];
        const shCnt = 8 + tier * 3;
        for (let i = 0; i < shCnt; i++) {
          const sh = new THREE.Mesh(geoFn('tetra'), i % 2 === 0 ? slashMat1 : slashMat2);
          sh.scale.setScalar(0.26 + tier * 0.05);
          const ang = (Math.PI * 2 * i) / shCnt;
          const elev = ((i % 3) - 1) * 0.55;
          const dir = new THREE.Vector3(Math.cos(ang), elev, Math.sin(ang)).normalize();
          root.add(sh);
          shards.push({ mesh: sh, dir });
        }

        regFn(scene, root, 0.95 + tier * 0.16, (p, el) => {
          const fade = p > 0.7 ? 1 - (p - 0.7) / 0.3 : 1;
          slashMat1.opacity = fade * 0.98;
          slashMat2.opacity = fade * 0.94;
          riftRing.material.opacity = fade * 0.92;
          innerVoid.material.opacity = fade * 0.95;

          const cutScale = p < 0.22 ? (p / 0.22) * 1.25 : 1.25 - (p - 0.22) * 0.25;
          slash1.scale.x = sLen * cutScale;
          slash2.scale.x = sLen * cutScale;
          riftRing.rotation.z = el * 6;
          innerVoid.rotation.z = -el * 8;

          shards.forEach((s, idx) => {
            s.mesh.position.copy(s.dir).multiplyScalar(0.4 + p * (2.6 + tier * 0.65));
            s.mesh.rotation.set(el * 7 + idx, el * 5, el * 6);
          });
        });
      },

      warcry_aura: (scene, caster, target, tier, attr) => {
        const root = new THREE.Group();
        root.position.set(caster.x, 0.9, caster.z);
        const wave1 = ringFn(0.4, 1.8 + tier * 0.5, attr.c2, 20);
        wave1.position.y = -0.82;
        const wave2 = ringFn(0.7, 2.5 + tier * 0.7, attr.c1, 8);
        wave2.position.y = -0.80;
        root.add(wave1, wave2);

        const spikes = [];
        const spCnt = 10 + tier * 4;
        const spMats = [
          new THREE.MeshBasicMaterial({ color: attr.c1, transparent: true, opacity: 0.95 }),
          new THREE.MeshBasicMaterial({ color: attr.c2, transparent: true, opacity: 0.95 })
        ];
        for (let i = 0; i < spCnt; i++) {
          const phi = Math.acos(1 - (2 * (i + 0.5)) / spCnt);
          const theta = Math.PI * (1 + Math.sqrt(5)) * i;
          const dir = new THREE.Vector3(
            Math.sin(phi) * Math.cos(theta),
            Math.abs(Math.cos(phi)) * 0.85 + 0.15,
            Math.sin(phi) * Math.sin(theta)
          ).normalize();
          const sp = new THREE.Mesh(geoFn('cone4'), spMats[i % 2]);
          const len = 1.6 + tier * 0.45;
          sp.scale.set(0.22 + tier * 0.04, len, 0.22 + tier * 0.04);
          sp.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
          root.add(sp);
          spikes.push({ mesh: sp, dir });
        }

        regFn(scene, root, 1.05 + tier * 0.16, (p, el) => {
          const fade = p > 0.7 ? 1 - (p - 0.7) / 0.3 : 1;
          const s1 = 1 + p * (2.6 + tier * 0.7);
          wave1.scale.set(s1, s1, 1);
          wave1.material.opacity = fade * 0.95;
          const s2 = 1 + p * (2.0 + tier * 0.6);
          wave2.scale.set(s2, s2, 1);
          wave2.rotation.z = el * 4;
          wave2.material.opacity = fade * 0.9;
          spMats.forEach(m => { m.opacity = fade * 0.95; });
          spikes.forEach((s) => {
            const dist = 0.5 + p * (2.2 + tier * 0.6);
            s.mesh.position.copy(s.dir).multiplyScalar(dist);
          });
        });
      },

      holy_heal: (scene, caster, target, tier, attr) => {
        const root = new THREE.Group();
        root.position.set(caster.x, 0, caster.z);
        const zoneR = 2.1 + tier * 0.55;
        const petalRing = ringFn(zoneR * 0.75, zoneR, attr.c1, 12);
        petalRing.position.y = 0.06;
        root.add(petalRing);

        const haloMat1 = new THREE.MeshBasicMaterial({ color: attr.c1, transparent: true, opacity: 0.96 });
        const haloMat2 = new THREE.MeshBasicMaterial({ color: attr.c3, transparent: true, opacity: 0.96 });
        const halo1 = new THREE.Mesh(new THREE.TorusGeometry(0.95 + tier * 0.2, 0.07, 6, 24), haloMat1);
        halo1.rotation.x = Math.PI / 2;
        halo1.position.y = 2.75;
        const halo2 = new THREE.Mesh(new THREE.TorusGeometry(1.35 + tier * 0.25, 0.05, 6, 24), haloMat2);
        halo2.rotation.x = Math.PI / 2 + 0.25;
        halo2.position.y = 2.95;
        root.add(halo1, halo2);

        const feathers = [];
        const fCnt = 8 + tier * 3;
        for (let i = 0; i < fCnt; i++) {
          const fm = new THREE.Mesh(geoFn('tetra'), i % 2 === 0 ? haloMat1 : haloMat2);
          fm.scale.set(0.28, 0.08, 0.45);
          root.add(fm);
          feathers.push({
            mesh: fm,
            ang: (Math.PI * 2 * i) / fCnt,
            rad: 0.6 + (i % 4) * 0.45,
            startY: 3.4 + (i % 3) * 0.7
          });
        }

        regFn(scene, root, 1.2 + tier * 0.18, (p, el) => {
          const fade = p > 0.72 ? 1 - (p - 0.72) / 0.28 : 1;
          petalRing.rotation.z = el * 2.5;
          petalRing.material.opacity = fade * 0.95;
          haloMat1.opacity = fade * 0.96;
          haloMat2.opacity = fade * 0.96;
          halo1.rotation.z = el * 4;
          halo2.rotation.z = -el * 3;
          feathers.forEach((f, idx) => {
            const a = f.ang + el * 2.4;
            const y = Math.max(0.15, f.startY * (1 - p * 0.85));
            f.mesh.position.set(Math.cos(a) * f.rad, y, Math.sin(a) * f.rad);
            f.mesh.rotation.set(Math.sin(el * 5 + idx) * 0.6, a, Math.cos(el * 4 + idx) * 0.6);
          });
        });
      },

      blood_drain: (scene, caster, target, tier, attr) => {
        const root = new THREE.Group();
        const tx = target?.x ?? caster.x;
        const tz = target?.z ?? caster.z;
        const targetRing = ringFn(0.4, 1.6 + tier * 0.4, attr.c1, 16);
        targetRing.position.set(tx, 0.08, tz);
        const casterRing = ringFn(0.4, 1.5 + tier * 0.4, attr.c2, 16);
        casterRing.position.set(caster.x, 0.08, caster.z);
        root.add(targetRing, casterRing);

        const orbs = [];
        const orbCnt = 7 + tier * 3;
        const m1 = new THREE.MeshBasicMaterial({ color: attr.c1, transparent: true, opacity: 0.96 });
        const m2 = new THREE.MeshBasicMaterial({ color: attr.c3, transparent: true, opacity: 0.96 });
        for (let i = 0; i < orbCnt; i++) {
          const orb = new THREE.Mesh(geoFn('sphere'), i % 2 === 0 ? m1 : m2);
          orb.scale.setScalar(0.30 + tier * 0.06);
          root.add(orb);
          orbs.push({
            mesh: orb,
            side: (i % 2 === 0 ? 1 : -1) * (0.8 + (i % 3) * 0.55),
            height: 0.9 + (i % 4) * 0.45,
            delay: (i / orbCnt) * 0.32
          });
        }

        regFn(scene, root, 1.05 + tier * 0.15, (p, el) => {
          const fade = p > 0.75 ? 1 - (p - 0.75) / 0.25 : 1;
          targetRing.rotation.z = el * 5;
          casterRing.rotation.z = -el * 5;
          targetRing.material.opacity = fade * 0.92;
          casterRing.material.opacity = fade * 0.92;
          m1.opacity = fade * 0.96;
          m2.opacity = fade * 0.96;
          const dx = caster.x - tx;
          const dz = caster.z - tz;
          const len = Math.max(0.01, Math.hypot(dx, dz));
          const px = -dz / len;
          const pz = dx / len;
          orbs.forEach((o) => {
            const lp = Math.max(0, Math.min(1, (p - o.delay) / 0.68));
            const ease = lp * lp;
            const arc = Math.sin(lp * Math.PI);
            o.mesh.position.set(
              tx + dx * ease + px * o.side * arc,
              0.8 + arc * o.height,
              tz + dz * ease + pz * o.side * arc
            );
          });
        });
      },

      spin_whirl: (scene, caster, target, tier, attr) => {
        const root = new THREE.Group();
        root.position.set(caster.x, 1.0, caster.z);
        const maxR = 2.6 + tier * 0.75;
        const slashDisk = ringFn(maxR * 0.45, maxR, attr.c1, 24);
        const outerEdge = ringFn(maxR * 0.92, maxR * 1.12, attr.c2, 24);
        outerEdge.position.y = 0.15;
        root.add(slashDisk, outerEdge);

        const bCnt = 4 + tier * 2;
        const bMat = new THREE.MeshBasicMaterial({ color: attr.c2, transparent: true, opacity: 0.95 });
        for (let i = 0; i < bCnt; i++) {
          const b = new THREE.Mesh(geoFn('box'), bMat);
          b.scale.set(maxR * 0.95, 0.08, 0.28 + tier * 0.06);
          const ang = (Math.PI * 2 * i) / bCnt;
          b.position.set(Math.cos(ang) * (maxR * 0.5), (i % 3 - 1) * 0.25, Math.sin(ang) * (maxR * 0.5));
          b.rotation.y = -ang;
          root.add(b);
        }

        regFn(scene, root, 0.85 + tier * 0.14, (p, el) => {
          const fade = p > 0.7 ? 1 - (p - 0.7) / 0.3 : 1;
          root.rotation.y = el * 18;
          slashDisk.material.opacity = fade * 0.9;
          outerEdge.material.opacity = fade * 0.95;
          bMat.opacity = fade * 0.95;
        });
      },

      stun_impact: (scene, caster, target, tier, attr) => {
        const root = new THREE.Group();
        root.position.set(target.x, 0, target.z);
        const shock = ringFn(0.4, 2.2 + tier * 0.65, attr.c1, 20);
        shock.position.y = 0.08;
        root.add(shock);

        const hammerGrp = new THREE.Group();
        const headMat = new THREE.MeshBasicMaterial({ color: attr.c1, transparent: true, opacity: 0.96 });
        const handleMat = new THREE.MeshBasicMaterial({ color: attr.c2, transparent: true, opacity: 0.96 });
        const head = new THREE.Mesh(geoFn('cyl8'), headMat);
        head.scale.set(0.75 + tier * 0.2, 1.5 + tier * 0.35, 0.75 + tier * 0.2);
        head.rotation.z = Math.PI / 2;
        const handle = new THREE.Mesh(geoFn('cyl8'), handleMat);
        handle.scale.set(0.14, 2.2 + tier * 0.4, 0.14);
        handle.position.y = 1.1;
        hammerGrp.add(head, handle);
        hammerGrp.position.y = 7.0;
        root.add(hammerGrp);

        const stars = [];
        const sCnt = 5 + tier;
        for (let i = 0; i < sCnt; i++) {
          const st = new THREE.Mesh(geoFn('octa'), handleMat);
          st.scale.setScalar(0.28 + tier * 0.05);
          st.visible = false;
          root.add(st);
          stars.push({ mesh: st, ang: (Math.PI * 2 * i) / sCnt });
        }

        regFn(scene, root, 0.95 + tier * 0.15, (p, el) => {
          const fade = p > 0.75 ? 1 - (p - 0.75) / 0.25 : 1;
          headMat.opacity = fade * 0.96;
          handleMat.opacity = fade * 0.96;
          if (p < 0.28) {
            const dp = p / 0.28;
            hammerGrp.position.y = 7.0 * (1 - dp * dp) + 0.8;
            hammerGrp.rotation.x = -0.6 * (1 - dp);
          } else {
            hammerGrp.position.y = 0.8;
            hammerGrp.rotation.x = 0;
            const sp = (p - 0.28) / 0.72;
            const sc = 1 + sp * 1.4;
            shock.scale.set(sc, sc, 1);
            shock.material.opacity = (1 - sp) * 0.95;
            stars.forEach((s) => {
              s.mesh.visible = true;
              const a = s.ang + el * 6;
              s.mesh.position.set(Math.cos(a) * 1.15, 2.3 + Math.sin(el * 10) * 0.15, Math.sin(a) * 1.15);
              s.mesh.rotation.y = el * 8;
            });
          }
        });
      },

      big_bang: (scene, caster, target, tier, attr) => {
        const root = new THREE.Group();
        root.position.set(target.x, 1.5, target.z);
        const coreMat = new THREE.MeshBasicMaterial({ color: attr.c2, transparent: true, opacity: 0.98 });
        const shellMat = new THREE.MeshBasicMaterial({ color: attr.c1, wireframe: true, transparent: true, opacity: 0.92 });
        const core = new THREE.Mesh(geoFn('sphere'), coreMat);
        const shell = new THREE.Mesh(geoFn('sphere'), shellMat);
        root.add(core, shell);

        const r1 = ringFn(0.4, 3.4 + tier * 0.9, attr.c1, 28);
        r1.position.y = -1.4;
        const r2 = ringFn(0.6, 2.8 + tier * 0.8, attr.c3, 24);
        r2.rotation.x = Math.PI / 3;
        const r3 = ringFn(0.6, 2.8 + tier * 0.8, attr.c2, 24);
        r3.rotation.y = Math.PI / 3;
        root.add(r1, r2, r3);

        const rays = [];
        const rayCnt = 12 + tier * 4;
        const rayMat = new THREE.MeshBasicMaterial({ color: attr.c3, transparent: true, opacity: 0.95 });
        for (let i = 0; i < rayCnt; i++) {
          const phi = Math.acos(1 - (2 * (i + 0.5)) / rayCnt);
          const theta = Math.PI * (1 + Math.sqrt(5)) * i;
          const dir = new THREE.Vector3(
            Math.sin(phi) * Math.cos(theta),
            Math.cos(phi),
            Math.sin(phi) * Math.sin(theta)
          ).normalize();
          const ray = new THREE.Mesh(geoFn('cone4'), rayMat);
          ray.scale.set(0.24, 2.4 + tier * 0.6, 0.24);
          ray.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
          root.add(ray);
          rays.push({ mesh: ray, dir });
        }

        regFn(scene, root, 1.25 + tier * 0.2, (p, el) => {
          const fade = p > 0.72 ? 1 - (p - 0.72) / 0.28 : 1;
          coreMat.opacity = fade * 0.98;
          shellMat.opacity = fade * 0.92;
          rayMat.opacity = fade * 0.95;
          r1.material.opacity = fade * 0.95;
          r2.material.opacity = fade * 0.9;
          r3.material.opacity = fade * 0.9;

          if (p < 0.28) {
            const cp = 1 - (p / 0.28) * 0.75;
            core.scale.setScalar(cp * 1.4);
            shell.scale.setScalar(cp * 2.0);
          } else {
            const bp = (p - 0.28) / 0.72;
            const exp = 0.4 + bp * (3.6 + tier * 0.9);
            core.scale.setScalar(exp);
            shell.scale.setScalar(exp * 1.25);
            shell.rotation.y = el * 5;
            const rs = 0.5 + bp * 1.8;
            r1.scale.set(rs, rs, 1);
            r2.scale.set(rs, rs, 1);
            r3.scale.set(rs, rs, 1);
            r2.rotation.z = el * 6;
            r3.rotation.z = -el * 6;
            rays.forEach(r => {
              r.mesh.position.copy(r.dir).multiplyScalar(bp * (3.8 + tier * 0.9));
            });
          }
        });
      },

      mana_charge: (scene, caster, target, tier, attr) => {
        const root = new THREE.Group();
        root.position.set(caster.x, 0, caster.z);
        const manaRing = ringFn(0.8, 2.0 + tier * 0.5, attr.c1, 20);
        manaRing.position.y = 0.07;
        root.add(manaRing);

        const gemMat = new THREE.MeshBasicMaterial({ color: attr.c2, transparent: true, opacity: 0.95 });
        const wireMat = new THREE.MeshBasicMaterial({ color: attr.c3, wireframe: true, transparent: true, opacity: 0.9 });
        const crystal = new THREE.Mesh(geoFn('octa'), gemMat);
        crystal.scale.set(0.55 + tier * 0.12, 0.95 + tier * 0.2, 0.55 + tier * 0.12);
        crystal.position.y = 2.8;
        const crystalWire = new THREE.Mesh(geoFn('octa'), wireMat);
        crystalWire.scale.set(0.7 + tier * 0.15, 1.15 + tier * 0.24, 0.7 + tier * 0.15);
        crystalWire.position.y = 2.8;
        root.add(crystal, crystalWire);

        const helix = [];
        const hCnt = 8 + tier * 2;
        for (let i = 0; i < hCnt; i++) {
          const drop = new THREE.Mesh(geoFn('sphere'), i % 2 === 0 ? gemMat : wireMat);
          drop.scale.setScalar(0.22 + tier * 0.04);
          root.add(drop);
          helix.push({ mesh: drop, phase: (Math.PI * 2 * i) / hCnt, strand: i % 2 });
        }

        regFn(scene, root, 1.15 + tier * 0.18, (p, el) => {
          const fade = p > 0.72 ? 1 - (p - 0.72) / 0.28 : 1;
          manaRing.rotation.z = el * 3.5;
          manaRing.material.opacity = fade * 0.95;
          gemMat.opacity = fade * 0.95;
          wireMat.opacity = fade * 0.9;
          crystal.rotation.y = el * 5;
          crystalWire.rotation.y = -el * 4;
          helix.forEach((h) => {
            const y = ((p * 2.5 + h.phase / (Math.PI * 2)) % 1) * 3.0;
            const a = h.phase + el * 6 + h.strand * Math.PI;
            const r = 1.1 * (1 - y / 3.8);
            h.mesh.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
          });
        });
      }
    });

    // 3. 重複ゼロ・本編に存在しない厳選4種だけを追加魔法として登録（重複していた8種は自動削除＆SP返還）
    const DUPLICATE_REMOVED_IDS_V9 = [
      'spell_meteor_v9',
      'spell_magma_eruption_v9',
      'spell_bigbang_v9',
      'spell_thor_hammer_v9',
      'spell_maelstrom_v9',
      'spell_miasma_curse_v9',
      'spell_black_hole_v9',
      'spell_blaze_barrage_v9'
    ];

    const NEW_EXPANSION_SPELLS_V9 = [
      {
        id: 'spell_spiral_flame_v9',
        name: '紅蓮螺旋炎柱',
        icon: '🔥',
        type: 'AOE_BURN',
        radius: 4.2,
        cd: 5.5,
        mp: 26,
        baseMp: 26,
        mult: 2.35,
        baseMult: 2.35,
        maxLv: 100,
        spCost: 1,
        isSupport: false,
        attrId: 'fire_pillar',
        desc: '螺旋を描く紅蓮の炎柱を噴き上げ、敵を炎上（継続ダメージ）状態にする。'
      },
      {
        id: 'spell_starlight_rain_v9',
        name: '銀河流星群',
        icon: '🌟',
        type: 'AOE_DMG',
        radius: 5.0,
        cd: 7.0,
        mp: 34,
        baseMp: 34,
        mult: 2.85,
        baseMult: 2.85,
        maxLv: 100,
        spCost: 1,
        isSupport: false,
        attrId: 'star',
        desc: '夜空の星霊と銀河流星群を降り注がせ、広範囲の敵を一掃する。'
      },
      {
        id: 'spell_aurora_sanctuary_v9',
        name: '極光の聖域',
        icon: '🌈',
        type: 'HEAL_MP',
        cd: 10.0,
        mp: 35,
        baseMp: 35,
        mult: 1.0,
        baseMult: 1.0,
        maxLv: 100,
        spCost: 1,
        isSupport: true,
        attrId: 'aurora_sanctuary',
        desc: '足元に極光の聖域を展開し、HP・MPを継続回復しつつ全能力を高める。'
      },
      {
        id: 'spell_mana_charge_v9',
        name: '蒼穹マナチャージ',
        icon: '💧',
        type: 'HEAL_MP',
        cd: 7.0,
        mp: 5,
        baseMp: 5,
        mult: 1.0,
        baseMult: 1.0,
        maxLv: 100,
        spCost: 1,
        isSupport: true,
        attrId: 'mana_charge',
        desc: '螺旋マナ水流と蒼水晶を召喚し、自身のMPとHPを一気に回復する。'
      }
    ];

    function registerNewSpellsIntoEngineV9() {
      if (typeof SKILLS !== 'undefined' && SKILLS && typeof SKILLS === 'object') {
        DUPLICATE_REMOVED_IDS_V9.forEach((oldId) => {
          if (SKILLS[oldId]) delete SKILLS[oldId];
        });
        NEW_EXPANSION_SPELLS_V9.forEach((sp) => {
          SKILLS[sp.id] = { ...sp };
        });
      }

      if (typeof window.getSkillEffectStats === 'function' && !window._v9WrappedEffStats) {
        const origEff = window.getSkillEffectStats;
        window.getSkillEffectStats = function (sk, skLv, st) {
          const res = origEff.apply(this, arguments) || {};
          const lv = Math.max(1, Number(skLv || 1));
          if (!res.mult && sk?.mult) res.mult = sk.mult * (1 + (lv - 1) * 0.08);
          if (sk?.type === 'HEAL_MP' && !res.mpPct) res.mpPct = Math.min(1.0, 0.5 + lv * 0.02);
          if ((sk?.type === 'HEAL' || sk?.type === 'HEAL_MP') && !res.hpPct) res.hpPct = Math.min(1.0, 0.35 + lv * 0.02);
          if (sk?.type === 'AOE_SLOW') {
            if (!res.slowDur) res.slowDur = 4.0;
            if (!res.slowFactor) res.slowFactor = 0.45;
          }
          if (sk?.type === 'INTERRUPT' && !res.stunDur) res.stunDur = 2.8;
          if (sk?.type === 'DRAIN' && !res.drainRate) res.drainRate = 0.35;
          return res;
        };
        window._v9WrappedEffStats = true;
      }

      if (typeof window.getSkillMpCost === 'function' && !window._v9WrappedMpCost) {
        const origMp = window.getSkillMpCost;
        window.getSkillMpCost = function (sk, skLv) {
          if (sk && typeof sk.mp === 'number' && sk.id?.endsWith('_v9')) {
            return Math.max(1, Math.round(sk.mp + (Math.max(1, skLv || 1) - 1) * 0.5));
          }
          return origMp.apply(this, arguments);
        };
        window._v9WrappedMpCost = true;
      }
    }
    registerNewSpellsIntoEngineV9();

    // 4. 【重要】スキル名による厳密判定を最優先し、skTypeフォールバックは一番最後に回す
    function cleanOriginalSkillBaseNameV9(rawStr) {
      let s = String(rawStr || '').trim();
      s = s.replace(/^【(?:真|極|神)】/, '');
      s = s.replace(/^[^「・]+「([^」]+)」$/, '$1');
      s = s.replace(/^(?:覇王闘気|絶対防壁|極光祝福|蒼穹双月|紅蓮天隕|螺旋業火|連装爆炎|地殻灼熱|氷晶零度|紫電一閃|翠嵐烈風|蒼海激流|剛岩破邪|聖光煌めき|黒蝕冥界|猛毒瘴気|星屑流星|蒼穹剣閃|紅蓮吸魂|円月千刃|剛烈震撃|蒼穹魔泉|創世超新星|空間断裂)・/, '');
      s = s.replace(/^(?:ノスフェラトゥ|ドラキュラ|ヴォイド|テンペスト|ミョルニル|トール|エーテル|ジェネシス|カタストロフ|スターフォール|クリムゾン|アポロン|イグニッション|イフリート|ヴォルカニック|ムスペルヘイム|コキュートス|ダイヤモンドダスト|タケミカヅチ|インドラ|シルフィード|リヴァイアサン|ポセイドン|ガイア・クラッシュ|タイタン|セイクリッド|セラフィム|アビスノヴァ|ラグナロク|ベリアル|ヒュドラ|スターダスト|ビッグバン|天翔十字|エクスカリバー|アイギス|エリュシオン|アルカディア|オーバーロード)・/, '');
      s = s.replace(/・(?:インフィニティ|ゼロ|次元断罪斬|次元崩壊|無双輪舞|オーバーフロー|オメガ)$/, '');
      return s.trim();
    }

    inferDefaultProfileV9 = function (origName, sk = {}) {
      if (sk.attrId && findProfileByIdV9(sk.attrId)) {
        return findProfileByIdV9(sk.attrId);
      }

      const skId = String(sk.id || sk.skillId || '');
      const skType = String(sk.type || '').toUpperCase();
      const base = cleanOriginalSkillBaseNameV9(origName);
      const txt = `${base} ${skId}`;

      // ① 名前・IDの厳密一致（skTypeより必ず先に評価！）
      if (/ドレイン|吸血|吸魂|drain/i.test(txt)) return findProfileByIdV9('blood_drain');
      if (/虚無次元斬|次元斬|空間断裂|void_slash/i.test(txt)) return findProfileByIdV9('void_slash');
      if (/破邪の衝撃|破邪|トール|スタン|中断|巨槌|ハンマー|バッシュ|stun|interrupt|hammer/i.test(txt)) return findProfileByIdV9('stun_impact');
      if (/創世ビッグバン|創世ビックバン|ビッグバン|ビックバン|bigbang/i.test(txt)) return findProfileByIdV9('big_bang');

      if (/瘴気|呪詛|猛毒|ポイズン|poison|miasma/i.test(txt)) return findProfileByIdV9('poison');
      if (/大渦潮|渦潮|蒼海|津波|水柱|アクア|water|maelstrom/i.test(txt)) return findProfileByIdV9('water');
      if (/絶対零度|氷|アイス|ブリザード|吹雪|ice/i.test(txt)) return findProfileByIdV9('ice');
      if (/不死鳥|フェニックス|マグマ|溶岩|噴火|灼熱|fire_eruption|magma|phoenix/i.test(txt)) return findProfileByIdV9('fire_eruption');
      if (/爆炎|火球|フレア|fire_burst|blaze/i.test(txt)) return findProfileByIdV9('fire_burst');
      if (/メテオ|隕石|meteor/i.test(txt)) return findProfileByIdV9('fire_meteor');
      if (/炎柱|螺旋炎|fire_pillar/i.test(txt)) return findProfileByIdV9('fire_pillar');

      if (/極光|聖域|オーロラ|sanctuary|aurora/i.test(txt)) return findProfileByIdV9('aurora_sanctuary');
      if (/マナ|魔力|チャージ|エーテル|mana|heal_mp/i.test(txt)) return findProfileByIdV9('mana_charge');
      if (/聖光|癒し|ヒール|回復|heal/i.test(txt)) return findProfileByIdV9('holy_heal');
      if (/イージス|神域|盾|バリア|シールド|aegis|shield/i.test(txt)) return findProfileByIdV9('aegis_shield');
      if (/覇王|咆哮|闘気|覚醒|warcry/i.test(txt)) return findProfileByIdV9('warcry_aura');

      if (/回転|輪舞|spin_whirl|whirl/i.test(txt)) return findProfileByIdV9('spin_whirl');
      if (/烈空|三日月|真空|一閃|slash_crescent|crescent/i.test(txt)) return findProfileByIdV9('slash_crescent');
      if (/銀河流星|星屑|銀河|スター|流星|star|comet/i.test(txt)) return findProfileByIdV9('star');
      if (/ブラックホール|黒蝕|アビス|闇|ダーク|dark|black_hole/i.test(txt)) return findProfileByIdV9('dark');
      if (/巨岩|衝撃|地震|大地|岩|earth/i.test(txt)) return findProfileByIdV9('earth');
      if (/竜巻|旋風|嵐|トルネード|ウィンド|wind/i.test(txt)) return findProfileByIdV9('wind');
      if (/雷|電|サンダー|ライトニング|thunder/i.test(txt)) return findProfileByIdV9('thunder');
      if (/剣|刃|刀|sword|blade/i.test(txt)) return findProfileByIdV9('sword');

      // ② 名前で判別できない場合のみ、スキルタイプから推定
      if (skType === 'DRAIN') return findProfileByIdV9('blood_drain');
      if (skType === 'INTERRUPT') return findProfileByIdV9('stun_impact');
      if (skType === 'AOE_SLOW') return findProfileByIdV9('ice');
      if (skType === 'AOE_BURN') return findProfileByIdV9('fire_eruption');
      if (skType === 'HEAL_MP') return findProfileByIdV9('mana_charge');
      if (skType === 'HEAL') return findProfileByIdV9('holy_heal');
      if (skType === 'DEF_BUFF') return findProfileByIdV9('aegis_shield');
      if (skType === 'ATK_BUFF') return findProfileByIdV9('warcry_aura');
      if (skType === 'THUNDER') return findProfileByIdV9('thunder');

      return findProfileByIdV9('sword') || V9.ATTRIBUTES[0];
    };

    // 5. セーブデータのズレ＆重複魔法を自動修復するガード
    function sanitizeLoadedSaveDataV9(g) {
      if (!g || !g.saveData) return;
      const d = g.saveData;

      if (d.skills && typeof d.skills === 'object') {
        let refundSp = 0;
        DUPLICATE_REMOVED_IDS_V9.forEach((oldId) => {
          const lv = Number(d.skills[oldId] || 0);
          if (lv > 0) {
            refundSp += lv;
            delete d.skills[oldId];
          }
          if (Array.isArray(d.equippedSkills)) {
            d.equippedSkills = d.equippedSkills.map(id => (id === oldId ? null : id));
          }
        });
        if (refundSp > 0) {
          d.sp = Number(d.sp || 0) + refundSp;
        }
      }

      if (d.skillCustomV9 && typeof d.skillCustomV9 === 'object') {
        Object.keys(d.skillCustomV9).forEach((sid) => {
          const sk = (typeof SKILLS === 'object' && SKILLS[sid]) ? SKILLS[sid] : null;
          const skTxt = `${sid} ${sk?._v9BaseName || ''} ${sk?.name || ''}`;
          if (/ドレイン|吸血/i.test(skTxt) && d.skillCustomV9[sid]?.attrId === 'dark') {
            d.skillCustomV9[sid].attrId = 'blood_drain';
          }
          if (/虚無次元斬/i.test(skTxt) && d.skillCustomV9[sid]?.attrId === 'slash_crescent') {
            d.skillCustomV9[sid].attrId = 'void_slash';
          }
          if (/瘴気/i.test(skTxt) && d.skillCustomV9[sid]?.attrId === 'fire_eruption') {
            d.skillCustomV9[sid].attrId = 'poison';
          }
          if (/大渦潮/i.test(skTxt) && d.skillCustomV9[sid]?.attrId === 'ice') {
            d.skillCustomV9[sid].attrId = 'water';
          }
          if (/絶対零度/i.test(skTxt) && d.skillCustomV9[sid]?.attrId === 'star') {
            d.skillCustomV9[sid].attrId = 'ice';
          }
          if (/破邪/i.test(skTxt) && d.skillCustomV9[sid]?.attrId !== 'stun_impact') {
            d.skillCustomV9[sid].attrId = 'stun_impact';
          }
        });
      }
    }

    const origSync = syncAllSkillsV9;
    syncAllSkillsV9 = function (game, allowHudRefresh = false) {
      const g = game || window.__kmjInstance || window._kmjGameInstance || window.game || window.app || window.mmorpg;
      registerNewSpellsIntoEngineV9();
      sanitizeLoadedSaveDataV9(g);
      return origSync.call(this, g, allowHudRefresh);
    };

    // 6. 「⚡ スキル・ツリー」タブ内に厳選4種の追加魔法を表示
    function injectNewSpellsIntoSkillTreeV9() {
      const modalBody = document.getElementById('modal-body');
      if (!modalBody) return;
      if (document.getElementById('kmj-v9-new-spells-box')) return;

      const activeTab = document.querySelector('#modal-tabs .tab-chip-btn.active');
      const tabText = activeTab?.textContent || '';
      if (!tabText.includes('スキル')) return;

      const g = window.__kmjInstance || window._kmjGameInstance || window.game || window.app || window.mmorpg;
      if (!g || !g.saveData) return;
      const d = g.saveData;
      if (!d.skills || typeof d.skills !== 'object') d.skills = {};
      if (!Array.isArray(d.equippedSkills)) d.equippedSkills = [];

      const box = document.createElement('div');
      box.id = 'kmj-v9-new-spells-box';
      box.style.cssText = 'margin-top:14px;padding:10px;background:rgba(15,23,42,0.95);border:1.5px solid #f472b6;border-radius:12px;';

      const renderCards = () => {
        const spPoints = Number(d.sp || 0);
        const cardsHtml = NEW_EXPANSION_SPELLS_V9.map((sp) => {
          const curLv = Number(d.skills[sp.id] || 0);
          const learned = curLv > 0;
          const eqSlot = d.equippedSkills.indexOf(sp.id);
          const eqBadge = eqSlot >= 0
            ? `<span class="badge-pill" style="background:#059669;color:#fff;">装備中:枠${eqSlot + 1}</span>`
            : '';

          return `
            <div class="card-box" style="margin-bottom:7px;border-color:${learned ? '#38bdf8' : '#475569'};">
              <div class="flex-between" style="margin-bottom:4px;">
                <div style="font-size:12px;font-weight:900;color:#fde047;">
                  ${sp.icon} ${sp.name} <span style="color:#7dd3fc;">${learned ? `Lv.${curLv}` : '（未習得）'}</span>
                </div>
                ${eqBadge}
              </div>
              <div style="font-size:10px;color:#cbd5e1;margin-bottom:6px;">${sp.desc}（消費MP:${sp.mp} / CT:${sp.cd}s）</div>
              <div class="flex-wrap-gap">
                <button type="button" class="btn-ui btn-amber v9-learn-spell-btn" data-spid="${sp.id}" ${spPoints <= 0 ? 'disabled' : ''}>
                  ${learned ? '⬆️ LvUP (SP1)' : '✨ 習得する (SP1)'}
                </button>
                ${learned ? [0, 1, 2, 3, 4].map(slot => `
                  <button type="button" class="btn-ui ${eqSlot === slot ? 'btn-emerald' : 'btn-slate'} v9-equip-spell-btn"
                    data-spid="${sp.id}" data-slot="${slot}" style="padding:5px 8px;">
                    枠${slot + 1}
                  </button>
                `).join('') : ''}
              </div>
            </div>
          `;
        }).join('');

        box.innerHTML = `
          <div class="flex-between" style="margin-bottom:8px;">
            <span style="font-size:13px;font-weight:900;color:#f472b6;">🌟 追加魔法スペル（厳選4種・所持SP: ${spPoints}）</span>
          </div>
          <div style="font-size:10px;color:#94a3b8;margin-bottom:8px;">
            ※ 既存魔法と重複しない新規4種です。SPで習得・強化し、「枠1〜5」で装備できます。
          </div>
          ${cardsHtml}
        `;

        box.querySelectorAll('.v9-learn-spell-btn').forEach(btn => {
          btn.onclick = () => {
            const spid = btn.dataset.spid;
            if ((d.sp || 0) <= 0) return;
            d.sp -= 1;
            d.skills[spid] = Number(d.skills[spid] || 0) + 1;
            if (!d.equippedSkills.includes(spid)) {
              for (let i = 0; i < 5; i++) {
                if (!d.equippedSkills[i]) {
                  d.equippedSkills[i] = spid;
                  break;
                }
              }
            }
            syncAllSkillsV9(g, true);
            g.refreshAllHUD?.();
            g.saveGame?.(false);
            renderCards();
          };
        });

        box.querySelectorAll('.v9-equip-spell-btn').forEach(btn => {
          btn.onclick = () => {
            const spid = btn.dataset.spid;
            const slot = Number(btn.dataset.slot);
            for (let i = 0; i < 5; i++) {
              if (d.equippedSkills[i] === spid) d.equippedSkills[i] = null;
            }
            d.equippedSkills[slot] = spid;
            g.refreshAllHUD?.();
            g.saveGame?.(false);
            renderCards();
            g.showAlertBanner?.(`⚔️ 枠${slot + 1}に「${SKILLS[spid]?.name || spid}」を装備しました！`, 1600);
          };
        });
      };

      renderCards();
      modalBody.appendChild(box);
    }

    const modalBodyEl = document.getElementById('modal-body');
    if (modalBodyEl && !modalBodyEl._v9NewSpellsObserver) {
      const obs = new MutationObserver(() => injectNewSpellsIntoSkillTreeV9());
      obs.observe(modalBodyEl, { childList: true, subtree: true });
      modalBodyEl._v9NewSpellsObserver = true;
    }

    setTimeout(() => {
      const g = window.__kmjInstance || window._kmjGameInstance || window.game || window.app || window.mmorpg;
      syncAllSkillsV9(g, true);
      injectNewSpellsIntoSkillTreeV9();
    }, 300);
  })();
})();
// ▲▲▲ ここまで 【スキルエフェクト専用 game9.js (全魔法エフェクト完全一致&重複ゼロ整理版) 】 ▲▲▲
