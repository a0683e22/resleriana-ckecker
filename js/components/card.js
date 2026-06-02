import { state, OwnershipManager } from '../state.js';
import { ATTR_ICON_MAP, ROLE_ICON_MAP } from '../utils/iconMapper.js';

export function createCharacterCard(character) {

    const charId =
        character.image
            .split('/')
            .pop()
            .replace('.png', '');

    const attrFile =
        ATTR_ICON_MAP[character.element] || 'default.png';

    const roleFile =
        ROLE_ICON_MAP[character.role] || 'default.png';

    const isOwned =
        OwnershipManager
            .getOwned()
            .includes(Number(character.id));

    // 🎯 核心修改 1：設定外層與圖片的 Class
    const activeClass = isOwned ? 'active' : '';
    const imgClass = isOwned ? 'owned-img' : 'not-owned-img';

    return `
<div class="char-card char-item ${activeClass}" data-id="${character.id}">

    <div class="char-frame">

        <div class="diamond-frame">
            <img
                src="${character.image}"
                class="char-img ${imgClass}"
                alt="${character.name}"
            >

        </div>
        	
        <div class="char-icons">

            <img
                src="images/attr/${attrFile}"
                class="char-icon icon-left"
                alt="${character.element}"
            >

            <img
                src="images/role/${roleFile}"
                class="char-icon icon-right"
                alt="${character.role}"
            >

        </div>

    </div>

    <div class="char-tooltip">

        <span class="tooltip-name">
            ${character.name}
        </span>

    </div>

</div>

`;

}