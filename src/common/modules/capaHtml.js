export { capaHtml };

function capaHtml(url, emoji, classe) {
  if (url) {
    return `
            <div class="book-cover">
                <img
                    src="${esc(url)}"
                    alt=""
                    loading="lazy"
                    referrerpolicy="no-referrer"
                >
            </div>
        `;
  }

  return `
        <div class="book-cover ${classe}">
            ${emoji}
        </div>
    `;
}
