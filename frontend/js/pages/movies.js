(function () {
  loadPartial('navbar-placeholder', '/partials/navbar.html');
  loadPartial('footer-placeholder', '/partials/footer.html');

  const grid = document.getElementById('movieGrid');
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';
  searchInput.value = initialQuery;

  function movieCardHTML(m) {
    const cover = m.cover_url
      ? `<img src="${escapeHtml(m.cover_url)}" alt="${escapeHtml(m.title)}" loading="lazy">`
      : `<div class="noimg">${FILM_ICON_SVG}</div>`;
    return `
      <div class="movie-card">
        <div class="movie-poster">
          ${movieStatusBadge(m.status).replace('badge ', 'badge movie-badge ')}
          ${cover}
        </div>
        <div class="movie-body">
          <h4>${escapeHtml(m.title)}</h4>
          <div class="movie-meta">${escapeHtml(m.genre || 'Filamu')}${m.release_year ? ' · ' + escapeHtml(m.release_year) : ''}</div>
          <a href="movie.html?id=${m.id}" class="btn btn-primary btn-sm w-full mt-8">Omba Filamu Hii</a>
        </div>
      </div>`;
  }

  function emptyStateHTML(query) {
    const inquiryHref = 'inquiry.html' + (query ? '?title=' + encodeURIComponent(query) : '');
    return `
      <div class="empty">
        <div class="big-ico">🔍</div>
        <h3>Hakuna filamu iliyopatikana${query ? ' kwa "' + escapeHtml(query) + '"' : ''}</h3>
        <p class="mt-8">Huoni filamu unayoitafuta? Tuulize — tutakujibu haraka.</p>
        <a href="${inquiryHref}" class="btn btn-primary mt-16">Uliza Kuhusu Filamu Hii</a>
      </div>`;
  }

  async function loadMovies(query) {
    grid.innerHTML = '<p class="text-dim">Inapakia filamu...</p>';
    try {
      const qs = query ? '?q=' + encodeURIComponent(query) : '';
      const { movies } = await apiGet('/movies/list.php' + qs);
      grid.innerHTML = movies.length === 0 ? emptyStateHTML(query) : movies.map(movieCardHTML).join('');
    } catch (e) {
      grid.innerHTML = `<div class="empty"><div class="big-ico">⚠️</div><h3>Imeshindwa kupakia filamu</h3><p class="text-dim mt-8">${escapeHtml(e.message)}</p></div>`;
    }
  }

  searchForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const q = searchInput.value.trim();
    const url = new URL(window.location.href);
    if (q) url.searchParams.set('q', q); else url.searchParams.delete('q');
    window.history.replaceState({}, '', url);
    loadMovies(q);
  });

  loadMovies(initialQuery);
})();
