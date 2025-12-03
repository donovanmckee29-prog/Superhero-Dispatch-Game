// Game State - Dispatch System
let gameState = {
    credits: 1000,
    reputation: 100,
    currentTeam: [],
    availableMissions: [],
    activeMissions: [],
    completedMissions: 0,
    failedMissions: 0,
    missedMissions: 0,
    day: 1,
    shift: 1,
    shiftActive: true,
    characters: [...characters],
    missionSpawnTimer: null,
    lastMissionSpawn: Date.now(),
    spawnInterval: 30000,
    gameTime: 0,
    selectedMission: null,
    pausedMission: null,
    dispatcherRank: 1,
    dispatcherRankTitle: "Basic Dispatcher",
    shiftStartTime: Date.now(),
    timePaused: false
};

// Hero Status: 'available', 'busy', 'returning', 'resting'
function initializeHeroStatuses() {
    gameState.characters.forEach(char => {
        if (!char.status) {
            char.status = 'available';
        }
        if (!char.cooldownEnd) {
            char.cooldownEnd = 0;
        }
        if (!char.needsReview) {
            char.needsReview = false;
        }
        if (!char.lastMissionResult) {
            char.lastMissionResult = null;
        }
        if (!char.currentMission) {
            char.currentMission = null;
        }
        if (!char.restStartTime) {
            char.restStartTime = 0;
        }
        if (!char.restDuration) {
            char.restDuration = 60000; // 60 seconds default
        }
    });
}

// Initialize game
function initGame() {
    initializeHeroStatuses();
    
    // Spawn initial missions (2-4 to start)
    for (let i = 0; i < Math.floor(Math.random() * 3) + 2; i++) {
        spawnRandomMission();
    }
    
    startMissionSpawnTimer();
    startGameLoop();
    updateUI();
}

// Start mission spawn timer
function startMissionSpawnTimer() {
    if (gameState.missionSpawnTimer) {
        clearInterval(gameState.missionSpawnTimer);
    }
    
    gameState.missionSpawnTimer = setInterval(() => {
        if (Math.random() < 0.6) {
            spawnRandomMission();
        }
        checkExpiredMissions();
        updateHeroCooldowns();
        updateUI();
    }, gameState.spawnInterval);
}

// Spawn a random mission
function spawnRandomMission() {
    if (gameState.availableMissions.length >= 10) {
        return;
    }
    
    const missionTemplates = [
        { type: "Rescue", baseReward: 200, baseRep: 15, statFocus: ["vigor", "mobility"], keywords: ["rescue", "evacuate", "save"] },
        { type: "Combat", baseReward: 350, baseRep: 25, statFocus: ["combat", "vigor"], keywords: ["fight", "battle", "subdue", "defeat"] },
        { type: "Stealth", baseReward: 250, baseRep: 20, statFocus: ["mobility", "intellect"], keywords: ["sneak", "infiltrate", "stealth"] },
        { type: "Defense", baseReward: 400, baseRep: 30, statFocus: ["combat", "vigor"], keywords: ["protect", "defend", "shield"] },
        { type: "Pursuit", baseReward: 150, baseRep: 10, statFocus: ["mobility"], keywords: ["chase", "pursue", "catch", "track"] },
        { type: "Investigation", baseReward: 220, baseRep: 18, statFocus: ["intellect", "charisma"], keywords: ["investigate", "analyze", "solve", "examine"] },
        { type: "Disaster", baseReward: 450, baseRep: 35, statFocus: ["vigor", "combat"], keywords: ["disaster", "emergency", "crisis"] },
        { type: "Extraction", baseReward: 500, baseRep: 40, statFocus: ["mobility", "combat", "vigor"], keywords: ["extract", "rescue", "retrieve"] },
        { type: "Delivery", baseReward: 180, baseRep: 12, statFocus: ["mobility", "charisma"], keywords: ["deliver", "transport", "move"] },
        { type: "Negotiation", baseReward: 300, baseRep: 22, statFocus: ["charisma", "intellect"], keywords: ["negotiate", "persuade", "talk", "diplomacy"] }
    ];
    
    const template = missionTemplates[Math.floor(Math.random() * missionTemplates.length)];
    const difficulty = ["Easy", "Medium", "Hard", "Very Hard"][Math.floor(Math.random() * 4)];
    
    const requiredStats = {
        vigor: Math.floor(Math.random() * 8) + 2,
        combat: Math.floor(Math.random() * 8) + 2,
        mobility: Math.floor(Math.random() * 8) + 2,
        intellect: Math.floor(Math.random() * 8) + 2,
        charisma: Math.floor(Math.random() * 8) + 2
    };
    
    template.statFocus.forEach(stat => {
        requiredStats[stat] = Math.floor(Math.random() * 6) + 4;
    });
    
    const coverageZone = generateCoverageZone();
    
    const modifiers = [];
    if (Math.random() < 0.3) modifiers.push("Time-Sensitive");
    if (Math.random() < 0.2) modifiers.push("High Risk");
    if (Math.random() < 0.25) modifiers.push("Reward Bonus");
    
    const expirationTime = Date.now() + (Math.floor(Math.random() * 45000) + 45000); // 45-90 seconds
    
    const mission = {
        id: Date.now() + Math.random(),
        name: `${template.type} Mission`,
        type: template.type,
        description: generateMissionDescription(template.type, difficulty, template.keywords),
        difficulty: difficulty,
        requiredStats: requiredStats,
        coverageZone: coverageZone,
        reward: { 
            credits: template.baseReward + Math.floor(Math.random() * 100),
            reputation: template.baseRep + Math.floor(Math.random() * 10)
        },
        modifiers: modifiers,
        expirationTime: expirationTime,
        spawnTime: Date.now(),
        status: 'available',
        isConflicting: Math.random() < 0.1, // 10% chance of conflicting call
        isHackable: Math.random() < 0.15, // 15% chance of hackable
        keywords: template.keywords,
        timePaused: false,
        pausedAt: null
    };
    
    gameState.availableMissions.push(mission);
    showMissionNotification(mission);
    updateUI();
}

