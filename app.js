const express = require('express');
const config = require('config');
const PORT = config.get('port') || 80;
const https = require("https");
const fs = require("fs");

const app = express();
app.use(express.json({extended: true}));
app.use(express.static('static'));
app.use('/api/v1',require('./routes/backend'));

async function start() {
    // // проверка соединения с базой
    // const conn = await require('knex')(config.get('dbConnection'));
    // await conn.raw('select * from clients')
    // .then(function(rows) {  })
    // .catch(function(error) { console.log('Ошибка соединения с сервером MySQL:', error.sqlMessage); });

    if (process.env.NODE_ENV ==='production') {
        https
        .createServer(
            {
                key: fs.readFileSync("/etc/letsencrypt/live/d1.sve.fvds.ru/privkey.pem"),
                cert: fs.readFileSync("/etc/letsencrypt/live/d1.sve.fvds.ru/fullchain.pem"),
            },
            app
        )
        .listen(PORT, () => {
            console.log('production server runing on ',PORT,' port');
        });
    }
    else app.listen(PORT, () => console.log('developer server runing on ',PORT,' port'));
}

start();