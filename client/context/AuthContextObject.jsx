// context/AuthContextObject.jsx
import { createContext } from "react";

export const AuthContext = createContext({
  authUser: null,
  setAuthUser: () => {},
  socket: null,
  axios: null,
  onlineUsers: [],
  messages: [],
  setMessages: () => {},
  logout: () => {},
  updateProfile: async (data) => {}, 
});