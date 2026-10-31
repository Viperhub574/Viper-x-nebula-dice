import React, { useState } from 'react';
import { ColorId, GAME_COLORS, GameColor } from '../types';
import { ShieldAlert, Shuffle, Ban, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface BlockColorPanelProps {
  blockedColor: ColorId | null;
  onSelectBlockColor: (colorId: ColorId | null) => void;
  onRollWithRandomBlock: () => void;
  isRolling: boolean;
  autoRandomBlock: boolean;
  onToggleAutoRandomBlock: (enabled: boolean) => void;
}

export const BlockColorPanel: React.FC<BlockColorPanelProps> = ({
  blockedColor,
  onSelectBlockColor,
  onRollWithRandomBlock,
  isRolling,
  autoRandomBlock,
  onToggleAutoRandomBlock,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [highlightedColorId, setHighlightedColorId] = useState<ColorId | null>(null);

  // Trigger exciting animated roulette to pick random block color
  const handlePickRandomBlock = () => {
    if (isSpinning || isRolling) return;
    setIsSpinning(true);
    soundManager.playDiceShake();

    const colorList = GAME_COLORS.map((c) => c.id);
    let step = 0;
    const totalSteps = 16 + Math.floor(Math.random() * 8);
    let currentInterval = 40;

    const runRoulette = () => {
      const randomIdx = Math.floor(Math.random() * colorList.length);
      const chosenColor = colorList[randomIdx];
      setHighlightedColorId(chosenColor);
      soundManager.playTick();

      step++;
      if (step < totalSteps) {
        currentInterval += 12; // slow down gradually
        setTimeout(runRoulette, currentInterval);
      } else {
        // Final pick
        const finalColor = colorList[Math.floor(Math.random() * colorList.length)];
        setHighlightedColorId(finalColor);
        onSelectBlockColor(finalColor);
        soundManager.playBlockLock();
        setTimeout(() => {
          setIsSpinning(false);
          setHighlightedColorId(null);
        }, 300);
      }
    };

    runRoulette();
  };

  const currentBlockedObj = GAME_COLORS.find((c) => c.id === blockedColor);

  return (
    <div className="w-full bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
            <Ban className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-neutral-100">Block Color (Renk Engelleme)</h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-950/80 text-red-300 border border-red-800/60">
                Kural Koruyucu
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Seçtiğin veya rastgele belirlenen renk bu tur zarlarda <strong className="text-red-400 font-semibold">ASLA çıkmayacak</strong>.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Pick Random Block Color button */}
          <button
            onClick={handlePickRandomBlock}
            disabled={isSpinning || isRolling}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md active:scale-95 ${
              isSpinning
                ? 'bg-amber-600/70 cursor-wait'
                : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 hover:shadow-orange-500/25'
            }`}
            title="Rastgele bir renk seçip engeller"
          >
            <Shuffle className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
            {isSpinning ? 'Seçiliyor...' : 'Rastgele Block Seç'}
          </button>

          {/* Random Block & Roll combo button */}
          <button
            onClick={onRollWithRandomBlock}
            disabled={isSpinning || isRolling}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 shadow-md hover:shadow-red-500/25 transition-all active:scale-95"
            title="Önce rastgele bir rengi engeller, ardından zarları atar"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Rastgele Blockla & Zar At</span>
          </button>
        </div>
      </div>

      {/* 6 Colors Selection Grid */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold text-neutral-300">
            Bir renge tıklayarak engelle veya aşağıdaki butonla rastgele seç:
          </span>
          {blockedColor && (
            <button
              onClick={() => onSelectBlockColor(null)}
              className="text-xs text-neutral-400 hover:text-neutral-200 underline decoration-neutral-600 flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Engeli Kaldır (Tüm Renkler Serbest)
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {GAME_COLORS.map((col: GameColor) => {
            const isBlocked = blockedColor === col.id;
            const isRouletteActive = highlightedColorId === col.id;

            return (
              <button
                key={col.id}
                onClick={() => onSelectBlockColor(isBlocked ? null : col.id)}
                disabled={isRolling || isSpinning}
                className={`relative group rounded-xl p-3 border transition-all duration-200 text-left flex flex-col justify-between h-22 overflow-hidden ${
                  isRouletteActive
                    ? 'ring-4 ring-amber-400 scale-105 z-10'
                    : ''
                } ${
                  isBlocked
                    ? 'bg-red-950/40 border-red-500/70 shadow-lg shadow-red-950/50'
                    : 'bg-neutral-800/60 border-neutral-700/70 hover:border-neutral-500 hover:bg-neutral-800'
                }`}
              >
                {/* Diagonal striping for blocked item */}
                {isBlocked && (
                  <div
                    className="absolute inset-0 opacity-15 pointer-events-none"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(45deg, #EF4444 0, #EF4444 8px, transparent 8px, transparent 16px)',
                    }}
                  />
                )}

                {/* Top row: Color Dot & Pip count */}
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full ring-2 ring-white/20 shadow-sm"
                      style={{ backgroundColor: col.hex }}
                    />
                    <span className="text-xs font-bold text-neutral-100">{col.name}</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono">#{col.pips}</span>
                </div>

                {/* Status indicator bottom */}
                <div className="z-10 mt-auto pt-2">
                  {isBlocked ? (
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-600 text-white text-[11px] font-extrabold tracking-wide shadow-sm animate-pulse">
                      <Ban className="w-3 h-3" />
                      ENGELLENDİ
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1 text-[11px] text-neutral-400 group-hover:text-emerald-400 transition-colors">
                      <CheckCircle2 className="w-3 h-3 text-neutral-500 group-hover:text-emerald-400" />
                      <span>Aktif (Çıkabilir)</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Status Info Footer */}
      <div className="mt-4 pt-3 border-t border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          {currentBlockedObj ? (
            <div className="flex items-center gap-2 text-neutral-300">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span>
                Aktif Engel:{' '}
                <strong
                  className="px-2 py-0.5 rounded font-bold uppercase text-[11px]"
                  style={{
                    backgroundColor: `${currentBlockedObj.hex}25`,
                    color: currentBlockedObj.hex,
                    border: `1px solid ${currentBlockedObj.hex}60`,
                  }}
                >
                  {currentBlockedObj.name}
                </strong>
                {' — '}
                Kalan <strong className="text-emerald-400">5 renk</strong> arasından 4 zar seçilecek.
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>
                Şu an hiçbir renk engellenmedi. 6 rengin tümü zarlarda gelebilir.
              </span>
            </div>
          )}
        </div>

        {/* Auto randomize toggle */}
        <label className="flex items-center gap-2 text-neutral-300 cursor-pointer select-none hover:text-white transition-colors">
          <input
            type="checkbox"
            checked={autoRandomBlock}
            onChange={(e) => onToggleAutoRandomBlock(e.target.checked)}
            className="w-4 h-4 rounded border-neutral-700 text-orange-500 focus:ring-orange-500/40 bg-neutral-800 cursor-pointer"
          />
          <span className="text-xs">Her tur otomatik yeni block renk seç</span>
        </label>
      </div>
    </div>
  );
};
