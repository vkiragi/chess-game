"use client";

import { useState } from "react";
import Square from "./Square";
import { initialPosition } from "@/app/lib/constants/initialPosition";
import styles from "./styles.module.css";
import { Position } from "@/app/lib/types/piece";
import { PieceColor } from "@/app/lib/types/piece";

export default function Board() {
  const [board, setBoard] = useState(initialPosition);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(
    null
  );
  const [possibleMoves, setPossibleMoves] = useState<Position[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>("white");

  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

  const calculatePossibleMoves = (position: Position): Position[] => {
    const piece = board[position.y][position.x];
    if (!piece) return [];

    switch (piece.type) {
      case "pawn": {
        const direction = piece.color === "white" ? -1 : 1;
        const moves: Position[] = [];

        // Single square forward
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
        return moves;
      }

      case "rook":
        // Existing rook logic
        return [
          { x: position.x + 1, y: position.y },
          { x: position.x - 1, y: position.y },
          { x: position.x, y: position.y + 1 },
          { x: position.x, y: position.y - 1 },
        ].filter((pos) => pos.x >= 0 && pos.x < 8 && pos.y >= 0 && pos.y < 8);

      default:
        return [];
    }
  };

  const handleSquareClick = (position: Position) => {
    const piece = board[position.y][position.x];

    if (!selectedPosition && piece?.color === currentPlayer) {
      setSelectedPosition(position);
      setPossibleMoves(calculatePossibleMoves(position));
      return;
    }

    if (selectedPosition) {
      // Handle move if clicked position is in possibleMoves
      const isValidMove = possibleMoves.some(
        (move) => move.x === position.x && move.y === position.y
      );

      if (isValidMove) {
        // Create new board state
        const newBoard = board.map((row) => [...row]);
        const movingPiece = board[selectedPosition.y][selectedPosition.x];

        if (movingPiece) {
          // Update piece position
          newBoard[selectedPosition.y][selectedPosition.x] = null;
          newBoard[position.y][position.x] = {
            ...movingPiece,
            position: position,
            hasMoved: true,
          };

          setBoard(newBoard);
          setCurrentPlayer(currentPlayer === "white" ? "black" : "white");
        }
      }

      // Reset selection
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
    </div>
  );
}