// Generate mission description with keyword highlighting
function generateMissionDescription(type, difficulty, keywords) {
    const descriptions = {
        "Rescue": [
            "Civilians trapped in a burning building need immediate evacuation. Need heroes to rescue them quickly.",
            "Hostages taken by criminals require a rescue operation. Time is critical.",
            "People stranded after a natural disaster need assistance. Must evacuate safely."
        ],
        "Combat": [
            "A supervillain is attacking the city center. Need heroes to fight and subdue the threat.",
            "Criminal organization has taken over a facility. Must defeat them in combat.",
            "Monster sighting requires immediate response. Prepare for battle."
        ],
        "Stealth": [
            "Infiltrate enemy base undetected to gather intelligence. Stealth is essential.",
            "Retrieve stolen item without alerting security. Sneak in quietly.",
            "Sneak into restricted area for investigation. Avoid detection."
        ],
        "Defense": [
            "Protect critical facility from incoming attack. Defend at all costs.",
            "Defend VIP during public event. Shield them from harm.",
            "Secure perimeter during crisis situation. Protect the area."
        ],
        "Pursuit": [
            "High-speed chase after fleeing criminals. Need to catch them quickly.",
            "Track down escaped suspect. Pursue before they escape.",
            "Intercept vehicle before it reaches destination. Chase required."
        ],
        "Investigation": [
            "Solve mysterious crime with limited clues. Need to investigate thoroughly.",
            "Investigate strange occurrences at location. Analyze the situation.",
            "Analyze evidence to identify perpetrator. Solve the mystery."
        ],
        "Disaster": [
            "Earthquake relief efforts needed immediately. Emergency response required.",
            "Flood rescue operation in progress. Crisis situation.",
            "Building collapse requires emergency response. Disaster relief needed."
        ],
        "Extraction": [
            "Extract undercover agent from dangerous situation. Rescue operation needed.",
            "Rescue team member trapped behind enemy lines. Extract safely.",
            "Evacuate personnel from hostile territory. Retrieve them quickly."
        ],
        "Delivery": [
            "Time-sensitive package delivery required. Transport urgently.",
            "Transport critical supplies to remote location. Deliver safely.",
            "Deliver important documents securely. Move quickly."
        ],
        "Negotiation": [
            "Resolve hostage situation through diplomacy. Need to negotiate carefully.",
            "Negotiate with criminal organization. Persuade them to stand down.",
            "Mediate conflict between factions. Talk them down peacefully."
        ]
    };
    
    const typeDescs = descriptions[type] || ["A mission requires your attention."];
    let desc = typeDescs[Math.floor(Math.random() * typeDescs.length)];
    
    // Highlight keywords
    if (keywords) {
        keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            desc = desc.replace(regex, `<span class="keyword-highlight">${keyword}</span>`);
        });
    }
    
    return desc;
}

