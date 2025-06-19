// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const apodRoute = require('./routes/apod');
const epicRoute = require('./routes/epic');
const explainRoute = require('./routes/explain');
const weatherSummaryRoute = require('./routes/weatherSummary');
const contextualizeRoute = require('./routes/contextualize');

app.use('/apod', apodRoute);
app.use('/epic', epicRoute);
app.use('/explain', explainRoute);
app.use('/weather-summary', weatherSummaryRoute);
app.use('/contextualize', contextualizeRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('NASA API Key:', process.env.NASA_API_KEY ? 'Is set' : 'Not set');
});

