const { parse } = require('url')
const { getDB } = require('../models/db')
const { verifyToken } = require('../middleware/auth')

async function busRoutes(req, res) {
  const { pathname } = parse(req.url)

  // Public route - no auth needed
  if (pathname === '/api/bus/seed' && req.method === 'POST') {
    const db = getDB()
    const buses = [
      { busId: 'bus-01', busNumber: 'Bus 01', route: 'Poonamallee', driver: 'Ravi Kumar', capacity: 52, status: 'On Time', currentStop: 'Koyambedu', eta: '5 min' },
      { busId: 'bus-02', busNumber: 'Bus 02', route: 'Anna Nagar', driver: 'Suresh M', capacity: 48, status: 'Delayed', currentStop: 'CMBT', eta: '18 min' },
      { busId: 'bus-03', busNumber: 'Bus 03', route: 'Tambaram', driver: 'Manoj R', capacity: 52, status: 'On Time', currentStop: 'Chromepet', eta: '2 min' },
      { busId: 'bus-04', busNumber: 'Bus 04', route: 'Velachery', driver: 'Prakash S', capacity: 40, status: 'Breakdown', currentStop: 'Guindy', eta: 'N/A' },
      { busId: 'bus-05', busNumber: 'Bus 05', route: 'Porur', driver: 'Anand T', capacity: 52, status: 'On Time', currentStop: 'Vadapalani', eta: '10 min' },
      { busId: 'bus-06', busNumber: 'Bus 06', route: 'Avadi', driver: 'Senthil K', capacity: 48, status: 'Delayed', currentStop: 'Ambattur', eta: '25 min' },
    ]
    await db.collection('buses').deleteMany({})
    await db.collection('buses').insertMany(buses)
    return res.json({ message: 'Buses seeded successfully!' })
  }

  // Protected routes
  const user = verifyToken(req)
  if (!user) return res.json({ error: 'Unauthorized' }, 401)

  if (pathname === '/api/bus/all' && req.method === 'GET') {
    const db = getDB()
    const buses = await db.collection('buses').find({}).toArray()
    return res.json(buses)
  }

  if (pathname === '/api/bus/status' && req.method === 'POST') {
    const { busId, status, currentStop, message } = req.body
    const db = getDB()
    await db.collection('buses').updateOne(
      { busId },
      { $set: { status, currentStop, message, updatedAt: new Date() } },
      { upsert: true }
    )
    return res.json({ message: 'Status updated' })
  }

  res.json({ error: 'Bus route not found' }, 404)
}

module.exports = busRoutes