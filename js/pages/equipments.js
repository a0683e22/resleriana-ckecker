import { state } from '../state.js';
import { UI_TEXT } from '../i18n.js';
import { EQUIP_RARITY_FILTERS, EQUIP_FILTERS, COLOR_FILTERS } from '../constants.js';
import { createEquipmentCard } from '../components/equip.js';
import { showToast } from '../components/toolbar.js';


const getStatusValue = (eq, type) => eq.status?.find(s => s.type === type)?.value || 0;

export function renderEquipments() {
    console.log('renderEquipments');
    const { meta } = state.data;
    const content = document.getElementById('content');
    const { rarity, type, color } = state.filters.equipments;
    const keyword = state.search.equipments?.trim().toLowerCase();

    // 準備 Map
    const recipeMap = new Map(meta.recipeMaster.map(r => [r.name, r]));
    const itemMap = new Map(meta.items.map(i => [i.id, i]));
    const charMap = new Map(state.data.map(c => [c.base_character_id, c]));

    // 1. 篩選 (合併搜尋與多重過濾)
    const equipments = meta.equipments.filter(eq => {
        if (keyword && !eq.name.toLowerCase().includes(keyword)) return false;
        if (rarity.length) {
            const val = EQUIP_RARITY_FILTERS.find(r => r.text === eq.rarity)?.value;
            if (!rarity.includes(val)) return false;
        }
        if (type.length && !type.includes(eq.slot_type.toLowerCase())) return false;
        if (color.length && !recipeMap.get(eq.name)?.gift_colors?.some(c => color.includes(Number(c)))) return false;
        return true;
    });

    // 2. 排序 (使用 Map 取代 switch)
    const sortKeys = {
        newest: (a, b) => b.id - a.id,
        oldest: (a, b) => a.id - b.id,
        hp: (a, b) => getStatusValue(b, 'hp') - getStatusValue(a, 'hp'),
        speed: (a, b) => getStatusValue(b, 'speed') - getStatusValue(a, 'speed'),
        patk: (a, b) => getStatusValue(b, 'patk') - getStatusValue(a, 'patk'),
        matk: (a, b) => getStatusValue(b, 'matk') - getStatusValue(a, 'matk'),
        pdef: (a, b) => getStatusValue(b, 'pdef') - getStatusValue(a, 'pdef'),
        mdef: (a, b) => getStatusValue(b, 'mdef') - getStatusValue(a, 'mdef')
    };

    equipments.sort(sortKeys[state.sorting.equipments] || sortKeys.newest);

    // 3. 渲染
    content.innerHTML = `<div class="equipment-grid">${equipments
        .map(eq => createEquipmentCard(eq, recipeMap.get(eq.name), itemMap, charMap))
        .join('')}</div>`;
}

document.addEventListener('click', async (e) => {
    const nameBox = e.target.closest('.copy-name');
    if (!nameBox) return;

    const name = nameBox.dataset.name;

    try {
        await navigator.clipboard.writeText(name);

        const copiedText = { zh: `已複製 ${name}`, en: `${name} copied`, jp: `${name}をコピーしました` };

        showToast(copiedText[state.ui.currentLang] || `${name} copied`);

    } catch {
        showToast(
            UI_TEXT[state.ui.currentLang]?.copyFail || 'Failed'
        );
    }
});