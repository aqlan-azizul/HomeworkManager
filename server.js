// --- NEW: Force Node.js to prefer IPv4 addresses ---
// This is the fix for the ENETUNREACH error on Render.
require('dns').setDefaultResultOrder('ipv4first');

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

// Check if the DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  console.error("FATAL ERROR: DATABASE_URL is not set in the environment.");
  process.exit(1); // Exit if the database URL is missing
}

// Create a new PostgreSQL connection pool.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// --- NEW: Root Endpoint to check if server is running ---
app.get('/', (req, res) => {
    res.send('✅ Homework App Backend is running!');
});

// --- NEW: Database Connection Test Endpoint ---
app.get('/api/db-test', async (req, res) => {
    try {
        console.log("Attempting to connect to the database...");
        const client = await pool.connect();
        console.log("Database connection successful!");
        const result = await client.query('SELECT NOW()');
        res.json({ success: true, time: result.rows[0].now });
        client.release();
    } catch (err) {
        console.error("!!! DATABASE CONNECTION FAILED !!!");
        console.error(err.stack); // Log the full error stack trace
        res.status(500).json({ success: false, error: "Database connection failed.", details: err.message });
    }
});


// --- API Endpoints with better logging ---

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password]);
        if (result.rows.length > 0) {
            res.json({ success: true });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ success: false, message: 'Server error during login.' });
    }
});

app.get('/api/homework/:class', async (req, res) => {
    const { class: className } = req.params;
    try {
        const result = await pool.query('SELECT * FROM homework WHERE class = $1 ORDER BY "dueDate"', [className]);
        res.json(result.rows);
    } catch (err) {
        console.error("Get Homework by Class Error:", err);
        res.status(500).json([]);
    }
});

// ... (The rest of the endpoints are the same, but with better error logging)

app.get('/api/homework', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM homework ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        console.error("Get All Homework Error:", err);
        res.status(500).json([]);
    }
});

app.get('/api/homework/item/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM homework WHERE id = $1', [id]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Homework not found' });
        }
    } catch (err) {
        console.error("Get Homework Item Error:", err);
        res.status(500).json({ message: 'Server error.' });
    }
});

app.post('/api/homework', async (req, res) => {
    const { classes, subject, method, assignment, dueDate, notes } = req.body;
    try {
        for (const className of classes) {
            await pool.query(
                'INSERT INTO homework (class, subject, method, assignment, "dueDate", notes) VALUES ($1, $2, $3, $4, $5, $6)',
                [className, subject, method, assignment, dueDate, notes]
            );
        }
        res.status(201).json({ message: 'Homework added successfully' });
    } catch (err) {
        console.error("Add Homework Error:", err);
        res.status(500).json({ message: 'Failed to add homework.' });
    }
});

app.put('/api/homework/:id', async (req, res) => {
    const { id } = req.params;
    const { class: className, subject, method, assignment, dueDate, notes } = req.body;
    try {
        await pool.query(
            'UPDATE homework SET class = $1, subject = $2, method = $3, assignment = $4, "dueDate" = $5, notes = $6 WHERE id = $7',
            [className, subject, method, assignment, dueDate, notes, id]
        );
        res.json({ message: 'Homework updated successfully' });
    } catch (err) {
        console.error("Update Homework Error:", err);
        res.status(500).json({ message: 'Failed to update homework.' });
    }
});

app.delete('/api/homework/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM homework WHERE id = $1', [id]);
        res.json({ message: 'Homework deleted successfully' });
    } catch (err) {
        console.error("Delete Homework Error:", err);
        res.status(500).json({ message: 'Failed to delete homework.' });
    }
});

app.listen(PORT, () => console.log(`✅ Server is listening on port ${PORT}`));
