(async function () {
  loadPartial('navbar-placeholder', '/partials/navbar.html');
  loadPartial('footer-placeholder', '/partials/footer.html');

  const user = await requireAuth('customer');
  if (!user) return;

  document.getElementById('customerNameInput').value = user.full_name;
  document.getElementById('customerPhoneInput').value = user.phone;

  const params = new URLSearchParams(window.location.search);
  const prefillTitle = params.get('title');
  if (prefillTitle) document.getElementById('movieTitleInput').value = prefillTitle;

  const form = document.getElementById('inquiryForm');
  const alertBox = document.getElementById('alertBox');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const fd = new FormData(form);
    try {
      const { request } = await apiPostJSON('/requests/create.php', {
        type: 'inquiry',
        movie_title: fd.get('movie_title'),
        customer_name: fd.get('customer_name'),
        customer_phone: fd.get('customer_phone'),
        message: fd.get('message'),
      });
      document.getElementById('formWrap').style.display = 'none';
      document.getElementById('resultBox').innerHTML = `
        <div class="alert alert-success"><span>✅</span> Swali lako limetumwa!</div>
        <p class="text-dim">Msimbo wako wa ufuatiliaji ni:</p>
        <h2 class="track-code mt-8">${escapeHtml(request.tracking_code)}</h2>
        <div class="flex gap-12 mt-16">
          <a href="customer/requests.html" class="btn btn-primary btn-sm">Angalia Maombi Yangu</a>
          <a href="../index.html" class="btn btn-outline btn-sm">Rudi Nyumbani</a>
        </div>`;
    } catch (err) {
      showAlert(alertBox, err.message);
    }
  });
})();
