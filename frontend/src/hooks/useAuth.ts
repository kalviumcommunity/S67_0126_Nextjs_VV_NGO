import { useAuthContext } from "@/src/context/AuthContext";

export function useAuth() {
  const { user, login, logout } = useAuthContext();

  return {
    isAuthenticated: !!user,
    user,
    login,
    logout,
  };
}
