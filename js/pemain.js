/**
 * PEMAIN.JS — Manajemen pemain & profil
 */

let selectedAvatar       = '😎';
let selectedWarna        = '#e74c3c';
let selectedFotoBase64   = null;
let profilPemainId       = null;

document.addEventListener('DOMContentLoaded', async () => {
  await renderPemainGrid();
});

// ============================================================
// HELPER: render avatar
// ============================================================

function pemainAvatarHTML(p, size = 70) {
  const borderStyle = `border:3px solid ${p.warna};`;
  const bgStyle     = `background:${p.warna}22;`;
  if (p.foto) {
    return `<img src="${p.foto}" alt="${p.nama}"
      style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;${borderStyle}margin:0.5rem auto 0.75rem;display:block;" />`;
  }
  return `<div class="pemain-avatar-big" style="${bgStyle}${borderStyle}">${p.avatar}</div>`;
}

function profilAvatarHTML(p, size = 72) {
  const borderStyle = `border:3px solid ${p.warna};`;
  const bgStyle     = `background:${p.warna}22;`;
  if (p.foto) {
    return `<img src="${p.foto}" alt="${p.nama}"
      style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;${borderStyle}flex-shrink:0;" />`;
  }
  return `<div class="profil-avatar-big" style="${bgStyle}${borderStyle}">${p.avatar}</div>`;
}

// ============================================================
// RENDER GRID PEMAIN
// ============================================================

