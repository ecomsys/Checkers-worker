import type { Game, Move, CheckersMove, CheckersState } from "@/types/types";
import { CheckersService } from "./services";
import { triggerAIMoveIfNeeded } from "./triggerAI";
import type { WorkerResponse } from "@/workers/workerTypes";

type EmitFn = (msg: WorkerResponse) => void;

export function applyCheckersMove(
  game: Game<CheckersState, CheckersMove>,
  move: Move<CheckersMove>,
  emit: EmitFn
): boolean {
  if (!game.state) return false;

  const service = new CheckersService(game.state as CheckersState);

  const success = service.makeMove(move);
  if (!success) return false;

  game.state = service.getState();

  game.history.push(move);

  // уведомляем UI
  emit({
    type: "game_updated",
    payload: game,
  });

  const state = game.state;

  // game finished
  if (state.completed) {
    game.status = "finished";

    emit({
      type: "game_finished",
      payload: {
        gameId: game.id,
        winnerId: game.players[state.winner === "w" ? 0 : 1]?.id || "",
      },
    });

    return true;
  }

  // AI trigger
  triggerAIMoveIfNeeded(game, (aiMove) => {
    applyCheckersMove(game, aiMove, emit);
  });

  return true;
}