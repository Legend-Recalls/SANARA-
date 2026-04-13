/* PHASE 6 — Draw her heart constellation */
function g6_stars() {
  setPanel('Chapter 7 of 11', 'Draw her heart. ✨',
    'One star at a time — tap the glowing one to trace the shape.');

  var area = document.getElementById('g-area');

  /* ── Canvas ── */
  var canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:250px;border-radius:14px;display:block;cursor:pointer;touch-action:none;';
  area.appendChild(canvas);

  var hint = document.createElement('div');
  hint.style.cssText = 'font-size:13px;color:var(--muted);margin-top:.5rem;min-height:18px;text-align:center;transition:color .4s;';
  hint.textContent = 'Find the first star ✦';
  area.appendChild(hint);

  /* ── Heart-shaped star positions (normalised 0–1, y=0 top) ── */
  var STARS = [
    { x: 0.50, y: 0.25, label: 'smart'     },   // 0 top notch
    { x: 0.76, y: 0.15, label: 'adorable'  },   // 1 right bump top
    { x: 0.90, y: 0.39, label: 'beautiful' },   // 2 right side
    { x: 0.76, y: 0.63, label: 'cute'      },   // 3 lower right
    { x: 0.50, y: 0.88, label: 'innocent'  },   // 4 bottom tip
    { x: 0.24, y: 0.63, label: 'kind'      },   // 5 lower left
    { x: 0.10, y: 0.39, label: 'warm'      },   // 6 left side
    { x: 0.24, y: 0.15, label: 'best'      },   // 7 left bump top
  ];
  /* sequence traces the full heart and closes back to start */
  var SEQUENCE = [0, 1, 2, 3, 4, 5, 6, 7, 0];

  var W, H, dpr;
  function resize() {
    var rect = canvas.getBoundingClientRect();
    dpr = window.devicePixelRatio || 1;
    canvas.width  = rect.width  * dpr;
    canvas.height = rect.height * dpr;
    W = canvas.width;
    H = canvas.height;
  }
  resize();
  window.addEventListener('resize', function () { resize(); });

  /* ── State ── */
  var nextIdx  = 0;   // index into SEQUENCE of the star she needs to tap next
  var drawn    = [];  // { from, to, progress } line segments
  var complete = false;
  var glowPhase = 0;
  var raf;

  /* ── Helpers ── */
  function sx(star) { return star.x * W; }
  function sy(star) { return star.y * H; }
  function starRadius() { return Math.max(9, W * 0.036); }

  /* which star indices have been visited */
  function visitedIdx() {
    var v = {};
    SEQUENCE.slice(0, nextIdx + 1).forEach(function (i) { v[i] = true; });
    return v;
  }

  /* ── Draw loop ── */
  function draw(timestamp) {
    if (!complete) raf = requestAnimationFrame(draw);
    glowPhase = (timestamp || 0) / 900;

    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, W, H);

    /* sky */
    var sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#050a1a');
    sky.addColorStop(1, '#0d1f3c');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    /* background scatter */
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    for (var b = 0; b < 34; b++) {
      var bx = ((b * 137.5) % 100) / 100 * W;
      var by = ((b * 73.1 + 11) % 100) / 100 * H;
      var br = (0.5 + (b % 3) * 0.45) * dpr;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
    }

    /* drawn lines */
    drawn.forEach(function (seg) {
      var a  = STARS[seg.from];
      var b2 = STARS[seg.to];
      var p  = seg.progress !== undefined ? seg.progress : 1;
      var ex = sx(a) + (sx(b2) - sx(a)) * p;
      var ey = sy(a) + (sy(b2) - sy(a)) * p;

      ctx.save();
      if (complete) {
        ctx.shadowColor = '#ff85a1';
        ctx.shadowBlur  = 20 * dpr;
        ctx.strokeStyle = 'rgba(255,133,161,0.95)';
      } else {
        ctx.shadowColor = '#4a9fd4';
        ctx.shadowBlur  = 10 * dpr;
        ctx.strokeStyle = 'rgba(74,159,212,0.8)';
      }
      ctx.lineWidth = 2 * dpr;
      ctx.beginPath();
      ctx.moveTo(sx(a), sy(a));
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.restore();
    });

    /* stars — only show visited + current next target */
    var visited  = visitedIdx();
    var targetSI = SEQUENCE[nextIdx]; // star index to tap next

    STARS.forEach(function (star, i) {
      var isVisited = visited[i] && !(i === SEQUENCE[nextIdx] && nextIdx > 0 && !complete);
      var isNext    = (i === targetSI) && !complete;

      /* hide undiscovered future stars */
      if (!isVisited && !isNext) return;

      var pulse = isNext ? 1 + 0.20 * Math.sin(glowPhase * Math.PI * 2) : 1;
      var r     = starRadius() * pulse;

      ctx.save();
      if (complete) {
        ctx.shadowColor = '#ff85a1';
        ctx.shadowBlur  = 22 * dpr;
        ctx.fillStyle   = '#ffb3c6';
      } else if (isNext) {
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur  = 24 * dpr;
        ctx.fillStyle   = '#ffffff';
      } else {
        ctx.shadowColor = '#4a9fd4';
        ctx.shadowBlur  = 12 * dpr;
        ctx.fillStyle   = '#4a9fd4';
      }
      ctx.beginPath();
      ctx.arc(sx(star), sy(star), r, 0, Math.PI * 2);
      ctx.fill();

      /* label */
      ctx.fillStyle  = complete ? '#ffb3c6' : 'rgba(255,255,255,0.85)';
      ctx.font       = (9 * dpr) + 'px Nunito,sans-serif';
      ctx.textAlign  = 'center';
      ctx.shadowBlur = 0;
      ctx.fillText(star.label, sx(star), sy(star) - r - 5 * dpr);
      ctx.restore();
    });

    /* completion shimmer */
    if (complete) {
      var sweep = (glowPhase % 1);
      var grd   = ctx.createLinearGradient(0, 0, W, H);
      grd.addColorStop(Math.max(0, sweep - 0.15), 'rgba(255,133,161,0)');
      grd.addColorStop(sweep,                      'rgba(255,133,161,0.07)');
      grd.addColorStop(Math.min(1, sweep + 0.15), 'rgba(255,133,161,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);
    }
  }

  raf = requestAnimationFrame(draw);

  /* ── Input ── */
  function getPos(e) {
    var rect = canvas.getBoundingClientRect();
    var src  = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) / rect.width  * W,
      y: (src.clientY - rect.top)  / rect.height * H
    };
  }

  function tryTap(pos) {
    if (complete) return;
    var r      = starRadius() * 1.8; /* generous hit zone */
    var target = SEQUENCE[nextIdx];
    var star   = STARS[target];
    var dx = pos.x - sx(star);
    var dy = pos.y - sy(star);

    if (Math.sqrt(dx * dx + dy * dy) < r) {
      /* correct star */
      if (typeof SFX !== 'undefined') SFX.chime();
      if (nextIdx > 0) {
        var from = SEQUENCE[nextIdx - 1];
        var seg  = { from: from, to: target, progress: 0 };
        drawn.push(seg);
        var t0 = performance.now();
        (function animLine() {
          var t = Math.min(1, (performance.now() - t0) / 260);
          seg.progress = t;
          if (t < 1) requestAnimationFrame(animLine);
        })();
      }
      nextIdx++;

      if (nextIdx >= SEQUENCE.length) {
        complete = true;
        if (typeof SFX !== 'undefined') {
          setTimeout(function(){ SFX.chime(880.00); }, 100);
          setTimeout(function(){ SFX.chime(1046.50); }, 250);
          setTimeout(function(){ SFX.chime(1318.51); }, 450);
        }
        hint.textContent = '❤️ You drew her heart.';
        hint.style.color = '#ff85a1';

        var finStart = performance.now();
        cancelAnimationFrame(raf);
        (function finLoop(ts) {
          glowPhase = ts / 900;
          var ctx2 = canvas.getContext('2d');
          ctx2.clearRect(0, 0, W, H);
          draw(ts);
          if (ts - finStart < 2800) requestAnimationFrame(finLoop);
          else {
            addStanza(6);
            setTimeout(showNext, readingMs(6) + 720);
          }
        })(performance.now());

      } else {
        var left = SEQUENCE.length - nextIdx;
        hint.textContent = left > 1 ? left + ' more stars… ✦' : 'Last one! ✦';
        hint.style.color = 'var(--muted)';
      }
    } else {
      /* wrong spot */
      hint.textContent = 'Find the glowing star! ✦';
      hint.style.color = '#e05555';
      setTimeout(function () {
        if (!complete) {
          hint.style.color    = 'var(--muted)';
          hint.textContent    = 'Tap the glowing star ✦';
        }
      }, 900);
    }
  }

  canvas.addEventListener('click', function (e) { tryTap(getPos(e)); });
  canvas.addEventListener('touchstart', function (e) {
    e.preventDefault(); tryTap(getPos(e));
  }, { passive: false });
}
