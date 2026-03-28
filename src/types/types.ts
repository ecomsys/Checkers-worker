// ----------------- Только серверные типы -----------------

// ----------------- Общие типы -----------------

// Игрок
export type Player = {
  id: string; 
  username?: string;
  photo_url?: string;
  isAi?: boolean;
};

// ----------------- Универсальная игра -----------------
export type GameMode = "pve" | "eve";

// Универсальная игра
export interface Game<TState = unknown, TMovePayload = unknown> {
  id: string;  
  type: string; // название игры ("checkers", "cards", ...)
  players: Player[];
  status: "waiting" | "started" | "finished";
  creator: Player; 
  mode: GameMode; 
  history: Move<TMovePayload>[]; // история ходов
  state?: TState; // текущее состояние игры (например CheckersState)
}

// ----------------- Шашки -----------------

// Ход любой игры (payload можно конкретизировать)
export interface Move<TPayload = unknown> {
  playerId: string;
  payload: TPayload; // для шашек сюда будет класть from/to/jumped
}

// Клетка и доска
export type Cell = "w" | "b" | null;
export type Board = Cell[][];

export interface Position {
  row: number;
  col: number;
}

// ход шашки
export interface CheckersMove {
  from: Position;
  to: Position;
  jumped?: Position[];
}

// состояние шашек
export interface CheckersState {
  board: Board;
  currentPlayer: "w" | "b";
  selected?: Position | null;        // выбранная шашка
  availableMoves?: Position[];       // массив клеток, куда можно походить
  mandatoryPieces?: Position[];
  forcedPiece?: Position | null;
  movesCount: number;
  completed: boolean;
  winner?: "w" | "b";
}
