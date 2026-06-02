import { state } from '../../state.js';
import { UI_TEXT } from '../../i18n.js';

export function createFilterButton(text, value, active = false, filterType = 'element', icon = '', variant = 'default') {
  const t = UI_TEXT[state.ui.currentLang];

  // 1. 處理 Class List 的邏輯分離
  const classList = ['filter-button', variant, icon && 'icon-button', active && 'active', filterType === 'view' && 'view-button'].filter(Boolean).join(' ');

  // 2. 處理內部內容的邏輯分離
  const getButtonContent = () => {
    if (!icon) return text;
    const isLargeIcon = ['equip', 'battleitem'].includes(filterType);
    const iconHtml = `<img src="${icon}" class="filter-icon ${isLargeIcon ? 'large-icon' : ''}">`;

    return filterType === 'view'
      ? `${iconHtml}<span>${t[text]}</span>`
      : iconHtml;
  };

  // 3. 回傳最終樣板字串
  return `
    <button class="${classList}" data-filter-type="${filterType}" data-filter="${value}">${getButtonContent()}</button>
  `;
}


function filterCharacters(characters, filters) {
  return characters.filter(char => {
    // 1. 6★ 篩選邏輯 (你剛才提到的)
    if (filters.extra.includes('awaken6')) {
      const has6Star = char.ev_skill1 && char.ev_skill2 && char.ev_burst;
      if (!has6Star) return false;
    }

    // 2. 稀有度篩選 (Rarity)
    if (filters.rarity && filters.rarity.length > 0) {
      if (!filters.rarity.includes(char.rarity)) return false;
    }

    // 3. 屬性篩選 (Element)
    if (filters.attr && filters.attr.length > 0) {
      if (!filters.attr.includes(char.attr)) return false;
    }

    // 4. 職種篩選 (Role)
    if (filters.role && filters.role.length > 0) {
      if (!filters.role.includes(char.職種)) return false;
    }

    return true; // 通過所有篩選
  });
}