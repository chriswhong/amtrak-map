// sets up my mapbox access token so they can track my usage of their basemap services
mapboxgl.accessToken = 'pk.eyJ1IjoiY3dob25nIiwiYSI6IjAyYzIwYTJjYTVhMzUxZTVkMzdmYTQ2YzBmMTM0ZDAyIn0.owNd_Qa7Sw2neNJbK6zc1A';

var map = new mapboxgl.Map({
  container: 'mapContainer',
  style: 'mapbox://styles/mapbox/light-v9',
  center: [-73.951,40.732169],
  zoom: 13,
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

const LandUseLookup = (code) => {
  switch (code) {
    case 1:
      return {
        color: '#f4f455',
        description: '1 & 2 Family',
      };
    case 2:
      return {
        color: '#f7d496',
        description: 'Multifamily Walk-up',
      };
    case 3:
      return {
        color: '#FF9900',
        description: 'Multifamily Elevator',
      };
    case 4:
      return {
        color: '#f7cabf',
        description: 'Mixed Res. & Commercial',
      };
    case 5:
      return {
        color: '#ea6661',
        description: 'Commercial & Office',
      };
    case 6:
      return {
        color: '#d36ff4',
        description: 'Industrial & Manufacturing',
      };
    case 7:
      return {
        color: '#dac0e8',
        description: 'Transportation & Utility',
      };
    case 8:
      return {
        color: '#5CA2D1',
        description: 'Public Facilities & Institutions',
      };
    case 9:
      return {
        color: '#8ece7c',
        description: 'Open Space & Outdoor Recreation',
      };
    case 10:
      return {
        color: '#bab8b6',
        description: 'Parking Facilities',
      };
    case 11:
      return {
        color: '#5f5f60',
        description: 'Vacant Land',
      };
    case 12:
      return {
        color: '#5f5f60',
        description: 'Other',
      };
    default:
      return {
        color: '#5f5f60',
        description: 'Other',
      };
  }
};



// we can't add our own sources and layers until the base style is finished loading
map.on('style.load', function() {
  //add a button click listener that will control the map
  $('#fly-to-park-slope').on('click', function() {
    map.flyTo({center: [-73.979702, 40.671199], zoom: 12});
    // now show a layer that previously hidden.

  });

  // let's hack the basemap style
  map.setPaintProperty('water', 'fill-color', 'green')
  map.setPaintProperty('background', 'background-color', 'steelblue')

  // this sets up the geojson as a source in the map, which I can use to add visual layers
  map.addSource('greenpoint-pluto', {
    type: 'geojson',
    data: './data/greenpoint-pluto.geojson',
  });

  // add a custom-styled layer for tax lots
  map.addLayer({
    id: 'greenpoint-lots-fill',
    type: 'fill',
    source: 'greenpoint-pluto',
    paint: {
      'fill-opacity': 0.7,
      'fill-color': {
        type: 'categorical',
        property: 'landuse',
        stops: [
            [
              '01',
              LandUseLookup(1).color,
            ],
            [
              "02",
              LandUseLookup(2).color,
            ],
            [
              "03",
              LandUseLookup(3).color,
            ],
            [
              "04",
              LandUseLookup(4).color,
            ],
            [
              "05",
              LandUseLookup(5).color,
            ],
            [
              "06",
              LandUseLookup(6).color,
            ],
            [
              "07",
              LandUseLookup(7).color,
            ],
            [
              "08",
              LandUseLookup(8).color,
            ],
            [
              "09",
              LandUseLookup(9).color,
            ],
            [
              "10",
              LandUseLookup(10).color,
            ],
            [
              "11",
              LandUseLookup(11).color,
            ],
          ]
        }
    }
  }, 'waterway-label')

  // let's do some interactivity
  map.on('mousemove', function (e) {
    var features = map.queryRenderedFeatures(e.point, {
        layers: ['greenpoint-lots-fill'],
    });

    // get the first feature from the array of returned features.
    var lot = features[0]

    if (lot) {
      var landuseDescription = LandUseLookup(parseInt(lot.properties.landuse)).description;

      $('#address').text(lot.properties.address);
      $('#landuse').text(landuseDescription);
    } else {

    }
  })
})
