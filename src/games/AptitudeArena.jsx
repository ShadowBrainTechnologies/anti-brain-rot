import QuizGame from '../components/QuizGame.jsx'
import { generateQuestion } from './AptitudeArena.logic.js'
import './AptitudeArena.css'

export default function AptitudeArena() {
  return (
    <QuizGame
      gameId="aptitude-arena"
      title="Aptitude Arena"
      instructions="Solve 10 aptitude word problems — trains, work, percentages, interest and more."
      generate={generateQuestion}
    />
  )
}
