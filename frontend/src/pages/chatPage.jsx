import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import { useSelector } from "react-redux";
import Cookies from 'js-cookie';

// Initialize socket but don't connect until later in useEffect
let socket;

const ChatPage = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const { chatId } = useParams(); // Chat room ID from URL params
  const [isConnected, setIsConnected] = useState(false); // Track socket connection status

  useEffect(() => {
    // Connect to socket only after component mounts
    socket = io("https://real-estate-web-swart.vercel.app");

    if (chatId && currentUser) {
      // Emit setup event to join chat with userId
      socket.emit("setup", currentUser);

      // Join the chat room
      socket.emit("join chat", chatId);

      // Handle connection status
      socket.on("connected", () => {
        setIsConnected(true);
      });

      socket.on("disconnect", () => {
        setIsConnected(false);
      });

      // Listen for new messages
      socket.on("message received", (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      // Cleanup socket connection when component unmounts
      return () => {
        socket.emit("leave chat", chatId); // Optionally emit a leave event
        socket.off("message received");
        socket.disconnect(); // Ensure socket is disconnected on unmount
      };
    }
  }, [chatId, currentUser]);

  // Fetch existing chat messages on component mount
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = Cookies.get('token'); // Assumes you store the JWT in a cookie
        const res = await fetch(`https://real-estate-web-swart.vercel.app/api/message/${chatId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch messages");
        }

        const data = await res.json();
        setMessages(data || []);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    if (chatId) {
      fetchMessages();
    }
  }, [chatId]);

  // Send a new message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return; // Prevent empty messages

    const messageData = {
      chatId,
      senderId: currentUser._id,
      content: newMessage.trim(), // Trim whitespace
    };

    try {
      const token = Cookies.get('token');
      const res = await fetch(`https://real-estate-web-swart.vercel.app/api/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(messageData),
      });

      if (!res.ok) {
        throw new Error("Error sending message");
      }

      const data = await res.json();
      // Emit the new message via Socket.IO
      socket.emit("new message", data);
      setNewMessage(""); // Clear the input field
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Chat with Property Owner</h2>
        {isConnected ? <p>Connected</p> : <p>Connecting...</p>}
      </div>
      <div className="chat-messages">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`message ${msg.sender._id === currentUser._id ? "own-message" : ""}`}
            >
              <p>{msg.content}</p>
            </div>
          ))
        ) : (
          <p>No messages yet.</p>
        )}
      </div>
      <form onSubmit={sendMessage} className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ChatPage;
