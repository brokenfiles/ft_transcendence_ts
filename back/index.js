// loading express from node_modules
const express =  require('express')
// init express app
const app = express()
// loading env variables
require('dotenv').config()

// temporary : respond on / path
app.get('/', (req, res) => {
    res.send(`c'est good`)
})

// listen on the env port
app.listen(process.env.PORT, () => {
    // callback when the listen is done
    console.log(`Listening on ${process.env.PORT}`)
})
