import { showPopup, hidePopup, openLinkPassive } from '../utils/pop.js';
import { state } from '../state.js';
import { formatSkillDescription } from '../utils/renderer.js';
import { getUIText } from '../i18n.js';


// ==========================================
// 1. 標籤對照表
// ==========================================
const TAG_ID_MAP = {
    "アカデミー": 1, "アーランド": 2, "コルセイト": 3, "キルヘン・ベル": 4,
    "クーケン島": 5, "「声」を聴く者たち": 6, "ランターナ": 7, "正義と探求": 8,
    "約束と協力": 9, "家族と友情": 10, "騎士": 11, "学生": 12,
    "商人": 13, "師匠": 14, "読書": 15, "料理": 16,
    "お菓子": 17, "冒険": 18, "お嬢様": 19, "メガネ": 20,
    "季節の装い": 21, "竜狩り": 22, "世話焼き": 23, "おてんば": 24,
    "ずぼら": 25, "天然": 26, "マイペース": 27, "真面目": 28,
    "ひょうきん者": 29, "寡黙": 30, "レスレリ学園": 31, "クリエイター": 32,
    "錬金党": 33, "無数島群域": 34, "アラディス調査団": 35, "ケイウン": 36,
    "九偉人": 37, "冥き追憶": 38, "ハルフェン復興隊": 39, "新星": 40,
    "ブラオール": 41
};

// ==========================================
// 2. 輔助函式：取得持有的角色 ID 陣列
// ==========================================
function getOwnedCharacterIds() {
    try {
        const stored = localStorage.getItem('activeCharacters');
        return stored ? JSON.parse(stored).map(Number) : [];
    } catch (e) {
        return [];
    }
}

// ==========================================
// 3. 輔助函式：根據文字敘述抓取「標籤」相關角色 (用於被動/隊長)
// ==========================================
function getRelatedTagCharactersHTML(description) {
    // 加上 Array.isArray(state.data) 確保資料是陣列
    if (!description || !state.data || !Array.isArray(state.data)) return '';
    const ownedIds = getOwnedCharacterIds();
    let extraHTML = '';

    for (const [tagName, tagId] of Object.entries(TAG_ID_MAP)) {
        if (description.includes(tagName)) {
            // 💡 修正 1：確保 char.tag_ids 是陣列，才使用 .includes，避免當機
            const matchedChars = state.data.filter(char =>
                char && Array.isArray(char.tag_ids) && char.tag_ids.includes(tagId)
            );

            if (matchedChars.length > 0) {
                const charImages = matchedChars.map(c => {
                    const isOwned = ownedIds.includes(Number(c.id));
                    const filterStyle = isOwned ? '' : 'filter: grayscale(100%) brightness(0.5); opacity: 0.6;';

                    const charName = typeof c.name === 'string' ? c.name : (c?.name?.zh || c?.name?.jp || '未知');

                    // 🎯 核心修改：直接拿 base_character_id 來組裝圖片網址 (記得網頁路徑要用正斜線 /)
                    // 加上 || '' 防呆，萬一沒有 base_character_id 也不會報錯
                    const charId = c.base_character_id || 'unknown';
                    const charImg = `images/chara/${charId}.png`;

                    // 備用防破圖 SVG (灰色問號方塊)
                    const fallbackImg = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2228%22%20height%3D%2228%22%3E%3Crect%20width%3D%2228%22%20height%3D%2228%22%20fill%3D%22%232d3748%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20fill%3D%22white%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%3E%3F%3C%2Ftext%3E%3C%2Fsvg%3E";

                    return `<img src="${charImg}" alt="${charName}" title="${charName}" 
                                 onerror="this.onerror=null; this.src='${fallbackImg}';"
                                 style="width: 28px; height: 28px; clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); border-radius: 4px; border: 1px solid rgba(255,255,255,0.2); object-fit: cover; ${filterStyle}">`;
                }).join('');

                extraHTML += `
                    <div style="margin-top: 12px; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 8px;">
                        <div style="font-size: 12px; color: #a0aec0; margin-bottom: 6px;">🏷️ 【${tagName}】相關角色：</div>
                        <div style="display: flex; flex-wrap: wrap; gap: 4px;">${charImages}</div>
                    </div>
                `;
            }
        }
    }
    return extraHTML;
}

