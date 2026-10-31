import React from 'react';
import { ColorId, GAME_COLORS, GameColor } from '../types';
import { Dice3D } from './Dice3D';
import { Dices, Volume2, VolumeX, Ban, Flame, RotateCcw, Keyboard, Eye, EyeOff } from 'lucide-react';

interface DiceArenaProps {
  diceColors: ColorId[];
  isRolling: boolean;
  roundNumber: number;
  blockedColor: ColorId | null;
  onSelectBlockColor: (colorId: ColorId | null) => void;
  onRoll: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  lastCombo?: string | null;
  cycleKey: string;
  onSetCycleKey: (key: string) => void;
  isStreamerMode: boolean;
  onToggleStreamerMode: () => void;
}

export const DiceArena: React.FC<DiceArenaProps> = ({
  diceColors,
  isRolling,
  roundNumber,
  blockedColor,
  onSelectBlockColor,
  onRoll,
  isMuted,
  onToggleMute,
  lastCombo,
  cycleKey,
  onSetCycleKey,
  isStreamerMode,
  onToggleStreamerMode,
}) => {
  return (
    <div className="w-full bg-gradient-to-b from-neutral-900/95 via-neutral-900/90 to-neutral-950 border border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
      {/* Nebula cosmic ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Arena Top Toolbar: Tur & Inline Renkler + Keybind + Yayıncı Modu */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-800/80">
        {/* Left side: Tur #X + Küçük Renkler + Keybind */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Tur Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-950/80 border border-neutral-800 shadow-inner">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <span className="text-xs font-mono font-black tracking-wider text-neutral-200 uppercase">
              Tur #{roundNumber}
            </span>
          </div>

          {/* KÜÇÜK RENKLER KAPSAYICISI */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-xl bg-neutral-950/80 border border-neutral-800/90 shadow-sm">
            {/* Small circular chips for all colors in the game */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              {GAME_COLORS.map((col: GameColor) => {
                const isBlocked = blockedColor === col.id;

                return (
                  <button
                    key={col.id}
                    onClick={() => onSelectBlockColor(isBlocked ? null : col.id)}
                    disabled={isRolling}
                    className={`relative w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all duration-200 select-none group ${
                      isBlocked
                        ? 'ring-2 ring-red-500 scale-110 shadow-[0_0_12px_rgba(239,68,68,0.7)]'
                        : 'hover:scale-115 opacity-80 hover:opacity-100 hover:ring-2 hover:ring-white/40'
                    }`}
                    style={{
                      backgroundColor: col.hex,
                      boxShadow: isBlocked
                        ? '0 0 10px rgba(239, 68, 68, 0.8)'
                        : `0 1px 3px rgba(0,0,0,0.5)`,
                      filter: isStreamerMode ? 'blur(3px) hue-rotate(150deg)' : 'none',
                    }}
                    title={
                      isStreamerMode
                        ? 'Yayıncı Modu: Renk gizli'
                        : `${col.name} (${col.pips}) - ${
                            isBlocked
                              ? 'Şu an engelli (Tıkla ve engeli kaldır)'
                              : 'Engellemek için tıkla (Bu tur çıkmaz)'
                          }`
                    }
                  >
                    {isBlocked ? (
                      <div className="absolute inset-0 rounded-full bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
                        <Ban className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400 stroke-[3]" />
                      </div>
                    ) : (
                      <span
                        className="text-[9px] font-black opacity-85 group-hover:opacity-100"
                        style={{ color: col.textColor }}
                      >
                        {isStreamerMode ? '?' : col.pips}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Clear block button if a color is blocked */}
            {blockedColor && (
              <button
                onClick={() => onSelectBlockColor(null)}
                className="p-1 rounded-lg bg-neutral-800/80 hover:bg-red-950/60 text-neutral-400 hover:text-red-300 border border-neutral-700/60 transition-colors ml-0.5"
                title="Engeli kaldır"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}

            {/* KEYBIND GİRİŞ ALANI */}
            <div
              className="flex items-center gap-1.5 ml-1.5 pl-2 border-l border-neutral-800"
              title={`Tuşa (${cycleKey.toUpperCase()}) her basışta sıradaki renk engellenir: Kırmızı -> Mavi -> Yeşil -> Sarı -> Mor -> Turuncu -> Başa döner`}
            >
              <Keyboard className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span className="text-[10px] text-neutral-400 font-mono hidden sm:inline">Tuş:</span>
              <input
                type="text"
                maxLength={1}
                value={cycleKey.toUpperCase()}
                onChange={(e) => {
                  const char = e.target.value.slice(-1).toLowerCase();
                  if (char && char.trim() !== '') {
                    onSetCycleKey(char);
                  }
                }}
                className="w-6 h-6 text-center font-mono font-bold text-xs bg-neutral-800 text-amber-300 rounded-md border border-neutral-700 focus:outline-none focus:ring-1 focus:ring-amber-400 uppercase shadow-inner"
                title="Sırayla renk engellemek için tuş girin (Örn: R)"
              />
            </div>
          </div>
        </div>

        {/* Right side: Combo badge, Streamer Mode Toggle & Sound Toggle */}
        <div className="flex items-center gap-2">
          {lastCombo && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold shadow-[0_0_12px_rgba(245,158,11,0.2)]">
              <Flame className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              <span>{lastCombo}</span>
            </div>
          )}

          {/* YAYINCI MODU BUTONU (Streamer Mode Toggle) */}
          <button
            onClick={onToggleStreamerMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              isStreamerMode
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/40 ring-2 ring-rose-400/80 animate-pulse'
                : 'bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 hover:text-white'
            }`}
            title="Yayıncı Modu: Renkleri blurlar ve olduğundan tamamen farklı gösterir"
          >
            {isStreamerMode ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-white" />
                <span>Yayıncı Modu Açık</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-neutral-400" />
                <span className="hidden sm:inline">Yayıncı Modu</span>
              </>
            )}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 hover:text-white transition-colors"
            title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>
        </div>
      </div>

      {/* The 4 Dice Area */}
      <div className="relative z-10 py-8 px-2 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 justify-items-center">
          {diceColors.map((colId, idx) => (
            <Dice3D
              key={idx}
              dieIndex={idx}
              colorId={colId}
              isRolling={isRolling}
              onClick={onRoll}
              isStreamerMode={isStreamerMode}
            />
          ))}
        </div>
      </div>

      {/* Minimalist keyboard shortcut hint under arena */}
      <div className="relative z-10 flex items-center justify-center gap-3 text-[11px] text-neutral-500 font-mono">
        <span>
          <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">Space</kbd> ROLL
        </span>
        <span className="opacity-40">&bull;</span>
        <span>
          <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 text-amber-300 font-bold border border-neutral-700">{cycleKey.toUpperCase()}</kbd> Değiştir
        </span>
      </div>

      {/* Action Footer: ROLL Button */}
      <div className="relative z-10 mt-5 pt-3 flex items-center justify-center">
        <button
          onClick={onRoll}
          disabled={isRolling}
          className={`min-w-48 px-10 py-3.5 rounded-2xl font-black text-lg tracking-wider flex items-center justify-center gap-3 transition-all duration-200 shadow-xl select-none active:scale-95 ${
            isRolling
              ? 'bg-neutral-800 text-neutral-400 cursor-wait'
              : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-neutral-950 shadow-emerald-500/25 hover:shadow-emerald-500/40'
          }`}
        >
          <Dices className={`w-5 h-5 ${isRolling ? 'animate-spin' : ''}`} />
          <span>{isRolling ? 'ROLLING...' : 'ROLL'}</span>
        </button>
      </div>
    </div>
  );
};
