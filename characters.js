// Coverage Shape Generator Functions
// Each function returns an array of slice indices (0-35) that the hero covers on the 36-slice wheel
const coverageShapes = {
    // Wide arc covering early section
    wideArcEarly: (start = 0, end = 70) => {
        const slices = [];
        for (let i = Math.floor(start / 10); i <= Math.floor(end / 10); i++) {
            slices.push(i % 36);
        }
        return slices;
    },
    // Deep block covering mid-section (also covers center)
    deepBlock: (start = 60, end = 110) => {
        const slices = [];
        for (let i = Math.floor(start / 10); i <= Math.floor(end / 10); i++) {
            slices.push(i % 36);
        }
        slices.push(36); // Center marker
        return slices;
    },
    // Long diagonal slash
    diagonalSlash: (start = 120, end = 180) => {
        const slices = [];
        for (let i = Math.floor(start / 10); i <= Math.floor(end / 10); i++) {
            slices.push(i % 36);
        }
        return slices;
    },
    // Compact center circle only
    centerCircle: () => [36],
    // Sharp wedge
    sharpWedge: (start = 190, end = 230) => {
        const slices = [];
        for (let i = Math.floor(start / 10); i <= Math.floor(end / 10); i++) {
            slices.push(i % 36);
        }
        return slices;
    },
    // Full arc
    fullArc: (start = 0, end = 180) => {
        const slices = [];
        for (let i = Math.floor(start / 10); i <= Math.floor(end / 10); i++) {
            slices.push(i % 36);
        }
        return slices;
    },
    // Thin line
    thinLine: (start = 0, end = 20) => {
        const slices = [];
        for (let i = Math.floor(start / 10); i <= Math.floor(end / 10); i++) {
            slices.push(i % 36);
        }
        return slices;
    },
    // Large circle (top section + center)
    largeCircle: () => {
        const slices = [];
        for (let i = 0; i < 12; i++) {
            slices.push(i);
        }
        slices.push(36); // Center
        return slices;
    },
    // Bottom arc
    bottomArc: () => {
        const slices = [];
        for (let i = 18; i < 30; i++) {
            slices.push(i);
        }
        return slices;
    },
    // Scattered islands
    scattered: () => [0, 5, 10, 15, 20, 25, 30],
    // Spiral pattern
    spiral: () => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
    // Top arc
    topArc: () => {
        const slices = [];
        for (let i = 0; i < 18; i++) {
            slices.push(i);
        }
        return slices;
    },
    // Side arc (left)
    leftArc: () => {
        const slices = [];
        for (let i = 9; i < 18; i++) {
            slices.push(i);
        }
        return slices;
    },
    // Side arc (right)
    rightArc: () => {
        const slices = [];
        for (let i = 18; i < 27; i++) {
            slices.push(i);
        }
        return slices;
    }
};

