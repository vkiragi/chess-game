"use client";

import { useState } from "react";
import Square from "./Square";
import { initialPosition } from "@/app/lib/constants/initialPosition";
import styles from "./styles.module.css";

export default function Board() {
  const [board, setBoard] = useState(initialPosition);

  return (
    <div className="w-[600px] h-[600px] grid grid-cols-8 border border-gray-300">
      {board.map((row, y) =>
        row.map((piece, x) => (
          <Square
            key={`${x}-${y}`}
            isLight={(x + y) % 2 === 0}
            piece={piece}
            position={{ x, y }}
          />
        ))
      )}
    </div>
  );
}
