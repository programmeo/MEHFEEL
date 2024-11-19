const express = require('express');
const http = require('http');

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

server.listen(port,'192.168.1.10', ()=>{
    console.log(`server listen at http://192.168.1.10:${port}`);
});
