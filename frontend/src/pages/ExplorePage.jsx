import { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { CalendarIcon, GlobeAltIcon, ClockIcon } from '@heroicons/react/24/outline';
import ImageCard from '../components/ImageCard';
import MapPicker from '../components/MapPicker';
import Loader from '../components/Loader';
import ErrorAlert from '../components/ErrorAlert';
import { useApi } from '../hooks/useApi';

const tabs = [
  { name: 'Astronomy', icon: CalendarIcon, endpoint: '/apod' },
  { name: 'Earth View', icon: GlobeAltIcon, endpoint: '/epic' },
  { name: 'Time Travel', icon: ClockIcon, endpoint: '/time-travel' },
];

export default function ExplorePage() {
  const [viewMode, setViewMode] = useState('grid');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [location, setLocation] = useState({ lat: 34.0522, lon: -118.2437 }); // Default to LA
  const [activeTab, setActiveTab] = useState(0);

  const endpoint = tabs[activeTab].endpoint;
  const params = {
    date: selectedDate.toISOString().split('T')[0],
    ...(location && { lat: location.lat, lon: location.lon }),
  };

  const { data, loading, error } = useApi(endpoint, params);

  const renderContent = () => {
    if (loading) {
      return <Loader />;
    }
    if (error) {
      return <ErrorAlert message={`Failed to fetch data. ${error.message}`} />;
    }
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return (
        <div className="text-center text-white/60 py-12">
          <p>No images found for the selected criteria.</p>
          <p className="text-sm mt-2">Try adjusting the date or location.</p>
        </div>
      );
    }
    
    const items = Array.isArray(data) ? data : [data];
    return (
      <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'gap-4'}`}>
        {items.map((item, index) => (
          <ImageCard key={item.identifier || index} {...item} />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-12 mt-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Explore Space & Earth</h1>
            <p className="mt-2 text-white/70">
              Discover amazing imagery from NASA's archives and satellites
            </p>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2 bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded ${
                viewMode === 'grid' 
                  ? 'bg-white/10 text-white' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded ${
                viewMode === 'list' 
                  ? 'bg-white/10 text-white' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              List
            </button>
          </div>
        </div>

        {/* Tabs */}
        <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
          <Tab.List className="flex space-x-2 rounded-xl bg-white/5 p-1 mb-8">
            {tabs.map((tab) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                   ${selected 
                    ? 'bg-white/10 text-white shadow' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                   }
                   flex items-center justify-center space-x-2 transition-all duration-200`
                }
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </Tab>
            ))}
          </Tab.List>

          {/* Filters */}
          <div className="space-y-4 mb-8">
            <div className="flex flex-wrap gap-4">
              {/* Date Picker */}
              <div className="glass-effect rounded-lg p-4 flex-1">
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="bg-white/5 text-white rounded-lg p-2 w-full"
                />
              </div>

              {/* Location Filter */}
              <div className="glass-effect rounded-lg p-4 flex-1">
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Location
                </label>
                <MapPicker onLocationSelect={setLocation} />
              </div>
            </div>

            {/* Timeline Slider */}
            <div className="glass-effect rounded-lg p-4">
              <label className="block text-sm font-medium text-white/70 mb-2">
                Time Period
              </label>
              <input
                type="range"
                min="0"
                max="100"
                className="w-full"
              />
            </div>
          </div>

          <Tab.Panels className="mt-2">
            <Tab.Panel>{renderContent()}</Tab.Panel>
            <Tab.Panel>{renderContent()}</Tab.Panel>
            <Tab.Panel>{renderContent()}</Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
} 