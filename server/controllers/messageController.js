// controllers/messageController.js
import Message from "../models/Message.js";
import User from "../models/User.js";
import { io, userSocketMap } from "../server.js";
import cloudinary from "../lib/cloudinary.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;
    // include publicKey in select
    const filteredUsers = await User.find({ _id: { $ne: userId } }).select("-password");
    const unseenMessages = {};

    const promises = filteredUsers.map(async (user) => {
      const messages = await Message.find({
        senderId: user._id,
        reciverId: userId,
        seen: false,
      });
      if (messages.length > 0) unseenMessages[user._id] = messages.length;
    });

    await Promise.all(promises);

    // filteredUsers already have publicKey field (if stored)
    res.json({ success: true, users: filteredUsers, unseenMessages });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};


export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, reciverId: selectedUserId },
        { senderId: selectedUserId, reciverId: myId },
      ],
    });

    await Message.updateMany(
      { senderId: selectedUserId, reciverId: myId },
      { seen: true }
    );

    res.json({ success: true, messages });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const markMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    await Message.findByIdAndUpdate(id, { seen: true });
    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    // text and image are expected to already be encrypted strings (nonce:ciphertext)
    const { text, image } = req.body;
    const reciverId = req.params.id;
    const senderId = req.user._id;

    let imageUrl = image;

    // if image is an encrypted dataURL or encrypted text, we simply store it as-is
    // NOTE: We do not decrypt; server stores ciphertexts only.
    const newMessage = await Message.create({
      senderId,
      reciverId,
      text,
      image: imageUrl,
    });

    const reciverSocketId = userSocketMap[reciverId];
    if (reciverSocketId) {
      io.to(reciverSocketId).emit("newMessage", newMessage); // forward encrypted message
    }
    res.json({ success: true, newMessage });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// New handler: upload the user's public key (so others can use it)
export const uploadPublicKey = async (req, res) => {
  try {
    const { publicKey } = req.body;
    if (!publicKey) return res.json({ success: false, message: "No publicKey provided" });

    const userId = req.user._id;
    const user = await User.findByIdAndUpdate(userId, { publicKey }, { new: true }).select("-password");
    if (!user) return res.json({ success: false, message: "User not found" });
    res.json({ success: true, message: "Public key saved" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
