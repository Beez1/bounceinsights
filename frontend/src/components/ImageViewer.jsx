import { ArrowDownTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ImageViewer = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  // Since the backend might use different image sources, we can't guarantee a clean filename.
  // We'll create a generic one based on the image identifier if possible.
  const getFilename = () => {
    try {
      const url = new URL(imageUrl);
      // Example EPIC URL: /EPIC/archive/natural/2023/11/05/png/epic_1b_20231105001726.png
      const parts = url.pathname.split('/');
      const filename = parts[parts.length - 1];
      // A simple check to see if it looks like a filename
      return filename.includes('.') ? filename : 'download.jpg';
    } catch (e) {
      return 'download.jpg';
    }
  }

  const handleDownload = async () => {
    try {
      // Use fetch to get the image as a blob
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Create a temporary link to trigger the download
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = getFilename();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      // As a fallback, open the image in a new tab so the user can save it manually.
      window.open(imageUrl, '_blank');
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity"
      onClick={onClose}
    >
      <div 
        className="relative max-w-4xl max-h-[90vh] w-full p-4"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the image/modal content
      >
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={handleDownload}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            title="Download Image"
          >
            <ArrowDownTrayIcon className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            title="Close Viewer"
          >
            <XMarkIcon className="w-6 h-6 text-white" />
          </button>
        </div>
        
        <img
          src={imageUrl}
          alt="Full screen view"
          className="w-full h-full object-contain rounded-lg shadow-2xl"
        />
      </div>
    </div>
  );
};

export default ImageViewer; 