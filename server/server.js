import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";
import { redis } from "./redis.js";

// Create Express app and HTTP server

const app = express();
const server = http.createServer(app)

// Initialize socket.io server
export const io = new Server(server, {
    cors: { origin: "*" }
})

// Store online users
export const userSocketMap = {};    //{ userId: socketId }

// Socket.io connection handler
io.on("connection", async (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("User connected", userId);

    if (userId) {
        userSocketMap[userId] = socket.id;
    }

    // --- Redis Presence Logic ---
    const heartbeatInterval = setInterval(async () => {
        await redis.set(`user:online:${userId}`, "online");
        await redis.expire(`user:online:${userId}`, 60);
    }, 30000); // refresh every 30 seconds

    await redis.sadd("online_users", userId);

    const onlineUsers = await redis.smembers("online_users");

    // Broadcast presence + for UI highlight (green dot)
    io.emit("getOnlineUsers", onlineUsers);

    // Emit online users to all connected client
    // io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // join room
    socket.on("joinRoom", ({ roomId }) => {
        socket.join(roomId);
    });
    // --- Typing Indicator ---
    socket.on("typing", ({ roomId, userId }) => {
        // emit to everyone in the room except sender
        socket.to(roomId).emit("typing", { userId });
        // 2️⃣ Sidebar (global)
        socket.broadcast.emit("sidebarTyping", { userId });
    });

    socket.on("stopTyping", ({ roomId, userId }) => {
        socket.to(roomId).emit("stopTyping", { userId });
        socket.broadcast.emit("sidebarStopTyping", { userId });
    });

    socket.on("disconnect", async () => {
        clearInterval(heartbeatInterval); // stop heartbeat
        console.log("User Disconnected", userId);
        delete userSocketMap[userId];

        // Remove from presence set
        await redis.srem("online_users", userId);
        await redis.del(`user:online:${userId}`);
        const onlineUsers = await redis.smembers("online_users");
        io.emit("getOnlineUsers", onlineUsers);
    })
})

// Middlewares setup
app.use(express.json({ limit: "4mb" }))
app.use(cors())

// Routes setup
app.use("/api/status", (req, res) => res.send("Server is live"))
app.use("/api/auth", userRouter)
app.use("/api/messages", messageRouter);

// Connect to mongoDB
await connectDB();

if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log("Server is running on PORT: " + PORT))
}

// Export server for vercel
export default server;
