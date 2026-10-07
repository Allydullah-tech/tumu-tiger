(async function () {
  const user = await requireAuth('customer');
  if (!user) return;

  await loadPartial('sidebar-placeholder', '/partials/customer-sidebar.html');
  setSidebarUser(user);

  document.getElementById('greeting').textContent = `Habari, ${user.full_name.split(' ')[0]} 👋`;

  try {
    const { stats, recent_requests, latest_movies } = await apiGet('/stats/customer.php');

    document.getElementById('kpiTotal').textContent = stats.total_requests;
    document.getElementById('kpiPending').textContent = stats.pending_requests;
    document.getElementById('kpiAvailable').textContent = stats.available_requests;

    const recentEl = document.getElementById('recentRequests');
    if (recent_requests.length === 0) {
      recentEl.innerHTML = `
        <div class="empty">
          <div class="big-ico">📭</div>
          <h3>Bado hujafanya ombi lolote</h3>
          <p class="mt-8">Vinjari filamu zetu na uombe unayoipenda.</p>
          <a href="../movies.html" class="btn btn-primary mt-16">Vinjari Filamu</a>
        </div>`;
    } else {
      recentEl.innerHTML = `
        <div class="table-wrap">
          <table>
            <thead><tr><th>Msimbo</th><th>Filamu</th><th>Aina</th><th>Hali</th><th>Tarehe</th></tr></thead>
            <tbody>
              ${recent_requests.map(r => `
                <tr>
                  <td class="track-code">${escapeHtml(r.tracking_code)}</td>
                  <td>${escapeHtml(r.movie_title)}</td>
                  <td>${r.type === 'order' ? 'Ombi' : 'Swali'}</td>
                  <td>${statusBadge(r.status)}</td>
                  <td class="text-dim">${timeAgo(r.created_at)}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`;
    }

    const latestEl = document.getElementById('latestMovies');
    latestEl.innerHTML = latest_movies.map(m => `
      <div class="movie-card">
        <div class="movie-poster">${m.cover_url ? `<img src="${escapeHtml(m.cover_url)}" alt="${escapeHtml(m.title)}">` : `<div class="noimg">${FILM_ICON_SVG}</div>`}</div>
        <div class="movie-body">
          <h4>${escapeHtml(m.title)}</h4>
          <a href="../movie.html?id=${m.id}" class="btn btn-primary btn-sm w-full mt-8">Omba Filamu Hii</a>
        </div>
      </div>`).join('') || '<p class="text-dim">Bado hakuna filamu.</p>';
  } catch (e) {
    showAlert(document.getElementById('alertBox'), e.message);
  }
})();
