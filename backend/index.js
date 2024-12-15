const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import CORS middleware
const fs = require('fs-extra');
const path = require('path');

const app = express();
const IP = '192.168.31.101'; // Replace with your specific IP address
const PORT = 5000;

const dataDir = path.join(__dirname, 'data'); // Directory for user data
const usersIndexPath = path.join(dataDir, 'users.json'); // Index file for user data

// Ensure data directory exists
fs.ensureDirSync(dataDir);

// Middleware
const corsOptions = {
    origin: 'http://192.168.31.101:5173', // Frontend URL
    credentials: true // Allow credentials in requests
};

app.use(bodyParser.json());
app.use(cors(corsOptions)); // Enable CORS for all routes

// Helper Functions

// Read user index
const readUserIndex = async () => {
    try {
        return await fs.readJson(usersIndexPath);
    } catch {
        return {}; // Return empty object if file doesn't exist
    }
};

// Write user index
const writeUserIndex = async (index) => {
    await fs.writeJson(usersIndexPath, index, { spaces: 2 });
};

// Get user data file path
const getUserFilePath = (username) => path.join(dataDir, `${username}.json`);

// Read user data
const readUserData = async (username) => {
    const filePath = getUserFilePath(username);
    try {
        return await fs.readJson(filePath);
    } catch {
        return null; // Return null if user file doesn't exist
    }
};

// Write user data
const writeUserData = async (username, data) => {
    const filePath = getUserFilePath(username);
    await fs.writeJson(filePath, data, { spaces: 2 });
};

// API Endpoints

// Signup Route
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const userIndex = await readUserIndex();

    if (userIndex[username]) {
        return res.status(400).json({ error: 'Username already exists' });
    }

    // Create user data
    userIndex[username] = true; // Add user to index
    await writeUserIndex(userIndex);

    const userData = { username, password, urls: {} }; // Initialize user data
    await writeUserData(username, userData);

    res.json({ message: 'Signup successful' });
});

// Signin Route
app.post('/signin', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const userData = await readUserData(username);

    if (!userData || userData.password !== password) {
        return res.status(400).json({ error: 'Invalid username or password' });
    }

    res.json({ message: 'Signin successful' });
});

// Shorten URL Route
app.post('/shorten', async (req, res) => {
    const { username, originalUrl } = req.body;

    if (!username || !originalUrl) {
        return res.status(400).json({ error: 'Username and original URL are required' });
    }

    const userData = await readUserData(username);

    if (!userData) {
        return res.status(404).json({ error: 'User not found' });
    }

    const shortId = Math.random().toString(36).substr(2, 6); // Generate short ID
    userData.urls[shortId] = originalUrl; // Save URL
    await writeUserData(username, userData);

    res.json({ shortUrl: `http://${IP}:${PORT}/${shortId}` }); // Return shortened URL
});

// Redirect to Original URL
app.get('/:shortId', async (req, res) => {
    const { shortId } = req.params;

    // Search for the short ID in all user data
    const userIndex = await readUserIndex();
    for (const username of Object.keys(userIndex)) {
        const userData = await readUserData(username);

        if (userData && userData.urls[shortId]) {
            return res.redirect(userData.urls[shortId]); // Redirect to the original URL
        }
    }

    res.status(404).send('URL not found'); // If short ID is not found
});

// Get User URLs Route
app.get('/urls/:username', async (req, res) => {
    const { username } = req.params;

    const userData = await readUserData(username);

    if (!userData) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json(userData.urls || {}); // Return the user's shortened URLs
});

// Server Initialization
app.listen(PORT, IP, () => {
    console.log(`Server is running on http://${IP}:${PORT}`);
});
