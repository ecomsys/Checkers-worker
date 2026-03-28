import React from "react";
import type { Player, Game, CheckersState } from "@/types/types";

interface GameHeaderProps {
  game: Game;
  roomPlayers: Player[];
  currentPlayerId: string | null;
  currentTurnPlayerId: string | null;
}

export function GameHeader({
  game,
  roomPlayers,
  // currentTurnPlayerId,
}: GameHeaderProps) {

  const turnInfo = React.useMemo(() => {
    if (!game.state || typeof game.state !== "object") {
      return { text: "ИГРА НЕ ЗАГРУЖЕНА", color: "text-red-600" };
    }

    const state = game.state as CheckersState;

    return state.currentPlayer === "w"
      ? { text: "БЕЛЫЕ", color: "text-black" }
      : { text: "ЧЁРНЫЕ", color: "text-black" };
  }, [game.state]);

  return (
    <div className="bg-white px-6 py-4 flex justify-between items-center">

      {/* ИНФО */}
      <div>
        <p className="text-sm text-gray-500">Игра</p>
        <p className="font-bold">{game.id}</p>
      </div>

      {/* ХОД */}
      <div className={`text-lg font-bold ${turnInfo.color}`}>
        ХОД: {turnInfo.text}
      </div>

      {/* ИГРОКИ */}
      <div className="flex items-center gap-4">
        {roomPlayers.map((p, idx) => (
          <React.Fragment key={p.id}>
            <div className="flex flex-col items-center gap-1">
              <img
                src={p.photo_url ?? "/images/webp/avatar.webp"}
                className="w-8 h-8 rounded-full object-cover"
              />
              <p className="text-xs font-semibold">{p.username}</p>
            </div>

            {idx === 0 && roomPlayers.length > 1 && (
              <span className="text-sm font-bold text-gray-600">VS</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}