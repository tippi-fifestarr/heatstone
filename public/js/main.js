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
        
        // State
        this.currentScreen = 'main-menu';
        this.matchmakingTimer = null;
        
        // Bind event listeners
        this.findMatchBtn.addEventListener('click', () => this.startMatchmaking());
        this.cancelSearchBtn.addEventListener('click', () => this.cancelMatchmaking());
        this.returnToMenuBtn.addEventListener('click', () => this.returnToMainMenu());
        
        // Initialize
        this.showScreen('main-menu');
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
        // Show the matchmaking screen
        this.showScreen('matchmaking');
        
        // Start the matchmaking animation
        matchmakingManager.startMatchmaking();
        
        // For Phase 1, simulate finding a match after a random time (5-15 seconds)
        const matchTime = 5000 + Math.random() * 10000; // 5-15 seconds
        
        this.matchmakingTimer = setTimeout(() => {
            this.matchFound();
        }, matchTime);
    }
    
    /**
     * Cancel the matchmaking process
     */
    cancelMatchmaking() {
        // Clear the matchmaking timer
        if (this.matchmakingTimer) {
            clearTimeout(this.matchmakingTimer);
            this.matchmakingTimer = null;
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
        // Need to account for both the slowdown (3s) and the worthy opponent reveal (1s)
        setTimeout(() => {
            // Initialize the game
            gameManager.initGame();
            
            // Show the game screen
            this.showScreen('game');
        }, 5000); // Longer delay to allow for both animations
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