import { buildChoices, pick, shuffle, randInt } from '../lib/quiz.js'

// --- shared helpers ---------------------------------------------------------

function makeSyllogismOptions(rng, answerKey) {
  const labels = [
    { label: 'Only I follows', correct: answerKey === 'only1' },
    { label: 'Only II follows', correct: answerKey === 'only2' },
    { label: 'Both I and II follow', correct: answerKey === 'both' },
    { label: 'Neither I nor II follows', correct: answerKey === 'neither' },
  ]
  const shuffled = shuffle(rng, labels)
  return {
    options: shuffled.map((o) => o.label),
    correctIndex: shuffled.findIndex((o) => o.correct),
  }
}

// --- procedural families ----------------------------------------------------

function generateBloodRelation(rng) {
  const variant = randInt(rng, 0, 1)
  const rel1Pool = variant === 0 ? ['father', 'mother'] : ['son', 'daughter']
  // variant 0 walks UP the tree (A→grandparent), variant 1 walks DOWN (A→grandchild),
  // so rel2 must match the direction: "B is C's son" gives A (B's son) as C's grandson.
  const rel2Pool = variant === 0 ? ['father', 'mother'] : ['son', 'daughter']
  const rel1 = pick(rng, rel1Pool)
  const rel2 = pick(rng, rel2Pool)

  let answer
  let distractors
  if (variant === 0) {
    answer = rel1 === 'father' ? 'grandfather' : 'grandmother'
    distractors = [
      answer === 'grandfather' ? 'grandmother' : 'grandfather',
      'father',
      'uncle',
      'aunt',
    ]
  } else {
    answer = rel1 === 'son' ? 'grandson' : 'granddaughter'
    distractors = [
      answer === 'grandson' ? 'granddaughter' : 'grandson',
      'son',
      'nephew',
      'niece',
    ]
  }

  const { options, correctIndex } = buildChoices(rng, answer, distractors, 4)
  const prompt =
    'Statements:\n' +
    `A is B's ${rel1}.\n` +
    `B is C's ${rel2}.\n\n` +
    'Conclusion:\n' +
    'A is C\'s ___'

  return {
    prompt,
    options,
    correctIndex,
    explanation: `A is the ${rel1} of B, and B is the ${rel2} of C, so A is C's ${answer}.`,
    topic: 'Blood Relations',
  }
}

function generateDirectionSense(rng) {
  const directions = ['North', 'East', 'South', 'West']
  const deltas = { North: [0, 1], East: [1, 0], South: [0, -1], West: [-1, 0] }
  const allDirections = [
    'North',
    'South',
    'East',
    'West',
    'North-East',
    'North-West',
    'South-East',
    'South-West',
  ]

  let dx = 0
  let dy = 0
  let steps = []
  let attempts = 0

  while ((dx === 0 || dy === 0) && attempts < 100) {
    steps = []
    dx = 0
    dy = 0
    const count = randInt(rng, 3, 4)
    for (let i = 0; i < count; i++) {
      const dir = pick(rng, directions)
      const dist = randInt(rng, 1, 9)
      steps.push(`${dist} km ${dir}`)
      const [ix, iy] = deltas[dir]
      dx += ix * dist
      dy += iy * dist
    }
    attempts++
  }

  let answer
  if (dx > 0 && dy > 0) answer = 'North-East'
  else if (dx > 0 && dy < 0) answer = 'South-East'
  else if (dx < 0 && dy > 0) answer = 'North-West'
  else if (dx < 0 && dy < 0) answer = 'South-West'
  else if (dx > 0) answer = 'East'
  else if (dx < 0) answer = 'West'
  else if (dy > 0) answer = 'North'
  else answer = 'South'

  const { options, correctIndex } = buildChoices(
    rng,
    answer,
    allDirections.filter((d) => d !== answer),
    4,
  )

  const ew = Math.abs(dx)
  const ns = Math.abs(dy)
  const horizontal = dx === 0 ? '' : `${ew} km ${dx > 0 ? 'east' : 'west'}`
  const vertical = dy === 0 ? '' : `${ns} km ${dy > 0 ? 'north' : 'south'}`
  const netText =
    horizontal && vertical ? `${vertical} and ${horizontal}` : horizontal || vertical

  return {
    prompt:
      'A person starts from point O and walks:\n' +
      steps.join('\n') +
      '\n\nWhich direction are they from the starting point?',
    options,
    correctIndex,
    explanation: `The net movement is ${netText}, so they are to the ${answer.toLowerCase()}.`,
    topic: 'Direction Sense',
  }
}

