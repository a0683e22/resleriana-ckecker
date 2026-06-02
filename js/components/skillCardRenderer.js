import { processSkillStats, getAttrInfo, formatSkillDescription } from '../utils/renderer.js';
import { getCurrentLangText } from '../i18n.js';
import { state } from '../state.js';
/**
 * 渲染技能卡片 HTML
 * @param {Object} skill - 技能資料物件
 * @param {Object} options - 設定選項
 * @param {boolean} [options.compact=false] - 是否顯示簡潔模式
 * @param {boolean} [options.showStats=true] - 是否顯示數值統計
 * @param {string} [options.prefix=''] - 技能名稱前綴
 */

export function renderSkillCard(skill, options = {}) {
    const { compact = false, showStats = true, prefix = '' } = options;

    if (!skill?.skill_id) return '';

    // 1. 資料處理
    const v = window.valueDatabase?.[skill.skill_id];
    const stats = processSkillStats(v);
    const attrInfo = getAttrInfo(v?.attr);

    // 格式化技能描述 (將數值轉為百分比)
    const lang = state.ui.currentLang || 'zh';
    const desc = formatSkillDescription(
        skill[lang] || skill.zh,
        (v?.effects || []).map(e => e.value / 100)
    );

    // 2. 輔助生成統計標籤 (減少 HTML 樣板內的邏輯)
    const renderStatItem = (icon, value) => value
        ? `<span><img src="${icon}" class="stat-icon"> ${value}</span>`
        : '';

    const rangeIcon =
        [4, 5].includes(v?.target_type)
            ? 'images/ui/all.webp'
            : 'images/ui/single.webp';

    // 3. 回傳 HTML
    return `
        <div class="skill-card ${compact ? 'compact' : ''}">
            <div class="skill-title-row">
                <span class="skill-name">${prefix}${skill.name}</span>
                ${showStats ? `
                    <div class="skill-stats">
                        ${attrInfo.icon ? `<img src="${attrInfo.icon}" class="stat-icon">` : ''}
                        <img src="${rangeIcon}" class="stat-icon range-icon">
                        ${renderStatItem('images/ui/power2.png', stats.power)}
                        ${renderStatItem('images/ui/bpower2.png', stats.breakPower)}
                        ${renderStatItem('images/ui/heal2.png', stats.heal)}
                        ${renderStatItem('images/ui/wait2.png', stats.wait)}
                    </div>
                ` : ''}
            </div>
            <div class="skill-desc">${desc}</div>
        </div>
    `;
}