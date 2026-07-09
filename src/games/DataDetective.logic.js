import { buildChoices, pick, randInt, shuffle } from '../lib/quiz.js'

const CHART_TYPES = ['table', 'bar', 'pie', 'line']
const QUESTION_KINDS = ['highest', 'lowest', 'difference', 'ratio', 'average', 'total']

const CATEGORY_THEMES = [
  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  ['Q1', 'Q2', 'Q3', 'Q4'],
  ['North', 'South', 'East', 'West', 'Central'],
  ['A', 'B', 'C', 'D', 'E', 'F'],
  ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig'],
]

const SERIES_NAMES = ['Sales', 'Profit', 'Visitors', 'Revenue', 'Units', 'Downloads']

function makeCategories(rng, count) {
  const theme = pick(rng, CATEGORY_THEMES)
  return shuffle(rng, theme).slice(0, count)
}

function makeSeries(rng, name, count) {
  return {
    name,
    values: Array.from({ length: count }, () => randInt(rng, 2, 20)),
  }
}

function ensureIntegerAverage(values) {
  const sum = values.reduce((s, v) => s + v, 0)
  const rem = sum % values.length
  if (rem !== 0) {
    values[values.length - 1] += values.length - rem
  }
}

function ensureIntegerRatio(values, i, j, rng) {
  let a = values[i]
  let b = values[j]
  if (a === b) {
    values[i] = a * 2
    return
  }
  if (a > b) {
    if (a % b !== 0) values[i] = b * randInt(rng, 2, 4)
  } else {
    if (b % a !== 0) values[j] = a * randInt(rng, 2, 4)
  }
}

function ensureUniqueExtreme(values, index, kind) {
  if (kind === 'highest') {
    const max = Math.max(...values)
    values[index] = max + 1
  } else {
    const min = Math.min(...values)
    values[index] = Math.max(1, min - 1)
  }
}

function pairDifferences(values) {
  const out = []
  for (let i = 0; i < values.length; i++) {
    for (let j = i + 1; j < values.length; j++) {
      out.push(Math.abs(values[i] - values[j]))
    }
  }
  return out
}

function pairRatios(values) {
  const out = []
  for (let i = 0; i < values.length; i++) {
    for (let j = i + 1; j < values.length; j++) {
      const a = values[i]
      const b = values[j]
      if (a > b && a % b === 0) out.push(a / b)
      if (b > a && b % a === 0) out.push(b / a)
    }
  }
  return out
}

function addPerturbations(answer, pool) {
  for (let delta = 1; delta <= 6; delta++) {
    pool.push(answer + delta)
    if (answer - delta > 0) pool.push(answer - delta)
  }
}

function makeDistractors(kind, chart, seriesIndex, answer) {
  const series = chart.series[seriesIndex]
  const values = series.values
  const pool = []

  switch (kind) {
    case 'highest':
    case 'lowest':
      for (const cat of chart.categories) pool.push(cat)
      break
    case 'difference': {
      pool.push(...pairDifferences(values))
      for (let i = 0; i < chart.series.length; i++) {
        if (i === seriesIndex) continue
        pool.push(...pairDifferences(chart.series[i].values))
      }
      for (const v of values) pool.push(v)
      addPerturbations(answer, pool)
      break
    }
    case 'ratio': {
      pool.push(...pairRatios(values))
      pool.push(...pairDifferences(values))
      for (const v of values) pool.push(v)
      addPerturbations(answer, pool)
      break
    }
    case 'average': {
      pool.push(values.reduce((s, v) => s + v, 0))
      pool.push(Math.max(...values))
      pool.push(Math.min(...values))
      for (let i = 0; i < chart.series.length; i++) {
        if (i === seriesIndex) continue
        const s = chart.series[i]
        pool.push(s.values.reduce((a, b) => a + b, 0) / s.values.length)
      }
      addPerturbations(answer, pool)
      break
    }
    case 'total': {
      pool.push(values.reduce((s, v) => s + v, 0) / values.length)
      pool.push(Math.max(...values))
      pool.push(Math.min(...values))
      for (let i = 0; i < chart.series.length; i++) {
        if (i === seriesIndex) continue
        const s = chart.series[i]
        pool.push(s.values.reduce((a, b) => a + b, 0))
      }
      addPerturbations(answer, pool)
      break
    }
  }

  return pool
}

