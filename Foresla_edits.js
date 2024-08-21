// URLs till GeoJSON-filerna
var layerURLs = {
    'Mässor': ['https://raw.githubusercontent.com/jaktkartan/jaktkartan/main/bottom_panel/Upptack/geojsonfiler/Massor.geojson'],
    'Jaktkort': ['https://raw.githubusercontent.com/jaktkartan/jaktkartan/main/bottom_panel/Upptack/geojsonfiler/jaktkort.geojson'],
    'Jaktskyttebanor': ['https://raw.githubusercontent.com/jaktkartan/jaktkartan/main/bottom_panel/Upptack/geojsonfiler/jaktskyttebanor.geojson']
};

// Stil för markörer
var layerStyles = {
    'Mässor': {
        iconUrl: 'bilder/ikon_massor.png',
        iconSize: [40, 40]
    },
    'Jaktkort': {
        iconUrl: 'bilder/ikon_jaktkort.png',
        iconSize: [40, 40]
    },
    'Jaktskyttebanor': {
        iconUrl: 'bilder/ikon_jaktskyttebanor.png',
        iconSize: [40, 40]
    }
};

// Funktion för att ladda GeoJSON-data och visa den på kartan
function loadGeoJSONData() {
    Object.keys(layerURLs).forEach(function(layerName) {
        layerURLs[layerName].forEach(function(url) {
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    var layer = L.geoJSON(data, {
                        pointToLayer: function(feature, latlng) {
                            var icon = L.icon({
                                iconUrl: layerStyles[layerName].iconUrl,
                                iconSize: layerStyles[layerName].iconSize
                            });
                            return L.marker(latlng, { icon: icon });
                        },
                        onEachFeature: function(feature, layer) {
                            layer.on('click', function() {
                                alert(`Du klickade på ett ${layerName.toLowerCase()}. Mer funktionalitet kommer snart.`);
                            });
                        }
                    }).addTo(map);
                })
                .catch(error => console.error('Error loading GeoJSON:', error));
        });
    });
}
