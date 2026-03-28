import { RulesCard } from "./RulesCard";
import { Header } from "@/components/header";

// Мока-данные правил
// Мока-данные правил для русских шашек без дамок
const RULES = [
  {
    title: "Цель игры",
    description:
      "Захватить все шашки соперника или заблокировать их, чтобы он не мог сделать ход."
  },
  {
    title: "Ход игрока",
    description:
      "Игрок делает один ход за раз, двигая шашку по диагонали только вперёд."
  },
  {
    title: "Побивание (обязательный ход)",
    description:
      "Если можно побить шашку соперника, ход обязательный. Можно бить несколько шашек за один ход. Побивать разрешается в любом направлении (вперёд и назад), но обычные ходы всегда только вперёд."
  },
  {
    title: "Шашка в тупике",
    description:
      "Если шашка оказалась в тупике и не может ходить, она остаётся на доске, но больше не участвует в игре."
  },
  {
    title: "Конец игры",
    description:
      "Игра заканчивается, когда у одного игрока не остаётся шашек или нет возможных ходов. Побеждает тот игрок, который может сделать ход, даже если у него меньше шашек."
  }
];


export default function Rules() {
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <Header title="Правила игры" />

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 px-6 pt-6">
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
          {/* Заголовок и описание (по центру) */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">Добро пожаловать в шашки!</h2>
            <p className="text-lg font-semibold text-gray-700 max-w-[800px] mx-auto">
              Здесь описаны основные правила игры. Следуйте им, чтобы быстро освоить игру и получать удовольствие.
            </p>
          </div>

          {/* Список правил */}
          {RULES.map((rule, idx) => (
            <RulesCard
              key={idx}
              index={idx}
              title={rule.title}
              description={rule.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
