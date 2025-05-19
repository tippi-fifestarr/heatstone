/**
 * Game.js
 * Handles the basic game UI and chat functionality
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
        
        // State
        this.chatbotEnabled = false; // Disabled by default
        this.opponentId = null;
        this.opponentName = null;
        this.useSimulation = true; // Default to simulation mode
        
        // Update checkbox to match default state
        this.enableChatbotCheckbox.checked = this.chatbotEnabled;
        
        // Bind event listeners
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
            "What deck are you playing?",
            "I'm new to this game.",
            "Have you been playing long?",
            "This matchmaking animation is cool!",
            "I like your strategy.",
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
        
        // Set callback for receiving messages
        socketClient.setCallbacks({
            onReceiveMessage: (data) => {
                this.addOpponentMessage(data.message);
            }
        });
    }
    
    /**
     * Initialize the game screen with opponent information
     */
    initGame(opponentId = null, opponentName = null) {
        // Set opponent info if provided
        this.opponentId = opponentId;
        this.opponentName = opponentName || (opponentId ? opponentId.substring(0, 6) : "Worthy Opponent");
        
        // Determine if we should use simulation mode
        this.useSimulation = !opponentId || typeof socketClient === 'undefined' || !socketClient.isConnected();
        
        // Set opponent name in UI
        this.opponentNameElement.textContent = this.opponentName;
        
        // Clear any previous chat messages
        this.chatMessages.innerHTML = '';
        
        // Add a welcome message
        this.addSystemMessage(`You've been matched with ${this.opponentName}. Chat here!`);
        
        // Update chatbot state from checkbox
        this.chatbotEnabled = this.enableChatbotCheckbox.checked;
        
        // TODO: In the future, hook this up to an LLM API for chat assistance
        // that can read the chat context and provide more intelligent responses
        
        // For simulation mode, simulate an opponent greeting after a short delay if chatbot is enabled
        if (this.useSimulation && this.chatbotEnabled) {
            setTimeout(() => {
                this.addOpponentMessage(this.getRandomResponse());
            }, 2000);
        }
    }
    
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
     * Add a system message to the chat
     */
    addSystemMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message system';
        messageElement.style.color = '#f7b10a';
        messageElement.style.textAlign = 'center';
        messageElement.textContent = message;
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
     * Get a random simulated response
     */
    getRandomResponse() {
        const randomIndex = Math.floor(Math.random() * this.simulatedResponses.length);
        return this.simulatedResponses[randomIndex];
    }
}

// Create a global instance
const gameManager = new GameManager();