// Mission templates with keywords and stat requirements
export const MISSION_TEMPLATES = [
  {
    type: 'Combat',
    keywords: ['Physical confrontation', 'Fighting', 'Brawl', 'Villain encounter'],
    baseStats: { combat: 4, vigor: 2, mobility: 1, charisma: 1, intellect: 1 },
    description: 'A group of criminals is causing chaos downtown. Physical confrontation required.',
    xpReward: 150
  },
  {
    type: 'Rescue',
    keywords: ['Rapid response', 'Chase', 'Time-sensitive', 'Urgent'],
    baseStats: { combat: 2, vigor: 2, mobility: 4, charisma: 1, intellect: 1 },
    description: 'Emergency rescue needed. Rapid response required to reach the scene in time.',
    xpReward: 120
  },
  {
    type: 'Negotiation',
    keywords: ['Persuade', 'Negotiate', 'De-escalate', 'Crowd control'],
    baseStats: { combat: 1, vigor: 1, mobility: 1, charisma: 4, intellect: 2 },
    description: 'Tense standoff situation. Needs someone who can de-escalate and negotiate.',
    xpReward: 130
  },
  {
    type: 'Investigation',
    keywords: ['Analyze', 'Investigate', 'Puzzle', 'Technical expertise'],
    baseStats: { combat: 1, vigor: 1, mobility: 1, charisma: 1, intellect: 4 },
    description: 'Complex situation requiring analytical thinking and investigation skills.',
    xpReward: 140
  },
  {
    type: 'Defense',
    keywords: ['Endure harsh conditions', 'Protect', 'Durability', 'Stamina'],
    baseStats: { combat: 2, vigor: 4, mobility: 1, charisma: 2, intellect: 1 },
    description: 'Dangerous environment. Hero needs to endure harsh conditions and protect civilians.',
    xpReward: 125
  },
  {
    type: 'Stealth',
    keywords: ['Stealth', 'Infiltrate', 'Agility', 'Reflexes'],
    baseStats: { combat: 2, vigor: 1, mobility: 4, charisma: 1, intellect: 2 },
    description: 'Covert operation requiring stealth and agility to infiltrate undetected.',
    xpReward: 135
  },
  {
    type: 'Mixed',
    keywords: ['Physical confrontation', 'Negotiate', 'Rapid response'],
    baseStats: { combat: 3, vigor: 2, mobility: 3, charisma: 3, intellect: 1 },
    description: 'Complex multi-faceted situation requiring diverse skills.',
    xpReward: 160
  }
]

export function generateCall() {
  // 10% chance for hacking call
  if (Math.random() < 0.1) {
    return {
      type: 'hacking',
      title: 'Hacking Mission',
      description: 'Cybersecurity breach detected. Direct intervention required - no heroes needed.',
      keywords: ['Hack', 'Analyze', 'Puzzle', 'Technical'],
      heroSlots: 0,
      requiredStats: {},
      timeRemaining: 90000, // 90s for hacking
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      xpReward: 200,
      createdAt: Date.now()
    }
  }
  
  const template = MISSION_TEMPLATES[Math.floor(Math.random() * MISSION_TEMPLATES.length)]
  const isUrgent = Math.random() < 0.3
  const heroSlots = Math.random() < 0.5 ? 1 : Math.random() < 0.7 ? 2 : 3
  
  // Add variation to stats
  const requiredStats = {}
  Object.keys(template.baseStats).forEach(stat => {
    const base = template.baseStats[stat]
    requiredStats[stat] = Math.max(1, base + Math.floor(Math.random() * 3) - 1)
  })
  
  return {
    type: isUrgent ? 'urgent' : 'standard',
    title: `${template.type} Mission`,
    description: template.description,
    keywords: template.keywords,
    heroSlots,
    requiredStats,
    timeRemaining: isUrgent ? 45000 : 60000, // 45s urgent, 60s standard
    x: Math.random() * 80 + 10, // 10-90%
    y: Math.random() * 80 + 10,
    xpReward: template.xpReward,
    createdAt: Date.now()
  }
}

export function generateConflictingCalls() {
  const call1 = generateCall()
  const call2 = generateCall()
  
  return [
    { ...call1, type: 'conflicting', conflictId: 'conflict-1', conflictPartner: 'conflict-2' },
    { ...call2, type: 'conflicting', conflictId: 'conflict-2', conflictPartner: 'conflict-1' }
  ]
}

