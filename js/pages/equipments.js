import { state }
from '../state.js';

import { UI_TEXT }
from '../i18n.js';

export function renderEquipments() {

  const t = UI_TEXT[state.ui.currentLang];

  const content = document.getElementById('content');

  content.innerHTML = `

    <div class="page-title">
      ${t.equipments}
    </div>

  `;

}