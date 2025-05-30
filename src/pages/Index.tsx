
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Immediate redirect without any UI
    navigate("/auth", { replace: true });
  }, [navigate]);

  // Return null to prevent any rendering
  return null;
};

export default Index;
