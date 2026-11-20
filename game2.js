'use strict';

// =========================================================================
// 顔文字ファンタジー3D 3Dワールド・キャラクター造形・ペット・ゾーン管理 (game2.js)
// =========================================================================

Object.assign(KaomojiMMORPG.prototype, {
    initThree() {
        try {
            if (typeof THREE === 'undefined') throw new Error('Three.js not loaded');
            this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, powerPreference: 'high-performance' });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
            this.useWebGL = true;
        } catch (e) {
            this.useWebGL = false;
            console.warn('WebGL fallback mode:', e);
        }

        if (!this.useWebGL) {
            this.scene = { add() {}, remove() {}, background: null, fog: null };
            this.camera = { position: new THREE.Vector3(0, 10, 14), lookAt() {}, project(v) { return v; } };
            return;
        }

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0c4a6e);
        this.scene.fog = new THREE.FogExp2(0x0c4a6e, 0.016);

        this.camera = new THREE.PerspectiveCamera(54, window.innerWidth / window.innerHeight, 0.1, 160);
        this.camera.position.set(0, 10, 14);

        const hemi = new THREE.HemisphereLight(0xe0f2fe, 0x1e293b, 0.95);
        this.scene.add(hemi);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.95);
        dirLight.position.set(16, 28, 18);
        this.scene.add(dirLight);

        const groundGeo = new THREE.PlaneGeometry(48, 48, 16, 16);
        this.groundMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.85, metalness: 0.05 });
        const ground = new THREE.Mesh(groundGeo, this.groundMat);
        ground.rotation.x = -Math.PI / 2;
        this.scene.add(ground);

        const grid = new THREE.GridHelper(48, 24, 0x38bdf8, 0x0f172a);
        grid.position.y = 0.02;
        grid.material.opacity = 0.22;
        grid.material.transparent = true;
        this.scene.add(grid);

        this.buildWarpGate();
    },

    buildWarpGate() {
        if (!this.useWebGL) return;
        this.warpGroup = new THREE.Group();
        const ringGeo = new THREE.TorusGeometry(2.1, 0.14, 12, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.12;
        this.warpGroup.add(ring);

        const crystalGeo = new THREE.OctahedronGeometry(0.55, 0);
        const crystalMat = new THREE.MeshStandardMaterial({ color: 0xfde047, emissive: 0xd97706, emissiveIntensity: 0.8 });
        this.warpCrystal = new THREE.Mesh(crystalGeo, crystalMat);
        this.warpCrystal.position.y = 2.0;
        this.warpGroup.add(this.warpCrystal);

        this.warpGroup.position.set(0, 0, -14);
        this.scene.add(this.warpGroup);
    },

    buildPlayerEntity() {
        const oldPos = this.player ? this.player.pos.clone() : new THREE.Vector3(0, 0, 4);
        const oldRot = this.player ? this.player.rotY : Math.PI;
        const oldHp = this.player ? this.player.hp : null;
        const oldMp = this.player ? this.player.mp : null;

        if (this.player && this.player.group && this.useWebGL) {
            this.scene.remove(this.player.group);
        }

        const st = this.calcDerivedStats();
        const d = this.saveData;
        const wpn = WEAPONS[d.weaponId] || WEAPONS.wpn_wood;
        const arm = ARMORS[d.armorId] || ARMORS.arm_cloth;
        const bodyHex = this.getPlayerBodyHexColor();
        const faceBg = this.getPlayerFaceBgHex();
        const bodyScale = this.getPlayerBodyScale();

        const group = new THREE.Group();
        let faceMesh = null;
        let weaponPivot = null;
        let backPivot = null;

        if (this.useWebGL) {
            // キャラクター本体
            const bodyGeo = new THREE.BoxGeometry(1.25, 1.35, 1.05);
            const bodyMat = new THREE.MeshStandardMaterial({ color: bodyHex, roughness: 0.35, metalness: 0.15 });
            const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
            bodyMesh.position.y = 0.85;
            group.add(bodyMesh);

            // 顔文字モニター画面
            const faceTex = getKaomojiFaceTexture(this.getBasePlayerKaomoji(), faceBg, '#ffffff', '#38bdf8');
            const faceGeo = new THREE.PlaneGeometry(1.12, 0.86);
            const faceMat = new THREE.MeshBasicMaterial({ map: faceTex });
            faceMesh = new THREE.Mesh(faceGeo, faceMat);
            faceMesh.position.set(0, 0.94, 0.54);
            group.add(faceMesh);

            // ぷにぷに手（左右）
            const handGeo = new THREE.SphereGeometry(0.24, 12, 12);
            const handMat = new THREE.MeshStandardMaterial({ color: bodyHex });
            const leftHand = new THREE.Mesh(handGeo, handMat);
            leftHand.position.set(-0.82, 0.72, 0.25);
            group.add(leftHand);

            const rightHand = new THREE.Mesh(handGeo, handMat);
            rightHand.position.set(0.82, 0.72, 0.25);
            group.add(rightHand);

            // 頭パーツ（着せ替え）
            const cosId = d.cosmeticId || 'none';
            if (cosId === 'sprout') {
                const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.38, 8), new THREE.MeshStandardMaterial({ color: 0x16a34a }));
                stem.position.set(0, 1.68, 0);
                group.add(stem);
                const leafMat = new THREE.MeshStandardMaterial({ color: 0x4ade80 });
                const leafL = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), leafMat);
                leafL.scale.set(1.4, 0.4, 0.8);
                leafL.position.set(-0.16, 1.86, 0);
                leafL.rotation.z = 0.35;
                group.add(leafL);
                const leafR = leafL.clone();
                leafR.position.set(0.16, 1.86, 0);
                leafR.rotation.z = -0.35;
                group.add(leafR);
            } else if (cosId === 'cat_ears') {
                const earGeo = new THREE.ConeGeometry(0.24, 0.46, 4);
                const earMat = new THREE.MeshStandardMaterial({ color: bodyHex });
                const earL = new THREE.Mesh(earGeo, earMat);
                earL.position.set(-0.38, 1.72, 0.05);
                earL.rotation.z = 0.22;
                group.add(earL);
                const earR = new THREE.Mesh(earGeo, earMat);
                earR.position.set(0.38, 1.72, 0.05);
                earR.rotation.z = -0.22;
                group.add(earR);
            } else if (cosId === 'bunny_ears') {
                const earGeo = new THREE.CapsuleGeometry ? new THREE.CapsuleGeometry(0.12, 0.55, 4, 8) : new THREE.CylinderGeometry(0.11, 0.13, 0.72, 10);
                const earMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc });
                const earL = new THREE.Mesh(earGeo, earMat);
                earL.position.set(-0.28, 1.88, 0);
                earL.rotation.z = 0.12;
                group.add(earL);
                const earR = new THREE.Mesh(earGeo, earMat);
                earR.position.set(0.28, 1.88, 0);
                earR.rotation.z = -0.12;
                group.add(earR);
            } else if (cosId === 'fox_ears') {
                const earGeo = new THREE.ConeGeometry(0.26, 0.56, 4);
                const earMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b });
                const earL = new THREE.Mesh(earGeo, earMat);
                earL.position.set(-0.38, 1.76, 0.05);
                earL.rotation.z = 0.25;
                group.add(earL);
                const earR = new THREE.Mesh(earGeo, earMat);
                earR.position.set(0.38, 1.76, 0.05);
                earR.rotation.z = -0.25;
                group.add(earR);
            } else if (cosId === 'cat_headphone') {
                const band = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.07, 8, 24, Math.PI), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
                band.position.set(0, 1.35, 0);
                group.add(band);
                const earGeo = new THREE.ConeGeometry(0.22, 0.4, 4);
                const neonMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.9 });
                const earL = new THREE.Mesh(earGeo, neonMat);
                earL.position.set(-0.42, 1.82, 0);
                earL.rotation.z = 0.25;
                group.add(earL);
                const earR = new THREE.Mesh(earGeo, neonMat);
                earR.position.set(0.42, 1.82, 0);
                earR.rotation.z = -0.25;
                group.add(earR);
            } else if (cosId === 'witch_hat') {
                const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.88, 0.88, 0.06, 20), new THREE.MeshStandardMaterial({ color: 0x4c1d95 }));
                brim.position.set(0, 1.56, 0);
                group.add(brim);
                const cone = new THREE.Mesh(new THREE.ConeGeometry(0.52, 0.95, 16), new THREE.MeshStandardMaterial({ color: 0x5b21b6 }));
                cone.position.set(0, 2.02, -0.05);
                cone.rotation.x = -0.15;
                group.add(cone);
            } else if (cosId === 'demon_horns') {
                const hornGeo = new THREE.ConeGeometry(0.16, 0.58, 10);
                const hornMat = new THREE.MeshStandardMaterial({ color: 0xbe123c, emissive: 0x881337, emissiveIntensity: 0.5 });
                const hL = new THREE.Mesh(hornGeo, hornMat);
                hL.position.set(-0.36, 1.76, 0.1);
                hL.rotation.set(0.2, 0, 0.35);
                group.add(hL);
                const hR = new THREE.Mesh(hornGeo, hornMat);
                hR.position.set(0.36, 1.76, 0.1);
                hR.rotation.set(0.2, 0, -0.35);
                group.add(hR);
            } else if (cosId === 'angel_halo') {
                const halo = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.06, 10, 24), new THREE.MeshStandardMaterial({ color: 0xfde047, emissive: 0xf59e0b, emissiveIntensity: 0.9 }));
                halo.rotation.x = Math.PI / 2;
                halo.position.set(0, 1.88, 0);
                group.add(halo);
            } else if (cosId === 'royal_crown') {
                const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.38, 0.34, 8), new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.7, roughness: 0.2 }));
                crown.position.set(0, 1.68, 0);
                group.add(crown);
            }

            // 背中パーツ（尻尾・翼・マント・オーラ）
            backPivot = new THREE.Group();
            backPivot.position.set(0, 0.85, -0.56);
            const backId = d.backCosmeticId || 'back_none';

            if (backId === 'cat_tail') {
                const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 0.95, 10), new THREE.MeshStandardMaterial({ color: bodyHex }));
                tail.position.set(0, -0.1, -0.35);
                tail.rotation.x = -0.85;
                backPivot.add(tail);
            } else if (backId === 'fox_tails') {
                const tailMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b });
                [-0.38, 0, 0.38].forEach((ang, idx) => {
                    const t = new THREE.Mesh(new THREE.ConeGeometry(0.2, 1.05, 10), tailMat);
                    t.position.set(idx === 0 ? -0.25 : idx === 2 ? 0.25 : 0, 0.05, -0.4);
                    t.rotation.set(-0.95, 0, ang);
                    backPivot.add(t);
                });
            } else if (backId === 'hero_cape') {
                const cape = new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.35, 0.08), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
                cape.position.set(0, -0.12, -0.12);
                cape.rotation.x = 0.22;
                backPivot.add(cape);
            } else if (backId === 'demon_wings') {
                const wingMat = new THREE.MeshStandardMaterial({ color: 0x311042, emissive: 0x581c87, emissiveIntensity: 0.4 });
                const wL = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.72, 0.08), wingMat);
                wL.position.set(-0.72, 0.22, -0.1);
                wL.rotation.set(0.15, -0.35, 0.28);
                backPivot.add(wL);
                const wR = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.72, 0.08), wingMat);
                wR.position.set(0.72, 0.22, -0.1);
                wR.rotation.set(0.15, 0.35, -0.28);
                backPivot.add(wR);
            } else if (backId === 'angel_wings') {
                const wingMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xe0f2fe, emissiveIntensity: 0.6 });
                const wL = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.82, 0.08), wingMat);
                wL.position.set(-0.78, 0.26, -0.1);
                wL.rotation.set(0.1, -0.3, 0.32);
                backPivot.add(wL);
                const wR = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.82, 0.08), wingMat);
                wR.position.set(0.78, 0.26, -0.1);
                wR.rotation.set(0.1, 0.3, -0.32);
                backPivot.add(wR);
            } else if (backId === 'flame_aura') {
                const ring = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.07, 10, 28), new THREE.MeshStandardMaterial({ color: 0xfde047, emissive: 0xf59e0b, emissiveIntensity: 0.9 }));
                ring.position.set(0, 0.2, -0.15);
                backPivot.add(ring);
            } else if ((arm.tierLook || 0) >= 1) {
                const cape = new THREE.Mesh(new THREE.BoxGeometry(1.05, 1.15, 0.06), new THREE.MeshStandardMaterial({ color: arm.capeColor || 0x1d4ed8 }));
                cape.position.set(0, -0.1, -0.08);
                cape.rotation.x = 0.16;
                backPivot.add(cape);
            }
            group.add(backPivot);

            // 武器メッシュ
            weaponPivot = new THREE.Group();
            weaponPivot.position.set(0.95, 0.78, 0.35);
            const bladeMat = new THREE.MeshStandardMaterial({
                color: wpn.bladeColor || 0xe2e8f0,
                emissive: wpn.glowColor || 0x38bdf8,
                emissiveIntensity: 0.35 + Math.min(0.6, (d.weaponEnhance || 0) * 0.05),
                metalness: 0.65,
                roughness: 0.2
            });
            const hilt = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.1, 0.14), new THREE.MeshStandardMaterial({ color: 0xfbbf24 }));
            weaponPivot.add(hilt);

            let bladeMesh;
            if (wpn.shape === 'scythe') {
                const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.9, 8), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
                shaft.position.y = 0.7;
                weaponPivot.add(shaft);
                bladeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.22, 0.08), bladeMat);
                bladeMesh.position.set(-0.35, 1.55, 0);
                bladeMesh.rotation.z = 0.25;
            } else {
                const len = wpn.shape === 'god' || wpn.shape === 'omega' ? 1.65 : (wpn.shape === 'flame' || wpn.shape === 'abyss' ? 1.45 : 1.2);
                bladeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, len, 0.08), bladeMat);
                bladeMesh.position.y = len * 0.5 + 0.05;
            }
            weaponPivot.add(bladeMesh);

            if ((d.weaponEnhance || 0) >= 5) {
                const aura = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 10), new THREE.MeshBasicMaterial({ color: wpn.glowColor || 0x38bdf8, transparent: true, opacity: 0.45 }));
                aura.position.y = 0.9;
                weaponPivot.add(aura);
            }
            weaponPivot.rotation.x = 0.45;
            group.add(weaponPivot);

            group.scale.setScalar(bodyScale);
            group.position.copy(oldPos);
            group.rotation.y = oldRot;
            this.scene.add(group);
        }

        this.player = {
            group,
            faceMesh,
            weaponPivot,
            backPivot,
            pos: oldPos,
            rotY: oldRot,
            hp: oldHp !== null ? Math.min(st.maxHp, oldHp) : st.maxHp,
            mp: oldMp !== null ? Math.min(st.maxMp, oldMp) : st.maxMp,
            invulnTimer: 0,
            atkAnimTimer: 0,
            warcryTimer: 0,
            warcryBonus: 1.0,
            defBuffTimer: 0,
            defBuffBonus: 0,
            skillCooldowns: this.player ? (this.player.skillCooldowns || {}) : {}
        };
    },

    buildPetEntity() {
        if (this.petEntity && this.petEntity.group && this.useWebGL) {
            this.scene.remove(this.petEntity.group);
        }
        this.petEntity = null;

        const petId = this.saveData.petId;
        if (!petId || !PETS[petId]) return;

        const cfg = PETS[petId];
        const group = new THREE.Group();
        if (this.useWebGL) {
            const body = new THREE.Mesh(
                new THREE.SphereGeometry(0.55, 16, 16),
                new THREE.MeshStandardMaterial({ color: cfg.color, roughness: 0.3, emissive: cfg.color, emissiveIntensity: 0.25 })
            );
            body.position.y = 0.58;
            group.add(body);

            const faceTex = getKaomojiFaceTexture(cfg.kaomoji, '#090d16', '#ffffff', '#fde047');
            const face = new THREE.Mesh(new THREE.PlaneGeometry(0.76, 0.52), new THREE.MeshBasicMaterial({ map: faceTex }));
            face.position.set(0, 0.62, 0.48);
            group.add(face);

            if (petId === 'pet_fox') {
                const earGeo = new THREE.ConeGeometry(0.15, 0.35, 4);
                const earMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b });
                const eL = new THREE.Mesh(earGeo, earMat);
                eL.position.set(-0.24, 1.15, 0);
                group.add(eL);
                const eR = new THREE.Mesh(earGeo, earMat);
                eR.position.set(0.24, 1.15, 0);
                group.add(eR);
            } else if (petId === 'pet_dragon' || petId === 'pet_seraph') {
                const halo = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.04, 8, 20), new THREE.MeshBasicMaterial({ color: 0xfde047 }));
                halo.rotation.x = Math.PI / 2;
                halo.position.y = 1.25;
                group.add(halo);
            }

            const startPos = this.player ? this.player.pos.clone().add(new THREE.Vector3(-1.4, 0, -1.0)) : new THREE.Vector3(-1.4, 0, 3);
            group.position.copy(startPos);
            this.scene.add(group);
        }

        this.petEntity = {
            id: petId,
            cfg,
            group,
            pos: group.position.clone(),
            actionTimer: 2.0
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
            const petCfg = pe.cfg || (typeof PETS !== 'undefined' ? PETS[this.saveData?.petId] : null) || {};
            const petLv = Math.max(1, Number(this.saveData?.petLevel) || 1);
            const petMult = 1 + (petLv - 1) * 0.18;
            const baseAtk = Number(st?.physAtk);
            const atkRatio = Number(petCfg.atkRatio ?? 0.45);
            const near = this.getNearestMonster(11);
            if (near && !near.dead && Number.isFinite(baseAtk) && baseAtk > 0) {
                const safeRatio = (Number.isFinite(atkRatio) && atkRatio > 0) ? atkRatio : 0.45;
                const dmg = Math.max(1, Math.round(baseAtk * safeRatio * petMult));
                this.damageMonster(near, dmg, false);
                this.spawnSparkleBurst(near.pos, petCfg.color || 0x38bdf8, 5);
            }
            const healRatio = Number(petCfg.healRatio || 0);
            if (healRatio > 0 && this.player.hp < st.maxHp * 0.92) {
                const heal = Math.max(1, Math.round(st.maxHp * healRatio * (1 + (petLv - 1) * 0.05)));
                this.player.hp = Math.min(st.maxHp, this.player.hp + heal);
                this.spawnFloatText(this.player.pos.clone().add(new THREE.Vector3(0, 2.3, 0)), `+${formatBigNum(heal)}`, '#34d399', 13);
            }
            const mpRestore = Number(petCfg.mpRestore || 0);
            if (mpRestore > 0 && this.player.mp < st.maxMp * 0.85) {
                this.player.mp = Math.min(st.maxMp, this.player.mp + st.maxMp * mpRestore);
            }
        }
    },

    loadZone(zoneId) {
        this.clearZoneEntities();
        this.currentZoneId = zoneId;
        this.towerState.active = (zoneId === 'tower');

        const isTower = (zoneId === 'tower');
        const zone = isTower
            ? { id: 'tower', name: `無限の試練の塔 ${this.towerState.floor}F`, skyColor: 0x1e1b4b, groundColor: 0x312e81, safe: false }
            : (ZONES[zoneId] || ZONES.town);

        if (this.useWebGL) {
            this.scene.background = new THREE.Color(zone.skyColor);
            if (this.scene.fog) this.scene.fog.color = new THREE.Color(zone.skyColor);
            if (this.groundMat) this.groundMat.color = new THREE.Color(zone.groundColor);
            this.buildZoneEnvironment(zone);
        }

        if (this.player) {
            this.player.pos.set(0, 0, 12);
            this.player.rotY = Math.PI;
            if (this.player.group) {
                this.player.group.position.copy(this.player.pos);
                this.player.group.rotation.y = this.player.rotY;
            }
        }

        if (zone.id === 'town') {
            this.spawnTownAllies();
            const st = this.calcDerivedStats();
            if (this.player) {
                this.player.hp = st.maxHp;
                this.player.mp = st.maxMp;
            }
        } else if (isTower) {
            const fl = this.towerState.floor;
            const scale = Math.pow(1.22, fl - 1);
            const isBossFloor = (fl % 5 === 0);
            if (isBossFloor) {
                this.spawnMonster({
                    name: `試練の塔・守護神 ${fl}F`,
                    kaomoji: '👑꧁(╬◣д◢)꧂👑',
                    lv: 15 + fl * 4,
                    hp: Math.round(1400 * scale),
                    atk: Math.round(65 * scale),
                    exp: Math.round(600 * scale),
                    gold: Math.round(520 * scale),
                    color: 0xf43f5e,
                    scale: 2.2,
                    isBoss: true,
                    isRaidBoss: true,
                    drop: fl >= 15 ? 'void_star' : (fl >= 10 ? 'abyss_shard' : 'fire_core')
                }, 0, 1.0);
            } else {
                for (let i = 0; i < 4; i++) {
                    this.spawnMonster({
                        name: `試練の魔兵 ${fl}F`,
                        kaomoji: '(▼皿▼#)',
                        lv: 10 + fl * 3,
                        hp: Math.round(320 * scale),
                        atk: Math.round(28 * scale),
                        exp: Math.round(140 * scale),
                        gold: Math.round(120 * scale),
                        color: 0xa855f7,
                        scale: 1.25,
                        drop: fl >= 10 ? 'ice_crystal' : 'goblin_fang'
                    }, i, 1.0);
                }
            }
        } else {
            const threatMult = 1 + (this.saveData.threatRank || 0) * 0.25;
            let idx = 0;
            (zone.monsters || []).forEach(mDef => {
                const cnt = mDef.count || 1;
                for (let c = 0; c < cnt; c++) {
                    this.spawnMonster(mDef, idx++, threatMult);
                }
            });
        }

        if (this.refreshAllHUD) this.refreshAllHUD();
        if (this.showAlertBanner) this.showAlertBanner(`📍 ${zone.name} に到着しました！`, 1800);
    },

    buildZoneEnvironment(zone) {
        if (!this.useWebGL) return;
        if (zone.id === 'town') {
            // 中央の噴水・木・提灯
            const fountain = new THREE.Mesh(
                new THREE.CylinderGeometry(3.2, 3.6, 0.8, 20),
                new THREE.MeshStandardMaterial({ color: 0x94a3b8 })
            );
            fountain.position.set(0, 0.4, 0);
            this.scene.add(fountain);
            this.envObjects.push(fountain);

            const water = new THREE.Mesh(
                new THREE.CylinderGeometry(2.8, 2.8, 0.86, 20),
                new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.4 })
            );
            water.position.set(0, 0.42, 0);
            this.scene.add(water);
            this.envObjects.push(water);

            for (let i = 0; i < 8; i++) {
                const ang = (i / 8) * Math.PI * 2;
                const r = 17;
                const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 2.2, 8), new THREE.MeshStandardMaterial({ color: 0x78350f }));
                trunk.position.set(Math.cos(ang) * r, 1.1, Math.sin(ang) * r);
                this.scene.add(trunk);
                this.envObjects.push(trunk);

                const leaves = new THREE.Mesh(new THREE.SphereGeometry(1.5, 10, 10), new THREE.MeshStandardMaterial({ color: 0x22c55e }));
                leaves.position.set(Math.cos(ang) * r, 2.8, Math.sin(ang) * r);
                this.scene.add(leaves);
                this.envObjects.push(leaves);
            }
        } else {
            const propColor = zone.id === 'volcano' ? 0xf97316 : (zone.id === 'glacier' ? 0x7dd3fc : (zone.id === 'abyss' || zone.id === 'sanctuary' ? 0xc084fc : 0x22c55e));
            for (let i = 0; i < 10; i++) {
                const ang = (i / 10) * Math.PI * 2 + 0.3;
                const r = 18 + (i % 3) * 2;
                const pillar = new THREE.Mesh(
                    new THREE.ConeGeometry(1.1, 3.4, 6),
                    new THREE.MeshStandardMaterial({ color: propColor, roughness: 0.5 })
                );
                pillar.position.set(Math.cos(ang) * r, 1.7, Math.sin(ang) * r);
                this.scene.add(pillar);
                this.envObjects.push(pillar);
            }
        }
    },

    spawnTownAllies() {
        const alliesData = [
            { name: '看板娘ミコ', kaomoji: '(=^・ω・^=)', color: 0xf472b6, pos: new THREE.Vector3(-5, 0, -4), msg: 'ようこそ顔文字広場へ！' },
            { name: '鍛冶屋ガンテツ', kaomoji: '(｀・ω・´)🔨', color: 0xf59e0b, pos: new THREE.Vector3(6, 0, -3), msg: '育成･見た目メニューで装備を鍛えよう！' },
            { name: '旅の賢者ルミナ', kaomoji: '✧(✪ω✪)✧', color: 0x38bdf8, pos: new THREE.Vector3(-6, 0, 5), msg: 'オンラインONで全国の仲間と共闘できるぞ！' }
        ];

        alliesData.forEach(a => {
            const group = new THREE.Group();
            if (this.useWebGL) {
                const body = new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.25, 0.95), new THREE.MeshStandardMaterial({ color: a.color }));
                body.position.y = 0.75;
                group.add(body);

                const tex = getKaomojiFaceTexture(a.kaomoji, '#090d16', '#ffffff', '#fde047');
                const face = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.76), new THREE.MeshBasicMaterial({ map: tex }));
                face.position.set(0, 0.85, 0.49);
                group.add(face);

                group.position.copy(a.pos);
                this.scene.add(group);
            }

            const plateEl = document.createElement('div');
            plateEl.className = 'world-plate';
            plateEl.innerHTML = `<div style="font-size:10px;font-weight:900;color:#6ee7b7;">${a.name}</div>`;
            this.overlayLayer?.appendChild(plateEl);

            this.aiAllies.push({
                name: a.name,
                kaomoji: a.kaomoji,
                pos: a.pos.clone(),
                basePos: a.pos.clone(),
                group,
                plateEl,
                msg: a.msg
            });
        });
    },

    spawnMonster(mDef, idx, mult = 1.0) {
        const sc = mDef.scale || 1.0;
        const maxHp = Math.max(10, Math.round(mDef.hp * mult));
        const atk = Math.max(2, Math.round(mDef.atk * mult));
        const exp = Math.max(5, Math.round(mDef.exp * mult));
        const gold = Math.max(5, Math.round(mDef.gold * mult));
        const lv = Math.max(1, Math.round(mDef.lv + (this.saveData.threatRank || 0) * 2));

        const ang = (idx * 1.45) + Math.random() * 0.6;
        const dist = mDef.isBoss ? 8.5 : (6.5 + (idx % 4) * 3.2);
        const spawnPos = new THREE.Vector3(Math.cos(ang) * dist, 0, Math.sin(ang) * dist - 2);

        const group = new THREE.Group();
        if (this.useWebGL) {
            const body = new THREE.Mesh(
                new THREE.BoxGeometry(1.3 * sc, 1.35 * sc, 1.15 * sc),
                new THREE.MeshStandardMaterial({ color: mDef.color, roughness: 0.4 })
            );
            body.position.y = 0.72 * sc;
            group.add(body);

            const tex = getKaomojiFaceTexture(mDef.kaomoji, '#1e0914', '#ffffff', mDef.isBoss ? '#fde047' : '#f43f5e');
            const face = new THREE.Mesh(new THREE.PlaneGeometry(1.15 * sc, 0.85 * sc), new THREE.MeshBasicMaterial({ map: tex }));
            face.position.set(0, 0.82 * sc, 0.59 * sc);
            group.add(face);

            if (mDef.isBoss) {
                const crown = new THREE.Mesh(new THREE.ConeGeometry(0.55 * sc, 0.75 * sc, 6), new THREE.MeshStandardMaterial({ color: 0xfde047, emissive: 0xd97706, emissiveIntensity: 0.7 }));
                crown.position.set(0, 1.68 * sc, 0);
                group.add(crown);
            }

            group.position.copy(spawnPos);
            this.scene.add(group);
        }

        const plateEl = document.createElement('div');
        plateEl.className = 'world-plate';
        plateEl.innerHTML = `
            <div style="font-size:10px;font-weight:900;color:${mDef.isBoss ? '#fde047' : '#fca5a5'};">${mDef.isBoss ? '👑' : ''}Lv.${lv} ${mDef.name}</div>
            <div class="m-hp-bg"><div class="m-hp-fill"></div></div>
        `;
        this.overlayLayer?.appendChild(plateEl);

        this.monsters.push({
            id: 'm_' + idx + '_' + Math.random().toString(36).slice(2, 6),
            name: mDef.name,
            kaomoji: mDef.kaomoji,
            lv,
            hp: maxHp,
            maxHp,
            atk,
            exp,
            gold,
            color: mDef.color,
            scale: sc,
            isBoss: !!mDef.isBoss,
            isRaidBoss: !!mDef.isRaidBoss,
            drop: mDef.drop || 'slime_gel',
            pos: spawnPos.clone(),
            spawnPos: spawnPos.clone(),
            rotY: 0,
            group,
            plateEl,
            dead: false,
            respawnTimer: 0,
            aggro: false,
            damagedByPlayer: false,
            autoTimer: 1.2 + Math.random() * 0.8,
            atkAnimTimer: 0,
            stunTimer: 0,
            slowTimer: 0,
            slowFactor: 1.0,
            burnTimer: 0,
            burnDps: 0,
            burnTickTimer: 1.0,
            casting: null,
            castCooldown: 5.0
        });
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
        if (Array.isArray(this.effects)) {
            this.effects.forEach(ef => {
                if (this.scene && ef?.mesh) this.scene.remove(ef.mesh);
            });
            this.effects = [];
        }
        ['_slashEffects', '_v21SkillEffects', '_sanctuaryFields'].forEach(key => {
            if (Array.isArray(this[key])) {
                this[key].forEach(fx => {
                    const obj = fx?.group || fx?.mesh;
                    if (this.scene && obj) this.scene.remove(obj);
                });
                this[key] = [];
            }
        });
        this.selectedTarget = null;
        document.getElementById('boss-cast-box')?.classList.add('hidden');
    }
});
