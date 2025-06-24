import { useState } from 'react';
import { useBriefing } from '../hooks/useApi';
import Loader from '../components/Loader';
import ErrorAlert from '../components/ErrorAlert';
import {
  EnvelopeIcon,
  ArrowUpTrayIcon,
  CalendarIcon,
  GlobeAltIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const BriefingPage = () => {
  const { loading, error, sendBriefing } = useBriefing();
  const [image, setImage] = useState(null);
  const [email, setEmail] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [countries, setCountries] = useState([]);
  const [success, setSuccess] = useState(false);
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
      setSuccess(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image || !email) return;
    
    try {
      await sendBriefing(image.url, email, date, countries);
      setSuccess(true);
      // Reset form
      setImage(null);
      setEmail('');
      setCountries([]);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const toggleCountry = (country) => {
    setCountries(prev =>
      prev.includes(country)
        ? prev.filter(c => c !== country)
        : [...prev, country]
    );
  };

  // Example list of countries (you would typically get this from an API)
  const availableCountries = [
    'United States',
    'Canada',
    'United Kingdom',
    'France',
    'Germany',
    'Japan',
    'Australia',
    'Brazil',
    'India',
    'China'
  ];

  return (
    <div className="container mx-auto px-4 py-12 mt-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Email Briefing
          </h1>
          <p className="text-lg text-white/70">
            Get detailed reports about Earth observations delivered to your inbox
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-8 bg-green-500/10 border border-green-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="w-6 h-6 text-green-400" />
              <p className="text-green-400">
                Briefing has been sent successfully! Check your email.
              </p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && <ErrorAlert message={error} className="mb-8" />}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Area */}
          <div
            className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors
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

          {/* Image Preview */}
          {image && (
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
          )}

          {/* Email Input */}
          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <label className="block text-white mb-2 flex items-center gap-2">
              <EnvelopeIcon className="w-5 h-5" />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white"
              required
            />
          </div>

          {/* Date Selection */}
          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
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

          {/* Country Selection */}
          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <label className="block text-white mb-4 flex items-center gap-2">
              <GlobeAltIcon className="w-5 h-5" />
              Select Countries (Optional)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {availableCountries.map(country => (
                <button
                  key={country}
                  type="button"
                  onClick={() => toggleCountry(country)}
                  className={`p-2 rounded-lg text-sm ${
                    countries.includes(country)
                      ? 'bg-white/20 text-white'
                      : 'bg-black/20 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {country}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !image || !email}
            className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 
                     disabled:bg-white/5 disabled:cursor-not-allowed text-white py-3 px-4 
                     rounded-lg transition-colors"
          >
            <EnvelopeIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            Send Briefing
          </button>
        </form>

        {/* Loading State */}
        {loading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center">
              <Loader size="lg" />
              <p className="mt-4 text-white">Sending briefing...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BriefingPage; 