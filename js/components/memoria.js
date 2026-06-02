import { state } from '../state.js';

const SUPPORTED_LANGS = ['zh', 'en', 'jp'];
const STAT_TEXT = {
    zh: { HP: 'HP', SPD: '速度', PATK: '物攻', MATK: '魔攻', PDEF: '物防', MDEF: '魔防' },
    en: { HP: 'HP', SPD: 'SPD', PATK: 'PATK', MATK: 'MATK', PDEF: 'PDEF', MDEF: 'MDEF' },
    jp: { HP: 'HP', SPD: '素早さ', PATK: '物攻', MATK: '魔攻', PDEF: '物防', MDEF: '魔防' }
};

export function openMemoriaModal(memoria, growthData) {
    // 1. 預先建立 Growth Map (建議可移動至外部，避免重複運算)
    const currentLang = state.ui.currentLang || 'zh';
    const growthMap = Object.fromEntries(
        growthData.map(item => [item.id, item.values])
    );

    // 2. 清理舊視窗
    document.querySelector('.memoria-overlay')?.remove();

    const overlay = document.createElement('div');
    overlay.className = 'memoria-overlay';

    const modal = document.createElement('div');
    modal.className = 'memoria-modal';

    // 3. 設定 UI 內容
    const description = memoria.description?.zh || memoria.description?.en || memoria.description?.jp || '';


    modal.innerHTML = `
    <div class="memoria-modal-top">
        <div class="memoria-modal-left">
            <img 
                class="memoria-modal-image" src="${memoria.image}" alt="${memoria.name}">
            <div class="memoria-bottom-info">
                <div class="memoria-radar" id="memoria-radar"></div>
                <div class="memoria-modal-name">${memoria.name}</div>
            </div>
        </div>

        <div class="memoria-modal-right">
            <div class="memoria-level-area">
                <div class="memoria-level-text">
                    Lv <span id="memoria-level-value">1</span>
                </div>
                <input id="memoria-level-slider" class="memoria-level-slider" type="range" min="1" max="30" value="1">
            </div>

            <div class="memoria-stats" id="memoria-stats"></div>

            <div class="memoria-effect" id="memoria-effect"></div></div>
    </div>
`;

    // 4. 事件綁定
    overlay.addEventListener('click', e => e.target === overlay && overlay.remove());
    modal.addEventListener('click', e => e.stopPropagation());

    const slider = modal.querySelector('#memoria-level-slider');
    const levelText = modal.querySelector('#memoria-level-value');

    slider.addEventListener('input', e => {
        const level = Number(e.target.value);
        levelText.textContent = level;
        updateMemoriaStats(memoria, level, modal, growthMap, currentLang);
    });

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // 5. 初始化
    updateMemoriaStats(memoria, 1, modal, growthMap, currentLang);
}

const STAT_ORDER = { HP: 0, PATK: 1, PDEF: 2, SPD: 3, MATK: 4, MDEF: 5 };

function updateMemoriaStats(memoria, level, modal, growthMap, lang = 'zh') {
    const statsContainer = modal.querySelector('#memoria-stats');
    if (!statsContainer) return;

    const effect = modal.querySelector('#memoria-effect');
    if (effect) { effect.innerHTML = memoria.description?.[lang] || memoria.description?.zh || memoria.description?.en || memoria.description?.jp || ''; }

    const index = Math.max(0, level - 1);
    const ORDER = ['HP', 'PATK', 'PDEF', 'SPD', 'MATK', 'MDEF'];
    const ORDER_MAP = { HP: 0, PATK: 1, PDEF: 2, SPD: 3, MATK: 4, MDEF: 5 };

    // 1. 建立並處理數值資料
    const statList = memoria.stats.map(stat => {
        const values = growthMap[stat.growth_id] || [];
        const raw = values[index] ?? 0;

        return {
            type: stat.type,
            label: STAT_TEXT[lang]?.[stat.type] || stat.type,
            displayValue: (raw / 100).toFixed(2),
            weight: ORDER_MAP[stat.type] ?? 99
        };
    });

    // 2. 排序並生成 HTML 列表
    statList.sort((a, b) => a.weight - b.weight);

    statsContainer.innerHTML = statList.map(stat => `
        <div class="memoria-stat-box">
            <div class="memoria-stat-type">${stat.label}</div>
            <div class="memoria-stat-value">${stat.displayValue}%</div>
        </div>
    `).join('');

    // 3. 同步更新雷達圖
    renderMemoriaRadar(memoria, growthMap, modal);
}

function renderMemoriaRadar(memoria, growthMap, modal) {
    const radar = modal.querySelector('#memoria-radar');
    if (!radar) return;

    const MAX_LEVEL_IDX = 29; // 對應 30 等
    const ORDER = ['HP', 'PATK', 'MATK', 'SPD', 'MDEF', 'PDEF'];

    // 1. 計算數值比例 (歸一化)
    const rawValues = ORDER.map(type => {
        const stat = memoria.stats.find(s => s.type === type);
        if (!stat) return 0;

        const growth = growthMap[stat.growth_id] || [];
        return growth[MAX_LEVEL_IDX] || 0;
    });

    // 2. 計算當前卡片素質中的最大值 (防止除以 0，預設至少為 1)
    const maxValue = Math.max(...rawValues, 1);

    // 3. 計算比例 (將數值映射到 0~1 之間)
    const values = rawValues.map(v => v / maxValue);

    // 2. 轉換為 SVG 多邊形座標點
    const points = values.map((v, i) => {
        const angle = (-90 + i * 60) * (Math.PI / 180);
        const r = 42 * v;
        const x = 55 + Math.cos(angle) * r;
        const y = 55 + Math.sin(angle) * r;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(' ');

    // 3. 渲染 SVG
    radar.innerHTML = `
    <svg width="110" height="110" viewBox="0 0 110 110">
        <polygon
            points="55,8 92,30 92,78 55,100 18,78 18,30"
            fill="none"
            stroke="rgba(255,255,255,.18)"
            stroke-width="1.5"
        />

        <polygon
            points="${points}"
            fill="rgba(120,180,255,.35)"
            stroke="#7cc4ff"
            stroke-width="2"
        />

        <text x="55" y="7" text-anchor="middle" class="radar-label">HP</text>
        <text x="104" y="28" text-anchor="middle" class="radar-label">PA</text>
        <text x="104" y="86" text-anchor="middle" class="radar-label">MA</text>
        <text x="55" y="110" text-anchor="middle" class="radar-label">SPD</text>
        <text x="6" y="86" text-anchor="middle" class="radar-label">MD</text>
        <text x="6" y="28" text-anchor="middle" class="radar-label">PD</text>
    </svg>
`;
}

function getStatLabel(key, lang = 'zh') {
    // 檢查語系是否存在，不存在則 fallback 到 'zh'
    const targetLang = SUPPORTED_LANGS.includes(lang) ? lang : 'zh';
    return STAT_TEXT[targetLang][key] || key;
}