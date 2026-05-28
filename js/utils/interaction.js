import { state, OwnershipManager } from '../state.js';
import { UI_TEXT, getUIText } from '../i18n.js';
import { renderToolbar } from '../components/toolbar.js';
import { renderCharacters } from '../pages/characters.js';
import { PAGE_CONFIG } from '../config/pages.js';
import { showPopup, hidePopup } from './pop.js';
import { renderSkillModal, openSkillPreview } from '../components/skillModal.js';

export function initCharacterImageInteraction() {
    const activeIds = OwnershipManager.getOwned();
    
    document.querySelectorAll('.char-item').forEach(item => {
        const id = item.dataset.id;
        if (!id) return;
        
        const charId = Number(id);
        const isOwned = (charId === 0 || charId === 23) || activeIds.includes(charId);
        const img = item.querySelector('img');

        item.classList.toggle('active', isOwned);
        if (img) {
            if (isOwned) {
                img.classList.remove('not-owned-img');
                img.classList.add('owned-img');
            } else {
                img.classList.remove('owned-img');
                img.classList.add('not-owned-img');
            }
        }
    });

    bindGlobalClickEvents();
}

let isGlobalEventBound = false;

export function syncAllCharactersUI() {
    const ownedIds = OwnershipManager.getOwned();
    document.querySelectorAll('.char-item').forEach(el => {
        const charId = Number(el.dataset.id);
        const isOwned = (charId === 0 || charId === 23) || ownedIds.includes(charId);

        el.classList.toggle('active', isOwned);

        const img = el.querySelector('img');
        if (img) {
            img.classList.remove('owned-img', 'not-owned-img', 'is-active');
            img.classList.add(isOwned ? 'owned-img' : 'not-owned-img');
        }
    });
}

export function bindGlobalClickEvents() {
    if (window._isGlobalEventBound) return;
    window._isGlobalEventBound = true;

    const actions = {
        'reset-data': resetData,
        'reset-filter': resetFilter
    };

    document.addEventListener('click', (e) => {
        // ==========================================
        // 🎯 [加回來了！] 檢查是否點擊了「角色圖片」 (開啟技能 Modal)
        // ==========================================
        const charImage = e.target.closest('.char-image');
        if (charImage) {
            const charId = charImage.getAttribute('data-char-id');
            const imgSrc = charImage.src;
            const hasTransform = charImage.getAttribute('data-has-transform') === 'true';
            const cardContainer = charImage.closest('.info-card'); 
            const nameElement = cardContainer ? cardContainer.querySelector('.char-name') : null;
            const charName = nameElement ? nameElement.textContent.trim() : '未知角色';
            
            if (charId && typeof renderSkillModal === 'function') {
                renderSkillModal(charId, charName, imgSrc, hasTransform); 
            }
            return; // 開啟視窗後直接結束，不再往下執行取消持有的邏輯
        }

        // ==========================================
        // 🎯 [加回來了！] 檢查是否點擊了「技能連結」 (懸浮預覽)
        // ==========================================
        const skillLink = e.target.closest('.skill-link');
        if (skillLink) {
            const id = skillLink.dataset.id;
            if (typeof openSkillPreview === 'function') {
                openSkillPreview(id, e);
            }
            return;
        }

        // ==========================================
        // F. 檢查是否點擊了「全選按鈕」 (#toggle-all)
        // ==========================================
        const toggleAll = e.target.closest('#toggle-all');
        if (toggleAll) {
            const isChecked = toggleAll.checked; 
            const allItems = document.querySelectorAll('.char-item');
            
            allItems.forEach(item => {
                const charIdStr = item.dataset.id;
                if (charIdStr === undefined || charIdStr === '') return;
                const charId = Number(charIdStr);

                if (charId === 0 || charId === 23) return;

                const isCurrentlyOwned = OwnershipManager.getOwned().includes(charId);
                if (isCurrentlyOwned !== isChecked) {
                    OwnershipManager.toggle(charId);
                }
            });
            syncAllCharactersUI();
            return;
        }

        // ==========================================
        // A. 檢查是否點擊了「表頭」 (屬性/職種)
        // ==========================================
        const tableHeader = e.target.closest('.element-header, .role-header');
        if (tableHeader) {
            const type = tableHeader.classList.contains('element-header') ? 'element' : 'role';
            const value = tableHeader.dataset[type];
            const targets = document.querySelectorAll(`.table-cell[data-${type}="${value}"] .char-item`);
            
            if (targets.length > 0) {
                const currentOwned = OwnershipManager.getOwned();
                const areAllActive = [...targets].every(item => 
                    item.dataset.id && currentOwned.includes(Number(item.dataset.id))
                );
                const targetState = !areAllActive;

                targets.forEach(item => {
                    const charId = Number(item.dataset.id);
                    if (charId === 0 || charId === 23) return;

                    if (OwnershipManager.getOwned().includes(charId) !== targetState) {
                        OwnershipManager.toggle(charId);
                    }
                });
                syncAllCharactersUI();
            }
            return;
        }

        // ==========================================
        // B. 檢查是否點擊了「上方功能按鈕」 (Reset)
        // ==========================================
        const actionBtn = e.target.closest('[data-action]');
        if (actionBtn) {
            const action = actionBtn.dataset.action;
            if (actions[action]) actions[action](e);
            return;
        }

        // ==========================================
        // C. 檢查是否點擊了「單獨角色卡片」
        // ==========================================
        const charItem = e.target.closest('.char-item');
        if (charItem) {
            const protectedZones = ['.leader-btn', '.passive-chip', '.trait-tag', '.char-image'];
            if (e.target.closest(protectedZones.join(','))) return;

            const charId = Number(charItem.dataset.id);
            if (charId === 0 || charId === 23) return;

            OwnershipManager.toggle(charId);
            syncAllCharactersUI();
            return;
        }

        // ==========================================
        // D. 處理 Popup 邏輯
        // ==========================================
        const passiveChip = e.target.closest('.passive-chip');
        const leaderBtn = e.target.closest('.leader-btn');
        const traitTag = e.target.closest('.trait-tag');
        if (passiveChip || leaderBtn || traitTag) {
            if (typeof hidePopup === 'function') hidePopup();
            e.stopImmediatePropagation();
            return;
        }

        const popup = document.getElementById('info-popup');
        if (popup && popup.classList.contains('show') && !popup.contains(e.target)) {
            if (typeof hidePopup === 'function') hidePopup();
        }
    });
}

