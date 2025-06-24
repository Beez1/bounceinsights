import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function ImageViewer({ image, onClose }) {
  if (!image) return null;

  const handleDownload = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `epic-${image.date?.split(' ')[0] || 'image'}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download image directly:", error);
      // Fallback to opening in a new tab if direct download fails
      window.open(image.imageUrl, '_blank');
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="relative bg-gray-900/70 backdrop-blur-md rounded-lg max-w-4xl max-h-[90vh] w-full p-4 md:p-6 overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-4">
          <div className="relative">
            <img src={image.imageUrl} alt={image.caption} className="w-full h-auto object-contain rounded-lg max-h-[70vh]" />
            <button onClick={onClose} className="absolute -top-2 -right-2 text-white/70 hover:text-white bg-gray-800 rounded-full p-1">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white">{image.caption}</h3>
            <p className="text-sm text-white/60">{new Date(image.date).toLocaleString()}</p>
          </div>

          <div className="flex space-x-4 pt-2">
            <a
              href={image.imageUrl}
              onClick={handleDownload}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors w-full sm:w-auto"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              <span>Download</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 