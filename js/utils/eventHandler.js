import { renderApp, renderCharacters } from '../app.js';
import { OwnershipManager, syncAllCharactersUI } from '../managers/ownership.js';
import { actions } from '../actions/actions.js';

export function initGlobalClickEvent() {
    // 1. 統一 Click 監聽
    document.addEventListener('click', (e) => {
        // A. 處理技能連結與 Popup 觸發
        const skillLink = e.target.closest('.skill-link');
        if (skillLink) {
            const id = skillLink.getAttribute('data-id');
            const type = skillLink.getAttribute('data-type');
            if (type === 'passive') { openLinkPassive(id, e); }
            else { openSkillPreview(id, e); }
            return;
        }

        // B. 處理篩選按鈕
        if (e.target.closest('.filter-button')) { renderApp(); return; }

        // C. 處理全選、表頭、功能按鈕
        if (handleOwnershipAndActions(e)) return;

        // D. 處理角色卡片互動與懸浮視窗 (Popup)
        handleCardAndPopup(e);
    });

    // 2. 統一 Change/Input 監聽
    document.addEventListener('change', (e) => {

        const currentPage = state.ui.currentPage;

        if (e.target?.id === 'sort-select') {
            state.sorting[currentPage] = e.target.value;
        }

        switch (state.ui.currentPage) {
            case 'characters':
                renderCharacters();
                break;
            case 'memories':
                renderMemories();
                break;
            case 'equipments':
                renderEquipments();
                break;
            case 'battleitems':
                renderbattleitems();
                break;
            case 'materials':
                renderMaterials();
                break;
        }
    }
});

document.addEventListener('input', (e) => {
    if (e.target.id === 'search-input') {
        state.search[state.ui.currentPage] = e.target.value;

        clearTimeout(window.searchTimer);

        window.searchTimer = setTimeout(() => {
            renderApp();
        }, 600);
    }
});

// 輔助函式：將你貼給我的邏輯分類放進來
function handleOwnershipAndActions(e) {
    // 這裡放入你第二段關於 #toggle-all, table-header, data-action 的處理邏輯
    return true;
}

function handleCardAndPopup(e) {
    // 這裡放入你第四段關於 .passive-chip, .leader-btn, .trait-tag 的邏輯
    // 以及點擊空白處關閉 popup 的邏輯
}