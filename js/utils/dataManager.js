let abilityData = {};
let traitData = {};
let cachedData = null;

export async function fetchFullCharacterData() {
    if (cachedData) return cachedData;

    // 1. 同步載入所有 JSON 檔案
    const [
        characters,
        abilities,
        battleTools,
        equipments,
        items,
        memoria,
        recipeMaster,
        traitMaster,
        translation,
        value,
        memoria_buff_growth
    ] = await Promise.all([
        fetch('data/characters.json').then(r => r.json()),
        fetch('data/abilities.json').then(r => r.json()),
        fetch('data/battle_tool.json').then(r => r.json()),
        fetch('data/equipment.json').then(r => r.json()),
        fetch('data/item.json').then(r => r.json()),
        fetch('data/memoria_master.json').then(r => r.json()),
        fetch('data/recipe_master.json').then(r => r.json()),
        fetch('data/trait_master.json').then(r => r.json()),
        fetch('data/translation.json').then(r => r.json()),
        fetch('data/value.json').then(r => r.json()),
        fetch('data/memoria_buff_growth.json').then(r => r.json())
    ]);

    // 2. 更新全域變數，讓 getPassive/getTrait 函式能正確運作
    abilityData = abilities;
    traitData = traitMaster;

    // 3. 建立查詢用的 Maps
    const abilityMap = abilities;
    const equipTraitMap = traitMaster.equipment_tool_traits || {};
    const toolTraitMap = traitMaster.battle_tool_traits || {};

    // 4. 整合角色資料
    cachedData = characters.map(char => ({
        ...char,
        abilityObjs: (char.passive_ids || [])
            .map(id => abilityMap[id])
            .filter(Boolean),

        equipTrait: char.equip ? equipTraitMap[char.equip] : null,
        toolTraits: (char.tool || [])
            .map(id => toolTraitMap[id])
            .filter(Boolean)
    }));

    // 5. 綁定 meta 資料
    cachedData.meta = { abilities, battleTools, equipments, items, memoria, recipeMaster, traitMaster, translation, value, memoria_buff_growth };

    window.translationData = translation;
    window.valueDatabase = value;
    return cachedData;
}

// 修正 getter：因為 fetchFullCharacterData 已經更新了這些變數，這裡直接存取即可
export function getPassive(id, lang = 'zh') {
    const passive = abilityData[id];
    return passive ? (passive.description[lang] || passive.description['zh']) : "未知被動";
}

export function getTrait(id, type, lang = 'zh') {
    const source = (type === 'tool') ? traitData.battle_tool_traits : traitData.equipment_tool_traits;
    const trait = source ? source[id] : null;
    return trait ? (trait.description[lang] || trait.description['zh']) : "未知特性";
}


//							//
//			技能相關		//
//							//
export async function getCharacterSkills(imagePath) {
    // 1. 從路徑取得 base_character_id (例如: 46202)
    const baseId = imagePath.match(/(\d+)\.png/)[1];

    // 2. 比對 characters.json 取得該角色的內部 ID (例如: 192)
    const character = charactersData.find(c => c.base_character_id === parseInt(baseId));
    if (!character) return null;

    // 3. 使用該 ID 存取 translation.json
    const skills = translationData[character.id];

    return skills;
}


export function getCharacterDataByBaseId(baseId) {
    return cachedData.find(c => c.base_character_id === parseInt(baseId));
}

export function getSkillTranslation(charId, skillKey) {
    const charTranslations = window.translationData[charId];
    return charTranslations ? charTranslations[skillKey] : null;
}