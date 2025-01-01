"use client";

import { useState, useEffect, useCallback } from "react";
import Square from "./Square";
import { initialPosition } from "@/app/lib/constants/initialPosition";
import styles from "./styles.module.css";
import { Position, Piece, PieceColor, PieceType } from "@/app/lib/types/piece";
import { ComputerPlayer } from "@/app/lib/chess-engine/computerPlayer";

export default function Board() {
  const [board, setBoard] = useState(initialPosition);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(
    null
  );
  const [possibleMoves, setPossibleMoves] = useState<Position[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>("white");
  const [promotionSquare, setPromotionSquare] = useState<Position | null>(null);
  const [kingInCheck, setKingInCheck] = useState<Position | null>(null);
  const [gameStatus, setGameStatus] = useState<{
    isOver: boolean;
    winner: PieceColor | null;
    reason: string;
  } | null>(null);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [computerPlayer] = useState(new ComputerPlayer("black"));
  const [isComputerEnabled, setIsComputerEnabled] = useState(true);
  const [isComputerThinking, setIsComputerThinking] = useState(false);

  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

  // Helper function to check if a square is under attack by the opponent
  const isSquareUnderAttack = (
    position: Position,
    color: PieceColor,
    boardState = board
  ): boolean => {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = boardState[y][x];
        if (piece && piece.color !== color) {
          const moves = calculatePossibleMoves({ x, y }, true, boardState);
          if (
            moves.some((move) => move.x === position.x && move.y === position.y)
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // Helper function to find the king's position
  const findKing = (color: PieceColor): Position | null => {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = board[y][x];
        if (piece?.type === "king" && piece.color === color) {
          console.log(`Found ${color} king at x:${x}, y:${y}`);
          return { x, y };
        }
      }
    }
    return null;
  };

  const calculatePossibleMoves = (
    position: Position,
    checkingAttack: boolean = false,
    boardState = board
  ): Position[] => {
    const piece = boardState[position.y][position.x];
    if (!piece) return [];

    // Add a parameter to prevent infinite recursion
    const isKingMove = piece.type === "king" && !checkingAttack;

    // Helper function to check if a position contains an enemy piece
    const isEnemyPiece = (x: number, y: number) => {
      const targetPiece = boardState[y][x];
      return targetPiece && targetPiece.color !== piece.color;
    };

    // Helper function to check if a square is empty
    const isEmpty = (x: number, y: number) => {
      return !boardState[y][x];
    };

    // Modified castling check to include check detection
    const getCastlingMoves = (kingPosition: Position): Position[] => {
      if (piece.hasMoved) return [];

      // Don't calculate castling moves when checking for attacks
      if (checkingAttack) return [];

      // Can't castle out of check
      if (isSquareUnderAttack(kingPosition, piece.color)) return [];

      const castlingMoves: Position[] = [];
      const y = kingPosition.y;

      // Kingside castling
      const kingsideRook = boardState[y][7];
      if (kingsideRook?.type === "rook" && !kingsideRook.hasMoved) {
        if (isEmpty(5, y) && isEmpty(6, y)) {
          // Check if passing squares are safe
          if (
            !isSquareUnderAttack({ x: 5, y }, piece.color) &&
            !isSquareUnderAttack({ x: 6, y }, piece.color)
          ) {
            castlingMoves.push({ x: 6, y });
          }
        }
      }

      // Queenside castling
      const queensideRook = boardState[y][0];
      if (queensideRook?.type === "rook" && !queensideRook.hasMoved) {
        if (isEmpty(1, y) && isEmpty(2, y) && isEmpty(3, y)) {
          // Check if passing squares are safe
          if (
            !isSquareUnderAttack({ x: 2, y }, piece.color) &&
            !isSquareUnderAttack({ x: 3, y }, piece.color)
          ) {
            castlingMoves.push({ x: 2, y });
          }
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
        if (
          oneStep.y >= 0 &&
          oneStep.y < 8 &&
          !boardState[oneStep.y][oneStep.x]
        ) {
          moves.push(oneStep);

          // Initial two square move
          const isInitialPosition =
            (piece.color === "white" && position.y === 6) ||
            (piece.color === "black" && position.y === 1);
          if (
            isInitialPosition &&
            !boardState[position.y + direction][position.x]
          ) {
            const twoStep = { x: position.x, y: position.y + direction * 2 };
            if (!boardState[twoStep.y][twoStep.x]) {
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
            // When checking for attacks, include diagonal moves even if no enemy piece
            if (checkingAttack || isEnemyPiece(move.x, move.y)) {
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
            if (boardState[y][x]) {
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
              (!boardState[pos.y][pos.x] || isEnemyPiece(pos.x, pos.y))
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
            if (boardState[y][x]) {
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
            if (boardState[y][x]) {
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
              (!boardState[pos.y][pos.x] || isEnemyPiece(pos.x, pos.y))
          );

        // Only check for safe moves if this is an actual king move, not an attack check
        if (isKingMove) {
          const safeMoves = normalMoves.filter((pos) => {
            const simulatedBoard = boardState.map((row) => [...row]);
            simulatedBoard[position.y][position.x] = null;
            simulatedBoard[pos.y][pos.x] = piece;

            return !isSquareUnderAttack(pos, piece.color, simulatedBoard);
          });

          const castlingMoves = getCastlingMoves(position);
          return [...safeMoves, ...castlingMoves];
        }

        return normalMoves;
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

  const handleSquareClick = async (position: Position) => {
    // Don't allow moves if game is over
    if (gameStatus?.isOver) return;

    const piece = board[position.y][position.x];

    // If no piece is selected and clicked on own piece
    if (!selectedPosition && piece?.color === currentPlayer) {
      console.log("Selecting piece:", piece);
      setSelectedPosition(position);
      setPossibleMoves(calculatePossibleMoves(position));
      return;
    }

    // If a piece is selected
    if (selectedPosition) {
      const isValidMove = possibleMoves.some(
        (move) => move.x === position.x && move.y === position.y
      );

      if (isValidMove) {
        console.log("Making move from", selectedPosition, "to", position);
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

          // Check if this move puts the opponent's king in check
          const opponentColor =
            movingPiece.color === "white" ? "black" : "white";
          const opponentKingPos = findKing(opponentColor);

          if (opponentKingPos) {
            // Use newBoard to check if the opponent's king is under attack
            const isCheck = isSquareUnderAttack(
              opponentKingPos,
              opponentColor,
              newBoard
            );

            if (isCheck) {
              console.log(`${opponentColor} king is in check`);
              setKingInCheck(opponentKingPos);
              // Check for checkmate
              if (!hasLegalMoves(opponentColor, newBoard)) {
                console.log(`CHECKMATE: ${opponentColor} has no legal moves`);
                setGameStatus({
                  isOver: true,
                  winner: movingPiece.color,
                  reason: "Checkmate",
                });
              }
            } else {
              setKingInCheck(null);
              // Check for stalemate
              if (!hasLegalMoves(opponentColor, newBoard)) {
                console.log(`STALEMATE: ${opponentColor} has no legal moves`);
                setGameStatus({
                  isOver: true,
                  winner: null,
                  reason: "Stalemate",
                });
              }
            }
          }

          setCurrentPlayer(currentPlayer === "white" ? "black" : "white");

          const isCapture = board[position.y][position.x] !== null;
          const moveNotation = toAlgebraicNotation(
            selectedPosition,
            position,
            movingPiece,
            isCapture,
            board
          );
          setMoveHistory((prev) => [...prev, moveNotation]);
        }
      }

      setSelectedPosition(null);
      setPossibleMoves([]);
    }
  };

  const hasLegalMoves = (color: PieceColor, boardState = board): boolean => {
    console.log(`Checking legal moves for ${color}`);
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = boardState[y][x];
        if (piece && piece.color === color) {
          const moves = calculatePossibleMoves({ x, y }, false, boardState);
          console.log(
            `${piece.type} at x:${x}, y:${y} has ${moves.length} moves`
          );

          // Simulate each move to ensure it doesn't leave king in check
          for (const move of moves) {
            const simulatedBoard = boardState.map((row) => [...row]);
            simulatedBoard[y][x] = null;
            simulatedBoard[move.y][move.x] = piece;

            const kingPos = piece.type === "king" ? move : findKing(color);
            if (
              kingPos &&
              !isSquareUnderAttack(kingPos, color, simulatedBoard)
            ) {
              return true; // Found at least one legal move
            }
          }
        }
      }
    }
    console.log(`No legal moves found for ${color}`);
    return false;
  };

  const renderGameStatus = () => {
    console.log("Rendering game status:", gameStatus);
    if (!gameStatus?.isOver) return null;

    return (
      <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-white p-12 rounded-xl shadow-2xl text-center transform scale-110">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Game Over</h2>
          <p className="text-2xl text-gray-700">
            {gameStatus.winner ? (
              <span className="text-blue-600 font-semibold">
                {gameStatus.winner.charAt(0).toUpperCase() +
                  gameStatus.winner.slice(1)}
                wins by {gameStatus.reason}!
              </span>
            ) : (
              <span className="text-gray-600 font-semibold">
                Game drawn by {gameStatus.reason}
              </span>
            )}
          </p>
        </div>
      </div>
    );
  };

  const toAlgebraicNotation = (
    from: Position,
    to: Position,
    piece: Piece,
    isCapture: boolean,
    board: (Piece | null)[][]
  ): string => {
    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

    if (piece.type === "king" && Math.abs(from.x - to.x) === 2) {
      return to.x > from.x ? "O-O" : "O-O-O";
    }

    const pieceSymbol =
      piece.type === "pawn"
        ? ""
        : piece.type === "knight"
        ? "N"
        : piece.type.charAt(0).toUpperCase();
    const captureNotation = isCapture ? "x" : "";
    const fromFile = piece.type === "pawn" && isCapture ? files[from.x] : "";
    const destination = `${files[to.x]}${ranks[to.y]}`;

    return `${pieceSymbol}${fromFile}${captureNotation}${destination}`;
  };

  const renderMoveHistory = () => {
    return (
      <div className="absolute top-[-32px] -right-80 w-64 h-[664px] bg-gray-800/50 shadow-xl rounded-lg overflow-y-auto backdrop-blur-sm">
        <div className="sticky top-0 z-10 bg-gray-800/50 backdrop-blur-sm px-8 py-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">Move History</h2>
          <button
            onClick={() => setIsComputerEnabled(!isComputerEnabled)}
            className={`w-full px-4 py-2 rounded transition-colors ${
              isComputerEnabled
                ? "bg-red-500 hover:bg-red-600"
                : "bg-blue-500 hover:bg-blue-600"
            } text-white`}
          >
            {isComputerEnabled ? "Disable Computer" : "Enable Computer"}
          </button>
        </div>
        <div className="px-8 py-6 space-y-3">
          {Array.from({ length: Math.ceil(moveHistory.length / 2) }, (_, i) => (
            <div key={i} className="flex items-center">
              <span className="w-8 text-gray-400 font-mono">{i + 1}.</span>
              <div className="flex-1 flex gap-4">
                <span className="w-20 text-white font-medium">
                  {moveHistory[i * 2] || ""}
                </span>
                <span className="w-20 text-gray-300">
                  {moveHistory[i * 2 + 1] || ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const makeComputerMove = useCallback(async () => {
    console.log("makeComputerMove called", {
      isComputerEnabled,
      currentPlayer,
      computerColor: computerPlayer.getColor(),
      gameStatus,
    });

    if (
      !isComputerEnabled ||
      currentPlayer !== computerPlayer.getColor() ||
      gameStatus?.isOver
    ) {
      console.log("Early return from makeComputerMove");
      return;
    }

    setIsComputerThinking(true);
    console.log("Getting move from Stockfish...");
    const move = await computerPlayer.makeMove(board);
    console.log("Received move from Stockfish:", move);
    setIsComputerThinking(false);

    if (move) {
      const piece = board[move.from.y][move.from.x];
      if (piece) {
        console.log("Making move:", move);
        await handleSquareClick(move.from);
        await handleSquareClick(move.to);
      }
    }
  }, [board, currentPlayer, computerPlayer, gameStatus, isComputerEnabled]);

  useEffect(() => {
    if (
      currentPlayer === computerPlayer.getColor() &&
      isComputerEnabled &&
      !gameStatus?.isOver
    ) {
      makeComputerMove();
    }
  }, [
    currentPlayer,
    isComputerEnabled,
    computerPlayer,
    gameStatus,
    makeComputerMove,
  ]);

  useEffect(() => {
    return () => {
      computerPlayer.destroy();
    };
  }, [computerPlayer]);

  useEffect(() => {
    // Start with computer enabled
    setIsComputerEnabled(true);
  }, []);

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
                isInCheck={kingInCheck?.x === x && kingInCheck?.y === y}
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

      {isComputerThinking && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-40">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <p className="text-lg font-semibold">Computer is thinking...</p>
          </div>
        </div>
      )}

      {renderGameStatus()}

      {renderMoveHistory()}
    </div>
  );
}
