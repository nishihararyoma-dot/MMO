'use strict';

// =========================================================================
// 顔文字ファンタジー3D Lv.999役職ツリー・武器種自動切替・豪華演出・MP調整 (game7.js)
// =========================================================================

// 1. 脅威度上限を常に999に設定
window.MAX_THREAT_RANK = 999;
window.MAX_PLAYER_LEVEL = 999;

// 2. MP消費5倍 ＋ スキルレベル1上がるごとに+10ずつ増加
window.getSkillMpCost = function(sk, lv = 1) {
    if (!sk) return 0;
    const baseMp = Math.max(1, Number(sk.mp) || 10);
    const safeLv = Math.max(1, Number(lv) || 1);
    return Math.round(baseMp * 5 + (safeLv - 1) * 10);
};

// 3. Lv.999までの剣士系（左ルート）・魔法使い系（右ルート）役職データ（ゴールド消費転職）
window.EVOLUTIONS = {
    novice: {
        id: 'novice',
        branch: 'common',
        tier: 0,
        name: '見習い冒険者',
        kaomoji: '(´・ω・`)',
        reqLv: 1,
        costGold: 0,
        hexColor: 0x38bdf8,
        color: '#38bdf8',
        atkMult: 1.0,
        hpMult: 1.0,
        mpMult: 1.0,
        spdMult: 1.0,
        bonusText: '基本ステータス x1.0（剣装備）'
    },

    // ================= 左側：剣士系ルート（近接物理・斬撃） =================
    sw_1: {
        id: 'sw_1',
        branch: 'sword',
        tier: 1,
        name: '駆け出し剣士',
        kaomoji: '(｀・ω・´)⚔️',
        reqLv: 10,
        costGold: 500,
        hexColor: 0x2563eb,
        color: '#60a5fa',
        atkMult: 1.35,
        hpMult: 1.35,
        mpMult: 1.1,
        spdMult: 1.05,
        exCritBonus: 0.04,
        bonusText: '物理攻撃･HP x1.35 / 会心+4%（片手剣）'
    },
    sw_2: {
        id: 'sw_2',
        branch: 'sword',
        tier: 2,
        name: '重装聖騎士',
        kaomoji: '【(｀・ω・´)】🛡️',
        reqLv: 35,
        costGold: 3500,
        hexColor: 0x0284c7,
        color: '#38bdf8',
        atkMult: 1.9,
        hpMult: 2.1,
        mpMult: 1.3,
        spdMult: 1.08,
        exDefBonus: 0.08,
        bonusText: '物理攻撃 x1.9 / HP x2.1 / 防御軽減+8%'
    },
    sw_3: {
        id: 'sw_3',
        branch: 'sword',
        tier: 3,
        name: '疾風剣豪',
        kaomoji: '⚡(▼皿▼)⚡',
        reqLv: 80,
        costGold: 20000,
        hexColor: 0x059669,
        color: '#34d399',
        atkMult: 2.8,
        hpMult: 2.9,
        mpMult: 1.6,
        spdMult: 1.16,
        exCritBonus: 0.10,
        exCdBonus: 0.08,
        bonusText: '物理攻撃 x2.8 / 会心+10% / CT短縮+8%'
    },
    sw_4: {
        id: 'sw_4',
        branch: 'sword',
        tier: 4,
        name: '紅蓮の竜騎士',
        kaomoji: '🐉(╬◣д◢)🐉',
        reqLv: 180,
        costGold: 120000,
        hexColor: 0xdc2626,
        color: '#f87171',
        atkMult: 4.4,
        hpMult: 4.5,
        mpMult: 2.1,
        spdMult: 1.22,
        exCritBonus: 0.14,
        bonusText: '物理攻撃 x4.4 / HP x4.5 / 会心+14%'
    },
    sw_5: {
        id: 'sw_5',
        branch: 'sword',
        tier: 5,
        name: '聖剣の勇者',
        kaomoji: '✨(★‿★)✨',
        reqLv: 380,
        costGold: 650000,
        hexColor: 0xf59e0b,
        color: '#fbbf24',
        atkMult: 7.2,
        hpMult: 7.5,
        mpMult: 3.0,
        spdMult: 1.28,
        exCritBonus: 0.18,
        exDefBonus: 0.12,
        bonusText: '物理攻撃 x7.2 / HP x7.5 / 全能力大幅強化'
    },
    sw_6: {
        id: 'sw_6',
        branch: 'sword',
        tier: 6,
        name: '覇王剣神',
        kaomoji: '👑꧁(｀・ω・´)꧂👑',
        reqLv: 680,
        costGold: 3500000,
        hexColor: 0xe11d48,
        color: '#fb7185',
        atkMult: 12.5,
        hpMult: 13.0,
        mpMult: 4.5,
        spdMult: 1.35,
        exCritBonus: 0.24,
        exCdBonus: 0.15,
        bonusText: '物理攻撃 x12.5 / HP x13.0 / 剣神オーラ'
    },
    sw_7: {
        id: 'sw_7',
        branch: 'sword',
        tier: 7,
        name: '創世の剣帝',
        kaomoji: '🌌⚔️(✧ω✧)⚔️🌌',
        reqLv: 999,
        costGold: 15000000,
        hexColor: 0xfacc15,
        color: '#fde047',
        atkMult: 24.0,
        hpMult: 25.0,
        mpMult: 8.0,
        spdMult: 1.45,
        exCritBonus: 0.30,
        exDefBonus: 0.18,
        exCdBonus: 0.20,
        bonusText: '物理攻撃 x24.0 / HP x25.0 / 極限剣帝の輝き'
    },

    // ================= 右側：魔法使い系ルート（杖のみ・遠距離魔法） =================
    mg_1: {
        id: 'mg_1',
        branch: 'mage',
        tier: 1,
        name: '見習い魔道士',
        kaomoji: '(・ω・)🔮',
        reqLv: 10,
        costGold: 500,
        hexColor: 0x7c3aed,
        color: '#a78bfa',
        atkMult: 1.38,
        hpMult: 1.18,
        mpMult: 1.65,
        spdMult: 1.04,
        exCdBonus: 0.05,
        bonusText: '魔法攻撃 x1.38 / MP x1.65 / 杖のみ装備'
    },
    mg_2: {
        id: 'mg_2',
        branch: 'mage',
        tier: 2,
        name: '元素魔術師',
        kaomoji: '🔥(・∀・)❄️',
        reqLv: 35,
        costGold: 3500,
        hexColor: 0x9333ea,
        color: '#c084fc',
        atkMult: 2.0,
        hpMult: 1.55,
        mpMult: 2.4,
        spdMult: 1.08,
        exCdBonus: 0.08,
        bonusText: '魔法攻撃 x2.0 / MP x2.4 / CT短縮+8%'
    },
    mg_3: {
        id: 'mg_3',
        branch: 'mage',
        tier: 3,
        name: '大賢者',
        kaomoji: '✧(✪ω✪)✧',
        reqLv: 80,
        costGold: 20000,
        hexColor: 0x4f46e5,
        color: '#818cf8',
        atkMult: 3.0,
        hpMult: 2.1,
        mpMult: 3.6,
        spdMult: 1.14,
        exCritBonus: 0.08,
        exCdBonus: 0.12,
        bonusText: '魔法攻撃 x3.0 / MP x3.6 / CT短縮+12%'
    },
    mg_4: {
        id: 'mg_4',
        branch: 'mage',
        tier: 4,
        name: '星霊魔導師',
        kaomoji: '🌟(人´∀｀)🌟',
        reqLv: 180,
        costGold: 120000,
        hexColor: 0x0891b2,
        color: '#22d3ee',
        atkMult: 4.8,
        hpMult: 3.1,
        mpMult: 5.5,
        spdMult: 1.20,
        exCritBonus: 0.12,
        exCdBonus: 0.16,
        bonusText: '魔法攻撃 x4.8 / MP x5.5 / 星霊の魔力'
    },
    mg_5: {
        id: 'mg_5',
        branch: 'mage',
        tier: 5,
        name: '深淵の魔王',
        kaomoji: '😈꧁(ΦωΦ)꧂😈',
        reqLv: 380,
        costGold: 650000,
        hexColor: 0xbe185d,
        color: '#f472b6',
        atkMult: 7.8,
        hpMult: 4.8,
        mpMult: 8.5,
        spdMult: 1.26,
        exCritBonus: 0.18,
        exCdBonus: 0.20,
        bonusText: '魔法攻撃 x7.8 / MP x8.5 / 深淵の魔導'
    },
    mg_6: {
        id: 'mg_6',
        branch: 'mage',
        tier: 6,
        name: '天穹の魔導神',
        kaomoji: '👑✨(✪ω✪)✨👑',
        reqLv: 680,
        costGold: 3500000,
        hexColor: 0xa21caf,
        color: '#e879f9',
        atkMult: 13.8,
        hpMult: 8.2,
        mpMult: 14.0,
        spdMult: 1.34,
        exCritBonus: 0.24,
        exCdBonus: 0.24,
        bonusText: '魔法攻撃 x13.8 / MP x14.0 / 神域魔導'
    },
    mg_7: {
        id: 'mg_7',
        branch: 'mage',
        tier: 7,
        name: '終焉の真理魔帝',
        kaomoji: '🌌🔮(✧ω✧)🔮🌌',
        reqLv: 999,
        costGold: 15000000,
        hexColor: 0xc026d3,
        color: '#f0abfc',
        atkMult: 26.5,
        hpMult: 15.0,
        mpMult: 25.0,
        spdMult: 1.44,
        exCritBonus: 0.30,
        exCdBonus: 0.28,
        bonusText: '魔法攻撃 x26.5 / MP x25.0 / 真理の魔法弾'
    }
};

