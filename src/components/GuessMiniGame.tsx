import React, { useState } from 'react';
import { ColorId, GAME_COLORS } from '../types';
import { Trophy, Target, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/sound';

interface GuessMiniGameProps {
  lastRollColors: ColorId[];
  roundNumber: number;
}

export const GuessMiniGame: React.FC<GuessMiniGameProps> = ({
  lastRollColors,
  roundNumber,
}) => {
  const [guessColor, setGuessColor] = useState<ColorId | null>(null);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [lastEvaluatedRound, setLastEvaluatedRound] = useState<number>(roundNumber);
  const [lastFeedback, setLastFeedback] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Evaluate guess when roundNumber advances
  React.useEffect(() => {
    if (roundNumber > lastEvaluatedRound && guessColor && lastRollColors.length > 0) {
      const matchCount = lastRollColors.filter((c) => c === guessColor).length;
      const guessObj = GAME_COLORS.find((c) => c.id === guessColor);

      if (matchCount > 0) {
        const gainedPoints = matchCount * 10 * (streak + 1);
        setScore((prev) => prev + gainedPoints);
        const newStreak = streak + 1;
        setStreak(newStreak);
        setLastFeedback({
          success: true,
          message: `Harika! Tahminin (${guessObj?.name}) 4 zarda ${matchCount} kez çıktı! (+${gainedPoints} puan)`,
        });
        soundManager.playCelebration();
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
          });
        } catch {
          // ignore
        }
      } else {
        setStreak(0);
        setLastFeedback({
          success: false,
          message: `Tüh! (${guessObj?.name}) bu tur zarlarda hiç çıkmadı. Serin sıfırlandı.`,
        });
      }
      setLastEvaluatedRound(roundNumber);
    }
  }, [roundNumber, lastRollColors, guessColor, lastEvaluatedRound, streak]);

  return (
    <div className="w-full bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4 text-xs">
      <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-neutral-200">Mini Tahmin Oyunu:</span>
          <span className="text-neutral-400">Sonraki turda en az 1 tane çıkacağını düşündüğün rengi seç!</span>
        </div>
        <div className="flex items-center gap-3 font-mono">
          <div className="flex items-center gap-1 text-amber-300">
            <Trophy className="w-3.5 h-3.5" />
            <span className="font-bold">{score} Puan</span>
          </div>
          {streak > 1 && (
            <div className="flex items-center gap-1 text-orange-400 font-bold">
              <Zap className="w-3 h-3 fill-orange-400" />
              <span>x{streak} Seri</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {GAME_COLORS.map((col) => {
            const isSelected = guessColor === col.id;
            return (
              <button
                key={col.id}
                onClick={() => {
                  setGuessColor(isSelected ? null : col.id);
                  soundManager.playTick();
                }}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'ring-2 ring-white text-white shadow-md'
                    : 'opacity-70 hover:opacity-100 text-neutral-300 border-neutral-800 bg-neutral-800/40'
                }`}
                style={{
                  backgroundColor: isSelected ? col.hex : undefined,
                  borderColor: isSelected ? '#FFFFFF' : col.hex,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: col.hex }}
                />
                {col.name}
              </button>
            );
          })}
        </div>

        {lastFeedback && (
          <div
            className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
              lastFeedback.success
                ? 'text-emerald-300 bg-emerald-950/60 border border-emerald-800/50'
                : 'text-neutral-400 bg-neutral-800/50'
            }`}
          >
            {lastFeedback.message}
          </div>
        )}
      </div>
    </div>
  );
};
