export function createLanguageSelect() {
    const languages = [
        { code: 'zh', label: '繁體中文' },
        { code: 'jp', label: '日本語' },
        { code: 'en', label: 'English' }
    ];

    const options = languages.map(({ code, label }) => `
        <button class="language-option" data-lang="${code}">
            ${label}
        </button>
    `).join('');

    return `
        <div class="language-dropdown">
            <button id="language-button" class="tool-button">🌐</button>
            <div id="language-menu" class="language-menu">
                ${options}
            </div>
        </div>
    `.trim();
}