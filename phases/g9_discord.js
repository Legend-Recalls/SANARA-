/* PHASE 9 — Discord */
function g9_discord() {
  setPanel('Chapter 10 of 11', 'Where it all started.', 'Two years ago. One notification. Everything changed.');
  var area = document.getElementById('g-area');

  var wrap = document.createElement('div');
  wrap.id = 'discord-anim';
  var bubble = document.createElement('div');
  bubble.id = 'discord-bubble';
  bubble.textContent = '\uD83D\uDCAC';
  wrap.appendChild(bubble);
  var msgRow = document.createElement('div');
  msgRow.id = 'discord-msg-row';
  msgRow.innerHTML = 'A Discord ping.<br>A tiny ball of noise and energy and light.<br>And somehow \u2014 the realest thing.';
  wrap.appendChild(msgRow);
  area.appendChild(wrap);

  setTimeout(function() {
    bubble.style.transform = 'scale(1)';
    bubble.style.opacity = '1';
    if (typeof SFX !== 'undefined') SFX.ping();
    setTimeout(function() {
      msgRow.style.opacity = '1';
      addStanza(9);
      setTimeout(showNext, 1400);
    }, 900);
  }, 300);
}
