import { create } from 'zustand'

// Hero state machine
export const HERO_STATUS = {
  AVAILABLE: 'available',
  BUSY: 'busy',
  RETURNING: 'returning',
  RESTING: 'resting',
  INJURED: 'injured',
  DOWNED: 'downed'
}

// Call types
export const CALL_TYPES = {
  STANDARD: 'standard',
  URGENT: 'urgent',
  CONFLICTING: 'conflicting',
  HACKING: 'hacking'
}

// Initial hero roster with unique powers
const initialHeroes = [
  {
    id: 'invisigal',
    name: 'Invisigal',
    class: 'Lone Wolf',
    level: 1,
    xp: 0,
    xpToNext: 100,
    stats: { combat: 3, vigor: 3, mobility: 3, charisma: 1, intellect: 2 },
    status: HERO_STATUS.AVAILABLE,
    restTimeRemaining: 0,
    currentMission: null,
    needsReview: false,
    uniquePower: {
      name: 'Lone Wolf',
      description: 'Works best alone, faster travel time if sent solo',
      effect: (heroes, slot) => {
        if (heroes.length === 1 && heroes[0].id === 'invisigal') {
          return { travelTimeMultiplier: 0.7 }
        }
        return {}
      }
    }
  },
  {
    id: 'flambae',
    name: 'Flambae',
    class: 'Hot Streak',
    level: 1,
    xp: 0,
    xpToNext: 100,
    stats: { combat: 4, vigor: 2, mobility: 3, charisma: 2, intellect: 1 },
    status: HERO_STATUS.AVAILABLE,
    restTimeRemaining: 0,
    currentMission: null,
    needsReview: false,
    streakBonus: { combat: 0, mobility: 0 },
    uniquePower: {
      name: 'Hot Streak',
      description: 'After successful mission gets +1 Combat and +1 Mobility, resets after failure',
      effect: (hero, success) => {
        if (success) {
          return {
            combat: hero.streakBonus.combat + 1,
            mobility: hero.streakBonus.mobility + 1
          }
        } else {
          return { combat: 0, mobility: 0 }
        }
      }
    }
  },
  {
    id: 'prism',
    name: 'Prism',
    class: 'Duplicator',
    level: 1,
    xp: 0,
    xpToNext: 100,
    stats: { combat: 4, vigor: 1, mobility: 1, charisma: 4, intellect: 2 },
    status: HERO_STATUS.AVAILABLE,
    restTimeRemaining: 0,
    currentMission: null,
    needsReview: false,
    uniquePower: {
      name: 'Duplicator',
      description: 'Creates copies of adjacent heroes with half their stats',
      effect: (heroes, slot) => {
        if (heroes.find(h => h.id === 'prism')) {
          const prismIndex = heroes.findIndex(h => h.id === 'prism')
          const adjacentHeroes = []
          if (prismIndex > 0) adjacentHeroes.push(heroes[prismIndex - 1])
          if (prismIndex < heroes.length - 1) adjacentHeroes.push(heroes[prismIndex + 1])
          
          return {
            statBonus: adjacentHeroes.reduce((acc, hero) => {
              Object.keys(hero.stats).forEach(stat => {
                acc[stat] = (acc[stat] || 0) + Math.floor(hero.stats[stat] / 2)
              })
              return acc
            }, {})
          }
        }
        return {}
      }
    }
  },
  {
    id: 'sonar',
    name: 'Sonar',
    class: 'Transformer',
    level: 1,
    xp: 0,
    xpToNext: 100,
    stats: { combat: 2, vigor: 1, mobility: 2, charisma: 3, intellect: 4 },
    status: HERO_STATUS.AVAILABLE,
    restTimeRemaining: 0,
    currentMission: null,
    needsReview: false,
    transformed: false,
    uniquePower: {
      name: 'Transformer',
      description: 'After every situation transforms, stats flip: Intellect↔Combat, Charisma↔Vigor',
      effect: (hero) => {
        return {
          transform: true
        }
      }
    }
  },
  {
    id: 'coupe',
    name: 'Coupé',
    class: 'Assassin',
    level: 1,
    xp: 0,
    xpToNext: 100,
    stats: { combat: 4, vigor: 1, mobility: 3, charisma: 1, intellect: 3 },
    status: HERO_STATUS.AVAILABLE,
    restTimeRemaining: 0,
    currentMission: null,
    needsReview: false,
    uniquePower: {
      name: 'Assassin',
      description: 'Gets +1 Combat in first slot or +1 Mobility in second slot',
      effect: (heroes, slot) => {
        if (heroes[slot]?.id === 'coupe') {
          if (slot === 0) return { combat: 1 }
          if (slot === 1) return { mobility: 1 }
        }
        return {}
      }
    }
  },
  {
    id: 'punchup',
    name: 'Punch Up',
    class: 'Tank',
    level: 1,
    xp: 0,
    xpToNext: 100,
    stats: { combat: 3, vigor: 4, mobility: 1, charisma: 3, intellect: 1 },
    status: HERO_STATUS.AVAILABLE,
    restTimeRemaining: 0,
    currentMission: null,
    needsReview: false,
    uniquePower: {
      name: 'Tank',
      description: 'Immune to injury debuffs, cannot be downed',
      effect: () => ({ immuneToInjury: true })
    }
  },
  {
    id: 'malevola',
    name: 'Malevola',
    class: 'Healer',
    level: 1,
    xp: 0,
    xpToNext: 100,
    stats: { combat: 3, vigor: 2, mobility: 2, charisma: 3, intellect: 2 },
    status: HERO_STATUS.AVAILABLE,
    restTimeRemaining: 0,
    currentMission: null,
    needsReview: false,
    healingBonus: { charisma: 0, vigor: 0 },
    uniquePower: {
      name: 'Healer',
      description: 'When paired with another hero can heal them, gets stacking +1 Charisma and Vigor after healing',
      effect: (heroes, hero) => {
        if (heroes.length > 1 && heroes.find(h => h.id === 'malevola')) {
          return {
            charisma: hero.healingBonus.charisma + 1,
            vigor: hero.healingBonus.vigor + 1
          }
        }
        return {}
      }
    }
  },
  {
    id: 'golem',
    name: 'Golem',
    class: 'Slot-Dependent Tank',
    level: 1,
    xp: 0,
    xpToNext: 100,
    stats: { combat: 3, vigor: 4, mobility: 1, charisma: 1, intellect: 3 },
    status: HERO_STATUS.AVAILABLE,
    restTimeRemaining: 0,
    currentMission: null,
    needsReview: false,
    uniquePower: {
      name: 'Slot-Dependent Tank',
      description: 'Slot positioning grants +2 to one stat with -1 penalty to others',
      effect: (heroes, slot) => {
        if (heroes[slot]?.id === 'golem') {
          const bonuses = [
            { combat: 2, vigor: -1, mobility: -1, charisma: -1, intellect: -1 },
            { vigor: 2, combat: -1, mobility: -1, charisma: -1, intellect: -1 },
            { mobility: 2, combat: -1, vigor: -1, charisma: -1, intellect: -1 }
          ]
          return bonuses[slot] || {}
        }
        return {}
      }
    }
  }
]

