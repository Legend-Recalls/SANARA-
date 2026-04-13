/* PHASE 7 — The Epic Bike Journey */
function g7_bike() {
  setPanel('Chapter 8 of 11', 'The Journey. 🚲', 'Tap to keep moving forward. Do not let anything stop her.');
  var area = document.getElementById('g-area');
  
  // Custom animations for the phase
  if (!document.getElementById('bike-kf')) {
    var kf = document.createElement('style');
    kf.id = 'bike-kf';
    kf.textContent = `
      @keyframes runAnim {
        0%, 100% { transform: scaleX(-1) translateY(0px) rotate(0deg); }
        50% { transform: scaleX(-1) translateY(-4px) rotate(-5deg); }
      }
      @keyframes flingAnim {
        0% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 1; }
        100% { transform: translate(150px, -200px) rotate(720deg) scale(0.5); opacity: 0; }
      }
      @keyframes roadMove {
        from { background-position: 0 0; }
        to { background-position: -40px 0; }
      }
      .track-container {
        position: relative; width: 100%; height: 120px; border-radius: 12px;
        background: linear-gradient(180deg, #1a3a5c 0%, #0d1f3c 60%, #152238 100%);
        overflow: hidden; margin-top: 1.5rem; box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
      }
      .road-line {
        position: absolute; bottom: 20px; width: 200%; height: 4px;
        background-image: repeating-linear-gradient(90deg, #5a6a7a 0px, #5a6a7a 20px, transparent 20px, transparent 40px);
      }
      .track-item {
        position: absolute; bottom: 22px; font-size: 28px;
        transition: transform 0.2s, opacity 0.2s; user-select: none;
      }
      .rider-container {
        position: absolute; bottom: 22px; transition: left 0.3s linear;
        display: flex; align-items: flex-end; z-index: 10;
      }
      .rider-char {
        font-size: 32px; animation: runAnim 0.3s infinite;
        transform-origin: bottom center; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
      }
      .rider-gear {
        position: absolute; font-size: 16px; top: 0; left: 16px; opacity: 0;
        transition: opacity 0.3s;
      }
    `;
    document.head.appendChild(kf);
  }

  var track = document.createElement('div');
  track.className = 'track-container';
  
  var roadLine = document.createElement('div');
  roadLine.className = 'road-line';
  track.appendChild(roadLine);

  /* --- Spawning track items --- */
  var bikeItem = document.createElement('div');
  bikeItem.className = 'track-item';
  bikeItem.textContent = '🚲';
  bikeItem.style.left = '30%';
  track.appendChild(bikeItem);

  var bagItem = document.createElement('div');
  bagItem.className = 'track-item';
  bagItem.style.left = '55%';
  bagItem.style.fontSize = '24px';
  bagItem.innerHTML = '🎒<span style="font-size:18px;position:relative;top:-8px;left:-6px;">✏️</span>';
  track.appendChild(bagItem);

  var evilItem = document.createElement('div');
  evilItem.className = 'track-item';
  evilItem.textContent = '🦹‍♂️';
  evilItem.style.left = '82%';
  track.appendChild(evilItem);

  /* --- The Rider --- */
  var riderCnt = document.createElement('div');
  riderCnt.className = 'rider-container';
  riderCnt.style.left = '5%';
  
  var charEl = document.createElement('div');
  charEl.className = 'rider-char';
  charEl.textContent = '🏃‍♀️';
  
  var gearEl = document.createElement('div');
  gearEl.className = 'rider-gear';
  gearEl.innerHTML = '🎒<br><span style="position:relative;left:10px;">✏️</span>';

  riderCnt.appendChild(charEl);
  riderCnt.appendChild(gearEl);
  track.appendChild(riderCnt);
  area.appendChild(track);

  var msgEl = document.createElement('div');
  msgEl.style.cssText = 'text-align:center; margin-top:1rem; font-size:15px; color:var(--text); transition: color 0.4s, opacity 0.4s; font-weight: 700; height: 24px;';
  msgEl.textContent = 'She is running. Tap to keep going!';
  area.appendChild(msgEl);

  var tapBtn = document.createElement('button');
  tapBtn.className = 'game-btn';
  tapBtn.textContent = 'Tap to Move';
  tapBtn.style.cssText = 'display:block; margin: 1rem auto 0; background:linear-gradient(135deg,#4a9fd4,#2d7db8); color:white; padding:12px 32px; font-size:16px; border-radius:50px; border:none; font-weight:800; cursor:pointer; transition:transform 0.1s, box-shadow 0.1s; box-shadow:0 6px 20px rgba(74,159,212,0.4);';
  
  tapBtn.addEventListener('mousedown', function(){ tapBtn.style.transform='scale(0.95)'; });
  tapBtn.addEventListener('mouseup', function(){ tapBtn.style.transform='none'; });
  tapBtn.addEventListener('touchstart', function(){ tapBtn.style.transform='scale(0.95)'; }, {passive:true});
  tapBtn.addEventListener('touchend', function(){ tapBtn.style.transform='none'; });
  
  area.appendChild(tapBtn);

  var progress = 0;
  var hasBike = false;
  var hasBag = false;
  var hasHit = false;
  var isDone = false;

  tapBtn.addEventListener('click', function() {
    if (isDone) return;
    
    // Animate road to simulate forward movement
    roadLine.style.animation = 'roadMove 0.2s linear';
    setTimeout(function() { roadLine.style.animation = 'none'; }, 200);

    progress += 4;
    var currentLeft = 5 + (progress * 0.85); // goes up to ~90%
    if (currentLeft > 95) currentLeft = 95;
    
    riderCnt.style.left = currentLeft + '%';

    // Event 1: Found the Bike
    if (currentLeft >= 26 && !hasBike) {
      hasBike = true;
      if (typeof SFX !== 'undefined') SFX.chime();
      bikeItem.style.opacity = '0';
      setTimeout(function(){ bikeItem.remove(); }, 200);
      charEl.textContent = '🚴‍♀️';
      charEl.style.animationDuration = '0.5s'; // Smooth out the bobbing since she's riding now
      msgEl.textContent = 'She got the bike! Moving faster now.';
      msgEl.style.color = '#4a9fd4';
      progress += 2; // small boost
    }

    // Event 2: Found the Pencil & Bag
    if (currentLeft >= 51 && !hasBag) {
      hasBag = true;
      if (typeof SFX !== 'undefined') { SFX.paper(); setTimeout(function(){ SFX.pencil(); }, 100); }
      bagItem.style.opacity = '0';
      setTimeout(function(){ bagItem.remove(); }, 200);
      gearEl.style.opacity = '1';
      msgEl.textContent = 'Picked up her gear. Nothing can stop her.';
      msgEl.style.color = '#7bc67e';
    }

    // Event 3: Fight the Evil Person
    if (currentLeft >= 76 && !hasHit) {
      hasHit = true;
      if (typeof SFX !== 'undefined') SFX.shatter();
      // Smash!
      evilItem.style.animation = 'flingAnim 0.7s cubic-bezier(0.15, 0.85, 0.35, 1) forwards';
      setTimeout(function(){ evilItem.remove(); }, 700);
      
      // Impact effect
      charEl.style.transform = 'scale(1.2)';
      setTimeout(function(){ charEl.style.transform = 'scale(1)'; }, 150);
      
      msgEl.textContent = 'BOOM. Out of her way.';
      msgEl.style.color = '#e05555';
      
      // Boost past the enemy
      progress += 6; 
      riderCnt.style.left = (5 + progress * 0.85) + '%';
    }

    // Event 4: Win
    if (progress >= 100) {
      isDone = true;
      if (typeof SFX !== 'undefined') {
        setTimeout(function(){ SFX.chime(880.00); }, 100);
        setTimeout(function(){ SFX.chime(1046.50); }, 400); 
      }
      msgEl.innerHTML = '✨ She broke through it all. <span style="font-weight:400; font-style:italic;">Untouchable.</span>';
      msgEl.style.color = '#f5c842';
      
      tapBtn.style.opacity = '0';
      setTimeout(function(){ tapBtn.remove(); }, 300);

      // Ride off into the distance
      riderCnt.style.transition = 'left 1.2s ease-in, transform 1.2s ease-in';
      riderCnt.style.left = '120%';
      riderCnt.style.transform = 'scale(0.8)';
      
      setTimeout(function() {
        addStanza(7);
        setTimeout(showNext, readingMs(7) + 600);
      }, 1400);
    }
  });
}
