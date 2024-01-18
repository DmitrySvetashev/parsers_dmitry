const config = require('config');
const { json } = require('express');
const bnovoAPI = config.get('bnovo');
const puppeteer = require('puppeteer');
const fs = require('fs');

// ======================================================== работа с ресурсами галс девелопмент ===============================================================

async function bnovoParser(dateStart, dateEnd, adults = 1) {
    console.log('start parsing');
    if (!dateStart || !dateEnd) {
        const now = new Date();
        const tom = new Date (now.getTime() + 24*60*60*1000);
        const dateToStr = (date) => {
            return (date.getDate()+'-'+date.getMonth()+1+'-'+date.getFullYear());
        }
        dateStart = dateToStr(now);
        dateEnd = dateToStr(tom);
    }
    console.log(`dateStart > ${dateStart}\ndateEnd > ${dateEnd}\nadults > ${adults}`);
    const browser = await puppeteer.launch({
        args: ['--no-sandbox'],
        timeout: 10000,
      });
    console.log('puppeteer launched');
    const page = await browser.newPage();
    console.log('puppeteer newPage');
    await page.goto(`${bnovoAPI.baseUrl}&dfrom=${dateStart}&dto=${dateEnd}&adults=${adults}`);
    console.log('url loaded');
    await page.waitForNetworkIdle();
    console.log('start page parsing');

/*
    const el = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".room__prices"));
    });
    console.log(`element > ${el.length}`);
    
    await page.close();
    await browser.close();
    
    return el.length;

*/
    const rooms = await page.evaluate(() => 
        Array.from(document.querySelectorAll(".room__info"),
        room => {
            const   roomTitle =  ".room__title > .room__titleText",
                    roomItemList = ".amenities-shortlist > div",
                    roomDescr = ".room__description > p",
                    roomPrice = ".room__prices",
                    roomNodates = ".tariff__nodates > div";
            result = {};
            result.title = room.querySelector(roomTitle) ? room.querySelector(roomTitle).innerHTML : null;
            result.items = Array.from(room.querySelectorAll(roomItemList),
            item => { 
                return item.getAttribute('title'); 
            });
            result.desct = room.querySelector(roomDescr) ? room.querySelector(roomDescr).innerText : null;
            const tariffs = Array.from(room.querySelectorAll(roomPrice),
            tarif => { 
                var tarifInfo = {};
                const   tarifTitle = ".tariff__header > .tariff__title > div > span",
                        tarifDescr = ".tariff__header > .tariff__description > div > span",
                        tarifPrice = ".tariff__price-value",
                        tarifPriceVol = ".tariff__priceCaption";
                tarifInfo.title = tarif.querySelector(tarifTitle).innerText;
                const descriptions = Array.from(tarif.querySelectorAll(tarifDescr),
                descr => {
                    return descr.innerText;
                });
                tarifInfo.descr = descriptions.filter(el => el != '' && el.search('\n') == -1).join(';');
                const price = tarif.querySelector(tarifPrice) ? tarif.querySelector(tarifPrice).innerText.replace(/\D/g,'') : null;
                const priceVol = tarif.querySelector(tarifPriceVol) ? tarif.querySelector(tarifPriceVol).innerHTML.replace('\n','').trim() : null;
                tarifInfo.price = price + ' ' + priceVol;
                return tarifInfo;
            });
            result.tariffs = tariffs;
            result.nodates = room.querySelector(roomNodates) ? room.querySelector(roomNodates).innerHTML.replace('\n\t','').trim().replace(/ {2,}/gm,' ') : null;
            return result;
        }
    ));

    await page.close();
    await browser.close();

    // rooms.map (el => console.log(`> ${JSON.stringify(el)}`));

    await fs.writeFile(bnovoAPI.pathToFile, JSON.stringify(rooms), (err) => {
            if (err) 
                console.log(err);
            else console.log("File written successfully\n");
    });
    return {
        'date_start': dateStart,
        'date_end': dateEnd,
        'adults': adults,
        'counts': rooms.length,
        'rooms': rooms
    };
}

module.exports.bnovoParser = bnovoParser;