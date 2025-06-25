// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Routes
const apodRoute = require('./routes/apod');
const epicRoute = require('./routes/epic');
const weatherSummaryRoute = require('./routes/weatherSummary');
const contextualizeRoute = require('./routes/contextualize');
const emailBriefingRoute = require('./routes/emailBriefing');
const imageComparatorRoute = require('./routes/imageComparator');
const timeTravelRoute = require('./routes/timeTravel');
const searchRoute = require('./routes/search');
const explainRoute = require('./routes/explain');
const visionRoute = require('./routes/vision');
const sendEmailRoute = require('./routes/sendEmail');

app.use('/apod', apodRoute);
app.use('/epic', epicRoute);
app.use('/weather-summary', weatherSummaryRoute);
app.use('/contextualize', contextualizeRoute);
app.use('/email-briefing', emailBriefingRoute);
app.use('/image-comparator', imageComparatorRoute);
app.use('/time-travel', timeTravelRoute);
app.use('/search', searchRoute);
app.use('/explain', explainRoute);
app.use('/vision', visionRoute);
app.use('/send-email', sendEmailRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('NASA API Key:', process.env.NASA_API_KEY ? 'Is set' : 'Not set');
});

