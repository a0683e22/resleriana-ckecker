import { state } from '../state.js';
import { renderCharacters } from '../pages/characters.js'; 
import { renderApp } from '../router.js';
import { renderMemoriaList } from '../pages/memories.js'; 
import { renderToolbar } from '../components/toolbar.js'; 

export function loadFilterState() {
    const saved = localStorage.getItem('searchFilterState');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            state.search = parsed.search || {
    characters: '',
    memories: '',
    equipments: '',
    battleItems: '',
    materials: ''
};
            state.sorting = parsed.sorting || state.sorting;
            state.filters = { ...state.filters, ...(parsed.filters || {}) };
        } catch (e) {
            console.error('Filter restore failed:', e);
            state.filters = {}; 
        }
    } else {
        state.filters = state.filters || {};
    }
}

// 狀態儲存函式 (內部使用)
function saveFilterState() {
    localStorage.setItem(
        'searchFilterState',
        JSON.stringify({
            search: state.search,
            sorting: state.sorting,
            filters: state.filters
        })
    );
}

// =========================
// 功能 2：同步畫面與綁定事件
// (在 switchPage 畫面畫完之後呼叫)
// =========================
export function initFilterUI() {
    // A. 根據 state 將按鈕跟輸入框的狀態補上
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = state.search[state.ui.currentPage] || '';

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) sortSelect.value = state.sorting[state.ui.currentPage] || 'newest';

    document.querySelectorAll('.filter-button').forEach(btn => {
        const filter = btn.dataset.filter;
        if (filter && state.filters?.[filter]) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // B. 防止重複綁定事件
    if (window._isFilterEventsBound) return;
    window._isFilterEventsBound = true;

    // 事件監聽：排序變更
    document.addEventListener('change', (e) => {
    if (e.target.id === 'sort-select') {
        state.sorting[state.ui.currentPage] = e.target.value;
        renderApp();
    }
});

    // 事件監聽：篩選按鈕切換
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-button');
        if (!btn) return;

        const filter = btn.dataset.filter;
        if (!filter) return;

        if (!state.filters) state.filters = state.filters || {
    characters: { attr: [], rarity: [], role: [], element: [], extra: [] },
    memories:   { attr: [], rarity: [], role: [], element: [], extra: [] },
    equipments: { rarity: [], type: [], color: [] },
    battleitems:{ rarity: [], type: [], color: [] },
    materials:  { rarity: [], type: [], color: [] },
};

        state.filters[filter] = !state.filters[filter];
        btn.classList.toggle('active', state.filters[filter]);

        saveFilterState();
        renderApp();
    });

    // 事件監聽：搜尋輸入 (包含防抖動)
    let searchTimer = null;
    document.addEventListener('input', (e) => {
        if (e.target?.id === 'search-input') {
            state.search[state.ui.currentPage] = e.target.value;
            saveFilterState();

            clearTimeout(searchTimer);
            searchTimer = setTimeout(() => {
                renderCharacters();
            }, 300);
        }
    });
}


function handleFilterClick(type, value) {
    const page = state.ui.currentPage; // 獲取當前頁面
    const target = state.filters[page][type]; // 直接定位到該頁面的該屬性 [cite: 0]

    // 切換選取狀態
    if (target.includes(value)) {
        state.filters[page][type] = target.filter(v => v !== value);
    } else {
        state.filters[page][type].push(value);
    }
    
    updateUI(); // 重新渲染頁面 [cite: 0]
}


function handleSearchInput(value) {
    const page = state.ui.currentPage; // 獲取當前頁面
    state.search[page] = value;        // 只更新當前頁面的搜尋內容
    
    updateUI(); // 重新渲染 (過濾列表)
}

function getFilteredData() {
    const page = state.ui.currentPage;
    const searchText = (state.search[page] || '').toLowerCase();
    
    // 取得該頁面的原始資料物件 (從你的 state.data 轉換)
    const allItems = Object.values(state.data || {}); 
    
    return allItems.filter(item => {
        // 1. 確保 item 存在
        if (!item) return false;
        
        // 2. 獲取 name，並強制轉為字串 (String())，這樣即使它是數字也能運作
        const itemName = String(item.name || ""); 
        
        // 3. 安全地執行 toLowerCase()
        const matchesSearch = itemName.toLowerCase().includes(searchText);
        // 篩選邏輯 (例如檢查 rarity, element 等)
        const matchesFilters = true; // 這裡放你實際的篩選判斷
        
        return matchesSearch && matchesFilters;
    });
}

export function updateUI() {
    const page = state.ui.currentPage;
    
    if (page === 'characters') {
        renderCharacters(); 
    } else if (page === 'memories') {
        const filteredData = getFilteredData(); 
        renderMemoriaList(filteredData);
    }
    
    renderToolbar(page); 
}


function getMemoriaRarity(id) {
    const first = String(id)[0];

    if (first === '1') return 1; // R
    if (first === '2') return 2; // SR

    return 3; // SSR
}
