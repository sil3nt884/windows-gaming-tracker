const {exec, spawn} = require('child_process');
const fs = require('fs/promises')
const watchFile = require('../utils/fileChangeHelper')


const logger = (message) =>
    console.log(`${new Date().toISOString().substring(0, 10)}: ${message}`)


const loadGamesList =  async () => {
    const { games } = JSON.parse(await fs.readFile('config.json', 'utf8'))
 return games
}

module.exports =  async (events) => {
    const unsentLogs = []
    let gamesList = await loadGamesList()
    let currentGame = {}
    let lastKnownGameKey = ''

    watchFile('config.json', events)


    const computerStart = () => {
        logger(`computer started at ${new Date().toISOString()}`)
        unsentLogs.push({log : `computer started at ${new Date().toISOString()}`, sent : false})
    }

    computerStart()

    const getTaskList = () => {
        return new Promise(resolve => {
            exec('tasklist', function(err, stdout, stderr) {
                resolve(stdout.split(/\n/).map(e => e.split(/\s+/)[0]))
            });
        })
    }


    const delay = (ms) => {
        return new Promise(resolve => {
            setTimeout(()=> {
                resolve()
            }, ms)
        })
    }

    const pollTaskList =  async () => {
        while(true) {
            events.emit('task list updated', await getTaskList())
            await delay(1000)
        }
    }

    pollTaskList()



    const killTask = (taskName) => {
        const taskkill = spawn('cmd.exe', ['/c', 'taskkill', '/IM', taskName, "/F"] )
        taskkill.on('error',(err) =>logger(data) )
        taskkill.stdout.on('data', (data) => logger(data))
        taskkill.stderr.on('data', (data) => logger(data))
    }

    let seen = {}
    let startTime = 0
    const invokeTaskKill = () => {
        const seentask = Object.keys(seen).length
        if(seentask >= 2) {
            gamesList.forEach(e => killTask(e))
        }
    }
    const trackTask = async (task, tasklist) => {
        const taskExisit = tasklist.filter(e => e.includes(task)).length >= 1
        let hasSeen = Object.keys(seen).filter(e => e.includes(task)).length
        if(taskExisit && !hasSeen) {
            startTime = Date.now();
            const log = `start time: ${new Date(startTime).toISOString()} TASK ${task}`
            logger(log)
            unsentLogs.push({log, sent : false})
            seen[task]=task
        }
        if(!taskExisit && hasSeen) {
            const endTime = Date.now();
            const totalTimeSeen = (endTime - startTime) / 1000
            const log = `endTime: ${new Date(endTime).toISOString()}, total time playing : ${totalTimeSeen} Task ${task}`
            if(lastKnownGameKey.length > 1) {
                currentGame[task][lastKnownGameKey] = totalTimeSeen
            }
            logger(log)
            logger(JSON.stringify(currentGame))
            unsentLogs.push({log, currentGame, sent : false})
            delete seen[task]
        }

    }

    events.on('task list updated', (tasklist) => {
        trackTask('Roblox', tasklist)
        trackTask('ffxiv_dx11', tasklist)
        invokeTaskKill()
    })

    events.on('http request', (url)=> {
        const urlParts = new URL(url)
        const { pathname , origin} = urlParts
        if(origin.includes('roblox')) {
            lastKnownGameKey= pathname
            currentGame.Roblox={[pathname]: 0}
        }
    })


    events.on('client connected', (socket)=> {
         if(unsentLogs.length >=1 ) {
            unsentLogs.forEach(log => {
                if(log.sent !== true) {
                    socket.write(JSON.stringify(log) + '\n')
                    log.sent = true
                }
            })

         }
    })

    events.on('client disconnected', async ()=> {
         if(unsentLogs.length) {
             const failedToSendLogs = unsentLogs.filter(log => log.sent === false)
             await fs.appendFile('logs.json', JSON.stringify(failedToSendLogs) + '\n')
         }
    })


    events.on('config file changed', async ()=> {
            console.log('file change detected')
            gamesList = await loadGamesList()
    })



}
