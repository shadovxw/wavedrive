// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function ProtectedRoute({ children }) {
  const { userLoggedIn } = useAuth();

  if (!userLoggedIn) {
    return <Navigate to="/loginsignup" replace />;
  }

  return children;
}

export default ProtectedRoute;
