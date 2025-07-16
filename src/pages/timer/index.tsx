import { WorkoutTimer } from './components/WorkoutTimer'
import { WorkoutProvider } from './providers/WorkoutContext'

export function TimerPage() {
  return (
    <WorkoutProvider>
      <WorkoutTimer />
    </WorkoutProvider>
  )
}
