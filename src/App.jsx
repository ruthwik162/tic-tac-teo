/**
 * TicTacToeProSingle_Glass.jsx
 * Super-polished single-file Tic Tac Toe React component with GitHub-style glass (frosted) UI
 * Black & White theme, heavy GSAP animations, glass-effect icons, sounds via URLs, confetti, and polished UX.
 * Now with responsive design and star background
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { MotionConfig, motion } from "framer-motion";
import Confetti from "react-confetti";
import { FaCrown, FaLinkedin } from "react-icons/fa";

/* ---------- Game Logic ---------- */
const WIN_COMBOS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];
function calculateWinner(board) {
  for (const [a, b, c] of WIN_COMBOS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], combo: [a, b, c] };
    }
  }
  if (board.every(Boolean)) return { winner: "draw", combo: null };
  return null;
}
function minimax(board, isMax, ai, hu, depth = 0) {
  const result = calculateWinner(board);
  if (result) {
    if (result.winner === ai) return { score: 10 - depth };
    if (result.winner === hu) return { score: depth - 10 };
    return { score: 0 };
  }
  const avail = board.map((v, i) => (v ? null : i)).filter((v) => v !== null);
  if (isMax) {
    let best = { score: -Infinity, move: null };
    for (let idx of avail) {
      board[idx] = ai;
      const res = minimax(board, false, ai, hu, depth + 1);
      board[idx] = null;
      if (res.score > best.score) best = { score: res.score, move: idx };
    }
    return best;
  } else {
    let best = { score: Infinity, move: null };
    for (let idx of avail) {
      board[idx] = hu;
      const res = minimax(board, true, ai, hu, depth + 1);
      board[idx] = null;
      if (res.score < best.score) best = { score: res.score, move: idx };
    }
    return best;
  }
}
function softmax(scores, t = 1) {
  const max = Math.max(...scores);
  const exps = scores.map((s) => Math.exp((s - max) / t));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}
function sampleIndex(probs) {
  const r = Math.random();
  let acc = 0;
  for (let i = 0; i < probs.length; i++) {
    acc += probs[i];
    if (r <= acc) return i;
  }
  return probs.length - 1;
}
function chooseAIMove(origBoard, ai, hu, diff = "medium") {
  const board = [...origBoard];
  const avail = board.map((v, i) => (v ? null : i)).filter((v) => v !== null);
  if (avail.length === 9) return 4;
  if (diff === "easy") {
    const scored = avail.map((idx) => {
      board[idx] = ai;
      const { score } = minimax(board, false, ai, hu, 0);
      board[idx] = null;
      return { idx, score };
    });
    scored.sort((a, b) => b.score - a.score);
    const pool = scored.slice(0, Math.min(4, scored.length));
    return pool[Math.floor(Math.random() * pool.length)].idx;
  } else if (diff === "medium") {
    const scored = avail.map((idx) => {
      board[idx] = ai;
      const { score } = minimax(board, false, ai, hu, 0);
      board[idx] = null;
      return { idx, score };
    });
    const probs = softmax(scored.map((s) => s.score), 1.2);
    return scored[sampleIndex(probs)].idx;
  } else {
    return minimax(board, true, ai, hu, 0).move ?? avail[0];
  }
}

/* ---------- Audio helper ---------- */
function useAudio(urls = {}) {
  const cache = useRef({});
  useEffect(() => {
    for (const [k, url] of Object.entries(urls)) {
      try {
        const a = new Audio(url);
        a.preload = "auto";
        cache.current[k] = a;
      } catch (e) { }
    }
  }, [urls]);
  const play = (k, opts = {}) => {
    const a = cache.current[k];
    if (!a) return;
    try {
      const clone = a.cloneNode();
      clone.volume = typeof opts.volume === "number" ? opts.volume : 0.9;
      clone.play().catch(() => { });
    } catch (e) { }
  };
  return play;
}

