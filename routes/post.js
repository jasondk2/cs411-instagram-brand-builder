const router = require('express').Router()
const sql = require('../helpers/db')

router.get('/', async (req, res) => {
    const r = await sql.query('SELECT COUNT(*) as numPosts FROM Post LIMIT 1;')
    res.render('posts', {numPosts: r[0].numPosts})
})


module.exports = router