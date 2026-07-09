import QuizGame from '../components/QuizGame.jsx'
import { generateQuestion } from './Sequences.logic.js'
import './Sequences.css'

export default function Sequences() {
  return (
    <QuizGame
      gameId="sequences"
      title="Sequences & Patterns"
      instructions="Find the hidden rule — number and letter series, analogies, and odd-one-out."
      generate={generateQuestion}
      promptClass="quiz__prompt--mono"
    />
  )
}
