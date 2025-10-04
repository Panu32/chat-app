import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reciverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    
    // Encrypted for recipient
    text: { type: String },
    image: { type: String },

    // Encrypted for sender (new)
    senderText: { type: String, default: "" },
    senderImage: { type: String, default: "" },

    seen: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
