/**
 * PARTICLES.JS — Deck Master League
 * Canvas particle effect: floating card suits + dots (fullscreen background)
 */

(function () {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles = [], animId;

  const SUITS  = ['♠', '♥', '♦', '♣', '🃏'];
  const COLORS = [
    'rgba(255,23,68,',
    'rgba(255,214,0,',
    'rgba(0,229,255,',
    'rgba(255,255,255,',
  ];

  // Fix canvas style — fullscreen fixed background
  canvas.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    pointer-events: none;
    z-index: 0;
  `;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function randomBetween(a, b) {
    return a + Math.random() * (b - a);
  }

  function createParticle() {
    const isSuit = Math.random() < 0.35;
    return {
      x:       randomBetween(0, W),
      y:       randomBetween(0, H),
      vx:      randomBetween(-0.3, 0.3),
      vy:      randomBetween(-0.7, -0.2),
      size:    isSuit ? randomBetween(16, 32) : randomBetween(2, 4),
      alpha:   randomBetween(0.06, 0.22),
      color:   COLORS[Math.floor(Math.random() * COLORS.length)],
      suit:    isSuit ? SUITS[Math.floor(Math.random() * SUITS.length)] : null,
      rot:     randomBetween(0, Math.PI * 2),
      rotV:    randomBetween(-0.01, 0.01),
      life:    0,
      maxLife: randomBetween(300, 700),
    };
  }

  function initParticles() {
    particles = [];
    const count = Math.min(80, Math.floor((W * H) / 12000));
    for (let i = 0; i < count; i++) {
      const p = createParticle();
      p.life = Math.random() * p.maxLife;
      particles.push(p);
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach((p, i) => {
      p.life++;
      p.x   += p.vx;
      p.y   += p.vy;
      p.rot += p.rotV;

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

      if (p.life >= p.maxLife || p.y < -50 || p.x < -50 || p.x > W + 50) {
        particles[i]   = createParticle();
        particles[i].y = H + 10;
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