// Helper function to generate stats based on power type (Dispatch-style: 1-10 range)
function generateInitialStats(powerType = null) {
    const baseStats = {
        combat: Math.floor(Math.random() * 5) + 1, // 1-5
        vigor: Math.floor(Math.random() * 5) + 1,
        mobility: Math.floor(Math.random() * 5) + 1,
        charisma: Math.floor(Math.random() * 5) + 1,
        intellect: Math.floor(Math.random() * 5) + 1
    };
    
    // Boost stats based on power type
    if (powerType) {
        switch(powerType) {
            case 'strength':
                baseStats.combat = Math.min(10, baseStats.combat + Math.floor(Math.random() * 4) + 2);
                baseStats.vigor = Math.min(10, baseStats.vigor + Math.floor(Math.random() * 3) + 1);
                break;
            case 'speed':
                baseStats.mobility = Math.min(10, baseStats.mobility + Math.floor(Math.random() * 4) + 2);
                baseStats.combat = Math.min(10, baseStats.combat + Math.floor(Math.random() * 2) + 1);
                break;
            case 'energy':
                baseStats.combat = Math.min(10, baseStats.combat + Math.floor(Math.random() * 3) + 1);
                baseStats.intellect = Math.min(10, baseStats.intellect + Math.floor(Math.random() * 3) + 1);
                break;
            case 'tech':
                baseStats.intellect = Math.min(10, baseStats.intellect + Math.floor(Math.random() * 4) + 2);
                baseStats.combat = Math.min(10, baseStats.combat + Math.floor(Math.random() * 2) + 1);
                break;
            case 'magic':
                baseStats.intellect = Math.min(10, baseStats.intellect + Math.floor(Math.random() * 3) + 1);
                baseStats.charisma = Math.min(10, baseStats.charisma + Math.floor(Math.random() * 3) + 1);
                break;
            case 'mental':
                baseStats.intellect = Math.min(10, baseStats.intellect + Math.floor(Math.random() * 4) + 2);
                baseStats.charisma = Math.min(10, baseStats.charisma + Math.floor(Math.random() * 2) + 1);
                break;
            case 'elemental':
                baseStats.combat = Math.min(10, baseStats.combat + Math.floor(Math.random() * 2) + 1);
                baseStats.intellect = Math.min(10, baseStats.intellect + Math.floor(Math.random() * 2) + 1);
                baseStats.vigor = Math.min(10, baseStats.vigor + Math.floor(Math.random() * 2) + 1);
                break;
        }
    }
    
    return baseStats;
}

