import type {
  Player,
  Game,
  Move,
  CheckersMove,
  Position,
  GameMode,
  CheckersState,
} from "../types/types";


export type WorkerResponse =
  | { type: "game_updated"; payload: Game<CheckersState, CheckersMove> }
  | {
    type: "game_finished";
    payload: { gameId: string; winnerId: string };
  };

/**
 * СОБЫТИЯ ОТ FRONT → WORKER
 */
export type WorkerRequest =
  | { type: "register_player"; payload: Player }

  | {
    type: "create_game";
    payload: {
      creator: Player;
      type: string;
      mode: GameMode;
    };
  } 

  | { type: "restore_game"; payload: Game<CheckersState, CheckersMove> }

  | {
    type: "select_piece";
    payload: {
      playerId: string;
      pos: Position;
    };
  }

  | {
    type: "make_move";
    payload: {
      move: Move<CheckersMove>;
    };
  };