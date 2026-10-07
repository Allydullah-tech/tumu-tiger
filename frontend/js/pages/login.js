(function () {
  loadPartial('navbar-placeholder', '/partials/navbar.html');
  loadPartial('footer-placeholder', '/partials/footer.html');

  const form = document.getElementById('loginForm');
  const alertBox = document.getElementById('alertBox');

  // If already logged in, bounce straight to the right panel
  apiGet('/auth/me.php').then(({ user }) => {
    if (user) window.location.href = TT.FRONTEND_BASE + (user.role === 'admin' ? '/pages/admin/dashboard.html' : '/pages/customer/dashboard.html');
  }).catch(() => {});

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const fd = new FormData(form);
    try {
      const { user } = await apiPostJSON('/auth/login.php', {
        email: fd.get('email'),
        password: fd.get('password'),
      });
      window.location.href = TT.FRONTEND_BASE + (user.role === 'admin' ? '/pages/admin/dashboard.html' : '/pages/customer/dashboard.html');
    } catch (err) {
      showAlert(alertBox, err.message);
    }
  });
})();
