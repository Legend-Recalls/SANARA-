'use strict';

var SFX = {
  ctx: null,
  init: function() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  },
  
  playTone: function(freq, type, duration, vol, rampType) {
    this.init();
    var osc = this.ctx.createOscillator();
    var gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    if (rampType === 'exp') {
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    } else {
      gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + duration);
    }
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  },

  hover: function() { this.playTone(330, 'sine', 0.06, 0.015, 'exp'); },
  click: function() { this.playTone(261, 'sine', 0.12, 0.05, 'exp'); },
  pop: function(pitchOffset) {
    this.init();
    var osc = this.ctx.createOscillator();
    var gain = this.ctx.createGain();
    osc.type = 'sine';
    
    var baseFreq = 600 + (pitchOffset || 0);
    osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, this.ctx.currentTime + 0.12);
    
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  },
  chime: function(noteFreq) {
    var freqs = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
    var freq = noteFreq ? noteFreq : freqs[Math.floor(Math.random() * freqs.length)];
    this.playTone(freq, 'sine', 1.2, 0.1, 'exp');
  },
  
  holdGain: null,
  holdInterval: null,
  birdsAudio: null,
  birdsFadeInterval: null,
  pageAudio: null,
  holdStart: function() {
    this.init();
    if (this.holdInterval) return;

    if (!this.birdsAudio) {
      this.birdsAudio = new Audio('music/birds.mp3');
      this.birdsAudio.loop = true;
    }
    this.birdsAudio.volume = 0;
    this.birdsAudio.play().catch(function(e){ console.log("Birds audio wait:", e); });
    
    // Fade in birds
    var b = this.birdsAudio;
    if (this.birdsFadeInterval) clearInterval(this.birdsFadeInterval);
    this.birdsFadeInterval = setInterval(function(){
      if (b.volume < 0.25) b.volume += 0.02;
      else { 
        b.volume = 0.3; 
        clearInterval(this.birdsFadeInterval); 
        this.birdsFadeInterval = null; 
      }
    }.bind(this), 50);
    
    this.holdGain = this.ctx.createGain();
    this.holdGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.holdGain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 0.8);
    this.holdGain.connect(this.ctx.destination);

    // Beautiful upward blooming arpeggio (Gmaj9)
    var freqs = [392.00, 493.88, 587.33, 698.46, 880.00, 1174.66]; 
    var idx = 0;
    var self = this;

    this.holdInterval = setInterval(function() {
      var osc = self.ctx.createOscillator();
      var gain = self.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freqs[idx % freqs.length], self.ctx.currentTime);
      
      // Soft petal-like bloom attack & decay
      gain.gain.setValueAtTime(0, self.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.05, self.ctx.currentTime + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, self.ctx.currentTime + 1.2);
      
      osc.connect(gain);
      gain.connect(self.holdGain);
      osc.start();
      osc.stop(self.ctx.currentTime + 1.5);
      
      idx++;
      if (idx % freqs.length === 0) idx = 0; // Loop the ascent
    }, 160);
  },
  holdStop: function() {
    if (!this.holdInterval) return;
    clearInterval(this.holdInterval);
    this.holdInterval = null;

    if (this.birdsAudio) {
      if (this.birdsFadeInterval) clearInterval(this.birdsFadeInterval);
      var b = this.birdsAudio;
      this.birdsFadeInterval = setInterval(function(){
        if (b.volume > 0.02) b.volume -= 0.02;
        else { 
          b.volume = 0; 
          b.pause(); 
          clearInterval(this.birdsFadeInterval); 
          this.birdsFadeInterval = null;
        }
      }.bind(this), 50);
    }
    
    if (this.holdGain) {
      this.holdGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);
      var old = this.holdGain;
      setTimeout(function() { try{ old.disconnect(); }catch(e){} }, 700);
      this.holdGain = null;
    }
  },
  
  sweep: function() {
    this.init();
    var bufSize = this.ctx.sampleRate * 0.15; 
    var buffer = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    
    var noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    var filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.15);
    
    var gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    noise.start();
  },
  
  paper: function() {
    this.init();
    if (!this.pageAudio) {
      this.pageAudio = new Audio('music/page.mp3');
    }
    this.pageAudio.currentTime = 0;
    this.pageAudio.volume = 0.5;
    this.pageAudio.play().catch(function(e){ console.log("Page audio wait:", e); });
  },
  
  pencil: function() {
    this.init();
    var osc = this.ctx.createOscillator();
    var gain = this.ctx.createGain();
    osc.type = 'sine';
    
    // Quick woody thwack
    osc.frequency.setValueAtTime(700, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.04);
    
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  },
  
  crack: function() {
    this.init();
    var osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.12);
    
    var oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  },
  
  shatter: function() {
    this.init();

    // High frequency glass noise burst
    var bufSize = this.ctx.sampleRate * 0.3;
    var buffer = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);
    
    var noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    var filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 5000;
    
    var noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
    
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    
    noise.start();
  },

  ping: function() {
    this.init();
    var osc = this.ctx.createOscillator();
    var gain = this.ctx.createGain();
    osc.type = 'sine';
    
    // High bright ping (notification-like)
    osc.frequency.setValueAtTime(987.77, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  },

  party: function() {
    this.pop(200);
    var self = this;
    setTimeout(function() {
      self.chime(523.25);
      self.chime(659.25);
      self.chime(783.99);
      self.chime(1046.50);
    }, 80);
  }
};

