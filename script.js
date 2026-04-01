const { useCallback, useEffect, useMemo, useRef, useState } = React;

const MIN_SIZE = 10;
const START_LIVES = 5;
const START_TIME = 30;
const MAX_CANVAS_WIDTH = 980;
const MAX_CANVAS_HEIGHT = 1500;
const BEST_SCORE_KEY = "grid-survival-best-score";
const LAST_RUN_KEY = "grid-survival-last-run";

const DIFFICULTIES = {
  easy: { label: "Easy", time: 38, speed: 1, scans: 3, bonus: 1 },
  normal: { label: "Normal", time: 30, speed: 1.1, scans: 2, bonus: 1.15 },
  hard: { label: "Hard", time: 24, speed: 1.25, scans: 1, bonus: 1.35 }
};

const THEMES = {
  neon: { label: "Neon" },
  cyber: { label: "Cyber" },
  retro: { label: "Retro" }
};

function normalizeSize(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return fallback;
  }
  return Math.max(MIN_SIZE, parsed);
}

function createTile(row, col, cols, type) {
  return {
    row,
    col,
    number: row * cols + col + 1,
    type,
    active: type !== "dark",
    cleared: false,
    blinkUntil: 0,
    pulse: Math.random() * Math.PI * 2
  };
}

function setTileType(grid, rows, cols, row, col, type) {
  if (row < 0 || col < 0 || row >= rows || col >= cols) {
    return;
  }
  const tile = grid[row * cols + col];
  tile.type = type;
  tile.active = type !== "dark";
}

function generatePattern1(rows, cols) {
  const grid = [];
  const center = (cols - 1) / 2;
  const innerLeft = Math.min(2, cols - 1);
  const innerRight = Math.max(cols - 3, 0);
  const nearEdgeLeft = Math.min(1, cols - 1);
  const nearEdgeRight = Math.max(cols - 2, 0);

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      grid.push(createTile(row, col, cols, "dark"));
    }
  }

  for (let col = 0; col < cols; col += 1) {
    setTileType(grid, rows, cols, rows - 1, col, "green");
  }

  for (let row = 0; row < rows - 1; row += 1) {
    if (row % 6 === 0) {
      setTileType(grid, rows, cols, row, 0, "blue");
      setTileType(grid, rows, cols, row, cols - 1, "blue");
    } else if (row % 3 === 0) {
      setTileType(grid, rows, cols, row, 0, "red");
      setTileType(grid, rows, cols, row, cols - 1, "red");
    }

    if (row % 4 === 0) {
      setTileType(grid, rows, cols, row, nearEdgeLeft, "red");
      setTileType(grid, rows, cols, row, nearEdgeRight, "red");
    }

    if (row % 4 === 2) {
      setTileType(grid, rows, cols, row, innerLeft, "blue");
      setTileType(grid, rows, cols, row, innerRight, "blue");
    }

    if (row % 9 === 4) {
      const leftCenter = Math.max(0, Math.floor(center));
      const rightCenter = Math.min(cols - 1, Math.ceil(center));
      setTileType(grid, rows, cols, row, leftCenter, "blue");
      setTileType(grid, rows, cols, row, rightCenter, "blue");
    }

    if (row % 9 === 3) {
      const leftCenter = Math.max(0, Math.floor(center));
      const rightCenter = Math.min(cols - 1, Math.ceil(center));
      setTileType(grid, rows, cols, row, leftCenter, "red");
      setTileType(grid, rows, cols, row, rightCenter, "red");
    }
  }

  for (let row = 1; row < rows - 1; row += 1) {
    for (let col = 1; col < cols - 1; col += 1) {
      const tile = grid[row * cols + col];
      if (tile.type !== "dark") {
        continue;
      }

      const centerDistance = Math.abs(col - center);
      const diagonalPulse = (row + col) % 8 === 0 || (row - col + cols * 4) % 10 === 0;

      if (centerDistance < Math.max(0.9, cols * 0.09) && row % 11 === 5) {
        setTileType(grid, rows, cols, row, col, "blue");
      } else if (diagonalPulse && row % 5 === 1 && centerDistance > 1.5) {
        setTileType(grid, rows, cols, row, col, "red");
      }
    }
  }

  return grid;
}

