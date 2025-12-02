import React, { useMemo, useState, useEffect, useRef } from "react";
import './MazeGame.css';
import labyrinthBg from './assetler/arkaplşan.jpg';
import stoneBg from './assetler/arkaplan.png';
import door1 from './assetler/1.png';
import door2 from './assetler/2.png';
import door3 from './assetler/3.png';
import door4 from './assetler/4.png';
import door5 from './assetler/5.png';
import door6 from './assetler/6.png';
import openDoor1 from './assetlerCevap/1y.png';
import openDoor2 from './assetlerCevap/2y.png';
import openDoor3 from './assetlerCevap/3y.png';
import openDoor4 from './assetlerCevap/4y.png';
import openDoor5 from './assetlerCevap/5y.png';
import openDoor6 from './assetlerCevap/6y.png';
import maleCharacter from './assets/maleCharacter-removebg-preview.png';
import femaleCharacter from './assets/FemaleCHaracater-removebg-preview.png';
import { useNavigate } from 'react-router-dom';
import questionBgMusic from './assetler/maze-game-assets/arkaplaMusic.mp3'; // Background music for question screen
import doorOpenSound from './assetler/maze-game-assets/yenikapigicirtisi.mp3'; // Door opening sound
import correctSound from './assetler/maze-game-assets/başarı melodisi.mp3'; // Correct answer sound
import wrongSound from './assetler/maze-game-assets/üzgün müzik.mp3'; // Wrong answer sound
import { mazeGameQuestions } from './questionDbMazeGame';
const QUESTIONS_PER_CATEGORY = 2;
const QUESTION_TIME_LIMIT = 120;


const IMAGES = {
  labyrinthBackground: labyrinthBg,
  stoneWallBackground: stoneBg,
  characters: {
    male: maleCharacter,
    female: femaleCharacter,
  },
  openDoors: {
    wood: openDoor1,
    marble: openDoor2,
    iron: openDoor3,
    bronze: openDoor4,
    copper: openDoor5,
    gold: openDoor6,
  },
  doors: {
    bronze: door4,
    copper: door5,
    gold: door6,
    iron: door3,
    marble: door2,
    wood: door1,
  },
};

const STARTING_POSITION = { x: 70, y: 520 };

const CATEGORIES = [
  {
    name: "Coğrafi Keşifler",
    doorTexture: IMAGES.doors.bronze,
    doorType: "bronze",
    icon: "🌍",
    position: { x: 200, y: 255 },
    questions: mazeGameQuestions["Coğrafi Keşifler"],
  },
  {
    name: "Reform",
    doorTexture: IMAGES.doors.copper,
    doorType: "copper",
    icon: "⛪",
    position: { x: 775, y: 150 },
    questions: mazeGameQuestions["Reform"],
  },
  {
    name: "Rönesans",
    doorTexture: IMAGES.doors.marble,
    doorType: "marble",
    icon: "🎨",
    position: { x: 560, y: 500 },
    questions: mazeGameQuestions["Rönesans"],
  },
  {
    name: "Aydınlanma Çağı",
    doorTexture: IMAGES.doors.gold,
    doorType: "gold",
    icon: "💡",
    position: { x: 400, y: 307 },
    questions: mazeGameQuestions["Aydınlanma Çağı"],
  },
  {
    name: "Sanayi İnkılabı",
    doorTexture: IMAGES.doors.wood,
    doorType: "wood",
    icon: "🏭",
    position: { x: 172, y: 480 },
    questions: mazeGameQuestions["Sanayi İnkılabı"],
  },
  {
    name: "Fransız İhtilali",
    doorTexture: IMAGES.doors.iron,
    doorType: "iron",
    icon: "🗽",
    position: { x: 770, y: 455 },
    questions: mazeGameQuestions["Fransız İhtilali"],
  },
];

function pickRandomQuestionIndex(qLen, exclude = null) {
  if (qLen <= 1) return 0;
  let idx = Math.floor(Math.random() * qLen);
  if (idx === exclude) idx = (idx + 1) % qLen;
  return idx;
}

const Timer = ({ timeLeft, isWarning }) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  return (
    <div style={{
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      background: isWarning ? 'rgba(220, 38, 38, 0.95)' : 'rgba(55, 65, 81, 0.95)',
      color: 'white',
      padding: '1rem 1.5rem',
      borderRadius: '1rem',
      fontSize: '1.5rem',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      zIndex: 50,
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
      animation: isWarning ? 'pulse 1s infinite' : 'none'
    }}>
      <span style={{ fontSize: '1.75rem' }}>⏱️</span>
      <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
    </div>
  );
};

