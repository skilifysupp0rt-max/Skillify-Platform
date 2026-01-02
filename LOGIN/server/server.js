const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Init Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5000", // Allow frontend origin
    methods: ["GET", "POST"]
  }
});

// Attach Socket Logic
require('./sockets')(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
  console.log(`API accessible at http://localhost:${PORT}/api`);
});
