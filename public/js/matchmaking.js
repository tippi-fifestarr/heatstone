/**
 * Matchmaking.js
 * Handles the matchmaking animation, opponent types cycling, and loading tips
 */

class MatchmakingManager {
    constructor() {
        // DOM Elements
        this.opponentSpinner = document.querySelector('.opponent-spinner');
        this.topOpponent = document.querySelector('.opponent-type.top');
        this.centerOpponent = document.querySelector('.opponent-type.center');
        this.bottomOpponent = document.querySelector('.opponent-type.bottom');
        this.loadingTipElement = document.getElementById('loading-tip');
        
        // Animation state
        this.isSpinning = false;
        this.spinInterval = null;
        this.tipInterval = null;
        this.currentOpponentIndex = 0;
        
        // Data
        this.opponentTypes = [
            'Murloc Raider',
            'Tauren Warrior',
            'Elven Archer',
            'Angry Chicken',
            'Loot Hoarder',
            'Novice Engineer',
            'Bloodfen Raptor',
            'River Crocolisk',
            'Stonetusk Boar',
            'Silverback Patriarch',
            'Wolfrider',
            'Raid Leader',
            'Shieldbearer',
            'Worthy Opponent'
        ];
        
        this.loadingTips = [
            'Minions with Taunt must be attacked first.',
            'Spells with Overload will use some of your mana crystals on your next turn.',
            'Minions can\'t attack the turn they are played, unless they have Charge.',
            'Minions with Stealth can\'t be targeted until they attack.',
            'Minions with Divine Shield ignore the first damage they take.',
            'Weapons can be used once per turn, and take damage when you attack with them.',
            'Cards with Battlecry trigger an effect when they are played from your hand.',
            'Cards with Deathrattle trigger an effect when they are destroyed.',
            'The player who goes first gets one card and the player who goes second gets two cards and a coin.',
            'You can only have a maximum of 7 minions on the board at once.',
            'Your hand can only hold 10 cards. Any additional cards you draw will be destroyed.'
        ];
    }
    
    /**
     * Start the matchmaking animation and tip cycling
     */
    startMatchmaking() {
        if (this.isSpinning) return;
        
        this.isSpinning = true;
        this.updateOpponentDisplay();
        
        // Start cycling opponent types
        this.spinInterval = setInterval(() => {
            this.cycleOpponentTypes();
        }, 2000);
        
        // Start cycling loading tips
        this.showRandomTip();
        this.tipInterval = setInterval(() => {
            this.showRandomTip();
        }, 5000);
    }
    
    /**
     * Stop the matchmaking animation
     */
    stopMatchmaking() {
        this.isSpinning = false;
        
        clearInterval(this.spinInterval);
        clearInterval(this.tipInterval);
        
        this.spinInterval = null;
        this.tipInterval = null;
    }
    
    /**
     * Cycle through opponent types
     */
    cycleOpponentTypes() {
        // Increment the index and wrap around if needed
        this.currentOpponentIndex = (this.currentOpponentIndex + 1) % (this.opponentTypes.length - 1);
        this.updateOpponentDisplay();
    }
    
    /**
     * Update the opponent display with current and adjacent opponent types
     */
    updateOpponentDisplay() {
        const totalOpponents = this.opponentTypes.length - 1; // Exclude "Worthy Opponent"
        
        // Calculate indices for top, center, and bottom opponents
        const topIndex = (this.currentOpponentIndex + 1) % totalOpponents;
        const centerIndex = this.currentOpponentIndex;
        const bottomIndex = (this.currentOpponentIndex - 1 + totalOpponents) % totalOpponents;
        
        // Update the display
        this.topOpponent.textContent = this.opponentTypes[topIndex];
        this.centerOpponent.textContent = this.opponentTypes[centerIndex];
        this.bottomOpponent.textContent = this.opponentTypes[bottomIndex];
    }
    
    /**
     * Show a random loading tip
     */
    showRandomTip() {
        const randomIndex = Math.floor(Math.random() * this.loadingTips.length);
        this.loadingTipElement.textContent = this.loadingTips[randomIndex];
    }
    
    /**
     * Show "Worthy Opponent" as the final opponent
     */
    showWorthyOpponent() {
        this.topOpponent.textContent = '';
        this.centerOpponent.textContent = 'Worthy Opponent';
        this.bottomOpponent.textContent = '';
        
        // Add animation class
        this.centerOpponent.classList.add('worthy-opponent-reveal');
    }
}

// Create a global instance
const matchmakingManager = new MatchmakingManager();