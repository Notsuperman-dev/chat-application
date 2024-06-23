import React, { useState } from 'react';

const Home = ({ messages, sendMessage }) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() !== '') {
      sendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <div>
      <h2>World Chat</h2>
      <div className="chat-container">
        {messages.map((message, index) => (
          <div key={index} className="message">
            <strong>{message.username}: </strong>
            {message.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Home;
