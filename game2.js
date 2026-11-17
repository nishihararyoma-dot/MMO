'use strict';

// =========================================================================
// 顔文字ファンタジー3D ワールド・アバター・見た目パーツ・ステージ生成 (game2.js)
// =========================================================================

Object.assign(KaomojiMMORPG.prototype, {

    initThree() {
        if (typeof THREE === 'undefined') return;
        try {
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x0c4a6e);
            this.scene.fog = new THREE.FogExp2(0x0c4a6e, 0.011);

            this.camera = new THREE.PerspectiveCamera(54, window.innerWidth / window.innerHeight, 0.1, 220);
            this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, powerPreference: 'high-performance' });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
            this.useWebGL = true;

            const hemi = new THREE.HemisphereLight(0xe0f2fe, 0x1e293b, 0.95);
            this.scene.add(hemi);

            const dir = new THREE.DirectionalLight(0xffffff, 0.9);
            dir.position.set(18, 32, 22);
            this.scene.add(dir);

            // フィールド地面＆外周リング
            const groundGeo = new THREE.CircleGeometry(58, 48);
            this.groundMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.85 });
            const ground = new THREE.Mesh(groundGeo, this.groundMat);
            ground.rotation.x = -Math.PI / 2;
            this.scene.add(ground);

            const ringGeo = new THREE.RingGeometry(56.5, 58.2, 48);
            const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.45 });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = -Math.PI / 2;
            ring.position.y = 0.04;
            this.scene.add(ring);

            // 中央ワープポータル
            this.warpGroup = new THREE.Group();
            this.warpGroup.position.set(0, 0, -9);

            const padMesh = new THREE.Mesh(
                new THREE.CylinderGeometry(2.6, 2.9, 0.18, 24),
                new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x0369a1, emissiveIntensity: 0.6 })
            );
            padMesh.position.y = 0.09;
            this.warpGroup.add(padMesh);

            const portalRing = new THREE.Mesh(
                new THREE.TorusGeometry(2.3, 0.12, 12, 32),
                new THREE.MeshBasicMaterial({ color: 0x6ee7b7 })
            );
            portalRing.rotation.x = Math.PI / 2;
            portalRing.position.y = 0.22;
            this.warpGroup.add(portalRing);

            this.warpCrystal = new THREE.Mesh(
                new THREE.OctahedronGeometry(0.65, 0),
                new THREE.MeshStandardMaterial({ color: 0x34d399, emissive: 0x10b981, emissiveIntensity: 0.85 })
            );
            this.warpCrystal.position.y = 2.35;
            this.warpGroup.add(this.warpCrystal);

            this.scene.add(this.warpGroup);

            window.addEventListener('resize', () => {
                if (!this.camera || !this.renderer) return;
                this.camera.aspect = window.innerWidth / window.innerHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(window.innerWidth, window.innerHeight);
            });
        } catch (e) {
            this.useWebGL = false;
        }
    },

    // 頭パーツ（9種）
    attachHeadCosmetic(cosmeticId, headGroup, bodyHex) {
        if (!cosmeticId || cosmeticId === 'none') return;
        const bodyMat = new THREE.MeshStandardMaterial({ color: bodyHex, roughness: 0.45 });
        const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
        const pinkMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.4 });
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xfde047, emissive: 0xd97706, emissiveIntensity: 0.4, metalness: 0.6 });

        if (cosmeticId === 'sprout') {
            const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.45, 8), new THREE.MeshStandardMaterial({ color: 0x22c55e }));
            stem.position.set(0, 0.68, 0);
            headGroup.add(stem);
            const leafGeo = new THREE.SphereGeometry(0.18, 10, 8);
            leafGeo.scale(1.5, 0.35, 0.8);
            const l1 = new THREE.Mesh(leafGeo, new THREE.MeshStandardMaterial({ color: 0x4ade80 }));
            l1.position.set(-0.2, 0.88, 0);
            l1.rotation.z = 0.35;
            const l2 = l1.clone();
            l2.position.set(0.2, 0.88, 0);
            l2.rotation.z = -0.35;
            headGroup.add(l1, l2);

        } else if (cosmeticId === 'cat_ears') {
            [-0.42, 0.42].forEach((x, idx) => {
                const ear = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.46, 4), bodyMat);
                ear.position.set(x, 0.66, 0.05);
                ear.rotation.z = idx === 0 ? 0.25 : -0.25;
                const inner = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.28, 4), pinkMat);
                inner.position.set(x, 0.63, 0.11);
                inner.rotation.z = idx === 0 ? 0.25 : -0.25;
                headGroup.add(ear, inner);
            });

        } else if (cosmeticId === 'bunny_ears') {
            [-0.32, 0.32].forEach((x, idx) => {
                const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.88, 10), whiteMat);
                ear.position.set(x, 0.88, 0);
                ear.rotation.z = idx === 0 ? 0.14 : -0.14;
                const inner = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.68, 8), pinkMat);
                inner.position.set(x, 0.86, 0.06);
                inner.rotation.z = idx === 0 ? 0.14 : -0.14;
                headGroup.add(ear, inner);
            });

        } else if (cosmeticId === 'fox_ears') {
            const foxMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.45 });
            [-0.44, 0.44].forEach((x, idx) => {
                const ear = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.56, 4), foxMat);
                ear.position.set(x, 0.7, 0.04);
                ear.rotation.z = idx === 0 ? 0.28 : -0.28;
                const tip = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.24, 4), whiteMat);
                tip.position.set(x, 0.86, 0.04);
                tip.rotation.z = idx === 0 ? 0.28 : -0.28;
                headGroup.add(ear, tip);
            });

        } else if (cosmeticId === 'cat_headphone') {
            const band = new THREE.Mesh(new THREE.TorusGeometry(0.66, 0.06, 8, 24, Math.PI), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
            band.position.set(0, 0.12, 0);
            headGroup.add(band);
            const neonMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
            [-0.72, 0.72].forEach(x => {
                const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.14, 14), neonMat);
                cup.rotation.z = Math.PI / 2;
                cup.position.set(x, 0.05, 0);
                headGroup.add(cup);
            });
            [-0.42, 0.42].forEach((x, idx) => {
                const tri = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.34, 3), neonMat);
                tri.position.set(x, 0.76, 0);
                tri.rotation.z = idx === 0 ? 0.22 : -0.22;
                headGroup.add(tri);
            });

        } else if (cosmeticId === 'witch_hat') {
            const hatMat = new THREE.MeshStandardMaterial({ color: 0x4c1d95, roughness: 0.5 });
            const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.06, 24), hatMat);
            brim.position.set(0, 0.52, 0);
            const cone = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.05, 20), hatMat);
            cone.position.set(0, 1.02, -0.04);
            cone.rotation.x = -0.14;
            const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 0), goldMat);
            star.position.set(0, 0.75, 0.45);
            headGroup.add(brim, cone, star);

        } else if (cosmeticId === 'demon_horns') {
            const hornMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, emissive: 0x450a0a, metalness: 0.4 });
            [-0.38, 0.38].forEach((x, idx) => {
                const horn = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.62, 10), hornMat);
                horn.position.set(x, 0.72, 0.08);
                horn.rotation.z = idx === 0 ? 0.42 : -0.42;
                horn.rotation.x = 0.25;
                headGroup.add(horn);
            });

        } else if (cosmeticId === 'angel_halo') {
            const halo = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.05, 10, 24), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
            halo.rotation.x = Math.PI / 2;
            halo.position.set(0, 0.85, 0);
            headGroup.add(halo);

        } else if (cosmeticId === 'royal_crown') {
            const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.38, 0.34, 8), goldMat);
            crown.position.set(0, 0.66, 0);
            const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.11, 0), new THREE.MeshBasicMaterial({ color: 0xf43f5e }));
            gem.position.set(0, 0.68, 0.41);
            headGroup.add(crown, gem);
        }
    },

    // 背中パーツ（6種：頭パーツと同時装着可能！）
    attachBackCosmetic(backId, rootGroup, bodyHex) {
        if (!backId || backId === 'back_none') return null;
        const bodyMat = new THREE.MeshStandardMaterial({ color: bodyHex, roughness: 0.45 });
        const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35 });
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xfde047, emissive: 0xd97706, emissiveIntensity: 0.35 });

        if (backId === 'cat_tail') {
            const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.0, 10), bodyMat);
            tail.position.set(0, 0.72, -0.58);
            tail.rotation.x = -0.78;
            rootGroup.add(tail);

        } else if (backId === 'fox_tails') {
            const foxMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.45 });
            [-0.35, 0, 0.35].forEach((ang, idx) => {
                const sub = new THREE.Group();
                sub.position.set(0, 0.56, -0.45);
                sub.rotation.y = ang;
                const tBody = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 10), foxMat);
                tBody.scale.set(0.85, 0.85, 1.9);
                tBody.position.set(0, 0.16, -0.35);
                tBody.rotation.x = 0.45;
                const tTip = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), whiteMat);
                tTip.position.set(0, 0.36, -0.72);
                sub.add(tBody, tTip);
                rootGroup.add(sub);
            });

        } else if (backId === 'hero_cape') {
            const cape = new THREE.Mesh(
                new THREE.BoxGeometry(0.92, 1.05, 0.06),
                new THREE.MeshStandardMaterial({ color: 0xbe123c, roughness: 0.5 })
            );
            cape.position.set(0, 0.65, -0.48);
            cape.rotation.x = 0.22;
            const trim = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.1, 0.07), goldMat);
            trim.position.set(0, 0.16, -0.58);
            trim.rotation.x = 0.22;
            rootGroup.add(cape, trim);

        } else if (backId === 'demon_wings') {
            const wingMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, emissive: 0x3b0764, emissiveIntensity: 0.35, side: THREE.DoubleSide });
            [-0.64, 0.64].forEach((x, idx) => {
                const wing = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.52, 0.06), wingMat);
                wing.position.set(x, 0.98, -0.48);
                wing.rotation.y = idx === 0 ? -0.42 : 0.42;
                wing.rotation.z = idx === 0 ? 0.28 : -0.28;
                rootGroup.add(wing);
            });

        } else if (backId === 'angel_wings') {
            [-0.68, 0.68].forEach((x, idx) => {
                const wing = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.56, 0.07), whiteMat);
                wing.position.set(x, 1.04, -0.48);
                wing.rotation.y = idx === 0 ? -0.38 : 0.38;
                wing.rotation.z = idx === 0 ? 0.24 : -0.24;
                rootGroup.add(wing);
            });

        } else if (backId === 'flame_aura') {
            const aura = new THREE.Mesh(
                new THREE.TorusGeometry(0.96, 0.06, 10, 28),
                new THREE.MeshBasicMaterial({ color: 0xfde047 })
            );
            aura.position.set(0, 1.38, -0.56);
            rootGroup.add(aura);
            return aura;
        }
        return null;
    },

    // 上向きに凛々しく構える武器3Dモデル（回転軸をグリップ根元に配置）
    buildWeaponGroup(wpn) {
        const g = new THREE.Group();
        const bladeMat = new THREE.MeshStandardMaterial({
            color: wpn.bladeColor || 0xe2e8f0,
            emissive: wpn.glowColor || 0x38bdf8,
            emissiveIntensity: 0.42,
            metalness: 0.6,
            roughness: 0.22
        });

        // 柄（グリップ）は Y=0 を中心に上下へ伸びる
        const hilt = new THREE.Mesh(
            new THREE.CylinderGeometry(0.055, 0.055, 0.38, 8),
            new THREE.MeshStandardMaterial({ color: 0x78350f })
        );
        hilt.position.y = 0.05;
        g.add(hilt);

        // 鍔（つば）
        const guard = new THREE.Mesh(
            new THREE.BoxGeometry(0.44, 0.08, 0.12),
            new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.75 })
        );
        guard.position.y = 0.24;
        g.add(guard);

        // 刀身は上向き（+Y方向）へ伸びる
        const bladeLen = wpn.shape === 'god' ? 1.85 : (wpn.shape === 'omega' ? 1.65 : 1.35);
        const bladeW = wpn.shape === 'scythe' ? 0.14 : 0.18;
        const blade = new THREE.Mesh(new THREE.BoxGeometry(bladeW, bladeLen, 0.06), bladeMat);
        blade.position.y = 0.26 + bladeLen / 2;
        g.add(blade);

        // 切っ先
        const tip = new THREE.Mesh(new THREE.ConeGeometry(bladeW * 0.68, 0.26, 4), bladeMat);
        tip.position.y = 0.26 + bladeLen + 0.13;
        g.add(tip);

        if (wpn.shape === 'scythe') {
            const hook = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.22, 0.82), bladeMat);
            hook.position.set(0, 0.26 + bladeLen - 0.05, 0.34);
            g.add(hook);
        }

        // 通常時の凛々しい構え角度（少し前傾＋外側傾き）
        g.rotation.set(0.28, 0, -0.14);
        return g;
    },

    buildAvatarGroup(cfg) {
        const group = new THREE.Group();
        const bodyHex = cfg.bodyHex || 0x38bdf8;
        const faceBgHex = cfg.faceBgHex || '#073b66';
        const scale = Number(cfg.bodyScale) || 1.0;
        const wpn = WEAPONS[cfg.weaponId] || WEAPONS.wpn_wood;
        const arm = ARMORS[cfg.armorId] || ARMORS.arm_cloth;

        const bodyMat = new THREE.MeshStandardMaterial({ color: bodyHex, roughness: 0.4 });
        const footMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });

        // 可愛い足（左右）
        [-0.22, 0.22].forEach(x => {
            const foot = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), footMat);
            foot.scale.set(0.95, 0.72, 1.35);
            foot.position.set(x, 0.14, 0.06);
            group.add(foot);
        });

        // 胴体＋防具アーマー
        const torso = new THREE.Mesh(
            new THREE.CylinderGeometry(0.40, 0.46, 0.78, 14),
            new THREE.MeshStandardMaterial({ color: arm.plateColor || bodyHex, roughness: 0.45 })
        );
        torso.position.y = 0.62;
        group.add(torso);

        // 左手（可愛い丸手）
        const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), bodyMat);
        leftHand.position.set(0.58, 0.72, 0.14);
        group.add(leftHand);

        // 右手＆剣グループ（ここを回転させて剣を振る）
        const rightHandGroup = new THREE.Group();
        rightHandGroup.position.set(-0.62, 0.74, 0.18);
        const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), bodyMat);
        rightHandGroup.add(rightHand);

        const wpnGroup = this.buildWeaponGroup(wpn);
        wpnGroup.position.set(0, 0.04, 0.06);
        rightHandGroup.add(wpnGroup);
        group.add(rightHandGroup);

        // 防具肩当て・マント（背中パーツ未選択時）
        if ((arm.tierLook || 0) >= 1) {
            [-0.50, 0.50].forEach(x => {
                const pad = new THREE.Mesh(
                    new THREE.SphereGeometry(0.20, 10, 10),
                    new THREE.MeshStandardMaterial({ color: arm.trimColor || 0xfbbf24, metalness: 0.5 })
                );
                pad.position.set(x, 0.96, 0);
                group.add(pad);
            });
        }
        if ((arm.tierLook || 0) >= 2 && (!cfg.backCosmeticId || cfg.backCosmeticId === 'back_none')) {
            const cape = new THREE.Mesh(
                new THREE.BoxGeometry(0.76, 0.85, 0.06),
                new THREE.MeshStandardMaterial({ color: arm.capeColor || 0x1d4ed8 })
            );
            cape.position.set(0, 0.62, -0.44);
            cape.rotation.x = 0.16;
            group.add(cape);
        }

        // 顔文字ヘッド
        const hexStr = '#' + bodyHex.toString(16).padStart(6, '0');
        const frontTex = getKaomojiFaceTexture(cfg.kaomoji || '(´・ω・`)', faceBgHex, '#ffffff', hexStr);
        const frontMat = new THREE.MeshBasicMaterial({ map: frontTex });
        const sideMat = new THREE.MeshStandardMaterial({ color: bodyHex, roughness: 0.35 });
        const head = new THREE.Mesh(
            new THREE.BoxGeometry(1.24, 0.96, 1.02),
            [sideMat, sideMat, sideMat, sideMat, frontMat, sideMat]
        );
        head.position.y = 1.58;
        group.add(head);

        // 頭パーツ＆背中パーツのダブル装着
        this.attachHeadCosmetic(cfg.cosmeticId || 'none', head, bodyHex);
        const backSpinMesh = this.attachBackCosmetic(cfg.backCosmeticId || 'back_none', group, bodyHex);

        // 高精錬浮遊クリスタル
        let orbitPart = null;
        if ((cfg.weaponEnhance || 0) >= 3) {
            orbitPart = new THREE.Mesh(
                new THREE.OctahedronGeometry(0.18, 0),
                new THREE.MeshBasicMaterial({ color: wpn.glowColor || 0x38bdf8 })
            );
            orbitPart.position.set(0.78, 1.25, 0);
            group.add(orbitPart);
        }

        let backHalo = backSpinMesh;
        if (!backHalo && (arm.tierLook || 0) >= 5) {
            backHalo = new THREE.Mesh(
                new THREE.TorusGeometry(0.95, 0.05, 8, 24),
                new THREE.MeshBasicMaterial({ color: 0xfde047 })
            );
            backHalo.position.set(0, 1.45, -0.55);
            group.add(backHalo);
        }

        group.scale.setScalar(scale);
        return { group, head, frontMat, wpnGroup: rightHandGroup, orbitPart, backHalo };
    },

    buildPlayerEntity() {
        const prevPos = this.player ? this.player.pos.clone() : new THREE.Vector3(0, 0, 5);
        const prevRot = this.player ? this.player.rotY : 0;
        const prevHp = this.player ? this.player.hp : null;
        const prevMp = this.player ? this.player.mp : null;

        if (this.player && this.player.group && this.scene) {
            this.scene.remove(this.player.group);
        }
        if (this.player && this.player.headPlateEl) {
            this.player.headPlateEl.remove();
        }

        const d = this.saveData;
        const st = this.calcDerivedStats();
        const meshParts = this.buildAvatarGroup({
            kaomoji: this.getBasePlayerKaomoji(),
            bodyHex: this.getPlayerBodyHexColor(),
            faceBgHex: this.getPlayerFaceBgHex(),
            bodyScale: this.getPlayerBodyScale(),
            weaponId: d.weaponId,
            weaponEnhance: d.weaponEnhance || 0,
            armorId: d.armorId,
            cosmeticId: d.cosmeticId || 'none',
            backCosmeticId: d.backCosmeticId || 'back_none'
        });

        if (this.useWebGL && this.scene) {
            meshParts.group.position.copy(prevPos);
            meshParts.group.rotation.y = prevRot;
            this.scene.add(meshParts.group);
        }

        const plate = document.createElement('div');
        plate.className = 'world-plate';
        plate.innerHTML = `
            <div style="font-size:9px; font-weight:900; color:#7dd3fc;"><span id="p-head-lv">Lv.${d.lv}</span> あなた</div>
            <div style="width:54px; height:4px; background:#1e293b; border-radius:2px; overflow:hidden; margin-top:2px;">
                <div id="p-head-hp" style="height:100%; background:#10b981; width:100%;"></div>
            </div>
            <div style="width:54px; height:3px; background:#1e293b; border-radius:2px; overflow:hidden; margin-top:1px;">
                <div id="p-head-mp" style="height:100%; background:#38bdf8; width:100%;"></div>
            </div>
            <div style="width:54px; height:2px; background:#1e293b; border-radius:2px; overflow:hidden; margin-top:1px;">
                <div id="p-head-exp" style="height:100%; background:#eab308; width:0%;"></div>
            </div>
        `;
        this.overlayLayer.appendChild(plate);

        this.player = {
            pos: prevPos,
            rotY: prevRot,
            hp: prevHp !== null ? Math.min(st.maxHp, prevHp) : st.maxHp,
            mp: prevMp !== null ? Math.min(st.maxMp, prevMp) : st.maxMp,
            invulnTimer: 0,
            stunTimer: 0,
            skillAnimTimer: 0,
            skillAnimDur: 0.3,
            skillAnimType: 'none',
            defBuffTimer: 0,
            defBuffBonus: 0,
            warcryTimer: 0,
            warcryBonus: 1.0,
            headPlateEl: plate,
            ...meshParts
        };
    },

    buildPetEntity() {
        if (this.petEntity && this.petEntity.group && this.scene) {
            this.scene.remove(this.petEntity.group);
        }
        this.petEntity = null;

        const petId = this.saveData.petId;
        const petCfg = petId ? PETS[petId] : null;
        if (!petCfg || !this.useWebGL || !this.scene) return;

        const g = new THREE.Group();
        const tex = getKaomojiFaceTexture(petCfg.kaomoji, '#1e1b4b', '#fde047', '#f59e0b');
        const mat = new THREE.MeshBasicMaterial({ map: tex });
        const side = new THREE.MeshStandardMaterial({ color: petCfg.color, roughness: 0.3 });
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.62, 0.65), [side, side, side, side, mat, side]);
        body.position.y = 0.65;
        g.add(body);

        const startPos = this.player ? this.player.pos.clone().add(new THREE.Vector3(1.4, 0, 1.4)) : new THREE.Vector3(1.4, 0, 5);
        g.position.copy(startPos);
        this.scene.add(g);

        this.petEntity = {
            cfg: petCfg,
            group: g,
            pos: startPos,
            actionTimer: 2.2
        };
    },

    updatePet(dt, elapsed) {
        if (!this.petEntity || !this.player) return;
        const pe = this.petEntity;
        const targetPos = new THREE.Vector3(
            this.player.pos.x - Math.sin(this.player.rotY) * 1.6 + Math.cos(this.player.rotY) * 1.1,
            0,
            this.player.pos.z - Math.cos(this.player.rotY) * 1.6 - Math.sin(this.player.rotY) * 1.1
        );
        pe.pos.lerp(targetPos, Math.min(1, dt * 5.5));
        if (pe.group) {
            pe.group.position.set(pe.pos.x, Math.abs(Math.sin(elapsed * 8)) * 0.22, pe.pos.z);
            pe.group.rotation.y = this.player.rotY;
        }

        if (this.currentZoneId === 'town' || this.isDead) return;
        pe.actionTimer -= dt;
        if (pe.actionTimer <= 0) {
            pe.actionTimer = 2.4;
            const st = this.calcDerivedStats();
            const petMult = 1 + ((this.saveData.petLevel || 1) - 1) * 0.18;
            const near = this.getNearestMonster(11);
            if (near && !near.dead) {
                const dmg = Math.round(st.physAtk * pe.cfg.atkRatio * petMult);
                this.damageMonster(near, dmg, false);
                this.spawnSparkleBurst(near.pos, pe.cfg.color, 5);
            }
            if (this.player.hp < st.maxHp * 0.92 && pe.cfg.healRatio) {
                const heal = Math.round(st.maxHp * pe.cfg.healRatio * (1 + ((this.saveData.petLevel || 1) - 1) * 0.05));
                this.player.hp = Math.min(st.maxHp, this.player.hp + heal);
                this.spawnFloatText(this.player.pos.clone().add(new THREE.Vector3(0, 2.3, 0)), `+${formatBigNum(heal)}`, '#34d399', 13);
            }
            if (pe.cfg.mpRestore && this.player.mp < st.maxMp * 0.85) {
                this.player.mp = Math.min(st.maxMp, this.player.mp + st.maxMp * pe.cfg.mpRestore);
            }
        }
    },

    clearZoneEntities() {
        this.monsters.forEach(m => {
            if (m.group && this.scene) this.scene.remove(m.group);
            if (m.plateEl) m.plateEl.remove();
        });
        this.monsters = [];

        this.aiAllies.forEach(a => {
            if (a.group && this.scene) this.scene.remove(a.group);
            if (a.plateEl) a.plateEl.remove();
        });
        this.aiAllies = [];

        this.envObjects.forEach(obj => {
            if (this.scene) this.scene.remove(obj);
        });
        this.envObjects = [];
        this.selectedTarget = null;
        document.getElementById('boss-cast-box')?.classList.add('hidden');
    },

    loadZone(zoneId) {
        const zone = ZONES[zoneId] || ZONES.town;
        this.clearZoneEntities();
        this.currentZoneId = zone.id;
        this.towerState.active = false;

        if (this.useWebGL && this.scene) {
            this.scene.background = new THREE.Color(zone.skyColor);
            if (this.scene.fog) this.scene.fog.color = new THREE.Color(zone.skyColor);
            if (this.groundMat) this.groundMat.color = new THREE.Color(zone.groundColor);
            if (this.warpGroup) {
                this.warpGroup.visible = true;
                this.warpGroup.position.set(0, 0, zone.safe ? -9 : -16);
            }
        }

        if (this.player) {
            this.player.pos.set(0, 0, 5);
            this.wasOnWarp = false;
        }

        if (zone.safe) {
            this.buildTownEnvironment();
        } else {
            this.buildFieldEnvironment(zone);
            const threat = this.saveData.threatRank || 0;
            zone.monsters.forEach(mDef => {
                for (let i = 0; i < mDef.count; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const dist = mDef.isBoss ? (24 + Math.random() * 8) : (10 + Math.random() * 32);
                    const pos = new THREE.Vector3(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
                    this.spawnMonster(mDef, pos, threat, false);
                }
            });
        }

        this.refreshAllHUD();
        if (this.syncFirebaseNow) this.syncFirebaseNow();
    },

    startTowerMode(startFloor = 1) {
        this.clearZoneEntities();
        this.currentZoneId = 'tower';
        this.towerState = { active: true, floor: startFloor, wave: 1 };

        if (this.useWebGL && this.scene) {
            this.scene.background = new THREE.Color(0x1e1b4b);
            if (this.scene.fog) this.scene.fog.color = new THREE.Color(0x1e1b4b);
            if (this.groundMat) this.groundMat.color = new THREE.Color(0x312e81);
            if (this.warpGroup) this.warpGroup.visible = false;
        }

        if (this.player) this.player.pos.set(0, 0, 6);
        this.spawnTowerFloorMonsters(startFloor);
        this.refreshAllHUD();
        this.showAlertBanner(`🗼 無限の試練の塔 第${startFloor}階層 開始！`, 2000);
    },

    spawnTowerFloorMonsters(floor) {
        const isBossFloor = (floor % 5 === 0);
        const lv = floor * 2 + 2;
        const scaleMult = Math.pow(1.13, floor - 1);
        const drops = Object.keys(MATERIALS);
        const dropKey = drops[Math.min(drops.length - 1, Math.floor((floor - 1) / 4))];

        if (isBossFloor) {
            this.spawnMonster({
                name: `試練の塔 ${floor}F守護神`,
                kaomoji: '🗼👑꧁(╬◣д◢)꧂',
                lv,
                hp: Math.round(950 * scaleMult),
                atk: Math.round(55 * Math.pow(1.11, floor - 1)),
                exp: Math.round(450 * scaleMult),
                gold: Math.round(380 * scaleMult),
                color: 0xe879f9,
                scale: 2.25,
                isBoss: true,
                isRaidBoss: floor >= 15,
                drop: dropKey
            }, new THREE.Vector3(0, 0, -14), 0, true);
        } else {
            for (let i = 0; i < 4; i++) {
                const ang = (i / 4) * Math.PI * 2;
                this.spawnMonster({
                    name: `試練の番兵 ${floor}F`,
                    kaomoji: '【⚔️◣д◢】',
                    lv,
                    hp: Math.round(240 * scaleMult),
                    atk: Math.round(24 * Math.pow(1.11, floor - 1)),
                    exp: Math.round(130 * scaleMult),
                    gold: Math.round(110 * scaleMult),
                    color: 0x818cf8,
                    scale: 1.25,
                    isBoss: false,
                    drop: dropKey
                }, new THREE.Vector3(Math.cos(ang) * 13, 0, Math.sin(ang) * 13 - 4), 0, true);
            }
        }
    },

    spawnMonster(mDef, pos, threatRank = 0, noRespawn = false) {
        const tMult = 1 + threatRank * 0.28;
        const maxHp = Math.round(mDef.hp * tMult);
        const atk = Math.round(mDef.atk * (1 + threatRank * 0.22));
        const lv = mDef.lv + threatRank * 2;

        let group = null;
        if (this.useWebGL && this.scene) {
            group = new THREE.Group();
            const sc = mDef.scale || 1;
            const hexStr = '#' + (mDef.color || 0xef4444).toString(16).padStart(6, '0');
            const tex = getKaomojiFaceTexture(mDef.kaomoji, '#2b0909', '#ffffff', hexStr);
            const fMat = new THREE.MeshBasicMaterial({ map: tex });
            const sMat = new THREE.MeshStandardMaterial({ color: mDef.color || 0xef4444, roughness: 0.4 });
            const cube = new THREE.Mesh(new THREE.BoxGeometry(1.6 * sc, 1.35 * sc, 1.45 * sc), [sMat, sMat, sMat, sMat, fMat, sMat]);
            cube.position.y = 0.72 * sc;
            group.add(cube);

            if (mDef.isBoss) {
                const crown = new THREE.Mesh(
                    new THREE.ConeGeometry(0.65 * sc, 0.85 * sc, 6),
                    new THREE.MeshBasicMaterial({ color: 0xfde047 })
                );
                crown.position.y = 1.65 * sc;
                group.add(crown);
            }
            group.position.copy(pos);
            this.scene.add(group);
        }

        const plate = document.createElement('div');
        plate.className = 'world-plate';
        plate.innerHTML = `
            <div class="m-name-label" style="font-size:10px; font-weight:900; color:#fca5a5;">Lv.${lv} ${mDef.name}</div>
            <div class="m-hp-bg"><div class="m-hp-fill"></div></div>
        `;
        this.overlayLayer.appendChild(plate);

        this.monsters.push({
            id: 'm_' + Math.random().toString(36).slice(2, 9),
            name: mDef.name,
            kaomoji: mDef.kaomoji,
            lv,
            hp: maxHp,
            maxHp,
            atk,
            baseExp: mDef.exp,
            baseGold: mDef.gold,
            color: mDef.color || 0xef4444,
            scale: mDef.scale || 1,
            isBoss: !!mDef.isBoss,
            isRaidBoss: !!mDef.isRaidBoss,
            drop: mDef.drop || 'slime_gel',
            pos: pos.clone(),
            spawnPos: pos.clone(),
            group,
            plateEl: plate,
            dead: false,
            noRespawn,
            respawnTimer: 0,
            aggro: false,
            autoTimer: 1.0,
            mechTimer: 6.5,
            casting: null,
            stunTimer: 0,
            slowTimer: 0,
            slowFactor: 1.0,
            burnTimer: 0,
            burnDps: 0,
            atkAnimTimer: 0,
            damagedByPlayer: false
        });
    },

    buildTownEnvironment() {
        if (!this.useWebGL || !this.scene) return;
        for (let i = 0; i < 8; i++) {
            const ang = (i / 8) * Math.PI * 2;
            const pillar = new THREE.Mesh(
                new THREE.CylinderGeometry(0.55, 0.7, 4.8, 12),
                new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 })
            );
            pillar.position.set(Math.cos(ang) * 24, 2.4, Math.sin(ang) * 24);
            this.scene.add(pillar);
            this.envObjects.push(pillar);
        }

        const npcs = [
            { name: 'ネコミミ案内人', kaomoji: '(=^・ω・^=)', bodyHex: 0xf472b6, cosmeticId: 'cat_ears', backCosmeticId: 'cat_tail', weaponId: 'wpn_iron', pos: new THREE.Vector3(-6.5, 0, -4) },
            { name: '星詠み見習い', kaomoji: '(☆ω☆)', bodyHex: 0xa855f7, cosmeticId: 'witch_hat', backCosmeticId: 'hero_cape', weaponId: 'wpn_forest', pos: new THREE.Vector3(6.5, 0, -4) },
            { name: '元気な双葉っ子', kaomoji: '(≧▽≦)ﾉ', bodyHex: 0x10b981, cosmeticId: 'sprout', backCosmeticId: 'angel_wings', weaponId: 'wpn_wood', pos: new THREE.Vector3(0, 0, -16) }
        ];
        npcs.forEach(n => {
            const av = this.buildAvatarGroup({
                kaomoji: n.kaomoji,
                bodyHex: n.bodyHex,
                weaponId: n.weaponId,
                armorId: 'arm_leather',
                cosmeticId: n.cosmeticId,
                backCosmeticId: n.backCosmeticId
            });
            av.group.position.copy(n.pos);
            this.scene.add(av.group);
            this.aiAllies.push({
                name: n.name,
                pos: n.pos.clone(),
                homePos: n.pos.clone(),
                targetOffset: new THREE.Vector3(),
                wanderTimer: 1.5,
                group: av.group
            });
        });
    },

    buildFieldEnvironment(zone) {
        if (!this.useWebGL || !this.scene) return;
        const propColor = zone.id === 'volcano' ? 0xef4444 : (zone.id === 'glacier' ? 0x7dd3fc : 0x22c55e);
        for (let i = 0; i < 16; i++) {
            const ang = (i / 16) * Math.PI * 2;
            const r = 42 + (i % 3) * 4;
            const mesh = new THREE.Mesh(
                new THREE.ConeGeometry(1.6, 4.5, 7),
                new THREE.MeshStandardMaterial({ color: propColor, roughness: 0.7 })
            );
            mesh.position.set(Math.cos(ang) * r, 2.25, Math.sin(ang) * r);
            this.scene.add(mesh);
            this.envObjects.push(mesh);
        }
    },

    isOnWarpPortal(pos) {
        if (!this.warpGroup || !this.warpGroup.visible) return false;
        return Math.hypot(pos.x - this.warpGroup.position.x, pos.z - this.warpGroup.position.z) <= 2.9;
    },

    clampPosition(pos) {
        const dist = Math.hypot(pos.x, pos.z);
        if (dist > 54) {
            pos.x = (pos.x / dist) * 54;
            pos.z = (pos.z / dist) * 54;
        }
    }
});
