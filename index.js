const express = require('express')
const app = express()
const sql = require('mysql')
const handlebars = require('express-handlebars')
require('dotenv').config()

const port = process.env.PORT || '3000'

// View Engine
app.engine('hbs', handlebars({
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials/',
    extname: '.hbs',
    defaultLayout: 'index',
}))

app.set('view engine', 'hbs')

// Routes
app.use('/', require('./routes/test'))
app.use('/posts', require('./routes/post'))

app.listen(port, () => console.log('App listening on port ' + port))


