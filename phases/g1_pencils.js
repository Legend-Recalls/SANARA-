/* PHASE 1 — Catch pencils */
function g1_pencils() {
  setPanel('Chapter 2 of 11', 'Catch the pencils! \u270F\uFE0F', 'Tap each one before it falls! Catch 8 to continue.');
  var area = document.getElementById('g-area');

  var arena = document.createElement('div');
  arena.id = 'pencil-arena';
  area.appendChild(arena);

  var scoreEl = document.createElement('div');
  scoreEl.id = 'pencil-score';
  scoreEl.textContent = 'Caught: 0 / 8';
  area.appendChild(scoreEl);

  var msgEl = document.createElement('div');
  msgEl.id = 'pencil-msg';
  msgEl.textContent = 'Quick! She will be furious if you miss one.';
  area.appendChild(msgEl);

  var pencils = ['\u270F\uFE0F', '\uD83D\uDD8A\uFE0F', '\uD83D\uDD8B\uFE0F', '\uD83D\uDCDD', '\uD83D\uDCCF'];
  var caught = 0, spawning = true;

  function spawn() {
    if (!spawning || caught >= 8) return;
    var p = document.createElement('div');
    p.className = 'pencil-fall';
    p.textContent = pencils[Math.floor(Math.random() * pencils.length)];
    p.style.left = (8 + Math.random() * 78) + '%';
    var dur = 1.8 + Math.random() * 1.4;
    p.style.animationDuration = dur + 's';
    arena.appendChild(p);

    function hit() {
      if (p.dataset.hit) return;
      if (typeof SFX !== 'undefined') SFX.pencil();
      p.dataset.hit = '1';
      caught++;
      p.textContent = '\u2B50';
      p.style.animationPlayState = 'paused';
      p.style.transition = 'opacity 0.4s,transform 0.2s';
      p.style.transform = 'scale(1.5)';
      p.style.opacity = '0';
      setTimeout(function() { if (p.parentNode) p.remove(); }, 400);
      scoreEl.textContent = 'Caught: ' + caught + ' / 8';
      if (caught >= 8) {
        spawning = false;
        msgEl.textContent = '\u2728 She would approve. Pencils: safe.';
        addStanza(1);
        setTimeout(showNext, 800);
      }
    }

    p.addEventListener('click', hit);
    p.addEventListener('touchstart', function(e) { e.preventDefault(); hit(); });
    setTimeout(function() { if (p.parentNode) p.remove(); }, dur * 1000);
    if (spawning) setTimeout(spawn, 550 + Math.random() * 400);
  }
  spawn();
}
