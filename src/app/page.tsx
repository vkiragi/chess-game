import Board from "@/components/Board/Board";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
      <main className="p-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-white font-serif">
          Play Chess
        </h1>
        <div className="bg-white/5 p-8 rounded-lg shadow-2xl">
          <Board />
        </div>
      </main>
    </div>
  );
}