// Global Interactive Hooks
document.addEventListener('mouseover', function(e) {
  var t = e.target;
  if (t.tagName === 'BUTTON' || t.classList.contains('swatch') || t.classList.contains('dm-hover') || (t.closest && t.closest('.dock-item-wrap'))) {
    SFX.hover();
  }
});
document.addEventListener('mousedown', function(e) {
  var t = e.target;
  if (t.tagName === 'BUTTON' || t.classList.contains('swatch') || t.classList.contains('dm-hover') || (t.closest && t.closest('.dock-item-wrap'))) {
    SFX.click();
  }
});

var STANZAS = [
  'You came into my life like spring does,<br>quietly at first, then all at once.',
  'The bell.<br>A Discord ping.<br>Just this tiny ball of noise and energy and light<br>chaos, honestly. The good kind.<br>The class hoarding her pencils in den,<br>married to Anya, yelling "wiwiwiwwi"<br>at nobody and everybody at once.',
  'I wondered who you were,<br>and then I just...<br>let the question<br>become a smile.',
  'Blue suits you.<br>It isn\u2019t just a color,<br>the calm inside your storm,<br>the soft truth behind your laughter.<br>You feel like golden fields in spring,<br>like the world remembering how to bloom.',
  'I still get angry when I think of him.<br>The excuses. The smallness of it.<br>You deserved better then.<br>You deserve better always.',
  'And I see you, Sanara \u2014<br>even when you go quiet.<br>Even when the overthinking gets loud.<br>You don\'t have to perform the happy version for me.<br>I\'m here for that too.',
  'You\'re still the girl with nothing left to hide.<br>You still show up.<br>You still laugh.<br>You still shine.<br>You carry this strange little magic<br>that makes people feel less alone<br>and you don\'t even try.',
  'So chase the bike.<br>Protect the pencils.<br>Fight your fights.',
  'Constant, quiet ghost, <br>I see the gold in your soul<br>When you see only grey.<br>And forever the one who lingers,<br>Holding a lantern To the parts of you that went dark.',
  'Because you\'re proof that people can show up<br>in the strangest places<br>and still be the realest thing.',
  'I\'d give anything<br>just to keep watching you grow.<br><br><span style="font-style:normal; font-weight:600; letter-spacing:0.05em;">I love you.</span>'
];

