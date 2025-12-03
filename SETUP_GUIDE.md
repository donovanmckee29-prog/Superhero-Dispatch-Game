# 🎮 Complete Setup & Usage Guide

## 📁 Step 1: Verify Files

Make sure you have all these files in the same folder:
```
superhero-dispatch-game/
├── index.html          ✅ Main game file
├── styles.css          ✅ Game styling
├── characters.js       ✅ 120+ heroes database
├── game.js             ✅ Game logic & mechanics
├── README.md           ✅ Full documentation
├── QUICK_START.md      ✅ Quick reference
└── CHROME_FIX.md       ✅ Chrome troubleshooting
```

## 🚀 Step 2: Open the Game

### Method 1: Direct Open (Easiest)
1. **Right-click** `index.html`
2. Select **"Open with"** → **Google Chrome**
3. Game loads automatically!

### Method 2: Drag & Drop
1. Open **Google Chrome**
2. **Drag** `index.html` into the browser window
3. Done!

### Method 3: Local Server (Best Experience)
If you have issues, use a local server:

**Mac:**
```bash
cd /Users/donovan.mckee29/superhero-dispatch-game
python3 -m http.server 8000
```
Then open: `http://localhost:8000`

**Windows:**
```bash
cd path\to\superhero-dispatch-game
python -m http.server 8000
```
Then open: `http://localhost:8000`

## 🎯 Step 3: How the Game Works

### Random Mission System

**Missions spawn automatically!**
- New missions appear every **30 seconds** (60% chance)
- Each mission has a **timer** (2-5 minutes)
- If you don't accept a mission before the timer runs out, it **expires**
- Multiple missions can be available at once
- You'll see a **notification** when new missions arrive

### Hero Status System

Heroes have 4 statuses:
- 🟢 **Available** - Ready to dispatch
- 🔵 **Busy** - Currently on a mission
- 🟠 **Returning** - Coming back (30 sec cooldown)
- 🟢 **Resting** - Recovering (30 sec cooldown)

**After a mission:**
1. Hero is "Busy" during mission (2 seconds)
2. Then "Returning" for 30 seconds
3. Then "Resting" for 30 more seconds
4. Finally "Available" again

**You can only dispatch available heroes!**

## 🎮 Step 4: Playing the Game

### Building Your Team

1. **Click "Build Custom Team"** or **"Select Pre-made Team"**
2. **Select 8 heroes** (must be "Available" status)
3. **Team is ready!**

### Accepting Missions

1. **Watch the mission board** - missions appear with timers
2. **Click a mission card** to see details:
   - Required stats
   - Coverage zone
   - Time remaining
   - Rewards
3. **Check your team** - make sure they meet requirements
4. **Click "Dispatch Team"** to send them!

### Mission Success

**100% Coverage + Stats Met = Auto Success!**
- Perfect coverage guarantees victory
- No RNG needed

**Partial Coverage = RNG Roll**
- Coverage % = success chance
- Bouncing ball animation shows result
- Can still succeed with luck!

**Disruptions (25% chance)**
- Random events during missions
- 3 choices with hidden stat requirements
- Success/failure affects mission outcome

### Managing Multiple Missions

- **Prioritize** - Which missions are most important?
- **Check timers** - Don't let missions expire!
- **Manage heroes** - Some might be on cooldown
- **Balance** - Accept missions you can handle

## 💡 Pro Tips

1. **Watch the timers!**
   - Missions expire quickly
   - Red border = expiring soon (< 1 minute)
   - Accept missions before they expire

2. **Check hero availability**
   - Only "Available" heroes can be dispatched
   - Heroes need rest after missions
   - Plan your team rotations

3. **Balance your team**
   - Don't just pick strongest heroes
   - Consider coverage shapes
   - Mix different power types

4. **Mission priorities**
   - High reward missions = higher risk
   - Easy missions = quick credits
   - Time-sensitive = act fast!

5. **Upgrade strategically**
   - Level up heroes with skill points
   - Focus on stats your team uses
   - Max stats = 15 per stat

## 🔧 Troubleshooting

### Game Not Loading?
- Check all 4 files are in same folder
- Open browser console (F12) for errors
- Try hard refresh (Ctrl+Shift+R)

### Missions Not Appearing?
- Wait 30 seconds - they spawn automatically
- Check browser console for errors
- Refresh the page

### Heroes Not Available?
- They might be on cooldown
- Check their status (Available/Busy/Returning/Resting)
- Wait for cooldown to finish

### Missions Expiring Too Fast?
- This is by design! Adds urgency
- Accept missions quickly
- Multiple missions spawn, so you'll get more

## 📊 Game Features

✅ **120+ Unique Heroes** - Each with unique names, designs, stats, and coverage shapes
✅ **Random Mission Spawning** - Missions appear every 30 seconds
✅ **Mission Timers** - 2-5 minute expiration times
✅ **Hero Status System** - Available/Busy/Returning/Resting
✅ **Coverage Wheel** - Visual 36-slice wheel system
✅ **Stat System** - 5 stats (Vigor, Combat, Speed, Intellect, Charisma) out of 15
✅ **XP & Leveling** - Heroes gain XP and level up
✅ **Disruptions** - 25% chance with 3 choice options
✅ **Multiple Active Missions** - Juggle priorities
✅ **Procedural Generation** - Every mission is unique

## 🎉 You're Ready!

The game is now running with a **real-time random mission system** just like Dispatch!

- Missions spawn automatically
- Timers create urgency
- Hero management adds strategy
- Multiple missions create choices

**Enjoy dispatching your superhero teams!** 🦸‍♂️🦸‍♀️

