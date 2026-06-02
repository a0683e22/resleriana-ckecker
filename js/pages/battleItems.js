import { state } from '../state.js';
import { UI_TEXT } from '../i18n.js';
import { showToast } from '../components/toolbar.js';
import { createBattletoolCard } from '../components/battletool.js';
import { RARITY_FILTERS, TOOL_PRIORITY } from '../constants.js' 

export function renderbattleitems() {
    const meta = state.data.meta;
    const content = document.getElementById('content');
    const recipeMap = new Map(meta.recipeMaster.map(r => [r.name, r]));
    const itemMap = new Map(meta.items.map(i => [i.id, i]));
    const filters = state.filters.battleitems;
    let battleTools = [...meta.battleTools];
    
    const keyword = state.search.battleitems?.trim().toLowerCase();

if (keyword) {
    battleTools = battleTools.filter(tool =>
        tool.name.toLowerCase().includes(keyword)
    );
}
//稀有度
if (filters.rarity.length) {
    battleTools = battleTools.filter(tool => {

    const rarityValue =
        RARITY_FILTERS.find(
            r => r.text === tool.rarity
        )?.value;

    return filters.rarity.includes(rarityValue);
});

}
//類型
if (filters.type.length) {
    battleTools = battleTools.filter(tool =>
        filters.type.includes(String(tool.trait_filter_ids))
    );
}
//顏色
if (filters.color.length) {

    battleTools = battleTools.filter(tool => {

        const recipe = recipeMap.get(tool.name);

        if (!recipe?.gift_colors) return false;

        return filters.color.some(
            color => recipe.gift_colors.includes(Number(color))
        );

    });

}

switch (state.sorting.battleitems) {

    case 'newest':
        battleTools.sort((a, b) => b.id - a.id);
        break;

    case 'oldest':
        battleTools.sort((a, b) => a.id - b.id);
        break;

    case 'attack':
        battleTools.sort((a, b) =>
            TOOL_PRIORITY.aFirst.indexOf(a.trait_filter_ids) -
            TOOL_PRIORITY.aFirst.indexOf(b.trait_filter_ids)
        );
        break;

    case 'buff':
        battleTools.sort((a, b) =>
            TOOL_PRIORITY.bFirst.indexOf(a.trait_filter_ids) -
            TOOL_PRIORITY.bFirst.indexOf(b.trait_filter_ids)
        );
        break;

    case 'debuff':
        battleTools.sort((a, b) =>
            TOOL_PRIORITY.dFirst.indexOf(a.trait_filter_ids) -
            TOOL_PRIORITY.dFirst.indexOf(b.trait_filter_ids)
        );
        break;

    case 'heal':
        battleTools.sort((a, b) =>
            TOOL_PRIORITY.hFirst.indexOf(a.trait_filter_ids) -
            TOOL_PRIORITY.hFirst.indexOf(b.trait_filter_ids)
        );
        break;
        
        default: battleTools.sort((a, b) => b.id - a.id);
}


    const html = battleTools
        .map(tool => createBattletoolCard(tool, recipeMap.get(tool.name), itemMap)).join('');

    content.innerHTML = `
        <div class="equipment-grid">
            ${html}
        </div>
    `;
}