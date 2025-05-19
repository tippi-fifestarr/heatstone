# Heatstone: Seamless Animation and Farcaster Integration Plan

## 1. Immediate Improvements: Seamless Animation

### Current Issues
- The transition to "Worthy Opponent" isn't seamless
- We're clearing and recreating elements during the transition
- The animation timing needs refinement

### Proposed Changes

#### A. State Management with Variables
```javascript
// In matchmaking.js
class MatchmakingManager {
    constructor() {
        // ...existing code...
        
        // State variables
        this.matchFound = false;
        this.matchType = null; // Will be "Worthy Opponent" for now, customizable later
    }
    
    // Methods to update state
    setMatchFound(found, type = "Worthy Opponent") {
        this.matchFound = found;
        this.matchType = type;
        
        // Update UI based on state
        if (found) {
            this.startSlowdownAnimation();
        }
    }
}
```

#### B. Seamless Animation Transition
Instead of clearing and recreating the carousel, we'll:
1. Keep the existing carousel items during slowdown
2. Gradually position "Worthy Opponent" in the center
3. Use CSS transitions for smoother effects

```javascript
// In matchmaking.js
startSlowdownAnimation() {
    // Start slowdown without clearing the carousel
    this.matchmakingScreen.classList.remove('searching');
    this.matchmakingScreen.classList.add('slowing-down');
    
    // Inject "Worthy Opponent" into the carousel at the right position
    // without removing existing items
    this.injectWorthyOpponent();
    
    // After slowdown completes, finalize the state
    setTimeout(() => {
        this.matchmakingScreen.classList.remove('slowing-down');
        this.matchmakingScreen.classList.add('match-found');
        this.finalizeWorthyOpponent();
    }, 2000);
}

injectWorthyOpponent() {
    // Find the right position to inject "Worthy Opponent"
    // This will be calculated based on the current rotation
    // and timed to appear at the center when the animation ends
}

finalizeWorthyOpponent() {
    // Keep only 3 items: Worthy Opponent and one above/below
    // Apply the worthy-opponent-reveal animation
}
```

#### C. CSS Improvements
```css
/* Improved animation keyframes */
@keyframes slowdownSpin {
    0% {
        transform: rotateX(0deg);
    }
    70% {
        transform: rotateX(720deg);
        animation-timing-function: cubic-bezier(0.2, 0.9, 0.3, 1.0);
    }
    90% {
        transform: rotateX(1075deg);
    }
    100% {
        transform: rotateX(1080deg);
    }
}

/* Transition for opponent items */
.opponent-item {
    transition: opacity 0.5s, transform 0.5s;
}

/* Special styling for the worthy opponent during reveal */
.opponent-item.worthy {
    color: #ffcc00;
    text-shadow: 0 0 10px rgba(255, 204, 0, 0.7);
    font-size: 32px;
}
```

## 2. Farcaster Mini App Integration

Based on the Farcaster Mini Apps documentation, we need to prepare our app for integration with the Farcaster ecosystem.

### Key Concepts
- Farcaster mini apps are web apps built with HTML, CSS, and JavaScript
- They can use the Frames SDK to access native Farcaster features
- They can be created using any web framework

### Integration Strategy

#### A. Modular Architecture
Restructure the code to separate core functionality from platform-specific code:

```
heatstone/
├── src/
│   ├── core/                 # Platform-agnostic core functionality
│   │   ├── matchmaking.js    # Core matchmaking logic
│   │   ├── game.js           # Core game logic
│   │   └── types.js          # Shared types and interfaces
│   ├── platforms/
│   │   ├── browser/          # Browser-specific implementation
│   │   └── farcaster/        # Farcaster-specific implementation (future)
│   └── main.js               # Entry point that loads appropriate platform
```

#### B. Prepare for Farcaster SDK
Add configuration options for Farcaster integration:

```javascript
// In a new config.js file
export const config = {
    platform: 'browser', // or 'farcaster'
    matchTypes: {
        default: 'Worthy Opponent',
        alternatives: [
            'Sneaky Rogue',
            'Wise Shaman',
            // ...other opponent types
        ]
    },
    // Farcaster-specific settings (for future use)
    farcaster: {
        appName: 'Heatstone',
        // Other Farcaster-specific settings
    }
};
```

#### C. Implementation Steps

1. **Phase 1: Refactor Current Code**
   - Implement the seamless animation transition
   - Add state variables (matchFound, matchType)
   - Improve the CSS animations

2. **Phase 2: Modularize Architecture**
   - Separate core functionality from platform-specific code
   - Create interfaces for platform implementations
   - Implement the browser platform adapter

3. **Phase 3: Farcaster Integration**
   - Install the Farcaster Frames SDK
   - Implement the Farcaster platform adapter
   - Add Farcaster-specific features (authentication, etc.)

## 3. Technical Implementation Details

### Seamless Animation Implementation

The key to making the animation seamless is to:

