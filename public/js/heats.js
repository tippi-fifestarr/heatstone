/**
 * Heats.js
 * Heatstone game mechanics plugin for Farcaster Friend Sync
 */

class HeatstoneGame {
    constructor(gameManager) {
        // Reference to the game manager
        this.gameManager = gameManager;
        
        // Game state
        this.gameState = {
            players: {},
            gamePhase: "waiting", // waiting, buffSelection, countdown, playing, gameOver
            countdown: 5,
            winner: null,
            lastAction: null
        };
        
        // Game UI elements
        this.gameContent = null;
        this.playerStone = null;
        this.opponentStone = null;
        this.playerHeatDisplay = null;
        this.opponentHeatDisplay = null;
        this.upgradePanel = null;
        this.buffSelectionOverlay = null;
        this.countdownOverlay = null;
        this.gameOverOverlay = null;
    }
    
    /**
     * Initialize the game
     */
    initialize(playerId, opponentId) {
        this.playerId = playerId;
        this.opponentId = opponentId;
        
        // Initialize game state
        this.initializeGameState();
        
        // Create game UI
        this.createGameUI();
    }
    
    /**
     * Initialize the game state
     */
    initializeGameState() {
        // Create initial game state
        this.gameState = {
            players: {
                [this.playerId]: {
                    heat: 20,
                    heatUpLevel: 1,
                    niceIceLevel: 1,
                    heatUpCost: 10,
                    niceIceCost: 10
                },
                [this.opponentId]: {
                    heat: 20,
                    heatUpLevel: 1,
                    niceIceLevel: 1,
                    heatUpCost: 10,
                    niceIceCost: 10
                }
            },
            gamePhase: "waiting",
            countdown: 5,
            winner: null,
            lastAction: null
        };
    }
    
