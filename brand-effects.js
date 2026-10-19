/* A single, bounded letter-resolution sequence; the accessible name stays unchanged. */
(() => {
  'use strict';

  const brand = document.querySelector('.brand');
  const name = brand?.querySelector('.brand-name');
  if (!brand || !name) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const fullName = name.dataset.brandName || 'Reynaldo Galvizu';
  const symbols = '01<>/{}アイウエオカキクケコ';
  const timers = new Set();
  const animations = new Set();
  let playing = false;

  // The parent link already provides the permanent accessible name.
  name.setAttribute('aria-hidden', 'true');
  name.replaceChildren();
  const letters = Array.from(fullName, (character) => {
    const letter = document.createElement('span');
    letter.className = 'brand-letter';
    letter.dataset.final = character === ' ' ? '\u00a0' : character;
    const glyph = document.createElement('span');
    glyph.className = 'brand-glyph';
    glyph.textContent = letter.dataset.final;
    letter.append(glyph);
    name.append(letter);
    return { letter, glyph, character: letter.dataset.final, isSpace: character === ' ' };
  });
  const dot = document.createElement('span');
  dot.className = 'brand-dot';
  dot.textContent = '.';
  name.append(dot);

  function later(callback, delay) {
    const timer = window.setTimeout(() => {
      timers.delete(timer);
      callback();
    }, delay);
    timers.add(timer);
  }

  function restore() {
    timers.forEach((timer) => window.clearTimeout(timer));
    timers.clear();
    animations.forEach((animation) => animation.cancel());
    animations.clear();
    letters.forEach(({ letter, glyph, character }) => {
      glyph.textContent = character;
      letter.classList.remove('is-decoding');
    });
    playing = false;
  }

  function reveal() {
    if (reducedMotion.matches || playing) return;
    restore();
    playing = true;

    letters.forEach(({ letter, glyph, character, isSpace }, index) => {
      if (isSpace) return;
      later(() => {
        letter.classList.add('is-decoding');
        glyph.textContent = symbols[(index * 7 + 3) % symbols.length];
        if (typeof glyph.animate === 'function') {
          const animation = glyph.animate([
            { transform: 'translateY(-.14em) rotateX(-85deg)', opacity: 0 },
            { transform: 'translateY(0) rotateX(0deg)', opacity: 1 }
          ], { duration: 330, easing: 'cubic-bezier(.2,.7,.25,1)' });
          animations.add(animation);
          animation.onfinish = () => animations.delete(animation);
        }
        later(() => { glyph.textContent = symbols[(index * 3 + 11) % symbols.length]; }, 55);
        later(() => { glyph.textContent = character; }, 115);
        later(() => { letter.classList.remove('is-decoding'); }, 330);
      }, index * 19);
    });

    later(restore, fullName.length * 19 + 370);
  }

  brand.addEventListener('pointerenter', (event) => {
    if (finePointer.matches && event.pointerType !== 'touch') reveal();
  });
  brand.addEventListener('pointerleave', restore);
  brand.addEventListener('focus', () => {
    if (brand.matches(':focus-visible')) reveal();
  });
  brand.addEventListener('blur', restore);
  reducedMotion.addEventListener('change', restore);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) restore();
  });
})();
