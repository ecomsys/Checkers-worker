import { type FC, useEffect, useState } from "react";
import Confetti from "react-confetti";
import type { CheckersState } from "@/types/types";

interface ModalProps {
  state: CheckersState;       // передаём всё состояние игры
  onRestart: () => void;      // колбек на перезапуск
}

const Modal: FC<ModalProps> = ({ state, onRestart }) => {
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    // запускаем конфетти и звук
    queueMicrotask(() => setConfetti(true));
    const audio = new Audio("/audio/win.mp3");
    audio.play().catch(() => {});
  }, []);

  if (!state.completed || !state.winner) return null; // если игра не завершена — ничего не показываем

  return (
    <>
      <div
        className="fixed inset-0 flex items-center justify-center z-50 
                   bg-black/45 backdrop-blur-[2px] p-4"
      >
        <div
          className="bg-gradient-to-br from-blue-700 via-purple-700 to-indigo-800
                     rounded-2xl shadow-2xl shadow-black/50
                     w-full max-w-[400px] p-6 flex flex-col items-center gap-6
                     animate-fadeIn"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-white text-center drop-shadow-lg">
            🏆 Игра окончена!
          </h2>

          <p className="text-2xl text-white font-bold drop-shadow-md">
            Победили: {state.winner === "w" ? "Белые" : "Чёрные"}
          </p>

          <div className="flex flex-col gap-2 text-white text-lg md:text-xl font-medium text-center">
            <p>
              Ходы: <span className="font-bold">{state.movesCount}</span>
            </p>
            {/* Если нужно можно добавить таймер */}
          </div>

          <button
            className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-500
                       text-white font-semibold text-lg md:text-xl
                       px-6 py-3 rounded-xl
                       shadow-inner shadow-black/30
                       hover:scale-105 transition-transform duration-200
                       w-full max-w-[200px]"
            onClick={onRestart}
          >
            Покинуть игру
          </button>
        </div>
      </div>

      {confetti && (
        <Confetti
          numberOfPieces={150}
          recycle={false}
          gravity={0.3}
          tweenDuration={5000}
          initialVelocityX={{ min: -10, max: 10 }}
          initialVelocityY={{ min: -10, max: 10 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 9999,
          }}
        />
      )}
    </>
  );
};

export default Modal;
