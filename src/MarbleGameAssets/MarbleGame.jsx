  import React, { useEffect, useRef, useState } from "react";
  import "./MarbleGame.css";
  import historyQuestions from "./marbleGameDb";
  import hitSound from "./MarbleGameAsset/misket sesi.mp3"
  import parkBackground from "./MarbleGameAsset/MainMenu.jpg";
  import sandBackground from "./MarbleGameAsset/Ingame.jpg";
  import { useNavigate } from 'react-router-dom';

  export default function MarbleGame() {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const [answerFeedback, setAnswerFeedback] = useState(null);
    const [running, setRunning] = useState(false);
    const [shotCount, setShotCount] = useState(0);
    const [showNameInput, setShowNameInput] = useState(false);
    const [showQuestion, setShowQuestion] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [selectedBall, setSelectedBall] = useState(null);
    const [tempName, setTempName] = useState("");
    const [questionTimer, setQuestionTimer] = useState(60);
    const [gameEnded, setGameEnded] = useState(false);
    const [players, setPlayers] = useState([]);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [turnComplete, setTurnComplete] = useState(false);
    const [marblesCaptured, setMarblesCaptured] = useState(0);
    const [showStart, setShowStart] = useState(true);
    const [hasShot, setHasShot] = useState(false);
    const [shotUsed, setShotUsed] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);
    const audioRef = useRef(null);
    const [usedQuestions, setUsedQuestions] = useState([]);
    const [turnStartScore, setTurnStartScore] = useState(0);

    const cfg = useRef({
      width: 1600,
      height: 900,
      shooterRadius: 18,
      targetRadius: 18,
      wallRestitution: 0.88,
      friction: 0.995,
      maxPower: 1000,
      pitX: 1200,
      pitY: 520,
      pitRadius: 100,
      shootLine: 500,
      barrierLeft: 50,
      barrierRight: 1500,
      barrierTop: 300,
      barrierBottom: 770, 
    });

    const questions = historyQuestions;
    const ballColors = [
      { color: "#ff9999", name: "Kırmızı", points: 1 },
      { color: "#ffcc99", name: "Turuncu", points: 1 },
      { color: "#99ff99", name: "Yeşil", points: 1 },
      { color: "#99ccff", name: "Mavi", points: 1 },
    ];

    const world = useRef({
      shooter: null,
      balls: [],
      aiming: false,
      aimStart: { x: 0, y: 0 },
      aimEnd: { x: 0, y: 0 },
      ballsHit: false,
    });

    useEffect(() => {
      if (showQuestion && questionTimer > 0) {
        const interval = setInterval(() => {
          setQuestionTimer(t => {
            if (t <= 1) {
              handleTimeout();
              return 60;
            }
            return t - 1;
          });
        }, 1000);
        return () => clearInterval(interval);
      }
    }, [showQuestion, questionTimer]);
   
    useEffect(() => {
  audioRef.current = new Audio(hitSound);
  audioRef.current.volume = 0.5; // Adjust volume (0.0 to 1.0)
  
  return () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };
}, []);

    const handleTimeout = () => {
      const updatedPlayers = [...players];
      updatedPlayers[currentPlayerIndex].score -= 1;
      updatedPlayers[currentPlayerIndex].wrong += 1;
      setPlayers(updatedPlayers);
      if (selectedBall) {
        selectedBall.answered = true;
      }
      setShowQuestion(false);
      setCurrentQuestion(null);
      setSelectedBall(null);
      setQuestionTimer(60);
      setTimeout(() => checkTurnCompletion(), 200);
    };

    const handleStartGame = () => {
      setShowStart(false);
      setShowNameInput(true);
    };

    const handleNameSubmit = (e) => {
      e.preventDefault();
      if (tempName.trim()) {
        const existingPlayer = players.find(p => p.name.toLowerCase() === tempName.trim().toLowerCase());
        
        if (existingPlayer) {
          const index = players.indexOf(existingPlayer);
          setCurrentPlayerIndex(index);
          setTurnStartScore(existingPlayer.score);
        } else {
          const newPlayer = {
            name: tempName.trim(),
            score: 0,
            correct: 0,
            wrong: 0
          };
          setPlayers(prev => [...prev, newPlayer]);
          setCurrentPlayerIndex(players.length);
          setTurnStartScore(0);
        }
        setUsedQuestions([]);
        setShowNameInput(false);
        setTempName("");
        setTurnComplete(false);
        setMarblesCaptured(0);
        setShotCount(0);
        setHasShot(false);
        setShotUsed(false);
        resetLevel();
        setRunning(true);
      }
    };

    const isOutsidePit = (ball) => {
      const { pitX, pitY, pitRadius } = cfg.current;
      const dist = Math.hypot(ball.x - pitX, ball.y - pitY);
      return dist > pitRadius + ball.r;
    };

  const handleBallClick = (ball) => {
  if (showQuestion) return;
  
  const ballSpeed = magnitude(ball.vx, ball.vy);
  const outside = isOutsidePit(ball);
  
  // Check if ALL balls have stopped moving
  const allBallsStopped = world.current.balls.every(b => magnitude(b.vx, b.vy) < 0.5);
  
  if (outside && !ball.isShooter && ballSpeed < 0.5 && !ball.answered && allBallsStopped) {
    setSelectedBall(ball);

    const availableQuestions = questions.filter((q, idx) => !usedQuestions.includes(idx));
    const questionsToUse = availableQuestions.length > 0 ? availableQuestions : questions;
    const randomQ = questionsToUse[Math.floor(Math.random() * questionsToUse.length)];
    const questionIndex = questions.indexOf(randomQ);
    
    setUsedQuestions(prev => [...prev, questionIndex]);
    setCurrentQuestion(randomQ);
    setShowQuestion(true);
    setRunning(false);
    setQuestionTimer(60);
  }
};

    const checkTurnCompletion = () => {
      const unansweredBalls = world.current.balls.filter(b => 
        !b.isShooter && isOutsidePit(b) && !b.answered && magnitude(b.vx, b.vy) < 0.5
      );
      
      if (unansweredBalls.length === 0 && shotUsed) {
        setTurnComplete(true);
        setRunning(false);
      } else if (unansweredBalls.length > 0) {
        setRunning(true);
      }
    };

  const handleAnswer = (answerIndex) => {
  const updatedPlayers = [...players];
  const isCorrect = currentQuestion && answerIndex === currentQuestion.correct;
  
  if (isCorrect) {
    updatedPlayers[currentPlayerIndex].score += selectedBall.points;
    updatedPlayers[currentPlayerIndex].correct += 1;
    setMarblesCaptured(m => m + 1);
    selectedBall.answered = true;
    selectedBall.captured = true;
    setAnswerFeedback('correct'); // Add this line
  } else {
    updatedPlayers[currentPlayerIndex].score -= 1;
    updatedPlayers[currentPlayerIndex].wrong += 1;
    selectedBall.answered = true;
    setAnswerFeedback('wrong'); // Add this line
  }
  
  setPlayers(updatedPlayers);
  
  // Delay closing the modal to show feedback
  setTimeout(() => {
    setShowQuestion(false);
    setCurrentQuestion(null);
    setSelectedBall(null);
    setQuestionTimer(60);
    setAnswerFeedback(null); // Reset feedback
    setTimeout(() => checkTurnCompletion(), 200);
  }, 1500); // Show feedback for 1.5 seconds
};
    const handleNextPlayer = () => {
      setUsedQuestions([]);
      setShowNameInput(true);
    };
    const playHitSound = () => {
  if (audioRef.current) {
    // Clone and play to allow multiple simultaneous sounds
    const sound = audioRef.current.cloneNode();
    sound.volume = 0.5;
    sound.play().catch(err => console.log("Audio play failed:", err));
  }
};
    function mulberry32(a) {
      return function () {
        var t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }

    const resetLevel = () => {
  setUsedQuestions([]);
  let ps = mulberry32(Date.now());
  const { width, height, shooterRadius, targetRadius, pitX, pitY, pitRadius, shootLine } = cfg.current;

  const shooter = {
    x: shootLine,
    y: height / 2,
    vx: 0,
    vy: 0,
    r: shooterRadius,
    color: "#ffffff",
    isShooter: true,
  };

  const balls = [];
  const angleStep = (Math.PI * 2) / 4;
  
  for (let i = 0; i < 4; i++) {
    const angle = i * angleStep + ps() * 0.3;
    const distance = pitRadius * (0.4 + ps() * 0.3);
    const colorData = ballColors[i];
    
    balls.push({
      x: pitX + Math.cos(angle) * distance,
      y: pitY + Math.sin(angle) * distance,
      vx: 0,
      vy: 0,
      r: targetRadius,
      color: colorData.color,
      colorName: colorData.name,
      points: colorData.points,
      isShooter: false,
      answered: false,
      captured: false,
      questionAssigned: false,
      hasLeftPit: false  // **ADD THIS LINE**
    });
  }

  world.current = {
    shooter,
    balls,
    aiming: false,
    aimStart: { x: 0, y: 0 },
    aimEnd: { x: 0, y: 0 },
    ballsHit: false,
  };
};

    useEffect(() => {
      if (!showNameInput && !gameEnded && !showStart) {
        resetLevel();
      }
    }, [showNameInput, gameEnded, showStart]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || showNameInput || gameEnded || showStart) return;

      const ctx = canvas.getContext("2d");
      const dpr = window.devicePixelRatio || 1;
      const { width, height } = cfg.current;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      canvas.style.background = "transparent";
      ctx.scale(dpr, dpr);

      let raf;

      const tick = () => {
        if (running) physicsStep(1 / 60);
        draw();
        raf = requestAnimationFrame(tick);
      };

      const onMouseDown = (e) => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const s = world.current.shooter;
        
        for (const b of world.current.balls) {
          const dist2 = (mx - b.x) ** 2 + (my - b.y) ** 2;
          if (dist2 <= (b.r + 10) ** 2) {
            handleBallClick(b);
            return;
          }
        }
        
        if (shotUsed) return;
        
        const dist2 = (mx - s.x) ** 2 + (my - s.y) ** 2;
        if (dist2 <= (s.r + 20) ** 2 && magnitude(s.vx, s.vy) < 5) {
          world.current.aiming = true;
          world.current.aimStart = { x: s.x, y: s.y };
          world.current.aimEnd = { x: mx, y: my };
        }
      };

      const onMouseMove = (e) => {
        if (!world.current.aiming) return;
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        world.current.aimEnd = { x: mx, y: my };
      };

      const onMouseUp = () => {
        if (!world.current.aiming || shotUsed) return;
        const { aimStart, aimEnd } = world.current;
        let dx = aimStart.x - aimEnd.x;
        let dy = aimStart.y - aimEnd.y;
        const len = Math.min(cfg.current.maxPower, Math.hypot(dx, dy));
        
        if (len > 5) {
          const k = 1.2;
          const s = world.current.shooter;
          s.vx = (dx / (len === 0 ? 1 : Math.hypot(dx, dy))) * len * k;
          s.vy = (dy / (len === 0 ? 1 : Math.hypot(dx, dy))) * len * k;
          setShotCount((c) => c + 1);
          setHasShot(true);
          setShotUsed(true);
          world.current.ballsHit = false;
        }
        
        world.current.aiming = false;
      };

      canvas.addEventListener("mousedown", onMouseDown);
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);

      tick();

      return () => {
        cancelAnimationFrame(raf);
        canvas.removeEventListener("mousedown", onMouseDown);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };
    }, [running, showNameInput, gameEnded, showStart, shotUsed, showQuestion]);

    function magnitude(x, y) {
      return Math.sqrt(x * x + y * y);
    }

    function physicsStep(dt) {
  const { width, height, wallRestitution, friction, shootLine, barrierLeft, barrierRight, barrierTop, barrierBottom, pitX, pitY, pitRadius } = cfg.current;
  const { shooter, balls } = world.current;
  const all = [shooter, ...balls];

  for (const b of all) {
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.vx *= friction;
    b.vy *= friction;

    // **NEW: Track if ball has left the pit**
    if (!b.isShooter) {
      const distToPit = Math.hypot(b.x - pitX, b.y - pitY);
      const isOutside = distToPit > pitRadius + b.r;
      
      // Mark ball as having left the pit
      if (isOutside && !b.hasLeftPit) {
        b.hasLeftPit = true;
      }
      
      // Only prevent re-entry if ball has already left
      if (b.hasLeftPit) {
        const minDistToPit = pitRadius + b.r;
        
        if (distToPit < minDistToPit) {
          // Push the ball out of the pit
          const angle = Math.atan2(b.y - pitY, b.x - pitX);
          b.x = pitX + Math.cos(angle) * minDistToPit;
          b.y = pitY + Math.sin(angle) * minDistToPit;
          
          // Bounce off the pit edge
          const normalX = Math.cos(angle);
          const normalY = Math.sin(angle);
          const dot = b.vx * normalX + b.vy * normalY;
          b.vx = (b.vx - 2 * dot * normalX) * wallRestitution;
          b.vy = (b.vy - 2 * dot * normalY) * wallRestitution;
        }
      }
    }

    // Wall collisions
    if (b.x - b.r < barrierLeft) {
      b.x = barrierLeft + b.r;
      b.vx = -b.vx * wallRestitution;
    } else if (b.x + b.r > barrierRight) {
      b.x = barrierRight - b.r;
      b.vx = -b.vx * wallRestitution;
    }
    if (b.y - b.r < barrierTop) {
      b.y = barrierTop + b.r;
      b.vy = -b.vy * wallRestitution;
    } else if (b.y + b.r > barrierBottom) {
      b.y = barrierBottom - b.r;
      b.vy = -b.vy * wallRestitution;
    }

    // Shooter return logic
    if (b.isShooter && b.x < shootLine + 5 && magnitude(b.vx, b.vy) < 2) {
      b.x = shootLine;
      b.y = height / 2;
      b.vx = 0;
      b.vy = 0;
      
      if (hasShot && shotUsed) {
        setHasShot(false);
        setTimeout(() => checkTurnCompletion(), 500);
      }
    }

    if (Math.abs(b.vx) < 0.1) b.vx = 0;
    if (Math.abs(b.vy) < 0.1) b.vy = 0;
  }

  // Ball-to-ball collision code remains the same
  for (let i = 0; i < all.length; i++) {
    for (let j = i + 1; j < all.length; j++) {
      const a = all[i];
      const b = all[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy);
      const minDist = a.r + b.r;
      if (dist > 0 && dist < minDist) {
        const overlap = minDist - dist;
        const nx = dx / dist;
        const ny = dy / dist;
        a.x -= nx * (overlap / 2);
        a.y -= ny * (overlap / 2);
        b.x += nx * (overlap / 2);
        b.y += ny * (overlap / 2);

        const avn = a.vx * nx + a.vy * ny;
        const bvn = b.vx * nx + b.vy * ny;
        const avnAfter = bvn;
        const bvnAfter = avn;
        const at = { x: a.vx - avn * nx, y: a.vy - avn * ny };
        const bt = { x: b.vx - bvn * nx, y: b.vy - bvn * ny };
        a.vx = at.x + avnAfter * nx;
        a.vy = at.y + avnAfter * ny;
        b.vx = bt.x + bvnAfter * nx;
        b.vy = bt.y + bvnAfter * ny;

        const collisionSpeed = Math.hypot(a.vx - b.vx, a.vy - b.vy);
        if (collisionSpeed > 5) { // Only play if collision is strong enough
          playHitSound();
        }

        if (a.isShooter || b.isShooter) {
          world.current.ballsHit = true;
        }
      }
    }
  }
}

    function draw() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const { width, height, pitX, pitY, pitRadius } = cfg.current;
      const { shooter, balls, aiming, aimStart, aimEnd } = world.current;

      ctx.clearRect(0, 0, width, height);

      // Transparent background - let the background image show through
      
      // Draw pit with shadow
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 10;
      
      ctx.fillStyle = "rgba(101, 67, 33, 0.9)";
      ctx.beginPath();
      ctx.arc(pitX, pitY, pitRadius, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Pit border
      ctx.strokeStyle = "#8B4513";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(pitX, pitY, pitRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Inner pit gradient
      const innerGrad = ctx.createRadialGradient(pitX, pitY, pitRadius * 0.3, pitX, pitY, pitRadius);
      innerGrad.addColorStop(0, "rgba(0, 0, 0, 0.7)");
      innerGrad.addColorStop(1, "rgba(0, 0, 0, 0.3)");
      ctx.fillStyle = innerGrad;
      ctx.beginPath();
      ctx.arc(pitX, pitY, pitRadius, 0, Math.PI * 2);
      ctx.fill();

      // Player info card - moved to top left
      if (players.length > 0) {
        const currentPlayer = players[currentPlayerIndex];
        
        const cardGrad = ctx.createLinearGradient(10, 10, 10, 110);
        cardGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
        cardGrad.addColorStop(1, "rgba(249, 250, 251, 0.95)");
        ctx.fillStyle = cardGrad;
        ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
        ctx.shadowBlur = 15;
        ctx.shadowOffsetY = 5;
        ctx.beginPath();
        ctx.roundRect(10, 10, 280, 90, 15);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(10, 10, 280, 90, 15);
        ctx.stroke();
        
        ctx.fillStyle = "#1f2937";
        ctx.font = "bold 20px Arial";
        ctx.fillText(`👤 ${currentPlayer.name}`, 25, 40);
        ctx.font = "16px Arial";
        ctx.fillText(`✓ ${currentPlayer.correct} | ✗ ${currentPlayer.wrong}`, 25, 70);
      }

      // Aiming line and power meter
      if (aiming && !shotUsed) {
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 5;
        ctx.shadowColor = "#ef4444";
        ctx.shadowBlur = 15;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(aimStart.x, aimStart.y);
        ctx.lineTo(aimEnd.x, aimEnd.y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;

        const power = Math.min(cfg.current.maxPower, Math.hypot(aimStart.x - aimEnd.x, aimStart.y - aimEnd.y));
        const powerPercent = power / cfg.current.maxPower;
        
        const powerGrad = ctx.createLinearGradient(width - 230, height - 45, width - 30, height - 45);
        powerGrad.addColorStop(0, "#10b981");
        powerGrad.addColorStop(0.5, "#fbbf24");
        powerGrad.addColorStop(1, "#ef4444");
        ctx.fillStyle = powerGrad;
        ctx.beginPath();
        ctx.roundRect(width - 230, height - 45, powerPercent * 200, 25, 5);
        ctx.fill();
        
        ctx.strokeStyle = "#1f2937";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(width - 230, height - 45, 200, 25, 5);
        ctx.stroke();
        
        ctx.fillStyle = "#1f2937";
        ctx.font = "bold 14px Arial";
        ctx.fillText("💪 Güç", width - 280, height - 24);
      }

      drawBall(ctx, shooter);
      for (const b of balls) {
        if (!b.captured) {
          drawBall(ctx, b);
        }
      }
    }

    function drawBall(ctx, b) {
      ctx.beginPath();
      ctx.arc(b.x, b.y + 2, b.r + 3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fill();
      
      const g = ctx.createRadialGradient(b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.1, b.x, b.y, b.r);
      g.addColorStop(0, "#ffffff");
      g.addColorStop(0.25, b.color);
      g.addColorStop(0.7, b.color);
      g.addColorStop(1, shadeColor(b.color, -30));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.beginPath();
      ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.3, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = "rgba(0,0,0,0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.stroke();
    }

    function shadeColor(color, percent) {
      const num = parseInt(color.replace("#",""), 16);
      const amt = Math.round(2.55 * percent);
      const R = Math.max(0, Math.min(255, (num >> 16) + amt));
      const G = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amt));
      const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
      return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    const handleEndGame = () => {
      setGameEnded(true);
      setRunning(false);
    };

    if (showStart) {
    return (
      <div className="marble-game-container">
      <div className="start-screen" style={{ backgroundImage: `url(${parkBackground})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="card">
          {/* ADD THIS BUTTON */}
            <button
          onClick={() => navigate('/')}
          style={{
            marginBottom: '1rem',
            padding: '0.5rem 1rem',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          🏠 Ana Menü
        </button>
          
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div className="title-icon">🎯</div>
            <h1 className="title">Misket Oyunu</h1>
            <p className="subtitle">Eğlenceli ve öğretici misket oyununa hoş geldiniz!</p>
          </div>
          <button onClick={handleStartGame} className="btn-primary">
            🎮 Oyuna Başla
          </button>
        </div>
      </div>
      </div>
    );
  }


    if (showNameInput) {
      return (
        <div className="marble-game-container">
        <div className="name-input-screen" style={{ backgroundImage: `url(${parkBackground})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="card card-small">
           <button
          onClick={() => navigate('/')}
          style={{
            marginBottom: '1rem',
            padding: '0.75rem 1.5rem',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            margin: '0 auto 1.5rem auto'
          }}
        >
          🏠 Ana Menü
        </button>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '1.5rem', background: 'linear-gradient(to right, #d97706, #ea580c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              👤 Oyuncu Girişi
            </h1>
            {players.length > 0 && (
              <div className="registered-players">
                <p className="registered-players-title">📋 Kayıtlı Oyuncular:</p>
                <div className="player-buttons">
                  {players.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setTempName(p.name)}
                      className="player-btn"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <form onSubmit={handleNameSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">İsminizi girin:</label>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="form-input"
                  placeholder="İsminiz..."
                  autoFocus
                />
              </div>
              <button type="submit" className="btn-success">
                ✅ Başlat
              </button>
            </form>
          </div>
        </div>
        </div>
      );
    }

    if (gameEnded) {
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    return (
      <div className="marble-game-container">
      <div className="game-end-screen" style={{ backgroundImage: `url(${parkBackground})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div className="title-icon">🎉</div>
            <h1 className="title end-title">Oyun Sona Erdi!</h1>
            <p className="subtitle end-subtitle">Tebrikler! İşte sonuçlar:</p>
          </div>
            
            <div className="scoreboard">
              <h2 className="scoreboard-title">🏆 Skor Tablosu</h2>
              <div className="player-list">
                {sortedPlayers.map((player, idx) => (
                  <div
                    key={idx}
                    className={`player-card rank-${idx === 0 ? '1' : idx === 1 ? '2' : idx === 2 ? '3' : 'other'}`}
                  >
                    <div className="player-info">
                      <span className="player-rank">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`}
                      </span>
                      <span className="player-name">{player.name}</span>
                    </div>
                    <div className="player-score">
                      <div className="score-number">{player.score} puan</div>
                      <div className="player-stats">✓ {player.correct} | ✗ {player.wrong}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
            <button
              onClick={() => {
                setGameEnded(false);
                setPlayers([]);
                setCurrentPlayerIndex(0);
                setShowStart(true);
                setTurnComplete(false);
                setMarblesCaptured(0);
                setShotCount(0);
                setHasShot(false);
                setShotUsed(false);
              }}
              className="btn-new-game"
            >
              🔄 Yeni Oyun
            </button>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              🏠 Ana Menüye Dön
            </button>
          </div>
        </div>
      </div>
      </div>
      );
    }

    return (
      <div className="marble-game-container">
      <div className="game-screen" style={{ backgroundImage: `url(${sandBackground})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="game-container">
          <div className="game-main">
            <div className="game-controls">
              <button
              onClick={() => navigate('/')}
              className="btn-control"
              style={{ background: '#6b7280' }}
            >
              🏠 Ana Menü
            </button>
              <button
                onClick={() => setRunning((v) => !v)}
                className="btn-control btn-pause"
              >
                {running ? "⏸ Durdur" : "▶ Devam"}
              </button>
              <button
                onClick={() => {
               const updatedPlayers = [...players];
              const scoreChange = updatedPlayers[currentPlayerIndex].score - turnStartScore;
              updatedPlayers[currentPlayerIndex].score = turnStartScore;
              updatedPlayers[currentPlayerIndex].correct -= marblesCaptured;
              updatedPlayers[currentPlayerIndex].wrong -= (scoreChange < 0 ? Math.abs(scoreChange) - marblesCaptured : 0);
              setPlayers(updatedPlayers);
              
              resetLevel();
              setTurnComplete(false);
              setMarblesCaptured(0);
              setShotCount(0);
              setHasShot(false);
              setShotUsed(false);
                }}
                className="btn-control btn-reset"
              >
                🔄 Sıfırla
              </button>
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="btn-control btn-info"
              >
                📖 Nasıl Oynanır
              </button>
              <button
                onClick={handleEndGame}
                className="btn-control btn-end"
              >
                🏁 Oyunu Bitir
              </button>
            </div>

            <div className="canvas-container">
              <canvas ref={canvasRef} style={{ display: 'block', borderRadius: '15px' }} />
            </div>

            {showInstructions && (
              <div className="instructions-card">
                <button 
                  onClick={() => setShowInstructions(false)}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    cursor: 'pointer',
                    fontSize: '18px',
                    fontWeight: 'bold'
                  }}
                >
                  ×
                </button>
                <p className="instructions-title">
                  <span style={{ fontSize: '1.5rem' }}>📖</span> Nasıl Oynanır
                </p>
                <ul className="instructions-list">
                  <li className="instruction-item">
                    <span className="instruction-icon">🎯</span>
                    <span>Mavi misketin üzerine tıkla, geriye çek ve bırakarak fırlat</span>
                  </li>
                  <li className="instruction-item">
                    <span className="instruction-icon">⚠️</span>
                    <span>Her turda sadece 1 atış hakkınız var!</span>
                  </li>
                  <li className="instruction-item">
                    <span className="instruction-icon">🎪</span>
                    <span>Kuyunun içindeki renkli misketlere çarparak onları dışarı çıkar</span>
                  </li>
                  <li className="instruction-item">
                    <span className="instruction-icon">❓</span>
                    <span>Dışarı çıkan misketlere tıklayarak soruları cevapla (30 saniye)</span>
                  </li>
                  <li className="instruction-item">
                    <span className="instruction-icon">✅</span>
                    <span>Doğru cevap: Misketi kazan (+1 puan) | ❌ Yanlış: -1 puan</span>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {players.length > 0 && (
            <div className="scoreboard-sidebar">
              <h2 className="sidebar-title">
                <span style={{ fontSize: '1.875rem' }}>🏆</span> Skor Tablosu
              </h2>
              <div className="sidebar-player-list">
                {[...players].sort((a, b) => b.score - a.score).map((player, idx) => {
                  const isCurrentPlayer = player.name === players[currentPlayerIndex]?.name;
                  return (
                    <div
                      key={idx}
                      className={`player-card rank-${idx === 0 ? '1' : idx === 1 ? '2' : idx === 2 ? '3' : 'other'}${isCurrentPlayer ? ' current-player-ring' : ''}`}
                    >
                      <div className="player-info">
                        <span className="player-rank">
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`}
                        </span>
                        <div>
                          <div className="player-name">{player.name}</div>
                          <div className="player-stats">✓ {player.correct} | ✗ {player.wrong}</div>
                        </div>
                      </div>
                      <div className="player-score">
                        <div style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>{player.score}</div>
                        <div className="score-label">puan</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {turnComplete && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <div className="modal-icon">🎊</div>
                <h2 className="modal-title">Tur Tamamlandı!</h2>
              </div>
              <p className="modal-text">
                Tebrikler, <span style={{ fontWeight: 'bold', color: '#d97706' }}>{marblesCaptured}</span> misket kazandınız!
              </p>
              <div className="modal-info">
                <p style={{ textAlign: 'center', color: '#374151' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>{players[currentPlayerIndex]?.name}</span>
                </p>
                <p style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold', color: '#d97706', marginTop: '0.5rem' }}>
                  Toplam Puan: {players[currentPlayerIndex]?.score}
                </p>
              </div>
              <button onClick={handleNextPlayer} className="btn-next-player">
                👤 Sıradaki Oyuncu
              </button>
            </div>
          </div>
        )}

        {showQuestion && currentQuestion && (
  <div className="modal-overlay">
    <div className={`modal-content question-modal${answerFeedback ? ' answer-feedback' : ''}`}>
      {answerFeedback && (
        <div className={`feedback-overlay ${answerFeedback}`}>
          <div className="feedback-icon">
            {answerFeedback === 'correct' ? '✅' : '❌'}
          </div>
          <div className="feedback-text">
            {answerFeedback === 'correct' ? 'Doğru!' : 'Yanlış!'}
          </div>
        </div>
      )}
      <div className="question-header">
        <h2 className="question-title">❓ Soru</h2>
        <div className={`question-timer${questionTimer <= 5 ? ' warning' : ''}`}>
          ⏱ {questionTimer}s
        </div>
      </div>
      <p className="question-text">{currentQuestion.question}</p>
      <div className="answer-buttons">
        {currentQuestion.answers.map((answer, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(idx)}
            className="answer-btn"
            disabled={answerFeedback !== null}
          >
            <span className="answer-number">{idx + 1}</span>
            {answer}
          </button>
        ))}
      </div>
    </div>
  </div>
)}
      </div>
      </div>
    );
  }