    /**
     * Create the game UI elements
     */
    createGameUI() {
        // Clear existing game content
        const existingGameContent = document.querySelector('.game-content');
        if (existingGameContent) {
            existingGameContent.remove();
        }
        
        // Create game content container
        this.gameContent = document.createElement('div');
        this.gameContent.className = 'game-content';
        
        // Create VS display
        const vsDisplay = document.createElement('div');
        vsDisplay.className = 'vs-display';
        vsDisplay.textContent = 'VS';
        this.gameContent.appendChild(vsDisplay);
        
        // Create game field
        const gameField = document.createElement('div');
        gameField.className = 'game-field';
        
        // Create player stone
        this.playerStone = document.createElement('div');
        this.playerStone.className = 'stone player-stone';
        this.playerStone.innerHTML = `
            <div class="stone-inner"></div>
            <div class="heat-display">
                <span class="heat-value">20</span>
                <span class="heat-label">HEAT</span>
            </div>
        `;
        this.playerStone.addEventListener('click', () => this.handleStoneClick('player'));
        
        // Create opponent stone
        this.opponentStone = document.createElement('div');
        this.opponentStone.className = 'stone opponent-stone';
        this.opponentStone.innerHTML = `
            <div class="stone-inner"></div>
            <div class="heat-display">
                <span class="heat-value">20</span>
                <span class="heat-label">HEAT</span>
            </div>
        `;
        this.opponentStone.addEventListener('click', () => this.handleStoneClick('opponent'));
        
        // Create player info
        const playerInfo = document.createElement('div');
        playerInfo.className = 'player-info';
        playerInfo.innerHTML = `
            <div class="player-name">${this.gameManager.getPlayerName()}</div>
            <div class="player-stats">
                <div class="stat heat-up-stat">Heat Up: <span class="heat-up-value">1</span></div>
                <div class="stat nice-ice-stat">Nice Ice: <span class="nice-ice-value">1</span></div>
            </div>
        `;
        
        // Create opponent info
        const opponentInfo = document.createElement('div');
        opponentInfo.className = 'opponent-info';
        opponentInfo.innerHTML = `
            <div class="player-name">${this.gameManager.getOpponentName()}</div>
            <div class="player-stats">
                <div class="stat heat-up-stat">Heat Up: <span class="heat-up-value">1</span></div>
                <div class="stat nice-ice-stat">Nice Ice: <span class="nice-ice-value">1</span></div>
            </div>
        `;
        
        // Create upgrade panel
        this.upgradePanel = document.createElement('div');
        this.upgradePanel.className = 'upgrade-panel';
        this.upgradePanel.innerHTML = `
            <button class="upgrade-btn heat-up-btn" disabled>
                Heat Up (+1)
                <span class="cost">10 HEAT</span>
            </button>
            <button class="upgrade-btn nice-ice-btn" disabled>
                Nice Ice (+1)
                <span class="cost">10 HEAT</span>
            </button>
        `;
        
        // Add event listeners to upgrade buttons
        const heatUpBtn = this.upgradePanel.querySelector('.heat-up-btn');
        const niceIceBtn = this.upgradePanel.querySelector('.nice-ice-btn');
        
        heatUpBtn.addEventListener('click', () => this.handleUpgrade('heatUp'));
        niceIceBtn.addEventListener('click', () => this.handleUpgrade('niceIce'));
        
        // Create a container for player's side (left side)
        const playerSide = document.createElement('div');
        playerSide.className = 'player-side';
        playerSide.appendChild(this.playerStone);
        playerSide.appendChild(playerInfo);
        
        // Create a container for opponent's side (right side)
        const opponentSide = document.createElement('div');
        opponentSide.className = 'opponent-side';
        opponentSide.appendChild(this.opponentStone);
        opponentSide.appendChild(opponentInfo);
        
        // Assemble the game field - player on left, opponent on right
        gameField.appendChild(playerSide);
        gameField.appendChild(opponentSide);
        
        // Assemble the game content
        this.gameContent.appendChild(gameField);
        this.gameContent.appendChild(this.upgradePanel);
        
        // Add game content to the game screen
        const gameScreen = document.getElementById('game-screen');
        const chatContainer = document.querySelector('.chat-container');
        if (gameScreen && chatContainer) {
            gameScreen.insertBefore(this.gameContent, chatContainer.previousElementSibling);
        }
        
        // Store references to heat displays
        this.playerHeatDisplay = this.playerStone.querySelector('.heat-value');
        this.opponentHeatDisplay = this.opponentStone.querySelector('.heat-value');
        
        // Create overlays (initially hidden)
        this.createOverlays();
    }
    
    /**
     * Create game overlays
     */
    createOverlays() {
        // Create buff selection overlay
        this.buffSelectionOverlay = document.createElement('div');
        this.buffSelectionOverlay.className = 'game-overlay buff-selection-overlay hidden';
        this.buffSelectionOverlay.innerHTML = `
            <div class="overlay-content">
                <h2>Choose Your First Buff</h2>
                <p>Select a free upgrade to start the game:</p>
                <div class="buff-options">
                    <button class="buff-btn heat-up-buff">
                        <h3>Heat Up</h3>
                        <p>Increase your heat-up power by 1</p>
                    </button>
                    <button class="buff-btn nice-ice-buff">
                        <h3>Nice Ice</h3>
                        <p>Increase your cool-down power by 1</p>
                    </button>
                </div>
            </div>
        `;
        
        // Add event listeners to buff buttons
        const heatUpBuff = this.buffSelectionOverlay.querySelector('.heat-up-buff');
        const niceIceBuff = this.buffSelectionOverlay.querySelector('.nice-ice-buff');
        
        heatUpBuff.addEventListener('click', () => this.selectBuff('heatUp'));
        niceIceBuff.addEventListener('click', () => this.selectBuff('niceIce'));
        
        // Create countdown overlay
        this.countdownOverlay = document.createElement('div');
        this.countdownOverlay.className = 'game-overlay countdown-overlay hidden';
        this.countdownOverlay.innerHTML = `
            <div class="overlay-content">
                <h2>Game Starting</h2>
                <div class="countdown">5</div>
                <div class="game-rules">
                    <p><strong>Game Rules:</strong></p>
                    <ul>
                        <li>Click your stone to increase your heat (+1)</li>
                        <li>Click opponent's stone to decrease their heat (-1)</li>
                        <li>If your heat reaches 0, you lose</li>
                        <li>If your heat reaches 100, you win</li>
                        <li>Buy upgrades to increase your powers</li>
                    </ul>
                </div>
            </div>
        `;
        
        // Create game over overlay
        this.gameOverOverlay = document.createElement('div');
        this.gameOverOverlay.className = 'game-overlay game-over-overlay hidden';
        this.gameOverOverlay.innerHTML = `
            <div class="overlay-content">
                <h2 class="game-result">Game Over</h2>
                <p class="game-reason"></p>
                <button class="rematch-btn">Rematch</button>
                <button class="return-btn">Return to Menu</button>
            </div>
        `;
        
        // Add event listeners to game over buttons
        const rematchBtn = this.gameOverOverlay.querySelector('.rematch-btn');
        const returnBtn = this.gameOverOverlay.querySelector('.return-btn');
        
        rematchBtn.addEventListener('click', () => this.gameManager.requestRematch());
        returnBtn.addEventListener('click', () => this.gameManager.returnToMainMenu());
        
        // Add overlays to the game screen
        const gameScreen = document.getElementById('game-screen');
        if (gameScreen) {
            gameScreen.appendChild(this.buffSelectionOverlay);
            gameScreen.appendChild(this.countdownOverlay);
            gameScreen.appendChild(this.gameOverOverlay);
        }
    }
    