// 旧セーブデータの役職ID互換マッピング
window.resolveEvolutionId = function(evoId) {
    if (EVOLUTIONS[evoId]) return evoId;
    const legacyMap = {
        warrior: 'sw_1',
        knight: 'sw_2',
        berserker: 'sw_4',
        sword_saint: 'sw_6',
        mage: 'mg_1',
        archmage: 'mg_3',
        sage: 'mg_4',
        demon_lord: 'mg_5',
        celestial_god: 'mg_7'
    };
    return legacyMap[evoId] || 'novice';
};

// 武器データに杖（staff）を明確に定義
if (typeof WEAPONS !== 'undefined') {
    Object.values(WEAPONS).forEach(w => {
        if (w.id.includes('staff') || w.id.includes('wand') || w.name.includes('杖')) {
            w.isStaff = true;
            w.shape = 'staff';
        } else {
            w.isStaff = false;
        }
    });
    if (!WEAPONS.wpn_mage_staff) {
        WEAPONS.wpn_mage_staff = {
            id: 'wpn_mage_staff',
            name: '魔導士の樫の杖',
            icon: '🪄',
            atk: 16,
            mag: 1.35,
            costGold: 0,
            costMat: {},
            bladeColor: 0xa855f7,
            glowColor: 0xc084fc,
            shape: 'staff',
            isStaff: true
        };
    }
}

