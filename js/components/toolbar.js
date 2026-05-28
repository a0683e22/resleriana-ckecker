import { state } from '../state.js';
import { renderApp } from '../router.js';
import { 
  CHAR_RARITY_FILTERS, 
  ELEMENT_FILTERS, 
  ROLE_FILTERS, 
  CHAR_SORT_OPTIONS,
  SORT_OPTIONS, 
  RARITY_FILTERS,
  EQUIP_RARITY_FILTERS,
  EQUIP_FILTERS,
  BATTLEITEM_FILTERS,
  BATTLEITEM_SORT_OPTIONS,
  COLOR_FILTERS,
  MATERIAL_TYPE,
  MATERIAL_SORT_OPTIONS,
  VIEW_MODES,
} from '../constants.js';

import { fetchFullCharacterData } from '../utils/dataManager.js'
import { renderMemories } from '../pages/memories.js';
import { compressIds, compressMemoria } from '../utils/compress.js';
import { UI_TEXT, getUIText } from '../i18n.js';
import { createResetButton, createDataResetButton, createMemoriaResetButton } from './button.js';
import { createSearchInput } from './filters/searchInput.js';
import { createFilterButton } from './filters/filterButton.js';
import { createToolbarLayout } from './layout/toolbarLayout.js';
import { createSelect } from './select.js';
import { createThemeButton } from './themeButton.js';
import { createLanguageSelect } from './createlanguageSelect.js';



const currentPage = state.ui.currentPage;
const currentFilters = state.filters[currentPage];

function createCopyLinkButton() {
  return `<button id="copy-link-btn" class="filter-button float" title="複製持有狀態連結">🔗</button>`;
}

