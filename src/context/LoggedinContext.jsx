import { useState, createContext } from "react";
import { getRoleFromToken } from "./RoleContext";

export const isLoggedInContext = createContext();

const LoggedinContext = (props) => {
  const [LoggedIn, setIsLoggedIn] = useState(() => getRoleFromToken() !== null);

  return (
    <isLoggedInContext.Provider value={[LoggedIn, setIsLoggedIn]}>
      {props.children}
    </isLoggedInContext.Provider>
  );
};

export default LoggedinContext;