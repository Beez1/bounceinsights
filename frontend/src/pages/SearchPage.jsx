import { useState } from 'react';
import { useSearch } from '../hooks/useApi';
import SearchBar from '../components/SearchBar';
import ImageCard from '../components/ImageCard';
import Loader from '../components/Loader';
import ErrorAlert from '../components/ErrorAlert';
import {
  MagnifyingGlassIcon,
  LightBulbIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

const exampleQueries = [
  "Show me Europe during the 2023 heatwave",
  "What did California look like during the wildfires?",
  "How has the Amazon rainforest changed in the past year?",
  "Show me the impact of flooding in Southeast Asia",
  "What's happening in the Arctic ice sheets?"
];

const SearchPage = () => {
  const { loading, error, search } = useSearch();
  const [results, setResults] = useState([]);
  const [showExamples, setShowExamples] = useState(true);

  const handleSearch = async (query) => {
    try {
      const data = await search(query);
      setResults(data);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handleExplain = (imageUrl) => {
    // TODO: Implement explanation feature
    console.log('Explain:', imageUrl);
  };

  const handleContextualize = (imageUrl) => {
    // TODO: Implement contextualization feature
    console.log('Contextualize:', imageUrl);
  };

  return (
    <div className="container mx-auto px-4 py-12 mt-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Search Earth Observations
          </h1>
          <p className="text-lg text-white/70">
            Ask questions about Earth in natural language and get comprehensive insights
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar
            onSearch={handleSearch}
            placeholder="What would you like to know about Earth?"
          />
        </div>

        {/* Example Queries */}
        <div className="mb-8">
          <button
            onClick={() => setShowExamples(!showExamples)}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-4"
          >
            <LightBulbIcon className="w-5 h-5" />
            Example Queries
            {showExamples ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </button>
          
          {showExamples && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {exampleQueries.map((query) => (
                <button
                  key={query}
                  onClick={() => handleSearch(query)}
                  className="text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 
                           text-white/80 hover:text-white transition-colors"
                >
                  {query}
                </button>
              ))}
            </div>
          )}
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
            <h2 className="text-xl font-semibold text-white">Search Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results.map((result) => (
                <ImageCard
                  key={result.id}
                  imageUrl={result.url}
                  title={result.title}
                  date={result.date}
                  description={result.description}
                  metadata={result.metadata}
                  onExplain={() => handleExplain(result.url)}
                  onContextualize={() => handleContextualize(result.url)}
                />
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && results.length === 0 && (
          <div className="text-center text-white/70 my-12">
            No results found. Try a different search query.
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage; 