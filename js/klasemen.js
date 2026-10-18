/**
 * KLASEMEN.JS — Halaman klasemen lengkap
 */

let currentLiga = 'uno';

document.addEventListener('DOMContentLoaded', () => {
  // Cek URL param
  const params = new URLSearchParams(window.location.search);
  const ligaParam = params.get('liga');
  if (ligaParam === 'remi') {
    currentLiga = 'remi';
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.liga === 'remi');
    });
  }

  populateMusimFilter();
  renderKlasemen();
});

function switchTab(liga) {
  currentLiga = liga;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.liga === liga);
  });
  populateMusimFilter();
  renderKlasemen();
}

function populateMusimFilter() {
  const sel = document.getElementById('filter-musim');
  if (!sel) return;
  const musimList = getMusimList(currentLiga);
  sel.innerHTML = `<option value="all">Semua Musim</option>` +
    musimList.map(m => `<option value="${m}">${m}</option>`).join('');
}

function renderKlasemen() {
  const musim = document.getElementById('filter-musim')?.value || 'all';
  const klasemen = hitungKlasemen(currentLiga, musim);

  renderPodium(klasemen);
  renderTable(klasemen);
}

function avatarHTML(p, size = 56) {
  if (p.foto) {
    return `<img src="${p.foto}" alt="${p.nama}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;border:3px solid ${p.warna};" />`;
  }
  return `<div class="podium-avatar" style="width:${size}px;height:${size}px;font-size:${Math.round(size*0.55)}px;background:${p.warna}22; border-color:${p.warna};">${p.avatar}</div>`;
}

function avatarCellHTML(p) {
  if (p.foto) {
    return `<img src="${p.foto}" alt="${p.nama}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;border:2px solid ${p.warna};flex-shrink:0;" />`;
  }
  return `<div class="player-avatar" style="background:${p.warna}22; border:2px solid ${p.warna};">${p.avatar}</div>`;
}

function renderPodium(klasemen) {
  const section = document.getElementById('podium-section');
  if (!section) return;

  const aktif = klasemen.filter(k => k.main > 0);
  if (aktif.length < 3) {
    section.innerHTML = '';
    return;
  }

  const [first, second, third] = aktif;

  section.innerHTML = `
    <div class="podium">
      <div class="podium-item podium-2">
        ${avatarHTML(second, 56)}
        <div class="podium-name">${second.nama}</div>
        <div class="podium-poin">${second.totalPoin} poin</div>
        <div class="podium-block">2</div>
      </div>
      <div class="podium-item podium-1">
        ${avatarHTML(first, 56)}
        <div class="podium-name">${first.nama}</div>
        <div class="podium-poin">${first.totalPoin} poin</div>
        <div class="podium-block">1</div>
      </div>
      <div class="podium-item podium-3">
        ${avatarHTML(third, 56)}
        <div class="podium-name">${third.nama}</div>
        <div class="podium-poin">${third.totalPoin} poin</div>
        <div class="podium-block">3</div>
      </div>
    </div>
  `;
}

function renderTable(klasemen) {
  const tbody = document.getElementById('klasemen-body');
  if (!tbody) return;

  if (klasemen.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty-msg">Belum ada data pemain</td></tr>`;
    return;
  }

  const rankClass = ['rank-1st', 'rank-2nd', 'rank-3rd'];

  tbody.innerHTML = klasemen.map((k, i) => {
    const posLabel = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1;
    const winRate = k.main > 0 ? Math.round((k.pos1 / k.main) * 100) : 0;
    // Total Lose = jumlah sesi di posisi ketiga (paling banyak kalah)
    const totalLose = k.pos3;

    return `
      <tr class="${rankClass[i] || ''}">
        <td class="rank-pos">${posLabel}</td>
        <td>
          <div class="player-cell">
            ${avatarCellHTML(k)}
            <div>
              <div class="player-name">${k.nama}</div>
              <div style="font-size:0.75rem;color:var(--text-muted)">Win rate: ${winRate}%</div>
            </div>
          </div>
        </td>
        <td>${k.main}</td>
        <td style="color:var(--uno-yellow);">${k.pos1}</td>
        <td style="color:#aaa;">${k.pos2}</td>
        <td style="color:#cd7f32;">${k.pos3}</td>
        <td style="color:var(--uno-red);font-weight:700;">${totalLose}</td>
        <td class="poin-total">${k.totalPoin}</td>
      </tr>
    `;
  }).join('');
}
