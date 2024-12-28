import { Piece, Position } from "@/app/lib/types/piece";

interface SquareProps {
  isLight: boolean;
  piece: Piece | null;
  position: Position;
}

export default function Square({ isLight, piece, position }: SquareProps) {
  const getPieceLetterCode = (type: string) => {
    switch (type) {
      case "knight":
        return "N";
      default:
        return type.charAt(0).toUpperCase();
    }
  };

  return (
    <div
      className={`w-full aspect-square flex items-center justify-center
        ${isLight ? "bg-[#f0d9b5]" : "bg-[#b58863]"}`}
    >
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
