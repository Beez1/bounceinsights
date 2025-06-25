import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import SearchAnalyzePage from './pages/SearchAnalyzePage';
import WeatherContextPage from './pages/WeatherContextPage';

const App = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/search-analyze" element={<SearchAnalyzePage />} />
        <Route path="/weather-context" element={<WeatherContextPage />} />
      </Routes>
      <Toaster position="bottom-right" />
    </div>
  );
};

export default App;
