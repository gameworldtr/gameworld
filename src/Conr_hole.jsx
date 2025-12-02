import React, { useEffect, useMemo, useRef, useState } from "react";
const SCALE = 4.5;      // sürükleme -> hız çarpanı (ARTTIRILDI)
const MAX_SPEED = 1250;     // başlangıç hızı üst sınırı (px/s)

// Projectile Quiz Game — v29
// GÜNCELLEME: Hedef şekiller büyütülmüş haliyle korundu. Merkezi alanın genişliği
// orijinaline (280px margin) geri döndürüldü ve gri arkaplan ekranın en altına uzatıldı.

const QUESTION_BANK = {
  "Kolay": [
    { type: 'mcq', q: "Türkiye'nin başkenti hangisidir?", a: ["İstanbul", "İzmir", "Ankara", "Bursa"], correct: 2 },
    { type: 'tf', q: "Dünya, Güneş etrafında döner.", correct: true },
    {
      type: 'matching',
      q: "Hayvanları ve seslerini eşleştirin.",
      pairs: [["Kedi", "Miyav"], ["Köpek", "Hav"], ["Kuş", "Cik"], ["İnek", "Möö"], ["Koyun", "Mee"]]
    }
  ],
  "Kolay-Orta": [
    { type: 'mcq', q: "Bir bayt kaç bittir?", a: ["4", "8", "16", "32"], correct: 1 },
    { type: 'tf', q: "Everest Dağı, dünyanın en yüksek dağıdır.", correct: true },
    {
      type: 'matching',
      q: "Meyveleri ve renklerini eşleştirin.",
      pairs: [["Muz", "Sarı"], ["Çilek", "Kırmızı"], ["Portakal", "Turuncu"], ["Kivi", "Yeşil"], ["Üzüm", "Mor"]]
    }
  ],
  "Orta": [
    { type: 'mcq', q: "Hangi gezegen 'Kızıl Gezegen' olarak bilinir?", a: ["Venüs", "Mars", "Jüpiter", "Satürn"], correct: 1 },
    { type: 'tf', q: "Su, H2O2 formülü ile gösterilir.", correct: false },
    {
      type: 'matching',
      q: "Elementleri ve sembollerini eşleştirin.",
      pairs: [["Altın", "Au"], ["Gümüş", "Ag"], ["Demir", "Fe"], ["Oksijen", "O"], ["Hidrojen", "H"]]
    }
  ],
  "Orta-Zor": [
    { type: 'mcq', q: "Sesin havadaki hızı yaklaşık ne kadardır?", a: ["343 m/s", "1500 m/s", "300,000 km/s", "1235 km/h"], correct: 0 },
    { type: 'tf', q: "Tüm memeliler karada yaşar.", correct: false },
  ],
  "Zor": [
    { type: 'mcq', q: "İkinci Dünya Savaşı hangi yıl başlamıştır?", a: ["1935", "1939", "1941", "1945"], correct: 1 },
    { type: 'tf', q: "Mona Lisa tablosunu Leonardo da Vinci yapmıştır.", correct: true },
    {
      type: 'matching',
      q: "Yazarları ve en bilinen eserlerini eşleştirin.",
      pairs: [["Homeros", "İlyada"], ["Shakespeare", "Hamlet"], ["Tolstoy", "Savaş ve Barış"], ["Dostoyevski", "Suç ve Ceza"], ["Cervantes", "Don Kişot"]]
    }
  ],
  "Çok Zor": [
    { type: 'mcq', q: "Schrödinger denklemi hangi alanın temel bir parçasıdır?", a: ["Genel Görelilik", "Termodinamik", "Kuantum Mekaniği", "Klasik Mekanik"], correct: 2 },
    { type: 'tf', q: "Heisenberg'in Belirsizlik İlkesi, bir parçacığın hem konumunun hem de momentumunun aynı anda tam olarak bilinemeyeceğini belirtir.", correct: true },
  ]
};

const DIFF_POINTS = {
  "Kolay": 1,
  "Kolay-Orta": 2,
  "Orta": 3,
  "Orta-Zor": 4,
  "Zor": 5,
  "Çok Zor": 6,
};

// Şekil boyutları büyütülmüş haliyle korundu.
const SHAPES = [
  { key: "hex", label: "Altıgen", color: "#facc15", diff: "Çok Zor", points: 6, sides: 6, size: 100 },
  { key: "square", label: "Kare", color: "#22c55e", diff: "Zor", points: 5, sides: 4, size: 110 },
  { key: "pent", label: "Beşgen", color: "#f472b6", diff: "Orta-Zor", points: 5, sides: 5, size: 120 },
  { key: "tri", label: "Üçgen", color: "#ef4444", diff: "Orta", points: 3, sides: 3, size: 135 },
  { key: "circle", label: "Yuvarlak", color: "#3b82f6", diff: "Kolay-Orta", points: 2, sides: 0, size: 150 },
  { key: "rect", label: "Dikdörtgen", color: "#2dd4bf", diff: "Kolay", points: 1, sides: 4, size: 170, rect: true },
];

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function TrajectoryPreview({ points }) {
  if (!points || points.length < 2) {
    return null;
  }
  const pathData = points.map((p, i) => ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}).join(' ');

  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{ zIndex: 9999 }}
    >
      <svg width="100%" height="100%">
        <path
          d={pathData}
          stroke="#0f172a"
          strokeWidth="3"
          fill="none"
          strokeDasharray="2 6"
          strokeLinecap="round"
          opacity={0.5}
        />
      </svg>
    </div>
  );
}

