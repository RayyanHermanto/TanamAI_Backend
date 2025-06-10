const tf = require('@tensorflow/tfjs');
const tfnode = require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('../models/predictionModel');
const diseaseInfo = require('../data/diseaseinfo.json');

const classNamesMap = {
  padi: ['Hawar Pelepah', 'Hispa', 'Busuk Leher Malai', 'Bercak Cokelat Sempit Daun', 'Luka Bakar Daun', 'Bercak Cokelat', 'Sehat', 'Blas Daun', 'Hawar Daun Bakteri'],
  hama: ['Belalang', 'Cacing Tanah', 'Capit', 'Kumbang', 'Kumbang Penggerek', 'Lebah', 'Lintah Bulan', 'Ngengat', 'Semut', 'Siput', 'Tawon', 'Ulat'],
  jagung: ['Bercak Daun', 'Daun Sehat', 'Hawar Daun', 'Karat Daun'],
  kentang: ['Blas Awal', 'Hawar Daun', 'Sehat'],
};

function findDiseaseDetail(label, kategori) {
  const entry = diseaseInfo.klasifikasi.find(k => k.kategori.toLowerCase() === kategori.toLowerCase());
  if (!entry) return null;

  return entry.data.find(d => d.nama.toLowerCase().includes(label.toLowerCase()));
}

function detectCategory(label) {
  const match = diseaseInfo.klasifikasi.find(k =>
    k.data.some(d => d.nama.toLowerCase().includes(label.toLowerCase()))
  );
  return match?.kategori || 'lainnya';
}

// Handle custom regularizer jika model punya L2 dari Python
class L2 {
  static className = 'L2';
  constructor(config) {
    return tf.regularizers.l1l2(config);
  }
}
tf.serialization.registerClass(L2);

// Cache semua model
const modelCache = {};

// Load semua model sekali di awal saat server dinyalakan
(async () => {
  for (const modelType of Object.keys(classNamesMap)) {
    const modelPath = `file://${path.resolve(__dirname, `../models/${modelType}/model.json`)}`;
    try {
      modelCache[modelType] = await tf.loadLayersModel(modelPath);
      console.log(`✅ Model "${modelType}" berhasil dimuat`);
    } catch (err) {
      console.error(`❌ Gagal memuat model "${modelType}":`, err.message);
    }
  }
})();

exports.predictImageHandler = async (request, h) => {
  const token = request.headers.authorization?.split(' ')[1];
  const file = request.payload.photo;
  const modelType = request.payload.plantType || 'rice';

  if (!token) {
    return h.response({ error: true, message: 'Token tidak tersedia' }).code(401);
  }

  if (!file || typeof file._data === 'undefined') {
    return h.response({ error: true, message: 'Gambar tidak ditemukan' }).code(400);
  }

  const model = modelCache[modelType];
  if (!model) {
    return h.response({ error: true, message: `Model "${modelType}" tidak tersedia` }).code(400);
  }

  const filename = `${uuidv4()}.jpg`;
  const uploadDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const filePath = path.join(__dirname, '../uploads', filename);

  try {
    const buffer = await streamToBuffer(file);
    fs.writeFileSync(filePath, buffer);

    const tensor = tfnode.node.decodeImage(buffer)
      .resizeNearestNeighbor([224, 224])
      .expandDims(0)
      .toFloat()
      .div(255);

    const preds = await model.predict(tensor).data();
    const classNames = classNamesMap[modelType];
    const combined = classNames.map((label, i) => ({ label, probability: preds[i] }));
    const top3 = combined.sort((a, b) => b.probability - a.probability).slice(0, 3);

    // Hapus data lama jika melebihi 20 prediksi
    await new Promise((resolve, reject) => {
      db.all(
        "SELECT id FROM predictions WHERE token = ? ORDER BY created_at ASC",
        [token],
        (err, rows) => {
          if (err) return reject(err);

          if (rows.length >= 20) {
            const toDelete = rows.slice(0, rows.length - 19);
            const idsToDelete = toDelete.map(r => r.id);
            if (idsToDelete.length > 0) {
              const placeholders = idsToDelete.map(() => '?').join(',');
              db.run(
                `DELETE FROM predictions WHERE id IN (${placeholders})`,
                idsToDelete,
                function (err) {
                  if (err) return reject(err);
                  console.log(`🗑️ ${this.changes} prediksi lama dihapus`);
                  resolve();
                }
              );
            } else {
              resolve();
            }
          } else {
            resolve();
          }
        }
      );
    });

    // Simpan data baru
    db.run(
      "INSERT INTO predictions (token, image_filename, top3) VALUES (?, ?, ?)",
      [token, filename, JSON.stringify(top3)],
      function (err) {
        if (err) {
          console.error('❌ Gagal menyimpan prediksi:', err.message);
        } else {
          console.log('✅ Prediksi disimpan dengan ID:', this.lastID);
        }
      }
    );

    return h.response({
      message: 'Prediksi berhasil',
      topPredictions: top3
    }).code(200);

  } catch (err) {
    console.error(err);
    return h.response({ error: true, message: 'Gagal memproses gambar' }).code(500);
  } finally {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

exports.getPredictionsByTokenHandler = (request, h) => {
  const token = request.headers.authorization?.split(' ')[1];

  if (!token) {
    return h.response({ error: true, message: 'Token tidak tersedia' }).code(401);
  }

  return new Promise((resolve) => {
    db.all(
      "SELECT id, token, image_filename, top3, created_at FROM predictions WHERE token = ? ORDER BY created_at DESC",
      [token],
      (err, rows) => {
        if (err) {
          console.error('❌ Gagal mengambil data prediksi:', err.message);
          return resolve(h.response({ error: true, message: 'Gagal mengambil data prediksi' }).code(500));
        }

        const enrichedRows = rows.map(row => {
          const top3 = JSON.parse(row.top3);
        
          const withDetail = top3.map(item => {
            const detail = findDiseaseDetail(item.label, detectCategory(item.label));
            return {
              ...item,
              gejala: detail?.gejala || '-',
              solusi: detail?.solusi || {},
              produk: detail?.produk || []
            };
          });
        
          const host = request.headers['x-forwarded-host'] || request.info.host;
          const protocol = request.info.protocol;
          const imageUrl = `${protocol}://${host}/uploads/${row.image_filename}`;
        
          return {
            ...row,
            top3: withDetail,
            image_url: imageUrl
          };
        });
        

        return resolve(h.response({
          message: 'Berhasil mengambil data prediksi berdasarkan token',
          data: enrichedRows
        }).code(200));
      }
    );
  });
};

function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}
