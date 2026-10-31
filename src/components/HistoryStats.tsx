import React, { useState } from 'react';
import { ColorId, RollRecord, GAME_COLORS } from '../types';
import { History, BarChart3, Trash2 } from 'lucide-react';

interface HistoryStatsProps {
  history: RollRecord[];
  onClearHistory: () => void;
}

export const HistoryStats: React.FC<HistoryStatsProps> = ({
  history,
  onClearHistory,
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'stats'>('history');

  // Calculate statistics
  const totalRolls = history.length;
  const totalDiceThrown = totalRolls * 4;

  const colorCounts: Record<ColorId, number> = {
    kirmizi: 0,
    mavi: 0,
    yesil: 0,
    sari: 0,
    mor: 0,
    turuncu: 0,
  };

  history.forEach((record) => {
    record.diceColors.forEach((color) => {
      colorCounts[color] = (colorCounts[color] || 0) + 1;
    });
  });

  return (
    <div className="w-full bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 shadow-xl">
      {/* Top Header & Tab buttons */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Tur Geçmişi ({history.length})
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'stats'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            İstatistik & Renk Frekansı
          </button>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-xs text-neutral-400 hover:text-red-400 transition-colors flex items-center gap-1"
            title="Geçmişi temizle"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Temizle</span>
          </button>
        )}
      </div>

      {/* Content Area */}
      {history.length === 0 ? (
        <div className="py-8 text-center text-xs text-neutral-500">
          Henüz hiç zar atılmadı. Zar attığınızda tüm sonuçlar ve renk dağılımları burada listelenecek.
        </div>
      ) : activeTab === 'history' ? (
        /* History List: No blocked color indicators shown as requested */
        <div className="mt-3 divide-y divide-neutral-800/60 max-h-64 overflow-y-auto pr-1">
          {history.map((record) => {
            return (
              <div
                key={record.id}
                className="py-2.5 flex items-center justify-between gap-3 text-xs hover:bg-neutral-800/30 px-2 rounded-lg transition-colors"
              >
                {/* Round info */}
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-neutral-400 w-12">
                    #{record.roundNumber}
                  </span>

                  {/* 4 Dice outcome preview */}
                  <div className="flex items-center gap-1.5">
                    {record.diceColors.map((colId, i) => {
                      const col = GAME_COLORS.find((c) => c.id === colId);
                      return (
                        <span
                          key={i}
                          className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shadow-sm"
                          style={{
                            backgroundColor: col?.hex,
                            color: col?.textColor,
                          }}
                          title={`Zar ${i + 1}: ${col?.name}`}
                        >
                          {col?.pips}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Combo info & Timestamp (No blocked info) */}
                <div className="flex items-center gap-2">
                  {record.comboLabel && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {record.comboLabel}
                    </span>
                  )}

                  <span className="text-[10px] text-neutral-500 font-mono">
                    {new Date(record.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Statistics View */
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pb-3 border-b border-neutral-800 text-xs">
            <div className="bg-neutral-800/40 p-2 rounded-lg">
              <span className="text-neutral-400 block text-[10px]">Toplam Tur</span>
              <span className="text-base font-bold text-white">{totalRolls}</span>
            </div>
            <div className="bg-neutral-800/40 p-2 rounded-lg">
              <span className="text-neutral-400 block text-[10px]">Toplam Atılan Zar</span>
              <span className="text-base font-bold text-emerald-400">{totalDiceThrown}</span>
            </div>
            <div className="bg-neutral-800/40 p-2 rounded-lg">
              <span className="text-neutral-400 block text-[10px]">En Çok Çıkan Renk</span>
              <span className="text-base font-bold text-cyan-400">
                {(() => {
                  let maxCount = -1;
                  let maxColorName = '-';
                  GAME_COLORS.forEach((c) => {
                    if (colorCounts[c.id] > maxCount && colorCounts[c.id] > 0) {
                      maxCount = colorCounts[c.id];
                      maxColorName = c.name;
                    }
                  });
                  return maxColorName;
                })()}
              </span>
            </div>
          </div>

          {/* Color Breakdown Bars */}
          <div className="space-y-2 pt-1">
            {GAME_COLORS.map((c) => {
              const count = colorCounts[c.id];
              const pct = totalDiceThrown > 0 ? ((count / totalDiceThrown) * 100).toFixed(1) : '0';

              return (
                <div key={c.id} className="text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="font-semibold text-neutral-200">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-neutral-400 text-[11px]">
                      <span>{count} adet</span>
                      <span className="font-bold text-white">%{pct}</span>
                    </div>
                  </div>

                  <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: c.hex,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
