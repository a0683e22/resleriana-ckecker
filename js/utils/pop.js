import { formatSkillDescription } from './renderer.js';

let popup = null;

/**
 * 初始化：建立彈出視窗並綁定全域點擊事件
 */
export function initPopup() {
    if (document.getElementById('info-popup')) return;

    popup = document.createElement('div');
    popup.id = 'info-popup';
    popup.style.position = 'absolute';
    popup.style.display = 'none';
    document.body.appendChild(popup);

    document.addEventListener('click', (event) => {
        // 【防護機制】：如果有點到主技能視窗，直接跳過，不要殺視窗
        const isInsideModal = event.target.closest('.modal-overlay');
        const isClickOnLink = event.target.closest('.skill-link');
        
        if (isInsideModal || isClickOnLink) {
            return; 
        }

        // 只有在確實點到外部時才關閉
        if (popup && popup.classList.contains('show') && !popup.contains(event.target)) {
            hidePopup();
        }
    });
}

/*** 顯示視窗並進行邊界檢測 ***/
export function showPopup(html, x, y) {
    if (!popup) return;

    popup.innerHTML = html;
    popup.style.display = 'block';
    popup.classList.add('show');
    
    // 💡 把視窗相對座標(y)轉換成網頁絕對座標
    const absoluteX = x + window.scrollX;
    const absoluteY = y + window.scrollY;

    popup.style.top = '0px';
    popup.style.left = '0px';
    
    const rect = popup.getBoundingClientRect();
    
    // 判斷是否超出螢幕（這裡用絕對位置判斷）
    let finalY = absoluteY;
    // 如果「點擊位置 - 捲動距離 + Popup高度」大於視窗高度，就往上彈
    if ((absoluteY - window.scrollY) + rect.height > window.innerHeight) {
        finalY = absoluteY - rect.height - 30;
    }

    let finalX = absoluteX;
    if (absoluteX + rect.width > window.innerWidth + window.scrollX) {
        finalX = window.innerWidth + window.scrollX - rect.width - 10;
    }

    popup.style.top = `${finalY}px`;
    popup.style.left = `${finalX}px`;
}

/*** 隱藏視窗 ***/
export function hidePopup() {
    if (!popup) return;
    popup.classList.remove('show');
    popup.style.display = 'none';
}

export function renderPopup(name, descHtml, event) {
    // 這裡我們組裝 HTML，你可以根據你的 CSS 風格調整
    const html = `
        <div class="popup-header" style="font-weight: bold; color: #feca57; margin-bottom: 8px;">
            ${name}
        </div>
        <div class="popup-body" style="font-size: 13px; color: #d0d0d0; line-height: 1.6;">
            ${descHtml}
        </div>
    `;

    // 呼叫你原本已經寫好的 showPopup 來顯示
    // event.clientX 和 event.clientY 是滑鼠點擊位置
    showPopup(html, event.clientX, event.clientY);
}





export function openLinkPassive(skillId, event) {
    // 1. 取得 Skill 字典資料 (包含原始說明文字)
    const data = window.skillLookupTable[skillId];
    if (!data) return;
    // 2. 🎯 現場抓取最新的數值 (從 valueDatabase)
    const skillValueData = window.valueDatabase?.[skillId];
    const params = skillValueData && skillValueData.effects 
        ? skillValueData.effects.map(e => e.value / 100) 
        : []; // 如果找不到數值，給個空陣列，避免程式崩潰
    // 3. 🎯 現場進行「文字」+「數值」的組裝
    // 這是最關鍵的一步：把 params 丟進去！
    const finalHTML = formatSkillDescription(data.rawDesc, params);
    // 4. 渲染
    renderPopup(data.name, finalHTML, event);
}

function findSkillInChar(obj, targetId) {
    if (!obj || typeof obj !== 'object') return null;
    if (obj.skill_id == targetId) return obj; // 找到了
    
    for (const key in obj) {
        const result = findSkillInChar(obj[key], targetId);
        if (result) return result;
    }
    return null;
}

