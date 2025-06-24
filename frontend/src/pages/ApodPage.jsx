import { useEffect, useState } from 'react';
import { useApod } from '../hooks/useApi';
import Loader from '../components/Loader';
import ErrorAlert from '../components/ErrorAlert';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

const ApodPage = () => {
  const { loading, error, fetchApod } = useApod();
  const [apodData, setApodData] = useState(null);

  useEffect(() => {
    const loadApod = async () => {
      try {
        const data = await fetchApod();
        setApodData(data);
      } catch (err) {
        // Error is handled by the hook
      }
    };
    loadApod();
  }, [fetchApod]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorAlert message={error} />
      </div>
    );
  }

  if (!apodData) return null;

  return (
    <div className="container mx-auto px-4 py-12 mt-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          {apodData.title}
        </h1>
        <p className="text-white/70 mb-6">
          {new Date(apodData.date).toLocaleDateString()}
        </p>

        <div className="relative rounded-xl overflow-hidden mb-6">
          <img
            src={apodData.url}
            alt={apodData.title}
            className="w-full h-auto"
          />
          {apodData.copyright && (
            <div className="absolute bottom-0 right-0 bg-black/50 backdrop-blur-sm px-3 py-1 text-sm text-white/70">
              © {apodData.copyright}
            </div>
          )}
        </div>

        <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-start gap-3">
            <InformationCircleIcon className="w-6 h-6 text-white/70 flex-shrink-0 mt-1" />
            <p className="text-white/90 leading-relaxed">
              {apodData.explanation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApodPage; 