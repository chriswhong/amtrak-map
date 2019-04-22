// sets up my mapbox access token so they can track my usage of their basemap services
mapboxgl.accessToken = 'pk.eyJ1IjoiY3dob25nIiwiYSI6IjAyYzIwYTJjYTVhMzUxZTVkMzdmYTQ2YzBmMTM0ZDAyIn0.owNd_Qa7Sw2neNJbK6zc1A';

const mapHeadings = {
  'N': 0,
  'NE': 45,
  'E': 90,
  'SE': 135,
  'S': 180,
  'SW': 225,
  'W': 270,
  'NW': 315,
}

const SQLAPICall = (SQL) => `https://amtk.carto.com/api/v2/sql?q=${SQL}&format=geojson&api_key=bac8df5ef273de9fc3132b053f03513326f65531`;

// instantiate the map
const map = new mapboxgl.Map({
  container: 'mapContainer',
  style: 'mapbox://styles/mapbox/light-v9',
  center: [-101.28, 38.31],
  zoom: 3.35,
  hash: true,
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());


// we can't add our own sources and layers until the base style is finished loading
map.on('style.load', function() {
  $.getJSON(SQLAPICall('SELECT * FROM amtk.vall_ttm_trains'), (trainData) => {
    window.trainData = trainData
    // update headings to be numbers
    trainData.features = trainData.features.map((feature) => {
      feature.properties.heading = mapHeadings[feature.properties.heading];
      return feature;
    });

    map.loadImage('https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Font_Awesome_5_solid_arrow-circle-up.svg/240px-Font_Awesome_5_solid_arrow-circle-up.svg.png', function(error, image) {
      map.addImage('train-marker', image);
      map.addSource('all-ttm-trains', {
        type: 'geojson',
        data: trainData,
      });

      map.addSource('national-routes', {
        type: 'geojson',
        data: SQLAPICall('SELECT * FROM national_route_shape_v16')
      });

      map.addSource('stations', {
        type: 'geojson',
        data: SQLAPICall('SELECT * FROM train_stations')
      });

      map.addLayer({
        id: 'national-routes',
        type: 'line',
        source: 'national-routes',
        paint: {
          'line-color': 'rgba(104, 130, 197, 1)'
        }
      });

      map.addLayer({
        id: 'stations',
        type: 'circle',
        source: 'stations',
        paint: {
          'circle-color': 'rgba(255, 255, 255, 1)',
          'circle-stroke-width': 1,
          'circle-radius': 2
        }
      });

      map.addLayer({
        id: 'all_ttm_trains',
        type: 'symbol',
        source: 'all-ttm-trains',
        layout: {
          "icon-image": "train-marker",
          "icon-size": 0.08,
          'icon-rotate': {
            type: 'identity',
            property: 'heading',
          },
        }
      });
    });

    var popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    });

    map.on('mouseenter', 'all_ttm_trains', function(e) {
      // Change the cursor style as a UI indicator.
      map.getCanvas().style.cursor = 'pointer';

      var coordinates = e.features[0].geometry.coordinates.slice();

      const {
        trainnum,
        routename,
        velocity,
        origcode,
        destcode,
      } = e.features[0].properties;
      var description = `
        ${trainnum} - ${routename} (${parseInt(velocity)}mph)<br/>
        ${origcode} -> ${destcode}
      `;

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      // Populate the popup and set its coordinates
      // based on the feature found.
      popup.setLngLat(coordinates)
        .setHTML(description)
        .addTo(map);
    });

    map.on('mouseleave', 'all_ttm_trains', function() {
      map.getCanvas().style.cursor = '';
      popup.remove();
    });
  });
});
