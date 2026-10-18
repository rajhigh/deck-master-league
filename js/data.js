/**
 * DATA.JS — Layer penyimpanan data menggunakan localStorage
 * Semua data disimpan di browser, tidak butuh server.
 */

const KEYS = {
  pemain: 'ligakartu_pemain',
  pertandingan: 'ligakartu_pertandingan',
};

// ============================================================
// PEMAIN
// ============================================================

function getPemain() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.pemain)) || [];
  } catch { return []; }
}

function savePemain(list) {
  localStorage.setItem(KEYS.pemain, JSON.stringify(list));
}

function tambahPemainData(nama, avatar, warna, foto = null) {
  const list = getPemain();
  if (list.find(p => p.nama.toLowerCase() === nama.toLowerCase())) {
    return { ok: false, msg: 'Nama pemain sudah ada!' };
  }
  const pemain = {
    id: 'p_' + Date.now(),
    nama,
    avatar,
    warna,
    foto,          // base64 string atau null
    bergabung: new Date().toISOString(),
  };
  list.push(pemain);
  savePemain(list);
  return { ok: true, pemain };
}

function updateFotoPemain(id, fotoBase64) {
  const list = getPemain();
  const p = list.find(p => p.id === id);
  if (!p) return;
  p.foto = fotoBase64;
  savePemain(list);
}

function hapusPemainData(id) {
  const list = getPemain().filter(p => p.id !== id);
  savePemain(list);
}

// ============================================================
// PERTANDINGAN
// ============================================================

function getPertandingan() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.pertandingan)) || [];
  } catch { return []; }
}

function savePertandingan(list) {
  localStorage.setItem(KEYS.pertandingan, JSON.stringify(list));
}

/**
 * Simpan 1 sesi pertandingan.
 * hasil = [{ pemainId, pemainNama, posisi (1/2/3), skor, poin }]
 */
function tambahPertandinganData(liga, tanggal, musim, sesi, hasil, catatan) {
  const list = getPertandingan();
  const data = {
    id: 'g_' + Date.now(),
    liga,      // 'uno' | 'remi'
    tanggal,
    musim,
    sesi: Number(sesi),
    hasil,     // array 3 item
    catatan,
    createdAt: new Date().toISOString(),
  };
  list.unshift(data);      // simpan di depan (terbaru dulu)
  savePertandingan(list);
  return data;
}

function hapusPertandinganData(id) {
  const list = getPertandingan().filter(g => g.id !== id);
  savePertandingan(list);
}

// ============================================================
// KLASEMEN — hitung dari data pertandingan
// ============================================================

/**
 * Hitung klasemen untuk liga + musim tertentu.
 * musim = 'all' untuk semua musim.
 */
function hitungKlasemen(liga, musim = 'all') {
  const pemainList = getPemain();
  const pertandinganList = getPertandingan().filter(g => {
    if (g.liga !== liga) return false;
    if (musim !== 'all' && g.musim !== musim) return false;
    return true;
  });

  // Inisialisasi map
  const map = {};
  pemainList.forEach(p => {
    map[p.id] = {
      id: p.id,
      nama: p.nama,
      avatar: p.avatar,
      warna: p.warna,
      foto: p.foto || null,
      main: 0,
      pos1: 0,   // juara sesi (+3)
      pos2: 0,   // kedua (+2)
      pos3: 0,   // ketiga (+1)
      totalPoin: 0,
    };
  });

  // Akumulasi
  pertandinganList.forEach(g => {
    g.hasil.forEach(h => {
      if (!map[h.pemainId]) return;
      const row = map[h.pemainId];
      row.main++;
      if (h.posisi === 1) { row.pos1++; row.totalPoin += 3; }
      else if (h.posisi === 2) { row.pos2++; row.totalPoin += 2; }
      else if (h.posisi === 3) { row.pos3++; row.totalPoin += 1; }
    });
  });

  // Sort: poin desc, pos1 desc, pos2 desc
  return Object.values(map)
    .sort((a, b) => {
      if (b.totalPoin !== a.totalPoin) return b.totalPoin - a.totalPoin;
      if (b.pos1 !== a.pos1) return b.pos1 - a.pos1;
      return b.pos2 - a.pos2;
    });
}

// ============================================================
// MUSIM — ambil daftar musim yang ada
// ============================================================

function getMusimList(liga) {
  const list = getPertandingan().filter(g => !liga || g.liga === liga);
  const musimSet = new Set(list.map(g => g.musim));
  return [...musimSet].sort();
}

// ============================================================
// STATISTIK PEMAIN
// ============================================================

function getStatsPemain(pemainId) {
  const pertandinganList = getPertandingan();

  const stats = {
    uno: { main: 0, pos1: 0, pos2: 0, pos3: 0, totalPoin: 0 },
    remi: { main: 0, pos1: 0, pos2: 0, pos3: 0, totalPoin: 0 },
    total: { main: 0, pos1: 0, pos2: 0, pos3: 0, totalPoin: 0 },
    riwayatTerakhir: [],
  };

  pertandinganList.forEach(g => {
    const h = g.hasil.find(x => x.pemainId === pemainId);
    if (!h) return;

    const liga = g.liga;
    stats[liga].main++;
    stats.total.main++;

    if (h.posisi === 1) {
      stats[liga].pos1++; stats[liga].totalPoin += 3;
      stats.total.pos1++; stats.total.totalPoin += 3;
    } else if (h.posisi === 2) {
      stats[liga].pos2++; stats[liga].totalPoin += 2;
      stats.total.pos2++; stats.total.totalPoin += 2;
    } else if (h.posisi === 3) {
      stats[liga].pos3++; stats[liga].totalPoin += 1;
      stats.total.pos3++; stats.total.totalPoin += 1;
    }

    if (stats.riwayatTerakhir.length < 10) {
      stats.riwayatTerakhir.push({
        id: g.id,
        liga: g.liga,
        tanggal: g.tanggal,
        musim: g.musim,
        posisi: h.posisi,
        skor: h.skor,
        poin: h.poin,
      });
    }
  });

  return stats;
}

// ============================================================
// HELPER UI
// ============================================================

function formatTanggal(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function rankEmoji(posisi) {
  return posisi === 1 ? '🥇' : posisi === 2 ? '🥈' : '🥉';
}

function ligaBadgeHTML(liga) {
  const cls = liga === 'uno' ? 'badge-uno' : 'badge-remi';
  const label = liga === 'uno' ? '🎴 UNO' : '♠️ Remi';
  return `<span class="recent-liga-badge ${cls}">${label}</span>`;
}

// Reset data lama (Andi/Budi/Cici) dan seed ulang dengan pemain baru
function resetDanSeed() {
  const pemain = getPemain();
  const namaLama = ['andi', 'budi', 'cici'];
  const adaPemainLama = pemain.some(p => namaLama.includes(p.nama.toLowerCase()));

  if (adaPemainLama) {
    // Hapus semua data lama
    localStorage.removeItem(KEYS.pemain);
    localStorage.removeItem(KEYS.pertandingan);
  }

  // Seed pemain baru jika belum ada
  if (getPemain().length === 0) {
    tambahPemainData('rajh1gh', '😎', '#e74c3c');
    tambahPemainData('Spoon',   '🥄', '#3498db');
    tambahPemainData('Alvnn',   '🦊', '#9b59b6');
  }
}

// Jalankan
resetDanSeed();
