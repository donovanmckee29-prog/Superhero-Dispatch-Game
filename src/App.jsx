import React, { useEffect, useRef } from 'react'
import { useGameStore, HERO_STATUS } from './store/gameStore'
import { generateCall, generateConflictingCalls } from './utils/missionGenerator'
import { calculateMissionSuccess } from './utils/missionCalculator'
import { getAudioSystem } from './utils/audioSystem'
import CityMap from './components/CityMap'
import HeroRoster from './components/HeroRoster'
import CallBriefingModal from './components/CallBriefingModal'
import MissionResultsModal from './components/MissionResultsModal'
import LevelUpModal from './components/LevelUpModal'
import HackingMinigame from './components/HackingMinigame'
import HUD from './components/HUD'

function App() {
  const {
    calls,
    heroes,
    addCall,
    updateCall,
    removeCall,
    dispatchHeroes,
    completeMission,
    tickHeroStates,
    openCallId,
    openCall,
    closeCall,
    missionResults,
    reviewMissionResults,
    levelUpHero,
    confirmLevelUp,
    updateGameTime
  } = useGameStore()
  
  const [hackingCall, setHackingCall] = React.useState(null)
  
  const audioSystem = getAudioSystem()
  const gameLoopRef = useRef(null)
  const callSpawnTimerRef = useRef(null)
  const lastCallSpawnRef = useRef(Date.now())
  
  // Initialize audio
  useEffect(() => {
    audioSystem.init()
  }, [])
  
  // Game loop - tick hero states and update call timers
  useEffect(() => {
    gameLoopRef.current = setInterval(() => {
      tickHeroStates()
      updateGameTime(100)
      
      // Update call timers (only if not paused by open call)
      const now = Date.now()
      calls.forEach(call => {
        if (call.status === 'active' && call.id !== openCallId) {
          const elapsed = now - (call.lastTick || call.createdAt)
          const newTimeRemaining = Math.max(0, call.timeRemaining - elapsed)
          
          if (newTimeRemaining <= 0 && call.status === 'active') {
            // Call expired
            audioSystem.playFailure()
            removeCall(call.id)
            useGameStore.getState().shiftStats.missed++
          } else {
            updateCall(call.id, {
              timeRemaining: newTimeRemaining,
              lastTick: now
            })
            
            // Play countdown sound in last 10 seconds
            if (newTimeRemaining < 10000 && newTimeRemaining > 9500) {
              audioSystem.playCallCountdown()
            }
          }
        } else if (call.id === openCallId) {
          // Pause timer when call is open
          updateCall(call.id, { lastTick: now })
        }
      })
    }, 100) // Tick every 100ms
    
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
    }
  }, [calls, openCallId, tickHeroStates, updateGameTime, updateCall, removeCall])
  
  // Call spawning system
  useEffect(() => {
    const spawnCall = () => {
      const now = Date.now()
      const timeSinceLastCall = now - lastCallSpawnRef.current
      
      // Spawn conflicting calls occasionally (8% chance)
      if (Math.random() < 0.08 && timeSinceLastCall > 30000) {
        const conflictingCalls = generateConflictingCalls()
        conflictingCalls.forEach(call => {
          addCall(call)
          audioSystem.playCallSpawn()
        })
        lastCallSpawnRef.current = now
      } else if (timeSinceLastCall > 15000) { // Min 15s between calls
        const call = generateCall()
        addCall(call)
        audioSystem.playCallSpawn()
        lastCallSpawnRef.current = now
      }
    }
    
    // Initial call
    setTimeout(spawnCall, 2000)
    
    // Spawn calls periodically
    callSpawnTimerRef.current = setInterval(spawnCall, 20000) // Check every 20s
    
    return () => {
      if (callSpawnTimerRef.current) {
        clearInterval(callSpawnTimerRef.current)
      }
    }
  }, [addCall])
  
  // Mission progress simulation
  useEffect(() => {
    const progressInterval = setInterval(() => {
      calls.forEach(call => {
        if (call.status === 'in-progress' && call.assignedHeroes) {
          const assignedAt = call.assignedAt || Date.now()
          const missionDuration = 15000 // 15 seconds
          const elapsed = Date.now() - assignedAt
          
          if (elapsed >= missionDuration) {
            // Mission complete - calculate success
            const assignedHeroes = heroes.filter(h => call.assignedHeroes.includes(h.id))
            const result = calculateMissionSuccess(assignedHeroes, call.requiredStats, call)
            
            completeMission(call.id, result.success, result.success ? call.xpReward : 0)
            
            if (result.success) {
              audioSystem.playSuccess()
            } else {
              audioSystem.playFailure()
            }
          }
        }
      })
    }, 500)
    
    return () => clearInterval(progressInterval)
  }, [calls, heroes, completeMission])
  
  // Handle conflicting calls
  const handleCallClick = (call) => {
    if (call.type === 'conflicting') {
      // Remove the conflict partner
      const partner = calls.find(c => c.conflictId === call.conflictPartner)
      if (partner) {
        removeCall(partner.id)
      }
    }
    if (call.type === 'hacking') {
      setHackingCall(call)
    } else {
      openCall(call.id)
    }
  }
  
  const handleHackingSuccess = () => {
    if (hackingCall) {
      completeMission(hackingCall.id, true, hackingCall.xpReward || 150)
      removeCall(hackingCall.id)
      setHackingCall(null)
    }
  }
  
  const handleHackingFailure = () => {
    if (hackingCall) {
      completeMission(hackingCall.id, false, 0)
      removeCall(hackingCall.id)
      setHackingCall(null)
    }
  }
  
  const handleDispatch = (callId, selectedHeroIds) => {
    if (selectedHeroIds.length === 0) {
      audioSystem.playError()
      return
    }
    
    // Check if all heroes are available
    const selectedHeroes = heroes.filter(h => selectedHeroIds.includes(h.id))
    const unavailable = selectedHeroes.filter(h => h.status !== HERO_STATUS.AVAILABLE)
    
    if (unavailable.length > 0) {
      audioSystem.playError()
      return
    }
    
    dispatchHeroes(callId, selectedHeroIds)
    audioSystem.playDispatch()
    closeCall()
  }
  
  return (
    <div className="app-container" style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <HUD />
      
      <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
        <CityMap
          calls={calls.filter(c => c.status === 'active' || c.status === 'in-progress')}
          onMissionClick={handleCallClick}
          selectedMission={calls.find(c => c.id === openCallId)}
        />
        
        <HeroRoster />
      </div>
      
      {openCallId && (
        <CallBriefingModal
          call={calls.find(c => c.id === openCallId)}
          onClose={closeCall}
          onDispatch={(heroIds) => handleDispatch(openCallId, heroIds)}
        />
      )}
      
      {missionResults && (
        <MissionResultsModal
          results={missionResults}
          onClose={reviewMissionResults}
        />
      )}
      
      {levelUpHero && (
        <LevelUpModal
          hero={levelUpHero}
          onConfirm={(statAllocations) => confirmLevelUp(levelUpHero.id, statAllocations)}
          onCancel={() => useGameStore.getState().confirmLevelUp(levelUpHero.id, {})}
        />
      )}
      
      {hackingCall && (
        <HackingMinigame
          call={hackingCall}
          onSuccess={handleHackingSuccess}
          onFailure={handleHackingFailure}
        />
      )}
    </div>
  )
}

export default App

