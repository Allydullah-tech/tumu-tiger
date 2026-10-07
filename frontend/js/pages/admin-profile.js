(async function () {
  let user = await requireAuth('admin');
  if (!user) return;

  await loadPartial('sidebar-placeholder', '/partials/admin-sidebar.html');
  setSidebarUser(user);

  const alertBox = document.getElementById('alertBox');
  document.getElementById('fullNameInput').value = user.full_name;
  document.getElementById('phoneInput').value = user.phone;
  document.getElementById('emailInput').value = user.email;

  const secQSelect = document.getElementById('secQSelect');
  const customQWrap = document.getElementById('customQWrap');
  secQSelect.addEventListener('change', function () {
    customQWrap.style.display = this.value === 'custom' ? 'block' : 'none';
  });

  try {
    const { security_question } = await apiGet('/profile/update_security.php');
    document.getElementById('currentQuestion').textContent = security_question || 'Halijawekwa';
  } catch (e) {
    document.getElementById('currentQuestion').textContent = 'Halijawekwa';
  }

  document.getElementById('profileForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      const res = await apiPostJSON('/profile/update.php', {
        full_name: fd.get('full_name'),
        phone: fd.get('phone'),
      });
      user = res.user;
      setSidebarUser(user);
      showAlert(alertBox, 'Wasifu wako umesasishwa.', 'success');
    } catch (err) {
      showAlert(alertBox, err.message);
    }
  });

  document.getElementById('passwordForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await apiPostJSON('/profile/change_password.php', {
        current_password: fd.get('current_password'),
        new_password: fd.get('new_password'),
        confirm_password: fd.get('confirm_password'),
      });
      showAlert(alertBox, 'Nenosiri limebadilishwa.', 'success');
      e.target.reset();
    } catch (err) {
      showAlert(alertBox, err.message);
    }
  });

  document.getElementById('securityForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      const res = await apiPostJSON('/profile/update_security.php', {
        security_question: fd.get('security_question'),
        security_question_custom: fd.get('security_question_custom'),
        security_answer: fd.get('security_answer'),
      });
      document.getElementById('currentQuestion').textContent = res.security_question;
      showAlert(alertBox, 'Swali la usalama limesasishwa.', 'success');
      e.target.reset();
      customQWrap.style.display = 'none';
    } catch (err) {
      showAlert(alertBox, err.message);
    }
  });
})();
