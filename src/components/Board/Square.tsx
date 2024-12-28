import { Piece, Position } from "@/app/lib/types/piece";

interface SquareProps {
  isLight: boolean;
  piece: Piece | null;
  position: Position;
}

export default function Square({ isLight, piece, position }: SquareProps) {
  return (
    <div
      className={`w-full aspect-square flex items-center justify-center
        ${isLight ? "bg-[#f0d9b5]" : "bg-[#b58863]"}`}
    >
      {piece && (
        <div className="text-2xl">
          {/* Temporary representation of pieces using letters */}
          {getPieceSymbol(piece)}
        </div>
      )}
    </div>
  );
}

// Helper function to show piece symbols (temporary until we add images)
function getPieceSymbol(piece: Piece): string {
  const symbol = piece.type.charAt(0).toUpperCase();
  return piece.color === "black" ? `B${symbol}` : `W${symbol}`;
}
