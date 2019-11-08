const express = require('express')
const app = express()

const csv = require('csv-parser')
const fs = require('fs')

const PORT = 3000
const FILE_PATH = './test.txt'

app.get('/coordinates', (_req, res) => {
  console.log('Request for file recieved.')

  readCoords(FILE_PATH)
    .then(coords => {
      res.statusCode = 200
      res.send({
        status: 'Ok',
        result: coords
      })
    })
    .catch(err => {
      res.statusCode = 500
      res.send({
        status: 'Error',
        message: err
      })
    })
})

app.listen(PORT, () => {
  console.log(`Reader listining on port ${PORT}...`)
})

/**
 * Read points from the given text file
 * 
 * A `list` is returned which includes all the pair
 * coordinations from the text file, converted from
 * EPSG:3857 to EPSG:4326 format, so that they can
 * be shown on the XYZ map.
 * 
 * @param {String} file - The path to the text file
 * @returns {Promise} A promise
 * resolving for a list containing the coordinations
 * 
 * @example
 *    
 *  readCoords('./coordinations.txt')
 */
const readCoords = (file) => {
  const results = []
  return new Promise((resolve, reject) => {
    fs.createReadStream(file)
      .on('error', err => reject(err))
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('error', (err) => reject(err))
      .on('end', () => {
        const coords = results.map(point => degrees2meters(parseFloat(point.Lon), parseFloat(point.Lat)))
        resolve(coords)
      })
  })
}


const degrees2meters = (lon, lat) => {
  var x = lon * 20037508.34 / 180;
  var y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
  y = y * 20037508.34 / 180;
  return [x, y]
}