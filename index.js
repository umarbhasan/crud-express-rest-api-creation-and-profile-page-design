import express from 'express';
import bodyParser from 'body-parser' // Import the database configuration

const app = express();
const port = 5500;

// Middleware to parse JSON
app.use(bodyParser.json());

// Defined a simple route
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// Defined a route to fetch data from the database
app.get('/users', (req, res) => {
  const sql = 'SELECT * FROM users';
  db.query(sql, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// Starting the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
