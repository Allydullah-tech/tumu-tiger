(async function () {
  const user = await requireAuth('admin');
  if (!user) return;

  await loadPartial('sidebar-placeholder', '/partials/admin-sidebar.html');
  setSidebarUser(user);

  document.getElementById('greeting').textContent = `Karibu, ${user.full_name.split(' ')[0]} 🐯`;

  try {
    const { stats, recent_requests } = await apiGet('/stats/admin.php');

    document.getElementById('kpiMovies').textContent = stats.total_movies;
    document.getElementById('kpiPending').textContent = stats.pending_requests;
    document.getElementById('kpiRequests').textContent = stats.total_requests;
    document.getElementById('kpiCustomers').textContent = stats.total_customers;
    document.getElementById('kpiPayments').textContent = stats.payments_to_confirm;

    const el = document.getElementById('recentRequests');
    if (recent_requests.length === 0) {
      el.innerHTML = '<div class="empty"><div class="big-ico">📭</div><h3>Bado hakuna maombi</h3></div>';
      return;
    }
    el.innerHTML = `
      <div class="table-wrap">
        <table>
          <thead><tr><th>Msimbo</th><th>Mteja</th><th>Filamu</th><th>Simu</th><th>Hali</th><th>Malipo</th><th>Tarehe</th></tr></thead>
          <tbody>
            ${recent_requests.map(r => `
              <tr>
                <td class="track-code"><a href="requests.html?id=${r.id}">${escapeHtml(r.tracking_code)}</a></td>
                <td>${escapeHtml(r.customer_name)}</td>
                <td>${escapeHtml(r.movie_title)}</td>
                <td>${escapeHtml(r.customer_phone)}</td>
                <td>${statusBadge(r.status)}</td>
                <td>${paymentStatusBadge(r.payment_status)}</td>
                <td class="text-dim">${timeAgo(r.created_at)}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  } catch (e) {
    showAlert(document.getElementById('alertBox'), e.message);
  }
})();
