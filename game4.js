'use strict';

// =========================================================================
// 顔文字ファンタジー3D エフェクト・HUD更新・入力操作・メインループ (game4.js)
// =========================================================================

Object.assign(KaomojiMMORPG.prototype, {

    bindEvents() {
        // タイトル画面ボタン
        document.getElementById('title-btn-start')?.addEventListener('click', () => {
            this.enterGameFromTitle();
        });

        document.getElementById('title-btn-toggle-online')?.addEventListener('click', () => {
            this.saveData.onlineEnabled = !this.saveData.onlineEnabled;
            this.saveGame(false);
            this.refreshTitleScreen();
        });

        document.getElementById('title-btn-toggle-pass')?.addEventListener('click', () => {
            this.saveData.roomPassEnabled = !this.saveData.roomPassEnabled;
            this.saveGame(false);
            this.refreshTitleScreen();
        });

        document.getElementById('title-input-room-pass')?.addEventListener('input', (e) => {
            this.saveData.roomPassword = e.target.value;
            this.saveGame(false);
        });

        document.getElementById('title-btn-reset')?.addEventListener('click', () => {
            if (confirm('本当にすべてのセーブデータを初期化しますか？')) {
                this.hardResetGame();
            }
        });

        // チャットUI
        document.getElementById('btn-chat-tab-global')?.addEventListener('click', () => {
            this.chatTab = 'global';
            this.renderChatMessages();
        });

        document.getElementById('btn-chat-tab-room')?.addEventListener('click', () => {
            this.chatTab = 'room';
            this.renderChatMessages();
        });

        document.getElementById('btn-chat-toggle')?.addEventListener('click', () => {
            this.chatCollapsed = !this.chatCollapsed;
            const body = document.getElementById('chat-body');
            if (body) body.classList.toggle('hidden', this.chatCollapsed);
        });

        const chatInput = document.getElementById('chat-input');
        document.getElementById('btn-chat-send')?.addEventListener('click', () => {
            if (!chatInput) return;
            this.sendChatMessage(chatInput.value);
            chatInput.value = '';
        });
        chatInput?.addEventListener('keydown', (e) => {
            e.stopPropagation();
            if (e.key === 'Enter') {
                this.sendChatMessage(chatInput.value);
                chatInput.value = '';
            }
        });

        // HUDアクションボタン
        document.getElementById('btn-toggle-autohunt')?.addEventListener('click', () => {
            sfx.init();
            this.autoHunt = !this.autoHunt;
            const btn = document.getElementById('btn-toggle-autohunt');
            if (btn) {
                btn.textContent = this.autoHunt ? '🤖 AUTO:ON' : '🤖 AUTO:OFF';
                btn.style.background = this.autoHunt ? '#059669' : '';
            }
            this.showAlertBanner(this.autoHunt ? '🤖 オート狩りモード ON' : '⏹️ オート狩りモード OFF', 1100);
        });

        document.getElementById('btn-basic-attack')?.addEventListener('click', () => {
            sfx.init();
            this.performBasicAttack();
        });

        document.getElementById('btn-open-menu')?.addEventListener('click', () => {
            sfx.init();
            if (this.openGrowthModal) this.openGrowthModal(this.activeTab || 'stats');
        });

        document.getElementById('btn-close-modal')?.addEventListener('click', () => {
            if (this.closeGrowthModal) this.closeGrowthModal();
        });

        document.getElementById('btn-toggle-emote')?.addEventListener('click', () => {
            const pal = document.getElementById('emote-palette');
            if (pal) pal.classList.toggle('hidden');
        });

        document.getElementById('btn-return-town')?.addEventListener('click', () => {
            this.autoHunt = false;
            const btn = document.getElementById('btn-toggle-autohunt');
            if (btn) {
                btn.textContent = '🤖 AUTO:OFF';
                btn.style.background = '';
            }
            this.loadZone('town');
            this.showAlertBanner('🏰 始まりの顔文字広場へ帰還しました', 1400);
        });

        document.getElementById('btn-save-now')?.addEventListener('click', () => {
            this.saveGame(true);
        });

        // メニュータブ切り替え
        document.querySelectorAll('[data-menu-tab]').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.getAttribute('data-menu-tab');
                if (this.openGrowthModal) this.openGrowthModal(tab);
            });
        });

        // スキルスロットクリック（0〜4）
        for (let i = 0; i < 5; i++) {
            const slotEl = document.getElementById(`skill-slot-${i}`);
            if (slotEl) {
                slotEl.addEventListener('click', () => {
                    sfx.init();
                    this.useSkillSlot(i);
                });
            }
        }

        // キーボード操作
        window.addEventListener('keydown', (e) => {
            if (this.inTitleScreen) return;
            const tag = document.activeElement?.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA') return;

            this.keys[e.code] = true;
            if (e.code === 'Space') {
                e.preventDefault();
                this.performBasicAttack();
            } else if (e.code === 'Digit1') this.useSkillSlot(0);
            else if (e.code === 'Digit2') this.useSkillSlot(1);
            else if (e.code === 'Digit3') this.useSkillSlot(2);
            else if (e.code === 'Digit4') this.useSkillSlot(3);
            else if (e.code === 'Digit5') this.useSkillSlot(4);
            else if (e.code === 'Escape' && this.isModalOpen && this.closeGrowthModal) {
                this.closeGrowthModal();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // 仮想ジョイスティック
        const joyZone = document.getElementById('joy-zone');
        const joyStick = document.getElementById('joy-stick');
        if (joyZone && joyStick) {
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
                joyStick.style.transform = `translate(${dx}px, ${dy}px)`;
                this.joyVec.x = dx / maxR;
                this.joyVec.y = dy / maxR;
            };
            const resetJoy = () => {
                joyTouchId = null;
                joyStick.style.transform = 'translate(0px, 0px)';
                this.joyVec.x = 0;
                this.joyVec.y = 0;
            };

            joyZone.addEventListener('touchstart', (e) => {
                e.preventDefault();
                sfx.init();
                const t = e.changedTouches[0];
                joyTouchId = t.identifier;
                updateJoy(t.clientX, t.clientY);
            }, { passive: false });

            joyZone.addEventListener('touchmove', (e) => {
                e.preventDefault();
                for (const t of e.changedTouches) {
                    if (t.identifier === joyTouchId) {
                        updateJoy(t.clientX, t.clientY);
                        break;
                    }
                }
            }, { passive: false });

            joyZone.addEventListener('touchend', (e) => {
                for (const t of e.changedTouches) {
                    if (t.identifier === joyTouchId) resetJoy();
                }
            });
            joyZone.addEventListener('touchcancel', resetJoy);
        }

        // キャンバスドラッグでカメラ回転・ターゲット選択
        if (this.canvas) {
            let dragging = false;
            let lastX = 0;
            let lastY = 0;
            this.canvas.addEventListener('pointerdown', (e) => {
                dragging = true;
                lastX = e.clientX;
                lastY = e.clientY;
            });
            window.addEventListener('pointermove', (e) => {
                if (!dragging) return;
                const dx = e.clientX - lastX;
                const dy = e.clientY - lastY;
                lastX = e.clientX;
                lastY = e.clientY;
                this.camYaw -= dx * 0.0075;
                this.camPitch = Math.max(0.22, Math.min(1.15, this.camPitch + dy * 0.006));
            });
            window.addEventListener('pointerup', () => {
                dragging = false;
            });
            this.canvas.addEventListener('wheel', (e) => {
                this.camDist = Math.max(7.5, Math.min(26, this.camDist + e.deltaY * 0.008));
            }, { passive: true });
        }
    },

    buildEmotePalette() {
        const pal = document.getElementById('emote-palette');
        if (!pal || typeof EMOTES === 'undefined') return;
        pal.innerHTML = EMOTES.map(em => `
            <button type="button" class="btn-ui btn-slate" data-emote-id="${em.id}" style="padding:5px 7px; font-size:11px;">
                ${em.icon} ${em.label}
            </button>
        `).join('');

        pal.querySelectorAll('[data-emote-id]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-emote-id');
                this.triggerEmote(id);
                pal.classList.add('hidden');
            });
        });
    },

    triggerEmote(emoteId) {
        const em = (EMOTES || []).find(x => x.id === emoteId);
        if (!em || !this.player) return;
        sfx.init();
        sfx.playTone(720, 'sine', 0.1, 0.05);

        this.emoteMotion = em.motion || 'jump';
        this.emoteTimer = 1.2;

        // 顔テクスチャを一時的にエモート顔へ変更
        if (this.player.frontMat) {
            const hexStr = '#' + this.getPlayerBodyHexColor().toString(16).padStart(6, '0');
            this.player.frontMat.map = getKaomojiFaceTexture(em.kaomoji, this.getPlayerFaceBgHex(), '#fde047', hexStr);
            this.player.frontMat.needsUpdate = true;
        }

        this.spawnEmoteBubble(this.player.pos.clone().add(new THREE.Vector3(0, 2.7, 0)), em.kaomoji, em.msg);
        this.addChatMessage('room', em.kaomoji, `Lv.${this.saveData.lv}あなた`, em.msg, false);

        if (this.fbConnected && this.broadcastFirebaseEvent) {
            this.broadcastFirebaseEvent('emote', {
                kaomoji: em.kaomoji,
                name: `Lv.${this.saveData.lv}冒険者`,
                msg: em.msg,
                roomKey: this.getCurrentRoomKey()
            });
        }
    },

    spawnEmoteBubble(worldPos, kaomoji, msg) {
        if (!this.overlayLayer) return;
        const el = document.createElement('div');
        el.className = 'world-plate';
        el.style.background = 'rgba(15, 23, 42, 0.92)';
        el.style.border = '1px solid #38bdf8';
        el.style.borderRadius = '10px';
        el.style.padding = '3px 8px';
        el.style.zIndex = '25';
        el.innerHTML = `<div class="font-kaomoji" style="font-size:11px; color:#fde047; font-weight:900;">${kaomoji}</div><div style="font-size:10px; color:#fff;">${msg}</div>`;
        this.overlayLayer.appendChild(el);
        this.emoteBubbles.push({
            pos: worldPos.clone(),
            el,
            life: 2.6
        });
    },

    // 杖の通常攻撃用：遠距離魔法弾エフェクト
    spawnMagicBolt(startPos, targetPos, colorHex = 0xc084fc) {
        if (!this.useWebGL || !this.scene) return;
        const group = new THREE.Group();
        const core = new THREE.Mesh(
            new THREE.SphereGeometry(0.24, 12, 12),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        const aura = new THREE.Mesh(
            new THREE.SphereGeometry(0.42, 12, 12),
            new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.65 })
        );
        group.add(core, aura);
        group.position.copy(startPos);
        this.scene.add(group);

        this.effects.push({
            type: 'bolt',
            mesh: group,
            start: startPos.clone(),
            end: targetPos.clone(),
            color: colorHex,
            age: 0,
            dur: 0.16
        });
    },

    spawnSlashArc(pos, rotY, colorHex = 0x38bdf8, radius = 2.6) {
        if (!this.useWebGL || !this.scene) return;
        const mesh = new THREE.Mesh(
            new THREE.RingGeometry(radius * 0.45, radius, 20, 1, -Math.PI * 0.4, Math.PI * 0.8),
            new THREE.MeshBasicMaterial({ color: colorHex, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
        );
        mesh.rotation.x = -Math.PI / 2;
        mesh.rotation.z = -rotY + Math.PI / 2;
        mesh.position.set(pos.x, 1.0, pos.z);
        this.scene.add(mesh);
        this.effects.push({ type: 'fade', mesh, age: 0, dur: 0.24 });
    },

    spawnRingWave(pos, colorHex = 0x38bdf8, maxRadius = 4.5) {
        if (!this.useWebGL || !this.scene) return;
        const mesh = new THREE.Mesh(
            new THREE.RingGeometry(0.3, 0.7, 28),
            new THREE.MeshBasicMaterial({ color: colorHex, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
        );
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(pos.x, 0.18, pos.z);
        this.scene.add(mesh);
        this.effects.push({ type: 'ring', mesh, maxRadius, age: 0, dur: 0.42 });
    },

    spawnSparkleBurst(pos, colorHex = 0xfde047, count = 8) {
        if (!this.useWebGL || !this.scene) return;
        for (let i = 0; i < count; i++) {
            const mesh = new THREE.Mesh(
                new THREE.OctahedronGeometry(0.16, 0),
                new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.95 })
            );
            mesh.position.set(pos.x, 1.0, pos.z);
            const ang = (i / count) * Math.PI * 2 + Math.random() * 0.4;
            const spd = 3.0 + Math.random() * 4.5;
            this.scene.add(mesh);
            this.effects.push({
                type: 'particle',
                mesh,
                vx: Math.cos(ang) * spd,
                vy: 3.5 + Math.random() * 3.5,
                vz: Math.sin(ang) * spd,
                age: 0,
                dur: 0.45
            });
        }
    },

    spawnLightningStrike(pos) {
        if (!this.useWebGL || !this.scene) return;
        const bolt = new THREE.Mesh(
            new THREE.CylinderGeometry(0.18, 0.35, 14, 8),
            new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.92 })
        );
        bolt.position.set(pos.x, 7, pos.z);
        this.scene.add(bolt);
        this.effects.push({ type: 'fade', mesh: bolt, age: 0, dur: 0.28 });
        this.spawnRingWave(pos, 0xa855f7, 4.0);
    },

    spawnMeteorImpact(pos, radius = 6.5) {
        this.spawnRingWave(pos, 0xf97316, radius);
        this.spawnSparkleBurst(pos, 0xef4444, 14);
    },

    spawnFloatText(worldPos, text, color = '#ffffff', fontSize = 14) {
        if (!this.overlayLayer) return;
        const el = document.createElement('div');
        el.className = 'world-plate';
        el.style.color = color;
        el.style.fontSize = `${fontSize}px`;
        el.style.fontWeight = '900';
        el.style.textShadow = '0 2px 4px rgba(0,0,0,0.95)';
        el.style.pointerEvents = 'none';
        el.style.zIndex = '30';
        el.textContent = text;
        this.overlayLayer.appendChild(el);

        this.floatTexts.push({
            pos: worldPos.clone(),
            el,
            age: 0,
            dur: 0.95
        });
    },

    showAlertBanner(msg, durationMs = 1800) {
        const el = document.getElementById('alert-banner');
        if (!el) return;
        el.textContent = msg;
        el.classList.remove('hidden');
        clearTimeout(this._alertTimer);
        this._alertTimer = setTimeout(() => {
            el.classList.add('hidden');
        }, durationMs);
    },

    projectToScreen(worldPos) {
        if (!this.camera) return null;
        const v = worldPos.clone().project(this.camera);
        if (v.z > 1) return null;
        return {
            x: (v.x * 0.5 + 0.5) * window.innerWidth,
            y: (-v.y * 0.5 + 0.5) * window.innerHeight
        };
    },

    updateVisualEffects(dt, elapsed) {
        // プレイヤーモデル位置＆モーション反映
        if (this.player && this.player.group) {
            let yOffset = 0;
            let extraRotY = 0;
            let extraRotX = 0;

            if (this.emoteTimer > 0) {
                this.emoteTimer = Math.max(0, this.emoteTimer - dt);
                if (this.emoteMotion === 'jump') yOffset = Math.abs(Math.sin(elapsed * 14)) * 0.65;
                else if (this.emoteMotion === 'spin') extraRotY = elapsed * 14;
                else if (this.emoteMotion === 'bow') extraRotX = 0.75;

                if (this.emoteTimer === 0 && this.player.frontMat) {
                    const hexStr = '#' + this.getPlayerBodyHexColor().toString(16).padStart(6, '0');
                    this.player.frontMat.map = getKaomojiFaceTexture(this.getBasePlayerKaomoji(), this.getPlayerFaceBgHex(), '#ffffff', hexStr);
                    this.player.frontMat.needsUpdate = true;
                }
            }

            this.player.group.position.set(this.player.pos.x, yOffset, this.player.pos.z);
            this.player.group.rotation.set(extraRotX, this.player.rotY + extraRotY, 0);

            // 武器振り・杖魔法詠唱モーション
            if (this.player.wpnGroup) {
                if (this.player.skillAnimTimer > 0) {
                    const p = 1 - (this.player.skillAnimTimer / (this.player.skillAnimDur || 0.25));
                    if (this.player.skillAnimType === 'staff_cast' || this.player.skillAnimType === 'cast') {
                        // 杖を前に突き出して宝珠を輝かせるモーション
                        this.player.wpnGroup.rotation.x = -Math.sin(p * Math.PI) * 0.85;
                        this.player.wpnGroup.position.z = 0.18 + Math.sin(p * Math.PI) * 0.35;
                    } else {
                        // 剣の斬り下ろしモーション
                        this.player.wpnGroup.rotation.x = Math.sin(p * Math.PI) * 1.45;
                        this.player.wpnGroup.position.z = 0.18;
                    }
                } else {
                    this.player.wpnGroup.rotation.x = 0;
                    this.player.wpnGroup.position.z = 0.18;
                }
            }

            if (this.player.orbitPart) {
                this.player.orbitPart.rotation.y = elapsed * 3.5;
                this.player.orbitPart.position.set(Math.cos(elapsed * 3) * 0.85, 1.3 + Math.sin(elapsed * 4) * 0.15, Math.sin(elapsed * 3) * 0.85);
            }
            if (this.player.backHalo) {
                this.player.backHalo.rotation.z = elapsed * 1.6;
            }
        }

        if (this.warpCrystal) {
            this.warpCrystal.rotation.y = elapsed * 1.8;
            this.warpCrystal.position.y = 2.35 + Math.sin(elapsed * 3) * 0.2;
        }

        // 3Dエフェクト更新（魔法弾・リング・パーティクル）
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const ef = this.effects[i];
            ef.age += dt;
            const t = Math.min(1, ef.age / ef.dur);

            if (ef.type === 'bolt') {
                ef.mesh.position.lerpVectors(ef.start, ef.end, t);
                ef.mesh.rotation.y += dt * 18;
                if (t >= 1) {
                    this.spawnSparkleBurst(ef.end, ef.color, 5);
                }
            } else if (ef.type === 'ring') {
                const sc = 1 + t * (ef.maxRadius || 4);
                ef.mesh.scale.set(sc, sc, 1);
                ef.mesh.material.opacity = (1 - t) * 0.85;
            } else if (ef.type === 'fade') {
                ef.mesh.material.opacity = (1 - t) * 0.9;
            } else if (ef.type === 'particle') {
                ef.mesh.position.x += ef.vx * dt;
                ef.mesh.position.y += ef.vy * dt;
                ef.mesh.position.z += ef.vz * dt;
                ef.vy -= 12 * dt;
                ef.mesh.material.opacity = 1 - t;
            }

            if (ef.age >= ef.dur) {
                if (this.scene) this.scene.remove(ef.mesh);
                this.effects.splice(i, 1);
            }
        }

        // フローティングダメージテキスト更新
        for (let i = this.floatTexts.length - 1; i >= 0; i--) {
            const ft = this.floatTexts[i];
            ft.age += dt;
            ft.pos.y += 1.35 * dt;
            const scr = this.projectToScreen(ft.pos);
            if (scr) {
                ft.el.style.display = 'block';
                ft.el.style.left = `${scr.x}px`;
                ft.el.style.top = `${scr.y}px`;
                ft.el.style.opacity = String(Math.max(0, 1 - ft.age / ft.dur));
            } else {
                ft.el.style.display = 'none';
            }
            if (ft.age >= ft.dur) {
                ft.el.remove();
                this.floatTexts.splice(i, 1);
            }
        }

        // エモート吹き出し更新
        for (let i = this.emoteBubbles.length - 1; i >= 0; i--) {
            const eb = this.emoteBubbles[i];
            eb.life -= dt;
            if (this.player) {
                eb.pos.set(this.player.pos.x, 2.75, this.player.pos.z);
            }
            const scr = this.projectToScreen(eb.pos);
            if (scr) {
                eb.el.style.display = 'block';
                eb.el.style.left = `${scr.x}px`;
                eb.el.style.top = `${scr.y}px`;
            } else {
                eb.el.style.display = 'none';
            }
            if (eb.life <= 0) {
                eb.el.remove();
                this.emoteBubbles.splice(i, 1);
            }
        }
    },

    refreshAllHUD() {
        const d = this.saveData;
        const st = this.calcDerivedStats();
        const evo = EVOLUTIONS[d.evolutionId] || EVOLUTIONS.novice;
        const wpn = WEAPONS[d.weaponId] || WEAPONS.wpn_wood;

        const nameEl = document.getElementById('hud-player-name');
        if (nameEl) {
            nameEl.textContent = `${this.getBasePlayerKaomoji()} ${evo.name}`;
        }

        const lvEl = document.getElementById('hud-lv');
        if (lvEl) lvEl.textContent = `Lv.${d.lv}`;

        const goldEl = document.getElementById('hud-gold');
        if (goldEl) goldEl.textContent = `${formatBigNum(d.gold)}G`;

        const zoneEl = document.getElementById('hud-zone-name');
        if (zoneEl) {
            if (this.towerState && this.towerState.active) {
                zoneEl.textContent = `🗼 試練の塔 第${this.towerState.floor}階層`;
            } else {
                const z = ZONES[this.currentZoneId] || ZONES.town;
                zoneEl.textContent = z.name;
            }
        }

        // 左上攻撃力表示（杖装備時は魔法攻撃力を強調）
        const atkEl = document.getElementById('hud-atk');
        if (atkEl) {
            atkEl.textContent = st.isStaffEquipped
                ? `🪄魔法攻 ${formatBigNum(st.magAtk)}`
                : `⚔️物理攻 ${formatBigNum(st.physAtk)}`;
        }

        // 通常攻撃ボタンのアイコン切り替え
        const basicBtn = document.getElementById('btn-basic-attack');
        if (basicBtn) {
            basicBtn.textContent = st.isStaffEquipped ? '🪄 魔法弾' : '⚔️ 攻撃';
        }

        // HP / MP / EXP バー更新
        const needExp = this.getExpNeeded(d.lv);
        const expPct = d.lv >= MAX_PLAYER_LEVEL ? 100 : Math.min(100, (d.exp / needExp) * 100);
        if (this.player) {
            const hpPct = Math.max(0, Math.min(100, (this.player.hp / st.maxHp) * 100));
            const mpPct = Math.max(0, Math.min(100, (this.player.mp / st.maxMp) * 100));

            const hpBar = document.getElementById('hud-hp-bar');
            const mpBar = document.getElementById('hud-mp-bar');
            const expBar = document.getElementById('hud-exp-bar');
            const hpTxt = document.getElementById('hud-hp-text');
            const mpTxt = document.getElementById('hud-mp-text');

            if (hpBar) hpBar.style.width = `${hpPct}%`;
            if (mpBar) mpBar.style.width = `${mpPct}%`;
            if (expBar) expBar.style.width = `${expPct}%`;
            if (hpTxt) hpTxt.textContent = `${formatBigNum(this.player.hp)}/${formatBigNum(st.maxHp)}`;
            if (mpTxt) mpTxt.textContent = `${formatBigNum(this.player.mp)}/${formatBigNum(st.maxMp)}`;

            // プレイヤー頭上プレート更新
            const pLv = document.getElementById('p-head-lv');
            const pHp = document.getElementById('p-head-hp');
            const pMp = document.getElementById('p-head-mp');
            const pExp = document.getElementById('p-head-exp');
            if (pLv) pLv.textContent = `Lv.${d.lv}`;
            if (pHp) pHp.style.width = `${hpPct}%`;
            if (pMp) pMp.style.width = `${mpPct}%`;
            if (pExp) pExp.style.width = `${expPct}%`;

            const pScr = this.projectToScreen(this.player.pos.clone().add(new THREE.Vector3(0, 2.35 * this.getPlayerBodyScale(), 0)));
            if (this.player.headPlateEl && pScr) {
                this.player.headPlateEl.style.left = `${pScr.x}px`;
                this.player.headPlateEl.style.top = `${pScr.y}px`;
            }
        }

        // スキルスロット1〜5の表示更新（5倍＋Lvごと+10の消費MP反映）
        const eqSkills = d.equippedSkills || [];
        const cds = this.skillCooldowns || [0, 0, 0, 0, 0];
        for (let i = 0; i < 5; i++) {
            const slotEl = document.getElementById(`skill-slot-${i}`);
            if (!slotEl) continue;
            const sid = eqSkills[i];
            const sk = sid ? SKILLS[sid] : null;
            if (!sk) {
                slotEl.innerHTML = `<span style="font-size:10px; color:#64748b;">空</span>`;
                slotEl.style.opacity = '0.5';
                continue;
            }
            const skLv = Math.max(1, (d.skills && d.skills[sid]) || 1);
            const mpCost = getSkillMpCost(sk, skLv);
            const cd = cds[i] || 0;
            const lackMp = this.player && this.player.mp < mpCost;

            slotEl.style.opacity = (cd > 0 || lackMp) ? '0.6' : '1';
            slotEl.innerHTML = `
                <div style="font-size:16px; line-height:1;">${sk.icon}</div>
                <div style="font-size:9px; font-weight:900; color:#fff; white-space:nowrap;">${sk.name.slice(0, 4)}</div>
                <div style="font-size:8px; color:${lackMp ? '#f87171' : '#38bdf8'}; font-weight:900;">MP${mpCost}</div>
                ${cd > 0 ? `<div style="position:absolute; inset:0; background:rgba(0,0,0,0.68); display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:900; color:#fde047; border-radius:8px;">${cd.toFixed(1)}</div>` : ''}
            `;
        }

        // モンスター頭上HPプレート投影
        for (const m of this.monsters) {
            if (m.dead || !m.plateEl) continue;
            const scr = this.projectToScreen(m.pos.clone().add(new THREE.Vector3(0, 1.65 * (m.scale || 1), 0)));
            if (!scr) {
                m.plateEl.style.display = 'none';
                continue;
            }
            m.plateEl.style.display = 'block';
            m.plateEl.style.left = `${scr.x}px`;
            m.plateEl.style.top = `${scr.y}px`;
            const fill = m.plateEl.querySelector('.m-hp-fill');
            if (fill) {
                fill.style.width = `${Math.max(0, Math.min(100, (m.hp / m.maxHp) * 100))}%`;
            }
        }
    },

    loop(now) {
        const dt = Math.min(0.05, Math.max(0.001, (now - this.lastTime) / 1000));
        this.lastTime = now;
        const elapsed = now / 1000;

        if (!this.inTitleScreen) {
            this.updateCombatAndEntities(dt, elapsed);
        }
        this.updateVisualEffects(dt, elapsed);
        this.refreshAllHUD();

        // カメラ追従
        if (this.camera && this.player) {
            const shakeX = this.camShake > 0 ? (Math.random() - 0.5) * this.camShake : 0;
            const shakeY = this.camShake > 0 ? (Math.random() - 0.5) * this.camShake : 0;
            if (this.camShake > 0) this.camShake = Math.max(0, this.camShake - dt * 1.4);

            const hDist = Math.cos(this.camPitch) * this.camDist;
            const vDist = Math.sin(this.camPitch) * this.camDist;
            this.camera.position.set(
                this.player.pos.x + Math.sin(this.camYaw) * hDist + shakeX,
                vDist + 1.2 + shakeY,
                this.player.pos.z + Math.cos(this.camYaw) * hDist
            );
            this.camera.lookAt(this.player.pos.x, 1.2, this.player.pos.z);
        }

        if (this.useWebGL && this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }

        if (this.fbConnected && this.updateFirebaseSync) {
            this.updateFirebaseSync(dt);
        }

        requestAnimationFrame((t) => this.loop(t));
    }
});