/* ---------- Custom Glass Icons ---------- */
const GlassIcon = ({ children, className = "" }) => (
  <div className={`glass-icon ${className}`}>
    {children}
  </div>
);

const TimesIcon = ({ className = "", themeDark }) => (
  <GlassIcon className={className}>
    <svg viewBox="0 0 24 24" fill="none" stroke={themeDark ? "#ffffff" : "#000000"} strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  </GlassIcon>
);

const CircleIcon = ({ className = "", themeDark }) => (
  <GlassIcon className={className}>
    <svg viewBox="0 0 24 24" fill="none" stroke={themeDark ? "#ffffff" : "#000000"} strokeWidth="2">
      <circle cx="12" cy="12" r="9"></circle>
    </svg>
  </GlassIcon>
);

const UndoIcon = ({ className = "", themeDark }) => (
  <GlassIcon className={className}>
    <svg viewBox="0 0 24 24" fill="none" stroke={themeDark ? "#ffffff" : "#000000"} strokeWidth="2" strokeLinecap="round">
      <path d="M3 10h10a8 8 0 0 1 8 8v0a8 8 0 0 1-8 8H1"></path>
      <polyline points="3,10 9,4 3,4"></polyline>
    </svg>
  </GlassIcon>
);

const RedoIcon = ({ className = "", themeDark }) => (
  <GlassIcon className={className}>
    <svg viewBox="0 0 24 24" fill="none" stroke={themeDark ? "#ffffff" : "#000000"} strokeWidth="2" strokeLinecap="round">
      <path d="M21 10H11a8 8 0 0 0-8 8v0a8 8 0 0 0 8 8h12"></path>
      <polyline points="21,10 15,4 21,4"></polyline>
    </svg>
  </GlassIcon>
);

const MoonIcon = ({ className = "", themeDark }) => (
  <GlassIcon className={className}>
    <svg viewBox="0 0 24 24" fill="none" stroke={themeDark ? "#ffffff" : "#000000"} strokeWidth="2" strokeLinecap="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  </GlassIcon>
);

const SunIcon = ({ className = "", themeDark }) => (
  <GlassIcon className={className}>
    <svg viewBox="0 0 24 24" fill="none" stroke={themeDark ? "#ffffff" : "#000000"} strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  </GlassIcon>
);

const VolumeUpIcon = ({ className = "", themeDark }) => (
  <GlassIcon className={className}>
    <svg viewBox="0 0 24 24" fill="none" stroke={themeDark ? "#ffffff" : "#000000"} strokeWidth="2" strokeLinecap="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    </svg>
  </GlassIcon>
);

const VolumeMuteIcon = ({ className = "", themeDark }) => (
  <GlassIcon className={className}>
    <svg viewBox="0 0 24 24" fill="none" stroke={themeDark ? "#ffffff" : "#000000"} strokeWidth="2" strokeLinecap="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <line x1="23" y1="9" x2="17" y2="15"></line>
      <line x1="17" y1="9" x2="23" y2="15"></line>
    </svg>
  </GlassIcon>
);

const CrownIcon = ({ className = "", themeDark }) => (
  <GlassIcon className={className}>
    <svg viewBox="0 0 24 24" fill="none" stroke={themeDark ? "#ffffff" : "#000000"} strokeWidth="2" strokeLinecap="round">
      <path d="M12 4L8 10 12 14 16 10 12 4z"></path>
      <path d="M2 10h20v10H2z"></path>
    </svg>
  </GlassIcon>
);

/* ---------- Star Background Component ---------- */
const StarBackground = ({ themeDark }) => {
  const starsRef = useRef(null);

  useEffect(() => {
    const createStars = () => {
      const container = starsRef.current;
      if (!container) return;

      container.innerHTML = '';

      const starColor = themeDark ? 'bg-white/80' : 'bg-indigo-700';
      const starCount = window.innerWidth < 768 ? 80 : 400;

      for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        const size = Math.random() * 2 + 1;

        star.className = `absolute rounded-full ${starColor}`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.opacity = `${Math.random() * 0.8 + 0.2}`;
        star.style.animation = `starPulse ${2 + Math.random() * 3}s infinite ease-in-out`;

        container.appendChild(star);
      }
    };

    createStars();

    const resizeHandler = () => {
      clearTimeout(window._starResizeTimeout);
      window._starResizeTimeout = setTimeout(createStars, 300);
    };

    window.addEventListener('resize', resizeHandler);
    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, [themeDark]);

  return (
    <div
      ref={starsRef}
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
    />
  );
};

