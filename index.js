import express from 'express';
import bodyParser from 'body-parser';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import multer from 'multer';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const app = express();
const port = 3000;
const jwtSecret = 'your_jwt_secret_key'; // Change this to a strong secret

// Middleware configuration
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded request bodies
app.use(express.static('public')); // Serve static files from the 'public' directory
app.use('/uploads', express.static('uploads')); // Serve uploaded files from the 'uploads' directory

// File upload configuration using multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Set upload directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Generate unique filenames
    }
});

const upload = multer({ storage: storage }); // Initialize multer with storage configuration

// MySQL database configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    database: 'assignment2'
};

let db; // Database connection variable

// Initialize database connection
(async function initializeDbConnection() {
    try {
        db = await mysql.createConnection(dbConfig);
        console.log("Connected to the MySQL database.");
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
})();

// Helper function to verify JWT tokens
function verifyToken(req, res, next) {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: 'Access denied' });
    }

    jwt.verify(token, jwtSecret, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        req.email = decoded.email;
        next();
    });
}

// API endpoint for user registration
app.post('/api/register', upload.single('profile_image'), async (req, res) => {
    const { first_name, last_name, gender, date_of_birth, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Hash the user's password
        const profile_image_url = req.file ? req.file.path : null; // Get profile image URL if uploaded
        await db.query(
            'INSERT INTO users (first_name, last_name, gender, date_of_birth, email, password, profile_image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [first_name, last_name, gender, date_of_birth, email, hashedPassword, profile_image_url]
        );
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Error registering user', error });
    }
});

// API endpoint for user login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password); // Compare password with hashed password
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ email: user.email }, jwtSecret, { expiresIn: '1h' }); // Generate JWT token
        res.json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Error logging in user', error });
    }
});

// API endpoint to fetch user profile
app.get('/api/profile', verifyToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [req.email]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = rows[0];
        res.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Error fetching user profile', error });
    }
});

// API endpoint to update user profile
app.put('/api/profile', verifyToken, async (req, res) => {
    const { first_name, last_name, gender, date_of_birth, email } = req.body;
    try {
        await db.query(
            'UPDATE users SET first_name = ?, last_name = ?, gender = ?, date_of_birth = ?, email = ? WHERE email = ?',
            [first_name, last_name, gender, date_of_birth, email, req.email]
        );
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Error updating profile', error });
    }
});

// API endpoint to delete user account
app.delete('/api/profile', verifyToken, async (req, res) => {
    try {
        await db.query('DELETE FROM users WHERE email = ?', [req.email]);
        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ message: 'Error deleting account', error });
    }
});

// API endpoint to upload a profile image
app.post('/api/profile/image', verifyToken, upload.single('profile_image'), async (req, res) => {
    try {
        const profile_image_url = req.file ? req.file.path : null; // Get profile image URL if uploaded
        await db.query('UPDATE users SET profile_image_url = ? WHERE email = ?', [profile_image_url, req.email]);
        res.json({ message: 'Profile image uploaded successfully' });
    } catch (error) {
        console.error('Error uploading profile image:', error);
        res.status(500).json({ message: 'Error uploading profile image', error });
    }
});

// API endpoint to update user password
app.put('/api/profile/password', verifyToken, async (req, res) => {
    const { newPassword } = req.body;

    if (!newPassword) {
        return res.status(400).json({ message: 'New password is required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10); // Hash the new password

        await db.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, req.email]);

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ message: 'Error updating password', error });
    }
});

// Serve the registration page as the default route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/register.html');
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
