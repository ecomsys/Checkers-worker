import type { Board as BoardType, Position } from "@/types/types";
import { mapCell, isMandatory, isAvailable } from "./BoardUtils";

export const drawBoard = (
  ctx: CanvasRenderingContext2D,
  size: number,
  canvasSize: number,
  margin: number,
  selected: Position | null,
  availableMoves: Position[],
  mandatoryPieces: Position[],
  playerColor: "w" | "b"
) => {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const { row, col } = mapCell(r, c, size, playerColor);
      const x = margin + col * (canvasSize - 2 * margin) / size;
      const y = margin + row * (canvasSize - 2 * margin) / size;

      let fillColor = (r + c) % 2 === 0 ? "#f0d9b5" : "#b58863";
      if (selected?.row === r && selected?.col === c) fillColor = "#facc15";
      else if (isAvailable(r, c, availableMoves)) fillColor = "green";
      else if (isMandatory(r, c, mandatoryPieces)) fillColor = "#ef4444";

      ctx.fillStyle = fillColor;
      ctx.fillRect(x, y, (canvasSize - 2 * margin) / size, (canvasSize - 2 * margin) / size);
    }
  }
};

export const drawPieces = (
  ctx: CanvasRenderingContext2D,
  board: BoardType,
  size: number,
  canvasSize: number,
  margin: number,
  playerColor: "w" | "b"
) => {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const piece = board[r][c];
      if (!piece) continue;
      const { row, col } = mapCell(r, c, size, playerColor);

      const cellSize = (canvasSize - 2 * margin) / size;
      const x = margin + col * cellSize + cellSize / 2;
      const y = margin + row * cellSize + cellSize / 2;

      ctx.beginPath();
      ctx.arc(x, y, cellSize * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = piece === "w" ? "#fff" : "#000";
      ctx.fill();
      ctx.strokeStyle = piece === "w" ? "#999" : "#333";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
};

export const drawCoordinates = (
  ctx: CanvasRenderingContext2D,
  size: number,
  canvasSize: number,
  margin: number,
  playerColor: "w" | "b"
) => {
  const letters = ["A","B","C","D","E","F","G","H"];
  const numbers = ["1","2","3","4","5","6","7","8"].reverse();

  ctx.fillStyle = "#000";
  ctx.font = `${(canvasSize - 2 * margin) / size * 0.3}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const lettersToDraw = playerColor === "b" ? letters : [...letters].reverse();
  const numbersToDraw = playerColor === "b" ? numbers : [...numbers].reverse();

  for (let i = 0; i < size; i++) {
    const cellSize = (canvasSize - 2 * margin) / size;
    ctx.fillText(lettersToDraw[i], margin + i * cellSize + cellSize / 2, margin / 2);
    ctx.fillText(lettersToDraw[i], margin + i * cellSize + cellSize / 2, canvasSize - margin / 2);
    ctx.fillText(numbersToDraw[i], margin / 2, margin + i * cellSize + cellSize / 2);
    ctx.fillText(numbersToDraw[i], canvasSize - margin / 2, margin + i * cellSize + cellSize / 2);
  }
};
