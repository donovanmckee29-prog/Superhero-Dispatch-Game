import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAudioSystem } from '../utils/audioSystem'

const LevelUpModal = ({ hero, onConfirm, onCancel }) => {
  const [statAllocations, setStatAllocations] = useState({})
  const [availablePoints, setAvailablePoints] = useState(2) // 2 points per level
  const audioSystem = getAudioSystem()

  if (!hero) return null

  const statNames = {
    combat: { label: 'Combat', icon: '⚔️', color: '#FF3366' },
    vigor: { label: 'Vigor', icon: '🛡️', color: '#4A90E2' },
    mobility: { label: 'Mobility', icon: '⚡', color: '#00D9FF' },
    charisma: { label: 'Charisma', icon: '💬', color: '#00FF88' },
    intellect: { label: 'Intellect', icon: '🧠', color: '#9F7AEA' }
  }

  const handleStatIncrease = (stat) => {
    if (availablePoints > 0 && (hero.stats[stat] || 0) < 5) {
      const current = statAllocations[stat] || 0
      setStatAllocations({ ...statAllocations, [stat]: current + 1 })
      setAvailablePoints(availablePoints - 1)
      audioSystem.playHeroSelect()
    } else {
      audioSystem.playError()
    }
  }

  const handleStatDecrease = (stat) => {
    if (statAllocations[stat] > 0) {
      setStatAllocations({ ...statAllocations, [stat]: statAllocations[stat] - 1 })
      setAvailablePoints(availablePoints + 1)
      audioSystem.playHeroSelect()
    }
  }

  const handleConfirm = () => {
    if (availablePoints === 0 || Object.values(statAllocations).some(v => v > 0)) {
      onConfirm(statAllocations)
      audioSystem.playSuccess()
    } else {
      audioSystem.playError()
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: '#0A0E27',
            border: '3px solid #FFD700',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 0 40px #FFD70060'
          }}
        >
          {/* Header */}
          <div
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#FFD700',
              textAlign: 'center',
              marginBottom: '8px'
            }}
          >
            {hero.name} - LEVEL UP!
          </div>
          <div
            style={{
              fontSize: '16px',
              color: '#00D9FF',
              textAlign: 'center',
              marginBottom: '24px'
            }}
          >
            Available Skill Points: {availablePoints}
          </div>

          {/* Stat allocation */}
          <div style={{ marginBottom: '24px' }}>
            {Object.keys(statNames).map(stat => {
              const statInfo = statNames[stat]
              const currentValue = hero.stats[stat] || 0
              const allocated = statAllocations[stat] || 0
              const newValue = currentValue + allocated
              const canIncrease = availablePoints > 0 && newValue < 5
              const canDecrease = allocated > 0

              return (
                <div
                  key={stat}
                  style={{
                    marginBottom: '16px',
                    padding: '12px',
                    background: 'rgba(26, 31, 58, 0.8)',
                    borderRadius: '8px',
                    border: '1px solid #00D9FF'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '20px' }}>{statInfo.icon}</span>
                      <span style={{ fontSize: '16px', fontWeight: 'bold', color: statInfo.color }}>
                        {statInfo.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <motion.button
                        whileHover={canDecrease ? { scale: 1.1 } : {}}
                        whileTap={canDecrease ? { scale: 0.9 } : {}}
                        onClick={() => handleStatDecrease(stat)}
                        disabled={!canDecrease}
                        style={{
                          width: '32px',
                          height: '32px',
                          background: canDecrease ? '#FF3366' : '#444',
                          border: 'none',
                          borderRadius: '4px',
                          color: '#fff',
                          fontSize: '18px',
                          fontWeight: 'bold',
                          cursor: canDecrease ? 'pointer' : 'not-allowed'
                        }}
                      >
                        -
                      </motion.button>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', minWidth: '60px', textAlign: 'center' }}>
                        {newValue}/5
                      </div>
                      <motion.button
                        whileHover={canIncrease ? { scale: 1.1 } : {}}
                        whileTap={canIncrease ? { scale: 0.9 } : {}}
                        onClick={() => handleStatIncrease(stat)}
                        disabled={!canIncrease}
                        style={{
                          width: '32px',
                          height: '32px',
                          background: canIncrease ? '#00FF88' : '#444',
                          border: 'none',
                          borderRadius: '4px',
                          color: '#fff',
                          fontSize: '18px',
                          fontWeight: 'bold',
                          cursor: canIncrease ? 'pointer' : 'not-allowed'
                        }}
                      >
                        +
                      </motion.button>
                    </div>
                  </div>
                  {/* Stat bar */}
                  <div
                    style={{
                      width: '100%',
                      height: '8px',
                      background: 'rgba(0, 0, 0, 0.5)',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      display: 'flex'
                    }}
                  >
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: '100%',
                          background: i < newValue ? statInfo.color : 'rgba(255, 255, 255, 0.1)',
                          borderRight: i < 4 ? '1px solid rgba(0, 0, 0, 0.3)' : 'none',
                          boxShadow: i < newValue ? `0 0 5px ${statInfo.color}` : 'none'
                        }}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCancel}
              style={{
                flex: 1,
                padding: '14px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '2px solid #888',
                borderRadius: '8px',
                color: '#ccc',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              CANCEL
            </motion.button>
            <motion.button
              whileHover={availablePoints === 0 ? { scale: 1.05 } : {}}
              whileTap={availablePoints === 0 ? { scale: 0.95 } : {}}
              onClick={handleConfirm}
              disabled={availablePoints > 0}
              style={{
                flex: 1,
                padding: '14px',
                background: availablePoints === 0 ? '#FFD700' : '#444',
                border: '2px solid',
                borderColor: availablePoints === 0 ? '#FFD700' : '#666',
                borderRadius: '8px',
                color: availablePoints === 0 ? '#000' : '#888',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: availablePoints === 0 ? 'pointer' : 'not-allowed',
                boxShadow: availablePoints === 0 ? '0 0 20px #FFD700' : 'none'
              }}
            >
              CONFIRM
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default LevelUpModal

