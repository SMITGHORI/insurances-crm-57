
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-amba-blue mb-4">404</h1>
        <p className="text-xl text-gray-700 mb-6">Oops! We couldn't find that page</p>
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been moved. Please check the URL or return to the dashboard.
        </p>
        <button 
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 bg-amba-blue text-white rounded-md hover:bg-amba-lightblue transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default NotFound;
