export const LANG = {ZH: 'zh', EN: 'en', JP: 'jp',};
export const PAGE = { CHARACTERS: 'characters', MEMORIES: 'memories',};
export const CHAR_RARITY_FILTERS = [
  { text: '3★', value: 3 },
  { text: '2★', value: 2 },
  { text: '1★', value: 1 },
];

export const ELEMENT_FILTERS = [
  { labelKey: 'fire', zh: '火', value: 'fire', icon: 'images/attr/f.1dbf47.png' },
  { labelKey: 'ice', zh: '冰', value: 'ice', icon: 'images/attr/i.b647e3.png' },
  { labelKey: 'bolt', zh: '雷', value: 'bolt', icon: 'images/attr/l.119818.png' },
  { labelKey: 'wind', zh: '風', value: 'wind', icon: 'images/attr/w.d06628.png' },
  { labelKey: 'slash', zh: '斬', value: 'slash', icon: 'images/attr/s.42817b.png' },
  { labelKey: 'strike', zh: '打', value: 'strike', icon: 'images/attr/k.3148cc.png' },
  { labelKey: 'stab', zh: '突', value: 'stab', icon: 'images/attr/t.ac73b3.png' },
];

export const ROLE_FILTERS = [
  { labelKey: 'attacker', zh: '攻擊者', value: 'attacker', icon: 'images/role/a.52ca9a.png' },
  { labelKey: 'breaker', zh: '破防者', value: 'breaker', icon: 'images/role/b.2e7b02.png' },
  { labelKey: 'defender', zh: '防禦者', value: 'defender', icon: 'images/role/d.ab8d93.png' },
  { labelKey: 'supporter', zh: '支援者', value: 'supporter', icon: 'images/role/s.0c211b.png' },
];

export const CHAR_SORT_OPTIONS = [
  { labelKey: 'newest', value: 'newest' },
  { labelKey: 'oldest', value: 'oldest' },
];

export const SORT_OPTIONS = [
  { labelKey: 'newest', value: 'newest' },
  { labelKey: 'oldest', value: 'oldest' },
  { labelKey: 'hp', value: 'hp' },
  { labelKey: 'speed', value: 'speed' },
  { labelKey: 'patk', value: 'patk' },
  { labelKey: 'matk', value: 'matk' },
  { labelKey: 'pdef', value: 'pdef' },
  { labelKey: 'mdef', value: 'mdef' },
];

export const RARITY_FILTERS = [
  { text: 'SSR', value: 3 },
  { text: 'SR', value: 2 },
  { text: 'R', value: 1 },
];

export const BATTLEITEM_SORT_OPTIONS = [
  { labelKey: 'newest', value: 'newest' },
  { labelKey: 'oldest', value: 'oldest' },
  { labelKey: 'attack', value: 'attack' },
  { labelKey: 'buff', value: 'buff' },
  { labelKey: 'debuff', value: 'debuff' },
  { labelKey: 'heal', value: 'heal' },
];

export const EQUIP_RARITY_FILTERS = [
  { text: 'UR', value: 4, frame: 'images/ui/ur.webp' },
  { text: 'SSR', value: 3, frame: 'images/ui/ssr.webp' },
  { text: 'SR', value: 2, frame: 'images/ui/sr.webp' },
  { text: 'R', value: 1, frame: 'images/ui/r.webp' },
];

export const EQUIP_FILTERS = [
  { text: 'Weapon', value: 'weapon', icon: 'images/ui/weapon.webp'},
  { text: 'Armor', value: 'armor', icon: 'images/ui/armor.webp'},
  { text: 'Accessory', value: 'accessory', icon: 'images/ui/accessory.webp'},
];

export const EQUIP_ICON = {
  weapon: 'images/ui/weapon.webp',
  armor: 'images/ui/armor.webp',
  accessory: 'images/ui/accessory.webp',
};

export const BATTLEITEM_FILTERS = [
  { text: 'Attack', value: 1, icon: 'images/ui/attack.webp'},
  { text: 'Buff', value: 2, icon: 'images/ui/buff.webp'},
  { text: 'Debuff', value: 3, icon: 'images/ui/debuff.webp'},
  { text: 'Heal', value: 4, icon: 'images/ui/heal.webp'}
];

export const BATTLEITEM_ICON = {
  1: 'images/ui/attack.webp',
  2: 'images/ui/buff.webp',
  3: 'images/ui/debuff.webp',
  4: 'images/ui/heal.webp',
  bomb: 'images/ui/bomb.webp'
};

export const COLOR_FILTERS = [
  { text: 'blue', value: 1, icon: 'images/ui/blue.png'},
  { text: 'purple', value: 2, icon: 'images/ui/purple.png'},
  { text: 'yellow', value: 3, icon: 'images/ui/yellow.png'},
  { text: 'red', value: 4, icon: 'images/ui/red.png'},
  { text: 'green', value: 5, icon: 'images/ui/green.png'},
]

export const COLOR_PRIORITY = {
  blueFirst:[1, 2, 3, 4, 5],
  purpleFirst:[2, 3, 4, 5, 1],
  yellowFirst:[3, 4, 5, 1, 2],
  redFirst:[4, 5, 1, 2, 3],
  greenFirst:[5, 1, 2, 3, 4],
};

export const TOOL_PRIORITY = {
  aFirst:[1, 2, 3, 4],
  bFirst:[2, 3, 4, 1],
  dFirst:[3, 4, 1, 2],
  hFirst:[4, 1, 2, 3],
};

export const COLOR_ICON = {
  blue: 'images/ui/blue.png',
  purple: 'images/ui/purple.png',
  yellow: 'images/ui/yellow.png',
  red: 'images/ui/red.png',
  green: 'images/ui/green.png'
};

export const MATERIAL_TYPE = [
  { labelKey: 'normalMaterial', type: 'normal'},
  { labelKey: 'cannonMaterial', type: 'cannon'}
];

export const MATERIAL_SORT_OPTIONS = [
  {labelKey: 'newest', value: 'newest'},
  {labelKey: 'oldest', value: 'oldest'},
  {labelKey: 'bluefirst', value: 'blueFirst'},
  {labelKey: 'purplefirst', value: 'purpleFirst'},
  {labelKey: 'yellowfirst', value: 'yellowFirst'},
  {labelKey: 'redfirst', value: 'redFirst'},
  {labelKey: 'greenfirst',value: 'greenFirst',},
];

export const VIEW_MODES = [
  {labelKey: 'iconView', value: 'icon', icon: 'images/ui/icon.png'},
  {labelKey: 'tableView', value: 'table',icon: 'images/ui/table.png'},
  {labelKey: 'listView', value: 'list', icon: 'images/ui/list.png'},
];
