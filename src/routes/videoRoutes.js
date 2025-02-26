const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const ffmpeg = require('fluent-ffmpeg');
const { dbPromise } = require('../config/db');
const  authMiddleware = require('../middleware/authMiddleware')
const router = express.Router();

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) => {
        cb(null, `${crypto.randomUUID()}-${file.originalname}`);
    }
});
ffmpeg.setFfmpegPath('C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe');

const upload = multer({
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
    storage: storage
  });
  
// Upload Video
/**
 * @swagger
 * /video/upload:
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
router.post('/upload', authMiddleware, upload.single('video'), async (req, res) => {
    if (!req.file) {
        console.log("Upload failed: No file received");
        return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log("Uploaded file details:", req.file); // Debugging log

    const db = await dbPromise;
    try {
        await db.run('INSERT INTO videos (filename, path) VALUES (?, ?)', [req.file.filename, req.file.filename]);
        res.json({ message: 'Video uploaded successfully', filename: req.file.filename });
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// Trim Video
/**
 * @swagger
 * /video/trim:
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
router.post('/trim', async (req, res) => {
    const { filename, start, duration } = req.body;

    console.log("Received trim request:", req.body);  // Debugging log

    if (!filename || start === undefined || duration === undefined) {
        console.log("Missing required fields");
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const inputPath = path.join(UPLOAD_DIR, filename);
    console.log("Input file path:", inputPath);  // Debugging log

    try {
        await fs.promises.access(inputPath);
    } catch {
        console.log("File not found:", inputPath);
        return res.status(404).json({ message: 'Video not found' });
    }

    const outputFilename = `trimmed-${crypto.randomUUID()}-${filename}`;
    const outputPath = path.join(UPLOAD_DIR, outputFilename);

    ffmpeg(inputPath)
        .setStartTime(start)
        .setDuration(duration)
        .output(outputPath)
        .on('end', async () => {
            console.log("Trim successful, output:", outputFilename);
            const db = await dbPromise;
            await db.run('INSERT INTO videos (filename, path) VALUES (?, ?)', [outputFilename, outputPath]);
            res.json({ message: 'Video trimmed successfully', filename: outputFilename });
        })
        .on('error', (err) => {
            console.error("Error trimming video:", err);
            res.status(500).json({ message: 'Error trimming video', error: err.message });
        })
        .run();
});

// Merge Videos
/**
 * @swagger
 * /video/merge:
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
router.post('/merge',  authMiddleware,async (req, res) => {
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

module.exports = router;
