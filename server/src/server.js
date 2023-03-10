const http = require('node:http')
require('dotenv').config();
const app = require('./app')
const { parseCsv } = require('./models/planets.model')
const { connectToMongo } = require('./services/mongo')
const { loadDataFromSpaceXApi } = require('./models/launches.model')

const PORT = process.env.PORT || 8000;

const server = http.createServer(app)

async function runServer(){
   await connectToMongo();
   await parseCsv();
   await loadDataFromSpaceXApi()

    server.listen(PORT , () => {
        console.log(`server started on port ${PORT}`)
    })
}

runServer()