import React, { useContext, useEffect, useRef, useState } from 'react';
import assets from '../assets/assets';
import { formatMessageTime } from '../lib/utils';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const ChatContainer = () => {
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages, roomTyping } = useContext(ChatContext);
  const { authUser, onlineUsers, socket } = useContext(AuthContext);

  const scrollEnd = useRef();
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const getRoomId = (user1, user2) => [user1, user2].sort().join("_");

  const roomId =
  selectedUser && authUser
    ? getRoomId(authUser._id, selectedUser._id)
    : null;

const isTyping =
  roomId && roomTyping[roomId]?.includes(selectedUser._id);

  // Fetch AI suggestions for received messages
  const fetchSuggestions = async () => {
    if (!selectedUser) return;

    // Only generate suggestions for messages **received by me**
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.senderId === authUser._id) return;

    setLoadingSuggestions(true);
    try {
      const { data } = await axios.post('/api/messages/gen-suggestions', {
        senderId: lastMessage.senderId,  // last message sender
        receiverId: authUser._id
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      setSuggestions(data.suggestions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Call whenever messages update
  useEffect(() => {
    fetchSuggestions();
  }, [messages, selectedUser]);


  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    await sendMessage({ text: input.trim() });
    setInput('');
    setSuggestions([]);
  };

  const typingTimeoutRef = useRef(null);


// const handleTyping = () => {
//   if (!socket || !authUser || !selectedUser) return;

//   const roomId = getRoomId(authUser._id, selectedUser._id);

//   socket.emit("typing", { roomId, userId: authUser._id });

//   if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

//   typingTimeoutRef.current = setTimeout(() => {
//     socket.emit("stopTyping", { roomId, userId: authUser._id });
//   }, 800);
// };


// ChatContainer.jsx - Update handleTyping
const handleTyping = () => {
  if (!socket || !authUser || !selectedUser) return;

  const roomId = getRoomId(authUser._id, selectedUser._id);

  // ADD receiverId here!
  socket.emit("typing", { 
    roomId, 
    userId: authUser._id, 
    receiverId: selectedUser._id 
  });

  if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

  typingTimeoutRef.current = setTimeout(() => {
    socket.emit("stopTyping", { 
      roomId, 
      userId: authUser._id, 
      receiverId: selectedUser._id 
    });
  }, 800);
};

  // join room on chat selection
  useEffect(() => {
    if (!socket || !selectedUser) return;
    const roomId = getRoomId(authUser._id, selectedUser._id);
    socket.emit("joinRoom", { roomId });
  }, [selectedUser]);


  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) {
      toast.error("Select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result });
      e.target.value = '';
      setSuggestions([]);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (selectedUser) getMessages(selectedUser._id);
  }, [selectedUser]);

  useEffect(() => {
    if (scrollEnd.current && messages) scrollEnd.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return selectedUser ? (
    <div className='h-full overflow-scroll relative backdrop-blur-lg'>
      {/* Header */}
      <div className='flex items-center gap-3 py-3 mx-4 border-b border-stone-500'>
        <img src={selectedUser.profilePic || assets.avatar_icon} alt="" className='w-8 rounded-full' />
        <p className='flex-1 text-lg text-white flex items-center gap-2'>
          {/* {selectedUser.fullName} */}
          <div className="flex items-center gap-2">
            <span>{selectedUser.fullName}</span>
            {isTyping && (
              <span className="text-sm text-gray-400 ml-2"> typing...</span>
            )}
          </div>


          {onlineUsers.includes(selectedUser._id) && <span className='w-2 h-2 rounded-full bg-green-500'></span>}
        </p>
        <img onClick={() => setSelectedUser(null)} src={assets.arrow_icon} className='md:hidden max-w-7' alt="" />
        <img src={assets.help_icon} className='max-md:hidden max-w-5' alt="" />
      </div>

      {/* Chat area */}
      <div className='flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6'>
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-end gap-2 justify-end ${msg.senderId !== authUser._id && 'flex-row-reverse'}`}>
            {msg.image ? (
              <img src={msg.image} className='max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8' alt="" />
            ) : (
              <p className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all bg-violet-500/30 text-white ${msg.senderId === authUser._id ? 'rounded-br-none' : 'rounded-bl-none'}`}>
                {msg.text}
              </p>
            )}
            <div className='text-center text-xs'>
              <img src={msg.senderId === authUser._id ? authUser?.profilePic || assets.avatar_icon : selectedUser?.profilePic || assets.avatar_icon} className='w-7 rounded-full' alt="" />
              <p className='text-gray-500'>{formatMessageTime(msg.createdAt)}</p>
            </div>
          </div>
        ))}
        <div ref={scrollEnd}></div>

        {/* AI suggestions */}
        {suggestions.length > 0 && (
          <div className='flex justify-evenly mt-5 border-t border-t-white'>
            {suggestions.map((msg, index) => (
              <div key={index} onClick={() => { sendMessage({ text: msg }); setInput(''); setSuggestions([]); }}
                className='bg-blue-500 mt-2 text-white px-3 py-1 rounded-full text-sm hover:bg-blue-600 cursor-pointer'>
                {msg}
              </div>
            ))}
          </div>
        )}
        {loadingSuggestions && <p className="text-center text-gray-400 mt-2">Loading suggestions...</p>}
      </div>

      {/* Bottom input area */}
      <div className='absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3'>
        <div className='flex-1 flex items-center bg-gray-100/12 px-3 rounded-full'>
          <input onChange={(e) => { setInput(e.target.value); handleTyping() }} value={input} onKeyDown={(e) => e.key === "Enter" ? handleSendMessage(e) : null} type="text" placeholder='Send a message' className='flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400' />
          <input onChange={handleSendImage} type="file" id='image' accept='image/png, image/jpg' hidden />
          <label htmlFor="image">
            <img src={assets.gallery_icon} alt="" className='w-5 mr-2 cursor-pointer' />
          </label>
        </div>
        <img onClick={handleSendMessage} src={assets.send_button} alt="" className='w-7 cursor-pointer' />
      </div>
    </div>
  ) : (
    <div className='flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden'>
      <img src={assets.logo_icon} className='max-w-16' alt="" />
      <p className='text-lg font-medium text-white'>Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatContainer;
