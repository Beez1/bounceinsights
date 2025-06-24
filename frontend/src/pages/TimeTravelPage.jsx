import { useState } from 'react';
import { useTimeTravel } from '../hooks/useApi';
import MapPicker from '../components/MapPicker';
import ImageCard from '../components/ImageCard';
import Loader from '../components/Loader';
import ErrorAlert from '../components/ErrorAlert';
import {
  CalendarIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const dataTypes = [
  { id: 'satellite', label: 'Satellite Images' },
  { id: 'weather', label: 'Weather Data' },
  { id: 'events', label: 'Historical Events' }
];

const presetRanges = [
  { id: 'week', label: 'Past Week' },
  { id: 'month', label: 'Past Month' },
  { id: 'year', label: 'Past Year' },
  { id: 'decade', label: 'Past Decade' },
  { id: 'custom', label: 'Custom Range' }
];

const TimeTravelPage = () => {
  const { loading, error, getTimeTravel } = useTimeTravel();
  const [location, setLocation] = useState(null);
  const [selectedRange, setSelectedRange] = useState('month');
  const [customRange, setCustomRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedTypes, setSelectedTypes] = useState(['satellite']);
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    try {
      const data = await getTimeTravel(
        location,
        selectedRange === 'custom' ? customRange : selectedRange,
        selectedTypes
      );
      setResults(data);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const toggleDataType = (typeId) => {
    setSelectedTypes(prev =>
      prev.includes(typeId)
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  return (
    <div className="container mx-auto px-4 py-12 mt-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Time Travel Explorer
          </h1>
          <p className="text-lg text-white/70">
            Journey through time to see how Earth has changed
          </p>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Left Column: Map */}
          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <label className="block text-white mb-2">Select Location</label>
            <MapPicker
              initialLocation={{ lat: 0, lng: 0 }}
              onLocationSelect={setLocation}
              height="300px"
            />
          </div>

          {/* Right Column: Filters */}
          <div className="space-y-6">
            {/* Time Range */}
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <label className="block text-white mb-4 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Time Range
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                {presetRanges.map(range => (
                  <button
                    key={range.id}
                    onClick={() => setSelectedRange(range.id)}
                    className={`p-2 rounded-lg text-sm ${
                      selectedRange === range.id
                        ? 'bg-white/20 text-white'
                        : 'bg-black/20 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
              {selectedRange === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-1">Start Date</label>
                    <input
                      type="date"
                      value={customRange.start}
                      onChange={e => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-1">End Date</label>
                    <input
                      type="date"
                      value={customRange.end}
                      onChange={e => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Data Types */}
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <label className="block text-white mb-4 flex items-center gap-2">
                <AdjustmentsHorizontalIcon className="w-5 h-5" />
                Data Types
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {dataTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => toggleDataType(type.id)}
                    className={`p-2 rounded-lg text-sm ${
                      selectedTypes.includes(type.id)
                        ? 'bg-white/20 text-white'
                        : 'bg-black/20 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={loading || !location}
              className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 
                       disabled:bg-white/5 disabled:cursor-not-allowed text-white py-3 px-4 
                       rounded-lg transition-colors"
            >
              <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              Search Through Time
            </button>
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

        {/* Results */}
        {!loading && results.length > 0 && (
          <div className="space-y-8">
            <h2 className="text-xl font-semibold text-white">Timeline Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((result) => (
                <ImageCard
                  key={result.id}
                  imageUrl={result.url}
                  title={result.title}
                  date={result.date}
                  description={result.description}
                  metadata={result.metadata}
                />
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && results.length === 0 && location && (
          <div className="text-center text-white/70 my-12">
            No historical data found for the selected criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeTravelPage; 