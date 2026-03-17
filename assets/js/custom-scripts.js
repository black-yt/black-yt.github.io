/**
 * Custom scripts for news toggle, publication filtering, sidebar pin, and nav close
 */

// Close mobile nav when clicking outside
document.addEventListener('click', function(e) {
  var nav = document.getElementById('site-nav');
  if (!nav) return;
  var hlinks = nav.querySelector('.hidden-links');
  var btn = nav.querySelector('button');
  if (!hlinks || hlinks.classList.contains('hidden')) return;
  if (btn && btn.contains(e.target)) return;
  hlinks.classList.add('hidden');
  btn.classList.remove('close');
});

// News Toggle — smooth animation using exact scrollHeight
function toggleNews() {
  const content = document.getElementById('newsContent');
  const btn = document.getElementById('newsToggleBtn');
  if (!content || !btn) return;

  const btnText = btn.querySelector('span');
  const isExpanded = content.classList.contains('expanded');

  if (isExpanded) {
    // Collapse: materialize current height as px (none→px can't transition),
    // then animate down to 300px in the next frame
    content.style.maxHeight = content.scrollHeight + 'px';
    content.classList.remove('expanded');
    btn.classList.remove('expanded');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      content.style.maxHeight = '300px';
    }));
    if (btnText) btnText.textContent = 'Show More';
  } else {
    // Expand: animate from 300px to exact content height,
    // then release height constraint once transition finishes
    content.style.maxHeight = content.scrollHeight + 'px';
    content.classList.add('expanded');
    btn.classList.add('expanded');
    content.addEventListener('transitionend', function handler(e) {
      if (e.propertyName === 'max-height') {
        content.style.maxHeight = 'none';
      }
    }, { once: true });
    if (btnText) btnText.textContent = 'Show Less';
  }
}

// Publication Filter
document.addEventListener('DOMContentLoaded', function() {
  const buttons = document.querySelectorAll('.pub-filter .filter-btn');
  const boxes = document.querySelectorAll('.paper-box');

  if (buttons.length > 0) {
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;
        boxes.forEach(box => {
          const isCore = box.dataset.core === 'true';
          if (filter === 'all' || (filter === 'core' && isCore)) {
            box.style.display = '';
          } else {
            box.style.display = 'none';
          }
        });
      });
    });
  }
});

// Sidebar Pin — JS-based because CSS position:sticky is unreliable in this theme
// (opacity animation on #main creates stacking context that breaks sticky)
(function () {
  var BREAKPOINT = 925;

  function pin() {
    if (window.innerWidth < BREAKPOINT) return;
    var sidebar = document.querySelector('.sidebar');
    if (!sidebar || sidebar.classList.contains('sidebar--pinned')) return;

    var masthead = document.querySelector('.masthead');
    var top = masthead ? Math.round(masthead.getBoundingClientRect().bottom) : 0;
    var rect = sidebar.getBoundingClientRect();

    // Spacer keeps the layout width occupied
    var spacer = document.createElement('div');
    spacer.className = 'sidebar-spacer';
    spacer.style.width = Math.round(rect.width) + 'px';
    spacer.style.flexShrink = '0';
    sidebar.parentNode.insertBefore(spacer, sidebar);

    sidebar.style.top = top + 'px';
    sidebar.style.left = Math.round(rect.left) + 'px';
    sidebar.style.width = Math.round(rect.width) + 'px';
    sidebar.classList.add('sidebar--pinned');
  }

  function unpin() {
    var sidebar = document.querySelector('.sidebar');
    var spacer = document.querySelector('.sidebar-spacer');
    if (sidebar) {
      sidebar.classList.remove('sidebar--pinned');
      sidebar.style.top = sidebar.style.left = sidebar.style.width = '';
    }
    if (spacer && spacer.parentNode) spacer.parentNode.removeChild(spacer);
  }

  document.addEventListener('DOMContentLoaded', function () {
    requestAnimationFrame(pin);
  });

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    unpin();
    resizeTimer = setTimeout(function () { requestAnimationFrame(pin); }, 150);
  });
})();