// Soru tiplerini yönetecek bileşen
function QuestionModal({ qItem, captured, timeLeft, feedback, onAnswer }) {
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [userPairs, setUserPairs] = useState([]);

  const shuffledRight = useMemo(() => {
    if (qItem && qItem.type === 'matching') {
      const rightSide = qItem.pairs.map(p => p[1]);
      return rightSide.sort(() => Math.random() - 0.5);
    }
    return [];
  }, [qItem]);

  useEffect(() => {
    setSelectedLeft(null);
    setUserPairs([]);
  }, [qItem]);

  const handleLeftClick = (index, item) => {
    if (feedback) return;
    setSelectedLeft({ index, item });
  };

  const handleRightClick = (index, item) => {
    if (selectedLeft === null || feedback) return;
    if (userPairs.some(p => p.right.index === index)) return;

    setUserPairs([...userPairs, { left: selectedLeft, right: { index, item } }]);
    setSelectedLeft(null);
  };

  const checkMatchingAnswers = () => {
    if (userPairs.length !== qItem.pairs.length) return;
    const correctMap = new Map(qItem.pairs);
    let correctCount = 0;
    userPairs.forEach(pair => {
      if (correctMap.get(pair.left.item) === pair.right.item) {
        correctCount++;
      }
    });
    onAnswer(correctCount === qItem.pairs.length);
  };

  const getPairingStatusClass = (side, index) => {
    if (selectedLeft && side === 'left' && selectedLeft.index === index) {
      return 'bg-yellow-300';
    }
    if (userPairs.some(p => p[side].index === index)) {
      return 'bg-gray-300 opacity-70';
    }
    return 'hover:bg-slate-50';
  }


  const renderQuestion = () => {
    switch (qItem.type) {
      case 'tf':
        return (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button onClick={() => onAnswer(true)} disabled={!!feedback} className="px-3 py-2 rounded-lg border hover:bg-slate-50 text-left disabled:opacity-50">Doğru</button>
            <button onClick={() => onAnswer(false)} disabled={!!feedback} className="px-3 py-2 rounded-lg border hover:bg-slate-50 text-left disabled:opacity-50">Yanlış</button>
          </div>
        );
      case 'matching':
        const leftSide = qItem.pairs.map(p => p[0]);
        return (
          <div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                {leftSide.map((item, index) => (
                  <button
                    key={left-${index}}
                    onClick={() => handleLeftClick(index, item)}
                    disabled={userPairs.some(p => p.left.index === index) || !!feedback}
                    className={p-2 border rounded-lg text-sm text-center transition-colors ${getPairingStatusClass('left', index)}}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                {shuffledRight.map((item, index) => (
                  <button
                    key={right-${index}}
                    onClick={() => handleRightClick(index, item)}
                    disabled={userPairs.some(p => p.right.index === index) || !!feedback}
                    className={p-2 border rounded-lg text-sm text-center transition-colors ${getPairingStatusClass('right', index)}}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            {userPairs.length === qItem.pairs.length && !feedback && (
              <button
                onClick={checkMatchingAnswers}
                className="mt-4 w-full px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Cevapları Kontrol Et
              </button>
            )}
          </div>
        );
      case 'mcq':
      default:
        return (
          <div className="mt-3 grid grid-cols-1 gap-2">
            {qItem.a.map((opt, i) => (
              <button key={i}
                onClick={() => onAnswer(i)}
                disabled={!!feedback}
                className="px-3 py-2 rounded-lg border hover:bg-slate-50 text-left disabled:opacity-50"
              >{opt}</button>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md rounded-2xl border-8 bg-white p-4 shadow-xl relative" style={{ borderColor: captured.color }}>
        <div className="absolute top-2 right-2">
          <div className="relative w-12 h-12">
            <svg className="w-full h-full" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
              <circle className="text-gray-200" cx="18" cy="18" r="15.9155" fill="transparent" stroke="currentColor" strokeWidth="3.5" />
              <circle
                className={timeLeft <= 5 ? "text-red-600" : "text-indigo-600"}
                style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
                cx="18" cy="18" r="15.9155" fill="transparent" stroke="currentColor" strokeWidth="3.5"
                strokeDasharray="100" strokeDashoffset={100 - (timeLeft / 45) * 100} strokeLinecap="round"
              />
            </svg>
            <div className={absolute inset-0 flex items-center justify-center text-lg font-bold ${timeLeft <= 5 ? "text-red-600" : "text-gray-800"}}>
              {timeLeft}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Soru • {qItem.diff} ({DIFF_POINTS[qItem.diff]} puan)</h2>
        </div>
        <div className="mt-3 flex items-center justify-center">
          <ShapePreview shape={captured} size={120} />
        </div>
        <p className="mt-3 text-slate-800">{qItem.q}</p>
        {renderQuestion()}
        {feedback && (
          <div className={mt-3 text-sm font-medium ${feedback.startsWith("Doğru") ? "text-emerald-600" : "text-rose-600"}}>
            {feedback}
          </div>
        )}
      </div>
    </div>
  );
}


export default function GameProjectileQuiz() {
  const containerRef = useRef(null);
  const [playerNames, setPlayerNames] = useState({ 1: "", 2: "" });
  const [gameStarted, setGameStarted] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [pScore, setPScore] = useState({ 1: 0, 2: 0 });
  const [pShots, setPShots] = useState({ 1: 0, 2: 0 });
  const [pCorrect, setPCorrect] = useState({ 1: 0, 2: 0 });
  const [pWrong, setPWrong] = useState({ 1: 0, 2: 0 });
  const [round, setRound] = useState(1);
  const [turnsInRound, setTurnsInRound] = useState(0);
  const [showEnd, setShowEnd] = useState(false);
  const [note, setNote] = useState(null);
  const [previewPoints, setPreviewPoints] = useState([]);
  const [powerPct, setPowerPct] = useState(0);
  const [world] = useState({ width: 1536, height: 780, gravity: 980 });
  const [captured, setCaptured] = useState(null);
  const [showQ, setShowQ] = useState(false);
  const [qItem, setQItem] = useState(null);
  const [qOwner, setQOwner] = useState(1);
  const [feedback, setFeedback] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  const spawnLeft = { x: 120, y: world.height - 180 };
  const spawnRight = { x: world.width - 120, y: world.height - 180 };

  const [ball, setBall] = useState({ x: spawnLeft.x, y: spawnLeft.y - 120, r: 20, vx: 0, vy: 0, inFlight: false, owner: 1 });
  const [drag, setDrag] = useState({ active: false, sx: 0, sy: 0, cx: 0, cy: 0, pointerId: null });

  // DEĞİŞİKLİKLER UYGULANDI:
  // 1. Duvar/Alan genişliği 280px margin'de korundu.
  // 2. Şekillerin dikey yayılımı biraz artırıldı.
  const layout = useMemo(() => {
    // Merkezi alan genişliğini koru (280px margin)
    const wallLeftX = 280;
    const wallRightX = world.width - 280;
    const playAreaWidth = wallRightX - wallLeftX;

    // 3 Sütun için X konumları (merkezden)
    const colXs = [
      wallLeftX + (playAreaWidth * 0.20), // Sütun 1
      wallLeftX + (playAreaWidth * 0.50), // Sütun 2
      wallLeftX + (playAreaWidth * 0.80), // Sütun 3
    ];

    // YENİ: Şekilleri dikeyde daha fazla yaymak için Y konumları ayarlandı.
    const wallTopY = (world.height / 2) - 100; // 240
    const wallBottomY = world.height - 180; // 600
    const playAreaCenterY = (wallTopY + wallBottomY) / 2; // 420
    const verticalSeparation = 130; // Merkezi ayırma mesafesi artırıldı (önce 100)

    const row1Y = playAreaCenterY - verticalSeparation; // Üst satır Y (420 - 130 = 290)
    const row2Y = playAreaCenterY + verticalSeparation; // Alt satır Y (420 + 130 = 550)

    // "kaydırma" (jitter) miktarı korundu
    const jitters = [
      { x: -10, y: 5 },  // hex
      { x: 20, y: -10 }, // square
      { x: -15, y: 15 }, // pent
      { x: 15, y: -5 },  // tri
      { x: -20, y: 10 }, // circle
      { x: 10, y: -15 }, // rect
    ];

    const topRowShapes = SHAPES.slice(0, 3);
    const bottomRowShapes = SHAPES.slice(3, 6);

    const mapShape = (s, indexInRow, yPos) => {
      const x = colXs[indexInRow];
      const y = yPos;
      const originalIndex = SHAPES.findIndex(shape => shape.key === s.key);
      const jitter = jitters[originalIndex] || { x: 0, y: 0 };
      const w = s.rect ? Math.round(s.size * 1.5) : s.size;
      const h = s.rect ? Math.round(s.size * 0.9) : s.size;
      const cx = x + jitter.x;
      const cy = y + jitter.y;
      const outerR = Math.min(w, h) / 2 - 2;
      return { ...s, x: cx, y: cy, w, h, cx, cy, outerR };
    };

    const topLayout = topRowShapes.map((s, i) => mapShape(s, i, row1Y));
    const bottomLayout = bottomRowShapes.map((s, i) => mapShape(s, i, row2Y));

    return [...topLayout, ...bottomLayout];

  }, [world.height, world.width]);


  const finishTurnAndMaybeNextRound = () => {
    setTurnsInRound((t) => {
      const nt = t + 1;
      if (nt >= 2) {
        setRound((r) => r + 1);
        return 0;
      }
      return nt;
    });
  };

  const switchToOtherPlayer = (currOwner) => {
    const nextP = currOwner === 1 ? 2 : 1;
    const spawn = nextP === 1 ? spawnLeft : spawnRight;
    setCurrentPlayer(nextP);
    setBall({ x: spawn.x, y: spawn.y - 120, r: 20, vx: 0, vy: 0, inFlight: false, owner: nextP });
  };

  const onPointerDown = (e) => {
    if (ball.inFlight || showQ || showEnd) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dx = x - ball.x;
    const dy = y - ball.y;
    if (dx * dx + dy * dy <= (ball.r + 24) * (ball.r + 24)) {
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { }
      setDrag({ active: true, sx: x, sy: y, cx: x, cy: y, pointerId: e.pointerId });
      setFeedback(null);
      setPreviewPoints([]);
    }
  };

  const onPointerMove = (e) => {
    if (!drag.active) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDrag((d) => {
      const nd = { ...d, cx: x, cy: y };
      const dx = nd.cx - nd.sx;
      const dy = nd.cy - nd.sy;
      let vx0 = -(dx) * SCALE;
      let vy0 = -(dy) * SCALE;
      const sp = Math.hypot(vx0, vy0);
      if (sp > MAX_SPEED && sp > 0) {
        const k = MAX_SPEED / sp;
        vx0 *= k; vy0 *= k;
      }
      const pct = Math.round(Math.min(sp, MAX_SPEED) / MAX_SPEED * 100);
      setPowerPct(pct);
      const pts = predictTrajectory(ball.x, ball.y, vx0, vy0, world.gravity, world.width, world.height);
      setPreviewPoints(pts);
      return nd;
    });
  };

  function releaseShot() {
    if (!drag.active) return;
    const dx = drag.cx - drag.sx;
    const dy = drag.cy - drag.sy;
    let vx = -(dx) * SCALE;
    let vy = -(dy) * SCALE;
    const sp = Math.hypot(vx, vy);
    if (sp > MAX_SPEED && sp > 0) {
      const k = MAX_SPEED / sp;
      vx *= k; vy *= k;
    }
    setBall((b) => ({ ...b, vx, vy, inFlight: true }));
    setDrag({ active: false, sx: 0, sy: 0, cx: 0, cy: 0, pointerId: null });
    setPreviewPoints([]);
    setPowerPct(0);
    setPShots((ps) => ({ ...ps, [currentPlayer]: ps[currentPlayer] + 1 }));
  }

  const onPointerUp = (e) => {
    if (drag.pointerId != null) {
      try { e.currentTarget.releasePointerCapture(drag.pointerId); } catch { }
    }
    releaseShot();
  };

  const onPointerCancel = () => {
    setDrag({ active: false, sx: 0, sy: 0, cx: 0, cy: 0, pointerId: null });
    setPreviewPoints([]);
  };

  useEffect(() => {
    let mounted = true;
    let last = performance.now();
    const tick = (now) => {
      if (!mounted) return;
      const dt = (now - last) / 1000;
      last = now;
      setBall((b) => {
        if (!b.inFlight || showQ || showEnd) return b;
        let { x, y, vx, vy, r } = b;

        // FİZİK DEĞİŞMİYOR
        vy += world.gravity * dt;
        x += vx * dt;
        y += vy * dt;
        const damping = 0.8;

        // Duvarların fiziksel sınırları (KORUNDU)
        const wallLeftX = 280 - 20;
        const wallRightX = world.width - 235;
        const wallTopY = (world.height / 2) - 100 - 50; // (240)
        const wallBottomY = world.height; // (780)

        // Duvar çarpışma kontrolü (Güncellendi: Sadece Geri Sekmeyi Uygular - Konum düzeltmesi yok)
        if (y + r > wallTopY && y - r < wallBottomY) {
          // Sol duvara çarpma (x < 280 sınırını geçtiyse ve sola gidiyorsa)
          if (x - r < wallRightX && vx < 0) {
            vx = -vx * damping; // Hızı ters çevir (Geri Sekme)
          }
          // Sağ duvara çarpma (x > 1256 sınırını geçtiyse ve sağa gidiyorsa)
          if (x + r > wallLeftX && vx > 0) {
            vx = -vx * damping; // Hızı ters çevir (Geri Sekme)
          }
        }

        // Mevcut dünya sınırı kontrolleri (KORUNDU)
        if (x - r < 0) { x = r; vx = -vx * damping; }
        if (x + r > world.width) { x = world.width - r; vx = -vx * damping; }
        if (y - r < 0) { y = r; vy = -vy * damping; }

        if (y - r > world.height + 80) {
          setPScore((ps) => ({ ...ps, [b.owner]: ps[b.owner] - 1 }));
          const ownerName = playerNames[b.owner] || P${b.owner};
          setNote(${ownerName}: -1 puan);
          setTimeout(() => setNote(null), 1200);
          finishTurnAndMaybeNextRound();
          switchToOtherPlayer(b.owner);
          return { ...b, inFlight: false };
        }
        let hit = null;
        for (let i = 0; i < layout.length; i++) {
          const s = layout[i];
          if (pointHitsShape(x, y, s)) { hit = s; break; }
        }
        if (hit) {
          openQuestion(hit, b.owner);
          switchToOtherPlayer(b.owner);
          return { ...b, inFlight: false };
        }
        return { ...b, x, y, vx, vy };
      });
      requestAnimationFrame(tick);
    };
    const raf = requestAnimationFrame(tick);
    return () => { mounted = false; cancelAnimationFrame(raf); };
  }, [world.gravity, world.width, world.height, layout, playerNames, showQ, showEnd]);

  useEffect(() => {
    if (!showQ || timeLeft === null) return;
    if (timeLeft <= 0) {
      handleTimeUp();
      return;
    }
    const timerId = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [showQ, timeLeft]);

  function openQuestion(shape, ownerWhoShot) {
    const pool = QUESTION_BANK[shape.diff] || [];
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setQItem({ ...pick, diff: shape.diff });
    setCaptured(shape);
    setQOwner(ownerWhoShot);
    setShowQ(true);
    setTimeLeft(45);
  }

  function handleTimeUp() {
    if (!qItem || feedback) return;
    setFeedback("Süre doldu! :(");
    setPWrong((pw) => ({ ...pw, [qOwner]: pw[qOwner] + 1 }));
    setTimeout(() => {
      setShowQ(false);
      setFeedback(null);
      setQItem(null);
      setCaptured(null);
      setTimeLeft(null);
      finishTurnAndMaybeNextRound();
    }, 1200);
  }

  function handleAnswer(result) {
    if (!qItem || feedback) return;
    setTimeLeft(null);

    let isCorrect = false;
    switch (qItem.type) {
      case 'mcq':
        isCorrect = result === qItem.correct;
        break;
      case 'tf':
        isCorrect = result === qItem.correct;
        break;
      case 'matching':
        isCorrect = result;
        break;
      default:
        break;
    }

    setFeedback(isCorrect ? "Doğru!" : "Yanlış :(");

    if (isCorrect) {
      setPScore((ps) => ({ ...ps, [qOwner]: ps[qOwner] + (DIFF_POINTS[qItem.diff] || 0) }));
      setPCorrect((pc) => ({ ...pc, [qOwner]: pc[qOwner] + 1 }));
    } else {
      setPWrong((pw) => ({ ...pw, [qOwner]: pw[qOwner] + 1 }));
    }

    setTimeout(() => {
      setShowQ(false);
      setFeedback(null);
      setQItem(null);
      setCaptured(null);
      finishTurnAndMaybeNextRound();
    }, 900);
  }

  if (!gameStarted && !showEnd) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-sky-100 to-sky-300 p-4">
        <h1 className="text-4xl font-black tracking-tight mb-6">🎯 Fasulye Oyunu</h1>
        <div className="w-full flex flex-col max-w-sm bg-white/90 backdrop-blur rounded-2xl shadow p-4">
          <div className="flex flex-row gap-x-2">
            <div className="bg-[url(./assets/kırmızı_yastik.png)] bg-cover">
              <div className="size-60 object-contain" />
              <label className="text-sm text-slate-600">Oyuncu 1</label>
              <input
                className="w-full px-3 py-2 rounded-lg border mb-3"
                placeholder="P1 ismi"
                value={playerNames[1]}
                onChange={(e) => setPlayerNames((pn) => ({ ...pn, 1: e.target.value }))}
              />
            </div>
            <div className="bg-[url(./assets/mavi_yastik).png] bg-cover">
              <label className="text-sm text-slate-600">Oyuncu 2</label>
              <input
                className="w-full px-3 py-2 rounded-lg border mb-4"
                placeholder="P2 ismi"
                value={playerNames[2]}
                onChange={(e) => setPlayerNames((pn) => ({ ...pn, 2: e.target.value }))}
              />
            </div>
          </div>
          <button
            disabled={!playerNames[1] || !playerNames[2]}
            onClick={() => setGameStarted(true)}
            className="w-full px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Oyuna Başla
          </button>
        </div>
        <p className="mt-4 text-xs text-slate-700 opacity-80">İpucu: Topu sürükleyip bırak.</p>
      </div>
    );
  }

  if (showEnd) {
    const n1 = playerNames[1] || "P1";
    const n2 = playerNames[2] || "P2";

    let winnerMessage;
    if (pScore[1] > pScore[2]) {
      winnerMessage = ${n1} Kazandı!;
    } else if (pScore[2] > pScore[1]) {
      winnerMessage = ${n2} Kazandı!;
    } else {
      winnerMessage = "Berabere!";
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[url(./assets/arkaplan.jpg)] bg-cover">
        <h1 className="text-3xl font-bold mb-2 text-white drop-shadow-lg">🏁 Oyun Bitti</h1>
        <h2 className="text-4xl font-bold mb-4 text-amber-400 drop-shadow-lg">{winnerMessage}</h2>
        <p className="text-sm text-slate-200 mb-6 drop-shadow">Toplam Tur: {round - 1}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
          <SummaryCard playerIndex={1} title={n1} score={pScore[1]} correct={pCorrect[1]} wrong={pWrong[1]} imageUrl="./assets/kırmızı_yastik.png" />
          <SummaryCard playerIndex={2} title={n2} score={pScore[2]} correct={pCorrect[2]} wrong={pWrong[2]} imageUrl="./assets/mavi_yastik.png" />
        </div>
        <div className="mt-6 flex gap-3">
          <button className="px-4 py-2 rounded-xl border bg-white/80 backdrop-blur hover:bg-white" onClick={() => setShowEnd(false)}>
            Geri Dön
          </button>
          <button
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
            onClick={() => {
              setPScore({ 1: 0, 2: 0 });
              setPShots({ 1: 0, 2: 0 });
              setPCorrect({ 1: 0, 2: 0 });
              setPWrong({ 1: 0, 2: 0 });
              setRound(1);
              setTurnsInRound(0);
              setCurrentPlayer(1);
              setBall({ x: spawnLeft.x, y: spawnLeft.y - 120, r: 20, vx: 0, vy: 0, inFlight: false, owner: 1 });
              setShowEnd(false);
              setGameStarted(true);
            }}
          >
            Yeni Oyun
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="w-full flex flex-col items-center gap-3 select-none">
      <div className="w-full max-w-[1536px] flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Fasulye Oyunu 🎯</h1>
        <div className="flex items-center gap-x-3 text-sm">
          <div className="px-3 py-1 rounded-xl bg-indigo-600 text-white">
            <div>Tur: <b>{round}</b></div>
            <div>Sıradaki: <b>{playerNames[currentPlayer] || P${currentPlayer}}</b></div>
          </div>
          <HudPill label={playerNames[1] || "P1"} score={pScore[1]} shots={pShots[1]} correct={pCorrect[1]} wrong={pWrong[1]} color={"bg-red-800"} />
          <HudPill label={playerNames[2] || "P2"} score={pScore[2]} shots={pShots[2]} correct={pCorrect[2]} wrong={pWrong[2]} color={"bg-blue-800"} />
          <div className="flex flex-col gap-1 py-2">
            <button
              className="px-3 py-1 rounded-lg border text-slate-700 hover:bg-slate-100"
              onClick={() => {
                setPScore({ 1: 0, 2: 0 });
                setPShots({ 1: 0, 2: 0 });
                setPCorrect({ 1: 0, 2: 0 });
                setPWrong({ 1: 0, 2: 0 });
                setCurrentPlayer(1);
                setRound(1);
                setTurnsInRound(0);
                setBall({ x: spawnLeft.x, y: spawnLeft.y - 120, r: 20, vx: 0, vy: 0, inFlight: false, owner: 1 });
              }}
            >
              Sıfırla
            </button>
            <button className="px-3 py-1 rounded-lg border text-rose-600 hover:bg-rose-50" onClick={() => setShowEnd(true)}>
              Oyunu Bitir
            </button>
          </div>
        </div>
      </div>

      <Legend />

      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        className="relative w-full max-w-[1536px] h-[780px] mx-auto rounded-2xl overflow-hidden shadow-inner bg-[url(./assets/arkaplan.jpg)] bg-cover"
      >
        {drag.active && (
          <div className="absolute right-4 top-4 w-40 z-40">
            <div className="mb-1 text-[10px] text-slate-700 bg-white/70 w-max px-2 py-[2px] rounded">
              Güç: {powerPct}%
            </div>
            <div className="h-3 rounded-full bg-white/70 border border-slate-300 shadow-inner overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500"
                style={{ width: ${powerPct}% }}
              />
            </div>
          </div>
        )}

        {/* GÜNCELLENDİ: Yatay Gri Alan (Ekranın en altına kadar uzatıldı) */}
        <div
          className="absolute z-10"
          style={{
            left: 280, // Sol duvarın sağı (KORUNDU)
            right: 280, // Sağ duvarın solu (KORUNDU)
            top: (world.height / 2) - 150, // wallTopY (240)
            // YENİ YÜKSEKLİK: Ekranın en altına (world.height = 780) kadar uzatıldı.
            height: world.height - ((world.height / 2) - 150), // 780 - 240 = 540px
            background: "rgba(100,116,139, 0.8)" // Gri alan
          }}
        />

        {/* Duvarların Görselleri (KORUNDU) */}
        <div
          className="absolute bg-slate-800 z-20 rounded-l-md"
          style={{
            left: 280 - 20,
            width: 20,
            top: (world.height / 2) - 100 - 50, // wallTopY (240)
            height: (world.height) - ((world.height / 2) - 100 - 50) // (780 - 240 = 540)
          }}
        />
        <div
          className="absolute bg-slate-800 z-20 rounded-r-md"
          style={{
            left: world.width - 280,
            width: 20,
            top: (world.height / 2) - 100 - 50, // wallTopY (240)
            height: (world.height) - ((world.height / 2) - 100 - 50) // (540)
          }}
        />

        {layout.map((s) => (
          <SVGShape key={s.key} {...s} />
        ))}

        {/* Fırlatma alanları (Değişmedi) */}
        <div
          className="absolute z-20 bottom-0 left-2 -inset-1 rotate-30 scale-125 bg-cover bg-[url(./assets/dolu_kırmızı.png)]"
          style={{ top: spawnLeft.y, width: spawnLeft.x + 20 }}
        />
        <div
          className="absolute z-20 bottom-0 left-[89%] -inset-1 -rotate-30 scale-110 bg-cover bg-[url(./assets/dolu_mavi.png)]"
          style={{ top: spawnRight.y, width: world.width - spawnRight.x + 20 }}
        />

        <div
          className={absolute bg-cover z-30 ${ball.owner === 1 ? 'bg-[url(./assets/kırmızı_yastik.png)]' : 'bg-[url(./assets/mavi_yastik.png)]'}}
          style={{ left: ball.x - ball.r, top: ball.y - ball.r, width: ball.r * 2, height: ball.r * 2 }}
        />

        {drag.active && (
          <svg className="pointer-events-none absolute inset-0 z-40">
            <line x1={drag.sx} y1={drag.sy} x2={drag.cx} y2={drag.cy} stroke="#1f2937" strokeDasharray="4 4" strokeWidth="2" />
            <circle cx={drag.sx} cy={drag.sy} r="6" fill="#1f2937" />
          </svg>
        )}

        {note && (
          <div className="absolute left-4 top-4 text-sm bg-black/70 text-white px-3 py-1 rounded-lg shadow z-40">
            {note}
          </div>
        )}

        <TrajectoryPreview points={previewPoints} />
      </div>

      {showQ && qItem && captured && (
        <QuestionModal
          qItem={qItem}
          captured={captured}
          timeLeft={timeLeft}
          feedback={feedback}
          onAnswer={handleAnswer}
        />
      )}
    </div>
  );
}

function HudPill({ label, score, shots, correct, wrong, color }) {
  return (
    <div className={px-3 py-1 rounded-xl ${color} text-white  flex flex-col}>
      <div className="font-bold">{label}</div>
      <div className="flex gap-2">
        <span>Skor: <b>{score}</b></span>
        <span>Atış: <b>{shots}</b></span>
        <span>✓ <b>{correct}</b></span>
        <span>✗ <b>{wrong}</b></span>
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="w-full max-w-[1536px] grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
      {SHAPES.map((s) => (
        <div key={s.key} className="flex items-center gap-2 p-2 rounded-xl bg-white shadow">
          <div className="w-4 h-4" style={{ backgroundColor: s.color, borderRadius: s.sides === 0 ? 9999 : 4 }} />
          <div className="flex flex-col leading-tight">
            <span className="font-medium">{s.label}</span>
            <span className="text-[10px] opacity-70">{s.diff} · {s.points} puan</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function SummaryCard({ title, score, correct, wrong, playerIndex, imageUrl }) {
  return (
    <div className={rounded-2xl p-4 bg-[url(${imageUrl})] bg-cover shadow-lg backdrop-blur-sm flex flex-col items-center}>
      <div className="size-60 object-contain" />
      <div className="text-xl font-bold text-slate-200">{title}</div>
      <div className="mt-2 w-full grid grid-cols-2 gap-2 text-sm text-slate-300">
        <div className={rounded-lg border border-slate-300 p-2}>Toplam Puan: <b>{score}</b></div>
        <div className={rounded-lg border border-slate-300 p-2}>Doğru: <b>{correct}</b></div>
        <div className={rounded-lg border border-slate-300 p-2}>Yanlış: <b>{wrong}</b></div>
        <div className={rounded-lg border border-slate-300 p-2}>Net: <b>{score}</b></div>
      </div>
    </div>
  );
}
function TitleCard({ title, score, correct, wrong, playerIndex, imageUrl }) {
  return (
    <div className={rounded-2xl p-4 bg-[url(${imageUrl})] bg-cover shadow-lg backdrop-blur-sm flex flex-col items-center}>
      <img src={imageUrl} alt={Torba ${playerIndex}} className="size-60 object-contain" />
      <div className="text-xl font-bold text-slate-200">{title}</div>
      <div className="mt-2 w-full grid grid-cols-2 gap-2 text-sm text-slate-300">
        <div className={rounded-lg border border-slate-300 p-2}>Toplam Puan: <b>{score}</b></div>
        <div className={rounded-lg border border-slate-300 p-2}>Doğru: <b>{correct}</b></div>
        <div className={rounded-lg border border-slate-300 p-2}>Yanlış: <b>{wrong}</b></div>
        <div className={rounded-lg border border-slate-300 p-2}>Net: <b>{score}</b></div>
      </div>
    </div>
  );
}

function SVGShape({ x, y, w, h, color, label, rect, sides }) {
  const halfW = w / 2;
  const halfH = h / 2;
  const viewW = w;
  const viewH = h;
  const cx = viewW / 2;
  const cy = viewH / 2;

  const pointsArr = sides > 0 && !rect && sides !== 0
    ? buildRegularPolygonVertices(sides, cx, cy, Math.min(cx, cy) - 2)
    : null;
  const points = pointsArr ? pointsArr.map(p => ${p.x},${p.y}).join(" ") : null;

  return (
    <div className="absolute z-20" style={{ left: x - halfW, top: y - halfH, width: w, height: h }}>
      <svg width={viewW} height={viewH} viewBox={0 0 ${viewW} ${viewH}} className="drop-shadow">
        {sides === 0 && (
          <circle cx={cx} cy={cy} r={Math.min(cx, cy) - 2} fill={color} />
        )}
        {rect && (
          <rect x={2} y={2} width={viewW - 4} height={viewH - 4} rx={8} fill={color} />
        )}
        {points && (
          <polygon points={points} fill={color} />
        )}
      </svg>
      <div className="absolute -bottom-6 w-full text-center text-[10px] font-medium text-slate-700">{label}</div>
    </div>
  );
}

function ShapePreview({ shape, size = 120 }) {
  const { color, rect, sides } = shape;
  const w = rect ? Math.round(size * 1.3) : size;
  const h = rect ? Math.round(size * 0.8) : size;
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(cx, cy) - 4;

  const pointsArr = sides > 0 && !rect && sides !== 0
    ? buildRegularPolygonVertices(sides, cx, cy, r)
    : null;
  const points = pointsArr ? pointsArr.map(p => ${p.x},${p.y}).join(" ") : null;

  return (
    <svg width={w} height={h} viewBox={0 0 ${w} ${h}}>
      {sides === 0 && <circle cx={cx} cy={cy} r={r} fill={color} />}
      {rect && <rect x={4} y={4} width={w - 8} height={h - 8} rx={10} fill={color} />}
      {points && <polygon points={points} fill={color} />}
    </svg>
  );
}

// --- Geometri & fizik yardımcıları ---

function buildRegularPolygonVertices(sides, cx, cy, r) {
  const rot = -Math.PI / 2;
  const out = [];
  for (let i = 0; i < sides; i++) {
    const ang = rot + (i * 2 * Math.PI) / sides;
    out.push({ x: cx + r * Math.cos(ang), y: cy + r * Math.sin(ang) });
  }
  return out;
}

function pointHitsShape(px, py, s) {
  if (s.sides === 0) {
    return (px - s.cx) ** 2 + (py - s.cy) ** 2 <= (s.outerR) ** 2;
  }
  if (s.rect) {
    const left = s.x - s.w / 2 + 2;
    const right = s.x + s.w / 2 - 2;
    const top = s.y - s.h / 2 + 2;
    const bottom = s.y + s.h / 2 - 2;
    return px >= left && px <= right && py >= top && py <= bottom;
  }
  const verts = buildRegularPolygonVertices(s.sides, s.cx, s.cy, s.outerR);
  return pointInPolygon(px, py, verts);
}

function pointInPolygon(x, y, verts) {
  let inside = false;
  for (let i = 0, j = verts.length - 1; i < verts.length; j = i++) {
    const xi = verts[i].x, yi = verts[i].y;
    const xj = verts[j].x, yj = verts[j].y;
    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi + 0.000001) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function predictTrajectory(x0, y0, vx0, vy0, g, W, H) {
  const pts = [];
  let t = 0;
  const dt = 0.04;

  // Topun etrafındaki görünmez kare sınırları
  const BBOX_SIZE = 300; // Karenin kenar uzunluğu (px)
  const minX = x0 - BBOX_SIZE / 2;
  const maxX = x0 + BBOX_SIZE / 2;
  const minY = y0 - BBOX_SIZE / 2;
  const maxY = y0 + BBOX_SIZE / 2;


  for (let i = 0; i < 10; i++) {
    const x = x0 + vx0 * t;
    const y = y0 + vy0 * t + 0.5 * g * t * t;

    // Hem canvas sınırlarını hem de görünmez kareyi kontrol et
    if (x < 0 || x > W || y < 0 || y > H + 40 || x < minX || x > maxX || y < minY || y > maxY) {
      break; // Sınırların dışına çıkınca çizmeyi bırak
    }

    pts.push({ x, y });
    t += dt;
  }
  return pts;
}