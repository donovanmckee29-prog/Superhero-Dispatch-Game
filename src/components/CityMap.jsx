import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { getAudioSystem } from '../utils/audioSystem'

const CityMap = ({ calls, onMissionClick, selectedMission }) => {
  const canvasRef = useRef(null)
  const animationFrameRef = useRef(null)
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const width = canvas.width = canvas.offsetWidth
    const height = canvas.height = canvas.offsetHeight

    // Grid parameters
    const gridSize = 40
    const cols = Math.ceil(width / gridSize)
    const rows = Math.ceil(height / gridSize)

    // Buildings array
    const buildings = []
    for (let i = 0; i < cols * rows * 0.3; i++) {
      buildings.push({
        x: Math.random() * width,
        y: Math.random() * height,
        width: 20 + Math.random() * 40,
        height: 20 + Math.random() * 40,
        pulsePhase: Math.random() * Math.PI * 2,
        flickerPhase: Math.random() * Math.PI * 2
      })
    }

    const animate = (timestamp) => {
      timeRef.current = timestamp
      ctx.clearRect(0, 0, width, height)

      // Deep navy backdrop with gradient
      const gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, '#0a0e27')
      gradient.addColorStop(1, '#1a1f3a')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      // Draw grid - neon-cyan outlines, pulsing at 1Hz
      ctx.strokeStyle = `rgba(0, 217, 255, ${0.3 + Math.sin(timestamp / 1000) * 0.2})`
      ctx.lineWidth = 1
      ctx.setLineDash([])

      for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }

      for (let y = 0; y <= height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Draw major landmarks
      const landmarks = [
        { x: width * 0.2, y: height * 0.3, width: 80, height: 60, label: 'STADIUM' },
        { x: width * 0.7, y: height * 0.4, width: 60, height: 50, label: 'BANK' },
        { x: width * 0.5, y: height * 0.7, width: 70, height: 55, label: 'LAB' }
      ]
      
      landmarks.forEach(landmark => {
        const pulse = 0.6 + Math.sin(timestamp / 1500) * 0.2
        ctx.fillStyle = `rgba(255, 140, 0, ${pulse * 0.3})`
        ctx.fillRect(landmark.x, landmark.y, landmark.width, landmark.height)
        
        ctx.strokeStyle = `rgba(255, 215, 0, ${pulse * 0.8})`
        ctx.lineWidth = 2
        ctx.strokeRect(landmark.x, landmark.y, landmark.width, landmark.height)
        
        ctx.fillStyle = `rgba(255, 215, 0, ${pulse})`
        ctx.font = 'bold 12px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(landmark.label, landmark.x + landmark.width / 2, landmark.y + landmark.height / 2 + 4)
      })

      // Draw buildings with flicker
      buildings.forEach(building => {
        const flicker = 0.7 + Math.sin(timestamp / 2000 + building.flickerPhase) * 0.3
        ctx.fillStyle = `rgba(20, 30, 50, ${flicker})`
        ctx.fillRect(building.x, building.y, building.width, building.height)
        
        const pulse = 0.4 + Math.sin(timestamp / 1000 + building.pulsePhase) * 0.3
        ctx.strokeStyle = `rgba(0, 217, 255, ${pulse})`
        ctx.lineWidth = 1
        ctx.strokeRect(building.x, building.y, building.width, building.height)
      })
      
      // Draw roads
      const roads = [
        { x1: 0, y1: height * 0.2, x2: width, y2: height * 0.2 },
        { x1: 0, y1: height * 0.5, x2: width, y2: height * 0.5 },
        { x1: 0, y1: height * 0.8, x2: width, y2: height * 0.8 },
        { x1: width * 0.3, y1: 0, x2: width * 0.3, y2: height },
        { x1: width * 0.6, y1: 0, x2: width * 0.6, y2: height }
      ]
      
      roads.forEach(road => {
        ctx.strokeStyle = `rgba(0, 217, 255, ${0.2 + Math.sin(timestamp / 2000) * 0.1})`
        ctx.lineWidth = 3
        ctx.setLineDash([10, 5])
        ctx.beginPath()
        ctx.moveTo(road.x1, road.y1)
        ctx.lineTo(road.x2, road.y2)
        ctx.stroke()
        ctx.setLineDash([])
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate(0)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <div className="city-map-container" style={{ position: 'relative', width: '100%', height: '100%', flex: 1 }}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          imageRendering: 'crisp-edges'
        }}
      />
      {/* Call markers */}
      {calls.map(call => (
        <CallMarker
          key={call.id}
          call={call}
          onClick={() => onMissionClick(call)}
          isSelected={selectedMission?.id === call.id}
        />
      ))}
    </div>
  )
}

