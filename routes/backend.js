const { Router } = require('express');
const router = Router();
const parserGals = require('../parsers/gals');

router.get(
    '/gals/parse',
    [
    ],
    async (req, res) => {
        const result = await parserGals.iskraParser();
        console.log(result);
        return res.status(201).json({count: result.length, flats :result });
    }
)

module.exports = router