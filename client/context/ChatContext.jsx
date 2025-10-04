// context/ChatContext.jsx

import { useContext, useState, useEffect, createContext } from "react";
import { AuthContext } from "./AuthContextObject";
import toast from "react-hot-toast";
import nacl from "tweetnacl";
import naclUtil from "tweetnacl-util";

export const ChatContext = createContext();

const b64ToUint8 = (b64) => naclUtil.decodeBase64(b64);
const uint8ToB64 = (u8) => naclUtil.encodeBase64(u8);
const textToUint8 = (text) => naclUtil.decodeUTF8(text);
const uint8ToText = (u8) => naclUtil.encodeUTF8(u8);

// Pack encrypted output as nonce + ":" + ciphertext (both base64)
const pack = (nonceU8, cipherU8) => `${uint8ToB64(nonceU8)}:${uint8ToB64(cipherU8)}`;

const unpack = (packed) => {
  if (!packed || typeof packed !== "string") return null;
  const [n, c] = packed.split(":");
  if (!n || !c) return null;
  return { nonce: b64ToUint8(n), cipher: b64ToUint8(c) };
};

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const { socket, axios, authUser, userKeyPair } = useContext(AuthContext) || {};

  // helper to encrypt a string for recipientPublicKey (base64) using our secretKey (base64)
  const encryptFor = (plainString, recipientPublicKeyB64, mySecretKeyB64) => {
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const messageUint8 = textToUint8(plainString);
    const recipientPub = b64ToUint8(recipientPublicKeyB64);
    const mySecret = b64ToUint8(mySecretKeyB64);
    const ciphertext = nacl.box(messageUint8, nonce, recipientPub, mySecret);
    return pack(nonce, ciphertext);
  };

  // decrypt helper; returns plaintext string or null
  const decryptFrom = (packedCiphertext, senderPublicKeyB64, mySecretKeyB64) => {
    if (!packedCiphertext) return null;
    const parts = unpack(packedCiphertext);
    if (!parts) return null;
    const senderPub = b64ToUint8(senderPublicKeyB64);
    const mySecret = b64ToUint8(mySecretKeyB64);
    const opened = nacl.box.open(parts.cipher, parts.nonce, senderPub, mySecret);
    if (!opened) return null;
    return uint8ToText(opened);
  };

  // fetch users (should include their publicKey if uploaded)
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages);
        return data.users;
      }
      return [];
    } catch (error) {
      toast.error(error.message);
      return [];
    }
  };

  // fetch messages and decrypt them
  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        const result = (data.messages || []).map((m) => {
          // FIX: For any message in this conversation, the other party is always the 'selectedUser'.
          // We use THEIR public key and OUR secret key for decryption, regardless of who sent the message.
          const otherPartyPublicKey = selectedUser?.publicKey;
          
          const decryptedText = m.text && otherPartyPublicKey && userKeyPair?.secretKey
              ? decryptFrom(m.text, otherPartyPublicKey, userKeyPair.secretKey)
              : null;
          
          const decryptedImage = m.image && otherPartyPublicKey && userKeyPair?.secretKey
              ? decryptFrom(m.image, otherPartyPublicKey, userKeyPair.secretKey)
              : null;
          
          return {
              ...m,
              text: decryptedText ?? m.text,
              image: decryptedImage ?? m.image,
          };
        });
        setMessages(result);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // sendMessage: encrypt using selectedUser.publicKey
  const sendMessage = async (messageData) => {
    if (!selectedUser) return;
    if (!userKeyPair?.secretKey) {
      toast.error("No local key pair found.");
      return;
    }
    let recipientPub = selectedUser.publicKey;
    if (!recipientPub) {
      const refreshed = await getUsers();
      const refreshedRecipient = refreshed.find((u) => u._id?.toString() === selectedUser._id?.toString());
      recipientPub = refreshedRecipient?.publicKey;
      if (recipientPub) {
        setSelectedUser((prev) => (prev ? { ...prev, publicKey: recipientPub } : prev));
      }
    }
    if (!recipientPub) {
      toast.error("Selected user has no public key available.");
      return;
    }
    try {
      const payload = {};
      if (messageData.text) {
        payload.text = encryptFor(messageData.text, recipientPub, userKeyPair.secretKey);
      }
      if (messageData.image) {
        payload.image = encryptFor(messageData.image, recipientPub, userKeyPair.secretKey);
      }
      const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, payload);
      if (data.success) {
        const stored = data.newMessage;
        const decryptedText = stored.text
          ? decryptFrom(stored.text, recipientPub, userKeyPair.secretKey)
          : null;
        const decryptedImage = stored.image
          ? decryptFrom(stored.image, recipientPub, userKeyPair.secretKey)
          : null;
        const shown = {
          ...stored,
          text: decryptedText ?? stored.text,
          image: decryptedImage ?? stored.image,
        };
        setMessages((prev) => [...prev, shown]);
        socket?.emit("sendMessage", stored);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = (newMessage) => {
      const senderId = (newMessage?.senderId || "").toString();
      const selectedId = (selectedUser?._id || "").toString();
      if (selectedUser && senderId === selectedId) {
        const senderUser = users.find((u) => u._id?.toString() === senderId);
        const senderPublicKey = senderUser?.publicKey || newMessage.senderPublicKey || null;
        const decryptedText = newMessage.text && senderPublicKey && userKeyPair?.secretKey
          ? decryptFrom(newMessage.text, senderPublicKey, userKeyPair.secretKey)
          : null;
        const decryptedImage = newMessage.image && senderPublicKey && userKeyPair?.secretKey
          ? decryptFrom(newMessage.image, senderPublicKey, userKeyPair.secretKey)
          : null;
        const shown = {
          ...newMessage,
          text: decryptedText ?? newMessage.text,
          image: decryptedImage ?? newMessage.image,
        };
        shown.seen = true;
        setMessages((prev) => [...prev, shown]);
        axios.put(`/api/messages/mark/${newMessage._id}`).catch(() => {});
      } else {
        setUnseenMessages((prev) => {
          const prevCount = prev[senderId] || 0;
          return {
            ...prev,
            [senderId]: prevCount + 1,
          };
        });
      }
    };
    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, selectedUser, users, userKeyPair, axios]);

  useEffect(() => {
    if (selectedUser) {
      getUsers().then(() => getMessages(selectedUser._id));
    }
  }, [selectedUser]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        users,
        selectedUser,
        setSelectedUser,
        getUsers,
        getMessages,
        sendMessage,
        unseenMessages,
        setUnseenMessages,
        setMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};