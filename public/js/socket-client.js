/**
 * Socket-client.js
 * Handles Socket.io client-side functionality for real-time communication
 */

class SocketClient {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.roomId = null;
        this.opponentId = null;
        this.opponentName = null;
        this.username = null;
        this.activeRooms = 0;
        this.activeConnections = 0;
        this.callbacks = {
            onConnect: () => {},
            onDisconnect: () => {},
            onMatchFound: () => {},
            onOpponentDisconnected: () => {},
            onGameStart: () => {},
            onReceiveMessage: () => {},
            onUsernameSet: () => {},
            onUsernameError: () => {},
            onUsernameRequired: () => {},
            onRoomCountUpdate: () => {},
            onGameStateUpdate: () => {},
            onBuffSelection: () => {}
        };
    }

    /**
     * Initialize the Socket.io connection
     */
    initialize() {
        // Check if Socket.io is loaded
        if (typeof io === 'undefined') {
            console.error('Socket.io is not loaded');
            return false;
        }

        // Connect to the server
        this.socket = io();

        // Set up event listeners
        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.connected = true;
            this.callbacks.onConnect();
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.connected = false;
            this.callbacks.onDisconnect();
        });

        this.socket.on('match_found', (data) => {
            console.log('Match found:', data);
            this.roomId = data.roomId;
            this.opponentId = data.opponentId;
            this.opponentName = data.opponentName || data.opponentId.substring(0, 6);
            this.callbacks.onMatchFound(data);
        });

        this.socket.on('opponent_disconnected', () => {
            console.log('Opponent disconnected');
            this.callbacks.onOpponentDisconnected();
        });

        this.socket.on('game_start', (data) => {
            console.log('Game started:', data);
            this.callbacks.onGameStart(data);
        });

        this.socket.on('receive_message', (data) => {
            console.log('Message received:', data);
            this.callbacks.onReceiveMessage(data);
        });
        
        this.socket.on('username_set', (data) => {
            console.log('Username set:', data);
            this.username = data.username;
            this.callbacks.onUsernameSet(data);
        });
        
        this.socket.on('username_error', (data) => {
            console.log('Username error:', data);
            this.callbacks.onUsernameError(data);
        });
        
        this.socket.on('username_required', () => {
            console.log('Username required');
            this.callbacks.onUsernameRequired();
        });
        
        this.socket.on('room_count', (data) => {
            console.log('Room count update:', data);
            this.activeRooms = data.count;
            this.activeConnections = data.connections;
            this.callbacks.onRoomCountUpdate(data);
        });
        
        this.socket.on('game_state_update', (data) => {
            console.log('Game state update:', data);
            this.callbacks.onGameStateUpdate(data);
        });

        return true;
    }

    /**
     * Set callback functions
     */
    setCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }

    /**
     * Set username
     */
    setUsername(username) {
        if (!this.connected) return false;
        this.socket.emit('set_username', username);
        return true;
    }
    
    /**
     * Find a match
     */
    findMatch() {
        if (!this.connected) return false;
        this.socket.emit('find_match');
        return true;
    }

    /**
     * Cancel matchmaking
     */
    cancelMatchmaking() {
        if (!this.connected) return false;
        this.socket.emit('cancel_matchmaking');
        return true;
    }

    /**
     * Join a room
     */
    joinRoom(roomId) {
        if (!this.connected) return false;
        this.socket.emit('join_room', roomId);
        return true;
    }

    /**
     * Send a chat message
     */
    sendMessage(message) {
        if (!this.connected || !this.roomId) return false;
        this.socket.emit('send_message', {
            roomId: this.roomId,
            message
        });
        return true;
    }

    /**
     * Get connection status
     */
    isConnected() {
        return this.connected;
    }

    /**
     * Get socket ID
     */
    getSocketId() {
        return this.socket ? this.socket.id : null;
    }

    /**
     * Get room ID
     */
    getRoomId() {
        return this.roomId;
    }

    /**
     * Get opponent ID
     */
    getOpponentId() {
        return this.opponentId;
    }
    
    /**
     * Get opponent name
     */
    getOpponentName() {
        return this.opponentName || (this.opponentId ? this.opponentId.substring(0, 6) : null);
    }
    
    /**
     * Get username
     */
    getUsername() {
        return this.username;
    }
    
    /**
     * Get active rooms count
     */
    getActiveRooms() {
        return this.activeRooms;
    }
    
    /**
     * Get active connections count
     */
    getActiveConnections() {
        return this.activeConnections;
    }
}

// Create a global instance
const socketClient = new SocketClient();