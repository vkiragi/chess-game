import { PieceType } from "@/app/lib/types/piece";

interface CapturedPiecesProps {
  pieces: { type: PieceType; count: number }[];
  color: "white" | "black";
}

export default function CapturedPieces({ pieces, color }: CapturedPiecesProps) {
  const getPieceValue = (type: PieceType): number => {
    const values: Record<PieceType, number> = {
      pawn: 1,
      knight: 3,
      bishop: 3,
      rook: 5,
      queen: 9,
      king: 0,
    };
    return values[type];
  };

  const totalValue = pieces.reduce(
    (sum, piece) => sum + getPieceValue(piece.type) * piece.count,
    0
  );

  return (
    <div className="flex flex-col items-center p-4">
      <div className="flex flex-wrap gap-1 mb-2 min-h-[48px]">
        {pieces.map((piece, index) => (
          <div key={`${piece.type}-${index}`} className="relative">
            {Array.from({ length: piece.count }).map((_, i) => (
              <div key={i} className="w-8 h-8">
                <img
                  src={`/pieces/${color.charAt(0)}${
                    piece.type === "knight"
                      ? "N"
                      : piece.type.charAt(0).toUpperCase()
                  }.svg`}
                  alt={`${color} ${piece.type}`}
                  className="w-full h-full"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="text-sm text-gray-500">Material: {totalValue}</div>
    </div>
  );
}