function generatePattern2(rows, cols) {
  const grid = [];
  const innerTop = Math.min(1, rows - 1);
  const innerBottom = Math.max(rows - 2, 0);
  const leftLane = Math.min(1, cols - 1);
  const rightLane = Math.max(cols - 2, 0);
  const centerRow = Math.floor((rows - 1) / 2);
  const centerCol = Math.floor((cols - 1) / 2);
  const rightInner = Math.max(2, cols - 3);

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      grid.push(createTile(row, col, cols, "dark"));
    }
  }

  for (let col = 0; col < cols; col += 1) {
    setTileType(grid, rows, cols, 0, col, "blue");
    setTileType(grid, rows, cols, rows - 1, col, "blue");
  }

  for (let col = 1; col < cols - 1; col += 1) {
    setTileType(grid, rows, cols, innerTop, col, "green");
    setTileType(grid, rows, cols, innerBottom, col, "green");
  }

  for (let row = 2; row < rows - 2; row += 1) {
    setTileType(grid, rows, cols, row, leftLane, "green");
    setTileType(grid, rows, cols, row, rightLane, "green");

    if (row % 2 === 0) {
      setTileType(grid, rows, cols, row, leftLane, "blue");
      setTileType(grid, rows, cols, row, rightLane, "blue");
    }

    if (cols > 4 && row % 5 === 2) {
      setTileType(grid, rows, cols, row, 2, "blue");
    }

    if (row > centerRow && row % 2 === 0) {
      setTileType(grid, rows, cols, row, rightInner, "red");
    }
  }

  for (let row = Math.max(2, centerRow - 2); row <= Math.min(rows - 3, centerRow + 2); row += 1) {
    for (let col = Math.max(2, centerCol - 2); col <= Math.min(cols - 3, centerCol + 2); col += 1) {
      const distance = Math.abs(row - centerRow) + Math.abs(col - centerCol);
      if (distance <= 2) {
        setTileType(grid, rows, cols, row, col, distance <= 1 ? "red" : "green");
      }
    }
  }

  for (let col = Math.max(2, centerCol - 1); col <= Math.min(cols - 3, centerCol + 1); col += 1) {
    if (centerRow - 1 >= 2) {
      setTileType(grid, rows, cols, centerRow - 1, col, "red");
    }
    setTileType(grid, rows, cols, centerRow, col, col === centerCol ? "red" : "green");
    if (centerRow + 1 <= rows - 3) {
      setTileType(grid, rows, cols, centerRow + 1, col, "red");
    }
  }

  return grid;
}

function computeCanvasMetrics(rows, cols) {
  const marginX = cols > 18 ? 14 : cols > 12 ? 18 : 22;
  const top = rows > 24 ? 84 : 96;
  const bottomMargin = 18;
  const gap = cols > 20 || rows > 28 ? 2 : cols > 14 || rows > 20 ? 3 : 4;
  const usableWidth = MAX_CANVAS_WIDTH - marginX * 2;
  const usableHeight = MAX_CANVAS_HEIGHT - top - bottomMargin;
  const tile = Math.min(
    (usableWidth - gap * (cols - 1)) / cols,
    (usableHeight - gap * (rows - 1)) / rows
  );
  const width = tile * cols + gap * (cols - 1);
  const height = tile * rows + gap * (rows - 1);
  const canvasWidth = Math.ceil(width + marginX * 2);
  const canvasHeight = Math.ceil(height + top + bottomMargin);
  return {
    width: canvasWidth,
    height: canvasHeight,
    board: {
      x: (canvasWidth - width) / 2,
      y: top,
      width,
      height,
      tile,
      gap
    }
  };
}

function getTileRect(boardRect, tile) {
  return {
    x: boardRect.x + tile.col * (boardRect.tile + boardRect.gap),
    y: boardRect.y + tile.row * (boardRect.tile + boardRect.gap),
    size: boardRect.tile
  };
}

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function playTone(type) {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === "collect") {
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(740, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(980, audioContext.currentTime + 0.12);
      gainNode.gain.setValueAtTime(0.001, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.08, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.14);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.15);
      return;
    }

    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(140, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(70, audioContext.currentTime + 0.18);
    gainNode.gain.setValueAtTime(0.001, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.09, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.2);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.21);
  } catch (error) {
    // Browser audio may be unavailable until user interaction.
  }
}

function OverlayCard({ title, children, actions }) {
  return (
    <div className="overlay-screen">
      <div className="overlay-card">
        <h2>{title}</h2>
        <div className="overlay-content">{children}</div>
        <div className="overlay-actions">{actions}</div>
      </div>
    </div>
  );
}

