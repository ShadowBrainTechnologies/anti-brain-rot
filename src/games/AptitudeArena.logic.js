import { randInt, pick, buildChoices } from '../lib/quiz.js'

function gcd(a, b) {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) {
    const t = b
    b = a % b
    a = t
  }
  return a
}

function baseDistractors(answer) {
  return [answer + 1, answer + 2, answer + 3, answer * 2]
}

function trains(rng) {
  const time = randInt(rng, 3, 15)
  const speedFactor = 18 / gcd(time, 18)
  const speed = randInt(rng, 3, 20) * speedFactor
  const length = (speed * time * 5) / 18
  const prompt = `A train running at ${speed} km/h crosses a pole in ${time} seconds. What is the length of the train (in metres)?`
  const explanation = `Length = speed × time = (${speed} × 5/18) m/s × ${time} s = ${length} m`
  const distractors = [speed * time, length + speed, ...baseDistractors(length)]
  const { options, correctIndex } = buildChoices(rng, length, distractors)
  return { question: { prompt, options, correctIndex, explanation, topic: 'Problems on Trains' }, answer: length }
}

function timeDistance(rng) {
  const time = randInt(rng, 2, 8)
  const speed = randInt(rng, 20, 80)
  const distance = speed * time
  const prompt = `A car travels at a uniform speed of ${speed} km/h. How far will it travel in ${time} hours?`
  const explanation = `Distance = speed × time = ${speed} × ${time} = ${distance} km`
  const distractors = [speed + time, Math.abs(speed - time), ...baseDistractors(distance)]
  const { options, correctIndex } = buildChoices(rng, distance, distractors)
  return { question: { prompt, options, correctIndex, explanation, topic: 'Time & Distance' }, answer: distance }
}

function timeWork(rng) {
  let x
  let y
  let together
  do {
    x = randInt(rng, 2, 20)
    y = randInt(rng, 2, 20)
    together = (x * y) / (x + y)
  } while (!Number.isInteger(together) || together <= 0 || together === x || together === y)
  const prompt = `A can complete a work in ${x} days and B can complete the same work in ${y} days. How many days will they take working together?`
  const explanation = `One day's work together = 1/${x} + 1/${y} = ${x + y}/${x * y}; days needed = ${together}`
  const distractors = [x + y, Math.max(x, y), Math.abs(x - y), ...baseDistractors(together)]
  const { options, correctIndex } = buildChoices(rng, together, distractors)
  return { question: { prompt, options, correctIndex, explanation, topic: 'Time & Work' }, answer: together }
}

function percentage(rng) {
  const p = pick(rng, [10, 20, 25, 30, 40, 50, 60, 75])
  const n = randInt(rng, 2, 40) * (100 / gcd(p, 100))
  const answer = (n * p) / 100
  const prompt = `What is ${p}% of ${n}?`
  const explanation = `${p}% of ${n} = ${n} × ${p}/100 = ${answer}`
  const distractors = [n + p, Math.abs(n - p), ...baseDistractors(answer)]
  const { options, correctIndex } = buildChoices(rng, answer, distractors)
  return { question: { prompt, options, correctIndex, explanation, topic: 'Percentage' }, answer }
}

function profitLoss(rng) {
  const p = pick(rng, [10, 20, 25, 50])
  const cp = randInt(rng, 2, 50) * (100 / gcd(100 + p, 100))
  const sp = (cp * (100 + p)) / 100
  const profit = sp - cp
  const prompt = `An article is bought for Rs. ${cp} and sold at a profit of ${p}%. What is the selling price?`
  const explanation = `Profit = ${cp} × ${p}/100 = ${profit}; SP = CP + profit = Rs. ${sp}`
  const distractors = [profit, cp + p, cp - profit, ...baseDistractors(sp)]
  const { options, correctIndex } = buildChoices(rng, sp, distractors)
  return { question: { prompt, options, correctIndex, explanation, topic: 'Profit & Loss' }, answer: sp }
}

