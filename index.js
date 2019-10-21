import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import {MultiPoint, Point} from 'ol/geom';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
import {getVectorContext} from 'ol/render';

function degrees2meters(lon,lat) {
    var x = lon * 20037508.34 / 180;
    var y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
    y = y * 20037508.34 / 180;
    return [x, y]
}

function readTextFile(file) {
    let coordinates = []
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                const arr = allText.split('\n')
                const arrPair = arr.map(elem => {
                    const pairStr = elem.split(',');
                    const pairNum = pairStr.map(str => parseFloat(str));
                    return pairNum;
                })
                const metersPair = arrPair.map(coord => degrees2meters(coord[0], coord[1]))
                coordinates = metersPair;
            }
        }
    }
    rawFile.send(null);
    return coordinates;
}

var tileLayer = new TileLayer({
  source: new OSM({ url: 'http://185.252.28.133/hot/{z}/{x}/{y}.png' })
});

var map = new Map({
  layers: [tileLayer],
  target: 'map',
  view: new View({
    center: [6083756.846017, 4024218.446644],
    zoom: 5
  })
});

var imageStyle = new Style({
  image: new CircleStyle({
    radius: 5,
    fill: new Fill({color: 'yellow'}),
    stroke: new Stroke({color: 'blue', width: 3})
  })
});

var headInnerImageStyle = new Style({
  image: new CircleStyle({
    radius: 2,
    fill: new Fill({color: 'blue'})
  })
});

var headOuterImageStyle = new Style({
  image: new CircleStyle({
    radius: 5,
    fill: new Fill({color: 'black'})
  })
});

var n = 100;
var omegaTheta = 30000; // Rotation period in ms
var R = 7e6;
var r = 2e6;
var p = 2e6;
tileLayer.on('postrender', function(event) {
  var vectorContext = getVectorContext(event);
//   var frameState = event.frameState;
//   var theta = 2 * Math.PI * frameState.time / omegaTheta;
//   var coordinates = [];
//   var i;
//   for (i = 0; i < n; ++i) {
//     // var t = theta + 2 * Math.PI * i / n;
//     // var x = (R + r) * Math.cos(t) + p * Math.cos((R + r) * t / r);
//     // var y = (R + r) * Math.sin(t) + p * Math.sin((R + r) * t / r);
//     var x = 100000 * i;
//     coordinates.push([x, 100]);
//   }
  const coordinates = readTextFile(require('./test.txt'))
  
  vectorContext.setStyle(imageStyle);
  vectorContext.drawGeometry(new MultiPoint(coordinates));

  var headPoint = new Point(coordinates[coordinates.length - 1]);

  vectorContext.setStyle(headOuterImageStyle);
  vectorContext.drawGeometry(headPoint);

  vectorContext.setStyle(headInnerImageStyle);
  vectorContext.drawGeometry(headPoint);

  //   map.render();
});

// readTextFile(require('./test.txt'))
map.render();