'use strict';
var turf = require('turf');

module.exports = function(tileLayers, tile, writeData, done) {
  var largest = {
    'length': 0,
    'feature': {}
  };
  var layer = tileLayers.osm.osm;
  var accidents = tileLayers.accidentTiles.accident;

  var osmResult = layer.features.filter(function(val) {
    if (val.properties.footway && val.properties.footway === 'crossing'){
     return true;
   }
 });

  var featureWithAccidents = [];

  osmResult.forEach(function(feature) {
    var accidentsInBuffer = 0;
    var buffer = turf.buffer(feature, 10, 'meters');
    accidents.features.forEach(function(accident) {
      if(turf.inside(accident, buffer)) {
          accidentsInBuffer += 1;
      }
    });
    feature.properties.accidentsInBuffer = accidentsInBuffer;
  });


  // write all roundabouts to stdout
  if (osmResult.length > 0) {
    var fc = turf.featureCollection(osmResult);
    writeData(JSON.stringify(fc) + '\n');
  }

  done(null, largest);
};
