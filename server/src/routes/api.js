const express = require('express')
const planets = require("./planets/planets.router");
const launches = require("./launches/launches.router");

const api = express.Router()

api.use('/planets', planets)
api.use('/launches', launches)

module.exports = api