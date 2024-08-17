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
var currentObject = null; // Håller det aktuella objektet som inte är sparat än
var addedObjects = [];

function selectType(type, iconSrc) {
    // Rensa formuläret och visa startmeddelandet
    clearFormData();
    closeAllObjectDetails();
    document.getElementById('categoryInput').value = type;
    document.getElementById('formTitle').innerText = 'Lägg till ' + type;
    document.getElementById('startMessage').style.display = 'none';
    document.getElementById('nameInput').placeholder = 'Namn på ' + type.toLowerCase();
    document.getElementById('urlInput').placeholder = type + ' hemsida/facebook';
    centerMarker.src = iconSrc;
    centerMarkerContainer.style.display = 'block';
    confirmButton.style.display = 'block';
}

function confirmPosition() {
    var center = map.getCenter();
    currentLat = center.lat.toString();
    currentLng = center.lng.toString();

    if (currentLat && currentLng) {
        document.getElementById('latitudeInput').value = currentLat;
        document.getElementById('longitudeInput').value = currentLng;

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
        confirmButton.style.display = 'none';
        openInputForm();
    } else {
        console.error("Kunde inte få tag på latitud och longitud.");
    }
}

function openInputForm() {
    document.getElementById('inputForm').style.display = 'block';
    document.getElementById('cancelBtn').style.display = 'block';
}

function addObject() {
    // Få fälten från formuläret
    var name = document.getElementById('nameInput').value;
    var url = document.getElementById('urlInput').value;
    var info = document.getElementById('infoInput').value;

    if (name.trim() === "") {
        alert("Vänligen ange ett namn för objektet.");
        return;
    }

    // Skapa ett nytt element för det tillagda objektet
    var addedObjectsList = document.getElementById('addedObjectsList');
    var newObject = document.createElement('div');
    newObject.classList.add('object-tab');
    
    newObject.innerHTML = `
        <div class="object-header">${name}</div>
        <div class="object-details">
            <p><strong>Namn:</strong> ${name}</p>
            <p><strong>URL:</strong> ${url}</p>
            <p><strong>Info:</strong> ${info}</p>
            <button onclick="removeObject(this)">Ta bort</button>
        </div>
    `;

    // Lägg till det nya objektet i listan
    addedObjectsList.appendChild(newObject);

    // Rensa fälten i formuläret
    document.getElementById('nameInput').value = "";
    document.getElementById('urlInput').value = "";
    document.getElementById('infoInput').value = "";

    // Uppdatera "Skicka objekt"-knappen
    updateSubmitButton();
}

function removeObject(button) {
    // Ta bort objektet
    var objectTab = button.parentNode.parentNode;
    objectTab.remove();

    // Uppdatera "Skicka objekt"-knappen
    updateSubmitButton();
}

function updateSubmitButton() {
    var submitButton = document.getElementById('submitBtn');
    var addedObjectsList = document.getElementById('addedObjectsList');

    // Aktivera knappen om det finns minst ett objekt i listan, annars inaktivera
    if (addedObjectsList.children.length > 0) {
        submitButton.disabled = false;
    } else {
        submitButton.disabled = true;
    }
}

function toggleObjectDetails(headerElement) {
    var details = headerElement.nextElementSibling;
    details.style.display = details.style.display === "none" ? "block" : "none";
}

function closeAllObjectDetails() {
    var detailsElements = document.querySelectorAll('.object-details');
    detailsElements.forEach(function(details) {
        details.style.display = 'none';
    });
}

function clearFormData() {
    document.getElementById('nameInput').value = '';
    document.getElementById('urlInput').value = '';
    document.getElementById('infoInput').value = '';
    document.getElementById('latitudeInput').value = '';
    document.getElementById('longitudeInput').value = '';
}

document.getElementById('suggestionForm').onsubmit = function(event) {
    if (document.getElementById('submitBtn').disabled) {
        event.preventDefault();
        alert("Lägg till minst ett objekt innan du skickar.");
    } else {
        alert("Formuläret skickas...");
        // Här kan du lägga till mer logik för vad som händer när formuläret skickas
    }
};

window.onload = function() {
    document.getElementById('startMessage').style.display = 'block';
    document.getElementById('addedObjectsList').style.display = 'block'; // Säkerställ att redigeringslistan alltid visas
    updateSubmitButton();
};