const Door = ({ doorTexture, icon, name, onClick, isSelected, isOpening, isDisappearing }) => {
  return (
    <button
      onClick={onClick}
      className={`door-button normal ${isSelected ? 'is-selected' : ''} ${isDisappearing ? 'is-disappearing' : ''}`}
    >
      <div 
        className="door-container" 
        style={{ backgroundImage: `url(${doorTexture})` }}
      >
        <div className="door-overlay" /> 
        
        <div 
          className={`door-panel-left ${isOpening ? 'door-open' : ''}`}
          style={{ backgroundImage: `url(${doorTexture})` }}
        />
        
        <div className="door-arch-decoration">
          <svg width="100%" height="100%" viewBox="0 0 100 30">
            <path d="M 10 30 Q 50 5 90 30" stroke="rgba(0,0,0,0.4)" fill="none" strokeWidth="3" />
          </svg>
        </div>
        
        {icon && (
          <div className="door-icon">
            {icon}
          </div>
        )}
      </div>
      
      {name && (
        <div className="door-label-container">
          <div className="door-label-text">
            <p>{name}</p>
          </div>
        </div>
      )}
      
      <>
        <div className="door-candle-left">🕯️</div>
        <div className="door-candle-right">🕯️</div>
      </>
    </button>
  );
};

const AnswerDoor = ({ option, letter, isSelected, isCorrect, onClick, disabled, isOpening, doorType }) => {
  let statusClass = '';
  if (isSelected && isCorrect) {
    statusClass = 'is-selected is-correct';
  } else if (isSelected && !isCorrect) {
    statusClass = 'is-selected is-wrong';
  }
  
  const displayImage = isSelected && isCorrect ? IMAGES.openDoors[doorType] : IMAGES.doors[doorType];
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`answer-door-button ${statusClass} ${disabled && !isSelected ? 'disabled-unselected' : 'hoverable'}`}
      style={{ backgroundImage: `url(${displayImage})` }}
    >
      <div className="answer-door-overlay" />
      
      <div className="answer-door-content">
        <div className="answer-door-mini-container">
          <div 
            className="answer-door-mini"
            style={{ backgroundImage: `url(${displayImage})` }}
          >
            <div 
              className={`answer-door-mini-panel-left ${isOpening ? 'door-open' : ''}`}
              style={{ backgroundImage: `url(${displayImage})` }}
            />
            
            <div 
              className={`answer-door-mini-panel-right ${isOpening ? 'door-open-right' : ''}`}
              style={{ backgroundImage: `url(${displayImage})` }}
            >
              <div className="answer-door-mini-knob" />
            </div>
          </div>
        </div>
        
        {!isSelected && (
          <div className="answer-door-letter-badge">
            {letter}
          </div>
        )}
        
        {isSelected && (
          <div className={`answer-door-result-text ${isCorrect ? 'correct' : 'wrong'}`}>
            {isCorrect ? (
              <>
                <div className="result-icon-large">✅</div>
                <p>Bir sonraki tura geçmeye hazırsın!</p>
              </>
            ) : (
              <>
                <div className="result-icon-large">❌</div>
                <p>Yanlış!</p>
              </>
            )}
          </div>
        )}
        
        {!isSelected && (
          <span className="answer-door-option-text">{option}</span>
        )}
      </div>
      
      {isOpening && (
        <div className="answer-door-opening-light" />
      )}
    </button>
  );
};

