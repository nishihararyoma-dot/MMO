// ▼▼▼ ここから【スキルエフェクト専用 game9.js 1/2】リアルタイム3Dアニメーションエンジン・スペルカードカットイン・属性別シンセ効果音・MP5倍＆技名進化システム ▼▼▼
(() => {
  'use strict';

  // =========================================================
  // 1. スペルカード風カットイン＆幾何学魔法陣アニメーションCSS
  // =========================================================
  if (!document.getElementById('kmj-v9-spell-style')) {
    const st = document.createElement('style');
    st.id = 'kmj-v9-spell-style';
    st.textContent = `
      @keyframes kmjV9SpellSlideIn {
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
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 9999;
        overflow: hidden;
      }
      .kmj-v9-flash {
        position: absolute;
        inset: 0;
        animation: kmjV9FlashFade 0.55s ease-out forwards;
      }
      .kmj-v9-line-top, .kmj-v9-line-bot {
        position: absolute;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, transparent, #fde047, #f472b6, #38bdf8, transparent);
        box-shadow: 0 0 16px #fde047;
        animation: kmjV9LineSweep 2.3s ease-out forwards;
      }
      .kmj-v9-line-top { top: 12.2%; }
      .kmj-v9-line-bot { top: 24.8%; }

      .kmj-v9-banner {
        position: absolute;
        right: 14px;
        top: 13.2%;
        min-width: 315px;
        max-width: 92vw;
        padding: 13px 26px 13px 20px;
        border-radius: 12px;
        border: 2px solid #fde047;
        box-shadow: 0 0 38px rgba(250, 204, 21, 0.9), inset 0 0 24px rgba(255, 255, 255, 0.32);
        display: flex;
        align-items: center;
        gap: 14px;
        animation: kmjV9SpellSlideIn 2.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        overflow: hidden;
      }
      .kmj-v9-banner-inner {
        transform: skewX(15deg);
        display: flex;
        align-items: center;
        gap: 14px;
        position: relative;
        z-index: 2;
      }
      .kmj-v9-ring-1 {
        position: absolute;
        right: -28px;
        top: -38px;
        width: 156px;
        height: 156px;
        border: 3px dashed rgba(255, 255, 255, 0.55);
        border-radius: 50%;
        animation: kmjV9SpinCW 5s linear infinite;
        z-index: 1;
      }
      .kmj-v9-ring-2 {
        position: absolute;
        right: -12px;
        top: -22px;
        width: 124px;
        height: 124px;
        border: 2px solid rgba(253, 224, 71, 0.7);
        border-radius: 50%;
        animation: kmjV9SpinCCW 3.4s linear infinite;
        z-index: 1;
      }
      .kmj-v9-avatar {
        background: rgba(15, 23, 42, 0.95);
        border: 2px solid #7dd3fc;
        border-radius: 10px;
        padding: 8px 11px;
        font-size: 16px;
        font-weight: 900;
        color: #fff;
        white-space: nowrap;
        box-shadow: 0 0 18px rgba(56, 189, 248, 0.95);
      }
    `;
    document.head.appendChild(st);
  }

  // =========================================================
  // 2. 属性別＋進化段階別リッチ・シンセサイザー効果音
  // =========================================================
  function playAttributeSpellAudioV9(attrId = 'sword', tier = 0) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!window._kmjV9AudioCtx) window._kmjV9AudioCtx = new AudioCtx();
      const ctx = window._kmjV9AudioCtx;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const presets = {
        fire:    { wave: 'sawtooth', base: 140, sweep: 55,  notes: [330, 440, 587.33, 880] },
        ice:     { wave: 'sine',     base: 980, sweep: 1480, notes: [1046.5, 1318.5, 1568, 2093] },
        thunder: { wave: 'square',   base: 220, sweep: 90,  notes: [440, 659.25, 987.77, 1480] },
        wind:    { wave: 'triangle', base: 420, sweep: 780, notes: [523.25, 659.25, 783.99, 1174.66] },
        water:   { wave: 'sine',     base: 280, sweep: 520, notes: [392, 523.25, 659.25, 987.77] },
        earth:   { wave: 'sawtooth', base: 95,  sweep: 42,  notes: [196, 261.63, 329.63, 493.88] },
        holy:    { wave: 'sine',     base: 660, sweep: 990, notes: [659.25, 830.61, 987.77, 1318.51, 1661.22] },
        dark:    { wave: 'sawtooth', base: 110, sweep: 38,  notes: [220, 277.18, 329.63, 466.16] },
        poison:  { wave: 'triangle', base: 185, sweep: 130, notes: [293.66, 349.23, 466.16, 622.25] },
        star:    { wave: 'sine',     base: 880, sweep: 1320, notes: [783.99, 987.77, 1174.66, 1567.98, 2093] },
        sword:   { wave: 'triangle', base: 520, sweep: 880, notes: [523.25, 659.25, 783.99, 1046.5, 1567.98] }
      };
      const cfg = presets[attrId] || presets.sword;

      // 重厚インパクト音
      const impOsc = ctx.createOscillator();
      const impGain = ctx.createGain();
      impOsc.type = cfg.wave;
      impOsc.frequency.setValueAtTime(cfg.base, now);
      impOsc.frequency.exponentialRampToValueAtTime(Math.max(30, cfg.sweep), now + 0.36);
      impGain.gain.setValueAtTime(0.08, now);
      impGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      impOsc.connect(impGain);
      impGain.connect(ctx.destination);
      impOsc.start(now);
      impOsc.stop(now + 0.40);

      // 進化段階に応じたスペルカード和音ファンファーレ
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
  // 3. 全11属性スペルシステム＆進化技名定義
  // =========================================================
  const SPELL_ATTRIBUTES_V9 = [
    {
      id: 'fire', label: '🔥 紅蓮・炎属性',
      match: /炎|火|ファイア|ブレイズ|紅蓮|メテオ|爆発|業火|flame|fire|meteor/i,
      cardType: '紅蓮スペル',
      c1: 0xef4444, c2: 0xfacc15, c3: 0xf97316,
      bgGrad: 'linear-gradient(135deg, rgba(127,29,29,0.97), rgba(234,88,12,0.93))',
      names: (b) => [b, `【真】紅蓮爆炎・${b}`, `【極】竜王焦熱符「インフェルノ・${b}」`, `【神話奥義】創世業火「プロミネンス・アルティメットノヴァ」`]
    },
    {
      id: 'ice', label: '❄️ 氷華・氷属性',
      match: /氷|アイス|ブリザード|吹雪|零度|霜|freeze|ice|blizzard/i,
      cardType: '氷華スペル',
      c1: 0x38bdf8, c2: 0xe0f2fe, c3: 0x818cf8,
      bgGrad: 'linear-gradient(135deg, rgba(12,74,110,0.97), rgba(37,99,235,0.93))',
      names: (b) => [b, `【真】氷晶零度・${b}`, `【極】絶対零度符「コキュートス・${b}」`, `【神話奥義】銀世界神話「エターナル・ダイヤモンドダスト」`]
    },
    {
      id: 'thunder', label: '⚡ 紫電・雷属性',
      match: /雷|電|サンダー|ライトニング|スパーク|雷鳴|thunder|lightning|volt/i,
      cardType: '紫電スペル',
      c1: 0xfacc15, c2: 0xa855f7, c3: 0x38bdf8,
      bgGrad: 'linear-gradient(135deg, rgba(88,28,135,0.97), rgba(202,138,4,0.93))',
      names: (b) => [b, `【真】紫電一閃・${b}`, `【極】雷神降臨符「タケミカヅチ・${b}」`, `【神話奥義】天罰神雷「インドラ・オーバーロードサンダー」`]
    },
    {
      id: 'wind', label: '🌪️ 翠嵐・風属性',
      match: /風|疾風|嵐|ウィンド|トルネード|旋風|烈風|wind|gale|storm/i,
      cardType: '翠嵐スペル',
      c1: 0x34d399, c2: 0xa7f3d0, c3: 0xfde047,
      bgGrad: 'linear-gradient(135deg, rgba(6,78,59,0.97), rgba(16,185,129,0.93))',
      names: (b) => [b, `【真】翠嵐烈風・${b}`, `【極】風神天舞符「テンペスト・${b}」`, `【神話奥義】天空神話「シルフィード・無尽真空覇王斬」`]
    },
    {
      id: 'water', label: '🌊 蒼海・水属性',
      match: /水|海|波|津波|アクア|水流|渦|aqua|water|wave|ocean/i,
      cardType: '蒼海スペル',
      c1: 0x0284c7, c2: 0x7dd3fc, c3: 0x2dd4bf,
      bgGrad: 'linear-gradient(135deg, rgba(7,89,133,0.97), rgba(13,148,136,0.93))',
      names: (b) => [b, `【真】蒼海激流・${b}`, `【極】海神怒涛符「リヴァイアサン・${b}」`, `【神話奥義】深淵海神「ポセイドン・創世大津波ノヴァ」`]
    },
    {
      id: 'earth', label: '🪨 大地・岩属性',
      match: /地|岩|土|地震|クエイク|砕|earth|rock|quake/i,
      cardType: '大地スペル',
      c1: 0xd97706, c2: 0xfbbf24, c3: 0x92400e,
      bgGrad: 'linear-gradient(135deg, rgba(120,53,15,0.97), rgba(180,83,9,0.93))',
      names: (b) => [b, `【真】剛岩砕破・${b}`, `【極】地母神符「ガイア・クラッシュ・${b}」`, `【神話奥義】星砕神話「タイタン・天地開闢メテオストライク」`]
    },
    {
      id: 'holy', label: '✨ 聖光・光属性',
      match: /光|聖|ホーリー|ヒール|回復|祈り|祝福|天照|holy|light|heal|bless/i,
      cardType: '聖光スペル',
      c1: 0xfde047, c2: 0xffffff, c3: 0xf472b6,
      bgGrad: 'linear-gradient(135deg, rgba(133,77,14,0.97), rgba(217,119,6,0.93))',
      names: (b) => [b, `【真】聖光煌めき・${b}`, `【極】天照聖域符「セイクリッド・${b}」`, `【神話奥義】創世聖典「セラフィム・無限光輪の奇跡」`]
    },
    {
      id: 'dark', label: '🌌 黒蝕・闇属性',
      match: /闇|黒|ダーク|シャドウ|アビス|ブラックホール|dark|void|shadow|abyss/i,
      cardType: '黒蝕スペル',
      c1: 0x9333ea, c2: 0xf43f5e, c3: 0x38bdf8,
      bgGrad: 'linear-gradient(135deg, rgba(30,27,75,0.98), rgba(126,34,206,0.93))',
      names: (b) => [b, `【真】黒蝕冥界・${b}`, `【極】虚空崩壊符「アビスノヴァ・${b}」`, `【神話奥義】終焉神話「ラグナロク・次元黒蝕シンギュラリティ」`]
    },
    {
      id: 'poison', label: '☠️ 呪詛・毒属性',
      match: /毒|呪|ポイズン|ヴェノム|カース|瘴気|poison|venom|curse/i,
      cardType: '呪詛スペル',
      c1: 0xa855f7, c2: 0x4ade80, c3: 0xf43f5e,
      bgGrad: 'linear-gradient(135deg, rgba(59,7,100,0.97), rgba(21,128,61,0.93))',
      names: (b) => [b, `【真】猛毒瘴気・${b}`, `【極】魔界呪詛符「ベリアル・${b}」`, `【神話奥義】混沌神話「ヒュドラ・無間地獄の瘴気陣」`]
    },
    {
      id: 'star', label: '🌟 星屑・宇宙属性',
      match: /星|宇宙|銀河|スター|コメット|ノヴァ|コスモ|star|comet|nova|cosmos/i,
      cardType: '星屑スペル',
      c1: 0xf472b6, c2: 0xfde047, c3: 0x38bdf8,
      bgGrad: 'linear-gradient(135deg, rgba(49,46,129,0.97), rgba(219,39,119,0.93))',
      names: (b) => [b, `【真】星屑流星・${b}`, `【極】銀河星霊符「スターダスト・${b}」`, `【神話奥義】宇宙創世「ビッグバン・ギャラクシーノヴァ」`]
    },
    {
      id: 'sword', label: '⚔️ 秘剣・無属性',
      match: /.*/,
      cardType: '秘剣スペル',
      c1: 0x38bdf8, c2: 0xf472b6, c3: 0xfde047,
      bgGrad: 'linear-gradient(135deg, rgba(15,23,42,0.97), rgba(3,105,161,0.93))',
      names: (b) => [b, `【真】蒼穹剣閃・${b}`, `【極】剣聖奥義符「天翔十字・${b}」`, `【神話奥義】創世剣神「エクスカリバー・虹翼星屑ノヴァ」`]
    }
  ];

  // =========================================================
  // 4. リアルタイム3Dアニメーション管理システム（毎フレーム駆動）
  // =========================================================
  const activeAnimationsV9 = [];
  let _lastAnimTimeV9 = performance.now();

  function register3DAnimationV9(scene, rootGroup, duration, onTick) {
    if (!scene || !rootGroup) return;
    scene.add(rootGroup);
    activeAnimationsV9.push({
      scene,
      group: rootGroup,
      elapsed: 0,
      duration: Math.max(0.15, duration),
      onTick
    });
  }

  function step3DAnimationsV9() {
    const now = performance.now();
    const dt = Math.min(0.05, Math.max(0.001, (now - _lastAnimTimeV9) / 1000));
    _lastAnimTimeV9 = now;

    for (let i = activeAnimationsV9.length - 1; i >= 0; i--) {
      const anim = activeAnimationsV9[i];
      anim.elapsed += dt;
      const progress = Math.min(1, anim.elapsed / anim.duration);
      try {
        anim.onTick(progress, anim.elapsed, dt, anim.group);
      } catch (e) {}

      if (progress >= 1) {
        try {
          anim.scene.remove(anim.group);
          anim.group.traverse?.(obj => {
            if (obj.geometry) obj.geometry.dispose?.();
            if (obj.material) {
              if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose?.());
              else obj.material.dispose?.();
            }
          });
        } catch (e) {}
        activeAnimationsV9.splice(i, 1);
      }
    }
    requestAnimationFrame(step3DAnimationsV9);
  }
  requestAnimationFrame(step3DAnimationsV9);

  // =========================================================
  // 5. スペルカードカットイン表示関数
  // =========================================================
  function showSpellCardCutinV9(game, info) {
    playAttributeSpellAudioV9(info.theme.id, info.tier);

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
      : `✦ ${info.theme.label} ・ SKILL CAST (Lv.${info.skillLv}) ✦`;

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

  // =========================================================
  // 6. 公開API（game8.js および game9.js Part 2 から利用）
  // =========================================================
  window.KMJ_SKILL_FX_V9 = {
    ATTRIBUTES: SPELL_ATTRIBUTES_V9,
    register3DAnimation: register3DAnimationV9,
    showSpellCardCutin: showSpellCardCutinV9,

    getSkillInfo(game, slotOrSkill = 0) {
      const d = game?.saveData || {};
      let slotIdx = typeof slotOrSkill === 'number' ? slotOrSkill : 0;
      let rawSkill = null;
      let skillLv = 1;

      if (typeof slotOrSkill === 'object' && slotOrSkill !== null) {
        rawSkill = slotOrSkill;
        const sid = String(rawSkill.id || rawSkill.skillId || '');
        skillLv = Math.max(1, Number(d.skillLevels?.[sid] ?? d.skillLvs?.[sid] ?? rawSkill.lv ?? rawSkill.level ?? 1));
      } else if (typeof game?.resolveSkillMeta === 'function') {
        const meta = game.resolveSkillMeta(slotIdx);
        if (meta) {
          skillLv = Math.max(1, Number(meta.skillLv || 1));
          if (typeof SKILLS !== 'undefined' && SKILLS) {
            const list = Array.isArray(SKILLS) ? SKILLS : Object.values(SKILLS);
            rawSkill = list.find(s => s && (String(s.id) === String(meta.skillId) || String(s.skillId) === String(meta.skillId))) || list[slotIdx] || null;
          }
        }
      }

      const defaultOrig = [20, 26, 22, 16, 30][slotIdx] || 15;
      if (rawSkill && rawSkill._origMpV9 === undefined) {
        const detected = Number(rawSkill.mpCost ?? rawSkill.mp ?? rawSkill.costMp ?? 0);
        rawSkill._origMpV9 = detected > 0 ? detected : defaultOrig;
      }
      if (rawSkill && !rawSkill._origNameV9 && typeof rawSkill.name === 'string') {
        rawSkill._origNameV9 = rawSkill.name.replace(/^【(真|極|奥義|神話奥義)】[^「・]*[・「]?|」$/g, '').trim() || rawSkill.name;
      }

      const origMp = rawSkill?._origMpV9 || defaultOrig;
      const base5x = Math.max(50, Math.round(origMp * 5));
      const mpCost = Math.max(50, Math.floor(base5x * (1 + (skillLv - 1) * 0.08)));

      const origName = rawSkill?._origNameV9 || `秘技・第${slotIdx + 1}の型`;
      const tier = skillLv >= 100 ? 3 : (skillLv >= 50 ? 2 : (skillLv >= 10 ? 1 : 0));
      const theme = SPELL_ATTRIBUTES_V9.find(t => t.match.test(origName)) || SPELL_ATTRIBUTES_V9[SPELL_ATTRIBUTES_V9.length - 1];
      const evolvedName = theme.names(origName)[tier] || origName;
      const tierLabels = ['通常スキル', '✨ スキル進化Ⅰ【真】', '🔥 スキル進化Ⅱ【極】', '🌈 スキル最終進化【神話スペルカード】'];

      return {
        rawSkill, slotIdx, skillLv, mpCost, origName, evolvedName,
        tier, tierLabel: tierLabels[tier], theme
      };
    },

    syncAllSkills(game) {
      if (typeof SKILLS !== 'undefined' && SKILLS) {
        const list = Array.isArray(SKILLS) ? SKILLS : Object.values(SKILLS);
        list.forEach(sk => {
          if (!sk || typeof sk !== 'object') return;
          const info = this.getSkillInfo(game, sk);
          if ('mpCost' in sk) sk.mpCost = info.mpCost;
          if ('mp' in sk) sk.mp = info.mpCost;
          if ('costMp' in sk) sk.costMp = info.mpCost;
          if (typeof sk.name === 'string') sk.name = info.evolvedName;
        });
      }

      document.querySelectorAll('.skill-slot-btn, .skill-slot, .skill-btn, [data-skill-slot]').forEach((btn, idx) => {
        const slot = btn.dataset.skillSlot !== undefined ? Number(btn.dataset.skillSlot) : idx;
        const info = this.getSkillInfo(game, slot);
        btn.title = `${info.evolvedName} (Lv.${info.skillLv})`;

        btn.querySelectorAll('span, div, small, b').forEach(el => {
          if (el.children.length > 0) return;
          const txt = (el.textContent || '').trim();
          if (/^\d+$/.test(txt) && Number(txt) < 50) el.textContent = String(info.mpCost);
          else if (/^MP\s*\d+$/i.test(txt)) el.textContent = `MP ${info.mpCost}`;
          else if (info.origName && txt.includes(info.origName) && txt !== info.evolvedName) el.textContent = info.evolvedName;
        });
      });
    }
  };
})();
// ▲▲▲ ここまで【スキルエフェクト専用 game9.js 1/2】 ▲▲▲
// ▼▼▼ ここから【スキルエフェクト専用 game9.js 2/2】全11属性リアルタイム動的3D造形・ペット連携追撃ビーム・12クラス別通常攻撃3Dエフェクト・試し撃ちスタジオUI ▼▼▼
(() => {
  'use strict';

  const V9 = window.KMJ_SKILL_FX_V9;
  if (!V9) return;

  // =========================================================
  // 1. 全11属性リアルタイム動的3Dスキル造形エンジン
  // =========================================================
  function spawnAttribute3DEffectV9(game, entity, info) {
    if (!game?.useWebGL || !game?.scene || !entity?.pos || typeof THREE === 'undefined') return;

    const tier = info?.tier ?? 0;
    const attrId = info?.theme?.id || 'sword';
    const c1 = info?.theme?.c1 ?? 0x38bdf8;
    const c2 = info?.theme?.c2 ?? 0xf472b6;
    const c3 = info?.theme?.c3 ?? 0xfde047;
    const scale = 1.35 + tier * 0.55; // Lv1:1.35倍 → Lv10:1.90倍 → Lv50:2.45倍 → Lv100:3.00倍
    const duration = 1.15 + tier * 0.22;

    // ターゲット座標の決定（近くの敵がいれば敵の足元、いなければ前方）
    let targetX = entity.pos.x + Math.sin(entity.rotY || 0) * 2.8;
    let targetZ = entity.pos.z + Math.cos(entity.rotY || 0) * 2.8;
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

    // ---------------------------------------------------------
    // 共通ベース：足元の多重回転魔法陣（進化段階に応じて最大5重）
    // ---------------------------------------------------------
    const baseRings = [];
    const ringCount = 2 + tier;
    for (let r = 0; r < ringCount; r++) {
      const innerR = (0.75 + r * 0.62) * scale;
      const outerR = innerR + 0.22 * scale;
      const col = r % 3 === 0 ? c1 : (r % 3 === 1 ? c2 : c3);
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(innerR, outerR, 36),
        new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide, transparent: true, opacity: 0.92 })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.06 + r * 0.035;
      root.add(ring);
      baseRings.push({ mesh: ring, speed: (r % 2 === 0 ? 1 : -1) * (2.5 + r * 0.8) });
    }

    // 進化段階（tier >= 1）の立体交差トーラス神環
    const halos = [];
    if (tier >= 1) {
      for (let h = 0; h < tier + 1; h++) {
        const halo = new THREE.Mesh(
          new THREE.TorusGeometry((1.35 + h * 0.36) * scale, 0.085, 10, 32),
          new THREE.MeshBasicMaterial({ color: h % 2 === 0 ? c2 : c3, transparent: true, opacity: 0.9 })
        );
        halo.position.y = 1.5 + h * 0.35;
        halo.rotation.set(Math.PI * (0.3 + h * 0.2), h * 0.8, h * 0.5);
        root.add(halo);
        halos.push({ mesh: halo, rx: 1.8 + h * 0.5, ry: -2.2 - h * 0.4 });
      }
    }

    // ---------------------------------------------------------
    // 属性別の専用3Dアニメーション構築
    // ---------------------------------------------------------
    let customTick = null;

    if (attrId === 'fire') {
      // 🔥 炎属性：上空から巨大メテオが回転落下し、着弾で紅蓮の炎柱＆衝撃波が炸裂！
      const meteor = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.95 * scale, 1),
        new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.96 })
      );
      const meteorCore = new THREE.Mesh(
        new THREE.SphereGeometry(0.68 * scale, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.95 })
      );
      meteor.add(meteorCore);
      meteor.position.set(0, 9.5 * scale, 0);
      root.add(meteor);

      const shockRing = new THREE.Mesh(
        new THREE.RingGeometry(0.4 * scale, 1.1 * scale, 32),
        new THREE.MeshBasicMaterial({ color: c1, side: THREE.DoubleSide, transparent: true, opacity: 0 })
      );
      shockRing.rotation.x = -Math.PI / 2;
      shockRing.position.y = 0.14;
      root.add(shockRing);

      const flames = [];
      const fCount = 6 + tier * 3;
      for (let i = 0; i < fCount; i++) {
        const ang = (Math.PI * 2 * i) / fCount;
        const cone = new THREE.Mesh(
          new THREE.ConeGeometry(0.32 * scale, (2.2 + (i % 3) * 0.6) * scale, 10),
          new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? c1 : c2, transparent: true, opacity: 0 })
        );
        cone.position.set(Math.cos(ang) * 1.15 * scale, 0.1, Math.sin(ang) * 1.15 * scale);
        root.add(cone);
        flames.push({ mesh: cone, ang, baseH: (2.2 + (i % 3) * 0.6) * scale });
      }

      customTick = (p, elapsed) => {
        if (p < 0.32) {
          // 落下フェーズ
          const fallT = p / 0.32;
          meteor.position.y = (1 - fallT * fallT) * 9.5 * scale + 0.8 * scale;
          meteor.rotation.set(elapsed * 8, elapsed * 6, 0);
        } else {
          // 着弾爆発フェーズ
          const expT = (p - 0.32) / 0.68;
          meteor.position.y = 0.8 * scale;
          meteor.scale.setScalar(1 + expT * 1.4);
          meteor.material.opacity = Math.max(0, 1 - expT * 1.3);
          meteorCore.material.opacity = Math.max(0, 1 - expT * 1.3);

          shockRing.material.opacity = Math.max(0, (1 - expT) * 0.95);
          shockRing.scale.setScalar(1 + expT * 3.8);

          flames.forEach((f, idx) => {
            f.mesh.material.opacity = Math.max(0, (1 - expT) * 0.9);
            const hScale = Math.sin(Math.min(1, expT * 2.2) * Math.PI * 0.5) * (1 - expT * 0.4);
            f.mesh.scale.set(1, Math.max(0.05, hScale), 1);
            f.mesh.position.y = f.baseH * 0.5 * hScale;
            f.mesh.position.x = Math.cos(f.ang + expT * 1.5) * (1.15 + expT * 1.2) * scale;
            f.mesh.position.z = Math.sin(f.ang + expT * 1.5) * (1.15 + expT * 1.2) * scale;
          });
        }
      };

    } else if (attrId === 'ice') {
      // ❄️ 氷属性：地面から鋭いクリスタル氷柱群が時間差で次々と突き出し、冷気オーラが立ち昇る！
      const spikes = [];
      const cnt = 8 + tier * 4;
      for (let i = 0; i < cnt; i++) {
        const ringLayer = i < cnt * 0.45 ? 0 : 1;
        const ang = (Math.PI * 2 * i) / (cnt * 0.5) + ringLayer * 0.4;
        const rad = (ringLayer === 0 ? 0.95 : 1.85) * scale;
        const h = (2.4 + (i % 3) * 0.7) * scale;
        const spike = new THREE.Mesh(
          new THREE.ConeGeometry(0.28 * scale, h, 6),
          new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? c1 : c2, transparent: true, opacity: 0.92 })
        );
        spike.position.set(Math.cos(ang) * rad, -h * 0.5, Math.sin(ang) * rad);
        spike.rotation.z = -Math.cos(ang) * 0.34;
        spike.rotation.x = Math.sin(ang) * 0.34;
        root.add(spike);
        spikes.push({ mesh: spike, targetY: h * 0.45, startY: -h * 0.5, delay: ringLayer * 0.14 + (i % 4) * 0.03 });
      }

      customTick = (p) => {
        spikes.forEach(sp => {
          const localP = Math.max(0, Math.min(1, (p - sp.delay) / 0.35));
          const easeOut = 1 - Math.pow(1 - localP, 3);
          sp.mesh.position.y = sp.startY + (sp.targetY - sp.startY) * easeOut;
          if (p > 0.7) {
            sp.mesh.material.opacity = Math.max(0, (1 - (p - 0.7) / 0.3) * 0.92);
          }
        });
      };

    } else if (attrId === 'thunder') {
      // ⚡ 雷属性：天空からジグザグ稲妻ボルトが閃光とともに突き刺さり、電撃スフィアが明滅！
      const bolts = [];
      const boltCount = 3 + tier * 2;
      for (let b = 0; b < boltCount; b++) {
        const ang = (Math.PI * 2 * b) / boltCount;
        const dist = b === 0 ? 0 : 1.15 * scale;
        const bx = Math.cos(ang) * dist;
        const bz = Math.sin(ang) * dist;
        const segs = [];
        for (let s = 0; s < 5; s++) {
          const seg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.11 * scale, 0.15 * scale, 1.85 * scale, 8),
            new THREE.MeshBasicMaterial({ color: s % 2 === 0 ? c1 : c2, transparent: true, opacity: 0.96 })
          );
          seg.position.set(bx + (s % 2 === 0 ? 0.28 : -0.28) * scale, (0.9 + s * 1.65) * scale, bz);
          seg.rotation.z = (s % 2 === 0 ? -0.34 : 0.34);
          root.add(seg);
          segs.push(seg);
        }
        bolts.push({ segs, delay: b * 0.06 });
      }

      const plasmaSphere = new THREE.Mesh(
        new THREE.SphereGeometry(1.1 * scale, 18, 18),
        new THREE.MeshBasicMaterial({ color: c1, wireframe: true, transparent: true, opacity: 0.9 })
      );
      plasmaSphere.position.y = 1.1 * scale;
      root.add(plasmaSphere);

      customTick = (p, elapsed) => {
        const flicker = Math.sin(elapsed * 55) > 0 ? 1.0 : 0.35;
        const fade = p > 0.65 ? Math.max(0, 1 - (p - 0.65) / 0.35) : 1;
        bolts.forEach(bt => {
          const active = p >= bt.delay ? 1 : 0;
          bt.segs.forEach(sg => {
            sg.material.opacity = active * flicker * fade;
          });
        });
        plasmaSphere.rotation.set(elapsed * 5, elapsed * 7, 0);
        plasmaSphere.scale.setScalar(1 + Math.sin(elapsed * 30) * 0.18 + p * 0.5);
        plasmaSphere.material.opacity = flicker * fade * 0.85;
      };

    } else if (attrId === 'wind') {
      // 🌪️ 風属性：螺旋トルネードリングが高速回転しながら上昇し、真空の刃が周囲を舞う！
      const rings = [];
      const rCnt = 7 + tier * 3;
      for (let i = 0; i < rCnt; i++) {
        const t = i / rCnt;
        const torus = new THREE.Mesh(
          new THREE.TorusGeometry((0.45 + t * 1.45) * scale, 0.08 * scale, 8, 28),
          new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? c1 : c2, transparent: true, opacity: 0.9 })
        );
        torus.rotation.x = Math.PI / 2 + (i % 2 === 0 ? 0.14 : -0.14);
        torus.position.y = (0.3 + t * 5.2) * scale;
        root.add(torus);
        rings.push({ mesh: torus, baseY: (0.3 + t * 5.2) * scale, idx: i });
      }

      customTick = (p, elapsed) => {
        const fade = p > 0.7 ? Math.max(0, 1 - (p - 0.7) / 0.3) : 1;
        rings.forEach(r => {
          r.mesh.rotation.z = elapsed * (10 + r.idx * 0.8);
          r.mesh.position.y = r.baseY + p * 1.8 * scale;
          r.mesh.scale.setScalar(1 + p * 0.45);
          r.mesh.material.opacity = fade * 0.9;
        });
      };

    } else if (attrId === 'water') {
      // 🌊 水属性：間欠泉ウォーターピラーが噴き上がり、同心円の巨大波紋が次々と広がる！
      const geyser = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55 * scale, 1.35 * scale, 7.5 * scale, 22, 1, true),
        new THREE.MeshBasicMaterial({ color: c1, side: THREE.DoubleSide, transparent: true, opacity: 0.65 })
      );
      geyser.position.y = 3.75 * scale;
      root.add(geyser);

      const ripples = [];
      for (let i = 0; i < 4 + tier; i++) {
        const rp = new THREE.Mesh(
          new THREE.RingGeometry(0.5 * scale, 0.85 * scale, 32),
          new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? c2 : c3, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })
        );
        rp.rotation.x = -Math.PI / 2;
        rp.position.y = 0.12 + i * 0.03;
        root.add(rp);
        ripples.push({ mesh: rp, delay: i * 0.14 });
      }

      customTick = (p, elapsed) => {
        const hFactor = Math.sin(Math.min(1, p * 1.4) * Math.PI);
        geyser.scale.set(1 + p * 0.4, Math.max(0.05, hFactor), 1 + p * 0.4);
        geyser.position.y = 3.75 * scale * hFactor;
        geyser.rotation.y = elapsed * 4;
        geyser.material.opacity = Math.max(0, (1 - p) * 0.72);

        ripples.forEach(rp => {
          const lp = Math.max(0, Math.min(1, (p - rp.delay) / 0.7));
          rp.mesh.scale.setScalar(1 + lp * 4.2);
          rp.mesh.material.opacity = lp > 0 ? Math.max(0, (1 - lp) * 0.9) : 0;
        });
      };

    } else if (attrId === 'earth') {
      // 🪨 大地属性：巨大な岩塊ピラー群が地響きとともに隆起し、砕け散る！
      const rocks = [];
      const rCnt = 6 + tier * 3;
      for (let i = 0; i < rCnt; i++) {
        const ang = (Math.PI * 2 * i) / rCnt;
        const rad = (0.95 + (i % 2) * 0.75) * scale;
        const rock = new THREE.Mesh(
          new THREE.DodecahedronGeometry((0.58 + (i % 3) * 0.2) * scale, 0),
          new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? c1 : c2, transparent: true, opacity: 0.95 })
        );
        rock.position.set(Math.cos(ang) * rad, -1.0 * scale, Math.sin(ang) * rad);
        root.add(rock);
        rocks.push({ mesh: rock, targetY: (0.85 + (i % 3) * 0.45) * scale, rotSpd: (i % 2 === 0 ? 2 : -2) });
      }

      customTick = (p, elapsed) => {
        const rise = Math.min(1, p / 0.28);
        const ease = 1 - Math.pow(1 - rise, 3);
        const fade = p > 0.72 ? Math.max(0, 1 - (p - 0.72) / 0.28) : 1;
        rocks.forEach(rk => {
          rk.mesh.position.y = -1.0 * scale + (rk.targetY + 1.0 * scale) * ease;
          rk.mesh.rotation.set(elapsed * rk.rotSpd, elapsed * rk.rotSpd * 1.2, 0);
          rk.mesh.material.opacity = fade * 0.95;
        });
      };

    } else if (attrId === 'dark') {
      // 🌌 闇属性：漆黒のブラックホール球体が膨張・吸引し、ネオン降着円盤が猛回転！
      const bh = new THREE.Mesh(
        new THREE.SphereGeometry(1.05 * scale, 24, 24),
        new THREE.MeshBasicMaterial({ color: 0x05070e, transparent: true, opacity: 0.98 })
      );
      bh.position.y = 1.75 * scale;
      root.add(bh);

      const disk1 = new THREE.Mesh(
        new THREE.TorusGeometry(1.85 * scale, 0.16 * scale, 10, 36),
        new THREE.MeshBasicMaterial({ color: c1, transparent: true, opacity: 0.95 })
      );
      disk1.position.y = 1.75 * scale;
      disk1.rotation.x = Math.PI * 0.36;
      root.add(disk1);

      const disk2 = new THREE.Mesh(
        new THREE.TorusGeometry(2.35 * scale, 0.10 * scale, 10, 36),
        new THREE.MeshBasicMaterial({ color: c2, transparent: true, opacity: 0.88 })
      );
      disk2.position.y = 1.75 * scale;
      disk2.rotation.set(Math.PI * 0.42, 0.4, 0);
      root.add(disk2);

      customTick = (p, elapsed) => {
        const pulse = Math.sin(Math.min(1, p * 1.25) * Math.PI);
        const sc = Math.max(0.05, pulse * 1.25);
        bh.scale.setScalar(sc);
        disk1.scale.setScalar(sc);
        disk2.scale.setScalar(sc);
        disk1.rotation.z = elapsed * 6;
        disk2.rotation.z = -elapsed * 4.5;
      };

    } else if (attrId === 'poison') {
      // ☠️ 呪詛・毒属性：魔界の毒霧リングと猛毒オーブが湧き上がる！
      const orbs = [];
      const oCnt = 10 + tier * 4;
      for (let i = 0; i < oCnt; i++) {
        const ang = (Math.PI * 2 * i) / oCnt;
        const rad = (0.5 + (i % 3) * 0.55) * scale;
        const orb = new THREE.Mesh(
          new THREE.SphereGeometry((0.25 + (i % 3) * 0.12) * scale, 14, 14),
          new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? c1 : c2, transparent: true, opacity: 0.88 })
        );
        orb.position.set(Math.cos(ang) * rad, 0.2, Math.sin(ang) * rad);
        root.add(orb);
        orbs.push({ mesh: orb, ang, rad, spd: 2.5 + (i % 4) * 0.7 });
      }

      customTick = (p, elapsed) => {
        const fade = p > 0.7 ? Math.max(0, 1 - (p - 0.7) / 0.3) : 1;
        orbs.forEach((ob, idx) => {
          ob.mesh.position.y = 0.2 + p * ob.spd * scale;
          ob.mesh.position.x = Math.cos(ob.ang + elapsed * 2) * ob.rad;
          ob.mesh.position.z = Math.sin(ob.ang + elapsed * 2) * ob.rad;
          ob.mesh.scale.setScalar(1 + Math.sin(elapsed * 8 + idx) * 0.25);
          ob.mesh.material.opacity = fade * 0.88;
        });
      };

    } else if (attrId === 'star') {
      // 🌟 星屑・宇宙属性：上空の銀河スパイラルから流星群（コメット）が降り注ぎ、プリズム爆発！
      const comets = [];
      const cCnt = 7 + tier * 3;
      for (let i = 0; i < cCnt; i++) {
        const ang = (Math.PI * 2 * i) / cCnt;
        const rad = (0.6 + (i % 3) * 0.65) * scale;
        const star = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.36 * scale, 0),
          new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? c1 : (i % 3 === 1 ? c2 : c3), transparent: true, opacity: 0.96 })
        );
        const startY = (6.5 + (i % 3) * 1.8) * scale;
        star.position.set(Math.cos(ang) * rad, startY, Math.sin(ang) * rad);
        root.add(star);
        comets.push({ mesh: star, startY, delay: (i % 4) * 0.08 });
      }

      customTick = (p, elapsed) => {
        comets.forEach(cm => {
          const lp = Math.max(0, Math.min(1, (p - cm.delay) / 0.55));
          cm.mesh.position.y = Math.max(0.25, cm.startY * (1 - lp * lp));
          cm.mesh.rotation.set(elapsed * 7, elapsed * 9, 0);
          if (p > 0.72) cm.mesh.material.opacity = Math.max(0, 1 - (p - 0.72) / 0.28);
        });
      };

    } else {
      // ⚔️ 秘剣・無属性 ／ ✨ 聖光・光属性：天空から光柱が降り注ぎ、12本の聖剣陣が展開して中心へ一斉突き刺さる！
      const hPillar = 8.5 * scale;
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.45 * scale, 1.25 * scale, hPillar, 24, 1, true),
        new THREE.MeshBasicMaterial({ color: c1, side: THREE.DoubleSide, transparent: true, opacity: 0.45 })
      );
      pillar.position.y = hPillar * 0.5;
      root.add(pillar);

      const coreBeam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22 * scale, 0.42 * scale, hPillar + 1.2, 18, 1, true),
        new THREE.MeshBasicMaterial({ color: c3, side: THREE.DoubleSide, transparent: true, opacity: 0.88 })
      );
      coreBeam.position.y = (hPillar + 1.2) * 0.5;
      root.add(coreBeam);

      const swords = [];
      const sCount = 8 + tier * 3;
      for (let s = 0; s < sCount; s++) {
        const ang = (Math.PI * 2 * s) / sCount;
        const rad = 1.85 * scale;
        const blade = new THREE.Mesh(
          new THREE.BoxGeometry(0.14 * scale, 2.4 * scale, 0.05 * scale),
          new THREE.MeshBasicMaterial({ color: s % 3 === 0 ? c1 : (s % 3 === 1 ? c2 : c3), transparent: true, opacity: 0.96 })
        );
        blade.position.set(Math.cos(ang) * rad, 3.2 * scale, Math.sin(ang) * rad);
        blade.rotation.z = -Math.cos(ang) * 0.45;
        blade.rotation.x = Math.sin(ang) * 0.45;
        root.add(blade);
        swords.push({ mesh: blade, ang, rad });
      }

      customTick = (p, elapsed) => {
        const fade = p > 0.72 ? Math.max(0, 1 - (p - 0.72) / 0.28) : 1;
        pillar.rotation.y = elapsed * 3;
        pillar.material.opacity = fade * 0.45;
        coreBeam.material.opacity = fade * 0.88;

        const diveT = Math.max(0, Math.min(1, (p - 0.18) / 0.32));
        const easeDive = diveT * diveT;
        swords.forEach(sw => {
          const curRad = sw.rad * (1 - easeDive * 0.72);
          sw.mesh.position.set(
            Math.cos(sw.ang + elapsed * 1.5) * curRad,
            (3.2 - easeDive * 2.3) * scale,
            Math.sin(sw.ang + elapsed * 1.5) * curRad
          );
          sw.mesh.material.opacity = fade * 0.96;
        });
      };
    }

    // ---------------------------------------------------------
    // 共通フィニッシュ：周囲に飛び散る大量の星屑クリスタル粒子
    // ---------------------------------------------------------
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

    // 登録してリアルタイムアニメーション開始！
    V9.register3DAnimation(game.scene, root, duration, (p, elapsed, dt) => {
      baseRings.forEach(r => {
        r.mesh.rotation.z = elapsed * r.speed;
        r.mesh.scale.setScalar(1 + p * 0.25);
        if (p > 0.75) r.mesh.material.opacity = Math.max(0, (1 - (p - 0.75) / 0.25) * 0.92);
      });

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

      if (customTick) customTick(p, elapsed, dt);
    });

    // ペット連携追撃ビーム
    spawnPetAssistBeamV9(game, targetX, targetZ, c3);

    // カメラ振動
    if (typeof game.shakeTimer === 'number') {
      game.shakeTimer = Math.max(game.shakeTimer, 0.28 + tier * 0.10);
    }
  }

  // =========================================================
  // 2. ペット連携追撃アシスト3Dビーム
  // =========================================================
  function spawnPetAssistBeamV9(game, targetX, targetZ, colorHex = 0x38bdf8) {
    if (!game?.useWebGL || !game?.scene || !game?.pet?.pos || typeof THREE === 'undefined') return;
    const px = game.pet.pos.x;
    const pz = game.pet.pos.z;
    const grp = new THREE.Group();

    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.96 })
    );
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.48, 0.08, 8, 24),
      new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.92 })
    );
    orb.add(ring);
    grp.add(orb);

    V9.register3DAnimation(game.scene, grp, 0.42, (p, elapsed) => {
      const curX = px + (targetX - px) * p;
      const curZ = pz + (targetZ - pz) * p;
      const arcY = 0.8 + Math.sin(p * Math.PI) * 1.4;
      orb.position.set(curX, arcY, curZ);
      ring.rotation.set(elapsed * 12, elapsed * 10, 0);
      if (p > 0.75) {
        const burst = 1 + ((p - 0.75) / 0.25) * 2.2;
        orb.scale.setScalar(burst);
        orb.material.opacity = Math.max(0, 1 - (p - 0.75) / 0.25);
      }
    });
  }

  // =========================================================
  // 3. 12クラス別・通常攻撃3Dエフェクト
  // =========================================================
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

  // =========================================================
  // 4. 公開メソッド接続＆スキル試し撃ちスタジオUI
  // =========================================================
  V9.castSkillEffect = function (game, slotIdx = 0) {
    const info = V9.getSkillInfo(game, slotIdx);
    spawnAttribute3DEffectV9(game, game?.player, info);
    V9.showSpellCardCutin(game, info);
  };

  V9.previewCustomEffect = function (game, attrId = 'fire', tier = 3) {
    const theme = V9.ATTRIBUTES.find(a => a.id === attrId) || V9.ATTRIBUTES[0];
    const lvMap = [1, 10, 50, 100];
    const tierLabels = ['通常スキル', '✨ スキル進化Ⅰ【真】', '🔥 スキル進化Ⅱ【極】', '🌈 スキル最終進化【神話スペルカード】'];
    const baseName = `${theme.label.replace(/^[^\s]+\s*/, '')}奥義`;
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
    spawnAttribute3DEffectV9(game, game?.player, info);
    V9.showSpellCardCutin(game, info);
  };

  V9.injectSkillPreviewUI = function (game, body, tab) {
    if (!body) return;
    const txt = body.textContent || '';
    if (!/skill|magic|art/.test(tab) && !txt.includes('スキル強化')) return;
    if (body.querySelector('#kmj-v9-studio-box')) return;

    const attrOptions = V9.ATTRIBUTES.map(a => `<option value="${a.id}">${a.label}</option>`).join('');
    const html = `
      <div id="kmj-v9-studio-box" class="card-box" style="margin-bottom:8px;border:1.5px solid #f472b6;background:linear-gradient(135deg, rgba(30,27,75,0.96), rgba(15,23,42,0.96));">
        <div style="font-size:11.5px;font-weight:900;color:#f9a8d4;margin-bottom:4px;">🎬 スキルエフェクト試し撃ちスタジオ（game9.js 専用エンジン）</div>
        <div style="font-size:9.5px;color:#e2e8f0;line-height:1.4;margin-bottom:6px;">
          スキルLvが上がると技名と3D造形が進化（<b>Lv.10【真】／Lv.50【極】／Lv.100【神話スペルカード】</b>）。<br>
          好きな属性と進化段階を選んで、今すぐ3Dフィールド上で試し撃ちできます！
        </div>
        <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
          <select id="kmj-v9-attr-sel" style="flex:1;min-width:130px;background:#0f172a;color:#fff;border:1px solid #38bdf8;border-radius:6px;padding:5px 7px;font-size:11px;font-weight:800;">
            ${attrOptions}
          </select>
          <select id="kmj-v9-tier-sel" style="background:#0f172a;color:#fde047;border:1px solid #fde047;border-radius:6px;padding:5px 7px;font-size:11px;font-weight:800;">
            <option value="0">Lv.1 通常演出</option>
            <option value="1">Lv.10【真】進化</option>
            <option value="2">Lv.50【極】進化</option>
            <option value="3" selected>Lv.100【神話奥義】</option>
          </select>
          <button type="button" id="kmj-v9-test-cast-btn" style="background:linear-gradient(90deg,#ec4899,#8b5cf6);border:none;color:#fff;border-radius:6px;padding:6px 12px;font-size:11px;font-weight:900;cursor:pointer;box-shadow:0 0 12px rgba(236,72,153,0.6);">
            ⚡ 試し撃ち発動！
          </button>
        </div>
      </div>
    `;
    body.insertAdjacentHTML('afterbegin', html);

    const btn = body.querySelector('#kmj-v9-test-cast-btn');
    if (btn) {
      btn.onclick = () => {
        const attrId = body.querySelector('#kmj-v9-attr-sel')?.value || 'fire';
        const tier = Number(body.querySelector('#kmj-v9-tier-sel')?.value ?? 3);
        // モーダルを閉じて3Dフィールド上のエフェクトを大画面で見せる
        if (typeof game.closeModal === 'function') game.closeModal();
        else {
          const modal = document.getElementById('modal');
          if (modal) modal.style.display = 'none';
        }
        setTimeout(() => {
          V9.previewCustomEffect(game, attrId, tier);
        }, 80);
      };
    }
  };

  // =========================================================
  // 5. KaomojiMMORPG への通常攻撃＆スキル説明同期フック
  // =========================================================
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
        window.game.showAlertBanner?.('✨ スキルエフェクト専用 engine (game9.js) 起動完了！', 2200);
      }
    }, 350);
  }

  hookGameV9();
})();
// ▲▲▲ ここまで【スキルエフェクト専用 game9.js 2/2】 ▲▲▲