    /**
     * Start the game
     */
    startGame(data = null) {
        console.log("HeatstoneGame.startGame called", data);
        
        // If data is provided, update the game state
        if (data && data.gameState) {
            this.updateGameState(data.gameState);
        }
        
        // Show buff selection overlay
        this.gameState.gamePhase = "buffSelection";
        this.showBuffSelectionOverlay();
        
        // Log the game state
        console.log("Game state:", this.gameState);
    }
    
    /**
     * Show buff selection overlay
     */
    showBuffSelectionOverlay() {
        // Make sure the overlay exists
        if (!this.buffSelectionOverlay) {
            this.createOverlays();
        }
        
        // Make sure the overlay is in the DOM
        const gameScreen = document.getElementById('game-screen');
        if (gameScreen && !gameScreen.contains(this.buffSelectionOverlay)) {
            gameScreen.appendChild(this.buffSelectionOverlay);
        }
        
        // Show the overlay
        this.buffSelectionOverlay.classList.remove('hidden');
        
        console.log("Showing buff selection overlay");
    }
    
    /**
     * Select a buff
     */
    selectBuff(buffType) {
        console.log("Selecting buff:", buffType);
        
        // Update player stats based on selected buff
        if (buffType === 'heatUp') {
            this.gameState.players[this.playerId].heatUpLevel += 1;
        } else if (buffType === 'niceIce') {
            this.gameState.players[this.playerId].niceIceLevel += 1;
        }
        
        // Hide buff selection overlay
        this.buffSelectionOverlay.classList.add('hidden');
        
        // Update UI
        this.updatePlayerStats();
        
        // Send buff selection to server if not in simulation mode
        if (!this.gameManager.isSimulation()) {
            this.gameManager.sendGameAction('select_buff', {
                buffType: buffType
            });
        } else {
            // In simulation mode, simulate opponent buff selection
            const opponentBuff = Math.random() > 0.5 ? 'heatUp' : 'niceIce';
            if (opponentBuff === 'heatUp') {
                this.gameState.players[this.opponentId].heatUpLevel += 1;
            } else {
                this.gameState.players[this.opponentId].niceIceLevel += 1;
            }
            
            // Update UI
            this.updatePlayerStats();
            
            // Start countdown
            this.startCountdown();
        }
    }
    
