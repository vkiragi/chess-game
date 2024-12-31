import { Piece, Position, PieceColor } from "../types/piece";
import { evaluatePosition } from "./evaluation";

interface MoveResult {
  score: number;
  move?: {
    from: Position;
    to: Position;
  };
}

export function findBestMove(
  board: (Piece | null)[][],
  calculatePossibleMoves: (
    position: Position,
    checkingAttack: boolean,
    boardState: (Piece | null)[][]
  ) => Position[],
  depth: number = 3,
  isMaximizing: boolean = true,
  alpha: number = -Infinity,
  beta: number = Infinity
): MoveResult {
  if (depth === 0) {
    return { score: evaluatePosition(board) };
  }

  const color = isMaximizing ? "white" : "black";
  let bestMove: { from: Position; to: Position } | undefined;
  let bestScore = isMaximizing ? -Infinity : Infinity;

  // Get all possible moves for the current color
  const moves = getAllPossibleMoves(board, color, calculatePossibleMoves);

  for (const move of moves) {
    const newBoard = makeMove(board, move.from, move.to);
    const evaluation = findBestMove(
      newBoard,
      calculatePossibleMoves,
      depth - 1,
      !isMaximizing,
      alpha,
      beta
    );

    if (isMaximizing) {
      if (evaluation.score > bestScore) {
        bestScore = evaluation.score;
        bestMove = move;
      }
      alpha = Math.max(alpha, bestScore);
    } else {
      if (evaluation.score < bestScore) {
        bestScore = evaluation.score;
        bestMove = move;
      }
      beta = Math.min(beta, bestScore);
    }

    if (beta <= alpha) {
      break;
    }
  }

  return { score: bestScore, move: bestMove };
}

function getAllPossibleMoves(
  board: (Piece | null)[][],
  color: PieceColor,
  calculatePossibleMoves: (
    position: Position,
    checkingAttack: boolean,
    boardState: (Piece | null)[][]
  ) => Position[]
) {
  const moves: { from: Position; to: Position }[] = [];

  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const piece = board[y][x];
      if (piece && piece.color === color) {
        const possibleMoves = calculatePossibleMoves({ x, y }, false, board);
        moves.push(...possibleMoves.map((to) => ({ from: { x, y }, to })));
      }
    }
  }

  return moves;
}

function makeMove(
  board: (Piece | null)[][],
  from: Position,
  to: Position
): (Piece | null)[][] {
  const newBoard = board.map((row) => [...row]);
  const piece = newBoard[from.y][from.x];
  newBoard[from.y][from.x] = null;
  if (piece) {
    newBoard[to.y][to.x] = {
      ...piece,
      position: to,
      hasMoved: true,
    };
  }
  return newBoard;
}
