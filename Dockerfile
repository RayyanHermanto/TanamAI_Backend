FROM node:18

WORKDIR /app

# Salin semua file project
COPY . .

# Install dependensi
RUN npm install

# Cek apakah file binding .so perlu dipindahkan (jika dibutuhkan)
# Biasanya tidak perlu, tapi disiapkan:
RUN if [ -f node_modules/@tensorflow/tfjs-node/deps/lib/libtensorflow.so ]; then \
  cp node_modules/@tensorflow/tfjs-node/deps/lib/libtensorflow.so node_modules/@tensorflow/tfjs-node/lib/napi-v8/; \
fi

# Expose port (tidak wajib, Railway otomatis ambil dari ENV)
ENV PORT=3000

CMD ["node", "server.js"]
