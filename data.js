'use strict';

const SAVE_KEY = 'kaomoji_mmorpg_save_v1';

function createHybridRegistry(list) {
    list.forEach(item => {
        if (item && item.id) list[item.id] = item;
    });
    return list;
}

const ZONES = createHybridRegistry([
    {
        id: 'meadow',
        name: 'はじまりの草原',
        reqLv: 1,
        minLv: 1,
        baseThreat: 1,
        color: 0x4ade80,
        groundColor: 0x2e7d32,
        skyColor: 0x38bdf8,
        desc: '穏やかな風吹く初心者向けの草原'
    },
    {
        id: 'forest',
        name: '精霊の深緑森',
        reqLv: 10,
        minLv: 10,
        baseThreat: 10,
        color: 0x10b981,
        groundColor: 0x1b4332,
        skyColor: 0x0f766e,
        desc: '神秘の精霊と魔獣が棲む深い森'
    },
    {
        id: 'desert',
        name: '灼熱の古代砂漠',
        reqLv: 25,
        minLv: 25,
        baseThreat: 25,
        color: 0xf59e0b,
        groundColor: 0xb45309,
        skyColor: 0xfbbf24,
        desc: '砂嵐と古代遺跡が眠る灼熱の大地'
    },
    {
        id: 'volcano',
        name: '紅蓮の業火火山',
        reqLv: 45,
        minLv: 45,
        baseThreat: 45,
        color: 0xef4444,
        groundColor: 0x7f1d1d,
        skyColor: 0x9a3412,
        desc: '溶岩が噴き上がる竜族の領域'
    },
    {
        id: 'snowfield',
        name: '絶対零度の氷原',
        reqLv: 70,
        minLv: 70,
        baseThreat: 70,
        color: 0x38bdf8,
        groundColor: 0xbae6fd,
        skyColor: 0x0284c7,
        desc: '吹雪が吹き荒れる極寒の銀世界'
    },
    {
        id: 'sky',
        name: '天空の浮遊神殿',
        reqLv: 100,
        minLv: 100,
        baseThreat: 100,
        color: 0xfde047,
        groundColor: 0xe0e7ff,
        skyColor: 0x60a5fa,
        desc: '雲海に浮かぶ古代神々の聖域'
    },
    {
        id: 'abyss',
        name: '終焉の深淵次元',
        reqLv: 150,
        minLv: 150,
        baseThreat: 150,
        color: 0xa855f7,
        groundColor: 0x1e1b4b,
        skyColor: 0x090d16,
        desc: '魔王と創世の脅威が待ち受ける最終領域'
    }
]);

const WEAPONS = createHybridRegistry([
    { id: 'wpn_wood', name: '木の剣', atk: 8, cost: 0, reqLv: 1, icon: '🗡️', desc: '冒険の始まりに支給される木製の剣' },
    { id: 'wpn_copper', name: '銅の剣', atk: 24, cost: 150, reqLv: 3, icon: '🗡️', materials: { ore_copper: 2 }, desc: '鍛えられた青銅の剣' },
    { id: 'wpn_iron', name: '鉄の剣', atk: 60, cost: 600, reqLv: 8, icon: '⚔️', materials: { ore_iron: 3 }, desc: '切れ味鋭い白鉄の長剣' },
    { id: 'wpn_steel', name: '鋼の剣', atk: 145, cost: 2200, reqLv: 18, icon: '⚔️', materials: { ore_iron: 5, crystal_mana: 2 }, desc: '魔力を帯びた精霊鋼の剣' },
    { id: 'wpn_mythril', name: 'ミスリルソード', atk: 360, cost: 8500, reqLv: 35, icon: '✨', materials: { ore_mythril: 4, crystal_mana: 5 }, desc: '神銀ミスリルで打たれた聖なる剣' },
    { id: 'wpn_dragon', name: 'ドラゴンソード', atk: 920, cost: 32000, reqLv: 60, icon: '🔥', materials: { scale_dragon: 4, ore_mythril: 6 }, desc: '古竜の牙と鱗を宿す紅蓮の魔剣' },
    { id: 'wpn_orichalcum', name: 'オリハルコンの剣', atk: 2400, cost: 130000, reqLv: 90, icon: '🌟', materials: { ore_orichalcum: 5, soul_star: 3 }, desc: '神話の金属で造られた伝説の剣' },
    { id: 'wpn_genesis', name: '創世聖剣エクスカリバー', atk: 6500, cost: 550000, reqLv: 130, icon: '👑', materials: { ore_orichalcum: 10, soul_star: 8 }, desc: '次元をも切り裂く究極の創世聖剣' }
]);