Object.assign(KaomojiMMORPG.prototype, {
    isMageEvolution(evoId = null) {
        const id = resolveEvolutionId(evoId || this.saveData?.evolutionId || 'novice');
        const evo = EVOLUTIONS[id] || EVOLUTIONS.novice;
        return evo.branch === 'mage';
    },

    // 転職時に剣士系なら剣へ、魔法使い系なら杖へ自動切替する
    syncWeaponWithEvolution() {
        const d = this.saveData;
        if (!d) return;
        d.evolutionId = resolveEvolutionId(d.evolutionId);
        const isMage = this.isMageEvolution(d.evolutionId);
        const curWpn = WEAPONS[d.weaponId] || WEAPONS.wpn_wood;

        if (isMage) {
            if (!curWpn.isStaff) {
                if (!d.ownedWeapons.includes('wpn_mage_staff')) {
                    d.ownedWeapons.push('wpn_mage_staff');
                }
                const ownedStaff = d.ownedWeapons.map(id => WEAPONS[id]).filter(w => w && w.isStaff).pop();
                d.weaponId = ownedStaff ? ownedStaff.id : 'wpn_mage_staff';
            }
        } else {
            if (curWpn.isStaff) {
                const ownedSword = d.ownedWeapons.map(id => WEAPONS[id]).filter(w => w && !w.isStaff).pop();
                d.weaponId = ownedSword ? ownedSword.id : 'wpn_wood';
            }
        }
    }
});

