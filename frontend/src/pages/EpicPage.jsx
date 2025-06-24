import { useState, useEffect } from 'react';
import { useEpic } from '../hooks/useApi';
import ImageCard from '../components/ImageCard';
import MapPicker from '../components/MapPicker';
import Loader from '../components/Loader';
import ErrorAlert from '../components/ErrorAlert';
import {
  CalendarIcon,
  MapPinIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const EpicPage = () => {
  const { loading, error, fetchEpic } = useEpic();
  const [images, setImages] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState(null);
  const [radius, setRadius] = useState(1000); // km

  useEffect(() => {
    const loadImages = async () => {
      try {
        const data = await fetchEpic(
          date,
          location?.lat,
          location?.lng,
          radius
        );
        setImages(data);
      } catch (err) {
        // Error is handled by the hook
      }
    };
    loadImages();
  }, [date, location, radius, fetchEpic]);

  const handleExplain = (imageUrl) => {
    // TODO: Implement explanation feature
    console.log('Explain:', imageUrl);
  };

  const handleContextualize = (imageUrl) => {
    // TODO: Implement contextualization feature
    console.log('Contextualize:', imageUrl);
  };

  return (
    <div className="container mx-auto px-4 py-12 mt-16">
      {/* Controls */}
      <div className="mb-8 space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          EPIC Earth Images
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Date Picker */}
          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <label className="block text-white mb-2 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Select Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white"
            />
          </div>

          {/* Radius Control */}
          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <label className="block text-white mb-2 flex items-center gap-2">
              <MapPinIcon className="w-5 h-5" />
              Radius (km)
            </label>
            <input
              type="range"
              min="100"
              max="5000"
              step="100"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-white/70 text-sm mt-1">{radius} km</div>
          </div>

          {/* Refresh Button */}
          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/10 flex items-end">
            <button
              onClick={() => fetchEpic(date, location?.lat, location?.lng, radius)}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 
                       text-white py-2 px-4 rounded-lg transition-colors"
            >
              <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Map */}
        <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <label className="block text-white mb-2">Select Location (Optional)</label>
          <MapPicker
            initialLocation={{ lat: 0, lng: 0 }}
            onLocationSelect={setLocation}
            height="300px"
          />
        </div>
      </div>

      {/* Error Display */}
      {error && <ErrorAlert message={error} className="mb-8" />}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center my-12">
          <Loader size="lg" />
        </div>
      )}

      {/* Images Grid */}
      {!loading && images.length === 0 ? (
        <div className="text-center text-white/70 my-12">
          No images found for the selected criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <ImageCard
              key={image.id}
              imageUrl={image.url}
              title={image.title}
              date={image.date}
              description={image.caption}
              metadata={{
                'Latitude': `${image.centroid_coordinates.lat.toFixed(2)}°`,
                'Longitude': `${image.centroid_coordinates.lon.toFixed(2)}°`,
                'Altitude': `${image.dscovr_j2000_position.z.toFixed(0)} km`
              }}
              onExplain={() => handleExplain(image.url)}
              onContextualize={() => handleContextualize(image.url)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EpicPage; 