const ARMORS = createHybridRegistry([
    { id: 'arm_cloth', name: '布の服', def: 4, hp: 25, cost: 0, reqLv: 1, icon: '👕', desc: '動きやすい普段着' },
    { id: 'arm_leather', name: '革の鎧', def: 15, hp: 90, cost: 150, reqLv: 3, icon: '🦺', materials: { fur_beast: 2 }, desc: '魔獣の革をなめした軽鎧' },
    { id: 'arm_iron', name: '鉄の鎧', def: 42, hp: 240, cost: 650, reqLv: 8, icon: '🛡️', materials: { ore_iron: 3 }, desc: '頑丈な鉄板で身を護る鎧' },
    { id: 'arm_steel', name: '鋼の重鎧', def: 105, hp: 620, cost: 2400, reqLv: 18, icon: '🛡️', materials: { ore_iron: 5, crystal_mana: 2 }, desc: '重厚な鋼鉄製の騎士鎧' },
    { id: 'arm_mythril', name: 'ミスリルメイル', def: 260, hp: 1500, cost: 9000, reqLv: 35, icon: '✨', materials: { ore_mythril: 4, crystal_mana: 5 }, desc: '軽さと強度を兼ね備えた神銀の鎧' },
    { id: 'arm_dragon', name: '竜鱗の鎧', def: 680, hp: 3900, cost: 34000, reqLv: 60, icon: '🔥', materials: { scale_dragon: 4, ore_mythril: 6 }, desc: 'あらゆる災厄を弾く古竜の鎧' },
    { id: 'arm_orichalcum', name: 'オリハルコンアーマー', def: 1750, hp: 9800, cost: 140000, reqLv: 90, icon: '🌟', materials: { ore_orichalcum: 5, soul_star: 3 }, desc: '星々の加護を受けた不滅の神鎧' },
    { id: 'arm_genesis', name: '創世神鎧イージス', def: 4800, hp: 26000, cost: 580000, reqLv: 130, icon: '👑', materials: { ore_orichalcum: 10, soul_star: 8 }, desc: '全次元の攻撃を退ける究極神鎧' }
]);

const SKILLS = createHybridRegistry([
    { id: 'sk_slash', name: 'クロススラッシュ', category: 'slash', type: 'attack', mpCost: 8, cd: 2.2, mult: 1.8, range: 4.8, icon: '⚔️', desc: '前方に鋭い光刃の斬撃を放つ' },
    { id: 'sk_fire', name: 'メテオフレア', category: 'fire', type: 'attack', mpCost: 14, cd: 3.4, mult: 2.3, range: 6.8, icon: '🔥', desc: '灼熱の火球・隕石で周囲を焼き尽くす' },
    { id: 'sk_nova_ice', name: 'アブソリュートゼロ', category: 'nova_ice', type: 'attack', mpCost: 16, cd: 3.8, mult: 2.2, range: 6.8, icon: '❄️', desc: '絶対零度の氷結陣で敵を凍てつかせる' },
    { id: 'sk_thunder', name: 'サンダーボルト', category: 'thunder', type: 'attack', mpCost: 15, cd: 3.3, mult: 2.25, range: 6.8, icon: '⚡', desc: '天空から紫電の雷槍を落とし麻痺させる' },
    { id: 'sk_wind', name: 'テンペストトルネード', category: 'wind', type: 'attack', mpCost: 13, cd: 3.0, mult: 2.0, range: 6.8, icon: '🌪️', desc: '暴風の竜巻を巻き起こし敵を吹き飛ばす' },
    { id: 'sk_beam', name: '極光レーザー砲', category: 'beam', type: 'attack', mpCost: 20, cd: 4.2, mult: 2.7, range: 11.5, icon: '🔦', desc: '直線上の敵を貫く高出力エネルギー砲' },
    { id: 'sk_void', name: 'アビスグラビティ', category: 'void', type: 'attack', mpCost: 18, cd: 4.0, mult: 2.4, range: 6.8, icon: '🌑', desc: '深淵の重力球で次元ごと敵を蝕む' },
    { id: 'sk_support', name: 'ホーリーヒール', category: 'support', type: 'heal', mpCost: 18, cd: 4.8, mult: 1.5, range: 7.5, icon: '💖', desc: '聖なる光でHPを大回復し味方を祝福する' },
    { id: 'sk_aurora', name: '極光の聖域', category: 'aurora', type: 'buff', mpCost: 26, cd: 7.5, mult: 1.5, range: 8.0, icon: '🌈', desc: '味方の全能力を強化し継続回復する聖域を展開' },
    { id: 'sk_chabudai', name: '怒りのちゃぶ台返し', category: 'chabudai', type: 'attack', mpCost: 22, cd: 4.5, mult: 3.1, range: 7.8, icon: '┻━┻', desc: '巨大なちゃぶ台をひっくり返し衝撃波を放つ！' },
    { id: 'sk_bigbang', name: '創世ビッグバン', category: 'bigbang', type: 'attack', mpCost: 34, cd: 6.8, mult: 3.8, range: 9.8, icon: '💥', desc: '銀河規模の超新星爆発で周囲一帯を消滅させる！' }
]);

