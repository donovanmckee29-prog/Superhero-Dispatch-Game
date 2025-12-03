import React from 'react'
import { useGameStore } from '../store/gameStore'

const HUD = () => {
  const { shiftStats, dispatcherRank, gameTime } = useGameStore()

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const successRate =
    shiftStats.successful + shiftStats.failed > 0
      ? Math.round((shiftStats.successful / (shiftStats.successful + shiftStats.failed)) * 100)
      : 0

  return (
    <div
      style={{
        height: '60px',
        background: 'rgba(10, 14, 39, 0.95)',
        borderBottom: '2px solid #00D9FF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        boxShadow: '0 2px 10px rgba(0, 217, 255, 0.3)'
      }}
    >
      {/* Left: Shift timer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '2px' }}>SHIFT TIME</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#00D9FF' }}>
            {formatTime(gameTime)}
          </div>
        </div>
      </div>

      {/* Center: Performance stats */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '2px' }}>SUCCESSFUL</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#00FF88' }}>
            {shiftStats.successful}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '2px' }}>FAILED</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#FF3366' }}>
            {shiftStats.failed}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '2px' }}>MISSED</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#888' }}>
            {shiftStats.missed}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '2px' }}>SUCCESS RATE</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#FFD700' }}>
            {successRate}%
          </div>
        </div>
      </div>

      {/* Right: Dispatcher rank */}
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '12px', color: '#888', marginBottom: '2px' }}>RANK</div>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#FFD700' }}>
          {dispatcherRank}
        </div>
      </div>
    </div>
  )
}

export default HUD

