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
    if (val.geometry.type == 'Polygon'){
    if (val.properties.leisure && val.properties.leisure === 'park'){
     return true;
   }
 }
 });

  var featureWithAccidents = [];

  osmResult.forEach(function(feature) {
    var accidentsInBuffer = 0;
    var buffer = turf.buffer(feature, 100, 'meters');
    accidents.features.forEach(function(accident) {
      if(turf.inside(accident, buffer.features[0])) {
          accidentsInBuffer += 1;
      }
    });
    feature.properties.accidentsInBuffer = accidentsInBuffer;
  });


  // write all roundabouts to stdout
  if (osmResult.length > 0) {
    var fc = turf.featurecollection(osmResult);
    writeData(JSON.stringify(fc) + '\n');
  }

  done(null, largest);
};