// Character Database - 100+ Unique Superheroes
// Stats are out of 15, starting with max 5 per stat
const characters = [
    // Strength/Vigor-based heroes
    { id: 1, name: "Kronos the Unbreakable", power: "strength", powerType: "Titanic Might", 
      ...generateInitialStats('strength'), level: 1, xp: 0, xpToNext: 100,
      coverageShape: coverageShapes.deepBlock(0, 80),
      design: "A towering figure encased in obsidian armor with glowing amber runes. His fists are wrapped in chains that pulse with raw power. Eyes burn like molten gold." },
    
    { id: 2, name: "Ironforge", power: "strength", powerType: "Living Metal", 
      ...generateInitialStats('strength'), level: 1, xp: 0, xpToNext: 100,
      coverageShape: coverageShapes.deepBlock(60, 110),
      design: "A humanoid construct of shifting metallic plates. Silver and chrome body with exposed energy cores. Moves with mechanical precision, leaving metallic echoes." },
    
    { id: 3, name: "Wrathbringer", power: "strength", powerType: "Berserker Rage", 
      ...generateInitialStats('strength'), level: 1, xp: 0, xpToNext: 100,
      coverageShape: coverageShapes.fullArc(0, 120),
      design: "A hulking warrior with crimson skin and black tribal tattoos. Eyes glow red when enraged. Wields a massive battle-axe forged from shadow and flame." },
    
    { id: 4, name: "Atlas the World-Bearer", power: "strength", powerType: "Cosmic Burden", 
      ...generateInitialStats('strength'), level: 1, xp: 0, xpToNext: 100,
      coverageShape: coverageShapes.deepBlock(30, 90),
      design: "A stoic giant with constellations mapped across his skin. Carries the weight of worlds on his shoulders, literally. Bronze armor with starfield patterns." },
    
    { id: 5, name: "Colossus Prime", power: "strength", powerType: "Titan Form", 
      ...generateInitialStats('strength'), level: 1, xp: 0, xpToNext: 100,
      coverageShape: coverageShapes.largeCircle(),
      design: "A massive stone golem with crystalline growths. Each step shakes the ground. Ancient runes carved into his body glow with inner light." },
    
    { id: 6, name: "Heracles the Divine", power: "strength", powerType: "Godly Strength", 
      ...generateInitialStats('strength'), level: 1, xp: 0, xpToNext: 100,
      coverageShape: coverageShapes.fullArc(0, 180),
      design: "A demigod with golden laurel crown and lion-skin cloak. Muscles ripple with divine energy. Wields the legendary Nemean mace." },
    
    { id: 7, name: "Brutefist", power: "strength", powerType: "Crushing Force", 
      ...generateInitialStats('strength'), level: 1, xp: 0, xpToNext: 100,
      coverageShape: coverageShapes.deepBlock(45, 95),
      design: "A brawler with knuckle-dusters made of pure force. Scars cover his body like a map of battles. Wears a tattered champion's belt." },
    
    { id: 8, name: "Stonecrusher", power: "strength", powerType: "Earth Shatter", 
      ...generateInitialStats('strength'), level: 1, xp: 0, xpToNext: 100,
      coverageShape: coverageShapes.sharpWedge(90, 150),
      design: "A warrior fused with stone and earth. Granite skin with veins of magma. Each strike causes seismic tremors." },
    
    // Speed-based heroes
    { id: 9, name: "Velocity Zero", power: "speed", powerType: "Time Dilation", 
      ...generateInitialStats('speed'), level: 1, xp: 0, xpToNext: 100,
      coverageShape: coverageShapes.diagonalSlash(0, 180),
      design: "A sleek figure in a blue and silver suit that seems to phase in and out of reality. Leaves afterimages in his wake. Chronometer displays on his gauntlets." },
    
    { id: 10, name: "Thunderstrike", power: "speed", powerType: "Lightning Dash", 
      ...generateInitialStats('speed'), level: 1, xp: 0, xpToNext: 100,
      coverageShape: coverageShapes.diagonalSlash(90, 270),
      design: "A hero crackling with electric energy. Yellow and white costume with lightning bolt patterns. Hair stands on end, charged with static." },
    
    { id: 11, name: "Mercury Flash", power: "speed", powerType: "Quantum Speed", 
      ...generateInitialStats('speed'), level: 1, xp: 0, xpToNext: 100,
      coverageShape: coverageShapes.thinLine(0, 360),
      design: "A liquid metal form that flows like quicksilver. Reflective surface shifts colors. Moves in impossible angles, defying physics." },
    
    { id: 12, name: "Sonic Wave", power: "speed", powerType: "Sound Barrier", 
      ...generateInitialStats('speed'), level: 1, xp: 0, xpToNext: 100,
      coverageShape: coverageShapes.wideArcEarly(0, 120),
      design: "A hero surrounded by visible sound waves. Purple and cyan costume with speaker-like devices. Creates sonic booms with every movement." },
    
    { id: 13, name: "Blurr", power: "speed", powerType: "Motion Blur", 
      ...generateInitialStats('speed'), level: 1, xp: 0, xpToNext: 100,
      coverageShape: coverageShapes.scattered(),
      design: "A figure that exists in multiple places at once. Translucent form with shifting opacity. Impossible to track visually." },
    
    { id: 14, name: "Windrunner", power: "speed", powerType: "Gale Force", 
      ...generateInitialStats('speed'), level: 1, xp: 0, xpToNext: 100,
      coverageShape: coverageShapes.diagonalSlash(180, 300),
      design: "A hero wrapped in swirling winds. Green and white costume with feather patterns. Leaves trails of compressed air." },
    
    { id: 15, name: "Chronos Breaker", power: "speed", powerType: "Time Fracture", 
      ...generateInitialStats('speed'), level: 1, xp: 0, xpToNext: 100,
      coverageShape: coverageShapes.spiral(),
      design: "A figure existing outside normal time. Clockwork mechanisms visible through transparent skin. Moves through frozen moments." },
    
    { id: 16, name: "Dashfire", power: "speed", powerType: "Burst Speed", 
      ...generateInitialStats('speed'), level: 1, xp: 0, xpToNext: 100,
      coverageShape: coverageShapes.thinLine(0, 40),
      design: "A hero leaving trails of fire. Orange and red costume with flame patterns. Each dash ignites the air behind them." }
];