1. **Maintain Continuity**: Don't clear and recreate elements during transitions
2. **Use CSS Transitions**: For smooth opacity and transform changes
3. **Time the Animations**: Ensure the slowdown and reveal are perfectly timed

```javascript
// Example implementation for injectWorthyOpponent
injectWorthyOpponent() {
    // Calculate the current rotation
    const currentRotation = /* calculation based on animation progress */;
    
    // Find the item that will be at the center when the animation ends
    const items = this.opponentCarousel.querySelectorAll('.opponent-item');
    const targetIndex = /* calculation based on currentRotation */;
    
    // Replace that item's text with "Worthy Opponent"
    // but keep it in the same position
    if (items[targetIndex]) {
        items[targetIndex].textContent = this.matchType;
        items[targetIndex].dataset.isWorthy = 'true';
    }
}

// Example implementation for finalizeWorthyOpponent
finalizeWorthyOpponent() {
    const items = this.opponentCarousel.querySelectorAll('.opponent-item');
    const worthyItem = this.opponentCarousel.querySelector('[data-is-worthy="true"]');
    
    if (worthyItem) {
        // Find items to keep (one above, worthy, one below)
        const worthyIndex = Array.from(items).indexOf(worthyItem);
        const keepIndices = [
            (worthyIndex - 1 + items.length) % items.length,
            worthyIndex,
            (worthyIndex + 1) % items.length
        ];
        
        // Hide all other items
        items.forEach((item, index) => {
            if (!keepIndices.includes(index)) {
                item.style.opacity = '0';
            }
        });
        
        // Apply special styling to worthy opponent
        worthyItem.classList.add('worthy', 'worthy-opponent-reveal');
    }
}
```

### Farcaster Integration Details

Be sure to ask me for access to Farcaster LLMs.txt

```text
Getting Started with farcaster
Overview
Mini apps are web apps built with HTML, CSS, and Javascript that can be discovered and used within Farcaster clients. You can use an SDK to access native Farcaster features, like authentication, sending notifications, and interacting with the user's wallet.

Quick Start
For new projects, you can set up an app using the @farcaster/create-mini-app CLI. This will prompt you to set up a project for your app.

npm
pnpm
yarn

npm create @farcaster/mini-app
Remember, you can use whatever your favorite web framework is to build Mini Apps so if these options aren't appealing you can setup the SDK in your own project by following the instructions below.

Manual Setup
For existing projects, install the Frames SDK:

Package Manager
npm
pnpm
yarn

npm install @farcaster/frame-sdk
CDN
If you're not using a package manager, you can also use the Frame SDK via an ESM-compatible CDN such as esm.sh. Simply add a <script type="module"> tag to the bottom of your HTML file with the following content.


<script type="module">
  import { sdk } from 'https://esm.sh/@farcaster/frame-sdk'
</script>
Building with AI
These docs are LLM friendly so that you use the latest models to build your applications.

Use the Ask in ChatGPT buttons available on each page to interact with the documentation.
Use the llms-full.txt to keep your LLM up to date with these docs:
setup mini app docs in cursor
Adding the Mini App docs to Cursor

How does this work?
This entire site is converted into a single markdown doc that can fit inside the context window of most LLMs. See The /llms.txt file standards proposal for more information.

Next Steps
You'll need to do a few more things before distributing your app to users:

publish the app by providing information about who created it and how it should displayed
make it sharable in feeds
```

To prepare for Farcaster integration, we'll:

1. **Create Platform Adapters**: Abstract platform-specific functionality
2. **Define Clear Interfaces**: Ensure consistent behavior across platforms
3. **Use Feature Detection**: Determine available features at runtime

```javascript
// Example platform interface
class PlatformAdapter {
    constructor(config) {
        this.config = config;
    }
    
    // Platform capabilities
    async initialize() { /* Abstract method */ }
    async authenticate() { /* Abstract method */ }
    async createMatch() { /* Abstract method */ }
    async joinMatch(matchId) { /* Abstract method */ }
    
    // Feature detection
    hasFeature(featureName) { /* Abstract method */ }
}

// Browser implementation
class BrowserAdapter extends PlatformAdapter {
    async initialize() {
        // Browser-specific initialization
        console.log('Browser platform initialized');
        return true;
    }
    
    // Other implementations...
}

// Farcaster implementation (future)
class FarcasterAdapter extends PlatformAdapter {
    async initialize() {
        // Import Farcaster SDK
        try {
            const { sdk } = await import('https://esm.sh/@farcaster/frame-sdk');
            this.sdk = sdk;
            console.log('Farcaster platform initialized');
            return true;
        } catch (error) {
            console.error('Failed to initialize Farcaster SDK', error);
            return false;
        }
    }
    
    // Other implementations using Farcaster SDK...
}
```

## 4. Next Steps

1. Implement the seamless animation transition
2. Add state variables for match status and type
3. Refactor the code to prepare for modularization
4. Test the improved animation and transitions
5. Begin planning for the Socket.io backend implementation