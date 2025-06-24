import { useState } from 'react';
import { useWeatherSummary } from '../hooks/useApi';
import Loader from '../components/Loader';
import ErrorAlert from '../components/ErrorAlert';
import {
  CloudIcon,
  ArrowUpTrayIcon,
  CalendarIcon,
  GlobeAltIcon,
  SunIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';

const WeatherPage = () => {
  const { loading, error, getWeatherSummary } = useWeatherSummary();
  const [image, setImage] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weatherData, setWeatherData] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setImage({
        url: e.target.result,
        name: file.name
      });
      setWeatherData(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!image) return;
    
    try {
      const result = await getWeatherSummary(image.url, date);
      setWeatherData(result);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 mt-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Weather Analysis
          </h1>
          <p className="text-lg text-white/70">
            Get detailed weather insights from satellite imagery
          </p>
        </div>

        {/* Image Upload Area */}
        <div
          className={`mb-8 rounded-xl border-2 border-dashed p-8 text-center transition-colors
                     ${dragOver
                       ? 'border-white/50 bg-white/5'
                       : 'border-white/20 hover:border-white/30'
                     }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer"
          >
            <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-white/50" />
            <p className="mt-4 text-white/70">
              Drop a satellite image here or click to upload
              <br />
              <span className="text-sm">
                (Supported formats: JPG, PNG)
              </span>
            </p>
          </label>
        </div>

        {/* Image Preview and Controls */}
        {image && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Image Preview */}
            <div className="bg-black/20 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10">
              <img
                src={image.url}
                alt={image.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <span className="text-white/70">{image.name}</span>
              </div>
            </div>

            {/* Date Selection */}
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="mb-6">
                <label className="block text-white mb-2 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Image Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white"
                />
              </div>

              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 
                         disabled:bg-white/5 disabled:cursor-not-allowed text-white py-3 px-4 
                         rounded-lg transition-colors"
              >
                <CloudIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                Analyze Weather
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && <ErrorAlert message={error} className="mb-8" />}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center my-12">
            <Loader size="lg" />
          </div>
        )}

        {/* Weather Analysis Results */}
        {!loading && weatherData && (
          <div className="space-y-6">
            {/* Location Overview */}
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-start gap-3">
                <GlobeAltIcon className="w-6 h-6 text-white/70 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Location Overview
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-white/70">
                    <div>
                      <p className="font-medium">Region</p>
                      <p>{weatherData.location.region}</p>
                    </div>
                    <div>
                      <p className="font-medium">Coordinates</p>
                      <p>{weatherData.location.coordinates}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Weather Conditions */}
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-start gap-3">
                <SunIcon className="w-6 h-6 text-white/70 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Weather Conditions
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-white/70">
                    {weatherData.conditions.map((condition, index) => (
                      <div key={index}>
                        <p className="font-medium">{condition.type}</p>
                        <p>{condition.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Cloud Analysis */}
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-start gap-3">
                <CloudArrowUpIcon className="w-6 h-6 text-white/70 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Cloud Analysis
                  </h3>
                  <div className="space-y-3 text-white/70">
                    <p>Coverage: {weatherData.clouds.coverage}</p>
                    <p>Type: {weatherData.clouds.type}</p>
                    <p>Altitude: {weatherData.clouds.altitude}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Insights */}
            {weatherData.insights && (
              <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Additional Insights
                </h3>
                <div className="space-y-2 text-white/70">
                  {weatherData.insights.map((insight, index) => (
                    <p key={index}>{insight}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherPage; 