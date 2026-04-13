/* PHASE 4 — Discord Block Game */
function g4_shield() {
  setPanel('Chapter 5 of 11', 'Block the noise. 🚫', 'Protect your peace. Block the things that drain you.');
  var area = document.getElementById('g-area');
  
  if (!document.getElementById('discord-kf')) {
    var kf = document.createElement('style');
    kf.id = 'discord-kf';
    kf.textContent = `
      .dm-app {
        background: #2b2d31; border-radius: 12px; overflow: hidden;
        width: 100%; max-width: 420px; margin: 1.5rem auto 0;
        box-shadow: 0 12px 30px rgba(0,0,0,0.3);
        font-family: 'Nunito', sans-serif; color: #dbdee1;
        transition: background 1s ease;
      }
      .dm-header {
        background: #1e1f22; padding: 14px 16px; font-weight: 800; font-size: 15px;
        border-bottom: 1px solid #111214; display: flex; justify-content: space-between; align-items: center;
      }
      .dm-list { padding: 8px; transition: opacity 0.4s ease; }
      
      .dm-row {
        display: flex; align-items: center;
        max-height: 70px; padding: 10px; margin-bottom: 4px;
        border-radius: 6px; transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        overflow: hidden; cursor: default;
      }
      .dm-hover:hover { background: #35373c; }
      
      .dm-row.blocked {
        max-height: 0; padding-top: 0; padding-bottom: 0; margin-bottom: 0;
        opacity: 0; transform: translateX(-40px); pointer-events: none;
      }
      
      .block-btn {
        background: #da373c; color: white; border: none; border-radius: 4px;
        padding: 6px 14px; font-size: 12px; font-weight: 700; cursor: pointer;
        transition: background 0.2s, transform 0.1s; font-family: 'Nunito', sans-serif;
      }
      .block-btn:hover { background: #a1282b; }
      .block-btn:active { transform: scale(0.95); }
    `;
    document.head.appendChild(kf);
  }

  var appBox = document.createElement('div');
  appBox.className = 'dm-app';
  area.appendChild(appBox);

  var header = document.createElement('div');
  header.className = 'dm-header';
  appBox.appendChild(header);
  
  var title = document.createElement('div');
  title.textContent = 'Direct Messages';
  header.appendChild(title);
  
  var countBadge = document.createElement('div');
  countBadge.style.cssText = 'font-size:11px; background:#da373c; color:white; padding:2px 8px; border-radius:10px; font-weight:800;';
  countBadge.textContent = '4 New';
  header.appendChild(countBadge);

  var list = document.createElement('div');
  list.className = 'dm-list';
  appBox.appendChild(list);

  var dms = [
    { u: 'Him', m: 'I know I said I would, but...', c: '#5865F2' },
    { u: 'The Excuses', m: 'I just have a lot going on rn. Sorry.', c: '#FAA61A' },
    { u: 'The Smallness', m: 'You ask for way too much anyway.', c: '#ED4245' },
    { u: 'The Past', m: '[Read 4 years ago]', c: '#4f545c', italic: true }
  ];

  var blocked = 0;

  dms.forEach(function(dm) {
     var row = document.createElement('div');
     row.className = 'dm-row dm-hover';
     
     var av = document.createElement('div');
     av.style.cssText = 'width:42px; height:42px; border-radius:50%; background:' + dm.c + '; flex-shrink:0; margin-right:12px; display:flex; align-items:center; justify-content:center; color:white; font-size:20px; font-weight:800; text-shadow:0 1px 3px rgba(0,0,0,0.3);';
     av.textContent = dm.u.charAt(0);
     row.appendChild(av);

     var texts = document.createElement('div');
     texts.style.flex = '1';
     texts.style.minWidth = '0';
     texts.style.marginRight = '12px';
     
     var name = document.createElement('div');
     name.style.cssText = 'font-weight:700; font-size:15px; color:#f2f3f5; margin-bottom:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;';
     name.textContent = dm.u;
     texts.appendChild(name);

     var msg = document.createElement('div');
     msg.style.cssText = 'font-size:13px; color:#b5bac1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; line-height:1.2;';
     if (dm.italic) msg.style.fontStyle = 'italic';
     msg.textContent = dm.m;
     texts.appendChild(msg);

     row.appendChild(texts);

     var btn = document.createElement('button');
     btn.className = 'block-btn';
     btn.textContent = 'Block';
     row.appendChild(btn);

     btn.addEventListener('click', function() {
        if (typeof SFX !== 'undefined') SFX.sweep();
        row.classList.add('blocked');
        blocked++;
        
        var remaining = dms.length - blocked;
        if (remaining > 0) {
            countBadge.textContent = remaining + ' New';
        } else {
            countBadge.remove();
            if (typeof SFX !== 'undefined') {
              setTimeout(function(){ SFX.chime(); }, 600);
            }
            setTimeout(winSequence, 600);
        }
     });

     list.appendChild(row);
  });

  function winSequence() {
     list.style.opacity = '0';
     setTimeout(function() {
         list.remove();
         header.style.borderBottom = 'none';
         appBox.style.background = '#1a3a5c'; // Transition to deeper blue match
         
         var peace = document.createElement('div');
         peace.style.cssText = 'padding:50px 20px; text-align:center; color:#4a9fd4; font-weight:800; font-size:18px; opacity:0; transition:opacity 0.6s ease;';
         peace.innerHTML = '✨ Zero unread negativity.<br><span style="font-size:14px; color:#a0c4ff; font-weight:600; margin-top:10px; display:block;">Your peace is protected.</span>';
         appBox.appendChild(peace);
         
         requestAnimationFrame(function() {
             requestAnimationFrame(function() {
                 peace.style.opacity = '1';
                 setTimeout(function() {
                     addStanza(4);
                     setTimeout(showNext, readingMs(4) + 600);
                 }, 1300);
             });
         });
     }, 400); 
  }
}
