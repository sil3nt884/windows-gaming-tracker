const Event = require('events')
const events = new Event()
const server = require('../server/server')
const startTracker = require('./tracker')
const { http } = require('../server/http')



const start = async () => {
    server(events)
    http(events)
    console.log('server start and listening on  PORT 3000')
    await startTracker(events)

}

start()
