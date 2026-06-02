import { ELEMENT_FILTERS, ROLE_FILTERS } from '../constants.js';
import { fetchFullCharacterData } from '../utils/dataManager.js';
import { OwnershipManager } from '../state.js';
import { syncAllCharactersUI } from '../utils/interaction.js';

// 映射對照表 (維持不變)
const ATTR_MAP = { "火": "fire", "冰": "ice", "雷": "bolt", "風": "wind", "斬": "slash", "打": "strike", "突": "stab" };
const ROLE_MAP = { "攻擊者": "attacker", "破防者": "breaker", "防禦者": "defender", "支援者": "supporter" };

let cachedData = null;
let activeElements = [];
let activeRoles = [];

/*** 載入角色資料 ***/
export async function loadCharacters() {
    // 直接呼叫統一的載入函式，它內部已有快取機制(cachedData)，無需重複實作
    return await fetchFullCharacterData();
}

/*** 渲染表格至頁面 ***/
export function renderTable(data) {
    const container = document.getElementById('content');
    if (!container) return console.error("找不到 #content");
    container.innerHTML = createCharacterTable(data);
}

/**
 * 產生表格 HTML
 */
export function createCharacterTable(data) {
    // 預先處理資料，建立 { role: { element: [chars] } } 結構，避免巢狀迴圈中反覆 filter
    const grid = {};
    data.forEach(char => {
        const role = ROLE_MAP[char.role];
        const element = ATTR_MAP[char.element];
        if (!grid[role]) grid[role] = {};
        if (!grid[role][element]) grid[role][element] = [];
        grid[role][element].push(char);
    });

    return `
        <div class="character-table">
            <!-- 全選區塊 -->
            <div class="table-corner">
                <label class="table-toggle">
                    <input type="checkbox" id="toggle-all">
                    <span class="check-ui"></span>
                </label>
            </div>

            <!-- 頂部元素標題 -->
            ${ELEMENT_FILTERS.map(e => `
                <div class="table-header element-header" data-element="${e.value}"><img src="${e.icon}"></div>
            `).join('')}

            <!-- 各角色類別內容 -->
            ${ROLE_FILTERS.map(role => `
                <div class="table-header role-header" data-role="${role.value}"><img src="${role.icon}"></div>
                ${ELEMENT_FILTERS.map(element => {
        const chars = grid[role.value]?.[element.value] || [];
        return `
                        <div class="table-cell" data-role="${role.value}" data-element="${element.value}">
                            ${chars.map(c => renderCharacterIcon(c)).join('')}
                        </div>
                    `;
    }).join('')}
            `).join('')}
        </div>
    `;
}

/**
 * 產生單個角色圖示
 */
function renderCharacterIcon(character) {
    const charId = character.image.split('/').pop().replace('.png', '');

    // 取得持有清單與判斷
    const ownedIds = OwnershipManager.getOwned();
    const isOwned = ownedIds.includes(Number(character.id));

    // 🎯 核心修改 2：設定外層與圖片的 Class
    const activeClass = isOwned ? 'active' : '';
    const imgClass = isOwned ? 'owned-img' : 'not-owned-img';

    return `
        <div class="character-slot">
            <!-- 🎯 把 activeClass 綁定在這裡 -->
            <div class="table-character-card char-item ${activeClass}" data-id="${character.id}">
                <!-- 🎯 加入 imgClass -->
                <img class="table-char-img ${imgClass}" src="${character.image}" data-id="${charId}" title="${character.name}">
            </div>
        </div>
    `;
}


export function setupTableFilters(data) {
    const activeStates = {
        element: new Set(ELEMENT_FILTERS.map(e => e.value)),
        role: new Set(ROLE_FILTERS.map(r => r.value))
    };

    document.querySelector('.character-table').addEventListener('change', (e) => {
        const target = e.target;
        const type = target.classList.contains('element-check') ? 'element' :
            target.classList.contains('role-check') ? 'role' : null;

        if (!type) return;

        target.checked ? activeStates[type].add(target.dataset[type])
            : activeStates[type].delete(target.dataset[type]);

        applyTableFilter(data, activeStates);
    });
}

function applyTableFilter(data, activeStates) {
    const filtered = data.filter(c => {
        const matchElement = activeStates.element.has(attrMap[c.element]);
        const matchRole = activeStates.role.has(roleMap[c.role]);

        return matchElement && matchRole;
    });

    renderTable(filtered);
}

export function setupTableToggleLogic() {
    // 匯入必要的全域功能 (確保你有 import OwnershipManager 和 syncAllCharactersUI)
    // 如果這兩者在不同檔案，請確保此檔案能存取它們

    document.addEventListener('click', e => {
        // 1. 識別點擊的是元素還是職種
        const header = e.target.closest('.element-header') || e.target.closest('.role-header');
        if (!header) return;

        const type = header.classList.contains('element-header') ? 'element' : 'role';
        const value = header.dataset[type];

        // 2. 找出該範圍內所有的角色 (抓取 data-id)
        const targets = document.querySelectorAll(`.table-cell[data-${type}="${value}"] .char-item`);
        if (targets.length === 0) return;

        // 3. 判斷目標狀態：檢查這組角色是否「全亮」
        const currentOwned = OwnershipManager.getOwned();
        const areAllActive = [...targets].every(item =>
            item.dataset.id && currentOwned.includes(Number(item.dataset.id))
        );
        const targetState = !areAllActive;

        // 4. 更新資料庫 (不直接操作 class)
        targets.forEach(item => {
            const charId = Number(item.dataset.id);
            const isCurrentlyOwned = currentOwned.includes(charId);

            if (isCurrentlyOwned !== targetState) {
                OwnershipManager.toggle(charId);
            }
        });

        // 5. ⚠️ 關鍵：呼叫全域同步器，強制重繪全畫面，消滅所有幽靈 class
        // 確保你的 interaction.js 有 export 這個函數
        if (typeof syncAllCharactersUI === 'function') {
            syncAllCharactersUI();
        }
    });
}