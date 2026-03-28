import type { Game, Move, CheckersMove, CheckersState } from "@/types/types";
import { pickAIMove } from "./ai";


export function triggerAIMoveIfNeeded(
  game: Game,
  doMove: (move: Move<CheckersMove>) => void
) {
  if (!game.state) return;

  const state = game.state as CheckersState;

  if (state.completed) return;

  const isEve = game.mode === "eve";

  const isAITurn =
    isEve || state.currentPlayer === "b";

  if (!isAITurn) return;

  setTimeout(() => {
    const freshState = game.state as CheckersState;
    if (!freshState || freshState.completed) return;

    const payload = pickAIMove(freshState);
    if (!payload) return;

    const aiPlayer =
      freshState.currentPlayer === "w"
        ? game.players[0]
        : game.players[1];

    doMove({
      playerId: aiPlayer.id,
      payload,
    });
  }, 1000);
}