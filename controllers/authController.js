// controllers/authController.js untuk Hapi.js
const db = require('../models/userModel');
const bcrypt = require('bcrypt');

exports.loginHandler = async (request, h) => {
  const { email, password } = request.payload;

  if (!email || !password) {
    return h.response({ error: true, message: 'Email dan password wajib diisi' }).code(400);
  }

  return new Promise((resolve) => {
    db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
      if (err) {
        return resolve(h.response({ error: true, message: 'Kesalahan server' }).code(500));
      }
      if (!user) {
        return resolve(h.response({ error: true, message: 'Email tidak ditemukan' }).code(401));
      }

      const isValid = bcrypt.compareSync(password, user.password);
      if (!isValid) {
        return resolve(h.response({ error: true, message: 'Password salah' }).code(401));
      }

      return resolve(h.response({
        message: 'Login berhasil',
        loginResult: {
          name: user.name,
          token: user.password,
          email: user.email,
          password: user.password
        }
      }).code(200));
    });
  });
};

exports.registerHandler = async (request, h) => {
  const { name, email, password } = request.payload;

  if (!name || !email || !password) {
    return h.response({ error: true, message: 'Nama, email, dan password wajib diisi' }).code(400);
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  return new Promise((resolve) => {
    db.run(
      "INSERT INTO users (name, email, password, plain_password) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, password],
      function (err) {
        if (err) {
          if (err.message.includes("UNIQUE")) {
            return resolve(h.response({ error: true, message: 'Email sudah terdaftar' }).code(400));
          }
          return resolve(h.response({ error: true, message: 'Gagal mendaftarkan user' }).code(500));
        }
        return resolve(h.response({ message: 'Registrasi berhasil', userId: this.lastID }).code(201));
      }
    );
  });
};