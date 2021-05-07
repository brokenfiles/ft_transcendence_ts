const express =  require('express')
const app = express()
require('dotenv').config()

app.get('/', (req, res) => {
    res.send(`c'est good`)
})

app.listen(process.env.PORT, () => {
    console.log(`Listening on ${process.env.PORT}`)
})
