(async function () {
  let user = await requireAuth('customer');
  if (!user) return;

  await loadPartial('sidebar-placeholder', '/partials/customer-sidebar.html');
  setSidebarUser(user);

  const alertBox = document.getElementById('alertBox');
  document.getElementById('fullNameInput').value = user.full_name;
  document.getElementById('phoneInput').value = user.phone;
  document.getElementById('emailInput').value = user.email;

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
})();
