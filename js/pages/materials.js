import { state } from '../state.js';
import { UI_TEXT } from '../i18n.js';
import { RARITY_FILTERS, COLOR_PRIORITY } from '../constants.js';
import { fetchFullCharacterData } from '../utils/dataManager.js'
import { createMaterialCard } from '../components/material.js';
import { showToast } from '../components/toolbar.js';
import { showTraitPopup } from '../components/materialPopup.js';

export const ATELIER_CANNON_MATERIAL_IDS = [
    ...Array.from({ length: 1337 - 1320 + 1 }, (_, i) => 1320 + i),
    1383, 1384, 1385, 1406, 1407, 1408];

export async function renderMaterials() {

    const t = UI_TEXT[state.ui.currentLang];
    const filters = state.filters.materials;
    const content = document.getElementById('content');
    const data = await fetchFullCharacterData();
    let items = [...data.meta.items].sort((a, b) => b.id - a.id);
    if (filters.type.length > 1) {
        filters.type = [filters.type.at(-1)];
    }
    if (filters.type.includes('normal')) {
        items = items.filter(item =>
            !ATELIER_CANNON_MATERIAL_IDS.includes(item.id)
        );
    }
    else if (filters.type.includes('cannon')) {
        items = items.filter(item =>
            ATELIER_CANNON_MATERIAL_IDS.includes(item.id)
        );
    }
    //類型
    if (filters.type.includes('normal')) {
        items = items.filter(item =>
            !ATELIER_CANNON_MATERIAL_IDS.includes(item.id)
        );
    }
    else if (filters.type.includes('cannon')) {
        items = items.filter(item =>
            ATELIER_CANNON_MATERIAL_IDS.includes(item.id)
        );
    }

    //稀有度
    if (filters.rarity.length) {
        items = items.filter(item => {

            const rarityValue =
                RARITY_FILTERS.find(
                    r => r.text === item.rarity
                )?.value;

            return filters.rarity.includes(rarityValue);

        });
    }

    //顏色
    if (filters.color.length) {
        items = items.filter(item =>
            filters.color.includes(item.trait_color_id)
        );
    }

    switch (state.sorting.materials) {

        case 'oldest':
            items.sort((a, b) => a.id - b.id);
            break;

        case 'blueFirst':
            items.sort((a, b) =>
                (b.trait_color_id === 1) -
                (a.trait_color_id === 1)
            );
            break;

        case 'purpleFirst':
            items.sort((a, b) =>
                (b.trait_color_id === 2) -
                (a.trait_color_id === 2)
            );
            break;

        case 'yellowFirst':
            items.sort((a, b) =>
                (b.trait_color_id === 3) -
                (a.trait_color_id === 3)
            );
            break;

        case 'redFirst':
            items.sort((a, b) =>
                (b.trait_color_id === 4) -
                (a.trait_color_id === 4)
            );
            break;

        case 'greenFirst':
            items.sort((a, b) =>
                (b.trait_color_id === 5) -
                (a.trait_color_id === 5)
            );
            break;

        case 'newest':
        default:
            items.sort((a, b) => b.id - a.id);
            break;
    }

    content.innerHTML = `
    <div class="material-grid">
        ${items.map(item =>
        createMaterialCard(item, data.meta)
    ).join('')}
    </div>
`;

    content.addEventListener('click', (e) => {

        const trait = e.target.closest('.clickable-trait');
        if (!trait) return;

        const { type, id } = trait.dataset;

        showTraitPopup(type, Number(id));

    });
}

function getTraitName(trait) {
    if (trait.type === 'equip') {
        return data.meta.traitMaster
            .equipment_tool_traits?.[trait.id]
            ?.[state.ui.currentLang];
    }

    return data.meta.traitMaster
        .battle_tool_traits?.[trait.id]
        ?.[state.ui.currentLang];
}