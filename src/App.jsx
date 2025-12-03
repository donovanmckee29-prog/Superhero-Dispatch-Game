import React, { useState, useEffect, useReducer, useCallback, useMemo, useRef } from 'react'
import { 
  Clock, AlertCircle, CheckCircle, XCircle, Users, Zap, Shield, 
  Brain, Heart, X, Play, Pause, Trophy, Star, Target, Activity,
  AlertTriangle, Timer, TrendingUp, Award, Gamepad2, Settings, MapPin
} from 'lucide-react'

// ============================================================================
// RADAR CHART HELPER - Proper Pentagon with Boundaries
// ============================================================================

const renderPentagonRadarChart = (stats, maxValue = 15, size = 250, showCheckmark = false) => {
  const centerX = size / 2
  const centerY = size / 2
  const radius = size / 2 - 30
  
  // Pentagon vertices (top, top-right, bottom-right, bottom-left, top-left)
  const pentagonPoints = [
    { angle: -90, icon: '⚔️', label: 'Combat' },      // Top
    { angle: -18, icon: '🛡️', label: 'Vigor' },       // Top-right
    { angle: 54, icon: '🏃', label: 'Mobility' },     // Bottom-right
    { angle: 126, icon: '💬', label: 'Charisma' },    // Bottom-left
    { angle: 198, icon: '🧠', label: 'Intellect' }    // Top-left
  ]
  
  // Calculate pentagon boundary points
  const boundaryPoints = pentagonPoints.map(({ angle }) => {
    const rad = (angle * Math.PI) / 180
    return {
      x: centerX + Math.cos(rad) * radius,
      y: centerY + Math.sin(rad) * radius
    }
  })
  
  const boundaryPath = boundaryPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'
  
  // Calculate stat points (normalized to fit inside pentagon, max 15)
  const statValues = [
    stats.combat || 0,
    stats.vigor || 0,
    stats.mobility || 0,
    stats.charisma || 0,
    stats.intellect || 0
  ]
  
  const statPoints = pentagonPoints.map(({ angle }, i) => {
    const rad = (angle * Math.PI) / 180
    // Normalize: value / maxValue * radius (ensures it fits inside)
    const normalizedValue = Math.min(1, statValues[i] / maxValue) * radius
    return {
      x: centerX + Math.cos(rad) * normalizedValue,
      y: centerY + Math.sin(rad) * normalizedValue
    }
  })
  
  const statPath = statPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'
  
  // Find highest stat for checkmark
  const maxStatIndex = statValues.indexOf(Math.max(...statValues))
  const checkmarkPoint = statPoints[maxStatIndex]
  
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {/* Background pentagon - clear boundary */}
      <polygon
        points={boundaryPoints.map(p => `${p.x},${p.y}`).join(' ')}
        fill="#1e293b"
        stroke="#4fd1c7"
        strokeWidth="3"
      />
      
      {/* Grid lines from center to vertices */}
      {boundaryPoints.map((point, i) => (
        <line
          key={i}
          x1={centerX}
          y1={centerY}
          x2={point.x}
          y2={point.y}
          stroke="rgba(79, 209, 199, 0.2)"
          strokeWidth="1"
        />
      ))}
      
      {/* Stat fill area */}
      <path
        d={statPath}
        fill="rgba(79, 209, 199, 0.5)"
        stroke="#4fd1c7"
        strokeWidth="2"
      />
      
      {/* Center point */}
      <circle cx={centerX} cy={centerY} r="4" fill="#4fd1c7" />
      
      {/* Stat points */}
      {statPoints.map((point, i) => (
        <circle
          key={i}
          cx={point.x}
          cy={point.y}
          r="4"
          fill="#4fd1c7"
          stroke="#1e293b"
          strokeWidth="2"
        />
      ))}
      
      {/* Checkmark on highest stat */}
      {showCheckmark && checkmarkPoint && (
        <g transform={`translate(${checkmarkPoint.x}, ${checkmarkPoint.y})`}>
          <circle r="12" fill="#10b981" />
          <path
            d="M -4 0 L 0 4 L 4 -4"
            stroke="white"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}
      
      {/* Labels */}
      {pentagonPoints.map(({ angle, icon }, i) => {
        const rad = (angle * Math.PI) / 180
        const labelRadius = radius + 25
        return (
          <text
            key={i}
            x={centerX + Math.cos(rad) * labelRadius}
            y={centerY + Math.sin(rad) * labelRadius}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-2xl"
            style={{ fontSize: '24px' }}
          >
            {icon}
          </text>
        )
      })}
    </svg>
  )
}

// ============================================================================
// HERO DATABASE - 100+ Heroes across 7 classes
// ============================================================================

const generateHeroes = () => {
  const classes = ['Brawler', 'Speedster', 'Tank', 'Diplomat', 'Genius', 'Elemental', 'Mystic']
  const names = [
    'Kronos', 'Ironforge', 'Wrathbringer', 'Atlas', 'Colossus', 'Heracles', 'Brutefist',
    'Velocity', 'Thunderstrike', 'Mercury', 'Sonic', 'Blurr', 'Windrunner', 'Dashfire',
    'Fortress', 'Guardian', 'Shieldwall', 'Bulwark', 'Bastion', 'Defender', 'Sentinel',
    'Silver Tongue', 'Peacemaker', 'Negotiator', 'Ambassador', 'Mediator', 'Charmcaster',
    'Mindforge', 'Brainwave', 'Cognitor', 'Thinker', 'Analyst', 'Strategist', 'Oracle',
    'Flameheart', 'Frostbite', 'Stormcaller', 'Earthshaker', 'Aquaflow', 'Voltmaster',
    'Shadowweaver', 'Mystic Veil', 'Arcane Master', 'Spellbinder', 'Sorcerer', 'Wizard'
  ]
  
  const heroes = []
  let id = 1
  
  classes.forEach((heroClass, classIndex) => {
    const classNames = names.slice(classIndex * 7, (classIndex + 1) * 7)
    
    classNames.forEach((name, index) => {
      // Start heroes VERY weak with varied stat distributions
      // Each hero has a unique stat focus (max 5 per stat initially)
      const statFocuses = [
        { combat: 3, vigor: 2, mobility: 1, charisma: 1, intellect: 1 }, // Combat/Vigor focus
        { combat: 1, vigor: 3, mobility: 2, charisma: 1, intellect: 1 }, // Vigor/Mobility focus
        { combat: 2, vigor: 1, mobility: 3, charisma: 1, intellect: 1 }, // Speed/Vigor focus
        { combat: 1, vigor: 1, mobility: 1, charisma: 3, intellect: 2 }, // Charisma/Intellect
        { combat: 1, vigor: 1, mobility: 2, charisma: 2, intellect: 3 }, // Intellect/Mobility
        { combat: 2, vigor: 2, mobility: 1, charisma: 1, intellect: 2 }, // Balanced combat
        { combat: 1, vigor: 2, mobility: 2, charisma: 2, intellect: 1 }, // Balanced support
      ]
      
      const focus = statFocuses[index % statFocuses.length]
      const baseStats = {
        combat: focus.combat + Math.floor(Math.random() * 2), // 1-5
        vigor: focus.vigor + Math.floor(Math.random() * 2), // 1-5
        mobility: focus.mobility + Math.floor(Math.random() * 2), // 1-5
        charisma: focus.charisma + Math.floor(Math.random() * 2), // 1-5
        intellect: focus.intellect + Math.floor(Math.random() * 2) // 1-5
      }
      
      // Class-based adjustments (add variety)
      if (heroClass === 'Brawler') {
        baseStats.combat = Math.min(5, baseStats.combat + Math.floor(Math.random() * 2))
        baseStats.vigor = Math.min(5, baseStats.vigor + Math.floor(Math.random() * 2))
        baseStats.mobility = Math.max(1, baseStats.mobility - 1)
      } else if (heroClass === 'Speedster') {
        baseStats.mobility = Math.min(5, baseStats.mobility + Math.floor(Math.random() * 2))
        baseStats.combat = Math.min(5, baseStats.combat + Math.floor(Math.random() * 2))
        baseStats.vigor = Math.max(1, baseStats.vigor - 1)
      } else if (heroClass === 'Tank') {
        baseStats.vigor = Math.min(5, baseStats.vigor + Math.floor(Math.random() * 2))
        baseStats.combat = Math.min(5, baseStats.combat + Math.floor(Math.random() * 2))
        baseStats.mobility = Math.max(1, baseStats.mobility - 1)
      } else if (heroClass === 'Diplomat') {
        baseStats.charisma = Math.min(5, baseStats.charisma + Math.floor(Math.random() * 2))
        baseStats.intellect = Math.min(5, baseStats.intellect + Math.floor(Math.random() * 2))
        baseStats.combat = Math.max(1, baseStats.combat - 1)
      } else if (heroClass === 'Genius') {
        baseStats.intellect = Math.min(5, baseStats.intellect + Math.floor(Math.random() * 2))
        baseStats.charisma = Math.min(5, baseStats.charisma + Math.floor(Math.random() * 2))
        baseStats.vigor = Math.max(1, baseStats.vigor - 1)
      } else if (heroClass === 'Elemental') {
        baseStats.combat = Math.min(5, baseStats.combat + 1)
        baseStats.intellect = Math.min(5, baseStats.intellect + 1)
        baseStats.vigor = Math.min(5, baseStats.vigor + 1)
      } else if (heroClass === 'Mystic') {
        baseStats.intellect = Math.min(5, baseStats.intellect + 1)
        baseStats.charisma = Math.min(5, baseStats.charisma + 1)
        baseStats.combat = Math.max(1, baseStats.combat - 1)
      }
      
      // Ensure max 5 per stat, total around 8-12 (varied)
      Object.keys(baseStats).forEach(key => {
        baseStats[key] = Math.min(5, Math.max(1, baseStats[key]))
      })
      
      // Ensure total is reasonable (8-12)
      const totalInitialStats = baseStats.combat + baseStats.vigor + baseStats.mobility + baseStats.charisma + baseStats.intellect
      if (totalInitialStats > 12) {
        const scale = 12 / totalInitialStats
        Object.keys(baseStats).forEach(key => {
          baseStats[key] = Math.max(1, Math.floor(baseStats[key] * scale))
        })
      } else if (totalInitialStats < 8) {
        // Boost weakest stat
        const stats = Object.entries(baseStats).sort((a, b) => a[1] - b[1])
        baseStats[stats[0][0]] = Math.min(5, baseStats[stats[0][0]] + 1)
      }
      
      heroes.push({
        id: id++,
        name,
        class: heroClass,
        ...baseStats,
        level: 1,
        xp: 0,
        xpToNext: 100,
        skillPoints: Math.min(4, Math.floor(Math.random() * 5)), // Start with 0-4 skill points (max 4)
        status: 'available',
        restTime: 0,
        fatigue: 0,
        friends: [],
        enemies: [],
        unlocked: id <= 6,
        color: `hsl(${(classIndex * 51) % 360}, 70%, 50%)`
      })
    })
  })
  
  // Add relationships
  heroes.forEach((hero, i) => {
    if (i < heroes.length - 1 && Math.random() < 0.3) {
      const friend = heroes[i + 1]
      if (friend) {
        hero.friends.push(friend.id)
        friend.friends.push(hero.id)
      }
    }
    if (i < heroes.length - 5 && Math.random() < 0.15) {
      const enemy = heroes[i + 5]
      if (enemy) {
        hero.enemies.push(enemy.id)
        enemy.enemies.push(hero.id)
      }
    }
  })
  
  return heroes
}

