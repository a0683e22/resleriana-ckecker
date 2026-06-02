import { createPageTitle } from '../components/pageTitle.js';
import { state, OwnershipManager } from '../state.js';
import { UI_TEXT } from '../i18n.js';
import { RenderStrategy } from '../utils/renderer.js';

export function renderCharacters() {
  const t = UI_TEXT[state.ui.currentLang];
  const content = document.getElementById('content');
  if (!content) return;

  // 1. 處理視圖狀態
  const savedView = localStorage.getItem('userViewMode');
  if (savedView) {
    state.currentView = savedView;
  }

  // 2. 資料預處理 (將 rawData 轉換為 viewData)
  const rawData = state.data || [];
  const lang = state.ui.currentLang || 'zh';
  const viewData = rawData.map(item => ({
    ...item,
    name: item.name[lang] || item.name['zh'] || "Unknown",
    element: item.attr,
    role: item["職種"],
    date: item.date || "無日期",
    rarity: getRarityById(item.id),
    image: `images/chara/${item.base_character_id}.png`
  }));
  // 3. 過濾資料 (搜尋 + 屬性 + 職種 + 稀有度)
  const filteredData = viewData.filter(char => {
    const currentSearch = state.search[state.ui.currentPage] || "";
    const searchVal = currentSearch.toLowerCase();
    const matchSearch = char.name.toLowerCase().includes(searchVal);
    const extraFilters = state.filters[state.ui.currentPage].extra || [];
    const ownedIds = OwnershipManager.getOwned();
    const viewData = state.data;
    const codeToName = { "fire": "火", "ice": "冰", "bolt": "雷", "wind": "風", "slash": "斬", "strike": "打", "stab": "突", "attacker": "攻擊者", "breaker": "破防者", "defender": "防禦者", "supporter": "支援者" };
    const activeElements = state.filters.characters.element.map(code => codeToName[code] || code);
    const activeRoles = state.filters.characters.role.map(code => codeToName[code] || code);

    const matchElement = state.filters.characters.element.length === 0 || activeElements.includes(char.element);
    const matchRole = state.filters.characters.role.length === 0 || activeRoles.includes(char.role);
    const matchRarity = state.filters.characters.rarity.length === 0 || state.filters.characters.rarity.map(Number).includes(Number(char.rarity));

    const has6StarSkills = !!(char.ev_skill1 && char.ev_skill2 && char.ev_burst);
    const match6Star = !extraFilters.includes('awaken6') || has6StarSkills;

    const matchOwned = !extraFilters.includes('owned') || ownedIds.includes(Number(char.id));

    return matchSearch && matchElement && matchRole && matchRarity && match6Star && matchOwned;
  });

  // 4. 排序資料 (根據 state.sort)
  const sortOrder = state.sorting[state.ui.currentPage] || 'newest';

  filteredData.sort((a, b) => {
    const idA = Number(a.id);
    const idB = Number(b.id);

    // 將這裡的判斷式修正為與你的 value (oldest / newest) 一致
    // 假設 'oldest' 代表舊到新，'newest' 代表新到舊
    if (sortOrder === 'oldest') {
      return idA - idB; // 舊到新
    } else {
      return idB - idA; // 新到舊 (預設)
    }
  });

  // 5. 渲染畫面
  const renderer = RenderStrategy[state.currentView] || RenderStrategy.grid;
  content.innerHTML = `
    ${createPageTitle(t.characters)}
    <div class="character-container">
      ${renderer(filteredData)}
    </div>
  `;
}


function getRarityById(id) {
  if (id === 0) return 1;
  if (id >= 1 && id <= 15) return 3;
  if (id >= 16 && id <= 25) return 2;
  if (id >= 26 && id <= 30) return 1;
  return 3; // 31以後全部視為 3★
}