const EVOLUTIONS = createHybridRegistry([
    { id: 'novice', name: '見習い冒険者', reqLv: 1, atkMult: 1.0, defMult: 1.0, hpMult: 1.0, mpMult: 1.0, icon: '🗡️', desc: '無限の可能性を秘めた顔文字冒険者' },
    { id: 'warrior', name: '剛腕の剣豪', reqLv: 10, atkMult: 1.35, defMult: 1.2, hpMult: 1.3, mpMult: 0.9, icon: '⚔️', desc: '近接戦闘と斬撃スキルに秀でた戦士' },
    { id: 'mage', name: '星詠みの魔道士', reqLv: 10, atkMult: 1.45, defMult: 0.95, hpMult: 1.0, mpMult: 1.65, icon: '🪄', desc: '武器が杖になり通常攻撃が魔法弾に進化！' },
    { id: 'paladin', name: '聖光の守護騎士', reqLv: 30, atkMult: 1.55, defMult: 1.8, hpMult: 1.85, mpMult: 1.35, icon: '🛡️', desc: '鉄壁の防御と聖なる支援を操る騎士' },
    { id: 'archmage', name: '創世の大賢者', reqLv: 50, atkMult: 2.15, defMult: 1.35, hpMult: 1.45, mpMult: 2.5, icon: '🔮', desc: 'あらゆる元素と奥義魔法を極めた大魔導師' },
    { id: 'god_slayer', name: '天元・顔文字神', reqLv: 100, atkMult: 3.0, defMult: 2.5, hpMult: 2.8, mpMult: 3.0, icon: '👑', desc: '全次元の頂点に君臨する究極進化形態' }
]);

const PETS = createHybridRegistry([
    { id: 'pet_slime', name: 'ぷにぷにスライム', cost: 300, atk: 12, def: 8, hp: 60, color: 0x38bdf8, shape: 'slime', kaomoji: '(・ω・)', desc: 'いつもそばで跳ねる癒し系スライム' },
    { id: 'pet_wolf', name: '疾風フェンリル', cost: 1500, atk: 48, def: 22, hp: 160, color: 0x94a3b8, shape: 'wolf', kaomoji: '(▼皿▼)', desc: '主人の敵に鋭い牙を剥く銀狼' },
    { id: 'pet_fairy', name: '光精霊ルミナ', cost: 4500, atk: 85, def: 60, hp: 340, color: 0xfde047, shape: 'fairy', kaomoji: '(★‿★)', desc: '聖なる光の粉を振りまく妖精' },
    { id: 'pet_dragon', name: '紅蓮ミニドラゴン', cost: 16000, atk: 240, def: 140, hp: 850, color: 0xef4444, shape: 'dragon', kaomoji: '(🔥益🔥)', desc: '灼熱のブレスを吐く小さな竜王' },
    { id: 'pet_phoenix', name: '不死鳥フェニックス', cost: 65000, atk: 650, def: 400, hp: 2500, color: 0xf97316, shape: 'phoenix', kaomoji: '(✨▽✨)', desc: '黄金の翼で主人に不死の加護を与える神鳥' }
]);

const MATERIALS = {
    ore_copper: { id: 'ore_copper', name: '銅鉱石', icon: '🪨' },
    ore_iron: { id: 'ore_iron', name: '鉄鉱石', icon: '⛓️' },
    fur_beast: { id: 'fur_beast', name: '魔獣の毛皮', icon: '🧶' },
    crystal_mana: { id: 'crystal_mana', name: '魔力結晶', icon: '💎' },
    ore_mythril: { id: 'ore_mythril', name: 'ミスリル銀塊', icon: '🪙' },
    scale_dragon: { id: 'scale_dragon', name: '古竜の逆鱗', icon: '🐉' },
    ore_orichalcum: { id: 'ore_orichalcum', name: 'オリハルコン', icon: '🌟' },
    soul_star: { id: 'soul_star', name: '創世の星屑', icon: '✨' }
};