// Generate 120 unique character names using combinations
const namePrefixes = [
    "Nexus", "Stellar", "Quantum", "Crimson", "Azure", "Shadow", "Frost", "Ember", "Void", "Star",
    "Thunder", "Ice", "Flame", "Storm", "Earth", "Mind", "Soul", "Blood", "Dark", "Light",
    "Chaos", "Order", "Time", "Space", "Reality", "Nova", "Solar", "Lunar", "Cosmic", "Galaxy",
    "Nebula", "Phantom", "Ghost", "Spirit", "Death", "Life", "Heal", "Destroy", "Annihilate", "Obliterate",
    "Protect", "Guard", "Shield", "Defend", "Hunt", "Track", "Scout", "Ranger", "Path", "Assassin",
    "Stealth", "War", "Fight", "Berserk", "Gladiate", "Mage", "Wizard", "Sorcer", "Warlock", "Enchant",
    "Tech", "Cyber", "Digital", "Code", "System", "Element", "Nature", "Beast", "Wild", "Mech",
    "Psych", "Tele", "Brain", "Energy", "Power", "Force", "Speed", "Quick", "Flash", "Lightning"
];

const nameSuffixes = [
    "Void", "Drift", "Echo", "Tempest", "Phantom", "Weave", "Veil", "Strike", "Walker", "Forge",
    "Claw", "Shard", "Dancer", "Rider", "Core", "Breaker", "Reaper", "Moon", "Star", "Bringer",
    "Blade", "Keeper", "Bender", "Warp", "Burst", "Flare", "Tide", "Eye", "Storm", "Hole",
    "Strike", "Rider", "Guide", "Keeper", "Whisper", "Giver", "Master", "Restore", "Revive", "Renew",
    "Eradicator", "Eliminator", "Bearer", "Defender", "Warden", "Finder", "Shadow", "Invisible", "Champion", "Enchanter",
    "Lord", "Ghost", "Breaker", "Override", "Caller", "Friend", "One", "Inventor", "Creator", "Builder",
    "Reader", "Seer", "Wave", "Surge", "Field", "Wall", "Barrier", "Demon", "Silver", "Step", "Fast", "Sonic"
];

// Generate 120 unique names BEFORE the character loop
const uniqueNames = [];
const usedNames = new Set();
for (let i = 0; i < 120; i++) {
    let name;
    let attempts = 0;
    do {
        const prefix = namePrefixes[i % namePrefixes.length];
        const suffix = nameSuffixes[Math.floor(i / namePrefixes.length) % nameSuffixes.length];
        
        if (attempts === 0) {
            name = prefix + suffix;
        } else if (attempts === 1) {
            name = prefix + " " + suffix;
        } else {
            name = "The " + prefix + suffix;
        }
        attempts++;
    } while (usedNames.has(name) && attempts < 10);
    
    usedNames.add(name);
    uniqueNames.push(name);
}

const powerTypes = [
    "Super Strength", "Metal Form", "Rage Strength", "Immense Strength", "Size & Strength",
    "Divine Strength", "Brute Force", "Crushing Power", "Time Dilation", "Lightning Dash",
    "Quantum Speed", "Sound Barrier", "Motion Blur", "Gale Force", "Time Fracture",
    "Burst Speed", "Air Control", "Flight", "Winged Flight", "Soaring Flight",
    "Aerial Mastery", "Cloud Flight", "Wind Riding", "Falcon Flight", "Plasma Energy",
    "Electricity", "Solar Energy", "Energy Beams", "Electric Spark", "Laser Vision",
    "Lightning Bolt", "Radiant Energy", "Power Armor", "Tech Gadgets", "Cybernetic",
    "Tech Nexus", "Circuit Control", "Drone Control", "Matrix Tech", "Digital Control",
    "Mystic Arts", "Sorcery", "Enchantment", "Wizardry", "Magic",
    "Dark Magic", "Shamanic Magic", "Divine Magic", "Telepathy", "Mind Control",
    "Mental Powers", "Psionics", "Mind Reading", "Brain Waves", "Thought Control",
    "Fire Control", "Ice Control", "Weather Control", "Earth Control", "Water Control",
    "Wind Control", "Earth Mastery", "Fire Mastery", "Shadow Control", "Invisibility"
];

