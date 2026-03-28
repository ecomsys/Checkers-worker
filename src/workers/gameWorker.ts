/// <reference lib="webworker" />

import { generateId } from "@/utils/generate";
import type {
  Player,
  Game,
  Move,
  CheckersMove,
  CheckersState,
} from "../types/types";

import type { WorkerRequest, WorkerResponse } from "./workerTypes";

import { initCheckersGame } from "../logic/init";
import { CheckersService } from "../logic/services";
import { triggerAIMoveIfNeeded } from "../logic/triggerAI";
import { applyCheckersMove } from "@/logic/applyMove";

// ---------------- STATE ----------------
let game: Game<CheckersState, CheckersMove> | null = null;

// ---------------- AI ----------------
const AI_BOT_1: Player = {
  id: "aibot-1",
  username: "AI 1",
  photo_url: "/images/webp/ai.webp",
  isAi: true,
};

const AI_BOT_2: Player = {
  id: "aibot-2",
  username: "AI 2",
  photo_url: "/images/webp/ai.webp",
  isAi: true,
};

// ---------------- EMIT ----------------
const emit = (message: WorkerResponse) => {
  postMessage(message);
};

// ---------------- HANDLER ----------------
self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const message = event.data;

  switch (message.type) {
    // ---------------- GAME ----------------
    case "create_game": {
      const payload = message.payload;

      if (payload.mode === "pve") {

        game = {
          id: generateId(),
          type: payload.type,
          players: [payload.creator, AI_BOT_1],
          status: "started",
          creator: payload.creator,
          mode: payload.mode,
          history: [],
          state: initCheckersGame(),
        };

        emit({
          type: "game_updated",
          payload: game,
        });

      } else {
        game = {
          id: generateId(),
          type: payload.type,
          players: [AI_BOT_1, AI_BOT_2],
          status: "started",
          creator: payload.creator,
          mode: payload.mode,
          history: [],
          state: initCheckersGame(),
        };

        emit({
          type: "game_updated",
          payload: game,
        });

        triggerAIMoveIfNeeded(game, (aiMove) => {
          applyCheckersMove(game!, aiMove, emit);
        });
      }
      break;
    }
   

    case "restore_game": {
      game = message.payload;

      emit({
        type: "game_updated",
        payload: game,
      });

      // если EVE — продолжаем игру
      triggerAIMoveIfNeeded(game, (aiMove) => {
        applyCheckersMove(game!, aiMove, emit);
      });

      break;
    }

    // ---------------- CHECKERS ----------------
    case "select_piece": {
      if (!game?.state) return;

      const { playerId, pos } = message.payload;

      const playerColor: "w" | "b" =
        game.players[0]?.id === playerId ? "w" : "b";

      const service = new CheckersService(game.state);

      game.state = service.selectPiece(playerColor, pos);

      emit({
        type: "game_updated",
        payload: game,
      });

      break;
    }

    case "make_move": {
      if (!game?.state) return;

      handleMove(game, message.payload.move);
      break;
    }
  }
};

// ---------------- MOVE LOGIC ----------------
function handleMove(
  game: Game<CheckersState, CheckersMove>,
  move: Move<CheckersMove>
) {
  if (!game.state) return;

  const service = new CheckersService(game.state);

  const success = service.makeMove(move);
  if (!success) return;

  game.state = service.getState();
  game.history.push(move);

  emit({
    type: "game_updated",
    payload: game,
  });

  const state = game.state;

  // finish
  if (state?.completed) {
    emit({
      type: "game_finished",
      payload: {
        gameId: game.id,
        winnerId: game.players[state.winner === "w" ? 0 : 1]?.id || "",
      },
    });
    return;
  }

  // AI turn
  triggerAIMoveIfNeeded(game, (aiMove) => {
    handleMove(game, aiMove);
  });
}