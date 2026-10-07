(async function () {
  const user = await requireAuth('admin');
  if (!user) return;

  await loadPartial('sidebar-placeholder', '/partials/admin-sidebar.html');
  setSidebarUser(user);

  const form = document.getElementById('uploadForm');
  const alertBox = document.getElementById('alertBox');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const fd = new FormData(form);
    try {
      const { movie } = await apiPostForm('/movies/create.php', fd);
      window.location.href = 'movies.html';
    } catch (err) {
      showAlert(alertBox, err.message);
    }
  });
})();
