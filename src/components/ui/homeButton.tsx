import { AppButton } from "@/components/ui/appButton";
import { useNavigate } from "react-router-dom";

export const HomeButton = () => {
  const navigate = useNavigate();

  return (
    <AppButton
      onClick={() => navigate("/welcome")}
      variant="secondary"
      className="flex items-center gap-2"
    >
      🏠 Домой
    </AppButton>
  );
};