const PlayerScoreBoard = ({ currentPlayer, player1Score, player2Score, player1Wrong, player2Wrong }) => {
  return (
    <div className="player-scoreboard">
      <div className={`player-score ${currentPlayer === 1 ? 'active' : ''}`}>
        <div className="player-avatar">👨</div>
        <div className="player-info">
          <span className="player-name">Oyuncu 1</span>
          <div className="player-stats">
            <span className="player-points correct">✅ {player1Score}</span>
            <span className="player-points wrong">❌ {player1Wrong}</span>
          </div>
        </div>
      </div>
      <div className={`player-score ${currentPlayer === 2 ? 'active' : ''}`}>
        <div className="player-avatar">👩</div>
        <div className="player-info">
          <span className="player-name">Oyuncu 2</span>
          <div className="player-stats">
            <span className="player-points correct">✅ {player2Score}</span>
            <span className="player-points wrong">❌ {player2Wrong}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function MazeGame() {
  // Audio refs
  const navigate = useNavigate(); // Add this line right after your state declarations
  const questionBgMusicRef = useRef(null);
  const doorOpenSoundRef = useRef(null);
  const correctSoundRef = useRef(null);
  const wrongSoundRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
  const shuffledCategories = useMemo(() => {
    const positions = CATEGORIES.map(cat => cat.position);
    const shuffledPositions = [...positions].sort(() => Math.random() - 0.5);
    return CATEGORIES.map((cat, idx) => ({
      ...cat,
      position: shuffledPositions[idx]
    }));
  }, []);
  
  const catOrder = useMemo(() => {
    return shuffledCategories
      .map((cat, idx) => ({
        idx,
        distance: Math.sqrt(
          Math.pow(cat.position.x - STARTING_POSITION.x, 2) + 
          Math.pow(cat.position.y - STARTING_POSITION.y, 2)
        )
      }))
      .sort((a, b) => a.distance - b.distance)
      .map(item => item.idx);
  }, [shuffledCategories]);
  
  const [catIdx, setCatIdx] = useState(0);
  const [characterPositions, setCharacterPositions] = useState({
    male: STARTING_POSITION,
    female: STARTING_POSITION
  });
  const [questionsCompleted, setQuestionsCompleted] = useState({});
  const [currentQIdx, setCurrentQIdx] = useState(() =>
    pickRandomQuestionIndex(shuffledCategories[catOrder[0]].questions.length)
  );

  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [finished, setFinished] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [doorOpening, setDoorOpening] = useState(false);
  
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [player1Wrong, setPlayer1Wrong] = useState(0);
  const [player2Wrong, setPlayer2Wrong] = useState(0);

  const currentCatId = catOrder[catIdx];
  const currentCat = shuffledCategories[currentCatId];
  const q = currentCat.questions[currentQIdx];
  const currentCatQuestionsCompleted = questionsCompleted[currentCatId] || 0;

  // Initialize audio elements
  useEffect(() => {
    questionBgMusicRef.current = new Audio(questionBgMusic);
    questionBgMusicRef.current.loop = true;
    questionBgMusicRef.current.volume = 0.3; // Adjust volume as needed
    
    doorOpenSoundRef.current = new Audio(doorOpenSound);
    doorOpenSoundRef.current.volume = 0.5;
    doorOpenSoundRef.current.preload = 'auto';
    doorOpenSoundRef.current.load(); // Preload the audio
    
    correctSoundRef.current = new Audio(correctSound);
    correctSoundRef.current.volume = 0.6;
    correctSoundRef.current.preload = 'auto';
    correctSoundRef.current.load();
    
    wrongSoundRef.current = new Audio(wrongSound);
    wrongSoundRef.current.volume = 0.6;
    wrongSoundRef.current.preload = 'auto';
    wrongSoundRef.current.load();

    return () => {
      // Cleanup audio on unmount
      if (questionBgMusicRef.current) {
        questionBgMusicRef.current.pause();
        questionBgMusicRef.current = null;
      }
      if (doorOpenSoundRef.current) doorOpenSoundRef.current = null;
      if (correctSoundRef.current) correctSoundRef.current = null;
      if (wrongSoundRef.current) wrongSoundRef.current = null;
    };
  }, []);

  // Timer effect
useEffect(() => {
  if (showQuestion && selected === null && timeLeft > 0) {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up - treat as wrong answer
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }
}, [showQuestion, selected, timeLeft]);

  // Handle question background music
  useEffect(() => {
    if (showQuestion && questionBgMusicRef.current) {
      questionBgMusicRef.current.play().catch(err => console.log("Audio play failed:", err));
    } else if (!showQuestion && questionBgMusicRef.current) {
      questionBgMusicRef.current.pause();
      questionBgMusicRef.current.currentTime = 0;
    }
  }, [showQuestion]);

  const handleTimeUp = () => {
  // Track as wrong answer
  if (currentPlayer === 1) {
    setPlayer1Wrong(player1Wrong + 1);
  } else {
    setPlayer2Wrong(player2Wrong + 1);
  }
  
  // Move to next question
  setTimeout(() => {
    const qLen = currentCat.questions.length;
    const newQIdx = pickRandomQuestionIndex(qLen, currentQIdx);
    setCurrentQIdx(newQIdx);
    setSelected(null);
    setIsCorrect(null);
    setTimeLeft(QUESTION_TIME_LIMIT);
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
  }, 1500);
};

  const handleDoorClick = () => {
    // Play door opening sound IMMEDIATELY - no delays
    if (doorOpenSoundRef.current) {
      doorOpenSoundRef.current.currentTime = 0;
      doorOpenSoundRef.current.play().catch(err => {
        console.log("Door sound failed:", err);
      });
    }
    
    // Start animations immediately (no delay)
    const targetPos = currentCat.position;
    setCharacterPositions({
      male: targetPos,
      female: targetPos
    });
    
    setIsOpening(true);
    
    // Transition to question screen after animation
    setTimeout(() => {
      setShowQuestion(true);
      setIsOpening(false);
      setTimeLeft(QUESTION_TIME_LIMIT);
    }, 700);
  };

  const pick = (i) => {
    if (selected !== null) return;
    const ok = i === q.correctIndex;
    setSelected(i);
    setIsCorrect(ok);
    
    // Play correct or wrong sound
    if (ok) {
      setDoorOpening(true);
      if (doorOpenSoundRef.current) {
        doorOpenSoundRef.current.currentTime = 0;
        doorOpenSoundRef.current.play().catch(err => console.log("Door sound failed:", err));
      }
      if (correctSoundRef.current) {
        correctSoundRef.current.currentTime = 0;
        correctSoundRef.current.play().catch(err => console.log("Correct sound failed:", err));
      }
    } else {
      if (wrongSoundRef.current) {
        wrongSoundRef.current.currentTime = 0;
        wrongSoundRef.current.play().catch(err => console.log("Wrong sound failed:", err));
      }
    }
  };

  const next = () => {
    setDoorOpening(false);
    
    if (isCorrect) {
      if (currentPlayer === 1) {
        setPlayer1Score(player1Score + 1);
      } else {
        setPlayer2Score(player2Score + 1);
      }
      
      const newCompleted = { ...questionsCompleted, [currentCatId]: (questionsCompleted[currentCatId] || 0) + 1 };
      setQuestionsCompleted(newCompleted);

      if ((newCompleted[currentCatId] || 0) >= QUESTIONS_PER_CATEGORY) {
        if (catIdx < catOrder.length - 1) {
          const nextCatPos = catIdx + 1;
          const nextCatId = catOrder[nextCatPos];
          setCatIdx(nextCatPos);
          setCurrentQIdx(pickRandomQuestionIndex(shuffledCategories[nextCatId].questions.length));
          setSelected(null);
          setIsCorrect(null);
          setTimeLeft(QUESTION_TIME_LIMIT); 
          setShowQuestion(false);
          setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
        } else {
          setFinished(true);
        }
      } else {
        const qLen = currentCat.questions.length;
        const newQIdx = pickRandomQuestionIndex(qLen, currentQIdx);
        setCurrentQIdx(newQIdx);
        setSelected(null);
        setIsCorrect(null);
        setTimeLeft(QUESTION_TIME_LIMIT);
        setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
      }
    } else {
      // Track wrong answer
      if (currentPlayer === 1) {
        setPlayer1Wrong(player1Wrong + 1);
      } else {
        setPlayer2Wrong(player2Wrong + 1);
      }
      
      const qLen = currentCat.questions.length;
      const newQIdx = pickRandomQuestionIndex(qLen, currentQIdx);
      setCurrentQIdx(newQIdx);
      setSelected(null);
      setIsCorrect(null);
      setTimeLeft(QUESTION_TIME_LIMIT);
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    }
  };

  const restart = () => {
    window.location.reload();
  };

  if (finished) {
    const winner = player1Score > player2Score ? "Oyuncu 1" : player2Score > player1Score ? "Oyuncu 2" : "Berabere";
    return (
      <div 
        className="finished-screen-container"
        style={{ '--bg-image': `url(${IMAGES.labyrinthBackground})` }}
      >
        <PlayerScoreBoard currentPlayer={currentPlayer} player1Score={player1Score} player2Score={player2Score} player1Wrong={player1Wrong} player2Wrong={player2Wrong} />
        <div className="finished-popup">
          <h2 className="finished-title">🎉 Tebrikler! 🎉</h2>
          <p className="finished-text">Labirentten başarıyla çıktınız!</p>
          <p className="finished-winner">Kazanan: {winner}</p>
          <p className="finished-score">Oyuncu 1: {player1Score} | Oyuncu 2: {player2Score}</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
            <button
              onClick={restart}
              className="finished-restart-button"
            >
              🔄 Yeniden Başlat
            </button>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1rem'
              }}
            >
              🏠 Ana Menü
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showQuestion) {
    return (
      <div 
        className="question-screen-container"
        style={{ '--bg-image': `url(${IMAGES.stoneWallBackground})` }}
      >
        <button
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          padding: '0.5rem 1rem',
          background: 'rgba(55, 65, 81, 0.9)',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          zIndex: 50
        }}
      >
        🏠 Ana Menü
      </button>
      <Timer timeLeft={timeLeft} isWarning={timeLeft <= 30} />
        <PlayerScoreBoard currentPlayer={currentPlayer} player1Score={player1Score} player2Score={player2Score} player1Wrong={player1Wrong} player2Wrong={player2Wrong} />
        
        <div className="question-popup">
          <div className="question-category-badge-container">
            <div className="question-category-badge">
              <h2 className="question-category-title">{currentCat.icon} {currentCat.name}</h2>
            </div>
          </div>

          <h1 className="question-text">
            {q.question}
          </h1>

          <div className="question-options-grid">
            {q.options.map((opt, i) => (
              <AnswerDoor
                key={i}
                option={opt}
                letter={String.fromCharCode(65 + i)}
                isSelected={selected === i}
                isCorrect={selected === i && isCorrect}
                onClick={() => pick(i)}
                disabled={selected !== null}
                isOpening={selected === i && doorOpening}
                doorType={currentCat.doorType}
              />
            ))}
          </div>

          {isCorrect === true && (
            <div className="correct-message">
              ✅ Doğru! Kapı açıldı!
            </div>
          )}
          {isCorrect === false && (
            <div className="wrong-message">
              ❌ Yanlış! Sırası diğer oyuncuya geçti.
            </div>
          )}

          {selected !== null && (
            <div className="continue-button-container">
              <button
                onClick={next}
                className="continue-button"
              >
                Devam Et
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="labyrinth-screen-container">
      <button
      onClick={() => navigate('/')}
      style={{
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        padding: '0.75rem 1.5rem',
        background: 'rgba(55, 65, 81, 0.9)',
        color: 'white',
        border: 'none',
        borderRadius: '0.5rem',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        zIndex: 50,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
      }}
    >
      🏠 Ana Menü
    </button>

      <PlayerScoreBoard currentPlayer={currentPlayer} player1Score={player1Score} player2Score={player2Score} player1Wrong={player1Wrong} player2Wrong={player2Wrong} />
      
      <div className="labyrinth-content">
        <div className="labyrinth-header">
          <h1 className="labyrinth-title">
            🏰 Labirent Yolculuğu 🏰
          </h1>
          <div className="labyrinth-category-info-container">
            <p className="labyrinth-category-info-text">
              Kategori {catIdx + 1}/{CATEGORIES.length}: {currentCat.icon} {currentCat.name} ({currentCatQuestionsCompleted}/{QUESTIONS_PER_CATEGORY})
            </p>
          </div>
        </div>

        <div 
          className="labyrinth-doors-map"
          style={{ '--map-bg-image': `url(${IMAGES.labyrinthBackground})` }}
        >
          <div 
            className="character-container" 
            style={{ 
              left: `${characterPositions.male.x}px`, 
              top: `${characterPositions.male.y}px`,
              transition: 'left 0.8s ease-in-out, top 0.8s ease-in-out'
            }}
          >
            <img src={IMAGES.characters.male} alt="Player 1" className="character-image male" />
          </div>
          <div 
            className="character-container" 
            style={{ 
              left: `${characterPositions.female.x}px`, 
              top: `${characterPositions.female.y + 30}px`,
              transition: 'left 0.8s ease-in-out, top 0.8s ease-in-out'
            }}
          >
            <img src={IMAGES.characters.female} alt="Player 2" className="character-image female" />
          </div>
          
          {shuffledCategories.map((cat, idx) => {
            const isCurrentCat = idx === currentCatId;
            const catCompletedQuestions = questionsCompleted[idx] || 0;
            const isCatComplete = catCompletedQuestions >= QUESTIONS_PER_CATEGORY;
            
            return (
              <div key={idx} className="door-position" style={{ left: `${cat.position.x}px`, top: `${cat.position.y}px` }}>
                <Door
                  doorTexture={cat.doorTexture}
                  icon={cat.icon}
                  name={cat.name}
                  onClick={isCurrentCat && !isCatComplete ? handleDoorClick : undefined}
                  isSelected={isCurrentCat}
                  isOpening={isCurrentCat && isOpening}
                  isDisappearing={isCatComplete}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}