    /**
     * Start countdown
     */
    startCountdown() {
        console.log("Starting countdown");
        
        // Show countdown overlay
        this.countdownOverlay.classList.remove('hidden');
        
        // Set game phase
        this.gameState.gamePhase = "countdown";
        
        // Get countdown element
        const countdownElement = this.countdownOverlay.querySelector('.countdown');
        
        // Start countdown
        let count = 5;
        countdownElement.textContent = count;
        
        const countdownInterval = setInterval(() => {
            count--;
            countdownElement.textContent = count;
            console.log("Countdown:", count);
            
            if (count <= 0) {
                clearInterval(countdownInterval);
                
                // Hide countdown overlay
                this.countdownOverlay.classList.add('hidden');
                
                // Start playing phase
                this.startPlayingPhase();
            }
        }, 1000);
    }
    
    /**
     * Start playing phase
     */
    startPlayingPhase() {
        console.log("Starting playing phase");
        
        // Set game phase
        this.gameState.gamePhase = "playing";
        console.log("Game phase set to:", this.gameState.gamePhase);
        
        // Enable upgrade buttons
        this.updateUpgradeButtons();
        
        // Add system message
        this.gameManager.addSystemMessage("Game started! Click your stone to heat up, click opponent's stone to cool them down.");
        
        // In simulation mode, simulate opponent actions
        if (this.gameManager.isSimulation()) {
            this.startOpponentSimulation();
        }
    }
    
    /**
     * Start opponent simulation
     */
    startOpponentSimulation() {
        // Simulate opponent actions every 2-5 seconds
        const simulateAction = () => {
            // Only simulate if game is still in playing phase
            if (this.gameState.gamePhase !== "playing") return;
            
            // Randomly choose an action
            const action = Math.random();
            
            if (action < 0.6) {
                // Click own stone (60% chance)
                this.simulateOpponentClickStone('opponent');
            } else if (action < 0.9) {
                // Click player stone (30% chance)
                this.simulateOpponentClickStone('player');
            } else {
                // Buy upgrade (10% chance)
                this.simulateOpponentBuyUpgrade();
            }
            
            // Schedule next action
            const delay = 2000 + Math.random() * 3000;
            setTimeout(simulateAction, delay);
        };
        
        // Start simulation after a delay
        setTimeout(simulateAction, 3000);
    }
    
    /**
     * Simulate opponent clicking a stone
     */
    simulateOpponentClickStone(target) {
        if (target === 'opponent') {
            // Opponent clicks their own stone
            const heatUpPower = this.gameState.players[this.opponentId].heatUpLevel;
            this.gameState.players[this.opponentId].heat += heatUpPower;
            
            // Add message
            this.gameManager.addOpponentMessage(`I'm heating up! (+${heatUpPower})`);
        } else {
            // Opponent clicks player's stone
            const niceIcePower = this.gameState.players[this.opponentId].niceIceLevel;
            this.gameState.players[this.playerId].heat -= niceIcePower;
            
            // Add message
            this.gameManager.addOpponentMessage(`Cooling you down! (-${niceIcePower})`);
        }
        
        // Update UI
        this.updateHeatDisplays();
        
        // Check win/loss conditions
        this.checkWinLossConditions();
    }
    
    /**
     * Simulate opponent buying an upgrade
     */
    simulateOpponentBuyUpgrade() {
        const opponentHeat = this.gameState.players[this.opponentId].heat;
        const heatUpCost = this.gameState.players[this.opponentId].heatUpCost;
        const niceIceCost = this.gameState.players[this.opponentId].niceIceCost;
        
        // Check if opponent can afford any upgrade
        if (opponentHeat < Math.min(heatUpCost, niceIceCost)) {
            // Can't afford any upgrade, click own stone instead
            this.simulateOpponentClickStone('opponent');
            return;
        }
        
        // Randomly choose which upgrade to buy
        const buyHeatUp = Math.random() > 0.5;
        
        if (buyHeatUp && opponentHeat >= heatUpCost) {
            // Buy Heat Up upgrade
            this.gameState.players[this.opponentId].heat -= heatUpCost;
            this.gameState.players[this.opponentId].heatUpLevel += 1;
            this.gameState.players[this.opponentId].heatUpCost += 10;
            
            // Add message
            this.gameManager.addOpponentMessage(`I upgraded my Heat Up power! (Level ${this.gameState.players[this.opponentId].heatUpLevel})`);
        } else if (opponentHeat >= niceIceCost) {
            // Buy Nice Ice upgrade
            this.gameState.players[this.opponentId].heat -= niceIceCost;
            this.gameState.players[this.opponentId].niceIceLevel += 1;
            this.gameState.players[this.opponentId].niceIceCost += 10;
            
            // Add message
            this.gameManager.addOpponentMessage(`I upgraded my Nice Ice power! (Level ${this.gameState.players[this.opponentId].niceIceLevel})`);
        }
        
        // Update UI
        this.updateHeatDisplays();
        this.updatePlayerStats();
    }
    
