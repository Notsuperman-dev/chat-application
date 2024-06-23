// ErrorPage.js
import React from 'react';
import { Link } from 'react-router-dom';

const ErrorPage = ({ errorCode }) => {
    let errorMessage = '';
    
    // Determine the error message based on the error code
    switch (errorCode) {
        case 404:
            errorMessage = 'Page not found';
            break;
        case 500:
            errorMessage = 'Internal server error';
            break;
        default:
            errorMessage = 'An unexpected error occurred';
            break;
    }

    return (
        <div className="error-page">
            <h2>Error {errorCode}</h2>
            <p>{errorMessage}</p>
            <Link to="/">Go to Home</Link>
        </div>
    );
};

export default ErrorPage;
