# 🥟 Dimsum Ratu – Website Pemesanan Online

Website profesional full-stack untuk **Dimsum Ratu**, UMKM kuliner dimsum di Karawang yang melayani dine-in, take away, dan delivery. Dilengkapi dengan otentikasi Google dan manajemen pengguna multi-role.

🌐 **Live Demo:** [dimsum-ratu.vercel.app](https://dimsum-ratu.vercel.app)  
⚙️ **Backend API:** [dimsum-backend.vercel.app/api/docs](https://dimsum-backend.vercel.app/api/docs)  
📦 **Repository:** [github.com/Couraa0/Project-Dimsum](https://github.com/Couraa0/Project-Dimsum)

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| 🏠 Landing Page | Hero, best sellers, testimonial, dan CTA |
| 📋 Katalog Menu | Filter kategori, search, tambah ke keranjang, responsif |
| 🛒 Pemesanan Online | Multi-step checkout (Dine-in / Take Away / Delivery) |
| 🔐 Otentikasi Google | Login instan dengan akun Google OAuth 2.0 |
| 👨‍💼 RBAC Multi-Role | Role Akses Pengguna (Admin, Kasir, User Default) |
| 🖥️ Point of Sale (POS) | Layar kasir khusus untuk mencatat pesanan *Walk-In* langsung |
| 📱 In-App QR Scanner | Scan QR meja langsung dari browser (Dine-in) |
| 👔 Admin Dashboard | Kelola pesanan, manajemen user, tabel, dan menu base64 image |
| 🔔 Smart Notifications | SweetAlert2 konfirmasi interaktif & Hot-Toast notifikasi |
| 📊 Laporan Analitik | Grafik harian & bulanan penjualan, eksport CSV |

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | Next.js 16 · TypeScript · Tailwind CSS v3 |
| **Backend** | Express.js 4 · Node.js |
| **Database** | MongoDB Atlas (Mongoose v9) |
| **State Management** | Zustand (cart + auth) |
| **Auth** | JWT (jsonwebtoken) & Google OAuth 2.0 |
| **UI Components** | Lucide React · SweetAlert2 · React Hot Toast |
| **Charts** | Recharts |
| **Image Handling** | Base64 strings (Langsung di database Mongoose) |
| **QR Code** | qrcode |
| **Deploy Backend** | Vercel Serverless |

---

## 📁 Struktur Proyek

```text
Project Dimsum/
├── frontend/                  # Next.js 16 App
│   ├── app/
│   │   ├── (auth)/            # Auth Routings (Login, Register dengan Google)
│   │   ├── page.tsx           # Landing Page
│   │   ├── menu/page.tsx      # Katalog Menu
│   │   ├── order/page.tsx     # Checkout Multi-step
│   │   ├── dinein/page.tsx    # Menu QR Dine-In
│   │   ├── admin/             # Layout Dashboard (Terproteksi Middleware JWT)
│   │       ├── pos/           # Modul Point of Sale (Kasir Internal)
│   │       ├── users/         # Manajemen Akun & Roles
│   │       ├── orders/        # Kelola Pesanan Real-time
│   │       ├── menu/          # CRUD Menu + Upload Gambar Otomatis (Base64)
│   │       ├── tables/        # Meja & Generate QR
│   │       └── reports/       # Laporan + Export CSV
│   ├── components/
│   │   ├── layout/            # Navbar terintegrasi Dropdown User state
│   │   └── ui/                # MenuCard, CartSidebar
│   ├── store/                 # Zustand Persistent Storage (cartStore, authStore)
│   ├── lib/                   # API interceptors (Axios), Utils
│   └── types/                 # Interfaces TypeScript
│
└── backend/                   # Express.js API
    └── src/
        ├── index.js           # Main Server Express
        ├── models/            # User, MenuItem, Category, Order, Table
        ├── controllers/       # Controller (Business Logic)
        ├── routes/            # REST Endpoints Route
        └── middleware/        # JWT verifier & Role guards
```

---

## 🚀 Menjalankan Lokal

### Prasyarat
- Node.js 18+
- Akun MongoDB Atlas (gratis)
- Google Cloud Console Project (Untuk set up OAuth Web Client ID)

### 1. Clone Repository
```bash
git clone https://github.com/Couraa0/Project-Dimsum.git
cd Project-Dimsum
```

### 2. Setup Backend
```bash
cd backend
cp .env.example .env
# Edit .env -> Isi MONGODB_URI beserta Google OAuth Keys
npm install
npm run dev
# -> Backend jalan di http://localhost:5000
```

### 3. Setup Frontend
```bash
cd frontend
cp .env.local.example .env.local
# Edit .env.local -> Masukkan Client ID Google Anda
npm install
npm run dev
# -> Web app berjalan di http://localhost:3000
```

### 4. Admin Seeding (Penting!)
Buka terminal baru di folder `backend`, lalu eksekusi *seeder* script untuk inject akun admin pertama:
```bash
node seed.js
```
*Tindakan ini akan membuat akun admin default pada koleksi MongoDB Anda.*

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/dimsum_ratu
JWT_SECRET=your_secret_key_randomizer
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=10981...ef70.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...AWfU_C...
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=10981...ef70.apps.googleusercontent.com
```
*Catatan: Pastikan `http://localhost:3000` telah didaftarkan dalam daftar **Authorized JavaScript origins** di console Google Cloud.*

---

## 🌐 API Endpoints

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `POST` | `/api/users/login` | ❌ | Email/Password Biasa |
| `POST` | `/api/users/register`| ❌ | Buat Akun Baru |
| `POST` | `/api/users/google` | ❌ | OAuth Google |
| `GET`  | `/api/users/me`     | ✅ | Info Sesi Aktif |
| `GET`  | `/api/users`        | 👮 | (Admin) Ekstrak daftar pengguna |
| `PATCH`| `/api/users/:id/role`| 👮 | (Admin) Ubah peran (Kasir/Admin/User) |
| `GET`  | `/api/menu`         | ❌ | Daftar menu (public) |
| `POST` | `/api/menu`         | 👮 | (Admin) Tambah menu baru base64 |
| `POST` | `/api/orders`       | ❌ | Buat pesanan (checkout via front) |
| `GET`  | `/api/orders`       | 👮 | (Admin/Kasir) Semua pesanan aktif |
| `PATCH`| `/api/orders/:id/status`| 👮| (Admin/Kasir) Update status |
| `POST` | `/api/tables`       | 👮 | (Admin) Buat meja baru & scan QR |
| `GET`  | `/api/orders/report/daily`| 👮 | Statistik grafik analitik harian |

---

## 📱 Alur Checkout & Sistem QR Dine-In

1. Admin login & Generate QR melalui halaman "Meja & QR Code".
2. QR Code otomatis tersimpan > Admin print stiker.
3. User (Customer) men-scan kode di meja menggunakan perangkat Android/IOS.
4. Jika membuka langsung browser ke keranjang `dimsum-ratu.vercel.app/order`, User juga dapat memindai dari lensa kamera bawaan *(In-App Camera Injector)* di opsi **Dine In**.
5. Form data sinkron lalu dikirim via POST. Sistem Kasir otomatis mendapat alarm Notifikasi Instan.

---

## 🔑 Login Admin Default

Setelah Anda mengeksekusi `node seed.js` pada Step 4, Anda dapat langsung login sebagai Super Admin, menggunakan:

```text
Email    : admin@dimsumratu.com
Password : admin123
```
*Jangan lupa melakukan pergantian akses jika diperlukan melalui Dashboard Manajemen Akun (Admin Users).*

---

## 🚀 Deployment

| Platform | Service | Link Aktif |
|----------|---------|------------|
| **Vercel** | Frontend (Next.js) | [dimsum-ratu.vercel.app](https://dimsum-ratu.vercel.app) |
| **Vercel** | Backend (Express.js) | [dimsum-backend.vercel.app/api/docs](https://dimsum-backend.vercel.app/api/docs) |
| **MongoDB Atlas** | Database | Cloud Server |

---

## 👨‍💻 Developer

**Muhammad Rakha Syamputra** – [@Couraa0](https://github.com/Couraa0)  
**Fauzan Farhan Gayo** – [@Ojangboy](https://github.com/Ojangboy)

---

## 📄 Lisensi

Proyek ini berada di bawah aturan **MIT License**, dapat disesuaikan dan dihosting ulang sesuai peruntukan penggunaan.

---

## 🧾 Laporan Implementasi Serverless (Ringkasan Lengkap)

Berikut adalah laporan lengkap yang menjelaskan mengapa dan bagaimana aplikasi ini dapat diimplementasikan dalam arsitektur serverless, termasuk panduan deployment ke Vercel dan rekomendasi operasional.

**Analisis Kebutuhan & Skema Data**
- Backend menyediakan endpoint untuk autentikasi, manajemen menu/kategori, pesanan, tabel, dan pengguna. Skema model utama berada di `backend/src/models` (`User`, `Admin`, `Category`, `MenuItem`, `Order`, `Table`).

**Arsitektur & Alur Komunikasi**
- Client → Vercel (Frontend) → Backend API (Serverless Function atau external service) → MongoDB Atlas
- File upload disarankan diarahkan ke S3/GCS menggunakan presigned URLs.

**Implementasi Teknis (Ringkas)**
- Serverless adapter: gunakan `serverless-http` untuk membungkus Express bila ingin menjalankan backend sebagai Function.
- Pastikan `MONGODB_URI` disimpan sebagai secret di Vercel dan `backend/src/index.js` menggunakan pola koneksi yang serverless-friendly (sudah diimplementasikan: `isConnected`).
- Untuk uploads: simpan file di S3/GCS; simpan URL di `MenuItem.image`.

Contoh handler Vercel (lokasi: `backend/api/index.js`):

```js
const serverless = require('serverless-http');
const app = require('../src/index');
module.exports = serverless(app);
```

**Deployment ke Vercel**
- Untuk Frontend: hubungkan repository ke Vercel dan deploy (Next.js auto-optimized).
- Untuk Backend: deploy sebagai Serverless Function (letakkan handler di `backend/api/`), atau deploy ke Cloud Run / Lambda bila membutuhkan file upload besar atau runtime khusus.
- Pastikan Environment Variables di Vercel:
    - `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.

**Kenapa Vercel termasuk serverless**
- Vercel menjalankan aplikasi Next.js dan Functions dalam model compute yang bersifat ephemeral, autoscaling, dan terkelola sepenuhnya. Pengguna tidak mengelola server, resource otomatis menyesuaikan berdasarkan trafik, dan biaya dihitung berdasarkan penggunaan — karakteristik inti serverless.

**Pengujian & Monitoring**
- Gunakan `backend/scripts/load-test.js` untuk simulasi lokal (Low/Medium/High). Untuk pengujian lebih kompleks, gunakan `k6` atau `artillery`.
- Untuk observability, integrasikan Sentry/Datadog dan aktifkan Vercel Analytics; untuk backend pada cloud provider gunakan Cloud Logging/CloudWatch + X-Ray.

**Estimasi Biaya Ringkas**
- Komponen: Vercel (frontend + functions), MongoDB Atlas, S3/GCS, monitoring.
- Perkiraan kecil: $30–200/bulan (bergantung traffic dan tier DB).

**Rekomendasi Lanjutan**
- Gunakan presigned uploads ke S3 untuk menghindari batas payload functions.
- Tambahkan tracing (X-Ray/Cloud Trace) dan alerting untuk latensi/error.
- Lakukan load testing berulang setelah perubahan memory/timeout function.

---

Jika Anda ingin saya menambahkan file contoh (`backend/api/index.js`, `lambda/handler.js`) atau membuat skrip `k6/artillery`, beri tahu opsi yang diinginkan dan saya akan menambahkannya ke repository.
