const app = require('./app')
const { initializeDB, updateDatabaseSchema } = require('./config/db');
const PORT = process.env.PORT || 7000;

app.listen(PORT, async () => {
    await initializeDB();
    await updateDatabaseSchema();
    console.log(`Server running on port ${PORT}`);
});