async function renderPemainGrid() {
  const grid = document.getElementById('pemain-grid');
  if (!grid) return;

  grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;"><p class="empty-msg">Memuat data...</p></div>`;

  const pemainList = await getPemain();

  if (pemainList.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:3rem;">
        <p class="empty-msg">Belum ada pemain. Tambahkan pemain pertama!</p>
      </div>
    `;
    return;
  }

  const statsAll = await Promise.all(pemainList.map(p => getStatsPemain(p.id)));

  grid.innerHTML = pemainList.map((p, i) => {
    const stats   = statsAll[i];
    const winRate = stats.total.main > 0
      ? Math.round((stats.total.pos1 / stats.total.main) * 100) : 0;

    return `
      <div class="pemain-card" onclick="openModalProfil('${p.id}')">
        <div class="pemain-card-top" style="background:${p.warna};"></div>
        ${pemainAvatarHTML(p, 70)}
        <div class="pemain-card-name">${p.nama}</div>
        <div class="pemain-card-sub">Bergabung ${formatTanggal(p.bergabung)}</div>
        <div class="pemain-card-stats">
          <div class="pemain-stat-item">
            <div class="pemain-stat-val" style="color:var(--gold);">${stats.total.totalPoin}</div>
            <div class="pemain-stat-lbl">Total Poin</div>
          </div>
          <div class="pemain-stat-item">
            <div class="pemain-stat-val">${stats.total.main}</div>
            <div class="pemain-stat-lbl">Sesi Main</div>
          </div>
          <div class="pemain-stat-item">
            <div class="pemain-stat-val" style="color:var(--green);">${stats.total.pos1}</div>
            <div class="pemain-stat-lbl">🥇 Juara</div>
          </div>
          <div class="pemain-stat-item">
            <div class="pemain-stat-val">${winRate}%</div>
            <div class="pemain-stat-lbl">Win Rate</div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ============================================================
// MODAL TAMBAH PEMAIN
// ============================================================

function openModalTambah() {
  selectedAvatar     = '😎';
  selectedWarna      = '#e74c3c';
  selectedFotoBase64 = null;
  document.getElementById('input-nama').value       = '';
  document.getElementById('error-tambah').style.display = 'none';
  document.getElementById('input-foto').value       = '';
  document.getElementById('btn-hapus-foto').style.display = 'none';
  document.getElementById('foto-preview').innerHTML = `<span class="foto-placeholder">📷 Klik untuk pilih foto</span>`;

  document.querySelectorAll('.avatar-opt').forEach((el, i) => el.classList.toggle('selected', i === 0));
  document.querySelectorAll('.color-opt').forEach((el, i)  => el.classList.toggle('selected', i === 0));
  document.getElementById('modal-tambah').style.display = 'flex';
}

function closeModalTambah() {
  document.getElementById('modal-tambah').style.display = 'none';
}

function pilihAvatar(el) {
  document.querySelectorAll('.avatar-opt').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
  selectedAvatar = el.textContent.trim();
}

function pilihWarna(el) {
  document.querySelectorAll('.color-opt').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
  selectedWarna = el.dataset.color;
}

function previewFoto(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { alert('Ukuran foto maksimal 2MB!'); input.value = ''; return; }
  const reader = new FileReader();
  reader.onload = (e) => {
    selectedFotoBase64 = e.target.result;
    document.getElementById('foto-preview').innerHTML =
      `<img src="${selectedFotoBase64}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;" />`;
    document.getElementById('btn-hapus-foto').style.display = 'inline-flex';
  };
  reader.readAsDataURL(file);
}

function hapusFotoPreview() {
  selectedFotoBase64 = null;
  document.getElementById('input-foto').value       = '';
  document.getElementById('foto-preview').innerHTML = `<span class="foto-placeholder">📷 Klik untuk pilih foto</span>`;
  document.getElementById('btn-hapus-foto').style.display = 'none';
}

async function tambahPemain() {
  const nama  = document.getElementById('input-nama').value.trim();
  const errEl = document.getElementById('error-tambah');

  if (!nama) {
    errEl.textContent  = 'Nama pemain tidak boleh kosong!';
    errEl.style.display = 'block';
    return;
  }

  const btnSimpan      = document.querySelector('#modal-tambah .btn-primary');
  btnSimpan.textContent = 'Menyimpan...';
  btnSimpan.disabled    = true;

  const result = await tambahPemainData(nama, selectedAvatar, selectedWarna, selectedFotoBase64);

  btnSimpan.textContent = 'Simpan';
  btnSimpan.disabled    = false;

  if (!result.ok) {
    errEl.textContent  = result.msg;
    errEl.style.display = 'block';
    return;
  }

  closeModalTambah();
  await renderPemainGrid();
}

// ============================================================
// MODAL PROFIL
// ============================================================

async function openModalProfil(id) {
  profilPemainId = id;
  const pemainList = await getPemain();
  const pemain     = pemainList.find(p => p.id === id);
  if (!pemain) return;

  const stats = await getStatsPemain(id);

  document.getElementById('profil-header').innerHTML = `
    ${profilAvatarHTML(pemain, 72)}
    <div>
      <div class="profil-name">${pemain.nama}</div>
      <div class="profil-sub">Bergabung ${formatTanggal(pemain.bergabung)}</div>
    </div>
  `;

  const winRate = stats.total.main > 0
    ? Math.round((stats.total.pos1 / stats.total.main) * 100) : 0;

  document.getElementById('profil-stats').innerHTML = `
    <div class="profil-stat-box">
      <div class="pval" style="color:var(--gold);">${stats.total.totalPoin}</div>
      <div class="plbl">Total Poin</div>
    </div>
    <div class="profil-stat-box">
      <div class="pval">${stats.total.main}</div>
      <div class="plbl">Total Main</div>
    </div>
    <div class="profil-stat-box">
      <div class="pval" style="color:var(--green);">${stats.total.pos1}</div>
      <div class="plbl">🥇 Juara</div>
    </div>
    <div class="profil-stat-box">
      <div class="pval">${winRate}%</div>
      <div class="plbl">Win Rate</div>
    </div>
  `;

  document.getElementById('profil-chart').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1rem;">
      ${renderLigaStats('🎴 UNO', stats.uno)}
      ${renderLigaStats('♠️ Remi', stats.remi)}
    </div>
  `;

  const riwayatEl = document.getElementById('profil-riwayat-list');
  if (stats.riwayatTerakhir.length === 0) {
    riwayatEl.innerHTML = `<p class="empty-msg">Belum ada riwayat</p>`;
  } else {
    riwayatEl.innerHTML = stats.riwayatTerakhir.map(r => `
      <div style="display:flex;align-items:center;gap:0.75rem;padding:0.5rem 0;border-bottom:1px solid var(--border);">
        ${ligaBadgeHTML(r.liga)}
        <div style="flex:1;font-size:0.85rem;">
          <div>${r.musim} · ${r.posisi === 1 ? '🥇 Juara' : r.posisi === 2 ? '🥈 Kedua' : '🥉 Ketiga'}</div>
          <div style="color:var(--text-muted);font-size:0.8rem;">${formatTanggal(r.tanggal)}</div>
        </div>
        <div style="font-size:0.9rem;font-weight:700;color:var(--gold);">+${r.poin}</div>
      </div>
    `).join('');
  }

  document.getElementById('modal-profil').style.display = 'flex';
}

function renderLigaStats(label, s) {
  return `
    <div style="background:var(--bg);border-radius:8px;padding:0.75rem;">
      <div style="font-size:0.85rem;font-weight:700;margin-bottom:0.5rem;">${label}</div>
      <div style="font-size:0.8rem;color:var(--text-muted);display:flex;flex-direction:column;gap:0.25rem;">
        <div>Main: <strong style="color:var(--text);">${s.main}</strong></div>
        <div>Poin: <strong style="color:var(--gold);">${s.totalPoin}</strong></div>
        <div>🥇 ${s.pos1} · 🥈 ${s.pos2} · 🥉 ${s.pos3}</div>
      </div>
    </div>
  `;
}

function closeModalProfil() {
  document.getElementById('modal-profil').style.display = 'none';
  profilPemainId = null;
}

// ============================================================
// GANTI FOTO
// ============================================================

function openGantiFoto() {
  document.getElementById('input-ganti-foto').click();
}

async function simpanGantiFoto(input) {
  const file = input.files[0];
  if (!file || !profilPemainId) return;
  if (file.size > 2 * 1024 * 1024) { alert('Ukuran foto maksimal 2MB!'); input.value = ''; return; }

  const reader = new FileReader();
  reader.onload = async (e) => {
    await updateFotoPemain(profilPemainId, e.target.result);
    await openModalProfil(profilPemainId);
    await renderPemainGrid();
    input.value = '';
  };
  reader.readAsDataURL(file);
}

// ============================================================
// HAPUS PEMAIN
// ============================================================

async function hapusPemain() {
  if (!profilPemainId) return;

  const pemainList = await getPemain();
  const pemain     = pemainList.find(p => p.id === profilPemainId);
  if (!pemain) return;

  const pertandinganList    = await getPertandingan();
  const pertandinganTerkait = pertandinganList.filter(g =>
    g.hasil.some(h => h.pemainId === profilPemainId)
  ).length;

  const confirmMsg = pertandinganTerkait > 0
    ? `Hapus pemain "${pemain.nama}"?\n\n⚠️ Pemain ini punya ${pertandinganTerkait} catatan pertandingan. Data pertandingan TIDAK ikut terhapus.\n\nLanjutkan?`
    : `Hapus pemain "${pemain.nama}"?`;

  if (!confirm(confirmMsg)) return;

  await hapusPemainData(profilPemainId);
  closeModalProfil();
  await renderPemainGrid();
}

// Tutup modal saat klik background
document.addEventListener('click', (e) => {
  if (e.target.id === 'modal-profil')  closeModalProfil();
  if (e.target.id === 'modal-tambah') closeModalTambah();
});
