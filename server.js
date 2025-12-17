require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Routes


// Route mặc định (Server check)
app.get('/', (_req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
    const env = process.env.NODE_ENV || 'development';
    console.log(`Server running (${env}) at http://localhost:${PORT}/`);
});