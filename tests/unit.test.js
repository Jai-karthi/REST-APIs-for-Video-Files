const { initializeDB } = require("../src/db"); 
const request = require("supertest");
const app = require("../src/server");
const path = require("path");

jest.mock("../src/db.js", () => ({
    initializeDB: jest.fn().mockResolvedValue(true),
}));

test("Database connection should be successful", async () => {
    await expect(initializeDB()).resolves.toBeTruthy();
});

test("Authentication middleware should reject invalid token", async () => {
    const res = await request(app)
        .post("/upload")
        .set("Authorization", "Bearer wrong-token")
        .attach("video", path.join(__dirname, "sample.mp4"));

    expect(res.status).toBe(401);
});

test("Merging videos should fail if less than two files are provided", async () => {
    const res = await request(app)
        .post("/merge")
        .send({ filenames: ["video1.mp4"] })
        .set("Authorization", `Bearer static-token`);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("At least two video files are required for merging");
});
