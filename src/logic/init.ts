// server/games/checkers/init.ts
import type { CheckersState } from "@/types/types.js";

export function initCheckersGame(): CheckersState {
  const board: CheckersState["board"] = [
    [null,"b",null,"b",null,"b",null,"b"],
    ["b",null,"b",null,"b",null,"b",null],
    [null,"b",null,"b",null,"b",null,"b"],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    ["w",null,"w",null,"w",null,"w",null],
    [null,"w",null,"w",null,"w",null,"w"],
    ["w",null,"w",null,"w",null,"w",null],
  ];

  return {
    board,
    currentPlayer: "w",
    selected: null,
    availableMoves: [],
    movesCount: 0,
    completed: false,
    winner: undefined,
  };
}
