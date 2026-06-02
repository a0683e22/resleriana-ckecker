import { state } from '../state.js';
import { UI_TEXT } from '../i18n.js';
import { BATTLEITEM_ICON } from '../constants.js'
import { ATELIER_CANNON_MATERIAL_IDS } from '../pages/materials.js';


export const CANNON_IMAGE_MAP = {
    10037: 'images/bomb/bomb_tool_0001_S.webp',
    10038: 'images/bomb/bomb_tool_0002_S.webp',
    10039: 'images/bomb/bomb_tool_0003_S.webp',
    10040: 'images/bomb/bomb_tool_0004_S.webp',
    10041: 'images/bomb/bomb_tool_0005_S.webp',
    10042: 'images/bomb/bomb_tool_0006_S.webp',
    10043: 'images/bomb/bomb_tool_0019_S.webp',
    10044: 'images/bomb/bomb_tool_0022_S.webp',
};



export function getMaterialRecipes(materialId, recipeMaster, equipments, battleTools) {
    const equipmentNameMap = new Map(equipments.map(e => [e.name, e]));
    const battleToolNameMap = new Map(battleTools.map(b => [b.name, b]));
    const isCannonMaterial = ATELIER_CANNON_MATERIAL_IDS.includes(materialId);
    
    return recipeMaster
        .filter(recipe => recipe.materials?.some(mat => mat.id === materialId))
        .map(recipe => {
            const equip = equipmentNameMap.get(recipe.name);
    if (isCannonMaterial) { return { type: 'cannon', recipeId: recipe.recipe_id, name: recipe.name, image: CANNON_IMAGE_MAP[recipe.recipe_id], traitFilterId:'bomb' , rarity: 'SSR' }};
            if (equip) {
                return {
                    type: 'equipment',
                    recipeId: recipe.recipe_id,
                    name: recipe.name,
                    image: equip.image,
                    status: equip.status || [],
                    rarity: equip.rarity,
                };
            }
            const tool = battleToolNameMap.get(recipe.name);
            if (tool) {
                return {
                    type: 'battleitem',
                    recipeId: recipe.recipe_id,
                    name: recipe.name,
                    image: tool.image,
                    traitFilterId: tool.trait_filter_ids,
                    rarity: tool.rarity
                };
            }
            return null;}) 
        .filter(Boolean);
}