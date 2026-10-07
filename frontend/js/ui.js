/**
 * TUMU TIGER — Vitendaji vya Pamoja vya UI (shared UI helpers)
 */

/** Crisp vector placeholder icon used wherever a movie has no cover image yet
 *  (replaces the old emoji, which rendered blurry/inconsistent across devices). */
const FILM_ICON_SVG = `
<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
  <path d="M8 24 L13 9 H22 L18 24 Z"/>
  <path d="M22 24 L27 9 H36 L32 24 Z"/>
  <path d="M36 24 L41 9 H50 L46 24 Z"/>
  <rect x="8" y="24" width="48" height="30" rx="4"/>
  <line x1="8" y1="24" x2="56" y2="24"/>
</svg>`;

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

function showAlert(container, message, type = 'error') {
  if (!container) return;
  const icon = type === 'success' ? '✅' : '⚠️';
  container.innerHTML = `<div class="alert alert-${type}"><span>${icon}</span> ${escapeHtml(message)}</div>`;
  setTimeout(() => { container.innerHTML = ''; }, 7000);
}

const STATUS_LABELS = {
  pending:       ['Inasubiri', 'badge-pending'],
  in_review:     ['Inashughulikiwa', 'badge-review'],
  available:     ['Ipo Maktabani', 'badge-available'],
  not_available: ['Haipo Kwa Sasa', 'badge-unavailable'],
  replied:       ['Imejibiwa', 'badge-replied'],
};

function statusBadge(status) {
  const [label, cls] = STATUS_LABELS[status] || [status, 'badge-pending'];
  return `<span class="badge ${cls}">${label}</span>`;
}

function movieStatusBadge(status) {
  return status === 'available'
    ? '<span class="badge badge-available">Ipo Maktabani</span>'
    : '<span class="badge badge-unavailable">Haipo Kwa Sasa</span>';
}

/** Payment/delivery details for customers who are far and need the movie sent to them. */
const PAYMENT_NUMBER = '0628828678';
const PAYMENT_NAME = 'TUMU TIGER';

const PAYMENT_STATUS_LABELS = {
  pending_payment:   ['Inasubiri Malipo', 'badge-pending'],
  payment_submitted: ['Malipo Yametumwa', 'badge-review'],
  paid:              ['Imelipwa', 'badge-available'],
};

function paymentStatusBadge(status) {
  if (!status || status === 'not_required') return '';
  const [label, cls] = PAYMENT_STATUS_LABELS[status] || [status, 'badge-pending'];
  return `<span class="badge ${cls}">${label}</span>`;
}

function formatPrice(price) {
  if (price === null || price === undefined) return '';
  return 'TSh ' + Number(price).toLocaleString('sw-TZ');
}

/** Renders the delivery/payment block for a request (used on the track page). */
function paymentSectionHTML(r) {
  if (!r.payment_status || r.payment_status === 'not_required') return '';

  let inner = '';
  if (r.payment_status === 'pending_payment') {
    inner = `
      <p class="text-dim small mt-8">Filamu hii itatumwa kwako. Tafadhali lipa kiasi hiki kwa Namba ya Simu (Mobile Money) ifuatayo, kisha jaza fomu chini kuthibitisha malipo yako:</p>
      <div class="card mt-8" style="background:var(--bg-soft);">
        <p class="small"><b>Lipa Kwa:</b> ${escapeHtml(PAYMENT_NUMBER)} — ${escapeHtml(PAYMENT_NAME)}</p>
      </div>
      <form id="paymentForm" class="mt-16">
        <div class="form-row">
          <div class="form-group">
            <label>Jina Ulilotumia Kulipia</label>
            <input type="text" name="payment_name" required>
          </div>
          <div class="form-group">
            <label>Namba Uliyotumia Kulipia</label>
            <input type="tel" name="payment_phone" required>
          </div>
        </div>
        <button type="submit" class="btn btn-primary btn-block">Thibitisha Nimelipa</button>
      </form>`;
  } else if (r.payment_status === 'payment_submitted') {
    inner = `
      <p class="text-dim small mt-8">Umetuma taarifa za malipo — tunathibitisha, subiri kidogo.</p>
      <p class="small mt-8">Jina: <b>${escapeHtml(r.payment_name || '')}</b> · Namba: <b>${escapeHtml(r.payment_phone || '')}</b></p>`;
  } else if (r.payment_status === 'paid') {
    inner = `<p class="small mt-8">✅ Malipo yamethibitishwa. Filamu yako itatumwa hivi karibuni.</p>`;
  }

  return `
    <div class="card mt-16" id="paymentSection">
      <div class="flex between center">
        <h3>Malipo ya Kutuma Filamu</h3>
        ${paymentStatusBadge(r.payment_status)}
      </div>
      ${r.price ? `<p class="mt-8"><b style="font-family:var(--display); font-size:1.3rem; color:var(--accent);">${formatPrice(r.price)}</b></p>` : ''}
      ${inner}
    </div>`;
}