function createCopyMemoriaButton() {
    return `
        <button
            id="copy-memo-btn"
            class="filter-button float memoria-share"
            title="複製回憶持有狀態連結">
            🔗
        </button>
    `;
}
export function renderToolbar(toolbarType) {
  const t = UI_TEXT[state.ui.currentLang];
  const toolbar = document.getElementById('toolbar');
  const page = toolbarType;
  const currentFilters = state.filters[page] || { rarity: [], role: [], element: [], extra: [] };
  
  
  if (toolbarType === 'characters') {
    toolbar.innerHTML = createToolbarLayout({
      topLeft: `${createSearchInput(t.searchCharacters)}${createSelect({ id: 'sort-select', options: CHAR_SORT_OPTIONS, value:state.sorting[state.ui.currentPage] })}`,
      topRight: `${createCopyLinkButton()}${createFilterButton('6★', 'awaken6', currentFilters.extra.includes('awaken6'), 'extra', '','float')}${createFilterButton(t.owned,'owned', currentFilters.extra.includes('owned'), 'extra', '', 'float')}${createDataResetButton()}${createLanguageSelect()}${createThemeButton()}`,
      bottomLeft: [...CHAR_RARITY_FILTERS.map(f => createFilterButton(f.text, f.value, currentFilters.rarity.includes(Number(f.value)), 'rarity')),
                   ...ELEMENT_FILTERS.map(f => createFilterButton(f.text, f.value, currentFilters.element.includes(f.value), 'element', f.icon)),
                   ...ROLE_FILTERS.map(f => createFilterButton(f.text, f.value, currentFilters.role.includes(f.value), 'role', f.icon)),createResetButton()].join(''),
      bottomRight:VIEW_MODES.map(v => createFilterButton(v.labelKey, v.value, state.currentView === v.value, 'view', v.icon, 'float')).join(''),})
  } else if (toolbarType === 'memories') {
    toolbar.innerHTML = createToolbarLayout({
      topLeft: `${createSearchInput(t.searchMemories)}${createSelect({ id: 'sort-select', options: SORT_OPTIONS, value:state.sorting[state.ui.currentPage] })}`,
      topRight: `${createCopyMemoriaButton()}${createMemoriaResetButton()}${createLanguageSelect()}${createThemeButton()}`,
      bottomLeft: [...RARITY_FILTERS.map(f => createFilterButton(f.text, f.value, currentFilters.rarity.includes(f.value), 'rarity')),
                   ...ELEMENT_FILTERS.map(f => createFilterButton(f.text, f.value, currentFilters.element.includes(f.value), 'element', f.icon)),
                   ...ROLE_FILTERS.map(f => createFilterButton(f.text, f.value, currentFilters.role.includes(f.value), 'role', f.icon))].join(''),
      bottomRight: `${createFilterButton( t.owned, 'owned', (currentFilters.extra || []).includes('owned'), 'extra', '', 'float' )}`,});
  } else if (toolbarType === 'equipments') {
    toolbar.innerHTML = createToolbarLayout({
    	 topLeft: `${createSearchInput(t.searchEquipments)}${createSelect({ id: 'sort-select', options: SORT_OPTIONS, value:state.sorting[state.ui.currentPage] })}`,
    	 topRight: `${createLanguageSelect()}${createThemeButton()}`,
    	 bottomLeft: [...EQUIP_RARITY_FILTERS.map(f => createFilterButton(f.text, f.value, currentFilters.rarity.includes(f.value), 'rarity')),
                   ...EQUIP_FILTERS.map(f => createFilterButton(f.text, f.value, currentFilters.element.includes(f.value), 'equip', f.icon)),
                   ...COLOR_FILTERS.map(f => createFilterButton(f.text, f.value, currentFilters.element.includes(f.value), 'color', f.icon))].join('')});
} else if (toolbarType === 'battleItems') {
    toolbar.innerHTML = createToolbarLayout({
    	 topLeft: `${createSearchInput(t.searchBattleItems)}${createSelect({ id: 'sort-select', options: BATTLEITEM_SORT_OPTIONS, value:state.sorting[state.ui.currentPage] })}`,
    	 topRight: `${createLanguageSelect()}${createThemeButton()}`,
    	 bottomLeft: [...RARITY_FILTERS.map(f => createFilterButton(f.text, f.value, currentFilters.rarity.includes(f.value), 'rarity')),
                   ...BATTLEITEM_FILTERS.map(f => createFilterButton(f.text, f.value, currentFilters.element.includes(f.value), 'battleItem', f.icon)),
                   ...COLOR_FILTERS.map(f => createFilterButton(f.text, f.value, currentFilters.element.includes(f.value), 'color', f.icon))].join(''),});
}
else if (toolbarType === 'materials') {
    toolbar.innerHTML = createToolbarLayout({
    	 topLeft: `${MATERIAL_TYPE.map(f =>createFilterButton(f.text,f.type,currentFilters.rarity.includes(f.type), 'type' )).join('')}${createSelect({id: 'sort-select', options:MATERIAL_SORT_OPTIONS, value:state.sorting[state.ui.currentPage]})}`,
    	 topRight: `${createLanguageSelect()}${createThemeButton()}`,
    	  bottomLeft: [...RARITY_FILTERS.map(f => createFilterButton(f.text, f.value, currentFilters.rarity.includes(f.value), 'rarity')),
                   ...COLOR_FILTERS.map(f => createFilterButton(f.text, f.value, currentFilters.element.includes(f.value), 'color', f.icon))].join(''),});
}

  bindFilterButtons();
  setupSearchInput();
}

// 搜尋輸入處理（獨立出來，避免重複宣告）
function setupSearchInput() {
  const input = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');

  if (sortSelect) { 
    sortSelect.onchange = (event) => { 
      state.sorting[ state.ui.currentPage ] = event.target.value;
      renderApp();
    }; 
  }

  if (!input) return;

  input.oninput = (e) => {
    state.search[state.ui.currentPage] = e.target.value;
    
    // 移除 input 內部的 renderApp() 與 focus() 強制重設
    // 使用防抖動機制
    clearTimeout(window.searchTimer);
    window.searchTimer = setTimeout(() => {
      renderApp();
      // 渲染後重新聚焦（確保選擇正確）
      const el = document.getElementById('search-input');
      el?.focus();
    }, 600);
  };
}

