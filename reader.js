const rp = require('request-promise')
const request = require('sync-request')
const express = require('express')
const csv = require('csv-parser')
const fs = require('fs')

const app = express()
const mqtt = require('mqtt')
// const client = mqtt.connect('mqtt://52.59.39.27')
const client = mqtt.connect('mqtt://broker.hivemq.com')

const PORT = 3000
const FILE_PATH = './test.csv'

// var client  = mqtt.connect('mqtt://107.174.20.113')
 
client.on('connect', function () {
  client.subscribe('testing_mqtt', function (err) {
    if (err) {
      // client.publish('presence', 'Hello mqtt')
      console.log(err)
    }
  })
})
 
let newData = []
client.on('message', function (topic, message) {
  // message is Buffer
  // console.log('packet recieved');
  
  // console.log(message.toString());
  
  let packets = message.toString().split('*')
  packets = packets.map(packet => packet.split(','))
  // console.log(packets)
  packets.forEach(packet => {
    newData.push([packet[1], packet[0]])
  })
  console.log(newData);
  
  // console.log(packets.length) // 11 or 61
  // console.log(packets)
  // client.end()
})


app.get('/coordinates', (_req, res) => {
  console.log('Request for file recieved.')

//   // readCoords(FILE_PATH)
//   //   .then(coords => {
//   //     res.statusCode = 200
//   //     res.send({
//   //       status: 'Ok',
//   //       result: coords
//   //     })
//   //   })
//   //   .catch(err => {
//   //     res.statusCode = 500
//   //     res.send({
//   //       status: 'Error',
//   //       message: err
//   //     })
//   //   })

  let coords = readCoords(FILE_PATH)
  // console.log(coords)
  res.statusCode = 200
  res.send({
    status: 'Ok',
    result: coords
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
  // const results = []
  // return new Promise((resolve, reject) => {
  //   fs.createReadStream(file)
  //     .on('error', err => reject(err))
  //     .pipe(csv())
  //     .on('data', (data) => results.push(data))
  //     .on('error', (err) => reject(err))
  //     .on('end', () => {
  //       let processedPoints = []
  //       results.forEach(point => {
  //         let res = request('GET', `http://localhost:5000/nearest/v1/car/${point.Lon},${point.Lat}`)
  //         processedPoints.push(JSON.parse(res.getBody()).waypoints[0].location)
  //       })
  //         const coords = processedPoints.map(point => degrees2meters(parseFloat(point[0]), parseFloat(point[1])))
  //         resolve(coords)
        
  //     })
  // })
  if (newData.length > 0){
    let processedPoints = []
    newData.forEach(point => {
      let res = request('GET', `http://localhost:5000/nearest/v1/car/${point[0]},${point[1]}`)
      processedPoints.push(JSON.parse(res.getBody()).waypoints[0].location)
    })
    let coords = processedPoints.map(point => degrees2meters(parseFloat(point[0]), parseFloat(point[1])))
    newData = []
    return coords
  } else {
    return []
  }
}

const degrees2meters = (lon, lat) => {
  var x = lon * 20037508.34 / 180;
  var y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
  y = y * 20037508.34 / 180;
  return [x, y]
}