import { renderCharacters } from '../pages/characters.js';
import { renderMemories } from '../pages/memories.js';
import { renderEquipments } from '../pages/equipments.js';
import { renderbattleitems } from '../pages/battleitems.js';
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
    battleitems: {
    titleKey: 'battleitems',
    toolbar: 'battleitems',
    render: renderbattleitems,
  },
  materials: {
    titleKey: 'materials',
    toolbar: 'materials',
    render: renderMaterials,
  },
};