// Show mission notification (with pause on click)
function showMissionNotification(mission) {
    gameState.selectedMission = mission;
    pauseMissionTimer(mission); // Pause when displayed
    updateMissionDisplay(mission);
    
    const charName = document.getElementById('selectedCharacterName');
    const charTagline = document.getElementById('characterTagline');
    if (charName) charName.textContent = mission.name;
    if (charTagline) charTagline.textContent = `${mission.type} - ${mission.difficulty}`;
    
    // Calculate time remaining
    const now = Date.now();
    const timeRemaining = Math.max(0, Math.ceil((mission.expirationTime - now) / 1000));
    
    const notification = document.createElement('div');
    const isConflicting = mission.isConflicting;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${isConflicting ? '#ec4899' : '#4fd1c7'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
        cursor: pointer;
        border: ${isConflicting ? '3px solid #f472b6' : 'none'};
    `;
    notification.innerHTML = `
        <strong>${isConflicting ? '⚠️ Conflicting Call!' : '📢 New Mission!'}</strong><br>
        ${mission.name}<br>
        <small>${mission.type} - ${mission.difficulty}</small><br>
        <small>Time: ${timeRemaining}s</small>
    `;
    notification.onclick = () => {
        gameState.selectedMission = mission;
        pauseMissionTimer(mission); // Pause when clicked
        updateMissionDisplay(mission);
        notification.remove();
    };
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Check for expired missions (with pause support)
function checkExpiredMissions() {
    const now = Date.now();
    gameState.availableMissions = gameState.availableMissions.filter(mission => {
        // Don't expire if time is paused for this mission
        if (mission.timePaused && mission.pausedAt) {
            const pausedDuration = now - mission.pausedAt;
            mission.expirationTime += pausedDuration;
            mission.pausedAt = now;
            return true;
        }
        
        if (mission.expirationTime < now && mission.status === 'available') {
            mission.status = 'expired';
            gameState.missedMissions++;
            return false;
        }
        return true;
    });
}

// Pause mission timer when clicked
function pauseMissionTimer(mission) {
    if (mission && !mission.timePaused) {
        mission.timePaused = true;
        mission.pausedAt = Date.now();
    }
}

// Resume mission timer
function resumeMissionTimer(mission) {
    if (mission && mission.timePaused) {
        const pausedDuration = Date.now() - mission.pausedAt;
        mission.expirationTime += pausedDuration;
        mission.timePaused = false;
        mission.pausedAt = null;
    }
}

// Update hero cooldowns (Dispatch-style with rest meter)
function updateHeroCooldowns() {
    const now = Date.now();
    gameState.characters.forEach(char => {
        if (char.status === 'busy' && char.cooldownEnd < now) {
            // Mission complete, start returning
            char.status = 'returning';
            char.cooldownEnd = now + 20000; // 20 seconds returning
        } else if (char.status === 'returning' && char.cooldownEnd < now) {
            // Arrived at HQ, start resting
            char.status = 'resting';
            char.restStartTime = now;
            char.restDuration = 50000 + Math.random() * 30000; // 50-80 seconds rest
            char.cooldownEnd = now + char.restDuration;
            char.needsReview = true; // Must review results before available
        } else if (char.status === 'resting' && char.cooldownEnd < now && !char.needsReview) {
            // Rest complete and results reviewed
            char.status = 'available';
            char.cooldownEnd = 0;
            char.restStartTime = 0;
            char.restDuration = 0;
        }
    });
}

// Game loop for continuous updates
function startGameLoop() {
    setInterval(() => {
        updateHeroCooldowns();
        checkExpiredMissions();
        // Update timer for selected mission
        if (gameState.selectedMission) {
            updateMissionTimer(gameState.selectedMission);
        }
        updateUI();
    }, 1000);
}

// Calculate team stats (Dispatch-style: sum all heroes' stats)
function calculateTeamStats(team) {
    const stats = {
        vigor: 0,
        combat: 0,
        mobility: 0,
        intellect: 0,
        charisma: 0
    };
    
    team.forEach(charId => {
        const char = gameState.characters.find(c => c.id === charId);
        if (char) {
            stats.vigor += char.vigor || 0;
            stats.combat += char.combat || 0;
            stats.mobility += char.mobility || 0;
            stats.intellect += char.intellect || 0;
            stats.charisma += char.charisma || 0;
        }
    });
    
    return stats;
}

// Calculate success probability (Dispatch-style algorithm)
function calculateSuccessProbability(team, mission) {
    if (!team || team.length === 0 || !mission) return 0;
    
    const teamStats = calculateTeamStats(team);
    const required = mission.requiredStats;
    
    const statMatches = {
        combat: Math.min(100, (teamStats.combat / required.combat) * 100),
        vigor: Math.min(100, (teamStats.vigor / required.vigor) * 100),
        mobility: Math.min(100, (teamStats.mobility / required.mobility) * 100),
        charisma: Math.min(100, (teamStats.charisma / required.charisma) * 100),
        intellect: Math.min(100, (teamStats.intellect / required.intellect) * 100)
    };
    
    // Average all five stats equally
    const average = (
        statMatches.combat +
        statMatches.vigor +
        statMatches.mobility +
        statMatches.charisma +
        statMatches.intellect
    ) / 5;
    
    // Apply synergy bonuses if multiple heroes
    let bonus = 0;
    if (team.length >= 2) {
        // Check for hero synergies
        const synergyPairs = checkHeroSynergies(team);
        bonus += synergyPairs * 5; // +5% per synergy pair
    }
    
    // Solo mission bonus (more XP, but same success calc)
    const finalProbability = Math.min(100, average + bonus);
    
    return {
        probability: finalProbability,
        statMatches: statMatches,
        bonus: bonus
    };
}

// Calculate coverage percentage - CRITICAL FUNCTION
function calculateCoverage(team, mission) {
    if (!team || team.length === 0 || !mission) return 0;
    
    const coveredSlices = new Set();
    
    // Add all slices covered by team members
    team.forEach(charId => {
        const char = gameState.characters.find(c => c.id === charId);
        if (char && char.coverageShape) {
            char.coverageShape.forEach(slice => {
                coveredSlices.add(slice);
            });
        }
    });
    
    // Count how many required slices are covered
    const requiredSlices = new Set(mission.coverageZone);
    let coveredCount = 0;
    
    requiredSlices.forEach(slice => {
        if (coveredSlices.has(slice)) {
            coveredCount++;
        }
    });
    
    const totalRequired = requiredSlices.size;
    return totalRequired > 0 ? (coveredCount / totalRequired) * 100 : 0;
}

// Check if team meets stat requirements
function meetsStatRequirements(team, mission) {
    const teamStats = calculateTeamStats(team);
    const required = mission.requiredStats;
    
    return teamStats.vigor >= required.vigor &&
           teamStats.combat >= required.combat &&
           teamStats.mobility >= required.mobility &&
           teamStats.intellect >= required.intellect &&
           teamStats.charisma >= required.charisma;
}

// Check for hero synergies (positive relationships)
function checkHeroSynergies(team) {
    // Define synergy pairs (from Dispatch guide)
    const synergies = [
        [1, 2], // Example pairs - would need actual hero IDs
        [9, 10], // Speed heroes
        [3, 4]  // Strength heroes
    ];
    
    let synergyCount = 0;
    for (let i = 0; i < team.length; i++) {
        for (let j = i + 1; j < team.length; j++) {
            // Check if this pair has synergy
            // This is simplified - would need actual relationship data
            if (Math.random() < 0.2) { // 20% chance of synergy for now
                synergyCount++;
            }
        }
    }
    
    return synergyCount;
}

// Dispatch team to mission (Dispatch-style)
function dispatchTeam(missionId, team) {
    const missionIndex = gameState.availableMissions.findIndex(m => m.id == missionId);
    if (missionIndex === -1) {
        alert('Mission not found or has expired!');
        return { success: false };
    }
    
    const mission = gameState.availableMissions[missionIndex];
    
    // Check for heroes that need review
    const needsReview = team.filter(charId => {
        const char = gameState.characters.find(c => c.id === charId);
        return char && char.needsReview;
    });
    
    if (needsReview.length > 0) {
        alert(`Some heroes need their mission results reviewed before they can be assigned again!`);
        return { success: false };
    }
    
    const unavailable = team.filter(charId => {
        const char = gameState.characters.find(c => c.id === charId);
        return char && char.status !== 'available';
    });
    
    if (unavailable.length > 0) {
        alert(`Some team members are not available! Check their status.`);
        return { success: false };
    }
    
    // Calculate success probability (Dispatch-style)
    const successCalc = calculateSuccessProbability(team, mission);
    const successChance = successCalc.probability / 100;
    const success = Math.random() < successChance;
    
    // Check for sabotage if multiple heroes
    let sabotageOccurred = false;
    if (team.length >= 2 && Math.random() < 0.1) {
        sabotageOccurred = checkHeroSabotage(team);
        if (sabotageOccurred) {
            // Sabotage can turn success into failure
            if (success && Math.random() < 0.7) {
                success = false;
            }
        }
    }
    
    // Calculate XP rewards (more for solo, harder missions)
    const baseXP = 20 + Math.floor(Math.random() * 15);
    const soloBonus = team.length === 1 ? 15 : 0;
    const difficultyBonus = {
        'Easy': 0,
        'Medium': 5,
        'Hard': 10,
        'Very Hard': 20
    }[mission.difficulty] || 0;
    const riskBonus = successChance < 0.6 && success ? 10 : 0;
    const xpPerHero = baseXP + soloBonus + difficultyBonus + riskBonus;
    
    // Update game state
    if (success) {
        gameState.credits += mission.reward.credits;
        gameState.reputation += mission.reward.reputation;
        gameState.completedMissions++;
    } else {
        gameState.failedMissions++;
        gameState.reputation = Math.max(0, gameState.reputation - Math.floor(mission.reward.reputation * 0.5));
    }
    
    // Assign heroes to mission and update status
    const missionDuration = 30000 + Math.floor(Math.random() * 30000); // 30-60 seconds
    team.forEach(charId => {
        const char = gameState.characters.find(c => c.id === charId);
        if (char) {
            char.status = 'busy';
            char.currentMission = mission.name;
            char.cooldownEnd = Date.now() + missionDuration;
            
            // Store mission result for review
            char.lastMissionResult = {
                missionName: mission.name,
                success: success,
                xpGained: success ? xpPerHero : 0,
                sabotageOccurred: sabotageOccurred,
                successProbability: successCalc.probability,
                timestamp: Date.now()
            };
            
            // Award XP and check level up
            if (success) {
                char.xp += xpPerHero;
                const leveledUp = checkLevelUp(char);
                
                // Show XP popup
                showXPPopup(charId, xpPerHero, leveledUp);
            }
        }
    });
    
    // Remove mission from available list
    gameState.availableMissions.splice(missionIndex, 1);
    mission.status = 'active';
    mission.assignedTeam = team;
    gameState.activeMissions.push(mission);
    
    // Check for shift end
    const totalMissions = gameState.completedMissions + gameState.failedMissions;
    if (totalMissions >= 10) {
        endShift();
    }
    
    updateUI();
    return { 
        success, 
        successProbability: successCalc.probability,
        sabotageOccurred,
        xpPerHero: success ? xpPerHero : 0
    };
}

// Check for hero sabotage (conflicting relationships)
function checkHeroSabotage(team) {
    // Simplified sabotage check - would need actual relationship data
    // Some hero pairs have conflicts that can cause sabotage
    if (team.length >= 2 && Math.random() < 0.15) {
        return true;
    }
    return false;
}

// Show XP popup over hero portrait
function showXPPopup(heroId, xpAmount, leveledUp) {
    const heroCard = document.querySelector(`[data-char-id="${heroId}"]`);
    if (!heroCard) return;
    
    const popup = document.createElement('div');
    popup.className = 'xp-popup';
    popup.textContent = `+${xpAmount} XP`;
    if (leveledUp) {
        popup.textContent += ' ⭐ LEVEL UP!';
        popup.classList.add('level-up');
    }
    
    popup.style.cssText = `
        position: absolute;
        top: -30px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 8px 16px;
        border-radius: 8px;
        font-weight: 700;
        font-size: 0.9em;
        z-index: 1000;
        animation: xpFloat 2s ease-out forwards;
        box-shadow: 0 4px 15px rgba(16, 185, 129, 0.5);
        pointer-events: none;
    `;
    
    heroCard.style.position = 'relative';
    heroCard.appendChild(popup);
    
    setTimeout(() => {
        popup.remove();
    }, 2000);
}

// Review mission results (required before hero can be reassigned)
function reviewMissionResults(heroId) {
    const char = gameState.characters.find(c => c.id === heroId);
    if (!char || !char.needsReview || !char.lastMissionResult) {
        return;
    }
    
    const result = char.lastMissionResult;
    char.needsReview = false;
    char.lastMissionResult = null;
    
    // Show result modal
    showResultModal(char, result);
    
    updateUI();
}

// Show result review modal
function showResultModal(hero, result) {
    const modal = document.createElement('div');
    modal.className = 'modal result-modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            <h2>Mission Results: ${hero.name}</h2>
            <div class="result-content">
                <h3 class="${result.success ? 'result-success' : 'result-failure'}">
                    ${result.success ? '✓ Mission Successful!' : '✗ Mission Failed'}
                </h3>
                <p><strong>Mission:</strong> ${result.missionName}</p>
                <p><strong>Success Probability:</strong> ${result.successProbability.toFixed(1)}%</p>
                ${result.success ? `<p><strong>XP Gained:</strong> +${result.xpGained} XP</p>` : '<p>No XP gained.</p>'}
                ${result.sabotageOccurred ? '<p class="sabotage-warning">⚠ Sabotage occurred during mission!</p>' : ''}
                <button class="btn btn-primary" onclick="this.closest('.modal').remove()">Acknowledge</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Handle disruption
function handleDisruption(disruption, team) {
    const choice = disruption.choices[Math.floor(Math.random() * disruption.choices.length)];
    const teamStats = calculateTeamStats(team);
    
    const teamStatValue = teamStats[choice.requiredStat] || 0;
    const success = teamStatValue >= choice.requiredValue;
    
    return {
        disruption: disruption,
        choice: choice,
        success: success,
        message: success ? choice.successText : choice.failureText
    };
}

// Check and handle level up
function checkLevelUp(character) {
    if (character.xp >= character.xpToNext) {
        character.level++;
        character.xp -= character.xpToNext;
        character.xpToNext = Math.floor(character.xpToNext * 1.5);
        
        if (!character.skillPoints) character.skillPoints = 0;
        character.skillPoints++;
        
        return true;
    }
    return false;
}

// End day and start new day
// End shift and show summary (Dispatch-style)
function endShift() {
    gameState.shiftActive = false;
    const totalMissions = gameState.completedMissions + gameState.failedMissions;
    const successRate = totalMissions > 0 ? (gameState.completedMissions / totalMissions) * 100 : 0;
    
    // Show shift summary modal
    showShiftSummary({
        successful: gameState.completedMissions,
        failed: gameState.failedMissions,
        missed: gameState.missedMissions,
        successRate: successRate,
        shift: gameState.shift
    });
    
    // Update dispatcher rank based on performance
    updateDispatcherRank(successRate);
    
    // Reset for next shift
    gameState.shift++;
    gameState.completedMissions = 0;
    gameState.failedMissions = 0;
    gameState.missedMissions = 0;
    gameState.availableMissions = [];
    gameState.activeMissions = [];
    gameState.shiftStartTime = Date.now();
    
    // Spawn new missions for next shift
    setTimeout(() => {
        gameState.shiftActive = true;
        for (let i = 0; i < Math.floor(Math.random() * 5) + 5; i++) {
            spawnRandomMission();
        }
        updateUI();
    }, 3000);
}

// Show shift summary modal
function showShiftSummary(summary) {
    const modal = document.createElement('div');
    modal.className = 'modal shift-summary-modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content shift-summary-content">
            <h2>Shift ${summary.shift} Complete</h2>
            <div class="summary-stats">
                <div class="summary-stat success">
                    <h3>${summary.successful}</h3>
                    <p>Successful Calls</p>
                </div>
                <div class="summary-stat failed">
                    <h3>${summary.failed}</h3>
                    <p>Failed Calls</p>
                </div>
                <div class="summary-stat missed">
                    <h3>${summary.missed}</h3>
                    <p>Missed Calls</p>
                </div>
                <div class="summary-stat rate">
                    <h3>${summary.successRate.toFixed(1)}%</h3>
                    <p>Success Rate</p>
                </div>
            </div>
            <div class="summary-rank">
                <p><strong>Dispatcher Rank:</strong> ${gameState.dispatcherRankTitle}</p>
            </div>
            <button class="btn btn-primary" onclick="this.closest('.modal').remove()">Start Next Shift</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Update dispatcher rank based on performance
function updateDispatcherRank(successRate) {
    const ranks = [
        { title: "Basic Dispatcher", minRate: 0 },
        { title: "Junior Dispatcher", minRate: 50 },
        { title: "Dispatcher", minRate: 60 },
        { title: "Senior Dispatcher", minRate: 70 },
        { title: "Lead Dispatcher", minRate: 80 },
        { title: "Master Dispatcher", minRate: 90 }
    ];
    
    for (let i = ranks.length - 1; i >= 0; i--) {
        if (successRate >= ranks[i].minRate) {
            if (gameState.dispatcherRank < i + 1) {
                gameState.dispatcherRank = i + 1;
                gameState.dispatcherRankTitle = ranks[i].title;
            }
            break;
        }
    }
}

function endDay() {
    gameState.day++;
    gameState.shift = 1;
    gameState.completedMissions = 0;
    gameState.failedMissions = 0;
    gameState.missedMissions = 0;
    gameState.availableMissions = [];
    gameState.activeMissions = [];
    
    for (let i = 0; i < Math.floor(Math.random() * 3) + 2; i++) {
        spawnRandomMission();
    }
    
    updateUI();
    alert(`Day ${gameState.day} has begun! New missions are arriving...`);
}

// Update UI
function updateUI() {
    updateTopBar();
    updateCharacterRoster();
    
    if (gameState.selectedMission) {
        updateMissionDisplay(gameState.selectedMission);
    }
}

// Update top bar
function updateTopBar() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`;
    const gameTimeEl = document.getElementById('gameTime');
    if (gameTimeEl) gameTimeEl.textContent = timeStr;
}

// Update mission display (Dispatch-style)
function updateMissionDisplay(mission) {
    if (!mission) return;
    
    const missionTypeText = document.getElementById('missionTypeText');
    const missionSource = document.getElementById('missionSource');
    const missionQuote = document.getElementById('missionQuote');
    
    if (missionTypeText) {
        const typeIcons = {
            'Rescue': '🚨', 'Combat': '⚔️', 'Stealth': '🥷', 'Defense': '🛡️',
            'Pursuit': '🏃', 'Investigation': '🔍', 'Disaster': '🌪️', 'Extraction': '🎯',
            'Delivery': '📦', 'Negotiation': '🤝'
        };
        const icon = typeIcons[mission.type] || '📋';
        missionTypeText.innerHTML = `${icon} ${mission.type.toUpperCase()}`;
    }
    
    if (missionSource) {
        missionSource.textContent = `SECURITY / @TORRCOLLEGE`;
    }
    
    if (missionQuote) {
        const p = missionQuote.querySelector('p');
        if (p) {
            // Description already has keyword highlighting from generateMissionDescription
            p.innerHTML = `"${mission.description}"`;
        }
    }
    
    // Show timer
    updateMissionTimer(mission);
    
    // Update mission illustration with type-based styling
    const missionImage = document.getElementById('missionImage');
    if (missionImage) {
        const typeColors = {
            'Rescue': ['#fc8181', '#f56565'],
            'Combat': ['#f6ad55', '#ed8936'],
            'Stealth': ['#9f7aea', '#805ad5'],
            'Defense': ['#4fd1c7', '#38b2ac'],
            'Pursuit': ['#68d391', '#48bb78'],
            'Investigation': ['#63b3ed', '#4299e1'],
            'Disaster': ['#fc8181', '#e53e3e'],
            'Extraction': ['#f6ad55', '#dd6b20'],
            'Delivery': ['#fbd38d', '#f6ad55'],
            'Negotiation': ['#9f7aea', '#805ad5']
        };
        const colors = typeColors[mission.type] || ['#4fd1c7', '#38b2ac'];
        missionImage.style.background = `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`;
        missionImage.textContent = mission.type;
    }
    
    const missionTitleBtn = document.getElementById('missionTitleBtn');
    if (missionTitleBtn) {
        missionTitleBtn.textContent = `${mission.name}!`;
    }
    
    updateRadarChart(mission);
    updateRequirements(mission);
    updateCharacterSlots();
}

// Update mission timer display
function updateMissionTimer(mission) {
    if (!mission) return;
    
    const now = Date.now();
    let timeRemaining = Math.max(0, Math.ceil((mission.expirationTime - now) / 1000));
    
    // Find or create timer display
    let timerDisplay = document.getElementById('missionTimerDisplay');
    if (!timerDisplay) {
        timerDisplay = document.createElement('div');
        timerDisplay.id = 'missionTimerDisplay';
        timerDisplay.className = 'mission-timer';
        const missionQuoteEl = document.getElementById('missionQuote');
        if (missionQuoteEl && missionQuoteEl.parentNode) {
            missionQuoteEl.parentNode.insertBefore(timerDisplay, missionQuoteEl.nextSibling);
        }
    }
    
    if (timerDisplay) {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        let timerClass = 'timer-normal';
        if (timeRemaining < 15) timerClass = 'timer-critical';
        else if (timeRemaining < 30) timerClass = 'timer-warning';
        
        timerDisplay.innerHTML = `
            <div class="timer-label">Time Remaining:</div>
            <div class="timer-value ${timerClass}">${timeStr}</div>
            ${mission.timePaused ? '<div class="timer-paused">⏸ PAUSED</div>' : ''}
        `;
    }
}

// Update radar chart
function updateRadarChart(mission) {
    const radarFill = document.getElementById('radarFill');
    if (!radarFill) return;
    
    if (!gameState.currentTeam || gameState.currentTeam.length === 0) {
        const stats = mission.requiredStats;
        const maxStat = Math.max(stats.vigor, stats.combat, stats.mobility, stats.intellect, stats.charisma);
        const scale = Math.max(maxStat, 10);
        
        const centerX = 125;
        const centerY = 125;
        const radius = 100;
        
        const points = [
            `${centerX},${centerY - (stats.intellect / scale) * radius}`,
            `${centerX + (stats.combat / scale) * radius * 0.951},${centerY + (stats.combat / scale) * radius * 0.309}`,
            `${centerX + (stats.mobility / scale) * radius * 0.588},${centerY + (stats.mobility / scale) * radius * 0.809}`,
            `${centerX - (stats.charisma / scale) * radius * 0.588},${centerY + (stats.charisma / scale) * radius * 0.809}`,
            `${centerX - (stats.vigor / scale) * radius * 0.951},${centerY + (stats.vigor / scale) * radius * 0.309}`
        ].join(' ');
        
        radarFill.setAttribute('points', points);
        return;
    }
    
    const teamStats = calculateTeamStats(gameState.currentTeam);
    const maxTeamStat = Math.max(teamStats.vigor, teamStats.combat, teamStats.mobility, teamStats.intellect, teamStats.charisma);
    const scale = Math.max(maxTeamStat, 10);
    
    const centerX = 125;
    const centerY = 125;
    const radius = 100;
    
    const points = [
        `${centerX},${centerY - (teamStats.intellect / scale) * radius}`,
        `${centerX + (teamStats.combat / scale) * radius * 0.951},${centerY + (teamStats.combat / scale) * radius * 0.309}`,
        `${centerX + (teamStats.mobility / scale) * radius * 0.588},${centerY + (teamStats.mobility / scale) * radius * 0.809}`,
        `${centerX - (teamStats.charisma / scale) * radius * 0.588},${centerY + (teamStats.charisma / scale) * radius * 0.809}`,
        `${centerX - (teamStats.vigor / scale) * radius * 0.951},${centerY + (teamStats.vigor / scale) * radius * 0.309}`
    ].join(' ');
    
    radarFill.setAttribute('points', points);
}

// Update requirements panel
function updateRequirements(mission) {
    const requirementsList = document.getElementById('requirementsList');
    if (!requirementsList) return;
    
    const reqs = [
        `>${mission.description}`,
        `>Complete the ${mission.type.toLowerCase()} mission successfully`
    ];
    
    if (mission.modifiers && mission.modifiers.length > 0) {
        mission.modifiers.forEach(mod => {
            reqs.push(`>${mod}`);
        });
    }
    
    requirementsList.innerHTML = '<ul>' + reqs.map(r => `<li>${r}</li>`).join('') + '</ul>';
}

// Update character slots (up to 8 slots)
function updateCharacterSlots() {
    for (let i = 1; i <= 8; i++) {
        const slot = document.getElementById(`charSlot${i}`);
        if (!slot) continue;
        
        const charIndex = i - 1;
        if (charIndex < gameState.currentTeam.length) {
            const char = gameState.characters.find(c => c.id === gameState.currentTeam[charIndex]);
            if (char) {
                slot.classList.add('filled');
                slot.querySelector('.slot-content').innerHTML = `
                    <div class="slot-character-name">${char.name}</div>
                    <div class="slot-character-stats">
                        <span>⚔${char.combat}</span>
                        <span>🧠${char.intellect}</span>
                        <span>💪${char.vigor}</span>
                    </div>
                `;
            }
        } else {
            slot.classList.remove('filled');
            slot.querySelector('.slot-content').innerHTML = '<div class="slot-plus">+</div>';
        }
    }
}

// Update character roster (bottom bar) - Dispatch-style with rest meters
function updateCharacterRoster() {
    const roster = document.getElementById('characterRoster');
    if (!roster) return;
    
    roster.innerHTML = '';
    
    gameState.characters.slice(0, 20).forEach(char => {
        const statusClass = {
            'available': 'status-available',
            'busy': 'status-busy',
            'returning': 'status-returning',
            'resting': 'status-resting'
        }[char.status] || 'status-resting';
        
        const statusText = {
            'available': 'AVAILABLE',
            'busy': char.currentMission || 'BUSY',
            'returning': 'RETURNING',
            'resting': 'RESTING'
        }[char.status] || 'RESTING';
        
        const isSelected = gameState.currentTeam.includes(char.id);
        const now = Date.now();
        
        // Calculate rest progress if resting
        let restProgress = 0;
        let restTimeRemaining = 0;
        if (char.status === 'resting' && char.restStartTime && char.restDuration) {
            const elapsed = now - char.restStartTime;
            restProgress = Math.min(100, (elapsed / char.restDuration) * 100);
            restTimeRemaining = Math.max(0, Math.ceil((char.restDuration - elapsed) / 1000));
        }
        
        const charDiv = document.createElement('div');
        charDiv.className = `roster-character ${isSelected ? 'selected' : ''} ${char.needsReview ? 'needs-review' : ''}`;
        charDiv.setAttribute('data-char-id', char.id);
        
        // Don't allow selection if not available or needs review
        if (char.status === 'available' && !char.needsReview) {
            charDiv.onclick = () => toggleCharacterSelection(char.id);
        } else if (char.needsReview) {
            charDiv.onclick = () => reviewMissionResults(char.id);
        } else {
            charDiv.onclick = () => {}; // No action for busy/returning/resting
        }
        
        let restMeterHTML = '';
        if (char.status === 'resting') {
            restMeterHTML = `
                <div class="rest-meter-container">
                    <div class="rest-meter-label">Resting: ${restTimeRemaining}s</div>
                    <div class="rest-meter-bar">
                        <div class="rest-meter-fill" style="width: ${100 - restProgress}%"></div>
                    </div>
                </div>
            `;
        }
        
        let reviewButtonHTML = '';
        if (char.needsReview) {
            reviewButtonHTML = `
                <div class="review-button" onclick="event.stopPropagation(); reviewMissionResults(${char.id})">
                    ⚠ Review Results
                </div>
            `;
        }
        
        charDiv.innerHTML = `
            <div class="character-status-badge ${statusClass}">${statusText}</div>
            ${restMeterHTML}
            ${reviewButtonHTML}
            <div class="character-portrait">${char.name.charAt(0)}</div>
            <div class="character-name-roster">${char.name}</div>
            <div class="character-stats-mini">
                <span>⚔${char.combat || 0}</span>
                <span>🏃${char.mobility || 0}</span>
                <span>💪${char.vigor || 0}</span>
            </div>
            <div class="character-star">⭐</div>
        `;
        roster.appendChild(charDiv);
    });
}

// Toggle character selection
function toggleCharacterSelection(characterId) {
    const char = gameState.characters.find(c => c.id === characterId);
    if (!char || char.status !== 'available') {
        alert(`${char ? char.name : 'Character'} is not available!`);
        return;
    }
    
    const index = gameState.currentTeam.indexOf(characterId);
    if (index > -1) {
        gameState.currentTeam.splice(index, 1);
    } else {
        if (gameState.currentTeam.length >= 8) {
            alert('Team is full! Maximum 8 characters.');
            return;
        }
        gameState.currentTeam.push(characterId);
    }
    
    updateCharacterSlots();
    updateCharacterRoster();
    if (gameState.selectedMission) {
        updateRadarChart(gameState.selectedMission);
    }
}

// Select mission from available
function selectMissionFromAvailable() {
    const now = Date.now();
    const available = gameState.availableMissions.find(m => 
        m.status === 'available' && m.expirationTime > now
    );
    
    if (available) {
        gameState.selectedMission = available;
        updateMissionDisplay(available);
        
        const charName = document.getElementById('selectedCharacterName');
        const charTagline = document.getElementById('characterTagline');
        if (charName) charName.textContent = available.name;
        if (charTagline) charTagline.textContent = `${available.type} - ${available.difficulty}`;
    } else {
        const charName = document.getElementById('selectedCharacterName');
        const charTagline = document.getElementById('characterTagline');
        if (charName) charName.textContent = "No Missions Available";
        if (charTagline) charTagline.textContent = "Waiting for new missions...";
    }
}

function selectMission(missionId) {
    const mission = gameState.availableMissions.find(m => m.id == missionId);
    if (!mission) {
        alert('Mission not found or has expired!');
        return;
    }
    
    if (mission.expirationTime < Date.now()) {
        alert('This mission has expired!');
        gameState.availableMissions = gameState.availableMissions.filter(m => m.id != missionId);
        updateUI();
        return;
    }
    
    gameState.selectedMission = mission;
    updateMissionDisplay(mission);
    
    const charName = document.getElementById('selectedCharacterName');
    const charTagline = document.getElementById('characterTagline');
    if (charName) charName.textContent = mission.name;
    if (charTagline) charTagline.textContent = `${mission.type} - ${mission.difficulty}`;
}

// Render coverage wheel with SVG for precision - Dispatch style
function renderCoverageWheel(mission) {
    const wheelContainer = document.getElementById('coverageWheel');
    if (!wheelContainer || !mission) return;
    
    const wheelSize = 450;
    const centerX = wheelSize / 2;
    const centerY = wheelSize / 2;
    const radius = wheelSize / 2 - 25;
    const innerRadius = 50;
    
    // Get covered slices from team
    const coveredSlices = new Set();
    if (gameState.currentTeam && gameState.currentTeam.length > 0) {
        gameState.currentTeam.forEach(charId => {
            const char = gameState.characters.find(c => c.id === charId);
            if (char && char.coverageShape) {
                char.coverageShape.forEach(slice => coveredSlices.add(slice));
            }
        });
    }
    
    // Create SVG wheel with better visual style
    let svg = `<svg width="${wheelSize}" height="${wheelSize}" viewBox="0 0 ${wheelSize} ${wheelSize}" style="position: absolute; top: 0; left: 0;">
        <!-- Outer ring background -->
        <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="#1a202c" stroke="#4fd1c7" stroke-width="4"/>
        <!-- Inner ring background -->
        <circle cx="${centerX}" cy="${centerY}" r="${innerRadius}" fill="#1a202c" stroke="#4fd1c7" stroke-width="4"/>
    `;
    
    // Draw 36 slices (10 degrees each) - more visible
    for (let i = 0; i < 36; i++) {
        const angle1 = (i * 10 - 90) * Math.PI / 180;
        const angle2 = ((i + 1) * 10 - 90) * Math.PI / 180;
        
        const x1 = centerX + Math.cos(angle1) * innerRadius;
        const y1 = centerY + Math.sin(angle1) * innerRadius;
        const x2 = centerX + Math.cos(angle1) * radius;
        const y2 = centerY + Math.sin(angle1) * radius;
        const x3 = centerX + Math.cos(angle2) * radius;
        const y3 = centerY + Math.sin(angle2) * radius;
        const x4 = centerX + Math.cos(angle2) * innerRadius;
        const y4 = centerY + Math.sin(angle2) * innerRadius;
        
        const isRequired = mission.coverageZone.includes(i);
        const isCovered = coveredSlices.has(i);
        
        let fillColor = 'transparent';
        let strokeColor = 'rgba(255,255,255,0.05)';
        let strokeWidth = '0.5';
        
        if (isRequired && isCovered) {
            fillColor = 'rgba(79, 209, 199, 0.8)'; // Bright teal - covered required
            strokeColor = 'rgba(79, 209, 199, 0.9)';
            strokeWidth = '1.5';
        } else if (isRequired) {
            fillColor = 'rgba(246, 173, 85, 0.6)'; // Orange - required but not covered
            strokeColor = 'rgba(246, 173, 85, 0.8)';
            strokeWidth = '1.5';
        } else if (isCovered) {
            fillColor = 'rgba(79, 209, 199, 0.25)'; // Light teal - covered but not required
            strokeColor = 'rgba(79, 209, 199, 0.4)';
        }
        
        svg += `<path d="M ${x1} ${y1} L ${x2} ${y2} A ${radius} ${radius} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1} Z" 
            fill="${fillColor}" 
            stroke="${strokeColor}" 
            stroke-width="${strokeWidth}"/>`;
    }
    
    // Center circle with better styling
    const centerRequired = mission.coverageZone.includes(36);
    const centerCovered = coveredSlices.has(36);
    let centerFill = '#1a202c';
    let centerStroke = '#4fd1c7';
    if (centerRequired && centerCovered) {
        centerFill = 'rgba(79, 209, 199, 0.9)';
        centerStroke = '#4fd1c7';
    } else if (centerRequired) {
        centerFill = 'rgba(246, 173, 85, 0.8)';
        centerStroke = '#f6ad55';
    } else if (centerCovered) {
        centerFill = 'rgba(79, 209, 199, 0.5)';
    }
    
    svg += `<circle cx="${centerX}" cy="${centerY}" r="${innerRadius}" fill="${centerFill}" stroke="${centerStroke}" stroke-width="4"/>
    </svg>`;
    
    wheelContainer.innerHTML = svg;
}

// Open dispatch modal with coverage wheel
function openDispatchModal() {
    const modal = document.getElementById('dispatchModal');
    if (!modal || !gameState.selectedMission) return;
    
    renderCoverageWheel(gameState.selectedMission);
    
    const teamStats = calculateTeamStats(gameState.currentTeam);
    const statsDisplay = document.getElementById('teamStatsDisplay');
    if (statsDisplay) {
        const req = gameState.selectedMission.requiredStats;
        statsDisplay.innerHTML = `
            <div class="stat-row">
                <span class="stat-label">Vigor:</span>
                <span class="stat-value ${teamStats.vigor >= req.vigor ? 'stat-met' : 'stat-unmet'}">
                    ${teamStats.vigor} / ${req.vigor}
                </span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Combat:</span>
                <span class="stat-value ${teamStats.combat >= req.combat ? 'stat-met' : 'stat-unmet'}">
                    ${teamStats.combat} / ${req.combat}
                </span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Mobility:</span>
                <span class="stat-value ${teamStats.mobility >= req.mobility ? 'stat-met' : 'stat-unmet'}">
                    ${teamStats.mobility} / ${req.mobility}
                </span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Intellect:</span>
                <span class="stat-value ${teamStats.intellect >= req.intellect ? 'stat-met' : 'stat-unmet'}">
                    ${teamStats.intellect} / ${req.intellect}
                </span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Charisma:</span>
                <span class="stat-value ${teamStats.charisma >= req.charisma ? 'stat-met' : 'stat-unmet'}">
                    ${teamStats.charisma} / ${req.charisma}
                </span>
            </div>
        `;
    }
    
    // Calculate and display success probability
    const successCalc = calculateSuccessProbability(gameState.currentTeam, gameState.selectedMission);
    const successProb = successCalc.probability;
    
    // Add success probability display
    let successDisplay = document.getElementById('successProbabilityDisplay');
    if (!successDisplay) {
        successDisplay = document.createElement('div');
        successDisplay.id = 'successProbabilityDisplay';
        successDisplay.className = 'success-probability-display';
        const coverageDisplay = document.querySelector('.coverage-display');
        if (coverageDisplay) {
            coverageDisplay.insertBefore(successDisplay, coverageDisplay.firstChild);
        }
    }
    
    let probText = '';
    let probClass = '';
    if (successProb >= 80) {
        probText = 'Basically Guaranteed';
        probClass = 'prob-excellent';
    } else if (successProb >= 60) {
        probText = 'Good Chance';
        probClass = 'prob-good';
    } else if (successProb >= 40) {
        probText = 'Risky';
        probClass = 'prob-medium';
    } else {
        probText = 'Very Likely to Fail';
        probClass = 'prob-low';
    }
    
    successDisplay.innerHTML = `
        <h3>Success Probability: <span class="${probClass}">${successProb.toFixed(1)}%</span></h3>
        <p class="prob-description ${probClass}">${probText}</p>
    `;
    
    const coverage = calculateCoverage(gameState.currentTeam, gameState.selectedMission);
    const coveragePercent = document.getElementById('coveragePercent');
    if (coveragePercent) {
        coveragePercent.textContent = `${coverage.toFixed(1)}%`;
        coveragePercent.className = coverage >= 100 ? 'coverage-full' : coverage >= 75 ? 'coverage-good' : coverage >= 50 ? 'coverage-medium' : 'coverage-low';
    }
    
    // Update coverage bar
    const coverageBarFill = document.getElementById('coverageBarFill');
    if (coverageBarFill) {
        coverageBarFill.style.width = `${coverage}%`;
        coverageBarFill.className = `coverage-bar-fill ${coverage >= 100 ? 'coverage-full' : coverage >= 75 ? 'coverage-good' : coverage >= 50 ? 'coverage-medium' : 'coverage-low'}`;
    }
    
    const executeBtn = document.getElementById('executeDispatchBtn');
    if (executeBtn) {
        executeBtn.style.display = 'block';
        executeBtn.onclick = () => {
            executeDispatch();
        };
        // Disable if no team
        executeBtn.disabled = gameState.currentTeam.length === 0;
    }
    
    const resultDiv = document.getElementById('dispatchResult');
    if (resultDiv) {
        resultDiv.style.display = 'none';
        resultDiv.innerHTML = '';
    }
    
    modal.style.display = 'block';
}

// Execute dispatch with bouncing ball
function executeDispatch() {
    if (!gameState.selectedMission || gameState.currentTeam.length === 0) return;
    
    const mission = gameState.selectedMission;
    const coverage = calculateCoverage(gameState.currentTeam, mission);
    const meetsStats = meetsStatRequirements(gameState.currentTeam, mission);
    
    const executeBtn = document.getElementById('executeDispatchBtn');
    if (executeBtn) executeBtn.style.display = 'none';
    
    const ball = document.getElementById('bouncingBall');
    if (ball && coverage < 100) {
        animateBouncingBall(mission, coverage, meetsStats);
    } else {
        completeDispatch(mission, true, null);
    }
}

// Animate bouncing ball with proper physics - Dispatch style
function animateBouncingBall(mission, coverage, meetsStats) {
    const ball = document.getElementById('bouncingBall');
    const wheelContainer = document.getElementById('coverageWheel');
    if (!ball || !wheelContainer) return;
    
    const wheelSize = 450;
    const centerX = wheelSize / 2;
    const centerY = wheelSize / 2;
    const radius = wheelSize / 2 - 25;
    
    ball.style.display = 'block';
    ball.style.width = '24px';
    ball.style.height = '24px';
    ball.style.position = 'absolute';
    ball.style.borderRadius = '50%';
    ball.style.background = 'radial-gradient(circle at 30% 30%, #fff, #fbd38d)';
    ball.style.boxShadow = '0 0 20px rgba(251, 211, 141, 1), 0 0 40px rgba(251, 211, 141, 0.5)';
    ball.style.zIndex = '1000';
    ball.style.transition = 'none';
    ball.style.border = '2px solid rgba(255, 255, 255, 0.3)';
    
    // Get covered slices
    const coveredSlices = new Set();
    gameState.currentTeam.forEach(charId => {
        const char = gameState.characters.find(c => c.id === charId);
        if (char && char.coverageShape) {
            char.coverageShape.forEach(slice => coveredSlices.add(slice));
        }
    });
    
    const requiredSlices = new Set(mission.coverageZone);
    
    // Animate ball bouncing around the wheel - more realistic physics
    let angle = Math.random() * Math.PI * 2; // Start at random angle
    let angularVelocity = 0.12 + Math.random() * 0.08; // Variable starting speed
    let angularAcceleration = -0.0003 - Math.random() * 0.0002; // Variable deceleration
    let frameCount = 0;
    const minSpeed = 0.015;
    const maxFrames = 300; // Maximum animation frames
    
    const animate = () => {
        frameCount++;
        angle += angularVelocity;
        angularVelocity += angularAcceleration;
        
        // Ensure minimum speed for smooth animation
        if (angularVelocity < minSpeed) {
            angularVelocity = minSpeed;
        }
        
        // Calculate position on wheel edge (outer edge of the ring)
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        // Position ball with offset for center alignment
        const ballOffset = 12; // Half of ball size
        ball.style.left = `${x - ballOffset}px`;
        ball.style.top = `${y - ballOffset}px`;
        
        // Continue until very slow or max frames reached
        if ((angularVelocity > 0.025 || frameCount < 80) && frameCount < maxFrames) {
            requestAnimationFrame(animate);
        } else {
            // Ball has stopped - determine result
            // Convert angle to slice index (0-35)
            let normalizedAngle = (angle * 180 / Math.PI + 90) % 360;
            if (normalizedAngle < 0) normalizedAngle += 360;
            let sliceIndex = Math.floor(normalizedAngle / 10) % 36;
            
            const isCovered = coveredSlices.has(sliceIndex) && requiredSlices.has(sliceIndex);
            // Success chance based on coverage, but landing on covered required slice = auto success
            const success = isCovered || (Math.random() < (coverage / 100));
            
            // Add slight delay before showing result
            setTimeout(() => {
                completeDispatch(mission, success, { coverage, sliceIndex, isCovered, angle });
            }, 300);
        }
    };
    
    animate();
}

// Complete dispatch
function completeDispatch(mission, success, ballResult) {
    const result = dispatchTeam(mission.id, gameState.currentTeam);
    
    const resultDiv = document.getElementById('dispatchResult');
    if (resultDiv) {
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
            <div class="dispatch-result">
                <h3 class="result-title ${success ? 'result-success' : 'result-failure'}">
                    ${success ? '✓ MISSION SUCCESS!' : '✗ MISSION FAILED'}
                </h3>
                <p class="result-message">
                    ${success ? `Earned ${mission.reward.credits} credits and ${mission.reward.reputation} reputation!` : 'No rewards earned.'}
                </p>
                ${ballResult ? `<p class="result-coverage">Coverage: ${ballResult.coverage.toFixed(1)}%</p>` : ''}
                <button class="btn btn-primary" onclick="closeDispatchModal()">Close</button>
            </div>
        `;
    }
    
    const ball = document.getElementById('bouncingBall');
    if (ball) ball.style.display = 'none';
}

function closeDispatchModal() {
    const modal = document.getElementById('dispatchModal');
    if (modal) modal.style.display = 'none';
    
    gameState.currentTeam = [];
    updateCharacterSlots();
    updateCharacterRoster();
    
    selectMissionFromAvailable();
}

function showCharacterSelectionModal(slotNumber) {
    // Highlight available characters in roster
    const roster = document.getElementById('characterRoster');
    if (roster) {
        const chars = roster.querySelectorAll('.roster-character');
        chars.forEach(charEl => {
            const charId = parseInt(charEl.getAttribute('data-char-id') || '0');
            const char = gameState.characters.find(c => c.id === charId);
            if (char && char.status === 'available' && !gameState.currentTeam.includes(charId)) {
                charEl.style.animation = 'pulse 1s infinite';
                setTimeout(() => {
                    charEl.style.animation = '';
                }, 3000);
            }
        });
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    
    setTimeout(() => {
        selectMissionFromAvailable();
    }, 500);
    
    const enterDispatchBtn = document.getElementById('enterDispatchBtn');
    if (enterDispatchBtn) {
        enterDispatchBtn.addEventListener('click', () => {
            if (!gameState.selectedMission) {
                alert('Please select a mission first!');
                return;
            }
            if (gameState.currentTeam.length === 0) {
                alert('Please select characters from the roster below!');
                return;
            }
            if (gameState.currentTeam.length < 2) {
                alert('You need at least 2 characters for a mission!');
                return;
            }
            openDispatchModal();
        });
    }
    
    // Character slot clicks - allow clicking to remove or add
    for (let i = 1; i <= 8; i++) {
        const slot = document.getElementById(`charSlot${i}`);
        if (slot) {
            slot.addEventListener('click', () => {
                const charIndex = i - 1;
                if (charIndex < gameState.currentTeam.length) {
                    // Remove character from this slot
                    gameState.currentTeam.splice(charIndex, 1);
                } else {
                    // Slot is empty - show selection hint
                    showCharacterSelectionModal(i);
                }
                updateCharacterSlots();
                updateCharacterRoster();
                if (gameState.selectedMission) {
                    updateRadarChart(gameState.selectedMission);
                }
            });
        }
    }
    
    const clearSlots = document.querySelector('.clear-slots');
    if (clearSlots) {
        clearSlots.addEventListener('click', (e) => {
            e.stopPropagation();
            gameState.currentTeam = [];
            updateCharacterSlots();
            updateCharacterRoster();
        });
    }
    
    // Team Selection Modal
    const teamSelectBtn = document.getElementById('teamSelectBtn');
    if (teamSelectBtn) {
        teamSelectBtn.addEventListener('click', () => {
            openTeamSelectModal();
        });
    }
    
    // Tab switching in team select modal
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.dataset.tab;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            document.getElementById(tab === 'preset' ? 'presetTeamsTab' : 'customTeamTab').classList.add('active');
            
            if (tab === 'preset') {
                loadPresetTeams();
            }
        });
    });
    
    // Confirm team button
    const confirmTeamBtn = document.getElementById('confirmTeamBtn');
    if (confirmTeamBtn) {
        confirmTeamBtn.addEventListener('click', () => {
            const modal = document.getElementById('teamSelectModal');
            if (modal) modal.style.display = 'none';
            updateCharacterSlots();
            updateCharacterRoster();
            if (gameState.selectedMission) {
                updateRadarChart(gameState.selectedMission);
            }
        });
    }
    
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('close') || e.target.classList.contains('modal')) {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        }
    });
});

// Open team selection modal
function openTeamSelectModal() {
    const modal = document.getElementById('teamSelectModal');
    if (!modal) return;
    
    loadPresetTeams();
    modal.style.display = 'block';
}

// Load preset teams
function loadPresetTeams() {
    const grid = document.getElementById('presetTeamsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (typeof premadeTeams !== 'undefined') {
        premadeTeams.forEach(team => {
            const teamCard = document.createElement('div');
            teamCard.className = 'preset-team-card';
            teamCard.innerHTML = `
                <h3>${team.name}</h3>
                <p>${team.description}</p>
                <div class="team-members-preview">
                    ${team.members.slice(0, 4).map(id => {
                        const char = gameState.characters.find(c => c.id === id);
                        return char ? `<span>${char.name}</span>` : '';
                    }).join('')}
                    ${team.members.length > 4 ? `<span>+${team.members.length - 4} more</span>` : ''}
                </div>
                <button class="btn btn-primary" onclick="selectPresetTeam(${team.id})">Select Team</button>
            `;
            grid.appendChild(teamCard);
        });
    }
}

// Select preset team
function selectPresetTeam(teamId) {
    if (typeof premadeTeams === 'undefined') return;
    
    const team = premadeTeams.find(t => t.id === teamId);
    if (!team) return;
    
    // Filter to only available heroes
    const availableMembers = team.members.filter(id => {
        const char = gameState.characters.find(c => c.id === id);
        return char && char.status === 'available' && !char.needsReview;
    });
    
    if (availableMembers.length < team.members.length) {
        alert(`Some team members are not available. Only ${availableMembers.length} of ${team.members.length} heroes are ready.`);
    }
    
    gameState.currentTeam = availableMembers.slice(0, 8); // Max 8 heroes
    updateCharacterSlots();
    updateCharacterRoster();
}
