const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Video API",
            version: "1.0.0",
            description: "API documentation for the video upload and sharing service.",
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 7000}`,
                description: "Local server",
            },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [{ BearerAuth: [] }], // Apply security globally
    },
    apis: ["./src/server.js", "./src/routes/*.js"], // Ensure the correct paths are included
};

const swaggerSpec = swaggerJsDoc(options);

function swaggerDocs(app) {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log(`Swagger docs available at http://localhost:${process.env.PORT || 7000}/api-docs`);
}

module.exports = swaggerDocs;
