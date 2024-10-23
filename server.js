const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
    user: 'feedback_user',      
    host: 'localhost',          
    database: 'university_feedback', 
    password: 'passw0rd',  
    port: 5432                  
});

pool.query(`
    CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        leadership INTEGER NOT NULL,
        internships INTEGER NOT NULL,
        professional INTEGER NOT NULL,
        exchange INTEGER NOT NULL,
        comments TEXT,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`, (err, res) => {
    if (err) {
        console.error('Error creating feedback table:', err);
    } else {
        console.log('Feedback table is ready');
    }
});

app.post('/submit-feedback', async (req, res) => {
    const { leadership, internships, professional, exchange, comments } = req.body;
    
    if (!leadership || !internships || !professional || !exchange) {
        return res.status(400).json({ message: "All rating fields are required" });
    }

    try {
        const result = await pool.query(
            'INSERT INTO feedback (leadership, internships, professional, exchange, comments) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [leadership, internships, professional, exchange, comments]
        );
        res.status(201).json({ message: "Feedback submitted successfully", feedback: result.rows[0] });
    } catch (error) {
        res.status(500).json({ message: "Failed to submit feedback", error });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