// ============================================================================
// MISSION TEMPLATES
// ============================================================================

const missionTemplates = [
  { type: 'Rescue', keywords: ['RESCUE', 'EVACUATE', 'SAVE'], baseXP: 20 },
  { type: 'Combat', keywords: ['FIGHT', 'BATTLE', 'SUBDUE', 'DEFEAT', 'NEUTRALIZE'], baseXP: 25 },
  { type: 'Stealth', keywords: ['SNEAK', 'INFILTRATE', 'STEALTH'], baseXP: 22 },
  { type: 'Defense', keywords: ['PROTECT', 'DEFEND', 'SHIELD', 'SECURE'], baseXP: 30 },
  { type: 'Pursuit', keywords: ['CHASE', 'PURSUE', 'CATCH', 'TRACK'], baseXP: 18 },
  { type: 'Investigation', keywords: ['INVESTIGATE', 'ANALYZE', 'SOLVE', 'EXAMINE'], baseXP: 20 },
  { type: 'Disaster', keywords: ['DISASTER', 'EMERGENCY', 'CRISIS'], baseXP: 35 },
  { type: 'Extraction', keywords: ['EXTRACT', 'RETRIEVE'], baseXP: 28 },
  { type: 'Delivery', keywords: ['DELIVER', 'TRANSPORT', 'MOVE'], baseXP: 15 },
  { type: 'Negotiation', keywords: ['NEGOTIATE', 'PERSUADE', 'TALK', 'DIPLOMACY'], baseXP: 24 }
]

const generateMission = (episode) => {
  const template = missionTemplates[Math.floor(Math.random() * missionTemplates.length)]
  const difficulty = episode * 0.5 + Math.random() * 0.5
  const slots = Math.floor(Math.random() * 4) + 1 // 1-4 slots
  
  // Mission requirements scale: Episodes 1-3: 1-8 per stat, then scale up
  // Make missions POSSIBLE - scale requirements based on slots (more slots = can handle higher requirements)
  const maxForEpisode = episode <= 3 ? 8 : Math.min(15, 8 + (episode - 3) * 2)
  const slotMultiplier = slots * 1.5 // More slots = can handle more total requirements
  
  // Base requirements scaled by slots (1 slot = lower reqs, 4 slots = higher reqs)
  const baseRequirement = Math.floor((maxForEpisode / 4) * slots) + Math.floor(Math.random() * 3)
  
  const requiredStats = {
    combat: Math.floor(baseRequirement * (0.3 + Math.random() * 0.4)) + 1,
    vigor: Math.floor(baseRequirement * (0.3 + Math.random() * 0.4)) + 1,
    mobility: Math.floor(baseRequirement * (0.3 + Math.random() * 0.4)) + 1,
    charisma: Math.floor(baseRequirement * (0.3 + Math.random() * 0.4)) + 1,
    intellect: Math.floor(baseRequirement * (0.3 + Math.random() * 0.4)) + 1
  }
  
  // Boost based on mission type (but keep within episode limits and make achievable)
  if (template.type === 'Combat' || template.type === 'Defense') {
    requiredStats.combat = Math.min(maxForEpisode, requiredStats.combat + Math.floor(Math.random() * 2) + 1)
    requiredStats.vigor = Math.min(maxForEpisode, requiredStats.vigor + Math.floor(Math.random() * 2) + 1)
    // Reduce other stats slightly to keep total manageable
    requiredStats.charisma = Math.max(1, requiredStats.charisma - 1)
    requiredStats.intellect = Math.max(1, requiredStats.intellect - 1)
  } else if (template.type === 'Pursuit' || template.type === 'Stealth') {
    requiredStats.mobility = Math.min(maxForEpisode, requiredStats.mobility + Math.floor(Math.random() * 2) + 1)
    requiredStats.combat = Math.max(1, requiredStats.combat - 1)
  } else if (template.type === 'Investigation' || template.type === 'Negotiation') {
    requiredStats.intellect = Math.min(maxForEpisode, requiredStats.intellect + Math.floor(Math.random() * 2) + 1)
    requiredStats.charisma = Math.min(maxForEpisode, requiredStats.charisma + Math.floor(Math.random() * 2) + 1)
    requiredStats.combat = Math.max(1, requiredStats.combat - 1)
    requiredStats.vigor = Math.max(1, requiredStats.vigor - 1)
  } else if (template.type === 'Rescue' || template.type === 'Disaster') {
    requiredStats.vigor = Math.min(maxForEpisode, requiredStats.vigor + Math.floor(Math.random() * 2) + 1)
    requiredStats.mobility = Math.min(maxForEpisode, requiredStats.mobility + Math.floor(Math.random() * 2) + 1)
    requiredStats.intellect = Math.max(1, requiredStats.intellect - 1)
  }
  
  // Ensure all stats are within episode limits and total is achievable
  // Total should be roughly: slots * 8 (for 1 slot: ~8 total, for 4 slots: ~32 total)
  const totalRequired = Object.values(requiredStats).reduce((a, b) => a + b, 0)
  const targetTotal = slots * 8
  if (totalRequired > targetTotal * 1.2) {
    const scale = (targetTotal * 1.2) / totalRequired
    Object.keys(requiredStats).forEach(key => {
      requiredStats[key] = Math.min(maxForEpisode, Math.max(1, Math.floor(requiredStats[key] * scale)))
    })
  }
  
  // Final bounds check
  Object.keys(requiredStats).forEach(key => {
    requiredStats[key] = Math.min(maxForEpisode, Math.max(1, requiredStats[key]))
  })
  
  const priorities = ['Low', 'Medium', 'High', 'Critical']
  const priority = priorities[Math.min(3, Math.floor(episode / 3) + Math.floor(Math.random() * 2))]
  
  const descriptions = {
    Rescue: `Civilians trapped need immediate ${template.keywords[0]}. Must ${template.keywords[1]} them quickly.`,
    Combat: `Armed suspects require ${template.keywords[0]}. Need to ${template.keywords[1]} the threat.`,
    Stealth: `Infiltrate enemy base. ${template.keywords[0]} is essential to avoid detection.`,
    Defense: `${template.keywords[0]} critical facility from attack. ${template.keywords[1]} at all costs.`,
    Pursuit: `High-speed ${template.keywords[0]} after fleeing criminals. Need to ${template.keywords[1]} quickly.`,
    Investigation: `Solve mysterious crime. Need to ${template.keywords[0]} thoroughly and ${template.keywords[1]} evidence.`,
    Disaster: `Emergency response needed. ${template.keywords[0]} situation requires immediate action.`,
    Extraction: `${template.keywords[0]} undercover agent from danger. ${template.keywords[1]} operation needed.`,
    Delivery: `Time-sensitive ${template.keywords[0]} required. ${template.keywords[1]} urgently.`,
    Negotiation: `Resolve hostage situation through ${template.keywords[0]}. Need to ${template.keywords[1]} carefully.`
  }
  
  return {
    id: Date.now() + Math.random(),
    title: `${template.type} Mission`,
    description: descriptions[template.type] || 'A mission requires your attention.',
    type: 'REGULAR',
    templateType: template.type,
    keywords: template.keywords,
    requiredStats,
    slots,
    priority,
    dangerLevel: Math.min(5, Math.floor(episode / 2) + Math.floor(Math.random() * 2) + 1),
    timeLeft: Math.floor(Math.random() * 30) + 15,
    reward: template.baseXP + Math.floor(episode * 2),
    episode,
    paused: false,
    x: Math.random() * 60 + 20, // 20-80% (visible area for all devices)
    y: Math.random() * 50 + 25  // 25-75% (visible area for all devices)
  }
}