function generateSyllogism(rng) {
  const pools = [
    ['apples', 'fruits', 'sweet things'],
    ['roses', 'flowers', 'beautiful things'],
    ['tigers', 'animals', 'wild creatures'],
    ['cars', 'vehicles', 'machines'],
    ['doctors', 'professionals', 'graduates'],
    ['squares', 'rectangles', 'parallelograms'],
  ]
  const [a, b, c] = pick(rng, pools)
  const templates = [
    {
      statements: [`All ${a} are ${b}.`, `All ${b} are ${c}.`],
      conclusions: [`All ${a} are ${c}.`, `All ${c} are ${a}.`],
      answer: 'only1',
      explanation: `Since every ${a} is a ${b} and every ${b} is a ${c}, every ${a} must be a ${c}. The reverse does not follow.`,
    },
    {
      statements: [`No ${a} is ${b}.`, `All ${b} are ${c}.`],
      conclusions: [`No ${a} is ${c}.`, `Some ${c} are not ${a}.`],
      answer: 'only2',
      explanation: `Because no ${a} is ${b} and all ${b} are ${c}, at least those ${b} that are ${c} are not ${a}. The first conclusion is too strong.`,
    },
    {
      statements: [`Some ${a} are ${b}.`, `All ${b} are ${c}.`],
      conclusions: [`Some ${a} are ${c}.`, `All ${a} are ${c}.`],
      answer: 'only1',
      explanation: `The ${a} that are ${b} must also be ${c}, so some ${a} are ${c}; the second conclusion overgeneralises.`,
    },
    {
      statements: [`All ${a} are ${b}.`, `No ${b} is ${c}.`],
      conclusions: [`No ${a} is ${c}.`, `All ${a} are ${c}.`],
      answer: 'only1',
      explanation: `Every ${a} is a ${b}, and no ${b} is ${c}, so no ${a} can be ${c}. The second conclusion contradicts the statements.`,
    },
    {
      statements: [`All ${a} are ${b}.`, `Some ${b} are ${c}.`],
      conclusions: [`Some ${a} are ${c}.`, `All ${c} are ${b}.`],
      answer: 'neither',
      explanation: `The ${a} could be entirely outside the ${c} group, and the ${c} need not all be ${b}. Neither conclusion follows.`,
    },
    {
      statements: [`Some ${a} are ${b}.`, `Some ${b} are ${c}.`],
      conclusions: [`Some ${a} are ${c}.`, `No ${a} is ${c}.`],
      answer: 'neither',
      explanation: `The ${a} that are ${b} and the ${b} that are ${c} may or may not overlap, so neither conclusion is certain.`,
    },
  ]
  const t = pick(rng, templates)
  const { options, correctIndex } = makeSyllogismOptions(rng, t.answer)
  const prompt =
    'Statements:\n' +
    t.statements.join('\n') +
    '\n\nConclusions:\n' +
    `I. ${t.conclusions[0]}\n` +
    `II. ${t.conclusions[1]}\n\n` +
    'Which conclusions follow?'

  return {
    prompt,
    options,
    correctIndex,
    explanation: t.explanation,
    topic: 'Syllogism',
  }
}

