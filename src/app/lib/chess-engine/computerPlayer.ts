import { Chess, type Square as ChessSquare } from "chess.js";
import { Position, PieceColor } from "../types/piece";

export type Difficulty = "easy";

export class ComputerPlayer {
  private readonly color: PieceColor;

  constructor(color: PieceColor = "black") {
    this.color = color;
  }

  public getColor(): PieceColor {
    return this.color;
  }

  makeMove(chess: Chess): { from: Position; to: Position } | null {
    const moves = chess.moves({ verbose: true });
    if (moves.length === 0) return null;

    // Pick a random move
    const move = moves[Math.floor(Math.random() * moves.length)];

    return {
      from: {
        x: move.from.charCodeAt(0) - "a".charCodeAt(0),
        y: 8 - parseInt(move.from[1]),
      },
      to: {
        x: move.to.charCodeAt(0) - "a".charCodeAt(0),
        y: 8 - parseInt(move.to[1]),
      },
    };
  }
}
