const config = {
    db: {
        host: process.env.DB_DOMAIN,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    }
}
module.exports = config