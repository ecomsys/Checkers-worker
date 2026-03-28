// server/games/checkers/checkersService.ts
import type {
  CheckersState,
  CheckersMove,
  Move,
  Position,
} from "@/types/types.js";
import {
  getAvailableMovesForPiece,
  getMandatoryJumps,
  getPossibleMoves,
  getJumpsFromPosition,
  getMandatoryPieces,
} from "./logic.js";

export class CheckersService {
  state: CheckersState;

  constructor(initialState: CheckersState) {
    // Глубокое клонирование доски
    this.state = {
      ...initialState,
      board: initialState.board.map((row) => [...row]),
    };

    this.updateMandatoryPieces();
  }

  /**
   * Сервер выполняет ход
   */
  makeMove(move: Move<CheckersMove>): boolean {
    const { payload } = move;
    const { board, currentPlayer, completed } = this.state;

    if (completed) return false;

    const playerColor: "w" | "b" = currentPlayer;

    const mandatoryPieces = getMandatoryPieces(board, playerColor);
    this.state.mandatoryPieces = mandatoryPieces;

    // ----------------------
    // Проверка валидности хода
    // ----------------------
    let validMove: CheckersMove | null = null;
    const mandatoryMoves = getMandatoryJumps(board, playerColor);

    if (mandatoryMoves.length > 0) {
      validMove =
        mandatoryMoves.find(
          (m) =>
            m.from.row === payload.from.row &&
            m.from.col === payload.from.col &&
            m.to.row === payload.to.row &&
            m.to.col === payload.to.col,
        ) || null;
    } else {
      const possibleMoves = getPossibleMoves(board, playerColor);
      validMove =
        possibleMoves.find(
          (m) =>
            m.from.row === payload.from.row &&
            m.from.col === payload.from.col &&
            m.to.row === payload.to.row &&
            m.to.col === payload.to.col,
        ) || null;
    }

    if (!validMove) return false;

    const from = payload.from;
    const to = payload.to;

    // ----------------------
    // Выполняем ход
    // ----------------------
    board[to.row][to.col] = board[from.row][from.col];
    board[from.row][from.col] = null;

    // Если был удар, удаляем съеденные шашки
    const isJump = !!validMove.jumped && validMove.jumped.length > 0;
    if (isJump) {
      validMove.jumped?.forEach((pos) => {
        board[pos.row][pos.col] = null;
      });
    }

    // ----------------------
    // Обработка серии ударов
    // ----------------------
    if (isJump) {
      const nextJumps = getJumpsFromPosition(board, playerColor, to);

      if (nextJumps.length > 0) {
        // Серия ударов продолжается — игрок остаётся
        this.state.selected = to;
        this.state.availableMoves = nextJumps.map((m) => m.to);
        this.state.mandatoryPieces = [to]; //  ТОЛЬКО ЭТА ШАШКА
        this.state.forcedPiece = to; // ВАЖНО
      } else {
        // Удар был, но больше нет серии — передаем очередь сопернику
        this.state.currentPlayer = currentPlayer === "w" ? "b" : "w";
        this.state.selected = null;
        this.state.availableMoves = undefined;
        this.state.mandatoryPieces = undefined;
        this.state.forcedPiece = null;
      }
    } else {
      // Обычный ход — очередь сразу переходит сопернику
      this.state.currentPlayer = currentPlayer === "w" ? "b" : "w";
      this.state.selected = null;
      this.state.availableMoves = undefined;
      this.state.mandatoryPieces = undefined;
    }
    this.updateMandatoryPieces();
    this.state.movesCount++;
    this.checkWinner();

    return true;
  }

  /**
   * Выбор шашки — возвращаем доступные клетки для хода
   */
  selectPiece(playerColor: "w" | "b", pos: Position): CheckersState {
    if (playerColor !== this.state.currentPlayer) return this.state;

    const mandatoryPieces = getMandatoryPieces(this.state.board, playerColor);

    // Если forcedPiece активен — можно выбрать только его
    if (this.state.forcedPiece) {
      if (
        pos.row !== this.state.forcedPiece.row ||
        pos.col !== this.state.forcedPiece.col
      ) {
        return this.state; // недопустимый выбор
      }
    } else if (
      mandatoryPieces.length > 0 &&
      !mandatoryPieces.some((p) => p.row === pos.row && p.col === pos.col)
    ) {
      return this.state; // нельзя выбрать другую шашку
    }

    const availableMoves = getAvailableMovesForPiece(
      this.state.board,
      playerColor,
      pos,
    );

    this.state.selected = pos;
    this.state.availableMoves = availableMoves;
    this.updateMandatoryPieces();

    return { ...this.state };
  }

  /**
   * обновляем обязательный к удару
   */
  private updateMandatoryPieces() {
    // Если forcedPiece есть — показываем только его
    if (this.state.forcedPiece) {
      this.state.mandatoryPieces = [this.state.forcedPiece];
    } else {
      this.state.mandatoryPieces = getMandatoryJumps(
        this.state.board,
        this.state.currentPlayer,
      ).map((m) => m.from);
    }
  }

  /**
   * Проверка победителя
   */
  private checkWinner(): void {
    const { board } = this.state;

    const wMoves = getPossibleMoves(board, "w");
    const bMoves = getPossibleMoves(board, "b");
    const wPieces = board.flat().filter((c) => c === "w").length;
    const bPieces = board.flat().filter((c) => c === "b").length;

    if (
      wPieces === 0 ||
      (wMoves.length === 0 && getMandatoryJumps(board, "w").length === 0)
    ) {
      this.state.completed = true;
      this.state.winner = "b";
    } else if (
      bPieces === 0 ||
      (bMoves.length === 0 && getMandatoryJumps(board, "b").length === 0)
    ) {
      this.state.completed = true;
      this.state.winner = "w";
    }
  }

  /**
   * Получение текущего состояния игры
   */
  getState(): CheckersState {
    return {
      ...this.state,
      board: this.state.board.map((row) => [...row]),
    };
  }
}
