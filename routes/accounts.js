const router = require('express').Router()
const sql = require('../helpers/db')

router.get('/', async (req, res) => {
    const reqQuery = req.query
    let errorMsgs = []
    let windowData = []
    switch (reqQuery.qt) {
        case 'create':
            // TODO: Better Validation
            if (simpleValidate(reqQuery, ['username', 'name', 'password', 'currFollowerCt', 'currFollowingCt', 'numPosts'])) {
                let query = `INSERT INTO Accounts (username, name, password, current_follower_count, 
                    current_following_count, number_of_posts) VALUES ("${reqQuery.username}", "${reqQuery.name}",
                    "${reqQuery.password}", "${reqQuery.currFollowerCt}", "${reqQuery.currFollowingCt}",
                    "${reqQuery.numPosts}");`
                try {
                    await sql.query(query)
                    windowData.push({
                        username: reqQuery.username,
                        name: reqQuery.name,
                        password: reqQuery.password
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
                let query = `SELECT * FROM Accounts WHERE username LIKE "%${reqQuery.usr.trim()}%";`
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
            if (simpleValidate(reqQuery, ['username', 'password'])) {
                let query = `UPDATE Accounts SET password="${reqQuery.password}" WHERE username="${reqQuery.username}"`
                try {
                    const queryResult = await sql.query(query)
                    if (queryResult.affectedRows == 0) {
                        errorMsgs.push('Operation Failed!')
                        errorMsgs.push('No Rows Found!')
                    } else {
                        windowData.push({
                            username: reqQuery.username,
                            password: reqQuery.password
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
            if (simpleValidate(reqQuery, ['username'])) {
                let query = `DELETE FROM Accounts WHERE username="${reqQuery.username}";`
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
            let query = 'SELECT z.username AS username, z.ratio AS theRatio FROM ((SELECT x.username, x.the_count_follower, y.the_count_following, x.the_count_follower/y.the_count_following AS ratio FROM (SELECT username, COUNT(*) AS the_count_follower FROM followers GROUP BY username) AS x JOIN (SELECT username, COUNT(*) AS the_count_following FROM following GROUP BY username) AS y ON x.username = y.username)) AS z WHERE z.ratio >= 15 LIMIT 5;'
            try {
                const result = await sql.query(query)
                for (const row of result) {
                    windowData.push({
                        username: row.username,
                        ratio: row.theRatio
                    })
                }
            } catch(e) {
                console.error(e)
                errorMsgs.push('Operation Failed!')
                errorMsgs.push(e.message)
            }
            break
        }
    const r = await sql.query('SELECT COUNT(*) AS numPosts FROM Accounts LIMIT 1;')
    res.render('accounts', {numPosts: r[0].numPosts, errors: errorMsgs, windowData:windowData})
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