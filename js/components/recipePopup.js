import { state } from '../state.js';
import { UI_TEXT } from '../i18n.js';
import { BATTLEITEM_ICON, EQUIP_RARITY_FILTERS } from '../constants.js';
import { getMaterialRecipes } from '../utils/recipeLookup.js';
import { showToast } from './toolbar.js';

    const rarityMap = new Map(EQUIP_RARITY_FILTERS.map(r => [r.text, r]));
    
export function showRecipePopup(materialId) {

    document.querySelector('.recipe-popup-overlay')?.remove();
    const meta = state.data.meta;
    const t = UI_TEXT[state.ui.currentLang] || {};
    const rarityMap = new Map(EQUIP_RARITY_FILTERS.map(r => [r.text, r]));


    const results = getMaterialRecipes(materialId, meta.recipeMaster, meta.equipments, meta.battleTools);
    if (results.length === 0) { showToast(t.norecipeusage); return; }
    const cardsHtml = results.map(item => {
    	if (item.type === 'equipment') {
            const statusHtml = item.status.map(s => `<span class="recipe-stat">${t[s.type] || s.type}+${s.value}</span>`).join('');
            return `
                <div class="recipe-card"><div class="recipe-img-box"> <img src="${rarityMap.get(item.rarity)?.frame || ''}" class="recipe-frame"> <img src="${item.image}" class="recipe-icon"> </div>
                    <div class="recipe-info"><div class="recipe-name">${item.name}</div><div class="recipe-extra">${statusHtml}</div></div></div>`;}

	const icon = BATTLEITEM_ICON[item.traitFilterId];
	
        return `
            <div class="recipe-card"><div class="recipe-img-box"> <img src="${rarityMap.get(item.rarity)?.frame || ''}" class="recipe-frame"> <img src="${item.image}" class="recipe-icon"> </div>
                <div class="recipe-info"><div class="recipe-name">${item.name}</div>
            <div class="recipe-extra"><img src="${icon || ''}" class="battle-type-icon"></div>
                </div></div>`; }).join('');

    const overlay = document.createElement('div');

    overlay.className = 'recipe-popup-overlay';

    overlay.innerHTML = `
        <div class="recipe-popup">
            <div class="recipe-title">${t.recipetitle}</div>

            <div class="recipe-list">${cardsHtml}</div>
        </div>
    `;

    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => {
        if (e.target === overlay) overlay.remove();
    });
}