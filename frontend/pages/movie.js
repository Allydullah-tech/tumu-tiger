(function () {
  loadPartial('navbar-placeholder', '/partials/navbar.html');
  loadPartial('footer-placeholder', '/partials/footer.html');

  const detailEl = document.getElementById('movieDetail');
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    window.location.href = '../index.html';
    return;
  }

  function requestFormHTML(movie, user) {
    if (!user) {
      return `
        <div class="alert alert-error"><span>🔒</span> Tafadhali <a href="login.html" style="text-decoration:underline;">ingia</a> au <a href="register.html" style="text-decoration:underline;">jisajili</a> kwanza ili kutuma ombi.</div>`;
    }
    if (user.role !== 'customer') {
      return `<p class="text-dim">Ingia na akaunti ya mteja kutuma ombi.</p>`;
    }
    return `
      <p class="text-dim small mb-16">Utatumiwa kama <b>${escapeHtml(user.full_name)}</b> · 📞 ${escapeHtml(user.phone)} <a href="customer/profile.html" style="text-decoration:underline;">(hariri)</a></p>
      <form id="requestForm">
        <div class="form-group">
          <label>Ujumbe wa Ziada (hiari)</label>
          <textarea name="message" placeholder="Mfano: Naomba lugha ya Kiswahili, au toleo la HD..."></textarea>
        </div>
        <button type="submit" class="btn btn-primary btn-block">Tuma Ombi</button>
      </form>`;
  }

  async function render() {
    try {
      const [{ movie }, { user }] = await Promise.all([
        apiGet('/movies/get.php?id=' + encodeURIComponent(id)),
        apiGet('/auth/me.php'),
      ]);

      document.getElementById('pageTitle').textContent = movie.title + ' — TUMU TIGER';

      detailEl.innerHTML = `
        <div class="hero-grid" style="align-items:start;">
          <div class="hero-visual" style="transform:none; grid-template-columns:1fr;">
            <div class="poster" style="aspect-ratio:2/3;">
              ${movie.cover_url ? `<img src="${escapeHtml(movie.cover_url)}" alt="${escapeHtml(movie.title)}">` : FILM_ICON_SVG}
            </div>
          </div>
          <div>
            ${movieStatusBadge(movie.status)}
            <h1 style="margin-top:14px;">${escapeHtml(movie.title)}</h1>
            <p class="text-dim">${escapeHtml(movie.genre || 'Filamu')}${movie.release_year ? ' · ' + escapeHtml(movie.release_year) : ''}</p>
            <p class="mt-16">${escapeHtml(movie.description || 'Maelezo ya filamu hii bado hayajawekwa.').replace(/\n/g, '<br>')}</p>

            <div class="card mt-24" id="requestCard">
              <div id="requestResult"></div>
              <div id="requestFormWrap">
                <h3>Omba Filamu Hii</h3>
                <p class="text-dim small mt-8 mb-16">Jaza taarifa zako na timu yetu itakufuata kukuletea filamu hii.</p>
                <div id="alertBox"></div>
                ${requestFormHTML(movie, user)}
              </div>
            </div>
          </div>
        </div>`;

      const form = document.getElementById('requestForm');
      if (form) {
        form.addEventListener('submit', async function (e) {
          e.preventDefault();
          const fd = new FormData(form);
          const alertBox = document.getElementById('alertBox');
          try {
            const { request } = await apiPostJSON('/requests/create.php', {
              type: 'order',
              movie_id: movie.id,
              movie_title: movie.title,
              customer_name: user.full_name,
              customer_phone: user.phone,
              message: fd.get('message'),
            });
            document.getElementById('requestFormWrap').style.display = 'none';
            document.getElementById('requestResult').innerHTML = `
              <div class="alert alert-success"><span>✅</span> Ombi lako limetumwa!</div>
              <p class="text-dim">Msimbo wako wa ufuatiliaji ni:</p>
              <h2 class="track-code mt-8">${escapeHtml(request.tracking_code)}</h2>
              <p class="hint mt-8">Tunapendekeza uuandike au kuuchukua screenshot. Unaweza kufuatilia hali ya ombi lako wakati wowote.</p>
              <div class="flex gap-12 mt-16">
                <a href="customer/requests.html" class="btn btn-primary btn-sm">Angalia Maombi Yangu</a>
                <a href="track.html?code=${encodeURIComponent(request.tracking_code)}" class="btn btn-outline btn-sm">Fuatilia Ombi</a>
              </div>`;
          } catch (err) {
            showAlert(alertBox, err.message);
          }
        });
      }
    } catch (e) {
      detailEl.innerHTML = `<div class="empty"><div class="big-ico">⚠️</div><h3>Filamu haikupatikana</h3><p class="text-dim mt-8">${escapeHtml(e.message)}</p></div>`;
    }
  }

  render();
})();
