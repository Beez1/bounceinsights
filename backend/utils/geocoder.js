const NodeGeocoder = require('node-geocoder');

const options = {
  provider: 'openstreetmap',
  // Optional depending on the providers
  // fetch: customFetchImplementation,
  // apiKey: 'YOUR_API_KEY', // for Mapquest, OpenCage, Google Premier
  formatter: null, // 'gpx', 'string', ...
  userAgent: 'BounceChallengeApp/1.0'
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder; 