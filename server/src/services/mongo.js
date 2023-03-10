const mongoose = require('mongoose')

const MONGO_URL = process.env.MONGO_URL;

mongoose.connection.once('open' , () => {
    console.log('mongodb connected')
})

mongoose.connection.on('err' , (err) => {
    console.error(err)
})

async function connectToMongo() {
    await mongoose.connect(MONGO_URL)
}

async function mongoDisconnect() {
    await mongoose.disconnect();
}

module.exports = {
    connectToMongo,
    mongoDisconnect,
}