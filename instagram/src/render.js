import sharp from 'sharp'

const W = 1080
const H = 1080

const BG = '#0d1117'
const ACCENT = '#e94560'
const TEXT = '#f0f6fc'
const MUTED = '#8b949e'
const BORDER = '#30363d'

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function wrapLines(text, maxChars = 42) {
  const words = text.split(/\s+/)
  const lines = []
  let current = ''

  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (test.length <= maxChars) {
      current = test
    } else {
      if (current) lines.push(current)
      current = word
    }
  }
  if (current) lines.push(current)
  return lines
}

function renderLines(lines, startY, fontSize, color) {
  const gap = Math.round(fontSize * 1.5)
  return lines
    .map(
      (line, i) =>
        `<text x="${W / 2}" y="${startY + i * gap}" text-anchor="middle" fill="${color}" font-size="${fontSize}" font-family="Arial, Helvetica, sans-serif" font-weight="normal">${esc(line)}</text>`,
    )
    .join('\n')
}

export async function renderPuzzle(puzzle) {
  const titleLines = wrapLines(puzzle.title, 28)
  const puzzleLines = wrapLines(puzzle.puzzle, 42)
  const titleBlockHeight = titleLines.length * 60
  const titleEndY = 320 + titleBlockHeight
  const dividerY = titleEndY + 30
  const puzzleStartY = dividerY + 60

  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="${BG}"/>
  <rect y="0" width="${W}" height="8" fill="${ACCENT}"/>

  <text x="${W / 2}" y="100" text-anchor="middle" fill="${ACCENT}" font-size="30" font-family="Arial, Helvetica, sans-serif" font-weight="bold" letter-spacing="4">DAILY BRAIN ROT CHALLENGE</text>

  <rect x="${Math.round(W / 2 - 90)}" y="130" width="180" height="38" rx="19" fill="${ACCENT}" opacity="0.15"/>
  <text x="${W / 2}" y="156" text-anchor="middle" fill="${ACCENT}" font-size="18" font-family="Arial, Helvetica, sans-serif" font-weight="bold">${esc(puzzle.category.toUpperCase())}</text>

  <line x1="180" y1="200" x2="${W - 180}" y2="200" stroke="${BORDER}" stroke-width="1"/>

  <text x="${W / 2}" y="280" text-anchor="middle" fill="${TEXT}" font-size="38" font-family="Arial, Helvetica, sans-serif" font-weight="bold">${esc(titleLines[0])}</text>
  ${titleLines.length > 1 ? renderLines(titleLines.slice(1), 330, 38, TEXT) : ''}

  <line x1="180" y1="${dividerY}" x2="${W - 180}" y2="${dividerY}" stroke="${BORDER}" stroke-width="1"/>

  ${renderLines(puzzleLines, puzzleStartY, 30, TEXT)}

  <rect x="${Math.round(W / 2 - 200)}" y="${H - 140}" width="400" height="52" rx="26" fill="${ACCENT}" opacity="0.12"/>
  <text x="${W / 2}" y="${H - 108}" text-anchor="middle" fill="${ACCENT}" font-size="22" font-family="Arial, Helvetica, sans-serif" font-weight="bold">Answer in comments ↓</text>

  <text x="${W / 2}" y="${H - 50}" text-anchor="middle" fill="${MUTED}" font-size="16" font-family="Arial, Helvetica, sans-serif">@anti.brain.rot · 30+ games at link in bio</text>
</svg>`

  return sharp(Buffer.from(svg)).png().toBuffer()
}
