var map = L.map('map', {
    scrollWheelZoom: true,
    zoomControl: true
}).setView([62.0, 15.0], 5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var currentLat, currentLng;
var centerMarker = document.getElementById('centerMarker');
var centerMarkerContainer = document.getElementById('centerMarkerContainer');
var confirmButton = document.getElementById('confirmButton');
var lastMarker = null;
var addedObjects = [];

function selectType(type, iconSrc) {
    document.getElementById('categoryInput').value = type;
    document.getElementById('formTitle').innerText = 'Lägg till ' + type;
    document.getElementById('startMessage').style.display = 'none';

    // Uppdatera placeholders
    document.getElementById('nameInput').placeholder = 'Namn på ' + type.toLowerCase();
    document.getElementById('urlInput').placeholder = type + ' hemsida/facebook';

    centerMarker.src = iconSrc;
    centerMarkerContainer.style.display = 'block';
    confirmButton.style.display = 'block';  // Se till att knappen visas
}

function confirmPosition() {
    console.log("Placera-knappen klickades"); // För felsökning

    var center = map.getCenter();
    currentLat = center.lat.toString(); // Konvertera till sträng utan att avrunda
    currentLng = center.lng.toString(); // Konvertera till sträng utan att avrunda

    var latitudeInput = document.getElementById('latitudeInput');
    var longitudeInput = document.getElementById('longitudeInput');

    if (latitudeInput && longitudeInput) {
        latitudeInput.value = currentLat;
        longitudeInput.value = currentLng;

        var icon = L.icon({
            iconUrl: centerMarker.src,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
        });

        if (lastMarker) {
            map.removeLayer(lastMarker);
        }

        lastMarker = L.marker([currentLat, currentLng], { icon: icon }).addTo(map);

        centerMarkerContainer.style.display = 'none';
        confirmButton.style.display = 'none';  // Knappen ska försvinna efter bekräftelse

        openInputForm();
    } else {
        console.error("latitudeInput eller longitudeInput kunde inte hittas.");
    }
}

function openInputForm() {
    document.getElementById('inputForm').style.display = 'block';
}

function addAnotherObject() {
    var category = document.getElementById('categoryInput').value;
    var name = document.getElementById('nameInput').value;
    var url = document.getElementById('urlInput').value || "Ingen URL angiven";
    var info = document.getElementById('infoInput').value;

    if (name) {
        addedObjects.push({
            category: category,
            name: name,
            url: url,
            info: info,
            lat: currentLat,
            lng: currentLng
        });

        var addedObjectsList = document.getElementById('addedObjectsList');
        var listItem = document.createElement('div');
        listItem.innerHTML = `<strong>${category}</strong>: ${name} - ${currentLat}, ${currentLng}`;
        addedObjectsList.appendChild(listItem);

        // Rensa inmatningsfälten
        document.getElementById('nameInput').value = '';
        document.getElementById('urlInput').value = '';
        document.getElementById('infoInput').value = '';

        // Visa startrutan igen för att välja en ny typ av objekt
        closeInputForm();
        lastMarker = null;
        document.getElementById('startMessage').style.display = 'block';
        centerMarkerContainer.style.display = 'none';
        confirmButton.style.display = 'none';
    }
}

document.getElementById('suggestionForm').onsubmit = function(event) {
    event.preventDefault();  // Förhindra standard formulärinlämning

    var category = document.getElementById('categoryInput').value;
    var name = document.getElementById('nameInput').value;
    var url = document.getElementById('urlInput').value || "Ingen URL angiven";
    var info = document.getElementById('infoInput').value;

    // Lägg till objektet till addedObjects-arrayen
    addedObjects.push({
        category: category,
        name: name,
        url: url,
        info: info,
        lat: currentLat,
        lng: currentLng
    });

    // Skicka varje objekt
    addedObjects.forEach(function(object) {
        var formData = new FormData();
        formData.append('typ', object.category || 'Ingen typ angiven');
        formData.append('namn', object.name);
        formData.append('url', object.url);
        formData.append('info', object.info);
        formData.append('latitud', object.lat);
        formData.append('longitud', object.lng);

        fetch(document.getElementById('suggestionForm').action, {
            method: "POST",
            body: formData,
        }).then(response => {
            return response.text();
        }).then(text => {
            console.log(text);  // Kontrollera svaret från servern
        }).catch(error => {
            console.error('Ett nätverksfel uppstod:', error);
        });
    });

    // Visa tackmeddelandet
    showThankYouMessage();
};

function showThankYouMessage() {
    closeInputForm();  // Stäng inmatningsrutan
    document.getElementById('thankYouMessage').style.display = 'block'; // Visa tackmeddelandet
}

function closeInputForm() {
    document.getElementById('inputForm').style.display = 'none';
}

function cancelAndRemove() {
    if (lastMarker) {
        map.removeLayer(lastMarker);
        lastMarker = null;
    }

    closeInputForm();
    document.getElementById('startMessage').style.display = 'block';
}

function addNewSuggestion() {
    closeThankYouMessage();
    location.reload();  // Laddar om sidan
}

function closeThankYouMessage() {
    document.getElementById('thankYouMessage').style.display = 'none';
}

function goToJaktkartan() {
    window.location.href = 'https://www.jaktkartan.se';
}

window.onload = function() {
    document.getElementById('startMessage').style.display = 'block';
};
