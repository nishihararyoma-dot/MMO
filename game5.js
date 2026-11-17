'use strict';

// =========================================================================
// 顔文字ファンタジー3D 全育成・鍛冶錬金・見た目・ntfyオンラインUI (game5.js)
// =========================================================================

Object.assign(KaomojiMMORPG.prototype, {

    canEvolveTo(evo) {
        const d = this.saveData;
        if (d.lv < evo.reqLv) return false;
        if (evo.reqEvo && d.evolutionId !== evo.reqEvo) return false;
        for (const [mk, cnt] of Object.entries(evo.reqMat || {})) {
            if ((d.materials[mk] || 0) < cnt) return false;
        }
        return true;
    },

    openGrowthModal(tab = 'stats') {
        this.activeTab = tab;
        this.isModalOpen = true;
        document.getElementById('hud-drawer-menu')?.classList.add('hidden');
        document.getElementById('emote-palette')?.classList.add('hidden');
        document.getElementById('growth-modal')?.classList.remove('hidden');
        this.renderModalContent();
    },

    closeGrowthModal() {
        this.isModalOpen = false;
        document.getElementById('growth-modal')?.classList.add('hidden');
        this.refreshAllHUD();
    },

    openDialog(title, message, buttons) {
        const modal = document.getElementById('dialog-modal');
        document.getElementById('dialog-title').textContent = title;
        document.getElementById('dialog-message').textContent = message;
        const btnWrap = document.getElementById('dialog-buttons');
        btnWrap.innerHTML = '';
        buttons.forEach(b => {
            const btn = document.createElement('button');
            btn.className = `btn-ui ${b.primary ? 'btn-amber' : 'btn-slate'}`;
            btn.textContent = b.text;
            btn.addEventListener('click', () => {
                modal.classList.add('hidden');
                if (b.onClick) b.onClick();
            });
            btnWrap.appendChild(btn);
        });
        modal.classList.remove('hidden');
    },

    formatMatReqHtml(mats) {
        const d = this.saveData;
        const entries = Object.entries(mats || {});
        if (entries.length === 0) return '<span style="color:#94a3b8;">なし</span>';
        return entries.map(([mk, c]) => {
            const have = d.materials[mk] || 0;
            const m = MATERIALS[mk];
            return `<span style="color:${have >= c ? '#34d399' : '#fb7185'};">${m.icon}${m.name} ${have}/${c}</span>`;
        }).join(' / ');
    },

    hasEnoughMats(mats) {
        const d = this.saveData;
        return Object.entries(mats || {}).every(([mk, c]) => (d.materials[mk] || 0) >= c);
    },

    consumeMats(mats) {
        const d = this.saveData;
        for (const [mk, c] of Object.entries(mats || {})) {
            d.materials[mk] = Math.max(0, (d.materials[mk] || 0) - c);
        }
    },

    renderModalContent() {
        const d = this.saveData;
        const st = this.calcDerivedStats();
        const evo = EVOLUTIONS[d.evolutionId] || EVOLUTIONS.novice;
        const hasAchAlert = this.hasClaimableAchievement();

        const tabs = [
            { id: 'online',     label: `🌐 オンライン･部屋${this.fbConnected ? '●' : ''}` },
            { id: 'travel',     label: '🗺️ ステージ･塔' },
            { id: 'appearance', label: '🐱 見た目･色･翼' },
            { id: 'forge',      label: '⚒️ 鍛冶･錬金･付与' },
            { id: 'stats',      label: `📊 ステ振り${d.ap > 0 ? `(${d.ap})` : ''}` },
            { id: 'skills',     label: `📘 スキル${d.sp > 0 ? `(${d.sp})` : ''}` },
            { id: 'tree',       label: `🌳 ツリー${d.sp > 0 ? `(${d.sp})` : ''}` },
            { id: 'pet',        label: '🐾 相棒ペット' },
            { id: 'evolve',     label: '👑 進化･神話･転生' },
            { id: 'achieve',    label: `🏆 実績･称号${hasAchAlert ? '!' : ''}` }
        ];

        const tabBar = document.getElementById('modal-tabs');
        tabBar.innerHTML = tabs.map(t => `
            <button class="tab-chip-btn ${this.activeTab === t.id ? 'active' : ''}" data-tab="${t.id}">${t.label}</button>
        `).join('');
        tabBar.querySelectorAll('.tab-chip-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.activeTab = btn.dataset.tab;
                this.renderModalContent();
            });
        });

        const body = document.getElementById('modal-body');

        if (this.activeTab === 'online') {
            const remotes = Array.from(this.remotePlayers.values());
            const isOnline = !!d.onlineEnabled;
            const isPassOn = !!d.roomPassEnabled;

            body.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <!-- 1. ワンタッチ オンライン / オフライン切替 ＆ パスワード部屋 -->
                    <div class="card-box" style="border-color:${this.fbConnected ? '#10b981' : '#38bdf8'};">
                        <div class="flex-between" style="flex-wrap:wrap; margin-bottom:8px;">
                            <div>
                                <div style="font-size:13px; font-weight:900; color:#38bdf8;">🌐 オンラインマルチ共闘（ntfy高速通信）</div>
                                <div style="font-size:11px; color:${this.fbConnected ? '#34d399' : '#94a3b8'}; font-weight:900; margin-top:2px;">
                                    状態: ${this.fbConnected ? `● オンライン接続中（同じ部屋: ${1 + remotes.length}人）` : '📴 オフライン（右のボタンで即接続！）'}
                                </div>
                                <div style="font-size:10px; color:#7dd3fc; margin-top:2px;">
                                    ✨ アカウント登録・URL入力不要！ボタン1つでみんなと共闘＆チャットできます
                                </div>
                            </div>
                            <button id="m-btn-toggle-online" class="btn-ui ${isOnline ? 'btn-emerald' : 'btn-slate'}" style="padding:10px 14px; font-size:12px;">
                                ${isOnline ? '🌐 オンライン: ON' : '📴 オフライン: OFF'}
                            </button>
                        </div>

                        <div class="card-box" style="background:rgba(15,23,42,0.75); border-color:${isPassOn ? '#f59e0b' : '#334155'};">
                            <div class="flex-between" style="flex-wrap:wrap; margin-bottom:6px;">
                                <div>
                                    <div style="font-size:12px; font-weight:900; color:#fde047;">🔒 パスワード部屋（合言葉ロック）</div>
                                    <div style="font-size:10px; color:#cbd5e1;">
                                        ${isPassOn
                                            ? '🔒 ON中：同じパスワードを設定した人だけ表示・共闘・部屋チャットができます'
                                            : '🔓 OFF中：オンラインのみんなが全員表示される公開広場モードです'}
                                    </div>
                                </div>
                                <button id="m-btn-toggle-pass" class="btn-ui ${isPassOn ? 'btn-amber' : 'btn-slate'}">
                                    ${isPassOn ? '🔒 パスワード: ON' : '🔓 パスワード: OFF'}
                                </button>
                            </div>
                            ${isPassOn ? `
                                <div style="display:flex; gap:6px; align-items:center; margin-top:6px;">
                                    <input id="m-input-room-pass" class="input-ui" type="text" maxlength="16" value="${d.roomPassword || ''}" placeholder="合言葉を入力（例: 7777）">
                                    <button id="m-btn-apply-pass" class="btn-ui btn-emerald" style="white-space:nowrap;">決定</button>
                                </div>
                            ` : ''}
                        </div>
                    </div>

                    <!-- 2. 同じ部屋のオンライン仲間一覧 -->
                    <div class="card-box">
                        <div style="font-size:12px; font-weight:900; color:#f472b6; margin-bottom:6px;">
                            👥 ${isPassOn ? `パスワード部屋「${d.roomPassword || '未入力'}」のメンバー` : '公開オンラインの冒険者一覧'}（${1 + remotes.length}人）
                        </div>
                        <div class="grid-2">
                            <div class="card-box flex-between" style="border-color:#38bdf8;">
                                <div>
                                    <div class="font-kaomoji" style="font-size:13px; font-weight:900; color:#38bdf8;">${this.getBasePlayerKaomoji()} <span style="color:#fff;">あなた (Lv.${d.lv})</span></div>
                                    <div style="font-size:10px; color:#94a3b8;">現在地: ${ZONES[this.currentZoneId]?.name || '試練の塔'} / 脅威+${d.threatRank || 0}</div>
                                </div>
                                <span class="badge-pill" style="background:#0284c7; color:#fff;">自分</span>
                            </div>
                            ${remotes.map(rp => `
                                <div class="card-box flex-between">
                                    <div>
                                        <div class="font-kaomoji" style="font-size:13px; font-weight:900; color:#f472b6;">${rp.kaomoji} <span style="color:#fff;">Lv.${rp.lv} 仲間</span></div>
                                        <div style="font-size:10px; color:#94a3b8;">現在地: ${ZONES[rp.zoneId]?.name || '試練の塔'} / 脅威+${rp.threatRank || 0}</div>
                                    </div>
                                    <span class="badge-pill" style="background:#059669; color:#fff;">表示中</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- 3. 引き継ぎコード（別端末へのデータ移行・バックアップ） -->
                    <div class="card-box" style="border-color:rgba(52,211,153,0.5);">
                        <div style="font-size:12px; font-weight:900; color:#6ee7b7; margin-bottom:4px;">📜 セーブデータ引き継ぎコード（別端末移行・バックアップ）</div>
                        <p style="font-size:10px; color:#94a3b8; line-height:1.4; margin-bottom:6px;">
                            「書き出し」を押すと今の強さ・装備・見た目がコード化されてコピーされます。別の端末で貼り付けて「コード復元」を押すと続きから遊べます。
                        </p>
                        <div style="display:flex; gap:6px; flex-wrap:wrap;">
                            <input id="input-backup-code" class="input-ui" style="flex:1; min-width:200px;" type="text" placeholder="ここに引き継ぎコードを貼り付けて復元">
                            <button id="btn-export-code" class="btn-ui btn-emerald">📋 書き出し＆コピー</button>
                            <button id="btn-import-code" class="btn-ui btn-fuchsia">📥 コード復元</button>
                        </div>
                    </div>
                </div>
            `;

            document.getElementById('m-btn-toggle-online')?.addEventListener('click', () => {
                if (this.toggleOnlineMode) {
                    this.toggleOnlineMode();
                }
                this.renderModalContent();
            });

            document.getElementById('m-btn-toggle-pass')?.addEventListener('click', () => {
                d.roomPassEnabled = !d.roomPassEnabled;
                this.saveGame(false);
                if (this.reconnectNtfyRoom) this.reconnectNtfyRoom();
                this.refreshTitleScreen();
                this.refreshAllHUD();
                this.renderModalContent();
                this.showAlertBanner(d.roomPassEnabled ? '🔒 パスワード部屋をONにしました' : '🔓 パスワード制限を解除（公開部屋）しました', 1600);
            });

            document.getElementById('m-btn-apply-pass')?.addEventListener('click', () => {
                const pw = document.getElementById('m-input-room-pass')?.value.trim() || '';
                d.roomPassword = pw;
                this.saveGame(false);
                if (this.reconnectNtfyRoom) this.reconnectNtfyRoom();
                this.refreshTitleScreen();
                this.refreshAllHUD();
                this.renderModalContent();
                this.showAlertBanner(pw ? `🔑 部屋パスワード「${pw}」を設定しました！` : '⚠️ パスワードが空欄です', 1600);
            });

            document.getElementById('btn-export-code')?.addEventListener('click', () => {
                try {
                    const json = JSON.stringify(this.saveData);
                    const code = btoa(unescape(encodeURIComponent(json)));
                    const inp = document.getElementById('input-backup-code');
                    if (inp) {
                        inp.value = code;
                        inp.select();
                    }
                    if (navigator.clipboard) navigator.clipboard.writeText(code).catch(() => {});
                    this.showAlertBanner('📋 引き継ぎコードを書き出し＆コピーしました！', 2200);
                } catch (e) {
                    this.showAlertBanner('⚠️ コード生成に失敗しました', 1800);
                }
            });

            document.getElementById('btn-import-code')?.addEventListener('click', () => {
                const rawCode = document.getElementById('input-backup-code')?.value.trim() || '';
                if (!rawCode) {
                    this.showAlertBanner('⚠️ 引き継ぎコードを貼り付けてください', 1800);
                    return;
                }
                try {
                    const json = decodeURIComponent(escape(atob(rawCode)));
                    const parsed = JSON.parse(json);
                    if (!parsed || typeof parsed.lv !== 'number') throw new Error('invalid');
                    const def = this.createDefaultSave();
                    this.saveData = {
                        ...def,
                        ...parsed,
                        stats: { ...def.stats, ...(parsed.stats || {}) },
                        skills: { ...def.skills, ...(parsed.skills || {}) },
                        materials: { ...def.materials, ...(parsed.materials || {}) },
                        statsTrack: { ...def.statsTrack, ...(parsed.statsTrack || {}) }
                    };
                    this.saveGame(false);
                    this.buildPlayerEntity();
                    this.buildPetEntity();
                    this.loadZone('town');
                    this.closeGrowthModal();
                    sfx.playLevelUp();
                    this.showAlertBanner('🎉 引き継ぎコードからデータを完全復元しました！', 2400);
                } catch (e) {
                    this.showAlertBanner('❌ 無効な引き継ぎコードです', 2000);
                }
            });

        } else if (this.activeTab === 'travel') {
            const bestFloor = (d.statsTrack && d.statsTrack.bestTowerFloor) || 0;
            const resumeFloor = Math.max(1, Math.floor(bestFloor / 5) * 5 + 1);
            body.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <div class="card-box flex-between" style="flex-wrap:wrap; border-color:rgba(192,132,252,0.65); background:rgba(46,16,101,0.55);">
                        <div>
                            <div style="font-size:13px; font-weight:900; color:#e879f9;">🗼 無限の試練の塔（最高到達: 第${bestFloor}階層）</div>
                            <div style="font-size:10px; color:#e2e8f0; margin-top:2px;">5階層ごとの守護ボス撃破でAP+3/SP+1＆実績解除！</div>
                        </div>
                        <div style="display:flex; gap:6px;">
                            <button id="btn-tower-start-1" class="btn-ui btn-fuchsia">🗼 1階から挑戦</button>
                            ${resumeFloor > 1 ? `<button id="btn-tower-resume" class="btn-ui btn-amber">⚡ ${resumeFloor}階から</button>` : ''}
                        </div>
                    </div>

                    <div class="card-box flex-between" style="flex-wrap:wrap;">
                        <div>
                            <div style="font-size:12px; font-weight:900; color:#fda4af;">🔥 脅威度ランク（最大 +${MAX_THREAT_RANK}）</div>
                            <div style="font-size:10px; color:#94a3b8;">マルチ時は攻撃者と自分の低い方の脅威度が適用されズル防止！</div>
                        </div>
                        <div style="display:flex; align-items:center; gap:5px;">
                            <button id="m-threat-down10" class="btn-ui btn-slate">-10</button>
                            <button id="m-threat-down" class="btn-ui btn-slate">-1</button>
                            <span style="font-size:13px; font-weight:900; color:#fde047; min-width:66px; text-align:center;">+${d.threatRank || 0} / ${MAX_THREAT_RANK}</span>
                            <button id="m-threat-up" class="btn-ui btn-rose">+1</button>
                            <button id="m-threat-up10" class="btn-ui btn-amber">+10</button>
                        </div>
                    </div>

                    <div class="grid-2">
                        ${Object.values(ZONES).map(z => {
                            const isCur = this.currentZoneId === z.id && !this.towerState.active;
                            const dropNames = (z.drops || []).map(mk => `${MATERIALS[mk].icon}${MATERIALS[mk].name}`).join(' / ') || 'HP・MP高速回復＆仲間広場';
                            return `
                                <div class="card-box" style="border-color:${isCur ? '#38bdf8' : '#1e293b'}; display:flex; flex-direction:column; justify-content:space-between; gap:8px;">
                                    <div>
                                        <div class="flex-between">
                                            <span class="badge-pill" style="background:${z.safe ? '#065f46' : '#881337'}; color:#fff;">STAGE ${z.stageNum} / 推奨Lv.${z.recLv}〜</span>
                                            ${isCur ? '<span style="font-size:10px; font-weight:900; color:#38bdf8;">● 現在地</span>' : ''}
                                        </div>
                                        <div style="font-size:13px; font-weight:900; color:#fff; margin-top:4px;">${z.name}</div>
                                        <p style="font-size:11px; color:#cbd5e1; margin-top:3px;">${z.desc}</p>
                                        <div style="font-size:10px; color:#6ee7b7; margin-top:4px;">ドロップ: ${dropNames}</div>
                                    </div>
                                    <button class="btn-warp-zone btn-ui ${isCur ? 'btn-slate' : 'btn-emerald'}" data-zone="${z.id}" ${isCur ? 'disabled' : ''}>
                                        ${isCur ? '滞在中のエリア' : '🌀 このステージへ移動'}
                                    </button>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
            document.getElementById('btn-tower-start-1')?.addEventListener('click', () => { this.closeGrowthModal(); this.startTowerMode(1); });
            document.getElementById('btn-tower-resume')?.addEventListener('click', () => { this.closeGrowthModal(); this.startTowerMode(resumeFloor); });
            const changeThreat = (delta) => {
                d.threatRank = Math.max(0, Math.min(MAX_THREAT_RANK, (d.threatRank || 0) + delta));
                if (!this.towerState.active) this.loadZone(this.currentZoneId);
                this.renderModalContent();
            };
            document.getElementById('m-threat-up')?.addEventListener('click', () => changeThreat(1));
            document.getElementById('m-threat-up10')?.addEventListener('click', () => changeThreat(10));
            document.getElementById('m-threat-down')?.addEventListener('click', () => changeThreat(-1));
            document.getElementById('m-threat-down10')?.addEventListener('click', () => changeThreat(-10));
            body.querySelectorAll('.btn-warp-zone').forEach(btn => btn.addEventListener('click', () => {
                this.loadZone(btn.dataset.zone);
                this.closeGrowthModal();
                this.showAlertBanner(`🌀 ${ZONES[btn.dataset.zone].name} へ移動しました！`, 1800);
            }));

        } else if (this.activeTab === 'appearance') {
            const curColor = d.bodyColor || evo.color;
            const curFaceBg = this.getPlayerFaceBgHex();
            const curScale = this.getPlayerBodyScale();
            body.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <div class="card-box">
                        <div style="font-size:12px; font-weight:900; color:#fde047; margin-bottom:6px;">📏 体型サイズ変更</div>
                        <div class="flex-wrap-gap" style="margin-bottom:10px;">
                            ${BODY_SCALE_PRESETS.map(p => `
                                <button class="btn-body-scale btn-ui ${Math.abs(curScale - p.scale) < 0.02 ? 'btn-amber' : 'btn-slate'}" data-scale="${p.scale}">
                                    ${p.name}
                                </button>
                            `).join('')}
                        </div>

                        <div style="font-size:12px; font-weight:900; color:#38bdf8; margin-bottom:6px;">🎨 キャラクター体色のカスタマイズ</div>
                        <div class="flex-wrap-gap" style="margin-bottom:8px;">
                            ${BODY_COLOR_PRESETS.map(c => `
                                <button class="btn-body-color btn-ui btn-slate" data-hex="${c.hex}" style="border:2px solid ${(d.bodyColor || '') === c.hex ? '#fde047' : '#334155'};">
                                    <span style="display:inline-block; width:12px; height:12px; border-radius:50%; background:${c.hex || evo.color}; border:1px solid #fff;"></span>
                                    ${c.name}
                                </button>
                            `).join('')}
                        </div>
                        <div class="flex-wrap-gap" style="margin-bottom:10px;">
                            <span style="font-size:11px; color:#cbd5e1;">体色ピッカー:</span>
                            <input id="input-body-color" type="color" value="${curColor}" style="width:44px; height:28px; border:none; background:none; cursor:pointer;">
                            <button id="btn-apply-picker-color" class="btn-ui btn-sky">体色を反映</button>
                        </div>

                        <div style="font-size:12px; font-weight:900; color:#6ee7b7; margin-bottom:6px;">🖥️ 顔モニターの背景色</div>
                        <div class="flex-wrap-gap">
                            ${FACE_BG_PRESETS.map(f => `
                                <button class="btn-face-bg btn-ui btn-slate" data-hex="${f.hex}" style="border:2px solid ${curFaceBg.toLowerCase() === f.hex.toLowerCase() ? '#fde047' : '#334155'};">
                                    <span style="display:inline-block; width:12px; height:12px; border-radius:3px; background:${f.hex}; border:1px solid #94a3b8;"></span>
                                    ${f.name}
                                </button>
                            `).join('')}
                            <input id="input-face-bg" type="color" value="${curFaceBg}" style="width:40px; height:26px; border:none; background:none; cursor:pointer;">
                            <button id="btn-apply-face-bg" class="btn-ui btn-emerald">背景反映</button>
                        </div>
                    </div>

                    <div class="card-box">
                        <div style="font-size:12px; font-weight:900; color:#f472b6; margin-bottom:6px;">🐱 頭パーツ（背中パーツと同時装着OK！）</div>
                        <div class="grid-2">
                            ${Object.values(COSMETICS).map(cos => {
                                const owned = (d.ownedCosmetics || ['none']).includes(cos.id);
                                const equipped = (d.cosmeticId || 'none') === cos.id;
                                const canBuy = d.gold >= cos.costGold && this.hasEnoughMats(cos.costMat);
                                return `
                                    <div class="card-box flex-between" style="border-color:${equipped ? '#f472b6' : '#1e293b'};">
                                        <div>
                                            <div style="font-size:12px; font-weight:900; color:#fff;">${cos.icon} ${cos.name}</div>
                                            <div style="font-size:10px; color:#cbd5e1;">${cos.desc}</div>
                                            ${!owned ? `<div style="font-size:10px; margin-top:2px;">必要: ${formatBigNum(cos.costGold)}G / ${this.formatMatReqHtml(cos.costMat)}</div>` : ''}
                                        </div>
                                        ${equipped
                                            ? '<span class="badge-pill" style="background:#db2777; color:#fff;">装着中</span>'
                                            : (owned
                                                ? `<button class="btn-eq-cos btn-ui btn-sky" data-id="${cos.id}">装着</button>`
                                                : `<button class="btn-buy-cos btn-ui btn-amber" data-id="${cos.id}" ${!canBuy ? 'disabled' : ''}>作成</button>`)}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <div class="card-box">
                        <div style="font-size:12px; font-weight:900; color:#c084fc; margin-bottom:6px;">🕊️ 背中パーツ（翼・マント・九尾・光輪オーラ）</div>
                        <div class="grid-2">
                            ${Object.values(BACK_COSMETICS).map(bk => {
                                const owned = (d.ownedBackCosmetics || ['back_none']).includes(bk.id);
                                const equipped = (d.backCosmeticId || 'back_none') === bk.id;
                                const canBuy = d.gold >= bk.costGold && this.hasEnoughMats(bk.costMat);
                                return `
                                    <div class="card-box flex-between" style="border-color:${equipped ? '#c084fc' : '#1e293b'};">
                                        <div>
                                            <div style="font-size:12px; font-weight:900; color:#fff;">${bk.icon} ${bk.name}</div>
                                            <div style="font-size:10px; color:#cbd5e1;">${bk.desc}</div>
                                            ${!owned ? `<div style="font-size:10px; margin-top:2px;">必要: ${formatBigNum(bk.costGold)}G / ${this.formatMatReqHtml(bk.costMat)}</div>` : ''}
                                        </div>
                                        ${equipped
                                            ? '<span class="badge-pill" style="background:#9333ea; color:#fff;">装着中</span>'
                                            : (owned
                                                ? `<button class="btn-eq-back btn-ui btn-sky" data-id="${bk.id}">装着</button>`
                                                : `<button class="btn-buy-back btn-ui btn-amber" data-id="${bk.id}" ${!canBuy ? 'disabled' : ''}>作成</button>`)}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <div class="card-box">
                        <div style="font-size:12px; font-weight:900; color:#7dd3fc; margin-bottom:6px;">✏️ 基本の顔文字＆カスタム称号・エモート</div>
                        <div class="grid-2" style="margin-bottom:8px;">
                            <div>
                                <div style="font-size:10px; color:#94a3b8; margin-bottom:3px;">基本の顔文字（空欄で職業デフォルト）</div>
                                <input id="input-custom-kaomoji" class="input-ui font-kaomoji" type="text" maxlength="16" value="${d.customKaomoji || ''}" placeholder="例: (=^・ω・^=)">
                            </div>
                            <div>
                                <div style="font-size:10px; color:#94a3b8; margin-bottom:3px;">カスタム表示称号</div>
                                <input id="input-custom-title" class="input-ui" type="text" maxlength="12" value="${d.exTitle || ''}" placeholder="例: ネコミミ剣士">
                            </div>
                        </div>
                        <div class="flex-wrap-gap" style="margin-bottom:8px;">
                            ${KAOMOJI_PRESETS.map(k => `<button class="btn-preset-k btn-ui btn-slate font-kaomoji" data-k="${k}">${k}</button>`).join('')}
                            <button id="btn-save-kaomoji" class="btn-ui btn-emerald">✨ 顔文字と称号を反映</button>
                        </div>
                        <div style="display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:5px;">
                            ${EMOTES.map(em => `
                                <button class="btn-modal-emote btn-ui btn-slate" style="flex-direction:column; padding:6px 4px;" data-emote="${em.id}">
                                    <span style="font-size:16px;">${em.icon}</span>
                                    <span style="font-size:10px; color:#fff;">${em.label}</span>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
            body.querySelectorAll('.btn-body-scale').forEach(btn => btn.addEventListener('click', () => {
                d.bodyScale = Number(btn.dataset.scale) || 1.0;
                this.buildPlayerEntity();
                this.saveGame(false);
                this.renderModalContent();
            }));
            body.querySelectorAll('.btn-body-color').forEach(btn => btn.addEventListener('click', () => {
                d.bodyColor = btn.dataset.hex;
                this.buildPlayerEntity();
                this.saveGame(false);
                this.renderModalContent();
            }));
            document.getElementById('btn-apply-picker-color')?.addEventListener('click', () => {
                d.bodyColor = document.getElementById('input-body-color')?.value || '';
                this.buildPlayerEntity();
                this.saveGame(false);
                this.renderModalContent();
            });
            body.querySelectorAll('.btn-face-bg').forEach(btn => btn.addEventListener('click', () => {
                d.faceBgColor = btn.dataset.hex;
                this.buildPlayerEntity();
                this.saveGame(false);
                this.renderModalContent();
            }));
            document.getElementById('btn-apply-face-bg')?.addEventListener('click', () => {
                d.faceBgColor = document.getElementById('input-face-bg')?.value || '#073b66';
                this.buildPlayerEntity();
                this.saveGame(false);
                this.renderModalContent();
            });
            body.querySelectorAll('.btn-buy-cos').forEach(btn => btn.addEventListener('click', () => {
                const cos = COSMETICS[btn.dataset.id];
                if (!cos || d.gold < cos.costGold || !this.hasEnoughMats(cos.costMat)) return;
                d.gold -= cos.costGold;
                this.consumeMats(cos.costMat);
                if (!d.ownedCosmetics) d.ownedCosmetics = ['none'];
                d.ownedCosmetics.push(cos.id);
                d.cosmeticId = cos.id;
                this.buildPlayerEntity();
                sfx.playLevelUp();
                this.saveGame(false);
                this.renderModalContent();
                this.showAlertBanner(`✨ 頭パーツ「${cos.name}」を作成＆装着しました！`, 2000);
            }));
            body.querySelectorAll('.btn-eq-cos').forEach(btn => btn.addEventListener('click', () => {
                d.cosmeticId = btn.dataset.id;
                this.buildPlayerEntity();
                this.saveGame(false);
                this.renderModalContent();
            }));
            body.querySelectorAll('.btn-buy-back').forEach(btn => btn.addEventListener('click', () => {
                const bk = BACK_COSMETICS[btn.dataset.id];
                if (!bk || d.gold < bk.costGold || !this.hasEnoughMats(bk.costMat)) return;
                d.gold -= bk.costGold;
                this.consumeMats(bk.costMat);
                if (!d.ownedBackCosmetics) d.ownedBackCosmetics = ['back_none'];
                d.ownedBackCosmetics.push(bk.id);
                d.backCosmeticId = bk.id;
                this.buildPlayerEntity();
                sfx.playLevelUp();
                this.saveGame(false);
                this.renderModalContent();
                this.showAlertBanner(`✨ 背中パーツ「${bk.name}」を作成＆装着しました！`, 2000);
            }));
            body.querySelectorAll('.btn-eq-back').forEach(btn => btn.addEventListener('click', () => {
                d.backCosmeticId = btn.dataset.id;
                this.buildPlayerEntity();
                this.saveGame(false);
                this.renderModalContent();
            }));
            body.querySelectorAll('.btn-preset-k').forEach(btn => btn.addEventListener('click', () => {
                const inp = document.getElementById('input-custom-kaomoji');
                if (inp) inp.value = btn.dataset.k;
            }));
            document.getElementById('btn-save-kaomoji')?.addEventListener('click', () => {
                d.customKaomoji = document.getElementById('input-custom-kaomoji')?.value.trim() || '';
                d.exTitle = document.getElementById('input-custom-title')?.value.trim() || '';
                this.buildPlayerEntity();
                this.saveGame(false);
                this.refreshAllHUD();
                this.showAlertBanner('✨ 顔文字と表示を更新しました！', 1600);
            });
            body.querySelectorAll('.btn-modal-emote').forEach(btn => btn.addEventListener('click', () => {
                const id = btn.dataset.emote;
                this.closeGrowthModal();
                this.triggerEmote(id);
            }));

        } else if (this.activeTab === 'forge') {
            const curWpn = WEAPONS[d.weaponId] || WEAPONS.wpn_wood;
            const curArm = ARMORS[d.armorId] || ARMORS.arm_cloth;
            const wpnReq = getWeaponEnhanceRequirement(d.weaponEnhance || 0);
            const armReq = getArmorEnhanceRequirement(d.armorEnhance || 0);
            const canEnhWpn = d.gold >= wpnReq.gold && this.hasEnoughMats(wpnReq.mats);
            const canEnhArm = d.gold >= armReq.gold && this.hasEnoughMats(armReq.mats);

            const wEnchObj = ENCHANT_POOL.find(x => x.id === d.weaponEnchant);
            const aEnchObj = ENCHANT_POOL.find(x => x.id === d.armorEnchant);
            const canRollWpnEnch = d.gold >= 300 && (d.materials.slime_gel || 0) >= 2 && (d.materials.ancient_sap || 0) >= 1;
            const canRollArmEnch = d.gold >= 300 && (d.materials.slime_gel || 0) >= 2 && (d.materials.goblin_fang || 0) >= 1;

            const canCraftApBook = d.gold >= 1500 && (d.materials.slime_gel || 0) >= 8 && (d.materials.ancient_sap || 0) >= 4;
            const canCraftSpBook = d.gold >= 2500 && (d.materials.goblin_fang || 0) >= 6 && (d.materials.fire_core || 0) >= 3;

            body.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <div class="card-box flex-wrap-gap" style="font-size:11px;">
                        <span style="font-weight:900; color:#fde047;">所持G: ${formatBigNum(d.gold)}G</span>
                        ${Object.values(MATERIALS).map(m => `<span>${m.icon}${m.name}: <b>${d.materials[m.id] || 0}</b></span>`).join('')}
                    </div>

                    <div class="grid-2">
                        <div class="card-box" style="display:flex; flex-direction:column; justify-content:space-between; gap:6px;">
                            <div>
                                <div style="font-size:12px; font-weight:900; color:#fb7185;">${curWpn.icon} 武器: ${curWpn.name} <span style="color:#fde047;">+${d.weaponEnhance || 0}</span></div>
                                <div style="font-size:10px; color:#94a3b8;">精錬ごとに武器ATK +14%（G＋素材消費）</div>
                                <div style="font-size:10px; margin-top:2px;">必要素材: ${this.formatMatReqHtml(wpnReq.mats)}</div>
                            </div>
                            <button id="btn-enh-wpn" class="btn-ui btn-amber" ${!canEnhWpn ? 'disabled' : ''}>🔨 武器精錬 (+1) [${formatBigNum(wpnReq.gold)}G + 素材]</button>
                        </div>
                        <div class="card-box" style="display:flex; flex-direction:column; justify-content:space-between; gap:6px;">
                            <div>
                                <div style="font-size:12px; font-weight:900; color:#38bdf8;">${curArm.icon} 防具: ${curArm.name} <span style="color:#fde047;">+${d.armorEnhance || 0}</span></div>
                                <div style="font-size:10px; color:#94a3b8;">精錬ごとに防具HP/MP/防御 +14%（G＋素材消費）</div>
                                <div style="font-size:10px; margin-top:2px;">必要素材: ${this.formatMatReqHtml(armReq.mats)}</div>
                            </div>
                            <button id="btn-enh-arm" class="btn-ui btn-sky" ${!canEnhArm ? 'disabled' : ''}>🔨 防具精錬 (+1) [${formatBigNum(armReq.gold)}G + 素材]</button>
                        </div>
                    </div>

                    <div class="card-box">
                        <div style="font-size:12px; font-weight:900; color:#c084fc; margin-bottom:6px;">🔮 素材エンチャント付与・厳選（ランダム特殊オプション）</div>
                        <div class="grid-2">
                            <div class="card-box flex-between">
                                <div>
                                    <div style="font-size:11px; font-weight:900; color:#fff;">武器オプション: <span style="color:#fde047;">${wEnchObj ? wEnchObj.label : '未付与'}</span></div>
                                    <div style="font-size:10px; color:#94a3b8;">必要: 300G + 💧2 + 🌿1</div>
                                </div>
                                <button id="btn-ench-wpn" class="btn-ui btn-fuchsia" ${!canRollWpnEnch ? 'disabled' : ''}>🎲 付与/変更</button>
                            </div>
                            <div class="card-box flex-between">
                                <div>
                                    <div style="font-size:11px; font-weight:900; color:#fff;">防具オプション: <span style="color:#fde047;">${aEnchObj ? aEnchObj.label : '未付与'}</span></div>
                                    <div style="font-size:10px; color:#94a3b8;">必要: 300G + 💧2 + 🦴1</div>
                                </div>
                                <button id="btn-ench-arm" class="btn-ui btn-fuchsia" ${!canRollArmEnch ? 'disabled' : ''}>🎲 付与/変更</button>
                            </div>
                        </div>
                    </div>

                    <div class="card-box">
                        <div style="font-size:12px; font-weight:900; color:#34d399; margin-bottom:6px;">⚗️ 素材錬金工房（上位変換 ＆ 無限成長の書）</div>
                        <div class="grid-2" style="margin-bottom:8px;">
                            <div class="card-box flex-between">
                                <div>
                                    <div style="font-size:11px; font-weight:900; color:#fde047;">📘 ステータス成長の書 (AP +1)</div>
                                    <div style="font-size:10px; color:#94a3b8;">必要: 1,500G + 💧8 + 🌿4</div>
                                </div>
                                <button id="btn-craft-apbook" class="btn-ui btn-emerald" ${!canCraftApBook ? 'disabled' : ''}>錬金する</button>
                            </div>
                            <div class="card-box flex-between">
                                <div>
                                    <div style="font-size:11px; font-weight:900; color:#38bdf8;">📕 スキル熟練の書 (SP +1)</div>
                                    <div style="font-size:10px; color:#94a3b8;">必要: 2,500G + 🦴6 + 🔥3</div>
                                </div>
                                <button id="btn-craft-spbook" class="btn-ui btn-emerald" ${!canCraftSpBook ? 'disabled' : ''}>錬金する</button>
                            </div>
                        </div>
                        <div class="flex-wrap-gap">
                            ${MATERIAL_ALCHEMY.map((al, idx) => {
                                const fM = MATERIALS[al.from];
                                const tM = MATERIALS[al.to];
                                const canAl = (d.materials[al.from] || 0) >= al.count && d.gold >= al.gold;
                                return `<button class="btn-alchemy-mat btn-ui btn-slate" data-idx="${idx}" ${!canAl ? 'disabled' : ''}>${fM.icon}x${al.count}+${formatBigNum(al.gold)}G → ${tM.icon}x1</button>`;
                            }).join('')}
                        </div>
                    </div>

                    <div style="font-size:12px; font-weight:900; color:#fde047;">🗡️ 武器の鍛造・装備</div>
                    <div class="grid-2">
                        ${Object.values(WEAPONS).map(w => {
                            const owned = d.ownedWeapons.includes(w.id);
                            const equipped = d.weaponId === w.id;
                            const canCraft = d.gold >= w.costGold && this.hasEnoughMats(w.costMat);
                            return `
                                <div class="card-box flex-between">
                                    <div>
                                        <div style="font-size:12px; font-weight:900; color:#fff;">${w.icon} ${w.name}</div>
                                        <div style="font-size:10px; color:#fda4af;">ATK:${w.atk} / 魔力:x${w.mag}</div>
                                        <div style="font-size:10px; color:#94a3b8;">${formatBigNum(w.costGold)}G / ${this.formatMatReqHtml(w.costMat)}</div>
                                    </div>
                                    ${equipped ? '<span class="badge-pill" style="background:#059669; color:#fff;">装備中</span>'
                                        : (owned ? `<button class="btn-eq-wpn btn-ui btn-sky" data-id="${w.id}">装備</button>`
                                            : `<button class="btn-craft-wpn btn-ui btn-amber" data-id="${w.id}" ${!canCraft ? 'disabled' : ''}>鍛造</button>`)}
                                </div>
                            `;
                        }).join('')}
                    </div>

                    <div style="font-size:12px; font-weight:900; color:#7dd3fc;">🛡️ 防具・💍 装飾品の鍛造・装備</div>
                    <div class="grid-2">
                        ${Object.values(ARMORS).map(a => {
                            const owned = d.ownedArmors.includes(a.id);
                            const equipped = d.armorId === a.id;
                            const canCraft = d.gold >= a.costGold && this.hasEnoughMats(a.costMat);
                            return `
                                <div class="card-box flex-between">
                                    <div>
                                        <div style="font-size:12px; font-weight:900; color:#fff;">${a.icon} ${a.name}</div>
                                        <div style="font-size:10px; color:#6ee7b7;">HP+${a.hp} / MP+${a.mp} / 軽減+${Math.round(a.def * 100)}%</div>
                                        <div style="font-size:10px; color:#94a3b8;">${formatBigNum(a.costGold)}G / ${this.formatMatReqHtml(a.costMat)}</div>
                                    </div>
                                    ${equipped ? '<span class="badge-pill" style="background:#059669; color:#fff;">装備中</span>'
                                        : (owned ? `<button class="btn-eq-arm btn-ui btn-sky" data-id="${a.id}">装備</button>`
                                            : `<button class="btn-craft-arm btn-ui btn-amber" data-id="${a.id}" ${!canCraft ? 'disabled' : ''}>鍛造</button>`)}
                                </div>
                            `;
                        }).join('')}
                        ${Object.values(ACCESSORIES).filter(ac => ac.id !== 'acc_none').map(ac => {
                            const owned = (d.ownedAccessories || []).includes(ac.id);
                            const equipped = d.accessoryId === ac.id;
                            const canCraft = d.gold >= ac.costGold && this.hasEnoughMats(ac.costMat);
                            return `
                                <div class="card-box flex-between">
                                    <div>
                                        <div style="font-size:12px; font-weight:900; color:#fff;">${ac.icon} ${ac.name}</div>
                                        <div style="font-size:10px; color:#f9a8d4;">${ac.desc}</div>
                                        <div style="font-size:10px; color:#94a3b8;">${formatBigNum(ac.costGold)}G / ${this.formatMatReqHtml(ac.costMat)}</div>
                                    </div>
                                    ${equipped ? '<span class="badge-pill" style="background:#059669; color:#fff;">装備中</span>'
                                        : (owned ? `<button class="btn-eq-acc btn-ui btn-sky" data-id="${ac.id}">装備</button>`
                                            : `<button class="btn-craft-acc btn-ui btn-fuchsia" data-id="${ac.id}" ${!canCraft ? 'disabled' : ''}>錬成</button>`)}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;

            document.getElementById('btn-enh-wpn')?.addEventListener('click', () => {
                if (!canEnhWpn) return;
                d.gold -= wpnReq.gold;
                this.consumeMats(wpnReq.mats);
                d.weaponEnhance = (d.weaponEnhance || 0) + 1;
                this.buildPlayerEntity();
                sfx.playSkill();
                this.saveGame(false);
                this.renderModalContent();
            });
            document.getElementById('btn-enh-arm')?.addEventListener('click', () => {
                if (!canEnhArm) return;
                d.gold -= armReq.gold;
                this.consumeMats(armReq.mats);
                d.armorEnhance = (d.armorEnhance || 0) + 1;
                this.buildPlayerEntity();
                sfx.playSkill();
                this.saveGame(false);
                this.renderModalContent();
            });
            document.getElementById('btn-ench-wpn')?.addEventListener('click', () => {
                if (!canRollWpnEnch) return;
                d.gold -= 300;
                this.consumeMats({ slime_gel: 2, ancient_sap: 1 });
                const pick = ENCHANT_POOL[Math.floor(Math.random() * ENCHANT_POOL.length)];
                d.weaponEnchant = pick.id;
                sfx.playLevelUp();
                this.saveGame(false);
                this.renderModalContent();
                this.showAlertBanner(`🔮 武器に「${pick.label}」が付与されました！`, 1800);
            });
            document.getElementById('btn-ench-arm')?.addEventListener('click', () => {
                if (!canRollArmEnch) return;
                d.gold -= 300;
                this.consumeMats({ slime_gel: 2, goblin_fang: 1 });
                const pick = ENCHANT_POOL[Math.floor(Math.random() * ENCHANT_POOL.length)];
                d.armorEnchant = pick.id;
                sfx.playLevelUp();
                this.saveGame(false);
                this.renderModalContent();
                this.showAlertBanner(`🔮 防具に「${pick.label}」が付与されました！`, 1800);
            });
            document.getElementById('btn-craft-apbook')?.addEventListener('click', () => {
                if (!canCraftApBook) return;
                d.gold -= 1500;
                this.consumeMats({ slime_gel: 8, ancient_sap: 4 });
                d.ap += 1;
                sfx.playLevelUp();
                this.saveGame(false);
                this.renderModalContent();
                this.showAlertBanner('📘 ステータス成長の書を錬金！AP +1 獲得！', 1800);
            });
            document.getElementById('btn-craft-spbook')?.addEventListener('click', () => {
                if (!canCraftSpBook) return;
                d.gold -= 2500;
                this.consumeMats({ goblin_fang: 6, fire_core: 3 });
                d.sp += 1;
                sfx.playLevelUp();
                this.saveGame(false);
                this.renderModalContent();
                this.showAlertBanner('📕 スキル熟練の書を錬金！SP +1 獲得！', 1800);
            });
            body.querySelectorAll('.btn-alchemy-mat').forEach(btn => btn.addEventListener('click', () => {
                const al = MATERIAL_ALCHEMY[Number(btn.dataset.idx)];
                if (!al || d.gold < al.gold || (d.materials[al.from] || 0) < al.count) return;
                d.gold -= al.gold;
                d.materials[al.from] -= al.count;
                d.materials[al.to] = (d.materials[al.to] || 0) + 1;
                sfx.playSkill();
                this.saveGame(false);
                this.renderModalContent();
            }));
            body.querySelectorAll('.btn-craft-wpn').forEach(btn => btn.addEventListener('click', () => {
                const w = WEAPONS[btn.dataset.id];
                d.gold -= w.costGold;
                this.consumeMats(w.costMat);
                d.ownedWeapons.push(w.id);
                d.weaponId = w.id;
                this.buildPlayerEntity();
                sfx.playLevelUp();
                this.saveGame(false);
                this.renderModalContent();
            }));
            body.querySelectorAll('.btn-eq-wpn').forEach(btn => btn.addEventListener('click', () => {
                d.weaponId = btn.dataset.id;
                this.buildPlayerEntity();
                this.saveGame(false);
                this.renderModalContent();
            }));
            body.querySelectorAll('.btn-craft-arm').forEach(btn => btn.addEventListener('click', () => {
                const a = ARMORS[btn.dataset.id];
                d.gold -= a.costGold;
                this.consumeMats(a.costMat);
                d.ownedArmors.push(a.id);
                d.armorId = a.id;
                this.buildPlayerEntity();
                sfx.playLevelUp();
                this.saveGame(false);
                this.renderModalContent();
            }));
            body.querySelectorAll('.btn-eq-arm').forEach(btn => btn.addEventListener('click', () => {
                d.armorId = btn.dataset.id;
                this.buildPlayerEntity();
                this.saveGame(false);
                this.renderModalContent();
            }));
            body.querySelectorAll('.btn-craft-acc').forEach(btn => btn.addEventListener('click', () => {
                const ac = ACCESSORIES[btn.dataset.id];
                d.gold -= ac.costGold;
                this.consumeMats(ac.costMat);
                if (!d.ownedAccessories) d.ownedAccessories = ['acc_none'];
                d.ownedAccessories.push(ac.id);
                d.accessoryId = ac.id;
                sfx.playLevelUp();
                this.saveGame(false);
                this.renderModalContent();
            }));
            body.querySelectorAll('.btn-eq-acc').forEach(btn => btn.addEventListener('click', () => {
                d.accessoryId = btn.dataset.id;
                this.saveGame(false);
                this.renderModalContent();
            }));

        } else if (this.activeTab === 'stats') {
            const statDefs = [
                { key: 'str', name: 'STR（筋力）', desc: '物理攻撃力・会心率・会心ダメージUP' },
                { key: 'int', name: 'INT（知力）', desc: 'スキル魔力倍率・最大MP・MP回復UP' },
                { key: 'vit', name: 'VIT（体力）', desc: '最大HP・被ダメージ軽減率UP' },
                { key: 'agi', name: 'AGI（敏捷）', desc: '会心率・スキルCT短縮・移動速度UP' }
            ];
            body.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <div class="card-box flex-between">
                        <div>
                            <div style="font-size:13px; font-weight:900; color:#38bdf8;">残りステータスポイント (AP): <span style="color:#fde047; font-size:16px;">${d.ap}</span></div>
                            <div style="font-size:10px; color:#94a3b8;">鍛冶錬金工房で素材から「AP+1の書」も作成可能！</div>
                        </div>
                        <span class="badge-pill" style="background:#1e293b; color:#fde047;">転生補正: x${st.rebirthMult.toFixed(2)}</span>
                    </div>
                    <div class="grid-2">
                        ${statDefs.map(s => `
                            <div class="card-box flex-between">
                                <div>
                                    <div style="font-size:12px; font-weight:900; color:#fff;">${s.name}: <span style="color:#38bdf8; font-size:15px;">${d.stats[s.key]}</span></div>
                                    <div style="font-size:10px; color:#94a3b8;">${s.desc}</div>
                                </div>
                                <div style="display:flex; gap:4px;">
                                    <button class="btn-add-ap btn-ui btn-sky" data-stat="${s.key}" data-amt="1" ${d.ap < 1 ? 'disabled' : ''}>+1</button>
                                    <button class="btn-add-ap btn-ui btn-amber" data-stat="${s.key}" data-amt="5" ${d.ap < 5 ? 'disabled' : ''}>+5</button>
                                    <button class="btn-add-ap btn-ui btn-fuchsia" data-stat="${s.key}" data-amt="25" ${d.ap < 25 ? 'disabled' : ''}>+25</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="card-box grid-2" style="font-size:11px;">
                        <div>最大HP: <b style="color:#34d399;">${formatBigNum(st.maxHp)}</b></div>
                        <div>最大MP: <b style="color:#38bdf8;">${formatBigNum(st.maxMp)}</b></div>
                        <div>総合攻撃力: <b style="color:#fb7185;">${formatBigNum(st.physAtk)}</b></div>
                        <div>スキル魔力倍率: <b style="color:#c084fc;">x${st.magMult}</b></div>
                        <div>会心率: <b style="color:#fde047;">${Math.round(st.critChance * 100)}%</b></div>
                        <div>会心ダメージ: <b style="color:#fde047;">x${st.critDmg.toFixed(2)}</b></div>
                        <div>被ダメージ軽減: <b style="color:#2dd4bf;">${Math.round(st.defMitigation * 100)}%</b></div>
                        <div>CT短縮: <b style="color:#818cf8;">${Math.round(st.cdReduction * 100)}%</b></div>
                    </div>
                </div>
            `;
            body.querySelectorAll('.btn-add-ap').forEach(btn => btn.addEventListener('click', () => {
                const amt = Number(btn.dataset.amt);
                if (d.ap < amt) return;
                d.ap -= amt;
                d.stats[btn.dataset.stat] += amt;
                this.saveGame(false);
                this.renderModalContent();
            }));

        } else if (this.activeTab === 'skills') {
            body.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <div class="card-box flex-between">
                        <span style="font-size:12px; font-weight:900; color:#818cf8;">残りスキルポイント (SP): <b style="color:#fde047; font-size:15px;">${d.sp}</b></span>
                        <span style="font-size:10px; color:#94a3b8;">番号ボタン[1〜5]で右下アークスロットにセット</span>
                    </div>
                    <div class="grid-2">
                        ${Object.values(SKILLS).map(sk => {
                            const curLv = d.skills[sk.id] || 0;
                            const dispLv = Math.max(1, curLv);
                            const curMp = getSkillMpCost(sk, dispLv);
                            const eff = getSkillEffectStats(sk, dispLv, st);
                            const cost = curLv === 0 ? 1 : this.getSkillUpgradeCost(curLv);
                            const eqIdx = d.equippedSkills.indexOf(sk.id);
                            return `
                                <div class="card-box" style="display:flex; flex-direction:column; justify-content:space-between; gap:6px;">
                                    <div>
                                        <div class="flex-between">
                                            <span style="font-size:12px; font-weight:900; color:#fff;">${sk.icon} ${sk.name} <span style="color:#38bdf8;">${curLv > 0 ? `Lv.${curLv}` : '(未習得)'}</span></span>
                                            <span style="font-size:10px; color:#7dd3fc;">MP:${curMp} / CD:${sk.cd}s</span>
                                        </div>
                                        <div style="font-size:10px; font-weight:900; color:#fde047; margin-top:2px;">📊 ${eff.summary}</div>
                                        <p style="font-size:10px; color:#cbd5e1; margin-top:2px;">${sk.desc}</p>
                                    </div>
                                    <div class="flex-between" style="flex-wrap:wrap;">
                                        <button class="btn-up-skill btn-ui btn-emerald" data-id="${sk.id}" ${d.sp < cost ? 'disabled' : ''}>
                                            ${curLv === 0 ? `✨ 習得 (SP ${cost})` : `⬆ 強化 (SP ${cost})`}
                                        </button>
                                        ${curLv > 0 ? `
                                            <div style="display:flex; gap:3px;">
                                                ${[0, 1, 2, 3, 4].map(slot => `
                                                    <button class="btn-set-slot btn-ui ${eqIdx === slot ? 'btn-sky' : 'btn-slate'}" style="padding:4px 7px;" data-id="${sk.id}" data-slot="${slot}">${slot + 1}</button>
                                                `).join('')}
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
            body.querySelectorAll('.btn-up-skill').forEach(btn => btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const curLv = d.skills[id] || 0;
                const cost = curLv === 0 ? 1 : this.getSkillUpgradeCost(curLv);
                if (d.sp < cost) return;
                d.sp -= cost;
                d.skills[id] = curLv + 1;
                sfx.playSkill();
                this.saveGame(false);
                this.renderModalContent();
            }));
            body.querySelectorAll('.btn-set-slot').forEach(btn => btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const slot = Number(btn.dataset.slot);
                const prev = d.equippedSkills.indexOf(id);
                if (prev !== -1) d.equippedSkills[prev] = null;
                d.equippedSkills[slot] = id;
                this.saveGame(false);
                this.renderModalContent();
            }));

        } else if (this.activeTab === 'tree') {
            body.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <div class="card-box flex-between">
                        <span style="font-size:12px; font-weight:900; color:#2dd4bf;">🌳 パッシブスキルツリー / 残りSP: <b style="color:#fde047; font-size:15px;">${d.sp}</b></span>
                        <span style="font-size:10px; color:#94a3b8;">転生後もすべて引き継がれます</span>
                    </div>
                    <div class="grid-2">
                        ${SKILL_TREE_NODES.map(node => {
                            const lv = d.tree[node.id] || 0;
                            const maxed = lv >= node.maxLv;
                            return `
                                <div class="card-box flex-between">
                                    <div>
                                        <div style="font-size:12px; font-weight:900; color:#fff;">${node.icon} ${node.name} <span style="color:#2dd4bf;">Lv.${lv}/${node.maxLv}</span></div>
                                        <div style="font-size:10px; color:#cbd5e1;">${node.desc}</div>
                                    </div>
                                    <button class="btn-up-tree btn-ui btn-emerald" data-id="${node.id}" ${(maxed || d.sp < 1) ? 'disabled' : ''}>${maxed ? 'MAX' : '+1 (SP1)'}</button>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
            body.querySelectorAll('.btn-up-tree').forEach(btn => btn.addEventListener('click', () => {
                const node = SKILL_TREE_NODES.find(n => n.id === btn.dataset.id);
                const lv = d.tree[node.id] || 0;
                if (d.sp < 1 || lv >= node.maxLv) return;
                d.sp -= 1;
                d.tree[node.id] = lv + 1;
                sfx.playSkill();
                this.saveGame(false);
                this.renderModalContent();
            }));

        } else if (this.activeTab === 'pet') {
            const petLv = d.petLevel || 1;
            const petUpCost = Math.round(350 * Math.pow(1.38, petLv - 1));
            const curPet = d.petId ? PETS[d.petId] : null;
            body.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <div class="card-box flex-between" style="flex-wrap:wrap;">
                        <div>
                            <div style="font-size:13px; font-weight:900; color:#38bdf8;">🐾 相棒ペット同行＆育成（ペットLv.${petLv}）</div>
                            <div style="font-size:11px; color:#fde047;">現在の相棒: ${curPet ? `${curPet.kaomoji} ${curPet.name}` : 'なし'}</div>
                        </div>
                        <button id="btn-pet-lvup" class="btn-ui btn-amber" ${d.gold < petUpCost ? 'disabled' : ''}>⬆ レベル強化 (+1) [${formatBigNum(petUpCost)}G]</button>
                    </div>
                    <div class="grid-2">
                        ${Object.values(PETS).map(p => {
                            const owned = (d.ownedPets || []).includes(p.id);
                            const active = d.petId === p.id;
                            const canBuy = d.gold >= p.costGold && this.hasEnoughMats(p.costMat);
                            return `
                                <div class="card-box flex-between" style="border-color:${active ? '#38bdf8' : '#1e293b'};">
                                    <div>
                                        <div class="font-kaomoji" style="font-size:13px; font-weight:900; color:#fde047;">${p.kaomoji} <span style="color:#fff;">${p.name}</span></div>
                                        <div style="font-size:10px; color:#cbd5e1;">${p.desc}</div>
                                        ${!owned ? `<div style="font-size:10px; color:#94a3b8;">${formatBigNum(p.costGold)}G / ${this.formatMatReqHtml(p.costMat)}</div>` : ''}
                                    </div>
                                    ${active ? '<span class="badge-pill" style="background:#059669; color:#fff;">同行中</span>'
                                        : (owned ? `<button class="btn-eq-pet btn-ui btn-sky" data-id="${p.id}">連れ歩く</button>`
                                            : `<button class="btn-buy-pet btn-ui btn-amber" data-id="${p.id}" ${!canBuy ? 'disabled' : ''}>仲間にする</button>`)}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
            document.getElementById('btn-pet-lvup')?.addEventListener('click', () => {
                if (d.gold < petUpCost) return;
                d.gold -= petUpCost;
                d.petLevel = (d.petLevel || 1) + 1;
                sfx.playSkill();
                this.saveGame(false);
                this.renderModalContent();
            });
            body.querySelectorAll('.btn-buy-pet').forEach(btn => btn.addEventListener('click', () => {
                const p = PETS[btn.dataset.id];
                d.gold -= p.costGold;
                this.consumeMats(p.costMat);
                if (!d.ownedPets) d.ownedPets = [];
                d.ownedPets.push(p.id);
                d.petId = p.id;
                this.buildPetEntity();
                sfx.playLevelUp();
                this.saveGame(false);
                this.renderModalContent();
            }));
            body.querySelectorAll('.btn-eq-pet').forEach(btn => btn.addEventListener('click', () => {
                d.petId = btn.dataset.id;
                this.buildPetEntity();
                this.saveGame(false);
                this.renderModalContent();
            }));

        } else if (this.activeTab === 'evolve') {
            const reb = d.rebirthCount || 0;
            const canRebirth = d.lv >= REBIRTH_REQ_LEVEL;
            body.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <div class="card-box flex-between" style="flex-wrap:wrap; border-color:rgba(251,191,36,0.55);">
                        <div>
                            <div style="font-size:12px; font-weight:900; color:#fde047;">♻️ 極限超越転生（現在: ${reb}回 / 永続全能力 +${reb * 35}%）</div>
                            <div style="font-size:10px; color:#cbd5e1;">Lv.${REBIRTH_REQ_LEVEL}以上で装備・素材・見た目・職業・ツリーを引き継ぎAP+15/SP+10獲得！</div>
                        </div>
                        <button id="btn-rebirth-do" class="btn-ui btn-amber" ${!canRebirth ? 'disabled' : ''}>
                            ${canRebirth ? '♻️ 極限転生を実行！' : `🔒 Lv.${REBIRTH_REQ_LEVEL}で解放 (現在Lv.${d.lv})`}
                        </button>
                    </div>
                    <div class="grid-3">
                        ${Object.values(EVOLUTIONS).filter(e => e.tier >= 1).map(e => {
                            const isCur = d.evolutionId === e.id;
                            const canEvo = this.canEvolveTo(e);
                            return `
                                <div class="card-box" style="border-color:${isCur ? '#fde047' : '#1e293b'}; display:flex; flex-direction:column; justify-content:space-between; gap:6px;">
                                    <div>
                                        <span class="badge-pill" style="background:${e.tier >= 4 ? '#c026d3' : '#312e81'}; color:#fff;">TIER ${e.tier} (Lv.${e.reqLv}〜)</span>
                                        <div class="font-kaomoji" style="font-size:14px; font-weight:900; text-align:center; padding:6px; margin:5px 0; border-radius:8px; background:#0f172a; color:${e.color};">${e.kaomoji}</div>
                                        <div style="font-size:12px; font-weight:900; color:#fff;">${e.name}</div>
                                        <div style="font-size:10px; color:#fde047;">${e.bonusText}</div>
                                        <div style="font-size:10px; color:#94a3b8;">${e.reqEvo ? `前提:${EVOLUTIONS[e.reqEvo].name} / ` : ''}${this.formatMatReqHtml(e.reqMat)}</div>
                                    </div>
                                    <button class="btn-do-evo btn-ui ${e.tier >= 4 ? 'btn-fuchsia' : 'btn-sky'}" data-id="${e.id}" ${(!canEvo || isCur) ? 'disabled' : ''}>
                                        ${isCur ? '✨ 現在の職業' : (canEvo ? '👑 進化/覚醒する！' : '条件未達成')}
                                    </button>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
            body.querySelectorAll('.btn-do-evo').forEach(btn => btn.addEventListener('click', () => {
                const targetEvo = EVOLUTIONS[btn.dataset.id];
                if (!targetEvo || !this.canEvolveTo(targetEvo)) return;
                this.consumeMats(targetEvo.reqMat);
                d.evolutionId = targetEvo.id;
                this.buildPlayerEntity();
                sfx.playLevelUp();
                this.saveGame(false);
                this.renderModalContent();
                this.showAlertBanner(`👑 「${targetEvo.name}」へ進化しました！`, 2200);
            }));
            document.getElementById('btn-rebirth-do')?.addEventListener('click', () => {
                if (d.lv < REBIRTH_REQ_LEVEL) return;
                this.openDialog('♻️ 極限超越転生の確認', `Lv.${d.lv} から Lv.1 へ転生しますか？\n（全基礎能力 +35% ＆ AP+15 / SP+10 獲得！）`, [
                    { text: 'キャンセル', primary: false },
                    { text: '♻️ 転生する！', primary: true, onClick: () => {
                        d.rebirthCount = (d.rebirthCount || 0) + 1;
                        d.lv = 1; d.exp = 0; d.ap += 15; d.sp += 10;
                        this.buildPlayerEntity();
                        const newSt = this.calcDerivedStats();
                        this.player.hp = newSt.maxHp; this.player.mp = newSt.maxMp;
                        sfx.playLevelUp();
                        this.saveGame(false);
                        this.closeGrowthModal();
                        this.showAlertBanner(`♻️ 極限超越転生 第${d.rebirthCount}周目突入！`, 2800);
                    }}
                ]);
            });

        } else if (this.activeTab === 'achieve') {
            const tr = d.statsTrack || { kills: 0, bossKills: 0, bestTowerFloor: 0 };
            body.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <div class="card-box">
                        <div style="font-size:12px; font-weight:900; color:#fde047; margin-bottom:6px;">👑 バフ付き称号（装備するだけで永続ステータスUP）</div>
                        <div class="grid-2">
                            ${Object.values(TITLES).map(t => {
                                const unlocked = (d.unlockedTitles || ['title_none']).includes(t.id);
                                const equipped = (d.equippedTitleId || 'title_none') === t.id;
                                return `
                                    <div class="card-box flex-between" style="opacity:${unlocked ? 1 : 0.45};">
                                        <div>
                                            <div style="font-size:12px; font-weight:900; color:#fff;">${t.name}</div>
                                            <div style="font-size:10px; color:#6ee7b7;">${t.bonusText}</div>
                                        </div>
                                        ${equipped ? '<span class="badge-pill" style="background:#059669; color:#fff;">装備中</span>'
                                            : (unlocked ? `<button class="btn-eq-title btn-ui btn-sky" data-id="${t.id}">装備</button>` : '<span style="font-size:10px; color:#94a3b8;">🔒 未解放</span>')}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                    <div class="grid-2">
                        ${ACHIEVEMENTS.map(a => {
                            const claimed = (d.claimedAchievements || []).includes(a.id);
                            const cur = a.key === 'rebirthCount' ? (d.rebirthCount || 0) : (tr[a.key] || 0);
                            const done = cur >= a.req;
                            return `
                                <div class="card-box flex-between">
                                    <div>
                                        <div style="font-size:12px; font-weight:900; color:#fff;">${a.name} (${Math.min(cur, a.req)}/${a.req})</div>
                                        <div style="font-size:10px; color:#cbd5e1;">${a.desc}</div>
                                        <div style="font-size:10px; color:#f0abfc;">報酬: AP+${a.rewardAp} / SP+${a.rewardSp}</div>
                                    </div>
                                    ${claimed ? '<span class="badge-pill" style="background:#1e293b; color:#94a3b8;">受取済</span>'
                                        : `<button class="btn-claim-ach btn-ui ${done ? 'btn-amber' : 'btn-slate'}" data-id="${a.id}" ${!done ? 'disabled' : ''}>${done ? '🎁 受取' : '進行中'}</button>`}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
            body.querySelectorAll('.btn-eq-title').forEach(btn => btn.addEventListener('click', () => {
                d.equippedTitleId = btn.dataset.id;
                this.saveGame(false);
                this.renderModalContent();
            }));
            body.querySelectorAll('.btn-claim-ach').forEach(btn => btn.addEventListener('click', () => {
                const a = ACHIEVEMENTS.find(x => x.id === btn.dataset.id);
                if (!a) return;
                if (!d.claimedAchievements) d.claimedAchievements = [];
                if (d.claimedAchievements.includes(a.id)) return;
                d.claimedAchievements.push(a.id);
                d.ap += a.rewardAp; d.sp += a.rewardSp;
                if (!d.unlockedTitles) d.unlockedTitles = ['title_none'];
                if (a.titleId && !d.unlockedTitles.includes(a.titleId)) {
                    d.unlockedTitles.push(a.titleId);
                    d.equippedTitleId = a.titleId;
                }
                sfx.playLevelUp();
                this.saveGame(false);
                this.renderModalContent();
            }));
        }
    }
});
