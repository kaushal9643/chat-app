import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";
import { GoogleGenAI } from "@google/genai";
import { saveMessageToRedis, getMessagesFromRedis } from '../utils/redisMessage.js';
import { redis } from '../redis.js';

// Get all users except the logged in user
export const getUsersForSidebar = async (req, res) => {
    try {
        const userId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: userId } }).select("-password")

        // Count number of messages not seen
        const unseenMessages = {};
        const promises = filteredUsers.map(async (user) => {
            const messages = await Message.find({ senderId: user._id, receiverId: userId, seen: false })
            if (messages.length > 0) {
                unseenMessages[user._id] = messages.length;
            }
        })
        await Promise.all(promises);
        res.json({ success: true, users: filteredUsers, unseenMessages });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Get all messages from selected user
export const getMessages = async (req, res) => {
    try {
        const { id: selectedUserId } = req.params;
        const myId = req.user._id;

        const roomId = [myId, selectedUserId].sort().join("_"); // consistent roomId

        // 1️⃣ Try Redis first
        let messages = await getMessagesFromRedis(roomId);

        if (messages.length === 0) {
            // 2️⃣ If Redis empty, fetch from MongoDB

            // messages = await Message.find({
            //     $or: [
            //         { senderId: myId, receiverId: selectedUserId },
            //         { senderId: selectedUserId, receiverId: myId },
            //     ]
            // }).sort({ createdAt: 1 }).limit(100);

            messages = await Message.find({ roomId })
                .sort({ createdAt: 1 })
                .limit(100);

            await redis.del(`chat:${roomId}`);
            // Optionally: save MongoDB messages to Redis
            for (let msg of messages) {
                await saveMessageToRedis(roomId, msg);
            }
        }

        await Message.updateMany({ senderId: selectedUserId, receiverId: myId }, { seen: true });

        res.json({ success: true, messages });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// api to mark message as seen using message id
export const markMessageAsSeen = async (req, res) => {
    try {
        const { id } = req.params;
        await Message.findByIdAndUpdate(id, { seen: true });
        res.json({ success: true });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Send message to selected user
export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;

        let imageUrl;

        if (image) {
            try {
                const uploadResponse = await cloudinary.uploader.upload(image);
                imageUrl = uploadResponse.secure_url;
            } catch (err) {
                console.log("Cloudinary upload failed:", err.message);
            }
        }
        const roomId = [senderId, receiverId].sort().join("_"); // consistent roomId

        const newMessage = await Message.create({
            senderId,
            receiverId,
            roomId,
            text,
            image: imageUrl
        })
        // 1️⃣ Save in Redis cache
        await saveMessageToRedis(roomId, newMessage);


        // Emit the new message to receiver's socket
        const receiverSocketId = userSocketMap[receiverId.toString()];
        // Always emit to the Room for active chat UI
        io.to(roomId).emit("newMessage", newMessage);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }
        res.json({ success: true, newMessage });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Generate AI reply suggestions
export const generateSuggestions = async (req, res) => {
    try {
        // 1. GET IDs FROM YOUR NEW FRONTEND PAYLOAD
        const chatPartnerId = req.body.senderId; // ID of the person who sent the last message
        const myId = req.user._id; // Get the logged-in user's ID securely from middleware

        // Security Check: Ensure the request isn't tampered with
        if (req.body.receiverId !== myId.toString()) {
            console.warn("Auth mismatch in generateSuggestions");
            // Even if it mismatches, we'll trust the secure req.user._id
        }

        if (!chatPartnerId) {
            return res.status(400).json({ message: "Missing 'senderId' in request body" });
        }

        console.log(`Generating suggestions for User ${myId} replying to ${chatPartnerId}`);

        // Initialize Gemini client
        const ai = new GoogleGenAI({});
        console.log("Gemini client initialized");

        // 2. FETCH MESSAGES FOR CONTEXT
        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: chatPartnerId },
                { senderId: chatPartnerId, receiverId: myId }
            ]
        })
            .sort({ createdAt: -1 }) // Get newest first
            .limit(5);

        console.log("Fetched messages:", messages.length);

        if (!messages.length) {
            return res.json({ suggestions: [] });
        }

        // 3. CREATE THE TARGETED PROMPT
        // We know the last message is from the partner because the frontend checked.
        const lastMessage = messages[0];
        const lastMessageText = lastMessage.text || "[Image]";

        // Create the conversation history for the prompt
        const conversationText = messages
            .map(m => `${m.senderId === myId ? 'Me' : 'Them'}: ${m.text || '[Image]'}`)
            .reverse() // Oldest to newest
            .join('\n');

        const prompt = `You are a chat assistant. A user needs help writing a quick reply.
    
    The last message they received was:
    "${lastMessageText}"
    
    Please generate exactly 3 short, casual replies to this last message.
    Output ONLY the 3 replies, separated by a comma.
    
    Example Output: How about tomorrow?,Sounds good,I'm not sure yet`;

        let suggestions = [];

        try {
            // 4. CALL GEMINI
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { maxOutputTokens: 300, temperature: 0.7 }
            });

            const suggestionsText = response.text || "";
            console.log("Gemini Suggestions Text:", suggestionsText);

            suggestions = suggestionsText
                .split(',')
                .map(s => s.trim())
                .filter(Boolean)
                .slice(0, 3);

            // Fallback if parsing fails but text exists
            if (suggestions.length === 0 && suggestionsText.length > 0) {
                suggestions = [suggestionsText.split('\n')[0].trim()];
            }

        } catch (aiError) {
            console.error("Gemini API error:", aiError?.message || aiError);
            suggestions = []; // Don't send fallback suggestions on API error
        }

        // Handle empty or failed suggestions
        if (suggestions.length === 0) {
            console.log("No suggestions generated.");
        }

        res.json({ suggestions });

    } catch (error) {
        console.error("generateSuggestions error:", error);
        res.status(500).json({
            suggestions: [], // Send empty array on server error
            message: 'Failed to generate suggestions',
            error: error.message
        });
    }
};
