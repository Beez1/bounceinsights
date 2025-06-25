import { useState, useEffect, useRef } from 'react';
import { CloudIcon, GlobeAltIcon, NewspaperIcon, XCircleIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import MapPicker from '../components/MapPicker';
import Loader from '../components/Loader';
import ErrorAlert from '../components/ErrorAlert';
import EmailDialog from '../components/EmailDialog';
import toast from 'react-hot-toast';
import { getWeatherSummary, getContextualInfo, detectCountries, sendWeatherEmailToUser } from '../hooks/useApi';

const getWeatherVisuals = (weatherString) => {
  if (!weatherString) return { emoji: '🤷', color: 'bg-gray-500/10' };

  const description = weatherString.trim().toLowerCase();

  if (description.includes('clear')) return { emoji: '☀️', color: 'bg-yellow-400/20' };
  if (description.includes('partly cloudy')) return { emoji: '⛅️', color: 'bg-blue-300/20' };
  if (description.includes('overcast')) return { emoji: '☁️', color: 'bg-gray-400/20' };
  if (description.includes('fog')) return { emoji: '🌫️', color: 'bg-gray-500/20' };
  if (description.includes('drizzle') || description.includes('rain')) return { emoji: '🌧️', color: 'bg-blue-500/20' };
  if (description.includes('snow') || description.includes('freezing')) return { emoji: '❄️', color: 'bg-cyan-300/20' };
  if (description.includes('thunderstorm')) return { emoji: '⛈️', color: 'bg-purple-600/20' };

  return { emoji: '🌎', color: 'bg-white/5' }; // Default
};

export default function WeatherContextPage() {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [detectedLocation, setDetectedLocation] = useState(null);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [email, setEmail] = useState('');
  
  const fileInputRef = useRef(null);

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

  const handleSendWeatherEmail = async () => {
    if (!weatherData || !location) return;
    try {
      const weatherPayload = {
        location: location.name,
        summary: weatherData.regions?.[0]?.weather || 'Not available'
      };
      await sendWeatherEmailToUser(email, weatherPayload);
      toast.success(`Weather summary for ${location.name} sent successfully!`);
    } catch (err) {
      toast.error(err.response?.data?.details || 'Failed to send email.');
    } finally {
      setIsEmailDialogOpen(false);
      setEmail('');
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setUploadedImage(URL.createObjectURL(file));

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = await detectCountries(reader.result);
        if (result.success && result.countries.length > 0) {
          const country = result.countries[0];
          setDetectedLocation(country);
          setLocation({ name: country }); // Trigger data fetching
        } else {
          setWeatherError("Could not detect a location from the image.");
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setWeatherError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
              {uploadedImage ? (
                <div className="relative">
                  <img src={uploadedImage} alt="Uploaded for context" className="w-full h-auto max-h-64 object-contain rounded-lg" />
                  <button
                    onClick={() => {
                      setUploadedImage(null);
                      setDetectedLocation(null);
                      setWeatherData(null);
                      setContextData(null);
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-600/80 rounded-full hover:bg-red-500"
                    title="Remove Image"
                  >
                    <XCircleIcon className="w-6 h-6 text-white" />
                  </button>
                  {detectedLocation && (
                    <div className="mt-2 text-center text-sm text-white/80">
                      Detected Location: <span className="font-semibold">{detectedLocation}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center"
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileSelect({ target: { files: e.dataTransfer.files }});
                    }
                  }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                  <button 
                    onClick={() => fileInputRef.current.click()}
                    className="nasa-button"
                  >
                    Upload Image
                  </button>
                  <p className="mt-2 text-sm text-white/60">
                    or drag and drop an image here
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Center Column - Weather Data */}
          <div className="lg:col-span-1">
            <div className="glass-effect rounded-xl p-6 h-full">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <CloudIcon className="w-5 h-5 mr-2" />
                Weather Analysis
              </h3>
              
              {(loading || weatherLoading) && <Loader />}
              {weatherError && <ErrorAlert message={weatherError} />}
              {!weatherLoading && !weatherData && !loading && (
                <div className="text-center text-white/60 py-12">
                  <p>Select a location on the map or upload an image to view weather analysis.</p>
                </div>
              )}
              {weatherData && (
                <div className="space-y-4">
                  {(() => {
                    const weatherString = weatherData.regions?.[0]?.weather;
                    if (!weatherString) {
                      return <p className="text-center text-white/60">Weather data not available.</p>;
                    }

                    const tempMatch = weatherString.match(/High: ([\d.-]+)°C/);
                    const temp = tempMatch ? tempMatch[1] : 'N/A';
                    const uvMatch = weatherString.match(/UV Index ([\d.-]+)/);
                    const uv = uvMatch ? uvMatch[1] : 'N/A';
                    const condition = weatherString.split(',')[2]?.trim() || 'N/A';
                    const country = weatherData.regions?.[0]?.country || 'N/A';
                    
                    const weatherVisuals = getWeatherVisuals(condition);

                    return (
                      <div className="space-y-4">
                        <div className={`text-6xl text-center p-4 rounded-lg ${weatherVisuals.color}`}>
                          {weatherVisuals.emoji}
                        </div>
                        {/* Weather Stats */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-blue-400/10 rounded-lg p-4">
                            <div className="text-sm text-white/70">Temperature</div>
                            <div className="text-2xl font-semibold text-white">
                              {temp}°C
                            </div>
                          </div>
                          <div className="bg-orange-400/10 rounded-lg p-4">
                            <div className="text-sm text-white/70">UV Index</div>
                            <div className="text-2xl font-semibold text-white">
                              {uv}
                            </div>
                          </div>
                          <div className="bg-purple-400/10 rounded-lg p-4">
                            <div className="text-sm text-white/70">Weather</div>
                            <div className="text-xl font-semibold text-white">
                              {condition}
                            </div>
                          </div>
                          <div className="bg-green-400/10 rounded-lg p-4">
                            <div className="text-sm text-white/70">Country</div>
                            <div className="text-xl font-semibold text-white">
                              {country}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setIsEmailDialogOpen(true)}
                          className="w-full mt-4 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <PaperAirplaneIcon className="w-5 h-5 mr-2" />
                          Send Summary to Email
                        </button>
                      </div>
                    );
                  })()}
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
                    <div className="bg-indigo-500/10 rounded-lg p-4 text-sm text-white">
                      <p><strong>Country:</strong> {contextData.contextualData?.[0]?.country}</p>
                      <p><strong>Capital:</strong> {contextData.contextualData?.[0]?.capital}</p>
                    </div>
                  </div>

                  {/* Capital Weather */}
                  <div>
                    <h4 className="text-sm font-medium text-white/70 mb-2">
                      Capital City Weather
                    </h4>
                    <div className="bg-sky-500/10 rounded-lg p-4 text-sm text-white">
                     {contextData.contextualData?.[0]?.weather}
                    </div>
                  </div>

                  {/* Recent News */}
                  <div>
                    <h4 className="text-sm font-medium text-white/70 mb-2">
                      Recent News
                    </h4>
                    <ul className="space-y-2">
                      {contextData.contextualData?.[0]?.news.slice(0, 3).map((item, index) => (
                        <li key={index} className="bg-teal-500/10 rounded-lg p-3 text-sm hover:bg-teal-500/20 transition-colors">
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-white font-medium">{item.title}</a>
                          <p className="text-white/60 text-xs">{item.source}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <EmailDialog
        isOpen={isEmailDialogOpen}
        onClose={() => setIsEmailDialogOpen(false)}
        onSend={handleSendWeatherEmail}
        email={email}
        setEmail={setEmail}
      />
    </div>
  );
} 