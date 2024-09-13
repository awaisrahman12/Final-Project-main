import React, { useEffect, useState } from "react";
import { useSocket } from "../contexts/SocketProvider";

const ChatMessages = ({ listingId }) => {
    const [messages, setMessages] = useState([]);
    const { socket } = useSocket();

    useEffect(() => {
        const handleMessage = (newMessage) => {
            if (newMessage.listingId === listingId) {
                setMessages((prevMessages) => [...prevMessages, newMessage]);
            }
        };

        socket.on("receiveMessage", handleMessage);

        return () => {
            socket.off("receiveMessage", handleMessage);
        };
    }, [socket, listingId]);

    return (
        <div className="chat-messages">
            {messages.map((msg, index) => (
                <div key={index} className="chat-message">
                    <span className="chat-message-user">{msg.user}</span>: {msg.text}
                </div>
            ))}
        </div>
    );
};

export default ChatMessages;
