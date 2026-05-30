// ==================== DATA STORAGE ====================
let users = JSON.parse(localStorage.getItem('users')) || [];
let admins = JSON.parse(localStorage.getItem('admins')) || [];
let attendances = JSON.parse(localStorage.getItem('attendances')) || [];
let currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || null;

let websiteContent = JSON.parse(localStorage.getItem('websiteContent')) || {
    tentang: {
        visi: "Melestarikan dan mengembangkan budaya musik tradisional Jawa melalui generasi muda kreatif dan berprestasi",
        misi: "Mengembangkan kemampuan siswa dalam seni karawitan dan mempererat kebersamaan anggota",
        prestasi: "Juara 3 dalam bidang kreativitas musik tradisional pada FLS3N tingkat kabupaten"
    },
    artikel: "<p>artikel akan diperbaharui secara berkala.</p>",
    kontak: "<p>Alamat: JL. KLATEN - YOGYA KM.7/23, PRAWATAN, JOGONALAN, KLATEN, Prawatan, Kec. Jogonalan, Kab. Klaten, Jawa Tengah.</p><p>📷 Instagram: @karawitan_jogswara</p>",
    galeriGambar: []
};
let ekstraDay = localStorage.getItem('ekstraDay') !== null ? parseInt(localStorage.getItem('ekstraDay')) : 5;

const MAX_ADMINS = 10;

function isAdmin(user) { return user && user.isAdmin === true; }
function saveUsers() { localStorage.setItem('users', JSON.stringify(users)); }
function saveAdmins() { localStorage.setItem('admins', JSON.stringify(admins)); }
function saveAttendances() { localStorage.setItem('attendances', JSON.stringify(attendances)); }
function saveWebsiteContent() { localStorage.setItem('websiteContent', JSON.stringify(websiteContent)); }
function saveEkstraDay() { localStorage.setItem('ekstraDay', ekstraDay); }
function isEkstraDay() { return new Date().getDay() === ekstraDay; }

// Render menu navigasi
function renderNav() {
    const navList = document.getElementById('navList');
    if (!navList) return;
    let menuItems = currentUser ? ['Home', 'Tentang', 'Artikel', 'Galeri', 'Kontak', 'Presensi'] : ['Home', 'Tentang', 'Artikel', 'Galeri', 'Kontak'];
    navList.innerHTML = menuItems.map(item => `<li><a href="#${item.toLowerCase()}">${item}</a></li>`).join('');
}

// Render konten dinamis
function renderDynamicContent() {
    const tentangGrid = document.getElementById('tentangGrid');
    if (tentangGrid) {
        tentangGrid.innerHTML = `
            <div class="about-item"><h3>Visi</h3><p>${websiteContent.tentang.visi}</p></div>
            <div class="about-item"><h3>Misi</h3><p>${websiteContent.tentang.misi}</p></div>
            <div class="about-item"><h3>Prestasi</h3><p>${websiteContent.tentang.prestasi}</p></div>
        `;
    }
    const artikelDiv = document.getElementById('artikelContent');
    if (artikelDiv) artikelDiv.innerHTML = websiteContent.artikel;
    const kontakDiv = document.getElementById('kontakContent');
    if (kontakDiv) kontakDiv.innerHTML = websiteContent.kontak;
    const galleryDiv = document.getElementById('galleryImages');
    if (galleryDiv) {
        if (websiteContent.galeriGambar.length === 0) {
            galleryDiv.innerHTML = '<p>Belum ada foto. Login sebagai admin untuk upload.</p>';
        } else {
            let html = '';
            websiteContent.galeriGambar.forEach(img => {
                html += `<div><img src="${img.base64}" class="gallery-img" alt="${img.nama}"><p>${img.nama}</p></div>`;
            });
            galleryDiv.innerHTML = html;
        }
    }
}

// Tabel kehadiran
function renderAttendanceTable() {
    const tbody = document.getElementById('attendanceTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (attendances.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">Belum ada data presensi</td></tr>';
        return;
    }
    attendances.forEach((att, idx) => {
        const row = tbody.insertRow();
        row.insertCell(0).innerText = idx + 1;
        row.insertCell(1).innerText = att.nama;
        row.insertCell(2).innerText = att.kelas;
        row.insertCell(3).innerText = att.alat_musik;
        row.insertCell(4).innerText = att.status;
        row.insertCell(5).innerText = att.alasan || '-';
        row.insertCell(6).innerText = att.waktu;
    });
}