export const useGameStore = create((set, get) => ({
  // Game state
  heroes: initialHeroes,
  calls: [],
  gameTime: 0,
  dispatcherRank: 1,
  shiftStats: {
    successful: 0,
    failed: 0,
    missed: 0
  },
  unlockedItems: [],
  openCallId: null,
  missionResults: null,
  levelUpHero: null,
  
  // Call management
  addCall: (call) => set((state) => ({
    calls: [...state.calls, { ...call, id: `call-${Date.now()}-${Math.random()}`, status: 'active' }]
  })),
  
  updateCall: (callId, updates) => set((state) => ({
    calls: state.calls.map(call => 
      call.id === callId ? { ...call, ...updates } : call
    )
  })),
  
  removeCall: (callId) => set((state) => ({
    calls: state.calls.filter(call => call.id !== callId)
  })),
  
  // Hero management
  updateHero: (heroId, updates) => set((state) => ({
    heroes: state.heroes.map(hero =>
      hero.id === heroId ? { ...hero, ...updates } : hero
    )
  })),
  
  dispatchHeroes: (callId, heroIds) => {
    const state = get()
    const call = state.calls.find(c => c.id === callId)
    if (!call || !heroIds || heroIds.length === 0) {
      console.warn('Cannot dispatch: invalid call or no heroes selected')
      return
    }
    
    // Verify all heroes are available
    const selectedHeroes = state.heroes.filter(h => heroIds.includes(h.id))
    const unavailable = selectedHeroes.filter(h => h.status !== HERO_STATUS.AVAILABLE)
    
    if (unavailable.length > 0) {
      console.warn('Cannot dispatch: some heroes are not available', unavailable)
      return
    }
    
    // Update heroes to BUSY
    heroIds.forEach(heroId => {
      state.updateHero(heroId, {
        status: HERO_STATUS.BUSY,
        currentMission: callId
      })
    })
    
    // Update call with assignedAt timestamp
    const assignedAt = Date.now()
    state.updateCall(callId, {
      status: 'in-progress',
      assignedHeroes: heroIds,
      assignedAt: assignedAt
    })
    
    console.log('Dispatched heroes:', heroIds, 'to call:', callId, 'at:', assignedAt)
  },
  
  // Mission completion
  completeMission: (callId, success, xpReward) => {
    const state = get()
    const call = state.calls.find(c => c.id === callId)
    if (!call) return
    
    const heroes = state.heroes.filter(h => call.assignedHeroes.includes(h.id))
    
    // Update heroes
    heroes.forEach(hero => {
      const wasInjured = hero.status === HERO_STATUS.INJURED
      const updates = {
        status: HERO_STATUS.RETURNING,
        currentMission: callId,
        needsReview: true,
        returnStartTime: Date.now()
      }
      
      if (success) {
        const newXP = hero.xp + xpReward
        const xpToNext = hero.xpToNext
        updates.xp = newXP
        
        if (newXP >= xpToNext) {
          updates.level = hero.level + 1
          updates.xp = newXP - xpToNext
          updates.xpToNext = Math.floor(xpToNext * 1.5)
          updates.needsLevelUp = true
        }
        
        // Apply unique power effects
        if (hero.id === 'flambae') {
          updates.streakBonus = {
            combat: (hero.streakBonus?.combat || 0) + 1,
            mobility: (hero.streakBonus?.mobility || 0) + 1
          }
        }
        
        // Malevola healing bonus
        if (hero.id === 'malevola' && heroes.length > 1) {
          updates.healingBonus = {
            charisma: (hero.healingBonus?.charisma || 0) + 1,
            vigor: (hero.healingBonus?.vigor || 0) + 1
          }
        }
      } else {
        // Failure effects
        if (hero.id === 'flambae') {
          updates.streakBonus = { combat: 0, mobility: 0 }
        }
        
        // Chance of injury (unless immune - Punch Up)
        if (hero.id !== 'punchup' && Math.random() < 0.3) {
          updates.status = HERO_STATUS.INJURED
        }
      }
      
      // Sonar transformation
      if (hero.id === 'sonar') {
        const oldStats = { ...hero.stats }
        updates.stats = {
          combat: oldStats.intellect,
          vigor: oldStats.charisma,
          mobility: oldStats.mobility,
          charisma: oldStats.vigor,
          intellect: oldStats.combat
        }
        updates.transformed = !hero.transformed
      }
      
      // Preserve injury status if already injured
      if (wasInjured && !success) {
        updates.status = HERO_STATUS.INJURED
      }
      
      state.updateHero(hero.id, updates)
    })
    
    // Update call
    state.updateCall(callId, {
      status: success ? 'completed' : 'failed'
    })
    
    // Update shift stats
    set((state) => ({
      shiftStats: {
        ...state.shiftStats,
        [success ? 'successful' : 'failed']: state.shiftStats[success ? 'successful' : 'failed'] + 1
      }
    }))
    
    // Show results
    set({ missionResults: { callId, success, heroes, xpReward } })
  },
  
  // Hero state transitions
  tickHeroStates: () => {
    const state = get()
    const now = Date.now()
    
    state.heroes.forEach(hero => {
      if (hero.status === HERO_STATUS.RETURNING) {
        // Transition to resting after return time
        const returnTime = 30000 // 30 seconds
        if (hero.returnStartTime && now - hero.returnStartTime > returnTime) {
          const wasInjured = hero.status === HERO_STATUS.INJURED
          const restTime = wasInjured ? 180000 : 120000 // 3 min injured, 2 min normal
          state.updateHero(hero.id, {
            status: wasInjured ? HERO_STATUS.INJURED : HERO_STATUS.RESTING,
            restTimeRemaining: restTime,
            restStartTime: now,
            returnStartTime: null
          })
        } else if (!hero.returnStartTime) {
          state.updateHero(hero.id, { returnStartTime: now })
        }
      } else if (hero.status === HERO_STATUS.RESTING || hero.status === HERO_STATUS.INJURED) {
        // Countdown rest time
        if (hero.restStartTime) {
          const elapsed = now - hero.restStartTime
          const remaining = Math.max(0, hero.restTimeRemaining - elapsed)
          
          if (remaining <= 0 && !hero.needsReview && !hero.needsLevelUp) {
            state.updateHero(hero.id, {
              status: HERO_STATUS.AVAILABLE,
              restTimeRemaining: 0,
              restStartTime: null,
              currentMission: null
            })
          } else {
            state.updateHero(hero.id, { restTimeRemaining: remaining })
          }
        }
      }
    })
  },
  
  // Review mission results
  reviewMissionResults: () => {
    const state = get()
    const results = state.missionResults
    if (!results) return
    
    results.heroes.forEach(hero => {
      if (hero.needsLevelUp) {
        set({ levelUpHero: hero, missionResults: null })
        return
      }
    })
    
    // Mark heroes as reviewed
    results.heroes.forEach(hero => {
      state.updateHero(hero.id, { needsReview: false })
    })
    
    set({ missionResults: null })
  },
  
  // Level up
  confirmLevelUp: (heroId, statAllocations) => {
    const state = get()
    const hero = state.heroes.find(h => h.id === heroId)
    if (!hero) return
    
    const newStats = { ...hero.stats }
    Object.keys(statAllocations).forEach(stat => {
      newStats[stat] = Math.min(5, (newStats[stat] || 0) + statAllocations[stat])
    })
    
    state.updateHero(heroId, {
      stats: newStats,
      needsLevelUp: false
    })
    
    set({ levelUpHero: null })
  },
  
  // Open/close call briefing
  openCall: (callId) => set({ openCallId: callId }),
  closeCall: () => set({ openCallId: null }),
  
  // Game time
  updateGameTime: (delta) => set((state) => ({ gameTime: state.gameTime + delta }))
}))

