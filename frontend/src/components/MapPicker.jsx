import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Replace with your Mapbox token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const MapPicker = ({ 
  initialLocation = { lat: 0, lng: 0 },
  onLocationSelect,
  height = "400px"
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [location, setLocation] = useState(initialLocation);

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [location.lng, location.lat],
      zoom: 2
    });

    marker.current = new mapboxgl.Marker({
      draggable: true
    })
      .setLngLat([location.lng, location.lat])
      .addTo(map.current);

    marker.current.on('dragend', () => {
      const lngLat = marker.current.getLngLat();
      setLocation({ lat: lngLat.lat, lng: lngLat.lng });
      onLocationSelect?.({ lat: lngLat.lat, lng: lngLat.lng });
    });

    map.current.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      marker.current.setLngLat([lng, lat]);
      setLocation({ lat, lng });
      onLocationSelect?.({ lat, lng });
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  return (
    <div className="rounded-lg overflow-hidden border border-white/10">
      <div ref={mapContainer} style={{ height }} />
      <div className="bg-black/20 backdrop-blur-sm p-3 text-sm text-white/70">
        Latitude: {location.lat.toFixed(4)}, Longitude: {location.lng.toFixed(4)}
      </div>
    </div>
  );
};

export default MapPicker; 