const { getAllPlanetsFromModel } = require('../../models/planets.model')

const getAllPlanets = async function(req , res){
    return res.status(200).json(await getAllPlanetsFromModel())
}

module.exports = {
    getAllPlanets
}