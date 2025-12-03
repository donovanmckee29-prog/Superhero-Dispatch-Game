import React from 'react'
import { motion } from 'framer-motion'
import { useGameStore, HERO_STATUS } from '../store/gameStore'
import { getAudioSystem } from '../utils/audioSystem'

const HeroRoster = () => {
  const heroes = useGameStore(state => state.heroes)
  const audioSystem = getAudioSystem()

  const getStatusColor = (status) => {
    switch (status) {
      case HERO_STATUS.AVAILABLE:
        return '#FFD700'
      case HERO_STATUS.BUSY:
        return '#4A90E2'
      case HERO_STATUS.RETURNING:
        return '#00D9FF'
      case HERO_STATUS.RESTING:
        return '#FF8C00'
      case HERO_STATUS.INJURED:
        return '#FF3366'
      case HERO_STATUS.DOWNED:
        return '#666'
      default:
        return '#888'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case HERO_STATUS.AVAILABLE:
        return 'AVAILABLE'
      case HERO_STATUS.BUSY:
        return 'ON MISSION'
      case HERO_STATUS.RETURNING:
        return 'RETURNING'
      case HERO_STATUS.RESTING:
        return 'RESTING'
      case HERO_STATUS.INJURED:
        return 'INJURED'
      case HERO_STATUS.DOWNED:
        return 'DOWNED'
      default:
        return status.toUpperCase()
    }
  }

  const formatTime = (ms) => {
    const seconds = Math.ceil(ms / 1000)
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleHeroClick = (hero) => {
    if (hero.status !== HERO_STATUS.AVAILABLE) {
      audioSystem.playError()
      // Shake animation handled by motion
    }
  }

  return (
    <div
      style={{
        width: '320px',
        height: '100%',
        background: 'rgba(10, 14, 39, 0.95)',
        borderLeft: '2px solid #00D9FF',
        padding: '16px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
    >
      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#00D9FF', marginBottom: '8px' }}>
        HERO ROSTER
      </div>
      
      {heroes.map(hero => (
        <HeroCard key={hero.id} hero={hero} onClick={() => handleHeroClick(hero)} />
      ))}
    </div>
  )
}

const HeroCard = ({ hero, onClick }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case HERO_STATUS.AVAILABLE:
        return '#FFD700'
      case HERO_STATUS.BUSY:
        return '#4A90E2'
      case HERO_STATUS.RETURNING:
        return '#00D9FF'
      case HERO_STATUS.RESTING:
        return '#FF8C00'
      case HERO_STATUS.INJURED:
        return '#FF3366'
      case HERO_STATUS.DOWNED:
        return '#666'
      default:
        return '#888'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case HERO_STATUS.AVAILABLE:
        return 'AVAILABLE'
      case HERO_STATUS.BUSY:
        return 'ON MISSION'
      case HERO_STATUS.RETURNING:
        return 'RETURNING'
      case HERO_STATUS.RESTING:
        return 'RESTING'
      case HERO_STATUS.INJURED:
        return 'INJURED'
      case HERO_STATUS.DOWNED:
        return 'DOWNED'
      default:
        return status.toUpperCase()
    }
  }

  const formatTime = (ms) => {
    const seconds = Math.ceil(ms / 1000)
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const isAvailable = hero.status === HERO_STATUS.AVAILABLE
  const statusColor = getStatusColor(hero.status)
  const opacity = isAvailable ? 1 : 0.6

  // XP bar calculation
  const xpPercent = hero.xpToNext > 0 ? (hero.xp / hero.xpToNext) * 100 : 0

  return (
    <motion.div
      whileHover={isAvailable ? { scale: 1.02 } : {}}
      whileTap={isAvailable ? { scale: 0.98 } : { x: [-5, 5, -5, 5, 0] }}
      onClick={onClick}
      style={{
        background: 'rgba(26, 31, 58, 0.8)',
        border: `2px solid ${statusColor}`,
        borderRadius: '8px',
        padding: '12px',
        opacity,
        cursor: isAvailable ? 'pointer' : 'not-allowed',
        position: 'relative',
        boxShadow: isAvailable
          ? `0 0 10px ${statusColor}40`
          : 'none'
      }}
      animate={
        isAvailable
          ? {
              boxShadow: [
                `0 0 10px ${statusColor}40`,
                `0 0 20px ${statusColor}60`,
                `0 0 10px ${statusColor}40`
              ]
            }
          : {}
      }
      transition={
        isAvailable
          ? {
              boxShadow: {
                duration: 1,
                repeat: Infinity,
                ease: 'easeInOut'
              }
            }
          : {}
      }
      role="button"
      tabIndex={0}
      aria-label={`${hero.name}, Level ${hero.level}, ${getStatusLabel(hero.status)}`}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && isAvailable) {
          e.preventDefault()
          onClick()
        }
      }}
    >
      {/* Status badge */}
      <div
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: statusColor,
          color: '#000',
          fontSize: '10px',
          fontWeight: 'bold',
          padding: '2px 6px',
          borderRadius: '4px'
        }}
      >
        {getStatusLabel(hero.status)}
      </div>

      {/* Hero name and level */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: statusColor }}>
          {hero.name}
        </div>
        <div style={{ fontSize: '12px', color: '#888' }}>
          {hero.class} • Level {hero.level}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
        <StatBar stat="Combat" value={hero.stats.combat} color="#FF3366" />
        <StatBar stat="Vigor" value={hero.stats.vigor} color="#4A90E2" />
        <StatBar stat="Mobility" value={hero.stats.mobility} color="#00D9FF" />
        <StatBar stat="Charisma" value={hero.stats.charisma} color="#00FF88" />
        <StatBar stat="Intellect" value={hero.stats.intellect} color="#9F7AEA" />
      </div>

      {/* XP bar */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ fontSize: '10px', color: '#888', marginBottom: '2px' }}>
          XP: {hero.xp}/{hero.xpToNext}
        </div>
        <div
          style={{
            width: '100%',
            height: '6px',
            background: 'rgba(0, 0, 0, 0.5)',
            borderRadius: '3px',
            overflow: 'hidden'
          }}
        >
          <motion.div
            style={{
              width: `${xpPercent}%`,
              height: '100%',
              background: '#FFD700',
              boxShadow: '0 0 10px #FFD700'
            }}
            initial={{ width: 0 }}
            animate={{ width: `${xpPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Rest timer */}
      {hero.status === HERO_STATUS.RESTING && hero.restTimeRemaining > 0 && (
        <div
          style={{
            fontSize: '11px',
            color: '#FF8C00',
            marginTop: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <span>⏱</span>
          <span>{formatTime(hero.restTimeRemaining)}</span>
        </div>
      )}

      {/* Needs review indicator */}
      {hero.needsReview && (
        <div
          style={{
            fontSize: '10px',
            color: '#FFD700',
            marginTop: '4px',
            fontStyle: 'italic'
          }}
        >
          Review required
        </div>
      )}

      {/* Unique power indicator */}
      {hero.uniquePower && (
        <div
          style={{
            fontSize: '9px',
            color: '#888',
            marginTop: '4px',
            fontStyle: 'italic'
          }}
        >
          {hero.uniquePower.name}
        </div>
      )}
    </motion.div>
  )
}

const StatBar = ({ stat, value, color }) => {
  const maxValue = 5
  const percent = (value / maxValue) * 100

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
      <div style={{ width: '60px', color: '#888' }}>{stat}:</div>
      <div
        style={{
          flex: 1,
          height: '12px',
          background: 'rgba(0, 0, 0, 0.5)',
          borderRadius: '2px',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: '100%',
            background: color,
            boxShadow: `0 0 5px ${color}`
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '4px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#fff',
            fontSize: '9px',
            fontWeight: 'bold',
            textShadow: '0 0 3px #000'
          }}
        >
          {value}
        </div>
      </div>
    </div>
  )
}

export default HeroRoster

