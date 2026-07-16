const PUZZLE_PROMPT = `You are a puzzle generator for an Instagram account called "Brain Rot Challenge" that helps youth train their minds instead of doom-scrolling.

Create an engaging, self-contained brain-training puzzle. Rules:
- Solvable from the post text alone (no image clues needed)
- 1-3 sentences for the puzzle text
- Fun and challenging for ages 13-25
- Vary categories randomly: logic riddles, mental math, word games, pattern recognition, lateral thinking, estimation

Respond ONLY with a valid JSON object. No markdown, no code block, no extra text:
{"title":"short catchy title under 8 words","puzzle":"the puzzle question, 1-3 sentences","solution":"the correct answer in 1-2 sentences","category":"logic|math|verbal|pattern|riddle|estimation"}`

function extractJson(text) {
  text = text.trim()

  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (match) return JSON.parse(match[1].trim())

  const firstBrace = text.indexOf('{')
  const lastBrace = text.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return JSON.parse(text.slice(firstBrace, lastBrace + 1))
  }

  return JSON.parse(text)
}

export async function generatePuzzle() {
  const apiUrl = process.env.OPENCODE_API_URL || 'https://api.openai.com'
  const apiKey = process.env.OPENCODE_API_KEY
  const model = process.env.OPENCODE_MODEL || 'gpt-4o-mini'

  if (!apiKey) {
    throw new Error('Missing OPENCODE_API_KEY. Set it in your .env file.')
  }

  const response = await fetch(`${apiUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: PUZZLE_PROMPT }],
      temperature: 0.95,
      max_tokens: 300,
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`LLM API error ${response.status}: ${body}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content

  if (!content) {
    throw new Error(`Unexpected LLM response: ${JSON.stringify(data)}`)
  }

  return extractJson(content)
}