function makePrompt(kind, chart, seriesIndex, indices) {
  const series = chart.series[seriesIndex]
  const name = series.name.toLowerCase()
  const cats = chart.categories

  switch (kind) {
    case 'highest':
      return `Which category had the highest ${name}?`
    case 'lowest':
      return `Which category had the lowest ${name}?`
    case 'difference':
      return `What is the difference in ${name} between ${cats[indices[0]]} and ${cats[indices[1]]}?`
    case 'ratio':
      return `How many times larger is ${cats[indices[0]]}'s ${name} than ${cats[indices[1]]}'s?`
    case 'average':
      return `What is the average ${name} across all categories?`
    case 'total':
      return `What is the total ${name} across all categories?`
    default:
      return ''
  }
}

function makeExplanation(kind, chart, seriesIndex, indices, answer) {
  const series = chart.series[seriesIndex]
  const cats = chart.categories

  switch (kind) {
    case 'highest':
      return `${answer} had the highest ${series.name.toLowerCase()}.`
    case 'lowest':
      return `${answer} had the lowest ${series.name.toLowerCase()}.`
    case 'difference':
      return `${cats[indices[0]]} = ${series.values[indices[0]]}, ${cats[indices[1]]} = ${series.values[indices[1]]}; difference = ${answer}.`
    case 'ratio':
      return `${cats[indices[0]]} = ${series.values[indices[0]]}, ${cats[indices[1]]} = ${series.values[indices[1]]}; ratio = ${answer}.`
    case 'average': {
      const sum = series.values.reduce((s, v) => s + v, 0)
      return `Sum = ${sum}, count = ${series.values.length}; average = ${answer}.`
    }
    case 'total':
      return `Total = ${series.values.join(' + ')} = ${answer}.`
    default:
      return ''
  }
}

export function computeAnswer(question) {
  const { kind, chart, seriesIndex = 0, indices } = question
  const series = chart.series[seriesIndex]
  const values = series.values
  const cats = chart.categories

  switch (kind) {
    case 'highest': {
      let best = 0
      for (let i = 1; i < values.length; i++) {
        if (values[i] > values[best]) best = i
      }
      return cats[best]
    }
    case 'lowest': {
      let best = 0
      for (let i = 1; i < values.length; i++) {
        if (values[i] < values[best]) best = i
      }
      return cats[best]
    }
    case 'difference':
      return Math.abs(values[indices[0]] - values[indices[1]])
    case 'ratio':
      return Math.max(values[indices[0]], values[indices[1]]) / Math.min(values[indices[0]], values[indices[1]])
    case 'average':
      return values.reduce((s, v) => s + v, 0) / values.length
    case 'total':
      return values.reduce((s, v) => s + v, 0)
    default:
      return 0
  }
}

export function generateQuestion(rng) {
  const chartType = pick(rng, CHART_TYPES)
  const kind = pick(rng, QUESTION_KINDS)

  const categoryCount = kind === 'highest' || kind === 'lowest'
    ? randInt(rng, 4, 6)
    : randInt(rng, 2, 6)

  const categories = makeCategories(rng, categoryCount)
  const seriesCount = chartType === 'pie' ? 1 : randInt(rng, 1, 2)
  const seriesNames = shuffle(rng, SERIES_NAMES).slice(0, seriesCount)
  const series = seriesNames.map((name) => makeSeries(rng, name, categoryCount))
  const seriesIndex = randInt(rng, 0, seriesCount - 1)
  const target = series[seriesIndex]

  let indices = null

  if (kind === 'average') {
    ensureIntegerAverage(target.values)
  }

  if (kind === 'difference' || kind === 'ratio') {
    const i = randInt(rng, 0, categoryCount - 1)
    let j = randInt(rng, 0, categoryCount - 2)
    if (j >= i) j++
    indices = [i, j]

    if (kind === 'ratio') {
      ensureIntegerRatio(target.values, i, j, rng)
      if (target.values[i] < target.values[j]) indices = [j, i]
    }
  }

  if (kind === 'highest' || kind === 'lowest') {
    const answerIndex = randInt(rng, 0, categoryCount - 1)
    indices = [answerIndex]
    ensureUniqueExtreme(target.values, answerIndex, kind)
  }

  const chart = {
    type: chartType,
    title: `${target.name} by Category`,
    categories,
    series,
  }

  const question = { kind, seriesIndex, indices, chart }
  const answer = computeAnswer(question)
  const distractors = makeDistractors(kind, chart, seriesIndex, answer)
  const { options, correctIndex } = buildChoices(rng, answer, distractors, 4)

  return {
    prompt: makePrompt(kind, chart, seriesIndex, indices),
    options,
    correctIndex,
    explanation: makeExplanation(kind, chart, seriesIndex, indices, answer),
    topic: 'Data Interpretation',
    chart,
    kind,
    seriesIndex,
    indices,
  }
}
