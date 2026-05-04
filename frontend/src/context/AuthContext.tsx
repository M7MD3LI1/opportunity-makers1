import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "../types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  mustChangePassword: boolean;
  login: (token: string, user: User, mustChange?: boolean) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try { return JSON.parse(savedUser); } catch { return null; }
    }
    return null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [mustChangePassword, setMustChangePassword] = useState(() => localStorage.getItem("mustChangePassword") === "true");

  useEffect(() => {
    // Sync logic if needed, but synchronous init is preferred
  }, []);

  const login = (newToken: string, newUser: User, mustChange = false) => {
    setToken(newToken);
    setUser(newUser);
    setMustChangePassword(mustChange);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    localStorage.setItem("mustChangePassword", String(mustChange));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setMustChangePassword(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("mustChangePassword");
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{
      user, token, mustChangePassword,
      login, logout, updateUser,
      isAuthenticated: !!token,
      isAdmin: user?.role === "ADMIN",
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