// Form pendaftaran admin (jika kuota < 10)
function renderAdminRegisterOption() {
    const container = document.getElementById('adminRegisterContainer');
    if (!container) return;
    if (admins.length < MAX_ADMINS) {
        container.innerHTML = `
            <div class="admin-reg-box">
                <h3>Daftar Sebagai Admin (Khusus ${MAX_ADMINS} orang pertama)</h3>
                <form id="adminRegisterForm">
                    <label>Username (untuk login admin):</label>
                    <input type="text" id="adminUsername" placeholder="pilih username" required>
                    <label>Password:</label>
                    <input type="password" id="adminPassword" placeholder="pilih password" required>
                    <label>Nama Lengkap:</label>
                    <input type="text" id="adminNama" placeholder="Nama lengkap" required>
                    <label>Alat Musik:</label>
                    <input type="text" id="adminAlat" placeholder="Alat musik" required>
                    <label>Email:</label>
                    <input type="email" id="adminEmail" placeholder="Email" required>
                    <label>Kelas:</label>
                    <select id="adminKelas" required>
                        <option value="">Pilih Kelas</option>
                        <option>XA</option><option>XB</option><option>XC</option><option>XD</option>
                        <option>XE</option><option>XF</option><option>XG</option><option>XH</option>
                        <option>XI.1</option><option>XI.2</option><option>XI.3</option><option>XI.4</option>
                        <option>XI.5</option><option>XI.6</option><option>XI.7</option><option>XI.8</option>
                        <option>XII.1</option><option>XII.2</option><option>XII.3</option><option>XII.4</option>
                        <option>XII.5</option><option>XII.6</option><option>XII.7</option><option>XII.8</option>
                    </select>
                    <label>Pesan:</label>
                    <textarea id="adminPesan" rows="3" placeholder="Alasan ingin menjadi admin"></textarea>
                    <button type="submit">Daftar sebagai Admin</button>
                </form>
                <p style="margin-top:10px; font-size:12px;">*Sisa kuota admin: ${MAX_ADMINS - admins.length} dari ${MAX_ADMINS}</p>
            </div>
        `;
        document.getElementById('adminRegisterForm').addEventListener('submit', (e) => {
            e.preventDefault();
            if (admins.length >= MAX_ADMINS) {
                alert('Kuota admin sudah penuh (10 orang). Tidak bisa mendaftar lagi.');
                renderAdminRegisterOption();
                return;
            }
            const username = document.getElementById('adminUsername').value.trim();
            const password = document.getElementById('adminPassword').value.trim();
            const nama = document.getElementById('adminNama').value.trim();
            const alat_musik = document.getElementById('adminAlat').value.trim();
            const email = document.getElementById('adminEmail').value.trim();
            const kelas = document.getElementById('adminKelas').value;
            const pesan = document.getElementById('adminPesan').value.trim();
            if (!username || !password || !nama || !alat_musik || !email || !kelas) return alert('Lengkapi semua data!');
            if (admins.find(a => a.username === username)) return alert('Username sudah dipakai. Pilih yang lain.');
            if (admins.find(a => a.nama === nama && a.kelas === kelas) || users.find(u => u.nama === nama && u.kelas === kelas)) {
                return alert('Nama dan kelas sudah terdaftar sebagai anggota atau admin.');
            }
            admins.push({ username, password, nama, alat_musik, email, kelas, pesan, isAdmin: true });
            saveAdmins();
            alert('Pendaftaran admin berhasil! Silakan login dengan username dan password Anda.');
            document.getElementById('adminRegisterForm').reset();
            renderAdminRegisterOption();
        });
    } else {
        container.innerHTML = `<div class="admin-reg-box"><p><strong>⚠️ Kuota admin sudah penuh (10 orang). Pendaftaran admin ditutup.</strong></p></div>`;
    }
}

