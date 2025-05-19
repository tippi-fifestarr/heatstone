/**
 * Main.js
 * Main application logic and screen transitions
 */

class App {
    constructor() {
        // DOM Elements
        this.mainMenuScreen = document.getElementById('main-menu');
        this.matchmakingScreen = document.getElementById('matchmaking-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.findMatchBtn = document.getElementById('find-match-btn');
        this.cancelSearchBtn = document.getElementById('cancel-search-btn');
        this.returnToMenuBtn = document.getElementById('return-to-menu-btn');
        this.usernameInput = document.getElementById('username-input');
        this.usernameError = document.getElementById('username-error');
        this.activeRoomsCount = document.getElementById('active-rooms-count');
        
        // State
        this.currentScreen = 'main-menu';
        this.matchmakingTimer = null;
        this.useSimulation = false; // Set to true to use simulated matchmaking instead of Socket.io
        this.username = null;
        
        // Bind event listeners
        this.findMatchBtn.addEventListener('click', () => this.startMatchmaking());
        this.cancelSearchBtn.addEventListener('click', () => this.cancelMatchmaking());
        this.returnToMenuBtn.addEventListener('click', () => this.returnToMainMenu());
        this.usernameInput.addEventListener('input', () => this.validateUsername());
        
        // Initialize
        this.showScreen('main-menu');
        this.initializeSocketClient();
    }
    
    /**
     * Validate username input
     */
    validateUsername() {
        const username = this.usernameInput.value.trim();
        
        if (username.length < 3) {
            this.usernameError.textContent = 'Username must be at least 3 characters';
            return false;
        }
        
        if (username.length > 10) {
            this.usernameError.textContent = 'Username must be at most 10 characters';
            return false;
        }
        
        if (!/^[a-zA-Z0-9]+$/.test(username)) {
            this.usernameError.textContent = 'Username must be alphanumeric';
            return false;
        }
        
        this.usernameError.textContent = '';
        return true;
    }
    
    /**
     * Initialize the Socket.io client
     */
    initializeSocketClient() {
        // Initialize Socket.io connection
        const initialized = socketClient.initialize();
        
        if (!initialized) {
            console.warn('Socket.io initialization failed, falling back to simulation mode');
            this.useSimulation = true;
            return;
        }
        
        // Set up Socket.io callbacks
        socketClient.setCallbacks({
            onConnect: () => {
                console.log('Connected to server with ID:', socketClient.getSocketId());
            },
            onDisconnect: () => {
                console.log('Disconnected from server');
                // If in matchmaking, cancel it
                if (this.currentScreen === 'matchmaking') {
                    this.cancelMatchmaking();
                }
            },
            onMatchFound: (data) => {
                console.log('Match found:', data);
                this.matchFound();
            },
            onOpponentDisconnected: (data) => {
                console.log('Opponent disconnected', data);
                alert(data && data.message ? data.message : 'Your opponent has disconnected');
                this.returnToMainMenu();
            },
            onGameStart: (data) => {
                console.log('Game started:', data);
            },
            onUsernameSet: (data) => {
                console.log('Username set:', data);
                this.username = data.username;
                this.usernameError.textContent = '';
                this.usernameInput.classList.add('valid');
            },
            onUsernameError: (data) => {
                console.log('Username error:', data);
                this.usernameError.textContent = data.error;
                this.usernameInput.classList.remove('valid');
            },
            onUsernameRequired: () => {
                console.log('Username required');
                this.usernameError.textContent = 'Please enter a username first';
                this.usernameInput.focus();
            },
            onRoomCountUpdate: (data) => {
                console.log('Room count update:', data);
                this.activeRoomsCount.textContent = data.count;
            }
        });
    }
    
    /**
     * Show a specific screen and hide others
     */
    showScreen(screenId) {
        // Hide all screens
        this.mainMenuScreen.classList.remove('active');
        this.matchmakingScreen.classList.remove('active');
        this.gameScreen.classList.remove('active');
        
        // Show the requested screen
        switch (screenId) {
            case 'main-menu':
                this.mainMenuScreen.classList.add('active');
                break;
            case 'matchmaking':
                this.matchmakingScreen.classList.add('active');
                break;
            case 'game':
                this.gameScreen.classList.add('active');
                break;
        }
        
        this.currentScreen = screenId;
    }
    
    /**
     * Start the matchmaking process
     */
    startMatchmaking() {
        // Validate username first
        if (!this.useSimulation) {
            const username = this.usernameInput.value.trim();
            
            if (!this.validateUsername()) {
                this.usernameError.textContent = 'Please enter a valid username';
                this.usernameInput.focus();
                return;
            }
            
            // Set username if not already set or if changed
            if (!socketClient.getUsername() || socketClient.getUsername() !== username) {
                socketClient.setUsername(username);
            }
        }
        
        // Show the matchmaking screen
        this.showScreen('matchmaking');
        
        // Start the matchmaking animation
        matchmakingManager.startMatchmaking();
        
        if (this.useSimulation) {
            // Simulation mode: use a timer to simulate finding a match
            const matchTime = 3000 + Math.random() * 5000; // 3-8 seconds
            
            this.matchmakingTimer = setTimeout(() => {
                this.matchFound();
            }, matchTime);
        } else {
            // Real mode: use Socket.io to find a match
            socketClient.findMatch();
        }
    }
    
    /**
     * Cancel the matchmaking process
     */
    cancelMatchmaking() {
        // Clear the matchmaking timer if in simulation mode
        if (this.matchmakingTimer) {
            clearTimeout(this.matchmakingTimer);
            this.matchmakingTimer = null;
        }
        
        // Cancel matchmaking on the server if using Socket.io
        if (!this.useSimulation && socketClient.isConnected()) {
            socketClient.cancelMatchmaking();
        }
        
        // Stop the matchmaking animation
        matchmakingManager.stopMatchmaking();
        
        // Return to the main menu
        this.showScreen('main-menu');
    }
    
    /**
     * Handle when a match is found
     */
    matchFound() {
        // Show "Worthy Opponent" with the slowdown effect
        matchmakingManager.showWorthyOpponent();
        
        // Wait for the animation to complete before transitioning to the game screen
        // Need to account for both the slowdown (2s) and the worthy opponent reveal (1s)
        setTimeout(() => {
            // Join the room if using Socket.io
            if (!this.useSimulation && socketClient.getRoomId()) {
                socketClient.joinRoom(socketClient.getRoomId());
            }
            
            // Initialize the game with opponent info
            const opponentId = socketClient.getOpponentId();
            const opponentName = socketClient.getOpponentName();
            gameManager.initGame(opponentId, opponentName);
            
            // Show the game screen
            this.showScreen('game');
        }, 3500); // Adjusted delay for shorter animations
    }
    
    /**
     * Return to the main menu from the game screen
     */
    returnToMainMenu() {
        this.showScreen('main-menu');
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});