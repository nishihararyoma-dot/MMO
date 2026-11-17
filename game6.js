'use strict';

// =========================================================================
// 顔文字ファンタジー3D オンライン部屋・チャット同期・全操作制御 (game6.js)
// =========================================================================

Object.assign(KaomojiMMORPG.prototype, {

    getCleanFirebaseBaseUrl(rawUrl) {
        const trimmed = (rawUrl || '').trim().replace(/\/+$/, '');
        if (!trimmed) return '';
        if (!/^https?:\/\//i.test(trimmed)) return '';
        return trimmed;
    },

    sanitizeCloudId(rawId) {
        return (rawId || '').trim().replace(/[^a-zA-Z0-9_-]/g, '');
    },

    // ワンタッチ オンライン / オフライン切替
    toggleOnlineMode() {
        sfx.init();
        const d = this.saveData;
        if (this.fbConnected || d.onlineEnabled) {
            d.onlineEnabled = false;
            this.disconnectFirebase();
            this.refreshTitleScreen();
            this.refreshAllHUD();
        } else {
            d.onlineEnabled = true;
            this.saveGame(false);
            this.refreshTitleScreen();
            this.refreshAllHUD();
            if (d.firebaseUrl) {
                this.connectFirebase(d.firebaseUrl, false);
            } else {
                if (this.inTitleScreen) {
                    this.inTitleScreen = false;
                    document.getElementById('title-screen')?.classList.add('hidden');
                }
                this.openGrowthModal('online');
                this.showAlertBanner('🌐 初回のみFirebase URLを入力して接続してください', 2400);
            }
        }
    },

    async connectFirebase(rawUrl, silent = false) {
        const baseUrl = this.getCleanFirebaseBaseUrl(rawUrl);
        if (!baseUrl) {
            this.saveData.onlineEnabled = false;
            this.refreshTitleScreen();
            this.refreshAllHUD();
            if (!silent) this.showAlertBanner('⚠️ 有効なFirebase Realtime DatabaseのURLを入力してください', 2200);
            return;
        }

        try {
            const testRes = await fetch(`${baseUrl}/players/${this.saveData.playerUid}.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.buildMyOnlinePayload())
            });
            if (!testRes.ok) throw new Error('HTTP ' + testRes.status);

            this.saveData.firebaseUrl = baseUrl;
            this.saveData.onlineEnabled = true;
            this.fbConnected = true;
            this.fbLastEventTs = Date.now();
            this.saveGame(false);
            this.refreshTitleScreen();
            this.refreshAllHUD();
            if (this.isModalOpen && this.activeTab === 'online') this.renderModalContent();
            if (!silent) {
                sfx.playHeal();
                const roomLabel = this.saveData.roomPassEnabled ? '🔒 パスワード部屋' : '🌐 公開オンライン';
                this.showAlertBanner(`${roomLabel}に接続しました！`, 2200);
            }
        } catch (e) {
            this.fbConnected = false;
            this.refreshTitleScreen();
            this.refreshAllHUD();
            if (!silent) {
                this.showAlertBanner('❌ 接続に失敗しました（URLまたはデータベースの公開ルールを確認してください）', 2800);
            }
        }
    },

    disconnectFirebase() {
        if (this.saveData.firebaseUrl) {
            const baseUrl = this.saveData.firebaseUrl;
            fetch(`${baseUrl}/players/${this.saveData.playerUid}.json`, { method: 'DELETE' }).catch(() => {});
        }
        this.fbConnected = false;
        this.saveData.onlineEnabled = false;
        this.remotePlayers.forEach(rp => {
            if (rp.group && this.scene) this.scene.remove(rp.group);
            if (rp.plateEl) rp.plateEl.remove();
        });
        this.remotePlayers.clear();
        this.saveGame(false);
        this.refreshTitleScreen();
        this.refreshAllHUD();
        this.showAlertBanner('📴 オフラインモードに切り替えました', 1600);
    },

    // Firebase クラウドセーブ保存（冒険者ID＋合言葉保護付き）
    async saveToFirebaseCloud(rawId, rawPin) {
        if (!this.fbConnected || !this.saveData.firebaseUrl) {
            this.showAlertBanner('⚠️ 先にFirebase URLを接続してください', 2200);
            return;
        }
        const safeId = this.sanitizeCloudId(rawId);
        const pin = (rawPin || '').trim();
        if (safeId.length < 3) {
            this.showAlertBanner('⚠️ 冒険者IDは半角英数字3文字以上で入力してください', 2200);
            return;
        }
        if (pin.length < 4) {
            this.showAlertBanner('⚠️ 合言葉（暗証番号）は4文字以上で入力してください', 2200);
            return;
        }

        const baseUrl = this.saveData.firebaseUrl;
        try {
            const checkRes = await fetch(`${baseUrl}/cloudSaves/${safeId}.json`);
            if (checkRes.ok) {
                const existing = await checkRes.json();
                if (existing && existing.pin && existing.pin !== pin) {
                    this.showAlertBanner('❌ この冒険者IDは既に使われており、合言葉が一致しません', 2800);
                    return;
                }
            }

            this.saveData.cloudId = safeId;
            this.saveData.cloudPin = pin;
            this.saveGame(false);

            const payload = {
                cloudId: safeId,
                pin,
                updatedAt: Date.now(),
                saveData: this.saveData
            };

            const putRes = await fetch(`${baseUrl}/cloudSaves/${safeId}.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!putRes.ok) throw new Error('HTTP ' + putRes.status);

            sfx.playLevelUp();
            this.showAlertBanner(`☁️ クラウドセーブ完了！（ID: ${safeId}）`, 2400);
        } catch (e) {
            this.showAlertBanner('❌ クラウド保存に失敗しました', 2400);
        }
    },

    // Firebase クラウドセーブからデータ復元
    async loadFromFirebaseCloud(rawId, rawPin) {
        if (!this.fbConnected || !this.saveData.firebaseUrl) {
            this.showAlertBanner('⚠️ 先にFirebase URLを接続してください', 2200);
            return;
        }
        const safeId = this.sanitizeCloudId(rawId);
        const pin = (rawPin || '').trim();
        if (!safeId || !pin) {
            this.showAlertBanner('⚠️ 冒険者IDと合言葉を入力してください', 2000);
            return;
        }

        const baseUrl = this.saveData.firebaseUrl;
        try {
            const res = await fetch(`${baseUrl}/cloudSaves/${safeId}.json`);
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const record = await res.json();
            if (!record || !record.saveData) {
                this.showAlertBanner('❌ 指定された冒険者IDのデータが見つかりません', 2400);
                return;
            }
            if (record.pin !== pin) {
                this.showAlertBanner('❌ 合言葉（暗証番号）が違います', 2400);
                return;
            }

            const curUrl = this.saveData.firebaseUrl;
            const curUid = this.saveData.playerUid;
            const def = this.createDefaultSave();
            const loaded = record.saveData;

            this.saveData = {
                ...def,
                ...loaded,
                isNewSave: false,
                playerUid: curUid,
                firebaseUrl: curUrl,
                onlineEnabled: true,
                cloudId: safeId,
                cloudPin: pin,
                stats: { ...def.stats, ...(loaded.stats || {}) },
                skills: { ...def.skills, ...(loaded.skills || {}) },
                materials: { ...def.materials, ...(loaded.materials || {}) },
                statsTrack: { ...def.statsTrack, ...(loaded.statsTrack || {}) },
                ownedCosmetics: loaded.ownedCosmetics || ['none'],
                ownedBackCosmetics: loaded.ownedBackCosmetics || ['back_none']
            };

            this.saveGame(false);
            this.buildPlayerEntity();
            this.buildPetEntity();
            this.loadZone('town');
            this.closeGrowthModal();
            sfx.playLevelUp();
            this.showAlertBanner(`🎉 クラウドから「${safeId}」(Lv.${this.saveData.lv}) を復元しました！`, 2600);
        } catch (e) {
            this.showAlertBanner('❌ クラウド復元中にエラーが発生しました', 2400);
        }
    },

    buildMyOnlinePayload() {
        const d = this.saveData;
        return {
            uid: d.playerUid,
            roomKey: this.getCurrentRoomKey(),
            lv: d.lv || 1,
            kaomoji: this.getBasePlayerKaomoji(),
            bodyColor: d.bodyColor || '',
            faceBgColor: this.getPlayerFaceBgHex(),
            bodyScale: this.getPlayerBodyScale(),
            evolutionId: d.evolutionId || 'novice',
            cosmeticId: d.cosmeticId || 'none',
            backCosmeticId: d.backCosmeticId || 'back_none',
            weaponId: d.weaponId || 'wpn_wood',
            weaponEnhance: d.weaponEnhance || 0,
            armorId: d.armorId || 'arm_cloth',
            zoneId: this.towerState.active ? 'tower' : this.currentZoneId,
            threatRank: d.threatRank || 0,
            x: this.player ? Number(this.player.pos.x.toFixed(2)) : 0,
            z: this.player ? Number(this.player.pos.z.toFixed(2)) : 5,
            rotY: this.player ? Number(this.player.rotY.toFixed(2)) : 0,
            ts: Date.now()
        };
    },

    syncFirebaseNow() {
        if (!this.fbConnected || !this.saveData.firebaseUrl) return;
        const baseUrl = this.saveData.firebaseUrl;
        fetch(`${baseUrl}/players/${this.saveData.playerUid}.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.buildMyOnlinePayload())
        }).catch(() => {});
    },

    broadcastFirebaseEvent(type, payload) {
        if (!this.fbConnected || !this.saveData.firebaseUrl) return;
        const baseUrl = this.saveData.firebaseUrl;
        const body = {
            senderUid: this.saveData.playerUid,
            roomKey: this.getCurrentRoomKey(),
            type,
            payload,
            ts: Date.now()
        };
        fetch(`${baseUrl}/events.json`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }).catch(() => {});
    },

    updateFirebaseSync(dt) {
        if (!this.fbConnected || !this.saveData.firebaseUrl) return;

        this.fbSyncTimer += dt;
        if (this.fbSyncTimer >= 0.85) {
            this.fbSyncTimer = 0;
            this.syncFirebaseNow();
        }

        this.fbPollTimer += dt;
        if (this.fbPollTimer >= 1.0) {
            this.fbPollTimer = 0;
            this.pollFirebaseState();
        }
    },

    async pollFirebaseState() {
        const baseUrl = this.saveData.firebaseUrl;
        if (!baseUrl) return;
        const myUid = this.saveData.playerUid;
        const myRoomKey = this.getCurrentRoomKey();
        const now = Date.now();

        try {
            const pRes = await fetch(`${baseUrl}/players.json`);
            if (pRes.ok) {
                const playersObj = (await pRes.json()) || {};
                const activeUids = new Set();

                Object.values(playersObj).forEach(p => {
                    if (!p || !p.uid || p.uid === myUid) return;
                    if (now - (p.ts || 0) > 15000) return;

                    // 同じ部屋キー（公開部屋同士 または 同じパスワード同士）の人のみ表示！
                    const pRoom = p.roomKey || 'PUBLIC_OPEN_ROOM';
                    if (pRoom !== myRoomKey) return;

                    activeUids.add(p.uid);
                    this.upsertRemotePlayer(p);
                });

                for (const [uid, rp] of this.remotePlayers.entries()) {
                    if (!activeUids.has(uid)) {
                        if (rp.group && this.scene) this.scene.remove(rp.group);
                        if (rp.plateEl) rp.plateEl.remove();
                        this.remotePlayers.delete(uid);
                    }
                }
                this.refreshAllHUD();
            }

            const evRes = await fetch(`${baseUrl}/events.json`);
            if (evRes.ok) {
                const evObj = (await evRes.json()) || {};
                let maxTs = this.fbLastEventTs;
                Object.entries(evObj).forEach(([key, ev]) => {
                    if (!ev || !ev.ts) return;
                    if (now - ev.ts > 20000) {
                        fetch(`${baseUrl}/events/${key}.json`, { method: 'DELETE' }).catch(() => {});
                        return;
                    }
                    if (ev.ts > this.fbLastEventTs && ev.senderUid !== myUid) {
                        if (ev.ts > maxTs) maxTs = ev.ts;
                        this.handleIncomingRemoteEvent(ev);
                    }
                });
                this.fbLastEventTs = maxTs;
            }
        } catch (e) {}
    },

    upsertRemotePlayer(p) {
        const bScale = Number(p.bodyScale) || 1.0;
        const fBg = p.faceBgColor || '#073b66';
        const bCos = p.backCosmeticId || 'back_none';
        const appearanceSig = `${p.kaomoji}|${p.bodyColor}|${fBg}|${bScale}|${p.evolutionId}|${p.cosmeticId}|${bCos}|${p.weaponId}|${p.armorId}`;
        let rp = this.remotePlayers.get(p.uid);

        const evo = EVOLUTIONS[p.evolutionId] || EVOLUTIONS.novice;
        const bodyHex = (p.bodyColor && /^#[0-9a-fA-F]{6}$/.test(p.bodyColor))
            ? parseInt(p.bodyColor.slice(1), 16)
            : (evo.hexColor || 0x38bdf8);

        if (!rp || rp.appearanceSig !== appearanceSig) {
            if (rp && rp.group && this.scene) this.scene.remove(rp.group);
            if (rp && rp.plateEl) rp.plateEl.remove();

            const meshParts = this.buildAvatarGroup({
                kaomoji: p.kaomoji || '(´・ω・`)',
                bodyHex,
                faceBgHex: fBg,
                bodyScale: bScale,
                weaponId: p.weaponId || 'wpn_wood',
                weaponEnhance: p.weaponEnhance || 0,
                armorId: p.armorId || 'arm_cloth',
                cosmeticId: p.cosmeticId || 'none',
                backCosmeticId: bCos
            });

            const startPos = new THREE.Vector3(p.x || 0, 0, p.z || 5);
            if (this.useWebGL && this.scene) {
                meshParts.group.position.copy(startPos);
                meshParts.group.rotation.y = p.rotY || 0;
                this.scene.add(meshParts.group);
            }

            const plate = document.createElement('div');
            plate.className = 'world-plate';
            plate.innerHTML = `<div style="font-size:9px; font-weight:900; color:#f9a8d4;">Lv.${p.lv || 1} 仲間 (脅威+${p.threatRank || 0})</div>`;
            this.overlayLayer.appendChild(plate);

            rp = {
                uid: p.uid,
                appearanceSig,
                bodyScale: bScale,
                pos: startPos,
                targetPos: startPos.clone(),
                rotY: p.rotY || 0,
                targetRotY: p.rotY || 0,
                lv: p.lv || 1,
                kaomoji: p.kaomoji || '(´・ω・`)',
                zoneId: p.zoneId || 'town',
                threatRank: p.threatRank || 0,
                visible: true,
                headPlateEl: plate,
                plateEl: plate,
                ...meshParts
            };
            this.remotePlayers.set(p.uid, rp);
        } else {
            rp.targetPos.set(p.x || 0, 0, p.z || 5);
            rp.targetRotY = p.rotY || 0;
            rp.lv = p.lv || 1;
            rp.zoneId = p.zoneId || 'town';
            rp.threatRank = p.threatRank || 0;
            if (rp.plateEl) {
                rp.plateEl.innerHTML = `<div style="font-size:9px; font-weight:900; color:#f9a8d4;">Lv.${rp.lv} 仲間 (脅威+${rp.threatRank})</div>`;
            }
        }
    },

    updateRemotePlayers(dt) {
        const myZone = this.towerState.active ? 'tower' : this.currentZoneId;
        this.remotePlayers.forEach(rp => {
            const sameZone = (rp.zoneId === myZone && myZone !== 'tower');
            rp.visible = sameZone;
            if (rp.group) rp.group.visible = sameZone;

            rp.pos.lerp(rp.targetPos, Math.min(1, dt * 8));
            rp.rotY += (rp.targetRotY - rp.rotY) * Math.min(1, dt * 8);
            if (rp.group) {
                rp.group.position.copy(rp.pos);
                rp.group.rotation.y = rp.rotY;
            }
        });
    },

    getSameZoneRemoteCount() {
        if (this.towerState.active) return 0;
        let count = 0;
        this.remotePlayers.forEach(rp => {
            if (rp.zoneId === this.currentZoneId) count++;
        });
        return count;
    },

    handleIncomingRemoteEvent(ev) {
        if (!ev || !ev.payload) return;
        const myRoomKey = this.getCurrentRoomKey();
        const evRoomKey = ev.roomKey || 'PUBLIC_OPEN_ROOM';

        // 全体チャットは部屋に関係なく全員に届く！
        if (ev.type === 'chat_global') {
            this.addChatMessage('global', ev.payload.kaomoji, ev.payload.name, ev.payload.text, false);
            return;
        }

        // 以下は同じ部屋のメンバーのみ反映
        if (evRoomKey !== myRoomKey) return;

        if (ev.type === 'chat_room') {
            this.addChatMessage('room', ev.payload.kaomoji, ev.payload.name, ev.payload.text, false);
        } else if (ev.type === 'kill') {
            this.receiveCoopReward(ev.payload);
        } else if (ev.type === 'emote') {
            const rp = this.remotePlayers.get(ev.senderUid);
            if (rp && rp.visible) {
                this.spawnEmoteBubble(
                    rp.pos.clone().add(new THREE.Vector3(0, 2.7, 0)),
                    ev.payload.kaomoji || '(≧▽≦)',
                    ev.payload.msg || 'やっほー！'
                );
            }
        }
    },

    // -----------------------------------------------------------------
    // 全UI・タイトル画面・チャット・操作イベントバインド（完全修正版）
    // -----------------------------------------------------------------
    bindEvents() {
        // 1. タイトル画面のボタン群
        document.getElementById('title-btn-toggle-online')?.addEventListener('click', () => {
            this.toggleOnlineMode();
        });

        document.getElementById('title-btn-toggle-pass')?.addEventListener('click', () => {
            sfx.init();
            this.saveData.roomPassEnabled = !this.saveData.roomPassEnabled;
            this.saveGame(false);
            if (this.syncFirebaseNow) this.syncFirebaseNow();
            this.refreshTitleScreen();
            this.refreshAllHUD();
        });

        document.getElementById('title-input-room-pass')?.addEventListener('input', (e) => {
            this.saveData.roomPassword = e.target.value.trim();
            this.saveGame(false);
        });

        document.getElementById('btn-title-start')?.addEventListener('click', () => {
            this.enterGameFromTitle();
        });

        document.getElementById('btn-title-cloud')?.addEventListener('click', () => {
            sfx.init();
            this.inTitleScreen = false;
            document.getElementById('title-screen')?.classList.add('hidden');
            this.openGrowthModal('online');
        });

        document.getElementById('btn-title-hard-reset')?.addEventListener('click', () => {
            sfx.init();
            this.openDialog(
                '💥 データの完全初期化',
                'レベル・装備・素材・見た目・転生回数など\nすべてのデータを完全に消去して最初から始めますか？',
                [
                    { text: 'キャンセル', primary: false },
                    { text: '💥 完全に初期化する', primary: true, onClick: () => this.hardResetGame() }
                ]
            );
        });

        // 2. 上部HUDメニューボタン群
        document.getElementById('btn-hud-online-toggle')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleOnlineMode();
        });

        document.getElementById('btn-hud-room-lock')?.addEventListener('click', (e) => {
            e.stopPropagation();
            sfx.init();
            this.openGrowthModal('online');
        });

        document.getElementById('btn-open-travel')?.addEventListener('click', (e) => {
            e.stopPropagation();
            sfx.init();
            this.openGrowthModal('travel');
        });

        document.getElementById('btn-open-growth')?.addEventListener('click', (e) => {
            e.stopPropagation();
            sfx.init();
            this.openGrowthModal('stats');
        });

        document.getElementById('btn-close-modal')?.addEventListener('click', () => {
            this.closeGrowthModal();
        });

        document.getElementById('growth-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'growth-modal') this.closeGrowthModal();
        });

        // 歯車ドロワー＆エモート開閉
        document.getElementById('btn-toggle-drawer')?.addEventListener('click', (e) => {
            e.stopPropagation();
            sfx.init();
            document.getElementById('hud-drawer-menu')?.classList.toggle('hidden');
            document.getElementById('emote-palette')?.classList.add('hidden');
        });

        document.getElementById('btn-toggle-emote')?.addEventListener('click', (e) => {
            e.stopPropagation();
            sfx.init();
            document.getElementById('emote-palette')?.classList.toggle('hidden');
            document.getElementById('hud-drawer-menu')?.classList.add('hidden');
        });

        // 中央ワープ実行ボタン
        document.getElementById('btn-exec-warp')?.addEventListener('click', (e) => {
            e.stopPropagation();
            sfx.init();
            sfx.playSkill();
            if (this.currentZoneId === 'town') {
                this.openGrowthModal('travel');
            } else {
                this.loadZone('town');
                this.showAlertBanner('🏠 始まりの顔文字広場へ帰還しました！', 1600);
            }
        });

        // 歯車ドロワー内ボタン群
        document.getElementById('btn-toggle-autohunt')?.addEventListener('click', (e) => {
            e.stopPropagation();
            sfx.init();
            this.autoHunt = !this.autoHunt;
            e.currentTarget.textContent = this.autoHunt ? '🤖 AUTO:ON' : '🤖 AUTO:OFF';
            e.currentTarget.style.background = this.autoHunt ? '#059669' : '';
            this.showAlertBanner(this.autoHunt ? '🤖 オート狩り ON（自動追尾＆スキル発動）' : '🤖 オート狩り OFF', 1400);
        });

        const adjustThreatQuick = (delta) => {
            sfx.init();
            const d = this.saveData;
            d.threatRank = Math.max(0, Math.min(MAX_THREAT_RANK, (d.threatRank || 0) + delta));
            this.saveGame(false);
            if (!this.towerState.active) {
                this.loadZone(this.currentZoneId);
            } else {
                this.refreshAllHUD();
            }
            this.showAlertBanner(`🔥 脅威度ランク: +${d.threatRank}`, 1300);
        };
        document.getElementById('btn-threat-down')?.addEventListener('click', (e) => {
            e.stopPropagation();
            adjustThreatQuick(-1);
        });
        document.getElementById('btn-threat-up')?.addEventListener('click', (e) => {
            e.stopPropagation();
            adjustThreatQuick(1);
        });

        document.getElementById('btn-open-cloud')?.addEventListener('click', (e) => {
            e.stopPropagation();
            sfx.init();
            this.openGrowthModal('online');
        });

        document.getElementById('btn-manual-save')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.saveGame(true);
            document.getElementById('hud-drawer-menu')?.classList.add('hidden');
        });

        document.getElementById('btn-toggle-bgm')?.addEventListener('click', (e) => {
            e.stopPropagation();
            sfx.init();
            sfx.bgmMuted = !sfx.bgmMuted;
            e.currentTarget.textContent = sfx.bgmMuted ? '🔇 BGM:OFF' : '🔊 BGM:ON';
        });

        document.getElementById('btn-back-title')?.addEventListener('click', (e) => {
            e.stopPropagation();
            sfx.init();
            document.getElementById('hud-drawer-menu')?.classList.add('hidden');
            this.saveGame(false);
            this.showTitleScreen();
        });

        document.getElementById('btn-reset-save')?.addEventListener('click', (e) => {
            e.stopPropagation();
            sfx.init();
            document.getElementById('hud-drawer-menu')?.classList.add('hidden');
            this.openDialog(
                '💥 データの完全初期化',
                '本当にすべての進行データを削除して\n最初からやり直しますか？',
                [
                    { text: 'キャンセル', primary: false },
                    { text: '💥 完全に初期化する', primary: true, onClick: () => this.hardResetGame() }
                ]
            );
        });

        // 3. チャットUI（開閉・タブ切替・定型文・送信）
        document.getElementById('btn-toggle-chat')?.addEventListener('click', (e) => {
            e.stopPropagation();
            sfx.init();
            this.chatCollapsed = !this.chatCollapsed;
            const panel = document.getElementById('chat-panel');
            if (panel) panel.classList.toggle('hidden', this.chatCollapsed);
        });

        document.getElementById('btn-chat-tab-global')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.chatTab = 'global';
            this.renderChatMessages();
        });

        document.getElementById('btn-chat-tab-room')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.chatTab = 'room';
            this.renderChatMessages();
        });

        document.querySelectorAll('.chat-quick-chip').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.sendChatMessage(btn.dataset.msg || btn.textContent);
            });
        });

        const chatInp = document.getElementById('input-chat-msg');
        document.getElementById('btn-send-chat')?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!chatInp) return;
            this.sendChatMessage(chatInp.value);
            chatInp.value = '';
        });

        chatInp?.addEventListener('keydown', (e) => {
            e.stopPropagation();
            if (e.key === 'Enter') {
                e.preventDefault();
                this.sendChatMessage(chatInp.value);
                chatInp.value = '';
            }
        });

        // 4. 右下アーク型バトルパッド（攻撃＆標的切替）
        const atkBtn = document.getElementById('btn-basic-attack');
        if (atkBtn) {
            let lastAtkTouch = 0;
            const triggerBasicAtk = (e) => {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                const now = performance.now();
                if (now - lastAtkTouch < 110) return;
                lastAtkTouch = now;
                this.performBasicAttack();
            };
            atkBtn.addEventListener('touchstart', triggerBasicAtk, { passive: false });
            atkBtn.addEventListener('mousedown', triggerBasicAtk);
        }

        document.getElementById('btn-cycle-target')?.addEventListener('click', (e) => {
            e.stopPropagation();
            sfx.init();
            this.cycleTarget();
        });

        // 5. 画面タップでポップアップ閉じ＋3Dモンスター選択
        this.canvas?.addEventListener('click', (e) => {
            sfx.init();
            document.getElementById('hud-drawer-menu')?.classList.add('hidden');
            document.getElementById('emote-palette')?.classList.add('hidden');

            if (!this.useWebGL || !this.camera || this.monsters.length === 0) return;
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;

            let bestM = null;
            let bestDist = 52;
            this.monsters.forEach(m => {
                if (m.dead) return;
                const sc = this.projectToScreen(new THREE.Vector3(m.pos.x, (m.scale || 1) * 1.1, m.pos.z));
                if (!sc) return;
                const d = Math.hypot(sc.x - clickX, sc.y - clickY);
                if (d < bestDist) {
                    bestDist = d;
                    bestM = m;
                }
            });
            if (bestM) {
                this.selectedTarget = bestM;
                sfx.playTone(620, 'sine', 0.08, 0.06);
            }
        });

        // 6. キーボード操作（文字入力欄フォーカス中は誤爆防止）
        window.addEventListener('keydown', (e) => {
            const tag = (document.activeElement && document.activeElement.tagName) || '';
            if (tag === 'INPUT' || tag === 'TEXTAREA') return;

            this.keys[e.code] = true;
            if (this.inTitleScreen) return;
            if (this.isModalOpen) {
                if (e.code === 'Escape') this.closeGrowthModal();
                return;
            }
            if (e.code === 'Space') {
                e.preventDefault();
                this.performBasicAttack();
            }
            if (e.code === 'Digit1') this.useSkillSlot(0);
            if (e.code === 'Digit2') this.useSkillSlot(1);
            if (e.code === 'Digit3') this.useSkillSlot(2);
            if (e.code === 'Digit4') this.useSkillSlot(3);
            if (e.code === 'Digit5') this.useSkillSlot(4);
            if (e.code === 'Tab') {
                e.preventDefault();
                this.cycleTarget();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // 7. バーチャルジョイスティック
        const joyZone = document.getElementById('joystick-zone');
        const joyKnob = document.getElementById('joystick-knob');
        if (joyZone && joyKnob) {
            let joyActive = false;
            let joyTouchId = null;
            const maxR = 38;

            const updateJoy = (clientX, clientY) => {
                const rect = joyZone.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                let dx = clientX - cx;
                let dy = clientY - cy;
                const dist = Math.hypot(dx, dy);
                if (dist > maxR) {
                    dx = (dx / dist) * maxR;
                    dy = (dy / dist) * maxR;
                }
                joyKnob.style.transform = `translate(${dx}px, ${dy}px)`;
                this.joyVec.x = dx / maxR;
                this.joyVec.y = dy / maxR;
            };

            const resetJoy = () => {
                joyActive = false;
                joyTouchId = null;
                joyKnob.style.transform = 'translate(0px, 0px)';
                this.joyVec.x = 0;
                this.joyVec.y = 0;
            };

            joyZone.addEventListener('touchstart', (e) => {
                e.preventDefault();
                sfx.init();
                const t = e.changedTouches[0];
                joyActive = true;
                joyTouchId = t.identifier;
                updateJoy(t.clientX, t.clientY);
            }, { passive: false });

            window.addEventListener('touchmove', (e) => {
                if (!joyActive) return;
                for (let i = 0; i < e.changedTouches.length; i++) {
                    if (e.changedTouches[i].identifier === joyTouchId) {
                        updateJoy(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
                        break;
                    }
                }
            }, { passive: true });

            window.addEventListener('touchend', (e) => {
                if (!joyActive) return;
                for (let i = 0; i < e.changedTouches.length; i++) {
                    if (e.changedTouches[i].identifier === joyTouchId) {
                        resetJoy();
                        break;
                    }
                }
            });

            joyZone.addEventListener('mousedown', (e) => {
                e.preventDefault();
                sfx.init();
                joyActive = true;
                updateJoy(e.clientX, e.clientY);
            });

            window.addEventListener('mousemove', (e) => {
                if (joyActive) updateJoy(e.clientX, e.clientY);
            });

            window.addEventListener('mouseup', () => {
                if (joyActive) resetJoy();
            });
        }

        // 8. 3Dカメラ回転＆ズーム
        if (this.canvas) {
            let camDragging = false;
            let lastX = 0;
            let lastY = 0;
            let pinchDist = 0;

            this.canvas.addEventListener('mousedown', (e) => {
                camDragging = true;
                lastX = e.clientX;
                lastY = e.clientY;
            });

            window.addEventListener('mousemove', (e) => {
                if (!camDragging) return;
                const dx = e.clientX - lastX;
                const dy = e.clientY - lastY;
                lastX = e.clientX;
                lastY = e.clientY;
                this.camYaw -= dx * 0.007;
                this.camPitch = Math.max(0.18, Math.min(1.15, this.camPitch + dy * 0.006));
            });

            window.addEventListener('mouseup', () => {
                camDragging = false;
            });

            this.canvas.addEventListener('wheel', (e) => {
                e.preventDefault();
                this.camDist = Math.max(7.5, Math.min(26.0, this.camDist + e.deltaY * 0.01));
            }, { passive: false });

            this.canvas.addEventListener('touchstart', (e) => {
                sfx.init();
                if (e.touches.length === 1) {
                    camDragging = true;
                    lastX = e.touches[0].clientX;
                    lastY = e.touches[0].clientY;
                } else if (e.touches.length === 2) {
                    camDragging = false;
                    pinchDist = Math.hypot(
                        e.touches[0].clientX - e.touches[1].clientX,
                        e.touches[0].clientY - e.touches[1].clientY
                    );
                }
            }, { passive: true });

            this.canvas.addEventListener('touchmove', (e) => {
                if (e.touches.length === 1 && camDragging) {
                    const dx = e.touches[0].clientX - lastX;
                    const dy = e.touches[0].clientY - lastY;
                    lastX = e.touches[0].clientX;
                    lastY = e.touches[0].clientY;
                    this.camYaw -= dx * 0.008;
                    this.camPitch = Math.max(0.18, Math.min(1.15, this.camPitch + dy * 0.007));
                } else if (e.touches.length === 2) {
                    const newDist = Math.hypot(
                        e.touches[0].clientX - e.touches[1].clientX,
                        e.touches[0].clientY - e.touches[1].clientY
                    );
                    if (pinchDist > 0) {
                        this.camDist = Math.max(7.5, Math.min(26.0, this.camDist - (newDist - pinchDist) * 0.03));
                    }
                    pinchDist = newDist;
                }
            }, { passive: true });

            this.canvas.addEventListener('touchend', () => {
                camDragging = false;
                pinchDist = 0;
            });
        }
    }
});

// player.skillCds 初期化保証ラッパー
const _origBuildPlayerEntity = KaomojiMMORPG.prototype.buildPlayerEntity;
KaomojiMMORPG.prototype.buildPlayerEntity = function () {
    const prevCds = (this.player && this.player.skillCds) ? this.player.skillCds : [0, 0, 0, 0, 0];
    _origBuildPlayerEntity.call(this);
    if (this.player) {
        this.player.skillCds = prevCds;
    }
};

// ゲーム起動
window.addEventListener('DOMContentLoaded', () => {
    window.game = new KaomojiMMORPG();
});
