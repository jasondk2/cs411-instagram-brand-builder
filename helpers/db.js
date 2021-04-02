const mysql = require('mysql')
const config = require('./config')

const query = async (sql) => new Promise((res, rej) => {
    const con = mysql.createConnection(config.db)
    con.connect(err => {
        if(err)
            return rej(err) // Exits the promise with an error
        con.query(sql, (err, result, fields) => {
            if (err) 
                return rej(err) // Exits the promise with an error
            res(result) // Exits the promise with query result
        })
    })
})

module.exports = {query: query}