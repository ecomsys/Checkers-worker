import { useEffect } from "react";
import { useSound } from "@/hooks/useSound";

import { useGameStore } from "@/store/useGameStore";
import { useSearchParams } from "react-router-dom";

import { GameHeader } from "@/pages/Game/GameHeader";
import { BoardCanvas } from "@/pages/Game/BoardCanvas/BoardCanvas";

import type { CheckersState, Position, GameMode } from "@/types/types";
import Modal from "@/components/modal";

export default function Game() {
  const {
    connect,
    initPlayer,
    game,
    player,
    selectPiece,
    makeMove,
  } = useGameStore();

  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") as GameMode; // "pve" | "eve"

  useEffect(() => {
    initPlayer(); 
  
    connect(mode);
  }, [mode]);

  const playMoveSound = useSound("/sounds/move.mp3");

  if (!game) {
    return (
      <h1 className="text-3xl p-10 text-center text-red-500">
        Игра загружается...
      </h1>
    );
  }

  const checkersState = game.state as CheckersState | undefined;

  if (!checkersState) {
    return (
      <h1 className="text-3xl p-10 text-center text-red-500">
        Состояние игры не загружено
      </h1>
    );
  }

  /* ------------------- клики ------------------- */
  const handleCellClick = (row: number, col: number) => {
    if (mode === "eve") return; // 

    if (!player) return;

    const currentPlayerColor =
      game.players[0]?.id === player.id ? "w" : "b";

    if (currentPlayerColor !== checkersState.currentPlayer) return;

    const cell = checkersState.board[row][col];
    const pos: Position = { row, col };

    if (cell === checkersState.currentPlayer) {
      selectPiece(pos);
      return;
    }

    if (
      checkersState.availableMoves?.some(
        (m) => m.row === row && m.col === col
      )
    ) {
      if (!checkersState.selected) return;

      makeMove({
        playerId: player.id,
        payload: {
          from: checkersState.selected,
          to: pos,
        },
      });

      playMoveSound();
    }
  };

  const handleRestart = () => {
    // можно просто перезапустить игру (или оставить как есть)
    window.location.reload();
  };

  const currentTurnPlayerId =
    game.players[
      checkersState.currentPlayer === "w" ? 0 : 1
    ]?.id ?? null;

  let playerColor: "w" | "b" = "w";

  if (mode === "pve" && player && game.players.length > 0) {
    playerColor =
      game.players[0].id === player.id ? "w" : "b";
  }

  if (mode === "eve") {
    playerColor = "w"; // белые снизу всегда
  }

  return (
    <div className="bg-gray-50 flex flex-col h-screen">
      <GameHeader
        game={game}
        roomPlayers={game.players}
        currentPlayerId={player?.id ?? null}
        currentTurnPlayerId={currentTurnPlayerId}
      />

      <BoardCanvas
        board={checkersState.board}
        selected={checkersState.selected ?? null}
        availableMoves={checkersState.availableMoves ?? []}
        onCellClick={handleCellClick}
        playerColor={playerColor}
        mandatoryPieces={checkersState.mandatoryPieces ?? []}
      />

      {checkersState.completed && checkersState.winner && (
        <Modal state={checkersState} onRestart={handleRestart} />
      )}
    </div>
  );
}