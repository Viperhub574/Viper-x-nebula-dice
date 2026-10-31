import React from 'react';
import { ColorId, GAME_COLORS, GameColor } from '../types';

interface Dice3DProps {
  colorId: ColorId;
  isRolling: boolean;
  dieIndex: number;
  onClick?: () => void;
  isStreamerMode?: boolean;
}

export const Dice3D: React.FC<Dice3DProps> = ({
  colorId,
  isRolling,
  dieIndex,
  onClick,
  isStreamerMode = false,
}) => {
  const currentColor: GameColor =
    GAME_COLORS.find((c) => c.id === colorId) || GAME_COLORS[0];

  const count = currentColor.pips;
  const isYellow = currentColor.id === 'sari';

  // Authentic pip positions for dice 1..6
  const renderPips = () => {
    const pipBaseClass = isYellow && !isStreamerMode
      ? 'bg-neutral-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),0_1px_1px_rgba(255,255,255,0.4)]'
      : 'bg-white shadow-[inset_0_2px_3px_rgba(0,0,0,0.3),0_2px_4px_rgba(0,0,0,0.4)]';

    return (
      <div className="relative w-16 h-16 sm:w-18 sm:h-18 p-1">
        {/* Pip 1 (Center) */}
        {[1, 3, 5].includes(count) && (
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${
              count === 1 ? 'w-4 h-4 sm:w-5 sm:h-5 ring-2 ring-black/10' : 'w-3 h-3 sm:w-3.5 sm:h-3.5'
            } rounded-full ${pipBaseClass}`}
          />
        )}

        {/* Top-Left */}
        {[2, 3, 4, 5, 6].includes(count) && (
          <div
            className={`absolute top-2 left-2 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full ${pipBaseClass}`}
          />
        )}

        {/* Bottom-Right */}
        {[2, 3, 4, 5, 6].includes(count) && (
          <div
            className={`absolute bottom-2 right-2 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full ${pipBaseClass}`}
          />
        )}

        {/* Top-Right */}
        {[4, 5, 6].includes(count) && (
          <div
            className={`absolute top-2 right-2 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full ${pipBaseClass}`}
          />
        )}

        {/* Bottom-Left */}
        {[4, 5, 6].includes(count) && (
          <div
            className={`absolute bottom-2 left-2 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full ${pipBaseClass}`}
          />
        )}

        {/* Middle-Left (for 6) */}
        {count === 6 && (
          <div
            className={`absolute top-1/2 left-2 -translate-y-1/2 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full ${pipBaseClass}`}
          />
        )}

        {/* Middle-Right (for 6) */}
        {count === 6 && (
          <div
            className={`absolute top-1/2 right-2 -translate-y-1/2 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full ${pipBaseClass}`}
          />
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center select-none">
      {/* Interactive Dice Container */}
      <div
        onClick={onClick}
        className="relative cursor-pointer group py-2"
        title={
          isStreamerMode
            ? 'Yayıncı Modu Aktif: Renk gizlendi ve blurlanmış durumda'
            : `Zar #${dieIndex + 1}: ${currentColor.name} (${currentColor.pips}) - Tıklayarak zarları atabilirsiniz`
        }
      >
        {/* Dice Die Body with 3D Depth & Streamer Camouflage */}
        <div
          className={`relative transition-all duration-300 ease-out transform ${
            isRolling
              ? 'animate-dice-bounce scale-105'
              : 'group-hover:-translate-y-1 group-active:translate-y-0.5'
          }`}
          style={{
            transform: isRolling ? undefined : 'rotate(0deg)',
            // Yayıncı Modu: Renkler blurlanır ve hue-rotate ile olduğundan tamamen farklı görünür
            filter: isStreamerMode
              ? 'blur(8px) hue-rotate(150deg) saturate(190%) contrast(1.15)'
              : 'none',
          }}
        >
          {/* Bottom bevel base for true 3D thickness */}
          <div
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl transition-all duration-200"
            style={{
              backgroundColor: currentColor.darkHex,
              boxShadow: `0 10px 0 ${currentColor.darkHex}, 0 16px 24px -4px rgba(0,0,0,0.7), 0 0 20px ${currentColor.glowHex}`,
            }}
          >
            {/* Top Face of the die */}
            <div
              className="w-full h-full rounded-2xl p-2.5 flex flex-col items-center justify-between relative overflow-hidden transition-colors duration-200"
              style={{
                backgroundColor: currentColor.hex,
                backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.1) 40%, rgba(0,0,0,0.15) 85%, rgba(0,0,0,0.35) 100%)`,
                boxShadow:
                  'inset 0 2px 3px rgba(255,255,255,0.7), inset 0 -3px 6px rgba(0,0,0,0.3), inset 0 0 1px 1px rgba(255,255,255,0.3)',
              }}
            >
              {/* Glossy top-left reflective glass highlight */}
              <div
                className="absolute -top-6 -left-6 w-16 h-16 rounded-full bg-white/35 blur-[6px] pointer-events-none"
              />

              {/* Header inside die: Color name & pip number */}
              <div className="w-full flex items-center justify-between px-1 z-10">
                <span
                  className="text-[10px] sm:text-[11px] font-black tracking-wider uppercase font-mono"
                  style={{
                    color: currentColor.textColor,
                    textShadow: isYellow && !isStreamerMode
                      ? 'none'
                      : '0 1px 2px rgba(0,0,0,0.6)',
                  }}
                >
                  {isStreamerMode ? '???' : currentColor.name}
                </span>
                <span
                  className="text-[11px] sm:text-xs font-black font-mono"
                  style={{
                    color: currentColor.textColor,
                    textShadow: isYellow && !isStreamerMode
                      ? 'none'
                      : '0 1px 2px rgba(0,0,0,0.6)',
                  }}
                >
                  {isStreamerMode ? '?' : currentColor.pips}
                </span>
              </div>

              {/* Pip area */}
              <div className="flex-1 flex items-center justify-center z-10">
                {renderPips()}
              </div>

              {/* Bottom decorative bar */}
              <div className="w-full flex justify-center z-10">
                <div
                  className="h-1 w-7 rounded-full opacity-60"
                  style={{ backgroundColor: currentColor.textColor }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Ambient Ground Shadow */}
        <div
          className={`w-20 sm:w-22 h-3.5 mx-auto mt-4 rounded-full bg-black/60 blur-[6px] transition-all duration-300 ${
            isRolling ? 'animate-dice-shadow' : 'group-hover:scale-95 group-hover:opacity-40'
          }`}
        />
      </div>

      {/* Die Index & Color Tag below die */}
      <div className="mt-0.5 flex flex-col items-center">
        <span className="text-[11px] text-neutral-400 font-mono font-medium">
          Zar #{dieIndex + 1}
        </span>
        <div
          className="mt-1 px-3 py-0.5 rounded-full text-xs font-black tracking-wide flex items-center gap-1.5 border shadow-sm transition-all"
          style={{
            backgroundColor: isStreamerMode ? '#3f3f4622' : `${currentColor.hex}22`,
            borderColor: isStreamerMode ? '#71717a' : `${currentColor.hex}70`,
            color: isStreamerMode ? '#e4e4e7' : currentColor.hex,
            boxShadow: isStreamerMode
              ? '0 0 10px rgba(161,161,170,0.2)'
              : `0 0 10px ${currentColor.glowHex}`,
          }}
        >
          <span
            className="w-2 h-2 rounded-full inline-block transition-all"
            style={{
              backgroundColor: currentColor.hex,
              filter: isStreamerMode ? 'blur(3px) hue-rotate(150deg)' : 'none',
            }}
          />
          <span>{isStreamerMode ? 'GİZLİ RENK' : currentColor.name}</span>
        </div>
      </div>
    </div>
  );
};
