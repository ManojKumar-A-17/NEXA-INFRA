import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Messages = () => {
  const { user, role } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role === "contractor") {
    return <Navigate to="/contractor/chat" replace />;
  }

  if (role === "super_admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/user/chat" replace />;
};

export default Messages;
