import { state, MemoriaOwnershipManager } from '../state.js';
import { UI_TEXT } from '../i18n.js';
import { openMemoriaModal } from '../components/memoria.js';
import { fetchFullCharacterData } from '../utils/dataManager.js';
/**
 * 輔助：根據 ID 獲取稀有度
 */
const getRarity = (id) => {
    const num = Number(id);
    const thresholds = [30000, 20000];
    const index = thresholds.findIndex(
        t => num >= t);
    return index === -1 ? 1 : 3 - index;
};

const MAPS = {
    ROLE: { attacker: 1, breaker: 2, defender: 3, supporter: 4 },
    ELEMENT: { slash: 1, strike: 2, stab: 3, fire: 5, ice: 6, bolt: 7, wind: 8 }
};

const MEMORIA_CYCLE_TYPE = {
    // 01
    "99999": 1,
    "30090": 1,
    "30081": 1,
    "30069": 1,
    "30019": 1,
    // 05
    "30190": 2,
    "30183": 2,
    "30182": 2,
    "30018": 2,
};



function getMemoriaStat(memoria, type, data) {
    const stat = memoria.stats?.find(s => s.type === type);
    if (!stat) return 0;

    const growth = data.meta.memoria_buff_growth?.find(g => g.id === stat.growth_id);
    if (!growth) return 0;

    return growth.values?.[29] || 0;
}
/**
 * 輔助：建立單張卡牌元素
 */
function createCard(id, mem, growthData) {
    const cycleType = MEMORIA_CYCLE_TYPE[String(id)] || 0;
    const card = document.createElement('div');
    const owned = state.memoria.owned[id];
    card.className = ` memoria-card ${owned ? 'owned' : ''} `;

    const imagePath = `images/memo/${id}.webp`;
    const rarity = getRarity(id);
    const rarityText = { 1: 'R', 2: 'SR', 3: 'SSR' };
    const rarityClass = { 1: 'r', 2: 'sr', 3: 'ssr' }[rarity];

    card.innerHTML = `
        <div class="memoria-card-image-wrapper">
            <img class="memoria-card-image" src="${imagePath}">
            <div class="memoria-rarity ${rarityClass}">${rarityText[rarity]}</div>
        </div>
        <div class="memoria-name">${mem.name}</div>
    `;
    rerenderMemoriaCard(card, id);
    // 點卡片 = 持有切換
    card.addEventListener('click', () => {
        updateMemoLimit(id, 1, cycleType);
        rerenderMemoriaCard(card, id);
    });

    card.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        updateMemoLimit(id, -1, cycleType);
        rerenderMemoriaCard(card, id);
    });


    // 點名字 = 開 modal
    const nameButton = card.querySelector('.memoria-name');
    nameButton.addEventListener('click', (e) => {
        e.stopPropagation();
        openMemoriaModal({
            ...mem,
            id,
            image: imagePath
        }, growthData);
    });

    return card;
}