var phase = 0;
var TOTAL = STANZAS.length;
var nextBtn;
var skipBtn;
var _stanzaShown = {};

function showToast(text) {
  var t = document.createElement('div');
  t.textContent = text;
  t.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);top:52%;background:rgba(26,26,46,0.82);color:#fff;padding:8px 20px;border-radius:30px;font-family:Nunito,sans-serif;font-weight:700;font-size:15px;pointer-events:none;z-index:5000;opacity:0;transition:opacity .25s ease;';
  document.body.appendChild(t);
  requestAnimationFrame(function(){
    requestAnimationFrame(function(){ t.style.opacity = '1'; });
  });
  setTimeout(function(){ t.style.opacity = '0'; setTimeout(function(){ t.remove(); }, 300); }, 900);
}

function runawayBtn(btn, onDone, jumpImmediately) {
  var escapes = 0;
  var messages = ['Nope! 😂', 'Almost! 👀'];

  function jump() {
    var margin = 60;
    var bW = btn.offsetWidth;
    var bH = btn.offsetHeight;
    var maxX = window.innerWidth  - bW - margin;
    var maxY = window.innerHeight - bH - margin;
    var newX = margin + Math.random() * (maxX - margin);
    var newY = margin + Math.random() * (maxY - margin);
    var rot  = (Math.random() - 0.5) * 22;

    btn.style.transition = 'left 0.38s cubic-bezier(0.34,1.56,0.64,1), top 0.38s cubic-bezier(0.34,1.56,0.64,1), transform 0.38s cubic-bezier(0.34,1.56,0.64,1)';
    btn.style.left      = newX + 'px';
    btn.style.top       = newY + 'px';
    btn.style.transform = 'rotate(' + rot + 'deg)';
    showToast(messages[escapes - 1]);
  }

  // Drop a ghost placeholder so the splash text doesn't move
  var rect = btn.getBoundingClientRect();
  var ghost = document.createElement('div');
  ghost.style.cssText = 'width:' + btn.offsetWidth + 'px;height:' + btn.offsetHeight + 'px;flex-shrink:0;';
  btn.parentNode.insertBefore(ghost, btn);

  // Pin the button to its current spot using fixed positioning
  btn.style.position  = 'fixed';
  btn.style.margin    = '0';
  btn.style.left      = rect.left + 'px';
  btn.style.top       = rect.top  + 'px';
  btn.style.zIndex    = '5000';
  // Force layout before enabling transitions
  btn.getBoundingClientRect();

  function handleClick(e) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    escapes++;
    if (escapes < 3) {
      jump();
    } else {
      btn.removeEventListener('click', handleClick);
      btn.style.transition = 'left 0.3s ease, top 0.3s ease, transform 0.3s ease';
      btn.style.transform  = 'scale(1.08) rotate(0deg)';
      setTimeout(function(){
        ghost.remove();
        btn.style.position  = '';
        btn.style.left      = '';
        btn.style.top       = '';
        btn.style.transform = '';
        btn.style.zIndex    = '';
        btn.style.margin    = '';
        btn.style.transition = '';
        onDone();
      }, 180);
    }
  }

  btn.addEventListener('click', handleClick);

  if (jumpImmediately) {
    handleClick();
  }
}

function init() {
  var btn = document.getElementById('start-btn');
  btn.addEventListener('click', function onFirstClick(e) {
    e.preventDefault();
    btn.removeEventListener('click', onFirstClick);
    runawayBtn(btn, startGame, true);
  });
  nextBtn = document.getElementById('next-btn');
  nextBtn.addEventListener('click', nextPhase);
  skipBtn = document.getElementById('skip-btn');
  if (skipBtn) {
    skipBtn.addEventListener('click', function() {
      clearArea();
      var msg = document.createElement('div');
      msg.style.color = 'var(--muted)';
      msg.style.fontStyle = 'italic';
      msg.style.marginTop = '1rem';
      msg.textContent = 'Skipped this phase.';
      document.getElementById('g-area').appendChild(msg);
      addStanza(phase, phase === TOTAL - 1);
      // showNext after cinematic finishes (reading time + 620ms transition + buffer)
      setTimeout(showNext, readingMs(phase) + 720);
    });
  }
}

