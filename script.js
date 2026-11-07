(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const WA = '77000000000';

  // Preloader
  document.body.classList.add('loading');
  const finish = () => {
    $('#preloader').classList.add('done');
    document.body.classList.remove('loading');
    document.body.classList.add('ready');
    $$('.hero .reveal').forEach((el, i) => setTimeout(() => el.classList.add('in'), 300 + i * 90));
  };
  window.addEventListener('load', () => setTimeout(finish, reduced ? 0 : 900));
  setTimeout(finish, 3500);

  $('#year').textContent = new Date().getFullYear();

  // Nav state + scroll progress
  const nav = $('#nav'), bar = $('#progress');
  const onScroll = () => {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    nav.classList.toggle('scrolled', y > 30);
    bar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  const burger = $('#burger'), links = $('#navLinks');
  burger.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  $$('a', links).forEach(a => a.addEventListener('click', () => {
    links.classList.remove('open');
    burger.setAttribute('aria-expanded', false);
  }));

  // Reveal on scroll (staggered within each group)
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.01, rootMargin: '0px 0px -8% 0px' });
  $$('.reveal').forEach(el => {
    if (el.closest('.hero')) return;
    const sibs = $$(':scope > .reveal', el.parentElement);
    el.style.setProperty('--d', (sibs.indexOf(el) * 0.08) + 's');
    io.observe(el);
  });

  // Counters
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, to = +el.dataset.to, t0 = performance.now(), dur = 1600;
      const tick = now => {
        const p = Math.min((now - t0) / dur, 1);
        el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$('.count').forEach(el => countIO.observe(el));

  if (!reduced && matchMedia('(pointer: fine)').matches) {
    // Cursor glow
    const glow = $('.cursor-glow');
    addEventListener('pointermove', e => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    }, { passive: true });

    // Card spotlight + tilt
    $$('.tilt').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', x * 100 + '%');
        card.style.setProperty('--my', y * 100 + '%');
        card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 6}deg) rotateY(${(x - 0.5) * 8}deg) translateY(-4px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });

    // Magnetic buttons
    $$('.magnetic').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
      });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });

    // Hero map parallax
    const map = $('.hero-map');
    addEventListener('pointermove', e => {
      const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
      map.style.translate = `${x * -18}px ${y * -18}px`;
    }, { passive: true });
  }

})();
