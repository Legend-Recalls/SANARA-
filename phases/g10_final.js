/* PHASE 10 — Final */
function g10_final() {
  setPanel('The last one. \uD83D\uDC99', 'You made it here.', 'Just read.');
  var area = document.getElementById('g-area');

  var reveal = document.createElement('div');
  reveal.id = 'final-reveal';
  var heart = document.createElement('span');
  heart.className = 'big-heart';
  heart.textContent = '\uD83D\uDC99';
  reveal.appendChild(heart);
  area.appendChild(reveal);

  addStanza(10, true);

  // Wait for the full reading time and cinematic transition of the final stanza
  setTimeout(function() {
    launchConfetti();
    if (typeof SFX !== 'undefined') SFX.party();
    nextBtn.textContent = '\uD83C\uDF82 Happy Birthday, Sanara! \uD83D\uDC99';
    nextBtn.classList.add('show');
    nextBtn.removeEventListener('click', nextPhase);
    
    nextBtn.addEventListener('click', function() {
      launchConfetti();
      if (typeof SFX !== 'undefined') SFX.party();
      document.getElementById('game-panel').style.display = 'none';
      document.getElementById('progress-fill').style.width = '100%';
      // Scroll to the bottom gently so she can read the full completed poem + signature
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });
  }, readingMs(10) + 1200);
}
