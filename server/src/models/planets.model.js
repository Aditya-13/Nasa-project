const parse = require('csv-parse')
const fs = require('node:fs');
const path = require('node:path')
const planets = require('../models/planets.mongoose')

const habitablePlanets = function(planetObj) {
    return planetObj['koi_disposition'] === 'CONFIRMED'
    && planetObj['koi_insol'] > 0.36 && planetObj['koi_insol'] < 1.11
    && planetObj['koi_prad'] < 1.6;
}

function parseCsv() {   

return new Promise((resolve , reject) => {

    fs.createReadStream(path.join(__dirname , '..' , '..' , 'data' , 'kepler_data.csv')).pipe(parse.parse({
    comment : '#',
    columns : true
}))
.on('data' , async (data) => {
    if (habitablePlanets(data)){
        await createDbDocumentsWithCSVData(data)
    }
})
.on('error' , (err) => {
    console.log(err)
    reject(err)
})
.on('end' , async () =>{
    resolve()
})   
})
}

async function getAllPlanetsFromModel() {
    try {
        return await planets.find({} , {"__v" : 0 , "_id" : 0});
    } catch (error) {
        console.log(error)
    }
}

async function createDbDocumentsWithCSVData(data) {
    try {        
        await planets.updateOne({
            kepler_name : data.kepler_name
        }, {
            kepler_name : data.kepler_name
        }, {
            upsert : true
        })
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    parseCsv,
    getAllPlanetsFromModel
} 