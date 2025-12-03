import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAudioSystem } from '../utils/audioSystem'

const HackingMinigame = ({ call, onSuccess, onFailure, onCancel }) => {
  const [grid, setGrid] = useState([])
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 })
  const [targetPos, setTargetPos] = useState({ x: 0, y: 0 })
  const [iceNodes, setIceNodes] = useState([])
  const [movesRemaining, setMovesRemaining] = useState(20)
  const [gameOver, setGameOver] = useState(false)
  const audioSystem = getAudioSystem()

  const GRID_SIZE = 5

  useEffect(() => {
    initializeGame()
  }, [])

  const initializeGame = () => {
    // Create grid
    const newGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('empty'))
    
    // Place player at top-left
    const startPos = { x: 0, y: 0 }
    newGrid[startPos.y][startPos.x] = 'player'
    setPlayerPos(startPos)
    
    // Place target at bottom-right
    const endPos = { x: GRID_SIZE - 1, y: GRID_SIZE - 1 }
    newGrid[endPos.y][endPos.x] = 'target'
    setTargetPos(endPos)
    
    // Place ICE nodes randomly (avoid start and end)
    const newIceNodes = []
    for (let i = 0; i < 5; i++) {
      let x, y
      do {
        x = Math.floor(Math.random() * GRID_SIZE)
        y = Math.floor(Math.random() * GRID_SIZE)
      } while (
        (x === startPos.x && y === startPos.y) ||
        (x === endPos.x && y === endPos.y) ||
        newIceNodes.some(node => node.x === x && node.y === y)
      )
      newIceNodes.push({ x, y })
      newGrid[y][x] = 'ice'
    }
    setIceNodes(newIceNodes)
    setGrid(newGrid)
  }

  const handleMove = (dx, dy) => {
    if (gameOver || movesRemaining <= 0) return

    const newX = playerPos.x + dx
    const newY = playerPos.y + dy

    // Check bounds
    if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) {
      audioSystem.playError()
      return
    }

    // Check if hitting ICE
    if (grid[newY][newX] === 'ice') {
      audioSystem.playFailure()
      setGameOver(true)
      setTimeout(() => onFailure(), 1000)
      return
    }

    // Move player
    const newGrid = [...grid]
    newGrid[playerPos.y][playerPos.x] = 'empty'
    newGrid[newY][newX] = 'player'
    setGrid(newGrid)
    setPlayerPos({ x: newX, y: newY })
    setMovesRemaining(movesRemaining - 1)
    audioSystem.playHeroSelect()

    // Check if reached target
    if (newX === targetPos.x && newY === targetPos.y) {
      audioSystem.playSuccess()
      setGameOver(true)
      setTimeout(() => onSuccess(), 1000)
      return
    }

    // Check if out of moves
    if (movesRemaining <= 1) {
      audioSystem.playFailure()
      setGameOver(true)
      setTimeout(() => onFailure(), 1000)
    }
  }

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameOver) return

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault()
          handleMove(0, -1)
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault()
          handleMove(0, 1)
          break
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault()
          handleMove(-1, 0)
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault()
          handleMove(1, 0)
          break
        case 'Escape':
          e.preventDefault()
          if (onCancel) {
            onCancel()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [playerPos, movesRemaining, gameOver, grid, onCancel])

  const getCellColor = (cell, x, y) => {
    if (cell === 'player') return '#00D9FF'
    if (cell === 'target') return '#00FF88'
    if (cell === 'ice') return '#FF3366'
    return 'rgba(0, 217, 255, 0.1)'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3000
      }}
    >
      <div
        style={{
          background: '#0A0E27',
          border: '3px solid #9F7AEA',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 0 40px #9F7AEA60'
        }}
      >
        <div
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#9F7AEA',
            textAlign: 'center',
            marginBottom: '20px'
          }}
        >
          HACKING MISSION
        </div>

        <div
          style={{
            fontSize: '14px',
            color: '#00D9FF',
            textAlign: 'center',
            marginBottom: '20px'
          }}
        >
          Moves Remaining: <span style={{ color: '#FFD700', fontWeight: 'bold' }}>{movesRemaining}</span>
        </div>

        {/* Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_SIZE}, 60px)`,
            gap: '4px',
            marginBottom: '20px',
            justifyContent: 'center'
          }}
        >
          {grid.map((row, y) =>
            row.map((cell, x) => (
              <motion.div
                key={`${x}-${y}`}
                whileHover={{ scale: 1.1 }}
                style={{
                  width: '60px',
                  height: '60px',
                  background: getCellColor(cell, x, y),
                  border: `2px solid ${cell === 'player' ? '#00D9FF' : cell === 'target' ? '#00FF88' : cell === 'ice' ? '#FF3366' : '#00D9FF40'}`,
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  boxShadow: cell === 'player' ? '0 0 15px #00D9FF' : cell === 'ice' ? '0 0 10px #FF3366' : 'none'
                }}
              >
                {cell === 'player' && '●'}
                {cell === 'target' && '✓'}
                {cell === 'ice' && '⚠'}
              </motion.div>
            ))
          )}
        </div>

        {/* Instructions */}
        <div
          style={{
            fontSize: '12px',
            color: '#888',
            textAlign: 'center',
            marginTop: '20px',
            marginBottom: '16px'
          }}
        >
          Use WASD or Arrow Keys to navigate. Avoid red ICE nodes. Reach the green target.
        </div>

        {/* Exit button */}
        {!gameOver && onCancel && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCancel}
            style={{
              width: '100%',
              padding: '10px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid #888',
              borderRadius: '8px',
              color: '#ccc',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginBottom: '12px'
            }}
          >
            CANCEL (ESC)
          </motion.button>
        )}

        {gameOver && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: movesRemaining > 0 ? '#00FF88' : '#FF3366',
              textAlign: 'center',
              marginTop: '16px'
            }}
          >
            {movesRemaining > 0 ? 'HACK SUCCESSFUL!' : 'HACK FAILED - Out of moves'}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default HackingMinigame