/* ---------- Main Component ---------- */
export default function TicTacToeProSingle() {
  const HUMAN = "X";
  const AI = "O";

  const [board, setBoard] = useState(Array(9).fill(null));
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [step, setStep] = useState(0);
  const [xIsNext, setXIsNext] = useState(true);

  const [mode, setMode] = useState("computer");
  const [difficulty, setDifficulty] = useState("medium");
  const [gameOver, setGameOver] = useState(null);
  const [thinking, setThinking] = useState(false);

  const [themeDark, setThemeDark] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  const [autoPlay, setAutoPlay] = useState(false);
  const [replay, setReplay] = useState(false);

  const [stats, setStats] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ttt_stats")) || { X: 0, O: 0, draw: 0, matches: 0 };
    } catch (e) {
      return { X: 0, O: 0, draw: 0, matches: 0 };
    }
  });

  const cellsRef = useRef([]);
  const confettiRef = useRef([]);
  const boardRef = useRef(null);
  const rootRef = useRef(null);

  // Glass particle background for subtle motion
  const bgParticles = useRef([]);

  const play = useAudio({
    move: "https://assets.mixkit.co/sfx/download/mixkit-select-click-1109.wav",
    win: "https://assets.mixkit.co/sfx/download/mixkit-video-game-win-2016.wav",
    lose: "https://assets.mixkit.co/sfx/download/mixkit-retro-arcade-lose-2027.wav",
    draw: "https://assets.mixkit.co/sfx/download/mixkit-arcade-retro-game-over-213.wav",
    reset: "https://assets.mixkit.co/sfx/download/mixkit-game-ball-tap-2073.wav",
  });

  useEffect(() => {
    localStorage.setItem("ttt_stats", JSON.stringify(stats));
  }, [stats]);

  // app open animation (big GSAP timeline)
  useEffect(() => {
    if (reducedMotion) return;
    const tl = gsap.timeline();
    tl.fromTo(rootRef.current, { opacity: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: 0.6, ease: "power3.out" });
    tl.fromTo(".glass-card", { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.06 }, "-=.4");

    // New grid animation - staggered fade in with slight rotation
    tl.fromTo(".ttt-board .ttt-cell",
      {
        opacity: 0,
        scale: 1,
        rotation: 0,
        y: 20
      },
      {
        opacity: 1,
        scale: 1,
        rotation: 0,
        y: 0,
        duration: 0.6,
        stagger: {
          grid: [3, 3],
          from: "center",
          amount: 0.8
        },
        ease: "back.out(1.4)"
      },
      "-=.3"
    );

    // subtle background particle motion
    bgParticles.current.forEach((el, i) => {
      gsap.to(el, { y: -8 - (i % 3) * 4, duration: 6 + (i % 5), repeat: -1, yoyo: true, ease: "sine.inOut", delay: i * 0.12 });
    });
    return () => tl.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  // evaluate winner
  useEffect(() => {
    const res = calculateWinner(board);
    if (res) {
      setGameOver(res);
      setStats((s) => ({ ...s, [res.winner]: (s[res.winner] || 0) + 1, matches: s.matches + 1 }));
      if (soundOn) {
        if (res.winner === "draw") play("draw");
        else play("win");
      }
      if (res.combo) {
        // glowing highlight and micro bounce
        const winners = res.combo.map((i) => cellsRef.current[i]);
        gsap.to(winners, { boxShadow: themeDark ? "0 8px 30px rgba(255,255,255,0.08)" : "0 8px 30px rgba(0,0,0,0.08)", y: -6, duration: 0.25, repeat: 5, yoyo: true });
        gsap.to(confettiRef.current, { y: -260, rotation: 360, duration: 1.2, stagger: 0.02, opacity: 1, ease: "power3.out" });
        setTimeout(() => gsap.to(confettiRef.current, { y: 0, opacity: 0, duration: 0.6, stagger: 0.01 }), 1100);
      }
    }
  }, [board, themeDark, soundOn]);

  // AI move effect
  useEffect(() => {
    if (mode !== "computer" || gameOver) return;
    if (!xIsNext) {
      setThinking(true);
      const availCount = board.filter((c) => !c).length;
      const baseDelay = difficulty === "easy" ? 200 : difficulty === "medium" ? 520 : 840;
      const delay = baseDelay + Math.min(600, (9 - availCount) * 60);
      const t = setTimeout(() => {
        const move = chooseAIMove(board, AI, HUMAN, difficulty);
        const finalMove = move != null ? move : board.findIndex((c) => c === null);
        if (finalMove !== -1 && finalMove != null) doMove(finalMove, AI);
        setThinking(false);
      }, delay);
      return () => clearTimeout(t);
    }
  }, [board, xIsNext, mode, gameOver, difficulty]);

  function doMove(idx, symbol, { record = true } = {}) {
    if (board[idx] || gameOver) return false;
    const nb = [...board];
    nb[idx] = symbol;
    setBoard(nb);
    if (record) {
      const newHistory = history.slice(0, step + 1).concat([nb]);
      setHistory(newHistory);
      setStep(newHistory.length - 1);
    }
    setXIsNext(symbol === "X" ? false : true);
    if (soundOn) play("move");
    const el = cellsRef.current[idx];
    if (el && !reducedMotion) {
      // New cell animation - subtle pulse with glow
      gsap.fromTo(el,
        {
          scale: 0.8,
          boxShadow: themeDark ? "0 0 20px rgba(255,255,255,0.3)" : "0 0 20px rgba(0,0,0,0.3)"
        },
        {
          scale: 1,
          boxShadow: "none",
          duration: 0.4,
          ease: "back.out(1.6)"
        }
      );

      // subtle ripple
      const ripple = document.createElement("span");
      ripple.className = "ripple absolute rounded-full pointer-events-none";
      el.appendChild(ripple);
      gsap.set(ripple, { width: 10, height: 10, opacity: 0.12, background: themeDark ? "#ffffff" : "#000000", xPercent: -50, yPercent: -50 });
      gsap.to(ripple, { width: 220, height: 220, opacity: 0, duration: 0.7, ease: "power2.out", onComplete: () => ripple.remove() });
    }
    return true;
  }

  function handleClick(idx) {
    if (gameOver) return;
    if (mode === "computer") {
      if (!xIsNext) return;
      doMove(idx, HUMAN);
    } else if (mode === "two-player") {
      // Fixed: Allow both players to play in hotseat mode
      doMove(idx, xIsNext ? "X" : "O");
    }
  }

  function undo() {
    if (step === 0) return;
    const newStep = Math.max(0, step - 1);
    setStep(newStep);
    setBoard(history[newStep]);
    setGameOver(null);
    if (soundOn) play("reset");
  }
  function redo() {
    if (step >= history.length - 1) return;
    const newStep = Math.min(history.length - 1, step + 1);
    setStep(newStep);
    setBoard(history[newStep]);
    setGameOver(null);
  }

  function restartRound(preserveScores = true) {
    if (!reducedMotion) {
      const tl = gsap.timeline();
      tl.to(".ttt-board", { opacity: 0.14, duration: 0.08 });
      tl.to(".ttt-board", { x: -8, duration: 0.06, repeat: 6, yoyo: true }, "-=.02");
      tl.to(".ttt-board", { opacity: 1, duration: 0.14 });
    }
    setBoard(Array(9).fill(null));
    setHistory([Array(9).fill(null)]);
    setStep(0);
    setXIsNext(true);
    setGameOver(null);
    setThinking(false);
    if (!preserveScores) setStats({ X: 0, O: 0, draw: 0, matches: 0 });
    if (soundOn) play("reset");
  }

  // replay history
  useEffect(() => {
    if (!replay) return;
    let i = 0;
    setBoard(history[0] || Array(9).fill(null));
    const id = setInterval(() => {
      i++;
      if (i >= history.length) {
        clearInterval(id);
        setReplay(false);
        return;
      }
      setBoard(history[i]);
    }, 420);
    return () => clearInterval(id);
  }, [replay]);

  // auto-play
  useEffect(() => {
    if (!autoPlay) return;
    restartRound(true);
    let alive = true;
    const run = async () => {
      while (alive) {
        const avail = board.map((v, i) => (v ? null : i)).filter((v) => v !== null);
        if (!avail.length) break;
        if (gameOver) break;
        const move = chooseAIMove(board, xIsNext ? AI : HUMAN, xIsNext ? HUMAN : AI, difficulty);
        doMove(move, xIsNext ? AI : HUMAN);
        await new Promise((r) => setTimeout(r, 420));
      }
    };
    run();
    return () => (alive = false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay]);

  const hint = useMemo(() => {
    if (gameOver) return null;
    const cur = xIsNext ? HUMAN : AI;
    const other = xIsNext ? AI : HUMAN;
    return chooseAIMove(board, cur, other, "hard");
  }, [board, xIsNext, gameOver]);

  // keyboard
  useEffect(() => {
    function onKey(e) {
      if (!isNaN(e.key) && e.key !== "0") {
        const idx = parseInt(e.key, 10) - 1;
        handleClick(idx);
      }
      if (e.key === "z" && (e.ctrlKey || e.metaKey)) undo();
      if (e.key === "y" && (e.ctrlKey || e.metaKey)) redo();
      if (e.key === "r") restartRound(true);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [board, xIsNext, gameOver, step, history]);

  const percent = (a, b) => (b === 0 ? "0%" : `${Math.round((a / b) * 100)}%`);

  // UI helpers (black & white)
  const bgClasses = themeDark ? "bg-black text-white" : "bg-white text-black";
  const cardBg = themeDark ? "bg-white/35 backdrop-blur-md" : "bg-black/6 backdrop-blur-md";
  const cellBorder = themeDark ? "border-white/12" : "border-black/12";
  const iconColor = themeDark ? "#ffffff" : "#000000";

  return (
    <MotionConfig reducedMotion={reducedMotion ? "user" : "never"}>
      <div ref={rootRef} className={`${bgClasses} min-h-screen flex items-center justify-center p-4 md:p-6 relative overflow-hidden`}>

        {/* Star Background */}
        <StarBackground themeDark={themeDark} />

        {/* subtle glass particles */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {[...Array(12)].map((_, i) => (
            <div key={i} ref={(el) => (bgParticles.current[i] = el)} style={{ left: `${(i + 1) * 7}%`, top: `${20 + (i % 3) * 6}%` }} className={`absolute w-28 h-28 rounded-full ${themeDark ? 'bg-white/2' : 'bg-black/2'} filter blur-2xl opacity-40`} />
          ))}
        </div>

        <div className="absolute inset-0 bg-grid-pattern opacity-10 dark:opacity-5 pointer-events-none" />
        <div className="border border-gray-300/60 bg-white/30 p-2 md:p-4 dark:bg-indigo-400/25 dark:shadow-[0_0_70px_rgba(124,58,237,0.2)] rounded-2xl backdrop-blur-sm">

          <div className={`glass-card ${cardBg} rounded-3xl shadow-2xl border ${cellBorder} p-4 md:p-6 dark:bg-gray-900 dark:shadow-[0_0_70px_rgba(124,58,237,10)] rounded-xl shadow-md relative z-20 w-full max-w-4xl`}>

            <div className="flex flex-col md:flex-row md:items-center text-black dark:text-white justify-between mb-4 gap-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${themeDark ? 'bg-white/8' : 'bg-black/8'} border ${cellBorder}`}>
                  <FaCrown themeDark={themeDark} />
                </div>
                <h1 className={`ttt-title text-xl md:text-2xl font-bold tracking-tight ${themeDark ? 'text-white' : 'text-white'}`}>Tic Tac Toe</h1>
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto">
                <button onClick={() => setSoundOn((s) => !s)} className={`p-2 rounded-md ${themeDark ? 'bg-white/6' : 'bg-white/60'}`} aria-label="toggle sound">
                  {soundOn ? <VolumeUpIcon themeDark={themeDark} /> : <VolumeMuteIcon themeDark={themeDark} />}
                </button>
                <button onClick={() => setThemeDark((s) => !s)} className={`p-2 rounded-md ${themeDark ? 'bg-white/6' : 'bg-white/60'}`} aria-label="toggle theme">
                  {themeDark ? <SunIcon themeDark={themeDark} /> : <MoonIcon themeDark={themeDark} />}
                </button>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row md:flex-wrap text-black dark:text-white items-stretch md:items-center gap-3 mb-6 ttt-panel">
              <div className="flex gap-2 flex-wrap">
                <label className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer ${themeDark ? 'bg-white/6' : 'bg-white/60'}`}>
                  <input type="radio" checked={mode === "two-player"} onChange={() => { setMode("two-player"); restartRound(); }} />
                  <span className={themeDark ? 'text-white' : 'text-black'}>Hotseat</span>
                </label>
                <label className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer ${themeDark ? 'bg-white/6' : 'bg-white/60'}`}>
                  <input type="radio" checked={mode === "computer"} onChange={() => { setMode("computer"); restartRound(); }} />
                  <span className={themeDark ? 'text-white' : 'text-black'}>Vs Computer</span>
                </label>
                <label className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer ${themeDark ? 'bg-white/6' : 'bg-white/60'}`}>
                  <input type="radio" checked={mode === "online"} onChange={() => { setMode("online"); restartRound(); }} />
                  <span className={themeDark ? 'text-white' : 'text-black'}>Online</span>
                </label>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select value={difficulty} onChange={(e) => { setDifficulty(e.target.value); restartRound(); }} className={`px-3 py-2 rounded-md ${themeDark ? 'bg-white/6' : 'bg-black/6'}`}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>

                <button onClick={() => restartRound()} className={`px-3 py-2 rounded-md ${themeDark ? 'bg-white/8 text-white' : 'bg-black text-white'}`}>Restart</button>
                <button onClick={() => { setStats({ X: 0, O: 0, draw: 0, matches: 0 }); localStorage.removeItem('ttt_stats'); }} className={`px-3 py-2 rounded-md ${themeDark ? 'bg-white/8 text-white' : 'bg-black text-white'}`}>Reset Stats</button>

                <button onClick={() => undo()} className={`px-3 py-2 rounded-md ${themeDark ? 'bg-white/6' : 'bg-white/10'} flex items-center gap-2`}><UndoIcon themeDark={themeDark} /><span className="hidden md:inline">Undo</span></button>
                <button onClick={() => redo()} className={`px-3 py-2 rounded-md ${themeDark ? 'bg-white/6' : 'bg-white/10'} flex items-center gap-2`}><RedoIcon themeDark={themeDark} /><span className="hidden md:inline">Redo</span></button>

                <button onClick={() => setReplay(true)} className={`px-3 py-2 rounded-md ${themeDark ? 'bg-white/8 text-white' : 'bg-black text-white'}`}>Replay</button>
                <button onClick={() => setAutoPlay((s) => !s)} className={`px-3 py-2 rounded-md ${autoPlay ? 'bg-red-600 text-white' : themeDark ? 'bg-white/6' : 'bg-black/6'}`}>{autoPlay ? 'Stop' : 'AI Auto'}</button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Board */}
              <div className={`ttt-board grid grid-cols-3 items-center justify-center mx-auto  md:mt-15 gap-3 md:gap-4 p-3 md:p-5 rounded-xl ${themeDark ? 'bg-black/10' : 'bg-white/8'} ${cellBorder} w-full md:w-auto`} ref={boardRef}>
                {board.map((cell, i) => (
                  <motion.button
                    key={i}
                    ref={(el) => (cellsRef.current[i] = el)}
                    onClick={() => handleClick(i)}
                    whileTap={{ scale: 0.95 }}
                    className={`ttt-cell relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 flex items-center justify-center text-3xl sm:text-4xl md:text-5xl font-extrabold rounded-lg ${themeDark ? 'bg-black/60' : 'bg-white/40'} border ${cellBorder} transition-transform ${!cell && !gameOver ? 'hover:scale-105 cursor-pointer' : 'opacity-90 cursor-default'}`}
                    aria-label={`Cell ${i + 1}`}
                    disabled={!!cell || !!gameOver || (mode === 'computer' && !xIsNext)}
                  >
                    {cell ? (
                      <span style={{ color: themeDark ? '#fff' : '#000' }} className="flex items-center justify-center">
                        <span className="sr-only">{cell}</span>
                        {cell === 'X' ?
                          <TimesIcon className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" themeDark={themeDark} /> :
                          <CircleIcon className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" themeDark={themeDark} />
                        }
                      </span>
                    ) : (
                      <span className={`${themeDark ? 'text-white/40' : 'text-black/30'}`}>{hint === i ? '' : ''}</span>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Sidebar */}
              <div className="flex-1 min-w-0 w-full md:min-w-[240px]">
                <div className="mb-3 ttt-panel">
                  <div className={`p-3 rounded-lg ${themeDark ? 'bg-black/10' : 'bg-white/50'} border ${cellBorder}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${xIsNext ? (themeDark ? 'bg-white' : 'bg-black') : (themeDark ? 'bg-white/50' : 'bg-black/50')}`} />
                        <div className={`font-medium ${themeDark ? 'text-white' : 'text-black'}`}>Turn: <span className={themeDark ? 'text-white' : 'text-black'}>{xIsNext ? 'X' : 'O'}</span></div>
                      </div>
                      <div className={`text-sm ${themeDark ? 'text-white/60' : 'text-black/60'}`}>{gameOver ? (gameOver.winner === 'draw' ? 'Draw' : `${gameOver.winner} wins`) : 'In progress'}</div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className={`p-2 rounded-md text-center ${themeDark ? 'bg-white/6 text-white' : 'bg-black/6 text-black'}`}>
                        <div className="font-bold">X</div>
                        <div>{stats.X}</div>
                      </div>
                      <div className={`p-2 rounded-md text-center ${themeDark ? 'bg-white/6 text-white' : 'bg-black/6 text-black'}`}>
                        <div className="font-bold">O</div>
                        <div>{stats.O}</div>
                      </div>
                      <div className={`p-2 rounded-md text-center ${themeDark ? 'bg-white/6 text-white' : 'bg-black/6 text-black'}`}>
                        <div className="font-bold">Draws</div>
                        <div>{stats.draw}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-3 ttt-panel">
                  <div className={`p-3 rounded-lg ${themeDark ? 'bg-black/10' : 'bg-white/50'} border ${cellBorder}`}>
                    <div className="flex items-center justify-between mb-2"><strong className={themeDark ? 'text-white' : 'text-black'}>History</strong><small className={`text-sm ${themeDark ? 'text-white/60' : 'text-black/60'}`}>Step {step}/{history.length - 1}</small></div>
                    <input type="range" min={0} max={history.length - 1} value={step} onChange={(e) => { const s = Number(e.target.value); setStep(s); setBoard(history[s]); setGameOver(null); }} className="w-full" />

                    <div className="mt-2 flex flex-wrap gap-2">
                      {history.map((h, idx) => (
                        <button key={idx} onClick={() => { setStep(idx); setBoard(history[idx]); setGameOver(null); }} className={`px-2 py-1 text-sm rounded ${idx === step ? (themeDark ? 'bg-white text-black' : 'bg-black text-white') : (themeDark ? 'bg-white/6 text-white' : 'bg-black/6 text-black')}`}>#{idx}</button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mb-3 ttt-panel">
                  <div className={`p-3 rounded-lg ${themeDark ? 'bg-black/10' : 'bg-white/50'} border ${cellBorder}`}>
                    <div className="flex items-center justify-between mb-2"><strong className={themeDark ? 'text-white' : 'text-black'}>Options</strong></div>
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => soundOn && play('move')} className={`px-3 py-2 rounded ${themeDark ? 'bg-white/6 text-white' : 'bg-black/6 text-black'}`}>Test Move</button>
                      <button onClick={() => { setReplay(true); }} className={`px-3 py-2 rounded ${themeDark ? 'bg-white/6 text-white' : 'bg-black/6 text-black'}`}>Replay Match</button>
                      <button onClick={() => { setBoard(history[history.length - 1]); setStep(history.length - 1); }} className={`px-3 py-2 rounded ${themeDark ? 'bg-white/6 text-white' : 'bg-black/6 text-black'}`}>Jump to End</button>
                      <button onClick={() => { /* hint noop */ }} className={`px-3 py-2 rounded ${themeDark ? 'bg-white/6 text-white' : 'bg-black/6 text-black'}`}>Hint</button>
                    </div>
                  </div>
                </div>

                <div className="mb-3 ttt-panel">
                  <div className={`p-3 rounded-lg ${themeDark ? 'bg-black/10' : 'bg-white/50'} border ${cellBorder}`}>
                    <strong className={themeDark ? 'text-white' : 'text-black'}>Leaderboard</strong>
                    <div className={`mt-2 text-sm ${themeDark ? 'text-white/60' : 'text-black/60'}`}>Matches: {stats.matches} • X win%: {percent(stats.X, stats.matches)} • O win%: {percent(stats.O, stats.matches)}</div>
                  </div>
                </div>

                <div className={`text-xs ${themeDark ? 'text-white' : 'text-white'}`}>Controls: keys 1-9 to play, Ctrl/Cmd+Z undo, R restart.</div>
              </div>
            </div>

            {/* win/draw banner */}
            <div className="mt-6 flex items-center flex-row justify-center">
              {gameOver && (
                <div className={`px-4 py-2 rounded-full ${themeDark ? 'bg-white/8 text-white' : 'bg-black text-white'}`}>{gameOver.winner === 'draw' ? 'It\'s a Draw!' : `${gameOver.winner} Wins!`}</div>
              )}
            </div>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent w-full mt-2 md:mt-2 origin-left">
              </div>
            <br />
            <footer className="mt-6 flex items-center text-black dark:text-white justify-center gap-5 text-center text-sm opacity-80">
              copyright &copy; {new Date().getFullYear()} {" "}
              <a
                href="https://linkedin.com/in/nagaruthwikmerugu/"
                target="_blank"
                rel="noreferrer"
                className={`underline flex items-center text-black dark:text-white  justify-center gap-2 ${themeDark ? "text-white" : "text-black"}`}
              >
                <FaLinkedin/> Nagaruthwik Merugu
              </a>
            </footer>
          </div>

        </div>



        {/* Confetti canvas (react-confetti) */}
        {gameOver?.winner && gameOver.winner !== 'draw' && <Confetti recycle={false} numberOfPieces={220} />}

        {/* CSS for star animation */}
        <style jsx>{`
          @keyframes starPulse {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 1; }
          }
          .glass-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 1em;
            height: 1em;
          }
        `}</style>
      </div>
    </MotionConfig>
  );
}