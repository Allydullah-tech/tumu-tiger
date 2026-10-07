/**
 * TUMU TIGER — Auth Guard
 * Call requireAuth('customer') or requireAuth('admin') at the top of any
 * protected panel page. Redirects to login if not authenticated, or to
 * the homepage if logged in with the wrong role. Resolves with the user.
 */
async function requireAuth(role) {
  try {
    const { user } = await apiGet('/auth/me.php');
    if (!user) {
      window.location.href = TT.FRONTEND_BASE + '/pages/login.html';
      return null;
    }
    if (role && user.role !== role) {
      window.location.href = TT.FRONTEND_BASE + '/index.html';
      return null;
    }
    return user;
  } catch (e) {
    window.location.href = TT.FRONTEND_BASE + '/pages/login.html';
    return null;
  }
}
