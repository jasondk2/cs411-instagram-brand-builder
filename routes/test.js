const router = require('express').Router()

router.get('/', async (req, res) => {
    res.send('Test Complete!')
})

module.exports = router