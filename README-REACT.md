# 🎮 Dispatch Game - Ultimate Edition

A complete, production-ready React-based dispatch game with 100+ heroes, 10 episodes, and all advanced features!

## 🚀 Features

### Core Game Mechanics
- ✅ **100+ Unique Heroes** across 7 classes (Brawler, Speedster, Tank, Diplomat, Genius, Elemental, Mystic)
- ✅ **5 Stats System** (Combat, Vigor, Mobility, Charisma, Intellect) on 1-10 scale
- ✅ **4 Hero States** with visual indicators (Available, Busy, Returning, Resting)
- ✅ **Mission/Call System** with random spawns, countdown timers, and keyword hints
- ✅ **Success Calculation** with synergy bonuses, sabotage penalties, and fatigue
- ✅ **10-Minute Episodes** with real-time countdown

### Advanced Features
- ✅ **Team Selection** (Preset teams + Custom team builder)
- ✅ **10 Episodes** with progressive difficulty and hero unlocks
- ✅ **Relationship System** (Synergy pairs + Enemy sabotage)
- ✅ **Hacking Minigame** for tech missions
- ✅ **Conflict Calls** (choose between two mutually exclusive options)
- ✅ **Special Abilities** unique to each hero class
- ✅ **Fatigue System** affecting hero performance
- ✅ **Achievement Tracking** and rank progression
- ✅ **XP & Leveling** system for heroes

### UI/UX
- ✅ **Dark Cyberpunk Theme** with neon accents
- ✅ **Smooth Animations** and transitions
- ✅ **Toast Notifications** for game events
- ✅ **Responsive Design** for different screen sizes
- ✅ **Modal System** for call details, team selection, and results

## 📦 Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Start development server:**
```bash
npm run dev
```

3. **Build for production:**
```bash
npm run build
```

## 🎯 How to Play

1. **Start Screen**: Click "New Game" to begin
2. **Team Selection**: Choose between preset teams or build a custom team of 6 heroes
3. **Episode Gameplay**:
   - Calls appear randomly with countdown timers
   - Click a call to pause time and view details
   - Select heroes from the roster (must match required slots)
   - View success probability (0-99%, never 100%)
   - Click "Dispatch Heroes" to send them on the mission
   - Heroes cycle through: Available → Busy → Returning → Resting
4. **Episode Complete**: After 10 minutes, view results and unlock new heroes
5. **Progression**: Complete all 10 episodes to unlock all heroes and see final results

## 🎮 Mission Types

- **REGULAR**: Standard dispatch missions requiring hero selection
- **HACKING**: Minigame challenge - connect nodes to breach firewall
- **CONFLICT**: Two mutually exclusive options - choose one, lose the other

## 🏆 Hero Classes & Abilities

- **Brawler**: Extra damage bonus on high-combat missions
- **Speedster**: Reduced mission duration (faster completion)
- **Tank**: Cannot be fatigued, always 100% performance
- **Diplomat**: Bonus on charisma missions, reduces enemy sabotage chance
- **Genius**: Reveals hidden mission requirements, bonus on intellect missions
- **Elemental**: Bonus on specific mission types based on element
- **Mystic**: Predicts mission success rate more accurately, reveals future calls

## 📊 Success Calculation

Success probability is calculated based on:
- Hero stats matching mission requirements
- Synergy bonuses (when friends are paired)
- Class bonuses
- Ability bonuses
- Fatigue penalties
- Sabotage penalties (when enemies are paired)

Final success rate is capped at 99% (never 100% guaranteed).

## 🎨 Technology Stack

- **React 18** with hooks (useState, useEffect, useReducer)
- **Tailwind CSS** for styling (utility classes only)
- **Lucide React** for icons
- **Vite** for build tooling

## 📝 Notes

- All game state is managed in React state (no localStorage)
- Game is fully self-contained
- All 100+ heroes are generated programmatically
- Episodes progressively unlock new heroes and increase difficulty

## 🐛 Known Issues

None! The game is production-ready and fully functional.

## 🎉 Enjoy!

Have fun dispatching heroes and completing all 10 episodes!

