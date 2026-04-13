/* PHASE 3 — Pick her blue (Dock Style) */
function g3_blue() {
  setPanel('Chapter 4 of 11', 'Find her blue. \uD83D\uDC99', 'There are many blues. Only one is hers. Hover to explore, click the one that feels like her.');
  var area = document.getElementById('g-area');

  // Inject dock CSS
  if (!document.getElementById('dock-css')) {
    var style = document.createElement('style');
    style.id = 'dock-css';
    style.textContent = `
      #blue-dock-wrap {
        --lerp-0: 1;
        --lerp-1: 0.5625;
        --lerp-2: 0.25;
        --lerp-3: 0.0625;
        --lerp-4: 0;
        margin: 2.5rem 0 1rem;
      }
      .blue-dock {
        display: flex;
        list-style-type: none;
        padding: 12px 16px;
        border-radius: 24px;
        gap: 12px;
        background: rgba(120, 160, 200, 0.15);
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(8px);
        margin: 0;
        transition: background 2.2s;
      }
      body.blue-theme .blue-dock { background: rgba(0, 0, 0, 0.25); }
      .blue-dock:hover { --show: 1; }

      .dock-item-wrap {
        width: 38px;
        height: 38px;
        display: grid;
        place-items: center;
        transition: flex 0.2s;
        flex: calc(0.2 + (var(--lerp, 0) * 1.5));
        position: relative;
        cursor: pointer;
      }

      .dock-item {
        width: 100%;
        aspect-ratio: 1;
        border-radius: 12px;
        background: var(--bg);
        display: inline-block;
        transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1), outline 0.2s, box-shadow 0.2s;
        transform-origin: 50% 100%;
        position: relative;
        transform: translateY(calc(var(--lerp, 0) * -55%));
        outline: 2px solid transparent;
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      }
      
      .dock-item:after {
        content: '';
        position: absolute;
        height: 100%; top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        aspect-ratio: 1;
        border-left: 3px solid rgba(255,255,255,0.7);
        border-top: 3px solid rgba(255,255,255,0.7);
        border-radius: 12px;
        mask: linear-gradient(135deg, black, transparent 50%);
        -webkit-mask: linear-gradient(135deg, black, transparent 50%);
      }

      .dock-item-wrap.chosen .dock-item {
        outline: 2px solid white;
        transform: translateY(-55%) scale(1.1);
        z-index: 10 !important;
      }

      :is(.dock-item-wrap:hover, .dock-item-wrap:focus-visible) {
        --lerp: var(--lerp-0);
        z-index: 5;
      }
      .dock-item-wrap:has( + :is(.dock-item-wrap:hover, .dock-item-wrap:focus-visible)),
      :is(.dock-item-wrap:hover, .dock-item-wrap:focus-visible) + .dock-item-wrap {
        --lerp: var(--lerp-1);
        z-index: 4;
      }
      .dock-item-wrap:has( + .dock-item-wrap + :is(.dock-item-wrap:hover, .dock-item-wrap:focus-visible)),
      :is(.dock-item-wrap:hover, .dock-item-wrap:focus-visible) + .dock-item-wrap + .dock-item-wrap {
        --lerp: var(--lerp-2);
        z-index: 3;
      }
      .dock-item-wrap:has( + .dock-item-wrap + .dock-item-wrap + :is(.dock-item-wrap:hover, .dock-item-wrap:focus-visible)),
      :is(.dock-item-wrap:hover, .dock-item-wrap:focus-visible) + .dock-item-wrap + .dock-item-wrap + .dock-item-wrap {
        --lerp: var(--lerp-3);
        z-index: 2;
      }
      .dock-item-wrap:has( + .dock-item-wrap + .dock-item-wrap + .dock-item-wrap + :is(.dock-item-wrap:hover, .dock-item-wrap:focus-visible)),
      :is(.dock-item-wrap:hover, .dock-item-wrap:focus-visible) + .dock-item-wrap + .dock-item-wrap + .dock-item-wrap + .dock-item-wrap {
        --lerp: var(--lerp-4);
        z-index: 1;
      }
    `;
    document.head.appendChild(style);
  }

  var wrap = document.createElement('div');
  wrap.id = 'blue-dock-wrap';
  area.appendChild(wrap);

  var dock = document.createElement('ul');
  dock.className = 'blue-dock';
  wrap.appendChild(dock);

  var colorMsg = document.createElement('div');
  colorMsg.id = 'color-msg';
  colorMsg.style.cssText = 'text-align: center; height: 24px; transition: color 0.3s;';
  colorMsg.textContent = 'Pick the one that feels like her calm.';
  area.appendChild(colorMsg);

  var gradients = [
    { bg: 'linear-gradient(135deg, #a8d8ea, #7bb9d1)', correct: false },
    { bg: 'linear-gradient(135deg, #1a3a5c, #0d1e30)', correct: false },
    { bg: 'linear-gradient(135deg, #a0c4ff, #8ab5f5)', correct: false },
    { bg: 'linear-gradient(135deg, #0077b6, #005a8a)', correct: false },
    { bg: 'linear-gradient(135deg, #4a9fd4, #1a5a8a)', correct: true }, // The true blue
    { bg: 'linear-gradient(135deg, #90e0ef, #48cae4)', correct: false },
    { bg: 'linear-gradient(135deg, #03045e, #023e8a)', correct: false },
    { bg: 'linear-gradient(135deg, #ade8f4, #90e0ef)', correct: false },
    { bg: 'linear-gradient(135deg, #5e60ce, #48bfe3)', correct: false }
  ];

  gradients.forEach(function(b) {
    var li = document.createElement('li');
    li.className = 'dock-item-wrap';
    
    var el = document.createElement('a');
    el.className = 'dock-item';
    el.style.setProperty('--bg', b.bg);
    
    li.appendChild(el);
    dock.appendChild(li);

    li.addEventListener('click', function() {
      document.querySelectorAll('.dock-item-wrap').forEach(function(s) { 
        s.classList.remove('chosen'); 
      });
      li.classList.add('chosen');

      if (b.correct) {
        colorMsg.textContent = '\uD83D\uDC99 Yes. That one. Blue suits her.';
        colorMsg.style.color = '#2d7db8';

        /* ── Slowly transition the whole page to blue ── */
        document.body.classList.add('blue-theme');

        addStanza(3);
        setTimeout(showNext, 900);
      } else {
        colorMsg.textContent = 'Hmm\u2026 close, but not quite her.';
        colorMsg.style.color = 'var(--muted)';
      }
    });
  });
}
