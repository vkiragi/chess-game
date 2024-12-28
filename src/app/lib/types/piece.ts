export type PieceType =
  | "king"
  | "queen"
  | "bishop"
  | "knight"
  | "rook"
  | "pawn";
export type PieceColor = "white" | "black";

export interface Position {
  x: number;
  y: number;
}

export interface Piece {
  type: PieceType;
  color: PieceColor;
  position: Position;
  hasMoved: boolean;
}
