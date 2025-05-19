# Farcaster Friend Sync (FFS) - Implementation Plan

## Project Overview

Farcaster Friend Sync (FFS) is a real-time multiplayer application that features "Heatstone" - a strategic game where players manage heat levels to defeat their opponents. The application includes a Hearthstone-inspired matchmaking UI and real-time communication between players.

## Game Mechanics: Heatstone

### Core Mechanics
- Each player has a stone (egg-shaped rock)
- Players start with 20 heat each
- Players can:
  - Click their own stone to increase heat (+1)
  - Click opponent's stone to decrease opponent's heat (-1)
- Win/Loss conditions:
  - If a player's heat reaches 0, they lose
  - If a player's heat reaches 100, they automatically win

### Upgrades
- "Heat Up": Increases heat-up power when clicking own stone
  - First purchase costs 10 heat
  - Subsequent purchases cost 10 more each time (20, 30, 40...)
  - Each purchase increases heat-up power by 1
- "Nice Ice": Increases cool-down power when clicking opponent's stone
  - First purchase costs 10 heat
  - Subsequent purchases cost 10 more each time (20, 30, 40...)
  - Each purchase increases cool-down power by 1

### Game Flow
1. Matchmaking (already implemented)
2. 5-second countdown at game start
3. Players choose their first buff for free (+1 Heat Up or +1 Nice Ice)
4. Game begins with explanation of rules
5. Real-time gameplay until win/loss condition is met

## Implementation Plan

### Phase 1: Update Existing Code (Already Completed)
- Matchmaking UI with 3D spinning animation
- Socket.io backend for real-time communication
- Username system and chat functionality

### Phase 2: Game UI Implementation
1. Create game field with two stones (egg-shaped rocks)
2. Add heat level displays for both players
3. Implement the initial buff selection screen
4. Design upgrade purchase buttons
5. Add game explanation overlay
6. Create win/loss screens

### Phase 3: Game Logic Implementation
1. Implement heat management system
   - Track heat levels for both players
   - Handle heat increase/decrease actions
2. Create upgrade system
   - Track upgrade levels for both players
   - Calculate costs for upgrades
   - Apply upgrade effects
3. Implement win/loss conditions
4. Add 5-second countdown timer
5. Create first buff selection logic

### Phase 4: Socket.io Integration
1. Update server to handle game state
   - Track game state for each room
   - Synchronize player actions
2. Implement client-side event handlers
   - Send player actions to server
   - Update UI based on opponent actions
3. Add game state synchronization
4. Implement game reset on rematch

## Technical Details

### Game State Structure
```javascript
{
  players: {
    [playerId1]: {
      heat: 20,
      heatUpLevel: 1, // After first buff selection
      niceIceLevel: 1, // After first buff selection
      heatUpCost: 10,
      niceIceCost: 10
    },
    [playerId2]: {
      heat: 20,
      heatUpLevel: 1,
      niceIceLevel: 1,
      heatUpCost: 10,
      niceIceCost: 10
    }
  },
  gamePhase: "buffSelection", // "buffSelection", "playing", "gameOver"
  countdown: 5,
  winner: null, // null, playerId1, or playerId2
  lastAction: null
}
```

### Socket.io Events
- `game_start`: Initialize game state
- `select_buff`: Player selects initial buff
- `click_stone`: Player clicks a stone (own or opponent's)
- `purchase_upgrade`: Player purchases an upgrade
- `game_state_update`: Server sends updated game state
- `game_over`: Game ends with a winner
- `rematch_request`: Player requests a rematch
- `rematch_accepted`: Both players agree to rematch

### UI Components
1. **Game Field**
   - Two interactive stones
   - Heat level displays
   - Player names and stats

2. **Upgrade Panel**
   - Heat Up button with cost
   - Nice Ice button with cost
   - Current upgrade levels

3. **Game Info**
   - Countdown timer
   - Game phase indicator
   - Action history

4. **Overlays**
   - Game explanation
   - Buff selection
   - Win/loss announcement

## Implementation Steps

### Step 1: Update Project Structure
- Rename project references
- Update README.md
- Create new game-related files

### Step 2: Create Game UI
- Design stone graphics
- Create heat displays
- Design upgrade buttons
- Implement buff selection screen

### Step 3: Implement Game Logic
- Create game state management
- Implement heat mechanics
- Add upgrade system
- Create win/loss detection

### Step 4: Connect UI to Socket.io
- Send player actions to server
- Update UI based on server events
- Synchronize game state

### Step 5: Testing and Refinement
- Test with multiple clients
- Balance game mechanics
- Fix any issues

## Future Enhancements
1. Game history and statistics
2. Additional upgrades and abilities
3. Matchmaking based on player skill
4. Tournament mode
5. Integration with Farcaster's social features