// boot.js — index.html の game9.js の「後」に読み込むこと
//   <script src="boot.js?v=1"></script>
//
// 1) ゲーム本体(KaomojiMMORPG)をページ読み込み時に必ず1回だけ生成する。
//    これが無いと、タイトルの「冒険を始める」で本物の enterGameFromTitle() が呼ばれず、
//    inTitleScreen が true のまま → update() が毎フレーム早期returnして、
//    キャラも敵も一切動かない。
// 2) 右上・左上・右下で重なっているUIを、空いている上下中央へ逃がす。
(function () {
  'use strict';

  // ---------- 1. 起動 ----------
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
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // ---------- 2. UIの重なり解消 ----------
  const st = document.createElement('style');
  st.id = 'kmj-boot-ui-fix';
  st.textContent = `
    /* 脅威バー: 左上のHP/MPバーと重なる → 上部中央へ */
    #kmj-v8-threat-bar {
      top: 8px !important; left: 50% !important; right: auto !important;
      transform: translateX(-50%) !important;
    }
    /* オンライン状態ピル: 右上のステージ表示と重なる → 脅威バーの下(上部中央)へ */
    #kmj-v45-online-pill, .kmj-v45-online-pill {
      top: 44px !important; right: auto !important; left: 50% !important;
      transform: translateX(-50%) !important;
    }
    /* DEBUG / スキルスタジオ: 右上の操作ボタンと重なる → 下部中央へ */
    #kmj-v7-debug-hud {
      top: auto !important; right: auto !important;
      bottom: 8px !important; left: 50% !important;
      transform: translateX(-50%) !important;
    }
    /* 魔法進化: 右下の攻撃/スキルボタンと重なる → DEBUGの上(下部中央)へ */
    #kmj-v9-studio-open-btn {
      right: auto !important; left: 50% !important; bottom: 44px !important;
      transform: translateX(-50%) !important;
    }
  `;
  (document.head || document.documentElement).appendChild(st);
})();
