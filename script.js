(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  root.classList.add('js');

  /* mobile menu */
  var hdr = doc.getElementById('hdr'), burger = hdr.querySelector('.burger'), mnav = doc.getElementById('mnav');
  function setMenu(open) {
    hdr.classList.toggle('open', open);
    root.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Zamknij menu' : 'Menu');
  }
  burger.addEventListener('click', function () { setMenu(!hdr.classList.contains('open')); });
  mnav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  doc.addEventListener('click', function (e) { if (hdr.classList.contains('open') && !hdr.contains(e.target)) setMenu(false); });

  /* reveal on scroll */
  var items = [].slice.call(doc.querySelectorAll('.rv'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    items.forEach(function (el) { io.observe(el); });
  } else { items.forEach(function (el) { el.classList.add('in'); }); }

  /* gallery lightbox: opens the clicked photo, arrows and keys step through */
  var lb = doc.getElementById('lb'), btns = [].slice.call(doc.querySelectorAll('.g-btn'));
  var lbImg = lb.querySelector('img'), lbCap = lb.querySelector('figcaption'), cur = 0, opener = null;
  function show(i) {
    cur = (i + btns.length) % btns.length;
    var b = btns[cur], im = b.querySelector('img');
    lbImg.src = b.getAttribute('data-full'); lbImg.alt = im.alt;
    lbCap.textContent = (cur + 1) + ' / ' + btns.length + ' · ' + im.alt;
  }
  function openLb(i) { opener = btns[i]; show(i); lb.hidden = false; doc.body.style.overflow = 'hidden'; lb.querySelector('.lb-x').focus(); }
  function closeLb() { lb.hidden = true; doc.body.style.overflow = ''; if (opener) opener.focus(); }
  btns.forEach(function (b, i) { b.addEventListener('click', function () { openLb(i); }); });
  lb.querySelector('.lb-x').addEventListener('click', closeLb);
  lb.querySelector('.lb-p').addEventListener('click', function () { show(cur - 1); });
  lb.querySelector('.lb-n').addEventListener('click', function () { show(cur + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  doc.addEventListener('keydown', function (e) {
    if (!lb.hidden) {
      if (e.key === 'Escape') closeLb();
      else if (e.key === 'ArrowLeft') show(cur - 1);
      else if (e.key === 'ArrowRight') show(cur + 1);
      else if (e.key === 'Tab') {
        var f = [].slice.call(lb.querySelectorAll('button')), k = f.indexOf(doc.activeElement);
        e.preventDefault(); f[(k + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    } else if (e.key === 'Escape' && hdr.classList.contains('open')) { setMenu(false); burger.focus(); }
  });

  /* form -> mail program (window.__noNav lets the page test read the address without opening a mail program) */
  var form = doc.getElementById('cform');
  if (form) {
    var err = form.querySelector('.f-err');
    var M = { name: 'Wpisz, proszę, swoje imię.', contact: 'Podaj telefon lub adres e-mail.', msg: 'Napisz krótko, czego dotyczy zlecenie.',
              subj: 'Zapytanie ze strony La-DACH', n: 'Imię: ', c: 'Telefon lub e-mail: ' };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements, name = f.name.value.trim(), contact = f.contact.value.trim(), msg = f.msg.value.trim();
      [f.name, f.contact, f.msg].forEach(function (x) { x.removeAttribute('aria-invalid'); });
      var okContact = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact) || contact.replace(/\D/g, '').length >= 9;
      var bad = name.length < 2 ? [f.name, M.name] : (!okContact ? [f.contact, M.contact] : (msg.length < 5 ? [f.msg, M.msg] : null));
      if (bad) { bad[0].setAttribute('aria-invalid', 'true'); err.textContent = bad[1]; err.hidden = false; bad[0].focus(); return; }
      err.hidden = true;
      var body = M.n + name + '\n' + M.c + contact + '\n\n' + msg;
      var url = 'mailto:' + form.getAttribute('data-mail') + '?subject=' + encodeURIComponent(M.subj) + '&body=' + encodeURIComponent(body);
      window.__mailto = url;
      if (!window.__noNav) window.location.href = url;
    });
  }
})();
