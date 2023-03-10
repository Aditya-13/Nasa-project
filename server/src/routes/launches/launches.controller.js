const { getLaunches, addNewLaunchtoDB, isLaunchExists, abortLaunchById } = require("../../models/launches.model");
const { getPagination } = require("../../services/query")

async function getAllLaunches(req, res) {
    const { skip, limit } = getPagination(req.query)
    const launches = await getLaunches(skip, limit)
    return res.status(200).json(launches)
}

async function addNewLaunches(req, res) {
    const launch = req.body

    if (!launch.mission || !launch.rocket || !launch.launchDate || !launch.destination){
        return res.status(400).json({
            error : 'Missing Information'
        })
    }

    launch.launchDate = new Date(launch.launchDate)
    if (isNaN(launch.launchDate)){
            return res.status(400).json({
                "error" : "Invalid Date"
            })
    } 
    
    await addNewLaunchtoDB(launch)
    return res.status(201).json(launch)

}

async function deleteLaunch(req, res){
    const id = +req.params.id
    const launchExistsCheck = await isLaunchExists(id)

    if (!launchExistsCheck){
        return res.status(404).json({
            error : 'Launch Doesn\'t Exist'
        })
    }
    
    const abortedLaunch = await abortLaunchById(id)

    if (!abortedLaunch) {
        return res.status(400).json({
            error: 'Launch Not Aborted'
        })
    }

    return res.status(200).json({
        ok: true
    })
}

module.exports = {
    getAllLaunches,
    addNewLaunches,
    deleteLaunch
}