const { parse } = require('url')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { getDB } = require('../models/db')
require('dotenv').config()

async function authRoutes(req, res) {
  const { pathname } = parse(req.url)

  if (pathname === '/api/auth/register' && req.method === 'POST') {
    const { name, email, password, role } = req.body
    const db = getDB()
    const existing = await db.collection('users').findOne({ email })
    if (existing) return res.json({ error: 'User already exists' }, 400)
    const hashed = await bcrypt.hash(password, 10)
    await db.collection('users').insertOne({ name, email, password: hashed, role })
    return res.json({ message: 'User registered successfully' })
  }

  if (pathname === '/api/auth/login' && req.method === 'POST') {
    const { email, password, role } = req.body
    const db = getDB()
    const user = await db.collection('users').findOne({ email, role })
    if (!user) return res.json({ error: 'User not found' }, 404)
    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.json({ error: 'Invalid password' }, 401)
    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )
    return res.json({ token, role: user.role, name: user.name })
  }
  if (pathname === '/api/auth/users' && req.method === 'GET') {
  const db = getDB()
  const users = await db.collection('users').find({}, { projection: { password: 0 } }).toArray()
  return res.json(users)
}

if (pathname.startsWith('/api/auth/users/delete/') && req.method === 'DELETE') {
  const id = pathname.split('/').pop()
  const { ObjectId } = require('mongodb')
  const db = getDB()
  await db.collection('users').deleteOne({ _id: new ObjectId(id) })
  return res.json({ message: 'User deleted' })
}
  res.json({ error: 'Auth route not found' }, 404)
}

module.exports = authRoutes