// Panel Admin
function renderAdminPanel(container) {
    const dayNames = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
    container.innerHTML = `
        <div class="admin-panel">
            <h3>Panel Admin</h3>
            <form id="editTentangForm">
                <h4>Edit Tentang</h4>
                <label>Visi:</label><textarea id="editVisi" rows="2">${websiteContent.tentang.visi}</textarea>
                <label>Misi:</label><textarea id="editMisi" rows="2">${websiteContent.tentang.misi}</textarea>
                <label>Prestasi:</label><textarea id="editPrestasi" rows="2">${websiteContent.tentang.prestasi}</textarea>
                <button type="submit">Simpan Tentang</button>
            </form>
            <form id="editArtikelForm">
                <h4>Edit Artikel</h4>
                <textarea id="editArtikel" rows="4">${websiteContent.artikel}</textarea>
                <button type="submit">Simpan Artikel</button>
            </form>
            <form id="editKontakForm">
                <h4>Edit Kontak</h4>
                <textarea id="editKontak" rows="4">${websiteContent.kontak}</textarea>
                <button type="submit">Simpan Kontak</button>
            </form>
            <form id="uploadGambarForm">
                <h4>Tambah Foto Galeri</h4>
                <label>Judul Foto:</label><input type="text" id="fotoJudul" placeholder="Misal: Latihan Gamelan" required>
                <label>Pilih Gambar:</label><input type="file" id="fotoFile" accept="image/*" required>
                <button type="submit">Upload Foto</button>
            </form>
            <form id="aturHariForm">
                <h4>Atur Hari Presensi Ekstra</h4>
                <select id="hariEkstra">
                    ${dayNames.map((day, idx) => `<option value="${idx}" ${ekstraDay===idx ? 'selected':''}>${day}</option>`).join('')}
                </select>
                <button type="submit">Simpan Hari Ekstra</button>
            </form>
            <p style="margin-top:10px; font-size:12px;">* Perubahan akan langsung tampil di halaman.</p>
        </div>
    `;
    document.getElementById('editTentangForm').addEventListener('submit', (e) => {
        e.preventDefault();
        websiteContent.tentang = {
            visi: document.getElementById('editVisi').value,
            misi: document.getElementById('editMisi').value,
            prestasi: document.getElementById('editPrestasi').value
        };
        saveWebsiteContent();
        renderDynamicContent();
        alert('Konten Tentang berhasil diupdate');
    });
    document.getElementById('editArtikelForm').addEventListener('submit', (e) => {
        e.preventDefault();
        websiteContent.artikel = document.getElementById('editArtikel').value;
        saveWebsiteContent();
        renderDynamicContent();
        alert('Artikel berhasil diupdate');
    });
    document.getElementById('editKontakForm').addEventListener('submit', (e) => {
        e.preventDefault();
        websiteContent.kontak = document.getElementById('editKontak').value;
        saveWebsiteContent();
        renderDynamicContent();
        alert('Kontak berhasil diupdate');
    });
    document.getElementById('uploadGambarForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const judul = document.getElementById('fotoJudul').value.trim();
        const file = document.getElementById('fotoFile').files[0];
        if (!judul || !file) return alert('Isi judul dan pilih gambar');
        const reader = new FileReader();
        reader.onload = function(ev) {
            websiteContent.galeriGambar.push({ nama: judul, base64: ev.target.result });
            saveWebsiteContent();
            renderDynamicContent();
            alert('Foto berhasil ditambahkan');
            document.getElementById('uploadGambarForm').reset();
        };
        reader.readAsDataURL(file);
    });
    document.getElementById('aturHariForm').addEventListener('submit', (e) => {
        e.preventDefault();
        ekstraDay = parseInt(document.getElementById('hariEkstra').value);
        saveEkstraDay();
        alert('Hari ekstra berhasil diubah. Halaman akan dimuat ulang.');
        window.location.reload();
    });
}

// Update UI berdasarkan status login
function updateUI() {
    const userBar = document.getElementById('userInfoBar');
    const userDetails = document.getElementById('userDetails');
    const pendaftaranSection = document.getElementById('pendaftaran');
    const loginSection = document.getElementById('loginsection');
    const presensiSection = document.getElementById('presensi');
    const adminPanelDiv = document.getElementById('adminPanelContainer');
    const homeSection = document.getElementById('home');
    const openRecBtn = document.getElementById('openRecruitmentBtn');
    const otherSections = ['tentang', 'artikel', 'galeri', 'kontak'];
    const hasAnyUser = (users.length > 0 || admins.length > 0);
    
    if (currentUser) {
        userBar.style.display = 'flex';
        if (isAdmin(currentUser)) {
            userDetails.innerHTML = `Admin: ${currentUser.username} (${currentUser.nama})`;
            renderAdminPanel(adminPanelDiv);
        } else {
            userDetails.innerHTML = `${currentUser.nama} (${currentUser.kelas}) - 🎵 ${currentUser.alat_musik} | 📧 ${currentUser.email}`;
            adminPanelDiv.innerHTML = '';
        }
        pendaftaranSection.style.display = 'none';
        loginSection.style.display = 'none';
        presensiSection.style.display = '';
        homeSection.style.display = '';
        openRecBtn.style.display = 'none';
        otherSections.forEach(sec => document.getElementById(sec).style.display = '');
        document.querySelector('.container:last-of-type').style.display = '';
        document.querySelector('footer').style.display = '';
        
        const presensiBox = document.querySelector('#presensi .presensi-box');
        const presensiMsg = document.getElementById('presensiMessage');
        if (isEkstraDay()) {
            presensiBox.style.display = 'block';
            presensiMsg.innerText = 'Hari ini adalah jadwal ekstra! Silakan isi presensi.';
        } else {
            presensiBox.style.display = 'none';
            const dayNames = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
            presensiMsg.innerText = `Hari ini bukan jadwal ekstra. Presensi hanya bisa diisi pada hari ${dayNames[ekstraDay]}.`;
        }
    } else {
        userBar.style.display = 'none';
        adminPanelDiv.innerHTML = '';
        if (hasAnyUser) {
            pendaftaranSection.style.display = 'block';
            loginSection.style.display = 'block';
            presensiSection.style.display = 'none';
            homeSection.style.display = '';
            openRecBtn.style.display = 'inline-block';
            otherSections.forEach(sec => document.getElementById(sec).style.display = '');
            document.querySelector('.container:last-of-type').style.display = 'none';
            document.querySelector('footer').style.display = '';
        } else {
            pendaftaranSection.style.display = 'block';
            loginSection.style.display = 'none';
            presensiSection.style.display = 'none';
            homeSection.style.display = '';
            openRecBtn.style.display = 'inline-block';
            otherSections.forEach(sec => document.getElementById(sec).style.display = 'none');
            document.querySelector('.container:last-of-type').style.display = 'none';
            document.querySelector('footer').style.display = 'none';
        }
    }
    renderAttendanceTable();
    renderDynamicContent();
    renderNav();
    if (pendaftaranSection.style.display !== 'none') renderAdminRegisterOption();
    else {
        const adminRegContainer = document.getElementById('adminRegisterContainer');
        if (adminRegContainer) adminRegContainer.innerHTML = '';
    }
}

