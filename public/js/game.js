/**
 * Game.js
 * Game manager for Farcaster Friend Sync (FFS)
 * Handles chat and game integration
 */

class GameManager {
    constructor() {
        // DOM Elements
        this.gameScreen = document.getElementById('game-screen');
        this.opponentNameElement = document.getElementById('opponent-name');
        this.chatMessages = document.getElementById('chat-messages');
        this.chatInput = document.getElementById('chat-input');
        this.sendChatBtn = document.getElementById('send-chat-btn');
        this.returnToMenuBtn = document.getElementById('return-to-menu-btn');
        this.enableChatbotCheckbox = document.getElementById('enable-chatbot');
        
        // Player info
        this.playerId = null;
        this.opponentId = null;
        this.opponentName = null;
        this.useSimulation = true; // Default to simulation mode
        
        // Chat state
        this.chatbotEnabled = false; // Disabled by default
        this.enableChatbotCheckbox.checked = this.chatbotEnabled;
        
        // Current game instance
        this.currentGame = null;
        
        // Bind event listeners for chat
        this.sendChatBtn.addEventListener('click', () => this.sendChatMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });
        this.enableChatbotCheckbox.addEventListener('change', () => {
            this.chatbotEnabled = this.enableChatbotCheckbox.checked;
            if (this.chatbotEnabled) {
                this.addSystemMessage("AI Chatbot enabled");
            } else {
                this.addSystemMessage("AI Chatbot disabled");
            }
        });
        
        // For simulation mode, we'll use these responses
        this.simulatedResponses = [
            "Hello there!",
            "Good luck, have fun!",
            "Nice to meet you.",
            "I hope we have a good match.",
            "I'm heating up!",
            "Stay cool!",
            "That's a hot move!",
            "I'm going to ice you!",
            "Nice strategy!",
            "Well played!"
        ];
        
