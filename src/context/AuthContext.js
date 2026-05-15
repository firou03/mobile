import { createContext } from "react";

export const AuthContext = createContext({
  token: null,
  user: null,
  isRestoring: true,
  signIn: async () => {},
  signOut: async () => {},
});
