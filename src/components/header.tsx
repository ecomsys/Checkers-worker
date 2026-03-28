import { type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AppButton } from "@/components/ui/appButton";

type HeaderProps = {
  title: string;
  rightContent?: ReactNode;
};

export const Header = ({ title, rightContent }: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-10 bg-white px-3 sm:px-6 shadow-sm">
      {/* ===== Верхняя строка ===== */}
      <div
        className="
          flex items-center gap-5
          max-w-5xl mx-auto           
          py-3 sm:py-5
        "
      >
        {/* Левая часть */}
        <div className="flex gap-2 shrink-0">
          <AppButton
            variant="primary"
            onClick={() => navigate("/home")}
            className="p-2 !text-base"
          >
           <svg className="w-5 h-5 flex-shrink-0 transition-transform duration-200 text-white">
              <use xlinkHref={`/icons/sprite/sprite.svg#home`} />
            </svg>
          </AppButton>
        </div>

        {/* Заголовок */}
        <h1
          className="
            flex-1
            text-2xl md:text-3xl
            font-bold
            text-gray-700
            text-center sm:text-left
            truncate
          "
        >
          {title}
        </h1>

        {/* Правая часть — только desktop */}
        {rightContent && (
          <div className="hidden sm:block shrink-0">
            {rightContent}
          </div>
        )}
      </div>

      {/* ===== Нижняя строка (mobile) ===== */}
      {rightContent && (
        <div className="sm:hidden pb-3">
          {rightContent}
        </div>
      )}
    </div>
  );
};
