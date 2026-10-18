/**
 * DATA.JS — Layer penyimpanan data menggunakan Firebase Firestore
 * Semua fungsi async, data disimpan di cloud (sync semua device).
 */

// ============================================================
// PEMAIN
// ============================================================

async function getPemain() {
  try {
    const snap = await db.collection('pemain').orderBy('bergabung', 'asc').get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) { console.error('getPemain error:', e); return []; }
}

async function tambahPemainData(nama, avatar, warna, foto = null) {
  try {
    const snap = await db.collection('pemain')
      .where('nameLower', '==', nama.toLowerCase()).get();
    if (!snap.empty) return { ok: false, msg: 'Nama pemain sudah ada!' };

    const ref = await db.collection('pemain').add({
      nama,
      nameLower: nama.toLowerCase(),
      avatar,
      warna,
      foto: foto || null,
      bergabung: new Date().toISOString(),
    });
    return { ok: true, pemain: { id: ref.id, nama, avatar, warna, foto } };
  } catch (e) { console.error('tambahPemainData error:', e); return { ok: false, msg: 'Gagal menyimpan.' }; }
}

async function updateFotoPemain(id, fotoBase64) {
  try {
    await db.collection('pemain').doc(id).update({ foto: fotoBase64 });
  } catch (e) { console.error('updateFotoPemain error:', e); }
}

async function hapusPemainData(id) {
  try {
    await db.collection('pemain').doc(id).delete();
  } catch (e) { console.error('hapusPemainData error:', e); }
}

// ============================================================
// PERTANDINGAN
// ============================================================

async function getPertandingan() {
  try {
    const snap = await db.collection('pertandingan').orderBy('createdAt', 'desc').get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) { console.error('getPertandingan error:', e); return []; }
}

async function tambahPertandinganData(liga, tanggal, musim, sesi, hasil, catatan) {
  try {
    const data = {
      liga,
      tanggal,
      musim,
      sesi: Number(sesi),
      hasil,
      catatan,
      createdAt: new Date().toISOString(),
    };
    const ref = await db.collection('pertandingan').add(data);
    return { id: ref.id, ...data };
  } catch (e) { console.error('tambahPertandinganData error:', e); return null; }
}

async function hapusPertandinganData(id) {
  try {
    await db.collection('pertandingan').doc(id).delete();
  } catch (e) { console.error('hapusPertandinganData error:', e); }
}

// ============================================================
// KLASEMEN — hitung dari data pertandingan
// ============================================================

async function hitungKlasemen(liga, musim = 'all') {
  const [pemainList, pertandinganList] = await Promise.all([
    getPemain(),
    getPertandingan(),
  ]);

  const filtered = pertandinganList.filter(g => {
    if (g.liga !== liga) return false;
    if (musim !== 'all' && g.musim !== musim) return false;
    return true;
  });

  const map = {};
  pemainList.forEach(p => {
    map[p.id] = {
      id: p.id,
      nama: p.nama,
      avatar: p.avatar,
      warna: p.warna,
      foto: p.foto || null,
      main: 0,
      pos1: 0,
      pos2: 0,
      pos3: 0,
      totalPoin: 0,
    };
  });

  filtered.forEach(g => {
    g.hasil.forEach(h => {
      if (!map[h.pemainId]) return;
      const row = map[h.pemainId];
      row.main++;
      if (h.posisi === 1) { row.pos1++; row.totalPoin += 3; }
      else if (h.posisi === 2) { row.pos2++; row.totalPoin += 2; }
      else if (h.posisi === 3) { row.pos3++; row.totalPoin += 1; }
    });
  });

  return Object.values(map).sort((a, b) => {
    if (b.totalPoin !== a.totalPoin) return b.totalPoin - a.totalPoin;
    if (b.pos1 !== a.pos1) return b.pos1 - a.pos1;
    return b.pos2 - a.pos2;
  });
}

// ============================================================
// MUSIM
// ============================================================

async function getMusimList(liga) {
  const list = await getPertandingan();
  const filtered = liga ? list.filter(g => g.liga === liga) : list;
  const musimSet = new Set(filtered.map(g => g.musim));
  return [...musimSet].sort();
}

// ============================================================
// STATISTIK PEMAIN
// ============================================================

async function getStatsPemain(pemainId) {
  const pertandinganList = await getPertandingan();

  const stats = {
    uno:  { main: 0, pos1: 0, pos2: 0, pos3: 0, totalPoin: 0 },
    remi: { main: 0, pos1: 0, pos2: 0, pos3: 0, totalPoin: 0 },
    total:{ main: 0, pos1: 0, pos2: 0, pos3: 0, totalPoin: 0 },
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
        id: g.id, liga: g.liga, tanggal: g.tanggal,
        musim: g.musim, posisi: h.posisi, skor: h.skor, poin: h.poin,
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

// ============================================================
// SEED PEMAIN DEFAULT (hanya jika Firestore kosong)
// ============================================================

async function seedDefaultPemain() {
  try {
    const snap = await db.collection('pemain').limit(1).get();
    if (!snap.empty) return; // sudah ada data, skip

    await tambahPemainData('rajh1gh', '😎', '#e74c3c');
    await tambahPemainData('Spoon',   '🥄', '#3498db');
    await tambahPemainData('Alvnn',   '🦊', '#9b59b6');
    console.log('Seed pemain default selesai.');
  } catch (e) { console.error('seedDefaultPemain error:', e); }
}

// Jalankan seed saat pertama kali
seedDefaultPemain();