function burstHearts(callback) {
  var overlay = document.getElementById('heart-overlay');
  overlay.innerHTML = '';

  var W = window.innerWidth;
  var H = window.innerHeight;
  var cx = W / 2;
  var cy = H / 2;

  // Expanding ring pulses
  [0, 0.15, 0.32].forEach(function(d) {
    var ring = document.createElement('div');
    ring.className = 'heart-ring';
    ring.style.setProperty('--rd', d + 's');
    overlay.appendChild(ring);
  });

  // Play a beautiful cluster of wind chimes to match the burst
  for (var p = 0; p < 16; p++) {
    setTimeout(function() { SFX.chime(); }, p * 40 + Math.random() * 30);
  }

  // Heart particles radiating in all directions
  var emojis = ['❤️','🩷','💗','💖','💓','💝','💕'];
  var count = 54;
  for (var i = 0; i < count; i++) {
    (function(idx) {
      var el = document.createElement('span');
      el.className = 'heart-particle';

      var angle   = (idx / count) * 2 * Math.PI + (Math.random() - 0.5) * 0.4;
      var dist    = 200 + Math.random() * Math.max(W, H) * 0.6;
      var tx      = Math.cos(angle) * dist;
      var ty      = Math.sin(angle) * dist;
      var dur     = 1.1 + Math.random() * 0.7;
      var delay   = Math.random() * 0.25;
      var rot     = (Math.random() - 0.5) * 40;
      var rot2    = (Math.random() - 0.5) * 60;
      var size    = 20 + Math.random() * 26;
      var startX  = cx + (Math.random() - 0.5) * 120;
      var startY  = cy + (Math.random() - 0.5) * 120;

      el.textContent = emojis[idx % emojis.length];
      el.style.left       = startX + 'px';
      el.style.top        = startY + 'px';
      el.style.fontSize   = size + 'px';
      el.style.setProperty('--tx',    tx   + 'px');
      el.style.setProperty('--ty',    ty   + 'px');
      el.style.setProperty('--dur',   dur  + 's');
      el.style.setProperty('--delay', delay + 's');
      el.style.setProperty('--rot',   rot  + 'deg');
      el.style.setProperty('--rot2',  rot2 + 'deg');
      overlay.appendChild(el);
    })(i);
  }

  // Trigger fade-in of overlay
  requestAnimationFrame(function() {
    requestAnimationFrame(function() { overlay.classList.add('active'); });
  });

  // After animation peaks, fade overlay out, then run callback
  setTimeout(function() {
    overlay.classList.remove('active');
    overlay.classList.add('fade-out');
    setTimeout(function() {
      overlay.innerHTML = '';
      overlay.classList.remove('fade-out');
      callback();
    }, 850);
  }, 1600);
}

function startGame() {
  // Disable button immediately
  var btn = document.getElementById('start-btn');
  btn.disabled = true;

  burstHearts(function() {
    var splash = document.getElementById('splash');
    splash.classList.add('hide');
    setTimeout(function() {
      splash.style.display = 'none';
      document.getElementById('stage').style.display = 'flex';
      loadPhase(0);
    }, 900);
  });
}

function updateProgress() {
  document.getElementById('progress-fill').style.width = (phase / TOTAL * 100) + '%';
}

function readingMs(idx) {
  // Strip HTML tags and count words
  var plain = STANZAS[idx].replace(/<[^>]+>/g, ' ');
  var words = plain.trim().split(/\s+/).filter(Boolean).length;
  // ~420ms per word + generous 1s base. Clamped 3000ms - 9000ms.
  // Gives her plenty of time to take in the profound quotes.
  return Math.min(9000, Math.max(3000, 1000 + words * 420));
}

