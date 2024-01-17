const express = require('express');
const config = require('config');
const fs = require("fs");
const parserGals = require('./parsers/gals');
var CronJob = require('cron').CronJob;
const CronTime = require('cron').CronTime;
const PORT = config.get('port') || 88;

const app = express();
app.use(express.json({extended: true}));
app.use(express.static('static'));
app.use('/api/v1',require('./routes/backend'));

async function start() {
    // запуск таймера на каждые 6 часов
    //const timerJob = new CronJob('0 0 */6 * * *',function(){ parserGals.iskraParser() });
    //timerJob.start();
    // слушаем команду
    app.listen(PORT, () => console.log('server runing on ',PORT,' port'));
}

start();