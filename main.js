function init() {

  L.mapbox.accessToken = 'pk.eyJ1Ijoic2Fta2d1ZXJyZXJvIiwiYSI6ImNpZ2xvejdxcTAyMTR1YWtyMm43YTNsc2QifQ.bwV2-5rCqbn5ITvF1F6AJw';
  var map = L.mapbox.map('map', 'mapbox.dark', {
      'zoomControl': false,
      'maxZoom':15,
      'worldCopyJump': true
  }).setView([42.12267, -72.60315], 8);

  // Disable drag and zoom handlers.
  map.dragging.disable();
  map.touchZoom.disable();
  map.doubleClickZoom.disable();
  map.scrollWheelZoom.disable();
  map.keyboard.disable();
  
  // Disable tap handler, if present.
  if (map.tap) map.tap.disable();
  
  var location = {
      radius: 18,
      fillColor: "rgb(0,128,43)",
      color: "#66ff99",
      weight: 5,
      opacity: 1,
      fillOpacity: 0.25,
      dashArray: '5, 5, 1, 5',
      lineCap: 'butt',
  };

  //lovecraft
  var lovecraft = (function() {
        var json = null;
        $.ajax({
            'async': false,
            'global': false,
            'url': 'shapes/lovecraft.geojson',
            'dataType': "json",
            'success': function (data) {
                json = data;
            }
        });
        return json;
  })();

  var newart = document.createElement("article");
  newart.id = 'narrative';

  var newdiv = document.createElement("div");
  newdiv.className = 'sections prose';
  newart.appendChild(newdiv);

  $(document).ready(function() {
  $('article section:first-child').append("<small class='scroll quiet'>Scroll &#x25BE;</small>")
  });

  //attach popup info
  function onEachFeature(feature, layer) {

      name = feature.properties.Name;
      caption = feature.properties.Caption + "<br/>";
      url = '<img src="' + feature.properties.URL + '"/>';
      thumburl = '<img src="' + feature.properties.Thumb_URL + '"/>';

      layer.bindPopup(caption + url);

      var newSec = document.createElement("section");
      var nametitle = document.createElement("h4");
      var imge = document.createElement("img");

      newSec.id = name;
      
      var nametitlecont = document.createTextNode(name);
      nametitle.appendChild(nametitlecont);

      imge.src = thumburl.slice(10, -3);
      imge.className = 'image';

      newSec.appendChild(nametitle)
      newSec.appendChild(imge);
      newdiv.appendChild(newSec);

      document.body.appendChild(newart);
  }

  window.placesLayer = L.geoJson(lovecraft, {

    onEachFeature: onEachFeature,

  }).addTo(map);

  var narrative = document.getElementById('narrative'),
      sections = narrative.getElementsByTagName('section'),
      currentId = '';

  firstsection = $('article section:first-child').attr('id')
  setId(firstsection);

  function setId(newId) {
      // If the ID hasn't actually changed, don't do anything
      if (newId === currentId) return;
      // Otherwise, iterate through layers, setting the current
      // marker to a different color and zooming to it.
      placesLayer.eachLayer(function(layer) {
          if (layer.feature.properties.Name === newId) {
              map.setView(layer.getLatLng(), layer.feature.properties.zoom || 8);
              layer.setIcon(L.icon({
                  'iconUrl':'icon/cthulhudroid.png',
                  'iconSize' : [80, 80],
              }));
          } else {
              layer.setIcon(L.icon({

                  'iconUrl':'icon/cthul.jpg',
                  'iconSize' : [60, 40],
              }));
          }
      });
      // highlight the current section
      for (var i = 0; i < sections.length; i++) {
          sections[i].className = sections[i].id === newId ? 'active' : '';
      }
      // And then set the new id as the current one,
      // so that we know to do nothing at the beginning
      // of this function if it hasn't changed between calls
      currentId = newId;
  }

  narrative.onscroll = function(e) {
      var narrativeHeight = narrative.offsetHeight;
      var newId = currentId;
      // Find the section that's currently scrolled-to.
      // We iterate backwards here so that we find the topmost one.
      for (var i = sections.length-1; i >= 0; i--) {
          var rect = sections[i].getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= narrativeHeight) {
              newId = sections[i].id;
          }
      };
      setId(newId);
  };

  var geojson = {
    Lovecraft : window.placesLayer,
  }

  var baselayers = {
      Dark: L.mapbox.tileLayer('mapbox.dark'),
      Streets: L.mapbox.tileLayer('mapbox.streets'),
      Satellite: L.mapbox.tileLayer('mapbox.satellite'),
      ESRI : L.esri.basemapLayer('Topographic'),
      OpenStreetMap : L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png')
  };

  L.control.layers(baselayers,geojson,{position: 'topright'}).addTo(map);

  var newnav = document.createElement("nav");
  newnav.id = 'menu-ui';
  newnav.className = 'menu-ui';
  document.body.appendChild(newnav);
  var layers = document.getElementById('menu-ui');

  addLayer(window.placesLayer, 'Lovecraft', 1);

  function addLayer(layer, name, zIndex) {
      layer
          .setZIndex(zIndex)
          .addTo(map);

      // Create a simple layer switcher that
      // toggles layers on and off.
      var link = document.createElement('a');
          link.href = '#';
          link.className = 'active';
          link.innerHTML = name;

      link.onclick = function(e) {
          e.preventDefault();
          e.stopPropagation();

          if (map.hasLayer(layer)) {
              map.removeLayer(layer);
              this.className = '';
          } else {
              map.addLayer(layer);
              this.className = 'active';
          }
      };

      layers.appendChild(link);
  }

}
window.onload = init();




