const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const multer = require("multer")

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
app.use(express.static('Song'))
app.use(express.static('Upload'))
app.use(express.json());
app.set('view engine', 'ejs');

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

    //send play emit to room
    socket.on('play', (song, roomName)=>{
        console.log(song);//debug line
        console.log(roomName);//debug line
        io.to(roomName).emit('playmusic', song)
    })

    //handling disconnection of client
    socket.on('disconnect', () => {
        console.log(`${socket.handshake.query.name} disconnected`);
    });
});

//upload song to the upload forlder
const SongStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'Upload/')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

//creat multer instance and set limit to only 10MB and Only mp3 File allowed
const UploadSong = multer({
    storage: SongStorage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        if (file.mimetype == 'audio/mpeg') {
            cb(null, true);  // Accept the file
        } else {
            cb(new Error('Only mp3 files are allowed'), false);  // Reject the file
        }
    }
})


app.get('/', (req, res) => {
    res.send('Hello, World!');
});

//Create individual room route
app.get('/:roomName', (req, res) => {
    const roomName = req.params.roomName
    res.render('room', { roomName })
})


//post request for file upload
app.post("/:roomName/upload", UploadSong.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }
    res.json({ songs: req.file.filename })
})

// Handle POST request for playing a song
app.post('/playSong', (req, res) => {
    const { songName } = req.body;  // Get the song name from the request body
    const songPath = path.join(__dirname, 'Song', songName);  // Path to the song file
    const uploadPath = path.join(__dirname, 'Upload', songName); // Path for uploaded song
    let pathToUse = '';

    // Use synchronous check
    if (fs.existsSync(songPath)) {
        pathToUse = songPath;
    } else if (fs.existsSync(uploadPath)) {
        pathToUse = uploadPath;
    } else {
        return res.status(404).send('Song not found');
    }

    const extname = path.extname(songName).toLowerCase();
    let contentType = 'audio/mp3';  // Default

    if (extname === '.ogg') contentType = 'audio/ogg';
    if (extname === '.wav') contentType = 'audio/wav';

    // Set headers for audio file
    res.setHeader('Content-Type', contentType);
    const readStream = fs.createReadStream(pathToUse); // Create a readable stream
    readStream.pipe(res); // Pipe the song stream to the response
});

//Real time search qery send ajax
// Route to search for songs
app.get('/api/searchSongs', (req, res) => {
    const SONG_FOLDERS = [path.join(__dirname, 'Song'), path.join(__dirname, 'Upload')]; // Add multiple folders here
    const query = req.query.query.toLowerCase();

    let allFiles = []; // To store files from all folders

    // Function to read files from a folder and push to allFiles
    const readFolder = (folder, callback) => {
        fs.readdir(folder, (err, files) => {
            if (err) {
                return callback(err);
            }
            allFiles.push(...files.map(file => ({ name: file, folder }))); // Include folder info if needed
            callback(null);
        });
    };

    // Process all folders
    let tasksCompleted = 0;
    for (const folder of SONG_FOLDERS) {
        readFolder(folder, (err) => {
            if (err) {
                return res.status(500).json({ error: `Failed to read folder: ${folder}` });
            }
            tasksCompleted++;
            if (tasksCompleted === SONG_FOLDERS.length) {
                // All folders processed
                const matchingSongs = allFiles
                    .filter(file =>
                        file.name.toLowerCase().includes(query) && file.name.endsWith('.mp3') // Filter by query and file type
                    )
                    .map(file => ({ name: file.name, folder: file.folder })); // Optionally include folder info
                res.json({ songs: matchingSongs });
            }
        });
    }
});

server.listen(port, '192.168.1.2', () => {
    console.log(`server listen at http://192.168.1.2:${port}`);
});
