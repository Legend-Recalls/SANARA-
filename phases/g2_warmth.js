/* PHASE 2 — Page shatter & magic reveal */
function g2_warmth() {
  setPanel('Chapter 3 of 11', 'A quiet moment.', 'Something is hidden here.');
  var area = document.getElementById('g-area');

  var btn = document.createElement('button');
  btn.className = 'game-btn';
  btn.innerHTML = '✨ Reveal it';
  btn.style.cssText = [
    'display:block',
    'margin:1.4rem auto 0',
    'background:linear-gradient(135deg,#4a9fd4,#2d7db8)',
    'color:white',
    'padding:13px 32px',
    'font-size:16px',
    'border-radius:50px',
    'border:none',
    'font-family:Nunito,sans-serif',
    'font-weight:800',
    'cursor:pointer',
    'box-shadow:0 4px 20px rgba(74,159,212,0.45)',
    'transition:transform .15s,box-shadow .15s'
  ].join(';');
  area.appendChild(btn);

  btn.addEventListener('mouseenter', function() {
    btn.style.transform = 'translateY(-2px)';
    btn.style.boxShadow = '0 8px 28px rgba(74,159,212,0.55)';
  });
  btn.addEventListener('mouseleave', function() {
    btn.style.transform = '';
    btn.style.boxShadow = '0 4px 20px rgba(74,159,212,0.45)';
  });

  btn.addEventListener('click', function() {
    btn.disabled = true;
    shatterAndReveal();
  });

  /* ─────────────────────────────────────────
     SHATTER + MAGIC REVEAL
  ───────────────────────────────────────── */
  function shatterAndReveal() {
    var stage = document.getElementById('stage');
    var W = window.innerWidth;
    var H = window.innerHeight;

    var rect = btn.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;

    /* hide the real button before snapshot so it disappears as the screen cracks */
    btn.style.visibility = 'hidden';

    var container = document.createElement('div');
    container.style.cssText = 'position:fixed;inset:0;z-index:9000;overflow:hidden;pointer-events:none;';
    document.body.appendChild(container);

    var numShards = 12;
    var shards = [];
    var angles = [];
    for (var i = 0; i < numShards; i++) {
      angles.push((i / numShards) * Math.PI * 2 + (Math.random() - 0.5) * 0.3);
    }
    // ensure closure
    angles[0] = 0;

    var dist = Math.max(W, H) * 1.5;

    for (var i = 0; i < numShards; i++) {
      var a1 = angles[i];
      var a2 = i === numShards - 1 ? angles[0] : angles[i + 1];

      var p1x = cx + Math.cos(a1) * dist;
      var p1y = cy + Math.sin(a1) * dist;
      var p2x = cx + Math.cos(a2) * dist;
      var p2y = cy + Math.sin(a2) * dist;

      var clipPath = 'polygon(' + cx + 'px ' + cy + 'px, ' + p1x + 'px ' + p1y + 'px, ' + p2x + 'px ' + p2y + 'px)';

      var shard = document.createElement('div');
      shard.style.cssText = [
        'position:absolute', 'inset:0',
        'background:var(--soft)', // matches body background
        'clip-path:' + clipPath,
        '-webkit-clip-path:' + clipPath,
        'transform-origin:' + cx + 'px ' + cy + 'px',
        'z-index:9002'
      ].join(';');

      var clone = stage.cloneNode(true);
      clone.style.marginTop = -window.scrollY + 'px';
      shard.appendChild(clone);
      container.appendChild(shard);
      shards.push({ el: shard, a: (a1 + a2) / 2 });
    }

    // Hide original UI
    stage.style.visibility = 'hidden';

    // 1. Shake the glass before breaking
    if (typeof SFX !== 'undefined') SFX.crack();
    container.style.animation = 'crackShake 0.4s cubic-bezier(.36,.07,.19,.97) both';
    if (!document.getElementById('crack-shake')) {
      var s = document.createElement('style');
      s.id = 'crack-shake';
      s.textContent = '@keyframes crackShake { 0%,100%{transform:translate(0,0)} 20%{transform:translate(-8px,5px)} 40%{transform:translate(6px,-6px)} 60%{transform:translate(-5px,-3px)} 80%{transform:translate(5px,8px)} }';
      document.head.appendChild(s);
    }

    // 2. Setup magic space void behind the shards
    var card = document.createElement('div');
    card.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:9001',
      'display:flex', 'align-items:center', 'justify-content:center',
      'background:radial-gradient(ellipse at center, #0a0f1e 0%, #000510 100%)',
      'opacity:1'
    ].join(';');

    for (var s = 0; s < 55; s++) {
      var star = document.createElement('div');
      var sz = 1 + Math.random() * 2.5;
      star.style.cssText = [
        'position:absolute',
        'width:' + sz + 'px', 'height:' + sz + 'px',
        'border-radius:50%',
        'background:rgba(255,255,255,' + (0.3 + Math.random() * 0.7) + ')',
        'left:' + (Math.random() * 100) + '%',
        'top:' + (Math.random() * 100) + '%',
        'animation:starTwinkle ' + (1.2 + Math.random() * 2) + 's ' + (Math.random() * 2) + 's ease-in-out infinite alternate'
      ].join(';');
      card.appendChild(star);
    }

    var quote = document.createElement('div');
    quote.style.cssText = [
      'text-align:center', 'font-family:Lora,serif', 'font-size:clamp(20px,5vw,30px)',
      'color:#ffffff', 'line-height:2', 'max-width:520px', 'padding:2rem',
      'opacity:0', 'transform:scale(0.88) translateY(16px)',
      'transition:opacity 0.7s ease 0.3s, transform 0.7s cubic-bezier(0.22,1,0.36,1) 0.3s',
      'text-shadow:0 0 40px rgba(74,159,212,0.6), 0 2px 20px rgba(255,255,255,0.2)',
      'position:relative', 'z-index:1'
    ].join(';');
    quote.innerHTML = '\u201cI wondered who you were,<br>and then I just&hellip;<br>let the question<br>become a smile.\u201d';
    card.appendChild(quote);

    var ring = document.createElement('div');
    ring.style.cssText = [
      'position:absolute', 'width:340px', 'height:340px', 'border-radius:50%',
      'border:1px solid rgba(74,159,212,0.25)', 'top:50%', 'left:50%',
      'transform:translate(-50%,-50%)', 'animation:ringPulse 2.8s ease-in-out infinite', 'z-index:0'
    ].join(';');
    card.appendChild(ring);

    if (!document.getElementById('warmth-kf')) {
      var kf = document.createElement('style');
      kf.id = 'warmth-kf';
      kf.textContent = [
        '@keyframes starTwinkle{0%{opacity:.2;transform:scale(.8)}100%{opacity:1;transform:scale(1.3)}}',
        '@keyframes ringPulse{0%,100%{transform:translate(-50%,-50%) scale(1);opacity:.25}50%{transform:translate(-50%,-50%) scale(1.18);opacity:.5}}'
      ].join('');
      document.head.appendChild(kf);
    }

    container.appendChild(card);

    // 3. After shake, shatter the glass!
    setTimeout(function() {
      if (typeof SFX !== 'undefined') SFX.shatter();
      quote.style.opacity = '1';
      quote.style.transform = 'scale(1) translateY(0)';

      shards.forEach(function(s) {
        var dx = Math.cos(s.a) * (300 + Math.random() * 200);
        var dy = Math.sin(s.a) * (300 + Math.random() * 200) + 200; // gravity bias
        var rot = (Math.random() - 0.5) * 120;
        
        s.el.style.transition = 'transform 1.2s cubic-bezier(0.15, 0.85, 0.35, 1), opacity 0.8s ease 0.4s';
        requestAnimationFrame(function() {
          s.el.style.transform = 'translate(' + dx + 'px, ' + dy + 'px) rotate(' + rot + 'deg) scale(0.6)';
          s.el.style.opacity = '0';
        });
      });

      // 4. Clean up and restore actual page after reading time
      setTimeout(function() {
        card.style.transition = 'opacity 0.7s ease';
        card.style.opacity = '0';

        setTimeout(function() {
          container.remove();
          btn.style.visibility = '';
          stage.style.visibility = '';

          var scroll = document.getElementById('poem-scroll');
          var el = document.createElement('div');
          el.className = 'poem-stanza';
          el.innerHTML = STANZAS[2];
          scroll.appendChild(el);
          requestAnimationFrame(function() {
            requestAnimationFrame(function() { el.classList.add('visible'); });
          });
          setTimeout(function() {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 200);
          showNext();
        }, 700);
      }, 3600); // reading time

    }, 450); // wait for shake
  }
}
