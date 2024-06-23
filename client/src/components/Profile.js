import React, { useState } from 'react';
import axios from 'axios';

const Profile = () => {
    const [nickname, setNickname] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('nickname', nickname);
        formData.append('avatar', avatar);

        try {
            const response = await axios.post('http://localhost:5000/api/updateProfile', formData, {
                headers: {
                    'Authorization': token,
                    'Content-Type': 'multipart/form-data',
                }
            });
            alert('Profile updated');
            setAvatarPreview(response.data.avatar);
        } catch (error) {
            console.error('Profile update failed', error);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        setAvatar(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    return (
        <div>
            <h2>Update Profile</h2>
            <form onSubmit={handleUpdateProfile}>
                <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Nickname"
                    required
                />
                <input
                    type="file"
                    onChange={handleAvatarChange}
                    placeholder="Avatar"
                    required
                />
                <button type="submit">Update Profile</button>
            </form>
            {avatarPreview && <img src={avatarPreview} alt="Avatar" width="100" />}
        </div>
    );
};

export default Profile;