export function bindFilterButtons() {
    const toolbar = document.getElementById('toolbar');
    if (!toolbar) return;

    toolbar.onclick = (e) => {
        // 1. 優先處理【複製連結】
        if (e.target.closest('#copy-link-btn')) {
            handleCopyLink();
            return;
        }
        if (e.target.closest('#copy-memo-btn')) {
            handleCopyMemoriaLink();
            return;
        }

        // 2. 清除篩選
        if (e.target.closest('#clear-filters-btn')) {
        	const page = state.ui.currentPage;
            state.filters[page] = {
                attr: [],
                rarity: [],
                role: [],
                element: [],
                extra: []
                };

            document.querySelectorAll('.filter-button').forEach(btn => {
                btn.classList.remove('active');
            });

            renderApp();
            return;
        }

        // 3. 重置回憶持有狀態
        if (e.target.closest('#reset-memoria-btn')) {
            localStorage.removeItem('ownedMemoria');
            state.memoria.owned = {};
            renderMemories();
            return;
        }

        // 4. 處理【篩選器】與【View Mode】
        const filterBtn = e.target.closest('.filter-button');
        if (filterBtn) {
            const { filterType, filter: val } = filterBtn.dataset;

            if (filterType === 'view') {
                state.currentView = val;
                localStorage.setItem('userViewMode', val);
            } else if (filterType === 'extra') {
                const page = state.ui.currentPage;
                const arr = state.filters[page].extra || [];
                state.filters[page].extra = arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
                filterBtn.classList.toggle('active', state.filters[page].extra.includes(val));
            } else {
                const value = filterType === 'rarity' ? Number(val) : val;
                const page = state.ui.currentPage;
                const arr = state.filters[page][filterType] || [];
                state.filters[page][filterType] = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
                filterBtn.classList.toggle('active', state.filters[page][filterType].includes(value));
            }
            renderApp();
            return;
        }

        // 5. 處理【語言選單】
        if (e.target.closest('#language-button')) {
            document.getElementById('language-menu')?.classList.toggle('show');
            return;
        }

        const langOpt = e.target.closest('.language-option');
        if (langOpt) {
            const newLang = langOpt.dataset.lang;
            state.ui.currentLang = newLang;
            localStorage.setItem('site_lang', newLang);
            document.getElementById('language-menu')?.classList.remove('show');
            renderApp();
            return;
        }

        // 6. 處理【主題切換】
        if (e.target.closest('#theme-toggle')) {
            const isSoft = document.body.classList.toggle('theme-soft');
            e.target.innerHTML = isSoft ? '🌙' : '💡';
            return;
        }
    };
}

function handleCopyLink() {
    const activeIds = JSON.parse(localStorage.getItem('activeCharacters') || '[]');
    const encodedData = compressIds(activeIds);
    const shareUrl = `${window.location.origin}${window.location.pathname}?data=${encodedData}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
        showToast(getUIText('copySuccess'));
    }).catch(err => console.error('複製失敗:', err));
}

async function handleCopyMemoriaLink() {
    try {
        const { meta } = await fetchFullCharacterData();
        const encodedData = compressMemoria(state.memoria.owned, meta.memoria);
        
        const shareUrl = new URL(window.location.href);
        shareUrl.searchParams.set('memo', encodedData);

        await navigator.clipboard.writeText(shareUrl.toString());
        showToast(getUIText('copySuccess'));
    } catch (err) {
        console.error('複製失敗:', err);
    }
}

export function showToast(message, duration = 2000) {
  const toast = document.createElement('div');
  toast.textContent = message;

  // 統一管理樣式設定
  Object.assign(toast.style, {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'rgba(20,20,20,0.92)',
    color: '#fff',
    padding: '16px 28px',
    borderRadius: '14px',
    fontSize: '18px',
    fontWeight: '600',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
    zIndex: '9999',
    opacity: '0',
    transition: 'opacity 0.2s ease',
    pointerEvents: 'none' // 避免 Toast 阻擋滑鼠點擊
  });

  document.body.appendChild(toast);

  // 觸發淡入
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
  });

  // 處理淡出與移除
  const fadeOutTime = 200;
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), fadeOutTime);
  }, duration);
}