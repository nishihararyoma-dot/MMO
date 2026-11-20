// ▼▼▼ ここから【1/4】 ▼▼▼
'use strict';

const MQTT_CDNS = [
  'https://unpkg.com/mqtt@4.3.7/dist/mqtt.min.js',
  'https://cdn.jsdelivr.net/npm/mqtt@4.3.7/dist/mqtt.min.js'
];
const MQTT_SERVERS = [
  { name: 'EMQX', url: 'wss://broker.emqx.io:8084/mqtt' },
  { name: 'HiveMQ', url: 'wss://broker.hivemq.com:8884/mqtt' },
  { name: 'Mosquitto', url: 'wss://test.mosquitto.org:8081/mqtt' }
];
const TOPIC_GLOBAL = 'kaomoji_fantasy_3d/stable/global';
const SECRET_DEBUG_CODE = 'debug777';
const MAX_LEVEL_CAP_V27 = 999;
const MAX_THREAT_CAP_V27 = 999;

const ALL_EMOTE_MOTIONS = [
  'greeting_wave', 'backflip', 'bow_polite', 'tornado_dance', 'heart_float', 'chabudai_rage',
  'cry_fountain', 'dogeza', 'ghost_faint', 'sleep_bubble', 'salute_hero', 'rocket_zoom'
];
const LOADING_KAOMOJIS = ['(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧', 'ε=ε=ε=┏(゜ロ゜;)┛', '(ง •̀_•́)ง ⚔️', '✧*｡٩(ˊᗜˋ*)و✧*｡', '(╯°□°）╯︵ ┻━┻'];
const LOADING_TIPS = [
  '💡 スキルは Lv.10・Lv.50・Lv.100以上で魔法陣や公転オーブが増えて超豪華に進化するよ！',
  '💡 ペットタブの「ペット装備」を着けると相棒の3D見た目とステータスがパワーアップ！',
  '💡 チャット欄の上部をドラッグで移動、右下つまみ(◢)で縦横サイズ変更、「✕ チャット欄を消す」で非表示にできるよ！',
  '💡 進化・転職タブではゴールドを使っていつでも好きな役職に転職でき、武器も片手剣⇔杖に自動切替されるよ！',
  '💡 実績を達成すると常時パッシブバフが発動！全実績コンプリートで超強力な覇者バフが解放されるよ！'
];
const PET_EQUIPS = [
  { id: 'none', name: '装備なし', icon: '➖', cost: 0, atkPct: 0, defPct: 0, hpPct: 0, spdPct: 0, desc: '標準状態' },
  { id: 'pe_ribbon', name: '勇気の赤いリボン', icon: '🎀', cost: 300, atkPct: 0.08, defPct: 0.05, hpPct: 0.10, spdPct: 0.05, desc: 'ATK+8% DEF+5% HP+10% SPD+5%' },
  { id: 'pe_bell', name: '幸運の黄金鈴', icon: '🔔', cost: 800, atkPct: 0.10, defPct: 0.10, hpPct: 0.12, spdPct: 0.15, desc: 'ATK+10% DEF+10% HP+12% SPD+15%' },
  { id: 'pe_visor', name: 'サイバーゴーグル', icon: '🥽', cost: 1800, atkPct: 0.20, defPct: 0.08, hpPct: 0.10, spdPct: 0.12, desc: 'ATK+20% DEF+8% HP+10% SPD+12%' },
  { id: 'pe_scarf', name: '疾風の赤いマフラー', icon: '🧣', cost: 3500, atkPct: 0.22, defPct: 0.15, hpPct: 0.15, spdPct: 0.20, desc: 'ATK+22% DEF+15% HP+15% SPD+20%' },
  { id: 'pe_crown', name: 'ミニ黄金王冠', icon: '👑', cost: 7000, atkPct: 0.25, defPct: 0.25, hpPct: 0.25, spdPct: 0.15, desc: '全ステータス +25% (SPD+15%)' },
  { id: 'pe_wings', name: '天使のミニ翼', icon: '🪽', cost: 12000, atkPct: 0.28, defPct: 0.22, hpPct: 0.28, spdPct: 0.30, desc: 'ATK+28% DEF+22% HP+28% SPD+30%' },
  { id: 'pe_halo', name: '聖なる創世光輪', icon: '😇', cost: 25000, atkPct: 0.38, defPct: 0.35, hpPct: 0.38, spdPct: 0.30, desc: 'ATK+38% DEF+35% HP+38% SPD+30%' }
];

// 拡張役職カタログ（既存EVOLUTIONSと自動統合・ゴールド転職対応）
const EXTRA_ROLES_V40 = [
  { id: '', name: '見習い冒険者', icon: '🗡️', weaponType: 'sword', cost: 0, atkMult: 1.0, matkMult: 1.0, defMult: 1.0, hpMult: 1.0, desc: '片手剣を扱う基本職。バランス良く成長する。' },
  { id: 'warrior', name: '重装戦士', icon: '⚔️', weaponType: 'sword', cost: 500, atkMult: 1.22, matkMult: 0.95, defMult: 1.18, hpMult: 1.20, desc: '片手剣の達人。物理攻撃と耐久力が大幅上昇！' },
  { id: 'mage', name: '魔道士', icon: '🪄', weaponType: 'staff', cost: 500, atkMult: 0.95, matkMult: 1.28, defMult: 1.05, hpMult: 1.08, desc: '武器が杖に変化し通常攻撃が魔法弾＆魔法攻撃判定になる！' },
  { id: 'paladin', name: '聖騎士', icon: '🛡️', weaponType: 'sword', cost: 2500, atkMult: 1.32, matkMult: 1.15, defMult: 1.42, hpMult: 1.38, desc: '聖なる片手剣の守護者。鉄壁の防御と高いHPを誇る。' },
  { id: 'archmage', name: '大賢者', icon: '🔮', weaponType: 'staff', cost: 2500, atkMult: 1.05, matkMult: 1.52, defMult: 1.18, hpMult: 1.22, desc: '極限の魔導杖使い。通常魔法弾とスキルの威力が超絶強化！' },
  { id: 'blade_master', name: '蒼穹の剣聖', icon: '⚡', weaponType: 'sword', cost: 8000, atkMult: 1.62, matkMult: 1.15, defMult: 1.35, hpMult: 1.45, desc: '神速の片手剣士。圧倒的な斬撃火力と速度で敵を蹂躙する。' },
  { id: 'astral_witch', name: '星詠みの神官', icon: '🌟', weaponType: 'staff', cost: 8000, atkMult: 1.15, matkMult: 1.75, defMult: 1.32, hpMult: 1.38, desc: '星々の魔力を宿す杖の最高位職。魔法攻撃力が極限まで高まる！' }
];

// 武器名変換（魔道士系＝杖 / 戦士系＝片手剣）
function convertWeaponNameToStaff(rawName) {
  if (!rawName) return '魔導の杖';
  const s = String(rawName);
  if (/杖|ロッド|スタッフ|ステッキ|ワンド|staff|rod|wand/i.test(s)) return s;
  const map = [
    [/木の剣|ひのきのぼう|初期の剣|木刀/g, '見習いの木の杖'],
    [/銅の剣|ブロンズソード/g, '青銅の魔導杖'],
    [/鉄の剣|アイアンソード/g, '白鉄の魔法杖'],
    [/鋼の剣|スチールソード/g, '精霊の銀魔杖'],
    [/ミスリルソード|ミスリルの剣/g, 'ミスリルアークロッド'],
    [/オリハルコンソード|オリハルコンの剣/g, 'オリハルコン星屑杖'],
    [/ドラゴンソード|竜の剣|竜殺しの剣/g, '竜王の紅蓮魔導杖'],
    [/聖剣|エクスカリバー|神剣|創世剣/g, '創世神聖スタッフ'],
    [/大剣|グレートソード|クレイモア/g, '賢者の大魔導杖'],
    [/短剣|ダガー|ナイフ/g, 'フェアリーワンド'],
    [/片手剣|剣|刀|ソード|ブレード|アックス|斧|槍|ランス|スピア/g, '魔導杖'],
    [/Sword|Blade|Axe|Spear|Lance/gi, 'Staff']
  ];
  for (const [re, rep] of map) {
    if (re.test(s)) return s.replace(re, rep);
  }
  return s + '（魔導杖）';
}

function convertWeaponNameToSword(rawName) {
  if (!rawName) return '騎士の片手剣';
  const s = String(rawName);
  if (/剣|ソード|ブレード|sword|blade/i.test(s) && !/杖|ロッド|スタッフ|ワンド/i.test(s)) return s;
  return s
    .replace(/魔導杖|魔法杖|魔導の杖|木の杖|スタッフ|ロッド|ワンド|ステッキ|杖/g, '片手剣')
    .replace(/Staff|Rod|Wand/gi, 'Sword');
}

(function injectV40Styles() {
  if (document.getElementById('kmj-v20-style')) return;
  const st = document.createElement('style');
  st.id = 'kmj-v20-style';
  st.textContent = `
#kmj-loading-screen{position:fixed;inset:0;z-index:96;background:radial-gradient(circle at center,#0f172a 0%,#020617 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:24px;transition:opacity .28s ease;pointer-events:auto}
#kmj-loading-screen.fade-out{opacity:0;pointer-events:none}
.kmj-load-kao{font-size:32px;font-weight:900;color:#38bdf8;text-shadow:0 0 18px rgba(56,189,248,.8);animation:kmjBounce .6s infinite alternate}
.kmj-load-bar-bg{width:min(300px,80vw);height:10px;background:#1e293b;border:1px solid #38bdf8;border-radius:999px;overflow:hidden}
.kmj-load-bar-fill{height:100%;width:0%;background:linear-gradient(90deg,#38bdf8,#f472b6,#fde047);transition:width .25s ease}
@keyframes kmjBounce{from{transform:translateY(0)}to{transform:translateY(-8px)}}
.world-head-bubble{position:absolute;transform:translate(-50%,-100%);background:rgba(15,23,42,.96);border:2px solid #38bdf8;border-radius:14px;padding:5px 11px;text-align:center;box-shadow:0 6px 18px rgba(0,0,0,.7);pointer-events:none!important;max-width:220px;word-break:break-word;z-index:14;animation:kmjPop .18s ease-out}
.world-head-bubble.is-emote{border-color:#f472b6;background:rgba(36,12,48,.96)}
.world-head-bubble::after{content:'';position:absolute;bottom:-7px;left:50%;transform:translateX(-50%);border-width:7px 6px 0;border-style:solid;border-color:#38bdf8 transparent transparent}
.world-head-bubble.is-emote::after{border-color:#f472b6 transparent transparent}
@keyframes kmjPop{from{transform:translate(-50%,-85%) scale(.75);opacity:0}to{transform:translate(-50%,-100%) scale(1);opacity:1}}
#kmj-chat-drag-bar{display:flex;align-items:center;justify-content:space-between;gap:6px;padding:4px 8px;background:rgba(15,23,42,.96);border-bottom:1px solid rgba(56,189,248,.45);cursor:move;touch-action:none;user-select:none;border-radius:8px 8px 0 0;flex-shrink:0}
#kmj-chat-resize-grip{position:absolute;right:0;bottom:0;width:24px;height:24px;cursor:nwse-resize;touch-action:none;z-index:28;display:flex;align-items:flex-end;justify-content:flex-end;padding:3px;color:#38bdf8;font-size:13px;font-weight:900;line-height:1;user-select:none;background:radial-gradient(circle at bottom right,rgba(56,189,248,.28),transparent 70%);border-radius:0 0 8px 0}
#chat-panel{box-sizing:border-box;min-width:210px;min-height:125px;max-width:94vw;max-height:80vh;display:flex;flex-direction:column;overflow:hidden}
#chat-panel.hidden{display:none!important}
#chat-panel #chat-messages,#chat-panel #chat-log,#chat-panel .chat-messages,#chat-panel .chat-log{flex:1 1 auto;min-height:46px;max-height:none!important;overflow-y:auto}
.kmj-role-grid-2col{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
.kmj-ach-passive-banner{background:linear-gradient(135deg,rgba(30,27,75,.95),rgba(15,23,42,.96));border:1.5px solid #fde047;border-radius:10px;padding:9px 11px;margin-bottom:10px;box-shadow:0 0 18px rgba(250,204,21,.22)}
`;
  document.head.appendChild(st);
})();

