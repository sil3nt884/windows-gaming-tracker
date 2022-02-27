const fs = require('fs');
const md5 = require('md5');



module.exports  = (file, events) => {
    let md5Previous = null;
    let fsWait = false;
    fs.watch(file, (event, filename) => {
        if (filename) {
            if (fsWait) return;
            fsWait = setTimeout(() => {
                fsWait = false;
            }, 100);
            const md5Current = md5(fs.readFileSync(file));
            if (md5Current === md5Previous) {
                return;
            }
            md5Previous = md5Current;
            events.emit('config file changed')
        }
    });
}
