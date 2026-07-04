export const BASE_HEALTH = 100
export const ASTEROID_HEIGHT = 48

export const DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
}

export const GAME_DURATION = 60

export const CONFIG = {
  [DIFFICULTY.EASY]: {
    spawnMs: 2200,
    speedMin: 45,
    speedMax: 70,
    maxWordLength: 6,
    score: 10,
    collisionDamage: 12,
    wrongDamage: 8,
  },
  [DIFFICULTY.MEDIUM]: {
    spawnMs: 1600,
    speedMin: 75,
    speedMax: 105,
    maxWordLength: 8,
    score: 15,
    collisionDamage: 18,
    wrongDamage: 12,
  },
  [DIFFICULTY.HARD]: {
    spawnMs: 1100,
    speedMin: 110,
    speedMax: 150,
    maxWordLength: 12,
    score: 25,
    collisionDamage: 25,
    wrongDamage: 18,
  },
}

// Simple seeded RNG (Mulberry32).
export function createRng(seed) {
  let t = seed >>> 0
  return function rand() {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

export function randRange(rand, min, max) {
  return min + rand() * (max - min)
}

export function randInt(rand, min, max) {
  return Math.floor(randRange(rand, min, max))
}

// Curated list of common English words for typing practice.
const WORDS = [
  'ace', 'act', 'add', 'age', 'aid', 'aim', 'air', 'ale', 'all', 'and', 'ant', 'any', 'ape', 'app', 'arc', 'are', 'arm', 'art', 'ash', 'ask',
  'ate', 'awe', 'axe', 'bad', 'bag', 'ban', 'bar', 'bat', 'bay', 'bed', 'bee', 'beg', 'bet', 'bid', 'big', 'bin', 'bit', 'boa', 'bob', 'bog',
  'boo', 'bow', 'box', 'boy', 'bra', 'bud', 'bug', 'bun', 'bus', 'but', 'buy', 'bye', 'cab', 'cad', 'cam', 'can', 'cap', 'car', 'cat', 'caw',
  'cod', 'cog', 'con', 'coo', 'cop', 'cot', 'cow', 'coy', 'cry', 'cub', 'cue', 'cup', 'cut', 'dab', 'dad', 'dam', 'day', 'den', 'dew', 'did',
  'die', 'dig', 'dim', 'din', 'dip', 'dog', 'dot', 'dry', 'dub', 'dud', 'due', 'dug', 'duo', 'dye', 'ear', 'eat', 'eel', 'egg', 'ego', 'elf',
  'elk', 'elm', 'emu', 'end', 'era', 'eve', 'eye', 'fan', 'far', 'fat', 'fax', 'fay', 'fed', 'fee', 'few', 'fib', 'fig', 'fin', 'fir', 'fit',
  'fix', 'flu', 'fly', 'fog', 'foo', 'for', 'fox', 'fro', 'fry', 'fun', 'fur', 'gag', 'gal', 'gap', 'gas', 'gay', 'gel', 'gem', 'get', 'gig',
  'gin', 'god', 'got', 'gum', 'gun', 'gut', 'guy', 'gym', 'had', 'hag', 'ham', 'has', 'hat', 'hay', 'hem', 'hen', 'her', 'hew', 'hex', 'hid',
  'him', 'hip', 'his', 'hit', 'hog', 'hop', 'hot', 'how', 'hub', 'hue', 'hug', 'huh', 'hum', 'hut', 'ice', 'icy', 'ink', 'inn', 'ion', 'ire',
  'ivy', 'jab', 'jag', 'jam', 'jar', 'jaw', 'jay', 'jet', 'jew', 'jig', 'job', 'joe', 'jog', 'joy', 'jug', 'jut', 'keg', 'key', 'kid', 'kin',
  'kit', 'lab', 'lad', 'lag', 'lam', 'lap', 'law', 'lax', 'lay', 'led', 'leg', 'let', 'lid', 'lie', 'lip', 'lit', 'lob', 'log', 'lot', 'low',
  'mad', 'man', 'map', 'mat', 'maw', 'may', 'men', 'met', 'mew', 'mid', 'milk', 'mill', 'mime', 'mind', 'mine', 'mint', 'miss', 'mist', 'mix', 'moat',
  'mock', 'mode', 'mold', 'mole', 'monk', 'mood', 'moon', 'mop', 'moss', 'moth', 'motor', 'mount', 'mouse', 'mouth', 'move', 'movie', 'muck', 'mule', 'mull', 'mum',
  'murk', 'muse', 'mush', 'must', 'mute', 'mutt', 'myth', 'nail', 'name', 'nape', 'nap', 'navy', 'near', 'neat', 'neck', 'need', 'neon', 'nerd', 'nest', 'net',
  'news', 'next', 'nice', 'niche', 'niece', 'nine', 'ninja', 'noble', 'node', 'noise', 'noisy', 'nomad', 'none', 'noon', 'nope', 'north', 'nose', 'notch', 'note', 'novel',
  'now', 'nozzle', 'nuance', 'nudge', 'nurse', 'nut', 'nylon', 'oaf', 'oak', 'oar', 'oat', 'obey', 'object', 'oboe', 'ocean', 'octet', 'odds', 'odor', 'offer', 'ogre',
  'oil', 'oink', 'okay', 'old', 'olive', 'omega', 'omen', 'omit', 'once', 'one', 'onion', 'only', 'onset', 'ooze', 'open', 'opera', 'optic', 'orbit', 'orca', 'order',
  'organ', 'other', 'otter', 'ouch', 'ounce', 'out', 'oval', 'oven', 'over', 'owl', 'own', 'oxide', 'oxygen', 'oyster', 'pace', 'pack', 'pact', 'paddle', 'page', 'paid',
  'pail', 'pain', 'paint', 'pair', 'pale', 'palm', 'pan', 'panda', 'pane', 'pang', 'panic', 'pant', 'pants', 'paper', 'park', 'parrot', 'part', 'party', 'pass', 'past',
  'path', 'patio', 'pause', 'pave', 'paw', 'pay', 'pea', 'peace', 'peak', 'pear', 'pearl', 'peat', 'pedal', 'peek', 'peel', 'peep', 'peer', 'peg', 'pelt', 'pen',
  'pencil', 'penny', 'peony', 'people', 'pepper', 'perch', 'perfect', 'period', 'permit', 'person', 'pest', 'pet', 'petal', 'phase', 'phone', 'photo', 'piano', 'pick', 'picket', 'picnic',
  'pie', 'piece', 'pig', 'pigeon', 'pike', 'pile', 'pill', 'pillow', 'pilot', 'pin', 'pine', 'pink', 'pipe', 'pirate', 'pit', 'pizza', 'place', 'plain', 'plan', 'plane',
  'planet', 'plant', 'plate', 'play', 'plaza', 'plea', 'pledge', 'pluck', 'plug', 'plum', 'plume', 'plump', 'plunge', 'plus', 'poach', 'pocket', 'pod', 'poem', 'poet', 'point',
  'poke', 'pole', 'police', 'polish', 'poll', 'pond', 'pony', 'pool', 'poor', 'pop', 'pope', 'pork', 'port', 'pose', 'post', 'pot', 'pouch', 'pound', 'pour', 'powder',
  'power', 'practice', 'praise', 'pray', 'preach', 'prefer', 'prep', 'press', 'prey', 'price', 'pride', 'prime', 'print', 'prior', 'prism', 'prize', 'probe', 'problem', 'process', 'produce',
  'product', 'profit', 'program', 'project', 'promise', 'prompt', 'proof', 'prose', 'protect', 'proud', 'prove', 'proverb', 'public', 'puck', 'puff', 'pull', 'pulse', 'pump', 'punch', 'pupil',
  'puppy', 'purchase', 'pure', 'purple', 'purpose', 'purse', 'push', 'put', 'puzzle', 'quack', 'quail', 'quake', 'quality', 'quantum', 'quart', 'queen', 'query', 'quest', 'quick', 'quiet',
  'quill', 'quilt', 'quiz', 'quote', 'rabbit', 'race', 'rack', 'radar', 'radio', 'raft', 'rage', 'rail', 'rain', 'raise', 'rake', 'rally', 'ram', 'ranch', 'range', 'rank',
  'rapid', 'rare', 'rat', 'rate', 'ratio', 'raven', 'raw', 'ray', 'razor', 'reach', 'read', 'ready', 'real', 'realm', 'reap', 'rear', 'reason', 'rebel', 'recall', 'receive',
  'recipe', 'reckon', 'record', 'recruit', 'red', 'reed', 'reef', 'reel', 'refine', 'reflect', 'reform', 'refuge', 'refund', 'refuse', 'regard', 'region', 'regret', 'reign', 'reject', 'relate',
  'relax', 'relay', 'release', 'relief', 'rely', 'remain', 'remark', 'remedy', 'remind', 'remote', 'remove', 'render', 'rent', 'repair', 'repeat', 'reply', 'report', 'rescue', 'research', 'resist',
  'resort', 'rest', 'result', 'resume', 'retail', 'retain', 'retire', 'return', 'reveal', 'review', 'reward', 'rhino', 'rhyme', 'rhythm', 'rib', 'rice', 'rich', 'rid', 'ride', 'ridge',
  'rifle', 'right', 'rigid', 'ring', 'rinse', 'riot', 'rip', 'ripe', 'rise', 'risk', 'river', 'road', 'roar', 'roast', 'rob', 'robe', 'robot', 'rock', 'rocket', 'rod',
  'role', 'roll', 'roof', 'room', 'root', 'rope', 'rose', 'rotate', 'rough', 'round', 'route', 'routine', 'row', 'royal', 'rub', 'ruby', 'rug', 'ruin', 'rule', 'ruler',
  'rumble', 'run', 'rung', 'rush', 'rust', 'rut', 'sack', 'sad', 'safe', 'safety', 'sage', 'sail', 'saint', 'salad', 'salary', 'sale', 'salt', 'same', 'sample', 'sand',
  'sane', 'sang', 'sash', 'sat', 'sauce', 'sausage', 'save', 'saw', 'say', 'scale', 'scan', 'scar', 'scare', 'scarf', 'scene', 'scent', 'schedule', 'school', 'science', 'scoop',
  'score', 'scout', 'scramble', 'scrap', 'screen', 'screw', 'script', 'scroll', 'scrub', 'sea', 'seal', 'search', 'season', 'seat', 'second', 'secret', 'section', 'secure', 'see', 'seed',
  'seek', 'seem', 'seen', 'seep', 'segment', 'select', 'self', 'sell', 'send', 'sense', 'sentence', 'sent', 'separate', 'sequence', 'serene', 'serious', 'serve', 'service', 'set', 'seven',
  'sever', 'sew', 'shade', 'shadow', 'shake', 'shall', 'shallow', 'shape', 'share', 'shark', 'sharp', 'shave', 'she', 'shear', 'shed', 'sheep', 'sheet', 'shelf', 'shell', 'shelter',
  'shift', 'shine', 'ship', 'shirt', 'shock', 'shoe', 'shoot', 'shop', 'shore', 'short', 'shot', 'should', 'shout', 'show', 'shower', 'shred', 'shrimp', 'shrine', 'shut', 'shy',
  'sick', 'side', 'siege', 'sigh', 'sight', 'sign', 'signal', 'silence', 'silent', 'silk', 'silly', 'silver', 'similar', 'simple', 'sin', 'since', 'sing', 'sink', 'sip', 'siren',
  'sister', 'sit', 'site', 'six', 'size', 'skate', 'sketch', 'ski', 'skill', 'skin', 'skip', 'skirt', 'skull', 'sky', 'slab', 'slam', 'slap', 'slash', 'slate', 'slave',
  'sled', 'sleep', 'sleeve', 'slice', 'slide', 'slight', 'slim', 'slip', 'slope', 'slot', 'slow', 'slum', 'sly', 'small', 'smart', 'smash', 'smell', 'smile', 'smoke', 'smooth',
  'snack', 'snail', 'snake', 'snap', 'snare', 'sneak', 'sneeze', 'snow', 'soak', 'soap', 'soar', 'soccer', 'social', 'sock', 'soda', 'sofa', 'soft', 'soil', 'solar', 'sold',
  'soldier', 'sole', 'solid', 'solo', 'solve', 'some', 'son', 'song', 'soon', 'sort', 'soul', 'sound', 'soup', 'sour', 'source', 'south', 'space', 'spade', 'spare', 'spark',
  'sparrow', 'speak', 'spear', 'special', 'speech', 'speed', 'spell', 'spend', 'sphere', 'spice', 'spider', 'spike', 'spill', 'spin', 'spine', 'spirit', 'spit', 'splash', 'split', 'spoil',
  'sponge', 'spoon', 'sport', 'spot', 'spout', 'spray', 'spread', 'spring', 'sprout', 'spun', 'spy', 'square', 'squash', 'squat', 'squeak', 'squeeze', 'squirrel', 'stable', 'stack', 'staff',
  'stage', 'stain', 'stair', 'stake', 'stale', 'stalk', 'stall', 'stamp', 'stand', 'star', 'stare', 'start', 'starve', 'state', 'station', 'stay', 'steady', 'steak', 'steal', 'steam',
  'steel', 'steep', 'steer', 'stem', 'step', 'stern', 'stew', 'stick', 'stiff', 'still', 'sting', 'stir', 'stock', 'stole', 'stomach', 'stone', 'stood', 'stool', 'stop', 'store',
  'storm', 'story', 'stove', 'straight', 'strain', 'strange', 'strap', 'straw', 'stray', 'stream', 'street', 'stress', 'stretch', 'strict', 'stride', 'strike', 'string', 'strip', 'stripe', 'strive',
  'stroke', 'strong', 'struck', 'structure', 'struggle', 'student', 'studio', 'study', 'stuff', 'stumble', 'stump', 'stun', 'stunt', 'style', 'subject', 'submit', 'subtle', 'such', 'sudden', 'suffer',
  'sugar', 'suggest', 'suit', 'sulfur', 'sum', 'summer', 'sun', 'super', 'supply', 'sure', 'surface', 'surge', 'surprise', 'survey', 'sushi', 'swallow', 'swamp', 'swan', 'swap', 'swarm',
  'sway', 'sweep', 'sweet', 'swell', 'swift', 'swim', 'swing', 'switch', 'sword', 'swore', 'symbol', 'symptom', 'synod', 'syrup', 'system', 'table', 'tablet', 'tack', 'taco', 'tact',
  'tail', 'take', 'tale', 'talent', 'talk', 'tall', 'tame', 'tank', 'tap', 'tape', 'target', 'task', 'taste', 'tattoo', 'taxi', 'tea', 'teach', 'team', 'tear', 'tease',
  'teen', 'teeth', 'tell', 'temp', 'temple', 'tempo', 'tend', 'tennis', 'tent', 'term', 'test', 'text', 'thank', 'thaw', 'theft', 'theme', 'then', 'theory', 'there', 'thick',
  'thief', 'thigh', 'thin', 'thing', 'think', 'third', 'thirst', 'thorn', 'those', 'thought', 'thread', 'threat', 'thrill', 'thrive', 'throat', 'throne', 'throw', 'thrust', 'thumb', 'thunder',
  'tick', 'tide', 'tidy', 'tie', 'tiger', 'tile', 'till', 'tilt', 'time', 'tin', 'tiny', 'tip', 'tire', 'tissue', 'title', 'toast', 'today', 'toe', 'together', 'toilet',
  'token', 'told', 'toll', 'tomato', 'tone', 'tongue', 'tonight', 'too', 'took', 'tool', 'tooth', 'top', 'topic', 'torch', 'tornado', 'toss', 'total', 'touch', 'tough', 'tour',
  'tow', 'towel', 'tower', 'town', 'toxic', 'toy', 'trace', 'track', 'trade', 'traffic', 'trail', 'train', 'trait', 'tram', 'trap', 'trash', 'travel', 'tray', 'tread', 'treasure',
  'treat', 'tree', 'trend', 'trial', 'tribe', 'trick', 'trip', 'troop', 'trouble', 'trout', 'truck', 'true', 'trumpet', 'trunk', 'trust', 'truth', 'try', 'tube', 'tuck', 'tug',
  'tulip', 'tumble', 'tuna', 'tune', 'tunnel', 'turbo', 'turkey', 'turn', 'turtle', 'tutor', 'twice', 'twig', 'twin', 'twist', 'type', 'typist', 'ugly', 'ulcer', 'uncle', 'under',
  'undo', 'unfair', 'unify', 'union', 'unique', 'unit', 'unite', 'unity', 'unknown', 'until', 'up', 'update', 'upgrade', 'uphold', 'upon', 'upper', 'uproar', 'upset', 'urban', 'urge',
  'use', 'used', 'useful', 'usual', 'utter', 'vacant', 'vacuum', 'vague', 'vain', 'valid', 'valley', 'value', 'valve', 'van', 'vanish', 'vase', 'vast', 'vault', 'vector', 'veil',
  'vein', 'vendor', 'vent', 'venue', 'verb', 'verify', 'verse', 'version', 'very', 'vessel', 'vest', 'veto', 'via', 'vibe', 'vicar', 'victim', 'video', 'view', 'vigor', 'villa',
  'vine', 'violin', 'virtual', 'virus', 'visa', 'visit', 'visual', 'vital', 'voice', 'void', 'volcano', 'volume', 'vote', 'vowel', 'voyage', 'wade', 'waffle', 'wag', 'wage', 'wagon',
  'waist', 'wait', 'wake', 'walk', 'wall', 'wander', 'want', 'war', 'warm', 'warn', 'warp', 'warrior', 'wash', 'wasp', 'waste', 'watch', 'water', 'wave', 'wax', 'way',
  'weak', 'wealth', 'wear', 'weasel', 'weather', 'weave', 'web', 'wed', 'weed', 'week', 'weep', 'weigh', 'weight', 'weird', 'well', 'west', 'wet', 'whale', 'what', 'wheat',
  'wheel', 'when', 'where', 'whip', 'whirl', 'whisper', 'whistle', 'white', 'who', 'whole', 'why', 'wick', 'wide', 'widow', 'width', 'wife', 'wild', 'will', 'win', 'wind',
  'window', 'wine', 'wing', 'wink', 'winner', 'winter', 'wipe', 'wire', 'wise', 'wish', 'wit', 'witch', 'with', 'wolf', 'woman', 'wonder', 'wood', 'wool', 'word', 'work',
  'world', 'worm', 'worry', 'worse', 'worship', 'worst', 'worth', 'would', 'wound', 'wrap', 'wrath', 'wreck', 'wrest', 'wring', 'wrist', 'write', 'wrong', 'wrote', 'yard', 'yarn',
  'yawn', 'year', 'yeast', 'yell', 'yellow', 'yes', 'yet', 'yield', 'yoga', 'yolk', 'you', 'young', 'youth', 'zeal', 'zebra', 'zero', 'zone', 'zoo',
]

const MIN_WORD_LENGTH = 3

export function pickWord(rand, difficulty) {
  const cfg = CONFIG[difficulty]
  const candidates = WORDS.filter(
    (w) => w.length >= MIN_WORD_LENGTH && w.length <= cfg.maxWordLength,
  )
  if (candidates.length === 0) return WORDS[randInt(rand, 0, WORDS.length)]
  return candidates[randInt(rand, 0, candidates.length)]
}

export function clampX(xPercent) {
  return Math.max(0.08, Math.min(0.92, xPercent))
}

export function makeAsteroid(id, word, containerWidth, difficulty, rand) {
  const cfg = CONFIG[difficulty]
  const xPercent = clampX(rand())
  const speed = randRange(rand, cfg.speedMin, cfg.speedMax)
  return {
    id,
    word,
    xPercent,
    y: -ASTEROID_HEIGHT,
    speed,
  }
}

export function getTarget(asteroids) {
  if (asteroids.length === 0) return null
  return asteroids.reduce((closest, asteroid) => {
    if (asteroid.y > closest.y) return asteroid
    if (asteroid.y === closest.y && asteroid.id < closest.id) return asteroid
    return closest
  })
}