// ==========================================
// 3. 其他獨立功能模組
// ==========================================
export function getActiveIds() {
    return OwnershipManager.getOwned();
}

// ⚠️ 注意：這裡的 resetData 必須確保你已經改為保留 0 和 23 了
export const resetData = () => {
    if (!window.confirm('確定要重置所有資料嗎？(預設角色將被保留)')) return;
    window.localStorage.setItem('activeCharacters', JSON.stringify([0, 23]));
    window.location.reload();
};

export function resetFilter() {
    if (PAGE_CONFIG.characters && typeof PAGE_CONFIG.characters.render === 'function') {
        PAGE_CONFIG.characters.render(); 
    }
}

let isTableHeaderBound = false;

export function initTableHeaderInteraction() {
    if (isTableHeaderBound) return;
    isTableHeaderBound = true;

    document.addEventListener('click', function(e) {
        const tableHeader = e.target.closest('.table-header');
        if (!tableHeader) return;

        let filterType = '';
        let filterValue = '';

        if (tableHeader.hasAttribute('data-element')) {
            filterType = 'element';
            filterValue = tableHeader.getAttribute('data-element');
        } else if (tableHeader.hasAttribute('data-role')) {
            filterType = 'role';
            filterValue = tableHeader.getAttribute('data-role');
        } else {
            return;
        }
        
        const targetItems = document.querySelectorAll(`.table-cell[data-${filterType}="${filterValue}"] .char-item`);
        if (targetItems.length === 0) return;

        const areAllActive = Array.from(targetItems).every(item => item.classList.contains('active'));

        targetItems.forEach(item => {
            const charIdStr = item.dataset.id;
            if (charIdStr === undefined || charIdStr === '') return; 
            const charId = Number(charIdStr);

            if (charId === 0 || charId === 23) return;

            const isCurrentlyOwned = OwnershipManager.getOwned().includes(charId);

            if (areAllActive && isCurrentlyOwned) {
                OwnershipManager.toggle(charId);
            } else if (!areAllActive && !isCurrentlyOwned) {
                OwnershipManager.toggle(charId);
            }

            const isNowOwned = OwnershipManager.getOwned().includes(charId);
            const allElements = document.querySelectorAll(`.char-item[data-id="${charId}"]`);
            
            allElements.forEach(el => {
                el.classList.toggle('active', isNowOwned);
                const img = el.querySelector('img');
                if (img) {
                    img.classList.toggle('owned-img', isNowOwned);
                    img.classList.toggle('not-owned-img', !isNowOwned);
                }
            });
        });
    });
}