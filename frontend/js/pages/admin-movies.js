(async function () {
  const user = await requireAuth('admin');
  if (!user) return;

  await loadPartial('sidebar-placeholder', '/partials/admin-sidebar.html');
  setSidebarUser(user);

  const alertBox = document.getElementById('alertBox');
  const tableWrap = document.getElementById('moviesTableWrap');
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');

  async function loadMovies(q) {
    tableWrap.innerHTML = '<p class="text-dim">Inapakia...</p>';
    try {
      const qs = q ? '?q=' + encodeURIComponent(q) : '';
      const { movies } = await apiGet('/movies/list.php' + qs);
      if (movies.length === 0) {
        tableWrap.innerHTML = `
          <div class="empty">
            <div class="big-ico" style="width:56px; height:56px; margin:0 auto 12px; color:var(--text-dim);">${FILM_ICON_SVG}</div>
            <h3>Bado hujapakia filamu yoyote</h3>
            <a href="upload-movie.html" class="btn btn-primary mt-16">Pakia Filamu ya Kwanza</a>
          </div>`;
        return;
      }
      tableWrap.innerHTML = `
        <div class="table-wrap">
          <table>
            <thead><tr><th>Filamu</th><th>Aina</th><th>Mwaka</th><th>Hali</th><th>Tarehe</th><th></th></tr></thead>
            <tbody>
              ${movies.map(m => `
                <tr>
                  <td>
                    <div class="admin-movie-row">
                      ${m.cover_url ? `<img src="${escapeHtml(m.cover_url)}" class="thumb60" alt="">` : `<div class="thumb60 noimg-thumb">${FILM_ICON_SVG}</div>`}
                      <span>${escapeHtml(m.title)}</span>
                    </div>
                  </td>
                  <td>${escapeHtml(m.genre || '—')}</td>
                  <td>${escapeHtml(m.release_year || '—')}</td>
                  <td>${movieStatusBadge(m.status)}</td>
                  <td class="text-dim">${timeAgo(m.created_at)}</td>
                  <td>
                    <div class="flex gap-8">
                      <a href="edit-movie.html?id=${m.id}" class="btn btn-outline btn-sm">Hariri</a>
                      <button class="btn btn-danger btn-sm" data-delete-id="${m.id}" data-confirm="Una uhakika unataka kufuta filamu hii?">Futa</button>
                    </div>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`;

      tableWrap.querySelectorAll('[data-delete-id]').forEach(btn => {
        btn.addEventListener('click', async function () {
          if (!confirm(btn.getAttribute('data-confirm'))) return;
          try {
            await apiPostJSON('/movies/delete.php', { id: btn.getAttribute('data-delete-id') });
            showAlert(alertBox, 'Filamu imefutwa.', 'success');
            loadMovies(searchInput.value.trim());
          } catch (e) {
            showAlert(alertBox, e.message);
          }
        });
      });
    } catch (e) {
      tableWrap.innerHTML = `<div class="alert alert-error"><span>⚠️</span> ${escapeHtml(e.message)}</div>`;
    }
  }

  searchForm.addEventListener('submit', function (e) {
    e.preventDefault();
    loadMovies(searchInput.value.trim());
  });

  loadMovies('');
})();