// buildPlayerEntity のラップ：片手持ち統一＆剣と杖の3Dモデル完全切替
(function() {
    const origBuildPlayer = KaomojiMMORPG.prototype.buildPlayerEntity;
    KaomojiMMORPG.prototype.buildPlayerEntity = function() {
        this.syncWeaponWithEvolution();
        origBuildPlayer.call(this);

        if (!this.useWebGL || !this.player || !this.player.group) return;

        const d = this.saveData;
        const evo = EVOLUTIONS[resolveEvolutionId(d.evolutionId)] || EVOLUTIONS.novice;
        const isMage = evo.branch === 'mage';
        const wpn = WEAPONS[d.weaponId] || WEAPONS.wpn_wood;

        // 既存の weaponPivot を完全に除去し、片手のみに再構築（両手持ち防止）
        if (this.player.weaponPivot) {
            this.player.group.remove(this.player.weaponPivot);
        }

        const weaponPivot = new THREE.Group();
        weaponPivot.position.set(0.95, 0.78, 0.35);

        const glowHex = wpn.glowColor || evo.hexColor || (isMage ? 0xc084fc : 0x38bdf8);

        if (isMage) {
            // 魔法使い系：杖のみを持つ
            const staffShaft = new THREE.Mesh(
                new THREE.CylinderGeometry(0.055, 0.065, 1.85, 10),
                new THREE.MeshStandardMaterial({ color: 0x581c87, roughness: 0.4 })
            );
            staffShaft.position.y = 0.72;
            weaponPivot.add(staffShaft);

            const orb = new THREE.Mesh(
                new THREE.OctahedronGeometry(0.24 + Math.min(0.14, (evo.tier || 1) * 0.02), 1),
                new THREE.MeshStandardMaterial({
                    color: 0xfef08a,
                    emissive: glowHex,
                    emissiveIntensity: 0.9
                })
            );
            orb.position.y = 1.72;
            weaponPivot.add(orb);

            if ((evo.tier || 0) >= 3) {
                const haloRing = new THREE.Mesh(
                    new THREE.TorusGeometry(0.36, 0.03, 8, 20),
                    new THREE.MeshBasicMaterial({ color: glowHex })
                );
                haloRing.position.y = 1.72;
                weaponPivot.add(haloRing);
            }
        } else {
            // 剣士系：片手剣のみを持つ（魔法杖は一切持たない）
            const bladeMat = new THREE.MeshStandardMaterial({
                color: wpn.bladeColor || 0xe2e8f0,
                emissive: glowHex,
                emissiveIntensity: 0.35 + Math.min(0.65, (evo.tier || 0) * 0.08),
                metalness: 0.7,
                roughness: 0.2
            });
            const hilt = new THREE.Mesh(
                new THREE.BoxGeometry(0.38, 0.1, 0.14),
                new THREE.MeshStandardMaterial({ color: 0xfbbf24 })
            );
            weaponPivot.add(hilt);

            const len = 1.25 + Math.min(0.55, (evo.tier || 0) * 0.07);
            const blade = new THREE.Mesh(new THREE.BoxGeometry(0.18, len, 0.08), bladeMat);
            blade.position.y = len * 0.5 + 0.05;
            weaponPivot.add(blade);
        }

        weaponPivot.rotation.x = 0.45;
        this.player.group.add(weaponPivot);
        this.player.weaponPivot = weaponPivot;
    };
})();

