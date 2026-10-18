/**
 * PARTICLES.JS — Deck Master League
 * Canvas particle effect: floating card suits + dots
 */

(function () {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles = [], animId;

  const SUITS   = ['♠', '♥', '♦', '♣', '🃏'];
  const COLORS  = [
    'rgba(255,23,68,',    // red
    'rgba(255,214,0,',    // gold
    'rgba(0,229,255,',    // cyan
    'rgba(255,255,255,',  // white
  ];

  function resize() {
    const hero = canvas.closest('.hero') || canvas.parentElement;
    W = canvas.width  = hero.offsetWidth;
    H = canvas.height = hero.offsetHeight;
  }

  function randomBetween(a, b) {
    return a + Math.random() * (b - a);
  }

  function createParticle() {
    const isSuit = Math.random() < 0.35;
    return {
      x:      randomBetween(0, W),
      y:      randomBetween(0, H),
      vx:     randomBetween(-0.3, 0.3),
      vy:     randomBetween(-0.6, -0.15),
      size:   isSuit ? randomBetween(10, 22) : randomBetween(1.5, 3.5),
      alpha:  randomBetween(0.04, 0.18),
      color:  COLORS[Math.floor(Math.random() * COLORS.length)],
      suit:   isSuit ? SUITS[Math.floor(Math.random() * SUITS.length)] : null,
      rot:    randomBetween(0, Math.PI * 2),
      rotV:   randomBetween(-0.008, 0.008),
      life:   0,
      maxLife: randomBetween(200, 500),
    };
  }

  function initParticles() {
    particles = [];
    const count = Math.min(60, Math.floor((W * H) / 16000));
    for (let i = 0; i < count; i++) {
      const p = createParticle();
      p.life = Math.random() * p.maxLife; // stagger
      particles.push(p);
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach((p, i) => {
      p.life++;
      p.x  += p.vx;
      p.y  += p.vy;
      p.rot += p.rotV;

      // fade in / fade out
      const progress = p.life / p.maxLife;
      const fade = progress < 0.15 ? progress / 0.15
                 : progress > 0.85 ? (1 - progress) / 0.15
                 : 1;
      const a = p.alpha * fade;

      if (p.suit) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.font = `${p.size}px serif`;
        ctx.globalAlpha = a;
        ctx.fillStyle = p.color + '1)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.suit, 0, 0);
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + a.toFixed(2) + ')';
        ctx.fill();
      }

      // reset when life ends or goes off screen
      if (p.life >= p.maxLife || p.y < -30 || p.x < -30 || p.x > W + 30) {
        particles[i] = createParticle();
        particles[i].y = H + 10; // start from bottom
        particles[i].life = 0;
      }
    });

    animId = requestAnimationFrame(draw);
  }

  function init() {
    resize();
    initParticles();
    draw();
  }

  window.addEventListener('resize', () => {
    cancelAnimationFrame(animId);
    resize();
    initParticles();
    draw();
  });

  // Wait for hero to be rendered
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
