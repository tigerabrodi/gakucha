import { getNotificationManager } from '@/managers/notificationManager'
import { getSoundEffectManager, SOUND_EFFECTS } from '@/managers/soundEffect'
import type { ReactNode } from 'react'
import { createContext, useContext, useEffect } from 'react'
import { create } from 'zustand'

const ONE_SECOND_IN_MS = 1000

export type WorkoutMode = 'timer' | 'sets'

export type WorkoutState = {
  // Mode and configuration
  mode: WorkoutMode
  targetSets: number
  timerDuration: number // in seconds

  // Main timer/stopwatch
  currentTime: number // in seconds
  isRunning: boolean

  // Set tracking
  currentSets: number

  // Break timer
  breakTime: number // in seconds
  isOnBreak: boolean
  breakDuration: number
}

type WorkoutStore = WorkoutState & {
  // Actions
  setMode: (mode: WorkoutMode) => void
  startStop: () => void
  reset: () => void
  tick: () => void
  startBreak: (duration: number) => void
  breakTick: () => void
  endBreak: () => void
  setTargetSets: (sets: number) => void
  setTimerDuration: (seconds: number) => void
}

const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  // Initial state
  mode: 'timer',
  targetSets: 30,
  timerDuration: 20 * 60, // 20 minutes
  currentTime: 20 * 60,
  isRunning: false,
  currentSets: 0,
  breakTime: 0,
  isOnBreak: false,
  breakDuration: 0,

  // Actions
  setMode: (mode) => {
    set((state) => ({
      mode,
      currentSets: mode === 'timer' ? 0 : state.targetSets,
      currentTime: mode === 'timer' ? state.timerDuration : 0,
      isRunning: false,
    }))
  },

  startStop: () => {
    set((state) => ({
      isRunning: !state.isRunning,
    }))
  },

  reset: () => {
    set((state) => ({
      isRunning: false,
      currentTime: state.mode === 'timer' ? state.timerDuration : 0,
      currentSets: state.mode === 'timer' ? 0 : state.targetSets,
      isOnBreak: false,
      breakTime: 0,
      breakDuration: 0,
    }))
  },

  tick: () => {
    const state = get()
    if (!state.isRunning) return

    if (state.mode === 'timer') {
      // Countdown timer - continues running even during breaks
      const newTime = Math.max(0, state.currentTime - 1)
      set({
        currentTime: newTime,
        isRunning: newTime > 0, // Auto-stop when timer reaches 0
      })
    } else {
      // Stopwatch for sets mode - only runs when not on break
      if (state.isOnBreak) return
      set({
        currentTime: state.currentTime + 1,
      })
    }
  },

  startBreak: (duration) => {
    set((state) => ({
      isOnBreak: true,
      breakTime: duration,
      breakDuration: duration,
      // Update sets based on mode
      currentSets:
        state.mode === 'timer'
          ? state.currentSets + 1
          : Math.max(0, state.currentSets - 1),
      // Reset set timer in sets mode
      currentTime: state.mode === 'sets' ? 0 : state.currentTime,
    }))
  },

  breakTick: () => {
    const state = get()
    if (!state.isOnBreak) return

    const newBreakTime = Math.max(0, state.breakTime - 1)

    if (newBreakTime === 0) {
      // Break finished - play sound effect and send notification
      try {
        getSoundEffectManager().play({ type: SOUND_EFFECTS.BREAK_FINISHED })
        getNotificationManager()
          .sendBreakFinishedNotification()
          .catch((error) => {
            console.error('Failed to send break finished notification:', error)
          })
      } catch (error) {
        console.error(
          'Failed to play break finished sound or send notification:',
          error
        )
      }

      set({
        isOnBreak: false,
        breakTime: 0,
        breakDuration: 0,
      })
    } else {
      set({
        breakTime: newBreakTime,
      })
    }
  },

  endBreak: () => {
    set({
      isOnBreak: false,
      breakTime: 0,
      breakDuration: 0,
    })
  },

  setTargetSets: (sets) => {
    set((state) => ({
      targetSets: sets,
      currentSets: state.mode === 'sets' ? sets : state.currentSets,
    }))
  },

  setTimerDuration: (seconds) => {
    set((state) => ({
      timerDuration: seconds,
      currentTime: state.mode === 'timer' ? seconds : state.currentTime,
    }))
  },
}))

type WorkoutContextType = {
  state: WorkoutState
  // Helper functions
  formatTime: ({ seconds }: { seconds: number }) => string
  startBreak: ({ duration }: { duration: number }) => void
  toggleMode: () => void
  togglePlayPause: () => void
  reset: () => void
  adjustTimerDuration: ({ minutes }: { minutes: number }) => void
  adjustTargetSets: ({ sets }: { sets: number }) => void
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined)

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const store = useWorkoutStore()

  // Main timer effect
  useEffect(() => {
    if (store.isRunning || store.isOnBreak) {
      const interval = setInterval(() => {
        // Run break timer if on break
        if (store.isOnBreak) {
          store.breakTick()
        }

        // Run main timer if running (and not on break in sets mode)
        if (store.isRunning && (store.mode === 'timer' || !store.isOnBreak)) {
          store.tick()
        }
      }, ONE_SECOND_IN_MS)

      return () => clearInterval(interval)
    }
  }, [store.isRunning, store.isOnBreak, store.breakTick, store.tick, store])

  const formatTime = ({ seconds }: { seconds: number }) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`
  }

  const startBreak = ({ duration }: { duration: number }) => {
    store.startBreak(duration)
  }

  const toggleMode = () => {
    const newMode: WorkoutMode = store.mode === 'timer' ? 'sets' : 'timer'
    store.setMode(newMode)
  }

  const togglePlayPause = () => {
    store.startStop()
  }

  const reset = () => {
    store.reset()
  }

  const adjustTimerDuration = ({ minutes }: { minutes: number }) => {
    const seconds = minutes * 60
    store.setTimerDuration(seconds)
  }

  const adjustTargetSets = ({ sets }: { sets: number }) => {
    store.setTargetSets(sets)
  }

  const value: WorkoutContextType = {
    state: {
      mode: store.mode,
      targetSets: store.targetSets,
      timerDuration: store.timerDuration,
      currentTime: store.currentTime,
      isRunning: store.isRunning,
      currentSets: store.currentSets,
      breakTime: store.breakTime,
      isOnBreak: store.isOnBreak,
      breakDuration: store.breakDuration,
    },
    formatTime,
    startBreak,
    toggleMode,
    togglePlayPause,
    reset,
    adjustTimerDuration,
    adjustTargetSets,
  }

  return (
    <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>
  )
}

export function useWorkout() {
  const context = useContext(WorkoutContext)

  if (context === undefined) {
    throw new Error('useWorkout must be used within a WorkoutProvider')
  }

  return context
}
