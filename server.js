const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); // 1. Import the 'pg' library instead of sqlite

const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());

// 2. Set up the PostgreSQL connection pool
// It automatically uses the DATABASE_URL environment variable on Render.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// NOTE: The table creation logic has been removed because you now create
// your tables directly in the Supabase SQL Editor.

// --- API Endpoints ---

// Handle teacher logins
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Notice the change from ? to $1, $2 for parameters
        const result = await pool.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password]);
        if (result.rows.length > 0) {
            res.json({ success: true, message: 'Login successful!' });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

// Get homework for a specific class (for student view)
app.get('/api/homework/:class', async (req, res) => {
    const { class: className } = req.params;
    try {
        const result = await pool.query('SELECT * FROM homework WHERE class = $1 ORDER BY "dueDate"', [className]);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

// Get ALL homework (for admin view)
app.get('/api/homework', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM homework ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

// Get a SINGLE homework item by ID (for editing)
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
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

// Add a new homework assignment
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
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

// Update an existing homework assignment
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
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

// Delete a homework assignment
app.delete('/api/homework/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM homework WHERE id = $1', [id]);
        res.json({ message: 'Homework deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

// Start the server
app.listen(PORT, () => console.log(`✅ Server is listening on http://localhost:${PORT}`));