const http = require('http')
const { Server } = require('socket.io')
const { connectDB } = require('./models/db')
const handleRequest = require('./routes/index')
require('dotenv').config()

const PORT = process.env.PORT || 5000

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  handleRequest(req, res)
})

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
})

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)
  socket.on('driver:update', (data) => {
    io.emit('bus:updated', data)
  })
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

connectDB().then(() => {
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})