// Generate remaining characters to reach 100+
for (let i = 17; i <= 120; i++) {
    const nameIndex = (i - 17) % uniqueNames.length;
    const powerIndex = (i - 17) % powerTypes.length;
    const powerCategories = ["strength", "speed", "flight", "energy", "tech", "magic", "mental", "elemental"];
    const powerCategory = powerCategories[i % powerCategories.length];
    
    const coverageTypes = [
        coverageShapes.wideArcEarly(0, 70),
        coverageShapes.deepBlock(60, 110),
        coverageShapes.diagonalSlash(120, 180),
        coverageShapes.centerCircle(),
        coverageShapes.sharpWedge(190, 230),
        coverageShapes.fullArc(0, 180),
        coverageShapes.thinLine(0, 20),
        coverageShapes.largeCircle(),
        coverageShapes.bottomArc(),
        coverageShapes.scattered(),
        coverageShapes.spiral(),
        coverageShapes.topArc(),
        coverageShapes.leftArc(),
        coverageShapes.rightArc()
    ];
    
    const designTemplates = [
        "A mysterious hero with powers beyond comprehension.",
        "An ancient warrior awakened in modern times.",
        "A hero forged in the fires of battle.",
        "A guardian of the realm, sworn to protect.",
        "A rogue agent with a hidden agenda.",
        "A hero born from tragedy and loss.",
        "A champion of justice, fighting for the innocent.",
        "A master of their craft, honed through years of training.",
        "A hero touched by cosmic forces.",
        "A warrior blessed by the gods themselves."
    ];
    
    characters.push({
        id: i,
        name: uniqueNames[i - 17], // Use the pre-generated unique names
        power: powerCategory,
        powerType: powerTypes[powerIndex],
        ...generateInitialStats(powerCategory),
        level: 1,
        xp: 0,
        xpToNext: 100,
        coverageShape: coverageTypes[i % coverageTypes.length],
        design: designTemplates[i % designTemplates.length],
        status: 'available',
        cooldownEnd: 0,
        needsReview: false,
        lastMissionResult: null
    });
}

