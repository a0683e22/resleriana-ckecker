import { state } from './state.js';

export function getCurrentLangText(data, fallback = '') {

  const lang = state.ui.currentLang || 'zh';
  return (data?.[lang] || data?.zh || fallback);
}

export const UI_TEXT = {
  zh: {
    characters: '角色',
    iconView: '圖示',
    tableView: '表格',
    listView: '資訊卡',
    memories: '回憶',
    equipments: '裝備',
    battleitems: '戰鬥道具',
    materials: '素材',
    owned: '持有',
    searchCharacters: '搜尋角色',
    searchMemories: '搜尋回憶',
    searchEquipments: '搜尋裝備',
    searchbattleitems: '搜尋戰鬥道具',
    hp: 'HP',
    speed: '速度',
    patk: '物攻',
    matk: '魔攻',
    pdef: '物防',
    mdef: '魔防',
    attack: '攻擊 優先',
    buff: '強化 優先',
    debuff: '弱體 優先',
    heal: '回復 優先',
    newest: '新→舊',
    oldest: '舊→新',
    bluefirst: '藍 優先',
    purplefirst: '紫 優先',
    yellowfirst: '黃 優先',
    redfirst: '紅 優先',
    greenfirst: '綠 優先',
    copySuccess: '已複製持有狀態連結',
    copyFail: '複製失敗',
    transform: '變身',
    relatedTraitCharacters: '具備【{0}】的角色',
    passive: '被動',
    resetConfirm: '確定要重置所有資料嗎？',
    resetMemoria: '重置回憶持有狀態',
    event_equip: '活動獎勵',
    shop_equip: '商城購買',
    noEffect: '無效果',
    recipetitle: '使用此素材的配方',
    norecipeusage: '無配方需求',
    normalMaterial: '一般素材',
    cannonMaterial: '工房砲素材'
  },
  en: {
    characters: 'Characters',
    iconView: 'Grid',
    tableView: 'Table',
    listView: 'InfoCard',
    memories: 'Memories',
    equipments: 'Equipment',
    battleitems: 'Battle Items',
    materials: 'Materials',
    owned: 'Owned',
    searchCharacters: 'Search Characters',
    searchMemories: 'Search Memoria',
    searchEquipments: 'Search Equipments',
    searchbattleitems: 'Search battleitems',
    hp: 'HP',
    speed: 'SPD',
    patk: 'P.ATK',
    matk: 'M.ATK',
    pdef: 'P.DEF',
    mdef: 'M.DEF',
    attack: 'Attack First',
    buff: 'Buff First',
    debuff: 'Debuff First',
    heal: 'Heal First',
    newest: 'Newest',
    oldest: 'Oldest',
    bluefirst: 'Blue First',
    purplefirst: 'Purple First',
    yellowfirst: 'Yellow First',
    redfirst: 'Red First',
    greenfirst: 'Green First',
    copySuccess: 'Link copied!',
    copyFail: 'Copy failed',
    transform: 'Transform',
    relatedTraitCharacters: 'Characters with 【{0}】',
    passive: 'Passive',
    resetConfirm: 'Reset all data?',
    resetMemoria: 'Reset memoria ownership',
    event_equip: 'Event Reward',
    shop_equip: 'Shop Purchased',
    noEffect: 'No Effect',
    recipetitle: 'Recipes Using This Material',
    norecipeusage: 'No Recipe Usage',
    normalMaterial: 'Normal Materials',
    cannonMaterial: 'Cannon Materials'
  },
  jp: {
    characters: 'キャラ',
    iconView: 'アイコン',
    tableView: '表',
    listView: '情報',
    memories: 'メモリア',
    equipments: '装備',
    battleitems: '戦闘アイテム',
    materials: '素材',
    owned: '所持',
    searchCharacters: 'キャラ検索',
    searchMemories: 'メモリア検索',
    searchEquipments: '装備検索',
    searchbattleitems: '戦闘アイテム検索',
    hp: 'HP',
    speed: '素早さ',
    patk: '物攻',
    matk: '魔攻',
    pdef: '物防',
    mdef: '魔防',
    attack: '攻撃 優先',
    buff: '強化 優先',
    debuff: '弱体 優先',
    heal: '回復 優先',
    newest: '新→旧',
    oldest: '旧→新',
    bluefirst: '青 優先',
    purplefirst: '紫 優先',
    yellowfirst: '黄 優先',
    redfirst: '赤 優先',
    greenfirst: '緑 優先',
    copySuccess: '所有状況のリンクをコピーしました',
    copyFail: 'コピーに失敗しました',
    transform: '変身',
    relatedTraitCharacters: '【{0}】を持つキャラ',
    passive: 'パッシブ',
    resetConfirm: 'すべてのデータをリセットしますか？',
    resetMemoria: 'メモリア所持状態をリセット',
    event_equip: 'イベント報酬',
    shop_equip: 'ショップ販売',
    noEffect: '効果なし',
    recipetitle: 'この素材を使用するレシピ',
    norecipeusage: '配方需要なし',
    normalMaterial: '一般素材',
    cannonMaterial: 'アトリエ砲素材'
  },
};

export function getUIText(key, ...params) {
  // 獲取當前語言，預設為 'zh'
  const lang = state.ui.currentLang || 'zh';

  // 優先從當前語言獲取，若無則降級為 'zh'，最後若都沒找到則回傳 key 本身
  let text = UI_TEXT?.[lang]?.[key]
    || UI_TEXT?.zh?.[key]
    || key;

  // 依序替換文字中的 {0}, {1}... 佔位符
  params.forEach((value, index) => {
    text = text.replace(`{${index}}`, value);
  });

  return text;
}