    /**
     * Handle stone click
     */
    handleStoneClick(target) {
        console.log("Stone clicked:", target, "Game phase:", this.gameState.gamePhase);
        
        // Only allow clicks during playing phase
        if (this.gameState.gamePhase !== "playing") {
            console.log("Game not in playing phase, current phase:", this.gameState.gamePhase);
            return;
        }
        
        if (target === 'player') {
            // Player clicks own stone
            const heatUpPower = this.gameState.players[this.playerId].heatUpLevel;
            this.gameState.players[this.playerId].heat += heatUpPower;
            
            // Add message
            this.gameManager.addSystemMessage(`You heated up! (+${heatUpPower})`);
            console.log(`Player heated up by ${heatUpPower}, new heat:`, this.gameState.players[this.playerId].heat);
        } else {
            // Player clicks opponent stone
            const niceIcePower = this.gameState.players[this.playerId].niceIceLevel;
            this.gameState.players[this.opponentId].heat -= niceIcePower;
            
            // Add message
            this.gameManager.addSystemMessage(`You cooled down your opponent! (-${niceIcePower})`);
            console.log(`Opponent cooled down by ${niceIcePower}, new heat:`, this.gameState.players[this.opponentId].heat);
        }
        
        // Update UI
        this.updateHeatDisplays();
        this.updateUpgradeButtons();
        this.updatePlayerStats();
        
        // Send action to server if not in simulation mode
        if (!this.gameManager.isSimulation()) {
            this.gameManager.sendGameAction('click_stone', {
                target: target,
                gameState: this.gameState
            });
        }
        
        // Check win/loss conditions
        this.checkWinLossConditions();
    }
    
    /**
     * Handle upgrade purchase
     */
    handleUpgrade(upgradeType) {
        // Only allow upgrades during playing phase
        if (this.gameState.gamePhase !== "playing") return;
        
        const playerHeat = this.gameState.players[this.playerId].heat;
        
        if (upgradeType === 'heatUp') {
            const cost = this.gameState.players[this.playerId].heatUpCost;
            
            // Check if player can afford the upgrade
            if (playerHeat < cost) {
                this.gameManager.addSystemMessage(`Not enough heat! You need ${cost} heat to upgrade Heat Up.`);
                return;
            }
            
            // Purchase the upgrade
            this.gameState.players[this.playerId].heat -= cost;
            this.gameState.players[this.playerId].heatUpLevel += 1;
            this.gameState.players[this.playerId].heatUpCost += 10;
            
            // Add message
            this.gameManager.addSystemMessage(`You upgraded your Heat Up power! (Level ${this.gameState.players[this.playerId].heatUpLevel})`);
        } else if (upgradeType === 'niceIce') {
            const cost = this.gameState.players[this.playerId].niceIceCost;
            
            // Check if player can afford the upgrade
            if (playerHeat < cost) {
                this.gameManager.addSystemMessage(`Not enough heat! You need ${cost} heat to upgrade Nice Ice.`);
                return;
            }
            
            // Purchase the upgrade
            this.gameState.players[this.playerId].heat -= cost;
            this.gameState.players[this.playerId].niceIceLevel += 1;
            this.gameState.players[this.playerId].niceIceCost += 10;
            
            // Add message
            this.gameManager.addSystemMessage(`You upgraded your Nice Ice power! (Level ${this.gameState.players[this.playerId].niceIceLevel})`);
        }
        
        // Update UI
        this.updateHeatDisplays();
        this.updatePlayerStats();
        this.updateUpgradeButtons();
        
        // Send action to server if not in simulation mode
        if (!this.gameManager.isSimulation()) {
            this.gameManager.sendGameAction('purchase_upgrade', {
                upgradeType: upgradeType,
                gameState: this.gameState
            });
        }
        
        // Check win/loss conditions
        this.checkWinLossConditions();
    }
    
