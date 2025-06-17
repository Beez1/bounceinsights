import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import EpicPage from './pages/EpicPage';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/epic" element={<EpicPage />} />
      </Routes>
    </>
  );
}

export default App;
