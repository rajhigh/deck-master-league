/**
 * HOME.JS — Halaman beranda
 */

document.addEventListener('DOMContentLoaded', async () => {
  await renderQuickStats();
  await renderMiniKlasemen();
  await renderRecentGames();
});

async function renderQuickStats() {
  const [pemain, pertandingan] = await Promise.all([getPemain(), getPertandingan()]);
  const unoGames  = pertandingan.filter(g => g.liga === 'uno').length;
  const remiGames = pertandingan.filter(g => g.liga === 'remi').length;

  const container = document.querySelector('.stats-container');
  if (!container) return;

  container.innerHTML = `
    <div class="stat-card">
      <div class="stat-num">${pemain.length}</div>
      <div class="stat-label">👥 Total Pemain</div>
    </div>
    <div class="stat-card">
      <div class="stat-num">${pertandingan.length}</div>
      <div class="stat-label">🎮 Total Sesi</div>
    </div>
    <div class="stat-card">
      <div class="stat-num">${unoGames}</div>
      <div class="stat-label">🎴 Sesi UNO</div>
    </div>
    <div class="stat-card">
      <div class="stat-num">${remiGames}</div>
      <div class="stat-label">♠️ Sesi Remi</div>
    </div>
  `;

  if (window.setupCounters) setTimeout(window.setupCounters, 50);
  if (window.triggerReveal) setTimeout(window.triggerReveal, 100);
}

async function renderMiniKlasemen() {
  await Promise.all([
    renderMiniTable('uno',  'mini-klasemen-uno'),
    renderMiniTable('remi', 'mini-klasemen-remi'),
  ]);
}

async function renderMiniTable(liga, tableId) {
  const tbody = document.querySelector(`#${tableId} tbody`);
  if (!tbody) return;

  const klasemen = await hitungKlasemen(liga, 'all');

  if (klasemen.length === 0 || klasemen.every(k => k.main === 0)) {
    tbody.innerHTML = `<tr><td colspan="4" class="empty-msg">Belum ada data</td></tr>`;
    return;
  }

  const rankClass = ['rank-1st', 'rank-2nd', 'rank-3rd'];

  tbody.innerHTML = klasemen.map((k, i) => {
    const avatarEl = k.foto
      ? `<img src="${k.foto}" alt="${k.nama}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;border:2px solid ${k.warna};" />`
      : `<div class="player-avatar" style="background:${k.warna}22;border:2px solid ${k.warna};">${k.avatar}</div>`;

    return `
      <tr class="${rankClass[i] || ''}">
        <td class="rank-pos">${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</td>
        <td>
          <div class="player-cell">
            ${avatarEl}
            <span class="player-name">${k.nama}</span>
          </div>
        </td>
        <td>${k.main}</td>
        <td class="poin-total">${k.totalPoin}</td>
      </tr>
    `;
  }).join('');
}

async function renderRecentGames() {
  const container = document.getElementById('recent-list');
  if (!container) return;

  const games = (await getPertandingan()).slice(0, 5);

  if (games.length === 0) {
    container.innerHTML = `<p class="empty-msg">Belum ada pertandingan. <a href="pages/pertandingan.html" style="color:var(--red)">Input sekarang →</a></p>`;
    return;
  }

  container.innerHTML = games.map(g => {
    const juara     = g.hasil.find(h => h.posisi === 1);
    const pemainList = g.hasil.map(h => `${rankEmoji(h.posisi)} ${h.pemainNama}`).join(' · ');
    return `
      <div class="recent-card">
        ${ligaBadgeHTML(g.liga)}
        <div class="recent-info">
          <div class="recent-date">📅 ${formatTanggal(g.tanggal)} · ${g.musim} · Sesi ${g.sesi}</div>
          <div class="recent-result">${pemainList}</div>
        </div>
        <div style="font-size:0.85rem;color:var(--text-muted)">
          🏆 ${juara ? juara.pemainNama : '-'}
        </div>
      </div>
    `;
  }).join('');
}
