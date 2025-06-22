
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Immediate redirect to auth page
    navigate("/auth", { replace: true });
  }, [navigate]);

  // Return null to prevent any rendering during redirect
  return null;
};

export default Index;
