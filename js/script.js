import { state } from './state.js';
import { UI_TEXT } from './i18n.js';
import { showRecipePopup } from './components/recipePopup.js';
import { showToast } from './components/toolbar.js';


const langData = {
    'zh': { hp: 'HP', spd: '速度', patk: '物攻', pdef: '物防', matk: '魔攻', mdef: '魔防' },
    'en': { hp: 'HP', spd: 'SPD', patk: 'P. ATK', pdef: 'P. DEF', matk: 'M. ATK', mdef: 'M. DEF' },
    'jp': { hp: 'HP', spd: '素早さ', patk: '物攻', pdef: '物防', matk: '魔攻', mdef: '魔防' }
};

const t = UI_TEXT[state.ui.currentLang];

document.addEventListener('DOMContentLoaded', function() {
    const tableHeaders = document.querySelectorAll('.table-header');

tableHeaders.forEach(header => {
    header.addEventListener('click', function() {
        let filterType = '';
        let filterValue = '';

        // 1. 判斷玩家點擊的是屬性 (element) 還是職種 (role)
        if (this.hasAttribute('data-element')) {
            filterType = 'element';
            filterValue = this.getAttribute('data-element');
        } else if (this.hasAttribute('data-role')) {
            filterType = 'role';
            filterValue = this.getAttribute('data-role');
        } else {
            return; // 預防萬一，沒有抓到屬性就中斷
        }
        
        // 2. 尋找目標：先找到符合條件的 table-cell，再找裡面的 char-item
        // 例如：選取 .table-cell[data-element="fire"] 裡面的所有 .char-item
        const targetItems = document.querySelectorAll(`.table-cell[data-${filterType}="${filterValue}"] .char-item`);
        
        if (targetItems.length === 0) return;

        // 3. 【核心邏輯】檢查這些角色是否「全部」都已經是 active (已點亮)
        const areAllActive = Array.from(targetItems).every(item => item.classList.contains('active'));

        // 4. 開始更新狀態，並同步到另一個顯示模式 (Grid)
        targetItems.forEach(item => {
            const charId = item.getAttribute('data-id');
            
            // 找出畫面上所有相同 ID 的角色 (包含 Grid 模式裡的卡片)
            const matchedItems = document.querySelectorAll(`.char-item[data-id="${charId}"]`);
            
            matchedItems.forEach(matched => {
                const img = matched.querySelector('img');
                
                if (areAllActive) {
                    // 【情況 A：原本已經全亮】 -> 玩家想要取消全選，把大家變暗
                    matched.classList.remove('active');
                    if (img) {
                        img.classList.remove('owned-img');
                        img.classList.add('not-owned-img');
                    }
                } else {
                    // 【情況 B：有角色還沒亮】 -> 玩家想要全選，強制把大家點亮
                    // 這裡使用 add，所以原本已經亮的「火屬攻擊者」依然會保持亮著，不會被切換成暗的！
                    matched.classList.add('active');
                    if (img) {
                        img.classList.remove('not-owned-img');
                        img.classList.add('owned-img');
                    }
                }
            });
        });
    });
});
});

document.addEventListener('click', e => {
    const matBox = e.target.closest('.mat-box');
    if (!matBox) return;
    if (matBox.classList.contains('popup-material')) {
        return;
    }
    const materialId = Number(matBox.dataset.materialId);

    showRecipePopup(materialId);
});


document.addEventListener('click', async (e) => {
    const nameBox = e.target.closest('.copy-name');
    if (!nameBox) return;

    const name = nameBox.dataset.name;

    try {
        await navigator.clipboard.writeText(name);

        const copiedText = { zh: `已複製 ${name}`, en: `${name} copied`,  jp: `${name}をコピーしました` };

        showToast( copiedText[state.ui.currentLang] || `${name} copied` );

    } catch {
        showToast(
            UI_TEXT[state.ui.currentLang]?.copyFail || 'Failed'
        );
    }
});