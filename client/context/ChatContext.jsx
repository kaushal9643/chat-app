// // import { Children, createContext, useContext, useEffect, useState } from "react";
// // import { AuthContext } from "./AuthContext";
// // import { toast } from 'react-hot-toast';
// // import axios from 'axios'


// // export const ChatContext = createContext();

// // useEffect(() => {
// //   if (!socket) return;

// //   const handler = (newMessage) => {
// //     if (!selectedUser) {
// //       setUnseenMessages(prev => ({
// //         ...prev,
// //         [newMessage.senderId]:
// //           (prev[newMessage.senderId] || 0) + 1
// //       }));
// //       return;
// //     }

// //     const currentRoomId =
// //       [authUser._id, selectedUser._id].sort().join("_");

// //     if (newMessage.roomId === currentRoomId) {
// //       setMessages(prev => [...prev, newMessage]);
// //       axios.put(`/api/messages/mark/${newMessage._id}`);
// //     } else {
// //       setUnseenMessages(prev => ({
// //         ...prev,
// //         [newMessage.senderId]:
// //           (prev[newMessage.senderId] || 0) + 1
// //       }));
// //     }
// //   };

// //   socket.on("newMessage", handler);

// //   return () => socket.off("newMessage", handler);
// // }, [socket, selectedUser]);


// // export const ChatProvider = ({ children }) => {
// //     const [messages, setMessages] = useState([]);
// //     const [users, setUsers] = useState([]);
// //     const [selectedUser, setSelectedUser] = useState(null);
// //     const [unseenMessages, setUnseenMessages] = useState({})
// //     const { socket } = useContext(AuthContext);
// //     const [roomTyping, setRoomTyping] = useState({});
// //     const [sidebarTyping, setSidebarTyping] = useState([]);

// //     useEffect(() => {
// //         if (!socket) return;

// //         // CHAT CONTAINER (room-based)
// //         const handleTyping = ({ roomId, userId }) => {
// //             setRoomTyping(prev => ({
// //                 ...prev,
// //                 [roomId]: [...new Set([...(prev[roomId] || []), userId])]
// //             }));
// //         };

// //         const handleStopTyping = ({ roomId, userId }) => {
// //             setRoomTyping(prev => ({
// //                 ...prev,
// //                 [roomId]: (prev[roomId] || []).filter(id => id !== userId)
// //             }));
// //         };

// //         // SIDEBAR (user-based)
// //         const handleSidebarTyping = ({ userId }) => {
// //             setSidebarTyping(prev => [...new Set([...prev, userId])]);
// //         };

// //         const handleSidebarStopTyping = ({ userId }) => {
// //             setSidebarTyping(prev => prev.filter(id => id !== userId));
// //         };

// //         socket.on("typing", handleTyping);
// //         socket.on("stopTyping", handleStopTyping);

// //         socket.on("sidebarTyping", handleSidebarTyping);
// //         socket.on("sidebarStopTyping", handleSidebarStopTyping);

// //         return () => {
// //             socket.off("typing", handleTyping);
// //             socket.off("stopTyping", handleStopTyping);
// //             socket.off("sidebarTyping", handleSidebarTyping);
// //             socket.off("sidebarStopTyping", handleSidebarStopTyping);
// //         };
// //     }, [socket]);

// //     // Function to get all users for sidebar
// //     const getUsers = async () => {
// //         try {
// //             const { data } = await axios.get("/api/messages/users");
// //             if (data.success) {
// //                 setUsers(data.users);
// //                 setUnseenMessages(data.unseenMessages)
// //             }
// //         } catch (error) {
// //             toast.error(error.message)
// //         }
// //     }

// //     // Function to get messages for selected user
// //     const getMessages = async (userId) => {
// //         try {
// //             setMessages([]);
// //             const { data } = await axios.get(`/api/messages/${userId}`);
// //             if (data.success) {
// //                 setMessages(data.messages)
// //             }
// //         } catch (error) {
// //             toast.error(error.message)
// //         }
// //     }

// //     // Function to send message to selected user
// //     const sendMessage = async (messageData) => {
// //         try {
// //             const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);

// //             if (data.success) {
// //                 setMessages((prevMessages) => [...prevMessages, data.newMessage])
// //             } else {
// //                 toast.error(data.message);
// //             }
// //         } catch (error) {
// //             toast.error(error.message);
// //         }
// //     }

// //     // // Function to subscribe to messages for selected user
// //     // const subscribeToMessages = async () => {
// //     //     if (!socket) return;

// //     //     socket.on("newMessage", (newMessage) => {

// //     //         // if (selectedUser && newMessage.senderId === selectedUser._id) {
// //     //         //     newMessage.seen = true;
// //     //         //     setMessages((prevMessages)=>[...prevMessages, newMessage])
// //     //         //     axios.put(`/api/messages/mark/${newMessage._id}`)
// //     //         // }else{
// //     //         //     setUnseenMessages((prevUnseenMessages)=>({
// //     //         //         ...prevUnseenMessages, [newMessage.senderId] : prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId] + 1 : 1
// //     //         //     }))
// //     //         // }
// //     //         if (!selectedUser) return;

// //     //         const currentRoomId = [authUser._id, selectedUser._id].sort().join("_");

// //     //         if (newMessage.roomId === currentRoomId) {
// //     //             newMessage.seen = true;
// //     //             setMessages(prev => [...prev, newMessage]);
// //     //             axios.put(`/api/messages/mark/${newMessage._id}`);
// //     //         } else {
// //     //             setUnseenMessages(prev => ({
// //     //                 ...prev,
// //     //                 [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1
// //     //             }));
// //     //         }
// //     //     })
// //     // }