// calcDerivedStats の拡張：魔法攻撃力(magAtk)・役職ティア・杖判定を追加
(function() {
    const origCalcStats = KaomojiMMORPG.prototype.calcDerivedStats;
    KaomojiMMORPG.prototype.calcDerivedStats = function() {
        const d = this.saveData;
        if (d && d.evolutionId) {
            d.evolutionId = resolveEvolutionId(d.evolutionId);
        }
        const st = origCalcStats.call(this);
        const evo = EVOLUTIONS[d?.evolutionId || 'novice'] || EVOLUTIONS.novice;
        const wpn = WEAPONS[d?.weaponId || 'wpn_wood'] || WEAPONS.wpn_wood;
        const s = d?.stats || { str: 5, int: 5, vit: 5, agi: 5 };
        const wpnEnhMult = 1 + (d?.weaponEnhance || 0) * 0.14;
        const warcryMult = (this.player && this.player.warcryTimer > 0) ? (this.player.warcryBonus || 1.0) : 1.0;

        const isMageClass = evo.branch === 'mage';
        const isStaffEquipped = isMageClass || !!wpn.isStaff;

        // 魔法攻撃力（INTと杖・魔導職倍率ベース）
        const baseMagAtk = (15 + s.int * 3.8 + (wpn.atk || 14) * wpnEnhMult) * (evo.atkMult || 1.0);
        const magAtk = Math.max(1, Math.round(baseMagAtk * (0.75 + st.magMult * 0.25) * warcryMult));

        st.isMageClass = isMageClass;
        st.isStaffEquipped = isStaffEquipped;
        st.magAtk = magAtk;
        st.evoTier = evo.tier || 0;
        st.evoColor = evo.hexColor || 0x38bdf8;
        return st;
    };
})();

