const express = require('express')
const app = express()
const PORT = 3000

const fs = require('fs')

app.get('/coordinates', (req, res) => {
  readCoords()
    .then(coords => {
      res.status = 200
      res.send({
        status: 'Ok',
        result: coords
      })
    })
    .catch(err => {
      res.status = 500
      res.send({
        status: 'Error',
        result: err
      })
    })


})

app.listen(PORT, () => {
  console.log(`Reader listining on port ${PORT}...`)
})

const readCoords = () => {
  return new Promise((resolve, reject) => {
    fs.readFile('./test.txt', (err, data) => {
      if (err) {
        reject(new Error(err))
      } else {
        const dataStr = data.toString()
        const dataArr = dataStr.split('\r\n')
        const dataPairArr = dataArr.map(pair => {
          const pairStr = pair.split(',')
          const pairFloat = pairStr.map(str => parseFloat(str))
          return pairFloat
        })
        const lonLat = dataPairArr.map(pair => degrees2meters(pair[0], pair[1]))
        resolve(lonLat)
      }
    })
  })
}

const degrees2meters = (lon, lat) => {
  var x = lon * 20037508.34 / 180;
  var y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
  y = y * 20037508.34 / 180;
  return [x, y]
}