    /**
     * Update heat displays
     */
    updateHeatDisplays() {
        // Update player heat display
        const playerHeat = this.gameState.players[this.playerId].heat;
        this.playerHeatDisplay.textContent = playerHeat;
        
        // Update opponent heat display
        const opponentHeat = this.gameState.players[this.opponentId].heat;
        this.opponentHeatDisplay.textContent = opponentHeat;
        
        // Update heat display colors based on values
        this.updateHeatDisplayColors();
    }
    
    /**
     * Update heat display colors based on values
     */
    updateHeatDisplayColors() {
        // Get heat values
        const playerHeat = this.gameState.players[this.playerId].heat;
        const opponentHeat = this.gameState.players[this.opponentId].heat;
        
        // Update player heat color
        if (playerHeat <= 10) {
            this.playerHeatDisplay.style.color = '#ff4d4d'; // Red for low heat
        } else if (playerHeat >= 90) {
            this.playerHeatDisplay.style.color = '#ffcc00'; // Gold for high heat
        } else {
            this.playerHeatDisplay.style.color = '#ffffff'; // White for normal heat
        }
        
        // Update opponent heat color
        if (opponentHeat <= 10) {
            this.opponentHeatDisplay.style.color = '#ff4d4d'; // Red for low heat
        } else if (opponentHeat >= 90) {
            this.opponentHeatDisplay.style.color = '#ffcc00'; // Gold for high heat
        } else {
            this.opponentHeatDisplay.style.color = '#ffffff'; // White for normal heat
        }
    }
    
    /**
     * Update player stats
     */
    updatePlayerStats() {
        console.log("Updating player stats");
        
        // Update player stats
        const playerHeatUpLevel = this.gameState.players[this.playerId].heatUpLevel;
        const playerNiceIceLevel = this.gameState.players[this.playerId].niceIceLevel;
        
        const playerHeatUpStat = document.querySelector('.player-side .heat-up-value');
        const playerNiceIceStat = document.querySelector('.player-side .nice-ice-value');
        
        if (playerHeatUpStat) {
            playerHeatUpStat.textContent = playerHeatUpLevel;
            console.log("Updated player Heat Up to", playerHeatUpLevel);
        } else {
            console.warn("Could not find player Heat Up stat element");
        }
        
        if (playerNiceIceStat) {
            playerNiceIceStat.textContent = playerNiceIceLevel;
            console.log("Updated player Nice Ice to", playerNiceIceLevel);
        } else {
            console.warn("Could not find player Nice Ice stat element");
        }
        
        // Update opponent stats
        const opponentHeatUpLevel = this.gameState.players[this.opponentId].heatUpLevel;
        const opponentNiceIceLevel = this.gameState.players[this.opponentId].niceIceLevel;
        
        const opponentHeatUpStat = document.querySelector('.opponent-side .heat-up-value');
        const opponentNiceIceStat = document.querySelector('.opponent-side .nice-ice-value');
        
        if (opponentHeatUpStat) {
            opponentHeatUpStat.textContent = opponentHeatUpLevel;
            console.log("Updated opponent Heat Up to", opponentHeatUpLevel);
        } else {
            console.warn("Could not find opponent Heat Up stat element");
        }
        
        if (opponentNiceIceStat) {
            opponentNiceIceStat.textContent = opponentNiceIceLevel;
            console.log("Updated opponent Nice Ice to", opponentNiceIceLevel);
        } else {
            console.warn("Could not find opponent Nice Ice stat element");
        }
    }
    
