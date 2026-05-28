import { createCharacterCard } from '../components/card.js';
import { createCharacterTable,  setupTableToggleLogic, } from '../components/table.js';
import { createCharacterList } from '../components/list.js';
import { initCharacterImageInteraction } from './interaction.js'; //
import { ELEMENT_FILTERS } from '../constants.js';
import { renderCharacters } from '../pages/characters.js';

export const RenderStrategy = {
  grid: (data) => {
    const html = data.map(createCharacterCard).join('');
    // 渲染完後，下一幀執行同步
    requestAnimationFrame(initCharacterImageInteraction);
    return html;
  },

  table: (data) => {
    const html = createCharacterTable(data);
        initCharacterImageInteraction();
        setupTableToggleLogic();
    // 渲染完後，下一幀執行同步
    requestAnimationFrame(initCharacterImageInteraction);
    return html;
  },

  list: (data) => {
    const html = createCharacterList(data);
    requestAnimationFrame(initCharacterImageInteraction);
    return html;
  }
};

const ATTR_MAP = { 1: '斬', 2: '打', 3: '突', 5: '火', 6: '冰', 7: '雷', 8: '風' };
const ATTR_LOOKUP = {
    8: ELEMENT_FILTERS.find(f => f.value === 'wind'),
    5: ELEMENT_FILTERS.find(f => f.value === 'fire'),
    6: ELEMENT_FILTERS.find(f => f.value === 'ice'),
    7: ELEMENT_FILTERS.find(f => f.value === 'bolt'),
    1: ELEMENT_FILTERS.find(f => f.value === 'slash'),
    2: ELEMENT_FILTERS.find(f => f.value === 'strike'),
    3: ELEMENT_FILTERS.find(f => f.value === 'stab'),
};

export function getAttrInfo(attrId) {
    return ATTR_LOOKUP[attrId] || { zh: '無', icon: '' };
}

export function processSkillStats(value) {
    if (!value) return null;

    // 處理 Wait 時間計算
    const finalWait = 200 + (value.wait ?? 0);
    
    return {
        attr: ATTR_MAP[value.attr] || '-',
        power: value.power_type !== 5 && value.power > 0 ? `${value.power}%` : '-',
        breakPower: value.break_power > 0 ? `${value.break_power}%` : '-',
        heal: value.power_type === 5 ? `${value.power}%` : '-',
        wait: finalWait <= 0 ? '-' : finalWait,
    };
}

export function formatSkillDescription(text, params = []) {
    // 防呆檢查：若文字為空或型別錯誤則返回空字串
    if (!text || typeof text !== 'string') {
        return '';
    }


    // 1. 替換 {0} {1} 等數值佔位符
    // 使用正則表達式尋找所有 {數字} 格式，並以 params 陣列對應索引的值進行替換
    let formattedText = text.replace(/\{(\d+)\}/g, (match, index) => {
        return params[index] !== undefined ? params[index] : match;
    });

    // 2. 處理技能連結語法 [type:id]內容[/type]
    // 轉換為具備 data-id 與 data-type 的 <span> 標籤，便於後續綁定點擊事件
    formattedText = formattedText.replace(
        /\[(passive|ex|in|count):(\d+)\]([\s\S]*?)\[\/(passive|ex|in|count)\]/g,
        (match, type, id, label) => {
            return `
                <span
                    class="skill-link" data-id="${id}" data-type="${type}" style="color:#61dafb; cursor:pointer; text-decoration:underline;">${label}</span>`;});
    return formattedText;
}


let currentFilter = { rarity: 'all' };

/*** 根據 ID 範圍決定稀有度 ***/
function getMemoRarityFromId(id) {
    const numId = parseInt(id);
    if (numId >= 30000) return 'SSR';
    if (numId >= 20000) return 'SR';
    if (numId >= 10000) return 'R';
    return 'Other';
}

/**
 * 執行篩選並重繪
 */
async function applyMemoFilter(rarityRank) {
    // 1. 從你已經載入的 meta 中取出資料
    const allData = await fetchFullCharacterData();
    const memoriaObj = allData.meta.memoria;
    
    // 2. 轉換為陣列並篩選
    const filteredList = Object.entries(memoriaObj).filter(([id, item]) => {
        if (rarityRank === 'all') return true;
        // !!! 問題點在這裡 !!!
        return getMemoRarityFromId(id) === rarityRank; 
    });

    // 3. 呼叫你的渲染函數
    renderMemoriaList(filteredList);
}

function renderPage() {
    const content = document.getElementById('content');
    if (!content) {
        console.error("找不到 <main id='content'> 元素！");
        return;
    }

    if (state.ui.currentPage === 'memories') {
        renderMemoriaList(getFilteredData()); 
    } else if (state.ui.currentPage === 'characters') {
        // 請確保這裡有正確的 renderCharacters 邏輯
        renderCharacters(); 
    }
} // 只有這