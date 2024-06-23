// src/components/LandingPage.js
import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div>
            <h1>Welcome to Anonymous Chat</h1>
            <p>Chat with anyone, anytime, anonymously!</p>
            <Link to="/register">
                <button>Join the fun</button>
            </Link>
            <Link to="/login">
                <button>Login</button>
            </Link>
        </div>
    );
};

export default LandingPage;
