# Video Processing API

## 📌 Overview
This is a RESTful API for video processing that supports the following features:
- **Upload** a video file.
- **Trim** a video by specifying a start time and duration.
- **Merge** multiple videos into one.
- **Share** a video via a unique link.

## 🚀 Features
- Built with **Node.js** and **Express.js**.
- Uses **Multer** for file uploads.
- **SQLite** database for storing video metadata.
- **FFmpeg** for video processing (trimming & merging).
- Swagger UI for API documentation.

---

## 📂 Installation & Setup

### **🔧 Prerequisites**
Ensure you have the following installed:
- [Node.js](https://nodejs.org/)
- [FFmpeg](https://ffmpeg.org/download.html)

### **🛠 Setup Instructions**
```bash
# Clone the repository
git clone https://github.com/Jai-karthi/REST-APIs-for-Video-Files.git
cd REST-APIs-for-Video-Files

# Install dependencies
npm install

# Start the server
npm start
```

---

## 📜 API Documentation

### **Base URL:**
```
http://localhost:7000
```

### **1️⃣ Upload Video**
```http
POST /upload
```
- **Description:** Uploads a video file.
- **Headers:** `Content-Type: multipart/form-data`
- **Body:**
  ```json
  {
    "video": "<file>"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Video uploaded successfully",
    "filename": "example.mp4"
  }
  ```

---

### **2️⃣ Trim Video**
```http
POST /trim
```
- **Description:** Trims a video by start time and duration.
- **Body:**
  ```json
  {
    "filename": "example.mp4",
    "start": 10,
    "duration": 30
  }
  ```
- **Response:**
  ```json
  {
    "message": "Video trimmed successfully",
    "filename": "trimmed-example.mp4"
  }
  ```

---

### **3️⃣ Merge Videos**
```http
POST /merge
```
- **Description:** Merges multiple videos.
- **Body:**
  ```json
  {
    "filenames": ["video1.mp4", "video2.mp4"]
  }
  ```
- **Response:**
  ```json
  {
    "message": "Videos merged successfully",
    "filename": "merged.mp4"
  }
  ```

---

### **4️⃣ Share Video**
```http
POST /share
```
- **Description:** Generates a unique link to access a video.
- **Body:**
  ```json
  {
    "filename": "example.mp4"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Share link created",
    "url": "http://localhost:7000/access/<token>"
  }
  ```

---

### **5️⃣ Access Shared Video**
```http
GET /access/:token
```
- **Description:** Retrieves a shared video by its token.

---

## 🧪 Running Tests
To run the test suite:
```bash
npm test
```

---

## 🎥 Demo Video
[📺 Click here to watch the demo](<video-link>)

---

## 📝 Assumptions & Choices
- Used **SQLite** for simplicity.
- Used **Multer** for file uploads.
- Implemented **JWT Authentication** for security.
- Swagger UI is integrated for documentation.

---

## 📜 References
- [Express.js Documentation](https://expressjs.com/)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)

---

## 📌 License
This project is licensed under the MIT License.

---

## 👨‍💻 Author
- **Jai Prashanth**  
  [GitHub](https://github.com/Jai-karthi) | [LinkedIn](https://linkedin.com/in/j-p1)