function LoadingOverlay({ title, subtitle }) {
  return (
    <div className="loading-screen">
      <div className="loading-card">
        <p className="loading-label">System Sync</p>
        <h2>{title}</h2>
        <div className="loading-bar">
          <span className="loading-bar-fill"></span>
        </div>
        <p className="loading-subtitle">{subtitle}</p>
      </div>
    </div>
  );
}

function CanvasBoard({
  rows,
  cols,
  grid,
  blueRemaining,
  locked,
  onTileClick,
  combo,
  scanActive
}) {
  const canvasRef = useRef(null);
  const hoverIndexRef = useRef(-1);
  const metrics = useMemo(() => computeCanvasMetrics(rows, cols), [rows, cols]);
  const boardRect = metrics.board;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let frameId = 0;

    const drawBackground = (time) => {
      ctx.clearRect(0, 0, metrics.width, metrics.height);

      const gradient = ctx.createLinearGradient(0, 0, 0, metrics.height);
      gradient.addColorStop(0, "#050813");
      gradient.addColorStop(0.55, "#09060b");
      gradient.addColorStop(1, "#030407");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, metrics.width, metrics.height);

      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = "#7a2d2d";
      ctx.beginPath();
      ctx.arc(metrics.width / 2, 90, 140 + Math.sin(time * 0.001) * 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawFrame = () => {
      roundedRect(ctx, 12, 12, metrics.width - 24, metrics.height - 24, 24);
      ctx.fillStyle = "rgba(7, 10, 18, 0.86)";
      ctx.fill();
      ctx.strokeStyle = "rgba(142, 168, 255, 0.18)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#ffd567";
      ctx.font = "700 14px Rajdhani";
      ctx.fillText("ARENA", 30, 34);

      ctx.fillStyle = "#eef4ff";
      ctx.font = "800 26px Orbitron";
      ctx.fillText("GRID SURVIVAL", 28, 60);

      ctx.fillStyle = "#92a2bf";
      ctx.font = "600 16px Rajdhani";
      ctx.fillText(`Targets: ${blueRemaining}`, metrics.width - 170, 36);
      ctx.fillText(`${rows} x ${cols}`, metrics.width - 90, 58);

      ctx.fillStyle = combo > 1 ? "#ffd567" : "#92a2bf";
      ctx.fillText(`Combo x${combo}`, metrics.width - 170, 58);
    };

    const getTileColors = (tile, time) => {
      if (tile.cleared) {
        return { fill: "#050505", glow: "transparent", text: "rgba(255,255,255,0.22)" };
      }

      if (tile.type === "blue") {
        const glow = 0.7 + Math.sin(time * 0.003 + tile.pulse) * 0.18;
        return { fill: "#4d47ff", glow: `rgba(77,71,255,${glow})`, text: "#ffffff" };
      }

      if (tile.type === "green") {
        return { fill: "#6bff58", glow: "rgba(107,255,88,0.44)", text: "#fbfff6" };
      }

      if (tile.type === "red") {
        const blinking = tile.blinkUntil > time && Math.floor((tile.blinkUntil - time) / 85) % 2 === 0;
        return blinking
          ? { fill: "#ffffff", glow: "rgba(255,255,255,0.7)", text: "#111111" }
          : { fill: "#ff4d57", glow: "rgba(255,77,87,0.45)", text: "#ffffff" };
      }

      if (scanActive && tile.type === "dark") {
        return { fill: "#101926", glow: "rgba(126,200,255,0.08)", text: "rgba(255,255,255,0.58)" };
      }

      return { fill: "#080808", glow: "transparent", text: "rgba(255,255,255,0.55)" };
    };

    const drawBoard = (time) => {
      roundedRect(
        ctx,
        boardRect.x - 12,
        boardRect.y - 12,
        boardRect.width + 24,
        boardRect.height + 24,
        20
      );
      ctx.fillStyle = "rgba(2, 2, 6, 0.9)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 2;
      ctx.stroke();

      grid.forEach((tile, index) => {
        const rect = getTileRect(boardRect, tile);
        const colors = getTileColors(tile, time);
        const hovered = index === hoverIndexRef.current && !locked && tile.active && !tile.cleared;
        const sizeBoost = hovered ? 1.04 : 1;
        const size = rect.size * sizeBoost;
        const offset = (size - rect.size) / 2;

        ctx.save();
        ctx.shadowBlur = tile.type === "dark" || tile.cleared ? 0 : 16;
        ctx.shadowColor = colors.glow;
        roundedRect(
          ctx,
          rect.x - offset,
          rect.y - offset,
          size,
          size,
          Math.max(4, rect.size * 0.1)
        );
        ctx.fillStyle = colors.fill;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 1;
        ctx.stroke();

        if (tile.rippleUntil > time) {
          const progress = 1 - (tile.rippleUntil - time) / 320;
          ctx.strokeStyle = `rgba(255,255,255,${0.45 - progress * 0.35})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(
            rect.x + rect.size / 2,
            rect.y + rect.size / 2,
            rect.size * (0.22 + progress * 0.48),
            0,
            Math.PI * 2
          );
          ctx.stroke();
        }

        if (rect.size >= 18) {
          ctx.fillStyle = colors.text;
          ctx.font = `700 ${Math.max(8, rect.size * 0.24)}px Rajdhani`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(String(tile.number), rect.x + rect.size / 2, rect.y + rect.size / 2 + 1);
        }
        ctx.restore();
      });
    };

    const render = (time) => {
      drawBackground(time);
      drawFrame();
      drawBoard(time);
      frameId = window.requestAnimationFrame(render);
    };

    frameId = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(frameId);
  }, [boardRect, blueRemaining, cols, combo, grid, locked, metrics.height, metrics.width, rows, scanActive]);

  const findTileIndexFromPointer = useCallback((clientX, clientY) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = metrics.width / rect.width;
    const scaleY = metrics.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    if (
      x < boardRect.x ||
      y < boardRect.y ||
      x > boardRect.x + boardRect.width ||
      y > boardRect.y + boardRect.height
    ) {
      return -1;
    }

    const col = Math.floor((x - boardRect.x) / (boardRect.tile + boardRect.gap));
    const row = Math.floor((y - boardRect.y) / (boardRect.tile + boardRect.gap));
    if (row < 0 || col < 0 || row >= rows || col >= cols) {
      return -1;
    }

    return row * cols + col;
  }, [boardRect, cols, metrics.height, metrics.width, rows]);

  return (
    <canvas
      ref={canvasRef}
      width={metrics.width}
      height={metrics.height}
      aria-label="Game canvas"
      onPointerMove={(event) => {
        hoverIndexRef.current = findTileIndexFromPointer(event.clientX, event.clientY);
      }}
      onPointerLeave={() => {
        hoverIndexRef.current = -1;
      }}
      onClick={(event) => {
        const index = findTileIndexFromPointer(event.clientX, event.clientY);
        if (index >= 0) {
          onTileClick(index);
        }
      }}
    />
  );
}

function App() {
  const [rowsInput, setRowsInput] = useState("10");
  const [colsInput, setColsInput] = useState("10");
  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(10);
  const [pattern, setPattern] = useState(1);
  const [difficulty, setDifficulty] = useState("normal");
  const [theme, setTheme] = useState("neon");
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [bestCombo, setBestCombo] = useState(1);
  const [lives, setLives] = useState(START_LIVES);
  const [timeLeft, setTimeLeft] = useState(START_TIME);
  const [status, setStatus] = useState("Press Start Game to enter the arena.");
  const [grid, setGrid] = useState([]);
  const [screen, setScreen] = useState("start");
  const [countdown, setCountdown] = useState(null);
  const [loadingState, setLoadingState] = useState({ visible: true, title: "Loading Arena", subtitle: "Preparing battle grid..." });
  const [result, setResult] = useState({ visible: false, title: "YOU WIN", message: "", finalScore: 0 });
  const [scanUntil, setScanUntil] = useState(0);
  const [scanCharges, setScanCharges] = useState(DIFFICULTIES.normal.scans);
  const [bestScore, setBestScore] = useState(() => Number(localStorage.getItem(BEST_SCORE_KEY) || 0));
  const [lastRun, setLastRun] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LAST_RUN_KEY) || "null");
    } catch (error) {
      return null;
    }
  });
  const [confettiBursts, setConfettiBursts] = useState([]);
  const timerRef = useRef(null);
  const countdownRef = useRef(null);

  const blueRemaining = useMemo(
    () => grid.filter((tile) => tile.type === "blue" && !tile.cleared).length,
    [grid]
  );

  const currentDifficulty = DIFFICULTIES[difficulty];

  const bootPattern = useCallback((nextPattern, nextRows, nextCols, nextDifficulty) => {
    const difficultyConfig = DIFFICULTIES[nextDifficulty];
    setLoadingState({
      visible: true,
      title: nextPattern === 2 ? "Loading Pattern 2" : "Loading Arena",
      subtitle: `Calibrating ${nextRows} x ${nextCols} grid on ${difficultyConfig.label} difficulty`
    });

    window.setTimeout(() => {
      const generatedGrid =
        nextPattern === 1 ? generatePattern1(nextRows, nextCols) : generatePattern2(nextRows, nextCols);

      setPattern(nextPattern);
      setRows(nextRows);
      setCols(nextCols);
      setDifficulty(nextDifficulty);
      setScore(0);
      setCombo(1);
      setBestCombo(1);
      setLives(START_LIVES);
      setTimeLeft(nextPattern === 2 ? Math.max(12, difficultyConfig.time - 3) : difficultyConfig.time);
      setScanCharges(difficultyConfig.scans);
      setScanUntil(0);
      setConfettiBursts([]);
      setResult({ visible: false, title: "YOU WIN", message: "", finalScore: 0 });
      setScreen("playing");
      setStatus(`Pattern ${nextPattern} generated for ${nextRows} x ${nextCols}.`);
      setGrid(generatedGrid);
      setLoadingState({ visible: false, title: "", subtitle: "" });
    }, nextPattern === 2 ? 900 : 650);
  }, []);

  const startCountdown = useCallback((onDone) => {
    window.clearInterval(countdownRef.current);
    const sequence = ["3", "2", "1", "GO!"];
    let index = 0;
    setCountdown(sequence[index]);
    countdownRef.current = window.setInterval(() => {
      index += 1;
      if (index >= sequence.length) {
        window.clearInterval(countdownRef.current);
        setCountdown(null);
        onDone();
        return;
      }
      setCountdown(sequence[index]);
    }, 550);
  }, []);

  const beginGame = useCallback(() => {
    const nextRows = normalizeSize(rowsInput, rows);
    const nextCols = normalizeSize(colsInput, cols);
    setRowsInput(String(nextRows));
    setColsInput(String(nextCols));
    startCountdown(() => {
      bootPattern(1, nextRows, nextCols, difficulty);
    });
  }, [bootPattern, cols, difficulty, rows, rowsInput, colsInput, startCountdown]);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    window.clearInterval(timerRef.current);
    if (screen !== "playing" || result.visible || grid.length === 0 || countdown) {
      return undefined;
    }

    timerRef.current = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timerRef.current);
          const finalScore = score + lives * 5;
          setResult({
            visible: true,
            title: "GAME OVER",
            message: "Time ran out before the arena was cleared.",
            finalScore
          });
          setScreen("result");
          setStatus("Mission failed.");
          setCombo(1);
          return 0;
        }
        return current - 1;
      });
    }, Math.max(500, 1000 / currentDifficulty.speed));

    return () => window.clearInterval(timerRef.current);
  }, [countdown, currentDifficulty.speed, grid.length, lives, result.visible, score, screen]);

  useEffect(() => {
    if (screen !== "playing" || grid.length === 0 || result.visible) {
      return;
    }

    if (lives <= 0) {
      window.clearInterval(timerRef.current);
      const finalScore = score + timeLeft * 2;
      setResult({
        visible: true,
        title: "GAME OVER",
        message: "No lives remaining.",
        finalScore
      });
      setScreen("result");
      setStatus("Mission failed.");
      return;
    }

    if (blueRemaining <= 0) {
      window.clearInterval(timerRef.current);
      if (pattern === 1) {
        setStatus("Pattern 1 complete. Loading Pattern 2.");
        startCountdown(() => {
          bootPattern(2, rows, cols, difficulty);
        });
      } else {
        const finalScore =
          score + timeLeft * 2 + lives * 5 + bestCombo * 6 + Math.round(30 * currentDifficulty.bonus);
        setResult({
          visible: true,
          title: "YOU WIN",
          message: "Both patterns cleared.",
          finalScore
        });
        setScreen("result");
        setStatus("Mission complete.");
        setConfettiBursts(
          Array.from({ length: 24 }, (_, index) => ({
            id: `${Date.now()}-${index}`,
            left: Math.random() * 100,
            delay: Math.random() * 0.8,
            hue: [220, 10, 95, 280][index % 4]
          }))
        );
      }
    }
  }, [
    bestCombo,
    blueRemaining,
    bootPattern,
    cols,
    currentDifficulty.bonus,
    difficulty,
    grid.length,
    lives,
    pattern,
    result.visible,
    rows,
    score,
    screen,
    startCountdown,
    timeLeft
  ]);

  useEffect(() => {
    if (!result.visible) {
      return;
    }

    const updatedBest = Math.max(bestScore, result.finalScore);
    if (updatedBest !== bestScore) {
      setBestScore(updatedBest);
      localStorage.setItem(BEST_SCORE_KEY, String(updatedBest));
    }

    const run = {
      score: result.finalScore,
      pattern,
      difficulty: currentDifficulty.label,
      rows,
      cols,
      outcome: result.title
    };
    setLastRun(run);
    localStorage.setItem(LAST_RUN_KEY, JSON.stringify(run));
  }, [bestScore, cols, currentDifficulty.label, pattern, result, rows]);

  useEffect(() => {
    if (!scanUntil) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setScanUntil(0);
    }, Math.max(0, scanUntil - Date.now()));

    return () => window.clearTimeout(timeoutId);
  }, [scanUntil]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === "Space") {
        event.preventDefault();
        if (screen === "start" || screen === "result") {
          beginGame();
        }
      }

      if (event.code === "KeyH" && screen === "start") {
        setScreen("howto");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [beginGame, screen]);

  const handleGenerate = () => {
    const nextRows = normalizeSize(rowsInput, rows);
    const nextCols = normalizeSize(colsInput, cols);
    setRowsInput(String(nextRows));
    setColsInput(String(nextCols));
    bootPattern(pattern, nextRows, nextCols, difficulty);
  };

  const handleTileClick = (index) => {
    if (screen !== "playing" || result.visible || countdown) {
      return;
    }

    setGrid((currentGrid) => {
      const nextGrid = currentGrid.map((tile) => ({ ...tile }));
      const tile = nextGrid[index];
      if (!tile || !tile.active || tile.cleared) {
        return currentGrid;
      }

      tile.rippleUntil = performance.now() + 320;

      if (tile.type === "blue") {
        tile.cleared = true;
        playTone("collect");
        setScore((current) => current + 10 * combo);
        setCombo((current) => {
          const nextCombo = Math.min(current + 1, 8);
          setBestCombo((best) => Math.max(best, nextCombo));
          setStatus(`Target tile collected. Combo x${nextCombo}.`);
          return nextCombo;
        });
      } else if (tile.type === "red") {
        tile.blinkUntil = performance.now() + 950;
        playTone("danger");
        setLives((current) => current - 1);
        setCombo(1);
        setStatus("Danger tile hit. Combo reset.");
      } else if (tile.type === "green") {
        tile.cleared = true;
        setCombo(1);
        setStatus("Safe tile cleared. Combo reset.");
      }

      return nextGrid;
    });
  };

  const timerRatio = Math.max(
    0,
    timeLeft / Math.max(1, pattern === 2 ? currentDifficulty.time - 3 : currentDifficulty.time)
  );
  const scanActive = scanUntil > Date.now();
  const accuracy = grid.length
    ? Math.round(
        (grid.filter((tile) => tile.cleared && tile.type === "blue").length /
          Math.max(
            1,
            grid.filter((tile) => tile.cleared && tile.active).length
          )) *
          100
      )
    : 100;

  return (
    <main className="shell">
      <div className="ambient-light ambient-left"></div>
      <div className="ambient-light ambient-right"></div>
      <div className="ambient-light ambient-bottom"></div>
      <section className="game-ui">
        <aside className={`sidebar ${screen === "playing" ? "playing" : ""}`}>
          <header className="topbar">
            <div className="title-wrap">
              <p className="eyebrow">Premium Arcade Build</p>
              <h1>Grid Survival Challenge</h1>
              <p className="subtitle">Single-screen desktop layout with dynamic patterns, combo scoring, countdown flow, and arcade canvas rendering.</p>
            </div>

            <div className="controls">
              <label className="field">
                <span>Rows</span>
                <input
                  value={rowsInput}
                  min="10"
                  type="number"
                  onChange={(event) => setRowsInput(event.target.value)}
                />
              </label>
              <label className="field">
                <span>Columns</span>
                <input
                  value={colsInput}
                  min="10"
                  type="number"
                  onChange={(event) => setColsInput(event.target.value)}
                />
              </label>
              <button className="btn" onClick={handleGenerate}>Generate</button>
              <button className="btn alt" onClick={() => bootPattern(pattern, rows, cols, difficulty)}>Restart</button>
            </div>
          </header>

          <section className="sidebar-card start-only-card">
            <h3>Game Start</h3>
            <p>Launch the arena, check the rules, or tune the challenge before the countdown begins.</p>
            <div className="boost-row">
              <button className="btn boost-action" onClick={beginGame}>Start Game</button>
              <button className="btn ghost boost-action" onClick={() => setScreen("howto")}>How to Play</button>
              <button className="btn ghost boost-action" onClick={() => setScreen("difficulty")}>Difficulty</button>
            </div>
          </section>

          <section className="sidebar-card">
            <h3>Mission Intel</h3>
            <p>Blue targets build combo score. Red tiles break momentum and cost lives. Green tiles are safe but reset your combo chain.</p>
            <div className="theme-switcher">
              {Object.entries(THEMES).map(([key, value]) => (
                <button
                  key={key}
                  className={`theme-chip ${theme === key ? "active" : ""}`}
                  onClick={() => setTheme(key)}
                >
                  {value.label}
                </button>
              ))}
            </div>
            <div className="quick-stats">
              <div className="quick-stat">
                <span>Best Combo</span>
                <strong>x{bestCombo}</strong>
              </div>
              <div className="quick-stat">
                <span>Accuracy</span>
                <strong>{accuracy}%</strong>
              </div>
              <div className="quick-stat">
                <span>Best Score</span>
                <strong>{bestScore}</strong>
              </div>
            </div>
            <div className="status-list">
              <span className="status-pill">Targets: {blueRemaining}</span>
              <span className="status-pill">Scan Charges: {scanCharges}</span>
              <span className="status-pill">Difficulty: {currentDifficulty.label}</span>
              <span className="status-pill">Grid: {rows} x {cols}</span>
            </div>
          </section>

          <section className="boost-card start-only-card">
            <h3>Boost Module</h3>
            <p>Use Scan Pulse to temporarily brighten hidden lanes and make route planning easier.</p>
            <div className="boost-row">
              <div className="boost-action">
                <button
                  className="btn ghost"
                  disabled={scanCharges <= 0 || scanActive || result.visible || screen !== "playing"}
                  onClick={() => {
                    setScanCharges((current) => Math.max(0, current - 1));
                    setScanUntil(Date.now() + 3200);
                    setStatus("Scan pulse activated.");
                  }}
                >
                  {scanActive ? "Scan Active" : "Scan Pulse"}
                </button>
                <small>Reveals board lanes for 3.2 seconds.</small>
              </div>
            </div>
            {lastRun ? (
              <div className="replay-card">
                <span>Last Run</span>
                <strong>{lastRun.outcome}</strong>
                <p>{lastRun.score} pts • {lastRun.difficulty} • {lastRun.rows} x {lastRun.cols}</p>
              </div>
            ) : null}
          </section>

          <section className="sidebar-card play-only-card">
            <h3>Quick Play Help</h3>
            <p>Click blue, avoid red, and use Scan Pulse when the lanes feel crowded.</p>
            <div className="micro-help">
              <span>Blue = Score</span>
              <span>Red = Damage</span>
              <span>Green = Safe</span>
              <span>Space = Restart From Screen</span>
            </div>
          </section>
        </aside>

        <section className="main-stage">
          <section className="hud">
            <div className="hud-card">
              <span>Pattern</span>
              <strong>{pattern}</strong>
            </div>
            <div className="hud-card">
              <span>Score</span>
              <strong>{score}</strong>
            </div>
            <div className="hud-card">
              <span>Lives</span>
              <strong>{lives}</strong>
            </div>
            <div className="hud-card">
              <span>Combo</span>
              <strong>x{combo}</strong>
            </div>
            <div className="hud-card wide">
              <span>Timer</span>
              <strong>{timeLeft}s</strong>
              <div className="timer-bar">
                <div className="timer-fill" style={{ transform: `scaleX(${timerRatio})` }}></div>
              </div>
            </div>
          </section>

          <section className="subbar">
            <div className="pattern-switches">
              <button
                className={`pattern-btn ${pattern === 1 ? "active" : ""}`}
                onClick={() => bootPattern(1, rows, cols, difficulty)}
              >
                Pattern 1
              </button>
              <button
                className={`pattern-btn ${pattern === 2 ? "active" : ""}`}
                onClick={() => bootPattern(2, rows, cols, difficulty)}
              >
                Pattern 2
              </button>
            </div>
            <p className="status-text">{status}</p>
          </section>

          <section className="viewport">
            <div className={`canvas-frame active-board ${result.visible && result.title === "GAME OVER" ? "shake-frame" : ""}`}>
              <CanvasBoard
                rows={rows}
                cols={cols}
                grid={grid}
                blueRemaining={blueRemaining}
                locked={result.visible || screen !== "playing" || Boolean(countdown) || loadingState.visible}
                onTileClick={handleTileClick}
                combo={combo}
                scanActive={scanActive}
              />

              {loadingState.visible ? (
                <LoadingOverlay title={loadingState.title} subtitle={loadingState.subtitle} />
              ) : null}

              {countdown ? <div className="countdown-overlay">{countdown}</div> : null}

              <div className={`result-screen ${result.visible ? "visible" : ""}`}>
                <div className="result-card">
                  <h2>{result.title}</h2>
                  <p>{result.message}</p>
                  <div className="score-sheet">
                    <span>Final Score</span>
                    <strong>{result.finalScore || 0}</strong>
                  </div>
                  <div className="score-sheet subtle">
                    <span>Best Score</span>
                    <strong>{bestScore}</strong>
                  </div>
                  <button className="btn" onClick={beginGame}>Play Again</button>
                </div>
              </div>

              {confettiBursts.map((piece) => (
                <span
                  key={piece.id}
                  className="confetti"
                  style={{
                    left: `${piece.left}%`,
                    animationDelay: `${piece.delay}s`,
                    background: `hsl(${piece.hue} 90% 60%)`
                  }}
                ></span>
              ))}
            </div>

            <div className="legend">
              <span><i className="swatch blue"></i> Points</span>
              <span><i className="swatch red"></i> Danger</span>
              <span><i className="swatch green"></i> Safe</span>
              <span><i className="swatch gold"></i> Combo Score</span>
            </div>
          </section>
        </section>

        {screen === "start" ? (
          <OverlayCard
            title="Grid Survival Challenge"
            actions={
              <>
                <button className="btn" onClick={beginGame}>Start Game</button>
                <button className="btn ghost" onClick={() => setScreen("howto")}>How to Play</button>
                <button className="btn ghost" onClick={() => setScreen("difficulty")}>Difficulty</button>
              </>
            }
          >
            <p>Survive two escalating patterns, collect every neon-blue target, avoid danger tiles, and chase the highest score on your local leaderboard.</p>
            <p className="overlay-hint">Press <strong>Space</strong> to start instantly.</p>
          </OverlayCard>
        ) : null}

        {screen === "howto" ? (
          <OverlayCard
            title="How To Play"
            actions={
              <>
                <button className="btn" onClick={() => setScreen("start")}>Back</button>
                <button className="btn ghost" onClick={beginGame}>Start Run</button>
              </>
            }
          >
            <ul className="overlay-list">
              <li>Blue tiles add score and build your combo multiplier.</li>
              <li>Red tiles flash, damage you, and reset your combo.</li>
              <li>Green tiles are safe, but they also reset the combo chain.</li>
              <li>Final Score = Points + (Time x 2) + (Lives x 5) + Combo Bonus.</li>
              <li>Pattern 1 automatically transitions into Pattern 2 after a clear.</li>
            </ul>
          </OverlayCard>
        ) : null}

        {screen === "difficulty" ? (
          <OverlayCard
            title="Choose Difficulty"
            actions={
              <>
                <button className="btn" onClick={() => setScreen("start")}>Done</button>
                <button className="btn ghost" onClick={beginGame}>Play</button>
              </>
            }
          >
            <div className="difficulty-grid">
              {Object.entries(DIFFICULTIES).map(([key, value]) => (
                <button
                  key={key}
                  className={`difficulty-card ${difficulty === key ? "active" : ""}`}
                  onClick={() => setDifficulty(key)}
                >
                  <strong>{value.label}</strong>
                  <span>{value.time}s timer</span>
                  <span>{value.scans} scan charge{value.scans > 1 ? "s" : ""}</span>
                </button>
              ))}
            </div>
          </OverlayCard>
        ) : null}
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
