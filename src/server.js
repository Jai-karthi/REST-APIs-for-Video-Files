const { initializeDB } = require('./db.js');
const express = require('express');
const multer = require('multer');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');
const ffmpeg = require('fluent-ffmpeg');
const sqlite = require('sqlite'); 
const { open } = require('sqlite');
const crypto = require('crypto');
const swaggerDocs = require("./swagger");
require('dotenv').config();
ffmpeg.setFfmpegPath('C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe'); 
const router = express.Router();
const app = express();
app.use(express.json());
app.use(express.static('public'));
swaggerDocs(app);
const PORT = process.env.PORT || 7000;

const API_TOKEN = process.env.API_TOKEN || 'static-token';
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

console.log(API_TOKEN);

// if (process.env.NODE_ENV !== "test") {
//     app.listen(5000, async () => {
//         await initializeDB();
//         console.log(`Server running on port ${PORT}`);
//     });
// }


// Authentication Middleware
const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token || token !== `Bearer ${API_TOKEN}`) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    next();
};

async function openDB() {
    try {
        return sqlite.open({
            filename: 'database.sqlite',
            driver: sqlite3.Database,
        });
    } catch (error) {
        console.error('Error opening database:', error);
        process.exit(1);
    }
}
const dbPromise = openDB();

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) => {
        cb(null, `${crypto.randomUUID()}-${file.originalname}`);
    }
});
const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } });

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload a video
 *     description: Upload a video file to the server
 *     security:
 *       - BearerAuth: []  # Require authentication
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Video uploaded successfully
 *       400:
 *         description: No file uploaded
 *       401:
 *         description: Unauthorized
 */
app.post('/upload', authMiddleware, upload.single('video'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const db = await dbPromise;
    await db.run('INSERT INTO videos (filename, path) VALUES (?, ?)', [req.file.filename, req.file.path]);

    res.json({ message: 'Video uploaded successfully', filename: req.file.filename });
});

/**
 * @swagger
 * /trim:
 *   post:
 *     summary: Trim a video
 *     description: Trim a video file by specifying start time and duration.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filename:
 *                 type: string
 *                 description: Name of the video file to trim.
 *               start:
 *                 type: number
 *                 description: Start time in seconds.
 *               duration:
 *                 type: number
 *                 description: Duration of the trimmed video in seconds.
 *     responses:
 *       200:
 *         description: Video trimmed successfully
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Video not found
 *       500:
 *         description: Error trimming video
 */
app.post('/trim', async (req, res) => {
    const { filename, start, duration } = req.body;
    if (!filename || start === undefined || duration === undefined) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    const inputPath = path.join(UPLOAD_DIR, filename);
    const outputFilename = `trimmed-${crypto.randomUUID()}-${filename}`;
    const outputPath = path.join(UPLOAD_DIR, outputFilename);
    
    try {
        await fs.promises.access(inputPath);
    } catch {
        return res.status(404).json({ message: 'Video not found' });
    }
    
    ffmpeg(inputPath)
        .setStartTime(start)
        .setDuration(duration)
        .output(outputPath)
        .on('end', async () => {
            const db = await dbPromise;
            await db.run('INSERT INTO videos (filename, path) VALUES (?, ?)', [outputFilename, outputPath]);
            res.json({ message: 'Video trimmed successfully', filename: outputFilename });
        })
        .on('error', (err) => {
            console.error('Error trimming video:', err);
            res.status(500).json({ message: 'Error trimming video', error: err.message });
        })
        .run();
});

/**
 * @swagger
 * /merge:
 *   post:
 *     summary: Merge multiple videos
 *     description: Merge two or more video files into one.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filenames:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of video filenames to merge.
 *     responses:
 *       200:
 *         description: Videos merged successfully
 *       400:
 *         description: At least two video files are required for merging
 *       404:
 *         description: One or more video files not found
 *       500:
 *         description: Error merging videos
 */
app.post('/merge', async (req, res) => {
    const { filenames } = req.body;
    if (!filenames || !Array.isArray(filenames) || filenames.length < 2) {
        return res.status(400).json({ message: 'At least two video files are required for merging' });
    }
    
    const filePaths = filenames.map(file => path.join(UPLOAD_DIR, file));
    for (const filePath of filePaths) {
        try {
            await fs.promises.access(filePath);
        } catch {
            return res.status(404).json({ message: `File not found: ${filePath}` });
        }
    }

    const outputFilename = `merged-${crypto.randomUUID()}.mp4`;
    const outputPath = path.join(UPLOAD_DIR, outputFilename);
    const listFilePath = path.join(UPLOAD_DIR, `merge-list-${crypto.randomUUID()}.txt`);
    fs.writeFileSync(listFilePath, filePaths.map(file => `file '${file}'`).join('\n'));

    ffmpeg()
        .input(listFilePath)
        .inputOptions(['-f concat', '-safe 0'])
        .output(outputPath)
        .on('end', async () => {
            const db = await dbPromise;
            await db.run('INSERT INTO videos (filename, path) VALUES (?, ?)', [outputFilename, outputPath]);
            fs.unlinkSync(listFilePath);
            res.json({ message: 'Videos merged successfully', filename: outputFilename });
        })
        .on('error', (err) => {
            console.error('Error merging videos:', err);
            res.status(500).json({ message: 'Error merging videos', error: err.message });
        })
        .run();
});

/**
 * @swagger
 * /share:
 *   post:
 *     summary: Generate a shareable link for a video
 *     description: Create a tokenized link to share a video.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filename:
 *                 type: string
 *                 description: Name of the video file to share.
 *     responses:
 *       200:
 *         description: Share link created
 *       400:
 *         description: Filename is required
 */
app.post('/share', async (req, res) => {

    const { filename } = req.body;
    console.log(filename)
    if (!filename) return res.status(400).json({ message: 'Filename is required' });
    const token = crypto.randomUUID();
    const db = await dbPromise;
    await db.run('INSERT INTO shares (token, filename) VALUES (?, ?)', [token, filename]);
    res.json({ message: 'Share link created', url: `http://localhost:${PORT}/access/${token}` });
});


app.get('/access/:token', async (req, res) => {
    const { token } = req.params;
    const db = await dbPromise;
    const result = await db.get('SELECT filename FROM shares WHERE token = ?', [token]);
    if (!result) return res.status(404).json({ message: 'Invalid or expired link' });
    res.sendFile(path.join(UPLOAD_DIR, result.filename));
});


app.listen(PORT, async () => {
    await initializeDB();
    console.log(`Server running on port ${PORT}`);
});
module.exports = router;
module.exports = app;