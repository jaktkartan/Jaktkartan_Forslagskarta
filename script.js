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
    var name = document.getElementById('nameInput').value;
    var url = document.getElementById('urlInput').value || "Ingen URL angiven";
    var info = document.getElementById('infoInput').value;

    if (name && currentLat && currentLng) {
        currentObject = {
            category: document.getElementById('categoryInput').value,
            name: name,
            url: url,
            info: info,
            lat: currentLat,
            lng: currentLng,
            marker: lastMarker
        };

        console.log("Current Object Created:", currentObject);

        addedObjects.push(currentObject);
        addObjectToUI(addedObjects.length - 1);
        currentObject = null;

        updateSubmitButton();

        document.getElementById('addObjectBtn').style.display = 'none';
        document.getElementById('addMoreBtn').style.display = 'block';
    } else {
        alert("Vänligen fyll i namnet på objektet.");
    }
}

function addAnotherObject() {
    lastMarker = null;
    centerMarkerContainer.style.display = 'block';
    confirmButton.style.display = 'block';
    clearFormData();
    document.getElementById('addObjectBtn').style.display = 'block';
    document.getElementById('addMoreBtn').style.display = 'none';
    document.getElementById('inputForm').style.display = 'none';
}

function addObjectToUI(index) {
    var objectData = addedObjects[index];
    var addedObjectsList = document.getElementById('addedObjectsList');

    if (addedObjectsList) {
        var listItem = document.createElement('div');
        listItem.className = 'object-tab';
        listItem.innerHTML = `
            <div class="object-header" onclick="toggleObjectDetails(this)">
                <strong>${objectData.category}</strong>: ${objectData.name}
            </div>
            <div class="object-details" style="display: none;">
                <p><strong>Namn:</strong> <input type="text" value="${objectData.name}" style="color: rgb(50, 94, 88);" onchange="updateObjectData(${index}, 'name', this.value)"></p>
                <p><strong>URL:</strong> <input type="text" value="${objectData.url}" style="color: rgb(50, 94, 88);" onchange="updateObjectData(${index}, 'url', this.value)"></p>
                <p><strong>Info:</strong> <textarea style="color: rgb(50, 94, 88);" onchange="updateObjectData(${index}, 'info', this.value)">${objectData.info}</textarea></p>
                <button type="button" onclick="deleteObject(${index}, this)">Ta bort objekt</button>
            </div>
        `;
        addedObjectsList.appendChild(listItem);
        addedObjectsList.style.display = 'block'; // Säkerställ att redigeringslistan alltid visas
    } else {
        console.error("Redigeringslistan hittades inte.");
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

function updateObjectData(index, field, value) {
    addedObjects[index][field] = value;
}

function deleteObject(index, buttonElement) {
    var objectTab = buttonElement.closest('.object-tab');
    objectTab.parentNode.removeChild(objectTab);

    var object = addedObjects[index];
    if (object.marker) {
        map.removeLayer(object.marker);
    }

    addedObjects.splice(index, 1);
    updateSubmitButton();
}

function updateSubmitButton() {
    var submitButton = document.getElementById('submitBtn');
    if (submitButton) {
        submitButton.disabled = addedObjects.length === 0;
    } else {
        console.error("Submit-knappen hittades inte.");
    }
}

document.getElementById('suggestionForm').onsubmit = function(event) {
    event.preventDefault();

    if (addedObjects.length === 0) {
        alert("För att skicka, lägg till ett objekt.");
        return;
    }

    if (confirm("Är du säker på att du vill skicka objekten?")) {
        var suggestionForm = document.getElementById('suggestionForm');

        addedObjects.forEach(function(object) {
            var formData = new FormData();
            formData.append('typ', object.category || 'Ingen typ angiven');
            formData.append('namn', object.name);
            formData.append('url', object.url);
            formData.append('info', object.info);
            formData.append('latitud', object.lat);
            formData.append('longitud', object.lng);

            fetch(suggestionForm.action, {
                method: "POST",
                body: formData,
            }).then(response => {
                return response.text();
            }).then(text => {
                console.log(text);
            }).catch(error => {
                console.error('Ett nätverksfel uppstod:', error);
            });
        });

        showThankYouMessage();
    }
};

function showThankYouMessage() {
    closeInputForm();
    document.getElementById('thankYouMessage').style.display = 'block';
}

function closeInputForm() {
    document.getElementById('inputForm').style.display = 'none';
}

function cancelAndRemove() {
    if (lastMarker) {
        map.removeLayer(lastMarker);
        lastMarker = null;
    }

    currentObject = null;
    clearFormData();

    closeInputForm();
    document.getElementById('startMessage').style.display = 'block';
    document.getElementById('cancelBtn').style.display = 'none';
}

function addNewSuggestion() {
    closeThankYouMessage();
    location.reload();
}

function closeThankYouMessage() {
    document.getElementById('thankYouMessage').style.display = 'none';
}

function goToJaktkartan() {
    window.location.href = 'https://www.jaktkartan.se';
}

function clearFormData() {
    document.getElementById('nameInput').value = '';
    document.getElementById('urlInput').value = '';
    document.getElementById('infoInput').value = '';
    document.getElementById('latitudeInput').value = '';
    document.getElementById('longitudeInput').value = '';
}

window.onload = function() {
    document.getElementById('startMessage').style.display = 'block';
    document.getElementById('addedObjectsList').style.display = 'block'; // Säkerställ att redigeringslistan alltid visas
    updateSubmitButton();
};
