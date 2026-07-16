import 'dotenv/config'

import { generatePuzzle } from './generate.js'
import { renderPuzzle } from './render.js'
import { createClient, ensureLogin, uploadPhoto } from './instagram.js'
import { buildCaption } from './caption.js'

const DRY_RUN = process.env.DRY_RUN === '1'

async function main() {
  console.log('🧠 Generating puzzle...')
  const puzzle = await generatePuzzle()
  console.log(`   Title   : ${puzzle.title}`)
  console.log(`   Category: ${puzzle.category}`)
  console.log(`   Puzzle  : ${puzzle.puzzle}`)
  console.log(`   Solution: ${puzzle.solution}`)

  console.log('\n🎨 Rendering image...')
  const imageBuffer = await renderPuzzle(puzzle)
  console.log(`   Image: ${(imageBuffer.length / 1024).toFixed(1)} KB`)

  const caption = buildCaption(puzzle)

  if (DRY_RUN) {
    console.log('\n🔍 DRY RUN — skipping Instagram upload.')
    console.log(`   Caption length: ${caption.length} chars`)
    return
  }

  console.log('\n📸 Connecting to Instagram...')
  const { ig, hasSession } = await createClient()
  await ensureLogin(ig, hasSession)

  console.log('📤 Uploading photo...')
  const result = await uploadPhoto(ig, imageBuffer, caption)
  console.log(`✅ Posted! https://instagram.com/p/${result.media.code}/`)
}

main().catch((err) => {
  console.error('\n❌ Failed:', err.message)
  process.exit(1)
})
