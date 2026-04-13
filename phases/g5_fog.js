/* PHASE 5 — Fog reveal */
function g5_fog() {
  setPanel('Chapter 6 of 11', "She's there, even when quiet.", 'Wipe the fog away. Move your mouse or finger over it.');
  var area = document.getElementById('g-area');

  var wrap = document.createElement('div');
  wrap.id = 'fog-wrap';
  var fogText = document.createElement('div');
  fogText.id = 'fog-text';
  fogText.innerHTML = 'And I see you, Sanara \u2014<br>even when you go quiet.';
  wrap.appendChild(fogText);
  var canvas = document.createElement('canvas');
  canvas.id = 'fog-canvas';
  wrap.appendChild(canvas);
  area.appendChild(wrap);

  var progEl = document.createElement('div');
  progEl.id = 'fog-progress';
  progEl.textContent = 'Cleared: 0%';
  area.appendChild(progEl);

  var W = Math.max(wrap.offsetWidth, 300), H = 120;
  canvas.width = W; canvas.height = H;
  canvas.style.width = '100%'; canvas.style.height = '100%';
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = '#b8d4e8';
  ctx.fillRect(0, 0, W, H);

  var done = false;
  var lastSweep = 0;

  function wipe(cx, cy) {
    if (typeof SFX !== 'undefined') {
      var now = performance.now();
      if (now - lastSweep > 180) {
        SFX.sweep();
        lastSweep = now;
      }
    }
    
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    var d = ctx.getImageData(0, 0, W, H).data;
    var cleared = 0;
    for (var i = 3; i < d.length; i += 4) { if (d[i] < 128) cleared++; }
    var pct = Math.round((cleared / (W * H)) * 100);
    progEl.textContent = 'Cleared: ' + Math.min(pct, 100) + '%';
    if (pct >= 55 && !done) {
      done = true;
      progEl.textContent = '\uD83D\uDC99 There she is.';
      addStanza(5);
      setTimeout(showNext, 900);
    }
  }

  function toC(clientX, clientY) {
    var r = canvas.getBoundingClientRect();
    return { x: (clientX - r.left) * (W / r.width), y: (clientY - r.top) * (H / r.height) };
  }

  var drawing = false;
  canvas.addEventListener('mousedown', function() { drawing = true; });
  canvas.addEventListener('mouseup', function() { drawing = false; });
  canvas.addEventListener('mouseleave', function() { drawing = false; });
  canvas.addEventListener('mousemove', function(e) {
    if (!drawing) return;
    var c = toC(e.clientX, e.clientY); wipe(c.x, c.y);
  });
  canvas.addEventListener('click', function(e) {
    var c = toC(e.clientX, e.clientY); wipe(c.x, c.y);
  });
  canvas.addEventListener('touchmove', function(e) {
    e.preventDefault();
    var c = toC(e.touches[0].clientX, e.touches[0].clientY); wipe(c.x, c.y);
  }, { passive: false });
}
