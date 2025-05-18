# Heatstone

A Hearthstone-inspired matchmaking MVP with a 3D-ish spinning opponent finder and simulated matchmaking.

## Project Overview

This project implements a minimal fullstack application that mimics the Hearthstone matchmaking UI with:
- A 3D-ish spinning list of opponent types during matchmaking
- Loading tips display
- "Worthy opponent" when matched
- Basic room creation for two users
- Simple game UI after matching (player names and chat)

## Implementation Phases

### Phase 1 (Current)
- Frontend implementation with simulated connections using timers
- 3D spinning animation for opponent types
- Random loading tips
- Simulated matchmaking process
- Basic game UI with simulated chat

### Phase 2 (Planned)
- Backend implementation with Socket.io for real-time communication
- Real matchmaking with multiple users
- Real-time chat functionality
- Deployment options

## Project Structure

```
heatstone/
├── public/                  # Static frontend files
│   ├── index.html           # Main HTML file
│   ├── css/                 # CSS styles
│   │   └── style.css        # Main stylesheet
│   ├── js/                  # Client-side JavaScript
│   │   ├── main.js          # Main client logic
│   │   ├── matchmaking.js   # Matchmaking animation logic
│   │   └── game.js          # Basic game UI logic
│   └── assets/              # Images, fonts, etc.
│       └── images/          # Image assets
├── server.js                # Simple Express server (Phase 1)
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
   cd heatstone
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

## Development

For development with auto-restart on file changes:
```
npm run dev
```

## Features

- **Matchmaking Animation**: 3D-ish spinning list of opponent types
- **Loading Tips**: Random Hearthstone-style tips during matchmaking
- **Simulated Matchmaking**: Finds a match after a random time (5-15 seconds)
- **Game UI**: Simple UI showing player names and a chat interface
- **Simulated Chat**: Chat with a simulated opponent

## License

MIT