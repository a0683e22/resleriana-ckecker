import { state } from '../state.js';
import { switchPage } from '../router.js';
import { PAGE_CONFIG } from '../config/pages.js';
import { UI_TEXT } from '../i18n.js';

export function renderNavbar(currentPage, switchPage) {
  const t = UI_TEXT[state.ui.currentLang];
  const navbar = document.getElementById('navbar');
  const is = (page) => state.ui.currentPage === page ? 'active' : '';

  navbar.innerHTML = `
    <div class="nav-left">
      <button id="nav-characters" class="nav-button ${is('characters')}">${t.characters}</button>
      <button id="nav-memories" class="nav-button ${is('memories')}">${t.memories}</button>
    </div>
      
    <div class="nav-center">${t[PAGE_CONFIG[state.ui.currentPage].titleKey]}</div>
    <div class="nav-right">
      <button id="nav-equipments" class="nav-button ${is('equipments')}">${t.equipments}</button>
      <button id="nav-battleitems" class="nav-button ${is('battleitems')}">${t.battleitems}</button>
      <button id="nav-materials" class="nav-button ${is('materials')}">${t.materials}</button>
    </div>
  `;

  document.getElementById('nav-characters').onclick = () => switchPage('characters');
  document.getElementById('nav-memories').onclick = () => switchPage('memories');
  document.getElementById('nav-equipments').onclick = () => switchPage('equipments');
  document.getElementById('nav-battleitems').onclick = () => switchPage('battleitems');
  document.getElementById('nav-materials').onclick = () => switchPage('materials');
}