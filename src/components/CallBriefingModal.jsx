import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore, HERO_STATUS } from '../store/gameStore'
import { getAudioSystem } from '../utils/audioSystem'

const CallBriefingModal = ({ call, onClose, onDispatch }) => {
  const heroes = useGameStore(state => state.heroes)
  const [selectedHeroIds, setSelectedHeroIds] = useState([])
  const audioSystem = getAudioSystem()

  if (!call) return null

  const availableHeroes = heroes.filter(h => h.status === HERO_STATUS.AVAILABLE)
  const maxSlots = call.heroSlots || 3

  const handleHeroSelect = (heroId) => {
    if (selectedHeroIds.includes(heroId)) {
      setSelectedHeroIds(selectedHeroIds.filter(id => id !== heroId))
      audioSystem.playHeroSelect()
    } else if (selectedHeroIds.length < maxSlots) {
      setSelectedHeroIds([...selectedHeroIds, heroId])
      audioSystem.playHeroSelect()
    } else {
      audioSystem.playError()
    }
  }

  const handleDispatch = () => {
    if (selectedHeroIds.length > 0) {
      onDispatch(selectedHeroIds)
    } else {
      audioSystem.playError()
    }
  }

  const getCallTypeColor = () => {
    switch (call.type) {
      case 'urgent':
        return '#FF8C00'
      case 'conflicting':
        return '#FF69B4'
      case 'hacking':
        return '#9F7AEA'
      default:
        return '#00D9FF'
    }
  }

  const highlightKeywords = (text, keywords) => {
    if (!keywords || keywords.length === 0) return text
    
    let highlighted = text
    keywords.forEach(keyword => {
      const regex = new RegExp(`(${keyword})`, 'gi')
      highlighted = highlighted.replace(regex, `<span style="color: ${getCallTypeColor()}; font-weight: bold; text-shadow: 0 0 5px ${getCallTypeColor()}">$1</span>`)
    })
    return highlighted
  }

  const timeRemaining = Math.max(0, call.timeRemaining || 0)
  const seconds = Math.ceil(timeRemaining / 1000)

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
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: '#0A0E27',
            border: `3px solid ${getCallTypeColor()}`,
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: `0 0 30px ${getCallTypeColor()}60`
          }}
        >
          {/* Header */}
          <div
            style={{
              background: getCallTypeColor(),
              color: '#000',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
              {call.type.toUpperCase()} CALL
            </div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
              {seconds}s
            </div>
          </div>

          {/* Mission description */}
          <div style={{ marginBottom: '20px' }}>
            <div
              style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#00D9FF',
                marginBottom: '12px'
              }}
            >
              {call.title}
            </div>
            <div
              style={{
                fontSize: '14px',
                color: '#ccc',
                lineHeight: '1.6',
                marginBottom: '12px'
              }}
              dangerouslySetInnerHTML={{
                __html: highlightKeywords(call.description || '', call.keywords || [])
              }}
            />
            
            {/* Keywords */}
            {call.keywords && call.keywords.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>
                  Keywords:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {call.keywords.map((keyword, i) => (
                    <span
                      key={i}
                      style={{
                        background: 'rgba(0, 217, 255, 0.2)',
                        border: `1px solid ${getCallTypeColor()}`,
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '11px',
                        color: getCallTypeColor()
                      }}
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Hero selection */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#00D9FF', marginBottom: '12px' }}>
              SELECT HEROES ({selectedHeroIds.length}/{maxSlots})
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '12px',
                maxHeight: '300px',
                overflowY: 'auto',
                padding: '8px'
              }}
            >
              {availableHeroes.map(hero => {
                const isSelected = selectedHeroIds.includes(hero.id)
                return (
                  <motion.div
                    key={hero.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleHeroSelect(hero.id)}
                    style={{
                      background: isSelected
                        ? 'rgba(255, 215, 0, 0.2)'
                        : 'rgba(26, 31, 58, 0.8)',
                      border: `2px solid ${isSelected ? '#FFD700' : '#00D9FF'}`,
                      borderRadius: '8px',
                      padding: '12px',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 0 15px #FFD700' : 'none'
                    }}
                  >
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: isSelected ? '#FFD700' : '#00D9FF', marginBottom: '4px' }}>
                      {hero.name}
                    </div>
                    <div style={{ fontSize: '10px', color: '#888' }}>
                      Lv.{hero.level} • {hero.class}
                    </div>
                    {isSelected && (
                      <div style={{ fontSize: '20px', textAlign: 'center', marginTop: '4px' }}>
                        ✓
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Selected heroes preview */}
          {selectedHeroIds.length > 0 && (
            <div style={{ marginBottom: '20px', padding: '12px', background: 'rgba(0, 217, 255, 0.1)', borderRadius: '8px' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#00D9FF', marginBottom: '8px' }}>
                SELECTED TEAM:
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {selectedHeroIds.map(heroId => {
                  const hero = heroes.find(h => h.id === heroId)
                  if (!hero) return null
                  return (
                    <div
                      key={heroId}
                      style={{
                        background: 'rgba(255, 215, 0, 0.2)',
                        border: '1px solid #FFD700',
                        borderRadius: '4px',
                        padding: '6px 10px',
                        fontSize: '12px',
                        color: '#FFD700'
                      }}
                    >
                      {hero.name}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Dispatch button */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              style={{
                padding: '12px 24px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '2px solid #888',
                borderRadius: '8px',
                color: '#ccc',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              CANCEL
            </motion.button>
            <motion.button
              whileHover={selectedHeroIds.length > 0 ? { scale: 1.05 } : {}}
              whileTap={selectedHeroIds.length > 0 ? { scale: 0.95 } : {}}
              onClick={handleDispatch}
              disabled={selectedHeroIds.length === 0}
              style={{
                padding: '12px 24px',
                background: selectedHeroIds.length > 0 ? '#FFD700' : '#444',
                border: '2px solid',
                borderColor: selectedHeroIds.length > 0 ? '#FFD700' : '#666',
                borderRadius: '8px',
                color: selectedHeroIds.length > 0 ? '#000' : '#888',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: selectedHeroIds.length > 0 ? 'pointer' : 'not-allowed',
                boxShadow: selectedHeroIds.length > 0 ? '0 0 20px #FFD700' : 'none',
                transition: 'all 0.3s'
              }}
              animate={
                selectedHeroIds.length > 0
                  ? {
                      boxShadow: [
                        '0 0 20px #FFD700',
                        '0 0 30px #FFD700',
                        '0 0 20px #FFD700'
                      ]
                    }
                  : {}
              }
              transition={
                selectedHeroIds.length > 0
                  ? {
                      boxShadow: {
                        duration: 1,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }
                    }
                  : {}
              }
            >
              DISPATCH
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default CallBriefingModal

