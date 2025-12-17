require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes
const authRoutes = require('./routes/authRoutes');
const hoKhauRoutes = require('./routes/hoKhauRoutes');
const nhaVanHoaRoutes = require('./routes/nhaVanHoaRoutes');

//api
app.use('/api', authRoutes); 
app.use('/api/ho-khau', hoKhauRoutes);
app.use('/api/nha-van-hoa', nhaVanHoaRoutes);

// Route mặc định (Server check)
app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'index.html'));
});

app.listen(PORT, () => {
    const env = process.env.NODE_ENV || 'development';
    console.log(`Server running (${env}) at http://localhost:${PORT}/`);
});