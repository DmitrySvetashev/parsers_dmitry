const { Router } = require('express');
const router = Router();
const galsAPIfunc = require('../gals')

router.get(
    '/gals/parse',
    [
    ],
    async (req, res) => {
        const result = await galsAPIfunc.iskraParser();
        return res.status(201).json({result: 'OK'});
    }
)

module.exports = router