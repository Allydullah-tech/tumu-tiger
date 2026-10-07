(async function () {
  const user = await requireAuth('customer');
  if (!user) return;

  await loadPartial('sidebar-placeholder', '/partials/customer-sidebar.html');
  setSidebarUser(user);

  const wrap = document.getElementById('requestsWrap');
  try {
    const { requests } = await apiGet('/requests/mine.php');
    if (requests.length === 0) {
      wrap.innerHTML = `
        <div class="empty">
          <div class="big-ico">📭</div>
          <h3>Bado hujafanya ombi lolote</h3>
          <a href="../movies.html" class="btn btn-primary mt-16">Vinjari Filamu</a>
        </div>`;
      return;
    }
    wrap.innerHTML = `
      <div class="table-wrap">
        <table>
          <thead><tr><th>Msimbo</th><th>Filamu</th><th>Aina</th><th>Hali</th><th>Malipo</th><th>Tarehe</th></tr></thead>
          <tbody>
            ${requests.map(r => `
              <tr>
                <td><a href="../track.html?code=${encodeURIComponent(r.tracking_code)}" class="track-code">${escapeHtml(r.tracking_code)}</a></td>
                <td>${escapeHtml(r.movie_title)}</td>
                <td>${r.type === 'order' ? 'Ombi la Filamu' : 'Swali'}</td>
                <td>${statusBadge(r.status)}</td>
                <td>${r.price ? formatPrice(r.price) + ' ' : ''}${paymentStatusBadge(r.payment_status)}</td>
                <td class="text-dim">${timeAgo(r.created_at)}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <p class="hint mt-16">Bofya msimbo wa ombi ili kuona majibu kamili na, kama linahitajika, kulipia ili filamu itumwe kwako.</p>`;
  } catch (e) {
    wrap.innerHTML = `<div class="alert alert-error"><span>⚠️</span> ${escapeHtml(e.message)}</div>`;
  }
})();