/** Wires up the "Thibitisha Nimelipa" form injected by paymentSectionHTML(). */
function bindPaymentForm(trackingCode, onSuccess) {
  const form = document.getElementById('paymentForm');
  if (!form) return;
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const fd = new FormData(form);
    try {
      const { request } = await apiPostJSON('/requests/submit_payment.php', {
        tracking_code: trackingCode,
        payment_name: fd.get('payment_name'),
        payment_phone: fd.get('payment_phone'),
      });
      onSuccess(request);
    } catch (err) {
      alert(err.message);
    }
  });
}

function timeAgo(datetime) {
  const diff = (Date.now() - new Date(datetime.replace(' ', 'T'))) / 1000;
  if (diff < 60) return 'sasa hivi';
  if (diff < 3600) return Math.floor(diff / 60) + ' dakika zilizopita';
  if (diff < 86400) return Math.floor(diff / 3600) + ' saa zilizopita';
  if (diff < 2592000) return Math.floor(diff / 86400) + ' siku zilizopita';
  const d = new Date(datetime.replace(' ', 'T'));
  return d.toLocaleDateString('sw-TZ', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Updates the public navbar (login/register vs my-panel/logout) based on session. */
async function syncNavAuthState() {
  const loginLink = document.getElementById('navLoginLink');
  const registerLink = document.getElementById('navRegisterLink');
  const panelLink = document.getElementById('navPanelLink');
  const logoutLink = document.getElementById('navLogoutLink');
  if (!loginLink && !panelLink) return;

  try {
    const { user } = await apiGet('/auth/me.php');
    if (user) {
      if (loginLink) loginLink.style.display = 'none';
      if (registerLink) registerLink.style.display = 'none';
      if (panelLink) {
        panelLink.style.display = '';
        panelLink.href = TT.FRONTEND_BASE + (user.role === 'admin' ? '/pages/admin/dashboard.html' : '/pages/customer/dashboard.html');
      }
      if (logoutLink) {
        logoutLink.style.display = '';
        logoutLink.addEventListener('click', async (e) => {
          e.preventDefault();
          await apiPostJSON('/auth/logout.php', {});
          window.location.href = TT.FRONTEND_BASE + '/index.html';
        });
      }
    }
  } catch (e) {
    // not logged in — leave default (login/register visible)
  }
}

document.addEventListener('DOMContentLoaded', syncNavAuthState);

/** Fills the panel sidebar's avatar/name once the user is known (called after requireAuth resolves). */
function setSidebarUser(user) {
  const avatar = document.getElementById('sideAvatar');
  const who = document.getElementById('sideWho');
  if (!user) return;
  const roleLabel = user.role === 'admin' ? 'Msimamizi' : 'Mteja';
  if (avatar) avatar.textContent = (user.full_name || '?').charAt(0).toUpperCase();
  if (who) who.innerHTML = `${escapeHtml(user.full_name)}<small>${roleLabel}</small>`;
}

/** Loads an HTML partial (navbar/footer) into a placeholder element, then re-runs nav sync. */
async function loadPartial(elementId, partialPath) {
  const el = document.getElementById(elementId);
  if (!el) return;
  try {
    const res = await fetch(TT.FRONTEND_BASE + partialPath, { cache: 'no-store' });
    el.innerHTML = await res.text();
    // Re-run scripts injected via innerHTML (browsers don't auto-execute them)
    el.querySelectorAll('script').forEach((oldScript) => {
      const newScript = document.createElement('script');
      if (oldScript.src) newScript.src = oldScript.src;
      else newScript.textContent = oldScript.textContent;
      oldScript.replaceWith(newScript);
    });
    syncNavAuthState();
  } catch (e) {
    console.error('Imeshindwa kupakia sehemu ya ukurasa:', partialPath, e);
  }
}
