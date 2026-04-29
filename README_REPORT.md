# Laporan Implementasi Serverless — Dimsum Ratu

Dokumen ini adalah laporan teknis lengkap yang menjelaskan analisis kebutuhan, perancangan arsitektur serverless, implementasi teknis, langkah deployment (termasuk ke Vercel), pengujian beban, monitoring, estimasi biaya, dan rekomendasi pengembangan untuk proyek Dimsum Ratu.

## Ringkasan Eksekutif
- Tujuan: Migrasi/implementasi backend ke arsitektur serverless agar aplikasi mampu menangani beban burst saat jam sibuk dengan biaya operasional efisien.
- Ruang lingkup minimum: pembuatan REST API, integrasi dengan database, pengujian request dalam berbagai skala, monitoring eksekusi dan latency.

## 1. Analisis Kebutuhan
- Fungsional minimal:
  - REST API untuk otentikasi, manajemen kategori/menu/order/table/user.
  - Endpoint publik untuk katalog menu dan tracking order.
  - Upload gambar menu (saat ini base64 di DB; direkomendasikan pindah ke object storage).
  - Health check endpoint `/api/health`.
- Non-fungsional:
  - Skalabilitas otomatis (scale up/down selama jam sibuk).
  - Latensi rendah untuk pembuatan order.
  - Ketersediaan tinggi untuk layanan pemesanan.
  - Keamanan (secret management, HTTPS, role-based access control).

## 2. Permasalahan / Skenario Bisnis
- Traffic burst pada jam makan (mis. 11:00–13:00, 18:00–20:00).
- Volume gambar menu dan upload (jumlah dan ukuran gambar seiring waktu bertambah).
- Perlu pipeline observability untuk mendeteksi penurunan performa dan error rate.

## 3. Alasan Penggunaan Cloud (Serverless)
- Pay-per-use: biaya turun saat beban rendah.
- Autoscaling: menangani burst tanpa provisioning manual.
- Manajemen infrastruktur minimal (no servers to manage).
- Integrasi mudah dengan Managed DB (MongoDB Atlas), object storage (S3/GCS), dan layanan observability.

## 4. Estimasi Kebutuhan Sumber Daya (awal)
- Perkiraan RPS puncak: 50–200 req/s (sesuaikan setelah load test nyata).
- Memory fungsi: 256–1024 MB (mulai rekomendasi 512 MB).
- Timeout fungsi: 10–30 detik (tweak untuk operasi db berat).
- Storage objek: 1–50 GB tergantung koleksi gambar.
- DB tier awal: MongoDB Atlas M2/M5; skala ke M10+ bila perlu.

## 5. Perancangan Arsitektur

```mermaid
flowchart LR
  Client[Client (Web / Mobile)] -->|HTTPS| CDN[CDN (Vercel / Cloudflare)]
  CDN --> Frontend[Vercel (Next.js)]
  Frontend -->|API| APIGW[API Gateway / Vercel Functions]
  APIGW --> Function[Serverless Function (Vercel / Lambda / Cloud Run)]
  Function -->|Reads/Writes| Mongo[MongoDB Atlas]
  Function -->|Upload| S3[S3 / GCS (Presigned Uploads)]
  Function --> Logs[Cloud Logging / CloudWatch]
  Logs --> Alerts[Alerting (Email/Slack/SNS)]
  Function --> Tracing[X-Ray / Cloud Trace]
```

### Alur komunikasi singkat
1. User mengakses frontend di Vercel (cached CDN). 2. Frontend memanggil API (domain atau path function). 3. Function membaca atau menulis ke MongoDB Atlas. 4. Untuk upload gambar: frontend meminta presigned URL dari Function → upload langsung ke S3/GCS → Function menyimpan URL di `MenuItem.image`.

### Justifikasi pemilihan layanan
- Vercel: optimal untuk Next.js frontend; menyediakan Serverless/Edge Functions untuk API ringan.
- MongoDB Atlas: managed MongoDB yang kompatibel langsung dengan Mongoose.
- S3/GCS: object storage murah dan scalable, cocok untuk gambar.
- CloudWatch / Cloud Logging + X-Ray: observability dan tracing distribusi latensi.

