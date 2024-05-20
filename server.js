import express from 'express';
import bodyParser from 'body-parser';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL connection
const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'users'
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL Database.');
});

// User registration
app.post('/api/register', async (req, res) => {
    const { firstName, lastName, gender, dob, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO users (firstName, lastName, gender, dob, email, password) VALUES (?, ?, ?, ?, ?, ?)';
    try {
        await db.query(sql, [firstName, lastName, gender, dob, email, hashedPassword]);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// User login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM users WHERE email = ?';
    try {
        const [results] = await db.query(sql, [email]);
        if (results.length === 0) return res.status(400).json({ error: 'User not found' });

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(400).json({ error: 'Invalid password' });

        const token = jwt.sign({ userId: user.id }, 'your_jwt_secret');
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Middleware for token verification
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, 'your_jwt_secret', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Get profile
app.get('/api/profile', authenticateToken, async (req, res) => {
    const sql = 'SELECT firstName, lastName, gender, dob, email, profileImage FROM users WHERE id = ?';
    try {
        const [results] = await db.query(sql, [req.user.userId]);
        res.json(results[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update profile
app.put('/api/profile', authenticateToken, async (req, res) => {
    const { firstName, lastName, gender, dob, email } = req.body;
    const sql = 'UPDATE users SET firstName = ?, lastName = ?, gender = ?, dob = ?, email = ? WHERE id = ?';
    try {
        await db.query(sql, [firstName, lastName, gender, dob, email, req.user.userId]);
        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete account
app.delete('/api/profile', authenticateToken, async (req, res) => {
    const sql = 'DELETE FROM users WHERE id = ?';
    try {
        await db.query(sql, [req.user.userId]);
        res.json({ message: 'Account deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Profile image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, `${req.user.userId}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

app.post('/api/profile/image', authenticateToken, upload.single('profileImage'), async (req, res) => {
    const sql = 'UPDATE users SET profileImage = ? WHERE id = ?';
    try {
        await db.query(sql, [req.file.filename, req.user.userId]);
        res.json({ message: 'Profile image updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Static file serving for uploaded profile images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
