import { useState } from 'react';
import MapPicker from '../components/MapPicker';
import Loader from '../components/Loader';
import ErrorAlert from '../components/ErrorAlert';
import { useApi } from '../hooks/useApi';

export default function EpicViewPage() {
  const [location, setLocation] = useState({ lat: 0, lon: 0 });
  const [date, setDate] = useState('2023-01-01');

  const { data, loading, error } = useApi('/epic', {
    lat: location.lat,
    lon: location.lon,
    date,
    radius: 1000,
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm text-white/70 mb-1">Pick a Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-white/10 p-2 rounded-lg w-full text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-white/70 mb-1">Pick a Location</label>
          <MapPicker onLocationSelect={(loc) => setLocation({ lat: loc.lat, lon: loc.lng })} />
        </div>
      </div>

      <div className="mt-8">
        {loading && <Loader />}
        {error && <ErrorAlert message={error.message} />}

        {data?.images?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.images.map((img, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-4 shadow">
                <img src={img.imageUrl} alt={img.caption} className="rounded mb-2" />
                <p className="text-white/80 text-sm">{img.caption}</p>
                <p className="text-white/40 text-xs mt-1">
                  Lat: {img.lat}, Lon: {img.lon}
                </p>
              </div>
            ))}
          </div>
        ) : (
          !loading && (
            <p className="text-center text-white/60">No images found for selected date/location.</p>
          )
        )}
      </div>
    </div>
  );
} 