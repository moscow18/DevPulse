require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sql = require('mssql/msnodesqlv8');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// 🛑 THE ACTUAL FIX 🛑
// By wrapping it in a config object with the "connectionString" key, 
// we stop Node.js from breaking the string before Windows reads it!
const config = {
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=MOSCOW\\MSSQLSERVER02;Database=master;Trusted_Connection=yes;'
};

// Initialize Database Connection
sql.connect(config).then(pool => {
    if (pool.connected) {
        console.log('✅ Connected to Microsoft SQL Server (Windows Auth) successfully!');
    }
}).catch(err => {
    // Just in case ODBC 17 is strictly 32-bit, we fallback to the universal Windows driver
    console.error('❌ ODBC Driver 17 failed, trying universal Windows driver...');
    
    const fallbackConfig = {
        connectionString: 'Driver={SQL Server};Server=MOSCOW\\MSSQLSERVER02;Database=master;Trusted_Connection=yes;'
    };
    
    sql.connect(fallbackConfig).then(pool => {
        console.log('✅ Connected using universal {SQL Server} driver successfully!');
    }).catch(fallbackErr => {
        console.error('❌ Fallback Connection Failed!');
        console.error(fallbackErr);
    });
});

// --- API ROUTES ---

// Health Check Route
app.get('/', (req, res) => {
    res.send('SmartMed OS API is running!');
});

// Get All Patients
app.get('/api/patients', async (req, res) => {
    try {
        const result = await sql.query(`SELECT * FROM patients`);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching patients:', err);
        res.status(500).json({ error: 'Failed to retrieve patients' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Backend Server running on http://localhost:${PORT}`);
});