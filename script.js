(function () {
  document.documentElement.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // barra de progresso de leitura + botão voltar ao topo
  var bar = document.createElement('div'); bar.id = 'progress'; document.body.appendChild(bar);
  var top = document.createElement('button'); top.id = 'totop'; top.setAttribute('aria-label', 'Voltar ao topo'); top.textContent = '↑';
  top.onclick = function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); };
  document.body.appendChild(top);
  function onScroll() {
    var h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? scrollY / h * 100 : 0) + '%';
    top.classList.toggle('show', scrollY > 500);
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // elementos aparecem ao rolar
  var els = document.querySelectorAll('main > p, main > ul, main > ol, main > h2, main > h3, .fig, .tbl, .cols, .card, .refs li');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el, i) {
      el.classList.add('reveal');
      if (el.classList.contains('card')) el.style.transitionDelay = (i % 8) * 60 + 'ms';
      io.observe(el);
    });
  }

  // destaca no menu a seção visível
  var links = {};
  document.querySelectorAll('nav a.sec').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
  var heads = document.querySelectorAll('main h2[id]');
  if (heads.length && 'IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove('active'); });
          if (links[e.target.id]) links[e.target.id].classList.add('active');
        }
      });
    }, { rootMargin: '0px 0px -70% 0px' });
    heads.forEach(function (h) { so.observe(h); });
  }

  // fundo animado: nós e enlaces de uma rede
  if (reduce) return;
  var c = document.createElement('canvas'); c.id = 'net'; document.body.prepend(c);
  var ctx = c.getContext('2d'), W, H, pts = [], mouse = { x: -999, y: -999 };
  function rgb() { return getComputedStyle(document.documentElement).getPropertyValue('--net').trim() || '11,107,203'; }
  var col = rgb();
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () { col = rgb(); });
  function resize() {
    var dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight; c.width = W * dpr; c.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.round(Math.min(70, W * H / 22000));
    pts = [];
    for (var i = 0; i < n; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35 });
  }
  addEventListener('resize', resize); resize();
  addEventListener('mousemove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  function frame() {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i]; p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
      for (var j = i + 1; j < pts.length; j++) {
        var q = pts[j], d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 140) { ctx.strokeStyle = 'rgba(' + col + ',' + (0.16 * (1 - d / 140)) + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
      }
      var dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      if (dm < 170) { ctx.strokeStyle = 'rgba(' + col + ',' + (0.3 * (1 - dm / 170)) + ')'; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
      ctx.fillStyle = 'rgba(' + col + ',.45)'; ctx.beginPath(); ctx.arc(p.x, p.y, 2.2, 0, 6.283); ctx.fill();
    }
    requestAnimationFrame(frame);
  }
  frame();
})();
