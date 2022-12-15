const { exec } = require('child_process');
const express = require('express')
const app = express()
const port = 3000

const process = exec('flutter run --web-port 5555 -d web-server --web-hostname 0.0.0.0', {
    cwd: '/home/dev/projects/k8s_flutter_preview/flutter/demoweb'
}, (error, stdout, stderr) => {
    if (error) {
        console.error(`error: ${error.message}`);
        return;
    }

    if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
    }

    console.log(`stdout:\n${stdout}`);
});



app.get('/', (req, res) => {
    process.stdin.write("\114");
    console.log(process.pid)
    res.send('Hello World!')
  })
  
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })