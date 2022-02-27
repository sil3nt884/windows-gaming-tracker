const net = require("net");


module.exports = (events) => {
    const server = net.createServer((socket) =>{
        events.emit('client connected', socket)
        socket.on('close', ()=> events.emit('client disconnected'))
    })
    server.listen(3000)
}
