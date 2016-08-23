'use strict';
var turf = require('turf');

module.exports = function(tileLayers, tile, writeData, done) {
  var largest = {
    'length': 0,
    'feature': {}
  };
  var osmLayer = tileLayers.osm.osm;
  var accidents = tileLayers.accidentTiles.accident;

  accidents.features.forEach(function(accidentFeature) {
      accidentFeature.properties = {
          'state': accidentFeature.properties.state,
          'crashNum': accidentFeature.properties.crashNum,
          'fatalities': accidentFeature.properties.fatalities
      };
      var accidentBuffer = turf.buffer(accidentFeature, 100, 'meters');
      var keys = Object.keys(accidentFeature.properties);
      osmLayer.features.forEach(function(osmFeature) {
          if (osmFeature.properties.amenity) {
              var flag = false;
              switch(osmFeature.geometry.type) {
                  case 'Point': flag = turf.inside(osmFeature, accidentBuffer);
                        break;
                  case 'Polygon': var intersect = turf.intersect(accidentBuffer, osmFeature);
                         flag = intersect && intersect.geometry.type === 'Polygon' && (turf.area(intersect) >= (turf.area(osmFeature) * 0.5));
                        break;
                  case 'LineString': var featureBuffer = turf.buffer(osmFeature, '0.001', 'meters');
                                     var intersect = turf.intersect(accidentBuffer, featureBuffer);
                        flag = intersect && intersect.geometry.type === 'Polygon' && (turf.area(intersect) >= (turf.area(featureBuffer) * 0.5));
                       break;
              }
              if (flag) {
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
