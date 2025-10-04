import jwt from 'jsonwebtoken';

// function to generate a token for a user 
export const generateToken = (userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET);
    return token;
};

// ✅ Add a secret key for encryption/decryption
const SECRET_KEY = process.env.CHAT_SECRET || "default-secret";

// ✅ Simple encryption (Base64 + key mixing)
export const encryptMessage = (text) => {
    try {
        const mixed = text.split('').reverse().join('') + SECRET_KEY;
        return btoa(mixed); // encode to base64
    } catch {
        return text;
    }
};

// ✅ Decryption (reverse of above)
export const decryptMessage = (cipher) => {
    try {
        const decoded = atob(cipher);
        const original = decoded.replace(SECRET_KEY, '').split('').reverse().join('');
        return original;
    } catch {
        return cipher; // fallback if already plain
    }
};
