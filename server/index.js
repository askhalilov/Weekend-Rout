import { createServer } from 'node:http'
import { readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { randomUUID } from 'node:crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const DATA_FILE = join(__dirname, 'data', 'db.json')
const PORT = process.env.PORT || 3001

const jsonHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
}

async function readDb() {
  if (!existsSync(DATA_FILE)) throw new Error('db.json not found')
  return JSON.parse(await readFile(DATA_FILE, 'utf-8'))
}

async function writeDb(db) {
  await writeFile(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8')
}

function send(res, status, payload) {
  res.writeHead(status, jsonHeaders)
  res.end(JSON.stringify(payload, null, 2))
}

function notFound(res) {
  send(res, 404, { error: 'Not found' })
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      if (!body) return resolve({})
      try { resolve(JSON.parse(body)) } catch (error) { reject(error) }
    })
  })
}

function calculateRouteSummary(placeIds, places) {
  const selected = placeIds
    .map(id => places.find(place => place.id === Number(id)))
    .filter(Boolean)
  const visitMinutes = selected.reduce((sum, place) => sum + place.durationMinutes, 0)
  const transferMinutes = Math.max(0, selected.length - 1) * 25
  const pauseMinutes = selected.length >= 3 ? 45 : selected.length >= 2 ? 20 : 0
  return {
    placesCount: selected.length,
    visitMinutes,
    transferMinutes,
    pauseMinutes,
    totalMinutes: visitMinutes + transferMinutes + pauseMinutes
  }
}

function minutesToText(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (!h) return `${m} мин`
  if (!m) return `${h} ч`
  return `${h} ч ${m} мин`
}

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, jsonHeaders)
    return res.end()
  }

  try {
    const url = new URL(req.url || '/', `http://${req.headers.host}`)
    const path = url.pathname
    const db = await readDb()

    if (req.method === 'GET' && path === '/api/health') {
      return send(res, 200, { status: 'ok', service: 'weekend-route-api', version: '1.0.0' })
    }

    if (req.method === 'GET' && path === '/api/places') {
      const q = (url.searchParams.get('q') || '').toLowerCase()
      const category = url.searchParams.get('category')
      let places = db.places
      if (q) places = places.filter(place => `${place.title} ${place.description} ${place.tags.join(' ')}`.toLowerCase().includes(q))
      if (category) places = places.filter(place => place.category === category || place.tags.includes(category.toLowerCase()))
      return send(res, 200, places)
    }

    const placeMatch = path.match(/^\/api\/places\/(\d+)$/)
    if (req.method === 'GET' && placeMatch) {
      const place = db.places.find(item => item.id === Number(placeMatch[1]))
      return place ? send(res, 200, place) : notFound(res)
    }

    if (req.method === 'GET' && path === '/api/services') {
      const near = url.searchParams.get('near')
      const kind = url.searchParams.get('kind')
      let services = db.servicePlaces
      if (near) services = services.filter(item => item.near === Number(near))
      if (kind) services = services.filter(item => item.kind === kind)
      return send(res, 200, services)
    }

    if (req.method === 'GET' && path === '/api/articles') {
      return send(res, 200, db.articles)
    }

    if (req.method === 'GET' && path === '/api/routes') {
      return send(res, 200, db.routes)
    }

    if (req.method === 'POST' && path === '/api/routes') {
      const body = await parseBody(req)
      const placeIds = Array.isArray(body.placeIds) ? body.placeIds.map(Number) : []
      const summary = calculateRouteSummary(placeIds, db.places)
      const route = {
        id: randomUUID(),
        name: body.name || 'Мой маршрут выходного дня',
        placeIds,
        transport: body.transport || 'metro',
        mood: body.mood || 'photo',
        createdAt: new Date().toISOString(),
        summary: { ...summary, totalText: minutesToText(summary.totalMinutes) }
      }
      db.routes.push(route)
      await writeDb(db)
      return send(res, 201, route)
    }

    const routeMatch = path.match(/^\/api\/routes\/([a-f0-9-]+)$/)
    if (routeMatch) {
      const routeIndex = db.routes.findIndex(item => item.id === routeMatch[1])
      if (routeIndex === -1) return notFound(res)

      if (req.method === 'GET') {
        const route = db.routes[routeIndex]
        const places = route.placeIds.map(id => db.places.find(place => place.id === Number(id))).filter(Boolean)
        return send(res, 200, { ...route, places })
      }

      if (req.method === 'DELETE') {
        const [removed] = db.routes.splice(routeIndex, 1)
        await writeDb(db)
        return send(res, 200, { deleted: true, route: removed })
      }
    }

    if (req.method === 'POST' && path === '/api/feedback') {
      const body = await parseBody(req)
      const feedback = {
        id: randomUUID(),
        name: body.name || 'Гость',
        message: body.message || '',
        createdAt: new Date().toISOString()
      }
      db.feedback.push(feedback)
      await writeDb(db)
      return send(res, 201, feedback)
    }

    return notFound(res)
  } catch (error) {
    send(res, 500, { error: 'Server error', details: error.message })
  }
})

server.listen(PORT, () => {
  console.log(`Weekend Route API is running: http://localhost:${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/api/health`)
})
