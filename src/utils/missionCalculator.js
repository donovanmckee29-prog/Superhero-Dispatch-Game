// Calculate mission success based on hero stats vs required stats
export function calculateMissionSuccess(heroes, requiredStats, call) {
  // Combine hero stats
  const teamStats = { combat: 0, vigor: 0, mobility: 0, charisma: 0, intellect: 0 }
  
  heroes.forEach((hero, slot) => {
    // Base stats
    let heroStats = { ...hero.stats }
    
    // Apply streak bonuses (Flambae) - these are already on the hero object
    if (hero.streakBonus) {
      heroStats.combat = (heroStats.combat || 0) + (hero.streakBonus.combat || 0)
      heroStats.mobility = (heroStats.mobility || 0) + (hero.streakBonus.mobility || 0)
    }
    
    // Apply healing bonuses (Malevola)
    if (hero.healingBonus) {
      heroStats.charisma = (heroStats.charisma || 0) + (hero.healingBonus.charisma || 0)
      heroStats.vigor = (heroStats.vigor || 0) + (hero.healingBonus.vigor || 0)
    }
    
    // Apply unique power bonuses
    if (hero.uniquePower) {
      const powerEffect = hero.uniquePower.effect(heroes, slot, hero)
      
      // Apply stat bonuses from power
      if (powerEffect.combat !== undefined) heroStats.combat += powerEffect.combat
      if (powerEffect.mobility !== undefined) heroStats.mobility += powerEffect.mobility
      if (powerEffect.charisma !== undefined) heroStats.charisma += powerEffect.charisma
      if (powerEffect.vigor !== undefined) heroStats.vigor += powerEffect.vigor
      if (powerEffect.intellect !== undefined) heroStats.intellect += powerEffect.intellect
      
      // Apply slot-dependent bonuses (Coupé, Golem)
      if (hero.id === 'coupe') {
        if (slot === 0) heroStats.combat += 1
        if (slot === 1) heroStats.mobility += 1
      }
      
      if (hero.id === 'golem') {
        const bonuses = [
          { combat: 2, vigor: -1, mobility: -1, charisma: -1, intellect: -1 },
          { vigor: 2, combat: -1, mobility: -1, charisma: -1, intellect: -1 },
          { mobility: 2, combat: -1, vigor: -1, charisma: -1, intellect: -1 }
        ]
        const bonus = bonuses[slot] || {}
        Object.keys(bonus).forEach(stat => {
          heroStats[stat] = (heroStats[stat] || 0) + bonus[stat]
        })
      }
    }
    
    // Add to team stats
    Object.keys(teamStats).forEach(stat => {
      teamStats[stat] += Math.max(0, heroStats[stat] || 0)
    })
  })
  
  // Apply Prism's duplication effect (affects entire team)
  const prismHero = heroes.find(h => h.id === 'prism')
  if (prismHero) {
    const prismIndex = heroes.findIndex(h => h.id === 'prism')
    const adjacentHeroes = []
    if (prismIndex > 0) adjacentHeroes.push(heroes[prismIndex - 1])
    if (prismIndex < heroes.length - 1) adjacentHeroes.push(heroes[prismIndex + 1])
    
    adjacentHeroes.forEach(adjHero => {
      Object.keys(adjHero.stats).forEach(stat => {
        teamStats[stat] += Math.floor((adjHero.stats[stat] || 0) / 2)
      })
    })
  }
  
  // Calculate match percentage for each stat
  let totalMatch = 0
  let totalRequired = 0
  
  Object.keys(requiredStats).forEach(stat => {
    const required = requiredStats[stat]
    const provided = teamStats[stat] || 0
    totalRequired += required
    
    // Cap match at 100% per stat
    const match = Math.min(required, provided)
    totalMatch += match
  })
  
  // Base success percentage
  const baseSuccess = totalRequired > 0 ? (totalMatch / totalRequired) * 100 : 0
  
  // Add random factor (±10%)
  const randomFactor = (Math.random() - 0.5) * 20
  const finalSuccess = Math.max(0, Math.min(100, baseSuccess + randomFactor))
  
  // Determine outcome
  let success = false
  let outcome = 'failure'
  
  if (finalSuccess >= 100) {
    success = true
    outcome = 'high_success'
  } else if (finalSuccess >= 80) {
    success = true
    outcome = 'moderate_success'
  } else if (finalSuccess >= 60) {
    success = Math.random() < 0.6 // 60% chance
    outcome = success ? 'risky_success' : 'risky_failure'
  } else {
    success = Math.random() < 0.2 // 20% chance
    outcome = success ? 'lucky_success' : 'failure'
  }
  
  return {
    success,
    outcome,
    successPercentage: finalSuccess,
    teamStats,
    requiredStats
  }
}

