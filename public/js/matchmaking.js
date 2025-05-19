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
        
        // Animation state
        this.isSpinning = false;
        this.tipInterval = null;
        this.slowdownTimer = null;
        
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
        
        // Create items for the carousel - use fewer items for better performance
        const numItems = 12; // Limit the number of items for better performance
        const selectedOpponents = opponentTypesWithoutWorthy.slice(0, numItems);
        
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
     * Show "Worthy Opponent" as the final opponent
     */
    showWorthyOpponent() {
        // First start the slowdown animation
        this.matchmakingScreen.classList.remove('searching');
        this.matchmakingScreen.classList.add('slowing-down');
        
        // After the slowdown animation completes, show the final state
        setTimeout(() => {
            // Remove the slowing-down class and add match-found
            this.matchmakingScreen.classList.remove('slowing-down');
            this.matchmakingScreen.classList.add('match-found');
            
            // Clear the carousel and add only three items
            this.opponentCarousel.innerHTML = '';
            
            // Create three items: one above, Worthy Opponent in the center, and one below
            const randomOpponents = this.getRandomOpponents(2);
            
            // Create the items with better positioning
            const items = [
                { text: randomOpponents[0], angle: -30, opacity: 0.5, zIndex: 1 },
                { text: 'Worthy Opponent', angle: 0, opacity: 1, class: 'worthy-opponent-reveal', zIndex: 3 },
                { text: randomOpponents[1], angle: 30, opacity: 0.5, zIndex: 1 }
            ];
            
            items.forEach(item => {
                const element = document.createElement('div');
                element.className = 'opponent-item';
                if (item.class) {
                    element.classList.add(item.class);
                }
                element.textContent = item.text;
                
                // Better positioning to prevent overlap
                const translateZ = item.angle === 0 ? 50 : 30;
                element.style.transform = `rotateX(${item.angle}deg) translateZ(${translateZ}px)`;
                element.style.opacity = item.opacity;
                element.style.zIndex = item.zIndex;
                
                this.opponentCarousel.appendChild(element);
            });
        }, 3000); // Match the duration of the slowdown animation
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