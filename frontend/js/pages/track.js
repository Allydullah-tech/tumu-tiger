(function () {
  loadPartial('navbar-placeholder', '/partials/navbar.html');
  loadPartial('footer-placeholder', '/partials/footer.html');

  const formCode = document.getElementById('trackFormCode');
  const formPhone = document.getElementById('trackFormPhone');
  const codeInput = document.getElementById('codeInput');
  const phoneInput = document.getElementById('phoneInput');
  const listBox = document.getElementById('listBox');
  const resultBox = document.getElementById('resultBox');

  // Toggle between code / phone search
  document.querySelectorAll('#trackModeSwitch input[name="track_mode"]').forEach((radio) => {
    radio.addEventListener('change', function () {
      const isCode = this.value === 'code';
      formCode.style.display = isCode ? '' : 'none';
      formPhone.style.display = isCode ? 'none' : '';
      listBox.innerHTML = '';
      resultBox.innerHTML = '';
    });
  });

  function requestCardHTML(r) {
    const lbl = statusBadge(r.status);
    return `
      <div class="card mt-16" id="paymentAnchor-${r.tracking_code}">
        <div class="flex between center">
          <h3>${escapeHtml(r.movie_title)}</h3>
          ${lbl}
        </div>
        <p class="text-dim small mt-8">
          Aina: ${r.type === 'order' ? 'Ombi la Filamu' : 'Swali kuhusu Filamu'} ·
          Ilitumwa ${timeAgo(r.created_at)}
        </p>
        <p class="track-code mt-16">${escapeHtml(r.tracking_code)}</p>
        ${r.admin_reply
          ? `<div class="card mt-16" style="background:var(--bg-soft);"><p class="eyebrow mb-16">MAJIBU KUTOKA TUMU TIGER</p><p>${escapeHtml(r.admin_reply).replace(/\n/g, '<br>')}</p></div>`
          : `<p class="hint mt-16">Bado hatujajibu ombi hili — tunashughulikia kwa haraka iwezekanavyo.</p>`}
        ${paymentSectionHTML(r)}
      </div>`;
  }

  function showRequest(r) {
    resultBox.innerHTML = requestCardHTML(r);
    bindPaymentForm(r.tracking_code, showRequest);
  }

  async function lookupByCode(code) {
    listBox.innerHTML = '';
    resultBox.innerHTML = '<p class="text-dim mt-16">Inatafuta...</p>';
    try {
      const { request } = await apiGet('/requests/track.php?code=' + encodeURIComponent(code));
      showRequest(request);
    } catch (e) {
      resultBox.innerHTML = `<div class="alert alert-error mt-16"><span>⚠️</span> ${escapeHtml(e.message)}</div>`;
    }
  }

  async function lookupByPhone(phone) {
    resultBox.innerHTML = '';
    listBox.innerHTML = '<p class="text-dim mt-16">Inatafuta...</p>';
    try {
      const { requests } = await apiGet('/requests/track_by_phone.php?phone=' + encodeURIComponent(phone));
      if (requests.length === 1) {
        listBox.innerHTML = '';
        showRequest(requests[0]);
        return;
      }
      listBox.innerHTML = `
        <div class="table-wrap mt-16">
          <table>
            <thead><tr><th>Msimbo</th><th>Filamu</th><th>Hali</th><th>Tarehe</th><th></th></tr></thead>
            <tbody>
              ${requests.map(r => `
                <tr>
                  <td class="track-code">${escapeHtml(r.tracking_code)}</td>
                  <td>${escapeHtml(r.movie_title)}</td>
                  <td>${statusBadge(r.status)}</td>
                  <td class="text-dim">${timeAgo(r.created_at)}</td>
                  <td><button class="btn btn-outline btn-sm" data-code="${escapeHtml(r.tracking_code)}">Ona</button></td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`;
      listBox.querySelectorAll('[data-code]').forEach((btn) => {
        btn.addEventListener('click', () => lookupByCode(btn.getAttribute('data-code')));
      });
    } catch (e) {
      listBox.innerHTML = `<div class="alert alert-error mt-16"><span>⚠️</span> ${escapeHtml(e.message)}</div>`;
    }
  }

  formCode.addEventListener('submit', function (e) {
    e.preventDefault();
    const code = codeInput.value.trim();
    const url = new URL(window.location.href);
    url.searchParams.set('code', code);
    url.searchParams.delete('phone');
    window.history.replaceState({}, '', url);
    lookupByCode(code);
  });

  formPhone.addEventListener('submit', function (e) {
    e.preventDefault();
    const phone = phoneInput.value.trim();
    const url = new URL(window.location.href);
    url.searchParams.set('phone', phone);
    url.searchParams.delete('code');
    window.history.replaceState({}, '', url);
    lookupByPhone(phone);
  });

  // Deep-link support: ?code=... or ?phone=...
  const params = new URLSearchParams(window.location.search);
  const initialCode = params.get('code');
  const initialPhone = params.get('phone');
  if (initialCode) {
    codeInput.value = initialCode;
    lookupByCode(initialCode);
  } else if (initialPhone) {
    document.querySelector('#trackModeSwitch input[value="phone"]').checked = true;
    formCode.style.display = 'none';
    formPhone.style.display = '';
    phoneInput.value = initialPhone;
    lookupByPhone(initialPhone);
  }
})();
