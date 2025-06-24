// routes/epic.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

const NASA_API_KEY = process.env.NASA_API_KEY;

// Helper to calculate distance between two points
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

router.get('/', async (req, res) => {
  try {
    const { date: userInputDate, lat, lon, radius = 1000 } = req.query;
    
    if (!userInputDate) {
      return res.status(400).json({ 
        error: 'Date is required', 
        details: 'Please provide a date in YYYY-MM-DD format.' 
      });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(userInputDate)) {
      return res.status(400).json({ 
        error: 'Invalid date format', 
        details: 'Date must be in YYYY-MM-DD format.' 
      });
    }

    const [year, month, day] = userInputDate.split('-');
    const nasaApiDate = userInputDate;

    // Validate lat/lon if provided
    if ((lat && !lon) || (!lat && lon)) {
      return res.status(400).json({ 
        error: 'Invalid coordinates', 
        details: 'Both latitude and longitude must be provided together' 
      });
    }

    if (lat && lon) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);
      
      if (isNaN(latitude) || latitude < -90 || latitude > 90) {
        return res.status(400).json({ 
          error: 'Invalid latitude', 
          details: 'Latitude must be between -90 and 90' 
        });
      }
      
      if (isNaN(longitude) || longitude < -180 || longitude > 180) {
        return res.status(400).json({ 
          error: 'Invalid longitude', 
          details: 'Longitude must be between -180 and 180' 
        });
      }
    }

    console.log(`Fetching EPIC images for date: ${nasaApiDate}`);
    const { data } = await axios.get(
      `https://api.nasa.gov/EPIC/api/natural/date/${nasaApiDate}?api_key=${NASA_API_KEY}`
    );

    if (!data.length) {
      return res.status(404).json({ error: 'No images found for this date.' });
    }

    // Process and filter images
    let images = data.map((img) => ({
      caption: img.caption,
      date: img.date,
      lat: img.centroid_coordinates.lat,
      lon: img.centroid_coordinates.lon,
      imageUrl: `https://epic.gsfc.nasa.gov/archive/natural/${year}/${month}/${day}/jpg/${img.image}.jpg`,
    }));

    // Filter by location if lat/lon provided
    if (lat && lon) {
      const targetLat = parseFloat(lat);
      const targetLon = parseFloat(lon);
      const maxDistance = parseFloat(radius); // km

      const filteredImages = images.filter(img => {
        const distance = calculateDistance(
          targetLat, 
          targetLon, 
          img.lat, 
          img.lon
        );
        return distance <= maxDistance;
      });

      if (filteredImages.length === 0) {
        return res.status(404).json({ 
          error: 'No images found', 
          details: 'No images found near the specified location' 
        });
      }

      // Sort by distance from target location
      filteredImages.sort((a, b) => {
        const distA = calculateDistance(targetLat, targetLon, a.lat, a.lon);
        const distB = calculateDistance(targetLat, targetLon, b.lat, b.lon);
        return distA - distB;
      });

      images = filteredImages;
    }

    res.json({ 
      date: userInputDate, 
      count: images.length,
      query: lat && lon ? { lat: parseFloat(lat), lon: parseFloat(lon), radius: parseFloat(radius) } : null,
      images 
    });
  } catch (err) {
    console.error('EPIC API Error:', err.response?.data || err.message);
    res.status(500).json({
      error: 'Failed to fetch EPIC data',
      details: err.response?.data || err.message,
    });
  }
});

module.exports = router; 