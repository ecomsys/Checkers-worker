import { AppButton } from "@/components/ui/appButton";
import { useNavigate } from "react-router-dom";

export const BackButton = () => {
  const navigate = useNavigate();

  return (
    <AppButton
      onClick={() => navigate(-1)}
      variant="secondary"
      className="flex items-center gap-2"
    >
      ← Назад
    </AppButton>
  );
};
