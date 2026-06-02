import { formatSkillDescription } from '../utils/renderer.js';
import { state } from '../state.js';
import { renderSkillCard } from './skillCardRenderer.js';
import { ITEM_MIX_UI } from './itemMixConfig.js';
import { ELEMENT_FILTERS } from '../constants.js';
import { UI_TEXT } from '../i18n.js';
/**
 * 渲染彈出視窗的結構外殼（HTML 字串）
 */
export function renderModalShell({ charName, charImage, hasTransform, currentStar, isTransformed, skillListHtml, has6Star }) {
    const t = UI_TEXT[state.ui.currentLang || 'zh'];
    return `
        <div class="modal-header">
            <div class="char-info">
                <img src="${charImage}" class="info-char-img" alt="${charName}">
                <h2>${charName}</h2>
            </div>
            
            ${hasTransform ? `
                <div id="btn-transform" class="btn-transform ${isTransformed ? 'inactive' : 'active'}">${t.transform}</div>
            ` : ''}
        </div>

        <div class="star-selector">
            ${[5, 6].map(star => `
                <div
                    id="bar-${star}"
                    class="star-btn ${currentStar === star ? `active-${star}` : ''} ${star === 6 && !has6Star ? 'disabled' : ''}"
                >
                    ${star}★
                </div>
            `).join('')}
        </div>

        <div class="modal-body">
            ${skillListHtml}
        </div>
    `;
}

/**
 * 初始化並顯示角色技能詳細彈窗
 */
export function renderSkillModal(charId, charName, charImage, hasTransform) {
    const charTrans = window.translationData[charId];
    if (!charTrans) return; // 若無翻譯資料則終止

    // --- 狀態初始化 ---
    let currentStar = charTrans['ev_skill1']?.skill_id ? 6 : 5; // 預設 6 星(若有進化技能)或 5 星
    let isTransformed = false; // 初始變身狀態為否
    const has6Star = !!charTrans['ev_skill1']?.skill_id; // 檢查是否有 6 星資料

    // --- 建立 DOM 容器 ---
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const container = document.createElement('div');
    container.className = 'modal-content';

    /**
     * 內部函數：根據當前狀態重新渲染內容
     */
    function updateModal() {
        const skillListHtml = generateSkillList(charId, currentStar, isTransformed);
        container.innerHTML = renderModalShell({
            charName, charImage, hasTransform, currentStar, isTransformed, skillListHtml, has6Star
        });
        bindEvents(); // 重新綁定事件
    }

    /**
     * 內部函數：為按鈕綁定互動邏輯
     */
    function bindEvents() {
        // 變身切換
        const transformBtn = container.querySelector('#btn-transform');
        transformBtn?.addEventListener('click', () => {
            isTransformed = !isTransformed;
            updateModal();
        });

        // 5 星切換
        const bar5 = container.querySelector('#bar-5');
        bar5?.addEventListener('click', () => {
            currentStar = 5;
            updateModal();
        });

        // 6 星切換
        const bar6 = container.querySelector('#bar-6');
        if (has6Star) {
            bar6?.addEventListener('click', () => {
                currentStar = 6;
                updateModal();
            });
        }
    }

    // --- 關閉彈窗邏輯 ---
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });

    // --- 掛載並首次渲染 ---
    overlay.appendChild(container);
    document.body.appendChild(overlay);
    updateModal();
}

/**
 * 根據當前狀態生成技能列表 HTML
 */
function generateSkillList(charId, star, isTransformed) {
    const charTrans = window.translationData[charId];

    // 定義各技能類型的顯示名稱
    const skillPrefixes = {
        skill1: 'Skill 1 - ',
        skill2: 'Skill 2 - ',
        burst: 'Burst - ',
        active_skill1: 'Active - ',
        transform_skill1: 'Transform Skill 1 - ',
        transform_skill2: 'Transform Skill 2 - ',
        transform_burst: 'Transform Burst - ',
        ev_skill1: 'Skill 1 - ',
        ev_skill2: 'Skill 2 - ',
        ev_burst: 'Burst - '
    };

    // 根據變身與星級狀態，決定要讀取的技能 Key 陣列
    const keys = isTransformed
        ? ['transform_skill1', 'transform_skill2', 'transform_burst']
        : (star === 6
            ? ['ev_skill1', 'ev_skill2', 'ev_burst']
            : ['skill1', 'skill2', 'burst', 'active_skill1']);

    return keys.map(key => {
        const skill = charTrans[key];
        if (!skill?.skill_id) return ''; // 若無對應技能則不渲染

        // 生成單個技能卡片
        return renderSkillCard(skill, {
            compact: false,
            showStats: true,
            prefix: skillPrefixes[key] || ''
        });
    }).join('');
}

