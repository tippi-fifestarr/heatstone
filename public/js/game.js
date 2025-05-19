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
        this.chatbotEnabled = this.enableChatbotCheckbox.checked;
        
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
        
        // For Phase 1, we'll simulate the opponent's responses
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
    }
    
    /**
     * Initialize the game screen with opponent information
     */
    initGame() {
        // In Phase 1, we'll just use "Worthy Opponent"
        this.opponentNameElement.textContent = "Worthy Opponent";
        
        // Clear any previous chat messages
        this.chatMessages.innerHTML = '';
        
        // Add a welcome message
        this.addSystemMessage("You've been matched with a Worthy Opponent. Chat here!");
        
        // Update chatbot state from checkbox
        this.chatbotEnabled = this.enableChatbotCheckbox.checked;
        
        // For Phase 1, simulate an opponent greeting after a short delay if chatbot is enabled
        if (this.chatbotEnabled) {
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
            
            // For Phase 1, simulate an opponent response after a short delay if chatbot is enabled
            if (this.chatbotEnabled) {
                setTimeout(() => {
                    this.addOpponentMessage(this.getRandomResponse());
                }, 1000 + Math.random() * 2000);
            }
        }
    }
    
    /**
     * Add a player message to the chat
     */
    addPlayerMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message self';
        messageElement.textContent = message;
        this.chatMessages.appendChild(messageElement);
        this.scrollChatToBottom();
    }
    
    /**
     * Add an opponent message to the chat
     */
    addOpponentMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message other';
        messageElement.textContent = message;
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