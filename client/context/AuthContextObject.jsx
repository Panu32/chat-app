import { createContext, useState, useEffect } from "react";
import { io } from "socket.io-client";

export const AuthContext = createContext({
  authUser: null,
  socket: null,
  axios: null,
  onlineUsers: [],
  messages: [],               // ✅ added to store global messages if needed
  setMessages: () => {},
  logout: () => {},
  setAuthUser: () => {},
});

export const AuthProvider = ({ children, axiosInstance }) => {
  const [authUser, setAuthUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messages, setMessages] = useState([]); // ✅

  useEffect(() => {
    if (!import.meta.env.VITE_BACKEND_URL) return;
    if (!authUser) return; // ✅ wait until user is logged in

    const s = io(import.meta.env.VITE_BACKEND_URL, {
      autoConnect: true,
      auth: { token: authUser?.token }, // ✅ send token
    });
    setSocket(s);

    // ✅ Handle online users updates
    s.on("onlineUsers", (users) => setOnlineUsers(users));

    // ✅ Listen for new messages globally
    s.on("newMessage", (msg) => {
      // Append to global messages list (optional)
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      s.off("onlineUsers");
      s.off("newMessage");
      s.disconnect();
    };
  }, [authUser]);

  const logout = () => {
    setAuthUser(null);
    socket?.disconnect();
    setSocket(null);
    setOnlineUsers([]);
    setMessages([]);
  };

  return (
    <AuthContext.Provider
      value={{
        authUser,
        setAuthUser,
        socket,
        axios: axiosInstance,
        onlineUsers,
        messages,      // ✅ exposed
        setMessages,   // ✅ exposed
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
