"use client";

import { useState } from "react";
import Square from "./Square";
import { initialPosition } from "@/app/lib/constants/initialPosition";
import styles from "./styles.module.css";
import { Position } from "@/app/lib/types/piece";
import { PieceColor, PieceType } from "@/app/lib/types/piece";

export default function Board() {
  const [board, setBoard] = useState(initialPosition);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(
    null
  );
  const [possibleMoves, setPossibleMoves] = useState<Position[]>([]);
  const [currentPlayer] = useState<PieceColor>("white");
  const [promotionSquare, setPromotionSquare] = useState<Position | null>(null);

  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

  const calculatePossibleMoves = (position: Position): Position[] => {
    const piece = board[position.y][position.x];
    if (!piece) return [];

    // Helper function to check if a position contains an enemy piece
    const isEnemyPiece = (x: number, y: number) => {
      const targetPiece = board[y][x];
      return targetPiece && targetPiece.color !== piece.color;
    };

    // Helper function to check if a square is empty
    const isEmpty = (x: number, y: number) => {
      return !board[y][x];
    };

    // Helper function to check castling possibility
    const getCastlingMoves = (kingPosition: Position): Position[] => {
      if (piece.hasMoved) return [];
      const castlingMoves: Position[] = [];
      const y = kingPosition.y;

      // Kingside castling
      const kingsideRook = board[y][7];
      if (kingsideRook?.type === "rook" && !kingsideRook.hasMoved) {
        if (isEmpty(5, y) && isEmpty(6, y)) {
          castlingMoves.push({ x: 6, y });
        }
      }

      // Queenside castling
      const queensideRook = board[y][0];
      if (queensideRook?.type === "rook" && !queensideRook.hasMoved) {
        if (isEmpty(1, y) && isEmpty(2, y) && isEmpty(3, y)) {
          castlingMoves.push({ x: 2, y });
        }
      }

      return castlingMoves;
    };

    switch (piece.type) {
      case "pawn": {
        const direction = piece.color === "white" ? -1 : 1;
        const moves: Position[] = [];

        // Forward moves
        const oneStep = { x: position.x, y: position.y + direction };
        if (oneStep.y >= 0 && oneStep.y < 8 && !board[oneStep.y][oneStep.x]) {
          moves.push(oneStep);

          // Initial two square move
          const isInitialPosition =
            (piece.color === "white" && position.y === 6) ||
            (piece.color === "black" && position.y === 1);
          if (isInitialPosition) {
            const twoStep = { x: position.x, y: position.y + direction * 2 };
            if (!board[twoStep.y][twoStep.x]) {
              moves.push(twoStep);
            }
          }
        }

        // Capture moves (diagonally)
        const captureMoves = [
          { x: position.x - 1, y: position.y + direction },
          { x: position.x + 1, y: position.y + direction },
        ];

        captureMoves.forEach((move) => {
          if (move.x >= 0 && move.x < 8 && move.y >= 0 && move.y < 8) {
            if (isEnemyPiece(move.x, move.y)) {
              moves.push(move);
            }
          }
        });

        return moves;
      }

      case "rook": {
        const moves: Position[] = [];
        const directions = [
          [0, 1],
          [1, 0],
          [0, -1],
          [-1, 0],
        ];

        for (const [dx, dy] of directions) {
          let x = position.x + dx;
          let y = position.y + dy;

          while (x >= 0 && x < 8 && y >= 0 && y < 8) {
            if (board[y][x]) {
              if (isEnemyPiece(x, y)) {
                moves.push({ x, y });
              }
              break;
            }
            moves.push({ x, y });
            x += dx;
            y += dy;
          }
        }
        return moves;
      }

      case "knight": {
        const knightMoves = [
          [-2, -1],
          [-2, 1],
          [-1, -2],
          [-1, 2],
          [1, -2],
          [1, 2],
          [2, -1],
          [2, 1],
        ];

        return knightMoves
          .map(([dx, dy]) => ({
            x: position.x + dx,
            y: position.y + dy,
          }))
          .filter(
            (pos) =>
              pos.x >= 0 &&
              pos.x < 8 &&
              pos.y >= 0 &&
              pos.y < 8 &&
              (!board[pos.y][pos.x] || isEnemyPiece(pos.x, pos.y))
          );
      }

      case "bishop": {
        const moves: Position[] = [];
        const directions = [
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1],
        ];

        for (const [dx, dy] of directions) {
          let x = position.x + dx;
          let y = position.y + dy;

          while (x >= 0 && x < 8 && y >= 0 && y < 8) {
            if (board[y][x]) {
              if (isEnemyPiece(x, y)) {
                moves.push({ x, y });
              }
              break;
            }
            moves.push({ x, y });
            x += dx;
            y += dy;
          }
        }
        return moves;
      }

      case "queen": {
        const moves: Position[] = [];
        const directions = [
          [0, 1],
          [1, 0],
          [0, -1],
          [-1, 0],
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1],
        ];

        for (const [dx, dy] of directions) {
          let x = position.x + dx;
          let y = position.y + dy;

          while (x >= 0 && x < 8 && y >= 0 && y < 8) {
            if (board[y][x]) {
              if (isEnemyPiece(x, y)) {
                moves.push({ x, y });
              }
              break;
            }
            moves.push({ x, y });
            x += dx;
            y += dy;
          }
        }
        return moves;
      }

      case "king": {
        const normalMoves = [
          [-1, -1],
          [-1, 0],
          [-1, 1],
          [0, -1],
          [0, 1],
          [1, -1],
          [1, 0],
          [1, 1],
        ]
          .map(([dx, dy]) => ({
            x: position.x + dx,
            y: position.y + dy,
          }))
          .filter(
            (pos) =>
              pos.x >= 0 &&
              pos.x < 8 &&
              pos.y >= 0 &&
              pos.y < 8 &&
              (!board[pos.y][pos.x] || isEnemyPiece(pos.x, pos.y))
          );

        const castlingMoves = getCastlingMoves(position);
        return [...normalMoves, ...castlingMoves];
      }

      default:
        return [];
    }
  };

  const handlePromotion = (pieceType: PieceType) => {
    if (!promotionSquare) return;

    const newBoard = board.map((row) => [...row]);
    newBoard[promotionSquare.y][promotionSquare.x] = {
      type: pieceType,
      color: "white",
      position: promotionSquare,
      hasMoved: true,
    };

    setBoard(newBoard);
    setPromotionSquare(null);
  };

  const handleSquareClick = (position: Position) => {
    const piece = board[position.y][position.x];

    if (!selectedPosition && piece?.color === "white") {
      setSelectedPosition(position);
      setPossibleMoves(calculatePossibleMoves(position));
      return;
    }

    if (selectedPosition) {
      const isValidMove = possibleMoves.some(
        (move) => move.x === position.x && move.y === position.y
      );

      if (isValidMove) {
        const movingPiece = board[selectedPosition.y][selectedPosition.x];

        if (movingPiece) {
          const newBoard = board.map((row) => [...row]);
          newBoard[selectedPosition.y][selectedPosition.x] = null;
          newBoard[position.y][position.x] = {
            ...movingPiece,
            position: position,
            hasMoved: true,
          };

          // Handle castling move
          if (movingPiece.type === "king") {
            const isCastling = Math.abs(position.x - selectedPosition.x) === 2;
            if (isCastling) {
              // Kingside castling
              if (position.x === 6) {
                const rook = newBoard[position.y][7];
                newBoard[position.y][7] = null;
                newBoard[position.y][5] = {
                  ...rook!,
                  position: { x: 5, y: position.y },
                  hasMoved: true,
                };
              }
              // Queenside castling
              else if (position.x === 2) {
                const rook = newBoard[position.y][0];
                newBoard[position.y][0] = null;
                newBoard[position.y][3] = {
                  ...rook!,
                  position: { x: 3, y: position.y },
                  hasMoved: true,
                };
              }
            }
          }

          // Check for pawn promotion
          if (movingPiece.type === "pawn" && position.y === 0) {
            setPromotionSquare(position);
          }

          setBoard(newBoard);
        }
      }

      setSelectedPosition(null);
      setPossibleMoves([]);
    }
  };

  return (
    <div className="relative">
      {/* Rank coordinates (1-8) - Left */}
      <div className="absolute -left-6 top-0 bottom-0 flex flex-col justify-around py-1">
        {ranks.map((rank) => (
          <div key={rank} className="h-8 flex items-center text-sm">
            {rank}
          </div>
        ))}
      </div>

      {/* File coordinates (A-H) - Bottom */}
      <div className="absolute -bottom-6 left-0 right-0 flex justify-around px-[30px]">
        {files.map((file) => (
          <div key={file} className="w-8 text-center text-sm">
            {file.toUpperCase()}
          </div>
        ))}
      </div>

      {/* Chess Board */}
      <div className="w-[600px] h-[600px] grid grid-cols-8 border border-gray-300">
        {board.map((row, y) =>
          row.map((piece, x) => {
            const pos = { x, y };
            const isSelected =
              selectedPosition?.x === x && selectedPosition?.y === y;
            const isPossibleMove = possibleMoves.some(
              (move) => move.x === x && move.y === y
            );

            return (
              <Square
                key={`${x}-${y}`}
                isLight={(x + y) % 2 === 0}
                piece={piece}
                position={pos}
                isSelected={isSelected}
                isPossibleMove={isPossibleMove}
                onClick={() => handleSquareClick(pos)}
              />
            );
          })
        )}
      </div>

      {/* Promotion Modal */}
      {promotionSquare && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg shadow-lg flex gap-4">
            {["queen", "rook", "bishop", "knight"].map((type) => (
              <button
                key={type}
                onClick={() => handlePromotion(type as PieceType)}
                className="w-16 h-16 flex items-center justify-center hover:bg-gray-100 rounded"
              >
                <img
                  src={`/pieces/w${
                    type === "knight" ? "N" : type.charAt(0).toUpperCase()
                  }.svg`}
                  alt={type}
                  className="w-12 h-12"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