function generateLogicalProblem(rng) {
  const relations = ['taller', 'faster', 'heavier', 'older', 'stronger']
  const relation = pick(rng, relations)
  const names = ['A', 'B', 'C']
  const type = randInt(rng, 0, 1)

  let prompt
  let answer
  if (type === 0) {
    // chain: A > B > C
    const askFirstGreater = randInt(rng, 0, 1) === 0
    prompt =
      'Statements:\n' +
      `${names[0]} is ${relation} than ${names[1]}.\n` +
      `${names[1]} is ${relation} than ${names[2]}.\n\n` +
      'Question:\n' +
      `Is ${askFirstGreater ? names[0] : names[2]} ${relation} than ${askFirstGreater ? names[2] : names[0]}?`
    answer = askFirstGreater ? 'True' : 'False'
  } else {
    // independent: A > B and C > B, relation between A and C uncertain
    prompt =
      'Statements:\n' +
      `${names[0]} is ${relation} than ${names[1]}.\n` +
      `${names[2]} is ${relation} than ${names[1]}.\n\n` +
      'Question:\n' +
      `Is ${names[0]} ${relation} than ${names[2]}?`
    answer = 'Uncertain'
  }

  const { options, correctIndex } = buildChoices(
    rng,
    answer,
    ['True', 'False', 'Uncertain'],
    3,
  )

  const explanation =
    answer === 'Uncertain'
      ? `Both ${names[0]} and ${names[2]} are ${relation} than ${names[1]}, but their relative order is not given.`
      : `The statements form a chain, so the order among ${names[0]}, ${names[1]}, and ${names[2]} is fully known.`

  return {
    prompt,
    options,
    correctIndex,
    explanation,
    topic: 'Logical Problems',
  }
}

// --- static bank ------------------------------------------------------------

