import { IgApiClient } from 'instagram-private-api'
import { readFile, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import { resolve } from 'path'

const SESSION_FILE = resolve(process.cwd(), '.ig-session.json')

function checkCredentials() {
  if (!process.env.INSTAGRAM_USERNAME || !process.env.INSTAGRAM_PASSWORD) {
    throw new Error(
      'Missing INSTAGRAM_USERNAME or INSTAGRAM_PASSWORD. Set them in your .env file.',
    )
  }
}

export async function createClient() {
  checkCredentials()

  const ig = new IgApiClient()
  ig.state.generateDevice(process.env.INSTAGRAM_USERNAME)

  if (existsSync(SESSION_FILE)) {
    try {
      const session = JSON.parse(await readFile(SESSION_FILE, 'utf-8'))
      await ig.state.deserialize(session)
      console.log('   Loaded saved session')
      return { ig, hasSession: true }
    } catch {
      console.log('   Session file corrupt, will re-login')
    }
  }

  return { ig, hasSession: false }
}

export async function ensureLogin(ig, hasSession) {
  if (hasSession) {
    try {
      const userId = await ig.account.currentUser()
      console.log(`   Session valid for @${userId.username}`)
      return userId
    } catch {
      console.log('   Saved session expired, re-logging in...')
    }
  }

  try {
    const user = await ig.account.login(
      process.env.INSTAGRAM_USERNAME,
      process.env.INSTAGRAM_PASSWORD,
    )
    console.log(`   Logged in as @${user.username}`)

    const session = await ig.state.serialize()
    await writeFile(SESSION_FILE, JSON.stringify(session))
    console.log('   Session saved')

    return user
  } catch (err) {
    if (err.name === 'IgCheckpointError') {
      console.error(
        '⚠️  Instagram triggered a checkpoint (suspicious login).',
      )
      console.error(
        '   Log in manually once via the app from this IP, then retry.',
      )
    }
    if (err.name === 'IgLoginBadPasswordError') {
      console.error('⚠️  Wrong password. Check your .env file.')
    }
    throw err
  }
}

export async function uploadPhoto(ig, imageBuffer, caption) {
  const result = await ig.publish.photo({
    file: imageBuffer,
    caption,
  })

  return result
}
