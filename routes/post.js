const router = require('express').Router()
const sql = require('../helpers/db')

router.get('/', async (req, res) => {
    const reqQuery = req.query
    let errorMsgs = []
    let windowData = []
    // Since we have multiple forms on this page, figure out which one was submited on run its respective logic
    switch (reqQuery.qt) {
        case 'create':
            // TODO: Better Validation
            if (simpleValidate(reqQuery, ['id', 'usr', 'likes', 'date'])) {
                let date = reqQuery.date
                date = date.split('/')
                date = date[2] + '-' + date[0] + '-' + date[1] 
                let query = `INSERT INTO Post VALUES ("${reqQuery.id}", "${reqQuery.usr}", "${reqQuery.likes}", (DATE "${date}"));`
                try {
                    await sql.query(query)
                    windowData.push({
                        url: reqQuery.id,
                        username: reqQuery.usr,
                        likes: reqQuery.likes,
                        date_posted: date
                    })
                } catch (e) {
                    console.error(e)
                    errorMsgs.push('Operation Failed!')
                    errorMsgs.push(e.message)
                }
            }
            break
        case 'search':
            // TODO: Better Validation
            if (simpleValidate(reqQuery, ['usr'])) {
                let query = `SELECT * FROM Post WHERE username LIKE "%${reqQuery.usr.trim()}%";`
                try {
                    const queryResult = await sql.query(query)
                    for (const row of queryResult) {
                        windowData.push(row)
                    }
                } catch(e) {
                    console.error(e)
                    errorMsgs.push('Operation Failed!')
                    errorMsgs.push(e.message)
                }
            }
            break
        case 'update':
            // TODO: Better Validation
            if (simpleValidate(reqQuery, ['idq', 'id', 'author', 'likes', 'date'])) {
                let date = reqQuery.date
                date = date.split('/')
                date = date[2] + '-' + date[0] + '-' + date[1] 
                let query = `UPDATE Post SET url="${reqQuery.id}", username="${reqQuery.author}", likes="${reqQuery.likes}", date_posted=(DATE "${date}") WHERE url="${reqQuery.idq}"`
                
                try {
                    const queryResult = await sql.query(query)
                    if (queryResult.affectedRows == 0) {
                        errorMsgs.push('Operation Failed!')
                        errorMsgs.push('No Rows Found!')
                    } else {
                        windowData.push({
                            url: reqQuery.id,
                            username: reqQuery.author,
                            likes: reqQuery.likes,
                            date_posted: date
                        })
                    }
                } catch (e) {
                    console.error(e)
                    errorMsgs.push('Operation Failed!')
                    errorMsgs.push(e.message)
                }
            }
            break
        case 'delete':
            if (simpleValidate(reqQuery, ['idq'])) {
                let query = `DELETE FROM Post WHERE url="${reqQuery.idq}";`
                try {
                    const queryResult = await sql.query(query)
                    if (queryResult.affectedRows == 0) {
                        errorMsgs.push('Operation Failed!')
                        errorMsgs.push('No Rows Found!')
                    }
                } catch(e) {
                    console.error(e)
                    errorMsgs.push('Operation Failed!')
                    errorMsgs.push(e.message)
                }
            }
            break
        case 'advanced':
            let query = 'SELECT username, AVG(likes) AS likes FROM Post GROUP BY username HAVING AVG(likes) > (SELECT AVG(likes) FROM Post);'
            try {
                const result = await sql.query(query)
                for (const row of result) {
                    windowData.push({
                        username: row.username,
                        likes: row.likes
                    })
                }
            } catch(e) {
                console.error(e)
                errorMsgs.push('Operation Failed!')
                errorMsgs.push(e.message)
            }
            break
        }
    const r = await sql.query('SELECT COUNT(*) AS numPosts, FLOOR(AVG(likes)) AS avgLikes FROM Post LIMIT 1;')
    res.render('posts', {numPosts: r[0].numPosts, avgLikes: r[0].avgLikes, errors: errorMsgs, windowData:windowData})
})


const simpleValidate = (query, vals) => {
    for (const val of vals) {
        if (!query.hasOwnProperty(val) || query[val] === '') {
            return false
        }
    }
    return true
}

module.exports = router