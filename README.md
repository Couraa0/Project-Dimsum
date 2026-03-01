# 🥟 Dimsum Ratu – Website Sistem Pemesanan

Website profesional full-stack untuk UMKM Dimsum Ratu Karawang.

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16 + TypeScript + Tailwind CSS v3 |
| Backend | Express.js + MongoDB (Mongoose) |
| State | Zustand (cart + auth) |
| Charts | Recharts |
| Auth | JWT |
| Upload | Multer |
| QR Code | qrcode |

## 📁 Struktur Proyek

```
Project Dimsum/
├── frontend/          # Next.js App
│   ├── app/
│   │   ├── page.tsx           # Landing Page
│   │   ├── menu/page.tsx      # Katalog Menu
│   │   ├── order/page.tsx     # Pemesanan Online
│   │   ├── dinein/page.tsx    # Dine-In via QR
│   │   └── admin/
│   │       ├── page.tsx       # Login Admin
│   │       ├── layout.tsx     # Admin Layout
│   │       ├── dashboard/     # Dashboard
│   │       ├── orders/        # Kelola Pesanan
│   │       ├── menu/          # Kelola Menu
│   │       ├── tables/        # Meja & QR Code
│   │       └── reports/       # Laporan Penjualan
│   ├── components/
│   │   ├── layout/ (Navbar, Footer)
│   │   └── ui/ (MenuCard, CartSidebar)
│   ├── store/ (cartStore, authStore)
│   ├── lib/ (api.ts, utils.ts)
│   └── types/ (index.ts)
│
└── backend/           # Express.js API
    └── src/
        ├── index.js           # Main server + seeding
        ├── models/            # Mongoose models
        ├── controllers/       # Business logic
        ├── routes/            # API routes
        └── middleware/        # Auth JWT
```

## 🚀 Cara Menjalankan

### Prasyarat
- Node.js 18+
- MongoDB (local atau Atlas)

### 1. Backend

```bash
cd backend
# Pastikan .env sudah diset (MONGODB_URI, JWT_SECRET, dll)
npm run dev
```
Server berjalan di: `http://localhost:5000`

### 2. Frontend

```bash
cd frontend
npm run dev
```
Buka: `http://localhost:3000`

## 🔑 Admin Login Default

- **Email:** admin@dimsumratu.com
- **Password:** admin123

> ⚠️ Ganti password setelah login pertama!

## 📱 Fitur Dine-In QR

URL format: `http://localhost:3000/dinein?meja=01`

Generate QR dari Admin Dashboard → Meja & QR Code

## 🌐 API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | /api/auth/login | Login admin |
| GET | /api/menu | Daftar menu |
| POST | /api/orders | Buat pesanan |
| GET | /api/tables/:num/info | Info meja |
| GET | /api/orders/report/daily | Laporan harian |
