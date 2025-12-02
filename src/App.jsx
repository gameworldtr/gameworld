import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import MarbleGame from './MarbleGameAssets/MarbleGame';
import MazeGame from './MazeGameFolder/MazeGame';
import Cornhole from './FasulyeGameAssets/fasulye.jsx';
import './App.css';
import { Zap, Target, Castle, Sword } from 'lucide-react';

const MenuContent = () => {
  const navigate = useNavigate();
  
  const games = [
    {
      id: 'marble',
      title: 'Misket Oyunu',
      description: 'Fizik tabanlı strateji oyunu',
      icon: Target,
      path: '/marble',
      glowColor: 'rgba(239, 68, 68, 0.4)',
      accentColor: '#ef4444',
      gradientStart: 'f97316',
      gradientEnd: '#ef4444'
    },
    {
      id: 'maze',
      title: 'Labirent Yolculuğu',
      description: 'Zeka ve hız macerası',
      icon: Castle,
      path: '/maze',
      glowColor: 'rgba(139, 92, 246, 0.4)',
      accentColor: '#8b5cf6',
      gradientStart: 'a855f7',
      gradientEnd: '#8b5cf6'
    },
    {
      id: 'Conrhole',
      title: 'Fasülye Oyun',
      description: 'Yakında geliyor...',
      icon: Sword,
      path: '/fasulye',
      glowColor: 'rgba(20, 184, 166, 0.4)',
      accentColor: '#14b8a6',
      gradientStart: '10b981',
      gradientEnd: '#14b8a6'
    }
  ];
  
  return (
    <div className="main-menu-wrapper-new">
      <div className="menu-grid-bg"></div>
      <div className="menu-particles"></div>

      <div className="menu-content">
        {/* Header */}
        <div className="menu-header">
          <h1 className="menu-title">OYUNLARI SEÇ</h1>
        </div>

        {/* Game Cards */}
        <div className="menu-games-grid">
          {games.map((game, index) => {
            const IconComponent = game.icon;
            return (
              <div
                key={game.id}
                className={`menu-game-card game-${index + 1}`}
                onClick={() => navigate(game.path)}
                style={{
                  '--glow-color': game.glowColor,
                  '--accent-color': game.accentColor
                }}
              >
                <div 
                  className="game-card-accent"
                  style={{
                    background: `linear-gradient(90deg, #${game.gradientStart}, ${game.gradientEnd})`
                  }}
                ></div>

                <div className="game-card-content">
                  <div 
                    className="game-icon-container"
                    style={{
                      background: `linear-gradient(135deg, #${game.gradientStart}, ${game.gradientEnd})`
                    }}
                  >
                    <IconComponent size={50} color="white" strokeWidth={2.5} />
                  </div>

                  <h2 className="game-card-title">{game.title}</h2>
                  <p className="game-card-description">{game.description}</p>

                  <button 
                    className="game-play-button"
                    style={{
                      background: `linear-gradient(135deg, #${game.gradientStart}, ${game.gradientEnd})`
                    }}
                  >
                    <span>OYNA</span>
                    <Zap size={20} />
                  </button>
                </div>

                <div 
                  className="game-corner-accent"
                  style={{
                    background: `linear-gradient(135deg, #${game.gradientStart}, ${game.gradientEnd})`
                  }}
                ></div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
     
      </div>
    </div>
  );
};

const MainMenu = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MenuContent />} />
        <Route path="/marble" element={<MarbleGame />} />
        <Route path="/maze" element={<MazeGame />} />
         <Route path="/fasulye" element={<Cornhole />} />
      </Routes>
    </Router>
  );
};

export default MainMenu;