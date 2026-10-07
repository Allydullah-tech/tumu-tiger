(async function () {
  const user = await requireAuth('admin');
  if (!user) return;

  await loadPartial('sidebar-placeholder', '/partials/admin-sidebar.html');
  setSidebarUser(user);

  const alertBox = document.getElementById('alertBox');
  const formCard = document.getElementById('formCard');
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) { window.location.href = 'movies.html'; return; }

  try {
    const { movie } = await apiGet('/movies/get.php?id=' + encodeURIComponent(id));
    document.getElementById('subTitle').textContent = `Sasisha taarifa za "${movie.title}".`;

    formCard.innerHTML = `
      ${movie.cover_url ? `<img src="${escapeHtml(movie.cover_url)}" style="width:140px; border-radius:10px; margin-bottom:18px;">` : ''}
      <form id="editForm" enctype="multipart/form-data">
        <div class="form-group">
          <label>Jina la Filamu</label>
          <input type="text" name="title" value="${escapeHtml(movie.title)}" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Aina (Genre)</label>
            <input type="text" name="genre" value="${escapeHtml(movie.genre || '')}">
          </div>
          <div class="form-group">
            <label>Mwaka wa Utoaji</label>
            <input type="text" name="release_year" value="${escapeHtml(movie.release_year || '')}">
          </div>
        </div>
        <div class="form-group">
          <label>Maelezo</label>
          <textarea name="description">${escapeHtml(movie.description || '')}</textarea>
        </div>
        <div class="form-group">
          <label>Hali</label>
          <div class="pill-select">
            <label><input type="radio" name="status" value="available" ${movie.status === 'available' ? 'checked' : ''}><span>Ipo Maktabani</span></label>
            <label><input type="radio" name="status" value="not_available" ${movie.status === 'not_available' ? 'checked' : ''}><span>Haipo Kwa Sasa</span></label>
          </div>
        </div>
        <div class="form-group">
          <label>Badilisha Kifuniko (hiari)</label>
          <input type="file" name="cover_image" accept=".jpg,.jpeg,.png,.webp">
        </div>
        <button type="submit" class="btn btn-primary btn-block">Hifadhi Mabadiliko</button>
      </form>`;

    document.getElementById('editForm').addEventListener('submit', async function (e) {
      e.preventDefault();
      const fd = new FormData(e.target);
      fd.set('id', id);
      try {
        await apiPostForm('/movies/update.php', fd);
        window.location.href = 'movies.html';
      } catch (err) {
        showAlert(alertBox, err.message);
      }
    });
  } catch (e) {
    formCard.innerHTML = `<div class="alert alert-error"><span>⚠️</span> ${escapeHtml(e.message)}</div>`;
  }
})();
