import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import EpicPage from './pages/EpicPage';
import ApodPage from './pages/ApodPage';
import TimeTravelPage from './pages/TimeTravelPage';
import ImageComparatorPage from './pages/ImageComparatorPage';
import ExplainPage from './pages/ExplainPage';
import WeatherPage from './pages/WeatherPage';
import BriefingPage from './pages/BriefingPage';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/epic" element={<EpicPage />} />
          <Route path="/apod" element={<ApodPage />} />
          <Route path="/time-travel" element={<TimeTravelPage />} />
          <Route path="/compare" element={<ImageComparatorPage />} />
          <Route path="/explain" element={<ExplainPage />} />
          <Route path="/weather" element={<WeatherPage />} />
          <Route path="/briefing" element={<BriefingPage />} />
        </Routes>
        <Toaster position="bottom-right" />
      </div>
    </Router>
  );
};

export default App;
