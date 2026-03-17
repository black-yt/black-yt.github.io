/**
 * Custom scripts for news toggle, publication filtering, sidebar pin, and nav close
 */

// ── Background wave-mosaic grid ──────────────────────────────────────────────
// Fixed grid of tiles; each tile's opacity is driven by overlapping sine waves
// → looks like ocean surface viewed from above (gentle rise-and-fall ripple)
(function () {
  var canvas, ctx, t = 0;
  var TILE = 26, GAP = 1;
  var rafId = null;
  var cachedRgb = '10,10,10';

  function rgb() {
    var th = document.documentElement.getAttribute('data-theme') || 'white';
    if (th === 'dark')   return '220,210,175';
    if (th === 'yellow') return '120,85,20';
    if (th === 'blue')   return '38,88,155';
    return '10,10,10';
  }

  function frame() {
    var w = canvas.width, h = canvas.height;
    var cols = Math.ceil(w / TILE) + 1;
    var rows = Math.ceil(h / TILE) + 1;
    var pre  = 'rgba(' + cachedRgb + ',';

    ctx.clearRect(0, 0, w, h);

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        // Two crossing wave trains + a slow diagonal swell
        var wave = 0.6 * Math.sin(c * 0.21 + t * 0.36) * Math.sin(r * 0.17 + t * 0.28)
                 + 0.4 * Math.sin(c * 0.11 - r * 0.13 + t * 0.19);
        // Cubic bias: crests ~19%, troughs ~0.4% — visible 2:1 light:dark ratio
        var norm = (wave + 1) * 0.5;
        var v    = norm * norm * norm;
        var a    = 0.004 + v * 0.186;
        if (a < 0.014) continue;    // skip near-invisible tiles for speed
        ctx.fillStyle = pre + a + ')';
        ctx.fillRect(c * TILE + GAP, r * TILE + GAP, TILE - GAP, TILE - GAP);
      }
    }

    t += 0.007; // slow, calm wave speed
    rafId = requestAnimationFrame(frame);
  }

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  // Pause animation when tab is hidden to save CPU/battery
  function onVisibilityChange() {
    if (document.hidden) {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    } else {
      if (!rafId) rafId = requestAnimationFrame(frame);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;' +
                           'z-index:0;pointer-events:none;';
    document.body.insertBefore(canvas, document.body.firstChild);
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibilityChange);
    rafId = requestAnimationFrame(frame);
  });

  // Invalidate rgb cache on theme change so color updates immediately
  var _origSetAttr = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (name, value) {
    _origSetAttr.call(this, name, value);
    if (this === document.documentElement && name === 'data-theme') cachedRgb = rgb();
  };
  var _origRemoveAttr = Element.prototype.removeAttribute;
  Element.prototype.removeAttribute = function (name) {
    _origRemoveAttr.call(this, name);
    if (this === document.documentElement && name === 'data-theme') cachedRgb = rgb();
  };
})();

// ── Theme Switcher ──────────────────────────────────────────────────────────
(function () {
  var THEMES = ['white', 'yellow', 'blue', 'dark'];
  var LABELS = { white: 'Pure White', yellow: 'Warm Yellow', blue: 'Cool Blue', dark: 'Dark' };

  function applyTheme(theme) {
    if (theme === 'white') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    try { localStorage.setItem('site-theme', theme); } catch(e) {}
    document.querySelectorAll('.theme-dot').forEach(function (dot) {
      dot.classList.toggle('active', dot.dataset.theme === theme);
    });
  }

  // Apply saved theme immediately (before DOMContentLoaded to avoid flash)
  var saved = 'white';
  try { saved = localStorage.getItem('site-theme') || 'white'; } catch(e) {}
  applyTheme(saved);

  document.addEventListener('DOMContentLoaded', function () {
    var switcher = document.createElement('div');
    switcher.id = 'theme-switcher';
    switcher.setAttribute('aria-label', 'Choose colour theme');
    THEMES.forEach(function (t) {
      var btn = document.createElement('button');
      btn.className = 'theme-dot';
      btn.dataset.theme = t;
      btn.title = LABELS[t];
      btn.setAttribute('aria-label', LABELS[t]);
      btn.addEventListener('click', function () { applyTheme(t); });
      switcher.appendChild(btn);
    });
    document.body.appendChild(switcher);
    // Re-apply to mark active dot after DOM is ready
    applyTheme(saved);
  });
})();

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

