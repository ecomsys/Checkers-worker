import type { Position } from "@/types/types";

export const mapCell = (r: number, c: number, size: number, playerColor: "w" | "b") =>
  playerColor === "b" ? { row: size - 1 - r, col: size - 1 - c } : { row: r, col: c };

export const isMandatory = (r: number, c: number, mandatoryPieces: Position[] = []) =>
  mandatoryPieces.some(m => m.row === r && m.col === c);

export const isAvailable = (r: number, c: number, availableMoves: Position[] = []) =>
  availableMoves.some(m => m.row === r && m.col === c);