export const staticBank = [
  {
    prompt:
      'Statement: The government has decided to ban the use of plastic bags in the city.\n\n' +
      'Assumptions:\n' +
      'I. Plastic bags create environmental problems.\n' +
      'II. People will start using cloth bags.',
    options: [
      'Only I is implicit',
      'Only II is implicit',
      'Both I and II are implicit',
      'Neither I nor II is implicit',
    ],
    correctIndex: 0,
    explanation:
      'A ban is imposed because plastic bags cause problems, but it does not imply people will switch to cloth bags.',
    topic: 'Statement & Assumption',
  },
  {
    prompt:
      'Statement: Please use the staircase during power cuts.\n\n' +
      'Assumptions:\n' +
      'I. People need to move between floors.\n' +
      'II. Lifts do not work during power cuts.',
    options: [
      'Only I is implicit',
      'Only II is implicit',
      'Both I and II are implicit',
      'Neither I nor II is implicit',
    ],
    correctIndex: 2,
    explanation:
      'The instruction only makes sense if people need to change floors and lifts are unusable during power cuts.',
    topic: 'Statement & Assumption',
  },
  {
    prompt:
      'Statement: The school has increased the duration of summer vacations this year.\n\n' +
      'Assumptions:\n' +
      'I. Students need more rest.\n' +
      'II. The weather will be extremely hot.',
    options: [
      'Only I is implicit',
      'Only II is implicit',
      'Both I and II are implicit',
      'Neither I nor II is implicit',
    ],
    correctIndex: 3,
    explanation:
      'The decision itself does not reveal its exact cause; neither assumption is necessarily implicit.',
    topic: 'Statement & Assumption',
  },
  {
    prompt:
      'Statement: The shopkeeper put up a sign: "Fresh stock available today".\n\n' +
      'Assumptions:\n' +
      'I. Customers prefer fresh stock.\n' +
      'II. The shop had old stock earlier.',
    options: [
      'Only I is implicit',
      'Only II is implicit',
      'Both I and II are implicit',
      'Neither I nor II is implicit',
    ],
    correctIndex: 0,
    explanation:
      'Advertising fresh stock assumes customers value freshness; it says nothing about previous stock.',
    topic: 'Statement & Assumption',
  },
  {
    prompt:
      'Statement: The increase in taxes will make essential goods costly.\n\n' +
      'Conclusions:\n' +
      'I. People may oppose the tax increase.\n' +
      'II. The government will earn more revenue.',
    options: [
      'Only I follows',
      'Only II follows',
      'Both I and II follow',
      'Neither I nor II follows',
    ],
    correctIndex: 0,
    explanation:
      'Costlier essentials may trigger opposition, but revenue depends on demand and compliance, so it is not certain.',
    topic: 'Statement & Conclusion',
  },
  {
    prompt:
      'Statement: A healthy diet and regular exercise lead to a longer life.\n\n' +
      'Conclusions:\n' +
      'I. Exercise alone guarantees a longer life.\n' +
      'II. A healthy diet is beneficial.',
    options: [
      'Only I follows',
      'Only II follows',
      'Both I and II follow',
      'Neither I nor II follows',
    ],
    correctIndex: 1,
    explanation:
      'The statement links diet and exercise together to longer life; only the second conclusion is clearly supported.',
    topic: 'Statement & Conclusion',
  },
  {
    prompt:
      'Statement: The company has announced a bonus for all employees.\n\n' +
      'Conclusions:\n' +
      'I. Employees will be motivated.\n' +
      'II. The company made a profit.',
    options: [
      'Only I follows',
      'Only II follows',
      'Both I and II follow',
      'Neither I nor II follows',
    ],
    correctIndex: 0,
    explanation:
      'A bonus is likely to motivate, but profit is only one possible reason for the announcement.',
    topic: 'Statement & Conclusion',
  },
  {
    prompt:
      'Statement: If it rains, the match will be cancelled.\n\n' +
      'Conclusions:\n' +
      'I. The match was cancelled, so it rained.\n' +
      'II. It is not raining, so the match will not be cancelled.',
    options: [
      'Only I follows',
      'Only II follows',
      'Both I and II follow',
      'Neither I nor II follows',
    ],
    correctIndex: 3,
    explanation:
      'The statement only says rain is sufficient for cancellation, not necessary, so neither converse nor inverse follows.',
    topic: 'Statement & Conclusion',
  },
  {
    prompt:
      'Statement: Should primary education be made free?\n\n' +
      'Arguments:\n' +
      'I. Yes, it ensures every child learns.\n' +
      'II. No, the government cannot afford it.',
    options: [
      'Only argument I is strong',
      'Only argument II is strong',
      'Both I and II are strong',
      'Neither I nor II is strong',
    ],
    correctIndex: 0,
    explanation:
      'Universal access is a strong point; vague affordability concerns do not strongly oppose the policy.',
    topic: 'Statement & Argument',
  },
  {
    prompt:
      'Statement: Should uniforms be compulsory in schools?\n\n' +
      'Arguments:\n' +
      'I. Yes, it reduces peer pressure about clothes.\n' +
      'II. No, it suppresses individuality.',
    options: [
      'Only argument I is strong',
      'Only argument II is strong',
      'Both I and II are strong',
      'Neither I nor II is strong',
    ],
    correctIndex: 2,
    explanation:
      'Both arguments raise relevant and widely accepted pros and cons of the proposal.',
    topic: 'Statement & Argument',
  },
  {
    prompt:
      'Statement: Should the voting age be lowered to 16?\n\n' +
      'Arguments:\n' +
      'I. Yes, young people are affected by policies and should vote.\n' +
      'II. No, 16-year-olds lack maturity.',
    options: [
      'Only argument I is strong',
      'Only argument II is strong',
      'Both I and II are strong',
      'Neither I nor II is strong',
    ],
    correctIndex: 2,
    explanation:
      'Each argument addresses a legitimate consideration about rights and readiness.',
    topic: 'Statement & Argument',
  },
  {
    prompt:
      'Statement: Should plastic bottles be banned?\n\n' +
      'Arguments:\n' +
      'I. Yes, they pollute oceans.\n' +
      'II. No, glass bottles are heavier.',
    options: [
      'Only argument I is strong',
      'Only argument II is strong',
      'Both I and II are strong',
      'Neither I nor II is strong',
    ],
    correctIndex: 0,
    explanation:
      'Environmental harm is a strong argument; bottle weight alone is a weak counter-argument.',
    topic: 'Statement & Argument',
  },
  {
    prompt:
      'Statement: Many villages are facing severe water shortage.\n\n' +
      'Courses of action:\n' +
      'I. The government should supply water tankers.\n' +
      'II. Rainwater harvesting should be promoted.',
    options: [
      'Only I follows',
      'Only II follows',
      'Both I and II follow',
      'Neither I nor II follows',
    ],
    correctIndex: 2,
    explanation:
      'Immediate relief and long-term conservation together address the shortage.',
    topic: 'Course of Action',
  },
  {
    prompt:
      'Statement: The number of road accidents has increased.\n\n' +
      'Courses of action:\n' +
      'I. People should be educated about traffic rules.\n' +
      'II. Stricter penalties should be imposed.',
    options: [
      'Only I follows',
      'Only II follows',
      'Both I and II follow',
      'Neither I nor II follows',
    ],
    correctIndex: 2,
    explanation:
      'Education and enforcement are both practical ways to reduce accidents.',
    topic: 'Course of Action',
  },
  {
    prompt:
      'Statement: Students are performing poorly in mathematics.\n\n' +
      'Courses of action:\n' +
      'I. The maths syllabus should be removed.\n' +
      'II. Extra remedial classes should be arranged.',
    options: [
      'Only I follows',
      'Only II follows',
      'Both I and II follow',
      'Neither I nor II follows',
    ],
    correctIndex: 1,
    explanation:
      'Removing the syllabus is extreme; remedial help directly tackles poor performance.',
    topic: 'Course of Action',
  },
  {
    prompt:
      'Statement: There is an outbreak of dengue in the city.\n\n' +
      'Courses of action:\n' +
      'I. The city should be fumigated.\n' +
      'II. Public awareness campaigns should be launched.',
    options: [
      'Only I follows',
      'Only II follows',
      'Both I and II follow',
      'Neither I nor II follows',
    ],
    correctIndex: 2,
    explanation:
      'Fumigation kills mosquitoes and awareness helps prevention, so both actions follow.',
    topic: 'Course of Action',
  },
  {
    prompt:
      'I. The river overflowed its banks.\n' +
      'II. There was heavy rainfall for three days.',
    options: [
      'I is the cause and II is its effect',
      'II is the cause and I is its effect',
      'Both I and II are independent causes',
      'Both I and II are effects of independent causes',
    ],
    correctIndex: 1,
    explanation:
      'Heavy rainfall caused the river to overflow.',
    topic: 'Cause & Effect',
  },
  {
    prompt:
      'I. The price of petrol increased.\n' +
      'II. The price of vegetables increased.',
    options: [
      'I is the cause and II is its effect',
      'II is the cause and I is its effect',
      'Both I and II are independent causes',
      'Both I and II are effects of independent causes',
    ],
    correctIndex: 3,
    explanation:
      'Both price rises are likely separate effects of broader economic factors.',
    topic: 'Cause & Effect',
  },
  {
    prompt:
      'I. The company declared a dividend.\n' +
      'II. The company earned high profits.',
    options: [
      'I is the cause and II is its effect',
      'II is the cause and I is its effect',
      'Both I and II are independent causes',
      'Both I and II are effects of independent causes',
    ],
    correctIndex: 1,
    explanation:
      'High profits enable the company to declare a dividend.',
    topic: 'Cause & Effect',
  },
  {
    prompt:
      'I. Internet service was disrupted.\n' +
      'II. An undersea cable was cut.',
    options: [
      'I is the cause and II is its effect',
      'II is the cause and I is its effect',
      'Both I and II are independent causes',
      'Both I and II are effects of independent causes',
    ],
    correctIndex: 1,
    explanation:
      'A cut undersea cable caused the disruption of internet service.',
    topic: 'Cause & Effect',
  },
  {
    prompt:
      'Hard work, discipline, and continuous learning are the keys to success.\n\n' +
      'Which option best captures the theme?',
    options: [
      'Success requires effort and growth',
      'Luck is essential for success',
      'Discipline is harmful',
      'Learning stops after school',
    ],
    correctIndex: 0,
    explanation:
      'The passage emphasises effort, discipline, and ongoing learning as paths to success.',
    topic: 'Theme Detection',
  },
  {
    prompt:
      'Technology connects people across distances but also reduces face-to-face interaction.\n\n' +
      'Which option best captures the theme?',
    options: [
      'Technology only harms relationships',
      'Technology has both benefits and drawbacks',
      'Face-to-face interaction is unnecessary',
      'Distance prevents connection',
    ],
    correctIndex: 1,
    explanation:
      'The passage presents both a benefit and a drawback of technology.',
    topic: 'Theme Detection',
  },
  {
    prompt:
      'Honesty builds trust; trust builds strong teams.\n\n' +
      'Which option best captures the theme?',
    options: [
      'Trust is not important',
      'Strong teams do not need honesty',
      'Honesty leads to trust and teamwork',
      'Teams should avoid trust',
    ],
    correctIndex: 2,
    explanation:
      'The chain from honesty to trust to strong teams is the central theme.',
    topic: 'Theme Detection',
  },
  {
    prompt:
      'Recycling reduces waste and conserves natural resources.\n\n' +
      'Which option best captures the theme?',
    options: [
      'Recycling wastes resources',
      'Natural resources are unlimited',
      'Recycling helps reduce waste',
      'Waste is not a problem',
    ],
    correctIndex: 2,
    explanation:
      'The passage highlights the environmental benefits of recycling.',
    topic: 'Theme Detection',
  },
  {
    prompt:
      'A student missed an exam because of a medical emergency and requests a re-test.\n\n' +
      'What is the best decision?',
    options: [
      'Allow a re-test with a doctor\'s note',
      'Refuse because rules are rules',
      'Give full marks without a re-test',
      'Cancel all exams',
    ],
    correctIndex: 0,
    explanation:
      'A documented medical emergency is a fair reason for a re-test.',
    topic: 'Making Judgments',
  },
  {
    prompt:
      'An employee consistently arrives late but completes all work on time.\n\n' +
      'What is the best action?',
    options: [
      'Dismiss immediately',
      'Issue a warning and discuss punctuality',
      'Ignore completely',
      'Promote for output',
    ],
    correctIndex: 1,
    explanation:
      'Addressing the punctuality issue is proportionate and constructive.',
    topic: 'Making Judgments',
  },
  {
    prompt:
      'A shopkeeper accidentally gives a customer extra change.\n\n' +
      'What is the best action?',
    options: [
      'Keep the extra money',
      'Return it when noticed',
      'Spend it on stock',
      'Blame the customer',
    ],
    correctIndex: 1,
    explanation:
      'Returning the overpayment is honest and corrects the mistake.',
    topic: 'Making Judgments',
  },
  {
    prompt:
      'A driver sees a pedestrian about to cross at a zebra crossing.\n\n' +
      'What is the best response?',
    options: [
      'Speed up to pass first',
      'Stop and let the pedestrian cross',
      'Honk continuously',
      'Swerve into another lane',
    ],
    correctIndex: 1,
    explanation:
      'Stopping for a pedestrian at a zebra crossing is safe and lawful.',
    topic: 'Making Judgments',
  },
]

// --- public generator -------------------------------------------------------

export function generateQuestion(rng) {
  if (rng() < 0.6) {
    const generators = [
      generateBloodRelation,
      generateDirectionSense,
      generateSyllogism,
      generateLogicalProblem,
    ]
    const gen = pick(rng, generators)
    return gen(rng)
  }
  return pick(rng, staticBank)
}
