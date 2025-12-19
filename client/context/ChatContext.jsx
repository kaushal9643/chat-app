import { createContext, useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "./AuthContext";
import { toast } from "react-hot-toast";
import axios from "axios";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { socket, authUser } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const [roomTyping, setRoomTyping] = useState({});
  const [sidebarTyping, setSidebarTyping] = useState([]);
  const processedMessages = useRef(new Set()); // 2. Create a "Memory" for message IDs

  /* ================= MASTER MESSAGE & SIDEBAR LISTENER ================= */
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      
      if (processedMessages.current.has(msg._id)) return;
      processedMessages.current.add(msg._id);

      if (processedMessages.current.size > 100) {
        const firstItem = processedMessages.current.values().next().value;
        processedMessages.current.delete(firstItem);
      }

      const currentRoomId = selectedUser
        ? [authUser._id, selectedUser._id].sort().join("_")
        : null;

      if (selectedUser && msg.roomId === currentRoomId) {
        setMessages(prev => [...prev, msg]);
        if (msg.senderId !== authUser._id) {
          axios.put(`/api/messages/mark/${msg._id}`);
        }
      } else {
      
        if (msg.receiverId === authUser._id) {
          setUnseenMessages(prev => ({
            ...prev,
            [msg.senderId]: (prev[msg.senderId] || 0) + 1
          }));
        }
      }
    };

    const handleSidebarTyping = ({ userId }) => {
      setSidebarTyping(prev => [...new Set([...prev, userId])]);
    };
    const handleSidebarStopTyping = ({ userId }) => {
      setSidebarTyping(prev => prev.filter(id => id !== userId));
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("sidebarTyping", handleSidebarTyping);
    socket.on("sidebarStopTyping", handleSidebarStopTyping);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("sidebarTyping", handleSidebarTyping);
      socket.off("sidebarStopTyping", handleSidebarStopTyping);
    };
  }, [socket, selectedUser, authUser]);

  /* ================= TYPING INDICATORS ================= */
  useEffect(() => {
    if (!socket) return;

    const handleTyping = ({ roomId, userId }) => {
      setRoomTyping(prev => ({
        ...prev,
        [roomId]: [...new Set([...(prev[roomId] || []), userId])]
      }));
    };
    const handleStopTyping = ({ roomId, userId }) => {
      setRoomTyping(prev => ({
        ...prev,
        [roomId]: (prev[roomId] || []).filter(id => id !== userId)
      }));
    };

    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [socket]);

  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(prev => ({ ...prev, ...data.unseenMessages }));
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getMessages = async (userId) => {
    try {
      setMessages([]);
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) setMessages(data.messages);

      setUnseenMessages(prev => {
        const copy = { ...prev };
        delete copy[userId];
        return copy;
      });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const sendMessage = async (messageData) => {
    try {
      await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        users,
        selectedUser,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages,
        getUsers,
        getMessages,
        sendMessage,
        roomTyping,
        sidebarTyping
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
