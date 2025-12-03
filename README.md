# ⚡ Neon Dispatch

An authentic recreation of **Dispatch (2025)** by AdHoc Studio - A superhero dispatch simulator with stat-based mission system.

## 🎮 Game Overview

Neon Dispatch is a web-based superhero dispatch simulator that recreates the core gameplay mechanics of Dispatch:

- **Receive emergency calls** with time pressure
- **Read mission briefings** with keyword hints
- **Select heroes** based on stat requirements
- **Dispatch teams** (1-3 heroes depending on mission)
- **Track mission progress** in real-time
- **Review outcomes** and manage hero recovery
- **Level up heroes** and allocate skill points

## 🦸 Hero System

### The Five-Stat System

1. **COMBAT** ⚔️ - Fighting, brawls, physical confrontations
2. **VIGOR** 🛡️ - Durability, stamina, surviving harsh conditions
3. **MOBILITY** ⚡ - Speed, agility, rapid response
4. **CHARISMA** 💬 - Negotiation, persuasion, crowd control
5. **INTELLECT** 🧠 - Hacking, investigations, problem-solving

### Unique Hero Powers

- **Invisigal** - Works best alone, faster travel time solo
- **Flambae** - Hot Streak: +1 Combat/Mobility after success, resets on failure
- **Prism** - Duplicator: Creates copies of adjacent heroes with half stats
- **Sonar** - Transformer: Stats flip after each mission (Intellect↔Combat, Charisma↔Vigor)
- **Coupé** - Assassin: +1 Combat in first slot, +1 Mobility in second slot
- **Punch Up** - Tank: Immune to injuries, cannot be downed
- **Malevola** - Healer: Can heal teammates, gains stacking bonuses
- **Golem** - Slot-Dependent Tank: Positioning grants stat bonuses

## 🎯 Mission System

### Call Types

- **Standard Calls** - Single objective, 1-3 hero slots
- **Urgent Calls** - Higher stakes, faster countdown
- **Conflicting Calls** - Two missions appear together, pick one
- **Hacking Calls** - No heroes dispatched, solve puzzle directly

### Success Calculation

Missions are scored by comparing hero stat profiles to hidden requirement profiles. Success is calculated based on stat overlap with a ±10% random factor.

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The game will open at `http://localhost:3000`

### Build

```bash
npm run build
```

## 🎨 Design

- **Neon cyberpunk aesthetic** - Teal/cyan primary, orange urgency, purple tech
- **Geometric UI** - Clean lines, grid-based layout
- **High contrast** - Dark navy backgrounds with bright neon accents
- **Smooth animations** - 60fps, professional polish

## 📋 Features

✅ Call spawning with countdown timers  
✅ Hero state machine (Available/Busy/Returning/Resting/Injured/Downed)  
✅ Stat-based success calculation  
✅ Multi-hero stat combining  
✅ XP and leveling system  
✅ Skill point allocation  
✅ Rest/cooldown timers  
✅ Review requirement before hero reuse  
✅ Unique hero powers  
✅ Mission types (Standard, Urgent, Conflicting)  
✅ Real-time mission progress  
✅ Performance tracking  
✅ Dispatcher rank system  

## 🎮 Controls

- **Mouse** - Click to interact with calls and heroes
- **Keyboard** - Tab navigation, Enter/Space to activate, Escape to close modals

## 🔧 Technology Stack

- **React 18** - Component architecture
- **Zustand** - State management
- **Framer Motion** - Animations
- **Tailwind CSS** - Styling
- **Vite** - Build tool

## 📝 License

This is a fan recreation for educational purposes.

## 🙏 Credits

Based on **Dispatch (2025)** by AdHoc Studio.