// Disruption System - 25% chance to trigger
const disruptionTypes = [
    {
        id: 1,
        name: "Structural Collapse",
        description: "The building begins to crumble around your team!",
        choices: [
            { text: "Tough it out", requiredStat: "vigor", requiredValue: 3, successText: "Your team pushes through the debris!", failureText: "The team is overwhelmed by the collapse." },
            { text: "Find another route", requiredStat: "speed", requiredValue: 4, successText: "You quickly navigate to safety!", failureText: "The alternate path is blocked." },
            { text: "Use technology", requiredStat: "intellect", requiredValue: 4, successText: "Tech solutions clear the way!", failureText: "The technology fails under pressure." }
        ]
    },
    {
        id: 2,
        name: "Enemy Ambush",
        description: "Hostile forces have set a trap!",
        choices: [
            { text: "Fight through", requiredStat: "combat", requiredValue: 4, successText: "Your team defeats the ambushers!", failureText: "The ambush overwhelms your team." },
            { text: "Retreat and regroup", requiredStat: "speed", requiredValue: 5, successText: "You escape and find a better position!", failureText: "The retreat is cut off." },
            { text: "Negotiate", requiredStat: "charisma", requiredValue: 4, successText: "Your words turn enemies into allies!", failureText: "The negotiation fails." }
        ]
    },
    {
        id: 3,
        name: "Mystical Barrier",
        description: "An arcane force field blocks your path!",
        choices: [
            { text: "Break through with force", requiredStat: "combat", requiredValue: 5, successText: "Raw power shatters the barrier!", failureText: "The barrier is too strong." },
            { text: "Dispel with magic", requiredStat: "intellect", requiredValue: 5, successText: "Your magic unravels the barrier!", failureText: "The magic is too complex." },
            { text: "Find the source", requiredStat: "intellect", requiredValue: 4, successText: "You locate and disable the source!", failureText: "The source is well hidden." }
        ]
    },
    {
        id: 4,
        name: "Environmental Hazard",
        description: "Toxic gas fills the area!",
        choices: [
            { text: "Endure the exposure", requiredStat: "vigor", requiredValue: 4, successText: "Your team's resilience overcomes the toxin!", failureText: "The team is weakened by the gas." },
            { text: "Create a barrier", requiredStat: "intellect", requiredValue: 5, successText: "You create a protective field!", failureText: "The barrier doesn't hold." },
            { text: "Find clean air", requiredStat: "speed", requiredValue: 4, successText: "You quickly reach safety!", failureText: "The toxic area is too large." }
        ]
    },
    {
        id: 5,
        name: "Technological Failure",
        description: "Critical systems are malfunctioning!",
        choices: [
            { text: "Force the systems", requiredStat: "combat", requiredValue: 3, successText: "Brute force gets things working!", failureText: "The systems are too damaged." },
            { text: "Repair the systems", requiredStat: "intellect", requiredValue: 5, successText: "Your technical expertise fixes everything!", failureText: "The damage is too extensive." },
            { text: "Work around it", requiredStat: "intellect", requiredValue: 4, successText: "You find an alternative solution!", failureText: "No alternatives are available." }
        ]
    },
    {
        id: 6,
        name: "Mental Attack",
        description: "Psionic waves assault your team's minds!",
        choices: [
            { text: "Resist with willpower", requiredStat: "vigor", requiredValue: 4, successText: "Your mental fortitude protects you!", failureText: "The attack overwhelms your minds." },
            { text: "Counter with telepathy", requiredStat: "intellect", requiredValue: 5, successText: "You turn the attack back on the source!", failureText: "The attack is too powerful." },
            { text: "Shield your thoughts", requiredStat: "intellect", requiredValue: 4, successText: "Mental barriers protect the team!", failureText: "The barriers are breached." }
        ]
    },
    {
        id: 7,
        name: "Time Distortion",
        description: "Reality itself seems to be warping!",
        choices: [
            { text: "Anchor yourself", requiredStat: "vigor", requiredValue: 5, successText: "Your stability resists the distortion!", failureText: "The distortion pulls you apart." },
            { text: "Navigate the waves", requiredStat: "speed", requiredValue: 5, successText: "You move through the distortion safely!", failureText: "The waves are too chaotic." },
            { text: "Understand the pattern", requiredStat: "intellect", requiredValue: 5, successText: "You predict and avoid the worst effects!", failureText: "The pattern is too complex." }
        ]
    },
    {
        id: 8,
        name: "Resource Depletion",
        description: "Your team is running low on supplies!",
        choices: [
            { text: "Push forward anyway", requiredStat: "vigor", requiredValue: 5, successText: "Sheer determination carries you through!", failureText: "Exhaustion takes its toll." },
            { text: "Scavenge for resources", requiredStat: "speed", requiredValue: 4, successText: "You find what you need!", failureText: "Nothing useful can be found." },
            { text: "Improvise solutions", requiredStat: "intellect", requiredValue: 4, successText: "Creative thinking solves the problem!", failureText: "No solutions present themselves." }
        ]
    }
];

// Pre-made Teams (8 characters each)
const premadeTeams = [
    {
        id: 1,
        name: "The Avengers",
        description: "A balanced team of powerful heroes",
        members: [3, 9, 25, 33, 41, 57, 70, 85],
        cost: 0
    },
    {
        id: 2,
        name: "Speed Demons",
        description: "Ultra-fast heroes for quick missions",
        members: [10, 11, 15, 76, 88, 92, 14, 16],
        cost: 0
    },
    {
        id: 3,
        name: "Elemental Masters",
        description: "Masters of the elements",
        members: [57, 58, 59, 60, 61, 62, 63, 64],
        cost: 0
    },
    {
        id: 4,
        name: "Tech Squad",
        description: "Technology-enhanced heroes",
        members: [33, 35, 39, 80, 87, 117, 34, 36],
        cost: 0
    },
    {
        id: 5,
        name: "Mystic Order",
        description: "Magic-wielding heroes",
        members: [41, 42, 44, 48, 102, 104, 45, 46],
        cost: 0
    },
    {
        id: 6,
        name: "The Titans",
        description: "Strength-focused powerhouse team",
        members: [1, 2, 3, 4, 5, 6, 7, 8],
        cost: 0
    },
    {
        id: 7,
        name: "Mentalists",
        description: "Psychic and mental power users",
        members: [49, 50, 51, 55, 65, 107, 52, 53],
        cost: 0
    },
    {
        id: 8,
        name: "Elite Force",
        description: "Top-tier heroes for toughest missions",
        members: [70, 72, 104, 118, 119, 120, 103, 105],
        cost: 0
    }
];

