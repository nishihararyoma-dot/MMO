'use strict';

// =========================================================================
// 顔文字ファンタジー3D 冒険者メニューUI・育成・装備・見た目・転生 (game5.js)
// =========================================================================

Object.assign(KaomojiMMORPG.prototype, {
    openGrowthModal(tabId = 'stats') {
        const modal = document.getElementById('growth-modal');
        if (!modal) return;
        this.isModalOpen = true;
        if (tabId) this.activeTab = tabId;
        document.getElementById('hud-drawer-menu')?.classList.add('hidden');
        document.getElementById('emote-palette')?.classList.add('hidden');
        modal.classList.remove('hidden');
        this.renderModalTabs();
        this.renderModalBody();
    },

    closeGrowthModal() {
        const modal = document.getElementById('growth-modal');
        if (modal) modal.classList.add('hidden');
        this.isModalOpen = false;
        this.refreshAllHUD();
    },

    hasMaterials(costMat) {
        if (!costMat) return true;
        const mats = this.saveData.materials || {};
        for (const [k, req] of Object.entries(costMat)) {
            if ((mats[k] || 0) < req) return false;
        }
        return true;
    },

    consumeMaterials(costMat) {
        if (!costMat) return;
        const mats = this.saveData.materials || {};
        for (const [k, req] of Object.entries(costMat)) {
            mats[k] = Math.max(0, (mats[k] || 0) - req);
        }
    },

    formatMatCost(costMat) {
        if (!costMat || Object.keys(costMat).length === 0) return '素材不要';
        const mats = this.saveData.materials || {};
        return Object.entries(costMat).map(([k, req]) => {
            const info = MATERIALS[k] || { icon: '📦', name: k };
            const cur = mats[k] || 0;
            const ok = cur >= req;
            return `<span style="color:${ok ? '#6ee7b7' : '#fda4af'};">${info.icon}${info.name} ${cur}/${req}</span>`;
        }).join(' / ');
    },

    renderModalTabs() {
        const tabBar = document.getElementById('modal-tabs');
        if (!tabBar) return;
        const d = this.saveData;
        const tabs = [
            { id: 'zones', label: '🗺️ ステージ' },
            { id: 'stats', label: `📊 能力･進化${(d.ap || 0) > 0 ? `(${d.ap})` : ''}` },
            { id: 'skills', label: `⚡ スキル･ツリー${(d.sp || 0) > 0 ? `(${d.sp})` : ''}` },
            { id: 'equip', label: '⚔️ 装備･鍛冶屋' },
            { id: 'look', label: '🎨 見た目･着せ替え' },
            { id: 'pet', label: '🐾 ペット' },
            { id: 'rebirth', label: '👑 実績･転生' },
            { id: 'online', label: '🌐 通信･引継ぎ' }
        ];

        tabBar.innerHTML = tabs.map(t => `
            <button type="button" class="tab-chip-btn ${this.activeTab === t.id ? 'active' : ''}" data-tab="${t.id}">${t.label}</button>
        `).join('');

        tabBar.querySelectorAll('.tab-chip-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.activeTab = btn.dataset.tab;
                this.renderModalTabs();
                this.renderModalBody();
            });
        });
    },

    renderModalBody() {
        const body = document.getElementById('modal-body');
        if (!body) return;
        const tab = this.activeTab;
        if (tab === 'zones') this.renderTabZones(body);
        else if (tab === 'stats') this.renderTabStats(body);
        else if (tab === 'skills') this.renderTabSkills(body);
        else if (tab === 'equip') this.renderTabEquip(body);
        else if (tab === 'look') this.renderTabLook(body);
        else if (tab === 'pet') this.renderTabPet(body);
        else if (tab === 'rebirth') this.renderTabRebirth(body);
        else if (tab === 'online') this.renderTabOnline(body);
    },

    // =====================================================================
    // 1. ステージ移動・無限の試練の塔・脅威ランク
    // =====================================================================
    renderTabZones(body) {
        const d = this.saveData;
        const threat = d.threatRank || 0;
        const zoneList = Object.values(ZONES);

        body.innerHTML = `
            <div class="card-box" style="margin-bottom:10px;">
                <div class="flex-between">
                    <div>
                        <div style="font-size:13px;font-weight:900;color:#fde047;">🔥 フィールド脅威ランク: +${threat} / ${MAX_THREAT_RANK}</div>
                        <div style="font-size:11px;color:#cbd5e1;">敵の強さとEXP/Gドロップ率が +${threat * 25}% 増加します</div>
                    </div>
                    <div style="display:flex;gap:6px;">
                        <button type="button" id="m-threat-down" class="btn-ui btn-slate">-1</button>
                        <button type="button" id="m-threat-up" class="btn-ui btn-rose">+1</button>
                    </div>
                </div>
            </div>

            <div class="card-box" style="margin-bottom:10px;border-color:#a855f7;">
                <div class="flex-between">
                    <div>
                        <div style="font-size:13px;font-weight:900;color:#e879f9;">🗼 無限の試練の塔（最高到達: ${d.statsTrack?.bestTowerFloor || 0}F）</div>
                        <div style="font-size:11px;color:#cbd5e1;">全滅させるごとに次の階層へ！5階層ごとに守護ボス出現＆AP/SPボーナス</div>
                    </div>
                    <button type="button" id="m-enter-tower" class="btn-ui btn-fuchsia">🗼 1Fから挑戦</button>
                </div>
            </div>

            <div class="grid-2">
                ${zoneList.map(z => {
                    const isCur = !this.towerState.active && this.currentZoneId === z.id;
                    const dropNames = (z.drops || []).map(k => MATERIALS[k] ? `${MATERIALS[k].icon}${MATERIALS[k].name}` : '').join(' / ');
                    return `
                        <div class="card-box" style="border-color:${isCur ? '#34d399' : '#334155'};display:flex;flex-direction:column;justify-content:space-between;gap:8px;">
                            <div>
                                <div class="flex-between">
                                    <span style="font-size:12px;font-weight:900;color:#38bdf8;">STAGE ${z.stageNum}：${z.name}</span>
                                    <span class="badge-pill" style="background:${z.safe ? '#059669' : '#1e293b'};color:#fde047;">${z.safe ? '安全拠点' : `推奨Lv.${z.recLv}`}</span>
                                </div>
                                <div style="font-size:11px;color:#cbd5e1;margin-top:4px;">${z.desc}</div>
                                ${dropNames ? `<div style="font-size:10px;color:#6ee7b7;margin-top:4px;">ドロップ: ${dropNames}</div>` : ''}
                            </div>
                            <button type="button" class="btn-ui ${isCur ? 'btn-slate' : 'btn-emerald'} btn-go-zone" data-zone="${z.id}" style="width:100%;">
                                ${isCur ? '📍 現在滞在中のエリア' : '🌀 このエリアへ移動'}
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        body.querySelector('#m-threat-up')?.addEventListener('click', () => {
            if ((d.threatRank || 0) < MAX_THREAT_RANK) {
                d.threatRank = (d.threatRank || 0) + 1;
                this.saveGame(false);
                if (this.currentZoneId !== 'town' && !this.towerState.active) this.loadZone(this.currentZoneId);
                this.renderModalBody();
                this.refreshAllHUD();
            }
        });
        body.querySelector('#m-threat-down')?.addEventListener('click', () => {
            if ((d.threatRank || 0) > 0) {
                d.threatRank = (d.threatRank || 0) - 1;
                this.saveGame(false);
                if (this.currentZoneId !== 'town' && !this.towerState.active) this.loadZone(this.currentZoneId);
                this.renderModalBody();
                this.refreshAllHUD();
            }
        });
        body.querySelector('#m-enter-tower')?.addEventListener('click', () => {
            this.towerState = { active: true, floor: 1, wave: 1 };
            this.closeGrowthModal();
            this.loadZone('tower');
        });
        body.querySelectorAll('.btn-go-zone').forEach(btn => {
            btn.addEventListener('click', () => {
                const zid = btn.dataset.zone;
                this.towerState.active = false;
                this.closeGrowthModal();
                this.loadZone(zid);
            });
        });
    },

    // =====================================================================
    // 2. 能力ポイント(AP)振り分け・上位職進化
    // =====================================================================
    renderTabStats(body) {
        const d = this.saveData;
        const st = this.calcDerivedStats();
        const curEvo = EVOLUTIONS[d.evolutionId] || EVOLUTIONS.novice;

        const statDefs = [
            { key: 'str', name: 'STR (筋力)', desc: '物理攻撃力・会心ダメージUP', icon: '⚔️' },
            { key: 'int', name: 'INT (知力)', desc: '最大MP・スキル魔力倍率UP', icon: '🔮' },
            { key: 'vit', name: 'VIT (体力)', desc: '最大HP・防御軽減率UP', icon: '❤️' },
            { key: 'agi', name: 'AGI (敏捷)', desc: '会心率・CT短縮・移動速度UP', icon: '💨' }
        ];

        const nextEvos = Object.values(EVOLUTIONS).filter(e => e.reqEvo === d.evolutionId);

        body.innerHTML = `
            <div class="card-box" style="margin-bottom:10px;">
                <div class="flex-between">
                    <div>
                        <span style="font-size:13px;font-weight:900;color:#fde047;">✨ 残り能力ポイント (AP): ${d.ap || 0}</span>
                        <div style="font-size:11px;color:#cbd5e1;">攻撃:${formatBigNum(st.physAtk)} / 魔力倍率:x${st.magMult} / HP:${formatBigNum(st.maxHp)} / MP:${formatBigNum(st.maxMp)}</div>
                    </div>
                    <div style="font-size:11px;color:#7dd3fc;text-align:right;">
                        会心率:${Math.round(st.critChance * 100)}% / 軽減:${Math.round(st.defMitigation * 100)}% / CT短縮:${Math.round(st.cdReduction * 100)}%
                    </div>
                </div>
            </div>

            <div class="grid-2" style="margin-bottom:12px;">
                ${statDefs.map(sd => `
                    <div class="card-box flex-between">
                        <div>
                            <div style="font-size:12px;font-weight:900;color:#f8fafc;">${sd.icon} ${sd.name}：<span style="color:#38bdf8;font-size:14px;">${d.stats[sd.key] || 5}</span></div>
                            <div style="font-size:10px;color:#cbd5e1;">${sd.desc}</div>
                        </div>
                        <div style="display:flex;gap:4px;">
                            <button type="button" class="btn-ui btn-sky btn-add-ap" data-stat="${sd.key}" data-amt="1" ${(d.ap || 0) < 1 ? 'disabled' : ''}>+1</button>
                            <button type="button" class="btn-ui btn-amber btn-add-ap" data-stat="${sd.key}" data-amt="5" ${(d.ap || 0) < 5 ? 'disabled' : ''}>+5</button>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div style="font-size:13px;font-weight:900;color:#fde047;margin-bottom:6px;">🌟 クラス進化（現在：${curEvo.kaomoji} ${curEvo.name}）</div>
            ${nextEvos.length === 0 ? `
                <div class="card-box" style="font-size:12px;color:#6ee7b7;">👑 現在の進化系統の最高位クラスに到達しています！</div>
            ` : `
                <div class="grid-2">
                    ${nextEvos.map(ev => {
                        const okLv = d.lv >= ev.reqLv;
                        const okMat = this.hasMaterials(ev.reqMat);
                        const canEvo = okLv && okMat;
                        return `
                            <div class="card-box" style="border-color:${canEvo ? '#fde047' : '#334155'};">
                                <div class="flex-between">
                                    <span class="font-kaomoji" style="font-size:13px;font-weight:900;color:${ev.color};">${ev.kaomoji} ${ev.name}</span>
                                    <span class="badge-pill" style="background:${okLv ? '#059669' : '#be123c'};color:#fff;">必要Lv.${ev.reqLv}</span>
                                </div>
                                <div style="font-size:11px;color:#fde047;margin-top:4px;">効果: ${ev.bonusText}</div>
                                <div style="font-size:10px;margin-top:4px;">必要素材: ${this.formatMatCost(ev.reqMat)}</div>
                                <button type="button" class="btn-ui ${canEvo ? 'btn-amber' : 'btn-slate'} btn-do-evo" data-evo="${ev.id}" style="width:100%;margin-top:8px;" ${canEvo ? '' : 'disabled'}>
                                    ✨ このクラスへ進化する
                                </button>
                            </div>
                        `;
                    }).join('')}
                </div>
            `}
        `;

        body.querySelectorAll('.btn-add-ap').forEach(btn => {
            btn.addEventListener('click', () => {
                const k = btn.dataset.stat;
                const amt = Number(btn.dataset.amt) || 1;
                if ((d.ap || 0) < amt) return;
                d.ap -= amt;
                d.stats[k] = (d.stats[k] || 5) + amt;
                sfx.playTone(620, 'sine', 0.08, 0.05);
                this.saveGame(false);
                this.renderModalTabs();
                this.renderModalBody();
                this.refreshAllHUD();
            });
        });

        body.querySelectorAll('.btn-do-evo').forEach(btn => {
            btn.addEventListener('click', () => {
                const ev = EVOLUTIONS[btn.dataset.evo];
                if (!ev || d.lv < ev.reqLv || !this.hasMaterials(ev.reqMat)) return;
                this.consumeMaterials(ev.reqMat);
                d.evolutionId = ev.id;
                this.buildPlayerEntity();
                sfx.playLevelUp();
                this.saveGame(false);
                this.renderModalTabs();
                this.renderModalBody();
                this.refreshAllHUD();
                this.showAlertBanner(`🎉 「${ev.name}」へ進化しました！`, 2400);
            });
        });
    },

    // =====================================================================
    // 3. スキル習得・強化・スロット装備 & スキルツリー
    // =====================================================================
    renderTabSkills(body) {
        const d = this.saveData;
        const st = this.calcDerivedStats();
        const eq = d.equippedSkills || [null, null, null, null, null];

        body.innerHTML = `
            <div class="card-box" style="margin-bottom:10px;">
                <div class="flex-between" style="margin-bottom:6px;">
                    <span style="font-size:13px;font-weight:900;color:#38bdf8;">⚡ 装備中スキル（スロット 1〜5）</span>
                    <span style="font-size:12px;font-weight:900;color:#fde047;">残りスキルP (SP): ${d.sp || 0}</span>
                </div>
                <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;">
                    ${[0, 1, 2, 3, 4].map(idx => {
                        const sid = eq[idx];
                        const sk = sid ? SKILLS[sid] : null;
                        return `
                            <div style="background:#0f172a;border:1px solid #38bdf8;border-radius:8px;padding:6px 4px;text-align:center;">
                                <div style="font-size:10px;color:#94a3b8;">SLOT ${idx + 1}</div>
                                <div style="font-size:18px;margin:2px 0;">${sk ? sk.icon : '➖'}</div>
                                <div style="font-size:10px;font-weight:900;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${sk ? sk.name : '未装備'}</div>
                                ${sk ? `<button type="button" class="btn-ui btn-slate btn-unequip-skill" data-slot="${idx}" style="padding:2px 6px;font-size:9px;margin-top:4px;">外す</button>` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <div style="font-size:13px;font-weight:900;color:#fde047;margin-bottom:6px;">📖 スキル一覧（習得・強化・スロットセット）</div>
            <div class="grid-2" style="margin-bottom:14px;">
                ${Object.values(SKILLS).map(sk => {
                    const lv = d.skills[sk.id] || 0;
                    const costSp = this.getSkillUpgradeCost(lv);
                    const canUp = (d.sp || 0) >= costSp;
                    const eff = getSkillEffectStats(sk, Math.max(1, lv), st);
                    const mpCost = getSkillMpCost(sk, Math.max(1, lv));
                    const eqSlot = eq.indexOf(sk.id);

                    return `
                        <div class="card-box" style="border-color:${lv > 0 ? '#38bdf8' : '#334155'};">
                            <div class="flex-between">
                                <span style="font-size:12px;font-weight:900;color:#fff;">${sk.icon} ${sk.name} <span style="color:#fde047;">${lv > 0 ? `Lv.${lv}` : '未習得'}</span></span>
                                <span style="font-size:10px;color:#7dd3fc;">消費MP:${mpCost} / CT:${sk.cd}s</span>
                            </div>
                            <div style="font-size:10px;color:#cbd5e1;margin-top:3px;">${sk.desc}</div>
                            <div style="font-size:10px;color:#6ee7b7;margin-top:2px;">性能: ${eff.summary}</div>
                            <div class="flex-wrap-gap" style="margin-top:7px;">
                                <button type="button" class="btn-ui ${canUp ? 'btn-amber' : 'btn-slate'} btn-up-skill" data-skill="${sk.id}" ${canUp ? '' : 'disabled'}>
                                    ${lv === 0 ? `✨ 習得 (SP:${costSp})` : `⬆️ 強化 (SP:${costSp})`}
                                </button>
                                ${lv > 0 ? [0, 1, 2, 3, 4].map(sIdx => `
                                    <button type="button" class="btn-ui ${eqSlot === sIdx ? 'btn-emerald' : 'btn-slate'} btn-set-skill" data-skill="${sk.id}" data-slot="${sIdx}" style="padding:5px 7px;">
                                        S${sIdx + 1}
                                    </button>
                                `).join('') : ''}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>

            <div style="font-size:13px;font-weight:900;color:#e879f9;margin-bottom:6px;">🌳 パッシブ・スキルツリー（各ノード SP 1消費）</div>
            <div class="grid-2">
                ${SKILL_TREE_NODES.map(node => {
                    const curLv = (d.tree && d.tree[node.id]) || 0;
                    const isMax = curLv >= node.maxLv;
                    const canUp = !isMax && (d.sp || 0) >= 1;
                    return `
                        <div class="card-box flex-between">
                            <div>
                                <div style="font-size:12px;font-weight:900;color:#f8fafc;">${node.icon} ${node.name} <span style="color:#fde047;">Lv.${curLv}/${node.maxLv}</span></div>
                                <div style="font-size:10px;color:#cbd5e1;">${node.desc}</div>
                            </div>
                            <button type="button" class="btn-ui ${canUp ? 'btn-fuchsia' : 'btn-slate'} btn-up-tree" data-node="${node.id}" ${canUp ? '' : 'disabled'}>
                                ${isMax ? 'MAX' : '+1 (SP:1)'}
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        body.querySelectorAll('.btn-up-skill').forEach(btn => {
            btn.addEventListener('click', () => {
                const sid = btn.dataset.skill;
                const curLv = d.skills[sid] || 0;
                const cost = this.getSkillUpgradeCost(curLv);
                if ((d.sp || 0) < cost) return;
                d.sp -= cost;
                d.skills[sid] = curLv + 1;
                if (curLv === 0) {
                    const emptyIdx = d.equippedSkills.indexOf(null);
                    if (emptyIdx !== -1) d.equippedSkills[emptyIdx] = sid;
                }
                sfx.playSkill();
                this.saveGame(false);
                this.renderModalTabs();
                this.renderModalBody();
                this.refreshAllHUD();
            });
        });

        body.querySelectorAll('.btn-set-skill').forEach(btn => {
            btn.addEventListener('click', () => {
                const sid = btn.dataset.skill;
                const slot = Number(btn.dataset.slot);
                const prevIdx = d.equippedSkills.indexOf(sid);
                if (prevIdx !== -1) d.equippedSkills[prevIdx] = null;
                d.equippedSkills[slot] = sid;
                sfx.playTone(720, 'sine', 0.08, 0.05);
                this.saveGame(false);
                this.renderModalBody();
                this.refreshAllHUD();
            });
        });

        body.querySelectorAll('.btn-unequip-skill').forEach(btn => {
            btn.addEventListener('click', () => {
                const slot = Number(btn.dataset.slot);
                d.equippedSkills[slot] = null;
                this.saveGame(false);
                this.renderModalBody();
                this.refreshAllHUD();
            });
        });

        body.querySelectorAll('.btn-up-tree').forEach(btn => {
            btn.addEventListener('click', () => {
                const nid = btn.dataset.node;
                const node = SKILL_TREE_NODES.find(x => x.id === nid);
                if (!node) return;
                d.tree = d.tree || {};
                const cur = d.tree[nid] || 0;
                if (cur >= node.maxLv || (d.sp || 0) < 1) return;
                d.sp -= 1;
                d.tree[nid] = cur + 1;
                sfx.playLevelUp();
                this.saveGame(false);
                this.renderModalTabs();
                this.renderModalBody();
                this.refreshAllHUD();
            });
        });
    },

    // =====================================================================
    // 4. 装備購入・装備変更・精錬(+1)・エンチャント・素材錬金
    // =====================================================================
    renderTabEquip(body) {
        const d = this.saveData;
        const wEnh = d.weaponEnhance || 0;
        const aEnh = d.armorEnhance || 0;
        const wReq = getWeaponEnhanceRequirement(wEnh);
        const aReq = getArmorEnhanceRequirement(aEnh);
        const canWEnh = d.gold >= wReq.gold && this.hasMaterials(wReq.mats);
        const canAEnh = d.gold >= aReq.gold && this.hasMaterials(aReq.mats);

        const curWpn = WEAPONS[d.weaponId] || WEAPONS.wpn_wood;
        const curArm = ARMORS[d.armorId] || ARMORS.arm_cloth;
        const wEnchObj = ENCHANT_POOL.find(x => x.id === d.weaponEnchant);
        const aEnchObj = ENCHANT_POOL.find(x => x.id === d.armorEnchant);

        body.innerHTML = `
            <div class="grid-2" style="margin-bottom:12px;">
                <div class="card-box" style="border-color:#f59e0b;">
                    <div style="font-size:12px;font-weight:900;color:#fde047;">🔨 武器精錬：${curWpn.icon} ${curWpn.name} <span style="color:#38bdf8;">+${wEnh}</span></div>
                    <div style="font-size:10px;color:#cbd5e1;margin-top:3px;">必要費用: ${formatBigNum(wReq.gold)}G / ${this.formatMatCost(wReq.mats)}</div>
                    <div style="font-size:10px;color:#e879f9;margin-top:3px;">武器エンチャント: ${wEnchObj ? wEnchObj.label : '未付与'}</div>
                    <div style="display:flex;gap:6px;margin-top:7px;">
                        <button type="button" id="btn-enh-weapon" class="btn-ui ${canWEnh ? 'btn-amber' : 'btn-slate'}" style="flex:1;" ${canWEnh ? '' : 'disabled'}>⬆️ 武器精錬 +1</button>
                        <button type="button" id="btn-ench-weapon" class="btn-ui btn-fuchsia" style="flex:1;" ${d.gold >= 500 ? '' : 'disabled'}>✨ 付与抽選 (500G)</button>
                    </div>
                </div>

                <div class="card-box" style="border-color:#38bdf8;">
                    <div style="font-size:12px;font-weight:900;color:#7dd3fc;">🛡️ 防具精錬：${curArm.icon} ${curArm.name} <span style="color:#fde047;">+${aEnh}</span></div>
                    <div style="font-size:10px;color:#cbd5e1;margin-top:3px;">必要費用: ${formatBigNum(aReq.gold)}G / ${this.formatMatCost(aReq.mats)}</div>
                    <div style="font-size:10px;color:#e879f9;margin-top:3px;">防具エンチャント: ${aEnchObj ? aEnchObj.label : '未付与'}</div>
                    <div style="display:flex;gap:6px;margin-top:7px;">
                        <button type="button" id="btn-enh-armor" class="btn-ui ${canAEnh ? 'btn-sky' : 'btn-slate'}" style="flex:1;" ${canAEnh ? '' : 'disabled'}>⬆️ 防具精錬 +1</button>
                        <button type="button" id="btn-ench-armor" class="btn-ui btn-fuchsia" style="flex:1;" ${d.gold >= 500 ? '' : 'disabled'}>✨ 付与抽選 (500G)</button>
                    </div>
                </div>
            </div>

            <div style="font-size:13px;font-weight:900;color:#fde047;margin-bottom:6px;">⚔️ 武器ショップ＆装備</div>
            <div class="grid-3" style="margin-bottom:12px;">
                ${Object.values(WEAPONS).map(w => {
                    const owned = d.ownedWeapons.includes(w.id);
                    const equipped = d.weaponId === w.id;
                    const canBuy = d.gold >= w.costGold && this.hasMaterials(w.costMat);
                    return `
                        <div class="card-box" style="border-color:${equipped ? '#34d399' : '#334155'};">
                            <div style="font-size:12px;font-weight:900;color:#fff;">${w.icon} ${w.name}</div>
                            <div style="font-size:10px;color:#7dd3fc;">攻撃+${w.atk} / 魔力倍率x${w.mag}</div>
                            ${!owned ? `<div style="font-size:10px;margin-top:3px;">${formatBigNum(w.costGold)}G / ${this.formatMatCost(w.costMat)}</div>` : ''}
                            <button type="button" class="btn-ui ${equipped ? 'btn-slate' : (owned ? 'btn-emerald' : (canBuy ? 'btn-amber' : 'btn-slate'))} btn-weapon-act" data-id="${w.id}" style="width:100%;margin-top:6px;" ${(!owned && !canBuy) ? 'disabled' : ''}>
                                ${equipped ? '✔ 装備中' : (owned ? '装備する' : '購入して装備')}
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>

            <div style="font-size:13px;font-weight:900;color:#7dd3fc;margin-bottom:6px;">🛡️ 防具ショップ＆装備</div>
            <div class="grid-3" style="margin-bottom:12px;">
                ${Object.values(ARMORS).map(a => {
                    const owned = d.ownedArmors.includes(a.id);
                    const equipped = d.armorId === a.id;
                    const canBuy = d.gold >= a.costGold && this.hasMaterials(a.costMat);
                    return `
                        <div class="card-box" style="border-color:${equipped ? '#34d399' : '#334155'};">
                            <div style="font-size:12px;font-weight:900;color:#fff;">${a.icon} ${a.name}</div>
                            <div style="font-size:10px;color:#6ee7b7;">HP+${a.hp} / MP+${a.mp} / 軽減+${Math.round(a.def * 100)}%</div>
                            ${!owned ? `<div style="font-size:10px;margin-top:3px;">${formatBigNum(a.costGold)}G / ${this.formatMatCost(a.costMat)}</div>` : ''}
                            <button type="button" class="btn-ui ${equipped ? 'btn-slate' : (owned ? 'btn-emerald' : (canBuy ? 'btn-sky' : 'btn-slate'))} btn-armor-act" data-id="${a.id}" style="width:100%;margin-top:6px;" ${(!owned && !canBuy) ? 'disabled' : ''}>
                                ${equipped ? '✔ 装備中' : (owned ? '装備する' : '購入して装備')}
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>

            <div style="font-size:13px;font-weight:900;color:#f472b6;margin-bottom:6px;">💍 特殊アクセサリー</div>
            <div class="grid-3" style="margin-bottom:12px;">
                ${Object.values(ACCESSORIES).map(ac => {
                    const owned = d.ownedAccessories.includes(ac.id);
                    const equipped = d.accessoryId === ac.id;
                    const canBuy = d.gold >= ac.costGold && this.hasMaterials(ac.costMat);
                    return `
                        <div class="card-box" style="border-color:${equipped ? '#f472b6' : '#334155'};">
                            <div style="font-size:12px;font-weight:900;color:#fff;">${ac.icon} ${ac.name}</div>
                            <div style="font-size:10px;color:#f9a8d4;">${ac.desc}</div>
                            ${!owned ? `<div style="font-size:10px;margin-top:3px;">${formatBigNum(ac.costGold)}G / ${this.formatMatCost(ac.costMat)}</div>` : ''}
                            <button type="button" class="btn-ui ${equipped ? 'btn-slate' : (owned ? 'btn-emerald' : (canBuy ? 'btn-fuchsia' : 'btn-slate'))} btn-acc-act" data-id="${ac.id}" style="width:100%;margin-top:6px;" ${(!owned && !canBuy) ? 'disabled' : ''}>
                                ${equipped ? '✔ 装備中' : (owned ? '装備する' : '購入して装備')}
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>

            <div style="font-size:13px;font-weight:900;color:#6ee7b7;margin-bottom:6px;">⚗️ 所持素材＆上位素材錬金</div>
            <div class="card-box" style="margin-bottom:8px;">
                <div class="flex-wrap-gap">
                    ${Object.values(MATERIALS).map(m => `
                        <span class="badge-pill" style="background:#0f172a;border:1px solid #334155;color:#f8fafc;">${m.icon} ${m.name}: <strong style="color:#fde047;">${d.materials[m.id] || 0}</strong></span>
                    `).join('')}
                </div>
            </div>
            <div class="grid-3">
                ${MATERIAL_ALCHEMY.map((rec, idx) => {
                    const fM = MATERIALS[rec.from];
                    const tM = MATERIALS[rec.to];
                    const canCraft = (d.materials[rec.from] || 0) >= rec.count && d.gold >= rec.gold;
                    return `
                        <div class="card-box flex-between">
                            <div style="font-size:11px;">
                                <div>${fM.icon}x${rec.count} + ${rec.gold}G</div>
                                <div style="color:#6ee7b7;font-weight:900;">➡ ${tM.icon} ${tM.name} x1</div>
                            </div>
                            <button type="button" class="btn-ui ${canCraft ? 'btn-emerald' : 'btn-slate'} btn-alchemy" data-idx="${idx}" ${canCraft ? '' : 'disabled'}>錬金</button>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        body.querySelector('#btn-enh-weapon')?.addEventListener('click', () => {
            if (!canWEnh) return;
            d.gold -= wReq.gold;
            this.consumeMaterials(wReq.mats);
            d.weaponEnhance = wEnh + 1;
            this.buildPlayerEntity();
            sfx.playLevelUp();
            this.saveGame(false);
            this.renderModalBody();
            this.refreshAllHUD();
        });
        body.querySelector('#btn-enh-armor')?.addEventListener('click', () => {
            if (!canAEnh) return;
            d.gold -= aReq.gold;
            this.consumeMaterials(aReq.mats);
            d.armorEnhance = aEnh + 1;
            this.buildPlayerEntity();
            sfx.playLevelUp();
            this.saveGame(false);
            this.renderModalBody();
            this.refreshAllHUD();
        });
        body.querySelector('#btn-ench-weapon')?.addEventListener('click', () => {
            if (d.gold < 500) return;
            d.gold -= 500;
            const pick = ENCHANT_POOL[Math.floor(Math.random() * ENCHANT_POOL.length)];
            d.weaponEnchant = pick.id;
            sfx.playSkill();
            this.saveGame(false);
            this.renderModalBody();
            this.showAlertBanner(`✨ 武器に「${pick.label}」が付与されました！`, 1800);
        });
        body.querySelector('#btn-ench-armor')?.addEventListener('click', () => {
            if (d.gold < 500) return;
            d.gold -= 500;
            const pick = ENCHANT_POOL[Math.floor(Math.random() * ENCHANT_POOL.length)];
            d.armorEnchant = pick.id;
            sfx.playSkill();
            this.saveGame(false);
            this.renderModalBody();
            this.showAlertBanner(`✨ 防具に「${pick.label}」が付与されました！`, 1800);
        });

        body.querySelectorAll('.btn-weapon-act').forEach(btn => {
            btn.addEventListener('click', () => {
                const w = WEAPONS[btn.dataset.id];
                if (!w) return;
                if (!d.ownedWeapons.includes(w.id)) {
                    if (d.gold < w.costGold || !this.hasMaterials(w.costMat)) return;
                    d.gold -= w.costGold;
                    this.consumeMaterials(w.costMat);
                    d.ownedWeapons.push(w.id);
                }
                d.weaponId = w.id;
                this.buildPlayerEntity();
                sfx.playSkill();
                this.saveGame(false);
                this.renderModalBody();
                this.refreshAllHUD();
            });
        });

        body.querySelectorAll('.btn-armor-act').forEach(btn => {
            btn.addEventListener('click', () => {
                const a = ARMORS[btn.dataset.id];
                if (!a) return;
                if (!d.ownedArmors.includes(a.id)) {
                    if (d.gold < a.costGold || !this.hasMaterials(a.costMat)) return;
                    d.gold -= a.costGold;
                    this.consumeMaterials(a.costMat);
                    d.ownedArmors.push(a.id);
                }
                d.armorId = a.id;
                this.buildPlayerEntity();
                sfx.playSkill();
                this.saveGame(false);
                this.renderModalBody();
                this.refreshAllHUD();
            });
        });

        body.querySelectorAll('.btn-acc-act').forEach(btn => {
            btn.addEventListener('click', () => {
                const ac = ACCESSORIES[btn.dataset.id];
                if (!ac) return;
                if (!d.ownedAccessories.includes(ac.id)) {
                    if (d.gold < ac.costGold || !this.hasMaterials(ac.costMat)) return;
                    d.gold -= ac.costGold;
                    this.consumeMaterials(ac.costMat);
                    d.ownedAccessories.push(ac.id);
                }
                d.accessoryId = ac.id;
                sfx.playSkill();
                this.saveGame(false);
                this.renderModalBody();
                this.refreshAllHUD();
            });
        });

        body.querySelectorAll('.btn-alchemy').forEach(btn => {
            btn.addEventListener('click', () => {
                const rec = MATERIAL_ALCHEMY[Number(btn.dataset.idx)];
                if (!rec || (d.materials[rec.from] || 0) < rec.count || d.gold < rec.gold) return;
                d.materials[rec.from] -= rec.count;
                d.gold -= rec.gold;
                d.materials[rec.to] = (d.materials[rec.to] || 0) + 1;
                sfx.playHeal();
                this.saveGame(false);
                this.renderModalBody();
                this.refreshAllHUD();
            });
        });
    },

    // =====================================================================
    // 5. 見た目・顔文字・体色・顔背景色・体型・頭/背中着せ替え
    // =====================================================================
    renderTabLook(body) {
        const d = this.saveData;

        body.innerHTML = `
            <div class="card-box" style="margin-bottom:10px;">
                <div style="font-size:12px;font-weight:900;color:#38bdf8;margin-bottom:6px;">😊 顔文字フェイス設定（自由入力＆プリセット）</div>
                <div style="display:flex;gap:6px;margin-bottom:8px;">
                    <input id="inp-custom-kaomoji" class="input-ui font-kaomoji" type="text" maxlength="20" value="${this.getBasePlayerKaomoji().replace(/"/g, '&quot;')}" placeholder="好きな顔文字を入力...">
                    <button type="button" id="btn-save-kaomoji" class="btn-ui btn-sky" style="white-space:nowrap;">適用</button>
                    <button type="button" id="btn-reset-kaomoji" class="btn-ui btn-slate" style="white-space:nowrap;">職業標準</button>
                </div>
                <div class="flex-wrap-gap">
                    ${KAOMOJI_PRESETS.map(k => `
                        <button type="button" class="btn-ui btn-slate font-kaomoji btn-preset-k" data-k="${k.replace(/"/g, '&quot;')}" style="padding:4px 8px;">${k}</button>
                    `).join('')}
                </div>
            </div>

            <div class="grid-2" style="margin-bottom:10px;">
                <div class="card-box">
                    <div style="font-size:12px;font-weight:900;color:#fde047;margin-bottom:6px;">🎨 ボディカラー（体色）</div>
                    <div class="flex-wrap-gap">
                        ${BODY_COLOR_PRESETS.map(c => {
                            const active = (d.bodyColor || '') === c.hex;
                            const bg = c.hex || '#38bdf8';
                            const txtCol = isLightHexColor(bg) ? '#0f172a' : '#ffffff';
                            return `<button type="button" class="btn-ui btn-body-col" data-hex="${c.hex}" style="background:${bg};color:${txtCol};border:${active ? '2px solid #fde047' : '1px solid #475569'};padding:5px 8px;">${c.name}</button>`;
                        }).join('')}
                    </div>
                </div>

                <div class="card-box">
                    <div style="font-size:12px;font-weight:900;color:#7dd3fc;margin-bottom:6px;">🖥️ 顔モニター背景色＆体型サイズ</div>
                    <div class="flex-wrap-gap" style="margin-bottom:8px;">
                        ${FACE_BG_PRESETS.map(f => {
                            const active = (d.faceBgColor || '#073b66') === f.hex;
                            const txtCol = isLightHexColor(f.hex) ? '#0f172a' : '#ffffff';
                            return `<button type="button" class="btn-ui btn-face-bg" data-hex="${f.hex}" style="background:${f.hex};color:${txtCol};border:${active ? '2px solid #fde047' : '1px solid #475569'};padding:5px 8px;">${f.name}</button>`;
                        }).join('')}
                    </div>
                    <div class="flex-wrap-gap">
                        ${BODY_SCALE_PRESETS.map(sc => {
                            const active = Math.abs((d.bodyScale || 1.0) - sc.scale) < 0.02;
                            return `<button type="button" class="btn-ui ${active ? 'btn-emerald' : 'btn-slate'} btn-body-scale" data-scale="${sc.scale}">${sc.name}</button>`;
                        }).join('')}
                    </div>
                </div>
            </div>

            <div style="font-size:13px;font-weight:900;color:#f472b6;margin-bottom:6px;">🎀 頭パーツ着せ替え</div>
            <div class="grid-3" style="margin-bottom:12px;">
                ${Object.values(COSMETICS).map(c => {
                    const owned = d.ownedCosmetics.includes(c.id);
                    const equipped = (d.cosmeticId || 'none') === c.id;
                    const canBuy = d.gold >= c.costGold && this.hasMaterials(c.costMat);
                    return `
                        <div class="card-box" style="border-color:${equipped ? '#f472b6' : '#334155'};">
                            <div style="font-size:12px;font-weight:900;color:#fff;">${c.icon} ${c.name}</div>
                            <div style="font-size:10px;color:#cbd5e1;">${c.desc}</div>
                            ${!owned ? `<div style="font-size:10px;margin-top:3px;">${formatBigNum(c.costGold)}G / ${this.formatMatCost(c.costMat)}</div>` : ''}
                            <button type="button" class="btn-ui ${equipped ? 'btn-slate' : (owned ? 'btn-emerald' : (canBuy ? 'btn-fuchsia' : 'btn-slate'))} btn-cos-head" data-id="${c.id}" style="width:100%;margin-top:6px;" ${(!owned && !canBuy) ? 'disabled' : ''}>
                                ${equipped ? '✔ 装着中' : (owned ? '装着する' : '解放して装着')}
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>

            <div style="font-size:13px;font-weight:900;color:#fde047;margin-bottom:6px;">🦋 背中パーツ着せ替え（頭パーツと同時装着OK）</div>
            <div class="grid-3">
                ${Object.values(BACK_COSMETICS).map(b => {
                    const owned = d.ownedBackCosmetics.includes(b.id);
                    const equipped = (d.backCosmeticId || 'back_none') === b.id;
                    const canBuy = d.gold >= b.costGold && this.hasMaterials(b.costMat);
                    return `
                        <div class="card-box" style="border-color:${equipped ? '#fde047' : '#334155'};">
                            <div style="font-size:12px;font-weight:900;color:#fff;">${b.icon} ${b.name}</div>
                            <div style="font-size:10px;color:#cbd5e1;">${b.desc}</div>
                            ${!owned ? `<div style="font-size:10px;margin-top:3px;">${formatBigNum(b.costGold)}G / ${this.formatMatCost(b.costMat)}</div>` : ''}
                            <button type="button" class="btn-ui ${equipped ? 'btn-slate' : (owned ? 'btn-emerald' : (canBuy ? 'btn-amber' : 'btn-slate'))} btn-cos-back" data-id="${b.id}" style="width:100%;margin-top:6px;" ${(!owned && !canBuy) ? 'disabled' : ''}>
                                ${equipped ? '✔ 装着中' : (owned ? '装着する' : '解放して装着')}
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        const applyLookChange = () => {
            this.buildPlayerEntity();
            this.saveGame(false);
            this.renderModalBody();
            this.refreshAllHUD();
        };

        body.querySelector('#btn-save-kaomoji')?.addEventListener('click', () => {
            const val = body.querySelector('#inp-custom-kaomoji')?.value.trim();
            d.customKaomoji = val || '';
            sfx.playSkill();
            applyLookChange();
        });
        body.querySelector('#btn-reset-kaomoji')?.addEventListener('click', () => {
            d.customKaomoji = '';
            applyLookChange();
        });
        body.querySelectorAll('.btn-preset-k').forEach(btn => {
            btn.addEventListener('click', () => {
                d.customKaomoji = btn.dataset.k;
                sfx.playTone(660, 'sine', 0.08, 0.05);
                applyLookChange();
            });
        });
        body.querySelectorAll('.btn-body-col').forEach(btn => {
            btn.addEventListener('click', () => {
                d.bodyColor = btn.dataset.hex;
                applyLookChange();
            });
        });
        body.querySelectorAll('.btn-face-bg').forEach(btn => {
            btn.addEventListener('click', () => {
                d.faceBgColor = btn.dataset.hex;
                applyLookChange();
            });
        });
        body.querySelectorAll('.btn-body-scale').forEach(btn => {
            btn.addEventListener('click', () => {
                d.bodyScale = Number(btn.dataset.scale) || 1.0;
                applyLookChange();
            });
        });
        body.querySelectorAll('.btn-cos-head').forEach(btn => {
            btn.addEventListener('click', () => {
                const c = COSMETICS[btn.dataset.id];
                if (!c) return;
                if (!d.ownedCosmetics.includes(c.id)) {
                    if (d.gold < c.costGold || !this.hasMaterials(c.costMat)) return;
                    d.gold -= c.costGold;
                    this.consumeMaterials(c.costMat);
                    d.ownedCosmetics.push(c.id);
                }
                d.cosmeticId = c.id;
                sfx.playSkill();
                applyLookChange();
            });
        });
        body.querySelectorAll('.btn-cos-back').forEach(btn => {
            btn.addEventListener('click', () => {
                const b = BACK_COSMETICS[btn.dataset.id];
                if (!b) return;
                if (!d.ownedBackCosmetics.includes(b.id)) {
                    if (d.gold < b.costGold || !this.hasMaterials(b.costMat)) return;
                    d.gold -= b.costGold;
                    this.consumeMaterials(b.costMat);
                    d.ownedBackCosmetics.push(b.id);
                }
                d.backCosmeticId = b.id;
                sfx.playSkill();
                applyLookChange();
            });
        });
    },

    // =====================================================================
    // 6. 相棒ペット解放・連れ歩き・レベル強化
    // =====================================================================
    renderTabPet(body) {
        const d = this.saveData;
        const petLv = d.petLevel || 1;
        const lvUpGold = Math.round(300 * Math.pow(1.35, petLv - 1));

        body.innerHTML = `
            <div class="card-box" style="margin-bottom:10px;">
                <div class="flex-between">
                    <div>
                        <div style="font-size:13px;font-weight:900;color:#fde047;">🐾 相棒ペット育成レベル: Lv.${petLv}</div>
                        <div style="font-size:11px;color:#cbd5e1;">全ペット共通で自動攻撃＆回復効果が +${(petLv - 1) * 18}% 強化されます</div>
                    </div>
                    <button type="button" id="btn-up-pet-lv" class="btn-ui ${d.gold >= lvUpGold ? 'btn-amber' : 'btn-slate'}" ${d.gold >= lvUpGold ? '' : 'disabled'}>
                        ⬆️ ペット強化 (${formatBigNum(lvUpGold)}G)
                    </button>
                </div>
            </div>

            <div class="grid-2">
                ${Object.values(PETS).map(p => {
                    const owned = d.ownedPets.includes(p.id);
                    const equipped = d.petId === p.id;
                    const canBuy = d.gold >= p.costGold && this.hasMaterials(p.costMat);
                    return `
                        <div class="card-box" style="border-color:${equipped ? '#34d399' : '#334155'};">
                            <div class="flex-between">
                                <span class="font-kaomoji" style="font-size:13px;font-weight:900;color:#38bdf8;">${p.kaomoji} ${p.name}</span>
                                <span class="badge-pill" style="background:#1e293b;color:#fde047;">攻撃倍率 x${p.atkRatio}</span>
                            </div>
                            <div style="font-size:11px;color:#cbd5e1;margin-top:4px;">${p.desc}</div>
                            ${!owned ? `<div style="font-size:10px;margin-top:4px;">${formatBigNum(p.costGold)}G / ${this.formatMatCost(p.costMat)}</div>` : ''}
                            <button type="button" class="btn-ui ${equipped ? 'btn-rose' : (owned ? 'btn-emerald' : (canBuy ? 'btn-sky' : 'btn-slate'))} btn-pet-act" data-id="${p.id}" style="width:100%;margin-top:8px;" ${(!owned && !canBuy) ? 'disabled' : ''}>
                                ${equipped ? '待機させる（外す）' : (owned ? '🐾 連れ歩く' : '仲間にして連れ歩く')}
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        body.querySelector('#btn-up-pet-lv')?.addEventListener('click', () => {
            if (d.gold < lvUpGold) return;
            d.gold -= lvUpGold;
            d.petLevel = petLv + 1;
            sfx.playLevelUp();
            this.saveGame(false);
            this.renderModalBody();
            this.refreshAllHUD();
        });

        body.querySelectorAll('.btn-pet-act').forEach(btn => {
            btn.addEventListener('click', () => {
                const p = PETS[btn.dataset.id];
                if (!p) return;
                if (!d.ownedPets.includes(p.id)) {
                    if (d.gold < p.costGold || !this.hasMaterials(p.costMat)) return;
                    d.gold -= p.costGold;
                    this.consumeMaterials(p.costMat);
                    d.ownedPets.push(p.id);
                }
                d.petId = (d.petId === p.id) ? null : p.id;
                this.buildPetEntity();
                sfx.playHeal();
                this.saveGame(false);
                this.renderModalBody();
            });
        });
    },

    // =====================================================================
    // 7. 実績・称号・極限超越転生
    // =====================================================================
    renderTabRebirth(body) {
        const d = this.saveData;
        const canRebirth = d.lv >= REBIRTH_REQ_LEVEL;
        const nextRebirth = (d.rebirthCount || 0) + 1;

        body.innerHTML = `
            <div class="card-box" style="margin-bottom:12px;border-color:#f59e0b;">
                <div class="flex-between">
                    <div>
                        <div style="font-size:14px;font-weight:900;color:#fde047;">🌟 極限超越転生（現在：転生 ${d.rebirthCount || 0} 回）</div>
                        <div style="font-size:11px;color:#cbd5e1;margin-top:3px;">Lv.${REBIRTH_REQ_LEVEL}以上で転生可能！全基礎ステータス永続 +35%（累計 +${nextRebirth * 35}%）＆ AP+15 / SP+5 獲得！</div>
                        <div style="font-size:10px;color:#fda4af;margin-top:2px;">※ Lvは1に戻りますが、装備・精錬・素材・スキル・ペット・進化・ゴールドはすべて引き継がれます。</div>
                    </div>
                    <button type="button" id="btn-do-rebirth" class="btn-ui ${canRebirth ? 'btn-amber' : 'btn-slate'}" ${canRebirth ? '' : 'disabled'}>
                        ${canRebirth ? '🔥 超越転生する！' : `Lv.${REBIRTH_REQ_LEVEL}必要`}
                    </button>
                </div>
            </div>

            <div style="font-size:13px;font-weight:900;color:#38bdf8;margin-bottom:6px;">🏅 称号装備</div>
            <div class="grid-3" style="margin-bottom:12px;">
                ${Object.values(TITLES).filter(t => d.unlockedTitles.includes(t.id)).map(t => {
                    const eq = (d.equippedTitleId || 'title_none') === t.id;
                    return `
                        <div class="card-box" style="border-color:${eq ? '#fde047' : '#334155'};">
                            <div style="font-size:12px;font-weight:900;color:#fff;">${t.name}</div>
                            <div style="font-size:10px;color:#6ee7b7;">${t.bonusText}</div>
                            <button type="button" class="btn-ui ${eq ? 'btn-slate' : 'btn-sky'} btn-eq-title" data-id="${t.id}" style="width:100%;margin-top:6px;">
                                ${eq ? '✔ 装備中' : '称号を装備'}
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>

            <div style="font-size:13px;font-weight:900;color:#6ee7b7;margin-bottom:6px;">🏆 実績ミッション</div>
            <div class="grid-2">
                ${ACHIEVEMENTS.map(ach => {
                    const curVal = (d.statsTrack && d.statsTrack[ach.key]) || (ach.key === 'rebirthCount' ? (d.rebirthCount || 0) : 0);
                    const claimed = d.claimedAchievements.includes(ach.id);
                    const done = curVal >= ach.req;
                    return `
                        <div class="card-box flex-between">
                            <div>
                                <div style="font-size:12px;font-weight:900;color:#fff;">${ach.name} (${Math.min(curVal, ach.req)}/${ach.req})</div>
                                <div style="font-size:10px;color:#cbd5e1;">${ach.desc}</div>
                                <div style="font-size:10px;color:#fde047;">報酬: AP+${ach.rewardAp} / SP+${ach.rewardSp} / 称号「${TITLES[ach.titleId]?.name || ''}」</div>
                            </div>
                            <button type="button" class="btn-ui ${claimed ? 'btn-slate' : (done ? 'btn-emerald' : 'btn-slate')} btn-claim-ach" data-id="${ach.id}" ${(claimed || !done) ? 'disabled' : ''}>
                                ${claimed ? '受取済' : (done ? '🎁 受取' : '未達成')}
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        body.querySelector('#btn-do-rebirth')?.addEventListener('click', () => {
            if (d.lv < REBIRTH_REQ_LEVEL) return;
            this.showConfirmDialog(
                '🌟 極限超越転生の確認',
                `転生回数 +1（基礎能力さらに+35%）、AP+15、SP+5 を獲得してLv.1から再出発しますか？`,
                () => {
                    d.rebirthCount = (d.rebirthCount || 0) + 1;
                    d.lv = 1;
                    d.exp = 0;
                    d.ap = (d.ap || 0) + 15;
                    d.sp = (d.sp || 0) + 5;
                    const st = this.calcDerivedStats();
                    if (this.player) {
                        this.player.hp = st.maxHp;
                        this.player.mp = st.maxMp;
                    }
                    sfx.playLevelUp();
                    this.saveGame(false);
                    this.renderModalTabs();
                    this.renderModalBody();
                    this.refreshAllHUD();
                    this.showAlertBanner(`👑 極限超越転生（${d.rebirthCount}回目）を達成しました！`, 2600);
                }
            );
        });

        body.querySelectorAll('.btn-eq-title').forEach(btn => {
            btn.addEventListener('click', () => {
                d.equippedTitleId = btn.dataset.id;
                this.saveGame(false);
                this.renderModalBody();
                this.refreshAllHUD();
            });
        });

        body.querySelectorAll('.btn-claim-ach').forEach(btn => {
            btn.addEventListener('click', () => {
                const ach = ACHIEVEMENTS.find(x => x.id === btn.dataset.id);
                if (!ach || d.claimedAchievements.includes(ach.id)) return;
                d.claimedAchievements.push(ach.id);
                d.ap = (d.ap || 0) + ach.rewardAp;
                d.sp = (d.sp || 0) + ach.rewardSp;
                if (ach.titleId && !d.unlockedTitles.includes(ach.titleId)) {
                    d.unlockedTitles.push(ach.titleId);
                }
                sfx.playLevelUp();
                this.saveGame(false);
                this.renderModalTabs();
                this.renderModalBody();
                this.refreshAllHUD();
            });
        });
    },

    // =====================================================================
    // 8. オンライン通信・部屋パスワード・セーブデータ引継ぎ
    // =====================================================================
    renderTabOnline(body) {
        const d = this.saveData;
        const remoteCount = this.remotePlayers ? this.remotePlayers.size : 0;

        body.innerHTML = `
            <div class="card-box" style="margin-bottom:10px;border-color:${this.fbConnected ? '#34d399' : '#38bdf8'};">
                <div class="flex-between" style="margin-bottom:6px;">
                    <div>
                        <div style="font-size:13px;font-weight:900;color:${this.fbConnected ? '#34d399' : '#38bdf8'};">
                            ${this.fbConnected ? `🌐 オンライン接続中（同室プレイヤー: ${remoteCount}人）` : '📴 オフライン状態'}
                        </div>
                        <div style="font-size:11px;color:#cbd5e1;">同じ部屋にいるプレイヤーと3D空間で合流・チャット・共闘報酬(+25%)が有効になります</div>
                    </div>
                    <button type="button" id="m-btn-toggle-online" class="btn-ui ${this.fbConnected ? 'btn-rose' : 'btn-emerald'}">
                        ${this.fbConnected ? '切断する' : '🌐 オンライン接続'}
                    </button>
                </div>

                <div style="margin-top:8px;padding-top:8px;border-top:1px solid #334155;">
                    <div class="flex-between" style="margin-bottom:6px;">
                        <span style="font-size:11px;font-weight:900;color:#fde047;">🔒 部屋パスワード制限（合言葉）</span>
                        <button type="button" id="m-btn-toggle-pass" class="btn-ui ${d.roomPassEnabled ? 'btn-amber' : 'btn-slate'}">
                            ${d.roomPassEnabled ? '🔒 パスワード: ON' : '🔓 パスワード: OFF（公開部屋）'}
                        </button>
                    </div>
                    <div style="display:flex;gap:6px;">
                        <input id="m-inp-room-pass" class="input-ui" type="text" maxlength="16" value="${(d.roomPassword || '').replace(/"/g, '&quot;')}" placeholder="合言葉を入力（例: 7777）">
                        <button type="button" id="m-btn-apply-room" class="btn-ui btn-sky" style="white-space:nowrap;">部屋を更新</button>
                    </div>
                </div>
            </div>

            <div class="card-box" style="margin-bottom:10px;">
                <div style="font-size:12px;font-weight:900;color:#7dd3fc;margin-bottom:4px;">🔌 サーバー接続設定（空欄なら自動パブリック通信を使用）</div>
                <div style="display:flex;gap:6px;">
                    <input id="m-inp-fb-url" class="input-ui" type="text" value="${(d.firebaseUrl || '').replace(/"/g, '&quot;')}" placeholder="任意: Firebase RTDB URL (https://xxx.firebaseio.com)">
                    <button type="button" id="m-btn-save-url" class="btn-ui btn-emerald" style="white-space:nowrap;">保存＆再接続</button>
                </div>
            </div>

            <div class="card-box">
                <div style="font-size:12px;font-weight:900;color:#fde047;margin-bottom:4px;">📦 セーブデータ引継ぎコード（機種変更・バックアップ用）</div>
                <div style="display:flex;gap:6px;margin-bottom:6px;">
                    <button type="button" id="m-btn-export-code" class="btn-ui btn-sky">📤 引継ぎコードを発行</button>
                    <button type="button" id="m-btn-import-code" class="btn-ui btn-amber">📥 コードから復元</button>
                </div>
                <textarea id="m-txt-save-code" class="input-ui" rows="3" placeholder="ここに引継ぎコードが表示されます／復元したいコードを貼り付けてください"></textarea>
            </div>
        `;

        body.querySelector('#m-btn-toggle-online')?.addEventListener('click', () => {
            if (this.toggleOnlineFromHud) this.toggleOnlineFromHud();
            this.renderModalBody();
        });
        body.querySelector('#m-btn-toggle-pass')?.addEventListener('click', () => {
            d.roomPassEnabled = !d.roomPassEnabled;
            this.saveGame(false);
            if (this.fbConnected && this.connectFirebase) this.connectFirebase(d.firebaseUrl, true);
            this.renderModalBody();
        });
        body.querySelector('#m-btn-apply-room')?.addEventListener('click', () => {
            const val = body.querySelector('#m-inp-room-pass')?.value || '';
            d.roomPassword = val.trim();
            this.saveGame(false);
            if (this.fbConnected && this.connectFirebase) this.connectFirebase(d.firebaseUrl, false);
            this.renderModalBody();
        });
        body.querySelector('#m-btn-save-url')?.addEventListener('click', () => {
            const url = (body.querySelector('#m-inp-fb-url')?.value || '').trim().replace(/\/+$/, '');
            d.firebaseUrl = url;
            d.onlineEnabled = true;
            this.saveGame(false);
            if (this.connectFirebase) this.connectFirebase(url, false);
            this.renderModalBody();
        });
        body.querySelector('#m-btn-export-code')?.addEventListener('click', () => {
            const txt = body.querySelector('#m-txt-save-code');
            if (txt && this.exportSaveCode) {
                txt.value = this.exportSaveCode();
                txt.select();
                this.showAlertBanner('📤 引継ぎコードを発行しました！コピーして保管してください', 2200);
            }
        });
        body.querySelector('#m-btn-import-code')?.addEventListener('click', () => {
            const code = body.querySelector('#m-txt-save-code')?.value.trim();
            if (!code || !this.importSaveCode) return;
            this.importSaveCode(code);
        });
    }
});
