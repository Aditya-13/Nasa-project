const launchesModel = require('./launches.mongoose');
const planetsModel = require('./planets.mongoose');
const axios = require('axios');

const DEFAULT_LAUNCHES_COUNT = 100;
const SPACEX_API_URL = `https://api.spacexdata.com/v5/launches/query`

async function getLatestFlightNumber() {
    const latestNumber = await launchesModel.findOne().sort("-flightNumber")

    if (!latestNumber) {
        return DEFAULT_LAUNCHES_COUNT
    }

    return latestNumber.flightNumber
}

async function getLaunches(skip, limit) {
    try {        
        return await launchesModel.find({} , {
            "_id" : 0,
            "__v" : 0
        })
        .sort({ flightNumber: 1 })
        .skip(skip)
        .limit(limit)
    } catch (error) {
        console.error(error)
    }
}

async function saveLaunchToDB(launch) {
        try {
            await launchesModel.findOneAndUpdate({
                flightNumber : launch.flightNumber
                },launch,{
                    upsert : true
                })
        } catch (error) {
            console.log(error)
        }
}

const addNewLaunchtoDB = async (launch) => {
    const isPlanetExist = await planetsModel.findOne({
        kepler_name : launch.destination
    })

    if (!isPlanetExist) {
        throw new Error('No matching planet found')
    } else {        
       const newLaunch = Object.assign(launch , {
            flightNumber : (await getLatestFlightNumber()) + 1,
            customers : ['Aditya' , 'Elon Musk'],
            upcoming : true,
            success : true
        })
        await saveLaunchToDB(newLaunch)
    }
}

async function findLaunch(filter) {
    return await launchesModel.findOne(filter)
}

async function isLaunchExists(launchId) {
    return await findLaunch({
        flightNumber : launchId
    })
}

async function abortLaunchById(launchId) {
    const aborted = await launchesModel.updateOne({
        flightNumber : launchId,
    }, {
        upcoming : false,
        success : false
    })
    
    return aborted.acknowledged && aborted.modifiedCount === 1
}

async function loadDataFromSpaceXApi() {
    const isSpaceXlaunchExist = await findLaunch({
        flightNumber : 1,
        rocket : 'Falcon 1',
        mission : 'FalconSat'
    })

    if (isSpaceXlaunchExist) {
        console.log(`SpaceX Launch Data Already Exist!`)
    } else {
        await saveSpaceXDataToDb()
    }
}

async function saveSpaceXDataToDb() {
    const res = await axios.post(SPACEX_API_URL , {
        query: {},
        options: {
            pagination : false,
            populate : [
                {
                path : 'rocket',
                 select : {
                    name : 1
                 }
                },
                {
                    path : 'payloads',
                    select : {
                        customers : 1
                     }
                }
            ]
        }
    })

    if (res.status !== 200) {
        console.log(res)
        console.log('there is a problem, fix it ASAP.')
        throw new Error('Launch Data downloading failed')
    }


    const launchDataToAdd = res.data.docs
    for (launchData of launchDataToAdd) {
        const payloads = launchData['payloads']
        const customers = payloads.flatMap((payload) => {
            return payload['customers']
        })

        const launch = {
            flightNumber : launchData['flight_number'],
            mission : launchData['name'],
            rocket : launchData['rocket']['name'],
            launchDate : launchData['date_local'],
            upcoming : launchData['upcoming'],
            success : launchData['success'],
            customers
        }

        await saveLaunchToDB(launch)

    }
}


module.exports = {
    getLaunches,
    addNewLaunchtoDB,
    isLaunchExists,
    abortLaunchById,
    loadDataFromSpaceXApi
}