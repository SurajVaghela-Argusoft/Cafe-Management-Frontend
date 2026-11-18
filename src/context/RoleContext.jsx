import { createContext, useState } from "react";
import Cookies from 'js-cookie'

export const RoleContext = createContext();

export const getRoleFromToken = () => {
  try {
    // const token = localStorage.getItem("token");
    const token = Cookies.get("token");

    if (!token) return null;

    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));

    // if (payload.exp && payload.exp * 1000 < Date.now()) {
    //   localStorage.removeItem("token");
    //   return null;
    // }
    return payload.role ?? null;
  } catch {
    return null;                         
  }
};

export const RoleProvider = ({ children }) => {
  const [role, setRole] = useState(() => getRoleFromToken());

  return (
    <RoleContext.Provider value={[role, setRole]}>
      {children}
    </RoleContext.Provider>
  );
};