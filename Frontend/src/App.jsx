import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import axios from 'axios';

const App = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [originalUrl, setOriginalUrl] = useState('');
    const [shortUrl, setShortUrl] = useState('');
    const [userUrls, setUserUrls] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const API_URL = 'http://192.168.31.101:5000'; // Ensure the backend is running on port 5000

    const handleSignup = async () => {
        try {
            await axios.post(`${API_URL}/signup`, { username, password });
            alert('Signup successful');
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || 'Signup failed');
        }
    };

    const handleSignin = async () => {
        try {
            await axios.post(`${API_URL}/signin`, { username, password });
            setIsLoggedIn(true);
            fetchUrls();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || 'Signin failed');
        }
    };

    const handleShorten = async () => {
        try {
            const response = await axios.post(`${API_URL}/shorten`, { username, originalUrl });
            setShortUrl(response.data.shortUrl);
            fetchUrls();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || 'Failed to shorten URL');
        }
    };

    const fetchUrls = async () => {
        try {
            const response = await axios.get(`${API_URL}/urls/${username}`);
            setUserUrls(Object.entries(response.data));
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || 'Failed to fetch URLs');
        }
    };

    return (
        <Router>
            <div className="min-h-screen bg-gradient-to-r from-cyan-50 to-blue-100 flex items-center justify-center">
                <div className="container mx-auto max-w-md bg-white shadow-md rounded-lg p-6 space-y-6">
                    <Routes>
                        <Route path="/" element={
                            !isLoggedIn ? (
                                <div className="space-y-4">
                                    <h1 className="text-3xl font-bold text-blue-700 text-center">Welcome to URL Shortener</h1>
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            handleSignin();
                                        }}
                                    >
                                        <input
                                            type="text"
                                            placeholder="Username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="password"
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            type="submit"
                                            className="w-full bg-blue-500 text-white font-semibold py-2 rounded-lg hover:bg-blue-600 transition"
                                        >
                                            Signin
                                        </button>
                                    </form>
                                    <p className="text-center text-sm">
                                        Don't have an account?{' '}
                                        <Link to="/signup" className="text-blue-600 underline">
                                            Signup
                                        </Link>
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-bold text-blue-700 text-center">Welcome, {username}</h2>
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            handleShorten();
                                        }}
                                    >
                                        <input
                                            type="text"
                                            placeholder="Enter URL to shorten"
                                            value={originalUrl}
                                            onChange={(e) => setOriginalUrl(e.target.value)}
                                            className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            type="submit"
                                            className="w-full bg-blue-500 text-white font-semibold py-2 rounded-lg hover:bg-blue-600 transition"
                                        >
                                            Shorten URL
                                        </button>
                                    </form>
                                    {shortUrl && (
                                        <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-md">
                                            <p className="text-sm text-blue-700">Shortened URL:</p>
                                            <a
                                                href={shortUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 underline break-words"
                                            >
                                                {shortUrl}
                                            </a>
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="text-xl font-bold text-blue-700">Your URLs:</h3>
                                        <ul className="space-y-2 mt-2">
                                            {userUrls.map(([id, url]) => (
                                                <li
                                                    key={id}
                                                    className="p-2 bg-gray-100 rounded-lg shadow-sm flex justify-between items-center"
                                                >
                                                    <a
                                                        href={`http://192.168.31.101:5000/${id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 underline break-all"
                                                    >
                                                        {`http://192.168.31.101/${id}`}
                                                    </a>
                                                    <span className="text-gray-500 text-sm truncate">{url}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )
                        } />
                        <Route path="/signup" element={
                            <div className="space-y-4">
                                <h1 className="text-3xl font-bold text-blue-700 text-center">Signup</h1>
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSignup();
                                    }}
                                >
                                    <input
                                        type="text"
                                        placeholder="Username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="submit"
                                        className="w-full bg-green-500 text-white font-semibold py-2 rounded-lg hover:bg-green-600 transition"
                                    >
                                        Signup
                                    </button>
                                </form>
                                <p className="text-center text-sm">
                                    Already have an account?{' '}
                                    <Link to="/" className="text-blue-600 underline">
                                        Signin
                                    </Link>
                                </p>
                            </div>
                        } />
                    </Routes>
                </div>
            </div>
        </Router>
    );
};

export default App;

