import { useState, useMemo } from 'react';
import Loader from '../components/Loader';
import ErrorAlert from '../components/ErrorAlert';
import { useApi } from '../hooks/useApi';
import ImageViewer from '../components/ImageViewer';

const getTwoDaysAgoDate = () => {
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  return twoDaysAgo.toISOString().split('T')[0];
};

// Function to format date from YYYY-MM-DD to DD-MM-YYYY
const formatDateForApi = (isoDate) => {
  const [year, month, day] = isoDate.split('-');
  return `${day}-${month}-${year}`;
};

const groupImagesByLocation = (images) => {
  const groups = {
    'Asia-Pacific': [],
    'Pacific Ocean': [],
    'Americas': [],
    'Africa-Europe': [],
    'Middle East-India': [],
    'Other': []
  };

  images.forEach(image => {
    const lon = image.lon;
    if (lon >= 100 && lon <= 180) {
      groups['Asia-Pacific'].push(image);
    } else if (lon >= -180 && lon < -100) {
      groups['Pacific Ocean'].push(image);
    } else if (lon >= -100 && lon < -30) {
      groups['Americas'].push(image);
    } else if (lon >= -30 && lon < 60) {
      groups['Africa-Europe'].push(image);
    } else if (lon >= 60 && lon < 100) {
      groups['Middle East-India'].push(image);
    } else {
      groups['Other'].push(image);
    }
  });

  return groups;
};

export default function EpicViewPage() {
  const [date, setDate] = useState(getTwoDaysAgoDate());
  const [sortOrder, setSortOrder] = useState('default');
  const [selectedImage, setSelectedImage] = useState(null);

  const { data, loading, error } = useApi('/epic', { 
    date: formatDateForApi(date) 
  });

  const sortedImages = useMemo(() => {
    if (!data?.images) return [];
    const imagesCopy = [...data.images];
    if (sortOrder === 'earliest') {
      return imagesCopy.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    if (sortOrder === 'latest') {
      return imagesCopy.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    return imagesCopy;
  }, [data, sortOrder]);

  const imageGroups = useMemo(() => {
    if (sortedImages.length > 0) {
      return groupImagesByLocation(sortedImages);
    }
    return {};
  }, [sortedImages]);

  return (
    <>
      <ImageViewer image={selectedImage} onClose={() => setSelectedImage(null)} />
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Pick a Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-white/10 p-2 rounded-lg w-full text-white"
              max={getTwoDaysAgoDate()}
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Sort Images</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-white/10 p-2 rounded-lg w-full text-white"
            >
              <option value="default">Default Order</option>
              <option value="earliest">Earliest First</option>
              <option value="latest">Latest First</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          {loading && <Loader />}
          {error && <ErrorAlert message={error.message} />}

          {!loading && !error && Object.keys(imageGroups).map(groupName => {
            const groupImages = imageGroups[groupName];
            if (groupImages.length === 0) return null;

            return (
              <div key={groupName} className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4 capitalize">{groupName} ({groupImages.length} images)</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {groupImages.map((img) => (
                    <div 
                      key={img.identifier || img.date} 
                      className="bg-white/5 rounded-lg shadow-lg overflow-hidden flex flex-col justify-between group"
                    >
                      <div className="relative">
                        <img 
                          src={img.imageUrl} 
                          alt={img.caption} 
                          className="w-full h-48 object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
                          onClick={() => setSelectedImage(img)}
                        />
                      </div>
                      <div className="p-4 flex flex-col flex-grow">
                        <p className="text-white/80 text-sm truncate flex-grow" title={img.caption}>{img.caption}</p>
                        <p className="text-white/40 text-xs mt-1">
                          {new Date(img.date).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {!loading && !error && sortedImages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-white/60">No images found for the selected date.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 