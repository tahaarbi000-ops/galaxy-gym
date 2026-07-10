import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CircularProgress from '@mui/material/CircularProgress';
import LoadingPage from "./LoadingPage";


export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingPage />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}