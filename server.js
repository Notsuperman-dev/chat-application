require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const multer = require('multer');
const path = require('path');
const Filter = require('bad-words');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
    },
});

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const filter = new Filter();
const rooms = {}; // Keep track of chat rooms

// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later.'
}));

// File upload setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// Root route
app.get('/', (req, res) => {
    res.send('Welcome to the Chat Application!');
});

// Other routes
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.run(query, [username, hashedPassword], function (err) {
        if (err) {
            return res.status(400).send('User already exists');
        }
        res.status(201).send('User registered');
    });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }
    const query = 'SELECT * FROM users WHERE username = ?';
    db.get(query, [username], (err, user) => {
        if (err || !user) {
            return res.status(400).send('Invalid username or password');
        }
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).send('Invalid username or password');
        }
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).send({ token });
    });
});

app.get('/api/profile', (req, res) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).send('Access denied');
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.status(200).send(decoded);
    } catch (err) {
        res.status(400).send('Invalid token');
    }
});

app.post('/api/updateProfile', (req, res) => {
    const token = req.headers['authorization'];
    const { nickname, avatar } = req.body;
    if (!token) {
        return res.status(401).send('Access denied');
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const query = 'UPDATE users SET nickname = ?, avatar = ? WHERE id = ?';
        db.run(query, [nickname, avatar, decoded.id], function (err) {
            if (err) {
                return res.status(400).send('Profile update failed');
            }
            res.status(200).send('Profile updated');
        });
    } catch (err) {
        res.status(400).send('Invalid token');
    }
});

app.post('/api/uploadAvatar', upload.single('avatar'), (req, res) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).send('Access denied');
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const avatarPath = path.join('uploads', req.file.filename);
        const query = 'UPDATE users SET avatar = ? WHERE id = ?';
        db.run(query, [avatarPath, decoded.id], function (err) {
            if (err) {
                return res.status(400).send('Avatar upload failed');
            }
            res.status(200).send({ avatar: avatarPath });
        });
    } catch (err) {
        res.status(400).send('Invalid token');
    }
});

app.post('/api/rooms', (req, res) => {
    const { roomName } = req.body;
    const query = 'INSERT INTO rooms (name) VALUES (?)';
    db.run(query, [roomName], function (err) {
        if (err) {
            return res.status(400).send('Room creation failed');
        }
        res.status(201).send({ id: this.lastID, name: roomName });
    });
});

app.get('/api/rooms', (req, res) => {
    const query = 'SELECT * FROM rooms';
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(400).send('Failed to fetch rooms');
        }
        res.status(200).send(rows);
    });
});

// Socket.io events
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('joinRoom', ({ username, room }) => {
        if (!rooms[room]) {
            rooms[room] = [];
        }
        rooms[room].push(username);
        socket.join(room);
        io.to(room).emit('roomData', { room, users: rooms[room] });
        const query = 'SELECT * FROM messages WHERE room = ?';
        db.all(query, [room], (err, rows) => {
            if (err) {
                throw err;
            }
            rows.forEach((message) => {
                socket.emit('message', message);
            });
        });
        console.log(`Client joined room: ${room}`);
    });

    socket.on('leaveRoom', ({ room }) => {
        socket.leave(room);
        console.log(`Client left room: ${room}`);
    });

    socket.on('sendMessage', ({ message, room }) => {
        const sanitizedMessage = filter.clean(message);
        const query = 'INSERT INTO messages (room, text) VALUES (?, ?)';
        db.run(query, [room, sanitizedMessage], function (err) {
            if (err) {
                throw err;
            }
            io.to(room).emit('message', { id: this.lastID, room, text: sanitizedMessage });
        });
    });

    socket.on('typing', ({ user, room }) => {
        socket.broadcast.to(room).emit('typing', { user });
    });

    socket.on('stopTyping', ({ user, room }) => {
        socket.broadcast.to(room).emit('stopTyping', { user });
    });

    socket.on('privateMessage', ({ sender, receiver, message }) => {
        io.to(receiver).emit('privateMessage', { sender, message });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        for (const room in rooms) {
            rooms[room] = rooms[room].filter(user => user !== socket.id);
            io.to(room).emit('roomData', { room, users: rooms[room] });
        }
    });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
