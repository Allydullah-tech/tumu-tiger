// TUMU TIGER — vitendo vidogo vya mteja (client-side niceties)
document.addEventListener('DOMContentLoaded', function () {
  // Confirm before destructive actions
  document.querySelectorAll('[data-confirm]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      if (!confirm(el.getAttribute('data-confirm'))) {
        e.preventDefault();
      }
    });
  });

  // Live-filter movie grid on the landing page
  var searchInput = document.getElementById('movieSearch');
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      var q = searchInput.value.toLowerCase().trim();
      document.querySelectorAll('.movie-card').forEach(function (card) {
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var genre = (card.getAttribute('data-genre') || '').toLowerCase();
        card.style.display = (title.indexOf(q) > -1 || genre.indexOf(q) > -1) ? '' : 'none';
      });
    });
  }

  // Auto-hide alerts after a while
  document.querySelectorAll('.alert').forEach(function (a) {
    setTimeout(function () { a.style.transition = 'opacity .4s'; a.style.opacity = '0'; }, 6000);
  });
});
