const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const path = require('path');
const authRoutes = require('./routes/auth');
const imageRoutes = require('./routes/image');

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: '0.0.0.0', // BUKAN 'localhost'
    routes: {
      cors: true
    }
  });

  // Register Inert untuk melayani file statis
  await server.register(Inert);

  // Rute untuk akses file gambar di folder uploads
  server.route({
    method: 'GET',
    path: '/uploads/{filename}',
    handler: {
      file: (request) => {
        const filename = request.params.filename;
        return path.join(__dirname, 'uploads', filename);
      }
    }
  });

  // Gabungkan semua rute
  server.route([...authRoutes, ...imageRoutes]);

  await server.start();
  console.log('✅ Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

init();
