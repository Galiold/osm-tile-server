import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import {
  MultiPoint,
  Point
} from 'ol/geom';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import {
  Circle as CircleStyle,
  Fill,
  Stroke,
  Style
} from 'ol/style';
import {
  getVectorContext
} from 'ol/render';
import XYZ from 'ol/source/XYZ'
import { setInterval } from 'timers';

function httpGetAsync(theUrl, callback) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function () {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
      callback(xmlHttp.responseText);
  }
  xmlHttp.open("GET", theUrl, true); // true for asynchronous 
  xmlHttp.send(null);
}

var tileLayer = new TileLayer({
  source: new XYZ({
    url: 'http://localhost:8080/styles/osm-bright/{z}/{x}/{y}.png' +
      '?apiKey=WyI2YzM4YTAzNS01MGRiLTQ1YzMtOTRjNC03YmRlYjE0ZjA4MmIiLCItMSIsODEyN10.XbcggA.r0pUnagLql-0daR8BFDW68pYKmE'
  })
});

var map = new Map({
  layers: [tileLayer],
  target: 'map',
  view: new View({
    center: [6636396.549632117, 4341896.0510656107],
    zoom: 13
  })
});

var imageStyle = new Style({
  image: new CircleStyle({
    radius: 5,
    fill: new Fill({
      color: 'yellow'
    }),
    stroke: new Stroke({
      color: 'blue',
      width: 3
    })
  })
});

var headInnerImageStyle = new Style({
  image: new CircleStyle({
    radius: 2,
    fill: new Fill({
      color: 'blue'
    })
  })
});

var headOuterImageStyle = new Style({
  image: new CircleStyle({
    radius: 5,
    fill: new Fill({
      color: 'black'
    })
  })
});

let coordinates = []

setInterval(() => {
  httpGetAsync('http://localhost:3000/coordinates', (response) => {
    const body = JSON.parse(response)
    coordinates = body.result
    map.render()
  })
}, 1000);

tileLayer.on('postrender', function (event) {
  if (coordinates) {
    
  var vectorContext = getVectorContext(event);
  vectorContext.setStyle(imageStyle);
  vectorContext.drawGeometry(new MultiPoint(coordinates));

  var headPoint = new Point(coordinates[coordinates.length - 1]);

  vectorContext.setStyle(headOuterImageStyle);
  vectorContext.drawGeometry(headPoint);

  vectorContext.setStyle(headInnerImageStyle);
  vectorContext.drawGeometry(headPoint);
  }
});

map.render();