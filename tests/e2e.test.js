const request = require("supertest");
const app = require("../src/server"); 
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

let server;

beforeAll((done) => {
    server = app.listen(4000, () => {
        console.log("Test server started on port 4000");
        done();
    });
});

afterAll((done) => {
    server.close(() => {
        console.log("Test server stopped");
        done();
    });
});

test("Server should be running", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
});

test("Unauthorized video upload should fail", async () => {
    const res = await request(app)
        .post("/upload")
        .attach("video", path.join(__dirname, "sample.mp4"));

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Unauthorized");
});

test("Authorized video upload should succeed", async () => {
    const res = await request(app)
        .post("/upload")
        .set("Authorization", `Bearer static-token`)
        .attach("video", path.join(__dirname, "sample.mp4"));

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("filename");
});
