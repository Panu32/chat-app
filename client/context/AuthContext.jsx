// context/AuthContext.jsx
import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContextObject.jsx";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import nacl from "tweetnacl";
import naclUtil from "tweetnacl-util";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

const LOCAL_KP_KEY = "userKeyPair_v1";

const loadOrCreateKeypair = () => {
    try {
        const saved = localStorage.getItem(LOCAL_KP_KEY);
        if (saved) {
            const obj = JSON.parse(saved);
            if (obj?.publicKey && obj?.secretKey) return obj;
        }
    } catch (e) {
        // ignore parse errors
    }
    const kp = nacl.box.keyPair();
    const obj = {
        publicKey: naclUtil.encodeBase64(kp.publicKey),
        secretKey: naclUtil.encodeBase64(kp.secretKey),
    };
    localStorage.setItem(LOCAL_KP_KEY, JSON.stringify(obj));
    return obj;
};

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [authUser, setAuthUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [userKeyPair] = useState(loadOrCreateKeypair);

    const uploadPublicKey = async (publicKey) => {
        if (!publicKey || !token) return;
        try {
            await axios.post("/api/messages/upload-key", { publicKey });
        } catch (err) {
            console.warn("uploadPublicKey failed:", err?.message || err);
        }
    };

    const connectSocket = (userData) => {
        if (!userData || socket?.connected) return;
        const newSocket = io(backendUrl, {
            query: {
                userId: userData._id,
            },
        });
        newSocket.connect();
        setSocket(newSocket);
        newSocket.on("getOnlineUsers", (userIds) => {
            setOnlineUsers(userIds);
        });
        newSocket.on("newMessage", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });
    };

    const checkAuth = async () => {
        try {
            const { data } = await axios.get("/api/auth/check");
            if (data.success) {
                setAuthUser(data.user);
                connectSocket(data.user);
                await uploadPublicKey(userKeyPair.publicKey);
            }
        } catch (error) {
            if (token) toast.error(error.message);
        }
    };

    const login = async (state, credentials) => {
        try {
            const payload = { ...credentials };
            if (state === "signup") {
                payload.publicKey = userKeyPair.publicKey;
            }
            const { data } = await axios.post(`/api/auth/${state}`, payload);
            if (data.success) {
                setAuthUser(data.userData);
                connectSocket(data.userData);
                axios.defaults.headers.common["token"] = data.token;
                setToken(data.token);
                localStorage.setItem("token", data.token);
                await uploadPublicKey(userKeyPair.publicKey);
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const logout = async () => {
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUsers([]);
        axios.defaults.headers.common["token"] = null;
        toast.success("Logged out Successfully");
        if (socket) socket.disconnect();
        setSocket(null);
        setMessages([]);
    };
    
    // FIX: Define the updateProfile function to make the API call.
    const updateProfile = async (profileData) => {
        try {
            const { data } = await axios.put("/api/auth/update-profile", profileData);
            if (data.success) {
                setAuthUser(data.user);
                toast.success("Profile updated successfully!");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["token"] = token;
            checkAuth();
        }
    }, [token]);

    



    const value = {
        axios,
        authUser,
        setAuthUser,
        onlineUsers,
        socket,
        login,
        logout,
        messages,
        setMessages,
        userKeyPair,
        updateProfile, // FIX: Add the updateProfile function to the context value.
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};