// 通常攻撃と豪華エフェクトの実装（剣は物理斬撃のみ、杖は遠距離魔法弾＆魔法ダメージ）
Object.assign(KaomojiMMORPG.prototype, {
    spawnMagicBolt(fromPos, toPos, colorHex = 0xc084fc, tier = 1) {
        if (!this.useWebGL || !this.scene) return;
        const size = 0.22 + Math.min(0.28, tier * 0.035);
        const bolt = new THREE.Mesh(
            new THREE.SphereGeometry(size, 12, 12),
            new THREE.MeshBasicMaterial({ color: colorHex })
        );
        bolt.position.copy(fromPos);
        this.scene.add(bolt);

        // 飛行軌跡として中間地点にも光球を生成
        const steps = 3 + Math.min(4, Math.floor(tier / 2));
        for (let i = 1; i <= steps; i++) {
            const t = i / (steps + 1);
            const p = new THREE.Vector3().lerpVectors(fromPos, toPos, t);
            const trail = new THREE.Mesh(
                new THREE.OctahedronGeometry(size * (0.6 + t * 0.4), 0),
                new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.9 })
            );
            trail.position.copy(p);
            this.scene.add(trail);
            this.effects.push({ mesh: trail, kind: 'expand', life: 0.28, maxLife: 0.28 });
        }

        bolt.position.copy(toPos);
        this.effects.push({ mesh: bolt, kind: 'expand', life: 0.32, maxLife: 0.32 });

        // 役職ティアが高いほど着弾魔法陣が豪華になる
        this.spawnSparkleBurst(toPos, colorHex, 6 + tier * 2);
        if (tier >= 2) this.spawnRingEffect(toPos, colorHex, 1.6 + tier * 0.35);
        if (tier >= 5) this.spawnDomeEffect(toPos, 0xfde047, 2.2 + tier * 0.3);
    },

    spawnDeluxeSlashEffect(playerPos, rotY, targetPos, colorHex = 0x38bdf8, tier = 0, crit = false) {
        if (!this.useWebGL || !this.scene) return;
        // 剣の斬撃アーク（魔法弾は一切出さない）
        const arcCount = 1 + Math.min(3, Math.floor(tier / 2));
        for (let i = 0; i < arcCount; i++) {
            const radius = 2.2 + i * 0.65 + tier * 0.15;
            const arc = new THREE.Mesh(
                new THREE.RingGeometry(radius * 0.72, radius, 24, 1, -Math.PI * 0.42, Math.PI * 0.84),
                new THREE.MeshBasicMaterial({
                    color: i % 2 === 0 ? colorHex : 0xfde047,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.92
                })
            );
            arc.rotation.x = -Math.PI / 2;
            arc.rotation.z = -rotY + Math.PI / 2 + (i - 1) * 0.18;
            arc.position.set(playerPos.x, 0.95 + i * 0.22, playerPos.z);
            this.scene.add(arc);
            this.effects.push({ mesh: arc, kind: 'expand', life: 0.30, maxLife: 0.30 });
        }

        if (targetPos) {
            this.spawnSparkleBurst(targetPos, colorHex, 5 + tier * 2 + (crit ? 5 : 0));
            if (tier >= 3 || crit) {
                this.spawnRingEffect(targetPos, tier >= 5 ? 0xfde047 : colorHex, 1.8 + tier * 0.3);
            }
            if (tier >= 6) {
                this.spawnDomeEffect(targetPos, 0xfde047, 2.8);
            }
        }
    },

    performBasicAttack() {
        if (!this.player || this.isDead || (this.player.stunTimer || 0) > 0) return false;
        sfx.init();

        const st = this.calcDerivedStats();
        const isStaff = !!st.isStaffEquipped;
        const atkRange = isStaff ? 16.5 : 5.8;
        const tier = st.evoTier || 0;
        const effectColor = st.evoColor || st.wpnGlowColor || (isStaff ? 0xc084fc : 0x38bdf8);

        const target = this.getNearestMonster(atkRange) || (this.selectedTarget && !this.selectedTarget.dead && this.player.pos.distanceTo(this.selectedTarget.pos) <= atkRange ? this.selectedTarget : null);

        if (target && !target.dead) {
            const dx = target.pos.x - this.player.pos.x;
            const dz = target.pos.z - this.player.pos.z;
            if (dx * dx + dz * dz > 0.01) this.player.rotY = Math.atan2(dx, dz);
        }

        this.player.skillAnimType = isStaff ? 'cast_up' : 'basic_slash';
        this.player.skillAnimDur = 0.24;
        this.player.skillAnimTimer = 0.24;
        this.autoAtkTimer = Math.max(0.42, 0.92 * (1 - st.cdReduction * 0.6));

        if (this.currentZoneId === 'town') {
            if (isStaff) {
                const fwd = new THREE.Vector3(
                    this.player.pos.x + Math.sin(this.player.rotY) * 6.0,
                    1.1,
                    this.player.pos.z + Math.cos(this.player.rotY) * 6.0
                );
                this.spawnMagicBolt(this.player.pos.clone().add(new THREE.Vector3(0, 1.3, 0)), fwd, effectColor, tier);
                sfx.playTone(660, 'sine', 0.1, 0.05, 920);
            } else {
                this.spawnDeluxeSlashEffect(this.player.pos, this.player.rotY, null, effectColor, tier, false);
                sfx.playTone(360, 'triangle', 0.09, 0.06, 180);
            }
            return false;
        }

        if (target && !target.dead) {
            this.selectedTarget = target;
            const crit = Math.random() < st.critChance;

            if (isStaff) {
                // 魔法使い系・杖装備時：遠距離魔法弾を発射し、魔法攻撃力でダメージ判定
                const dmg = Math.max(1, Math.round(st.magAtk * (crit ? st.critDmg : 1.0)));
                this.spawnMagicBolt(
                    this.player.pos.clone().add(new THREE.Vector3(0, 1.35, 0)),
                    target.pos.clone().add(new THREE.Vector3(0, 0.9, 0)),
                    effectColor,
                    tier
                );
                sfx.playTone(crit ? 880 : 640, 'sine', 0.12, 0.06, 980);
                this.damageMonster(target, dmg, crit);
            } else {
                // 剣士系・剣装備時：近接物理斬撃のみ（魔法は出ない）
                const dmg = Math.max(1, Math.round(st.physAtk * (crit ? st.critDmg : 1.0)));
                this.spawnDeluxeSlashEffect(this.player.pos, this.player.rotY, target.pos, effectColor, tier, crit);
                this.damageMonster(target, dmg, crit);
            }
            return true;
        } else {
            if (isStaff) {
                const fwd = new THREE.Vector3(
                    this.player.pos.x + Math.sin(this.player.rotY) * 7.0,
                    1.1,
                    this.player.pos.z + Math.cos(this.player.rotY) * 7.0
                );
                this.spawnMagicBolt(this.player.pos.clone().add(new THREE.Vector3(0, 1.3, 0)), fwd, effectColor, tier);
            } else {
                this.spawnDeluxeSlashEffect(this.player.pos, this.player.rotY, null, effectColor, tier, false);
            }
            sfx.playTone(320, 'triangle', 0.09, 0.06, 150);
            return false;
        }
    }
});

