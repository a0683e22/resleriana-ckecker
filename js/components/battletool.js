import { COLOR_FILTERS, EQUIP_RARITY_FILTERS, BATTLEITEM_FILTERS } from '../constants.js';
import { state } from '../state.js';
import { UI_TEXT } from '../i18n.js';


const colorMap = new Map(COLOR_FILTERS.map(c => [c.value, c]));
const rarityMap = new Map(EQUIP_RARITY_FILTERS.map(r => [r.text, r]));
const slotMap = new Map(BATTLEITEM_FILTERS.map(s => [s.value, s]));


export function createBattletoolCard(tool, recipe, itemMap) {
    const rarity = rarityMap.get(tool.rarity);
    const type = slotMap.get(tool.trait_filter_ids);
    const t = UI_TEXT[state.ui.currentLang] || {};

    let powerValue = '-';
    let bpowerValue = '-';
    let healValue = '-';

    if (tool.power != null) {
        if (tool.power_types?.includes(1)) {
            powerValue = tool.power;
        } else if (tool.power_types?.includes(3)) {
            healValue = tool.power;
        }
    }
    const displayValue = tool.power != null ? `${tool.power}${tool.show_percent?.[0] ? '%' : ''}` : '-';
    if (tool.power_types?.includes(1)) {
        powerValue = displayValue;
    } else if (tool.power_types?.includes(3)) {
        healValue = displayValue;
    }
    const colorsHtml = (recipe?.gift_colors || [])
        .map(id => {
            const color = colorMap.get(id);
            return color?.icon ? `<img src="${color.icon}">` : '';
        })
        .join('');

    const materialsHtml = (recipe?.materials?.length)
        ? recipe.materials.map(mat => {
            const item = itemMap.get(mat.id);

            return `
                <div class="mat-box" data-material-id="${mat.id}">
                    <div class="img-wrap">
                        <img src="${rarityMap.get(item?.rarity)?.frame || ''}" class="frame">
                        <img src="${item?.image || ''}" class="icon">
                        <span class="qty">${mat.quantity}</span>
                    </div>
                    <div class="name">${item?.name || ''}</div>
                </div>
            `;
        }).join('')
        : `<div class="no-recipe">${{
            zh: '無調合配方',
            jp: '調合レシピなし',
            en: 'No Recipe'
        }[state.ui.currentLang]
        }</div>`;

    return `
        <div class="equipment-card">
            <div class="left-col">
                <div class="img-box">
                    <img src="${rarity?.frame || ''}" class="bg">
                    <img src="${tool.image}" class="main">

                    <img src="${type?.icon || ''}" class="slot">

                    <div class="use-count">
                        ${tool.usage_count}
                    </div>
                </div>

                <div class="info-footer">
                    <div class="name-box copy-name" data-name="${tool.name}">
                        ${tool.name}
                    </div>

                    <div class="colors-box">
                        ${colorsHtml}
                    </div>
                </div>
            </div>

            <div class="right-col">

                <div class="battletool-power-row">
                    <span class="stat-tag">
                        <img src="images/ui/power2.png">
                        ${powerValue}
                    </span>

                    <span class="stat-tag">
                        <img src="images/ui/bpower2.png">
                        ${bpowerValue}
                    </span>

                    <span class="stat-tag">
                        <img src="images/ui/heal2.png">
                        ${healValue}
                    </span>
                </div>

                <div class="ability-box">
                    ${tool.effect || t.noEffect}
                </div>

                <div class="materials-box">
                    ${materialsHtml}
                </div>

            </div>
        </div>
    `;
}