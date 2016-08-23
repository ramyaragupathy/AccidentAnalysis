'use strict';
var turf = require('turf');

module.exports = function(tileLayers, tile, writeData, done) {
  var largest = {
    'length': 0,
    'feature': {}
  };
  var layer = tileLayers.osm.osm;
  var accidents = tileLayers.accidentTiles.accident;

  accidents.features.forEach(function(accidentFeature) {
      accidentFeature.properties = {
          'state': accidentFeature.properties.state,
          'crashNum': accidentFeature.properties.crashNum,
          'fatalities': accidentFeature.properties.fatalities
      };
      var accidentBuffer = turf.buffer(accidentFeature, 100, 'meters');
      layer.features.forEach(function(osmFeature) {
          var keys = Object.keys(accidentFeature.properties);
          if (osmFeature.properties.amenity) {
              var intersect = turf.intersect(accidentBuffer, osmFeature);
              if (intersect && intersect.geometry.type === 'Polygon' && (turf.area(intersect) >= (turf.area(osmFeature) * 0.5))) {
                  if (keys.indexOf(osmFeature.properties.amenity) === -1) {
                      accidentFeature.properties[osmFeature.properties.amenity + 'Count'] = 0;
                      accidentFeature.properties[osmFeature.properties.amenity + 'Name'] = [];
                      accidentFeature.properties[osmFeature.properties.amenity + 'ID'] = [];
                  } else {
                      accidentFeature.properties[osmFeature.properties.amenity + 'Count']++;
                      accidentFeature.properties[osmFeature.properties.amenity + 'Name'].push(osmFeature.properties.name);
                      accidentFeature.properties[osmFeature.properties.amenity + 'ID'].push(osmFeature.properties['@id']);
                  }
              }
          }
      });
  });

  // write all roundabouts to stdout
  writeData(JSON.stringify(accidents) + '\n');

  done(null, null);
};
