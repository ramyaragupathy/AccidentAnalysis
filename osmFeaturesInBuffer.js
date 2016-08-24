'use strict';
var turf = require('turf');

module.exports = function (tileLayers, tile, writeData, done) {
    var osmLayer = tileLayers.osm.osm;
    var accidents = tileLayers.accidentTiles.accident;
    if (osmLayer && accidents)
    for (var i=0; i < accidents.features.length; i++) {
    try {
        var accidentFeature = accidents.features[i];
        var accidentBuffer = turf.buffer(accidentFeature, 100, 'meters');
        var keys = Object.keys(accidentFeature.properties);
        osmLayer.features.forEach(function (osmFeature) {
            if (osmFeature.properties.amenity || osmFeature.properties.highway) {
                var flag = false;
                var intersect;
                switch (osmFeature.geometry.type) {
                case 'Point': flag = turf.inside(osmFeature, accidentBuffer);
                    break;
                case 'Polygon': intersect = turf.intersect(accidentBuffer, osmFeature);
                    flag = intersect;
                    break;
                case 'LineString': var featureBuffer = turf.buffer(osmFeature, '0.001', 'meters');
                    intersect = turf.intersect(accidentBuffer, featureBuffer);
                    flag = intersect;
                    break;
                }
                if (flag) {
                    if (osmFeature.properties.amenity) {
                        if (keys.indexOf(osmFeature.properties.amenity) === -1) {
                            accidentFeature.properties[osmFeature.properties.amenity + 'Count'] = 1;
                            accidentFeature.properties[osmFeature.properties.amenity + 'Name'] = [];
                            accidentFeature.properties[osmFeature.properties.amenity + 'ID'] = [];
                        } else {
                            accidentFeature.properties[osmFeature.properties.amenity + 'Count'] += 1;
                            accidentFeature.properties[osmFeature.properties.amenity + 'Name'].push(osmFeature.properties.name);
                            accidentFeature.properties[osmFeature.properties.amenity + 'ID'].push(osmFeature.properties['@id']);
                        }
                    }
                    if (osmFeature.properties.highway) {
                        if (keys.indexOf(osmFeature.properties.highway) === -1) {
                            accidentFeature.properties[osmFeature.properties.highway + 'Count'] = 1;
                            accidentFeature.properties[osmFeature.properties.highway + 'Name'] = [];
                            accidentFeature.properties[osmFeature.properties.highway + 'ID'] = [];
                        } else {
                            accidentFeature.properties[osmFeature.properties.highway + 'Count'] += 1;
                            accidentFeature.properties[osmFeature.properties.highway + 'Name'].push(osmFeature.properties.name);
                            accidentFeature.properties[osmFeature.properties.highway + 'ID'].push(osmFeature.properties['@id']);
                        }
                    }
                }
            }
        });
      } catch (e) {
        continue;
      }
    };

    // write all roundabouts to stdout
    writeData(JSON.stringify(accidents) + '\n');

    done(null, accidents);
};
