// server/games/checkers/ai.ts
import type { CheckersState, CheckersMove, Position, Board } from "@/types/types.js";
import { getMandatoryJumps, getPossibleMoves, getJumpsFromPosition } from "./logic.js";

// --- Тип для внутреннего представления хода AI ---
type AIMove = {
  rootMove: CheckersMove;   // первый шаг хода
  finalBoard: Board;        // доска после полной серии ударов
  captured: number;         // сколько шашек противника было съедено
  movedFrom: Position;
  movedTo: Position;
};

/**
 * Главная функция выбора хода для AI
 */
export function pickAIMove(state: CheckersState): CheckersMove | null {
  const aiPlayer = state.currentPlayer;

  // Генерация всех возможных ходов (с рекурсивными сериями)
  const moves = generateAIMoves(state.board, aiPlayer);

  if (moves.length === 0) return null;

  // Оценка каждого хода
  const scored = moves.map(m => ({ move: m, score: evaluateAIMove(m, aiPlayer) }));

    // Выбираем лучший ход по максимальному score
  // const best = scored.sort((a,b) => b.score - a.score)[0];

  // Находим максимальный score
  const maxScore = Math.max(...scored.map(s => s.score));

  // Берём все ходы с этим maxScore (топовые ходы)
  const topMoves = scored.filter(s => s.score === maxScore).map(s => s.move);

  // Выбираем случайный ход из топовых
  const selectedMove = topMoves[Math.floor(Math.random() * topMoves.length)];

  return selectedMove?.rootMove || null;
}


/**
 * Генерируем все ходы AI
 */
function generateAIMoves(board: Board, player: "w" | "b"): AIMove[] {
  const moves: AIMove[] = [];

  // Сначала ищем обязательные удары
  const mandatory = getMandatoryJumps(board, player);

  if (mandatory.length > 0) {
    // Рекурсивно строим все серии ударов
    for (const move of mandatory) {
      const fullSeries = buildJumpSeries(board, move, player);
      moves.push(...fullSeries);
    }
  } else {
    // Обычные ходы
    const possible = getPossibleMoves(board, player);
    for (const move of possible) {
      const newBoard = simulateMove(board, move, player);
      moves.push({
        rootMove: move,
        finalBoard: newBoard,
        captured: 0,
        movedFrom: move.from,
        movedTo: move.to
      });
    }
  }

  return moves;
}

/**
 * Рекурсивно строим все серии обязательных ударов
 */
function buildJumpSeries(board: Board, move: CheckersMove, player: "w" | "b"): AIMove[] {
  const newBoard = simulateMove(board, move, player);
  const captured = move.jumped?.length || 0;
  const movedFrom = move.from;
  const movedTo = move.to;

  // Проверяем, есть ли дополнительные удары с конечной позиции
  const nextJumps = getJumpsFromPosition(newBoard, player, movedTo);

  if (nextJumps.length === 0) {
    // Серия закончена
    return [{
      rootMove: move,
      finalBoard: newBoard,
      captured,
      movedFrom,
      movedTo
    }];
  }

  // Рекурсивно строим серии дальше
  const series: AIMove[] = [];
  for (const next of nextJumps) {
    const nextSeries = buildJumpSeries(newBoard, {
      from: movedTo,
      to: next.to,
      jumped: [...(move.jumped || []), ...(next.jumped || [])]
    }, player);

    for (const s of nextSeries) {
      series.push({
        rootMove: move,
        finalBoard: s.finalBoard,
        captured: s.captured,
        movedFrom,
        movedTo: s.movedTo
      });
    }
  }

  return series;
}

/**
 * Симулируем доску после хода (или серии обязательных ударов)
 */
function simulateMove(board: Board, move: CheckersMove, player: "w" | "b"): Board {
  const newBoard = board.map(row => [...row]);
  newBoard[move.to.row][move.to.col] = player;
  newBoard[move.from.row][move.from.col] = null;

  move.jumped?.forEach(pos => {
    newBoard[pos.row][pos.col] = null;
  });

  return newBoard;
}

/**
 * Проверка, будет ли шашка заперта (нет доступных ходов) после хода
 */
function isTrapped(board: Board, pos: Position, player: "w" | "b"): boolean {
  const lastRow = player === "w" ? 0 : 7;
  if (pos.row !== lastRow) return false; // не дошла до конца → не заперта

  // Проверяем диагональные ходы
  const directions: [number, number][] = [
    [-1, -1], [-1, 1], [1, -1], [1, 1]
  ];

  for (const [dr, dc] of directions) {
    const r = pos.row + dr;
    const c = pos.col + dc;
    if (r < 0 || r > 7 || c < 0 || c > 7) continue;
    if (!board[r][c]) return false; // есть куда ходить → не заперта
  }

  return true; // ходить больше некуда → заперта
}

/**
 * Модификация оценки хода AI с учётом запирания шашки
 */
function evaluateAIMove(move: AIMove, player: "w" | "b"): number {
  let score = move.captured * 10;

  const enemy = player === "w" ? "b" : "w";
  const enemyJumps = getMandatoryJumps(move.finalBoard, enemy).length;
  score -= enemyJumps * 8;

  const threatened = countThreatenedPieces(move.finalBoard, player);
  score -= threatened * 2;

  score += forwardProgress(move, player) * 0.5;

  // --- Новый момент: штраф за запирание шашки ---
  if (isTrapped(move.finalBoard, move.movedTo, player)) {
    // Проверяем, есть ли альтернативные ходы, если есть → штраф
    const alternatives = getPossibleMoves(move.finalBoard, player);
    if (alternatives.length > 0) {
      score -= 5; // штраф за потерю мобильности
    }
  }

  return score;
}


/**
 * Считаем, сколько наших шашек на доске под угрозой (могут быть съедены)
 */
function countThreatenedPieces(board: Board, player: "w" | "b"): number {
  let count = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] !== player) continue;
      if (canBeCaptured(board, { row: r, col: c }, player)) count++;
    }
  }
  return count;
}

/**
 * Проверяем, может ли шашка быть съедена на следующем ходу
 */
function canBeCaptured(board: Board, pos: Position, player: "w" | "b"): boolean {
  const enemy = player === "w" ? "b" : "w";

  // Проверяем обязательные удары врага
  const enemyJumps = getMandatoryJumps(board, enemy);
  for (const move of enemyJumps) {
    if (move.jumped?.some(j => j.row === pos.row && j.col === pos.col)) return true;
  }

  // Проверяем обычные ходы (вперед)
  const enemyMoves = getPossibleMoves(board, enemy);
  for (const move of enemyMoves) {
    if (move.to.row === pos.row && move.to.col === pos.col) return true;
  }

  return false;
}

/**
 * Бонус за продвижение вперед
 */
function forwardProgress(move: AIMove, player: "w" | "b"): number {
  return player === "w" ? move.movedFrom.row - move.movedTo.row : move.movedTo.row - move.movedFrom.row;
}
