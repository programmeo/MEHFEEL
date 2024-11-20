const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

//Create server From HTTP modual
const server = http.createServer(app);
//import socket and give get req (server)
const io = require('socket.io')(server, {
    connectionStateRecovery: {}
});

app.use(express.static('public'))
app.use(express.static('views'))
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

//Create individual room route
app.get('/:roomName', (req, res) => {
    const roomName = req.params.roomName
    res.render('room', { roomName })
})

//Endpoint to fetch song from Song Folder
app.get('/api/songs', (req, res) => {
    const songsFolderPath = path.join(__dirname, 'Song'); // Folder containing your songs

    // Read all files in the 'songs' folder (only .mp3 files, for example)
    fs.readdir(songsFolderPath, (err, files) => {
        if (err) {
            res.status(500).send('Error reading songs folder');
            return;
        }

        // Filter the files to include only .mp3 files (you can adjust the extension as needed)
        const songs = files.filter(file => file.endsWith('.mp3'));

        // Send the list of songs as JSON
        res.json(songs);
    });
});

//listen for Socket Connection

io.on('connection', (socket) => {
    console.log(`${socket.handshake.query.name} connected`);

    //make new chatroom and send message to every one who in rooms
    socket.on('joinRoom', (roomName) => {
        socket.join(roomName);
        console.log(`User joined room: ${roomName}`);
        socket.to(roomName).emit('message', `${socket.handshake.query.name} has joined the room: ${roomName}`);
    });

    // Broadcast to everyone in the room
    socket.on('chatMessage', (msg, roomName) => {
        socket.to(roomName).emit('messages', msg); // Broadcast to everyone in the room
    });

    //handling disconnection of client
    socket.on('disconnect', () => {
        console.log(`${socket.handshake.query.name} disconnected`);
    });


});

// server.listen(port, () => {
//     console.log(`Server is running at http://localhost:${port}`);
// });

server.listen(port, '192.168.1.10', () => {
    console.log(`server listen at http://192.168.1.10:${port}`);
});
