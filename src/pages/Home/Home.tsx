import { useNavigate } from "react-router-dom";
import { AppButton } from "@/components/ui/appButton";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 px-4">

      <p className="text-2xl md:text-3xl font-bold text-white -mt-2 mb-10 text-center">
        Шашки онлайн
      </p>

      <div className="flex flex-col md:flex-row gap-4">
        <AppButton variant="primary" onClick={() => navigate("/rules")}>
          Правила игры
        </AppButton>       

        <AppButton
          variant="secondary"
          onClick={() => navigate("/game?mode=pve")}
        >
          Играть против бота
        </AppButton>

        <AppButton
          variant="secondary"
          onClick={() => navigate("/game?mode=eve")}
        >
          Смотреть игру бота против бота
        </AppButton>
      </div>
    </div>
  );
};