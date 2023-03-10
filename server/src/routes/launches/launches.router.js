const express = require('express')
const { getAllLaunches , addNewLaunches , deleteLaunch } = require('../launches/launches.controller')

const launches = express.Router()

launches.get('/' , getAllLaunches)

launches.post('/' , addNewLaunches)

launches.delete('/:id' , deleteLaunch)

module.exports = launches