function addStanza(idx, isFinal) {
  if (_stanzaShown[idx]) return;
  _stanzaShown[idx] = true;
  var cinema  = document.getElementById('quote-cinema');
  var cinText = document.getElementById('cinema-text');
  var holdMs  = readingMs(idx);

  // Inject quote text
  cinText.innerHTML = STANZAS[idx] + '<span id="cinema-line"></span>';

  // Step 1: dim + float the text in
  cinema.classList.add('dim');
  requestAnimationFrame(function() {
    requestAnimationFrame(function() { 
      cinText.classList.add('show'); 
      if (typeof SFX !== 'undefined') SFX.paper();
    });
  });

  // Step 2: hold for reading time, then push back and un-dim
  setTimeout(function() {
    cinText.classList.remove('show');
    cinText.classList.add('pushback');
    cinema.classList.remove('dim');
    cinema.classList.add('undim');

    // Step 3: once faded, reset overlay and add stanza to scroll
    setTimeout(function() {
      cinText.classList.remove('pushback');
      cinema.classList.remove('undim');
      cinText.innerHTML = '';

      var scroll = document.getElementById('poem-scroll');
      var el = document.createElement('div');
      el.className = 'poem-stanza' + (isFinal ? ' final-stanza' : '');
      el.innerHTML = STANZAS[idx];
      scroll.appendChild(el);
      requestAnimationFrame(function() {
        requestAnimationFrame(function() { el.classList.add('visible'); });
      });
      if (isFinal) {
        setTimeout(function() {
          var sig = document.createElement('div');
          sig.className = 'poem-sig';
          sig.textContent = '\u2014 your brother';
          scroll.appendChild(sig);
          requestAnimationFrame(function() {
            requestAnimationFrame(function() { sig.classList.add('visible'); });
          });
        }, 600);
      }
      setTimeout(function() { el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 200);
    }, 620);
  }, holdMs);
}


function showNext() { 
  nextBtn.classList.add('show'); 
  if (skipBtn) skipBtn.classList.remove('show');
}
function hideNext() { 
  nextBtn.classList.remove('show'); 
  if (skipBtn && phase < TOTAL - 1) skipBtn.classList.add('show');
}

function nextPhase() {
  phase++;
  updateProgress();
  loadPhase(phase);
}

function setPanel(label, title, desc) {
  document.getElementById('g-label').textContent = label;
  document.getElementById('g-title').textContent = title;
  document.getElementById('g-desc').textContent = desc;
}

function clearArea() {
  document.getElementById('g-area').innerHTML = '';
}

function loadPhase(p) {
  _stanzaShown = {};
  hideNext();
  clearArea();
  updateProgress();
  // phases are loaded from their respective files globally
  var phases = [g0_spring, g1_pencils, g2_warmth, g3_blue, g4_shield, g5_fog, g6_stars, g7_bike, g8_promise, g9_discord, g10_final];
  if (phases[p]) phases[p]();
}

function launchConfetti() {
  var colors = ['#4a9fd4', '#f5c842', '#7bc67e', '#f5a3b5', '#e84393', '#5865F2'];
  var container = document.getElementById('confetti-container');
  for (var i = 0; i < 80; i++) {
    (function(delay) {
      setTimeout(function() {
        var p = document.createElement('div');
        p.className = 'conf-piece';
        p.style.left = Math.random() * 100 + 'vw';
        p.style.background = colors[Math.floor(Math.random() * colors.length)];
        p.style.width = (6 + Math.random() * 8) + 'px';
        p.style.height = (6 + Math.random() * 8) + 'px';
        p.style.animationDuration = (2 + Math.random() * 2) + 's';
        container.appendChild(p);
        setTimeout(function() { if (p.parentNode) p.remove(); }, 4500);
      }, delay);
    })(i * 30);
  }
}

document.addEventListener('DOMContentLoaded', init);
