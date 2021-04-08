const express = require('express')
const app = express()
const handlebars = require('express-handlebars')
require('dotenv').config()

const port = process.env.PORT || '3000'

app.use(express.static(__dirname + '/public',{maxAge: '0'}))

// View Engine
app.engine('hbs', handlebars({
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials/',
    extname: '.hbs',
    defaultLayout: 'index',
}))

app.set('view engine', 'hbs')

// Routes
app.use('/', require('./routes/home'))
app.use('/posts', require('./routes/post'))
app.use('*', require('./routes/404'))

app.listen(port, () => console.log('App listening on port ' + port))


