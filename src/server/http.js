const express = require('express')
const app = express()
const bodyParser = require('body-parser')


app.use(bodyParser.json())

const http = (events) => {
    app.post('/', (req, res)=>{
        events.emit('http request', req.body.url)
        res.status(200)
    }).listen(3001)
}


module.exports = { http }