    /**
     * Update upgrade buttons
     */
    updateUpgradeButtons() {
        // Only enable buttons during playing phase
        if (this.gameState.gamePhase !== "playing") {
            this.upgradePanel.querySelector('.heat-up-btn').disabled = true;
            this.upgradePanel.querySelector('.nice-ice-btn').disabled = true;
            return;
        }
        
        // Get player heat and upgrade costs
        const playerHeat = this.gameState.players[this.playerId].heat;
        const heatUpCost = this.gameState.players[this.playerId].heatUpCost;
        const niceIceCost = this.gameState.players[this.playerId].niceIceCost;
        
        // Update Heat Up button
        const heatUpBtn = this.upgradePanel.querySelector('.heat-up-btn');
        heatUpBtn.disabled = playerHeat < heatUpCost;
        heatUpBtn.querySelector('.cost').textContent = `${heatUpCost} HEAT`;
        
        // Update Nice Ice button
        const niceIceBtn = this.upgradePanel.querySelector('.nice-ice-btn');
        niceIceBtn.disabled = playerHeat < niceIceCost;
        niceIceBtn.querySelector('.cost').textContent = `${niceIceCost} HEAT`;
    }
    
    /**
     * Check win/loss conditions
     */
    checkWinLossConditions() {
        const playerHeat = this.gameState.players[this.playerId].heat;
        const opponentHeat = this.gameState.players[this.opponentId].heat;
        
        // Check if player lost (heat <= 0)
        if (playerHeat <= 0) {
            this.gameState.gamePhase = "gameOver";
            this.gameState.winner = this.opponentId;
            this.showGameOver(this.opponentId, "Your heat reached 0!");
            return;
        }
        
        // Check if player won (heat >= 100)
        if (playerHeat >= 100) {
            this.gameState.gamePhase = "gameOver";
            this.gameState.winner = this.playerId;
            this.showGameOver(this.playerId, "Your heat reached 100!");
            return;
        }
        
        // Check if opponent lost (heat <= 0)
        if (opponentHeat <= 0) {
            this.gameState.gamePhase = "gameOver";
            this.gameState.winner = this.playerId;
            this.showGameOver(this.playerId, "Opponent's heat reached 0!");
            return;
        }
        
        // Check if opponent won (heat >= 100)
        if (opponentHeat >= 100) {
            this.gameState.gamePhase = "gameOver";
            this.gameState.winner = this.opponentId;
            this.showGameOver(this.opponentId, "Opponent's heat reached 100!");
            return;
        }
    }
    
    /**
     * Show game over overlay
     */
    showGameOver(winnerId, reason) {
        // Update game over overlay
        const resultElement = this.gameOverOverlay.querySelector('.game-result');
        const reasonElement = this.gameOverOverlay.querySelector('.game-reason');
        
        if (winnerId === this.playerId) {
            resultElement.textContent = "You Win!";
            resultElement.style.color = "#ffcc00";
        } else {
            resultElement.textContent = "You Lose!";
            resultElement.style.color = "#ff4d4d";
        }
        
        reasonElement.textContent = reason;
        
        // Show game over overlay
        this.gameOverOverlay.classList.remove('hidden');
        
        // Add system message
        this.gameManager.addSystemMessage(`Game over! ${winnerId === this.playerId ? 'You win!' : 'You lose!'} ${reason}`);
        
        // Send game over to server if not in simulation mode
        if (!this.gameManager.isSimulation()) {
            this.gameManager.sendGameAction('game_over', {
                winner: winnerId,
                reason: reason
            });
        }
    }
    
    /**
     * Update game state
     */
    updateGameState(newState) {
        this.gameState = newState;
        
        // Update UI
        this.updateHeatDisplays();
        this.updatePlayerStats();
        this.updateUpgradeButtons();
    }
    
    /**
     * Get current game state
     */
    getGameState() {
        return this.gameState;
    }
}

// Export the HeatstoneGame class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HeatstoneGame;
} else {
    window.HeatstoneGame = HeatstoneGame;
}