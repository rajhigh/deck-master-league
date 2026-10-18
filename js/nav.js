/**
 * NAV.JS — Hamburger menu toggle untuk mobile
 */

function toggleNav() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  if (!hamburger || !navLinks) return;

  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
}

// Tutup menu saat klik link
document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.getElementById('nav-links');
  if (!navLinks) return;

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      document.getElementById('hamburger')?.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

  // Tutup menu saat klik di luar navbar
  document.addEventListener('click', (e) => {
    const navbar = document.querySelector('.navbar');
    if (navbar && !navbar.contains(e.target)) {
      document.getElementById('hamburger')?.classList.remove('open');
      navLinks.classList.remove('open');
    }
  });
});
