import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import Loader from '../components/Loader';
import ErrorAlert from '../components/ErrorAlert';

const supportedCities = [
  'new york', 'los angeles', 'london', 'paris', 'berlin', 'tokyo', 'beijing', 
  'moscow', 'mumbai', 'sydney', 'dubai', 'toronto', 'cape town', 'mexico city', 
  'rio de janeiro', 'nairobi', 'lagos', 'istanbul', 'seoul', 'buenos aires', 
  'singapore', 'cairo', 'jakarta', 'bangkok', 'athens', 'helsinki', 'amsterdam'
];

const getYesterdayDate = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};

export default function TimeTravelPage() {
  const [location, setLocation] = useState(supportedCities[0]);
  const [date, setDate] = useState(getYesterdayDate());
  
  // Note: useApi hook needs to support POST requests for this endpoint.
  // Assuming useApi is updated or we create a new hook for POST.
  // For now, this structure shows the UI and data flow intention.
  const { data, loading, error, refetch } = useApi('/time-travel', {
    method: 'POST',
    body: {
      location,
      startDate: date,
      endDate: date,
      dataTypes: ['satellite']
    }
  }, false); // 'false' to prevent auto-fetching on render

  const handleFetch = () => {
    refetch();
  };

  const renderSatelliteImage = () => {
    if (loading) return <Loader />;
    if (error) return <ErrorAlert message={`Failed to fetch data: ${error.message}`} />;
    
    const satelliteData = data?.historicalData?.satellite;
    if (!satelliteData || satelliteData.error) {
      return <p className="text-white/60">{satelliteData?.error || 'No satellite image found for the selected criteria.'}</p>;
    }

    return (
      <div className="mt-6">
        <h3 className="text-xl font-bold text-white mb-2">Satellite View for {location} on {date}</h3>
        <img 
          src={satelliteData.imageUrl} 
          alt={`Satellite view of ${location}`} 
          className="rounded-lg shadow-lg w-full"
        />
        <p className="text-sm text-white/70 mt-2">{satelliteData.metadata?.note}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-end">
        <div>
          <label htmlFor="city-select" className="block text-xs sm:text-sm text-white/70 mb-1">Select a City</label>
          <select
            id="city-select"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="bg-white/10 p-2 rounded-lg w-full text-white capitalize"
          >
            {supportedCities.map(city => (
              <option key={city} value={city} className="capitalize bg-gray-800">
                {city}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="date-input" className="block text-xs sm:text-sm text-white/70 mb-1">Select a Date</label>
          <input
            id="date-input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-white/10 p-2 rounded-lg w-full text-white"
          />
        </div>
      </div>
      <button
        onClick={handleFetch}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition-colors disabled:bg-gray-500"
      >
        {loading ? 'Traveling...' : 'Time Travel'}
      </button>

      <div className="mt-6 md:mt-8 text-center">
        {renderSatelliteImage()}
      </div>
    </div>
  );
} 