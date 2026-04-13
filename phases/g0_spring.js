/* PHASE 0 — Spring scene */
function g0_spring() {
  setPanel('Chapter 1 of 11', 'Spring is arriving…', 'Hold the button and watch spring wake up.');

  var area = document.getElementById('g-area');

  /* ── Canvas scene ── */
  var canvas = document.createElement('canvas');
  canvas.id = 'spring-canvas';
  canvas.style.cssText = 'width:100%;height:200px;border-radius:14px;display:block;cursor:pointer;touch-action:none;';
  area.appendChild(canvas);

  /* ── Progress strip ── */
  var barWrap = document.createElement('div');
  barWrap.style.cssText = 'width:100%;height:8px;background:rgba(123,198,126,0.2);border-radius:4px;margin:.9rem 0 .4rem;overflow:hidden;';
  var fill = document.createElement('div');
  fill.style.cssText = 'height:100%;width:0%;border-radius:4px;background:linear-gradient(90deg,#7bc67e,#4a9fd4,#f5c842);transition:width .08s linear;';
  barWrap.appendChild(fill);
  area.appendChild(barWrap);

  var msg = document.createElement('div');
  msg.style.cssText = 'font-size:14px;color:var(--muted);min-height:20px;transition:opacity .4s;';
  msg.textContent = 'Hold the button below…';
  area.appendChild(msg);

  var btn = document.createElement('button');
  btn.className = 'game-btn';
  btn.innerHTML = '🌸 Hold me';
  btn.style.cssText = 'margin-top:.9rem;background:var(--green);color:white;padding:11px 26px;font-size:15px;border-radius:50px;border:none;font-family:Nunito,sans-serif;font-weight:800;cursor:pointer;box-shadow:0 3px 14px rgba(123,198,126,.45);transition:transform .15s,box-shadow .15s;';
  area.appendChild(btn);

  /* ── Internal state ── */
  var val = 0, holding = false, raf = null, done = false;

  /* ── Scene objects ── */
  var flowers = [];   // { x, y, size, bloom 0‑1, color, swayOffset }
  var petals  = [];   // { x, y, vx, vy, rot, rotV, size, opacity, color }
  var sparks  = [];   // post-complete burst

  var PETAL_COLORS  = ['#f5a3b5','#ffcce0','#ffb3c6','#ffd6e8','#ff85a1'];
  var FLOWER_COLORS = ['#f5c842','#ff85a1','#f5a3b5','#fff176','#ffcce0'];

  /* seed a few flower slots evenly */
  var FLOWER_SLOTS = 9;
  for (var fi = 0; fi < FLOWER_SLOTS; fi++) {
    flowers.push({
      x: (fi / (FLOWER_SLOTS - 1)) * 0.88 + 0.06,
      y: 1.0,
      size: 8 + Math.random() * 8,
      bloom: 0,
      color: FLOWER_COLORS[fi % FLOWER_COLORS.length],
      swayOffset: Math.random() * Math.PI * 2,
      delay: fi / FLOWER_SLOTS * 0.7   // bloom starts at this val fraction
    });
  }

  /* ── Resize canvas to pixel-perfect ── */
  function resizeCanvas() {
    var rect = canvas.getBoundingClientRect();
    canvas.width  = rect.width  * (window.devicePixelRatio || 1);
    canvas.height = rect.height * (window.devicePixelRatio || 1);
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  /* ── Drawing ── */
  function drawHeart(ctx, cx, cy, r, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx, cy + r * 0.35);
    // two bezier humps
    ctx.bezierCurveTo(cx - r, cy - r * 0.5, cx - r * 1.6, cy + r * 0.5, cx, cy + r * 1.3);
    ctx.bezierCurveTo(cx + r * 1.6, cy + r * 0.5, cx + r, cy - r * 0.5, cx, cy + r * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawFlower(ctx, cx, cy, size, bloom, color, t) {
    if (bloom <= 0) return;
    var petCount = 6;
    var petalLen = size * bloom;
    var sway = Math.sin(t * 1.2 + cy) * 3 * bloom;

    ctx.save();
    ctx.translate(cx + sway, cy);

    // Stem
    ctx.strokeStyle = '#7bc67e';
    ctx.lineWidth = 2 * bloom;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, size * 1.6 * bloom);
    ctx.stroke();

    // Petals
    for (var p = 0; p < petCount; p++) {
      var a = (p / petCount) * Math.PI * 2;
      ctx.save();
      ctx.rotate(a);
      ctx.fillStyle = color;
      ctx.globalAlpha = bloom;
      ctx.beginPath();
      ctx.ellipse(0, -petalLen * 0.9, petalLen * 0.4, petalLen * 0.9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    // Centre
    ctx.fillStyle = '#fff176';
    ctx.globalAlpha = bloom;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.35 * bloom, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  var startTime = performance.now();

  function frame(now) {
    if (done && sparks.length === 0) return;

    var t = (now - startTime) / 1000;
    resizeCanvas();
    var W = canvas.width, H = canvas.height;
    var ctx = canvas.getContext('2d');

    /* ── Sky gradient controlled by val ── */
    var skyT = val / 100;
    var sky1 = lerpColor([232,244,253], [255,180,100], skyT * 0.5);  // dawn
    var sky2 = lerpColor([255,248,240], [135,206,235], skyT);        // open sky
    var grd = ctx.createLinearGradient(0, 0, 0, H * 0.65);
    grd.addColorStop(0, sky1);
    grd.addColorStop(1, sky2);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    /* ── Sun rising ── */
    var sunY = H * 0.72 - skyT * H * 0.55;
    var sunR = 18 + skyT * 12;
    var sunColor = lerpColor([255,220,100], [255,200,50], skyT);
    // halo
    ctx.save();
    var halo = ctx.createRadialGradient(W * 0.8, sunY, sunR, W * 0.8, sunY, sunR * 3);
    halo.addColorStop(0, 'rgba(255,220,100,0.35)');
    halo.addColorStop(1, 'rgba(255,220,100,0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(W * 0.8, sunY, sunR * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = sunColor;
    ctx.beginPath();
    ctx.arc(W * 0.8, sunY, sunR, 0, Math.PI * 2);
    ctx.fill();

    /* ── Ground ── */
    var gGrd = ctx.createLinearGradient(0, H * 0.62, 0, H);
    gGrd.addColorStop(0, lerpColor([180,230,150], [100,180,80], skyT));
    gGrd.addColorStop(1, lerpColor([140,200,100], [60,140,50],  skyT));
    ctx.fillStyle = gGrd;
    ctx.fillRect(0, H * 0.62, W, H * 0.38);

    /* ── Flowers ── */
    flowers.forEach(function(f) {
      var threshold = f.delay;
      var target = val / 100 > threshold ? Math.min(1, (val / 100 - threshold) / 0.4) : 0;
      f.bloom += (target - f.bloom) * 0.06;
      var fx = f.x * W;
      var fy = H * 0.62 + 2;
      drawFlower(ctx, fx, fy, f.size * (W / 360), f.bloom, f.color, t);
    });

    /* ── Falling petals (spawn while holding) ── */
    if (holding && val < 100 && Math.random() < 0.35) {
      petals.push({
        x: Math.random() * W, y: -10,
        vx: (Math.random() - 0.5) * 1.2,
        vy: 0.8 + Math.random() * 1.2,
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.08,
        size: (6 + Math.random() * 8) * (W / 360),
        opacity: 0.7 + Math.random() * 0.3,
        color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)]
      });
    }

    petals = petals.filter(function(p) { return p.y < H + 20; });
    petals.forEach(function(p) {
      p.x  += p.vx + Math.sin(t + p.y * 0.02) * 0.5;
      p.y  += p.vy;
      p.rot += p.rotV;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    /* ── Completion burst sparks ── */
    sparks = sparks.filter(function(s) { return s.life > 0; });
    sparks.forEach(function(s) {
      s.x += s.vx; s.y += s.vy; s.vy += 0.07;
      s.life -= 0.025; s.rot += s.rotV;
      ctx.save();
      ctx.globalAlpha = Math.max(0, s.life);
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rot);
      if (s.heart) {
        drawHeart(ctx, 0, 0, s.size, s.color);
      } else {
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, s.size, s.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    raf = requestAnimationFrame(frame);
  }

  /* ── Linear interpolate between two RGB arrays ── */
  function lerpColor(a, b, t) {
    t = Math.max(0, Math.min(1, t));
    return 'rgb(' +
      Math.round(a[0] + (b[0]-a[0])*t) + ',' +
      Math.round(a[1] + (b[1]-a[1])*t) + ',' +
      Math.round(a[2] + (b[2]-a[2])*t) + ')';
  }

  raf = requestAnimationFrame(frame);

  /* ── Hold logic ── */
  function grow() {
    if (done) return;
    holding = true;
    if (typeof SFX !== 'undefined') SFX.holdStart();
    btn.style.transform = 'scale(0.96)';
    var iv = setInterval(function() {
      if (!holding || done) { clearInterval(iv); return; }
      val = Math.min(100, val + 0.3333333333333333);
      fill.style.width = val + '%';

      if (val < 40)       msg.textContent = 'Keep holding…';
      else if (val < 70)  msg.textContent = 'Almost there… 🌸';
      else if (val < 100) msg.textContent = 'Just a little more…';

      if (val >= 100) {
        clearInterval(iv);
        holding = false;
        done = true;
        if (typeof SFX !== 'undefined') SFX.holdStop();
        btn.style.display = 'none';
        msg.textContent = 'Spring is here. Just like she was. 🌼';
        fill.style.background = 'linear-gradient(90deg,#f5a3b5,#f5c842,#7bc67e)';

        /* burst sparks */
        var colors = ['#f5a3b5','#f5c842','#7bc67e','#ff85a1','#fffde7','#4a9fd4'];
        for (var i = 0; i < 60; i++) {
          sparks.push({
            x: canvas.width  * (0.3 + Math.random() * 0.4),
            y: canvas.height * (0.3 + Math.random() * 0.3),
            vx: (Math.random()-0.5) * 7,
            vy: (Math.random()-0.5) * 7 - 2,
            rot: Math.random()*Math.PI*2,
            rotV: (Math.random()-0.5)*0.12,
            size: (4+Math.random()*7)*(canvas.width/360),
            color: colors[Math.floor(Math.random()*colors.length)],
            life: 0.9+Math.random()*0.5,
            heart: Math.random() < 0.4
          });
        }

        addStanza(0);
        setTimeout(showNext, 900);
      }
    }, 20);

    btn.addEventListener('mouseup',    stopHold);
    btn.addEventListener('mouseleave', stopHold);
    btn.addEventListener('touchend',   stopHold);

    function stopHold() {
      holding = false;
      if (typeof SFX !== 'undefined' && !done) SFX.holdStop();
      btn.style.transform = '';
      if (!done) msg.textContent = 'Keep holding to grow spring…';
    }
  }

  btn.addEventListener('mousedown', grow);
  btn.addEventListener('touchstart', function(e) { e.preventDefault(); grow(); }, { passive: false });
}
