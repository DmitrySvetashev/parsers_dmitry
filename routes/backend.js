const { Router } = require('express');
const router = Router();
const gals = require('../parsers/gals');
const bnovo = require('../parsers/bnovo');

router.get(
    '/gals',
    [
    ],
    async (req, res) => {
        console.log('parsing gals');
        const result = await gals.iskraParser();
        console.log(result);
        return res.status(201).json({count: result.length, flats :result });
    }
)

router.get(
    '/bnovo',
    [
    ],
    async (req, res) => {
        console.log('parsing bnovo');
        const dateStart = req.query.date_start || null;
        const dateEnd = req.query.date_end || null;
        const adults = req.query.adults || null;
        const result = await bnovo.bnovoParser(dateStart,dateEnd,adults);
        console.log(result);
        return res.status(201).json( result );
    }
)

module.exports = router