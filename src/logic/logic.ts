// server/games/checkers/logic.ts
import type { Board, Cell, CheckersMove, Position } from "@/types/types.js";

/**
 * Проверяем, можно ли совершить удар с позиции from -> to
 * Возвращает позицию, куда можно прыгнуть, или null
 */
function canJump(
  board: Board,
  fromRow: number,
  fromCol: number,
  player: Cell,
  dr: number,
  dc: number,
): Position | null {
  const midRow = fromRow + dr;
  const midCol = fromCol + dc;
  const destRow = fromRow + 2 * dr;
  const destCol = fromCol + 2 * dc;

  if (destRow < 0 || destRow > 7 || destCol < 0 || destCol > 7) return null;

  const midCell = board[midRow][midCol];
  const destCell = board[destRow][destCol];

  // Проверяем, что средняя клетка — вражеская, а целевая — пустая
  if (midCell && midCell !== player && !destCell) {
    return { row: destRow, col: destCol };
  }

  return null;
}

function getAllPlayerPieces(board: Board, player: Cell): Position[] {
  const res: Position[] = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === player) {
        res.push({ row: r, col: c });
      }
    }
  }

  return res;
}

/**
 * Получаем все обязательные удары для игрока на всей доске
 */
export function getMandatoryJumps(
  board: Board,
  player: Cell,
  forcedPiece?: Position | null,
): CheckersMove[] {
  const moves: CheckersMove[] = [];

  // Если есть forcedPiece — проверяем только эту шашку
  const pieces = forcedPiece ? [forcedPiece] : getAllPlayerPieces(board, player);

  for (const { row: r, col: c } of pieces) {
    if (board[r][c] !== player) continue;

    const directions: [number, number][] = [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ];

    for (const [dr, dc] of directions) {
      const dest = canJump(board, r, c, player, dr, dc);
      if (dest) {
        moves.push({
          from: { row: r, col: c },
          to: dest,
          jumped: [{ row: r + dr, col: c + dc }],
        });
      }
    }
  }

  return moves;
}


/**
 * Получаем все возможные обычные ходы (только если нет обязательных ударов)
 */
export function getPossibleMoves(board: Board, player: Cell): CheckersMove[] {
  // Если есть обязательные удары, обычные ходы недоступны
  if (getMandatoryJumps(board, player).length > 0) return [];

  const moves: CheckersMove[] = [];
  const dir = player === "w" ? -1 : 1; // белые ходят вверх, черные вниз

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] !== player) continue;

      const directions: [number, number][] = [
        [dir, -1],
        [dir, 1],
      ]; // обычный ход только вперед
      directions.forEach(([dr, dc]) => {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && !board[nr][nc]) {
          moves.push({
            from: { row: r, col: c },
            to: { row: nr, col: nc },
          });
        }
      });
    }
  }

  return moves;
}

/**
 * Находим шашки для подсветки обязханные бить
 */
export function getMandatoryPieces(board: Board, player: Cell): Position[] {
  const jumps = getMandatoryJumps(board, player);
  const map = new Map<string, Position>();

  jumps.forEach((m) => {
    const key = `${m.from.row}-${m.from.col}`;
    map.set(key, m.from);
  });

  return Array.from(map.values());
}

/**
 * Для выбранной шашки: возвращает массив доступных клеток (удары или обычные ходы)
 */
export function getAvailableMovesForPiece(
  board: Board,
  player: Cell,
  from: Position,
): Position[] {
  // Сначала проверяем обязательные удары для этой шашки
  const mandatory = getMandatoryJumps(board, player).filter(
    (m) => m.from.row === from.row && m.from.col === from.col,
  );
  if (mandatory.length > 0) return mandatory.map((m) => m.to);

  // Если ударов нет, проверяем обычные ходы
  const possible = getPossibleMoves(board, player).filter(
    (m) => m.from.row === from.row && m.from.col === from.col,
  );
  return possible.map((m) => m.to);
}

/**
 * Проверка, есть ли еще серии ударов для шашки
 */
export function getJumpsFromPosition(
  board: Board,
  player: Cell,
  from: Position,
): CheckersMove[] {
  // Передаем forcedPiece — чтобы серия была только для этой шашки
  return getMandatoryJumps(board, player, from);
}

