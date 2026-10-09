/* LaafStyl store: video attribution + basket. No secrets here; links come pre-signed from links.json. */
(function () {
  var KEY = 'laafstyl_basket', VKEY = 'laafstyl_video';
  var base = (document.currentScript && document.currentScript.src) ? document.currentScript.src.replace(/assets\/store\.js.*$/, '') : '/';
  var qs = new URLSearchParams(location.search);
  var v = qs.get('v');
  if (v && /^[A-Za-z0-9_-]{6,20}$/.test(v)) { try { sessionStorage.setItem(VKEY, v); } catch (e) {} }
  function video() { try { return sessionStorage.getItem(VKEY) || ''; } catch (e) { return ''; } }
  function getBasket() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } }
  function setBasket(b) { try { localStorage.setItem(KEY, JSON.stringify(b)); } catch (e) {} count(); }
  function count() { var n = getBasket().length; document.querySelectorAll('[data-basket-count]').forEach(function (e) { e.textContent = n; e.style.display = n ? '' : 'none'; }); }
  var linksP = null;
  function links() { if (!linksP) linksP = fetch(base + 'links.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }); return linksP; }
  function pick(entry) { var vid = video(); return (vid && entry[vid]) || entry['default'] || ''; }
  window.LaafStore = {
    add: function (slug) { var b = getBasket(); if (b.indexOf(slug) < 0) b.push(slug); setBasket(b); },
    remove: function (slug) { setBasket(getBasket().filter(function (s) { return s !== slug; })); },
    basket: getBasket, links: links, pick: pick, base: base
  };
  document.addEventListener('DOMContentLoaded', function () {
    count();
    // keep attribution when moving between pages
    var vid = video();
    if (vid) document.querySelectorAll('a[data-keepv]').forEach(function (a) { a.href += (a.href.indexOf('?') < 0 ? '?' : '&') + 'v=' + encodeURIComponent(vid); });
    var buy = document.querySelector('[data-buy]');
    if (buy) {
      var slug = buy.getAttribute('data-buy');
      links().then(function (L) {
        var url = L[slug] && pick(L[slug]);
        document.querySelectorAll('[data-buy="' + slug + '"]').forEach(function (b) {
          if (url) { b.href = url; b.removeAttribute('aria-disabled'); } else { b.textContent = 'Not available yet'; }
        });
      }).catch(function () { document.querySelectorAll('[data-buy]').forEach(function (b) { b.textContent = 'Checkout unavailable - refresh'; }); });
    }
    document.querySelectorAll('[data-add]').forEach(function (b) {
      b.addEventListener('click', function (e) { e.preventDefault(); LaafStore.add(b.getAttribute('data-add')); b.textContent = 'Added to basket ✓'; });
    });
  });
})();
