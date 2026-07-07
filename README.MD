# Sistem Informasi Pengelolaan Kasir dan Gudang pada Grosir Pojok (Backend API)

Repositori ini berisi kode backend untuk **Sistem Informasi Pengelolaan Kasir dan Gudang pada Grosir Pojok**, sebuah aplikasi kasir (*Point of Sale*) dan manajemen stok (*Inventory*) berbasis web yang dirancang untuk mendigitalisasi serta menghubungkan alur kerja kasir dan pegawai gudang secara terintegrasi.

---

## 1. Latar Belakang & Harapan Sistem

### A. Masalah yang Diidentifikasi 
Berdasarkan hasil observasi pada operasional konvensional di Grosir Pojok, ditemukan beberapa kendala utama:
1. **Pencatatan Manual**: Pencatatan transaksi pesanan pelanggan oleh kasir masih dilakukan menggunakan media seadanya (kertas/bekas bungkus rokok), sehingga rentan hilang, rusak, atau sulit dibaca.
2. **Disintegrasi Informasi**: Alur data pesanan dari meja kasir ke bagian gudang tidak terhubung langsung. Hal ini sering memicu ketidaksesuaian (*mismatch*) antara barang yang dipesan dengan barang yang disiapkan oleh pegawai gudang.
3. **Pembaruan Stok Lambat**: Pembaruan data stok keluar masuk masih menggunakan perhitungan fisik secara manual dan rekapitulasi berkala di kertas. Metode ini tidak efisien, menyita waktu produktif, dan berisiko tinggi terhadap kesalahan pencatatan.
4. **Ketiadaan Database Terpusat**: Belum adanya sistem basis data terpusat untuk memantau ketersediaan barang secara *real-time*.

### B. Harapan dan Tujuan Pengembangan
Aplikasi ini dirancang dengan tujuan:
* **Digitalisasi POS (Point of Sale)**: Mempermudah kasir mencatat transaksi penjualan secara digital dan sistematis, yang langsung terhubung ke sistem gudang.
* **Otomatisasi Potong Stok (Inventory Loop)**: Mengotomatisasi pengurangan jumlah stok di gudang secara *real-time* begitu transaksi kasir dinyatakan selesai.
* **Meningkatkan Efisiensi & Akurasi**: Meminimalkan selisih barang pesanan dan mempercepat proses penyiapan barang di gudang dengan visualisasi daftar pesanan yang masuk secara instan.

### C. Batasan Masalah
* Sistem berfokus pada transaksi kasir, pengelolaan stok barang, dan autentikasi peran.
* Tidak mencakup pengelolaan keuangan kompleks, akuntansi, logistik pengiriman, maupun integrasi gerbang pembayaran eksternal (*payment gateway*).
* Sistem memiliki dua peran pengguna utama (*roles*): **Kasir** dan **Pegawai Gudang**.
* Dibangun menggunakan **Express.js** (Backend), **React** (Frontend), dan **PostgreSQL** cloud (Supabase) sebagai basis data terpusat.

---

## 2. Arsitektur Kode (Code Architecture)

Aplikasi ini menggunakan pola **Layered Architecture (3-Tier Architecture)** untuk memisahkan tanggung jawab kode secara terstruktur, bersih, dan mudah dipelihara.

```mermaid
graph TD
    Client[Client / Frontend] <-->|HTTP Request / Response| Controller[Controller Layer]
    Controller <-->|Data Transfer Object / Call| Service[Service Layer]
    Service <-->|Repository Methods| Repository[Repository Layer]
    Repository <-->|SQL Queries / pg Pool| Database[(PostgreSQL Database)]
```

