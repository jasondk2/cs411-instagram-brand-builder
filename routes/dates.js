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
            if (simpleValidate(reqQuery, ['usr', 'flr', 'fling', 'date'])) {
                let date = reqQuery.date
                date = date.split('/')
                date = date[2] + '-' + date[0] + '-' + date[1] 
                let query = `INSERT INTO CountDates VALUES ("${reqQuery.usr}", "${reqQuery.flr}", "${reqQuery.fling}", (DATE "${date}"));`
                try {
                    await sql.query(query)
                    windowData.push({
                        Username: reqQuery.usr,
                        Follower_Count: reqQuery.flr,
                        Following_Count: reqQuery.fling,
                        Date: date
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
                let query = `SELECT * FROM CountDates WHERE Username LIKE "%${reqQuery.usr.trim()}%";`
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
            if (simpleValidate(reqQuery, ['usr', 'date', 'flr', 'fling'])) {
                let date = reqQuery.date
                date = date.split('/')
                date = date[2] + '-' + date[0] + '-' + date[1] 
                let query = `UPDATE CountDates SET Follower_Count="${reqQuery.flr}", Following_Count="${reqQuery.fling}" WHERE Username="${reqQuery.usr}" AND Date=(DATE "${date}");`
                
                try {
                    const queryResult = await sql.query(query)
                    if (queryResult.affectedRows == 0) {
                        errorMsgs.push('Operation Failed!')
                        errorMsgs.push('No Rows Found!')
                    } else {
                        windowData.push({
                            Username: reqQuery.usr,
                            Follower_Count: reqQuery.flr,
                            Following_Count: reqQuery.fling,
                            Date: date
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
            if (simpleValidate(reqQuery, ['usr', 'date'])) {
                let date = reqQuery.date
                date = date.split('/')
                date = date[2] + '-' + date[0] + '-' + date[1] 
                let query = `DELETE FROM CountDates WHERE Username="${reqQuery.usr}" AND Date = (DATE "${date}");`
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
            let query = "SELECT c.Username as usr, MAX(c.Follower_Count) as Highest_Follower_Count, MAX(p.likes) as Highest_Liked_Post FROM CountDates c JOIN Post p on c.Username = p.username WHERE c.Date > '2020-01-01' AND c.Date < '2021-03-30' GROUP BY c.Username;"
            try {
                const result = await sql.query(query)
                for (const row of result) {
                    windowData.push({
                        User: row.usr,
                        HFollower_Count: row.Highest_Follower_Count,
                        Highest_Liked_Post: row.Highest_Liked_Post
                    })
                }
            } catch(e) {
                console.error(e)
                errorMsgs.push('Operation Failed!')
                errorMsgs.push(e.message)
            }
            break
        }
    const r = await sql.query('SELECT COUNT(*) AS numPosts FROM CountDates LIMIT 1;')
    res.render('dates', {numPosts: r[0].numPosts, errors: errorMsgs, windowData:windowData})
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
