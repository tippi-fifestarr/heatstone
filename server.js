/**
 * Server.js
 * Express server with Socket.io for real-time communication
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Server configuration
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Listen on all network interfaces

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Route all requests to the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Server state
let matchmakingQueue = []; // Queue for matchmaking
const gameRooms = new Map(); // Active game rooms
const usernames = new Map(); // Map of socket ID to username
let activeConnections = 0; // Count of active connections

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`New connection: ${socket.id}`);
  activeConnections++;
  
  // Broadcast updated room count to all clients
  broadcastRoomCount();
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Disconnected: ${socket.id}`);
    activeConnections--;
    
    // Remove username
    usernames.delete(socket.id);
    
    // Remove from matchmaking queue if present
    matchmakingQueue = matchmakingQueue.filter(id => id !== socket.id);
    
    // Handle room cleanup if in a game room
    let roomToDelete = null;
    let opponentId = null;
    
    for (const [roomId, room] of gameRooms.entries()) {
      if (room.players.includes(socket.id)) {
        opponentId = room.players.find(id => id !== socket.id);
        roomToDelete = roomId;
        break;
      }
    }
    
    // Notify opponent and delete room if needed
    if (roomToDelete) {
      if (opponentId) {
        io.to(opponentId).emit('opponent_disconnected', {
          message: `${getUsernameById(socket.id)} has disconnected`
        });
      }
      
      // Remove all sockets from the room
      const roomSockets = io.sockets.adapter.rooms.get(roomToDelete);
      if (roomSockets) {
        for (const socketId of roomSockets) {
          io.sockets.sockets.get(socketId).leave(roomToDelete);
        }
      }
      
      gameRooms.delete(roomToDelete);
      broadcastRoomCount();
    }
  });
  
  // Handle setting username
  socket.on('set_username', (username) => {
    // Validate username (alphanumeric, 3-10 chars)
    const validUsername = validateUsername(username);
    
    if (validUsername) {
      usernames.set(socket.id, validUsername);
      socket.emit('username_set', { username: validUsername });
      console.log(`Username set for ${socket.id}: ${validUsername}`);
    } else {
      socket.emit('username_error', {
        error: 'Invalid username. Use 3-10 alphanumeric characters.'
      });
    }
  });
  
  // Handle find match request
  socket.on('find_match', () => {
    // Check if username is set
    if (!usernames.has(socket.id)) {
      socket.emit('username_required');
      return;
    }
    
    const username = usernames.get(socket.id);
    console.log(`${username} (${socket.id}) is looking for a match`);
    
    // Check if already in queue
    if (matchmakingQueue.includes(socket.id)) {
      return;
    }
    
    // Add to matchmaking queue
    matchmakingQueue.push(socket.id);
    
    // Check if we can create a match
    if (matchmakingQueue.length >= 2) {
      const player1 = matchmakingQueue.shift();
      const player2 = matchmakingQueue.shift();
      
      // Create a new game room
      const roomId = `room_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      gameRooms.set(roomId, {
        id: roomId,
        players: [player1, player2],
        created: Date.now(),
        playerNames: [
          getUsernameById(player1),
          getUsernameById(player2)
        ]
      });
      
      // Notify both players
      io.to(player1).emit('match_found', {
        roomId,
        opponentId: player2,
        opponentName: getUsernameById(player2)
      });
      
      io.to(player2).emit('match_found', {
        roomId,
        opponentId: player1,
        opponentName: getUsernameById(player1)
      });
      
      console.log(`Match created: ${getUsernameById(player1)} vs ${getUsernameById(player2)} in room ${roomId}`);
      
      // Broadcast updated room count
      broadcastRoomCount();
    }
  });
  
  // Handle cancel matchmaking
  socket.on('cancel_matchmaking', () => {
    console.log(`${socket.id} cancelled matchmaking`);
    matchmakingQueue = matchmakingQueue.filter(id => id !== socket.id);
  });
  
  // Handle joining a room
  socket.on('join_room', (roomId) => {
    const room = gameRooms.get(roomId);
    if (room && room.players.includes(socket.id)) {
      socket.join(roomId);
      console.log(`${socket.id} joined room ${roomId}`);
      
      // Check if both players have joined
      const socketsInRoom = io.sockets.adapter.rooms.get(roomId);
      if (socketsInRoom && socketsInRoom.size === 2) {
        io.to(roomId).emit('game_start', { roomId });
      }
    }
  });
  
  // Handle chat messages
  socket.on('send_message', ({ roomId, message }) => {
    const room = gameRooms.get(roomId);
    if (room && room.players.includes(socket.id)) {
      // Broadcast message to the room
      socket.to(roomId).emit('receive_message', {
        senderId: socket.id,
        senderName: getUsernameById(socket.id),
        message
      });
    }
  });
});

/**
 * Validate username (alphanumeric, 3-10 chars)
 */
function validateUsername(username) {
  if (!username || typeof username !== 'string') {
    return false;
  }
  
  // Remove whitespace and check length
  const trimmed = username.trim();
  if (trimmed.length < 3 || trimmed.length > 10) {
    return false;
  }
  
  // Check if alphanumeric
  if (!/^[a-zA-Z0-9]+$/.test(trimmed)) {
    return false;
  }
  
  return trimmed;
}

/**
 * Get username by socket ID
 */
function getUsernameById(socketId) {
  return usernames.get(socketId) || socketId.substring(0, 6);
}

/**
 * Broadcast room count to all clients
 */
function broadcastRoomCount() {
  io.emit('room_count', {
    count: gameRooms.size,
    connections: activeConnections
  });
}

// Start the server
server.listen(PORT, HOST, () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`For local access: http://localhost:${PORT}`);
  console.log(`For network access: http://<your-local-ip>:${PORT}`);
  console.log('Press Ctrl+C to quit');
});