### Penjelasan Setiap Layer:
1. **Controller Layer (`src/controllers/`)**
   * Berfungsi sebagai pintu masuk request HTTP.
   * Menangani parsing data request (params, query, body), melakukan validasi input awal, dan memanggil fungsi pada *Service Layer*.
   * Mengembalikan response HTTP (status code, JSON data) kepada klien.
   * *Contoh*: [barangController.js](file:///d:/grosir-pojok-be/src/controllers/barangController.js)

2. **Service Layer (`src/services/`)**
   * Tempat disimpannya seluruh **Logika Bisnis (Business Logic)** aplikasi.
   * Mengatur alur pemrosesan data, validasi logika bisnis (seperti pengecekan ketersediaan stok sebelum transaksi disimpan), dan orkestrasi beberapa repositori jika diperlukan.
   * Terisolasi sepenuhnya dari protokol HTTP/Express.
   * *Contoh*: [penjualanService.js](file:///d:/grosir-pojok-be/src/services/penjualanService.js)

3. **Repository Layer (`src/repositories/`)**
   * Mengurus interaksi langsung dengan database PostgreSQL.
   * Menyusun dan menjalankan query SQL (SELECT, INSERT, UPDATE, DELETE) melalui database pool (`pg`).
   * Tidak memiliki pemahaman tentang logika bisnis; hanya bertugas mengambil dan menyimpan data dari database.
   * *Contoh*: [stokRepository.js](file:///d:/grosir-pojok-be/src/repositories/stokRepository.js)

---

## 3. Struktur Direktori Project

```text
grosir-pojok-be/
├── docs/
│   └── api.yaml             # Spesifikasi API menggunakan OpenAPI / Swagger
├── sql/                     # File skrip SQL untuk migrasi skema & seed database
│   ├── 0_drop_table.sql
│   ├── 1_pegawai.sql
│   ├── ...
│   └── 9_seed.sql
├── scripts/
│   └── migrate.js           # Skrip utilitas untuk menjalankan migrasi database SQL
├── src/
│   ├── config/              # Konfigurasi aplikasi dan koneksi database pool
│   ├── controllers/         # Handler request HTTP (Controller Layer)
│   ├── exceptions/          # Definisi custom exception / class handling error
│   ├── middlewares/         # Express middleware (Auth JWT, error handler, dll.)
│   ├── repositories/        # Komponen akses database PostgreSQL (Repository Layer)
│   ├── routes/              # Routing endpoint API Express.js
│   ├── services/            # Logika bisnis utama aplikasi (Service Layer)
│   ├── utils/               # Fungsi pembantu (helper)
│   ├── app.js               # Inisialisasi Express & konfigurasi middleware global
│   └── index.js             # Entrypoint server backend
├── .env.example             # Contoh file environment variables
├── package.json             # Dependensi project Node.js & definisi script perintah
└── README.MD                # Dokumentasi utama project
```

---

## 4. Persyaratan & Kelengkapan Requirement

Sebelum menjalankan proyek, pastikan perangkat Anda telah memenuhi prasyarat berikut:

### A. Node.js
* **Versi Minimum**: Node.js **v18.x** ke atas (direkomendasikan versi LTS terbaru seperti **v20.x** atau **v22.x**).
* Penggunaan fitur modern JavaScript seperti ES Modules (`import`/`export`) yang diatur di `package.json` membutuhkan runtime Node.js modern.

### B. Database PostgreSQL (Supabase)
* Proyek ini dirancang untuk terhubung dengan database cloud **PostgreSQL** yang disediakan oleh **Supabase**.
* Anda memerlukan **Connection String (Database URL)** dari Supabase. Format koneksi yang dibutuhkan:
  ```text
  postgresql://postgres:[PASSWORD_DATABASE]@db.[PROJECT_ID].supabase.co:5432/postgres
  ```

---

## 5. Langkah Memulai Proyek (Getting Started)

Ikuti langkah-langkah berikut untuk mengatur proyek di lingkungan lokal Anda:

### Langkah 1: Kloning & Masuk ke Proyek
Buka terminal Anda, masuk ke dalam direktori proyek:
```bash
cd grosir-pojok-be
```

### Langkah 2: Instalasi Dependensi
Jalankan perintah npm untuk menginstal semua pustaka pendukung yang terdaftar pada `package.json`:
```bash
npm install
```

### Langkah 3: Konfigurasi Environment Variables (`.env`)
Buat file bernama `.env` pada root direktori proyek, lalu isi variabel-variabel berikut dengan menyesuaikan data credential database Supabase Anda:

```env
PORT=3000
SALT=10
JWT_SECRET=rahasia_super_kuat_grosir_pojok
JWT_EXPIRED_IN=1d
DATABASE_URL=postgresql://postgres:[PASSWORD_DATABASE]@db.[PROJECT_ID].supabase.co:5432/postgres
```

> [!IMPORTANT]
> Pastikan bagian `[PASSWORD_DATABASE]` dan `[PROJECT_ID]` diisi dengan benar sesuai konfigurasi database di dashboard Supabase Anda.

### Langkah 4: Migrasi Database
Jalankan skrip migrasi untuk membuat tabel, indeks, trigger, dan view serta menginisialisasi data awal (seeding) ke dalam database Supabase Anda:
```bash
npm run migrate
```
Skrip ini akan mengeksekusi seluruh berkas SQL yang berada di dalam folder `sql/` secara berurutan.

### Langkah 5: Jalankan Server Lokal (Development)
Untuk menjalankan server backend dalam mode pengembangan:
```bash
npm run dev
```
Server akan berjalan secara lokal di port yang telah didefinisikan (misalnya: `http://localhost:3000`).
