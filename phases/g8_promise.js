/* PHASE 8 — Promise */
function g8_promise() {
  setPanel('Chapter 9 of 11', 'A promise.', 'He means it. Seal it.');
  var area = document.getElementById('g-area');

  var quote = document.createElement('p');
  quote.style.cssText = 'font-family:Lora,serif;font-style:italic;font-size:16px;color:var(--blue3);line-height:1.9;text-align:center;';
  quote.innerHTML = '\u201cAnd forever the one who lingers,<br>Holding a lantern To the parts of you that went dark.\u201d';
  area.appendChild(quote);

  var promiseBtn = document.createElement('button');
  promiseBtn.id = 'promise-seal-btn';
  promiseBtn.textContent = '\uD83D\uDC99 I seal this promise';
  area.appendChild(promiseBtn);

  var promiseMsg = document.createElement('div');
  promiseMsg.id = 'promise-msg';
  area.appendChild(promiseMsg);

  promiseBtn.addEventListener('click', function() {
    promiseBtn.classList.add('sealed');
    promiseBtn.textContent = '\u2705 Promise sealed.';
    promiseMsg.textContent = 'Witnessed. \uD83D\uDC99';
    addStanza(8);
    setTimeout(showNext, 1000);
  });
}
