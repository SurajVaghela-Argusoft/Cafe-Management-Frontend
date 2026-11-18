import { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { RoleContext } from '../../context/RoleContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const [role] = useContext(RoleContext);
  const location = useLocation();

  if (!role) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;