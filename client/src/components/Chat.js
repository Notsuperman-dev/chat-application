// src/Chat.js
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const Chat = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        socket.on('message', (message) => {
            setMessages((messages) => [...messages, message]);
        });

        return () => {
            socket.off('message');
        };
    }, []);

    const sendMessage = (e) => {
        e.preventDefault();
        socket.emit('message', message);
        setMessage('');
    };

    return (
        <div>
            <div>
                {messages.map((msg, index) => (
                    <div key={index}>{msg}</div>
                ))}
            </div>
            <form onSubmit={sendMessage}>
                <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message" />
                <button type="submit">Send</button>
            </form>
        </div>
    );
};

export default Chat;
