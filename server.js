//server.js
const express = require('express');
const pool = require('./db');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => { 
    res.send('Welcome to the E-commerce API');
});

//Route to Test database connection
app.get('/testdb', async (req, res) => {
    try {
        const results = await pool.query('SELECT NOW()');
        res.json(results.rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).json('Server Error');
    }
});


app.listen(port, () => { 
    console.log(`Server is running on port ${port}`);
});