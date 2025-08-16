# TanamAI_Backend

**TanamAI_Backend** adalah backend berbasis **Node.js** dengan framework **Hapi**, yang menyediakan REST API untuk deteksi hama tanaman menggunakan model **TensorFlow**. Kamu dapat mengirimkan gambar tanaman lalu mendapatkan prediksi jenis hama yang terdeteksi.

---

## 🚀 Fitur Utama

- **REST API** dengan Hapi untuk memudahkan integrasi frontend atau aplikasi lainnya.
- **Model deteksi hama** berbasis TensorFlow, menerima input gambar dan memberikan output jenis hama yang terdeteksi.
- Penanganan upload gambar secara aman dan efisien.
- Output prediksi dalam format JSON yang siap digunakan di UI atau analytics.

---

## 📋 Persyaratan

Pastikan telah terinstal:

- [Node.js](https://nodejs.org/) (v16+ direkomendasikan)  
- [npm](https://www.npmjs.com/) atau [Yarn](https://yarnpkg.com/)  
- Model TensorFlow terlatih (file `.pb`, `.h5`, atau format lainnya yang digunakan dalam repo kamu)  
- Akses ke direktori model dan dependencies lainnya sesuai konfigurasi repo kamu

---

## ⚙️ Instalasi

1. Kloning repositori:

   ```bash
   git clone https://github.com/RayyanHermanto/TanamAI_Backend.git
   cd TanamAI_Backend
   ```

2. Instal dependency:

   ```bash
   npm install
   # atau
   yarn install
   ```

3. Siapkan model TensorFlow di dalam folder yang sesuai (contohnya: `models/`) dan pastikan file model tersedia sebelum aplikasi dijalankan.

---

## 🔧 Konfigurasi

Tambahkan file konfigurasi (misalnya `config.js` atau `.env`) untuk pengaturan seperti:

```bash
PORT=3000
MODEL_PATH=./models/detector_model.h5
MAX_UPLOAD_SIZE=5mb
```

---

## ▶️ Menjalankan Aplikasi

Setelah instalasi dan konfigurasi selesai:

```bash
npm start
# atau untuk pengembangan dengan nodemon
npm run dev
```

Aplikasi Hapi akan berjalan di alamat `http://localhost:<PORT>` (default `3000`).

---

## 📡 Endpoints API

| Endpoint           | Method | Deskripsi                                   |
|-------------------|--------|----------------------------------------------|
| `/health`         | GET    | Mengecek status server (should return "OK") |
| `/detect`         | POST   | Upload gambar dan dapatkan hasil deteksi hama |
| `/models/info`    | GET    | Mendapatkan info model (opsional)            |

### Contoh Request ke `/detect`

```bash
curl -X POST http://localhost:3000/detect \
  -F "image=@/path/to/plant_image.jpg"
```

### Contoh Response

```json
{
  "success": true,
  "predictions": [
    {
      "pest": "Aphid",
      "confidence": 0.92
    }
  ]
}
```

---

## 🤝 Kontribusi

Kontribusi sangat disambut! Caranya:

1. Fork repository ini  
2. Buat branch baru (`git checkout -b feature/your-feature`)  
3. Lakukan perubahan dan commit (`git commit -m "Add feature"`)  
4. Push ke branch (`git push origin feature/your-feature`)  
5. Buka Pull Request dan jelaskan perubahanmu

---

## 📄 Lisensi

© 2025 Rayyan Hermanto  
Licensed under the MIT License.
