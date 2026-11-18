'use strict';

// =========================================================================
// 顔文字ファンタジー3D メニューUI・転職・装備制限・オンライン同期 (game5.js)
// =========================================================================

Object.assign(KaomojiMMORPG.prototype, {

    openGrowthModal(tab = 'stats') {
        this.activeTab = tab || 'stats';
        this.isModalOpen = true;
        const modal = document.getElementById('growth-modal');
        if (modal) modal.classList.remove('hidden');

        document.querySelectorAll('[data-menu-tab]').forEach(btn => {
            const t = btn.getAttribute('data-menu-tab');
            btn.classList.toggle('active', t === this.activeTab);
        });

        this.renderGrowthTabContent();
    },

    closeGrowthModal() {
        this.isModalOpen = false;
        const modal = document.getElementById('growth-modal');
        if (modal) modal.classList.add('hidden');
        this.refreshAllHUD();
    },

    formatMatCost(costMat) {
        if (!costMat) return '';
        const entries = Object.entries(costMat).filter(([, v]) => v > 0);
        if (entries.length === 0) return '素材不要';
        return entries.map(([k, v]) => {
            const m = MATERIALS[k];
            const have = (this.saveData.materials && this.saveData.materials[k]) || 0;
            const ok = have >= v;
            return `<span style="color:${ok ? '#6ee7b7' : '#fca5a5'};">${m ? m.icon + m.name : k} ${have}/${v}</span>`;
        }).join(' / ');
    },

    hasEnoughMats(costMat) {
        if (!costMat) return true;
        for (const [k, v] of Object.entries(costMat)) {
            if (((this.saveData.materials && this.saveData.materials[k]) || 0) < v) return false;
        }
        return true;
    },

    consumeMats(costMat) {
        if (!costMat) return;
        this.saveData.materials = this.saveData.materials || {};
        for (const [k, v] of Object.entries(costMat)) {
            this.saveData.materials[k] = Math.max(0, (this.saveData.materials[k] || 0) - v);
        }
    },

    renderGrowthTabContent() {
        const body = document.getElementById('modal-body-content');
        if (!body) return;

        const d = this.saveData;
        const st = this.calcDerivedStats();
        const evo = EVOLUTIONS[d.evolutionId] || EVOLUTIONS.novice;

        if (this.activeTab === 'stats') {
            const statDefs = [
                { key: 'str', name: 'STR (筋力)', desc: '物理攻撃力・会心ダメージが上昇' },
                { key: 'int', name: 'INT (知力)', desc: '杖の魔法攻撃力・スキル威力・最大MPが上昇' },
                { key: 'vit', name: 'VIT (体力)', desc: '最大HP・ダメージ軽減率が上昇' },
                { key: 'agi', name: 'AGI (敏捷)', desc: '移動速度・会心率・スキルCT短縮が上昇' }
            ];
            body.innerHTML = `
                <div class="card-box" style="margin-bottom:10px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-weight:900; color:#fde047;">✨ 残りステータスポイント (AP): ${d.ap || 0}</span>
                        <span style="font-size:11px; color:#94a3b8;">現在役職: ${evo.name}</span>
                    </div>
                    <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:6px; margin-top:8px; font-size:11px; color:#e2e8f0;">
                        <div>⚔️ 物理攻撃力: <b>${formatBigNum(st.physAtk)}</b></div>
                        <div>🪄 魔法攻撃力: <b>${formatBigNum(st.magAtk)}</b></div>
                        <div>❤️ 最大HP: <b>${formatBigNum(st.maxHp)}</b></div>
                        <div>💧 最大MP: <b>${formatBigNum(st.maxMp)}</b></div>
                        <div>💥 会心率/倍率: <b>${Math.round(st.critChance * 100)}% / x${st.critDmg.toFixed(2)}</b></div>
                        <div>🛡️ 被ダメ軽減: <b>${Math.round(st.defMitigation * 100)}%</b></div>
                        <div>⚡ CT短縮: <b>${Math.round(st.cdReduction * 100)}%</b></div>
                        <div>🔮 スキル魔力倍率: <b>x${st.magMult.toFixed(2)}</b></div>
                    </div>
                </div>
                <div style="display:grid; gap:8px;">
                    ${statDefs.map(sd => `
                        <div class="card-box" style="display:flex; justify-content:space-between; align-items:center;">
                            <div>
                                <div style="font-weight:900; color:#38bdf8;">${sd.name}: <span style="color:#fff; font-size:15px;">${d.stats[sd.key] || 5}</span></div>
                                <div style="font-size:11px; color:#94a3b8;">${sd.desc}</div>
                            </div>
                            <div style="display:flex; gap:6px;">
                                <button type="button" class="btn-ui btn-sky" data-add-stat="${sd.key}" data-amt="1" ${(d.ap || 0) < 1 ? 'disabled' : ''}>+1</button>
                                <button type="button" class="btn-ui btn-amber" data-add-stat="${sd.key}" data-amt="5" ${(d.ap || 0) < 5 ? 'disabled' : ''}>+5</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

            body.querySelectorAll('[data-add-stat]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const key = btn.getAttribute('data-add-stat');
                    const amt = Number(btn.getAttribute('data-amt')) || 1;
                    if ((d.ap || 0) < amt) return;
                    d.ap -= amt;
                    d.stats[key] = (d.stats[key] || 5) + amt;
                    sfx.playSkill();
                    this.saveGame(false);
                    this.renderGrowthTabContent();
                    this.refreshAllHUD();
                });
            });

        } else if (this.activeTab === 'skills') {
            const eq = d.equippedSkills || [null, null, null, null, null];
            body.innerHTML = `
                <div class="card-box" style="margin-bottom:10px;">
                    <div style="font-weight:900; color:#fde047; margin-bottom:4px;">📘 スキル習得・強化（残りSP: ${d.sp || 0}）</div>
                    <div style="font-size:11px; color:#93c5fd;">※ 消費MPは基礎値の5倍＋スキルLvが1上がるごとに+10増加します</div>
                    <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:8px;">
                        ${eq.map((sid, idx) => {
                            const sObj = sid ? SKILLS[sid] : null;
                            return `<div style="padding:4px 8px; border-radius:6px; background:#0f172a; border:1px solid #334155; font-size:11px;">
                                スロット${idx + 1}: <b>${sObj ? sObj.icon + sObj.name : '未セット'}</b>
                            </div>`;
                        }).join('')}
                    </div>
                </div>
                <div style="display:grid; gap:8px;">
                    ${Object.values(SKILLS).map(sk => {
                        const curLv = (d.skills && d.skills[sk.id]) || 0;
                        const unlocked = curLv > 0;
                        const costSp = unlocked ? this.getSkillUpgradeCost(curLv) : 1;
                        const curMp = getSkillMpCost(sk, Math.max(1, curLv));
                        const nextMp = getSkillMpCost(sk, curLv + 1);
                        const eff = getSkillEffectStats(sk, Math.max(1, curLv), st);
                        const equippedIdx = eq.indexOf(sk.id);

                        return `
                            <div class="card-box">
                                <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
                                    <div>
                                        <div style="font-weight:900; font-size:13px; color:#fff;">
                                            ${sk.icon} ${sk.name}
                                            <span style="color:#fde047; margin-left:6px;">${unlocked ? `Lv.${curLv}` : '未習得'}</span>
                                        </div>
                                        <div style="font-size:11px; color:#cbd5e1; margin-top:2px;">${sk.desc}</div>
                                        <div style="font-size:11px; color:#6ee7b7; margin-top:2px;">
                                            現在効果: ${eff.summary} ｜ CT: ${sk.cd}秒 ｜ 消費MP: <b>${curMp}</b> ${unlocked ? `(次Lv: ${nextMp})` : ''}
                                        </div>
                                    </div>
                                    <div style="display:flex; flex-direction:column; gap:5px; align-items:flex-end;">
                                        <button type="button" class="btn-ui btn-emerald" data-up-skill="${sk.id}" ${(d.sp || 0) < costSp ? 'disabled' : ''}>
                                            ${unlocked ? `強化 (SP${costSp})` : '習得 (SP1)'}
                                        </button>
                                        ${unlocked ? `
                                            <div style="display:flex; gap:3px;">
                                                ${[0, 1, 2, 3, 4].map(slotIdx => `
                                                    <button type="button" class="btn-ui ${equippedIdx === slotIdx ? 'btn-amber' : 'btn-slate'}"
                                                        style="padding:3px 6px; font-size:10px;"
                                                        data-eq-skill="${sk.id}" data-slot="${slotIdx}">
                                                        ${slotIdx + 1}
                                                    </button>
                                                `).join('')}
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;

            body.querySelectorAll('[data-up-skill]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const sid = btn.getAttribute('data-up-skill');
                    const curLv = (d.skills && d.skills[sid]) || 0;
                    const cost = curLv > 0 ? this.getSkillUpgradeCost(curLv) : 1;
                    if ((d.sp || 0) < cost) return;
                    d.sp -= cost;
                    d.skills = d.skills || {};
                    d.skills[sid] = curLv + 1;
                    if (curLv === 0) {
                        const emptyIdx = (d.equippedSkills || []).indexOf(null);
                        if (emptyIdx !== -1) d.equippedSkills[emptyIdx] = sid;
                    }
                    sfx.playLevelUp();
                    this.saveGame(false);
                    this.renderGrowthTabContent();
                    this.refreshAllHUD();
                });
            });

            body.querySelectorAll('[data-eq-skill]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const sid = btn.getAttribute('data-eq-skill');
                    const slot = Number(btn.getAttribute('data-slot'));
                    d.equippedSkills = d.equippedSkills || [null, null, null, null, null];
                    const oldIdx = d.equippedSkills.indexOf(sid);
                    if (oldIdx !== -1) d.equippedSkills[oldIdx] = null;
                    d.equippedSkills[slot] = sid;
                    sfx.playTone(620, 'sine', 0.08, 0.05);
                    this.saveGame(false);
                    this.renderGrowthTabContent();
                    this.refreshAllHUD();
                });
            });

        } else if (this.activeTab === 'tree') {
            body.innerHTML = `
                <div class="card-box" style="margin-bottom:10px;">
                    <span style="font-weight:900; color:#fde047;">🌳 パッシブスキルツリー（残りSP: ${d.sp || 0}）</span>
                </div>
                <div style="display:grid; gap:8px;">
                    ${SKILL_TREE_NODES.map(node => {
                        const lv = (d.tree && d.tree[node.id]) || 0;
                        const isMax = lv >= node.maxLv;
                        return `
                            <div class="card-box" style="display:flex; justify-content:space-between; align-items:center;">
                                <div>
                                    <div style="font-weight:900; color:#fff;">${node.icon} ${node.name} <span style="color:#38bdf8;">Lv.${lv}/${node.maxLv}</span></div>
                                    <div style="font-size:11px; color:#cbd5e1;">${node.desc}</div>
                                </div>
                                <button type="button" class="btn-ui btn-sky" data-tree-node="${node.id}" ${(isMax || (d.sp || 0) < 1) ? 'disabled' : ''}>
                                    ${isMax ? 'MAX' : '+1 (SP1)'}
                                </button>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;

            body.querySelectorAll('[data-tree-node]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const nid = btn.getAttribute('data-tree-node');
                    const node = SKILL_TREE_NODES.find(x => x.id === nid);
                    if (!node || (d.sp || 0) < 1) return;
                    d.tree = d.tree || {};
                    const cur = d.tree[nid] || 0;
                    if (cur >= node.maxLv) return;
                    d.sp -= 1;
                    d.tree[nid] = cur + 1;
                    sfx.playSkill();
                    this.saveGame(false);
                    this.renderGrowthTabContent();
                    this.refreshAllHUD();
                });
            });

        } else if (this.activeTab === 'equip') {
            const wEnhReq = getWeaponEnhanceRequirement(d.weaponEnhance || 0);
            const aEnhReq = getArmorEnhanceRequirement(d.armorEnhance || 0);
            const wEnchObj = ENCHANT_POOL.find(x => x.id === d.weaponEnchant);
            const aEnchObj = ENCHANT_POOL.find(x => x.id === d.armorEnchant);

            const jobRestrictNotice = evo.isMageJob
                ? '🪄 現在の役職は【魔道士系】のため、杖のみ装備できます（通常攻撃＝遠距離魔法判定）'
                : (evo.id === 'novice' || evo.id === 'myth_god'
                    ? '✨ 現在の役職は【剣・杖どちらも装備可能】です'
                    : '⚔️ 現在の役職は【物理・騎士系】のため、剣のみ装備できます');

            body.innerHTML = `
                <div class="card-box" style="margin-bottom:10px; border-color:#38bdf8;">
                    <div style="font-size:12px; font-weight:900; color:#7dd3fc;">${jobRestrictNotice}</div>
                    <div style="font-size:11px; color:#fde047; margin-top:4px;">所持金: ${formatBigNum(d.gold)}G</div>
                </div>

                <div class="card-box" style="margin-bottom:10px;">
                    <div style="font-weight:900; color:#fde047; margin-bottom:6px;">🔨 装備精錬＆エンチャント付与</div>
                    <div style="display:grid; gap:8px;">
                        <div style="background:#0f172a; padding:8px; border-radius:8px;">
                            <div style="font-size:12px; font-weight:900;">武器精錬: +${d.weaponEnhance || 0} ｜ 付与: <span style="color:#f472b6;">${wEnchObj ? wEnchObj.label : 'なし'}</span></div>
                            <div style="font-size:10px; color:#94a3b8; margin:3px 0;">必要: ${formatBigNum(wEnhReq.gold)}G / ${this.formatMatCost(wEnhReq.mats)}</div>
                            <div style="display:flex; gap:6px; margin-top:4px;">
                                <button type="button" class="btn-ui btn-amber" id="btn-enh-wpn" ${(d.gold < wEnhReq.gold || !this.hasEnoughMats(wEnhReq.mats)) ? 'disabled' : ''}>武器精錬 +1</button>
                                <button type="button" class="btn-ui btn-purple" id="btn-ench-wpn" ${d.gold < 800 ? 'disabled' : ''}>武器エンチャ抽選 (800G)</button>
                            </div>
                        </div>
                        <div style="background:#0f172a; padding:8px; border-radius:8px;">
                            <div style="font-size:12px; font-weight:900;">防具精錬: +${d.armorEnhance || 0} ｜ 付与: <span style="color:#f472b6;">${aEnchObj ? aEnchObj.label : 'なし'}</span></div>
                            <div style="font-size:10px; color:#94a3b8; margin:3px 0;">必要: ${formatBigNum(aEnhReq.gold)}G / ${this.formatMatCost(aEnhReq.mats)}</div>
                            <div style="display:flex; gap:6px; margin-top:4px;">
                                <button type="button" class="btn-ui btn-amber" id="btn-enh-arm" ${(d.gold < aEnhReq.gold || !this.hasEnoughMats(aEnhReq.mats)) ? 'disabled' : ''}>防具精錬 +1</button>
                                <button type="button" class="btn-ui btn-purple" id="btn-ench-arm" ${d.gold < 800 ? 'disabled' : ''}>防具エンチャ抽選 (800G)</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div style="font-weight:900; color:#38bdf8; margin:8px 0 4px;">⚔️ 剣シリーズ（物理職・見習い・創世神用）</div>
                <div style="display:grid; gap:6px; margin-bottom:10px;">
                    ${Object.values(WEAPONS).filter(w => w.category === 'sword').map(w => this.renderWeaponCard(w, evo)).join('')}
                </div>

                <div style="font-weight:900; color:#c084fc; margin:8px 0 4px;">🪄 魔導杖シリーズ（魔道士系専用・通常攻撃が遠距離魔法判定）</div>
                <div style="display:grid; gap:6px; margin-bottom:10px;">
                    ${Object.values(WEAPONS).filter(w => w.category === 'staff').map(w => this.renderWeaponCard(w, evo)).join('')}
                </div>

                <div style="font-weight:900; color:#6ee7b7; margin:8px 0 4px;">🛡️ 防具・装飾品</div>
                <div style="display:grid; gap:6px; margin-bottom:10px;">
                    ${Object.values(ARMORS).map(a => {
                        const owned = (d.ownedArmors || []).includes(a.id);
                        const equipped = d.armorId === a.id;
                        const canBuy = d.gold >= a.costGold && this.hasEnoughMats(a.costMat);
                        return `
                            <div class="card-box" style="display:flex; justify-content:space-between; align-items:center;">
                                <div>
                                    <div style="font-weight:900; color:#fff;">${a.icon} ${a.name}</div>
                                    <div style="font-size:11px; color:#cbd5e1;">HP+${a.hp} / MP+${a.mp} / 軽減+${Math.round(a.def * 100)}%</div>
                                    ${!owned ? `<div style="font-size:10px; color:#fde047;">作成: ${formatBigNum(a.costGold)}G / ${this.formatMatCost(a.costMat)}</div>` : ''}
                                </div>
                                ${equipped
                                    ? `<span style="color:#fde047; font-weight:900; font-size:11px;">装備中</span>`
                                    : owned
                                        ? `<button type="button" class="btn-ui btn-sky" data-eq-arm="${a.id}">装備</button>`
                                        : `<button type="button" class="btn-ui btn-emerald" data-buy-arm="${a.id}" ${!canBuy ? 'disabled' : ''}>作成</button>`
                                }
                            </div>
                        `;
                    }).join('')}
                </div>

                <div style="display:grid; gap:6px; margin-bottom:10px;">
                    ${Object.values(ACCESSORIES).filter(x => x.id !== 'acc_none').map(ac => {
                        const owned = (d.ownedAccessories || []).includes(ac.id);
                        const equipped = d.accessoryId === ac.id;
                        const canBuy = d.gold >= ac.costGold && this.hasEnoughMats(ac.costMat);
                        return `
                            <div class="card-box" style="display:flex; justify-content:space-between; align-items:center;">
                                <div>
                                    <div style="font-weight:900; color:#f472b6;">${ac.icon} ${ac.name}</div>
                                    <div style="font-size:11px; color:#cbd5e1;">${ac.desc}</div>
                                    ${!owned ? `<div style="font-size:10px; color:#fde047;">作成: ${formatBigNum(ac.costGold)}G / ${this.formatMatCost(ac.costMat)}</div>` : ''}
                                </div>
                                ${equipped
                                    ? `<span style="color:#fde047; font-weight:900; font-size:11px;">装備中</span>`
                                    : owned
                                        ? `<button type="button" class="btn-ui btn-sky" data-eq-acc="${ac.id}">装備</button>`
                                        : `<button type="button" class="btn-ui btn-emerald" data-buy-acc="${ac.id}" ${!canBuy ? 'disabled' : ''}>作成</button>`
                                }
                            </div>
                        `;
                    }).join('')}
                </div>

                <div class="card-box">
                    <div style="font-weight:900; color:#fde047; margin-bottom:6px;">⚗️ 素材一覧＆上位錬金</div>
                    <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:8px; font-size:11px;">
                        ${Object.values(MATERIALS).map(m => `
                            <span style="background:#0f172a; padding:3px 7px; border-radius:6px;">${m.icon}${m.name}: <b>${(d.materials && d.materials[m.id]) || 0}</b></span>
                        `).join('')}
                    </div>
                    <div style="display:grid; gap:5px;">
                        ${MATERIAL_ALCHEMY.map((rec, idx) => {
                            const fMat = MATERIALS[rec.from];
                            const tMat = MATERIALS[rec.to];
                            const have = (d.materials && d.materials[rec.from]) || 0;
                            const ok = have >= rec.count && d.gold >= rec.gold;
                            return `
                                <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; background:#0f172a; padding:5px 8px; border-radius:6px;">
                                    <span>${fMat.icon}${fMat.name}×${rec.count} + ${rec.gold}G ➔ ${tMat.icon}${tMat.name}×1</span>
                                    <button type="button" class="btn-ui btn-amber" style="padding:3px 8px; font-size:10px;" data-alchemy="${idx}" ${!ok ? 'disabled' : ''}>錬金</button>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;

            this.bindEquipTabEvents(body, wEnhReq, aEnhReq);

        } else if (this.activeTab === 'evo') {
            body.innerHTML = `
                <div class="card-box" style="margin-bottom:10px; border-color:#fde047;">
                    <div style="font-weight:900; color:#fde047;">👑 転職・上位クラスチェンジ（所持金: ${formatBigNum(d.gold)}G）</div>
                    <div style="font-size:11px; color:#cbd5e1; margin-top:3px;">
                        必要Lv・ゴールド・素材を満たすと好きな役職へ転職できます。<br>
                        ※ <b>魔道士系</b>に転職すると装備制限により自動的に<b>杖</b>へ持ち替えます。
                    </div>
                </div>
                <div style="display:grid; gap:8px;">
                    ${Object.values(EVOLUTIONS).map(ev => {
                        const isCur = d.evolutionId === ev.id;
                        const costG = ev.costGold || 0;
                        const lvOk = d.lv >= ev.reqLv;
                        const goldOk = d.gold >= costG;
                        const matOk = this.hasEnoughMats(ev.reqMat);
                        const canChange = !isCur && lvOk && goldOk && matOk;

                        return `
                            <div class="card-box" style="${isCur ? 'border-color:#fde047; background:rgba(250,204,21,0.08);' : ''}">
                                <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
                                    <div>
                                        <div style="font-weight:900; font-size:13px; color:${ev.color};">
                                            <span class="font-kaomoji">${ev.kaomoji}</span> ${ev.name}
                                            ${ev.isMageJob ? '<span style="background:#581c87; color:#f3e8ff; font-size:9px; padding:1px 5px; border-radius:4px; margin-left:4px;">🪄杖専用</span>' : ''}
                                        </div>
                                        <div style="font-size:11px; color:#e2e8f0; margin-top:2px;">${ev.bonusText}</div>
                                        <div style="font-size:10px; color:#94a3b8; margin-top:2px;">
                                            条件: <span style="color:${lvOk ? '#6ee7b7' : '#fca5a5'};">Lv.${ev.reqLv}以上</span> ｜
                                            転職費用: <span style="color:${goldOk ? '#fde047' : '#fca5a5'};">${formatBigNum(costG)}G</span> ｜
                                            ${this.formatMatCost(ev.reqMat)}
                                        </div>
                                    </div>
                                    <div>
                                        ${isCur
                                            ? `<span style="color:#fde047; font-weight:900; font-size:12px;">現在の役職</span>`
                                            : `<button type="button" class="btn-ui btn-amber" data-change-job="${ev.id}" ${!canChange ? 'disabled' : ''}>転職する</button>`
                                        }
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;

            body.querySelectorAll('[data-change-job]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const jid = btn.getAttribute('data-change-job');
                    const targetEv = EVOLUTIONS[jid];
                    if (!targetEv || d.evolutionId === jid) return;
                    const costG = targetEv.costGold || 0;
                    if (d.lv < targetEv.reqLv || d.gold < costG || !this.hasEnoughMats(targetEv.reqMat)) return;

                    d.gold -= costG;
                    this.consumeMats(targetEv.reqMat);
                    d.evolutionId = jid;

                    // 魔道士系なら杖へ自動変更
                    const swapped = this.enforceJobWeaponRule();
                    this.buildPlayerEntity();
                    const newSt = this.calcDerivedStats();
                    if (this.player) {
                        this.player.hp = newSt.maxHp;
                        this.player.mp = newSt.maxMp;
                    }
                    sfx.playLevelUp();
                    this.saveGame(false);
                    this.renderGrowthTabContent();
                    this.refreshAllHUD();
                    this.showAlertBanner(
                        swapped
                            ? `👑 【${targetEv.name}】に転職し、自動で杖を装備しました！`
                            : `👑 【${targetEv.name}】に転職しました！`,
                        2400
                    );
                });
            });

        } else if (this.activeTab === 'look') {
            body.innerHTML = `
                <div class="card-box" style="margin-bottom:10px;">
                    <div style="font-weight:900; color:#38bdf8; margin-bottom:6px;">顔文字・体色・体型カスタマイズ</div>
                    <div style="display:flex; gap:6px; margin-bottom:6px;">
                        <input type="text" id="inp-custom-kaomoji" value="${d.customKaomoji || ''}" placeholder="好きな顔文字を入力 (空欄で職業顔文字)" style="flex:1; background:#0f172a; color:#fff; border:1px solid #334155; border-radius:6px; padding:6px;">
                        <button type="button" class="btn-ui btn-sky" id="btn-apply-kaomoji">反映</button>
                    </div>
                    <div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom:8px;">
                        ${KAOMOJI_PRESETS.map(k => `<button type="button" class="btn-ui btn-slate font-kaomoji" style="padding:3px 6px; font-size:11px;" data-preset-k="${k}">${k}</button>`).join('')}
                    </div>
                    <div style="font-size:11px; color:#cbd5e1; margin-bottom:4px;">体カラー:</div>
                    <div style="display:flex; flex-wrap:wrap; gap:5px; margin-bottom:8px;">
                        ${BODY_COLOR_PRESETS.map(c => `
                            <button type="button" class="btn-ui btn-slate" style="padding:4px 8px; font-size:10px; border-color:${d.bodyColor === c.hex ? '#fde047' : '#334155'};" data-body-col="${c.hex}">
                                ${c.hex ? `<span style="display:inline-block; width:9px; height:9px; border-radius:50%; background:${c.hex}; margin-right:3px;"></span>` : ''}${c.name}
                            </button>
                        `).join('')}
                    </div>
                    <div style="font-size:11px; color:#cbd5e1; margin-bottom:4px;">顔モニター背景色:</div>
                    <div style="display:flex; flex-wrap:wrap; gap:5px; margin-bottom:8px;">
                        ${FACE_BG_PRESETS.map(c => `
                            <button type="button" class="btn-ui btn-slate" style="padding:4px 8px; font-size:10px; border-color:${d.faceBgColor === c.hex ? '#fde047' : '#334155'};" data-face-bg="${c.hex}">
                                <span style="display:inline-block; width:9px; height:9px; border-radius:50%; background:${c.hex}; margin-right:3px;"></span>${c.name}
                            </button>
                        `).join('')}
                    </div>
                    <div style="font-size:11px; color:#cbd5e1; margin-bottom:4px;">体型サイズ:</div>
                    <div style="display:flex; gap:6px;">
                        ${BODY_SCALE_PRESETS.map(sc => `
                            <button type="button" class="btn-ui ${Number(d.bodyScale || 1) === sc.scale ? 'btn-amber' : 'btn-slate'}" data-body-scale="${sc.scale}">${sc.name}</button>
                        `).join('')}
                    </div>
                </div>

                <div style="font-weight:900; color:#fde047; margin-bottom:4px;">🎩 頭パーツ（所持金: ${formatBigNum(d.gold)}G）</div>
                <div style="display:grid; gap:6px; margin-bottom:10px;">
                    ${Object.values(COSMETICS).map(cos => {
                        const owned = (d.ownedCosmetics || []).includes(cos.id);
                        const eq = (d.cosmeticId || 'none') === cos.id;
                        const canBuy = d.gold >= cos.costGold && this.hasEnoughMats(cos.costMat);
                        return `
                            <div class="card-box" style="display:flex; justify-content:space-between; align-items:center;">
                                <div>
                                    <div style="font-weight:900;">${cos.icon} ${cos.name}</div>
                                    <div style="font-size:10px; color:#94a3b8;">${cos.desc} ${!owned ? `｜ ${cos.costGold}G / ${this.formatMatCost(cos.costMat)}` : ''}</div>
                                </div>
                                ${eq ? `<span style="color:#fde047; font-size:11px; font-weight:900;">装着中</span>`
                                    : owned ? `<button type="button" class="btn-ui btn-sky" data-eq-cos="${cos.id}">装着</button>`
                                    : `<button type="button" class="btn-ui btn-emerald" data-buy-cos="${cos.id}" ${!canBuy ? 'disabled' : ''}>解放</button>`}
                            </div>
                        `;
                    }).join('')}
                </div>

                <div style="font-weight:900; color:#f472b6; margin-bottom:4px;">🕊️ 背中パーツ（頭パーツと同時装着OK）</div>
                <div style="display:grid; gap:6px;">
                    ${Object.values(BACK_COSMETICS).map(bc => {
                        const owned = (d.ownedBackCosmetics || []).includes(bc.id);
                        const eq = (d.backCosmeticId || 'back_none') === bc.id;
                        const canBuy = d.gold >= bc.costGold && this.hasEnoughMats(bc.costMat);
                        return `
                            <div class="card-box" style="display:flex; justify-content:space-between; align-items:center;">
                                <div>
                                    <div style="font-weight:900;">${bc.icon} ${bc.name}</div>
                                    <div style="font-size:10px; color:#94a3b8;">${bc.desc} ${!owned ? `｜ ${bc.costGold}G / ${this.formatMatCost(bc.costMat)}` : ''}</div>
                                </div>
                                ${eq ? `<span style="color:#fde047; font-size:11px; font-weight:900;">装着中</span>`
                                    : owned ? `<button type="button" class="btn-ui btn-sky" data-eq-back="${bc.id}">装着</button>`
                                    : `<button type="button" class="btn-ui btn-emerald" data-buy-back="${bc.id}" ${!canBuy ? 'disabled' : ''}>解放</button>`}
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
            this.bindLookTabEvents(body);

        } else if (this.activeTab === 'pets') {
            body.innerHTML = `
                <div class="card-box" style="margin-bottom:10px;">
                    <div style="font-weight:900; color:#fde047;">🐾 相棒ペット育成（Lv.${d.petLevel || 1} / 所持金: ${formatBigNum(d.gold)}G）</div>
                    ${d.petId ? `
                        <div style="margin-top:6px;">
                            <button type="button" class="btn-ui btn-amber" id="btn-lvup-pet" ${d.gold < (d.petLevel || 1) * 350 ? 'disabled' : ''}>
                                相棒レベルアップ (${formatBigNum((d.petLevel || 1) * 350)}G)
                            </button>
                        </div>
                    ` : ''}
                </div>
                <div style="display:grid; gap:8px;">
                    ${Object.values(PETS).map(pt => {
                        const owned = (d.ownedPets || []).includes(pt.id);
                        const eq = d.petId === pt.id;
                        const canBuy = d.gold >= pt.costGold && this.hasEnoughMats(pt.costMat);
                        return `
                            <div class="card-box" style="display:flex; justify-content:space-between; align-items:center;">
                                <div>
                                    <div style="font-weight:900; color:#fff;"><span class="font-kaomoji">${pt.kaomoji}</span> ${pt.name}</div>
                                    <div style="font-size:11px; color:#cbd5e1;">${pt.desc}</div>
                                    ${!owned ? `<div style="font-size:10px; color:#fde047;">召喚: ${formatBigNum(pt.costGold)}G / ${this.formatMatCost(pt.costMat)}</div>` : ''}
                                </div>
                                ${eq ? `<span style="color:#fde047; font-weight:900; font-size:11px;">同行中</span>`
                                    : owned ? `<button type="button" class="btn-ui btn-sky" data-eq-pet="${pt.id}">同行する</button>`
                                    : `<button type="button" class="btn-ui btn-emerald" data-buy-pet="${pt.id}" ${!canBuy ? 'disabled' : ''}>仲間にする</button>`}
                            </div>
                        `;
                    }).join('')}
                </div>
            `;

            body.querySelector('#btn-lvup-pet')?.addEventListener('click', () => {
                const cost = (d.petLevel || 1) * 350;
                if (d.gold < cost) return;
                d.gold -= cost;
                d.petLevel = (d.petLevel || 1) + 1;
                sfx.playLevelUp();
                this.saveGame(false);
                this.renderGrowthTabContent();
            });
            body.querySelectorAll('[data-buy-pet]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const pid = btn.getAttribute('data-buy-pet');
                    const pt = PETS[pid];
                    if (!pt || d.gold < pt.costGold || !this.hasEnoughMats(pt.costMat)) return;
                    d.gold -= pt.costGold;
                    this.consumeMats(pt.costMat);
                    d.ownedPets = d.ownedPets || [];
                    if (!d.ownedPets.includes(pid)) d.ownedPets.push(pid);
                    d.petId = pid;
                    this.buildPetEntity();
                    sfx.playLevelUp();
                    this.saveGame(false);
                    this.renderGrowthTabContent();
                });
            });
            body.querySelectorAll('[data-eq-pet]').forEach(btn => {
                btn.addEventListener('click', () => {
                    d.petId = btn.getAttribute('data-eq-pet');
                    this.buildPetEntity();
                    sfx.playHeal();
                    this.saveGame(false);
                    this.renderGrowthTabContent();
                });
            });

        } else if (this.activeTab === 'titles') {
            const trk = d.statsTrack || {};
            body.innerHTML = `
                <div class="card-box" style="margin-bottom:10px;">
                    <div style="font-weight:900; color:#fde047; margin-bottom:6px;">🎖️ 装備称号（パッシブボーナス）</div>
                    <div style="display:grid; gap:6px;">
                        ${Object.values(TITLES).map(tt => {
                            const unlocked = (d.unlockedTitles || ['title_none']).includes(tt.id);
                            const eq = (d.equippedTitleId || 'title_none') === tt.id;
                            return `
                                <div style="display:flex; justify-content:space-between; align-items:center; background:#0f172a; padding:6px 8px; border-radius:6px;">
                                    <div>
                                        <div style="font-weight:900; font-size:12px;">${tt.name}</div>
                                        <div style="font-size:10px; color:#6ee7b7;">${tt.bonusText}</div>
                                    </div>
                                    ${eq ? `<span style="color:#fde047; font-size:11px; font-weight:900;">装備中</span>`
                                        : unlocked ? `<button type="button" class="btn-ui btn-sky" style="padding:3px 8px; font-size:10px;" data-eq-title="${tt.id}">装備</button>`
                                        : `<span style="color:#64748b; font-size:10px;">未解放</span>`}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                <div style="font-weight:900; color:#38bdf8; margin-bottom:6px;">🏆 実績ミッション</div>
                <div style="display:grid; gap:6px;">
                    ${ACHIEVEMENTS.map(ach => {
                        const claimed = (d.claimedAchievements || []).includes(ach.id);
                        const curVal = ach.key === 'lv' ? d.lv : (trk[ach.key] || 0);
                        const done = curVal >= ach.req;
                        return `
                            <div class="card-box" style="display:flex; justify-content:space-between; align-items:center;">
                                <div>
                                    <div style="font-weight:900;">${ach.name} (${Math.min(curVal, ach.req)}/${ach.req})</div>
                                    <div style="font-size:11px; color:#cbd5e1;">${ach.desc} ｜ 報酬: AP+${ach.rewardAp} / SP+${ach.rewardSp}</div>
                                </div>
                                ${claimed ? `<span style="color:#6ee7b7; font-size:11px; font-weight:900;">受取済</span>`
                                    : `<button type="button" class="btn-ui btn-amber" data-claim-ach="${ach.id}" ${!done ? 'disabled' : ''}>受取</button>`}
                            </div>
                        `;
                    }).join('')}
                </div>
            `;

            body.querySelectorAll('[data-eq-title]').forEach(btn => {
                btn.addEventListener('click', () => {
                    d.equippedTitleId = btn.getAttribute('data-eq-title');
                    sfx.playTone(660, 'sine', 0.08, 0.05);
                    this.saveGame(false);
                    this.renderGrowthTabContent();
                    this.refreshAllHUD();
                });
            });
            body.querySelectorAll('[data-claim-ach]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const aid = btn.getAttribute('data-claim-ach');
                    const ach = ACHIEVEMENTS.find(x => x.id === aid);
                    if (!ach) return;
                    d.claimedAchievements = d.claimedAchievements || [];
                    if (d.claimedAchievements.includes(aid)) return;
                    d.claimedAchievements.push(aid);
                    d.ap = (d.ap || 0) + ach.rewardAp;
                    d.sp = (d.sp || 0) + ach.rewardSp;
                    if (ach.titleId) {
                        d.unlockedTitles = d.unlockedTitles || ['title_none'];
                        if (!d.unlockedTitles.includes(ach.titleId)) d.unlockedTitles.push(ach.titleId);
                    }
                    sfx.playLevelUp();
                    this.saveGame(false);
                    this.renderGrowthTabContent();
                });
            });

        } else if (this.activeTab === 'zones') {
            body.innerHTML = `
                <div class="card-box" style="margin-bottom:10px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <div style="font-weight:900; color:#f43f5e;">🔥 危険度ランク: +${d.threatRank || 0} / ${MAX_THREAT_RANK}</div>
                            <div style="font-size:10px; color:#cbd5e1;">ランクを上げると敵が強くなり、経験値・ゴールド報酬も増加！</div>
                        </div>
                        <div style="display:flex; gap:5px;">
                            <button type="button" class="btn-ui btn-slate" id="btn-threat-down" ${(d.threatRank || 0) <= 0 ? 'disabled' : ''}>-1</button>
                            <button type="button" class="btn-ui btn-rose" id="btn-threat-up" ${(d.threatRank || 0) >= MAX_THREAT_RANK ? 'disabled' : ''}>+1</button>
                        </div>
                    </div>
                </div>

                <div class="card-box" style="margin-bottom:10px; border-color:#a855f7;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <div style="font-weight:900; color:#e879f9;">🗼 無限の試練の塔（最高到達: ${(d.statsTrack && d.statsTrack.bestTowerFloor) || 0}F）</div>
                            <div style="font-size:11px; color:#cbd5e1;">全滅させるごとに階層が上がるエンドレス挑戦モード</div>
                        </div>
                        <button type="button" class="btn-ui btn-purple" id="btn-enter-tower">挑戦する</button>
                    </div>
                </div>

                <div style="display:grid; gap:8px;">
                    ${Object.values(ZONES).map(z => `
                        <div class="card-box" style="display:flex; justify-content:space-between; align-items:center;">
                            <div>
                                <div style="font-weight:900; color:#fff;">${z.safe ? '🏰' : `⚔️ Stage ${z.stageNum}:`} ${z.name} <span style="color:#fde047; font-size:11px;">(推奨Lv.${z.recLv})</span></div>
                                <div style="font-size:11px; color:#cbd5e1;">${z.desc}</div>
                            </div>
                            <button type="button" class="btn-ui ${this.currentZoneId === z.id && !this.towerState.active ? 'btn-amber' : 'btn-sky'}" data-warp-zone="${z.id}">
                                ${this.currentZoneId === z.id && !this.towerState.active ? '現在地' : '転移'}
                            </button>
                        </div>
                    `).join('')}
                </div>
            `;

            body.querySelector('#btn-threat-down')?.addEventListener('click', () => {
                d.threatRank = Math.max(0, (d.threatRank || 0) - 1);
                this.saveGame(false);
                this.renderGrowthTabContent();
            });
            body.querySelector('#btn-threat-up')?.addEventListener('click', () => {
                d.threatRank = Math.min(MAX_THREAT_RANK, (d.threatRank || 0) + 1);
                this.saveGame(false);
                this.renderGrowthTabContent();
            });
            body.querySelector('#btn-enter-tower')?.addEventListener('click', () => {
                this.closeGrowthModal();
                this.startTowerMode(1);
            });
            body.querySelectorAll('[data-warp-zone]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const zid = btn.getAttribute('data-warp-zone');
                    this.closeGrowthModal();
                    this.loadZone(zid);
                });
            });

        } else if (this.activeTab === 'online') {
            body.innerHTML = `
                <div class="card-box" style="margin-bottom:10px;">
                    <div style="font-weight:900; color:#38bdf8; margin-bottom:6px;">🌐 Firebase リアルタイムマルチ＆全体チャット接続</div>
                    <div style="font-size:11px; color:#cbd5e1; margin-bottom:6px;">
                        状態: <b style="color:${this.fbConnected ? '#6ee7b7' : '#fca5a5'};">${this.fbConnected ? '接続中' : '未接続（オフライン）'}</b>
                    </div>
                    <input type="text" id="inp-fb-url" value="${d.firebaseUrl || ''}" placeholder="https://your-project-default-rtdb.firebaseio.com" style="width:100%; background:#0f172a; color:#fff; border:1px solid #334155; border-radius:6px; padding:6px; margin-bottom:6px;">
                    <div style="display:flex; gap:6px;">
                        <button type="button" class="btn-ui btn-emerald" id="btn-fb-connect">接続する</button>
                        <button type="button" class="btn-ui btn-slate" id="btn-fb-disconnect">切断</button>
                    </div>
                </div>
                <div class="card-box">
                    <div style="font-weight:900; color:#f43f5e; margin-bottom:6px;">⚙️ セーブ管理</div>
                    <div style="display:flex; gap:8px;">
                        <button type="button" class="btn-ui btn-sky" id="btn-modal-save">💾 手動セーブ</button>
                        <button type="button" class="btn-ui btn-rose" id="btn-modal-reset">💥 データ完全初期化</button>
                    </div>
                </div>
            `;

            body.querySelector('#btn-fb-connect')?.addEventListener('click', () => {
                const url = body.querySelector('#inp-fb-url')?.value.trim();
                if (!url) return;
                d.firebaseUrl = url;
                d.onlineEnabled = true;
                this.saveGame(false);
                this.connectFirebase(url, false);
                this.renderGrowthTabContent();
            });
            body.querySelector('#btn-fb-disconnect')?.addEventListener('click', () => {
                d.onlineEnabled = false;
                this.saveGame(false);
                this.disconnectFirebase();
                this.renderGrowthTabContent();
            });
            body.querySelector('#btn-modal-save')?.addEventListener('click', () => this.saveGame(true));
            body.querySelector('#btn-modal-reset')?.addEventListener('click', () => {
                if (confirm('本当にすべてのセーブデータを初期化しますか？')) {
                    this.hardResetGame();
                }
            });
        }
    },

    renderWeaponCard(w, evo) {
        const d = this.saveData;
        const owned = (d.ownedWeapons || []).includes(w.id);
        const equipped = d.weaponId === w.id;
        const allowed = canEquipWeaponForJob(w, evo);
        const canBuy = d.gold >= w.costGold && this.hasEnoughMats(w.costMat);

        return `
            <div class="card-box" style="display:flex; justify-content:space-between; align-items:center; opacity:${allowed ? '1' : '0.58'};">
                <div>
                    <div style="font-weight:900; color:#fff;">${w.icon} ${w.name}</div>
                    <div style="font-size:11px; color:#cbd5e1;">攻撃+${w.atk} / 魔力倍率x${w.mag}</div>
                    ${!owned ? `<div style="font-size:10px; color:#fde047;">作成: ${formatBigNum(w.costGold)}G / ${this.formatMatCost(w.costMat)}</div>` : ''}
                    ${!allowed ? `<div style="font-size:10px; color:#fca5a5;">※ 現在の役職では装備不可</div>` : ''}
                </div>
                ${equipped
                    ? `<span style="color:#fde047; font-weight:900; font-size:11px;">装備中</span>`
                    : !allowed
                        ? `<span style="color:#94a3b8; font-size:10px;">装備不可</span>`
                        : owned
                            ? `<button type="button" class="btn-ui btn-sky" data-eq-wpn="${w.id}">装備</button>`
                            : `<button type="button" class="btn-ui btn-emerald" data-buy-wpn="${w.id}" ${!canBuy ? 'disabled' : ''}>作成</button>`
                }
            </div>
        `;
    },

    bindEquipTabEvents(body, wEnhReq, aEnhReq) {
        const d = this.saveData;

        body.querySelector('#btn-enh-wpn')?.addEventListener('click', () => {
            if (d.gold < wEnhReq.gold || !this.hasEnoughMats(wEnhReq.mats)) return;
            d.gold -= wEnhReq.gold;
            this.consumeMats(wEnhReq.mats);
            d.weaponEnhance = (d.weaponEnhance || 0) + 1;
            this.buildPlayerEntity();
            sfx.playLevelUp();
            this.saveGame(false);
            this.renderGrowthTabContent();
        });

        body.querySelector('#btn-enh-arm')?.addEventListener('click', () => {
            if (d.gold < aEnhReq.gold || !this.hasEnoughMats(aEnhReq.mats)) return;
            d.gold -= aEnhReq.gold;
            this.consumeMats(aEnhReq.mats);
            d.armorEnhance = (d.armorEnhance || 0) + 1;
            this.buildPlayerEntity();
            sfx.playLevelUp();
            this.saveGame(false);
            this.renderGrowthTabContent();
        });

        body.querySelector('#btn-ench-wpn')?.addEventListener('click', () => {
            if (d.gold < 800) return;
            d.gold -= 800;
            const pick = ENCHANT_POOL[Math.floor(Math.random() * ENCHANT_POOL.length)];
            d.weaponEnchant = pick.id;
            sfx.playSkill();
            this.saveGame(false);
            this.renderGrowthTabContent();
            this.showAlertBanner(`✨ 武器に【${pick.label}】が付与された！`, 1600);
        });

        body.querySelector('#btn-ench-arm')?.addEventListener('click', () => {
            if (d.gold < 800) return;
            d.gold -= 800;
            const pick = ENCHANT_POOL[Math.floor(Math.random() * ENCHANT_POOL.length)];
            d.armorEnchant = pick.id;
            sfx.playSkill();
            this.saveGame(false);
            this.renderGrowthTabContent();
            this.showAlertBanner(`✨ 防具に【${pick.label}】が付与された！`, 1600);
        });

        body.querySelectorAll('[data-buy-wpn]').forEach(btn => {
            btn.addEventListener('click', () => {
                const wid = btn.getAttribute('data-buy-wpn');
                const w = WEAPONS[wid];
                const evo = EVOLUTIONS[d.evolutionId] || EVOLUTIONS.novice;
                if (!w || !canEquipWeaponForJob(w, evo) || d.gold < w.costGold || !this.hasEnoughMats(w.costMat)) return;
                d.gold -= w.costGold;
                this.consumeMats(w.costMat);
                d.ownedWeapons = d.ownedWeapons || [];
                if (!d.ownedWeapons.includes(wid)) d.ownedWeapons.push(wid);
                d.weaponId = wid;
                this.buildPlayerEntity();
                sfx.playLevelUp();
                this.saveGame(false);
                this.renderGrowthTabContent();
                this.refreshAllHUD();
            });
        });

        body.querySelectorAll('[data-eq-wpn]').forEach(btn => {
            btn.addEventListener('click', () => {
                const wid = btn.getAttribute('data-eq-wpn');
                const w = WEAPONS[wid];
                const evo = EVOLUTIONS[d.evolutionId] || EVOLUTIONS.novice;
                if (!w || !canEquipWeaponForJob(w, evo)) return;
                d.weaponId = wid;
                this.buildPlayerEntity();
                sfx.playTone(620, 'sine', 0.08, 0.05);
                this.saveGame(false);
                this.renderGrowthTabContent();
                this.refreshAllHUD();
            });
        });

        body.querySelectorAll('[data-buy-arm]').forEach(btn => {
            btn.addEventListener('click', () => {
                const aid = btn.getAttribute('data-buy-arm');
                const a = ARMORS[aid];
                if (!a || d.gold < a.costGold || !this.hasEnoughMats(a.costMat)) return;
                d.gold -= a.costGold;
                this.consumeMats(a.costMat);
                d.ownedArmors = d.ownedArmors || [];
                if (!d.ownedArmors.includes(aid)) d.ownedArmors.push(aid);
                d.armorId = aid;
                this.buildPlayerEntity();
                sfx.playLevelUp();
                this.saveGame(false);
                this.renderGrowthTabContent();
            });
        });

        body.querySelectorAll('[data-eq-arm]').forEach(btn => {
            btn.addEventListener('click', () => {
                d.armorId = btn.getAttribute('data-eq-arm');
                this.buildPlayerEntity();
                sfx.playTone(620, 'sine', 0.08, 0.05);
                this.saveGame(false);
                this.renderGrowthTabContent();
            });
        });

        body.querySelectorAll('[data-buy-acc]').forEach(btn => {
            btn.addEventListener('click', () => {
                const acid = btn.getAttribute('data-buy-acc');
                const ac = ACCESSORIES[acid];
                if (!ac || d.gold < ac.costGold || !this.hasEnoughMats(ac.costMat)) return;
                d.gold -= ac.costGold;
                this.consumeMats(ac.costMat);
                d.ownedAccessories = d.ownedAccessories || [];
                if (!d.ownedAccessories.includes(acid)) d.ownedAccessories.push(acid);
                d.accessoryId = acid;
                sfx.playLevelUp();
                this.saveGame(false);
                this.renderGrowthTabContent();
            });
        });

        body.querySelectorAll('[data-eq-acc]').forEach(btn => {
            btn.addEventListener('click', () => {
                d.accessoryId = btn.getAttribute('data-eq-acc');
                sfx.playTone(620, 'sine', 0.08, 0.05);
                this.saveGame(false);
                this.renderGrowthTabContent();
            });
        });

        body.querySelectorAll('[data-alchemy]').forEach(btn => {
            btn.addEventListener('click', () => {
                const rec = MATERIAL_ALCHEMY[Number(btn.getAttribute('data-alchemy'))];
                if (!rec) return;
                const have = (d.materials && d.materials[rec.from]) || 0;
                if (have < rec.count || d.gold < rec.gold) return;
                d.gold -= rec.gold;
                d.materials[rec.from] -= rec.count;
                d.materials[rec.to] = (d.materials[rec.to] || 0) + 1;
                sfx.playHeal();
                this.saveGame(false);
                this.renderGrowthTabContent();
            });
        });
    },

    bindLookTabEvents(body) {
        const d = this.saveData;

        body.querySelector('#btn-apply-kaomoji')?.addEventListener('click', () => {
            const val = body.querySelector('#inp-custom-kaomoji')?.value || '';
            d.customKaomoji = val.trim().slice(0, 18);
            this.buildPlayerEntity();
            sfx.playHeal();
            this.saveGame(false);
            this.refreshAllHUD();
        });

        body.querySelectorAll('[data-preset-k]').forEach(btn => {
            btn.addEventListener('click', () => {
                d.customKaomoji = btn.getAttribute('data-preset-k');
                this.buildPlayerEntity();
                sfx.playTone(680, 'sine', 0.07, 0.05);
                this.saveGame(false);
                this.renderGrowthTabContent();
                this.refreshAllHUD();
            });
        });

        body.querySelectorAll('[data-body-col]').forEach(btn => {
            btn.addEventListener('click', () => {
                d.bodyColor = btn.getAttribute('data-body-col');
                this.buildPlayerEntity();
                this.saveGame(false);
                this.renderGrowthTabContent();
            });
        });

        body.querySelectorAll('[data-face-bg]').forEach(btn => {
            btn.addEventListener('click', () => {
                d.faceBgColor = btn.getAttribute('data-face-bg');
                this.buildPlayerEntity();
                this.saveGame(false);
                this.renderGrowthTabContent();
            });
        });

        body.querySelectorAll('[data-body-scale]').forEach(btn => {
            btn.addEventListener('click', () => {
                d.bodyScale = Number(btn.getAttribute('data-body-scale')) || 1.0;
                this.buildPlayerEntity();
                this.saveGame(false);
                this.renderGrowthTabContent();
            });
        });

        body.querySelectorAll('[data-buy-cos]').forEach(btn => {
            btn.addEventListener('click', () => {
                const cid = btn.getAttribute('data-buy-cos');
                const cos = COSMETICS[cid];
                if (!cos || d.gold < cos.costGold || !this.hasEnoughMats(cos.costMat)) return;
                d.gold -= cos.costGold;
                this.consumeMats(cos.costMat);
                d.ownedCosmetics = d.ownedCosmetics || ['none'];
                if (!d.ownedCosmetics.includes(cid)) d.ownedCosmetics.push(cid);
                d.cosmeticId = cid;
                this.buildPlayerEntity();
                sfx.playLevelUp();
                this.saveGame(false);
                this.renderGrowthTabContent();
            });
        });

        body.querySelectorAll('[data-eq-cos]').forEach(btn => {
            btn.addEventListener('click', () => {
                d.cosmeticId = btn.getAttribute('data-eq-cos');
                this.buildPlayerEntity();
                this.saveGame(false);
                this.renderGrowthTabContent();
            });
        });

        body.querySelectorAll('[data-buy-back]').forEach(btn => {
            btn.addEventListener('click', () => {
                const bid = btn.getAttribute('data-buy-back');
                const bc = BACK_COSMETICS[bid];
                if (!bc || d.gold < bc.costGold || !this.hasEnoughMats(bc.costMat)) return;
                d.gold -= bc.costGold;
                this.consumeMats(bc.costMat);
                d.ownedBackCosmetics = d.ownedBackCosmetics || ['back_none'];
                if (!d.ownedBackCosmetics.includes(bid)) d.ownedBackCosmetics.push(bid);
                d.backCosmeticId = bid;
                this.buildPlayerEntity();
                sfx.playLevelUp();
                this.saveGame(false);
                this.renderGrowthTabContent();
            });
        });

        body.querySelectorAll('[data-eq-back]').forEach(btn => {
            btn.addEventListener('click', () => {
                d.backCosmeticId = btn.getAttribute('data-eq-back');
                this.buildPlayerEntity();
                this.saveGame(false);
                this.renderGrowthTabContent();
            });
        });
    },

    // =========================================================================
    // Firebase リアルタイム通信・他プレイヤー同期
    // =========================================================================
    connectFirebase(rawUrl, silent = false) {
        const cleanUrl = String(rawUrl || '').trim().replace(/\/+$/, '');
        if (!cleanUrl || !cleanUrl.startsWith('http')) return;
        this.fbBaseUrl = cleanUrl;
        this.fbConnected = true;
        this.fbLastEventTs = Date.now();
        if (!silent) {
            this.showAlertBanner('🌐 オンラインサーバーに接続しました！', 1800);
        }
        this.syncFirebaseNow();
    },

    disconnectFirebase() {
        this.fbConnected = false;
        this.remotePlayers.forEach(rp => {
            if (rp.group && this.scene) this.scene.remove(rp.group);
            if (rp.plateEl) rp.plateEl.remove();
        });
        this.remotePlayers.clear();
    },

    broadcastFirebaseEvent(type, payload) {
        if (!this.fbConnected || !this.fbBaseUrl) return;
        const body = {
            uid: this.saveData.playerUid,
            type,
            ts: Date.now(),
            ...payload
        };
        fetch(`${this.fbBaseUrl}/events.json`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }).catch(() => {});
    },

    syncFirebaseNow() {
        if (!this.fbConnected || !this.fbBaseUrl || !this.player) return;
        const d = this.saveData;
        const state = {
            uid: d.playerUid,
            kaomoji: this.getBasePlayerKaomoji(),
            lv: d.lv,
            zoneId: this.currentZoneId,
            roomKey: this.getCurrentRoomKey(),
            x: Number(this.player.pos.x.toFixed(2)),
            z: Number(this.player.pos.z.toFixed(2)),
            rotY: Number(this.player.rotY.toFixed(2)),
            bodyColor: d.bodyColor || '',
            faceBgColor: d.faceBgColor || '#073b66',
            bodyScale: this.getPlayerBodyScale(),
            weaponId: d.weaponId,
            armorId: d.armorId,
            cosmeticId: d.cosmeticId || 'none',
            backCosmeticId: d.backCosmeticId || 'back_none',
            updatedAt: Date.now()
        };
        fetch(`${this.fbBaseUrl}/players/${d.playerUid}.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(state)
        }).catch(() => {});
    },

    updateFirebaseSync(dt) {
        this.fbSyncTimer += dt;
        this.fbPollTimer += dt;

        if (this.fbSyncTimer >= 1.2) {
            this.fbSyncTimer = 0;
            this.syncFirebaseNow();
        }
        if (this.fbPollTimer >= 1.5) {
            this.fbPollTimer = 0;
            this.pollFirebaseState();
        }

        // 他プレイヤー頭上プレート投影
        this.remotePlayers.forEach(rp => {
            if (!rp.plateEl) return;
            const scr = this.projectToScreen(rp.pos.clone().add(new THREE.Vector3(0, 2.3, 0)));
            if (!scr) {
                rp.plateEl.style.display = 'none';
            } else {
                rp.plateEl.style.display = 'block';
                rp.plateEl.style.left = `${scr.x}px`;
                rp.plateEl.style.top = `${scr.y}px`;
            }
        });
    },

    pollFirebaseState() {
        if (!this.fbConnected || !this.fbBaseUrl) return;
        const myUid = this.saveData.playerUid;
        const myRoom = this.getCurrentRoomKey();

        fetch(`${this.fbBaseUrl}/players.json`)
            .then(r => r.json())
            .then(data => {
                if (!data || typeof data !== 'object') return;
                const now = Date.now();
                const seen = new Set();

                Object.values(data).forEach(p => {
                    if (!p || !p.uid || p.uid === myUid) return;
                    if (now - (p.updatedAt || 0) > 15000) return;
                    if (p.zoneId !== this.currentZoneId || p.roomKey !== myRoom) return;

                    seen.add(p.uid);
                    let rp = this.remotePlayers.get(p.uid);
                    if (!rp) {
                        const av = this.buildAvatarGroup({
                            kaomoji: p.kaomoji || '(´・ω・`)',
                            bodyHex: p.bodyColor ? parseInt(p.bodyColor.slice(1), 16) : 0x38bdf8,
                            faceBgHex: p.faceBgColor || '#073b66',
                            bodyScale: p.bodyScale || 1.0,
                            weaponId: p.weaponId || 'wpn_wood',
                            armorId: p.armorId || 'arm_cloth',
                            cosmeticId: p.cosmeticId || 'none',
                            backCosmeticId: p.backCosmeticId || 'back_none'
                        });
                        if (this.scene) this.scene.add(av.group);
                        const plate = document.createElement('div');
                        plate.className = 'world-plate';
                        plate.innerHTML = `<div style="font-size:10px; font-weight:900; color:#6ee7b7;">Lv.${p.lv || 1} 仲間</div>`;
                        this.overlayLayer?.appendChild(plate);

                        rp = {
                            uid: p.uid,
                            pos: new THREE.Vector3(p.x || 0, 0, p.z || 0),
                            group: av.group,
                            plateEl: plate
                        };
                        this.remotePlayers.set(p.uid, rp);
                    }
                    rp.pos.set(p.x || 0, 0, p.z || 0);
                    if (rp.group) {
                        rp.group.position.copy(rp.pos);
                        rp.group.rotation.y = p.rotY || 0;
                    }
                });

                this.remotePlayers.forEach((rp, uid) => {
                    if (!seen.has(uid)) {
                        if (rp.group && this.scene) this.scene.remove(rp.group);
                        if (rp.plateEl) rp.plateEl.remove();
                        this.remotePlayers.delete(uid);
                    }
                });
            })
            .catch(() => {});

        fetch(`${this.fbBaseUrl}/events.json?orderBy="ts"&startAt=${this.fbLastEventTs + 1}&limitToLast=15`)
            .then(r => r.json())
            .then(data => {
                if (!data || typeof data !== 'object') return;
                Object.values(data).forEach(ev => {
                    if (!ev || !ev.ts || ev.ts <= this.fbLastEventTs) return;
                    this.fbLastEventTs = Math.max(this.fbLastEventTs, ev.ts);
                    if (ev.uid === myUid) return;

                    if (ev.type === 'chat_global') {
                        this.addChatMessage('global', ev.kaomoji, ev.name, ev.text, false);
                    } else if (ev.type === 'chat_room' && ev.roomKey === myRoom) {
                        this.addChatMessage('room', ev.kaomoji, ev.name, ev.text, false);
                    } else if (ev.type === 'emote' && ev.roomKey === myRoom) {
                        this.addChatMessage('room', ev.kaomoji, ev.name, ev.msg, false);
                    }
                });
            })
            .catch(() => {});
    }
});
