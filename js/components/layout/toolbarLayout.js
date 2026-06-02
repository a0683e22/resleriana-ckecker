export function createToolbarLayout({
  topLeft = '',
  topRight = '',
  bottomLeft = '',
  bottomRight = '',

}) {

  return `
    <div class="toolbar-top">
      <div class="toolbar-left">
        ${topLeft}
      </div>

      <div class="toolbar-right">
        ${topRight}
      </div>
    </div>

    <div class="toolbar-bottom">

      <div class="toolbar-left">
        ${bottomLeft}
      </div>

      <div class="toolbar-right">
        ${bottomRight}
      </div>
    </div>
  `;
}