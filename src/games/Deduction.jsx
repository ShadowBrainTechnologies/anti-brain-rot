import QuizGame from '../components/QuizGame.jsx'
import { generateQuestion } from './Deduction.logic.js'
import './Deduction.css'

export default function Deduction() {
  return (
    <QuizGame
      gameId="deduction"
      title="Deduction"
      instructions="Read carefully and deduce — blood relations, directions, syllogisms, and argument analysis."
      generate={generateQuestion}
    />
  )
}
