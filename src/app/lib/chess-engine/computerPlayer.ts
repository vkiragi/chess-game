import { Piece, Position, PieceColor } from "../types/piece";
import { StockfishService } from "./stockfishService";

export class ComputerPlayer {
  private readonly color: PieceColor;
  private stockfish: StockfishService;

  constructor(color: PieceColor = "black") {
    this.color = color;
    this.stockfish = new StockfishService();
  }

  public getColor(): PieceColor {
    return this.color;
  }

  async makeMove(
    board: (Piece | null)[][]
  ): Promise<{ from: Position; to: Position } | null> {
    return await this.stockfish.getBestMove(board, this.color);
  }

  destroy() {
    this.stockfish.destroy();
  }
}
