require('dotenv').config();
const express = require('express');


const cors = require('cors')
const swaggerDocs = require('./docs/swagger');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const videoRoutes = require('./routes/videoRoutes');
const shareRoutes = require('./routes/shareRoutes');

app.use('/video', videoRoutes);
app.use("/", shareRoutes);

swaggerDocs(app);
module.exports = app