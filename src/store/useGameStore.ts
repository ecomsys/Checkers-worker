import { create } from "zustand";
import { persist } from "zustand/middleware";

import type {
  Player,
  Game,
  GameMode,
  Move,
  CheckersMove,
  Position,
  CheckersState,
} from "../types/types";

import type { WorkerRequest, WorkerResponse } from "@/workers/workerTypes";
import { generateId } from "@/utils/generate";

interface GameStoreState {
  worker: Worker | null;
  player: Player | null;
  game: Game<CheckersState, CheckersMove> | null;

  connect: (mode: GameMode) => void;
  initPlayer: () => Player;

  selectPiece: (pos: Position) => void;
  makeMove: (move: Move<CheckersMove>) => void;
}

export const useGameStore = create<GameStoreState>()(
  persist(
    (set, get) => ({
      worker: null,
      player: null,
      game: null,

      /* ---------- player ---------- */
      initPlayer: () => {
        const existing = get().player;
        if (existing) return existing;

        const player: Player = {
          id: generateId(),
          username: "Player",
          photo_url: "/images/webp/avatar.webp",
          isAi: false
        };

        set({ player });
        return player;
      },

      /* ---------- connect worker ---------- */
      connect: (mode: GameMode) => {
        const prevWorker = get().worker;

        if (prevWorker) {
          prevWorker.terminate();
        }

        set({ game: null });

        const worker = new Worker(
          new URL("@/workers/gameWorker.ts", import.meta.url),
          { type: "module" }
        );

        set({ worker });

        worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
          const message = event.data;

          switch (message.type) {
            case "game_updated": {
              set({ game: message.payload });
              break;
            }

            case "game_finished": {
              set((state) => {
                if (!state.game) return state;

                return {
                  game: {
                    ...state.game,
                    status: "finished",
                    winner: message.payload.winnerId,
                  },
                };
              });
              break;
            }
          }
        };

        const player = get().initPlayer();

        // регистрируем игрока (если нужно в будущем)
        worker.postMessage({
          type: "register_player",
          payload: player,
        } satisfies WorkerRequest);

        const existingGame = get().game;

        if (existingGame && existingGame.mode === mode) {
          // восстанавливаем игру в воркере
          worker.postMessage({
            type: "restore_game",
            payload: existingGame,
          } satisfies WorkerRequest);
        } else {
          //  если режим другой — сбрасываем
          set({ game: null });
          // создаём игру 
          worker.postMessage({
            type: "create_game",
            payload: {
              creator: player,
              type: "checkers",
              mode: mode,
            },
          } satisfies WorkerRequest);
        }
      },

      /* ---------- checkers ---------- */

      selectPiece: (pos) => {
        const { worker, player } = get();
        if (!worker || !player) return;

        worker.postMessage({
          type: "select_piece",
          payload: {
            playerId: player.id,
            pos,
          },
        } satisfies WorkerRequest);
      },

      makeMove: (move) => {
        const { worker } = get();
        if (!worker) return;

        worker.postMessage({
          type: "make_move",
          payload: { move },
        } satisfies WorkerRequest);
      },
    }),
    {
      name: "checkers-storage",
      partialize: (state) => ({
        player: state.player,
        game: state.game,
      }),
    }
  )
);