Object.assign(KaomojiMMORPG.prototype, {
  // チャット自由移動＋右下つまみのみで縦横リサイズ＋右上「✕ チャット欄を消す」
  initChatFreeTransform() {
    const panel = document.getElementById('chat-panel');
    if (!panel) return;
    document.getElementById('kmj-chat-resize-handle-v34')?.remove();
    if (panel.dataset.v40Movable) return;
    panel.dataset.v40Movable = '1';

    const cs = window.getComputedStyle(panel);
    if (cs.position === 'static') panel.style.position = 'fixed';
    const rect0 = panel.getBoundingClientRect();
    this._chatDefaultBox = {
      left: cs.left !== 'auto' ? cs.left : `${Math.max(8, rect0.left)}px`,
      top: cs.top !== 'auto' ? cs.top : '',
      bottom: cs.bottom !== 'auto' ? cs.bottom : '76px',
      width: panel.style.width || (rect0.width > 50 ? `${Math.round(rect0.width)}px` : '290px'),
      height: panel.style.height || (rect0.height > 50 ? `${Math.round(rect0.height)}px` : '180px')
    };

    const dragBar = document.createElement('div');
    dragBar.id = 'kmj-chat-drag-bar';
    dragBar.innerHTML = `
      <span style="font-size:10px;font-weight:900;color:#7dd3fc;letter-spacing:.4px;">✥ ドラッグで移動</span>
      <button type="button" id="btn-chat-hide-v40" style="background:#7f1d1d;border:1px solid #fca5a5;color:#fff;border-radius:5px;padding:2px 8px;font-size:10px;font-weight:900;cursor:pointer;">✕ チャット欄を消す</button>
    `;
    panel.insertBefore(dragBar, panel.firstChild);

    const grip = document.createElement('div');
    grip.id = 'kmj-chat-resize-grip';
    grip.title = 'ドラッグで縦横サイズ変更';
    grip.textContent = '◢';
    panel.appendChild(grip);

    try {
      const saved = JSON.parse(localStorage.getItem('kmj_chat_box_v40') || localStorage.getItem('kmj_chat_box_v18') || 'null');
      if (saved) {
        if (saved.left && saved.top) {
          panel.style.left = saved.left;
          panel.style.top = saved.top;
          panel.style.bottom = 'auto';
          panel.style.right = 'auto';
        }
        if (saved.width) panel.style.width = saved.width;
        if (saved.height) panel.style.height = saved.height;
      }
    } catch (e) {}

    const saveBox = () => {
      try {
        localStorage.setItem('kmj_chat_box_v40', JSON.stringify({
          left: panel.style.left, top: panel.style.top, width: panel.style.width, height: panel.style.height
        }));
      } catch (e) {}
    };

    const hideChatBox = (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      sfx?.init?.();
      this.chatCollapsed = true;
      panel.classList.add('hidden');
      this.showAlertBanner?.('💬 チャット欄を非表示にしました（💬ボタンで再表示）', 1500);
    };
    document.getElementById('btn-chat-hide-v40')?.addEventListener('click', hideChatBox);
    document.getElementById('btn-chat-hide-v40')?.addEventListener('touchend', hideChatBox, { passive: false });

    let dragging = false, sx = 0, sy = 0, sl = 0, st = 0;
    const startDrag = (cx, cy) => {
      const r = panel.getBoundingClientRect();
      dragging = true; sx = cx; sy = cy; sl = r.left; st = r.top;
      panel.style.left = `${sl}px`;
      panel.style.top = `${st}px`;
      panel.style.bottom = 'auto';
      panel.style.right = 'auto';
    };
    const moveDrag = (cx, cy) => {
      if (!dragging) return;
      const r = panel.getBoundingClientRect();
      panel.style.left = `${Math.max(2, Math.min(window.innerWidth - r.width - 2, sl + (cx - sx)))}px`;
      panel.style.top = `${Math.max(2, Math.min(window.innerHeight - r.height - 2, st + (cy - sy)))}px`;
    };
    const endDrag = () => { if (dragging) { dragging = false; saveBox(); } };

    dragBar.addEventListener('mousedown', (e) => {
      if (e.target.id === 'btn-chat-hide-v40') return;
      e.preventDefault(); e.stopPropagation();
      startDrag(e.clientX, e.clientY);
    });
    window.addEventListener('mousemove', (e) => moveDrag(e.clientX, e.clientY));
    window.addEventListener('mouseup', endDrag);
    dragBar.addEventListener('touchstart', (e) => {
      if (e.target.id === 'btn-chat-hide-v40') return;
      e.preventDefault(); e.stopPropagation();
      startDrag(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });
    window.addEventListener('touchmove', (e) => { if (dragging) moveDrag(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
    window.addEventListener('touchend', endDrag);

    // 右下つまみのみで縦幅・横幅を同時自由リサイズ
    let resizing = false, rx = 0, ry = 0, rw = 0, rh = 0;
    const startResize = (cx, cy) => {
      const r = panel.getBoundingClientRect();
      resizing = true; rx = cx; ry = cy; rw = r.width; rh = r.height;
      panel.style.left = `${r.left}px`;
      panel.style.top = `${r.top}px`;
      panel.style.bottom = 'auto';
      panel.style.right = 'auto';
    };
    const moveResize = (cx, cy) => {
      if (!resizing) return;
      const nextW = Math.max(210, Math.min(window.innerWidth * 0.94, Math.round(rw + (cx - rx))));
      const nextH = Math.max(125, Math.min(window.innerHeight * 0.80, Math.round(rh + (cy - ry))));
      panel.style.width = `${nextW}px`;
      panel.style.height = `${nextH}px`;
    };
    const endResize = () => { if (resizing) { resizing = false; saveBox(); } };

    grip.addEventListener('mousedown', (e) => { e.preventDefault(); e.stopPropagation(); startResize(e.clientX, e.clientY); });
    window.addEventListener('mousemove', (e) => moveResize(e.clientX, e.clientY));
    window.addEventListener('mouseup', endResize);
    grip.addEventListener('touchstart', (e) => { e.preventDefault(); e.stopPropagation(); startResize(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
    window.addEventListener('touchmove', (e) => { if (resizing) moveResize(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
    window.addEventListener('touchend', endResize);
  },

  // チャット定型文バーをスリムに保ちつつ縦幅ドラッグバーを完全排除
  fixChatCompactLayoutV31() {
    document.getElementById('kmj-chat-resize-handle-v34')?.remove();
    const isSmallMobile = window.innerWidth <= 920;

    document.querySelectorAll('button').forEach(btn => {
      if (btn.closest?.('#kmj-secret-debug-modal') || btn.closest?.('#kmj-ui-custom-bar')) return;
      const txt = (btn.textContent || '').trim();
      if (/^(全体チャット|部屋\/オフライン)$/.test(txt)) {
        btn.style.setProperty('height', '26px', 'important');
        btn.style.setProperty('min-height', '24px', 'important');
        btn.style.setProperty('padding', '2px 8px', 'important');
        btn.style.setProperty('font-size', '11px', 'important');
      } else if (/^(よろしく！|ボス行こう！|ありがとう！|おつかれ！)$/.test(txt)) {
        btn.style.setProperty('height', '22px', 'important');
        btn.style.setProperty('min-height', '20px', 'important');
        btn.style.setProperty('padding', '1px 7px', 'important');
        btn.style.setProperty('font-size', '10px', 'important');
        btn.style.setProperty('white-space', 'nowrap', 'important');
        btn.style.setProperty('border-radius', '999px', 'important');
        if (btn.parentElement) {
          const row = btn.parentElement;
          row.style.setProperty('display', 'flex', 'important');
          row.style.setProperty('flex-wrap', 'nowrap', 'important');
          row.style.setProperty('gap', '4px', 'important');
          row.style.setProperty('overflow-x', 'auto', 'important');
          row.style.setProperty('flex-shrink', '0', 'important');
        }
      }
    });

    const panel = document.getElementById('chat-panel');
    if (panel) {
      if (isSmallMobile && !panel.style.width) {
        panel.style.width = '46vw';
      }
      const inp = panel.querySelector('input[placeholder*="メッセージ"], input[placeholder*="チャット"], #input-chat-msg, #chat-input');
      if (inp) {
        inp.style.setProperty('height', '26px', 'important');
        inp.style.setProperty('font-size', '11px', 'important');
      }
    }
  },

  // Lv.999＆脅威度999上限の常時適用
  enforce999CapsV27() {
    try {
      ['MAX_LV', 'MAX_LEVEL', 'LEVEL_CAP', 'MAX_PLAYER_LV', 'MAX_SKILL_LV', 'MAX_THREAT_RANK', 'MAX_THREAT', 'THREAT_CAP', 'MAX_THREAT_LEVEL', 'MAX_DANGER'].forEach(gKey => {
        if (typeof window[gKey] === 'number' && window[gKey] < MAX_LEVEL_CAP_V27) window[gKey] = MAX_LEVEL_CAP_V27;
      });
    } catch (e) {}

    const d = this.saveData;
    if (!d) return;
    if (typeof d.lv === 'number' && d.lv > MAX_LEVEL_CAP_V27) d.lv = MAX_LEVEL_CAP_V27;
    if (typeof d.level === 'number' && d.level > MAX_LEVEL_CAP_V27) d.level = MAX_LEVEL_CAP_V27;
    if (this.player) {
      if (typeof this.player.lv === 'number' && this.player.lv > MAX_LEVEL_CAP_V27) this.player.lv = MAX_LEVEL_CAP_V27;
      if (typeof this.player.level === 'number' && this.player.level > MAX_LEVEL_CAP_V27) this.player.level = MAX_LEVEL_CAP_V27;
    }
    ['threatRank', 'threat', 'threatLevel', 'threatLv', 'danger', 'dangerLevel', 'worldThreat', 'areaThreat'].forEach(tk => {
      if (typeof d[tk] === 'number' && d[tk] > MAX_THREAT_CAP_V27) d[tk] = MAX_THREAT_CAP_V27;
      if (typeof this[tk] === 'number' && this[tk] > MAX_THREAT_CAP_V27) this[tk] = MAX_THREAT_CAP_V27;
    });
    [d.skillLevels, d.skillLvs].forEach(map => {
      if (!map || typeof map !== 'object') return;
      Object.keys(map).forEach(k => {
        if (typeof map[k] === 'number' && map[k] > MAX_LEVEL_CAP_V27) map[k] = MAX_LEVEL_CAP_V27;
      });
    });
  }
});
// ▲▲▲ ここまで【1/4】 ▲▲▲
// ▼▼▼ ここから【2/4】 ▼▼▼
Object.assign(KaomojiMMORPG.prototype, {
  // 1. 敵の見た目を本格3Dモンスター造形へ一新（スライム・ドラゴン・ゴーレム・死神・悪魔・ボス）
  rebuildMonstersAs3DMonsters(dt = 0.016) {
    if (!this.useWebGL || !this.monsters || typeof THREE === 'undefined') return;
    const now = performance.now() * 0.001;
    this.monsters.forEach((m, idx) => {
      if (!m || m.dead) return;
      const grp = m.group || m.mesh;
      if (!grp) return;
      if (!grp.userData.v20Monster3D) {
        grp.userData.v20Monster3D = true;
        while (grp.children.length > 0) { grp.remove(grp.children[0]); }
        const sc = Number(m.scale) || 1.0;
        const nameStr = String(m.name || m.id || '');
        const isBoss = !!(m.isBoss || m.boss || sc >= 1.45 || /ボス|王|魔王|竜|ドラゴン|神|極|覇/.test(nameStr));
        let kind = 'demon';
        if (/スライム|ぷよ|ゼリー|slime/i.test(nameStr)) kind = 'slime';
        else if (/竜|ドラゴン|ワイバーン|鳥|コウモリ|dragon|wyvern|bat/i.test(nameStr)) kind = 'dragon';
        else if (/ゴーレム|岩|騎士|アーマー|機|ロボ|golem|knight/i.test(nameStr)) kind = 'golem';
        else if (/幽霊|死神|骸骨|霊|闇|影|ghost|reaper|skeleton/i.test(nameStr)) kind = 'reaper';

        let baseCol = 0x7c3aed;
        if (typeof m.color === 'number') baseCol = m.color;
        else if (typeof m.color === 'string' && /^#[0-9a-fA-F]{6}$/.test(m.color)) baseCol = parseInt(m.color.slice(1), 16);
        else if (kind === 'slime') baseCol = 0x10b981;
        else if (kind === 'dragon') baseCol = 0xdc2626;
        else if (kind === 'golem') baseCol = 0x64748b;
        else if (kind === 'reaper') baseCol = 0x312e81;

        const bodyMat = new THREE.MeshLambertMaterial({ color: baseCol });
        const darkMat = new THREE.MeshLambertMaterial({ color: 0x1e1b4b, emissive: isBoss ? 0x7f1d1d : 0x1e1b4b });
        const eyeMat = new THREE.MeshBasicMaterial({ color: isBoss ? 0xfef08a : 0xff1e42 });
        const clawMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });

        if (kind === 'slime') {
          const slimeMat = new THREE.MeshLambertMaterial({ color: baseCol, transparent: true, opacity: 0.88 });
          const dome = new THREE.Mesh(new THREE.SphereGeometry(0.78 * sc, 18, 14), slimeMat);
          dome.scale.set(1.15, 0.82, 1.15);
          dome.position.y = 0.62 * sc;
          const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.28 * sc, 0), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
          core.position.y = 0.62 * sc;
          grp.add(dome, core);
          grp.userData.slimeDome = dome;
        } else if (kind === 'dragon') {
          const torso = new THREE.Mesh(new THREE.ConeGeometry(0.55 * sc, 1.45 * sc, 10), bodyMat);
          torso.rotation.x = Math.PI * 0.35;
          torso.position.set(0, 0.95 * sc, 0);
          const head = new THREE.Mesh(new THREE.ConeGeometry(0.36 * sc, 0.85 * sc, 8), bodyMat);
          head.rotation.x = Math.PI * 0.5;
          head.position.set(0, 1.42 * sc, 0.55 * sc);
          const tail = new THREE.Mesh(new THREE.ConeGeometry(0.24 * sc, 1.3 * sc, 8), darkMat);
          tail.rotation.x = -Math.PI * 0.6;
          tail.position.set(0, 0.62 * sc, -0.85 * sc);
          grp.add(torso, head, tail);
          const wings = [];
          [-1, 1].forEach(side => {
            const wPivot = new THREE.Group();
            wPivot.position.set(side * 0.32 * sc, 1.25 * sc, -0.05 * sc);
            const wMesh = new THREE.Mesh(new THREE.BoxGeometry(1.15 * sc, 0.06 * sc, 0.62 * sc), darkMat);
            wMesh.position.x = side * 0.55 * sc;
            wPivot.add(wMesh);
            grp.add(wPivot);
            wings.push({ pivot: wPivot, side });
          });
          grp.userData.monsterWings = wings;
        } else if (kind === 'golem') {
          const chest = new THREE.Mesh(new THREE.DodecahedronGeometry(0.75 * sc, 0), bodyMat);
          chest.position.y = 1.05 * sc;
          const head = new THREE.Mesh(new THREE.BoxGeometry(0.52 * sc, 0.42 * sc, 0.52 * sc), darkMat);
          head.position.y = 1.72 * sc;
          grp.add(chest, head);
          [-1, 1].forEach(side => {
            const sh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.38 * sc, 0), darkMat);
            sh.position.set(side * 0.82 * sc, 1.38 * sc, 0);
            const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.2 * sc, 0.26 * sc, 0.95 * sc, 8), bodyMat);
            arm.position.set(side * 0.88 * sc, 0.78 * sc, 0.15 * sc);
            grp.add(sh, arm);
          });
        } else if (kind === 'reaper') {
          const cloak = new THREE.Mesh(new THREE.ConeGeometry(0.68 * sc, 1.65 * sc, 12, 1, true), darkMat);
          cloak.position.y = 1.05 * sc;
          const hood = new THREE.Mesh(new THREE.SphereGeometry(0.42 * sc, 12, 12), bodyMat);
          hood.position.y = 1.78 * sc;
          const scytheHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.05 * sc, 0.05 * sc, 1.9 * sc, 8), clawMat);
          scytheHandle.position.set(0.65 * sc, 1.15 * sc, 0.2 * sc);
          scytheHandle.rotation.z = -0.25;
          const scytheBlade = new THREE.Mesh(new THREE.TorusGeometry(0.45 * sc, 0.06 * sc, 6, 16, Math.PI * 0.8), new THREE.MeshBasicMaterial({ color: 0xf43f5e }));
          scytheBlade.position.set(0.48 * sc, 1.95 * sc, 0.2 * sc);
          grp.add(cloak, hood, scytheHandle, scytheBlade);
        } else {
          const torso = new THREE.Mesh(new THREE.OctahedronGeometry(0.66 * sc, 1), bodyMat);
          torso.scale.set(1.05, 1.18, 0.95);
          torso.position.y = 0.88 * sc;
          const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.46 * sc, 0), bodyMat);
          head.position.set(0, 1.52 * sc, 0.14 * sc);
          const tail = new THREE.Mesh(new THREE.ConeGeometry(0.16 * sc, 0.95 * sc, 8), darkMat);
          tail.rotation.x = -Math.PI * 0.65;
          tail.position.set(0, 0.58 * sc, -0.68 * sc);
          grp.add(torso, head, tail);
          [-1, 1].forEach(side => {
            const arm = new THREE.Mesh(new THREE.ConeGeometry(0.18 * sc, 0.75 * sc, 6), darkMat);
            arm.position.set(side * 0.68 * sc, 0.82 * sc, 0.28 * sc);
            arm.rotation.x = Math.PI * 0.45;
            const claw = new THREE.Mesh(new THREE.ConeGeometry(0.08 * sc, 0.32 * sc, 5), clawMat);
            claw.position.set(side * 0.68 * sc, 0.72 * sc, 0.65 * sc);
            claw.rotation.x = Math.PI * 0.5;
            grp.add(arm, claw);
          });
        }

        const eyeY = (kind === 'slime') ? 0.68 * sc : (kind === 'dragon' ? 1.46 * sc : 1.56 * sc);
        const eyeZ = (kind === 'slime') ? 0.76 * sc : (kind === 'dragon' ? 0.82 * sc : 0.52 * sc);
        [-1, 1].forEach(side => {
          const horn = new THREE.Mesh(new THREE.ConeGeometry(0.14 * sc, 0.58 * sc, 7), darkMat);
          horn.position.set(side * 0.34 * sc, eyeY + 0.36 * sc, 0.05 * sc);
          horn.rotation.z = -side * 0.45;
          grp.add(horn);
          const eye = new THREE.Mesh(new THREE.SphereGeometry(0.075 * sc, 8, 8), eyeMat);
          eye.position.set(side * 0.18 * sc, eyeY, eyeZ);
          grp.add(eye);
        });

        const auraMat = new THREE.MeshBasicMaterial({ color: isBoss ? 0xef4444 : 0x9333ea, side: THREE.DoubleSide, transparent: true, opacity: isBoss ? 0.86 : 0.62 });
        const auraRing = new THREE.Mesh(new THREE.RingGeometry(0.75 * sc, (isBoss ? 1.38 : 1.08) * sc, 24), auraMat);
        auraRing.rotation.x = -Math.PI / 2;
        auraRing.position.y = 0.06;
        grp.add(auraRing);
        grp.userData.enemyAuraRing = auraRing;

        if (isBoss) {
          const spikeWheel = new THREE.Group();
          for (let i = 0; i < 6; i++) {
            const ang = (i / 6) * Math.PI * 2;
            const sp = new THREE.Mesh(new THREE.ConeGeometry(0.13 * sc, 0.62 * sc, 6), new THREE.MeshBasicMaterial({ color: 0xf43f5e }));
            sp.position.set(Math.cos(ang) * 1.12 * sc, Math.sin(ang) * 1.12 * sc, 0);
            sp.rotation.z = ang - Math.PI / 2;
            spikeWheel.add(sp);
          }
          spikeWheel.position.set(0, 1.15 * sc, -0.45 * sc);
          grp.add(spikeWheel);
          grp.userData.bossSpikeWheel = spikeWheel;
        }
      }
      if (grp.userData.enemyAuraRing) grp.userData.enemyAuraRing.rotation.z -= dt * 2.2;
      if (grp.userData.bossSpikeWheel) grp.userData.bossSpikeWheel.rotation.z += dt * 1.8;
      if (grp.userData.slimeDome) {
        const pulse = 1 + Math.sin(now * 5 + idx) * 0.1;
        grp.userData.slimeDome.scale.set(1.15 * pulse, 0.82 / pulse, 1.15 * pulse);
      }
      if (grp.userData.monsterWings) {
        grp.userData.monsterWings.forEach(w => { w.pivot.rotation.z = w.side * Math.sin(now * 7 + idx) * 0.45; });
      }
    });
  },

  // 2. 敵モンスターの状態異常3Dエフェクト（炎上・凍結・毒・麻痺）
  detectMonsterStatus(m) {
    if (!m) return null;
    if (m._visualStatus && Number(m._visualStatus.timer) > 0) return m._visualStatus.type;
    if (Number(m.burnTimer) > 0 || Number(m.burn) > 0 || m.isBurning === true) return 'burn';
    if (Number(m.freezeTimer) > 0 || Number(m.freeze) > 0 || m.isFrozen === true) return 'freeze';
    if (Number(m.poisonTimer) > 0 || Number(m.poison) > 0 || m.isPoisoned === true) return 'poison';
    if (Number(m.stunTimer) > 0 || Number(m.paralyzeTimer) > 0 || Number(m.stun) > 0 || Number(m.paralyze) > 0 || m.isStunned === true) return 'shock';

    const arrList = [m.debuffs, m.statuses, m.effects].filter(Array.isArray);
    for (const arr of arrList) {
      for (const item of arr) {
        if (!item) continue;
        if (typeof item === 'string') {
          const s = item.toLowerCase();
          if (/^(burn|burning|ignite)$/.test(s)) return 'burn';
          if (/^(freeze|frozen)$/.test(s)) return 'freeze';
          if (/^(poison|poisoned)$/.test(s)) return 'poison';
          if (/^(stun|paralyze|shock)$/.test(s)) return 'shock';
        } else if (typeof item === 'object') {
          const dur = Number(item.timer ?? item.duration ?? item.turns ?? item.remain ?? 1);
          if (dur <= 0) continue;
          const t = String(item.type || item.id || item.name || '').toLowerCase();
          if (/^(burn|burning|ignite)$/.test(t)) return 'burn';
          if (/^(freeze|frozen)$/.test(t)) return 'freeze';
          if (/^(poison|poisoned)$/.test(t)) return 'poison';
          if (/^(stun|paralyze|shock)$/.test(t)) return 'shock';
        }
      }
    }
    return null;
  },

  updateMonsterStatusVisuals(dt) {
    if (!this.useWebGL || !Array.isArray(this.monsters) || typeof THREE === 'undefined') return;
    const now = performance.now() * 0.001;
    this.monsters.forEach((m) => {
      if (!m) return;
      if (m._visualStatus && Number(m._visualStatus.timer) > 0) {
        m._visualStatus.timer = Math.max(0, m._visualStatus.timer - dt);
        if (m._visualStatus.timer <= 0) m._visualStatus = null;
      }
      const grp = m.group || m.mesh;
      if (!grp) return;

      const stType = m.dead ? null : this.detectMonsterStatus(m);
      const curHolder = grp.getObjectByName?.('status_fx_3d');

      if (!stType) {
        if (curHolder) {
          grp.remove(curHolder);
          curHolder.traverse?.(o => { o.geometry?.dispose?.(); o.material?.dispose?.(); });
        }
        grp.userData._curStatusType = null;
        return;
      }

      if (grp.userData._curStatusType !== stType || !curHolder) {
        if (curHolder) grp.remove(curHolder);
        grp.userData._curStatusType = stType;

        const sc = Number(m.scale) || 1.0;
        const fxGrp = new THREE.Group();
        fxGrp.name = 'status_fx_3d';
        fxGrp.userData.items = [];

        if (stType === 'burn') {
          const baseRing = new THREE.Mesh(
            new THREE.RingGeometry(0.65 * sc, 1.25 * sc, 24),
            new THREE.MeshBasicMaterial({ color: 0xf97316, side: THREE.DoubleSide, transparent: true, opacity: 0.88 })
          );
          baseRing.rotation.x = -Math.PI / 2;
          baseRing.position.y = 0.09;
          fxGrp.add(baseRing);

          const flameCols = [0xef4444, 0xf97316, 0xfacc15];
          for (let i = 0; i < 8; i++) {
            const ang = (i / 8) * Math.PI * 2;
            const fMesh = new THREE.Mesh(
              new THREE.ConeGeometry(0.22 * sc, 0.75 * sc, 6),
              new THREE.MeshBasicMaterial({ color: flameCols[i % flameCols.length], transparent: true, opacity: 0.92 })
            );
            fMesh.position.set(Math.cos(ang) * 0.68 * sc, 0.5 * sc, Math.sin(ang) * 0.68 * sc);
            fxGrp.add(fMesh);
            fxGrp.userData.items.push({ mesh: fMesh, ang, dist: 0.68 * sc, phase: i * 0.8, sc });
          }
        } else if (stType === 'freeze') {
          const iceBox = new THREE.Mesh(
            new THREE.BoxGeometry(1.45 * sc, 1.85 * sc, 1.45 * sc),
            new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.45 })
          );
          iceBox.position.y = 0.95 * sc;
          const iceWire = new THREE.Mesh(
            new THREE.BoxGeometry(1.48 * sc, 1.88 * sc, 1.48 * sc),
            new THREE.MeshBasicMaterial({ color: 0xe0f2fe, wireframe: true })
          );
          iceWire.position.y = 0.95 * sc;
          fxGrp.add(iceBox, iceWire);
        } else if (stType === 'poison') {
          const pRing = new THREE.Mesh(
            new THREE.RingGeometry(0.6 * sc, 1.2 * sc, 24),
            new THREE.MeshBasicMaterial({ color: 0xa855f7, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
          );
          pRing.rotation.x = -Math.PI / 2;
          pRing.position.y = 0.09;
          fxGrp.add(pRing);
          for (let i = 0; i < 6; i++) {
            const ang = (i / 6) * Math.PI * 2;
            const bub = new THREE.Mesh(
              new THREE.SphereGeometry(0.18 * sc, 8, 8),
              new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0xc084fc : 0x4ade80, transparent: true, opacity: 0.88 })
            );
            fxGrp.add(bub);
            fxGrp.userData.items.push({ mesh: bub, ang, dist: 0.62 * sc, phase: i * 1.1, sc });
          }
        } else if (stType === 'shock') {
          for (let i = 0; i < 6; i++) {
            const ang = (i / 6) * Math.PI * 2;
            const bolt = new THREE.Mesh(
              new THREE.OctahedronGeometry(0.24 * sc, 0),
              new THREE.MeshBasicMaterial({ color: 0xfef08a })
            );
            fxGrp.add(bolt);
            fxGrp.userData.items.push({ mesh: bolt, ang, dist: 0.78 * sc, phase: i * 1.3, sc });
          }
        }
        grp.add(fxGrp);
      }

      const holder = grp.getObjectByName?.('status_fx_3d');
      if (holder?.userData.items) {
        holder.userData.items.forEach(it => {
          if (stType === 'burn' || stType === 'poison') {
            const cycle = (now * 1.8 + it.phase) % 1;
            it.ang += dt * 2.2;
            it.mesh.position.x = Math.cos(it.ang) * it.dist;
            it.mesh.position.z = Math.sin(it.ang) * it.dist;
            it.mesh.position.y = (0.3 + cycle * 1.55) * it.sc;
            it.mesh.scale.setScalar(Math.max(0.2, 1.15 - cycle * 0.85));
          } else if (stType === 'shock') {
            it.ang += dt * 9.0;
            it.mesh.position.x = Math.cos(it.ang) * it.dist;
            it.mesh.position.z = Math.sin(it.ang) * it.dist;
            it.mesh.position.y = (0.9 + Math.sin(now * 25 + it.phase) * 0.45) * it.sc;
            it.mesh.rotation.y += dt * 15;
          }
        });
      }
    });
  },

  // 3. ペット装備8種・カスタム名前・統一3Dモデル（手足なしキューブ＋3D装備）
  getPetEquipDef(eqId) {
    return PET_EQUIPS.find(e => e.id === eqId) || PET_EQUIPS[0];
  },

  getEquippedPetEquipId(petId = '') {
    const d = this.saveData || {};
    if (petId && d.petEquips && d.petEquips[petId]) return d.petEquips[petId];
    return d.equippedPetEquip || 'none';
  },

  buyOrEquipPetItem(petId, eqId) {
    const d = this.saveData;
    if (!d) return;
    const item = this.getPetEquipDef(eqId);
    if (!d.unlockedPetEquips) d.unlockedPetEquips = ['none'];
    if (item.id !== 'none' && !d.unlockedPetEquips.includes(item.id)) {
      const coinKey = ('gold' in d) ? 'gold' : (('coins' in d) ? 'coins' : (('money' in d) ? 'money' : 'gold'));
      const curCoins = Number(d[coinKey]) || 0;
      if (curCoins < item.cost) {
        this.showAlertBanner?.(`💰 ゴールド不足！（必要: ${item.cost}G / 所持: ${curCoins}G）`, 1800);
        return;
      }
      d[coinKey] = curCoins - item.cost;
      d.unlockedPetEquips.push(item.id);
      sfx?.playHeal?.();
      this.showAlertBanner?.(`🎉 ペット装備「${item.icon} ${item.name}」を購入＆装着しました！`, 2200);
    } else {
      sfx?.playTone?.(720, 'sine', 0.1, 0.08);
      this.showAlertBanner?.(`🐾 ペット装備「${item.icon} ${item.name}」を装着しました！`, 1600);
    }
    if (!d.petEquips) d.petEquips = {};
    if (petId) d.petEquips[petId] = item.id;
    d.equippedPetEquip = item.id;
    if (this.pet) this.pet._v20PetSig = '';
    this.saveGame?.(false);
    this.syncLocalPetAppearance?.();
    this.syncFirebaseNow?.(false);
    this.refreshAllHUD?.();
  },

  attachPetEquip3D(petGrp, eqId) {
    if (!petGrp || typeof THREE === 'undefined') return;
    const oldEq = petGrp.getObjectByName?.('pet_equip_3d');
    if (oldEq) petGrp.remove(oldEq);
    if (!eqId || eqId === 'none') return;
    const eqGrp = new THREE.Group();
    eqGrp.name = 'pet_equip_3d';
    if (eqId === 'pe_ribbon') {
      const mat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
      const l = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.28, 6), mat);
      l.position.set(-0.14, 1.02, 0.28); l.rotation.z = -Math.PI / 2;
      const r = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.28, 6), mat);
      r.position.set(0.14, 1.02, 0.28); r.rotation.z = Math.PI / 2;
      const c = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
      c.position.set(0, 1.02, 0.30);
      eqGrp.add(l, r, c);
    } else if (eqId === 'pe_bell') {
      const collar = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.055, 8, 22), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
      collar.rotation.x = Math.PI / 2; collar.position.y = 0.28;
      const bell = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 14), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
      bell.position.set(0, 0.22, 0.44);
      eqGrp.add(collar, bell);
    } else if (eqId === 'pe_visor') {
      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.20, 0.14), new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.88 }));
      visor.position.set(0, 0.72, 0.41);
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.23, 0.10), new THREE.MeshBasicMaterial({ color: 0x0f172a }));
      frame.position.set(0, 0.72, 0.38);
      eqGrp.add(frame, visor);
    } else if (eqId === 'pe_scarf') {
      const scarfMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.095, 10, 22), scarfMat);
      ring.rotation.x = Math.PI / 2; ring.position.y = 0.26;
      const tail = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.68), scarfMat);
      tail.position.set(-0.24, 0.22, -0.52); tail.rotation.y = 0.32;
      eqGrp.add(ring, tail);
    } else if (eqId === 'pe_crown') {
      const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.22, 0.26, 8), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
      crown.position.set(0, 1.08, 0);
      const gem = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 10), new THREE.MeshBasicMaterial({ color: 0xf43f5e }));
      gem.position.set(0, 1.09, 0.26);
      eqGrp.add(crown, gem);
    } else if (eqId === 'pe_wings') {
      const wMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
      const edgeMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc, side: THREE.DoubleSide });
      [-1, 1].forEach(side => {
        const wing = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.44), wMat);
        wing.position.set(side * 0.62, 0.68, -0.16);
        wing.rotation.y = side * 0.42; wing.rotation.z = side * 0.26;
        const sub = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.28), edgeMat);
        sub.position.set(side * 0.56, 0.52, -0.18);
        sub.rotation.y = side * 0.42;
        eqGrp.add(wing, sub);
      });
    } else if (eqId === 'pe_halo') {
      const halo = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.06, 12, 28), new THREE.MeshBasicMaterial({ color: 0xfde047 }));
      halo.rotation.x = Math.PI / 2; halo.position.set(0, 1.24, 0);
      const innerHalo = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.03, 8, 20), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      innerHalo.rotation.x = Math.PI / 2; innerHalo.position.set(0, 1.24, 0);
      eqGrp.add(halo, innerHalo);
    }
    petGrp.add(eqGrp);
  },

  buildUnifiedPetMesh(petInfo) {
    const grp = new THREE.Group();
    let hex = 0x38bdf8;
    if (typeof petInfo.color === 'number') hex = petInfo.color;
    else if (typeof petInfo.color === 'string' && /^#[0-9a-fA-F]{6}$/.test(petInfo.color)) {
      hex = parseInt(petInfo.color.slice(1), 16);
    }
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.68, 0.72), new THREE.MeshLambertMaterial({ color: hex }));
    body.position.y = 0.62;
    grp.add(body);
    const earMat = new THREE.MeshLambertMaterial({ color: hex });
    [-0.22, 0.22].forEach(ex => {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.24, 6), earMat);
      ear.position.set(ex, 1.04, 0.06);
      grp.add(ear);
    });
    const cvs = document.createElement('canvas');
    cvs.width = 256; cvs.height = 160;
    const ctx = cvs.getContext('2d');
    ctx.fillStyle = '#072f49'; ctx.fillRect(8, 8, 240, 144);
    ctx.strokeStyle = '#7dd3fc'; ctx.lineWidth = 8; ctx.strokeRect(8, 8, 240, 144);
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 38px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(petInfo.kaomoji || '(・ω・)', 128, 82);
    const tex = new THREE.CanvasTexture(cvs);
    const faceMat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 });
    const facePlane = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 0.44), faceMat);
    facePlane.position.set(0, 0.64, 0.375);
    grp.add(facePlane);
    if (petInfo.equipId && petInfo.equipId !== 'none') {
      this.attachPetEquip3D(grp, petInfo.equipId);
    }
    grp.traverse(o => { o.frustumCulled = false; });
    return grp;
  },

  buildRemotePetMesh(petInfo) {
    return this.buildUnifiedPetMesh(petInfo);
  },

  syncLocalPetAppearance() {
    if (!this.useWebGL || !this.scene || !this.pet || typeof THREE === 'undefined') return;
    const info = this.getMyPetSyncInfo();
    if (!info) return;
    const targetObj = this.pet.group || this.pet.mesh;
    const sig = `${info.petId}|${info.kaomoji}|${info.color}|${info.equipId}`;
    if (this.pet._v20PetSig === sig && targetObj && targetObj.parent === this.scene) return;
    this.pet._v20PetSig = sig;
    const oldPos = targetObj ? targetObj.position.clone() : new THREE.Vector3(0, 0, 4);
    const oldRotY = targetObj ? targetObj.rotation.y : 0;
    if (this.pet.group && this.pet.group.parent) this.scene.remove(this.pet.group);
    if (this.pet.mesh && this.pet.mesh !== this.pet.group && this.pet.mesh.parent) this.scene.remove(this.pet.mesh);
    const newGrp = this.buildUnifiedPetMesh(info);
    newGrp.position.copy(oldPos);
    newGrp.rotation.y = oldRotY;
    this.scene.add(newGrp);
    if ('group' in this.pet || !('mesh' in this.pet)) this.pet.group = newGrp;
    if ('mesh' in this.pet) this.pet.mesh = newGrp;
  },

  getPetCustomName(petId, fallbackName = 'ペット') {
    const d = this.saveData || {};
    if (petId && d.petNames && d.petNames[petId]) return String(d.petNames[petId]);
    if (d.customPetName) return String(d.customPetName);
    return String(fallbackName || 'ペット');
  },

  setPetCustomName(petId, rawName) {
    const clean = String(rawName || '').trim().slice(0, 14);
    if (!this.saveData) return;
    if (!this.saveData.petNames) this.saveData.petNames = {};
    if (petId) {
      if (clean) this.saveData.petNames[petId] = clean;
      else delete this.saveData.petNames[petId];
    }
    this.saveData.customPetName = clean;
    if (this.pet && clean) this.pet.name = clean;
    this.saveGame?.(false);
    this.syncFirebaseNow?.(false);
    this.showAlertBanner?.(clean ? `🐾 ペット名を「${clean}」に変更しました！` : '🐾 ペット名を初期値に戻しました', 1800);
  },

  getMyPetSyncInfo() {
    const d = this.saveData || {};
    const rawId = d.equippedPet || d.equippedPetId || d.petId || d.activePet || d.activePetId || d.companionId || d.selectedPet || this.pet?.id || '';
    const hasPetEntity = !!(this.pet && (this.pet.group || this.pet.mesh || this.pet.kaomoji));
    if ((!rawId || rawId === 'none') && !hasPetEntity) return null;
    const petKey = String(rawId || this.pet?.id || 'default_pet');
    let petDef = null;
    if (typeof PETS !== 'undefined' && PETS) {
      petDef = Array.isArray(PETS)
        ? PETS.find(p => p && (p.id === petKey || p.petId === petKey))
        : (PETS[petKey] || Object.values(PETS).find(p => p && (p.id === petKey || p.petId === petKey)));
    }
    const savedObj = (d.ownedPets && d.ownedPets[petKey]) || (d.petData && d.petData[petKey]) || (Array.isArray(d.pets) ? d.pets.find(p => p && (p.id === petKey)) : null);
    const kaomoji = this.pet?.kaomoji || petDef?.kaomoji || savedObj?.kaomoji || '(・ω・)';
    const baseName = petDef?.name || savedObj?.name || this.pet?.name || 'ペット';
    const name = this.getPetCustomName(petKey, baseName);
    const lv = savedObj?.lv || d.petLevels?.[petKey] || this.pet?.lv || 1;
    const color = petDef?.color || petDef?.hexColor || savedObj?.color || '#38bdf8';
    const equipId = this.getEquippedPetEquipId(petKey);
    return { petId: petKey, kaomoji: String(kaomoji), name: String(name), lv: Number(lv) || 1, color, equipId };
  },

  // 4. 片手武器自動切替システム（魔道士系＝杖 / 戦士系＝片手剣）＆ゴールド転職
  isMageEvolution(evoIdOverride = null) {
    const d = this.saveData || {};
    const candidates = [
      evoIdOverride,
      d.evolutionId, d.evolution, d.evoId, d.evo,
      d.jobId, d.job, d.classId, d.class, d.role,
      this.player?.evolutionId, this.player?.job
    ].filter(v => v !== null && v !== undefined && v !== '');

    const primaryId = String(candidates[0] || '');
    const extraMatch = EXTRA_ROLES_V40.find(r => r.id === primaryId);
    if (extraMatch) return extraMatch.weaponType === 'staff';

    let evoName = '';
    if (typeof EVOLUTIONS !== 'undefined' && EVOLUTIONS && primaryId) {
      if (Array.isArray(EVOLUTIONS)) {
        const found = EVOLUTIONS.find(e => e && (String(e.id) === primaryId || String(e.name) === primaryId));
        if (found) evoName = String(found.name || found.title || '');
      } else if (EVOLUTIONS[primaryId]) {
        evoName = String(EVOLUTIONS[primaryId].name || EVOLUTIONS[primaryId].title || '');
      }
    }
    const combined = `${candidates.join(' ')} ${evoName}`.toLowerCase();
    return /mage|wizard|sorcerer|witch|sage|warlock|archmage|spell|magic|caster|priest|cleric|bishop|魔道|魔導|魔法|賢者|術師|メイジ|ウィザード|ソーサラー|ウィッチ|司祭|神官/.test(combined);
  },

  buildMageStaff3D(weaponId = 'wpn_wood', enhance = 0) {
    const grp = new THREE.Group();
    grp.name = 'mage_staff_weapon';
    grp.userData.isCustomStaffV27 = true;

    const wStr = String(weaponId || '').toLowerCase();
    const enh = Number(enhance) || 0;
    let tier = 1;
    if (/god|genesis|creator|omega|legend|divine|神|創世|伝説/.test(wStr) || enh >= 15) tier = 5;
    else if (/dragon|hell|abyss|demon|star|竜|魔|星|覇/.test(wStr) || enh >= 10) tier = 4;
    else if (/mythril|mithril|gold|holy|crystal|ミスリル|金|聖|晶/.test(wStr) || enh >= 6) tier = 3;
    else if (/iron|steel|silver|copper|鉄|鋼|銀|銅/.test(wStr) || enh >= 3) tier = 2;

    const configs = {
      1: { shaftCol: 0x78350f, headCol: 0x92400e, orbCol: 0x38bdf8, ringCol: null, len: 1.55, orbR: 0.14 },
      2: { shaftCol: 0x94a3b8, headCol: 0xe2e8f0, orbCol: 0x34d399, ringCol: 0x6ee7b7, len: 1.70, orbR: 0.17 },
      3: { shaftCol: 0xfbbf24, headCol: 0xfef08a, orbCol: 0x60a5fa, ringCol: 0x38bdf8, len: 1.85, orbR: 0.20 },
      4: { shaftCol: 0x31102f, headCol: 0xf43f5e, orbCol: 0xf97316, ringCol: 0xfde047, len: 2.00, orbR: 0.23 },
      5: { shaftCol: 0xfef08a, headCol: 0xf59e0b, orbCol: 0xf472b6, ringCol: 0x38bdf8, len: 2.18, orbR: 0.26 }
    };
    const cfg = configs[tier];

    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.055, cfg.len, 10),
      new THREE.MeshLambertMaterial({ color: cfg.shaftCol })
    );
    shaft.position.y = cfg.len * 0.42;
    grp.add(shaft);

    const topY = cfg.len * 0.88;
    if (tier === 1) {
      const forkL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.22, 0.05), new THREE.MeshLambertMaterial({ color: cfg.headCol }));
      forkL.position.set(-0.08, topY, 0); forkL.rotation.z = 0.4;
      const forkR = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.22, 0.05), new THREE.MeshLambertMaterial({ color: cfg.headCol }));
      forkR.position.set(0.08, topY, 0); forkR.rotation.z = -0.4;
      grp.add(forkL, forkR);
    } else if (tier === 2) {
      const crescent = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.04, 8, 18, Math.PI * 1.3), new THREE.MeshBasicMaterial({ color: cfg.headCol }));
      crescent.position.y = topY + 0.08;
      crescent.rotation.z = -Math.PI * 0.15;
      grp.add(crescent);
    } else {
      [-1, 1].forEach(side => {
        const wing = new THREE.Mesh(new THREE.ConeGeometry(0.11 + tier * 0.02, 0.42 + tier * 0.06, 5), new THREE.MeshBasicMaterial({ color: cfg.headCol }));
        wing.position.set(side * (0.22 + tier * 0.03), topY + 0.08, 0);
        wing.rotation.z = -side * 1.05;
        grp.add(wing);
      });
    }

    const orbGeo = tier >= 3 ? new THREE.OctahedronGeometry(cfg.orbR, 0) : new THREE.SphereGeometry(cfg.orbR, 12, 12);
    const orb = new THREE.Mesh(orbGeo, new THREE.MeshBasicMaterial({ color: cfg.orbCol }));
    orb.position.y = topY + 0.16;
    grp.add(orb);

    if (cfg.ringCol) {
      const halo = new THREE.Mesh(new THREE.TorusGeometry(cfg.orbR * 1.65, 0.028, 8, 22), new THREE.MeshBasicMaterial({ color: cfg.ringCol }));
      halo.position.y = topY + 0.16;
      halo.rotation.x = Math.PI * 0.32;
      grp.add(halo);
    }
    if (tier >= 5) {
      [-1, 1].forEach(s => {
        const sat = new THREE.Mesh(new THREE.OctahedronGeometry(0.08, 0), new THREE.MeshBasicMaterial({ color: 0xfde047 }));
        sat.position.set(s * 0.36, topY + 0.16, 0);
        grp.add(sat);
      });
    }
    grp.rotation.x = 0.35;
    return grp;
  },

  buildOneHandedSword3D(weaponId = 'wpn_wood', enhance = 0) {
    const grp = new THREE.Group();
    grp.name = 'knight_sword_weapon';
    grp.userData.isCustomSwordV40 = true;

    const wStr = String(weaponId || '').toLowerCase();
    const enh = Number(enhance) || 0;
    let tier = 1;
    if (/god|genesis|creator|omega|legend|divine|神|創世|伝説/.test(wStr) || enh >= 15) tier = 5;
    else if (/dragon|hell|abyss|demon|star|竜|魔|星|覇/.test(wStr) || enh >= 10) tier = 4;
    else if (/mythril|mithril|gold|holy|crystal|ミスリル|金|聖|晶/.test(wStr) || enh >= 6) tier = 3;
    else if (/iron|steel|silver|copper|鉄|鋼|銀|銅/.test(wStr) || enh >= 3) tier = 2;

    const cfgs = {
      1: { blade: 0x92400e, edge: 0xb45309, guard: 0x451a03, len: 1.05, glow: null },
      2: { blade: 0xcbd5e1, edge: 0xf8fafc, guard: 0x475569, len: 1.20, glow: null },
      3: { blade: 0x38bdf8, edge: 0xe0f2fe, guard: 0xfacc15, len: 1.32, glow: 0x7dd3fc },
      4: { blade: 0xf43f5e, edge: 0xfef08a, guard: 0x1e1b4b, len: 1.44, glow: 0xf97316 },
      5: { blade: 0xfef08a, edge: 0xffffff, guard: 0xf59e0b, len: 1.56, glow: 0x38bdf8 }
    };
    const cfg = cfgs[tier];

    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.28, 8), new THREE.MeshLambertMaterial({ color: 0x1e293b }));
    grip.position.y = 0.06;
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.07, 0.11), new THREE.MeshLambertMaterial({ color: cfg.guard }));
    guard.position.y = 0.22;
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, cfg.len, 0.035),
      tier >= 3 ? new THREE.MeshBasicMaterial({ color: cfg.blade }) : new THREE.MeshLambertMaterial({ color: cfg.blade })
    );
    blade.position.y = 0.24 + cfg.len * 0.5;
    const tip = new THREE.Mesh(
      new THREE.ConeGeometry(0.08, 0.22, 4),
      tier >= 3 ? new THREE.MeshBasicMaterial({ color: cfg.edge }) : new THREE.MeshLambertMaterial({ color: cfg.edge })
    );
    tip.position.y = 0.24 + cfg.len + 0.11;
    tip.rotation.y = Math.PI * 0.25;
    grp.add(grip, guard, blade, tip);

    if (cfg.glow) {
      const aura = new THREE.Mesh(
        new THREE.BoxGeometry(0.17, cfg.len + 0.14, 0.06),
        new THREE.MeshBasicMaterial({ color: cfg.glow, transparent: true, opacity: 0.34 })
      );
      aura.position.y = 0.24 + cfg.len * 0.5;
      grp.add(aura);
    }
    grp.rotation.x = 0.52;
    return grp;
  },

  enforceStrictWeaponVisualV27(entity, evoIdOverride = null) {
    if (!entity || !entity.group || typeof THREE === 'undefined') return;
    const grp = entity.group;
    const isMage = (entity === this.player)
      ? this.isMageEvolution(evoIdOverride)
      : this.isMageEvolution(evoIdOverride || entity.evolutionId);

    const wId = this.saveData?.equippedWeapon || this.saveData?.weaponId || 'wpn_wood';
    const wEnh = this.saveData?.weaponEnhance || 0;
    const sig = `${isMage ? 'staff' : 'sword'}|${wId}|${wEnh}`;

    const removeForeignWeapons = (keepFlag) => {
      const toRemove = [];
      grp.traverse(c => {
        if (c === grp) return;
        let p = c;
        while (p) {
          if (p.userData?.[keepFlag]) return;
          p = p.parent;
        }
        const nm = String(c.name || '').toLowerCase();
        if (/wpn|weapon|sword|blade|hilt|guard|katana|axe|spear|staff/.test(nm) || c === entity.weaponMesh) {
          toRemove.push(c);
          return;
        }
        if (c.isMesh && !c.material?.map && c.position.x >= 0.38 && c.position.x <= 1.25) {
          c.geometry?.computeBoundingBox?.();
          const bb = c.geometry?.boundingBox;
          const h = bb ? (bb.max.y - bb.min.y) * (c.scale.y || 1) : 0;
          const w = bb ? (bb.max.x - bb.min.x) * (c.scale.x || 1) : 0;
          if (h > 0.45 || w > 0.32 || c.parent !== grp) toRemove.push(c);
        }
      });
      toRemove.forEach(obj => {
        obj.visible = false;
        obj.parent?.remove(obj);
      });
    };

    if (isMage) {
      removeForeignWeapons('isCustomStaffV27');
      let staff = grp.getObjectByName?.('mage_staff_weapon');
      if (!staff || staff.userData.wpnSig !== sig) {
        if (staff) grp.remove(staff);
        staff = this.buildMageStaff3D(wId, wEnh);
        staff.userData.wpnSig = sig;
        staff.position.set(0.64, 0.42, 0.22);
        grp.add(staff);
      }
      staff.visible = true;
      entity.weaponMesh = staff;
    } else {
      removeForeignWeapons('isCustomSwordV40');
      let sword = grp.getObjectByName?.('knight_sword_weapon');
      if (!sword || sword.userData.wpnSig !== sig) {
        if (sword) grp.remove(sword);
        sword = this.buildOneHandedSword3D(wId, wEnh);
        sword.userData.wpnSig = sig;
        sword.position.set(0.64, 0.56, 0.24);
        grp.add(sword);
      }
      sword.visible = true;
      entity.weaponMesh = sword;
    }
  },

  syncMageWeaponNamesV22() {
    const isMage = this.isMageEvolution();
    if (typeof WEAPONS !== 'undefined' && WEAPONS) {
      const wList = Array.isArray(WEAPONS) ? WEAPONS : Object.values(WEAPONS);
      wList.forEach(w => {
        if (!w || typeof w !== 'object') return;
        if (!w._origNameV22 && w.name) w._origNameV22 = String(w.name);
        if (!w._origDescV22 && w.desc) w._origDescV22 = String(w.desc);
        if (w._origNameV22) {
          w.name = isMage ? convertWeaponNameToStaff(w._origNameV22) : convertWeaponNameToSword(w._origNameV22);
        }
        if (w._origDescV22) {
          w.desc = isMage
            ? w._origDescV22.replace(/片手剣|剣|刀|ソード|ブレード/g, '魔導杖')
            : w._origDescV22.replace(/魔導杖|魔法杖|スタッフ|ロッド|杖/g, '片手剣');
        }
      });
    }
  },

  // 5. 杖の通常攻撃魔法弾＆敵命中瞬間の魔法攻撃ダメージ判定
  calcMagicAttackPowerV40() {
    const st = this.getPlayerStats ? (this.getPlayerStats() || {}) : {};
    const d = this.saveData || {};
    const rawMatk = Number(st.matk ?? st.mAtk ?? st.magicAtk ?? st.mag ?? st.int ?? d.matk ?? d.mAtk ?? 0);
    const rawAtk = Number(st.atk ?? d.atk ?? 15);
    const lv = Math.max(1, Number(d.lv ?? this.player?.lv ?? 1));
    const baseMagic = rawMatk > 0 ? rawMatk : Math.floor(rawAtk * 1.18 + lv * 3.5);
    return Math.max(5, Math.floor(baseMagic));
  },

  applyMagicProjectileHitDamageV40(m, dmgAmount) {
    if (!m || m.dead) return;
    const mDef = Math.max(0, Number(m.mdef ?? m.magicDef ?? (m.def ? m.def * 0.65 : 0)));
    const isCrit = Math.random() < 0.18;
    const rawDmg = Math.max(1, Math.floor(dmgAmount - mDef * 0.45));
    const finalDmg = isCrit ? Math.floor(rawDmg * 1.5) : rawDmg;

    if (typeof this.damageMonster === 'function') {
      this.damageMonster(m, finalDmg, isCrit, 'magic');
      return;
    }
    if (typeof this.applyDamageToMonster === 'function') {
      this.applyDamageToMonster(m, finalDmg, isCrit);
      return;
    }

    m.hp = Math.max(0, (Number(m.hp) || 0) - finalDmg);
    m.hitFlashTimer = 0.16;
    if (this.spawnFloatingText && m.pos) {
      this.spawnFloatingText(m.pos, isCrit ? `✨${finalDmg}!` : `✨${finalDmg}`, isCrit ? '#fde047' : '#38bdf8');
    }
    sfx?.playTone?.(isCrit ? 880 : 620, 'triangle', 0.08, 0.08);

    if (m.hp <= 0 && !m.dead) {
      if (typeof this.killMonster === 'function') {
        this.killMonster(m);
      } else if (typeof this.onMonsterKilled === 'function') {
        m.dead = true;
        this.onMonsterKilled(m);
      } else {
        m.dead = true;
        if (m.group && this.scene) this.scene.remove(m.group);
        if (m.mesh && this.scene) this.scene.remove(m.mesh);
        if (m.plateEl) m.plateEl.remove();
        const d = this.saveData;
        if (d) {
          const expGain = Math.max(5, Number(m.exp || m.expReward || 12));
          const goldGain = Math.max(3, Number(m.gold || m.goldReward || 8));
          d.exp = (Number(d.exp) || 0) + expGain;
          d.gold = (Number(d.gold) || 0) + goldGain;
          if (typeof this.checkLevelUp === 'function') this.checkLevelUp();
        }
      }
      this.refreshAllHUD?.();
    }
  },

  spawnMageBasicMagicShot(entity, isLocal = false) {
    if (!this.useWebGL || !this.scene || !entity?.pos || typeof THREE === 'undefined') return;
    if (!this._v22MagicShots) this._v22MagicShots = [];

    const rotY = entity.rotY || 0;
    const dirX = Math.sin(rotY);
    const dirZ = Math.cos(rotY);

    const grp = new THREE.Group();
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.30, 14, 14), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    const auraMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.78 });
    const aura = new THREE.Mesh(new THREE.OctahedronGeometry(0.48, 0), auraMat);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xf472b6, side: THREE.DoubleSide, transparent: true, opacity: 0.92 });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.50, 0.055, 8, 22), ringMat);
    grp.add(core, aura, ring);

    grp.position.set(entity.pos.x + dirX * 1.1, 1.25, entity.pos.z + dirZ * 1.1);
    grp.rotation.y = rotY;
    this.scene.add(grp);

    const magicDmg = isLocal ? this.calcMagicAttackPowerV40() : 0;
    this._v22MagicShots.push({
      grp, aura, ring, auraMat, ringMat,
      vx: dirX * 21.0, vz: dirZ * 21.0,
      life: 0.56, maxLife: 0.56,
      isLocal, magicDmg, hitDone: false
    });
  },

  updateMageBasicMagicShots(dt) {
    if (!this._v22MagicShots || !this._v22MagicShots.length) return;
    const spawnBurst = (pos) => {
      if (!this.scene || !this._slashEffects) return;
      const hitMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.95 });
      const hitRing = new THREE.Mesh(new THREE.RingGeometry(0.25, 1.15, 22), hitMat);
      hitRing.rotation.x = -Math.PI / 2;
      hitRing.position.set(pos.x, 0.25, pos.z);
      this.scene.add(hitRing);
      this._slashEffects.push({ kind: 'shockwave', mesh: hitRing, mat: hitMat, life: 0.30, maxLife: 0.30 });
    };

    this._v22MagicShots = this._v22MagicShots.filter(s => {
      s.life -= dt;
      s.grp.position.x += s.vx * dt;
      s.grp.position.z += s.vz * dt;
      s.aura.rotation.y += dt * 10;
      s.aura.rotation.x += dt * 8;
      s.ring.rotation.z += dt * 12;

      // 魔法弾が敵に当たった瞬間に魔法攻撃力でダメージ判定
      if (s.isLocal && !s.hitDone && Array.isArray(this.monsters)) {
        let hitTarget = null;
        let bestDist = Infinity;
        for (const m of this.monsters) {
          if (!m || m.dead || !m.pos) continue;
          const sc = Number(m.scale) || 1.0;
          const hitRadius = 1.15 + sc * 0.48;
          const d = Math.hypot(m.pos.x - s.grp.position.x, m.pos.z - s.grp.position.z);
          if (d <= hitRadius && d < bestDist) {
            bestDist = d;
            hitTarget = m;
          }
        }
        if (hitTarget) {
          s.hitDone = true;
          this.applyMagicProjectileHitDamageV40(hitTarget, s.magicDmg);
          spawnBurst(s.grp.position);
          this.scene?.remove(s.grp);
          s.grp.traverse?.(o => { o.geometry?.dispose?.(); o.material?.dispose?.(); });
          return false;
        }
      }

      if (s.life <= 0) {
        spawnBurst(s.grp.position);
        this.scene?.remove(s.grp);
        s.grp.traverse?.(o => { o.geometry?.dispose?.(); o.material?.dispose?.(); });
        return false;
      }

      const fade = s.life < 0.14 ? (s.life / 0.14) : 1.0;
      s.auraMat.opacity = 0.78 * fade;
      s.ringMat.opacity = 0.92 * fade;
      return true;
    });
  },

  // 6. 役職カタログ統合・ゴールド転職システム・転生ボタン非表示
  getAllAvailableRolesV26() {
    const roles = [];
    const seen = new Set();
    const addRole = (id, label, icon, cost = 0, desc = '', wpnType = 'sword', mults = null) => {
      const key = String(id ?? '');
      if (seen.has(key)) return;
      seen.add(key);
      const isM = wpnType === 'staff' || /mage|wizard|sorcerer|witch|sage|caster|priest|cleric|bishop|魔道|魔導|魔法|賢者|術師|メイジ|ウィザード|司祭|神官/.test(`${key} ${label}`.toLowerCase());
      roles.push({
        id: key,
        label: String(label || key || '見習い冒険者'),
        icon: icon || (isM ? '🪄' : '🗡️'),
        weaponType: isM ? 'staff' : 'sword',
        cost: Number(cost) || 0,
        desc: desc || (isM ? '武器が杖になり通常攻撃が魔法攻撃になる！' : '片手剣を装備して戦う近接アタッカー！'),
        atkMult: mults?.atkMult ?? 1.0,
        matkMult: mults?.matkMult ?? 1.0,
        defMult: mults?.defMult ?? 1.0,
        hpMult: mults?.hpMult ?? 1.0
      });
    };

    EXTRA_ROLES_V40.forEach(r => addRole(r.id, r.name, r.icon, r.cost, r.desc, r.weaponType, r));

    if (typeof EVOLUTIONS !== 'undefined' && EVOLUTIONS) {
      const entries = Array.isArray(EVOLUTIONS) ? EVOLUTIONS.map((v, i) => [v?.id ?? String(i), v]) : Object.entries(EVOLUTIONS);
      entries.forEach(([k, v], idx) => {
        if (!v) return;
        const rId = String(v.id ?? k);
        const rName = String(v.name || v.title || rId);
        const autoCost = Number(v.goldCost ?? v.cost ?? (idx === 0 ? 0 : idx * 1200));
        addRole(rId, rName, v.icon, autoCost, v.desc || v.description || '', '', v);
      });
    }
    return roles;
  },

  changePlayerRoleGoldV40(roleId) {
    const d = this.saveData;
    if (!d) return;
    const roles = this.getAllAvailableRolesV26();
    const role = roles.find(r => r.id === String(roleId ?? ''));
    if (!role) return;

    const curId = String(d.evolutionId ?? d.jobId ?? '');
    if (curId === role.id) {
      this.showAlertBanner?.(`🎭 すでに「${role.label}」に就いています`, 1400);
      return;
    }

    if (!Array.isArray(d.unlockedRolesV40)) d.unlockedRolesV40 = [''];
    const isUnlocked = role.cost <= 0 || d.unlockedRolesV40.includes(role.id) || this._debugInfiniteMode;
    const coinKey = ('gold' in d) ? 'gold' : (('coins' in d) ? 'coins' : (('money' in d) ? 'money' : 'gold'));
    const curGold = Number(d[coinKey]) || 0;

    if (!isUnlocked) {
      if (curGold < role.cost) {
        this.showAlertBanner?.(`💰 ゴールド不足！（必要: ${role.cost.toLocaleString()}G / 所持: ${curGold.toLocaleString()}G）`, 1800);
        return;
      }
      d[coinKey] = curGold - role.cost;
      d.unlockedRolesV40.push(role.id);
      sfx?.playHeal?.();
    } else {
      sfx?.playTone?.(740, 'sine', 0.12, 0.08);
    }

    ['evolutionId', 'evolution', 'evoId', 'evo', 'jobId', 'job', 'classId', 'class', 'role'].forEach(k => { d[k] = role.id; });
    if (this.player) this.player.evolutionId = this.player.job = this.player.classId = role.id;

    this.syncMageWeaponNamesV22();
    this.buildPlayerEntity?.();
    if (this.player) this.enforceStrictWeaponVisualV27(this.player, role.id);
    this.saveGame?.(false);
    this.forceSyncVisualLevelsV24?.();

    const wpnMsg = role.weaponType === 'staff' ? '🪄 武器が杖に切替（通常攻撃が魔法弾化）' : '🗡️ 武器が片手剣に切替';
    this.showAlertBanner?.(`🎭 「${role.label}」へ転職しました！ ${wpnMsg}`, 2200);
  },

  changePlayerRoleDebug(roleId, roleLabel = '') {
    const d = this.saveData || {};
    const targetId = String(roleId ?? '');
    if (!Array.isArray(d.unlockedRolesV40)) d.unlockedRolesV40 = [''];
    if (!d.unlockedRolesV40.includes(targetId)) d.unlockedRolesV40.push(targetId);
    ['evolutionId', 'evolution', 'evoId', 'evo', 'jobId', 'job', 'classId', 'class', 'role'].forEach(k => { d[k] = targetId; });
    if (this.player) this.player.evolutionId = this.player.job = this.player.classId = targetId;
    this.syncMageWeaponNamesV22();
    this.buildPlayerEntity?.();
    if (this.player) this.enforceStrictWeaponVisualV27(this.player, targetId);
    this.saveGame?.(false);
    this.forceSyncVisualLevelsV24?.();
    const wpnNote = this.isMageEvolution(targetId) ? '（武器：杖・通常攻撃が魔法化）' : '（武器：片手剣）';
    this.showAlertBanner?.(`🎭 [DEBUG] 役職を「${roleLabel || targetId || '見習い冒険者'}」に変更！${wpnNote}`, 2200);
  },

  purgeRebirthUIV27() {
    document.querySelectorAll('button').forEach(el => {
      if (el.closest?.('#kmj-secret-debug-modal')) return;
      if (el.hasAttribute('data-tab') || el.classList.contains('tab-btn')) return;
      const txt = (el.textContent || '').trim();
      if (/進化|役職|職業|転職/.test(txt)) return;
      if (/^(転生する|転生実行|転生を行う)$/.test(txt)) el.style.display = 'none';
    });
  }
});