const CallMarker = ({ call, onClick, isSelected }) => {
  const [hovered, setHovered] = React.useState(false)
  const [missionProgress, setMissionProgress] = React.useState(0)
  const audioSystem = getAudioSystem()
  
  // Update mission progress in real-time
  React.useEffect(() => {
    if (call.status === 'in-progress' && call.assignedAt) {
      const updateProgress = () => {
        const missionDuration = 20000 // 20 seconds
        const elapsed = Date.now() - call.assignedAt
        const progress = Math.min(100, (elapsed / missionDuration) * 100)
        setMissionProgress(progress)
      }
      
      updateProgress()
      const interval = setInterval(updateProgress, 100)
      return () => clearInterval(interval)
    } else {
      setMissionProgress(0)
    }
  }, [call.status, call.assignedAt])

  const getColor = () => {
    if (call.status === 'in-progress') return '#4A90E2' // Blue for in-progress
    if (call.type === 'conflicting') return '#FF69B4'
    if (call.type === 'urgent') return '#FF8C00'
    if (call.type === 'hacking') return '#9F7AEA'
    return '#00D9FF'
  }

  const color = getColor()
  const timeRemaining = Math.max(0, call.timeRemaining || 0)
  const seconds = Math.ceil(timeRemaining / 1000)

  const getIcon = () => {
    if (call.type === 'conflicting') return '⚡'
    if (call.type === 'hacking') return '🔒'
    if (call.type === 'urgent') return '!'
    return '●'
  }

  const handleMouseEnter = () => {
    setHovered(true)
    audioSystem.playMissionSelect()
  }

  return (
    <motion.div
      className="call-marker"
      style={{
        position: 'absolute',
        left: `${call.x}%`,
        top: `${call.y}%`,
        transform: 'translate(-50%, -50%)',
        cursor: 'pointer',
        zIndex: isSelected ? 1000 : 100
      }}
      onClick={() => {
        audioSystem.playMissionSelect()
        onClick()
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
      role="button"
      tabIndex={0}
      aria-label={`${call.title} mission, ${call.type} priority, ${seconds} seconds remaining`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      {/* Pulsing dot */}
      <motion.div
        className="marker-dot"
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 20px ${color}, 0 0 40px ${color}`,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.8, 1]
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      
      {/* Icon */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '20px',
          color: '#fff',
          textShadow: `0 0 10px ${color}`,
          pointerEvents: 'none',
          fontWeight: 'bold'
        }}
      >
        {getIcon()}
      </div>

      {/* Timer or Progress */}
      <div
        style={{
          position: 'absolute',
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginTop: '8px',
          fontSize: '12px',
          color: color,
          textShadow: `0 0 5px ${color}`,
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        {call.status === 'in-progress' ? (
          <>
            <div>IN PROGRESS</div>
            <div
              style={{
                width: '60px',
                height: '4px',
                background: 'rgba(0, 0, 0, 0.5)',
                borderRadius: '2px',
                overflow: 'hidden'
              }}
            >
              <motion.div
                style={{
                  width: `${missionProgress}%`,
                  height: '100%',
                  background: color,
                  boxShadow: `0 0 10px ${color}`
                }}
                initial={{ width: 0 }}
                animate={{ width: `${missionProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </>
        ) : (
          <div>{seconds}s</div>
        )}
      </div>

      {/* Tooltip */}
      {hovered && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: '10px',
            background: '#1a1f3a',
            border: `2px solid ${color}`,
            borderRadius: '8px',
            padding: '12px 16px',
            minWidth: '200px',
            boxShadow: `0 4px 20px ${color}40`,
            zIndex: 1001
          }}
        >
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: color, marginBottom: '4px' }}>
            {call.title}
          </div>
          <div style={{ fontSize: '12px', color: '#00D9FF', marginBottom: '4px' }}>
            {call.type.toUpperCase()}
          </div>
          <div style={{ fontSize: '11px', color: '#888', fontStyle: 'italic' }}>
            {call.description?.substring(0, 60)}...
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default CityMap

