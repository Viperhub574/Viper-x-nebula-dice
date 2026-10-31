import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ColorId, GAME_COLORS, RollRecord } from './types';
import { DiceArena } from './components/DiceArena';
import { HistoryStats } from './components/HistoryStats';
import { GuessMiniGame } from './components/GuessMiniGame';
import { soundManager } from './utils/sound';
import confetti from 'canvas-confetti';
import { Sparkles, HelpCircle, X, ShieldCheck, Eye, EyeOff } from 'lucide-react';

export default function App() {
  // 4 Dice colors state
  const [diceColors, setDiceColors] = useState<ColorId[]>([
    'kirmizi',
    'mavi',
    'yesil',
    'sari',
  ]);

  // Block Color state
  const [blockedColor, setBlockedColor] = useState<ColorId | null>(null);

  // Streamer Mode state (Yayıncı Modu)
  const [isStreamerMode, setIsStreamerMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('viper_dice_streamer_mode') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleStreamerMode = () => {
    setIsStreamerMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('viper_dice_streamer_mode', String(next));
      } catch {
        // ignore
      }
      return next;
    });
    soundManager.playTick();
  };

  // Keybind state (default 'r' as requested)
  const [cycleKey, setCycleKey] = useState<string>(() => {
    try {
      return localStorage.getItem('viper_dice_cycle_key') || 'r';
    } catch {
      return 'r';
    }
  });

  const handleSetCycleKey = (newKey: string) => {
    setCycleKey(newKey);
    try {
      localStorage.setItem('viper_dice_cycle_key', newKey);
    } catch {
      // ignore
    }
  };

  // Game / Roll state
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [lastCombo, setLastCombo] = useState<string | null>(null);

  // History state
  const [history, setHistory] = useState<RollRecord[]>([]);

  // Sound state
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.getMuted());

  // Help modal
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  // Ref to hold current state for keyboard listener
  const isRollingRef = useRef(isRolling);
  isRollingRef.current = isRolling;

  // Toggle Mute
  const handleToggleMute = () => {
    const nextMuted = soundManager.toggleMute();
    setIsMuted(nextMuted);
  };

  // Analyze combo
  const detectCombo = (colors: ColorId[]): string | null => {
    const counts: Record<string, number> = {};
    colors.forEach((c) => (counts[c] = (counts[c] || 0) + 1));
    const vals = Object.values(counts);

    if (vals.includes(4)) {
      return 'DÖRTTE DÖRT! JACKPOT! 🌟';
    }
    if (vals.includes(3)) {
      return 'Üçlü Eşleşme! ✨';
    }
    if (vals.filter((v) => v === 2).length === 2) {
      return 'Çift Çift! 🎲';
    }
    if (new Set(colors).size === 4) {
      return 'Gökkuşağı (4 Farklı Renk)! 🌈';
    }
    return null;
  };

  // Primary Dice Roll function
  const executeRoll = useCallback(() => {
    if (isRollingRef.current) return;

    // Available colors pool: strictly exclude the blocked color!
    const availableColors = GAME_COLORS.filter((c) => c.id !== blockedColor).map(
      (c) => c.id
    );

    // 4 independent draws with replacement from available colors
    let chosenColors: ColorId[] = Array.from({ length: 4 }, () => {
      const randomIndex = Math.floor(Math.random() * availableColors.length);
      return availableColors[randomIndex];
    });

    // Guarantee assertion
    if (blockedColor && chosenColors.includes(blockedColor)) {
      chosenColors = chosenColors.map((c) =>
        c === blockedColor ? availableColors[0] : c
      );
    }

    setIsRolling(true);
    soundManager.playDiceShake();

    // Rapid flashing tumble animation during roll
    const tumbleInterval = setInterval(() => {
      setDiceColors([
        availableColors[Math.floor(Math.random() * availableColors.length)],
        availableColors[Math.floor(Math.random() * availableColors.length)],
        availableColors[Math.floor(Math.random() * availableColors.length)],
        availableColors[Math.floor(Math.random() * availableColors.length)],
      ]);
    }, 70);

    // Complete roll after 700ms
    setTimeout(() => {
      clearInterval(tumbleInterval);
      setDiceColors(chosenColors);
      soundManager.playDiceLand();

      // Check combo
      const combo = detectCombo(chosenColors);
      setLastCombo(combo);

      if (combo?.includes('JACKPOT')) {
        soundManager.playCelebration();
        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }
      }

      // Record roll to history
      const newRecord: RollRecord = {
        id: `roll-${Date.now()}-${Math.random()}`,
        roundNumber: roundNumber,
        diceColors: chosenColors,
        blockedColor: blockedColor,
        mode: 'free',
        timestamp: Date.now(),
        comboLabel: combo || undefined,
      };

      setHistory((prev) => [newRecord, ...prev]);
      setRoundNumber((prev) => prev + 1);
      setIsRolling(false);
    }, 700);
  }, [blockedColor, roundNumber]);

  // Block Color Selection
  const handleSelectBlockColor = (colorId: ColorId | null) => {
    setBlockedColor(colorId);
    if (colorId) {
      soundManager.playBlockLock();
    } else {
      soundManager.playTick();
    }
  };

  // Cycle blocked color to next: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 1 ...
  const handleCycleBlockedColor = useCallback(() => {
    const currentIndex = GAME_COLORS.findIndex((c) => c.id === blockedColor);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % GAME_COLORS.length;
    const nextColor = GAME_COLORS[nextIndex].id;
    setBlockedColor(nextColor);
    soundManager.playBlockLock();
  }, [blockedColor]);

  // Keyboard shortcut listener (Space = ROLL, CycleKey = Next Block Color, M = Mute, Y = Yayıncı Modu)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        executeRoll();
      } else if (e.key.toLowerCase() === cycleKey.toLowerCase()) {
        e.preventDefault();
        handleCycleBlockedColor();
      } else if (e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleToggleStreamerMode();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        handleToggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [executeRoll, cycleKey, handleCycleBlockedColor]);

  return (
    <div className="min-h-screen bg-[#0A0B10] text-neutral-100 flex flex-col font-sans selection:bg-purple-500/30 selection:text-purple-200">
      {/* Background Starfield / Cosmic Nebula Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-900/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-900/15 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-indigo-900/15 rounded-full blur-[120px]" />
      </div>

      {/* Top Navbar */}
      <header className="border-b border-neutral-800/80 bg-neutral-900/70 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo Badge */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/20 ring-1 ring-white/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white uppercase font-mono">
                Viper X Nebula Dice
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 font-mono font-bold border border-purple-800/60 hidden sm:inline-block">
                PRO
              </span>
              {isStreamerMode && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 font-bold border border-rose-800 animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  Yayıncı Modu
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-400">
              4 Zar &bull; 6 Canlı Renk &bull; Yayıncı Modu &bull; Tuş Ataması
            </p>
          </div>
        </div>

        {/* Header Right */}
        <div className="flex items-center gap-2.5">
          {/* Header Streamer Mode Toggle */}
          <button
            onClick={handleToggleStreamerMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              isStreamerMode
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/40 ring-2 ring-rose-400/80'
                : 'bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 hover:text-white'
            }`}
            title="Yayıncı Modu: Renkleri blurlar ve olduğundan farklı gösterir (Kısayol: Y)"
          >
            {isStreamerMode ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Yayıncı: Aktif</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-neutral-400" />
                <span className="hidden sm:inline">Yayıncı Modu</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowHelpModal(true)}
            className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 hover:text-white transition-colors"
            title="Kurallar & Kılavuz"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 relative z-10">
        {/* 1. Main Dice Arena with Streamer Mode, ROLL button, inline small colors & custom Keybind */}
        <section aria-label="Viper X Nebula Zar Alanı">
          <DiceArena
            diceColors={diceColors}
            isRolling={isRolling}
            roundNumber={roundNumber}
            blockedColor={blockedColor}
            onSelectBlockColor={handleSelectBlockColor}
            onRoll={executeRoll}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            lastCombo={lastCombo}
            cycleKey={cycleKey}
            onSetCycleKey={handleSetCycleKey}
            isStreamerMode={isStreamerMode}
            onToggleStreamerMode={handleToggleStreamerMode}
          />
        </section>

        {/* 2. Interactive Guess Mini Game */}
        <section aria-label="Tahmin Oyunu">
          <GuessMiniGame
            lastRollColors={diceColors}
            roundNumber={roundNumber}
          />
        </section>

        {/* 3. History & Color Frequency Statistics */}
        <section aria-label="Geçmiş ve İstatistikler">
          <HistoryStats
            history={history}
            onClearHistory={() => setHistory([])}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-neutral-800/80 py-4 px-6 text-center text-xs text-neutral-500 relative z-10">
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Viper X Nebula Dice &bull; Yayıncı Modu &bull; Engellenen renk %100 filtrelenir</span>
        </div>
      </footer>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700/80 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setShowHelpModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Viper X Nebula Dice — Kurallar
            </h3>

            <div className="space-y-3 text-xs text-neutral-300 leading-relaxed mt-4">
              <p>
                <strong>1. 4 Renk Zarı:</strong> Her atışta 4 adet zar ROLL butonuyla aynı anda atılır. 6 renk mevcuttur:
                <span className="text-red-400 font-bold ml-1">Kırmızı</span>,
                <span className="text-blue-400 font-bold ml-1">Mavi</span>,
                <span className="text-emerald-400 font-bold ml-1">Yeşil</span>,
                <span className="text-amber-400 font-bold ml-1">Sarı</span>,
                <span className="text-purple-400 font-bold ml-1">Mor</span> ve
                <span className="text-orange-400 font-bold ml-1">Turuncu</span>.
              </p>
              <p>
                <strong>2. Yayıncı Modu (Streamer Mode):</strong> 
                Yayın yaparken izleyicilerden renkleri saklamak için <strong>&quot;Yayıncı Modu&quot;</strong> butonuna basabilirsiniz (veya <kbd className="px-1 py-0.5 rounded bg-neutral-800 border border-neutral-700 font-mono text-white">Y</kbd> tuşuna basın). 
                Renkler anında <strong>blurlanır</strong> ve <strong>olduğundan tamamen farklı tonlara dönüşerek</strong> kamufle edilir. Modu kapatınca her şey anında orijinal net haline geri döner.
              </p>
              <p>
                <strong>3. Sıralı Renk Engelleme (Keybind):</strong> 
                Renklerin yanındaki <strong>&quot;Tuş&quot;</strong> kutucuğuna belirlediğiniz harfe (varsayılan: <strong>R</strong>) her bastığınızda engellenen renk sırayla değişir:
                <br />
                <span className="text-neutral-400 font-mono text-[11px] block mt-1">
                  1. Kırmızı &rarr; 2. Mavi &rarr; 3. Yeşil &rarr; 4. Sarı &rarr; 5. Mor &rarr; 6. Turuncu &rarr; En baştan (Kırmızı)
                </span>
              </p>
              <p>
                <strong>4. Klavye Kısayolları:</strong>
                <br />
                <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 font-mono text-white mr-1">
                  Space
                </kbd>{' '}
                = ROLL (Zarları At)
                <br />
                <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 font-mono text-amber-300 font-bold mr-1 mt-1 inline-block">
                  {cycleKey.toUpperCase()}
                </kbd>{' '}
                = Sıradaki Rengi Engelle
                <br />
                <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 font-mono text-rose-300 font-bold mr-1 mt-1 inline-block">
                  Y
                </kbd>{' '}
                = Yayıncı Modunu Aç / Kapat
                <br />
                <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 font-mono text-white mr-1 mt-1 inline-block">
                  M
                </kbd>{' '}
                = Sesi Aç / Kapat
              </p>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="mt-6 w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors shadow-lg shadow-purple-600/30"
            >
              Tamam, Oyna!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
