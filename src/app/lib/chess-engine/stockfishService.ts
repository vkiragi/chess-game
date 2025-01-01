import { Position, Piece } from "../types/piece";

export class StockfishService {
  private worker: Worker | null = null;
  private isReady = false;
  private readonly depth: number;

  constructor(depth: number = 10) {
    this.depth = depth;
    this.initializeWorker();
  }

  private initializeWorker() {
    if (typeof window !== "undefined") {
      this.worker = new Worker("/stockfish.js");
      this.worker.onmessage = (e) => {
        if (e.data === "uciok") {
          this.isReady = true;
          this.worker?.postMessage("isready");
        }
      };
      this.worker.postMessage("uci");
    }
  }

  private boardToFen(board: (Piece | null)[][]): string {
    let fen = "";
    let emptyCount = 0;

    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = board[rank][file];
        if (piece === null) {
          emptyCount++;
        } else {
          if (emptyCount > 0) {
            fen += emptyCount;
            emptyCount = 0;
          }
          const pieceSymbol = this.getPieceSymbol(piece);
          fen +=
            piece.color === "white"
              ? pieceSymbol.toUpperCase()
              : pieceSymbol.toLowerCase();
        }
      }
      if (emptyCount > 0) {
        fen += emptyCount;
        emptyCount = 0;
      }
      if (rank < 7) fen += "/";
    }

    return fen;
  }

  private getPieceSymbol(piece: Piece): string {
    switch (piece.type) {
      case "pawn":
        return "p";
      case "knight":
        return "n";
      case "bishop":
        return "b";
      case "rook":
        return "r";
      case "queen":
        return "q";
      case "king":
        return "k";
      default:
        return "";
    }
  }

  public async getBestMove(
    board: (Piece | null)[][],
    color: "white" | "black"
  ): Promise<{ from: Position; to: Position } | null> {
    if (!this.worker || !this.isReady) return null;

    const fen = this.boardToFen(board) + ` ${color[0]} - - 0 1`;

    return new Promise((resolve) => {
      if (!this.worker) return resolve(null);

      this.worker.onmessage = (e) => {
        const msg = e.data;
        if (msg.startsWith("bestmove")) {
          const move = msg.split(" ")[1];
          if (move === "(none)") return resolve(null);

          const from: Position = {
            x: move.charCodeAt(0) - 97,
            y: 8 - parseInt(move[1]),
          };
          const to: Position = {
            x: move.charCodeAt(2) - 97,
            y: 8 - parseInt(move[3]),
          };

          resolve({ from, to });
        }
      };

      this.worker.postMessage(`position fen ${fen}`);
      this.worker.postMessage(`go depth ${this.depth}`);
    });
  }

  public destroy() {
    this.worker?.terminate();
  }
}
