import { useState, useEffect, useRef } from 'react';
import { Tab } from '@headlessui/react';
import { 
  MagnifyingGlassIcon, 
  ChatBubbleBottomCenterTextIcon, 
  ArrowsPointingInIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { Toaster, toast } from 'react-hot-toast';
import SearchBar from '../components/SearchBar';
import ImageCard from '../components/ImageCard';
import ImageViewer from '../components/ImageViewer';
import Loader from '../components/Loader';
import ErrorAlert from '../components/ErrorAlert';
import { searchImages, compareImages, explainImage } from '../hooks/useApi';

const tabs = [
  { name: 'Search', icon: MagnifyingGlassIcon },
  { name: 'Explain', icon: ChatBubbleBottomCenterTextIcon },
  { name: 'Compare', icon: ArrowsPointingInIcon },
];

const searchHints = [
  "Drought in South America 2022",
  "Flooding in Nigeria 2020",
  "Wildfires in Australia last summer",
  "What did Japan look like during the 2020 olympics?",
  "Recent volcanic activity in Iceland",
  "Images of the Amazon rainforest over the last 5 years",
  "UK during the 2022 heatwave",
  "What did Mecca look like during Hajj 2023?",
  "Satellite view of the Suez Canal blockage in 2021",
  "Greenland ice sheet melting between 2010 and 2020",
  "New York City during the COVID-19 pandemic",
  "Air quality changes over China in 2020",
  "La Palma volcanic eruption 2021",
  "World Cup 2022 in Qatar",
  "Deforestation in Madagascar",
  "Show me the Aral Sea shrinking over time",
];

export default function SearchAnalyzePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [searchResults, setSearchResults] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [queryAnalysis, setQueryAnalysis] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [comparisonResult, setComparisonResult] = useState(null);
  const [displayedHints, setDisplayedHints] = useState([]);
  const [uploadedImage, setUploadedImage] = useState(null);

  const [viewingImage, setViewingImage] = useState(null);
  const [imagesToCompare, setImagesToCompare] = useState([]);

  const fileInputRef = useRef(null);

  useEffect(() => {
    // Shuffle hints and pick a few to display
    const shuffled = [...searchHints].sort(() => 0.5 - Math.random());
    setDisplayedHints(shuffled.slice(0, 4));
  }, []);

  const handleSearch = async (query) => {
    setLoading(true);
    setError(null);
    setSearchResults([]);
    setAnalysis(null);
    setQueryAnalysis(null);
    try {
      const response = await searchImages(query);
      if (response.success) {
        // Extract satellite imagery
        const satelliteData = response.results.find(r => r.source === 'satellite' && r.images);
        if (satelliteData) {
          const formattedImages = satelliteData.images.map(img => ({
            imageUrl: img.imageUrl,
            title: img.caption,
            description: `Image ID: ${img.identifier}`,
            date: img.date,
            metadata: {
              ...(img.coordinates?.lat && { Lat: img.coordinates.lat.toFixed(4) }),
              ...(img.coordinates?.lon && { Lon: img.coordinates.lon.toFixed(4) }),
            }
          }));
          setSearchResults(formattedImages);
        }

        // Set overall analysis
        if (response.overallAnalysis && response.overallAnalysis.analysis) {
          setAnalysis(response.overallAnalysis.analysis);
        }

        // Set query analysis data
        if (response.queryAnalysis) {
          setQueryAnalysis(response.queryAnalysis);
        }
        
        if (!satelliteData && !response.overallAnalysis) {
          setError("No results found. Try a different query.");
        }
      } else {
        setError(response.details || 'Search failed. Please try again.');
      }
    } catch (err) {
      if (err.response && err.response.data) {
        // Use the detailed error message from the backend if available
        setError(err.response.data.details || err.response.data.error || 'An unknown error occurred.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExplain = async (imageUrl) => {
    if (!imageUrl) return;
    setLoading(true);
    setError(null);
    setExplanation('');
    try {
      const result = await explainImage(imageUrl);
      if (result.success) {
        setExplanation(result.explanation);
      } else {
        setError(result.details || 'Explanation failed.');
      }
    } catch (err) {
      setError(err.response?.data?.details || err.message || 'An error occurred during explanation.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
        // Automatically trigger explanation for the uploaded image
        // This assumes the backend can handle a base64 data URL
        // or that we'd upload it and get a URL.
        // For now, let's call handleExplain with the data URL.
        handleExplain(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddToCompare = (image) => {
    if (imagesToCompare.length >= 2) {
      toast.error("You can only compare two images at a time.");
      return;
    }
    if (imagesToCompare.find(img => img.imageUrl === image.imageUrl)) {
      toast.error("This image has already been added.");
      return;
    }
    setImagesToCompare([...imagesToCompare, image]);
    toast.success("Image added to compare list!");
  };

  const handleRemoveFromCompare = (imageUrl) => {
    setImagesToCompare(imagesToCompare.filter(img => img.imageUrl !== imageUrl));
    toast.success("Image removed from compare list.");
  };

  const handleCompare = async () => {
    if (imagesToCompare.length < 2) {
      toast.error("Please select two images to compare.");
      return;
    }
    setLoading(true);
    setError(null);
    setComparisonResult(null);
    try {
      const imageUrls = imagesToCompare.map(img => img.imageUrl);
      const result = await compareImages(imageUrls);
      if (result.success) {
        setComparisonResult(result.analysis);
      } else {
        setError(result.details || 'Comparison failed.');
      }
    } catch (err) {
      setError(err.response?.data?.details || err.message || 'An error occurred during comparison.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster 
        position="bottom-center"
        toastOptions={{
          className: 'bg-black/80 text-white backdrop-blur-sm border border-white/20',
        }}
      />
      {viewingImage && (
        <ImageViewer 
          imageUrl={viewingImage} 
          onClose={() => setViewingImage(null)} 
        />
      )}
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

            <Tab.Panels className="mt-2">
              {/* Search Panel */}
              <Tab.Panel>
                <div className="space-y-8">
                  <SearchBar 
                    onSearch={handleSearch}
                    placeholder="Search for Earth observations..."
                  />
                  {loading && <Loader />}
                  {error && <ErrorAlert message={error} />}
                  {/* AI Analysis Section */}
                  {analysis && !loading && (
                    <div className="glass-effect rounded-xl p-6 mb-8">
                      <h2 className="text-xl font-bold text-white mb-4">AI Analysis</h2>
                      <div 
                        className="prose prose-invert max-w-none text-white/90"
                        dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br />') }} 
                      />
                    </div>
                  )}

                  {/* Affected Locations Section */}
                  {queryAnalysis && queryAnalysis.locations && queryAnalysis.locations.length > 0 && !loading && (
                    <div className="glass-effect rounded-xl p-6 mb-8">
                      <h2 className="text-xl font-bold text-white mb-4">
                        Affected Locations
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {queryAnalysis.locations.map(loc => (
                          <span key={loc.name} className="bg-white/10 text-white px-3 py-1 rounded-full text-sm font-medium">
                            {loc.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {!loading && !error && searchResults.length === 0 && !analysis && (
                    <div className="text-center text-white/60 py-12">
                      <p className="text-lg font-medium">Search for NASA imagery and data using natural language.</p>
                      <p className="text-sm mt-2 mb-6">Or try one of these examples:</p>
                      <div className="flex flex-wrap justify-center gap-3">
                        {displayedHints.map(hint => (
                          <button
                            key={hint}
                            onClick={() => handleSearch(hint)}
                            className="nasa-button-secondary"
                          >
                            {hint}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searchResults.map((item, index) => (
                      <ImageCard 
                        key={index} 
                        {...item}
                        onView={setViewingImage}
                        onAddToCompare={handleAddToCompare}
                      />
                    ))}
                  </div>
                </div>
              </Tab.Panel>

              {/* Explain Panel */}
              <Tab.Panel>
                <div className="space-y-8">
                  <div className="glass-effect rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Upload or Select an Image to Explain
                    </h3>
                    {uploadedImage ? (
                      <div className="relative">
                        <img src={uploadedImage} alt="Uploaded for explanation" className="w-full h-auto max-h-96 object-contain rounded-lg" />
                        <button
                          onClick={() => {
                            setUploadedImage(null);
                            setExplanation('');
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-600/80 rounded-full hover:bg-red-500"
                          title="Remove Image"
                        >
                          <XCircleIcon className="w-6 h-6 text-white" />
                        </button>
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

                  {/* AI Analysis Results */}
                  <div className="glass-effect rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      AI Analysis
                    </h3>
                    {loading && <Loader />}
                    {error && <ErrorAlert message={error} />}
                    {!loading && !explanation && (
                      <div className="text-center text-white/60 py-12">
                        <p>Upload an image to get an AI-powered explanation.</p>
                      </div>
                    )}
                    {explanation && (
                      <div
                        className="prose prose-invert max-w-none text-white/90 bg-white/5 p-4 rounded-lg"
                        dangerouslySetInnerHTML={{ __html: explanation.replace(/\n/g, '<br />') }}
                      />
                    )}
                  </div>
                </div>
              </Tab.Panel>

              {/* Compare Panel */}
              <Tab.Panel>
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Image Selection Slots */}
                    {[0, 1].map((index) => {
                      const image = imagesToCompare[index];
                      return (
                        <div
                          key={index}
                          className="glass-effect rounded-xl p-6 text-center h-96 flex flex-col justify-center items-center"
                        >
                          {image ? (
                            <div className="relative w-full h-full group">
                              <img src={image.imageUrl} alt={`Comparison image ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-white font-semibold">{image.title}</p>
                                <p className="text-white/70 text-sm">{new Date(image.date).toLocaleDateString()}</p>
                                <button
                                  onClick={() => handleRemoveFromCompare(image.imageUrl)}
                                  className="absolute top-2 right-2 p-1 bg-red-600/80 rounded-full hover:bg-red-500"
                                  title="Remove Image"
                                >
                                  <XCircleIcon className="w-6 h-6 text-white" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <h3 className="text-lg font-semibold text-white mb-4">
                                {`Image ${index + 1}`}
                              </h3>
                              <div className="border-2 border-dashed border-white/20 rounded-lg p-8 w-full flex-grow flex flex-col justify-center items-center">
                                <p className="text-white/60">Select an image from the Search tab</p>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-center">
                    <button 
                      onClick={handleCompare} 
                      className="nasa-button"
                      disabled={imagesToCompare.length < 2 || loading}
                    >
                      {loading ? "Comparing..." : "Compare Images"}
                    </button>
                  </div>

                  {/* Comparison Results */}
                  <div className="glass-effect rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Comparison Analysis
                    </h3>
                    {loading && <Loader />}
                    {error && <ErrorAlert message={error} />}
                    {!loading && !comparisonResult && (
                      <div className="text-center text-white/60 py-12">
                        <p>Select two images to see a detailed comparison.</p>
                      </div>
                    )}
                    {comparisonResult && (
                      <div 
                        className="prose prose-invert max-w-none text-white/90 bg-white/5 p-4 rounded-lg"
                        dangerouslySetInnerHTML={{ __html: comparisonResult.replace(/\n/g, '<br />') }} 
                      />
                    )}
                  </div>
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </>
  );
} 