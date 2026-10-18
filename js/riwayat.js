/**
 * RIWAYAT.JS — Halaman riwayat pertandingan
 */

document.addEventListener('DOMContentLoaded', () => {
  populateFilters();
  renderRiwayatStats();
  renderRiwayat();
});

function populateFilters() {
  // Filter musim
  const selMusim = document.getElementById('filter-musim-riwayat');
  const musimList = getMusimList(null);
  selMusim.innerHTML = `<option value="all">Semua Musim</option>` +
    musimList.map(m => `<option value="${m}">${m}</option>`).join('');

  // Filter pemain
  const selPemain = document.getElementById('filter-pemain-riwayat');
  const pemainList = getPemain();
  selPemain.innerHTML = `<option value="all">Semua Pemain</option>` +
    pemainList.map(p => `<option value="${p.id}">${p.avatar} ${p.nama}</option>`).join('');
}

function renderRiwayatStats() {
  const container = document.getElementById('riwayat-stats');
  if (!container) return;

  const all = getPertandingan();
  const unoCount = all.filter(g => g.liga === 'uno').length;
  const remiCount = all.filter(g => g.liga === 'remi').length;

  container.innerHTML = `
    <div class="stat-card">
      <div class="stat-num">${all.length}</div>
      <div class="stat-label">Total Sesi</div>
    </div>
    <div class="stat-card">
      <div class="stat-num">${unoCount}</div>
      <div class="stat-label">🎴 Sesi UNO</div>
    </div>
    <div class="stat-card">
      <div class="stat-num">${remiCount}</div>
      <div class="stat-label">♠️ Sesi Remi</div>
    </div>
    <div class="stat-card">
      <div class="stat-num">${getMusimList(null).length}</div>
      <div class="stat-label">Musim Berjalan</div>
    </div>
  `;
}

function renderRiwayat() {
  const container = document.getElementById('riwayat-container');
  if (!container) return;

  const filterLiga = document.getElementById('filter-liga').value;
  const filterMusim = document.getElementById('filter-musim-riwayat').value;
  const filterPemain = document.getElementById('filter-pemain-riwayat').value;
  const filterSearch = document.getElementById('filter-search').value.toLowerCase();

  let list = getPertandingan();

  if (filterLiga !== 'all') list = list.filter(g => g.liga === filterLiga);
  if (filterMusim !== 'all') list = list.filter(g => g.musim === filterMusim);
  if (filterPemain !== 'all') list = list.filter(g => g.hasil.some(h => h.pemainId === filterPemain));
  if (filterSearch) list = list.filter(g =>
    g.catatan?.toLowerCase().includes(filterSearch) ||
    g.hasil.some(h => h.pemainNama.toLowerCase().includes(filterSearch))
  );

  if (list.length === 0) {
    container.innerHTML = `<p class="empty-msg">Tidak ada data yang sesuai filter.</p>`;
    return;
  }

  // Group by tanggal
  const byDate = {};
  list.forEach(g => {
    if (!byDate[g.tanggal]) byDate[g.tanggal] = [];
    byDate[g.tanggal].push(g);
  });

  const sorted = Object.entries(byDate).sort((a, b) => b[0].localeCompare(a[0]));

  container.innerHTML = sorted.map(([tanggal, games]) => `
    <div style="margin-bottom:0.5rem;">
      <div style="font-size:0.85rem;color:var(--text-muted);font-weight:600;margin-bottom:0.5rem;padding:0 0.25rem;">
        📅 ${formatTanggal(tanggal)}
      </div>
      ${games.map(g => renderRiwayatCard(g)).join('')}
    </div>
  `).join('');
}

function renderRiwayatCard(g) {
  const resultsHTML = g.hasil.map(h => `
    <div class="result-item">
      <div class="result-rank">${rankEmoji(h.posisi)}</div>
      <div class="result-player">${h.pemainNama}</div>
      <div class="result-score">Skor: ${h.skor}</div>
      <div class="result-pts">+${h.poin} poin</div>
    </div>
  `).join('');

  return `
    <div class="riwayat-card">
      <div class="riwayat-card-header">
        <div class="riwayat-meta">
          ${ligaBadgeHTML(g.liga)}
          <span class="riwayat-musim">${g.musim}</span>
          <span class="riwayat-date">Sesi ${g.sesi}</span>
        </div>
        <button class="btn-hapus-riwayat" onclick="hapusRiwayat('${g.id}')" title="Hapus">🗑️</button>
      </div>
      <div class="riwayat-results">
        ${resultsHTML}
      </div>
      ${g.catatan ? `<div class="riwayat-catatan">💬 ${g.catatan}</div>` : ''}
    </div>
  `;
}

function hapusRiwayat(id) {
  if (!confirm('Hapus data pertandingan ini?')) return;
  hapusPertandinganData(id);
  renderRiwayatStats();
  renderRiwayat();
}
