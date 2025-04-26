const express = require('express');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');

const tickerRoutes = require('./routes/v1/ticker');
const healthRoutes = require('./routes/health');

console.log('Ticker Route Type:', typeof tickerRoutes);
console.log('Health Route Type:', typeof healthRoutes);

const app = express();

// ⚠️ Temporary: Allow ALL origins for testing
app.use(cors());

app.use(compression());
app.use(morgan('combined'));
app.use(express.json());

app.use('/api/v1/ticker', tickerRoutes);
app.use('/api/health', healthRoutes);

app.use((req, res) => {
    res.status(404).json({ message: "Endpoint not found" });
});

const PORT = process.env.PORT || 5005;

app.listen(PORT, () => {
    console.log(`✅ Sports Ticker API running on port ${PORT}`);
});
