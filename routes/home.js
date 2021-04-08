const router = require('express').Router()
const sql = require('../helpers/db')

router.get('/', async (req, res) => {
    const numPosts = (await sql.query('SELECT COUNT(*) as numPosts FROM Post LIMIT 1;'))[0].numPosts
    res.render('landing', {numPosts: numPosts})
})


module.exports = router