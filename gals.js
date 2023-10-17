const axios = require('axios');
const config = require('config');
const { json } = require('express');
const galsAPI = config.get('gals');
const htmlparser2 = require ('htmlparser2');
const puppeteer = require('puppeteer');
const fs = require('fs');

// ======================================================== работа с ресурсами галс девелопмент ===============================================================

async function iskraParser() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(galsAPI.iskraBaseUrl+'/params/biznes-park-iskra');
    var flatsList = [];
    for (var p=0; p<10; p++) {
        console.log(`page ${p}`);
        await page.waitForSelector(galsAPI.flatListClass);
        await page.waitForNetworkIdle();
        const flats = await page.evaluate(() => 
            Array.from(document.querySelectorAll('.grid-item'),
            a => {
                result = {};
                const id = a.getAttribute('href');
                result.id = id;
//                const place = a.querySelector('.grid-item__body > .grid-item2__info').innerHTML;
//                const area = a.querySelector('.grid-item__body > .grid-item2__info2').innerHTML;
//                const price = a.querySelector('.grid-item__body > .grid-item2__info3 > .default-price').innerHTML;

                const place = a.querySelector('.grid-item__body > .grid-item2__info') ? a.querySelector('.grid-item__body > .grid-item2__info').innerHTML.replace(/(<!-- -->)/g,'').replace(/\//g,';').split(';') : null;
                result.number = place ? place[0].trim() : '';
                result.section = place ? place[1].trim() : '';
                result.floor = place ? Number(place[2].replace(/( этаж)/gui,'').trim()): 0;
                const area = a.querySelector('.grid-item__body > .grid-item2__info2') ? a.querySelector('.grid-item__body > .grid-item2__info2').innerHTML.replace(/(<!-- -->)/g,'').replace(/ /g,';').replace(/\,/g,'.').split(';') : null;
                result.area = area ? Number(area[0].trim()) : 0;
                const price = a.querySelector('.grid-item__body > .grid-item2__info3 > .default-price') ? a.querySelector('.grid-item__body > .grid-item2__info3 > .default-price').innerHTML : null;
                const startPos = price.indexOf(' ',price.indexOf(' ')+1);
                const endPos = price.indexOf('₽',0);
                result.price = price ? Number(price.substring(startPos,endPos).replace(/ /g,'')) : 0;
                return result;
            }
        ));
        flatsList = flatsList.concat(flats);
        const pageButton = await page.evaluate(() => 
            Array.from(document.querySelectorAll('li'),
            b => b.getAttribute('class'))
        )
        console.log(pageButton);
        if (pageButton[pageButton.length-2] === 'active') break
        else await page.click("a[rel='next']");
    }
    page.close();
    // парсим картинки
    for (var f=0; f<flatsList.length; f++) {
        console.log(`flat ${f}`);
        const page = await browser.newPage();
        await page.goto(galsAPI.iskraBaseUrl+flatsList[f].id);
        await page.waitForSelector(galsAPI.flatPlanImg);
        await page.waitForNetworkIdle();
        const flatPlanUrl = await page.evaluate(() => { return document.querySelector('.params-flat__plan > div > img').getAttribute('src'); });
        console.log(flatPlanUrl);
        const tabs = await page.$$('.index__projects__categories__item');
        await tabs[2].click();
        const floorPlanUrl = await page.evaluate(() => { return document.querySelector('.params-flat__plan > div > img').getAttribute('src'); });
        console.log(floorPlanUrl);
        await tabs[3].click();
        const decorsUrl = await page.evaluate(() => 
            Array.from(document.querySelectorAll('.slick-slide'),
            b => {
                return b.querySelector('div > div > img').getAttribute('src')
            }
        ));
        console.log(decorsUrl);
        flatsList[f].flatPlan = 'https:'+flatPlanUrl;
        flatsList[f].foorPlan = galsAPI.iskraBaseUrl+floorPlanUrl;
        flatsList[f].decoration = decorsUrl.filter((el, ndx, arr) => arr.findIndex(arrEl => arrEl === el) === ndx).map(el => galsAPI.iskraBaseUrl+el);
        page.close();
        console.log(flatsList[f]);
    }
    console.log(flatsList);
//    fs.writeFile("/srv/6feeds/public/parsing/result.json", JSON.stringify(flatsList), (err) => {
    fs.writeFile("result.json", JSON.stringify(flatsList), (err) => {
            if (err) console.log(err);
        else console.log("File written successfully\n");
    });
}

iskraParser();