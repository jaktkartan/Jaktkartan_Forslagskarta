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

function selectType(type, iconSrc) {
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

        // Skapa en ny markör och spara den i lastMarker
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
    var name = document.getElementById('nameInput').value;
    var url = document.getElementById('urlInput').value;
    var info = document.getElementById('infoInput').value;

    if (name.trim() === "") {
        alert("Vänligen ange ett namn för objektet.");
        return;
    }

    var addedObjectsList = document.getElementById('addedObjectsList');
    var newObject = document.createElement('div');
    newObject.classList.add('object-tab');
    
    newObject.innerHTML = `
        <div class="object-header" onclick="toggleObjectDetails(this)">
            ${name}
        </div>
        <div class="object-details">
            <p><strong>Namn:</strong> <input type="text" value="${name}" oninput="updateObjectData(this, 'name')"></p>
            <p><strong>URL:</strong> <input type="text" value="${url}" oninput="updateObjectData(this, 'url')"></p>
            <p><strong>Info:</strong> <textarea oninput="updateObjectData(this, 'info')">${info}</textarea></p>
            <button onclick="removeObject(this)">Ta bort</button>
        </div>
    `;

    addedObjectsList.appendChild(newObject);

    document.getElementById('inputContainer').style.display = 'none';
    document.getElementById('addObjectBtn').style.display = 'none';
    document.getElementById('addMoreBtn').style.display = 'block';
    document.getElementById('submitBtn').style.display = 'block';

    updateSubmitButton();
}

function removeObject(button) {
    var objectTab = button.parentNode.parentNode;
    objectTab.remove();
    updateSubmitButton();
}

function toggleObjectDetails(headerElement) {
    var details = headerElement.nextElementSibling;
    details.style.display = details.style.display === "none" || details.style.display === "" ? "block" : "none";
}

function updateObjectData(inputElement, field) {
    var objectHeader = inputElement.closest('.object-tab').querySelector('.object-header');
    var newValue = inputElement.value;
    if (field === 'name') {
        objectHeader.textContent = newValue;
    }
    // Uppdatera andra fält vid behov
}

function showInputFields() {
    document.getElementById('inputContainer').style.display = 'block';
    document.getElementById('addObjectBtn').style.display = 'block';
    document.getElementById('addMoreBtn').style.display = 'none';

    // Visa startmeddelandet och dölja det aktuella formuläret
    document.getElementById('inputForm').style.display = 'none';
    document.getElementById('startMessage').style.display = 'block';
    centerMarkerContainer.style.display = 'none';
    confirmButton.style.display = 'none';
}

function cancelAndRemove() {
    // Ta bort senaste marker från kartan
    if (lastMarker) {
        map.removeLayer(lastMarker);
        lastMarker = null;
    }

    // Återställ formulär och visa startvyn
    clearFormData();
    document.getElementById('inputForm').style.display = 'none';
    document.getElementById('startMessage').style.display = 'block';
    centerMarkerContainer.style.display = 'none';
    confirmButton.style.display = 'none';
}

function updateSubmitButton() {
    var submitButton = document.getElementById('submitBtn');
    var addedObjectsList = document.getElementById('addedObjectsList');

    if (addedObjectsList.children.length > 0) {
        submitButton.disabled = false;
    } else {
        submitButton.disabled = true;
        submitButton.style.display = 'none';
    }
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
    }
};

window.onload = function() {
    document.getElementById('startMessage').style.display = 'block';
    document.getElementById('addedObjectsList').style.display = 'block';
    updateSubmitButton();
};
