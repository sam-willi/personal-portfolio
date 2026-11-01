// Portfolio effects: ASCII stars that scatter around the cursor and drift back,
// and draggable photos and fact cards on the About page.
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NBSP = ' ';
  var cache = new WeakMap();
  var pointer = null;
  var raf = 0;

  function measure(box) {
    var spans = Array.prototype.filter.call(box.querySelectorAll('span'), function (s) {
      return s.textContent !== NBSP;
    });
    // Each character gets its own pace home, so the shape re-forms unevenly.
    spans.forEach(function (s) {
      s.dataset.slow = (1.45 + Math.random() * 1.15).toFixed(2);
      s.dataset.wait = (Math.random() * 0.08).toFixed(2);
    });
    return {
      spans: spans,
      pos: spans.map(function (s) {
        return [s.offsetLeft + s.offsetWidth / 2, s.offsetTop + s.offsetHeight / 2];
      }),
      rnd: spans.map(function () { return 0.8 + Math.random() * 0.4; }),
      jit: spans.map(function () { return (Math.random() - 0.5) * 0.8; }),
      active: false,
    };
  }

  function settle(s) {
    s.style.transition = 'transform ' + s.dataset.slow + 's cubic-bezier(.45,0,.2,1) ' + s.dataset.wait + 's';
    s.style.transform = '';
    delete s.dataset.hit;
  }

  function update() {
    var p = pointer;
    document.querySelectorAll('.ascii').forEach(function (box) {
      if (box.offsetParent === null && getComputedStyle(box).display === 'none') return;
      var data = cache.get(box);
      if (!data) {
        data = measure(box);
        cache.set(box, data);
      }
      var fs = parseFloat(getComputedStyle(box).fontSize) || 12;
      var R = 20; // base reach; the real edge wobbles around this
      var reach = R * 1.6;
      var r = box.getBoundingClientRect();
      var near = p && p.x > r.left - reach && p.x < r.right + reach && p.y > r.top - reach && p.y < r.bottom + reach;
      if (!near) {
        if (data.active) {
          data.spans.forEach(function (s) {
            if (s.dataset.hit) settle(s);
          });
          data.active = false;
        }
        return;
      }
      data.active = true;
      var x = p.x - r.left;
      var y = p.y - r.top;
      var t = performance.now() / 1000;
      for (var i = 0; i < data.spans.length; i++) {
        var dx = data.pos[i][0] - x;
        var dy = data.pos[i][1] - y;
        var d = Math.hypot(dx, dy);
        var s = data.spans[i];
        // The hit area is a blob whose edge wobbles with angle and time.
        var ang = Math.atan2(dy, dx);
        var edge = R * data.rnd[i] * (1 + 0.32 * Math.sin(3 * ang + t * 1.3) + 0.18 * Math.sin(5 * ang - t * 2.1 + 1.7) + 0.1 * Math.sin(2 * ang + t * 0.7 + 4));
        if (d < edge) {
          var k = 1 - d / edge;
          var dist = edge - d + fs * 1.6 * data.rnd[i];
          var dir = ang + data.jit[i];
          var spin = (dx >= 0 ? 1 : -1) * k * 40 * data.rnd[i];
          s.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1)';
          s.style.transform = 'translate(' + (Math.cos(dir) * dist).toFixed(1) + 'px,' + (Math.sin(dir) * dist).toFixed(1) + 'px) rotate(' + spin.toFixed(0) + 'deg)';
          s.dataset.hit = '1';
        } else if (s.dataset.hit) {
          settle(s);
        }
      }
    });
  }

  if (!reduce) {
    window.addEventListener('pointermove', function (e) {
      pointer = { x: e.clientX, y: e.clientY };
      if (!raf) {
        raf = requestAnimationFrame(function () {
          raf = 0;
          update();
        });
      }
    }, { passive: true });
    document.addEventListener('pointerout', function (e) {
      if (!e.relatedTarget) {
        pointer = null;
        update();
      }
    });
    window.addEventListener('resize', function () {
      cache = new WeakMap();
    });
  }

  // About page: drag the photos and fact cards. Mouse only, so phones can still scroll.
  var z = 50;
  var held = null;
  document.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'touch' || e.button !== 0 || !e.target.closest) return;
    var el = e.target.closest('.snap');
    if (!el || window.matchMedia('(max-width:820px)').matches) return;
    e.preventDefault();
    el.style.zIndex = ++z;
    el.classList.add('held');
    held = { el: el, x: e.clientX, y: e.clientY, ox: parseFloat(el.dataset.x || 0), oy: parseFloat(el.dataset.y || 0) };
  });
  window.addEventListener('pointermove', function (e) {
    if (!held) return;
    var x = held.ox + e.clientX - held.x;
    var y = held.oy + e.clientY - held.y;
    held.el.dataset.x = x;
    held.el.dataset.y = y;
    held.el.style.translate = x + 'px ' + y + 'px';
  });
  window.addEventListener('pointerup', function () {
    if (held) held.el.classList.remove('held');
    held = null;
  });
})();
