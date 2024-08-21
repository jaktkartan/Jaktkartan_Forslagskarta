// Initiera kartan och klustergrupper
var map = L.map('map', {
    scrollWheelZoom: true,
    zoomControl: true
}).setView([62.0, 15.0], 5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Funktion för att lägga till markörer på kartan
function addMarker(lat, lng, iconUrl) {
    var icon = L.icon({
        iconUrl: iconUrl,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
    });

    lastMarker = L.marker([lat, lng], { icon: icon }).addTo(map);
    markers.push(lastMarker);
}