// ==========================================
// 4. 輔助函式：根據點擊的特性，找出持有「相同特性」的角色 (用於裝備/道具)
// ==========================================
function getRelatedTraitCharactersHTML(traitData, isEquip) {
    if (!traitData || !state.data || !Array.isArray(state.data)) return '';
    const ownedIds = getOwnedCharacterIds();

    const matchedChars = state.data.filter(char => {
        if (!char) return false;
        if (isEquip) {
            return char.equipTrait && char.equipTrait.jp === traitData.jp;
        } else {
            // 💡 修正 1：一樣確保 toolTraits 是陣列才使用 .some
            return char.toolTraits && Array.isArray(char.toolTraits) && char.toolTraits.some(t => t.jp === traitData.jp);
        }
    });

    if (matchedChars.length === 0) return '';

    const charImages = matchedChars.map(c => {
        const isOwned = ownedIds.includes(Number(c.id));
        const filterStyle = isOwned ? '' : 'filter: grayscale(100%) brightness(0.5); opacity: 0.6;';

        const charName = typeof c.name === 'string' ? c.name : (c?.name?.zh || c?.name?.jp || '未知');

        // 🎯 核心修改：直接拿 base_character_id 來組裝圖片網址 (記得網頁路徑要用正斜線 /)
        // 加上 || '' 防呆，萬一沒有 base_character_id 也不會報錯
        const charId = c.base_character_id || 'unknown';
        const charImg = `images/chara/${charId}.png`;

        // 備用防破圖 SVG (灰色問號方塊)
        const fallbackImg = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2228%22%20height%3D%2228%22%3E%3Crect%20width%3D%2228%22%20height%3D%2228%22%20fill%3D%22%232d3748%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20fill%3D%22white%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%3E%3F%3C%2Ftext%3E%3C%2Fsvg%3E";

        return `<img src="${charImg}" alt="${charName}" title="${charName}" 
                                 onerror="this.onerror=null; this.src='${fallbackImg}';"
                                 style="width: 48px; height: 48px; clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); border-radius: 4px; border: 1px solid rgba(255,255,255,0.2); object-fit: cover; ${filterStyle}">`;
    }).join('');

    const lang = state.ui.currentLang || 'zh';
    const traitName = traitData[lang] || traitData['jp'];
    const icon = isEquip ? '⚔️' : '🧪';

    return `
        <div style="margin-top: 12px; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 8px;">
            <div style="font-size: 12px; color: #a0aec0; margin-bottom: 6px;">${icon} ${getUIText('relatedTraitCharacters', traitName)}：</div>
            <div style="display: flex; flex-wrap: wrap; gap: 4px;">${charImages}</div>
        </div>
    `;
}
// ==========================================
// 5. 核心：綁定點擊事件
// ==========================================
function ensureSkillTable() {
    if (window.skillLookupTable) return; // 有了就不用管

    // 如果沒有，現場生一個空的，防止崩潰
    window.skillLookupTable = {};
    console.warn("偵測到字典遺失，已自動補建一個空的。請檢查初始化邏輯！");
}
function findParamsInTranslation(targetId) {
    // 遍歷所有角色
    for (const charId in window.translationData) {
        const char = window.translationData[charId];
        // 檢查各個技能區塊
        for (const key in char) {
            const skill = char[key];
            // 如果 ID 對得上，且裡面有參數陣列 (假設欄位叫 params 或 values)
            if (skill && skill.skill_id == targetId && skill.params) {
                return skill.params;
            }
        }
    }
    return []; // 真的找不到就給空陣列
}

