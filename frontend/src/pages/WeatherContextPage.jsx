import { useState, useEffect } from 'react';
import { CloudIcon, GlobeAltIcon, NewspaperIcon } from '@heroicons/react/24/outline';
import MapPicker from '../components/MapPicker';
import Loader from '../components/Loader';
import ErrorAlert from '../components/ErrorAlert';
import { getWeatherSummary, getContextualInfo } from '../hooks/useApi';

export default function WeatherContextPage() {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);

  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);

  const [contextLoading, setContextLoading] = useState(false);
  const [contextError, setContextError] = useState(null);
  const [contextData, setContextData] = useState(null);

  useEffect(() => {
    if (location) {
      const fetchAllData = async () => {
        // Fetch Weather
        setWeatherLoading(true);
        setWeatherError(null);
        try {
          const weather = await getWeatherSummary(location);
          setWeatherData(weather);
        } catch (err) {
          setWeatherError(err.message);
        } finally {
          setWeatherLoading(false);
        }

        // Fetch Context
        setContextLoading(true);
        setContextError(null);
        try {
          const context = await getContextualInfo(location);
          setContextData(context);
        } catch (err) {
          setContextError(err.message);
        } finally {
          setContextLoading(false);
        }
      };
      fetchAllData();
    }
  }, [location]);

  return (
    <div className="container mx-auto px-4 py-12 mt-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Weather & Context</h1>
          <p className="mt-2 text-white/70">
            Analyze weather patterns and get contextual information about locations
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Location Selection */}
          <div className="lg:col-span-1 space-y-6">
            {/* Location Picker */}
            <div className="glass-effect rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <GlobeAltIcon className="w-5 h-5 mr-2" />
                Select Location
              </h3>
              <MapPicker onLocationSelect={setLocation} />
            </div>

            {/* Upload Section */}
            <div className="glass-effect rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Upload Satellite Image
              </h3>
              <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {/* Handle file upload */}}
                />
                <button className="nasa-button">
                  Upload Image
                </button>
                <p className="mt-2 text-sm text-white/60">
                  or drag and drop an image here
                </p>
              </div>
            </div>
          </div>

          {/* Center Column - Weather Data */}
          <div className="lg:col-span-1">
            <div className="glass-effect rounded-xl p-6 h-full">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <CloudIcon className="w-5 h-5 mr-2" />
                Weather Analysis
              </h3>
              
              {weatherLoading && <Loader />}
              {weatherError && <ErrorAlert message={weatherError} />}
              {!weatherLoading && !weatherData && (
                <div className="text-center text-white/60 py-12">
                  <p>Select a location on the map to view weather analysis.</p>
                </div>
              )}
              {weatherData && (
                <div className="space-y-4">
                  {/* Weather Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="text-sm text-white/70">Temperature</div>
                      <div className="text-2xl font-semibold text-white">
                        {/* Temperature data */}
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="text-sm text-white/70">UV Index</div>
                      <div className="text-2xl font-semibold text-white">
                        {/* UV data */}
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="text-sm text-white/70">Cloud Cover</div>
                      <div className="text-2xl font-semibold text-white">
                        {/* Cloud data */}
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="text-sm text-white/70">Precipitation</div>
                      <div className="text-2xl font-semibold text-white">
                        {/* Precipitation data */}
                      </div>
                    </div>
                  </div>

                  {/* Forecast */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-white/70 mb-3">
                      5-Day Forecast
                    </h4>
                    {/* Forecast content */}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Contextual Info */}
          <div className="lg:col-span-1">
            <div className="glass-effect rounded-xl p-6 h-full">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <NewspaperIcon className="w-5 h-5 mr-2" />
                Location Context
              </h3>
              
              {contextLoading && <Loader />}
              {contextError && <ErrorAlert message={contextError} />}
              {!contextLoading && !contextData && (
                 <div className="text-center text-white/60 py-12">
                   <p>Select a location to view contextual information and news.</p>
                 </div>
              )}
              {contextData && (
                <div className="space-y-6">
                  {/* Country Info */}
                  <div>
                    <h4 className="text-sm font-medium text-white/70 mb-2">
                      Country Information
                    </h4>
                    {/* Country details */}
                  </div>

                  {/* Capital Weather */}
                  <div>
                    <h4 className="text-sm font-medium text-white/70 mb-2">
                      Capital City Weather
                    </h4>
                    {/* Capital weather details */}
                  </div>

                  {/* Recent News */}
                  <div>
                    <h4 className="text-sm font-medium text-white/70 mb-2">
                      Recent News
                    </h4>
                    {/* News items */}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 