// ==================== EVENT LISTENER ====================
document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const nama = document.getElementById('nama').value.trim();
    const alat_musik = document.getElementById('alat_musik').value.trim();
    const email = document.getElementById('email').value.trim();
    const kelas = document.getElementById('kelas').value;
    const pesan = document.getElementById('pesan').value;
    if (!nama || !alat_musik || !email || !kelas) return alert('Lengkapi semua data!');
    if (users.find(u => u.nama === nama && u.kelas === kelas) || admins.find(a => a.nama === nama && a.kelas === kelas)) {
        return alert('Nama dan kelas sudah terdaftar. Silakan login.');
    }
    const newUser = { nama, alat_musik, email, kelas, pesan, isAdmin: false };
    users.push(newUser);
    saveUsers();
    currentUser = newUser;
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    alert('Pendaftaran berhasil! Anda langsung masuk sebagai anggota biasa.');
    updateUI();
    document.getElementById('registerForm').reset();
});

document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const kelas = document.getElementById('loginKelas').value.trim();
    const alat = document.getElementById('loginAlat').value.trim();
    const password = document.getElementById('loginPassword').value;
    const admin = admins.find(a => a.username === username && a.password === password);
    if (admin) {
        currentUser = { ...admin, isAdmin: true };
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        alert(`Selamat datang Admin ${admin.username}`);
        updateUI();
        document.getElementById('loginForm').reset();
        return;
    }
    const found = users.find(u => u.nama === username && u.kelas === kelas && u.alat_musik === alat);
    if (found) {
        currentUser = found;
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        alert(`Selamat datang ${found.nama}`);
        updateUI();
        document.getElementById('loginForm').reset();
    } else {
        alert('Login gagal. Periksa data siswa atau gunakan akun admin.');
    }
});

document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    sessionStorage.removeItem('currentUser');
    currentUser = null;
    updateUI();
    alert('Anda telah logout.');
});

document.getElementById('presenceForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentUser || currentUser.isAdmin) {
        alert('Hanya anggota biasa yang sudah login bisa mengisi presensi.');
        return;
    }
    if (!isEkstraDay()) {
        alert('Hari ini bukan jadwal ekstra, tidak bisa presensi.');
        return;
    }
    const status = document.getElementById('statusHadir').value;
    let alasan = document.getElementById('alasanTidakHadir').value.trim();
    if (status === 'tidak hadir' && alasan === '') return alert('Isi alasan tidak hadir.');
    if (status === 'hadir') alasan = '';
    const waktu = new Date().toLocaleString();
    attendances.push({
        nama: currentUser.nama,
        kelas: currentUser.kelas,
        alat_musik: currentUser.alat_musik,
        status: status,
        alasan: alasan,
        waktu: waktu
    });
    saveAttendances();
    renderAttendanceTable();
    alert('Presensi berhasil dikirim!');
    document.getElementById('presenceForm').reset();
});

document.getElementById('openRecruitmentBtn').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('pendaftaran').scrollIntoView({ behavior: 'smooth' });
});

// Inisialisasi
renderDynamicContent();
updateUI();