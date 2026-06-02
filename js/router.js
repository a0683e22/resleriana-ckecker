import { state } from './state.js';
import { renderNavbar } from './components/navbar.js';
import { renderToolbar } from './components/toolbar.js';
import { PAGE_CONFIG } from './config/pages.js';
import { initCharacterImageInteraction } from './utils/interaction.js';


export function switchPage(page) {
  state.ui.currentPage = page;

  localStorage.setItem('currentPage', page);

  renderApp();
}

export async function renderApp() {

  const config = PAGE_CONFIG[state.ui.currentPage];
  renderNavbar(state.ui.currentPage, switchPage);
  renderToolbar(config.toolbar);

  // 渲染
  await config.render();

  // 強制同步
  initCharacterImageInteraction();
}