// ============================================================================
// GAME STATE REDUCER
// ============================================================================

const initialState = {
  screen: 'start',
  currentEpisode: 1,
  episodeTimer: 600,
  isPaused: false,
  selectedCall: null,
  selectedHeroes: [],
  activeCalls: [],
  heroes: generateHeroes(),
  team: [],
  teamMode: null,
  viewingHero: null, // For hero upgrade screen
  completedMission: null, // For mission completion screen
  stats: {
    successful: 0,
    failed: 0,
    missed: 0,
    totalXP: 0,
    rank: 'Rookie',
    achievements: []
  },
  unlocks: {
    heroesUnlocked: [1, 2, 3, 4, 5, 6],
    episodesCompleted: [],
    achievementsEarned: []
  },
  notifications: []
}

function gameReducer(state, action) {
  switch (action.type) {
    case 'START_GAME':
      return { ...state, screen: 'teamSelect' }
    case 'SELECT_TEAM':
      return { ...state, screen: 'episodeIntro', team: action.team, teamMode: action.mode }
    case 'START_EPISODE':
      return { ...state, screen: 'game' }
    case 'TICK':
      if (state.screen === 'game' && !state.isPaused && state.episodeTimer > 0) {
        return { ...state, episodeTimer: state.episodeTimer - 1 }
      }
      return state
    case 'SPAWN_CALL':
      if (state.activeCalls.length < 5) {
        return { ...state, activeCalls: [...state.activeCalls, action.call] }
      }
      return state
    case 'SELECT_CALL':
      return { ...state, selectedCall: action.call, isPaused: true, screen: 'missionDetail' }
    case 'CLOSE_CALL':
      return { ...state, selectedCall: null, isPaused: false, screen: 'game' }
    case 'SELECT_HERO':
      // Only allow selection if we have a call and haven't reached slot limit
      const maxSlots = state.selectedCall?.slots || 4
      if (state.selectedHeroes.includes(action.heroId)) {
        return { ...state, selectedHeroes: state.selectedHeroes.filter(id => id !== action.heroId) }
      }
      if (state.selectedHeroes.length >= maxSlots) {
        return state // Don't add if at limit
      }
      return { ...state, selectedHeroes: [...state.selectedHeroes, action.heroId] }
    case 'DISPATCH_HEROES':
      return { ...state, selectedHeroes: [], selectedCall: null, isPaused: false, screen: 'game' }
    case 'MISSION_IN_PROGRESS':
      return { ...state, selectedHeroes: [], selectedCall: null, isPaused: false, screen: 'game', missionInProgress: action.mission }
    case 'UPDATE_CALL_TIMERS':
      return {
        ...state,
        activeCalls: state.activeCalls.map(call => ({
          ...call,
          timeLeft: call.paused ? call.timeLeft : Math.max(0, call.timeLeft - 1)
        }))
      }
    case 'REMOVE_EXPIRED_CALLS':
      const expired = state.activeCalls.filter(c => c.timeLeft <= 0 && c.id !== state.selectedCall?.id)
      return {
        ...state,
        activeCalls: state.activeCalls.filter(c => c.timeLeft > 0 || c.id === state.selectedCall?.id),
        stats: {
          ...state.stats,
          missed: state.stats.missed + expired.length
        }
      }
    case 'MISSION_COMPLETE':
      return {
        ...state,
        screen: 'missionComplete',
        completedMission: action.mission,
        stats: {
          ...state.stats,
          successful: state.stats.successful + (action.success ? 1 : 0),
          failed: state.stats.failed + (action.success ? 0 : 1),
          totalXP: state.stats.totalXP + (action.success ? action.xp : 0)
        }
      }
    case 'CLOSE_MISSION_COMPLETE':
      return { ...state, screen: 'missionResult', completedMission: state.completedMission, missionInProgress: null }
    case 'CLOSE_MISSION_RESULT':
      return { ...state, screen: 'game', completedMission: null, missionInProgress: null }
    case 'VIEW_HERO':
      return { ...state, screen: 'heroUpgrade', viewingHero: action.heroId }
    case 'CLOSE_HERO_UPGRADE':
      return { ...state, screen: 'game', viewingHero: null }
    case 'UPDATE_HERO_STAT':
      return {
        ...state,
        heroes: state.heroes.map(hero => {
          if (hero.id === action.heroId) {
            // Only allow adding points, never removing (max 15 per stat)
            if (action.delta > 0 && hero.skillPoints > 0 && hero[action.stat] < 15) {
              return {
                ...hero,
                [action.stat]: Math.min(15, hero[action.stat] + 1),
                skillPoints: hero.skillPoints - 1
              }
            }
          }
          return hero
        })
      }
    case 'UPDATE_HERO_STATUS':
      return {
        ...state,
        heroes: state.heroes.map(hero => {
          if (hero.id === action.heroId) {
            const updated = { ...hero, ...action.updates }
            // Handle level up if XP exceeds threshold
            if (updated.xp >= updated.xpToNext && action.updates.xp !== undefined) {
              updated.level = (updated.level || 1) + 1
              updated.xp = updated.xp - updated.xpToNext
              updated.xpToNext = Math.floor(updated.xpToNext * 1.5)
              updated.skillPoints = (updated.skillPoints || 0) + 1
            }
            return updated
          }
          return hero
        })
      }
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, { id: Date.now(), ...action.notification }]
      }
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.id)
      }
    case 'REMOVE_CALL':
      return {
        ...state,
        activeCalls: state.activeCalls.filter(c => c.id !== action.callId)
      }
    case 'EPISODE_COMPLETE':
      return {
        ...state,
        screen: 'episodeComplete',
        unlocks: {
          ...state.unlocks,
          episodesCompleted: [...state.unlocks.episodesCompleted, state.currentEpisode],
          heroesUnlocked: [
            ...state.unlocks.heroesUnlocked,
            ...action.newHeroes
          ]
        }
      }
    case 'NEXT_EPISODE':
      if (state.currentEpisode < 10) {
        return {
          ...state,
          screen: 'episodeIntro',
          currentEpisode: state.currentEpisode + 1,
          episodeTimer: 600,
          activeCalls: [],
          selectedCall: null,
          selectedHeroes: []
        }
      }
      return { ...state, screen: 'finalResults' }
    default:
      return state
  }
}

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  
  const calculateSuccess = useCallback((heroes, call) => {
    if (!heroes.length || !call) return 0
    
    let baseSuccess = 0
    const maxPossible = Object.values(call.requiredStats).reduce((a, b) => a + b, 0) * call.slots
    
    heroes.forEach(hero => {
      baseSuccess += Math.min(hero.combat, call.requiredStats.combat)
      baseSuccess += Math.min(hero.vigor, call.requiredStats.vigor)
      baseSuccess += Math.min(hero.mobility, call.requiredStats.mobility)
      baseSuccess += Math.min(hero.charisma, call.requiredStats.charisma)
      baseSuccess += Math.min(hero.intellect, call.requiredStats.intellect)
    })
    
    let successRate = (baseSuccess / maxPossible) * 100
    
    let synergyBonus = 0
    for (let i = 0; i < heroes.length; i++) {
      for (let j = i + 1; j < heroes.length; j++) {
        if (heroes[i].friends.includes(heroes[j].id)) {
          synergyBonus += 15 + Math.random() * 10
        }
      }
    }
    
    let sabotagePenalty = 0
    for (let i = 0; i < heroes.length; i++) {
      for (let j = i + 1; j < heroes.length; j++) {
        if (heroes[i].enemies.includes(heroes[j].id)) {
          sabotagePenalty += 10 + Math.random() * 30
        }
      }
    }
    
    const fatiguePenalty = heroes.reduce((sum, h) => sum + h.fatigue, 0) * 2
    const classBonus = heroes.some(h => h.class === 'Genius') ? 10 : 0
    
    successRate += synergyBonus - sabotagePenalty - fatiguePenalty + classBonus
    
    return Math.min(Math.max(Math.round(successRate), 5), 99)
  }, [])
  
  // Memoize available heroes to improve performance
  const availableHeroes = useMemo(() => 
    state.heroes.filter(h => h.unlocked || state.unlocks.heroesUnlocked.includes(h.id)),
    [state.heroes, state.unlocks.heroesUnlocked]
  )
  
  // Optimized game loop with proper mission spawning using refs to avoid closure issues
  const spawnRef = useRef({ lastSpawnTime: Date.now(), nextSpawnInterval: 8000 + Math.random() * 4000 })
  const stateRef = useRef(state)
  
  // Keep stateRef updated with latest state
  useEffect(() => {
    stateRef.current = state
  }, [state])
  
  useEffect(() => {
    if (state.screen !== 'game' || state.isPaused) return
    
    let frameCount = 0
    const interval = setInterval(() => {
      frameCount++
      const currentState = stateRef.current
      const now = Date.now()
      
      // Only tick every second (reduce updates)
      if (frameCount % 1 === 0) {
        dispatch({ type: 'TICK' })
        dispatch({ type: 'UPDATE_CALL_TIMERS' })
        dispatch({ type: 'REMOVE_EXPIRED_CALLS' })
      }
      
      // Spawn calls based on time elapsed (every 8-12 seconds)
      if (now - spawnRef.current.lastSpawnTime >= spawnRef.current.nextSpawnInterval && currentState.activeCalls.length < 5) {
        const newCall = generateMission(currentState.currentEpisode)
        dispatch({ type: 'SPAWN_CALL', call: newCall })
        spawnRef.current.lastSpawnTime = now
        // Reset spawn interval for next call (8-12 seconds)
        spawnRef.current.nextSpawnInterval = 8000 + Math.random() * 4000
      }
      
      if (currentState.episodeTimer <= 0) {
        const newHeroes = []
        const startId = currentState.currentEpisode * 8 + 1
        for (let i = 0; i < 8; i++) {
          if (startId + i <= currentState.heroes.length) {
            newHeroes.push(startId + i)
          }
        }
        dispatch({ type: 'EPISODE_COMPLETE', newHeroes })
      }
    }, 1000)
    
    return () => clearInterval(interval)
  }, [state.screen, state.isPaused])
  
  useEffect(() => {
    state.notifications.forEach(notif => {
      if (notif.duration) {
        setTimeout(() => {
          dispatch({ type: 'REMOVE_NOTIFICATION', id: notif.id })
        }, notif.duration)
      }
    })
  }, [state.notifications])
  
  const handleDispatch = () => {
    if (!state.selectedCall || state.selectedHeroes.length !== state.selectedCall.slots) return
    
    const selectedHeroes = state.heroes.filter(h => state.selectedHeroes.includes(h.id))
    const successChance = calculateSuccess(selectedHeroes, state.selectedCall)
    const success = Math.random() * 100 < successChance
    
    // Set heroes to busy immediately
    selectedHeroes.forEach(hero => {
      dispatch({ type: 'UPDATE_HERO_STATUS', heroId: hero.id, updates: { status: 'busy' } })
    })
    
    // Store mission data for later
    const missionData = { 
      ...state.selectedCall, 
      success, 
      successRate: successChance, 
      selectedHeroes: state.selectedHeroes 
    }
    
    // Remove call and close detail screen, go back to game
    dispatch({ type: 'REMOVE_CALL', callId: state.selectedCall.id })
    dispatch({ 
      type: 'MISSION_IN_PROGRESS', 
      mission: missionData
    })
    dispatch({ type: 'DISPATCH_HEROES' })
    
    // Mission takes time to complete (5-10 seconds)
    const missionDuration = 5000 + Math.random() * 5000
    
    setTimeout(() => {
      // Heroes return
      selectedHeroes.forEach(hero => {
        dispatch({ type: 'UPDATE_HERO_STATUS', heroId: hero.id, updates: { status: 'returning' } })
        
        setTimeout(() => {
          const restTime = 10 + Math.random() * 10
          const xpGained = success ? state.selectedCall.reward : 0
          
          dispatch({
            type: 'UPDATE_HERO_STATUS',
            heroId: hero.id,
            updates: {
              status: 'resting',
              restTime,
              fatigue: Math.min(10, hero.fatigue + 1),
              xp: hero.xp + xpGained
            }
          })
          
          setTimeout(() => {
            dispatch({
              type: 'UPDATE_HERO_STATUS',
              heroId: hero.id,
              updates: {
                status: 'available',
                restTime: 0,
                fatigue: Math.max(0, hero.fatigue - 0.5)
              }
            })
          }, restTime * 1000)
        }, 2000)
      })
      
      // Show completion screen (like second image)
      dispatch({
        type: 'MISSION_COMPLETE',
        mission: missionData,
        success,
        xp: state.selectedCall.reward
      })
    }, missionDuration)
  }
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  // Render based on screen
  if (state.screen === 'start') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-8">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            DISPATCH GAME
          </h1>
          <p className="text-xl text-slate-300">Ultimate Edition - 100+ Heroes, 10 Episodes</p>
          <button
            onClick={() => dispatch({ type: 'START_GAME' })}
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-xl rounded-lg hover:from-cyan-600 hover:to-blue-600 transform hover:scale-105 transition-all shadow-lg shadow-cyan-500/50"
          >
            <Play className="inline mr-2" /> New Game
          </button>
        </div>
      </div>
    )
  }
  
  if (state.screen === 'teamSelect') {
    return <TeamSelectScreen state={state} dispatch={dispatch} />
  }
  
  if (state.screen === 'episodeIntro') {
    return <EpisodeIntroScreen state={state} dispatch={dispatch} />
  }
  
  if (state.screen === 'missionDetail') {
    return <MissionDetailScreen state={state} dispatch={dispatch} calculateSuccess={calculateSuccess} handleDispatch={handleDispatch} />
  }
  
  if (state.screen === 'missionComplete') {
    return <MissionCompleteScreen state={state} dispatch={dispatch} />
  }
  
  if (state.screen === 'missionResult') {
    return <MissionResultScreen state={state} dispatch={dispatch} />
  }
  
  if (state.screen === 'heroUpgrade') {
    return <HeroUpgradeScreen state={state} dispatch={dispatch} />
  }
  
  if (state.screen === 'episodeComplete') {
    return <EpisodeCompleteScreen state={state} dispatch={dispatch} />
  }
  
  if (state.screen === 'finalResults') {
    return <FinalResultsScreen state={state} />
  }
  
  // Main game screen - City Map View
  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white relative overflow-hidden">
      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-black/80 backdrop-blur-sm border-b border-cyan-500/30 p-2">
        <div className="flex justify-between items-center text-xs">
          <div className="font-bold text-cyan-400 text-lg">SDN</div>
          <div className="flex gap-4 text-slate-300">
            <span>{new Date().toLocaleTimeString()}</span>
            <span>22°C</span>
            <span>Humidity: 40%</span>
            <span>6mph</span>
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'short' })}</span>
          </div>
          <div className="flex gap-2">
            <button className="p-1 hover:bg-slate-700 rounded">📁</button>
            <button className="p-1 hover:bg-slate-700 rounded">⚙️</button>
            <button className="p-1 hover:bg-slate-700 rounded">☰</button>
          </div>
        </div>
      </div>
      
      {/* City Map - More detailed like images */}
      <div className="relative w-full h-screen bg-gradient-to-b from-teal-950 via-slate-900 to-slate-800 overflow-hidden">
        {/* Grid pattern background */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(6, 182, 212, 0.3) 20px, rgba(6, 182, 212, 0.3) 22px),
            repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(6, 182, 212, 0.3) 20px, rgba(6, 182, 212, 0.3) 22px)
          `
        }} />
        
        {/* City buildings - simplified isometric style */}
        <div className="absolute inset-0">
          {Array.from({ length: 30 }).map((_, i) => {
            const x = (i % 6) * 16 + Math.random() * 5
            const y = Math.floor(i / 6) * 15 + Math.random() * 5
            const size = 8 + Math.random() * 12
            return (
              <div
                key={i}
                className="absolute border border-cyan-500/30 bg-slate-800/20"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  width: `${size}px`,
                  height: `${size * 1.5}px`,
                  transform: 'skewX(-20deg)',
                  transformOrigin: 'bottom'
                }}
              />
            )
          })}
        </div>
        {/* Mission Markers - Blue circles with person icon (like images) */}
        {state.activeCalls.map(call => (
          <button
            key={call.id}
            onClick={() => dispatch({ type: 'SELECT_CALL', call })}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 group"
            style={{
              left: `${call.x}%`,
              top: `${call.y}%`
            }}
          >
            <div className="relative">
              <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/50 group-hover:scale-110 transition-transform border-2 border-white">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
              {call.timeLeft < 10 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full animate-pulse border-2 border-white" />
              )}
            </div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-black/90 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {call.title} - {call.timeLeft}s
            </div>
          </button>
        ))}
        
        {/* Hero Movement Indicators */}
        {state.heroes.filter(h => h.status === 'returning' || h.status === 'busy').map(hero => (
          <div
            key={hero.id}
            className="absolute w-8 h-8 bg-blue-500 rounded-full border-2 border-white shadow-lg z-5"
            style={{
              left: `${30 + Math.random() * 40}%`,
              top: `${40 + Math.random() * 20}%`,
              animation: 'pulse 2s infinite'
            }}
          />
        ))}
      </div>
      
      {/* Hero Roster at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-black/95 backdrop-blur-sm border-t border-cyan-500/30 p-3">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {(state.team && state.team.length > 0 
            ? state.heroes.filter(h => state.team.includes(h.id))
            : availableHeroes
          )
            .slice(0, 12)
            .map(hero => {
              const statusColors = {
                available: 'bg-green-500',
                busy: 'bg-blue-500',
                returning: 'bg-yellow-500',
                resting: 'bg-gray-500'
              }
              const statusText = {
                available: 'AVAILABLE',
                busy: 'BUSY',
                returning: 'RETURNING',
                resting: 'RESTING'
              }
              
              return (
                <div
                  key={hero.id}
                  onClick={() => dispatch({ type: 'VIEW_HERO', heroId: hero.id })}
                  className="flex-shrink-0 w-24 bg-slate-800 rounded-lg border-2 border-slate-700 p-2 cursor-pointer hover:border-cyan-500 transition-all relative group"
                >
                  <div className={`absolute top-0 left-0 right-0 text-[10px] text-center py-0.5 rounded-t-lg font-bold ${statusColors[hero.status]} uppercase tracking-tight`}>
                    {statusText[hero.status]}
                  </div>
                  <div className="mt-5 w-14 h-14 mx-auto bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-xl font-bold mb-1 border-2 border-slate-700">
                    {hero.name.charAt(0)}
                  </div>
                  <div className="text-[10px] text-center font-bold truncate px-1">{hero.name.toUpperCase()}</div>
                  <div className="absolute bottom-1 right-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className="absolute bottom-1 left-1 w-2 h-2 bg-cyan-400 rounded-sm" />
                </div>
              )
            })}
        </div>
      </div>
      
      {/* Episode Timer */}
      <div className="absolute top-16 left-4 bg-black/80 backdrop-blur-sm px-4 py-2 rounded border border-cyan-500/30">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span className="font-mono text-lg">{formatTime(state.episodeTimer)}</span>
        </div>
        <div className="text-xs text-slate-400 mt-1">Episode {state.currentEpisode}</div>
      </div>
      
      {/* Stats Panel */}
      <div className="absolute top-16 right-4 bg-black/80 backdrop-blur-sm px-4 py-2 rounded border border-cyan-500/30 text-xs">
        <div>Success: <span className="text-green-400">{state.stats.successful}</span></div>
        <div>Failed: <span className="text-red-400">{state.stats.failed}</span></div>
        <div>Missed: <span className="text-yellow-400">{state.stats.missed}</span></div>
      </div>
      
      {/* Notifications */}
      <div className="fixed bottom-20 right-4 space-y-2 z-50">
        {state.notifications.map(notif => (
          <div
            key={notif.id}
            className={`p-3 rounded-lg shadow-lg min-w-[250px] text-sm ${
              notif.type === 'success'
                ? 'bg-green-500'
                : notif.type === 'error'
                ? 'bg-red-500'
                : 'bg-blue-500'
            }`}
          >
            {notif.message}
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// MISSION DETAIL SCREEN (Image 1 style)
// ============================================================================

function MissionDetailScreen({ state, dispatch, calculateSuccess, handleDispatch }) {
  const call = state.selectedCall
  if (!call) return null
  
  const selectedHeroes = state.selectedHeroes.map(id => state.heroes.find(h => h.id === id)).filter(Boolean)
  const successRate = calculateSuccess(selectedHeroes, call)
  
  // Calculate team stats for radar chart
  const teamStats = selectedHeroes.reduce((acc, hero) => ({
    combat: acc.combat + hero.combat,
    vigor: acc.vigor + hero.vigor,
    mobility: acc.mobility + hero.mobility,
    charisma: acc.charisma + hero.charisma,
    intellect: acc.intellect + hero.intellect
  }), { combat: 0, vigor: 0, mobility: 0, charisma: 0, intellect: 0 })
  
  // Max value is 15 per stat (boundary of pentagon)
  const maxStatValue = 15
  
  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      {/* Top Header */}
      <div className="bg-black/90 border-b border-cyan-500/30 p-2">
        <div className="flex justify-between items-center text-xs">
          <div className="font-bold text-cyan-400 text-lg">SDN</div>
          <div className="flex gap-4 text-slate-300">
            <span>{new Date().toLocaleTimeString()}</span>
            <span>22°C</span>
            <span>Humidity: 40%</span>
          </div>
        </div>
      </div>
      
      {/* Main Layout - Three Panels - Very compact */}
      <div className="flex h-[calc(100vh-280px)]">
        {/* Left Panel - Mission Illustration */}
        <div className="w-56 bg-slate-900 border-r border-cyan-500/30 p-3">
          <div className="text-cyan-400 font-bold text-sm mb-2">INVESTIGATION</div>
          <div className="bg-slate-800 rounded-lg h-32 mb-2 overflow-hidden border border-cyan-500/30 relative">
            {/* Detailed mission scene based on type */}
            {call.templateType === 'Investigation' ? (
              <div className="w-full h-full bg-gradient-to-br from-amber-900/30 via-slate-800 to-slate-900 p-4 relative">
                {/* Messy room scene */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-4 left-4 w-16 h-12 bg-amber-700/50 rounded"></div>
                  <div className="absolute top-8 right-8 w-12 h-8 bg-slate-600/50 rounded"></div>
                  <div className="absolute bottom-8 left-8 w-20 h-4 bg-amber-600/50 rounded"></div>
                  <div className="absolute bottom-12 right-12 w-8 h-8 bg-slate-500/50 rounded-full"></div>
                </div>
                <div className="relative z-10 text-center text-slate-300 mt-20">
                  <div className="text-5xl mb-2">🔍</div>
                  <div className="text-xs">Messy Room Scene</div>
                </div>
              </div>
            ) : call.templateType === 'Disaster' ? (
              <div className="w-full h-full bg-gradient-to-br from-red-900/40 via-orange-900/30 to-slate-800 p-4 relative">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-6 left-6 w-24 h-16 bg-red-600/50 rounded"></div>
                  <div className="absolute bottom-6 right-6 w-16 h-20 bg-orange-600/50 rounded"></div>
                </div>
                <div className="relative z-10 text-center text-slate-300 mt-20">
                  <div className="text-5xl mb-2">🚨</div>
                  <div className="text-xs">Emergency Scene</div>
                </div>
              </div>
            ) : call.templateType === 'Combat' ? (
              <div className="w-full h-full bg-gradient-to-br from-red-900/40 via-slate-800 to-slate-900 p-4 relative">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-4 left-4 w-20 h-12 bg-red-600/50 rounded"></div>
                  <div className="absolute bottom-4 right-4 w-16 h-16 bg-red-700/50 rounded-full"></div>
                </div>
                <div className="relative z-10 text-center text-slate-300 mt-20">
                  <div className="text-5xl mb-2">⚔️</div>
                  <div className="text-xs">Combat Zone</div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 p-4 flex items-center justify-center">
                <div className="text-center text-slate-400">
                  <div className="text-5xl mb-2">
                    {call.templateType === 'Rescue' ? '🚨' : 
                     call.templateType === 'Stealth' ? '🥷' :
                     call.templateType === 'Defense' ? '🛡️' : '📋'}
                  </div>
                  <div className="text-sm">{call.templateType} Mission</div>
                </div>
              </div>
            )}
          </div>
          <div className="text-[10px] text-slate-400 mb-1">SECURITY / @TORRCOLLEGE</div>
          <div className="bg-slate-800 rounded p-2 border-l-4 border-cyan-500 italic text-xs">
            "{call.description}"
          </div>
        </div>
        
        {/* Center Panel - Mission Details & Hero Selection */}
        <div className="flex-1 bg-slate-900 p-4 flex flex-col">
          <div className="text-center mb-2">
            <h2 className="text-xl font-bold text-cyan-400 mb-1">{call.title}</h2>
            <p className="text-xs text-slate-400">{call.templateType} - {call.priority}</p>
          </div>
          
          {/* Radar Chart - Even smaller */}
          <div className="mb-3 flex justify-center">
            {renderPentagonRadarChart(teamStats, maxStatValue, 160, true)}
          </div>
          
          {/* Hero Selection Slots - Very compact */}
          <div className="mb-3">
            <div className="text-[10px] text-slate-400 mb-1 text-center">
              Selected Heroes ({selectedHeroes.length}/{call.slots})
            </div>
            <div className={`grid gap-3 mb-4 ${
              call.slots === 1 ? 'grid-cols-1' : 
              call.slots === 2 ? 'grid-cols-2' : 
              call.slots === 3 ? 'grid-cols-3' : 'grid-cols-4'
            }`}>
              {Array.from({ length: call.slots }).map((_, i) => {
                const hero = selectedHeroes[i]
                return (
                  <div
                    key={i}
                    onClick={() => {
                      // If hero is in slot, remove them. Otherwise, do nothing (selection happens from roster)
                      if (hero) {
                        dispatch({ type: 'SELECT_HERO', heroId: hero.id })
                      }
                    }}
                    className={`h-16 rounded-lg border-2 flex flex-col items-center justify-center transition-all relative ${
                      hero
                        ? 'border-yellow-500 bg-yellow-500/20 cursor-pointer hover:bg-yellow-500/30 group'
                        : selectedHeroes.length >= call.slots
                        ? 'border-dashed border-slate-600 bg-slate-800/50 opacity-50 cursor-not-allowed'
                        : 'border-dashed border-cyan-500/50 bg-slate-800 hover:border-cyan-500 cursor-pointer'
                    }`}
                  >
                    {hero && (
                      <div className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-3 h-3 text-white" />
                      </div>
                    )}
                    {hero ? (
                      <>
                        {/* Character Portrait - Very compact */}
                        <div className="w-10 h-10 mx-auto mb-0.5 relative">
                          <div className={`w-full h-full rounded-lg flex items-center justify-center text-sm font-bold border-2 border-yellow-400 ${
                            hero.class === 'Brawler' ? 'bg-gradient-to-br from-red-500 to-red-700' :
                            hero.class === 'Speedster' ? 'bg-gradient-to-br from-yellow-500 to-yellow-700' :
                            hero.class === 'Tank' ? 'bg-gradient-to-br from-blue-500 to-blue-700' :
                            hero.class === 'Genius' ? 'bg-gradient-to-br from-purple-500 to-purple-700' :
                            hero.class === 'Diplomat' ? 'bg-gradient-to-br from-green-500 to-green-700' :
                            hero.class === 'Elemental' ? 'bg-gradient-to-br from-orange-500 to-orange-700' :
                            'bg-gradient-to-br from-cyan-500 to-blue-500'
                          }`}>
                            {hero.name.charAt(0)}
                          </div>
                          {/* Status indicator */}
                          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-yellow-400 rounded-full border border-slate-900"></div>
                        </div>
                        <div className="font-bold text-[9px] text-center px-1 truncate">{hero.name}</div>
                        <div className="text-[7px] text-slate-400 truncate">{hero.class}</div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        <div className="text-cyan-400 text-4xl mb-1">+</div>
                        <div className="text-[10px] text-slate-500">Select Hero</div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Action Buttons - Dispatch button visible above heroes */}
          <div className="flex gap-2 mt-auto pt-2">
            <button
              onClick={() => dispatch({ type: 'CLOSE_CALL' })}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold text-xs transition-all"
            >
              BACK
            </button>
            <button
              onClick={handleDispatch}
              disabled={selectedHeroes.length !== call.slots || selectedHeroes.length === 0}
              className={`flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-lg font-bold text-sm shadow-lg shadow-orange-500/50 transition-all transform uppercase tracking-wider ${
                selectedHeroes.length === call.slots && selectedHeroes.length > 0
                  ? 'hover:scale-105 hover:shadow-orange-500/70 cursor-pointer' 
                  : 'opacity-50 cursor-not-allowed'
              }`}
              style={{ 
                pointerEvents: selectedHeroes.length !== call.slots ? 'none' : 'auto'
              }}
            >
              {selectedHeroes.length === call.slots && selectedHeroes.length > 0 ? '✓ DISPATCH' : `DISPATCH (${selectedHeroes.length}/${call.slots})`}
            </button>
          </div>
        </div>
        
        {/* Right Panel - Requirements (Cryptic, no explicit stats) */}
        <div className="w-56 bg-slate-900 border-l border-cyan-500/30 p-3">
          <div className="text-cyan-400 font-bold text-sm mb-2">REQUIREMENTS</div>
          <div className="space-y-2 text-xs">
            <div className="text-slate-300">
              &gt; {call.description.split('.')[0]}
            </div>
            <div className="text-slate-300">
              &gt; Complete the {call.templateType.toLowerCase()} mission successfully
            </div>
            {call.keywords.map((keyword, i) => (
              <div key={i} className="text-cyan-400 font-semibold">
                &gt; {keyword} required
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Hero Roster at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/90 border-t border-cyan-500/30 p-3">
        <div className="flex gap-3 overflow-x-auto">
          {state.heroes
            .filter(h => (h.unlocked || state.unlocks.heroesUnlocked.includes(h.id)) && h.status === 'available')
            .map(hero => {
              const isSelected = state.selectedHeroes.includes(hero.id)
              return (
                <div
                  key={hero.id}
                  onClick={() => {
                    if (selectedHeroes.length < call.slots || selectedHeroes.includes(hero.id)) {
                      dispatch({ type: 'SELECT_HERO', heroId: hero.id })
                    }
                  }}
                  className={`flex-shrink-0 w-24 bg-slate-800 rounded-lg border-2 p-2 transition-all ${
                    isSelected 
                      ? 'border-yellow-500 bg-yellow-500/10 cursor-pointer hover:bg-yellow-500/20 shadow-lg shadow-yellow-500/50'
                      : selectedHeroes.length >= call.slots
                      ? 'border-slate-700 opacity-50 cursor-not-allowed'
                      : 'border-slate-700 hover:border-cyan-500 cursor-pointer'
                  }`}
                >
                  {/* Character Portrait - More detailed like reference */}
                  <div className="w-16 h-16 mx-auto mb-2 relative">
                    <div className={`w-full h-full rounded-lg flex items-center justify-center text-xl font-bold border-2 ${
                      isSelected ? 'border-yellow-400' : 'border-slate-600'
                    } ${
                      hero.class === 'Brawler' ? 'bg-gradient-to-br from-red-500 to-red-700' :
                      hero.class === 'Speedster' ? 'bg-gradient-to-br from-yellow-500 to-yellow-700' :
                      hero.class === 'Tank' ? 'bg-gradient-to-br from-blue-500 to-blue-700' :
                      hero.class === 'Genius' ? 'bg-gradient-to-br from-purple-500 to-purple-700' :
                      hero.class === 'Diplomat' ? 'bg-gradient-to-br from-green-500 to-green-700' :
                      hero.class === 'Elemental' ? 'bg-gradient-to-br from-orange-500 to-orange-700' :
                      'bg-gradient-to-br from-cyan-500 to-blue-500'
                    }`}>
                      {hero.name.charAt(0)}
                    </div>
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border border-slate-900"></div>
                    )}
                  </div>
                  <div className="text-xs text-center font-bold truncate">{hero.name}</div>
                  <div className="text-[10px] text-slate-400 text-center truncate">{hero.class}</div>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MISSION COMPLETE SCREEN (Image 4 style)
// ============================================================================

function MissionCompleteScreen({ state, dispatch }) {
  const mission = state.completedMission
  if (!mission) return null
  
  // Get heroes from mission data if available
  const missionHeroIds = mission.selectedHeroes || []
  const selectedHeroes = missionHeroIds.map(id => state.heroes.find(h => h.id === id)).filter(Boolean)
  const teamStats = selectedHeroes.reduce((acc, hero) => ({
    combat: acc.combat + (hero.combat || 0),
    vigor: acc.vigor + (hero.vigor || 0),
    mobility: acc.mobility + (hero.mobility || 0),
    charisma: acc.charisma + (hero.charisma || 0),
    intellect: acc.intellect + (hero.intellect || 0)
  }), { combat: 0, vigor: 0, mobility: 0, charisma: 0, intellect: 0 })
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-900 border-b border-cyan-500/30 p-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>SDN</span>
          <div className="flex gap-4">
            <span>{new Date().toLocaleTimeString()}</span>
            <span>22°C</span>
            <span>Humidity: 40%</span>
          </div>
        </div>
      </div>
      
      {/* Main Content - Three Panel Layout like image */}
      <div className="flex h-[calc(100vh-60px)]">
        {/* Left Panel - Mission Type */}
        <div className="w-80 bg-slate-900 border-r border-cyan-500/30 p-6">
          <div className="text-cyan-400 font-bold text-lg mb-4 flex items-center gap-2">
            <Timer className="w-5 h-5" />
            {mission.templateType?.toUpperCase() || 'MISSION'}
          </div>
          <div className="bg-slate-800 rounded-lg h-64 mb-4 flex items-center justify-center border border-cyan-500/30">
            <div className="text-center text-slate-400">
              <div className="text-4xl mb-2">
                {mission.templateType === 'Combat' ? '⚔️' : 
                 mission.templateType === 'Investigation' ? '🔍' :
                 mission.templateType === 'Rescue' ? '🚨' : '📋'}
              </div>
              <div className="text-sm">{mission.templateType} Mission</div>
            </div>
          </div>
          <div className="text-xs text-slate-400 mb-2">MISSION / @DISPATCH</div>
          <div className="bg-slate-800 rounded p-3 border-l-4 border-cyan-500 italic text-sm">
            "{mission.description}"
          </div>
        </div>
        
        {/* Center Panel - Performance Art / Results */}
        <div className="flex-1 bg-slate-900 p-8 flex flex-col">
          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold text-cyan-400 mb-2">{mission.templateType || 'Performance Art'}</h2>
            <p className="text-slate-400 italic">"{selectedHeroes[0]?.name || 'Hero'}: {mission.success ? 'Mission accomplished.' : 'That was rough.'}"</p>
          </div>
          
          {/* Radar Chart */}
          <div className="mb-6 flex justify-center">
            {renderPentagonRadarChart(teamStats, 15, 300, true)}
          </div>
          
          {/* Success Percentage - Large display */}
          <div className="flex justify-center mb-6">
            <div className="relative bg-orange-500/20 border-2 border-orange-500 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <div className="text-5xl font-bold text-orange-400">100%</div>
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-4 mt-auto">
            <button
              onClick={() => dispatch({ type: 'CLOSE_MISSION_COMPLETE' })}
              className="px-8 py-4 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-bold text-lg"
            >
              BACK
            </button>
          </div>
        </div>
        
        {/* Right Panel - Requirements */}
        <div className="w-80 bg-slate-900 border-l border-cyan-500/30 p-6">
          <div className="text-cyan-400 font-bold text-lg mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            REQUIREMENTS
          </div>
          <div className="space-y-3 text-sm">
            <div className="text-slate-300 flex items-start gap-2">
              <span className="text-orange-400">🧠</span>
              <span>Mission required <span className="text-orange-400 font-bold">investigation</span> and <span className="text-orange-400 font-bold">intellect</span></span>
            </div>
            <div className="text-slate-300 flex items-start gap-2">
              <span className="text-orange-400">🛡️</span>
              <span>Send someone <span className="text-orange-400 font-bold">strategically capable</span></span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hero Roster at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/90 border-t border-cyan-500/30 p-3 z-30">
        <div className="flex gap-3 overflow-x-auto">
          {state.heroes
            .filter(h => (h.unlocked || state.unlocks.heroesUnlocked.includes(h.id)) && (state.team?.length > 0 ? state.team.includes(h.id) : true))
            .slice(0, 12)
            .map(hero => {
              const statusColors = {
                available: 'bg-green-500',
                busy: 'bg-blue-500',
                returning: 'bg-yellow-500',
                resting: 'bg-gray-500'
              }
              return (
                <div
                  key={hero.id}
                  className="flex-shrink-0 w-24 bg-slate-800 rounded-lg border-2 border-slate-700 p-2 relative"
                >
                  <div className={`absolute top-0 left-0 right-0 text-[10px] text-center py-0.5 rounded-t-lg font-bold ${statusColors[hero.status]} uppercase`}>
                    {hero.status}
                  </div>
                  <div className="mt-5 w-14 h-14 mx-auto bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-xl font-bold mb-1">
                    {hero.name.charAt(0)}
                  </div>
                  <div className="text-[10px] text-center font-bold truncate">{hero.name.toUpperCase()}</div>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MISSION RESULT SCREEN (Shows success/failure after clicking back)
// ============================================================================

function MissionResultScreen({ state, dispatch }) {
  const mission = state.completedMission
  if (!mission) return null
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center p-8">
      <div className="max-w-4xl w-full bg-slate-900 rounded-lg border-2 border-cyan-500/30 p-8">
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold mb-4">{mission.title}</h2>
          <div className={`text-2xl font-bold mb-4 ${mission.success ? 'text-green-400' : 'text-red-400'}`}>
            {mission.success ? '✓ MISSION SUCCESSFUL' : '✗ MISSION FAILED'}
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-slate-400 text-sm mb-1">Success Rate</div>
              <div className="text-3xl font-bold text-cyan-400">{mission.successRate}%</div>
            </div>
            <div>
              <div className="text-slate-400 text-sm mb-1">XP Gained</div>
              <div className="text-3xl font-bold text-yellow-400">{mission.success ? mission.reward : 0}</div>
            </div>
          </div>
        </div>
        
        <div className={`p-4 rounded-lg mb-6 ${mission.success ? 'bg-green-900/30 border-2 border-green-500' : 'bg-red-900/30 border-2 border-red-500'}`}>
          <div className="text-center">
            <p className="text-lg">
              {mission.success 
                ? `Your heroes successfully completed the ${mission.templateType?.toLowerCase() || 'mission'}!`
                : `Your heroes were unable to complete the ${mission.templateType?.toLowerCase() || 'mission'}.`}
            </p>
          </div>
        </div>
        
        <div className="text-center">
          <button
            onClick={() => dispatch({ type: 'CLOSE_MISSION_RESULT' })}
            className="px-8 py-4 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-bold text-lg"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// HERO UPGRADE SCREEN (Image 3 style)
// ============================================================================

function HeroUpgradeScreen({ state, dispatch }) {
  const hero = state.heroes.find(h => h.id === state.viewingHero)
  if (!hero) return null
  
  const [activeTab, setActiveTab] = useState('UPGRADE')
  
  // Hero stats for radar chart (using different stat names for upgrade screen)
  const heroStatsForChart = {
    combat: hero.combat,
    vigor: hero.vigor,
    mobility: hero.mobility,
    charisma: hero.charisma,
    intellect: hero.intellect
  }
  
  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      {/* Top Header */}
      <div className="bg-black/90 border-b border-cyan-500/30 p-2">
        <div className="flex justify-between items-center">
          <div className="font-bold text-cyan-400 text-lg">SDN</div>
          <button
            onClick={() => dispatch({ type: 'CLOSE_HERO_UPGRADE' })}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded"
          >
            CLOSE
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-2 border-b border-cyan-500/30 bg-slate-900 px-4">
        {['UPGRADE', 'POWERS', 'INFO'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-bold border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-green-500 text-green-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      
      {/* Main Content */}
      <div className="flex h-[calc(100vh-120px)]">
        {/* Left - Character Illustration */}
        <div className="w-80 bg-slate-900 border-r border-cyan-500/30 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-48 h-48 mx-auto bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-6xl font-bold mb-4">
              {hero.name.charAt(0)}
            </div>
            <div className="text-2xl font-bold mb-2">{hero.name.toUpperCase()}</div>
            <div className="text-slate-400">{hero.class} RANK {hero.level}</div>
          </div>
        </div>
        
        {/* Center - Stats Panel */}
        <div className="flex-1 bg-slate-900 p-8">
          {activeTab === 'UPGRADE' && (
            <>
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">STATS</h3>
                <div className="text-sm text-slate-400 mb-4">SKILL POINTS: {hero.skillPoints}</div>
                <div className="space-y-3">
                  {[
                    { label: 'DEFENSE', stat: 'vigor', icon: '🛡️' },
                    { label: 'MOBILITY', stat: 'mobility', icon: '🏃' },
                    { label: 'CHARISMA', stat: 'charisma', icon: '💬' },
                    { label: 'INTELLIGENCE', stat: 'intellect', icon: '🧠' },
                    { label: 'ATTACK', stat: 'combat', icon: '⚔️' }
                  ].map(({ label, stat, icon }) => (
                    <div key={stat} className="flex items-center justify-between bg-slate-800 p-3 rounded">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{icon}</span>
                        <span className="font-bold">{label}:</span>
                        <span className="text-cyan-400">{hero[stat]}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => dispatch({ type: 'UPDATE_HERO_STAT', heroId: hero.id, stat, delta: 1 })}
                          disabled={hero.skillPoints === 0 || hero[stat] >= 15}
                          className="w-8 h-8 bg-green-500 hover:bg-green-600 rounded disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 mt-6">
                  <button className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded font-bold">
                    RESET
                  </button>
                  <button className="px-6 py-2 bg-green-500 hover:bg-green-600 rounded font-bold">
                    CONFIRM
                  </button>
                </div>
              </div>
            </>
          )}
          {activeTab === 'POWERS' && (
            <div className="text-center text-slate-400 mt-8">
              <p>Special abilities and powers for {hero.name}</p>
            </div>
          )}
          {activeTab === 'INFO' && (
            <div className="text-center text-slate-400 mt-8">
              <p>Hero information and backstory</p>
            </div>
          )}
        </div>
        
        {/* Right - Radar Chart */}
        <div className="w-80 bg-slate-900 border-l border-cyan-500/30 p-8">
          <h3 className="text-xl font-bold mb-4">{hero.name.toUpperCase()} GRAPH</h3>
          {renderPentagonRadarChart(heroStatsForChart, 15, 250, false)}
          <div className="mt-6 text-center">
            <div className="text-sm text-slate-400 mb-2">LEVEL {hero.level}</div>
            <div className="flex gap-1 justify-center">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-8 h-2 rounded ${
                    i < Math.floor((hero.xp / hero.xpToNext) * 4)
                      ? 'bg-cyan-500'
                      : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Hero Roster at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/90 border-t border-cyan-500/30 p-3">
        <div className="flex gap-3 overflow-x-auto">
          {availableHeroes
            .slice(0, 12)
            .map(h => (
              <div
                key={h.id}
                onClick={() => dispatch({ type: 'VIEW_HERO', heroId: h.id })}
                className={`flex-shrink-0 w-20 bg-slate-800 rounded-lg border-2 p-2 cursor-pointer transition-all ${
                  h.id === hero.id ? 'border-yellow-500' : 'border-slate-700 hover:border-cyan-500'
                }`}
              >
                <div className="w-12 h-12 mx-auto bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-lg font-bold mb-1">
                  {h.name.charAt(0)}
                </div>
                <div className="text-xs text-center font-bold truncate">{h.name}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// TEAM SELECT SCREEN
// ============================================================================

function TeamSelectScreen({ state, dispatch }) {
  const [mode, setMode] = useState('preset')
  const [selectedTeam, setSelectedTeam] = useState([])
  
  // Create preset teams with unique heroes - ensure each team has different heroes
  const availableForTeams = state.heroes.filter(h => h.unlocked || state.unlocks.heroesUnlocked.includes(h.id))
  
  // Balanced Squad - mix of all classes
  const balancedHeroes = []
  const classes = ['Brawler', 'Speedster', 'Tank', 'Diplomat', 'Genius', 'Elemental', 'Mystic']
  classes.forEach(cls => {
    const hero = availableForTeams.find(h => h.class === cls && !balancedHeroes.includes(h.id))
    if (hero) balancedHeroes.push(hero.id)
  })
  // Fill remaining slots with any available heroes
  while (balancedHeroes.length < 6 && availableForTeams.length > balancedHeroes.length) {
    const hero = availableForTeams.find(h => !balancedHeroes.includes(h.id))
    if (hero) balancedHeroes.push(hero.id)
    else break
  }
  
  // Combat Force - brawlers and tanks
  const combatHeroes = availableForTeams
    .filter(h => (h.class === 'Brawler' || h.class === 'Tank') && !balancedHeroes.includes(h.id))
    .slice(0, 6)
    .map(h => h.id)
  // If not enough, allow overlap but prefer unique
  if (combatHeroes.length < 6) {
    const additional = availableForTeams
      .filter(h => (h.class === 'Brawler' || h.class === 'Tank') && !combatHeroes.includes(h.id))
      .slice(0, 6 - combatHeroes.length)
      .map(h => h.id)
    combatHeroes.push(...additional)
  }
  
  // Speed Demons - speedsters
  const speedHeroes = availableForTeams
    .filter(h => h.class === 'Speedster' && !balancedHeroes.includes(h.id) && !combatHeroes.includes(h.id))
    .slice(0, 6)
    .map(h => h.id)
  if (speedHeroes.length < 6) {
    const additional = availableForTeams
      .filter(h => h.class === 'Speedster' && !speedHeroes.includes(h.id))
      .slice(0, 6 - speedHeroes.length)
      .map(h => h.id)
    speedHeroes.push(...additional)
  }
  
  // Think Tank - geniuses and diplomats
  const thinkHeroes = availableForTeams
    .filter(h => (h.class === 'Genius' || h.class === 'Diplomat') && 
                  !balancedHeroes.includes(h.id) && !combatHeroes.includes(h.id) && !speedHeroes.includes(h.id))
    .slice(0, 6)
    .map(h => h.id)
  if (thinkHeroes.length < 6) {
    const additional = availableForTeams
      .filter(h => (h.class === 'Genius' || h.class === 'Diplomat') && !thinkHeroes.includes(h.id))
      .slice(0, 6 - thinkHeroes.length)
      .map(h => h.id)
    thinkHeroes.push(...additional)
  }
  
  // Elemental Fury - elementals and mystics
  const elementalHeroes = availableForTeams
    .filter(h => (h.class === 'Elemental' || h.class === 'Mystic') && 
                  !balancedHeroes.includes(h.id) && !combatHeroes.includes(h.id) && 
                  !speedHeroes.includes(h.id) && !thinkHeroes.includes(h.id))
    .slice(0, 6)
    .map(h => h.id)
  if (elementalHeroes.length < 6) {
    const additional = availableForTeams
      .filter(h => (h.class === 'Elemental' || h.class === 'Mystic') && !elementalHeroes.includes(h.id))
      .slice(0, 6 - elementalHeroes.length)
      .map(h => h.id)
    elementalHeroes.push(...additional)
  }
  
  const presetTeams = [
    { name: 'Balanced Squad', description: 'Mix of all classes', heroes: balancedHeroes.slice(0, 6) },
    { name: 'Combat Force', description: 'All brawlers/tanks', heroes: combatHeroes.slice(0, 6) },
    { name: 'Speed Demons', description: 'All speedsters', heroes: speedHeroes.slice(0, 6) },
    { name: 'Think Tank', description: 'All geniuses/diplomats', heroes: thinkHeroes.slice(0, 6) },
    { name: 'Elemental Fury', description: 'All elementals/mystics', heroes: elementalHeroes.slice(0, 6) }
  ]
  
  const availableHeroes = state.heroes.filter(h => h.unlocked || state.unlocks.heroesUnlocked.includes(h.id))
  
  const handleConfirm = () => {
    if (selectedTeam.length === 6) {
      dispatch({ type: 'SELECT_TEAM', team: selectedTeam, mode })
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-cyan-400 mb-8 text-center">Select Your Team</h1>
        <div className="flex gap-4 mb-6">
          <button onClick={() => setMode('preset')} className={`px-6 py-3 rounded-lg font-bold ${mode === 'preset' ? 'bg-cyan-500' : 'bg-slate-700'}`}>
            Preset Teams
          </button>
          <button onClick={() => setMode('custom')} className={`px-6 py-3 rounded-lg font-bold ${mode === 'custom' ? 'bg-cyan-500' : 'bg-slate-700'}`}>
            Custom Team
          </button>
        </div>
        {mode === 'preset' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {presetTeams.map((team, i) => {
              const teamHeroes = state.heroes.filter(h => team.heroes.includes(h.id))
              const isSelected = JSON.stringify(selectedTeam.sort()) === JSON.stringify(team.heroes.sort())
              return (
                <div 
                  key={i} 
                  onClick={() => setSelectedTeam(team.heroes)} 
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected ? 'border-yellow-500 bg-yellow-500/10' : 'border-cyan-500 hover:border-cyan-400'
                  }`}
                >
                  <h3 className="text-xl font-bold mb-2">{team.name}</h3>
                  <p className="text-sm text-slate-300 mb-3">{team.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {teamHeroes.slice(0, 6).map(hero => (
                      <div key={hero.id} className="px-2 py-1 bg-slate-700 rounded text-xs">
                        {hero.name}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="mb-8">
            <p className="text-slate-300 mb-4">Select 6 heroes ({selectedTeam.length}/6)</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {availableHeroes.map(hero => {
                const isSelected = selectedTeam.includes(hero.id)
                return (
                  <div key={hero.id} onClick={() => {
                    if (isSelected) setSelectedTeam(selectedTeam.filter(id => id !== hero.id))
                    else if (selectedTeam.length < 6) setSelectedTeam([...selectedTeam, hero.id])
                  }} className={`p-4 rounded-lg border-2 cursor-pointer ${isSelected ? 'border-yellow-500' : 'border-cyan-500'}`}>
                    <div className="font-bold">{hero.name}</div>
                    <div className="text-xs text-slate-300">{hero.class}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        <div className="flex justify-center">
          <button onClick={handleConfirm} disabled={selectedTeam.length !== 6} className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-xl rounded-lg disabled:opacity-50">
            Confirm Team ({selectedTeam.length}/6)
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// EPISODE INTRO SCREEN
// ============================================================================

const episodeIntros = {
  1: "Welcome to the Dispatch Agency. You're a rookie dispatcher managing a team of heroes.",
  2: "Hero relationships are revealed. Some heroes work better together, while others may sabotage missions.",
  3: "The sabotage system activates. Be careful when pairing heroes!",
  4: "Hacking missions appear! These require quick thinking.",
  5: "Conflict calls emerge - two urgent situations at once. Choose wisely!",
  6: "The fatigue system kicks in. Heroes get tired after multiple missions.",
  7: "Special abilities unlock! Each hero class now has unique powers.",
  8: "Boss missions appear! These require specific strategies.",
  9: "Multi-stage missions challenge your team coordination.",
  10: "The final challenge! All mechanics combined."
}

function EpisodeIntroScreen({ state, dispatch }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center p-8">
      <div className="max-w-3xl w-full bg-slate-800 border-2 border-cyan-500 rounded-lg p-8 text-center">
        <h2 className="text-5xl font-bold text-cyan-400 mb-6">Episode {state.currentEpisode}</h2>
        <p className="text-xl text-slate-300 mb-8">{episodeIntros[state.currentEpisode]}</p>
        <button onClick={() => dispatch({ type: 'START_EPISODE' })} className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold text-xl rounded-lg">
          Begin Episode {state.currentEpisode}
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// EPISODE COMPLETE SCREEN
// ============================================================================

function EpisodeCompleteScreen({ state, dispatch }) {
  const successRate = state.stats.successful + state.stats.failed > 0 ? Math.round((state.stats.successful / (state.stats.successful + state.stats.failed)) * 100) : 0
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-slate-800 border-2 border-cyan-500 rounded-lg p-8">
        <h2 className="text-4xl font-bold text-cyan-400 mb-6 text-center">Episode {state.currentEpisode} Complete!</h2>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-slate-700 rounded-lg text-center">
            <div className="text-3xl font-bold text-green-400">{state.stats.successful}</div>
            <div className="text-slate-300">Successful</div>
          </div>
          <div className="p-4 bg-slate-700 rounded-lg text-center">
            <div className="text-3xl font-bold text-red-400">{state.stats.failed}</div>
            <div className="text-slate-300">Failed</div>
          </div>
          <div className="p-4 bg-slate-700 rounded-lg text-center">
            <div className="text-3xl font-bold text-yellow-400">{state.stats.missed}</div>
            <div className="text-slate-300">Missed</div>
          </div>
          <div className="p-4 bg-slate-700 rounded-lg text-center">
            <div className="text-3xl font-bold text-cyan-400">{successRate}%</div>
            <div className="text-slate-300">Success Rate</div>
          </div>
        </div>
        <button onClick={() => dispatch({ type: 'NEXT_EPISODE' })} className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-lg font-bold text-xl">
          {state.currentEpisode < 10 ? 'Continue to Next Episode' : 'View Final Results'}
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// FINAL RESULTS SCREEN
// ============================================================================

function FinalResultsScreen({ state }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center p-8">
      <div className="max-w-3xl w-full bg-slate-800 border-2 border-cyan-500 rounded-lg p-8">
        <h2 className="text-5xl font-bold text-cyan-400 mb-8 text-center">Game Complete!</h2>
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-6 bg-slate-700 rounded-lg text-center">
            <div className="text-4xl font-bold text-green-400">{state.stats.successful}</div>
            <div className="text-slate-300">Total Successful</div>
          </div>
          <div className="p-6 bg-slate-700 rounded-lg text-center">
            <div className="text-4xl font-bold text-blue-400">{state.stats.totalXP}</div>
            <div className="text-slate-300">Total XP</div>
          </div>
          <div className="p-6 bg-slate-700 rounded-lg text-center">
            <div className="text-4xl font-bold text-cyan-400">{state.stats.rank}</div>
            <div className="text-slate-300">Final Rank</div>
          </div>
        </div>
        <div className="text-center">
          <p className="text-xl text-slate-300">Thank you for playing!</p>
        </div>
      </div>
    </div>
  )
}

export default App
