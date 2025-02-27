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

/**
 * @swagger
 * /access/{id}:
 *   get:
 *     summary: Access a shared video
 *     description: Retrieve a shared video link if it is still valid.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique token for the shared video.
 *     responses:
 *       200:
 *         description: Successfully retrieved the shared video link
 *       403:
 *         description: Link expired
 *       404:
 *         description: Link not found
 */