// AUTO狩り時も杖装備なら14.5mの遠距離射程から魔法攻撃できるように距離調整
(function() {
    const origMoveAndAuto = KaomojiMMORPG.prototype.updatePlayerMovementAndAuto;
    KaomojiMMORPG.prototype.updatePlayerMovementAndAuto = function(dt, elapsed, st) {
        if (!this.isDead && this.autoHunt && this.currentZoneId !== 'town' && st.isStaffEquipped) {
            const hasManual =
                this.keys['KeyW'] || this.keys['ArrowUp'] ||
                this.keys['KeyS'] || this.keys['ArrowDown'] ||
                this.keys['KeyA'] || this.keys['ArrowLeft'] ||
                this.keys['KeyD'] || this.keys['ArrowRight'] ||
                Math.hypot(this.joyVec.x, this.joyVec.y) > 0.08;

            if (!hasManual && (this.player.stunTimer || 0) <= 0) {
                const target = this.getNearestMonster(60);
                if (target && !target.dead) {
                    const dx = target.pos.x - this.player.pos.x;
                    const dz = target.pos.z - this.player.pos.z;
                    const dist = Math.hypot(dx, dz);
                    // 杖の射程(16.5m)より手前(13.5m)まで近づいたらその場から魔法連射
                    if (dist > 13.5) {
                        this.player.pos.x += (dx / dist) * st.moveSpeed * dt;
                        this.player.pos.z += (dz / dist) * st.moveSpeed * dt;
                        this.player.rotY = Math.atan2(dx, dz);
                    }
                    // すでに射程内なら接近移動をスキップして攻撃を実行
                    const savedAutoHunt = this.autoHunt;
                    this.autoHunt = false;
                    origMoveAndAuto.call(this, dt, elapsed, st);
                    this.autoHunt = savedAutoHunt;

                    // AUTOスキル発動判定
                    this.autoSkillTimer -= dt;
                    if (this.autoSkillTimer <= 0 && dist <= 16.5) {
                        this.autoSkillTimer = 0.65;
                        const eq = this.saveData.equippedSkills || [];
                        for (let i = 0; i < eq.length; i++) {
                            const sid = eq[i];
                            if (!sid || !SKILLS[sid]) continue;
                            const sk = SKILLS[sid];
                            if (sk.type === 'HEAL' && this.player.hp > st.maxHp * 0.65) continue;
                            if (sk.type === 'HEAL_MP' && this.player.hp > st.maxHp * 0.7 && this.player.mp > st.maxMp * 0.5) continue;
                            const cds = this.player.skillCds || {};
                            if ((cds[i] || 0) <= 0 && this.player.mp >= getSkillMpCost(sk, this.saveData.skills[sid] || 1)) {
                                this.useSkillSlot(i);
                                break;
                            }
                        }
                    }
                    return;
                }
            }
        }
        origMoveAndAuto.call(this, dt, elapsed, st);
    };
})();
