import { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import RecommendPage from './pages/RecommendPage';
import MenuPage from './pages/MenuPage';
import MapPage from './pages/MapPage';
import AdminPage from './pages/AdminPage';

const MOCK_API_URL = "https://6918349021a96359486f1dee.mockapi.io/api/menues";

function App() {
  const [menuData, setMenuData] = useState([]);
  const [isMenuLoading, setIsMenuLoading] = useState(true);

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const response = await axios.get(MOCK_API_URL);
        setMenuData(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsMenuLoading(false);
      }
    };
    fetchMenuData();
  }, []);

  return (
    <BrowserRouter>
      <div className="page">
        <header className="hero">
          <Link to="/">
            <img src="/header.png" alt="학교 전경" onError={(e) => e.target.style.display = 'none'} />
          </Link>
        </header>

        <NavBar />

        <main className="content">
          <Routes>
            <Route path="/" element={<RecommendPage menuData={menuData} isMenuLoading={isMenuLoading} />} />
            <Route path="/menu" element={<MenuPage menuData={menuData} isMenuLoading={isMenuLoading} />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

function NavBar() {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="menu-buttons">
      <Link to="/"><button className={`menu-btn ${isActive('/') ? 'active' : ''}`}>추천 식단</button></Link>
      <Link to="/menu"><button className={`menu-btn ${isActive('/menu') ? 'active' : ''}`}>오늘의 메뉴</button></Link>
      <Link to="/map"><button className={`menu-btn ${isActive('/map') ? 'active' : ''}`}>지도</button></Link>
      <Link to="/admin"><button className={`menu-btn ${isActive('/admin') ? 'active' : ''}`}>과거 식단 불러오기</button></Link>
    </nav>
  );
}

export default App;
