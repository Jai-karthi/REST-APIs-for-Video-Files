require('dotenv').config(); // Load env variables

const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization'];
    
    if (!token || token !== `Bearer ${process.env.API_TOKEN}`) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    
    next();
};

module.exports = authMiddleware;
