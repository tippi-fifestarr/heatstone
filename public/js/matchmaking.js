/**
 * Matchmaking.js
 * Handles the matchmaking animation, opponent types cycling, and loading tips
 */

class MatchmakingManager {
    constructor() {
        // DOM Elements
        this.matchmakingScreen = document.getElementById('matchmaking-screen');
        this.opponentCarousel = document.getElementById('opponent-carousel');
        this.loadingTipElement = document.getElementById('loading-tip');
        
        // State variables
        this.matchFound = false;
        this.matchType = "Worthy Opponent"; // Default match type
        
        // Animation state
        this.isSpinning = false;
        this.tipInterval = null;
        this.slowdownTimer = null;
        this.worthyOpponentItem = null;
        
        // Data
        this.opponentTypes = [
            'Worthy Opponent',
            'Sneaky Rogue',
            'Wise Shaman',
            'Mighty Warrior',
            'Curious Explorer',
            'Grumpy Dwarf',
            'Strategic Genius',
            'Arcane Master',
            'Lucky Novice',
            'Tournament Champion',
            'Seasoned Veteran',
            'Wild Experimenter',
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
            'Shieldbearer'
        ];
        
        this.loadingTips = [
            'Remember: The first player to reduce their opponent\'s health to zero wins the game!',
            'Try to play cards that synergize well with each other for maximum effect.',
            'Sometimes it\'s better to wait and save your resources for a bigger play later.',
            'Pay attention to your opponent\'s moves to anticipate their strategy.',
            'Don\'t forget to use your hero power each turn when it makes sense!',
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
        
        // Initialize
        this.createOpponentItems();
    }
    
    /**
     * Create opponent items for the 3D carousel
     */
    createOpponentItems() {
        this.opponentCarousel.innerHTML = '';
        
        // Create items for each opponent type (excluding "Worthy Opponent" for now)
        const opponentTypesWithoutWorthy = this.opponentTypes.filter(type => type !== 'Worthy Opponent');
        
        // Shuffle the array to randomize the order
        this.shuffleArray(opponentTypesWithoutWorthy);
        
        // Create items for the carousel - use more items for a better cylinder effect
        const numItems = 20; // More items for a better cylinder effect
        
        // Create a repeating pattern if we don't have enough items
        const selectedOpponents = [];
        for (let i = 0; i < numItems; i++) {
            selectedOpponents.push(opponentTypesWithoutWorthy[i % opponentTypesWithoutWorthy.length]);
        }
        
        selectedOpponents.forEach((type, index) => {
            const item = document.createElement('div');
            item.className = 'opponent-item';
            item.textContent = type;
            
            // Set initial transform for 3D carousel effect
            const angle = (index / selectedOpponents.length) * 360;
            const radius = 150; // Reduced radius to keep text more centered
            
            // Position the item in 3D space
            item.style.transform = `rotateX(${angle}deg) translateZ(${radius}px)`;
            
            this.opponentCarousel.appendChild(item);
        });
    }
    
    /**
     * Shuffle an array (Fisher-Yates algorithm)
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    /**
     * Start the matchmaking animation and tip cycling
     */
    startMatchmaking() {
        if (this.isSpinning) return;
        
        // Reset any previous state
        this.createOpponentItems();
        
        // Add searching class to start animation
        this.matchmakingScreen.classList.add('searching');
        this.matchmakingScreen.classList.remove('match-found');
        
        this.isSpinning = true;
        
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
        
        // Remove classes
        this.matchmakingScreen.classList.remove('searching');
        this.matchmakingScreen.classList.remove('match-found');
        
        // Clear intervals and timers
        clearInterval(this.tipInterval);
        if (this.slowdownTimer) {
            clearTimeout(this.slowdownTimer);
        }
        
        this.tipInterval = null;
        this.slowdownTimer = null;
    }
    
    /**
     * Show a random loading tip
     */
    showRandomTip() {
        const randomIndex = Math.floor(Math.random() * this.loadingTips.length);
        this.loadingTipElement.textContent = this.loadingTips[randomIndex];
    }
    
    /**
     * Set match found state and type
     */
    setMatchFound(found, type = "Worthy Opponent") {
        this.matchFound = found;
        this.matchType = type;
        
        if (found) {
            this.startSlowdownAnimation();
        }
    }
    
    /**
     * Show "Worthy Opponent" as the final opponent
     */
    showWorthyOpponent() {
        // Update state
        this.setMatchFound(true, "Worthy Opponent");
    }
    
    /**
     * Start the slowdown animation and prepare for the worthy opponent reveal
     */
    startSlowdownAnimation() {
        // First start the slowdown animation
        this.matchmakingScreen.classList.remove('searching');
        this.matchmakingScreen.classList.add('slowing-down');
        
        // Inject the worthy opponent at the right position
        this.injectWorthyOpponent();
        
        // After the slowdown animation completes, show the final state
        setTimeout(() => {
            // Remove the slowing-down class and add match-found
            this.matchmakingScreen.classList.remove('slowing-down');
            this.matchmakingScreen.classList.add('match-found');
            
            // Finalize the worthy opponent display
            this.finalizeWorthyOpponent();
        }, 2000); // Match the duration of the slowdown animation
    }
    
    /**
     * Inject the worthy opponent into the carousel at the right position
     * without removing existing items
     */
    injectWorthyOpponent() {
        // Get all opponent items
        const items = this.opponentCarousel.querySelectorAll('.opponent-item');
        if (items.length === 0) return;
        
        // Find the item that will be at the center when the animation ends
        // For simplicity, we'll use the item that's closest to the center now
        let centerItem = null;
        let minDistance = Infinity;
        
        items.forEach(item => {
            // Extract the current rotation from the transform style
            const transform = item.style.transform || '';
            const match = transform.match(/rotateX\(([^)]+)deg\)/);
            if (match) {
                const rotation = parseFloat(match[1]) % 360;
                // Calculate distance to 0 degrees (or 360 degrees)
                const distance = Math.min(
                    Math.abs(rotation),
                    Math.abs(360 - rotation)
                );
                
                if (distance < minDistance) {
                    minDistance = distance;
                    centerItem = item;
                }
            }
        });
        
        // Mark the center item as the worthy opponent
        if (centerItem) {
            centerItem.dataset.isWorthy = 'true';
            this.worthyOpponentItem = centerItem;
        }
    }
    
