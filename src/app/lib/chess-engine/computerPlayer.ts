import { Piece, Position, PieceColor } from "../types/piece";
import { findBestMove } from "./moveSearch";

export class ComputerPlayer {
  private depth: number;
  private readonly color: PieceColor;

  constructor(color: PieceColor = "black", depth: number = 3) {
    this.color = color;
    this.depth = depth;
  }

  public getColor(): PieceColor {
    return this.color;
  }

  makeMove(
    board: (Piece | null)[][],
    calculatePossibleMoves: (
      position: Position,
      checkingAttack: boolean,
      boardState: (Piece | null)[][]
    ) => Position[]
  ): { from: Position; to: Position } | null {
    const result = findBestMove(
      board,
      calculatePossibleMoves,
      this.depth,
      this.color === "white"
    );

    return result.move || null;
  }
}
