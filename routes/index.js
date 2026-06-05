const { parse } = require('url')
const authRoutes = require('./auth')
const busRoutes = require('./bus')

async function handleRequest(req, res) {
  const { pathname } = parse(req.url)

  let body = ''
  req.on('data', chunk => body += chunk)
  await new Promise(resolve => req.on('end', resolve))
  req.body = body ? JSON.parse(body) : {}

  res.json = (data, status = 200) => {
    res.writeHead(status, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(data))
  }

  if (pathname.startsWith('/api/auth')) return authRoutes(req, res)
  if (pathname.startsWith('/api/bus')) return busRoutes(req, res)

  res.json({ error: 'Route not found' }, 404)
}

module.exports = handleRequest