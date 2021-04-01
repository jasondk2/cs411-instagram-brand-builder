const express = require('express')
const app = express()
const sql = require('mysql')
require('dotenv').config()

const port = process.env.PORT || '3000'

var con = sql.createConnection({
    host: process.env.DB_DOMAIN,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

app.use('/', require('./routes/test'))
    con.connect(err => {
    con.query('SELECT * FROM Post LIMIT 1', (err, results, fields) => {
        console.log(results)
    })
    app.listen(port, ()=>console.log('App listening on port ' + port))
})

