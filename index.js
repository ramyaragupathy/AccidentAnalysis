'use strict';
var tileReduce = require('tile-reduce');
var path = require('path');

tileReduce({
    zoom: 12,
    map: path.join(__dirname, '/osmFeaturesInBuffer.js'),
    sources: [{
        name: 'osm',
        mbtiles: '../united_states_of_america.mbtiles',
        raw: false
    },
    {
        name: 'accidentTiles',
        mbtiles: '../accident.mbtiles',
        raw: false
    }]
})
.on('reduce', function (hai) {

})
.on('end', function () {

});
