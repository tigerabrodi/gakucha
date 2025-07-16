import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Target,
  Timer,
} from 'lucide-react'
import { useWorkout } from '../providers/WorkoutContext'

type BreakOption = {
  label: string
  duration: number // in seconds
}

const breakOptions: Array<BreakOption> = [
  { label: 'Quick', duration: 30 },
  { label: 'Normal', duration: 60 },
  { label: 'Long', duration: 90 },
  { label: 'Extended', duration: 120 },
]

export function WorkoutTimer() {
  const {
    state,
    formatTime,
    startBreak,
    toggleMode,
    togglePlayPause,
    reset,
    adjustTimerDuration,
    adjustTargetSets,
  } = useWorkout()

  const handleBreakSelected = ({ duration }: { duration: number }) => {
    startBreak({ duration })
  }

  const getSetsDisplay = () => {
    if (state.mode === 'timer') {
      return state.currentSets.toString()
    }
    return `${state.currentSets} / ${state.targetSets}`
  }

  const getSetsLabel = () => {
    return state.mode === 'timer' ? 'Sets Completed' : 'Sets Remaining'
  }

  const isWorkoutComplete = () => {
    if (state.mode === 'timer') {
      return state.currentTime === 0
    }
    return state.currentSets === 0
  }

  return (
    <div className="bg-background mx-auto flex min-h-screen max-w-md flex-col gap-4 p-3">
      {/* Header - Compact for mobile */}
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-foreground text-xl font-bold">Workout</h1>

        {/* Mode Toggle - Mobile optimized */}
        <div className="flex gap-2">
          <Button
            variant={state.mode === 'timer' ? 'default' : 'outline'}
            size="sm"
            onClick={toggleMode}
            className="flex items-center gap-2"
            disabled={state.isRunning || state.isOnBreak}
          >
            <Timer className="h-4 w-4" />
            Timer
          </Button>
          <Button
            variant={state.mode === 'sets' ? 'default' : 'outline'}
            size="sm"
            onClick={toggleMode}
            className="flex items-center gap-2"
            disabled={state.isRunning || state.isOnBreak}
          >
            <Target className="h-4 w-4" />
            Sets
          </Button>
        </div>
      </div>

      {/* Main Display - Mobile friendly */}
      <Card
        className={`bg-card border-border transition-all duration-200 ${
          state.isOnBreak ? 'ring-accent ring-2' : ''
        }`}
      >
        <CardContent className="p-4 text-center">
          {/* Timer Display - Only in timer mode */}
          {state.mode === 'timer' && (
            <div className="mb-6">
              <div
                className={`mb-2 font-mono text-5xl font-bold transition-colors duration-200 sm:text-6xl ${
                  isWorkoutComplete() ? 'text-primary' : 'text-foreground'
                }`}
              >
                {formatTime({ seconds: state.currentTime })}
              </div>
              <Badge variant="secondary" className="text-sm">
                Workout Timer
              </Badge>
            </div>
          )}

          {/* Break Timer - Shows on top when active */}
          {state.isOnBreak && (
            <div className="bg-primary/10 border-primary/20 mb-6 rounded-lg border p-4">
              <div className="text-primary mb-2 text-4xl font-bold">
                {formatTime({ seconds: state.breakTime })}
              </div>
              <Badge
                variant="default"
                className="bg-primary text-primary-foreground"
              >
                Break Time
              </Badge>
            </div>
          )}

          {/* Set Counter */}
          <div className="mb-6">
            <div
              className={`mb-2 text-2xl font-bold transition-colors duration-200 sm:text-3xl ${
                isWorkoutComplete() ? 'text-primary' : 'text-primary'
              }`}
            >
              {getSetsDisplay()}
            </div>
            <Badge variant="outline" className="text-xs">
              {getSetsLabel()}
            </Badge>
          </div>

          {/* Workout Complete Message */}
          {isWorkoutComplete() && (
            <div className="bg-primary/10 border-primary/20 mb-6 rounded-lg border p-4">
              <div className="text-primary mb-2 text-lg font-bold">
                🎉 Workout Complete!
              </div>
              <div className="text-muted-foreground text-sm">
                {state.mode === 'timer'
                  ? `Great job! You completed ${state.currentSets} sets in ${
                      state.timerDuration / 60
                    } minutes.`
                  : `Excellent! You finished all ${state.targetSets} sets.`}
              </div>
            </div>
          )}

          {/* Main Controls - Thumb-friendly spacing */}
          <div className="flex justify-center gap-6">
            <Button
              variant="default"
              size="sm"
              onClick={togglePlayPause}
              className="flex items-center justify-center"
              disabled={state.isOnBreak || isWorkoutComplete()}
            >
              {state.isRunning ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={reset}
              className="flex items-center justify-center"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings Controls */}
      <Card className="bg-card border-border py-2">
        <CardContent className="p-4">
          {state.mode === 'timer' ? (
            <div>
              <h3 className="text-foreground mb-3 text-center text-base font-semibold">
                Timer Duration
              </h3>
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    adjustTimerDuration({
                      minutes: Math.max(1, state.timerDuration / 60 - 5),
                    })
                  }
                  disabled={state.isRunning || state.isOnBreak}
                  className="h-10 w-10"
                >
                  <Minus className="h-4 w-4" />
                </Button>

                <div className="text-center">
                  <div className="text-primary text-2xl font-bold">
                    {state.timerDuration / 60}
                  </div>
                  <div className="text-muted-foreground text-xs">minutes</div>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    adjustTimerDuration({
                      minutes: Math.min(60, state.timerDuration / 60 + 5),
                    })
                  }
                  disabled={state.isRunning || state.isOnBreak}
                  className="h-10 w-10"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-foreground mb-3 text-center text-base font-semibold">
                Target Sets
              </h3>
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    adjustTargetSets({
                      sets: Math.max(1, state.targetSets - 5),
                    })
                  }
                  disabled={state.isRunning || state.isOnBreak}
                  className="h-10 w-10"
                >
                  <Minus className="h-4 w-4" />
                </Button>

                <div className="text-center">
                  <div className="text-primary text-2xl font-bold">
                    {state.targetSets}
                  </div>
                  <div className="text-muted-foreground text-xs">sets</div>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    adjustTargetSets({
                      sets: Math.min(100, state.targetSets + 5),
                    })
                  }
                  disabled={state.isRunning || state.isOnBreak}
                  className="h-10 w-10"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Break Options - Mobile optimized grid */}
      <Card className="bg-card border-border py-2">
        <CardContent className="p-4">
          <h3 className="text-foreground mb-3 text-center text-base font-semibold">
            {state.isOnBreak ? 'Break in Progress...' : 'Break Duration'}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {breakOptions.map((option) => (
              <Button
                key={option.label}
                variant="default"
                onClick={() =>
                  handleBreakSelected({ duration: option.duration })
                }
                className="flex touch-manipulation gap-1"
                disabled={state.isOnBreak || !state.isRunning}
              >
                <span className="text-sm font-bold">{option.label}</span>
                <span className="text-xs opacity-90">{option.duration}s</span>
              </Button>
            ))}
          </div>
          {state.isOnBreak && state.mode === 'timer' && (
            <div className="text-muted-foreground mt-3 text-center text-xs">
              Main timer continues running during break
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
