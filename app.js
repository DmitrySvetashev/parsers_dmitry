const express = require('express');
const config = require('config');
const https = require("https");
const fs = require("fs");
var CronJob = require('cron').CronJob;
const PORT = config.get('port') || 3000;
const app = express();
app.use(express.json({extended: true}));
app.use(express.static('static'));
app.use('/api/v1',require('./routes/backend'));

async function start() {
    if (process.env.NODE_ENV ==='production') {
        //запуск таймера на каждые 6 часов
        const timerJob = new CronJob('0 0 */6 * * *',function(){ parserGals.iskraParser() });
        timerJob.start();
        app.listen(PORT, () => console.log('developer server runing on ',PORT,' port'));

        // запуск сервера
/*        https
        .createServer(
            {
                key: fs.readFileSync(`/etc/letsencrypt/live/${config.get('serverUrl')}/privkey.pem`),
                cert: fs.readFileSync(`/etc/letsencrypt/live/${config.get('serverUrl')}/fullchain.pem`),
            },
            app
        )
        .listen(PORT, () => {
            console.log('production server runing on ',PORT,' port');
        });
    */    }
    else app.listen(PORT, () => console.log('developer server runing on ',PORT,' port'));
}

start();