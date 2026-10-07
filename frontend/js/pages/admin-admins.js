(async function () {
  const me = await requireAuth('admin');
  if (!me) return;

  await loadPartial('sidebar-placeholder', '/partials/admin-sidebar.html');
  setSidebarUser(me);

  const alertBox = document.getElementById('alertBox');
  const tableWrap = document.getElementById('adminsTableWrap');
  const form = document.getElementById('addAdminForm');
  const secQSelect = document.getElementById('secQSelect');
  const customQWrap = document.getElementById('customQWrap');

  secQSelect.addEventListener('change', function () {
    customQWrap.style.display = this.value === 'custom' ? 'block' : 'none';
  });

  async function loadAdmins() {
    tableWrap.innerHTML = '<p class="text-dim">Inapakia...</p>';
    try {
      const { admins } = await apiGet('/admins/list.php');
      tableWrap.innerHTML = `
        <div class="table-wrap">
          <table>
            <thead><tr><th>Jina</th><th>Barua Pepe</th><th>Simu</th><th>Aliungana</th></tr></thead>
            <tbody>
              ${admins.map(a => `
                <tr>
                  <td>${escapeHtml(a.full_name)} ${a.id == me.id ? '<span class="badge badge-available">Wewe</span>' : ''}</td>
                  <td>${escapeHtml(a.email)}</td>
                  <td>${escapeHtml(a.phone)}</td>
                  <td class="text-dim">${new Date(a.created_at.replace(' ', 'T')).toLocaleDateString('sw-TZ')}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`;
    } catch (e) {
      tableWrap.innerHTML = `<div class="alert alert-error"><span>⚠️</span> ${escapeHtml(e.message)}</div>`;
    }
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const fd = new FormData(form);
    try {
      await apiPostJSON('/admins/create.php', {
        full_name: fd.get('full_name'),
        email: fd.get('email'),
        phone: fd.get('phone'),
        password: fd.get('password'),
        confirm_password: fd.get('confirm_password'),
        security_question: fd.get('security_question'),
        security_question_custom: fd.get('security_question_custom'),
        security_answer: fd.get('security_answer'),
      });
      showAlert(alertBox, 'Msimamizi mpya ameongezwa.', 'success');
      form.reset();
      customQWrap.style.display = 'none';
      loadAdmins();
    } catch (err) {
      showAlert(alertBox, err.message);
    }
  });

  loadAdmins();
})();