// Segmented control — move indicator to the active segment
function moveSegIndicator(control, activeBtn) {
  var indicator = control.querySelector('.seg-indicator');
  if (!indicator) return;
  indicator.style.left = activeBtn.offsetLeft + 'px';
  indicator.style.width = activeBtn.offsetWidth + 'px';
}

// News Toggle — smooth animation using exact scrollHeight
function toggleNews() {
  var content = document.getElementById('newsContent');
  var btn = document.getElementById('newsToggleBtn');
  if (!content || !btn) return;

  var btnText = btn.querySelector('span');
  var isExpanded = content.classList.contains('expanded');

  if (isExpanded) {
    content.style.maxHeight = content.scrollHeight + 'px';
    content.classList.remove('expanded');
    requestAnimationFrame(function() { requestAnimationFrame(function() {
      content.style.maxHeight = '300px';
    }); });
    if (btnText) btnText.textContent = 'Show More';
  } else {
    content.style.maxHeight = content.scrollHeight + 'px';
    content.classList.add('expanded');
    content.addEventListener('transitionend', function handler(e) {
      if (e.propertyName === 'max-height') content.style.maxHeight = 'none';
    }, { once: true });
    if (btnText) btnText.textContent = 'Show Less';
  }
}

document.addEventListener('DOMContentLoaded', function() {
  // Detach sidebar from Stickyfill
  var sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    sidebar.classList.remove('sticky');
    if (window.Stickyfill) Stickyfill.remove(sidebar);
  }

  // Init all seg-controls: position indicator over the active button
  requestAnimationFrame(function() {
    document.querySelectorAll('.seg-control').forEach(function(control) {
      var activeBtn = control.querySelector('.seg-btn.active');
      if (activeBtn) moveSegIndicator(control, activeBtn);
    });
  });

  // Publication filter
  var pubFilter = document.getElementById('pubFilter');
  var boxes = document.querySelectorAll('.paper-box');
  if (pubFilter) {
    pubFilter.querySelectorAll('.seg-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        pubFilter.querySelectorAll('.seg-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        moveSegIndicator(pubFilter, btn);
        var filter = btn.dataset.filter;
        boxes.forEach(function(box) {
          var isCore = box.dataset.core === 'true';
          box.style.display = (filter === 'all' || (filter === 'core' && isCore)) ? '' : 'none';
        });
      });
    });
  }

  // News toggle
  var newsToggle = document.getElementById('newsToggleBtn');
  if (newsToggle) newsToggle.addEventListener('click', toggleNews);
});

// Sidebar Pin — JS-based because CSS position:sticky is unreliable with the
// Susy float-based grid layout used by this theme.
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

// ── Scroll-spy — highlight the active section's nav link ─────────────────────
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var links = document.querySelectorAll('.greedy-nav .visible-links a[href*="#"]');
    if (!links.length) return;

    // Build list of { el, link } pairs for anchors that exist on the page
    var anchors = [];
    links.forEach(function (link) {
      var hash = (link.getAttribute('href') || '').split('#')[1];
      if (!hash) return;
      var el = document.getElementById(hash);
      if (el) anchors.push({ el: el, link: link });
    });
    if (!anchors.length) return;

    var current = null;
    var suppressUntil = 0; // timestamp — ignore scroll-spy until this time

    function setActive(link) {
      if (current === link) return;
      links.forEach(function (l) { l.classList.remove('nav-active'); });
      current = link;
      if (current) current.classList.add('nav-active');
    }

    // When user explicitly clicks a nav link, lock the highlight immediately
    // and suppress scroll-spy for 1 s so the scroll animation doesn't fight it
    links.forEach(function (link) {
      link.addEventListener('click', function () {
        setActive(link);
        suppressUntil = Date.now() + 1000;
      });
    });

    var scrollPending = false;

    function onScroll() {
      if (Date.now() < suppressUntil) return; // respect explicit click
      if (scrollPending) return;
      scrollPending = true;
      requestAnimationFrame(function () {
        scrollPending = false;
        if (Date.now() < suppressUntil) return;
        // masthead height offset so highlight triggers before heading hits top
        var offset = 80;
        var scrollY = window.scrollY + offset;
        var active = anchors[0].link; // default to first section
        for (var i = anchors.length - 1; i >= 0; i--) {
          if (anchors[i].el.getBoundingClientRect().top + window.scrollY <= scrollY) {
            active = anchors[i].link;
            break;
          }
        }
        setActive(active);
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  });
})();
