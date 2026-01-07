# 💬 Real-Time Chat App (MERN + Socket.IO)

A full-stack **Real-Time Chat Application** built with the **MERN stack** (MongoDB, Express.js, React.js, Node.js) and **Socket.IO** for live messaging. This application supports user authentication, real-time bi-directional conversations, online presence indicators, and intuitive chat UI.

---

## 🚀 Project Overview

This Chat App enables users to:

- Register and log in securely
- End To End Encryption of Messages
- Send and receive real-time messages
- Receive live typing and online status notifications
- Persist chat history in a database

It leverages WebSockets to deliver a seamless live chat experience. The backend handles API endpoints, authentication, and WebSocket events, while the frontend manages UI rendering and socket communication.

---

## ✨ Key Features

### 🧑‍💻 User Features
- User registration and login system
- Persistent chat history
- Real-time messaging with instant delivery
- Typing indicators
- Online/offline user presence
- Responsive UI



---

## 🛠️ Tech Stack

**Frontend**
- React.js  
- React Router  
- Socket.IO client  
- CSS / Tailwind (optional)

**Backend**
- Node.js  
- Express.js  
- Socket.IO server  
- JWT Authentication

**Database**
- MongoDB (via Mongoose)

---

## 🧠 How It Works (Architecture)
The application follows a real-time, event-driven architecture:

- The **frontend** establishes a Socket.IO connection after authentication.
- The **backend** manages WebSocket connections, rooms, and message routing.
- Messages are **encrypted on the client** and **decrypted only on the recipient’s client** (E2EE).
- MongoDB is used only to store encrypted message payloads.

This ensures scalability, low latency, and strong privacy guarantees.

---

## 🔐 Authentication Flow

1. User registers or logs in using email and password.
2. Backend verifies credentials and issues a **JWT token**.
3. JWT is stored securely on the client.
4. Client sends JWT when connecting to Socket.IO.
5. Backend validates JWT before allowing socket access.

---

## 🔒 End-to-End Encryption (E2EE)

This chat application supports **End-to-End Encryption** using the **`tweetnacl` cryptography library**.

### What E2EE Means
- Messages are encrypted **before leaving the sender’s device**
- Messages are decrypted **only on the receiver’s device**
- The server **cannot read message contents**

---

## 🧩 Encryption Library

- **tweetnacl**
- Uses modern cryptographic primitives
- Fast, secure, and browser-compatible

---

## 🔑 Key Management (Conceptual)

- Each user generates a **public/private key pair** on the client
- Public keys are shared via the server
- Private keys never leave the client
- Messages are encrypted using the recipient’s public key

---

## 🔐 Encrypted Messaging Flow

1. Sender types a message
2. Message is encrypted using `tweetnacl`
3. Encrypted message is sent via Socket.IO
4. Server relays encrypted payload
5. Recipient decrypts message locally
6. Plaintext is displayed in UI

---

## 📡 Real-Time Socket Events

| Event | Direction | Description |
|------|----------|-------------|
| `connect` | client → server | Establish socket connection |
| `joinRoom` | client → server | Join a chat room |
| `encryptedMessage` | client ↔ server | Send/receive encrypted message |
| `typing` | client ↔ server | Typing indicator |
| `disconnect` | server → client | Handle user disconnect |

---

## 📦 Message Storage

- Messages are stored **only in encrypted form**
- Database never stores plaintext
- Improves privacy and security compliance

Example stored message:
```json
{
  "senderId": "abc123",
  "roomId": "room01",
  "ciphertext": "X9k3sA9F1...",
  "timestamp": "2026-01-07T12:00:00Z"
}
```
### ⚙️ Setup & Installation
Backend Setup
cd server
npm install

Create a .env file:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret


Start backend server:

npm start

Frontend Setup
cd client
npm install
npm start

### 🚨 Error Handling & Edge Cases

Invalid or expired JWT tokens

Socket disconnections and reconnections

Missing encryption keys

Failed message decryption

Empty or oversized messages

### 🤖 Future AI Integrations (Conceptual)
1️⃣ AI Smart Reply (Client-Side Only)

Generates reply suggestions without breaking E2EE

Operates only on decrypted local messages

2️⃣ AI Sentiment Detection

Analyzes tone of messages locally

Displays sentiment indicators (optional)

3️⃣ AI Spam Detection

Flags suspicious patterns

Never sends plaintext to server

⚖️ Security & Privacy Considerations

End-to-End Encryption enabled by default

No server-side message inspection

JWT-based access control

HTTPS and secure WebSocket usage recommended

No plaintext logging

### 🚀 Future Improvements

One-to-one private chats

Group chat encryption

File and image sharing (encrypted)

Push notifications

Cloud deployment (Render / Vercel)

Key rotation and recovery


