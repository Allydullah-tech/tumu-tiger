/**
 * TUMU TIGER — index.html page logic
 * Shows only a small preview of recently-added movies (not the whole
 * catalog) so the landing page stays short on mobile. Full browsing +
 * search happens on pages/movies.html.
 */
(async function () {
  loadPartial('navbar-placeholder', '/partials/navbar.html');
  loadPartial('footer-placeholder', '/partials/footer.html');

  const PREVIEW_COUNT = 8;
  const grid = document.getElementById('movieGrid');

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
          <a href="pages/movie.html?id=${m.id}" class="btn btn-primary btn-sm w-full mt-8">Omba Filamu Hii</a>
        </div>
      </div>`;
  }

  async function loadPreview() {
    grid.innerHTML = '<p class="text-dim">Inapakia filamu...</p>';
    try {
      const { movies } = await apiGet('/movies/list.php?limit=' + PREVIEW_COUNT);

      if (movies.length === 0) {
        grid.innerHTML = `
          <div class="empty">
            <div class="big-ico">🎬</div>
            <h3>Bado hakuna filamu zilizopakiwa</h3>
            <p class="mt-8 text-dim">Rudi hivi karibuni — tunaongeza filamu mpya kila wiki.</p>
          </div>`;
        return;
      }
      grid.innerHTML = movies.map(movieCardHTML).join('');

      const heroVisual = document.getElementById('heroVisual');
      const sample = movies.slice(0, 6);
      heroVisual.innerHTML = Array.from({ length: 6 }).map((_, i) => {
        const m = sample[i];
        return `<div class="poster">${m && m.cover_url ? `<img src="${escapeHtml(m.cover_url)}" alt="">` : FILM_ICON_SVG}</div>`;
      }).join('');
    } catch (e) {
      grid.innerHTML = `<div class="empty"><div class="big-ico">⚠️</div><h3>Imeshindwa kupakia filamu</h3><p class="text-dim mt-8">${escapeHtml(e.message)}</p></div>`;
    }
  }

  async function loadStats() {
    try {
      const { total_movies, available_movies } = await apiGet('/movies/stats.php');
      document.getElementById('statMovies').textContent = total_movies + '+';
      document.getElementById('statAvailable').textContent = available_movies + '+';
    } catch (e) {
      // Non-critical — leave placeholder values if this fails.
    }
  }

  loadPreview();
  loadStats();
})();
