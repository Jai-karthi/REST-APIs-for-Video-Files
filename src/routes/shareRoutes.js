const express = require('express');
const crypto = require('crypto');
const path = require('path');
const { dbPromise } = require('../config/db');
const fs = require("fs");

const router = express.Router();
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

router.post('/share', async (req, res) => {
    const { filename } = req.body;
    if (!filename) {
        return res.status(400).json({ message: 'Filename is required' });
    }

    const token = crypto.randomUUID();
    const expirationTime = Date.now() + 5 * 60 * 1000; // 5 minutes from now

    const db = await dbPromise;
    await db.run('INSERT INTO shares (token, filename, expiration_time) VALUES (?, ?, ?)', [token, filename, expirationTime]);

    res.json({ 
        message: 'Share link created', 
        url: `http://localhost:${process.env.PORT}/access/${token}` 
    });
});


router.get("/access/:id", async (req, res) => {
    const shareId = req.params.id;
    const db = await dbPromise;

    // Remove expired links before checking
    await db.run("DELETE FROM shares WHERE expiration_time < ?", [Date.now()]);

    // Retrieve the shared file details
    const sharedData = await db.get('SELECT filename, expiration_time FROM shares WHERE token = ?', [shareId]);

    if (!sharedData) {
        return res.status(404).json({ message: "Invalid or expired link." });
    }

    // Check expiration time
    if (Date.now() > sharedData.expiration_time) {
        await db.run("DELETE FROM shares WHERE token = ?", [shareId]); // Cleanup expired link
        return res.status(410).json({ message: "Link has expired." });
    }

    const filePath = path.join(UPLOAD_DIR, sharedData.filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found." });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    res.setHeader("Content-Type", "video/mp4");

    if (range) {
        // Parse range header
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        if (start >= fileSize) {
            return res.status(416).json({ message: "Requested range not satisfiable." });
        }

        const chunkSize = (end - start) + 1;
        const fileStream = fs.createReadStream(filePath, { start, end });

        res.writeHead(206, {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": chunkSize,
            "Content-Type": "video/mp4",
        });

        fileStream.pipe(res);
    } else {
        // Serve the whole file if no range request
        res.writeHead(200, {
            "Content-Length": fileSize,
            "Content-Type": "video/mp4",
        });

        fs.createReadStream(filePath).pipe(res);
    }
});

module.exports = router;
