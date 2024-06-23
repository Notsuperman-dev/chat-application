import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const MainMenu = () => {
    const [profile, setProfile] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [newRoom, setNewRoom] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                return;
            }
            try {
                const response = await axios.get('http://localhost:5000/api/profile', {
                    headers: {
                        'Authorization': token,
                    },
                });
                setProfile(response.data);
            } catch (error) {
                console.error('Failed to fetch profile', error);
            }
        };

        fetchProfile();
    }, []);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/rooms');
                setRooms(response.data);
            } catch (error) {
                console.error('Failed to fetch rooms', error);
            }
        };

        fetchRooms();
    }, []);

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/rooms', { roomName: newRoom });
            setRooms([...rooms, response.data]);
            setNewRoom('');
        } catch (error) {
            console.error('Room creation failed', error);
        }
    };

    return (
        <div>
            <h1>Main Menu</h1>
            <Link to="/chat">
                <button>World Chat</button>
            </Link>
            <Link to="/private-rooms">
                <button>Private Rooms</button>
            </Link>
            <Link to="/trending-rooms">
                <button>Trending Rooms</button>
            </Link>
            {profile ? (
                <div>
                    <h2>Welcome, {profile.username}</h2>
                    <p>Nickname: {profile.nickname}</p>
                    <img src={profile.avatar} alt="Avatar" width="100" />
                    <p>Your ID: {profile.id}</p>
                    <Link to="/profile">Update Profile</Link>
                </div>
            ) : (
                <p>Loading profile...</p>
            )}
            <div>
                <h2>Chat Rooms</h2>
                <ul>
                    {rooms.map((room) => (
                        <li key={room.id}>{room.name}</li>
                    ))}
                </ul>
                <form onSubmit={handleCreateRoom}>
                    <input
                        value={newRoom}
                        onChange={(e) => setNewRoom(e.target.value)}
                        placeholder="New Room"
                        required
                    />
                    <button type="submit">Create Room</button>
                </form>
            </div>
        </div>
    );
};

export default MainMenu;
