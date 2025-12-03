// Audio system for game sounds
class AudioSystem {
  constructor() {
    this.sounds = {}
    this.masterVolume = 0.7
    this.enabled = true
  }
  
  // Create audio context for web audio API sounds
  init() {
    if (typeof window !== 'undefined' && window.AudioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    }
  }
  
  // Play a simple beep tone
  playTone(frequency, duration, type = 'sine') {
    if (!this.enabled || !this.audioContext) return
    
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    
    oscillator.frequency.value = frequency
    oscillator.type = type
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.3, this.audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)
    
    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + duration)
  }
  
  playCallSpawn() {
    this.playTone(800, 0.2, 'sine')
    setTimeout(() => this.playTone(1000, 0.15, 'sine'), 100)
  }
  
  playCallCountdown() {
    this.playTone(600, 0.1, 'square')
  }
  
  playHeroSelect() {
    this.playTone(400, 0.1, 'sine')
  }
  
  playDispatch() {
    // Whoosh sound - descending tone
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.playTone(800 - i * 100, 0.1, 'sawtooth')
      }, i * 30)
    }
  }
  
  playSuccess() {
    // Victory fanfare - ascending tones
    const notes = [523, 659, 784, 1047] // C, E, G, C
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.3, 'sine')
      }, i * 150)
    })
  }
  
  playFailure() {
    // Disappointed buzz - low descending tone
    this.playTone(200, 0.5, 'sawtooth')
    setTimeout(() => this.playTone(150, 0.3, 'sawtooth'), 300)
  }
  
  playMissionSelect() {
    this.playTone(500, 0.15, 'sine')
  }
  
  playRadioPing() {
    this.playTone(1000, 0.05, 'square')
  }
  
  playError() {
    this.playTone(300, 0.2, 'square')
    setTimeout(() => this.playTone(200, 0.2, 'square'), 100)
  }
  
  setVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume))
  }
  
  setEnabled(enabled) {
    this.enabled = enabled
  }
}

// Singleton instance
let audioSystemInstance = null

export function getAudioSystem() {
  if (!audioSystemInstance) {
    audioSystemInstance = new AudioSystem()
    if (typeof window !== 'undefined') {
      audioSystemInstance.init()
    }
  }
  return audioSystemInstance
}

