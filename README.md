# TanamAI_Backend

**TanamAI_Backend** is a backend built with **Node.js** and the **Hapi** framework, providing a REST API for plant pest detection using a **TensorFlow** model.  
You can send plant images and receive predictions of detected pests.

---

## 🚀 Key Features

- **REST API** built with Hapi, easy to integrate with frontend or other applications.  
- **Pest detection model** powered by TensorFlow, accepts image input and returns detected pests.  
- Secure and efficient image upload handling.  
- JSON-formatted prediction output, ready to be used in UI or analytics.  

---

## 📋 Requirements

Make sure you have installed:

- [Node.js](https://nodejs.org/) (v16+ recommended)  
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)  
- A trained TensorFlow model (e.g., `.pb`, `.h5`, or other formats used in this repo)  
- Access to the model directory and any other required dependencies  

---

## ⚙️ Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/RayyanHermanto/TanamAI_Backend.git
   cd TanamAI_Backend
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Place your TensorFlow model in the proper folder (e.g., `models/`) and ensure the file is available before starting the application.  

---

## 🔧 Configuration

Add a configuration file (e.g., `config.js` or `.env`) for settings such as:

```bash
PORT=3000
MODEL_PATH=./models/detector_model.h5
MAX_UPLOAD_SIZE=5mb
```

---

## ▶️ Running the Application

After installation and configuration:

```bash
npm start
# or for development with nodemon
npm run dev
```

The Hapi server will run at `http://localhost:<PORT>` (default `3000`).  

---

## 📡 API Endpoints

| Endpoint        | Method | Description                                |
|-----------------|--------|--------------------------------------------|
| `/health`       | GET    | Check server status (should return "OK")   |
| `/detect`       | POST   | Upload an image and get pest detection result |
| `/models/info`  | GET    | Retrieve model information (optional)      |

### Example Request to `/detect`

```bash
curl -X POST http://localhost:3000/detect \
  -F "image=@/path/to/plant_image.jpg"
```

### Example Response

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



## 📄 License

© 2025 Rayyan Hermanto  
Licensed under the MIT License.