/**
 * 顯示技能詳細預覽（懸浮小視窗）
 */
export function openSkillPreview(skillId, event) {
    const data = window.skillLookupTable?.[skillId];
    if (!data) return;

    // 清除既有的預覽視窗
    document.querySelectorAll('.link-pop').forEach(el => el.remove());

    const skill = {
        skill_id: skillId,
        name: data.name,
        zh: data.descriptions?.zh || '',
        jp: data.descriptions?.jp || '',
        en: data.descriptions?.en || ''
    };

    // 🎯 特殊判定：若 ID 為 1990499，視為特殊合成物品，需渲染側邊欄
    const isItemMix = Number(skillId) === 14003468;

    // 建立預覽視窗 DOM
    const pop = document.createElement('div');
    pop.className = 'link-pop';

    // 根據是否為合成物品，渲染不同佈局
    pop.innerHTML = `
    <div class="${isItemMix ? 'popup-layout' : ''}">
        <div class="popup-main">
            ${renderSkillCard(skill, {
        compact: true,
        showStats: true
    })}
        </div>
        ${isItemMix ? `
            <div class="popup-side">
                ${renderItemMixTable()}
            </div>
        ` : ''}
    </div>
`;

    document.body.appendChild(pop);

    // 設定固定定位，確保滾動時不會脫離視窗視角
    pop.style.position = 'fixed';

    // 設定初始位置（滑鼠右下方偏移 12px）
    let left = event.clientX + 12;
    let top = event.clientY + 12;

    // 暫時套用位置，以便瀏覽器渲染並計算元素的實際尺寸
    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;

    // 獲取渲染後的實際邊界尺寸
    const rect = pop.getBoundingClientRect();

    // 邊界檢查：若超出右邊，則翻轉至滑鼠左側顯示
    if (left + rect.width > window.innerWidth) {
        left = Math.max(12, event.clientX - rect.width - 12);
    }

    // 邊界檢查：若超出下方，則向上對齊視窗底部邊緣 (螢幕總高度 - 視窗高度 - 12px 的間距)
    if (top + rect.height > window.innerHeight) {
        top = Math.max(12, window.innerHeight - rect.height - 12);
    }

    // 套用最終修正後的座標
    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;

    // 點擊視窗外部自動關閉
    requestAnimationFrame(() => {
        document.addEventListener('click', function closePop(e) {
            if (!pop.contains(e.target)) {
                pop.remove();
                document.removeEventListener('click', closePop);
            }
        });
    });
}

function renderItemMixTable() {
    const lang = state.ui.currentLang || 'zh';

    return `
        <table class="item-mix-table">
            <tr>
                <th>${ITEM_MIX_UI.headers.combination[lang]}</th>
                <th>${ITEM_MIX_UI.headers.effect[lang]}</th>
            </tr>
            ${ITEM_MIX_UI.effects.map(item => {
        let comboHtml = '';

        // 處理不同組合類型的顯示邏輯
        if (item.combo === 'same') {
            // 同屬上位
            comboHtml = ITEM_MIX_UI.headers.same[lang];
        } else if (item.combo === 'others') {
            // 其他
            comboHtml = ITEM_MIX_UI.headers.others[lang];
        } else {
            // 具體屬性組合 (如 fire, ice)
            comboHtml = mixIcons(item.combo[0], item.combo[1]);
        }

        return `
                    <tr>
                        <td>${comboHtml}</td>
                        <td>${item.effect[lang] || item.effect.zh}</td>
                    </tr>
                `;
    }).join('')}
        </table>
    `;
}

function mixIcons(a, b) {
    const iconA = ELEMENT_FILTERS.find(e => e.value === a)?.icon || '';
    const iconB = ELEMENT_FILTERS.find(e => e.value === b)?.icon || '';

    return `
        <div class="mix-icons">
            <img src="${iconA}" class="mix-icon"><img src="${iconB}" class="mix-icon">
        </div>
    `;
}