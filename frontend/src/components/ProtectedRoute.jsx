import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CircularProgress from '@mui/material/CircularProgress';
import LoadingPage from "./LoadingPage";


export default function ProtectedRoute({ children, adminOnly = false}){
  const { user, loading } = useAuth();
  const location = useLocation();
  console.log(user)

  if (loading) {
    return <LoadingPage />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  const isAdmin = user?.role?.toLowerCase() === 'admin';
 
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}