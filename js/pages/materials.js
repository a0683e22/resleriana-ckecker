import { state }
from '../state.js';

import { UI_TEXT }
from '../i18n.js';

import { COLOR_PRIORITY }
from '../constants.js';

export function renderMaterials() {

  const t = UI_TEXT[state.ui.currentLang];

  const content = document.getElementById('content');

  const mockData = [
  { name: 'Blue', color_id: 1,},
  { name: 'Purple', color_id: 2,},
  { name: 'Yellow', color_id: 3,},
  { name: 'Red', color_id: 4,},
  { name: 'Green', color_id: 5,},
];

  const filteredData = [...mockData];
  const priority = COLOR_PRIORITY[state.sort];
  if (priority) {filteredData.sort((a, b) => {
    const aIndex = priority.indexOf( a.color_id );
    const bIndex = priority.indexOf( b.color_id );
    return aIndex - bIndex;
  });
}
content.innerHTML = `
  <div class="page-title">${t.materials}</div>
  <div>${filteredData.map(m => `<div>${m.name}</div>`).join('')}</div>
`;
}