import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const socket = io('http://localhost:5000');

const ChatRoom = ({ match }) => {
    const { room } = match.params;
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [typing, setTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState([]);
    const [privateMessage, setPrivateMessage] = useState('');
    const [receiver, setReceiver] = useState('');

    useEffect(() => {
        socket.emit('joinRoom', { username: 'Anonymous', room });

        socket.on('roomData', ({ users }) => {
            setUsers(users);
        });

        socket.on('message', (message) => {
            setMessages((msgs) => [...msgs, message]);
            toast.info(`New message from ${message.user}`);
        });

        socket.on('typing', ({ user }) => {
            setTypingUsers((users) => [...users, user]);
        });

        socket.on('stopTyping', ({ user }) => {
            setTypingUsers((users) => users.filter(u => u !== user));
        });

        return () => {
            socket.emit('disconnect');
            socket.off();
        };
    }, [room]);

    const handleTyping = () => {
        if (!typing) {
            setTyping(true);
            socket.emit('typing', { user: 'Anonymous', room });
        }
        setTimeout(() => {
            setTyping(false);
            socket.emit('stopTyping', { user: 'Anonymous', room });
        }, 3000);
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (message) {
            socket.emit('sendMessage', { message, room });
            setMessage('');
        }
    };

    const sendPrivateMessage = (e) => {
        e.preventDefault();
        if (privateMessage && receiver) {
            socket.emit('privateMessage', { sender: 'Anonymous', receiver, message: privateMessage });
            setPrivateMessage('');
        }
    };

    return (
        <div>
            <div>
                <h2>Room: {room}</h2>
                <div>
                    {users.map((user, index) => (
                        <div key={index}>{user}</div>
                    ))}
                </div>
            </div>
            <div>
                <div>
                    {messages.map((msg, index) => (
                        <div key={index}>{msg.user}: {msg.text}</div>
                    ))}
                </div>
                <div>
                    {typingUsers.map((user, index) => (
                        <div key={index}>{user} is typing...</div>
                    ))}
                </div>
                <form onSubmit={sendMessage}>
                    <input
                        value={message}
                        onChange={(e) => {
                            setMessage(e.target.value);
                            handleTyping();
                        }}
                        placeholder="Type a message..."
                        required
                    />
                    <button type="submit">Send</button>
                </form>
            </div>
            <div>
                <form onSubmit={sendPrivateMessage}>
                    <input
                        value={receiver}
                        onChange={(e) => setReceiver(e.target.value)}
                        placeholder="Receiver"
                        required
                    />
                    <input
                        value={privateMessage}
                        onChange={(e) => setPrivateMessage(e.target.value)}
                        placeholder="Private message"
                        required
                    />
                    <button type="submit">Send Private Message</button>
                </form>
            </div>
            <ToastContainer />
        </div>
    );
};

export default ChatRoom;
