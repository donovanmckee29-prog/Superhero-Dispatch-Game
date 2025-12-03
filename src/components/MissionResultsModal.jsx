import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAudioSystem } from '../utils/audioSystem'

const MissionResultsModal = ({ results, onClose }) => {
  const audioSystem = getAudioSystem()

  if (!results) return null

  const { success, heroes, xpReward } = results
  const color = success ? '#00FF88' : '#FF3366'
  const icon = success ? '✓' : '✗'

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
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: '#0A0E27',
            border: `3px solid ${color}`,
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: `0 0 40px ${color}60`
          }}
        >
          {/* Result icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            style={{
              fontSize: '80px',
              color: color,
              textAlign: 'center',
              marginBottom: '20px',
              textShadow: `0 0 30px ${color}`
            }}
          >
            {icon}
          </motion.div>

          {/* Result text */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: color,
              textAlign: 'center',
              marginBottom: '30px'
            }}
          >
            {success ? 'MISSION SUCCESSFUL!' : 'MISSION FAILED'}
          </motion.div>

          {/* Hero results */}
          <div style={{ marginBottom: '24px' }}>
            {heroes.map((hero, index) => (
              <motion.div
                key={hero.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                style={{
                  background: 'rgba(26, 31, 58, 0.8)',
                  border: '1px solid #00D9FF',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#00D9FF' }}>
                    {hero.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    {hero.class}
                  </div>
                </div>
                {success && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1, type: 'spring' }}
                    style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: '#FFD700',
                      textShadow: '0 0 10px #FFD700'
                    }}
                  >
                    +{xpReward} XP
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Close button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            style={{
              width: '100%',
              padding: '14px',
              background: color,
              border: 'none',
              borderRadius: '8px',
              color: '#000',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: `0 0 20px ${color}`
            }}
          >
            REVIEW RESULTS
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default MissionResultsModal

