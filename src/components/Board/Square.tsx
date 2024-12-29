import { Piece, Position } from "@/app/lib/types/piece";

interface SquareProps {
  isLight: boolean;
  piece: Piece | null;
  position: Position;
  isSelected?: boolean;
  isPossibleMove?: boolean;
  onClick?: () => void;
}

export default function Square({
  isLight,
  piece,
  position,
  isSelected,
  isPossibleMove,
  onClick,
}: SquareProps) {
  const getPieceLetterCode = (type: string) => {
    switch (type) {
      case "knight":
        return "N";
      case "pawn":
        return "P";
      default:
        return type.charAt(0).toUpperCase();
    }
  };

  return (
    <div
      onClick={onClick}
      className={`w-full aspect-square flex items-center justify-center cursor-pointer relative
        ${isLight ? "bg-[#f0d9b5]" : "bg-[#b58863]"}
        ${isSelected ? "bg-[#f7c063] bg-opacity-50" : ""}
        hover:opacity-90 transition-colors duration-200`}
    >
      {isPossibleMove && (
        <div className="absolute w-4 h-4 rounded-full bg-black/30" />
      )}
      {piece && (
        <div className="w-full h-full p-1">
          <img
            src={`/pieces/${piece.color.charAt(0)}${getPieceLetterCode(
              piece.type
            )}.svg`}
            alt={`${piece.color} ${piece.type}`}
            className="w-full h-full"
            draggable={false}
          />
        </div>
      )}
    </div>
  );
}