## 6. Implementasi — Langkah Teknis
### 6.1 Persiapan environment
- Buat akun MongoDB Atlas, buat cluster dan database `dimsum_ratu`.
- Siapkan S3 bucket (AWS) atau GCS bucket (GCP) untuk menyimpan gambar.
- Pastikan repository frontend terhubung ke Vercel.

### 6.2 Adaptasi Express untuk Serverless
- Tambahkan dependency:

```bash
cd backend
npm install serverless-http
```

- Tambahkan file handler untuk Vercel (letakkan di `backend/api/index.js`):

```js
// backend/api/index.js
const serverless = require('serverless-http');
const app = require('../src/index');
module.exports = serverless(app);
```

> Catatan: Vercel akan menyajikan file di folder `api/` sebagai Serverless Function. Alternatif: deploy Express ke Cloud Run (lebih cocok untuk upload besar).

### 6.3 Konfigurasi koneksi DB serverless-friendly
- `backend/src/index.js` sudah menggunakan pola `isConnected` untuk mencegah koneksi berulang di lingkungan serverless. Pastikan `MONGODB_URI` ditempatkan pada Environment Variables di platform target.

### 6.4 Mengubah upload menjadi presigned URL (rekomendasi)
- Flow:
  1. Frontend minta presigned URL pada endpoint Function.
  2. Frontend upload langsung ke S3/GCS.
  3. Setelah sukses, frontend panggil API untuk menyimpan metadata (URL, filename) ke MongoDB.

### 6.5 Contoh endpoint presigned S3 (Express)
```js
// controllers/uploadController.js (contoh)
const AWS = require('aws-sdk');
const s3 = new AWS.S3({ region: process.env.AWS_REGION });

exports.getPresigned = async (req, res) => {
  const { name, type } = req.body;
  const key = `menu/${Date.now()}-${name}`;
  const params = { Bucket: process.env.S3_BUCKET, Key: key, ContentType: type };
  const url = s3.getSignedUrl('putObject', params);
  res.json({ url, key });
};
```

## 7. Deployment (Vercel) — Langkah Praktis
### 7.1 Frontend (Next.js)
- Push `frontend/` ke repo.
- Hubungkan repo di Vercel, pilih project frontend.
- Vercel otomatis build Next.js; set `NEXT_PUBLIC_API_URL` di Environment Variables pada Vercel.

### 7.2 Backend di Vercel (opsional)
- Buat `backend/api/index.js` seperti di atas.
- Hubungkan repo ke Vercel, set project untuk backend (atau satu project monorepo dengan root mapping).
- Set Environment Variables pada Vercel (Project Settings > Environment Variables):
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `FRONTEND_URL`
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - AWS/GCP creds jika menggunakan S3/GCS

### 7.3 Verifikasi deployment
- Cek URL Health: `GET https://<BACKEND_URL>/api/health` (contoh: `https://dimsum-backend.vercel.app/api/health`).
- Cek docs: `https://<BACKEND_URL>/api/docs`.
- Periksa logs di Vercel dashboard atau integrasi logging.

## 8. Konfigurasi Keamanan Minimum
- Simpan secrets di Vercel Environment Variables (atau Secret Manager). Jangan commit `.env`.
- Batasi CORS ke `FRONTEND_URL`.
- Gunakan TLS (Vercel otomatis HTTPS).
- DB user dengan hak minimal (no admin root credentials in app).
- Batasi akses bucket S3/GCS menggunakan policy yang hanya izinkan upload lewat presigned URL.
- Implementasikan rate limiting pada API jika diperlukan (middleware seperti `express-rate-limit`).

## 9. Pengujian Request & Load Testing
### 9.1 Skrip lokal (sudah ada)
- `backend/scripts/load-test.js` mensimulasikan Low/Medium/High concurrent requests ke endpoint `/api/health`.

### 9.2 Rekomendasi alat lebih canggih
- `k6` (Go-based), `artillery`, atau `locust` untuk skenario realistik.