function simpleInterest(rng) {
  const r = randInt(rng, 2, 15)
  const t = randInt(rng, 2, 10)
  const p = randInt(rng, 5, 100) * (100 / gcd(r, 100))
  const si = (p * r * t) / 100
  const prompt = `Find the simple interest on Rs. ${p} at ${r}% per annum for ${t} years.`
  const explanation = `SI = P×R×T/100 = ${p}×${r}×${t}/100 = Rs. ${si}`
  const distractors = [(p * r) / 100, p + r + t, ...baseDistractors(si)]
  const { options, correctIndex } = buildChoices(rng, si, distractors)
  return { question: { prompt, options, correctIndex, explanation, topic: 'Simple Interest' }, answer: si }
}

function average(rng) {
  const count = randInt(rng, 3, 12)
  const avg = randInt(rng, 10, 80)
  const total = count * avg
  const prompt = `The average of ${count} numbers is ${avg}. What is their total?`
  const explanation = `Total = average × count = ${avg} × ${count} = ${total}`
  const distractors = [avg + count, Math.abs(avg - count), ...baseDistractors(total)]
  const { options, correctIndex } = buildChoices(rng, total, distractors)
  return { question: { prompt, options, correctIndex, explanation, topic: 'Average' }, answer: total }
}

function ages(rng) {
  const ratioA = randInt(rng, 2, 8)
  let ratioB
  do {
    ratioB = randInt(rng, 2, 8)
  } while (ratioB === ratioA)
  const years = randInt(rng, 5, 20)
  const aNow = randInt(rng, 2, 15) * ratioA
  const k = aNow + years
  const bNow = (aNow / ratioA) * ratioB
  const prompt = `The ratio of present ages of A and B is ${ratioA}:${ratioB}. After ${years} years, A will be ${k} years old. What is B's present age?`
  const explanation = `A's present age = ${k} − ${years} = ${aNow}; B's age = ${aNow} × ${ratioB}/${ratioA} = ${bNow}`
  const distractors = baseDistractors(bNow)
  const { options, correctIndex } = buildChoices(rng, bNow, distractors)
  return { question: { prompt, options, correctIndex, explanation, topic: 'Problems on Ages' }, answer: bNow }
}

function ratioProportion(rng) {
  const a = randInt(rng, 2, 8)
  let b
  do {
    b = randInt(rng, 2, 8)
  } while (b === a)
  const total = randInt(rng, 10, 80) * (a + b)
  const larger = Math.max(a, b)
  const share = (total * larger) / (a + b)
  const prompt = `Divide Rs. ${total} between A and B in the ratio ${a}:${b}. What is the larger share?`
  const explanation = `Larger ratio part = ${larger}; share = ${total} × ${larger}/(${a}+${b}) = Rs. ${share}`
  const distractors = [total - share, Math.abs(share - a - b), ...baseDistractors(share)]
  const { options, correctIndex } = buildChoices(rng, share, distractors)
  return { question: { prompt, options, correctIndex, explanation, topic: 'Ratio & Proportion' }, answer: share }
}

function boatsStreams(rng) {
  const stream = randInt(rng, 2, 8)
  const boat = randInt(rng, stream + 1, 25)
  const direction = pick(rng, ['upstream', 'downstream'])
  const speed = direction === 'upstream' ? boat - stream : boat + stream
  const distance = randInt(rng, 2, 20) * speed
  const time = distance / speed
  const otherSpeed = direction === 'upstream' ? boat + stream : boat - stream
  const prompt = `A boat's speed in still water is ${boat} km/h and the stream flows at ${stream} km/h. How many hours will it take to travel ${distance} km ${direction}?`
  const explanation = `${direction} speed = ${boat} ${direction === 'upstream' ? '−' : '+'} ${stream} = ${speed} km/h; time = ${distance}/${speed} = ${time} hours`
  const distractors = [Math.floor(distance / boat), Math.floor(distance / stream), Math.floor(distance / otherSpeed), time + stream, ...baseDistractors(time)]
  const { options, correctIndex } = buildChoices(rng, time, distractors)
  return { question: { prompt, options, correctIndex, explanation, topic: 'Boats & Streams' }, answer: time }
}

export const TOPIC_GENERATORS = [
  trains,
  timeDistance,
  timeWork,
  percentage,
  profitLoss,
  simpleInterest,
  average,
  ages,
  ratioProportion,
  boatsStreams,
]

export function generateQuestion(rng) {
  return pick(rng, TOPIC_GENERATORS)(rng).question
}