        // Set up Socket.io callbacks
        this.setupSocketCallbacks();
    }
    
    /**
     * Set up Socket.io callbacks
     */
    setupSocketCallbacks() {
        // Check if Socket.io client is available
        if (typeof socketClient === 'undefined') {
            console.warn('Socket.io client not available');
            return;
        }
        
        // Set callbacks for game events
        socketClient.setCallbacks({
            onReceiveMessage: (data) => {
                this.addOpponentMessage(data.message, data.senderName);
            },
            onGameStart: (data) => {
                console.log('Game started:', data);
                this.startGame(data);
            },
            onGameStateUpdate: (data) => {
                console.log('Game state update:', data);
                this.updateGameState(data.gameState);
            },
            onGameOver: (data) => {
                console.log('Game over:', data);
                this.showGameOver(data.winner, data.reason);
            }
        });
    }
    
    /**
     * Initialize the game screen with opponent information
     */
    initGame(opponentId = null, opponentName = null) {
        // Set player info
        this.playerId = socketClient ? socketClient.getSocketId() : 'player';
        this.opponentId = opponentId || 'opponent';
        this.opponentName = opponentName || (opponentId ? opponentId.substring(0, 6) : "Worthy Opponent");
        
        // Determine if we should use simulation mode
        this.useSimulation = !opponentId || typeof socketClient === 'undefined' || !socketClient.isConnected();
        
        // Set opponent name in UI
        this.opponentNameElement.textContent = this.opponentName;
        
        // Clear any previous chat messages
        this.chatMessages.innerHTML = '';
        
        // Add a welcome message
        this.addSystemMessage(`You've been matched with ${this.opponentName}. Get ready for Heatstone!`);
        
        // Update chatbot state from checkbox
        this.chatbotEnabled = this.enableChatbotCheckbox.checked;
        
        // TODO: In the future, hook this up to an LLM API for chat assistance
        // that can read the chat context and provide more intelligent responses
        
        // Initialize the game (currently only Heatstone)
        this.initializeHeatstoneGame();
        
        // Start the game
        if (this.useSimulation) {
            // Simulation mode: start the game locally
            setTimeout(() => {
                this.startGame();
            }, 1000);
        } else {
            // Real mode: wait for server to start the game
            // The server will send a game_start event
            this.addSystemMessage("Waiting for game to start...");
        }
    }
    
    /**
     * Initialize the Heatstone game
     */
    initializeHeatstoneGame() {
        // Create a new Heatstone game instance
        this.currentGame = new HeatstoneGame(this);
        
        // Initialize the game with player IDs
        this.currentGame.initialize(this.playerId, this.opponentId);
    }
    
    // Chat methods (reusing from previous implementation)
    
    /**
     * Send a chat message
     */
    sendChatMessage() {
        const message = this.chatInput.value.trim();
        
        if (message) {
            // Add the player's message to the chat
            this.addPlayerMessage(message);
            
            // Clear the input
            this.chatInput.value = '';
            
            if (this.useSimulation) {
                // Simulation mode: simulate an opponent response if chatbot is enabled
                if (this.chatbotEnabled) {
                    setTimeout(() => {
                        this.addOpponentMessage(this.getRandomResponse());
                    }, 1000 + Math.random() * 2000);
                }
            } else {
                // Real mode: send message via Socket.io
                socketClient.sendMessage(message);
            }
        }
    }
    
    /**
     * Add a system message to the chat
     */
    addSystemMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message system';
        messageElement.textContent = message;
        this.chatMessages.appendChild(messageElement);
        this.scrollChatToBottom();
    }
    
    /**
     * Add an opponent message to the chat
     */
    addOpponentMessage(message, senderName = null) {
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message other';
        
        // Add sender name if provided
        if (senderName || this.opponentName) {
            const nameSpan = document.createElement('div');
            nameSpan.className = 'message-sender';
            nameSpan.textContent = senderName || this.opponentName;
            messageElement.appendChild(nameSpan);
        }
        
        // Add message content
        const contentSpan = document.createElement('div');
        contentSpan.className = 'message-content';
        contentSpan.textContent = message;
        messageElement.appendChild(contentSpan);
        
        this.chatMessages.appendChild(messageElement);
        this.scrollChatToBottom();
    }
    
    /**
     * Add a player message to the chat
     */
    addPlayerMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message self';
        
        // Add sender name if available
        if (socketClient && socketClient.getUsername()) {
            const nameSpan = document.createElement('div');
            nameSpan.className = 'message-sender';
            nameSpan.textContent = socketClient.getUsername();
            messageElement.appendChild(nameSpan);
        }
        
        // Add message content
        const contentSpan = document.createElement('div');
        contentSpan.className = 'message-content';
        contentSpan.textContent = message;
        messageElement.appendChild(contentSpan);
        
        this.chatMessages.appendChild(messageElement);
        this.scrollChatToBottom();
    }
    
    /**
     * Scroll the chat to the bottom
     */
    scrollChatToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    /**
     * Get a random response for the simulated opponent
     */
    getRandomResponse() {
        const randomIndex = Math.floor(Math.random() * this.simulatedResponses.length);
        return this.simulatedResponses[randomIndex];
    }
    
    /**
     * Start the game
     */
    startGame(data = null) {
        console.log("GameManager.startGame called", data);
        
        if (this.currentGame) {
            console.log("Calling currentGame.startGame");
            this.currentGame.startGame(data);
        } else {
            console.error("No current game instance!");
            
            // Try to initialize the game if it doesn't exist
            this.initializeHeatstoneGame();
            
            if (this.currentGame) {
                this.currentGame.startGame(data);
            }
        }
    }
    
    /**
     * Send a game action to the server
     */
    sendGameAction(action, data) {
        if (!this.useSimulation && socketClient) {
            socketClient.socket.emit(action, data);
        }
    }
    
    /**
     * Request a rematch
     */
    requestRematch() {
        if (!this.useSimulation && socketClient) {
            socketClient.socket.emit('rematch_request');
            this.addSystemMessage("Rematch requested. Waiting for opponent...");
        } else {
            // In simulation mode, just restart the game
            this.initGame(this.opponentId, this.opponentName);
        }
    }
    
    /**
     * Return to main menu
     */
    returnToMainMenu() {
        // If using Socket.io, leave the room
        if (!this.useSimulation && socketClient) {
            socketClient.socket.emit('leave_room');
        }
        
        // Return to main menu
        if (typeof app !== 'undefined') {
            app.showScreen('main-menu');
        }
    }
    
    /**
     * Check if simulation mode is active
     */
    isSimulation() {
        return this.useSimulation;
    }
    
    /**
     * Get player name
     */
    getPlayerName() {
        return socketClient ? socketClient.getUsername() || 'You' : 'You';
    }
    
    /**
     * Get opponent name
     */
    getOpponentName() {
        return this.opponentName;
    }
    
    /**
     * Update game state
     */
    updateGameState(gameState) {
        if (this.currentGame) {
            this.currentGame.updateGameState(gameState);
        }
    }
}

// Create a global instance
const gameManager = new GameManager();