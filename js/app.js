import { state, OwnershipManager, MemoriaOwnershipManager } from './state.js';
import { switchPage, renderApp } from './router.js';
import { initCharacterImageInteraction, initTableHeaderInteraction } from './utils/interaction.js';
import { fetchFullCharacterData } from './utils/dataManager.js';
import { initPopup } from './utils/pop.js';
import { initInteractions } from './components/passive.js';
import { bindFilterButtons } from './components/toolbar.js';
import { loadFilterState, initFilterUI, updateUI } from './utils/sandf.js';
import { decompressIds, decompressMemoria } from './utils/compress.js';

async function init() {
  try {
    // 🎯 0. 讀取並設定語言 (取代原本在外面的 DOMContentLoaded)
    const savedLang = localStorage.getItem('site_lang') || 'zh';
    state.ui.currentLang = savedLang;

    // 1. 初始化 DOM 互動事件
    initCharacterImageInteraction();
    initPopup();
    initInteractions(); // 如果這是被動技能的互動，保留無妨

const savedPage = localStorage.getItem('currentPage');
if (savedPage) { state.ui.currentPage = savedPage; }

    // 2.1 先讀取 LocalStorage 中的篩選狀態
    if (typeof loadFilterState === 'function') loadFilterState(); 

    // 2.2 讀取並解析 URL 中的配置資料 (優先權最高)
    await initFromUrl();

    // 3. 載入並快取所有角色與道具核心資料
    state.data = await fetchFullCharacterData();

    // 4. 建構技能快速查詢表與被動索引 (確保在畫面渲染前，資料字典已備妥)
    buildPassiveIndex();
    buildSkillLookupTable();

    // 5. 首次全局渲染 App (取代原本 DOMContentLoaded 裡的 renderApp)
    renderApp();

    // 6. 初始化表格標頭互動與綁定篩選 UI 狀態
    initTableHeaderInteraction();
    bindFilterButtons();
    if (typeof initFilterUI === 'function')
{initFilterUI();}

  } catch (error) {
    console.error('資料載入失敗:', error);
  }
}

// ==========================================
// 系統初始化相關工具函數
// ==========================================
export async function initFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const chardata = params.get('data');
    const memo = params.get('memo');
    
    if (memo) {
    	
    try {
    	state.filters.memories.extra = ['owned'];
        state.ui.currentPage = 'memories';
        const fullData = await fetchFullCharacterData();
        const decoded = decompressMemoria(memo, fullData.meta.memoria);
        state.memoria.owned = decoded;
        setTimeout(() => { renderApp(); }, 0);
    } catch (e) {
        console.error('回憶網址解析失敗:', e);
    }
}
    if (chardata) {
        try {
            // 🌟 直接使用解壓縮函數還原成陣列
            const decodedIds = decompressIds(chardata);
            
            // 存入 localStorage
            localStorage.setItem('activeCharacters', JSON.stringify(decodedIds));
            
            // 更新狀態管理器
            if (OwnershipManager) {
                OwnershipManager.setOwned(decodedIds);
            }

            // 清除網址列參數
            window.history.replaceState({}, document.title, window.location.pathname);
        } catch (e) {
            console.error("網址資料解析失敗:", e);
        }
    }
}

// ==========================================
// 資料字典建構函數 (未來可考慮移至 dataBuilder.js)
// ==========================================
window.passiveSkillMap = {};

function buildPassiveIndex() {
    for (const id in window.abilitiesDatabase) {
        const ability = window.abilitiesDatabase[id];
        const desc = ability.description.zh; 
        const regex = /\[passive:(\d+)\]/g;
        
        let match;
        while ((match = regex.exec(desc)) !== null) {
            const passiveId = match[1];
            window.passiveSkillMap[passiveId] = {
                name: ability.name,
                desc: ability.description.zh
            };
        }
    }
}

function buildSkillLookupTable() {
    window.skillLookupTable = {};
    const targetKeys = ['passive_skill', 'in_skill1', 'in_skill2', 'ex_skill', 'count_skill'];

    for (const charId in window.translationData) {
        const char = window.translationData[charId];
        
        targetKeys.forEach(key => {
            const skill = char[key];
            if (skill && skill.skill_id) {
                const id = skill.skill_id;
                window.skillLookupTable[id] = {
                    name: skill.name,
                    descriptions: {
                        zh: skill.zh || '',
                        jp: skill.jp || '',
                        en: skill.en || ''
                    },
                    params: (window.valueDatabase?.[id]?.effects || []).map(e => e.value / 100),
                    charId: charId
                };
            }
        });
    }
}

// 執行應用程式初始化
init();




// 當監聽器發現使用者切換到 "memories" 頁面時：
function onPageChange(pageName) {
    if (pageName === 'memories') {
        // 直接觸發回憶專家的初始化函數
        initMemoriesPage();
    }
}


window.handleFilterClick = function(type, value) {
    const page = window.state.ui.currentPage; // 獲取當前頁面 ('characters' 或 'memories')
    const targetValue = window.state.filters[page][type]
    // 1. 強制初始化整個頁面的篩選器物件 (如果遺失)
    if (!state.filters[page]) {
        state.filters[page] = { attr: [], rarity: [], role: [], element: [], extra: [] };
    }

    // 2. 強制初始化該類型陣列 (如果遺失)
    if (!state.filters[page][type] || !Array.isArray(state.filters[page][type])) {
        state.filters[page][type] = [];
    }

    // 3. 現在路徑絕對存在，執行篩選切換
    const target = state.filters[page][type];
    
    if (target.includes(value)) {
        state.filters[page][type] = target.filter(v => v !== value);
    } else {
        state.filters[page][type].push(value);
    }

    // 4. 重新渲染
    if (typeof updateUI === 'function') {
        updateUI(); 
    }
};