export async function renderMemories() {
    const t = UI_TEXT[state.ui.currentLang];
    const content = document.getElementById('content');
    const data = await fetchFullCharacterData();
    state.memoria.owned = state.memoria.owned && Object.keys(state.memoria.owned).length > 0 ? state.memoria.owned : MemoriaOwnershipManager.getOwned();

    const memoriaList = Object.entries(data.meta.memoria);
    const sortOrder = state.sorting.memories || 'newest';

    const SORT_TO_STAT = { hp: 'HP', speed: 'SPD', patk: 'PATK', matk: 'MATK', pdef: 'PDEF', mdef: 'MDEF', };

    memoriaList.sort(([idA, memoriaA], [idB, memoriaB]) => {
        // 處理 ID 基礎排序
        if (sortOrder === 'newest') return Number(idB) - Number(idA);
        if (sortOrder === 'oldest') return Number(idA) - Number(idB);

        // 處理素質排序：將 case 對應到 stat 的 key
        const statKeyMap = { hp: 'HP', speed: 'SPD', patk: 'PATK', matk: 'MATK', pdef: 'PDEF', mdef: 'MDEF' };

        const targetStat = statKeyMap[sortOrder];

        if (targetStat) {
            return getMemoriaStat(memoriaB, targetStat, data) - getMemoriaStat(memoriaA, targetStat, data);
        }

        return 0;
    });

    const growthData = data.meta.memoria_buff_growth;

    const { memories: filters } = state.filters;
    const searchVal = (state.search.memories || "").toLowerCase();

    // 1. 建立篩選邏輯判斷函數
    const isMatch = ([id, memory]) => {
        const matchSearch = memory.name.toLowerCase().includes(searchVal);

        const selectedAttrs = filters.element.map(v => MAPS.ELEMENT[v]);
        const matchElement = filters.element.length === 0 || memory.attr.length === 0 || memory.attr.some(a => selectedAttrs.includes(a));

        const selectedRoles = filters.role.map(v => MAPS.ROLE[v]);
        const matchRole = filters.role.length === 0 || memory.roles.length === 0 || memory.roles.some(r => selectedRoles.includes(r));

        const matchRarity = filters.rarity.length === 0 || filters.rarity.includes(getRarity(id));

        const extraFilters = filters.extra || [];
        const matchOwned = !extraFilters.includes('owned') || state.memoria.owned[id];
        return matchSearch && matchElement && matchRole && matchRarity && matchOwned;
    };

    // 2. 執行篩選
    const filteredList = memoriaList.filter(isMatch);

    content.innerHTML = `
        <div class="page-title"></div>
        <div class="memoria-grid" id="memoria-grid"></div>
    `;

    const grid = document.getElementById('memoria-grid');

    filteredList.forEach(([id, mem]) => {
        const card = createCard(id, mem, growthData);
        grid.appendChild(card);
    });
}

function updateMemoLimit(id, delta, cycleType) {
    const current = state.memoria.owned[id] || 0;

    let sequence;
    if (cycleType === 0) {
        sequence = [0, 1, 2, 3, 4, 5]; // 一般抽卡
    } else if (cycleType === 1) {
        sequence = [0, 1];             // 單張
    } else {
        sequence = [0, 5];             // 滿突贈送
    }

    let index = sequence.indexOf(current);
    index += delta;

    if (index >= sequence.length) index = 0;
    if (index < 0) index = sequence.length - 1;

    const next = sequence[index];

    if (next === 0) {
        delete state.memoria.owned[id];
    } else {
        state.memoria.owned[id] = next;
    }
    localStorage.setItem('ownedMemoria', JSON.stringify(state.memoria.owned));
}

function rerenderMemoriaCard(card, id) {
    const limit = state.memoria.owned[id] || 0;
    const owned = limit > 0;

    card.classList.toggle('owned', owned);

    const oldLimit = card.querySelector('.memoria-limit');
    if (oldLimit) {
        oldLimit.remove();
    }

    if (limit > 0) {
        const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V'];
        const limitDiv = document.createElement('div');
        limitDiv.className = 'memoria-limit';
        limitDiv.textContent = ROMAN[limit];

        card.querySelector('.memoria-card-image-wrapper').appendChild(limitDiv);
    }
}

export function renderMemoriaList(data) {
    const mainContent = document.getElementById('content');

    if (!mainContent) {
        console.error("找不到 <main id='content'> 元素！");
        return;
    }

    mainContent.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'memoria-grid-container';
    container.id = 'memories-container';

    const items = Object.entries(data);

    if (items.length === 0) {
        container.innerHTML = `<p class="no-data">沒有找到符合條件的回憶</p>`;
    } else {
        items.forEach(([id, item]) => {
            const card = document.createElement('div');
            card.className = 'memoria-card';
            card.innerHTML = `
                <div class="memoria-name">${item.name || '未知名稱'}</div>
                <div class="memoria-id">ID: ${id}</div>
                <div class="memoria-roles">職業: ${item.roles ? item.roles.join(', ') : '無'}</div>
                <div class="memoria-attr">屬性: ${Array.isArray(item.attr) ? item.attr.join(', ') : (item.attr || '無')}</div>
            `;
            container.appendChild(card);
        });
    }

    mainContent.appendChild(container);
}

// 這是 toggleMemoOwned 函式，請確保它在 renderMemoriaList 函式外面
function toggleMemoOwned(id) {
    if (state.memoria.owned[id]) {
        delete state.memoria.owned[id];
    } else {
        state.memoria.owned[id] = true;
    }
}

function getMemoriaRarity(id) {

    const first = String(id)[0];

    if (first === '1') return 1; // R
    if (first === '2') return 2; // SR

    return 3; // SSR
}