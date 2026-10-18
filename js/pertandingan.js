/**
 * PERTANDINGAN.JS — Input hasil pertandingan
 */

document.addEventListener('DOMContentLoaded', () => {
  // Set default tanggal hari ini
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('tanggal').value = today;

  populatePemainDropdowns();
  autoMusim();
  autoSesi();
});

function populatePemainDropdowns() {
  const pemainList = getPemain();
  const selects = ['pemain-1', 'pemain-2', 'pemain-3'].map(id => document.getElementById(id));

  const options = pemainList.map(p =>
    `<option value="${p.id}" data-nama="${p.nama}">${p.avatar} ${p.nama}</option>`
  ).join('');

  selects.forEach(sel => {
    const defaultOpt = sel.options[0];
    sel.innerHTML = '';
    sel.appendChild(defaultOpt);
    sel.insertAdjacentHTML('beforeend', options);
  });

  // Set default berbeda untuk tiap slot jika ada 3+ pemain
  if (pemainList.length >= 3) {
    selects[0].value = pemainList[0].id;
    selects[1].value = pemainList[1].id;
    selects[2].value = pemainList[2].id;
  }
}

function autoMusim() {
  const input = document.getElementById('musim');
  const bulan = new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' });
  input.value = `Musim 1 — ${bulan}`;
}

function autoSesi() {
  // Hitung sesi otomatis berdasarkan data yang sudah ada
  const ligaSel = document.getElementById('liga');
  ligaSel.addEventListener('change', updateSesiAuto);
  updateSesiAuto();
}

function updateSesiAuto() {
  const liga = document.getElementById('liga').value;
  const musim = document.getElementById('musim').value;
  if (!liga) return;
  const list = getPertandingan().filter(g => g.liga === liga && g.musim === musim);
  const maxSesi = list.reduce((m, g) => Math.max(m, g.sesi), 0);
  document.getElementById('sesi').value = maxSesi + 1;
}

function validatePemain() {
  const v1 = document.getElementById('pemain-1').value;
  const v2 = document.getElementById('pemain-2').value;
  const v3 = document.getElementById('pemain-3').value;
  const err = document.getElementById('form-error');

  if (v1 && v2 && v3) {
    if (v1 === v2 || v1 === v3 || v2 === v3) {
      err.textContent = '⚠️ Setiap posisi harus diisi pemain yang berbeda!';
      err.style.display = 'block';
      return false;
    }
  }
  err.style.display = 'none';
  return true;
}

function simpanHasil(e) {
  e.preventDefault();

  if (!validatePemain()) return;

  const liga = document.getElementById('liga').value;
  const tanggal = document.getElementById('tanggal').value;
  const musim = document.getElementById('musim').value.trim();
  const sesi = document.getElementById('sesi').value;
  const catatan = document.getElementById('catatan').value.trim();

  const pemainList = getPemain();

  const getInfo = (slotId, skrorId) => {
    const pid = document.getElementById(slotId).value;
    const pemain = pemainList.find(p => p.id === pid);
    const skor = Number(document.getElementById(skrorId).value);
    return { pemain, skor };
  };

  const s1 = getInfo('pemain-1', 'skor-1');
  const s2 = getInfo('pemain-2', 'skor-2');
  const s3 = getInfo('pemain-3', 'skor-3');

  const err = document.getElementById('form-error');

  if (!s1.pemain || !s2.pemain || !s3.pemain) {
    err.textContent = '⚠️ Pilih semua pemain terlebih dahulu!';
    err.style.display = 'block';
    return;
  }

  const hasil = [
    { pemainId: s1.pemain.id, pemainNama: s1.pemain.nama, posisi: 1, skor: s1.skor, poin: 3 },
    { pemainId: s2.pemain.id, pemainNama: s2.pemain.nama, posisi: 2, skor: s2.skor, poin: 2 },
    { pemainId: s3.pemain.id, pemainNama: s3.pemain.nama, posisi: 3, skor: s3.skor, poin: 1 },
  ];

  tambahPertandinganData(liga, tanggal, musim, sesi, hasil, catatan);

  // Tampilkan modal sukses
  const ligaLabel = liga === 'uno' ? '🎴 UNO' : '♠️ Remi';
  document.getElementById('modal-msg').innerHTML =
    `<strong>${ligaLabel}</strong> · ${musim} · Sesi ${sesi}<br/>` +
    `🥇 ${s1.pemain.nama} (${s1.skor}) · 🥈 ${s2.pemain.nama} (${s2.skor}) · 🥉 ${s3.pemain.nama} (${s3.skor})`;
  document.getElementById('modal-sukses').style.display = 'flex';

  // Update sesi otomatis
  document.getElementById('sesi').value = Number(sesi) + 1;
}

function resetForm() {
  document.getElementById('form-pertandingan').reset();
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('tanggal').value = today;
  autoMusim();
  document.getElementById('form-error').style.display = 'none';
  populatePemainDropdowns();
}

function closeModal() {
  document.getElementById('modal-sukses').style.display = 'none';
  resetForm();
}
