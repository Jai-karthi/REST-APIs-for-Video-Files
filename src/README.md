
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


# FFmpeg Installation Guide

FFmpeg is a powerful multimedia framework that allows you to record, convert, and stream audio and video files.

## 📥 Installation

### 🔹 Windows
1. **Download FFmpeg**  
   - Visit [FFmpeg Official Site](https://ffmpeg.org/download.html).  
   - Under "Get packages & executable files," select **Windows builds** (e.g., [BTBn](https://github.com/BtbN/FFmpeg-Builds/releases)).  
   - Download the latest **full build** (`ffmpeg-master-latest-win64-gpl-shared.zip
` file).  

2. **Extract and Set Up**  
   - Extract the `.zip` file to `C:\ffmpeg`.  
   - Inside `C:\ffmpeg`, find the `bin` folder (e.g., `C:\ffmpeg\bin`).  

3. **Add to System Path**  
   - Open **System Properties** → **Environment Variables**.  
   - Under **System Variables**, find `Path` → **Edit** → **New** → Add `C:\ffmpeg\bin`.  
   - Click **OK** to save changes. 
---
### **🛠 Setup Instructions**
```bash
# Clone the repository
git clone https://github.com/Jai-karthi/REST-APIs-for-Video-Files.git
cd REST-APIs-for-Video-Files

# Install dependencies
npm install

# Start the server
node src/server.js
```

---

## 📜 API Documentation

### **Swagger URL:**
```
http://localhost:7000//api-docs
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

## 🧪 Running Tests
To run the test suite:
```bash
npm test
```

---

## 🎥 Demo Video
[📺 Click here to watch the demo](https://drive.google.com/file/d/1O0THT2ujNyPHc2faMdxvv5qnGUm23QMG/view?usp=drive_link)

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
  [GitHub](https://github.com/Jai-karthi) 
>>>>>>> e631360 (structure format)
