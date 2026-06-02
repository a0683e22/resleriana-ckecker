import { state } from '../state.js';
import { fetchFullCharacterData } from '../utils/dataManager.js';
import { createMaterialCard } from './material.js';

let traitHistory = [];
let historyIndex = -1;

export async function showTraitPopup(type, traitId, pushHistory = true) {
    const data = await fetchFullCharacterData();
    const master = type === 'equip' ? data.meta.traitMaster.equipment_tool_traits : data.meta.traitMaster.battle_tool_traits;
    const trait = master?.[traitId];

    if (!trait) return;

    if (pushHistory) {
        traitHistory = traitHistory.slice(0, historyIndex + 1);
        traitHistory.push({ type, traitId });
        historyIndex = traitHistory.length - 1;
    }

    const key = type === 'equip' ? 'equipment_tool_trait_ids' : 'battle_tool_trait_ids';
    const materials = data.meta.items.filter(item => (item[key] || []).includes(Number(traitId)));

    renderPopup(materials, trait, type, traitId, data.meta);
}

function renderPopup(materials, trait, type, traitId, meta) {
    const lang = state.ui.currentLang;
    const traitLink = `<span class="popup-trait-title" data-type="${type}" data-id="${traitId}">${trait[lang]}<span class="popup-trait-description">${trait.description[lang]}</span></span>`;
    const titles = { zh: `具備特性「${traitLink}」的素材`, jp: `特性「${traitLink}」を持つ素材`, en: `Materials with "${traitLink}"` };
    
    let popup = document.getElementById('material-trait-popup') || document.createElement('div');
    if (!popup.id) { popup.id = 'material-trait-popup'; document.body.appendChild(popup); }

    popup.innerHTML = `
        <div class="material-popup-mask">
            <div class="material-popup-window">
                <div class="material-popup-header">
                    <h2>${titles[lang]}</h2>
                    <div class="material-popup-nav">
                        <button id="trait-back" ${historyIndex <= 0 ? 'disabled' : ''}>◀</button>
                        <button id="trait-next" ${historyIndex >= traitHistory.length - 1 ? 'disabled' : ''}>▶</button>
                    </div>
                </div>
                <div class="material-popup-grid">${materials.map(i => createMaterialCard(i, meta)).join('')}</div>
            </div>
        </div>`;
            popup.querySelectorAll('.mat-box').forEach(el => { el.classList.add('popup-material'); });
            popup.querySelectorAll('.copy-name').forEach(el =>{el.classList.add('popup-name'); });
            
	const mask = popup.querySelector('.material-popup-mask');
	const windowEl = popup.querySelector('.material-popup-window');

	mask.addEventListener('click', () => { traitHistory = []; historyIndex = -1; popup.remove(); });
	windowEl.addEventListener('click', e => { e.stopPropagation(); });
    bindEvents();
}

function bindEvents() {
    document.getElementById('trait-back')?.addEventListener('click', goBack);
    document.getElementById('trait-next')?.addEventListener('click', goForward);
    document.querySelectorAll('#material-trait-popup .clickable-trait').forEach(el => { el.addEventListener('click', () => showTraitPopup(el.dataset.type, Number(el.dataset.id))); });
    const title = document.querySelector('#material-trait-popup .popup-trait-title');
    title?.addEventListener('click', e => { e.stopPropagation(); title.querySelector('.popup-trait-description') ?.classList.toggle('show'); });
}

function goBack() { if (historyIndex > 0) { historyIndex--; navigate(); } }
function goForward() { if (historyIndex < traitHistory.length - 1) { historyIndex++; navigate(); } }
function navigate() { const { type, traitId } = traitHistory[historyIndex]; showTraitPopup(type, traitId, false); }