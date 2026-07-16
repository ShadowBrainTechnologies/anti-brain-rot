import 'dotenv/config'

import cron from 'node-cron'
import { generatePuzzle } from './generate.js'
import { renderPuzzle } from './render.js'
import { createClient, ensureLogin, uploadPhoto } from './instagram.js'
import { buildCaption } from './caption.js'

const TIMEZONE = process.env.POST_TZ || 'Asia/Kolkata'

function parseScheduleHours(raw) {
  const hours = (raw || '9,18')
    .split(',')
    .map((h) => h.trim())
    .filter(Boolean)

  if (hours.length === 0) {
    throw new Error('POST_SCHEDULE has no valid hours. Use comma-separated 0-23, e.g. "9,18".')
  }

  for (const h of hours) {
    const n = Number(h)
    if (!Number.isInteger(n) || n < 0 || n > 23) {
      throw new Error(
        `POST_SCHEDULE has invalid hour "${h}". Use integers 0-23, e.g. "9,18".`,
      )
    }
    if (!cron.validate(`0 ${n} * * *`)) {
      throw new Error(`POST_SCHEDULE hour "${h}" did not validate as a cron expression.`)
    }
  }

  return hours
}

const SCHEDULE_HOURS = parseScheduleHours(process.env.POST_SCHEDULE)

async function doPost() {
  const ts = new Date().toISOString().slice(0, 19).replace('T', ' ')
  try {
    console.log(`\n[${ts}] 🧠 Generating puzzle...`)
    const puzzle = await generatePuzzle()
    console.log(`[${ts}]    ${puzzle.category} | ${puzzle.title}`)

    console.log(`[${ts}] 🎨 Rendering...`)
    const imageBuffer = await renderPuzzle(puzzle)

    console.log(`[${ts}] 📸 Connecting to Instagram...`)
    const { ig, hasSession } = await createClient()
    await ensureLogin(ig, hasSession)

    console.log(`[${ts}] 📤 Uploading...`)
    const result = await uploadPhoto(ig, imageBuffer, buildCaption(puzzle))
    console.log(
      `[${ts}] ✅ Posted! https://instagram.com/p/${result.media.code}/`,
    )
  } catch (err) {
    console.error(`[${ts}] ❌ Failed:`, err.message)
  }
}

console.log('⏰ Brain Rot Instagram Scheduler starting...')
console.log(`   Schedule: ${SCHEDULE_HOURS.join(':00, ')}:00 daily (${TIMEZONE})`)
console.log()

for (const hour of SCHEDULE_HOURS) {
  cron.schedule(`0 ${hour} * * *`, doPost, { timezone: TIMEZONE })
}

console.log('   Scheduler running. Press Ctrl+C to stop.')
console.log('   Run initial post now...')

doPost()
