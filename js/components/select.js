import { state } from '../state.js';
import { UI_TEXT } from '../i18n.js';

export function createSelect({ id = '', options = [], value = '' }) {
  const t = UI_TEXT[state.ui.currentLang];
  return `
    <select id="${id}" class="toolbar-select">
      ${options
        .map(option => `
          <option value="${option.value}" ${option.value === value ? 'selected' : ''}>
            ${t[option.labelKey]}
          </option>
        `)
        .join('')}
    </select>
  `;
}