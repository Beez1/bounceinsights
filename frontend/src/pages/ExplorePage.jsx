import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { CalendarIcon, GlobeAltIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useApi } from '../hooks/useApi';
import EpicViewPage from './EpicViewPage';
import TimeTravelPage from './TimeTravelPage';

const tabs = [
  { name: 'Astronomy', icon: CalendarIcon, endpoint: '/apod' },
  { name: 'Earth View', icon: GlobeAltIcon },
  { name: 'Time Travel', icon: ClockIcon },
];

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState(0);
  const currentTab = tabs[activeTab];
  const { data, loading, error } = useApi(currentTab.endpoint || null);

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

          <Tab.Panels className="mt-2">
            <Tab.Panel>
              <div className="text-center text-white/60 py-12">
                {loading ? (
                  <p>Loading...</p>
                ) : error ? (
                  <p className="text-red-500">Failed to load APOD: {error.message}</p>
                ) : data ? (
                  <div className="text-white max-w-3xl mx-auto space-y-4">
                    <h2 className="text-2xl font-bold">{data.title}</h2>
                    <p className="text-sm text-white/60">{data.date}</p>
                    {data.media_type === 'image' && (
                      <img
                        src={data.url}
                        alt={data.title}
                        className="rounded-lg shadow-lg w-full max-w-2xl mx-auto"
                      />
                    )}
                    <p className="text-white/80">{data.explanation}</p>
                  </div>
                ) : (
                  <p>No APOD data found.</p>
                )}
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <EpicViewPage />
            </Tab.Panel>
            <Tab.Panel>
              <TimeTravelPage />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
} 