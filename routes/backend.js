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
        const dateStart = req.params.date_start || null;
        const dateEnd = req.params.date_end || null;
        const adults = req.params.adults || null;
        const result = await bnovo.bnovoParser();
        console.log(result);
        return res.status(201).json( result );
    }
)

module.exports = router