    /**
     * Finalize the worthy opponent display
     */
    finalizeWorthyOpponent() {
        // Get all opponent items
        const items = this.opponentCarousel.querySelectorAll('.opponent-item');
        
        // If we have a worthy opponent item, use it
        if (this.worthyOpponentItem) {
            // Clear all other items
            items.forEach(item => {
                if (item !== this.worthyOpponentItem) {
                    item.style.opacity = '0';
                }
            });
            
            // Update the worthy opponent item
            this.worthyOpponentItem.textContent = this.matchType;
            this.worthyOpponentItem.className = 'opponent-item position-center worthy-opponent-reveal';
            this.worthyOpponentItem.style.transform = 'rotateX(0deg) translateZ(0px)';
            this.worthyOpponentItem.style.opacity = '1';
            this.worthyOpponentItem.style.zIndex = '10';
            
            // Create two more items for above and below
            const randomOpponents = this.getRandomOpponents(2);
            
            // Create top item
            const topElement = document.createElement('div');
            topElement.className = 'opponent-item position-top';
            topElement.textContent = randomOpponents[0];
            this.opponentCarousel.appendChild(topElement);
            
            // Create bottom item
            const bottomElement = document.createElement('div');
            bottomElement.className = 'opponent-item position-bottom';
            bottomElement.textContent = randomOpponents[1];
            this.opponentCarousel.appendChild(bottomElement);
        } else {
            // Fallback if we don't have a worthy opponent item
            // Clear the carousel and add the slot machine style display
            this.opponentCarousel.innerHTML = '';
            
            // Get random opponents for top and bottom positions
            const randomOpponents = this.getRandomOpponents(2);
            
            // Create the slot machine style display with 3 visible items
            const topElement = document.createElement('div');
            topElement.className = 'opponent-item position-top';
            topElement.textContent = randomOpponents[0];
            this.opponentCarousel.appendChild(topElement);
            
            const centerElement = document.createElement('div');
            centerElement.className = 'opponent-item position-center worthy-opponent-reveal';
            centerElement.textContent = this.matchType;
            this.opponentCarousel.appendChild(centerElement);
            
            const bottomElement = document.createElement('div');
            bottomElement.className = 'opponent-item position-bottom';
            bottomElement.textContent = randomOpponents[1];
            this.opponentCarousel.appendChild(bottomElement);
        }
    }
    
    /**
     * Get random opponent types (excluding "Worthy Opponent")
     */
    getRandomOpponents(count) {
        const opponentTypesWithoutWorthy = this.opponentTypes.filter(type => type !== 'Worthy Opponent');
        this.shuffleArray(opponentTypesWithoutWorthy);
        return opponentTypesWithoutWorthy.slice(0, count);
    }
}

// Create a global instance
const matchmakingManager = new MatchmakingManager();