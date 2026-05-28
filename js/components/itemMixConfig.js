export const ITEM_MIX_UI = {
    headers: {
        combination: { zh: '組合', en: 'Combo', jp: '組合' },
        effect: { zh: '效果', en: 'Effect', jp: '効果' },
        same: { zh: '同屬上位', en: 'Same Element+', jp: '同属性上位' },
        others: { zh: '其他', en: 'Others', jp: 'その他' },
        none: { zh: '無效果', en: 'No Effect', jp: '効果なし' }
    },
    effects: [
        {
            combo: 'same',
            effect: {
                zh: '對應屬性耐性 -50%<br>在全角色合計行動10次結束前持續發動',
                en: 'Corresponding Element Resistance -50%<br>Lasts until total party actions reach 10',
                jp: '対応属性耐性 -50%<br>味方全体の合計行動回数10回まで持続'
            }
        },
        {
            combo: ['fire', 'ice'],
            effect: {
                zh: '（僅上位）技能命中率 -40%',
                en: '(High Only) Skill Accuracy -40%',
                jp: '（上位のみ）スキル命中率 -40%'
            }
        },
        {
            combo: ['fire', 'bolt'],
            effect: {
                zh: '對後方回合為強化面板時<br>→ 空面板 / 弱化面板',
                en: 'Rear buff panel converts to<br>→ Empty / Debuff Panel',
                jp: '後方強化パネル時<br>→ 空パネル / 弱化パネル'
            }
        },
        {
            combo: ['fire', 'wind'],
            effect: {
                zh: '速度 ↓ (3% / 7%)',
                en: 'SPD ↓ (3% / 7%)',
                jp: '速度 ↓ (3% / 7%)'
            }
        },
        {
            combo: ['ice', 'bolt'],
            effect: {
                zh: '受到傷害 + (50% / 100%)',
                en: 'Damage Taken + (50% / 100%)',
                jp: '被ダメージ + (50% / 100%)'
            }
        },
        {
            combo: ['ice', 'wind'],
            effect: {
                zh: '延遲 (1 / 2) 回合',
                en: 'Delay (1 / 2) Turns',
                jp: '遅延 (1 / 2) ターン'
            }
        },
        {
            combo: ['bolt', 'wind'],
            effect: {
                zh: '傷害 - (30% / 50%)',
                en: 'Damage - (30% / 50%)',
                jp: 'ダメージ - (30% / 50%)'
            }
        },
        {
            combo: 'others',
            effect: {
                zh: '無效果',
                en: 'No Effect',
                jp: '効果なし'
            }
        }
    ]
};