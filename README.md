# 🥟 Dimsum Ratu – Website Pemesanan Online

Website profesional full-stack untuk **Dimsum Ratu**, UMKM kuliner dimsum di Karawang yang melayani dine-in, take away, dan delivery.

🌐 **Live Demo:** [dimsum-yummy.vercel.app](https://dimsum-yummy.vercel.app)  
⚙️ **Backend API:** [project-dimsum-production.up.railway.app](https://project-dimsum-production.up.railway.app/api/health)  
📦 **Repository:** [github.com/Couraa0/Project-Dimsum](https://github.com/Couraa0/Project-Dimsum)

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| 🏠 Landing Page | Hero, best sellers, testimonial, dan CTA |
| 📋 Katalog Menu | Filter kategori, search, tambah ke keranjang |
| 🛒 Pemesanan Online | Multi-step checkout (Dine-in / Take Away / Delivery) |
| 📱 QR Code Dine-In | Scan QR → buka menu meja otomatis |
| 👨‍💼 Admin Dashboard | Kelola pesanan, menu, meja, dan laporan penjualan |
| 📊 Laporan | Grafik harian & bulanan, export CSV |

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | Next.js 16 · TypeScript · Tailwind CSS v3 |
| **Backend** | Express.js 4 · Node.js |
| **Database** | MongoDB Atlas (Mongoose v9) |
| **State Management** | Zustand (cart + auth) |
| **Charts** | Recharts |
| **Auth** | JWT (jsonwebtoken) |
| **Upload** | Multer |
| **QR Code** | qrcode |
| **Deploy Frontend** | Vercel |
| **Deploy Backend** | Railway |

---

## 📁 Struktur Proyek

```
Project Dimsum/
├── frontend/                  # Next.js 16 App
│   ├── app/
│   │   ├── page.tsx           # Landing Page
│   │   ├── menu/page.tsx      # Katalog Menu
│   │   ├── order/page.tsx     # Multi-step Checkout
│   │   ├── dinein/page.tsx    # Menu QR Dine-In
│   │   └── admin/
│   │       ├── page.tsx       # Admin Login
│   │       ├── layout.tsx     # Sidebar Admin
│   │       ├── dashboard/     # Statistik & Overview
│   │       ├── orders/        # Kelola Pesanan Real-time
│   │       ├── menu/          # CRUD Menu + Upload Foto
│   │       ├── tables/        # Meja & Generate QR
│   │       └── reports/       # Laporan + Export CSV
│   ├── components/
│   │   ├── layout/            # Navbar, Footer
│   │   └── ui/                # MenuCard, CartSidebar
│   ├── store/                 # Zustand (cart, auth)
│   ├── lib/                   # API client, utils
│   └── types/                 # TypeScript interfaces
│
└── backend/                   # Express.js API
    └── src/
        ├── index.js           # Server + auto-seeding data
        ├── models/            # Admin, MenuItem, Category, Order, Table
        ├── controllers/       # Business logic
        ├── routes/            # REST API endpoints
        └── middleware/        # JWT auth
```

---

## 🚀 Menjalankan Lokal

### Prasyarat
- Node.js 18+
- Akun MongoDB Atlas (gratis)

### 1. Clone Repository
```bash
git clone https://github.com/Couraa0/Project-Dimsum.git
cd Project-Dimsum
```

### 2. Setup Backend
```bash
cd backend
cp .env.example .env
# Edit .env → isi MONGODB_URI dengan connection string Atlas Anda
npm install
npm run dev
# → http://localhost:5000
```

### 3. Setup Frontend
```bash
cd frontend
cp .env.local.example .env.local
# Edit .env.local jika perlu
npm install
npm run dev
# → http://localhost:3000
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/dimsum_ratu
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🌐 API Endpoints

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `POST` | `/api/auth/login` | ❌ | Login admin |
| `GET` | `/api/menu` | ❌ | Daftar menu (public) |
| `GET` | `/api/categories` | ❌ | Daftar kategori |
| `POST` | `/api/orders` | ❌ | Buat pesanan |
| `GET` | `/api/tables/:num/info` | ❌ | Info meja untuk QR |
| `GET` | `/api/orders` | ✅ | Semua pesanan (admin) |
| `PATCH` | `/api/orders/:id/status` | ✅ | Update status |
| `POST` | `/api/menu` | ✅ | Tambah menu baru |
| `POST` | `/api/tables` | ✅ | Buat meja + generate QR |
| `GET` | `/api/orders/report/daily` | ✅ | Laporan harian |
| `GET` | `/api/health` | ❌ | Health check |

---

## 📱 Sistem QR Dine-In

1. Login Admin → **Meja & QR Code** → Tambah Meja
2. QR Code otomatis ter-generate
3. Download QR → print → tempel di meja fisik
4. Customer scan QR → buka: `https://dimsum-yummy.vercel.app/dinein?meja=01`
5. Customer pilih menu & pesan langsung dari smartphone

---

## 🔑 Login Admin Default

> ⚠️ Data ini otomatis dibuat saat backend pertama kali connect ke database

```
Email    : admin@dimsumratu.com
Password : admin123
```

**Ganti password setelah login pertama!**

---

## 🚀 Deployment

| Platform | Service | URL |
|----------|---------|-----|
| **Vercel** | Frontend (Next.js) | [dimsum-yummy.vercel.app](https://dimsum-yummy.vercel.app) |
| **Railway** | Backend (Express.js) | [project-dimsum-production.up.railway.app](https://project-dimsum-production.up.railway.app) |
| **MongoDB Atlas** | Database | Cloud (Singapore region) |

---

## 👨‍💻 Developer

**Muhammad Rakha** – [@Couraa0](https://github.com/Couraa0)

---

## 📄 License

MIT License – feel free to use and modify for your own projects.