Contoh `k6` script (sederhana):
```js
import http from 'k6/http';
import { sleep } from 'k6';
export let options = { vus: 50, duration: '30s' };
export default function () {
  http.get(__ENV.API + '/health');
  sleep(1);
}
```

Jalankan:
```bash
API=https://dimsum-backend.vercel.app k6 run k6-script.js
```

### 9.3 Metode pengukuran performa
- Metrics: latency p50/p95/p99, throughput (RPS), error rate, cold-start time.
- Ambil baseline sebelum optimasi, lalu ulangi setelah tuning (memory/timeout changes).

## 10. Monitoring & Observability
- Level dasar:
  - Logs: Vercel logs; CloudWatch / Cloud Logging untuk fungsi non-Vercel.
  - Tracing: X-Ray (AWS) atau Cloud Trace (GCP) untuk span tracing.
  - Error reporting: Sentry (integrasi dengan Node/Express).
- Set alert: error rate > 1% atau p95 latency > 1s.

## 11. Evaluasi Ketersediaan
- Vercel Functions: multi-region edge untuk frontend; functions ephemeral di region terpilih.
- MongoDB Atlas: aktifkan multi-region deployment/replset untuk high availability.
- Backup dan point-in-time recovery di Atlas.

## 12. Analisis Biaya (Perkiraan)
- Komponen biaya:
  - Vercel (Frontend + Functions): ada free tier; biaya naik sesuai requests dan bandwidth.
  - MongoDB Atlas: M2/M5 ~$9–50/mo; M10 ~$70+/mo.
  - S3 Storage & Requests: murah (<$5–$20 tergantung traffic).
  - Monitoring & Logs: biaya per GB ingested.

Contoh skenario (estimasi sederhana):
- Traffic: 1M requests/month, avg function duration 200ms, memory 512MB
- Vercel functions + bandwidth: $20–80
- MongoDB Atlas M5: $50
- S3: $5
- Monitoring: $10–30
- Total: ~$85–165/month (perkiraan kasar)

## 13. Perbandingan Alternatif Konfigurasi
- Deploy backend sebagai Vercel Function
  - + Integrasi mudah dengan frontend, cepat deploy
  - - Batas payload/timeout untuk file upload besar
- Deploy backend ke Cloud Run / ECS + use signed URLs
  - + Lebih fleksibel untuk upload besar dan runtime
  - - Butuh setup lebih kompleks
- AWS Lambda + API Gateway + S3
  - + Hemat untuk fungsi singkat; integrasi S3 sangat baik
  - - Cold-start (tergantung runtime), pengelolaan IAM lebih kompleks

## 14. Analisis Trade-off antara Biaya dan Performa
- Fungsi memory lebih besar → latency turun (lebih CPU), biaya naik.
- Cloud Run (container) membayar per vCPU-s / memory-s; cocok untuk steady traffic.
- Serverless functions biaya rendah untuk spiky traffic, tapi batas runtime/size dapat membatasi use case.

## 15. Kesimpulan
- Serverless (Vercel + Functions) direkomendasikan untuk front-end dan API ringan.
- Untuk API berat (upload besar, long-running processes), gunakan Cloud Run atau Lambda + S3.
- Terapkan presigned uploads dan monitoring sejak awal.

## 16. Rekomendasi Pengembangan Lanjutan
- Implementasikan presigned uploads ke S3/GCS.
- Tambahkan observability (Sentry, Datadog) dan tracing end-to-end.
- Otomatiskan load testing dengan `k6`/`artillery` dalam CI pipeline.
- Uji biaya operasional periodik dan sesuaikan resource.

---

## Appendix — Contoh File & Perintah
- Handler Vercel: `backend/api/index.js` (lihat diatas)
- Contoh presigned S3 controller: tambahkan AWS creds sebagai env vars dan module `aws-sdk`.

Perintah cepat menjalankan lokal:
```powershell
cd backend
npm install
npm run dev
# di terminal lain
node scripts/load-test.js
```

Jika Anda ingin saya menambahkan file contoh (`backend/api/index.js`, `controllers/uploadController.js`) atau membuat skrip `k6/artillery` dan men-commit-nya, beri tahu saya opsi yang diinginkan dan saya akan menambahkannya ke repo.
