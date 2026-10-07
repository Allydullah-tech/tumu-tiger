(function () {
  loadPartial('navbar-placeholder', '/partials/navbar.html');
  loadPartial('footer-placeholder', '/partials/footer.html');

  const form = document.getElementById('registerForm');
  const alertBox = document.getElementById('alertBox');

  apiGet('/auth/me.php').then(({ user }) => {
    if (user) window.location.href = TT.FRONTEND_BASE + (user.role === 'admin' ? '/pages/admin/dashboard.html' : '/pages/customer/dashboard.html');
  }).catch(() => {});

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const fd = new FormData(form);
    try {
      const { user } = await apiPostJSON('/auth/register.php', {
        full_name: fd.get('full_name'),
        email: fd.get('email'),
        phone: fd.get('phone'),
        password: fd.get('password'),
        confirm_password: fd.get('confirm_password'),
      });
      window.location.href = TT.FRONTEND_BASE + '/pages/customer/dashboard.html';
    } catch (err) {
      showAlert(alertBox, err.message);
    }
  });
})();
