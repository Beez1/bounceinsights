import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { 
  MagnifyingGlassIcon, 
  ChatBubbleBottomCenterTextIcon, 
  ArrowsPointingInIcon 
} from '@heroicons/react/24/outline';
import SearchBar from '../components/SearchBar';
import ImageCard from '../components/ImageCard';
import Loader from '../components/Loader';

const tabs = [
  { name: 'Search', icon: MagnifyingGlassIcon },
  { name: 'Explain', icon: ChatBubbleBottomCenterTextIcon },
  { name: 'Compare', icon: ArrowsPointingInIcon },
];

export default function SearchAnalyzePage() {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);

  return (
    <div className="container mx-auto px-4 py-12 mt-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Search & Analyze</h1>
          <p className="mt-2 text-white/70">
            Search, analyze, and compare NASA imagery with AI-powered tools
          </p>
        </div>

        {/* Tabs */}
        <Tab.Group>
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

          <Tab.Panels>
            {/* Search Panel */}
            <Tab.Panel>
              <div className="space-y-8">
                <SearchBar 
                  onSearch={setSearchQuery}
                  placeholder="Search for Earth observations and events..."
                />
                
                {loading ? (
                  <Loader />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Search Results */}
                  </div>
                )}
              </div>
            </Tab.Panel>

            {/* Explain Panel */}
            <Tab.Panel>
              <div className="space-y-8">
                <div className="glass-effect rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Upload or Select an Image to Explain
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

                {/* AI Analysis Results */}
                <div className="glass-effect rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    AI Analysis
                  </h3>
                  {/* Analysis content */}
                </div>
              </div>
            </Tab.Panel>

            {/* Compare Panel */}
            <Tab.Panel>
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Image Selection Slots */}
                  {[0, 1].map((index) => (
                    <div
                      key={index}
                      className="glass-effect rounded-xl p-6 text-center"
                    >
                      <h3 className="text-lg font-semibold text-white mb-4">
                        {`Image ${index + 1}`}
                      </h3>
                      <div className="border-2 border-dashed border-white/20 rounded-lg p-8">
                        <button className="nasa-button">
                          Select Image
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Comparison Results */}
                <div className="glass-effect rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Comparison Analysis
                  </h3>
                  {/* Comparison content */}
                </div>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
} 