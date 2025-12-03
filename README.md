# 🦸 Superhero Dispatch Game

A complete, production-ready React-based dispatching game inspired by "Dispatch" with massive expansions. Manage a team of heroes, dispatch them to missions, and progress through 10 unique episodes.

![Game Screenshot](https://via.placeholder.com/800x400/1e293b/4fd1c7?text=Superhero+Dispatch+Game)

## 🎮 Features

### Core Gameplay
- **100+ Unique Heroes** across 7 classes (Brawler, Speedster, Tank, Diplomat, Genius, Elemental, Mystic)
- **5 Hero Stats**: Combat, Vigor, Mobility, Charisma, Intellect (max 15 per stat)
- **Mission System**: Random missions spawn with 1-4 hero slots, cryptic requirements, and time limits
- **10 Episode Campaign**: Progressive difficulty with unique storylines and hero unlocks
- **Team Selection**: Choose from preset teams or build your custom team of 6 heroes

### Hero System
- **Stat Progression**: Heroes start weak (1-5 per stat) and can be upgraded to max 15
- **XP & Leveling**: Heroes gain XP from missions and level up to earn skill points
- **Fatigue System**: Heroes need rest after missions
- **Relationship System**: Heroes have friends (synergy bonuses) and enemies (sabotage penalties)
- **4 Hero States**: Available, Busy, Returning, Resting

### Mission System
- **3 Mission Types**: Regular, Hacking (grid-based minigame), Conflict (choose between options)
- **Cryptic Requirements**: No explicit stat numbers - players must deduce from keywords
- **Dynamic Difficulty**: Missions scale from 1-8 stats (episodes 1-3) up to 15 (later episodes)
- **Time Pressure**: Missions have countdown timers (15-45 seconds)
- **Visual Mission Map**: City map with clickable mission markers

### UI/UX
- **Dark Cyberpunk Theme**: Neon accents, grid patterns, futuristic aesthetic
- **Pentagon Radar Charts**: Visual stat representation with clear boundaries
- **Character Portraits**: Class-based color coding and visual indicators
- **Smooth Animations**: Polished transitions and feedback
- **Responsive Design**: Works on desktop and laptop screens

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/superhero-dispatch-game.git
   cd superhero-dispatch-game
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Navigate to `http://localhost:3000` (or the port shown in terminal)
   - The game should open automatically

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
superhero-dispatch-game/
├── src/
│   ├── App.jsx          # Main game component with all logic
│   ├── main.jsx        # React entry point
│   └── index.css       # Tailwind CSS and custom styles
├── index-react.html    # HTML entry point
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── README.md           # This file
```

## 🎯 How to Play

### Starting a Game
1. Click **"New Game"** on the start screen
2. Select a **Preset Team** or build a **Custom Team** (6 heroes)
3. Read the **Episode Intro** and click "Start Episode"

### Gameplay Loop
1. **Missions appear** on the city map as blue circular markers
2. **Click a mission** to pause time and view details
3. **Select heroes** from the bottom roster (1-4 heroes based on mission slots)
4. **Click DISPATCH** to send heroes on the mission
5. **Wait 5-10 seconds** for mission completion
6. **View results** - success/failure, XP gained, hero comments
7. **Continue** dispatching missions until episode timer reaches 0:00

### Hero Management
- **Click any hero** in the roster to view/upgrade stats
- **Add skill points** to increase stats (max 15 per stat)
- **Monitor hero status**: Available, Busy, Returning, Resting
- **Watch relationships**: Friends work better together, enemies sabotage

### Mission Strategy
- **Read cryptic requirements** - keywords hint at needed stats
- **Match hero classes** to mission types:
  - Combat/Defense → Brawlers, Tanks
  - Pursuit/Stealth → Speedsters
  - Investigation/Negotiation → Genius, Diplomat
  - Rescue/Disaster → Balanced teams
- **Consider relationships** - pair friends, avoid enemies
- **Manage fatigue** - rest heroes between missions

## 🎨 Game Mechanics

### Hero Stats
- **Combat**: Physical fighting ability
- **Vigor**: Health and endurance
- **Mobility**: Speed and agility
- **Charisma**: Social and negotiation skills
- **Intellect**: Problem-solving and analysis

### Mission Requirements
Missions have hidden stat requirements that scale with:
- **Episode number** (1-3: 1-8 stats, 4+: up to 15)
- **Number of slots** (1 slot = lower reqs, 4 slots = higher reqs)
- **Mission type** (Combat missions need Combat/Vigor, etc.)

### Success Calculation
Mission success is calculated based on:
- Hero stats vs. mission requirements
- Synergy bonuses (friends paired together)
- Sabotage penalties (enemies paired together)
- Hero fatigue levels
- Class bonuses (Genius heroes get bonus)

### Progression
- **Episodes**: 10 unique episodes with increasing difficulty
- **Hero Unlocks**: 8-12 new heroes unlock per episode
- **XP & Leveling**: Heroes gain XP and level up
- **Skill Points**: Earned on level up, used to upgrade stats
- **Achievements**: Track successful missions, rank progression

## 🛠️ Technology Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library
- **No external APIs** - Fully self-contained
- **No localStorage** - All state managed in React

## 📝 Development

### Key Components
- `App.jsx`: Main game component with all logic
  - `gameReducer`: Centralized state management
  - `generateHeroes()`: Creates 100+ heroes with varied stats
  - `generateMission()`: Creates missions with scaling difficulty
  - `calculateSuccess()`: Mission success probability
  - Screen components: Start, TeamSelect, EpisodeIntro, Game, MissionDetail, HeroUpgrade, MissionComplete, EpisodeComplete, FinalResults

### State Management
- Uses `useReducer` for complex game state
- `useRef` for performance optimization (mission spawning)
- `useMemo` and `useCallback` for expensive calculations

### Performance Optimizations
- Memoized hero filtering
- Optimized game loop (1 second intervals)
- Efficient mission spawning (8-12 second intervals)
- Reduced re-renders with proper React hooks

## 🎮 Game Screens

1. **Start Screen**: Welcome screen with "New Game" button
2. **Team Selection**: Choose preset or custom team (6 heroes)
3. **Episode Intro**: Storyline and episode information
4. **Main Game**: City map with missions and hero roster
5. **Mission Detail**: Three-panel layout (Investigation, Details, Requirements)
6. **Hero Upgrade**: View stats, allocate skill points, see radar chart
7. **Mission Complete**: Performance results and hero comments
8. **Episode Complete**: Stats, unlocks, and progression
9. **Final Results**: Overall performance after 10 episodes

## 🐛 Known Issues

- None currently - game is production-ready!

## 🔮 Future Enhancements

Potential features for future versions:
- Save/Load game state
- More mission types
- Hero equipment system
- Multiplayer support
- Leaderboards
- More hero classes and abilities

## 📄 License

This project is open source and available for personal and educational use.

## 👤 Author

Created as a complete Dispatch game clone with expanded features.

## 🙏 Acknowledgments

- Inspired by the original "Dispatch" game
- Built with React, Vite, and Tailwind CSS
- Icons from Lucide React

---

**Enjoy dispatching heroes and saving the city! 🦸‍♂️🦸‍♀️**
