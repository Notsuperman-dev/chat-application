// src/tests/Profile.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Profile from '../components/Profile';

test('renders Profile component', () => {
    render(<Profile />);
    const linkElement = screen.getByText(/Update Profile/i);
    expect(linkElement).toBeInTheDocument();
});

test('handles form submission', () => {
    render(<Profile />);
    fireEvent.change(screen.getByPlaceholderText(/Nickname/i), { target: { value: 'New Nickname' } });
    fireEvent.click(screen.getByText(/Update Profile/i));
    // Add more assertions as needed
});
