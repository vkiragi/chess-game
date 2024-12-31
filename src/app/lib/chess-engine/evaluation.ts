import { Piece, PieceType } from "../types/piece";

// Basic piece values
export const PIECE_VALUES = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20000,
};

// Position bonuses for each piece type (simplified)
export const POSITION_BONUSES: Record<PieceType, number[][]> = {
  pawn: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5, 5, 10, 25, 25, 10, 5, 5],
    [0, 0, 0, 20, 20, 0, 0, 0],
    [5, -5, -10, 0, 0, -10, -5, 5],
    [5, 10, 10, -20, -20, 10, 10, 5],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  knight: Array(8).fill(Array(8).fill(0)),
  bishop: Array(8).fill(Array(8).fill(0)),
  rook: Array(8).fill(Array(8).fill(0)),
  queen: Array(8).fill(Array(8).fill(0)),
  king: Array(8).fill(Array(8).fill(0)),
};

export function evaluatePosition(board: (Piece | null)[][]): number {
  let score = 0;

  // Material and position evaluation
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const piece = board[y][x];
      if (piece) {
        const materialValue = PIECE_VALUES[piece.type];
        const positionBonus =
          POSITION_BONUSES[piece.type]?.[piece.color === "white" ? y : 7 - y]?.[
            x
          ] || 0;

        const value =
          (materialValue + positionBonus) * (piece.color === "white" ? 1 : -1);
        score += value;
      }
    }
  }

  return score;
}
