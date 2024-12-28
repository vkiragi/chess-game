import { Piece } from "../types/piece";

export const initialPosition: (Piece | null)[][] = [
  [
    { type: "rook", color: "black", position: { x: 0, y: 0 }, hasMoved: false },
    {
      type: "knight",
      color: "black",
      position: { x: 1, y: 0 },
      hasMoved: false,
    },
    {
      type: "bishop",
      color: "black",
      position: { x: 2, y: 0 },
      hasMoved: false,
    },
    {
      type: "queen",
      color: "black",
      position: { x: 3, y: 0 },
      hasMoved: false,
    },
    { type: "king", color: "black", position: { x: 4, y: 0 }, hasMoved: false },
    {
      type: "bishop",
      color: "black",
      position: { x: 5, y: 0 },
      hasMoved: false,
    },
    {
      type: "knight",
      color: "black",
      position: { x: 6, y: 0 },
      hasMoved: false,
    },
    { type: "rook", color: "black", position: { x: 7, y: 0 }, hasMoved: false },
  ],
  Array(8)
    .fill(null)
    .map((_, i) => ({
      type: "pawn",
      color: "black",
      position: { x: i, y: 1 },
      hasMoved: false,
    })),
  ...Array(4).fill(Array(8).fill(null)),
  Array(8)
    .fill(null)
    .map((_, i) => ({
      type: "pawn",
      color: "white",
      position: { x: i, y: 6 },
      hasMoved: false,
    })),
  [
    { type: "rook", color: "white", position: { x: 0, y: 7 }, hasMoved: false },
    {
      type: "knight",
      color: "white",
      position: { x: 1, y: 7 },
      hasMoved: false,
    },
    {
      type: "bishop",
      color: "white",
      position: { x: 2, y: 7 },
      hasMoved: false,
    },
    {
      type: "queen",
      color: "white",
      position: { x: 3, y: 7 },
      hasMoved: false,
    },
    { type: "king", color: "white", position: { x: 4, y: 7 }, hasMoved: false },
    {
      type: "bishop",
      color: "white",
      position: { x: 5, y: 7 },
      hasMoved: false,
    },
    {
      type: "knight",
      color: "white",
      position: { x: 6, y: 7 },
      hasMoved: false,
    },
    { type: "rook", color: "white", position: { x: 7, y: 7 }, hasMoved: false },
  ],
];