// //     // Function to unsubscribe from messages
// //     const unSubscribeFromMessages = () => {
// //         if (socket) {
// //             socket.off("newMessage");
// //         }
// //     }
// //     useEffect(() => {
// //         subscribeToMessages();
// //         return () => unSubscribeFromMessages();
// //     }, [socket, selectedUser])

// //     const value = {
// //         messages, users, selectedUser, getUsers, getMessages, sendMessage, setSelectedUser, unseenMessages, setUnseenMessages, roomTyping, sidebarTyping
// //     }

// //     return (
// //         <ChatContext.Provider value={value}>
// //             {children}
// //         </ChatContext.Provider>
// //     )
// // }





// import { createContext, useContext, useEffect, useState } from "react";
// import { AuthContext } from "./AuthContext";
// import { toast } from "react-hot-toast";
// import axios from "axios";

// export const ChatContext = createContext();

// export const ChatProvider = ({ children }) => {
//     const { socket, authUser } = useContext(AuthContext);

//     const [messages, setMessages] = useState([]);
//     const [users, setUsers] = useState([]);
//     const [selectedUser, setSelectedUser] = useState(null);
//     const [unseenMessages, setUnseenMessages] = useState({});
//     const [roomTyping, setRoomTyping] = useState({});
//     const [sidebarTyping, setSidebarTyping] = useState([]);

//     /* ================= SOCKET: NEW MESSAGE ================= */
//     useEffect(() => {
//         if (!socket) return;

//         const handler = (newMessage) => {
//   const currentRoomId = selectedUser
//     ? [authUser._id, selectedUser._id].sort().join("_")
//     : null;

//   if (!currentRoomId || newMessage.roomId !== currentRoomId) {
//     setUnseenMessages(prev => ({
//       ...prev,
//       [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1
//     }));
//   } else {
//     setMessages(prev => [...prev, newMessage]);
//     axios.put(`/api/messages/mark/${newMessage._id}`);
    
//     // Remove from unseen if it exists
//     setUnseenMessages(prev => {
//       const copy = { ...prev };
//       delete copy[newMessage.senderId];
//       return copy;
//     });
//   }
// };

//         socket.on("newMessage", handler);
//         return () => socket.off("newMessage", handler);

//     }, [socket, selectedUser, authUser]);

//     /* ================= SOCKET: TYPING ================= */
//     useEffect(() => {
//         if (!socket) return;

//         const handleTyping = ({ roomId, userId }) => {
//             setRoomTyping(prev => ({
//                 ...prev,
//                 [roomId]: [...new Set([...(prev[roomId] || []), userId])]
//             }));
//         };

//         const handleStopTyping = ({ roomId, userId }) => {
//             setRoomTyping(prev => ({
//                 ...prev,
//                 [roomId]: (prev[roomId] || []).filter(id => id !== userId)
//             }));
//         };

//         const handleSidebarTyping = ({ userId }) => {
//             setSidebarTyping(prev => [...new Set([...prev, userId])]);
//         };

//         const handleSidebarStopTyping = ({ userId }) => {
//             setSidebarTyping(prev => prev.filter(id => id !== userId));
//         };

//         socket.on("typing", handleTyping);
//         socket.on("stopTyping", handleStopTyping);
//         socket.on("sidebarTyping", handleSidebarTyping);
//         socket.on("sidebarStopTyping", handleSidebarStopTyping);

//         return () => {
//             socket.off("typing", handleTyping);
//             socket.off("stopTyping", handleStopTyping);
//             socket.off("sidebarTyping", handleSidebarTyping);
//             socket.off("sidebarStopTyping", handleSidebarStopTyping);
//         };
//     }, [socket]);

//     /* ================= API FUNCTIONS ================= */
//     const getUsers = async () => {
//         try {
//             const { data } = await axios.get("/api/messages/users");
//             if (data.success) {
//                 setUsers(data.users);
//                 setUnseenMessages(data.unseenMessages);
//             }
//         } catch (err) {
//             toast.error(err.message);
//         }
//     };

//     const getMessages = async (userId) => {
//         try {
//             setMessages([]);
//             const { data } = await axios.get(`/api/messages/${userId}`);
//             if (data.success) setMessages(data.messages);
//         } catch (err) {
//             toast.error(err.message);
//         }
//     };

//     const sendMessage = async (messageData) => {
//         try {
//             await axios.post(
//                 `/api/messages/send/${selectedUser._id}`,
//                 messageData
//             );
//             // ❗ DO NOT setMessages here
//             // socket will handle it
//         } catch (err) {
//             toast.error(err.message);
//         }
//     };

//     return (
//         <ChatContext.Provider
//             value={{
//                 messages,
//                 users,
//                 selectedUser,
//                 setSelectedUser,
//                 unseenMessages,
//                 setUnseenMessages,
//                 getUsers,
//                 getMessages,
//                 sendMessage,
//                 roomTyping,
//                 sidebarTyping
//             }}
//         >
//             {children}
//         </ChatContext.Provider>
//     );
// };









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

    // Inside your ChatProvider...

const handleNewMessage = (msg) => {
  // 3. THE GUARD: If we already handled this message ID, STOP here.
  if (processedMessages.current.has(msg._id)) return;
  processedMessages.current.add(msg._id);
  
  // Optional: Keep the memory small (last 100 IDs)
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
    // 4. Sidebar count logic: ONLY if I am the receiver
    if (msg.receiverId === authUser._id) {
      setUnseenMessages(prev => ({
        ...prev,
        [msg.senderId]: (prev[msg.senderId] || 0) + 1
      }));
    }
  }
};

    // Keep your sidebar typing listeners here too
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

  /* ================= API FUNCTIONS ================= */
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
      // ❗ socket handles adding message
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