// Mission generation system - creates 50-100 missions per day
function generateDailyMissions() {
    const missionCount = Math.floor(Math.random() * 51) + 50; // 50-100 missions
    const missions = [];
    
    const missionTemplates = [
        { type: "Rescue", baseReward: 200, baseRep: 15 },
        { type: "Combat", baseReward: 350, baseRep: 25 },
        { type: "Stealth", baseReward: 250, baseRep: 20 },
        { type: "Defense", baseReward: 400, baseRep: 30 },
        { type: "Pursuit", baseReward: 150, baseRep: 10 },
        { type: "Investigation", baseReward: 220, baseRep: 18 },
        { type: "Disaster", baseReward: 450, baseRep: 35 },
        { type: "Extraction", baseReward: 500, baseRep: 40 }
    ];
    
    for (let i = 0; i < missionCount; i++) {
        const template = missionTemplates[Math.floor(Math.random() * missionTemplates.length)];
        const difficulty = ["Easy", "Medium", "Hard", "Very Hard"][Math.floor(Math.random() * 4)];
        
        // Generate required stats (out of 15, but missions need team totals)
        const requiredStats = {
            vigor: Math.floor(Math.random() * 8) + 2, // 2-9 per stat (team of 8 can cover)
            combat: Math.floor(Math.random() * 8) + 2,
            speed: Math.floor(Math.random() * 8) + 2,
            intellect: Math.floor(Math.random() * 8) + 2,
            charisma: Math.floor(Math.random() * 8) + 2
        };
        
        // Generate coverage zone (shaded slices on the wheel)
        const coverageZone = generateCoverageZone();
        
        missions.push({
            id: i + 1,
            name: `${template.type} Mission ${i + 1}`,
            type: template.type,
            description: `A ${template.type.toLowerCase()} mission requiring strategic team coordination.`,
            difficulty: difficulty,
            requiredStats: requiredStats,
            coverageZone: coverageZone, // Array of slice indices that need to be covered
            reward: { credits: template.baseReward, reputation: template.baseRep },
            completed: false,
            assignedTeam: null
        });
    }
    
    return missions;
}

// Generate a random coverage zone (shaded area on the wheel)
function generateCoverageZone() {
    const zoneType = Math.floor(Math.random() * 5);
    const slices = [];
    
    switch(zoneType) {
        case 0: { // Arc
            const start = Math.floor(Math.random() * 36);
            const length = Math.floor(Math.random() * 12) + 6; // 6-18 slices
            for (let i = 0; i < length; i++) {
                slices.push((start + i) % 36);
            }
            break;
        }
        case 1: { // Multiple arcs
            for (let arc = 0; arc < 2; arc++) {
                const arcStart = Math.floor(Math.random() * 36);
                const arcLength = Math.floor(Math.random() * 6) + 3;
                for (let i = 0; i < arcLength; i++) {
                    slices.push((arcStart + i) % 36);
                }
            }
            break;
        }
        case 2: { // Center + arc
            slices.push(36); // Center
            const centerArcStart = Math.floor(Math.random() * 36);
            const centerArcLength = Math.floor(Math.random() * 8) + 4;
            for (let i = 0; i < centerArcLength; i++) {
                slices.push((centerArcStart + i) % 36);
            }
            break;
        }
        case 3: { // Scattered
            for (let i = 0; i < 8; i++) {
                slices.push(Math.floor(Math.random() * 36));
            }
            break;
        }
        case 4: { // Large section
            const largeStart = Math.floor(Math.random() * 36);
            for (let i = 0; i < 15; i++) {
                slices.push((largeStart + i) % 36);
            }
            break;
        }
    }
    
    return [...new Set(slices)]; // Remove duplicates
}
