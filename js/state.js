import { fetchFullCharacterData } from './utils/dataManager.js';

export const state = {
    // ---------------------------------
    // 介面與顯示設定 (UI/UX)
    // ---------------------------------
    ui: {
        currentPage: 'characters',
        currentTheme: 'dark',
        currentView: localStorage.getItem('userViewMode') || 'grid',
        currentLang: localStorage.getItem('site_lang') || 'zh',
    },

    // ---------------------------------
    // 搜尋 (Search) - 改為針對各頁面獨立
    // ---------------------------------
    search: {
        characters: '',
        memories: '',
        equipments: '',
        battleitems: ''
    },

    // ---------------------------------
    // 篩選規則 (Filters) - 改為針對各頁面獨立
    // ---------------------------------
    filters: {
        characters: { attr: [], rarity: [], role: [], element: [], extra: [] },
        memories: { attr: [], rarity: [], role: [], element: [], extra: [] },
        equipments: { rarity: [], type: [], color: [] },
        battleitems: { rarity: [], type: [], color: [] },
        materials: { rarity: [], color: [], type: [] }
    },

    // ---------------------------------
    // 排序規則 (Sorting)
    // ---------------------------------
    sorting: {
        characters: 'newest',
        memories: 'newest',
        equipments: 'newest',
        battleitems: 'newest',
        materials: 'newest'
    },

    // ---------------------------------
    // 應用資料 (Data/Inventory)
    // ---------------------------------
    data: [], // 原始資料陣列
    memoria: {
        owned: {}, // 已擁有的紀錄
    },
};

// 在初始化 app 時呼叫這個函數
export async function loadData() {
    state.data = await fetchFullCharacterData();
}

const LOCKED_CHARACTERS = [0, 23];

export const OwnershipManager = {
    getOwned: () => {
        const saved = JSON.parse(localStorage.getItem('activeCharacters') || '[]');
        const combined = new Set([...saved, ...LOCKED_CHARACTERS]);
        return Array.from(combined);
    },

    toggle: (id) => {
        // 如果是 0 或 23，直接擋掉
        if (LOCKED_CHARACTERS.includes(id)) return;

        // 🌟 這是上次被註解掉的核心切換邏輯，現在補回來了！
        const current = OwnershipManager.getOwned();
        const index = current.indexOf(id);
        if (index > -1) {
            current.splice(index, 1); // 已經有就移除
        } else {
            current.push(id);         // 沒有就加入
        }
        localStorage.setItem('activeCharacters', JSON.stringify(current));
    },

    setOwned: (ids) => {
        const combined = new Set([...ids, ...LOCKED_CHARACTERS]);
        localStorage.setItem('activeCharacters', JSON.stringify(Array.from(combined)));
    }
};

export const MemoriaOwnershipManager = {
    // 獲取所有已擁有的回憶資料
    getOwned: () => {
        return JSON.parse(localStorage.getItem('ownedMemoria') || '{}');
    },

    // 設定單一回憶的等級 (0-5)
    setLevel: (id, value) => {
        const current = MemoriaOwnershipManager.getOwned();
        current[id] = Math.max(0, Math.min(5, value));
        localStorage.setItem('ownedMemoria', JSON.stringify(current));
    },

    // 獲取單一回憶的等級
    getLevel: (id) => {
        const current = MemoriaOwnershipManager.getOwned();
        return current[id] || 0;
    },

    // 直接覆寫所有回憶資料
    setOwned: (data) => {
        localStorage.setItem('ownedMemoria', JSON.stringify(data));
    }
};