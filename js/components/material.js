import { state } from '../state.js';
import { UI_TEXT } from '../i18n.js';
import { EQUIP_RARITY_FILTERS, COLOR_FILTERS } from '../constants.js';

export function createMaterialCard(item, meta) {
    const { traitMaster } = meta;
    const lang = state.ui.currentLang;
    const colorIcon = COLOR_FILTERS.find(c => c.value === item.trait_color_id)?.icon;
    const rarityFrame = EQUIP_RARITY_FILTERS.find(r => r.text === item.rarity)?.frame;
    const equipTraits = (item.equipment_tool_trait_ids || [])
        .map(id => ({
            id,
            type: 'equip',
            trait: traitMaster.equipment_tool_traits?.[id]
        }))
        .filter(x => x.trait);

    const toolTraits = (item.battle_tool_trait_ids || [])
        .map(id => ({
            id,
            type: 'tool',
            trait: traitMaster.battle_tool_traits?.[id]
        }))
        .filter(x => x.trait);

    const traits = [...equipTraits, ...toolTraits];

    return `
        <div class="material-card">

            <div class="material-image mat-box" data-material-id="${item.id}">

    <img class="material-rarity-bg"src="${rarityFrame}" alt="">
    <img class="material-icon" src="${item.image}" alt="${item.name}">
    <img class="material-color-icon" src="${colorIcon}" alt="">
	    </div>

            <div class="material-content">

                <div class="material-name copy-name" data-name="${item.name}">${item.name}</div>

                <div class="material-traits">${traits.map(({ type, id, trait }) =>
        `<div class="material-trait clickable-trait" data-type="${type}" data-id="${id}"><span>${type === 'equip' ? '⚔️' : '🧪'}</span>${trait[state.ui.currentLang]}</div>
`).join('')}
                </div>

            </div>

        </div>
    `;
}