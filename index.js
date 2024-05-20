const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const connection = require('./db');
const app = express();
const PORT = 3000;

app.use(express.json());

// Storage configuration for profile image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Registration endpoint
app.post('/api/register', async (req, res) => {
  const { first_name, last_name, gender, dob, email, password, profile_image_url } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const query = `INSERT INTO users (first_name, last_name, gender, dob, email, password, profile_image_url) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  connection.query(query, [first_name, last_name, gender, dob, email, hashedPassword, profile_image_url], (err, results) => {
    if (err) return res.status(500).send(err);
    res.status(201).send({ message: 'User registered successfully!' });
  });
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const query = `SELECT * FROM users WHERE email = ?`;
  
  connection.query(query, [email], async (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0) return res.status(401).send({ message: 'Invalid email or password' });
    
    const user = results[0];
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) return res.status(401).send({ message: 'Invalid email or password' });
    
    const token = jwt.sign({ userId: user.id }, 'secret_key', { expiresIn: '1h' });
    res.send({ message: 'Login successful', token });
  });
});

// Middleware to authenticate and extract user from token
const authenticate = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send({ message: 'No token provided' });
  
  jwt.verify(token, 'secret_key', (err, decoded) => {
    if (err) return res.status(500).send({ message: 'Failed to authenticate token' });
    req.userId = decoded.userId;
    next();
  });
};

// Get profile endpoint
app.get('/api/profile', authenticate, (req, res) => {
  const query = `SELECT first_name, last_name, gender, dob, email, profile_image_url FROM users WHERE id = ?`;
  connection.query(query, [req.userId], (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results[0]);
  });
});

// Update profile endpoint
app.put('/api/profile', authenticate, (req, res) => {
  const { first_name, last_name, gender, dob, email, profile_image_url } = req.body;
  const query = `UPDATE users SET first_name = ?, last_name = ?, gender = ?, dob = ?, email = ?, profile_image_url = ? WHERE id = ?`;
  connection.query(query, [first_name, last_name, gender, dob, email, profile_image_url, req.userId], (err, results) => {
    if (err) return res.status(500).send(err);
    res.send({ message: 'Profile updated successfully!' });
  });
});

// Delete account endpoint
app.delete('/api/profile', authenticate, (req, res) => {
  const query = `DELETE FROM users WHERE id = ?`;
  connection.query(query, [req.userId], (err, results) => {
    if (err) return res.status(500).send(err);
    res.send({ message: 'Account deleted successfully!' });
  });
});

// Upload profile image endpoint
app.post('/api/profile/image', authenticate, upload.single('profileImage'), (req, res) => {
  const profileImageUrl = req.file.path;
  const query = `UPDATE users SET profile_image_url = ? WHERE id = ?`;
  connection.query(query, [profileImageUrl, req.userId], (err, results) => {
    if (err) return res.status(500).send(err);
    res.send({ message: 'Profile image updated successfully!', profileImageUrl });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
