# Farcaster Friend Sync (FFS)

A real-time multiplayer game application featuring "Heatstone" - a strategic heat management game with Hearthstone-inspired matchmaking.

## Project Overview

Farcaster Friend Sync (FFS) is a fullstack application that combines:
- A Hearthstone-inspired matchmaking UI with 3D spinning animation
- Real-time multiplayer gameplay using Socket.io
- A strategic game called "Heatstone" where players manage heat levels

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
1. Matchmaking with spinning animation
2. 5-second countdown at game start
3. Players choose their first buff for free (+1 Heat Up or +1 Nice Ice)
4. Game begins with explanation of rules
5. Real-time gameplay until win/loss condition is met

## Implementation Status

### Completed
- Matchmaking UI with 3D spinning animation
- Socket.io backend for real-time communication
- Username system and chat functionality
- Room management and active room tracking

### In Progress
- Game UI implementation
- Game logic implementation
- Socket.io integration for game state

## Project Structure

```
ffs/
├── public/                  # Static frontend files
│   ├── index.html           # Main HTML file
│   ├── css/                 # CSS styles
│   │   └── style.css        # Main stylesheet
│   ├── js/                  # Client-side JavaScript
│       ├── main.js          # Main client logic
│       ├── matchmaking.js   # Matchmaking animation logic
│       ├── socket-client.js # Socket.io client functionality
│       └── game.js          # Game logic and UI
│   └── assets/              # Images, fonts, etc.
│       └── images/          # Image assets
├── server.js                # Express server with Socket.io
├── package.json             # Project dependencies
└── README.md                # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd ffs
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the server
   ```
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

### Testing with Multiple Devices

To test with multiple devices on the same network:
1. Find your computer's local IP address
2. On your computer, open http://localhost:3000
3. On other devices, open http://<your-local-ip>:3000
4. Enter usernames and click "Find Game" on both devices

## Features

- **Matchmaking Animation**: 3D spinning list of opponent types
- **Real-time Multiplayer**: Socket.io-based matchmaking and gameplay
- **Username System**: Custom usernames for players
- **Chat System**: Real-time chat between matched players
- **Strategic Gameplay**: Heat management with upgrades and strategy

## Future Enhancements

1. Game history and statistics
2. Additional upgrades and abilities
3. Matchmaking based on player skill
4. Tournament mode
5. Integration with Farcaster's social features

## License

MIT