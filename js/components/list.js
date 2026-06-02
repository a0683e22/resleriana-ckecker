import { ELEMENT_FILTERS, ROLE_FILTERS } from '../constants.js';
import { fetchFullCharacterData, getPassive, getTrait } from '../utils/dataManager.js';
import { showPopup, hidePopup } from '../utils/pop.js';
import { state, OwnershipManager } from '../state.js';
import { UI_TEXT } from '../i18n.js';


/** * 單張資訊卡 */
function createInfoCard(character) {
    const t = UI_TEXT[state.ui.currentLang || 'zh'];
    const lang = state.ui.currentLang || 'zh';
    const elementData =
        ELEMENT_FILTERS.find(
            e => e.zh === character.element
        );

    const roleData =
        ROLE_FILTERS.find(
            r => r.zh === character.role
        );

    const leaderSkillStr = character.leader_skill ? JSON.stringify(character.leader_skill) : '';
    const isOwned = OwnershipManager.getOwned().includes(Number(character.id));
    const activeClass = isOwned ? 'active' : '';
    const imgClass = isOwned ? 'owned-img' : 'not-owned-img';
    return `

<div class="info-card char-item ${activeClass}" data-id="${character.id}">

    <!-- 左側 -->
    <div class="info-main">



        <!-- 第一列 -->
        <div class="info-top">

            <img
                class="attr-icon"
                src="${elementData?.icon || ''}"
            >

            <img
                class="role-icon"
                src="${roleData?.icon || ''}"
            >

            <div class="char-name">
                ${character.name || ''}
            </div>

        </div>



<div class="skill-row">

    ${character.leader_skill
            ? `
        <div class="leader-btn" data-leader='${JSON.stringify(character.leader_skill).replace(/'/g, "&#39;")}'>
    👑
</div>
        `
            : ''
        }

    ${(character.passive_ids || [])
            .map((id, index) => `
            <div
                class="passive-chip"
                data-passive="${id}"
            >
                ${index === 2
                    ? `6★${t.passive}`
                    : `${t.passive}${index + 1}`
                }
            </div>
        `)
            .join('')
        }

</div>






<!-- 特性 -->
<div class="trait-row">

    ${(character.toolTraits || [])
            .map(trait => {
                // 🎯 關鍵修復：將 JSON 轉字串，並把裡面的單引號替換掉，確保 HTML 不會破圖
                const safeTraitStr = JSON.stringify(trait).replace(/'/g, "&#39;");

                return `
            <div class="trait-tag tool-trait" data-trait='${safeTraitStr}'>
                🧪 ${trait[lang] || trait.zh || trait.jp}
            </div>
            `;
            })
            .join('')
        }

    ${character.equipTrait
            ? `
        <!-- 🎯 裝備特性也一樣加上 .replace(/'/g, "&#39;") -->
        <div class="trait-tag equip-trait" data-trait='${JSON.stringify(character.equipTrait).replace(/'/g, "&#39;")}'>
            ⚔️ ${character.equipTrait[lang] || character.equipTrait.zh || character.equipTrait.jp}
        </div>
        `
            : ''
        }

</div>
    </div>



    <!-- 右側 -->
    <div class="info-side">
    <img
        class="char-image ${imgClass}" 
        src="${character.image}"
        data-char-id="${character.id}"  data-has-transform="${character.has_transform ? 'true' : 'false'}" style="cursor: pointer;"
    >
    <div class="release-date">
        ${character.release_date || ''}
    </div>
</div>

</div>

`;

}
/* =========================
   整體列表
========================= */
export function createCharacterList(data) {
    return `<div class="info-card-container">
        ${data.map(createInfoCard).join('')}
    </div>`;
}

/* =========================
   隊長技能 Toggle
========================= */
document.addEventListener('click', e => {
    const toggle = e.target.closest('.leader-toggle');
    if (!toggle) return;
    const card = toggle.closest('.info-card');
    const drawer = card.querySelector('.leader-drawer');
    drawer?.classList.toggle('show');
});


