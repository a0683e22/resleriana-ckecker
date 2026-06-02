import { getUIText } from '../i18n.js'

/* 篩選重置按鈕 */
export function createResetButton(type) {
    return `
        <button id="clear-filters-btn" class="reset-btn filter-button" title="清除所有篩選">↺</button>
    `;
}

/* 資料重置按鈕 */
export function createDataResetButton() {
    return `
        <button class="data-reset-btn" data-action="reset-data">RESET</button>
    `;
}

/* 回憶持有狀態重置按鈕 */
export function createMemoriaResetButton() {
    return `
        <button id="reset-memoria-btn" class="filter-button float" title="${getUIText('resetMemoria')}">♻</button>
    `;
}