export function initInteractions() {
    document.addEventListener('click', (e) => {
        ensureSkillTable();
        const popup = document.getElementById('info-popup');

        // ======== A. 判斷是否點擊到【被動技能】 ========
        const passiveChip = e.target.closest('.passive-chip');
        if (passiveChip) {
            const abilityId = passiveChip.dataset.passive;
            const skillValueData = window.valueDatabase?.[abilityId];
            const abilityData = state.data?.meta?.abilities?.[abilityId];
            if (abilityData) {
                const chipRect = passiveChip.getBoundingClientRect();
                const lang = state.ui.currentLang || 'zh';
                const title = abilityData.name;

                // 🎯 關鍵修改處：取得原始文字並經過加工
                const rawDescription = abilityData.description?.[lang] || abilityData.description?.['zh'] || '';
                const skillParams = findParamsInTranslation(abilityId);
                const skillValueData = window.valueDatabase?.[abilityId];
                const params = skillValueData && skillValueData.effects
                    ? skillValueData.effects.map(e => e.value / 100)
                    : [];
                // 【加工流水線】：把 [passive:ID] 轉成 HTML 的 <span class="skill-link">
                const processedDescription = formatSkillDescription(rawDescription, params);

                const relatedCharsHTML = getRelatedTagCharactersHTML(rawDescription);

                const popupHTML = `
            <div style="font-weight: bold; font-size: 15px; margin-bottom: 8px; color: #f9d976; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 6px;">
                ${title}
            </div>
            <div style="font-size: 13px; line-height: 1.5; color: #e2e8f0;">
                ${processedDescription}  </div>
            ${relatedCharsHTML}
        `;
                showPopup(popupHTML, chipRect.left, chipRect.bottom + 8);
                e.stopImmediatePropagation();
            }
            return;
        }

        // ======== B. 判斷是否點擊到【隊長技能皇冠】 ========
        const leaderBtn = e.target.closest('.leader-btn');
        if (leaderBtn) {
            try {
                const leaderDataStr = leaderBtn.dataset.leader;
                if (!leaderDataStr) return;

                const leaderData = JSON.parse(leaderDataStr);
                const btnRect = leaderBtn.getBoundingClientRect();

                // 🎯 呼叫標籤輔助函式 (修正名稱)
                const relatedCharsHTML = getRelatedTagCharactersHTML(leaderData.description);

                const popupHTML = `
                    <div style="font-weight: bold; font-size: 15px; margin-bottom: 8px; color: #ff9800; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 6px;">
                        👑 ${leaderData.name}
                    </div>
                    <div style="font-size: 13px; line-height: 1.5; color: #e2e8f0;">
                        ${leaderData.description}
                    </div>
                    ${relatedCharsHTML}
                `;
                showPopup(popupHTML, btnRect.left, btnRect.bottom + 8);
                e.stopImmediatePropagation();
            } catch (error) {
                console.error("❌ 皇冠資料解析失敗：", error);
            }
            return;
        }

        // ======== C. 判斷是否點擊到【裝備/道具特性】 ========
        const traitTag = e.target.closest('.trait-tag');
        if (traitTag) {
            try {
                const traitDataStr = traitTag.dataset.trait;
                if (!traitDataStr) return;

                const traitData = JSON.parse(traitDataStr);
                const tagRect = traitTag.getBoundingClientRect();
                const lang = state.ui.currentLang || 'zh';

                const title = traitData[lang] || traitData['jp'];
                const description = traitData.description?.[lang] || traitData.description?.['jp'] || '';

                const isEquip = traitTag.classList.contains('equip-trait');
                const icon = isEquip ? '⚔️' : '🧪';
                const titleColor = isEquip ? '#ef9a9a' : '#a5d6a7';

                // 🎯 呼叫特性輔助函式
                const relatedTraitCharsHTML = getRelatedTraitCharactersHTML(traitData, isEquip);

                const popupHTML = `
                    <div style="font-weight: bold; font-size: 15px; margin-bottom: 8px; color: ${titleColor}; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 6px;">
                        ${icon} ${title}
                    </div>
                    <div style="font-size: 13px; line-height: 1.5; color: #e2e8f0;">
                        ${description}
                    </div>
                    ${relatedTraitCharsHTML}
                `;
                showPopup(popupHTML, tagRect.left, tagRect.bottom + 8);
                e.stopImmediatePropagation();
            } catch (error) {
                console.error("❌ 特性資料解析失敗：", error);
            }
            return;
        }

        // ======== D. 點擊空白處關閉 ========
        if (popup && popup.classList.contains('show') && !popup.contains(e.target)) {
            hidePopup();
        }
    });
}