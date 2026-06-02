import { COLOR_FILTERS, EQUIP_RARITY_FILTERS, EQUIP_FILTERS } from '../constants.js';
import { state } from '../state.js';
import { UI_TEXT } from '../i18n.js';


const colorMap = new Map(COLOR_FILTERS.map(c => [c.value, c]));
const rarityMap = new Map(EQUIP_RARITY_FILTERS.map(r => [r.text, r]));
const slotMap = new Map(EQUIP_FILTERS.map(s => [s.text, s]));

const SPECIAL_EQUIP = {
    // 商店購買的特殊裝備
    shop: [838, 839, 840],
    // 活動限定的特殊裝備
    event: [766, 767, 780, 793, 812, 813, 853, 854, 879, 880, 947, 978, 1010, 1194, 1195, 1196, 1197, 1198, 1199, 1200, 1201]
};

const noEffect =
    state.ui.currentLang === 'zh'
        ? '無效果'
        : state.ui.currentLang === 'jp'
            ? '効果なし'
            : 'No Effect';


export function createEquipmentCard(equipment, recipe, itemMap, characterMap) {
    const rarity = rarityMap.get(equipment.rarity);
    const slot = slotMap.get(equipment.slot_type);
    const t = UI_TEXT[state.ui.currentLang] || {};

    const statusHtml = (equipment.status || [])
        .map(s => `<span class="stat-tag">${t[s.type] || s.type.toUpperCase()}+${s.value}</span>`).join('');


    const SOURCE_TAGS = {
        event: `<span class="source-tag event">${t.event_equip}</span>`,
        shop: `<span class="source-tag shop">${t.shop_equip}</span>`
    };

    function getSourceHtml(equipment, recipe, colorMap) {
        // 檢查特殊裝備類型
        if (SPECIAL_EQUIP.event.includes(equipment.id)) return SOURCE_TAGS.event;
        if (SPECIAL_EQUIP.shop.includes(equipment.id)) return SOURCE_TAGS.shop;

        // 若非特殊裝備，則處理顏色圖示
        return (recipe?.gift_colors || [])
            .map(id => {
                const color = colorMap.get(id);
                return color?.icon ? `<img src="${color.icon}">` : '';
            })
            .join('');
    }

    // 實際使用
    let colorsHtml = getSourceHtml(equipment, recipe, colorMap);
    const materialsHtml = (recipe?.materials?.length) ? recipe.materials.map(mat => {
        let name = '', img = '', frame = '';
        if (mat.type === 8) {
            const char = characterMap.get(mat.id);
            const suffix = { jp: 'のピース', zh: '的碎片', en: "'s Piece" }[state.ui.currentLang] || '碎片';
            name = (char?.name?.[state.ui.currentLang] || 'Unknown') + suffix;
            img = `images/ingredient/${mat.id}.webp`;
            frame = 'images/ui/shard_frame.webp';
        } else {
            const item = itemMap.get(mat.id);
            name = item?.name || '';
            img = item?.image || '';
            frame = rarityMap.get(item?.rarity)?.frame || '';
        }
        return `
            <div class="mat-box" data-material-id="${mat.id}">
                <div class="img-wrap">
                    <img src="${frame}" class="frame">
                    <img src="${img}" class="icon">
                    <span class="qty">${mat.quantity}</span>
                </div>
                <div class="name">${name}</div>
            </div>`;
    }).join('') : `<div class="no-recipe">${{ zh: '無調合配方', jp: '調合レシピなし', en: 'No Recipe' }[state.ui.currentLang] || 'No Recipe'}</div>`;
    return `
        <div class="equipment-card">
            <div class="left-col">
                <div class="img-box">
                    <img src="${rarityMap.get(equipment.rarity)?.frame || ''}" class="bg">
                    <img src="${equipment.image}" class="main">
                    <img src="${slotMap.get(equipment.slot_type)?.icon || ''}" class="slot">
                </div>
                <div class="info-footer">
                    <div class="name-box copy-name" data-name="${recipe?.name || equipment.name}">${recipe?.name || equipment.name}</div>
                    <div class="colors-box">${colorsHtml}</div>
                </div>
            </div>
            <div class="right-col">
                <div class="header-box">
                    <div class="status-list">${statusHtml}</div>
                    <div class="date-tag">${recipe?.start_at || ''}</div>
                </div>
                <div class="ability-box">${equipment.ability || t.noEffect}</div>
                <div class="materials-box">${materialsHtml}</div>
            </div>
        </div>
    `;
}