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
var selectedIconSrc = ''; // För att lagra den valda ikonens källa
var addedObjects = []; // Array för att lagra alla objekt

function selectType(type, iconSrc) {
    clearFormData();
    closeAllObjectDetails();
    selectedIconSrc = iconSrc; // Spara den valda ikonens källa
    document.getElementById('categoryInput').value = type;
    document.getElementById('formTitle').innerText = 'Lägg till ' + type;
    
    var formIcon = document.getElementById('formIcon'); // Hämta formIcon-elementet
    if (formIcon) {
        formIcon.src = iconSrc; // Sätt ikonen i formulärets rubrik om elementet finns
    }

    document.getElementById('startMessage').style.display = 'none';
    document.getElementById('nameInput').placeholder = 'Namn på ' + type.toLowerCase();
    document.getElementById('urlInput').placeholder = type + ' hemsida/facebook';
    centerMarker.src = iconSrc;
    centerMarkerContainer.style.display = 'block';
    confirmButton.style.display = 'block';
    document.getElementById('cancelBtn').style.display = 'block';  // Visa "Avbryt"-knappen
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

    // Lägg till objektet i arrayen
    addedObjects.push({
        name: name,
        url: url,
        info: info,
        lat: currentLat,
        lng: currentLng,
        category: document.getElementById('categoryInput').value,
        icon: selectedIconSrc
    });

    var addedObjectsList = document.getElementById('addedObjectsList');
    var newObject = document.createElement('div');
    newObject.classList.add('object-tab');
    
    newObject.innerHTML = `
        <div class="object-header" onclick="toggleObjectDetails(this)">
            <span>${name}</span>
            <img src="${selectedIconSrc}" alt="${name}">
        </div>
        <div class="object-details">
            <p><strong>Namn:</strong> <input type="text" value="${name}" oninput="updateObjectData(${addedObjects.length - 1}, 'name', this.value)"></p>
            <p><strong>URL:</strong> <input type="text" value="${url}" oninput="updateObjectData(${addedObjects.length - 1}, 'url', this.value)"></p>
            <p><strong>Info:</strong> <textarea oninput="updateObjectData(${addedObjects.length - 1}, 'info', this.value)">${info}</textarea></p>
            <button onclick="removeObject(${addedObjects.length - 1}, this)">Ta bort</button>
        </div>
    `;

    addedObjectsList.appendChild(newObject);

    document.getElementById('inputContainer').style.display = 'none';
    document.getElementById('addObjectBtn').style.display = 'none';
    document.getElementById('addMoreBtn').style.display = 'block';
    document.getElementById('submitBtn').style.display = 'block';

    // Dölj "Avbryt"-knappen när objektet läggs till
    document.getElementById('cancelBtn').style.display = 'none';

    updateSubmitButton();
}

function updateObjectData(index, field, value) {
    addedObjects[index][field] = value;
}

function removeObject(index, button) {
    addedObjects.splice(index, 1); // Ta bort objekt från arrayen

    var objectTab = button.closest('.object-tab');
    objectTab.remove();
    updateSubmitButton();
}

function toggleObjectDetails(headerElement) {
    var details = headerElement.nextElementSibling;
    details.style.display = details.style.display === "none" || details.style.display === "" ? "block" : "none";
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
    // Ta bort senaste markör från kartan
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
    event.preventDefault();

    if (document.getElementById('submitBtn').disabled) {
        alert("Lägg till minst ett objekt innan du skickar.");
        return;
    }

    if (confirm("Är du säker på att du vill skicka objekten?")) {
        // Loopa genom alla objekt och skicka dem en i taget
        addedObjects.forEach(function(object) {
            var formData = new FormData();
            formData.append('typ', object.category);
            formData.append('namn', object.name);
            formData.append('url', object.url);
            formData.append('info', object.info);
            formData.append('latitud', object.lat);
            formData.append('longitud', object.lng);

            fetch(document.getElementById('suggestionForm').action, {
                method: "POST",
                body: formData,
            }).then(response => {
                if (response.ok) {
                    console.log("Objekt skickades: ", object.name);
                } else {
                    console.error("Fel vid skickning av objekt: ", object.name);
                }
            }).catch(error => {
                console.error("Nätverksfel vid skickning av objekt: ", object.name, error);
            });
        });

        showThankYouMessage();
    }
};

function showThankYouMessage() {
    document.getElementById('inputForm').style.display = 'none';
    document.getElementById('thankYouMessage').style.display = 'block';
}

function addNewSuggestion() {
    location.reload();  // Ladda om sidan för att börja om
}

function goToJaktkartan() {
    window.location.href = 'https://www.jaktkartan.se';
}

window.onload = function() {
    document.getElementById('startMessage').style.display = 'block';
    document.getElementById('addedObjectsList').style.display = 'block';
    updateSubmitButton();
};
