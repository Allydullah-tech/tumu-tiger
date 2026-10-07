/**
 * TUMU TIGER — API fetch helpers
 * Every call sends cookies (credentials: 'include') so the PHP session
 * survives across requests even when frontend/backend run on different
 * ports during local development (see backend ALLOWED_ORIGINS).
 */

async function apiRequest(path, options = {}) {
  const res = await fetch(TT.API_BASE + path, {
    credentials: 'include',
    ...options,
  });
  let data;
  try {
    data = await res.json();
  } catch (e) {
    throw new Error('Jibu lisilo sahihi kutoka kwenye seva.');
  }
  if (!res.ok || data.success === false) {
    const err = new Error(data.error || 'Hitilafu imetokea.');
    err.status = res.status;
    err.code = data.code;
    err.payload = data;
    throw err;
  }
  return data;
}

function apiGet(path) {
  return apiRequest(path, { method: 'GET' });
}

function apiPostJSON(path, body) {
  return apiRequest(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function apiPostForm(path, formData) {
  return apiRequest(path, { method: 'POST', body: formData });
}
