import { state }
from '../../state.js';

export function createSearchInput(placeholder = 'Search') {
  const value = state.search[state.ui.currentPage] || '';
  
  return `
    <input 
      type="text" 
      id="search-input" 
      class="search-input" 
      placeholder="${placeholder}" 
      value="${value}"
    >
  `.trim();
}