(async function () {
  const user = await requireAuth('admin');
  if (!user) return;

  await loadPartial('sidebar-placeholder', '/partials/admin-sidebar.html');
  setSidebarUser(user);

  const alertBox = document.getElementById('alertBox');
  const listView = document.getElementById('listView');
  const detailView = document.getElementById('detailView');
  const detailContent = document.getElementById('detailContent');
  const tableWrap = document.getElementById('requestsTableWrap');
  const filterForm = document.getElementById('filterForm');

  const STATUS_OPTIONS = {
    pending: 'Inasubiri', in_review: 'Inashughulikiwa', available: 'Ipo Maktabani',
    not_available: 'Haipo Kwa Sasa', replied: 'Imejibiwa',
  };

  const params = new URLSearchParams(window.location.search);
  const viewId = params.get('id');

  async function loadList() {
    listView.style.display = '';
    detailView.style.display = 'none';
    const status = document.getElementById('statusFilter').value;
    const type = document.getElementById('typeFilter').value;
    const qs = new URLSearchParams();
    if (status) qs.set('status', status);
    if (type) qs.set('type', type);

    tableWrap.innerHTML = '<p class="text-dim">Inapakia...</p>';
    try {
      const { requests } = await apiGet('/requests/admin_list.php?' + qs.toString());
      if (requests.length === 0) {
        tableWrap.innerHTML = '<div class="empty"><div class="big-ico">📭</div><h3>Hakuna maombi yanayolingana</h3></div>';
        return;
      }
      tableWrap.innerHTML = `
        <div class="table-wrap">
          <table>
            <thead><tr><th>Msimbo</th><th>Mteja</th><th>Simu</th><th>Filamu</th><th>Aina</th><th>Hali</th><th>Malipo</th><th>Tarehe</th><th></th></tr></thead>
            <tbody>
              ${requests.map(r => `
                <tr>
                  <td class="track-code">${escapeHtml(r.tracking_code)}</td>
                  <td>${escapeHtml(r.customer_name)}</td>
                  <td>${escapeHtml(r.customer_phone)}</td>
                  <td>${escapeHtml(r.movie_title)}</td>
                  <td>${r.type === 'order' ? 'Ombi' : 'Swali'}</td>
                  <td>${statusBadge(r.status)}</td>
                  <td>${paymentStatusBadge(r.payment_status)}</td>
                  <td class="text-dim">${timeAgo(r.created_at)}</td>
                  <td><a href="requests.html?id=${r.id}" class="btn btn-outline btn-sm">Jibu</a></td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`;
    } catch (e) {
      tableWrap.innerHTML = `<div class="alert alert-error"><span>⚠️</span> ${escapeHtml(e.message)}</div>`;
    }
  }

  function paymentAdminBlockHTML(r) {
    let submitted = '';
    if (r.payment_status === 'payment_submitted') {
      submitted = `
        <div class="card mt-16" style="background:var(--bg-soft);">
          <p class="eyebrow mb-16">TAARIFA ZA MALIPO ALIYOTUMA MTEJA</p>
          <p class="small">Jina: <b>${escapeHtml(r.payment_name || '')}</b> · Namba: <b>${escapeHtml(r.payment_phone || '')}</b></p>
          <button type="button" id="confirmPaidBtn" class="btn btn-primary btn-sm mt-16">✅ Thibitisha Malipo (Paid)</button>
        </div>`;
    } else if (r.payment_status === 'paid') {
      submitted = `<div class="alert alert-success mt-16"><span>✅</span> Malipo yamethibitishwa.</div>`;
    }
    return `
      <h3 class="mt-24 mb-16">Utumaji kwa Mteja Aliye Mbali (Malipo)</h3>
      <p class="text-dim small mb-16">Kama mteja yupo mbali na anahitaji filamu itumwe kwake, weka bei hapa chini. Mteja ataona bei na maelekezo ya kulipa (${escapeHtml(PAYMENT_NUMBER)} — ${escapeHtml(PAYMENT_NAME)}) kwenye ukurasa wake wa kufuatilia.</p>
      <form id="priceForm">
        <div class="form-group">
          <label>Bei ya Kutuma Filamu (TSh)</label>
          <input type="number" name="price" min="0" step="100" value="${r.price ? r.price : ''}" placeholder="Mfano: 5000">
        </div>
        <button type="submit" class="btn btn-outline btn-sm">Hifadhi Bei</button>
      </form>
      ${submitted}`;
  }

  async function loadDetail(id) {
    listView.style.display = 'none';
    detailView.style.display = '';
    detailContent.innerHTML = '<p class="text-dim">Inapakia...</p>';
    try {
      const { request: r } = await apiGet('/requests/admin_get.php?id=' + encodeURIComponent(id));
      detailContent.innerHTML = `
        <div class="flex between center mb-16">
          <div>
            <h3>${escapeHtml(r.movie_title)}</h3>
            <p class="text-dim small mt-8">Msimbo: <span class="track-code">${escapeHtml(r.tracking_code)}</span> · ${r.type === 'order' ? 'Ombi la Filamu' : 'Swali kuhusu Filamu'}</p>
          </div>
          <div class="flex gap-8">${statusBadge(r.status)} ${paymentStatusBadge(r.payment_status)}</div>
        </div>
        <div class="form-row mb-16">
          <div>
            <p class="eyebrow">MTEJA</p>
            <p class="mt-8">${escapeHtml(r.customer_name)}</p>
            <p class="text-dim small">📞 ${escapeHtml(r.customer_phone)} · ✉️ ${escapeHtml(r.user_email)}</p>
          </div>
          <div>
            <p class="eyebrow">TAREHE</p>
            <p class="mt-8">${new Date(r.created_at.replace(' ', 'T')).toLocaleString('sw-TZ')}</p>
          </div>
        </div>
        ${r.message ? `<div class="card" style="background:var(--bg-soft);"><p class="eyebrow mb-16">UJUMBE WA MTEJA</p><p>${escapeHtml(r.message).replace(/\n/g, '<br>')}</p></div>` : ''}
        <h3 class="mt-24 mb-16">Jibu / Sasisha Hali</h3>
        <form id="respondForm">
          <div class="form-group">
            <label>Hali ya Ombi</label>
            <select name="status">
              ${Object.entries(STATUS_OPTIONS).map(([val, lab]) => `<option value="${val}" ${r.status === val ? 'selected' : ''}>${lab}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Jibu kwa Mteja</label>
            <textarea name="admin_reply" placeholder="Mfano: Filamu hii ipo, tutawasiliana nawe kwa simu leo...">${escapeHtml(r.admin_reply || '')}</textarea>
          </div>
          <button type="submit" class="btn btn-primary">Tuma Jibu</button>
        </form>
        ${paymentAdminBlockHTML(r)}`;

      document.getElementById('respondForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        const fd = new FormData(e.target);
        try {
          await apiPostJSON('/requests/admin_respond.php', {
            request_id: r.id,
            status: fd.get('status'),
            admin_reply: fd.get('admin_reply'),
          });
          showAlert(alertBox, 'Jibu limetumwa kwa mteja.', 'success');
          loadDetail(id);
        } catch (err) {
          showAlert(alertBox, err.message);
        }
      });

      const priceForm = document.getElementById('priceForm');
      if (priceForm) {
        priceForm.addEventListener('submit', async function (e) {
          e.preventDefault();
          const fd = new FormData(e.target);
          try {
            await apiPostJSON('/requests/admin_respond.php', {
              request_id: r.id,
              status: r.status,
              admin_reply: r.admin_reply || '',
              price: fd.get('price'),
            });
            showAlert(alertBox, 'Bei imehifadhiwa. Mteja ataiona kwenye ukurasa wake wa kufuatilia.', 'success');
            loadDetail(id);
          } catch (err) {
            showAlert(alertBox, err.message);
          }
        });
      }

      const confirmPaidBtn = document.getElementById('confirmPaidBtn');
      if (confirmPaidBtn) {
        confirmPaidBtn.addEventListener('click', async function () {
          try {
            await apiPostJSON('/requests/admin_respond.php', {
              request_id: r.id,
              status: r.status,
              admin_reply: r.admin_reply || '',
              payment_status: 'paid',
            });
            showAlert(alertBox, 'Malipo yamethibitishwa.', 'success');
            loadDetail(id);
          } catch (err) {
            showAlert(alertBox, err.message);
          }
        });
      }
    } catch (e) {
      detailContent.innerHTML = `<div class="alert alert-error"><span>⚠️</span> ${escapeHtml(e.message)}</div>`;
    }
  }

  filterForm.addEventListener('submit', function (e) {
    e.preventDefault();
    window.history.replaceState({}, '', 'requests.html');
    loadList();
  });

  if (viewId) {
    loadDetail(viewId);
  } else {
    loadList();
  }
})();
