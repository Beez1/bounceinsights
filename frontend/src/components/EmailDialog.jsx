import React from 'react';

const EmailDialog = ({ isOpen, onClose, onSend, email, setEmail }) => {
  if (!isOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    onSend();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1c1c1c] rounded-lg p-6 sm:p-8 shadow-xl max-w-sm w-full">
        <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Send to Email</h2>
        <p className="text-sm sm:text-base text-white/70 mb-6">Enter your email address to receive this content.</p>
        <form onSubmit={handleSend}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            className="w-full px-4 py-2 rounded-md bg-white/5 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <div className="flex justify-end space-x-2 sm:space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-4 py-2 rounded-md text-white/80 hover:bg-white/10 transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 sm:px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailDialog; 