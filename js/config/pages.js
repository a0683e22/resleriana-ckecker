import { renderCharacters } from '../pages/characters.js';
import { renderMemories } from '../pages/memories.js';
import { renderEquipments } from '../pages/equipments.js';
import { renderBattleItems } from '../pages/battleItems.js';
import { renderMaterials } from '../pages/materials.js';

export const PAGE_CONFIG = {
  characters: {
    titleKey: 'characters',
    toolbar: 'characters',
    render: renderCharacters,
  },
  memories: {
    titleKey: 'memories',
    toolbar: 'memories',
    render: renderMemories,
  },
  equipments: {
    titleKey: 'equipments',
    toolbar: 'equipments',
    render: renderEquipments,
  },
  battleItems: {
    titleKey: 'battleItems',
    toolbar: 'battleItems',
    render: renderBattleItems,
  },
  materials: {
    titleKey: 'materials',
    toolbar: 'materials',
    render: renderMaterials,
  },
};