['doRebirth', 'rebirth', 'reincarnate', 'performRebirth', 'confirmRebirth', 'openRebirthModal'].forEach(fn => {
  if (typeof KaomojiMMORPG.prototype[fn] === 'function') KaomojiMMORPG.prototype[fn] = function () { return false; };
});
// ▲▲▲ ここまで【2/4】 ▲▲▲
// ▼▼▼ ここから【3/4】 ▼▼▼
Object.assign(KaomojiMMORPG.prototype, {
  // 1. スキル現在Lv・消費MP計算（基本MP × 5 ＋ (スキルLv - 1) × 10）・スロットUI同期
  getExactSkillLevelV26(sId, slotIdx = -1, skObj = null) {
    const d = this.saveData || {};
    const candidates = [
      d.skillLevels?.[sId], d.skillLvs?.[sId],
      slotIdx >= 0 ? d.skillLevels?.[`slot_${slotIdx}`] : undefined,
      slotIdx >= 0 ? d.skillLvs?.[`slot_${slotIdx}`] : undefined,
      typeof d.skills?.[sId] === 'number' ? d.skills[sId] : d.skills?.[sId]?.lv,
      skObj?.lv, skObj?.level
    ].map(v => Number(v)).filter(v => !isNaN(v) && v >= 1);
    return Math.min(MAX_LEVEL_CAP_V27, candidates.length ? Math.max(...candidates) : 1);
  },

  calcScaledSkillMp(baseMp, lv = 1) {
    const b = Math.max(1, Number(baseMp) || 5);
    const level = Math.min(MAX_LEVEL_CAP_V27, Math.max(1, Number(lv) || 1));
    return (b * 5) + ((level - 1) * 10);
  },

  syncSkillMpCostsV22() {
    if (typeof SKILLS === 'undefined' || !SKILLS) return;
    const list = Array.isArray(SKILLS) ? SKILLS : Object.values(SKILLS);
    list.forEach((sk, idx) => {
      if (!sk || typeof sk !== 'object') return;
      const mpKeys = ['mpCost', 'mp', 'cost', 'manaCost', 'consumeMp'].filter(k => typeof sk[k] === 'number');
      if (!mpKeys.length) return;
      if (sk._baseMpV22 === undefined) sk._baseMpV22 = Math.max(1, Number(sk[mpKeys[0]]) || 5);
      const sId = String(sk.id || sk.skillId || `slot_${idx}`);
      const lv = this.getExactSkillLevelV26(sId, idx, sk);
      const scaledMp = this.calcScaledSkillMp(sk._baseMpV22, lv);
      mpKeys.forEach(k => { sk[k] = scaledMp; });
    });
    this.syncSkillSlotButtonsUI();
  },

  syncSkillSlotButtonsUI() {
    const slotBtns = document.querySelectorAll('[id^="skill-btn-"], [id^="skill-slot-"], .skill-slot-btn, .skill-btn, [data-skill-slot]');
    slotBtns.forEach((btn, i) => {
      const slotAttr = btn.getAttribute('data-skill-slot') ?? btn.id?.replace(/\D+/g, '');
      const slotIdx = slotAttr !== '' && !isNaN(Number(slotAttr)) ? Number(slotAttr) : i;
      const meta = this.resolveSkillMeta ? this.resolveSkillMeta(slotIdx) : null;
      if (!meta) return;

      const lv = meta.skillLv || 1;
      let badge = btn.querySelector('.v26-skill-lv-badge');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'v26-skill-lv-badge';
        badge.style.cssText = 'display:block;font-size:8px;font-weight:900;color:#fde047;line-height:1.05;margin-top:1px;text-shadow:0 1px 2px #000;pointer-events:none;';
        btn.appendChild(badge);
      }

      let curMp = '';
      if (typeof SKILLS !== 'undefined' && SKILLS) {
        const list = Array.isArray(SKILLS) ? SKILLS : Object.values(SKILLS);
        const skObj = list.find(s => s && (s.id === meta.skillId || s.skillId === meta.skillId)) || list[slotIdx];
        if (skObj) {
          const mpVal = skObj.mpCost ?? skObj.mp ?? skObj.cost ?? skObj.manaCost ?? skObj.consumeMp;
          if (typeof mpVal === 'number') curMp = ` MP${mpVal}`;
        }
      }
      const rankTag = lv >= 100 ? '👑' : (lv >= 50 ? '🔥' : (lv >= 10 ? '✨' : ''));
      badge.textContent = `${rankTag}Lv.${lv}${curMp}`;
    });
  },

  // 2. 実績コンプリート＆常時パッシブバフシステム
  getAchievementsSummaryV40() {
    const d = this.saveData || {};
    const rawList = (typeof ACHIEVEMENTS !== 'undefined' && ACHIEVEMENTS)
      ? (Array.isArray(ACHIEVEMENTS) ? ACHIEVEMENTS : Object.entries(ACHIEVEMENTS).map(([k, v]) => ({ id: k, ...(typeof v === 'object' ? v : { name: String(v) }) })))
      : [];

    const unlockedSet = new Set();
    [d.achievements, d.unlockedAchievements, d.completedAchievements, d.claimedAchievements, d.achUnlocked].forEach(src => {
      if (!src) return;
      if (Array.isArray(src)) {
        src.forEach(item => {
          if (typeof item === 'string') unlockedSet.add(item);
          else if (item && typeof item === 'object' && (item.unlocked || item.completed || item.claimed || item.done)) {
            unlockedSet.add(String(item.id || item.achId || ''));
          }
        });
      } else if (typeof src === 'object') {
        Object.entries(src).forEach(([k, v]) => {
          if (v === true || (typeof v === 'object' && v && (v.unlocked || v.completed || v.claimed || v.done))) {
            unlockedSet.add(String(k));
          }
        });
      }
    });

    const items = rawList.map((ach, idx) => {
      const id = String(ach.id || ach.achId || `ach_${idx}`);
      const name = String(ach.name || ach.title || `実績 #${idx + 1}`);
      const desc = String(ach.desc || ach.description || '冒険の条件を達成する');
      const isDone = Boolean(ach.unlocked || ach.completed || ach.done || unlockedSet.has(id) || unlockedSet.has(name));
      return { id, name, desc, isDone };
    });

    const total = items.length;
    const unlockedCount = items.filter(x => x.isDone).length;
    const isComplete = total > 0 && unlockedCount >= total;

    // 達成1個ごとに ATK/MATK/DEF +2%, HP +2.5%, EXP/GOLD +3% ＋ 全達成コンプリートで覇者ボーナス追加！
    const statBonusPct = (unlockedCount * 0.02) + (isComplete ? 0.35 : 0);
    const hpBonusPct = (unlockedCount * 0.025) + (isComplete ? 0.40 : 0);
    const rewardBonusPct = (unlockedCount * 0.03) + (isComplete ? 0.50 : 0);

    return {
      items,
      total,
      unlockedCount,
      isComplete,
      statBonusPct,
      hpBonusPct,
      rewardBonusPct
    };
  },

  syncAchievementPassiveBuffsV40() {
    const sum = this.getAchievementsSummaryV40();
    this._achPassiveSummaryV40 = sum;
    if (sum.isComplete && this.saveData && !this.saveData._achCompleteNotifiedV40) {
      this.saveData._achCompleteNotifiedV40 = true;
      sfx?.playHeal?.();
      this.pushSystemEventLog?.('👑【全実績コンプリート達成！】常時パッシブ「創世神話の覇者（全ステ+35%・報酬+50%）」が永続発動！', 3200);
    }
    return sum;
  },

  // 3. スキル説明同期・システムログ・ローディング演出
  syncSkillDescriptionsAndEffects() {
    if (typeof SKILLS === 'undefined' || !SKILLS) return;
    const list = Array.isArray(SKILLS) ? SKILLS : Object.values(SKILLS);
    list.forEach(sk => {
      if (!sk || typeof sk !== 'object') return;
      const key = `${sk.id || ''} ${sk.name || ''}`.toLowerCase();
      if (/aurora|sanctuary|polar|極光|聖域|オーロラ/.test(key)) {
        sk.type = 'buff';
        sk.target = 'self';
        const newDesc = '【フィールド展開】8秒間、極光の聖域を展開し範囲内の自分と味方のHPを毎秒回復＋ATK/DEF/SPD強化！(Lv10/50/100で超進化)';
        if ('desc' in sk) sk.desc = newDesc;
        if ('description' in sk) sk.description = newDesc;
      } else if (/bigbang|big_bang|genesis|cosmos|creation|supernova|ビッグバン|びっくばん|そうせい|創世|創星|創生/.test(key)) {
        const newDesc = '【創世超爆発】宇宙のビッグバンを引き起こし広範囲の敵に絶大なダメージ！(Lv10/50/100で神話級エフェクトへ進化)';
        if ('desc' in sk) sk.desc = newDesc;
        if ('description' in sk) sk.description = newDesc;
      } else {
        const cur = sk.desc || sk.description || '';
        if (cur && !cur.includes('Lv.10')) {
          const updated = `${cur} (Lv.10/50/100で魔法陣＆オーブ超進化)`;
          if ('desc' in sk) sk.desc = updated;
          if ('description' in sk) sk.description = updated;
        }
      }
    });
  },

  pushSystemEventLog(text, bannerMs = 2200) {
    if (!text) return;
    const channel = this.saveData?.roomPassEnabled ? 'room' : 'global';
    if (this.addChatMessage) this.addChatMessage(channel, '📢', 'SYSTEM', text, false);
    if (bannerMs > 0 && this.showAlertBanner) this.showAlertBanner(text, bannerMs);
  },

  showLoadingOverlay(titleText = 'NOW LOADING...', durationMs = 950) {
    let el = document.getElementById('kmj-loading-screen');
    if (!el) {
      el = document.createElement('div');
      el.id = 'kmj-loading-screen';
      el.innerHTML = `
        <div id="kmj-load-kao" class="kmj-load-kao font-kaomoji">(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧</div>
        <div id="kmj-load-title" style="font-size:16px;font-weight:900;color:#fde047;letter-spacing:1px;">NOW LOADING...</div>
        <div class="kmj-load-bar-bg"><div id="kmj-load-fill" class="kmj-load-bar-fill"></div></div>
        <div id="kmj-load-tip" style="font-size:11px;color:#cbd5e1;text-align:center;max-width:320px;line-height:1.45;"></div>
      `;
      document.body.appendChild(el);
    }
    el.classList.remove('hidden', 'fade-out');
    const kaoEl = document.getElementById('kmj-load-kao');
    const titleEl = document.getElementById('kmj-load-title');
    const fillEl = document.getElementById('kmj-load-fill');
    const tipEl = document.getElementById('kmj-load-tip');
    if (kaoEl) kaoEl.textContent = LOADING_KAOMOJIS[Math.floor(Math.random() * LOADING_KAOMOJIS.length)];
    if (titleEl) titleEl.textContent = titleText;
    if (tipEl) tipEl.textContent = LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)];
    if (fillEl) {
      fillEl.style.width = '18%';
      setTimeout(() => { if (fillEl) fillEl.style.width = '68%'; }, Math.floor(durationMs * 0.3));
      setTimeout(() => { if (fillEl) fillEl.style.width = '100%'; }, Math.floor(durationMs * 0.75));
    }
    clearTimeout(this._loadHideTimer);
    this._loadHideTimer = setTimeout(() => {
      el.classList.add('fade-out');
      setTimeout(() => el.classList.add('hidden'), 280);
    }, durationMs);
  },

  // 4. 頭上吹き出し＆12種類の同期エモート演出
  spawnHeadBubble(isSelf, uid, kaomoji, text, isEmote = false) {
    if (!this.overlayLayer) return;
    const cleanText = String(text || '').trim();
    if (!cleanText && !isEmote) return;
    if (!this._headBubbles) this._headBubbles = [];
    const key = isSelf ? 'SELF' : String(uid);
    this._headBubbles = this._headBubbles.filter(b => {
      if (b.key === key) { b.el.remove(); return false; }
      return true;
    });
    const el = document.createElement('div');
    el.className = 'world-head-bubble' + (isEmote ? ' is-emote' : '');
    const safeText = cleanText.replace(/[<>&"]/g, '');
    const safeKao = String(kaomoji || '').replace(/[<>&"]/g, '');
    if (isEmote) {
      el.innerHTML = `<div class="font-kaomoji" style="font-size:15px;font-weight:900;color:#f472b6;">${safeKao}</div><div style="font-size:10px;font-weight:900;color:#fff;margin-top:1px;">${safeText}</div>`;
    } else {
      el.innerHTML = `<div style="font-size:11px;font-weight:900;color:#fff;">💬 ${safeText}</div>`;
    }
    this.overlayLayer.appendChild(el);
    this._headBubbles.push({ key, isSelf, uid, el, life: 4.5 });
  },

  classifyEmoteItem(itemEl, emoteIdx) {
    let kao = itemEl?.dataset?.kaomoji || '';
    let label = itemEl?.dataset?.msg || itemEl?.dataset?.label || '';
    if (!kao || !label) {
      const leaves = [...(itemEl?.querySelectorAll('*') || [])].filter(el => el.children.length === 0 && el.textContent.trim());
      if (leaves.length >= 2) {
        if (!kao) kao = leaves[0].textContent.trim();
        if (!label) label = leaves[1].textContent.trim();
      } else {
        const raw = (itemEl?.textContent || '').trim();
        const parts = raw.split(/\s+/);
        if (parts.length >= 2) {
          if (!kao) kao = parts[0];
          if (!label) label = parts.slice(1).join(' ');
        } else {
          if (!kao) kao = raw || '(≧▽≦)';
          if (!label) label = raw || 'やっほー！';
        }
      }
    }
    const combined = `${kao} ${label}`;
    let motionType = '';
    if (/ちゃぶ|卓|返|┻|┬|怒|ﾑｶ|ぷん|憤|💢|😡/.test(combined)) motionType = 'chabudai_rage';
    else if (/土下座|ごめん|謝|許し|orz/.test(combined)) motionType = 'dogeza';
    else if (/気絶|倒|疲|ガーン|昇天|死亡|バタン/.test(combined)) motionType = 'ghost_faint';
    else if (/眠|zzz|おやすみ|ふぅ|😪|寝/.test(combined)) motionType = 'sleep_bubble';
    else if (/泣|悲|えん|ショボ|涙|ToT|T_T|；；|😭/.test(combined)) motionType = 'cry_fountain';
    else if (/愛|好|ﾊｰﾄ|ハート|照|ｷｭﾝ|キュン|♡|❤|💕/.test(combined)) motionType = 'heart_float';
    else if (/踊|ﾀﾞﾝｽ|ダンス|♪|♫|クル|回|ｽﾋﾟﾝ|スピン/.test(combined)) motionType = 'tornado_dance';
    else if (/やった|勝|バンザイ|万歳|歓喜|最高|🎉|✨|✧/.test(combined)) motionType = 'backflip';
    else if (/敬礼|任せ|キメ|応援|ファイト|💪|🔥/.test(combined)) motionType = 'salute_hero';
    else if (/ダッシュ|急げ|突撃|ε=|走/.test(combined)) motionType = 'rocket_zoom';
    else if (/よろ|ありがと|礼|ペコリ|🙇|おつ|拝/.test(combined)) motionType = 'bow_polite';
    else if (/やっほ|手|ハロー|バイ|ﾉｼ|👋|こん/.test(combined)) motionType = 'greeting_wave';
    else motionType = ALL_EMOTE_MOTIONS[Math.max(0, emoteIdx) % ALL_EMOTE_MOTIONS.length];
    if (emoteIdx >= 0 && this._emoteSlotMotionMap) {
      const used = Object.entries(this._emoteSlotMotionMap).filter(([k]) => Number(k) !== emoteIdx).map(([, v]) => v);
      if (used.includes(motionType)) {
        const unused = ALL_EMOTE_MOTIONS.find(m => !used.includes(m));
        if (unused) motionType = unused;
      }
    }
    if (emoteIdx >= 0) {
      if (!this._emoteSlotMotionMap) this._emoteSlotMotionMap = {};
      this._emoteSlotMotionMap[emoteIdx] = motionType;
    }
    return { motionType, kaomoji: kao, label };
  },

  createHeart3D(colorHex = 0xf43f5e) {
    const g = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ color: colorHex });
    const s1 = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), mat);
    s1.position.set(-0.1, 0.08, 0);
    const s2 = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), mat);
    s2.position.set(0.1, 0.08, 0);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.32, 12), mat);
    cone.position.set(0, -0.1, 0);
    cone.rotation.z = Math.PI;
    g.add(s1, s2, cone);
    return g;
  },

  playSyncedEmote(isSelf, uid, emoteData) {
    const kao = emoteData.kaomoji || '(≧▽≦)';
    const label = emoteData.label || emoteData.msg || 'やっほー！';
    const motionType = emoteData.motionType || 'backflip';
    this.spawnHeadBubble(isSelf, uid, kao, label, true);
    const ent = isSelf ? this.player : this.remotePlayers.get(uid);
    if (!ent) return;
    const durMap = {
      backflip: 2.2, tornado_dance: 2.6, dogeza: 2.8, chabudai_rage: 2.4, heart_float: 2.7, ghost_faint: 3.0,
      sleep_bubble: 2.9, greeting_wave: 2.3, salute_hero: 2.3, cry_fountain: 2.7, rocket_zoom: 2.4, bow_polite: 2.5
    };
    const maxT = durMap[motionType] || 2.4;
    ent.emoteAnim = { style: motionType, timer: maxT, maxTimer: maxT };
    if (!this.useWebGL || !this.scene || !ent.pos || typeof THREE === 'undefined') return;
    if (!this._slashEffects) this._slashEffects = [];
    const px = ent.pos.x, pz = ent.pos.z, rotY = ent.rotY || 0;
    if (motionType === 'chabudai_rage') {
      if (this.createChabudai3D) {
        const dirX = Math.sin(rotY), dirZ = Math.cos(rotY);
        const tableMesh = this.createChabudai3D();
        tableMesh.position.set(px + dirX * 1.1, 1.0, pz + dirZ * 1.1);
        tableMesh.rotation.y = rotY;
        this.scene.add(tableMesh);
        this._slashEffects.push({ kind: 'chabudai', mesh: tableMesh, life: 1.05, maxLife: 1.05, vx: dirX * 11.5, vz: dirZ * 11.5 });
      }
      const rMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.5, 1.1, 24), rMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(px, 0.12, pz);
      this.scene.add(ring);
      this._slashEffects.push({ kind: 'shockwave', mesh: ring, mat: rMat, life: 1.5, maxLife: 1.5 });
    } else if (motionType === 'heart_float') {
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2;
        const h = this.createHeart3D(i % 2 === 0 ? 0xf43f5e : 0xf472b6);
        h.position.set(px + Math.cos(ang) * 0.85, 1.2 + i * 0.15, pz + Math.sin(ang) * 0.85);
        this.scene.add(h);
        this._slashEffects.push({ kind: 'heart', mesh: h, life: 2.2, maxLife: 2.2, cx: px, cz: pz, ang, rad: 0.95, vy: 1.15 });
      }
    } else if (motionType === 'ghost_faint') {
      const ghost = new THREE.Group();
      const gMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.82 });
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 14, 14), gMat);
      const tail = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.7, 14), gMat);
      tail.position.y = -0.35; tail.rotation.x = Math.PI;
      ghost.add(head, tail);
      ghost.position.set(px, 1.0, pz);
      this.scene.add(ghost);
      this._slashEffects.push({ kind: 'ghost', mesh: ghost, mat: gMat, life: 2.6, maxLife: 2.6, bx: px, bz: pz });
    } else if (motionType === 'sleep_bubble') {
      const bMat = new THREE.MeshBasicMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.65 });
      const bub = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), bMat);
      bub.position.set(px + Math.sin(rotY) * 0.8, 1.65, pz + Math.cos(rotY) * 0.8);
      this.scene.add(bub);
      this._slashEffects.push({ kind: 'snot_bubble', mesh: bub, mat: bMat, life: 2.4, maxLife: 2.4 });
    } else if (motionType === 'cry_fountain') {
      const rightX = Math.cos(rotY), rightZ = -Math.sin(rotY);
      for (let i = 0; i < 14; i++) {
        const side = (i % 2 === 0) ? 1 : -1;
        const drop = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
        drop.position.set(px + rightX * 0.45 * side, 1.75, pz + rightZ * 0.45 * side);
        this.scene.add(drop);
        this._slashEffects.push({
          kind: 'tear', mesh: drop, life: 1.6, maxLife: 1.6,
          vx: rightX * side * (2.2 + (i % 3) * 0.5), vy: 3.2 + (i % 4) * 0.4, vz: rightZ * side * (2.2 + (i % 3) * 0.5),
          delay: i * 0.08
        });
      }
    } else if (motionType === 'salute_hero') {
      const beamMat = new THREE.MeshBasicMaterial({ color: 0xfef08a, side: THREE.DoubleSide, transparent: true, opacity: 0.36 });
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.6, 7.0, 20, 1, true), beamMat);
      beam.position.set(px, 3.5, pz);
      this.scene.add(beam);
      this._slashEffects.push({ kind: 'aura', mesh: beam, mat: beamMat, life: 2.0, maxLife: 2.0 });
    } else if (motionType === 'bow_polite') {
      for (let i = 0; i < 10; i++) {
        const ang = (i / 10) * Math.PI * 2;
        const petal = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.16), new THREE.MeshBasicMaterial({ color: 0xf9a8d4, side: THREE.DoubleSide }));
        petal.position.set(px + Math.cos(ang) * 1.1, 2.8 + (i % 3) * 0.4, pz + Math.sin(ang) * 1.1);
        this.scene.add(petal);
        this._slashEffects.push({ kind: 'petal', mesh: petal, life: 2.2, maxLife: 2.2, vx: Math.cos(ang) * 0.6, vy: -1.1, vz: Math.sin(ang) * 0.6 });
      }
    } else {
      const c1 = motionType === 'tornado_dance' ? 0x38bdf8 : 0xfde047;
      const c2 = motionType === 'dogeza' ? 0x60a5fa : 0xf472b6;
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? c1 : c2 }));
        star.position.set(px + Math.cos(ang) * 0.8, 2.1, pz + Math.sin(ang) * 0.8);
        this.scene.add(star);
        this._slashEffects.push({ kind: 'star', mesh: star, life: 1.5, maxLife: 1.5, vx: Math.cos(ang) * 1.8, vy: 1.8, vz: Math.sin(ang) * 1.8 });
      }
    }
  },

  updateHeadBubbles(dt) {
    if (!this._headBubbles || !this._headBubbles.length) return;
    this._headBubbles = this._headBubbles.filter(b => {
      b.life -= dt;
      if (b.life <= 0) { b.el.remove(); return false; }
      let target = null, scale = 1.0;
      if (b.isSelf && this.player) {
        target = this.player.pos;
        scale = this.getPlayerBodyScale ? this.getPlayerBodyScale() : 1.0;
      } else if (!b.isSelf) {
        const rp = this.remotePlayers.get(b.uid);
        if (rp && rp.visible) { target = rp.pos; scale = rp.bodyScale || 1.0; }
      }
      if (!target) { b.el.style.display = 'none'; return true; }
      const worldPos = new THREE.Vector3(target.x, 2.85 * scale, target.z);
      let sc = this.projectToScreen ? this.projectToScreen(worldPos) : null;
      if (!sc && this.camera && this.canvas) {
        const v = worldPos.clone().project(this.camera);
        if (v.z < 1) sc = { x: (v.x * 0.5 + 0.5) * this.canvas.clientWidth, y: (-v.y * 0.5 + 0.5) * this.canvas.clientHeight };
      }
      if (sc) {
        b.el.style.display = 'block';
        b.el.style.left = sc.x + 'px';
        b.el.style.top = sc.y + 'px';
        b.el.style.opacity = b.life < 0.6 ? String(b.life / 0.6) : '1';
      } else b.el.style.display = 'none';
      return true;
    });
  },

  // 5. スキル解決＆超豪華3Dエフェクト強化（多重魔法陣・公転オーブ・立体ジャイロ・星屑バースト）
  resolveSkillMeta(slotIdx) {
    const d = this.saveData || {};
    const candidates = [d.equippedSkills?.[slotIdx], d.skillSlots?.[slotIdx], d.activeSkills?.[slotIdx], d.skills?.[slotIdx], d.hotbar?.[slotIdx]]
      .filter(v => v !== undefined && v !== null && v !== '');
    let found = null;
    if (typeof SKILLS !== 'undefined' && SKILLS) {
      const list = Array.isArray(SKILLS) ? SKILLS : Object.values(SKILLS);
      for (const cand of candidates) {
        if (!Array.isArray(SKILLS) && SKILLS[cand]) { found = SKILLS[cand]; break; }
        found = list.find((s, i) => s && (s.id === cand || s.skillId === cand || i === Number(cand)));
        if (found) break;
      }
      if (!found && list[slotIdx]) found = list[slotIdx];
    }
    const btnEl = document.getElementById(`skill-slot-${slotIdx}`) || document.getElementById(`btn-skill-${slotIdx}`) || document.querySelectorAll('.skill-slot-btn, .skill-slot, .skill-btn')[slotIdx];
    const domText = btnEl ? `${btnEl.textContent || ''} ${btnEl.title || ''}` : '';
    const skillId = String(found?.id || found?.skillId || candidates[0] || `slot_${slotIdx}`);
    const skillName = (String(found?.name || found?.title || '') + ' ' + domText).trim();
    const combined = (skillId + ' ' + skillName).toLowerCase();
    const isChabudai = /chabu|table|flip|ちゃぶ|卓|返|┻|┬/.test(combined);
    const skillLv = this.getExactSkillLevelV26(skillId, slotIdx, found);
    let skillCategory = 'slash';
    if (isChabudai) skillCategory = 'chabudai';
    else if (/aurora|sanctuary|polar|極光|聖域|オーロラ/.test(combined)) skillCategory = 'aurora';
    else if (/bigbang|big_bang|genesis|cosmos|creation|supernova|ビッグバン|びっくばん|そうせい|創世|創星|創生/.test(combined)) skillCategory = 'bigbang';
    else if (/heal|cure|prayer|bless|holy|light|buff|boost|aura|guard|shield|haste|support|癒|回復|祈|聖|浄化|強化|鼓舞|結界|加速|守護|支援|補助/.test(combined) || found?.type === 'heal' || found?.type === 'buff') skillCategory = 'support';
    else if (/beam|laser|ray|cannon|kame|ビーム|レーザー|光線|砲|波動|閃光/.test(combined)) skillCategory = 'beam';
    else if (/zero|nova|absolute|blizzard|ice|frost|零度|ノヴァ|氷|吹雪|凍|雪/.test(combined)) skillCategory = 'nova_ice';
    else if (/fire|meteor|flare|burn|bomb|flame|炎|爆|火|隕|紅蓮|業火/.test(combined)) skillCategory = 'fire';
    else if (/thunder|bolt|spark|volt|lightning|雷|電|閃|迅/.test(combined)) skillCategory = 'thunder';
    else if (/wind|storm|tornado|gale|cyclone|風|嵐|竜巻|疾風|旋風/.test(combined)) skillCategory = 'wind';
    else if (/dark|void|shadow|abyss|gravity|闇|黒|影|重力|深淵|冥/.test(combined)) skillCategory = 'void';
    return { slotIdx, skillId, skillName, skillLv, skillCategory, isChabudai };
  },

  getSkillLvScale(skillLv) {
    if (skillLv >= 100) return 2.95 + Math.min(0.85, (skillLv - 100) * 0.005);
    if (skillLv >= 50) return 2.25 + (skillLv - 50) * 0.012;
    if (skillLv >= 10) return 1.72 + (skillLv - 10) * 0.012;
    return 1.15 + (skillLv - 1) * 0.06;
  },

  getSkillAccentColor(skillId, fallbackHex) {
    if (!skillId) return fallbackHex;
    let h = 0;
    for (let i = 0; i < skillId.length; i++) h = (h * 31 + skillId.charCodeAt(i)) >>> 0;
    const palette = [0x38bdf8, 0xf472b6, 0xa855f7, 0x34d399, 0xfacc15, 0xf97316, 0x2dd4bf, 0x818cf8];
    return (h % 3 === 0) ? fallbackHex : palette[h % palette.length];
  },

  createChabudai3D() {
    const grp = new THREE.Group();
    const woodMat = new THREE.MeshLambertMaterial({ color: 0xb45309 });
    const darkMat = new THREE.MeshLambertMaterial({ color: 0x451a03 });
    grp.add(new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 0.16, 24), woodMat));
    [[-0.72, -0.72], [0.72, -0.72], [-0.72, 0.72], [0.72, 0.72]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.56, 0.15), darkMat);
      leg.position.set(lx, -0.32, lz);
      grp.add(leg);
    });
    return grp;
  },

  // Lv.1から常時輝き、Lv.10 / Lv.50 / Lv.100以上で神話級へ進化する超豪華3Dオーラ演出
  attachSkillLevelEvolution(rootGroup, skillLv, mainColor) {
    const tier = skillLv >= 100 ? 3 : (skillLv >= 50 ? 2 : (skillLv >= 10 ? 1 : 0));
    const rings = [];
    const gyroRings = [];
    const orbs = [];

    // 1. 多重回転魔法陣（Lv1でも二重魔法陣、Lv100+で五重魔法陣）
    const ringSpecs = [
      { rIn: 1.25, rOut: 1.85, col: mainColor, spd: 4.8, y: 0.12 },
      { rIn: 2.05, rOut: 2.55, col: 0xfde047, spd: -3.9, y: 0.15 }
    ];
    if (tier >= 1) ringSpecs.push({ rIn: 2.85, rOut: 3.45, col: 0x38bdf8, spd: 5.4, y: 0.18 });
    if (tier >= 2) ringSpecs.push({ rIn: 3.75, rOut: 4.45, col: 0xf472b6, spd: -6.0, y: 0.21 });
    if (tier >= 3) ringSpecs.push({ rIn: 4.80, rOut: 5.75, col: 0xa855f7, spd: 6.8, y: 0.24 });

    ringSpecs.forEach(sp => {
      const mat = new THREE.MeshBasicMaterial({ color: sp.col, side: THREE.DoubleSide, transparent: true, opacity: 0.94 });
      const mesh = new THREE.Mesh(new THREE.RingGeometry(sp.rIn, sp.rOut, 36), mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.y = sp.y;
      rootGroup.add(mesh);
      rings.push({ mesh, mat, spd: sp.spd });
    });

    // 2. 公転クリスタル・スターオーブ（Lv1: 4個 / Lv10: 8個 / Lv50: 12個 / Lv100+: 16個）
    const orbCount = tier === 3 ? 16 : (tier === 2 ? 12 : (tier === 1 ? 8 : 4));
    const rainbowCols = [0xfde047, 0xf472b6, 0x38bdf8, 0x34d399, 0xa855f7, 0xf97316];
    for (let i = 0; i < orbCount; i++) {
      const ang = (i / orbCount) * Math.PI * 2;
      const radius = (tier === 3 && i >= 8) ? 4.2 : (tier >= 2 ? 3.1 : (tier >= 1 ? 2.3 : 1.7));
      const size = tier === 3 ? 0.38 : (tier === 2 ? 0.32 : (tier >= 1 ? 0.26 : 0.20));
      const col = tier >= 1 ? rainbowCols[i % rainbowCols.length] : (i % 2 === 0 ? 0xfde047 : mainColor);
      const orb = new THREE.Mesh(new THREE.OctahedronGeometry(size, 0), new THREE.MeshBasicMaterial({ color: col }));
      const baseY = 1.15 + (i % 3) * 0.48;
      orb.position.set(Math.cos(ang) * radius, baseY, Math.sin(ang) * radius);
      rootGroup.add(orb);
      orbs.push({ orb, ang, radius, baseY, spd: (i % 2 === 0 ? 1 : -1) * (5.8 + tier * 1.5) });
    }

    // 3. 立体ジャイロリング（Lv10で1基、Lv50で交差2基、Lv100+で三重神環）
    if (tier >= 1) {
      const g1Mat = new THREE.MeshBasicMaterial({ color: 0xfde047, transparent: true, opacity: 0.88 });
      const g1 = new THREE.Mesh(new THREE.TorusGeometry(2.3 + tier * 0.55, 0.11, 10, 36), g1Mat);
      g1.position.y = 1.75;
      g1.rotation.x = Math.PI * 0.28;
      rootGroup.add(g1);
      gyroRings.push({ mesh: g1, mat: g1Mat, rx: 3.8, ry: 4.8, rz: 2.2 });
    }
    if (tier >= 2) {
      const g2Mat = new THREE.MeshBasicMaterial({ color: 0xf472b6, transparent: true, opacity: 0.92 });
      const g2 = new THREE.Mesh(new THREE.TorusGeometry(3.2 + tier * 0.3, 0.13, 10, 36), g2Mat);
      g2.position.y = 1.95;
      g2.rotation.z = Math.PI * 0.28;
      rootGroup.add(g2);
      gyroRings.push({ mesh: g2, mat: g2Mat, rx: -4.2, ry: 5.2, rz: -3.4 });
    }
    if (tier >= 3) {
      const g3Mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.94 });
      const g3 = new THREE.Mesh(new THREE.TorusGeometry(4.4, 0.14, 10, 36), g3Mat);
      g3.position.y = 2.15;
      g3.rotation.y = Math.PI * 0.35;
      rootGroup.add(g3);
      gyroRings.push({ mesh: g3, mat: g3Mat, rx: 5.0, ry: -4.6, rz: 4.0 });
    }

    // 4. 昇天する聖光柱（全スキルLvで常時発動、Lvが上がるほど極太に輝く）
    const pillarR = 1.25 + tier * 0.85;
    const pillarH = 5.0 + tier * 2.6;
    const pillarMat = new THREE.MeshBasicMaterial({
      color: tier === 3 ? 0xfef08a : (tier === 2 ? 0xf472b6 : mainColor),
      side: THREE.DoubleSide, transparent: true, opacity: 0.32 + tier * 0.06
    });
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(pillarR * 0.72, pillarR, pillarH, 24, 1, true), pillarMat);
    pillar.position.y = pillarH * 0.5;
    rootGroup.add(pillar);

    return { tier, rings, gyroRings, orbs, pillar, pillarMat };
  },

  spawnSupportSkillVisual(entity, skillLv = 1, mainColor = 0x34d399) {
    if (!this.useWebGL || !this.scene || !entity?.pos || typeof THREE === 'undefined') return;
    if (!this._slashEffects) this._slashEffects = [];
    const lvScale = this.getSkillLvScale(skillLv);
    const supGrp = new THREE.Group();
    const innerMat = new THREE.MeshBasicMaterial({ color: 0xfef08a, side: THREE.DoubleSide, transparent: true, opacity: 0.92 });
    const innerRing = new THREE.Mesh(new THREE.RingGeometry(0.9 * lvScale, 1.45 * lvScale, 28), innerMat);
    innerRing.rotation.x = -Math.PI / 2;
    innerRing.position.y = 0.09;
    const outerMat = new THREE.MeshBasicMaterial({ color: mainColor, side: THREE.DoubleSide, transparent: true, opacity: 0.88 });
    const outerRing = new THREE.Mesh(new THREE.RingGeometry(1.75 * lvScale, 2.35 * lvScale, 32), outerMat);
    outerRing.rotation.x = -Math.PI / 2;
    outerRing.position.y = 0.12;
    const haloMat = new THREE.MeshBasicMaterial({ color: 0xfde047, transparent: true, opacity: 0.96 });
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.72 * lvScale, 0.09, 10, 28), haloMat);
    halo.rotation.x = Math.PI / 2;
    halo.position.y = 2.65;
    const veilMat = new THREE.MeshBasicMaterial({ color: mainColor, side: THREE.DoubleSide, transparent: true, opacity: 0.30 });
    const veilCyl = new THREE.Mesh(new THREE.CylinderGeometry(1.5 * lvScale, 1.95 * lvScale, 3.8, 24, 1, true), veilMat);
    veilCyl.position.y = 1.9;
    supGrp.add(innerRing, outerRing, halo, veilCyl);

    const crosses = [];
    const crossCount = skillLv >= 100 ? 18 : (skillLv >= 50 ? 14 : (skillLv >= 10 ? 10 : 8));
    for (let i = 0; i < crossCount; i++) {
      const ang = (i / crossCount) * Math.PI * 2;
      const cMesh = new THREE.Group();
      const cMat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x4ade80 : 0xfef08a, transparent: true, opacity: 0.96 });
      cMesh.add(new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.11, 0.11), cMat), new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.36, 0.11), cMat));
      const dist = (1.1 + (i % 2) * 0.55) * lvScale;
      cMesh.position.set(Math.cos(ang) * dist, 0.4 + (i % 3) * 0.35, Math.sin(ang) * dist);
      supGrp.add(cMesh);
      crosses.push({ mesh: cMesh, mat: cMat, ang, dist, vy: 1.5 + (i % 3) * 0.35 });
    }
    const lvEvo = this.attachSkillLevelEvolution(supGrp, skillLv, mainColor);
    supGrp.position.set(entity.pos.x, 0, entity.pos.z);
    this.scene.add(supGrp);
    this._slashEffects.push({
      kind: 'support_bless', mesh: supGrp, innerRing, outerRing, halo, veilCyl,
      innerMat, outerMat, haloMat, veilMat, crosses, lvEvo, followEntity: entity, life: 1.25, maxLife: 1.25
    });
  },

  spawnAuroraSanctuary(x, z, skillLv = 1, casterName = '') {
    if (!this.useWebGL || !this.scene || typeof THREE === 'undefined') return;
    if (!this._sanctuaryFields) this._sanctuaryFields = [];
    const lvBonus = skillLv >= 100 ? 3.5 : (skillLv >= 50 ? 2.4 : (skillLv >= 10 ? 1.4 : 0));
    const radius = 5.4 + lvBonus;
    const duration = 8.0 + (skillLv >= 50 ? 5.0 : (skillLv >= 10 ? 2.5 : 0));
    const grp = new THREE.Group();
    const baseMat = new THREE.MeshBasicMaterial({ color: 0x2dd4bf, side: THREE.DoubleSide, transparent: true, opacity: 0.48 });
    const baseDisc = new THREE.Mesh(new THREE.CircleGeometry(radius, 36), baseMat);
    baseDisc.rotation.x = -Math.PI / 2;
    baseDisc.position.y = 0.08;
    const outerMat = new THREE.MeshBasicMaterial({ color: 0xf472b6, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
    const outerRing = new THREE.Mesh(new THREE.RingGeometry(radius - 0.35, radius, 36), outerMat);
    outerRing.rotation.x = -Math.PI / 2;
    outerRing.position.y = 0.11;
    const wallMat = new THREE.MeshBasicMaterial({ color: 0x5eead4, side: THREE.DoubleSide, transparent: true, opacity: 0.26 });
    const wallCyl = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 3.4 + lvBonus * 0.6, 32, 1, true), wallMat);
    wallCyl.position.y = 1.7 + lvBonus * 0.3;
    grp.add(baseDisc, outerRing, wallCyl);
    const pillars = [];
    const pColors = [0x34d399, 0x38bdf8, 0xf472b6, 0xfde047];
    const count = skillLv >= 100 ? 12 : (skillLv >= 50 ? 8 : (skillLv >= 10 ? 6 : 4));
    for (let i = 0; i < count; i++) {
      const ang = (i / count) * Math.PI * 2;
      const pMat = new THREE.MeshBasicMaterial({ color: pColors[i % pColors.length], transparent: true, opacity: 0.85 });
      const pMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), pMat);
      pMesh.position.set(Math.cos(ang) * (radius * 0.65), 0.8 + (i % 3) * 0.6, Math.sin(ang) * (radius * 0.65));
      grp.add(pMesh);
      pillars.push({ mesh: pMesh, ang, dist: radius * 0.65, phase: i * 0.9 });
    }
    grp.position.set(x, 0, z);
    this.scene.add(grp);
    this._sanctuaryFields.push({
      grp, x, z, radius, skillLv, life: duration, maxLife: duration, tickTimer: 0,
      outerRing, wallCyl, baseMat, outerMat, wallMat, pillars
    });
    if (casterName) this.pushSystemEventLog(`🌈 ${casterName} が「極光の聖域 Lv.${skillLv}」を展開！`, 2000);
  },

  updateSanctuaryFields(dt) {
    if (!this._sanctuaryFields || !this._sanctuaryFields.length) return;
    let insideAny = false, maxBuffLv = 1;
    this._sanctuaryFields = this._sanctuaryFields.filter(sf => {
      sf.life -= dt;
      if (sf.life <= 0) {
        if (this.scene) this.scene.remove(sf.grp);
        sf.grp.traverse?.(o => { o.geometry?.dispose?.(); o.material?.dispose?.(); });
        return false;
      }
      const fade = sf.life < 1.2 ? (sf.life / 1.2) : 1.0;
      sf.outerRing.rotation.z += dt * 1.4;
      sf.wallCyl.rotation.y -= dt * 0.8;
      sf.baseMat.opacity = 0.42 * fade;
      sf.outerMat.opacity = 0.82 * fade;
      sf.wallMat.opacity = (0.22 + Math.sin(sf.life * 4) * 0.06) * fade;
      sf.pillars.forEach(pl => {
        pl.ang += dt * 1.2;
        pl.mesh.position.x = Math.cos(pl.ang) * pl.dist;
        pl.mesh.position.z = Math.sin(pl.ang) * pl.dist;
        pl.mesh.position.y = 1.3 + Math.sin(sf.life * 3.5 + pl.phase) * 0.75;
        pl.mesh.rotation.y += dt * 3;
      });
      if (this.player && this.player.pos) {
        if (Math.hypot(this.player.pos.x - sf.x, this.player.pos.z - sf.z) <= sf.radius) {
          insideAny = true;
          maxBuffLv = Math.max(maxBuffLv, sf.skillLv || 1);
          sf.tickTimer += dt;
          if (sf.tickTimer >= 1.0) {
            sf.tickTimer -= 1.0;
            const maxHp = this.player.maxHp || this.saveData?.maxHp || 100;
            const curHp = this.player.hp ?? maxHp;
            if (curHp > 0 && curHp < maxHp) {
              const healAmt = Math.max(5, Math.floor(maxHp * (0.08 + sf.skillLv * 0.015)));
              this.player.hp = Math.min(maxHp, curHp + healAmt);
              if (this.spawnFloatingText && this.player.pos) this.spawnFloatingText(this.player.pos, `+${healAmt} 🌈聖域`, '#34d399');
              this.refreshAllHUD?.();
            }
          }
        }
      }
      return true;
    });
    if (insideAny) {
      if (!this._inSanctuaryBuff) {
        this._inSanctuaryBuff = true;
        this._sanctuaryBuffLv = maxBuffLv;
        this.showAlertBanner(`🌈 極光の聖域バフ発動中！（ATK/DEF/SPD UP Lv.${maxBuffLv}）`, 1800);
      }
      this._sanctuaryBuffLv = maxBuffLv;
    } else if (this._inSanctuaryBuff) {
      this._inSanctuaryBuff = false;
      this._sanctuaryBuffLv = 0;
    }
  },

  triggerAttackVisual(entity, isSkill = false, skillInfo = null) {
    if (!entity) return;
    const isLocalPlayer = (entity === this.player);
    const isMage = isLocalPlayer
      ? this.isMageEvolution()
      : Boolean(skillInfo?.isMage || (entity?.evolutionId && this.isMageEvolution(entity.evolutionId)));

    // 魔道士系（杖装備）の通常攻撃：魔法弾発射＋敵命中瞬間に魔法攻撃ダメージ判定
    if (!isSkill && isMage) {
      entity.attackAnimTimer = 0.34;
      entity.attackIsSkill = false;
      this.spawnMageBasicMagicShot(entity, isLocalPlayer);
      return;
    }

    entity.attackAnimTimer = 0.36;
    entity.attackIsSkill = isSkill;
    if (!this.useWebGL || !this.scene || !entity.pos || typeof THREE === 'undefined') return;
    if (!this._slashEffects) this._slashEffects = [];
    const rotY = entity.rotY || 0, dirX = Math.sin(rotY), dirZ = Math.cos(rotY);
    const sId = String(skillInfo?.skillId || '').toLowerCase();
    const fullKey = (sId + ' ' + String(skillInfo?.skillName || '')).toLowerCase();
    const skillLv = Math.max(1, Number(skillInfo?.skillLv) || 1);
    const lvScale = this.getSkillLvScale(skillLv);
    let cat = skillInfo?.skillCategory || '';
    if (!cat && isSkill) {
      if (skillInfo?.isChabudai || /chabu|table|flip|ちゃぶ|卓|返|┻|┬/.test(fullKey)) cat = 'chabudai';
      else if (/aurora|sanctuary|polar|極光|聖域|オーロラ/.test(fullKey)) cat = 'aurora';
      else if (/bigbang|big_bang|genesis|cosmos|creation|supernova|ビッグバン|びっくばん|そうせい|創世|創星|創生/.test(fullKey)) cat = 'bigbang';
      else if (/heal|cure|prayer|bless|holy|light|buff|boost|aura|guard|shield|haste|support|癒|回復|祈|聖|浄化|強化|鼓舞|結界|加速|守護|支援|補助/.test(fullKey)) cat = 'support';
      else if (/beam|laser|ray|cannon|kame|ビーム|レーザー|光線|砲|波動|閃光/.test(fullKey)) cat = 'beam';
      else if (/zero|nova|absolute|blizzard|ice|frost|零度|ノヴァ|氷|吹雪|凍|雪/.test(fullKey)) cat = 'nova_ice';
      else if (/fire|meteor|flare|burn|bomb|flame|炎|爆|火|隕|紅蓮|業火/.test(fullKey)) cat = 'fire';
      else if (/thunder|bolt|spark|volt|lightning|雷|電|閃|迅/.test(fullKey)) cat = 'thunder';
      else if (/wind|storm|tornado|gale|cyclone|風|嵐|竜巻|疾風|旋風/.test(fullKey)) cat = 'wind';
      else if (/dark|void|shadow|abyss|gravity|闇|黒|影|重力|深淵|冥/.test(fullKey)) cat = 'void';
      else cat = 'slash';
    }

    if (isSkill) {
      if (cat === 'chabudai') {
        const tableMesh = this.createChabudai3D();
        tableMesh.scale.setScalar(lvScale);
        tableMesh.position.set(entity.pos.x + dirX * 1.1, 1.0, entity.pos.z + dirZ * 1.1);
        tableMesh.rotation.y = rotY;
        this.scene.add(tableMesh);
        this._slashEffects.push({
          kind: 'chabudai', mesh: tableMesh, life: 0.95, maxLife: 0.95,
          vx: dirX * (12.0 + Math.min(8, skillLv * 0.08)), vz: dirZ * (12.0 + Math.min(8, skillLv * 0.08))
        });
        return;
      }
      if (cat === 'aurora') {
        const caster = isLocalPlayer ? this.getBasePlayerKaomoji() : (entity.kaomoji || '仲間');
        this.spawnAuroraSanctuary(entity.pos.x, entity.pos.z, skillLv, caster);
        this.spawnSupportSkillVisual(entity, skillLv, 0x2dd4bf);
        return;
      }
      if (cat === 'support') {
        this.spawnSupportSkillVisual(entity, skillLv, this.getSkillAccentColor(sId, 0x34d399));
        return;
      }
      if (cat === 'bigbang') {
        const bbGrp = new THREE.Group();
        const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.98 });
        const coreSphere = new THREE.Mesh(new THREE.SphereGeometry(1.25 * lvScale, 24, 24), coreMat);
        coreSphere.position.y = 1.6;
        const auraMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.58, wireframe: true });
        const auraSphere = new THREE.Mesh(new THREE.SphereGeometry(2.5 * lvScale, 18, 16), auraMat);
        auraSphere.position.y = 1.6;
        const waveMat = new THREE.MeshBasicMaterial({ color: 0xfde047, side: THREE.DoubleSide, transparent: true, opacity: 0.92 });
        const waveRing = new THREE.Mesh(new THREE.RingGeometry(1.0, 5.2 * lvScale, 36), waveMat);
        waveRing.rotation.x = -Math.PI / 2;
        waveRing.position.y = 0.16;
        bbGrp.add(coreSphere, auraSphere, waveRing);
        const meteors = [];
        const mCols = [0xfde047, 0xf472b6, 0x38bdf8, 0xa855f7];
        const mCount = skillLv >= 100 ? 32 : (skillLv >= 50 ? 24 : (skillLv >= 10 ? 20 : 16));
        for (let i = 0; i < mCount; i++) {
          const ang = (i / mCount) * Math.PI * 2;
          const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.36 * lvScale, 0), new THREE.MeshBasicMaterial({ color: mCols[i % mCols.length] }));
          star.position.set(0, 1.6, 0);
          bbGrp.add(star);
          meteors.push({
            mesh: star,
            vx: Math.cos(ang) * (9.0 + (i % 4) * 1.6),
            vy: 3.2 + ((i % 3) - 0.5) * 3.2,
            vz: Math.sin(ang) * (9.0 + (i % 4) * 1.6)
          });
        }
        const lvEvo = this.attachSkillLevelEvolution(bbGrp, skillLv, 0xf43f5e);
        bbGrp.position.set(entity.pos.x + dirX * 2.5, 0, entity.pos.z + dirZ * 2.5);
        this.scene.add(bbGrp);
        this._slashEffects.push({ kind: 'bigbang', mesh: bbGrp, coreSphere, auraSphere, waveRing, coreMat, auraMat, waveMat, meteors, lvEvo, life: 1.15, maxLife: 1.15 });
        return;
      }
      if (cat === 'beam') {
        const mainCol = this.getSkillAccentColor(sId, 0x38bdf8);
        const beamGroup = new THREE.Group();
        const length = 15.0 + (skillLv >= 100 ? 13.0 : (skillLv >= 50 ? 9.0 : (skillLv >= 10 ? 5.0 : 0)));
        const radius = 0.78 * (skillLv >= 100 ? 2.2 : (skillLv >= 50 ? 1.8 : (skillLv >= 10 ? 1.4 : 1.05)));
        const outerMat = new THREE.MeshBasicMaterial({ color: mainCol, transparent: true, opacity: 0.68 });
        const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.98 });
        const outerCyl = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 1.28, length, 20, 1, true), outerMat);
        outerCyl.rotation.x = Math.PI / 2;
        outerCyl.position.z = length / 2 + 0.9;
        const coreCyl = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.44, radius * 0.52, length, 16), coreMat);
        coreCyl.rotation.x = Math.PI / 2;
        coreCyl.position.z = length / 2 + 0.9;
        beamGroup.add(outerCyl, coreCyl);
        const rings = [];
        const ringCount = skillLv >= 100 ? 12 : (skillLv >= 50 ? 8 : (skillLv >= 10 ? 6 : 5));
        for (let i = 0; i < ringCount; i++) {
          const ring = new THREE.Mesh(new THREE.TorusGeometry(radius * 1.55, 0.095, 8, 24), new THREE.MeshBasicMaterial({ color: 0xfde047, side: THREE.DoubleSide, transparent: true, opacity: 0.92 }));
          ring.position.z = 2.0 + (i / ringCount) * (length - 2.0);
          beamGroup.add(ring);
          rings.push(ring);
        }
        const lvEvo = this.attachSkillLevelEvolution(beamGroup, skillLv, mainCol);
        beamGroup.position.set(entity.pos.x, 1.15, entity.pos.z);
        beamGroup.rotation.y = rotY;
        this.scene.add(beamGroup);
        this._slashEffects.push({ kind: 'beam', mesh: beamGroup, outerCyl, coreCyl, outerMat, coreMat, rings, lvEvo, life: 0.82, maxLife: 0.82 });
        return;
      }
      if (cat === 'nova_ice') {
        const novaGroup = new THREE.Group();
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc, side: THREE.DoubleSide, transparent: true, opacity: 0.88 });
        const magicRing = new THREE.Mesh(new THREE.RingGeometry(1.1, 4.8 * lvScale, 32), ringMat);
        magicRing.rotation.x = -Math.PI / 2;
        magicRing.position.y = 0.12;
        const domeMat = new THREE.MeshBasicMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.38, wireframe: true });
        const dome = new THREE.Mesh(new THREE.SphereGeometry(3.8 * lvScale, 16, 12), domeMat);
        dome.position.y = 0.5;
        novaGroup.add(magicRing, dome);
        const spikes = [];
        const spikeMat = new THREE.MeshLambertMaterial({ color: 0xe0f2fe, emissive: 0x0284c7, transparent: true, opacity: 0.94 });
        const spikeCount = skillLv >= 100 ? 22 : (skillLv >= 50 ? 16 : (skillLv >= 10 ? 12 : 9));
        for (let i = 0; i < spikeCount; i++) {
          const ang = (i / spikeCount) * Math.PI * 2;
          const dist = ((i % 2 === 0) ? 2.4 : 4.0) * lvScale;
          const spike = new THREE.Mesh(new THREE.ConeGeometry(0.44 * lvScale, 2.9 * lvScale, 6), spikeMat);
          spike.position.set(Math.cos(ang) * dist, -1.2, Math.sin(ang) * dist);
          novaGroup.add(spike);
          spikes.push(spike);
        }
        const lvEvo = this.attachSkillLevelEvolution(novaGroup, skillLv, 0x38bdf8);
        novaGroup.position.set(entity.pos.x, 0, entity.pos.z);
        this.scene.add(novaGroup);
        this._slashEffects.push({ kind: 'nova_ice', mesh: novaGroup, magicRing, dome, spikes, ringMat, domeMat, spikeMat, lvEvo, life: 1.0, maxLife: 1.0 });
        return;
      }

      // 斬撃・属性スキル（多重斬撃アーク＋豪華レベル進化＋拡散星屑スパーク）
      const customCol = this.getSkillAccentColor(sId, cat === 'fire' ? 0xf97316 : (cat === 'thunder' ? 0xfacc15 : (cat === 'wind' ? 0x34d399 : (cat === 'void' ? 0xa855f7 : 0xf472b6))));
      const sGrp = new THREE.Group();
      const mat = new THREE.MeshBasicMaterial({ color: customCol, side: THREE.DoubleSide, transparent: true, opacity: 0.94 });
      const arcCount = skillLv >= 100 ? 5 : (skillLv >= 50 ? 4 : (skillLv >= 10 ? 3 : 2));
      for (let a = 0; a < arcCount; a++) {
        const arc = new THREE.Mesh(new THREE.RingGeometry((0.75 + a * 0.35) * lvScale, (2.15 + a * 0.48) * lvScale, 28, 1, -Math.PI * 0.52, Math.PI * 1.04), mat);
        arc.rotation.set(Math.PI * (0.35 - a * 0.11), rotY, -0.5 + a * 0.55);
        arc.position.y = 1.1 + a * 0.24;
        sGrp.add(arc);
      }
      const lvEvo = this.attachSkillLevelEvolution(sGrp, skillLv, customCol);
      sGrp.position.set(entity.pos.x + dirX * 1.2, 0, entity.pos.z + dirZ * 1.2);
      this.scene.add(sGrp);
      this._slashEffects.push({ kind: 'slash', mesh: sGrp, mat, lvEvo, life: 0.62, maxLife: 0.62, vx: dirX * 11.0, vz: dirZ * 11.0 });

      // 追加豪華バースト星屑（全スキル共通）
      const sparkCount = skillLv >= 50 ? 10 : 6;
      for (let i = 0; i < sparkCount; i++) {
        const ang = rotY + ((i / (sparkCount - 1)) - 0.5) * 1.6;
        const sp = new THREE.Mesh(new THREE.OctahedronGeometry(0.22 * Math.min(1.6, lvScale * 0.7), 0), new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? customCol : 0xfde047 }));
        sp.position.set(entity.pos.x + dirX * 1.2, 1.35, entity.pos.z + dirZ * 1.2);
        this.scene.add(sp);
        this._slashEffects.push({ kind: 'star', mesh: sp, life: 0.55, maxLife: 0.55, vx: Math.sin(ang) * 9.5, vy: 2.2 + (i % 3) * 0.8, vz: Math.cos(ang) * 9.5 });
      }
      return;
    }

    // 片手剣の通常攻撃：二重斬撃波＋閃光リング
    const slashGrp = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.94 });
    const arc1 = new THREE.Mesh(new THREE.RingGeometry(0.75, 1.55, 24, 1, -Math.PI * 0.48, Math.PI * 0.96), mat);
    arc1.rotation.set(Math.PI * 0.35, rotY, -0.55);
    const arc2 = new THREE.Mesh(new THREE.RingGeometry(1.15, 1.85, 24, 1, -Math.PI * 0.42, Math.PI * 0.84), new THREE.MeshBasicMaterial({ color: 0xfef08a, side: THREE.DoubleSide, transparent: true, opacity: 0.85 }));
    arc2.rotation.set(Math.PI * 0.28, rotY, 0.45);
    slashGrp.add(arc1, arc2);
    slashGrp.position.set(entity.pos.x + dirX * 1.25, 1.05, entity.pos.z + dirZ * 1.25);
    this.scene.add(slashGrp);
    this._slashEffects.push({ kind: 'slash', mesh: slashGrp, mat, life: 0.30, maxLife: 0.30, vx: dirX * 2.5, vz: dirZ * 2.5 });
  },

  updateCharacterAnimations(dt) {
    if (this._slashEffects && this._slashEffects.length) {
      this._slashEffects = this._slashEffects.filter(ef => {
        if (ef.delay && ef.delay > 0) { ef.delay -= dt; ef.mesh.visible = false; return true; }
        ef.mesh.visible = true;
        ef.life -= dt;
        if (ef.life <= 0) {
          if (this.scene) this.scene.remove(ef.mesh);
          ef.mesh.traverse?.(o => { o.geometry?.dispose?.(); o.material?.dispose?.(); });
          return false;
        }
        const p = 1 - (ef.life / ef.maxLife);
        const fade = 1 - p;
        if (ef.lvEvo) {
          ef.lvEvo.rings.forEach(r => { r.mesh.rotation.z += dt * r.spd; r.mat.opacity = fade * 0.94; });
          ef.lvEvo.gyroRings.forEach(g => {
            g.mesh.rotation.x += dt * g.rx;
            g.mesh.rotation.y += dt * g.ry;
            g.mesh.rotation.z += dt * g.rz;
            g.mat.opacity = fade * 0.90;
          });
          ef.lvEvo.orbs.forEach(o => {
            o.ang += dt * o.spd;
            o.orb.position.x = Math.cos(o.ang) * o.radius;
            o.orb.position.z = Math.sin(o.ang) * o.radius;
            o.orb.position.y = o.baseY + Math.sin(p * Math.PI * 3 + o.ang) * 0.45;
            o.orb.rotation.y += dt * 6.0;
          });
          if (ef.lvEvo.pillar) {
            ef.lvEvo.pillar.rotation.y -= dt * 3.0;
            ef.lvEvo.pillar.scale.set(0.8 + p * 0.65, 1, 0.8 + p * 0.65);
            ef.lvEvo.pillarMat.opacity = fade * (0.34 + ef.lvEvo.tier * 0.06);
          }
        }
        if (ef.kind === 'support_bless') {
          if (ef.followEntity?.pos) ef.mesh.position.set(ef.followEntity.pos.x, 0, ef.followEntity.pos.z);
          ef.innerRing.rotation.z += dt * 4.0;
          ef.outerRing.rotation.z -= dt * 3.0;
          ef.halo.position.y = 2.55 + Math.sin(p * Math.PI) * 0.45;
          ef.halo.rotation.z += dt * 5.0;
          ef.veilCyl.scale.set(0.85 + p * 0.45, 1, 0.85 + p * 0.45);
          ef.innerMat.opacity = fade * 0.92;
          ef.outerMat.opacity = fade * 0.88;
          ef.haloMat.opacity = fade * 0.96;
          ef.veilMat.opacity = fade * 0.34;
          ef.crosses.forEach(c => {
            c.ang += dt * 2.6;
            c.mesh.position.x = Math.cos(c.ang) * c.dist;
            c.mesh.position.z = Math.sin(c.ang) * c.dist;
            c.mesh.position.y += c.vy * dt;
            c.mesh.rotation.y += dt * 4.5;
            c.mat.opacity = fade * 0.95;
          });
        } else if (ef.kind === 'bigbang') {
          ef.coreSphere.scale.setScalar(Math.max(0.1, fade * 2.2));
          ef.auraSphere.scale.setScalar(0.4 + p * 2.4);
          ef.auraSphere.rotation.y += dt * 4.0;
          ef.waveRing.scale.setScalar(0.5 + p * 2.6);
          ef.coreMat.opacity = fade;
          ef.auraMat.opacity = fade * 0.65;
          ef.waveMat.opacity = fade * 0.92;
          ef.meteors.forEach(m => {
            m.mesh.position.x += m.vx * dt;
            m.mesh.position.y += m.vy * dt;
            m.mesh.position.z += m.vz * dt;
            m.mesh.rotation.y += dt * 8.0;
            m.mesh.scale.setScalar(Math.max(0.1, 1 - p * 0.8));
          });
        } else if (ef.kind === 'chabudai') {
          ef.mesh.position.x += ef.vx * dt;
          ef.mesh.position.z += ef.vz * dt;
          ef.mesh.position.y = 1.0 + Math.sin(p * Math.PI) * 3.0;
          ef.mesh.rotation.x = p * Math.PI * 4.5;
          ef.mesh.rotation.z = p * Math.PI * 1.4;
        } else if (ef.kind === 'beam') {
          const pulse = Math.sin(p * Math.PI);
          ef.outerCyl.scale.set(0.6 + pulse * 0.8, 1, 0.6 + pulse * 0.8);
          ef.coreCyl.scale.set(0.5 + pulse * 0.7, 1, 0.5 + pulse * 0.7);
          ef.outerMat.opacity = fade * 0.75;
          ef.coreMat.opacity = fade * 0.98;
          ef.rings.forEach((r, idx) => {
            r.rotation.z += dt * (idx % 2 === 0 ? 8 : -8);
            r.scale.setScalar(0.8 + pulse * 0.6);
          });
        } else if (ef.kind === 'nova_ice') {
          const rise = Math.min(1, p * 3.2);
          ef.spikes.forEach((sp, idx) => {
            sp.position.y = -1.2 + rise * 2.55;
            sp.rotation.y += dt * (idx % 2 === 0 ? 2 : -2);
          });
          ef.magicRing.rotation.z += dt * 2.5;
          ef.dome.scale.setScalar(0.5 + p * 0.95);
          ef.ringMat.opacity = fade * 0.85;
          ef.domeMat.opacity = fade * 0.4;
          ef.spikeMat.opacity = p > 0.7 ? fade * 3.0 : 0.92;
        } else if (ef.kind === 'heart') {
          ef.ang += dt * 3.2;
          ef.mesh.position.x = ef.cx + Math.cos(ef.ang) * ef.rad;
          ef.mesh.position.z = ef.cz + Math.sin(ef.ang) * ef.rad;
          ef.mesh.position.y += ef.vy * dt;
          ef.mesh.rotation.y += dt * 4;
          ef.mesh.scale.setScalar(1 - p * 0.5);
        } else if (ef.kind === 'ghost') {
          ef.mesh.position.y += dt * 1.5;
          ef.mesh.position.x = ef.bx + Math.sin(p * 14) * 0.28;
          ef.mat.opacity = fade * 0.85;
        } else if (ef.kind === 'snot_bubble') {
          const sc = p < 0.8 ? (0.4 + p * 2.2) : (2.2 + (p - 0.8) * 6.0);
          ef.mesh.scale.setScalar(sc);
          ef.mat.opacity = p < 0.8 ? 0.65 : Math.max(0, fade * 3.2);
        } else if (ef.kind === 'tear') {
          ef.mesh.position.x += ef.vx * dt;
          ef.mesh.position.y += ef.vy * dt;
          ef.mesh.position.z += ef.vz * dt;
          ef.vy -= 9.5 * dt;
        } else if (ef.kind === 'shockwave') {
          ef.mesh.scale.setScalar(1 + p * 3.2);
          ef.mat.opacity = fade * 0.85;
        } else if (ef.kind === 'petal') {
          ef.mesh.position.x += ef.vx * dt + Math.sin(p * 12) * 0.03;
          ef.mesh.position.y += ef.vy * dt;
          ef.mesh.position.z += ef.vz * dt;
        } else if (ef.kind === 'aura') {
          ef.mesh.scale.set(1 + p * 0.55, 1, 1 + p * 0.55);
          ef.mesh.rotation.y += dt * 5;
          ef.mat.opacity = fade * 0.78;
        } else if (ef.kind === 'star') {
          ef.mesh.position.x += ef.vx * dt;
          ef.mesh.position.y += ef.vy * dt;
          ef.mesh.position.z += ef.vz * dt;
          ef.mesh.scale.setScalar(1 - p * 0.7);
        } else {
          ef.mesh.position.x += (ef.vx || 0) * dt;
          ef.mesh.position.z += (ef.vz || 0) * dt;
          ef.mesh.scale.setScalar(1 + p * 0.5);
          ef.mat.opacity = fade * 0.92;
        }
        return true;
      });
    }
    const applyPose = (ent) => {
      if (!ent || !ent.group) return;
      if (!ent._baseScale) ent._baseScale = ent.group.scale.x || 1;
      const baseRotY = ent.rotY || 0;
      let offX = 0, offY = 0, offZ = 0, rotX = 0, rotY = baseRotY, rotZ = 0, scaleMult = 1.0, active = false;
      const wpnObj = ent.weaponMesh || ent.weaponGroup || ent.rightArm || null;
      if (wpnObj && ent._wpnBaseRotX === undefined) {
        ent._wpnBaseRotX = wpnObj.rotation.x || 0;
        ent._wpnBaseRotZ = wpnObj.rotation.z || 0;
      }
      if (ent.attackAnimTimer && ent.attackAnimTimer > 0) {
        active = true;
        ent.attackAnimTimer = Math.max(0, ent.attackAnimTimer - dt);
        const p = 1 - (ent.attackAnimTimer / 0.36);
        const swing = Math.sin(p * Math.PI);
        offX += Math.sin(baseRotY) * (swing * 0.55);
        offZ += Math.cos(baseRotY) * (swing * 0.55);
        offY += swing * 0.25;
        rotY += Math.sin(p * Math.PI * 2) * 0.55;
        rotX += swing * 0.26;
        if (wpnObj) {
          const slashAngle = (p < 0.3) ? (-0.75 * (p / 0.3)) : (-0.75 + 2.35 * ((p - 0.3) / 0.7));
          wpnObj.rotation.x = (ent._wpnBaseRotX || 0) + slashAngle;
          wpnObj.rotation.z = (ent._wpnBaseRotZ || 0) - swing * 0.45;
        }
      } else if (wpnObj && ent._wpnBaseRotX !== undefined) {
        wpnObj.rotation.x = ent._wpnBaseRotX;
        wpnObj.rotation.z = ent._wpnBaseRotZ;
      }
      if (ent.emoteAnim && ent.emoteAnim.timer > 0) {
        active = true;
        ent.emoteAnim.timer = Math.max(0, ent.emoteAnim.timer - dt);
        const t = ent.emoteAnim.maxTimer - ent.emoteAnim.timer;
        const p = t / ent.emoteAnim.maxTimer;
        const st = ent.emoteAnim.style;
        if (st === 'backflip') {
          const jp = Math.min(1, p / 0.65);
          offY += Math.sin(jp * Math.PI) * 2.4;
          rotX -= jp * Math.PI * 2;
        } else if (st === 'tornado_dance') {
          rotZ = 0.58;
          rotY += t * Math.PI * 5.0;
          offX += Math.cos(t * 5) * 0.45;
          offZ += Math.sin(t * 5) * 0.45;
          offY += 0.25 + Math.abs(Math.sin(t * 8)) * 0.25;
        } else if (st === 'dogeza') {
          const d = Math.min(1, p * 4) * Math.min(1, (1 - p) * 5);
          offY -= d * 0.32;
          rotX += d * 1.38;
        } else if (st === 'chabudai_rage') {
          scaleMult = 1.35;
          offY += Math.abs(Math.sin(t * 18)) * 0.42;
          rotZ += Math.sin(t * 48) * 0.26;
        } else if (st === 'heart_float') {
          offY += 0.65 + Math.sin(t * 4.5) * 0.18;
          rotZ += Math.sin(t * 3.8) * 0.25;
          rotY += Math.sin(t * 2.5) * 0.35;
        } else if (st === 'ghost_faint') {
          const d = Math.min(1, p * 4.5) * Math.min(1, (1 - p) * 4.5);
          offY -= d * 0.28;
          rotX -= d * 1.45;
        } else if (st === 'sleep_bubble') {
          rotX += Math.pow(Math.abs(Math.sin(t * 2.6)), 3) * 0.65;
          rotZ = 0.36;
        } else if (st === 'greeting_wave') {
          const rx = Math.cos(baseRotY), rz = -Math.sin(baseRotY), step = Math.sin(t * 6.5) * 0.55;
          offX += rx * step;
          offZ += rz * step;
          offY += Math.abs(Math.sin(t * 13)) * 0.24;
          rotZ += Math.sin(t * 13) * 0.32;
        } else if (st === 'salute_hero') {
          const pop = Math.min(1, p * 5) * Math.min(1, (1 - p) * 5);
          offY += pop * 0.45;
          rotX -= pop * 0.26;
          rotY += pop * 0.55;
          scaleMult = 1 + pop * 0.12;
        } else if (st === 'cry_fountain') {
          scaleMult = 0.86;
          rotX = 0.48;
          rotZ += Math.sin(t * 34) * 0.16;
        } else if (st === 'rocket_zoom') {
          rotX = 0.72;
          offX += Math.sin(t * 4.5) * 1.15;
          offZ += Math.sin(t * 9.0) * 0.55;
        } else {
          const bow = Math.min(1, p * 3.5) * Math.min(1, (1 - p) * 3.5);
          rotX += bow * 0.98;
        }
      }
      if (active) {
        ent.group.position.set(ent.pos.x + offX, offY, ent.pos.z + offZ);
        ent.group.rotation.set(rotX, rotY, rotZ);
        ent.group.scale.setScalar(ent._baseScale * scaleMult);
        ent._poseDirty = true;
      } else if (ent._poseDirty) {
        ent._poseDirty = false;
        ent.group.position.set(ent.pos.x, 0, ent.pos.z);
        ent.group.rotation.set(0, baseRotY, 0);
        ent.group.scale.setScalar(ent._baseScale);
      }
    };
    applyPose(this.player);
    this.remotePlayers.forEach(rp => applyPose(rp));
  }
});
// ▲▲▲ ここまで【3/4】 ▲▲▲
// ▼▼▼ ここから【4/4】 ▼▼▼
Object.assign(KaomojiMMORPG.prototype, {
  // 1. 隠しデバッグメニュー（チャット欄や名前欄に「debug777」入力で起動）
  setupSecretDebugTrigger() {
    if (this._v40DebugHooked) return;
    this._v40DebugHooked = true;
    document.addEventListener('input', (e) => {
      const val = String(e.target?.value || '').trim().toLowerCase();
      if (val === SECRET_DEBUG_CODE) {
        e.target.value = '';
        this.openSecretDebugModal();
      }
    });
  },

  openSecretDebugModal() {
    document.getElementById('kmj-secret-debug-modal')?.remove();
    const d = this.saveData || {};
    const curLv = Number(d.lv ?? d.level ?? 1);
    const curThreat = Number(d.threatRank ?? d.threat ?? 1);
    const roles = this.getAllAvailableRolesV26();

    const modal = document.createElement('div');
    modal.id = 'kmj-secret-debug-modal';
    modal.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(2,6,23,.86);display:flex;align-items:center;justify-content:center;padding:12px;';
    modal.innerHTML = `
      <div style="width:min(460px,95vw);max-height:88vh;overflow-y:auto;background:#0f172a;border:2px solid #f472b6;border-radius:14px;padding:14px;color:#f8fafc;box-shadow:0 0 30px rgba(244,114,182,.4);">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;border-bottom:1px solid #334155;padding-bottom:8px;">
          <span style="font-size:15px;font-weight:900;color:#f472b6;">🛠️ SECRET DEBUG CONSOLE (v4.0)</span>
          <button type="button" id="dbg-close-v40" style="background:#ef4444;border:none;color:#fff;font-weight:900;border-radius:6px;padding:4px 10px;cursor:pointer;">✕ 閉じる</button>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
          <div style="background:#1e293b;padding:8px;border-radius:8px;">
            <div style="font-size:11px;color:#94a3b8;font-weight:700;">プレイヤーLv (1〜999)</div>
            <div style="display:flex;gap:4px;margin-top:4px;">
              <input id="dbg-lv-inp" type="number" min="1" max="999" value="${curLv}" style="width:72px;background:#0f172a;border:1px solid #38bdf8;color:#fff;border-radius:5px;padding:3px 6px;font-weight:900;">
              <button type="button" id="dbg-lv-set" style="flex:1;background:#0284c7;border:none;color:#fff;border-radius:5px;font-weight:900;font-size:11px;cursor:pointer;">適用</button>
            </div>
          </div>
          <div style="background:#1e293b;padding:8px;border-radius:8px;">
            <div style="font-size:11px;color:#94a3b8;font-weight:700;">脅威度ランク (1〜999)</div>
            <div style="display:flex;gap:4px;margin-top:4px;">
              <input id="dbg-th-inp" type="number" min="1" max="999" value="${curThreat}" style="width:72px;background:#0f172a;border:1px solid #f43f5e;color:#fff;border-radius:5px;padding:3px 6px;font-weight:900;">
              <button type="button" id="dbg-th-set" style="flex:1;background:#e11d48;border:none;color:#fff;border-radius:5px;font-weight:900;font-size:11px;cursor:pointer;">適用</button>
            </div>
          </div>
        </div>

        <div style="background:#1e293b;padding:8px;border-radius:8px;margin-bottom:10px;">
          <div style="font-size:11px;color:#fde047;font-weight:900;margin-bottom:6px;">✨ 全スキルレベル一括変更＆全解放</div>
          <div style="display:flex;flex-wrap:wrap;gap:5px;">
            ${[1, 10, 50, 100, 999].map(lv => `<button type="button" class="dbg-sk-lv-btn" data-lv="${lv}" style="background:#312e81;border:1px solid #818cf8;color:#fff;border-radius:6px;padding:4px 9px;font-size:11px;font-weight:900;cursor:pointer;">全スキル Lv.${lv}</button>`).join('')}
          </div>
        </div>

        <div style="background:#1e293b;padding:8px;border-radius:8px;margin-bottom:10px;">
          <div style="font-size:11px;color:#38bdf8;font-weight:900;margin-bottom:6px;">🎭 役職即時変更（片手剣 ⇔ 魔導杖切替テスト）</div>
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:5px;">
            ${roles.map(r => `<button type="button" class="dbg-role-btn" data-rid="${r.id}" data-rname="${r.label}" style="background:#0f172a;border:1px solid #38bdf8;color:#e0f2fe;border-radius:6px;padding:5px 7px;font-size:11px;font-weight:800;text-align:left;cursor:pointer;">${r.icon} ${r.label}</button>`).join('')}
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
          <button type="button" id="dbg-gold-btn" style="background:#ca8a04;border:none;color:#fff;border-radius:7px;padding:7px;font-size:11px;font-weight:900;cursor:pointer;">💰 +9,999,999 G</button>
          <button type="button" id="dbg-unlock-all-btn" style="background:#7c3aed;border:none;color:#fff;border-radius:7px;padding:7px;font-size:11px;font-weight:900;cursor:pointer;">👑 全装備・ペット・実績解放</button>
          <button type="button" id="dbg-inf-btn" style="background:${this._debugInfiniteMode ? '#16a34a' : '#334155'};border:none;color:#fff;border-radius:7px;padding:7px;font-size:11px;font-weight:900;cursor:pointer;">♾️ 無敵＆MP無限: ${this._debugInfiniteMode ? 'ON' : 'OFF'}</button>
          <button type="button" id="dbg-heal-btn" style="background:#0d9488;border:none;color:#fff;border-radius:7px;padding:7px;font-size:11px;font-weight:900;cursor:pointer;">💖 HP/MP 全回復</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('dbg-close-v40').onclick = () => modal.remove();
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

    document.getElementById('dbg-lv-set').onclick = () => {
      const v = Math.max(1, Math.min(999, Number(document.getElementById('dbg-lv-inp').value) || 1));
      if (this.saveData) { this.saveData.lv = v; this.saveData.level = v; }
      if (this.player) { this.player.lv = v; this.player.level = v; }
      this.saveGame?.(false);
      this.refreshAllHUD?.();
      this.showAlertBanner?.(`🛠️ [DEBUG] プレイヤーLvを ${v} に変更しました！`, 1600);
    };

    document.getElementById('dbg-th-set').onclick = () => {
      const v = Math.max(1, Math.min(999, Number(document.getElementById('dbg-th-inp').value) || 1));
      if (this.saveData) { this.saveData.threatRank = v; this.saveData.threat = v; this.saveData.threatLevel = v; }
      this.threatRank = v;
      this.saveGame?.(false);
      this.refreshAllHUD?.();
      this.showAlertBanner?.(`🛠️ [DEBUG] 脅威度ランクを ${v} に変更しました！`, 1600);
    };

    modal.querySelectorAll('.dbg-sk-lv-btn').forEach(btn => {
      btn.onclick = () => {
        const lv = Number(btn.dataset.lv) || 1;
        if (this.saveData) {
          if (!this.saveData.skillLevels) this.saveData.skillLevels = {};
          if (!this.saveData.skillLvs) this.saveData.skillLvs = {};
          if (typeof SKILLS !== 'undefined' && SKILLS) {
            const list = Array.isArray(SKILLS) ? SKILLS : Object.values(SKILLS);
            list.forEach((sk, i) => {
              const sid = String(sk?.id || sk?.skillId || `slot_${i}`);
              this.saveData.skillLevels[sid] = lv;
              this.saveData.skillLvs[sid] = lv;
              this.saveData.skillLevels[`slot_${i}`] = lv;
            });
          }
          for (let i = 0; i < 8; i++) {
            this.saveData.skillLevels[`slot_${i}`] = lv;
            this.saveData.skillLvs[`slot_${i}`] = lv;
          }
        }
        this.syncSkillMpCostsV22();
        this.saveGame?.(false);
        this.refreshAllHUD?.();
        this.showAlertBanner?.(`✨ [DEBUG] 全スキルを Lv.${lv} に設定しました！`, 1800);
      };
    });

    modal.querySelectorAll('.dbg-role-btn').forEach(btn => {
      btn.onclick = () => {
        this.changePlayerRoleDebug(btn.dataset.rid, btn.dataset.rname);
        modal.remove();
      };
    });

    document.getElementById('dbg-gold-btn').onclick = () => {
      if (this.saveData) {
        this.saveData.gold = (Number(this.saveData.gold) || 0) + 9999999;
        if ('coins' in this.saveData) this.saveData.coins = this.saveData.gold;
      }
      this.saveGame?.(false);
      this.refreshAllHUD?.();
      this.showAlertBanner?.('💰 [DEBUG] +9,999,999G を付与しました！', 1600);
    };

    document.getElementById('dbg-unlock-all-btn').onclick = () => {
      const sd = this.saveData;
      if (!sd) return;
      sd.unlockedPetEquips = PET_EQUIPS.map(e => e.id);
      sd.unlockedRolesV40 = roles.map(r => r.id);
      if (typeof ACHIEVEMENTS !== 'undefined' && ACHIEVEMENTS) {
        if (!sd.achievements || typeof sd.achievements !== 'object' || Array.isArray(sd.achievements)) sd.achievements = {};
        const list = Array.isArray(ACHIEVEMENTS) ? ACHIEVEMENTS : Object.entries(ACHIEVEMENTS).map(([k, v]) => ({ id: k, ...(typeof v === 'object' ? v : {}) }));
        list.forEach((a, idx) => {
          const aid = String(a.id || a.achId || `ach_${idx}`);
          sd.achievements[aid] = true;
          a.unlocked = true;
          a.completed = true;
        });
      }
      if (typeof PETS !== 'undefined' && PETS) {
        if (!sd.ownedPets) sd.ownedPets = {};
        const plist = Array.isArray(PETS) ? PETS : Object.values(PETS);
        plist.forEach(p => { if (p?.id) sd.ownedPets[p.id] = { ...p, lv: 99 }; });
      }
      this.syncAchievementPassiveBuffsV40();
      this.saveGame?.(false);
      this.refreshAllHUD?.();
      this.showAlertBanner?.('👑 [DEBUG] 全ペット装備・全役職・全実績をコンプリート解放しました！', 2200);
    };

    document.getElementById('dbg-inf-btn').onclick = (e) => {
      this._debugInfiniteMode = !this._debugInfiniteMode;
      e.target.style.background = this._debugInfiniteMode ? '#16a34a' : '#334155';
      e.target.textContent = `♾️ 無敵＆MP無限: ${this._debugInfiniteMode ? 'ON' : 'OFF'}`;
    };

    document.getElementById('dbg-heal-btn').onclick = () => {
      if (this.player) {
        this.player.hp = this.player.maxHp || 9999;
        this.player.mp = this.player.maxMp || 9999;
      }
      this.refreshAllHUD?.();
      this.showAlertBanner?.('💖 HP・MPを全回復しました！', 1400);
    };
  },

  // 2. タブUI拡張（進化・ゴールド転職 / ペット装備＆名前変更 / 実績コンプリート常時パッシブバフ）
  injectV40TabEnhancements() {
    this.purgeRebirthUIV27();
    const d = this.saveData || {};
    const curGold = Number(d.gold ?? d.coins ?? d.money ?? 0);

    // A. 進化・転職タブ（ゴールドでいつでも転職＆片手剣⇔魔導杖自動切替）
    const evoContainer = document.querySelector('#tab-evolution, #panel-evolution, #evolution-panel, [data-tab-panel="evolution"], [data-panel="evolution"]');
    if (evoContainer) {
      let jobBox = document.getElementById('kmj-gold-role-box-v40');
      if (!jobBox) {
        jobBox = document.createElement('div');
        jobBox.id = 'kmj-gold-role-box-v40';
        jobBox.style.cssText = 'background:rgba(15,23,42,.95);border:1.5px solid #38bdf8;border-radius:10px;padding:10px;margin-bottom:10px;';
        evoContainer.insertBefore(jobBox, evoContainer.firstChild);
      }
      const curRoleId = String(d.evolutionId ?? d.jobId ?? '');
      const unlocked = Array.isArray(d.unlockedRolesV40) ? d.unlockedRolesV40 : [''];
      const roles = this.getAllAvailableRolesV26();
      const sig = `${curRoleId}|${curGold}|${unlocked.join(',')}`;
      if (jobBox.dataset.sig !== sig) {
        jobBox.dataset.sig = sig;
        jobBox.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
            <span style="font-size:12px;font-weight:900;color:#7dd3fc;">🎭 ギルド転職所（ゴールドでいつでも転職可能）</span>
            <span style="font-size:11px;font-weight:900;color:#fde047;">💰 ${curGold.toLocaleString()} G</span>
          </div>
          <div style="font-size:10px;color:#cbd5e1;margin-bottom:8px;">
            ※ <b>戦士系</b>は「🗡️片手剣」、<b>魔道士・賢者系</b>は「🪄魔導杖（通常攻撃が魔法弾＆魔法攻撃判定）」へ自動切替されます！
          </div>
          <div class="kmj-role-grid-2col">
            ${roles.map(r => {
              const isCur = curRoleId === r.id;
              const isFree = r.cost <= 0 || unlocked.includes(r.id);
              const wBadge = r.weaponType === 'staff'
                ? '<span style="background:#581c87;color:#f5d0fe;padding:1px 5px;border-radius:4px;font-size:9px;">🪄 杖・魔法攻撃</span>'
                : '<span style="background:#1e3a8a;color:#bae6fd;padding:1px 5px;border-radius:4px;font-size:9px;">🗡️ 片手剣</span>';
              const btnTxt = isCur ? '✅ 現在の役職' : (isFree ? '🔄 無料で転職' : `💰 ${r.cost.toLocaleString()}G で転職`);
              const btnBg = isCur ? '#059669' : (isFree ? '#0284c7' : (curGold >= r.cost ? '#d97706' : '#334155'));
              return `
                <div style="background:#1e293b;border:1.5px solid ${isCur ? '#34d399' : '#334155'};border-radius:8px;padding:7px;display:flex;flex-direction:column;justify-content:space-between;gap:4px;">
                  <div>
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:4px;">
                      <span style="font-size:11px;font-weight:900;color:#fff;">${r.icon} ${r.label}</span>
                      ${wBadge}
                    </div>
                    <div style="font-size:9.5px;color:#94a3b8;line-height:1.3;margin-top:3px;">${r.desc}</div>
                  </div>
                  <button type="button" class="btn-role-change-v40" data-role-id="${r.id}" ${isCur ? 'disabled' : ''} style="width:100%;background:${btnBg};border:none;color:#fff;border-radius:5px;padding:4px 6px;font-size:10px;font-weight:900;cursor:${isCur ? 'default' : 'pointer'};">${btnTxt}</button>
                </div>
              `;
            }).join('')}
          </div>
        `;
        jobBox.querySelectorAll('.btn-role-change-v40').forEach(btn => {
          btn.onclick = () => {
            this.changePlayerRoleGoldV40(btn.dataset.roleId);
            this.injectV40TabEnhancements();
          };
        });
      }
    }

    // B. ペットタブ（ペット名前カスタム＋ペット装備8種ショップ＆装着）
    const petContainer = document.querySelector('#tab-pet, #tab-pets, #panel-pet, #pet-panel, [data-tab-panel="pet"], [data-tab-panel="pets"]');
    if (petContainer) {
      let petBox = document.getElementById('kmj-pet-equip-box-v40');
      if (!petBox) {
        petBox = document.createElement('div');
        petBox.id = 'kmj-pet-equip-box-v40';
        petBox.style.cssText = 'background:rgba(15,23,42,.95);border:1.5px solid #f472b6;border-radius:10px;padding:10px;margin-bottom:10px;';
        petContainer.insertBefore(petBox, petContainer.firstChild);
      }
      const petInfo = this.getMyPetSyncInfo() || { petId: 'default_pet', name: '相棒ペット', kaomoji: '(・ω・)', equipId: 'none' };
      const unlockedEq = Array.isArray(d.unlockedPetEquips) ? d.unlockedPetEquips : ['none'];
      const sig = `${petInfo.petId}|${petInfo.name}|${petInfo.equipId}|${curGold}|${unlockedEq.join(',')}`;
      if (petBox.dataset.sig !== sig) {
        petBox.dataset.sig = sig;
        petBox.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
            <span style="font-size:12px;font-weight:900;color:#f472b6;">🐾 相棒の名前変更＆3Dペット装備</span>
            <span style="font-size:11px;font-weight:900;color:#fde047;">💰 ${curGold.toLocaleString()} G</span>
          </div>
          <div style="display:flex;gap:5px;margin-bottom:8px;">
            <input id="inp-pet-name-v40" type="text" maxlength="14" value="${petInfo.name.replace(/"/g, '&quot;')}" placeholder="ペットの名前(最大14文字)" style="flex:1;background:#1e293b;border:1px solid #38bdf8;color:#fff;border-radius:6px;padding:4px 8px;font-size:11px;font-weight:800;">
            <button type="button" id="btn-pet-name-save-v40" style="background:#0284c7;border:none;color:#fff;border-radius:6px;padding:4px 10px;font-size:11px;font-weight:900;cursor:pointer;">名前保存</button>
          </div>
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:5px;">
            ${PET_EQUIPS.map(eq => {
              const isEquipped = petInfo.equipId === eq.id;
              const isOwned = eq.cost <= 0 || unlockedEq.includes(eq.id);
              const label = isEquipped ? '✅ 装着中' : (isOwned ? '装備する' : `💰 ${eq.cost.toLocaleString()}G`);
              const bg = isEquipped ? '#059669' : (isOwned ? '#0284c7' : (curGold >= eq.cost ? '#d97706' : '#334155'));
              return `
                <div style="background:#1e293b;border:1px solid ${isEquipped ? '#34d399' : '#334155'};border-radius:7px;padding:6px;display:flex;flex-direction:column;justify-content:space-between;gap:3px;">
                  <div>
                    <div style="font-size:11px;font-weight:900;color:#fff;">${eq.icon} ${eq.name}</div>
                    <div style="font-size:9px;color:#94a3b8;">${eq.desc}</div>
                  </div>
                  <button type="button" class="btn-pet-eq-v40" data-eq-id="${eq.id}" style="background:${bg};border:none;color:#fff;border-radius:5px;padding:3px 6px;font-size:10px;font-weight:900;cursor:pointer;">${label}</button>
                </div>
              `;
            }).join('')}
          </div>
        `;
        document.getElementById('btn-pet-name-save-v40').onclick = () => {
          const val = document.getElementById('inp-pet-name-v40').value;
          this.setPetCustomName(petInfo.petId, val);
          this.injectV40TabEnhancements();
        };
        petBox.querySelectorAll('.btn-pet-eq-v40').forEach(btn => {
          btn.onclick = () => {
            this.buyOrEquipPetItem(petInfo.petId, btn.dataset.eqId);
            this.injectV40TabEnhancements();
          };
        });
      }
    }

    // C. 実績タブ（実績達成数＆コンプリート常時パッシブバフ表示パネル）
    const achContainer = document.querySelector('#tab-achievements, #tab-achievement, #panel-achievements, #achievements-panel, [data-tab-panel="achievements"], [data-tab-panel="achievement"]');
    if (achContainer) {
      let achBanner = document.getElementById('kmj-ach-passive-banner-v40');
      if (!achBanner) {
        achBanner = document.createElement('div');
        achBanner.id = 'kmj-ach-passive-banner-v40';
        achBanner.className = 'kmj-ach-passive-banner';
        achContainer.insertBefore(achBanner, achContainer.firstChild);
      }
      const sum = this.syncAchievementPassiveBuffsV40();
      const pct = sum.total > 0 ? Math.min(100, Math.round((sum.unlockedCount / sum.total) * 100)) : 0;
      const sig = `${sum.unlockedCount}/${sum.total}|${sum.isComplete}`;
      if (achBanner.dataset.sig !== sig) {
        achBanner.dataset.sig = sig;
        achBanner.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
            <span style="font-size:12px;font-weight:900;color:#fde047;">🏆 実績コンプリート＆常時パッシブバフ</span>
            <span style="font-size:11px;font-weight:900;color:#38bdf8;">達成: ${sum.unlockedCount} / ${sum.total} (${pct}%)</span>
          </div>
          <div style="width:100%;height:7px;background:#0f172a;border-radius:999px;overflow:hidden;margin-bottom:6px;">
            <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,#38bdf8,#f472b6,#fde047);"></div>
          </div>
          <div style="font-size:10.5px;color:#f8fafc;font-weight:800;line-height:1.45;">
            ✨ 現在の常時パッシブ効果：<span style="color:#4ade80;">ATK/MATK/DEF +${Math.round(sum.statBonusPct * 100)}%</span> ・
            <span style="color:#38bdf8;">最大HP +${Math.round(sum.hpBonusPct * 100)}%</span> ・
            <span style="color:#fde047;">獲得EXP/GOLD +${Math.round(sum.rewardBonusPct * 100)}%</span>
          </div>
          <div style="margin-top:5px;padding:4px 7px;border-radius:6px;font-size:10px;font-weight:900;background:${sum.isComplete ? 'rgba(234,179,8,.22)' : 'rgba(30,41,59,.85)'};color:${sum.isComplete ? '#fef08a' : '#94a3b8'};">
            ${sum.isComplete
              ? '👑【全実績コンプリート達成！】永続パッシブ「創世神話の覇者（全ステ+35%・HP+40%・報酬+50%）」発動中！'
              : '🔒 全実績コンプリート報酬：永続パッシブ「創世神話の覇者（全ステ+35%・HP+40%・報酬+50%）」が解放！'}
          </div>
        `;
      }
    }
  },

  // 3. マルチプレイMQTT同期（役職・武器・ペット・チャット・エモート・スキル）
  initMultiplayerMQTT() {
    if (this._mqttStarted) return;
    this._mqttStarted = true;
    if (!this.remotePlayers) this.remotePlayers = new Map();
    this._myClientId = this._myClientId || ('kmj_' + Math.random().toString(36).slice(2, 10));

    const connectBroker = (srvIdx = 0) => {
      if (typeof window.mqtt === 'undefined') return;
      const srv = MQTT_SERVERS[srvIdx % MQTT_SERVERS.length];
      try {
        const client = window.mqtt.connect(srv.url, {
          clientId: this._myClientId + '_' + Date.now().toString(36),
          clean: true,
          reconnectPeriod: 4000,
          connectTimeout: 8000
        });
        this._mqttClient = client;
        client.on('connect', () => {
          client.subscribe(TOPIC_GLOBAL);
          this.broadcastPlayerPacket('sync');
        });
        client.on('message', (_topic, payload) => {
          try {
            const msg = JSON.parse(payload.toString());
            this.handleIncomingPacket(msg);
          } catch (e) {}
        });
        client.on('error', () => {
          try { client.end(true); } catch (e) {}
          if (srvIdx + 1 < MQTT_SERVERS.length) setTimeout(() => connectBroker(srvIdx + 1), 1500);
        });
      } catch (e) {}
    };

    if (typeof window.mqtt !== 'undefined') {
      connectBroker(0);
    } else {
      const loadScript = (idx = 0) => {
        if (idx >= MQTT_CDNS.length) return;
        const sc = document.createElement('script');
        sc.src = MQTT_CDNS[idx];
        sc.onload = () => connectBroker(0);
        sc.onerror = () => loadScript(idx + 1);
        document.head.appendChild(sc);
      };
      loadScript(0);
    }
  },

  getRoomChannelKey() {
    const d = this.saveData || {};
    if (d.roomPassEnabled && String(d.roomPassword || '').trim()) {
      return 'ROOM_' + String(d.roomPassword).trim();
    }
    return 'GLOBAL';
  },

  broadcastPlayerPacket(type = 'sync', extra = {}) {
    if (!this._mqttClient || !this._mqttClient.connected || !this.player) return;
    const d = this.saveData || {};
    const pkt = {
      type,
      uid: this._myClientId,
      room: this.getRoomChannelKey(),
      name: String(d.name || d.playerName || '冒険者'),
      kaomoji: this.getBasePlayerKaomoji ? this.getBasePlayerKaomoji() : (d.kaomoji || '(・ω・)'),
      lv: Number(d.lv || this.player.lv || 1),
      evolutionId: String(d.evolutionId ?? d.jobId ?? ''),
      weaponId: String(d.equippedWeapon || d.weaponId || 'wpn_wood'),
      weaponEnhance: Number(d.weaponEnhance || 0),
      x: Number(this.player.pos?.x || 0),
      z: Number(this.player.pos?.z || 0),
      rotY: Number(this.player.rotY || 0),
      pet: this.getMyPetSyncInfo(),
      ts: Date.now(),
      ...extra
    };
    try {
      this._mqttClient.publish(TOPIC_GLOBAL, JSON.stringify(pkt));
    } catch (e) {}
  },

  syncFirebaseNow(immediate = false) {
    if (immediate || !this._lastMqttSync || (performance.now() - this._lastMqttSync) > 180) {
      this._lastMqttSync = performance.now();
      this.broadcastPlayerPacket('sync');
    }
  },

  handleIncomingPacket(pkt) {
    if (!pkt || !pkt.uid || pkt.uid === this._myClientId) return;
    const sameRoom = (pkt.room || 'GLOBAL') === this.getRoomChannelKey();

    if (pkt.type === 'chat') {
      if (pkt.channel === 'global' || sameRoom) {
        this.addChatMessage?.(pkt.channel || 'global', pkt.kaomoji || '(・ω・)', pkt.name || '冒険者', pkt.text || '', false);
        if (sameRoom) this.spawnHeadBubble(false, pkt.uid, pkt.kaomoji, pkt.text, false);
      }
      return;
    }

    if (!sameRoom) {
      const old = this.remotePlayers?.get(pkt.uid);
      if (old) {
        if (old.group && this.scene) this.scene.remove(old.group);
        if (old.petGroup && this.scene) this.scene.remove(old.petGroup);
        this.remotePlayers.delete(pkt.uid);
      }
      return;
    }

    if (!this.remotePlayers) this.remotePlayers = new Map();
    let rp = this.remotePlayers.get(pkt.uid);
    if (!rp) {
      rp = {
        uid: pkt.uid,
        pos: new THREE.Vector3(pkt.x || 0, 0, pkt.z || 0),
        targetPos: new THREE.Vector3(pkt.x || 0, 0, pkt.z || 0),
        rotY: pkt.rotY || 0,
        visible: true,
        lastSeen: performance.now()
      };
      if (this.useWebGL && this.scene && typeof THREE !== 'undefined') {
        const g = new THREE.Group();
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.15, 0.75), new THREE.MeshLambertMaterial({ color: 0x38bdf8 }));
        body.position.y = 0.85;
        g.add(body);
        g.position.copy(rp.pos);
        this.scene.add(g);
        rp.group = g;
      }
      this.remotePlayers.set(pkt.uid, rp);
    }

    rp.lastSeen = performance.now();
    rp.visible = true;
    rp.name = pkt.name;
    rp.kaomoji = pkt.kaomoji;
    rp.lv = pkt.lv;
    rp.evolutionId = pkt.evolutionId;
    rp.targetPos.set(pkt.x || 0, 0, pkt.z || 0);
    rp.rotY = pkt.rotY || 0;

    if (rp.group) {
      this.enforceStrictWeaponVisualV27(rp, pkt.evolutionId);
    }

    // 他プレイヤーのペット＆ペット装備同期
    if (pkt.pet && this.useWebGL && this.scene) {
      const pSig = `${pkt.pet.petId}|${pkt.pet.kaomoji}|${pkt.pet.color}|${pkt.pet.equipId}`;
      if (rp._petSig !== pSig) {
        rp._petSig = pSig;
        if (rp.petGroup) this.scene.remove(rp.petGroup);
        rp.petGroup = this.buildRemotePetMesh(pkt.pet);
        rp.petGroup.position.set(rp.pos.x + 1.2, 0, rp.pos.z + 1.2);
        this.scene.add(rp.petGroup);
      }
    } else if (!pkt.pet && rp.petGroup) {
      this.scene?.remove(rp.petGroup);
      rp.petGroup = null;
      rp._petSig = '';
    }

    if (pkt.type === 'emote' && pkt.emote) {
      this.playSyncedEmote(false, pkt.uid, pkt.emote);
    } else if (pkt.type === 'attack') {
      this.triggerAttackVisual(rp, Boolean(pkt.isSkill), { ...(pkt.skillInfo || {}), isMage: this.isMageEvolution(pkt.evolutionId) });
    }
  },

  updateRemotePlayers(dt) {
    if (!this.remotePlayers) return;
    const now = performance.now();
    this.remotePlayers.forEach((rp, uid) => {
      if (now - rp.lastSeen > 12000) {
        if (rp.group && this.scene) this.scene.remove(rp.group);
        if (rp.petGroup && this.scene) this.scene.remove(rp.petGroup);
        this.remotePlayers.delete(uid);
        return;
      }
      rp.pos.lerp(rp.targetPos, Math.min(1, dt * 10));
      if (rp.group && !rp._poseDirty) {
        rp.group.position.set(rp.pos.x, 0, rp.pos.z);
        rp.group.rotation.y = rp.rotY;
      }
      if (rp.petGroup) {
        const tx = rp.pos.x - Math.sin(rp.rotY) * 1.3 + Math.cos(rp.rotY) * 0.9;
        const tz = rp.pos.z - Math.cos(rp.rotY) * 1.3 - Math.sin(rp.rotY) * 0.9;
        rp.petGroup.position.x += (tx - rp.petGroup.position.x) * Math.min(1, dt * 6);
        rp.petGroup.position.z += (tz - rp.petGroup.position.z) * Math.min(1, dt * 6);
        rp.petGroup.rotation.y = rp.rotY;
      }
    });
  },

  // 4. 全メソッド・メインループ統合フック
  installV40Hooks() {
    if (this._v40Installed) return;
    this._v40Installed = true;

    const proto = KaomojiMMORPG.prototype;

    // ステータス計算フック（役職倍率 ＋ ペット装備バフ ＋ 極光の聖域バフ ＋ 実績常時パッシブバフ）
    if (typeof proto.getPlayerStats === 'function' && !proto._v40StatsWrapped) {
      const origStats = proto.getPlayerStats;
      proto.getPlayerStats = function (...args) {
        const st = origStats.apply(this, args) || {};
        const d = this.saveData || {};
        const roles = this.getAllAvailableRolesV26();
        const curRole = roles.find(r => r.id === String(d.evolutionId ?? d.jobId ?? '')) || roles[0];
        const petEq = this.getPetEquipDef(this.getEquippedPetEquipId());
        const achSum = this.syncAchievementPassiveBuffsV40();
        const sancMult = this._inSanctuaryBuff ? (1 + 0.12 + (this._sanctuaryBuffLv || 1) * 0.01) : 1.0;

        const atkMult = (curRole?.atkMult || 1.0) * (1 + (petEq.atkPct || 0) + achSum.statBonusPct) * sancMult;
        const matkMult = (curRole?.matkMult || 1.0) * (1 + (petEq.atkPct || 0) + achSum.statBonusPct) * sancMult;
        const defMult = (curRole?.defMult || 1.0) * (1 + (petEq.defPct || 0) + achSum.statBonusPct) * sancMult;
        const hpMult = (curRole?.hpMult || 1.0) * (1 + (petEq.hpPct || 0) + achSum.hpBonusPct);
        const spdMult = (1 + (petEq.spdPct || 0)) * (this._inSanctuaryBuff ? 1.15 : 1.0);

        if (typeof st.atk === 'number') st.atk = Math.max(1, Math.floor(st.atk * atkMult));
        if (typeof st.matk === 'number') st.matk = Math.max(1, Math.floor(st.matk * matkMult));
        if (typeof st.mAtk === 'number') st.mAtk = Math.max(1, Math.floor(st.mAtk * matkMult));
        if (typeof st.def === 'number') st.def = Math.max(0, Math.floor(st.def * defMult));
        if (typeof st.maxHp === 'number') st.maxHp = Math.max(20, Math.floor(st.maxHp * hpMult));
        if (typeof st.spd === 'number') st.spd = Number((st.spd * spdMult).toFixed(2));
        return st;
      };
      proto._v40StatsWrapped = true;
    }

    // 通常攻撃フック（魔道士系の杖攻撃＆マルチ送信）
    ['basicAttack', 'playerAttack', 'performAttack', 'attack'].forEach(fn => {
      if (typeof proto[fn] === 'function' && !proto[`_v40_${fn}`]) {
        const orig = proto[fn];
        proto[fn] = function (...args) {
          const isMage = this.isMageEvolution();
          if (isMage && this.player) {
            this.triggerAttackVisual(this.player, false, { isMage: true });
            this.broadcastPlayerPacket('attack', { isSkill: false, skillInfo: { isMage: true } });
            return true;
          }
          const res = orig.apply(this, args);
          if (this.player) {
            this.triggerAttackVisual(this.player, false);
            this.broadcastPlayerPacket('attack', { isSkill: false });
          }
          return res;
        };
        proto[`_v40_${fn}`] = true;
      }
    });

    // スキル発動フック（MP同期・豪華3Dスキル演出・マルチ送信）
    ['useSkill', 'castSkill', 'activateSkill', 'triggerSkill'].forEach(fn => {
      if (typeof proto[fn] === 'function' && !proto[`_v40_${fn}`]) {
        const orig = proto[fn];
        proto[fn] = function (slotOrId, ...rest) {
          this.syncSkillMpCostsV22();
          if (this._debugInfiniteMode && this.player) {
            this.player.mp = this.player.maxMp || 9999;
          }
          const slotIdx = typeof slotOrId === 'number' ? slotOrId : 0;
          const meta = this.resolveSkillMeta(slotIdx);
          const res = orig.apply(this, [slotOrId, ...rest]);
          if (res !== false && this.player) {
            this.triggerAttackVisual(this.player, true, meta);
            this.broadcastPlayerPacket('attack', { isSkill: true, skillInfo: meta });
          }
          return res;
        };
        proto[`_v40_${fn}`] = true;
      }
    });

    // チャット送信フック（頭上吹き出し＆MQTT配信）
    if (typeof proto.sendChat === 'function' && !proto._v40ChatWrapped) {
      const origChat = proto.sendChat;
      proto.sendChat = function (...args) {
        const inp = document.querySelector('#chat-input, #input-chat-msg, #chat-panel input[type="text"]');
        const txt = String(args[0] ?? inp?.value ?? '').trim();
        if (txt.toLowerCase() === SECRET_DEBUG_CODE) {
          if (inp) inp.value = '';
          this.openSecretDebugModal();
          return;
        }
        const res = origChat.apply(this, args);
        if (txt) {
          const kao = this.getBasePlayerKaomoji ? this.getBasePlayerKaomoji() : (this.saveData?.kaomoji || '(・ω・)');
          const nm = this.saveData?.name || this.saveData?.playerName || '冒険者';
          const ch = this.chatChannel || (this.saveData?.roomPassEnabled ? 'room' : 'global');
          this.spawnHeadBubble(true, 'SELF', kao, txt, false);
          this.broadcastPlayerPacket('chat', { channel: ch, kaomoji: kao, name: nm, text: txt });
        }
        return res;
      };
      proto._v40ChatWrapped = true;
    }

    // HUD・タブ更新フック
    if (typeof proto.refreshAllHUD === 'function' && !proto._v40HudWrapped) {
      const origHud = proto.refreshAllHUD;
      proto.refreshAllHUD = function (...args) {
        this.enforce999CapsV27();
        this.syncMageWeaponNamesV22();
        this.syncSkillMpCostsV22();
        this.syncAchievementPassiveBuffsV40();
        const res = origHud.apply(this, args);
        this.injectV40TabEnhancements();
        this.fixChatCompactLayoutV31();
        return res;
      };
      proto._v40HudWrapped = true;
    }

    // メインフレーム更新ループ統合
    if (typeof proto.update === 'function' && !proto._v40UpdateWrapped) {
      const origUpdate = proto.update;
      proto.update = function (dt = 0.016, ...rest) {
        const safeDt = Math.min(0.1, Math.max(0.001, Number(dt) || 0.016));
        this.enforce999CapsV27();
        if (this._debugInfiniteMode && this.player) {
          this.player.hp = this.player.maxHp || 9999;
          this.player.mp = this.player.maxMp || 9999;
        }
        const res = origUpdate.apply(this, [dt, ...rest]);
        this.rebuildMonstersAs3DMonsters(safeDt);
        this.updateMonsterStatusVisuals(safeDt);
        this.syncLocalPetAppearance();
        if (this.player) this.enforceStrictWeaponVisualV27(this.player);
        this.updateMageBasicMagicShots(safeDt);
        this.updateSanctuaryFields(safeDt);
        this.updateCharacterAnimations(safeDt);
        this.updateHeadBubbles(safeDt);
        this.updateRemotePlayers(safeDt);
        this.syncFirebaseNow(false);
        return res;
      };
      proto._v40UpdateWrapped = true;
    }

    // 初期化フック
    if (typeof proto.init === 'function' && !proto._v40InitWrapped) {
      const origInit = proto.init;
      proto.init = function (...args) {
        const res = origInit.apply(this, args);
        this.showLoadingOverlay('KAOMOJI FANTASY 3D LOADING...', 850);
        this.setupSecretDebugTrigger();
        this.initChatFreeTransform();
        this.fixChatCompactLayoutV31();
        this.syncSkillDescriptionsAndEffects();
        this.syncSkillMpCostsV22();
        this.syncMageWeaponNamesV22();
        this.syncAchievementPassiveBuffsV40();
        this.injectV40TabEnhancements();
        this.initMultiplayerMQTT();
        this.bindEmoteButtonsV40();
        return res;
      };
      proto._v40InitWrapped = true;
    }
  },

  bindEmoteButtonsV40() {
    if (this._v40EmoteBound) return;
    this._v40EmoteBound = true;
    document.addEventListener('click', (e) => {
      const item = e.target?.closest?.('.emote-item, .emote-btn, [data-emote]');
      if (!item) return;
      const all = [...document.querySelectorAll('.emote-item, .emote-btn, [data-emote]')];
      const idx = all.indexOf(item);
      const info = this.classifyEmoteItem(item, idx);
      this.playSyncedEmote(true, 'SELF', info);
      this.broadcastPlayerPacket('emote', { emote: info });
    });
  }
});

// スクリプト読込時に即座に全フックを適用＆既存インスタンスにも反映
KaomojiMMORPG.prototype.installV40Hooks();
setTimeout(() => {
  const inst = window.game || window.app || window.mmorpg;
  if (inst && typeof inst.initChatFreeTransform === 'function') {
    inst.setupSecretDebugTrigger();
    inst.initChatFreeTransform();
    inst.fixChatCompactLayoutV31();
    inst.syncSkillDescriptionsAndEffects();
    inst.syncSkillMpCostsV22();
    inst.syncMageWeaponNamesV22();
    inst.syncAchievementPassiveBuffsV40();
    inst.injectV40TabEnhancements();
    inst.initMultiplayerMQTT();
    inst.bindEmoteButtonsV40();
    inst.refreshAllHUD?.();
  }
}, 250);
// ▲▲▲ ここまで【4/4】 ▲▲▲
